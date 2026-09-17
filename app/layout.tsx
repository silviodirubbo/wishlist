import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { PoweredByTag } from "@/components/PoweredByTag";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Wishlist",
  description: "A personal wishlist and budget tracker.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        {children}
        <PoweredByTag />
      </body>
    </html>
  );
}
