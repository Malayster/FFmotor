import React, { useState, useEffect } from "react";
import { Wrench, CheckCircle2, AlertCircle, Clock, ChevronLeft, ShieldCheck } from "lucide-react";
import { HeroDepth } from "../components/canvas/CanvasBackdrop";

interface TrackLiveProps {
  token: string;
  onBack: () => void;
}

const STATUS_MAP: Record<string, { label: string; desc: string; step: number }> = {
  pending: { label: "MENUNGGU GILIRAN", desc: "Motosikal telah didaftar masuk dan menanti pit lif.", step: 1 },
  inspecting: { label: "SEDANG DIPERIKSA", desc: "Mekanik sedang membuat pemeriksaan awal.", step: 2 },
  in_progress: { label: "SEDANG DIBAIKI", desc: "Kerja-kerja pembaikan & penukaran alat ganti sedang berjalan.", step: 3 },
  waiting_parts: { label: "MENUNGGU ALAT GANTI", desc: "Menunggu alat ganti dikeluarkan daripada stor.", step: 3 },
  ready: { label: "SIAP SEDIA AMBIL", desc: "Motosikal telah siap diuji dan sedia untuk dituntut.", step: 4 },
  completed: { label: "SELESAI DISERAHKAN", desc: "Urusan pembaikan dan penyerahan motor telah selesai.", step: 4 },
};

