import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB, Order, User } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { sendOrderStatusEmail } from "@/lib/email";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const orders = readDB<Order>("orders.json");
  const order = orders.find((o) => o.id === id);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (user.role !== "admin" && order.userId !== user.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json(order);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.json();
  const orders = readDB<Order>("orders.json");
  const order = orders.find((o) => o.id === id);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const updated = orders.map((o) => (o.id === id ? { ...o, ...body } : o));
  writeDB("orders.json", updated);

  const updatedOrder = updated.find((o) => o.id === id)!;

  // Send email if status changed to Preparing, Ready, Completed, or Cancelled
  const statusChanged = body.status && body.status !== order.status;
  const notifyStatuses = ["Preparing", "Ready", "Completed", "Cancelled"];

  if (statusChanged && notifyStatuses.includes(body.status)) {
    try {
      const users = readDB<User>("users.json");
      const customer = users.find((u) => u.id === order.userId);
      if (customer?.email) {
        await sendOrderStatusEmail(
          customer.email,
          customer.firstName,
          order.id,
          body.status,
          order.total
        );
      }
    } catch {
      // Don't block the response if email fails
    }
  }

  return NextResponse.json(updatedOrder);
}
