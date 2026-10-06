import React, { useState } from "react";
import { Bike, Plus, CheckCircle2, DollarSign, Tag, Sparkles, User, Phone, CreditCard, Edit3, Camera, Upload, Lock, X, Image as ImageIcon, RefreshCw } from "lucide-react";
import { Motorcycle } from "../types";

interface MotorSalesProps {
  motorcycles: Motorcycle[];
  onRefresh: () => void;
}

export const MotorSales: React.FC<MotorSalesProps> = ({ motorcycles, onRefresh }) => {
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTradeInModalOpen, setIsTradeInModalOpen] = useState(false);
  const [selectedBike, setSelectedBike] = useState<Motorcycle | null>(null);

  // Add bike form
  const [brand, setBrand] = useState("Yamaha");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("2024");
  const [color, setColor] = useState("");
  const [engineNo, setEngineNo] = useState("");
  const [chassisNo, setChassisNo] = useState("");
  const [condition, setCondition] = useState<"new" | "used">("new");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [addBikeImage, setAddBikeImage] = useState<string>("");

  // Edit bike form
  const [editBikeId, setEditBikeId] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editSellingPrice, setEditSellingPrice] = useState("");
  const [editCostPrice, setEditCostPrice] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editStatus, setEditStatus] = useState<string>("available");
  const [editNotes, setEditNotes] = useState("");
  const [editBikeImage, setEditBikeImage] = useState<string>("");

  // Sell bike form
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerIc, setCustomerIc] = useState("");
  const [paymentType, setPaymentType] = useState<"cash" | "loan_bank" | "credit_kedai">("cash");
  const [salePrice, setSalePrice] = useState("");
  const [depositPaid, setDepositPaid] = useState("");
  const [assignedPlate, setAssignedPlate] = useState("");
  const [keyLockerLocation, setKeyLockerLocation] = useState("Peti Kunci Laci A-3");
  const [giftHelmet, setGiftHelmet] = useState(true);
  const [giftRaincoat, setGiftRaincoat] = useState(true);
  const [giftDiscLock, setGiftDiscLock] = useState(true);
  const [giftTshirt, setGiftTshirt] = useState(true);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEditMode: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Baca fail imej tempatan sebagai Data URL untuk preview segera
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (isEditMode) {
        setEditBikeImage(dataUrl);
      } else {
        setAddBikeImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenEditModal = (bike: Motorcycle) => {
    setEditBikeId(bike.id);
    setEditBrand(bike.brand);
    setEditModel(bike.model);
    setEditSellingPrice(bike.sellingPrice.toString());
    setEditCostPrice(bike.costPrice?.toString() || "0");
    setEditColor(bike.color);
    setEditStatus(bike.status);
    setEditNotes(bike.notes || "");
    setEditBikeImage(bike.images?.[0] || (bike.notes?.startsWith("data:image") ? bike.notes : ""));
    setIsEditModalOpen(true);
  };

  const handleUpdateBike = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBikeId) return;

    try {
      const res = await fetch(`/api/sales/motorcycles/${editBikeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellingPrice: parseFloat(editSellingPrice) || 0,
          costPrice: parseFloat(editCostPrice) || 0,
          color: editColor,
          status: editStatus,
          notes: editBikeImage || editNotes,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setIsEditModalOpen(false);
      onRefresh();
      alert("Kemaskini harga dan butiran motosikal berjaya disimpan!");
    } catch (err: any) {
      alert("Ralat mengemaskini motosikal: " + err.message);
    }
  };

  const handleCreateBike = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/sales/motorcycles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand,
          model,
          year: parseInt(year),
          color,
          engineNo,
          chassisNo,
          condition,
          costPrice: parseFloat(costPrice) || 0,
          sellingPrice: parseFloat(sellingPrice) || 0,
          notes: addBikeImage || notes,
        }),
      });
      setIsAddModalOpen(false);
      setAddBikeImage("");
      onRefresh();
    } catch (err) {
      alert("Ralat menambah motor: " + err);
    }
  };

  const handleSellBike = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBike) return;

    try {
      const res = await fetch("/api/sales/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motorcycleId: selectedBike.id,
          customerName,
          customerPhone,
          customerIc,
          paymentType,
          salePrice: parseFloat(salePrice) || selectedBike.sellingPrice,
          depositPaid: parseFloat(depositPaid) || 0,
          assignedPlateNumber: assignedPlate,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setIsSellModalOpen(false);
      onRefresh();
      alert("Tahniah! Jualan motosikal berjaya direkodkan. Profil kenderaan dan Digital Passport telah dicipta secara automatik!");
    } catch (err: any) {
      alert("Ralat memproses jualan: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900">Showroom & Jualan Motosikal</h1>
          <p className="text-xs text-zinc-500">Pengurusan unit motor baharu & terpakai, pendaftaran JPJ dan integrasi kitaran servis</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsTradeInModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-sm font-bold shadow-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Penilaian Tukar Beli</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Daftar Stok Baru</span>
          </button>
        </div>
      </div>

      {/* Bike Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {motorcycles.map((bike) => {
          const isSold = bike.status === "sold";
          const imageUrl = bike.images?.[0] || (bike.notes?.startsWith("data:image") ? bike.notes : null);

          return (
            <div
              key={bike.id}
              className={`bg-white border rounded-3xl p-5 space-y-4 transition-all relative overflow-hidden flex flex-col justify-between ${
                isSold ? "border-zinc-200 opacity-70" : "border-zinc-200 hover:border-brand-500/40"
              }`}
            >
              <div className="space-y-4">
                {/* Photo Banner */}
                {imageUrl ? (
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-200">
                    <img src={imageUrl} alt={bike.model} className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/10 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3 text-brand-400" /> Foto Sebenar
                    </span>
                  </div>
                ) : (
                  <div className="h-28 w-full rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600">
                    <div className="flex flex-col items-center gap-1">
                      <Bike className="w-8 h-8 opacity-40 text-red-600" />
                      <span className="text-[10px] text-zinc-600 font-bold">Tiada Foto • Tekan Kemaskini untuk Muat Naik</span>
                    </div>
                  </div>
                )}

                {/* Badges */}
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      bike.condition === "new"
                        ? "bg-emerald-50 text-emerald-400 border-emerald-200"
                        : "bg-zinc-100 text-zinc-700 border-zinc-300"
                    }`}
                  >
                    {bike.condition === "new" ? "Baru (0 KM)" : "Terpakai (Used)"}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {bike.status === "booked" && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-red-600" /> Dikunci
                      </span>
                    )}
                    {bike.status === "loan_pending" && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-300">
                        Loan Diproses
                      </span>
                    )}
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        isSold
                          ? "bg-zinc-100 text-zinc-500"
                          : "bg-brand-500/15 text-brand-400 border border-brand-500/30"
                      }`}
                    >
                      {isSold ? "Telah Terjual" : "Dalam Stok"}
                    </span>
                  </div>
                </div>

                {/* Title & Info */}
                <div>
                  <span className="text-xs font-bold text-zinc-500">{bike.brand} • {bike.year}</span>
                  <h3 className="text-lg font-black text-zinc-900">{bike.model}</h3>
                  <p className="text-xs text-zinc-500 font-medium">Warna: <span className="text-zinc-700">{bike.color}</span></p>
                </div>

                {/* Identifiers */}
                <div className="bg-zinc-50/60 rounded-xl p-3 border border-zinc-200/80 text-[11px] font-mono space-y-1">
                  <div className="flex justify-between text-zinc-500">
                    <span>No. Enjin:</span>
                    <span className="text-zinc-900 font-bold">{bike.engineNo}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>No. Chasis:</span>
                    <span className="text-zinc-900 font-bold">{bike.chassisNo}</span>
                  </div>
                </div>

                {/* Pipeline Status */}
                {(bike.status === "booked" || bike.status === "loan_pending" || bike.status === "sold") && (
                  <div className="mt-3 space-y-1.5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Status Pipeline MySikap:</span>
                    <div className="flex gap-1 h-2 w-full">
                      <div className="flex-1 rounded-full bg-zinc-950" title="Kunci Tempahan"></div>
                      <div className={`flex-1 rounded-full ${bike.status === 'loan_pending' || bike.status === 'sold' ? 'bg-zinc-950' : 'bg-red-600'}`} title="Kelulusan Pinjaman"></div>
                      <div className={`flex-1 rounded-full ${bike.status === 'sold' ? 'bg-zinc-950' : bike.status === 'loan_pending' ? 'bg-red-600' : 'bg-zinc-200'}`} title="Bayaran Penuh"></div>
                      <div className={`flex-1 rounded-full ${bike.status === 'sold' ? 'bg-zinc-950' : 'bg-zinc-200'}`} title="Pendaftaran JPJ"></div>
                      <div className={`flex-1 rounded-full ${bike.status === 'sold' ? 'bg-zinc-950' : 'bg-zinc-200'}`} title="Cetakan Plat & Insurans"></div>
                      <div className={`flex-1 rounded-full ${bike.status === 'sold' ? 'bg-zinc-950' : 'bg-zinc-200'}`} title="Penyerahan Kunci"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Price & Action */}
              <div className="pt-3 mt-2 border-t border-zinc-200/80 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Harga Jualan</span>
                  <div className="text-lg font-black text-emerald-400">
                    RM {bike.sellingPrice.toFixed(2)}
                  </div>
                  {bike.costPrice > 0 && (
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Modal: RM {bike.costPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(bike)}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-700 font-bold text-xs flex items-center gap-1 transition"
                    title="Kemaskini harga, gambar & status"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-brand-400" />
                    <span>Kemaskini</span>
                  </button>

                  {!isSold && (
                    <button
                      onClick={() => {
                        setSelectedBike(bike);
                        setSalePrice(bike.sellingPrice.toString());
                        setIsSellModalOpen(true);
                      }}
                      className="px-3 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all"
                    >
                      Daftar Jual
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: DAFTAR STOK MOTOR BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 flex items-center space-x-2">
              <Bike className="w-5 h-5 text-brand-500" />
              <span>Daftar Stok Motosikal Baharu</span>
            </h3>

            <form onSubmit={handleCreateBike} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600">Jenama</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs focus:border-brand-500 outline-none"
                  >
                    <option value="Yamaha">Yamaha</option>
                    <option value="Honda">Honda</option>
                    <option value="Modenas">Modenas</option>
                    <option value="Kawasaki">Kawasaki</option>
                    <option value="Suzuki">Suzuki</option>
                    <option value="SYM">SYM</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600">Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: NVX 155 ABS"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600">Tahun</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600">Warna</label>
                  <input
                    type="text"
                    placeholder="Cyan Blue"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600">Kondisi</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs focus:border-brand-500 outline-none"
                  >
                    <option value="new">Baru</option>
                    <option value="used">Used / 2nd</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600">No. Enjin *</label>
                  <input
                    type="text"
                    required
                    placeholder="G3E9-00123"
                    value={engineNo}
                    onChange={(e) => setEngineNo(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs font-mono uppercase focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600">No. Chasis (VIN) *</label>
                  <input
                    type="text"
                    required
                    placeholder="MH3SE892..."
                    value={chassisNo}
                    onChange={(e) => setChassisNo(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs font-mono uppercase focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600">Harga Modal (RM)</label>
                  <input
                    type="number"
                    placeholder="8500"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600">Harga Jualan (RM) *</label>
                  <input
                    type="number"
                    required
                    placeholder="9800"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              {/* Muat Naik Foto Motosikal */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 flex items-center justify-between">
                  <span>Foto Motosikal (Kamera Telefon / Fail PC)</span>
                  {addBikeImage && <span className="text-[10px] text-emerald-400 font-bold">✓ Foto Dipilih</span>}
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/70 hover:bg-zinc-50 hover:border-brand-500 text-zinc-600 text-xs font-medium transition">
                    <Camera className="w-4 h-4 text-brand-400" />
                    <span>Tangkap / Pilih Gambar</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileChange(e, false)}
                    />
                  </label>
                  {addBikeImage && (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-zinc-300 shrink-0">
                      <img src={addBikeImage} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setAddBikeImage("")}
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
                  Simpan ke Showroom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DAFTAR JUALAN MOTOR (AUTO MASUK VEHICLES!) */}
      {isSellModalOpen && selectedBike && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Daftar Jualan Motosikal</span>
            </h3>
            <p className="text-xs text-zinc-500">
              Unit: <span className="font-bold text-zinc-900">{selectedBike.brand} {selectedBike.model}</span> ({selectedBike.color})
            </p>

            <form onSubmit={handleSellBike} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-600">Nama Pembeli *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Danish"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs focus:border-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600">No. Telefon *</label>
                  <input
                    type="text"
                    required
                    placeholder="0112345678"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600">No. Kad Pengenalan (IC)</label>
                  <input
                    type="text"
                    placeholder="010203-10-1234"
                    value={customerIc}
                    onChange={(e) => setCustomerIc(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600">Kaedah Bayaran</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs focus:border-brand-500 outline-none"
                  >
                    <option value="cash">Tunai Penuh (Cash)</option>
                    <option value="loan_bank">Loan Bank / Chailease</option>
                    <option value="credit_kedai">Kredit Kedai</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600">Harga Jual Akhir (RM)</label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs focus:border-brand-500 outline-none font-bold text-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600">No. Plat Baru Didaftarkan (JPJ) *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: VKC 9912"
                  value={assignedPlate}
                  onChange={(e) => setAssignedPlate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs font-mono uppercase font-black focus:border-brand-500 outline-none"
                />
                <p className="text-[10px] text-red-600 mt-1">
                  ⚡ Auto-Sync: No plat ini akan terus dimasukkan ke pangkalan data servis kenderaan dengan Digital Passport Skor 100!
                </p>
              </div>

              {/* Protokol Serah Kunci: Lokasi Kunci & Geran VOC */}
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 space-y-2">
                <label className="text-xs font-bold text-zinc-600 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-red-600" />
                  <span>Lokasi Peti Kunci & Geran VOC Asal</span>
                </label>
                <input
                  type="text"
                  placeholder="cth: Peti Kunci Laci A-3 / Bilik Pengurus"
                  value={keyLockerLocation}
                  onChange={(e) => setKeyLockerLocation(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-zinc-300 text-xs focus:border-red-600 outline-none"
                />
              </div>

              {/* Protokol Serah Kunci: Kit Hadiah Percuma */}
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 space-y-2">
                <label className="text-xs font-bold text-zinc-600 block">
                  🎁 Kit Hadiah Percuma (Wajib Semak Sebelum Serah):
                </label>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-600">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={giftHelmet}
                      onChange={(e) => setGiftHelmet(e.target.checked)}
                      className="rounded accent-brand-500"
                    />
                    <span>Helmet SIRIM (SGV/Index)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={giftRaincoat}
                      onChange={(e) => setGiftRaincoat(e.target.checked)}
                      className="rounded accent-brand-500"
                    />
                    <span>Baju Hujan Oxford/Givi</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={giftDiscLock}
                      onChange={(e) => setGiftDiscLock(e.target.checked)}
                      className="rounded accent-brand-500"
                    />
                    <span>Kunci Cakera (Disc Lock)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={giftTshirt}
                      onChange={(e) => setGiftTshirt(e.target.checked)}
                      className="rounded accent-brand-500"
                    />
                    <span>Baju-T Rasmi FFmotor</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSellModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-black"
                >
                  Sahkan Jualan & Daftar Plat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PENILAIAN TUKAR BELI */}
      {isTradeInModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
              <h3 className="text-lg font-bold text-zinc-900 flex items-center space-x-2">
                <RefreshCw className="w-5 h-5 text-red-600" />
                <span>Borang Penilaian Tukar Beli</span>
              </h3>
              <button
                onClick={() => setIsTradeInModalOpen(false)}
                className="p-1 rounded-lg text-zinc-500 hover:text-zinc-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="space-y-3.5" onSubmit={(e) => { e.preventDefault(); alert("Sebutharga dijana!"); setIsTradeInModalOpen(false); }}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600">No. Plat Motor Lama</label>
                  <input type="text" required className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm focus:border-red-600 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600">Model & Tahun</label>
                  <input type="text" required className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm focus:border-red-600 outline-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600">Anggaran Baki Hutang Lama (RM)</label>
                <input type="number" className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm focus:border-red-600 outline-none" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600">Tayar</label>
                  <select className="w-full mt-1 px-2 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs focus:border-red-600 outline-none">
                    <option>Baik</option><option>Sederhana</option><option>Rosak</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600">Badan</label>
                  <select className="w-full mt-1 px-2 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs focus:border-red-600 outline-none">
                    <option>Baik</option><option>Sederhana</option><option>Rosak</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600">Enjin</label>
                  <select className="w-full mt-1 px-2 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs focus:border-red-600 outline-none">
                    <option>Baik</option><option>Sederhana</option><option>Rosak</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600">Harga Tawaran Trade-In (RM)</label>
                <input type="number" required className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 font-bold text-lg focus:border-red-600 outline-none" />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsTradeInModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-100 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md"
                >
                  Jana Sebutharga Trade-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KEMASKINI HARGA, FOTO & STATUS MOTOR */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
              <h3 className="text-lg font-bold text-zinc-900 flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-brand-400" />
                <span>Kemaskini Maklumat & Foto Motor</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-zinc-500 hover:text-red-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-500">
              Unit: <span className="font-bold text-zinc-900">{editBrand} {editModel}</span>
            </p>

            <form onSubmit={handleUpdateBike} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="text-xs font-bold text-zinc-600">Harga Kos Modal (RM)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editCostPrice}
                    onChange={(e) => setEditCostPrice(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-zinc-300 text-zinc-900 font-mono text-xs focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600">Warna Motosikal</label>
                  <input
                    type="text"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600">Status Showroom</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-xs focus:border-brand-500 outline-none font-bold"
                  >
                    <option value="available">Dalam Stok (Available)</option>
                    <option value="booked">Kunci Unit (Booked / Lock)</option>
                    <option value="loan_pending">Sedang Proses Loan</option>
                    <option value="sold">Telah Terjual (Sold)</option>
                  </select>
                </div>
              </div>

              {/* Muat Naik / Ganti Foto Motosikal */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 flex items-center justify-between">
                  <span>Muat Naik / Kemaskini Gambar Motor</span>
                  {editBikeImage && <span className="text-[10px] text-emerald-400 font-bold">✓ Foto Aktif</span>}
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/70 hover:bg-zinc-50 hover:border-brand-500 text-zinc-600 text-xs font-medium transition">
                    <Camera className="w-4 h-4 text-brand-400" />
                    <span>Ambil Foto / Pilih Fail Baharu</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileChange(e, true)}
                    />
                  </label>
                  {editBikeImage && (
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-zinc-300 shrink-0">
                      <img src={editBikeImage} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setEditBikeImage("")}
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
    </div>
  );
};

