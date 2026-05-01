import { NextRequest, NextResponse } from "next/server";
import { readDB, User } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email?.trim()) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const users = readDB<User>("users.json");
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  // Always return same message to prevent email enumeration
  if (!user || !user.securityQuestion) {
    return NextResponse.json({
      error: "No account found with that email, or account has no security question set.",
    }, { status: 404 });
  }

  return NextResponse.json({ securityQuestion: user.securityQuestion });
}
