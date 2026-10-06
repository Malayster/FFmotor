import React, { useState, useEffect } from "react";
import {
  Truck,
  Plus,
  Package,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  FileText,
  DollarSign,
  Phone,
  ArrowDownRight,
  ExternalLink,
  Check
} from "lucide-react";
import { Product } from "../types";

interface Supplier {
  id: string;
  name: string;
  code: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  termsDays: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  status: "draft" | "ordered" | "received" | "cancelled";
  totalAmount: number;
  orderedAt?: string;
  receivedAt?: string;
  notes?: string;
  createdAt: string;
}

interface SupplierOrdersProps {
  products: Product[];
  onRefreshProducts: () => void;
}

export const SupplierOrders: React.FC<SupplierOrdersProps> = ({ products, onRefreshProducts }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [showPOModal, setShowPOModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [poItems, setPOItems] = useState<{ productId: string; productName: string; quantity: number; costPrice: number; moq: number }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const isOverdue = (order: PurchaseOrder) => {
    if (order.status !== "ordered") return false;
    const dateStr = order.orderedAt || order.createdAt;
    if (!dateStr) return false;
    const orderDate = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const hoursDiff = (now - orderDate) / (1000 * 60 * 60);
    return hoursDiff > 48;
  };

  const fetchSuppliersAndOrders = async () => {
    try {
      setLoading(true);
      const [resSup, resOrd] = await Promise.all([
        fetch("/api/suppliers").then((r) => r.json()).catch(() => ({ success: false })),
        fetch("/api/suppliers/orders").then((r) => r.json()).catch(() => ({ success: false })),
      ]);

      if (resSup.success && Array.isArray(resSup.suppliers)) {
        setSuppliers(resSup.suppliers);
      }
      if (resOrd.success && Array.isArray(resOrd.orders)) {
        setOrders(resOrd.orders);
      }
    } catch (err) {
      console.error("Gagal memuat pembekal/pesanan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliersAndOrders();
  }, []);

  const lowStockProducts = products.filter((p) => p.stockQty <= (p.minAlertQty || 5));

  // Buka modal PO automatik dari produk stok minima
  const handleCreatePOFromLowStock = (prod: Product) => {
    const moq = prod.moq || 12;
    setPOItems([
      {
        productId: prod.id,
        productName: prod.name,
        quantity: Math.max(20, moq), // cadangan restock
        costPrice: prod.costPrice,
        moq: moq,
      },
    ]);
    setShowPOModal(true);
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || poItems.length === 0) {
      alert("Sila pilih pembekal dan sekurang-kurangnya satu item.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/suppliers/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: selectedSupplierId,
          items: poItems,
          notes: "Pesanan restock paras minima.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Pesanan Belian (${data.order.poNumber}) berjaya dihantar ke pembekal!`);
        setShowPOModal(false);
        setPOItems([]);
        await fetchSuppliersAndOrders();
      } else {
        alert("Ralat: " + (data.message || "Gagal"));
      }
    } catch (err) {
      alert("Ralat rangkaian: " + err);
    } finally {
      setSubmitting(false);
    }
  };

  // Terima Stok (GRN) & Auto Update Kuantiti D1
  const handleReceiveStock = async (poId: string) => {
    if (!confirm("Sahkan penerimaan barang fizikal di rak bengkel? Kuantiti stok dalam sistem akan ditambah serta-merta.")) return;

    try {
      const res = await fetch(`/api/suppliers/orders/${poId}/receive`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        await fetchSuppliersAndOrders();
        onRefreshProducts();
      } else {
        alert("Ralat: " + data.message);
      }
    } catch (err) {
      alert("Ralat penerimaan: " + err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold">
            <span>FFmotor HQ</span>
            <span>/</span>
            <span className="text-brand-400 font-bold">Rantaian Pembekal & Restock</span>
          </nav>
          <h1 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tight mt-1 flex items-center gap-2">
            <Truck className="w-6 h-6 text-brand-400" />
            <span>Pengurusan Pembekal & Pesanan Belian (*PO*)</span>
          </h1>
          <p className="text-xs text-zinc-500">
            Kawal rantaian bekalan alat ganti OEM, jana pesanan belian (PO), dan rekod penerimaan stok (*GRN*) ke rak fizikal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPOModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Bina Pesanan Belian (PO)</span>
          </button>
        </div>
      </div>

      {/* 3 Kad Ringkasan Rantaian Pembekal */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm">
          <span className="text-xs font-semibold text-zinc-500 uppercase">Amaran Stok Minima</span>
          <p className="text-2xl font-black text-red-700 mt-2">{lowStockProducts.length} Produk</p>
          <span className="text-[11px] text-zinc-500 mt-1 block">Perlu pesanan segera sebelum kehabisan</span>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm">
          <span className="text-xs font-semibold text-zinc-500 uppercase">Pesanan Dalam Perjalanan</span>
          <p className="text-2xl font-black text-red-600 mt-2">
            {orders.filter((o) => o.status === "ordered").length} PO
          </p>
          <span className="text-[11px] text-zinc-500 mt-1 block">Menunggu penghantaran lori pembekal</span>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm">
          <span className="text-xs font-semibold text-zinc-500 uppercase">Pembekal Berdaftar</span>
          <p className="text-2xl font-black text-emerald-400 mt-2">{suppliers.length} Vendor</p>
          <span className="text-[11px] text-zinc-500 mt-1 block">Hong Leong Yamaha, Boon Siew Honda, RCB</span>
        </div>
      </div>

      {/* SEKSYEN 1: SENARAI PESANAN BELIAN (PO) */}
      <div className="rounded-2xl border border-zinc-200 bg-white/90 shadow-none overflow-hidden">
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-400" />
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Rekod Pesanan Belian Stok (Purchase Orders)
            </h3>
          </div>
          <span className="text-xs text-zinc-500 font-mono">D1 Inventory Procurement</span>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            Tiada pesanan belian direkodkan lagi. Sila klik "Bina Pesanan Belian (PO)".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider text-[10px] bg-zinc-50/40">
                  <th className="py-3 px-4">No PO</th>
                  <th className="py-3 px-4">Pembekal</th>
                  <th className="py-3 px-4 text-right">Jumlah Nilai (RM)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Tarikh Pesanan</th>
                  <th className="py-3 px-4 text-right">Tindakan Gudang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 font-mono">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-zinc-100/30 transition">
                    <td className="py-3 px-4 font-bold text-brand-400">{o.poNumber}</td>
                    <td className="py-3 px-4 font-sans text-zinc-700 font-semibold">
                      {o.supplierName} ({o.supplierCode})
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-zinc-900">
                      RM {o.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center font-sans flex flex-col items-center gap-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                          o.status === "received"
                            ? "bg-emerald-50 text-emerald-400 border-emerald-200"
                            : o.status === "cancelled"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : isOverdue(o)
                            ? "bg-red-600 text-white border-rose-700 animate-pulse"
                            : "bg-red-50 text-red-600 border-red-200"
                        }`}
                      >
                        {o.status === "received" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : isOverdue(o) ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span>
                          {o.status === "draft"
                            ? "Draf PO"
                            : o.status === "ordered"
                            ? isOverdue(o) ? "LEWAT (>48J)" : "Menunggu Lori"
                            : o.status === "received"
                            ? "Diterima (GRN)"
                            : "Dibatalkan"}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 text-[11px] font-sans">
                      {o.orderedAt ? new Date(o.orderedAt).toLocaleDateString("ms-MY") : new Date(o.createdAt).toLocaleDateString("ms-MY")}
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      {o.status === "ordered" && (
                        <button
                          onClick={() => handleReceiveStock(o.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white font-bold transition shadow-xs"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Terima Stok (GRN)</span>
                        </button>
                      )}
                      {o.status === "received" && (
                        <span className="text-[11px] text-zinc-400 italic">
                          Stok telah dimasukkan ke inventori
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SEKSYEN 2: AMARAN STOK MINIMA & QUICK RESTOCK */}
      <div className="rounded-2xl border border-zinc-200 bg-white/90 shadow-none overflow-hidden">
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Produk Mencecah Paras Amaran Stok Minima (Perlu Restock Segera)
            </h3>
          </div>
          <span className="text-xs text-red-700 font-mono font-bold">
            {lowStockProducts.length} Item Kritikal
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider text-[10px] bg-zinc-50/40">
                <th className="py-3 px-4">Nama Produk / SKU</th>
                <th className="py-3 px-4">Lokasi Rak</th>
                <th className="py-3 px-4 text-center">Baki Stok Semasa</th>
                <th className="py-3 px-4 text-center">Paras Minima</th>
                <th className="py-3 px-4 text-right">Harga Kos Seunit</th>
                <th className="py-3 px-4 text-right">Tindakan Pantas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/60">
              {lowStockProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-zinc-500">
                    Semua stok berada dalam keadaan selamat melebihi paras minima.
                  </td>
                </tr>
              ) : (
                lowStockProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-100/30 transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-zinc-900">{p.name}</p>
                      <p className="font-mono text-[11px] text-zinc-500">{p.sku}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 font-mono text-[11px]">
                        {p.rackLocation || "RAK-A1"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-red-700 text-sm">
                      {p.stockQty} unit
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-zinc-500">
                      {p.minAlertQty || 5} unit
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-zinc-600">
                      RM {p.costPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleCreatePOFromLowStock(p)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Restock Segera (PO)</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SEKSYEN 3: DIREKTORI PEMBEKAL */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-brand-400" />
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Direktori Pembekal OEM & Hub Sah ({suppliers.length})
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500">Hub logistik pembekal rasmi bengkel</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((s) => (
            <div key={s.id} className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                <span className="font-mono text-xs font-bold text-brand-400">{s.code}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-300">
                  Terma: {s.termsDays} Hari
                </span>
              </div>
              <h3 className="font-bold text-zinc-900 text-sm">{s.name}</h3>
              <div className="space-y-1 text-xs text-zinc-500">
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="font-mono text-zinc-600">{s.phone}</span>
                </p>
                {s.contactPerson && <p>Pegawai: {s.contactPerson}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL BINA PO BAHARU */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 bg-zinc-50/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 max-w-lg w-full shadow-none space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-400" />
                <span>Bina Pesanan Belian (*Purchase Order*)</span>
              </h3>
              <button
                onClick={() => setShowPOModal(false)}
                className="text-zinc-500 hover:text-red-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-500 font-semibold block mb-1">Pilih Pembekal OEM:</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 font-medium"
                  required
                >
                  <option value="">-- Pilih Pembekal --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) · Terma {s.termsDays} Hari
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-500 font-semibold block mb-1">Item Pesanan:</label>
                {poItems.length === 0 ? (
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-center text-zinc-400">
                    Tiada item dipilih. Sila pilih dari tab Stok Minima.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {poItems.map((item, idx) => (
                      <div key={idx} className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
                        <span className="font-bold text-zinc-900">{item.productName}</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-zinc-500 block">Kuantiti Pesan:</span>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setPOItems(poItems.map((pi, i) => i === idx ? { ...pi, quantity: val } : pi));
                              }}
                              className="w-full bg-white border border-zinc-300 rounded-lg p-1.5 text-zinc-900 font-mono text-center font-bold"
                            />
                            {item.quantity < item.moq && (
                              <span className="text-[10px] text-red-600 block mt-1 font-bold">
                                Amaran: Kuantiti di bawah MOQ pembekal (Minimum: {item.moq} unit)
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 block">Kos Seunit (RM):</span>
                            <input
                              type="number"
                              value={item.costPrice}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setPOItems(poItems.map((pi, i) => i === idx ? { ...pi, costPrice: val } : pi));
                              }}
                              className="w-full bg-white border border-zinc-300 rounded-lg p-1.5 font-mono text-center font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowPOModal(false)}
                  className="px-4 py-2 rounded-xl bg-white font-bold hover:bg-zinc-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{submitting ? "Menjana PO..." : "Hantar Pesanan PO"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

