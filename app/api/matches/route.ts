import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";

// Return students who share at least one course with the given student
// GET /api/matches?email=... or ?id=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const id = searchParams.get("id");
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

    // Students with overlapping course codes (excluding the student)
    const { data: matches, error: matchesErr } = await supabase
      .from("student_courses")
      .select("student_id, course_code, students:student_id(id,name,email)")
      .in("course_code", codes)
      .neq("student_id", studentId);
    if (matchesErr) throw matchesErr;

    // Aggregate by student
    const agg = new Map<
      string,
      {
        student: { id: string; name: string; email: string };
        sharedCourses: string[];
      }
    >();
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
      };
      if (!s.id) continue;
      if (!agg.has(sid)) agg.set(sid, { student: s, sharedCourses: [] });
      agg.get(sid)!.sharedCourses.push(course);
    }

    const result = Array.from(agg.values()).map((r) => ({
      student: r.student,
      sharedCourses: Array.from(new Set(r.sharedCourses)).sort(),
    }));

    return NextResponse.json({ ok: true, matches: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
