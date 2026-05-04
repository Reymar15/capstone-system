"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import HeroCarousel from "./components/HeroCarousel";
import Navbar from "./components/Navbar";
import { useCart } from "./context/CartContext";
import { useToast } from "./context/ToastContext";

const bestSellers = [
  {
    name: "Classic Puto Bumbong",
    desc: "Traditional purple rice cake topped with butter, coconut and muscovado sugar.",
    price: 100,
    img: "/classic.jpg",
    badge: "Best Seller",
  },
  {
    name: "Special Deluxe",
    desc: "Soft puto bumbong topped with cheese, butter and coconut.",
    price: 100,
    img: "/deluxe.jpg",
    badge: "Popular",
  },
];

export default function Home() {
  const { addToCart } = useCart();
  const { success } = useToast();

  const handleAddToCart = (item: { name: string; price: number; img: string }) => {
    addToCart(item);
    success(`"${item.name}" added to cart! 🛒`);
  };

  return (
    <main>
      <Navbar />

      {/* HERO CAROUSEL */}
      <HeroCarousel />

      {/* BEST SELLERS */}
      <section className={styles.best}>
        <h2>Our Best Sellers</h2>
        <p>Try our most loved puto bumbong varieties, perfected over generations.</p>

        <div className={styles.products}>
          {bestSellers.map((item) => (
            <div className={styles.card} key={item.name}>
              <div className={styles.imgWrapper}>
                <Image src={item.img} alt={item.name} fill className={styles.productImg} />
                <span className={styles.badge}>{item.badge}</span>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardRating}>⭐⭐⭐⭐⭐</div>
                <h3>{item.name}</h3>
                <p>{item.desc}</p>
                <div className={styles.priceRow}>
                  <span>₱{item.price}</span>
                  <button className={styles.cartBtn} onClick={() => handleAddToCart(item)}>
                    🛒 Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Link href="/menu" className={styles.menuBtn}>View Full Menu</Link>
      </section>

      {/* TESTIMONIALS */}
      <section className={styles.testimonials}>
        <h2>What Our Customers Say</h2>
        <div className={styles.testimonialGrid}>
          <div className={styles.testimonialCard}>
            <p>"Best puto bumbong I've ever tasted! Reminds me of my childhood in the province."</p>
            <h4>— Maria Santos</h4>
          </div>
          <div className={styles.testimonialCard}>
            <p>"Fresh, authentic, and delivered on time. Highly recommend for any occasion!"</p>
            <h4>— Juan Dela Cruz</h4>
          </div>
          <div className={styles.testimonialCard}>
            <p>"The deluxe version with cheese is absolutely divine. Will order again!"</p>
            <h4>— Ana Reyes</h4>
          </div>
        </div>
      </section>

      {/* FOOTER */}
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
