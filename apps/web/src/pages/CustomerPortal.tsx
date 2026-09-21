import React, { useState } from "react";
import {
  UserCircle,
  Bike,
  QrCode,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Clock,
  Send,
  ExternalLink
} from "lucide-react";
import { Vehicle, WorkOrder } from "../types";

interface CustomerPortalProps {
  vehicles: Vehicle[];
  workOrders: WorkOrder[];
  onOpenPassport: (plate: string) => void;
  onOpenTrack: (token: string) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  vehicles,
  workOrders,
  onOpenPassport,
  onOpenTrack,
}) => {
  const currentVehicle = vehicles[0] || {
    plateNumber: "VDF8899",
    brand: "Yamaha",
    model: "NVX 155 V2",
    ownerName: "Akmal Hakim",
    ownerPhone: "0123456789",
    currentMileage: 18450,
    healthScore: 94,
  };

  const myWorkOrders = workOrders.filter(
    (wo) => wo.plateNumber === currentVehicle.plateNumber || wo.ownerName === currentVehicle.ownerName
  );

  const [aduanText, setAduanText] = useState("");
  const [aduanSubmitted, setAduanSubmitted] = useState(false);

  const handleSubmitAduan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aduanText.trim()) return;
    setAduanSubmitted(true);
    setAduanText("");
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header Portal Pemilik */}
      <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-950/60 via-slate-900 to-slate-900 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold text-lg">
              <UserCircle className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Portal Pemilik Motor (/saya)
              </span>
              <h1 className="text-xl md:text-2xl font-black text-white mt-1">
                Selamat Datang, {currentVehicle.ownerName}
              </h1>
              <p className="text-xs text-slate-300">
                Pusat khidmat pelanggan digital, rekod kesihatan kenderaan, dan aduan waranti.
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenPassport(currentVehicle.plateNumber)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition shadow-lg shadow-brand-500/20 self-start sm:self-auto"
          >
            <QrCode className="w-4 h-4" />
            <span>Buka Sijil Pasport Digital</span>
          </button>
        </div>
      </div>

      {/* Kad Status Motosikal */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono text-base font-black text-white block">
                {currentVehicle.plateNumber}
              </span>
              <span className="text-xs text-slate-400">
                {currentVehicle.brand} {currentVehicle.model}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Skor Kesihatan Motor</span>
            <span className="font-mono text-lg font-black text-emerald-400">
              {currentVehicle.healthScore}/100 (Gred A)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block">Odometer Terkini:</span>
            <b className="text-white text-sm">{currentVehicle.currentMileage?.toLocaleString()} km</b>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block">Purata Harian:</span>
            <b className="text-white text-sm">38 km / hari</b>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 font-sans block">Status Waranti Servis:</span>
            <b className="text-emerald-400 text-sm">Aktif (Sah 3 Bulan)</b>
          </div>
        </div>
      </div>

      {/* Sejarah Kad Kerja & Dokumen Invois */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-blue-400" />
          <span>Sejarah Resit & Invois Servis Anda</span>
        </h3>

        <div className="divide-y divide-slate-800/80 text-xs">
          {myWorkOrders.map((wo) => (
            <div key={wo.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-brand-400">{wo.woNumber}</span>
                  <span className="text-slate-400">{new Date(wo.createdAt).toLocaleDateString("ms-MY")}</span>
                </div>
                <p className="text-slate-300 mt-0.5">{wo.customerComplaint}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-white">RM {(wo.grandTotal || 0).toFixed(2)}</span>
                {wo.approvalToken && (
                  <button
                    onClick={() => onOpenTrack(wo.approvalToken)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold"
                    title="Buka Live Tracking"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Saluran Aduan & Maklum Balas Waranti Pelanggan */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
        <div className="pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Hantar Aduan atau Tuntutan Waranti Servis</span>
          </h3>
          <p className="text-xs text-slate-400">
            Jika motor anda mengalami sebarang ketidakselesaan selepas diservis, hantarkan aduan terus ke bilik kawalan mekanik kami.
          </p>
        </div>

        {aduanSubmitted ? (
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Aduan anda telah dihantar terus ke Foreman FFmotor. Kami akan menghubungi anda sebentar lagi.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmitAduan} className="space-y-3 text-xs">
            <textarea
              rows={3}
              required
              value={aduanText}
              onChange={(e) => setAduanText(e.target.value)}
              placeholder="Terangkan masalah atau bunyi yang timbul pada motosikal anda..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 font-medium"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Hantar Aduan ke Bengkel</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

