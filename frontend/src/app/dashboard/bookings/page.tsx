"use client";

import { useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
import { api } from "@/services/api";
import type { Booking } from "@/types";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const load = async () => {
    const res = await api.get("/bookings/my");
    setBookings(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const cancel = async (id: string) => {
    await api.patch(`/bookings/${id}/cancel`);
    await load();
  };

  return (
    <Protected role="USER">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold">My bookings</h1>
        <div className="mt-6 grid gap-3">
          {bookings?.map((booking) => (
            <div key={booking.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <h2 className="font-semibold">{booking?.venue.name}</h2>
                  <p className="text-sm text-slate-600">{new Date(booking?.date).toLocaleDateString()} · {booking?.slot.label}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium">{booking?.status}</span>
                  {booking?.status !== "CANCELLED" && (
                    <button onClick={() => cancel(booking.id)} className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-600">Cancel</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </Protected>
  );
}
