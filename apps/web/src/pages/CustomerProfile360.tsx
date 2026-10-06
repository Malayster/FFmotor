import React, { useState, useEffect } from "react";
import {
  User,
  Phone,
  Bike,
  CreditCard,
  History,
  FileText,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  Calendar,
  DollarSign,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Camera,
  MapPin,
  CheckCircle2,
  Clock,
  MessageSquare,
  Plus,
  Upload,
  Download
} from "lucide-react";
import { Vehicle, WorkOrder } from "../types";

interface ActivityLogItem {
  id: string;
  type: "call" | "meeting" | "whatsapp" | "note";
  date: string;
  staff: string;
  title: string;
  detail: string;
}

interface CustomerDocument {
  id: string;
  name: string;
  category: "MyKad IC" | "Slip Gaji" | "Geran JPJ (VOC)" | "Polisi Insurans" | "PDI Checklist";
  uploadedAt: string;
  status: "verified" | "pending";
  fileSize: string;
}

interface CustomerProfile360Props {
  initialPhone?: string;
  vehicles: Vehicle[];
  workOrders: WorkOrder[];
  onOpenPassport?: (plate: string) => void;
  onOpenTrack?: (token: string) => void;
  onBack?: () => void;
}

export const CustomerProfile360: React.FC<CustomerProfile360Props> = ({
  initialPhone = "0192233445",
  vehicles,
  workOrders,
  onOpenPassport,
  onOpenTrack,
  onBack,
}) => {
  const [searchPhone, setSearchPhone] = useState(initialPhone);

  // BottleCRM Activity Feed State
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([
    {
      id: "act_1",
      type: "call",
      date: "21 Sep 2026, 02:15 PM",
      staff: "Siti Sarah (SA)",
      title: "Panggilan Susulan Permohonan Pinjaman NVX 155",
      detail: "Pelanggan sahkan gaji masuk 25hb. Minta simpan warna Matte Cyan. Dokumen slip gaji telah dihantar ke WhatsApp.",
    },
    {
      id: "act_2",
      type: "whatsapp",
      date: "20 Sep 2026, 11:30 AM",
      staff: "Aiman Hakimi",
      title: "Penghantaran Sebut Harga Servis Belting CVT",
      detail: "Pelanggan minta diskaun upah. Dipersetujui diskaun RM10 di bawah baucar SERVIS-JIMAT10.",
    },
    {
      id: "act_3",
      type: "meeting",
      date: "15 Jun 2026, 10:00 AM",
      staff: "Farhan (Tauke)",
      title: "Ujian Tunggang (Test Ride) Showroom Mergong",
      detail: "Pelanggan mencuba Yamaha NVX 155 V2. Sangat berpuas hati dengan sistem brek ABS & ruang simpanan bawah pelana.",
    },
  ]);

  const [newLog, setNewLog] = useState({
    type: "call" as const,
    title: "",
    detail: "",
    staff: "Siti Sarah",
  });
  const [showAddLogModal, setShowAddLogModal] = useState(false);

  // BottleCRM Document Vault State
  const [documents, setDocuments] = useState<CustomerDocument[]>([
    {
      id: "doc_1",
      name: "Salinan_MyKad_Depan_Belakang_Akmal.pdf",
      category: "MyKad IC",
      uploadedAt: "14 Jan 2023",
      status: "verified",
      fileSize: "1.2 MB",
    },
    {
      id: "doc_2",
      name: "Slip_Gaji_3_Bulan_Jun_Jul_Ogos_2026.pdf",
      category: "Slip Gaji",
      uploadedAt: "18 Sep 2026",
      status: "verified",
      fileSize: "3.4 MB",
    },
    {
      id: "doc_3",
      name: "Geran_Motosikal_JPJ_VOC_VDF8899.pdf",
      category: "Geran JPJ (VOC)",
      uploadedAt: "22 Feb 2024",
      status: "verified",
      fileSize: "850 KB",
    },
    {
      id: "doc_4",
      name: "Sijil_Pemeriksaan_PDI_Showroom.pdf",
      category: "PDI Checklist",
      uploadedAt: "21 Sep 2026",
      status: "pending",
      fileSize: "520 KB",
    },
  ]);

  // Profil pelanggan demo realistik ala Johan30 Fail Pelanggan
  const [customer, setCustomer] = useState({
    nama: "Mohd Akmal Hakim bin Zulkifli",
    telefon: initialPhone,
    ic: "940812-10-5543",
    alamat: "No. 45, Jalan Anggerik 3/2, Bukit Sentosa",
    poskod: "48300",
    bandar: "Rawang, Selangor",
    catatan: "Pelanggan VIP sejak 2023. Sangat teliti mengenai minyak enjin fully synthetic & servis CVT berjadual.",
    tier: "Emas (VIP)",
    jumlahPerbelanjaan: 1840.0,
    bakiTertunggak: 0.0,
    tarikhDaftar: "14 Januari 2023",
  });

  // Tapis kenderaan milik pelanggan ini
  const customerVehicles = vehicles.filter(
    (v) =>
      v.ownerPhone?.replace(/\D/g, "") === searchPhone.replace(/\D/g, "") ||
      v.ownerName?.toLowerCase().includes("akmal")
  );

  // Tapis kad kerja milik pelanggan ini
  const customerWorkOrders = workOrders.filter(
    (w) =>
      w.ownerPhone?.replace(/\D/g, "") === searchPhone.replace(/\D/g, "") ||
      w.ownerName?.toLowerCase().includes("akmal")
  );

  // Garis Masa Audit Aktiviti (capMasa ala Johan30)
  const auditTimeline = [
    {
      id: "aud_1",
      kod: "SERVIS_SELESAI",
      label: "Servis Berkala & Penukaran Belting CVT Siap",
      pada: "21 Sep 2026, 11:30 AM",
      petugas: "Sifu Halim (Foreman)",
      nada: "emerald",
    },
    {
      id: "aud_2",
      kod: "VO_LULUS",
      label: "Variation Order RM85.00 Diluluskan oleh Pemilik di WhatsApp",
      pada: "21 Sep 2026, 10:20 AM",
      petugas: "Pelanggan Sendiri",
      nada: "blue",
    },
    {
      id: "aud_3",
      kod: "INTAKE",
      label: "Ketibaan Motosikal & Diagnosis 12-Titik Disaring",
      pada: "21 Sep 2026, 09:30 AM",
      petugas: "Siti Sarah (Service Advisor)",
      nada: "amber",
    },
    {
      id: "aud_4",
      kod: "BAYARAN_Z",
      label: "Bayaran Penuh RM130.00 Diterima melalui DuitNow QR (REC-88412)",
      pada: "15 Jun 2026, 04:15 PM",
      petugas: "Aiman (Kasir)",
      nada: "purple",
    },
    {
      id: "aud_5",
      kod: "WARANTI_CLAIM",
      label: "Tuntutan Waranti Mentol Lampu LED Diselesaikan Serta-merta",
      pada: "12 Mac 2026, 02:40 PM",
      petugas: "Danial (Mekanik)",
      nada: "slate",
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhone.trim()) return;
    // Mock update search
    setCustomer((prev) => ({ ...prev, telefon: searchPhone }));
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* 1. Header Bar Carian Fail 360 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-zinc-100 text-zinc-700 border border-zinc-300 font-black">
              <User className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-300">
                  DOSSIER PELANGGAN 360
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  ● D1 Profile Sync
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900 mt-0.5">
                Lejar Profil Pelanggan Menyeluruh
              </h1>
            </div>
          </div>
        </div>

        {/* Borang Carian Pantas Telefon */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari no. telefon pelanggan..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="bg-white border border-zinc-300 rounded-xl px-3.5 py-2 pl-9 text-xs placeholder-zinc-400 font-mono focus:outline-none focus:border-brand-500 w-60"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>
          <button
            type="submit"
            className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-2 px-3.5 rounded-xl text-xs"
          >
            Cari
          </button>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-xs text-zinc-500 hover:text-red-600 px-3 py-2 rounded-xl border border-zinc-200 hover:bg-white"
            >
              Kembali
            </button>
          )}
        </form>
      </div>

      {/* 2. Kad Semakan Pantas (Semakan Pantas ala Johan30) */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-none relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
              {customer.nama.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-zinc-900">{customer.nama}</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">
                  {customer.tier}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 mt-1 font-mono">
                <span className="flex items-center gap-1 text-zinc-600">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> {customer.telefon}
                </span>
                <span>IC: {customer.ic}</span>
                <span>Daftar: {customer.tarikhDaftar}</span>
              </div>
              <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-700 shrink-0" />
                {customer.alamat}, {customer.poskod} {customer.bandar}
              </p>
            </div>
          </div>

          {/* 3 Angka Metrik Utama Pelanggan */}
          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-zinc-200 pt-4 md:pt-0 md:pl-6 text-xs">
            <div>
              <span className="text-zinc-400 block text-[11px]">Total Perbelanjaan:</span>
              <span className="font-mono text-lg font-black text-zinc-900">
                RM {customer.jumlahPerbelanjaan.toFixed(2)}
              </span>
              <span className="text-[10px] text-emerald-400 block font-bold">5 Servis Selesai</span>
            </div>
            <div className="border-l border-zinc-200 pl-4">
              <span className="text-zinc-400 block text-[11px]">Baki Tertunggak:</span>
              <span className="font-mono text-lg font-black text-emerald-400">
                RM {customer.bakiTertunggak.toFixed(2)}
              </span>
              <span className="text-[10px] text-zinc-500 block">Tiada Tunggakan</span>
            </div>
          </div>
        </div>
      </div>

      {/* DOSSIER PELANGGAN 360 LENGKAP - ALIRAN TUNGGAL BERTERUSAN */}
      {/* SEKSYEN 1: ACTIVITY FEED BOTTLECRM */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-none space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
            <div>
              <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-400" />
                Garis Masa Interaksi & Log Aktiviti Pelanggan (BottleCRM Standard)
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Rekod setiap panggilan telefon, mesej WhatsApp, perjumpaan showroom dan nota kakitangan.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddLogModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Catat Log Panggilan/Nota</span>
            </button>
          </div>

          {/* Senarai Aktiviti Timeline */}
          <div className="space-y-3 pt-2">
            {activityLogs.map((log) => (
              <div
                key={log.id}
                className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex items-start gap-3.5 text-xs hover:border-zinc-300 transition"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 mt-0.5 border ${
                    log.type === "call"
                      ? "bg-zinc-100 text-zinc-700 border-zinc-300"
                      : log.type === "whatsapp"
                      ? "bg-emerald-50 text-emerald-400 border-emerald-200"
                      : "bg-zinc-100 text-zinc-700 border-zinc-300"
                  }`}
                >
                  {log.type === "call" ? (
                    <Phone className="w-4 h-4" />
                  ) : log.type === "whatsapp" ? (
                    <MessageSquare className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-zinc-900 text-xs">{log.title}</span>
                    <span className="font-mono text-[10px] text-zinc-400 shrink-0">{log.date}</span>
                  </div>
                  <p className="text-zinc-600 leading-relaxed text-xs">{log.detail}</p>
                  <p className="text-[10px] text-zinc-400 font-mono">Dicatat oleh: {log.staff}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Tambah Log Interaksi */}
          {showAddLogModal && (
            <div className="p-4 rounded-2xl bg-zinc-50 border border-brand-500/40 space-y-3 text-xs">
              <h4 className="font-bold text-zinc-900 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-brand-400" />
                Catat Interaksi Baru Dengan Pelanggan
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={newLog.type}
                  onChange={(e) => setNewLog({ ...newLog, type: e.target.value as any })}
                  className="bg-white border border-zinc-300 rounded-xl p-2 "
                >
                  <option value="call">Panggilan Telefon (Call)</option>
                  <option value="whatsapp">Mesej WhatsApp</option>
                  <option value="meeting">Perjumpaan di Kedai / Showroom</option>
                  <option value="note">Nota Dalaman Staf</option>
                </select>
                <input
                  type="text"
                  placeholder="Tajuk Ringkas (cth: Follow-up Loan)"
                  value={newLog.title}
                  onChange={(e) => setNewLog({ ...newLog, title: e.target.value })}
                  className="bg-white border border-zinc-300 rounded-xl p-2 sm:col-span-2"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Butiran perbualan, maklum balas pelanggan atau tindakan susulan..."
                value={newLog.detail}
                onChange={(e) => setNewLog({ ...newLog, detail: e.target.value })}
                className="w-full bg-white border border-zinc-300 rounded-xl p-2 "
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddLogModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-300 text-zinc-500"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!newLog.title) return alert("Sila letak tajuk catatan.");
                    setActivityLogs([
                      {
                        id: `act_${Date.now()}`,
                        type: newLog.type,
                        date: "Baru sahaja",
                        staff: newLog.staff,
                        title: newLog.title,
                        detail: newLog.detail,
                      },
                      ...activityLogs,
                    ]);
                    setShowAddLogModal(false);
                    setNewLog({ type: "call", title: "", detail: "", staff: "Siti Sarah" });
                  }}
                  className="px-4 py-1.5 rounded-lg bg-brand-600 text-white font-bold"
                >
                  Simpan Log
                </button>
              </div>
            </div>
          )}
        </div>

      {/* SEKSYEN 2: BILIK DOKUMEN VAULT BOTTLECRM */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-none space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <div>
            <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-700" />
              Bilik Dokumen Rasmi Pelanggan (*Document Vault*)
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Simpanan selamat salinan MyKad, slip gaji 3 bulan, geran VOC JPJ, dan polisi insurans sewa beli.
            </p>
          </div>

          <button
            type="button"
            onClick={() => alert("Fungsi upload dokumen Cloudflare R2 sedia diaktifkan!")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold shadow transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>+ Muat Naik Dokumen</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex items-start justify-between gap-3 hover:border-zinc-300 transition"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-300 text-zinc-700 flex items-center justify-center font-bold shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="font-mono text-[10px] uppercase font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                    {doc.category}
                  </span>
                  <div className="font-bold text-zinc-900 text-xs truncate max-w-xs">{doc.name}</div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    {doc.fileSize} • Dimuat naik: {doc.uploadedAt}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-400 border border-emerald-200">
                  Disahkan
                </span>
                <button
                  type="button"
                  onClick={() => alert(`Membuka ${doc.name}`)}
                  className="p-1.5 rounded-lg bg-zinc-100 text-zinc-600 hover:text-red-600"
                  title="Muat Turun Dokumen"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SEKSYEN 3: PROFIL & SOP LAYANAN */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-none space-y-4 text-xs">
        <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider">Catatan Teknikal & Maklumat Khusus</h3>
        <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 text-zinc-600 leading-relaxed italic">
          "{customer.catatan}"
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
            <span className="font-bold text-zinc-500 block">SOP Layanan Pelanggan VIP:</span>
            <ul className="list-disc list-inside space-y-1 text-zinc-600">
              <li>Keutamaan slot Lif Bay 1 (Minyak Fully Synthetic sahaja)</li>
              <li>Wajib hantar foto WhatsApp pemeriksaan CVT sebelum tutup casing</li>
              <li>Layak diskaun promosi sehingga 10% untuk alat ganti OEM</li>
            </ul>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
            <span className="font-bold text-zinc-500 block">Saluran Hubungan WhatsApp:</span>
            <a
              href={`https://wa.me/6${customer.telefon.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2.5 px-4 rounded-xl mt-1 transition"
            >
              <Phone className="w-4 h-4" /> Buka Perbualan WhatsApp Rasmi
            </a>
          </div>
        </div>
      </div>

      {/* SEKSYEN 4: MOTOSIKAL BERDAFTAR */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-none space-y-4">
        <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider text-xs">
          Motosikal Berdaftar Di Bawah Pelanggan Ini
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(customerVehicles.length > 0
            ? customerVehicles
            : [
                {
                  id: "veh_demo",
                  plateNumber: "VDF 8899",
                  brand: "Yamaha",
                  model: "NVX 155 V2 (2023)",
                  currentMileage: 18450,
                  healthScore: 94,
                },
              ]
          ).map((v, idx) => (
            <div
              key={idx}
              className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-3 shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bike className="w-5 h-5 text-brand-400" />
                  <span className="font-mono text-base font-black text-zinc-900">{v.plateNumber}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-400 border border-emerald-200">
                  Skor: {v.healthScore || 94}/100
                </span>
              </div>
              <p className="text-xs text-zinc-600 font-bold">{v.brand} {v.model}</p>
              <div className="flex justify-between text-xs text-zinc-500 font-mono">
                <span>Perbatuan Semasa: {Number(v.currentMileage || 18450).toLocaleString()} km</span>
              </div>
              <div className="pt-2 border-t border-zinc-200 flex gap-2">
                <button
                  type="button"
                  onClick={() => onOpenPassport && onOpenPassport(v.plateNumber)}
                  className="flex-1 bg-brand-600 hover:bg-brand-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Pasport Digital</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SEKSYEN 5: SEJARAH INVOIS */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-none space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider text-xs">
            Sejarah Invois, Resit & Bil Bayaran
          </h3>
          <span className="text-xs font-mono text-zinc-500">Total: {customerWorkOrders.length} Rekod</span>
        </div>
        <div className="divide-y divide-zinc-200/80">
          {customerWorkOrders.map((wo, idx) => (
            <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-brand-400">#{wo.woNumber || wo.id}</span>
                  <span className="font-bold text-zinc-900">{wo.plateNumber}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-400 font-bold">
                    {wo.paymentStatus === "paid" ? "Selesai Dibayar" : "Selesai"}
                  </span>
                </div>
                <p className="text-zinc-500 text-[11px] mt-0.5">
                  Aduan: {wo.customerComplaint || "Servis berkala standard"}
                </p>
              </div>
              <div className="text-right shrink-0 flex items-center gap-3">
                <span className="font-mono text-sm font-black text-zinc-900">
                  RM {(wo.grandTotal || 130).toFixed(2)}
                </span>
                <a
                  href={`/quote/${wo.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-600"
                  title="Lihat Invois"
                >
                  <FileText className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SEKSYEN 6: AUDIT CAP MASA */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-none space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider text-xs">
            Garis Masa Audit Interaksi (*Audit Cap Masa ala Johan30*)
          </h3>
          <span className="text-xs font-mono text-emerald-400">Jejak Audit D1 Lengkap</span>
        </div>
        <div className="space-y-3 pt-2">
          {auditTimeline.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex items-start gap-3.5 text-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-700 border border-zinc-300 flex items-center justify-center font-bold shrink-0 mt-0.5">
                ✓
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-zinc-900 text-xs">{item.label}</span>
                  <span className="font-mono text-[10px] text-zinc-400 shrink-0">{item.pada}</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5">Pegawai Bertugas: {item.petugas}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

