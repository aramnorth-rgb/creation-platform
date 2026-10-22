import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Form & Field — Extraordinary, by design",
  description:
    "A fictional AI-assisted manufacturing marketplace. Explore thoughtfully imagined objects and the makers who could bring them to life.",
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
