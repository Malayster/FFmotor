import React, { useState } from "react";
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  DollarSign,
  ShoppingCart,
  Wrench,
  Bike,
  Sparkles,
  CheckCircle2,
  Clock,
  Package,
  QrCode,
  ArrowRight,
  ExternalLink,
  Flame,
  ShieldAlert,
  Send
} from "lucide-react";
import { WorkOrder, Product } from "../types";
import { motion } from "framer-motion";
import { InteractiveNumber } from "./ui/InteractiveNumber";
import { CopyBadge } from "./ui/CopyBadge";

interface DailyOpsPulseProps {
  workOrders: WorkOrder[];
  products: Product[];
  onOpenIntake: () => void;
  onOpenPos: () => void;
  onOpenMotorSales: () => void;
  onOpenReturns: () => void;
  onOpenClosing: () => void;
}

export const DailyOpsPulse: React.FC<DailyOpsPulseProps> = ({
  workOrders,
  products,
  onOpenIntake,
  onOpenPos,
  onOpenMotorSales,
  onOpenReturns,
  onOpenClosing,
}) => {
  // Pengiraan metrik kelajuan harian bengkel
  const totalBikesToday = workOrders.length || 14;
  const inPitCount = workOrders.filter((w) => w.status === "in_progress").length || 3;
  const readyCount = workOrders.filter((w) => w.status === "ready" || w.status === "completed").length || 8;
  const pendingCount = workOrders.filter((w) => w.status === "pending").length || 2;
  const delayedCount = 1; // 1 motor tersangkut menunggu alat ganti khas

  // Status Kewangan & Sasaran Kutipan Harian
  const dailyTarget = 2500.0;
  const cashInDrawer = 920.0;
  const duitnowQr = 740.0;
  const bankTransfer = 320.0;
  const totalCollectedToday = cashInDrawer + duitnowQr + bankTransfer;
  const targetPercentage = Math.min(100, Math.round((totalCollectedToday / dailyTarget) * 100));

  // Produk bawah paras selamat (Inventory Low Trigger)
  const lowStockItems = [
    { name: "Yamalube 4T 10W-40 Fully Synthetic (1L)", currentStock: 3, threshold: 5, sku: "YAM-FS1040" },
    { name: "Palam Pencucuh NGK CPR8EA-9", currentStock: 2, threshold: 6, sku: "NGK-CPR8" },
    { name: "Bateri Kering Yuasa YTZ5S Maintenance Free", currentStock: 1, threshold: 3, sku: "YUA-YTZ5S" },
    { name: "Minyak Gear Skuter Yamalube (100ml)", currentStock: 4, threshold: 8, sku: "YAM-GEAR-100" },
  ];

  // Pecahan Apa Yang Dijual Hari Ini
  const salesBreakdown = [
    { category: "Upah Buruh Servis", amount: 540.0, icon: Wrench, color: "text-brand-400 bg-brand-500/10", count: "8 kad kerja" },
    { category: "Minyak Enjin & Pelincir", amount: 480.0, icon: Sparkles, color: "text-red-600 bg-red-50", count: "14 botol" },
    { category: "Tayar & Tiub Maxxis/Corsa", amount: 390.0, icon: Activity, color: "text-emerald-400 bg-emerald-50", count: "3 pasang" },
    { category: "Alat Ganti Runcit (Belting/Plug)", amount: 320.0, icon: ShoppingCart, color: "text-zinc-700 bg-zinc-100", count: "9 item" },
    { category: "Deposit Motosikal Baharu", amount: 250.0, icon: Bike, color: "text-zinc-700 bg-zinc-100", count: "1 unit (NVX)" },
  ];

  const handleSendSupplierWhatsApp = () => {
    const text = encodeURIComponent(
      `Salam Pembekal OEM, ini senarai pesanan automatik stok genting FFmotor hari ini:\n` +
      lowStockItems.map((i) => `- ${i.name} (Baki: ${i.currentStock}, Mohon hantar: ${i.threshold * 2} unit)`).join("\n") +
      `\n\nTerima kasih.`
    );
    window.open(`https://wa.me/60192233445?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner Utama Nadi Operasi - FinTech Executive White Card */}
      <div className="bg-white border-2 border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-6 text-zinc-950">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              Nadi Operasi Seharian (Live)
            </span>
            <span className="text-xs text-zinc-700 font-semibold font-sans">
              • {new Date().toLocaleDateString("ms-MY", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
            Pusat Kawalan Operasi & Aliran Perniagaan
          </h1>
          <p className="text-xs text-zinc-700 mt-1 max-w-2xl font-medium">
            Pemantauan langsung kelajuan mekanik di lif, sasaran kutipan jualan, stok genting, dan baki tunai kaunter secara masa nyata.
          </p>
        </div>

        {/* 3 Butang Tindakan Pantas */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenIntake}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition active:scale-95"
          >
            <Wrench className="w-4 h-4" />
            <span>+ Daftar Servis</span>
          </button>

          <button
            type="button"
            onClick={onOpenPos}
            className="bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition active:scale-95"
          >
            <ShoppingCart className="w-4 h-4 text-white" />
            <span>POS Barcode</span>
          </button>

          <button
            type="button"
            onClick={onOpenReturns}
            className="bg-white hover:bg-zinc-100 border-2 border-zinc-300 text-zinc-900 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-zinc-700" />
            <span>Pulangan</span>
          </button>
        </div>
      </div>

      {/* Grid 2 Bahagian: Progress Kelajuan Kerja & Sasaran Kewangan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bahagian 1: Daily Progress Tracker (Kelajuan Kerja & Lif Pit) - 7 Kolum */}
        <div className="lg:col-span-7 bg-white border-2 border-zinc-200 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold border border-red-300">
                <Activity className="w-4 h-4 text-red-700" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-950">Kelajuan Servis & Status Lif Pit</h3>
                <p className="text-[11px] text-zinc-700 font-semibold">Kemajuan 14 buah motosikal yang sedang diservis</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              {readyCount} Motor Siap
            </span>
          </div>

          {/* 4 Blok Metrik Bento Status Motor (FinTech White Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="bg-white border-2 border-zinc-200 p-3.5 rounded-xl transition-all cursor-default"
            >
              <span className="text-[11px] font-bold text-zinc-700 block">1. Masuk Hari Ini</span>
              <span className="text-2xl font-black text-zinc-950 font-mono mt-1 block">
                <InteractiveNumber value={totalBikesToday} />
              </span>
              <span className="text-[10px] text-zinc-600 font-bold mt-0.5 block">Total pendaftaran</span>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="bg-red-50/40 border-2 border-red-200 p-3.5 rounded-xl shadow-xs transition-all cursor-default"
            >
              <span className="text-[11px] font-bold text-zinc-800 block">2. Tengah Di Lif</span>
              <span className="text-2xl font-black text-red-700 font-mono mt-1 block">
                <InteractiveNumber value={inPitCount} />
              </span>
              <span className="text-[10px] text-red-800 font-bold mt-0.5 block">Bay 1, Bay 3, Bay 4</span>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="bg-amber-50/40 border-2 border-amber-200 p-3.5 rounded-xl shadow-xs transition-all cursor-default"
            >
              <span className="text-[11px] font-bold text-zinc-800 block">3. Tersangkut (Delay)</span>
              <span className="text-2xl font-black text-amber-800 font-mono mt-1 block">
                <InteractiveNumber value={delayedCount} />
              </span>
              <span className="text-[10px] text-amber-900 font-bold mt-0.5 block">Tunggu alat ganti</span>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="bg-emerald-50/40 border-2 border-emerald-200 p-3.5 rounded-xl transition-all cursor-default"
            >
              <span className="text-[11px] font-bold text-zinc-800 block">4. Siap & Tuntut</span>
              <span className="text-2xl font-black text-emerald-800 font-mono mt-1 block">
                <InteractiveNumber value={readyCount} />
              </span>
              <span className="text-[10px] text-emerald-800 font-bold mt-0.5 block">Sedia diambil</span>
            </motion.div>
          </div>

          {/* Kad Makluman Penting Mekanik */}
          <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-200 text-xs flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-amber-950">Perhatian Kerani: Motor Tertangguh di Lif Bay 2</span>
                <CopyBadge text="VJE 8821" label="No Plat" />
              </div>
              <p className="text-[11px] text-amber-950 mt-1 font-medium">
                Yamaha NVX 155 tersangkut menunggu penukaran *Water Pump Seal OEM*. Mekanik Halim perlukan kelulusan pelanggan bagi penambahan RM 65.
              </p>
            </div>
          </div>
        </div>

        {/* Bahagian 2: Status Kewangan Semasa & Meter Sasaran - 5 Kolum */}
        <div className="lg:col-span-5 bg-white border-2 border-zinc-200 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4 text-emerald-800" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-950">Kutipan Kewangan Hari Ini</h3>
                <p className="text-[11px] text-zinc-700 font-semibold">Sasaran harian: RM {dailyTarget.toFixed(2)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenClosing}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer transition hover:underline"
            >
              Lejar Z-Report →
            </button>
          </div>

          {/* Meter Bar Kemajuan Sasaran */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-black text-zinc-950 text-base">
                <InteractiveNumber value={totalCollectedToday} prefix="RM " decimals={2} />
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                {targetPercentage}% Tercapai
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-zinc-200 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${targetPercentage}%` }}
              />
            </div>
            <span className="text-[11px] text-zinc-700 font-bold block text-right">
              Baki untuk capai sasaran: <InteractiveNumber value={Math.max(0, dailyTarget - totalCollectedToday)} prefix="RM " decimals={2} />
            </span>
          </div>

          {/* 3 Kotak Pecahan Duit Semasa */}
          <div className="grid grid-cols-3 gap-2.5 text-xs">
            <div className="bg-zinc-50 border-2 border-zinc-200 p-3 rounded-xl text-center">
              <span className="text-[10px] text-zinc-700 block font-bold">💵 Tunai Laci</span>
              <span className="font-mono font-black text-zinc-950 mt-1 block text-sm">
                <InteractiveNumber value={cashInDrawer} prefix="RM " decimals={0} />
              </span>
            </div>
            <div className="bg-zinc-50 border-2 border-zinc-200 p-3 rounded-xl text-center">
              <span className="text-[10px] text-zinc-700 block font-bold">📱 DuitNow QR</span>
              <span className="font-mono font-black text-zinc-950 mt-1 block text-sm">
                <InteractiveNumber value={duitnowQr} prefix="RM " decimals={0} />
              </span>
            </div>
            <div className="bg-zinc-50 border-2 border-zinc-200 p-3 rounded-xl text-center">
              <span className="text-[10px] text-zinc-700 block font-bold">🏦 Bank Masuk</span>
              <span className="font-mono font-black text-zinc-950 mt-1 block text-sm">
                <InteractiveNumber value={bankTransfer} prefix="RM " decimals={0} />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 2 Bahagian Bawah: Apa Yang Dijual Hari Ini vs Inventory Low Trigger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Apa Yang Dijual Hari Ini (Breakdown Jualan) - 7 Kolum */}
        <div className="lg:col-span-7 bg-white border-2 border-zinc-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-black text-zinc-950">Kategori Hasil & Jualan Hari Ini</h3>
            </div>
            <span className="text-xs font-mono font-black text-zinc-800">Total: RM {totalCollectedToday.toFixed(2)}</span>
          </div>

          <div className="space-y-2">
            {salesBreakdown.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs hover:border-zinc-400 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center font-bold text-zinc-800 shadow-2xs">
                      <Icon className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <span className="font-bold text-zinc-950 block">{item.category}</span>
                      <span className="text-[11px] text-zinc-700 font-medium font-sans">{item.count}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-zinc-950 block text-xs">RM {item.amount.toFixed(2)}</span>
                    <span className="text-[10px] text-emerald-800 font-bold">
                      {Math.round((item.amount / totalCollectedToday) * 100)}% dari hasil
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inventory Low Trigger (Amaran Stok Rendah) - 5 Kolum */}
        <div className="lg:col-span-5 bg-white border-2 border-zinc-200 rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <h3 className="text-sm font-black text-zinc-950">Inventory Low Trigger (Stok Genting)</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                {lowStockItems.length} Item Genting
              </span>
            </div>

            <p className="text-xs text-zinc-700 mt-2 font-medium">
              Item berikut di bawah paras selamat dan disarankan dipesan segera:
            </p>

            <div className="space-y-2 mt-3">
              {lowStockItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-zinc-950 block truncate max-w-[210px]">{item.name}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-mono text-zinc-600 font-bold">SKU:</span>
                      <CopyBadge text={item.sku} label="SKU" />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-red-700 block">
                      Baki: {item.currentStock} botol/unit
                    </span>
                    <span className="text-[10px] text-zinc-600 font-bold font-sans">Ambang: &lt; {item.threshold}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              handleSendSupplierWhatsApp();
            }}
            className="w-full mt-4 bg-zinc-950 hover:bg-zinc-900 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm active:scale-95"
          >
            <Send className="w-4 h-4 text-emerald-400" />
            <span>Jana Pesanan Pembekal (Auto-PO ke WhatsApp)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

