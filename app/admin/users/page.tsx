"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import AdminLayout from "../AdminLayout";
import { useToast } from "../../context/ToastContext";
import styles from "../admin.module.css";

type User = {
  id: string; firstName: string; lastName: string;
  email: string; role: string; phone: string;
  createdAt: string; emailVerified: boolean;
};

export default function AdminUsers() {
  const { user, token } = useAuth();
  const { success, error: toastError } = useToast();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") { router.push("/"); return; }
    fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [user, token, router]);

  const updateRole = async (id: string, role: string) => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, role }),
    });
    if (!res.ok) { toastError("Failed to update role."); return; }
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role } : u));
    success("User role updated.");
  };

  const deleteUser = async (id: string) => {
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) { toastError("Failed to delete user."); return; }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setConfirmDelete(null);
    success("User deleted.");
  };

  const q = search.trim().toLowerCase();
  const filtered = users.filter((u) =>
    q === "" ||
    u.firstName.toLowerCase().includes(q) ||
    u.lastName.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q) ||
    u.phone?.toLowerCase().includes(q)
  );

  const customers = users.filter((u) => u.role === "customer").length;
  const admins = users.filter((u) => u.role === "admin").length;

  if (loading) return <div className={styles.loading}>Loading users...</div>;

  return (
    <AdminLayout>
      <div className={styles.pageHeader}>
        <div>
          <h1>Users</h1>
          <p>{users.length} total · {customers} users · {admins} admins</p>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="🔍 Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "11px 16px", borderRadius: 10,
            border: "1.5px solid #e9d5ff", fontSize: "0.92rem",
            outline: "none", fontFamily: "inherit", background: "white",
            boxSizing: "border-box", color: "#1a1a2e",
          }}
        />
      </div>

      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: "50%",
                        background: "linear-gradient(135deg,#7b1fa2,#c2188b)",
                        color: "white", display: "flex", alignItems: "center",
                        justifyContent: "center", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0,
                      }}>
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </div>
                      <div>
                        <strong style={{ color: "#1a1a2e" }}>{u.firstName} {u.lastName}</strong>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: "0.85rem", color: "#6b7280" }}>{u.email}</td>
                  <td style={{ fontSize: "0.85rem", color: "#6b7280" }}>{u.phone || "—"}</td>
                  <td>
                    <span className={`${styles.badge} ${u.role === "admin" ? styles.badgePurple : styles.badgeBlue}`}>
                      {u.role === "admin" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${u.emailVerified ? styles.badgeGreen : styles.badgeYellow}`}>
                      {u.emailVerified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.78rem", color: "#9ca3af" }}>
                    {u.createdAt && !isNaN(new Date(u.createdAt).getTime())
                      ? new Date(u.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
                  </td>
                  <td>
                    <div className={styles.actionBtns}>
                      {u.id !== user?.id && (
                        <>
                          <select
                            className={styles.statusSelect}
                            value={u.role}
                            onChange={(e) => updateRole(u.id, e.target.value)}
                          >
                            <option value="customer">User</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button className={styles.deleteBtn} onClick={() => setConfirmDelete(u.id)}>
                            Delete
                          </button>
                        </>
                      )}
                      {u.id === user?.id && (
                        <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>You</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className={styles.empty}>No users found.</p>}
        </div>
      </div>

      {confirmDelete && (
        <div className={styles.overlay} onClick={() => setConfirmDelete(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Delete User?</h2>
            <p style={{ color: "#6b7280", marginBottom: 24 }}>This will permanently delete the user and cannot be undone.</p>
            <div className={styles.modalBtns}>
              <button className={styles.cancelBtn} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className={styles.deleteBtn} onClick={() => deleteUser(confirmDelete)}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
