import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";
import type { Match } from "@/types";

// Return students who share at least one course with the given student
// GET /api/matches?email=... or ?id=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const id = searchParams.get("id");
    const mode = (searchParams.get("mode") || "courses").toLowerCase();
    if (!email && !id) {
      return NextResponse.json(
        { ok: false, error: "Provide email or id" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    let studentId = id ?? null;
    if (!studentId && email) {
      const { data, error } = await supabase
        .from("students")
        .select("id")
        .eq("email", email)
        .single();
      if (error) throw error;
      studentId = (data as { id: string }).id;
    }

    // Find course codes for this student
    const { data: myCourses, error: myCoursesErr } = await supabase
      .from("student_courses")
      .select("course_code")
      .eq("student_id", studentId);
    if (myCoursesErr) throw myCoursesErr;

    const codes = (myCourses ?? []).map(
      (r: { course_code: string }) => r.course_code
    );
    if (codes.length === 0) return NextResponse.json({ ok: true, matches: [] });

    // For exact classes mode, precompute keys of my class meeting times
    // Key format: `${course_code}|${start_time}|${end_time}`
    const myCodeSet = new Set<string>(codes);
    const myClassKeySet = new Set<string>();
    if (mode === "classes") {
      const { data: myEvents, error: myEventsErr } = await supabase
        .from("events")
        .select("summary, start_time, end_time")
        .eq("student_id", studentId);
      if (myEventsErr) throw myEventsErr;
      for (const e of myEvents ?? []) {
        const summary = String((e as { summary: string }).summary ?? "");
        const code = Array.from(myCodeSet).find((c) => summary.includes(c));
        if (!code) continue;
        const start = String((e as { start_time: string }).start_time ?? "");
        const end = String((e as { end_time: string }).end_time ?? "");
        if (!start || !end) continue;
        myClassKeySet.add(`${code}|${start}|${end}`);
      }
    }

    // Students with overlapping course codes (excluding the student)
    const { data: matches, error: matchesErr } = await supabase
      .from("student_courses")
      .select(
        "student_id, course_code, students:student_id(id,name,email,year)"
      )
      .in("course_code", codes)
      .neq("student_id", studentId);
    if (matchesErr) throw matchesErr;

    // Aggregate by student
    const agg = new Map<string, Match>();
    const rows = (matches ?? []) as unknown[] as Array<{
      student_id?: unknown;
      course_code?: unknown;
      students?: unknown;
    }>;
    for (const raw of rows) {
      const sid =
        typeof raw.student_id === "string"
          ? raw.student_id
          : String(raw.student_id ?? "");
      const course =
        typeof raw.course_code === "string"
          ? raw.course_code
          : String(raw.course_code ?? "");
      const nested = Array.isArray(raw.students)
        ? raw.students[0]
        : (raw.students as unknown);
      const student = nested as {
        id?: unknown;
        name?: unknown;
        email?: unknown;
        year?: unknown;
      } | null;
      if (!student) continue;
      const s = {
        id:
          typeof student.id === "string"
            ? student.id
            : String(student.id ?? ""),
        name:
          typeof student.name === "string"
            ? student.name
            : String(student.name ?? ""),
        email:
          typeof student.email === "string"
            ? student.email
            : String(student.email ?? ""),
        year:
          typeof student.year === "string"
            ? student.year
            : String(student.year ?? ""),
      };
      if (!s.id) continue;
      if (!agg.has(sid)) agg.set(sid, { student: s, sharedCourses: [] });
      agg.get(sid)!.sharedCourses.push(course);
    }

    let result = Array.from(agg.entries()).map(([sid, r]) => ({
      sid,
      student: r.student,
      sharedCourses: Array.from(new Set(r.sharedCourses)).sort(),
    }));

    if (mode === "classes") {
      // Filter to only students who share at least one exact class meeting time
      const filtered: typeof result = [];
      for (const entry of result) {
        // Fetch their events
        const { data: otherEvents, error: otherErr } = await supabase
          .from("events")
          .select("summary, start_time, end_time")
          .eq("student_id", entry.sid);
        if (otherErr) continue;
        const overlapCodes = new Set<string>();
        for (const e of otherEvents ?? []) {
          const summary = String((e as { summary: string }).summary ?? "");
          const code = Array.from(myCodeSet).find((c) => summary.includes(c));
          if (!code) continue;
          const start = String((e as { start_time: string }).start_time ?? "");
          const end = String((e as { end_time: string }).end_time ?? "");
          const key = `${code}|${start}|${end}`;
          if (myClassKeySet.has(key)) overlapCodes.add(code);
        }
        if (overlapCodes.size > 0) {
          filtered.push({
            ...entry,
            sharedCourses: Array.from(overlapCodes).sort(),
          });
        }
      }
      result = filtered;
    }

    // Strip sid before returning
    const finalResult = result.map((r) => ({
      student: r.student,
      sharedCourses: r.sharedCourses,
    }));

    console.log("finalResult", finalResult);

    return NextResponse.json({ ok: true, matches: finalResult });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
