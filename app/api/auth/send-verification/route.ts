import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendVerificationEmail } from "@/lib/email";
import { saveCode } from "@/lib/verificationStore";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email?.trim()) return NextResponse.json({ error: "Email is required." }, { status: 400 });

  const { data: users } = await supabase
    .from("users")
    .select("id, first_name, email_verified")
    .ilike("email", email.trim())
    .limit(1);

  const user = users?.[0];
  if (!user) return NextResponse.json({ error: "No account found with that email." }, { status: 404 });
  if (user.email_verified) return NextResponse.json({ error: "Email is already verified." }, { status: 400 });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  await saveCode(email.toLowerCase(), code);

  try {
    await sendVerificationEmail(email, user.first_name, code);
    return NextResponse.json({ success: true, message: "Verification code sent to your email." });
  } catch {
    return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 });
  }
}
