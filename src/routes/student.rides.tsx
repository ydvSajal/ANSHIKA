import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Phone, MapPin, Clock, Users } from "lucide-react";

export const Route = createFileRoute("/student/rides")({
  component: RidesPage,
});

interface Ride {
  id: string;
  source: string;
  destination: string;
  ride_time: string;
  seats: number;
  phone: string;
  user_id: string;
}

function RidesPage() {
  const { user } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [form, setForm] = useState({ source: "", destination: "", ride_time: "", seats: 1, phone: "" });

  const load = async () => {
    const { data } = await supabase.from("rides").select("*").order("ride_time", { ascending: true });
    setRides(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("rides").insert({
      user_id: user!.id,
      source: form.source,
      destination: form.destination,
      ride_time: new Date(form.ride_time).toISOString(),
      seats: Number(form.seats),
      phone: form.phone,
    });
    if (error) return toast.error(error.message);
    toast.success("Ride posted");
    setForm({ source: "", destination: "", ride_time: "", seats: 1, phone: "" });
    load();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      <section className="bp-card">
        <div className="bp-card-header">
          <span>SEC_01: NEW_RIDE</span>
        </div>
        <form onSubmit={submit} className="p-4 md:p-6 space-y-4">
          <div>
            <label className="bp-label">Source</label>
            <input className="bp-input" required value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
          </div>
          <div>
            <label className="bp-label">Destination</label>
            <input className="bp-input" required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
          </div>
          <div>
            <label className="bp-label">Time</label>
            <input className="bp-input" type="datetime-local" required value={form.ride_time} onChange={(e) => setForm({ ...form, ride_time: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="bp-label">Seats</label>
              <input className="bp-input" type="number" min={1} max={8} required value={form.seats} onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })} />
            </div>
            <div>
              <label className="bp-label">Phone</label>
              <input className="bp-input" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <button className="bp-btn w-full">Post_Ride</button>
        </form>
      </section>

      <section className="lg:col-span-2 bp-card">
        <div className="bp-card-header">
          <span>SEC_02: ALL_RIDES</span>
          <span>{rides.length}</span>
        </div>
        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {rides.length === 0 && <p className="font-mono text-xs text-[var(--muted-foreground)]">No rides posted yet.</p>}
          {rides.map((r) => (
            <div key={r.id} className="border-[3px] border-[var(--ink)] p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <MapPin size={16} />
                <span>{r.source} → {r.destination}</span>
              </div>
              <div className="font-mono text-xs flex flex-wrap gap-3 text-[var(--muted-foreground)]">
                <span className="flex items-center gap-1"><Clock size={12} /> {new Date(r.ride_time).toLocaleString()}</span>
                <span className="flex items-center gap-1"><Users size={12} /> {r.seats}</span>
                <a href={`tel:${r.phone}`} className="flex items-center gap-1 text-[var(--blueprint)] font-bold">
                  <Phone size={12} /> {r.phone}
                </a>
              </div>
              {r.user_id === user?.id && <span className="bp-tag bp-tag-blue">YOURS</span>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
