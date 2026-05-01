import Link from "next/link";
import styles from "../page.module.css";

export default function ContactPage() {
  return (
    <main>
      <nav className={styles.navbar}>
        <Link href="/" className={styles.logoLink}>
          <h2 className={styles.logo}>Puto Bumbong</h2>
        </Link>
        <ul className={styles.navLinks}>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/menu">Menu</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/contact" className={styles.activeLink}>Contact</Link></li>
          <li>🛒</li>
        </ul>
        <div className={styles.navAuth}>
          <Link href="/login" className={styles.loginBtn}>Login</Link>
          <Link href="/signup" className={styles.signupBtn}>Sign Up</Link>
        </div>
      </nav>

      <section className={styles.contactPage}>
        <div className={styles.contactHero}>
          <h1>Contact Us</h1>
          <p>We'd love to hear from you. Send us a message!</p>
        </div>

        <div className={styles.contactLayout}>
          <div className={styles.contactInfo}>
            <h2>Get in Touch</h2>
            <div className={styles.contactItem}>
              <span>📞</span>
              <div>
                <h4>Phone</h4>
                <p>+63 912345678</p>
              </div>
            </div>
            <div className={styles.contactItem}>
              <span>📧</span>
              <div>
                <h4>Email</h4>
                <p>kzen@example.com</p>
              </div>
            </div>
            <div className={styles.contactItem}>
              <span>📍</span>
              <div>
                <h4>Address</h4>
                <p>Cebu City, Philippines</p>
              </div>
            </div>
            <div className={styles.contactItem}>
              <span>🕐</span>
              <div>
                <h4>Hours</h4>
                <p>Mon–Sun: 7:00 AM – 8:00 PM</p>
              </div>
            </div>
          </div>

          <form className={styles.contactForm}>
            <h2>Send a Message</h2>
            <div className={styles.formGroup}>
              <label>Full Name</label>
              <input type="text" placeholder="Your full name" />
            </div>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input type="email" placeholder="your@email.com" />
            </div>
            <div className={styles.formGroup}>
              <label>Phone</label>
              <input type="tel" placeholder="+63 9XX XXX XXXX" />
            </div>
            <div className={styles.formGroup}>
              <label>Message</label>
              <textarea rows={5} placeholder="Write your message here..." />
            </div>
            <button type="submit" className={styles.orderBtn}>Send Message</button>
          </form>
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
