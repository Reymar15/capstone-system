"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import HeroCarousel from "./components/HeroCarousel";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
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
            <p>&quot;Best puto bumbong I&apos;ve ever tasted! Reminds me of my childhood in the province.&quot;</p>
            <h4>— Maria Santos</h4>
          </div>
          <div className={styles.testimonialCard}>
            <p>&quot;Fresh, authentic, and delivered on time. Highly recommend for any occasion!&quot;</p>
            <h4>— Juan Dela Cruz</h4>
          </div>
          <div className={styles.testimonialCard}>
            <p>&quot;The deluxe version with cheese is absolutely divine. Will order again!&quot;</p>
            <h4>— Ana Reyes</h4>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
