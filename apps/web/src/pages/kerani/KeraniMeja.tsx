import React, { useEffect, useState } from "react";
import { ArahanStrip } from "../owner/OwnerDesk";
import { fetchApi } from "../../lib/api";
import { 
  Package, Users, ShoppingCart, Clock, CheckCircle2, 
  Truck, AlertTriangle, Search, RefreshCw, Send, 
  ExternalLink, Sparkles, ShieldCheck, Check, CreditCard, DollarSign,
  FileCheck, XCircle
} from "lucide-react";
import { tactileAudio } from "../../lib/audio";
import { fireVictoryCelebration, fireMicroBurst } from "../../lib/confetti";
import { toast } from "sonner";
import { InteractiveNumber } from "../../components/ui/InteractiveNumber";

type Today = {
  pesananWeb: number;
  menungguSemakan: number;
  menungguKurier: number;
  tempahanMotor: number;
  tempahanBarang: number;
  slotServis: number;
  servisJalan: number;
  servisAlat: number;
  servisSiap: number;
};

type Line = { id: string; title: string; quantity: number; unitPrice: number; videoUrl?: string | null; image?: string | null };
type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  address?: string | null;
  fulfillment: "pickup" | "delivery";
  status: string;
  paymentNote?: string | null;
  trackingNumber?: string | null;
  lines: Line[];
};

type Customer = { name: string; phone: string; plates: string[]; services: number; orders: number; messages: number };
type Low = { id: string; name: string; stockQty: number; minAlertQty: number };
type Deposit = { id: string; customerName: string; slipRef?: string; model?: string; amount: number; createdAt: string };

