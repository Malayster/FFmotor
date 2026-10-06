import React, { useState } from "react";
import {
  Monitor,
  Activity,
  ClipboardList,
  ShoppingCart,
  Wrench,
  DollarSign,
  FileText,
  LogOut,
  Sparkles,
  Search,
  ExternalLink,
  User,
  Bike,
  RotateCcw,
  CheckCircle2,
  ChevronDown
} from "lucide-react";
import { DailyOpsPulse } from "../components/DailyOpsPulse";
import { ReturnManagerModal } from "../components/ReturnManagerModal";
import { ExpressIntake } from "../pages/ExpressIntake";
import { PosCheckout } from "../pages/PosCheckout";
import { WorkOrders } from "../pages/WorkOrders";
import { QuotationManager } from "../pages/QuotationManager";
import { FinanceLedger } from "../pages/FinanceLedger";
import { CustomerProfile360 } from "../pages/CustomerProfile360";
import { CustomerCRMHub } from "../components/CustomerCRMHub";
import { SalesPipelineKanban } from "../components/SalesPipelineKanban";
import { MotorSales } from "../pages/MotorSales";
import { LoanPipeline } from "../pages/LoanPipeline";
import { Vehicle, WorkOrder, Product, Motorcycle } from "../types";

interface CounterTerminalProps {
  vehicles: Vehicle[];
  workOrders: WorkOrder[];
  products: Product[];
  motorcycles: Motorcycle[];
  onRefresh: () => void;
  onOpenTrack: (token: string) => void;
  onSwitchTerminal: () => void;
}

