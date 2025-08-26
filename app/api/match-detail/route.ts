import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";
import type { CourseDetail } from "@/types";

// GET /api/match-detail?meEmail=...&otherId=...
// Returns shared courses with their events (start/end/summary/location) for both students
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const meEmail = searchParams.get("meEmail");
    const otherId = searchParams.get("otherId");
    const mode = (searchParams.get("mode") || "courses").toLowerCase();
    if (!meEmail || !otherId)
      return NextResponse.json(
        { ok: false, error: "meEmail and otherId required" },
        { status: 400 }
      );

    const supabase = getSupabase();

    const { data: me, error: meErr } = await supabase
      .from("students")
      .select("id")
      .eq("email", meEmail)
      .single();
    if (meErr) throw meErr;
    const myId = me.id as string;

    const { data: myCourses, error: myCoursesErr } = await supabase
      .from("student_courses")
      .select("course_code")
      .eq("student_id", myId);
    if (myCoursesErr) throw myCoursesErr;
    const myCodes = new Set(
      (myCourses ?? []).map((r) => r.course_code as string)
    );

    const { data: otherCourses, error: otherCoursesErr } = await supabase
      .from("student_courses")
      .select("course_code")
      .eq("student_id", otherId);
    if (otherCoursesErr) throw otherCoursesErr;

    const shared = (otherCourses ?? [])
      .map((r) => r.course_code as string)
      .filter((c) => myCodes.has(c));

    if (shared.length === 0)
      return NextResponse.json({ ok: true, sharedCourses: [] });

    // Fetch events for both students, only for shared courses by matching summary course code
    const { data: myEvents } = await supabase
      .from("events")
      .select("summary, location, start_time, end_time")
      .eq("student_id", myId);
    const { data: otherEvents } = await supabase
      .from("events")
      .select("summary, location, start_time, end_time")
      .eq("student_id", otherId);

    let courseMap: CourseDetail[] = shared.map((code) => {
      const mine = (myEvents ?? []).filter((e) =>
        (e.summary as string).includes(code)
      );
      const theirs = (otherEvents ?? []).filter((e) =>
        (e.summary as string).includes(code)
      );
      return {
        course_code: code,
        myEvents: mine as unknown as CourseDetail["myEvents"],
        otherEvents: theirs as unknown as CourseDetail["otherEvents"],
      };
    });

    if (mode === "classes") {
      // Keep only exact overlapping class times within each course
      courseMap = courseMap
        .map((c) => {
          const myKeys = new Set(
            c.myEvents.map((e) => `${e.start_time}|${e.end_time}`)
          );
          const otherKeys = new Set(
            c.otherEvents.map((e) => `${e.start_time}|${e.end_time}`)
          );
          const overlapKeys = new Set<string>();
          for (const k of myKeys) if (otherKeys.has(k)) overlapKeys.add(k);
          const myOverlap = c.myEvents.filter((e) =>
            overlapKeys.has(`${e.start_time}|${e.end_time}`)
          );
          const theirOverlap = c.otherEvents.filter((e) =>
            overlapKeys.has(`${e.start_time}|${e.end_time}`)
          );
          return {
            course_code: c.course_code,
            myEvents: myOverlap,
            otherEvents: theirOverlap,
          };
        })
        .filter((c) => c.myEvents.length > 0 && c.otherEvents.length > 0);
    }

    return NextResponse.json({ ok: true, sharedCourses: courseMap });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
