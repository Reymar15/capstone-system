"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";
import orderStyles from "./order.module.css";

export default function OrderPage() {
  const { cart, removeFromCart, updateQty, clearCart, totalPrice } = useCart();
  const { user, token } = useAuth();
  const { success, error: toastError, info } = useToast();
  const router = useRouter();
  const [placed, setPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ customerName: "", phone: "", address: "", payment: "", notes: "" });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push("/login"); return; }
    setLoading(true);
    setError("");

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...form,
        items: cart.map((i) => ({ productId: i.name, name: i.name, price: i.price, qty: i.qty, image: i.img })),
        total: totalPrice,
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      const msg = data.error || "Failed to place order. Please try again.";
      setError(msg);
      toastError(msg);
      return;
    }
    clearCart();
    success("Order placed! We'll prepare it fresh for you. 🎉");
    setPlaced(true);
  };

  return (
    <div>
      <nav className={styles.navbar}>
        <Link href="/" className={styles.logoLink}>
          <h2 className={styles.logo}>Puto Bumbong</h2>
        </Link>
        <ul className={styles.navLinks}>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/menu">Menu</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
        <div className={styles.navAuth}>
          {user ? (
            <span className={styles.signupBtn}>Hi, {user.firstName}!</span>
          ) : (
            <>
              <Link href="/login" className={styles.loginBtn}>Login</Link>
              <Link href="/signup" className={styles.signupBtn}>Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      <div className={orderStyles.wrapper}>
        {placed ? (
          <div className={orderStyles.successBox}>
            <div className={orderStyles.successIcon}>🎉</div>
            <h2>Order Placed!</h2>
            <p>Salamat! Your order has been received. We'll prepare it fresh for you.</p>
            {user && <Link href="/my-orders" className={orderStyles.backBtn}>Track My Order</Link>}
            <Link href="/menu" className={orderStyles.backBtn} style={{ marginLeft: 12 }}>Order Again</Link>
          </div>
        ) : (
          <>
            <h1 className={orderStyles.pageTitle}>Your Order</h1>
            {!user && (
              <div className={orderStyles.loginNotice}>
                <p>Please <Link href="/login">login</Link> or <Link href="/signup">sign up</Link> to place an order.</p>
              </div>
            )}
            {cart.length === 0 ? (
              <div className={orderStyles.emptyBox}>
                <p>🛒 Your cart is empty.</p>
                <Link href="/menu" className={orderStyles.backBtn}>Browse Menu</Link>
              </div>
            ) : (
              <div className={orderStyles.layout}>
                {/* ORDER SUMMARY */}
                <div className={orderStyles.summary}>
                  <h2>Order Summary</h2>
                  {cart.map((item) => (
                    <div className={orderStyles.cartItem} key={item.name}>
                      <div className={orderStyles.cartImg}>
                        <Image src={item.img} alt={item.name} fill style={{ objectFit: "cover" }} />
                      </div>
                      <div className={orderStyles.cartInfo}>
                        <h4>{item.name}</h4>
                        <p>₱{item.price} each</p>
                        <div className={orderStyles.qtyRow}>
                          <button onClick={() => updateQty(item.name, item.qty - 1)}>−</button>
                          <span>{item.qty}</span>
                          <button onClick={() => updateQty(item.name, item.qty + 1)}>+</button>
                        </div>
                      </div>
                      <div className={orderStyles.cartRight}>
                        <span className={orderStyles.itemTotal}>₱{item.price * item.qty}</span>
                        <button className={orderStyles.removeBtn} onClick={() => { removeFromCart(item.name); info(`"${item.name}" removed from order.`); }}>✕</button>
                      </div>
                    </div>
                  ))}
                  <div className={orderStyles.totalRow}>
                    <span>Total</span>
                    <span className={orderStyles.totalPrice}>₱{totalPrice}</span>
                  </div>
                </div>

                {/* CHECKOUT FORM */}
                <form className={orderStyles.form} onSubmit={handleSubmit}>
                  <h2>Delivery Details</h2>
                  {error && <div className={orderStyles.errorBox}>{error}</div>}
                  <div className={orderStyles.formGroup}>
                    <label>Full Name</label>
                    <input type="text" placeholder="Juan Dela Cruz" value={form.customerName} onChange={set("customerName")} required />
                  </div>
                  <div className={orderStyles.formGroup}>
                    <label>Phone Number</label>
                    <input type="tel" placeholder="+63 9XX XXX XXXX" value={form.phone} onChange={set("phone")} required />
                  </div>
                  <div className={orderStyles.formGroup}>
                    <label>Delivery Address</label>
                    <textarea rows={3} placeholder="Street, Barangay, City" value={form.address} onChange={set("address")} required />
                  </div>
                  <div className={orderStyles.formGroup}>
                    <label>Payment Method</label>
                    <select value={form.payment} onChange={set("payment")} required>
                      <option value="">Select payment</option>
                      <option value="cod">Cash on Delivery</option>
                      <option value="gcash">GCash (Simulation)</option>
                      <option value="maya">Maya (Simulation)</option>
                    </select>
                  </div>
                  <div className={orderStyles.formGroup}>
                    <label>Notes (optional)</label>
                    <textarea rows={2} placeholder="Special instructions..." value={form.notes} onChange={set("notes")} />
                  </div>
                  <button type="submit" className={orderStyles.submitBtn} disabled={loading || !user}>
                    {loading ? "Placing order..." : `Place Order · ₱${totalPrice}`}
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