export const CounterTerminal: React.FC<CounterTerminalProps> = ({
  vehicles,
  workOrders,
  products,
  motorcycles,
  onRefresh,
  onOpenTrack,
  onSwitchTerminal,
}) => {
  const [activeTab, setActiveTab] = useState<
    "pulse" | "intake" | "workorders" | "pos" | "motorsales" | "quotes" | "closing" | "customers"
  >("pulse");
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [activeClerk, setActiveClerk] = useState<string>("Siti Sarah (Front Desk & SA)");

  return (
    <div className="min-h-screen bg-white text-zinc-800 flex flex-col">
      {/* Top Navigation Bar Khusus PC Kaunter */}
      <header className="sticky top-0 z-40 bg-zinc-50 border-b border-zinc-200 px-6 py-3 flex items-center justify-between shadow-none">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center font-black">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-black px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">
                STESEN PC KAUNTER 3S
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold">
                ● Peti Wang Aktif
              </span>
            </div>
            <h1 className="text-base font-black ">FFmotor Counter & Daily Operations</h1>
          </div>
        </div>

        {/* Tab Navigasi Stesen Kerani 3S */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-zinc-200 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("pulse")}
            className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "pulse"
                ? "bg-zinc-950 text-white font-black shadow-sm"
                : "text-zinc-500 hover:text-red-600"
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-700" />
            <span>1. Nadi & Progress Hari Ini</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("intake")}
            className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "intake"
                ? "bg-red-600 text-white font-black shadow-sm"
                : "text-zinc-500 hover:text-red-600"
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>2. Daftar Servis</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("workorders")}
            className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "workorders"
                ? "bg-brand-600 text-white font-black shadow-sm"
                : "text-zinc-500 hover:text-red-600"
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>3. Kad Kerja</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pos")}
            className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "pos"
                ? "bg-zinc-950 text-white font-black shadow-sm"
                : "text-zinc-500 hover:text-red-600"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>4. POS Spare Parts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("motorsales")}
            className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "motorsales"
                ? "bg-zinc-950 text-white font-black shadow-sm"
                : "text-zinc-500 hover:text-red-600"
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>5. Jualan Motor</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("quotes")}
            className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "quotes"
                ? "bg-brand-600 text-white font-black shadow-sm"
                : "text-zinc-500 hover:text-red-600"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>6. Sebut Harga</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("closing")}
            className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "closing"
                ? "bg-zinc-100 text-zinc-800 font-black shadow-sm"
                : "text-zinc-500 hover:text-red-600"
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>7. Transaksi & Z-Report</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("customers")}
            className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "customers"
                ? "bg-zinc-950 text-white font-black shadow-sm"
                : "text-zinc-500 hover:text-red-600"
            }`}
          >
            <User className="w-4 h-4 text-zinc-700" />
            <span>8. Pelanggan & Recall</span>
          </button>
        </div>

        {/* Kanan Header: Butang Pulangan, Pilihan Kerani & Tukar Stesen */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowReturnModal(true)}
            className="text-xs text-red-700 hover:text-white bg-red-50 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition"
            title="Rekod Pulangan / Tukar Ganti Barang"
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-700" />
            <span>Pulangan</span>
          </button>

          <div className="hidden xl:flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-200">
            <span className="text-[10px] uppercase font-mono text-zinc-500 font-bold">Staf:</span>
            <select
              value={activeClerk}
              onChange={(e) => setActiveClerk(e.target.value)}
              className="bg-transparent text-red-600 font-mono text-xs focus:outline-none cursor-pointer"
            >
              <option value="Siti Sarah (Front Desk & SA)" className="bg-zinc-50 ">Siti Sarah (SA / Kaunter)</option>
              <option value="Aiman Hakimi (Kasir & Servis)" className="bg-zinc-50 ">Aiman Hakimi (Kasir / Servis)</option>
              <option value="Farhan (Owner / Kaunter Backup)" className="bg-zinc-50 ">Farhan (Owner Backup)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={onSwitchTerminal}
            className="text-xs text-zinc-500 hover:text-red-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Tukar Stesen</span>
          </button>
        </div>
      </header>

      {/* Kandungan Mengikut Tab Kaunter */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {activeTab === "pulse" && (
          <DailyOpsPulse
            workOrders={workOrders}
            products={products}
            onOpenIntake={() => setActiveTab("intake")}
            onOpenPos={() => setActiveTab("pos")}
            onOpenMotorSales={() => setActiveTab("motorsales")}
            onOpenReturns={() => setShowReturnModal(true)}
            onOpenClosing={() => setActiveTab("closing")}
          />
        )}

        {activeTab === "intake" && (
          <ExpressIntake
            vehicles={vehicles}
            onIntakeSuccess={(woId, token) => {
              onRefresh();
              onOpenTrack(token);
            }}
          />
        )}

        {activeTab === "workorders" && (
          <WorkOrders
            workOrders={workOrders}
            products={products}
            vehicles={vehicles}
            onRefresh={onRefresh}
            onOpenTrack={onOpenTrack}
          />
        )}

        {activeTab === "pos" && (
          <PosCheckout
            products={products}
            onRefreshProducts={onRefresh}
          />
        )}

        {activeTab === "motorsales" && (
          <div className="space-y-6">
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-700 border border-zinc-300 flex items-center justify-center font-black">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black ">Kaunter Jualan Motosikal & Corong Pipeline Jualan</h2>
                  <p className="text-xs text-zinc-500">Pendaftaran motosikal baharu, penjejakan prospek dari Lead ke Serahan Kunci mengikut standard BottleCRM.</p>
                </div>
              </div>
            </div>
            <SalesPipelineKanban
              motorcycles={motorcycles}
              onOpenCustomer={() => setActiveTab("customers")}
            />
            <LoanPipeline motorcycles={motorcycles} />
            <MotorSales motorcycles={motorcycles} onRefresh={onRefresh} />
          </div>
        )}

        {activeTab === "quotes" && (
          <QuotationManager products={products} />
        )}

        {activeTab === "closing" && (
          <FinanceLedger workOrders={workOrders} products={products} />
        )}

        {activeTab === "customers" && (
          <CustomerCRMHub />
        )}
      </main>

      {/* Modal Pulangan Barang (Returns, Exchange & Claims) */}
      {showReturnModal && (
        <ReturnManagerModal
          products={products}
          onClose={() => setShowReturnModal(false)}
          onRefreshProducts={onRefresh}
        />
      )}
    </div>
  );
};
