"use client";
import React from "react";
import clsx from "clsx";
import ThemeModeToggle from "./components/ThemeModeToggle";
import LeftSideBarToggle from "./components/LeftSideBarToggle";
import useScrollEvent from "@/hooks/useScrollEvent";

const TopNavigationBar = () => {
  const { scrollY } = useScrollEvent();

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
              <span className="nav-link d-flex align-items-center gap-2">
                <span
                  style={{ width: 9, height: 9, borderRadius: 999, background: "#22c55e" }}
                />
                <span className="fw-semibold small">Admin User</span>
                <span className="badge bg-primary-subtle text-primary">Admin</span>
              </span>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default TopNavigationBar;
