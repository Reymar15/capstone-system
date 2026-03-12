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

<style jsx>{`
*{
margin:0;
padding:0;
box-sizing:border-box;
font-family:Arial, Helvetica, sans-serif;
}

.navbar{
display:flex;
justify-content:space-between;
align-items:center;
padding:18px 60px;
background:white;
}

.logo{
color:#c2188b;
}

.nav-links{
display:flex;
gap:20px;
list-style:none;
cursor:pointer;
}

.hero{
position:relative;
height:85vh;
display:flex;
align-items:center;
justify-content:center;
text-align:center;
color:white;
}

.hero-img{
object-fit:cover;
z-index:-1;
}

.hero-overlay{
background:rgba(0,0,0,0.3);
padding:40px;
border-radius:10px;
}

.hero h1{
font-size:52px;
margin-bottom:10px;
letter-spacing:2px;
}

.hero p{
max-width:600px;
margin:auto;
margin-bottom:20px;
}

.hero-buttons button{
padding:10px 22px;
border:none;
margin:5px;
cursor:pointer;
}

.order-btn{
background:#7b1fa2;
color:white;
}

.story-btn{
background:#6d6d6d;
color:white;
}

.best{
padding:70px;
text-align:center;
background:#f2f2f2;
}

.best h2{
font-size:36px;
margin-bottom:5px;
}

.products{
display:flex;
justify-content:center;
gap:40px;
margin-top:40px;
flex-wrap:wrap;
}

.card{
background:white;
padding:20px;
width:270px;
border-radius:12px;
box-shadow:0 5px 10px rgba(0,0,0,0.1);
text-align:center;
}

.product-img{
width:100%;
height:200px;
object-fit:cover;
border-radius:8px;
}

.card h3{
margin-top:10px;
}

.card p{
font-size:14px;
margin-top:5px;
}

.price-row{
display:flex;
justify-content:space-between;
align-items:center;
margin-top:15px;
}

.cart-btn{
background:#7b1fa2;
color:white;
border:none;
padding:6px 12px;
cursor:pointer;
}

.menu-btn{
margin-top:25px;
padding:10px 20px;
cursor:pointer;
}

.footer{
background:linear-gradient(90deg,#6a1b9a,#8e24aa);
color:white;
padding:40px 60px;
margin-top:40px;
}

.footer-grid{
display:flex;
justify-content:space-between;
flex-wrap:wrap;
gap:40px;
}

.footer h3, .footer h4{
margin-bottom:10px;
}

.copyright{
text-align:center;
margin-top:30px;
font-size:14px;
opacity:0.8;
}
`}</style>

    </main>
  );
}