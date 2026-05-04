"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import styles from "./contact.module.css";

type Message = {
  id: number;
  from: "user" | "support";
  text: string;
  time: string;
};

const AUTO_REPLIES: Record<string, string> = {
  default: "Thanks for reaching out! 😊 Our team will get back to you shortly. For urgent concerns, call us at +63 912345678.",
  order: "For order concerns, please check your order status in My Orders. If there's an issue, we'll resolve it ASAP!",
  delivery: "Delivery usually takes 30–60 minutes depending on your location. We'll notify you when your order is on the way!",
  menu: "You can browse our full menu at the Menu page. We have Classic, Special Deluxe, and more! 🍢",
  hours: "We're open Mon–Sun, 7:00 AM – 8:00 PM. Orders placed after hours will be processed the next morning.",
  payment: "We accept Cash on Delivery, GCash, and Maya. Payment is collected upon delivery for COD.",
};

function getAutoReply(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("order") || t.includes("cancel")) return AUTO_REPLIES.order;
  if (t.includes("deliver") || t.includes("shipping") || t.includes("how long")) return AUTO_REPLIES.delivery;
  if (t.includes("menu") || t.includes("product") || t.includes("price")) return AUTO_REPLIES.menu;
  if (t.includes("hour") || t.includes("open") || t.includes("close") || t.includes("time")) return AUTO_REPLIES.hours;
  if (t.includes("pay") || t.includes("gcash") || t.includes("maya") || t.includes("cod")) return AUTO_REPLIES.payment;
  return AUTO_REPLIES.default;
}

const now = () => new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });

export default function ContactPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, from: "support", text: "👋 Hi! Welcome to Kzen's Puto Bumbong support. How can we help you today?", time: now() },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: Date.now(), from: "user", text, time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply: Message = { id: Date.now() + 1, from: "support", text: getAutoReply(text), time: now() };
      setMessages((prev) => [...prev, reply]);
    }, 1200);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const QUICK = ["Track my order", "Delivery time?", "Payment methods", "Opening hours", "View menu"];

  return (
    <div style={{ background: "#f8f5fa", minHeight: "100vh" }}>
      <Navbar />

      <div className={styles.pageWrapper}>
        {/* INFO SIDEBAR */}
        <aside className={styles.sidebar}>
          <div className={styles.shopCard}>
            <div className={styles.shopAvatar}>🍢</div>
            <h2>Kzen&apos;s Puto Bumbong</h2>
            <p className={styles.shopStatus}><span className={styles.onlineDot} />Usually replies instantly</p>
          </div>
          <div className={styles.infoList}>
            <div className={styles.infoItem}><span>📞</span><div><strong>Phone</strong><p>+63 912345678</p></div></div>
            <div className={styles.infoItem}><span>📧</span><div><strong>Email</strong><p>kzen@example.com</p></div></div>
            <div className={styles.infoItem}><span>📍</span><div><strong>Address</strong><p>Cebu City, Philippines</p></div></div>
            <div className={styles.infoItem}><span>🕐</span><div><strong>Hours</strong><p>Mon–Sun: 7AM – 8PM</p></div></div>
          </div>
        </aside>

        {/* CHAT WINDOW */}
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <div className={styles.chatAvatar}>🍢</div>
            <div>
              <strong>Kzen&apos;s Support</strong>
              <p>Puto Bumbong · Cebu City</p>
            </div>
          </div>

          <div className={styles.messages}>
            {messages.map((msg) => (
              <div key={msg.id} className={`${styles.msgRow} ${msg.from === "user" ? styles.msgRowUser : ""}`}>
                {msg.from === "support" && <div className={styles.msgAvatar}>🍢</div>}
                <div className={`${styles.bubble} ${msg.from === "user" ? styles.bubbleUser : styles.bubbleSupport}`}>
                  <p>{msg.text}</p>
                  <span className={styles.msgTime}>{msg.time}</span>
                </div>
              </div>
            ))}
            {typing && (
              <div className={styles.msgRow}>
                <div className={styles.msgAvatar}>🍢</div>
                <div className={`${styles.bubble} ${styles.bubbleSupport} ${styles.typingBubble}`}>
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* QUICK REPLIES */}
          <div className={styles.quickReplies}>
            {QUICK.map((q) => (
              <button key={q} className={styles.quickBtn} onClick={() => { setInput(q); }}>
                {q}
              </button>
            ))}
          </div>

          <div className={styles.inputRow}>
            <textarea
              className={styles.chatInput}
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
            />
            <button className={styles.sendBtn} onClick={sendMessage} disabled={!input.trim()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
