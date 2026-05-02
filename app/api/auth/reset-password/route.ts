import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { email, securityAnswer, newPassword, confirmPassword } = await req.json();

  if (!email || !securityAnswer || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  if (newPassword.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  if (newPassword !== confirmPassword) return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });

  const { data: users } = await supabase.from("users").select("id, security_answer").ilike("email", email).limit(1);
  const user = users?.[0];
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  if (user.security_answer?.toLowerCase().trim() !== securityAnswer.toLowerCase().trim()) {
    return NextResponse.json({ error: "Incorrect security answer." }, { status: 401 });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await supabase.from("users").update({ password: hashed }).eq("id", user.id);

  return NextResponse.json({ success: true });
}
