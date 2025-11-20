import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/header";

export const metadata: Metadata = {
  title: "BibleRush",
  description: "Interactive Bible quiz game for churches and groups",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}

