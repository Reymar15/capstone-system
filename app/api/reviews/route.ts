import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productName = searchParams.get("productName");
  const userId = searchParams.get("userId");
  const orderId = searchParams.get("orderId");

  let query = supabase
    .from("reviews")
    .select("id, order_id, user_id, product_name, rating, comment, created_at")
    .order("created_at", { ascending: false });

  if (productName) query = query.ilike("product_name", `%${productName}%`);
  if (userId) query = query.eq("user_id", userId);
  if (orderId) query = query.eq("order_id", orderId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Failed to fetch reviews." }, { status: 500 });

  const reviews = data || [];

  // Fetch user names separately — avoids join/RLS issues on Vercel
  const userIds = [...new Set(reviews.map((r) => r.user_id).filter(Boolean))];
  const { data: users } = userIds.length
    ? await supabase.from("users").select("id, first_name, last_name").in("id", userIds)
    : { data: [] };

  const nameMap: Record<string, string> = {};
  for (const u of users || []) {
    nameMap[u.id] = `${u.first_name || ""} ${u.last_name || ""}`.trim();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapped = reviews.map((r: any) => ({
    id: r.id,
    orderId: r.order_id,
    userId: r.user_id,
    productName: r.product_name || "—",
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
    userName: nameMap[r.user_id] || "Anonymous",
  }));

  return NextResponse.json(mapped);
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { orderId, rating, comment } = await req.json();
  if (!orderId) return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
  if (!rating || rating < 1 || rating > 5)
    return NextResponse.json({ error: "Rating must be 1–5." }, { status: 400 });
  if (!comment?.trim())
    return NextResponse.json({ error: "Please write a review." }, { status: 400 });

  // Verify order belongs to user and is Completed
  const { data: order } = await supabase
    .from("orders")
    .select("id, status, user_id, customer_name")
    .eq("id", orderId)
    .single();

  if (!order || order.user_id !== user.id)
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.status !== "Completed")
    return NextResponse.json({ error: "You can only review completed orders." }, { status: 400 });

  // Check not already reviewed
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();
  if (existing)
    return NextResponse.json({ error: "You already reviewed this order." }, { status: 409 });

  // Fetch order items separately — avoids join issues on Vercel
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("name")
    .eq("order_id", orderId);

  const productName = (orderItems || []).map((i) => i.name).join(", ") || "Puto Bumbong";

  const { data: inserted, error } = await supabase
    .from("reviews")
    .insert({
      id: Date.now().toString(),
      order_id: orderId,
      user_id: user.id,
      product_name: productName,
      rating,
      comment: comment.trim(),
    })
    .select("id, order_id, user_id, product_name, rating, comment, created_at")
    .single();

  if (error) return NextResponse.json({ error: "Failed to submit review." }, { status: 500 });
  return NextResponse.json(inserted, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Review ID is required." }, { status: 400 });

  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Failed to delete review." }, { status: 500 });
  return NextResponse.json({ success: true });
}
