import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Bike,
  Phone,
  Sparkles,
  ExternalLink,
  Clock,
  User,
  Copy,
  History,
  Check
} from "lucide-react";
import { WorkOrder } from "../types";
import { createWhatsAppLink, WhatsAppTemplates } from "../lib/whatsapp";

interface WorkshopInboxProps {
  workOrders: WorkOrder[];
  onOpenTrack: (token: string) => void;
}

interface ChatLogRecord {
  id: string;
  customerPhone: string;
  workOrderId?: string;
  sender: string;
  message: string;
  messageType: "text" | "service_status" | "motor_ready" | "predictive_alert";
  createdAt: string;
}

export const WorkshopInbox: React.FC<WorkshopInboxProps> = ({ workOrders, onOpenTrack }) => {
  const [selectedWOId, setSelectedWOId] = useState<string>(workOrders[0]?.id || "");
  const [templateType, setTemplateType] = useState<"status" | "ready" | "predictive" | "custom">("ready");
  const [customText, setCustomText] = useState("");
  const [copied, setCopied] = useState(false);
  const [recentLogs, setRecentLogs] = useState<ChatLogRecord[]>([]);

  // Auto-pilih pesanan kerja pertama sebaik sahaja data selesai dimuatkan
  useEffect(() => {
    if (!selectedWOId && workOrders.length > 0) {
      setSelectedWOId(workOrders[0].id);
    }
  }, [workOrders, selectedWOId]);

  const selectedWO = workOrders.find((w) => w.id === selectedWOId) || workOrders[0];

  const fetchRecentLogs = async () => {
    try {
      const res = await fetch("/api/inbox/recent");
      const d = await res.json();
      if (d.success && Array.isArray(d.messages)) {
        setRecentLogs(d.messages);
      }
    } catch (err) {
      console.error("Gagal memuat log mesej:", err);
    }
  };

  useEffect(() => {
    fetchRecentLogs();
  }, []);

  // Jana teks mesej mengikut templat
  const generateMessageText = () => {
    if (!selectedWO) return "";

    const customerName = selectedWO.ownerName || "Pelanggan";
    const plate = selectedWO.plateNumber || "Motosikal";
    const total = selectedWO.grandTotal || 0;

    if (templateType === "status") {
      return WhatsAppTemplates.serviceUpdate(customerName, plate, selectedWO.status.toUpperCase());
    }

    if (templateType === "ready") {
      const passportUrl = `${window.location.origin}/passport/${plate}`;
      return WhatsAppTemplates.motorReady(customerName, plate, total, passportUrl);
    }

    if (templateType === "predictive") {
      return WhatsAppTemplates.predictiveReminder(
        customerName,
        `${selectedWO.brand || ""} ${selectedWO.model || ""}`.trim() || "Motosikal",
        plate,
        "Belting CVT & Roller",
        "25 Oktober 2026"
      );
    }

    return customText || `Salam ${customerName}, kami dari FFmotor merujuk kepada motosikal anda (${plate}).`;
  };

  const currentMessageText = generateMessageText();

  // Hantar melalui pautan wa.me rasmi dan log ke D1
  const handleSendOfficialWhatsApp = async () => {
    if (!selectedWO || !selectedWO.ownerPhone) {
      alert("Sila pastikan nombor telefon pelanggan sah.");
      return;
    }

    const messageTypeMap = {
      status: "service_status" as const,
      ready: "motor_ready" as const,
      predictive: "predictive_alert" as const,
      custom: "text" as const,
    };

    // 1. Simpan rekod ke D1 audit trail
    try {
      await fetch("/api/inbox/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerPhone: selectedWO.ownerPhone,
          workOrderId: selectedWO.id,
          sender: "workshop",
          message: currentMessageText,
          messageType: messageTypeMap[templateType],
        }),
      });
      await fetchRecentLogs();
    } catch (err) {
      console.error("Gagal merekod log D1:", err);
    }

    // 2. Lancarkan aplikasi WhatsApp rasmi kedai (wa.me)
    const link = createWhatsAppLink(selectedWO.ownerPhone, currentMessageText);
    window.open(link, "_blank");
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(currentMessageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold">
            <span>FFmotor HQ</span>
            <span>/</span>
            <span className="text-brand-400 font-bold">Hab Komunikasi WhatsApp</span>
          </nav>
          <h1 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tight mt-1">
            Hab Templat & Log WhatsApp Rasmi (*wa.me Native*)
          </h1>
          <p className="text-xs text-zinc-500">
            Hantar pautan foto bukti kerosakan, notis siap, dan invois terus ke aplikasi WhatsApp rasmi pelanggan tanpa risiko nombor disekat.
          </p>
        </div>
      </div>

      {/* SEKSYEN 1: PENJANA MESEJ WHATSAPP */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Kolum Kiri (5 Cols): Pilih Kenderaan & Jenis Templat */}
          <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-none lg:col-span-5 space-y-5">
            <div>
              <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider block mb-1.5">
                1. Pilih Kad Kerja / Pelanggan Aktif:
              </label>
              <select
                value={selectedWOId}
                onChange={(e) => setSelectedWOId(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs font-medium"
              >
                {workOrders.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.plateNumber} · {w.ownerName} ({w.brand} {w.model}) - RM {(w.grandTotal || 0).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            {selectedWO && (
              <div className="rounded-xl bg-zinc-50 p-3 border border-zinc-200 text-xs space-y-1.5">
                <div className="flex justify-between text-zinc-500">
                  <span>Nama Pemilik:</span>
                  <span className="font-bold ">{selectedWO.ownerName}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>No WhatsApp:</span>
                  <span className="font-mono text-emerald-400 font-bold">{selectedWO.ownerPhone}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Status Terkini:</span>
                  <span className="font-bold text-brand-400 uppercase">{selectedWO.status}</span>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider block mb-2">
                2. Pilih Templat Mesej Rasmi:
              </label>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setTemplateType("status")}
                  className={`p-3 rounded-xl text-left border transition flex items-center justify-between ${
                    templateType === "status"
                      ? "bg-red-50 border-red-500 text-red-700 font-black"
                      : "bg-zinc-50 border-zinc-200 text-zinc-800 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                    <div>
                      <p className="font-black text-zinc-950">Kemaskini Status Servis</p>
                      <p className="text-[11px] text-zinc-600 font-bold">Makluman ringkas kemajuan kerja motor di bengkel</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplateType("ready")}
                  className={`p-3 rounded-xl text-left border transition flex items-center justify-between ${
                    templateType === "ready"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold"
                      : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-bold">Notis Motor Siap & Diuji</p>
                      <p className="text-[11px] text-zinc-500 font-normal">Jumlah bil & pautan Pasport Kesihatan Digital</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplateType("predictive")}
                  className={`p-3 rounded-xl text-left border transition flex items-center justify-between ${
                    templateType === "predictive"
                      ? "bg-zinc-100 border-zinc-300 text-zinc-700 font-bold"
                      : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-zinc-700 shrink-0" />
                    <div>
                      <p className="font-bold">Peringatan Servis Berkala (Mileage)</p>
                      <p className="text-[11px] text-zinc-500 font-normal">Peringatan ramalan mileage untuk tempahan awal</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplateType("custom")}
                  className={`p-3 rounded-xl text-left border transition flex items-center justify-between ${
                    templateType === "custom"
                      ? "bg-brand-500/10 border-brand-500/40 text-brand-300 font-bold"
                      : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-brand-400 shrink-0" />
                    <div>
                      <p className="font-bold">Mesej Khas / Teks Bebas</p>
                      <p className="text-[11px] text-zinc-500 font-normal">Taip mesej khusus mengikut keperluan pelanggan</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {templateType === "custom" && (
              <div>
                <label className="text-xs text-zinc-500 block mb-1">Teks Mesej Khas:</label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Taip mesej anda di sini..."
                  rows={3}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs "
                />
              </div>
            )}
          </div>

          {/* Kolum Kanan (7 Cols): Pratonton Mesej & Butang Lancar WhatsApp */}
          <div className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-none lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Pratonton Mesej WhatsApp Rasmi
              </h3>
              <button
                onClick={handleCopyText}
                className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-red-600 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Teks</span>
                  </>
                )}
              </button>
            </div>

            {/* Bubble Mesej ala WhatsApp */}
            <div className="rounded-2xl bg-zinc-50 p-4 border border-zinc-200 relative">
              <div className="bg-emerald-950/40 border border-emerald-200 rounded-2xl p-4 text-xs text-zinc-900 whitespace-pre-wrap font-sans leading-relaxed shadow-inner">
                {currentMessageText}
              </div>
              <p className="text-[10px] text-zinc-400 mt-2 text-right">
                Akan dihantar ke: <b className="text-zinc-600 font-mono">{selectedWO?.ownerPhone || "Tiada Nombor"}</b>
              </p>
            </div>

            {/* Penerangan Operasi Nyata */}
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-500 space-y-1">
              <p className="font-bold text-zinc-600">Bagaimana Aliran Ini Berfungsi?</p>
              <p>
                Menekan butang di bawah akan terus membuka aplikasi <b>WhatsApp Rasmi</b> di telefon staf atau komputer kaunter dengan teks di atas siap ditaip. Sifar risiko kena sekat oleh WhatsApp, dan rekod penghantaran disimpan ke Cloudflare D1.
              </p>
            </div>

            <button
              onClick={handleSendOfficialWhatsApp}
              className="w-full py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Buka WhatsApp Rasmi (wa.me) & Hantar Sekarang</span>
            </button>
          </div>
        </div>

      {/* SEKSYEN 2: SEJARAH & LOG D1 */}
      <div className="rounded-2xl border border-zinc-200 bg-white/90 shadow-none overflow-hidden">
          <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-brand-400" />
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Log Mesej WhatsApp Dihantar (Cloudflare D1 Audit)
              </h3>
            </div>
            <span className="text-xs text-zinc-500 font-mono">
              {recentLogs.length} Transaksi Direkodkan
            </span>
          </div>

          {recentLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              Tiada log mesej dihantar lagi.
            </div>
          ) : (
            <div className="divide-y divide-zinc-200/60">
              {recentLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-zinc-100/30 transition flex flex-col md:flex-row md:items-start justify-between gap-3 text-xs">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-400">{log.customerPhone}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-100 text-zinc-600 border border-zinc-300">
                        {log.messageType}
                      </span>
                    </div>
                    <p className="text-zinc-700 whitespace-pre-wrap font-mono text-[11px] bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 mt-1">
                      {log.message}
                    </p>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                    {new Date(log.createdAt).toLocaleString("ms-MY")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
};
