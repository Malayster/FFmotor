import React from "react";
import { Menu, Calendar, ShoppingCart, ClipboardList, Search } from "lucide-react";
import { AuthenticatedUser } from "../StaffStationModal";

interface HeaderBarProps {
  onToggleSidebar: () => void;
  setActiveTab: (tab: string) => void;
  onQuickTrack?: () => void;
  onQuickPassport?: () => void;
  currentUser?: AuthenticatedUser;
  onOpenStationModal?: () => void;
  onOpenZeroTrustModal?: () => void;
  onToggleCollapse?: () => void;
  isSidebarCollapsed?: boolean;
  onOpenCommandPalette?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onToggleSidebar,
  setActiveTab,
  currentUser,
  onOpenStationModal,
  onOpenZeroTrustModal,
  onToggleCollapse,
  isSidebarCollapsed,
  onOpenCommandPalette,
}) => {
  const todayStr = new Date().toLocaleDateString("ms-MY", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-3 min-w-0">
      <div className="flex items-center space-x-3">
        {/* Toggle Button for Mobile */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-300 lg:hidden transition cursor-pointer"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>

        {/* Toggle Button for Desktop (Kecil/Besar Sidebar) */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-300 transition cursor-pointer shadow-2xs active:scale-95"
            title={isSidebarCollapsed ? "Besarkan Sidebar (Expand)" : "Kecilkan Sidebar (Mini)"}
            aria-label="Toggle Saiz Sidebar"
          >
            <Menu className="w-4 h-4 text-slate-600" />
          </button>
        )}

        {/* Maklumat Cawangan Motorsport */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-slate-900 tracking-tight font-sans">
              FF <span className="text-red-600">MOTORSPORT</span>
            </span>
            <span className="hidden sm:inline text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              3S Mergong
            </span>
          </div>
          <span className="text-[10px] text-zinc-600 font-bold hidden sm:block">
            Pusat Servis & Showroom Rasmi
          </span>
        </div>
      </div>

      {/* Tengah: Butang Command Palette & Tarikh Semasa */}
      <div className="hidden md:flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => {
            if (onOpenCommandPalette) {
              onOpenCommandPalette();
            } else {
              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
            }
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/80 text-xs text-slate-600 hover:text-slate-900 transition cursor-pointer active:scale-95 shadow-2xs"
          title="Buka Command Palette (Ctrl + K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-medium text-slate-600">Cari Operasi...</span>
          <kbd className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500 font-semibold shadow-2xs">
            Ctrl K
          </kbd>
        </button>

        <div className="flex items-center gap-2 text-xs font-sans text-slate-600 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-red-600" />
          <span className="font-semibold">{todayStr}</span>
        </div>
      </div>

      {/* Kanan: Profil Stesen & Butang Tindakan Pantas */}
      <div className="flex items-center gap-2 shrink-0 min-w-0">
        {currentUser && (onOpenStationModal || onOpenZeroTrustModal) && (
          <button
            type="button"
            onClick={onOpenStationModal || onOpenZeroTrustModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-950 text-xs transition cursor-pointer shadow-xs"
            title="Stesen Bertugas: Klik untuk tukar petugas / PIN"
          >
            <div className="w-6 h-6 rounded-lg bg-zinc-950 text-white flex items-center justify-center text-[10px] font-black uppercase">
              {(currentUser?.name || "FP").slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-black text-zinc-950 text-xs leading-none">
                {(currentUser?.name || "Staf").split(" ")[0]}
              </span>
              <span className="text-[9px] uppercase font-bold text-zinc-700 leading-tight mt-0.5">
                {currentUser?.role || "Staf"}
              </span>
            </div>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab("express-intake")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition active:scale-95 cursor-pointer uppercase"
          title="Daftar motosikal masuk"
        >
          <ClipboardList className="w-4 h-4" />
          <span className="hidden md:inline">Daftar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pos-checkout")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black bg-black hover:bg-zinc-800 text-white rounded-xl shadow-xs transition active:scale-95 cursor-pointer uppercase"
          title="Kaunter POS"
        >
          <ShoppingCart className="w-4 h-4 text-white" />
          <span className="hidden md:inline">POS</span>
        </button>

        <button
          type="button"
          className="px-2.5 py-1.5 text-xs font-black text-black hover:text-red-600 transition cursor-pointer"
          onClick={() => {
            localStorage.removeItem("ffmotor_staff_session");
            localStorage.removeItem("ffmotor_current_user");
            window.location.href = "/sistem";
          }}
        >
          Keluar
        </button>
      </div>
    </header>
  );
};
