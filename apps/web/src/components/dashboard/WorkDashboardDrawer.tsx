import React from "react";
import { X, Phone, CheckCircle2, Printer, Send, ShieldCheck, Wrench, Clock, AlertTriangle } from "lucide-react";
import { WorkOrder } from "../../types";
import { createWhatsAppLink, WhatsAppTemplates } from "../../lib/whatsapp";

interface WorkDashboardDrawerProps {
  workOrder: WorkOrder | null;
  onClose: () => void;
  onOpenTrack: (token: string) => void;
  onOpenPassport: (plate: string) => void;
  onOpenReceiptModal: (wo: WorkOrder) => void;
  onStatusChange?: (woId: string, newStatus: string) => void;
}

// Label status dalam Bahasa Malaysia — tiada video proof
const STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu Giliran Pit",
  inspecting: "Sedang Diperiksa",
  in_progress: "Sedang Dibaiki di Hoist",
  waiting_parts: "Menunggu Alat Ganti dari Stor",
  ready: "Motor Siap (Sedia Ambil)",
  completed: "Selesai Diserahkan",
  cancelled: "Dibatalkan",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-zinc-400",
  inspecting: "bg-zinc-950",
  in_progress: "bg-red-600 animate-pulse",
  waiting_parts: "bg-zinc-600",
  ready: "bg-emerald-500",
  completed: "bg-emerald-700",
  cancelled: "bg-zinc-300",
};

