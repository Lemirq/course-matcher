"use client";
import { useEffect, useState } from "react";
import { prettifyYear } from "../utils/prettifyYear";
import type { Student } from "@/types";

export default function StudentsPage() {
  const [q, setQ] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchStudents() {
    setLoading(true);
    setError(null);
    try {
      const url = q
        ? `/api/students?q=${encodeURIComponent(q)}`
        : "/api/students";
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch");
      setStudents(json.students || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="font-sans max-w-3xl mx-auto p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Students</h1>
      <div className="flex gap-2">
        <input
          className="border rounded px-3 h-10 flex-1"
          placeholder="Search name or email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          className="rounded bg-foreground text-background h-10 px-4"
          onClick={fetchStudents}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <ul className="gap-3 grid grid-cols-1 md:grid-cols-2">
        {students.map((s) => (
          <li key={s.id} className="border rounded p-3">
            <div className="font-medium">{s.name}</div>
            <div className="text-sm text-gray-400">{s.email}</div>
            <div className="text-sm text-gray-400">{prettifyYear(s.year)}</div>
            <div className="text-sm text-gray-400">{s.campus}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
