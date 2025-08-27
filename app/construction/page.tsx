"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ConstructionPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        // Redirect to home page after successful authentication
        window.location.href = "/";
      } else {
        const data = await response.json();
        setError(data.error || "Invalid password");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-xl text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold">Site under construction</h1>
          <p className="text-foreground/80">
            We&apos;re doing some maintenance and improvements. Please check back
            soon.
          </p>
        </div>
        
        <div className="border-t pt-6">
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Access with password</h2>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Checking..." : "Enter Site"}
              </Button>
            </form>
            <p className="text-xs text-foreground/60">
              Hint: Current EST time + vihaan
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
