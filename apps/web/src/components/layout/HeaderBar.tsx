import React from "react";
import { Menu, Search, Wrench, Package, ShieldCheck, Bike, Bell, ExternalLink, QrCode } from "lucide-react";

interface HeaderBarProps {
  onToggleSidebar: () => void;
  setActiveTab: (tab: string) => void;
  onQuickTrack?: () => void;
  onQuickPassport?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onToggleSidebar,
  setActiveTab,
  onQuickTrack,
  onQuickPassport,
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {/* Toggle Button for Mobile */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Quick Search (Simulated) */}
        <div className="relative hidden sm:block w-72 md:w-96">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Carian pantas no plat (VDF8899), no telefon, atau part..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-brand-500 transition"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2">
        {/* Quick Demo Links */}
        <button
          onClick={onQuickTrack}
          className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition"
        >
          <span>Live Track Demo</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onQuickPassport}
          className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 text-xs font-bold transition"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Pasport VHG8821</span>
        </button>

        {/* Action Button */}
        <button
          onClick={() => setActiveTab("work-orders")}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition"
        >
          <Wrench className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Job Card Baru</span>
        </button>
      </div>
    </header>
  );
};

