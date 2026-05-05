"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import AdminLayout from "../AdminLayout";
import styles from "../admin.module.css";
import msgStyles from "./messages.module.css";

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

type Conversation = {
  userId: string;
  userName: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric" });

function dateDivider(msgs: ChatMsg[], idx: number) {
  if (idx === 0) return true;
  return new Date(msgs[idx - 1].created_at).toDateString() !== new Date(msgs[idx].created_at).toDateString();
}

export default function AdminMessages() {
  const { user, token } = useAuth();
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [thread, setThread] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const userNamesRef = useRef<Record<string, string>>({});

  // Keep ref in sync so fetchAllMessages can use latest names without re-creating
  useEffect(() => {
    userNamesRef.current = userNames;
  }, [userNames]);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    const res = await fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return;
    const data = await res.json();
    const map: Record<string, string> = {};
    for (const u of data) map[u.id] = `${u.firstName} ${u.lastName}`.trim();
    setUserNames(map);
    userNamesRef.current = map;
  }, [token]);

  const fetchAllMessages = useCallback(async () => {
    if (!token) return;
    const res = await fetch("/api/chat/messages?all=1", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) { setLoading(false); return; }
    const data: ChatMsg[] = await res.json();
    if (!Array.isArray(data)) { setLoading(false); return; }

    const names = userNamesRef.current;
    const convMap: Record<string, ChatMsg[]> = {};
    for (const m of data) {
      const uid = m.sender_id === "admin" ? m.receiver_id : m.sender_id;
      if (!convMap[uid]) convMap[uid] = [];
      convMap[uid].push(m);
    }

    const convList: Conversation[] = Object.entries(convMap).map(([uid, msgs]) => {
      const sorted = [...msgs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const unread = msgs.filter((m) => m.sender_id !== "admin" && !m.is_read).length;
      return {
        userId: uid,
        userName: names[uid] || "User",
        lastMessage: sorted[0]?.message || "",
        lastTime: sorted[0]?.created_at || "",
        unread,
      };
    }).sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());

    setConversations(convList);
    setLoading(false);
  }, [token]);

  const fetchThread = useCallback(async (userId: string) => {
    if (!token) return;
    const res = await fetch(`/api/chat/messages?userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    setThread(Array.isArray(data) ? data : []);
    await fetch("/api/chat/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId }),
    });
    setConversations((prev) => prev.map((c) => c.userId === userId ? { ...c, unread: 0 } : c));
  }, [token]);

  // Initial load
  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") { router.push("/"); return; }
    fetchUsers().then(() => fetchAllMessages());
  }, [user, router, fetchUsers, fetchAllMessages]);

  // Poll for new messages
  useEffect(() => {
    if (!token) return;
    const t = setInterval(fetchAllMessages, 4000);
    return () => clearInterval(t);
  }, [token, fetchAllMessages]);

  // Poll active thread
  useEffect(() => {
    if (!activeUserId) return;
    fetchThread(activeUserId);
    const t = setInterval(() => fetchThread(activeUserId), 3000);
    return () => clearInterval(t);
  }, [activeUserId, fetchThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  const openConversation = (userId: string) => {
    setActiveUserId(userId);
    setInput("");
  };

  const sendReply = async () => {
    const text = input.trim();
    if (!text || !activeUserId || sending) return;
    setSending(true);
    setInput("");
    const res = await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message: text, receiverId: activeUserId }),
    });
    if (res.ok) {
      const msg = await res.json();
      setThread((prev) => [...prev, msg]);
    }
    setSending(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); }
  };

  const activeConv = conversations.find((c) => c.userId === activeUserId);
  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);

  if (loading) return (
    <AdminLayout>
      <div className={styles.loading}>Loading messages...</div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className={styles.pageHeader}>
        <div>
          <h1>Messages</h1>
          <p>{conversations.length} conversations · {totalUnread} unread</p>
        </div>
      </div>

      <div className={msgStyles.container}>
        {/* CONVERSATION LIST */}
        <div className={msgStyles.convList}>
          <div className={msgStyles.convListHeader}>Conversations</div>
          {conversations.length === 0 && (
            <div className={msgStyles.noConv}>No messages yet.</div>
          )}
          {conversations.map((c) => (
            <div
              key={c.userId}
              className={`${msgStyles.convItem} ${activeUserId === c.userId ? msgStyles.convItemActive : ""}`}
              onClick={() => openConversation(c.userId)}
            >
              <div className={msgStyles.convAvatar}>
                {(c.userName || "U")[0].toUpperCase()}
              </div>
              <div className={msgStyles.convInfo}>
                <div className={msgStyles.convName}>
                  {c.userName}
                  {c.unread > 0 && <span className={msgStyles.unreadBadge}>{c.unread}</span>}
                </div>
                <div className={msgStyles.convPreview}>
                  {c.lastMessage.length > 40 ? c.lastMessage.slice(0, 40) + "…" : c.lastMessage}
                </div>
              </div>
              <div className={msgStyles.convTime}>
                {c.lastTime && !isNaN(new Date(c.lastTime).getTime()) ? fmt(c.lastTime) : ""}
              </div>
            </div>
          ))}
        </div>

        {/* CHAT PANEL */}
        <div className={msgStyles.chatPanel}>
          {!activeUserId ? (
            <div className={msgStyles.noChatSelected}>
              <span>💬</span>
              <p>Select a conversation to start replying</p>
            </div>
          ) : (
            <>
              <div className={msgStyles.chatHeader}>
                <div className={msgStyles.chatHeaderAvatar}>
                  {(userNames[activeUserId] || "U")[0].toUpperCase()}
                </div>
                <div>
                  <strong>{userNames[activeUserId] || activeConv?.userName || activeUserId}</strong>
                  <p>Customer</p>
                </div>
              </div>

              <div className={msgStyles.messages}>
                {thread.length === 0 && (
                  <div className={msgStyles.emptyThread}>No messages in this conversation yet.</div>
                )}
                {thread.map((msg, idx) => {
                  const isAdmin = msg.sender_id === "admin";
                  const showDate = dateDivider(thread, idx);
                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className={msgStyles.dateDivider}>
                          <span>{fmtDate(msg.created_at)}</span>
                        </div>
                      )}
                      <div className={`${msgStyles.msgRow} ${isAdmin ? msgStyles.msgRowAdmin : ""}`}>
                        {!isAdmin && (
                          <div className={msgStyles.msgAvatar}>
                            {(userNames[msg.sender_id] || "U")[0].toUpperCase()}
                          </div>
                        )}
                        <div className={`${msgStyles.bubble} ${isAdmin ? msgStyles.bubbleAdmin : msgStyles.bubbleUser}`}>
                          <p>{msg.message}</p>
                          <span className={msgStyles.msgTime}>
                            {fmt(msg.created_at)}
                            {isAdmin && <span>{msg.is_read ? " ✓✓" : " ✓"}</span>}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <div className={msgStyles.inputRow}>
                <textarea
                  className={msgStyles.chatInput}
                  placeholder={`Reply to ${activeConv?.userName || "user"}...`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  rows={1}
                />
                <button
                  className={msgStyles.sendBtn}
                  onClick={sendReply}
                  disabled={!input.trim() || sending}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
