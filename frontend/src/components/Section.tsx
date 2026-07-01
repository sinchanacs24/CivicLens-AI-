import type { PropsWithChildren } from "react";

interface SectionProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export default function Section({
  eyebrow,
  title,
  subtitle,
  className = "",
  children,
}: PropsWithChildren<SectionProps>) {
  return (
    <section className={`mx-auto max-w-7xl px-6 py-16 ${className}`}>
      <div className="mb-10 max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-accent-400">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-3xl font-bold text-white md:text-4xl">{title}</h2>
        {subtitle && <p className="mt-3 text-slate-400">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
