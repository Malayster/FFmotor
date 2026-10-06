import React, { useState } from "react";
import { Volume2, Sparkles, RotateCcw, ShieldCheck, Zap, Gauge, Fuel, Check } from "lucide-react";
import { tactileAudio } from "../../lib/audio";

interface FlagshipBike {
  id: string;
  brand: string;
  model: string;
  edition: string;
  colorName: string;
  colorHex: string;
  sellingPrice: number;
  monthlyEst: number;
  hp: number;
  torque: number;
  tankLiters: number;
  condition: "new" | "used";
  image: string;
  badge: string;
}

const FLAGSHIP_BIKES: FlagshipBike[] = [
  {
    id: "moto_3",
    brand: "YAMAHA",
    model: "Y16ZR ABS VVA",
    edition: "Doxou Edition 2024",
    colorName: "Matte Cyan Doxou",
    colorHex: "#06b6d4",
    sellingPrice: 11118,
    monthlyEst: 278,
    hp: 17.7,
    torque: 14.4,
    tankLiters: 5.4,
    condition: "new",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1000&q=80",
    badge: "EDISI TERHAD DOXOU",
  },
  {
    id: "moto_2",
    brand: "HONDA",
    model: "ADV 160 ABS",
    edition: "Touring Smart Key",
    colorName: "Matte Charcoal Grey",
    colorHex: "#52525b",
    sellingPrice: 12400,
    monthlyEst: 298,
    hp: 15.8,
    torque: 14.7,
    tankLiters: 8.1,
    condition: "used",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1000&q=80",
    badge: "1 OWNER · GRED A",
  },
  {
    id: "moto_4",
    brand: "HONDA",
    model: "RS-X 150 DOHC",
    edition: "Repsol Racing Edition",
    colorName: "Repsol Orange Racing",
    colorHex: "#ea580c",
    sellingPrice: 9998,
    monthlyEst: 248,
    hp: 15.8,
    torque: 13.6,
    tankLiters: 4.5,
    condition: "new",
    image: "https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=1000&q=80",
    badge: "WARNA MOTOGP RESMI",
  },
  {
    id: "moto_5",
    brand: "YAMAHA",
    model: "NVX 155 ABS GP",
    edition: "Monster Energy Edition",
    colorName: "Monster Matte Black",
    colorHex: "#22c55e",
    sellingPrice: 12200,
    monthlyEst: 285,
    hp: 15.1,
    torque: 13.9,
    tankLiters: 5.5,
    condition: "used",
    image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1000&q=80",
    badge: "SEDIA PANDU UJI",
  },
];

interface HeroMotorsportStageProps {
  onSelectDeposit: (bikeId: string, model: string, price: number) => void;
  onOpen360: (bikeId: string) => void;
}

