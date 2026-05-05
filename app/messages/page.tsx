"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import msgStyles from "./messages.module.css";

type Message = {
  id: number;
  sender_id: string;
  sender_name: string;
  sender_role: string;
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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    const res = await fetch("/api/messages", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (Array.isArray(data)) setMessages(data);
    setLoading(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message: input.trim() }),
    });
    setInput("");
    setSending(false);
    fetchMessages();
  };

  return (
    <div style={{ background: "#f8f5fa", minHeight: "100vh" }}>
      <Navbar />
      <div className={msgStyles.wrapper}>
        <div className={msgStyles.header}>
          <h1>💬 Messages</h1>
          <p>Chat with Kzen's Puto Bumbong support</p>
        </div>

        <div className={msgStyles.chatBox}>
          {loading && <p className={msgStyles.loading}>Loading messages...</p>}
          {!loading && messages.length === 0 && (
            <p className={msgStyles.empty}>No messages yet. Say hello! 👋</p>
          )}
          {messages.map((msg) => {
            const isMe = msg.sender_id === user?.id && msg.sender_role !== "admin";
            const isAdmin = msg.sender_role === "admin";
            return (
              <div key={msg.id} className={`${msgStyles.msgRow} ${isMe ? msgStyles.msgRowRight : msgStyles.msgRowLeft}`}>
                {!isMe && (
                  <div className={msgStyles.avatar}>
                    {isAdmin ? "👑" : msg.sender_name[0].toUpperCase()}
                  </div>
                )}
                <div className={`${msgStyles.bubble} ${isMe ? msgStyles.bubbleMe : isAdmin ? msgStyles.bubbleAdmin : msgStyles.bubbleOther}`}>
                  {!isMe && <span className={msgStyles.senderName}>{isAdmin ? "Kzen's Support" : msg.sender_name}</span>}
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
            onChange={(e) => setInput(e.target.value)}
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
