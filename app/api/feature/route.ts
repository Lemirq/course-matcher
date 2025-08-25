import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";

// GET /api/feature?key=allow-updates -> { count }
// POST /api/feature?key=allow-updates -> increments count
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key") ?? "allow-updates";
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("feature_votes")
      .select("count")
      .eq("feature_key", key)
      .maybeSingle();
    if (error) throw error;
    return NextResponse.json({ ok: true, count: data?.count ?? 0 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key") ?? "allow-updates";
    const supabase = getSupabase();
    // upsert increment
    const { data, error } = await supabase
      .from("feature_votes")
      .upsert({ feature_key: key, count: 0 }, { onConflict: "feature_key" })
      .select()
      .single();
    if (error) throw error;
    const current = (data?.count as number) ?? 0;
    const { error: incErr } = await supabase
      .from("feature_votes")
      .update({ count: current + 1 })
      .eq("feature_key", key);
    if (incErr) throw incErr;
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
