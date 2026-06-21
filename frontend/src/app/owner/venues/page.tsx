"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Protected } from "@/components/Protected";
import { api } from "@/services/api";
import type { Venue } from "@/types";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(4),
  capacity: z.coerce.number().positive(),
  price: z.coerce.number().positive(),
  amenities: z.string()
});
type FormData = z.infer<typeof schema>;

export default function OwnerVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const { register, handleSubmit, reset, formState } = useForm<FormData>({ resolver: zodResolver(schema) });

  const load = async () => setVenues((await api.get("/owner/venues")).data);
  useEffect(() => { load(); }, []);

  const onSubmit = async (data: FormData) => {
    await api.post("/owner/venues", { ...data, amenities: data.amenities.split(",").map((item) => item.trim()).filter(Boolean) });
    reset();
    await load();
  };

  return (
    <Protected role="VENUE_OWNER">
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[360px_1fr]">
        <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="text-xl font-bold">Create venue</h1>
          <div className="mt-4 grid gap-3">
            <input placeholder="Name" {...register("name")} />
            <textarea placeholder="Description" {...register("description")} />
            <input placeholder="Address" {...register("address")} />
            <input placeholder="City" {...register("city")} />
            <input placeholder="State" {...register("state")} />
            <input placeholder="Pincode" {...register("pincode")} />
            <input placeholder="Capacity" type="number" {...register("capacity")} />
            <input placeholder="Price" type="number" {...register("price")} />
            <input placeholder="Amenities comma separated" {...register("amenities")} />
            <button disabled={formState.isSubmitting} className="rounded-md bg-teal px-4 py-2 font-medium text-white">Submit for approval</button>
          </div>
        </form>
        <section>
          <h2 className="text-2xl font-bold">Your venues</h2>
          <div className="mt-4 grid gap-3">
            {venues.map((venue) => (
              <div key={venue.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{venue.name}</h3>
                    <p className="text-sm text-slate-600">{venue.city} · {venue.capacity} guests</p>
                  </div>
                  <span className="text-xs font-semibold text-saffron">{venue.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </Protected>
  );
}
