"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Navbar from "../components/Navbar";
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

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          style={{
            fontSize: "2rem", background: "none", border: "none", cursor: "pointer", padding: 0,
            color: star <= (hovered || value) ? "#f59e0b" : "#e5e7eb",
            transition: "color 0.1s, transform 0.1s",
            transform: star <= (hovered || value) ? "scale(1.15)" : "scale(1)",
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function MyOrdersPage() {
  const { user, token } = useAuth();
  const { success, error: toastError } = useToast();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Review modal state
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!user || !token) return;
    const [ordersRes, reviewsRes] = await Promise.all([
      fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`/api/reviews?userId=${user.id}`),
    ]);
    const ordersData = await ordersRes.json();
    const reviewsData = await reviewsRes.json();

    if (Array.isArray(ordersData)) {
      setOrders(ordersData.sort((a: Order, b: Order) => {
        const at = a.createdAt && !isNaN(new Date(a.createdAt).getTime()) ? new Date(a.createdAt).getTime() : 0;
        const bt = b.createdAt && !isNaN(new Date(b.createdAt).getTime()) ? new Date(b.createdAt).getTime() : 0;
        return bt - at;
      }));
    }
    if (Array.isArray(reviewsData)) {
      setReviewedIds(new Set(reviewsData.map((r: { orderId: string }) => r.orderId)));
    }
    setLoading(false);
  }, [user, token]);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    loadData();
  }, [user, router, loadData]);

  const openReview = (order: Order) => {
    setReviewOrder(order);
    setReviewRating(5);
    setReviewText("");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) { toastError("Please write a review."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId: reviewOrder!.id, rating: reviewRating, comment: reviewText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { toastError(data.error || "Failed to submit review."); return; }
      setReviewedIds((prev) => new Set([...prev, reviewOrder!.id]));
      success("Review submitted! Thank you 🎉");
      setReviewOrder(null);
    } finally {
      setSubmitting(false);
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
            const alreadyReviewed = reviewedIds.has(order.id);

            return (
              <div key={order.id} className={orderStyles.orderCard}>
                {/* HEADER */}
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

                {/* PROGRESS TRACKER */}
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
                      <thead><tr><th>Item</th><th>Qty</th><th>Subtotal</th></tr></thead>
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

                    {/* REVIEW SECTION */}
                    {isCompleted && (
                      <div className={orderStyles.reviewSection}>
                        {alreadyReviewed ? (
                          <div className={orderStyles.reviewedBadge}>
                            <span>✅</span> Review submitted — thank you for your feedback!
                          </div>
                        ) : (
                          <button className={orderStyles.reviewBtn} onClick={() => openReview(order)}>
                            ⭐ Rate & Review this Order
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
            <div className={orderStyles.reviewModalHeader}>
              <h2>Rate Your Order</h2>
              <button className={orderStyles.reviewModalClose} onClick={() => setReviewOrder(null)}>✕</button>
            </div>

            <div className={orderStyles.reviewOrderInfo}>
              <span className={orderStyles.reviewOrderId}>#{reviewOrder.id.slice(-6)}</span>
              <span className={orderStyles.reviewOrderItems}>{reviewOrder.items.map((i) => i.name).join(", ")}</span>
            </div>

            <form onSubmit={handleReviewSubmit}>
              <div className={orderStyles.ratingSection}>
                <label>How would you rate this order?</label>
                <StarPicker value={reviewRating} onChange={setReviewRating} />
                <span className={orderStyles.ratingLabel}>
                  {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][reviewRating]}
                </span>
              </div>

              <div className={orderStyles.reviewTextSection}>
                <label>Share your experience</label>
                <textarea
                  rows={4}
                  placeholder="Tell us what you loved (or didn't love) about your order..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className={orderStyles.reviewTextarea}
                />
                <span className={orderStyles.charCount}>{reviewText.length}/500</span>
              </div>

              <div className={orderStyles.reviewModalBtns}>
                <button type="button" className={orderStyles.reviewCancelBtn} onClick={() => setReviewOrder(null)}>
                  Cancel
                </button>
                <button type="submit" className={orderStyles.reviewSubmitBtn} disabled={submitting || !reviewText.trim()}>
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
