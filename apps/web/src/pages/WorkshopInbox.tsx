import React, { useState } from "react";
import {
  MessageSquare,
  Search,
  Send,
  Video,
  CheckCircle2,
  Bike,
  Phone,
  Paperclip,
  Sparkles,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { WorkOrder } from "../types";
import { createWhatsAppLink, WhatsAppTemplates } from "../lib/whatsapp";

interface WorkshopInboxProps {
  workOrders: WorkOrder[];
  onOpenTrack: (token: string) => void;
}

interface ChatContact {
  id: string;
  name: string;
  phone: string;
  plateNumber: string;
  model: string;
  lastMessage: string;
  lastTime: string;
  unreadCount?: number;
  workOrder?: WorkOrder;
}

export const WorkshopInbox: React.FC<WorkshopInboxProps> = ({ workOrders, onOpenTrack }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [inputText, setInputText] = useState("");

  const contacts: ChatContact[] = workOrders.map((wo) => ({
    id: wo.id,
    name: wo.ownerName || "Pelanggan",
    phone: wo.ownerPhone || "0123456789",
    plateNumber: wo.plateNumber || "TIADA PLAT",
    model: `${wo.brand || ""} ${wo.model || ""}`.trim() || "Motosikal",
    lastMessage: wo.status === "waiting_approval"
      ? "Sila sahkan video kerosakan belting CVT"
      : wo.status === "ready"
      ? "Motor anda telah siap dan diuji jalan"
      : wo.customerComplaint,
    lastTime: "Hari ini",
    unreadCount: wo.status === "waiting_approval" ? 1 : 0,
    workOrder: wo,
  }));

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.plateNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [selectedContact, setSelectedContact] = useState<ChatContact>(contacts[0]);

  const [messages, setMessages] = useState([
    { id: "1", sender: "bot", text: `Selamat datang ke FFmotor. Motosikal anda ${selectedContact?.plateNumber} telah didaftarkan ke sistem.`, time: "10:15 AM" },
    { id: "2", sender: "mechanic", text: "Mekanik telah memulakan diagnosis. Menemui kehausan pada belting dan roller.", time: "11:30 AM" },
    { id: "3", sender: "customer", text: "Berapa kos anggaran kalau nak tukar satu set?", time: "11:32 AM" },
  ]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    setMessages([
      ...messages,
      { id: Math.random().toString(), sender: "mechanic", text: inputText, time: "Sekarang" },
    ]);
    if (selectedContact?.phone) {
      window.open(createWhatsAppLink(selectedContact.phone, inputText), "_blank");
    }
    setInputText("");
  };

  const handleSendCannedTemplate = (type: "video" | "ready" | "receipt") => {
    if (!selectedContact.workOrder) return;
    const wo = selectedContact.workOrder;
    let text = "";

    if (type === "video") {
      const trackUrl = `${window.location.origin}/track/${wo.approvalToken}`;
      text = WhatsAppTemplates.videoProof(
        wo.ownerName || "Pelanggan",
        wo.plateNumber || "Motosikal",
        wo.grandTotal || 0,
        trackUrl
      );
    } else if (type === "ready") {
      const passportUrl = `${window.location.origin}/passport/${wo.plateNumber}`;
      text = WhatsAppTemplates.motorReady(
        wo.ownerName || "Pelanggan",
        wo.plateNumber || "Motosikal",
        wo.grandTotal || 0,
        passportUrl
      );
    }

    setMessages([
      ...messages,
      { id: Math.random().toString(), sender: "mechanic", text, time: "Sekarang" },
    ]);

    if (selectedContact.phone) {
      window.open(createWhatsAppLink(selectedContact.phone, text), "_blank");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
          <span>FFmotor HQ</span>
          <span>/</span>
          <span className="text-brand-400 font-bold">Pusat Sembang & WhatsApp</span>
        </nav>
        <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-1">
          WhatsApp Inbox & Pusat Komunikasi Bengkel
        </h1>
        <p className="text-xs text-slate-400">
          Berhubung terus dengan pemilik motosikal, arkib mesej, dan hantar pautan video bukti secara langsung.
        </p>
      </div>

      {/* Grid: Chat Sidebar vs Chat Window */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden grid lg:grid-cols-12 min-h-[620px]">
        {/* Kolum Kiri (4 Cols): Senarai Sembang */}
        <div className="lg:col-span-4 border-r border-slate-800 flex flex-col justify-between bg-slate-950/40">
          <div className="p-4 border-b border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari sembang / plat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-brand-500 font-medium"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 max-h-[540px]">
            {filteredContacts.map((contact) => {
              const isSelected = selectedContact?.id === contact.id;
              return (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-3.5 flex items-center justify-between cursor-pointer transition ${
                    isSelected ? "bg-brand-500/15 border-l-4 border-brand-500" : "hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-brand-400 shrink-0">
                      {contact.plateNumber.slice(0, 3)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-white truncate">{contact.name}</span>
                        <span className="text-[10px] font-mono text-brand-400 font-bold shrink-0">({contact.plateNumber})</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{contact.lastMessage}</p>
                    </div>
                  </div>

                  {contact.unreadCount ? (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {contact.unreadCount}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Kolum Kanan (8 Cols): Ruang Perbualan Chat */}
        {selectedContact ? (
          <div className="lg:col-span-8 flex flex-col justify-between bg-slate-900/60">
            {/* Header Perbualan */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  {selectedContact.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{selectedContact.name}</span>
                    <span className="text-xs font-mono font-extrabold text-brand-400">
                      [{selectedContact.plateNumber}]
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">{selectedContact.phone} • {selectedContact.model}</p>
                </div>
              </div>

              {selectedContact.workOrder?.approvalToken && (
                <button
                  onClick={() => onOpenTrack(selectedContact.workOrder!.approvalToken)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Live Video Tracking</span>
                </button>
              )}
            </div>

            {/* Kotak Mesej */}
            <div className="p-4 space-y-3.5 overflow-y-auto flex-1 max-h-[420px]">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === "customer" ? "items-start" : "items-end"}`}
                >
                  <div
                    className={`max-w-md rounded-2xl p-3.5 text-xs shadow-sm ${
                      m.sender === "customer"
                        ? "bg-slate-800 text-slate-200 rounded-bl-none"
                        : m.sender === "bot"
                        ? "bg-slate-950 border border-slate-800 text-slate-300 italic"
                        : "bg-brand-600 text-white rounded-br-none"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-1 px-1">{m.time}</span>
                </div>
              ))}
            </div>

            {/* Template Cepat / Canned Responses */}
            <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800 flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Templat:</span>
              <button
                onClick={() => handleSendCannedTemplate("video")}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-[11px] font-semibold shrink-0 transition"
              >
                <Video className="w-3 h-3" />
                <span>Pautan Video Kelulusan</span>
              </button>
              <button
                onClick={() => handleSendCannedTemplate("ready")}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold shrink-0 transition"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Notis Motor Siap Dibaiki</span>
              </button>
            </div>

            {/* Input Hantar Mesej */}
            <div className="p-3 border-t border-slate-800 bg-slate-900 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Taip mesej untuk pelanggan atau mekanik..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-brand-500 font-medium"
              />
              <button
                onClick={handleSendMessage}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-xs"
                title="Hantar dan buka WhatsApp"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 p-12 text-center text-slate-400 text-xs my-auto">
            Pilih perbualan di sebelah kiri.
          </div>
        )}
      </div>
    </div>
  );
};

