import React, { useState } from "react";
import {
  Bike,
  DollarSign,
  User,
  Plus,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Sparkles,
  Phone,
  FileText,
  Building,
  TrendingUp,
  Tag
} from "lucide-react";
import { Motorcycle } from "../types";

export type PipelineStage =
  | "lead"
  | "qualified"
  | "loan_processing"
  | "loan_approved"
  | "jpj_prep"
  | "won"
  | "lost";

export interface DealCard {
  id: string;
  customerName: string;
  customerPhone: string;
  customerIc: string;
  bikeModel: string;
  dealValue: number; // Harga motor
  depositPaid: number;
  financier: "AEON Credit" | "Chailease" | "Kredit Kedai" | "Tunai Cash";
  stage: PipelineStage;
  winProbability: number; // %
  assignedTo: string; // Sales Rep
  daysInStage: number;
  assignedPlate?: string;
  lostReason?: string;
}

interface SalesPipelineKanbanProps {
  motorcycles?: Motorcycle[];
  onOpenCustomer?: (phone: string) => void;
}

export const SalesPipelineKanban: React.FC<SalesPipelineKanbanProps> = ({
  onOpenCustomer,
}) => {
  const [deals, setDeals] = useState<DealCard[]>([
    {
      id: "DEAL-101",
      customerName: "Ahmad Danish",
      customerPhone: "60112849201",
      customerIc: "980214-02-5521",
      bikeModel: "Yamaha NVX 155 V2 ABS",
      dealValue: 11800,
      depositPaid: 500,
      financier: "AEON Credit",
      stage: "lead",
      winProbability: 20,
      assignedTo: "Siti Sarah",
      daysInStage: 1,
    },
    {
      id: "DEAL-102",
      customerName: "Mohd Azizi Salleh",
      customerPhone: "60174492019",
      customerIc: "910512-08-5919",
      bikeModel: "Honda RS-X 150 Repsol",
      dealValue: 9800,
      depositPaid: 300,
      financier: "Chailease",
      stage: "qualified",
      winProbability: 40,
      assignedTo: "Aiman Hakimi",
      daysInStage: 2,
    },
    {
      id: "DEAL-103",
      customerName: "Muhammad Faizul Anuar",
      customerPhone: "60174421890",
      customerIc: "891104-02-6119",
      bikeModel: "Yamaha MT-15 V2 ABS",
      dealValue: 12500,
      depositPaid: 1000,
      financier: "AEON Credit",
      stage: "loan_processing",
      winProbability: 60,
      assignedTo: "Siti Sarah",
      daysInStage: 3,
    },
    {
      id: "DEAL-104",
      customerName: "Nurul Syafiqah",
      customerPhone: "60138849201",
      customerIc: "980715-02-5882",
      bikeModel: "Honda ADV 160 ABS",
      dealValue: 13200,
      depositPaid: 800,
      financier: "Chailease",
      stage: "loan_approved",
      winProbability: 80,
      assignedTo: "Farhan (Tauke)",
      daysInStage: 1,
      assignedPlate: "KEM 9954",
    },
    {
      id: "DEAL-105",
      customerName: "Tengku Daniel Hakim",
      customerPhone: "60129841029",
      customerIc: "940812-02-5431",
      bikeModel: "Yamaha Y15ZR V2 GP",
      dealValue: 9600,
      depositPaid: 500,
      financier: "Kredit Kedai",
      stage: "jpj_prep",
      winProbability: 95,
      assignedTo: "Aiman Hakimi",
      daysInStage: 2,
      assignedPlate: "KEM 9912",
    },
    {
      id: "DEAL-106",
      customerName: "Haji Ramli Zakaria",
      customerPhone: "60124409112",
      customerIc: "680410-02-5123",
      bikeModel: "Yamaha XMAX 250 Tech MAX",
      dealValue: 24500,
      depositPaid: 24500,
      financier: "Tunai Cash",
      stage: "won",
      winProbability: 100,
      assignedTo: "Farhan (Tauke)",
      daysInStage: 0,
      assignedPlate: "PKA 888",
    },
  ]);

  const [filterStaff, setFilterStaff] = useState<string>("all");
  const [showAddDealModal, setShowAddDealModal] = useState<boolean>(false);
  const [newDeal, setNewDeal] = useState({
    customerName: "",
    customerPhone: "",
    customerIc: "",
    bikeModel: "Yamaha NVX 155 V2 ABS",
    dealValue: 11800,
    depositPaid: 500,
    financier: "AEON Credit" as const,
    assignedTo: "Siti Sarah",
  });

  const stages: { id: PipelineStage; label: string; prob: number; color: string; badgeColor: string }[] = [
    { id: "lead", label: "1. Lead Baharu", prob: 20, color: "border-zinc-300", badgeColor: "bg-zinc-100 text-zinc-700" },
    { id: "qualified", label: "2. Dokumen Lengkap", prob: 40, color: "border-zinc-300", badgeColor: "bg-zinc-100 text-zinc-700" },
    { id: "loan_processing", label: "3. Proses Pinjaman", prob: 60, color: "border-red-200", badgeColor: "bg-red-50 text-red-600" },
    { id: "loan_approved", label: "4. Pinjaman Lulus", prob: 80, color: "border-emerald-200", badgeColor: "bg-emerald-50 text-emerald-700" },
    { id: "jpj_prep", label: "5. Pendaftaran JPJ", prob: 95, color: "border-zinc-300", badgeColor: "bg-zinc-100 text-zinc-700" },
    { id: "won", label: "6. Serah Kunci (Won)", prob: 100, color: "border-emerald-400", badgeColor: "bg-zinc-950 text-white" },
  ];

  // Majukan deal ke fasa seterusnya
  const advanceDeal = (id: string) => {
    setDeals((prev) =>
      prev.map((deal) => {
        if (deal.id !== id) return deal;
        const currentIndex = stages.findIndex((s) => s.id === deal.stage);
        if (currentIndex < stages.length - 1) {
          const nextStage = stages[currentIndex + 1];
          return {
            ...deal,
            stage: nextStage.id,
            winProbability: nextStage.prob,
            daysInStage: 0,
          };
        }
        return deal;
      })
    );
  };

  // Undurkan deal ke fasa sebelumnya
  const retreatDeal = (id: string) => {
    setDeals((prev) =>
      prev.map((deal) => {
        if (deal.id !== id) return deal;
        const currentIndex = stages.findIndex((s) => s.id === deal.stage);
        if (currentIndex > 0) {
          const prevStage = stages[currentIndex - 1];
          return {
            ...deal,
            stage: prevStage.id,
            winProbability: prevStage.prob,
            daysInStage: 0,
          };
        }
        return deal;
      })
    );
  };

  // Tandakan Closed Lost
  const markDealLost = (id: string) => {
    const reason = prompt("Sebab prospek batal / ditolak (cth: Loan Reject / Beli di kedai lain):") || "Dibatalkan Pelanggan";
    setDeals((prev) =>
      prev.map((deal) =>
        deal.id === id ? { ...deal, stage: "lost", winProbability: 0, lostReason: reason } : deal
      )
    );
  };

  // Filter deals
  const filteredDeals = deals.filter((d) => {
    if (filterStaff === "all") return true;
    return d.assignedTo.includes(filterStaff);
  });

  // Kiraan metrik BottleCRM Pipeline
  const activeDeals = filteredDeals.filter((d) => d.stage !== "won" && d.stage !== "lost");
  const totalPipelineValue = activeDeals.reduce((sum, d) => sum + d.dealValue, 0);
  const weightedPipelineValue = activeDeals.reduce(
    (sum, d) => sum + (d.dealValue * d.winProbability) / 100,
    0
  );
  const wonDeals = filteredDeals.filter((d) => d.stage === "won");
  const wonValue = wonDeals.reduce((sum, d) => sum + d.dealValue, 0);

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeal.customerName || !newDeal.customerPhone) {
      alert("Sila isi nama dan nombor telefon prospek.");
      return;
    }

    const created: DealCard = {
      id: `DEAL-${Math.floor(100 + Math.random() * 900)}`,
      customerName: newDeal.customerName,
      customerPhone: newDeal.customerPhone,
      customerIc: newDeal.customerIc || "900101-02-0000",
      bikeModel: newDeal.bikeModel,
      dealValue: Number(newDeal.dealValue),
      depositPaid: Number(newDeal.depositPaid),
      financier: newDeal.financier,
      stage: "lead",
      winProbability: 20,
      assignedTo: newDeal.assignedTo,
      daysInStage: 0,
    };

    setDeals([created, ...deals]);
    setShowAddDealModal(false);
    setNewDeal({
      customerName: "",
      customerPhone: "",
      customerIc: "",
      bikeModel: "Yamaha NVX 155 V2 ABS",
      dealValue: 11800,
      depositPaid: 500,
      financier: "AEON Credit",
      assignedTo: "Siti Sarah",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Metrik Corong BottleCRM */}
      <div className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-none space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-black px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                PIPELINE KANBAN (BOTTLECRM STANDARD)
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                ● {activeDeals.length} Saluran Aktif
              </span>
            </div>
            <h2 className="text-xl font-black mt-1">
              Pengurusan Prospek & Saluran Jualan Motosikal
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Jejak setiap prospek dari pertanyaan awal sehingga penyerahan kunci showroom berserta kiraan nilai wajaran.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {/* Tapis Wakil Jualan */}
            <div className="flex items-center gap-1.5 bg-zinc-50 px-3 py-2 rounded-xl border border-zinc-200 text-xs">
              <span className="text-zinc-400 font-bold">Staf:</span>
              <select
                value={filterStaff}
                onChange={(e) => setFilterStaff(e.target.value)}
                className="bg-transparent font-bold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-white ">Semua Wakil Jualan</option>
                <option value="Siti Sarah" className="bg-white ">Siti Sarah</option>
                <option value="Aiman Hakimi" className="bg-white ">Aiman Hakimi</option>
                <option value="Farhan" className="bg-white ">Farhan (Tauke)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowAddDealModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Daftar Prospek Jualan</span>
            </button>
          </div>
        </div>

        {/* 3 Kad Telemetri Saluran Jualan BottleCRM */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-zinc-200/80">
          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Jumlah Nilai Saluran Aktif (Unweighted)
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono">
                RM {totalPipelineValue.toLocaleString()}
              </span>
              <span className="text-xs text-zinc-400">({activeDeals.length} unit)</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Jumlah potensi nilai motor jika semua lulus.</p>
          </div>

          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
            <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Unjuran Hasil Wajaran (Weighted Forecast)
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-brand-300 font-mono">
                RM {Math.round(weightedPipelineValue).toLocaleString()}
              </span>
              <span className="text-xs text-brand-400 font-bold">Kebarangkalian Dinamik</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Berdasarkan fasa kelulusan & kebarangkalian menang.</p>
          </div>

          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Jualan Berjaya Ditutup (Closed Won)
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400 font-mono">
                RM {wonValue.toLocaleString()}
              </span>
              <span className="text-xs text-emerald-500 font-bold">({wonDeals.length} unit diserah)</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Motosikal telah diserah kunci di showroom.</p>
          </div>
        </div>
      </div>

      {/* Papan Kanban 6 Lajur */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[1300px]">
          {stages.map((stage) => {
            const stageDeals = filteredDeals.filter((d) => d.stage === stage.id);
            const stageValue = stageDeals.reduce((sum, d) => sum + d.dealValue, 0);

            return (
              <div
                key={stage.id}
                className="flex-1 bg-white/90 border border-zinc-200 rounded-3xl p-4 flex flex-col justify-between min-h-[500px] shadow-lg"
              >
                {/* Header Lajur */}
                <div>
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-black text-xs tracking-tight">{stage.label}</h3>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${stage.badgeColor}`}>
                          {stageDeals.length}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                        RM {stageValue.toLocaleString()} • {stage.prob}% prob
                      </div>
                    </div>
                  </div>

                  {/* Senarai Kad Deal Dalam Lajur */}
                  <div className="space-y-3">
                    {stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className={`bg-zinc-50 border rounded-2xl p-3.5 space-y-2.5 shadow transition hover:border-brand-500/60 ${stage.color}`}
                      >
                        {/* Header Kad */}
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <div className="font-bold text-xs">{deal.customerName}</div>
                            <div className="text-[10px] text-zinc-500 font-mono">
                              📞 {deal.customerPhone}
                            </div>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            RM {deal.dealValue.toLocaleString()}
                          </span>
                        </div>

                        {/* Model Motosikal & Pembiaya */}
                        <div className="text-xs bg-white p-2 rounded-xl border border-zinc-200/80 space-y-1">
                          <div className="font-bold text-zinc-700 flex items-center gap-1 text-[11px]">
                            <Bike className="w-3.5 h-3.5 text-zinc-700" />
                            <span>{deal.bikeModel}</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-zinc-500">
                            <span>Pembiaya: <strong className="">{deal.financier}</strong></span>
                            <span>Dep: RM{deal.depositPaid}</span>
                          </div>
                          {deal.assignedPlate && (
                            <div className="text-[10px] font-mono text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded">
                              Plat: {deal.assignedPlate}
                            </div>
                          )}
                        </div>

                        {/* Maklumat Sales Rep & Hari dalam Fasa */}
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-200/80">
                          <span className="flex items-center gap-1 text-zinc-500">
                            <User className="w-3 h-3" />
                            {deal.assignedTo}
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {deal.daysInStage} hari
                          </span>
                        </div>

                        {/* Butang Kawalan Fasa Kanban */}
                        <div className="pt-2 flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1">
                            {stage.id !== "lead" && stage.id !== "won" && (
                              <button
                                type="button"
                                onClick={() => retreatDeal(deal.id)}
                                className="px-2 py-1 rounded bg-zinc-100 text-zinc-500 hover:text-red-600 text-[10px] font-bold"
                                title="Undur ke fasa sebelum"
                              >
                                ◀
                              </button>
                            )}
                            {stage.id !== "won" && (
                              <button
                                type="button"
                                onClick={() => advanceDeal(deal.id)}
                                className="px-2.5 py-1 rounded bg-brand-600 hover:bg-brand-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm"
                                title="Majukan ke fasa seterusnya"
                              >
                                <span>Maju</span>
                                <span>▶</span>
                              </button>
                            )}
                          </div>

                          {stage.id !== "won" && (
                            <button
                              type="button"
                              onClick={() => markDealLost(deal.id)}
                              className="text-zinc-400 hover:text-red-700 text-[10px] font-bold p-1"
                              title="Tandakan Batal / Lost"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {stageDeals.length === 0 && (
                      <div className="p-6 text-center text-slate-600 text-xs italic border border-dashed border-zinc-200 rounded-2xl">
                        Tiada prospek dalam fasa ini
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-200/80 text-[10px] text-zinc-400 text-center">
                  Standard BottleCRM Flow
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Daftar Prospek Jualan Baharu */}
      {showAddDealModal && (
        <div className="fixed inset-0 z-50 bg-zinc-50/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-3xl max-w-lg w-full p-6 shadow-none space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="text-base font-black flex items-center gap-2">
                <Plus className="w-5 h-5 text-red-600" />
                Daftar Prospek Motosikal Baharu
              </h3>
              <button
                type="button"
                onClick={() => setShowAddDealModal(false)}
                className="text-zinc-500 hover:text-red-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-500 font-bold mb-1">Nama Penuh Prospek:</label>
                <input
                  type="text"
                  required
                  value={newDeal.customerName}
                  onChange={(e) => setNewDeal({ ...newDeal, customerName: e.target.value })}
                  placeholder="cth: Khairul Azhar bin Othman"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 font-bold mb-1">Nombor WhatsApp:</label>
                  <input
                    type="text"
                    required
                    value={newDeal.customerPhone}
                    onChange={(e) => setNewDeal({ ...newDeal, customerPhone: e.target.value })}
                    placeholder="cth: 60129841029"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 font-bold mb-1">No MyKad (IC):</label>
                  <input
                    type="text"
                    value={newDeal.customerIc}
                    onChange={(e) => setNewDeal({ ...newDeal, customerIc: e.target.value })}
                    placeholder="940812-02-5431"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 font-bold mb-1">Model Motosikal:</label>
                  <select
                    value={newDeal.bikeModel}
                    onChange={(e) => {
                      const val = e.target.value;
                      let price = 11800;
                      if (val.includes("Y15ZR")) price = 9600;
                      if (val.includes("RS-X")) price = 9800;
                      if (val.includes("ADV")) price = 13200;
                      if (val.includes("MT-15")) price = 12500;
                      setNewDeal({ ...newDeal, bikeModel: val, dealValue: price });
                    }}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-red-600"
                  >
                    <option value="Yamaha NVX 155 V2 ABS">Yamaha NVX 155 V2 ABS (RM11,800)</option>
                    <option value="Yamaha Y15ZR V2 GP">Yamaha Y15ZR V2 GP (RM9,600)</option>
                    <option value="Honda RS-X 150 Repsol">Honda RS-X 150 Repsol (RM9,800)</option>
                    <option value="Honda ADV 160 ABS">Honda ADV 160 ABS (RM13,200)</option>
                    <option value="Yamaha MT-15 V2 ABS">Yamaha MT-15 V2 ABS (RM12,500)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-500 font-bold mb-1">Panel Pembiaya Pinjaman:</label>
                  <select
                    value={newDeal.financier}
                    onChange={(e) => setNewDeal({ ...newDeal, financier: e.target.value as any })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-red-600"
                  >
                    <option value="AEON Credit">AEON Credit Service</option>
                    <option value="Chailease">Chailease Berjaya</option>
                    <option value="Kredit Kedai">Kredit Kedai Sendiri</option>
                    <option value="Tunai Cash">Tunai / Cash Penuh</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 font-bold mb-1">Deposit Diterima (RM):</label>
                  <input
                    type="number"
                    value={newDeal.depositPaid}
                    onChange={(e) => setNewDeal({ ...newDeal, depositPaid: Number(e.target.value) })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 font-bold mb-1">Wakil Jualan Ditugaskan:</label>
                  <select
                    value={newDeal.assignedTo}
                    onChange={(e) => setNewDeal({ ...newDeal, assignedTo: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-red-600"
                  >
                    <option value="Siti Sarah">Siti Sarah (SA / Kaunter)</option>
                    <option value="Aiman Hakimi">Aiman Hakimi (Sales)</option>
                    <option value="Farhan (Tauke)">Farhan (Owner VIP)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setShowAddDealModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-500 hover:text-red-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 text-white font-black shadow-lg hover:bg-red-700"
                >
                  Simpan & Masuk Fasa 1
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

