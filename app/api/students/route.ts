import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    const supabase = getSupabase();
    let query = supabase
      .from("students")
      .select("id, name, email, year")
      .order("name");
    if (q && q.trim().length > 0) {
      const like = `%${q.trim()}%`;
      // Simple ilike on name or email
      query = query.or(`name.ilike.${like},email.ilike.${like}`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ ok: true, students: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
