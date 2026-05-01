import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { readDB, writeDB, User } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { validateRegister, hasErrors } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const errors = validateRegister(body);

  if (!body.securityQuestion) errors.securityQuestion = "Please select a security question.";
  if (!body.securityAnswer?.trim()) errors.securityAnswer = "Security answer is required.";

  if (hasErrors(errors)) {
    return NextResponse.json({ error: Object.values(errors)[0], errors }, { status: 400 });
  }

  const { firstName, lastName, email, password, phone, securityQuestion, securityAnswer } = body;
  const users = readDB<User>("users.json");

  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return NextResponse.json({ error: "Email already registered.", errors: { email: "Email already registered." } }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const newUser: User = {
    id: Date.now().toString(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.toLowerCase().trim(),
    password: hashed,
    role: "customer",
    phone: phone?.trim() || "",
    securityQuestion,
    securityAnswer: securityAnswer.trim().toLowerCase(),
    createdAt: new Date().toISOString(),
  };

  writeDB("users.json", [...users, newUser]);

  const token = signToken({ id: newUser.id, email: newUser.email, role: "customer", firstName: newUser.firstName });
  const res = NextResponse.json({
    token,
    user: { id: newUser.id, firstName: newUser.firstName, lastName: newUser.lastName, email: newUser.email, role: "customer" },
  });
  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
