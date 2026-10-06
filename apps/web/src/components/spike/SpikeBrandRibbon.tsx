import React from "react";
import { Zap, ShieldCheck, Award } from "lucide-react";

interface BrandItem {
  name: string;
  category: string;
  badge: string;
  badgeColor: string;
  accent: string;
}

const MOTORSPORT_BRANDS: BrandItem[] = [
  { name: "YAMAHA RACING", category: "OEM & Blue Core", badge: "Minyak Yamalube & CVT", badgeColor: "bg-red-600 text-white", accent: "hover:border-red-600" },
  { name: "HONDA PGM-FI", category: "OEM Genuine Parts", badge: "Sproket & Palam OEM", badgeColor: "bg-red-700 text-white", accent: "hover:border-red-500" },
  { name: "MOTUL 300V / 7100", category: "Performance Lube", badge: "100% Fully Synthetic", badgeColor: "bg-red-600 text-white", accent: "hover:border-red-600" },
  { name: "BREMBO BRAKES", category: "Braking System", badge: "Pad Seramik & Caliper", badgeColor: "bg-white text-black font-black", accent: "hover:border-white" },
  { name: "RACING BOY (RCB)", category: "Suspension & Alloy", badge: "Monoshock & Rim GP", badgeColor: "bg-red-600 text-white", accent: "hover:border-red-500" },
  { name: "MAXXIS TYRES", category: "High Grip Racing", badge: "Diamond MA-3D / Volans", badgeColor: "bg-zinc-800 text-zinc-200", accent: "hover:border-red-500" },
  { name: "D.I.D CHAINS", category: "Drive System", badge: "428HD X-Ring Gold", badgeColor: "bg-white/10 ", accent: "hover:border-white" },
];

interface SpikeBrandRibbonProps {
  onSelectBrand?: (brand: string) => void;
  activeBrand?: string;
}

export const SpikeBrandRibbon: React.FC<SpikeBrandRibbonProps> = ({
  onSelectBrand,
  activeBrand,
}) => {
  return (
    <div className="spike-card p-3 overflow-hidden shadow-none">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1 font-mono">
            <Zap className="w-3.5 h-3.5 text-red-500" />
            <span>Rakan Pembekal & Jenama Motorsport Rasmi Bengkel</span>
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">100% Tulen Dijamin</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {MOTORSPORT_BRANDS.map((b) => {
          const isSelected = activeBrand === b.name;
          return (
            <button
              key={b.name}
              type="button"
              onClick={() => onSelectBrand && onSelectBrand(b.name)}
              className={`shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all duration-200 text-left ${
 isSelected
 ? "bg-red-600 text-white border-white shadow-lg shadow-red-600/30 scale-102"
 : `bg-white border-zinc-200 text-zinc-300 ${b.accent} hover:bg-zinc-50`
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center shrink-0">
                <Award className={`w-3.5 h-3.5 ${isSelected ? "" : "text-red-500"}`} />
              </div>
              <div className="leading-tight">
                <span className="text-xs font-black block tracking-tight font-mono">{b.name}</span>
                <span className="text-[9px] text-zinc-400 block">{b.category}</span>
              </div>
              <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ml-1 shrink-0 ${isSelected ? "bg-black text-white" : b.badgeColor}`}>
                {b.badge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

