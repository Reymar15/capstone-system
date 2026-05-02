import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { signToken } from "@/lib/auth";
import { validateLogin, hasErrors } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const errors = validateLogin(body);
  if (hasErrors(errors)) {
    return NextResponse.json({ error: Object.values(errors)[0] }, { status: 400 });
  }

  const { email, password } = body;

  const { data: users } = await supabase
    .from("users")
    .select("*")
    .ilike("email", email)
    .limit(1);

  const user = users?.[0];
  if (!user) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

  const token = signToken({ id: user.id, email: user.email, role: user.role, firstName: user.first_name });
  const res = NextResponse.json({
    token,
    user: { id: user.id, firstName: user.first_name, lastName: user.last_name, email: user.email, role: user.role },
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
