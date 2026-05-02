import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";
import { sendOrderStatusEmail } from "@/lib/email";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: order } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).single();
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (user.role !== "admin" && order.user_id !== user.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  return NextResponse.json({
    ...order,
    customerName: order.customer_name,
    paymentStatus: order.payment_status,
    createdAt: order.created_at,
    items: order.order_items || [],
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await req.json();

  const { data: oldOrder } = await supabase.from("orders").select("*").eq("id", id).single();
  if (!oldOrder) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const updateData: Record<string, string> = {};
  if (body.status) updateData.status = body.status;
  if (body.paymentStatus) updateData.payment_status = body.paymentStatus;

  const { data: updated } = await supabase.from("orders").update(updateData).eq("id", id).select("*, order_items(*)").single();

  // Send email if status changed
  const notifyStatuses = ["Preparing", "Ready", "Completed", "Cancelled"];
  if (body.status && body.status !== oldOrder.status && notifyStatuses.includes(body.status)) {
    try {
      const { data: customer } = await supabase.from("users").select("email, first_name").eq("id", oldOrder.user_id).single();
      if (customer?.email) {
        await sendOrderStatusEmail(customer.email, customer.first_name, id, body.status, oldOrder.total);
      }
    } catch {}
  }

  return NextResponse.json({
    ...updated,
    customerName: updated?.customer_name,
    paymentStatus: updated?.payment_status,
    createdAt: updated?.created_at,
    items: updated?.order_items || [],
  });
}
