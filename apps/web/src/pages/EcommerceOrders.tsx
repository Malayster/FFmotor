import React, { useState, useEffect, useMemo } from "react";
import {
  Package,
  Truck,
  Printer,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Phone,
  Mail,
  MapPin,
  Barcode,
  Calendar,
  DollarSign,
  Filter,
  Check,
  X,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  RotateCcw,
  FileText,
  Eye,
  Info
} from "lucide-react";
import { sessionHeader } from "../lib/api";

export interface WebOrderLine {
  id?: string;
  orderId?: string;
  subjectType?: "motorcycle" | "product";
  subjectId?: string;
  title: string;
  unitPrice: number;
  quantity: number;
  videoUrl?: string | null;
  image?: string | null;
}

export interface TrackingHistoryEvent {
  timestamp: string;
  status: string;
  note?: string;
  trackingNumber?: string;
  carrier?: string;
  handledBy?: string;
}

export interface WebOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  address?: string | null;
  items?: string | null;
  amount: number;
  fulfillment: "delivery" | "pickup";
  status: "menunggu_semakan" | "sudah_bayar" | "ditolak" | "dihantar" | "diserahkan";
  paymentNote?: string | null;
  rejectReason?: string | null;
  trackingNumber?: string | null;
  trackingHistory?: string | TrackingHistoryEvent[] | null;
  handledBy?: string | null;
  paidAt?: string | null;
  closedAt?: string | null;
  receiptSentAt?: string | null;
  receiptMethod?: "wasap" | "email" | null;
  createdAt: string;
  updatedAt?: string | null;
  lines?: WebOrderLine[];
}

