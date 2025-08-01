"use client";

import { useState } from "react";

export default function HomePage() {
  const [resume, setResume] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [tailoredResume, setTailoredResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTailoredResume("");
    setError("");

    try {
      const response = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDesc }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to tailor resume");
      }

      setTailoredResume(data.tailoredResume);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">
          🎯 Resume Tailor
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Resume</label>
            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              rows={8}
              className="w-full p-2 border rounded"
              required
              placeholder="Paste your resume here..."
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Job Description</label>
            <textarea
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              rows={6}
              className="w-full p-2 border rounded"
              required
              placeholder="Paste the job description here..."
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Tailoring..." : "Tailor Resume"}
          </button>
        </form>

        {error && (
          <div className="mt-4 text-red-600 font-medium">❌ {error}</div>
        )}

        {tailoredResume && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">
              ✨ Tailored Resume Summary
            </h2>
            <div className="whitespace-pre-wrap bg-gray-50 p-4 border rounded">
              {tailoredResume}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
