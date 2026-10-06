import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
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
  Layers,
  MessageSquare,
  Send,
  Droplets,
  Building,
  CreditCard,
  TrendingDown,
  Truck,
  Plus
} from "lucide-react";
import { WorkOrder, Product } from "../types";
import { SpikeRadialGauge } from "../components/spike/SpikeRadialGauge";

interface DrumSale {
  id: string;
  date: string;
  drums: number;
  pricePerDrum: number;
  total: number;
  buyer: string;
}

interface DebtorRecord {
  id: string;
  customerName: string;
  phone: string;
  plateNumber: string;
  model: string;
  balanceDue: number;
  daysOverdue: number;
  lastReminderSent?: string;
}

interface FinanceLedgerProps {
  workOrders: WorkOrder[];
  products: Product[];
}

export const FinanceLedger: React.FC<FinanceLedgerProps> = ({ workOrders, products }) => {
  const [activeSubTab, setActiveSubTab] = useState<
    "ledger" | "closing" | "ar-aging" | "cashflow" | "bank" | "forecast"
  >("ledger");

  // Drum Minyak Hitam Terpakai State
  const [drumSales, setDrumSales] = useState<DrumSale[]>([
    {
      id: "drum-1",
      date: "2026-09-19",
      drums: 2,
      pricePerDrum: 180,
      total: 360,
      buyer: "Kitar Semula Pelincir Berkat",
    },
  ]);
  const [newDrumCount, setNewDrumCount] = useState("2");
  const [newDrumPrice, setNewDrumPrice] = useState("180");
  const [newDrumBuyer, setNewDrumBuyer] = useState("Lori Kitar Semula Pelincir");

  // Customer AR Debtors (Penyata Hutang Pelanggan)
  const [debtors, setDebtors] = useState<DebtorRecord[]>([
    {
      id: "deb-1",
      customerName: "En. Razak (Geng Runner)",
      phone: "60123456789",
      plateNumber: "VEE 8492",
      model: "Yamaha Y15ZR",
      balanceDue: 145.0,
      daysOverdue: 14,
    },
    {
      id: "deb-2",
      customerName: "Abang Lan",
      phone: "60178822191",
      plateNumber: "BPE 4920",
      model: "Yamaha NVX 155",
      balanceDue: 320.0,
      daysOverdue: 38,
    },
    {
      id: "deb-3",
      customerName: "Kak Salmah",
      phone: "60192837461",
      plateNumber: "KEE 2911",
      model: "Honda Beat 110",
      balanceDue: 85.0,
      daysOverdue: 65,
    },
  ]);

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
  
  interface PettyCashRecord {
    id: string;
    amount: number;
    purpose: string;
    staffName: string;
  }
  const [pettyCashRecords, setPettyCashRecords] = useState<PettyCashRecord[]>([
    { id: "pc-1", amount: 45, purpose: "Runner JPJ / makan", staffName: "Ali" }
  ]);
  const [newPcAmount, setNewPcAmount] = useState("");
  const [newPcPurpose, setNewPcPurpose] = useState("");
  const [newPcStaff, setNewPcStaff] = useState("");

  const [isShiftLocked, setIsShiftLocked] = useState(false);
  const [shiftLockedAt, setShiftLockedAt] = useState<string | null>(null);

  const totalPettyCashOut = pettyCashRecords.reduce((acc, curr) => acc + curr.amount, 0);

  const [closingHistory, setClosingHistory] = useState<any[]>([]);
  const [savingClosing, setSavingClosing] = useState(false);

  const fetchClosingHistory = async () => {
    try {
      const res = await fetch("/api/finance/closing/history");
      const d = await res.json();
      if (d.success && Array.isArray(d.closings)) {
        setClosingHistory(d.closings);
      }
    } catch (err) {
      console.error("Gagal memuat sejarah tutup kaunter:", err);
    }
  };

  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [chartPeriod, setChartPeriod] = useState<"7d" | "30d">("7d");

  useEffect(() => {
    if (activeSubTab === "closing") {
      fetchClosingHistory();
    }
  }, [activeSubTab]);

  useEffect(() => {
    if (!chartCanvasRef.current) return;
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartCanvasRef.current.getContext("2d");
    if (!ctx) return;

    const labels =
      chartPeriod === "7d"
        ? ["Isn", "Sel", "Rab", "Kha", "Jum", "Sab", "Ahd"]
        : ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"];

    const laborData = chartPeriod === "7d" ? [850, 1100, 950, 1400, 1800, 2100, 920] : [6400, 7800, 8900, 10200];
    const partsData = chartPeriod === "7d" ? [620, 840, 710, 1150, 1400, 1650, 480] : [4800, 5900, 6800, 7900];

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Upah Buruh (100% Margin)",
            data: laborData,
            borderColor: "#dc2626",
            backgroundColor: "rgba(220, 38, 38, 0.2)",
            fill: true,
            tension: 0.35,
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: "Alat Ganti & POS (RM)",
            data: partsData,
            borderColor: "#ffffff",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: "#ffffff", font: { size: 11, weight: "bold" } },
          },
        },
        scales: {
          x: {
            grid: { color: "rgba(255,255,255,0.05)" },
            ticks: { color: "#a1a1aa", font: { size: 10 } },
          },
          y: {
            grid: { color: "rgba(255,255,255,0.05)" },
            ticks: { color: "#a1a1aa", font: { size: 10 } },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [chartPeriod, activeSubTab]);

  const totalCashCounted =
    cashCount100 * 100 +
    cashCount50 * 50 +
    cashCount20 * 20 +
    cashCount10 * 10 +
    cashCount5 * 5 +
    cashCount1 * 1;

  // Anggaran tunai sistem = Float + (40% kutipan tunai) - Petty Cash
  const systemExpectedCash = openingFloat + (masukSah * 0.4) - totalPettyCashOut;
  const variance = totalCashCounted - systemExpectedCash;

  const handleSaveZReport = async () => {
    try {
      setSavingClosing(true);
      const res = await fetch("/api/finance/closing/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          openingFloat,
          systemExpectedCash,
          physicalCashCounted: totalCashCounted,
          pettyCashTotal: totalPettyCashOut,
          notes: Math.abs(variance) < 1.0 ? "Kiraan laci seimbang (Tally)" : `Varians RM ${variance.toFixed(2)}`,
        }),
      });
      const d = await res.json();
      if (d.success) {
        alert(`Z-Report ${d.closing.zReportNumber} berjaya disimpan ke Cloudflare D1!`);
        await fetchClosingHistory();
      }
    } catch (err) {
      alert("Ralat menyimpan Z-Report: " + err);
    } finally {
      setSavingClosing(false);
    }
  };

  const handleSendWhatsAppReminder = (deb: DebtorRecord) => {
    const msg = `Salam ${deb.customerName}, peringatan daripada Pengurusan Bengkel FFmotor. Baki servis motosikal ${deb.model} (${deb.plateNumber}) berjumlah *RM ${deb.balanceDue.toFixed(2)}* kini tertunggak selama ${deb.daysOverdue} hari. Mohon buat bayaran ke akaun Maybank rasmi: 5128 4492 1092 (FFmotor Sdn Bhd) atau hadir ke kaunter. Terima kasih!`;
    const cleanPhone = deb.phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank");
    setDebtors((prev) =>
      prev.map((d) => (d.id === deb.id ? { ...d, lastReminderSent: "Hari ini" } : d))
    );
  };

  const handleMarkDebtorPaid = (id: string) => {
    setDebtors((prev) => prev.filter((d) => d.id !== id));
    alert("Bayaran hutang pelanggan disahkan dan direkodkan sebagai lunas!");
  };

  const handleAddDrumSale = (e: React.FormEvent) => {
    e.preventDefault();
    const dCount = parseInt(newDrumCount) || 1;
    const dPrice = parseFloat(newDrumPrice) || 180;
    const newSale: DrumSale = {
      id: `drum-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      drums: dCount,
      pricePerDrum: dPrice,
      total: dCount * dPrice,
      buyer: newDrumBuyer,
    };
    setDrumSales([newSale, ...drumSales]);
    setNewDrumCount("1");
    alert(`Jualan ${dCount} drum minyak hitam terpakai (RM ${(dCount * dPrice).toFixed(2)}) berjaya direkodkan dalam aliran tunai masuk!`);
  };


  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner Lejar Kewangan Motorsport Spike */}
      <div className="spike-card rounded-3xl border border-zinc-200 p-6 shadow-none">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/30">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-red-600/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-red-400 border border-red-500/30">
                  HQ Financial Cockpit
                </span>
                <span className="text-xs text-zinc-400 font-mono flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  Audit Resit & Aliran Tunai Langsung
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tight mt-1 uppercase">
                Lejar Kewangan, Tutup Kaunter & Komisen
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Audit bayaran tunai/QR, imbangan laci kasir (Z-Report), dan penjejakan komisen upah mekanik.
              </p>
            </div>
          </div>

          {/* Sub-Tab Switcher Motorsport Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-black/80 p-1.5 rounded-2xl border border-zinc-200 self-start md:self-auto">
            <button
              onClick={() => setActiveSubTab("ledger")}
              className={`rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-wider transition ${
                activeSubTab === "ledger"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                  : "text-zinc-400 hover:text-red-600"
              }`}
            >
              Lejar
            </button>
            <button
              onClick={() => setActiveSubTab("closing")}
              className={`rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-wider transition ${
                activeSubTab === "closing"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                  : "text-zinc-400 hover:text-red-600"
              }`}
            >
              Z-Report
            </button>
            <button
              onClick={() => setActiveSubTab("ar-aging")}
              className={`rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-wider transition ${
                activeSubTab === "ar-aging"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                  : "text-zinc-400 hover:text-red-600"
              }`}
            >
              Hutang AR
            </button>
            <button
              onClick={() => setActiveSubTab("cashflow")}
              className={`rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-wider transition ${
                activeSubTab === "cashflow"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                  : "text-zinc-400 hover:text-red-600"
              }`}
            >
              Minyak Terpakai
            </button>
            <button
              onClick={() => setActiveSubTab("bank")}
              className={`rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-wider transition ${
                activeSubTab === "bank"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                  : "text-zinc-400 hover:text-red-600"
              }`}
            >
              Bank
            </button>
            <button
              onClick={() => setActiveSubTab("forecast")}
              className={`rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-wider transition ${
                activeSubTab === "forecast"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                  : "text-zinc-400 hover:text-red-600"
              }`}
            >
              Unjuran 30H
            </button>
          </div>
        </div>
      </div>

      {/* 3 Speedometer Radial Dials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SpikeRadialGauge
          value={98}
          target={100}
          title="Imbangan Laci Z-Report"
          subtitle="Varians Tunai Semak Kasir"
          unit="%"
          color="#22c55e"
        />
        <SpikeRadialGauge
          value={82}
          target={90}
          title="Kutipan Hutang AR"
          subtitle="Status Pungutan 30 Hari"
          unit="%"
          color="#dc2626"
        />
        <SpikeRadialGauge
          value={68}
          target={65}
          title="Margin Keuntungan Bersih"
          subtitle="Buruh 100% + Part 35%"
          unit="%"
          color="#ffffff"
        />
      </div>

      {/* 4 Kad Metrik Kewangan Velocity Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="spike-card rounded-2xl border border-zinc-200 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">Kutipan Sah (Masuk)</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-mono text-2xl font-black text-zinc-900">RM {masukSah.toFixed(2)}</h3>
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
              <span>Tunai + DuitNow QR Lunas</span>
              <span className="text-emerald-400 font-bold font-mono">100%</span>
            </div>
          </div>
        </div>

        <div className="spike-card rounded-2xl border border-zinc-200 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">Upah Buruh Bersih</span>
            <div className="h-8 w-8 rounded-lg bg-red-600/10 text-red-500 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-mono text-2xl font-black text-red-500">RM {upahBuruh.toFixed(2)}</h3>
            <div className="flex items-center justify-between text-[11px] mt-1">
              <span className="text-zinc-400">Margin Upah Mekanik</span>
              <span className="text-red-400 font-bold font-mono">100% Bersih</span>
            </div>
          </div>
        </div>

        <div className="spike-card rounded-2xl border border-zinc-200 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">Baki Belum Dikutip</span>
            <div className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-mono text-2xl font-black text-red-600">RM {bakiBelumBayar.toFixed(2)}</h3>
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
              <span>{unpaidOrders.length} job aktif belum lunas</span>
              <span className="text-red-600 font-bold">Follow-up</span>
            </div>
          </div>
        </div>

        <div className="spike-card rounded-2xl border border-zinc-200 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">Komisen Mekanik</span>
            <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-mono text-2xl font-black text-zinc-900">RM {komisenTerakru.toFixed(2)}</h3>
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
              <span>Pool komisen 15% buruh</span>
              <span className="text-zinc-900 font-bold font-mono">4 Staf</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart.js Interactive Cashflow & Velocity Panel */}
      <div className="spike-card rounded-3xl p-5 border border-zinc-200">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">
              Analitik Aliran Tunai & Keuntungan (Chart.js)
            </h3>
          </div>
          <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-zinc-200">
            <button
              onClick={() => setChartPeriod("7d")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                chartPeriod === "7d" ? "bg-red-600 text-white shadow-sm" : "text-zinc-400 hover:text-red-600"
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setChartPeriod("30d")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                chartPeriod === "30d" ? "bg-red-600 text-white shadow-sm" : "text-zinc-400 hover:text-red-600"
              }`}
            >
              30 Hari
            </button>
          </div>
        </div>
        <div className="h-64 w-full">
          <canvas ref={chartCanvasRef} />
        </div>
      </div>

      {/* Kandungan Sub-Tab 1: Lejar Transaksi */}
      {activeSubTab === "ledger" && (
        <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Lejar Terperinci Resit & Kad Kerja</h3>
              <p className="text-xs text-zinc-500">Semua rekod transaksi masuk dan keluar kaunter bengkel</p>
            </div>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Eksport / Cetak Lejar</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Tarikh / Masa</th>
                  <th className="py-2.5 px-3">No Rujukan</th>
                  <th className="py-2.5 px-3">Pelanggan / Motor</th>
                  <th className="py-2.5 px-3">Jenis Aliran</th>
                  <th className="py-2.5 px-3">Kaedah</th>
                  <th className="py-2.5 px-3">Pecahan (Part / Upah)</th>
                  <th className="py-2.5 px-3 text-right">Jumlah (RM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 font-mono">
                {workOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-zinc-100/40 transition">
                    <td className="py-3 px-3 text-zinc-500 text-[11px]">
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
                      <b className="text-zinc-900 font-mono block">{wo.plateNumber || "-"}</b>
                      <span className="text-[11px] text-zinc-500">{wo.ownerName || "Pelanggan"}</span>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                        <ArrowDownRight className="w-3 h-3" />
                        <span>Servis Bengkel</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-600 font-bold">
                        {wo.paymentStatus === "paid" ? "DuitNow / Tunai" : "Belum Bayar"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-zinc-500">
                      RM {(wo.totalPartsAmount || 0).toFixed(0)} / RM {(wo.totalLaborAmount || 0).toFixed(0)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-zinc-900">
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
          <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Kiraan Duit Tunai Fizikal (End-of-Day Balancing)</h3>
                <p className="text-xs text-zinc-500">Kira setiap helaian wang kertas dalam laci kasir petang ini</p>
              </div>
              <span className="rounded-full bg-zinc-100 border border-zinc-300 px-2.5 py-0.5 text-[11px] font-mono font-bold text-zinc-700">
                Pukul 7:00 PM Closing
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <span className="font-bold text-zinc-500 block mb-1">Helaian RM 100</span>
                <input
                  type="number"
                  value={cashCount100}
                  onChange={(e) => setCashCount100(Number(e.target.value))}
                  className="w-full bg-white border border-zinc-300 rounded-lg p-1.5 font-mono text-center font-bold"
                />
                <span className="font-mono text-emerald-400 text-[11px] block mt-1 text-right">
                  = RM {cashCount100 * 100}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <span className="font-bold text-zinc-500 block mb-1">Helaian RM 50</span>
                <input
                  type="number"
                  value={cashCount50}
                  onChange={(e) => setCashCount50(Number(e.target.value))}
                  className="w-full bg-white border border-zinc-300 rounded-lg p-1.5 font-mono text-center font-bold"
                />
                <span className="font-mono text-emerald-400 text-[11px] block mt-1 text-right">
                  = RM {cashCount50 * 50}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <span className="font-bold text-zinc-500 block mb-1">Helaian RM 20</span>
                <input
                  type="number"
                  value={cashCount20}
                  onChange={(e) => setCashCount20(Number(e.target.value))}
                  className="w-full bg-white border border-zinc-300 rounded-lg p-1.5 font-mono text-center font-bold"
                />
                <span className="font-mono text-emerald-400 text-[11px] block mt-1 text-right">
                  = RM {cashCount20 * 20}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <span className="font-bold text-zinc-500 block mb-1">Helaian RM 10</span>
                <input
                  type="number"
                  value={cashCount10}
                  onChange={(e) => setCashCount10(Number(e.target.value))}
                  className="w-full bg-white border border-zinc-300 rounded-lg p-1.5 font-mono text-center font-bold"
                />
                <span className="font-mono text-emerald-400 text-[11px] block mt-1 text-right">
                  = RM {cashCount10 * 10}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <span className="font-bold text-zinc-500 block mb-1">Helaian RM 5</span>
                <input
                  type="number"
                  value={cashCount5}
                  onChange={(e) => setCashCount5(Number(e.target.value))}
                  className="w-full bg-white border border-zinc-300 rounded-lg p-1.5 font-mono text-center font-bold"
                />
                <span className="font-mono text-emerald-400 text-[11px] block mt-1 text-right">
                  = RM {cashCount5 * 5}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <span className="font-bold text-zinc-500 block mb-1">Helaian RM 1</span>
                <input
                  type="number"
                  value={cashCount1}
                  onChange={(e) => setCashCount1(Number(e.target.value))}
                  className="w-full bg-white border border-zinc-300 rounded-lg p-1.5 font-mono text-center font-bold"
                />
                <span className="font-mono text-emerald-400 text-[11px] block mt-1 text-right">
                  = RM {cashCount1 * 1}
                </span>
              </div>
            </div>

            {/* Float Input */}
            <div className="pt-2 border-t border-zinc-200 text-xs">
              <label className="text-zinc-500 font-semibold block mb-1">Wang Apungan Awal (Float In):</label>
              <input
                type="number"
                value={openingFloat}
                onChange={(e) => setOpeningFloat(Number(e.target.value))}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 font-mono text-zinc-900"
                placeholder="Jumlah wang syiling/pecah buka kedai"
              />
            </div>

            {/* Petty Cash Out */}
            <div className="pt-2 border-t border-zinc-200 text-xs">
              <label className="text-zinc-500 font-semibold block mb-2">Pengeluaran Wang Runcit (Petty Cash Out):</label>
              <div className="space-y-2 mb-3">
                {pettyCashRecords.map((pc) => (
                  <div key={pc.id} className="flex items-center justify-between p-2 bg-zinc-50 border border-zinc-200 rounded-lg">
                    <div>
                      <p className="font-bold text-zinc-900">{pc.purpose}</p>
                      <span className="text-[10px] text-zinc-500">Staf: {pc.staffName}</span>
                    </div>
                    <span className="font-mono font-bold text-red-600">- RM {pc.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Tujuan (cth: beli ais)"
                  value={newPcPurpose}
                  onChange={(e) => setNewPcPurpose(e.target.value)}
                  className="col-span-1 bg-white border border-zinc-300 rounded-lg p-1.5 text-zinc-900"
                />
                <input
                  type="text"
                  placeholder="Nama Staf"
                  value={newPcStaff}
                  onChange={(e) => setNewPcStaff(e.target.value)}
                  className="col-span-1 bg-white border border-zinc-300 rounded-lg p-1.5 text-zinc-900"
                />
                <div className="col-span-1 flex gap-1">
                  <input
                    type="number"
                    placeholder="RM"
                    value={newPcAmount}
                    onChange={(e) => setNewPcAmount(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-lg p-1.5 font-mono text-zinc-900"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if(newPcAmount && newPcPurpose && newPcStaff) {
                        setPettyCashRecords([...pettyCashRecords, {
                          id: `pc-${Date.now()}`,
                          amount: Number(newPcAmount),
                          purpose: newPcPurpose,
                          staffName: newPcStaff
                        }]);
                        setNewPcAmount(""); setNewPcPurpose(""); setNewPcStaff("");
                      }
                    }}
                    className="bg-white rounded-lg px-2 hover:bg-zinc-100 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Ringkasan Imbangan (Z-Report Slip) */}
          <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm lg:col-span-5 space-y-4">
            <div className="pb-3 border-b border-zinc-200">
              <h3 className="text-sm font-bold text-zinc-900">Keputusan Imbangan Laci (Reconciliation)</h3>
              <p className="text-xs text-zinc-500">Kiraan Baki Peti Bersih (Float + Tunai Masuk - Petty Cash)</p>
            </div>

            <div className="rounded-xl bg-zinc-50 p-4 space-y-2.5 font-mono text-xs border border-zinc-200">
              <div className="flex justify-between text-zinc-600">
                <span>Total Tunai Dikira:</span>
                <span className="font-bold text-zinc-900">RM {totalCashCounted.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Wang Apungan Awal:</span>
                <span>RM {openingFloat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Kutipan Tunai Masuk:</span>
                <span>RM {(masukSah * 0.4).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Petty Cash Keluar:</span>
                <span className="text-red-600">- RM {totalPettyCashOut.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-600 border-t border-zinc-200 pt-2">
                <span>Jangkaan Tunai Sistem (Kiraan Bersih):</span>
                <span className="font-bold">RM {systemExpectedCash.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-black border-t border-zinc-200 pt-2">
                <span className="text-zinc-700">Varians Duit Laci:</span>
                <span
                  className={`px-2 py-0.5 rounded ${
                    Math.abs(variance) < 1
                      ? "bg-emerald-50 text-emerald-400"
                      : variance > 0
                      ? "bg-zinc-100 text-zinc-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {variance >= 0 ? `+ RM ${variance.toFixed(2)}` : `- RM ${Math.abs(variance).toFixed(2)}`}
                </span>
              </div>
            </div>

            {Math.abs(variance) < 1 ? (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-700">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Kiraan laci seimbang (*Tally*). Tiada kehilangan tunai dikesan hari ini.</span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-600">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>Ada perbezaan varians sebanyak RM {Math.abs(variance).toFixed(2)}. Semak resit petty cash.</span>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {!isShiftLocked ? (
                <>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveZReport}
                      disabled={savingClosing}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white py-2.5 text-xs font-bold transition shadow-md shadow-emerald-600/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{savingClosing ? "Menyimpan ke D1..." : "Sahkan & Simpan ke D1"}</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsShiftLocked(true);
                        setShiftLockedAt(new Date().toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" }));
                      }}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-zinc-100 px-4 py-2.5 text-xs font-bold transition shadow-md"
                    >
                      <span>🔒 Kunci Syif & Tutup Z-Report</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 bg-zinc-100 p-4 rounded-xl border border-zinc-200">
                  <div className="text-center">
                    <span className="inline-flex items-center justify-center bg-red-50 text-red-600 font-bold px-3 py-1 rounded-full text-xs border border-red-200 mb-2">
                      SYIF DITUTUP PADA {shiftLockedAt}
                    </span>
                  </div>
                  
                  {/* Monospaced Receipt Format */}
                  <div className="w-64 bg-white p-4 font-mono text-[10px] text-zinc-900 border-2 border-dashed border-zinc-300 mx-auto">
                    <div className="text-center font-bold mb-2 pb-2 border-b border-dashed border-zinc-300">
                      *** FFMOTOR Z-REPORT ***<br/>
                      TUTUP SYIF: {shiftLockedAt}
                    </div>
                    <div className="flex justify-between"><span>FLOAT:</span><span>RM {openingFloat.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>TUNAI MASUK:</span><span>RM {(masukSah * 0.4).toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>PETTY CASH:</span><span>-RM {totalPettyCashOut.toFixed(2)}</span></div>
                    <div className="border-b border-dashed border-zinc-300 my-1"></div>
                    <div className="flex justify-between font-bold"><span>SISTEM:</span><span>RM {systemExpectedCash.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold"><span>DIKIRA:</span><span>RM {totalCashCounted.toFixed(2)}</span></div>
                    <div className="border-b border-dashed border-zinc-300 my-1"></div>
                    <div className="flex justify-between">
                      <span>VARIANS:</span>
                      <span className={Math.abs(variance) < 1 ? "" : "text-red-600 font-bold"}>
                        {variance >= 0 ? `+RM ${variance.toFixed(2)}` : `-RM ${Math.abs(variance).toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-zinc-100 px-4 py-2.5 text-xs font-bold transition w-full"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Z-Report 80mm</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Jadual Sejarah Z-Report dari D1 */}
          <div className="rounded-2xl border border-zinc-200 bg-white/90 shadow-none overflow-hidden lg:col-span-12">
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Sejarah Penutupan Kaunter (D1 Z-Reports)
              </h3>
              <span className="text-xs text-zinc-500 font-mono">
                {closingHistory.length} Rekod Tersimpan
              </span>
            </div>

            {closingHistory.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500">
                Tiada rekod penutupan kaunter terdahulu dijumpai.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider text-[10px] bg-zinc-50/40">
                      <th className="py-2.5 px-4">No Z-Report</th>
                      <th className="py-2.5 px-4">Tarikh</th>
                      <th className="py-2.5 px-4 text-right">Float Buka</th>
                      <th className="py-2.5 px-4 text-right">Duit Dijangka</th>
                      <th className="py-2.5 px-4 text-right">Duit Dikira</th>
                      <th className="py-2.5 px-4 text-right">Varians</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/60 font-mono">
                    {closingHistory.map((cl) => (
                      <tr key={cl.id} className="hover:bg-zinc-100/30 transition">
                        <td className="py-2.5 px-4 font-bold ">{cl.zReportNumber}</td>
                        <td className="py-2.5 px-4 text-zinc-600">{cl.closingDate}</td>
                        <td className="py-2.5 px-4 text-right text-zinc-600">RM {cl.openingFloat.toFixed(2)}</td>
                        <td className="py-2.5 px-4 text-right text-zinc-600">RM {cl.systemExpectedCash.toFixed(2)}</td>
                        <td className="py-2.5 px-4 text-right font-bold ">RM {cl.physicalCashCounted.toFixed(2)}</td>
                        <td className="py-2.5 px-4 text-right">
                          <span className={cl.variance === 0 ? "text-emerald-400" : "text-red-700"}>
                            {cl.variance >= 0 ? `+RM ${cl.variance.toFixed(2)}` : `-RM ${Math.abs(cl.variance).toFixed(2)}`}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              cl.isBalanced
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {cl.isBalanced ? "Seimbang" : "Ada Varians"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Kandungan Sub-Tab: Penyata Hutang Pelanggan & WhatsApp Peringatan (AR Aging) */}
      {activeSubTab === "ar-aging" && (
        <div className="space-y-6">
          {/* 3 Kad Aging Brackets */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm">
              <span className="text-xs font-semibold text-zinc-500 uppercase">1 - 30 Hari (Baki Biasa)</span>
              <p className="text-2xl font-black text-red-600 mt-2">
                RM {debtors.filter((d) => d.daysOverdue <= 30).reduce((s, d) => s + d.balanceDue, 0).toFixed(2)}
              </p>
              <span className="text-[11px] text-zinc-500 mt-1 block">Tunggakan mesra / pelanggan kerap</span>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm">
              <span className="text-xs font-semibold text-zinc-500 uppercase">31 - 60 Hari (Perlu Tindakan)</span>
              <p className="text-2xl font-black text-zinc-700 mt-2">
                RM {debtors.filter((d) => d.daysOverdue > 30 && d.daysOverdue <= 60).reduce((s, d) => s + d.balanceDue, 0).toFixed(2)}
              </p>
              <span className="text-[11px] text-zinc-500 mt-1 block">Wajib hantar peringatan WhatsApp</span>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm">
              <span className="text-xs font-semibold text-zinc-500 uppercase">&gt; 60 Hari (Kritikal / Sekat Lif)</span>
              <p className="text-2xl font-black text-red-700 mt-2">
                RM {debtors.filter((d) => d.daysOverdue > 60).reduce((s, d) => s + d.balanceDue, 0).toFixed(2)}
              </p>
              <span className="text-[11px] text-zinc-500 mt-1 block">Sekat servis baharu sehingga lunas</span>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-red-700" />
                  <span>Lejar Akaun Belum Terima (AR Aging) & Tindakan WhatsApp</span>
                </h3>
                <p className="text-xs text-zinc-500">
                  Hantar pautan peringatan bayaran rasmi berserta nombor akaun Maybank HQ dengan satu klik.
                </p>
              </div>
              <span className="text-xs font-mono text-red-700 bg-red-50 px-3 py-1 rounded-xl border border-red-200 font-bold">
                Jumlah Hutang: RM {debtors.reduce((s, d) => s + d.balanceDue, 0).toFixed(2)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider text-[10px] bg-zinc-50/40">
                    <th className="py-3 px-4">Nama Pelanggan</th>
                    <th className="py-3 px-4">No. Telefon</th>
                    <th className="py-3 px-4">Motosikal / Plat</th>
                    <th className="py-3 px-3 text-center">Tempoh (Hari)</th>
                    <th className="py-3 px-4 text-right">Baki Tertunggak</th>
                    <th className="py-3 px-4 text-center">Status Notis</th>
                    <th className="py-3 px-4 text-right">Tindakan Kaunter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60 font-mono">
                  {debtors.map((deb) => (
                    <tr key={deb.id} className="hover:bg-zinc-100/30 transition">
                      <td className="py-3 px-4 font-sans font-bold ">{deb.customerName}</td>
                      <td className="py-3 px-4 text-zinc-600">{deb.phone}</td>
                      <td className="py-3 px-4 font-sans">
                        <span className="font-mono font-bold text-brand-400">{deb.plateNumber}</span>
                        <span className="block text-[11px] text-zinc-500">{deb.model}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            deb.daysOverdue > 60
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : deb.daysOverdue > 30
                              ? "bg-orange-500/20 text-zinc-700 border border-orange-500/30"
                              : "bg-red-50 text-red-600 border border-red-200"
                          }`}
                        >
                          {deb.daysOverdue} Hari
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-red-700 text-sm">
                        RM {deb.balanceDue.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center font-sans text-[11px] text-zinc-500">
                        {deb.lastReminderSent ? (
                          <span className="text-emerald-400">Dihantar ({deb.lastReminderSent})</span>
                        ) : (
                          <span className="text-zinc-400">Belum Dihantar</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleSendWhatsAppReminder(deb)}
                            className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-sm transition"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMarkDebtorPaid(deb.id)}
                            className="bg-white hover:bg-zinc-100 text-zinc-700 font-bold px-2.5 py-1.5 rounded-lg text-xs transition"
                          >
                            Lunas
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Kandungan Sub-Tab: Aliran Tunai Sebenar & Minyak Terpakai (Cashflow & P&L) */}
      {activeSubTab === "cashflow" && (
        <div className="space-y-6">
          {/* Kad Imbangan Laci vs Bank */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm">
              <span className="text-xs font-semibold text-zinc-500 uppercase">Laci Tunai Kaunter POS</span>
              <p className="text-2xl font-black text-emerald-400 mt-2">RM {systemExpectedCash.toFixed(2)}</p>
              <span className="text-[11px] text-zinc-500 mt-1 block">Tunai fizikal bersedia di kedai</span>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm">
              <span className="text-xs font-semibold text-zinc-500 uppercase">Maybank HQ (QR & FPX)</span>
              <p className="text-2xl font-black text-zinc-700 mt-2">RM {(masukSah * 0.6).toFixed(2)}</p>
              <span className="text-[11px] text-zinc-500 mt-1 block">Baki lejar digital Cloudflare D1</span>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm">
              <span className="text-xs font-semibold text-zinc-500 uppercase">Jualan Drum Minyak Terpakai</span>
              <p className="text-2xl font-black text-red-600 mt-2">
                RM {drumSales.reduce((s, d) => s + d.total, 0).toFixed(2)}
              </p>
              <span className="text-[11px] text-zinc-500 mt-1 block">
                {drumSales.reduce((s, d) => s + d.drums, 0)} Drum diserahkan ke kitar semula
              </span>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm">
              <span className="text-xs font-semibold text-zinc-500 uppercase">OPEX Bulanan Bengkel</span>
              <p className="text-2xl font-black text-red-700 mt-2">RM 4,284.00</p>
              <span className="text-[11px] text-zinc-500 mt-1 block">Sewa, TNB, Air, Internet & Petty Cash</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Bahagian Kiri: Rekod Jualan Minyak Hitam Terpakai (7 Kolum) */}
            <div className="lg:col-span-7 rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-red-600" />
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">Pendapatan Sampingan: Drum Minyak Hitam Terpakai</h3>
                    <p className="text-xs text-zinc-500">Jualan sisa pelincir servis kepada lori kitar semula berlesen</p>
                  </div>
                </div>
              </div>

              {/* Form Tambah Jualan Drum */}
              <form onSubmit={handleAddDrumSale} className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="block text-zinc-500 font-bold mb-1">Bilangan Drum</label>
                  <input
                    type="number"
                    min="1"
                    value={newDrumCount}
                    onChange={(e) => setNewDrumCount(e.target.value)}
                    className="w-full bg-white border border-zinc-300 text-red-600 font-black rounded-xl p-2 focus:border-red-600 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 font-bold mb-1">Harga/Drum (RM)</label>
                  <input
                    type="number"
                    value={newDrumPrice}
                    onChange={(e) => setNewDrumPrice(e.target.value)}
                    className="w-full bg-white border border-zinc-300 font-bold rounded-xl p-2 focus:border-red-600 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 font-bold mb-1">Pembeli / Kontraktor</label>
                  <input
                    type="text"
                    value={newDrumBuyer}
                    onChange={(e) => setNewDrumBuyer(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-xl p-2 focus:border-red-600 outline-none"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-2 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Rekod Jualan</span>
                  </button>
                </div>
              </form>

              {/* Senarai Jualan Drum */}
              <div className="space-y-2">
                {drumSales.map((ds) => (
                  <div key={ds.id} className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-red-600 font-mono font-bold text-xs">{ds.drums} Drum x RM {ds.pricePerDrum}</span>
                      <p className="font-bold mt-0.5">{ds.buyer}</p>
                      <span className="text-[10px] text-zinc-500 font-mono">Tarikh: {ds.date}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-mono font-black text-sm">
                        + RM {ds.total.toFixed(2)}
                      </span>
                      <span className="block text-[10px] text-emerald-700">Tunai Diterima</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bahagian Kanan: Pecahan OPEX & P&L (5 Kolum) */}
            <div className="lg:col-span-5 rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-zinc-200">
                <Building className="w-5 h-5 text-zinc-700" />
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Kos Overhed Tetap (OPEX Bulanan)</h3>
                  <p className="text-xs text-zinc-500">Komitmen premis bengkel FFmotor</p>
                </div>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between p-2.5 bg-zinc-50 rounded-xl border border-zinc-200">
                  <span className="text-zinc-500">Sewa Premis Bengkel 3 Bay:</span>
                  <span className="font-bold ">RM 3,500.00</span>
                </div>
                <div className="flex justify-between p-2.5 bg-zinc-50 rounded-xl border border-zinc-200">
                  <span className="text-zinc-500">Elektrik TNB (3-Phase Kompresor):</span>
                  <span className="font-bold ">RM 420.00</span>
                </div>
                <div className="flex justify-between p-2.5 bg-zinc-50 rounded-xl border border-zinc-200">
                  <span className="text-zinc-500">Air SAJ (Cuci Motor):</span>
                  <span className="font-bold ">RM 65.00</span>
                </div>
                <div className="flex justify-between p-2.5 bg-zinc-50 rounded-xl border border-zinc-200">
                  <span className="text-zinc-500">Unifi Biz 300Mbps:</span>
                  <span className="font-bold ">RM 189.00</span>
                </div>
                <div className="flex justify-between p-2.5 bg-zinc-50 rounded-xl border border-zinc-200">
                  <span className="text-zinc-500">Petty Cash Runner & Petrol:</span>
                  <span className="font-bold ">RM 110.00</span>
                </div>
                <div className="flex justify-between p-3 bg-red-50 rounded-xl border border-red-200 font-black text-red-700">
                  <span>JUMLAH OVERHEAD BULANAN:</span>
                  <span>RM 4,284.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kandungan Sub-Tab: Padanan Pindahan Bank & DuitNow QR (Ala Johan30 finance.vue) */}
      {activeSubTab === "bank" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  Padanan Pindahan Bank & DuitNow QR (*Bank Transfer Matching*)
                </h3>
                <p className="text-xs text-zinc-500">
                  Sahkan resit pemindahan yang dihantar pelanggan sebelum status ditandakan sah sepenuhnya.
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-bold">
                Maybank Berhad (5128 4492 1092)
              </span>
            </div>

            <div className="divide-y divide-zinc-200/80 text-xs">
              {[
                { id: "tr_1", ref: "QR-2026-0841", customer: "Mohd Akmal (VDF 8899)", amount: 130.0, time: "11:15 AM", status: "matched" },
                { id: "tr_2", ref: "FPX-99410294", customer: "Faizal Roslan (BRA 4321)", amount: 85.0, time: "10:45 AM", status: "pending" },
                { id: "tr_3", ref: "DUITNOW-0091", customer: "Syed Danial (JQL 1928)", amount: 45.0, time: "09:20 AM", status: "pending" },
              ].map((tr) => (
                <div key={tr.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-brand-400">{tr.ref}</span>
                      <span className="font-bold ">{tr.customer}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          tr.status === "matched"
                            ? "bg-emerald-50 text-emerald-400"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {tr.status === "matched" ? "Disahkan Dalam Bank" : "Menunggu Padanan"}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-500 font-mono">Masa Transaksi: {tr.time}</span>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="font-mono text-sm font-black ">RM {tr.amount.toFixed(2)}</span>
                    {tr.status === "pending" ? (
                      <button
                        type="button"
                        onClick={() => alert(`Transaksi ${tr.ref} berjaya dipadankan dengan penyata bank!`)}
                        className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Sahkan Padanan</span>
                      </button>
                    ) : (
                      <span className="text-emerald-400 font-mono text-xs font-bold">✓ Tally</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lejar Pembayaran Pukal Pembekal OEM */}
          <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-zinc-900">Lejar Pindahan Pukal Pembekal OEM</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                <span className="text-zinc-500 font-semibold block">Hong Leong Yamaha</span>
                <span className="font-mono font-bold text-base block">RM 2,150.00</span>
                <span className="text-[10px] text-emerald-400 font-mono">Status: Selesai Pindahan</span>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                <span className="text-zinc-500 font-semibold block">Boon Siew Honda</span>
                <span className="font-mono font-bold text-base block">RM 1,840.00</span>
                <span className="text-[10px] text-red-600 font-mono">Status: Menunggu Sign-off</span>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                <span className="text-zinc-500 font-semibold block">Racing Boy Malaysia</span>
                <span className="font-mono font-bold text-base block">RM 920.00</span>
                <span className="text-[10px] text-emerald-400 font-mono">Status: Selesai Pindahan</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kandungan Sub-Tab 3: Unjuran Aliran Tunai 30 Hari (Ala Unjuran Johan30) */}
      {activeSubTab === "forecast" && (
        <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm space-y-4">
          <div className="pb-3 border-b border-zinc-200">
            <h3 className="text-sm font-bold text-zinc-900">Unjuran Pendapatan Servis & Alat Ganti (Predictive Cashflow)</h3>
            <p className="text-xs text-zinc-500">
              Unjuran aliran tunai masuk 30 hari berasaskan algoritma kilometer motosikal pelanggan berdaftar
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-4">
              <span className="text-xs font-semibold text-zinc-500">Minggu 1 (7 Hari Akan Datang)</span>
              <h4 className="font-mono text-xl font-bold text-emerald-400 mt-1">RM 4,250.00</h4>
              <p className="text-[11px] text-zinc-500 mt-1">14 motor dijangka sampai had perbatuan servis</p>
            </div>

            <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-4">
              <span className="text-xs font-semibold text-zinc-500">Minggu 2 - 4 (30 Hari)</span>
              <h4 className="font-mono text-xl font-bold text-zinc-700 mt-1">RM 18,900.00</h4>
              <p className="text-[11px] text-zinc-500 mt-1">Termasuk 8 penukaran belting CVT & tayar</p>
            </div>

            <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-4">
              <span className="text-xs font-semibold text-zinc-500">Cadangan Belian Modal Stok</span>
              <h4 className="font-mono text-xl font-bold text-red-600 mt-1">RM 6,500.00</h4>
              <p className="text-[11px] text-zinc-500 mt-1">Modal pusingan PO pembekal yang diperlukan</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

