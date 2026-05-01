"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import styles from "./admin.module.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const path = usePathname();

  const navItems = [
    { href: "/admin/dashboard", label: "📊 Dashboard" },
    { href: "/admin/orders", label: "📦 Orders" },
    { href: "/admin/products", label: "🍡 Products" },
    { href: "/", label: "🌐 View Site" },
  ];

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>🎋 Kzen's Admin</div>
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={path === item.href ? styles.navItemActive : styles.navItem}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <p className={styles.adminName}>{user?.firstName} {user?.lastName}</p>
          <p className={styles.adminEmail}>{user?.email}</p>
          <button className={styles.logoutBtn} onClick={async () => { await logout(); router.push("/login"); }}>
            🚪 Logout
          </button>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
