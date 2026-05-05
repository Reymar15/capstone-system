import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "../page.module.css";

export default function AboutPage() {
  return (
    <main>
      <Navbar />

      <section className={styles.aboutPage}>
        <div className={styles.aboutHero}>
          <h1>About Us</h1>
          <p>The story behind every bamboo tube of love.</p>
        </div>

        <div className={styles.aboutContent}>
          <div className={styles.aboutText}>
            <h2>Our Story</h2>
            <p>
              Kzen&apos;s Puto Bumbong started as a family tradition passed down through generations in Cebu.
              Every piece is handcrafted using authentic bamboo tubes and premium purple glutinous rice,
              steamed to perfection just like our lola used to make.
            </p>
            <p>
              We believe food is more than nourishment — it&apos;s a connection to culture, memory, and love.
              That&apos;s why every order is made fresh, with no shortcuts.
            </p>
            <p>
              What began as a small Christmas tradition has grown into a year-round celebration of Filipino
              heritage. We are proud to share this piece of our culture with every customer.
            </p>
          </div>
          <div className={styles.aboutImageBox}>
            <Image src="/hero.jpg" alt="Our Story" fill className={styles.aboutImg} />
          </div>
        </div>

        <div style={{ background: "#f8f5fa", padding: "56px 24px" }}>
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
        </div>
      </section>

      <Footer />
    </main>
  );
}
