import React, { useState } from "react";
import {
  UserCheck,
  Search,
  Phone,
  Bike,
  ShieldCheck,
  Wrench,
  Clock,
  DollarSign,
  Send,
  ExternalLink,
  ChevronRight,
  FileText
} from "lucide-react";
import { WorkOrder, Vehicle } from "../types";
import { createWhatsAppLink } from "../lib/whatsapp";

interface CustomerDossierProps {
  workOrders: WorkOrder[];
  vehicles: Vehicle[];
  onOpenPassport: (plate: string) => void;
}

export const CustomerDossier: React.FC<CustomerDossierProps> = ({
  workOrders,
  vehicles,
  onOpenPassport,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Kumpulkan pelanggan unik dari vehicles & workOrders
  const customerMap = new Map<string, {
    name: string;
    phone: string;
    vehicles: Vehicle[];
    workOrders: WorkOrder[];
    totalSpent: number;
  }>();

  vehicles.forEach((v) => {
    const key = v.ownerPhone || v.ownerName;
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        name: v.ownerName,
        phone: v.ownerPhone,
        vehicles: [],
        workOrders: [],
        totalSpent: 0,
      });
    }
    customerMap.get(key)!.vehicles.push(v);
  });

  workOrders.forEach((wo) => {
    const key = wo.ownerPhone || wo.ownerName || "walk-in";
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        name: wo.ownerName || "Walk-in",
        phone: wo.ownerPhone || "-",
        vehicles: [],
        workOrders: [],
        totalSpent: 0,
      });
    }
    const record = customerMap.get(key)!;
    record.workOrders.push(wo);
    if (wo.paymentStatus === "paid") {
      record.totalSpent += wo.grandTotal || 0;
    }
  });

  const customersList = Array.from(customerMap.values());

  const filteredCustomers = customersList.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.vehicles.some((v) => v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const [selectedCustomer, setSelectedCustomer] = useState(customersList[0] || null);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold">
            <span>FFmotor HQ</span>
            <span>/</span>
            <span className="text-brand-400 font-bold">Dossier Pelanggan 360</span>
          </nav>
          <h1 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tight mt-1">
            Pusat Rekod & Dossier Pelanggan 360
          </h1>
          <p className="text-xs text-zinc-500">
            Audit pemilikan motosikal, sejarah perbelanjaan seumur hidup (*LTV*), dan arkib rekod servis.
          </p>
        </div>

        {/* Carian Pantas */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Cari nama, no tel, atau plat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-700 placeholder-zinc-400 focus:outline-hidden focus:border-brand-500 font-medium"
          />
        </div>
      </div>

      {/* Grid Susun Atur: Senarai Pelanggan vs Fail Terperinci */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Kolum Kiri (4 Cols): Senarai Pelanggan */}
        <div className="rounded-2xl border border-zinc-200 bg-white/90 p-4 shadow-sm lg:col-span-4 space-y-2 max-h-[750px] overflow-y-auto">
          <span className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider px-2 block">
            {filteredCustomers.length} Pelanggan Ditemui
          </span>

          {filteredCustomers.map((cust) => {
            const isSelected = selectedCustomer?.phone === cust.phone && selectedCustomer?.name === cust.name;
            return (
              <div
                key={cust.phone + cust.name}
                onClick={() => setSelectedCustomer(cust)}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? "bg-brand-500/15 border-brand-500/40 shadow-xs"
                    : "bg-zinc-50/40 border-zinc-200 hover:bg-zinc-100/50"
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">{cust.name}</h4>
                  <p className="text-[11px] text-zinc-500 font-mono mt-0.5">{cust.phone}</p>
                  <span className="text-[10px] text-brand-400 font-medium">
                    {cust.vehicles.length} Motor berdaftar • RM {cust.totalSpent.toFixed(0)} LTV
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 ${isSelected ? "text-brand-400" : "text-slate-600"}`} />
              </div>
            );
          })}
        </div>

        {/* Kolum Kanan (8 Cols): Profil Dossier Terperinci */}
        {selectedCustomer ? (
          <div className="rounded-2xl border border-zinc-200 bg-white/90 p-6 shadow-sm lg:col-span-8 space-y-6">
            {/* Header Fail Pelanggan */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-zinc-200">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center font-black text-lg text-brand-400">
                  {selectedCustomer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-black text-zinc-900">{selectedCustomer.name}</h2>
                  <p className="text-xs text-zinc-500 font-mono flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{selectedCustomer.phone}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedCustomer.phone && selectedCustomer.phone !== "-" && (
                  <button
                    onClick={() => {
                      const link = createWhatsAppLink(selectedCustomer.phone, `Salam Bro ${selectedCustomer.name}, kami dari FFmotor...`);
                      window.open(link, "_blank");
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                )}
              </div>
            </div>

            {/* Statistik Pelanggan */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                <span className="text-[10px] font-extrabold uppercase text-zinc-500">Jumlah Belanja (*LTV*)</span>
                <p className="text-lg font-mono font-black text-emerald-400 mt-1">
                  RM {selectedCustomer.totalSpent.toFixed(2)}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                <span className="text-[10px] font-extrabold uppercase text-zinc-500">Motosikal Dimiliki</span>
                <p className="text-lg font-mono font-black text-zinc-700 mt-1">
                  {selectedCustomer.vehicles.length} Biji
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                <span className="text-[10px] font-extrabold uppercase text-zinc-500">Kekerapan Servis</span>
                <p className="text-lg font-mono font-black text-zinc-700 mt-1">
                  {selectedCustomer.workOrders.length} Kali Masuk
                </p>
              </div>
            </div>

            {/* Seksyen 1: Motosikal Dimiliki */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <Bike className="w-4 h-4 text-brand-400" />
                <span>Motosikal Berdaftar Pemilik</span>
              </h3>

              {selectedCustomer.vehicles.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">Tiada motor berdaftar di bawah profil ini.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {selectedCustomer.vehicles.map((veh) => (
                    <div
                      key={veh.id}
                      className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono text-base font-black text-zinc-900 block">
                          {veh.plateNumber}
                        </span>
                        <span className="text-xs text-zinc-500 font-medium">
                          {veh.brand} {veh.model} ({veh.year || "Tahun Tiada"})
                        </span>
                        <div className="mt-1 flex items-center gap-2 text-[11px] font-mono text-zinc-500">
                          <span>Odo: {veh.currentMileage?.toLocaleString()} km</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold">Skor: {veh.healthScore}/100</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenPassport(veh.plateNumber)}
                        className="p-2 rounded-xl bg-white hover:bg-zinc-100 text-brand-400 hover:text-red-600 transition"
                        title="Buka Pasport Kesihatan Motor"
                      >
                        <ShieldCheck className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Seksyen 2: Sejarah Kad Kerja & Servis */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-zinc-700" />
                <span>Sejarah Transaksi & Servis Bengkel</span>
              </h3>

              <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 divide-y divide-zinc-200/80 overflow-hidden text-xs">
                {selectedCustomer.workOrders.map((wo) => (
                  <div key={wo.id} className="p-3.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-brand-400">{wo.woNumber}</span>
                        <span className="font-mono font-bold">{wo.plateNumber}</span>
                        <span className="text-zinc-500 text-[11px]">
                          • {new Date(wo.createdAt).toLocaleDateString("ms-MY")}
                        </span>
                      </div>
                      <p className="text-zinc-600 text-[11px] mt-0.5">{wo.customerComplaint}</p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold block">
                        RM {(wo.grandTotal || 0).toFixed(2)}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          wo.paymentStatus === "paid" ? "text-emerald-400" : "text-red-600"
                        }`}
                      >
                        {wo.paymentStatus === "paid" ? "Lunas" : "Belum Bayar"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-white/40 p-12 text-center text-zinc-500 text-xs lg:col-span-8">
            Pilih pelanggan di sebelah kiri untuk melihat fail dossier 360.
          </div>
        )}
      </div>
    </div>
  );
};

