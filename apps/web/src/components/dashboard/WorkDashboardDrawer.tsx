import React from "react";
import { X, Wrench, Video, Phone, CheckCircle2, AlertTriangle, ExternalLink, Printer, Send, ShieldCheck, Bike, ArrowRight } from "lucide-react";
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

    if (workOrder.status === "waiting_approval") {
      const trackUrl = `${window.location.origin}/track/${workOrder.approvalToken}`;
      const msg = WhatsAppTemplates.videoProof(
        workOrder.ownerName || "Pelanggan",
        workOrder.plateNumber || "Motosikal",
        workOrder.grandTotal,
        trackUrl
      );
      window.open(createWhatsAppLink(workOrder.ownerPhone, msg), "_blank");
    } else if (workOrder.status === "ready" || workOrder.status === "completed") {
      const passportUrl = `${window.location.origin}/passport/${workOrder.plateNumber}`;
      const msg = WhatsAppTemplates.motorReady(
        workOrder.ownerName || "Pelanggan",
        workOrder.plateNumber || "Motosikal",
        workOrder.grandTotal,
        passportUrl
      );
      window.open(createWhatsAppLink(workOrder.ownerPhone, msg), "_blank");
    } else {
      window.open(createWhatsAppLink(workOrder.ownerPhone, `Salam ${workOrder.ownerName}, kami dari bengkel FFmotor ingin maklumkan mengenai motosikal anda ${workOrder.plateNumber}.`), "_blank");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/75 backdrop-blur-xs animate-fade-in" onClick={onClose}>
      <aside
        className="h-full w-full max-w-lg overflow-y-auto bg-slate-900 border-l border-slate-800 p-6 shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header Laci */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  {workOrder.woNumber}
                </span>
                <span className="text-xs text-slate-400">Intip Urusan Kerja</span>
              </div>
              <h2 className="font-mono text-2xl font-black text-white mt-1">
                {workOrder.plateNumber || "TIADA PLAT"}
              </h2>
              <p className="text-xs text-slate-300">
                {workOrder.brand || "Motosikal"} {workOrder.model || ""}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Bar */}
          <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  workOrder.status === "waiting_approval"
                    ? "bg-amber-400 animate-pulse"
                    : workOrder.status === "in_progress"
                    ? "bg-blue-400"
                    : workOrder.status === "ready"
                    ? "bg-emerald-400"
                    : "bg-slate-500"
                }`}
              />
              <span className="text-xs font-extrabold text-white">
                {workOrder.status === "waiting_approval" && "Menunggu Kelulusan Pelanggan"}
                {workOrder.status === "in_progress" && "Sedang Dibaiki di Hoist"}
                {workOrder.status === "ready" && "Motor Siap (Sedia Ambil)"}
                {workOrder.status === "completed" && "Selesai Diserahkan"}
                {workOrder.status === "pending" && "Menunggu Giliran Pit"}
              </span>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                workOrder.paymentStatus === "paid"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-amber-500/20 text-amber-400"
              }`}
            >
              {workOrder.paymentStatus === "paid" ? "LUNAS (PAID)" : "BELUM BAYAR"}
            </span>
          </div>

          {/* Maklumat Pelanggan */}
          <div className="mt-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pemilik & Masalah</h4>
            <div className="rounded-xl bg-slate-950/40 border border-slate-800 p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Pemilik:</span>
                <span className="font-bold text-white">{workOrder.ownerName || "Tidak Dinyatakan"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">No Telefon:</span>
                <span className="font-mono text-slate-200 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {workOrder.ownerPhone || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Odometer Semasa:</span>
                <span className="font-mono text-slate-200">{workOrder.mileageIn ? `${workOrder.mileageIn.toLocaleString()} km` : "-"}</span>
              </div>
              <div className="border-t border-slate-800/80 pt-2">
                <span className="text-slate-400 block mb-0.5">Aduan Pelanggan:</span>
                <p className="text-slate-200 italic font-medium">"{workOrder.customerComplaint}"</p>
              </div>
            </div>
          </div>

          {/* Bahagian Video Bukti (Jika Ada) */}
          {workOrder.videoProofKey && (
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5" />
                  <span>Video Bukti Kerosakan</span>
                </h4>
                <button
                  onClick={() => onOpenTrack(workOrder.approvalToken)}
                  className="text-[11px] font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                >
                  <span>Buka Live Track</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 space-y-2">
                <p className="text-xs text-slate-300">
                  {workOrder.videoDescription || "Kerosakan komponen dikesan semasa pembongkaran."}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-slate-400">Keputusan Pelanggan:</span>
                  {workOrder.isApprovedByCustomer === true ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Diluluskan</span>
                    </span>
                  ) : workOrder.isApprovedByCustomer === false ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Ditolak oleh Pelanggan</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      <span>Menunggu Jawapan</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pecahan Kewangan & Bil */}
          <div className="mt-5 space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lejar Bil Servis</h4>
            <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Alat Ganti:</span>
                <span className="font-mono">RM {(workOrder.totalPartsAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Upah Buruh (*Labor*):</span>
                <span className="font-mono">RM {(workOrder.totalLaborAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-white border-t border-slate-800 pt-2">
                <span>Jumlah Kasar:</span>
                <span className="font-mono text-brand-400">RM {(workOrder.grandTotal || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Butang Tindakan Bawah */}
        <div className="mt-6 pt-4 border-t border-slate-800 space-y-2.5">
          {/* WhatsApp Direct */}
          {workOrder.ownerPhone && (
            <button
              onClick={handleWhatsAppAction}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 text-xs font-bold transition shadow-md shadow-emerald-950"
            >
              <Send className="w-4 h-4" />
              <span>
                {workOrder.status === "waiting_approval"
                  ? "Hantar Pautan Video WhatsApp"
                  : workOrder.status === "ready"
                  ? "Hantar Notis Motor Siap WhatsApp"
                  : "WhatsApp Pemilik"}
              </span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            {/* Resit Haba 80mm */}
            <button
              onClick={() => onOpenReceiptModal(workOrder)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 text-xs font-bold transition"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>Cetak Slip 80mm</span>
            </button>

            {/* Pasport Motor */}
            <button
              onClick={() => workOrder.plateNumber && onOpenPassport(workOrder.plateNumber)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 text-xs font-bold transition"
            >
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <span>Pasport Motor</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};
