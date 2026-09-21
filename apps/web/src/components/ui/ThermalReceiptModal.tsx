import React from "react";
import { Printer, X, QrCode } from "lucide-react";
import { WorkOrder } from "../../types";

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder: WorkOrder;
  type: "jobcard" | "receipt";
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  isOpen,
  onClose,
  workOrder,
  type,
}) => {
  if (!isOpen) return null;

  const currentHost = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const trackUrl = `${currentHost}/#track-${workOrder.approvalToken}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(trackUrl)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
        {/* Modal Controls */}
        <div className="flex items-center justify-between no-print">
          <div className="flex items-center space-x-2 text-brand-400">
            <Printer className="w-5 h-5" />
            <h3 className="text-base font-extrabold text-white">
              {type === "jobcard" ? "Cetak Slip Job Card" : "Cetak Resit Bayaran"} (80mm)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 80mm Thermal Slip Printable Canvas */}
        <div
          id="printable-receipt"
          className="bg-white text-black p-5 rounded-xl font-mono text-xs shadow-inner space-y-3 leading-tight print:p-0 print:m-0 print:shadow-none print:w-[80mm]"
        >
          {/* Header */}
          <div className="text-center space-y-1 pb-2 border-b border-dashed border-gray-400">
            <h2 className="text-base font-black tracking-wider uppercase">FFMOTOR WORKSHOP</h2>
            <p className="text-[10px] text-gray-700">Pakar Servis, Baiki & Alat Ganti Sah</p>
            <p className="text-[9px] text-gray-600">Tel: 012-345 6789 • SSM: 202601002233</p>
          </div>

          {/* Slip Type */}
          <div className="text-center font-bold uppercase py-0.5 text-[11px] bg-gray-100 rounded">
            {type === "jobcard" ? "*** KAD KERJA BENGKEL ***" : "*** RESIT RASMI BAYARAN ***"}
          </div>

          {/* Metadata */}
          <div className="space-y-1 text-[10px] pb-2 border-b border-dashed border-gray-300">
            <div className="flex justify-between">
              <span>No. Kerja:</span>
              <span className="font-bold">{workOrder.woNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Tarikh:</span>
              <span>{new Date(workOrder.createdAt).toLocaleDateString("ms-MY")}</span>
            </div>
            <div className="flex justify-between">
              <span>No. Plat:</span>
              <span className="font-bold text-[12px]">{workOrder.plateNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Model:</span>
              <span>{workOrder.model || "Motosikal"}</span>
            </div>
            <div className="flex justify-between">
              <span>Pemilik:</span>
              <span>{workOrder.ownerName || "Walk-in"}</span>
            </div>
            <div className="flex justify-between">
              <span>Mileage:</span>
              <span>{workOrder.mileageIn?.toLocaleString()} KM</span>
            </div>
          </div>

          {/* Complaint / Job */}
          <div className="text-[10px] space-y-0.5 pb-2 border-b border-dashed border-gray-300">
            <span className="font-bold block">Aduan / Tugasan:</span>
            <p className="italic text-gray-800">{workOrder.customerComplaint}</p>
          </div>

          {/* Financial summary for receipt */}
          {type === "receipt" && (
            <div className="space-y-1 text-[11px] pt-1 pb-2 border-b border-dashed border-gray-400">
              <div className="flex justify-between font-extrabold text-sm">
                <span>JUMLAH:</span>
                <span>RM {(workOrder.grandTotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-700">
                <span>Status Bayaran:</span>
                <span className="font-bold uppercase">{workOrder.paymentStatus}</span>
              </div>
            </div>
          )}

          {/* QR Code for Live Customer Tracking & Passport */}
          <div className="text-center pt-2 space-y-1">
            <img
              src={qrCodeUrl}
              alt="QR Code Imbas Status"
              className="w-28 h-28 mx-auto border border-gray-300 rounded p-1 bg-white"
            />
            <p className="text-[9px] font-bold text-gray-800">
              IMBAS UNTUK STATUS LIVE & VIDEO BUKTI
            </p>
            <p className="text-[8px] text-gray-500">
              atau semak Sijil Kesihatan Motor anda
            </p>
          </div>

          {/* Footer note */}
          <div className="text-center pt-2 border-t border-dashed border-gray-300 text-[8px] text-gray-600">
            Terima kasih kerana memilih FFmotor.<br />
            Semua alat ganti disahkan 100% Original.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2 no-print">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-black shadow-lg shadow-brand-500/30 flex items-center justify-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Resit Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
};

