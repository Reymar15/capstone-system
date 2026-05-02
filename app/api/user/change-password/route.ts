import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { currentPassword, newPassword, confirmPassword } = await req.json();
  if (!currentPassword) return NextResponse.json({ error: "Current password is required." }, { status: 400 });
  if (!newPassword || newPassword.length < 8) return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  if (newPassword !== confirmPassword) return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });

  const { data: user } = await supabase.from("users").select("password").eq("id", payload.id).single();
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });

  const hashed = await bcrypt.hash(newPassword, 10);
  await supabase.from("users").update({ password: hashed }).eq("id", payload.id);

  return NextResponse.json({ success: true });
}
