export default function PaymentFailedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-bold text-red-600">
        ❌ Payment Failed
      </h1>

      <p className="mt-2 text-gray-600">
        Your payment could not be processed.
      </p>

      <p className="mt-1 text-sm text-gray-500">
        Please try again or use a different card.
      </p>

      <a
        href="/"
        className="mt-6 rounded-md bg-black px-5 py-2 text-white"
      >
        Go Back Home
      </a>
    </main>
  );
}