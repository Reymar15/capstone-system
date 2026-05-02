import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB, User } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const users = readDB<User>("users.json");
  const user = users.find((u) => u.id === payload.id);
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const { password, securityAnswer, ...safe } = user;
  return NextResponse.json(safe);
}

export async function PUT(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await req.json();
  const { firstName, lastName, phone, address } = body;

  if (!firstName?.trim()) return NextResponse.json({ error: "First name is required." }, { status: 400 });
  if (!lastName?.trim()) return NextResponse.json({ error: "Last name is required." }, { status: 400 });

  const users = readDB<User>("users.json");
  const updated = users.map((u) =>
    u.id === payload.id
      ? { ...u, firstName: firstName.trim(), lastName: lastName.trim(), phone: phone?.trim() || u.phone, address: address?.trim() || "" }
      : u
  );
  writeDB("users.json", updated);

  const updatedUser = updated.find((u) => u.id === payload.id)!;
  const { password, securityAnswer, ...safe } = updatedUser;
  return NextResponse.json(safe);
}
