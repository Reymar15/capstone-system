"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import AdminLayout from "../AdminLayout";
import styles from "../admin.module.css";
import msgStyles from "../../messages/messages.module.css";

type Message = {
  id: number;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  recipient_id: string | null;
  message: string;
  created_at: string;
};

type UserThread = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
};

export default function AdminMessages() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserThread | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") { router.push("/"); return; }
    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (selectedUser) fetchConversation(selectedUser.id);
  }, [selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const fetchAll = async () => {
    const res = await fetch("/api/messages", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (Array.isArray(data)) setAllMessages(data);
    setLoading(false);
  };

  const fetchConversation = async (userId: string) => {
    const res = await fetch(`/api/messages?userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (Array.isArray(data)) setConversation(data);
  };

  // Group by unique customer senders
  const threads: UserThread[] = [];
  const seen = new Set<string>();
  [...allMessages].reverse().forEach((msg) => {
    if (msg.sender_role === "customer" && !seen.has(msg.sender_id)) {
      seen.add(msg.sender_id);
      threads.push({
        id: msg.sender_id,
        name: msg.sender_name,
        lastMessage: msg.message,
        time: new Date(msg.created_at).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }),
      });
    }
  });

  const handleSelectUser = (t: UserThread) => {
    setSelectedUser(t);
    fetchConversation(t.id);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser) return;
    setSending(true);
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message: input.trim(), recipientId: selectedUser.id }),
    });
    setInput("");
    setSending(false);
    fetchConversation(selectedUser.id);
    fetchAll();
  };

  return (
    <AdminLayout>
      <div className={styles.pageHeader}>
        <div>
          <h1>Messages</h1>
          <p>{threads.length} customer conversation{threads.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, height: "calc(100vh - 200px)" }}>

        {/* USER LIST */}
        <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(106,27,154,0.08)", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3e5f5", fontWeight: 700, color: "#3b0764", fontSize: "0.9rem" }}>
            Conversations
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading && <p style={{ textAlign: "center", color: "#9ca3af", padding: 24 }}>Loading...</p>}
            {!loading && threads.length === 0 && (
              <p style={{ textAlign: "center", color: "#9ca3af", padding: 24, fontSize: "0.88rem" }}>No messages yet.</p>
            )}
            {threads.map((t) => (
              <div
                key={t.id}
                onClick={() => handleSelectUser(t)}
                style={{
                  padding: "14px 20px",
                  cursor: "pointer",
                  borderBottom: "1px solid #f9fafb",
                  background: selectedUser?.id === t.id ? "#faf5ff" : "white",
                  borderLeft: selectedUser?.id === t.id ? "3px solid #7b1fa2" : "3px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1a1a2e" }}>{t.name}</span>
                  <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>{t.time}</span>
                </div>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.lastMessage}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CHAT AREA */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {!selectedUser ? (
            <div style={{ flex: 1, background: "white", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", boxShadow: "0 2px 8px rgba(106,27,154,0.08)" }}>
              <p>Select a conversation to start chatting</p>
            </div>
          ) : (
            <>
              <div style={{ background: "white", borderRadius: 16, padding: "14px 20px", boxShadow: "0 2px 8px rgba(106,27,154,0.08)", fontWeight: 700, color: "#3b0764" }}>
                💬 {selectedUser.name}
              </div>

              <div className={msgStyles.chatBox} style={{ flex: 1 }}>
                {conversation.length === 0 && (
                  <p className={msgStyles.empty}>No messages in this conversation yet.</p>
                )}
                {conversation.map((msg) => {
                  const isAdmin = msg.sender_role === "admin";
                  return (
                    <div key={msg.id} className={`${msgStyles.msgRow} ${isAdmin ? msgStyles.msgRowRight : msgStyles.msgRowLeft}`}>
                      {!isAdmin && (
                        <div className={msgStyles.avatar}>{msg.sender_name[0].toUpperCase()}</div>
                      )}
                      <div className={`${msgStyles.bubble} ${isAdmin ? msgStyles.bubbleMe : msgStyles.bubbleOther}`}>
                        {!isAdmin && <span className={msgStyles.senderName}>{msg.sender_name}</span>}
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
                  placeholder={`Reply to ${selectedUser.name}...`}
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
