import React, { useState } from "react";
import {
  Wrench,
  Package,
  ShieldCheck,
  Bike,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  ChevronRight,
  Video,
  Sparkles,
  QrCode,
  DollarSign,
  ArrowRight,
  Filter,
  Eye,
  Send,
  Printer
} from "lucide-react";
import { WorkOrder, Product } from "../types";
import { WorkshopNadiBar } from "../components/dashboard/WorkshopNadiBar";
import { WorkshopBottlenecks } from "../components/dashboard/WorkshopBottlenecks";
import { WorkDashboardDrawer } from "../components/dashboard/WorkDashboardDrawer";
import { ThermalReceiptModal } from "../components/ui/ThermalReceiptModal";

interface DashboardProps {
  workOrders: WorkOrder[];
  products: Product[];
  setActiveTab: (tab: string) => void;
  onOpenTrack: (token: string) => void;
  onOpenPassport: (plate: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  workOrders,
  products,
  setActiveTab,
  onOpenTrack,
  onOpenPassport,
}) => {
  const [peekWorkOrder, setPeekWorkOrder] = useState<WorkOrder | null>(null);
  const [receiptModalWo, setReceiptModalWo] = useState<WorkOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "waiting_approval" | "in_progress" | "ready" | "completed">("all");

  const activeJobs = workOrders.filter((w) => w.status !== "completed" && w.status !== "cancelled");
  const waitingApproval = workOrders.filter((w) => w.status === "waiting_approval");

  // Penapisan senarai kerja
  const filteredWorkOrders = workOrders.filter((wo) => {
    if (filterStatus === "all") return true;
    return wo.status === filterStatus;
  });

  // Data Aliran Beban 7 Hari
  const traffic7Days = [
    { day: "Isn", count: 8, height: "45%" },
    { day: "Sel", count: 12, height: "65%" },
    { day: "Rab", count: 9, height: "50%" },
    { day: "Kha", count: 14, height: "75%" },
    { day: "Jum", count: 19, height: "100%", isPeak: true },
    { day: "Sab", count: 16, height: "85%" },
    { day: "Ahd", count: 6, height: "35%" },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Spike & Butang Tindakan Pantas */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <div>
          <nav className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
            <span className="text-slate-300">FFmotor HQ</span>
            <span>/</span>
            <span className="text-brand-400 font-bold">Pusat Kawalan Operasi Bengkel</span>
          </nav>
          <div className="flex items-center gap-2.5 mt-1">
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Pusat Kawalan Operasi Bengkel
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {activeJobs.length} Motor Aktif
            </span>
          </div>
        </div>

        {/* Butang Tindakan Pantas */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("work-orders")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition"
          >
            <Wrench className="w-4 h-4" />
            <span>⚡ Buka Work Order</span>
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition"
          >
            <Package className="w-4 h-4 text-purple-400" />
            <span>Stok Rak POS</span>
          </button>
          <button
            onClick={() => setActiveTab("authenticity")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Semak Kod Siri</span>
          </button>
          <button
            onClick={() => setActiveTab("motor-sales")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition"
          >
            <Bike className="w-4 h-4 text-amber-400" />
            <span>Showroom Motor</span>
          </button>
        </div>
      </div>

      {/* 2. Giliran Kerja Tergantung Bengkel (Bottleneck Watcher ala JhnKerja) */}
      <WorkshopBottlenecks
        workOrders={workOrders}
        products={products}
        onPeekWorkOrder={(wo) => setPeekWorkOrder(wo)}
        onGoToInventory={() => setActiveTab("inventory")}
        onGoToWorkOrders={() => setActiveTab("work-orders")}
      />

      {/* 3. Bar Metrik Nadi Aliran Tunai & Inventori (Pastel Cards) */}
      <WorkshopNadiBar workOrders={workOrders} products={products} />

      {/* 4. Dua Carta Spike: Aliran Trafik 7 Hari & Pecahan Sumber Pendapatan */}
      <div className="grid gap-4 lg:grid-cols-12 items-stretch">
        {/* Carta 1: Aliran Trafik Motor Masuk (7 Kolum) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm lg:col-span-7 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Trafik Aliran Motor Bengkel (7 Hari)</h3>
              <p className="text-xs text-slate-400">Purata kemasukan kenderaan harian & waktu puncak</p>
            </div>
            <span className="rounded-full bg-brand-500/10 border border-brand-500/20 px-2.5 py-1 text-[11px] font-mono font-bold text-brand-400">
              Waktu Puncak: 2:00 PM – 5:30 PM
            </span>
          </div>

          {/* Bar Chart Visual */}
          <div className="h-44 w-full flex items-end justify-between gap-3 px-2 pt-4">
            {traffic7Days.map((t) => (
              <div key={t.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[11px] font-mono font-bold text-slate-400 group-hover:text-white transition">
                  {t.count}
                </span>
                <div className="w-full bg-slate-800/80 rounded-t-lg overflow-hidden flex items-end h-32">
                  <div
                    style={{ height: t.height }}
                    className={`w-full transition-all duration-500 rounded-t-lg ${
                      t.isPeak
                        ? "bg-gradient-to-t from-brand-600 to-brand-400 shadow-md shadow-brand-500/30"
                        : "bg-slate-700 hover:bg-slate-600"
                    }`}
                  />
                </div>
                <span className={`text-xs font-semibold ${t.isPeak ? "text-brand-400 font-bold" : "text-slate-400"}`}>
                  {t.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Carta 2: Nisbah Margin & Pecahan Hasil (5 Kolum) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm lg:col-span-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Pecahan Margin & Sumber Hasil</h3>
              <p className="text-xs text-slate-400">Agihan Upah Buruh vs Jualan Alat Ganti</p>
            </div>
            <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-mono font-bold text-slate-300">
              Bulan Ini
            </span>
          </div>

          <div className="space-y-4 my-auto">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  Upah Buruh Servis (*Labor*)
                </span>
                <span className="font-mono text-blue-400 font-bold">52% (Untung Bersih)</span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "52%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-purple-400" />
                  Alat Ganti Tulen & Aksesori
                </span>
                <span className="font-mono text-purple-400 font-bold">38% (~30% Margin)</span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: "38%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  Margin Jualan Motor (Showroom)
                </span>
                <span className="font-mono text-amber-400 font-bold">10%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "10%" }} />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 border-t border-slate-800 pt-2">
            💡 <b>Fakta Operasi:</b> Upah buruh mekanik menyumbang aliran tunai bersih tertinggi tanpa kos barang modal.
          </p>
        </div>
      </div>

      {/* 5. Master Operasi & Status Kad Kerja (High-Density Operations Table dengan Butang Intip) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight">
              Master Senarai Operasi Kad Kerja Bengkel
            </h3>
            <p className="text-xs text-slate-400">Tekan "Intip" pada mana-mana baris untuk buka laci kawalan tindakan</p>
          </div>

          {/* Penapis Status Kad Kerja */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilterStatus("all")}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                filterStatus === "all"
                  ? "bg-brand-500 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Semua ({workOrders.length})
            </button>
            <button
              onClick={() => setFilterStatus("waiting_approval")}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                filterStatus === "waiting_approval"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "text-slate-400 hover:text-amber-400"
              }`}
            >
              Tunggu Video ({waitingApproval.length})
            </button>
            <button
              onClick={() => setFilterStatus("in_progress")}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                filterStatus === "in_progress"
                  ? "bg-blue-500 text-white shadow-xs"
                  : "text-slate-400 hover:text-blue-400"
              }`}
            >
              Dibaiki
            </button>
            <button
              onClick={() => setFilterStatus("ready")}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                filterStatus === "ready"
                  ? "bg-emerald-500 text-white shadow-xs"
                  : "text-slate-400 hover:text-emerald-400"
              }`}
            >
              Siap
            </button>
          </div>
        </div>

        {/* Senarai Kad Kerja Jadual */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">No Kad / No Plat</th>
                <th className="py-3 px-3">Pemilik & Telefon</th>
                <th className="py-3 px-3">Aduan / Tugasan</th>
                <th className="py-3 px-3">Status Bengkel</th>
                <th className="py-3 px-3">Jumlah (RM)</th>
                <th className="py-3 px-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredWorkOrders.map((wo) => (
                <tr
                  key={wo.id}
                  className="hover:bg-slate-800/40 transition group cursor-pointer"
                  onClick={() => setPeekWorkOrder(wo)}
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-black text-brand-400 text-xs">
                        {wo.plateNumber?.slice(0, 3) || "WO"}
                      </div>
                      <div>
                        <span className="font-mono font-black text-white text-xs block">
                          {wo.plateNumber || "TIADA PLAT"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{wo.woNumber}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-200 block">{wo.ownerName || "Walk-in"}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{wo.ownerPhone || "-"}</span>
                  </td>

                  <td className="py-3 px-3 max-w-xs">
                    <p className="text-slate-300 line-clamp-1 font-medium">{wo.customerComplaint}</p>
                    {wo.videoProofKey && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 mt-0.5">
                        <Video className="w-3 h-3" />
                        <span>Video Dilampirkan</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        wo.status === "waiting_approval"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse"
                          : wo.status === "in_progress"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          : wo.status === "ready"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : wo.status === "completed"
                          ? "bg-slate-800 text-slate-300 border-slate-700"
                          : "bg-slate-900 text-slate-400 border-slate-800"
                      }`}
                    >
                      {wo.status === "waiting_approval" && "Menunggu Kelulusan"}
                      {wo.status === "in_progress" && "Sedang Dibaiki"}
                      {wo.status === "ready" && "Siap Ambil"}
                      {wo.status === "completed" && "Selesai"}
                      {wo.status === "pending" && "Menunggu Giliran"}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-white block">
                      RM {(wo.grandTotal || 0).toFixed(2)}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        wo.paymentStatus === "paid" ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {wo.paymentStatus === "paid" ? "Lunas" : "Belum Bayar"}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setPeekWorkOrder(wo)}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-brand-500 hover:text-white border border-slate-700/80 px-2.5 py-1 text-xs font-bold text-slate-300 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Intip →</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Laci Sisi Bertindak (WorkDashboardDrawer ala jhn-laci) */}
      <WorkDashboardDrawer
        workOrder={peekWorkOrder}
        onClose={() => setPeekWorkOrder(null)}
        onOpenTrack={onOpenTrack}
        onOpenPassport={onOpenPassport}
        onOpenReceiptModal={(wo) => setReceiptModalWo(wo)}
      />

      {/* 7. Modal Resit Haba 80mm */}
      {receiptModalWo && (
        <ThermalReceiptModal
          isOpen={!!receiptModalWo}
          onClose={() => setReceiptModalWo(null)}
          workOrder={receiptModalWo}
          type={receiptModalWo.status === "completed" ? "receipt" : "jobcard"}
        />
      )}
    </div>
  );
};
