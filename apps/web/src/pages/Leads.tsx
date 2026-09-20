import React, { useState, useEffect } from "react";
import { Users, Plus, Sparkles, MessageSquare, ExternalLink } from "lucide-react";
import { Lead, PredictiveBooking } from "../types";
import { createWhatsAppLink } from "../lib/whatsapp";

interface LeadsProps {
  leads: Lead[];
  onRefresh: () => void;
}

export const Leads: React.FC<LeadsProps> = ({ leads, onRefresh }) => {
  const [forecasts, setForecasts] = useState<PredictiveBooking[]>([]);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [type, setType] = useState<"bike_purchase" | "service_maintenance" | "parts_hunting">("bike_purchase");
  const [targetItem, setTargetItem] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");

  const fetchForecasts = async () => {
    try {
      const res = await fetch("/api/leads/predictive-forecasts");
      const data = await res.json();
      if (data.success) {
        setForecasts(data.forecasts);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchForecasts();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          type,
          targetItem,
          budget: parseFloat(budget) || null,
          notes,
        }),
      });
      setIsAddLeadModalOpen(false);
      setCustomerName("");
      setCustomerPhone("");
      setTargetItem("");
      onRefresh();
    } catch (err) {
      alert("Ralat menambah lead: " + err);
    }
  };

  const handleCopyWhatsApp = (msg?: string) => {
    if (!msg) return;
    navigator.clipboard.writeText(msg);
    alert("Teks WhatsApp telah disalin ke papan klip! Anda boleh tampal terus ke WhatsApp pelanggan.");
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Saluran Prospek (Leads) & Enjin Ramalan</h1>
          <p className="text-xs text-slate-400">Pengurusan peluang jualan motor serta ramalan pintar masa depan servis berkala</p>
        </div>
        <button
          onClick={() => setIsAddLeadModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold shadow-lg shadow-brand-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Lead Baru</span>
        </button>
      </div>

      {/* SECTION 1: CIRI 3 - PREDICTIVE PARTS BOOKING (AI MILEAGE ENGINE) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border-2 border-indigo-500/30 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-black uppercase">
                Ciri Genius 3 • Cloudflare Cron
              </div>
              <h2 className="text-xl font-extrabold text-white mt-1">Predictive Parts Booking Dashboard</h2>
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-sm">
            Sistem mengira purata kilometer harian setiap motor secara automatik dan meramal bila komponen haus (seperti belting CVT / minyak) perlu ditukar sebelum breakdown.
          </p>
        </div>

        {/* Forecast Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {forecasts.map((fc) => (
            <div
              key={fc.id}
              className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-indigo-500/40 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-black text-white">{fc.plateNumber}</span>
                    <span className="text-xs text-indigo-400 font-bold">• {fc.model}</span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">{fc.ownerName} ({fc.ownerPhone})</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {fc.dailyKmAvg} km/hari
                </span>
              </div>

              {/* Prediction details */}
              <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Komponen Kritikal:</span>
                  <span className="text-white font-bold uppercase">{fc.componentType.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Jangkaan Cecah Had:</span>
                  <span className="text-rose-400 font-mono font-bold">{fc.estimatedMileageDue.toLocaleString()} KM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tarikh Diramal:</span>
                  <span className="text-emerald-400 font-bold">{fc.predictedServiceDate}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Stok Part Ditempah Awal:</span>
                  <span className="text-indigo-300 font-bold">{fc.reservedProductName || "Belt Ori"} (di {fc.reservedProductRack || "RAK-B2"})</span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={createWhatsAppLink(fc.ownerPhone, fc.whatsappMessageContent || "")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka WhatsApp</span>
                </a>
                <button
                  onClick={() => handleCopyWhatsApp(fc.whatsappMessageContent)}
                  className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Salin Teks</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: REGULAR LEADS PIPELINE */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white">Senarai Prospek Jualan (Sales Leads)</h2>
          <p className="text-xs text-slate-400">Pelanggan yang berminat membeli motosikal baharu atau mencari aksesori khas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    lead.status === "loan_submitted"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  }`}
                >
                  {lead.status.replace("_", " ")}
                </span>
                <span className="text-xs font-bold text-white">
                  {lead.budget ? `RM ${lead.budget.toFixed(2)}` : "Bajet Fleksibel"}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-black text-white">{lead.customerName}</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{lead.customerPhone}</p>
              </div>

              <div className="bg-slate-900 rounded-xl p-2.5 text-xs text-slate-300">
                <span className="font-bold text-slate-400 block text-[10px] uppercase">Minat Motor / Part:</span>
                {lead.targetItem}
              </div>

              {lead.notes && (
                <p className="text-[11px] text-slate-400 italic">"{lead.notes}"</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: TAMBAH LEAD BARU */}
      {isAddLeadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-brand-500" />
              <span>Daftar Prospek (Lead) Baharu</span>
            </h3>

            <form onSubmit={handleCreateLead} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300">Nama Pelanggan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Syed Danial"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">No. Telefon *</label>
                  <input
                    type="text"
                    required
                    placeholder="0183344556"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Jenis Minat</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-brand-500 outline-none"
                  >
                    <option value="bike_purchase">Beli Motosikal</option>
                    <option value="service_maintenance">Servis / Overhaul</option>
                    <option value="parts_hunting">Cari Aksesori / Part Rare</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Sasaran Model / Part *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Yamaha Y15ZR V2 Cyan atau Coverset Movistar"
                  value={targetItem}
                  onChange={(e) => setTargetItem(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Anggaran Bajet (RM)</label>
                <input
                  type="number"
                  placeholder="9500"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Nota Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Slip gaji dah ada, nak loan bank deposit rendah..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-brand-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddLeadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold"
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

