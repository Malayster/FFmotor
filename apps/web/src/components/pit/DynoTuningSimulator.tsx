import React, { useState } from "react";
import { Gauge, Zap, Flame, CheckCircle, ArrowRight, MessageSquare, Wrench } from "lucide-react";
import { tactileAudio } from "../../lib/audio";

interface TuningStage {
  stage: number;
  title: string;
  badge: string;
  hp: number;
  hpGain: string;
  topSpeed: string;
  cost: number;
  components: string[];
  description: string;
}

const STAGES: TuningStage[] = [
  {
    stage: 0,
    title: "Kilang Standard Asal",
    badge: "STOCK OEM",
    hp: 15.4,
    hpGain: "+0.0 HP",
    topSpeed: "125 km/j",
    cost: 0,
    components: ["Enjin Standard Kilang", "ECU Standard", "Ekzos Standard Senyap"],
    description: "Kondisi asal kilang dengan fokus kepada penjimatan petrol dan ketahanan harian.",
  },
  {
    stage: 1,
    title: "Pakej ECU & Ekzos Prestasi",
    badge: "STAGE 1 · STREET",
    hp: 18.2,
    hpGain: "+2.8 HP",
    topSpeed: "138 km/j",
    cost: 680,
    components: [
      "ECU Racing Boy / NLK Standalone",
      "Sistem Ekzos UMA Racing Back-Pressure",
      "Penapis Udara High-Flow K&N Style",
      "Penalaan Dyno 1 Jam di Pit Bay 3",
    ],
    description: "Meningkatkan tindak balas pendikit trotel dan kuasa pertengahan tanpa mengorbankan ketahanan enjin.",
  },
  {
    stage: 2,
    title: "Pakej Blok Ceramic & Superhead",
    badge: "STAGE 2 · PRO FAST",
    hp: 22.5,
    hpGain: "+7.1 HP",
    topSpeed: "155 km/j",
    cost: 1450,
    components: [
      "Blok Ceramic 62mm + Omboh Forged",
      "Superhead Racing 20/23 Valve Besar",
      "Throttle Body 34mm & Injector 180cc",
      "Camshaft Racing Spec S2",
      "Penalaan Dyno Penuh 2 Jam di Pit Bay 3",
    ],
    description: "Pakej kelajuan optimum untuk pengguna highway jarak jauh dan kepuasan kuasa rpm tinggi.",
  },
  {
    stage: 3,
    title: "Pakej Terbuka Open Spec Litar",
    badge: "STAGE 3 · RACE ONLY",
    hp: 28.0,
    hpGain: "+12.6 HP",
    topSpeed: "170+ km/j",
    cost: 2800,
    components: [
      "Blok Forged 65mm & Rod Jack 3mm",
      "Superhead CNC Porting & Valve Titanium",
      "Gearbox Rasio 6-Kelajuan Racing",
      "Klac Slipper UMA Racing 5-Spring",
      "Pemetaan Dyno Khusus Bahan Api RON 97 / V-Power",
    ],
    description: "Spesifikasi perlumbaan terbuka untuk pecutan ekstrem drag dan litar perlumbaan.",
  },
];

