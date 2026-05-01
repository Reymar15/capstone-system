"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import styles from "../page.module.css";
import orderStyles from "./my-orders.module.css";

type OrderItem = { name: string; qty: number; price: number };
type Order = {
  id: string; customerName: string; items: OrderItem[]; total: number;
  status: string; paymentStatus: string; payment: string; createdAt: string; address: string;
};

const STEPS = ["Pending", "Preparing", "Ready", "Completed"];

const STATUS_COLOR: Record<string, string> = {
  Pending: "#f59e0b", Preparing: "#3b82f6",
  Ready: "#8b5cf6", Completed: "#10b981", Cancelled: "#ef4444",
};

export default function MyOrdersPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setOrders(data.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())))
      .finally(() => setLoading(false));
  }, [user, token, router]);

  const paymentLabel: Record<string, string> = { cod: "Cash on Delivery", gcash: "GCash", maya: "Maya" };

  return (
    <div>
      <nav className={styles.navbar}>
        <Link href="/" className={styles.logoLink}>
          <h2 className={styles.logo}>Puto Bumbong</h2>
        </Link>
        <ul className={styles.navLinks}>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/menu">Menu</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
        <div className={styles.navAuth}>
          <span className={orderStyles.greeting}>Hi, {user?.firstName}!</span>
          <Link href="/menu" className={styles.signupBtn}>Order Again</Link>
        </div>
      </nav>

      <div className={orderStyles.wrapper}>
        <div className={orderStyles.pageHeader}>
          <h1>My Orders</h1>
          <p>Track your puto bumbong orders</p>
        </div>

        {loading && <p className={orderStyles.loading}>Loading your orders...</p>}

        {!loading && orders.length === 0 && (
          <div className={orderStyles.empty}>
            <p>🛒 You have no orders yet.</p>
            <Link href="/menu" className={orderStyles.browseBtn}>Browse Menu</Link>
          </div>
        )}

        <div className={orderStyles.orderList}>
          {orders.map((order) => {
            const stepIndex = STEPS.indexOf(order.status);
            const isCancelled = order.status === "Cancelled";
            const isOpen = expanded === order.id;

            return (
              <div key={order.id} className={orderStyles.orderCard}>
                {/* CARD HEADER */}
                <div className={orderStyles.cardHeader} onClick={() => setExpanded(isOpen ? null : order.id)}>
                  <div className={orderStyles.orderMeta}>
                    <span className={orderStyles.orderId}>#{order.id.slice(-6)}</span>
                    <span className={orderStyles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <div className={orderStyles.cardRight}>
                    <span className={orderStyles.orderTotal}>₱{order.total}</span>
                    <span
                      className={orderStyles.statusPill}
                      style={{ background: STATUS_COLOR[order.status] + "22", color: STATUS_COLOR[order.status], border: `1.5px solid ${STATUS_COLOR[order.status]}44` }}
                    >
                      {order.status}
                    </span>
                    <span className={orderStyles.chevron}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* PROGRESS TRACKER */}
                {!isCancelled && (
                  <div className={orderStyles.tracker}>
                    {STEPS.map((step, i) => (
                      <div key={step} className={orderStyles.trackerStep}>
                        <div className={`${orderStyles.trackerDot} ${i <= stepIndex ? orderStyles.trackerDotActive : ""}`}>
                          {i < stepIndex ? "✓" : i === stepIndex ? "●" : ""}
                        </div>
                        <span className={`${orderStyles.trackerLabel} ${i <= stepIndex ? orderStyles.trackerLabelActive : ""}`}>
                          {step}
                        </span>
                        {i < STEPS.length - 1 && (
                          <div className={`${orderStyles.trackerLine} ${i < stepIndex ? orderStyles.trackerLineActive : ""}`} />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {isCancelled && (
                  <div className={orderStyles.cancelledBanner}>❌ This order was cancelled.</div>
                )}

                {/* EXPANDED DETAILS */}
                {isOpen && (
                  <div className={orderStyles.details}>
                    <div className={orderStyles.detailsGrid}>
                      <div>
                        <p className={orderStyles.detailLabel}>Delivery Address</p>
                        <p className={orderStyles.detailValue}>{order.address}</p>
                      </div>
                      <div>
                        <p className={orderStyles.detailLabel}>Payment Method</p>
                        <p className={orderStyles.detailValue}>{paymentLabel[order.payment] || order.payment}</p>
                      </div>
                      <div>
                        <p className={orderStyles.detailLabel}>Payment Status</p>
                        <p className={orderStyles.detailValue} style={{ color: order.paymentStatus === "Paid" ? "#10b981" : "#f59e0b", fontWeight: 700 }}>
                          {order.paymentStatus}
                        </p>
                      </div>
                    </div>

                    <table className={orderStyles.itemsTable}>
                      <thead>
                        <tr>
                          <th>Item</th><th>Qty</th><th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, i) => (
                          <tr key={i}>
                            <td>{item.name}</td>
                            <td>x{item.qty}</td>
                            <td>₱{item.price * item.qty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className={orderStyles.totalRow}>
                      <span>Total</span>
                      <span>₱{order.total}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
