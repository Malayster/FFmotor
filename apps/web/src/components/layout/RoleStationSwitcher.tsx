import React from "react";
import {
  Crown,
  Briefcase,
  Wrench,
  CreditCard,
  Bike,
  UserCircle,
  ChevronDown
} from "lucide-react";

export type RoleStation = "sa" | "admin" | "foreman" | "pos" | "sales" | "customer";

interface RoleStationSwitcherProps {
  currentStation: RoleStation;
  onSelectStation: (station: RoleStation) => void;
}

export const RoleStationSwitcher: React.FC<RoleStationSwitcherProps> = ({
  currentStation,
  onSelectStation,
}) => {
  const stations: { id: RoleStation; label: string; roleName: string; icon: any; color: string; badge: string }[] = [
    {
      id: "sa",
      label: "Pengarah (SA)",
      roleName: "Tauke Farhan",
      icon: Crown,
      color: "bg-red-50 text-red-600 border-red-200",
      badge: "Kuasa Penuh",
    },
    {
      id: "admin",
      label: "Kerani HQ",
      roleName: "Siti Sarah",
      icon: Briefcase,
      color: "bg-zinc-100 text-zinc-700 border-zinc-300",
      badge: "Lejar & Fail",
    },
    {
      id: "foreman",
      label: "Foreman Bengkel",
      roleName: "Syafiq",
      icon: Wrench,
      color: "bg-brand-500/20 text-brand-300 border-brand-500/30",
      badge: "Pit & Lif",
    },
    {
      id: "pos",
      label: "Kasir Kaunter",
      roleName: "Aiman",
      icon: CreditCard,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      badge: "Laci & POS",
    },
    {
      id: "sales",
      label: "Jurujual Motor",
      roleName: "Hafiz",
      icon: Bike,
      color: "bg-zinc-100 text-zinc-700 border-zinc-300",
      badge: "Showroom",
    },
    {
      id: "customer",
      label: "Pemilik Motor",
      roleName: "Akmal (/saya)",
      icon: UserCircle,
      color: "bg-zinc-100 text-zinc-700 border-zinc-300",
      badge: "Layan Diri",
    },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-1 px-1 bg-zinc-50/80 rounded-2xl border border-zinc-200 scrollbar-none">
      <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 px-2 shrink-0 hidden sm:inline">
        Stesen Peranan:
      </span>

      {stations.map((st) => {
        const Icon = st.icon;
        const isSelected = currentStation === st.id;
        return (
          <button
            key={st.id}
            onClick={() => onSelectStation(st.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
 isSelected
 ? `${st.color} shadow-xs font-black border`
 : "text-zinc-600 hover:text-red-600 hover:bg-white border border-transparent"
 }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{st.label}</span>
          </button>
        );
      })}
    </div>
  );
};

