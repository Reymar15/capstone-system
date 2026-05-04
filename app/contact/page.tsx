"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import styles from "./contact.module.css";

type ChatMsg = {
  id: string;
  sender_id: string;
  sender_role: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  replied_at: string | null;
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric" });

function dateDivider(msgs: ChatMsg[], idx: number) {
  if (idx === 0) return true;
  const prev = new Date(msgs[idx - 1].created_at).toDateString();
  const curr = new Date(msgs[idx].created_at).toDateString();
  return prev !== curr;
}

const QUICK = ["Track my order", "Delivery time?", "Payment methods", "Opening hours", "View menu"];

export default function ContactPage() {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!token) return;
    const res = await fetch("/api/chat/messages", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (!user || !token) { setLoading(false); return; }
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [user, token, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !token || sending) return;
    setSending(true);
    setInput("");
    const res = await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message: text, receiverId: "admin" }),
    });
    if (res.ok) {
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
    }
    setSending(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div style={{ background: "#f8f5fa", minHeight: "100vh" }}>
      <Navbar />

      <div className={styles.pageWrapper}>
        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          <div className={styles.shopCard}>
            <div className={styles.shopAvatar}>🍢</div>
            <h2>Kzen&apos;s Puto Bumbong</h2>
            <p className={styles.shopStatus}>
              <span className={styles.onlineDot} />
              Usually replies within minutes
            </p>
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

          {!user ? (
            <div className={styles.loginPrompt}>
              <span style={{ fontSize: "2.5rem" }}>💬</span>
              <p>Please log in to chat with our support team.</p>
              <Link href="/login?redirect=/contact" className={styles.loginPromptBtn}>
                Log In to Chat
              </Link>
            </div>
          ) : (
            <>
              <div className={styles.messages}>
                {loading && (
                  <div className={styles.loadingChat}>Loading messages...</div>
                )}

                {!loading && messages.length === 0 && (
                  <div className={styles.emptyChat}>
                    <span>👋</span>
                    <p>Hi {user.firstName}! Send us a message and we&apos;ll get back to you shortly.</p>
                  </div>
                )}

                {messages.map((msg, idx) => {
                  const isUser = msg.sender_id !== "admin";
                  const showDate = dateDivider(messages, idx);
                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className={styles.dateDivider}>
                          <span>{fmtDate(msg.created_at)}</span>
                        </div>
                      )}
                      <div className={`${styles.msgRow} ${isUser ? styles.msgRowUser : ""}`}>
                        {!isUser && <div className={styles.msgAvatar}>🍢</div>}
                        <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleSupport}`}>
                          <p>{msg.message}</p>
                          <span className={styles.msgTime}>
                            {fmt(msg.created_at)}
                            {isUser && (
                              <span className={styles.readTick}>
                                {msg.is_read ? " ✓✓" : " ✓"}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* QUICK REPLIES — only show if no messages yet */}
              {messages.length === 0 && (
                <div className={styles.quickReplies}>
                  {QUICK.map((q) => (
                    <button key={q} className={styles.quickBtn} onClick={() => setInput(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div className={styles.inputRow}>
                <textarea
                  className={styles.chatInput}
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  rows={1}
                />
                <button
                  className={styles.sendBtn}
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
