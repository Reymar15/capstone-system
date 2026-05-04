"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import AdminLayout from "../AdminLayout";
import styles from "../admin.module.css";

type Message = {
  id: string; name: string; email: string;
  phone: string; message: string;
  is_read: boolean; created_at: string;
};

export default function AdminMessages() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") { router.push("/"); return; }
    fetch("/api/admin/messages", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [user, token, router]);

  const markRead = async (msg: Message) => {
    setSelected(msg);
    if (!msg.is_read) {
      await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: msg.id }),
      });
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, is_read: true } : m));
    }
  };

  const unread = messages.filter((m) => !m.is_read).length;
  const filtered = filter === "unread" ? messages.filter((m) => !m.is_read) : messages;

  if (loading) return <div className={styles.loading}>Loading messages...</div>;

  return (
    <AdminLayout>
      <div className={styles.pageHeader}>
        <div>
          <h1>Messages</h1>
          <p>{messages.length} total · {unread} unread</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["all", "unread"] as const).map((f) => (
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
            {f === "all" ? `All (${messages.length})` : `Unread (${unread})`}
          </button>
        ))}
      </div>

      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Status</th><th>From</th><th>Email</th><th>Phone</th><th>Message</th><th>Date</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} style={{ fontWeight: m.is_read ? 400 : 700 }}>
                  <td>
                    <span className={`${styles.badge} ${m.is_read ? styles.badgeGreen : styles.badgeYellow}`}>
                      {m.is_read ? "Read" : "New"}
                    </span>
                  </td>
                  <td style={{ color: "#1a1a2e" }}>{m.name}</td>
                  <td style={{ fontSize: "0.82rem", color: "#6b7280" }}>{m.email}</td>
                  <td style={{ fontSize: "0.82rem", color: "#6b7280" }}>{m.phone || "—"}</td>
                  <td style={{ maxWidth: 220, fontSize: "0.85rem", color: "#374151" }}>
                    {m.message.length > 60 ? m.message.slice(0, 60) + "…" : m.message}
                  </td>
                  <td style={{ fontSize: "0.78rem", color: "#9ca3af", whiteSpace: "nowrap" }}>
                    {m.created_at && !isNaN(new Date(m.created_at).getTime())
                      ? new Date(m.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </td>
                  <td>
                    <button className={styles.editBtn} onClick={() => markRead(m)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className={styles.empty}>No messages found.</p>}
        </div>
      </div>

      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <h2>Message from {selected.name}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px", marginBottom: 20 }}>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: "0.75rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>Email</p>
                <p style={{ margin: 0, color: "#1a1a2e", fontWeight: 600 }}>{selected.email}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: "0.75rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>Phone</p>
                <p style={{ margin: 0, color: "#1a1a2e", fontWeight: 600 }}>{selected.phone || "—"}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: "0.75rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>Date</p>
                <p style={{ margin: 0, color: "#1a1a2e", fontWeight: 600 }}>
                  {selected.created_at && !isNaN(new Date(selected.created_at).getTime())
                    ? new Date(selected.created_at).toLocaleString("en-PH")
                    : "—"}
                </p>
              </div>
            </div>
            <div style={{ background: "#f8f5fa", borderRadius: 12, padding: "16px 18px", marginBottom: 24 }}>
              <p style={{ margin: "0 0 4px", fontSize: "0.75rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>Message</p>
              <p style={{ margin: 0, color: "#1a1a2e", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{selected.message}</p>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <a
                href={`mailto:${selected.email}?subject=Re: Your message to Kzen's Puto Bumbong`}
                style={{
                  padding: "10px 20px", borderRadius: 10, background: "linear-gradient(135deg,#7b1fa2,#c2188b)",
                  color: "white", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none",
                }}
              >
                Reply via Email
              </a>
              <button className={styles.cancelBtn} onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
