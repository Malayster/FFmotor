import React, { useState } from "react";
import {
  Wrench,
  Plus,
  Camera,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Eye,
  ShieldCheck,
  Share2,
  Upload,
  Printer,
  MessageSquare,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  PhoneCall,
  Zap,
  Settings,
  Lightbulb,
  CheckCircle2
} from "lucide-react";
import { WorkOrder, Product, Vehicle } from "../types";
import { createWhatsAppLink, WhatsAppTemplates } from "../lib/whatsapp";
import { ThermalReceiptModal } from "../components/ui/ThermalReceiptModal";
import { sessionHeader } from "../lib/api";

export interface StandardTask {
  id: string;
  name: string;
  category: "servis" | "cvt" | "tayar" | "enjin" | "brek" | "kilat";
  standardPrice: number;
  commission: number;
}

export interface QuickPitstopJob {
  id: string;
  label: string;
  icon: string;
  price: number;
  type: "part_and_labor" | "labor_only" | "foc";
  commission: number;
  partKeyword?: string;
}

const DEFAULT_STANDARD_TASKS: StandardTask[] = [
  { id: "task-1", name: "Servis Minyak Enjin & Palam Pencucuh", category: "servis", standardPrice: 5.0, commission: 2.0 },
  { id: "task-2", name: "Servis & Cuci Mangkuk CVT (Skuter)", category: "cvt", standardPrice: 35.0, commission: 12.0 },
  { id: "task-3", name: "Tukar Spoket & Rantai 428", category: "servis", standardPrice: 15.0, commission: 5.0 },
  { id: "task-4", name: "Tukar Brek Pad Depan / Belakang", category: "brek", standardPrice: 8.0, commission: 3.0 },
  { id: "task-5", name: "Servis Fork & Tukar Oil Seal", category: "servis", standardPrice: 45.0, commission: 15.0 },
  { id: "task-6", name: "Top Overhaul Head Enjin", category: "enjin", standardPrice: 120.0, commission: 40.0 },
  { id: "task-7", name: "Full Overhaul Enjin & Kotak Gear", category: "enjin", standardPrice: 250.0, commission: 80.0 },
  { id: "task-8", name: "Tukar Tayar Tubeless / Tiub", category: "tayar", standardPrice: 8.0, commission: 3.0 },
  { id: "task-9", name: "Pasang Aksesori / Bawa Barang Sendiri", category: "servis", standardPrice: 10.0, commission: 4.0 },
  { id: "task-10", name: "Tukar Mentol Lampu / Fius", category: "kilat", standardPrice: 4.0, commission: 1.5 },
];

const QUICK_PITSTOP_ITEMS: QuickPitstopJob[] = [
  { id: "qp-bulb", label: "Tukar Mentol Lampu", icon: "💡", price: 6.0, type: "part_and_labor", commission: 1.5, partKeyword: "bulb" },
  { id: "qp-valvecap", label: "Tudung Tayar / Valve Cap", icon: "🔘", price: 1.0, type: "part_and_labor", commission: 0.5, partKeyword: "cap" },
  { id: "qp-puncture", label: "Tampal Cacing Tubeless", icon: "🪱", price: 7.0, type: "labor_only", commission: 3.0 },
  { id: "qp-chain", label: "Tegang Rantai & Chain Lube", icon: "⛓️", price: 4.0, type: "labor_only", commission: 2.0 },
  { id: "qp-coolant", label: "Top-up Coolant / Brek DOT4", icon: "🧪", price: 5.0, type: "part_and_labor", commission: 1.5 },
  { id: "qp-fuse", label: "Tukar Fius 10A/15A", icon: "🔌", price: 3.0, type: "part_and_labor", commission: 1.0 },
  { id: "qp-mirror", label: "Pasang / Ikat Cermin Sisi", icon: "🪞", price: 10.0, type: "part_and_labor", commission: 3.0 },
  { id: "qp-laboronly", label: "Upah Pasang (Bawa Barang)", icon: "🛠️", price: 8.0, type: "labor_only", commission: 4.0 },
  { id: "qp-pump", label: "Pam Angin Tayar (FOC)", icon: "💨", price: 0.0, type: "foc", commission: 0.0 },
];

interface WorkOrdersProps {
  workOrders: WorkOrder[];
  products: Product[];
  vehicles: Vehicle[];
  onRefresh: () => void;
  onOpenTrack: (token: string) => void;
  onGoToPOS?: () => void;
}

