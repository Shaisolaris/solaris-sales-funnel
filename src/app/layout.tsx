import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solaris — 3-Step Checkout Demo",
  description:
    "Clean, multi-step sales funnel: product selection → customer info → payment. Next.js + Tailwind + Stripe test mode.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans text-slate-900 antialiased">{children}</body>
    </html>
  );
}
