import React, { useState, useEffect } from "react";
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
  Plus,
  Clock,
  ChevronRight
} from "lucide-react";
import { Motorcycle } from "../types";

interface BikeLockRecord {
  id: string;
  bookingNo: string;
  motorcycleId: string;
  customerName: string;
  customerPhone: string;
  customerIc?: string;
  depositAmount: number;
  loanProvider: string;
  loanStatus: "pending" | "approved" | "rejected" | "na";
  isContractSigned: boolean;
  status: "locked" | "completed" | "cancelled";
  lockedAt: string;
  brand?: string;
  model?: string;
  color?: string;
  chassisNo?: string;
  sellingPrice?: number;
}

export const BikeLocks: React.FC = () => {
  const [locks, setLocks] = useState<BikeLockRecord[]>([]);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLock, setSelectedLock] = useState<BikeLockRecord | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMotoId, setSelectedMotoId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerIc, setCustomerIc] = useState("");
  const [depositAmount, setDepositAmount] = useState(300);
  const [loanProvider, setLoanProvider] = useState("AEON Credit Service");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resLocks, resMotos] = await Promise.all([
        fetch("/api/locks").then((r) => r.json()).catch(() => ({ success: false })),
        fetch("/api/sales/motorcycles").then((r) => r.json()).catch(() => ({ success: false })),
      ]);

      if (resLocks.success && Array.isArray(resLocks.locks)) {
        setLocks(resLocks.locks);
        if (resLocks.locks.length > 0 && !selectedLock) {
          setSelectedLock(resLocks.locks[0]);
        }
      }

      if (resMotos.success && Array.isArray(resMotos.motorcycles)) {
        setMotorcycles(resMotos.motorcycles);
      }
    } catch (err) {
      console.error("Gagal memuat kunci unit:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateLock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMotoId || !customerName || !customerPhone) {
      alert("Sila pilih motosikal dan masukkan butiran pelanggan.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/locks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motorcycleId: selectedMotoId,
          customerName,
          customerPhone,
          customerIc,
          depositAmount,
          loanProvider,
          isContractSigned: false,
          notes: "Tempahan bilik pameran.",
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Unit motosikal berjaya dikunci dalam D1! Nombor chasis dilindungi dari jualan bertindih.");
        setShowModal(false);
        setSelectedMotoId("");
        setCustomerName("");
        setCustomerPhone("");
        await fetchData();
      } else {
        alert("Ralat mengunci unit: " + (data.message || "Gagal"));
      }
    } catch (err) {
      alert("Ralat rangkaian: " + err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReleaseLock = async (id: string) => {
    if (!confirm("Adakah anda pasti mahu melepaskan kunci unit ini? Status motor akan dikembalikan kepada 'Tersedia' di bilik pameran.")) return;

    try {
      const res = await fetch(`/api/locks/${id}/release`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert("Kunci unit berjaya dilepaskan. Motor kini sedia dijual semula.");
        await fetchData();
      }
    } catch (err) {
      alert("Ralat melepaskan kunci: " + err);
    }
  };

  const availableMotos = motorcycles.filter((m) => m.status === "available");

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold">
            <span>FFmotor HQ</span>
            <span>/</span>
            <span className="text-brand-400 font-bold">Kunci Unit Motor Showroom</span>
          </nav>
          <h1 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tight mt-1">
            Pusat Kunci Tempahan & Perjanjian Deposit (*Bike Locks*)
          </h1>
          <p className="text-xs text-zinc-500">
            Kunci nombor chasis motor dengan bayaran deposit, padanan resit bank, dan status kelulusan pinjaman syarikat kredit.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Kunci Unit Motosikal Baru</span>
        </button>
      </div>

      {/* Grid: Senarai Kunci Unit vs Panel Perincian */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Kolum Kiri (7 Cols): Senarai Kunci Unit */}
        <div className="rounded-2xl border border-zinc-200 bg-white/90 shadow-none overflow-hidden lg:col-span-7">
          <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-zinc-700" />
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Senarai Motosikal Terkunci ({locks.length})
              </h3>
            </div>
            <span className="text-xs text-zinc-500 font-mono">D1 Showroom Lock</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              Memuat turun data tempahan motor dari Cloudflare D1...
            </div>
          ) : locks.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              Tiada tempahan aktif. Semua motor di bilik pameran sedia untuk dijual.
            </div>
          ) : (
            <div className="divide-y divide-zinc-200/60">
              {locks.map((lk) => {
                const isSelected = selectedLock?.id === lk.id;
                return (
                  <div
                    key={lk.id}
                    onClick={() => setSelectedLock(lk)}
                    className={`p-4 transition cursor-pointer flex items-center justify-between ${
                      isSelected ? "bg-zinc-100/60 border-l-4 border-zinc-300" : "hover:bg-zinc-100/30"
                    }`}
                  >
                    <div className="space-y-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-zinc-900">{lk.bookingNo}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            lk.status === "locked"
                              ? "bg-zinc-100 text-zinc-700 border border-zinc-300"
                              : "bg-zinc-100 text-zinc-500"
                          }`}
                        >
                          {lk.status === "locked" ? "Unit Dikunci" : lk.status}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            lk.loanStatus === "approved"
                              ? "bg-emerald-50 text-emerald-700"
                              : lk.loanStatus === "rejected"
                              ? "bg-red-50 text-red-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          Pinjaman: {lk.loanStatus}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-zinc-700 truncate">
                        {lk.brand} {lk.model} {lk.color && `(${lk.color})`}
                      </p>
                      <p className="text-[11px] text-zinc-500 font-mono truncate">
                        Chasis: {lk.chassisNo || "N/A"} · Pembeli: {lk.customerName} ({lk.customerPhone})
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-xs font-bold text-emerald-400 block">
                        Deposit RM {lk.depositAmount.toFixed(2)}
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-400 ml-auto mt-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Kolum Kanan (5 Cols): Butiran Kunci & Pelepasan */}
        <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-none lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider pb-2 border-b border-zinc-200">
            Perincian Tempahan & Kawalan Stok
          </h3>

          {selectedLock ? (
            <div className="space-y-3.5 text-xs">
              <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-200 space-y-2">
                <div className="flex justify-between text-zinc-500">
                  <span>No Tempahan:</span>
                  <span className="font-mono font-bold ">{selectedLock.bookingNo}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Model Motosikal:</span>
                  <span className="font-bold ">{selectedLock.brand} {selectedLock.model}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>No Chasis / Enjin:</span>
                  <span className="font-mono text-zinc-700 font-bold">{selectedLock.chassisNo || "N/A"}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Nama Pembeli:</span>
                  <span className="font-bold ">{selectedLock.customerName}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>No Telefon:</span>
                  <span className="font-mono ">{selectedLock.customerPhone}</span>
                </div>
                <div className="flex justify-between text-zinc-500 border-t border-zinc-200 pt-2">
                  <span>Deposit Dibayar:</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">
                    RM {selectedLock.depositAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Syarikat Kredit / Pinjaman:</span>
                  <span className="font-bold text-zinc-700">{selectedLock.loanProvider}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-300 text-[11px] text-zinc-700 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  Perlindungan Chasis Aktif
                </p>
                <p>
                  Unit ini tidak boleh ditawarkan atau dijual kepada pembeli lain di bilik pameran sehingga proses pinjaman selesai atau tempahan dibatalkan.
                </p>
              </div>

              {selectedLock.status === "locked" && (
                <button
                  onClick={() => handleReleaseLock(selectedLock.id)}
                  className="w-full py-2 rounded-xl bg-rose-900/30 hover:bg-rose-900/50 border border-red-200 text-red-700 font-bold transition flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Batal Tempahan & Lepaskan Unit</span>
                </button>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-zinc-500">
              Pilih satu rekod tempahan dari senarai untuk melihat butiran.
            </div>
          )}
        </div>
      </div>

      {/* MODAL KUNCI UNIT BARU */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-zinc-50/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 max-w-lg w-full shadow-none space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-zinc-700" />
                <span>Kunci Motosikal Bilik Pameran</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-red-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLock} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-500 font-semibold block mb-1">Pilih Motosikal Tersedia:</label>
                <select
                  value={selectedMotoId}
                  onChange={(e) => setSelectedMotoId(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 font-medium"
                  required
                >
                  <option value="">-- Pilih Model Showroom --</option>
                  {availableMotos.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.brand} {m.model} ({m.color}) - RM {m.sellingPrice.toFixed(2)} [Chasis: {m.chassisNo}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-500 font-semibold block mb-1">Nama Pembeli:</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="cth: Ahmad Zaki"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-500 font-semibold block mb-1">No Telefon:</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0123456789"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-zinc-500 font-semibold block mb-1">No Kad Pengenalan (IC):</label>
                  <input
                    type="text"
                    value={customerIc}
                    onChange={(e) => setCustomerIc(e.target.value)}
                    placeholder="950101-14-5567"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-500 font-semibold block mb-1">Deposit (RM):</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="text-zinc-500 font-semibold block mb-1">Penyedia Pinjaman:</label>
                  <select
                    value={loanProvider}
                    onChange={(e) => setLoanProvider(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-zinc-600 font-medium"
                  >
                    <option value="AEON Credit Service">AEON Credit Service</option>
                    <option value="Chailease Berjaya Credit">Chailease Berjaya Credit</option>
                    <option value="Parkson Credit">Parkson Credit</option>
                    <option value="JCL Credit Leasing">JCL Credit Leasing</option>
                    <option value="Tunai / Tiada">Bayaran Tunai Penuh</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-white font-bold hover:bg-zinc-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{submitting ? "Mengunci..." : "Kunci Unit Sekarang"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
