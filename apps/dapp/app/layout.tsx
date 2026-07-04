import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Puff DApp",
  description: "Decentralized application for Puff platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
