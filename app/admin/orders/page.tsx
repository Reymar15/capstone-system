"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import AdminLayout from "../AdminLayout";
import { useToast } from "../../context/ToastContext";
import styles from "../admin.module.css";

type OrderItem = { name: string; qty: number; price: number };
type Order = {
  id: string; customerName: string; phone: string; address: string;
  payment: string; notes: string; items: OrderItem[]; total: number;
  status: string; paymentStatus: string; createdAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  Pending: "#f59e0b", Preparing: "#3b82f6",
  Ready: "#8b5cf6", Completed: "#10b981", Cancelled: "#ef4444",
};

const STATUS_BADGE: Record<string, string> = {
  Pending: "badgeYellow", Preparing: "badgeBlue",
  Ready: "badgePurple", Completed: "badgeGreen", Cancelled: "badgeRed",
};

export default function AdminOrders() {
  const { user, token } = useAuth();
  const { success } = useToast();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") { router.push("/"); return; }
    fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setOrders(data.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())))
      .finally(() => setLoading(false));
  }, [user, token, router]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : null);
    success(`Order status updated to "${status}".`);
  };

  const updatePayment = async (id: string, paymentStatus: string) => {
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ paymentStatus }),
    });
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, paymentStatus } : o)));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, paymentStatus } : null);
    success(`Payment status updated to "${paymentStatus}".`);
  };

  const filters = ["All", "Pending", "Preparing", "Ready", "Completed", "Cancelled"];
  const q = search.trim().toLowerCase();
  const filtered = (filter === "All" ? orders : orders.filter((o) => o.status === filter))
    .filter((o) =>
      q === "" ||
      o.customerName.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      o.phone?.toLowerCase().includes(q) ||
      o.address?.toLowerCase().includes(q)
    );

  const paymentLabel: Record<string, string> = { cod: "Cash on Delivery", gcash: "GCash", maya: "Maya" };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <AdminLayout>
      <div className={styles.pageHeader}>
        <div>
          <h1>Orders</h1>
          <p>{orders.length} total orders · {filtered.length} shown</p>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="🔍 Search by customer name or order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "11px 16px", borderRadius: 10,
            border: "1.5px solid #e9d5ff", fontSize: "0.92rem",
            outline: "none", fontFamily: "inherit", background: "white",
            boxSizing: "border-box", color: "#000000",
          }}
        />
      </div>

      {/* FILTER TABS */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "7px 18px", borderRadius: 999, border: "1.5px solid",
              borderColor: filter === f ? "#7b1fa2" : "#e9d5ff",
              background: filter === f ? "#7b1fa2" : "white",
              color: filter === f ? "white" : "#7b1fa2",
              fontWeight: 600, fontSize: "0.85rem", cursor: "pointer",
            }}
          >
            {f} {f !== "All" && `(${orders.filter((o) => o.status === f).length})`}
          </button>
        ))}
      </div>

      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th><th>Customer</th><th>Items</th>
                <th>Total</th><th>Payment</th><th>Pay Status</th>
                <th>Order Status</th><th>Date</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td className={styles.orderId}>#{o.id.slice(-6)}</td>
                  <td>
                    <strong>{o.customerName}</strong><br />
                    <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>{o.phone}</span>
                  </td>
                  <td style={{ maxWidth: 180, fontSize: "0.82rem" }}>
                    {o.items.map((i) => `${i.name} x${i.qty}`).join(", ")}
                  </td>
                  <td className={styles.priceCell}>₱{o.total}</td>
                  <td style={{ fontSize: "0.82rem" }}>{paymentLabel[o.payment] || o.payment}</td>
                  <td>
                    <span className={`${styles.badge} ${o.paymentStatus === "Paid" ? styles.badgeGreen : styles.badgeYellow}`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className={styles.statusDot} style={{ background: STATUS_COLORS[o.status] }} />
                    {o.status}
                  </td>
                  <td style={{ fontSize: "0.78rem", color: "#9ca3af" }}>
                    {o.createdAt && !isNaN(new Date(o.createdAt).getTime())
                      ? new Date(o.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button className={styles.editBtn} onClick={() => setSelected(o)}>👁 View</button>
                      <select
                        className={styles.statusSelect}
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                      >
                        {["Pending","Preparing","Ready","Completed","Cancelled"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className={styles.empty}>No orders found.</p>}
        </div>
      </div>

      {/* ORDER DETAIL MODAL */}
      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <h2>Order #{selected.id.slice(-6)}</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px", marginBottom: 20 }}>
              <div><p style={{ margin: 0, fontSize: "0.78rem", color: "#9ca3af" }}>Customer</p><p style={{ margin: 0, fontWeight: 700, color: "#000000" }}>{selected.customerName}</p></div>
              <div><p style={{ margin: 0, fontSize: "0.78rem", color: "#9ca3af" }}>Phone</p><p style={{ margin: 0, fontWeight: 700, color: "#000000" }}>{selected.phone}</p></div>
              <div style={{ gridColumn: "1/-1" }}><p style={{ margin: 0, fontSize: "0.78rem", color: "#9ca3af" }}>Address</p><p style={{ margin: 0, fontWeight: 700, color: "#000000" }}>{selected.address}</p></div>
              <div><p style={{ margin: 0, fontSize: "0.78rem", color: "#9ca3af" }}>Payment</p><p style={{ margin: 0, fontWeight: 700, color: "#000000" }}>{paymentLabel[selected.payment] || selected.payment}</p></div>
              <div><p style={{ margin: 0, fontSize: "0.78rem", color: "#9ca3af" }}>Date</p><p style={{ margin: 0, fontWeight: 700, color: "#000000" }}>{selected.createdAt && !isNaN(new Date(selected.createdAt).getTime()) ? new Date(selected.createdAt).toLocaleString("en-PH") : "—"}</p></div>
              {selected.notes && <div style={{ gridColumn: "1/-1" }}><p style={{ margin: 0, fontSize: "0.78rem", color: "#9ca3af" }}>Notes</p><p style={{ margin: 0, color: "#000000" }}>{selected.notes}</p></div>}
            </div>

            {/* ITEMS */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", marginBottom: 16 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <th style={{ textAlign: "left", padding: "6px 0", color: "#000000", fontWeight: 600, fontSize: "0.75rem" }}>Item</th>
                  <th style={{ textAlign: "center", padding: "6px 0", color: "#000000", fontWeight: 600, fontSize: "0.75rem" }}>Qty</th>
                  <th style={{ textAlign: "right", padding: "6px 0", color: "#000000", fontWeight: 600, fontSize: "0.75rem" }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selected.items.map((item, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f9fafb" }}>
                    <td style={{ padding: "8px 0", color: "#000000" }}>{item.name}</td>
                    <td style={{ textAlign: "center", padding: "8px 0", color: "#000000" }}>x{item.qty}</td>
                    <td style={{ textAlign: "right", padding: "8px 0", fontWeight: 700, color: "#000000" }}>₱{item.price * item.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1.1rem", marginBottom: 20, color: "#000000" }}>
              <span>Total</span><span style={{ color: "#7b1fa2" }}>₱{selected.total}</span>
            </div>

            {/* STATUS CONTROLS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className={styles.formGroup} style={{ margin: 0 }}>
                <label>Order Status</label>
                <select className={styles.statusSelect} style={{ width: "100%" }} value={selected.status} onChange={(e) => updateStatus(selected.id, e.target.value)}>
                  {["Pending","Preparing","Ready","Completed","Cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className={styles.formGroup} style={{ margin: 0 }}>
                <label>Payment Status</label>
                <select className={styles.statusSelect} style={{ width: "100%" }} value={selected.paymentStatus} onChange={(e) => updatePayment(selected.id, e.target.value)}>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>

            <div className={styles.modalBtns}>
              <button className={styles.cancelBtn} onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
