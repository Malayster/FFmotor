import React, { useEffect, useState } from "react";
import {
  Megaphone,
  Plus,
  Send,
  Users,
  Calendar,
  Sparkles,
  CheckCircle2,
  Bike,
  DollarSign
} from "lucide-react";
import { createWhatsAppLink } from "../lib/whatsapp";

interface CampaignItem {
  id: string;
  title: string;
  tagline: string;
  targetAudience: string;
  estimatedReach: number;
  promoPrice: number;
  messageContent: string;
  status: "active" | "draft" | "completed";
}

export const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(() => [] as CampaignItem[]);
  useEffect(() => {
    fetch("/api/vehicles").then((r) => r.json()).then((d) => {
      const rows = Array.isArray(d.vehicles) ? d.vehicles : [];
      const due = rows.filter((v: { lastServiceDate?: string }) => Boolean(v.lastServiceDate));
      if (due.length === 0) return;
      setCampaigns([{
        id: "KMP-SERVIS",
        title: "Peringatan servis dari rekod",
        tagline: "Hanya pelanggan yang ada tarikh servis",
        targetAudience: `${due.length} rekod servis`,
        estimatedReach: due.length,
        promoPrice: 0,
        messageContent: "Servis susulan berdasarkan tarikh terakhir dalam rekod kedai.",
        status: "active",
      }]);
    }).catch(() => null);
  }, []);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignItem | null>(campaigns[0] || null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTagline, setNewTagline] = useState("");
  const [newAudience, setNewAudience] = useState("Semua Pelanggan Servis");
  const [newPrice, setNewPrice] = useState("45");
  const [newMessage, setNewMessage] = useState("");

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newMessage) return;
    const newItem: CampaignItem = {
      id: `KMP-0${campaigns.length + 1}`,
      title: newTitle,
      tagline: newTagline || newTitle,
      targetAudience: newAudience,
      estimatedReach: 250,
      promoPrice: parseFloat(newPrice) || 0,
      messageContent: newMessage,
      status: "active",
    };
    setCampaigns([newItem, ...campaigns]);
    setSelectedCampaign(newItem);
    setIsAddOpen(false);
    setNewTitle("");
    setNewTagline("");
    setNewMessage("");
  };

  const handleTestBroadcast = () => {
    if (!selectedCampaign) return;
    // Simulasi hantar WhatsApp ke nombor sendiri
    const link = createWhatsAppLink("0123456789", selectedCampaign.messageContent);
    window.open(link, "_blank");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-zinc-950 font-black">
            <span>FFmotor HQ</span>
            <span>/</span>
            <span className="text-red-600 font-black">Kempen & Pemasaran</span>
          </nav>
          <h1 className="text-xl md:text-2xl font-black text-zinc-950 tracking-tight mt-1">
            Pusat Kempen Promosi & Siaran Mesej Servis
          </h1>
          <p className="text-xs text-zinc-800 font-bold">
            Jana kempen bermusim, broadcast pautan promosi kepada pelanggan tidak aktif, dan tarik jualan bengkel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border-2 border-zinc-300 hover:border-zinc-950 text-zinc-950 text-xs font-black transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-red-600" />
            <span>Kempen Baharu</span>
          </button>
          <button
            onClick={handleTestBroadcast}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-black transition shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Uji Siaran WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Grid: Senarai Kempen vs Pratonton Mesej */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Kolum Kiri (5 Cols): Senarai Kempen */}
        <div className="rounded-2xl border border-zinc-200 bg-white/90 p-4 shadow-sm lg:col-span-5 space-y-3">
          <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider block px-1">
            Senarai Kempen Pemasaran
          </span>

          <div className="space-y-2.5">
            {campaigns.map((camp) => {
              const isSelected = selectedCampaign?.id === camp.id;
              return (
                <div
                  key={camp.id}
                  onClick={() => setSelectedCampaign(camp)}
                  className={`p-4 rounded-xl border transition cursor-pointer space-y-2 ${
                    isSelected
                      ? "bg-brand-500/15 border-brand-500/40 shadow-xs"
                      : "bg-zinc-50/60 border-zinc-200 hover:bg-zinc-100/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-brand-400">{camp.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-400">
                      AKTIF
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900">{camp.title}</h4>
                  <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">{camp.tagline}</p>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-200/80">
                    <span className="text-zinc-500">Sasaran: {camp.estimatedReach} Pelanggan</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {camp.promoPrice === 0 ? "PERCUMA" : `RM ${camp.promoPrice}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kolum Kanan (7 Cols): Pratonton Mesej & Siaran */}
        {selectedCampaign && (
          <div className="rounded-2xl border border-zinc-200 bg-white/90 p-6 shadow-sm lg:col-span-7 space-y-5">
            <div className="pb-4 border-b border-zinc-200">
              <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                Pratonton Kempen
              </span>
              <h2 className="text-lg font-black text-zinc-900 mt-1">{selectedCampaign.title}</h2>
              <p className="text-xs text-zinc-500">{selectedCampaign.targetAudience}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                Teks Siaran WhatsApp Broadcast:
              </label>
              <div className="rounded-xl bg-zinc-50 p-4 font-mono text-xs text-zinc-700 border border-zinc-200 whitespace-pre-wrap leading-relaxed">
                {selectedCampaign.messageContent}
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-zinc-500 font-medium">
                Kadar Buka Mesej Anggaran: <b className="">88% (WhatsApp Direct)</b>
              </span>

              <button
                onClick={handleTestBroadcast}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition shadow-md shadow-emerald-950"
              >
                <Send className="w-4 h-4" />
                <span>Lancarkan Siaran Mesej Pukal</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah Kempen Baharu */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-zinc-300 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-zinc-950 flex items-center space-x-2 border-b-2 border-zinc-100 pb-3">
              <Megaphone className="w-5 h-5 text-red-600" />
              <span>Cipta Kempen Promosi Baharu</span>
            </h3>

            <form onSubmit={handleCreateCampaign} className="space-y-3 text-xs">
              <div>
                <label className="font-black text-zinc-950">Tajuk Kempen *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pakej Tukar Tayar & Percuma Minyak Hitam"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white border-2 border-zinc-300 text-xs font-bold text-zinc-950 focus:border-zinc-950 outline-none"
                />
              </div>

              <div>
                <label className="font-black text-zinc-950">Slogan / Tagline Ringkas</label>
                <input
                  type="text"
                  placeholder="Tawaran terhad 50 pelanggan terawal"
                  value={newTagline}
                  onChange={(e) => setNewTagline(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white border-2 border-zinc-300 text-xs font-bold text-zinc-950 focus:border-zinc-950 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-black text-zinc-950">Sasaran Pelanggan</label>
                  <input
                    type="text"
                    value={newAudience}
                    onChange={(e) => setNewAudience(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white border-2 border-zinc-300 text-xs font-bold text-zinc-950 focus:border-zinc-950 outline-none"
                  />
                </div>
                <div>
                  <label className="font-black text-zinc-950">Harga Promosi (RM)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white border-2 border-zinc-300 text-xs font-bold text-zinc-950 focus:border-zinc-950 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-black text-zinc-950">Teks Mesej WhatsApp Broadcast *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Salam Bro! FFmotor ada promosi istimewa untuk anda..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white border-2 border-zinc-300 text-xs font-bold text-zinc-950 focus:border-zinc-950 outline-none font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t-2 border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-950 text-xs font-black hover:bg-zinc-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-black cursor-pointer shadow-sm active:scale-95"
                >
                  Daftar Kempen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

