"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ClassGroup } from "@/types";

export default function ClassesPage() {
  const [course, setCourse] = useState("");
  const [minSize, setMinSize] = useState("2");
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [campus, setCampus] = useState("");
  function weekday(date: string) {
    const day = new Date(date).getDay();
    return [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][day];
  }

  function timeRange(start: string, end: string) {
    const s = new Date(start);
    const e = new Date(end);
    const fmt = (d: Date) =>
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `${fmt(s)} - ${fmt(e)}`;
  }

  async function fetchClasses() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (course) params.set("course", course);
      if (minSize) params.set("minSize", minSize);
      if (campus) params.set("campus", campus);
      const res = await fetch(`/api/classes?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch");
      setClasses(json.classes || []);
      setFilteredClasses(json.classes || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch");
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalStudents = useMemo(() => {
    const ids = new Set<string>();
    for (const g of classes) for (const s of g.students) ids.add(s.id);
    return ids.size;
  }, [classes]);

  function handleFilterChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFilter(e.target.value);
    // only to search already fetched classes
    const filteredClasses = classes.filter((g) => {
      return (
        g.course_code.includes(filter) ||
        g.students.some(
          (s) => s.name.includes(filter) || s.email.includes(filter)
        )
      );
    });
    setFilteredClasses(filteredClasses);
  }

  return (
    <div className="max-w-5xl mx-auto p-6 font-sans space-y-4">
      <h1 className="text-2xl font-semibold">Classes</h1>
      <div className="flex gap-2 items-center">
        <Input
          placeholder="Filter by course code (e.g., CSC108)"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        />
        <Select value={minSize} onValueChange={(v) => setMinSize(v)}>
          <SelectTrigger className="min-w-44">
            <SelectValue placeholder="Min group size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1+</SelectItem>
            <SelectItem value="2">2+</SelectItem>
            <SelectItem value="3">3+</SelectItem>
            <SelectItem value="4">4+</SelectItem>
            <SelectItem value="5">5+</SelectItem>
          </SelectContent>
        </Select>
        {/* campus filter */}
        <Select value={campus} onValueChange={(v) => setCampus(v)}>
          <SelectTrigger className="min-w-44">
            <SelectValue placeholder="Campus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UTM">UTM</SelectItem>
            <SelectItem value="UTSG">UTSG</SelectItem>
            <SelectItem value="UTSC">UTSC</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={fetchClasses} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="text-sm text-muted-foreground">
        Showing {classes.length} classes • {totalStudents} unique students
      </div>

      {/* further filter, go through class code, people, people's email, basically everything */}
      <div className="flex gap-2">
        <Input
          placeholder="Filter by anthing..."
          value={filter}
          onChange={handleFilterChange}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filteredClasses.map((g, idx) => (
          <div
            key={`${g.course_code}-${g.start_time}-${g.end_time}-${g.location ?? ""}-${idx}`}
            className="border rounded p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">
                {g.course_code} • {weekday(g.start_time)} •{" "}
                {timeRange(g.start_time, g.end_time)}
              </div>
              <div className="text-xs bg-accent px-2 py-0.5 rounded">
                {g.size} student{g.size === 1 ? "" : "s"}
              </div>
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              {g.location ? `Room: ${g.location}` : "Room: —"}
            </div>
            <ul className="space-y-1">
              {g.students.map((s) => (
                <li key={s.id} className="text-sm">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {" "}
                    — {s.email}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
