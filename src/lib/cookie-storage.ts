import Cookies from "js-cookie";
import type { PersistStorage, StorageValue } from "zustand/middleware";
import type { SessionState } from "@/types/session.type";
import { decodeJwt } from "./jwt";

export const SESSION_COOKIE_NAME = "dt_session";

/**
 * zustand's `persist` middleware needs get/set/remove. We back it with a
 * single cookie (not localStorage) specifically so `src/proxy.ts` — which
 * runs on the server before any page renders — can also read it. A JWT
 * decoded from the stored refresh token drives the cookie's expiry, so the
 * cookie never outlives the session it represents.
 */
export const cookieStorage: PersistStorage<Pick<SessionState, "session">> = {
  getItem: (name) => {
    const raw = Cookies.get(name);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StorageValue<Pick<SessionState, "session">>;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    const session = value.state.session;

    // A `null` session (e.g. after `clearSession()`) should remove the
    // cookie outright rather than persist `{session: null}` — the gate in
    // proxy.ts still treats a null session as logged-out either way, but
    // leaving a near-empty cookie behind is untidy and makes the intent
    // (does a session cookie exist at all?) less obvious to a reader.
    if (!session) {
      Cookies.remove(name, { path: "/" });
      return;
    }

    const decoded = session.refreshToken ? decodeJwt(session.refreshToken) : null;
    const expires = decoded?.exp ? new Date(decoded.exp * 1000) : 7; // days fallback

    Cookies.set(name, JSON.stringify(value), {
      expires,
      sameSite: "lax",
      path: "/",
      secure: typeof window !== "undefined" && window.location.protocol === "https:",
    });
  },
  removeItem: (name) => {
    Cookies.remove(name, { path: "/" });
  },
};
