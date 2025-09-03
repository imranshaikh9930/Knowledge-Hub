import { useState, useEffect } from "react";
import api from "../api/client";

export default function QnA() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    // Fetch available tags on mount
    (async () => {
      try {
        const { data } = await api.get("/docs/tags");
        setTags(data.tags || []);
      } catch (err) {
        console.error("Failed to fetch tags:", err);
      }
    })();
  }, []);

  async function ask() {
    if (!question.trim()) return;
    try {
      const { data } = await api.post("/docs/qa", {
        question,
        tags: selectedTags,
      });
      setAnswer(data.answer);
      setSources(data.sources || []);
    } catch (err) {
      console.error("Q&A error:", err);
    }
  }

  function toggleTag(tag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Team Q&A
          </h2>

          {/* Tags filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.length === 0 ? (
              <p className="text-sm text-gray-500">No tags available</p>
            ) : (
              tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm border transition ${
                    selectedTags.includes(tag)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {tag}
                </button>
              ))
            )}
          </div>

          {/* Question Input */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={ask}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Ask
            </button>
          </div>
        </div>

        {/* Answer Section */}
        {answer && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-medium text-gray-800 mb-3">Answer</h3>
            <p className="text-gray-700 whitespace-pre-line">{answer}</p>
            {sources.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-600 mb-1">
                  Sources:
                </h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {sources.map((s, idx) => (
                    <li key={idx}>{s.title || "Untitled"}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
