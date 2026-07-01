import {
  CircleStackIcon,
  CloudArrowUpIcon,
  CpuChipIcon,
  ServerStackIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import Section from "../components/Section";

const architectureSteps = [
  {
    icon: CloudArrowUpIcon,
    title: "1. Upload",
    desc: "User uploads a complaints CSV through the React frontend.",
  },
  {
    icon: CircleStackIcon,
    title: "2. Store & Warehouse",
    desc: "The file is stored locally and, if configured, synced to Google Cloud Storage and loaded into BigQuery.",
  },
  {
    icon: CpuChipIcon,
    title: "3. Accelerated Processing",
    desc: "The FastAPI backend loads and cleans the data with NVIDIA RAPIDS (cuDF) when a GPU is available, falling back to Pandas otherwise.",
  },
  {
    icon: ServerStackIcon,
    title: "4. Risk Scoring",
    desc: "A weighted risk engine scores every ward using complaint volume, priority, rainfall, traffic, and population.",
  },
  {
    icon: SparklesIcon,
    title: "5. AI Recommendations",
    desc: "Google Gemini turns the aggregated analytics into a natural-language summary, risks, and an action plan.",
  },
];

const googleServices = [
  { name: "Cloud Storage", purpose: "Secure storage for uploaded CSV datasets." },
  { name: "BigQuery", purpose: "Scalable warehousing and SQL analytics for large datasets." },
  { name: "Gemini", purpose: "Generates AI-powered summaries and recommendations." },
  { name: "Cloud Run", purpose: "Deploys the backend and frontend with automatic scaling." },
];

const nvidiaServices = [
  { name: "RAPIDS (cuDF)", purpose: "GPU-accelerated dataframe processing, mirroring the Pandas API." },
  { name: "NVIDIA GPUs on GCP", purpose: "High-performance compute for large-scale data analysis." },
];

export default function About() {
  return (
    <div>
      <Section
        eyebrow="Problem Statement"
        title="Create a data intelligence tool people would actually use"
        subtitle="…and show how acceleration helps them make faster decisions. CivicLens AI answers this for city officials analyzing public complaints."
      >
        <div className="glass-card p-6 text-slate-300">
          <p>
            City departments receive thousands of complaints about water supply, roads, garbage,
            and more — but manually reading spreadsheets to figure out which wards need urgent
            attention is slow. CivicLens AI ingests a raw complaints CSV, cleans it, scores every
            ward's risk, and asks Gemini to turn the numbers into a clear action plan — all in
            under a minute, and dramatically faster with GPU acceleration.
          </p>
        </div>
      </Section>

      <Section eyebrow="Architecture" title="How data flows through the system" className="pt-0">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          {architectureSteps.map((step) => (
            <div key={step.title} className="glass-card flex flex-col items-start gap-3 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/15 text-brand-300">
                <step.icon className="h-5 w-5" />
              </div>
              <h4 className="font-display font-bold text-white">{step.title}</h4>
              <p className="text-sm text-slate-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Google Cloud" title="Cloud services powering the platform" className="pt-0">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {googleServices.map((s) => (
            <div key={s.name} className="glass-card flex items-start gap-4 p-5">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent-400" />
              <div>
                <p className="font-semibold text-white">{s.name}</p>
                <p className="text-sm text-slate-400">{s.purpose}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="NVIDIA" title="GPU acceleration under the hood" className="pt-0 pb-24">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {nvidiaServices.map((s) => (
            <div key={s.name} className="glass-card flex items-start gap-4 p-5">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-400" />
              <div>
                <p className="font-semibold text-white">{s.name}</p>
                <p className="text-sm text-slate-400">{s.purpose}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
