"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../page.module.css";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (!form.phone.trim()) e.phone = "Phone number is required.";
    if (!form.message.trim()) e.message = "Message is required.";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitted(true);
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  return (
    <main>
      <section className={styles.contactPage}>
        <div className={styles.contactHero}>
          <h1>Contact Us</h1>
          <p>We&apos;d love to hear from you. Send us a message!</p>
        </div>

        <div className={styles.contactLayout}>
          <div className={styles.contactInfo}>
            <h2>Get in Touch</h2>
            <div className={styles.contactItem}>
              <span>📞</span>
              <div><h4>Phone</h4><p>+63 912345678</p></div>
            </div>
            <div className={styles.contactItem}>
              <span>📧</span>
              <div><h4>Email</h4><p>kzen@example.com</p></div>
            </div>
            <div className={styles.contactItem}>
              <span>📍</span>
              <div><h4>Address</h4><p>Cebu City, Philippines</p></div>
            </div>
            <div className={styles.contactItem}>
              <span>🕐</span>
              <div><h4>Hours</h4><p>Mon–Sun: 7:00 AM – 8:00 PM</p></div>
            </div>
          </div>

          {submitted ? (
            <div className={styles.contactForm} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <span style={{ fontSize: "3rem" }}>✅</span>
              <h2 style={{ color: "#7b1fa2", margin: 0 }}>Message Sent!</h2>
              <p style={{ color: "#6b7280", textAlign: "center" }}>Thank you for reaching out. We&apos;ll get back to you soon.</p>
              <button className={styles.orderBtn} onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", message: "" }); }}>
                Send Another
              </button>
            </div>
          ) : (
            <form className={styles.contactForm} onSubmit={handleSubmit} noValidate>
              <h2>Send a Message</h2>
              <div className={styles.formGroup}>
                <label>Full Name <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="text" placeholder="Your full name" value={form.name} onChange={set("name")} />
                {errors.name && <span style={{ color: "#ef4444", fontSize: "0.8rem" }}>{errors.name}</span>}
              </div>
              <div className={styles.formGroup}>
                <label>Email <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="email" placeholder="your@email.com" value={form.email} onChange={set("email")} />
                {errors.email && <span style={{ color: "#ef4444", fontSize: "0.8rem" }}>{errors.email}</span>}
              </div>
              <div className={styles.formGroup}>
                <label>Phone <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="tel" placeholder="+63 9XX XXX XXXX" value={form.phone} onChange={set("phone")} />
                {errors.phone && <span style={{ color: "#ef4444", fontSize: "0.8rem" }}>{errors.phone}</span>}
              </div>
              <div className={styles.formGroup}>
                <label>Message <span style={{ color: "#ef4444" }}>*</span></label>
                <textarea rows={5} placeholder="Write your message here..." value={form.message} onChange={set("message")} />
                {errors.message && <span style={{ color: "#ef4444", fontSize: "0.8rem" }}>{errors.message}</span>}
              </div>
              <button type="submit" className={styles.orderBtn}>Send Message</button>
            </form>
          )}
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
