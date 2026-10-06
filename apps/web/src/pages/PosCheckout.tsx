import React, { useState } from "react";
import {
  ShoppingCart,
  DollarSign,
  QrCode,
  CreditCard,
  Printer,
  Trash2,
  Plus,
  Minus,
  Search,
  CheckCircle2,
  Receipt,
  Sparkles,
  RotateCcw,
  ArrowRight,
  Coins,
  Banknote,
  X,
  History,
  ArrowLeftRight,
  RefreshCw,
  Tag,
  Wrench,
  FileText,
  Check
} from "lucide-react";
import { Product, WorkOrder } from "../types";
import { getPartImage } from "../utils/spikeAssets";

const LABOR_RATES: { name: string; rate: number; category: string }[] = [
  { name: 'Servis Minyak & Penapis', rate: 10, category: 'Servis Biasa' },
  { name: 'Cuci Karburator / Injeksi', rate: 25, category: 'Servis Biasa' },
  { name: 'Tukar Tayar Hadapan', rate: 12, category: 'Tayar' },
  { name: 'Tukar Tayar Belakang', rate: 15, category: 'Tayar' },
  { name: 'Tukar Pad Brek Hadapan', rate: 15, category: 'Brek' },
  { name: 'Tukar Pad Brek Belakang', rate: 15, category: 'Brek' },
  { name: 'Tukar Rantai & Gear', rate: 20, category: 'Rantai' },
  { name: 'Overhaul Enjin Ringan', rate: 120, category: 'Enjin' },
  { name: 'Top Overhaul', rate: 180, category: 'Enjin' },
  { name: 'Tukar Bateri', rate: 8, category: 'Elektrik' },
  { name: 'Tukar Mentol Lampu', rate: 5, category: 'Elektrik' },
  { name: 'Repair Kelistrikan', rate: 45, category: 'Elektrik' },
];

interface PosCheckoutProps {
  products: Product[];
  workOrders?: WorkOrder[];
  onRefreshProducts?: () => void;
  onRefreshWorkOrders?: () => void;
  onGoToWorkOrders?: () => void;
}

interface CartItem {
  product: Product;
  qty: number;
}

interface ExchangeRecord {
  id: string;
  receiptNo: string;
  date: string;
  customerPhone: string;
  returnedItem: string;
  returnedValue: number;
  newItem: string;
  newValue: number;
  difference: number;
  reason: string;
  cashier: string;
}

const DIALECT_ALIASES: Record<string, string[]> = {
  matgat: ["mudguard", "fender", "papan lumpur", "cover"],
  mudguard: ["matgat", "fender"],
  mangkuk: ["clutch", "bell", "housing", "klac"],
  "tali sawat": ["belt", "v-belt", "belting"],
  belting: ["belt", "v-belt", "tali sawat"],
  "batu api": ["plug", "spark", "spark plug"],
  plug: ["spark plug", "ngk", "iridium", "batu api"],
  "getah hub": ["damper", "cushion"],
  "getah damper": ["damper", "cushion", "hub"],
  spoket: ["sprocket", "chain", "rantai"],
  rantai: ["chain", "sprocket", "spoket"],
  minyak: ["yamalube", "motul", "oil", "pelincir"],
  tayar: ["tyre", "tire", "maxxis", "corsa", "tubeless"],
};

export function matchesDialect(product: Product, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (product.name.toLowerCase().includes(q)) return true;
  if (product.sku && product.sku.toLowerCase().includes(q)) return true;
  if (product.aliases && product.aliases.some((a) => a.toLowerCase().includes(q))) return true;

  // Semak kamus dialek
  for (const [dialectWord, realTerms] of Object.entries(DIALECT_ALIASES)) {
    if (q.includes(dialectWord)) {
      if (
        realTerms.some(
          (term) =>
            product.name.toLowerCase().includes(term) ||
            (product.sku && product.sku.toLowerCase().includes(term))
        )
      ) {
        return true;
      }
    }
  }
  return false;
}

