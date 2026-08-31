import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/cookie-storage";

const AUTH_PAGES = ["/login", "/forgot-password", "/reset-password"];

/**
 * Reads the zustand-persisted session cookie and checks for a refresh
 * token. We deliberately do NOT verify the JWT's signature here — this
 * proxy doesn't hold the backend's signing secret, only the backend does.
 * Every real request still goes straight to the backend with
 * `Authorization: Bearer <access token>` (see src/services/api.ts), which
 * rejects an invalid/tampered/expired token regardless of what this proxy
 * decided. This is a fast, cheap UX-level gate only.
 */
function hasSession(request: NextRequest): boolean {
  const raw = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw);
    return !!parsed?.state?.session?.refreshToken;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthPage = AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const authenticated = hasSession(request);

  if (authenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (isAuthPage) {
    return NextResponse.next();
  }
  if (!authenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only page navigations need this gate now — API calls go straight
    // from the browser to the real backend (see src/services/api.ts), not
    // through any Next.js /api/auth/* route, so there's nothing to gate
    // there anymore. The local mock /api/* routes for Drum Tracer entities
    // (clients, orders, ...) are intentionally left ungated for this demo.
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)",
  ],
};
