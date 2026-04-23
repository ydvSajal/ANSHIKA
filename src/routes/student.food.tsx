import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/student/food")({
  component: FoodPage,
});

interface FoodItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  available: boolean;
}
interface Order {
  id: string;
  quantity: number;
  status: string;
  created_at: string;
  food_items: { name: string } | null;
}

const STATUS_COLOR: Record<string, string> = {
  pending: "bp-tag-paper",
  preparing: "bp-tag-blue",
  ready: "bp-tag-alert",
  delivered: "",
};

function FoodPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("food_orders")
      .select("id, quantity, status, created_at, food_items(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setOrders((data as any) ?? []);
  };

  useEffect(() => {
    supabase.from("food_items").select("*").eq("available", true).then(({ data }) => setItems(data ?? []));
    loadOrders();
    if (!user) return;
    const ch = supabase
      .channel("orders-" + user.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "food_orders", filter: `user_id=eq.${user.id}` }, loadOrders)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const order = async (item: FoodItem) => {
    const { error } = await supabase
      .from("food_orders")
      .insert({ user_id: user!.id, food_item_id: item.id, quantity: 1 });
    if (error) return toast.error(error.message);
    toast.success(`Order placed: ${item.name}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      <section className="lg:col-span-2 bp-card flex flex-col">
        <div className="bp-card-header">
          <span>SEC_01: MENU</span>
          <span>{items.length} ITEMS</span>
        </div>
        <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((it) => (
            <div key={it.id} className="border-[3px] border-[var(--ink)] p-4 flex flex-col">
              <div className="flex justify-between items-start">
                <h3 className="text-lg">{it.name}</h3>
                <span className="font-mono font-bold">₹{Number(it.price).toFixed(0)}</span>
              </div>
              <p className="font-mono text-xs text-[var(--muted-foreground)] mt-1 flex-1">{it.description}</p>
              <button onClick={() => order(it)} className="bp-btn mt-4 text-xs !py-2">
                + Place_Order
              </button>
            </div>
          ))}
          {items.length === 0 && <p className="font-mono text-sm text-[var(--muted-foreground)]">No items available.</p>}
        </div>
      </section>

      <section className="bp-card flex flex-col">
        <div className="bp-card-header">
          <span>SEC_02: MY_ORDERS</span>
          <span>{orders.length}</span>
        </div>
        <div className="p-4 md:p-6 space-y-3 max-h-[600px] overflow-y-auto">
          {orders.length === 0 && <p className="font-mono text-xs text-[var(--muted-foreground)]">No orders yet.</p>}
          {orders.map((o) => (
            <div key={o.id} className="border-[3px] border-[var(--ink)] p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-sm">{o.food_items?.name ?? "Item"}</span>
                <span className={`bp-tag ${STATUS_COLOR[o.status] ?? ""}`}>{o.status}</span>
              </div>
              <p className="font-mono text-[10px] text-[var(--muted-foreground)] uppercase">
                Qty: {o.quantity} • {new Date(o.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
