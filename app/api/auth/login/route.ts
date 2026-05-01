import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { readDB, User } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { validateLogin, hasErrors } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const errors = validateLogin(body);
  if (hasErrors(errors)) {
    return NextResponse.json({ error: Object.values(errors)[0], errors }, { status: 400 });
  }

  const { email, password } = body;
  const users = readDB<User>("users.json");
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role, firstName: user.firstName });
  const res = NextResponse.json({
    token,
    user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
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
