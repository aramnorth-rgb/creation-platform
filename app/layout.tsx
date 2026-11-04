import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "NITORIX — Imagine it. Make it yours.",
  description:
    "A thoughtful place to explore products, make them personal and discover the possibilities of manufacturing. Platform preview with fictional demonstration content.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
