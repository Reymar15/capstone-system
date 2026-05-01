"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { validateLogin } from "@/lib/validation";
import { useToast } from "../context/ToastContext";
import styles from "../page.module.css";
import authStyles from "../auth.module.css";

function LoginForm() {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || null;

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientErrors = validateLogin(form);
    if (Object.keys(clientErrors).length > 0) { setErrors(clientErrors); return; }

    setLoading(true);
    const err = await login(form.email, form.password);
    setLoading(false);

    if (err) { setErrors({ general: err }); toastError(err); return; }
    success("Welcome back! You are now logged in. 🎋");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    router.push(redirectTo || (user.role === "admin" ? "/admin/dashboard" : "/"));
  };

  return (
    <div className={authStyles.authCard}>
      <div className={authStyles.authBadge}>🎋</div>
      <h1>Welcome Back</h1>
      <p className={authStyles.subtitle}>Sign in to your account to continue</p>

      {errors.general && <div className={authStyles.errorBox}>{errors.general}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className={authStyles.formGroup}>
          <label htmlFor="email">Email Address</label>
          <div className={`${authStyles.inputWrapper} ${errors.email ? authStyles.inputError : ""}`}>
            <span className={authStyles.inputIcon}>✉️</span>
            <input id="email" type="email" placeholder="your@email.com" value={form.email} onChange={set("email")} />
          </div>
          {errors.email && <span className={authStyles.fieldError}>{errors.email}</span>}
        </div>

        <div className={authStyles.formGroup}>
          <label htmlFor="password">Password</label>
          <div className={`${authStyles.inputWrapper} ${errors.password ? authStyles.inputError : ""}`}>
            <span className={authStyles.inputIcon}>🔒</span>
            <input id="password" type="password" placeholder="Enter your password" value={form.password} onChange={set("password")} />
          </div>
          {errors.password && <span className={authStyles.fieldError}>{errors.password}</span>}
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
        <Link href="/" className={styles.logoLink}>
          <h2 className={styles.logo}>Puto Bumbong</h2>
        </Link>
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
        <Suspense fallback={<div className={authStyles.authCard}><p>Loading...</p></div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
