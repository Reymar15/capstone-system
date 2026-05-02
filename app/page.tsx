import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main>

      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <Link href="/" className={styles.logoLink}>
          <h2 className={styles.logo}>Puto Bumbong</h2>
        </Link>
        <ul className={styles.navLinks}>
          <li><Link href="/" className={styles.activeLink}>Home</Link></li>
          <li><Link href="/menu">Menu</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/contact">Contact</Link></li>
          <li>🛒</li>
        </ul>
        <div className={styles.navAuth}>
          <Link href="/login" className={styles.loginBtn}>Login</Link>
          <Link href="/signup" className={styles.signupBtn}>Sign Up</Link>
        </div>
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
            <Link href="/menu" className={styles.orderBtn}>Order Now</Link>
            <Link href="/about" className={styles.storyBtn}>Our Story</Link>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className={styles.about}>
        <div className={styles.aboutContent}>
          <div className={styles.aboutText}>
            <h2>Our Story</h2>
            <p>
              Kzen's Puto Bumbong started as a family tradition passed down through generations in Cebu.
              Every piece is handcrafted using authentic bamboo tubes and premium purple glutinous rice,
              steamed to perfection just like our lola used to make.
            </p>
            <p>
              We believe food is more than nourishment — it's a connection to culture, memory, and love.
              That's why every order is made fresh, with no shortcuts.
            </p>
            <Link href="/menu" className={styles.orderBtn}>Order Now</Link>
          </div>
          <div className={styles.aboutImageBox}>
            <Image
              src="/classic.jpg"
              alt="Our Story"
              fill
              className={styles.aboutImg}
            />
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className={styles.best}>

        <h2>Our Best Sellers</h2>
        <p>Try our most loved puto bumbong varieties, perfected over generations.</p>

        <div className={styles.products}>

          <div className={styles.card}>
            <div className={styles.imgWrapper}>
              <Image
                src="/classic.jpg"
                alt="Classic"
                fill
                className={styles.productImg}
              />
              <span className={styles.badge}>Best Seller</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardRating}>⭐⭐⭐⭐⭐</div>
              <h3>Classic Puto Bumbong</h3>
              <p>Traditional purple rice cake topped with butter, coconut and muscovado sugar.</p>
              <div className={styles.priceRow}>
                <span>₱100</span>
                <button className={styles.cartBtn}>🛒 Add to Cart</button>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.imgWrapper}>
              <Image
                src="/deluxe.jpg"
                alt="Deluxe"
                fill
                className={styles.productImg}
              />
              <span className={styles.badge}>Popular</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardRating}>⭐⭐⭐⭐⭐</div>
              <h3>Special Deluxe</h3>
              <p>Soft puto bumbong topped with cheese, butter and coconut.</p>
              <div className={styles.priceRow}>
                <span>₱100</span>
                <button className={styles.cartBtn}>🛒 Add to Cart</button>
              </div>
            </div>
          </div>

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