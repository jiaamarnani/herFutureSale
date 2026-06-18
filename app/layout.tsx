import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Her Future Sale",
  description: "Built for women who mean business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Outfit:wght@300;400;500;600&family=Instrument+Serif:ital@1&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}