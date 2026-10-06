import React, { useState, useEffect } from "react";
import {
  UserCircle,
  Bike,
  QrCode,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Clock,
  Send,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Wrench,
  Sparkles,
  Camera,
  Printer,
  MapPin,
  Calendar
} from "lucide-react";
import { Vehicle, WorkOrder } from "../types";

interface CustomerPortalProps {
  vehicles: Vehicle[];
  workOrders: WorkOrder[];
  onOpenPassport: (plate: string) => void;
  onOpenTrack: (token: string) => void;
  onOpenQuote?: (id: string) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  vehicles,
  workOrders,
  onOpenPassport,
  onOpenTrack,
  onOpenQuote,
}) => {
  const [customer, setCustomer] = useState<any>(() => {
    try { return JSON.parse(localStorage.getItem("ffmotor_customer") || "null"); } catch { return null; }
  });
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [owned, setOwned] = useState<any[]>([]);
  const currentVehicle = owned[0] || vehicles[0] || {
    plateNumber: "VDF 8899",
    brand: "Yamaha",
    model: "NVX 155 V2",
    ownerName: "Akmal Hakim",
    ownerPhone: "0192233445",
    currentMileage: 18450,
    healthScore: 94,
  };

  const activeWorkOrder = workOrders.find(
    (wo) => wo.status === "in_progress" || wo.status === "waiting_parts" || wo.status === "pending"
  ) || workOrders[0];

  const [aduanText, setAduanText] = useState("");
  const [aduanSubmitted, setAduanSubmitted] = useState(false);
  const [pendingVoList, setPendingVoList] = useState<any[]>([]);

  const [pickupTime, setPickupTime] = useState("");
  const [pickupConfirmed, setPickupConfirmed] = useState(false);

  // Muat data VO aktif
  useEffect(() => {
    fetch("/api/vo")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.variationOrders)) {
          setPendingVoList(d.variationOrders);
        }
      })
      .catch(() => null);
  }, []);

  // 5-Nod Aliran Kerja Interaktif ala Johan30 (n8n-inspired pipeline)
  const pipelineNodes = [
    {
      id: "node-1",
      step: "1",
      title: "Daftar Masuk & Diagnosis",
      desc: "Semakan 12-titik ketibaan disahkan oleh Service Advisor.",
      status: "completed",
      badge: "Selesai",
      time: "09:30 AM",
    },
    {
      id: "node-2",
      step: "2",
      title: "Sebut Harga & E-Sign",
      desc: "Pecahan alat ganti OEM diluluskan oleh pemilik kenderaan.",
      status: "completed",
      badge: "Diluluskan",
      time: "09:45 AM",
    },
    {
      id: "node-3",
      step: "3",
      title: "Lif Servis di Pit Master",
      desc: "Mekanik sedang membuka CVT & penukaran pelincir di Bay 1.",
      status: activeWorkOrder?.status === "ready" ? "completed" : "active",
      badge: activeWorkOrder?.status === "ready" ? "Selesai" : "Sedang Berjalan",
      time: "10:15 AM",
    },
    {
      id: "node-4",
      step: "4",
      title: "Kawalan Kualiti (QC)",
      desc: "Ujian jalanan & pemeriksaan ketat oleh Ketua Foreman.",
      status: activeWorkOrder?.status === "ready" ? "active" : "pending",
      badge: activeWorkOrder?.status === "ready" ? "Sedang Uji" : "Menunggu",
      time: "11:00 AM",
    },
    {
      id: "node-5",
      step: "5",
      title: "Penyerahan Kunci & Invois",
      desc: "Motosikal sedia diambil berserta kemas kini Passport Digital.",
      status: activeWorkOrder?.status === "ready" ? "completed" : "pending",
      badge: activeWorkOrder?.status === "ready" ? "Sedia Diambil" : "Belum Sedia",
      time: "11:30 AM",
    },
  ];

  const handleSubmitAduan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aduanText.trim()) return;
    try {
      await fetch("/api/inbox/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerPhone: currentVehicle.ownerPhone || "0192233445",
          workOrderId: activeWorkOrder?.id || null,
          sender: "customer",
          message: `[Aduan Pelanggan: ${currentVehicle.plateNumber}] ${aduanText}`,
        }),
      }).catch(() => null);
    } catch {}
    setAduanSubmitted(true);
    setAduanText("");
  };

  if (!customer) {
    return (
      <form className="max-w-md mx-auto p-6 space-y-3" onSubmit={async (e) => {
        e.preventDefault();
        setLoginError("");
        const res = await fetch("/api/public/customer/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, pin }),
        });
        const data = await res.json();
        if (!data.ok) { setLoginError(data.message || "Log masuk gagal."); return; }
        localStorage.setItem("ffmotor_customer_token", data.token);
        localStorage.setItem("ffmotor_customer", JSON.stringify(data.customer));
        setOwned(data.vehicles || []);
        setCustomer(data.customer);
      }}>
        <h1 className="text-xl font-black">Portal pelanggan</h1>
        <p className="text-xs text-zinc-600">Masukkan telefon dan PIN pelanggan. Ini bukan PIN staf.</p>
        <input className="w-full border rounded-xl px-3 py-2" placeholder="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input className="w-full border rounded-xl px-3 py-2" placeholder="PIN" type="password" value={pin} onChange={(e) => setPin(e.target.value)} />
        {loginError && <p className="text-xs text-red-600 font-bold">{loginError}</p>}
        <button className="w-full bg-zinc-950 text-white rounded-xl py-2 font-black" type="submit">Masuk</button>
      </form>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header Portal Pemilik ala Johan30 /saya */}
      <div className="rounded-3xl border-2 border-zinc-300 bg-white p-6 shadow-sm relative overflow-hidden text-black">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-lg shrink-0">
              <UserCircle className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">
                  Portal Pemilik Motor (/saya)
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">
                  ● D1 Live Sync
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black mt-1">
                Selamat Datang, {currentVehicle.ownerName}
              </h1>
              <p className="text-xs text-zinc-600">
                Pusat khidmat pelanggan digital FFmotor • Status kerja langsung, kelulusan alat ganti, & pasport motosikal.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenPassport(currentVehicle.plateNumber)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition shadow-lg shadow-brand-500/20 self-start sm:self-auto"
          >
            <QrCode className="w-4 h-4" />
            <span>Buka Pasport Digital</span>
          </button>
        </div>
      </div>

      {/* Kad Pantas Status Motosikal Semasa */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-none grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-zinc-400 block text-[11px]">No. Pendaftaran:</span>
          <span className="font-mono text-base font-black text-brand-400 block mt-0.5">
            {currentVehicle.plateNumber}
          </span>
          <span className="text-zinc-500 text-[11px]">{currentVehicle.brand} {currentVehicle.model}</span>
        </div>

        <div>
          <span className="text-zinc-400 block text-[11px]">Status Bengkel Semasa:</span>
          <span className="inline-flex items-center gap-1.5 font-bold text-red-600 mt-1">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            {activeWorkOrder?.status === "ready" ? "Sedia Diambil" : "Sedang Diservis di Lif 1"}
          </span>
          <span className="text-zinc-500 text-[10px] block mt-0.5">Mekanik: Sifu Halim</span>
        </div>

        <div>
          <span className="text-zinc-400 block text-[11px]">Jam SLA & Sasaran Siap:</span>
          <span className="font-mono font-bold text-zinc-700 block mt-0.5 text-sm">
            11:30 AM (Baki 25m)
          </span>
          <span className="text-emerald-400 text-[10px]">Tepat Masa Mengikut Jadual</span>
        </div>

        <div>
          <span className="text-zinc-400 block text-[11px]">Skor Kesihatan Motor:</span>
          <span className="font-mono font-black text-emerald-400 text-base block mt-0.5">
            {currentVehicle.healthScore || 94} / 100
          </span>
          <span className="text-zinc-500 text-[10px]">Gred A (Sangat Baik)</span>
        </div>
      </div>

      {/* ISU 23 & 25: Butang Tindakan Pantas */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => window.print()}
          className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm flex-1"
        >
          <Printer className="w-4 h-4" />
          Cetak Resit Rasmi (PDF)
        </button>
        <a
          href="https://www.google.com/maps/search/?api=1&query=FFmotor+Mergong+Alor+Setar"
          target="_blank"
          rel="noreferrer"
          className="bg-white hover:bg-zinc-100 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm flex-1"
        >
          <MapPin className="w-4 h-4" />
          Navigasi Waze / Google Maps ke FFmotor 3S Mergong
        </a>
      </div>

      {/* ISU 22: PEMILIH MASA PENGAMBILAN */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
          <Calendar className="w-4 h-4 text-brand-500" />
          <h3>Tetapkan Waktu Pengambilan Motosikal</h3>
        </div>
        {pickupConfirmed ? (
          <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Waktu ketibaan anda telah dimaklumkan kepada Kerani Kaunter.
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs text-zinc-600 mb-1">Pilih masa atau taip masa bebas</label>
              <input
                type="text"
                list="pickup-times"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                placeholder="Cth: Hari Ini: 5:30 Petang"
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-2.5 text-xs text-zinc-900 focus:outline-none focus:border-brand-500"
              />
              <datalist id="pickup-times">
                <option value="Hari Ini: 4:30 Petang" />
                <option value="Hari Ini: 5:30 Petang" />
                <option value="Hari Ini: 6:30 Petang" />
                <option value="Esok Pagi: 9:30 Pagi" />
              </datalist>
            </div>
            <button
              onClick={() => {
                if(pickupTime.trim()) setPickupConfirmed(true);
              }}
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs w-full sm:w-auto shrink-0"
            >
              Sahkan Waktu Tiba
            </button>
          </div>
        )}
      </div>

      {/* Notis Penting Jika Ada VO Menunggu Kelulusan */}
      {pendingVoList.some((v) => v.status === "pending") && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-red-600">
                Tindakan Diperlukan: Mekanik Memohon Penukaran Alat Ganti Tambahan
              </h3>
              <p className="text-[11px] text-red-600 mt-0.5">
                Komponen CVT haus dikesan semasa lif dinaikkan. Sila semak gambar bukti dan luluskan untuk mekanik meneruskan kerja.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => document.getElementById("vo-section")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md self-end sm:self-auto shrink-0"
          >
            <span>Semak & Luluskan</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ALIRAN TUNGGAL BERTERUSAN STATUS PELANGGAN */}
      {/* SEKSYEN 1: NOD ALIRAN KERJA */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-none space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
              Saluran Kerja Interaktif Masa Nyata
            </h3>
            <span className="text-[11px] font-mono text-emerald-400">Status Semasa: Lif Bay 1</span>
          </div>

          {/* 5-Nod Pipeline Steps */}
          <div className="space-y-4">
            {pipelineNodes.map((node, idx) => (
              <div
                key={node.id}
                className={`p-4 rounded-2xl border transition flex items-start justify-between gap-4 ${
                  node.status === "active"
                    ? "bg-brand-950/40 border-brand-500/50 shadow-md shadow-brand-500/5"
                    : node.status === "completed"
                    ? "bg-zinc-50/60 border-zinc-200/80 opacity-90"
                    : "bg-zinc-50/30 border-slate-900 opacity-50"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      node.status === "completed"
                        ? "bg-emerald-50 text-emerald-400 border border-emerald-200"
                        : node.status === "active"
                        ? "bg-brand-500 animate-pulse"
                        : "bg-zinc-100 text-zinc-400 border border-zinc-300"
                    }`}
                  >
                    {node.status === "completed" ? "✓" : node.step}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-zinc-900">{node.title}</h4>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          node.status === "completed"
                            ? "bg-emerald-50 text-emerald-400"
                            : node.status === "active"
                            ? "bg-red-50 text-red-600"
                            : "bg-zinc-100 text-zinc-400"
                        }`}
                      >
                        {node.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{node.desc}</p>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-zinc-400 shrink-0">{node.time}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => onOpenTrack(activeWorkOrder?.approvalToken || "tok_sample")}
              className="text-xs text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1.5"
            >
              <span>Buka Skrin Foto Penjejakan Penuh Lif</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      {/* SEKSYEN 2: ALAT GANTI TAMBAHAN (VO) */}
      <div id="vo-section" className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-none space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
          Senarai Permohonan Alat Ganti Tambahan (Variation Orders)
        </h3>

        {pendingVoList.length === 0 ? (
          <div className="text-center py-10 text-xs text-zinc-400">
            Tiada alat ganti tambahan dimohon pada masa ini. Semua kerja berjalan mengikut sebut harga asal.
          </div>
        ) : (
          pendingVoList.map((vo) => (
            <div
              key={vo.id}
              className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-zinc-400">#{vo.voNumber}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      vo.status === "approved"
                        ? "bg-emerald-50 text-emerald-400"
                        : vo.status === "rejected"
                        ? "bg-red-50 text-red-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {vo.status === "approved" ? "Diluluskan" : vo.status === "rejected" ? "Ditolak" : "Perlu Kelulusan"}
                  </span>
                </div>
                <h4 className="font-bold text-zinc-900 text-sm">{vo.partName}</h4>
                <p className="text-zinc-500 text-[11px]">"{vo.reason}"</p>
              </div>

              <div className="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] text-zinc-500">Kos Asal Servis: RM {(activeWorkOrder?.grandTotal || 0).toFixed(2)}</span>
                  <span className="text-[10px] text-red-600">Kos Tambahan Alat Ganti: + RM {Number(vo.totalAmount || 0).toFixed(2)}</span>
                  <span className="font-mono font-bold text-zinc-900 text-sm border-t border-zinc-200 pt-1 mt-1">
                    Anggaran Jumlah Baharu: RM {((activeWorkOrder?.grandTotal || 0) + Number(vo.totalAmount || 0)).toFixed(2)}
                  </span>
                </div>
                {vo.status === "pending" && (
                  <a
                    href={`/vo/${vo.token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 mt-2"
                  >
                    <span>Buka & Sahkan</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* SEKSYEN 3: DOKUMEN & SEBUT HARGA */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-none space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
            Dokumen Rasmi & Sebut Harga
          </h3>
          <span className="text-[11px] text-zinc-400 font-mono">Format PDF Digital</span>
        </div>

        <div className="divide-y divide-zinc-200/60">
          <div className="py-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-brand-400" />
              <div>
                <h4 className="font-bold text-zinc-900">Sebut Harga Servis & Upah Lif</h4>
                <span className="text-[11px] text-zinc-400 font-mono">Tarikh: 21 Sep 2026 • Status: Sah</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-zinc-700">
                RM {(activeWorkOrder?.grandTotal || 130).toFixed(2)}
              </span>
              <a
                href={`/quote/${activeWorkOrder?.id || "q-1"}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-100 text-brand-400 font-bold text-xs"
              >
                Lihat Sebut Harga
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* SEKSYEN 4: SALURAN ADUAN & BANTUAN */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-none space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
            Saluran Aduan Pelanggan & Bantuan Pantas
          </h3>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> Jaminan Servis FFmotor
          </span>
        </div>

        {aduanSubmitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-emerald-400 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" /> Aduan Diterima oleh Pengurus Bengkel
            </div>
            <p className="text-xs text-emerald-700/80">
              Terima kasih atas maklum balas anda. Pengurus Khidmat Pelanggan kami akan menghubungi anda dalam tempoh
              15 minit untuk penyelesaian segera.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitAduan} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1.5">
                Tuliskan sebarang masalah, ketidakpuasan hati atau soalan teknikal:
              </label>
              <textarea
                rows={3}
                required
                value={aduanText}
                onChange={(e) => setAduanText(e.target.value)}
                placeholder="cth: Brek belakang rasa bergetar selepas servis kelmarin..."
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3 text-xs text-zinc-900 placeholder-slate-600 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30"
              >
                <Send className="w-3.5 h-3.5" />
                Hantar Aduan Rasmi
              </button>

              <a
                href={`https://wa.me/60192233445?text=${encodeURIComponent(
                  `Salam Service Advisor FFmotor, saya ${currentVehicle.ownerName} (${currentVehicle.plateNumber}) ingin bertanyakan sokongan teknikal.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="bg-white hover:bg-zinc-100 text-zinc-700 font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-zinc-300"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                WhatsApp Pengurus Servis
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
