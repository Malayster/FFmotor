import React, { useState } from "react";
import {
  Smartphone,
  Flame,
  Package,
  Wrench,
  Users,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  LayoutDashboard
} from "lucide-react";
import { PitMasterBoard } from "../pages/PitMasterBoard";
import { Inventory } from "../pages/Inventory";
import { StaffManager } from "../pages/StaffManager";
import { ForemanDashboard } from "../components/ForemanDashboard";
import { WorkOrder, Product, Vehicle } from "../types";

interface PitTerminalProps {
  workOrders: WorkOrder[];
  products: Product[];
  vehicles?: Vehicle[];
  onRefresh: () => void;
  onOpenTrack: (token: string) => void;
  onSwitchTerminal: () => void;
}

export const PitTerminal: React.FC<PitTerminalProps> = ({
  workOrders,
  products,
  vehicles = [],
  onRefresh,
  onOpenTrack,
  onSwitchTerminal,
}) => {
  const [mobileTab, setMobileTab] = useState<"dashboard" | "bays" | "parts" | "commissions">("dashboard");

  return (
    <div className="min-h-screen bg-white text-zinc-800 flex flex-col w-full max-w-7xl mx-auto shadow-none">
      {/* Top Header Foreman */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-200 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-600/20 border border-brand-500/40 text-brand-400 flex items-center justify-center font-black">
            <Flame className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-mono font-black px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                FOREMAN MOBILE PIT
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                ● 4-Bay Lif
              </span>
            </div>
            <h1 className="text-sm font-black ">Sifu Halim & Pasukan Pit</h1>
          </div>
        </div>

        <button
          type="button"
          onClick={onSwitchTerminal}
          className="text-[11px] text-zinc-500 hover:text-red-600 flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-zinc-200 bg-white"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar</span>
        </button>
      </header>

      {/* 4 Tab Mudah Alih Sentuhan Pantas (Mobile Bottom/Top Nav) */}
      <div className="bg-white/80 border-b border-zinc-200 p-1.5 grid grid-cols-2 sm:grid-cols-4 gap-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => setMobileTab("dashboard")}
          className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
            mobileTab === "dashboard"
              ? "bg-brand-600 text-white font-black shadow-md"
              : "text-zinc-500 hover:text-red-600"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>⚡ Prestasi & Lif</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab("bays")}
          className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
            mobileTab === "bays"
              ? "bg-red-600 text-white font-black shadow-md"
              : "text-zinc-500 hover:text-red-600"
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>4-Bay Lif Live</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab("parts")}
          className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
            mobileTab === "parts"
              ? "bg-zinc-950 text-white font-black shadow-md"
              : "text-zinc-500 hover:text-red-600"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Cari Rak Sparepart</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab("commissions")}
          className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
            mobileTab === "commissions"
              ? "bg-zinc-950 text-white font-black shadow-md"
              : "text-zinc-500 hover:text-red-600"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Komisen & Staf</span>
        </button>
      </div>

      {/* Kandungan Halaman Pit */}
      <main className="flex-1 p-4 pb-12">
        {mobileTab === "dashboard" && (
          <ForemanDashboard
            workOrders={workOrders}
            vehicles={vehicles}
            foremanName="Sifu Halim"
            onRefresh={onRefresh}
            onOpenTrack={onOpenTrack}
          />
        )}

        {mobileTab === "bays" && (
          <PitMasterBoard
            workOrders={workOrders}
            products={products}
            onRefresh={onRefresh}
            onOpenTrack={onOpenTrack}
          />
        )}

        {mobileTab === "parts" && (
          <div className="space-y-4">
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-xs">
              <h2 className="font-bold text-sm">Lokasi Rak Alat Ganti (Pit Quick Check)</h2>
              <p className="text-zinc-500 mt-0.5">Semak baki stok dan nombor rak sebelum mula pasang.</p>
            </div>
            <Inventory products={products} onRefresh={onRefresh} />
          </div>
        )}

        {mobileTab === "commissions" && (
          <StaffManager />
        )}
      </main>
    </div>
  );
};

