import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCode, deleteCode } from "@/lib/verificationStore";

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();
  if (!email || !code) return NextResponse.json({ error: "Email and code are required." }, { status: 400 });

  const stored = await getCode(email);
  if (!stored) return NextResponse.json({ error: "No verification code found. Please request a new one." }, { status: 400 });
  if (Date.now() > stored.expires) {
    await deleteCode(email);
    return NextResponse.json({ error: "Code has expired. Please request a new one." }, { status: 400 });
  }
  if (stored.code !== code.trim()) return NextResponse.json({ error: "Incorrect verification code." }, { status: 400 });

  await supabase.from("users").update({ email_verified: true }).ilike("email", email);
  await deleteCode(email);

  return NextResponse.json({ success: true });
}
