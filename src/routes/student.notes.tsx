import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Download, FileText } from "lucide-react";

export const Route = createFileRoute("/student/notes")({
  component: NotesPage,
});

interface Subject {
  id: string;
  name: string;
  code: string;
}
interface Note {
  id: string;
  title: string;
  file_url: string;
  subject_id: string;
  created_at: string;
}

function NotesPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("subjects").select("*").order("name").then(({ data }) => {
      setSubjects(data ?? []);
      if (data?.[0]) setActive(data[0].id);
    });
    supabase.from("notes").select("*").order("created_at", { ascending: false }).then(({ data }) => setNotes(data ?? []));
  }, []);

  const filtered = active ? notes.filter((n) => n.subject_id === active) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
      <section className="bp-card lg:col-span-1">
        <div className="bp-card-header">
          <span>SUBJECTS</span>
          <span>{subjects.length}</span>
        </div>
        <div className="p-3 md:p-4 space-y-2">
          {subjects.length === 0 && <p className="font-mono text-xs text-[var(--muted-foreground)]">No subjects yet.</p>}
          {subjects.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`w-full text-left p-3 border-[3px] border-[var(--ink)] font-mono text-sm uppercase font-bold transition-all ${
                active === s.id ? "bg-[var(--ink)] text-[var(--paper)]" : "hover:bg-[var(--blueprint)] hover:text-white hover:border-[var(--blueprint)]"
              }`}
            >
              <div className="text-[10px] opacity-70">{s.code}</div>
              <div>{s.name}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="bp-card lg:col-span-3">
        <div className="bp-card-header">
          <span>NOTES_FILES</span>
          <span>{filtered.length}</span>
        </div>
        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.length === 0 && <p className="font-mono text-xs text-[var(--muted-foreground)]">No notes for this subject.</p>}
          {filtered.map((n) => (
            <div key={n.id} className="border-[3px] border-[var(--ink)] p-4 flex items-center gap-3">
              <FileText size={32} className="shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{n.title}</p>
                <p className="font-mono text-[10px] text-[var(--muted-foreground)] uppercase">
                  {new Date(n.created_at).toLocaleDateString()}
                </p>
              </div>
              <a href={n.file_url} target="_blank" rel="noreferrer" download className="bp-btn !p-2" title="Download">
                <Download size={16} />
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
