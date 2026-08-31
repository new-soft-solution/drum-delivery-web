export type UserType = {
    id: string;
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    token: string;
};

export interface RegisterFormData {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    address: string;
    avatar?: string;
}

export interface AuthResponse {
    message: string;
    access: string;
    refresh: string;
    data: Record<string, unknown>;
}

// src/types/auth.ts
export type UserRole =
    | "superadmin"
    | "restaurant_admin"
    | "employee"
    | "customer_support"
    | "content_manager"
    | "marketing_manager";

export interface UserSession {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
    };
    expires: string;
    accessToken: string;
    refreshToken: string;
}
