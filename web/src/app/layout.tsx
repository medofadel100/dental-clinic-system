import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-geist-sans", // Keeping variable name to match globals.css
});

export const metadata: Metadata = {
  title: "عيادة لومينا لطب الأسنان",
  description: "أحدث نظام إدارة وعناية بالأسنان",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={cairo.variable} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
