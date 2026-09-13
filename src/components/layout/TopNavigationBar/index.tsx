"use client";
import React from "react";
import clsx from "clsx";
import { Dropdown } from "react-bootstrap";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeModeToggle from "./components/ThemeModeToggle";
import LeftSideBarToggle from "./components/LeftSideBarToggle";
import useScrollEvent from "@/hooks/useScrollEvent";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Avatar from "@/components/ui/Avatar/Avatar";
import { useSessionStore } from "@/store/useSessionStore";
import { logoutUser } from "@/services/auth/auth.service";

const TopNavigationBar = () => {
  const { scrollY } = useScrollEvent();
  const router = useRouter();
  const user = useSessionStore((s) => s.session?.user);
  const clearSession = useSessionStore((s) => s.clearSession);
  const { session } = useSessionStore.getState();
  async function handleLogout() {
    try {
      await logoutUser(session?.refreshToken ?? "");
    } catch {
      // Even if the backend call fails (network hiccup, already-expired
      // session, etc.), still clear the local session below — there's no
      // scenario where staying "logged in" client-side is the right
      // fallback.
    }
    clearSession();
    router.push("/login");
    router.refresh();
  }

  const fullName =
    user && (user.first_name || user.last_name)
      ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
      : user?.email || "Signed in";

  return (
    <div className="topbar d-print-none">
      <div className="container-xxl">
        <nav
          // className={clsx("topbar-custom d-flex justify-content-between", {
          //   "nav-sticky": scrollY >= 50,
          // })}
          className={clsx(
            "topbar-custom d-flex justify-content-between nav-sticky",
          )}
          id="topbar-custom"
        >
          <ul className="topbar-item list-unstyled d-inline-flex align-items-center mb-0">
            <LeftSideBarToggle />
            <li className="mx-3 welcome-text">
              <h5
                className="mb-0 fw-semibold text-truncate"
                style={{ letterSpacing: "0.01em" }}
              >
                <span className="text-body-secondary fw-normal me-1">
                  Midal Cables
                </span>
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
                  className="btn btn-link nav-link d-flex align-items-center gap-2
                  text-decoration-none border-0 bg-transparent"
                  style={{ boxShadow: "none", textAlign: "left" }}
                >
                  <Avatar
                    name={fullName}
                    size={30}
                    imageSrc={user?.avatar ?? undefined}
                  />
                  <span className="d-none d-sm-inline">
                    <span className="fw-semibold small d-block text-dark">
                      {fullName}
                    </span>
                    <span
                      className="small text-muted d-block"
                      style={{ fontSize: 11 }}
                    >
                      {user?.role ?? "Administrator"}
                    </span>
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="p-0">
                  <Dropdown.Item as={Link} href="/profile">
                    <IconifyIcon icon="ri:user-line" className="me-2" />
                    My Profile
                  </Dropdown.Item>
                  <Dropdown.Divider className="m-0" />
                  <Dropdown.Item as={Link} href="/quick-order">
                    <IconifyIcon icon="ri:add-line" className="me-2" />
                    Quick Order
                  </Dropdown.Item>
                  <Dropdown.Divider className="m-0" />
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
