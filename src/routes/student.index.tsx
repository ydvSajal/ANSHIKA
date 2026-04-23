import { createFileRoute, Link } from "@tanstack/react-router";
import { Coffee, Car, Stethoscope, FileText, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/student/")({
  component: StudentHome,
});

const TILES = [
  { to: "/student/food", icon: Coffee, label: "Refueling Log", desc: "Order food, track status", code: "01" },
  { to: "/student/rides", icon: Car, label: "Logistics Path", desc: "Share & book rides", code: "02" },
  { to: "/student/medical", icon: Stethoscope, label: "Bio Metrics", desc: "Submit medical request", code: "03" },
  { to: "/student/notes", icon: FileText, label: "Intel Reserve", desc: "Browse & download notes", code: "04" },
];

function StudentHome() {
  return (
    <div className="space-y-6">
      <div className="bp-card p-6 md:p-8 bg-[var(--blueprint)] text-white">
        <p className="font-mono text-xs uppercase tracking-widest opacity-80">// SECTOR_7G / STUDENT</p>
        <h2 className="text-3xl md:text-5xl mt-2">Welcome to the Grid</h2>
        <p className="font-mono text-sm mt-2 opacity-90">Select a module below to begin operations.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {TILES.map((t) => (
          <Link key={t.to} to={t.to} className="bp-card flex flex-col group hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform">
            <div className="bp-card-header">
              <span>MODULE_{t.code}</span>
              <span>›</span>
            </div>
            <div className="p-6 flex items-start gap-4 flex-1">
              <div className="border-[3px] border-[var(--ink)] p-3 bg-[var(--paper)]">
                <t.icon size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl">{t.label}</h3>
                <p className="font-mono text-xs text-[var(--muted-foreground)] uppercase mt-1">{t.desc}</p>
              </div>
              <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
