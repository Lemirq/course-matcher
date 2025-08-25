import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Toaster } from "@/components/ui/sonner";

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
  openGraph: {
    title: "UofT Course Matcher",
    description:
      "Unofficial tool to find shared courses. Not affiliated with the University of Toronto.",
    url: "https://uoft-course-matcher.vercel.app",
    siteName: "UofT Course Matcher",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "UofT Course Matcher",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UofT Course Matcher",
    description:
      "Unofficial tool to find shared courses. Not affiliated with the University of Toronto.",
    images: ["/og-image.png"],
  },
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
              <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
                <Link href="/" className="font-medium">
                  UofT Course Matcher
                </Link>
                <nav className="flex items-center gap-3 text-sm">
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
                  <Link
                    href="/classes"
                    className="underline-offset-4 hover:underline"
                  >
                    Classes
                  </Link>
                  <ModeToggle />
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
        </ThemeProvider>
        <GoogleAnalytics gaId="G-Z4RVMHNB7J" />
        <Toaster />
      </body>
    </html>
  );
}
