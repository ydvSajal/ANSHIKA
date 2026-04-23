import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Shell } from "@/components/Shell";
import { Bell, BellOff } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  component: NotifPage,
});

interface Notif {
  id: string;
  message: string;
  read: boolean;
  created_at: string;
}

function NotifPage() {
  const { user, role, loading } = useAuth();
  const [list, setList] = useState<Notif[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setList(data ?? []);
  };

  useEffect(() => {
    load();
    if (!user) return;
    // Mark all as read
    supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false).then(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) return <div className="min-h-dvh flex items-center justify-center font-mono uppercase">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  const nav =
    role === "admin"
      ? [{ to: "/admin", label: "Dashboard" }, { to: "/admin/orders", label: "Orders" }, { to: "/admin/users", label: "Users" }]
      : role === "faculty"
        ? [{ to: "/faculty", label: "Subjects" }, { to: "/faculty/upload", label: "Upload" }]
        : [
            { to: "/student", label: "Home" },
            { to: "/student/food", label: "Food" },
            { to: "/student/rides", label: "Rides" },
            { to: "/student/medical", label: "Medical" },
            { to: "/student/notes", label: "Notes" },
          ];

  return (
    <Shell nav={nav} title="NOTIFICATIONS_FEED">
      <div className="bp-card max-w-3xl mx-auto">
        <div className="bp-card-header">
          <span>INBOX</span>
          <span>{list.length}</span>
        </div>
        <div className="p-4 md:p-6 space-y-3">
          {list.length === 0 && (
            <div className="text-center py-12 text-[var(--muted-foreground)] font-mono text-sm uppercase flex flex-col items-center gap-3">
              <BellOff size={40} />
              No notifications yet
            </div>
          )}
          {list.map((n) => (
            <div key={n.id} className="border-[3px] border-[var(--ink)] p-4 flex gap-3 items-start">
              <Bell size={18} className="mt-1 shrink-0" />
              <div className="flex-1">
                <p className="font-bold">{n.message}</p>
                <p className="font-mono text-[10px] uppercase text-[var(--muted-foreground)] mt-1">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
