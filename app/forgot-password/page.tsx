"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import authStyles from "../auth.module.css";

type Step = "email" | "answer" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const setErr = (field: string, msg: string) =>
    setErrors((p) => ({ ...p, [field]: msg }));
  const clearErr = (field: string) =>
    setErrors((p) => ({ ...p, [field]: "" }));

  // Step 1 — find account by email
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setErr("email", "Email is required."); return; }
    setLoading(true);
    setErrors({});
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setErr("email", data.error); return; }
    setSecurityQuestion(data.securityQuestion);
    setStep("answer");
  };

  // Step 2 — verify answer + set new password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!securityAnswer.trim()) errs.securityAnswer = "Security answer is required.";
    if (!newPassword) errs.newPassword = "New password is required.";
    else if (newPassword.length < 8) errs.newPassword = "Password must be at least 8 characters.";
    if (!confirmPassword) errs.confirmPassword = "Please confirm your password.";
    else if (newPassword !== confirmPassword) errs.confirmPassword = "Passwords do not match.";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, securityAnswer, newPassword, confirmPassword }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setErr("securityAnswer", data.error); return; }
    setStep("success");
  };

  return (
    <div className={authStyles.page}>
      <Navbar />
      <div className={authStyles.authWrapper}>
        <div className={authStyles.authCard}>
          <div className={authStyles.authBadge}>🔑</div>

          {/* STEP INDICATOR */}
          <div className={authStyles.stepIndicator}>
            {["Find Account", "Verify", "Done"].map((label, i) => {
              const stepIndex = step === "email" ? 0 : step === "answer" ? 1 : 2;
              return (
                <div key={label} className={authStyles.stepItem}>
                  <div className={`${authStyles.stepDot} ${i <= stepIndex ? authStyles.stepDotActive : ""}`}>
                    {i < stepIndex ? "✓" : i + 1}
                  </div>
                  <span className={`${authStyles.stepLabel} ${i <= stepIndex ? authStyles.stepLabelActive : ""}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* STEP 1 — EMAIL */}
          {step === "email" && (
            <>
              <h1>Forgot Password</h1>
              <p className={authStyles.subtitle}>Enter your email to find your account.</p>
              <form onSubmit={handleEmailSubmit} noValidate>
                <div className={authStyles.formGroup}>
                  <label>Email Address</label>
                  <div className={`${authStyles.inputWrapper} ${errors.email ? authStyles.inputError : ""}`}>
                    <span className={authStyles.inputIcon}>✉️</span>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); clearErr("email"); }}
                    />
                  </div>
                  {errors.email && <span className={authStyles.fieldError}>{errors.email}</span>}
                </div>
                <button type="submit" className={authStyles.submitBtn} disabled={loading}>
                  {loading ? "Searching..." : "Find My Account"}
                </button>
              </form>
              <p className={authStyles.switchText}>
                Remember your password? <Link href="/login">Sign in</Link>
              </p>
            </>
          )}

          {/* STEP 2 — SECURITY ANSWER + NEW PASSWORD */}
          {step === "answer" && (
            <>
              <h1>Reset Password</h1>
              <p className={authStyles.subtitle}>Answer your security question to reset your password.</p>
              <form onSubmit={handleResetSubmit} noValidate>
                <div className={authStyles.securityQuestionBox}>
                  <span className={authStyles.securityQuestionLabel}>Security Question</span>
                  <p className={authStyles.securityQuestionText}>{securityQuestion}</p>
                </div>

                <div className={authStyles.formGroup}>
                  <label>Your Answer</label>
                  <div className={`${authStyles.inputWrapper} ${errors.securityAnswer ? authStyles.inputError : ""}`}>
                    <span className={authStyles.inputIcon}>💬</span>
                    <input
                      type="text"
                      placeholder="Enter your answer"
                      value={securityAnswer}
                      onChange={(e) => { setSecurityAnswer(e.target.value); clearErr("securityAnswer"); }}
                    />
                  </div>
                  {errors.securityAnswer && <span className={authStyles.fieldError}>{errors.securityAnswer}</span>}
                </div>

                <div className={authStyles.formGroup}>
                  <label>New Password</label>
                  <div className={`${authStyles.inputWrapper} ${errors.newPassword ? authStyles.inputError : ""}`}>
                    <span className={authStyles.inputIcon}>🔒</span>
                    <input
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); clearErr("newPassword"); }}
                    />
                  </div>
                  {errors.newPassword && <span className={authStyles.fieldError}>{errors.newPassword}</span>}
                </div>

                <div className={authStyles.formGroup}>
                  <label>Confirm New Password</label>
                  <div className={`${authStyles.inputWrapper} ${errors.confirmPassword ? authStyles.inputError : ""}`}>
                    <span className={authStyles.inputIcon}>🔒</span>
                    <input
                      type="password"
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); clearErr("confirmPassword"); }}
                    />
                  </div>
                  {errors.confirmPassword && <span className={authStyles.fieldError}>{errors.confirmPassword}</span>}
                </div>

                <button type="submit" className={authStyles.submitBtn} disabled={loading}>
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
                <button type="button" className={authStyles.backBtn} onClick={() => setStep("email")}>
                  ← Back
                </button>
              </form>
            </>
          )}

          {/* STEP 3 — SUCCESS */}
          {step === "success" && (
            <div className={authStyles.successBox}>
              <div className={authStyles.successIcon}>✅</div>
              <h1>Password Reset!</h1>
              <p className={authStyles.subtitle}>
                Your password has been successfully updated. You can now sign in with your new password.
              </p>
              <button className={authStyles.submitBtn} onClick={() => router.push("/login")}>
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
