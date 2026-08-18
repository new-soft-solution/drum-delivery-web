"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import IconifyIcon from "@/components/wrappers/IconifyIcon";

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  username: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(setProfile);
  }, []);

  const fullName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : "";

  return (
    <>
      <div
        className="card border-0 shadow-sm mb-3 overflow-hidden"
        style={{
          background: "linear-gradient(120deg, #003d36, #008071 60%, #14b8a6)",
        }}
      >
        <div className="card-body p-4 p-md-5 d-flex align-items-center gap-4 flex-wrap text-white">
          {profile ? (
            <>
              <span
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)",
                  border: "3px solid rgba(255,255,255,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                  fontWeight: 800,
                }}
              >
                {fullName
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </span>
              <div className="flex-grow-1">
                <h3 className="fw-bold mb-1">{fullName}</h3>
                <div className="opacity-90 d-flex align-items-center gap-2 flex-wrap small">
                  <span className="badge bg-white text-dark fw-semibold">{profile.role}</span>
                  <span className="d-flex align-items-center gap-1">
                    <IconifyIcon icon="ri:mail-line" /> {profile.email}
                  </span>
                </div>
              </div>
              <Link href="/profile/edit" className="btn btn-light fw-semibold">
                <IconifyIcon icon="ri:edit-line" className="me-1" />
                Edit Profile
              </Link>
            </>
          ) : (
            <div className="placeholder-glow w-100">
              <span className="placeholder col-3" style={{ height: 84, borderRadius: "50%" }} />
            </div>
          )}
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">Account Information</h6>
              {!profile ? (
                <p className="text-muted small">Loading...</p>
              ) : (
                <div className="row g-3">
                  <div className="col-sm-6">
                    <div className="text-muted small">First name</div>
                    <div className="fw-semibold">{profile.firstName}</div>
                  </div>
                  <div className="col-sm-6">
                    <div className="text-muted small">Last name</div>
                    <div className="fw-semibold">{profile.lastName || "—"}</div>
                  </div>
                  <div className="col-sm-6">
                    <div className="text-muted small">Email</div>
                    <div className="fw-semibold">{profile.email}</div>
                  </div>
                  <div className="col-sm-6">
                    <div className="text-muted small">Phone</div>
                    <div className="fw-semibold">{profile.phone || "—"}</div>
                  </div>
                  <div className="col-sm-6">
                    <div className="text-muted small">Username</div>
                    <div className="fw-semibold">{profile.username}</div>
                  </div>
                  <div className="col-sm-6">
                    <div className="text-muted small">Role</div>
                    <div className="fw-semibold">{profile.role}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">Security</h6>
              <p className="text-muted small mb-3">
                Keep your account secure by using a strong, unique password.
              </p>
              <Link href="/profile/change-password" className="btn btn-outline-secondary w-100">
                <IconifyIcon icon="ri:lock-password-line" className="me-1" />
                Change Password
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
