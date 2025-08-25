import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";

// Group students into classes where course code, start/end times, and room match
// GET /api/classes?course=CSC&minSize=2
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseFilter = (searchParams.get("course") || "").trim();
    const minSize = Math.max(
      1,
      Number.parseInt(searchParams.get("minSize") || "2", 10) || 2
    );

    const supabase = getSupabase();

    // Pull events with student info; course code is embedded in summary
    const { data, error } = await supabase
      .from("events")
      .select(
        "summary, location, start_time, end_time, student_id, students:student_id(id,name,email,year)"
      );
    if (error) throw error;

    const COURSE_CODE_RE = /\b([A-Z]{3}\d{3}[HY]\d)\b/;

    type Row = {
      summary: string | null;
      location: string | null;
      start_time: string;
      end_time: string;
      students: {
        id: string;
        name: string;
        email: string;
        year: string;
      } | null;
    };

    const groups = new Map<
      string,
      {
        course_code: string;
        location: string | null;
        start_time: string;
        end_time: string;
        students: Array<{
          id: string;
          name: string;
          email: string;
          year: string;
        }>;
      }
    >();

    for (const raw of (data ?? []) as unknown as Row[]) {
      const summary = String(raw.summary ?? "");
      const match = summary.match(COURSE_CODE_RE);
      if (!match) continue;
      const courseCode = match[1];
      if (
        courseFilter &&
        !courseCode.toLowerCase().includes(courseFilter.toLowerCase())
      )
        continue;

      const start = String(raw.start_time ?? "");
      const end = String(raw.end_time ?? "");
      if (!start || !end) continue;
      const location = raw.location ?? null;
      const key = `${courseCode}|${start}|${end}|${location ?? ""}`;
      const student = raw.students;
      if (!student) continue;

      if (!groups.has(key)) {
        groups.set(key, {
          course_code: courseCode,
          location,
          start_time: start,
          end_time: end,
          students: [],
        });
      }
      const g = groups.get(key)!;
      if (!g.students.find((s) => s.id === student.id)) {
        g.students.push(student);
      }
    }

    let classes = Array.from(groups.values())
      .map((g) => ({ ...g, size: g.students.length }))
      .filter((g) => g.size >= minSize)
      .sort((a, b) => {
        if (b.size !== a.size) return b.size - a.size;
        if (a.course_code !== b.course_code)
          return a.course_code.localeCompare(b.course_code);
        return (
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
      });

    return NextResponse.json({ ok: true, classes });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
