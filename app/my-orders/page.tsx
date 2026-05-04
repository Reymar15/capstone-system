"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Navbar from "../components/Navbar";
import orderStyles from "./my-orders.module.css";

type OrderItem = { name: string; qty: number; price: number };
type Order = {
  id: string; customerName: string; items: OrderItem[]; total: number;
  status: string; paymentStatus: string; payment: string; createdAt: string; address: string;
  reviewed?: boolean;
};

const STEPS = ["Pending", "Preparing", "Ready", "Completed"];

const STATUS_COLOR: Record<string, string> = {
  Pending: "#f59e0b", Preparing: "#3b82f6",
  Ready: "#8b5cf6", Completed: "#10b981", Cancelled: "#ef4444",
};

export default function MyOrdersPage() {
  const { user, token } = useAuth();
  const { success, error: toastError } = useToast();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        setOrders(data.sort((a: Order, b: Order) => {
          const aTime = a.createdAt && !isNaN(new Date(a.createdAt).getTime()) ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt && !isNaN(new Date(b.createdAt).getTime()) ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        }));
      })
      .finally(() => setLoading(false));
  }, [user, token, router]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) { toastError("Please write a review."); return; }
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId: reviewOrder!.id, rating: reviewRating, comment: reviewText.trim() }),
      });
      if (!res.ok) { const d = await res.json(); toastError(d.error || "Failed to submit review."); return; }
      setOrders((prev) => prev.map((o) => o.id === reviewOrder!.id ? { ...o, reviewed: true } : o));
      success("Review submitted! Thank you 🎉");
      setReviewOrder(null);
      setReviewText("");
      setReviewRating(5);
    } finally {
      setSubmittingReview(false);
    }
  };

  const paymentLabel: Record<string, string> = { cod: "Cash on Delivery", gcash: "GCash", maya: "Maya" };

  return (
    <div style={{ background: "#f8f5fa", minHeight: "100vh" }}>
      <Navbar />

      <div className={orderStyles.wrapper}>
        <div className={orderStyles.pageHeader}>
          <h1>My Orders</h1>
          <p>Track your puto bumbong orders</p>
        </div>

        {loading && <p className={orderStyles.loading}>Loading your orders...</p>}

        {!loading && orders.length === 0 && (
          <div className={orderStyles.empty}>
            <p>🛒 You have no orders yet.</p>
            <a href="/menu" className={orderStyles.browseBtn}>Browse Menu</a>
          </div>
        )}

        <div className={orderStyles.orderList}>
          {orders.map((order) => {
            const stepIndex = STEPS.indexOf(order.status);
            const isCancelled = order.status === "Cancelled";
            const isCompleted = order.status === "Completed";
            const isOpen = expanded === order.id;

            return (
              <div key={order.id} className={orderStyles.orderCard}>
                <div className={orderStyles.cardHeader} onClick={() => setExpanded(isOpen ? null : order.id)}>
                  <div className={orderStyles.orderMeta}>
                    <span className={orderStyles.orderId}>#{order.id.slice(-6)}</span>
                    <span className={orderStyles.orderDate}>
                      {order.createdAt && !isNaN(new Date(order.createdAt).getTime())
                        ? new Date(order.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
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

                {!isCancelled && (
                  <div className={orderStyles.tracker}>
                    {STEPS.map((step, i) => (
                      <div key={step} className={orderStyles.trackerStep}>
                        <div className={`${orderStyles.trackerDot} ${i <= stepIndex ? orderStyles.trackerDotActive : ""}`}>
                          {i < stepIndex ? "✓" : i === stepIndex ? "●" : ""}
                        </div>
                        <span className={`${orderStyles.trackerLabel} ${i <= stepIndex ? orderStyles.trackerLabelActive : ""}`}>{step}</span>
                        {i < STEPS.length - 1 && (
                          <div className={`${orderStyles.trackerLine} ${i < stepIndex ? orderStyles.trackerLineActive : ""}`} />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {isCancelled && <div className={orderStyles.cancelledBanner}>❌ This order was cancelled.</div>}

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
                        <tr><th>Item</th><th>Qty</th><th>Subtotal</th></tr>
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

                    {isCompleted && (
                      <div style={{ marginTop: 16 }}>
                        {order.reviewed ? (
                          <div className={orderStyles.reviewedBadge}>✅ Review submitted — thank you!</div>
                        ) : (
                          <button className={orderStyles.reviewBtn} onClick={() => { setReviewOrder(order); setReviewRating(5); setReviewText(""); }}>
                            ⭐ Leave a Review
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* REVIEW MODAL */}
      {reviewOrder && (
        <div className={orderStyles.overlay} onClick={() => setReviewOrder(null)}>
          <div className={orderStyles.reviewModal} onClick={(e) => e.stopPropagation()}>
            <h2>Leave a Review</h2>
            <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: 20 }}>
              Order #{reviewOrder.id.slice(-6)} · {reviewOrder.items.map((i) => i.name).join(", ")}
            </p>
            <form onSubmit={handleReviewSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 600, fontSize: "0.9rem", display: "block", marginBottom: 8 }}>Rating</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      style={{ fontSize: "1.8rem", background: "none", border: "none", cursor: "pointer", opacity: star <= reviewRating ? 1 : 0.3, transition: "opacity 0.15s" }}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontWeight: 600, fontSize: "0.9rem", display: "block", marginBottom: 8 }}>Your Review</label>
                <textarea
                  rows={4}
                  placeholder="Share your experience..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e9d5ff", fontSize: "0.9rem", fontFamily: "inherit", outline: "none", resize: "vertical", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setReviewOrder(null)} style={{ padding: "9px 20px", borderRadius: 8, border: "1.5px solid #e5e7eb", background: "white", cursor: "pointer", fontWeight: 600 }}>
                  Cancel
                </button>
                <button type="submit" disabled={submittingReview} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#7b1fa2,#c2188b)", color: "white", fontWeight: 700, cursor: "pointer" }}>
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
