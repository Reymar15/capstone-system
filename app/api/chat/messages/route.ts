import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const caller = token ? verifyToken(token) : null;
  if (!caller) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const all = searchParams.get("all");

  // Admin: fetch ALL messages to build conversation list
  if (caller.role === "admin" && all === "1") {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) return NextResponse.json([], { status: 200 });
    return NextResponse.json(data || []);
  }

  // Admin: fetch thread for a specific user
  if (caller.role === "admin" && userId) {
    const { data: sent } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("sender_id", userId)
      .eq("receiver_id", "admin");

    const { data: received } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("sender_id", "admin")
      .eq("receiver_id", userId);

    const all = [...(sent || []), ...(received || [])].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    return NextResponse.json(all);
  }

  // User: fetch their own thread with admin
  const { data: sent } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("sender_id", caller.id)
    .eq("receiver_id", "admin");

  const { data: received } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("sender_id", "admin")
    .eq("receiver_id", caller.id);

  // Mark admin replies as read
  await supabase
    .from("chat_messages")
    .update({ is_read: true })
    .eq("sender_id", "admin")
    .eq("receiver_id", caller.id)
    .eq("is_read", false);

  const thread = [...(sent || []), ...(received || [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  return NextResponse.json(thread);
}

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

export async function PATCH(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const caller = token ? verifyToken(token) : null;
  if (!caller) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { userId } = await req.json();
  const uid = userId || caller.id;

  await supabase
    .from("chat_messages")
    .update({ is_read: true })
    .eq("sender_id", uid)
    .eq("receiver_id", "admin")
    .eq("is_read", false);

  return NextResponse.json({ success: true });
}
