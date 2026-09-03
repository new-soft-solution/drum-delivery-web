"use client";
import { useState } from "react";
import Link from "next/link";
import IconifyIcon from "@/components/wrappers/IconifyIcon";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Something went wrong");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4 p-md-5 text-center">
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "#e7f5f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
            }}
          >
            <IconifyIcon icon="ri:mail-check-line" width={28} height={28} style={{ color: "#0f7a63" }} />
          </div>
          <h4 className="fw-bold mb-2">Check your inbox</h4>
          <p className="text-muted small mb-4">
            If an account exists for <b>{email}</b>, we&apos;ve sent a link to reset your password.
          </p>
          <Link href="/login" className="btn btn-outline-secondary w-100">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4 p-md-5">
        <Link href="/login" className="small fw-semibold text-decoration-none d-inline-flex align-items-center gap-1 mb-3">
          <IconifyIcon icon="ri:arrow-left-line" /> Back to sign in
        </Link>
        <h3 className="fw-bold mb-1">Forgot password?</h3>
        <p className="text-muted small mb-4">
          Enter the email linked to your account and we&apos;ll send you a reset link.
        </p>

        {error && (
          <div className="alert alert-danger py-2 small d-flex align-items-center gap-2" role="alert">
            <IconifyIcon icon="ri:error-warning-line" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Email</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <IconifyIcon icon="ri:mail-line" />
              </span>
              <input
                type="email"
                className="form-control"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-3 py-2 fw-semibold" disabled={loading}>
            {loading ? (
              <span className="d-inline-flex align-items-center gap-2">
                <span className="spinner-border spinner-border-sm" /> Sending...
              </span>
            ) : (
              "Send reset link"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
