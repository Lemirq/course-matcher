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

  return NextResponse.next();
}


