import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";
import { sendOrderStatusEmail } from "@/lib/email";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();

  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (user.role !== "admin" && order.user_id !== user.id)
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  return NextResponse.json({ ...order, items: order.order_items || [] });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await req.json();

  // Fetch current order
  const { data: oldOrder } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();

  if (!oldOrder) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const updateData: Record<string, unknown> = {};
  if (body.status) updateData.status = body.status;
  if (body.paymentStatus) updateData.payment_status = body.paymentStatus;

  // ── STOCK DEDUCTION ON COMPLETED ──────────────────────────
  if (
    body.status === "Completed" &&
    oldOrder.status !== "Completed" &&
    !oldOrder.stock_deducted
  ) {
    const items = oldOrder.order_items || [];
    const errors: string[] = [];

    for (const item of items) {
      // Find product by name (since productId stored as name)
      const { data: products } = await supabase
        .from("products")
        .select("id, name, stock, available")
        .ilike("name", item.name)
        .limit(1);

      const product = products?.[0];
      if (!product) continue;

      const newStock = Math.max(0, product.stock - item.qty);
      const isAvailable = newStock > 0;

      const { error: updateErr } = await supabase
        .from("products")
        .update({ stock: newStock, available: isAvailable })
        .eq("id", product.id);

      if (updateErr) {
        console.error(`Stock deduct error for ${item.name}:`, updateErr);
        errors.push(item.name);
      }
    }

    // Mark order as stock_deducted to prevent double deduction
    updateData.stock_deducted = true;

    if (errors.length > 0) {
      console.error("Some stock deductions failed:", errors);
    }
  }

  // ── UPDATE ORDER ───────────────────────────────────────────
  const { data: updated } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", id)
    .select("*, order_items(*)")
    .single();

  // ── SEND EMAIL NOTIFICATION ────────────────────────────────
  const notifyStatuses = ["Preparing", "Ready", "Completed", "Cancelled"];
  if (body.status && body.status !== oldOrder.status && notifyStatuses.includes(body.status)) {
    try {
      const { data: customer } = await supabase
        .from("users")
        .select("email, first_name")
        .eq("id", oldOrder.user_id)
        .single();

      if (customer?.email) {
        await sendOrderStatusEmail(
          customer.email,
          customer.first_name,
          id,
          body.status,
          oldOrder.total
        );
      }
    } catch (err) {
      console.error("Email notification error:", err);
    }
  }

  return NextResponse.json({ ...updated, items: updated?.order_items || [] });
}
