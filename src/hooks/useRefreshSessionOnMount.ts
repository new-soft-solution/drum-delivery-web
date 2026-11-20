"use client";
import { useEffect } from "react";
import { getMe } from "@/services/auth/auth.service";
import { useSessionStore } from "@/store/useSessionStore";

export const useRefreshSessionOnMount = () => {
  const updateUser = useSessionStore((s) => s.updateUser);
  const hasSession = useSessionStore((s) => !!s.session);

  useEffect(() => {
    if (!hasSession) return;

    let cancelled = false;
    getMe()
      .then((user) => {
        if (!cancelled) updateUser(user);
      })
      .catch(() => {
        // Best-effort — a network hiccup or an about-to-expire token
        // shouldn't disrupt the page load.
      });

    return () => {
      cancelled = true;
    };
  }, []);
};

export default useRefreshSessionOnMount;
