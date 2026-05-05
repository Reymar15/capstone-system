"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "../context/ToastContext";
import Navbar from "../components/Navbar";
import authStyles from "../auth.module.css";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const { success, error: toastError } = useToast();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) { setError("Please enter the 6-digit code."); return; }
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error); toastError(data.error); return; }
    success("Email verified successfully! 🎉");
    setVerified(true);
    setTimeout(() => router.push("/login"), 2500);
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    const res = await fetch("/api/auth/send-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setResending(false);
    if (!res.ok) { setError(data.error); return; }
    success("New verification code sent! Check your email. 📧");
  };

  return (
    <div className={authStyles.authCard}>
      <div className={authStyles.authBadge}>📧</div>

      {verified ? (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>✅</div>
          <h1>Email Verified!</h1>
          <p className={authStyles.subtitle}>Redirecting to login...</p>
        </div>
      ) : (
        <>
          <h1>Verify Email</h1>
          <p className={authStyles.subtitle}>
            We sent a 6-digit code to<br />
            <strong style={{ color: "#7b1fa2" }}>{email}</strong>
          </p>

          {error && <div className={authStyles.errorBox}>{error}</div>}

          <form onSubmit={handleVerify}>
            <div className={authStyles.formGroup}>
              <label>Verification Code</label>
              <div className={authStyles.inputWrapper}>
                <span className={authStyles.inputIcon}>🔑</span>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setCode(val);
                    setError("");
                  }}
                  maxLength={6}
                  style={{ letterSpacing: "6px", fontSize: "1.2rem", textAlign: "center" }}
                />
              </div>
              <span className={authStyles.hint}>Code expires in 10 minutes.</span>
            </div>

            <button type="submit" className={authStyles.submitBtn} disabled={loading || code.length !== 6}>
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <p className={authStyles.switchText}>
            Didn't receive the code?{" "}
            <button
              onClick={handleResend}
              disabled={resending}
              style={{ background: "none", border: "none", color: "#7b1fa2", fontWeight: 700, cursor: "pointer", fontSize: "inherit" }}
            >
              {resending ? "Sending..." : "Resend Code"}
            </button>
          </p>

          <p className={authStyles.switchText}>
            <Link href="/login">← Back to Login</Link>
          </p>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className={authStyles.page}>
      <Navbar />
      <div className={authStyles.authWrapper}>
        <Suspense fallback={<div className={authStyles.authCard}><p style={{ textAlign: "center", padding: 40 }}>Loading...</p></div>}>
          <VerifyForm />
        </Suspense>
      </div>
    </div>
  );
}
