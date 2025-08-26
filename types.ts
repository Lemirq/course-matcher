// Global shared types for the application

export type Student = {
  id: string;
  name: string;
  email: string;
  year: string;
  campus: string;
};

export type EventSummary = {
  summary: string;
  location: string | null;
  start_time: string; // ISO string
  end_time: string; // ISO string
};

export type Match = {
  student: Pick<Student, "id" | "name" | "email" | "year">;
  sharedCourses: string[];
};

export type CourseDetail = {
  course_code: string;
  myEvents: EventSummary[];
  otherEvents: EventSummary[];
};

// Types related to ICS parsing
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

export type ClassGroup = {
  course_code: string;
  location: string | null;
  start_time: string;
  end_time: string;
  size: number;
  students: Array<Pick<Student, "id" | "name" | "email" | "year">>;
};

// Row returned from events join with nested student
export type EventWithStudentRow = {
  summary: string | null;
  location: string | null;
  start_time: string;
  end_time: string;
  students: Student | null;
};
