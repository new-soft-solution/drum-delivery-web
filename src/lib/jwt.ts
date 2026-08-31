export interface DecodedJwt {
  token_type?: "access" | "refresh";
  exp: number; // unix seconds
  iat?: number;
  jti?: string;
  user_id?: number;
  remember_me?: boolean;
}

export function decodeJwt(token: string): DecodedJwt | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof atob === "function"
        ? atob(normalized)
        : Buffer.from(normalized, "base64").toString("utf8");
    return JSON.parse(json) as DecodedJwt;
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string, skewSeconds = 15): boolean {
  const decoded = decodeJwt(token);
  if (!decoded) return true;
  return decoded.exp <= Math.floor(Date.now() / 1000) + skewSeconds;
}
