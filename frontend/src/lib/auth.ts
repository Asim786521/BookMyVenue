"use client";

import type { Role, User } from "@/types";

const accessKey = "bmv_access_token";
const refreshKey = "bmv_refresh_token";
const userKey = "bmv_user";

export const authStore = {
  save(data: { accessToken: string; refreshToken: string; user: User }) {
    localStorage.setItem(accessKey, data.accessToken);
    localStorage.setItem(refreshKey, data.refreshToken);
    localStorage.setItem(userKey, JSON.stringify(data.user));

    // Broadcast change to update Nav instantly
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth-change"));
    }
  },
  
  clear() {
    localStorage.removeItem(accessKey);
    localStorage.removeItem(refreshKey);
    localStorage.removeItem(userKey);

    // Broadcast change to clean Nav instantly
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth-change"));
    }
  },
  
  token() {
    return typeof window === "undefined" ? null : localStorage.getItem(accessKey);
  },
  
  user(): User | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(userKey);
    return raw ? JSON.parse(raw) : null;
  },
  
  hasRole(role: Role) {
    return authStore.user()?.role === role;
  }
};