export const TrackLive: React.FC<TrackLiveProps> = ({ token, onBack }) => {
  const [currentToken, setCurrentToken] = useState(token);
  const [searchInput, setSearchInput] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchJob = async (tokenToFetch: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/public/wo/${encodeURIComponent(tokenToFetch)}`);
      const d = await res.json();
      if (d.success && d.workOrder) {
        setData(d);
      } else {
        setData(null);
      }
    } catch (err) {
      console.error(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentToken(token);
    fetchJob(token);
  }, [token]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setCurrentToken(searchInput.trim());
    fetchJob(searchInput.trim());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!data || !data.workOrder) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white border-2 border-zinc-300 rounded-3xl space-y-5 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
        <div className="space-y-1">
          <h3 className="text-lg font-black text-zinc-950">Pautan Servis Tidak Ditemui</h3>
          <p className="text-xs text-zinc-800 font-bold leading-relaxed">
            Pautan ini mungkin telah tamat tempoh, token salah, atau kad kerja belum dibuka. Sila masukkan No. Plat atau No. Kad Kerja anda di bawah:
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-3 text-left">
          <label className="text-[11px] font-black uppercase text-zinc-950 block">
            No. Plat / No. Kad Kerja
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Contoh: VDF 8899 atau WO-2026-0001"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 bg-white border-2 border-zinc-300 rounded-xl px-3 py-2 text-xs font-black text-zinc-950 uppercase placeholder:normal-case placeholder:text-zinc-400 focus:outline-none focus:border-red-600"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl transition cursor-pointer"
            >
              Cari
            </button>
          </div>
        </form>

        <div className="pt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              setSearchInput("VDF 8899");
              fetchJob("VDF 8899");
            }}
            className="text-[11px] text-zinc-800 font-bold underline hover:text-red-600 cursor-pointer text-center"
          >
            Gunakan Plat Contoh: VDF 8899
          </button>

          <button
            onClick={onBack}
            className="w-full mt-2 px-4 py-2.5 rounded-xl bg-zinc-950 text-white text-xs font-black hover:bg-zinc-800 transition cursor-pointer"
          >
            Kembali ke Papan Pemuka
          </button>
        </div>
      </div>
    );
  }

  const { workOrder, items = [] } = data;
  const statusInfo = STATUS_MAP[workOrder.status] || {
    label: workOrder.status.toUpperCase(),
    desc: "Status kerja sedang dikemas kini.",
    step: 2,
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-1.5 text-xs font-black text-zinc-950 hover:text-red-600 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Kembali ke Paparan Staf</span>
      </button>

      {/* Customer Header Card */}
      <HeroDepth className="bg-white border-2 border-zinc-300 rounded-3xl p-6 space-y-4 text-black shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-base shadow-sm">
              FF
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-red-600">Portal Servis Pelanggan</span>
              <h1 className="text-2xl font-black text-zinc-950">{workOrder.plateNumber}</h1>
              <p className="text-xs text-zinc-800 font-bold">
                {workOrder.brand} {workOrder.model} • Pemilik: {workOrder.ownerName}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-zinc-600 block">Status Motor</span>
            <span className={`inline-flex items-center space-x-1 text-xs font-black px-3 py-1 rounded-full border ${
              workOrder.status === "ready" || workOrder.status === "completed"
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-red-50 text-red-700 border-red-300"
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{statusInfo.label}</span>
            </span>
          </div>
        </div>

        {/* Work Order Info */}
        <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-zinc-600 font-bold">No. Kad Kerja:</span>
            <span className="font-mono text-zinc-950 font-black">{workOrder.woNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600 font-bold">Aduan Pelanggan:</span>
            <span className="text-zinc-950 font-bold italic">"{workOrder.customerComplaint}"</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600 font-bold">Perbatuan (Odometer):</span>
            <span className="font-mono text-zinc-950 font-black">{workOrder.mileageIn?.toLocaleString() || "-"} KM</span>
          </div>
          {workOrder.mechanicNotes && (
            <div className="border-t border-zinc-200 pt-2 flex justify-between">
              <span className="text-zinc-600 font-bold">Catatan Foreman:</span>
              <span className="text-zinc-950 font-bold">{workOrder.mechanicNotes}</span>
            </div>
          )}
        </div>
      </HeroDepth>

      {/* Kemajuan Servis (Progress Steps) */}
      <div className="bg-white border-2 border-zinc-200 rounded-3xl p-6 space-y-4">
        <h3 className="text-sm font-black text-zinc-950 uppercase tracking-wider flex items-center gap-2">
          <Wrench className="w-4 h-4 text-red-600" />
          <span>Kemajuan Servis di Bengkel</span>
        </h3>
        <p className="text-xs text-zinc-800 font-bold">{statusInfo.desc}</p>

        <div className="grid grid-cols-4 gap-2 pt-2">
          {[
            { step: 1, label: "Daftar Masuk" },
            { step: 2, label: "Pemeriksaan" },
            { step: 3, label: "Dibaiki di Pit" },
            { step: 4, label: "Siap & QC" },
          ].map((s) => {
            const isDone = statusInfo.step >= s.step;
            return (
              <div
                key={s.step}
                className={`p-3 rounded-2xl border-2 text-center transition ${
                  isDone
                    ? "bg-zinc-950 text-white border-zinc-950"
                    : "bg-white text-zinc-400 border-zinc-200"
                }`}
              >
                <div className="text-[10px] font-mono font-black uppercase">Fasa {s.step}</div>
                <div className="text-xs font-black mt-0.5">{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Breakdown Bil Item */}
      <div className="bg-white border-2 border-zinc-200 rounded-3xl p-6 space-y-4">
        <h3 className="text-base font-black text-zinc-950">Senarai Item & Anggaran Kos</h3>
        {items.length === 0 ? (
          <p className="text-xs text-zinc-800 font-bold italic py-2">Tiada pecahan alat ganti tambahan.</p>
        ) : (
          <div className="divide-y divide-zinc-200 text-xs">
            {items.map((item: any) => (
              <div key={item.id} className="py-3 flex justify-between items-center">
                <div>
                  <span className="font-black text-zinc-950 block">{item.description}</span>
                  <span className="text-[11px] text-zinc-600 font-bold">
                    {item.itemType === "part" ? "Alat Ganti" : "Upah & Servis"} • Kuantiti: {item.quantity}
                  </span>
                </div>
                <span className="font-mono font-black text-zinc-950 text-sm">
                  RM {Number(item.totalPrice || 0).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="border-t-2 border-zinc-200 pt-4 flex justify-between items-center">
          <span className="text-sm font-black text-zinc-950">Jumlah Keseluruhan:</span>
          <span className="text-xl font-mono font-black text-red-600">
            RM {Number(workOrder.grandTotal || 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
