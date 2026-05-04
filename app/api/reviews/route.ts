import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, user_id, order_id, users(first_name, last_name)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Failed to fetch reviews." }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { orderId, rating, comment } = await req.json();
  if (!orderId) return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
  if (!rating || rating < 1 || rating > 5) return NextResponse.json({ error: "Rating must be 1–5." }, { status: 400 });
  if (!comment?.trim()) return NextResponse.json({ error: "Review comment is required." }, { status: 400 });

  // Verify order belongs to user and is Completed
  const { data: order } = await supabase.from("orders").select("id, status, user_id").eq("id", orderId).single();
  if (!order || order.user_id !== user.id) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.status !== "Completed") return NextResponse.json({ error: "You can only review completed orders." }, { status: 400 });

  // Check not already reviewed
  const { data: existing } = await supabase.from("reviews").select("id").eq("order_id", orderId).single();
  if (existing) return NextResponse.json({ error: "You already reviewed this order." }, { status: 409 });

  const { error } = await supabase.from("reviews").insert({
    id: Date.now().toString(),
    order_id: orderId,
    user_id: user.id,
    rating,
    comment: comment.trim(),
  });

  if (error) return NextResponse.json({ error: "Failed to submit review." }, { status: 500 });
  return NextResponse.json({ success: true }, { status: 201 });
}
