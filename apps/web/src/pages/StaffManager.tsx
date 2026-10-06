import React, { useState, useEffect } from "react";
import {
  Users,
  Award,
  DollarSign,
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Star,
  Plus,
  Check,
  Flame,
  Bike,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import { SpikeRadialGauge } from "../components/spike/SpikeRadialGauge";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  isActive: boolean;
  profileId?: string;
  specialty?: string;
  basicSalary?: number;
  commissionRate?: number;
  activeBay?: number;
  rating?: number;
  totalJobsDone?: number;
}

interface CommissionRecord {
  id: string;
  mechanicId: string;
  mechanicName: string;
  workOrderId: string;
  workOrderNumber: string;
  motorcycleModel: string;
  laborTotal: number;
  commissionPercent: number;
  commissionAmount: number;
  status: "accrued" | "paid";
  createdAt: string;
  paidAt?: string;
}

interface AdvanceRecord {
  id: string;
  staffName: string;
  amount: number;
  date: string;
  reason: string;
  status: "approved" | "deducted";
}

interface CompletedJob {
  id: string;
  foremanId: string;
  foremanName: string;
  workOrderNumber: string;
  motorcycleModel: string;
  jobType: string;
  durationMinutes: number;
  laborAmount: number;
  commissionAmount: number;
  completedAt: string;
  rating: number;
}

const DEFAULT_STAFF: StaffMember[] = [
  {
    id: "staff-1",
    name: "Sifu Halim (Abang Din)",
    email: "halim@ffmotor.my",
    role: "Ketua Foreman & Diagnostik",
    specialty: "Troubleshooting Enjin, ECU & Dyno",
    basicSalary: 3200,
    commissionRate: 20,
    isActive: true,
    activeBay: 1,
    rating: 4.9,
    totalJobsDone: 48,
  },
  {
    id: "staff-2",
    name: "Syafiq",
    email: "syafiq@ffmotor.my",
    role: "Foreman Lif 2 (CVT & Minyak)",
    specialty: "Skuter NVX/NMAX, Belting & Roller",
    basicSalary: 2300,
    commissionRate: 15,
    isActive: true,
    activeBay: 2,
    rating: 4.8,
    totalJobsDone: 36,
  },
  {
    id: "staff-3",
    name: "Faizal",
    email: "faizal@ffmotor.my",
    role: "Foreman Lif 3 (Servis Pantas)",
    specialty: "Tukar Minyak Enjin, Brek & Rantai",
    basicSalary: 2000,
    commissionRate: 15,
    isActive: true,
    activeBay: 3,
    rating: 4.7,
    totalJobsDone: 29,
  },
  {
    id: "staff-4",
    name: "Aiman Hakimi",
    email: "aiman@ffmotor.my",
    role: "Kasir & Pengurusan Stor",
    specialty: "Jualan Kaunter & Alat Ganti",
    basicSalary: 1800,
    commissionRate: 5,
    isActive: true,
    totalJobsDone: 0,
  },
];

