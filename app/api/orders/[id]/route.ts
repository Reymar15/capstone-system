import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB, Order } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const orders = readDB<Order>("orders.json");
  const order = orders.find((o) => o.id === params.id);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (user.role !== "admin" && order.userId !== user.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json(order);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.json();
  const orders = readDB<Order>("orders.json");
  const updated = orders.map((o) => (o.id === params.id ? { ...o, ...body } : o));
  writeDB("orders.json", updated);
  return NextResponse.json(updated.find((o) => o.id === params.id));
}
