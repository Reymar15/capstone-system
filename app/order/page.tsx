"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import styles from "../page.module.css";
import orderStyles from "./order.module.css";

type PlacedOrder = {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  payment: string;
  notes: string;
  items: { name: string; price: number; qty: number; image: string }[];
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
};

const paymentLabel: Record<string, string> = {
  cod: "Cash on Delivery",
  gcash: "GCash",
  maya: "Maya",
};

export default function OrderPage() {
  const { cart, removeFromCart, updateQty, clearCart, totalPrice } = useCart();
  const { user, token } = useAuth();
  const { success, error: toastError, info } = useToast();
  const router = useRouter();
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ customerName: "", phone: "", address: "", payment: "", notes: "" });

  // Auto-fill delivery details from user profile
  useEffect(() => {
    if (!user || !token) return;
    fetch("/api/user/profile", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((profile) => {
        setForm((prev) => ({
          ...prev,
          customerName: `${profile.firstName} ${profile.lastName}`.trim(),
          phone: profile.phone || "",
          address: profile.address || "",
        }));
      })
      .catch(() => {});
  }, [user, token]);

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

    const data = await res.json();
    clearCart();
    success("Order placed! We'll prepare it fresh for you. 🎉");
    setPlacedOrder(data);
  };

  const handlePrint = () => window.print();

  return (
    <div>
      <Navbar />
      <div className={orderStyles.wrapper}>

        {/* ── RECEIPT ── */}
        {placedOrder ? (
          <div className={orderStyles.receiptWrapper}>
            {/* PRINT BUTTON (hidden on print) */}
            <div className={orderStyles.receiptActions}>
              <button className={orderStyles.printBtn} onClick={handlePrint}>🖨️ Print Receipt</button>
              <Link href="/my-orders" className={orderStyles.trackBtn}>📦 Track Order</Link>
              <Link href="/menu" className={orderStyles.orderAgainBtn}>🛒 Order Again</Link>
            </div>

            {/* RECEIPT CARD */}
            <div className={orderStyles.receipt} id="receipt">
              {/* HEADER */}
              <div className={orderStyles.receiptHeader}>
                <div className={orderStyles.receiptLogo}>🎋</div>
                <h2>Kzen's Puto Bumbong</h2>
                <p>Cebu City, Philippines</p>
                <p>📞 +63 912345678 | 📧 kzen@example.com</p>
              </div>

              <div className={orderStyles.receiptDivider} />

              {/* ORDER INFO */}
              <div className={orderStyles.receiptMeta}>
                <div className={orderStyles.receiptMetaItem}>
                  <span>Order No.</span>
                  <strong>#{placedOrder.id.slice(-8).toUpperCase()}</strong>
                </div>
                <div className={orderStyles.receiptMetaItem}>
                  <span>Date</span>
                  <strong>{new Date(placedOrder.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}</strong>
                </div>
                <div className={orderStyles.receiptMetaItem}>
                  <span>Time</span>
                  <strong>{new Date(placedOrder.createdAt).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}</strong>
                </div>
                <div className={orderStyles.receiptMetaItem}>
                  <span>Status</span>
                  <strong className={orderStyles.receiptStatus}>{placedOrder.status}</strong>
                </div>
              </div>

              <div className={orderStyles.receiptDivider} />

              {/* CUSTOMER INFO */}
              <div className={orderStyles.receiptSection}>
                <h4>Customer Details</h4>
                <div className={orderStyles.receiptRow}><span>Name</span><span>{placedOrder.customerName}</span></div>
                <div className={orderStyles.receiptRow}><span>Phone</span><span>{placedOrder.phone}</span></div>
                <div className={orderStyles.receiptRow}><span>Address</span><span>{placedOrder.address}</span></div>
                <div className={orderStyles.receiptRow}><span>Payment</span><span>{paymentLabel[placedOrder.payment] || placedOrder.payment}</span></div>
                {placedOrder.notes && <div className={orderStyles.receiptRow}><span>Notes</span><span>{placedOrder.notes}</span></div>}
              </div>

              <div className={orderStyles.receiptDivider} />

              {/* ITEMS */}
              <div className={orderStyles.receiptSection}>
                <h4>Order Items</h4>
                <div className={orderStyles.receiptItemsHeader}>
                  <span>Item</span><span>Qty</span><span>Price</span><span>Subtotal</span>
                </div>
                {placedOrder.items.map((item, i) => (
                  <div className={orderStyles.receiptItem} key={i}>
                    <span>{item.name}</span>
                    <span>x{item.qty}</span>
                    <span>₱{item.price}</span>
                    <span>₱{item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              <div className={orderStyles.receiptDivider} />

              {/* TOTAL */}
              <div className={orderStyles.receiptTotal}>
                <span>TOTAL AMOUNT</span>
                <span>₱{placedOrder.total}</span>
              </div>

              <div className={orderStyles.receiptDivider} />

              {/* PAYMENT STATUS */}
              <div className={orderStyles.receiptPayStatus}>
                <span>Payment Status:</span>
                <span className={placedOrder.paymentStatus === "Paid" ? orderStyles.paid : orderStyles.pending}>
                  {placedOrder.paymentStatus}
                </span>
              </div>

              {/* FOOTER */}
              <div className={orderStyles.receiptFooter}>
                <p>🎋 Thank you for ordering!</p>
                <p>Salamat sa imong suporta sa Kzen's Puto Bumbong.</p>
              </div>
            </div>
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
