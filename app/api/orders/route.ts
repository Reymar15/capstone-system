import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";
import { validateOrder, hasErrors } from "@/lib/validation";

type OrderItemPayload = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image: string;
};

type OrderRequestBody = {
  customerName: string;
  phone: string;
  address: string;
  payment: string;
  notes?: string;
  total: number;
  items: OrderItemPayload[];
};

type OrderRow = {
  id: string;
  user_id?: string;
  customer_name?: string | null;
  customerName?: string | null;
  payment_status?: string | null;
  created_at?: string | null;
  createdAt?: string | null;
  order_items?: unknown[];
  [key: string]: unknown;
};

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

  const orderRows = (data || []) as OrderRow[];

  const orders = orderRows.map((o) => ({
    ...o,
    customerName: (o.customer_name || o.customerName || "").trim(),
    paymentStatus: o.payment_status || o.paymentStatus || "Pending",
    createdAt: o.created_at || o.createdAt || "",
    items: o.order_items || [],
  }));
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = (await req.json()) as OrderRequestBody;
  const errors = validateOrder(body);
  if (hasErrors(errors)) return NextResponse.json({ error: Object.values(errors)[0] }, { status: 400 });

  // Check stock
  for (const item of body.items) {
    const { data: product } = await supabase.from("products").select("stock, name").eq("id", item.productId).single();
    if (product && product.stock < item.qty) {
      return NextResponse.json({ error: `Only ${product.stock} pcs of "${product.name}" available.` }, { status: 400 });
    }
  }

  const orderId = Date.now().toString();

  // Insert order
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
  });

  if (orderError) return NextResponse.json({ error: "Failed to place order." }, { status: 500 });

  // Insert order items
  const orderItems = body.items.map((i) => ({
    order_id: orderId,
    product_id: i.productId,
    name: i.name,
    price: i.price,
    qty: i.qty,
    image: i.image,
  }));

  await supabase.from("order_items").insert(orderItems);

  // Deduct stock
  for (const item of body.items) {
    const { data: product } = await supabase.from("products").select("stock").eq("id", item.productId).single();
    if (product) {
      const newStock = Math.max(0, product.stock - item.qty);
      await supabase.from("products").update({ stock: newStock, available: newStock > 0 }).eq("id", item.productId);
    }
  }

  const { data: newOrder } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .single();

  const newOrderRow = newOrder as OrderRow | null;
  const result = {
    ...newOrderRow,
    customerName: (newOrderRow?.customer_name || newOrderRow?.customerName || "Customer").trim(),
    paymentStatus: newOrderRow?.payment_status || "Pending",
    createdAt: newOrderRow?.created_at || newOrderRow?.createdAt || (/^\d+$/.test(String(newOrderRow?.id)) ? new Date(Number(newOrderRow?.id)).toISOString() : ""),
    items: newOrderRow?.order_items || [],
  };
  return NextResponse.json(result, { status: 201 });
}
