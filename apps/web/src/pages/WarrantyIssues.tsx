import React, { useState, useEffect } from "react";
import {
  AlertOctagon,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Wrench,
  Bike,
  User,
  Search,
  Filter,
  Check,
  X
} from "lucide-react";

interface WarrantyIssue {
  id: string;
  issueCode: string;
  workOrderId?: string;
  plateNumber: string;
  customerName: string;
  customerPhone: string;
  complaint: string;
  mechanicInCharge: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "resolved" | "rejected";
  partReplaced?: string;
  resolutionNotes?: string;
  createdAt: string;
  slaHoursTarget?: number;
  slaHoursRemaining?: number;
  slaStatus?: "healthy" | "warning" | "breached";
  caseType?: "Workshop Comeback" | "Manufacturer Claim (Hong Leong Yamaha)" | "Part Defect Claim";
  escalatedToBoss?: boolean;
}

export const WarrantyIssues: React.FC = () => {
  const defaultCases: WarrantyIssue[] = [
    {
      id: "cas_1",
      issueCode: "CAS-2026-0012",
      plateNumber: "VDF 8899",
      customerName: "Mohd Akmal Hakim",
      customerPhone: "0192233445",
      complaint: "Getaran kuat pada bahagian CVT semasa mula bergerak pagi. Baru servis 3 hari lepas.",
      mechanicInCharge: "Sifu Halim (Foreman Bay 1)",
      severity: "high",
      status: "investigating",
      partReplaced: "Roller CVT & Bush Mangkuk",
      createdAt: "20 Sep 2026, 09:30 AM",
      slaHoursTarget: 48,
      slaHoursRemaining: 14,
      slaStatus: "warning",
      caseType: "Workshop Comeback",
      escalatedToBoss: false,
    },
    {
      id: "cas_2",
      issueCode: "CAS-2026-0014",
      plateNumber: "KEM 4829",
      customerName: "Tengku Daniel Hakim",
      customerPhone: "60129841029",
      complaint: "Paparan digital meter speedometer berkelip dan hilang paparan rpm. Unit motor baharu 4 bulan.",
      mechanicInCharge: "Danial (Bay 2)",
      severity: "medium",
      status: "open",
      partReplaced: "Meter Assembly OEM (B65)",
      createdAt: "21 Sep 2026, 08:45 AM",
      slaHoursTarget: 336, // 14 hari claim Hong Leong Yamaha
      slaHoursRemaining: 192,
      slaStatus: "healthy",
      caseType: "Manufacturer Claim (Hong Leong Yamaha)",
      escalatedToBoss: false,
    },
    {
      id: "cas_3",
      issueCode: "CAS-2026-0009",
      plateNumber: "VCH 3110",
      customerName: "Khairul Azhar Zain",
      customerPhone: "60195514820",
      complaint: "Minyak fork hadapan bocor teruk ke atas piring brek cakera selepas tukar oil seal semalam. Berbahaya!",
      mechanicInCharge: "Azman (Bay 3)",
      severity: "critical",
      status: "open",
      partReplaced: "Fork Oil Seal & Minyak Fork",
      createdAt: "19 Sep 2026, 11:00 AM",
      slaHoursTarget: 24,
      slaHoursRemaining: -5,
      slaStatus: "breached",
      caseType: "Workshop Comeback",
      escalatedToBoss: true,
    },
  ];

  const [issues, setIssues] = useState<WarrantyIssue[]>(defaultCases);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newPlate, setNewPlate] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newComplaint, setNewComplaint] = useState("");
  const [newMechanic, setNewMechanic] = useState("Abang Din (Ketua Mekanik)");
  const [newSeverity, setNewSeverity] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [newPart, setNewPart] = useState("");

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/warranty-issues");
      const data = await res.json();
      if (data.success && Array.isArray(data.issues)) {
        setIssues(data.issues);
      }
    } catch (err) {
      console.error("Gagal memuat aduan comeback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleAddIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate || !newComplaint) {
      alert("Sila lengkapkan nombor plat dan perincian aduan kerosakan.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/warranty-issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plateNumber: newPlate,
          customerName: newName || "Pelanggan",
          customerPhone: newPhone || "0123456789",
          complaint: newComplaint,
          mechanicInCharge: newMechanic,
          severity: newSeverity,
          partReplaced: newPart || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Aduan kerosakan semula berjaya direkodkan ke D1!");
        setShowAddModal(false);
        setNewPlate("");
        setNewName("");
        setNewPhone("");
        setNewComplaint("");
        setNewPart("");
        await fetchIssues();
      } else {
        alert("Ralat: " + (data.message || "Gagal"));
      }
    } catch (err) {
      alert("Ralat rangkaian: " + err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: "investigating" | "resolved" | "rejected") => {
    try {
      const resolutionNotes = newStatus === "resolved" ? prompt("Catatan penyelesaian (cth: Ganti washer dan ketatkan skru):") || "" : undefined;
      const res = await fetch(`/api/warranty-issues/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, resolutionNotes }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchIssues();
      }
    } catch (err) {
      alert("Ralat mengemaskini status: " + err);
    }
  };

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.complaint.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold">
            <span>FFmotor HQ</span>
            <span>/</span>
            <span className="text-brand-400 font-bold">Audit Kualiti & Comeback</span>
          </nav>
          <h1 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tight mt-1">
            Penjejakan Aduan Kerosakan Semula (*Comeback Issues*)
          </h1>
          <p className="text-xs text-zinc-500">
            Audit kerja pembaikan semula, kenal pasti punca teknikal, dan semak rekod mekanik bertugas.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Daftar Aduan Comeback</span>
        </button>
      </div>

      {/* Grid: 3 Kad Ringkasan Metrik */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm">
          <span className="text-xs font-semibold text-zinc-500 uppercase">Jumlah Kes Terbuka</span>
          <p className="text-2xl font-black text-red-600 mt-2">
            {issues.filter((i) => i.status === "open" || i.status === "investigating").length} Kes
          </p>
          <span className="text-[11px] text-zinc-500 mt-1 block">Memerlukan siasatan pit</span>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm">
          <span className="text-xs font-semibold text-zinc-500 uppercase">Selesai Dibaikpulih</span>
          <p className="text-2xl font-black text-emerald-400 mt-2">
            {issues.filter((i) => i.status === "resolved").length} Kes
          </p>
          <span className="text-[11px] text-zinc-500 mt-1 block">Tuntutan waranti ditutup</span>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm">
          <span className="text-xs font-semibold text-zinc-500 uppercase">Kadar Comeback Bengkel</span>
          <p className="text-2xl font-black text-brand-400 mt-2">1.2%</p>
          <span className="text-[11px] text-emerald-400 mt-1 block">Dalam had standard kualiti (&lt;3%)</span>
        </div>
      </div>

      {/* Carian & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari no plat / nama / kerosakan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-xl pl-9 pr-4 py-2 text-xs "
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          {["all", "open", "investigating", "resolved"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize ${
                statusFilter === st
                  ? "bg-brand-500 shadow-xs"
                  : "bg-white text-zinc-500 hover:text-red-600 border border-zinc-200"
              }`}
            >
              {st === "all" ? "Semua" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Senarai Isu Comeback */}
      <div className="rounded-2xl border border-zinc-200 bg-white/90 shadow-none overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            Memuat turun rekod aduan dari Cloudflare D1...
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            Tiada aduan kerosakan semula yang sepadan dijumpai.
          </div>
        ) : (
          <div className="divide-y divide-zinc-200/60">
            {filteredIssues.map((issue) => (
              <div key={issue.id} className="p-4 hover:bg-zinc-100/30 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black text-brand-400">{issue.issueCode}</span>
                    <span className="font-mono text-xs font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">
                      {issue.plateNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        issue.severity === "critical"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : issue.severity === "high"
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : "bg-zinc-100 text-zinc-700 border border-zinc-300"
                      }`}
                    >
                      Tahap: {issue.severity}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        issue.status === "resolved"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : issue.status === "investigating"
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      Status: {issue.status}
                    </span>

                    {issue.slaStatus && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1 ${
                          issue.slaStatus === "breached"
                            ? "bg-red-600 text-white font-black animate-pulse"
                            : issue.slaStatus === "warning"
                            ? "bg-red-50 text-red-600 border border-red-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {issue.slaStatus === "breached"
                          ? `SLA TERLANGGAR (${Math.abs(issue.slaHoursRemaining || 0)} JAM OVERDUE)`
                          : `SLA: ${issue.slaHoursRemaining} JAM TINGGAL`}
                      </span>
                    )}

                    {issue.escalatedToBoss && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white uppercase flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        ESKALASI TAUKE AKTIF
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-700 font-medium">{issue.complaint}</p>

                  <div className="flex items-center gap-3 text-[11px] text-zinc-500 flex-wrap">
                    <span>Pemilik: <b>{issue.customerName}</b> ({issue.customerPhone})</span>
                    <span>•</span>
                    <span>Mekanik Asal: <b className="text-brand-300">{issue.mechanicInCharge}</b></span>
                    {issue.partReplaced && (
                      <>
                        <span>•</span>
                        <span>Komponen Terlibat: <b>{issue.partReplaced}</b></span>
                      </>
                    )}
                    {issue.resolutionNotes && (
                      <span className="w-full text-emerald-400 font-mono text-[11px]">
                        Catatan Selesai: {issue.resolutionNotes}
                      </span>
                    )}
                  </div>
                </div>

                {/* Tindakan Status */}
                <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
                  {issue.status !== "investigating" && issue.status !== "resolved" && (
                    <button
                      onClick={() => handleUpdateStatus(issue.id, "investigating")}
                      className="px-2.5 py-1 rounded-lg bg-amber-600/30 hover:bg-red-700/50 border border-red-200 text-red-600 text-xs font-bold transition"
                    >
                      Mula Siasat
                    </button>
                  )}
                  {issue.status !== "resolved" && (
                    <button
                      onClick={() => handleUpdateStatus(issue.id, "resolved")}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Selesai Baiki</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DAFTAR ADUAN BAHARU */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-zinc-50/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 max-w-lg w-full shadow-none space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-red-600" />
                <span>Daftar Aduan Comeback Baharu</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 hover:text-red-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddIssue} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-500 font-semibold block mb-1">No Pendaftaran (Plat):</label>
                  <input
                    type="text"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                    placeholder="cth: VDF8899"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="text-zinc-500 font-semibold block mb-1">Nama Pelanggan:</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="cth: Razak"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-500 font-semibold block mb-1">No Telefon WhatsApp:</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="0123456789"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 font-semibold block mb-1">Mekanik Bertanggungjawab:</label>
                  <select
                    value={newMechanic}
                    onChange={(e) => setNewMechanic(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 font-medium"
                  >
                    <option value="Abang Din (Ketua Mekanik)">Abang Din (Ketua Mekanik)</option>
                    <option value="Syafiq (Foreman)">Syafiq (Foreman)</option>
                    <option value="Faizal">Faizal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-500 font-semibold block mb-1">Aduan Kerosakan Semula:</label>
                <textarea
                  value={newComplaint}
                  onChange={(e) => setNewComplaint(e.target.value)}
                  placeholder="Terangkan bunyi, kebocoran, atau masalah yang berulang..."
                  rows={3}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-500 font-semibold block mb-1">Tahap Kritikal:</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 font-medium"
                  >
                    <option value="low">Rendah (Bunyi halus/kosmetik)</option>
                    <option value="medium">Sederhana (Brek berbunyi/getaran)</option>
                    <option value="high">Tinggi (Bocor minyak/enjin semput)</option>
                    <option value="critical">Kritikal (Enjin mati terus/bahaya)</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-500 font-semibold block mb-1">Komponen Yang Diganti Dulu:</label>
                  <input
                    type="text"
                    value={newPart}
                    onChange={(e) => setNewPart(e.target.value)}
                    placeholder="cth: Brake Pad Nissin"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
                  <span>{submitting ? "Mendaftar..." : "Daftar Aduan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
