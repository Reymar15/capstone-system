"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../../context/AuthContext";
import AdminLayout from "../AdminLayout";
import { useToast } from "../../context/ToastContext";
import styles from "../admin.module.css";

type Product = {
  id: string; name: string; description: string;
  price: number; category: string; image: string;
  stock: number; available: boolean;
};

const empty = { name: "", description: "", price: "", category: "Classic", image: "/classic.jpg", stock: "", available: true };

export default function AdminProducts() {
  const { user, token } = useAuth();
  const { success, error: toastError } = useToast();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") { router.push("/"); return; }
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [user, router]);

  const set = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  const openAdd = () => { setEditing(null); setForm(empty); setShowModal(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description, price: String(p.price), category: p.category, image: p.image, stock: String(p.stock), available: p.available });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = editing ? `/api/products/${editing.id}` : "/api/products";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, price: Number(form.price), stock: Number(form.stock) }),
    });
    const data = await res.json();
    setSaving(false);
    if (editing) {
      setProducts((prev) => prev.map((p) => (p.id === editing.id ? data : p)));
      success("Product updated successfully!");
    } else {
      setProducts((prev) => [...prev, data]);
      success("Product added successfully!");
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setConfirmDelete(null);
    success("Product deleted.");
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <AdminLayout>
      <div className={styles.pageHeader}>
        <div>
          <h1>Products</h1>
          <p>Manage your puto bumbong menu items</p>
        </div>
        <button className={styles.primaryBtn} onClick={openAdd}>+ Add Product</button>
      </div>

      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Image</th><th>Name</th><th>Category</th>
                <th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ position: "relative", width: 52, height: 52, borderRadius: 10, overflow: "hidden" }}>
                      <Image src={p.image} alt={p.name} fill style={{ objectFit: "cover" }} />
                    </div>
                  </td>
                  <td>
                    <strong>{p.name}</strong>
                    <br />
                    <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>{p.description.slice(0, 50)}...</span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles.badgePurple}`}>{p.category}</span>
                  </td>
                  <td className={styles.priceCell}>₱{p.price}</td>
                  <td className={p.stock <= 5 ? styles.stockLow : styles.stockOk}>{p.stock} pcs</td>
                  <td>
                    <span className={`${styles.badge} ${p.available ? styles.badgeGreen : styles.badgeRed}`}>
                      {p.available ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button className={styles.editBtn} onClick={() => openEdit(p)}>✏️ Edit</button>
                      <button className={styles.deleteBtn} onClick={() => setConfirmDelete(p.id)}>🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <p className={styles.empty}>No products yet. Add one!</p>}
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? "Edit Product" : "Add New Product"}</h2>
            <form onSubmit={handleSave}>
              <div className={styles.formGroup}>
                <label>Product Name</label>
                <input type="text" value={form.name} onChange={set("name")} placeholder="e.g. Classic Puto Bumbong" required />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea rows={3} value={form.description} onChange={set("description")} placeholder="Short description..." required />
              </div>
              <div className={styles.formGroup}>
                <label>Category</label>
                <select value={form.category} onChange={set("category")}>
                  <option value="Classic">Classic</option>
                  <option value="Special">Special</option>
                  <option value="Ube">Ube</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Price (₱)</label>
                <input type="number" value={form.price} onChange={set("price")} placeholder="100" min="1" required />
              </div>
              <div className={styles.formGroup}>
                <label>Stock (pcs)</label>
                <input type="number" value={form.stock} onChange={set("stock")} placeholder="50" min="0" required />
              </div>
              <div className={styles.formGroup}>
                <label>Image Path</label>
                <select value={form.image} onChange={set("image")}>
                  <option value="/classic.jpg">classic.jpg</option>
                  <option value="/deluxe.jpg">deluxe.jpg</option>
                  <option value="/hero.jpg">hero.jpg</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Availability</label>
                <select value={String(form.available)} onChange={(e) => setForm((p) => ({ ...p, available: e.target.value === "true" }))}>
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
              </div>
              <div className={styles.modalBtns}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className={styles.primaryBtn} disabled={saving}>
                  {saving ? "Saving..." : editing ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {confirmDelete && (
        <div className={styles.overlay} onClick={() => setConfirmDelete(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Delete Product?</h2>
            <p style={{ color: "#6b7280", marginBottom: 24 }}>This action cannot be undone.</p>
            <div className={styles.modalBtns}>
              <button className={styles.cancelBtn} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className={styles.deleteBtn} onClick={() => handleDelete(confirmDelete)}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