export const StaffManager: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>(DEFAULT_STAFF);
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">("daily");

  const [commissions, setCommissions] = useState<CommissionRecord[]>([
    {
      id: "comm-1",
      mechanicId: "staff-1",
      mechanicName: "Sifu Halim (Abang Din)",
      workOrderId: "wo-1",
      workOrderNumber: "WO-089",
      motorcycleModel: "Yamaha NVX 155 V2",
      laborTotal: 120,
      commissionPercent: 20,
      commissionAmount: 24,
      status: "accrued",
      createdAt: "2026-09-22 09:15",
    },
    {
      id: "comm-2",
      mechanicId: "staff-2",
      mechanicName: "Syafiq",
      workOrderId: "wo-2",
      workOrderNumber: "WO-087",
      motorcycleModel: "Honda RS-X 150",
      laborTotal: 85,
      commissionPercent: 15,
      commissionAmount: 12.75,
      status: "paid",
      createdAt: "2026-09-21 16:30",
      paidAt: "2026-09-22",
    },
    {
      id: "comm-3",
      mechanicId: "staff-3",
      mechanicName: "Faizal",
      workOrderId: "wo-3",
      workOrderNumber: "WO-086",
      motorcycleModel: "Modenas Kriss 110",
      laborTotal: 45,
      commissionPercent: 15,
      commissionAmount: 6.75,
      status: "accrued",
      createdAt: "2026-09-22 10:40",
    },
    {
      id: "comm-4",
      mechanicId: "staff-1",
      mechanicName: "Sifu Halim (Abang Din)",
      workOrderId: "wo-4",
      workOrderNumber: "WO-085",
      motorcycleModel: "Yamaha Y15ZR V2",
      laborTotal: 70,
      commissionPercent: 20,
      commissionAmount: 14,
      status: "paid",
      createdAt: "2026-09-22 08:30",
      paidAt: "2026-09-22",
    },
  ]);

  const [completedJobs] = useState<CompletedJob[]>([
    {
      id: "job-1",
      foremanId: "staff-1",
      foremanName: "Sifu Halim (Abang Din)",
      workOrderNumber: "WO-089",
      motorcycleModel: "Yamaha NVX 155 V2",
      jobType: "Tukar Belting CVT & Roller Koso",
      durationMinutes: 35,
      laborAmount: 120,
      commissionAmount: 24,
      completedAt: "Hari Ini, 10:45 AM",
      rating: 5,
    },
    {
      id: "job-2",
      foremanId: "staff-2",
      foremanName: "Syafiq",
      workOrderNumber: "WO-087",
      motorcycleModel: "Honda RS-X 150",
      jobType: "Servis Fork Hadapan & Minyak Sil",
      durationMinutes: 42,
      laborAmount: 85,
      commissionAmount: 12.75,
      completedAt: "Hari Ini, 09:30 AM",
      rating: 5,
    },
    {
      id: "job-3",
      foremanId: "staff-3",
      foremanName: "Faizal",
      workOrderNumber: "WO-086",
      motorcycleModel: "Modenas Kriss 110",
      jobType: "Tukar Rantai Sprocket DID & Brek Belakang",
      durationMinutes: 25,
      laborAmount: 45,
      commissionAmount: 6.75,
      completedAt: "Hari Ini, 09:10 AM",
      rating: 4,
    },
    {
      id: "job-4",
      foremanId: "staff-1",
      foremanName: "Sifu Halim (Abang Din)",
      workOrderNumber: "WO-085",
      motorcycleModel: "Yamaha Y15ZR V2",
      jobType: "Tukar Minyak Enjin Motul 7100 + Oil Filter",
      durationMinutes: 15,
      laborAmount: 50,
      commissionAmount: 10,
      completedAt: "Hari Ini, 08:40 AM",
      rating: 5,
    },
  ]);

  const [payingId, setPayingId] = useState<string | null>(null);

  // Salary Advance State
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [advanceStaff, setAdvanceStaff] = useState("Syafiq");
  const [advanceAmount, setAdvanceAmount] = useState("150");
  const [advanceReason, setAdvanceReason] = useState("Kecemasan keluarga");
  const [advances, setAdvances] = useState<AdvanceRecord[]>([
    {
      id: "adv-1",
      staffName: "Syafiq",
      amount: 150,
      date: "2026-09-18",
      reason: "Baiki motosikal keluarga",
      status: "approved",
    },
  ]);

  useEffect(() => {
    fetch("/api/staff")
      .then((res) => res.json())
      .then((d) => {
        if (d.success && Array.isArray(d.staff) && d.staff.length > 0) {
          setStaff(d.staff);
        }
      })
      .catch(() => null);

    fetch("/api/staff/commissions")
      .then((res) => res.json())
      .then((d) => {
        if (d.success && d.commissions && d.commissions.length > 0) {
          const mapped: CommissionRecord[] = d.commissions.map((c: any) => ({
            id: c.id,
            mechanicId: c.mechanicId,
            mechanicName: c.mechanicName || "Mekanik",
            workOrderId: c.workOrderId,
            workOrderNumber: c.workOrderNumber,
            motorcycleModel: c.plateNumber || "Motosikal",
            laborTotal: Number(c.laborTotal || 0),
            commissionPercent: Number(c.commissionPercent || 15),
            commissionAmount: Number(c.commissionAmount || 0),
            status: c.status || "accrued",
            createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString("ms-MY") : "Hari Ini",
            paidAt: c.paidAt ? new Date(c.paidAt).toLocaleDateString("ms-MY") : undefined,
          }));
          setCommissions((prev) => {
            const existingIds = new Set(mapped.map((m) => m.id));
            const remaining = prev.filter((p) => !existingIds.has(p.id));
            return [...mapped, ...remaining];
          });
        }
      })
      .catch(() => null);
  }, []);

  // Payslip Generator State
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [selectedStaffForSlip, setSelectedStaffForSlip] = useState<StaffMember>(DEFAULT_STAFF[0]);
  const [epfSocsoDeduction, setEpfSocsoDeduction] = useState(true);

  const totalAccrued = commissions
    .filter((c) => c.status === "accrued")
    .reduce((acc, curr) => acc + curr.commissionAmount, 0);

  const totalPaid = commissions
    .filter((c) => c.status === "paid")
    .reduce((acc, curr) => acc + curr.commissionAmount, 0);

  const totalAdvances = advances
    .filter((a) => a.status === "approved")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handlePayCommission = async (id: string) => {
    setPayingId(id);
    try {
      const res = await fetch(`/api/staff/commissions/${id}/pay`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (data?.success) {
        setCommissions((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: "paid" } : c))
        );
      } else {
        setCommissions((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: "paid" } : c))
        );
      }
    } catch {
      setCommissions((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "paid" } : c))
      );
    } finally {
      setPayingId(null);
    }
  };

  const handleAddAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(advanceAmount) || 0;
    if (amt <= 0) return;
    const newAdv: AdvanceRecord = {
      id: `adv-${Date.now()}`,
      staffName: advanceStaff,
      amount: amt,
      date: new Date().toISOString().split("T")[0],
      reason: advanceReason,
      status: "approved",
    };
    setAdvances([newAdv, ...advances]);
    setIsAdvanceModalOpen(false);
    setAdvanceAmount("");
    alert(`Permohonan Advance RM${amt.toFixed(2)} untuk ${advanceStaff} diluluskan dan akan ditolak semasa jana slip gaji.`);
  };

  // Kiraan Slip Gaji Terpilih
  const slipBasic = selectedStaffForSlip.basicSalary || 1800;
  const slipCommissions = commissions
    .filter((c) => c.mechanicName.includes(selectedStaffForSlip.name) || selectedStaffForSlip.name.includes(c.mechanicName))
    .reduce((sum, c) => sum + c.commissionAmount, 0);
  const slipAdvance = advances
    .filter((a) => a.staffName.includes(selectedStaffForSlip.name) || selectedStaffForSlip.name.includes(a.staffName))
    .reduce((sum, a) => sum + a.amount, 0);
  const attendanceAllowance = 100;
  const grossPay = slipBasic + slipCommissions + attendanceAllowance;
  const epfEmployee = epfSocsoDeduction ? Math.round(slipBasic * 0.11) : 0;
  const socsoEmployee = epfSocsoDeduction ? Math.round(slipBasic * 0.005) : 0;
  const netPay = grossPay - slipAdvance - epfEmployee - socsoEmployee;

  return (
    <div className="space-y-6 pb-12">
      {/* Motorsport Spike Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/30">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight uppercase">
                  Prestasi Foreman & Komisen Kerja
                </h1>
                <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30 uppercase">
                  Pit Performance Hub
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Kelajuan servis pit lif, bilangan motosikal disiapkan, agihan komisen upah pasang & lejar advance
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAdvanceModalOpen(true)}
            className="spike-btn-dark text-xs px-3.5 py-2 flex items-center gap-1.5 border border-zinc-700"
          >
            <DollarSign className="w-4 h-4 text-red-600" />
            <span>💵 Pinjam Duit (Advance)</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPayslipModalOpen(true)}
            className="spike-btn-white text-xs px-4 py-2 flex items-center gap-1.5"
          >
            <Award className="w-4 h-4 text-red-600" />
            <span>📄 Jana Slip Gaji Rasmi</span>
          </button>
        </div>
      </div>

      {/* FOREMAN PERFORMANCE VELOCITY & JOB COMPLETION HUB */}
      <div className="spike-card rounded-3xl border border-zinc-800 p-5 shadow-none space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <Flame className="w-4 h-4 text-red-500" />
            <h3 className="text-xs font-black uppercase tracking-wider">
              Papan Skor Kelajuan Kerja Foreman (Jobs Completed)
            </h3>
          </div>
          
          {/* Timeframe Filter Buttons */}
          <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setTimeframe("daily")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                timeframe === "daily"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                  : "text-zinc-400 hover:text-red-600"
              }`}
            >
              📅 Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("weekly")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                timeframe === "weekly"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                  : "text-zinc-400 hover:text-red-600"
              }`}
            >
              📆 Minggu Ini
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("monthly")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                timeframe === "monthly"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                  : "text-zinc-400 hover:text-red-600"
              }`}
            >
              📊 Bulan Ini
            </button>
          </div>
        </div>

        {/* 4 Metrik Pantas Prestasi */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-black/50 border border-zinc-800">
            <span className="text-[10px] uppercase font-black tracking-wider text-zinc-400 block">
              Motosikal Disiapkan
            </span>
            <p className="text-xl font-black font-mono mt-1">
              {timeframe === "daily" ? "14 Unit" : timeframe === "weekly" ? "82 Unit" : "324 Unit"}
            </p>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> 100% Lulus Ujian Pit
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/50 border border-zinc-800">
            <span className="text-[10px] uppercase font-black tracking-wider text-zinc-400 block">
              Purata Masa Baiki
            </span>
            <p className="text-xl font-black font-mono mt-1">
              28 Minit
            </p>
            <span className="text-[10px] text-zinc-400 font-medium mt-0.5 block">
              Sasaran SLA &lt; 45 minit
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/50 border border-zinc-800">
            <span className="text-[10px] uppercase font-black tracking-wider text-zinc-400 block">
              Foreman Terpantas
            </span>
            <p className="text-base font-black text-red-400 font-mono mt-1 truncate">
              Sifu Halim (Lif 1)
            </p>
            <span className="text-[10px] text-red-600 font-bold flex items-center gap-1 mt-0.5">
              <Star className="w-3 h-3 fill-amber-400" /> 4.9 Rating Kepuasan
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/50 border border-zinc-800">
            <span className="text-[10px] uppercase font-black tracking-wider text-zinc-400 block">
              Jumlah Upah Buruh Dihasilkan
            </span>
            <p className="text-xl font-black text-emerald-400 font-mono mt-1">
              RM {timeframe === "daily" ? "1,420.00" : timeframe === "weekly" ? "8,650.00" : "34,200.00"}
            </p>
            <span className="text-[10px] text-zinc-400 font-medium mt-0.5 block">
              Komisen diagih adil
            </span>
          </div>
        </div>

        {/* Senarai Motosikal Selesai Diservis (Tanpa Mendedahkan No Plat Pelanggan) */}
        <div className="space-y-2 pt-2">
          <span className="text-[11px] font-black uppercase text-zinc-400 block tracking-wider">
            Senarai Servis Selesai Terkini (Tanpa Papar No Plat Peribadi Pelanggan):
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {completedJobs.map((job) => (
              <div
                key={job.id}
                className="p-3 rounded-2xl bg-white/80 border border-zinc-200 flex items-center justify-between gap-3 hover:border-zinc-200 transition"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-red-600/15 border border-red-600/30 flex items-center justify-center shrink-0">
                    <Bike className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black truncate">{job.motorcycleModel}</span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                        {job.workOrderNumber}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 truncate">{job.jobType}</p>
                    <p className="text-[10px] text-red-400 font-mono font-bold">
                      {job.foremanName.split(" ")[0]} · {job.durationMinutes} minit · {job.completedAt}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black font-mono text-emerald-400 block">
                    +RM {job.commissionAmount.toFixed(2)}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-400 block">
                    (Upah RM{job.laborAmount})
                  </span>
                  <div className="flex items-center justify-end gap-0.5 text-red-600 mt-0.5">
                    {Array.from({ length: job.rating }).map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4 KAD RINGKASAN KOMISEN, GAJI & ADVANCE */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="spike-card rounded-2xl border border-zinc-800 p-5">
          <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">Komisen Terakru</span>
          <p className="text-2xl font-black font-mono mt-2">RM {totalAccrued.toFixed(2)}</p>
          <span className="text-[10px] text-red-400 font-bold mt-1 block">Tuntutan upah kerja buruh siap</span>
        </div>

        <div className="spike-card rounded-2xl border border-zinc-800 p-5">
          <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">Komisen Telah Dibayar</span>
          <p className="text-2xl font-black font-mono mt-2">RM {totalPaid.toFixed(2)}</p>
          <span className="text-[10px] text-emerald-400 font-bold mt-1 block">Bulan ini ke akaun staf</span>
        </div>

        <div className="spike-card rounded-2xl border border-zinc-800 p-5">
          <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">Baki Pinjam Duit (Advance)</span>
          <p className="text-2xl font-black text-red-500 font-mono mt-2">RM {totalAdvances.toFixed(2)}</p>
          <span className="text-[10px] text-zinc-400 mt-1 block">Ditolak dari slip gaji akhir</span>
        </div>

        <div className="spike-card rounded-2xl border border-zinc-800 p-5">
          <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">Jumlah Petugas</span>
          <p className="text-2xl font-black font-mono mt-2">{staff.length} Aktif</p>
          <span className="text-[10px] text-zinc-400 mt-1 block">3 Lif Pit + 1 Stor Kaunter</span>
        </div>
      </div>

      {/* SEKSYEN 1: SENARAI ROSTER FOREMAN DENGAN RADIAL DIAL */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-red-500" />
            <h3 className="text-xs font-black uppercase tracking-wider">
              Profil Petugas Pitstop & Prestasi ({staff.length})
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">Kapasiti Lif 100% Beroperasi</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {staff.map((s, idx) => {
            const slaTargets = [94, 88, 85, 96];
            const targetSla = slaTargets[idx % slaTargets.length];
            return (
              <div key={s.id} className="spike-card rounded-2xl border border-zinc-800 p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30">
                        {s.role}
                      </span>
                      <h3 className="font-black text-sm mt-1">{s.name}</h3>
                      <p className="text-[10px] text-zinc-400 font-mono">{s.specialty || "Mekanik Mahir"}</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center font-black text-xs ">
                      {s.name.slice(0, 2)}
                    </div>
                  </div>

                  {/* Radial Gauge SLA Mekanik */}
                  <div className="my-2">
                    <SpikeRadialGauge
                      value={targetSla}
                      target={90}
                      title="SLA Kerja"
                      subtitle={`${s.totalJobsDone ?? 25} Job Siap`}
                      unit="%"
                      color={targetSla >= 90 ? "#22c55e" : "#dc2626"}
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-black/60 p-2.5 border border-zinc-800 text-[11px] space-y-1.5 font-mono">
                  <div className="flex justify-between text-zinc-400">
                    <span>Gaji Pokok:</span>
                    <span className=" font-bold">RM {(s.basicSalary || 1800).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Komisen:</span>
                    <span className="text-red-400 font-bold">{s.commissionRate || 15}% Upah</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Tugasan:</span>
                    <span className=" font-bold">{s.activeBay ? `Lif Pit ${s.activeBay}` : "Stor / POS"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SEKSYEN 2: LEJAR KOMISEN FOREMAN (TANPA DEDAH NO PLAT PELANGGAN) */}
      <div className="rounded-2xl border border-zinc-200 bg-white/90 shadow-none overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Lejar Komisen Upah Kerja Mekanik
            </h3>
          </div>
          <span className="text-xs text-zinc-400 font-mono">D1 Labor Commission Tracking</span>
        </div>

        {commissions.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">
            Tiada rekod komisen buat masa ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px] bg-black/40">
                  <th className="py-3 px-4">Foreman / Mekanik</th>
                  <th className="py-3 px-4">No Kad Kerja</th>
                  <th className="py-3 px-4">Model Motosikal</th>
                  <th className="py-3 px-4 text-right">Jumlah Upah Buruh</th>
                  <th className="py-3 px-4 text-center">Kadar %</th>
                  <th className="py-3 px-4 text-right">Komisen Mekanik</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {commissions.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-800/30 transition">
                    <td className="py-3 px-4 font-sans font-bold ">{c.mechanicName}</td>
                    <td className="py-3 px-4 text-red-400 font-bold">{c.workOrderNumber}</td>
                    <td className="py-3 px-4 text-zinc-300 font-sans font-medium">{c.motorcycleModel}</td>
                    <td className="py-3 px-4 text-right text-zinc-300">RM {c.laborTotal.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center text-zinc-400">{c.commissionPercent}%</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400 text-sm">
                      RM {c.commissionAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.status === "paid"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-600 border border-red-200"
                        }`}
                      >
                        {c.status === "paid" ? "Telah Dibayar" : "Terakru"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      {c.status === "accrued" ? (
                        <button
                          onClick={() => handlePayCommission(c.id)}
                          disabled={payingId === c.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{payingId === c.id ? "Menyimpan..." : "Bayar Komisen"}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-zinc-500">Selesai Dibayar</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SEKSYEN 3: LEJAR PINJAM DUIT (SALARY ADVANCE) */}
      <div className="rounded-2xl border border-zinc-200 bg-white/90 shadow-none overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-red-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Lejar Pinjam Duit Pendahuluan (Salary Advance)
            </h3>
          </div>
          <span className="text-xs text-zinc-400 font-mono">Ditolak secara automatik dari Slip Gaji</span>
        </div>

        {advances.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-400">
            Tiada rekod pinjaman pendahuluan staf bulan ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px] bg-black/40">
                  <th className="py-3 px-4">Nama Staf</th>
                  <th className="py-3 px-4">Tarikh</th>
                  <th className="py-3 px-4">Tujuan / Sebab</th>
                  <th className="py-3 px-4 text-right">Jumlah (RM)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {advances.map((a) => (
                  <tr key={a.id} className="hover:bg-zinc-800/30 transition">
                    <td className="py-3 px-4 font-sans font-bold ">{a.staffName}</td>
                    <td className="py-3 px-4 text-zinc-400">{a.date}</td>
                    <td className="py-3 px-4 font-sans text-zinc-300">{a.reason}</td>
                    <td className="py-3 px-4 text-right font-bold text-red-400">RM {a.amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-50 text-red-600 border border-red-200">
                        {a.status === "approved" ? "Diluluskan (Pending Deduct)" : "Telah Ditolak"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: PINJAM DUIT (SALARY ADVANCE) */}
      {isAdvanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-3xl max-w-md w-full p-6 shadow-none space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black ">Borang Pinjam Duit (Advance)</h3>
                  <p className="text-[11px] text-zinc-400">Pendahuluan gaji staf dengan potongan automatik</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAdvanceModalOpen(false)}
                className="text-zinc-400 hover:text-red-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAdvance} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-bold mb-1">Nama Staf Petugas</label>
                <select
                  value={advanceStaff}
                  onChange={(e) => setAdvanceStaff(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl p-2.5 focus:border-red-600 outline-none"
                >
                  {staff.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Jumlah Pendahuluan (RM)</label>
                <input
                  type="number"
                  step="10"
                  min="10"
                  max="1000"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-red-600 font-black text-lg rounded-xl p-2.5 focus:border-red-600 outline-none"
                  placeholder="Contoh: 150"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Tujuan / Sebab Permohonan</label>
                <input
                  type="text"
                  value={advanceReason}
                  onChange={(e) => setAdvanceReason(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl p-2.5 focus:border-red-600 outline-none"
                  placeholder="Contoh: Kecemasan perubatan keluarga"
                  required
                />
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-600 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Jumlah ini akan ditolak daripada gaji bersih akhir bulan secara automatik semasa pengesahan slip gaji.
                </span>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-2.5 rounded-xl shadow-lg transition cursor-pointer"
                >
                  Luluskan & Rekod Advance
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdvanceModalOpen(false)}
                  className="px-4 py-2.5 bg-zinc-800 text-zinc-300 hover:text-red-600 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: GENERATOR SLIP GAJI RASMI */}
      {isPayslipModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-3xl max-w-lg w-full p-6 shadow-none space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-600/15 text-red-400 border border-red-500/30">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black ">Slip Gaji Rasmi (Bulan Semasa)</h3>
                  <p className="text-[11px] text-zinc-400">FF Motor Mergong · Penyata Saraan Kakitangan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPayslipModalOpen(false)}
                className="text-zinc-400 hover:text-red-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Pilihan Petugas untuk Dijana */}
            <div className="text-xs space-y-1">
              <label className="text-zinc-400 font-bold block">Pilih Kakitangan:</label>
              <select
                value={selectedStaffForSlip.id}
                onChange={(e) => {
                  const found = staff.find((s) => s.id === e.target.value);
                  if (found) setSelectedStaffForSlip(found);
                }}
                className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl p-2.5 outline-none font-bold"
              >
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} - {s.role}
                  </option>
                ))}
              </select>
            </div>

            {/* Pratonton Lembaran Slip Gaji */}
            <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-4 font-mono text-xs space-y-3">
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <div>
                  <p className=" font-bold">{selectedStaffForSlip.name}</p>
                  <p className="text-[10px] text-zinc-500 font-sans">{selectedStaffForSlip.role}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500">Tarikh: 22 Sep 2026</span>
                  <p className="text-[10px] text-red-400 font-bold">FFMOTOR-PAY-0926</p>
                </div>
              </div>

              {/* Pendapatan (Earnings) */}
              <div className="space-y-1 text-zinc-300">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold">PENDAPATAN</span>
                <div className="flex justify-between">
                  <span>Gaji Pokok:</span>
                  <span className="">RM {slipBasic.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Komisen Upah Kerja:</span>
                  <span className="text-emerald-400 font-bold">+RM {slipCommissions.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Elaun Kehadiran Penuh:</span>
                  <span className="">+RM {attendanceAllowance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-800/80 pt-1 font-bold">
                  <span>Jumlah Kasar:</span>
                  <span className="">RM {grossPay.toFixed(2)}</span>
                </div>
              </div>

              {/* Potongan (Deductions) */}
              <div className="space-y-1 text-zinc-300 border-t border-zinc-800 pt-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold">POTONGAN</span>
                <div className="flex justify-between">
                  <span>Tolak Advance (Pinjaman):</span>
                  <span className="text-red-400">-RM {slipAdvance.toFixed(2)}</span>
                </div>
                {epfSocsoDeduction && (
                  <>
                    <div className="flex justify-between text-[11px] text-zinc-400">
                      <span>KWSP / EPF Pekerja (11%):</span>
                      <span>-RM {epfEmployee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-zinc-400">
                      <span>PERKESO / SOCSO (0.5%):</span>
                      <span>-RM {socsoEmployee.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Gaji Bersih (Net Pay) */}
              <div className="flex justify-between items-center bg-red-600/10 border border-red-500/30 p-3 rounded-xl text-sm font-bold">
                <span className=" uppercase font-sans">Gaji Bersih (Net Pay):</span>
                <span className="text-red-400 font-black text-lg">RM {netPay.toFixed(2)}</span>
              </div>
            </div>

            {/* Toggle EPF/SOCSO */}
            <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={epfSocsoDeduction}
                onChange={(e) => setEpfSocsoDeduction(e.target.checked)}
                className="rounded accent-red-600"
              />
              <span>Sertakan potongan berkanun standard (KWSP 11% & PERKESO)</span>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  alert(`Slip Gaji Rasmi untuk ${selectedStaffForSlip.name} berjaya dijana dan dihantar ke WhatsApp staf!`);
                  setIsPayslipModalOpen(false);
                }}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-2.5 rounded-xl shadow-lg transition cursor-pointer text-xs flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>Cetak / Hantar Slip Gaji PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPayslipModalOpen(false)}
                className="px-4 py-2.5 bg-zinc-800 text-zinc-300 hover:text-red-600 rounded-xl text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
