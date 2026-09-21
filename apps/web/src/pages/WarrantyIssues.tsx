import React, { useState } from "react";
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
  Filter
} from "lucide-react";
import { WorkOrder } from "../types";

interface WarrantyIssue {
  id: string;
  plateNumber: string;
  customerName: string;
  customerPhone: string;
  complaint: string;
  mechanicInCharge: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "resolved" | "rejected";
  partReplaced?: string;
  createdAt: string;
}

export const WarrantyIssues: React.FC = () => {
  const [issues, setIssues] = useState<WarrantyIssue[]>([
    {
      id: "ISU-101",
      plateNumber: "VDF8899",
      customerName: "Akmal Hakim",
      customerPhone: "0123456789",
      complaint: "Bunyi gesekan kuat pada mangkuk klac selepas servis CVT 2 hari lepas.",
      mechanicInCharge: "Syafiq (Foreman)",
      severity: "high",
      status: "investigating",
      partReplaced: "Torque Spring & Roller Set",
      createdAt: "2026-09-20T14:30:00Z",
    },
    {
      id: "ISU-102",
      plateNumber: "KEE4512",
      customerName: "Razak Manan",
      customerPhone: "0198822119",
      complaint: "Minyak hitam ada titisan bocor dari skru drain plug.",
      mechanicInCharge: "Faizal",
      severity: "medium",
      status: "resolved",
      partReplaced: "Washer Drain Plug Tembaga",
      createdAt: "2026-09-18T10:15:00Z",
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlate, setNewPlate] = useState("");
  const [newName, setNewName] = useState("");
  const [newComplaint, setNewComplaint] = useState("");
  const [newMechanic, setNewMechanic] = useState("Syafiq (Foreman)");
  const [newSeverity, setNewSeverity] = useState<"low" | "medium" | "high" | "critical">("medium");

  const handleAddIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate || !newComplaint) return;

    const newIssue: WarrantyIssue = {
      id: `ISU-${Math.floor(100 + Math.random() * 900)}`,
      plateNumber: newPlate.toUpperCase(),
      customerName: newName || "Pelanggan",
      customerPhone: "0123456789",
      complaint: newComplaint,
      mechanicInCharge: newMechanic,
      severity: newSeverity,
      status: "open",
      createdAt: new Date().toISOString(),
    };

    setIssues([newIssue, ...issues]);
    setShowAddModal(false);
    setNewPlate("");
    setNewName("");
    setNewComplaint("");
  };

  const handleUpdateStatus = (id: string, newStatus: WarrantyIssue["status"]) => {
    setIssues(issues.map((i) => (i.id === id ? { ...i, status: newStatus } : i)));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <span>FFmotor HQ</span>
            <span>/</span>
            <span className="text-brand-400 font-bold">Audit Isu & Waranti</span>
          </nav>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-1">
            Penjejak Isu Kerosakan Berulang & Waranti (*Comeback*)
          </h1>
          <p className="text-xs text-slate-400">
            Log aduan motor datang semula selepas dibaiki untuk mengawal kualiti kerja mekanik dan klaim waranti part rosak.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Daftar Aduan Comeback</span>
        </button>
      </div>

      {/* Ringkasan Status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4">
          <span className="text-xs text-slate-400 font-semibold">Semua Aduan</span>
          <p className="text-2xl font-black text-white mt-1">{issues.length}</p>
        </div>
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4">
          <span className="text-xs text-amber-400 font-semibold">Sedang Disiasat</span>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {issues.filter((i) => i.status === "investigating" || i.status === "open").length}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4">
          <span className="text-xs text-emerald-400 font-semibold">Selesai Waranti</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {issues.filter((i) => i.status === "resolved").length}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4">
          <span className="text-xs text-rose-400 font-semibold">Kadar Comeback</span>
          <p className="text-2xl font-black text-rose-400 mt-1">1.8%</p>
          <span className="text-[10px] text-slate-400 font-medium">Bawah had KPI bengkel (&lt;3%)</span>
        </div>
      </div>

      {/* Senarai Isu */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white">Senarai Log Aduan & Pertikaian Pelanggan</h3>

        <div className="divide-y divide-slate-800/80">
          {issues.map((issue) => (
            <div key={issue.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-brand-400">{issue.id}</span>
                  <span className="font-mono text-sm font-black text-white">{issue.plateNumber}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      issue.severity === "critical"
                        ? "bg-rose-500/20 text-rose-400"
                        : issue.severity === "high"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {issue.severity.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400">• Pemilik: {issue.customerName}</span>
                </div>
                <p className="text-xs text-slate-300 italic">"{issue.complaint}"</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium pt-1">
                  <span>Mekanik Terlibat: <b className="text-slate-200">{issue.mechanicInCharge}</b></span>
                  {issue.partReplaced && (
                    <span>• Alat Ganti Terlibat: <b className="text-purple-300">{issue.partReplaced}</b></span>
                  )}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-2 self-start md:self-auto">
                <select
                  value={issue.status}
                  onChange={(e) => handleUpdateStatus(issue.id, e.target.value as any)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold border outline-none cursor-pointer ${
                    issue.status === "resolved"
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                      : issue.status === "investigating"
                      ? "bg-amber-950/40 text-amber-400 border-amber-500/30"
                      : issue.status === "rejected"
                      ? "bg-rose-950/40 text-rose-400 border-rose-500/30"
                      : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  <option value="open">Aduan Baru</option>
                  <option value="investigating">Sedang Disiasat</option>
                  <option value="resolved">Selesai (Ganti Part)</option>
                  <option value="rejected">Tolak (Bukan Waranti)</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Daftar Aduan Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Daftar Aduan Comeback Motor</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddIssue} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">No Pendaftaran (Plat):</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: VDF8899"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Nama Pemilik:</label>
                <input
                  type="text"
                  placeholder="Nama pelanggan"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Mekanik Yang Baiki:</label>
                <select
                  value={newMechanic}
                  onChange={(e) => setNewMechanic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-medium"
                >
                  <option value="Syafiq (Foreman)">Syafiq (Foreman)</option>
                  <option value="Faizal">Faizal</option>
                  <option value="Hakim">Hakim</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Tahap Kritikal Kerosakan:</label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-medium"
                >
                  <option value="low">Rendah (Bunyi halus/titisan kecil)</option>
                  <option value="medium">Sederhana (Prestasi kurang)</option>
                  <option value="high">Tinggi (Boleh rosakkan enjin)</option>
                  <option value="critical">Kritikal (Motor mati terus)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Penerangan Aduan Pelanggan:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Penerangan masalah..."
                  value={newComplaint}
                  onChange={(e) => setNewComplaint(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-500 shadow-md shadow-rose-950"
                >
                  Daftar Isu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

