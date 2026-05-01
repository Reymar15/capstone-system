"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { validateRegister } from "@/lib/validation";
import { useToast } from "../context/ToastContext";
import styles from "../page.module.css";
import authStyles from "../auth.module.css";

export default function SignupPage() {
  const { register } = useAuth();
  const { success, error: toastError } = useToast();
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    password: "", confirm: "", securityQuestion: "", securityAnswer: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientErrors = validateRegister(form);
    if (form.password !== form.confirm) clientErrors.confirm = "Passwords do not match.";
    if (!form.securityQuestion) clientErrors.securityQuestion = "Please select a security question.";
    if (!form.securityAnswer.trim()) clientErrors.securityAnswer = "Security answer is required.";
    if (Object.keys(clientErrors).length > 0) { setErrors(clientErrors); return; }

    setLoading(true);
    const err = await register({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      phone: form.phone,
      securityQuestion: form.securityQuestion,
      securityAnswer: form.securityAnswer,
    });
    setLoading(false);
    if (err) { setErrors({ general: err }); toastError(err); return; }
    success("Account created! Welcome to Kzen's Puto Bumbong! 🎉");
    router.push("/");
  };

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
        <div className={authStyles.authCard}>
          <div className={authStyles.authBadge}>🎋</div>
          <h1>Create Account</h1>
          <p className={authStyles.subtitle}>Join us and enjoy fresh puto bumbong!</p>

          {errors.general && <div className={authStyles.errorBox}>{errors.general}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className={authStyles.nameRow}>
              <div className={authStyles.formGroup}>
                <label>First Name</label>
                <div className={`${authStyles.inputWrapper} ${errors.firstName ? authStyles.inputError : ""}`}>
                  <span className={authStyles.inputIcon}>👤</span>
                  <input type="text" placeholder="Juan" value={form.firstName} onChange={set("firstName")} />
                </div>
                {errors.firstName && <span className={authStyles.fieldError}>{errors.firstName}</span>}
              </div>
              <div className={authStyles.formGroup}>
                <label>Last Name</label>
                <div className={`${authStyles.inputWrapper} ${errors.lastName ? authStyles.inputError : ""}`}>
                  <span className={authStyles.inputIcon}>👤</span>
                  <input type="text" placeholder="Dela Cruz" value={form.lastName} onChange={set("lastName")} />
                </div>
                {errors.lastName && <span className={authStyles.fieldError}>{errors.lastName}</span>}
              </div>
            </div>

            <div className={authStyles.formGroup}>
              <label>Email Address</label>
              <div className={`${authStyles.inputWrapper} ${errors.email ? authStyles.inputError : ""}`}>
                <span className={authStyles.inputIcon}>✉️</span>
                <input type="email" placeholder="your@email.com" value={form.email} onChange={set("email")} />
              </div>
              {errors.email && <span className={authStyles.fieldError}>{errors.email}</span>}
            </div>

            <div className={authStyles.formGroup}>
              <label>Phone Number</label>
              <div className={`${authStyles.inputWrapper} ${errors.phone ? authStyles.inputError : ""}`}>
                <span className={authStyles.inputIcon}>📞</span>
                <input type="tel" placeholder="09XX XXX XXXX" value={form.phone} onChange={set("phone")} />
              </div>
              {errors.phone && <span className={authStyles.fieldError}>{errors.phone}</span>}
            </div>

            <div className={authStyles.formGroup}>
              <label>Password</label>
              <div className={`${authStyles.inputWrapper} ${errors.password ? authStyles.inputError : ""}`}>
                <span className={authStyles.inputIcon}>🔒</span>
                <input type="password" placeholder="Minimum 8 characters" value={form.password} onChange={set("password")} />
              </div>
              {errors.password && <span className={authStyles.fieldError}>{errors.password}</span>}
            </div>

            <div className={authStyles.formGroup}>
              <label>Confirm Password</label>
              <div className={`${authStyles.inputWrapper} ${errors.confirm ? authStyles.inputError : ""}`}>
                <span className={authStyles.inputIcon}>🔒</span>
                <input type="password" placeholder="Repeat your password" value={form.confirm} onChange={set("confirm")} />
              </div>
              {errors.confirm && <span className={authStyles.fieldError}>{errors.confirm}</span>}
            </div>

            <div className={authStyles.formGroup}>
              <label>Security Question</label>
              <div className={`${authStyles.inputWrapper} ${errors.securityQuestion ? authStyles.inputError : ""}`}>
                <span className={authStyles.inputIcon}>🛡️</span>
                <select
                  value={form.securityQuestion}
                  onChange={(e) => { setForm((p) => ({ ...p, securityQuestion: e.target.value })); setErrors((p) => ({ ...p, securityQuestion: "" })); }}
                  style={{ paddingLeft: 42 }}
                >
                  <option value="">Select a question...</option>
                  <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                  <option value="What was the name of your first pet?">What was the name of your first pet?</option>
                  <option value="What city were you born in?">What city were you born in?</option>
                  <option value="What is your favorite food?">What is your favorite food?</option>
                  <option value="What was the name of your elementary school?">What was the name of your elementary school?</option>
                  <option value="What is your childhood nickname?">What is your childhood nickname?</option>
                </select>
              </div>
              {errors.securityQuestion && <span className={authStyles.fieldError}>{errors.securityQuestion}</span>}
            </div>

            <div className={authStyles.formGroup}>
              <label>Security Answer</label>
              <div className={`${authStyles.inputWrapper} ${errors.securityAnswer ? authStyles.inputError : ""}`}>
                <span className={authStyles.inputIcon}>💬</span>
                <input type="text" placeholder="Your answer" value={form.securityAnswer} onChange={set("securityAnswer")} />
              </div>
              <span className={authStyles.hint}>Answer is not case-sensitive.</span>
              {errors.securityAnswer && <span className={authStyles.fieldError}>{errors.securityAnswer}</span>}
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
