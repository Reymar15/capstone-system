"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
        <h2 className={styles.logo}>Puto Bumbong</h2>
      </Link>

      <ul className={styles.navLinks}>
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={path === link.href ? styles.activeLink : ""}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className={styles.navRight}>
        {/* CART ICON */}
        <Link href="/order" className={styles.cartLink}>
          🛒
          {totalItems > 0 && (
            <span className={styles.cartBadge}>{totalItems}</span>
          )}
        </Link>

        {/* AUTH */}
        {user ? (
          <div className={styles.userMenu}>
            <span className={styles.userName}>Hi, {user.firstName}!</span>
            {user.role === "admin" && (
              <Link href="/admin/dashboard" className={styles.loginBtn}>
                Dashboard
              </Link>
            )}
            {user.role === "customer" && (
              <Link href="/my-orders" className={styles.loginBtn}>
                My Orders
              </Link>
            )}
            {user.role === "customer" && (
              <Link href="/profile" className={styles.loginBtn}>
                Profile
              </Link>
            )}
            <button className={styles.logoutNavBtn} onClick={handleLogout}>
              Logout
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
