import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";
import { validateProduct, hasErrors } from "@/lib/validation";

export async function GET() {
  const { data, error } = await supabase.from("products").select("*").order("created_at");
  if (error) return NextResponse.json({ error: "Failed to fetch products." }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await req.json();
  const errors = validateProduct(body);
  if (hasErrors(errors)) return NextResponse.json({ error: Object.values(errors)[0] }, { status: 400 });

  const { data: existing } = await supabase.from("products").select("id").ilike("name", body.name).limit(1);
  if (existing && existing.length > 0) return NextResponse.json({ error: "Product name already exists." }, { status: 409 });

  const newProduct = {
    id: Date.now().toString(),
    name: body.name.trim(),
    description: body.description.trim(),
    price: Number(body.price),
    category: body.category,
    image: body.image || "/menu-images/classic-puto-bumbong.jpg",
    stock: Number(body.stock),
    available: Number(body.stock) > 0,
  };

  const { data, error } = await supabase.from("products").insert(newProduct).select().single();
  if (error) return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
