import React, { useState } from "react";
import {
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Package,
  DollarSign,
  ArrowRight,
  X,
  Clock,
  User,
  FileText
} from "lucide-react";
import { Product } from "../types";

interface ReturnRecord {
  id: string;
  type: "exchange" | "refund" | "vendor_claim";
  productName: string;
  sku: string;
  qty: number;
  amount: number;
  reason: string;
  customerName: string;
  receiptNo: string;
  time: string;
  status: "completed" | "pending_vendor";
}

interface ReturnManagerModalProps {
  products: Product[];
  onClose: () => void;
  onRefreshProducts?: () => void;
}

export const ReturnManagerModal: React.FC<ReturnManagerModalProps> = ({
  products,
  onClose,
  onRefreshProducts,
}) => {
  const [returnType, setReturnType] = useState<"exchange" | "refund" | "vendor_claim">("exchange");
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || "");
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState("Salah saiz komponen / bearing");
  const [customerName, setCustomerName] = useState("");
  const [receiptNo, setReceiptNo] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Senarai pulangan demo harian yang realistik
  const [recentReturns, setRecentReturns] = useState<ReturnRecord[]>([
    {
      id: "RET-101",
      type: "exchange",
      productName: "Bearing Roda Hadapan NTN 6202 (Yamaha NVX)",
      sku: "NTN-6202-ZZ",
      qty: 1,
      amount: 18.0,
      reason: "Salah beli saiz (motor perlu saiz 6300)",
      customerName: "Khairul Azman",
      receiptNo: "REC-948211",
      time: "10:15 AM",
      status: "completed",
    },
    {
      id: "RET-102",
      type: "vendor_claim",
      productName: "Palam Pencucuh Iridium NGK CPR8EAIX-9",
      sku: "NGK-CPR8EAIX",
      qty: 1,
      amount: 45.0,
      reason: "Kerosakan elektrod dari kilang (tiada percikan)",
      customerName: "Bengkel FFmotor (Internal QC)",
      receiptNo: "PO-OEM-5541",
      time: "11:40 AM",
      status: "pending_vendor",
    },
  ]);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setSubmitting(true);
    const newRecord: ReturnRecord = {
      id: `RET-${Math.floor(100 + Math.random() * 900)}`,
      type: returnType,
      productName: selectedProduct.name,
      sku: selectedProduct.sku,
      qty,
      amount: (selectedProduct.sellingPrice || 0) * qty,
      reason,
      customerName: customerName.trim() || "Pelanggan Walk-In",
      receiptNo: receiptNo.trim() || `REC-${Date.now().toString().slice(-6)}`,
      time: new Date().toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" }),
      status: returnType === "vendor_claim" ? "pending_vendor" : "completed",
    };

    setTimeout(() => {
      setRecentReturns((prev) => [newRecord, ...prev]);
      setSuccessMsg(
        returnType === "exchange"
          ? `Pulangan berjaya! ${qty} unit ${selectedProduct.name} telah dikembalikan ke stok untuk ditukar.`
          : returnType === "refund"
          ? `Bayaran balik tunai RM ${newRecord.amount.toFixed(2)} telah diluluskan & stok dikembalikan.`
          : `Tuntutan kecacatan kilang direkodkan. Menunggu penggantian dari pembekal OEM.`
      );
      setSubmitting(false);
      if (onRefreshProducts) onRefreshProducts();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-50/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-zinc-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-none space-y-6">
        {/* Header Modal */}
        <div className="flex items-start justify-between border-b border-zinc-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-700 border border-red-200 flex items-center justify-center font-black">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono font-black px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                  MODUL PULANGAN & TUKAR GANTI
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                  ● Kemas Kini Stok Terus
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black ">
                Rekod Pulangan Barang (Returns, Exchange & Claims)
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-red-600 p-2 rounded-xl border border-zinc-200 hover:bg-zinc-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mesej Kejayaan */}
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* Pilihan 3 Jenis Pulangan */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setReturnType("exchange")}
            className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
              returnType === "exchange"
                ? "bg-red-50 border-red-600 text-red-600 font-bold"
                : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-red-600"
            }`}
          >
            <span className="text-xs font-black">1. Tukar Barang</span>
            <span className="text-[10px] text-zinc-500 mt-1">Salah saiz / tukar part sama nilai</span>
          </button>

          <button
            type="button"
            onClick={() => setReturnType("refund")}
            className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
              returnType === "refund"
                ? "bg-red-50 border-rose-500 text-red-700 font-bold"
                : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-red-600"
            }`}
          >
            <span className="text-xs font-black">2. Pulang Tunai</span>
            <span className="text-[10px] text-zinc-500 mt-1">Kembalikan tunai & tolak jualan</span>
          </button>

          <button
            type="button"
            onClick={() => setReturnType("vendor_claim")}
            className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
              returnType === "vendor_claim"
                ? "bg-zinc-100 border-zinc-300 text-zinc-700 font-bold"
                : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-red-600"
            }`}
          >
            <span className="text-xs font-black">3. Cacat Kilang</span>
            <span className="text-[10px] text-zinc-500 mt-1">Tuntutan warranty pembekal OEM</span>
          </button>
        </div>

        {/* Borang Pulangan */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-zinc-500 block mb-1.5">
                Pilih Produk Yang Dipulangkan:
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (RM {(p.sellingPrice || 0).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-500 block mb-1.5">
                Kuantiti Dipulangkan:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-center font-mono font-bold"
                />
                <span className="text-xs text-zinc-500 font-mono">
                  Nilai: RM {((selectedProduct?.sellingPrice || 0) * qty).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-zinc-500 block mb-1.5">
                Sebab Pulangan:
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="Salah saiz komponen / bearing">Salah saiz komponen / bearing</option>
                <option value="Barang defect / cacat kilang">Barang defect / cacat kilang</option>
                <option value="Pelanggan ubah fikiran / tersalah beli">Pelanggan ubah fikiran / tersalah beli</option>
                <option value="Komponen tidak muat spesifikasi motor">Komponen tidak muat spesifikasi motor</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-500 block mb-1.5">
                Nama Pelanggan & No Resit Asal:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nama pembeli"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs "
                />
                <input
                  type="text"
                  placeholder="No. Resit (cth: REC-9482)"
                  value={receiptNo}
                  onChange={(e) => setReceiptNo(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{submitting ? "Merekodkan..." : "Sahkan & Kemas Kini Stok Inventori"}</span>
          </button>
        </form>

        {/* Senarai 3 Rekod Pulangan Terkini Hari Ini */}
        <div className="pt-2 border-t border-zinc-200 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">
            Rekod Pulangan Hari Ini ({recentReturns.length})
          </span>
          <div className="space-y-2 max-h-44 overflow-y-auto">
            {recentReturns.map((ret) => (
              <div
                key={ret.id}
                className="bg-zinc-50/80 border border-zinc-200 p-3 rounded-2xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        ret.type === "exchange"
                          ? "bg-red-50 text-red-600"
                          : ret.type === "refund"
                          ? "bg-red-50 text-red-700"
                          : "bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {ret.type === "exchange"
                        ? "Tukar Barang"
                        : ret.type === "refund"
                        ? "Refund Tunai"
                        : "Kerosakan Kilang"}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400">{ret.id}</span>
                    <span className="text-[10px] text-zinc-500">• {ret.time}</span>
                  </div>
                  <p className="font-bold text-zinc-700 mt-1">{ret.productName}</p>
                  <p className="text-[10px] text-zinc-500">
                    Sebab: {ret.reason} • Pembeli: {ret.customerName}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-red-700 block">
                    RM {ret.amount.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {ret.status === "completed" ? "✓ Stok Diselaras" : "Menunggu Vendor"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

