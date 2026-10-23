import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "NITORIX — Community Showroom",
  description:
    "NITORIX is a provisional working name for a fictional creation showroom. Explore community concepts and three interactive design workshops.",
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
