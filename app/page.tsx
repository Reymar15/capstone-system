import Image from "next/image";

export default function Home() {
  return (
    <main>

      {/* NAVBAR */}
      <nav className="navbar">
        <h2 className="logo">Puto Bumbong</h2>

        <ul className="nav-links">
          <li>Home</li>
          <li>Menu</li>
          <li>About</li>
          <li>Contact</li>
          <li>🛒</li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="hero">

        <Image
          src="/hero.jpg"
          alt="Puto Bumbong"
          fill
          priority
          className="hero-img"
        />

        <div className="hero-overlay">
          <h1>KZEN'S PUTO BUMBONG</h1>

          <p>
            Handcrafted Filipino purple rice cakes, made fresh daily with love
            and tradition.
          </p>

          <div className="hero-buttons">
            <button className="order-btn">Order Now</button>
            <button className="story-btn">Our Story</button>
          </div>
        </div>

      </section>

      {/* BEST SELLERS */}
      <section className="best">

        <h2>Our Best Sellers</h2>
        <p>Try our most loved puto bumbong varieties, perfected over generations.</p>

        <div className="products">

          <div className="card">
            <Image
              src="/classic.jpg"
              alt="Classic"
              width={300}
              height={200}
              className="product-img"
            />

            <h3>Classic Puto Bumbong</h3>

            <p>
              Traditional purple rice cake topped with butter,
              coconut and muscovado sugar.
            </p>

            <div className="price-row">
              <span>₱100</span>
              <button className="cart-btn">Add to cart</button>
            </div>
          </div>


          <div className="card">
            <Image
              src="/deluxe.jpg"
              alt="Deluxe"
              width={300}
              height={200}
              className="product-img"
            />

            <h3>Special Deluxe</h3>

            <p>
              Soft puto bumbong topped with cheese,
              butter and coconut.
            </p>

            <div className="price-row">
              <span>₱100</span>
              <button className="cart-btn">Add to cart</button>
            </div>
          </div>

        </div>

        <button className="menu-btn">View Full Menu</button>

      </section>

      {/* FOOTER */}
      <footer className="footer">

        <div className="footer-grid">

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

        <div className="copyright">
          © 2025 Puto Bumbong. All rights reserved.
        </div>

      </footer>

    </main>
  );
}