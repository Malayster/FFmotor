import React, { useState } from "react";
import { Bike, Plus, CheckCircle2, DollarSign, Tag, Sparkles, User, Phone, CreditCard } from "lucide-react";
import { Motorcycle } from "../types";

interface MotorSalesProps {
  motorcycles: Motorcycle[];
  onRefresh: () => void;
}

export const MotorSales: React.FC<MotorSalesProps> = ({ motorcycles, onRefresh }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
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

  // Sell bike form
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerIc, setCustomerIc] = useState("");
  const [paymentType, setPaymentType] = useState<"cash" | "loan_bank" | "credit_kedai">("cash");
  const [salePrice, setSalePrice] = useState("");
  const [depositPaid, setDepositPaid] = useState("");
  const [assignedPlate, setAssignedPlate] = useState("");

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
          notes,
        }),
      });
      setIsAddModalOpen(false);
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
          <h1 className="text-2xl font-extrabold text-white">Showroom & Jualan Motosikal</h1>
          <p className="text-xs text-slate-400">Pengurusan unit motor baharu & terpakai, pendaftaran JPJ dan integrasi kitaran servis</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold shadow-lg shadow-brand-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Daftar Stok Motosikal Baru</span>
        </button>
      </div>

      {/* Bike Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {motorcycles.map((bike) => {
          const isSold = bike.status === "sold";
          return (
            <div
              key={bike.id}
              className={`bg-slate-900 border rounded-3xl p-5 space-y-4 transition-all relative overflow-hidden ${
                isSold ? "border-slate-800 opacity-70" : "border-slate-800 hover:border-brand-500/40"
              }`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                    bike.condition === "new"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                  }`}
                >
                  {bike.condition === "new" ? "Baru (0 KM)" : "Terpakai (Used)"}
                </span>

                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    isSold
                      ? "bg-slate-800 text-slate-400"
                      : "bg-brand-500/15 text-brand-400 border border-brand-500/30"
                  }`}
                >
                  {isSold ? "Telah Terjual" : "Dalam Stok"}
                </span>
              </div>

              {/* Title & Info */}
              <div>
                <span className="text-xs font-bold text-slate-400">{bike.brand} • {bike.year}</span>
                <h3 className="text-lg font-black text-white">{bike.model}</h3>
                <p className="text-xs text-slate-400 font-medium">Warna: <span className="text-slate-200">{bike.color}</span></p>
              </div>

              {/* Identifiers */}
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 text-[11px] font-mono space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>No. Enjin:</span>
                  <span className="text-white font-bold">{bike.engineNo}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>No. Chasis:</span>
                  <span className="text-white font-bold">{bike.chassisNo}</span>
                </div>
              </div>

              {/* Price & Action */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Harga Jualan</span>
                  <div className="text-lg font-black text-emerald-400">
                    RM {bike.sellingPrice.toFixed(2)}
                  </div>
                </div>

                {!isSold && (
                  <button
                    onClick={() => {
                      setSelectedBike(bike);
                      setSalePrice(bike.sellingPrice.toString());
                      setIsSellModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all"
                  >
                    Daftar Jual
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: DAFTAR STOK MOTOR BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Bike className="w-5 h-5 text-brand-500" />
              <span>Daftar Stok Motosikal Baharu</span>
            </h3>

            <form onSubmit={handleCreateBike} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">Jenama</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-brand-500 outline-none"
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
                  <label className="text-xs font-bold text-slate-300">Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: NVX 155 ABS"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">Tahun</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Warna</label>
                  <input
                    type="text"
                    placeholder="Cyan Blue"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Kondisi</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-brand-500 outline-none"
                  >
                    <option value="new">Baru</option>
                    <option value="used">Used / 2nd</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">No. Enjin *</label>
                  <input
                    type="text"
                    required
                    placeholder="G3E9-00123"
                    value={engineNo}
                    onChange={(e) => setEngineNo(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono uppercase focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">No. Chasis (VIN) *</label>
                  <input
                    type="text"
                    required
                    placeholder="MH3SE892..."
                    value={chassisNo}
                    onChange={(e) => setChassisNo(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono uppercase focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">Harga Modal (RM)</label>
                  <input
                    type="number"
                    placeholder="8500"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Harga Jualan (RM) *</label>
                  <input
                    type="number"
                    required
                    placeholder="9800"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-brand-500 outline-none"
                  />
                </div>
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Daftar Jualan Motosikal</span>
            </h3>
            <p className="text-xs text-slate-400">
              Unit: <span className="font-bold text-white">{selectedBike.brand} {selectedBike.model}</span> ({selectedBike.color})
            </p>

            <form onSubmit={handleSellBike} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300">Nama Pembeli *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Danish"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">No. Telefon *</label>
                  <input
                    type="text"
                    required
                    placeholder="0112345678"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">No. Kad Pengenalan (IC)</label>
                  <input
                    type="text"
                    placeholder="010203-10-1234"
                    value={customerIc}
                    onChange={(e) => setCustomerIc(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">Kaedah Bayaran</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-brand-500 outline-none"
                  >
                    <option value="cash">Tunai Penuh (Cash)</option>
                    <option value="loan_bank">Loan Bank / Chailease</option>
                    <option value="credit_kedai">Kredit Kedai</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Harga Jual Akhir (RM)</label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-brand-500 outline-none font-bold text-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">No. Plat Baru Didaftarkan (JPJ) *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: VKC 9912"
                  value={assignedPlate}
                  onChange={(e) => setAssignedPlate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono uppercase font-black focus:border-brand-500 outline-none"
                />
                <p className="text-[10px] text-amber-400 mt-1">
                  ⚡ Auto-Sync: No plat ini akan terus dimasukkan ke pangkalan data servis kenderaan dengan Digital Passport Skor 100!
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSellModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black"
                >
                  Sahkan Jualan & Daftar Plat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

