import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB, Product } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.json();
  const products = readDB<Product>("products.json");
  const updated = products.map((p) =>
    p.id === params.id ? { ...p, ...body, price: Number(body.price), stock: Number(body.stock) } : p
  );
  writeDB("products.json", updated);
  return NextResponse.json(updated.find((p) => p.id === params.id));
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const products = readDB<Product>("products.json");
  writeDB("products.json", products.filter((p) => p.id !== params.id));
  return NextResponse.json({ success: true });
}
