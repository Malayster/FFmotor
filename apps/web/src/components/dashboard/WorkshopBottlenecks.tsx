import React from "react";
import { AlertTriangle, Video, ArrowRight, Package, CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";
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
  const waitingApproval = workOrders.filter((w) => w.status === "waiting_approval");
  const rejectedVideo = workOrders.filter((w) => w.isApprovedByCustomer === false);
  const readyPickup = workOrders.filter((w) => w.status === "ready" || (w.status === "completed" && w.paymentStatus === "unpaid"));
  const lowStock = products.filter((p) => p.stockQty <= p.minAlertQty);

  // Bina senarai halangan kerja
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

  if (waitingApproval.length > 0) {
    items.push({
      id: "approval",
      badge: `${waitingApproval.length} Menunggu Lulus`,
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      title: `${waitingApproval.length} Video kerosakan belum disahkan pelanggan`,
      detail: `Contoh: ${waitingApproval[0].plateNumber || "Motor"} (${waitingApproval[0].model || "Model"}). Tanpa kelulusan, mekanik tak boleh buka part baru.`,
      actionLabel: "Intip Urusan",
      action: () => onPeekWorkOrder(waitingApproval[0]),
    });
  }

  if (rejectedVideo.length > 0) {
    items.push({
      id: "rejected",
      badge: `${rejectedVideo.length} Ditolak`,
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      title: `${rejectedVideo.length} Pelanggan menolak pertukaran alat ganti`,
      detail: `${rejectedVideo[0].plateNumber || "Motor"} menolak penukaran part. Maklumkan mekanik untuk pasang semula barang lama.`,
      actionLabel: "Semak Fail",
      action: () => onPeekWorkOrder(rejectedVideo[0]),
    });
  }

  if (lowStock.length > 0) {
    items.push({
      id: "low_stock",
      badge: `${lowStock.length} Habis di Rak`,
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      title: `${lowStock.length} Alat ganti cecah paras amaran bahaya`,
      detail: `Contoh: ${lowStock[0].name} tinggal ${lowStock[0].stockQty} unit di ${lowStock[0].rackLocation}. Sekat kerja servis jika habis.`,
      actionLabel: "Buka Rak",
      action: onGoToInventory,
    });
  }

  if (readyPickup.length > 0 && items.length < 3) {
    items.push({
      id: "ready",
      badge: `${readyPickup.length} Siap Ambil`,
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      title: `${readyPickup.length} Motor siap dibaiki menunggu tuntutan & bayaran`,
      detail: `${readyPickup[0].plateNumber || "Motor"} siap sedia. Hantar peringatan WhatsApp untuk kosongkan ruang bengkel.`,
      actionLabel: "Intip & WhatsApp",
      action: () => onPeekWorkOrder(readyPickup[0]),
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-300">Tiada Halangan Operasi Tergantung</h4>
            <p className="text-xs text-slate-400">Semua video diluluskan, stok rak terkawal, dan aliran kerja berjalan lancar.</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-400">Operasi Sihat 100%</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
          <h3 className="text-sm font-extrabold text-white tracking-tight">
            Giliran Halangan Kerja Tergantung Bengkel
          </h3>
          <span className="text-[11px] text-slate-400 hidden sm:inline">• Selesaikan untuk melicinkan operasi bengkel</span>
        </div>
        <button
          onClick={onGoToWorkOrders}
          className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
        >
          <span>Papan Kerja Penuh ({workOrders.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-800/90 bg-slate-950/60 p-4 flex flex-col justify-between hover:border-slate-700 transition"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{item.title}</h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{item.detail}</p>
            </div>

            <button
              onClick={item.action}
              className="mt-3.5 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/80 px-3 py-1.5 text-xs font-bold text-brand-400 hover:text-white transition"
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

