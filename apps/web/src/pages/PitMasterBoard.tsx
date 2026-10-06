import React, { useState, useEffect } from "react";
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Check,
  Eye,
  Package,
  User,
  Bike,
  Flame,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { WorkOrder, Product } from "../types";

interface PitMasterBoardProps {
  workOrders: WorkOrder[];
  products: Product[];
  onRefresh: () => void;
  onOpenTrack: (token: string) => void;
}

interface BayState {
  bayNumber: number;
  bayName: string;
  assignedMechanic: string;
  activeWorkOrder: WorkOrder | null;
  elapsedMinutes: number;
}

export const PitMasterBoard: React.FC<PitMasterBoardProps> = ({
  workOrders,
  products,
  onRefresh,
  onOpenTrack,
}) => {
  // Simulasi masa berjalan untuk lif bengkel
  const [bayElapsed, setBayElapsed] = useState<{ [key: number]: number }>({
    1: 22, // Bay 1: 22 minit (Hijau)
    2: 48, // Bay 2: 48 minit (Merah - Lewat)
    3: 15, // Bay 3: 15 minit (Hijau)
    4: 0,  // Bay 4: Kosong
  });

  const [completingId, setCompletingId] = useState<string | null>(null);
  
  // Checklist Modal States
  const [checklistWoId, setChecklistWoId] = useState<string | null>(null);
  const [checklist, setChecklist] = useState({
    brakeFront: false,
    brakeRear: false,
    tyrePressure: false,
    lights: false,
    noLeaks: false,
  });

  // Modal Permohonan VO (Alat Ganti Tambahan)
  const [voModalOpen, setVoModalOpen] = useState(false);
  const [selectedWoForVo, setSelectedWoForVo] = useState<WorkOrder | null>(null);
  const [voForm, setVoForm] = useState({
    partName: "Mangkok Klac Racing Boy + Roller Set",
    partCode: "2DP-E6321-00",
    partCost: "65.00",
    laborCost: "20.00",
    reason: "Roller telah kemik dan tapak mangkok haus beralun mengakibatkan kehilangan kuasa pendikit.",
    photoUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&q=80",
  });
  const [createdVoLink, setCreatedVoLink] = useState<string | null>(null);
  const [isSubmittingVo, setIsSubmittingVo] = useState(false);

  const handleOpenVoModal = (wo: WorkOrder) => {
    setSelectedWoForVo(wo);
    setCreatedVoLink(null);
    setVoModalOpen(true);
  };

  const handleCreateVo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWoForVo) return;
    setIsSubmittingVo(true);
    try {
      const res = await fetch("/api/vo/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workOrderId: selectedWoForVo.id,
          title: `Penukaran ${voForm.partName}`,
          partName: voForm.partName,
          partCode: voForm.partCode,
          partCost: parseFloat(voForm.partCost) || 0,
          laborCost: parseFloat(voForm.laborCost) || 0,
          reason: voForm.reason,
          photoUrl: voForm.photoUrl,
          requestedBy: "Sifu Halim (Foreman Pit)",
          customerPhone: selectedWoForVo.ownerPhone || "0192233445",
        }),
      });
      const d = await res.json();
      if (d.success) {
        const fullLink = `${window.location.origin}/vo/${d.token}`;
        setCreatedVoLink(fullLink);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingVo(false);
    }
  };

  // Padankan kerja aktif mengikut bay (Sedang Baiki atau Tunggu Alat Ganti)
  const inProgressOrders = workOrders.filter(
    (w) => w.status === "in_progress" || w.status === "waiting_parts"
  );

  const getBayOrder = (bayNum: number): WorkOrder | null => {
    // 1. Cari pesanan yang ditetapkan secara khusus ke bay ini
    const explicitlyAssigned = inProgressOrders.find((w) => {
      if (w.assignedBay === bayNum) return true;
      if (w.mechanicNotes && new RegExp(`Bay #${bayNum}\\b`).test(w.mechanicNotes)) return true;
      return false;
    });
    if (explicitlyAssigned) return explicitlyAssigned;

    // 2. Jika tiada, ambil pesanan tanpa nombor bay khusus
    const assignedIds = new Set(
      inProgressOrders
        .filter((w) => {
          if (w.assignedBay && w.assignedBay !== bayNum) return true;
          if (w.mechanicNotes && /Bay #(\d+)/.test(w.mechanicNotes)) {
            const m = w.mechanicNotes.match(/Bay #(\d+)/);
            if (m && parseInt(m[1], 10) !== bayNum) return true;
          }
          return false;
        })
        .map((w) => w.id)
    );

    const unassignedPool = inProgressOrders.filter((w) => !assignedIds.has(w.id));
    return unassignedPool[bayNum - 1] || null;
  };

  const getMechanicName = (bayNum: number, wo: WorkOrder | null, defaultName: string) => {
    if (wo?.mechanicName) return wo.mechanicName;
    if (wo?.mechanicId === "usr_mech1") return "Abang Din (Ketua Mekanik)";
    if (wo?.mechanicId === "usr_mech2") return "Syafiq (Foreman CVT)";
    if (wo?.mechanicId === "usr_mech3") return "Faizal (Mekanik)";
    return defaultName;
  };

  const bay1Order = getBayOrder(1);
  const bay2Order = getBayOrder(2);
  const bay3Order = getBayOrder(3);
  const bay4Order = getBayOrder(4);

  const bays: BayState[] = [
    {
      bayNumber: 1,
      bayName: "Bay 1 (Lif Utama A)",
      assignedMechanic: getMechanicName(1, bay1Order, "Abang Din (Ketua Mekanik)"),
      activeWorkOrder: bay1Order,
      elapsedMinutes: bayElapsed[1] || 0,
    },
    {
      bayNumber: 2,
      bayName: "Bay 2 (Lif Heavy Duty B)",
      assignedMechanic: getMechanicName(2, bay2Order, "Syafiq (Foreman CVT)"),
      activeWorkOrder: bay2Order,
      elapsedMinutes: bayElapsed[2] || 0,
    },
    {
      bayNumber: 3,
      bayName: "Bay 3 (Lif Servis Pantas C)",
      assignedMechanic: getMechanicName(3, bay3Order, "Faizal (Mekanik)"),
      activeWorkOrder: bay3Order,
      elapsedMinutes: bayElapsed[3] || 0,
    },
    {
      bayNumber: 4,
      bayName: "Bay 4 (Tuning & Dyno D)",
      assignedMechanic: getMechanicName(4, bay4Order, "Tersedia / Kosong"),
      activeWorkOrder: bay4Order,
      elapsedMinutes: bayElapsed[4] || 0,
    },
  ];

  const handleOpenChecklist = (woId: string) => {
    setChecklist({
      brakeFront: false,
      brakeRear: false,
      tyrePressure: false,
      lights: false,
      noLeaks: false,
    });
    setChecklistWoId(woId);
  };

  const submitMarkReady = async () => {
    if (!checklistWoId) return;
    try {
      setCompletingId(checklistWoId);
      const res = await fetch(`/api/work-orders/${checklistWoId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ready" }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Kerja siap! Status bertukar kepada 'Sedia Diambil' dan notis WhatsApp siap dihantar.");
        onRefresh();
      }
    } catch (err) {
      alert("Ralat mengemaskini status: " + err);
    } finally {
      setCompletingId(null);
      setChecklistWoId(null);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      onRefresh();
    }, 15000);
    return () => clearInterval(interval);
  }, [onRefresh]);

  const getBikeImage = (model: string = "") => {
    const m = model.toLowerCase();
    if (m.includes("nvx") || m.includes("nmax") || m.includes("vario") || m.includes("skuter")) {
      return "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&q=80";
    }
    if (m.includes("rs-x") || m.includes("rsx") || m.includes("repsol") || m.includes("cbr") || m.includes("r15")) {
      return "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&q=80";
    }
    if (m.includes("adv") || m.includes("xmax") || m.includes("forza")) {
      return "https://images.unsplash.com/photo-1571607388263-1044f9ea01dd?w=400&q=80";
    }
    return "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&q=80";
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Visual Pit */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold">
            <span>FFmotor HQ</span>
            <span>/</span>
            <span className="text-red-500 font-black">Pit Master & Hoist Bay Telemetri</span>
          </nav>
          <h1 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tight mt-1 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-red-500" />
            <span>Papan Kawalan Pit Visual (4-Bay Hoist Monitor)</span>
          </h1>
          <p className="text-xs text-zinc-400">
            Paparan masa nyata lantai mekanik: pemasa lif (SLA 45 minit), agihan tugasan, dan pengurusan alat ganti segera.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500 mr-2">Kemaskini auto setiap 15s</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/10 border border-red-500/30 text-red-400 text-xs font-mono font-black">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>4/4 LIF AKTIF BEROPERASI</span>
          </span>
          <button
            type="button"
            onClick={onRefresh}
            className="spike-btn-red text-xs py-2 px-3.5"
          >
            Segar Semula
          </button>
        </div>
      </div>

      {/* Grid 4-Bay Hoist Display (Besar & Interaktif untuk Tablet/TV Bengkel) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {bays.map((bay) => {
          const wo = bay.activeWorkOrder;
          const isOverdue = bay.elapsedMinutes > 40;
          const isWarning = bay.elapsedMinutes > 30 && !isOverdue;
          const bikeImg = wo ? getBikeImage(wo.model || "") : "";

          return (
            <div
              key={bay.bayNumber}
              className={`spike-card transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-none group ${
                !wo
                  ? "border-zinc-200 opacity-80"
                  : wo.status === "waiting_parts"
                  ? "border-zinc-400 ring-1 ring-zinc-300"
                  : isOverdue
                  ? "border-red-600 ring-2 ring-red-600/50"
                  : "border-zinc-200 hover:border-red-600"
              }`}
            >
              {/* Header Kad Bay */}
              <div className="p-3.5 border-b border-zinc-200 bg-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-500 block font-mono">
                    {bay.bayName}
                  </span>
                  <p className="text-xs font-bold text-zinc-900 truncate flex items-center gap-1 mt-0.5">
                    <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>{bay.assignedMechanic}</span>
                  </p>
                </div>

                {wo && (
                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-mono text-xs font-black ${
                      isOverdue
                        ? "bg-red-600 text-white animate-pulse shadow-md shadow-red-600/50"
                        : isWarning
                        ? "bg-red-50 text-red-600 border border-red-200"
                        : "bg-emerald-50 text-emerald-400 border border-emerald-200"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{bay.elapsedMinutes}m</span>
                  </div>
                )}
              </div>

              {/* Kandungan Tengah: Maklumat Motosikal dengan Foto */}
              {wo ? (
                <div className="space-y-3">
                  {/* Foto Motosikal Atas Lif */}
                  <div className="relative h-28 w-full bg-white overflow-hidden">
                    <img
                      src={bikeImg}
                      alt={wo.model || "Motosikal"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="font-mono text-xs font-black bg-black/90 px-2 py-0.5 rounded border border-white/20 tracking-wider shadow">
                        {wo.plateNumber}
                      </span>
                    </div>
                    <div className="absolute bottom-1 right-2">
                      <span className="font-mono text-xs font-black text-white bg-red-600 px-2 py-0.5 rounded shadow">
                        RM {(wo.grandTotal || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="px-4 space-y-2.5 flex-1">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-zinc-900 truncate">{wo.brand} {wo.model}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono ${
                            wo.status === "waiting_parts"
                              ? "bg-zinc-100 text-zinc-950 border border-zinc-300"
                              : "bg-red-600 text-white"
                          }`}
                        >
                          {wo.status === "waiting_parts" ? "Tunggu Alat Ganti" : "Sedang Baiki"}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        Pemilik: {wo.ownerName} ({wo.ownerPhone})
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-2.5 border border-zinc-200 text-xs space-y-1">
                      <span className="text-[10px] font-black uppercase text-red-500 font-mono block">
                        Aduan Kerosakan:
                      </span>
                      <p className="text-zinc-200 line-clamp-2 italic text-[11px]">
                        "{wo.customerComplaint || "Servis berkala & pemeriksaan"}"
                      </p>
                    </div>

                    {/* Status Alat Ganti Di Rak */}
                    <div className="p-2.5 rounded-xl bg-white border border-zinc-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span className="text-zinc-300 text-[11px] font-medium truncate max-w-[140px]">
                          {products[0]?.name || "Alat Ganti Asal"}
                        </span>
                      </div>
                      <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded bg-white text-black">
                        {products[0]?.rackLocation || "RAK-A1"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-center space-y-2 p-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-600">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-zinc-400">Lif Kosong</p>
                  <p className="text-[10px] text-zinc-500 max-w-[150px]">
                    Sedia untuk menerima giliran motosikal baharu dari barisan menunggu.
                  </p>
                </div>
              )}

              {/* Footer Tindakan Pit Master */}
              <div className="p-3.5 border-t border-zinc-200 bg-white space-y-2 mt-3">
                {wo ? (
                  <>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenTrack(wo.approvalToken || "tok_sample")}
                        className="spike-btn-dark flex-1 py-2 text-xs flex items-center justify-center gap-1 text-zinc-300"
                        title="Buka Status Pemeriksaan Pelanggan"
                      >
                        <Eye className="w-3.5 h-3.5 text-red-500" />
                        <span>Semak</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenChecklist(wo.id)}
                        disabled={completingId === wo.id}
                        className="spike-btn-red flex-2 py-2 text-xs flex items-center justify-center gap-1 font-black"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{completingId === wo.id ? "Menyimpan..." : "Siap & Turun Lif"}</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenVoModal(wo)}
                      className="spike-btn-white w-full py-2 text-xs flex items-center justify-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      <span>+ Mohon VO (Alat Ganti Tambahan)</span>
                    </button>
                  </>
                ) : (
                  <div className="text-center py-2 text-[11px] font-mono text-zinc-500">
                    STATUS: SEDIA DIGUNAKAN
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Barisan Menunggu Giliran Masuk Lif (Waiting Queue) */}
      <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-none space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-brand-400" />
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Barisan Menunggu Giliran Lif Pit (*Waiting Queue*)
            </h3>
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            {workOrders.filter((w) => w.status === "pending").length} Motor Dalam Barisan
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {workOrders
            .filter((w) => w.status === "pending")
            .slice(0, 3)
            .map((w, idx) => (
              <div key={w.id} className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                <div className="space-y-0.5 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                    <span className="font-mono text-xs font-bold text-zinc-900">{w.plateNumber}</span>
                  </div>
                  <p className="text-xs text-zinc-600 font-medium truncate">
                    {w.brand} {w.model}
                  </p>
                  <p className="text-[10px] text-zinc-500 truncate">
                    Aduan: {w.customerComplaint || "Servis standard"}
                  </p>
                </div>

                <span className="font-mono text-xs font-bold text-brand-400 shrink-0">
                  RM {(w.grandTotal || 0).toFixed(2)}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Modal Cipta Permohonan VO (Alat Ganti Tambahan) */}
      {voModalOpen && selectedWoForVo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-300 rounded-3xl max-w-lg w-full p-6 shadow-none space-y-5 text-xs text-zinc-700">
            <div className="flex items-start justify-between border-b border-zinc-200 pb-3">
              <div>
                <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider">
                  Borang Kelulusan Pit
                </span>
                <h2 className="text-base font-black text-zinc-900 mt-0.5">
                  Mohon Alat Ganti Tambahan (VO) - {selectedWoForVo.plateNumber}
                </h2>
                <p className="text-[11px] text-zinc-500">
                  Komponen tambahan yang dikesan rosak semasa kerja servis di lif dijalankan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVoModalOpen(false)}
                className="text-zinc-500 hover:text-red-600 p-1"
              >
                ✕
              </button>
            </div>

            {createdVoLink ? (
              <div className="space-y-4 py-2">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-400">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" /> Permohonan VO Berjaya Didaftarkan!
                  </div>
                  <p className="text-xs text-emerald-700/80 mt-1">
                    Pautan kelulusan pantas telah dijana. Sila hantar kepada pelanggan melalui WhatsApp rasmi untuk
                    pengesahan 1-klik di telefon mereka.
                  </p>
                </div>

                <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 font-mono text-[11px] text-zinc-600 break-all">
                  {createdVoLink}
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <a
                    href={`https://wa.me/6${(selectedWoForVo.ownerPhone || "0192233445").replace(/^0/, "")}?text=${encodeURIComponent(
                      `Salam ${selectedWoForVo.ownerName || "Bos"}, mekanik kami di lif menemui isu pada motor anda (${selectedWoForVo.plateNumber}).\n\n` +
                      `Komponen disyorkan: ${voForm.partName} (RM ${parseFloat(voForm.partCost) + parseFloat(voForm.laborCost)})\n` +
                      `Sila semak foto kerosakan & sahkan penukaran di pautan ini:\n${createdVoLink}\n\n` +
                      `- Pusat Servis Motosikal FFmotor 3S`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition"
                  >
                    Hantar ke WhatsApp Pelanggan (wa.me)
                  </a>
                  <button
                    type="button"
                    onClick={() => setVoModalOpen(false)}
                    className="bg-white hover:bg-zinc-100 text-zinc-600 py-3 px-4 rounded-xl font-semibold"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateVo} className="space-y-4">
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Nama Alat Ganti Tambahan:</label>
                  <input
                    type="text"
                    required
                    value={voForm.partName}
                    onChange={(e) => setVoForm({ ...voForm, partName: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-zinc-500 mb-1">Kod Bahagian:</label>
                    <input
                      type="text"
                      value={voForm.partCode}
                      onChange={(e) => setVoForm({ ...voForm, partCode: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-2.5 py-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1">Kos Alat (RM):</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={voForm.partCost}
                      onChange={(e) => setVoForm({ ...voForm, partCost: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-2.5 py-2 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1">Upah Pasang (RM):</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={voForm.laborCost}
                      onChange={(e) => setVoForm({ ...voForm, laborCost: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-2.5 py-2 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">
                    Sebab Teknikal / Justifikasi Mekanik:
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={voForm.reason}
                    onChange={(e) => setVoForm({ ...voForm, reason: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-2.5 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setVoModalOpen(false)}
                    className="bg-white hover:bg-zinc-100 text-zinc-600 px-4 py-2.5 rounded-xl font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingVo}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-red-600/20"
                  >
                    {isSubmittingVo ? "Mendaftar..." : "Jana Permohonan VO & Pautan WhatsApp"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Checklist Keselamatan Modal */}
      {checklistWoId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-300 rounded-3xl max-w-sm w-full p-6 shadow-none space-y-5 text-xs text-zinc-700">
            <div className="flex items-start justify-between border-b border-zinc-200 pb-3">
              <div>
                <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">
                  Checklist Keselamatan
                </span>
                <h2 className="text-base font-black text-black mt-0.5 flex items-center gap-2">
                  Pengesahan Sebelum Turun Lif
                  <button
                    type="button"
                    onClick={() => setChecklist({ brakeFront: true, brakeRear: true, tyrePressure: true, lights: true, noLeaks: true })}
                    className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-2 py-1 rounded text-[10px] transition"
                  >
                    Lulus Semua ✓
                  </button>
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setChecklistWoId(null)}
                className="text-zinc-500 hover:text-black p-1"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.brakeFront}
                  onChange={(e) => setChecklist({ ...checklist, brakeFront: e.target.checked })}
                  className="w-5 h-5 accent-red-600 rounded"
                />
                <span className="font-bold text-sm">Brek hadapan berfungsi</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.brakeRear}
                  onChange={(e) => setChecklist({ ...checklist, brakeRear: e.target.checked })}
                  className="w-5 h-5 accent-red-600 rounded"
                />
                <span className="font-bold text-sm">Brek belakang berfungsi</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.tyrePressure}
                  onChange={(e) => setChecklist({ ...checklist, tyrePressure: e.target.checked })}
                  className="w-5 h-5 accent-red-600 rounded"
                />
                <span className="font-bold text-sm">Tekanan angin tayar betul</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.lights}
                  onChange={(e) => setChecklist({ ...checklist, lights: e.target.checked })}
                  className="w-5 h-5 accent-red-600 rounded"
                />
                <span className="font-bold text-sm">Semua lampu berfungsi</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.noLeaks}
                  onChange={(e) => setChecklist({ ...checklist, noLeaks: e.target.checked })}
                  className="w-5 h-5 accent-red-600 rounded"
                />
                <span className="font-bold text-sm">Tiada kebocoran minyak</span>
              </label>
            </div>
            
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setChecklistWoId(null)}
                className="bg-white hover:bg-zinc-100 px-4 py-2.5 rounded-xl font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={submitMarkReady}
                disabled={!(checklist.brakeFront && checklist.brakeRear && checklist.tyrePressure && checklist.lights && checklist.noLeaks)}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition"
              >
                Sahkan & Turun Lif
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
