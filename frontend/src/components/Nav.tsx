"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authStore } from "@/lib/auth";

export function Nav() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  // 1. Convert user variable into a React state
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 2. Fetch the user safely on the client side during mount
    setUser(authStore.user());
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/venues" className="text-lg font-bold text-ink">
            BookMyVenue
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/venues" className="text-lg font-bold text-ink">
          BookMyVenue
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/venues">Venues</Link>
          {user?.role === "USER" && <Link href="/dashboard/bookings">Bookings</Link>}
          {user?.role === "VENUE_OWNER" && <Link href="/owner">Owner</Link>}
          {user?.role === "ADMIN" && <Link href="/admin">Admin</Link>}

          {user ? (
            <button
              className="rounded-md bg-ink px-3 py-2 text-white"
              onClick={() => {
                authStore.clear();
                // 3. Clear user state immediately so navbar updates instantly on logout
                setUser(null); 
                router.push("/login");
              }}
            >
              Logout
            </button>
          ) : (
            <Link className="rounded-md bg-teal px-3 py-2 font-medium text-white" href="/login">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
