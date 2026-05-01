"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import styles from "../page.module.css";

const menuItems = [
  {
    name: "Classic Puto Bumbong",
    desc: "Traditional purple rice cake topped with butter, coconut and muscovado sugar.",
    price: 100,
    img: "/classic.jpg",
    category: "Classic",
    badge: "Best Seller",
    rating: "⭐⭐⭐⭐⭐",
  },
  {
    name: "Special Deluxe",
    desc: "Soft puto bumbong topped with cheese, butter and coconut.",
    price: 100,
    img: "/deluxe.jpg",
    category: "Special",
    badge: "Popular",
    rating: "⭐⭐⭐⭐⭐",
  },
  {
    name: "Cheese Overload",
    desc: "Extra generous cheese topping with butter and coconut flakes.",
    price: 120,
    img: "/classic.jpg",
    category: "Special",
    badge: null,
    rating: "⭐⭐⭐⭐",
  },
  {
    name: "Ube Swirl",
    desc: "Purple rice cake with ube halaya filling and coconut topping.",
    price: 130,
    img: "/deluxe.jpg",
    category: "Ube",
    badge: "New",
    rating: "⭐⭐⭐⭐⭐",
  },
  {
    name: "Latik Special",
    desc: "Topped with rich latik (coconut caramel) and muscovado sugar.",
    price: 115,
    img: "/classic.jpg",
    category: "Classic",
    badge: null,
    rating: "⭐⭐⭐⭐",
  },
  {
    name: "Party Tray (12 pcs)",
    desc: "Perfect for celebrations. Assorted flavors in one tray.",
    price: 550,
    img: "/deluxe.jpg",
    category: "Special",
    badge: "Great Value",
    rating: "⭐⭐⭐⭐⭐",
  },
];

const categories = ["All", "Classic", "Special", "Ube"];

export default function MenuPage() {
  const [active, setActive] = useState("All");
  const { addToCart, totalItems } = useCart();
  const router = useRouter();

  const filtered =
    active === "All" ? menuItems : menuItems.filter((i) => i.category === active);

  const handleOrder = (item: typeof menuItems[0]) => {
    addToCart({ name: item.name, price: item.price, img: item.img });
    router.push("/order");
  };

  return (
    <main>
      <nav className={styles.navbar}>
        <Link href="/" className={styles.logoLink}>
          <h2 className={styles.logo}>Puto Bumbong</h2>
        </Link>
        <ul className={styles.navLinks}>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/menu" className={styles.activeLink}>Menu</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/contact">Contact</Link></li>
          <li>
            <Link href="/order" className={styles.cartLink}>
              🛒 {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
            </Link>
          </li>
        </ul>
        <div className={styles.navAuth}>
          <Link href="/login" className={styles.loginBtn}>Login</Link>
          <Link href="/signup" className={styles.signupBtn}>Sign Up</Link>
        </div>
      </nav>

      <section className={styles.menuPage}>
        <h1>Our Menu</h1>
        <p>All items are made fresh daily using authentic ingredients.</p>

        <div className={styles.filters}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`${styles.filterBtn} ${active === cat ? styles.filterBtnActive : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className={styles.products}>
          {filtered.map((item) => (
            <div className={styles.card} key={item.name}>
              <div className={styles.imgWrapper}>
                <Image src={item.img} alt={item.name} fill className={styles.productImg} />
                {item.badge && <span className={styles.badge}>{item.badge}</span>}
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardRating}>{item.rating}</div>
                <h3>{item.name}</h3>
                <p>{item.desc}</p>
                <div className={styles.priceRow}>
                  <span>₱{item.price}</span>
                  <button className={styles.cartBtn} onClick={() => handleOrder(item)}>
                    🛒 Order Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div>
            <h3>Puto Bumbong</h3>
            <p>Authentic Filipino purple rice cakes made with love and tradition.</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <p><Link href="/" className={styles.footerLink}>Home</Link></p>
            <p><Link href="/menu" className={styles.footerLink}>Menu</Link></p>
            <p><Link href="/about" className={styles.footerLink}>About</Link></p>
            <p><Link href="/contact" className={styles.footerLink}>Contact</Link></p>
          </div>
          <div>
            <h4>Contact</h4>
            <p>📞 +63 912345678</p>
            <p>📧 kzen@example.com</p>
            <p>📍 Cebu City, Philippines</p>
          </div>
        </div>
        <div className={styles.copyright}>© 2025 Puto Bumbong. All rights reserved.</div>
      </footer>
    </main>
  );
}
