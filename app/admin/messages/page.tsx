"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import AdminLayout from "../AdminLayout";
import styles from "../admin.module.css";
import msgStyles from "../../messages/messages.module.css";

type Message = {
  id: string;
  sender_id: string;
  sender_role: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

type Thread = {
  userId: string;
  lastMessage: string;
  time: string;
  unread: number;
};

export default function AdminMessages() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/chat/messages?all=1", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setAllMessages(data);
    } catch (err) {
      console.error("fetchAll error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchConversation = useCallback(async (userId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/chat/messages?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setConversation(data);
    } catch (err) {
      console.error("fetchConversation error:", err);
    }
  }, [token]);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") { router.push("/"); return; }
    fetchAll();
    const interval = setInterval(fetchAll, 4000);
    return () => clearInterval(interval);
  }, [user, token, fetchAll, router]);

  useEffect(() => {
    if (selectedThread) {
      fetchConversation(selectedThread.userId);
      const interval = setInterval(() => fetchConversation(selectedThread.userId), 4000);
      return () => clearInterval(interval);
    }
  }, [selectedThread, fetchConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  // Build thread list from all messages
  const threadMap = new Map<string, Thread>();
  allMessages.forEach((msg) => {
    const userId = msg.sender_role === "customer" ? msg.sender_id : msg.receiver_id;
    if (!userId || userId === "admin") return;
    const existing = threadMap.get(userId);
    const time = new Date(msg.created_at).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
    const unread = msg.sender_role === "customer" && !msg.is_read ? 1 : 0;
    if (!existing || new Date(msg.created_at) > new Date(existing.time)) {
      threadMap.set(userId, {
        userId,
        lastMessage: msg.message,
        time,
        unread: (existing?.unread ?? 0) + unread,
      });
    }
  });
  const threads = Array.from(threadMap.values());

  // Get display name from messages
  const getDisplayName = (userId: string) => {
    const msg = allMessages.find((m) => m.sender_id === userId && m.sender_role === "customer");
    return msg ? `User ${userId.slice(-6)}` : `User ${userId.slice(-6)}`;
  };

  const handleSelectThread = (t: Thread) => {
    setSelectedThread(t);
    fetchConversation(t.userId);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedThread || !token) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: input.trim(), receiverId: selectedThread.userId }),
      });
      if (res.ok) {
        setInput("");
        fetchConversation(selectedThread.userId);
        fetchAll();
      }
    } catch (err) {
      console.error("send error:", err);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading messages...</div>;

  return (
    <AdminLayout>
      <div className={styles.pageHeader}>
        <div>
          <h1>Messages</h1>
          <p>{threads.length} conversation{threads.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, height: "calc(100vh - 200px)" }}>

        {/* THREAD LIST */}
        <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(106,27,154,0.08)", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #f3e5f5", fontWeight: 700, color: "#3b0764", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Conversations ({threads.length})
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {threads.length === 0 && (
              <p style={{ textAlign: "center", color: "#9ca3af", padding: 24, fontSize: "0.88rem" }}>No messages yet.</p>
            )}
            {threads.map((t) => (
              <div
                key={t.userId}
                onClick={() => handleSelectThread(t)}
                style={{
                  padding: "14px 18px", cursor: "pointer",
                  borderBottom: "1px solid #f9fafb",
                  background: selectedThread?.userId === t.userId ? "#faf5ff" : "white",
                  borderLeft: selectedThread?.userId === t.userId ? "3px solid #7b1fa2" : "3px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#7b1fa2,#c2188b)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.78rem", flexShrink: 0 }}>
                      {t.userId.slice(-2).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#1a1a2e" }}>
                      {getDisplayName(t.userId)}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {t.unread > 0 && (
                      <span style={{ background: "#c2188b", color: "white", fontSize: "0.65rem", fontWeight: 700, padding: "1px 6px", borderRadius: 999 }}>{t.unread}</span>
                    )}
                    <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>{t.time}</span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.lastMessage}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CHAT PANEL */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {!selectedThread ? (
            <div style={{ flex: 1, background: "white", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9ca3af", boxShadow: "0 2px 8px rgba(106,27,154,0.08)", gap: 8 }}>
              <span style={{ fontSize: "2.5rem" }}>💬</span>
              <p style={{ margin: 0 }}>Select a conversation to reply</p>
            </div>
          ) : (
            <>
              <div style={{ background: "white", borderRadius: 16, padding: "14px 20px", boxShadow: "0 2px 8px rgba(106,27,154,0.08)", fontWeight: 700, color: "#3b0764", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#7b1fa2,#c2188b)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem" }}>
                  {selectedThread.userId.slice(-2).toUpperCase()}
                </div>
                {getDisplayName(selectedThread.userId)}
              </div>

              <div className={msgStyles.chatBox} style={{ flex: 1 }}>
                {conversation.length === 0 && (
                  <p className={msgStyles.empty}>No messages yet.</p>
                )}
                {conversation.map((msg) => {
                  const isAdmin = msg.sender_role === "admin";
                  return (
                    <div key={msg.id} className={`${msgStyles.msgRow} ${isAdmin ? msgStyles.msgRowRight : msgStyles.msgRowLeft}`}>
                      {!isAdmin && (
                        <div className={msgStyles.avatar}>{msg.sender_id.slice(-2).toUpperCase()}</div>
                      )}
                      <div className={`${msgStyles.bubble} ${isAdmin ? msgStyles.bubbleMe : msgStyles.bubbleOther}`}>
                        {!isAdmin && <span className={msgStyles.senderName}>Customer</span>}
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
                  placeholder="Type your reply..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={sending}
                />
                <button type="submit" disabled={sending || !input.trim()}>
                  {sending ? "..." : "Send"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
