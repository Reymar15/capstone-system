import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";
import { validateOrder, hasErrors } from "@/lib/validation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOrder(o: any) {
  return {
    ...o,
    customerName: o.customer_name || "",
    paymentStatus: o.payment_status || "Pending",
    createdAt: o.created_at || "",
    items: o.order_items || [],
  };
}

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let query = supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (user.role !== "admin") query = query.eq("user_id", user.id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });

  return NextResponse.json((data || []).map(mapOrder));
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await req.json();
  const errors = validateOrder(body);
  if (hasErrors(errors)) return NextResponse.json({ error: Object.values(errors)[0] }, { status: 400 });

  // ── CHECK STOCK AVAILABILITY (but do NOT deduct yet) ───────
  for (const item of body.items) {
    const { data: products } = await supabase
      .from("products")
      .select("stock, name, available")
      .ilike("name", item.name)
      .limit(1);

    const product = products?.[0];
    if (product) {
      if (!product.available) {
        return NextResponse.json({ error: `"${item.name}" is currently unavailable.` }, { status: 400 });
      }
      if (product.stock < item.qty) {
        return NextResponse.json({ error: `Only ${product.stock} pcs of "${item.name}" available.` }, { status: 400 });
      }
    }
  }

  const orderId = Date.now().toString();

  // ── INSERT ORDER (stock_deducted = false by default) ───────
  const { error: orderError } = await supabase.from("orders").insert({
    id: orderId,
    user_id: user.id,
    customer_name: body.customerName.trim(),
    phone: body.phone.trim(),
    address: body.address.trim(),
    payment: body.payment,
    notes: body.notes?.trim() || "",
    total: body.total,
    status: "Pending",
    payment_status: body.payment === "cod" ? "Pending" : "Paid",
    stock_deducted: false,
  });

  if (orderError) {
    console.error("Order insert error:", orderError);
    return NextResponse.json({ error: "Failed to place order." }, { status: 500 });
  }

  // ── INSERT ORDER ITEMS ─────────────────────────────────────
  const orderItems = body.items.map((i: { productId: string; name: string; price: number; qty: number; image: string }) => ({
    order_id: orderId,
    product_id: i.productId,
    name: i.name,
    price: i.price,
    qty: i.qty,
    image: i.image,
  }));

  await supabase.from("order_items").insert(orderItems);

  const { data: newOrder } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .single();

  return NextResponse.json(mapOrder(newOrder), { status: 201 });
}
