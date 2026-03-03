import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Personal Todo",
  description: "ניהול משימות אישי חכם ויעיל",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
