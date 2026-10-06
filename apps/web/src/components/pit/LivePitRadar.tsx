import React from "react";
import { Wrench, CheckCircle2, Flame, ShieldAlert, Clock, ArrowRight } from "lucide-react";

export const LivePitRadar: React.FC = () => {
  const bays = [
    {
      id: "BAY-01",
      name: "Pit Hoist 1 (Servis Am & Transmisi)",
      status: "occupied",
      statusLabel: "SEDANG SERVIS",
      bike: "Yamaha NVX 155 ABS",
      job: "Penukaran V-Belt CVT & Servis Minyak",
      technician: "Mekanik Danial (Bay 1)",
      progress: 75,
    },
    {
      id: "BAY-02",
      name: "Pit Hoist 2 (Pantas / Walk-in)",
      status: "ready",
      statusLabel: "BERSEDIA / KOSONG",
      bike: "Sedia Menerima Unit",
      job: "Pemeriksaan Percuma 12 Titik Keselamatan",
      technician: "Mekanik Syafiq (Bay 2)",
      progress: 0,
    },
    {
      id: "BAY-03",
      name: "Pit Hoist 3 (Prestasi & Dyno)",
      status: "occupied",
      statusLabel: "PENALAAN PRESTASI",
      bike: "Yamaha Y16ZR Doxou",
      job: "Dyno Run & Setting ECU Racing Boy",
      technician: "Sifu Halim (Tuner)",
      progress: 60,
    },
    {
      id: "BAY-04",
      name: "Pit Hoist 4 (Kawalan Kualiti QC)",
      status: "qc",
      statusLabel: "PEMERIKSAAN KUALITI",
      bike: "Honda ADV 160 ABS",
      job: "Pemeriksaan Kualiti Fizikal Akhir",
      technician: "Ketua Foreman (Abang Din)",
      progress: 90,
    },
  ];

  return (
    <div className="bg-zinc-950 text-white rounded-3xl border-4 border-red-600 p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* Header Radar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500 text-red-400 text-xs font-mono font-black uppercase">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>LANTAI BENGKEL MASA NYATA (LIVE PIT MONITOR)</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight mt-2 text-white">
            Status Semasa 4-Bay Hydraulic Lif Hoist
          </h3>
          <p className="text-xs text-zinc-400 font-bold mt-0.5">
            Ketelusan fizikal di premis Simpang 3 Kemboja, Jerlun. Pantau kelancaran aliran kerja secara langsung.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-right">
            <span className="text-[10px] font-mono text-zinc-400 uppercase block">Kapasiti Bay</span>
            <span className="text-base font-mono font-black text-emerald-400">3 / 4 AKTIF</span>
          </div>
          <a
            href="#servis"
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <span>Tempah Slot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Grid 4 Bay */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {bays.map((b) => (
          <div
            key={b.id}
            className={`p-4 rounded-2xl border-2 flex flex-col justify-between space-y-3 transition ${
              b.status === "ready"
                ? "bg-emerald-950/30 border-emerald-600/60"
                : b.status === "qc"
                ? "bg-zinc-900 border-red-600"
                : "bg-black border-zinc-800"
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                <span className="font-mono font-black text-xs text-white px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                  {b.id}
                </span>
                <span
                  className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    b.status === "ready"
                      ? "bg-emerald-500 text-zinc-950 font-black animate-pulse"
                      : b.status === "qc"
                      ? "bg-red-600 text-white"
                      : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${b.status === "ready" ? "bg-zinc-950" : "bg-white"}`} />
                  <span>{b.statusLabel}</span>
                </span>
              </div>

              <h4 className="font-black text-sm text-white mt-2.5 truncate">
                {b.bike}
              </h4>
              <p className="text-xs text-zinc-400 font-bold mt-1 line-clamp-2">
                {b.job}
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-900 space-y-2">
              <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                <span className="truncate">{b.technician}</span>
                {b.progress > 0 && <span className="font-black text-red-500">{b.progress}%</span>}
              </div>

              {b.progress > 0 ? (
                <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      b.status === "qc" ? "bg-red-600" : "bg-emerald-500"
                    }`}
                    style={{ width: `${b.progress}%` }}
                  />
                </div>
              ) : (
                <div className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Sedia untuk motor anda</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Nota Kualiti & Waktu Operasi */}
      <div className="pt-3 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-zinc-400 gap-2">
        <span className="flex items-center gap-1.5 text-zinc-300">
          <Clock className="w-3.5 h-3.5 text-red-500" />
          <span>Waktu Operasi Pit: <strong>8:30 PG - 6:30 PTG</strong> (Sabtu - Khamis)</span>
        </span>
        <span className="text-zinc-500">
          Semua pelepasan servis disahkan secara fizikal oleh Ketua Foreman
        </span>
      </div>
    </div>
  );
};
