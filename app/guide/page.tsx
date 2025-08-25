"use client";
import Link from "next/link";

export default function GuidePage() {
  return (
    <div className="font-sans max-w-2xl mx-auto p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">How to get your ICS file</h1>
      <ol className="list-decimal list-inside flex flex-col gap-3">
        <li>
          Open Acorn:{" "}
          <a
            className="underline"
            href="https://acorn.utoronto.ca/sws/#/timetable-and-exams"
            target="_blank"
            rel="noreferrer"
          >
            acorn.utoronto.ca
          </a>
        </li>
        <li>Go to Timetable & Exams.</li>
        <li>
          Click &quot;Download Calendar Export&quot; (this downloads a .ics
          file).
        </li>
        <li>Return to this app’s Home page.</li>
        <li>
          Enter your name and email, then upload the downloaded .ics file (or
          paste its contents).
        </li>
        <li>Submit to save and find course matches.</li>
      </ol>
      <div className="flex gap-3">
        <Link className="underline" href="/">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
