"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Role } from "@/types";
import { authStore } from "@/lib/auth";

export function Protected({ role, children }: { role: Role; children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const user = authStore.user();
    if (!user || user.role !== role) router.replace("/login");
    else setAllowed(true);
  }, [role, router]);

  if (!allowed) return <div className="mx-auto max-w-6xl px-4 py-8">Loading...</div>;
  return <>{children}</>;
}
