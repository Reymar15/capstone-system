import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main>

      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <h2 className={styles.logo}>Puto Bumbong</h2>

        <ul className={styles.navLinks}>
          <li>Home</li>
          <li>Menu</li>
          <li>About</li>
          <li>Contact</li>
          <li>🛒</li>
        </ul>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <Image
          src="/hero.jpg"
          alt="Puto Bumbong"
          fill
          priority
          className={styles.heroImg}
        />

        <div className={styles.heroOverlay}>
          <h1>KZEN'S PUTO BUMBONG</h1>

          <p>
            Handcrafted Filipino purple rice cakes, made fresh daily with love
            and tradition.
          </p>

          <div className={styles.heroButtons}>
            <button className={styles.orderBtn}>Order Now</button>
            <button className={styles.storyBtn}>Our Story</button>
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className={styles.best}>

        <h2>Our Best Sellers</h2>
        <p>Try our most loved puto bumbong varieties, perfected over generations.</p>

        <div className={styles.products}>

          <div className={styles.card}>
            <Image
              src="/classic.jpg"
              alt="Classic"
              width={300}
              height={200}
              className={styles.productImg}
            />

            <h3>Classic Puto Bumbong</h3>

            <p>
              Traditional purple rice cake topped with butter,
              coconut and muscovado sugar.
            </p>

            <div className={styles.priceRow}>
              <span>₱100</span>
              <button className={styles.cartBtn}>Add to cart</button>
            </div>
          </div>

          <div className={styles.card}>
            <Image
              src="/deluxe.jpg"
              alt="Deluxe"
              width={300}
              height={200}
              className={styles.productImg}
            />

            <h3>Special Deluxe</h3>

            <p>
              Soft puto bumbong topped with cheese,
              butter and coconut.
            </p>

            <div className={styles.priceRow}>
              <span>₱100</span>
              <button className={styles.cartBtn}>Add to cart</button>
            </div>
          </div>

        </div>

        <button className={styles.menuBtn}>View Full Menu</button>

      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>

        <div className={styles.footerGrid}>

          <div>
            <h3>Puto Bumbong</h3>
            <p>
              Authentic Filipino purple rice cakes made with love and tradition.
            </p>
          </div>

          <div>
            <h4>Quick Links</h4>
            <p>Home</p>
            <p>Menu</p>
            <p>About</p>
            <p>Contact</p>
          </div>

          <div>
            <h4>Contact</h4>
            <p>📞 +63 912345678</p>
            <p>📧 kzen@example.com</p>
            <p>📍 Cebu City, Philippines</p>
          </div>

        </div>

        <div className={styles.copyright}>
          © 2025 Puto Bumbong. All rights reserved.
        </div>

      </footer>

    </main>
  );
}