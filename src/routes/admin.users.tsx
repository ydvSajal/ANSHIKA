import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

interface UserRow {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
}

function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const { data: profs } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      const { data: rs } = await supabase.from("user_roles").select("user_id, role");
      setUsers(profs ?? []);
      const map: Record<string, string> = {};
      rs?.forEach((r) => (map[r.user_id] = r.role));
      setRoles(map);
    })();
  }, []);

  return (
    <div className="bp-card">
      <div className="bp-card-header">
        <span>ALL_USERS</span>
        <span>{users.length}</span>
      </div>
      <div className="p-4 md:p-6 space-y-2">
        {users.map((u) => (
          <div key={u.id} className="border-[3px] border-[var(--ink)] p-3 flex justify-between items-center">
            <div>
              <p className="font-bold">{u.full_name ?? "—"}</p>
              <p className="font-mono text-[10px] uppercase text-[var(--muted-foreground)]">{u.email}</p>
            </div>
            <span className={`bp-tag ${roles[u.id] === "admin" ? "bp-tag-alert" : roles[u.id] === "faculty" ? "bp-tag-blue" : "bp-tag-paper"}`}>
              {roles[u.id] ?? "—"}
            </span>
          </div>
        ))}
        {users.length === 0 && <p className="font-mono text-xs text-[var(--muted-foreground)]">No users.</p>}
      </div>
    </div>
  );
}
