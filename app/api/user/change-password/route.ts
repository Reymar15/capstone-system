import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { readDB, writeDB, User } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { currentPassword, newPassword, confirmPassword } = await req.json();

  if (!currentPassword) return NextResponse.json({ error: "Current password is required." }, { status: 400 });
  if (!newPassword) return NextResponse.json({ error: "New password is required." }, { status: 400 });
  if (newPassword.length < 8) return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  if (newPassword !== confirmPassword) return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });

  const users = readDB<User>("users.json");
  const userIndex = users.findIndex((u) => u.id === payload.id);
  if (userIndex === -1) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const valid = await bcrypt.compare(currentPassword, users[userIndex].password);
  if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });

  const hashed = await bcrypt.hash(newPassword, 10);
  users[userIndex] = { ...users[userIndex], password: hashed };
  writeDB("users.json", users);

  return NextResponse.json({ success: true, message: "Password changed successfully." });
}
