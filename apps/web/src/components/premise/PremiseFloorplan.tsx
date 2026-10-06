import React, { useState } from "react";
import { MapPin, Navigation, Eye, CheckCircle2, ShieldCheck, Wrench, Users, Package, Flame } from "lucide-react";
import { tactileAudio } from "../../lib/audio";

interface PremiseZone {
  id: string;
  name: string;
  code: string;
  icon: React.ComponentType<{ className?: string }>;
  purpose: string;
  equipment: string[];
  inCharge: string;
  gridArea: string;
}

const ZONES: PremiseZone[] = [
  {
    id: "zone_showroom",
    name: "Showroom Pameran & Ruang Menunggu",
    code: "ZON A · HADAPAN",
    icon: Users,
    purpose: "Pameran motosikal edisi khas, ruang rundingan jualan, dan ruang menunggu berhawa dingin untuk pelanggan.",
    equipment: ["Lounge Sofa & TV Telemetri", "Katalog Motosikal 360", "Wi-Fi Percuma & Minuman"],
    inCharge: "Khidmat Pelanggan / Affiliate Jualan",
    gridArea: "showroom",
  },
  {
    id: "zone_counter",
    name: "Kaunter SA & Terminal POS",
    code: "ZON B · KAUNTER",
    icon: ShieldCheck,
    purpose: "Pendaftaran kemasukan motor (Intake), sebut harga rasmi, dan pembayaran tanpa tunai dengan resit Z-Report.",
    equipment: ["Terminal Kaunter Staf (Kerani 1)", "Pengimbas Kod Barcode POS", "Pencetak Resit Terma 80mm"],
    inCharge: "Kerani 1 Kaunter (Aiman)",
    gridArea: "counter",
  },
  {
    id: "zone_store",
    name: "Stor Rak Alat Ganti Tulen 100%",
    code: "ZON C · STOR",
    icon: Package,
    purpose: "Penyimpanan sistematik berlabel (Rak A1 - D3) dan pengesahan kod siri keaslian alat ganti pengedar rasmi.",
    equipment: ["Rak Transmisi & Brek (A-D)", "Stesen Semakan Kod Siri Part", "Terminal Inventori (Kerani 2)"],
    inCharge: "Kerani 2 Stor (Fauzi)",
    gridArea: "store",
  },
  {
    id: "zone_pit12",
    name: "Pit Bay 1 & 2 (Hydraulic Lif Hoist)",
    code: "ZON D · PIT SERVIS",
    icon: Wrench,
    purpose: "Servis penyelenggaraan pantas, pertukaran minyak, belting CVT, pad brek, dan tayar tanpa melengahkan masa pelanggan.",
    equipment: ["2 Unit Hydraulic Pit Hoist", "Pneumatic Air Wrench", "Alat Pembuka Klac CVT Khusus"],
    inCharge: "Mekanik Servis Bay 1 & 2",
    gridArea: "pit12",
  },
  {
    id: "zone_dyno",
    name: "Pit Bay 3 (Bilik Kalis Bunyi Dyno)",
    code: "ZON E · DYNO JET",
    icon: Flame,
    purpose: "Bilik penalaan prestasi tertutup kalis bunyi untuk pemetaan ECU, ujian kuasa kuda (HP), dan ujian kelajuan roda.",
    equipment: ["Chassis Dyno Test Roller", "Kipas Penyejuk Udara 5,000 CFM", "Sistem Analisis Ekzos AFR"],
    inCharge: "Sifu Halim (Tuner Khas)",
    gridArea: "dyno",
  },
  {
    id: "zone_qc",
    name: "Pit Bay 4 (Pemeriksaan Kualiti Fizikal)",
    code: "ZON F · AUDIT QC",
    icon: CheckCircle2,
    purpose: "Pemeriksaan fizikal akhir 12 titik keselamatan jalan raya oleh Ketua Foreman sebelum motor diserah semula kepada pemilik.",
    equipment: ["Lif Hoist Pemeriksaan Akhir", "Torque Wrench Pengetat Nat Roda", "Meter Tekanan Tayar Digital"],
    inCharge: "Ketua Foreman (Abang Din)",
    gridArea: "qc",
  },
];

export const PremiseFloorplan: React.FC = () => {
  const [activeZoneId, setActiveZoneId] = useState<string>("zone_pit12");

  const activeZone = ZONES.find((z) => z.id === activeZoneId) || ZONES[0];
  const Icon = activeZone.icon;

  return (
    <div className="bg-zinc-950 text-white rounded-3xl border-4 border-zinc-950 p-6 sm:p-8 space-y-6 shadow-2xl">
      
      {/* Header Floorplan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500 text-red-400 text-xs font-mono font-black uppercase">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            <span>PELAN SUSUN ATUR PREMIS RASMI · NO. 629 SIMPANG 3 KEMBOJA</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-1.5">
            Peta Premis 4-Bay & Showroom FP Motor
          </h3>
          <p className="text-xs text-zinc-400 font-bold mt-0.5">
            Ketahui susunan zon operasi kami. Klik pada mana-mana zon di bawah untuk melihat kemudahan fizikal.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://maps.google.com/?q=Simpang+3+Kemboja+Jerlun"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-mono font-black text-xs uppercase flex items-center gap-1.5 transition"
          >
            <Navigation className="w-3.5 h-3.5 text-red-500" />
            <span>Navigasi Waze / Maps</span>
          </a>
        </div>
      </div>

      {/* Grid Interaktif Peta Premis (Interactive Blueprint Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {ZONES.map((zone) => {
          const ZoneIcon = zone.icon;
          const isActive = activeZoneId === zone.id;

          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => {
                tactileAudio.click();
                setActiveZoneId(zone.id);
              }}
              className={`p-3.5 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                isActive
                  ? "bg-red-600 border-white text-white shadow-lg scale-102"
                  : "bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-1.5">
                  <ZoneIcon className={`w-4 h-4 ${isActive ? "text-white" : "text-red-500"}`} />
                  <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded bg-black/40">
                    {zone.code.split("·")[0]}
                  </span>
                </div>
                <h4 className="font-black text-xs text-white leading-tight mt-1">
                  {zone.name}
                </h4>
              </div>

              <span className={`text-[9px] font-mono mt-3 uppercase font-bold block ${isActive ? "text-white/80" : "text-zinc-500"}`}>
                Klik untuk butiran →
              </span>
            </button>
          );
        })}
      </div>

      {/* Paparan Butiran Zon Terpilih */}
      <div className="bg-black/90 border-2 border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-black uppercase text-red-500">{activeZone.code}</span>
              <h4 className="text-base sm:text-lg font-black text-white">{activeZone.name}</h4>
            </div>
          </div>

          <div className="px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
            Petugas Kawalan: <strong className="text-white">{activeZone.inCharge}</strong>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-zinc-300 font-bold leading-relaxed">
          {activeZone.purpose}
        </p>

        {/* Senarai Kelengkapan Zon */}
        <div className="space-y-1.5 bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
          <span className="text-[10px] font-mono font-black uppercase text-zinc-400 block mb-1">
            KELENGKAPAN & PERALATAN STANDARD DI ZON INI:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono text-zinc-200">
            {activeZone.equipment.map((eq, i) => (
              <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{eq}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
