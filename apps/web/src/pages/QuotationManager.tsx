import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Printer,
  Send,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  User,
  Bike,
  Wrench,
  ChevronRight,
  Clock,
  ArrowRight
} from "lucide-react";
import { Product } from "../types";
import { createWhatsAppLink } from "../lib/whatsapp";

interface QuotationManagerProps {
  products: Product[];
  onRefresh?: () => void;
  onNavigate?: (tab: string) => void;
}

interface QuoteItem {
  id: string;
  description: string;
  type: "part" | "labor";
  quantity: number;
  unitPrice: number;
}

interface QuotationRecord {
  id: string;
  quoteNumber: string;
  customerName: string;
  customerPhone: string;
  plateNumber: string;
  bikeModel: string;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  grandTotal: number;
  requiresDirectorApproval: boolean;
  isApprovedByDirector: boolean;
  status: "draft" | "pending_approval" | "sent" | "accepted" | "converted" | "rejected";
  createdAt: string;
  items?: QuoteItem[];
}

export const QuotationManager: React.FC<QuotationManagerProps> = ({
  products,
  onRefresh,
  onNavigate,
}) => {
  const [viewMode, setViewMode] = useState<"list" | "create">("list");
  const [quotationList, setQuotationList] = useState<QuotationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState("Akmal Hakim");
  const [customerPhone, setCustomerPhone] = useState("0123456789");
  const [plateNumber, setPlateNumber] = useState("VDF8899");
  const [bikeModel, setBikeModel] = useState("Yamaha NVX 155 V2");
  const [items, setItems] = useState<QuoteItem[]>([
    { id: "1", description: "V-Belt CVT Original Yamaha", type: "part", quantity: 1, unitPrice: 145 },
    { id: "2", description: "Roller Weight Set 12g", type: "part", quantity: 1, unitPrice: 65 },
    { id: "3", description: "Upah Servis CVT & Cuci Throttle Body", type: "labor", quantity: 1, unitPrice: 80 },
  ]);
  const [discountPercent, setDiscountPercent] = useState<number>(5);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/quotations");
      const data = await res.json();
      if (data.success && Array.isArray(data.quotations)) {
        setQuotationList(data.quotations);
      }
    } catch (err) {
      console.error("Gagal memuat sebut harga:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const subtotal = items.reduce((acc, curr) => acc + curr.quantity * curr.unitPrice, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const grandTotal = subtotal - discountAmount;
  const isRequiresDirectorApproval = discountPercent > 10;

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Math.random().toString(),
        description: "Alat Ganti / Upah Baru",
        type: "part",
        quantity: 1,
        unitPrice: 50,
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: keyof QuoteItem, val: any) => {
    setItems(
      items.map((i) => {
        if (i.id === id) {
          return { ...i, [field]: val };
        }
        return i;
      })
    );
  };

  // Simpan Sebut Harga ke Pangkalan Data D1
  const handleSaveQuotation = async () => {
    if (!customerName || !plateNumber || items.length === 0) {
      alert("Sila lengkapkan nama pelanggan, no plat dan senarai item.");
      return;
    }

    try {
      setActionLoading("save");
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          plateNumber,
          bikeModel,
          subtotal,
          discountPercent,
          discountAmount,
          grandTotal,
          items,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Sebut harga ${data.quotation.quoteNumber} berjaya disimpan ke Cloudflare D1!`);
        await fetchQuotations();
        onRefresh?.();
        setViewMode("list");
      } else {
        alert("Ralat menyimpan: " + (data.message || "Gagal"));
      }
    } catch (err) {
      alert("Ralat rangkaian: " + err);
    } finally {
      setActionLoading(null);
    }
  };

  // Luluskan Diskaun > 10% oleh Pengarah / Tauke
  const handleApproveDiscount = async (id: string) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/quotations/${id}/approve`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert("Diskaun telah diluluskan oleh Pengarah!");
        await fetchQuotations();
        onRefresh?.();
      }
    } catch (err) {
      alert("Ralat kelulusan: " + err);
    } finally {
      setActionLoading(null);
    }
  };

  // GOLDEN LOOP 1: Tukar Sebut Harga kepada Kad Kerja (Work Order)
  const handleConvertToWorkOrder = async (id: string) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/quotations/${id}/convert`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert(`Berjaya! Sebut harga telah ditukarkan kepada Kad Kerja (${data.workOrderNumber}) dan stok telah diperuntukkan.`);
        await fetchQuotations();
        onRefresh?.();
        if (onNavigate) {
          onNavigate("work-orders");
        }
      } else {
        alert("Ralat penukaran: " + (data.message || "Gagal"));
      }
    } catch (err) {
      alert("Ralat rangkaian: " + err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendWhatsApp = (q: QuotationRecord) => {
    if (!q.customerPhone) return;
    const msg =
      `Salam ${q.customerName}, ini sebut harga rasmi dari *FFmotor* untuk motosikal anda *${q.plateNumber}* (${q.bikeModel}):\n\n` +
      `No Sebut Harga: *${q.quoteNumber}*\n` +
      `Subtotal: RM ${q.subtotal.toFixed(2)}\n` +
      `Diskaun: RM ${q.discountAmount.toFixed(2)} (${q.discountPercent}%)\n` +
      `*Jumlah Bersih: RM ${q.grandTotal.toFixed(2)}*\n\n` +
      `Sila balas *SETUJU* untuk kami terus mulakan kerja pemasangan di pit. Terima kasih!`;

    window.open(createWhatsAppLink(q.customerPhone, msg), "_blank");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold">
            <span>FFmotor HQ</span>
            <span>/</span>
            <span className="text-brand-400 font-bold">Pengurusan Sebut Harga</span>
          </nav>
          <h1 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tight mt-1">
            Sebut Harga Rasmi & Kelulusan Diskaun
          </h1>
          <p className="text-xs text-zinc-500">
            Kira anggaran kos baiki, luluskan diskaun melebihi had kuasa (&gt;10%), dan tukar terus menjadi Kad Kerja.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === "list" ? "create" : "list")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition shadow-xs"
          >
            {viewMode === "list" ? (
              <>
                <Plus className="w-4 h-4" />
                <span>Bina Sebut Harga Baharu</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Lihat Senarai Sebut Harga ({quotationList.length})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* PANDANGAN 1: SENARAI SEBUT HARGA DARI D1 */}
      {viewMode === "list" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white/90 shadow-none overflow-hidden">
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-400" />
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  Senarai Sebut Harga Rasmi (D1 Cloudflare)
                </h3>
              </div>
              <span className="text-xs text-zinc-500 font-mono">
                {quotationList.length} Rekod Terkini
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                Memuat turun sebut harga dari Cloudflare D1...
              </div>
            ) : quotationList.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                Tiada sebut harga direkodkan lagi. Sila klik "Bina Sebut Harga Baharu".
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider text-[10px] bg-zinc-50/40">
                      <th className="py-3 px-4">No Sebut Harga</th>
                      <th className="py-3 px-4">Pelanggan & Plat</th>
                      <th className="py-3 px-4">Model Motor</th>
                      <th className="py-3 px-4 text-right">Jumlah Bersih</th>
                      <th className="py-3 px-4 text-center">Had Diskaun</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Tindakan Automasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/60">
                    {quotationList.map((q) => (
                      <tr key={q.id} className="hover:bg-zinc-100/30 transition">
                        <td className="py-3 px-4 font-mono font-bold text-zinc-900">
                          {q.quoteNumber}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-zinc-700">{q.customerName}</p>
                          <p className="font-mono text-[11px] text-zinc-500">{q.plateNumber} · {q.customerPhone}</p>
                        </td>
                        <td className="py-3 px-4 text-zinc-600 font-medium">
                          {q.bikeModel}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-brand-400">
                          RM {q.grandTotal.toFixed(2)}
                          {q.discountPercent > 0 && (
                            <span className="block text-[10px] text-red-700">
                              (-{q.discountPercent}%)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {q.requiresDirectorApproval ? (
                            q.isApprovedByDirector ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-400 border border-emerald-200 text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3" />
                                Diluluskan Tauke
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold">
                                <AlertTriangle className="w-3 h-3" />
                                Minta Lulus &gt;10%
                              </span>
                            )
                          ) : (
                            <span className="text-[10px] text-zinc-500 font-medium">
                              Standard (≤10%)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              q.status === "converted"
                                ? "bg-zinc-100 text-zinc-700 border border-zinc-300"
                                : q.status === "pending_approval"
                                ? "bg-red-50 text-red-600 border border-red-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {q.status === "converted" ? "Kad Kerja Aktif" : q.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Butang Kelulusan Pengarah jika perlu */}
                            {q.requiresDirectorApproval && !q.isApprovedByDirector && (
                              <button
                                onClick={() => handleApproveDiscount(q.id)}
                                disabled={actionLoading === q.id}
                                className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold transition shadow-xs"
                              >
                                {actionLoading === q.id ? "Memproses..." : "Luluskan Diskaun"}
                              </button>
                            )}

                            {/* Butang WhatsApp */}
                            <button
                              onClick={() => handleSendWhatsApp(q)}
                              className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white transition"
                              title="Hantar WhatsApp Sebut Harga"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>

                            {/* Butang Tukar ke Kad Kerja */}
                            {q.status !== "converted" && (
                              <button
                                onClick={() => handleConvertToWorkOrder(q.id)}
                                disabled={actionLoading === q.id || (q.requiresDirectorApproval && !q.isApprovedByDirector)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                                  q.requiresDirectorApproval && !q.isApprovedByDirector
                                    ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                                    : "bg-zinc-950 hover:bg-zinc-800 text-white shadow-xs"
                                }`}
                              >
                                <Wrench className="w-3 h-3" />
                                <span>Tukar ke Kad Kerja</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PANDANGAN 2: BORANG BINA SEBUT HARGA BAHARU */}
      {viewMode === "create" && (
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Kolum Kiri: Butiran Pemilik & Had Diskaun */}
          <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm lg:col-span-4 space-y-4">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Maklumat Kenderaan & Pelanggan</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-500 font-semibold block mb-1">Nama Pelanggan:</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 font-medium"
                />
              </div>

              <div>
                <label className="text-zinc-500 font-semibold block mb-1">No Telefon WhatsApp:</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-500 font-semibold block mb-1">No Pendaftaran (Plat):</label>
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-zinc-500 font-semibold block mb-1">Model Motosikal:</label>
                <input
                  type="text"
                  value={bikeModel}
                  onChange={(e) => setBikeModel(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2 font-medium"
                />
              </div>

              {/* Had Diskaun Rule ala Johan30 */}
              <div className="pt-3 border-t border-zinc-200 space-y-2">
                <label className="text-zinc-500 font-semibold block">Peratus Diskaun Diberi (%):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-24 bg-zinc-50 border border-zinc-200 rounded-xl p-2 font-mono text-center font-bold"
                  />
                  <span className="text-zinc-500 font-mono text-xs">
                    = -RM {discountAmount.toFixed(2)}
                  </span>
                </div>

                {isRequiresDirectorApproval ? (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-600 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>Melebihi Had Diskaun Standard (&gt;10%)</span>
                    </div>
                    <p>Sebut harga ini akan ditandakan `Minta Kelulusan Pengarah` sebelum sah.</p>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-200 text-[11px] text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Dalam had kuasa diskaun Admin HQ (≤10%)</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSaveQuotation}
              disabled={actionLoading === "save"}
              className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition shadow-md shadow-brand-500/20 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{actionLoading === "save" ? "Menyimpan ke D1..." : "Simpan & Jana Sebut Harga"}</span>
            </button>
          </div>

          {/* Kolum Kanan: Pecahan Senarai Barang & Upah */}
          <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Pecahan Alat Ganti & Upah Buruh</h3>
                <p className="text-xs text-zinc-500">Senaraikan komponen dan upah pasang untuk sebut harga ini</p>
              </div>
              <button
                onClick={addItem}
                className="inline-flex items-center gap-1 rounded-xl bg-white hover:bg-zinc-100 px-3 py-1.5 text-xs font-bold transition border border-zinc-300"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Item</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Penerangan Item</th>
                    <th className="py-2.5 px-3 w-28">Kategori</th>
                    <th className="py-2.5 px-3 w-16 text-center">Kuantiti</th>
                    <th className="py-2.5 px-3 w-28">Harga Seunit</th>
                    <th className="py-2.5 px-3 w-28 text-right">Jumlah (RM)</th>
                    <th className="py-2.5 px-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-100/30 transition">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-1.5 font-medium"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <select
                          value={item.type}
                          onChange={(e) => updateItem(item.id, "type", e.target.value as any)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-1.5 text-zinc-600 font-medium"
                        >
                          <option value="part">Alat Ganti</option>
                          <option value="labor">Upah Buruh</option>
                        </select>
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-1.5 font-mono text-center "
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-1.5 font-mono text-right"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-zinc-900">
                        RM {(item.quantity * item.unitPrice).toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 rounded-lg text-zinc-400 hover:text-red-700 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Ringkasan Bawah Sebut Harga */}
            <div className="pt-4 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-zinc-500">
                <span>Jumlah Item: <b className="">{items.length}</b></span>
              </div>

              <div className="w-full sm:w-72 rounded-xl bg-zinc-50 p-3.5 space-y-2 font-mono text-xs border border-zinc-200">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal:</span>
                  <span>RM {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-red-700">
                  <span>Diskaun ({discountPercent}%):</span>
                  <span>- RM {discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-zinc-900 border-t border-zinc-200 pt-2">
                  <span>Jumlah Bersih:</span>
                  <span className="text-brand-400">RM {grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
