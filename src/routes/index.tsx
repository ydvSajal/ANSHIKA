import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, role, loading } = useAuth();
  if (loading)
    return (
      <div className="min-h-dvh flex items-center justify-center font-mono uppercase tracking-widest">
        Booting_Campus_OS...
      </div>
    );
  if (!user) return <Navigate to="/login" />;
  if (role === "admin") return <Navigate to="/admin" />;
  if (role === "faculty") return <Navigate to="/faculty" />;
  return <Navigate to="/student" />;
}
