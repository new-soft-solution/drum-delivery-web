"use client";
import { useEffect, useState } from "react";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Avatar from "@/components/ui/Avatar/Avatar";
import { getMe } from "@/services/auth/auth.service";
import { useSessionStore } from "@/store/useSessionStore";
import type { SessionUser } from "@/types/session.type";

export default function ProfilePage() {
  const cachedUser = useSessionStore((s) => s.session?.user);
  const updateUser = useSessionStore((s) => s.updateUser);
  const [profile, setProfile] = useState<SessionUser | null>(
    cachedUser ?? null,
  );

  useEffect(() => {
    getMe()
      .then((fresh) => {
        setProfile(fresh);
        updateUser(fresh);
      })
      .catch(() => {
        // Keep showing the cached (login-time) snapshot if the live fetch
        // fails — better than a blank screen.
      });
  }, [updateUser]);

  const fullName =
    profile && (profile.first_name || profile.last_name)
      ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
      : profile?.email || "";

  return (
    <>
      <div
        className="card border-0 shadow-sm mb-3 overflow-hidden"
        style={{
          background:
            "linear-gradient(155deg, #040d23 0%, #203975 55%, #4073ec 100%)",
        }}
      >
        <div className="card-body p-4 p-md-5 d-flex align-items-center gap-4 flex-wrap text-white">
          {profile ? (
            <>
              <span
                style={{
                  border: "3px solid rgba(255,255,255,0.5)",
                  borderRadius: "50%",
                  display: "inline-flex",
                  padding: 2,
                }}
              >
                <Avatar
                  name={fullName || profile.email || "?"}
                  size={78}
                  imageSrc={profile.avatar ?? undefined}
                />
              </span>
              <div className="flex-grow-1">
                <h3 className="fw-bold mb-1">{fullName || profile.email}</h3>
                <div className="opacity-90 d-flex align-items-center gap-2 flex-wrap small">
                  {profile.role && (
                    <span className="badge bg-white text-primary fw-semibold text-capitalize">
                      {profile.role}
                    </span>
                  )}
                  {profile.email && (
                    <span className="d-flex align-items-center gap-1">
                      <IconifyIcon icon="ri:mail-line" /> {profile.email}
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="placeholder-glow w-100">
              <span
                className="placeholder col-3"
                style={{ height: 84, borderRadius: "50%" }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h6 className="fw-bold mb-3">Account Information</h6>
          {!profile ? (
            <p className="text-muted small">Loading...</p>
          ) : (
            <div className="row g-3">
              {profile.first_name !== undefined && (
                <div className="col-sm-6">
                  <div className="text-muted small">First name</div>
                  <div className="fw-semibold">{profile.first_name || "—"}</div>
                </div>
              )}
              {profile.last_name !== undefined && (
                <div className="col-sm-6">
                  <div className="text-muted small">Last name</div>
                  <div className="fw-semibold">{profile.last_name || "—"}</div>
                </div>
              )}
              <div className="col-sm-6">
                <div className="text-muted small">Email</div>
                <div className="fw-semibold">{profile.email || "—"}</div>
              </div>
              {profile.role !== undefined && (
                <div className="col-sm-6">
                  <div className="text-muted small">Role</div>
                  <div className="fw-semibold text-capitalize">
                    {profile.role || "—"}
                  </div>
                </div>
              )}
              {profile.is_active !== undefined && (
                <div className="col-sm-6">
                  <div className="text-muted small">Status</div>
                  <div className="fw-semibold">
                    {profile.is_active ? "Active" : "Inactive"}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
