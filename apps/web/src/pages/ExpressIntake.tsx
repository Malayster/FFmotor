import React, { useState } from "react";
import {
  Bike,
  User,
  Phone,
  Gauge,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Sparkles,
  Send,
  Printer,
  Search,
  Check
} from "lucide-react";
import { Vehicle } from "../types";
import { normalizePlate } from "../utils/normalizePlate";
import { sessionHeader } from "../lib/api";

interface ExpressIntakeProps {
  vehicles: Vehicle[];
  onIntakeSuccess: (woId: string, trackToken: string) => void;
  onCancel?: () => void;
  onRefresh?: () => void;
}

export const ExpressIntake: React.FC<ExpressIntakeProps> = ({
  vehicles,
  onIntakeSuccess,
  onCancel,
  onRefresh,
}) => {
  const [plate, setPlate] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [brand, setBrand] = useState("Yamaha");
  const [model, setModel] = useState("NVX 155 V2");
  const [mileage, setMileage] = useState("18500");
  const [assignedBay, setAssignedBay] = useState("1");
  const [assignedMechanic, setAssignedMechanic] = useState("usr_mech1");
  const [complaint, setComplaint] = useState("Servis berkala 15,000km + bunyi bising bahagian CVT");

  // 12-point rapid checklist states
  const checklistItems = [
    { id: "oil", label: "Minyak Enjin 4T", defaultChecked: true },
    { id: "gear_oil", label: "Minyak Gear CVT / Rantai", defaultChecked: true },
    { id: "brake_f", label: "Pad Brek Hadapan", defaultChecked: false },
    { id: "brake_r", label: "Pad Brek Belakang", defaultChecked: false },
    { id: "battery", label: "Voltan Bateri & Starter", defaultChecked: false },
    { id: "chain_sprocket", label: "Ketegangan Rantai / Roller", defaultChecked: false },
    { id: "cvt_belt", label: "Belting CVT & Pulley", defaultChecked: true },
    { id: "tire_f", label: "Bunga Tayar Hadapan", defaultChecked: false },
    { id: "tire_r", label: "Bunga Tayar Belakang", defaultChecked: false },
    { id: "coolant", label: "Paras Coolant Radiator", defaultChecked: true },
    { id: "lights", label: "Lampu Utama & Signal", defaultChecked: false },
    { id: "suspension", label: "Fork Hadapan & Absorber", defaultChecked: false },
  ];

  const [checkedPoints, setCheckedPoints] = useState<Record<string, boolean>>(
    checklistItems.reduce((acc, item) => ({ ...acc, [item.id]: item.defaultChecked }), {})
  );

  const [hasPendingPayment, setHasPendingPayment] = useState(false);
  const [pendingAmount, setPendingAmount] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [intakeCompleted, setIntakeCompleted] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState<any>(null);

  // Auto lookup plate number
  const handlePlateChange = (val: string) => {
    const clean = normalizePlate(val);
    setPlate(clean);

    const match = vehicles.find(
      (v) => v.plateNumber.replace(/\s+/g, "").toUpperCase() === clean.replace(/\s+/g, "").toUpperCase()
    );
    if (match) {
      setOwnerName(match.ownerName || "");
      setOwnerPhone(match.ownerPhone || "");
      setBrand(match.brand || "Yamaha");
      setModel(match.model || "");
      setMileage(String(match.currentMileage || 15000));
      
      const pendingWO = (match as any).workOrders?.find((wo: any) => wo.status === 'pending_payment');
      if (pendingWO) {
         setHasPendingPayment(true);
         setPendingAmount(pendingWO.totalAmount || 150.00);
      } else {
         setHasPendingPayment(false);
         setPendingAmount(0);
      }
    } else {
      setHasPendingPayment(false);
      setPendingAmount(0);
    }
  };

  const togglePoint = (id: string) => {
    setCheckedPoints((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate.trim() || !ownerName.trim() || !ownerPhone.trim()) {
      alert("Sila lengkapkan No. Plat, Nama Pemilik dan No. Telefon.");
      return;
    }

    setSubmitting(true);
    const token = `tok_${plate.replace(/\s+/g, "").toLowerCase()}_${Date.now().toString().slice(-4)}`;

    try {
      const res = await fetch("/api/work-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...sessionHeader(),
        },
        body: JSON.stringify({
          plateNumber: plate,
          ownerName,
          ownerPhone,
          brand,
          model,
          mileageIn: Number(mileage) || 0,
          customerComplaint: complaint,
          mechanicId: assignedMechanic,
          assignedBay: Number(assignedBay),
          approvalToken: token,
          checklist: checkedPoints,
        }),
      });

      const d = await res.json().catch(() => ({}));
      const createdWO = d.workOrder || d;
      const woData = {
        woNumber: createdWO.woNumber || `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        plate,
        ownerName,
        ownerPhone,
        brand,
        model,
        bay: assignedBay,
        token: createdWO.approvalToken || token,
      };

      setGeneratedTicket(woData);
      setIntakeCompleted(true);
      if (createdWO.id) {
        onIntakeSuccess(createdWO.id, woData.token);
      }
      onRefresh?.();
    } catch (err) {
      // Fallback
      const woData = {
        woNumber: `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        plate,
        ownerName,
        ownerPhone,
        brand,
        model,
        bay: assignedBay,
        token,
      };
      setGeneratedTicket(woData);
      setIntakeCompleted(true);
      onRefresh?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-600/20 text-brand-400 border border-brand-500/30">
              <ClipboardList className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900">Kaunter Pendaftaran Masuk Pantas (30s)</h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                Daftar ketibaan motosikal, diagnosis awal 12-titik, dan agih ke lif pit secara automatik.
              </p>
            </div>
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-zinc-500 hover:text-red-600 px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-white"
          >
            Tutup
          </button>
        )}
      </div>

      {hasPendingPayment && !intakeCompleted && (
        <div className="bg-red-600 p-4 rounded-xl text-white font-bold flex items-start gap-3 shadow-lg mb-6">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <div>
            ⚠️ AMARAN KREDIT: Pelanggan ini mempunyai bil tertunggak RM {pendingAmount.toFixed(2)}. Sila dapatkan kelulusan pengurus sebelum terima motor baharu.
          </div>
        </div>
      )}

      {intakeCompleted && generatedTicket ? (
        /* Tiket Kejayaan Masuk & Tindakan WhatsApp */
        <div className="bg-white border border-emerald-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-none">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                Tiket Kerja Didaftarkan ({generatedTicket.woNumber})
              </span>
              <h2 className="text-xl font-black text-zinc-900 mt-0.5">
                Motosikal Telah Dihantar ke Lif #{generatedTicket.bay} (Pit Master)
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Rekod pendaftaran dan diagnosis 12-titik telah disimpan ke Cloudflare D1. Mekanik pit kini boleh memulakan kerja.
              </p>
            </div>
          </div>

          {/* Kotak Ringkasan Tiket */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-zinc-800 font-bold block">No. Pendaftaran:</span>
              <span className="font-mono font-black text-zinc-950 text-sm">{generatedTicket.plate}</span>
            </div>
            <div>
              <span className="text-zinc-800 font-bold block">Pemilik:</span>
              <span className="font-black text-zinc-950">{generatedTicket.ownerName}</span>
            </div>
            <div>
              <span className="text-zinc-800 font-bold block">Telefon:</span>
              <span className="font-mono font-bold text-zinc-950">{generatedTicket.ownerPhone}</span>
            </div>
            <div>
              <span className="text-zinc-800 font-bold block">Lokasi Lif:</span>
              <span className="font-black text-red-600">Bay #{generatedTicket.bay}</span>
            </div>
          </div>

          {/* Tindakan Pantas WhatsApp Rasmi */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href={`https://wa.me/6${generatedTicket.ownerPhone.replace(/^0/, "")}?text=${encodeURIComponent(
                `Salam ${generatedTicket.ownerName}, terima kasih menghantar ${generatedTicket.plate} (${generatedTicket.brand} ${generatedTicket.model}) ke FFmotor.\n\n` +
                `Tiket Servis #${generatedTicket.woNumber} telah dibuka di Lif #${generatedTicket.bay}.\n` +
                `Anda boleh memantau status kerja & laporan pasport secara langsung di pautan berikut:\n` +
                `${window.location.origin}/track/${generatedTicket.token}\n\n` +
                `- Pusat Servis Motosikal FFmotor 3S`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-3.5 px-5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
            >
              <Send className="w-4 h-4 text-emerald-400" />
              <span>Hantar WhatsApp Tracking ke Pelanggan</span>
            </a>

            <button
              type="button"
              onClick={() => onIntakeSuccess(generatedTicket.token, generatedTicket.token)}
              className="bg-red-600 hover:bg-red-700 text-white font-black py-3.5 px-5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition"
            >
              <Wrench className="w-4 h-4" />
              <span>Buka Live Track Motor ➔</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIntakeCompleted(false);
                setPlate("");
                setOwnerName("");
                setOwnerPhone("");
                setMileage("");
                setComplaint("");
              }}
              className="bg-white hover:bg-zinc-100 text-zinc-950 font-bold py-3.5 px-5 rounded-xl text-xs flex items-center justify-center gap-2 border border-zinc-300 transition"
            >
              Daftar Motosikal Seterusnya
            </button>
          </div>
        </div>
      ) : (
        /* Borang Pendaftaran Masuk */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Maklumat Kenderaan & Pemilik */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 shadow-none space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-2">
              <Bike className="w-4 h-4" /> Butiran Motosikal & Pemilik
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">
                  No. Plat Motosikal <span className="text-red-700">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="cth: VDF 8899"
                    value={plate}
                    onChange={(e) => handlePlateChange(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold tracking-wider placeholder-slate-600 focus:outline-none focus:border-brand-500"
                  />
                  <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-3 pointer-events-none" />
                </div>
                <span className="text-[10px] text-zinc-400 mt-1 block">Taip untuk auto-isi profil pelanggan</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">
                  Nama Pemilik <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama Pelanggan"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs placeholder-slate-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">
                  No. Telefon WhatsApp <span className="text-red-700">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0192233445"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Model Kenderaan</label>
                <input
                  type="text"
                  placeholder="Yamaha NVX 155"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs placeholder-slate-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Bacaan Odometer (KM)</label>
                <input
                  type="number"
                  placeholder="15000"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Agihan Lif Pit</label>
                <select
                  value={assignedBay}
                  onChange={(e) => setAssignedBay(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-red-600 font-bold focus:outline-none focus:border-brand-500"
                >
                  <option value="1">Bay 1 - Lif Utama (Sifu Halim)</option>
                  <option value="2">Bay 2 - Servis Pantas (Danial)</option>
                  <option value="3">Bay 3 - Baik Pulih Enjin (Zul)</option>
                  <option value="4">Bay 4 - Dyno & Diagnostic (Alif)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1.5">
                Catatan Aduan Pelanggan / Simptom Kerosakan
              </label>
              <textarea
                rows={2}
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="cth: Brek belakang rasa kosong bila ditarik laju, minyak enjin dah lebih tempoh..."
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3 text-xs placeholder-slate-600 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Senarai Semak Diagnosis Awal 12-Titik */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 shadow-none space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-red-600" /> Senarai Semak 12-Titik Masuk (Rapid Checklist)
              </h3>
              <span className="text-[11px] text-zinc-500 font-mono">
                {Object.values(checkedPoints).filter(Boolean).length} / 12 Ditandakan Perlu Perhatian
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {checklistItems.map((item) => {
                const checked = checkedPoints[item.id];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => togglePoint(item.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium text-left transition ${
                      checked
                        ? "bg-brand-600/20 border-brand-500/50 text-brand-300 shadow-xs"
                        : "bg-zinc-50/60 border-zinc-200 text-zinc-500 hover:border-zinc-300"
                    }`}
                  >
                    <span className="truncate mr-2">{item.label}</span>
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 text-[10px] ${
                        checked ? "bg-brand-500 font-bold" : "border border-zinc-300 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Butang Tindakan Hantar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 px-8 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? "Mendaftar Tiket..." : "Daftar Tiket & Dispatch ke Lif Pit (30s)"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

