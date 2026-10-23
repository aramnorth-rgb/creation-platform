import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Form & Field — The Community Exhibition",
  description:
    "An exhibition of fictional community creations. Explore a cinematic 3D gallery and interactive design studio.",
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
