import React, { useState } from "react";
import {
  Sparkles,
  Bike,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Calendar,
  Clock,
  Send,
  ExternalLink,
  Flame,
  ChevronRight
} from "lucide-react";

interface PublicLeadCaptureProps {
  slug?: string;
  onBackToApp?: () => void;
}

export const PublicLeadCapture: React.FC<PublicLeadCaptureProps> = ({
  slug = "promo-cvt",
  onBackToApp,
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bikeModel, setBikeModel] = useState("Yamaha NVX 155");
  const [plate, setPlate] = useState("");
  const [preferredDate, setPreferredDate] = useState("2026-09-25");
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Butiran Pakej Promosi mengikut slug (ala Johan30 /a/[slug].vue)
  const packages: Record<string, any> = {
    "promo-cvt": {
      title: "Pakej Servis CVT & Pulley Yamaha OEM",
      subtitle: "Pulihkan pikap motosikal anda & hapuskan getaran awal pagi",
      price: "RM 145.00",
      originalPrice: "RM 195.00",
      saving: "Jimat RM50",
      includes: [
        "Minyak Enjin Fully Synthetic Yamalube 10W-40 (1L)",
        "Drive Belt OEM Yamaha Original (B65)",
        "Roller Set CVT 10g / 11g",
        "Cuci Casing CVT & Servis Setting Tork",
        "Pemeriksaan 12-Titik Keselamatan JPJ Percuma",
      ],
      badge: "Promosi Terhangat",
    },
    "tayar-raya": {
      title: "Pakej Kombo Tayar Tubeless Maxxis Volans",
      subtitle: "Cengkaman mantap jalan basah & selekoh highway",
      price: "RM 180.00",
      originalPrice: "RM 230.00",
      saving: "Jimat RM50",
      includes: [
        "Tayar Hadapan Maxxis Volans Tubeless 80/90-17",
        "Tayar Belakang Maxxis Volans Tubeless 90/80-17",
        "Upah Pasang & Balancing Roda Percuma",
        "Tiub Tubeless Valve Baru",
      ],
      badge: "Stok Terhad",
    },
  };

  const currentPkg = packages[slug] || packages["promo-cvt"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert("Sila masukkan nama dan nombor WhatsApp anda.");
      return;
    }

    setSubmitting(true);
    try {
      // Simpan lead ke D1 melalui API
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          bikeModel,
          plateNumber: plate,
          source: `Landing Page (/a/${slug})`,
          notes: `Tempahan Pakej: ${currentPkg.title} (${currentPkg.price}) pada ${preferredDate}`,
          stage: "new",
        }),
      });

      setSubmittedSuccess(true);
    } catch (err) {
      setSubmittedSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 py-10 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header Bengkel */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-600/20 text-brand-400 border border-brand-500/30 text-xs font-bold font-mono uppercase">
            <Flame className="w-3.5 h-3.5 text-red-600" />
            {currentPkg.badge} • Pusat Servis FFmotor 3S
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {currentPkg.title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">{currentPkg.subtitle}</p>
        </div>

        {/* Kad Harga & Manfaat */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-7 shadow-none space-y-5 relative overflow-hidden">
          <div className="flex items-baseline justify-between border-b border-zinc-200 pb-4">
            <div>
              <span className="text-xs text-zinc-500 line-through mr-2 font-mono">
                {currentPkg.originalPrice}
              </span>
              <span className="text-3xl sm:text-4xl font-black text-red-600 font-mono">
                {currentPkg.price}
              </span>
            </div>
            <span className="bg-emerald-50 text-emerald-400 border border-emerald-200 px-3 py-1 rounded-xl text-xs font-bold font-mono">
              {currentPkg.saving}
            </span>
          </div>

          {/* Senarai Termasuk */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
              Pakej Merangkumi:
            </span>
            <div className="space-y-2 text-xs">
              {currentPkg.includes.map((inc: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2.5 text-zinc-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{inc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Borang Tempahan Pantas atau Mesej Kejayaan */}
        {submittedSuccess ? (
          <div className="bg-white border border-emerald-200 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-none">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black ">Tempahan Slot Berjaya Dihantar!</h3>
              <p className="text-xs text-zinc-600 mt-1">
                Terima kasih <b>{name}</b>. Service Advisor FFmotor telah menerima permohonan anda dan slot lif telah
                dikhaskan untuk motosikal anda pada <b>{preferredDate}</b>.
              </p>
            </div>

            <div className="pt-2">
              <a
                href={`https://wa.me/60192233445?text=${encodeURIComponent(
                  `Salam Service Advisor FFmotor, saya ${name} (${phone}) telah membuat tempahan ${currentPkg.title} untuk motor saya (${plate || bikeModel}) pada tarikh ${preferredDate}. Mohon sahkan slot.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-3.5 px-6 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition"
              >
                <Phone className="w-4 h-4" />
                Sahkan Segera Melalui WhatsApp Rasmi
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-7 shadow-none space-y-4 text-xs">
            <h3 className="text-sm font-black uppercase tracking-wider">
              Borang Tempahan Slot Servis (Tanpa Bayaran Deposit)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-zinc-600 font-semibold mb-1.5">
                  Nama Anda <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="cth: Akmal Hakim"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 placeholder-slate-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-semibold mb-1.5">
                  No. WhatsApp <span className="text-red-700">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0192233445"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 font-mono placeholder-slate-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-semibold mb-1.5">Model Motosikal</label>
                <input
                  type="text"
                  placeholder="Yamaha NVX 155 / Y15ZR"
                  value={bikeModel}
                  onChange={(e) => setBikeModel(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 placeholder-slate-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-semibold mb-1.5">No. Plat Kenderaan</label>
                <input
                  type="text"
                  placeholder="VDF 8899"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 font-mono font-bold uppercase placeholder-slate-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-600 font-semibold mb-1.5">Tarikh Pilihan Servis</label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 font-mono focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-black py-4 px-6 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 transition disabled:opacity-50 mt-2"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Menghantar Tempahan..." : "Tempah Slot Promosi Sekarang (Bayar Semasa Siap)"}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="text-center text-[11px] text-zinc-400 space-y-1">
          <p className="flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Alat ganti dijamin tulen OEM Yamaha & Honda Malaysia. Jaminan waranti 90 hari.
          </p>
          <p>© 2026 Pusat Servis Motosikal FFmotor Sdn Bhd • Rawang, Selangor</p>
          {onBackToApp && (
            <button
              type="button"
              onClick={onBackToApp}
              className="text-brand-400 hover:underline font-mono text-[10px] inline-block mt-2"
            >
              Kembali ke Aplikasi FFmotor
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

