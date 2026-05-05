import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const url = new URL(req.url);
  const withUserId = url.searchParams.get("userId");

  let query = supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: true });

  if (user.role === "admin") {
    // Admin viewing a specific customer conversation
    if (withUserId) {
      query = query.or(
        `and(sender_id.eq.${withUserId},sender_role.eq.customer),and(sender_role.eq.admin,recipient_id.eq.${withUserId})`
      );
    }
    // Admin viewing all — return all messages
  } else {
    // Customer sees their own messages + admin replies to them
    query = query.or(
      `and(sender_id.eq.${user.id},sender_role.eq.customer),and(sender_role.eq.admin,recipient_id.eq.${user.id})`
    );
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Failed to fetch messages." }, { status: 500 });

  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { message, recipientId } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "Message is required." }, { status: 400 });

  // Admin must provide recipientId when replying
  if (user.role === "admin" && !recipientId) {
    return NextResponse.json({ error: "Recipient is required." }, { status: 400 });
  }

  const { data, error } = await supabase.from("messages").insert({
    sender_id: user.id,
    sender_name: user.firstName,
    sender_role: user.role,
    message: message.trim(),
    recipient_id: user.role === "admin" ? recipientId : null,
  }).select().single();

  if (error) return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
