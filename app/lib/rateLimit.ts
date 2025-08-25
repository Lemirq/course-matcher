import { NextRequest } from "next/server";
import { getSupabase } from "@/app/lib/supabase";

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  const xrip = req.headers.get("x-real-ip");
  if (xrip) return xrip;
  // Last resort: use user agent as very weak differentiator
  return req.headers.get("user-agent") || "unknown";
}

export async function enforceRateLimit(
  req: NextRequest,
  scope: string,
  windowSeconds: number,
  limit: number
): Promise<void> {
  const ip = getClientIp(req);
  const key = `${scope}:${ip}`;
  const now = new Date();
  const windowStart = new Date(
    now.getTime() - windowSeconds * 1000
  ).toISOString();

  const supabase = getSupabase();

  // Read existing record
  const { data: existing, error: readErr } = await supabase
    .from("rate_limits")
    .select("key, count, window_start")
    .eq("key", key)
    .maybeSingle();
  if (readErr) throw readErr;

  if (!existing) {
    const { error: insErr } = await supabase
      .from("rate_limits")
      .insert({ key, count: 1, window_start: now.toISOString() });
    if (insErr) throw insErr;
    return;
  }

  const withinWindow = new Date(existing.window_start) >= new Date(windowStart);
  if (!withinWindow) {
    const { error: resetErr } = await supabase
      .from("rate_limits")
      .update({ count: 1, window_start: now.toISOString() })
      .eq("key", key);
    if (resetErr) throw resetErr;
    return;
  }

  if ((existing.count as number) >= limit) {
    const err: any = new Error("Rate limit exceeded. Please try again later.");
    err.status = 429;
    throw err;
  }

  const { error: incErr } = await supabase
    .from("rate_limits")
    .update({ count: (existing.count as number) + 1 })
    .eq("key", key);
  if (incErr) throw incErr;
}
