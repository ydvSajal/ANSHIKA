import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/faculty/upload")({
  component: UploadNotes,
});

interface Subject {
  id: string;
  name: string;
  code: string;
}

function UploadNotes() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from("subjects").select("*").order("name").then(({ data }) => {
      setSubjects(data ?? []);
      if (data?.[0]) setSubjectId(data[0].id);
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !subjectId) return;
    setBusy(true);
    const path = `${subjectId}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("notes").upload(path, file);
    if (upErr) {
      setBusy(false);
      return toast.error(upErr.message);
    }
    const { data: pub } = supabase.storage.from("notes").getPublicUrl(path);
    const { error } = await supabase.from("notes").insert({
      subject_id: subjectId,
      title,
      file_url: pub.publicUrl,
      uploaded_by: user!.id,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Notes uploaded — students notified");
    setTitle("");
    setFile(null);
    (document.getElementById("file") as HTMLInputElement).value = "";
  };

  return (
    <div className="max-w-2xl mx-auto bp-card">
      <div className="bp-card-header">
        <span>UPLOAD_NOTES</span>
        <span>PDF</span>
      </div>
      <form onSubmit={submit} className="p-6 md:p-8 space-y-5">
        <div>
          <label className="bp-label">Subject</label>
          <select className="bp-input" required value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="bp-label">Title</label>
          <input className="bp-input" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="bp-label">PDF_File</label>
          <input
            id="file"
            type="file"
            accept="application/pdf"
            required
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="bp-input file:mr-3 file:bg-[var(--ink)] file:text-[var(--paper)] file:border-0 file:px-3 file:py-1 file:font-mono file:uppercase file:text-xs file:font-bold"
          />
        </div>
        <button className="bp-btn w-full" disabled={busy}>
          {busy ? "Uploading..." : "Transmit_File"}
        </button>
      </form>
    </div>
  );
}
