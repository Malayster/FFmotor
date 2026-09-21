import React from "react";
import {
  LayoutDashboard,
  Wrench,
  AlertOctagon,
  Package,
  ShieldCheck,
  Bike,
  Lock,
  FileText,
  Users,
  DollarSign,
  UserCheck,
  MessageSquare,
  Megaphone,
  QrCode,
  Video,
  UserCircle,
  Sparkles,
  ChevronRight,
  Menu,
  X
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onOpenTrack?: () => void;
  onOpenPassport?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  onOpenTrack,
  onOpenPassport,
}) => {
  const sections = [
    {
      title: "Operasi Bengkel",
      items: [
        { id: "dashboard", label: "Pusat Kawalan (HQ)", icon: LayoutDashboard },
        { id: "work-orders", label: "Papan Kerja (Kanban)", icon: Wrench, badge: "Live" },
        { id: "warranty-issues", label: "Isu & Waranti Comeback", icon: AlertOctagon },
      ],
    },
    {
      title: "Gudang & Stok",
      items: [
        { id: "inventory", label: "Stok Rak & POS", icon: Package },
        { id: "authenticity", label: "Semak Kod Siri Ori", icon: ShieldCheck },
      ],
    },
    {
      title: "Showroom & Jualan",
      items: [
        { id: "motor-sales", label: "Katalog Motor Showroom", icon: Bike },
        { id: "bike-locks", label: "Kunci Unit (Locks)", icon: Lock },
        { id: "quotations", label: "Sebut Harga (Quotation)", icon: FileText },
        { id: "leads", label: "Pipeline & Ramalan", icon: Users, badge: "AI" },
      ],
    },
    {
      title: "Kewangan & Lejar",
      items: [
        { id: "finance", label: "Lejar Kewangan & Tutup Kaunter", icon: DollarSign },
      ],
    },
    {
      title: "Pelanggan & Mesej",
      items: [
        { id: "customers", label: "Dossier Pelanggan 360", icon: UserCheck },
        { id: "inbox", label: "WhatsApp Inbox & Chat", icon: MessageSquare, badge: "New" },
        { id: "campaigns", label: "Kempen & Promosi", icon: Megaphone },
      ],
    },
    {
      title: "Portal Pelanggan Awam",
      items: [
        { id: "passport", label: "Pasport Kesihatan Motor", icon: QrCode },
        { id: "track", label: "Live Video Tracking", icon: Video },
        { id: "customer-portal", label: "Portal Pemilik (/saya)", icon: UserCircle },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand & Branch Info */}
        <div>
          <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center shadow-md shadow-brand-500/20">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-white">
                    FF<span className="text-brand-500">motor</span>
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                    Edge
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Sistem Operasi 3S Bengkel</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links Scrollable */}
          <div className="py-4 px-3 space-y-6 overflow-y-auto max-h-[calc(100vh-135px)]">
            {sections.map((section) => (
              <div key={section.title} className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300 px-3 block">
                  {section.title}
                </span>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-brand-500 text-white shadow-md shadow-brand-500/20 font-bold"
                            : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-brand-500/10 text-brand-400 border border-brand-500/20"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User / Branch Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-3 px-2 py-1.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-brand-400">
              HQ
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">Tauke Farhan (SA)</p>
              <p className="text-[10px] text-emerald-400 font-mono truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                D1 & R2 Terhubung
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