export const DynoTuningSimulator: React.FC = () => {
  const [selectedStageIdx, setSelectedStageIdx] = useState(1);
  const [bikeType, setBikeType] = useState("Yamaha Y16ZR / Y15ZR");

  const stage = STAGES[selectedStageIdx];

  const whatsappBookingUrl = `https://wa.me/60124809979?text=${encodeURIComponent(
    `Salam Sifu Halim & Fauzi (FP Motor), saya berminat nak buat penalaan *${stage.title} (${stage.badge})* untuk motor saya *${bikeType}* di Pit Bay 3 Dyno. Anggaran kos RM${stage.cost.toLocaleString()}. Bila ada slot kosong?`
  )}`;

  return (
    <div className="bg-zinc-950 text-white rounded-3xl border-4 border-red-600 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      
      {/* Header Dyno Simulator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500 text-red-400 text-xs font-mono font-black uppercase">
            <Gauge className="w-3.5 h-3.5 text-red-500" />
            <span>BILIK PENALAAN DYNO PIT BAY 3 · JERLUN</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-1.5">
            Simulator Kuasa Kuda & Pakej Prestasi
          </h3>
          <p className="text-xs text-zinc-400 font-bold mt-0.5">
            Uji anggaran peningkatan kuasa kuda (Horsepower) motosikal anda sebelum memasuki bilik Dyno Jet kami.
          </p>
        </div>

        {/* Pilihan Model Motor */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-zinc-400 uppercase hidden sm:inline">Model:</span>
          <select
            value={bikeType}
            onChange={(e) => {
              tactileAudio.click();
              setBikeType(e.target.value);
            }}
            className="bg-black border-2 border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono font-black text-white outline-none focus:border-red-600"
          >
            <option value="Yamaha Y16ZR / Y15ZR">Yamaha Y16ZR / Y15ZR (155cc VVA)</option>
            <option value="Honda RS-X / RS150R">Honda RS-X / RS150R (150cc DOHC)</option>
            <option value="Yamaha NVX 155 ABS">Yamaha NVX 155 (CVT VVA)</option>
            <option value="Honda ADV 160">Honda ADV 160 (157cc eSP+)</option>
          </select>
        </div>
      </div>

      {/* Bar Pemilihan Peringkat Pakej (Stage 0 - 3) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {STAGES.map((s, idx) => {
          const isSelected = selectedStageIdx === idx;
          return (
            <button
              key={s.stage}
              type="button"
              onClick={() => {
                tactileAudio.click();
                setSelectedStageIdx(idx);
              }}
              className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-red-600 border-white text-white shadow-lg scale-102"
                  : "bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
              }`}
            >
              <div>
                <span className="text-[9px] font-mono font-black uppercase tracking-wider block opacity-90">
                  {s.badge}
                </span>
                <span className="text-xs sm:text-sm font-black block mt-0.5 line-clamp-1">
                  {s.title}
                </span>
              </div>
              <div className="mt-2 pt-1 border-t border-white/20 flex items-center justify-between text-xs font-mono">
                <span className="font-black text-white">{s.hp} HP</span>
                <span className={`text-[10px] font-black ${isSelected ? "text-white" : "text-emerald-400"}`}>
                  {s.hpGain}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Kawasan Tolok Meter HP & Butiran Pakej */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-black/80 border border-zinc-800 rounded-2xl p-5 sm:p-7">
        
        {/* Tolok Meter Visual Kuasa Kuda (5 Cols) */}
        <div className="lg:col-span-5 p-5 bg-zinc-950 border-2 border-zinc-800 rounded-2xl space-y-4 text-center">
          <span className="text-[10px] font-mono font-black uppercase text-zinc-400 block">
            BACAAN KUASA KUDA DINOBAY (WHEEL HP)
          </span>

          <div className="relative py-2">
            <span className="text-5xl sm:text-6xl font-mono font-black text-red-500 tracking-tight">
              {stage.hp}
            </span>
            <span className="text-xs font-mono text-zinc-400 uppercase block mt-1">
              HORSEPOWER PADA RODA BELAKANG
            </span>

            {/* Bar Kemajuan Visual Kuasa Kuda (Max 30 HP) */}
            <div className="w-full h-3 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden mt-3">
              <div
                className="h-full bg-red-600 rounded-full transition-all duration-500"
                style={{ width: `${(stage.hp / 30) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-900 text-xs font-mono">
            <div className="p-2 rounded-xl bg-black border border-zinc-800">
              <span className="text-[9px] text-zinc-500 uppercase block">Kenaikan Kuasa</span>
              <span className="font-black text-emerald-400">{stage.hpGain}</span>
            </div>
            <div className="p-2 rounded-xl bg-black border border-zinc-800">
              <span className="text-[9px] text-zinc-500 uppercase block">Kelajuan Puncak</span>
              <span className="font-black text-white">{stage.topSpeed}</span>
            </div>
          </div>
        </div>

        {/* Butiran Komponen Pakej (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black uppercase text-red-500">{stage.badge}</span>
              <span className="text-xs font-mono text-zinc-500">· {bikeType}</span>
            </div>
            <h4 className="text-lg font-black text-white mt-0.5">{stage.title}</h4>
            <p className="text-xs text-zinc-400 font-bold mt-1 leading-relaxed">
              {stage.description}
            </p>
          </div>

          {/* Senarai Komponen Yang Dipasang */}
          <div className="space-y-1.5 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] font-mono font-black uppercase text-zinc-400 block mb-1">
              KOMPONEN & UPAH DI DALAM PAKEJ:
            </span>
            <ul className="space-y-1 text-xs font-mono text-zinc-300">
              {stage.components.map((c, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Kos & Tindakan Tempah Bay 3 */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Anggaran Kos Pakej & Pasang</span>
              <span className="text-2xl font-mono font-black text-white">
                {stage.cost === 0 ? "PERCUMA (STANDARD)" : `RM ${stage.cost.toLocaleString()}`}
              </span>
            </div>

            <a
              href={whatsappBookingUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-mono font-black text-xs uppercase tracking-wider transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Tempah Slot Dyno di Bay 3</span>
            </a>
          </div>

        </div>

      </div>

    </div>
  );
};