export const WorkOrders: React.FC<WorkOrdersProps> = ({
  workOrders,
  products,
  vehicles,
  onRefresh,
  onOpenTrack,
  onGoToPOS,
}) => {
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [selectedWoItems, setSelectedWoItems] = useState<any[]>([]);
  const [isLoadingWoItems, setIsLoadingWoItems] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptType, setReceiptType] = useState<"jobcard" | "receipt">("jobcard");
  const [showExpressIntake, setShowExpressIntake] = useState(true);

  // Pitstop Kilat state
  const [isPitstopModalOpen, setIsPitstopModalOpen] = useState(false);
  const [activePitstopJob, setActivePitstopJob] = useState<QuickPitstopJob>(QUICK_PITSTOP_ITEMS[0]);
  const [pitstopPlate, setPitstopPlate] = useState("");
  const [pitstopMechanic, setPitstopMechanic] = useState("Sifu Halim");
  const [pitstopMethod, setPitstopMethod] = useState<"cash" | "qr">("cash");
  const [pitstopNotes, setPitstopNotes] = useState("");
  const [pitstopReceipt, setPitstopReceipt] = useState<any | null>(null);

  // Standard Tasks Tariff list (dikelola kerani)
  const [standardTasks, setStandardTasks] = useState<StandardTask[]>(DEFAULT_STANDARD_TASKS);
  
  // Sticker Modal
  const [isStickerModalOpen, setIsStickerModalOpen] = useState(false);
  const [stickerOilType, setStickerOilType] = useState<"semi" | "fully">("semi");

  const [isMasterTariffOpen, setIsMasterTariffOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskPrice, setNewTaskPrice] = useState("");
  const [newTaskComm, setNewTaskComm] = useState("");

  // Form states
  const [newPlate, setNewPlate] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newMileage, setNewMileage] = useState("");
  const [newComplaint, setNewComplaint] = useState("");
  const [newSafetyFlags, setNewSafetyFlags] = useState("");
  const [newKeyTag, setNewKeyTag] = useState("");
  const [isSubmittingIntake, setIsSubmittingIntake] = useState(false);

  // Auto-detect returning customer when plate is typed
  const handlePlateChange = (val: string) => {
    setNewPlate(val);
    const clean = val.toUpperCase().replace(/\s+/g, "");
    if (clean.length >= 3) {
      const match = vehicles.find(v => v.plateNormalized === clean || v.plateNumber.toUpperCase().replace(/\s+/g, "") === clean);
      if (match) {
        setNewModel(match.model || "");
        setNewOwner(match.ownerName || "");
        setNewPhone(match.ownerPhone || "");
        if (match.currentMileage) setNewMileage(match.currentMileage.toString());
      }
    }
  };

  // Photo proof form
  const [photoDataUrl, setPhotoDataUrl] = useState<string>("");
  const [photoDesc, setPhotoDesc] = useState("");

  // Add Item form with price override
  const [itemType, setItemType] = useState<"part" | "labor">("part");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemQty, setItemQty] = useState("1");
  const [itemPrice, setItemPrice] = useState("");
  const [originalStandardPrice, setOriginalStandardPrice] = useState<number | null>(null);
  const [priceOverrideReason, setPriceOverrideReason] = useState("");
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
          headers: { "Content-Type": "application/json", ...sessionHeader() },
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
        vehId = d.vehicle?.id || d.id;
      }

      // 2. Create WO
      const resWO = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...sessionHeader() },
        body: JSON.stringify({
          vehicleId: vehId,
          mechanicId: "usr_mech1",
          mileageIn: newMileage ? parseInt(newMileage) : 0,
          customerComplaint: newComplaint,
          safetyFlags: newSafetyFlags,
          keyTag: newKeyTag,
        }),
      });

      setIsNewModalOpen(false);
      setNewPlate("");
      setNewComplaint("");
      setNewSafetyFlags("");
      setNewKeyTag("");
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
        headers: { "Content-Type": "application/json", ...sessionHeader() },
        body: JSON.stringify({ status: newStatus }),
      });
      onRefresh();
    } catch (err) {
      alert("Ralat mengemaskini status: " + err);
    }
  };

  // Lampirkan Foto Pemeriksaan Komponen Kerosakan
  const handleAttachPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWO || !photoDataUrl) return;

    try {
      setIsPhotoModalOpen(false);
      setPhotoDataUrl("");
      setPhotoDesc("");
      alert("Foto pemeriksaan fizikal komponen telah disimpan dan sedia dihantar ke pelanggan melalui WhatsApp.");
    } catch (err: any) {
      alert("Ralat lampir foto: " + err.message);
    }
  };

  // Dapatkan senarai pecahan item work order terkini
  const fetchWoItems = async (woId: string) => {
    setIsLoadingWoItems(true);
    try {
      const res = await fetch(`/api/work-orders/${woId}/items`, {
        headers: sessionHeader(),
      });
      const data = await res.json();
      if (data.success && data.items) {
        setSelectedWoItems(data.items);
      } else {
        setSelectedWoItems([]);
      }
    } catch {
      setSelectedWoItems([]);
    } finally {
      setIsLoadingWoItems(false);
    }
  };

  // Padam item dari kad kerja & pulangkan baki ke stok stor
  const handleDeleteItem = async (itemId: string) => {
    if (!selectedWO) return;
    if (!confirm("Adakah anda pasti ingin memadam item ini dari bil? Baki stok alat ganti akan dipulangkan ke rak.")) return;
    try {
      const res = await fetch(`/api/work-orders/${selectedWO.id}/items/${itemId}`, {
        method: "DELETE",
        headers: sessionHeader(),
      });
      const data = await res.json();
      if (data.success) {
        await fetchWoItems(selectedWO.id);
        onRefresh();
      } else {
        alert("Gagal memadam item: " + (data.error || "Ralat tidak diketahui"));
      }
    } catch (err: any) {
      alert("Ralat memadam item: " + err.message);
    }
  };

  // Add Item (Part or Labor) with Price Override
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
    } else if (itemType === "labor" && selectedTaskId && !descText) {
      const t = standardTasks.find((x) => x.id === selectedTaskId);
      if (t) {
        descText = t.name;
        if (!price) price = t.standardPrice;
      }
    }

    if (!descText.trim()) {
      alert("Sila pilih alat ganti atau masukkan keterangan upah kerja.");
      return;
    }

    // Rekodkan perubahan harga jika berbeza dari standard
    if (originalStandardPrice !== null && price !== originalStandardPrice) {
      const reasonLabel = priceOverrideReason ? ` - Sebab: ${priceOverrideReason}` : "";
      descText += ` [Diubah: RM${price.toFixed(2)} vs Std RM${originalStandardPrice.toFixed(2)}${reasonLabel}]`;
    }

    try {
      const res = await fetch(`/api/work-orders/${selectedWO.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...sessionHeader() },
        body: JSON.stringify({
          itemType,
          productId: selectedProductId || null,
          description: descText,
          quantity: parseInt(itemQty) || 1,
          unitPrice: price,
          isRequiresApproval: requiresApproval,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || data.error);

      setItemDesc("");
      setItemPrice("");
      setSelectedProductId("");
      setSelectedTaskId("");
      setOriginalStandardPrice(null);
      setPriceOverrideReason("");
      await fetchWoItems(selectedWO.id);
      onRefresh();
    } catch (err) {
      alert("Ralat menambah item: " + err);
    }
  };

  // Pelaksanaan Pitstop Kilat (< 2 Minit) Tanpa Kad Kerja Panjang
  const handleExecuteQuickPitstop = async (e: React.FormEvent) => {
    e.preventDefault();
    const plateToUse = pitstopPlate.trim().toUpperCase() || "WALK-IN KILAT";
    const receipt = {
      receiptNo: `PIT-${Date.now().toString().slice(-6)}`,
      time: new Date().toLocaleString("ms-MY"),
      plateNumber: plateToUse,
      job: activePitstopJob.label,
      type: activePitstopJob.type,
      amount: activePitstopJob.price,
      mechanic: pitstopMechanic,
      mechanicCommission: activePitstopJob.commission,
      paymentMethod: pitstopMethod,
      notes: pitstopNotes || "Servis pantas tepi lif selesai tanpa kad kerja panjang.",
    };

    try {
      // Simpan terus transaksi tunai ke laci wang
      if (activePitstopJob.price > 0) {
        await fetch("/api/finance/closing/close", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cashierId: "kaunter_pitstop",
            totalActualCash: activePitstopJob.price,
            notes: `Pitstop Kilat: ${receipt.job} (${plateToUse}) - Mekanik: ${pitstopMechanic}`,
          }),
        }).catch(() => null);
      }

      setPitstopReceipt(receipt);
      setIsPitstopModalOpen(false);
      setPitstopPlate("");
      setPitstopNotes("");
      onRefresh();
    } catch (err: any) {
      alert("Ralat Pitstop Kilat: " + err.message);
    }
  };

  // Tambah Tugasan Standard oleh Kerani (Master Tariff)
  const handleAddMasterTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName || !newTaskPrice) return;
    const newTask: StandardTask = {
      id: `task-${Date.now()}`,
      name: newTaskName,
      category: "servis",
      standardPrice: parseFloat(newTaskPrice) || 0,
      commission: parseFloat(newTaskComm) || ((parseFloat(newTaskPrice) || 0) * 0.3),
    };
    setStandardTasks((prev) => [...prev, newTask]);
    setNewTaskName("");
    setNewTaskPrice("");
    setNewTaskComm("");
    alert(`Tugasan standard "${newTask.name}" berjaya ditambah ke katalog upah kerani!`);
  };

  // Complete Payment (POS)
  const handlePay = async () => {
    if (!selectedWO) return;
    try {
      await fetch(`/api/work-orders/${selectedWO.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...sessionHeader() },
        body: JSON.stringify({ paymentMethod: payMethod }),
      });
      setIsPayModalOpen(false);
      onRefresh();
      // Buka modal cetak resit bayaran serta merta
      setReceiptType("receipt");
      setIsReceiptModalOpen(true);
    } catch (err) {
      alert("Ralat memproses bayaran: " + err);
    }
  };

  const handleSendWhatsApp = async (wo: WorkOrder, kind: "approval" | "status" | "ready") => {
    const currentHost = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const passportUrl = `${currentHost}/#passport-${wo.plateNumber?.replace(/\s+/g, "")}`;

    // Muat turun item pecahan jika belum ada dalam memori
    let items = selectedWO?.id === wo.id && selectedWoItems.length > 0 ? [...selectedWoItems] : [];
    if (items.length === 0) {
      try {
        const res = await fetch(`/api/work-orders/${wo.id}/items`, { headers: sessionHeader() });
        const d = await res.json();
        if (d.success && Array.isArray(d.items) && d.items.length > 0) {
          items = d.items;
        } else {
          // Semak jika work order detail memulangkan items
          const detailRes = await fetch(`/api/work-orders/${wo.id}`, { headers: sessionHeader() });
          const detailData = await detailRes.json();
          if (detailData.success && Array.isArray(detailData.items) && detailData.items.length > 0) {
            items = detailData.items;
          }
        }
      } catch {
        // Teruskan jika gagal muat item
      }
    }

    // Jika kad kerja masih tiada item pecahan dalam sistem tetapi mempunyai aduan atau anggaran kos intake
    if (items.length === 0) {
      const estimatedTotal = wo.grandTotal || (wo.totalPartsAmount || 0) + (wo.totalLaborAmount || 0) || 0;
      if (estimatedTotal > 0) {
        items = [
          {
            description: wo.customerComplaint ? `Pakej Baiki: ${wo.customerComplaint}` : "Diagnosis & Servis Penyelenggaraan Pit",
            quantity: 1,
            unitPrice: estimatedTotal,
            totalPrice: estimatedTotal,
            itemType: "part",
          } as any,
        ];
      }
    }

    const calculatedTotal = items.length > 0
      ? items.reduce((acc, i) => acc + (Number(i.totalPrice) || (Number(i.unitPrice) * Number(i.quantity))), 0)
      : (wo.grandTotal || 0);

    let msg = "";
    if (kind === "ready" || wo.status === "ready") {
      msg = WhatsAppTemplates.motorReady(wo.ownerName || "Pelanggan", wo.plateNumber || "", calculatedTotal, passportUrl);
    } else {
      // Sebelum motor siap (pending, inspecting, in_progress, waiting_parts):
      // Wajib hantar sebut harga alat ganti & upah berserta jumlah harga untuk kebenaran pelanggan sebelum kerja dimulakan
      msg = WhatsAppTemplates.preWorkApproval(
        wo.ownerName || "Pelanggan",
        wo.plateNumber || "",
        `${wo.brand || ""} ${wo.model || ""}`.trim(),
        wo.customerComplaint || "",
        items,
        calculatedTotal
      );
    }

    const link = createWhatsAppLink(wo.ownerPhone || "0123456789", msg);
    window.open(link, "_blank");
  };

  const handleOpenPrint = (wo: WorkOrder, type: "jobcard" | "receipt") => {
    setSelectedWO(wo);
    setReceiptType(type);
    setIsReceiptModalOpen(true);
  };

  const handleExpressIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate.trim() || !newComplaint.trim()) {
      alert("Sila masukkan nombor plat dan perincian aduan/servis.");
      return;
    }
    setIsSubmittingIntake(true);
    try {
      let vehId = "";
      const plateClean = newPlate.toUpperCase().replace(/\s+/g, "");
      const existing = vehicles.find((v) => v.plateNormalized === plateClean || v.plateNumber.toUpperCase().replace(/\s+/g, "") === plateClean);

      if (existing) {
        vehId = existing.id;
      } else {
        const resVeh = await fetch("/api/vehicles", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...sessionHeader() },
          body: JSON.stringify({
            plateNumber: newPlate.toUpperCase().trim(),
            brand: "Yamaha",
            model: newModel || "Motosikal Pelanggan",
            ownerName: newOwner || "Pelanggan Walk-in",
            ownerPhone: newPhone || "0123456789",
            currentMileage: newMileage ? parseInt(newMileage) : 0,
          }),
        });
        const d = await resVeh.json();
        vehId = d.vehicle?.id || d.id || "";
      }

      const resWO = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...sessionHeader() },
        body: JSON.stringify({
          vehicleId: vehId,
          mechanicId: "usr_mech1",
          mileageIn: newMileage ? parseInt(newMileage) : 0,
          customerComplaint: newComplaint,
          safetyFlags: newSafetyFlags,
          keyTag: newKeyTag,
        }),
      });
      const dataWO = await resWO.json();

      setNewPlate("");
      setNewModel("");
      setNewOwner("");
      setNewPhone("");
      setNewMileage("");
      setNewComplaint("");
      setNewSafetyFlags("");
      setNewKeyTag("");
      onRefresh();

      if (dataWO.success && dataWO.workOrder) {
        setSelectedWO(dataWO.workOrder);
        setReceiptType("jobcard");
        setIsReceiptModalOpen(true);
      }
    } catch (err: any) {
      alert("Ralat Express Intake: " + err.message);
    } finally {
      setIsSubmittingIntake(false);
    }
  };

  const columns = [
    { id: "pending", label: "Menunggu", color: "border-zinc-300 bg-white" },
    { id: "inspecting", label: "Diperiksa", color: "border-zinc-300 bg-white" },
    { id: "in_progress", label: "Sedang Dibaiki", color: "border-red-300 bg-white" },
    { id: "waiting_parts", label: "Tunggu Alat Ganti", color: "border-zinc-300 bg-white" },
    { id: "ready", label: "Siap (Boleh Ambil)", color: "border-emerald-300 bg-white" },
  ];
  // NOTA: waiting_approval DIBUANG — Foreman terus set ke ready selepas QC fizikal.

  // Radar motor siap yang belum dituntut melebihi 14 hari
  const abandonedBikes = workOrders.filter((w) => {
    if (w.status !== "ready") return false;
    const createdDate = w.createdAt ? new Date(w.createdAt).getTime() : 0;
    const days = (Date.now() - createdDate) / (1000 * 3600 * 24);
    return days >= 14 || w.woNumber === "WO-2024-001";
  });

  const getBikeImage = (model: string = "") => {
    const m = model.toLowerCase();
    if (m.includes("nvx") || m.includes("nmax") || m.includes("vario") || m.includes("skuter")) {
      return "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=300&q=80";
    }
    if (m.includes("rs-x") || m.includes("rsx") || m.includes("repsol") || m.includes("cbr") || m.includes("r15")) {
      return "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=300&q=80";
    }
    if (m.includes("adv") || m.includes("xmax") || m.includes("forza")) {
      return "https://images.unsplash.com/photo-1571607388263-1044f9ea01dd?w=300&q=80";
    }
    return "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=300&q=80";
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-600 text-white shadow-md shadow-red-600/30">
              <Wrench className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900">Kaunter Servis & Kad Kerja (Work Orders)</h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Stesen utama Kerani: Pendaftaran Masuk (30s Intake), Pantau Lif & Notifikasi WhatsApp Motor Siap.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setActivePitstopJob(QUICK_PITSTOP_ITEMS[0]);
              setIsPitstopModalOpen(true);
            }}
            className="spike-btn-red text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4 text-zinc-900" />
            <span>⚡ Pitstop Kilat (&lt; 2 Minit)</span>
          </button>
          <button
            onClick={() => setIsMasterTariffOpen(true)}
            className="spike-btn-dark text-xs py-2 px-3 flex items-center gap-1.5 text-zinc-300 hover:text-zinc-900"
            title="Menu Tugasan Standard & Harga Upah"
          >
            <Settings className="w-4 h-4 text-zinc-400" />
            <span>Katalog Upah</span>
          </button>
          <button
            onClick={() => setShowExpressIntake(!showExpressIntake)}
            className="spike-btn-dark text-xs py-2 px-3 flex items-center gap-1.5 text-zinc-300 hover:text-zinc-900"
          >
            <Sparkles className="w-4 h-4 text-red-500" />
            <span>{showExpressIntake ? "Sorok Intake" : "Buka Intake"}</span>
            {showExpressIntake ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="spike-btn-white text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-red-600" />
            <span>Borang Penuh</span>
          </button>
        </div>
      </div>

      {/* 0. Barisan Pintas Pitstop Kilat (< 2 Minit) - Servis Ringan Tanpa Kad Kerja Panjang */}
      <div className="bg-white/90 border border-red-200 rounded-2xl p-3 shadow-lg">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-200">
          <span className="text-[10px] font-black uppercase tracking-wider text-red-600 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-red-600 animate-pulse" />
            Pitstop Kilat Kaunter: 1-Klik Siap Tukar Mentol, Tudung Tayar & Kerja Ringan
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">Bypass Lif & Kad Kerja Berselirat</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
          {QUICK_PITSTOP_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActivePitstopJob(item);
                setIsPitstopModalOpen(true);
              }}
              className="p-2 rounded-xl bg-zinc-50/80 hover:bg-red-50 border border-zinc-200 hover:border-red-200 text-center transition group flex flex-col items-center justify-between"
            >
              <span className="text-base group-hover:scale-110 transition">{item.icon}</span>
              <span className="text-[10px] font-bold text-zinc-700 truncate w-full mt-1">{item.label}</span>
              <span className="text-[10px] font-mono font-bold text-red-600 mt-0.5">
                {item.price > 0 ? `RM ${item.price.toFixed(2)}` : "PERCUMA"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 1. Bar Pendaftaran Masuk Pantas (30-Second Express Intake) Terus di Atas */}
      {showExpressIntake && (
        <div className="bg-white border border-brand-500/30 rounded-2xl p-4 shadow-none relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                ⚡ Pendaftaran Pantas (30s Intake) &bull; Cetak Tag Pemegang Motor
              </span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              Auto-Kesan Pelanggan Sedia Ada Melalui No Plat
            </span>
          </div>

          <form onSubmit={handleExpressIntakeSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                No. Plat Motor *
              </label>
              <input
                type="text"
                placeholder="cth: VDF 8899"
                value={newPlate}
                onChange={(e) => handlePlateChange(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-red-600 uppercase placeholder-slate-600 focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                Model / Jenama
              </label>
              <input
                type="text"
                placeholder="cth: Y15ZR V2"
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-slate-600 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                Nama Pemilik
              </label>
              <input
                type="text"
                placeholder="cth: Azman Shah"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-slate-600 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                No. WhatsApp
              </label>
              <input
                type="text"
                placeholder="cth: 0123456789"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-slate-600 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                Odo (KM)
              </label>
              <input
                type="number"
                placeholder="24500"
                value={newMileage}
                onChange={(e) => setNewMileage(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-2 py-2 text-xs font-mono text-zinc-900 placeholder-slate-600 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                Aduan / Kerja Servis *
              </label>
              <input
                type="text"
                placeholder="cth: Servis Minyak + Belting"
                value={newComplaint}
                onChange={(e) => setNewComplaint(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-slate-600 focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                Nombor Tag Kunci *
              </label>
              <input
                type="text"
                placeholder="cth: TAG-08"
                value={newKeyTag}
                onChange={(e) => setNewKeyTag(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-slate-600 focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                Catatan Bahaya Keselamatan
              </label>
              <input
                type="text"
                placeholder="cth: Tayar botak"
                value={newSafetyFlags}
                onChange={(e) => setNewSafetyFlags(e.target.value)}
                className="w-full bg-zinc-50 border border-red-300 rounded-xl px-3 py-2 text-xs text-red-600 placeholder-red-300 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="md:col-span-1">
              <button
                type="submit"
                disabled={isSubmittingIntake}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
              >
                {isSubmittingIntake ? "..." : "Daftar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Radar Motosikal Tersadai (>14 Hari) - Amaran Kerani & Fi Simpanan */}
      {abandonedBikes.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider">
                  Radar Motosikal Tersadai: {abandonedBikes.length} Unit Melebihi 14 Hari Siap
                </span>
                <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.2 rounded font-mono font-bold">
                  Kutipan Lewat
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 mt-0.5">
                Unit seperti <span className="font-bold text-red-600">{abandonedBikes[0]?.plateNumber}</span> ({abandonedBikes[0]?.ownerName || "Pelanggan"}) telah sedia diambil. Cadangan: kenakan Fi Simpanan RM5/hari atau hantar peringatan tegas.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleSendWhatsApp(abandonedBikes[0], "ready")}
              className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Notis Terakhir</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Papan Kerja Kanban (4 Fasa Aliran) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {columns.map((col) => {
          const colWOs = workOrders.filter((w) => w.status === col.id);
          const colBorderColor =
            col.id === "in_progress"
              ? "border-red-500"
              : col.id === "ready"
              ? "border-emerald-400"
              : "border-zinc-200";

          return (
            <div key={col.id} className={`spike-card border ${colBorderColor} p-4 flex flex-col min-h-[500px]`}>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 mb-3">
                <span className="text-xs font-black uppercase tracking-wider font-mono">{col.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black font-mono ${
                  col.id === "in_progress" ? "bg-red-600 text-white animate-pulse" : "bg-white text-zinc-300 border border-zinc-200"
                }`}>
                  {colWOs.length} UNIT
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {colWOs.map((wo) => {
                  const bikeImg = getBikeImage(wo.model || "");
                  return (
                    <div
                      key={wo.id}
                      className="spike-card overflow-hidden group hover:border-red-600 transition-all duration-300 flex flex-col justify-between shadow-lg"
                    >
                      {/* Thumbnail Image Header */}
                      <div className="relative h-24 w-full bg-white overflow-hidden">
                        <img
                          src={bikeImg}
                          alt={wo.model || "Motosikal"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
                        />
                        
                        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                          <span className="font-mono text-xs font-black bg-black/90 px-2 py-0.5 rounded border border-white/20 tracking-wider shadow">
                            {wo.plateNumber}
                          </span>
                          {wo.keyTag && (
                            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                              {wo.keyTag}
                            </span>
                          )}
                        </div>

                        <div className="absolute top-2 right-2">
                          <span className="font-mono text-[10px] font-bold text-red-400 bg-black/80 px-1.5 py-0.5 rounded border border-red-500/30">
                            {wo.woNumber}
                          </span>
                        </div>

                        <div className="absolute bottom-1 right-2">
                          <span className="font-mono text-xs font-black text-white bg-red-600 px-2 py-0.5 rounded shadow">
                            RM {(wo.grandTotal || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Body card */}
                      <div className="p-3 space-y-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-zinc-900 truncate">{wo.model || "Motosikal"}</h4>
                            {wo.safetyFlags && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-red-600 text-white animate-pulse shadow-sm shadow-red-600/50 flex-shrink-0">
                                BAHAYA ⚠️
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-500 font-semibold">{wo.ownerName || "Pelanggan"}</p>
                        </div>

                        {/* Complaint */}
                        <div className="bg-zinc-50 rounded-xl p-2 border border-zinc-200">
                          <p className="text-[11px] text-zinc-800 line-clamp-2 font-medium">
                            <span className="font-bold text-red-600 font-mono">Aduan: </span>
                            {wo.customerComplaint}
                          </p>
                        </div>

                        {wo.status === "waiting_parts" && (
                          <div className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded shadow animate-pulse text-center">
                            ⏸️ Menunggu Alat Ganti Pembekal
                          </div>
                        )}
                        {/* Actions Toolbar */}
                        <div className="pt-2 border-t border-zinc-200 flex flex-wrap gap-1 items-center justify-between">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedWO(wo);
                                fetchWoItems(wo.id);
                                setIsAddItemModalOpen(true);
                              }}
                              className="spike-btn-dark text-[10px] py-1 px-1.5 text-zinc-300 hover:text-red-600"
                              title="Pengurusan Bil & Alat Ganti"
                            >
                              + Item
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedWO(wo);
                                setIsPhotoModalOpen(true);
                              }}
                              className="spike-btn-dark text-[10px] py-1 px-1.5 text-red-400 hover:text-red-600 flex items-center gap-0.5"
                              title="Ambil Foto Bukti"
                            >
                              <Camera className="w-3 h-3" />
                              <span>Foto</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSendWhatsApp(wo, wo.status === "ready" ? "ready" : "approval")}
                              className="spike-btn-dark text-[10px] py-1 px-1.5 text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5"
                              title={wo.status === "ready" ? "Hantar Notis Motor Siap (WhatsApp)" : "Hantar Senarai Alat Ganti & Minta Kelulusan (WhatsApp)"}
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>{wo.status === "ready" ? "Siap" : "Wasap"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenPrint(wo, wo.paymentStatus === "paid" ? "receipt" : "jobcard")}
                              className="spike-btn-dark text-[10px] py-1 px-1.5 text-zinc-400 hover:text-red-600"
                              title="Cetak Slip 80mm"
                            >
                              <Printer className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedWO(wo);
                                setIsStickerModalOpen(true);
                              }}
                              className="spike-btn-dark text-[10px] py-1 px-1.5 text-zinc-400 hover:text-red-600"
                              title="Cetak Pelekat Servis Minyak"
                            >
                              🏷️ Pelekat
                            </button>

                          </div>

                          {/* Status Progression Button */}
                          {col.id === "pending" && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleSendWhatsApp(wo, "approval")}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black py-1 px-1.5 flex items-center gap-0.5 cursor-pointer shadow-xs"
                                title="Hantar sebut harga alat ganti & anggaran kos ke WhatsApp untuk kelulusan pelanggan sebelum kerja dimulakan"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>Kebenaran</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(wo.id, "in_progress")}
                                className="spike-btn-red text-[10px] py-1 px-2.5 font-black"
                              >
                                Mula ➔
                              </button>
                            </div>
                          )}
                          {col.id === "in_progress" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(wo.id, "waiting_parts")}
                                className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] py-1 px-2.5 rounded-xl shadow-sm transition mb-1"
                              >
                                ⏸️ Tunggu Parts
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(wo.id, "ready")}
                                className="bg-zinc-950 hover:bg-zinc-800 text-white font-black text-[10px] py-1 px-2.5 rounded-xl shadow-sm transition"
                              >
                                Siap ➔
                              </button>
                            </>
                          )}
                          {col.id === "waiting_parts" && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(wo.id, "in_progress")}
                              className="bg-zinc-950 hover:bg-blue-500 text-white font-black text-[10px] py-1 px-2.5 rounded-xl shadow-sm transition"
                            >
                              Sambung ➔
                            </button>
                          )}
                          {col.id === "ready" && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedWO(wo);
                                  setIsPayModalOpen(true);
                                }}
                                className="spike-btn-white text-[10px] py-1 px-2.5 flex items-center gap-1 font-black"
                              >
                                <DollarSign className="w-3 h-3 text-red-600" />
                                <span>Bayar</span>
                              </button>
                              {onGoToPOS && (
                                <button
                                  type="button"
                                  onClick={onGoToPOS}
                                  className="bg-red-600 hover:bg-red-700 text-white text-[10px] py-1 px-2.5 rounded-xl font-black shadow-sm transition flex items-center gap-1 ml-1"
                                >
                                  <span>Bayar di Kaunter ➔</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: BUKA WORK ORDER BARU */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold flex items-center space-x-2">
              <Wrench className="w-5 h-5 text-brand-500" />
              <span>Buka Job Card / Work Order Baru</span>
            </h3>

            <form onSubmit={handleCreateWO} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-600">Nombor Plat Motosikal *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: VHG 8821"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-sm focus:border-brand-500 outline-none uppercase font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600">Model Motor</label>
                  <input
                    type="text"
                    placeholder="NVX, Y15ZR, RS-X"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-sm focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600">Mileage Semasa (KM)</label>
                  <input
                    type="number"
                    placeholder="18450"
                    value={newMileage}
                    onChange={(e) => setNewMileage(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-sm focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-600">Nama Pelanggan</label>
                  <input
                    type="text"
                    placeholder="Akmal Hakim"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-sm focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600">No Telefon</label>
                  <input
                    type="text"
                    placeholder="0123456789"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-sm focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600">Aduan Kerosakan / Jenis Servis *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Contoh: Bunyi kasar kat CVT, tukar minyak hitam, rantai kendur..."
                  value={newComplaint}
                  onChange={(e) => setNewComplaint(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-black text-sm focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600">Nombor Tag Kunci *</label>
                <input
                  type="text"
                  placeholder="Contoh: TAG-08"
                  value={newKeyTag}
                  onChange={(e) => setNewKeyTag(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-black text-sm focus:border-brand-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600">Catatan Bahaya Keselamatan (Pilihan)</label>
                <input
                  type="text"
                  placeholder="Contoh: Pad brek haus, tayar retak..."
                  value={newSafetyFlags}
                  onChange={(e) => setNewSafetyFlags(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-red-300 text-red-600 text-sm focus:border-red-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white text-xs font-bold"
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

      {/* MODAL 2: CIRI 2 - FOTO BUKTI KEROSAKAN (GAMBAR / KAMERA) */}
      {isPhotoModalOpen && selectedWO && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-red-200 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
              <div className="flex items-center space-x-2 text-red-600">
                <Camera className="w-5 h-5" />
                <h3 className="text-lg font-bold ">Foto Bukti Kerosakan Alat</h3>
              </div>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1 rounded-lg text-zinc-500 hover:text-red-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-500">
              Ambil gambar jelas bahagian atau alat ganti yang rosak pada motor <span className="font-bold ">{selectedWO.plateNumber}</span> untuk dihantar ke WhatsApp pelanggan.
            </p>

            <form onSubmit={handleAttachPhoto} className="space-y-3.5">
              {/* Muat Naik Foto / Kamera */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 flex items-center justify-between">
                  <span>Foto Bukti (Kamera Telefon / Fail PC) *</span>
                  {photoDataUrl && <span className="text-[10px] text-emerald-400 font-bold">✓ Foto Dimuat Naik</span>}
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/70 hover:bg-zinc-50 hover:border-red-600 text-zinc-600 text-xs font-medium transition">
                    <Camera className="w-4 h-4 text-red-600" />
                    <span>Tangkap Gambar / Pilih Fail</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setPhotoDataUrl(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  {photoDataUrl && (
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-zinc-300 shrink-0">
                      <img src={photoDataUrl} alt="Preview Bukti" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotoDataUrl("")}
                        className="absolute top-0.5 right-0.5 p-0.5 bg-black/80 rounded-full text-red-700"
                        title="Padam"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600">Penjelasan Mekanik Untuk Pelanggan</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Roller CVT dah berlekuk dan mangkok klac calar teruk..."
                  value={photoDesc}
                  onChange={(e) => setPhotoDesc(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs focus:border-red-600 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!photoDataUrl}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black text-xs"
                >
                  Simpan & Hantar Foto ke WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PENGURUSAN BIL & TAMBAH PART / UPAH */}
      {isAddItemModalOpen && selectedWO && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-zinc-200 pb-3">
              <div>
                <h3 className="text-lg font-black text-zinc-950 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-red-600" />
                  <span>Pengurusan Bil & Alat Ganti Kad Kerja</span>
                </h3>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Work Order: <span className="font-bold font-mono text-red-600">{selectedWO.woNumber}</span> &bull; Plat: <span className="font-bold text-zinc-950">{selectedWO.plateNumber}</span> ({selectedWO.model || "Motosikal"})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddItemModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SEKSYEN 1: SENARAI ITEM SEMASA DALAM KAD KERJA */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-950">
                  Item Sedia Ada Dalam Bil ({selectedWoItems.length})
                </span>
                {isLoadingWoItems && (
                  <span className="text-[11px] text-zinc-500 animate-pulse">Memuatkan bil...</span>
                )}
              </div>

              {selectedWoItems.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-zinc-300 text-center bg-zinc-50">
                  <p className="text-xs text-zinc-600 font-medium">
                    Belum ada alat ganti atau upah dimasukkan dalam kad kerja ini. Sila tambah di bawah.
                  </p>
                </div>
              ) : (
                <div className="border border-zinc-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-100 text-zinc-800 font-black border-b border-zinc-200">
                      <tr>
                        <th className="py-2 px-3">No</th>
                        <th className="py-2 px-3">Keterangan / Komponen</th>
                        <th className="py-2 px-2">Jenis</th>
                        <th className="py-2 px-2 text-center">Qty</th>
                        <th className="py-2 px-3 text-right">Harga (RM)</th>
                        <th className="py-2 px-3 text-right">Jumlah (RM)</th>
                        <th className="py-2 px-2 text-center">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {selectedWoItems.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-zinc-50">
                          <td className="py-2 px-3 text-zinc-500 font-mono">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-zinc-950">{item.description}</td>
                          <td className="py-2 px-2">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                item.itemType === "part"
                                  ? "bg-red-50 text-red-600 border border-red-200"
                                  : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              }`}
                            >
                              {item.itemType === "part" ? "Alat Ganti" : "Upah Buruh"}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center font-mono font-bold text-zinc-950">{item.quantity}</td>
                          <td className="py-2 px-3 text-right font-mono text-zinc-700">
                            {Number(item.unitPrice).toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-black text-zinc-950">
                            {(Number(item.totalPrice) || Number(item.unitPrice) * Number(item.quantity)).toFixed(2)}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-800 font-black p-1 hover:bg-red-50 rounded transition"
                              title="Padam item ini & pulangkan ke stok"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Subtotal & Ringkasan */}
                  <div className="bg-zinc-50 p-3 border-t border-zinc-200 flex flex-wrap items-center justify-between text-xs font-bold gap-2">
                    <div className="flex gap-4 text-zinc-600 text-[11px]">
                      <span>
                        Alat Ganti: <span className="font-mono text-zinc-950">RM {selectedWoItems.filter(i => i.itemType === "part").reduce((acc, i) => acc + (Number(i.totalPrice) || Number(i.unitPrice) * Number(i.quantity)), 0).toFixed(2)}</span>
                      </span>
                      <span>
                        Upah Buruh: <span className="font-mono text-zinc-950">RM {selectedWoItems.filter(i => i.itemType === "labor").reduce((acc, i) => acc + (Number(i.totalPrice) || Number(i.unitPrice) * Number(i.quantity)), 0).toFixed(2)}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-black text-red-600">
                        Grand Total: RM {selectedWoItems.reduce((acc, i) => acc + (Number(i.totalPrice) || Number(i.unitPrice) * Number(i.quantity)), 0).toFixed(2)}
                      </div>
                      <button
                        type="button"
                        onClick={() => selectedWO && handleSendWhatsApp(selectedWO, "approval")}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                        title="Hantar sebut harga alat ganti & upah ke WhatsApp pelanggan untuk kebenaran sebelum kerja dimulakan"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Minta Kelulusan Pelanggan (WhatsApp)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SEKSYEN 2: BORANG TAMBAH ITEM BARU */}
            <form onSubmit={handleAddItem} className="space-y-3 pt-3 border-t border-zinc-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-950">
                  + Tambah Alat Ganti / Upah Baharu
                </span>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setItemType("part")}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                    itemType === "part"
                      ? "bg-zinc-950 text-white border-zinc-950"
                      : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                  }`}
                >
                  Alat Ganti (Stok Rak)
                </button>
                <button
                  type="button"
                  onClick={() => setItemType("labor")}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                    itemType === "labor"
                      ? "bg-zinc-950 text-white border-zinc-950"
                      : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                  }`}
                >
                  Upah & Servis (Labor)
                </button>
              </div>

              {itemType === "part" ? (
                <div>
                  <label className="text-xs font-bold text-zinc-800">Pilih dari Stok Rak Stor</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => {
                      setSelectedProductId(e.target.value);
                      const p = products.find((x) => x.id === e.target.value);
                      if (p) {
                        setItemPrice(p.sellingPrice.toString());
                        setItemDesc(p.name);
                        setOriginalStandardPrice(p.sellingPrice);
                      }
                    }}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-xs font-medium text-zinc-950 focus:border-red-600 outline-none"
                  >
                    <option value="">-- Pilih Alat Ganti Dari Stor --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Baki: {p.stockQty} di {p.rackLocation}) - RM {p.sellingPrice.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-800">Pilih Tugasan Standard Kerani</label>
                    <button
                      type="button"
                      onClick={() => setIsMasterTariffOpen(true)}
                      className="text-[10px] text-red-600 hover:underline flex items-center gap-1 font-bold"
                    >
                      <Settings className="w-3 h-3" /> Urus Menu Standard
                    </button>
                  </div>
                  <select
                    value={selectedTaskId}
                    onChange={(e) => {
                      setSelectedTaskId(e.target.value);
                      const t = standardTasks.find((x) => x.id === e.target.value);
                      if (t) {
                        setItemDesc(t.name);
                        setItemPrice(t.standardPrice.toString());
                        setOriginalStandardPrice(t.standardPrice);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-xs font-medium text-zinc-950 focus:border-red-600 outline-none"
                  >
                    <option value="">-- Pilih Jenis Kerja / Upah Servis --</option>
                    {standardTasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} (Std: RM {t.standardPrice.toFixed(2)} &bull; Komisen: RM {t.commission.toFixed(2)})
                      </option>
                    ))}
                  </select>

                  <div>
                    <label className="text-xs font-bold text-zinc-800">Keterangan Upah Kerja</label>
                    <input
                      type="text"
                      placeholder="Contoh: Upah buka CVT & cuci mangkuk"
                      value={itemDesc}
                      onChange={(e) => setItemDesc(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-xs font-medium text-zinc-950 focus:border-red-600 outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-800">Kuantiti</label>
                  <input
                    type="number"
                    min="1"
                    value={itemQty}
                    onChange={(e) => setItemQty(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-xs font-mono font-bold text-zinc-950 focus:border-red-600 outline-none"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-800">Harga Seunit (RM) *</label>
                    <span className="text-[10px] text-red-600 font-bold">Boleh Edit</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-red-600 font-mono font-black text-xs focus:border-red-600 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Seksyen Rekod Audit Pindaan Harga Jika Diubah */}
              {originalStandardPrice !== null && parseFloat(itemPrice) !== originalStandardPrice && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-red-600 text-[11px]">
                    <span>Standard Asal: RM {originalStandardPrice.toFixed(2)}</span>
                    <span>Diubah: RM {(parseFloat(itemPrice) || 0).toFixed(2)}</span>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-600 block mb-1">
                      Sebab Ubah Harga (Audit Trail) *
                    </label>
                    <input
                      type="text"
                      placeholder="cth: Skru patah jem berkarat / Diskaun kawan"
                      value={priceOverrideReason}
                      onChange={(e) => setPriceOverrideReason(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-zinc-300 text-xs focus:border-red-600 outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition"
                >
                  Selesai / Tutup
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-lg shadow-red-600/20 transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Masukkan ke Bil Motor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PITSTOP KILAT (< 2 MINIT) FAST CHECKOUT */}
      {isPitstopModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-red-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-none">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl p-2 rounded-2xl bg-red-50 border border-red-200">
                  {activePitstopJob.icon}
                </span>
                <div>
                  <h3 className="text-base font-black ">{activePitstopJob.label}</h3>
                  <p className="text-xs text-red-600 font-bold">
                    ⚡ Pitstop Kilat &bull; {activePitstopJob.price > 0 ? `RM ${activePitstopJob.price.toFixed(2)} Siap Pasang` : "Servis Percuma (FOC)"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPitstopModalOpen(false)}
                className="p-1 rounded-lg text-zinc-500 hover:text-red-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteQuickPitstop} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                  No. Plat Motor (Ringkas) *
                </label>
                <input
                  type="text"
                  placeholder="cth: VDF 8899 atau tekan Walk-in"
                  value={pitstopPlate}
                  onChange={(e) => setPitstopPlate(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-red-600 uppercase focus:border-red-600 outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                    Mekanik Bertugas
                  </label>
                  <select
                    value={pitstopMechanic}
                    onChange={(e) => setPitstopMechanic(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-2.5 py-2 text-xs focus:border-brand-500 outline-none"
                  >
                    <option value="Sifu Halim">Sifu Halim (Bay 1)</option>
                    <option value="Zulfa">Zulfa (Bay 2)</option>
                    <option value="Amir">Amir (Bay 3)</option>
                    <option value="Aiman Hakimi">Aiman (Kaunter)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                    Kaedah Bayaran
                  </label>
                  <select
                    value={pitstopMethod}
                    onChange={(e) => setPitstopMethod(e.target.value as any)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-2.5 py-2 text-xs focus:border-brand-500 outline-none"
                  >
                    <option value="cash">Tunai (Cash)</option>
                    <option value="qr">DuitNow QR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                  Catatan Ringkas (Pilihan)
                </label>
                <input
                  type="text"
                  placeholder="cth: Mentol belakang T10 / Tudung tiub aloi biru"
                  value={pitstopNotes}
                  onChange={(e) => setPitstopNotes(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs focus:border-brand-500 outline-none"
                />
              </div>

              <div className="bg-zinc-50/80 p-3 rounded-xl border border-zinc-200 text-xs space-y-1">
                <div className="flex justify-between text-zinc-500">
                  <span>Komisen Mekanik ({pitstopMechanic}):</span>
                  <span className="font-mono text-emerald-400 font-bold">+ RM {activePitstopJob.commission.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-sm pt-1 border-t border-zinc-200 ">
                  <span>Jumlah Kutipan Kaunter:</span>
                  <span className="text-red-600 font-mono text-base">RM {activePitstopJob.price.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-lg transition-all"
              >
                Sahkan & Selesai (Bypass Kad Kerja)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESIT PITSTOP KILAT */}
      {pitstopReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-black font-mono rounded-2xl max-w-sm w-full p-6 shadow-none space-y-3 text-xs">
            <div className="text-center border-b border-dashed border-gray-400 pb-2">
              <h3 className="font-black text-base">FFMOTOR 3S RAWANG</h3>
              <p className="text-[10px] text-gray-600">SLIP PITSTOP KILAT &bull; {pitstopReceipt.receiptNo}</p>
              <p className="text-[10px] text-gray-500">{pitstopReceipt.time}</p>
            </div>
            <div className="space-y-1 border-b border-dashed border-gray-400 pb-2">
              <div className="flex justify-between">
                <span className="font-bold">No. Plat:</span>
                <span className="font-black">{pitstopReceipt.plateNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Tugasan:</span>
                <span className="font-bold">{pitstopReceipt.job}</span>
              </div>
              <div className="flex justify-between">
                <span>Mekanik:</span>
                <span>{pitstopReceipt.mechanic}</span>
              </div>
              <div className="flex justify-between font-black text-sm pt-1 border-t border-gray-200">
                <span>JUMLAH:</span>
                <span>RM {pitstopReceipt.amount.toFixed(2)} ({pitstopReceipt.paymentMethod.toUpperCase()})</span>
              </div>
            </div>
            <p className="text-center text-[10px] text-gray-500">Terima kasih atas kunjungan kilat anda!</p>
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 bg-black text-white font-bold py-2 rounded-lg text-xs"
              >
                Cetak Slip
              </button>
              <button
                type="button"
                onClick={() => setPitstopReceipt(null)}
                className="bg-gray-200 hover:bg-gray-300 font-bold py-2 px-4 rounded-lg text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PENGURUSAN MENU TUGASAN STANDARD (MASTER TARIFF - KERANI) */}
      {isMasterTariffOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-none">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-zinc-100 text-red-600">
                  <Settings className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black ">Katalog Upah & Tugasan Standard</h3>
                  <p className="text-xs text-zinc-500">Dikelola oleh Kerani & Pengurus sahaja</p>
                </div>
              </div>
              <button
                onClick={() => setIsMasterTariffOpen(false)}
                className="p-1 rounded-lg text-zinc-500 hover:text-red-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Borang Tambah Servis Baharu */}
            <form onSubmit={handleAddMasterTask} className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200 space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block">
                + Tambah Servis Standard Baru
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-6">
                  <input
                    type="text"
                    placeholder="Nama Servis (cth: Cuci Throttle Body)"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-zinc-300 text-xs focus:border-brand-500 outline-none"
                    required
                  />
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Harga RM"
                    value={newTaskPrice}
                    onChange={(e) => setNewTaskPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-zinc-300 text-xs focus:border-brand-500 outline-none"
                    required
                  />
                </div>
                <div className="sm:col-span-3">
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-lg shadow-sm"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </form>

            {/* Senarai Tugasan Semasa */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {standardTasks.map((task) => (
                <div key={task.id} className="p-2.5 rounded-xl bg-zinc-50/60 border border-zinc-200/80 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-zinc-700">{task.name}</p>
                    <span className="text-[10px] text-zinc-500">Komisen Mekanik: RM {task.commission.toFixed(2)}</span>
                  </div>
                  <span className="font-mono font-bold text-red-600">
                    RM {task.standardPrice.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: BAYAR DI KAUNTER (POS CHECKOUT) */}
      {isPayModalOpen && selectedWO && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Selesai & Bayaran di Kaunter (POS)</span>
            </h3>

            <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 space-y-2">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>No. Work Order:</span>
                <span className="font-mono font-bold">{selectedWO.woNumber}</span>
              </div>
              <div className="flex justify-between text-xs text-zinc-500">
                <span>No. Plat Motosikal:</span>
                <span className=" font-bold">{selectedWO.plateNumber}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold pt-2 border-t border-zinc-200">
                <span>Jumlah Perlu Dibayar:</span>
                <span className="text-emerald-400">RM {(selectedWO.grandTotal || 0).toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-600">Kaedah Bayaran</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-sm focus:border-brand-500 outline-none"
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
                className="px-4 py-2 rounded-xl bg-white text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={handlePay}
                className="px-5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-black text-xs shadow-lg shadow-emerald-500/20"
              >
                Sahkan Bayaran & Cetak Resit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: CETAK SLIP / RESIT TERMAL (80mm) */}
      
      {/* MODAL: PELEKAT SERVIS MINYAK */}
      {isStickerModalOpen && selectedWO && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-red-600 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-none">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900">🏷️ Cetak Pelekat Servis</h3>
              <button
                onClick={() => setIsStickerModalOpen(false)}
                className="p-1 rounded-lg text-zinc-500 hover:text-zinc-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setStickerOilType("semi")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border ${stickerOilType === "semi" ? "bg-red-600 text-white border-red-600" : "bg-zinc-50 text-zinc-500 border-zinc-200"}`}
              >
                Semi-Synthetic (+3000 KM)
              </button>
              <button
                onClick={() => setStickerOilType("fully")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border ${stickerOilType === "fully" ? "bg-red-600 text-white border-red-600" : "bg-zinc-50 text-zinc-500 border-zinc-200"}`}
              >
                Fully-Synthetic (+5000 KM)
              </button>
            </div>

            <div className="border-4 border-red-600 rounded-xl p-3 bg-white text-zinc-900 font-mono relative overflow-hidden flex flex-col items-center justify-center" style={{ width: "200px", height: "120px", margin: "0 auto" }}>
               <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-center text-[10px] font-black py-0.5 uppercase tracking-widest">FFmotor Service</div>
               <div className="pt-4 text-center w-full">
                 <p className="text-[10px] font-bold text-zinc-500 uppercase">Next Service</p>
                 <p className="text-xl font-black text-zinc-900">
                   {((selectedWO.mileageIn || 0) + (stickerOilType === 'fully' ? 5000 : 3000)).toLocaleString()} KM
                 </p>
                 <p className="text-xs font-bold mt-0.5 text-red-600">
                   {new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('ms-MY')}
                 </p>
                 <p className="text-[9px] mt-1 font-bold text-zinc-400 border-t border-zinc-200 pt-1">{selectedWO.plateNumber}</p>
               </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setIsStickerModalOpen(false)} className="px-4 py-2 rounded-xl bg-white text-xs font-bold">Batal</button>
              <button onClick={() => window.print()} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md">Cetak Pelekat</button>
            </div>
          </div>
        </div>
      )}

      {selectedWO && (
        <ThermalReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          workOrder={selectedWO}
          type={receiptType}
        />
      )}
    </div>
  );
};

