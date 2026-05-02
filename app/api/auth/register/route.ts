import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { readDB, writeDB, User } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { validateRegister, hasErrors } from "@/lib/validation";
import { sendVerificationEmail } from "@/lib/email";
import { saveCode } from "@/lib/verificationStore";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const errors = validateRegister(body);

  if (hasErrors(errors)) {
    return NextResponse.json({ error: Object.values(errors)[0], errors }, { status: 400 });
  }

  const { firstName, lastName, email, password, phone } = body;
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
    securityQuestion: "",
    securityAnswer: "",
    emailVerified: false,
    createdAt: new Date().toISOString(),
  };

  writeDB("users.json", [...users, newUser]);

  // Send verification email
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  saveCode(newUser.email, code);

  try {
    await sendVerificationEmail(newUser.email, newUser.firstName, code);
  } catch {
    // Don't block registration if email fails
  }

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
