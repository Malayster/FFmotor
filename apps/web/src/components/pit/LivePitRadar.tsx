import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock, ArrowRight } from "lucide-react";

type Bay = {
  id: string;
  status: "ready" | "occupied";
  statusLabel: string;
  bike: string;
  job: string;
  technician: string;
  progress: number;
};

const EMPTY: Bay[] = [1, 2, 3, 4].map((n) => ({
  id: `BAY-0${n}`,
  status: "ready",
  statusLabel: "KOSONG",
  bike: "Tiada unit direkod",
  job: "Status ini datang dari slot servis hari ini, bukan angka tetap.",
  technician: "Belum ditugaskan",
  progress: 0,
}));

export const LivePitRadar: React.FC = () => {
  const [bays, setBays] = useState<Bay[]>(EMPTY);
  const [note, setNote] = useState("Memuatkan slot hari ini...");

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const res = await fetch("/api/public/bays");
        const data = await res.json();
        if (stop) return;
        if (data?.ok && Array.isArray(data.bays)) {
          setBays(data.bays);
          setNote(data.message || "Slot hari ini.");
        } else {
          setBays(EMPTY);
          setNote("Radar tidak dapat baca slot. Tiada status palsu dipaparkan.");
        }
      } catch {
        if (!stop) {
          setBays(EMPTY);
          setNote("Pelayan pit tidak menjawab. Bay dipaparkan kosong.");
        }
      }
    };
    load();
    const timer = window.setInterval(load, 30000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, []);

  const active = bays.filter((b) => b.status === "occupied").length;

  return (
    <div className="bg-zinc-950 text-white rounded-3xl border-4 border-red-600 p-6 sm:p-8 space-y-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500 text-red-400 text-xs font-mono font-black uppercase">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>SLOT PIT HARI INI</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight mt-2 text-white">
            Status 4-Bay dari tempahan sebenar
          </h3>
          <p className="text-xs text-zinc-400 font-bold mt-0.5">{note}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-right">
            <span className="text-[10px] font-mono text-zinc-400 uppercase block">Bay berjadual</span>
            <span className="text-base font-mono font-black text-emerald-400">{active} / 4</span>
          </div>
          <a href="#servis" className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5">
            <span>Tempah Slot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {bays.map((b) => (
          <div key={b.id} className={`p-4 rounded-2xl border-2 space-y-3 ${b.status === "ready" ? "bg-emerald-950/30 border-emerald-600/60" : "bg-black border-zinc-800"}`}>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
              <span className="font-mono font-black text-xs text-white px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">{b.id}</span>
              <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full ${b.status === "ready" ? "bg-emerald-500 text-zinc-950" : "bg-zinc-800 text-zinc-300"}`}>{b.statusLabel}</span>
            </div>
            <h4 className="font-black text-sm text-white truncate">{b.bike}</h4>
            <p className="text-xs text-zinc-400 font-bold line-clamp-2">{b.job}</p>
            <div className="text-[10px] font-mono text-zinc-400">{b.technician}</div>
            {b.status === "ready" && (
              <div className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Kosong sehingga ada slot</span>
              </div>
            )}
          </div>
        ))}
      </div>
      {typeof window !== "undefined" && window.localStorage.getItem("ffmotor_staff_token") && (
        <form className="grid grid-cols-2 sm:grid-cols-5 gap-2" onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const body = {
            bay: Number((form.elements.namedItem("bay") as HTMLInputElement).value),
            plate: (form.elements.namedItem("plate") as HTMLInputElement).value,
            serviceType: (form.elements.namedItem("job") as HTMLInputElement).value,
          };
          const res = await fetch("/api/public/bays", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
          const data = await res.json();
          setNote(data.message || "Bay dikemas kini.");
          const again = await fetch("/api/public/bays");
          const next = await again.json();
          if (next?.bays) setBays(next.bays);
        }}>
          <input name="bay" type="number" min={1} max={4} placeholder="Bay" className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs" required />
          <input name="plate" placeholder="Plat" className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs" required />
          <input name="job" placeholder="Kerja" className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs sm:col-span-2" required />
          <button className="rounded-xl bg-red-600 text-white text-xs font-black uppercase" type="submit">Kemas kini</button>
        </form>
      )}
      <div className="pt-3 border-t border-zinc-900 text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-red-500" />
        <span>Mekanik kemas kini bay selepas log masuk. Tiada peratus palsu.</span>
      </div>
    </div>
  );
};
