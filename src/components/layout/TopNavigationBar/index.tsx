"use client";
import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { Dropdown } from "react-bootstrap";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeModeToggle from "./components/ThemeModeToggle";
import LeftSideBarToggle from "./components/LeftSideBarToggle";
import useScrollEvent from "@/hooks/useScrollEvent";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Avatar from "@/components/ui/Avatar/Avatar";
import { clearSession, getSession, type SessionUser } from "@/lib/drum-tracer/session-client";

const TopNavigationBar = () => {
  const { scrollY } = useScrollEvent();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    setUser(getSession());
    const onChange = () => setUser(getSession());
    window.addEventListener("dt-session-changed", onChange);
    return () => window.removeEventListener("dt-session-changed", onChange);
  }, []);

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "Admin User";

  return (
    <div className="topbar d-print-none">
      <div className="container-xxl">
        <nav
          className={clsx("topbar-custom d-flex justify-content-between", {
            "nav-sticky": scrollY >= 50,
          })}
          id="topbar-custom"
        >
          <ul className="topbar-item list-unstyled d-inline-flex align-items-center mb-0">
            <LeftSideBarToggle />
            <li className="mx-3 welcome-text">
              <h5 className="mb-0 fw-semibold text-truncate" style={{ letterSpacing: "0.01em" }}>
                <span className="text-body-secondary fw-normal me-1">Midal Cables</span>
                Drum Tracer
              </h5>
            </li>
          </ul>
          <ul className="topbar-item list-unstyled d-inline-flex align-items-center mb-0">
            <ThemeModeToggle />
            <li className="topbar-item">
              <Dropdown align="end">
                <Dropdown.Toggle
                  as="button"
                  className="btn btn-link nav-link d-flex align-items-center gap-2 text-decoration-none border-0 bg-transparent"
                  style={{ boxShadow: "none" }}
                >
                  <Avatar name={fullName} size={30} />
                  <span className="d-none d-sm-inline">
                    <span className="fw-semibold small d-block text-dark">{fullName}</span>
                    <span className="small text-muted" style={{ fontSize: 11 }}>
                      {user?.role ?? "Administrator"}
                    </span>
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} href="/profile">
                    <IconifyIcon icon="ri:user-line" className="me-2" />
                    My Profile
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} href="/profile/edit">
                    <IconifyIcon icon="ri:edit-line" className="me-2" />
                    Edit Profile
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} href="/profile/change-password">
                    <IconifyIcon icon="ri:lock-password-line" className="me-2" />
                    Change Password
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    <IconifyIcon icon="ri:logout-box-r-line" className="me-2" />
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default TopNavigationBar;
