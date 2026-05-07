"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import AdminLayout from "../AdminLayout";
import styles from "../admin.module.css";
import dash from "./dashboard.module.css";

type Order = {
  id: string; customerName: string; total: number;
  status: string; paymentStatus: string; createdAt: string;
  items: { name: string; qty: number }[];
};

const STATUS_COLOR: Record<string, string> = {
  Pending: "#f59e0b", Preparing: "#0d9488",
  Ready: "#8b5cf6", Completed: "#16a34a", Cancelled: "#ef4444",
};

const STATUS_BADGE: Record<string, string> = {
  Pending: styles.badgeYellow, Preparing: styles.badgeBlue,
  Ready: styles.badgePurple, Completed: styles.badgeGreen, Cancelled: styles.badgeRed,
};

const formatDate = (createdAt: string, id: string) => {
  const fallback = /^\d+$/.test(id) ? new Date(Number(id)) : null;
  const date = createdAt ? new Date(createdAt) : fallback;
  if (!date || isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") { router.push("/"); return; }
    Promise.all([
      fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([ordersData, usersData]) => {
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setUserCount(Array.isArray(usersData) ? usersData.filter((u: { role: string }) => u.role === "customer").length : 0);
    }).finally(() => setLoading(false));
  }, [user, token, router]);

  // ── STATS ──────────────────────────────────────────────────
  // Total Sales = completed/paid orders only
  const totalSales = orders
    .filter((o) => o.status === "Completed" || o.paymentStatus === "Paid")
    .reduce((s, o) => s + o.total, 0);

  const pending   = orders.filter((o) => o.status === "Pending").length;
  const preparing = orders.filter((o) => o.status === "Preparing").length;
  const completed = orders.filter((o) => o.status === "Completed").length;

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders((prev) => prev.map((o) =>
        o.id === id ? { ...o, status: updated.status, paymentStatus: updated.payment_status ?? updated.paymentStatus ?? o.paymentStatus } : o
      ));
    }
  };

  const recentOrders = [...orders]
    .sort((a, b) => {
      const aT = a.createdAt ? new Date(a.createdAt).getTime() : Number(a.id);
      const bT = b.createdAt ? new Date(b.createdAt).getTime() : Number(b.id);
      return bT - aT;
    })
    .slice(0, 8);

  if (loading) return <div className={styles.loading}>Loading dashboard...</div>;

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className={styles.pageHeader}>
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, <strong>{user?.firstName}</strong>! Here&apos;s what&apos;s happening today.</p>
        </div>
        <Link href="/admin/orders" className={styles.primaryBtn}>View All Orders</Link>
      </div>

      {/* STAT CARDS */}
      <div className={dash.statsGrid}>
        <div className={`${dash.statCard} ${dash.statSales}`}>
          <div className={dash.statIconBox}>💰</div>
          <div className={dash.statInfo}>
            <p className={dash.statLabel}>Total Sales</p>
            <h2 className={dash.statValue}>₱{totalSales.toLocaleString()}</h2>
          </div>
        </div>
        <div className={`${dash.statCard} ${dash.statOrders}`}>
          <div className={dash.statIconBox}>📦</div>
          <div className={dash.statInfo}>
            <p className={dash.statLabel}>Total Orders</p>
            <h2 className={dash.statValue}>{orders.length}</h2>
          </div>
        </div>
        <div className={`${dash.statCard} ${dash.statPending}`}>
          <div className={dash.statIconBox}>⏳</div>
          <div className={dash.statInfo}>
            <p className={dash.statLabel}>Pending</p>
            <h2 className={dash.statValue}>{pending}</h2>
          </div>
        </div>
        <div className={`${dash.statCard} ${dash.statPreparing}`}>
          <div className={dash.statIconBox}>👨‍🍳</div>
          <div className={dash.statInfo}>
            <p className={dash.statLabel}>Preparing</p>
            <h2 className={dash.statValue}>{preparing}</h2>
          </div>
        </div>
        <div className={`${dash.statCard} ${dash.statCompleted}`}>
          <div className={dash.statIconBox}>✅</div>
          <div className={dash.statInfo}>
            <p className={dash.statLabel}>Completed</p>
            <h2 className={dash.statValue}>{completed}</h2>
          </div>
        </div>
        <div className={`${dash.statCard} ${dash.statUsers}`}>
          <div className={dash.statIconBox}>👥</div>
          <div className={dash.statInfo}>
            <p className={dash.statLabel}>Users</p>
            <h2 className={dash.statValue}>{userCount}</h2>
          </div>
        </div>
      </div>

      {/* RECENT ORDERS */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Recent Orders</h2>
          <Link href="/admin/orders" className={styles.viewAll}>View All →</Link>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td className={styles.orderId}>#{o.id.slice(-6)}</td>
                  <td><strong>{o.customerName?.trim() || "Customer"}</strong></td>
                  <td style={{ fontSize: "0.8rem", color: "#6b7280", maxWidth: 160 }}>
                    {o.items?.map((i) => `${i.name} x${i.qty}`).join(", ") || "—"}
                  </td>
                  <td className={styles.priceCell}>₱{o.total}</td>
                  <td>
                    <span className={`${styles.badge} ${o.paymentStatus === "Paid" ? styles.badgeGreen : styles.badgeYellow}`}>
                      {o.paymentStatus || "Pending"}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${STATUS_BADGE[o.status] || styles.badgeYellow}`}>
                      <span className={styles.statusDot} style={{ background: STATUS_COLOR[o.status] || "#9ca3af" }} />
                      {o.status}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.78rem", color: "#9ca3af", whiteSpace: "nowrap" }}>
                    {formatDate(o.createdAt, o.id)}
                  </td>
                  <td>
                    <select
                      className={styles.statusSelect}
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                    >
                      {["Pending", "Preparing", "Ready", "Completed", "Cancelled"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className={styles.empty}>No orders yet.</p>}
        </div>
      </div>
    </AdminLayout>
  );
}
