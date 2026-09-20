import React, { useState, useEffect } from "react";
import { Wrench, Video, CheckCircle2, XCircle, AlertCircle, Clock, ShieldCheck, ChevronLeft } from "lucide-react";

interface TrackLiveProps {
  token: string;
  onBack: () => void;
}

export const TrackLive: React.FC<TrackLiveProps> = ({ token, onBack }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/public/wo/${token}`);
      const d = await res.json();
      if (d.success) {
        setData(d);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [token]);

  const handleDecision = async (approved: boolean) => {
    try {
      setSubmitting(true);
      const res = await fetch(`/api/public/wo/${token}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });
      const d = await res.json();
      setMessage(d.message);
      fetchJob();
    } catch (err) {
      alert("Ralat menghantar keputusan: " + err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!data || !data.workOrder) {
    return (
      <div className="max-w-md mx-auto text-center p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">Pautan Servis Tidak Sah</h3>
        <p className="text-xs text-slate-400">Pautan ini mungkin telah tamat tempoh atau no. kerja telah ditutup.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold"
        >
          Kembali ke Papan Pemuka
        </button>
      </div>
    );
  }

  const { workOrder, items } = data;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-400 hover:text-white"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Kembali ke Paparan Staf</span>
      </button>

      {/* Customer Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-black text-base border border-brand-500/30">
              FF
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Portal Servis Pelanggan</span>
              <h1 className="text-xl font-black text-white">{workOrder.plateNumber}</h1>
              <p className="text-xs text-slate-400">{workOrder.brand} {workOrder.model} • Pemilik: {workOrder.ownerName}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Status Motor</span>
            <span className="inline-flex items-center space-x-1 text-xs font-extrabold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Clock className="w-3.5 h-3.5" />
              <span>{workOrder.status.replace("_", " ").toUpperCase()}</span>
            </span>
          </div>
        </div>

        {/* Work Order Info */}
        <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 text-xs space-y-2">
          <div className="flex justify-between text-slate-400">
            <span>No. Job Card:</span>
            <span className="font-mono text-white font-bold">{workOrder.woNumber}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Aduan Asal:</span>
            <span className="text-slate-200">{workOrder.customerComplaint}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Perbatuan Semasa:</span>
            <span className="font-mono text-white font-bold">{workOrder.mileageIn.toLocaleString()} KM</span>
          </div>
        </div>
      </div>

      {/* Success Notification if decision made */}
      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* CIRI 2: VIDEO BUKTI KEROSAKAN (TRANSPARENT JOB CARD) */}
      {workOrder.videoProofKey && (
        <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 space-y-4">
          <div className="flex items-center space-x-2 text-amber-400">
            <Video className="w-5 h-5" />
            <h2 className="text-base font-black text-white">Video Bukti Kerosakan dari Mekanik (5-10 Saat)</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {workOrder.videoDescription || "Mekanik kami telah memeriksa keadaan komponen dan mendapati bahagian ini memerlukan penukaran untuk keselamatan anda."}
          </p>

          {/* Video Player Container */}
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-slate-800 shadow-2xl">
            <video
              src={workOrder.videoProofKey}
              controls
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>

          {/* Customer Approval Decision Buttons */}
          {workOrder.isApprovedByCustomer === null || workOrder.isApprovedByCustomer === undefined ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300">Persetujuan Penukaran Alat Ganti Baharu:</span>
                <span className="text-amber-400 font-extrabold text-sm">RM {(workOrder.grandTotal || 0).toFixed(2)}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pilih keputusan anda di bawah. Sekiranya diluluskan, mekanik akan segera memasang alat ganti tulen tersebut.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => handleDecision(false)}
                  disabled={submitting}
                  className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Tolak (Kekalkan Lama)</span>
                </button>

                <button
                  onClick={() => handleDecision(true)}
                  disabled={submitting}
                  className="py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Luluskan Penukaran</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`p-4 rounded-2xl border text-xs font-bold flex items-center space-x-2 ${
                workOrder.isApprovedByCustomer
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-300 border-rose-500/30"
              }`}
            >
              {workOrder.isApprovedByCustomer ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>Anda telah MELULUSKAN penukaran komponen ini. Mekanik sedang menjalankan pemasangan.</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <span>Anda telah MEMILIH UNTUK MENANGGUH penukaran alat ganti ini.</span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Breakdown Bil Item */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Senarai Item & Anggaran Kos</h3>
        <div className="divide-y divide-slate-800 text-xs">
          {items.map((item: any) => (
            <div key={item.id} className="py-3 flex justify-between items-center">
              <div>
                <span className="font-bold text-white block">{item.description}</span>
                <span className="text-[11px] text-slate-400">
                  {item.itemType === "part" ? "Alat Ganti Tulen" : "Upah & Servis"} • Qty: {item.quantity}
                </span>
              </div>
              <span className="font-extrabold text-white text-sm">RM {item.totalPrice.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-sm font-extrabold">
          <span className="text-slate-300">Jumlah Keseluruhan:</span>
          <span className="text-emerald-400 text-lg">RM {(workOrder.grandTotal || 0).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
