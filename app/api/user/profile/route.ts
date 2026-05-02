import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: user } = await supabase.from("users").select("id, first_name, last_name, email, role, phone, address, email_verified, created_at").eq("id", payload.id).single();
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  return NextResponse.json({
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
    emailVerified: user.email_verified,
    createdAt: user.created_at,
  });
}

export async function PUT(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { firstName, lastName, phone, address } = await req.json();
  if (!firstName?.trim()) return NextResponse.json({ error: "First name is required." }, { status: 400 });
  if (!lastName?.trim()) return NextResponse.json({ error: "Last name is required." }, { status: 400 });

  const { data: user } = await supabase
    .from("users")
    .update({ first_name: firstName.trim(), last_name: lastName.trim(), phone: phone?.trim() || "", address: address?.trim() || "" })
    .eq("id", payload.id)
    .select("id, first_name, last_name, email, role, phone, address, created_at")
    .single();

  return NextResponse.json({
    id: user?.id, firstName: user?.first_name, lastName: user?.last_name,
    email: user?.email, role: user?.role, phone: user?.phone,
    address: user?.address, createdAt: user?.created_at,
  });
}
