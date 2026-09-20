import React, { useState } from "react";
import { Wrench, Plus, Video, CheckCircle, Clock, AlertCircle, DollarSign, Eye, ShieldCheck, Share2, Upload } from "lucide-react";
import { WorkOrder, Product, Vehicle } from "../types";

interface WorkOrdersProps {
  workOrders: WorkOrder[];
  products: Product[];
  vehicles: Vehicle[];
  onRefresh: () => void;
  onOpenTrack: (token: string) => void;
}

export const WorkOrders: React.FC<WorkOrdersProps> = ({
  workOrders,
  products,
  vehicles,
  onRefresh,
  onOpenTrack,
}) => {
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  // Form states
  const [newPlate, setNewPlate] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newMileage, setNewMileage] = useState("");
  const [newComplaint, setNewComplaint] = useState("");

  // Video modal form
  const [videoUrl, setVideoUrl] = useState("https://assets.mixkit.co/videos/preview/mixkit-motorcycle-engine-mechanic-repairing-part-42006-large.mp4");
  const [videoDesc, setVideoDesc] = useState("");

  // Add Item form
  const [itemType, setItemType] = useState<"part" | "labor">("part");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemQty, setItemQty] = useState("1");
  const [itemPrice, setItemPrice] = useState("");
  const [requiresApproval, setRequiresApproval] = useState(false);

  // Payment method
  const [payMethod, setPayMethod] = useState("DuitNow QR");

  // Create new WO
  const handleCreateWO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate || !newComplaint) return;

    try {
      // 1. Check if vehicle exists, if not create
      let vehId = "";
      const plateClean = newPlate.toUpperCase().replace(/\s+/g, "");
      const existing = vehicles.find((v) => v.plateNormalized === plateClean);

      if (existing) {
        vehId = existing.id;
      } else {
        const resVeh = await fetch("/api/vehicles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plateNumber: newPlate,
            brand: "Yamaha",
            model: newModel || "Motosikal",
            ownerName: newOwner || "Pelanggan Walk-in",
            ownerPhone: newPhone || "0123456789",
            currentMileage: newMileage ? parseInt(newMileage) : 0,
          }),
        });
        const d = await resVeh.json();
        vehId = d.vehicle.id;
      }

      // 2. Create WO
      await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: vehId,
          mileageIn: newMileage ? parseInt(newMileage) : 0,
          customerComplaint: newComplaint,
        }),
      });

      setIsNewModalOpen(false);
      setNewPlate("");
      setNewComplaint("");
      onRefresh();
    } catch (err) {
      alert("Ralat mencipta work order: " + err);
    }
  };

  // Change status
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/work-orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      onRefresh();
    } catch (err) {
      alert("Ralat mengemaskini status: " + err);
    }
  };

  // Attach video proof (Ciri 2)
  const handleAttachVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWO) return;

    try {
      await fetch(`/api/work-orders/${selectedWO.id}/video-proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl,
          description: videoDesc || "Pemeriksaan keadaan komponen oleh mekanik.",
        }),
      });
      setIsVideoModalOpen(false);
      onRefresh();
      alert("Video bukti kerosakan berjaya dilampirkan! Pautan WhatsApp telah sedia untuk dihantar kepada pelanggan.");
    } catch (err) {
      alert("Ralat lampir video: " + err);
    }
  };

  // Add Item (Part or Labor)
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWO) return;

    let descText = itemDesc;
    let price = parseFloat(itemPrice) || 0;

    if (itemType === "part" && selectedProductId) {
      const p = products.find((x) => x.id === selectedProductId);
      if (p) {
        descText = p.name;
        if (!price) price = p.sellingPrice;
      }
    }

    try {
      await fetch(`/api/work-orders/${selectedWO.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType,
          productId: selectedProductId || null,
          description: descText,
          quantity: parseInt(itemQty) || 1,
          unitPrice: price,
          isRequiresApproval: requiresApproval,
        }),
      });
      setIsAddItemModalOpen(false);
      setItemDesc("");
      setItemPrice("");
      setSelectedProductId("");
      onRefresh();
    } catch (err) {
      alert("Ralat menambah item: " + err);
    }
  };

  // Complete Payment (POS)
  const handlePay = async () => {
    if (!selectedWO) return;
    try {
      await fetch(`/api/work-orders/${selectedWO.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: payMethod }),
      });
      setIsPayModalOpen(false);
      onRefresh();
      alert(`Bayaran RM ${(selectedWO.grandTotal || 0).toFixed(2)} berjaya diterima via ${payMethod}. Resit telah disimpan di R2.`);
    } catch (err) {
      alert("Ralat memproses bayaran: " + err);
    }
  };

  const columns = [
    { id: "pending", label: "Menunggu", color: "border-slate-700 bg-slate-900/50" },
    { id: "in_progress", label: "Sedang Dibaiki", color: "border-blue-500/30 bg-blue-950/20" },
    { id: "waiting_approval", label: "Menunggu Video Approval", color: "border-amber-500/30 bg-amber-950/20" },
    { id: "ready", label: "Siap (Boleh Ambil)", color: "border-emerald-500/30 bg-emerald-950/20" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Papan Kerja Bengkel (Work Orders)</h1>
          <p className="text-xs text-slate-400">Pantau pergerakan kerja mekanik, lampiran video bukti 5s, dan bayaran di kaunter</p>
        </div>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold shadow-lg shadow-brand-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Buka Work Order Baru</span>
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colWOs = workOrders.filter((w) => w.status === col.id);
          return (
            <div key={col.id} className={`rounded-2xl border ${col.color} p-4 flex flex-col min-h-[500px]`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">{col.label}</span>
                <span className="w-5 h-5 rounded-full bg-slate-800 text-[11px] font-extrabold text-brand-400 flex items-center justify-center">
                  {colWOs.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {colWOs.map((wo) => (
                  <div
                    key={wo.id}
                    className="bg-slate-900/90 border border-slate-800/90 hover:border-brand-500/40 rounded-xl p-4 transition-all shadow-sm space-y-3"
                  >
                    {/* Header card */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-black text-brand-400">{wo.woNumber}</span>
                        <h4 className="text-sm font-extrabold text-white mt-0.5">{wo.plateNumber}</h4>
                        <p className="text-[11px] text-slate-400">{wo.model || "Motosikal"}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">
                        RM {(wo.grandTotal || 0).toFixed(2)}
                      </span>
                    </div>

                    {/* Complaint */}
                    <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/60">
                      <p className="text-xs text-slate-300 line-clamp-2">
                        <span className="font-bold text-slate-400">Aduan: </span>
                        {wo.customerComplaint}
                      </p>
                    </div>

                    {/* Video badge if attached */}
                    {wo.videoProofKey && (
                      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                        <div className="flex items-center space-x-1.5">
                          <Video className="w-3.5 h-3.5 text-amber-400" />
                          <span className="font-semibold text-[11px]">Ada Video Bukti 5s</span>
                        </div>
                        {wo.isApprovedByCustomer ? (
                          <span className="text-[10px] font-bold text-emerald-400">Diluluskan</span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-400 animate-pulse">Menunggu</span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedWO(wo);
                          setIsAddItemModalOpen(true);
                        }}
                        className="text-[11px] font-bold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                      >
                        + Part / Upah
                      </button>

                      <button
                        onClick={() => {
                          setSelectedWO(wo);
                          setIsVideoModalOpen(true);
                        }}
                        className="text-[11px] font-bold px-2 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 flex items-center space-x-1"
                      >
                        <Video className="w-3 h-3" />
                        <span>Rakam Video</span>
                      </button>

                      <button
                        onClick={() => onOpenTrack(wo.approvalToken)}
                        className="text-[11px] font-bold px-2 py-1 rounded bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1"
                        title="Pautan Pelanggan"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Link Customer</span>
                      </button>

                      {/* Status Next Button */}
                      {col.id === "pending" && (
                        <button
                          onClick={() => handleStatusChange(wo.id, "in_progress")}
                          className="text-[11px] font-bold px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white ml-auto"
                        >
                          Mula Baiki ➔
                        </button>
                      )}
                      {col.id === "in_progress" && (
                        <button
                          onClick={() => handleStatusChange(wo.id, "ready")}
                          className="text-[11px] font-bold px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white ml-auto"
                        >
                          Siap ➔
                        </button>
                      )}
                      {col.id === "ready" && (
                        <button
                          onClick={() => {
                            setSelectedWO(wo);
                            setIsPayModalOpen(true);
                          }}
                          className="text-[11px] font-bold px-2.5 py-1 rounded bg-brand-500 hover:bg-brand-600 text-white ml-auto flex items-center space-x-1"
                        >
                          <DollarSign className="w-3 h-3" />
                          <span>Bayar POS</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: BUKA WORK ORDER BARU */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Wrench className="w-5 h-5 text-brand-500" />
              <span>Buka Job Card / Work Order Baru</span>
            </h3>

            <form onSubmit={handleCreateWO} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300">Nombor Plat Motosikal *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: VHG 8821"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-brand-500 outline-none uppercase font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">Model Motor</label>
                  <input
                    type="text"
                    placeholder="NVX, Y15ZR, RS-X"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Mileage Semasa (KM)</label>
                  <input
                    type="number"
                    placeholder="18450"
                    value={newMileage}
                    onChange={(e) => setNewMileage(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">Nama Pelanggan</label>
                  <input
                    type="text"
                    placeholder="Akmal Hakim"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">No Telefon</label>
                  <input
                    type="text"
                    placeholder="0123456789"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Aduan Kerosakan / Jenis Servis *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Contoh: Bunyi kasar kat CVT, tukar minyak hitam, rantai kendur..."
                  value={newComplaint}
                  onChange={(e) => setNewComplaint(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-brand-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold"
                >
                  Buka Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CIRI 2 - RAKAM VIDEO BUKTI 5S */}
      {isVideoModalOpen && selectedWO && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center space-x-2 text-amber-400">
              <Video className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white">Transparent Video Jobcard (5s Proof)</h3>
            </div>
            <p className="text-xs text-slate-400">
              Rakam video ringkas 5-10 saat untuk tunjukkan keadaan part yang rosak pada motor <span className="font-bold text-white">{selectedWO.plateNumber}</span>. Pelanggan akan terima pautan ini di WhatsApp untuk buat keputusan segera.
            </p>

            <form onSubmit={handleAttachVideo} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300">URL / R2 Key Video Bukti</label>
                <input
                  type="text"
                  required
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Penjelasan Mekanik Untuk Pelanggan</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Roller CVT abang dah berlekuk teruk dan tali sawat dah merekah..."
                  value={videoDesc}
                  onChange={(e) => setVideoDesc(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs"
                >
                  Hantar Video ke Pelanggan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: TAMBAH PART / UPAH */}
      {isAddItemModalOpen && selectedWO && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Tambah Alat Ganti atau Upah Mekanik</h3>
            <p className="text-xs text-slate-400">Untuk Work Order: <span className="font-bold text-brand-400">{selectedWO.woNumber} ({selectedWO.plateNumber})</span></p>

            <form onSubmit={handleAddItem} className="space-y-3">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setItemType("part")}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border ${
                    itemType === "part"
                      ? "bg-brand-500 text-white border-brand-500"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  Alat Ganti (Stok Rak)
                </button>
                <button
                  type="button"
                  onClick={() => setItemType("labor")}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border ${
                    itemType === "labor"
                      ? "bg-brand-500 text-white border-brand-500"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  Upah & Servis (Labor)
                </button>
              </div>

              {itemType === "part" ? (
                <div>
                  <label className="text-xs font-bold text-slate-300">Pilih dari Stok Rak</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => {
                      setSelectedProductId(e.target.value);
                      const p = products.find((x) => x.id === e.target.value);
                      if (p) {
                        setItemPrice(p.sellingPrice.toString());
                        setItemDesc(p.name);
                      }
                    }}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-brand-500 outline-none"
                  >
                    <option value="">-- Pilih Alat Ganti --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Baki: {p.stockQty} di {p.rackLocation}) - RM {p.sellingPrice.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold text-slate-300">Keterangan Upah Kerja</label>
                  <input
                    type="text"
                    placeholder="Contoh: Upah buka CVT & cuci mangkuk"
                    value={itemDesc}
                    onChange={(e) => setItemDesc(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-brand-500 outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">Kuantiti</label>
                  <input
                    type="number"
                    min="1"
                    value={itemQty}
                    onChange={(e) => setItemQty(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Harga Seunit (RM)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              {itemType === "part" && (
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="reqApprove"
                    checked={requiresApproval}
                    onChange={(e) => setRequiresApproval(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-950 text-brand-500 focus:ring-0"
                  />
                  <label htmlFor="reqApprove" className="text-xs text-slate-300 cursor-pointer">
                    Perlukan kelulusan video pelanggan dahulu sebelum tolak stok
                  </label>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold"
                >
                  Masukkan ke Bil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: BAYAR DI KAUNTER (POS CHECKOUT) */}
      {isPayModalOpen && selectedWO && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Selesai & Bayaran di Kaunter (POS)</span>
            </h3>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>No. Work Order:</span>
                <span className="font-mono text-white font-bold">{selectedWO.woNumber}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>No. Plat Motosikal:</span>
                <span className="text-white font-bold">{selectedWO.plateNumber}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
                <span>Jumlah Perlu Dibayar:</span>
                <span className="text-emerald-400">RM {(selectedWO.grandTotal || 0).toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Kaedah Bayaran</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-brand-500 outline-none"
              >
                <option value="DuitNow QR">DuitNow QR / Spay</option>
                <option value="Tunai">Tunai (Cash)</option>
                <option value="Kad Debit/Kredit">Kad Debit / Kredit</option>
                <option value="Online Transfer">Online Transfer (Instant)</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPayModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={handlePay}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-lg shadow-emerald-500/20"
              >
                Sahkan Bayaran & Cetak Resit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

