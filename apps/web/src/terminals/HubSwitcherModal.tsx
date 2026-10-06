import React from "react";
import {
  Monitor,
  Smartphone,
  Bike,
  Crown,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShoppingCart,
  Share2
} from "lucide-react";

interface HubSwitcherModalProps {
  currentPath: string;
  onSelectStation: (path: string) => void;
  onClose?: () => void;
}

export const HubSwitcherModal: React.FC<HubSwitcherModalProps> = ({
  currentPath,
  onSelectStation,
  onClose,
}) => {
  const stations = [
    {
      id: "sa",
      path: "/sa",
      title: "1. Stesen SA / Kerani (/sa)",
      device: "Monitor & Keyboard PC Desktop Kaunter",
      actor: "Service Advisor (Siti Sarah) & Kasir",
      desc: "Daftar tempahan masuk (bookings), fail pelanggan, sebut harga (quotation), POS jualan sparepart & lejar kewangan (finance).",
      icon: Monitor,
      color: "bg-red-50 text-red-600 border-red-200",
      badgeColor: "bg-red-600 text-white font-black",
      badge: "/sa (Kerani)",
    },
    {
      id: "m",
      path: "/m",
      title: "2. Stesen Mekanik Lif (/m)",
      device: "Telefon Pintar / Tablet Mekanik di Lantai Lif",
      actor: "Ketua Foreman (Sifu Halim & Danial)",
      desc: "Paparan khas mudah alih 4-Bay lif pit: Mula baiki, 1-tap mohon VO alat ganti rosak, dan butang 'Siap & Turun Lif'.",
      icon: Smartphone,
      color: "bg-brand-500/20 text-brand-400 border-brand-500/30",
      badgeColor: "bg-brand-500 font-bold",
      badge: "/m (Mekanik)",
    },
    {
      id: "saya",
      path: "/saya",
      title: "3. Portal Digital Pelanggan (/saya)",
      device: "Telefon Pintar Peribadi Pelanggan Sendiri",
      actor: "Pelanggan Awam (Menerusi Pautan WhatsApp)",
      desc: "Semak status lif motosikal langsung, tandatangan sebut harga digital (e-sign /l/), luluskan VO, dan semak pasport servis.",
      icon: Bike,
      color: "bg-emerald-50 text-emerald-400 border-emerald-200",
      badgeColor: "bg-zinc-950 text-white font-black",
      badge: "/saya (Pelanggan)",
    },
    {
      id: "admin",
      path: "/admin",
      title: "4. Kokpit Tadbir Urus Tauke (/admin)",
      device: "Laptop / Telefon Pengarah & Pemilik",
      actor: "Pengarah Cawangan (Tauke Farhan)",
      desc: "Pusat tadbir urus autonomi: Semakan task staf (siap vs tertunggak), analitik untung bersih, audit stok pembekal & komisen.",
      icon: Crown,
      color: "bg-zinc-100 text-zinc-700 border-zinc-300",
      badgeColor: "bg-zinc-950 text-white font-bold",
      badge: "/admin (Tauke)",
    },
    {
      id: "katalog",
      path: "/katalog",
      title: "5. Showroom & Katalog Awam (/katalog)",
      device: "Pelayar Web / Telefon Pelanggan & Pembeli Online",
      actor: "Pembeli Motosikal & Spare Part Seluruh Malaysia",
      desc: "Katalog visual motosikal & alat ganti (carian dialek 'matgat', 'mangkuk klac'), kalkulator pinjaman, tempahan deposit DuitNow.",
      icon: ShoppingCart,
      color: "bg-zinc-100 text-zinc-700 border-zinc-300",
      badgeColor: "bg-zinc-950 text-white font-black",
      badge: "/katalog (Kedai Online)",
    },
    {
      id: "ejen",
      path: "/ejen",
      title: "6. Portal Ejen & Affiliate (/ejen)",
      device: "Telefon Pintar Rider, Influencer & Komisen Ejen",
      actor: "Rakan Niaga & Affiliate Komisen",
      desc: "Jana komisen berkongsi kad visual motor atau alat ganti ke WhatsApp, Facebook & TikTok dengan kod rujukan unik.",
      icon: Share2,
      color: "bg-red-50 text-red-700 border-red-200",
      badgeColor: "bg-red-600 text-white font-bold",
      badge: "/ejen (Affiliate)",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-zinc-50 border border-zinc-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-none space-y-6">
        {/* Header Modal */}
        <div className="flex items-start justify-between border-b border-zinc-200 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-mono font-black px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                PENGASINGAN STESEN PERANTI
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                ● 6 Stesen Bersepadu
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black ">
              Pilih Stesen Terminal Mengikut Peranti Anda
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Setiap peranti hanya memaparkan fungsi khusus tugas masing-masing tanpa campur aduk.
            </p>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-500 hover:text-red-600 p-2 rounded-xl border border-zinc-200 hover:bg-zinc-100"
            >
              ✕
            </button>
          )}
        </div>

        {/* Senarai 4 Stesen Bebas */}
        <div className="space-y-3">
          {stations.map((st) => {
            const Icon = st.icon;
            const isActive = currentPath === st.path;

            return (
              <button
                key={st.id}
                type="button"
                onClick={() => onSelectStation(st.path)}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition flex items-start gap-4 group ${
                  isActive
                    ? "bg-brand-950/40 border-brand-500/60 shadow-lg shadow-brand-500/10"
                    : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 hover:border-zinc-200"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shrink-0 border ${st.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black group-hover:text-brand-300 transition">
                        {st.title}
                      </h3>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${st.badgeColor}`}>
                        {st.badge}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500 group-hover:text-zinc-500 hidden sm:inline">
                      {st.path}
                    </span>
                  </div>

                  <p className="text-[11px] text-red-600 font-medium mt-0.5">
                    {st.device} • {st.actor}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{st.desc}</p>
                </div>

                <div className="self-center shrink-0 text-slate-600 group-hover:text-brand-400 transition pl-2">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5 border-t border-zinc-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Pengasingan data dan peranan terjamin secara penuh pada tahap Cloudflare D1.</span>
        </div>
      </div>
    </div>
  );
};

