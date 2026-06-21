"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authStore } from "@/lib/auth";
import { api } from "@/services/api";

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
     console.log("data", data);
    setError("");
    try {
      const res = await api.post("/auth/login", data);
      authStore.save(res.data);
      router.refresh();
      const role = res.data.user.role;
      router.push(role === "ADMIN" ? "/admin" : role === "VENUE_OWNER" ? "/owner" : "/venues");
    } catch {
      setError("Invalid email or password.");
    }
  };

  return (
    <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center px-4 py-10">
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Login</h1>
        <p className="mt-1 text-sm text-slate-600">Access your venue booking workspace.</p>
        <div className="mt-6 grid gap-4">
          <input placeholder="Email" {...register("email")} />
          <input placeholder="Password" type="password" {...register("password")} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={formState.isSubmitting} className="rounded-md bg-ink px-4 py-2 font-medium text-white">
            {formState.isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </div>
        <p className="mt-4 text-sm text-slate-600">New here? <Link className="font-medium text-teal" href="/register">Create an account</Link></p>
      </form>
    </main>
  );
}
