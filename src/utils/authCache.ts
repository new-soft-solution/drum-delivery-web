import {LoginResponse} from "@/types/user.type";

interface CachedAuth {
    data: LoginResponse;
    timestamp: number;
}

const authCache: Map<string, CachedAuth> = new Map();

export function setAuthCache(email: string, data: LoginResponse): void {
    authCache.set(email, {
        data,
        timestamp: Date.now(),
    });

    // Auto-clear after 5 minutes
    setTimeout(() => {
        authCache.delete(email);
    }, 5 * 60 * 1000);
}

export function getAuthCache(email: string): LoginResponse | null {
    const cached = authCache.get(email);
    if (!cached) return null;

    // Check if cache is still valid (5 minutes)
    if (Date.now() - cached.timestamp > 5 * 60 * 1000) {
        authCache.delete(email);
        return null;
    }

    return cached.data;
}

export function clearAuthCache(email: string): void {
    authCache.delete(email);
}