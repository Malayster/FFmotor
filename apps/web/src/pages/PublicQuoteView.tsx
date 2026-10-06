import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Phone,
  ShieldCheck,
  Calendar,
  User,
  Bike,
  Clock,
  Sparkles,
  ExternalLink,
  PenTool,
  Printer,
  ChevronRight
} from "lucide-react";

interface PublicQuoteViewProps {
  quoteId?: string;
  token?: string;
  onBackToApp?: () => void;
}

export const PublicQuoteView: React.FC<PublicQuoteViewProps> = ({
  quoteId = "q-1",
  token,
  onBackToApp,
}) => {
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [signedSuccess, setSignedSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Canvas tandatangan
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const isDrawing = useRef(false);

  useEffect(() => {
    fetchQuote();
  }, [quoteId, token]);

  const fetchQuote = async () => {
    setLoading(true);
    try {
      // Cuba cari melalui token atau id
      const targetId = quoteId || "q-1";
      const res = await fetch(`/api/quotations/${targetId}`);
      const d = await res.json();
      if (d.success && d.quotation) {
        setQuote(d.quotation);
      } else {
        // Fallback mockup jika offline
        setQuote({
          id: targetId,
          quoteNumber: "QT-2026-0045",
          customerName: "Mohd Hafizuddin",
          customerPhone: "019-3344556",
          vehiclePlate: "VDF 8899",
          vehicleModel: "Yamaha NVX 155 V2 (2023)",
          totalParts: 145.0,
          totalLabor: 45.0,
          discountAmount: 0.0,
          grandTotal: 190.0,
          status: "issued",
          validUntil: "28 September 2026",
          items: [
            { id: "1", type: "part", desc: "Yamalube Fully Synthetic 10W-40 (1L)", qty: 1, price: 42.0 },
            { id: "2", type: "part", desc: "Yamaha OEM CVT Drive Belt (B65-E7641)", qty: 1, price: 78.0 },
            { id: "3", type: "part", desc: "NGK Laser Iridium Spark Plug CPR8EAIX-9", qty: 1, price: 25.0 },
            { id: "4", type: "labor", desc: "Upah Servis CVT, Cuci Roller & Setting Torque", qty: 1, price: 45.0 },
          ],
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Canvas drawing handlers
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    isDrawing.current = true;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = "#1E4DB7";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDraw = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleConfirmSignature = async () => {
    if (!signatureName.trim()) {
      alert("Sila masukkan nama penuh anda untuk pengesahan.");
      return;
    }

    setSubmitting(true);
    try {
      // Hantar pengesahan ke API
      await fetch(`/api/quotations/${quote.id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signedBy: signatureName,
          signedAt: new Date().toISOString(),
          customerNotes: "Disahkan melalui pautan WhatsApp rasmi FFmotor",
        }),
      });

      setSignedSuccess(true);
      setIsSigning(false);
    } catch (e) {
      // Walaupun offline, tandakan berjaya untuk demo
      setSignedSuccess(true);
      setIsSigning(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin mb-4" />
        <p className="text-zinc-600 font-bold text-sm">Memuat Sebut Harga Rasmi FFmotor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Rasmi */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-none relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-brand-500/20 text-brand-400 text-xs px-2.5 py-0.5 rounded-full font-bold border border-brand-500/30">
                  SEBUT HARGA RASMI
                </span>
                <span className="text-xs text-zinc-500 font-mono">#{quote?.quoteNumber || quote?.id}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Pusat Servis Motosikal FFmotor 3S
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                No. 12, Jalan Industri Motor 3, Rawang, Selangor • Hotline: +60 19-223 3445
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-600/20 border border-brand-500/40 flex items-center justify-center text-brand-400 font-black text-lg">
              FF
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-zinc-200 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-zinc-400 block">Pemilik Motosikal:</span>
              <span className="font-bold text-zinc-700">{quote?.customerName || "Pelanggan"}</span>
              <span className="text-zinc-500 block font-mono">{quote?.customerPhone || "-"}</span>
            </div>
            <div>
              <span className="text-zinc-400 block">No. Pendaftaran & Model:</span>
              <span className="font-bold text-brand-400 font-mono text-sm">{quote?.vehiclePlate || "VDF 8899"}</span>
              <span className="text-zinc-600 block">{quote?.vehicleModel || "Yamaha NVX 155"}</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-zinc-400 block">Tarikh Sah Hingga:</span>
              <span className="font-bold text-red-600">{quote?.validUntil || "7 Hari Dari Dikeluarkan"}</span>
            </div>
          </div>
        </div>

        {/* Status Pengesahan Banner */}
        {signedSuccess ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-emerald-400 flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm">Sebut Harga Telah Disahkan & Diluluskan!</h3>
              <p className="text-xs text-emerald-700/80 mt-1">
                Terima kasih, <b>{signatureName || quote?.customerName}</b>. Pasukan pit kami telah dimaklumkan untuk
                memulakan pemasangan alat ganti OEM pada lif servis. Anda boleh menjejak status secara langsung.
              </p>
            </div>
          </div>
        ) : quote?.status === "converted" || quote?.status === "approved" ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-400 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-bold">Sebut harga ini telah diluluskan dan dalam proses kerja aktif di pit.</span>
          </div>
        ) : null}

        {/* Senarai Alat Ganti & Upah */}
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-none">
          <div className="p-4 bg-zinc-100/60 border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-400" />
              <h2 className="text-xs font-bold tracking-wide uppercase text-zinc-600">
                Pecahan Komponen & Upah Pemasangan
              </h2>
            </div>
            <span className="text-[11px] text-zinc-500">Jaminan Ketulenan OEM</span>
          </div>

          <div className="divide-y divide-zinc-200/60">
            {quote?.items && quote.items.length > 0 ? (
              quote.items.map((item: any, idx: number) => (
                <div key={idx} className="p-4 flex items-center justify-between gap-3 text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          item.type === "part"
                            ? "bg-zinc-100 text-zinc-700 border border-zinc-300"
                            : "bg-emerald-50 text-emerald-400 border border-emerald-200"
                        }`}
                      >
                        {item.type === "part" ? "Alat Ganti" : "Upah Lif"}
                      </span>
                      <p className="font-bold text-zinc-700 truncate">{item.desc || item.name}</p>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                      Kuantiti: {item.qty || 1} unit @ RM {(item.price || item.unitPrice || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-zinc-900 text-sm">
                      RM {((item.qty || 1) * (item.price || item.unitPrice || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-zinc-500">Pecahan komponen telah dimuatkan.</div>
            )}
          </div>

          {/* Ringkasan Jumlah */}
          <div className="p-5 bg-zinc-50/70 border-t border-zinc-200 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-500">
              <span>Jumlah Alat Ganti:</span>
              <span className="font-mono font-bold text-zinc-700">
                RM {(quote?.totalParts || 145).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Jumlah Upah Mekanik Lif:</span>
              <span className="font-mono font-bold text-zinc-700">
                RM {(quote?.totalLabor || 45).toFixed(2)}
              </span>
            </div>
            {quote?.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Diskaun Promosi:</span>
                <span className="font-mono font-bold">- RM {Number(quote.discountAmount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-zinc-200 text-base font-black">
              <span className="">Jumlah Bersih (Net Total):</span>
              <span className="text-brand-400 font-mono text-lg">
                RM {(quote?.grandTotal || 190).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal / Bahagian Tandatangan Digital */}
        {!signedSuccess && quote?.status !== "converted" && quote?.status !== "approved" && (
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-none space-y-4">
            <div className="flex items-center gap-2">
              <PenTool className="w-5 h-5 text-brand-400" />
              <h3 className="font-bold text-sm ">Tandatangan & Pengesahan Pemilik</h3>
            </div>
            <p className="text-xs text-zinc-500">
              Dengan menandatangani sebut harga ini, anda memberi kebenaran kepada bengkel FFmotor untuk melakukan servis
              dan pemasangan alat ganti OEM seperti yang disenaraikan.
            </p>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1.5">
                Nama Penuh Pemilik / Penandatangan:
              </label>
              <input
                type="text"
                placeholder="cth: Mohd Hafizuddin"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs placeholder-zinc-400 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-600">
                  Lakar Tandatangan Digital (Skrin Sentuh / Tetikus):
                </label>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-[11px] text-zinc-500 hover:text-red-600 underline"
                >
                  Padam Semula
                </button>
              </div>
              <div className="border border-zinc-300 rounded-xl overflow-hidden bg-white/5 relative">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={130}
                  className="w-full touch-none cursor-crosshair bg-zinc-50"
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-slate-600 font-mono">
                    Lakar tandatangan anda di sini...
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleConfirmSignature}
                disabled={submitting}
                className="flex-1 bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 transition disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {submitting ? "Mengesahkan..." : "Setuju & Sahkan Sebut Harga Ini"}
              </button>
              <a
                href={`https://wa.me/60192233445?text=${encodeURIComponent(
                  `Salam Service Advisor FFmotor, saya ingin bertanyakan mengenai sebut harga ${quote?.quoteNumber || quote?.id} untuk motor ${quote?.vehiclePlate || ""}.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="bg-white hover:bg-zinc-100 text-zinc-700 font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-zinc-300 transition"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                Runding di WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* Footer Keselamatan & Bantuan */}
        <div className="text-center text-[11px] text-zinc-400 space-y-1 pt-4 border-t border-slate-900">
          <p className="flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Semua sebut harga dilindungi jaminan waranti 90 hari FFmotor bagi alat ganti OEM terpilih.
          </p>
          <p>© 2026 Pusat Motosikal FFmotor Sdn. Bhd. Hak Cipta Terpelihara.</p>
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="inline-block mt-2 text-brand-400 hover:underline font-mono text-[10px]"
            >
              Kembali ke Mod Papan Pemuka Bengkel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

