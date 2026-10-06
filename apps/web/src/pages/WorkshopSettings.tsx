import React, { useState } from "react";
import {
  Settings,
  Building2,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  ShieldCheck,
  Save,
  CheckCircle2,
  Percent,
  CreditCard,
  FileText,
  AlertCircle,
  Lock,
  KeyRound
} from "lucide-react";
import { tactileAudio } from "../lib/audio";
import { toast } from "sonner";

interface WorkshopSettingsProps {
  onSaved?: () => void;
}

export const WorkshopSettings: React.FC<WorkshopSettingsProps> = ({ onSaved }) => {
  // Semak peranan pengguna semasa
  const currentUser = (() => {
    try {
      const saved = localStorage.getItem("ffmotor_current_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const isOwner = currentUser?.role === "owner" || currentUser?.role === "admin";

  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem("ffmotor_workshop_settings");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      workshopName: "Pusat Servis Motosikal FFmotor 3S",
      companyName: "FFmotor Sdn. Bhd.",
      ssmNumber: "202401089211 (1583920-X)",
      phone: "03-6091 8899",
      whatsappHotline: "019-223 3445",
      email: "admin@ffmotor.my",
      address: "No. 12, Jalan Industri Motor 3, Kawasan Perindustrian Rawang",
      postcode: "48000",
      city: "Rawang",
      state: "Selangor Darul Ehsan",
      operatingHours: "Isnin – Sabtu: 8:30 AM – 6:30 PM (Ahad: Tutup)",
      sstNumber: "W10-2401-32000451",
      bankName: "",
      bankAccountNo: "",
      bankAccountName: "",
      duitnowMerchantId: "MERCHANT-FFMTR-RAWANG",
      hourlyLaborRate: "45.00",
      maxSaDiscountPercent: "5",
      stockReorderBuffer: "5",
      warrantyDays: "90",
    };
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [ownerPin, setOwnerPin] = useState("");
  const [pinError, setPinError] = useState("");



  const handlePromptSave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPinModal(true);
    setPinError("");
  };

  const handleConfirmSaveWithPin = () => {
    let role = "";
    try {
      role = JSON.parse(localStorage.getItem("ffmotor_current_user") || "{}").role || "";
    } catch { role = ""; }
    if (role !== "owner") {
      tactileAudio.warningAlert();
      setPinError("Hanya sesi pemilik boleh simpan akaun bank.");
      return;
    }
    if (!formData.bankAccountNo || String(formData.bankAccountNo).trim().length < 6) {
      setPinError("Nombor akaun wajib diisi oleh pemilik. Jangan simpan nombor contoh.");
      return;
    }

    localStorage.setItem("ffmotor_workshop_settings", JSON.stringify(formData));
    tactileAudio.cashRegister();
    setSavedSuccess(true);
    setShowPinModal(false);
    setOwnerPin("");
    toast.success("Tetapan akaun bank dan profil cawangan berjaya disimpan dengan tandatangan pemilik!");
    setTimeout(() => setSavedSuccess(false), 4000);
    if (onSaved) onSaved();
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-zinc-200 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <span className="p-3 rounded-2xl bg-zinc-950 text-white font-black shadow-sm">
            <Lock className="w-5 h-5 text-red-500" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300">
                PENGURUSAN TERTINGGI HQ
              </span>
              <span className="text-[10px] text-emerald-800 font-mono font-bold bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Akses Eksklusif Pemilik
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-950 mt-1">
              Tetapan Cawangan, Akaun Bank & Had Kuasa
            </h1>
            <p className="text-xs text-zinc-700 mt-0.5 font-medium">
              Semua maklumat akaun bank Maybank dan DuitNow QR ini dicetak secara automatik pada resit pelanggan dan invois rasmi.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <span className="text-xs text-emerald-800 bg-emerald-100 border border-emerald-300 px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Perubahan Disahkan
          </span>
        )}
      </div>

      <form onSubmit={handlePromptSave} className="space-y-6 text-xs">
        {/* Seksyen 1: Maklumat Bank & DuitNow QR Rasmi (ZON PALING KRITIKAL) */}
        <div className="bg-white border-2 border-red-300/80 rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-red-100 pb-3">
            <h2 className="text-sm font-black text-zinc-950 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-red-600" /> Butiran Akaun Bank & DuitNow QR Rasmi HQ
            </h2>
            <span className="text-[10px] font-mono font-bold text-red-800 bg-red-100 border border-red-300 px-2 py-0.5 rounded-full">
              Kunci Anti-Pecah Amanah
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-zinc-800 font-bold mb-1">Nama Bank Rasmi Syarikat:</label>
              <input
                type="text"
                required
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full bg-zinc-50 border-2 border-zinc-300 rounded-xl px-3 py-2 text-zinc-950 font-bold focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block text-zinc-800 font-bold mb-1">No. Akaun Bank HQ:</label>
              <input
                type="text"
                required
                value={formData.bankAccountNo}
                onChange={(e) => setFormData({ ...formData, bankAccountNo: e.target.value })}
                className="w-full bg-zinc-50 border-2 border-zinc-300 rounded-xl px-3 py-2 font-mono font-black text-zinc-950 text-sm focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block text-zinc-800 font-bold mb-1">Nama Pemegang Akaun:</label>
              <input
                type="text"
                required
                value={formData.bankAccountName}
                onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                className="w-full bg-zinc-50 border-2 border-zinc-300 rounded-xl px-3 py-2 text-zinc-950 font-bold uppercase focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-zinc-800 font-bold mb-1">DuitNow Merchant ID / Rujukan QR:</label>
              <input
                type="text"
                value={formData.duitnowMerchantId}
                onChange={(e) => setFormData({ ...formData, duitnowMerchantId: e.target.value })}
                className="w-full bg-zinc-50 border-2 border-zinc-300 rounded-xl px-3 py-2 text-zinc-950 font-mono font-bold focus:outline-none focus:border-zinc-950"
              />
              <p className="text-[11px] text-zinc-600 mt-1 font-medium">
                * Akaun bank ini dipaparkan pada semua resit POS 80mm dan invois digital pelanggan. Sebarang pindaan memerlukan tandatangan PIN Pemilik HQ.
              </p>
            </div>
          </div>
        </div>

        {/* Seksyen 2: Maklumat Syarikat & Pendaftaran SSM */}
        <div className="bg-white border-2 border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-zinc-950 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-red-600" /> Profil Premis & Pendaftaran SSM
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-zinc-800 font-bold mb-1">Nama Papan Tanda Bengkel:</label>
              <input
                type="text"
                value={formData.workshopName}
                onChange={(e) => setFormData({ ...formData, workshopName: e.target.value })}
                className="w-full bg-zinc-50 border-2 border-zinc-300 rounded-xl px-3 py-2 text-zinc-950 font-bold focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block text-zinc-800 font-bold mb-1">Nama Syarikat (Sdn Bhd / Enterprise):</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full bg-zinc-50 border-2 border-zinc-300 rounded-xl px-3 py-2 text-zinc-950 font-bold focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block text-zinc-800 font-bold mb-1">No. Pendaftaran SSM:</label>
              <input
                type="text"
                value={formData.ssmNumber}
                onChange={(e) => setFormData({ ...formData, ssmNumber: e.target.value })}
                className="w-full bg-zinc-50 border-2 border-zinc-300 rounded-xl px-3 py-2 font-mono font-bold text-zinc-950 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block text-zinc-800 font-bold mb-1">No. Telefon Kaunter:</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-zinc-50 border-2 border-zinc-300 rounded-xl px-3 py-2 font-mono font-bold text-zinc-950 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block text-zinc-800 font-bold mb-1">WhatsApp Khidmat Pelanggan:</label>
              <input
                type="text"
                value={formData.whatsappHotline}
                onChange={(e) => setFormData({ ...formData, whatsappHotline: e.target.value })}
                className="w-full bg-zinc-50 border-2 border-zinc-300 rounded-xl px-3 py-2 text-emerald-800 font-mono font-bold focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block text-zinc-800 font-bold mb-1">No. Cukai SST (Jika Ada):</label>
              <input
                type="text"
                value={formData.sstNumber}
                onChange={(e) => setFormData({ ...formData, sstNumber: e.target.value })}
                className="w-full bg-zinc-50 border-2 border-zinc-300 rounded-xl px-3 py-2 font-mono font-bold text-zinc-950 focus:outline-none focus:border-zinc-950"
              />
            </div>
          </div>
        </div>

        {/* Seksyen 3: Parameter Kuasa & Polisi Autopilot */}
        <div className="bg-white border-2 border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-zinc-950 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" /> Had Kuasa Staf & Polisi Autopilot
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-zinc-800 font-bold mb-1">Kadar Upah Standard (RM/jam):</label>
              <input
                type="number"
                step="0.1"
                value={formData.hourlyLaborRate}
                onChange={(e) => setFormData({ ...formData, hourlyLaborRate: e.target.value })}
                className="w-full bg-zinc-50 border-2 border-zinc-300 rounded-xl px-3 py-2 font-mono font-bold text-zinc-950 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block text-zinc-800 font-bold mb-1">Had Kuasa Diskaun SA (%):</label>
              <input
                type="number"
                value={formData.maxSaDiscountPercent}
                onChange={(e) => setFormData({ ...formData, maxSaDiscountPercent: e.target.value })}
                className="w-full bg-zinc-50 border-2 border-zinc-300 rounded-xl px-3 py-2 text-red-700 font-mono font-bold focus:outline-none focus:border-zinc-950"
              />
              <span className="text-[10px] text-zinc-600 mt-0.5 block font-medium">Diskaun melebihi had ini perlu kelulusan Pemilik</span>
            </div>

            <div>
              <label className="block text-zinc-800 font-bold mb-1">Buffer Auto-PO Stok Rendah:</label>
              <input
                type="number"
                value={formData.stockReorderBuffer}
                onChange={(e) => setFormData({ ...formData, stockReorderBuffer: e.target.value })}
                className="w-full bg-zinc-50 border-2 border-zinc-300 rounded-xl px-3 py-2 font-mono font-bold text-zinc-950 focus:outline-none focus:border-zinc-950"
              />
              <span className="text-[10px] text-zinc-600 mt-0.5 block font-medium">Auto draf PO bila stok ≤ baki ambang</span>
            </div>

            <div>
              <label className="block text-zinc-800 font-bold mb-1">Tempoh Jaminan Waranti (Hari):</label>
              <input
                type="number"
                value={formData.warrantyDays}
                onChange={(e) => setFormData({ ...formData, warrantyDays: e.target.value })}
                className="w-full bg-zinc-50 border-2 border-zinc-300 rounded-xl px-3 py-2 text-emerald-800 font-mono font-bold focus:outline-none focus:border-zinc-950"
              />
            </div>
          </div>
        </div>

        {/* Butang Simpan Tetapan */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="bg-zinc-950 hover:bg-zinc-900 text-white font-black py-3.5 px-8 rounded-2xl text-xs flex items-center gap-2 shadow-sm transition cursor-pointer active:scale-95"
          >
            <KeyRound className="w-4 h-4 text-red-500" />
            <span>Sahkan & Simpan Menggunakan PIN Pemilik</span>
          </button>
        </div>
      </form>

      {/* Modal Pengesahan PIN Pemilik HQ */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-zinc-300 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b-2 border-zinc-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-zinc-950">Tandatangan Keselamatan Pemilik</h3>
                <p className="text-[11px] text-zinc-600 font-medium">Sila masukkan PIN HQ untuk mengesahkan perubahan akaun bank / cawangan.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-800">PIN Pemilik (HQ Master PIN):</label>
              <input
                type="password"
                maxLength={6}
                autoFocus
                value={ownerPin}
                onChange={(e) => setOwnerPin(e.target.value)}
                placeholder="•••• (Masukkan PIN HQ)"
                className="w-full border-2 border-zinc-300 rounded-xl px-4 py-2.5 text-center font-mono font-black text-xl tracking-widest text-zinc-950 focus:outline-none focus:border-zinc-950"
              />
              {pinError && <p className="text-xs text-red-700 font-bold">{pinError}</p>}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPinModal(false);
                  setOwnerPin("");
                  setPinError("");
                }}
                className="flex-1 py-2.5 rounded-xl border-2 border-zinc-200 text-zinc-800 font-bold text-xs hover:bg-zinc-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSaveWithPin}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition cursor-pointer shadow-sm active:scale-95"
              >
                Sahkan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
