"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, LayoutDashboard, ClipboardList, UserCircle, LogOut, MessageCircle } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import styles from "../page.module.css";

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();
  const path = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Menu" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logoLink}>
        <span className={styles.logo}>🍢 Puto Bumbong</span>
      </Link>

      <ul className={styles.navLinks}>
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={path === link.href ? styles.activeLink : ""}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className={styles.navRight}>
        <Link href="/order" className={styles.cartLink} title="Cart">
          <ShoppingCart size={20} />
          {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
        </Link>

        {user ? (
          <div className={styles.userMenu}>
            <span className={styles.userName}>Hi, {user.firstName}!</span>
            {user.role === "admin" && (
              <Link href="/admin/dashboard" className={styles.iconBtn} title="Dashboard">
                <LayoutDashboard size={18} />
              </Link>
            )}
            {user.role === "customer" && (
              <Link href="/my-orders" className={styles.iconBtn} title="My Orders">
                <ClipboardList size={18} />
              </Link>
            )}
            {user.role === "customer" && (
              <Link href="/profile" className={styles.iconBtn} title="Profile">
                <UserCircle size={18} />
              </Link>
            )}
            {user.role === "customer" && (
              <Link href="/messages" className={styles.iconBtn} title="Messages">
                <MessageCircle size={18} />
              </Link>
            )}
            <button className={styles.logoutNavBtn} onClick={handleLogout} title="Logout">
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className={styles.navAuth}>
            <Link href="/login" className={styles.loginBtn}>Login</Link>
            <Link href="/signup" className={styles.signupBtn}>Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
