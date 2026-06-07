"use client";

import { useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
import { api } from "@/services/api";
import type { Booking } from "@/types";

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  useEffect(() => {
    api.get("/owner/bookings").then((res) => setBookings(res.data));
  }, []);

  return (
    <Protected role="VENUE_OWNER">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold">Venue bookings</h1>
        <div className="mt-6 grid gap-3">
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold">{booking.venue.name}</h2>
              <p className="text-sm text-slate-600">{new Date(booking.date).toLocaleDateString()} · {booking.slot.label} · {booking.status}</p>
            </div>
          ))}
        </div>
      </main>
    </Protected>
  );
}