const rm = (n: number) => `RM ${(n || 0).toLocaleString("ms-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const KeraniMeja: React.FC<{ mode: "kaunter" | "stor" }> = ({ mode }) => {
  const role = mode === "kaunter" ? "kerani_1" : "kerani_2";
  const [today, setToday] = useState<Today | null>(null);
  const [low, setLow] = useState<Low[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [query, setQuery] = useState("");
  const [msg, setMsg] = useState("");
  const [draft, setDraft] = useState<Record<string, string>>({});

  const load = () => {
    fetchApi<{ today: Today; lowStock: Low[] }>("/desk/shop/today")
      .then((d) => { setToday(d.today); setLow(d.lowStock); })
      .catch((e) => setMsg(e.message));
    fetchApi<{ orders: Order[] }>("/desk/shop/orders")
      .then((d) => setOrders(d.orders))
      .catch(() => setOrders([]));
    fetchApi<{ customers: Customer[] }>(`/desk/shop/customers?q=${encodeURIComponent(query)}`)
      .then((d) => setCustomers(d.customers))
      .catch(() => setCustomers([]));
    if (mode === "kaunter") {
      fetchApi<{ deposits: Deposit[] }>("/desk/deposits")
        .then((d) => setDeposits(d.deposits))
        .catch(() => setDeposits([]));
    }
  };

  useEffect(() => { load(); }, [query]);

  const act = async (path: string, body: Record<string, string>) => {
    try {
      await fetchApi(path, { method: "POST", body: JSON.stringify(body) });
      tactileAudio.successChime();
      fireMicroBurst();
      toast.success("Tindakan berjaya dikemas kini!");
      setMsg("Rekod dikemas kini.");
      load();
    } catch (err: any) {
      tactileAudio.warningAlert();
      toast.error(err.message || "Ralat tindakan.");
    }
  };

  const matchDeposit = async (id: string) => {
    try {
      await fetchApi(`/desk/deposits/${id}/match`, { method: "POST" });
      tactileAudio.cashRegister();
      fireVictoryCelebration();
      toast.success("Slip deposit disahkan & motosikal ditanda tempah!");
      load();
    } catch (err: any) {
      toast.error(err.message || "Ralat padanan deposit");
    }
  };

  const rejectDeposit = async (id: string) => {
    try {
      await fetchApi(`/desk/deposits/${id}/reject`, { method: "POST" });
      tactileAudio.warningAlert();
      toast.info("Slip deposit telah ditolak.");
      load();
    } catch (err: any) {
      toast.error(err.message || "Ralat tolak deposit");
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <ArahanStrip role={role} />

      {/* 1. HEADER COCKPIT KERANI - 4 WARNA: HITAM, PUTIH, MERAH, HIJAU MUDA */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-zinc-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-black text-red-600 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span className="tracking-wider uppercase">
              {mode === "kaunter" ? "Meja Operasi Kaunter & Perhubungan Pelanggan (SA)" : "Meja Operasi Stor & Pengurusan Alat Ganti"}
            </span>
            <span className="text-zinc-950 font-bold">•</span>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border-2 border-red-300 uppercase text-[10px] font-black">
              {mode === "kaunter" ? "Kerani 1 (Kaunter & Pelanggan)" : "Kerani 2 (Stor & Stok)"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
            {mode === "kaunter" 
              ? "Urusan Pelanggan, Slip Deposit, Pesanan & Bayaran POS" 
              : "Pengurusan Alat Ganti, Rak & Semakan Stok"}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-800 mt-1 font-bold">
            {mode === "kaunter"
              ? "Kerani kaunter menguruskan segala-galanya berkaitan pelanggan: pendaftaran, slip deposit, semakan pesanan, dan WhatsApp."
              : "Kerani stor menguruskan bekalan alat ganti kepada lif pit mekanik, semakan inventori, dan pesanan pembekal."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {mode === "kaunter" && (
            <a
              href="#loan-pipeline"
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition flex items-center gap-2 text-xs font-black cursor-pointer shadow-sm active:scale-95 no-underline"
            >
              <CreditCard className="w-3.5 h-3.5 text-white" />
              <span>Saluran Pinjaman (Loan)</span>
            </a>
          )}
          <button 
            type="button"
            onClick={() => {
              tactileAudio.buttonClick();
              load();
              toast.info("Data meja telah disegarkan.");
            }}
            className="px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white transition flex items-center gap-2 text-xs font-black cursor-pointer shadow-sm active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-white" />
            <span>Segar Semula</span>
          </button>
        </div>
      </div>

      {/* 2. ZON METRIK HARI INI (9-BOX BENTO GRID - HANYA 4 WARNA) */}
      {today && (
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3.5">
          {[
            { label: "Pesanan Web Hari Ini", val: today.pesananWeb, icon: ShoppingCart, isAlert: false },
            { label: "Menunggu Semakan Bayaran", val: today.menungguSemakan, icon: Clock, isAlert: today.menungguSemakan > 0 },
            { label: "Menunggu Nombor Kurier", val: today.menungguKurier, icon: Truck, isAlert: today.menungguKurier > 0 },
            { label: "Tempahan Motosikal", val: today.tempahanMotor, icon: ShieldCheck, isAlert: false },
            { label: "Tempahan Alat Ganti", val: today.tempahanBarang, icon: Package, isAlert: false },
            { label: "Slot Servis Dibuka", val: today.slotServis, icon: Clock, isAlert: false },
            { label: "Servis Sedang Berjalan", val: today.servisJalan, icon: Sparkles, isAlert: false },
            { label: "Menunggu Alat Ganti", val: today.servisAlat, icon: AlertTriangle, isAlert: today.servisAlat > 0 },
            { label: "Servis Selesai & Siap", val: today.servisSiap, icon: CheckCircle2, isAlert: false, isSuccess: true },
          ].map((item, idx) => {
            const Icon = item.icon;
            const badgeBg = item.isAlert ? "bg-red-100 text-red-800 border-red-300" : item.isSuccess ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-zinc-100 text-zinc-950 border-zinc-300";
            return (
              <div 
                key={idx} 
                className="bg-white border-2 border-zinc-200 rounded-2xl p-4 shadow-sm hover:border-zinc-950 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-zinc-950 font-mono">
                    {item.label}
                  </span>
                  <div className={`w-8 h-8 rounded-xl ${badgeBg} border-2 flex items-center justify-center font-black`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-mono">
                  <InteractiveNumber value={item.val} />
                </p>
              </div>
            );
          })}
        </section>
      )}

      {/* 3. BAHAGIAN KHAS KERANI 1: PENGURUSAN SLIP DEPOSIT PELANGGAN */}
      {mode === "kaunter" && (
        <section className="bg-white border-2 border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-3">
            <div>
              <h2 className="text-sm font-black text-zinc-950 tracking-wider uppercase font-mono flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-red-600" />
                Urus Slip Deposit Pelanggan (Tugasan Kaunter)
              </h2>
              <p className="text-xs text-zinc-800 mt-0.5 font-bold">
                Kerani kaunter menyemak resit deposit pelanggan dan sahkan unit motosikal sedia ditempah.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-zinc-950 text-white text-xs font-mono font-black">
              {deposits.length} Menunggu Padanan
            </span>
          </div>

          {deposits.length === 0 ? (
            <div className="py-6 text-center text-zinc-800 text-xs font-bold bg-zinc-50 border-2 border-zinc-200 rounded-2xl">
              Tiada slip deposit pelanggan tertunggak. Semua deposit telah dipadankan.
            </div>
          ) : (
            <div className="space-y-3">
              {deposits.map((d) => (
                <div key={d.id} className="border-2 border-zinc-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 bg-zinc-50 hover:bg-white transition-colors">
                  <div>
                    <p className="text-xs font-black text-zinc-950 flex items-center gap-2">
                      <span>{d.customerName}</span>
                      <span className="font-mono text-zinc-800 font-bold bg-white px-2 py-0.5 rounded border border-zinc-300">
                        Slip: {d.slipRef || "Tanpa Rujukan"}
                      </span>
                    </p>
                    <p className="text-xs text-zinc-800 font-bold mt-1">
                      Model Motosikal: <span className="font-black text-zinc-950">{d.model}</span> · Jumlah: <span className="font-mono font-black text-red-700">{rm(d.amount)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={() => matchDeposit(d.id)}
                      className="bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl px-4 py-2 text-xs font-black transition shadow-sm cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Padan Slip & Tempah
                    </button>
                    <button 
                      type="button" 
                      onClick={() => rejectDeposit(d.id)}
                      className="bg-white hover:bg-red-50 text-red-700 border-2 border-red-300 rounded-xl px-3 py-2 text-xs font-black transition cursor-pointer active:scale-95"
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 4. BAHAGIAN PESANAN LAMAN WEB */}
      <section className="bg-white border-2 border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-3">
          <div>
            <h2 className="text-sm font-black text-zinc-950 tracking-wider uppercase font-mono flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-red-600" />
              Pesanan Pelanggan Menunggu Tindakan
            </h2>
            <p className="text-xs text-zinc-800 mt-0.5 font-bold">Semak rujukan bayaran dan jana resit atau nombor penjejakan kurier pelanggan.</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-zinc-950 text-white text-xs font-mono font-black">
            {orders.length} Pesanan
          </span>
        </div>

        {orders.length === 0 && (
          <div className="py-6 text-center text-zinc-800 text-xs font-bold bg-zinc-50 border-2 border-zinc-200 rounded-2xl">
            Tiada pesanan pelanggan aktif pada masa ini.
          </div>
        )}

        <div className="space-y-3">
          {orders.map((order) => {
            const total = order.lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
            const note = draft[order.id] || "";
            return (
              <div key={order.id} className="border-2 border-zinc-200 rounded-2xl p-4 sm:p-5 space-y-3 bg-white hover:border-zinc-400 transition-all shadow-sm">
                <div className="flex flex-wrap justify-between items-start gap-2 border-b-2 border-zinc-100 pb-3">
                  <div>
                    <p className="font-black text-sm text-zinc-950 flex items-center gap-2">
                      <span>{order.customerName}</span>
                      <span className="text-xs font-mono text-zinc-800 font-black">({order.customerPhone})</span>
                    </p>
                    <div className="flex items-center gap-2 text-xs text-zinc-900 mt-1 font-bold">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-950 border border-zinc-300 font-bold">
                        {order.fulfillment === "delivery" ? `Kurier: ${order.address || "Alamat Diberikan"}` : "Ambil Sendiri di Cawangan"}
                      </span>
                      <span className="text-zinc-950 font-bold">•</span>
                      <span className="px-2.5 py-0.5 rounded-md bg-red-100 text-red-800 border border-red-300 font-mono uppercase font-black text-[10px]">
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-zinc-950 font-mono">{rm(total)}</p>
                    <p className="text-[11px] text-zinc-800 font-black">{order.lines.length} item barangan</p>
                  </div>
                </div>

                {/* Senarai Garisan Pesanan */}
                <ul className="space-y-2 py-1">
                  {order.lines.map((line) => (
                    <li key={line.id} className="flex gap-3 items-center text-xs text-zinc-950 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                      {line.image ? (
                        <img src={line.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-zinc-300" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-zinc-200 flex items-center justify-center text-zinc-950 font-black">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="font-black text-zinc-950 block truncate">{line.title}</span>
                        <span className="text-[11px] text-zinc-800 font-mono font-bold">
                          {line.quantity} unit × {rm(line.unitPrice)}
                        </span>
                      </div>
                      {line.videoUrl && (
                        <a 
                          className="text-red-700 hover:text-red-800 font-black text-xs flex items-center gap-1 shrink-0" 
                          href={line.videoUrl} 
                          target="_blank" 
                          rel="noreferrer"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Video
                        </a>
                      )}
                    </li>
                  ))}
                </ul>

                {/* Tindakan Pesanan Mengikut Status */}
                {order.status === "menunggu_semakan" && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t-2 border-zinc-100 items-center">
                    <input 
                      className="border-2 border-zinc-300 rounded-xl px-3.5 py-2 text-xs flex-1 min-w-[200px] text-zinc-950 font-bold focus:outline-hidden focus:border-zinc-950" 
                      placeholder="Rujukan transaksi bayaran (cth: D1-0982 / Tunai)" 
                      value={note} 
                      onChange={(e) => setDraft({ ...draft, [order.id]: e.target.value })} 
                    />
                    <button 
                      type="button" 
                      className="bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl px-4 py-2 text-xs font-black transition shadow-sm cursor-pointer flex items-center gap-1.5 active:scale-95" 
                      onClick={() => act(`/desk/shop/orders/${order.id}/pay`, { paymentNote: note })}
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Bayaran Sah
                    </button>
                    <button 
                      type="button" 
                      className="text-xs font-black text-red-700 hover:text-red-800 px-3 py-2 rounded-xl hover:bg-red-50 border border-red-200 transition cursor-pointer" 
                      onClick={() => act(`/desk/shop/orders/${order.id}/reject`, { reason: note || "Tidak sah" })}
                    >
                      Tolak
                    </button>
                  </div>
                )}

                {order.status === "sudah_bayar" && order.fulfillment === "delivery" && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t-2 border-zinc-100 items-center">
                    <input 
                      className="border-2 border-zinc-300 rounded-xl px-3.5 py-2 text-xs flex-1 min-w-[200px] text-zinc-950 font-bold focus:outline-hidden focus:border-zinc-950 font-mono" 
                      placeholder="Nombor penjejakan kurier (cth: JNT123456789MY)" 
                      value={note} 
                      onChange={(e) => setDraft({ ...draft, [order.id]: e.target.value })} 
                    />
                    <button 
                      type="button" 
                      className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-2 text-xs font-black transition shadow-sm cursor-pointer flex items-center gap-1.5 active:scale-95" 
                      onClick={() => act(`/desk/shop/orders/${order.id}/ship`, { trackingNumber: note })}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      Simpan Nombor Kurier
                    </button>
                  </div>
                )}

                {order.status === "sudah_bayar" && order.fulfillment === "pickup" && (
                  <div className="pt-2 border-t-2 border-zinc-100">
                    <button 
                      type="button" 
                      className="bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl px-4 py-2 text-xs font-black transition shadow-sm cursor-pointer active:scale-95 flex items-center gap-1.5" 
                      onClick={() => act(`/desk/shop/orders/${order.id}/handover`, {})}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Selesai Diserahkan di Kaunter
                    </button>
                  </div>
                )}

                {order.trackingNumber && (
                  <div className="text-xs text-zinc-950 font-mono bg-zinc-100 p-2.5 rounded-xl border border-zinc-300 font-black">
                    Kurier: <span className="font-black text-zinc-950">{order.trackingNumber}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. BAHAGIAN PELANGGAN & STOK GENTING (2 KOLUM GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolum Kiri & Tengah: Carian & Pangkalan Data Pelanggan */}
        <section className="lg:col-span-2 bg-white border-2 border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="border-b-2 border-zinc-100 pb-3">
            <h2 className="text-xs font-black text-zinc-950 tracking-wider uppercase font-mono flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-950" />
              Direktori & Perhubungan Pelanggan (WhatsApp CRM)
            </h2>
            <p className="text-xs text-zinc-800 mt-0.5 font-bold">Cari rekod servis pelanggan, hubungi melalui WhatsApp, dan semak status motosikal.</p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-zinc-950 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              className="border-2 border-zinc-300 rounded-xl pl-10 pr-4 py-2.5 text-xs w-full text-zinc-950 font-bold focus:outline-hidden focus:border-zinc-950" 
              placeholder="Cari nama pelanggan, nombor telefon, atau no plat motosikal..." 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
            />
          </div>

          <div className="space-y-2.5">
            {customers.slice(0, 10).map((customer) => (
              <CustomerRow key={customer.phone} customer={customer} onSent={(text) => { setMsg(text); load(); }} />
            ))}
            {customers.length === 0 && (
              <p className="text-xs text-zinc-800 font-bold text-center py-6">Tiada pelanggan sepadan ditemui.</p>
            )}
          </div>
        </section>

        {/* Kolum Kanan: Stok Rendah & Makluman Pembekal */}
        <section className="bg-white border-2 border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-zinc-100 pb-3 mb-4">
              <h2 className="text-xs font-black text-zinc-950 tracking-wider uppercase font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Stok Genting Menunggu Pesanan
              </h2>
              <p className="text-xs text-zinc-800 mt-0.5 font-bold">Alat ganti di bawah paras minimum kedai.</p>
            </div>

            {low.length === 0 && (
              <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-center">
                <p className="text-xs font-black text-emerald-950">Semua Stok Mencukupi</p>
                <p className="text-[11px] text-emerald-800 font-black mt-0.5">Tiada barang di bawah paras amaran minimum.</p>
              </div>
            )}

            <div className="space-y-2.5">
              {low.map((part) => (
                <div key={part.id} className="p-3 rounded-2xl bg-zinc-50 border-2 border-zinc-200 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="font-black text-xs text-zinc-950">{part.name}</span>
                    <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 border border-red-300 text-[10px] font-mono font-black">
                      {part.stockQty} / {part.minAlertQty} min
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-zinc-200">
                    <span className="text-[10px] text-zinc-800 font-mono font-bold">ID: {part.id.slice(0, 8)}</span>
                    <button 
                      type="button" 
                      className="text-[11px] font-black text-red-700 hover:text-red-800 cursor-pointer flex items-center gap-1 active:scale-95" 
                      onClick={async () => {
                        tactileAudio.buttonClick();
                        await fetchApi("/desk/shop/stock-alert", { method: "POST", body: JSON.stringify({ productId: part.id }) });
                        toast.success("Pemilik telah dimaklumkan tentang stok ini.");
                        setMsg("Pemilik diberitahu.");
                      }}
                    >
                      <Send className="w-3 h-3" />
                      Maklumkan Pemilik
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t-2 border-zinc-100">
            <div className="p-3 rounded-2xl bg-zinc-50 border-2 border-zinc-200 text-xs font-bold flex items-center justify-between">
              <span className="text-zinc-800">Status Stor:</span>
              <span className="font-black font-mono text-emerald-800 flex items-center gap-1.5 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                Auto Stock Track
              </span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

const CustomerRow: React.FC<{ customer: Customer; onSent: (text: string) => void }> = ({ customer, onSent }) => {
  const [text, setText] = useState("");
  return (
    <div className="border-2 border-zinc-200 rounded-2xl p-3.5 space-y-2.5 bg-zinc-50 hover:bg-white transition-colors">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <p className="font-black text-xs text-zinc-950">
          {customer.name} · <span className="font-mono text-zinc-950 font-black">{customer.phone}</span>
        </p>
        <span className="text-[10px] font-mono text-zinc-950 font-black bg-white px-2 py-0.5 rounded-md border border-zinc-300">
          Plat: {customer.plates.join(", ") || "Tiada"}
        </span>
      </div>
      <p className="text-[11px] text-zinc-800 font-bold">
        Servis: <span className="font-black text-zinc-950">{customer.services}</span> · Pesanan: <span className="font-black text-zinc-950">{customer.orders}</span> · Mesej: <span className="font-black text-zinc-950">{customer.messages}</span>
      </p>
      <div className="flex gap-2">
        <input 
          className="flex-1 border-2 border-zinc-300 bg-white rounded-xl px-3 py-1.5 text-xs text-zinc-950 font-bold focus:outline-hidden focus:border-zinc-950" 
          placeholder="Tulis mesej WhatsApp kepada pelanggan..." 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
        />
        <button 
          type="button" 
          className="bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl px-3.5 py-1.5 text-xs font-black transition shadow-sm cursor-pointer flex items-center gap-1.5 active:scale-95" 
          onClick={async () => {
            tactileAudio.buttonClick();
            const res = await fetchApi<{ waUrl: string }>("/desk/shop/message", { method: "POST", body: JSON.stringify({ phone: customer.phone, text }) });
            window.open(res.waUrl, "_blank", "noopener,noreferrer");
            setText("");
            toast.success("WhatsApp dibuka.");
            onSent("Mesej direkod dan WhatsApp dibuka.");
          }}
        >
          <Send className="w-3 h-3 text-emerald-400" />
          Hantar
        </button>
      </div>
    </div>
  );
};
