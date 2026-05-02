import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { signToken } from "@/lib/auth";
import { validateRegister, hasErrors } from "@/lib/validation";
import { sendVerificationEmail } from "@/lib/email";
import { saveCode } from "@/lib/verificationStore";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const errors = validateRegister(body);
  if (hasErrors(errors)) {
    return NextResponse.json({ error: Object.values(errors)[0] }, { status: 400 });
  }

  const { firstName, lastName, email, password, phone } = body;

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .ilike("email", email)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: "Email already registered." }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const id = Date.now().toString();

  const { error } = await supabase.from("users").insert({
    id,
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    email: email.toLowerCase().trim(),
    password: hashed,
    role: "customer",
    phone: phone?.trim() || "",
    security_question: "",
    security_answer: "",
    email_verified: false,
  });

  if (error) return NextResponse.json({ error: "Registration failed." }, { status: 500 });

  // Send verification email
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  await saveCode(email.toLowerCase(), code);
  try { await sendVerificationEmail(email, firstName, code); } catch {}

  const token = signToken({ id, email: email.toLowerCase(), role: "customer", firstName });
  const res = NextResponse.json({
    token,
    user: { id, firstName, lastName, email: email.toLowerCase(), role: "customer" },
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