export const PosCheckout: React.FC<PosCheckoutProps> = ({
  products,
  workOrders = [],
  onRefreshProducts,
  onRefreshWorkOrders,
  onGoToWorkOrders,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDialectTag, setActiveDialectTag] = useState<string>("all");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qr" | "card">("cash");
  const [cashTendered, setCashTendered] = useState<string>("");
  const [customerDeposit, setCustomerDeposit] = useState<string>("");
  const [duitNowRef, setDuitNowRef] = useState<string>("");
  const [completedReceipt, setCompletedReceipt] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLaborModalOpen, setIsLaborModalOpen] = useState(false);

  // Tarik Bil Servis Motosikal dari Lantai Pit
  const [isServiceBillOpen, setIsServiceBillOpen] = useState(false);
  const [serviceSearchPlate, setServiceSearchPlate] = useState("");
  const [selectedServiceWo, setSelectedServiceWo] = useState<WorkOrder | null>(null);
  const [servicePayMethod, setServicePayMethod] = useState<"cash" | "qr" | "card">("cash");
  const [serviceCashTendered, setServiceCashTendered] = useState("");
  const [isPayingServiceWo, setIsPayingServiceWo] = useState(false);

  const unpaidServiceOrders = workOrders.filter(
    (w) => w.paymentStatus === "unpaid" && w.status !== "cancelled"
  );

  const filteredServiceOrders = unpaidServiceOrders.filter((w) => {
    if (!serviceSearchPlate.trim()) return true;
    const term = serviceSearchPlate.toLowerCase().replace(/\s+/g, "");
    const plate = (w.plateNumber || "").toLowerCase().replace(/\s+/g, "");
    const owner = (w.ownerName || "").toLowerCase();
    const woNum = (w.woNumber || "").toLowerCase();
    return plate.includes(term) || owner.includes(term) || woNum.includes(term);
  });

  const handlePayServiceWorkOrder = async (wo: WorkOrder) => {
    setIsPayingServiceWo(true);
    const methodStr = servicePayMethod === "cash" ? "Tunai" : servicePayMethod === "qr" ? "DuitNow QR" : "Kad Debit/Kredit";
    const amount = wo.grandTotal || 0;
    const cashNum = parseFloat(serviceCashTendered) || amount;
    const change = Math.max(0, cashNum - amount);

    try {
      const res = await fetch(`/api/work-orders/${wo.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: methodStr }),
      });
      const data = await res.json();
      if (data.success) {
        const receiptData = {
          receiptNo: `REC-WO-${wo.woNumber.replace(/[^0-9]/g, "").slice(-4) || Date.now().toString().slice(-4)}`,
          time: new Date().toLocaleString("ms-MY"),
          items: [
            {
              qty: 1,
              product: {
                name: `Servis Motosikal: ${wo.plateNumber || "Motosikal"} (${wo.brand || ""} ${wo.model || ""})`,
                sellingPrice: amount,
              },
            },
          ],
          subtotal: amount,
          depositPaid: 0,
          grandTotal: amount,
          paymentMethod: servicePayMethod,
          duitNowRef: servicePayMethod === "qr" ? "DISAHKAN" : null,
          cashTendered: servicePayMethod === "cash" ? cashNum : amount,
          changeDue: servicePayMethod === "cash" ? change : 0,
          cashier: "Kerani Kaunter POS",
          woNumber: wo.woNumber,
          plateNumber: wo.plateNumber,
        };

        setCompletedReceipt(receiptData);
        setSelectedServiceWo(null);
        setIsServiceBillOpen(false);
        if (onRefreshWorkOrders) onRefreshWorkOrders();
      } else {
        alert("Ralat memproses bayaran: " + (data.message || "Gagal"));
      }
    } catch (err: any) {
      alert("Ralat rangkaian: " + err.message);
    } finally {
      setIsPayingServiceWo(false);
    }
  };

  // Petty Cash (Duit Keluar Kaunter)
  const [isPettyCashOpen, setIsPettyCashOpen] = useState(false);
  const [pettyCashAmount, setPettyCashAmount] = useState("");
  const [pettyCashReason, setPettyCashReason] = useState("Petrol Test Ride");
  const [pettyCashPerson, setPettyCashPerson] = useState("Sifu Halim");
  const [pettyCashRecords, setPettyCashRecords] = useState<Array<{ id: string; time: string; amount: number; reason: string; person: string }>>([]);

  const totalPettyCashOut = pettyCashRecords.reduce((sum, r) => sum + r.amount, 0);
  const drawerFloat = 300; // Float pagi tunai
  const currentDrawerCash = drawerFloat - totalPettyCashOut;

  // Customer Exchange & Return (Tukar Saiz / Pulangan Barang)
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [exchangeReceiptNo, setExchangeReceiptNo] = useState("");
  const [exchangeCustomerPhone, setExchangeCustomerPhone] = useState("");
  const [exchangeReturnItemName, setExchangeReturnItemName] = useState("");
  const [exchangeReturnItemValue, setExchangeReturnItemValue] = useState("");
  const [exchangeNewProductId, setExchangeNewProductId] = useState("");
  const [exchangeReason, setExchangeReason] = useState("Salah Saiz (Helmet / Baju Hujan)");
  const [completedExchangeSlip, setCompletedExchangeSlip] = useState<any>(null);
  const [exchangeRecords, setExchangeRecords] = useState<ExchangeRecord[]>([
    {
      id: "exc-1",
      receiptNo: "REC-948102",
      date: "2026-09-22 10:30",
      customerPhone: "018-9928172",
      returnedItem: "Helmet Gracshaw Gennex (Saiz M)",
      returnedValue: 280,
      newItem: "Helmet Gracshaw Gennex (Saiz XL)",
      newValue: 280,
      difference: 0,
      reason: "Tukar Saiz Seimbang (Keluarga)",
      cashier: "Aiman Hakimi",
    },
  ]);

  const handleProcessExchange = async (e: React.FormEvent) => {
    e.preventDefault();
    const retVal = parseFloat(exchangeReturnItemValue) || 0;
    const newProd = products.find((p) => p.id === exchangeNewProductId);
    const newVal = newProd ? newProd.sellingPrice : 0;
    const diff = newVal - retVal;

    const exchangeSlip = {
      slipNo: `EXC-${Date.now().toString().slice(-6)}`,
      time: new Date().toLocaleString("ms-MY"),
      receiptNo: exchangeReceiptNo || "WALK-IN",
      customerPhone: exchangeCustomerPhone || "-",
      returnedItem: exchangeReturnItemName,
      returnedValue: retVal,
      newItem: newProd ? newProd.name : "Tiada Pengganti (Pulangan Wang/Kredit)",
      newValue: newVal,
      difference: diff,
      reason: exchangeReason,
      cashier: "Aiman Hakimi (Kaunter 1)",
    };

    if (newProd) {
      await fetch(`/api/products/${newProd.id}/adjust-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta: -1 }),
      }).catch(() => null);
    }

    setExchangeRecords([
      {
        id: `exc-${Date.now()}`,
        receiptNo: exchangeSlip.receiptNo,
        date: exchangeSlip.time,
        customerPhone: exchangeSlip.customerPhone,
        returnedItem: exchangeSlip.returnedItem,
        returnedValue: exchangeSlip.returnedValue,
        newItem: exchangeSlip.newItem,
        newValue: exchangeSlip.newValue,
        difference: exchangeSlip.difference,
        reason: exchangeSlip.reason,
        cashier: exchangeSlip.cashier,
      },
      ...exchangeRecords,
    ]);

    setCompletedExchangeSlip(exchangeSlip);
    setIsExchangeModalOpen(false);
    setExchangeReceiptNo("");
    setExchangeReturnItemName("");
    setExchangeReturnItemValue("");
    setExchangeNewProductId("");
    if (onRefreshProducts) onRefreshProducts();
  };

  // Top 8 fast moving items
  const quickItems = products.slice(0, 8);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exist = prev.find((item) => item.product.id === product.id);
      if (exist) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const addLaborToCart = (labor: { name: string; rate: number; category: string }) => {
    const laborProduct: Product = {
      id: `labor-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: `UPAH: ${labor.name}`,
      sku: `UPAH-${labor.category.substring(0, 3).toUpperCase()}`,
      category: 'Upah',
      brand: 'FFmotor',
      costPrice: 0,
      sellingPrice: labor.rate,
      stockQty: 999,
      minAlertQty: 0,
      rackLocation: 'BENGKEL',
      isHighValue: false,
    };
    addToCart(laborProduct);
    setIsLaborModalOpen(false);
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setCashTendered("");
    setCustomerDeposit("");
    setDuitNowRef("");
  };

  const [isTaxable, setIsTaxable] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.product.sellingPrice || 0) * item.qty, 0);
  const labourEst = subtotal * 0.30;
  const tax = isTaxable ? labourEst * 0.08 : 0; // SST 8% on labour
  const rawGrandTotal = subtotal + tax;
  const depositNum = parseFloat(customerDeposit) || 0;
  const grandTotal = Math.max(0, rawGrandTotal - depositNum);

  const cashNum = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, cashNum - grandTotal);

  const handleRecordPettyCash = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(pettyCashAmount);
    if (!amt || amt <= 0) {
      alert("Sila masukkan jumlah duit keluar yang sah.");
      return;
    }
    const newRecord = {
      id: `pc-${Date.now()}`,
      time: new Date().toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" }),
      amount: amt,
      reason: pettyCashReason,
      person: pettyCashPerson || "Staf Kaunter",
    };
    setPettyCashRecords((prev) => [newRecord, ...prev]);
    setPettyCashAmount("");
    alert(`Duit keluar RM ${amt.toFixed(2)} (${pettyCashReason}) direkodkan. Baki tunai laci dikemaskini.`);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Sila pilih sekurang-kurangnya satu produk ke dalam troli.");
      return;
    }

    if (paymentMethod === "cash" && cashNum < grandTotal) {
      alert(`Jumlah tunai tidak mencukupi. Diperlukan sekurang-kurangnya RM ${grandTotal.toFixed(2)}`);
      return;
    }

    setIsProcessing(true);
    const receiptData = {
      receiptNo: `REC-${Date.now().toString().slice(-6)}`,
      time: new Date().toLocaleString("ms-MY"),
      items: [...cart],
      subtotal,
      depositPaid: depositNum,
      grandTotal,
      paymentMethod,
      duitNowRef: paymentMethod === "qr" ? (duitNowRef || "DISAHKAN") : null,
      cashTendered: paymentMethod === "cash" ? cashNum : grandTotal,
      changeDue: paymentMethod === "cash" ? changeDue : 0,
      cashier: "Aiman Hakimi (Kaunter 1)",
    };

    try {
      // Simpan rekod transaksi ke D1
      await fetch("/api/finance/closing/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cashierId: "usr_cashier",
          totalActualCash: cashNum,
          notes: `POS Jualan Kaunter: ${receiptData.receiptNo} (${paymentMethod})`,
        }),
      }).catch(() => null);

      // Tolak baki stok alat ganti di stor secara masa nyata
      for (const item of cart) {
        if (item.product?.id) {
          await fetch(`/api/products/${item.product.id}/adjust-stock`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ delta: -Math.abs(item.qty || 1) }),
          }).catch(() => null);
        }
      }

      setCompletedReceipt(receiptData);
      clearCart();
      if (onRefreshProducts) onRefreshProducts();
    } catch (e) {
      setCompletedReceipt(receiptData);
      clearCart();
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (activeDialectTag !== "all" && !matchesDialect(p, activeDialectTag)) return false;
    if (searchTerm && !matchesDialect(p, searchTerm)) return false;
    return true;
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = searchTerm.trim().toLowerCase();
      if (!trimmed) return;
      const exactMatch = products.find(
        (p) =>
          (p.sku && p.sku.toLowerCase() === trimmed) ||
          p.name.toLowerCase() === trimmed
      );
      if (exactMatch) {
        addToCart(exactMatch);
        setSearchTerm("");
      } else if (filteredProducts.length === 1) {
        addToCart(filteredProducts[0]);
        setSearchTerm("");
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 bg-white">
      {/* Motorsport Spike Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-zinc-200 pb-4 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2.5 rounded-2xl bg-red-600 text-white shadow-md shadow-red-600/30">
              <ShoppingCart className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight uppercase">
                  Kaunter POS & Kilat Checkout
                </h1>
                <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200 uppercase">
                  Terminal 01
                </span>
              </div>
              <p className="text-xs text-zinc-950 font-bold mt-0.5">
                Runcit pelincir, wear-and-tear, alat ganti bergerak pantas & cetakan slip 80mm
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsServiceBillOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm"
          >
            <Wrench className="w-4 h-4 text-white" />
            <span>Tarik Bil Servis ({unpaidServiceOrders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setIsExchangeModalOpen(true)}
            className="bg-white hover:bg-zinc-100 text-black border-2 border-zinc-300 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
          >
            <ArrowLeftRight className="w-4 h-4 text-red-600" />
            <span>🔄 Tukar Saiz / Pulangan</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPettyCashOpen(true)}
            className="bg-black hover:bg-zinc-800 text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
          >
            <Banknote className="w-4 h-4 text-emerald-400" />
            <span>💸 Duit Keluar Laci</span>
          </button>
          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 border-2 border-emerald-300 px-3.5 py-1.5 rounded-xl font-black flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-emerald-600" />
            Laci: RM {currentDrawerCash.toFixed(2)}
          </span>
          <span className="text-xs font-mono text-red-700 bg-red-50 border-2 border-red-300 px-3 py-1.5 rounded-xl font-black hidden sm:flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            Scanner Ready
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bahagian Kiri: Carian Barcode, Item Popular & Katalog Produk (7 Kolum) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Carian Barcode / Nama */}
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Imbas kod bar scanner atau taip SKU / nama barang (Tekan Enter)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-white border-2 border-zinc-300 rounded-2xl px-4 py-3 pl-11 text-xs text-black placeholder-zinc-400 focus:outline-none focus:border-red-600 font-mono shadow-sm"
                autoFocus
              />
              <Search className="w-4 h-4 text-zinc-600 absolute left-4 top-3.5 pointer-events-none" />
              {searchTerm && (
                <span className="absolute right-3 top-2.5 text-[10px] bg-red-600 text-white px-2 py-1 rounded font-mono font-black tracking-wide uppercase">
                  Enter = Tambah
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsLaborModalOpen(true)}
              className="bg-black hover:bg-zinc-800 text-white px-4 py-3 rounded-2xl text-xs font-black shrink-0 transition shadow-md whitespace-nowrap"
            >
              🛠️ Upah Kerja
            </button>
          </div>

          {/* Butang Pintas Dialek / Nama Pasar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[10px] font-black text-black uppercase tracking-wider shrink-0 mr-1">
              Kategori Pantas:
            </span>
            {[
              { id: "all", label: "🏁 Semua" },
              { id: "minyak", label: "🛢️ Minyak 4T" },
              { id: "tayar", label: "🛞 Tayar Tubeless" },
              { id: "belting", label: "⚙️ Belting CVT" },
              { id: "mangkuk", label: "🔩 Mangkuk Klac" },
              { id: "plug", label: "⚡ Plug Batu Api" },
              { id: "matgat", label: "🛡️ Matgat / Cover" },
            ].map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => setActiveDialectTag(tag.id)}
                className={`px-3 py-1.5 rounded-xl font-black text-[11px] whitespace-nowrap transition border-2 ${
                  activeDialectTag === tag.id
                    ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-600/30"
                    : "bg-white text-black border-zinc-200 hover:text-red-600 hover:border-red-600"
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* 8 Pilihan Pantas Popular Bersama Foto Sebenar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                Item Bergerak Pantas (1-Sentuh Tambah)
              </span>
              <span className="text-[11px] font-mono font-bold text-zinc-600">
                {quickItems.length} Produk Pilihan
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickItems.map((prod) => {
                const img = getPartImage(prod);
                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => addToCart(prod)}
                    className="bg-white group p-2.5 rounded-2xl text-left transition flex flex-col justify-between overflow-hidden relative border-2 border-zinc-200 hover:border-red-600 shadow-sm"
                  >
                    {/* Foto Sebenar Bahagian Motor */}
                    <div className="relative h-24 w-full rounded-xl overflow-hidden bg-zinc-100 mb-2 border border-zinc-200 group-hover:border-red-400 transition">
                      <img
                        src={img}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute top-1 left-1 text-[9px] font-mono font-black bg-black text-white px-1.5 py-0.5 rounded">
                        {prod.sku || "OEM"}
                      </span>
                      <span className="absolute bottom-1 right-1 text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-white text-emerald-700 border border-emerald-300">
                        Stok: {prod.stockQty ?? 10}
                      </span>
                    </div>

                    <p className="text-xs font-black text-black line-clamp-2 mb-2 group-hover:text-red-600">
                      {prod.name}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t-2 border-zinc-100">
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase block font-black">Harga</span>
                        <span className="text-xs font-mono font-black text-red-600">
                          RM {(prod.sellingPrice || 0).toFixed(2)}
                        </span>
                      </div>
                      <span className="w-6 h-6 rounded-lg bg-red-600 group-hover:bg-red-700 text-white flex items-center justify-center font-black text-sm shadow-sm">
                        +
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Senarai Lengkap Produk */}
          {searchTerm && (
            <div className="bg-white border-2 border-zinc-200 rounded-2xl p-4 space-y-2 max-h-72 overflow-y-auto">
              <span className="text-xs font-black text-black block">Hasil Carian:</span>
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs"
                >
                  <div>
                    <span className="font-black text-black block">{p.name}</span>
                    <span className="text-[11px] font-mono font-bold text-zinc-600">
                      SKU: {p.sku} • Stok: {p.stockQty ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-red-600 text-sm">
                      RM {(p.sellingPrice || 0).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => addToCart(p)}
                      className="bg-black hover:bg-zinc-800 text-white p-2 rounded-xl text-xs font-black"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bahagian Kanan: Troli & Pembayaran (5 Kolum) */}
        <div className="lg:col-span-5 bg-white p-5 space-y-5 rounded-3xl border-2 border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              <Receipt className="w-4 h-4 text-red-600" />
              <h2 className="text-xs font-black uppercase tracking-wider text-black">
                Troli Jualan ({cart.reduce((s, i) => s + i.qty, 0)} Item)
              </h2>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-[11px] font-black text-red-600 hover:text-red-700 flex items-center gap-1 transition"
              >
                <Trash2 className="w-3 h-3" /> Kosongkan
              </button>
            )}
          </div>

          {/* Senarai Item Troli dengan Imej */}
          <div className="divide-y divide-zinc-200 max-h-56 overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-500 font-bold">
                Troli kosong. Imbas kod bar atau pilih alat ganti di katalog kiri.
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                    <img
                      src={getPartImage(item.product)}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-black truncate">{item.product.name}</p>
                    <span className="text-[11px] font-mono font-bold text-zinc-600">
                      RM {(item.product.sellingPrice || 0).toFixed(2)} × {item.qty}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateQty(item.product.id, -1)}
                      className="w-6 h-6 rounded-lg bg-zinc-200 hover:bg-zinc-300 text-black flex items-center justify-center font-black"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-black w-6 text-center text-black">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.product.id, 1)}
                      className="w-6 h-6 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center font-black"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="font-mono font-black text-black text-right w-16 text-xs">
                    RM {((item.product.sellingPrice || 0) * item.qty).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Ringkasan Bayaran */}
          <div className="bg-zinc-50 p-4 rounded-2xl border-2 border-zinc-200 space-y-2.5 text-xs">
            <div className="flex justify-between text-black font-black">
              <span>Jumlah Sebelum SST:</span>
              <span className="font-mono">RM {subtotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-black">
                <input 
                  type="checkbox" 
                  checked={isTaxable}
                  onChange={(e) => setIsTaxable(e.target.checked)}
                  className="w-3.5 h-3.5 accent-red-600 rounded"
                />
                <span className="font-bold text-[11px]">Kenakan SST 8% pada Upah (Anggaran 30%)</span>
              </label>
              {isTaxable && (
                <span className="font-mono text-red-600 font-black">RM {tax.toFixed(2)}</span>
              )}
            </div>

            {/* Input Tolak Deposit Pelanggan */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t-2 border-zinc-200">
              <label className="text-[11px] font-black text-red-600 flex items-center gap-1 shrink-0">
                <span>🏷️ Tolak Deposit (RM):</span>
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={customerDeposit}
                onChange={(e) => setCustomerDeposit(e.target.value)}
                className="w-24 bg-white border-2 border-red-300 rounded-lg px-2 py-1 text-xs font-mono font-black text-right text-red-600 focus:outline-none focus:border-red-600"
              />
            </div>

            {depositNum > 0 && (
              <div className="flex justify-between text-red-600 text-[11px] font-black">
                <span>Tolak Bayaran Terdahulu:</span>
                <span className="font-mono">- RM {depositNum.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between pt-2 border-t-2 border-zinc-200 items-baseline">
              <span className="text-black font-black uppercase text-xs tracking-wider">JUMLAH BERSIH:</span>
              <span className="text-red-600 font-mono text-2xl font-black tracking-tight">
                RM {grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Kaedah Pembayaran */}
          <div className="space-y-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-black block">
              Kaedah Pembayaran:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`py-2 px-3 rounded-xl border-2 text-xs font-black flex flex-col items-center gap-1 transition ${
                  paymentMethod === "cash"
                    ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-600/30"
                    : "bg-white border-zinc-200 text-black hover:text-red-600 hover:border-red-600"
                }`}
              >
                <DollarSign className="w-4 h-4" /> Tunai
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("qr")}
                className={`py-2 px-3 rounded-xl border-2 text-xs font-black flex flex-col items-center gap-1 transition ${
                  paymentMethod === "qr"
                    ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-600/30"
                    : "bg-white border-zinc-200 text-black hover:text-red-600 hover:border-red-600"
                }`}
              >
                <QrCode className="w-4 h-4" /> DuitNow QR
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`py-2 px-3 rounded-xl border-2 text-xs font-black flex flex-col items-center gap-1 transition ${
                  paymentMethod === "card"
                    ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-600/30"
                    : "bg-white border-zinc-200 text-black hover:text-red-600 hover:border-red-600"
                }`}
              >
                <CreditCard className="w-4 h-4" /> Kad / FPX
              </button>
            </div>

            {/* Jika Tunai: Papan Sentuh Kiraan Pantas & Baki */}
            {paymentMethod === "cash" && (
              <div className="bg-zinc-50 p-3.5 rounded-2xl border-2 border-zinc-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-black font-black">Tunai Diterima (RM):</label>
                  <button
                    type="button"
                    onClick={() => setCashTendered(grandTotal.toFixed(2))}
                    className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm hover:bg-red-700"
                  >
                    ✓ TEPAT
                  </button>
                </div>

                {/* 1-Sentuh Butang Wang Kertas */}
                <div className="grid grid-cols-5 gap-1 text-[11px]">
                  {[10, 20, 50, 100, 150].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCashTendered(String(amt))}
                      className="py-1 rounded bg-white hover:bg-zinc-100 text-black font-mono font-black text-center border-2 border-zinc-300 transition"
                    >
                      RM{amt}
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  step="0.1"
                  placeholder="0.00"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  className="w-full bg-white border-2 border-zinc-300 rounded-xl px-3 py-2 text-sm font-mono font-black text-black focus:outline-none focus:border-red-600"
                />

                {cashNum > 0 && (
                  <div className="flex justify-between items-center pt-2 border-t-2 border-zinc-200 text-xs">
                    <span className="text-black font-black">Baki Pulangan:</span>
                    <span
                      className={`font-mono text-sm font-black ${
                        cashNum >= grandTotal ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      RM {changeDue.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Jika QR Dinamik: Tunjuk Kod DuitNow & Semakan 4-Digit Akhir Slip Bank */}
            {paymentMethod === "qr" && (
              <div className="bg-zinc-50 p-4 rounded-2xl border-2 border-zinc-200 text-center space-y-3">
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-red-600 font-black">DuitNow QR FFmotor</span>
                  <span className="text-[10px] font-mono font-black text-black">PBB: 319-283-7412</span>
                </div>
                <div className="w-32 h-32 bg-white rounded-xl mx-auto p-2 flex items-center justify-center border-2 border-red-600 shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      `duitnow://pay?merchant=FFMOTOR_RAWANG&amount=${grandTotal.toFixed(2)}`
                    )}`}
                    alt="DuitNow QR Dinamik"
                    className="w-full h-full"
                  />
                </div>
                <div className="text-left space-y-1 pt-2 border-t-2 border-zinc-200">
                  <label className="text-[10px] font-black uppercase tracking-wider text-red-600 block">
                    Semakan 4-Digit Rujukan Bank *
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="cth: 9214"
                    value={duitNowRef}
                    onChange={(e) => setDuitNowRef(e.target.value)}
                    className="w-full bg-white border-2 border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono font-black text-black text-center tracking-widest placeholder-zinc-400 focus:outline-none focus:border-red-600"
                  />
                  <p className="text-[10px] text-zinc-600 font-bold text-center">
                    Cegah slip palsu: Sahkan 4-angka resit pelanggan
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Butang Sahkan Bayaran Spike Red */}
          <button
            type="button"
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessing || (paymentMethod === "qr" && !duitNowRef.trim())}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-2xl text-sm flex items-center justify-center gap-2 font-black uppercase tracking-wide disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg shadow-red-600/30"
          >
            <CheckCircle2 className="w-5 h-5" />
            {isProcessing ? "Menjana Transaksi..." : 
             (paymentMethod === "qr" && !duitNowRef.trim()) ? "Masukkan No. Rujukan Bank DuitNow dahulu" :
             `Sahkan Bayaran (RM ${grandTotal.toFixed(2)})`}
          </button>
        </div>
      </div>

      {/* Modal Duit Keluar / Petty Cash */}
      {isPettyCashOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-zinc-300 rounded-3xl max-w-md w-full p-6 shadow-none space-y-5">
            <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200">
                  <Banknote className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-black">Duit Keluar Laci (Petty Cash)</h3>
                  <p className="text-xs text-zinc-600 font-bold">Rekod perbelanjaan kecil agar baki laci wang tepat</p>
                </div>
              </div>
              <button
                onClick={() => setIsPettyCashOpen(false)}
                className="p-1 rounded-lg text-black hover:text-red-600 font-black text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPettyCash} className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-black block mb-1">
                  Jumlah Wang Keluar (RM) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="cth: 15.00"
                  value={pettyCashAmount}
                  onChange={(e) => setPettyCashAmount(e.target.value)}
                  className="w-full bg-white border-2 border-zinc-300 rounded-xl px-3 py-2 text-sm font-mono font-black text-red-600 focus:outline-none focus:border-red-600"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-black block mb-1">
                  Tujuan Perbelanjaan *
                </label>
                <select
                  value={pettyCashReason}
                  onChange={(e) => setPettyCashReason(e.target.value)}
                  className="w-full bg-white border-2 border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-black focus:outline-none focus:border-red-600"
                >
                  <option value="Petrol Ron95 Test Ride">Petrol Ron95 Test Ride</option>
                  <option value="Minyak Cuci Rantai & Kain Lap Bengkel">Minyak Cuci & Kain Lap Bengkel</option>
                  <option value="Makan / Minum Lembur Staf">Makan / Minum Lembur Staf</option>
                  <option value="Beli Skru / Barang Kedai Hardware">Beli Skru / Barang Hardware Runcit</option>
                  <option value="Lain-lain Operasi Kecil">Lain-lain Operasi Kecil</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-black block mb-1">
                  Penerima / Pemohon Wang
                </label>
                <input
                  type="text"
                  placeholder="cth: Sifu Halim / Zul Mekanik"
                  value={pettyCashPerson}
                  onChange={(e) => setPettyCashPerson(e.target.value)}
                  className="w-full bg-white border-2 border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-black focus:outline-none focus:border-red-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition-all mt-2 uppercase tracking-wider"
              >
                Tolak Dari Laci & Simpan
              </button>
            </form>

            {/* Rekod Duit Keluar Hari Ini */}
            <div className="pt-3 border-t-2 border-zinc-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-black flex items-center gap-1">
                  <History className="w-3.5 h-3.5 text-zinc-600" />
                  Rekod Hari Ini ({pettyCashRecords.length})
                </span>
                <span className="font-mono font-black text-red-600">
                  Total: -RM {totalPettyCashOut.toFixed(2)}
                </span>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {pettyCashRecords.map((rec) => (
                  <div key={rec.id} className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-black text-black">{rec.reason}</p>
                      <p className="text-[10px] font-bold text-zinc-600">{rec.time} &bull; {rec.person}</p>
                    </div>
                    <span className="font-mono font-black text-red-600">
                      -RM {rec.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Resit Haba (Thermal Receipt 80mm) */}
      {completedReceipt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-black font-mono rounded-2xl max-w-sm w-full p-6 shadow-none space-y-4 text-xs border-2 border-black">
            <div className="text-center border-b border-dashed border-black pb-3">
              <h2 className="font-black text-base uppercase">Pusat Servis FFmotor 3S</h2>
              <p className="text-[10px] text-black">Rawang, Selangor • Tel: 019-223 3445</p>
              <p className="text-[10px] text-black font-bold mt-1">RESIT RASMI: {completedReceipt.receiptNo}</p>
              <p className="text-[10px] text-zinc-600">{completedReceipt.time}</p>
            </div>

            <div className="space-y-1.5 border-b border-dashed border-black pb-3">
              {completedReceipt.items.map((it: CartItem, idx: number) => (
                <div key={idx} className="flex justify-between">
                  <span className="truncate pr-2 font-bold text-black">
                    {it.qty}x {it.product.name}
                  </span>
                  <span className="font-black text-black shrink-0">
                    {((it.product.sellingPrice || 0) * it.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-right border-b border-dashed border-black pb-3">
              <div className="flex justify-between text-black font-bold">
                <span>JUMLAH ALAT GANTI:</span>
                <span>RM {(completedReceipt.subtotal || completedReceipt.grandTotal).toFixed(2)}</span>
              </div>
              {completedReceipt.depositPaid > 0 && (
                <div className="flex justify-between text-red-600 font-black">
                  <span>TOLAK DEPOSIT AWAL:</span>
                  <span>- RM {completedReceipt.depositPaid.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm pt-1 border-t border-black">
                <span>BERSIH DIBAYAR:</span>
                <span className="text-red-600">RM {completedReceipt.grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-black font-bold">
                <span>Kaedah:</span>
                <span className="uppercase font-black">{completedReceipt.paymentMethod}</span>
              </div>
              {completedReceipt.duitNowRef && (
                <div className="flex justify-between text-[11px] text-red-600 font-black">
                  <span>Ref DuitNow (4-Digit):</span>
                  <span>#{completedReceipt.duitNowRef}</span>
                </div>
              )}
              {completedReceipt.paymentMethod === "cash" && (
                <>
                  <div className="flex justify-between text-[11px] text-black font-bold">
                    <span>Tunai:</span>
                    <span>RM {completedReceipt.cashTendered.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-black text-emerald-700">
                    <span>Baki:</span>
                    <span>RM {completedReceipt.changeDue.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-[10px] text-black font-bold pt-1">
                <span>Juruwang:</span>
                <span>{completedReceipt.cashier}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-black font-bold pt-1">
              <p>Terima kasih atas sokongan anda!</p>
              <p>Alat ganti OEM dilindungi jaminan waranti.</p>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 bg-black text-white font-black py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs uppercase"
              >
                <Printer className="w-3.5 h-3.5" /> Cetak Resit
              </button>
              <button
                type="button"
                onClick={() => setCompletedReceipt(null)}
                className="bg-white hover:bg-zinc-100 text-black border-2 border-zinc-300 font-black py-2.5 px-4 rounded-xl text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PULANGAN & TUKAR SAIZ PELANGGAN */}
      {isExchangeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-zinc-300 rounded-3xl max-w-lg w-full p-6 shadow-none space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-zinc-100 text-black border-2 border-zinc-300">
                  <ArrowLeftRight className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-black">Pulangan & Tukar Saiz / Barang</h3>
                  <p className="text-[11px] text-zinc-600 font-bold">Tukar saiz seimbang, naik taraf barang, atau pulangan kredit</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExchangeModalOpen(false)}
                className="text-black hover:text-red-600 text-lg font-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProcessExchange} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-black font-black mb-1">No. Resit Asal (Jika Ada)</label>
                  <input
                    type="text"
                    value={exchangeReceiptNo}
                    onChange={(e) => setExchangeReceiptNo(e.target.value)}
                    placeholder="Contoh: REC-829102"
                    className="w-full bg-white border-2 border-zinc-300 rounded-xl p-2.5 font-mono font-bold text-black focus:border-red-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-black font-black mb-1">No. Telefon Pelanggan</label>
                  <input
                    type="tel"
                    value={exchangeCustomerPhone}
                    onChange={(e) => setExchangeCustomerPhone(e.target.value)}
                    placeholder="Contoh: 019-2819281"
                    className="w-full bg-white border-2 border-zinc-300 rounded-xl p-2.5 font-mono font-bold text-black focus:border-red-600 outline-none"
                  />
                </div>
              </div>

              {/* Barang Asal yang dipulangkan */}
              <div className="p-3.5 bg-zinc-50 rounded-2xl border-2 border-zinc-200 space-y-3">
                <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">
                  1. Butiran Barang Dipulangkan:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block text-black font-bold mb-1">Nama Barang Dipulangkan</label>
                    <input
                      type="text"
                      value={exchangeReturnItemName}
                      onChange={(e) => setExchangeReturnItemName(e.target.value)}
                      placeholder="Contoh: Helmet Gracshaw (Saiz L)"
                      className="w-full bg-white border-2 border-zinc-300 text-black font-bold rounded-xl p-2 focus:border-red-600 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-black font-bold mb-1">Nilai Asal (RM)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={exchangeReturnItemValue}
                      onChange={(e) => setExchangeReturnItemValue(e.target.value)}
                      placeholder="RM 280.00"
                      className="w-full bg-white border-2 border-zinc-300 text-red-600 font-mono font-black rounded-xl p-2 focus:border-red-600 outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Barang Baru yang diambil */}
              <div className="p-3.5 bg-zinc-50 rounded-2xl border-2 border-zinc-200 space-y-3">
                <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">
                  2. Barang Pengganti / Saiz Baru:
                </span>
                <div>
                  <label className="block text-black font-bold mb-1">Pilih Produk Baru Dari Inventori</label>
                  <select
                    value={exchangeNewProductId}
                    onChange={(e) => setExchangeNewProductId(e.target.value)}
                    className="w-full bg-white border-2 border-zinc-300 text-black rounded-xl p-2.5 font-bold focus:border-red-600 outline-none"
                  >
                    <option value="">-- Pilih Barang Gantian / Saiz Baru --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (RM {p.sellingPrice.toFixed(2)}) - Baki: {p.stockQty}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-black font-black mb-1">Sebab Tukar / Pulang</label>
                <select
                  value={exchangeReason}
                  onChange={(e) => setExchangeReason(e.target.value)}
                  className="w-full bg-white border-2 border-zinc-300 text-black font-bold rounded-xl p-2.5 focus:border-red-600 outline-none"
                >
                  <option value="Salah Saiz (Helmet / Baju Hujan)">Salah Saiz (Helmet / Baju Hujan / Glove)</option>
                  <option value="Silap Beli Model Motor (CVT / Sprocket)">Silap Beli Model Motor (CVT / Sprocket / Disc)</option>
                  <option value="Cacat Kilang / Defect (Waranti Kedai)">Cacat Kilang / Defect (Waranti Kedai)</option>
                  <option value="Pelanggan Ubah Fikiran (Kredit Kaunter)">Pelanggan Ubah Fikiran (Kredit Kaunter)</option>
                </select>
              </div>

              {/* Pengiraan Beza Harga */}
              {exchangeReturnItemValue && (
                <div className="p-3 bg-zinc-50 rounded-2xl border-2 border-zinc-200 text-xs space-y-1 font-mono">
                  {(() => {
                    const ret = parseFloat(exchangeReturnItemValue) || 0;
                    const newP = products.find((p) => p.id === exchangeNewProductId);
                    const nw = newP ? newP.sellingPrice : 0;
                    const diff = nw - ret;

                    return (
                      <>
                        <div className="flex justify-between text-black font-bold">
                          <span>Nilai Barang Pulang:</span>
                          <span>RM {ret.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-black font-bold">
                          <span>Harga Barang Baru:</span>
                          <span>RM {nw.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-black pt-1 border-t-2 border-zinc-200">
                          <span>STATUS BAYARAN:</span>
                          {diff === 0 ? (
                            <span className="text-black">TUKAR SEIMBANG (RM 0.00)</span>
                          ) : diff > 0 ? (
                            <span className="text-red-600">PELANGGAN TOP-UP: +RM {diff.toFixed(2)}</span>
                          ) : (
                            <span className="text-emerald-700">KREDIT / PULANG BALIK: -RM {Math.abs(diff).toFixed(2)}</span>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-black hover:bg-zinc-800 text-white font-black py-3 rounded-xl shadow-md transition uppercase tracking-wider"
                >
                  Sahkan Pertukaran & Jana Resit
                </button>
                <button
                  type="button"
                  onClick={() => setIsExchangeModalOpen(false)}
                  className="bg-white hover:bg-zinc-100 text-black border-2 border-zinc-300 font-black px-4 py-3 rounded-xl transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESIT PERTUKARAN RASMI (THERMAL SLIP) */}
      {completedExchangeSlip && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-black font-mono w-full max-w-sm rounded-2xl p-6 shadow-none space-y-4 text-xs border-2 border-black animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center border-b border-dashed border-black pb-3">
              <h3 className="font-black text-base text-black uppercase">FFMOTOR SDN BHD</h3>
              <p className="text-[10px] text-black">NOTA PERTUKARAN & PULANGAN KAUNTER</p>
              <p className="text-[11px] font-black text-red-600 mt-1">SLIP #{completedExchangeSlip.slipNo}</p>
              <p className="text-[10px] text-zinc-600">{completedExchangeSlip.time}</p>
            </div>

            <div className="space-y-1.5 border-b border-dashed border-black pb-3 text-[11px]">
              <div className="flex justify-between">
                <span className="text-black font-bold">No Resit Asal:</span>
                <span className="font-black">{completedExchangeSlip.receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black font-bold">No Telefon:</span>
                <span>{completedExchangeSlip.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black font-bold">Sebab:</span>
                <span>{completedExchangeSlip.reason}</span>
              </div>
            </div>

            <div className="space-y-2 border-b border-dashed border-black pb-3 text-[11px]">
              <div className="p-2 bg-zinc-100 rounded border border-zinc-200">
                <span className="text-[10px] font-black text-red-600 block">DIPULANGKAN:</span>
                <div className="flex justify-between font-black">
                  <span>{completedExchangeSlip.returnedItem}</span>
                  <span>- RM {completedExchangeSlip.returnedValue.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-2 bg-zinc-100 rounded border border-zinc-200">
                <span className="text-[10px] font-black text-emerald-700 block">GANTIAN BARU:</span>
                <div className="flex justify-between font-black">
                  <span>{completedExchangeSlip.newItem}</span>
                  <span>+ RM {completedExchangeSlip.newValue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="pt-1 flex justify-between font-black text-sm border-b border-dashed border-black pb-3">
              <span>BEZA BERSIH:</span>
              <span className="text-red-600">
                {completedExchangeSlip.difference === 0
                  ? "RM 0.00 (SEIMBANG)"
                  : completedExchangeSlip.difference > 0
                  ? `+ RM ${completedExchangeSlip.difference.toFixed(2)} (TOP-UP)`
                  : `- RM ${Math.abs(completedExchangeSlip.difference).toFixed(2)} (BAKI)`}
              </span>
            </div>

            <div className="text-center text-[10px] text-black font-bold">
              <p>Juruwang: {completedExchangeSlip.cashier}</p>
              <p className="mt-0.5">Pertukaran telah direkodkan dalam inventori.</p>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 bg-black text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 uppercase"
              >
                <Printer className="w-3.5 h-3.5" /> Cetak Slip Pertukaran
              </button>
              <button
                type="button"
                onClick={() => setCompletedExchangeSlip(null)}
                className="bg-white hover:bg-zinc-100 text-black border-2 border-zinc-300 font-black py-2.5 px-4 rounded-xl text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Upah Kerja */}
      {isLaborModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-none flex flex-col max-h-[90vh] border-2 border-zinc-300">
            <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-3 mb-4 shrink-0">
              <h3 className="text-lg font-black text-black flex items-center gap-2">
                🛠️ Kadar Upah Standard
              </h3>
              <button
                type="button"
                onClick={() => setIsLaborModalOpen(false)}
                className="text-black hover:text-red-600 font-black text-lg"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LABOR_RATES.map((labor, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => addLaborToCart(labor)}
                  className="flex items-center justify-between p-3 rounded-2xl border-2 border-zinc-200 hover:border-red-600 hover:bg-zinc-50 transition text-left"
                >
                  <div>
                    <div className="font-black text-sm text-black">{labor.name}</div>
                    <div className="text-[11px] font-bold text-zinc-600">{labor.category}</div>
                  </div>
                  <div className="font-mono font-black text-red-600 text-base">RM {labor.rate.toFixed(2)}</div>
                </button>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t-2 border-zinc-100 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsLaborModalOpen(false)}
                className="bg-black hover:bg-zinc-800 text-white font-black px-5 py-2.5 rounded-xl text-xs uppercase"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TARIK BIL SERVIS DARI LANTAI PIT */}
      {isServiceBillOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-zinc-950 rounded-3xl max-w-2xl w-full p-6 shadow-none space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-xl bg-red-600 text-white">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black text-zinc-950 uppercase tracking-tight">
                    Tarik Bil Kad Kerja Servis Kaunter
                  </h3>
                  <p className="text-xs text-zinc-800 font-bold">
                    Cari no. plat motosikal siap atau sedang dibaiki untuk terima bayaran & cetak resit rasmi.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsServiceBillOpen(false);
                  setSelectedServiceWo(null);
                }}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-black flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Carian No Plat */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari No. Plat (cth: VDF 8899) atau Nama Pemilik..."
                value={serviceSearchPlate}
                onChange={(e) => setServiceSearchPlate(e.target.value)}
                className="w-full bg-zinc-50 border-2 border-zinc-950 rounded-xl px-4 py-2.5 text-xs text-zinc-950 font-black placeholder-zinc-500 outline-none"
              />
              <Search className="w-4 h-4 text-zinc-950 absolute right-3 top-3 pointer-events-none" />
            </div>

            {/* Senarai Kad Kerja Aktif */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[220px]">
              {filteredServiceOrders.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-zinc-300 rounded-2xl">
                  <p className="text-xs font-bold text-zinc-800">
                    Tiada bil kad kerja yang belum dibayar mengikut carian ini.
                  </p>
                  {onGoToWorkOrders && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsServiceBillOpen(false);
                        onGoToWorkOrders();
                      }}
                      className="mt-3 text-xs text-red-600 font-black underline"
                    >
                      Buka Tab Kad Kerja Servis ➔
                    </button>
                  )}
                </div>
              ) : (
                filteredServiceOrders.map((wo) => {
                  const isSelected = selectedServiceWo?.id === wo.id;
                  const total = wo.grandTotal || ((wo.totalPartsAmount || 0) + (wo.totalLaborAmount || 0));
                  return (
                    <div
                      key={wo.id}
                      onClick={() => setSelectedServiceWo(wo)}
                      className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? "border-red-600 bg-red-50/40"
                          : "border-zinc-300 hover:border-zinc-950 bg-white"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-zinc-950 bg-zinc-100 px-2.5 py-0.5 rounded border border-zinc-300">
                            {wo.plateNumber || "NO PLAT"}
                          </span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                            wo.status === "ready"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : "bg-zinc-100 text-zinc-950 border-zinc-300"
                          }`}>
                            {wo.status === "ready" ? "● Sedia Diambil" : wo.status === "in_progress" ? "● Sedang Dibaiki" : wo.status}
                          </span>
                          {wo.assignedBay && (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              Bay #{wo.assignedBay}
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-zinc-950 mt-1">
                          {wo.brand || ""} {wo.model || ""} &bull; {wo.ownerName || "Pelanggan"} ({wo.ownerPhone || "Tiada Tel"})
                        </div>
                        <div className="text-[11px] text-zinc-800 mt-0.5">
                          Alat Ganti: RM {(wo.totalPartsAmount || 0).toFixed(2)} | Upah: RM {(wo.totalLaborAmount || 0).toFixed(2)}
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between">
                        <span className="text-base font-black text-red-600 font-mono">
                          RM {total.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-800">
                          {wo.woNumber}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pilihan Bayaran jika Work Order Dipilih */}
            {selectedServiceWo && (
              <div className="border-t-2 border-zinc-200 pt-4 space-y-3 bg-zinc-50 p-4 rounded-2xl border-2 border-zinc-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-zinc-950 uppercase">
                    Pilihan Bayaran Kaunter ({selectedServiceWo.plateNumber})
                  </span>
                  <span className="text-sm font-mono font-black text-red-600">
                    Jumlah: RM {(selectedServiceWo.grandTotal || 0).toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setServicePayMethod("cash")}
                    className={`py-2 px-3 rounded-xl text-xs font-black border-2 transition ${
                      servicePayMethod === "cash"
                        ? "bg-zinc-950 text-white border-zinc-950"
                        : "bg-white text-zinc-950 border-zinc-300 hover:border-zinc-950"
                    }`}
                  >
                    💵 Tunai
                  </button>
                  <button
                    type="button"
                    onClick={() => setServicePayMethod("qr")}
                    className={`py-2 px-3 rounded-xl text-xs font-black border-2 transition ${
                      servicePayMethod === "qr"
                        ? "bg-red-600 text-white border-red-600"
                        : "bg-white text-zinc-950 border-zinc-300 hover:border-zinc-950"
                    }`}
                  >
                    📱 DuitNow QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setServicePayMethod("card")}
                    className={`py-2 px-3 rounded-xl text-xs font-black border-2 transition ${
                      servicePayMethod === "card"
                        ? "bg-zinc-950 text-white border-zinc-950"
                        : "bg-white text-zinc-950 border-zinc-300 hover:border-zinc-950"
                    }`}
                  >
                    💳 Kad Debit/Kredit
                  </button>
                </div>

                {servicePayMethod === "cash" && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-zinc-950 shrink-0">Tunai Diterima (RM):</label>
                    <input
                      type="number"
                      placeholder={`Min RM ${(selectedServiceWo.grandTotal || 0).toFixed(2)}`}
                      value={serviceCashTendered}
                      onChange={(e) => setServiceCashTendered(e.target.value)}
                      className="w-full bg-white border-2 border-zinc-950 rounded-xl px-3 py-1.5 text-xs text-zinc-950 font-black outline-none"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    disabled={isPayingServiceWo}
                    onClick={() => handlePayServiceWorkOrder(selectedServiceWo)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider transition disabled:opacity-50"
                  >
                    {isPayingServiceWo ? "Memproses Bayaran..." : `Sahkan Bayaran & Cetak Resit POS (RM ${(selectedServiceWo.grandTotal || 0).toFixed(2)})`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedServiceWo(null)}
                    className="bg-white hover:bg-zinc-100 text-zinc-950 border-2 border-zinc-300 font-black px-4 py-3 rounded-xl text-xs"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


