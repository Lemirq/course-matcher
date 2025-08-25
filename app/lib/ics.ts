import ical, { VEvent } from "node-ical";

export type ParsedEvent = {
  uid: string;
  summary: string;
  location: string | null;
  description: string | null;
  start: string; // ISO
  end: string; // ISO
  rrule: string | null;
  exdates: string[]; // ISO strings
};

export type ParsedCourse = {
  courseCode: string; // e.g., CSC108H5
  section: string | null; // e.g., LEC0106, TUT0101
};

export type CalendarParseResult = {
  courses: ParsedCourse[];
  events: ParsedEvent[];
};

const COURSE_CODE_RE = /\b([A-Z]{3}\d{3}[HY]\d)\b/;

export async function parseIcs(rawIcs: string): Promise<CalendarParseResult> {
  const data = ical.sync.parseICS(rawIcs);

  const events: ParsedEvent[] = [];
  const coursesSet = new Map<string, ParsedCourse>();

  Object.values(data).forEach((item: unknown) => {
    const maybeEvent = item as Partial<VEvent> & { type?: string };
    if (!maybeEvent || maybeEvent.type !== "VEVENT") return;
    const ev = maybeEvent as VEvent;

    const summary = (ev.summary ?? "").toString();
    const location = ev.location ? ev.location.toString() : null;
    const description = ev.description ? ev.description.toString() : null;

    const startIso = ev.start ? new Date(ev.start as Date).toISOString() : "";
    const endIso = ev.end ? new Date(ev.end as Date).toISOString() : "";
    const rrule =
      (ev.rrule as { toString?: () => string } | undefined)?.toString?.() ??
      null;
    const exdates: string[] = [];
    if (ev.exdate) {
      Object.values(ev.exdate).forEach((d) => {
        try {
          exdates.push(new Date(d as Date).toISOString());
        } catch {
          // ignore invalid exdate entry
        }
      });
    }

    const uid = (ev.uid ?? `${summary}-${startIso}`).toString();

    events.push({
      uid,
      summary,
      location,
      description,
      start: startIso,
      end: endIso,
      rrule,
      exdates,
    });

    const match = summary.match(COURSE_CODE_RE);
    if (match) {
      const courseCode = match[1];
      // Try to capture section from summary remainder
      const remainder = summary.replace(courseCode, "").trim();
      const section = remainder.length > 0 ? remainder.split(/\s+/)[0] : null;
      if (!coursesSet.has(courseCode)) {
        coursesSet.set(courseCode, { courseCode, section });
      }
    }
  });

  return { courses: Array.from(coursesSet.values()), events };
}
