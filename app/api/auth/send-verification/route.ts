import { NextRequest, NextResponse } from "next/server";
import { readDB, User } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import { saveCode } from "@/lib/verificationStore";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });

  const users = readDB<User>("users.json");
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) return NextResponse.json({ error: "No account found with that email." }, { status: 404 });
  if (user.emailVerified) return NextResponse.json({ error: "Email is already verified." }, { status: 400 });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  saveCode(email, code);

  try {
    await sendVerificationEmail(email, user.firstName, code);
    return NextResponse.json({ success: true, message: "Verification code sent to your email." });
  } catch {
    return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 });
  }
}
