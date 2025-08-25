import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UofT Course Matcher",
  description:
    "Unofficial tool to find shared courses. Not affiliated with the University of Toronto. Made by Vihaan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
            <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
              <Link href="/" className="font-medium">
                UofT Course Matcher
              </Link>
              <nav className="flex items-center gap-3 text-sm">
                <Link href="/" className="underline-offset-4 hover:underline">
                  Home
                </Link>
                <Link
                  href="/students"
                  className="underline-offset-4 hover:underline"
                >
                  Students
                </Link>
                <Link
                  href="/matches"
                  className="underline-offset-4 hover:underline"
                >
                  Matches
                </Link>
              </nav>
            </div>
          </header>
          <div className="flex-1">{children}</div>
          <footer className="mt-10 pb-6 text-center text-sm text-foreground/80 space-y-1">
            <div className="opacity-80">
              Unofficial — Not affiliated with the University of Toronto.
            </div>
            <div>
              Made with ❤️ by{" "}
              <a
                className="underline"
                href="https://vhaan.me"
                target="_blank"
                rel="noreferrer"
              >
                Vihaan
              </a>
            </div>
          </footer>
        </div>
        <GoogleAnalytics gaId="G-Z4RVMHNB7J" />
      </body>
    </html>
  );
}
