import React from "react";
import { Wrench, Package, ShieldCheck, Bike, AlertTriangle, TrendingUp, Clock, CheckCircle2, ChevronRight, Video, Sparkles, QrCode } from "lucide-react";
import { WorkOrder, Product } from "../types";

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
  const activeJobs = workOrders.filter((w) => w.status !== "completed" && w.status !== "cancelled");
  const waitingApproval = workOrders.filter((w) => w.status === "waiting_approval");
  const lowStock = products.filter((p) => p.stockQty <= p.minAlertQty);
  const todayTotal = workOrders
    .filter((w) => w.paymentStatus === "paid")
    .reduce((acc, curr) => acc + (curr.grandTotal || 0), 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-900/50 via-slate-900 to-slate-900 border border-brand-500/20 p-6 md:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold mb-3 border border-brand-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sistem Bersepadu 3S Bengkel Motosikal</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Selamat Datang ke <span className="text-brand-500">FFmotor OS</span>
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Pengurusan servis bengkel, kawalan stok rak, semakan ketulenan alat ganti ori, dan jualan motosikal — 100% beroperasi di atas Cloudflare Edge.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab("work-orders")}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold shadow-lg shadow-brand-500/30 transition-all"
            >
              <Wrench className="w-4 h-4" />
              <span>Buka Work Order Baru</span>
            </button>
            <button
              onClick={() => setActiveTab("authenticity")}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-bold transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Semak Kod Siri Ori</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Motor Dalam Bengkel</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-3">{activeJobs.length}</p>
          <span className="text-[11px] text-blue-400 font-medium">Sedang dibaiki & menunggu</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Menunggu Video Approval</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400 mt-3">{waitingApproval.length}</p>
          <span className="text-[11px] text-slate-400 font-medium">Transparent Job Card</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Alat Ganti Bawah Paras</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-400 mt-3">{lowStock.length}</p>
          <span className="text-[11px] text-slate-400 font-medium">Perlu restock segera</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Kutipan Servis Selesai</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-3">RM {todayTotal.toFixed(2)}</p>
          <span className="text-[11px] text-emerald-400 font-medium">Bayaran disahkan</span>
        </div>
      </div>

      {/* 3 Genius Innovations Spotlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Innovation 1 */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-indigo-500/30 rounded-2xl p-5 relative group hover:border-indigo-500/60 transition-all">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
            <QrCode className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Ciri Inovatif 1
          </span>
          <h3 className="text-base font-bold text-white mt-2">Digital Motorcycle Passport</h3>
          <p className="text-xs text-slate-400 mt-1">
            Setiap motor ada sijil kesihatan (Health Score) digital. Pelanggan scan QR pada motor untuk tengok rekod servis & sahkan nilai jual semula.
          </p>
          <button
            onClick={() => onOpenPassport("VHG8821")}
            className="mt-4 flex items-center space-x-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300"
          >
            <span>Uji Pasport VHG 8821</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Innovation 2 */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-5 relative group hover:border-amber-500/60 transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
            <Video className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Ciri Inovatif 2
          </span>
          <h3 className="text-base font-bold text-white mt-2">Transparent Video Jobcard</h3>
          <p className="text-xs text-slate-400 mt-1">
            Mekanik rakam 5s video part pecah/haus. Pelanggan tonton di WhatsApp & klik [Luluskan] terus dari telefon. Telus 100%.
          </p>
          <button
            onClick={() => onOpenTrack("tok_akmal_demo")}
            className="mt-4 flex items-center space-x-1.5 text-xs font-bold text-amber-400 hover:text-amber-300"
          >
            <span>Lihat Live Video Approval</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Innovation 3 */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-5 relative group hover:border-emerald-500/60 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Ciri Inovatif 3
          </span>
          <h3 className="text-base font-bold text-white mt-2">Predictive Mileage Engine</h3>
          <p className="text-xs text-slate-400 mt-1">
            Algoritma Cloudflare Cron mengira kelajuan km harian dan tempahkan stok belting/minyak siap-siap sebelum motor rosak.
          </p>
          <button
            onClick={() => setActiveTab("leads")}
            className="mt-4 flex items-center space-x-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
          >
            <span>Semak Ramalan Booking</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Active Work Orders Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Status Motor Semasa di Bengkel</h2>
            <p className="text-xs text-slate-400">Senarai job card yang sedang berjalan hari ini</p>
          </div>
          <button
            onClick={() => setActiveTab("work-orders")}
            className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center space-x-1"
          >
            <span>Lihat Semua Papan Kerja</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-800/60">
          {workOrders.slice(0, 5).map((wo) => (
            <div key={wo.id} className="py-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-black text-brand-400">
                  {wo.plateNumber?.slice(0, 3) || "WO"}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-extrabold text-white">{wo.plateNumber || "Tiada Plat"}</span>
                    <span className="text-xs text-slate-400">• {wo.model || "Motosikal"}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{wo.customerComplaint}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    wo.status === "waiting_approval"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse"
                      : wo.status === "in_progress"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      : wo.status === "completed"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  {wo.status === "waiting_approval" && "Menunggu Video Approval"}
                  {wo.status === "in_progress" && "Sedang Dibaiki"}
                  {wo.status === "pending" && "Menunggu Giliran"}
                  {wo.status === "completed" && "Selesai"}
                </span>

                <button
                  onClick={() => onOpenTrack(wo.approvalToken)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold"
                  title="Buka Live Tracking Pelanggan"
                >
                  <Video className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

