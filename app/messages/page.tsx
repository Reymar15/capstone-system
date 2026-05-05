"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import msgStyles from "./messages.module.css";

type Message = {
  id: number;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  recipient_id: string | null;
  message: string;
  created_at: string;
};

export default function MessagesPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/messages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setLoading(false); return; }
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } catch (err) {
      console.error("fetchMessages error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (!token) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [user, token, fetchMessages, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !token) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: input.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send message.");
      } else {
        setInput("");
        fetchMessages();
      }
    } catch (err) {
      console.error("handleSend error:", err);
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ background: "#f8f5fa", minHeight: "100vh" }}>
      <Navbar />
      <div className={msgStyles.wrapper}>
        <div className={msgStyles.header}>
          <h1>💬 Messages</h1>
          <p>Chat with Kzen's Puto Bumbong support</p>
        </div>

        {error && (
          <div style={{ background: "#fee2e2", color: "#dc2626", padding: "10px 16px", borderRadius: 10, marginBottom: 12, fontSize: "0.88rem", fontWeight: 600 }}>
            {error}
          </div>
        )}

        <div className={msgStyles.chatBox}>
          {loading && <p className={msgStyles.loading}>Loading messages...</p>}
          {!loading && messages.length === 0 && (
            <p className={msgStyles.empty}>No messages yet. Say hello! 👋</p>
          )}
          {messages.map((msg) => {
            const isMe = msg.sender_role === "customer" && msg.sender_id === user?.id;
            const isAdmin = msg.sender_role === "admin";
            return (
              <div
                key={msg.id}
                className={`${msgStyles.msgRow} ${isMe ? msgStyles.msgRowRight : msgStyles.msgRowLeft}`}
              >
                {!isMe && (
                  <div className={msgStyles.avatar}>
                    {isAdmin ? "👑" : msg.sender_name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
                <div className={`${msgStyles.bubble} ${isMe ? msgStyles.bubbleMe : isAdmin ? msgStyles.bubbleAdmin : msgStyles.bubbleOther}`}>
                  {!isMe && (
                    <span className={msgStyles.senderName}>
                      {isAdmin ? "Kzen's Support" : msg.sender_name}
                    </span>
                  )}
                  <p>{msg.message}</p>
                  <span className={msgStyles.time}>
                    {new Date(msg.created_at).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form className={msgStyles.inputRow} onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(""); }}
            disabled={sending}
          />
          <button type="submit" disabled={sending || !input.trim()}>
            {sending ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
