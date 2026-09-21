import React, { useState } from "react";
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
  Bike
} from "lucide-react";
import { Product } from "../types";
import { createWhatsAppLink } from "../lib/whatsapp";

interface QuotationManagerProps {
  products: Product[];
}

interface QuoteItem {
  id: string;
  description: string;
  type: "part" | "labor";
  quantity: number;
  unitPrice: number;
}

export const QuotationManager: React.FC<QuotationManagerProps> = ({ products }) => {
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

  const subtotal = items.reduce((acc, curr) => acc + curr.quantity * curr.unitPrice, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const grandTotal = subtotal - discountAmount;

  // Johan30 Rule: Diskaun > 10% memerlukan kelulusan Pengarah/Tauke
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

  const handleSendWhatsApp = () => {
    if (!customerPhone) return;
    const msg =
      `Salam ${customerName}, ini sebut harga rasmi dari *FFmotor* untuk motor anda *${plateNumber}* (${bikeModel}):\n\n` +
      items.map((i, idx) => `${idx + 1}. ${i.description} (x${i.quantity}) - RM ${(i.quantity * i.unitPrice).toFixed(2)}`).join("\n") +
      `\n\nSubtotal: RM ${subtotal.toFixed(2)}\nDiskaun (${discountPercent}%): -RM ${discountAmount.toFixed(2)}\n` +
      `*Jumlah Bersih: RM ${grandTotal.toFixed(2)}*\n\n` +
      `Balas *SETUJU* untuk kami mulakan kerja pemasangan. Terima kasih!`;

    window.open(createWhatsAppLink(customerPhone, msg), "_blank");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <span>FFmotor HQ</span>
            <span>/</span>
            <span className="text-brand-400 font-bold">Pengurusan Sebut Harga</span>
          </nav>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-1">
            Penjana Sebut Harga Rasmi & Had Diskaun
          </h1>
          <p className="text-xs text-slate-400">
            Kira anggaran kos overhaul, baiki kerosakan besar, dan semak kelulusan diskaun melebihi had kuasa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Sebut Harga</span>
          </button>
          <button
            onClick={handleSendWhatsApp}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs"
          >
            <Send className="w-4 h-4" />
            <span>Hantar ke WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Grid: Borang Maklumat & Jadual Item */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Kolum Kiri (4 Cols): Butiran Pemilik & Had Diskaun */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm lg:col-span-4 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Maklumat Kenderaan & Pelanggan</h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Nama Pelanggan:</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-medium"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">No Telefon WhatsApp:</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">No Pendaftaran (Plat):</label>
              <input
                type="text"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Model Motosikal:</label>
              <input
                type="text"
                value={bikeModel}
                onChange={(e) => setBikeModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-medium"
              />
            </div>

            {/* Had Diskaun Rule ala Johan30 */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <label className="text-slate-400 font-semibold block">Peratus Diskaun Diberi (%):</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-24 bg-slate-950 border border-slate-800 rounded-xl p-2 font-mono text-white text-center font-bold"
                />
                <span className="text-slate-400 font-mono text-xs">
                  = -RM {discountAmount.toFixed(2)}
                </span>
              </div>

              {isRequiresDirectorApproval ? (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Melebihi Had Diskaun Standard (&gt;10%)</span>
                  </div>
                  <p>Diskaun ini memerlukan pengesahan & kelulusan Pengarah / Tauke.</p>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Dalam had kuasa diskaun Admin HQ (≤10%)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kolum Kanan (8 Cols): Pecahan Senarai Barang & Upah */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Pecahan Alat Ganti & Upah Buruh</h3>
              <p className="text-xs text-slate-400">Senaraikan komponen dan upah pasang untuk sebut harga ini</p>
            </div>
            <button
              onClick={addItem}
              className="inline-flex items-center gap-1 rounded-xl bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Item</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Penerangan Item</th>
                  <th className="py-2.5 px-3 w-28">Kategori</th>
                  <th className="py-2.5 px-3 w-16 text-center">Kuantiti</th>
                  <th className="py-2.5 px-3 w-28">Harga Seunit</th>
                  <th className="py-2.5 px-3 w-28 text-right">Jumlah (RM)</th>
                  <th className="py-2.5 px-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white font-medium"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={item.type}
                        onChange={(e) => updateItem(item.id, "type", e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-slate-300 font-medium"
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 font-mono text-center text-white"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 font-mono text-white text-right"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-white">
                      RM {(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition"
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
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              <span>Jumlah Item: <b className="text-white">{items.length}</b></span>
            </div>

            <div className="w-full sm:w-72 rounded-xl bg-slate-950 p-3.5 space-y-2 font-mono text-xs border border-slate-800">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span>RM {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span>Diskaun ({discountPercent}%):</span>
                <span>- RM {discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-white border-t border-slate-800 pt-2">
                <span>Jumlah Bersih:</span>
                <span className="text-brand-400">RM {grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

