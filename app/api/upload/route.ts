import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabase } from "@/app/lib/supabase";
import { parseIcs } from "@/app/lib/ics";
import { enforceRateLimit } from "@/app/lib/rateLimit";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  year: z.enum(["first", "second", "third", "fourth", "fifth"]),
  ics: z.string().min(10),
});

export async function POST(req: NextRequest) {
  try {
    await enforceRateLimit(req, "upload", 60, 5);
    const body = await req.json();
    const { name, email, year, ics } = schema.parse(body);

    const parsed = await parseIcs(ics);

    const supabase = getSupabase();
    // Reject duplicate email for now (no update yet)
    const { data: existing, error: existingErr } = await supabase
      .from("students")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (existingErr) throw existingErr;
    if (existing) {
      return NextResponse.json(
        {
          ok: false,
          error: "This email already exists. Updates are not supported yet.",
        },
        { status: 409 }
      );
    }

    // Insert student
    const { data: studentData, error: studentErr } = await supabase
      .from("students")
      .insert({ name, email, year })
      .select()
      .single();
    if (studentErr) throw studentErr;
    const studentId = studentData.id as string;

    // Store raw calendar
    const { error: calErr } = await supabase
      .from("calendars")
      .upsert({ student_id: studentId, raw_ics: ics })
      .select()
      .single();
    if (calErr) throw calErr;

    // Upsert courses for student
    if (parsed.courses.length > 0) {
      const rows = parsed.courses.map((c) => ({
        student_id: studentId,
        course_code: c.courseCode,
        section: c.section,
      }));
      const { error: courseErr } = await supabase
        .from("student_courses")
        .upsert(rows, { onConflict: "student_id,course_code" });
      if (courseErr) throw courseErr;
    }

    // Store events (truncate then insert to reflect latest upload)
    await supabase.from("events").delete().eq("student_id", studentId);
    if (parsed.events.length > 0) {
      const eventsRows = parsed.events.map((e) => ({
        student_id: studentId,
        uid: e.uid,
        summary: e.summary,
        location: e.location,
        description: e.description,
        start_time: e.start,
        end_time: e.end,
        rrule: e.rrule,
        exdates: e.exdates,
      }));
      const { error: evErr } = await supabase.from("events").insert(eventsRows);
      if (evErr) throw evErr;
    }

    return NextResponse.json({
      ok: true,
      courses: parsed.courses.length,
      events: parsed.events.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
