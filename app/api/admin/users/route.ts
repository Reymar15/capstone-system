import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

function adminOnly(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function GET(req: NextRequest) {
  if (!adminOnly(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data, error } = await supabase
    .from("users")
    .select("id, first_name, last_name, email, role, phone, created_at, email_verified")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Failed to fetch users." }, { status: 500 });

  return NextResponse.json(
    (data || []).map((u) => ({
      id: u.id,
      firstName: u.first_name,
      lastName: u.last_name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      createdAt: u.created_at,
      emailVerified: u.email_verified,
    }))
  );
}

export async function PATCH(req: NextRequest) {
  if (!adminOnly(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id, role } = await req.json();
  if (!id || !role) return NextResponse.json({ error: "Missing fields." }, { status: 400 });

  const { error } = await supabase.from("users").update({ role }).eq("id", id);
  if (error) return NextResponse.json({ error: "Failed to update user." }, { status: 500 });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!adminOnly(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing user ID." }, { status: 400 });

  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Failed to delete user." }, { status: 500 });

  return NextResponse.json({ success: true });
}
