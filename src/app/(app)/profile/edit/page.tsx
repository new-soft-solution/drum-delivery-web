"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import IconifyIcon from "@/components/wrappers/IconifyIcon";

export default function EditProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((p) => {
        setForm({ firstName: p.firstName, lastName: p.lastName || "", email: p.email, phone: p.phone || "" });
        setLoaded(true);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to save");
      setSaved(true);
      setTimeout(() => router.push("/profile"), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
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

      <div className="card border-0 shadow-sm" style={{ maxWidth: 640 }}>
        <div className="card-body p-4">
          <h5 className="fw-bold mb-1">Edit Profile</h5>
          <p className="text-muted small mb-4">Update your personal information.</p>

          {error && (
            <div className="alert alert-danger py-2 small d-flex align-items-center gap-2">
              <IconifyIcon icon="ri:error-warning-line" />
              {error}
            </div>
          )}
          {saved && (
            <div className="alert alert-success py-2 small d-flex align-items-center gap-2">
              <IconifyIcon icon="ri:checkbox-circle-line" />
              Profile updated
            </div>
          )}

          {!loaded ? (
            <p className="text-muted small">Loading...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold">First name</label>
                  <input
                    className="form-control"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold">Last name</label>
                  <input
                    className="form-control"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Phone</label>
                  <input
                    className="form-control"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+31 6 1234 5678"
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <Link href="/profile" className="btn btn-outline-secondary">
                  Cancel
                </Link>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
