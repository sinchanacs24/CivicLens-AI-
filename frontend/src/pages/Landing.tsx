import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BoltIcon,
  ChartBarIcon,
  CloudIcon,
  CpuChipIcon,
  SparklesIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import Section from "../components/Section";

const features = [
  {
    icon: ChartBarIcon,
    title: "Instant Risk Dashboards",
    desc: "Upload a complaints CSV and get ward-level risk scores, trends, and leaderboards in seconds.",
  },
  {
    icon: SparklesIcon,
    title: "Gemini-Powered Insights",
    desc: "AI-generated summaries, top risks, recommendations, and an action plan — in plain language.",
  },
  {
    icon: BoltIcon,
    title: "GPU-Accelerated Processing",
    desc: "NVIDIA RAPIDS (cuDF) accelerates cleaning and aggregation, with automatic CPU fallback.",
  },
  {
    icon: CloudIcon,
    title: "Cloud-Native by Design",
    desc: "Built on Google Cloud Storage, BigQuery, and Cloud Run for scalable, real-world deployment.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Robust Data Cleaning",
    desc: "Automatic de-duplication, missing value handling, and validation before analysis runs.",
  },
  {
    icon: CpuChipIcon,
    title: "CPU vs GPU Benchmark",
    desc: "See exactly how much faster acceleration makes your decision-making pipeline.",
  },
];

const techStack = [
  { name: "React + Vite", tag: "Frontend" },
  { name: "FastAPI", tag: "Backend" },
  { name: "Google Gemini", tag: "AI" },
  { name: "NVIDIA RAPIDS", tag: "GPU" },
  { name: "BigQuery", tag: "Data Warehouse" },
  { name: "Cloud Run", tag: "Deployment" },
];

export default function Landing() {
  return (
    <div>
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-28 text-center">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent-400"
          >
            AI-Powered Community Intelligence Platform
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-3xl font-display text-4xl font-bold leading-tight text-white md:text-6xl"
          >
            Turn Public Complaints Into
            <span className="bg-gradient-to-r from-accent-400 to-brand-400 bg-clip-text text-transparent">
              {" "}
              Faster Decisions
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 max-w-2xl text-lg text-slate-300"
          >
            CivicLens AI helps city officials clean, analyze, and act on complaint data —
            with GPU-accelerated processing and Gemini-generated recommendations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Link to="/upload" className="btn-primary">
              Upload Dataset
            </Link>
            <Link to="/about" className="btn-secondary">
              See How It Works
            </Link>
          </motion.div>
        </div>
      </section>

      <Section
        eyebrow="Features"
        title="Everything a city team needs to act fast"
        subtitle="From raw CSVs to AI-backed recommendations in a single upload."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="glass-card p-6"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-display text-lg font-bold text-white">{f.title}</h3>
              <p className="text-sm text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Technology"
        title="Built on a modern, accelerated stack"
        className="pt-0"
      >
        <div className="flex flex-wrap gap-4">
          {techStack.map((t) => (
            <div
              key={t.name}
              className="glass-card flex items-center gap-3 px-5 py-3"
            >
              <span className="h-2 w-2 rounded-full bg-accent-400" />
              <span className="font-semibold text-white">{t.name}</span>
              <span className="text-xs text-slate-500">{t.tag}</span>
            </div>
          ))}
        </div>
      </Section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="glass-card flex flex-col items-center gap-6 p-12 text-center">
          <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
            Ready to see your data differently?
          </h2>
          <p className="max-w-xl text-slate-400">
            Upload a complaints CSV and get a full risk dashboard with AI recommendations in
            under a minute.
          </p>
          <Link to="/upload" className="btn-primary">
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
