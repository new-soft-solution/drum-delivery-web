// The real backend's schema.yaml documents /api/auth/me/'s response as
// empty ("No response body") — a drf-spectacular gap, not a real design
// choice, since a /me/ endpoint returning nothing would be useless. Every
// field below is an educated guess based on Django/DRF-JWT conventions,
// NOT confirmed against the live API. Every field is optional and the
// index signature accepts anything else the backend actually sends — the
// UI (TopNavigationBar, Profile page) treats all of these defensively
// (`user?.first_name`, falling back to placeholders) precisely because of
// this uncertainty.
export interface SessionUser {
  id?: number | string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
  avatar?: string | null;
  is_active?: boolean;
  [key: string]: unknown;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
}

export interface SessionState {
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  setSession: (session: Session | null) => void;
  updateUser: (user: Partial<SessionUser>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearSession: () => void;
}