export const EcommerceOrders: React.FC = () => {
  const [orders, setOrders] = useState<WebOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"all" | "menunggu_semakan" | "sudah_bayar" | "dihantar" | "diserahkan" | "ditolak">("all");
  const [fulfillmentFilter, setFulfillmentFilter] = useState<"all" | "delivery" | "pickup">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [selectedOrderForPay, setSelectedOrderForPay] = useState<WebOrder | null>(null);
  const [paymentNoteInput, setPaymentNoteInput] = useState("");
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  const [selectedOrderForReject, setSelectedOrderForReject] = useState<WebOrder | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState("");
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  const [selectedOrderForShip, setSelectedOrderForShip] = useState<WebOrder | null>(null);
  const [carrierInput, setCarrierInput] = useState("J&T Express");
  const [trackingInput, setTrackingInput] = useState("");
  const [isSubmittingShip, setIsSubmittingShip] = useState(false);

  const [orderForAwb, setOrderForAwb] = useState<WebOrder | null>(null);
  const [orderForDetails, setOrderForDetails] = useState<WebOrder | null>(null);

  // Fetch live orders from backend
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/desk/shop/orders", {
        headers: sessionHeader(),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Gagal memuat turun pesanan beg kuning:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // 1. Status Filter (5 status sah sahaja)
      if (filterTab !== "all" && ord.status !== filterTab) return false;

      // 2. Fulfillment Filter
      if (fulfillmentFilter !== "all" && ord.fulfillment !== fulfillmentFilter) return false;

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = ord.id.toLowerCase().includes(q);
        const matchName = ord.customerName.toLowerCase().includes(q);
        const matchPhone = ord.customerPhone.includes(q);
        const matchEmail = (ord.customerEmail || "").toLowerCase().includes(q);
        const matchTracking = (ord.trackingNumber || "").toLowerCase().includes(q);
        const matchNote = (ord.paymentNote || "").toLowerCase().includes(q);
        if (!matchId && !matchName && !matchPhone && !matchEmail && !matchTracking && !matchNote) {
          return false;
        }
      }

      return true;
    });
  }, [orders, filterTab, fulfillmentFilter, searchQuery]);

  // Quick Metrics
  const countMenunggu = orders.filter((o) => o.status === "menunggu_semakan").length;
  const countSudahBayar = orders.filter((o) => o.status === "sudah_bayar").length;
  const countDihantar = orders.filter((o) => o.status === "dihantar").length;
  const countDiserahkan = orders.filter((o) => o.status === "diserahkan").length;
  const countDitolak = orders.filter((o) => o.status === "ditolak").length;
  const totalSalesAmount = orders
    .filter((o) => o.status !== "ditolak")
    .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  // 1. Sahkan Bayaran (POST /api/desk/shop/orders/:id/pay)
  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForPay) return;
    if (!paymentNoteInput.trim()) {
      alert("Sila masukkan rujukan bayaran (cth: DuitNow Ref, No. Resit Bank)");
      return;
    }

    setIsSubmittingPay(true);
    try {
      const res = await fetch(`/api/desk/shop/orders/${selectedOrderForPay.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...sessionHeader() },
        body: JSON.stringify({ paymentNote: paymentNoteInput.trim() }),
      });
      const d = await res.json();
      if (d.success) {
        alert(`Bayaran untuk pesanan ${selectedOrderForPay.id} berjaya disahkan!`);
        setSelectedOrderForPay(null);
        setPaymentNoteInput("");
        fetchOrders();
      } else {
        alert("Ralat mengesahkan bayaran: " + (d.message || "Gagal"));
      }
    } catch (err: any) {
      alert("Ralat rangkaian: " + err.message);
    } finally {
      setIsSubmittingPay(false);
    }
  };

  // 2. Tolak Pesanan (POST /api/desk/shop/orders/:id/reject)
  const handleRejectOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForReject) return;
    if (!rejectReasonInput.trim()) {
      alert("Sila nyatakan sebab penolakan pesanan.");
      return;
    }

    setIsSubmittingReject(true);
    try {
      const res = await fetch(`/api/desk/shop/orders/${selectedOrderForReject.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...sessionHeader() },
        body: JSON.stringify({ reason: rejectReasonInput.trim() }),
      });
      const d = await res.json();
      if (d.success) {
        alert(`Pesanan ${selectedOrderForReject.id} telah ditolak.`);
        setSelectedOrderForReject(null);
        setRejectReasonInput("");
        fetchOrders();
      } else {
        alert("Ralat menolak pesanan: " + (d.message || "Gagal"));
      }
    } catch (err: any) {
      alert("Ralat rangkaian: " + err.message);
    } finally {
      setIsSubmittingReject(false);
    }
  };

  // 3. Hantar Kurier / Ship (POST /api/desk/shop/orders/:id/ship)
  const handleShipOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForShip) return;
    const finalTracking = trackingInput.trim() || `JNT-MY${Date.now().toString().slice(-8)}`;

    setIsSubmittingShip(true);
    try {
      const res = await fetch(`/api/desk/shop/orders/${selectedOrderForShip.id}/ship`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...sessionHeader() },
        body: JSON.stringify({
          trackingNumber: finalTracking,
          carrier: carrierInput,
        }),
      });
      const d = await res.json();
      if (d.success) {
        alert(`Pesanan ${selectedOrderForShip.id} telah dikemaskini sebagai 'DIHANTAR'!\nKurier: ${carrierInput}\nNo. Tracking: ${finalTracking}`);
        setSelectedOrderForShip(null);
        setTrackingInput("");
        fetchOrders();
      } else {
        alert("Ralat mengemaskini penghantaran: " + (d.message || "Gagal"));
      }
    } catch (err: any) {
      alert("Ralat rangkaian: " + err.message);
    } finally {
      setIsSubmittingShip(false);
    }
  };

  // 4. Selesai Diserahkan (Ambil Sendiri di Bengkel) (POST /api/desk/shop/orders/:id/handover)
  const handleHandoverOrder = async (order: WebOrder) => {
    if (!window.confirm(`Adakah anda pasti pesanan ${order.id} telah diserahkan sepenuhnya kepada ${order.customerName}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/desk/shop/orders/${order.id}/handover`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...sessionHeader() },
        body: JSON.stringify({}),
      });
      const d = await res.json();
      if (d.success) {
        alert(`Pesanan ${order.id} telah berjaya diserahkan kepada pelanggan!`);
        fetchOrders();
      } else {
        alert("Ralat mengesahkan penyerahan: " + (d.message || "Gagal"));
      }
    } catch (err: any) {
      alert("Ralat rangkaian: " + err.message);
    }
  };

  // 5. Hantar Resit Rasmi (POST /api/desk/shop/orders/:id/receipt)
  const handleSendReceipt = async (order: WebOrder, method: "wasap" | "email") => {
    try {
      const res = await fetch(`/api/desk/shop/orders/${order.id}/receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...sessionHeader() },
        body: JSON.stringify({ receiptMethod: method }),
      });
      const d = await res.json();
      if (d.success) {
        if (method === "wasap" && d.waUrl) {
          window.open(d.waUrl, "_blank");
        } else {
          alert(`Resit bagi pesanan ${order.id} telah dihantar melalui ${method.toUpperCase()}!`);
        }
        fetchOrders();
      }
    } catch (err: any) {
      alert("Ralat menghantar resit: " + err.message);
    }
  };

  // 6. Buka WhatsApp Tracking Info
  const handleSendWhatsAppTracking = (order: WebOrder) => {
    if (!order.trackingNumber) {
      alert("Nombor tracking belum didaftarkan untuk pesanan ini.");
      return;
    }
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("0") ? "6" + cleanPhone : cleanPhone.startsWith("60") ? cleanPhone : "60" + cleanPhone;

    const carrierLink = order.trackingNumber.toLowerCase().startsWith("pos")
      ? `https://tracking.pos.com.my/tracking-details?trackingNo=${encodeURIComponent(order.trackingNumber)}`
      : `https://www.jtexpress.my/tracking?bills=${encodeURIComponent(order.trackingNumber)}`;

    const text = encodeURIComponent(
      `Salam hormat ${order.customerName},\n\n` +
      `Pesanan Beg Kuning anda di *FFmotor* (*${order.id}*) telah diserahkan kepada syarikat kurier.\n\n` +
      `📦 *No. Tracking*: ${order.trackingNumber}\n` +
      `🔗 *Pautan Jejak*: ${carrierLink}\n` +
      `💰 *Jumlah Pesanan*: RM ${order.amount.toFixed(2)}\n\n` +
      `Alamat Penghantaran:\n${order.address || "-"}\n\n` +
      `Terima kasih atas pembelian anda bersama FFmotor!`
    );

    window.open(`https://wa.me/${formattedPhone}?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-6 pb-16 text-zinc-950">
      {/* Header Utama Pengurusan Beg Kuning */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-zinc-950 border border-zinc-950 font-mono">
              E-COMMERCE BEG KUNING
            </span>
            <span className="text-[10px] text-zinc-800 font-bold font-mono">
              STOR & PENGHANTARAN ALAT GANTI
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-zinc-950 tracking-tight mt-1 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-red-600" />
            <span>Pengurusan Pesanan Beg Kuning</span>
          </h1>
          <p className="text-xs text-zinc-800 font-bold mt-0.5">
            Semakan transaksi pelanggan online, kelulusan bayaran, cetakan AWB thermal 4x6", dan penyerahan barang di kaunter.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchOrders}
            className="px-3.5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-950 border-2 border-zinc-950 text-xs font-black flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm"
            title="Muat semula senarai pesanan"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Muat Semula</span>
          </button>
        </div>
      </div>

      {/* Kad Metrik Pantas Beg Kuning (5 Status Sah Sahaja) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Menunggu Semakan */}
        <div className="bg-white border-2 border-amber-500 rounded-2xl p-3.5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-amber-800">Menunggu</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-900">{countMenunggu}</div>
          <div className="text-[10px] text-zinc-800 font-bold">Perlu disemak kerani</div>
        </div>

        {/* 2. Sudah Bayar */}
        <div className="bg-white border-2 border-zinc-950 rounded-2xl p-3.5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-zinc-950">Sudah Bayar</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-zinc-950">{countSudahBayar}</div>
          <div className="text-[10px] text-zinc-800 font-bold">Sedia pos / ambil</div>
        </div>

        {/* 3. Dihantar */}
        <div className="bg-white border-2 border-zinc-950 rounded-2xl p-3.5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-zinc-950">Dihantar</span>
            <Truck className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-black font-mono text-red-600">{countDihantar}</div>
          <div className="text-[10px] text-zinc-800 font-bold">Dalam kurier pos</div>
        </div>

        {/* 4. Diserahkan */}
        <div className="bg-white border-2 border-emerald-600 rounded-2xl p-3.5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-emerald-800">Diserahkan</span>
            <Check className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-800">{countDiserahkan}</div>
          <div className="text-[10px] text-zinc-800 font-bold">Ambil di cawangan</div>
        </div>

        {/* 5. Ditolak */}
        <div className="bg-white border-2 border-red-600 rounded-2xl p-3.5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-red-600">Ditolak</span>
            <X className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-black font-mono text-red-600">{countDitolak}</div>
          <div className="text-[10px] text-zinc-800 font-bold">Batal / tidak sah</div>
        </div>

        {/* 6. Nilai Jualan Lunas */}
        <div className="bg-zinc-950 text-white rounded-2xl p-3.5 shadow-sm space-y-1 border-2 border-zinc-950">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-zinc-300">Nilai Jualan</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-black font-mono text-emerald-400 truncate">
            RM {totalSalesAmount.toFixed(2)}
          </div>
          <div className="text-[10px] text-zinc-200 font-bold font-mono">100% Bersih Beg Kuning</div>
        </div>
      </div>

      {/* Bar Carian & Tab Penapis Status (5 Status Sah Sahaja) */}
      <div className="bg-white border-2 border-zinc-950 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tab Status Sah */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-black">
            <button
              type="button"
              onClick={() => setFilterTab("all")}
              className={`px-3 py-1.5 rounded-xl border-2 transition cursor-pointer ${
                filterTab === "all"
                  ? "bg-zinc-950 text-white border-zinc-950"
                  : "bg-white text-zinc-950 border-zinc-300 hover:border-zinc-950"
              }`}
            >
              Semua ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("menunggu_semakan")}
              className={`px-3 py-1.5 rounded-xl border-2 transition cursor-pointer ${
                filterTab === "menunggu_semakan"
                  ? "bg-amber-400 text-zinc-950 border-zinc-950"
                  : "bg-white text-zinc-950 border-zinc-300 hover:border-amber-400"
              }`}
            >
              Menunggu Semakan ({countMenunggu})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("sudah_bayar")}
              className={`px-3 py-1.5 rounded-xl border-2 transition cursor-pointer ${
                filterTab === "sudah_bayar"
                  ? "bg-zinc-950 text-white border-zinc-950"
                  : "bg-white text-zinc-950 border-zinc-300 hover:border-zinc-950"
              }`}
            >
              Sudah Bayar ({countSudahBayar})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("dihantar")}
              className={`px-3 py-1.5 rounded-xl border-2 transition cursor-pointer ${
                filterTab === "dihantar"
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-zinc-950 border-zinc-300 hover:border-red-600"
              }`}
            >
              Dihantar Kurier ({countDihantar})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("diserahkan")}
              className={`px-3 py-1.5 rounded-xl border-2 transition cursor-pointer ${
                filterTab === "diserahkan"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-zinc-950 border-zinc-300 hover:border-emerald-600"
              }`}
            >
              Diserahkan di Bengkel ({countDiserahkan})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("ditolak")}
              className={`px-3 py-1.5 rounded-xl border-2 transition cursor-pointer ${
                filterTab === "ditolak"
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-zinc-950 border-zinc-300 hover:border-red-600"
              }`}
            >
              Ditolak ({countDitolak})
            </button>
          </div>

          {/* Penapis Kaedah Fulfillment */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase text-zinc-700">Kaedah:</span>
            <select
              value={fulfillmentFilter}
              onChange={(e) => setFulfillmentFilter(e.target.value as any)}
              className="bg-zinc-50 border-2 border-zinc-950 rounded-xl px-2.5 py-1 text-xs font-black text-zinc-950 outline-none"
            >
              <option value="all">Semua Kaedah</option>
              <option value="delivery">Penghantaran Kurier</option>
              <option value="pickup">Ambil Sendiri di Bengkel</option>
            </select>
          </div>
        </div>

        {/* Carian Pantas */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari mengikut No. Pesanan (ID), Nama Pelanggan, Telefon, Email, atau No. Tracking..."
            className="w-full bg-zinc-50 border-2 border-zinc-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-zinc-950 placeholder:text-zinc-600 outline-none focus:border-red-600 transition"
          />
        </div>
      </div>

      {/* Jadual Senarai Pesanan Beg Kuning */}
      <div className="bg-white border-2 border-zinc-950 rounded-3xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-zinc-950 bg-zinc-50 text-[11px] uppercase font-black text-zinc-950">
                <th className="py-3.5 px-4">No. Pesanan & Tarikh</th>
                <th className="py-3.5 px-4">Pelanggan & Kaedah</th>
                <th className="py-3.5 px-4">Item Beg Kuning</th>
                <th className="py-3.5 px-4">Jumlah & Bayaran</th>
                <th className="py-3.5 px-4">Status & Log</th>
                <th className="py-3.5 px-4 text-right">Tindakan Kerani</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-800 font-bold">
                    <div className="w-7 h-7 rounded-full border-2 border-red-600 border-t-transparent animate-spin mx-auto mb-2" />
                    <span>Memuat turun rekod pesanan beg kuning...</span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-950 font-bold">
                    <Package className="w-8 h-8 text-zinc-950 mx-auto mb-2" />
                    <p>Tiada rekod pesanan beg kuning dijumpai bagi kriteria ini.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const isDelivery = ord.fulfillment === "delivery";
                  const itemLines = ord.lines || [];

                  return (
                    <tr key={ord.id} className="hover:bg-zinc-50 transition">
                      {/* 1. No Pesanan & Tarikh */}
                      <td className="py-3.5 px-4 align-top">
                        <span className="font-mono font-black text-red-600 block text-xs tracking-wider">
                          {ord.id}
                        </span>
                        <span className="text-[10px] text-zinc-800 font-mono font-bold flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-zinc-700" />
                          {ord.createdAt ? new Date(ord.createdAt).toLocaleString("ms-MY") : "-"}
                        </span>
                        {ord.handledBy && (
                          <span className="inline-block mt-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-300 font-bold">
                            Staf: {ord.handledBy}
                          </span>
                        )}
                      </td>

                      {/* 2. Pelanggan & Kaedah */}
                      <td className="py-3.5 px-4 align-top max-w-[240px]">
                        <span className="font-black text-zinc-950 block truncate">
                          {ord.customerName}
                        </span>
                        <div className="flex flex-col gap-0.5 mt-0.5 text-[11px] font-mono font-bold">
                          <a
                            href={`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3 text-emerald-700" />
                            <span>{ord.customerPhone}</span>
                          </a>
                          {ord.customerEmail && (
                            <span className="text-zinc-800 flex items-center gap-1 truncate text-[10px]">
                              <Mail className="w-3 h-3 text-zinc-600" />
                              <span>{ord.customerEmail}</span>
                            </span>
                          )}
                        </div>
                        <div className="mt-1.5">
                          {isDelivery ? (
                            <div className="text-[10px] text-zinc-800 font-bold bg-zinc-100 p-1.5 rounded-lg border border-zinc-200">
                              <span className="font-black text-red-600 block flex items-center gap-1">
                                <Truck className="w-3 h-3" /> Kurier Hantar
                              </span>
                              <span className="line-clamp-2 mt-0.5">{ord.address || "Tiada alamat dinyatakan"}</span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300">
                              <MapPin className="w-3 h-3" /> Ambil di Bengkel Jerlun
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 3. Item Beg Kuning */}
                      <td className="py-3.5 px-4 align-top max-w-[220px]">
                        {itemLines.length === 0 ? (
                          <span className="text-zinc-600 font-bold text-[11px]">Tiada rekod item</span>
                        ) : (
                          <div className="space-y-1">
                            {itemLines.map((it, idx) => (
                              <div key={idx} className="flex items-center justify-between text-[11px] gap-2">
                                <span className="text-zinc-950 font-bold truncate">
                                  <span className="font-black font-mono text-red-600">{it.quantity}x</span> {it.title}
                                </span>
                                <span className="font-mono font-bold text-zinc-950 shrink-0">
                                  RM {(Number(it.unitPrice || 0) * Number(it.quantity || 1)).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* 4. Jumlah & Bayaran */}
                      <td className="py-3.5 px-4 align-top">
                        <span className="font-black text-zinc-950 text-sm font-mono block">
                          RM {Number(ord.amount || 0).toFixed(2)}
                        </span>
                        {ord.paymentNote ? (
                          <div className="mt-1 text-[10px] text-emerald-800 font-bold bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
                            <span className="block font-black">✓ Bayaran Sah</span>
                            <span>{ord.paymentNote}</span>
                            {ord.paidAt && (
                              <span className="block text-[9px] text-zinc-600 font-mono mt-0.5">
                                {new Date(ord.paidAt).toLocaleDateString("ms-MY")}
                              </span>
                            )}
                          </div>
                        ) : ord.rejectReason ? (
                          <div className="mt-1 text-[10px] text-red-600 font-bold bg-red-50 p-1.5 rounded-lg border border-red-200">
                            <span className="block font-black">✕ Ditolak</span>
                            <span>{ord.rejectReason}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-amber-800 font-bold block mt-1">
                            Menunggu Pengesahan
                          </span>
                        )}
                      </td>

                      {/* 5. Status & Log */}
                      <td className="py-3.5 px-4 align-top">
                        {ord.status === "menunggu_semakan" && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-400 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Menunggu Semakan
                          </span>
                        )}
                        {ord.status === "sudah_bayar" && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-zinc-950 text-white inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Sudah Bayar
                          </span>
                        )}
                        {ord.status === "dihantar" && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-600 text-white inline-flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            Dihantar Kurier
                          </span>
                        )}
                        {ord.status === "diserahkan" && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-600 text-white inline-flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Diserahkan
                          </span>
                        )}
                        {ord.status === "ditolak" && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-zinc-200 text-red-600 border border-red-300 inline-flex items-center gap-1">
                            <X className="w-3 h-3" />
                            Ditolak
                          </span>
                        )}

                        {/* Info Tracking Kurier */}
                        {ord.trackingNumber && (
                          <div className="mt-1.5 text-[10px] font-mono font-bold">
                            <span className="text-zinc-600 block">No. Tracking:</span>
                            <span className="text-red-600 font-black block">{ord.trackingNumber}</span>
                          </div>
                        )}

                        {/* Status Resit */}
                        {ord.receiptSentAt && (
                          <div className="mt-1 text-[9px] font-mono text-emerald-800 font-bold">
                            ✓ Resit {ord.receiptMethod === "wasap" ? "WhatsApp" : "Email"}
                          </div>
                        )}
                      </td>

                      {/* 6. Tindakan Kerani (Operasi Beg Kuning Sahaja) */}
                      <td className="py-3.5 px-4 align-top text-right space-y-1.5">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          {/* Aksi untuk menunggu_semakan */}
                          {ord.status === "menunggu_semakan" && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedOrderForPay(ord);
                                  setPaymentNoteInput("DuitNow QR Sah");
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black flex items-center gap-1 transition shadow-sm cursor-pointer"
                                title="Sahkan bayaran pelanggan"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Sahkan</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedOrderForReject(ord);
                                  setRejectReasonInput("Tiada bukti bayaran / dibatalkan");
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-red-50 text-red-600 border border-zinc-300 hover:border-red-600 text-[11px] font-black flex items-center gap-1 transition cursor-pointer"
                                title="Tolak pesanan ini"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Tolak</span>
                              </button>
                            </>
                          )}

                          {/* Aksi untuk sudah_bayar */}
                          {ord.status === "sudah_bayar" && (
                            <>
                              {isDelivery ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedOrderForShip(ord);
                                    setTrackingInput(ord.trackingNumber || "");
                                    setCarrierInput("J&T Express");
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[11px] font-black flex items-center gap-1 transition shadow-sm cursor-pointer"
                                  title="Uruskan penghantaran kurier"
                                >
                                  <Truck className="w-3.5 h-3.5" />
                                  <span>Isi Pos</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleHandoverOrder(ord)}
                                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black flex items-center gap-1 transition shadow-sm cursor-pointer"
                                  title="Sahkan serahan barang kepada pelanggan"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Diserahkan</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleSendReceipt(ord, "wasap")}
                                className="p-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition cursor-pointer"
                                title="Hantar Resit WhatsApp"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setOrderForAwb(ord)}
                                className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-950 border border-zinc-300 transition cursor-pointer"
                                title="Cetak Slip AWB Thermal 4x6"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {/* Aksi untuk dihantar */}
                          {ord.status === "dihantar" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSendWhatsAppTracking(ord)}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-black flex items-center gap-1 transition cursor-pointer"
                                title="Hantar WhatsApp info tracking kurier"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Wasap Track</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setOrderForAwb(ord)}
                                className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-950 border border-zinc-300 transition cursor-pointer"
                                title="Cetak Semula Slip AWB"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {/* Aksi untuk diserahkan */}
                          {ord.status === "diserahkan" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSendReceipt(ord, "wasap")}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-black flex items-center gap-1 transition cursor-pointer"
                                title="Hantar resit WhatsApp"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Wasap Resit</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setOrderForAwb(ord)}
                                className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-950 border border-zinc-300 transition cursor-pointer"
                                title="Cetak slip penyerahan"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {/* Butang lihat butiran penuh */}
                          <button
                            type="button"
                            onClick={() => setOrderForDetails(ord)}
                            className="p-1.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border border-zinc-300 transition cursor-pointer"
                            title="Lihat Butiran Penuh Pesanan"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: PENGESAHAN BAYARAN */}
      {selectedOrderForPay && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-4 border-zinc-950 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-zinc-950">Sahkan Bayaran Pesanan</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForPay(null)}
                className="p-1 rounded-lg text-zinc-800 hover:text-zinc-950 hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-4 text-xs">
              <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-300 space-y-1 font-mono">
                <div className="flex justify-between font-bold">
                  <span className="text-zinc-600">ID Pesanan:</span>
                  <span className="text-red-600 font-black">{selectedOrderForPay.id}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-zinc-600">Pelanggan:</span>
                  <span className="text-zinc-950">{selectedOrderForPay.customerName}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-zinc-600">Jumlah:</span>
                  <span className="text-zinc-950 font-black text-sm">RM {selectedOrderForPay.amount.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-zinc-950 font-black mb-1">
                  Catatan Rujukan Bayaran Disemak:
                </label>
                <input
                  type="text"
                  value={paymentNoteInput}
                  onChange={(e) => setPaymentNoteInput(e.target.value)}
                  placeholder="Cth: DuitNow QR Ref #99281 / Resit Online Bank Sah"
                  className="w-full bg-zinc-50 border-2 border-zinc-950 rounded-xl p-2.5 font-bold outline-none focus:border-red-600"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForPay(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-950 font-black hover:bg-zinc-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPay}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmittingPay ? "Menyimpan..." : "Sahkan Bayaran"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PENOLAKAN PESANAN */}
      {selectedOrderForReject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-4 border-zinc-950 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-black text-zinc-950">Tolak Pesanan Beg Kuning</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForReject(null)}
                className="p-1 rounded-lg text-zinc-800 hover:text-zinc-950 hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRejectOrder} className="space-y-4 text-xs">
              <p className="text-zinc-800 font-bold">
                Pesanan <span className="font-mono font-black text-red-600">{selectedOrderForReject.id}</span> oleh {selectedOrderForReject.customerName} akan ditandakan sebagai <b>Ditolak</b>.
              </p>

              <div>
                <label className="block text-zinc-950 font-black mb-1">
                  Sebab Penolakan Pesanan:
                </label>
                <textarea
                  value={rejectReasonInput}
                  onChange={(e) => setRejectReasonInput(e.target.value)}
                  placeholder="Cth: Stok alat ganti kehabisan / Pelanggan membatalkan pesanan..."
                  rows={3}
                  className="w-full bg-zinc-50 border-2 border-zinc-950 rounded-xl p-2.5 font-bold outline-none focus:border-red-600"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForReject(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-950 font-black hover:bg-zinc-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReject}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  <span>{isSubmittingReject ? "Menyimpan..." : "Tolak Pesanan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PENGHANTARAN KURIER & ISI TRACKING */}
      {selectedOrderForShip && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-4 border-zinc-950 p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-black text-zinc-950">Uruskan Penghantaran Kurier</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForShip(null)}
                className="p-1 rounded-lg text-zinc-800 hover:text-zinc-950 hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleShipOrder} className="space-y-4 text-xs">
              <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-300 space-y-1">
                <span className="text-[10px] text-zinc-600 uppercase font-black block">Penerima & Alamat:</span>
                <p className="font-black text-zinc-950">{selectedOrderForShip.customerName} ({selectedOrderForShip.customerPhone})</p>
                <p className="text-[11px] text-zinc-800 font-bold">{selectedOrderForShip.address || "Tiada alamat dinyatakan"}</p>
              </div>

              <div>
                <label className="block text-zinc-950 font-black mb-1">Pilih Syarikat Kurier:</label>
                <select
                  value={carrierInput}
                  onChange={(e) => setCarrierInput(e.target.value)}
                  className="w-full bg-zinc-50 border-2 border-zinc-950 rounded-xl p-2.5 font-bold outline-none"
                >
                  <option value="J&T Express">J&T Express Malaysia</option>
                  <option value="Pos Laju">Pos Laju Malaysia</option>
                  <option value="Lalamove Rider">Lalamove Express Delivery</option>
                  <option value="Ninja Van">Ninja Van Malaysia</option>
                  <option value="DHL eCommerce">DHL eCommerce</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-950 font-black mb-1">Nombor Penjejakan (Tracking Number):</label>
                <input
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value.toUpperCase())}
                  placeholder="Cth: JNT-MY9021820 / ER882910291MY"
                  className="w-full bg-zinc-50 border-2 border-zinc-950 rounded-xl p-2.5 font-mono font-black text-xs outline-none focus:border-red-600"
                />
                <span className="text-[10px] text-zinc-600 font-bold block mt-1">
                  Biarkan kosong untuk menjana nombor rasmi secara automatik.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForShip(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-950 font-black hover:bg-zinc-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingShip}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmittingShip ? "Menyimpan..." : "Sahkan & Hantar"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CETAK AIRWAY BILL / SLIP THERMAL 4X6" */}
      {orderForAwb && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-4 border-zinc-950 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-black text-zinc-950">Slip Airway Bill (AWB 4x6" Thermal)</h3>
              </div>
              <button
                type="button"
                onClick={() => setOrderForAwb(null)}
                className="p-1 rounded-lg text-zinc-800 hover:text-zinc-950 hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Rekaan Slip Terma Format 4x6 Inci */}
            <div className="bg-white text-zinc-950 p-4 rounded-2xl border-2 border-zinc-950 font-mono text-xs space-y-3">
              <div className="border-b-2 border-zinc-950 pb-2 flex items-center justify-between">
                <div>
                  <span className="font-black text-sm tracking-tight block text-red-600">FF MOTOR (G ONE STOP ENT)</span>
                  <span className="text-[10px] text-zinc-800 font-bold block">Simpang 3 Kemboja, 06150 Jerlun, Kedah</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black px-2 py-0.5 bg-zinc-950 text-white rounded font-mono">
                    {orderForAwb.fulfillment === "delivery" ? "PARCEL KURIER" : "AMBIL KAUNTER"}
                  </span>
                </div>
              </div>

              {/* Barcode Simbolik */}
              <div className="text-center py-1">
                <div className="h-8 bg-zinc-950 mx-auto w-3/4 rounded flex items-center justify-center text-white text-[10px] font-mono tracking-widest font-black">
                  |||||| |||| ||||||| |||| ||||||
                </div>
                <span className="text-[11px] font-black tracking-widest mt-1 block">
                  {orderForAwb.trackingNumber || orderForAwb.id}
                </span>
              </div>

              {/* Penerima */}
              <div className="border-2 border-zinc-950 p-2.5 rounded-xl text-[11px] space-y-0.5">
                <span className="text-[9px] font-black uppercase text-zinc-600 block">PENERIMA:</span>
                <p className="font-black text-xs text-zinc-950">{orderForAwb.customerName}</p>
                <p className="font-bold text-zinc-800 font-mono">{orderForAwb.customerPhone}</p>
                <p className="text-zinc-800 font-bold leading-snug">
                  {orderForAwb.fulfillment === "delivery" ? (orderForAwb.address || "-") : "Ambil Sendiri di Cawangan Kemboja Jerlun"}
                </p>
              </div>

              {/* Kandungan Item */}
              <div className="text-[10px] space-y-1 border-b-2 border-zinc-200 pb-2">
                <span className="font-black uppercase text-zinc-700 block">Kandungan Pesanan Beg Kuning:</span>
                {(orderForAwb.lines || []).map((it, idx) => (
                  <div key={idx} className="flex justify-between font-bold">
                    <span>{it.quantity}x {it.title}</span>
                    <span className="font-mono text-zinc-950">RM {(it.quantity * it.unitPrice).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] font-black">
                <span>Jumlah Keseluruhan:</span>
                <span className="font-mono text-red-600">RM {orderForAwb.amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setOrderForAwb(null)}
                className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-950 font-black hover:bg-zinc-200"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Slip Thermal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: BUTIRAN LENGKAP & LOG PENJEJAKAN */}
      {orderForDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-4 border-zinc-950 p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" />
                <div>
                  <h3 className="text-base font-black text-zinc-950">Butiran Penuh Pesanan Beg Kuning</h3>
                  <span className="text-[11px] font-mono text-red-600 font-black">{orderForDetails.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOrderForDetails(null)}
                className="p-1 rounded-lg text-zinc-800 hover:text-zinc-950 hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Seksyen Pelanggan */}
              <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-300 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-zinc-950 block">Maklumat Pelanggan:</span>
                <div className="grid grid-cols-2 gap-2 font-bold">
                  <div>
                    <span className="text-zinc-800 font-bold block text-[10px]">Nama:</span>
                    <span className="text-zinc-950">{orderForDetails.customerName}</span>
                  </div>
                  <div>
                    <span className="text-zinc-800 font-bold block text-[10px]">Telefon:</span>
                    <span className="text-zinc-950 font-mono">{orderForDetails.customerPhone}</span>
                  </div>
                  <div>
                    <span className="text-zinc-800 font-bold block text-[10px]">Email:</span>
                    <span className="text-zinc-950">{orderForDetails.customerEmail || "-"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-800 font-bold block text-[10px]">Kaedah:</span>
                    <span className="text-red-600 uppercase font-black">
                      {orderForDetails.fulfillment === "delivery" ? "Kurier Delivery" : "Ambil di Bengkel"}
                    </span>
                  </div>
                </div>
                {orderForDetails.address && (
                  <div className="pt-1.5 border-t border-zinc-200">
                    <span className="text-zinc-800 font-bold block text-[10px]">Alamat Penghantaran:</span>
                    <span className="text-zinc-950 font-bold">{orderForDetails.address}</span>
                  </div>
                )}
              </div>

              {/* Seksyen Pecahan Item */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-zinc-950 block">Senarai Item Dipesan:</span>
                <div className="bg-zinc-50 rounded-2xl border border-zinc-300 p-3 space-y-2">
                  {(orderForDetails.lines || []).map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs pb-1.5 border-b border-zinc-200 last:border-0 last:pb-0 font-bold">
                      <div>
                        <span className="font-mono text-red-600 font-black mr-1">{it.quantity}x</span>
                        <span className="text-zinc-950">{it.title}</span>
                      </div>
                      <span className="font-mono text-zinc-950 font-black">
                        RM {(it.quantity * it.unitPrice).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t-2 border-zinc-950 font-black text-sm">
                    <span>Jumlah Keseluruhan:</span>
                    <span className="text-red-600 font-mono">RM {orderForDetails.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Seksyen Status & Audit Kerani */}
              <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-300 space-y-1.5 font-bold">
                <span className="text-[10px] font-black uppercase text-zinc-950 block">Audit & Status Terperinci:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-zinc-800 font-bold block text-[10px]">Status Terkini:</span>
                    <span className="font-black uppercase text-red-600">{orderForDetails.status}</span>
                  </div>
                  <div>
                    <span className="text-zinc-800 font-bold block text-[10px]">Didaftarkan Pada:</span>
                    <span className="font-mono text-zinc-950">{new Date(orderForDetails.createdAt).toLocaleString("ms-MY")}</span>
                  </div>
                  {orderForDetails.paidAt && (
                    <div>
                      <span className="text-zinc-800 font-bold block text-[10px]">Dibayar Pada:</span>
                      <span className="font-mono text-emerald-800">{new Date(orderForDetails.paidAt).toLocaleString("ms-MY")}</span>
                    </div>
                  )}
                  {orderForDetails.closedAt && (
                    <div>
                      <span className="text-zinc-800 font-bold block text-[10px]">Selesai / Ditutup:</span>
                      <span className="font-mono text-zinc-950">{new Date(orderForDetails.closedAt).toLocaleString("ms-MY")}</span>
                    </div>
                  )}
                  {orderForDetails.handledBy && (
                    <div>
                      <span className="text-zinc-800 font-bold block text-[10px]">Staf Bertugas:</span>
                      <span className="font-mono text-zinc-950">{orderForDetails.handledBy}</span>
                    </div>
                  )}
                  {orderForDetails.updatedAt && (
                    <div>
                      <span className="text-zinc-800 font-bold block text-[10px]">Kemaskini Terakhir:</span>
                      <span className="font-mono text-zinc-950">{new Date(orderForDetails.updatedAt).toLocaleString("ms-MY")}</span>
                    </div>
                  )}
                </div>

                {orderForDetails.paymentNote && (
                  <div className="pt-1.5 border-t border-zinc-200">
                    <span className="text-zinc-800 font-bold block text-[10px]">Rujukan Bayaran:</span>
                    <span className="text-emerald-800 font-black">{orderForDetails.paymentNote}</span>
                  </div>
                )}

                {orderForDetails.rejectReason && (
                  <div className="pt-1.5 border-t border-zinc-200">
                    <span className="text-zinc-800 font-bold block text-[10px]">Sebab Penolakan:</span>
                    <span className="text-red-600 font-black">{orderForDetails.rejectReason}</span>
                  </div>
                )}
              </div>

              {/* Seksyen Garis Masa Penjejakan (Tracking History) */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-zinc-950 block">Garis Masa Penjejakan (Tracking History):</span>
                {(() => {
                  let history: TrackingHistoryEvent[] = [];
                  try {
                    if (Array.isArray(orderForDetails.trackingHistory)) {
                      history = orderForDetails.trackingHistory;
                    } else if (typeof orderForDetails.trackingHistory === "string") {
                      history = JSON.parse(orderForDetails.trackingHistory);
                    }
                  } catch {}

                  if (history.length === 0) {
                    return (
                      <p className="text-zinc-800 text-[11px] p-2 bg-zinc-50 rounded-xl border border-zinc-200 font-bold">
                        Tiada rekod garis masa penjejakan.
                      </p>
                    );
                  }

                  return (
                    <div className="space-y-1.5 bg-zinc-50 p-3 rounded-2xl border border-zinc-300">
                      {history.map((ev, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[11px] pb-1.5 border-b border-zinc-200 last:border-0 last:pb-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="font-black uppercase text-zinc-950 block">{ev.status}</span>
                            <span className="text-zinc-900 font-bold block">{ev.note || (ev.trackingNumber ? `No. Tracking: ${ev.trackingNumber}` : "-")}</span>
                            <span className="text-[9px] font-mono text-zinc-800 font-bold block">{ev.timestamp ? new Date(ev.timestamp).toLocaleString("ms-MY") : "-"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setOrderForDetails(null)}
                className="px-4 py-2 rounded-xl bg-zinc-950 text-white font-black hover:bg-zinc-800 cursor-pointer"
              >
                Tutup Paparan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
