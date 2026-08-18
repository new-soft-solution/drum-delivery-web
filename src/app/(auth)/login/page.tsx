"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { saveSession } from "@/lib/drum-tracer/session-client";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Sign in failed");
      saveSession(json.user);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4 p-md-5">
        <h3 className="fw-bold mb-1">Welcome back</h3>
        <p className="text-muted small mb-4">Sign in to your Drum Tracer account</p>

        {error && (
          <div className="alert alert-danger py-2 small d-flex align-items-center gap-2" role="alert">
            <IconifyIcon icon="ri:error-warning-line" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Username or email</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <IconifyIcon icon="ri:user-line" />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          <div className="mb-2">
            <div className="d-flex justify-content-between">
              <label className="form-label small fw-semibold">Password</label>
              <Link href="/forgot-password" className="small fw-semibold text-decoration-none">
                Forgot password?
              </Link>
            </div>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <IconifyIcon icon="ri:lock-line" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-group-text bg-white"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <IconifyIcon icon={showPassword ? "ri:eye-off-line" : "ri:eye-line"} />
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-4 py-2 fw-semibold" disabled={loading}>
            {loading ? (
              <span className="d-inline-flex align-items-center gap-2">
                <span className="spinner-border spinner-border-sm" /> Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div className="text-center small text-muted mt-4 pt-3 border-top">
          Demo credentials: <code>admin</code> / <code>admin123</code>
        </div>
      </div>
    </div>
  );
}
