import React, { useState } from "react";
import {
  Lock,
  Unlock,
  Bike,
  User,
  Phone,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Plus
} from "lucide-react";
import { Motorcycle } from "../types";

interface BikeLockRecord {
  id: string;
  bookingNo: string;
  motorcycle: string;
  chassisNo: string;
  customerName: string;
  customerPhone: string;
  depositAmount: number;
  loanProvider: string;
  loanStatus: "pending" | "approved" | "rejected";
  isContractSigned: boolean;
  lockedAt: string;
}

export const BikeLocks: React.FC = () => {
  const [locks, setLocks] = useState<BikeLockRecord[]>([
    {
      id: "1",
      bookingNo: "LOCK-2026-081",
      motorcycle: "Yamaha NVX 155 V2 (Cyan Metallic)",
      chassisNo: "MH3SG4810PK09812",
      customerName: "Mohd Hafizuddin",
      customerPhone: "0172349911",
      depositAmount: 300,
      loanProvider: "AEON Credit Service",
      loanStatus: "approved",
      isContractSigned: true,
      lockedAt: "2026-09-19T10:00:00Z",
    },
    {
      id: "2",
      bookingNo: "LOCK-2026-082",
      motorcycle: "Honda RS-X 150 (Trico Edition)",
      chassisNo: "MLHJC4100PK77182",
      customerName: "Siti Nurhaliza",
      customerPhone: "0139988221",
      depositAmount: 100,
      loanProvider: "Chailease Berjaya Credit",
      loanStatus: "pending",
      isContractSigned: false,
      lockedAt: "2026-09-20T16:30:00Z",
    },
  ]);

  const [selectedLock, setSelectedLock] = useState<BikeLockRecord | null>(locks[0]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <span>FFmotor HQ</span>
            <span>/</span>
            <span className="text-brand-400 font-bold">Kunci Unit Motor Showroom</span>
          </nav>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-1">
            Pusat Kunci Tempahan & Perjanjian Deposit (*Bike Locks*)
          </h1>
          <p className="text-xs text-slate-400">
            Kunci nombor chasis motor dengan bayaran deposit, padanan resit bank, dan status kelulusan pinjaman syarikat kredit.
          </p>
        </div>
      </div>

      {/* Grid: Senarai Kunci vs Intip Lejar Kontrak */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Kolum Kiri (5 Cols): Senarai Tempahan Kunci */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-sm lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {locks.length} Unit Dikunci (Locked)
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">Deposit Selamat</span>
          </div>

          <div className="space-y-2.5">
            {locks.map((item) => {
              const isSelected = selectedLock?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedLock(item)}
                  className={`p-4 rounded-xl border transition cursor-pointer space-y-2 ${
                    isSelected
                      ? "bg-brand-500/15 border-brand-500/40 shadow-xs"
                      : "bg-slate-950/60 border-slate-800 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-brand-400">{item.bookingNo}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.loanStatus === "approved"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : item.loanStatus === "pending"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {item.loanStatus === "approved" ? "Loan Lulus" : "Loan Menunggu"}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white">{item.motorcycle}</h4>
                    <p className="text-[11px] text-slate-400">Pembeli: <b className="text-slate-200">{item.customerName}</b></p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400">Deposit: RM {item.depositAmount}</span>
                    <span className="text-slate-400">{item.loanProvider}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kolum Kanan (7 Cols): Lejar Kontrak & Tindakan */}
        {selectedLock ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm lg:col-span-7 space-y-5">
            <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  Perjanjian Kunci Unit
                </span>
                <h2 className="text-lg font-black text-white mt-1">{selectedLock.bookingNo}</h2>
                <p className="text-xs text-slate-400 font-mono">Chasis: {selectedLock.chassisNo}</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Deposit Diterima:</span>
                <span className="font-mono text-xl font-black text-emerald-400">
                  RM {selectedLock.depositAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950 p-4 space-y-2.5 text-xs border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Model Motor:</span>
                <span className="font-bold text-white">{selectedLock.motorcycle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nama Pembeli:</span>
                <span className="font-bold text-white">{selectedLock.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">No Telefon:</span>
                <span className="font-mono text-slate-200">{selectedLock.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Syarikat Pembiaya (Loan):</span>
                <span className="font-semibold text-brand-400">{selectedLock.loanProvider}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-800 pt-2">
                <span className="text-slate-400">Status Perjanjian (Borang):</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Telah Ditandatangani</span>
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <button
                onClick={() => alert(`Resit deposit ${selectedLock.bookingNo} sah lunas.`)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Sahkan Bayaran Deposit</span>
              </button>

              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition"
              >
                <FileText className="w-4 h-4" />
                <span>Cetak Surat Perjanjian Kunci</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400 text-xs lg:col-span-7">
            Pilih unit yang dikunci di sebelah kiri.
          </div>
        )}
      </div>
    </div>
  );
};

