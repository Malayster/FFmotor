import React, { useState, useEffect } from "react";
import {
  Bike,
  Plus,
  Calculator,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  User,
  Phone,
  FileText,
  DollarSign,
  ShieldCheck,
  X,
  RefreshCw,
  MessageSquare,
  Send,
  Ban,
  Search,
  Check
} from "lucide-react";
import { Motorcycle } from "../types";
import { fetchApi } from "../lib/api";

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
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

interface LoanPipelineProps {
  motorcycles: Motorcycle[];
  onRefresh?: () => void;
}

const STAGES = [
  { id: "prospect", label: "1. Prospek / Minat", desc: "Pelanggan bertanya minat beli motor" },
  { id: "docs_collected", label: "2. Kumpul Dokumen", desc: "Slip gaji 3 bln, bank, IC" },
  { id: "submitted", label: "3. Hantar Kredit", desc: "Dalam semakan syarikat pinjaman" },
  { id: "approved", label: "4. Lulus Pinjaman", desc: "Pinjaman diluluskan, sedia akad" },
  { id: "jpj_registered", label: "5. Daftar No JPJ", desc: "Geran & pendaftaran nombor plat" },
  { id: "delivered", label: "6. Serah Kunci Siap", desc: "Motosikal diserahkan kepada pembeli" },
  { id: "rejected", label: "Ditolak / Batal", desc: "Permohonan tidak lulus atau dibatalkan" },
];

