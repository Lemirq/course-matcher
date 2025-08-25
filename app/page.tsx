"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Upload, Users, Search, ThumbsUp } from "lucide-react";
import {
  Select,
  SelectLabel,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ics, setIcs] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, ics, year }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setMessage(
        `Uploaded. Parsed ${json.courses} courses and ${json.events} events.`
      );
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleFile(file: File | null) {
    if (!file) return;
    const text = await file.text();
    setIcs(text);
  }

  useEffect(() => {
    const voted = localStorage.getItem("voted");
    if (voted) {
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }
  }, []);

  return (
    <div className="font-sans max-w-3xl mx-auto p-8 flex flex-col gap-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">UofT Course Matcher</h1>
        <nav className="flex flex-col items-center justify-center sm:flex-row gap-2">
          <Link href="/students">
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Students
            </Button>
          </Link>
          <Link href="/matches">
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Matches
            </Button>
          </Link>
          <Link href="/classes">
            <Button variant="outline">Classes</Button>
          </Link>
        </nav>
      </header>

      {showBanner && (
        <div className="rounded-lg border p-4 bg-amber-50 dark:bg-amber-950/20 flex items-center justify-between gap-3">
          <div className="text-sm">
            <span className="font-medium">Should I add social links?</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  await fetch("/api/feature?key=social-links", {
                    method: "POST",
                  });
                  toast.success("Thanks for the vote!");
                  setShowBanner(false);
                  // store that they voted in local storage
                  localStorage.setItem("voted", "true");
                } catch {}
              }}
            >
              <ThumbsUp className="h-4 w-4 mr-2" /> Upvote
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowBanner(false)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <section className="grid md:grid-cols-2 gap-6">
        <div className="rounded-lg border p-6 space-y-3">
          <h2 className="text-xl font-medium">
            How to get your ICS from Acorn
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              Go to{" "}
              <a
                className="underline"
                href="https://acorn.utoronto.ca/sws/#/timetable-and-exams"
                target="_blank"
                rel="noreferrer"
              >
                acorn.utoronto.ca
              </a>
            </li>
            <li>Open Timetable & Exams.</li>
            <li>
              Click &quot;Download Calendar Export&quot; to download a .ics
              file.
            </li>
            <li>Return here and upload that file (or paste its contents).</li>
          </ol>
          <div className="pt-2">
            <Button variant="outline" asChild>
              <a href="/matches">
                <Search className="h-4 w-4 mr-2" />
                Find matches
              </a>
            </Button>
          </div>
          {/* <div className="pt-4">
            <span className="text-sm">Want updates allowed? </span>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  await fetch("/api/feature?key=allow-updates", {
                    method: "POST",
                  });
                  setMessage("Thanks for the vote!");
                } catch {}
              }}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Upvote feature
            </Button>
          </div> */}
        </div>
        <div className="rounded-lg border p-6 space-y-4">
          <h2 className="text-xl font-medium flex items-center">
            <Upload className="h-5 w-5 mr-2" /> Upload your calendar
          </h2>
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="name">Student name</Label>
              <Input
                id="name"
                placeholder="e.g., Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Student email</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., jane@mail.utoronto.ca"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="year">Year of study</Label>
              <Select
                value={year}
                onValueChange={(value) => setYear(value)}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Year of study</SelectLabel>
                    <SelectItem value="first">First</SelectItem>
                    <SelectItem value="second">Second</SelectItem>
                    <SelectItem value="third">Third</SelectItem>
                    <SelectItem value="fourth">Fourth</SelectItem>
                    <SelectItem value="fifth">Fifth</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>ICS file</Label>
              <Input
                type="file"
                accept=".ics,text/calendar"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
              <Textarea
                rows={10}
                className="max-h-60"
                placeholder="Or paste ICS content here"
                value={ics}
                onChange={(e) => setIcs(e.target.value)}
              />
            </div>
            <div className="text-xs text-gray-600">
              Entries are unique by email and cannot be updated yet.
            </div>
            <Button disabled={loading} type="submit">
              {loading ? "Uploading..." : "Upload calendar"}
            </Button>
            {message && <p className="text-sm">{message}</p>}
            {message?.startsWith("Uploaded") && (
              <Button variant="outline" asChild>
                <a href={`/matches?email=${email}`}>
                  <Search className="h-4 w-4 mr-2" />
                  Find matches
                </a>
              </Button>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
