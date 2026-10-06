import React, { useEffect, useState } from "react";

type MenuSpec = {
  id: string;
  title: string;
  endpoint: string;
  pick: string;
};

const MENUS: MenuSpec[] = [
  { id: "dashboard", title: "Papan kedai", endpoint: "/api/owner/board", pick: "wang" },
  { id: "owner-desk", title: "Meja pemilik", endpoint: "/api/owner/board", pick: "wang" },
  { id: "finance", title: "Lejar", endpoint: "/api/finance/closing", pick: "closing" },
  { id: "staff", title: "Prestasi staf", endpoint: "/api/staff", pick: "staff" },
  { id: "staff-performance", title: "Prestasi staf", endpoint: "/api/staff/commissions", pick: "commissions" },
  { id: "settings", title: "Tetapan bank", endpoint: "/api/owner/board", pick: "wang" },
  { id: "owner-accounts", title: "Akaun staf", endpoint: "/api/owner/accounts", pick: "accounts" },
  { id: "owner-price", title: "Harga", endpoint: "/api/owner/motorcycles", pick: "motorcycles" },
  { id: "owner-arahan", title: "Arahan", endpoint: "/api/desk/arahan", pick: "arahan" },
  { id: "pit-live", title: "Pit", endpoint: "/api/public/bays", pick: "bays" },
  { id: "work-orders", title: "Kad kerja", endpoint: "/api/work-orders", pick: "workOrders" },
  { id: "express-intake", title: "Daftar masuk", endpoint: "/api/vehicles", pick: "vehicles" },
  { id: "pos-checkout", title: "POS", endpoint: "/api/products", pick: "products" },
  { id: "inventory", title: "Rak", endpoint: "/api/products", pick: "products" },
  { id: "suppliers", title: "Pembekal", endpoint: "/api/suppliers", pick: "suppliers" },
  { id: "motor-sales", title: "Showroom", endpoint: "/api/sales/motorcycles", pick: "motorcycles" },
  { id: "katalog", title: "Katalog awam", endpoint: "/api/public/catalog", pick: "motorcycles" },
  { id: "loan-pipeline", title: "Pinjaman", endpoint: "/api/loan-pipeline", pick: "applications" },
  { id: "ecommerce-orders", title: "Pesanan web", endpoint: "/api/public/catalog", pick: "products" },
  { id: "quotations", title: "Sebut harga", endpoint: "/api/quotations", pick: "quotations" },
  { id: "quote-view", title: "Sebut harga awam", endpoint: "/api/quotations", pick: "quotations" },
  { id: "customers", title: "Pelanggan", endpoint: "/api/vehicles", pick: "vehicles" },
  { id: "crm", title: "CRM", endpoint: "/api/vehicles", pick: "vehicles" },
  { id: "customer-portal", title: "Portal pelanggan", endpoint: "/api/vehicles", pick: "vehicles" },
  { id: "inbox", title: "Peti mesej", endpoint: "/api/inbox", pick: "messages" },
  { id: "campaigns", title: "Peringatan servis", endpoint: "/api/vehicles", pick: "vehicles" },
  { id: "leads", title: "Prospek", endpoint: "/api/leads", pick: "leads" },
  { id: "bike-locks", title: "Kunci unit", endpoint: "/api/locks", pick: "locks" },
  { id: "affiliate", title: "Ejen", endpoint: "/api/staff", pick: "staff" },
  { id: "authenticity", title: "Kod siri", endpoint: "/api/products", pick: "products" },
  { id: "warranty", title: "Waranti", endpoint: "/api/warranty-issues", pick: "issues" },
  { id: "warranty-issues", title: "Waranti", endpoint: "/api/warranty-issues", pick: "issues" },
  { id: "passport", title: "Pasport", endpoint: "/api/vehicles", pick: "vehicles" },
  { id: "track", title: "Jejak", endpoint: "/api/work-orders", pick: "workOrders" },
  { id: "photo-kedai", title: "Gambar kedai", endpoint: "/api/sales/motorcycles", pick: "motorcycles" },
  { id: "photo-servis", title: "Gambar servis", endpoint: "/api/work-orders", pick: "workOrders" },
  { id: "photo-studio", title: "Studio gambar", endpoint: "/api/work-orders", pick: "workOrders" },
  { id: "vo-view", title: "Kelulusan alat", endpoint: "/api/vo", pick: "variationOrders" },
];

export const MenuStation: React.FC<{ tab: string }> = ({ tab }) => {
  const spec = MENUS.find((item) => item.id === tab) || {
    id: tab,
    title: tab,
    endpoint: "/api/health",
    pick: "status",
  };
  const [state, setState] = useState<{ status: string; count: number; detail: string }>({
    status: "Memuatkan...",
    count: 0,
    detail: "",
  });

  useEffect(() => {
    let stop = false;
    fetch(spec.endpoint)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        const bag = data?.[spec.pick];
        const count = Array.isArray(bag) ? bag.length : data?.success || data?.ok || data?.status ? 1 : 0;
        if (!stop) {
          setState({
            status: res.ok ? "Bersambung" : "API menolak",
            count,
            detail: res.ok ? spec.endpoint : data?.message || res.statusText,
          });
        }
      })
      .catch(() => {
        if (!stop) setState({ status: "Tidak bersambung", count: 0, detail: spec.endpoint });
      });
    return () => {
      stop = true;
    };
  }, [spec.endpoint, spec.pick, tab]);

  return (
    <section className="mb-4 rounded-2xl border-2 border-zinc-900 bg-white p-4">
      <p className="text-[11px] font-black uppercase tracking-wider text-red-600">Menu {spec.id}</p>
      <h1 className="text-xl font-black text-zinc-950">{spec.title}</h1>
      <p className="mt-1 text-sm font-bold text-zinc-800">{state.status}. Rekod dibaca: {state.count}.</p>
      <p className="text-xs font-mono text-zinc-500">{state.detail}</p>
      {state.count === 0 && <p className="mt-2 text-xs font-bold text-zinc-600">Tiada rekod. Menu ini tidak diisi dengan data contoh.</p>}
    </section>
  );
};
