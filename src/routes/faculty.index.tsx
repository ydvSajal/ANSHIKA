import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/faculty/")({
  component: FacultySubjects,
});

interface Subject {
  id: string;
  name: string;
  code: string;
}

function FacultySubjects() {
  const [list, setList] = useState<Subject[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const load = async () => {
    const { data } = await supabase.from("subjects").select("*").order("created_at", { ascending: false });
    setList(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("subjects").insert({ name, code });
    if (error) return toast.error(error.message);
    toast.success("Subject created");
    setName("");
    setCode("");
    load();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
      <section className="bp-card">
        <div className="bp-card-header">
          <span>NEW_SUBJECT</span>
        </div>
        <form onSubmit={submit} className="p-4 md:p-6 space-y-4">
          <div>
            <label className="bp-label">Name</label>
            <input className="bp-input" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="bp-label">Code (unique)</label>
            <input className="bp-input" required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
          </div>
          <button className="bp-btn w-full">Create_Subject</button>
        </form>
      </section>
      <section className="bp-card">
        <div className="bp-card-header">
          <span>ALL_SUBJECTS</span>
          <span>{list.length}</span>
        </div>
        <div className="p-4 md:p-6 space-y-2">
          {list.map((s) => (
            <div key={s.id} className="border-[3px] border-[var(--ink)] p-3 flex justify-between items-center">
              <div>
                <p className="font-bold">{s.name}</p>
                <p className="font-mono text-[10px] uppercase text-[var(--muted-foreground)]">{s.code}</p>
              </div>
              <span className="bp-tag bp-tag-blue">ACTIVE</span>
            </div>
          ))}
          {list.length === 0 && <p className="font-mono text-xs text-[var(--muted-foreground)]">No subjects yet.</p>}
        </div>
      </section>
    </div>
  );
}
