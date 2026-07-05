"use client"

import { api } from "@/services/api";
import { Elements } from "@stripe/react-stripe-js";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CheckoutForm from "./CheckoutForm";
import { stripePromise } from "@/lib/stripe";

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const bookingId = searchParams.get("bookingId");

    if (!bookingId) return;

    api.post("/payments/create-order", { bookingId })
      .then((res) => {
        setClientSecret(res.data.clientSecret);
      });
  }, [searchParams]);

  if (!clientSecret) return <div>Loading...</div>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm />
    </Elements>
  );
}