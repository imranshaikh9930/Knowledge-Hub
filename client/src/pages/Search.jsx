import React, { useState, useEffect, useCallback } from "react";
import api from "../api/client";
import DocCard from "../components/DocCard";

export default function Search() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [mode, setMode] = useState("keyword"); // default search mode

  // Actual search function
  const fetchResults = useCallback(async () => {
    if (!q.trim()) return;
    try {
      const { data } = await api.get("/docs", {
        params: { q, mode, k: 5 },
      });
      setResults(data.results);
    } catch (err) {
      console.error("Search error:", err);
    }
  }, [q, mode]);

  // Debouncing: runs 500ms after user stops typing
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchResults();
    }, 500);

    return () => clearTimeout(handler); // cleanup if user keeps typing
  }, [q, fetchResults]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-poppins">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Search Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Search Documents
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Type keywords or phrases..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setMode("keyword")}
                className={`px-4 py-2 rounded-lg transition ${
                  mode === "keyword"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                Text
              </button>
              <button
                onClick={() => setMode("semantic")}
                className={`px-4 py-2 rounded-lg transition ${
                  mode === "semantic"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                Semantic
              </button>
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Results</h2>
          {results.length > 0 ? (
            <div className="grid gap-4">
              {results.map((r) => (
                <DocCard key={r._id} doc={r} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              No results found. Try another search.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
