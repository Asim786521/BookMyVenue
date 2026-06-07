"use client";

import { useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
import { api } from "@/services/api";
import type { Booking } from "@/types";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  useEffect(() => {
    api.get("/admin/bookings").then((res) => setBookings(res.data));
  }, []);

  return (
    <Protected role="ADMIN">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold">Booking overview</h1>
        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {bookings.map((booking) => (
            <div key={booking.id} className="border-b border-slate-100 p-4 last:border-0">
              <div className="flex flex-col justify-between gap-2 md:flex-row">
                <span className="font-medium">{booking.venue.name}</span>
                <span className="text-sm text-slate-600">{booking.status} · INR {Number(booking.amount).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </Protected>
  );
}
