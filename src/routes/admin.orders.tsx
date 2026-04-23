import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

interface Order {
  id: string;
  status: string;
  quantity: number;
  created_at: string;
  user_id: string;
  food_items: { name: string } | null;
  profile_name?: string;
}

const STATUSES = ["pending", "preparing", "ready", "delivered"] as const;

function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("food_orders")
      .select("id, status, quantity, created_at, user_id, food_items(name)")
      .order("created_at", { ascending: false });
    const rows = (data as any[]) ?? [];
    const ids = Array.from(new Set(rows.map((r) => r.user_id)));
    const { data: profs } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
    const map = new Map(profs?.map((p) => [p.id, p.full_name ?? p.email]));
    setOrders(rows.map((r) => ({ ...r, profile_name: map.get(r.user_id) ?? "user" })));
  };

  useEffect(() => {
    load();
  }, []);

  const update = async (id: string, status: string) => {
    const { error } = await supabase.from("food_orders").update({ status: status as any }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Updated → ${status}`);
    load();
  };

  return (
    <div className="bp-card">
      <div className="bp-card-header">
        <span>ALL_ORDERS</span>
        <span>{orders.length}</span>
      </div>
      <div className="p-4 md:p-6 space-y-3">
        {orders.length === 0 && <p className="font-mono text-xs text-[var(--muted-foreground)]">No orders yet.</p>}
        {orders.map((o) => (
          <div key={o.id} className="border-[3px] border-[var(--ink)] p-4 flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <p className="font-bold">{o.food_items?.name ?? "Item"} <span className="font-mono text-xs text-[var(--muted-foreground)]">×{o.quantity}</span></p>
              <p className="font-mono text-[10px] uppercase text-[var(--muted-foreground)]">
                {o.profile_name} • {new Date(o.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => update(o.id, s)}
                  className={`px-3 py-1 border-2 border-[var(--ink)] font-mono text-[10px] uppercase font-bold ${
                    o.status === s ? "bg-[var(--ink)] text-[var(--paper)]" : "hover:bg-[var(--blueprint)] hover:text-white hover:border-[var(--blueprint)]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
