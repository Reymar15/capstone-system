"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./HeroCarousel.module.css";

const slides = [
  {
    img: "/hero.jpg",
    tag: "Our Signature",
    heading: "KZEN'S PUTO BUMBONG",
    sub: "Handcrafted Filipino purple rice cakes, made fresh daily with love and tradition.",
  },
  {
    img: "/classic.jpg",
    tag: "Classic Flavor",
    heading: "TASTE THE TRADITION",
    sub: "Premium purple glutinous rice steamed in authentic bamboo tubes, just like lola made.",
  },
  {
    img: "/deluxe.jpg",
    tag: "Special Deluxe",
    heading: "ELEVATED EVERY BITE",
    sub: "Topped with cheese, butter, and fresh coconut — a modern twist on a beloved classic.",
  },
  {
    img: "/hero.jpg",
    tag: "Order Today",
    heading: "FRESH. DAILY. YOURS.",
    sub: "Made to order, delivered with love. Experience the taste of Filipino heritage.",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (animating) return;
      setAnimating(true);
      setCurrent((index + slides.length) % slides.length);
      setTimeout(() => setAnimating(false), 700);
    },
    [animating]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className={styles.carousel}>
      {/* SLIDES */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`${styles.slide} ${i === current ? styles.active : ""}`}
        >
          <Image
            src={slide.img}
            alt={slide.heading}
            fill
            priority={i === 0}
            className={`${styles.slideImg} ${i === current ? styles.zoomIn : ""}`}
          />
          <div className={styles.overlay} />

          <div className={styles.content}>
            <span className={styles.tag}>{slide.tag}</span>
            <h1 className={styles.heading}>{slide.heading}</h1>
            <p className={styles.sub}>{slide.sub}</p>
            <div className={styles.buttons}>
              <Link href="/menu" className={styles.orderBtn}>Order Now</Link>
              <Link href="/about" className={styles.storyBtn}>Our Story</Link>
            </div>
          </div>
        </div>
      ))}

      {/* ARROWS */}
      <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={prev} aria-label="Previous">
        ‹
      </button>
      <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={next} aria-label="Next">
        ›
      </button>

      {/* DOTS */}
      <div className={styles.dots}>
        {slides.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === current ? styles.dotActive : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
