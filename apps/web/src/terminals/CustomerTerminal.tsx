import React, { useState, useEffect } from "react";
import { UserCircle, Bike, QrCode, FileText, ExternalLink, LogOut, ShieldCheck, Phone } from "lucide-react";
import { CustomerPortal } from "../pages/CustomerPortal";
import { TrackLive } from "../pages/TrackLive";
import { Passport } from "../pages/Passport";
import { PublicQuoteView } from "../pages/PublicQuoteView";
import { PublicVoView } from "../pages/PublicVoView";
import { Vehicle, WorkOrder } from "../types";

interface CustomerTerminalProps {
  vehicles: Vehicle[];
  workOrders: WorkOrder[];
  standaloneType?: "track" | "passport" | "quote" | "vo" | null;
  standaloneParam?: string;
  onSwitchTerminal: () => void;
}

export const CustomerTerminal: React.FC<CustomerTerminalProps> = ({
  vehicles,
  workOrders,
  standaloneType,
  standaloneParam,
  onSwitchTerminal,
}) => {
  const [subView, setSubView] = useState<{
    type: "portal" | "track" | "passport" | "quote" | "vo";
    param: string;
  }>({
    type: standaloneType || "portal",
    param: standaloneParam || "",
  });

  useEffect(() => {
    if (standaloneType) {
      setSubView({ type: standaloneType, param: standaloneParam || "" });
    }
  }, [standaloneType, standaloneParam]);

  // Sub-view awam terus dari WhatsApp
  if (subView.type === "track") {
    return (
      <TrackLive
        token={subView.param || "tok_yamaha_nvx_01"}
        onBack={() => setSubView({ type: "portal", param: "" })}
      />
    );
  }

  if (subView.type === "passport") {
    return (
      <Passport
        plate={subView.param || "VDF 8899"}
        onBack={() => setSubView({ type: "portal", param: "" })}
      />
    );
  }

  if (subView.type === "quote") {
    return (
      <PublicQuoteView
        quoteId={subView.param || "q-1"}
        onBackToApp={() => setSubView({ type: "portal", param: "" })}
      />
    );
  }

  if (subView.type === "vo") {
    return (
      <PublicVoView
        token={subView.param || "vo_tok_akmal_cvt"}
        onBackToApp={() => setSubView({ type: "portal", param: "" })}
      />
    );
  }

  // Pintu Utama Pelanggan (/saya)
  return (
    <div className="min-h-screen bg-white text-zinc-800 flex flex-col">
      {/* Header Bersih Pelanggan - TIADA SIDEBAR & TIADA AKSES SISTEM DALAMAN */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-200 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-none">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-600/20 border border-brand-500/40 text-brand-400 flex items-center justify-center font-black">
            <Bike className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
              PORTAL PEMILIK MOTOR (/saya)
            </span>
            <h1 className="text-sm sm:text-base font-black ">FFmotor Digital Customer Hub</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://wa.me/60192233445"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-emerald-400 hover:text-emerald-700 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 transition"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp Bengkel</span>
          </a>

          <button
            type="button"
            onClick={onSwitchTerminal}
            className="text-[11px] text-zinc-500 hover:text-red-600 px-2.5 py-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-100"
          >
            Tukar Stesen
          </button>
        </div>
      </header>

      {/* Kandungan Portal Pelanggan */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 pb-12">
        <CustomerPortal
          vehicles={vehicles}
          workOrders={workOrders}
          onOpenPassport={(plate) => setSubView({ type: "passport", param: plate })}
          onOpenTrack={(token) => setSubView({ type: "track", param: token })}
          onOpenQuote={(id) => setSubView({ type: "quote", param: id })}
        />
      </main>
    </div>
  );
};

