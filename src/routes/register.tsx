import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

const ROLES = ["student", "faculty", "admin"] as const;

function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<typeof ROLES[number]>("student");
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName, role },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — entering grid...");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <div className="bp-card w-full max-w-md">
        <div className="bp-card-header">
          <span>SEC_AUTH / REGISTER</span>
          <span>NEW_USER</span>
        </div>
        <form onSubmit={handle} className="p-6 md:p-8 space-y-5">
          <div>
            <h2 className="text-3xl mb-1">Create Account</h2>
            <p className="font-mono text-xs text-[var(--muted-foreground)] uppercase">// Register a new node on the grid</p>
          </div>
          <div>
            <label className="bp-label">Full_Name</label>
            <input className="bp-input" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <label className="bp-label">Email</label>
            <input className="bp-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="bp-label">Password (min 6)</label>
            <input className="bp-input" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <label className="bp-label">Select_Role</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`p-3 border-[3px] border-[var(--ink)] font-mono text-xs uppercase font-bold transition-all ${
                    role === r ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-[var(--card)] hover:bg-[var(--blueprint)] hover:text-white hover:border-[var(--blueprint)]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <button className="bp-btn w-full" disabled={loading}>
            {loading ? "Provisioning..." : "Register_Node"}
          </button>
          <p className="font-mono text-xs text-center text-[var(--muted-foreground)]">
            Already registered?{" "}
            <Link to="/login" className="underline font-bold text-[var(--blueprint)]">
              Sign_In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
