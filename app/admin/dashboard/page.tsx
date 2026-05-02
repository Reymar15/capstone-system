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
  Pending: "#f59e0b", Preparing: "#3b82f6",
  Ready: "#8b5cf6", Completed: "#10b981", Cancelled: "#ef4444",
};

const STATUS_BADGE: Record<string, string> = {
  Pending: styles.badgeYellow, Preparing: styles.badgeBlue,
  Ready: styles.badgePurple, Completed: styles.badgeGreen, Cancelled: styles.badgeRed,
};

const formatOrderDate = (createdAt: string, id: string) => {
  const fallbackDate = /^\d+$/.test(id) ? new Date(Number(id)) : null;
  const date = createdAt ? new Date(createdAt) : fallbackDate;

  if (!date || Number.isNaN(date.getTime())) return "No date";

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") { router.push("/"); return; }
    fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [user, token, router]);

  const totalSales = orders.reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.status === "Pending").length;
  const preparing = orders.filter((o) => o.status === "Preparing").length;
  const completed = orders.filter((o) => o.status === "Completed").length;

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  if (loading) return <div className={styles.loading}>Loading dashboard...</div>;

  const recentOrders = [...orders]
    .sort((a, b) => {
      const aTime = new Date(a.createdAt || Number(a.id)).getTime();
      const bTime = new Date(b.createdAt || Number(b.id)).getTime();
      return bTime - aTime;
    })
    .slice(0, 8);

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
      </div>

      {/* QUICK LINKS */}
      <div className={dash.quickLinks}>
        <Link href="/admin/orders" className={dash.quickCard}>
          <span>📦</span>
          <p>Manage Orders</p>
        </Link>
        <Link href="/admin/products" className={dash.quickCard}>
          <span>🍡</span>
          <p>Manage Products</p>
        </Link>
        <Link href="/" className={dash.quickCard}>
          <span>🌐</span>
          <p>View Website</p>
        </Link>
      </div>

      {/* RECENT ORDERS TABLE */}
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
                    {o.items.map((i) => `${i.name} x${i.qty}`).join(", ")}
                  </td>
                  <td className={styles.priceCell}>₱{o.total}</td>
                  <td>
                    <span className={`${styles.badge} ${o.paymentStatus === "Paid" ? styles.badgeGreen : styles.badgeYellow}`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${STATUS_BADGE[o.status]}`}>
                      <span className={styles.statusDot} style={{ background: STATUS_COLOR[o.status] }} />
                      {o.status}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.78rem", color: "#9ca3af", whiteSpace: "nowrap" }}>
                    {formatOrderDate(o.createdAt, o.id)}
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
