"use client";

const SESSION_KEY = "dt_session";

export interface SessionUser {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  username: string;
}

export function saveSession(user: SessionUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("dt-session-changed"));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("dt-session-changed"));
}

export function getSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}
