import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email?.trim()) return NextResponse.json({ error: "Email is required." }, { status: 400 });

  const { data: users } = await supabase.from("users").select("security_question").ilike("email", email).limit(1);
  const user = users?.[0];

  if (!user || !user.security_question) {
    return NextResponse.json({ error: "No account found with that email, or account has no security question set." }, { status: 404 });
  }

  return NextResponse.json({ securityQuestion: user.security_question });
}
