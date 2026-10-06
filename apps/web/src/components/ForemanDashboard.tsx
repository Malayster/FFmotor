import React, { useState } from "react";
import {
  Wrench,
  Flame,
  CheckCircle2,
  Clock,
  DollarSign,
  ShieldCheck,
  Plus,
  Bike,
  Search,
  Calendar,
  Layers,
  X,
  Zap,
  Tag,
  AlertCircle
} from "lucide-react";
import { WorkOrder, Vehicle } from "../types";

interface ForemanDashboardProps {
  workOrders: WorkOrder[];
  vehicles: Vehicle[];
  foremanName?: string;
  onRefresh: () => void;
  onOpenTrack?: (token: string) => void;
}

export const ForemanDashboard: React.FC<ForemanDashboardProps> = ({
  workOrders,
  vehicles,
  foremanName = "Sifu Halim",
  onRefresh,
}) => {
  const [timeframe, setTimeframe] = useState<"today" | "week" | "month">("today");
  const [isRegisterPlateModalOpen, setIsRegisterPlateModalOpen] = useState(false);

  // Form daftar plat di lif
  const [inputPlate, setInputPlate] = useState("");
  const [inputModel, setInputModel] = useState("");
  const [inputComplaint, setInputComplaint] = useState("");
  const [inputMileage, setInputMileage] = useState("");
  const [selectedBay, setSelectedBay] = useState("Bay 1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectedVehicle, setDetectedVehicle] = useState<Vehicle | null>(null);

  // Semak no plat dalam pangkalan data apabila ditaip
  const handlePlateType = (val: string) => {
    setInputPlate(val);
    const clean = val.toUpperCase().replace(/\s+/g, "");
    if (clean.length >= 3) {
      const found = vehicles.find(
        (v) =>
          v.plateNormalized === clean ||
          v.plateNumber.toUpperCase().replace(/\s+/g, "") === clean
      );
      if (found) {
        setDetectedVehicle(found);
        if (!inputModel) setInputModel(found.model || "");
        if (!inputMileage && found.currentMileage) setInputMileage(found.currentMileage.toString());
      } else {
        setDetectedVehicle(null);
      }
    } else {
      setDetectedVehicle(null);
    }
  };

  // Simpan no plat ke database dan aktifkan kerja lif
  const handleRegisterPlateToDatabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPlate.trim()) {
      alert("Sila masukkan nombor plat motor.");
      return;
    }

    setIsSubmitting(true);
    try {
      let vehId = "";
      const cleanPlate = inputPlate.toUpperCase().trim();

      if (detectedVehicle) {
        vehId = detectedVehicle.id;
      } else {
        // Cipta kenderaan baru ke dalam pangkalan data kenderaan bengkel (D1)
        const resVeh = await fetch("/api/vehicles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plateNumber: cleanPlate,
            brand: "Yamaha",
            model: inputModel || "Motosikal Masuk Lif",
            ownerName: "Pelanggan Pit Lif",
            ownerPhone: "0123456789",
            currentMileage: inputMileage ? parseInt(inputMileage) : 0,
          }),
        });
        const d = await resVeh.json();
        vehId = d.vehicle?.id || "";
      }

      // Cipta Work Order di bawah tugasan foreman ini
      await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: vehId,
          mileageIn: inputMileage ? parseInt(inputMileage) : 0,
          customerComplaint: `[${selectedBay} - ${foremanName}] ${inputComplaint || "Pemeriksaan & Servis Lif"}`,
        }),
      });

      setIsRegisterPlateModalOpen(false);
      setInputPlate("");
      setInputModel("");
      setInputComplaint("");
      setInputMileage("");
      setDetectedVehicle(null);
      onRefresh();
      alert(`Motosikal ${cleanPlate} telah didaftarkan ke pangkalan data & lif ${selectedBay} sedia bertugas!`);
    } catch (err: any) {
      alert("Ralat mendaftar plat motor: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter kerja siap foreman (simulasi mengikut timeframe)
  // Nota penting: NO PLATE SAMA SEKALI TIDAK DIPAMERKAN DI PAPARAN ARKIB!
  const mockCompletedJobs = [
    {
      id: "wo-088",
      woNumber: "#WO-088",
      model: "Yamaha Y15ZR V2 (Kapcai)",
      scope: "Servis Minyak Yamalube + Tukar Spoket & Rantai 428 O-Ring",
      durationMins: 35,
      commission: 25.0,
      timeAgo: "45 minit lepas",
      category: "servis",
      qcStatus: "Lulus QC",
    },
    {
      id: "wo-084",
      woNumber: "#WO-084",
      model: "Yamaha NVX 155 (Skuter)",
      scope: "Servis CVT Penuh (Tukar Belting Gates, Roller Koso 11g, Cuci Mangkuk Klac)",
      durationMins: 42,
      commission: 35.0,
      timeAgo: "2 jam lepas",
      category: "cvt",
      qcStatus: "Lulus QC",
    },
    {
      id: "wo-081",
      woNumber: "#WO-081",
      model: "Honda RSX 150 (Kapcai)",
      scope: "Tukar Brek Pad Depan + Tampal Tayar Tubeless Cacing",
      durationMins: 12,
      commission: 8.0,
      timeAgo: "4 jam lepas",
      category: "kilat",
      qcStatus: "Lulus QC",
    },
    {
      id: "wo-078",
      woNumber: "#WO-078",
      model: "Yamaha LC135 V8 (Kapcai)",
      scope: "Top Overhaul Head Enjin (Tukar Ring Piston, Valve Seal, Cuci Karbon)",
      durationMins: 85,
      commission: 80.0,
      timeAgo: "Pagi tadi",
      category: "enjin",
      qcStatus: "Lulus QC",
    },
    {
      id: "wo-072",
      woNumber: "#WO-072",
      model: "Honda Vario 160 (Skuter)",
      scope: "Tukar Tayar Belakang Maxxis 120/70-14 + Minyak Enjin Motul",
      durationMins: 25,
      commission: 15.0,
      timeAgo: "Semalam",
      category: "servis",
      qcStatus: "Lulus QC",
    },
    {
      id: "wo-069",
      woNumber: "#WO-069",
      model: "Modenas Kriss 110 (Kapcai)",
      scope: "Servis Fork Hadapan & Ganti Oil Seal Kiri Kanan",
      durationMins: 48,
      commission: 22.0,
      timeAgo: "2 hari lepas",
      category: "servis",
      qcStatus: "Lulus QC",
    },
  ];

  // Metrik mengikut tempoh masa
  const stats = {
    today: { count: 4, commission: 148.0, avgMins: 43, qualityScore: "100% Sifar Comeback" },
    week: { count: 28, commission: 920.0, avgMins: 38, qualityScore: "100% Sifar Comeback" },
    month: { count: 118, commission: 2850.0, avgMins: 36, qualityScore: "99.2% Kualiti Sah" },
  };

  const currentStat = stats[timeframe];
  const paidCommission = 500.0;
  const pendingCommission = currentStat.commission - (timeframe === "month" ? paidCommission : 0);

  return (
    <div className="space-y-6">
      {/* 1. Header & Butang Utama Daftar Plat Masuk Lif */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-zinc-200 p-5 rounded-3xl shadow-none">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center font-black">
            <Flame className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black ">{foremanName}</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                Ketua Foreman Lif 1
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Papan Catatan Peribadi: Pantau Produktiviti, Komisen Bersih & Jaminan Kualiti Tanpa Pendedahan No Plat.
            </p>
          </div>
        </div>

        {/* Butang Pintas Besar: Daftar Masuk Plat Terus Ke Database */}
        <button
          type="button"
          onClick={() => setIsRegisterPlateModalOpen(true)}
          className="px-5 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-95"
        >
          <Zap className="w-4 h-4 text-white" />
          <span>⚡ DAFTAR / SEMAK NO. PLAT MOTOR KE LIF</span>
        </button>
      </div>

      {/* 2. Togol Penapis Masa: Hari Ini, Minggu Ini & Bulan Ini */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-white border border-zinc-200 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setTimeframe("today")}
            className={`px-4 py-2 rounded-xl transition ${
              timeframe === "today"
                ? "bg-red-600 text-white font-black shadow-md"
                : "text-zinc-500 hover:text-red-600"
            }`}
          >
            ☀️ Hari Ini
          </button>
          <button
            type="button"
            onClick={() => setTimeframe("week")}
            className={`px-4 py-2 rounded-xl transition ${
              timeframe === "week"
                ? "bg-red-600 text-white font-black shadow-md"
                : "text-zinc-500 hover:text-red-600"
            }`}
          >
            📅 Minggu Ini (7 Hari)
          </button>
          <button
            type="button"
            onClick={() => setTimeframe("month")}
            className={`px-4 py-2 rounded-xl transition ${
              timeframe === "month"
                ? "bg-red-600 text-white font-black shadow-md"
                : "text-zinc-500 hover:text-red-600"
            }`}
          >
            🗓️ Bulan Ini
          </button>
        </div>

        <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Format Kalis No Plat (Privasi PDPA Terpelihara)</span>
        </div>
      </div>

      {/* 3. 4 Kad Metrik Utama Foreman (Widescreen PC & Responsive Mobile) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Kad 1: Motor Siap */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-5 space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 block">
            🏍️ Jumlah Motor Siap
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black ">{currentStat.count}</span>
            <span className="text-xs font-bold text-zinc-500">Unit</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-medium">
            Status: Menepati sasaran lif bengkel
          </p>
        </div>

        {/* Kad 2: Komisen Saya */}
        <div className="bg-white border-2 border-red-200 rounded-3xl p-5 space-y-1 shadow-sm">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 block">
            💰 Komisen Upah Terkumpul
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-bold text-red-600">RM</span>
            <span className="text-3xl font-black text-red-600 font-mono">
              {currentStat.commission.toFixed(2)}
            </span>
          </div>
          <p className="text-[10px] text-zinc-500">
            {timeframe === "month" ? `Telah Dituntut: RM ${paidCommission} • Baki: RM ${pendingCommission}` : "Dikredit automatik ke lejar"}
          </p>
        </div>

        {/* Kad 3: Purata Masa */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-5 space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 block">
            ⏱️ Purata Masa Siap
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black ">{currentStat.avgMins}</span>
            <span className="text-xs font-bold text-zinc-500">Minit / Motor</span>
          </div>
          <p className="text-[11px] text-zinc-700 font-medium">
            Pusingan lif pantas & efisien
          </p>
        </div>

        {/* Kad 4: Kualiti Sifar Comeback */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-5 space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 block">
            🛡️ Kualiti Kerja (Sifar Aduan)
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-400">{currentStat.qualityScore}</span>
          </div>
          <p className="text-[11px] text-zinc-500 font-medium">
            Tiada jentera patah balik dalam 14 hari
          </p>
        </div>
      </div>

      {/* 4. Log Garis Masa Kerja Foreman (Timeline Feed - Tanpa No. Plat) */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-none space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div>
            <h3 className="text-sm font-black flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-600" />
              <span>Log Jentera Diselesaikan ({timeframe === "today" ? "Hari Ini" : timeframe === "week" ? "7 Hari" : "Bulan Ini"})</span>
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Paparan teknikal tulen: Nombor plat peribadi pelanggan dilindungi secara selamat.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 font-mono">
            {mockCompletedJobs.length} Kerja Direkodkan
          </span>
        </div>

        {/* Senarai Kad Feed */}
        <div className="space-y-3">
          {mockCompletedJobs.map((job) => {
            const badgeColor =
              job.category === "enjin"
                ? "bg-zinc-100 text-zinc-700 border-zinc-300"
                : job.category === "cvt"
                ? "bg-zinc-100 text-zinc-700 border-zinc-300"
                : job.category === "kilat"
                ? "bg-red-50 text-red-600 border-red-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200";

            return (
              <div
                key={job.id}
                className="bg-zinc-50/80 border border-zinc-200/90 hover:border-zinc-300 rounded-2xl p-4 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-black text-xs text-brand-400">{job.woNumber}</span>
                    <span className="text-xs font-black ">&bull; {job.model}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                      {job.category.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">{job.timeAgo}</span>
                  </div>
                  <p className="text-xs text-zinc-600 font-medium">
                    {job.scope}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      {job.durationMins} Minit Masa Lif
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      {job.qcStatus}
                    </span>
                    <span className="font-mono text-zinc-400 text-[10px]">
                      [ 🔒 Rekod Plat: Dilindungi Sistem ]
                    </span>
                  </div>
                </div>

                <div className="sm:text-right shrink-0 bg-white px-3.5 py-2 rounded-xl border border-zinc-200">
                  <span className="text-[10px] text-zinc-500 block">Komisen Kerja:</span>
                  <span className="font-mono text-base font-black text-emerald-400">
                    + RM {job.commission.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: DAFTAR / SEMAK NO. PLAT MOTOR MASUK LIF KE PANGKALAN DATA */}
      {isRegisterPlateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-red-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-none">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-2xl bg-red-50 text-red-600">
                  <Bike className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black ">Daftar Plat Motor Masuk Lif</h3>
                  <p className="text-xs text-zinc-500">Simpan terus ke pangkalan data bengkel & aktifkan lif</p>
                </div>
              </div>
              <button
                onClick={() => setIsRegisterPlateModalOpen(false)}
                className="p-1 rounded-lg text-zinc-500 hover:text-red-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterPlateToDatabase} className="space-y-3.5">
              {/* No Plat Input */}
              <div>
                <label className="text-xs font-bold text-zinc-600 block mb-1">
                  1. Masukkan Nombor Plat Motor *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: VDF 8899 atau VKC 1234"
                  value={inputPlate}
                  onChange={(e) => handlePlateType(e.target.value)}
                  className="w-full bg-zinc-50 border border-red-600/50 rounded-xl px-4 py-3 text-sm font-mono font-bold uppercase text-red-600 placeholder-slate-600 focus:border-red-600 outline-none"
                  autoFocus
                  required
                />
              </div>

              {/* Status Kesan Pangkalan Data */}
              {detectedVehicle ? (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-200 text-xs space-y-1">
                  <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Pelanggan Berdaftar Dikesan: {detectedVehicle.ownerName || "Pelanggan Tetap"}
                  </span>
                  <p className="text-[11px] text-zinc-600">
                    Model: <span className="font-bold ">{detectedVehicle.model}</span> &bull; Mileage Lepas: {detectedVehicle.currentMileage || 0} KM
                  </p>
                  <p className="text-[10px] text-red-600 font-mono pt-0.5">
                    Nota Teknikal Lepas: Diservis 2 bulan lepas (Yamalube).
                  </p>
                </div>
              ) : inputPlate.trim().length >= 3 ? (
                <div className="p-3 rounded-xl bg-blue-950/30 border border-zinc-300 text-xs text-zinc-700">
                  <span className="font-bold block">✨ Plat Baharu:</span>
                  Akan dicipta sebagai profil kenderaan baharu di dalam database bengkel (D1).
                </div>
              ) : null}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600 block mb-1">
                    2. Model Motosikal
                  </label>
                  <input
                    type="text"
                    placeholder="cth: Yamaha NVX 155 / Y15ZR"
                    value={inputModel}
                    onChange={(e) => setInputModel(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600 block mb-1">
                    3. Petak Lif Ditugaskan
                  </label>
                  <select
                    value={selectedBay}
                    onChange={(e) => setSelectedBay(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs focus:border-brand-500 outline-none font-bold text-red-600"
                  >
                    <option value="Bay 1">Lif 1 (Sifu Halim)</option>
                    <option value="Bay 2">Lif 2 (Zulfa)</option>
                    <option value="Bay 3">Lif 3 (Amir)</option>
                    <option value="Bay 4">Lif 4 (Servis Kilat)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600 block mb-1">
                  4. Aduan / Kerja Disyorkan Foreman *
                </label>
                <input
                  type="text"
                  placeholder="cth: Servis CVT bergegar + tukar tayar depan botak"
                  value={inputComplaint}
                  onChange={(e) => setInputComplaint(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs focus:border-brand-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600 block mb-1">
                  5. Odometer Semasa (KM - Pilihan)
                </label>
                <input
                  type="number"
                  placeholder="24500"
                  value={inputMileage}
                  onChange={(e) => setInputMileage(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono focus:border-brand-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-lg transition-all mt-2"
              >
                {isSubmitting ? "Mendaftar ke Pangkalan Data..." : "Simpan ke Database & Aktifkan Lif"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

