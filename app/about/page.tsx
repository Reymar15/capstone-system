import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";

export default function AboutPage() {
  return (
    <main>
      <nav className={styles.navbar}>
        <Link href="/" className={styles.logoLink}>
          <h2 className={styles.logo}>Puto Bumbong</h2>
        </Link>
        <ul className={styles.navLinks}>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/menu">Menu</Link></li>
          <li><Link href="/about" className={styles.activeLink}>About</Link></li>
          <li><Link href="/contact">Contact</Link></li>
          <li>🛒</li>
        </ul>
        <div className={styles.navAuth}>
          <Link href="/login" className={styles.loginBtn}>Login</Link>
          <Link href="/signup" className={styles.signupBtn}>Sign Up</Link>
        </div>
      </nav>

      <section className={styles.aboutPage}>

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
            <p>
              What began as a small Christmas tradition has grown into a year-round celebration of Filipino
              heritage. We are proud to share this piece of our culture with every customer.
            </p>
          </div>
          <div className={styles.aboutImageBox}>
            <Image
              src="/hero.jpg"
              alt="Our Story"
              width={480}
              height={340}
              className={styles.aboutImg}
            />
          </div>
        </div>

        <div className={styles.valuesGrid}>
          <div className={styles.valueCard}>
            <span>🌾</span>
            <h3>Authentic Ingredients</h3>
            <p>We use only premium purple glutinous rice and fresh coconut, sourced locally.</p>
          </div>
          <div className={styles.valueCard}>
            <span>🎋</span>
            <h3>Traditional Method</h3>
            <p>Steamed in real bamboo tubes the old-fashioned way — no shortcuts, ever.</p>
          </div>
          <div className={styles.valueCard}>
            <span>❤️</span>
            <h3>Made with Love</h3>
            <p>Every order is prepared fresh with care, just like home cooking.</p>
          </div>
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
