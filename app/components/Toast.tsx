"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import styles from "./Toast.module.css";

export type ToastType = "success" | "error" | "warning" | "info";

export type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
};

const ICONS = {
  success: <CheckCircle size={18} />,
  error:   <XCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info:    <Info size={18} />,
};

const DURATION = 3800;

function ToastCard({ toast, onRemove }: { toast: ToastItem; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 10);

    // Progress bar countdown
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(pct);
    }, 30);

    const hide = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 320);
    }, DURATION);

    return () => { clearTimeout(show); clearTimeout(hide); clearInterval(tick); };
  }, [toast.id, onRemove]);

  const dismiss = () => {
    setVisible(false);
    setTimeout(() => onRemove(toast.id), 320);
  };

  return (
    <div className={`${styles.toast} ${styles[toast.type]} ${visible ? styles.show : ""}`}>
      <span className={styles.icon}>{ICONS[toast.type]}</span>
      <span className={styles.message}>{toast.message}</span>
      <button className={styles.close} onClick={dismiss} aria-label="Dismiss">
        <X size={14} />
      </button>
      <div className={styles.progress}>
        <div className={`${styles.progressBar} ${styles[`bar_${toast.type}`]}`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export default function ToastContainer({ toasts, onRemove }: {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className={styles.container}>
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}
