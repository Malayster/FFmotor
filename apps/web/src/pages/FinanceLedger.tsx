import React, { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Receipt,
  FileText,
  Clock,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Layers
} from "lucide-react";
import { WorkOrder, Product } from "../types";

interface FinanceLedgerProps {
  workOrders: WorkOrder[];
  products: Product[];
}

export const FinanceLedger: React.FC<FinanceLedgerProps> = ({ workOrders, products }) => {
  const [activeSubTab, setActiveSubTab] = useState<"ledger" | "closing" | "forecast">("ledger");

  // Perkiraan Kewangan
  const paidOrders = workOrders.filter((w) => w.paymentStatus === "paid");
  const masukSah = paidOrders.reduce((acc, curr) => acc + (curr.grandTotal || 0), 0);
  const upahBuruh = paidOrders.reduce((acc, curr) => acc + (curr.totalLaborAmount || 0), 0);
  const jualanPart = paidOrders.reduce((acc, curr) => acc + (curr.totalPartsAmount || 0), 0);
  
  const unpaidOrders = workOrders.filter((w) => w.paymentStatus === "unpaid" && w.status !== "cancelled");
  const bakiBelumBayar = unpaidOrders.reduce((acc, curr) => acc + (curr.grandTotal || 0), 0);

  // Komisen Mekanik (Anggaran 15% dari Upah Buruh)
  const komisenTerakru = upahBuruh * 0.15;

  // Tutup Kaunter State
  const [openingFloat, setOpeningFloat] = useState(200);
  const [cashCount100, setCashCount100] = useState(4);
  const [cashCount50, setCashCount50] = useState(6);
  const [cashCount20, setCashCount20] = useState(5);
  const [cashCount10, setCashCount10] = useState(10);
  const [cashCount5, setCashCount5] = useState(10);
  const [cashCount1, setCashCount1] = useState(20);
  const [pettyCashOut, setPettyCashOut] = useState(45); // Runner JPJ / makan

  const totalCashCounted =
    cashCount100 * 100 +
    cashCount50 * 50 +
    cashCount20 * 20 +
    cashCount10 * 10 +
    cashCount5 * 5 +
    cashCount1 * 1;

  // Anggaran tunai sistem = Float + (40% kutipan tunai) - Petty Cash
  const systemExpectedCash = openingFloat + (masukSah * 0.4) - pettyCashOut;
  const variance = totalCashCounted - systemExpectedCash;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner Lejar Kewangan */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 border border-emerald-500/30">
                  Lejar Kewangan HQ
                </span>
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Audit Resit & Aliran Tunai
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-1">
                Lejar Kewangan, Tutup Kaunter & Komisen
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit bayaran tunai/QR, imbangan laci kasir (Z-Report), dan penjejakan komisen upah mekanik.
              </p>
            </div>
          </div>

          {/* Sub-Tab Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setActiveSubTab("ledger")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeSubTab === "ledger"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Lejar Transaksi
            </button>
            <button
              onClick={() => setActiveSubTab("closing")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeSubTab === "closing"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Tutup Kaunter (Z-Report)
            </button>
            <button
              onClick={() => setActiveSubTab("forecast")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeSubTab === "forecast"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Unjuran 30 Hari
            </button>
          </div>
        </div>
      </div>

      {/* 4 Kad Metrik Kewangan Pastel Spike */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Kutipan Sah (Masuk)</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-mono text-2xl font-black text-emerald-400">RM {masukSah.toFixed(2)}</h3>
            <p className="text-[11px] text-slate-400 mt-1">Tunai + DuitNow QR Lunas</p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Upah Buruh Bersih</span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-mono text-2xl font-black text-blue-400">RM {upahBuruh.toFixed(2)}</h3>
            <p className="text-[11px] text-emerald-400 font-semibold mt-1">100% Margin Untung Buruh</p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Baki Belum Dikutip</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-mono text-2xl font-black text-amber-400">RM {bakiBelumBayar.toFixed(2)}</h3>
            <p className="text-[11px] text-slate-400 mt-1">{unpaidOrders.length} job aktif belum berbayar</p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Komisen Mekanik</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-mono text-2xl font-black text-purple-300">RM {komisenTerakru.toFixed(2)}</h3>
            <p className="text-[11px] text-slate-400 mt-1">15% pool upah kerja siap</p>
          </div>
        </div>
      </div>

      {/* Kandungan Sub-Tab 1: Lejar Transaksi */}
      {activeSubTab === "ledger" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Lejar Terperinci Resit & Kad Kerja</h3>
              <p className="text-xs text-slate-400">Semua rekod transaksi masuk dan keluar kaunter bengkel</p>
            </div>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Eksport / Cetak Lejar</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Tarikh / Masa</th>
                  <th className="py-2.5 px-3">No Rujukan</th>
                  <th className="py-2.5 px-3">Pelanggan / Motor</th>
                  <th className="py-2.5 px-3">Jenis Aliran</th>
                  <th className="py-2.5 px-3">Kaedah</th>
                  <th className="py-2.5 px-3">Pecahan (Part / Upah)</th>
                  <th className="py-2.5 px-3 text-right">Jumlah (RM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {workOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {new Date(wo.createdAt).toLocaleDateString("ms-MY", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-brand-400">{wo.woNumber}</span>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <b className="text-white font-mono block">{wo.plateNumber || "-"}</b>
                      <span className="text-[11px] text-slate-400">{wo.ownerName || "Pelanggan"}</span>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                        <ArrowDownRight className="w-3 h-3" />
                        <span>Servis Bengkel</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 font-bold">
                        {wo.paymentStatus === "paid" ? "DuitNow / Tunai" : "Belum Bayar"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-400">
                      RM {(wo.totalPartsAmount || 0).toFixed(0)} / RM {(wo.totalLaborAmount || 0).toFixed(0)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-white">
                      RM {(wo.grandTotal || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Kandungan Sub-Tab 2: Tutup Kaunter Harian (Z-Report) */}
      {activeSubTab === "closing" && (
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Kalkulator Wang Fizikal Laci */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Kiraan Duit Tunai Fizikal (End-of-Day Balancing)</h3>
                <p className="text-xs text-slate-400">Kira setiap helaian wang kertas dalam laci kasir petang ini</p>
              </div>
              <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-[11px] font-mono font-bold text-blue-400">
                Pukul 7:00 PM Closing
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-slate-400 block mb-1">Helaian RM 100</span>
                <input
                  type="number"
                  value={cashCount100}
                  onChange={(e) => setCashCount100(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 font-mono text-white text-center font-bold"
                />
                <span className="font-mono text-emerald-400 text-[11px] block mt-1 text-right">
                  = RM {cashCount100 * 100}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-slate-400 block mb-1">Helaian RM 50</span>
                <input
                  type="number"
                  value={cashCount50}
                  onChange={(e) => setCashCount50(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 font-mono text-white text-center font-bold"
                />
                <span className="font-mono text-emerald-400 text-[11px] block mt-1 text-right">
                  = RM {cashCount50 * 50}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-slate-400 block mb-1">Helaian RM 20</span>
                <input
                  type="number"
                  value={cashCount20}
                  onChange={(e) => setCashCount20(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 font-mono text-white text-center font-bold"
                />
                <span className="font-mono text-emerald-400 text-[11px] block mt-1 text-right">
                  = RM {cashCount20 * 20}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-slate-400 block mb-1">Helaian RM 10</span>
                <input
                  type="number"
                  value={cashCount10}
                  onChange={(e) => setCashCount10(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 font-mono text-white text-center font-bold"
                />
                <span className="font-mono text-emerald-400 text-[11px] block mt-1 text-right">
                  = RM {cashCount10 * 10}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-slate-400 block mb-1">Helaian RM 5</span>
                <input
                  type="number"
                  value={cashCount5}
                  onChange={(e) => setCashCount5(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 font-mono text-white text-center font-bold"
                />
                <span className="font-mono text-emerald-400 text-[11px] block mt-1 text-right">
                  = RM {cashCount5 * 5}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-slate-400 block mb-1">Helaian RM 1</span>
                <input
                  type="number"
                  value={cashCount1}
                  onChange={(e) => setCashCount1(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 font-mono text-white text-center font-bold"
                />
                <span className="font-mono text-emerald-400 text-[11px] block mt-1 text-right">
                  = RM {cashCount1 * 1}
                </span>
              </div>
            </div>

            {/* Float & Petty Cash Input */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Float Pagi (Duit Modal Laci):</label>
                <input
                  type="number"
                  value={openingFloat}
                  onChange={(e) => setOpeningFloat(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Petty Cash Keluar (Runner/Makan):</label>
                <input
                  type="number"
                  value={pettyCashOut}
                  onChange={(e) => setPettyCashOut(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-white"
                />
              </div>
            </div>
          </div>

          {/* Ringkasan Imbangan (Z-Report Slip) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm lg:col-span-5 space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Keputusan Imbangan Laci (Reconciliation)</h3>
              <p className="text-xs text-slate-400">Perbandingan duit dikira vs duit sistem</p>
            </div>

            <div className="rounded-xl bg-slate-950 p-4 space-y-2.5 font-mono text-xs border border-slate-800">
              <div className="flex justify-between text-slate-300">
                <span>Total Tunai Dikira:</span>
                <span className="font-bold text-white">RM {totalCashCounted.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Float Permulaan:</span>
                <span>RM {openingFloat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Petty Cash Dituntut:</span>
                <span>- RM {pettyCashOut.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300 border-t border-slate-800 pt-2">
                <span>Jangkaan Tunai Sistem:</span>
                <span className="font-bold">RM {systemExpectedCash.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-black border-t border-slate-800 pt-2">
                <span className="text-slate-200">Varians Duit Laci:</span>
                <span
                  className={`px-2 py-0.5 rounded ${
                    Math.abs(variance) < 1
                      ? "bg-emerald-500/20 text-emerald-400"
                      : variance > 0
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-rose-500/20 text-rose-400"
                  }`}
                >
                  {variance >= 0 ? `+ RM ${variance.toFixed(2)}` : `- RM ${Math.abs(variance).toFixed(2)}`}
                </span>
              </div>
            </div>

            {Math.abs(variance) < 1 ? (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Kiraan laci seimbang (*Tally*). Tiada kehilangan tunai dikesan hari ini.</span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Ada perbezaan varians sebanyak RM {Math.abs(variance).toFixed(2)}. Semak resit petty cash.</span>
              </div>
            )}

            <button
              onClick={() => window.print()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white py-2.5 text-xs font-bold transition shadow-md shadow-brand-500/20"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Slip Tutup Hari (Z-Report 80mm)</span>
            </button>
          </div>
        </div>
      )}

      {/* Kandungan Sub-Tab 3: Unjuran Aliran Tunai 30 Hari (Ala Unjuran Johan30) */}
      {activeSubTab === "forecast" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Unjuran Pendapatan Servis & Alat Ganti (Predictive Cashflow)</h3>
            <p className="text-xs text-slate-400">
              Unjuran aliran tunai masuk 30 hari berasaskan algoritma kilometer motosikal pelanggan berdaftar
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-4">
              <span className="text-xs font-semibold text-slate-400">Minggu 1 (7 Hari Akan Datang)</span>
              <h4 className="font-mono text-xl font-bold text-emerald-400 mt-1">RM 4,250.00</h4>
              <p className="text-[11px] text-slate-400 mt-1">14 motor dijangka sampai had perbatuan servis</p>
            </div>

            <div className="rounded-xl bg-slate-950 border border-slate-800 p-4">
              <span className="text-xs font-semibold text-slate-400">Minggu 2 - 4 (30 Hari)</span>
              <h4 className="font-mono text-xl font-bold text-blue-400 mt-1">RM 18,900.00</h4>
              <p className="text-[11px] text-slate-400 mt-1">Termasuk 8 penukaran belting CVT & tayar</p>
            </div>

            <div className="rounded-xl bg-slate-950 border border-slate-800 p-4">
              <span className="text-xs font-semibold text-slate-400">Cadangan Belian Modal Stok</span>
              <h4 className="font-mono text-xl font-bold text-amber-400 mt-1">RM 6,500.00</h4>
              <p className="text-[11px] text-slate-400 mt-1">Modal pusingan PO pembekal yang diperlukan</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

