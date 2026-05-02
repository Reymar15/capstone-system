import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

export function readDB<T>(filename: string): T[] {
  const filePath = path.join(dataDir, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

export function writeDB<T>(filename: string, data: T[]): void {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "admin" | "customer";
  phone: string;
  address?: string;
  securityQuestion: string;
  securityAnswer: string;
  emailVerified: boolean;
  createdAt: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  available: boolean;
};

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image: string;
};

export type Order = {
  id: string;
  userId: string;
  customerName: string;
  phone: string;
  address: string;
  payment: string;
  notes: string;
  items: OrderItem[];
  total: number;
  status: "Pending" | "Preparing" | "Ready" | "Completed" | "Cancelled";
  paymentStatus: "Pending" | "Paid";
  createdAt: string;
};
