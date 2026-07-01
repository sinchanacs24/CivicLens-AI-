import { SparklesIcon } from "@heroicons/react/24/solid";
import type { GeminiInsights } from "../utils/types";

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent-400">
        {title}
      </h4>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AiInsightsPanel({ insights }: { insights: GeminiInsights }) {
  return (
    <div className="glass-card p-6">
      <div className="mb-5 flex items-center gap-2">
        <SparklesIcon className="h-5 w-5 text-accent-400" />
        <h3 className="font-display text-lg font-bold text-white">Gemini AI Summary</h3>
      </div>
      <p className="mb-6 text-slate-300">{insights.summary}</p>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ListBlock title="Top Risks" items={insights.top_risks} />
        <ListBlock title="Recommendations" items={insights.recommendations} />
        <ListBlock title="Action Plan" items={insights.action_plan} />
        <ListBlock title="Future Concerns" items={insights.future_concerns} />
      </div>
    </div>
  );
}
