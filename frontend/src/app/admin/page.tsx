"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
import { api } from "@/services/api";
import type { Venue } from "@/types";

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [venues, setVenues] = useState<Venue[]>([]);

  const load = async () => {
    const [venuesRes] = await Promise.all([api.get("/admin/pending-venues")]);
    // setAnalytics(analyticsRes.data);
    setVenues(venuesRes.data);
  };
  useEffect(() => { load(); }, []);

  const decide = async (id: string, action: "approve" | "reject") => {
    await api.patch(`/admin/venues/${id}/${action}`, {});
    await load();
  };

  return (
    <Protected role="ADMIN">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin</h1>
          <Link href="/admin/bookings" className="rounded-md bg-ink px-4 py-2 text-white">Bookings</Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {["totalUsers", "totalVenues", "totalBookings", "totalRevenue"].map((key) => (
            <div key={key} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm capitalize text-slate-600">{key.replace("total", "total ")}</p>
              <p className="mt-2 text-2xl font-bold">{analytics?.[key] ?? 0}</p>
            </div>
          ))}
        </div>
        <section className="mt-8">
          <h2 className="text-2xl font-bold">Pending venues</h2>
          <div className="mt-4 grid gap-3">
            {venues.map((venue) => (
              <div key={venue.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <h3 className="font-semibold">{venue.name}</h3>
                    <p className="text-sm text-slate-600">{venue.city} · INR {Number(venue.price).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => decide(venue.id, "approve")} className="rounded-md bg-teal px-3 py-2 text-sm font-medium text-white">Approve</button>
                    <button onClick={() => decide(venue.id, "reject")} className="rounded-md border border-slate-300 px-3 py-2 text-sm">Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </Protected>
  );
}
