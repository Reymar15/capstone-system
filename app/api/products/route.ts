import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB, Product } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { validateProduct, hasErrors } from "@/lib/validation";

export async function GET() {
  const products = readDB<Product>("products.json");
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.json();
  const errors = validateProduct(body);
  if (hasErrors(errors)) {
    return NextResponse.json({ error: Object.values(errors)[0], errors }, { status: 400 });
  }

  const products = readDB<Product>("products.json");

  // Check duplicate name
  if (products.find((p) => p.name.toLowerCase() === body.name.toLowerCase())) {
    return NextResponse.json({ error: "A product with this name already exists.", errors: { name: "Name already exists." } }, { status: 409 });
  }

  const newProduct: Product = {
    id: Date.now().toString(),
    name: body.name.trim(),
    description: body.description.trim(),
    price: Number(body.price),
    category: body.category,
    image: body.image || "/classic.jpg",
    stock: Number(body.stock),
    available: Number(body.stock) > 0,
  };

  writeDB("products.json", [...products, newProduct]);
  return NextResponse.json(newProduct, { status: 201 });
}
