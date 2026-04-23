import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: AdminDash,
});

function AdminDash() {
  const [stats, setStats] = useState({ users: 0, orders: 0, rides: 0, medical: 0 });

  useEffect(() => {
    (async () => {
      const [u, o, r, m] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("food_orders").select("*", { count: "exact", head: true }),
        supabase.from("rides").select("*", { count: "exact", head: true }),
        supabase.from("medical_requests").select("*", { count: "exact", head: true }),
      ]);
      setStats({ users: u.count ?? 0, orders: o.count ?? 0, rides: r.count ?? 0, medical: m.count ?? 0 });
    })();
  }, []);

  const tiles = [
    { label: "Total Users", val: stats.users, code: "01" },
    { label: "Food Orders", val: stats.orders, code: "02" },
    { label: "Rides Posted", val: stats.rides, code: "03" },
    { label: "Medical Reqs", val: stats.medical, code: "04" },
  ];

  return (
    <div className="space-y-6">
      <div className="bp-card p-6 md:p-8 bg-[var(--ink)] text-[var(--paper)]">
        <p className="font-mono text-xs uppercase tracking-widest opacity-70">// ADMIN_OVERVIEW</p>
        <h2 className="text-3xl md:text-5xl mt-2">System Status</h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {tiles.map((t) => (
          <div key={t.code} className="bp-card">
            <div className="bp-card-header">
              <span>STAT_{t.code}</span>
            </div>
            <div className="p-4 md:p-6">
              <p className="font-mono text-xs uppercase text-[var(--muted-foreground)]">{t.label}</p>
              <p className="text-4xl md:text-5xl font-bold tabular-nums mt-2">{t.val}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
