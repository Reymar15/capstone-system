"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import styles from "../page.module.css";
import authStyles from "../auth.module.css";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Email is required."); return; }
    if (!password) { setError("Password is required."); return; }
    setLoading(true);
    const err = await login(email.trim(), password);
    setLoading(false);
    if (err) { setError(err); return; }
    const saved = localStorage.getItem("user");
    const user = saved ? JSON.parse(saved) : null;
    router.push(redirectTo || (user?.role === "admin" ? "/admin/dashboard" : "/"));
  };

  return (
    <div className={authStyles.authCard}>
      <div className={authStyles.authBadge}>🎋</div>
      <h1>Welcome Back</h1>
      <p className={authStyles.subtitle}>Sign in to your account to continue</p>

      {error && <div className={authStyles.errorBox}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className={authStyles.formGroup}>
          <label htmlFor="email">Email Address</label>
          <div className={authStyles.inputWrapper}>
            <Mail size={16} className={authStyles.inputIcon} />
            <input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
        </div>

        <div className={authStyles.formGroup}>
          <label htmlFor="password">Password</label>
          <div className={authStyles.inputWrapper}>
            <Lock size={16} className={authStyles.inputIcon} />
            <input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            <button type="button" className={authStyles.eyeBtn} onClick={() => setShowPassword((p) => !p)} tabIndex={-1}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <Link href="/forgot-password" className={authStyles.forgotLink}>Forgot password?</Link>
        </div>

        <button type="submit" className={authStyles.submitBtn} disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className={authStyles.switchText}>
        Don't have an account? <Link href="/signup">Sign up here</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className={authStyles.page}>
      <nav className={styles.navbar}>
        <Link href="/" className={styles.logoLink}><h2 className={styles.logo}>Puto Bumbong</h2></Link>
        <ul className={styles.navLinks}>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/menu">Menu</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
        <div className={styles.navAuth}>
          <Link href="/login" className={styles.loginBtn}>Login</Link>
          <Link href="/signup" className={styles.signupBtn}>Sign Up</Link>
        </div>
      </nav>
      <div className={authStyles.authWrapper}>
        <Suspense fallback={<div className={authStyles.authCard}><p style={{ textAlign: "center", padding: "40px" }}>Loading...</p></div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
