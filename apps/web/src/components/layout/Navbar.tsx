import React from "react";
import { Wrench, Package, ShieldCheck, Bike, Users, LayoutDashboard, QrCode, Sparkles } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onQuickTrack?: () => void;
  onQuickPassport?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onQuickTrack,
  onQuickPassport,
}) => {
  const navItems = [
    { id: "dashboard", label: "Papan Pemuka", icon: LayoutDashboard },
    { id: "work-orders", label: "Bengkel & Job Card", icon: Wrench, badge: "Live" },
    { id: "inventory", label: "Stok & Rak", icon: Package },
    { id: "authenticity", label: "Semak Keaslian", icon: ShieldCheck },
    { id: "motor-sales", label: "Jual Motor", icon: Bike },
    { id: "leads", label: "Leads & Ramalan", icon: Users, badge: "AI" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-zinc-50/90 backdrop-blur-md border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-black">FF<span className="text-red-600">motor</span></span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">
                  Cloudflare Edge
                </span>
              </div>
              <p className="text-xs text-zinc-600 font-bold">Workshop, Sales & Parts</p>
            </div>
          </div>

          {/* Nav items for desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-brand-500/15 text-brand-400 border border-brand-500/30 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-700 hover:bg-white"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-brand-400" : "text-zinc-500"}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-brand-500 ">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Butang Pintas — Jejak Servis Pelanggan (Gantikan "Live Video Job") */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onQuickTrack}
              title="Jejak Status Servis Pelanggan"
              className="flex items-center space-x-1.5 text-xs font-black px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 border-2 border-emerald-300 hover:bg-emerald-50 transition-all cursor-pointer active:scale-95"
            >
              <Wrench className="w-3.5 h-3.5 text-emerald-800" />
              <span className="hidden sm:inline">Jejak Servis</span>
            </button>
            <button
              onClick={onQuickPassport}
              title="Pasport Digital Motosikal"
              className="flex items-center space-x-1.5 text-xs font-black px-2.5 py-1.5 rounded-lg bg-zinc-100 text-zinc-950 border-2 border-zinc-300 hover:bg-zinc-50 transition-all cursor-pointer active:scale-95"
            >
              <QrCode className="w-3.5 h-3.5 text-zinc-950" />
              <span className="hidden sm:inline">Pasport Motor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar (Horizontal Scroll) */}
      <div className="md:hidden flex overflow-x-auto px-4 py-2 space-x-2 border-t border-slate-900 bg-zinc-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                isActive
                  ? "bg-brand-500 "
                  : "bg-white text-zinc-500 border border-zinc-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};

