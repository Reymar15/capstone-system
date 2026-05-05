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

  // Admin can filter by specific user conversation
  if (user.role === "admin" && withUserId) {
    query = query.eq("sender_id", withUserId);
  } else if (user.role === "customer") {
    // Customer sees their own messages + admin replies
    query = query.or(`sender_id.eq.${user.id},sender_role.eq.admin`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Failed to fetch messages." }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { message } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "Message is required." }, { status: 400 });

  const { data, error } = await supabase.from("messages").insert({
    sender_id: user.id,
    sender_name: user.firstName,
    sender_role: user.role,
    message: message.trim(),
  }).select().single();

  if (error) return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
