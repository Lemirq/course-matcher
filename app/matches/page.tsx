"use client";
import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams } from "next/navigation";

type Match = {
  student: { id: string; name: string; email: string; year: string };
  sharedCourses: string[];
};

type CourseDetail = {
  course_code: string;
  myEvents: {
    summary: string;
    location: string | null;
    start_time: string;
    end_time: string;
  }[];
  otherEvents: {
    summary: string;
    location: string | null;
    start_time: string;
    end_time: string;
  }[];
};

// Component that handles search params (must be wrapped in Suspense)
function MatchesPageContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return <MatchesPage email={email} />;
}

// Main component that receives email as a prop
function MatchesPage({ email }: { email?: string | null }) {
  const [query, setQuery] = useState(email || "");
  const [matches, setMatches] = useState<Match[]>([]);
  const [selected, setSelected] = useState<Match | null>(null);
  const [details, setDetails] = useState<CourseDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"courses" | "classes">("courses");

  useEffect(() => {
    if (email) {
      setQuery(email);
    }
  }, [email]);

  async function search() {
    if (!query) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/matches?email=${encodeURIComponent(query)}&mode=${mode}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch");
      setMatches(json.matches || []);
      setSelected(null);
      setDetails([]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  const resolveDay = (date: string) => {
    const day = new Date(date).getDay();
    return day === 0
      ? "Sunday"
      : day === 1
        ? "Monday"
        : day === 2
          ? "Tuesday"
          : day === 3
            ? "Wednesday"
            : day === 4
              ? "Thursday"
              : day === 5
                ? "Friday"
                : "Saturday";
  };

  async function loadDetail(m: Match) {
    setSelected(m);
    setLoadingDetail(true);
    try {
      const res = await fetch(
        `/api/match-detail?meEmail=${encodeURIComponent(query)}&otherId=${encodeURIComponent(m.student.id)}&mode=${mode}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch detail");
      setDetails(json.sharedCourses || []);
    } catch {
      setDetails([]);
    } finally {
      setLoadingDetail(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 font-sans">
      <h1 className="text-2xl font-semibold mb-4">Find Matches</h1>
      <div className="flex gap-2 mb-4 items-center">
        <Input
          placeholder="Enter your email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select
          value={mode}
          onValueChange={(v: "courses" | "classes") => setMode(v)}
        >
          <SelectTrigger className="min-w-44">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="courses">Exact courses</SelectItem>
            <SelectItem value="classes">Exact classes</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={search} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 border rounded">
          <ul className="divide-y">
            {matches.map((m) => (
              <li
                key={m.student.id}
                className={`p-3 cursor-pointer ${selected?.student.id === m.student.id ? "bg-accent/40" : "hover:bg-accent/20"}`}
                onClick={() => loadDetail(m)}
              >
                <div className="font-medium">{m.student.name}</div>
                <div className="text-xs text-muted-foreground">
                  {m.student.email}
                </div>
                <div className="text-xs text-muted-foreground">
                  {m.student.year}
                </div>
                <div className="text-xs mt-1">
                  Shared: {m.sharedCourses.join(", ")}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2 border rounded p-4 min-h-64">
          {!selected && (
            <div className="text-sm text-muted-foreground">
              Select a student to view details.
            </div>
          )}
          {selected && (
            <div className="space-y-4">
              <div>
                <div className="text-lg font-medium">
                  {selected.student.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selected.student.email}
                </div>
              </div>
              {loadingDetail && <div className="text-sm">Loading...</div>}
              {!loadingDetail && details.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No overlapping course times found.
                </div>
              )}
              {!loadingDetail && details.length > 0 && (
                <div className="space-y-3">
                  {details.map((d) => (
                    <div key={d.course_code} className="border rounded p-3">
                      <div className="font-medium mb-2">{d.course_code}</div>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="font-medium">Your times</div>
                          <ul className="mt-1 space-y-1">
                            {d.myEvents.map((e, i) => (
                              <li key={i}>
                                {resolveDay(e.start_time)} -{" "}
                                {new Date(e.end_time).toLocaleTimeString()}{" "}
                                {e.location ? `@ ${e.location}` : ""}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="font-medium">Their times</div>
                          <ul className="mt-1 space-y-1">
                            {d.otherEvents.map((e, i) => (
                              <li key={i}>
                                {resolveDay(e.start_time)} -{" "}
                                {new Date(e.end_time).toLocaleTimeString()}{" "}
                                {e.location ? `@ ${e.location}` : ""}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Default export with Suspense boundary
export default function MatchesPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto p-6 font-sans">Loading...</div>
      }
    >
      <MatchesPageContent />
    </Suspense>
  );
}
