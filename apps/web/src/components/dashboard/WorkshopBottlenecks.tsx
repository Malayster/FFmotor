import React from "react";
import { AlertTriangle, ArrowRight, Package, CheckCircle2, Clock } from "lucide-react";
import { WorkOrder, Product } from "../../types";

interface WorkshopBottlenecksProps {
  workOrders: WorkOrder[];
  products: Product[];
  onPeekWorkOrder: (wo: WorkOrder) => void;
  onGoToInventory: () => void;
  onGoToWorkOrders: () => void;
}

export const WorkshopBottlenecks: React.FC<WorkshopBottlenecksProps> = ({
  workOrders,
  products,
  onPeekWorkOrder,
  onGoToInventory,
  onGoToWorkOrders,
}) => {
  // Video proof & waiting_approval DIBUANG sepenuhnya
  const waitingParts = workOrders.filter((w) => w.status === "waiting_parts");
  const readyPickup = workOrders.filter((w) => w.status === "ready" && w.paymentStatus !== "paid");
  const unpaidCompleted = workOrders.filter((w) => w.status === "completed" && w.paymentStatus === "unpaid");
  const lowStock = products.filter((p) => p.stockQty <= p.minAlertQty);

  interface BottleneckItem {
    id: string;
    badge: string;
    badgeColor: string;
    title: string;
    detail: string;
    actionLabel: string;
    action: () => void;
  }

  const items: BottleneckItem[] = [];

  if (waitingParts.length > 0) {
    items.push({
      id: "waiting_parts",
      badge: `${waitingParts.length} Tunggu Alat Ganti`,
      badgeColor: "bg-zinc-100 text-zinc-950 border-zinc-300",
      title: `${waitingParts.length} motor menunggu alat ganti dari Stor`,
      detail: `Contoh: ${waitingParts[0].plateNumber || "Motor"} (${waitingParts[0].model || "Model"}). Kerani 2 perlu keluarkan stok dan serahkan ke Foreman.`,
      actionLabel: "Semak Kad Kerja",
      action: () => onPeekWorkOrder(waitingParts[0]),
    });
  }

  if (lowStock.length > 0) {
    items.push({
      id: "low_stock",
      badge: `${lowStock.length} Stok Kritikal`,
      badgeColor: "bg-red-50 text-red-700 border-red-300",
      title: `${lowStock.length} alat ganti cecah paras amaran bahaya`,
      detail: `Contoh: ${lowStock[0].name} tinggal ${lowStock[0].stockQty} unit di ${lowStock[0].rackLocation}. Sekat kerja servis jika habis.`,
      actionLabel: "Buka Rak Stor",
      action: onGoToInventory,
    });
  }

  if (readyPickup.length > 0) {
    items.push({
      id: "ready",
      badge: `${readyPickup.length} Siap Ambil`,
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-300",
      title: `${readyPickup.length} motor siap menunggu tuntutan & bayaran`,
      detail: `${readyPickup[0].plateNumber || "Motor"} siap sedia. Hantar notis WhatsApp kepada pelanggan untuk kosongkan ruang pit.`,
      actionLabel: "Notis & Semak",
      action: () => onPeekWorkOrder(readyPickup[0]),
    });
  }

  if (unpaidCompleted.length > 0 && items.length < 3) {
    items.push({
      id: "unpaid",
      badge: `${unpaidCompleted.length} Belum Bayar`,
      badgeColor: "bg-red-50 text-red-700 border-red-300",
      title: `${unpaidCompleted.length} servis selesai tapi bayaran belum diterima`,
      detail: `${unpaidCompleted[0].woNumber} — RM ${unpaidCompleted[0].grandTotal.toFixed(2)} belum diselesaikan.`,
      actionLabel: "Semak Bil",
      action: () => onPeekWorkOrder(unpaidCompleted[0]),
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-emerald-300 bg-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 border-2 border-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-zinc-950">Tiada Halangan Operasi</h4>
            <p className="text-xs text-zinc-800 font-bold">Stok rak terkawal dan semua aliran kerja bengkel berjalan lancar.</p>
          </div>
        </div>
        <span className="text-xs font-mono font-black text-emerald-700">Operasi Sihat ✓</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-zinc-200 bg-white p-5 space-y-3">
      <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-200">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse" />
          <h3 className="text-sm font-black text-zinc-950">
            Halangan Operasi Bengkel
          </h3>
          <span className="text-[11px] text-zinc-800 font-bold hidden sm:inline">• Selesaikan untuk melancarkan operasi</span>
        </div>
        <button
          onClick={onGoToWorkOrders}
          className="text-xs font-black text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
        >
          <span>Papan Kerja ({workOrders.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border-2 border-zinc-200 bg-white p-4 flex flex-col justify-between hover:border-zinc-300 transition"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>
              <h4 className="text-xs font-black text-zinc-950 line-clamp-1">{item.title}</h4>
              <p className="text-[11px] text-zinc-800 font-bold mt-1 line-clamp-2 leading-relaxed">{item.detail}</p>
            </div>

            <button
              onClick={item.action}
              className="mt-3.5 inline-flex items-center justify-center gap-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white px-3 py-1.5 text-xs font-black transition cursor-pointer active:scale-95"
            >
              <span>{item.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
