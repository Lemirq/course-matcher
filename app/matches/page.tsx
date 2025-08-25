"use client";
import { useEffect, useState } from "react";

type Match = {
  student: { id: string; name: string; email: string };
  sharedCourses: string[];
};

export default function MatchesPage() {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search() {
    if (!query) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/matches?email=${encodeURIComponent(query)}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch");
      setMatches(json.matches || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // no-op initially
  }, []);

  return (
    <div className="font-sans max-w-3xl mx-auto p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Find Matches</h1>
      <div className="flex gap-2">
        <input
          className="border rounded px-3 h-10 flex-1"
          placeholder="Enter your email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="rounded bg-foreground text-background h-10 px-4"
          onClick={search}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <ul className="flex flex-col gap-3">
        {matches.map((m) => (
          <li key={m.student.id} className="border rounded p-3">
            <div className="font-medium">
              {m.student.name} ({m.student.email})
            </div>
            <div className="text-sm">
              Shared courses: {m.sharedCourses.join(", ")}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
