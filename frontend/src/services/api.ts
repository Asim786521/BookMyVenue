"use client";

import axios from "axios";
import { authStore } from "@/lib/auth";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = authStore.token();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Bypasses the ngrok warning page so your CORS headers work
  config.headers["ngrok-skip-browser-warning"] = "true";

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authStore.clear();

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
