import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { readDB, writeDB, User } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { email, securityAnswer, newPassword, confirmPassword } = await req.json();

  if (!email || !securityAnswer || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
  }

  const users = readDB<User>("users.json");
  const userIndex = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());

  if (userIndex === -1) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  const user = users[userIndex];

  // Compare answer (case-insensitive, trimmed)
  const answerMatch = user.securityAnswer?.toLowerCase().trim() === securityAnswer.toLowerCase().trim();
  if (!answerMatch) {
    return NextResponse.json({ error: "Incorrect security answer." }, { status: 401 });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  users[userIndex] = { ...user, password: hashed };
  writeDB("users.json", users);

  return NextResponse.json({ success: true, message: "Password reset successfully." });
}
