"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
import { api } from "@/services/api";

export default function OwnerHomePage() {
  const [analytics, setAnalytics] = useState<{ totalBookings: number; monthlyRevenue: string } | null>(null);

  useEffect(() => {
    api.get("/analytics/owner").then((res) => setAnalytics(res.data));
  }, []);

  return (
    <Protected role="VENUE_OWNER">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold">Owner workspace</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Link href="/owner/venues" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">Manage venues</Link>
          <Link href="/owner/bookings" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">Manage bookings</Link>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Bookings</p>
            <p className="mt-2 text-2xl font-bold">{analytics?.totalBookings ?? 0}</p>
          </div>
        </div>
      </main>
    </Protected>
  );
}
