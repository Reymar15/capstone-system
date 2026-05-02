"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Navbar from "../components/Navbar";
import styles from "../page.module.css";
import profileStyles from "./profile.module.css";

type ProfileData = {
  id: string; firstName: string; lastName: string;
  email: string; phone: string; address?: string;
  role: string; createdAt: string;
};

type Tab = "info" | "edit" | "password";

export default function ProfilePage() {
  const { user, token } = useAuth();
  const { success, error: toastError } = useToast();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [tab, setTab] = useState<Tab>("info");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", phone: "", address: "" });
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    fetch("/api/user/profile", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setEditForm({ firstName: data.firstName, lastName: data.lastName, phone: data.phone || "", address: data.address || "" });
      })
      .finally(() => setLoading(false));
  }, [user, token, router]);

  const setEdit = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setEditForm((p) => ({ ...p, [field]: e.target.value }));

  const setPass = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setPassForm((p) => ({ ...p, [field]: e.target.value }));

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.firstName.trim()) { toastError("First name is required."); return; }
    if (!editForm.lastName.trim()) { toastError("Last name is required."); return; }
    setSaving(true);
    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(editForm),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { toastError(data.error); return; }
    setProfile(data);
    success("Profile updated successfully! ✅");
    setTab("info");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/user/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(passForm),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { toastError(data.error); return; }
    success("Password changed successfully! 🔒");
    setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setTab("info");
  };

  if (loading) return (
    <div>
      <Navbar />
      <div className={profileStyles.loadingBox}>Loading profile...</div>
    </div>
  );

  return (
    <div style={{ background: "#f8f5fa", minHeight: "100vh" }}>
      <Navbar />

      <div className={profileStyles.wrapper}>
        {/* PROFILE HEADER */}
        <div className={profileStyles.profileHeader}>
          <div className={profileStyles.avatar}>
            {profile?.firstName?.[0]}{profile?.lastName?.[0]}
          </div>
          <div>
            <h1>{profile?.firstName} {profile?.lastName}</h1>
            <p>{profile?.email}</p>
            <span className={profileStyles.roleBadge}>
              {profile?.role === "admin" ? "👑 Admin" : "👤 Customer"}
            </span>
          </div>
        </div>

        {/* TABS */}
        <div className={profileStyles.tabs}>
          <button className={`${profileStyles.tab} ${tab === "info" ? profileStyles.tabActive : ""}`} onClick={() => setTab("info")}>
            📋 Account Info
          </button>
          <button className={`${profileStyles.tab} ${tab === "edit" ? profileStyles.tabActive : ""}`} onClick={() => setTab("edit")}>
            ✏️ Edit Profile
          </button>
          <button className={`${profileStyles.tab} ${tab === "password" ? profileStyles.tabActive : ""}`} onClick={() => setTab("password")}>
            🔒 Change Password
          </button>
        </div>

        <div className={profileStyles.card}>

          {/* TAB: ACCOUNT INFO */}
          {tab === "info" && (
            <div className={profileStyles.infoGrid}>
              <div className={profileStyles.infoItem}>
                <span className={profileStyles.infoLabel}>First Name</span>
                <span className={profileStyles.infoValue}>{profile?.firstName}</span>
              </div>
              <div className={profileStyles.infoItem}>
                <span className={profileStyles.infoLabel}>Last Name</span>
                <span className={profileStyles.infoValue}>{profile?.lastName}</span>
              </div>
              <div className={profileStyles.infoItem}>
                <span className={profileStyles.infoLabel}>Email Address</span>
                <span className={profileStyles.infoValue}>{profile?.email}</span>
              </div>
              <div className={profileStyles.infoItem}>
                <span className={profileStyles.infoLabel}>Phone Number</span>
                <span className={profileStyles.infoValue}>{profile?.phone || "—"}</span>
              </div>
              <div className={`${profileStyles.infoItem} ${profileStyles.infoFull}`}>
                <span className={profileStyles.infoLabel}>Delivery Address</span>
                <span className={profileStyles.infoValue}>{profile?.address || "—"}</span>
              </div>
              <div className={profileStyles.infoItem}>
                <span className={profileStyles.infoLabel}>Account Type</span>
                <span className={profileStyles.infoValue}>{profile?.role === "admin" ? "Administrator" : "Customer"}</span>
              </div>
              <div className={profileStyles.infoItem}>
                <span className={profileStyles.infoLabel}>Member Since</span>
                <span className={profileStyles.infoValue}>
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                </span>
              </div>
              <div className={`${profileStyles.infoItem} ${profileStyles.infoFull}`}>
                <Link href="/my-orders" className={profileStyles.ordersBtn}>📦 View My Orders</Link>
              </div>
            </div>
          )}

          {/* TAB: EDIT PROFILE */}
          {tab === "edit" && (
            <form onSubmit={handleEditSubmit} className={profileStyles.form}>
              <div className={profileStyles.formRow}>
                <div className={profileStyles.formGroup}>
                  <label>First Name</label>
                  <input type="text" value={editForm.firstName} onChange={setEdit("firstName")} placeholder="Juan" />
                </div>
                <div className={profileStyles.formGroup}>
                  <label>Last Name</label>
                  <input type="text" value={editForm.lastName} onChange={setEdit("lastName")} placeholder="Dela Cruz" />
                </div>
              </div>
              <div className={profileStyles.formGroup}>
                <label>Phone Number</label>
                <input type="tel" value={editForm.phone} onChange={setEdit("phone")} placeholder="09XX XXX XXXX" />
              </div>
              <div className={profileStyles.formGroup}>
                <label>Default Delivery Address</label>
                <textarea rows={3} value={editForm.address} onChange={setEdit("address")} placeholder="Street, Barangay, City" />
              </div>
              <div className={profileStyles.formActions}>
                <button type="button" className={profileStyles.cancelBtn} onClick={() => setTab("info")}>Cancel</button>
                <button type="submit" className={profileStyles.saveBtn} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {/* TAB: CHANGE PASSWORD */}
          {tab === "password" && (
            <form onSubmit={handlePasswordSubmit} className={profileStyles.form}>
              <div className={profileStyles.formGroup}>
                <label>Current Password</label>
                <div className={profileStyles.passWrapper}>
                  <input type={showPass.current ? "text" : "password"} value={passForm.currentPassword} onChange={setPass("currentPassword")} placeholder="Enter current password" />
                  <button type="button" className={profileStyles.eyeBtn} onClick={() => setShowPass((p) => ({ ...p, current: !p.current }))}>
                    {showPass.current ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              <div className={profileStyles.formGroup}>
                <label>New Password</label>
                <div className={profileStyles.passWrapper}>
                  <input type={showPass.new ? "text" : "password"} value={passForm.newPassword} onChange={setPass("newPassword")} placeholder="Minimum 8 characters" />
                  <button type="button" className={profileStyles.eyeBtn} onClick={() => setShowPass((p) => ({ ...p, new: !p.new }))}>
                    {showPass.new ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              <div className={profileStyles.formGroup}>
                <label>Confirm New Password</label>
                <div className={profileStyles.passWrapper}>
                  <input type={showPass.confirm ? "text" : "password"} value={passForm.confirmPassword} onChange={setPass("confirmPassword")} placeholder="Repeat new password" />
                  <button type="button" className={profileStyles.eyeBtn} onClick={() => setShowPass((p) => ({ ...p, confirm: !p.confirm }))}>
                    {showPass.confirm ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              <div className={profileStyles.formActions}>
                <button type="button" className={profileStyles.cancelBtn} onClick={() => setTab("info")}>Cancel</button>
                <button type="submit" className={profileStyles.saveBtn} disabled={saving}>
                  {saving ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
