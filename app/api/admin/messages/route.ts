import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Failed to fetch messages." }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, message } = body;
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }

  const { error } = await supabase.from("messages").insert({
    id: Date.now().toString(),
    name: name.trim(),
    email: email.trim(),
    phone: phone?.trim() || "",
    message: message.trim(),
    is_read: false,
  });

  if (error) return NextResponse.json({ error: "Failed to save message." }, { status: 500 });
  return NextResponse.json({ success: true }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await req.json();
  await supabase.from("messages").update({ is_read: true }).eq("id", id);
  return NextResponse.json({ success: true });
}
