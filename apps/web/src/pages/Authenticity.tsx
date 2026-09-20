import React, { useState } from "react";
import { ShieldCheck, AlertOctagon, CheckCircle2, QrCode, Search, Building2, Calendar, FileText, Bike } from "lucide-react";

export const Authenticity: React.FC = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const sampleSerials = [
    { label: "Minyak Yamalube 4T (Sah & Dipasang)", code: "YAM-2026-987621" },
    { label: "Belt CVT NVX (Sah Dalam Stok)", code: "BLT-NVX-ORI-88992" },
    { label: "Rantai DID Gold (Sah)", code: "DID-JPN-7733190" },
    { label: "Kod Palsu / Ciplak (Cuba ini)", code: "FAKE-OIL-9999" },
  ];

  const handleVerify = async (testCode?: string) => {
    const targetCode = testCode || code;
    if (!targetCode) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: targetCode }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Ralat menyemak kod: " + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Sistem Anti-Ciplak & Pengesahan Ketulenan Rasmi</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Semakan Keaslian Alat Ganti Motosikal</h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Pastikan komponen motosikal anda adalah 100% tulen dan berdaftar secara sah dalam pangkalan data FFmotor.
        </p>
      </div>

      {/* Verification Input Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <QrCode className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Masukkan Kod Siri atau Barcode (cth: YAM-2026-987621)..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm font-mono uppercase focus:border-brand-500 outline-none"
            />
          </div>
          <button
            onClick={() => handleVerify()}
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-extrabold text-sm shadow-lg shadow-brand-500/30 flex items-center justify-center space-x-2 transition-all"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? "Menyemak..." : "Sahkan Sekarang"}</span>
          </button>
        </div>

        {/* Quick Click Samples */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Contoh Kod Siri Untuk Diuji:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleSerials.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCode(s.code);
                  handleVerify(s.code);
                }}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono transition-all"
              >
                {s.code} <span className="text-slate-500 text-[10px]">({s.label})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Verification Result Display */}
      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
          {result.verified ? (
            <div className="bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 md:p-8 space-y-6">
              {/* Badge */}
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase">
                    Disahkan Asli & Sah
                  </div>
                  <h3 className="text-2xl font-black text-white mt-1">
                    {result.details?.productName || result.product?.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Jenama: {result.details?.brand || result.product?.brand} • Kategori: {result.details?.category || result.product?.category}
                  </p>
                </div>
              </div>

              {/* Suspicious warning if scanned too many times */}
              {result.isSuspicious && (
                <div className="flex items-start space-x-3 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  <AlertOctagon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-extrabold block">Peringatan Keselamatan:</span>
                    {result.suspiciousWarning}
                  </div>
                </div>
              )}

              {/* Detail fields */}
              {result.details && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950/60 rounded-2xl p-4 border border-slate-800">
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 font-bold uppercase flex items-center space-x-1">
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Kod Siri Unik</span>
                    </span>
                    <p className="text-xs font-mono font-bold text-white">{result.details.serialNumber}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 font-bold uppercase flex items-center space-x-1">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Saluran Pembekal</span>
                    </span>
                    <p className="text-xs font-bold text-slate-300">{result.details.supplierName}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 font-bold uppercase flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Status Stok</span>
                    </span>
                    <p className="text-xs font-bold text-emerald-400 uppercase">{result.details.status}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 font-bold uppercase flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Audit Imbasan</span>
                    </span>
                    <p className="text-xs font-bold text-white">Diimbas {result.details.scannedCount} kali</p>
                  </div>
                </div>
              )}

              {/* If installed on a bike */}
              {result.details?.installedInfo && (
                <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-1.5">
                  <div className="flex items-center space-x-2 text-indigo-400 font-extrabold text-xs">
                    <Bike className="w-4 h-4" />
                    <span>Telah Dipasang Pada Motosikal Sah:</span>
                  </div>
                  <p className="text-sm font-bold text-white">
                    {result.details.installedInfo.plateNumber} ({result.details.installedInfo.model})
                  </p>
                  <p className="text-xs text-slate-400">
                    No. Work Order: {result.details.installedInfo.woNumber}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gradient-to-b from-rose-950/40 via-slate-900 to-slate-900 border-2 border-rose-500/50 rounded-3xl p-6 md:p-8 space-y-3">
              <div className="flex items-center space-x-3 text-rose-400">
                <AlertOctagon className="w-8 h-8" />
                <h3 className="text-xl font-black text-white">Barang Tidak Ditemui / Disyaki Tiruan</h3>
              </div>
              <p className="text-sm text-slate-300">{result.message}</p>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
                💡 <span className="font-bold text-slate-200">Nasihat FFmotor:</span> Elakkan penggunaan minyak hitam atau alat ganti enjin yang tidak berdaftar untuk mengelakkan kerosakan blok, jem rod atau brek gagal berfungsi.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

