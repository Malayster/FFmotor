import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Flame,
  CheckCircle2,
  Calendar,
  Wrench,
  AlertTriangle,
  Clock,
  Send,
  Phone,
  Search
} from "lucide-react";
import { Lead } from "../types";
import { fetchApi } from "../lib/api";
import { toast } from "sonner";
import { tactileAudio } from "../lib/audio";

interface PredictiveForecast {
  id: string;
  motorcycleId: string;
  plateNumber: string;
  model: string;
  ownerName: string;
  ownerPhone: string;
  dailyKmAvg: number;
  componentType: string;
  estimatedMileageDue: number;
  predictedServiceDate: string;
  reservedProductName: string;
  reservedProductRack: string;
  whatsappMessageContent: string;
}

interface LeadsProps {
  leads: Lead[];
  onRefresh?: () => void;
}

export const Leads: React.FC<LeadsProps> = ({ leads: initialLeads, onRefresh }) => {
  const [leads, setLeads] = useState<Lead[]>(initialLeads || []);
  const [forecasts, setForecasts] = useState<PredictiveForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [targetItem, setTargetItem] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<"bike_purchase" | "service_maintenance" | "parts_hunting">("bike_purchase");

  useEffect(() => {
    setLeads(initialLeads || []);
  }, [initialLeads]);

  useEffect(() => {
    loadForecasts();
  }, []);

  const loadForecasts = async () => {
    try {
      setLoading(true);
      const res = await fetchApi<{ success: boolean; data: PredictiveForecast[] }>("/leads/predictive-forecasts");
      if (res && res.data) {
        setForecasts(res.data);
      }
    } catch {
      // Mock data kecemasan jika backend belum aktif
      setForecasts([
        {
          id: "fc-1",
          motorcycleId: "moto-1",
          plateNumber: "VDF 8899",
          model: "Yamaha NVX 155 V2",
          ownerName: "Tuan Farid",
          ownerPhone: "0192233445",
          dailyKmAvg: 45,
          componentType: "belting_cvt",
          estimatedMileageDue: 25000,
          predictedServiceDate: "Dalam 14 Hari",
          reservedProductName: "V-Belt Yamaha Genuine NVX",
          reservedProductRack: "RAK-A3",
          whatsappMessageContent: "Salam Tuan Farid, motor NVX (VDF 8899) anda dijangka sampai 25,000 KM. Stok belt CVT dah kami simpankan di FFmotor. Nak kami lock slot servis Sabtu ni?",
        },
        {
          id: "fc-2",
          motorcycleId: "moto-2",
          plateNumber: "PLA 1234",
          model: "Honda RS-X 150",
          ownerName: "Ahmad Albab",
          ownerPhone: "0134455667",
          dailyKmAvg: 70,
          componentType: "minyak_enjin",
          estimatedMileageDue: 12000,
          predictedServiceDate: "Dalam 5 Hari",
          reservedProductName: "Minyak Motul 7100 10W-40",
          reservedProductRack: "RAK-OIL1",
          whatsappMessageContent: "Salam En. Ahmad, motor RS-X (PLA 1234) anda dah nak cecah servis 12,000KM. Minyak Motul dah sedia di kaunter FFmotor. Nak booking slot hari ini?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const createWhatsAppLink = (phone: string, text: string) => {
    let cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) cleanPhone = "6" + cleanPhone;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      tactileAudio.buttonClick();
      await fetchApi("/leads", {
        method: "POST",
        body: JSON.stringify({
          customerName,
          customerPhone,
          targetItem,
          budget: budget ? parseFloat(budget) : undefined,
          notes,
          type,
          source: "kaunter",
          status: "new",
        }),
      });
      toast.success("Lead baru berjaya ditambah!");
      setIsAddLeadModalOpen(false);
      setCustomerName("");
      setCustomerPhone("");
      setTargetItem("");
      setBudget("");
      setNotes("");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error("Ralat menambah lead: " + err.message);
    }
  };

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      tactileAudio.buttonClick();
      await fetchApi(`/leads/${leadId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success("Status prospek berjaya dikemaskini!");
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus as any } : l))
      );
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error("Ralat kemaskini status: " + err.message);
    }
  };

  const handleCopyWhatsApp = (msg?: string) => {
    if (!msg) return;
    navigator.clipboard.writeText(msg);
    tactileAudio.successChime();
    toast.success("Teks WhatsApp telah disalin ke papan klip!");
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* 1. TOP HEADER - SOLID HIGH CONTRAST (4 WARNA) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-zinc-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-black text-red-600 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span className="tracking-wider uppercase">Saluran Prospek Jualan & CRM Pelanggan</span>
            <span className="text-zinc-950 font-bold">•</span>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border-2 border-red-300 text-[10px] font-black uppercase">
              Tugasan Kaunter & SA
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
            Pengurusan Peluang Jualan & Ramalan Servis
          </h1>
          <p className="text-xs sm:text-sm text-zinc-800 mt-1 font-bold">
            Kerani kaunter menguruskan prospek motosikal, permohonan pinjaman, dan ramalan alat ganti berkala.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            tactileAudio.buttonClick();
            setIsAddLeadModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-black shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Tambah Prospek Baharu</span>
        </button>
      </div>

      {/* 2. SECTION 1: PREDICTIVE PARTS BOOKING (SOLID WHITE BACKGROUND, SIFAR GRADIENT) */}
      <div className="bg-white border-2 border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-zinc-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 border-2 border-zinc-300 flex items-center justify-center text-zinc-950 shadow-xs">
              <Sparkles className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-950 text-[11px] font-black uppercase border border-zinc-300">
                Enjin Ramalan Servis Berkala
              </div>
              <h2 className="text-xl font-black text-zinc-950 mt-1">Tempahan Alat Ganti Berdasarkan Perbatuan (Mileage)</h2>
            </div>
          </div>
          <p className="text-xs text-zinc-800 font-bold max-w-sm">
            Sistem mengira purata kilometer harian motor pelanggan dan meramal bila belting atau minyak perlu ditukar sebelum rosak.
          </p>
        </div>

        {/* Forecast Cards - SOLID WHITE & HIGH CONTRAST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {forecasts.map((fc) => (
            <div
              key={fc.id}
              className="bg-zinc-50 border-2 border-zinc-200 rounded-2xl p-5 space-y-4 hover:border-zinc-950 transition-all shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-black text-zinc-950 font-mono">{fc.plateNumber}</span>
                    <span className="text-xs text-zinc-900 font-black">• {fc.model}</span>
                  </div>
                  <p className="text-xs text-zinc-800 font-bold mt-0.5">{fc.ownerName} ({fc.ownerPhone})</p>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 font-mono">
                  {fc.dailyKmAvg} km/hari
                </span>
              </div>

              {/* Prediction details */}
              <div className="bg-white rounded-xl p-3.5 border-2 border-zinc-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-800 font-bold">Komponen Kritikal:</span>
                  <span className="text-zinc-950 font-black uppercase">{fc.componentType.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-800 font-bold">Jangkaan Cecah Had:</span>
                  <span className="text-red-700 font-mono font-black">{fc.estimatedMileageDue.toLocaleString()} KM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-800 font-bold">Tarikh Diramal:</span>
                  <span className="text-emerald-800 font-black bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">{fc.predictedServiceDate}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t-2 border-zinc-100">
                  <span className="text-zinc-800 font-bold">Stok Part Ditempah:</span>
                  <span className="text-zinc-950 font-black">{fc.reservedProductName || "Belt Ori"} (di {fc.reservedProductRack || "RAK-B2"})</span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={createWhatsAppLink(fc.ownerPhone, fc.whatsappMessageContent || "")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white font-black text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Buka WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopyWhatsApp(fc.whatsappMessageContent)}
                  className="py-2.5 rounded-xl bg-white hover:bg-zinc-100 border-2 border-zinc-300 text-zinc-950 font-black text-xs flex items-center justify-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-zinc-950" />
                  <span>Salin Teks</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. SECTION 2: REGULAR LEADS PIPELINE (SOLID WHITE, HIGH CONTRAST) */}
      <div className="bg-white border-2 border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b-2 border-zinc-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-zinc-950">Senarai Prospek Jualan (Sales Leads)</h2>
            <p className="text-xs text-zinc-800 font-bold mt-0.5">Pelanggan yang berminat membeli motosikal baharu atau mencari aksesori khas</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-zinc-950 text-white text-xs font-mono font-black">
            {leads.length} Prospek
          </span>
        </div>

        {leads.length === 0 ? (
          <div className="py-8 text-center text-zinc-800 text-xs font-bold bg-zinc-50 border-2 border-zinc-200 rounded-2xl">
            Tiada rekod prospek jualan ditemui.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="bg-zinc-50 border-2 border-zinc-200 rounded-2xl p-4 space-y-3 hover:border-zinc-950 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <select
                    value={lead.status}
                    onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                    className="text-[10px] font-black uppercase px-2 py-1 rounded-lg bg-white border-2 border-zinc-300 text-zinc-950 focus:border-zinc-950 outline-none cursor-pointer"
                  >
                    <option value="new">🟢 Baharu</option>
                    <option value="contacted">📞 Dihubungi</option>
                    <option value="loan_submitted">📑 Mohon Loan</option>
                    <option value="converted">✅ Berjaya Jual</option>
                    <option value="lost">❌ Dibatalkan</option>
                  </select>
                  <span className="text-xs font-black text-zinc-950 font-mono">
                    {lead.budget ? `RM ${lead.budget.toFixed(2)}` : "Bajet Fleksibel"}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-black text-zinc-950">{lead.customerName}</h4>
                  <p className="text-xs text-zinc-800 font-mono font-bold mt-0.5">{lead.customerPhone}</p>
                </div>

                <div className="bg-white rounded-xl p-2.5 text-xs text-zinc-950 border border-zinc-200">
                  <span className="font-black text-zinc-950 block text-[10px] uppercase">Minat Motosikal / Alat:</span>
                  <span className="font-bold">{lead.targetItem}</span>
                </div>

                {lead.notes && (
                  <p className="text-[11px] text-zinc-800 font-medium italic bg-white p-2 rounded-lg border border-zinc-200">
                    &quot;{lead.notes}&quot;
                  </p>
                )}

                <div className="pt-2 border-t border-zinc-200">
                  <a
                    href={createWhatsAppLink(lead.customerPhone, `Salam ${lead.customerName}, kami dari FFmotor berkenaan minat anda untuk ${lead.targetItem}. Boleh kami bantu?`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white font-black text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Hubungi WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. MODAL: TAMBAH LEAD BARU (SOLID WHITE, HIGH CONTRAST) */}
      {isAddLeadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-zinc-300 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-zinc-950 flex items-center space-x-2 border-b-2 border-zinc-100 pb-3">
              <Users className="w-5 h-5 text-red-600" />
              <span>Daftar Prospek (Lead) Baharu</span>
            </h3>

            <form onSubmit={handleCreateLead} className="space-y-3">
              <div>
                <label className="text-xs font-black text-zinc-950">Nama Pelanggan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Syed Danial"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white border-2 border-zinc-300 text-xs font-bold text-zinc-950 focus:border-zinc-950 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-zinc-950">No. Telefon *</label>
                  <input
                    type="text"
                    required
                    placeholder="0183344556"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white border-2 border-zinc-300 text-xs font-bold text-zinc-950 focus:border-zinc-950 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-zinc-950">Jenis Minat</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white border-2 border-zinc-300 text-xs font-bold text-zinc-950 focus:border-zinc-950 outline-none"
                  >
                    <option value="bike_purchase">Beli Motosikal</option>
                    <option value="service_maintenance">Servis / Overhaul</option>
                    <option value="parts_hunting">Cari Aksesori / Part</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-zinc-950">Sasaran Model / Part *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Yamaha Y15ZR atau Belting NVX"
                  value={targetItem}
                  onChange={(e) => setTargetItem(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white border-2 border-zinc-300 text-xs font-bold text-zinc-950 focus:border-zinc-950 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-black text-zinc-950">Anggaran Bajet (RM)</label>
                <input
                  type="number"
                  placeholder="9500"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white border-2 border-zinc-300 text-xs font-bold text-zinc-950 focus:border-zinc-950 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-black text-zinc-950">Nota Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Slip gaji dah ada, nak loan bank deposit rendah..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white border-2 border-zinc-300 text-xs font-bold text-zinc-950 focus:border-zinc-950 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t-2 border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsAddLeadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-950 text-xs font-black hover:bg-zinc-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-black cursor-pointer shadow-sm active:scale-95"
                >
                  Simpan Prospek
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
