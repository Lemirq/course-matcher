import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const vercelUrl = process.env.VERCEL_URL;

  if (vercelUrl === "utm-course-matcher.vercel.app") {
    const destination = new URL(
      request.nextUrl.pathname + request.nextUrl.search,
      "https://uoft-matcher.vhaan.me"
    );
    return NextResponse.redirect(destination, { status: 308 });
  }

  const { pathname } = request.nextUrl;

  // Allow the construction page and Next internals/static assets
  const isConstruction = pathname === "/construction";
  const isPublicAsset =
    pathname.startsWith("/_next/") || // Next.js internals
    pathname.startsWith("/static/") ||
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/public/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/manifest.json") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.startsWith("/og-image.png") ||
    pathname.startsWith("/vercel.svg") ||
    pathname.startsWith("/next.svg") ||
    pathname.startsWith("/globe.svg") ||
    pathname.startsWith("/window.svg") ||
    pathname.startsWith("/file.svg") ||
    pathname.startsWith("/google");
  const isApi = pathname.startsWith("/api/");

  if (!isConstruction && !isPublicAsset && !isApi) {
    const url = request.nextUrl.clone();
    url.pathname = "/construction";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
