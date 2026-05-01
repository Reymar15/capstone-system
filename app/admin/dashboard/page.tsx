"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import AdminLayout from "../AdminLayout";
import styles from "../admin.module.css";

type Order = {
  id: string; customerName: string; total: number;
  status: string; paymentStatus: string; createdAt: string;
  items: { name: string; qty: number }[];
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
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [user, token, router]);

  const totalSales = orders.reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.status === "Pending").length;
  const completed = orders.filter((o) => o.status === "Completed").length;

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const statusColor: Record<string, string> = {
    Pending: "#f59e0b", Preparing: "#3b82f6",
    Ready: "#8b5cf6", Completed: "#10b981", Cancelled: "#ef4444",
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <AdminLayout>
      <div className={styles.pageHeader}>
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.firstName}!</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>💰</span>
          <div>
            <p className={styles.statLabel}>Total Sales</p>
            <h2 className={styles.statValue}>₱{totalSales.toLocaleString()}</h2>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>📦</span>
          <div>
            <p className={styles.statLabel}>Total Orders</p>
            <h2 className={styles.statValue}>{orders.length}</h2>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>⏳</span>
          <div>
            <p className={styles.statLabel}>Pending</p>
            <h2 className={styles.statValue}>{pending}</h2>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>✅</span>
          <div>
            <p className={styles.statLabel}>Completed</p>
            <h2 className={styles.statValue}>{completed}</h2>
          </div>
        </div>
      </div>

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
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map((o) => (
                <tr key={o.id}>
                  <td className={styles.orderId}>#{o.id.slice(-6)}</td>
                  <td>{o.customerName}</td>
                  <td>{o.items.map((i) => `${i.name} x${i.qty}`).join(", ")}</td>
                  <td className={styles.priceCell}>₱{o.total}</td>
                  <td>
                    <span className={`${styles.badge} ${o.paymentStatus === "Paid" ? styles.badgeGreen : styles.badgeYellow}`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className={styles.statusDot} style={{ background: statusColor[o.status] }} />
                    {o.status}
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
