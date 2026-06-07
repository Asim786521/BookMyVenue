"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import type { Venue } from "@/types";

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await api.get("/venues/search", { params: { city: city || undefined } });
    setVenues(res.data.items);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold">Find venues</h1>
          <p className="mt-1 text-slate-600">Search approved venues by city, capacity, price, and date.</p>
        </div>
        <div className="flex gap-2">
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
          <button onClick={load} className="rounded-md bg-ink px-4 py-2 text-white">Search</button>
        </div>
      </div>
      {loading ? <p className="mt-8">Loading venues...</p> : (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {venues.map((venue) => (
            <Link key={venue.id} href={`/venues/${venue.id}`} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-teal">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold">{venue.name}</h2>
                <span className="rounded bg-saffron px-2 py-1 text-xs font-semibold text-white">INR {Number(venue.price).toLocaleString()}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{venue.city}, {venue.state}</p>
              <p className="mt-3 line-clamp-3 text-sm text-slate-700">{venue.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {venue.amenities.slice(0, 4).map((item) => <span key={item} className="rounded bg-slate-100 px-2 py-1 text-xs">{item}</span>)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
