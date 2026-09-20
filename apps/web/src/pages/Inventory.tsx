import React, { useState } from "react";
import { Package, Search, Plus, AlertTriangle, ShieldCheck, MapPin, Tag } from "lucide-react";
import { Product } from "../types";

interface InventoryProps {
  products: Product[];
  onRefresh: () => void;
}

export const Inventory: React.FC<InventoryProps> = ({ products, onRefresh }) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSerialModalOpen, setIsSerialModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // New product form
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Minyak");
  const [brand, setBrand] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [rackLocation, setRackLocation] = useState("RAK-A1");
  const [isHighValue, setIsHighValue] = useState(false);

  // Serial form
  const [newSerial, setNewSerial] = useState("");
  const [newBatch, setNewBatch] = useState("BATCH-2026-A");
  const [supplier, setSupplier] = useState("Pengedar Sah Rasmi");

  const categories = ["all", "Minyak", "Belt CVT", "Brake", "Rantai & Sprocket", "Tayar", "Aksesori"];

  const filtered = products.filter((p) => {
    const matchCat = selectedCategory === "all" || p.category === selectedCategory;
    const matchQuery =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.rackLocation.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQuery;
  });

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku,
          barcode,
          name,
          category,
          brand,
          costPrice,
          sellingPrice,
          stockQty,
          rackLocation,
          isHighValue,
        }),
      });
      setIsAddModalOpen(false);
      onRefresh();
    } catch (err) {
      alert("Ralat menambah produk: " + err);
    }
  };

  const handleAddSerial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      const res = await fetch(`/api/products/${selectedProduct.id}/serials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serialNumber: newSerial,
          batchNo: newBatch,
          supplierName: supplier,
        }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);

      setIsSerialModalOpen(false);
      setNewSerial("");
      alert(`Kod siri ${newSerial} berjaya didaftarkan ke dalam pangkalan data sah FFmotor!`);
    } catch (err: any) {
      alert("Ralat daftar kod siri: " + err.message);
    }
  };

  const handleAdjustStock = async (id: string, delta: number) => {
    try {
      await fetch(`/api/products/${id}/adjust-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta }),
      });
      onRefresh();
    } catch (err) {
      alert("Ralat kemaskini stok: " + err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Inventori Alat Ganti & Lokasi Rak</h1>
          <p className="text-xs text-slate-400">Pantau baki stok, kedudukan rak fizikal di bengkel, dan pendaftaran kod siri ketulenan</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold shadow-lg shadow-brand-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Alat Ganti Baru</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Cari nama part, SKU, atau kod rak (cth: RAK-B2)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-brand-500 outline-none"
          />
        </div>

        <div className="flex overflow-x-auto space-x-2 pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-brand-500 text-white"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800"
              }`}
            >
              {cat === "all" ? "Semua Kategori" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5 font-extrabold uppercase">Alat Ganti & SKU</th>
                <th className="px-5 py-3.5 font-extrabold uppercase">Lokasi Rak</th>
                <th className="px-5 py-3.5 font-extrabold uppercase">Baki Stok</th>
                <th className="px-5 py-3.5 font-extrabold uppercase">Harga Jual</th>
                <th className="px-5 py-3.5 font-extrabold uppercase">Semak Ori</th>
                <th className="px-5 py-3.5 font-extrabold uppercase text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((prod) => {
                const isLow = prod.stockQty <= prod.minAlertQty;
                return (
                  <tr key={prod.id} className="hover:bg-slate-800/40 transition-all">
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400 font-bold">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-white text-sm">{prod.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            SKU: {prod.sku} • {prod.brand}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono font-bold">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{prod.rackLocation}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-extrabold text-sm px-2.5 py-0.5 rounded-lg ${
                            isLow
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {prod.stockQty} unit
                        </span>
                        {isLow && (
                          <span title="Stok kritikal!">
                            <AlertTriangle className="w-4 h-4 text-rose-400" />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-extrabold text-white text-sm">
                        RM {prod.sellingPrice.toFixed(2)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {prod.isHighValue ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Serial Ori Sah</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">Biasa</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleAdjustStock(prod.id, 1)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                          title="Tambah 1 unit"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => handleAdjustStock(prod.id, -1)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                          title="Tolak 1 unit"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(prod);
                            setIsSerialModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 font-bold text-xs"
                        >
                          + Kod Siri
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: TAMBAH PRODUK BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Tambah Alat Ganti Baharu</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300">Nama Alat Ganti *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Spark Plug NGK Laser Iridium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">SKU Unik *</label>
                  <input
                    type="text"
                    required
                    placeholder="SPK-NGK-01"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono uppercase focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-brand-500 outline-none"
                  >
                    <option value="Minyak">Minyak Enjin / Gear</option>
                    <option value="Belt CVT">Belt CVT / Roller</option>
                    <option value="Brake">Brake Pad / Disc</option>
                    <option value="Rantai & Sprocket">Rantai & Sprocket</option>
                    <option value="Tayar">Tayar & Tiub</option>
                    <option value="Enjin">Piston / Blok / Gasket</option>
                    <option value="Aksesori">Aksesori & Lampu</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">Jenama</label>
                  <input
                    type="text"
                    placeholder="Yamalube, Honda, NGK"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Lokasi Rak di Kedai</label>
                  <input
                    type="text"
                    placeholder="RAK-B2"
                    value={rackLocation}
                    onChange={(e) => setRackLocation(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs uppercase font-mono focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">Kos (RM)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="25.00"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Jual (RM)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="40.00"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Kuantiti Awal</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isHigh"
                  checked={isHighValue}
                  onChange={(e) => setIsHighValue(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-brand-500"
                />
                <label htmlFor="isHigh" className="text-xs text-slate-300 cursor-pointer">
                  Item Ori Bernilai Tinggi (Boleh daftar kod siri pengesahan)
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DAFTAR KOD SIRI UNIK ORI */}
      {isSerialModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center space-x-2 text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white">Daftar Kod Siri Tulen</h3>
            </div>
            <p className="text-xs text-slate-400">
              Untuk: <span className="font-bold text-white">{selectedProduct.name}</span>. Kod ini akan disimpan untuk membolehkan mekanik & pelanggan menyemak keaslian barang.
            </p>

            <form onSubmit={handleAddSerial} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300">Kod Siri Unik (Serial No / QR Code) *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: YAM-2026-998811"
                  value={newSerial}
                  onChange={(e) => setNewSerial(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono uppercase focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">No. Batch Kilang</label>
                  <input
                    type="text"
                    value={newBatch}
                    onChange={(e) => setNewBatch(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Pembekal / Hub Sah</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSerialModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold"
                >
                  Daftarkan Kod Sah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