export const HeroMotorsportStage: React.FC<HeroMotorsportStageProps> = ({
  onSelectDeposit,
  onOpen360,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isRevving, setIsRevving] = useState(false);

  const activeBike = FLAGSHIP_BIKES[selectedIdx];

  const handleRevEngine = () => {
    setIsRevving(true);
    tactileAudio.revEngine();
    setTimeout(() => {
      setIsRevving(false);
    }, 1000);
  };

  return (
    <div className="bg-black text-white rounded-3xl border-4 border-red-600 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      
      {/* Garisan Geometrik Perlumbaan di Latar */}
      <div className="absolute top-0 right-0 w-80 h-80 border-r-4 border-t-4 border-red-600/20 pointer-events-none" />

      {/* Header Stage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-zinc-800 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-mono font-black text-base text-white shrink-0">
            3D
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase text-red-500 tracking-wider">
                PANGGUNG JENTERA UTAMA
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold">
                JERLUN SHOWROOM
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-0.5">
              {activeBike.brand} {activeBike.model}
            </h3>
          </div>
        </div>

        {/* Butang Simulator Deruman Enjin */}
        <button
          type="button"
          onClick={handleRevEngine}
          className={`px-4 py-2.5 rounded-2xl border-2 font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-md ${
            isRevving
              ? "bg-red-600 border-white text-white animate-pulse"
              : "bg-zinc-900 border-zinc-700 hover:border-red-500 text-white"
          }`}
          title="Dengar deruman enjin 4-lejang"
        >
          <Volume2 className={`w-4 h-4 ${isRevving ? "animate-bounce text-white" : "text-red-500"}`} />
          <span>{isRevving ? "REV 9,000 RPM..." : "🔊 Dengar Bunyi Enjin"}</span>
        </button>
      </div>

      {/* Paparan Gambar Utama & HUD Telemetri */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
        
        {/* Foto Jentera 3D */}
        <div className="lg:col-span-7 relative aspect-16/10 rounded-2xl bg-zinc-950 border-2 border-zinc-800 overflow-hidden group">
          <img
            src={activeBike.image}
            alt={activeBike.model}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Lencana Edisi Khas */}
          <div className="absolute top-3 left-3 bg-red-600 text-white font-mono font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
            {activeBike.badge}
          </div>

          {/* Butang 8-Sudut Studio 360 */}
          <button
            type="button"
            onClick={() => {
              tactileAudio.click();
              onOpen360(activeBike.id);
            }}
            className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/85 hover:bg-red-600 text-white font-mono font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition cursor-pointer border border-zinc-700"
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-500" />
            <span>Pusing 8 Sudut 360°</span>
          </button>
        </div>

        {/* HUD Telemetri & Butiran Prestasi */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs font-mono">
              <span className="text-zinc-400 uppercase">Edisi / Varian:</span>
              <span className="text-white font-black">{activeBike.edition}</span>
            </div>

            {/* Grid 3 Metrik Telemetri */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-black border border-zinc-800">
                <Gauge className="w-4 h-4 text-red-500 mx-auto mb-1" />
                <span className="text-base font-mono font-black text-white block">
                  {activeBike.hp} <span className="text-[10px] text-zinc-400 font-normal">HP</span>
                </span>
                <span className="text-[9px] font-mono text-zinc-400 uppercase">Kuasa Kuda</span>
              </div>

              <div className="p-2.5 rounded-xl bg-black border border-zinc-800">
                <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <span className="text-base font-mono font-black text-white block">
                  {activeBike.torque} <span className="text-[10px] text-zinc-400 font-normal">Nm</span>
                </span>
                <span className="text-[9px] font-mono text-zinc-400 uppercase">Tork Maksimum</span>
              </div>

              <div className="p-2.5 rounded-xl bg-black border border-zinc-800">
                <Fuel className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span className="text-base font-mono font-black text-white block">
                  {activeBike.tankLiters} <span className="text-[10px] text-zinc-400 font-normal">L</span>
                </span>
                <span className="text-[9px] font-mono text-zinc-400 uppercase">Tangki Minyak</span>
              </div>
            </div>

            {/* Harga & Anggaran Ansuran */}
            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase block">Harga Showroom</span>
                <span className="text-xl sm:text-2xl font-mono font-black text-white">
                  RM {activeBike.sellingPrice.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-zinc-400 uppercase block">Anggaran Kredit</span>
                <span className="text-base font-mono font-black text-red-500">
                  RM {activeBike.monthlyEst} <span className="text-xs text-zinc-400 font-normal">/bln</span>
                </span>
              </div>
            </div>
          </div>

          {/* Butang Tindakan Kunci Unit */}
          <button
            type="button"
            onClick={() => {
              tactileAudio.click();
              onSelectDeposit(activeBike.id, `${activeBike.brand} ${activeBike.model}`, activeBike.sellingPrice);
            }}
            className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-mono font-black text-xs uppercase tracking-wider transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Kunci Unit Ini (Deposit RM300 · Tahan 48 Jam)</span>
          </button>

        </div>

      </div>

      {/* Bar Pemilihan Model / Varian Lain (Thumb-Friendly Selector) */}
      <div className="pt-4 border-t-2 border-zinc-800 space-y-2 relative z-10">
        <span className="text-[10px] font-mono font-black uppercase text-zinc-400 block">
          PILIH JENTERA UNTUK DIPAPARKAN:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {FLAGSHIP_BIKES.map((b, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  tactileAudio.click();
                  setSelectedIdx(idx);
                }}
                className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-zinc-900 border-red-600 ring-2 ring-red-600/40"
                    : "bg-black border-zinc-800 hover:border-zinc-700 opacity-70 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-black uppercase text-zinc-400">
                    {b.brand}
                  </span>
                  <span
                    className="w-3 h-3 rounded-full border border-white/40 shrink-0"
                    style={{ backgroundColor: b.colorHex }}
                    title={b.colorName}
                  />
                </div>
                <div className="font-black text-xs text-white truncate mt-1">
                  {b.model}
                </div>
                <span className="text-[10px] font-mono font-bold text-red-500 mt-0.5">
                  RM {b.sellingPrice.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
