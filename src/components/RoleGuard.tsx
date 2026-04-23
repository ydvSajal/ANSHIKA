import { Navigate } from "@tanstack/react-router";
import { ReactNode } from "react";
import { useAuth, AppRole } from "@/lib/auth-context";

export function RoleGuard({ allow, children }: { allow: AppRole[]; children: ReactNode }) {
  const { user, role, loading } = useAuth();
  if (loading)
    return (
      <div className="min-h-dvh flex items-center justify-center font-mono uppercase tracking-widest">
        Loading_System...
      </div>
    );
  if (!user) return <Navigate to="/login" />;
  if (role && !allow.includes(role)) return <Navigate to="/" />;
  return <>{children}</>;
}
