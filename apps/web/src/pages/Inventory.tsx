import React, { useState } from "react";
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  Tag,
  Edit3,
  Camera,
  Truck,
  X,
  Image as ImageIcon,
  ArrowDownToLine,
  CheckCircle2,
  ClipboardCheck,
  RotateCcw,
  FileText,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Product } from "../types";
import { getPartImage } from "../utils/spikeAssets";

interface RmaRecord {
  id: string;
  debitNoteNo: string;
  productName: string;
  supplier: string;
  qty: number;
  reason: string;
  date: string;
  creditAmount: number;
}

interface InventoryProps {
  products: Product[];
  onRefresh: () => void;
}

export const Inventory: React.FC<InventoryProps> = ({ products, onRefresh }) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSerialModalOpen, setIsSerialModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isGrnModalOpen, setIsGrnModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Stock Take (Kira Stok Fizikal vs Sistem)
  const [isStockTakeModalOpen, setIsStockTakeModalOpen] = useState(false);
  const [stockTakeCounts, setStockTakeCounts] = useState<Record<string, number>>({});
  const [isReconciling, setIsReconciling] = useState(false);

  // Supplier RMA / Pulangan Pembekal (Debit Note)
  const [isRmaModalOpen, setIsRmaModalOpen] = useState(false);
  const [rmaProductId, setRmaProductId] = useState("");
  const [rmaSupplier, setRmaSupplier] = useState("Hong Leong Yamaha (HLY)");
  const [rmaQty, setRmaQty] = useState("1");
  const [rmaReason, setRmaReason] = useState("Kerosakan Pengilangan (Defect)");
  const [rmaRecords, setRmaRecords] = useState<RmaRecord[]>([
    {
      id: "rma-1",
      debitNoteNo: "DN-HLY-2026-04",
      productName: "V-Belt OEM Yamaha NVX (B65)",
      supplier: "Hong Leong Yamaha (HLY)",
      qty: 2,
      reason: "Getah rekahan kilang / QC reject",
      date: "2026-09-21",
      creditAmount: 170.0,
    },
  ]);

  // Global Barcode Scanner Listener (Isu 28: Tangkap imbasan scanner hardware tanpa perlu fokus kotak input)
  React.useEffect(() => {
    let barcodeBuffer = "";
    let lastKeyTime = Date.now();

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Jika pengguna sedang menaip dalam textarea atau input lain selain carian inventori, biarkan
      const activeEl = document.activeElement;
      const isInput = activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement;
      
      const currentTime = Date.now();
      // Imbasan barcode hardware biasanya berlaku dengan kelajuan amat pantas (<60ms setiap aksara)
      if (currentTime - lastKeyTime > 120) {
        barcodeBuffer = "";
      }
      lastKeyTime = currentTime;

      if (e.key === "Enter") {
        if (barcodeBuffer.length >= 3) {
          e.preventDefault();
          setSearch(barcodeBuffer);
          const searchInput = document.getElementById("inventory-global-search");
          if (searchInput) {
            (searchInput as HTMLInputElement).focus();
          }
          barcodeBuffer = "";
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        barcodeBuffer += e.key;
        // Jika scanner menaip laju walaupun di luar input, auto tangkap
        if (barcodeBuffer.length > 5 && !isInput) {
          setSearch(barcodeBuffer);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // New product form
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Minyak");
  const [brand, setBrand] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [markupPct, setMarkupPct] = useState("30");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [rackLocation, setRackLocation] = useState("RAK-A1");
  const [binLocation, setBinLocation] = useState("");
  const [grade, setGrade] = useState("OEM");
  const [isHighValue, setIsHighValue] = useState(false);
  const [addProductImage, setAddProductImage] = useState<string>("");

  // Edit product form
  const [editProductId, setEditProductId] = useState("");
  const [editName, setEditName] = useState("");
  const [editSellingPrice, setEditSellingPrice] = useState("");
  const [editCostPrice, setEditCostPrice] = useState("");
  const [editMarkupPct, setEditMarkupPct] = useState("30");
  const [editRackLocation, setEditRackLocation] = useState("");
  const [editBinLocation, setEditBinLocation] = useState("");
  const [editGrade, setEditGrade] = useState("OEM");
  const [editMinAlertQty, setEditMinAlertQty] = useState("5");
  const [editStockQty, setEditStockQty] = useState("");
  const [editProductImage, setEditProductImage] = useState<string>("");

  // GRN (Goods Received Note) form untuk Kerani 2 (Aiman Hakimi)
  const [grnProductId, setGrnProductId] = useState("");
  const [grnQty, setGrnQty] = useState("");
  const [grnDoNumber, setGrnDoNumber] = useState("");
  const [grnSupplier, setGrnSupplier] = useState("Hong Leong Yamaha (HLY)");

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

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEditMode: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (isEditMode) {
        setEditProductImage(dataUrl);
      } else {
        setAddProductImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditProductId(prod.id);
    setEditName(prod.name);
    setEditSellingPrice(prod.sellingPrice.toString());
    setEditCostPrice(prod.costPrice?.toString() || "0");
    setEditMarkupPct(prod.markupPct?.toString() || "30");
    setEditRackLocation(prod.rackLocation);
    setEditBinLocation(prod.binLocation || "");
    setEditGrade(prod.grade || "OEM");
    setEditMinAlertQty(prod.minAlertQty?.toString() || "5");
    setEditStockQty(prod.stockQty.toString());
    setEditProductImage(prod.imageUrl || "");
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProductId) return;

    try {
      const res = await fetch(`/api/products/${editProductId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          sellingPrice: parseFloat(editSellingPrice) || 0,
          costPrice: parseFloat(editCostPrice) || 0,
          markupPct: parseFloat(editMarkupPct) || 0,
          rackLocation: editRackLocation,
          binLocation: editBinLocation,
          grade: editGrade,
          minAlertQty: parseInt(editMinAlertQty) || 5,
          stockQty: parseInt(editStockQty) || 0,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setIsEditModalOpen(false);
      onRefresh();
      alert("Kemaskini harga dan butiran alat ganti berjaya disimpan!");
    } catch (err: any) {
      alert("Ralat mengemaskini alat ganti: " + err.message);
    }
  };

  const handleReceiveGrn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grnProductId || !grnQty) return;

    try {
      const delta = parseInt(grnQty);
      const res = await fetch(`/api/products/${grnProductId}/adjust-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setIsGrnModalOpen(false);
      setGrnQty("");
      setGrnDoNumber("");
      onRefresh();
      alert(`Penerimaan stok lori berjaya direkodkan! (+${delta} unit ditambahkan ke inventori)`);
    } catch (err: any) {
      alert("Ralat merekod stok lori: " + err.message);
    }
  };

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
          costPrice: parseFloat(costPrice) || 0,
          markupPct: parseFloat(markupPct) || 0,
          sellingPrice: parseFloat(sellingPrice) || 0,
          stockQty: parseInt(stockQty) || 0,
          rackLocation,
          binLocation,
          grade,
          isHighValue,
        }),
      });
      setIsAddModalOpen(false);
      setAddProductImage("");
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

  const handleOpenStockTake = () => {
    const initialCounts: Record<string, number> = {};
    products.forEach((p) => {
      initialCounts[p.id] = p.stockQty;
    });
    setStockTakeCounts(initialCounts);
    setIsStockTakeModalOpen(true);
  };

  const handleSaveStockTake = async () => {
    setIsReconciling(true);
    try {
      for (const prod of products) {
        const physical = stockTakeCounts[prod.id] ?? prod.stockQty;
        const diff = physical - prod.stockQty;
        if (diff !== 0) {
          await fetch(`/api/products/${prod.id}/adjust-stock`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ delta: diff }),
          }).catch(() => null);
        }
      }
      setIsStockTakeModalOpen(false);
      onRefresh();
      alert("Pengiraan stok fizikal (Stock Take) berjaya direkodkan dan kuantiti sistem telah diselaraskan!");
    } catch (err: any) {
      alert("Ralat menyelaras stok: " + err.message);
    } finally {
      setIsReconciling(false);
    }
  };

  const handleProcessRma = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = parseInt(rmaQty) || 1;
    const prod = products.find((p) => p.id === rmaProductId);
    if (!prod) {
      alert("Sila pilih produk yang ingin dipulangkan.");
      return;
    }

    try {
      await fetch(`/api/products/${prod.id}/adjust-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta: -q }),
      }).catch(() => null);

      const dnNo = `DN-${rmaSupplier.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
      const newRma: RmaRecord = {
        id: `rma-${Date.now()}`,
        debitNoteNo: dnNo,
        productName: prod.name,
        supplier: rmaSupplier,
        qty: q,
        reason: rmaReason,
        date: new Date().toISOString().split("T")[0],
        creditAmount: (prod.costPrice || prod.sellingPrice * 0.7) * q,
      };

      setRmaRecords([newRma, ...rmaRecords]);
      setIsRmaModalOpen(false);
      setRmaQty("1");
      setRmaProductId("");
      onRefresh();
      alert(`Debit Note ${dnNo} berjaya dijana! Stok -${q} unit telah ditolak keluar dari inventori.`);
    } catch (err: any) {
      alert("Ralat memproses RMA: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold ">Inventori Alat Ganti & Lokasi Rak</h1>
          <p className="text-xs text-zinc-500">Pantau baki stok, kedudukan rak fizikal di bengkel, dan pendaftaran kod siri ketulenan</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenStockTake}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-800/25 border border-zinc-300 text-zinc-700 text-xs font-bold shadow-md transition-all"
          >
            <ClipboardCheck className="w-4 h-4 text-zinc-700" />
            <span>Kira Stok (Stock Take)</span>
          </button>

          <button
            onClick={() => setIsRmaModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-700 border border-red-200 text-red-700 text-xs font-bold shadow-md transition-all"
          >
            <RotateCcw className="w-4 h-4 text-red-700" />
            <span>RMA Pulangan Pembekal</span>
          </button>

          <button
            onClick={() => setIsGrnModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-700/25 border border-red-200 text-red-600 text-xs font-bold shadow-md transition-all"
          >
            <Truck className="w-4 h-4 text-red-600" />
            <span>Terima Stok (GRN)</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-lg shadow-brand-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Part Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
          <input
            id="inventory-global-search"
            type="text"
            placeholder="Cari nama part, SKU, imbas kod bar, atau kod rak (cth: RAK-B2)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none placeholder:text-zinc-400 font-medium"
          />
          <div className="absolute right-3 top-2.5 flex items-center gap-1.5 pointer-events-none">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
              ⚡ Barcode Siap
            </span>
          </div>
        </div>

        <div className="flex overflow-x-auto space-x-2 pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-brand-500 "
                  : "bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-100"
              }`}
            >
              {cat === "all" ? "Semua Kategori" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white/80 border border-zinc-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/60 text-zinc-500 border-b border-zinc-200">
              <tr>
                <th className="px-5 py-3.5 font-extrabold uppercase">Alat Ganti & SKU</th>
                <th className="px-5 py-3.5 font-extrabold uppercase">Lokasi Rak</th>
                <th className="px-5 py-3.5 font-extrabold uppercase">Baki Stok</th>
                <th className="px-5 py-3.5 font-extrabold uppercase">Harga Jual</th>
                <th className="px-5 py-3.5 font-extrabold uppercase">Modal (Kos)</th>
                <th className="px-5 py-3.5 font-extrabold uppercase">Semak Ori</th>
                <th className="px-5 py-3.5 font-extrabold uppercase text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/60">
              {filtered.map((prod) => {
                const isLow = prod.stockQty <= prod.minAlertQty;
                return (
                  <tr key={prod.id} className="hover:bg-zinc-100/40 transition-all">
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-300 flex items-center justify-center text-brand-400 font-bold overflow-hidden shrink-0">
                          {prod.imageUrl ? (
                            <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-extrabold text-zinc-900 text-sm flex items-center gap-2">
                            {prod.name}
                            {prod.grade === 'Aftermarket' ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">Aftermarket</span>
                            ) : prod.grade === 'Terpakai' ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-500/20 text-zinc-400 border border-zinc-500/30">Terpakai</span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-300">OEM</span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                            SKU: {prod.sku} • {prod.brand}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-600 font-mono font-bold w-fit">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Kedai: {prod.rackLocation}</span>
                        </div>
                        {prod.binLocation && (
                          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 border border-zinc-300 text-zinc-700 font-mono font-bold w-fit">
                            <Tag className="w-3.5 h-3.5" />
                            <span>Bin: {prod.binLocation}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-extrabold text-sm px-2.5 py-0.5 rounded-lg ${
                            isLow
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-emerald-50 text-emerald-400 border border-emerald-200"
                          }`}
                        >
                          {prod.stockQty} unit
                        </span>
                        {isLow && (
                          <span title="Stok kritikal!">
                            <AlertTriangle className="w-4 h-4 text-red-700" />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-extrabold text-sm">
                        RM {prod.sellingPrice.toFixed(2)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-zinc-500">
                        RM {(prod.costPrice || 0).toFixed(2)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {prod.isHighValue ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-zinc-700 px-2 py-0.5 rounded bg-zinc-100 border border-zinc-300">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Serial Ori Sah</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-400">Biasa</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-100 text-brand-400 border border-zinc-300 font-bold text-xs flex items-center gap-1 transition"
                          title="Kemaskini harga, kos, rak & gambar"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Kemaskini</span>
                        </button>
                        <button
                          onClick={() => handleAdjustStock(prod.id, 1)}
                          className="px-2 py-1 rounded bg-white hover:bg-zinc-100 text-zinc-700 font-bold text-xs"
                          title="Tambah 1 unit"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => handleAdjustStock(prod.id, -1)}
                          className="px-2 py-1 rounded bg-white hover:bg-zinc-100 text-zinc-700 font-bold text-xs"
                          title="Tolak 1 unit"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(prod);
                            setIsSerialModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-800/25 text-zinc-700 border border-zinc-300 font-bold text-xs"
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
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold ">Tambah Alat Ganti Baharu</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-600">Nama Alat Ganti *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Spark Plug NGK Laser Iridium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs focus:border-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600">SKU Unik *</label>
                  <input
                    type="text"
                    required
                    placeholder="SPK-NGK-01"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono uppercase focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs focus:border-brand-500 outline-none"
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
                  <label className="text-xs font-bold text-zinc-600">Jenama</label>
                  <input
                    type="text"
                    placeholder="Yamalube, Honda, NGK"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600">Lokasi Rak Kedai</label>
                  <input
                    type="text"
                    placeholder="RAK-B2"
                    value={rackLocation}
                    onChange={(e) => setRackLocation(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs uppercase font-mono focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600">Lokasi Rak Mekanik (Bin)</label>
                  <input
                    type="text"
                    placeholder="cth: RAK-B2, TINGKAT-3"
                    value={binLocation}
                    onChange={(e) => setBinLocation(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs uppercase font-mono focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600">Kos (RM)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="25.00"
                    value={costPrice}
                    onChange={(e) => {
                      const cp = e.target.value;
                      setCostPrice(cp);
                      const pct = parseFloat(markupPct) || 0;
                      setSellingPrice(((parseFloat(cp) || 0) * (1 + pct / 100)).toFixed(2));
                    }}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600">Margin (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="30"
                    value={markupPct}
                    onChange={(e) => {
                      const pct = e.target.value;
                      setMarkupPct(pct);
                      const cp = parseFloat(costPrice) || 0;
                      setSellingPrice((cp * (1 + (parseFloat(pct) || 0) / 100)).toFixed(2));
                    }}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600">Jual (RM)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="40.00"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600">Kuantiti Awal</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600">Klasifikasi (Grade)</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs focus:border-brand-500 outline-none"
                  >
                    <option value="OEM">OEM (Tulen Kilang)</option>
                    <option value="Aftermarket">Aftermarket (Selepas Pasaran)</option>
                    <option value="Terpakai">Terpakai (Used)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isHigh"
                  checked={isHighValue}
                  onChange={(e) => setIsHighValue(e.target.checked)}
                  className="rounded border-zinc-200 bg-zinc-50 text-brand-500"
                />
                <label htmlFor="isHigh" className="text-xs text-zinc-600 cursor-pointer">
                  Item Ori Bernilai Tinggi (Boleh daftar kod siri pengesahan)
                </label>
              </div>

              {/* Muat Naik Foto Alat Ganti */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-zinc-600 flex items-center justify-between">
                  <span>Foto Alat Ganti (Kamera / Fail)</span>
                  {addProductImage && <span className="text-[10px] text-emerald-400 font-bold">✓ Foto Dipilih</span>}
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/70 hover:bg-zinc-50 hover:border-brand-500 text-zinc-600 text-xs font-medium transition">
                    <Camera className="w-4 h-4 text-brand-400" />
                    <span>Tangkap / Pilih Gambar</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileChange(e, false)}
                    />
                  </label>
                  {addProductImage && (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-zinc-300 shrink-0">
                      <img src={addProductImage} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setAddProductImage("")}
                        className="absolute top-0.5 right-0.5 p-0.5 bg-black/80 rounded-full text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white text-xs font-bold"
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

      {/* MODAL: TERIMA STOK LORI (GRN - GOODS RECEIVED NOTE) UNTUK AIMAN HAKIMI */}
      {isGrnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-red-200 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
              <div className="flex items-center space-x-2 text-red-600">
                <Truck className="w-5 h-5" />
                <h3 className="text-lg font-bold ">Penerimaan Stok Lori (GRN)</h3>
              </div>
              <button
                onClick={() => setIsGrnModalOpen(false)}
                className="p-1 rounded-lg text-zinc-500 hover:text-red-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-500">
              Tanggungjawab Kerani 2 (Aiman Hakimi): Sahkan penghantaran daripada lori pembekal berserta nombor DO rasmi.
            </p>

            <form onSubmit={handleReceiveGrn} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-zinc-600">Pilih Alat Ganti Diterima *</label>
                <select
                  required
                  value={grnProductId}
                  onChange={(e) => setGrnProductId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs focus:border-red-600 outline-none"
                >
                  <option value="">-- Sila Pilih Alat Ganti --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Baki Semasa: {p.stockQty} unit | {p.rackLocation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600">Kuantiti Masuk (Unit) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Contoh: 24"
                    value={grnQty}
                    onChange={(e) => setGrnQty(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-red-600 font-bold text-sm focus:border-red-600 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600">No. DO Lori / Invois *</label>
                  <input
                    type="text"
                    required
                    placeholder="DO-YAM-99881"
                    value={grnDoNumber}
                    onChange={(e) => setGrnDoNumber(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 font-mono text-xs uppercase focus:border-red-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600">Nama Pembekal Penghantar</label>
                <input
                  type="text"
                  value={grnSupplier}
                  onChange={(e) => setGrnSupplier(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs focus:border-red-600 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsGrnModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md shadow-red-600/20"
                >
                  Sahkan & Tambah Baki Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KEMASKINI HARGA, KOS, RAK & GAMBAR ALAT GANTI */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
              <div className="flex items-center space-x-2 text-brand-400">
                <Edit3 className="w-5 h-5" />
                <h3 className="text-lg font-bold ">Kemaskini Maklumat Alat Ganti</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-zinc-500 hover:text-red-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-zinc-600">Nama Alat Ganti *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs focus:border-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600">Harga Kos Modal (RM)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editCostPrice}
                    onChange={(e) => {
                      const cp = e.target.value;
                      setEditCostPrice(cp);
                      const pct = parseFloat(editMarkupPct) || 0;
                      setEditSellingPrice(((parseFloat(cp) || 0) * (1 + pct / 100)).toFixed(2));
                    }}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 font-mono text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600">Margin (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editMarkupPct}
                    onChange={(e) => {
                      const pct = e.target.value;
                      setEditMarkupPct(pct);
                      const cp = parseFloat(editCostPrice) || 0;
                      setEditSellingPrice((cp * (1 + (parseFloat(pct) || 0) / 100)).toFixed(2));
                    }}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 font-mono text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600">Harga Jualan (RM) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editSellingPrice}
                    onChange={(e) => setEditSellingPrice(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-emerald-400 font-black text-sm focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600">Lokasi Rak Kedai</label>
                  <input
                    type="text"
                    value={editRackLocation}
                    onChange={(e) => setEditRackLocation(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-red-600 font-mono text-xs uppercase focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600">Lokasi Rak Mekanik (Bin)</label>
                  <input
                    type="text"
                    placeholder="cth: RAK-B2, TINGKAT-3"
                    value={editBinLocation}
                    onChange={(e) => setEditBinLocation(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-red-600 font-mono text-xs uppercase focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600">Had Amaran Rendah</label>
                  <input
                    type="number"
                    value={editMinAlertQty}
                    onChange={(e) => setEditMinAlertQty(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600">Klasifikasi (Grade)</label>
                  <select
                    value={editGrade}
                    onChange={(e) => setEditGrade(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs focus:border-brand-500 outline-none"
                  >
                    <option value="OEM">OEM (Tulen Kilang)</option>
                    <option value="Aftermarket">Aftermarket (Selepas Pasaran)</option>
                    <option value="Terpakai">Terpakai (Used)</option>
                  </select>
                </div>
              </div>

              {/* Muat Naik / Ganti Foto Alat Ganti */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 flex items-center justify-between">
                  <span>Muat Naik / Kemaskini Gambar Part</span>
                  {editProductImage && <span className="text-[10px] text-emerald-400 font-bold">✓ Foto Aktif</span>}
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/70 hover:bg-zinc-50 hover:border-brand-500 text-zinc-600 text-xs font-medium transition">
                    <Camera className="w-4 h-4 text-brand-400" />
                    <span>Ambil Foto / Pilih Fail Baharu</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileChange(e, true)}
                    />
                  </label>
                  {editProductImage && (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-zinc-300 shrink-0">
                      <img src={editProductImage} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setEditProductImage("")}
                        className="absolute top-0.5 right-0.5 p-0.5 bg-black/80 rounded-full text-red-700"
                        title="Buang gambar"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-600 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-black shadow-md shadow-brand-500/20"
                >
                  Simpan Kemaskini
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DAFTAR KOD SIRI UNIK ORI */}
      {isSerialModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-300 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center space-x-2 text-zinc-700">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-lg font-bold ">Daftar Kod Siri Tulen</h3>
            </div>
            <p className="text-xs text-zinc-500">
              Untuk: <span className="font-bold ">{selectedProduct.name}</span>. Kod ini akan disimpan untuk membolehkan mekanik & pelanggan menyemak keaslian barang.
            </p>

            <form onSubmit={handleAddSerial} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-600">Kod Siri Unik (Serial No / QR Code) *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: YAM-2026-998811"
                  value={newSerial}
                  onChange={(e) => setNewSerial(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono uppercase focus:border-zinc-300 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600">No. Batch Kilang</label>
                  <input
                    type="text"
                    value={newBatch}
                    onChange={(e) => setNewBatch(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono focus:border-zinc-300 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600">Pembekal / Hub Sah</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs focus:border-zinc-300 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSerialModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold"
                >
                  Daftarkan Kod Sah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: KIRA STOK FIZIKAL (STOCK TAKE) */}
      {isStockTakeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-3xl max-w-4xl w-full p-6 shadow-none space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-zinc-100 text-zinc-700 border border-zinc-300">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black ">Kiraan Fizikal Stok Bengkel (Stock Take)</h3>
                  <p className="text-[11px] text-zinc-500">Padankan baki fizikal di rak dengan rekod sistem FFmotor</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStockTakeModalOpen(false)}
                className="text-zinc-500 hover:text-red-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              <div className="p-3 bg-zinc-100 border border-zinc-300 rounded-2xl text-xs text-zinc-700 flex items-center justify-between">
                <span>
                  💡 Kira baki sebenar di setiap rak fizikal dan taipkan pada kolum *Kiraan Fizikal*. Varians akan diselaraskan secara automatik.
                </span>
                <span className="font-mono font-bold bg-white px-3 py-1 rounded-xl border border-zinc-200">
                  {products.length} Alat Ganti
                </span>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider text-[10px] bg-white/60">
                      <th className="py-3 px-4">Nama Alat Ganti & SKU</th>
                      <th className="py-3 px-3 text-center">Rak</th>
                      <th className="py-3 px-3 text-center">Baki Sistem</th>
                      <th className="py-3 px-3 text-center">Kiraan Fizikal</th>
                      <th className="py-3 px-3 text-center">Varians</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/60 font-mono">
                    {products.map((p) => {
                      const count = stockTakeCounts[p.id] ?? p.stockQty;
                      const diff = count - p.stockQty;
                      return (
                        <tr key={p.id} className="hover:bg-white/40 transition">
                          <td className="py-2.5 px-4 font-sans">
                            <p className="font-bold ">{p.name}</p>
                            <span className="text-[10px] text-zinc-400 font-mono">{p.sku}</span>
                          </td>
                          <td className="py-2.5 px-3 text-center text-zinc-500 text-[11px]">
                            {p.rackLocation || "-"}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-zinc-600">
                            {p.stockQty}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="number"
                              min="0"
                              value={count}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setStockTakeCounts((prev) => ({ ...prev, [p.id]: val }));
                              }}
                              className="w-20 bg-white border border-zinc-300 text-center font-bold rounded-xl py-1 text-xs focus:border-zinc-300 outline-none"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">
                            {diff === 0 ? (
                              <span className="text-emerald-400 font-mono text-[11px]">Tally (0)</span>
                            ) : diff > 0 ? (
                              <span className="text-red-600 font-mono text-[11px]">+{diff} (Lebih)</span>
                            ) : (
                              <span className="text-red-700 font-mono text-[11px]">{diff} (Kurang)</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="shrink-0 pt-2 flex justify-between items-center border-t border-zinc-200">
              <span className="text-xs text-zinc-500">
                Sistem akan mengemas kini kuantiti fizikal sebenar ke dalam pangkalan data.
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsStockTakeModalOpen(false)}
                  className="bg-white hover:bg-zinc-100 text-zinc-600 font-bold px-4 py-2 rounded-xl text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveStockTake}
                  disabled={isReconciling}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white font-black px-5 py-2 rounded-xl text-xs transition shadow-lg flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isReconciling ? "animate-spin" : ""}`} />
                  <span>{isReconciling ? "Menyelaras..." : "Laras Baki Sebenar"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PULANGAN PEMBEKAL (SUPPLIER RMA / DEBIT NOTE) */}
      {isRmaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-3xl max-w-2xl w-full p-6 shadow-none space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-50 text-red-700 border border-red-200">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black ">Pulangan Pembekal & Debit Note (RMA)</h3>
                  <p className="text-[11px] text-zinc-500">Hantar balik alat ganti rosak/cacat kilang untuk tuntutan kredit</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRmaModalOpen(false)}
                className="text-zinc-500 hover:text-red-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProcessRma} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 font-bold mb-1">Pilih Alat Ganti Rosak</label>
                  <select
                    value={rmaProductId}
                    onChange={(e) => setRmaProductId(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-2.5 font-bold focus:border-rose-500 outline-none"
                    required
                  >
                    <option value="">-- Pilih Alat Ganti --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Baki: {p.stockQty})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-500 font-bold mb-1">Nama Pembekal / Pengedar</label>
                  <select
                    value={rmaSupplier}
                    onChange={(e) => setRmaSupplier(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-2.5 font-bold focus:border-rose-500 outline-none"
                  >
                    <option value="Hong Leong Yamaha (HLY)">Hong Leong Yamaha (HLY)</option>
                    <option value="Boon Siew Honda (BSH)">Boon Siew Honda (BSH)</option>
                    <option value="Motul Malaysia HQ">Motul Malaysia HQ</option>
                    <option value="Maxxis Tyre Distributor">Maxxis Tyre Distributor</option>
                    <option value="RCB Racing Boy Parts">RCB Racing Boy Parts</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 font-bold mb-1">Kuantiti Dipulangkan</label>
                  <input
                    type="number"
                    min="1"
                    value={rmaQty}
                    onChange={(e) => setRmaQty(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 text-red-700 font-black text-base rounded-xl p-2 focus:border-rose-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 font-bold mb-1">Punca / Sebab Pulangan</label>
                  <select
                    value={rmaReason}
                    onChange={(e) => setRmaReason(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-2.5 focus:border-rose-500 outline-none"
                  >
                    <option value="Kerosakan Pengilangan (Defect)">Kerosakan Pengilangan (Defect)</option>
                    <option value="Kotak Kemek / Cecair Bocor Semasa Lori">Kotak Kemek / Cecair Bocor Semasa Lori</option>
                    <option value="Salah Hantar Kod Bahagian (Salah Part)">Salah Hantar Kod Bahagian (Salah Part)</option>
                    <option value="Tamat Tarikh Luput / QC Fail">Tamat Tarikh Luput / QC Fail</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-2.5 rounded-xl shadow-lg transition"
                >
                  Jana Debit Note & Tolak Stok
                </button>
                <button
                  type="button"
                  onClick={() => setIsRmaModalOpen(false)}
                  className="bg-white hover:bg-zinc-100 text-zinc-600 font-bold px-4 py-2.5 rounded-xl transition"
                >
                  Batal
                </button>
              </div>
            </form>

            {/* Rekod RMA Sedia Ada */}
            <div className="pt-3 border-t border-zinc-200 space-y-2">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                Sejarah Debit Note & Pulangan Pembekal ({rmaRecords.length})
              </span>
              <div className="space-y-2">
                {rmaRecords.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-700 font-mono font-bold text-xs">{r.debitNoteNo}</span>
                        <span className="text-zinc-400 font-mono text-[10px]">{r.date}</span>
                      </div>
                      <p className="font-bold mt-0.5">{r.productName} (x{r.qty})</p>
                      <p className="text-[11px] text-zinc-500">{r.supplier} · {r.reason}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-mono font-bold">
                        Tuntutan: RM {r.creditAmount.toFixed(2)}
                      </span>
                      <span className="block text-[10px] text-zinc-400 uppercase mt-0.5">Disahkan</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
