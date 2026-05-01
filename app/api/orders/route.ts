import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB, Order, Product } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { validateOrder, hasErrors } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const orders = readDB<Order>("orders.json");
  if (user.role === "admin") return NextResponse.json(orders);
  return NextResponse.json(orders.filter((o) => o.userId === user.id));
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await req.json();

  const errors = validateOrder(body);
  if (hasErrors(errors)) {
    return NextResponse.json({ error: Object.values(errors)[0], errors }, { status: 400 });
  }

  const orders = readDB<Order>("orders.json");
  const products = readDB<Product>("products.json");

  // Check stock availability
  for (const item of body.items) {
    const product = products.find((p) => p.id === item.productId);
    if (product && product.stock < item.qty) {
      return NextResponse.json({
        error: `Sorry, only ${product.stock} pcs of "${product.name}" are available.`,
      }, { status: 400 });
    }
  }

  // Deduct stock & auto-mark unavailable if 0
  const updatedProducts = products.map((p) => {
    const item = body.items.find((i: { productId: string; qty: number }) => i.productId === p.id);
    if (item) {
      const newStock = Math.max(0, p.stock - item.qty);
      return { ...p, stock: newStock, available: newStock > 0 };
    }
    return p;
  });
  writeDB("products.json", updatedProducts);

  const newOrder: Order = {
    id: Date.now().toString(),
    userId: user.id,
    customerName: body.customerName.trim(),
    phone: body.phone.trim(),
    address: body.address.trim(),
    payment: body.payment,
    notes: body.notes?.trim() || "",
    items: body.items,
    total: body.total,
    status: "Pending",
    paymentStatus: body.payment === "cod" ? "Pending" : "Paid",
    createdAt: new Date().toISOString(),
  };

  writeDB("orders.json", [...orders, newOrder]);
  return NextResponse.json(newOrder, { status: 201 });
}
