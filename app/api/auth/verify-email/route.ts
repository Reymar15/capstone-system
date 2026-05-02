import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB, User } from "@/lib/db";
import { getCode, deleteCode } from "@/lib/verificationStore";

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();

  if (!email || !code) {
    return NextResponse.json({ error: "Email and code are required." }, { status: 400 });
  }

  const stored = getCode(email);

  if (!stored) {
    return NextResponse.json({ error: "No verification code found. Please request a new one." }, { status: 400 });
  }

  if (Date.now() > stored.expires) {
    deleteCode(email);
    return NextResponse.json({ error: "Code has expired. Please request a new one." }, { status: 400 });
  }

  if (stored.code !== code.trim()) {
    return NextResponse.json({ error: "Incorrect verification code." }, { status: 400 });
  }

  const users = readDB<User>("users.json");
  const updated = users.map((u) =>
    u.email.toLowerCase() === email.toLowerCase() ? { ...u, emailVerified: true } : u
  );
  writeDB("users.json", updated);
  deleteCode(email);

  return NextResponse.json({ success: true, message: "Email verified successfully!" });
}
