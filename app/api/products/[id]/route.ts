import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await req.json();
  const { data, error } = await supabase
    .from("products")
    .update({ ...body, price: Number(body.price), stock: Number(body.stock) })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Failed to update product." }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Failed to delete product." }, { status: 500 });
  return NextResponse.json({ success: true });
}
