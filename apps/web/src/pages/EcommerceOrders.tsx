import React, { useState, useEffect } from "react";
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
  ShoppingBag
} from "lucide-react";

export interface EcommerceOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerState: string;
  deliveryMethod: "courier" | "pickup";
  shippingCarrier?: string;
  trackingNumber?: string;
  shippingCost: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: "paid" | "pending";
  orderStatus: "processing" | "ready_to_ship" | "shipped" | "delivered" | "pickup_ready";
  weightKg: number;
  awbPrinted: boolean;
  notes?: string;
  items: {
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

const INITIAL_ORDERS: EcommerceOrder[] = [
  {
    id: "ord-1",
    orderNumber: "FFM-ORD-8821",
    orderDate: "22/09/2026 08:30 AM",
    customerName: "Kamal Ariffin Bin Yusof",
    customerPhone: "60198823120",
    customerAddress: "No. 45, Jalan Seri Impian 3, Taman Mergong Indah, 05150 Alor Setar, Kedah",
    customerState: "Kedah",
    deliveryMethod: "courier",
    shippingCarrier: "J&T Express",
    trackingNumber: "JNT-MY601928312",
    shippingCost: 8.50,
    totalAmount: 228.50,
    paymentMethod: "DuitNow QR FPX (Maybank)",
    paymentStatus: "paid",
    orderStatus: "processing",
    weightKg: 1.8,
    awbPrinted: false,
    notes: "Tolong balut bubble wrap tebal sikit bos.",
    items: [
      { sku: "MOTUL-7100-10W40", name: "Minyak Enjin Motul 7100 4T 10W-40 (1L)", quantity: 2, unitPrice: 65, total: 130 },
      { sku: "OIL-FILTER-Y15", name: "Penapis Minyak Yamaha Original Y15ZR/NVX", quantity: 2, unitPrice: 15, total: 30 },
      { sku: "SPARK-NGK-CPR8", name: "Palam Pencucuh NGK Iridium CPR8EA-9", quantity: 1, unitPrice: 60, total: 60 },
    ],
  },
  {
    id: "ord-2",
    orderNumber: "FFM-ORD-8822",
    orderDate: "22/09/2026 09:10 AM",
    customerName: "Mohd Danial Syahir",
    customerPhone: "60175549021",
    customerAddress: "Lot 120, Kampung Telok Chengai, Jalan Kuala Kedah, 06600 Alor Setar, Kedah",
    customerState: "Kedah",
    deliveryMethod: "courier",
    shippingCarrier: "Pos Laju",
    trackingNumber: "ER902838192MY",
    shippingCost: 12.00,
    totalAmount: 342.00,
    paymentMethod: "Kad Kredit / Debit Online",
    paymentStatus: "paid",
    orderStatus: "ready_to_ship",
    weightKg: 2.5,
    awbPrinted: true,
    items: [
      { sku: "BELT-NVX-ORIG", name: "V-Belt Transmisi CVT Yamaha NVX 155 V2 (Original B63)", quantity: 1, unitPrice: 160, total: 160 },
      { sku: "ROLLER-DRP-12G", name: "Dr.Pulley Sliding Roller 12 Gram NVX/NMAX", quantity: 1, unitPrice: 95, total: 95 },
      { sku: "SLIDER-CVT-B63", name: "Slider Piece Mangkuk CVT (Set 3 Biji)", quantity: 1, unitPrice: 25, total: 25 },
      { sku: "GREASE-CVT-YMH", name: "Yamaha High Temp CVT Grease (40g)", quantity: 2, unitPrice: 25, total: 50 },
    ],
  },
  {
    id: "ord-3",
    orderNumber: "FFM-ORD-8823",
    orderDate: "21/09/2026 04:45 PM",
    customerName: "Farid Ridzuan",
    customerPhone: "60124981123",
    customerAddress: "Ambil Sendiri di Cawangan (Bay Lif No. 2 Mergong)",
    customerState: "Kedah",
    deliveryMethod: "pickup",
    shippingCost: 0,
    totalAmount: 480.00,
    paymentMethod: "Deposit Tempahan DuitNow (Baki di Kaunter)",
    paymentStatus: "paid",
    orderStatus: "pickup_ready",
    weightKg: 4.2,
    awbPrinted: false,
    notes: "Pelanggan minta simpan barang di stor kaunter sampai Sabtu.",
    items: [
      { sku: "TYRE-CORSA-110", name: "Tayar Corsa Platinum R26 110/70-17 Tubeless", quantity: 1, unitPrice: 195, total: 195 },
      { sku: "TYRE-CORSA-140", name: "Tayar Corsa Platinum R26 140/70-17 Tubeless", quantity: 1, unitPrice: 285, total: 285 },
    ],
  },
  {
    id: "ord-4",
    orderNumber: "FFM-ORD-8824",
    orderDate: "21/09/2026 02:15 PM",
    customerName: "Ahmad Zaki Bin Roslan",
    customerPhone: "60136652019",
    customerAddress: "No. 18, Lorong Merpati 2, Taman Ria Jaya, 08000 Sungai Petani, Kedah",
    customerState: "Kedah",
    deliveryMethod: "courier",
    shippingCarrier: "J&T Express",
    trackingNumber: "JNT-MY992019482",
    shippingCost: 10.00,
    totalAmount: 195.00,
    paymentMethod: "DuitNow QR FPX",
    paymentStatus: "paid",
    orderStatus: "shipped",
    weightKg: 1.2,
    awbPrinted: true,
    items: [
      { sku: "BRAKE-RCB-E2", name: "Master Brake Pump RCB E2 14mm Kanan (Hitam)", quantity: 1, unitPrice: 185, total: 185 },
    ],
  },
  {
    id: "ord-5",
    orderNumber: "FFM-ORD-8825",
    orderDate: "20/09/2026 11:20 AM",
    customerName: "Siti Salmah Binti Hamid",
    customerPhone: "60194120938",
    customerAddress: "No. 7, Jalan Gangsa 4, Kawasan Perindustrian Mergong 2, 05150 Alor Setar, Kedah",
    customerState: "Kedah",
    deliveryMethod: "courier",
    shippingCarrier: "Lalamove Rider",
    trackingNumber: "LLM-KL-40912",
    shippingCost: 15.00,
    totalAmount: 165.00,
    paymentMethod: "Online Banking FPX",
    paymentStatus: "paid",
    orderStatus: "delivered",
    weightKg: 1.0,
    awbPrinted: true,
    items: [
      { sku: "BATTERY-KOYOKO-7", name: "Bateri Gel Koyoko Nano-Gel YTZ7S (12V 6Ah)", quantity: 1, unitPrice: 95, total: 95 },
      { sku: "CHARGER-USB-RCB", name: "RCB Fast Charging Dual USB Port Waterproof", quantity: 1, unitPrice: 55, total: 55 },
    ],
  },
];

export const EcommerceOrders: React.FC = () => {
  const [orders, setOrders] = useState<EcommerceOrder[]>(INITIAL_ORDERS);
  const [filterTab, setFilterTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/desk/shop/orders")
      .then((res) => res.json())
      .then((d) => {
        if (d.success && d.orders && d.orders.length > 0) {
          const mapped: EcommerceOrder[] = d.orders.map((o: any) => ({
            id: o.id,
            orderNumber: o.orderNumber || o.id,
            orderDate: o.createdAt ? new Date(o.createdAt).toLocaleString("ms-MY") : "Hari ini",
            customerName: o.customerName || "Pelanggan Online",
            customerPhone: o.customerPhone || "0123456789",
            customerAddress: o.address || "Ambil di Cawangan Mergong",
            customerState: "Kedah",
            deliveryMethod: o.fulfillment === "delivery" ? "courier" : "pickup",
            shippingCarrier: o.shippingCarrier || "J&T Express",
            trackingNumber: o.trackingNumber,
            shippingCost: 0,
            totalAmount: Number(o.totalAmount || 0),
            paymentMethod: "DuitNow QR FPX",
            paymentStatus: o.status === "sudah_bayar" ? "paid" : "pending",
            orderStatus: o.trackingNumber ? "shipped" : o.fulfillment === "pickup" ? "pickup_ready" : "processing",
            weightKg: 1.5,
            awbPrinted: false,
            items: o.lines?.map((l: any) => ({
              sku: l.subjectId || "ITEM",
              name: l.title || "Produk FFmotor",
              quantity: l.quantity || 1,
              unitPrice: Number(l.unitPrice || 0),
              total: (l.quantity || 1) * Number(l.unitPrice || 0),
            })) || [],
          }));
          setOrders((prev) => {
            const existingIds = new Set(mapped.map((m) => m.id));
            const remainingInitial = prev.filter((p) => !existingIds.has(p.id));
            return [...mapped, ...remainingInitial];
          });
        }
      })
      .catch(() => null);
  }, []);
  
  // Selected Order for Shipping Modal
  const [selectedOrderForShip, setSelectedOrderForShip] = useState<EcommerceOrder | null>(null);
  const [carrierInput, setCarrierInput] = useState("J&T Express");
  const [trackingInput, setTrackingInput] = useState("");
  const [weightInput, setWeightInput] = useState("1.5");

  // AWB Modal
  const [orderForAwb, setOrderForAwb] = useState<EcommerceOrder | null>(null);

  // Filter List
  const filteredOrders = orders.filter((ord) => {
    const matchSearch =
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerPhone.includes(searchQuery) ||
      (ord.trackingNumber && ord.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchSearch) return false;
    if (filterTab === "all") return true;
    if (filterTab === "processing") return ord.orderStatus === "processing";
    if (filterTab === "ready_to_ship") return ord.orderStatus === "ready_to_ship";
    if (filterTab === "shipped") return ord.orderStatus === "shipped";
    if (filterTab === "delivered") return ord.orderStatus === "delivered";
    if (filterTab === "pickup") return ord.deliveryMethod === "pickup";
    return true;
  });

  // Kiraan Ringkasan
  const countProcessing = orders.filter((o) => o.orderStatus === "processing").length;
  const countReady = orders.filter((o) => o.orderStatus === "ready_to_ship").length;
  const countShipped = orders.filter((o) => o.orderStatus === "shipped").length;
  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Fungsi Kemaskini Shipping
  const handleSaveShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForShip) return;

    const updatedTracking = trackingInput || `JNT-MY${Math.floor(100000000 + Math.random() * 900000000)}`;

    try {
      await fetch(`/api/desk/shop/orders/${selectedOrderForShip.id}/ship`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber: updatedTracking }),
      }).catch(() => null);
    } catch {}

    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrderForShip.id
          ? {
              ...o,
              shippingCarrier: carrierInput,
              trackingNumber: updatedTracking,
              weightKg: parseFloat(weightInput) || o.weightKg,
              orderStatus: "shipped",
            }
          : o
      )
    );

    alert(`Pesanan ${selectedOrderForShip.orderNumber} telah dikemaskini sebagai 'SEDANG DIHANTAR'!\nKurier: ${carrierInput}\nNo. Tracking: ${updatedTracking}`);
    setSelectedOrderForShip(null);
  };

  // Fungsi Buka WhatsApp Tracking
  const handleSendWhatsAppTracking = (ord: EcommerceOrder) => {
    if (!ord.trackingNumber) {
      alert("Sila masukkan nombor tracking terlebih dahulu.");
      return;
    }

    const carrierLink = ord.shippingCarrier?.toLowerCase().includes("j&t")
      ? `https://www.jtexpress.my/tracking?bills=${ord.trackingNumber}`
      : `https://tracking.pos.com.my/tracking-details?trackingNo=${ord.trackingNumber}`;

    const text = encodeURIComponent(
      `Salam hormat ${ord.customerName},\n\n` +
      `Pesanan E-Commerce FF MOTORSPORT anda (*${ord.orderNumber}*) telah selesai dibungkus dan diserahkan kepada syarikat kurier *${ord.shippingCarrier || "J&T Express"}*.\n\n` +
      `📦 *No. Tracking*: ${ord.trackingNumber}\n` +
      `🔗 *Pautan Jejak*: ${carrierLink}\n\n` +
      `Alamat Penghantaran:\n${ord.customerAddress}\n\n` +
      `Terima kasih kerana membeli alat ganti tulen di FFmotor Cawangan Mergong Kedah!`
    );

    window.open(`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, "")}?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Utama */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold">
            <span>FFmotor HQ</span>
            <span>/</span>
            <span className="text-red-500 font-black">E-Commerce & Logistik Kurier</span>
          </nav>
          <h1 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tight mt-1 flex items-center gap-2">
            <Truck className="w-6 h-6 text-red-500" />
            <span>Pengurusan Pesanan E-Commerce & Shipping</span>
          </h1>
          <p className="text-xs text-zinc-400">
            Pesanan alat ganti online, cetak Airway Bill (AWB 4x6 Thermal), selaras kurier J&T / PosLaju, dan auto-dispatch WhatsApp tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const newOrd: EcommerceOrder = {
                id: `ord-${Date.now()}`,
                orderNumber: `FFM-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
                orderDate: new Date().toLocaleString("ms-MY"),
                customerName: "Pelanggan Walk-In Online",
                customerPhone: "60123456789",
                customerAddress: "Kaunter POS Stesen Mergong",
                customerState: "Kedah",
                deliveryMethod: "courier",
                shippingCost: 8.0,
                totalAmount: 145.0,
                paymentMethod: "DuitNow QR",
                paymentStatus: "paid",
                orderStatus: "processing",
                weightKg: 1.0,
                awbPrinted: false,
                items: [
                  { sku: "MOTUL-3100-GOLD", name: "Motul 3100 Gold 4T 10W-40 (1L)", quantity: 2, unitPrice: 38, total: 76 },
                  { sku: "PLUG-BOSCH-UR2CC", name: "Palam Pencucuh Bosch Double Platinum", quantity: 1, unitPrice: 69, total: 69 },
                ],
              };
              setOrders([newOrd, ...orders]);
              alert(`Pesanan demo ${newOrd.orderNumber} berjaya ditambah ke senarai bungkusan!`);
            }}
            className="spike-btn-red text-xs py-2.5 px-4 flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>+ Pesanan Baharu</span>
          </button>
        </div>
      </div>

      {/* Kad Metrik Pantas Logistik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="spike-card p-4 flex items-center justify-between group hover:border-red-600 transition">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              Perlu Dibungkus
            </span>
            <span className="text-2xl font-black text-red-500 mt-1 block font-mono">
              {countProcessing} Pakej
            </span>
            <span className="text-[10px] text-zinc-500">Stok sedia di rak stor</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="spike-card p-4 flex items-center justify-between group hover:border-red-600 transition">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              Sedia Untuk Pos
            </span>
            <span className="text-2xl font-black text-zinc-900 mt-1 block font-mono">
              {countReady} Pakej
            </span>
            <span className="text-[10px] text-zinc-500">AWB sudah dicetak</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center ">
            <Printer className="w-5 h-5" />
          </div>
        </div>

        <div className="spike-card p-4 flex items-center justify-between group hover:border-red-600 transition">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              Dalam Penghantaran
            </span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block font-mono">
              {countShipped} Pakej
            </span>
            <span className="text-[10px] text-zinc-500">Dalam van kurier</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-400">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="spike-card p-4 flex items-center justify-between group hover:border-red-600 transition">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              Nilai Jualan Online
            </span>
            <span className="text-2xl font-black text-zinc-900 mt-1 block font-mono">
              RM {totalSales.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">● 100% Bayaran Sah</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Bar Carian & Tab Penapis */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 spike-card p-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilterTab("all")}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterTab === "all"
                ? "spike-btn-red text-xs py-1.5 px-3"
                : "text-zinc-400 hover:text-red-600 bg-white border border-zinc-200"
            }`}
          >
            Semua ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("processing")}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterTab === "processing"
                ? "spike-btn-red text-xs py-1.5 px-3"
                : "text-zinc-400 hover:text-red-600 bg-white border border-zinc-200"
            }`}
          >
            Perlu Dibungkus ({countProcessing})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("ready_to_ship")}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterTab === "ready_to_ship"
                ? "spike-btn-red text-xs py-1.5 px-3"
                : "text-zinc-400 hover:text-red-600 bg-white border border-zinc-200"
            }`}
          >
            Sedia Pos ({countReady})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("shipped")}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterTab === "shipped"
                ? "spike-btn-red text-xs py-1.5 px-3"
                : "text-zinc-400 hover:text-red-600 bg-white border border-zinc-200"
            }`}
          >
            Dihantar ({countShipped})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("pickup")}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterTab === "pickup"
                ? "spike-btn-red text-xs py-1.5 px-3"
                : "text-zinc-400 hover:text-red-600 bg-white border border-zinc-200"
            }`}
          >
            Ambil di Bengkel ({orders.filter((o) => o.deliveryMethod === "pickup").length})
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari no. order, nama, tracking..."
            className="w-full bg-white border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:border-red-500 outline-none font-mono"
          />
        </div>
      </div>

      {/* Jadual Senarai Pesanan E-Commerce */}
      <div className="spike-card overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-white text-[11px] uppercase font-bold text-zinc-400">
                <th className="py-3 px-4">No. Order & Tarikh</th>
                <th className="py-3 px-4">Pelanggan & Alamat</th>
                <th className="py-3 px-4">Item Dipesan</th>
                <th className="py-3 px-4">Jumlah & Bayaran</th>
                <th className="py-3 px-4">Status & Kurier</th>
                <th className="py-3 px-4 text-right">Tindakan Shipping</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>Tiada rekod pesanan e-commerce dijumpai.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const isCourier = ord.deliveryMethod === "courier";
                  return (
                    <tr key={ord.id} className="hover:bg-zinc-50 transition">
                      {/* No Order & Tarikh */}
                      <td className="py-3.5 px-4 align-top">
                        <span className="font-mono font-bold text-red-500 block text-xs">
                          {ord.orderNumber}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          {ord.orderDate}
                        </span>
                        <span className="inline-block mt-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-white text-zinc-300 border border-zinc-200">
                          {ord.weightKg} kg
                        </span>
                      </td>

                      {/* Pelanggan & Alamat */}
                      <td className="py-3.5 px-4 align-top max-w-[260px]">
                        <span className="font-bold text-zinc-900 block truncate">
                          {ord.customerName}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-zinc-500" />
                          {ord.customerPhone}
                        </span>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-snug">
                          {ord.customerAddress}
                        </p>
                        {ord.notes && (
                          <span className="text-[10px] text-red-400 italic block mt-1">
                            💬 "{ord.notes}"
                          </span>
                        )}
                      </td>

                      {/* Item Dipesan */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[11px] gap-2">
                              <span className="text-zinc-300 truncate max-w-[180px]">
                                <span className="font-bold font-mono">{it.quantity}x</span> {it.name}
                              </span>
                              <span className="font-mono text-zinc-400 shrink-0">
                                RM{it.total.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Jumlah & Bayaran */}
                      <td className="py-3.5 px-4 align-top">
                        <span className="font-black text-zinc-900 text-sm font-mono block">
                          RM {ord.totalAmount.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {ord.paymentMethod.split(" ")[0]} Lunas
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          Pos: RM{ord.shippingCost.toFixed(2)}
                        </span>
                      </td>

                      {/* Status & Kurier */}
                      <td className="py-3.5 px-4 align-top">
                        {ord.orderStatus === "processing" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600/20 text-red-400 border border-red-500/30 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 animate-spin" />
                            Perlu Bungkus
                          </span>
                        )}
                        {ord.orderStatus === "ready_to_ship" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-black font-black inline-flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            Sedia Pos
                          </span>
                        )}
                        {ord.orderStatus === "shipped" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-400 border border-emerald-200 inline-flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            Sedang Dihantar
                          </span>
                        )}
                        {ord.orderStatus === "delivered" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-zinc-300 border border-zinc-200 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Selesai Sampai
                          </span>
                        )}
                        {ord.orderStatus === "pickup_ready" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 border border-zinc-700 inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Sedia di Kaunter
                          </span>
                        )}

                        <div className="mt-1.5">
                          {isCourier ? (
                            <div className="text-[11px] font-mono">
                              <span className="text-zinc-300 font-bold block">{ord.shippingCarrier || "J&T Express"}</span>
                              {ord.trackingNumber ? (
                                <span className="text-red-400 font-bold underline cursor-pointer block truncate" title="Klik untuk jejak">
                                  {ord.trackingNumber}
                                </span>
                              ) : (
                                <span className="text-zinc-500 text-[10px]">Belum ada tracking</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-zinc-300 font-bold block">
                              Ambil Sendiri di Bengkel
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Butang Tindakan */}
                      <td className="py-3.5 px-4 align-top text-right space-y-1.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrderForShip(ord);
                              setCarrierInput(ord.shippingCarrier || "J&T Express");
                              setTrackingInput(ord.trackingNumber || "");
                              setWeightInput(String(ord.weightKg || "1.5"));
                            }}
                            className="p-1.5 rounded-lg bg-white hover:bg-zinc-800 text-zinc-200 border border-zinc-200 text-xs transition"
                            title="Uruskan Kurier & No. Tracking"
                          >
                            <Truck className="w-3.5 h-3.5 text-red-500" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setOrderForAwb(ord)}
                            className="p-1.5 rounded-lg bg-white hover:bg-zinc-800 text-zinc-200 border border-zinc-200 text-xs transition"
                            title="Cetak Airway Bill (AWB 4x6 Thermal)"
                          >
                            <Printer className="w-3.5 h-3.5 " />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSendWhatsAppTracking(ord)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-zinc-800/30 text-emerald-400 border border-emerald-200 text-xs transition"
                            title="Hantar WhatsApp Tracking ke Pelanggan"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {ord.awbPrinted && (
                          <span className="text-[9px] text-emerald-400 font-mono block">
                            ✓ AWB Dicetak
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: URUSKAN SHIPPING / ISI TRACKING */}
      {selectedOrderForShip && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="spike-card max-w-lg w-full p-6 shadow-none space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-zinc-900">Uruskan Penghantaran Kurier</h3>
                  <p className="text-xs text-red-400 font-mono">{selectedOrderForShip.orderNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForShip(null)}
                className="text-zinc-400 hover:text-red-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShipping} className="space-y-4 text-xs">
              <div className="p-3 bg-white rounded-xl border border-zinc-200 space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Penerima:</span>
                <p className="font-bold ">{selectedOrderForShip.customerName} ({selectedOrderForShip.customerPhone})</p>
                <p className="text-[11px] text-zinc-400">{selectedOrderForShip.customerAddress}</p>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Pilih Syarikat Kurier / Logistik:</label>
                <select
                  value={carrierInput}
                  onChange={(e) => setCarrierInput(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 font-bold outline-none focus:border-red-500"
                >
                  <option value="J&T Express">J&T Express (Standard Parcel)</option>
                  <option value="Pos Laju">Pos Laju Malaysia</option>
                  <option value="Lalamove Rider">Lalamove Instant Delivery (Motor / Van)</option>
                  <option value="NinjaVan">NinjaVan Malaysia</option>
                  <option value="DHL eCommerce">DHL eCommerce</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">No. Tracking / Resit Pos:</label>
                  <input
                    type="text"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder="Cth: JNT-MY9021820"
                    className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 font-mono text-xs outline-none focus:border-red-500"
                  />
                  <span className="text-[9px] text-zinc-500">Kosongkan untuk auto-jana nombor demo</span>
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Berat Bungkusan (KG):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 font-mono text-xs outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForShip(null)}
                  className="spike-btn-dark py-2 px-4 text-xs text-zinc-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="spike-btn-red text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Sahkan & Tukar ke 'Dihantar'</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CETAK AIRWAY BILL (AWB THERMAL 4X6 INCI) */}
      {orderForAwb && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="spike-card max-w-md w-full p-6 shadow-none space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 " />
                <h3 className="text-base font-black text-zinc-900">Slip Penghantaran / AWB Thermal (4x6")</h3>
              </div>
              <button
                type="button"
                onClick={() => setOrderForAwb(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Rekaan Slip AWB Format Kertas Thermal Putih */}
            <div className="bg-white text-zinc-900 p-4 rounded-xl border-2 border-dashed border-zinc-400 font-mono text-xs space-y-3">
              {/* Header Slip */}
              <div className="border-b-2 border-zinc-900 pb-2 flex items-center justify-between">
                <div>
                  <span className="font-black text-sm tracking-tight block text-red-600">FF MOTORSPORT 3S</span>
                  <span className="text-[10px] text-zinc-600 block">Kawasan Perindustrian Mergong, Kedah</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black px-2 py-0.5 bg-black text-white rounded">
                    {orderForAwb.shippingCarrier || "J&T"}
                  </span>
                  <span className="text-[10px] block mt-0.5 font-bold">PARCEL DOMESTIK</span>
                </div>
              </div>

              {/* Barcode Mock */}
              <div className="text-center py-1">
                <div className="h-10 bg-black mx-auto w-3/4 rounded flex items-center justify-center text-white text-[10px] font-bold tracking-widest font-mono">
                  ||||| | |||| || ||||| |||| | ||||
                </div>
                <span className="text-[11px] font-black tracking-widest mt-1 block">
                  {orderForAwb.trackingNumber || "JNT-MY601928312"}
                </span>
              </div>

              {/* Penerima */}
              <div className="border-2 border-black p-2 rounded text-[11px] space-y-0.5">
                <span className="text-[9px] font-bold uppercase text-zinc-500 block">KEPADA PENERIMA:</span>
                <p className="font-black text-xs text-zinc-900">{orderForAwb.customerName}</p>
                <p className="font-bold text-zinc-700">{orderForAwb.customerPhone}</p>
                <p className="text-zinc-700 leading-snug">{orderForAwb.customerAddress}</p>
              </div>

              {/* Senarai Kandungan */}
              <div className="text-[10px] space-y-1 border-b border-zinc-300 pb-2">
                <span className="font-bold uppercase text-zinc-600 block">Kandungan Bungkusan:</span>
                {orderForAwb.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{it.quantity}x {it.name}</span>
                    <span className="font-bold text-red-600">✓</span>
                  </div>
                ))}
              </div>

              {/* Footer AWB */}
              <div className="flex items-center justify-between text-[10px]">
                <span>Berat: <b>{orderForAwb.weightKg} KG</b></span>
                <span>Bayaran: <b>PREPAID (LUNAS)</b></span>
              </div>
            </div>

            {/* Butang Tindakan Cetak */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOrderForAwb(null)}
                className="spike-btn-dark py-2 px-4 text-xs text-zinc-300"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  setOrders((prev) =>
                    prev.map((o) => (o.id === orderForAwb.id ? { ...o, awbPrinted: true } : o))
                  );
                  alert(`Pencetak Terma 4x6": Slip AWB untuk pesanan ${orderForAwb.orderNumber} berjaya dihantar ke pencetak!`);
                  setOrderForAwb(null);
                }}
                className="spike-btn-red text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak AWB Thermal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

