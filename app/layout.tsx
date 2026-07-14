import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const APP_URL = "https://rasta-trafik.vercel.app";
const TITLE = "Rasta Trafik";
const DESCRIPTION =
  "Hitta rastplatser längs din resa i Sverige. Ställ frågor på naturligt svenska, planera stopp längs din rutt och låt AI:n guida dig hela vägen.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg" },
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: "Rasta Trafik",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Rasta Trafik" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Rasta Trafik",
  },
};

export const viewport = {
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className={`font-sans ${geist.variable}`}>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
