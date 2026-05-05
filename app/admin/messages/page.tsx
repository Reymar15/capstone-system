"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import AdminLayout from "../AdminLayout";
import styles from "../admin.module.css";
import m from "./messages.module.css";

type Msg = {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

type Conv = {
  userId: string;
  name: string;
  lastMsg: string;
  lastTime: string;
  unread: number;
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });

function showDateDivider(msgs: Msg[], i: number) {
  if (i === 0) return true;
  return new Date(msgs[i - 1].created_at).toDateString() !== new Date(msgs[i].created_at).toDateString();
}

export default function AdminMessages() {
  const { user, token } = useAuth();
  const router = useRouter();

  const [convs, setConvs] = useState<Conv[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [thread, setThread] = useState<Msg[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const namesRef = useRef<Record<string, string>>({});
  const activeIdRef = useRef<string | null>(null);

  activeIdRef.current = activeId;

  // ── fetch user names once ──────────────────────────────────
  const loadNames = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const map: Record<string, string> = {};
      for (const u of data) map[u.id] = `${u.firstName} ${u.lastName}`.trim();
      setNames(map);
      namesRef.current = map;
    } catch { /* silent */ }
  }, [token]);

  // ── build conversation list from all messages ──────────────
  const loadConvs = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/chat/messages?all=1", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setError("Failed to load conversations."); setLoadingConvs(false); return; }
      const data: Msg[] = await res.json();
      if (!Array.isArray(data)) { setLoadingConvs(false); return; }

      const map: Record<string, Msg[]> = {};
      for (const msg of data) {
        const uid = msg.sender_id === "admin" ? msg.receiver_id : msg.sender_id;
        if (!map[uid]) map[uid] = [];
        map[uid].push(msg);
      }

      const list: Conv[] = Object.entries(map).map(([uid, msgs]) => {
        const sorted = [...msgs].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        return {
          userId: uid,
          name: namesRef.current[uid] || "User",
          lastMsg: sorted[0]?.message || "",
          lastTime: sorted[0]?.created_at || "",
          unread: msgs.filter((msg) => msg.sender_id !== "admin" && !msg.is_read).length,
        };
      }).sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());

      setConvs(list);
      setLoadingConvs(false);
    } catch {
      setError("Failed to load conversations.");
      setLoadingConvs(false);
    }
  }, [token]);

  // ── fetch thread for active user ───────────────────────────
  const loadThread = useCallback(async (uid: string) => {
    if (!token) return;
    setLoadingThread(true);
    try {
      const res = await fetch(`/api/chat/messages?userId=${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setThread(Array.isArray(data) ? data : []);
      // mark as read
      await fetch("/api/chat/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: uid }),
      });
      setConvs((prev) => prev.map((c) => c.userId === uid ? { ...c, unread: 0 } : c));
    } catch { /* silent */ }
    finally { setLoadingThread(false); }
  }, [token]);

  // ── initial load ───────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") { router.push("/"); return; }
    loadNames().then(loadConvs);
  }, [user, router, loadNames, loadConvs]);

  // ── poll conversations every 5s ────────────────────────────
  useEffect(() => {
    if (!token) return;
    const t = setInterval(loadConvs, 5000);
    return () => clearInterval(t);
  }, [token, loadConvs]);

  // ── poll active thread every 3s ────────────────────────────
  useEffect(() => {
    if (!activeId) return;
    const t = setInterval(() => loadThread(activeId), 3000);
    return () => clearInterval(t);
  }, [activeId, loadThread]);

  // ── scroll to bottom on new messages ──────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  const openConv = (uid: string) => {
    setActiveId(uid);
    setInput("");
    loadThread(uid);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || !activeId || sending) return;
    setSending(true);
    setInput("");
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text, receiverId: activeId }),
      });
      if (res.ok) {
        const msg = await res.json();
        setThread((prev) => [...prev, msg]);
        setConvs((prev) =>
          prev.map((c) =>
            c.userId === activeId ? { ...c, lastMsg: text, lastTime: msg.created_at } : c
          )
        );
      }
    } catch { /* silent */ }
    setSending(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const activeConv = convs.find((c) => c.userId === activeId);
  const totalUnread = convs.reduce((s, c) => s + c.unread, 0);

  return (
    <AdminLayout>
      <div className={styles.pageHeader}>
        <div>
          <h1>Messages</h1>
          <p>
            {loadingConvs ? "Loading…" : `${convs.length} conversations`}
            {totalUnread > 0 && ` · ${totalUnread} unread`}
          </p>
        </div>
      </div>

      {error && (
        <div className={m.errorBanner}>⚠️ {error}</div>
      )}

      <div className={m.container}>
        {/* ── CONVERSATION LIST ── */}
        <div className={m.sidebar}>
          <div className={m.sidebarHeader}>
            <span>Conversations</span>
            {totalUnread > 0 && <span className={m.totalBadge}>{totalUnread}</span>}
          </div>

          <div className={m.convScroll}>
            {loadingConvs && (
              <div className={m.sidebarEmpty}>
                <div className={m.spinner} />
                <p>Loading…</p>
              </div>
            )}
            {!loadingConvs && convs.length === 0 && (
              <div className={m.sidebarEmpty}>
                <span>💬</span>
                <p>No messages yet</p>
              </div>
            )}
            {convs.map((c) => (
              <button
                key={c.userId}
                className={`${m.convItem} ${activeId === c.userId ? m.convActive : ""}`}
                onClick={() => openConv(c.userId)}
              >
                <div className={m.avatar}>{(c.name || "U")[0].toUpperCase()}</div>
                <div className={m.convMeta}>
                  <div className={m.convTop}>
                    <span className={m.convName}>{c.name}</span>
                    <span className={m.convTime}>
                      {c.lastTime ? fmt(c.lastTime) : ""}
                    </span>
                  </div>
                  <div className={m.convBottom}>
                    <span className={m.convPreview}>
                      {c.lastMsg.length > 38 ? c.lastMsg.slice(0, 38) + "…" : c.lastMsg}
                    </span>
                    {c.unread > 0 && <span className={m.badge}>{c.unread}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── CHAT PANEL ── */}
        <div className={m.chat}>
          {!activeId ? (
            <div className={m.empty}>
              <span>💬</span>
              <p>Select a conversation to reply</p>
            </div>
          ) : (
            <>
              {/* header */}
              <div className={m.chatHeader}>
                <div className={m.chatAvatar}>
                  {(names[activeId] || "U")[0].toUpperCase()}
                </div>
                <div>
                  <strong>{names[activeId] || activeConv?.name || activeId}</strong>
                  <p>Customer</p>
                </div>
              </div>

              {/* messages */}
              <div className={m.messages}>
                {loadingThread && (
                  <div className={m.threadLoading}>
                    <div className={m.spinner} />
                  </div>
                )}
                {!loadingThread && thread.length === 0 && (
                  <div className={m.threadEmpty}>No messages yet in this conversation.</div>
                )}
                {thread.map((msg, idx) => {
                  const mine = msg.sender_id === "admin";
                  return (
                    <div key={msg.id}>
                      {showDateDivider(thread, idx) && (
                        <div className={m.dateDivider}>
                          <span>{fmtDate(msg.created_at)}</span>
                        </div>
                      )}
                      <div className={`${m.row} ${mine ? m.rowMine : m.rowTheirs}`}>
                        {!mine && (
                          <div className={m.msgAvatar}>
                            {(names[msg.sender_id] || "U")[0].toUpperCase()}
                          </div>
                        )}
                        <div className={`${m.bubble} ${mine ? m.bubbleMine : m.bubbleTheirs}`}>
                          <p>{msg.message}</p>
                          <span className={m.time}>
                            {fmt(msg.created_at)}
                            {mine && <span>{msg.is_read ? " ✓✓" : " ✓"}</span>}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* input */}
              <div className={m.inputRow}>
                <textarea
                  className={m.input}
                  placeholder={`Reply to ${activeConv?.name || "user"}…`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKey}
                  rows={1}
                />
                <button className={m.sendBtn} onClick={send} disabled={!input.trim() || sending}>
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
