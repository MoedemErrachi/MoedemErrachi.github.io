import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { content } from "@/lib/content";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://moedemerrachi.github.io"),
  title: content.seo.title,
  description: content.seo.description,
  authors: [{ name: content.profile.name }],
  keywords: [
    content.profile.name,
    "software engineer",
    "DevOps",
    "CI/CD",
    "AWS",
    "Terraform",
    "web developer",
    "AI",
    "portfolio",
  ],
  openGraph: {
    title: content.seo.title,
    description: content.seo.description,
    type: "website",
    images: [{ url: "/photo.jpg", width: 590, height: 734, alt: content.profile.name }],
  },
  twitter: {
    card: "summary",
    title: content.seo.title,
    description: content.seo.description,
    images: ["/photo.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#08090b",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
