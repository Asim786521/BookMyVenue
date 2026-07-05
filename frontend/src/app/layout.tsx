import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { AuthProvider } from "@/providers/AuthProvider";

export const metadata: Metadata = {
  title: "BookMyVenue",
  description: "Venue booking SaaS MVP"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Nav />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
