import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

// GET  /api/chat/messages?userId=xxx   (admin fetches a user's thread)
// GET  /api/chat/messages?all=1         (admin fetches all messages for conv list)
// GET  /api/chat/messages              (user fetches their own thread)
export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const caller = token ? verifyToken(token) : null;
  if (!caller) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const all = searchParams.get("all");

  if (caller.role === "admin" && all === "1") {
    // Return all chat messages so admin can build conversation list
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) return NextResponse.json({ error: "Failed to fetch messages." }, { status: 500 });
    return NextResponse.json(data || []);
  }

  let query = supabase
    .from("chat_messages")
    .select("*")
    .order("created_at", { ascending: true });

  if (caller.role === "admin") {
    const uid = userId || caller.id;
    query = query.or(
      `and(sender_id.eq.${uid},receiver_id.eq.admin),and(sender_id.eq.admin,receiver_id.eq.${uid})`
    );
  } else {
    query = query.or(
      `and(sender_id.eq.${caller.id},receiver_id.eq.admin),and(sender_id.eq.admin,receiver_id.eq.${caller.id})`
    );
    // Mark admin messages to this user as read
    await supabase
      .from("chat_messages")
      .update({ is_read: true })
      .eq("sender_id", "admin")
      .eq("receiver_id", caller.id)
      .eq("is_read", false);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Failed to fetch messages." }, { status: 500 });
  return NextResponse.json(data || []);
}

// POST /api/chat/messages
export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const caller = token ? verifyToken(token) : null;
  if (!caller) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { message, receiverId } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "Message is required." }, { status: 400 });

  const isAdmin = caller.role === "admin";
  const senderId = isAdmin ? "admin" : caller.id;
  const receiver = isAdmin ? (receiverId || "") : "admin";

  if (!receiver) return NextResponse.json({ error: "Receiver is required." }, { status: 400 });

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      sender_id: senderId,
      sender_role: caller.role,
      receiver_id: receiver,
      message: message.trim(),
      is_read: false,
      created_at: now,
      replied_at: isAdmin ? now : null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PATCH /api/chat/messages  — mark all messages from admin to user as read
export async function PATCH(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const caller = token ? verifyToken(token) : null;
  if (!caller) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { userId } = await req.json();
  const uid = userId || caller.id;

  await supabase
    .from("chat_messages")
    .update({ is_read: true })
    .eq("receiver_id", uid)
    .eq("is_read", false);

  return NextResponse.json({ success: true });
}
