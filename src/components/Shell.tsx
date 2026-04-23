import { Link, useNavigate } from "@tanstack/react-router";
import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Bell, LogOut, Menu, X } from "lucide-react";

interface NavItem {
  to: string;
  label: string;
}

export function Shell({ children, nav, title }: { children: ReactNode; nav: NavItem[]; title: string }) {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);
      setUnread(count ?? 0);
    };
    load();
    const ch = supabase
      .channel("notif-" + user.id)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-dvh">
      {/* Header */}
      <header className="bp-card mx-3 md:mx-6 mt-3 md:mt-6 mb-6 md:mb-10 flex flex-col md:flex-row md:divide-x-4 divide-y-4 md:divide-y-0 divide-[var(--ink)]">
        <div className="p-4 md:p-6 flex-1 bg-[var(--blueprint)] text-white flex justify-between items-center">
          <Link to="/">
            <h1 className="text-xl md:text-3xl font-bold tracking-tighter uppercase leading-none">
              CAMPUS_OPS<span className="text-[var(--paper)]">.v1</span>
            </h1>
            <p className="font-mono text-[10px] md:text-xs mt-1 opacity-90">// {title}</p>
          </Link>
          <button className="md:hidden text-white" onClick={() => setOpen(!open)} aria-label="menu">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <div className="p-4 md:p-6 flex items-center gap-4 md:min-w-[260px]">
          <Link to="/notifications" className="relative">
            <Bell size={22} />
            {unread > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--alert)] text-white text-[10px] font-mono font-bold size-5 flex items-center justify-center border-2 border-[var(--ink)]">
                {unread}
              </span>
            )}
          </Link>
          <div className="flex flex-col text-xs font-mono uppercase">
            <span className="text-[var(--muted-foreground)]">Role</span>
            <span className="font-bold">{role ?? "GUEST"}</span>
          </div>
          <button onClick={handleSignOut} className="ml-auto bp-btn-ghost bp-btn !p-2" aria-label="sign out">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Sub nav */}
      <nav className={`mx-3 md:mx-6 mb-6 md:mb-10 ${open ? "block" : "hidden md:block"}`}>
        <div className="bp-card flex flex-col md:flex-row md:divide-x-4 divide-y-4 md:divide-y-0 divide-[var(--ink)]">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              activeProps={{ className: "bg-[var(--ink)] text-[var(--paper)]" }}
              className="flex-1 px-4 py-3 font-mono uppercase text-sm font-bold tracking-wider hover:bg-[var(--blueprint)] hover:text-white transition-colors"
            >
              [{n.label}]
            </Link>
          ))}
        </div>
      </nav>

      <main className="mx-3 md:mx-6 pb-12">{children}</main>

      <footer className="mx-3 md:mx-6 pt-6 pb-8 border-t-4 border-[var(--ink)] font-mono text-[10px] md:text-xs uppercase tracking-widest font-bold flex flex-wrap justify-between gap-2">
        <span>CAMPUS_OPS_GRID © 2024</span>
        <span>STATUS: ONLINE / SECTOR_7G</span>
      </footer>
    </div>
  );
}
