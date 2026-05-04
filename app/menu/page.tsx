"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import Navbar from "../components/Navbar";
import styles from "../page.module.css";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  available: boolean;
  badge?: string;
};

type ReviewSummary = { avg: number; count: number };

const categories = ["All", "Classic", "Special", "Ube"];

function StarDisplay({ avg, count }: { avg: number; count: number }) {
  const full = Math.floor(avg);
  const half = avg - full >= 0.5;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
      <span style={{ color: "#f59e0b", fontSize: "0.9rem", letterSpacing: 1 }}>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} style={{ opacity: i < full ? 1 : i === full && half ? 0.6 : 0.2 }}>★</span>
        ))}
      </span>
      <span style={{ fontSize: "0.78rem", color: "#9ca3af", fontWeight: 500 }}>
        {count > 0 ? `${avg.toFixed(1)} (${count})` : "No reviews yet"}
      </span>
    </div>
  );
}

export default function MenuPage() {
  const [active, setActive] = useState("All");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [reviewMap, setReviewMap] = useState<Record<string, ReviewSummary>>({});
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { success, warning } = useToast();

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/reviews").then((r) => r.json()),
    ]).then(([prods, reviews]) => {
      setProducts(Array.isArray(prods) ? prods : []);
      if (Array.isArray(reviews)) {
        const map: Record<string, ReviewSummary> = {};
        for (const r of reviews) {
          const key = r.productName?.split(",")[0]?.trim() || "";
          if (!key) continue;
          if (!map[key]) map[key] = { avg: 0, count: 0 };
          map[key].count += 1;
          map[key].avg += r.rating;
        }
        for (const k of Object.keys(map)) map[k].avg = map[k].avg / map[k].count;
        setReviewMap(map);
      }
    }).finally(() => setLoading(false));
  }, []);

  const filtered = (active === "All" ? products : products.filter((p) => p.category === active))
    .filter((p) =>
      search.trim() === "" ||
      p.name.toLowerCase().includes(search.toLowerCase())
    );

  const handleAddToCart = (item: Product) => {
    if (!item.available) {
      warning(`"${item.name}" is currently unavailable.`);
      return;
    }
    addToCart({ name: item.name, price: item.price, img: item.image });
    success(`"${item.name}" added to cart! 🛒`);
  };

  return (
    <main>
      <Navbar />

      <section className={styles.menuPage}>
        <h1>Our Menu</h1>
        <p>All items are made fresh daily using authentic ingredients.</p>

        {/* SEARCH BAR */}
        <div className={styles.menuSearch}>
          <span className={styles.menuSearchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.menuSearchClear} onClick={() => setSearch("")}>✕</button>
          )}
        </div>

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

        {loading ? (
          <p style={{ textAlign: "center", color: "#9ca3af", padding: "60px 0" }}>Loading menu...</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontSize: "1.1rem", color: "#9ca3af", marginBottom: 12 }}>
              {search ? `No products found for "${search}"` : "No products available."}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{ padding: "8px 20px", borderRadius: 8, border: "1.5px solid #e9d5ff", background: "white", color: "#7b1fa2", fontWeight: 600, cursor: "pointer" }}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className={styles.products}>
            {filtered.map((item) => (
              <div
                className={`${styles.card} ${!item.available ? styles.cardUnavailable : ""}`}
                key={item.id}
              >
                <div className={styles.imgWrapper}>
                  <Image src={item.image} alt={item.name} fill className={styles.productImg} />
                  {item.badge && <span className={styles.badge}>{item.badge}</span>}

                  {/* AVAILABILITY BADGE */}
                  <span className={`${styles.availBadge} ${item.available ? styles.availBadgeGreen : styles.availBadgeRed}`}>
                    {item.available ? "✅ Available" : "❌ Unavailable"}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <StarDisplay avg={reviewMap[item.name]?.avg || 0} count={reviewMap[item.name]?.count || 0} />
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>

                  {/* STOCK INFO */}
                  <p className={`${styles.stockInfo} ${item.stock <= 5 ? styles.stockLow : styles.stockOk}`}>
                    {item.available ? `${item.stock} pcs available` : "Out of stock"}
                  </p>

                  <div className={styles.priceRow}>
                    <span>₱{item.price}</span>
                    <button
                      className={`${styles.cartBtn} ${!item.available ? styles.cartBtnDisabled : ""}`}
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.available}
                    >
                      {item.available ? "🛒 Add to Cart" : "Unavailable"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
