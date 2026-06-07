"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import type { Venue, VenueSlot } from "@/types";

export default function VenueDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<VenueSlot[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get(`/venues/${id}`).then((res) => setVenue(res.data));
  }, [id]);

  const loadAvailability = async () => {
    const res = await api.get(`/venues/${id}/availability`, { params: { date } });
    setSlots(res.data);
  };

  const book = async (slotId: string) => {
    try {
      await api.post("/bookings", { venueId: id, slotId, date });
      router.push("/dashboard/bookings");
    } catch {
      setMessage("This slot is no longer available.");
    }
  };

  if (!venue) return <main className="mx-auto max-w-6xl px-4 py-8">Loading...</main>;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row">
          <div>
            <h1 className="text-3xl font-bold">{venue.name}</h1>
            <p className="mt-2 text-slate-600">{venue.address}, {venue.city}, {venue.state} {venue.pincode}</p>
          </div>
          <div className="text-xl font-bold text-teal">INR {Number(venue.price).toLocaleString()}</div>
        </div>
        <p className="mt-6 max-w-3xl text-slate-700">{venue.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {venue.amenities.map((item) => <span key={item} className="rounded bg-slate-100 px-2 py-1 text-sm">{item}</span>)}
        </div>
      </div>
      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Availability</h2>
        <div className="mt-4 flex gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <button onClick={loadAvailability} className="rounded-md bg-ink px-4 py-2 text-white">Check</button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {slots.map((slot) => (
            <button key={slot.id} disabled={!slot.available || !date} onClick={() => book(slot.id)} className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-left disabled:opacity-50">
              <span className="block font-medium">{slot.label}</span>
              <span className="text-sm text-slate-600">{slot.startTime} - {slot.endTime}</span>
            </button>
          ))}
        </div>
        {message && <p className="mt-3 text-sm text-red-600">{message}</p>}
      </section>
    </main>
  );
}
