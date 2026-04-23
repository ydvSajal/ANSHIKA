import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Access granted");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <div className="bp-card w-full max-w-md">
        <div className="bp-card-header">
          <span>SEC_AUTH / LOGIN</span>
          <span>v1.0</span>
        </div>
        <form onSubmit={handle} className="p-6 md:p-8 space-y-5">
          <div>
            <h2 className="text-3xl mb-1">Sign In</h2>
            <p className="font-mono text-xs text-[var(--muted-foreground)] uppercase">// Authenticate to enter the grid</p>
          </div>
          <div>
            <label className="bp-label">Email_Address</label>
            <input className="bp-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="bp-label">Password</label>
            <input className="bp-input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="bp-btn w-full" disabled={loading}>
            {loading ? "Authenticating..." : "Initiate_Session"}
          </button>
          <p className="font-mono text-xs text-center text-[var(--muted-foreground)]">
            No account?{" "}
            <Link to="/register" className="underline font-bold text-[var(--blueprint)]">
              Register_New_User
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
