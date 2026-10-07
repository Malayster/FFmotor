import React, { useState } from "react";
import {
  LayoutDashboard,
  Wrench,
  Zap,
  ShoppingCart,
  UserCheck,
  FileText,
  Package,
  ClipboardList,
  Bike,
  Flame,
  AlertOctagon,
  ShieldCheck,
  Truck,
  Calculator,
  DollarSign,
  Award,
  MessageSquare,
  Megaphone,
  Settings,
  Lock,
  Users,
  UserCircle,
  Key,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Camera
} from "lucide-react";
import { AuthenticatedUser } from "../StaffStationModal";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: () => void;
  onOpenTrack?: () => void;
  onOpenPassport?: () => void;
  currentUser?: AuthenticatedUser;
  onOpenStationModal?: () => void;
  onOpenZeroTrustModal?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  isCollapsed = false,
  setIsCollapsed,
  currentUser,
  onOpenStationModal,
  onOpenZeroTrustModal,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewAllModules, setViewAllModules] = useState(false);

  const handleOpenStation = onOpenStationModal || onOpenZeroTrustModal;

  // Stesen 1: Pemilik Bengkel (Owner HQ)
  const ownerSections: NavSection[] = [
    {
      title: "Kawalan HQ & Prestasi",
      items: [
        { id: "dashboard", label: "Papan Kedai", icon: LayoutDashboard, badge: "HQ" },
        { id: "finance", label: "Untung & Lejar P&L", icon: DollarSign, badge: "P&L" },
        { id: "staff", label: "Prestasi Staf & Komisen", icon: Award, badge: "Staf" },
        { id: "settings", label: "Tetapan Bank & HQ", icon: Settings, badge: "Kunci" },
        { id: "owner-accounts", label: "Akaun Staf & PIN", icon: UserCircle, badge: "Akaun" },
        { id: "owner-price", label: "Harga Motor & Barang", icon: Bike, badge: "Harga" },
        { id: "owner-arahan", label: "Arahan Terbuka", icon: MessageSquare, badge: "Arahan" },
      ],
    },
    {
      title: "Pemantauan Lantai Bengkel",
      items: [
        { id: "pit-live", label: "Lantai Pit 4-Bay Live", icon: Flame, badge: "4-Bay" },
        { id: "work-orders", label: "Kad Kerja Servis", icon: Wrench, badge: "Servis" },
        { id: "photo-servis", label: "Gambar Servis Masuk", icon: Camera, badge: "Foto" },
        { id: "warranty-issues", label: "Tuntutan Waranti Kilang", icon: AlertOctagon, badge: "Klaim" },
      ],
    },
    {
      title: "Semakan Kaunter & Stor",
      items: [
        { id: "express-intake", label: "Daftar Motor Masuk", icon: Zap, badge: "Masuk" },
        { id: "pos-checkout", label: "Kasir POS", icon: ShoppingCart, badge: "POS" },
        { id: "inventory", label: "Rak Alat Ganti", icon: Package, badge: "Stok" },
        { id: "suppliers", label: "Pesanan Pembekal (PO)", icon: ClipboardList, badge: "PO" },
        { id: "motor-sales", label: "Showroom Motosikal", icon: Bike, badge: "Unit" },
        { id: "loan-pipeline", label: "Saluran Pinjaman", icon: Calculator, badge: "Loan" },
        { id: "ecommerce-orders", label: "Pesanan Web & Kurier", icon: Truck, badge: "Web" },
      ],
    },
    {
      title: "Pintu 30-40, laman yang sama",
      items: [
        { id: "katalog", label: "30 Katalog awam", icon: Bike, badge: "Awam" },
        { id: "customer-portal", label: "31 Portal pelanggan", icon: UserCheck, badge: "Awam" },
        { id: "quote-view", label: "32 Sebut harga awam", icon: FileText, badge: "Awam" },
        { id: "vo-view", label: "33 Kelulusan alat ganti", icon: Wrench, badge: "Awam" },
        { id: "owner-desk", label: "34 Meja pemilik", icon: LayoutDashboard, badge: "HQ" },
        { id: "photo-studio", label: "35 Studio gambar", icon: Camera, badge: "Foto" },
        { id: "staff-performance", label: "36 Prestasi staf", icon: Award, badge: "Staf" },
        { id: "crm", label: "37 CRM", icon: UserCheck, badge: "CRM" },
        { id: "warranty", label: "38 Waranti", icon: AlertOctagon, badge: "Klaim" },
        { id: "track", label: "39 Jejak awam", icon: Wrench, badge: "Jejak" },
        { id: "passport", label: "40 Pasport awam", icon: FileText, badge: "Buku" },
      ],
    },
  ];

  // Stesen 2: Kerani 1 Kaunter (Front Desk)
  const kerani1Sections: NavSection[] = [
    {
      title: "Kaunter Hadapan & POS",
      items: [
        { id: "dashboard", label: "Meja Kaunter", icon: LayoutDashboard, badge: "Kaunter" },
        { id: "express-intake", label: "Daftar Masuk Kilat (30s)", icon: Zap, badge: "Masuk" },
        { id: "pit-live", label: "Lantai Pit 4-Bay Live", icon: Flame, badge: "Pit" },
        { id: "work-orders", label: "Kad Kerja Servis", icon: Wrench, badge: "Servis" },
        { id: "pos-checkout", label: "Kasir POS & Bayaran", icon: ShoppingCart, badge: "Bayar" },
        { id: "quotations", label: "Sebut Harga Rasmi", icon: FileText, badge: "Harga" },
        { id: "loan-pipeline", label: "Permohonan Pinjaman (Loan)", icon: Calculator, badge: "Loan" },
      ],
    },
    {
      title: "Khidmat Pelanggan & CRM",
      items: [
        { id: "customers", label: "Pangkalan Pelanggan", icon: UserCheck, badge: "CRM" },
        { id: "inbox", label: "Peti Mesej Pelanggan", icon: MessageSquare, badge: "Chat" },
        { id: "leads", label: "Pertanyaan Prospek Baharu", icon: Users, badge: "Leads" },
      ],
    },
  ];

  // Stesen 3: Kerani 2 Stor (Inventori & Logistik)
  const kerani2Sections: NavSection[] = [
    {
      title: "Pengurusan Stor & Alat Ganti",
      items: [
        { id: "dashboard", label: "Meja Stor", icon: LayoutDashboard, badge: "Stor" },
        { id: "inventory", label: "Rak Alat Ganti & Baki", icon: Package, badge: "Rak" },
        { id: "suppliers", label: "Pesanan Pembekal (PO)", icon: ClipboardList, badge: "PO" },
        { id: "ecommerce-orders", label: "Pesanan Kurier & Cetak AWB", icon: Truck, badge: "AWB" },
        { id: "authenticity", label: "Kod Siri Ketulenan", icon: ShieldCheck, badge: "Siri" },
        { id: "work-orders", label: "Kad Kerja Servis", icon: Wrench, badge: "Servis" },
      ],
    },
  ];

  // Stesen 4: Ketua Foreman (Lantai Bengkel)
  const foremanSections: NavSection[] = [
    {
      title: "Lantai Bengkel 4-Bay Lif",
      items: [
        { id: "dashboard", label: "Meja Foreman", icon: LayoutDashboard, badge: "Pit" },
        { id: "foreman-job", label: "Kerja di Lantai", icon: Wrench, badge: "Lantai" },
        { id: "pit-live", label: "Lantai Pit Lif (4-Bay Live)", icon: Flame, badge: "Live" },
        { id: "work-orders", label: "Kad Kerja Servis", icon: Wrench, badge: "Kerja" },
        { id: "photo-servis", label: "Gambar Servis Masuk", icon: Camera, badge: "Foto" },
      ],
    },
  ];

  // Stesen 5: Showroom & Ejen
  const affiliateSections: NavSection[] = [
    {
      title: "Showroom & Jualan Motor",
      items: [
        { id: "dashboard", label: "Papan Showroom", icon: LayoutDashboard, badge: "Sales" },
        { id: "affiliate", label: "Program Komisen Ejen", icon: Award, badge: "Ejen" },
      ],
    },
  ];

  // Paparan Penuh: Semua 22 Modul Bengkel
  const allModulesSections: NavSection[] = [
    {
      title: "Kawalan HQ & Pengurusan",
      items: [
        { id: "dashboard", label: "Papan Kedai", icon: LayoutDashboard, badge: "Owner" },
        { id: "finance", label: "Untung & Lejar P&L", icon: DollarSign, badge: "P&L" },
        { id: "staff", label: "Prestasi Staf & Komisen", icon: Award, badge: "Staf" },
        { id: "settings", label: "Tetapan Bank Syarikat", icon: Settings, badge: "Admin" },
        { id: "owner-accounts", label: "Akaun Staf & PIN", icon: UserCircle, badge: "Akaun" },
        { id: "owner-price", label: "Harga Motosikal & Alat Ganti", icon: Bike, badge: "Harga" },
        { id: "owner-arahan", label: "Arahan Terbuka", icon: MessageSquare, badge: "Arahan" },
      ],
    },
    {
      title: "Kaunter Hadapan & POS",
      items: [
        { id: "express-intake", label: "Daftar Masuk Kilat (30s)", icon: Zap, badge: "Masuk" },
        { id: "work-orders", label: "Kad Kerja Servis", icon: Wrench, badge: "Servis" },
        { id: "pos-checkout", label: "Kasir POS & Jualan Pantas", icon: ShoppingCart, badge: "POS" },
        { id: "customers", label: "Pangkalan Pelanggan CRM", icon: UserCheck, badge: "CRM" },
        { id: "quotations", label: "Sebut Harga Rasmi", icon: FileText, badge: "PDF" },
        { id: "photo-kedai", label: "Gambar Motor & Resit", icon: Camera, badge: "Foto" },
      ],
    },
    {
      title: "Lantai Pit Lif (4-Bay)",
      items: [
        { id: "foreman-job", label: "Kerja di Lantai", icon: Wrench, badge: "Lantai" },
        { id: "pit-live", label: "Lantai Pit Lif (4-Bay Live)", icon: Flame, badge: "Pit" },
        { id: "photo-servis", label: "Gambar Servis Masuk", icon: Camera, badge: "Foreman" },
        { id: "warranty-issues", label: "Tuntutan Waranti Kilang", icon: AlertOctagon, badge: "Klaim" },
        { id: "authenticity", label: "Semakan Kod Siri Ketulenan", icon: ShieldCheck, badge: "Siri" },
        { id: "passport", label: "Pasport Servis Motor", icon: FileText, badge: "Buku" },
        { id: "track", label: "Jejak Servis Pelanggan", icon: Wrench, badge: "Jejak" },
      ],
    },
    {
      title: "Stor Alat Ganti & Logistik",
      items: [
        { id: "inventory", label: "Inventori Alat Ganti & Rak", icon: Package, badge: "Stor" },
        { id: "suppliers", label: "Pesanan Pembekal (PO)", icon: ClipboardList, badge: "PO" },
        { id: "ecommerce-orders", label: "Pesanan Kurier & Cetak AWB", icon: Truck, badge: "Kurier" },
      ],
    },
    {
      title: "Showroom & Jualan",
      items: [
        { id: "motor-sales", label: "Showroom Motosikal", icon: Bike, badge: "Unit" },
        { id: "loan-pipeline", label: "Saluran Permohonan Loan", icon: Calculator, badge: "Kredit" },
        { id: "leads", label: "Pertanyaan Prospek Baharu", icon: Users, badge: "Leads" },
        { id: "bike-locks", label: "Pengurusan Kunci & Sewa Beli", icon: Lock, badge: "Kunci" },
        { id: "affiliate", label: "Program Komisen Ejen", icon: Award, badge: "Ejen" },
      ],
    },
    {
      title: "Komunikasi",
      items: [
        { id: "inbox", label: "Peti Masuk WhatsApp Bengkel", icon: MessageSquare, badge: "Chat" },
        { id: "campaigns", label: "Peringatan Servis Automatik", icon: Megaphone, badge: "Recall" },
      ],
    },
  ];

  // Tentukan senarai menu aktif berdasarkan peranan staf atau mod "Semua Modul"
  const userRole = (currentUser?.role || "owner").toLowerCase();

  const getStationSections = (): NavSection[] => {
    if (viewAllModules) return allModulesSections;
    if (userRole === "kerani_1") return kerani1Sections;
    if (userRole === "kerani_2") return kerani2Sections;
    if (userRole === "foreman") return foremanSections;
    if (userRole === "affiliate") return affiliateSections;
    return ownerSections;
  };

  const sections = getStationSections();

  // Penapis carian pantas
  const filteredSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.badge && item.badge.toLowerCase().includes(searchQuery.toLowerCase())) ||
          item.id.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((section) => section.items.length > 0);

  const formatRoleLabel = (role?: string) => {
    switch (role) {
      case "owner":
        return "Pemilik HQ";
      case "kerani_1":
        return "Kerani 1 Kaunter";
      case "kerani_2":
        return "Kerani 2 Stor";
      case "foreman":
        return "Ketua Foreman";
      case "affiliate":
        return "Showroom / Ejen";
      default:
        return "Staf Bengkel";
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 bg-zinc-950 border-r-2 border-zinc-900 text-white flex flex-col justify-between transition-all duration-300 ease-in-out shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "w-20" : "w-72"}`}
      >
        <div className="flex flex-col h-full min-h-0">
          {/* Header Bar Sidebar */}
          <div
            className={`h-14 border-b-2 border-zinc-900 flex items-center justify-between shrink-0 bg-zinc-950 px-4 ${
              isCollapsed ? "justify-center px-2" : ""
            }`}
          >
            {/* Logo Jenama */}
            {!isCollapsed ? (
              <a
                href="#dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("dashboard");
                  window.location.hash = "dashboard";
                }}
                className="flex items-center space-x-3 cursor-pointer select-none no-underline"
              >
                <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center font-black text-white shadow-sm">
                  <Wrench className="w-4 h-4 text-white" />
                </div>
                <div className="leading-none">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-black text-base tracking-tight text-white font-sans">
                      FP<span className="text-red-600">motor</span>
                    </span>
                    <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-red-600 text-white">
                      3S
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-bold mt-1">Simpang 3 Kemboja, Jerlun</p>
                </div>
              </a>
            ) : (
              <a
                href="#dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("dashboard");
                  window.location.hash = "dashboard";
                }}
                className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center font-black text-white hover:bg-red-700 transition cursor-pointer"
                title="FP Motor Dashboard"
              >
                <Wrench className="w-4 h-4 text-white" />
              </a>
            )}

            {/* Butang Toggle Kecil / Besar & Tutup Mobile */}
            <div className="flex items-center gap-1">
              {setIsCollapsed && (
                <button
                  type="button"
                  onClick={setIsCollapsed}
                  className={`hidden lg:flex items-center justify-center p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition-all cursor-pointer ${
                    isCollapsed ? "w-8 h-8" : ""
                  }`}
                  title={isCollapsed ? "Besarkan Sidebar" : "Kecilkan Sidebar"}
                  aria-label="Toggle Saiz Sidebar"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-white font-black" />
                  ) : (
                    <ChevronLeft className="w-4 h-4 text-white font-black" />
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 lg:hidden cursor-pointer"
                aria-label="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Kotak Carian & Suis Mod Stesen */}
          {!isCollapsed && (
            <div className="px-3 pt-3 pb-2 shrink-0 bg-zinc-950 space-y-2 border-b border-zinc-900">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari modul stesen..."
                  className="w-full bg-zinc-900 focus:bg-black text-xs text-white pl-8 pr-7 py-2 rounded-xl border border-zinc-800 focus:border-red-600 outline-none transition font-bold"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 text-zinc-400 hover:text-white text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Suis Paparan: Stesen Bertugas vs Semua Modul */}
              <div className="flex bg-zinc-900 p-0.5 rounded-xl text-[10px] font-black border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setViewAllModules(false)}
                  className={`flex-1 py-1 rounded-lg transition text-center cursor-pointer ${
                    !viewAllModules
                      ? "bg-red-600 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Stesen Saya
                </button>
                <button
                  type="button"
                  onClick={() => setViewAllModules(true)}
                  className={`flex-1 py-1 rounded-lg transition text-center cursor-pointer ${
                    viewAllModules
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Semua Modul
                </button>
              </div>
            </div>
          )}

          {/* Navigasi Senarai Ikon & Menu */}
          <div className="flex-1 py-3 px-2.5 space-y-4 overflow-y-auto min-h-0">
            {filteredSections.map((section) => (
              <div key={section.title} className="space-y-1">
                {/* Tajuk Seksyen */}
                {!isCollapsed && (
                  <div className="px-2.5 pt-2 pb-1 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-white select-none">
                      {section.title}
                    </span>
                  </div>
                )}

                {/* Senarai Navigasi Item */}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    if (isCollapsed) {
                      return (
                        <div key={item.id} className="relative group flex justify-center">
                          <a
                            href={`#${item.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              setActiveTab(item.id);
                              window.location.hash = item.id;
                              setIsOpen(false);
                            }}
                            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer select-none no-underline ${
                              isActive
                                ? "bg-red-600 text-white font-black"
                                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                            }`}
                            aria-label={item.label}
                          >
                            <Icon className="w-5 h-5" />
                            {isActive && (
                              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-400 border border-zinc-950" />
                            )}
                          </a>

                          {/* Tooltip Terapung */}
                          <div className="absolute left-[58px] top-1/2 -translate-y-1/2 ml-1 px-3 py-1.5 bg-zinc-950 text-white rounded-xl shadow-2xl text-xs font-black whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 border-2 border-zinc-800 flex items-center space-x-2">
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-600 text-white">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveTab(item.id);
                          window.location.hash = item.id;
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition select-none no-underline cursor-pointer ${
                          isActive
                            ? "bg-red-600 text-white font-black"
                            : "text-zinc-300 hover:text-white hover:bg-zinc-900"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-zinc-400"}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded shrink-0 uppercase ${
                              isActive
                                ? "bg-white text-zinc-950 font-black"
                                : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Profil Petugas Stesen Bawah Sidebar */}
          <div className="p-3 border-t-2 border-zinc-900 bg-zinc-950 shrink-0">
            {!isCollapsed ? (
              <div className="flex items-center justify-between px-2 py-1 gap-2">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xs uppercase shrink-0">
                    {(currentUser?.name || "FP").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-white truncate">
                      {currentUser?.name || "FP MOTOR"}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-bold truncate flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="truncate">
                        Stesen: {formatRoleLabel(currentUser?.role)}
                      </span>
                    </p>
                  </div>
                </div>

                {handleOpenStation && (
                  <button
                    type="button"
                    onClick={handleOpenStation}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 transition shrink-0 cursor-pointer"
                    title="Tukar Stesen Petugas / PIN"
                    aria-label="Tukar Petugas"
                  >
                    <Key className="w-3.5 h-3.5 text-white" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex justify-center relative group">
                <button
                  type="button"
                  onClick={handleOpenStation}
                  className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xs uppercase hover:bg-red-700 transition cursor-pointer"
                  title={currentUser?.name || "Petugas FP Motor"}
                  aria-label="Petugas Aktif"
                >
                  {(currentUser?.name || "FP").slice(0, 2).toUpperCase()}
                </button>
                <div className="absolute left-[54px] top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-zinc-900 text-white rounded-lg text-[10px] font-black whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition z-50 border border-zinc-800">
                  {currentUser?.name || "FP MOTOR"}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