export const WorkDashboardDrawer: React.FC<WorkDashboardDrawerProps> = ({
  workOrder,
  onClose,
  onOpenTrack,
  onOpenPassport,
  onOpenReceiptModal,
  onStatusChange,
}) => {
  if (!workOrder) return null;

  const handleWhatsAppAction = () => {
    if (!workOrder.ownerPhone) return;

    if (workOrder.status === "ready" || workOrder.status === "completed") {
      const passportUrl = `${window.location.origin}/passport/${workOrder.plateNumber}`;
      const msg = WhatsAppTemplates.motorReady(
        workOrder.ownerName || "Pelanggan",
        workOrder.plateNumber || "Motosikal",
        workOrder.grandTotal,
        passportUrl
      );
      window.open(createWhatsAppLink(workOrder.ownerPhone, msg), "_blank");
    } else {
      window.open(
        createWhatsAppLink(
          workOrder.ownerPhone,
          `Salam ${workOrder.ownerName || "tuan/puan"}, kami dari bengkel FFmotor ingin maklumkan mengenai motosikal anda ${workOrder.plateNumber}.`
        ),
        "_blank"
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm animate-in fade-in duration-150" onClick={onClose}>
      <aside
        className="h-full w-full max-w-lg overflow-y-auto bg-white border-l-2 border-zinc-200 p-6 shadow-none flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header Laci */}
          <div className="flex items-start justify-between pb-4 border-b-2 border-zinc-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-300">
                  {workOrder.woNumber}
                </span>
                <span className="text-xs text-zinc-800 font-bold">Kad Kerja Servis</span>
              </div>
              <h2 className="font-mono text-2xl font-black mt-1 text-zinc-950">
                {workOrder.plateNumber || "TIADA PLAT"}
              </h2>
              <p className="text-xs text-zinc-800 font-bold">
                {workOrder.brand || "Motosikal"} {workOrder.model || ""}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-950 hover:text-red-600 border border-zinc-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Bar */}
          <div className="mt-4 p-3 rounded-xl bg-white border-2 border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLOR[workOrder.status] || "bg-zinc-400"}`} />
              <span className="text-xs font-black text-zinc-950">
                {STATUS_LABEL[workOrder.status] || workOrder.status}
              </span>
            </div>
            <span
              className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border ${
                workOrder.paymentStatus === "paid"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-red-50 text-red-700 border-red-300"
              }`}
            >
              {workOrder.paymentStatus === "paid" ? "LUNAS" : "BELUM BAYAR"}
            </span>
          </div>

          {/* Maklumat Pelanggan */}
          <div className="mt-5 space-y-3">
            <h4 className="text-xs font-black text-zinc-950 uppercase tracking-wider">Pemilik & Aduan</h4>
            <div className="rounded-xl bg-white border-2 border-zinc-200 p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-800 font-bold">Pemilik:</span>
                <span className="font-black text-zinc-950">{workOrder.ownerName || "Tidak Dinyatakan"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-800 font-bold">No Telefon:</span>
                <span className="font-mono text-zinc-950 font-black flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-700" />
                  {workOrder.ownerPhone || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-800 font-bold">Odometer:</span>
                <span className="font-mono text-zinc-950 font-black">
                  {workOrder.mileageIn ? `${workOrder.mileageIn.toLocaleString()} km` : "-"}
                </span>
              </div>
              <div className="border-t-2 border-zinc-200 pt-2">
                <span className="text-zinc-800 font-bold block mb-0.5">Aduan Pelanggan:</span>
                <p className="text-zinc-950 font-bold italic">"{workOrder.customerComplaint}"</p>
              </div>
              {workOrder.mechanicNotes && (
                <div className="border-t-2 border-zinc-200 pt-2">
                  <span className="text-zinc-800 font-bold block mb-0.5">Nota Foreman:</span>
                  <p className="text-zinc-950 font-bold">{workOrder.mechanicNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Menunggu Alat Ganti — gantikan logik video */}
          {workOrder.status === "waiting_parts" && (
            <div className="mt-4 p-3 rounded-xl bg-white border-2 border-zinc-300 flex items-start gap-2">
              <Clock className="w-4 h-4 text-zinc-950 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-black text-zinc-950">Motor Menunggu Alat Ganti</p>
                <p className="text-[11px] text-zinc-800 font-bold mt-0.5">
                  Kerani 2 perlu keluarkan alat ganti dari rak dan serahkan ke Foreman.
                </p>
              </div>
            </div>
          )}

          {/* Pecahan Kewangan & Bil */}
          <div className="mt-5 space-y-2">
            <h4 className="text-xs font-black text-zinc-950 uppercase tracking-wider">Lejar Bil Servis</h4>
            <div className="rounded-xl bg-white border-2 border-zinc-200 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-800 font-bold">
                <span>Alat Ganti:</span>
                <span className="font-mono">RM {(workOrder.totalPartsAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-800 font-bold">
                <span>Upah Buruh (Labor):</span>
                <span className="font-mono">RM {(workOrder.totalLaborAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black border-t-2 border-zinc-200 pt-2 text-zinc-950">
                <span>Jumlah Kasar:</span>
                <span className="font-mono text-red-600">RM {(workOrder.grandTotal || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Jejak Servis — gantikan "Live Video Job" */}
          {workOrder.approvalToken && (
            <div className="mt-4">
              <button
                onClick={() => workOrder.approvalToken && onOpenTrack(workOrder.approvalToken)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-950 text-xs font-black transition cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5 text-zinc-950" />
                <span>Buka Jejak Servis Pelanggan</span>
              </button>
            </div>
          )}
        </div>

        {/* Butang Tindakan Bawah */}
        <div className="mt-6 pt-4 border-t-2 border-zinc-200 space-y-2.5">
          {workOrder.ownerPhone && (
            <button
              onClick={handleWhatsAppAction}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white py-2.5 text-xs font-black transition cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>
                {workOrder.status === "ready"
                  ? "Hantar Notis Motor Siap (WhatsApp)"
                  : "WhatsApp Pemilik Motor"}
              </span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onOpenReceiptModal(workOrder)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-950 py-2.5 text-xs font-black transition cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4 text-zinc-950" />
              <span>Cetak Slip 80mm</span>
            </button>

            <button
              onClick={() => workOrder.plateNumber && onOpenPassport(workOrder.plateNumber)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-950 py-2.5 text-xs font-black transition cursor-pointer active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Pasport Motor</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};
