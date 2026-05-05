"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Navbar from "../components/Navbar";
import authStyles from "../auth.module.css";

export default function SignupPage() {
  const { register } = useAuth();
  const { success } = useToast();
  const router = useRouter();

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.firstName.trim()) { setError("First name is required."); return; }
    if (!form.lastName.trim()) { setError("Last name is required."); return; }
    if (!form.email.trim()) { setError("Email is required."); return; }
    if (!form.password) { setError("Password is required."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }

    setLoading(true);
    const err = await register({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), password: form.password, phone: form.phone.trim(), securityQuestion: "", securityAnswer: "" });
    setLoading(false);
    if (err) { setError(err); return; }
    success("Account created! Please verify your email.");
    router.push(`/verify-email?email=${encodeURIComponent(form.email.trim())}`);
  };

  return (
    <div className={authStyles.page}>
      <Navbar />
      <div className={authStyles.authWrapper}>
        <div className={authStyles.authCard}>
          <div className={authStyles.authBadge}>🎋</div>
          <h1>Create Account</h1>
          <p className={authStyles.subtitle}>Join us and enjoy fresh puto bumbong!</p>

          {error && <div className={authStyles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className={authStyles.nameRow}>
              <div className={authStyles.formGroup}>
                <label>First Name</label>
                <div className={authStyles.inputWrapper}>
                  <User size={16} className={authStyles.inputIcon} />
                  <input type="text" placeholder="Juan" value={form.firstName} onChange={set("firstName")} />
                </div>
              </div>
              <div className={authStyles.formGroup}>
                <label>Last Name</label>
                <div className={authStyles.inputWrapper}>
                  <User size={16} className={authStyles.inputIcon} />
                  <input type="text" placeholder="Dela Cruz" value={form.lastName} onChange={set("lastName")} />
                </div>
              </div>
            </div>

            <div className={authStyles.formGroup}>
              <label>Email Address</label>
              <div className={authStyles.inputWrapper}>
                <Mail size={16} className={authStyles.inputIcon} />
                <input type="email" placeholder="your@email.com" value={form.email} onChange={set("email")} autoComplete="email" />
              </div>
            </div>

            <div className={authStyles.formGroup}>
              <label>Phone Number</label>
              <div className={authStyles.inputWrapper}>
                <Phone size={16} className={authStyles.inputIcon} />
                <input type="tel" placeholder="09XX XXX XXXX" value={form.phone} onChange={set("phone")} />
              </div>
            </div>

            <div className={authStyles.formGroup}>
              <label>Password</label>
              <div className={authStyles.inputWrapper}>
                <Lock size={16} className={authStyles.inputIcon} />
                <input type={showPassword ? "text" : "password"} placeholder="Minimum 8 characters" value={form.password} onChange={set("password")} autoComplete="new-password" />
                <button type="button" className={authStyles.eyeBtn} onClick={() => setShowPassword((p) => !p)} tabIndex={-1}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className={authStyles.formGroup}>
              <label>Confirm Password</label>
              <div className={authStyles.inputWrapper}>
                <Lock size={16} className={authStyles.inputIcon} />
                <input type={showConfirm ? "text" : "password"} placeholder="Repeat your password" value={form.confirm} onChange={set("confirm")} autoComplete="new-password" />
                <button type="button" className={authStyles.eyeBtn} onClick={() => setShowConfirm((p) => !p)} tabIndex={-1}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className={authStyles.submitBtn} disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className={authStyles.switchText}>
            Already have an account? <Link href="/login">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
