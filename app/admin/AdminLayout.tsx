"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, PackageOpen, ShoppingBag, Globe, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import styles from "./admin.module.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const path = usePathname();

  const mainNav = [
    { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  ];

  const manageNav = [
    { href: "/admin/orders", label: "Manage Orders", icon: <PackageOpen size={18} /> },
    { href: "/admin/products", label: "Manage Products", icon: <ShoppingBag size={18} /> },
    { href: "/", label: "View Website", icon: <Globe size={18} /> },
  ];

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>🎋 Kzen's Admin</div>
        <nav className={styles.sidebarNav}>
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={path === item.href ? styles.navItemActive : styles.navItem}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <p className={styles.navLabel}>Manage</p>
        <nav className={styles.sidebarNav}>
          {manageNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={path === item.href ? styles.navItemActive : styles.navItem}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <p className={styles.adminName}>{user?.firstName} {user?.lastName}</p>
          <p className={styles.adminEmail}>{user?.email}</p>
          <button className={styles.logoutBtn} onClick={async () => { await logout(); router.push("/login"); }}>
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