export const LoanPipeline: React.FC<LoanPipelineProps> = ({ motorcycles, onRefresh }) => {
  const [apps, setApps] = useState<LoanApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>("all");

  // Calculator State
  const [calcPrice, setCalcPrice] = useState(8800);
  const [calcDeposit, setCalcDeposit] = useState(1000);
  const [calcTerm, setCalcTerm] = useState(36);
  const [calcRate, setCalcRate] = useState(8.5);
  const [calcResult, setCalcResult] = useState<any>(null);

  // Modal Tambah Permohonan State
  const [showModal, setShowModal] = useState(false);
  const [selectedMotoId, setSelectedMotoId] = useState("");
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custIc, setCustIc] = useState("");
  const [custSalary, setCustSalary] = useState(2500);
  const [custDeposit, setCustDeposit] = useState(1000);
  const [custTerm, setCustTerm] = useState(36);
  const [loanProvider, setLoanProvider] = useState("AEON Credit Service");
  const [notesInput, setNotesInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Modal Kemaskini Fasa / Catatan State
  const [activeAppForAction, setActiveAppForAction] = useState<LoanApp | null>(null);
  const [actionStage, setActionStage] = useState<string>("");
  const [actionNotes, setActionNotes] = useState<string>("");
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const res = await fetchApi<{ success: boolean; applications: LoanApp[] }>("/loan-pipeline");
      if (res && res.success && Array.isArray(res.applications)) {
        setApps(res.applications);
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

  const runCalculator = () => {
    const principal = Math.max(0, calcPrice - calcDeposit);
    const tenureYears = calcTerm / 12;
    const totalInterest = principal * (calcRate / 100) * tenureYears;
    const totalPayable = principal + totalInterest;
    const monthlyInstallment = calcTerm > 0 ? totalPayable / calcTerm : 0;

    setCalcResult({
      price: calcPrice,
      deposit: calcDeposit,
      loanAmount: principal,
      annualRatePercent: calcRate,
      termMonths: calcTerm,
      totalInterest,
      totalPayable,
      monthlyInstallment,
    });
  };

  // Kiraan segera semasa mengisi borang permohonan
  const getModalCalc = () => {
    const moto = motorcycles.find((m) => m.id === selectedMotoId);
    const price = moto ? moto.sellingPrice : 8000;
    const principal = Math.max(0, price - custDeposit);
    const tenureYears = custTerm / 12;
    const rate = 8.5; // Anggaran piawai kredit motosikal
    const totalInterest = principal * (rate / 100) * tenureYears;
    const totalPayable = principal + totalInterest;
    const monthly = custTerm > 0 ? Math.round((totalPayable / custTerm) * 100) / 100 : 0;
    return { price, principal, monthly };
  };

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMotoId || !custName || !custPhone) {
      alert("Sila lengkapkan maklumat pembeli dan motosikal pilihan.");
      return;
    }

    const { principal } = getModalCalc();

    try {
      setSubmitting(true);
      const res = await fetchApi<{ success: boolean; message?: string }>("/loan-pipeline", {
        method: "POST",
        body: JSON.stringify({
          motorcycleId: selectedMotoId,
          customerName: custName.trim(),
          customerPhone: custPhone.trim(),
          customerIc: custIc.trim() || "000000-00-0000",
          salaryMonthly: custSalary,
          depositAmount: custDeposit,
          loanAmount: principal,
          loanTermMonths: custTerm,
          loanProvider,
          notes: notesInput.trim() || "Permohonan baru kaunter",
        }),
      });

      if (res && res.success) {
        alert("Permohonan pinjaman berjaya didaftarkan ke saluran kaunter!");
        setShowModal(false);
        // Reset form
        setSelectedMotoId("");
        setCustName("");
        setCustPhone("");
        setCustIc("");
        setCustSalary(2500);
        setCustDeposit(1000);
        setCustTerm(36);
        setNotesInput("");
        await fetchApps();
        onRefresh?.();
      }
    } catch (err: any) {
      alert("Ralat mendaftar permohonan: " + (err.message || err));
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
      const res = await fetchApi<{ success: boolean }>(`/loan-pipeline/${id}/stage`, {
        method: "PATCH",
        body: JSON.stringify({ stage: nextStage }),
      });
      if (res && res.success) {
        await fetchApps();
        onRefresh?.();
      }
    } catch (err: any) {
      alert("Ralat memajukan fasa: " + (err.message || err));
    }
  };

  const handleUpdateStageAndNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAppForAction) return;

    try {
      setSubmittingAction(true);
      const res = await fetchApi<{ success: boolean }>(`/loan-pipeline/${activeAppForAction.id}/stage`, {
        method: "PATCH",
        body: JSON.stringify({
          stage: actionStage,
          notes: actionNotes.trim(),
        }),
      });

      if (res && res.success) {
        setActiveAppForAction(null);
        await fetchApps();
        onRefresh?.();
      }
    } catch (err: any) {
      alert("Ralat kemaskini fasa: " + (err.message || err));
    } finally {
      setSubmittingAction(false);
    }
  };

  const openWhatsApp = (app: LoanApp, templateType: "docs" | "review" | "approved" | "jpj" | "delivered" | "rejected") => {
    const digits = app.customerPhone.replace(/\D/g, "");
    const wa = digits.startsWith("0") ? `6${digits}` : digits;

    let text = "";
    if (templateType === "docs") {
      text =
        `Salam hormat ${app.customerName},\n\n` +
        `Terima kasih atas minat anda bagi pembelian motosikal *${app.brand} ${app.model}* di *FFmotor*.\n\n` +
        `Bagi memproses permohonan pinjaman melalui *${app.loanProvider}*, mohon hantarkan dokumen berikut:\n` +
        `1. Salinan Kad Pengenalan (Depan & Belakang)\n` +
        `2. Slip Gaji 3 Bulan Terkini\n` +
        `3. Penyata Bank 3 Bulan Terkini\n` +
        `4. Penyata KWSP terkini (jika ada)\n\n` +
        `Sila hantarkan gambar atau fail PDF ke nombor ini agar kami dapat memproses permohonan anda secepat mungkin. Terima kasih!\n` +
        `- Kerani 1 Kaunter FFmotor`;
    } else if (templateType === "review") {
      text =
        `Salam hormat ${app.customerName},\n\n` +
        `Permohonan pinjaman motosikal *${app.brand} ${app.model}* (No Ruj: *${app.appNumber}*) telah kami serahkan kepada *${app.loanProvider}* untuk penilaian kredit.\n\n` +
        `Pihak pembiaya mungkin akan membuat panggilan pengesahan kepada anda. Kami akan terus memaklumkan keputusan status kelulusan sebaik diterima. Terima kasih!\n` +
        `- Kerani 1 Kaunter FFmotor`;
    } else if (templateType === "approved") {
      text =
        `Salam hormat ${app.customerName},\n\n` +
        `TAHNIAH! Permohonan pinjaman motosikal *${app.brand} ${app.model}* anda telah *DILULUSKAN* oleh *${app.loanProvider}*!\n\n` +
        `• No Rujukan: *${app.appNumber}*\n` +
        `• Deposit: *RM ${app.depositAmount.toFixed(2)}*\n` +
        `• Jumlah Pinjaman: *RM ${app.loanAmount.toFixed(2)}*\n` +
        `• Anggaran Ansuran: *RM ${app.monthlyInstallment.toFixed(2)}/bulan* (${app.loanTermMonths} bulan)\n\n` +
        `Sila hadir ke kaunter FFmotor untuk urusan akad perjanjian dan bayaran deposit bagi proses pendaftaran JPJ. Terima kasih!\n` +
        `- Kerani 1 Kaunter FFmotor`;
    } else if (templateType === "jpj") {
      text =
        `Salam hormat ${app.customerName},\n\n` +
        `Pendaftaran nombor plat JPJ motosikal *${app.brand} ${app.model}* anda sedang siap diproses. Unit anda kini dipindahkan ke seksyen prapemeriksaan akhir sebelum serahan kunci. Terima kasih!\n` +
        `- Kerani 1 Kaunter FFmotor`;
    } else if (templateType === "delivered") {
      text =
        `Salam hormat ${app.customerName},\n\n` +
        `Motosikal *${app.brand} ${app.model}* anda sedia diambil di showroom FFmotor! Sila bawa kad pengenalan asal semasa mengambil kunci. Terima kasih kerana memilih FFmotor!\n` +
        `- Kerani 1 Kaunter FFmotor`;
    } else if (templateType === "rejected") {
      text =
        `Salam hormat ${app.customerName},\n\n` +
        `Dukacita dimaklumkan bahawa permohonan pinjaman motosikal *${app.brand} ${app.model}* (Ruj: *${app.appNumber}*) tidak berjaya diluluskan oleh *${app.loanProvider}*.\n\n` +
        `Jika anda ingin mencuba syarikat pembiaya lain atau menambah penjamin, sila hubungi kami di kaunter FFmotor. Terima kasih.\n` +
        `- Kerani 1 Kaunter FFmotor`;
    }

    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const filteredApps = apps.filter((a) => {
    const matchesStage = selectedStageFilter === "all" || a.stage === selectedStageFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      a.customerName.toLowerCase().includes(q) ||
      a.customerPhone.includes(q) ||
      a.appNumber.toLowerCase().includes(q) ||
      a.brand.toLowerCase().includes(q) ||
      a.model.toLowerCase().includes(q) ||
      a.loanProvider.toLowerCase().includes(q);
    return matchesStage && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* 1. Header & Kawalan Utama Kaunter */}
      <div className="bg-white border-2 border-zinc-950 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-black text-red-600 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span className="tracking-wider uppercase">Tugasan Kaunter Hadapan (Kerani 1)</span>
            <span className="text-zinc-950 font-bold">•</span>
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-950 text-white uppercase text-[10px] font-black">
              PIN: 3344
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight flex items-center gap-2.5">
            <Bike className="w-7 h-7 text-red-600 shrink-0" />
            <span>Saluran Permohonan Pinjaman Motosikal (Loan Pipeline)</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-800 mt-1 font-bold">
            Urus pendaftaran pemohon, kutipan slip gaji, penyerahan kredit (AEON, Chailease, Parkson, JCL, ELK), dan mesej WhatsApp pelanggan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={fetchApps}
            className="px-3.5 py-2.5 rounded-xl border-2 border-zinc-950 bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-black transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Segar Semula Senarai"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Segar</span>
          </button>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>+ Daftar Permohonan Pinjaman</span>
          </button>
        </div>
      </div>

      {/* 2. Ringkasan Pantas Fasa Pinjaman */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {STAGES.map((st) => {
          const count = apps.filter((a) => a.stage === st.id).length;
          const isSelected = selectedStageFilter === st.id;
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => setSelectedStageFilter(isSelected ? "all" : st.id)}
              className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer ${
                isSelected
                  ? "bg-zinc-950 text-white border-zinc-950 shadow-md"
                  : "bg-white text-zinc-950 border-zinc-200 hover:border-zinc-950"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`text-[10px] font-black uppercase font-mono truncate ${isSelected ? "text-zinc-300" : "text-zinc-800"}`}>
                  {st.label.split(". ")[1] || st.label}
                </span>
                <span
                  className={`text-xs font-black font-mono px-1.5 py-0.5 rounded ${
                    isSelected ? "bg-red-600 text-white" : "bg-zinc-100 text-zinc-950 border border-zinc-300"
                  }`}
                >
                  {count}
                </span>
              </div>
              <p className={`text-base font-black font-mono ${st.id === "rejected" ? "text-red-600" : isSelected ? "text-emerald-400" : "text-zinc-950"}`}>
                {count} Kes
              </p>
            </button>
          );
        })}
      </div>

      {/* 3. Bar Carian & Penapis Fasa */}
      <div className="bg-white border-2 border-zinc-950 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-800 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama pemohon, no IC, nombor telefon, no permohonan, atau model motor..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border-2 border-zinc-200 rounded-xl text-xs font-bold text-zinc-950 placeholder:text-zinc-800 focus:outline-none focus:border-zinc-950"
          />
        </div>

        <div className="flex items-center gap-2">
          {selectedStageFilter !== "all" && (
            <button
              type="button"
              onClick={() => setSelectedStageFilter("all")}
              className="px-3 py-1.5 rounded-xl bg-red-100 text-red-800 border-2 border-red-300 text-xs font-black hover:bg-red-200 cursor-pointer"
            >
              Kosongkan Penapis Fasa (Papar Semua)
            </button>
          )}
          <span className="text-xs font-mono font-black text-zinc-950 px-3 py-1.5 bg-zinc-100 border-2 border-zinc-200 rounded-xl">
            {filteredApps.length} daripada {apps.length} Permohonan
          </span>
        </div>
      </div>

      {/* 4. Paparan Papan Fasa (Kanban & Senarai Kad Pinjaman) */}
      <div className="space-y-4">
        {filteredApps.length === 0 ? (
          <div className="bg-white border-2 border-zinc-200 rounded-3xl p-12 text-center space-y-3">
            <Bike className="w-12 h-12 text-zinc-800 mx-auto" />
            <h3 className="text-base font-black text-zinc-950">Tiada Permohonan Pinjaman Dijumpai</h3>
            <p className="text-xs text-zinc-800 font-bold max-w-md mx-auto">
              {searchQuery || selectedStageFilter !== "all"
                ? "Tiada rekod yang sepadan dengan carian atau penapis fasa semasa."
                : "Belum ada rekod pinjaman didaftarkan. Klik butang '+ Daftar Permohonan Pinjaman' di atas untuk mulakan."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredApps.map((app) => {
              const currentStageObj = STAGES.find((s) => s.id === app.stage) || { label: app.stage };
              const isRejected = app.stage === "rejected";
              const isDelivered = app.stage === "delivered";

              return (
                <div
                  key={app.id}
                  className={`bg-white border-2 rounded-3xl p-5 shadow-sm space-y-3 flex flex-col justify-between transition-all ${
                    isRejected
                      ? "border-red-300 bg-red-50/20"
                      : isDelivered
                      ? "border-emerald-300 bg-emerald-50/20"
                      : "border-zinc-950 hover:shadow-md"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header Kad */}
                    <div className="flex items-start justify-between gap-2 border-b-2 border-zinc-100 pb-2.5">
                      <div>
                        <span className="font-mono text-[11px] font-black text-red-600 block">
                          {app.appNumber}
                        </span>
                        <h3 className="text-base font-black text-zinc-950 leading-tight">
                          {app.customerName}
                        </h3>
                        <p className="text-xs text-zinc-800 font-bold font-mono">
                          IC: {app.customerIc} · Tel: {app.customerPhone}
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-black uppercase font-mono px-2 py-1 rounded-lg border-2 shrink-0 ${
                          isRejected
                            ? "bg-red-600 text-white border-red-600"
                            : isDelivered
                            ? "bg-emerald-100 text-emerald-900 border-emerald-400"
                            : app.stage === "approved"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-400"
                            : "bg-zinc-100 text-zinc-950 border-zinc-950"
                        }`}
                      >
                        {currentStageObj.label}
                      </span>
                    </div>

                    {/* Maklumat Motosikal & Kewangan */}
                    <div className="bg-zinc-50 border-2 border-zinc-200 rounded-2xl p-3 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-zinc-800">Motosikal:</span>
                        <span className="text-zinc-950 font-black">
                          {app.brand} {app.model} {app.color ? `(${app.color})` : ""}
                        </span>
                      </div>
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-zinc-800">Institusi Pembiaya:</span>
                        <span className="text-zinc-950 font-black">{app.loanProvider}</span>
                      </div>
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-zinc-800">Harga OTR / Deposit:</span>
                        <span className="font-mono text-zinc-950">
                          RM {app.sellingPrice?.toFixed(2) || "0.00"} / <span className="text-emerald-800 font-black">RM {app.depositAmount.toFixed(2)}</span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center font-bold pt-1.5 border-t border-zinc-200">
                        <span className="text-zinc-800">Ansuran Bulanan:</span>
                        <span className="text-sm font-black font-mono text-red-600">
                          RM {app.monthlyInstallment.toFixed(2)}/bln
                        </span>
                      </div>
                      <div className="flex justify-between items-center font-bold text-[11px] text-zinc-800">
                        <span>Tempoh & Gaji Pemohon:</span>
                        <span className="font-mono">
                          {app.loanTermMonths} bln · Gaji: RM {app.salaryMonthly.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Catatan Kerani jika ada */}
                    {app.notes && (
                      <p className="text-[11px] text-zinc-800 font-bold bg-zinc-100 p-2.5 rounded-xl border border-zinc-300">
                        <span className="font-black text-zinc-950">Catatan:</span> {app.notes}
                      </p>
                    )}
                  </div>

                  {/* Tindakan Kerani 1: WhatsApp Pantas & Kawalan Fasa */}
                  <div className="space-y-2 pt-3 border-t-2 border-zinc-100">
                    {/* Butang WhatsApp Pantas */}
                    <div className="flex items-center gap-1.5">
                      {app.stage === "prospect" || app.stage === "docs_collected" ? (
                        <button
                          type="button"
                          onClick={() => openWhatsApp(app, "docs")}
                          className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-2 border-emerald-400 text-[11px] font-black transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                          title="Hantar senarai semak dokumen ke WhatsApp"
                        >
                          <Send className="w-3.5 h-3.5 text-emerald-800" />
                          <span>WhatsApp Minta Dokumen</span>
                        </button>
                      ) : app.stage === "submitted" ? (
                        <button
                          type="button"
                          onClick={() => openWhatsApp(app, "review")}
                          className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-2 border-emerald-400 text-[11px] font-black transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5 text-emerald-800" />
                          <span>WhatsApp Maklum Semakan</span>
                        </button>
                      ) : app.stage === "approved" ? (
                        <button
                          type="button"
                          onClick={() => openWhatsApp(app, "approved")}
                          className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-2 border-emerald-400 text-[11px] font-black transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5 text-emerald-800" />
                          <span>WhatsApp Maklum Lulus!</span>
                        </button>
                      ) : app.stage === "jpj_registered" ? (
                        <button
                          type="button"
                          onClick={() => openWhatsApp(app, "jpj")}
                          className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-2 border-emerald-400 text-[11px] font-black transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5 text-emerald-800" />
                          <span>WhatsApp No JPJ Siap</span>
                        </button>
                      ) : app.stage === "delivered" ? (
                        <button
                          type="button"
                          onClick={() => openWhatsApp(app, "delivered")}
                          className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-2 border-emerald-400 text-[11px] font-black transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5 text-emerald-800" />
                          <span>WhatsApp Resit & Kunci</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openWhatsApp(app, "rejected")}
                          className="flex-1 py-1.5 px-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-950 border-2 border-zinc-300 text-[11px] font-black transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>WhatsApp Maklum Keputusan</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setActiveAppForAction(app);
                          setActionStage(app.stage);
                          setActionNotes(app.notes || "");
                        }}
                        className="p-1.5 rounded-xl border-2 border-zinc-950 bg-white hover:bg-zinc-100 text-zinc-950 text-[11px] font-black cursor-pointer active:scale-95"
                        title="Tukar Fasa / Edit Catatan"
                      >
                        Ubah
                      </button>
                    </div>

                    {/* Butang Fasa Seterusnya Pantas */}
                    {!isDelivered && !isRejected && (
                      <button
                        type="button"
                        onClick={() => handleAdvanceStage(app.id, app.stage)}
                        className="w-full py-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <span>Majukan ke Fasa Seterusnya</span>
                        <ArrowRight className="w-3.5 h-3.5 text-red-600" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Kalkulator Ansuran Segera di Meja Kaunter */}
      <div className="bg-white border-2 border-zinc-950 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-zinc-100 pb-3 gap-2">
          <div>
            <h2 className="text-base font-black text-zinc-950 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-red-600" />
              <span>Kalkulator Skim Ansuran Motosikal (Alat Kaunter Kerani 1)</span>
            </h2>
            <p className="text-xs text-zinc-800 font-bold">
              Kira anggaran bayaran bulanan segera semasa melayan pelanggan secara walk-in atau panggilan telefon.
            </p>
          </div>
          <span className="text-xs font-mono font-black text-zinc-950 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-300">
            Kadar Faedah: {calcRate}% Setahun
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-12 items-start">
          <div className="lg:col-span-6 space-y-3.5 text-xs">
            <div>
              <label className="text-zinc-800 font-bold block mb-1">Harga Atas Jalan (OTR Motosikal):</label>
              <input
                type="number"
                value={calcPrice}
                onChange={(e) => setCalcPrice(Number(e.target.value))}
                className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl p-2.5 font-mono font-bold text-zinc-950 text-sm focus:border-zinc-950 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-800 font-bold block mb-1">Wang Pendahuluan (Deposit):</label>
                <input
                  type="number"
                  value={calcDeposit}
                  onChange={(e) => setCalcDeposit(Number(e.target.value))}
                  className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl p-2 font-mono font-bold text-zinc-950 focus:border-zinc-950 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-zinc-800 font-bold block mb-1">Pilihan Syarikat Pembiaya:</label>
                <select
                  value={calcRate}
                  onChange={(e) => setCalcRate(Number(e.target.value))}
                  className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl p-2 font-mono font-bold text-zinc-950 focus:border-zinc-950 focus:outline-none"
                >
                  <option value={8.5}>AEON Credit (8.5% p.a)</option>
                  <option value={9.0}>Chailease Berjaya (9.0% p.a)</option>
                  <option value={8.0}>Parkson Credit (8.0% p.a)</option>
                  <option value={9.5}>JCL Credit Leasing (9.5% p.a)</option>
                  <option value={10.0}>ELK-Desa (10.0% p.a)</option>
                  <option value={6.5}>Bank Komersial (6.5% p.a)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-zinc-800 font-bold block mb-1">Tempoh Bayaran Balik:</label>
              <div className="grid grid-cols-4 gap-2">
                {[12, 24, 36, 48].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setCalcTerm(m)}
                    className={`py-2 rounded-xl text-xs font-black font-mono transition border-2 cursor-pointer ${
                      calcTerm === m
                        ? "bg-zinc-950 text-white border-zinc-950"
                        : "bg-zinc-50 border-zinc-200 text-zinc-950 hover:border-zinc-950"
                    }`}
                  >
                    {m} Bln ({m / 12} Thn)
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={runCalculator}
              className="w-full py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white font-black transition cursor-pointer text-xs"
            >
              Kira Semula Ansuran
            </button>
          </div>

          <div className="lg:col-span-6 bg-zinc-50 border-2 border-zinc-200 rounded-2xl p-5 space-y-3">
            <span className="text-xs font-black text-zinc-800 uppercase font-mono block">
              Hasil Pengiraan Ansuran Rasmi:
            </span>

            {calcResult && (
              <div className="space-y-3">
                <div className="bg-white border-2 border-zinc-950 rounded-2xl p-4 text-center">
                  <span className="text-xs font-bold text-zinc-800 block">Anggaran Bayaran Bulanan:</span>
                  <div className="text-3xl font-black font-mono text-red-600 mt-1">
                    RM {calcResult.monthlyInstallment.toFixed(2)}
                    <span className="text-xs font-bold text-zinc-800 font-sans"> / bulan</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-zinc-800 block mt-1">
                    Tempoh {calcResult.termMonths} bulan ({calcResult.termMonths / 12} tahun)
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-mono font-bold">
                  <div className="flex justify-between text-zinc-800">
                    <span>Harga OTR:</span>
                    <span className="text-zinc-950 font-black">RM {calcResult.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-800">
                    <span>Deposit:</span>
                    <span className="text-emerald-800 font-black">- RM {calcResult.deposit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-800 border-t border-zinc-200 pt-1.5">
                    <span>Jumlah Pokok Pinjaman:</span>
                    <span className="text-zinc-950 font-black">RM {calcResult.loanAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-800">
                    <span>Jumlah Faedah ({calcResult.annualRatePercent}% p.a):</span>
                    <span className="text-red-600 font-black">RM {calcResult.totalInterest.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-950 font-black border-t-2 border-zinc-950 pt-1.5 text-sm">
                    <span>Jumlah Keseluruhan Perlu Dibayar:</span>
                    <span className="text-red-600 font-mono">RM {calcResult.totalPayable.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: DAFTAR PERMOHONAN PINJAMAN BAHARU */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/70 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-zinc-950 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <Bike className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-black text-zinc-950">Daftar Permohonan Pinjaman Motosikal</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-zinc-800 hover:text-zinc-950 hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApp} className="space-y-3.5 text-xs font-bold">
              <div>
                <label className="text-zinc-800 block mb-1">Pilih Motosikal Showroom:</label>
                <select
                  value={selectedMotoId}
                  onChange={(e) => setSelectedMotoId(e.target.value)}
                  className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl p-2.5 text-zinc-950 font-bold focus:border-zinc-950 focus:outline-none"
                  required
                >
                  <option value="">-- Pilih Model Motosikal --</option>
                  {motorcycles.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.brand} {m.model} ({m.color}) - RM {m.sellingPrice.toFixed(2)} [{m.status.toUpperCase()}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-800 block mb-1">Nama Penuh Pemohon:</label>
                <input
                  type="text"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="Nama mengikut kad pengenalan (IC)"
                  className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl p-2.5 text-zinc-950 font-bold focus:border-zinc-950 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-800 block mb-1">No Telefon WhatsApp:</label>
                  <input
                    type="text"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="Contoh: 0123456789"
                    className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl p-2.5 font-mono text-zinc-950 focus:border-zinc-950 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-zinc-800 block mb-1">No Kad Pengenalan (IC):</label>
                  <input
                    type="text"
                    value={custIc}
                    onChange={(e) => setCustIc(e.target.value)}
                    placeholder="990101-14-1234"
                    className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl p-2.5 font-mono text-zinc-950 focus:border-zinc-950 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-zinc-800 block mb-1">Gaji Kasar (RM):</label>
                  <input
                    type="number"
                    value={custSalary}
                    onChange={(e) => setCustSalary(Number(e.target.value))}
                    className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl p-2 font-mono text-zinc-950 focus:border-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-zinc-800 block mb-1">Deposit (RM):</label>
                  <input
                    type="number"
                    value={custDeposit}
                    onChange={(e) => setCustDeposit(Number(e.target.value))}
                    className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl p-2 font-mono text-zinc-950 focus:border-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-zinc-800 block mb-1">Tempoh Pinjaman:</label>
                  <select
                    value={custTerm}
                    onChange={(e) => setCustTerm(Number(e.target.value))}
                    className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl p-2 text-zinc-950 focus:border-zinc-950 focus:outline-none"
                  >
                    <option value={12}>12 Bulan (1 Thn)</option>
                    <option value={24}>24 Bulan (2 Thn)</option>
                    <option value={36}>36 Bulan (3 Thn)</option>
                    <option value={48}>48 Bulan (4 Thn)</option>
                    <option value={60}>60 Bulan (5 Thn)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-800 block mb-1">Syarikat Pembiaya Kredit:</label>
                <select
                  value={loanProvider}
                  onChange={(e) => setLoanProvider(e.target.value)}
                  className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl p-2.5 text-zinc-950 focus:border-zinc-950 focus:outline-none"
                >
                  <option value="AEON Credit Service">AEON Credit Service</option>
                  <option value="Chailease Berjaya Credit">Chailease Berjaya Credit</option>
                  <option value="Parkson Credit">Parkson Credit</option>
                  <option value="JCL Credit Leasing">JCL Credit Leasing</option>
                  <option value="ELK-Desa Capital">ELK-Desa Capital</option>
                  <option value="Kredit Kedai FFmotor">Kredit Kedai FFmotor</option>
                  <option value="Maybank Auto Finance">Maybank Auto Finance</option>
                  <option value="BSN MyRinggit">BSN MyRinggit</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-800 block mb-1">Catatan Tambahan Kerani:</label>
                <input
                  type="text"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Contoh: Dokumen lengkap, penjamin sedia ada"
                  className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl p-2 text-zinc-950 focus:border-zinc-950 focus:outline-none"
                />
              </div>

              {/* Ringkasan Semasa Borang */}
              {selectedMotoId && (
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3 text-emerald-950 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span>Anggaran Pinjaman Pokok:</span>
                    <span className="font-mono font-black">RM {getModalCalc().principal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>Anggaran Bayaran Bulanan:</span>
                    <span className="font-mono font-black text-red-600 text-sm">
                      RM {getModalCalc().monthly.toFixed(2)}/bln
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-2 justify-end border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border-2 border-zinc-300 bg-white font-black text-zinc-800 hover:bg-zinc-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{submitting ? "Mendaftar..." : "Simpan Permohonan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: KEMASKINI FASA & CATATAN PINJAMAN */}
      {activeAppForAction && (
        <div className="fixed inset-0 z-50 bg-zinc-950/70 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-zinc-950 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-3">
              <h3 className="text-base font-black text-zinc-950">
                Ubah Fasa: {activeAppForAction.appNumber}
              </h3>
              <button
                type="button"
                onClick={() => setActiveAppForAction(null)}
                className="p-1 rounded-lg text-zinc-800 hover:text-zinc-950 hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStageAndNotes} className="space-y-4 text-xs font-bold">
              <div>
                <label className="text-zinc-800 block mb-1">Nama Pemohon:</label>
                <p className="p-2.5 rounded-xl bg-zinc-100 text-zinc-950 font-black">
                  {activeAppForAction.customerName} ({activeAppForAction.brand} {activeAppForAction.model})
                </p>
              </div>

              <div>
                <label className="text-zinc-800 block mb-1">Pilih Fasa Terkini:</label>
                <select
                  value={actionStage}
                  onChange={(e) => setActionStage(e.target.value)}
                  className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl p-2.5 text-zinc-950 font-bold focus:border-zinc-950 focus:outline-none"
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} ({s.desc})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-800 block mb-1">Catatan Tambahan Kerani:</label>
                <textarea
                  rows={3}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Sebab perubahan fasa, maklum balas syarikat pembiaya, dll..."
                  className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl p-2.5 text-zinc-950 font-bold focus:border-zinc-950 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2 justify-end border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setActiveAppForAction(null)}
                  className="px-4 py-2.5 rounded-xl border-2 border-zinc-300 bg-white font-black text-zinc-800 hover:bg-zinc-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white font-black transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{submittingAction ? "Menyimpan..." : "Kemas Kini Fasa"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
