"use client";

import axios from "axios";
import { authStore } from "@/lib/auth";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = authStore.token();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
