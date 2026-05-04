"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import AdminLayout from "../AdminLayout";
import { useToast } from "../../context/ToastContext";
import styles from "../admin.module.css";

type Review = {
  id: string;
  orderId: string;
  userId: string;
  productName: string;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
};

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ color: "#f59e0b", fontSize: "1rem", letterSpacing: 1 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ opacity: i < rating ? 1 : 0.2 }}>★</span>
      ))}
    </span>
  );
}

export default function AdminReviews() {
  const { user, token } = useAuth();
  const { success, error: toastError } = useToast();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRating, setFilterRating] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") { router.push("/"); return; }
    fetch("/api/reviews", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [user, token, router]);

  const handleDelete = async (id: string) => {
    const res = await fetch("/api/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) { toastError("Failed to delete review."); return; }
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setConfirmDelete(null);
    success("Review deleted.");
  };

  const q = search.trim().toLowerCase();
  const filtered = reviews.filter((r) => {
    const matchSearch = q === "" || r.userName.toLowerCase().includes(q) || r.productName.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q);
    const matchRating = filterRating === 0 || r.rating === filterRating;
    return matchSearch && matchRating;
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length > 0 ? Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100) : 0,
  }));

  if (loading) return <div className={styles.loading}>Loading reviews...</div>;

  return (
    <AdminLayout>
      <div className={styles.pageHeader}>
        <div>
          <h1>Reviews</h1>
          <p>{reviews.length} total reviews · avg {avgRating} ★</p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, marginBottom: 28 }}>
        {/* AVG RATING */}
        <div style={{ background: "white", borderRadius: 20, padding: "24px 32px", boxShadow: "0 2px 8px rgba(106,27,154,0.08)", textAlign: "center", minWidth: 160 }}>
          <div style={{ fontSize: "3.5rem", fontWeight: 800, color: "#1a1a2e", lineHeight: 1 }}>{avgRating}</div>
          <div style={{ color: "#f59e0b", fontSize: "1.4rem", margin: "6px 0 4px" }}>
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} style={{ opacity: i < Math.round(Number(avgRating)) ? 1 : 0.2 }}>★</span>
            ))}
          </div>
          <div style={{ fontSize: "0.82rem", color: "#9ca3af" }}>{reviews.length} reviews</div>
        </div>

        {/* RATING DISTRIBUTION */}
        <div style={{ background: "white", borderRadius: 20, padding: "20px 28px", boxShadow: "0 2px 8px rgba(106,27,154,0.08)" }}>
          {dist.map(({ star, count, pct }) => (
            <div key={star} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: "0.82rem", color: "#374151", fontWeight: 600, width: 16, textAlign: "right" }}>{star}</span>
              <span style={{ color: "#f59e0b", fontSize: "0.85rem" }}>★</span>
              <div style={{ flex: 1, height: 8, background: "#f3f4f6", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#7b1fa2,#c2188b)", borderRadius: 999, transition: "width 0.4s" }} />
              </div>
              <span style={{ fontSize: "0.78rem", color: "#9ca3af", width: 28, textAlign: "right" }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="🔍 Search by user, product or comment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 240, padding: "10px 16px", borderRadius: 10,
            border: "1.5px solid #e9d5ff", fontSize: "0.9rem",
            outline: "none", fontFamily: "inherit", background: "white", color: "#1a1a2e",
          }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 5, 4, 3, 2, 1].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRating(r)}
              style={{
                padding: "8px 14px", borderRadius: 8, border: "1.5px solid",
                borderColor: filterRating === r ? "#7b1fa2" : "#e9d5ff",
                background: filterRating === r ? "#7b1fa2" : "white",
                color: filterRating === r ? "white" : "#7b1fa2",
                fontWeight: 600, fontSize: "0.82rem", cursor: "pointer",
              }}
            >
              {r === 0 ? "All" : `${r}★`}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Rating</th>
                <th>User</th>
                <th>Product</th>
                <th>Review</th>
                <th>Order</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td><Stars rating={r.rating} /></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: "50%",
                        background: "linear-gradient(135deg,#7b1fa2,#c2188b)",
                        color: "white", display: "flex", alignItems: "center",
                        justifyContent: "center", fontWeight: 700, fontSize: "0.78rem", flexShrink: 0,
                      }}>
                        {r.userName?.[0]?.toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: "#1a1a2e", fontSize: "0.88rem" }}>{r.userName}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles.badgePurple}`} style={{ fontSize: "0.75rem" }}>
                      {r.productName || "—"}
                    </span>
                  </td>
                  <td style={{ maxWidth: 280, fontSize: "0.85rem", color: "#374151" }}>
                    <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {r.comment}
                    </span>
                  </td>
                  <td className={styles.orderId}>#{r.orderId.slice(-6)}</td>
                  <td style={{ fontSize: "0.78rem", color: "#9ca3af", whiteSpace: "nowrap" }}>
                    {r.createdAt && !isNaN(new Date(r.createdAt).getTime())
                      ? new Date(r.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
                  </td>
                  <td>
                    <button className={styles.deleteBtn} onClick={() => setConfirmDelete(r.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className={styles.empty}>No reviews found.</p>}
        </div>
      </div>

      {/* DELETE CONFIRM */}
      {confirmDelete && (
        <div className={styles.overlay} onClick={() => setConfirmDelete(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Delete Review?</h2>
            <p style={{ color: "#6b7280", marginBottom: 24 }}>This will permanently remove the review and cannot be undone.</p>
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
