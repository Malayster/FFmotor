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
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">FF<span className="text-brand-500">motor</span></span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  Cloudflare Edge
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Workshop, Sales & Parts</p>
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
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-brand-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-brand-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Previews for 3 Genius Features */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onQuickTrack}
              title="Pratonton Video Jobcard Pelanggan"
              className="flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Live Video Job</span>
            </button>
            <button
              onClick={onQuickPassport}
              title="Pratonton Digital Motorcycle Passport"
              className="flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all"
            >
              <QrCode className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Digital Passport</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar (Horizontal Scroll) */}
      <div className="md:hidden flex overflow-x-auto px-4 py-2 space-x-2 border-t border-slate-900 bg-slate-950">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                isActive
                  ? "bg-brand-500 text-white"
                  : "bg-slate-900 text-slate-400 border border-slate-800"
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

