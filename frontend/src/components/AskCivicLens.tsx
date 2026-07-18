import { useState } from "react";
import { SparklesIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { askCivicLens, extractErrorMessage } from "../services/api";

const SUGGESTIONS = [
  "Which ward has the highest risk and why?",
  "What is the most common complaint category?",
  "How many complaints are still pending?",
  "Which department has the biggest workload?",
];

export default function AskCivicLens() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await askCivicLens(trimmed);
      setAnswer(res.answer);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <SparklesIcon className="h-5 w-5 text-accent-400" />
        <h3 className="font-display text-lg font-bold text-white">Ask CivicLens</h3>
      </div>
      <p className="mb-4 text-sm text-slate-400">
        Ask a question about this dataset in plain English — answered by Gemini using the live data.
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit(question);
          }}
          placeholder="e.g. Which ward needs the most urgent attention?"
          maxLength={500}
          className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-accent-400 focus:outline-none"
        />
        <button
          onClick={() => submit(question)}
          disabled={loading || !question.trim()}
          className="btn-primary shrink-0 px-4"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => {
              setQuestion(s);
              submit(s);
            }}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 transition hover:bg-white/10"
          >
            {s}
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-5 flex items-center gap-3 text-slate-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-accent-400" />
          <span className="text-sm">Gemini is analyzing the data...</span>
        </div>
      )}

      {answer && !loading && (
        <div className="mt-5 rounded-xl border border-accent-400/20 bg-accent-500/5 p-4">
          <p className="text-sm leading-relaxed text-slate-200">{answer}</p>
        </div>
      )}

      {error && !loading && (
        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}