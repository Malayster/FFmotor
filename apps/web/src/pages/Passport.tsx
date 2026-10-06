import React, { useState, useEffect } from "react";
import { QrCode, ShieldCheck, CheckCircle2, ChevronLeft, Calendar, Gauge, Wrench, AlertCircle, Award } from "lucide-react";
import { HeroDepth } from "../components/canvas/CanvasBackdrop";

interface PassportProps {
  plate: string;
  onBack: () => void;
}

export const Passport: React.FC<PassportProps> = ({ plate, onBack }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPassport = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/public/passport/${plate}`);
        const d = await res.json();
        if (d.success) {
          setData(d.passport);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPassport();
  }, [plate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-300 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto text-center p-8 bg-white border-2 border-zinc-950 rounded-3xl space-y-4 shadow-md">
        <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
        <h3 className="text-lg font-black text-zinc-950">Pasport Motosikal Tidak Dijumpai</h3>
        <p className="text-xs text-zinc-800 font-bold">Nombor plat ini belum mempunyai rekod rasmi di FFmotor.</p>
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl bg-zinc-950 text-white text-xs font-black hover:bg-zinc-800 transition"
        >
          Kembali / Tutup
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-1.5 text-xs font-black text-zinc-950 hover:text-red-600 transition cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4 text-red-600" />
        <span>Kembali / Tutup Paparan</span>
      </button>

      {/* Main Passport Certificate Banner */}
      <HeroDepth className="rounded-3xl bg-white border-2 border-zinc-950 p-6 md:p-8 space-y-6 text-zinc-950 shadow-md">
        {/* Certificate Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-zinc-950">
            <Award className="w-6 h-6 text-red-600" />
            <span className="text-xs font-black uppercase tracking-widest text-zinc-950">Sijil Penyelenggaraan Sah</span>
          </div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border-2 border-emerald-600 text-xs font-black">
            <ShieldCheck className="w-4 h-4 text-emerald-800" />
            <span>Verified by FFmotor</span>
          </div>
        </div>

        {/* Motorcycle Info */}
        <div className="text-center space-y-1 py-2">
          <div className="inline-block px-5 py-2 rounded-2xl bg-zinc-50 border-2 border-zinc-950 font-mono text-2xl md:text-3xl font-black text-zinc-950 tracking-wider">
            {data.plateNumber}
          </div>
          <h2 className="text-xl font-black text-zinc-950 mt-2">{data.brand} {data.model}</h2>
          <p className="text-xs text-zinc-800 font-bold">Tahun {data.year || "2023"} • Jaminan Kualiti Asli Bengkel</p>
        </div>

        {/* Health Score Gauge */}
        <div className="grid grid-cols-3 gap-3 bg-zinc-50 rounded-2xl p-4 border-2 border-zinc-300 text-center">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black text-zinc-800 block">Skor Kesihatan</span>
            <div className="text-2xl md:text-3xl font-black text-emerald-700">
              {data.healthScore}<span className="text-sm text-zinc-700">/100</span>
            </div>
            <span className="text-[10px] font-black text-emerald-800 uppercase">Gred {data.grade} (Cemerlang)</span>
          </div>

          <div className="space-y-1 border-x-2 border-zinc-300 px-2">
            <span className="text-[10px] uppercase font-black text-zinc-800 block">Perbatuan Semasa</span>
            <div className="text-xl md:text-2xl font-black text-zinc-950 font-mono mt-1">
              {Number(data.currentMileage || 0).toLocaleString()}
            </div>
            <span className="text-[10px] text-zinc-800 font-bold">KM Terbukti</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black text-zinc-800 block">Kekerapan Servis</span>
            <div className="text-xl md:text-2xl font-black text-red-600 mt-1">
              {data.totalServicesDone} Kali
            </div>
            <span className="text-[10px] text-red-600 font-black">Rekod Penuh</span>
          </div>
        </div>

        {/* Value Pitch for Selling Bike */}
        <div className="p-3.5 rounded-2xl bg-zinc-100 border border-zinc-300 text-xs text-zinc-950 flex items-start space-x-2.5">
          <QrCode className="w-4 h-4 shrink-0 mt-0.5 text-zinc-950" />
          <p className="leading-relaxed">
            <span className="font-black text-zinc-950">Nilai Jual Semula Terjamin:</span> Motosikal ini disahkan menggunakan alat ganti asli dan diservis mengikut jadual berkala rasmi. Bakal pembeli boleh merujuk rekod di bawah untuk kepastian tanpa ragu.
          </p>
        </div>
      </HeroDepth>

      {/* Official Service History Timeline */}
      <div className="bg-white border-2 border-zinc-300 rounded-3xl p-6 md:p-8 space-y-6">
        <h3 className="text-lg font-black text-zinc-950 flex items-center space-x-2">
          <Wrench className="w-5 h-5 text-red-600" />
          <span>Buku Servis Digital & Sejarah Penyelenggaraan</span>
        </h3>

        <div className="space-y-4">
          {(!data.serviceHistory || data.serviceHistory.length === 0) ? (
            <p className="text-xs text-zinc-800 font-bold p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
              Tiada rekod servis lampau yang direkodkan bagi motosikal ini.
            </p>
          ) : (
            data.serviceHistory.map((serv: any) => (
              <div
                key={serv.id}
                className="bg-zinc-50 border-2 border-zinc-300 rounded-2xl p-4 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-red-600">{serv.woNumber}</span>
                    <span className="text-zinc-600 font-bold">•</span>
                    <span className="text-zinc-800 font-mono font-bold">{serv.completedAt ? serv.completedAt.split("T")[0] : "Dalam proses"}</span>
                  </div>
                  <span className="font-mono font-black text-zinc-950">{Number(serv.mileageIn || 0).toLocaleString()} KM</span>
                </div>

                <div>
                  <p className="text-xs text-zinc-950 font-bold">{serv.customerComplaint}</p>
                  {serv.mechanicNotes && (
                    <p className="text-[11px] text-zinc-800 font-bold italic mt-1">"{serv.mechanicNotes}"</p>
                  )}
                </div>

                {/* Installed parts */}
                {serv.parts && serv.parts.length > 0 && (
                  <div className="pt-2 border-t border-zinc-300">
                    <span className="text-[10px] font-black text-zinc-800 uppercase block mb-1.5">
                      Alat Ganti Tulen Dipasang:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {serv.parts.map((p: any, idx: number) => (
                        <span
                          key={idx}
                          className="text-[11px] font-bold px-2 py-0.5 rounded bg-white border border-zinc-300 text-zinc-950 flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{p.description}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

