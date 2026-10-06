import React, { useState, useEffect } from "react";
import {
  Bike,
  Plus,
  Calculator,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  User,
  Phone,
  FileText,
  DollarSign,
  ShieldCheck
} from "lucide-react";
import { Motorcycle } from "../types";

interface LoanApp {
  id: string;
  appNumber: string;
  motorcycleId: string;
  customerName: string;
  customerPhone: string;
  customerIc: string;
  salaryMonthly: number;
  depositAmount: number;
  loanAmount: number;
  loanTermMonths: number;
  monthlyInstallment: number;
  loanProvider: string;
  stage: "prospect" | "docs_collected" | "submitted" | "approved" | "jpj_registered" | "delivered" | "rejected";
  brand: string;
  model: string;
  color?: string;
  sellingPrice: number;
  salespersonName?: string;
}

interface LoanPipelineProps {
  motorcycles: Motorcycle[];
  onRefresh?: () => void;
}

export const LoanPipeline: React.FC<LoanPipelineProps> = ({ motorcycles, onRefresh }) => {
  const [apps, setApps] = useState<LoanApp[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculator State
  const [calcPrice, setCalcPrice] = useState(9688);
  const [calcDeposit, setCalcDeposit] = useState(1000);
  const [calcTerm, setCalcTerm] = useState(36);
  const [calcRate, setCalcRate] = useState(8.5);
  const [calcResult, setCalcResult] = useState<any>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedMotoId, setSelectedMotoId] = useState("");
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custIc, setCustIc] = useState("");
  const [custSalary, setCustSalary] = useState(2800);
  const [custDeposit, setCustDeposit] = useState(1000);
  const [custTerm, setCustTerm] = useState(36);
  const [loanProvider, setLoanProvider] = useState("AEON Credit Service");
  const [submitting, setSubmitting] = useState(false);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/loan-pipeline");
      const d = await res.json();
      if (d.success && Array.isArray(d.applications)) {
        setApps(d.applications);
      }
    } catch (err) {
      console.error("Gagal memuat permohonan pinjaman:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
    runCalculator();
  }, []);

  const runCalculator = async () => {
    try {
      const principal = Math.max(0, calcPrice - calcDeposit);
      const tenureYears = calcTerm / 12;
      const totalInterest = principal * (calcRate / 100) * tenureYears;
      const totalPayable = principal + totalInterest;
      const monthlyInstallment = totalPayable / calcTerm;

      setCalcResult({
        price: calcPrice,
        deposit: calcDeposit,
        loanAmount: principal,
        annualRatePercent: calcRate,
        termMonths: calcTerm,
        totalInterest,
        totalPayable,
        monthlyInstallment
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMotoId || !custName || !custPhone) {
      alert("Sila lengkapkan maklumat pembeli dan motosikal.");
      return;
    }

    const moto = motorcycles.find((m) => m.id === selectedMotoId);
    const loanAmount = Math.max(0, (moto?.sellingPrice || 8000) - custDeposit);

    try {
      setSubmitting(true);
      const res = await fetch("/api/loan-pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motorcycleId: selectedMotoId,
          customerName: custName,
          customerPhone: custPhone,
          customerIc: custIc,
          salaryMonthly: custSalary,
          depositAmount: custDeposit,
          loanAmount,
          loanTermMonths: custTerm,
          loanProvider,
        }),
      });
      const d = await res.json();
      if (d.success) {
        alert("Permohonan pinjaman berjaya didaftarkan ke pipeline jualan!");
        setShowModal(false);
        await fetchApps();
        onRefresh?.();
      }
    } catch (err) {
      alert("Ralat: " + err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdvanceStage = async (id: string, currentStage: LoanApp["stage"]) => {
    const stageSequence: LoanApp["stage"][] = [
      "prospect",
      "docs_collected",
      "submitted",
      "approved",
      "jpj_registered",
      "delivered",
    ];
    const currentIndex = stageSequence.indexOf(currentStage);
    if (currentIndex < 0 || currentIndex >= stageSequence.length - 1) return;

    const nextStage = stageSequence[currentIndex + 1];
    try {
      const res = await fetch(`/api/loan-pipeline/${id}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: nextStage }),
      });
      const d = await res.json();
      if (d.success) {
        await fetchApps();
        onRefresh?.();
      }
    } catch (err) {
      alert("Ralat kemaskini fasa: " + err);
    }
  };

  const stages = [
    { id: "prospect", label: "1. Prospek / Minat", color: "border-zinc-300 bg-white/50" },
    { id: "docs_collected", label: "2. Kumpul Slip Gaji", color: "border-zinc-300 bg-blue-950/10" },
    { id: "submitted", label: "3. Hantar Loan Kredit", color: "border-red-200 bg-amber-950/10" },
    { id: "approved", label: "4. Lulus Pinjaman", color: "border-emerald-200 bg-emerald-950/10" },
    { id: "jpj_registered", label: "5. Daftar No JPJ", color: "border-zinc-300 bg-purple-950/10" },
    { id: "delivered", label: "6. Serah Kunci Selesai", color: "border-brand-500/30 bg-brand-950/10" },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold">
            <span>FFmotor HQ</span>
            <span>/</span>
            <span className="text-brand-400 font-bold">Saluran Jualan & Pinjaman</span>
          </nav>
          <h1 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tight mt-1 flex items-center gap-2">
            <Bike className="w-6 h-6 text-brand-400" />
            <span>Saluran Pinjaman Kredit (*Loan Pipeline*) & Ansuran</span>
          </h1>
          <p className="text-xs text-zinc-500">
            Penjejakan 6 fasa pinjaman sewa beli (AEON Credit, Chailease, Parkson) dan kalkulator ansuran bulanan segera.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-black transition shadow-lg shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Daftar Permohonan Pinjaman</span>
          </button>
        </div>
      </div>

      {/* SEKSYEN 1: KANBAN 6 FASA PINJAMAN */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
            <span>1. Papan Aliran 6 Fasa Pinjaman (Kanban)</span>
          </h3>
          <span className="text-xs text-zinc-500 font-mono">Jumlah Permohonan: {apps.length} Kes</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 items-start overflow-x-auto pb-4">
          {stages.map((st) => {
            const stageApps = apps.filter((a) => a.stage === st.id);
            return (
              <div
                key={st.id}
                className={`rounded-2xl border ${st.color} p-3.5 flex flex-col min-h-[460px] space-y-3`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                  <span className="text-[11px] font-extrabold tracking-tight">{st.label}</span>
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                    {stageApps.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {stageApps.map((app) => (
                    <div
                      key={app.id}
                      className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition shadow-sm space-y-2 text-xs"
                    >
                      <div>
                        <span className="font-mono text-[10px] font-black text-brand-400 block">
                          {app.appNumber}
                        </span>
                        <h4 className="font-bold text-zinc-900 text-xs">{app.customerName}</h4>
                        <span className="text-[11px] text-zinc-500 font-medium block">
                          {app.brand} {app.model}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-white border border-zinc-200/80 text-[11px] space-y-1">
                        <div className="flex justify-between text-zinc-500">
                          <span>Pembiaya:</span>
                          <span className="font-bold text-zinc-700">{app.loanProvider}</span>
                        </div>
                        <div className="flex justify-between text-zinc-500">
                          <span>Deposit:</span>
                          <span className="font-bold text-emerald-400">RM {app.depositAmount}</span>
                        </div>
                        <div className="flex justify-between text-zinc-500">
                          <span>Ansuran:</span>
                          <span className="font-bold text-red-600 font-mono">
                            RM {app.monthlyInstallment.toFixed(2)}/bln
                          </span>
                        </div>
                      </div>

                      {st.id !== "delivered" && (
                        <button
                          onClick={() => handleAdvanceStage(app.id, app.stage)}
                          className="w-full py-1.5 rounded-lg bg-zinc-100 hover:bg-brand-600 hover:text-white text-zinc-600 text-[10px] font-bold transition flex items-center justify-center gap-1 border border-zinc-300"
                        >
                          <span>Fasa Seterusnya</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SEKSYEN 2: KALKULATOR ANSURAN BULANAN (AEON / CHAILEASE) */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-brand-400" />
            <span>2. Kalkulator Skim Ansuran Motosikal (AEON / Chailease)</span>
          </h3>
          <span className="text-xs text-zinc-500 font-mono">Pengiraan Segera Bayaran Bulanan & Kelayakan Gaji</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-12 items-start">
          <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-none lg:col-span-6 space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2 pb-2 border-b border-zinc-200">
              <Calculator className="w-4 h-4 text-brand-400" />
              <span>Kalkulator Skim Ansuran Motosikal</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-500 font-semibold block mb-1">Harga Atas Jalan (OTR):</label>
                <input
                  type="number"
                  value={calcPrice}
                  onChange={(e) => {
                    setCalcPrice(Number(e.target.value));
                  }}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-500 font-semibold block mb-1">Wang Pendahuluan (Deposit):</label>
                  <input
                    type="number"
                    value={calcDeposit}
                    onChange={(e) => setCalcDeposit(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 font-semibold block mb-1">Kadar Faedah Setahun (%):</label>
                  <select
                    value={calcRate}
                    onChange={(e) => setCalcRate(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 text-zinc-900 font-mono font-bold"
                  >
                    <option value={3.5}>Aeon Credit (3.5%)</option>
                    <option value={3.8}>Chailease (3.8%)</option>
                    <option value={3.2}>Parkson Credit (3.2%)</option>
                    <option value={3.0}>RHB (3.0%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-500 font-semibold block mb-1">Tempoh Pinjaman:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[12, 24, 36, 48].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setCalcTerm(m)}
                      className={`py-2 rounded-xl text-xs font-bold font-mono transition border ${
                        calcTerm === m
                          ? "bg-brand-500 border-brand-400"
                          : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-red-600"
                      }`}
                    >
                      {m} Bln ({m / 12} Thn)
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={runCalculator}
                className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition shadow-xs mt-2"
              >
                Kira Semula Ansuran
              </button>
            </div>
          </div>

          {/* Keputusan Kiraan Ansuran */}
          <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-none lg:col-span-6 space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 pb-2 border-b border-zinc-200">
              Jadual Anggaran Bayaran Bulanan
            </h3>

            {calcResult ? (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white border-2 border-zinc-200 text-center space-y-1 shadow-sm">
                  <span className="text-xs text-zinc-600 font-bold">Anggaran Ansuran Bulanan:</span>
                  <h2 className="text-3xl font-black text-emerald-600 font-mono">
                    RM {calcResult.monthlyInstallment.toFixed(2)}
                    <span className="text-xs text-zinc-500 font-bold"> / bulan</span>
                  </h2>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    Bagi tempoh {calcResult.termMonths} bulan ({calcResult.termMonths / 12} tahun)
                  </p>
                </div>

                <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-200 text-xs font-mono space-y-2">
                  <div className="flex justify-between text-zinc-500">
                    <span>Harga Motosikal:</span>
                    <span className="text-zinc-900">RM {calcResult.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Deposit Dibayar:</span>
                    <span className="text-emerald-500">- RM {calcResult.deposit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500 border-t border-zinc-200 pt-2">
                    <span>Jumlah Pinjaman Asas:</span>
                    <span className="text-zinc-900 font-bold">RM {calcResult.loanAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Jumlah Faedah ({calcResult.annualRatePercent}% setahun):</span>
                    <span className="text-red-600">RM {calcResult.totalInterest.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t border-zinc-200 pt-2 text-zinc-900">
                    <span>Jumlah Perlu Dibayar:</span>
                    <span className="text-red-600">RM {calcResult.totalPayable.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-zinc-500">
                Memuat data kiraan...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DAFTAR PERMOHONAN BAHARU */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-zinc-50/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 max-w-lg w-full shadow-none space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Bike className="w-4 h-4 text-brand-400" />
                <span>Daftar Permohonan Pinjaman Motosikal</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-red-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateApp} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-500 font-semibold block mb-1">Pilih Motosikal Showroom:</label>
                <select
                  value={selectedMotoId}
                  onChange={(e) => setSelectedMotoId(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 font-medium"
                  required
                >
                  <option value="">-- Pilih Model --</option>
                  {motorcycles.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.brand} {m.model} ({m.color}) - RM {m.sellingPrice.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-500 font-semibold block mb-1">Nama Pembeli:</label>
                <input
                  type="text"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="Nama penuh mengikut kad pengenalan"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-500 font-semibold block mb-1">No Telefon WhatsApp:</label>
                  <input
                    type="text"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="0123456789"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-zinc-500 font-semibold block mb-1">No IC:</label>
                  <input
                    type="text"
                    value={custIc}
                    onChange={(e) => setCustIc(e.target.value)}
                    placeholder="990101-14-1234"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-zinc-500 font-semibold block mb-1">Gaji Kasar (RM):</label>
                  <input
                    type="number"
                    value={custSalary}
                    onChange={(e) => setCustSalary(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 font-semibold block mb-1">Deposit (RM):</label>
                  <input
                    type="number"
                    value={custDeposit}
                    onChange={(e) => setCustDeposit(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 font-semibold block mb-1">Tempoh:</label>
                  <select
                    value={custTerm}
                    onChange={(e) => setCustTerm(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 font-medium"
                  >
                    <option value={12}>12 Bulan</option>
                    <option value={24}>24 Bulan</option>
                    <option value={36}>36 Bulan</option>
                    <option value={48}>48 Bulan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-500 font-semibold block mb-1">Syarikat Kredit Pinjaman:</label>
                <select
                  value={loanProvider}
                  onChange={(e) => setLoanProvider(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 font-medium"
                >
                  <option value="AEON Credit Service">AEON Credit Service</option>
                  <option value="Chailease Berjaya Credit">Chailease Berjaya Credit</option>
                  <option value="Parkson Credit">Parkson Credit</option>
                  <option value="JCL Credit Leasing">JCL Credit Leasing</option>
                </select>
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
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{submitting ? "Mendaftar..." : "Daftar Permohonan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

