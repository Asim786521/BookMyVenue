"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authStore } from "@/lib/auth";
import { api } from "@/services/api";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["USER", "VENUE_OWNER"])
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "USER" }
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post("/auth/register", data);
      authStore.save(res.data);
      router.refresh();
      router.push(data.role === "VENUE_OWNER" ? "/owner" : "/venues");
    } catch {
      setError("Could not create account. Try another email.");
    }
  };

  return (
    <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center px-4 py-10">
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Create account</h1>
        <div className="mt-6 grid gap-4">
          <input placeholder="Name" {...register("name")} />
          <input placeholder="Email" {...register("email")} />
          <input placeholder="Password" type="password" {...register("password")} />
          <select {...register("role")}>
            <option value="USER">User</option>
            <option value="VENUE_OWNER">Venue owner</option>
          </select>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={formState.isSubmitting} className="rounded-md bg-teal px-4 py-2 font-medium text-white">
            {formState.isSubmitting ? "Creating..." : "Create account"}
          </button>
        </div>
      </form>
    </main>
  );
}
