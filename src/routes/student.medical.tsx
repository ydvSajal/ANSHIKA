import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/student/medical")({
  component: MedicalPage,
});

interface MedReq {
  id: string;
  issue: string;
  status: string;
  created_at: string;
}

const STATUS_TAG: Record<string, string> = {
  pending: "bp-tag-paper",
  reviewed: "bp-tag-blue",
  resolved: "",
};

function MedicalPage() {
  const { user } = useAuth();
  const [issue, setIssue] = useState("");
  const [list, setList] = useState<MedReq[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("medical_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setList(data ?? []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue.trim()) return;
    const { error } = await supabase.from("medical_requests").insert({ user_id: user!.id, issue });
    if (error) return toast.error(error.message);
    toast.success("Request submitted");
    setIssue("");
    load();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
      <section className="bp-card">
        <div className="bp-card-header">
          <span>SEC_01: SUBMIT_REQUEST</span>
        </div>
        <form onSubmit={submit} className="p-4 md:p-6 space-y-4">
          <div>
            <label className="bp-label">Describe_Issue</label>
            <textarea
              className="bp-input min-h-[140px] resize-y"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="// Describe symptoms or medical concern..."
              required
            />
          </div>
          <button className="bp-btn bp-btn-alert w-full">Transmit_Request</button>
        </form>
      </section>

      <section className="bp-card">
        <div className="bp-card-header">
          <span>SEC_02: MY_REQUESTS</span>
          <span>{list.length}</span>
        </div>
        <div className="p-4 md:p-6 space-y-3 max-h-[600px] overflow-y-auto">
          {list.length === 0 && <p className="font-mono text-xs text-[var(--muted-foreground)]">No requests submitted.</p>}
          {list.map((r) => (
            <div key={r.id} className="border-[3px] border-[var(--ink)] p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-[10px] uppercase text-[var(--muted-foreground)]">
                  {new Date(r.created_at).toLocaleString()}
                </span>
                <span className={`bp-tag ${STATUS_TAG[r.status] ?? ""}`}>{r.status}</span>
              </div>
              <p className="text-sm">{r.issue}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
