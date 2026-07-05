"use client";

import { useState } from "react";
import {
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";

export default function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setLoading(true);
        setError("");

        console.log("Calling confirmPayment...");

        const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: "http://localhost:3000/payment/success",
            },
        });

        console.log(result);

        if (result.error) {
            console.error(result.error);
            setError(result.error.message ?? "Payment failed");
            setLoading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />

            {error && (
                <p className="text-red-500 mt-2">{error}</p>
            )}

            <button
                type="submit"
                disabled={!stripe || loading}
                style={{
                    marginTop: "20px",
                    padding: "10px 16px",
                    background: "black",
                    color: "white",
                }}
            >
                {loading ? "Processing..." : "Pay Now"}
            </button>
        </form>
    );
}