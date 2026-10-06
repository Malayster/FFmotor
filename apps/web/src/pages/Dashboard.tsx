import React, { useState } from "react";
import {
  ShieldCheck,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Users,
  Clock,
  Send,
  Truck,
  Flame,
  ChevronRight,
  Sparkles,
  Check,
  X,
  Activity,
  Calendar,
  Wrench,
  Bike,
  Eye,
  Phone,
  ExternalLink,
  Package,
  MessageCircle,
  Zap,
  Gauge,
  ArrowUpRight
} from "lucide-react";
import { WorkOrder, Product } from "../types";
import { WorkshopAnalyticsCharts } from "../components/WorkshopAnalyticsCharts";
import { BossStaffSupervision } from "../components/BossStaffSupervision";
import { SpikeBrandRibbon } from "../components/spike/SpikeBrandRibbon";
import { SpikeRadialGauge } from "../components/spike/SpikeRadialGauge";

interface DashboardProps {
  workOrders: WorkOrder[];
  products: Product[];
  setActiveTab: (tab: string) => void;
  onOpenTrack?: (token: string) => void;
  onOpenPassport?: (plate: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  workOrders,
  products,
  setActiveTab,
  onOpenTrack,
  onOpenPassport,
}) => {
  const [activeBrand, setActiveBrand] = useState("YAMAHA RACING");
  // Peti Kelulusan Pengecualian Pengarah (Exception In-Tray)
  const [exceptionItems, setExceptionItems] = useState([
    {
      id: "exc_disc_1",
      type: "discount",
      title: "Permohonan Diskaun 13.1% (>10% Had Kuasa SA)",
      staff: "Siti Sarah (SA)",
      reference: "Sebut Harga #QT-2026-0045 • Yamaha NVX 155 (VDF 8899)",
      detail: "Pelanggan setia mohon diskaun RM25.00 daripada jumlah bil RM190.00 untuk tukar Drive Belt OEM.",
      amount: "RM 25.00",
      status: "pending",
    },
    {
      id: "exc_po_1",
      type: "po_payment",
      title: "Kelulusan Bayaran Pembekal OEM (>RM1,500)",
      staff: "Sistem Autopilot (Auto-Draft PO)",
      reference: "PO-2026-0089 • Hong Leong Yamaha Motor Sdn Bhd",
      detail: "Pesanan restock automatik 50 botol Yamalube 4T & 20 set Roller CVT untuk mengelak putus stok.",
      amount: "RM 2,150.00",
      status: "pending",
    },
  ]);

  const [testCronSent, setTestCronSent] = useState(false);

  const handleApproveException = (id: string) => {
    setExceptionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "approved" } : item))
    );
  };

  const handleRejectException = (id: string) => {
    setExceptionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "rejected" } : item))
    );
  };

  const pendingExceptions = exceptionItems.filter((i) => i.status === "pending");

  // Pengiraan Metrik Kewangan Eksekutif Hari Ini
  const totalInflow = 4850.0;
  const partsCost = 1420.0;
  const partsRevenue = 2190.0;
  const partsGrossMargin = partsRevenue - partsCost; // RM 770 (35.1%)
  const laborRevenue = 2660.0; // Margin buruh 100% (kecuali komisen 15%)
  const mechanicCommissionCost = laborRevenue * 0.15; // RM 399.00
  const netEstimatedProfit = laborRevenue - mechanicCommissionCost + partsGrossMargin; // RM 3,031.00

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header Eksekutif Pemilik (Autopilot Cockpit) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-red-500 font-black tracking-wider uppercase font-mono">
            <ShieldCheck className="w-4 h-4 text-red-500" />
            <span>KOKPIT EKSEKUTIF PEMILIK (/sa)</span>
            <span className="text-zinc-600">•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sistem Beroperasi Tanpa Pengawasan Fizikal
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight mt-1 flex items-center gap-2">
            Nadi Operasi & Prestasi Cawangan 3S
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Data langsung daripada Kaunter Pendaftaran, 4 Lif Servis, Juruwang POS, dan Hub Logistik E-Commerce.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab("pos")}
            className="spike-btn-white text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-red-600" />
            <span>+ Buka POS</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ecommerce")}
            className="spike-btn-red text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <Truck className="w-3.5 h-3.5 " />
            <span>Urus Logistik</span>
          </button>
          <span className="bg-[#111114] border border-zinc-200 px-3 py-2 rounded-xl text-xs font-mono text-zinc-300 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-red-500" />
            <span>22 Sep 2026</span>
          </span>
        </div>
      </div>

      {/* Reben Rakan Kongsi Jenama Lumba Rasmi */}
      <SpikeBrandRibbon activeBrand={activeBrand} onSelectBrand={setActiveBrand} />

      {/* Tolok Speedometer Nadi Interaktif (SLA, Sasaran & Margin) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SpikeRadialGauge
          label="SLA PURATA MASA LIF PIT"
          value={84}
          displayValue="38 min"
          target="45 min"
          subLabel="4/4 Lif Beroperasi • -7 min lebih pantas"
          variant="red"
        />
        <SpikeRadialGauge
          label="SASARAN JUALAN HARIAN"
          value={79}
          displayValue="RM 1,980"
          target="RM 2,500"
          subLabel="Baki RM 520 untuk capai sasaran syif"
          variant="white"
        />
        <SpikeRadialGauge
          label="MARGIN UNTUNG BERSIH OPERASI"
          value={63}
          displayValue="62.5%"
          target="55.0% Min"
          subLabel="Buruh (100% margin) + Parts (35% margin)"
          variant="emerald"
        />
      </div>

      {/* 2. Peti Tindakan Pengecualian Sahaja (Exception In-Tray) - HANYA INI YANG PERLU TINDAKAN TAUKE */}
      <div className="bg-white border-2 border-red-500 rounded-3xl p-5 shadow-sm space-y-4 text-black">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 font-bold">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black uppercase tracking-wider">
                  Peti Pengecualian Pengarah (*Exception In-Tray*)
                </h2>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full font-black bg-red-600 text-white shadow-sm">
                  {pendingExceptions.length} Perlu Kelulusan
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Sistem beroperasi automatik. Anda hanya diganggu jika had diskaun atau bayaran pembekal melanggar had kuasa.
              </p>
            </div>
          </div>
        </div>

        {pendingExceptions.length === 0 ? (
          <div className="py-5 flex flex-col items-center justify-center text-center space-y-2 text-xs text-emerald-400 bg-emerald-500/5 rounded-2xl border border-emerald-200 p-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            <span className="font-bold text-sm">Semua Operasi Mematuhi SOP Syarikat</span>
            <p className="text-zinc-400 max-w-md text-[11px]">
              Tiada kelulusan tertangguh. Peti tunai tepat, pesanan pembekal berjalan automatik, dan servis lancar.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingExceptions.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-zinc-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30">
                      {item.type === "discount" ? "KUASA DISKAUN" : "BAYARAN PEMBEKAL"}
                    </span>
                    <span className="font-bold text-sm">{item.title}</span>
                  </div>
                  <p className="text-[11px] text-red-400 font-mono">{item.reference}</p>
                  <p className="text-zinc-300">{item.detail}</p>
                  <p className="text-[10px] text-zinc-500">Dimohon oleh: {item.staff}</p>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  <span className="font-mono text-base font-black mr-2">{item.amount}</span>
                  <button
                    type="button"
                    onClick={() => handleApproveException(item.id)}
                    className="spike-btn-red text-xs py-2 px-3.5 flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Luluskan
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRejectException(item.id)}
                    className="spike-btn-dark text-xs py-2 px-3 flex items-center gap-1 text-zinc-400 hover:text-red-600"
                  >
                    <X className="w-3.5 h-3.5" /> Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Nadi Aliran Tunai & Margin Untung Bersih (Spike Motorsport Velocity Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Kad 1: Kutipan Kasar Hari Ini */}
        <div className="spike-card p-5 relative overflow-hidden flex flex-col justify-between group hover:border-red-600 transition-all duration-300">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="font-bold uppercase tracking-wider">Kutipan Kasar Hari Ini</span>
              <div className="w-8 h-8 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="font-mono text-2xl sm:text-3xl font-black ">
                RM {totalInflow.toLocaleString("en-MY", { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                <TrendingUp className="w-3 h-3" />
                <span>+18.4% vs Minggu Lalu</span>
              </div>
              {/* Mini Sparkline SVG */}
              <svg className="w-20 h-6 overflow-visible" viewBox="0 0 100 28">
                <path
                  d="M0,24 Q20,18 40,20 T70,8 T100,4"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M0,24 Q20,18 40,20 T70,8 T100,4 L100,28 L0,28 Z"
                  fill="rgba(239, 68, 68, 0.15)"
                />
              </svg>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveTab("finance")}
              className="text-[11px] text-zinc-400 hover:text-red-600 font-bold flex items-center gap-1 transition"
            >
              <span>Buka Lejar Kewangan</span>
              <ArrowUpRight className="w-3 h-3 text-red-500" />
            </button>
            <span className="text-[10px] font-mono text-zinc-500">34 Transaksi</span>
          </div>
        </div>

        {/* Kad 2: Kapasiti Lif Pit Servis */}
        <div className="spike-card p-5 relative overflow-hidden flex flex-col justify-between group hover:border-red-600 transition-all duration-300">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="font-bold uppercase tracking-wider">Kapasiti Lif Bay Servis</span>
              <div className="w-8 h-8 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500">
                <Wrench className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="font-mono text-2xl sm:text-3xl font-black ">
                14 Unit
              </div>
              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-red-600 text-white">
                4/4 AKTIF
              </span>
            </div>

            {/* Bay status pills */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              <div className="bg-zinc-50 border border-red-500/40 p-1.5 rounded-lg text-center">
                <span className="text-[9px] text-zinc-400 block font-mono">LIF 1</span>
                <span className="w-2 h-2 rounded-full bg-red-500 mx-auto mt-0.5 animate-pulse" />
              </div>
              <div className="bg-zinc-50 border border-red-500/40 p-1.5 rounded-lg text-center">
                <span className="text-[9px] text-zinc-400 block font-mono">LIF 2</span>
                <span className="w-2 h-2 rounded-full bg-red-500 mx-auto mt-0.5 animate-pulse" />
              </div>
              <div className="bg-zinc-50 border border-red-500/40 p-1.5 rounded-lg text-center">
                <span className="text-[9px] text-zinc-400 block font-mono">LIF 3</span>
                <span className="w-2 h-2 rounded-full bg-red-500 mx-auto mt-0.5 animate-pulse" />
              </div>
              <div className="bg-zinc-50 border border-emerald-200 p-1.5 rounded-lg text-center">
                <span className="text-[9px] text-zinc-400 block font-mono">LIF 4</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 mx-auto mt-0.5" />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveTab("pitmaster")}
              className="text-[11px] text-zinc-400 hover:text-red-600 font-bold flex items-center gap-1 transition"
            >
              <span>Pantau Papan Pit Master</span>
              <ArrowUpRight className="w-3 h-3 text-red-500" />
            </button>
            <span className="text-[10px] font-mono text-zinc-500">Purata 38 min</span>
          </div>
        </div>

        {/* Kad 3: Anggaran Untung Bersih */}
        <div className="spike-card p-5 relative overflow-hidden flex flex-col justify-between group hover:border-red-600 transition-all duration-300">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="font-bold uppercase tracking-wider">Anggaran Untung Bersih</span>
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center ">
                <Flame className="w-4 h-4 text-red-500" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="font-mono text-2xl sm:text-3xl font-black ">
                RM {netEstimatedProfit.toLocaleString("en-MY", { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-emerald-50 text-emerald-400 border border-emerald-200">
                62.5% MARGIN
              </span>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>Upah Buruh: <b className="">RM 2,261</b></span>
                <span>Parts: <b className="">RM 770</b></span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden flex">
                <div className="bg-red-600 h-full" style={{ width: "74%" }} />
                <div className="bg-white h-full" style={{ width: "26%" }} />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveTab("finance")}
              className="text-[11px] text-zinc-400 hover:text-red-600 font-bold flex items-center gap-1 transition"
            >
              <span>Laporan Z-Report Kasir</span>
              <ArrowUpRight className="w-3 h-3 text-red-500" />
            </button>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">0 Selisih</span>
          </div>
        </div>

        {/* Kad 4: E-Commerce & Logistik Kurier */}
        <div className="spike-card p-5 relative overflow-hidden flex flex-col justify-between group hover:border-red-600 transition-all duration-300">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="font-bold uppercase tracking-wider">E-Commerce & Kurier</span>
              <div className="w-8 h-8 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500">
                <Truck className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="font-mono text-2xl sm:text-3xl font-black ">
                5 Pakej
              </div>
              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-red-600 text-white">
                3 PERLU POS
              </span>
            </div>

            {/* Courier tags */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30">
                J&T (3)
              </span>
              <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                PosLaju (1)
              </span>
              <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                Lalamove (1)
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveTab("ecommerce")}
              className="text-[11px] text-zinc-400 hover:text-red-600 font-bold flex items-center gap-1 transition"
            >
              <span>Urus Cetakan AWB</span>
              <ArrowUpRight className="w-3 h-3 text-red-500" />
            </button>
            <span className="text-[10px] font-mono text-zinc-500">Auto WhatsApp</span>
          </div>
        </div>
      </div>

      {/* 4. Status Kerja Langsung Bengkel (Sumber Kaunter Kerani ➔ Lantai Mekanik Lif) */}
      <div className="spike-card p-6 shadow-none space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/30">
              <Wrench className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black ">
                  Lantai Kerja Langsung Bengkel (Kaunter ➔ Lif Pit)
                </h2>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full font-black bg-emerald-50 text-emerald-400 border border-emerald-200 animate-pulse">
                  ● MASA NYATA
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Pemerhatian langsung unit motosikal di bawah seliaan Service Advisor dan mekanik bertugas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveTab("workorders")}
              className="spike-btn-dark py-1.5 px-3 text-xs flex items-center gap-1"
            >
              <Bike className="w-3.5 h-3.5 text-red-500" />
              <span>Semua Kad Kerja ({workOrders.length || 14})</span>
            </button>
            <div className="bg-white px-3 py-1.5 rounded-xl border border-red-500/30 text-center">
              <span className="text-[10px] text-red-400 block font-bold">Atas Lif</span>
              <span className="text-sm font-black ">3 Unit</span>
            </div>
            <div className="bg-white px-3 py-1.5 rounded-xl border border-emerald-200 text-center">
              <span className="text-[10px] text-emerald-400 block font-bold">Siap</span>
              <span className="text-sm font-black text-emerald-400">8 Unit</span>
            </div>
          </div>
        </div>

        {/* Kad Kerja Semasa Di Lantai Bengkel dengan Foto & Butang Pantas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {[
            {
              id: "WO-0041",
              plate: "VDF 8899",
              model: "Yamaha NVX 155 V2",
              owner: "Razif Ramli",
              phone: "60174821902",
              clerk: "Siti Sarah (SA)",
              pit: "Lif Bay 1 • Sifu Halim",
              service: "Servis 12-Titik + Yamalube Fully Synth + Roller CVT",
              status: "in_progress",
              statusLabel: "LIF 1: SEDANG DIBAIKI",
              statusBadge: "bg-red-600 text-white font-black",
              total: "RM 185.00",
              progress: 75,
              token: "tok_vdf8899",
              image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&q=80"
            },
            {
              id: "WO-0042",
              plate: "WYY 1234",
              model: "Yamaha Y15ZR V2 GP",
              owner: "Faizal Tahir",
              phone: "60193321908",
              clerk: "Aiman (Kasir)",
              pit: "Lif Bay 2 • Mekanik Din",
              service: "Tukar tayar belakang Maxxis Diamond 120/70 & palam pencucuh",
              status: "ready",
              statusLabel: "✓ SIAP KUTIPAN",
              statusBadge: "bg-zinc-950 text-white font-black",
              total: "RM 165.00",
              progress: 100,
              token: "tok_wyy1234",
              image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&q=80"
            },
            {
              id: "WO-0043",
              plate: "KEE 4488",
              model: "Honda RS-X 150 Repsol",
              owner: "Anas Ridzuan",
              phone: "60129988112",
              clerk: "Siti Sarah (SA)",
              pit: "Lif Bay 3 • Mekanik Zul",
              service: "Rantai kendur + tukar sproket set DID 428HD",
              status: "in_progress",
              statusLabel: "LIF 3: SERVIS RANTAI",
              statusBadge: "bg-red-600 text-white font-black",
              total: "RM 110.00",
              progress: 45,
              token: "tok_kee4488",
              image: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&q=80"
            },
            {
              id: "WO-0044",
              plate: "PLA 9012",
              model: "Honda Vario 160 ABS",
              owner: "Hafiz Suip",
              phone: "60134412980",
              clerk: "Siti Sarah (SA)",
              pit: "Lif Bay 1 • Sifu Halim",
              service: "Minyak hitam Yamalube + Pemeriksaan brek geser",
              status: "inspecting",
              statusLabel: "PEMERIKSAAN QC FOREMAN",
              statusBadge: "bg-zinc-950 text-white font-black",
              total: "RM 85.00",
              progress: 30,
              token: "tok_pla9012",
              image: "https://images.unsplash.com/photo-1571607388263-1044f9ea01dd?w=400&q=80"
            }
          ].map((wo) => (
            <div
              key={wo.id}
              className="spike-card overflow-hidden group hover:border-red-600 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Thumbnail Image Header */}
              <div className="relative h-28 w-full bg-white overflow-hidden">
                <img
                  src={wo.image}
                  alt={wo.model}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
                />
                
                {/* Plate Badge */}
                <div className="absolute top-2 left-2">
                  <span className="font-mono text-xs font-black bg-black/90 px-2 py-0.5 rounded border border-white/20 tracking-wider shadow-md">
                    {wo.plate}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded shadow-md ${wo.statusBadge}`}>
                    {wo.statusLabel}
                  </span>
                </div>

                {/* Total Price Tag */}
                <div className="absolute bottom-1 right-2">
                  <span className="font-mono text-xs font-black text-white bg-red-600 px-2 py-0.5 rounded shadow">
                    {wo.total}
                  </span>
                </div>
              </div>

              {/* Body Details */}
              <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black truncate">{wo.model}</h4>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-0.5">
                    <span>{wo.owner}</span>
                    <a
                      href={`https://wa.me/${wo.phone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:text-emerald-700 flex items-center gap-1 font-mono text-[10px]"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                <div className="text-[10px] space-y-1 bg-white p-2 rounded-xl border border-zinc-200">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="truncate">Tugasan: <b className="text-zinc-300">{wo.clerk}</b></span>
                  </div>
                  <p className="text-red-400 font-bold truncate">{wo.pit}</p>
                  <p className="text-zinc-400 line-clamp-1 text-[9px]">{wo.service}</p>
                </div>

                {/* Progress Bar Siap */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400">
                    <span>Kemajuan Kerja</span>
                    <span className="font-bold ">{wo.progress}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        wo.progress === 100 ? "bg-emerald-400" : "bg-red-600 shadow-sm shadow-red-600/50"
                      }`}
                      style={{ width: `${wo.progress}%` }}
                    />
                  </div>
                </div>

                {/* Butang Pantas Bos */}
                <div className="pt-2 border-t border-zinc-200 flex items-center justify-between text-xs gap-1">
                  {onOpenTrack && (
                    <button
                      type="button"
                      onClick={() => onOpenTrack(wo.token)}
                      className="spike-btn-dark py-1 px-2 text-[10px] flex items-center gap-1 flex-1 justify-center text-zinc-300 hover:text-red-600"
                    >
                      <Eye className="w-3 h-3 text-red-500" />
                      <span>Tracker</span>
                    </button>
                  )}
                  {onOpenPassport && (
                    <button
                      type="button"
                      onClick={() => onOpenPassport(wo.plate)}
                      className="spike-btn-dark py-1 px-2 text-[10px] flex items-center gap-1 flex-1 justify-center text-zinc-300 hover:text-red-600 font-mono"
                    >
                      <ExternalLink className="w-3 h-3 " />
                      <span>Passport</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Papan Semakan Tugasan Staf Hari Ini (Siap vs Belum) */}
      <BossStaffSupervision />

      {/* 6. Analitis Visual Dinamik (Chart.js Interactive Analytics Cockpit) */}
      <WorkshopAnalyticsCharts />

      {/* 7. Radar Amaran Autopilot & Delegasi Pasukan Staf */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Kolum Kiri (6 Kolum): Radar Status Autopilot */}
        <div className="lg:col-span-6 spike-card p-6 shadow-none space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider">Radar Integriti Operasi (*Watchdog*)</h3>
                <p className="text-xs text-zinc-400">Pemantauan automatik integriti tunai, pesanan inventori & SLA lif</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Semua Hijau
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-xs font-bold ">Auto-PO Minyak Hitam</span>
                </div>
                <p className="text-[11px] text-zinc-400">Stok terkawal, pesanan auto diaktifkan pada baki 5 botol.</p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-xs font-bold ">Peti Wang Z-Report</span>
                </div>
                <p className="text-[11px] text-zinc-400">Imbangan tepat RM 2,450.00 tanpa sebarang selisih syif.</p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-xs font-bold ">SLA Lif Pit Servis</span>
                </div>
                <p className="text-[11px] text-zinc-400">3 motosikal sedang disiapkan, 0 melepasi sasaran 60 minit.</p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-xs font-bold ">Had Kuasa Diskaun</span>
                </div>
                <p className="text-[11px] text-zinc-400">Semua diskaun &gt;10% terkunci dalam Peti Pengecualian Bos.</p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2.5 text-xs text-emerald-700">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>SOP Automasi Aktif: Operasi cawangan berjalan lancar tanpa kehadiran fizikal pemilik 24/7.</span>
          </div>
        </div>

        {/* Kolum Kanan (6 Kolum): Delegasi Pasukan & KPI Staf Bertugas */}
        <div className="lg:col-span-6 spike-card p-6 shadow-none space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">Delegasi Pasukan & Hasil Staf</h3>
              <p className="text-xs text-zinc-400">Prestasi staf mengikut stesen kerja masing-masing</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("staff")}
              className="text-xs text-red-500 hover:text-red-400 font-bold"
            >
              Semak Lejar Gaji
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* Staf 1: Service Advisor */}
            <div className="bg-white p-3 rounded-2xl border border-zinc-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold ">Siti Sarah</span>
                  <span className="text-[10px] bg-red-600/20 text-red-400 px-2 py-0.5 rounded font-mono font-bold">
                    Service Advisor
                  </span>
                </div>
                <p className="text-zinc-400 text-[11px] mt-0.5">Kaunter Intake: 9 motor didaftarkan & diagnosis</p>
              </div>
              <span className="text-emerald-400 font-bold font-mono">100% SOP</span>
            </div>

            {/* Staf 2: Ketua Foreman */}
            <div className="bg-white p-3 rounded-2xl border border-zinc-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold ">Sifu Halim</span>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono font-bold">
                    Ketua Foreman
                  </span>
                </div>
                <p className="text-zinc-400 text-[11px] mt-0.5">Lif 1 & 2: 5 motor siap • Upah RM 210</p>
              </div>
              <span className="text-red-500 font-bold font-mono">Komisen: RM31.50</span>
            </div>

            {/* Staf 3: Juruwang */}
            <div className="bg-white p-3 rounded-2xl border border-zinc-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold ">Aiman</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                    Kasir Kaunter
                  </span>
                </div>
                <p className="text-zinc-400 text-[11px] mt-0.5">POS & Kutipan: RM 2,450.00 disahkan masuk</p>
              </div>
              <span className="text-emerald-400 font-bold font-mono">0 Selisih</span>
            </div>

            {/* Staf 4: Ejen Sales */}
            <div className="bg-white p-3 rounded-2xl border border-zinc-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold ">Hafiz</span>
                  <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono font-bold">
                    Ejen Jualan
                  </span>
                </div>
                <p className="text-zinc-400 text-[11px] mt-0.5">Showroom: 2 pinjaman dihantar ke AEON Credit</p>
              </div>
              <span className=" font-bold font-mono">2 Diluluskan</span>
            </div>
          </div>
        </div>
      </div>

      {/* 8. Automasi Laporan Malam Jam 9:00 PM (Cloudflare Cron ke WhatsApp Tauke) */}
      <div className="spike-card p-6 shadow-none space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-3">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-red-600 text-white shadow-md shadow-red-600/30">
              <Clock className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">
                Automasi Laporan Eksekutif Jam 9:00 Malam (*Cloudflare Cron Scheduled*)
              </h3>
              <p className="text-xs text-zinc-400">
                Pekerja Cloudflare merumuskan baki akaun dan menghantar notis ringkas ke telefon anda secara berjadual.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setTestCronSent(true)}
            className="spike-btn-red text-xs py-2.5 px-4 flex items-center gap-2 transition self-start sm:self-auto"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Uji Hantar Laporan WhatsApp (Pratonton)</span>
          </button>
        </div>

        {testCronSent && (
          <div className="bg-white p-4 rounded-2xl border border-red-600/40 font-mono text-xs space-y-2 text-zinc-300">
            <div className="flex items-center gap-2 text-red-500 font-bold">
              <span>📱 FORMAT LAPORAN WHATSAPP YANG DITERIMA TAUKE FARHAN (9:00 PM):</span>
            </div>
            <p className="whitespace-pre-line leading-relaxed text-zinc-200">
              {`Salam Tauke Farhan, ringkasan penutupan operasi FFmotor Rawang (22 Sep 2026):
• Jumlah Masuk Kasar: RM 4,850.00
• Anggaran Untung Bersih: RM 3,031.00 (Margin 62.5%)
• Peti Tunai Kaunter: RM 2,450.00 (Status: TEPAT, SIFAR SELISIH)
• Motosikal Diservis: 14 biji siap, 3 dalam proses
• Komisen Mekanik Dibayar: RM 399.00
• Status Pelanggan: 0 aduan atau tuntutan waranti

Semua stesen telah ditutup dan dikunci oleh Pengurus Cawangan. Selamat malam.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
