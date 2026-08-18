"use client";
import { useState } from "react";
import Link from "next/link";
import IconifyIcon from "@/components/wrappers/IconifyIcon";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update password");
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Link
        href="/profile"
        className="d-inline-flex align-items-center gap-1 mb-3 fw-semibold text-decoration-none small"
      >
        <IconifyIcon icon="ri:arrow-left-line" /> Back to profile
      </Link>

      <div className="card border-0 shadow-sm" style={{ maxWidth: 480 }}>
        <div className="card-body p-4">
          <h5 className="fw-bold mb-1">Change Password</h5>
          <p className="text-muted small mb-4">Choose a strong password you haven&apos;t used before.</p>

          {error && (
            <div className="alert alert-danger py-2 small d-flex align-items-center gap-2">
              <IconifyIcon icon="ri:error-warning-line" />
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success py-2 small d-flex align-items-center gap-2">
              <IconifyIcon icon="ri:checkbox-circle-line" />
              Password updated successfully
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Current password</label>
              <input
                type="password"
                className="form-control"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">New password</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <div className="form-text">At least 6 characters.</div>
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Confirm new password</label>
              <input
                type="password"
                className={`form-control ${mismatch ? "is-invalid" : ""}`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {mismatch && <div className="text-danger small mt-1">Passwords don&apos;t match</div>}
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Link href="/profile" className="btn btn-outline-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Updating..." : "Update password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
