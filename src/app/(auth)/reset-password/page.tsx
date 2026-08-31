"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import IconifyIcon from "@/components/wrappers/IconifyIcon";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "demo-token";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const tooShort = password.length > 0 && password.length < 6;
  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Something went wrong");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
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
            <IconifyIcon icon="ri:shield-check-line" width={28} height={28} style={{ color: "#0f7a63" }} />
          </div>
          <h4 className="fw-bold mb-2">Password reset</h4>
          <p className="text-muted small mb-4">Your password has been updated. You can now sign in.</p>
          <Link href="/login" className="btn btn-primary w-100">
            Continue to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4 p-md-5">
        <h3 className="fw-bold mb-1">Set a new password</h3>
        <p className="text-muted small mb-4">Choose a strong password you haven&apos;t used before.</p>

        {error && (
          <div className="alert alert-danger py-2 small d-flex align-items-center gap-2" role="alert">
            <IconifyIcon icon="ri:error-warning-line" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">New password</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <IconifyIcon icon="ri:lock-line" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className={`form-control ${tooShort ? "is-invalid" : ""}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
              />
              <button
                type="button"
                className="input-group-text bg-white"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                <IconifyIcon icon={showPassword ? "ri:eye-off-line" : "ri:eye-line"} />
              </button>
            </div>
            <div className="form-text">At least 6 characters.</div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Confirm new password</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <IconifyIcon icon="ri:lock-line" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className={`form-control ${mismatch ? "is-invalid" : ""}`}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {mismatch && <div className="text-danger small mt-1">Passwords don&apos;t match</div>}
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-3 py-2 fw-semibold" disabled={loading}>
            {loading ? (
              <span className="d-inline-flex align-items-center gap-2">
                <span className="spinner-border spinner-border-sm" /> Resetting...
              </span>
            ) : (
              "Reset password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
