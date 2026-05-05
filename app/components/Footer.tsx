"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import styles from "./Footer.module.css";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        {/* BRAND */}
        <div className={styles.brand}>
          <div className={styles.brandLogo}>🍢</div>
          <h3>Kzen&apos;s Puto Bumbong</h3>
          <p>Authentic Filipino purple rice cakes handcrafted fresh daily with love and tradition in Cebu City.</p>
          <div className={styles.socials}>
            <a href="#" aria-label="Facebook" className={styles.socialBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="#" aria-label="Instagram" className={styles.socialBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div className={styles.col}>
          <h4>Quick Links</h4>
          <nav className={styles.links}>
            <Link href="/">Home</Link>
            <Link href="/menu">Menu</Link>
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/order">Order Now</Link>
          </nav>
        </div>

        {/* ACCOUNT */}
        <div className={styles.col}>
          <h4>Account</h4>
          <nav className={styles.links}>
            <Link href="/login">Login</Link>
            <Link href="/signup">Sign Up</Link>
            <Link href="/my-orders">My Orders</Link>
            <Link href="/profile">Profile</Link>
          </nav>
        </div>

        {/* CONTACT */}
        <div className={styles.col}>
          <h4>Contact Us</h4>
          <ul className={styles.contactList}>
            <li><Phone size={14} /><span>+63 912 345 678</span></li>
            <li><Mail size={14} /><span>kzen@example.com</span></li>
            <li><MapPin size={14} /><span>Cebu City, Philippines</span></li>
            <li><Clock size={14} /><span>Mon–Sun: 7:00 AM – 8:00 PM</span></li>
          </ul>
        </div>

      </div>

      <div className={styles.bottom}>
        <span>© {year} Kzen&apos;s Puto Bumbong. All rights reserved.</span>
        <span className={styles.bottomRight}>Made with ❤️ in Cebu</span>
      </div>
    </footer>
  );
}
