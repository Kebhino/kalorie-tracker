import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nawigacja from "./components/Nawigacja";
import ChatAssistant from "./components/ChatAssistant";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mój Tracker Kalorii i Wagi",
  description:
    "Monitoruj swoją wagę i kalorie z pięknym interfejsem i wykresami.",
  openGraph: {
    title: "Mój Tracker Kalorii i Wagi",
    description:
      "Monitoruj swoją wagę i kalorie z pięknym interfejsem i wykresami.",
    url: "https://waga.kebeprojects.com",
    siteName: "Tracker",
    images: [
      {
        url: "https://waga.kebeprojects.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Podgląd aplikacji Tracker",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mój Tracker Kalorii i Wagi",
    description:
      "Monitoruj swoją wagę i kalorie z pięknym interfejsem i wykresami.",
    images: ["https://waga.kebeprojects.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="lemonade">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Nawigacja />
        <ChatAssistant />
        {children}
      </body>
    </html>
  );
}
