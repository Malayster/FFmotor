import React from "react";
import { DollarSign, Wrench, Package, Clock, TrendingUp, AlertCircle, ArrowUpRight } from "lucide-react";
import { WorkOrder, Product } from "../../types";

interface WorkshopNadiBarProps {
  workOrders: WorkOrder[];
  products: Product[];
}

export const WorkshopNadiBar: React.FC<WorkshopNadiBarProps> = ({ workOrders, products }) => {
  // Kutipan Masuk Sah (Paid)
  const paidOrders = workOrders.filter((w) => w.paymentStatus === "paid");
  const masukSah = paidOrders.reduce((acc, curr) => acc + (curr.grandTotal || 0), 0);
  
  // Pecahan anggaran Tunai vs DuitNow (approx 40% cash, 60% DuitNow)
  const tunaiEst = masukSah * 0.4;
  const qrEst = masukSah * 0.6;

  // Upah Buruh vs Part
  const totalLabor = paidOrders.reduce((acc, curr) => acc + (curr.totalLaborAmount || 0), 0);
  const totalParts = paidOrders.reduce((acc, curr) => acc + (curr.totalPartsAmount || 0), 0);

  // Belum Bayar / Tertunggak
  const unpaidOrders = workOrders.filter((w) => w.paymentStatus === "unpaid" && w.status !== "cancelled");
  const belumBayar = unpaidOrders.reduce((acc, curr) => acc + (curr.grandTotal || 0), 0);

  // Nilai Inventori Rak
  const totalStockValue = products.reduce((acc, curr) => acc + (curr.stockQty * curr.sellingPrice), 0);
  const lowStockCount = products.filter((p) => p.stockQty <= p.minAlertQty).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Kutipan Sah Masuk */}
      <div className="rounded-2xl bg-white/90 border border-zinc-200 p-5 shadow-sm hover:border-emerald-200 transition flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Kutipan Sah (Masuk)</span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-400 border border-emerald-200">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="font-mono text-2xl font-black text-emerald-400 tracking-tight">
            RM {masukSah.toFixed(2)}
          </h3>
          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-200/80 pt-2">
            <span>Tunai: <b className="text-zinc-700">RM {tunaiEst.toFixed(0)}</b></span>
            <span>QR: <b className="text-zinc-700">RM {qrEst.toFixed(0)}</b></span>
          </div>
        </div>
      </div>

      {/* 2. Untung Upah Buruh vs Part */}
      <div className="rounded-2xl bg-white/90 border border-zinc-200 p-5 shadow-sm hover:border-zinc-300 transition flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Upah Buruh Bengkel</span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 border border-zinc-300">
            <Wrench className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="font-mono text-2xl font-black text-zinc-700 tracking-tight">
            RM {totalLabor.toFixed(2)}
          </h3>
          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-200/80 pt-2">
            <span className="text-emerald-400 font-bold">100% Margin Bersih</span>
            <span>Part: RM {totalParts.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* 3. Duit Belum Dituntut / Belum Bayar */}
      <div className="rounded-2xl bg-white/90 border border-zinc-200 p-5 shadow-sm hover:border-red-200 transition flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Baki Belum Dikutip</span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-200">
            <Clock className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="font-mono text-2xl font-black text-red-600 tracking-tight">
            RM {belumBayar.toFixed(2)}
          </h3>
          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-200/80 pt-2">
            <span>{unpaidOrders.length} job aktif</span>
            <span className="text-red-600 font-medium">Tunggu motor siap / bayar</span>
          </div>
        </div>
      </div>

      {/* 4. Nilai Stok di Rak */}
      <div className="rounded-2xl bg-white/90 border border-zinc-200 p-5 shadow-sm hover:border-zinc-300 transition flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Nilai Stok di Rak</span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 border border-zinc-300">
            <Package className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="font-mono text-2xl font-black text-zinc-700 tracking-tight">
            RM {totalStockValue.toFixed(2)}
          </h3>
          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-200/80 pt-2">
            <span>{products.length} SKU berdaftar</span>
            {lowStockCount > 0 ? (
              <span className="text-red-700 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {lowStockCount} kritik
              </span>
            ) : (
              <span className="text-emerald-400 font-medium">Stok selamat</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

