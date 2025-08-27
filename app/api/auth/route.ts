import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      console.log("❌ Auth attempt failed: No password provided");
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    // Get current EST time
    const now = new Date();
    const estTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    
    // Format time as H:MM (e.g., "5:25" or "13:45")
    const hours = estTime.getHours();
    const minutes = estTime.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    // Expected password format: timeString + "vihaan"
    const expectedPassword = `${timeString}vihaan`;

    // Log authentication attempt details
    console.log("🔐 Authentication attempt:");
    console.log(`   - UTC Time: ${now.toISOString()}`);
    console.log(`   - EST Time: ${estTime.toLocaleString("en-US", { timeZone: "America/New_York" })}`);
    console.log(`   - Formatted Time: ${timeString}`);
    console.log(`   - Expected Password: "${expectedPassword}"`);
    console.log(`   - Provided Password: "${password}"`);
    console.log(`   - Passwords Match: ${password === expectedPassword}`);

    if (password === expectedPassword) {
      console.log("✅ Authentication successful");
      
      // Set authentication cookie
      const cookieStore = await cookies();
      cookieStore.set("site-auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });

      return NextResponse.json({ success: true });
    } else {
      console.log("❌ Authentication failed: Password mismatch");
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("💥 Auth endpoint error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}