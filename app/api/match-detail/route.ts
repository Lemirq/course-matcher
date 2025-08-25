import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";

// GET /api/match-detail?meEmail=...&otherId=...
// Returns shared courses with their events (start/end/summary/location) for both students
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const meEmail = searchParams.get("meEmail");
    const otherId = searchParams.get("otherId");
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

    const courseMap = shared.map((code) => {
      const mine = (myEvents ?? []).filter((e) =>
        (e.summary as string).includes(code)
      );
      const theirs = (otherEvents ?? []).filter((e) =>
        (e.summary as string).includes(code)
      );
      return {
        course_code: code,
        myEvents: mine,
        otherEvents: theirs,
      };
    });

    return NextResponse.json({ ok: true, sharedCourses: courseMap });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
