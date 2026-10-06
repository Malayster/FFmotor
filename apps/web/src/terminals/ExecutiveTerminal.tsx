import React, { useState } from "react";
import {
  Crown,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Users,
  Truck,
  Bike,
  LogOut,
  Sparkles,
  Calendar,
  AlertOctagon,
  Settings,
  Clock
} from "lucide-react";
import { Dashboard } from "../pages/Dashboard";
import { StaffManager } from "../pages/StaffManager";
import { SupplierOrders } from "../pages/SupplierOrders";
import { FinanceLedger } from "../pages/FinanceLedger";
import { MotorSales } from "../pages/MotorSales";
import { LoanPipeline } from "../pages/LoanPipeline";
import { WarrantyIssues } from "../pages/WarrantyIssues";
import { WorkshopSettings } from "../pages/WorkshopSettings";
import { BossStaffSupervision } from "../components/BossStaffSupervision";
import { WorkshopAnalyticsCharts } from "../components/WorkshopAnalyticsCharts";
import { CustomerCRMHub } from "../components/CustomerCRMHub";
import { SalesPipelineKanban } from "../components/SalesPipelineKanban";
import { WorkOrder, Product, Motorcycle } from "../types";

interface ExecutiveTerminalProps {
  workOrders: WorkOrder[];
  products: Product[];
  motorcycles: Motorcycle[];
  onRefresh: () => void;
  onOpenTrack: (token: string) => void;
  onOpenPassport: (plate: string) => void;
  onSwitchTerminal: () => void;
}

export const ExecutiveTerminal: React.FC<ExecutiveTerminalProps> = ({
  workOrders,
  products,
  motorcycles,
  onRefresh,
  onOpenTrack,
  onOpenPassport,
  onSwitchTerminal,
}) => {
  const [executiveTab, setExecutiveTab] = useState<"cockpit" | "crm" | "sales" | "inventory" | "settings">("cockpit");

  return (
    <div className="min-h-screen bg-white text-zinc-800 flex flex-col">
      {/* Top Header Khusus Pengarah / Tauke */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-200 px-6 py-3.5 flex items-center justify-between shadow-none">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center font-black">
            <Crown className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-black px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">
                KOKPIT TADBIR URUS PENGARAH (/admin)
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Segerak Kaunter Kerani (Live)
              </span>
            </div>
            <h1 className="text-base font-black ">Pusat Kawalan & Nadi Keuntungan Eksekutif</h1>
          </div>
        </div>

        {/* Navigasi Utama Pengarah (Standard Johan30 Cockpit) */}
        <div className="hidden md:flex items-center gap-1.5 bg-white p-1 rounded-xl border border-zinc-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setExecutiveTab("cockpit")}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-2 whitespace-nowrap ${
              executiveTab === "cockpit"
                ? "bg-red-600 text-white font-black shadow-md"
                : "text-zinc-500 hover:text-red-600"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Kokpit Perdana Bos</span>
          </button>

          <button
            type="button"
            onClick={() => setExecutiveTab("crm")}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-2 whitespace-nowrap ${
              executiveTab === "crm"
                ? "bg-zinc-950 text-white font-black shadow-md"
                : "text-zinc-700 hover:text-red-600"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Pangkalan Data CRM</span>
          </button>

          <button
            type="button"
            onClick={() => setExecutiveTab("sales")}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-2 whitespace-nowrap ${
              executiveTab === "sales"
                ? "bg-zinc-950 text-white font-black shadow-md"
                : "text-zinc-700 hover:text-red-600"
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Showroom & Pinjaman</span>
          </button>

          <button
            type="button"
            onClick={() => setExecutiveTab("inventory")}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-2 whitespace-nowrap ${
              executiveTab === "inventory"
                ? "bg-zinc-950 text-white font-black shadow-md"
                : "text-zinc-500 hover:text-red-600"
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Stok & Pembekal</span>
          </button>

          <button
            type="button"
            onClick={() => setExecutiveTab("settings")}
            className={`px-3.5 py-2 rounded-lg transition flex items-center gap-2 whitespace-nowrap ${
              executiveTab === "settings"
                ? "bg-zinc-200 text-red-600 font-black shadow-md"
                : "text-zinc-500 hover:text-red-600"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Tetapan</span>
          </button>
        </div>

        {/* Butang Tukar Stesen */}
        <button
          type="button"
          onClick={onSwitchTerminal}
          className="text-xs text-zinc-500 hover:text-red-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Tukar Stesen</span>
        </button>
      </header>

      {/* Tab Navigasi Mobile untuk Tablet/Phone Tauke */}
      <div className="md:hidden bg-zinc-50 border-b border-zinc-200 p-2 flex gap-1 overflow-x-auto text-xs font-bold">
        <button
          type="button"
          onClick={() => setExecutiveTab("cockpit")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
            executiveTab === "cockpit" ? "bg-red-600 text-white font-black" : "text-zinc-500"
          }`}
        >
          Kokpit Perdana
        </button>
        <button
          type="button"
          onClick={() => setExecutiveTab("crm")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
            executiveTab === "crm" ? "bg-zinc-950 text-white font-black" : "text-zinc-700"
          }`}
        >
          Pelanggan CRM
        </button>
        <button
          type="button"
          onClick={() => setExecutiveTab("sales")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
            executiveTab === "sales" ? "bg-zinc-950 text-white font-black" : "text-zinc-500"
          }`}
        >
          Showroom
        </button>
        <button
          type="button"
          onClick={() => setExecutiveTab("inventory")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
            executiveTab === "inventory" ? "bg-zinc-950 text-white font-black" : "text-zinc-500"
          }`}
        >
          Stok & PO
        </button>
        <button
          type="button"
          onClick={() => setExecutiveTab("settings")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
            executiveTab === "settings" ? "bg-zinc-200 text-red-600 font-black" : "text-zinc-500"
          }`}
        >
          Tetapan
        </button>
      </div>

      {/* Kandungan Eksekutif */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {executiveTab === "cockpit" && (
          <Dashboard
            workOrders={workOrders}
            products={products}
            setActiveTab={(tab) => {
              if (tab === "inventory" || tab === "suppliers") setExecutiveTab("inventory");
              else if (tab === "motor-sales" || tab === "loan-pipeline") setExecutiveTab("sales");
              else if (tab === "crm" || tab === "customers") setExecutiveTab("crm");
            }}
            onOpenTrack={onOpenTrack}
            onOpenPassport={onOpenPassport}
          />
        )}

        {executiveTab === "crm" && (
          <CustomerCRMHub />
        )}

        {executiveTab === "sales" && (
          <div className="space-y-6">
            <SalesPipelineKanban motorcycles={motorcycles} />
            <LoanPipeline motorcycles={motorcycles} />
            <MotorSales motorcycles={motorcycles} onRefresh={onRefresh} />
          </div>
        )}

        {executiveTab === "inventory" && (
          <div className="space-y-6">
            <SupplierOrders products={products} onRefreshProducts={onRefresh} />
            <WarrantyIssues />
          </div>
        )}

        {executiveTab === "settings" && (
          <WorkshopSettings onSaved={onRefresh} />
        )}
      </main>
    </div>
  );
};

