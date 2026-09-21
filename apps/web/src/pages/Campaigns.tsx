import React, { useState } from "react";
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
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([
    {
      id: "KMP-01",
      title: "Pakej Servis Balik Kampung Raya",
      tagline: "Minyak Enjin Fully Synthetic + Plug NGK + Percuma Cuci Rantai",
      targetAudience: "Semua pelanggan servis (300+ Pemilik)",
      estimatedReach: 320,
      promoPrice: 55,
      messageContent:
        "Salam Bro! Jom servis motor sebelum balik kampung sempena cuti perayaan ini di *FFmotor*.\n\n" +
        "Pakej Istimewa Raya hanya *RM 55.00* termasuk:\n" +
        "• Minyak Enjin Fully Synthetic 1L\n• Spark Plug Baru Original\n• Pemeriksaan 15 Titik Brek & Tayar Percuma!\n\n" +
        "Balas *SERVIS* untuk tempah slot anda hari ini. Selamat Hari Raya dari FFmotor!",
      status: "active",
    },
    {
      id: "KMP-02",
      title: "Pemeriksaan Percuma Belting CVT Skuter",
      tagline: "Elak belting putus tengah jalan - Pemeriksaan & cuci habuk percuma",
      targetAudience: "Pemilik Skuter (NVX, Vario, NMAX, Avantiz)",
      estimatedReach: 140,
      promoPrice: 0,
      messageContent:
        "Salam Bro! Skuter anda dah lama tak servis bahagian CVT? Di *FFmotor*, kami tawarkan *Pemeriksaan Kehausan Belting & Roller Percuma* minggu ini.\n\n" +
        "Elak belting putus di lebuh raya. Singgah ke FFmotor hari ini!",
      status: "active",
    },
  ]);

  const [selectedCampaign, setSelectedCampaign] = useState<CampaignItem>(campaigns[0]);

  const handleTestBroadcast = () => {
    // Simulasi hantar WhatsApp ke nombor sendiri
    const link = createWhatsAppLink("0123456789", selectedCampaign.messageContent);
    window.open(link, "_blank");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <span>FFmotor HQ</span>
            <span>/</span>
            <span className="text-brand-400 font-bold">Kempen & Pemasaran</span>
          </nav>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-1">
            Pusat Kempen Promosi & Siaran Mesej Servis
          </h1>
          <p className="text-xs text-slate-400">
            Jana kempen bermusim, broadcast pautan promosi kepada pelanggan tidak aktif, dan tarik jualan bengkel.
          </p>
        </div>

        <button
          onClick={handleTestBroadcast}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs self-start sm:self-auto"
        >
          <Send className="w-4 h-4" />
          <span>Uji Siaran WhatsApp</span>
        </button>
      </div>

      {/* Grid: Senarai Kempen vs Pratonton Mesej */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Kolum Kiri (5 Cols): Senarai Kempen */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-sm lg:col-span-5 space-y-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider block px-1">
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
                      : "bg-slate-950/60 border-slate-800 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-brand-400">{camp.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      AKTIF
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{camp.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{camp.tagline}</p>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400">Sasaran: {camp.estimatedReach} Pelanggan</span>
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
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm lg:col-span-7 space-y-5">
            <div className="pb-4 border-b border-slate-800">
              <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                Pratonton Kempen
              </span>
              <h2 className="text-lg font-black text-white mt-1">{selectedCampaign.title}</h2>
              <p className="text-xs text-slate-400">{selectedCampaign.targetAudience}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Teks Siaran WhatsApp Broadcast:
              </label>
              <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 border border-slate-800 whitespace-pre-wrap leading-relaxed">
                {selectedCampaign.messageContent}
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-400 font-medium">
                Kadar Buka Mesej Anggaran: <b className="text-white">88% (WhatsApp Direct)</b>
              </span>

              <button
                onClick={handleTestBroadcast}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-950"
              >
                <Send className="w-4 h-4" />
                <span>Lancarkan Siaran Mesej Pukal</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

