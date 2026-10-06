import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Phone,
  Bike,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Share2,
  DollarSign,
  Tag,
  Copy,
  ExternalLink,
  ShieldCheck,
  Send,
  MessageSquare,
  Wrench,
  Check,
  ChevronRight,
  Filter
} from "lucide-react";

interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  ic: string;
  segment: "vip" | "regular" | "overdue" | "bike_buyer";
  bikes: {
    plate: string;
    model: string;
    lastServiceDate: string;
    lastServiceKm: number;
    oilDueDays: number;
    cvtDueKm: number;
  }[];
  totalSpend: number;
  lastVisit: string;
  purchaseStatus?: {
    bikeModel: string;
    milestone: "deposit" | "loan_submitted" | "loan_approved" | "jpj_registered" | "ready_delivery";
    financier: string;
    assignedPlate?: string;
  };
}

export const CustomerCRMHub: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<string>("all");
  const [copiedBlast, setCopiedBlast] = useState(false);
  const [sentAlertId, setSentAlertId] = useState<string | null>(null);

  // Pangkalan data pelanggan realistik bengkel 3S FFmotor
  const [customers, setCustomers] = useState<CustomerRecord[]>([
    {
      id: "CUST-01",
      name: "Tengku Daniel Hakim",
      phone: "60129841029",
      ic: "940812-02-5431",
      segment: "overdue",
      bikes: [
        {
          plate: "KEM 4829",
          model: "Yamaha NVX 155 V2",
          lastServiceDate: "12/06/2026 (101 hari lepas)",
          lastServiceKm: 14500,
          oilDueDays: 101, // >90 hari = LEWAT
          cvtDueKm: 11200, // >10,000 km = PERLU SERVIS CVT
        },
      ],
      totalSpend: 1480,
      lastVisit: "12 Jun 2026",
    },
    {
      id: "CUST-02",
      name: "Muhammad Faizul Anuar",
      phone: "60174421890",
      ic: "891104-02-6119",
      segment: "bike_buyer",
      bikes: [
        {
          plate: "VDF 9102",
          model: "Yamaha Y15ZR V2",
          lastServiceDate: "05/09/2026",
          lastServiceKm: 28000,
          oilDueDays: 16,
          cvtDueKm: 4000,
        },
      ],
      totalSpend: 2350,
      lastVisit: "05 Sep 2026",
      purchaseStatus: {
        bikeModel: "Yamaha MT-15 V2 ABS",
        milestone: "loan_approved",
        financier: "AEON Credit Service",
        assignedPlate: "KEM 9912",
      },
    },
    {
      id: "CUST-03",
      name: "Khairul Azhar Zain",
      phone: "60195514820",
      ic: "910321-08-5911",
      segment: "overdue",
      bikes: [
        {
          plate: "VCH 3110",
          model: "Honda Vario 160",
          lastServiceDate: "20/05/2026 (124 hari lepas)",
          lastServiceKm: 19800,
          oilDueDays: 124,
          cvtDueKm: 9800,
        },
      ],
      totalSpend: 890,
      lastVisit: "20 Mei 2026",
    },
    {
      id: "CUST-04",
      name: "Nurul Syafiqah",
      phone: "60138849201",
      ic: "980715-02-5882",
      segment: "bike_buyer",
      bikes: [],
      totalSpend: 450,
      lastVisit: "18 Sep 2026",
      purchaseStatus: {
        bikeModel: "Honda ADV 160 ABS",
        milestone: "jpj_registered",
        financier: "Chailease Berjaya",
        assignedPlate: "KEM 9954",
      },
    },
    {
      id: "CUST-05",
      name: "Haji Ramli Zakaria",
      phone: "60124409112",
      ic: "680410-02-5123",
      segment: "vip",
      bikes: [
        {
          plate: "PKA 888",
          model: "Yamaha XMAX 250",
          lastServiceDate: "02/09/2026",
          lastServiceKm: 32000,
          oilDueDays: 19,
          cvtDueKm: 2100,
        },
      ],
      totalSpend: 4950,
      lastVisit: "02 Sep 2026",
    },
  ]);

  // Carian & Penapisan
  useEffect(() => {
    fetch("/api/vehicles")
      .then((res) => res.json())
      .then((d) => {
        if (d.success && d.vehicles && d.vehicles.length > 0) {
          const fetched: CustomerRecord[] = d.vehicles.map((v: any, idx: number) => ({
            id: `VEH-CUST-${v.id || idx}`,
            name: v.ownerName || "Pelanggan",
            phone: (v.ownerPhone || "0123456789").replace(/^0/, "60"),
            ic: "900000-00-0000",
            segment: "regular",
            bikes: [
              {
                plate: v.plateNumber,
                model: `${v.brand || ""} ${v.model || ""}`.trim(),
                lastServiceDate: v.lastServiceDate || "Baru",
                lastServiceKm: v.lastServiceMileage || v.currentMileage || 0,
                oilDueDays: 30,
                cvtDueKm: 5000,
              },
            ],
            totalSpend: 250,
            lastVisit: v.lastServiceDate || "Baru-baru ini",
          }));
          setCustomers((prev) => {
            const existingKeys = new Set(prev.map((p) => p.name.toLowerCase() + p.phone));
            const uniqueNew = fetched.filter((f) => !existingKeys.has(f.name.toLowerCase() + f.phone));
            return [...uniqueNew, ...prev];
          });
        }
      })
      .catch(() => null);
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const matchQuery =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.ic.includes(searchQuery) ||
      c.bikes.some((b) => b.plate.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedSegment === "all") return matchQuery;
    return matchQuery && c.segment === selectedSegment;
  });

  // Pelanggan yang perlu di-alert tentang servis (Recall)
  const overdueMaintenanceCustomers = customers.filter((c) =>
    c.bikes.some((b) => b.oilDueDays > 90 || b.cvtDueKm >= 10000)
  );

  // Pelanggan yang sedang dalam proses pembelian motor
  const bikePurchasers = customers.filter((c) => !!c.purchaseStatus);

  // Hantar WhatsApp Alert Servis
  const handleSendMaintenanceWhatsApp = (customer: CustomerRecord, bike: any, reason: string) => {
    const text = encodeURIComponent(
      `Salam sejahtera Tuan ${customer.name}, rekod motosikal ${bike.model} [${bike.plate}] di FFmotor menunjukkan *${reason}*. ` +
        `Demi keselamatan enjin dan jaminan kelancaran tunggangan harian, jemput singgah ke FFmotor Mergong minggu ini. ` +
        `Gunakan kod *SERVIS-JIMAT10* untuk diskaun upah RM10. Lokasi: https://maps.google.com/?q=FFmotor+Mergong`
    );
    window.open(`https://wa.me/${customer.phone}?text=${text}`, "_blank");
    setSentAlertId(customer.id);
  };

  // Hantar WhatsApp Alert Pembelian Motor
  const handleSendPurchaseMilestoneWhatsApp = (customer: CustomerRecord) => {
    if (!customer.purchaseStatus) return;
    const ps = customer.purchaseStatus;

    let messageBody = "";
    if (ps.milestone === "loan_submitted") {
      messageBody = `Dokumen permohonan pinjaman ${ps.bikeModel} anda telah rasmi diserahkan kepada pihak ${ps.financier}. Kami akan maklumkan sebaik sahaja keputusan keluar dalam tempoh 24-48 jam.`;
    } else if (ps.milestone === "loan_approved") {
      messageBody = `BERITA GEMBIRA! Permohonan pinjaman ${ps.bikeModel} anda telah *LULUS* oleh ${ps.financier}. Sila hadir ke showroom FFmotor untuk tandatangan perjanjian sewa beli & pemilihan nombor plat.`;
    } else if (ps.milestone === "jpj_registered") {
      messageBody = `Pendaftaran nombor plat JPJ motosikal ${ps.bikeModel} anda telah *SIAP DIDAFTARKAN*: [${ps.assignedPlate}]. Cukai jalan & insurans sedang dicetak.`;
    } else if (ps.milestone === "ready_delivery") {
      messageBody = `Motosikal ${ps.bikeModel} [${ps.assignedPlate}] anda telah siap dipasang bateri, PDI checklist, dicuci berkilat dan *SEDIA UNTUK DIAMBIL DI SHOWROOM*! Sila bawa MyKad asal semasa serahan kunci.`;
    } else {
      messageBody = `Terima kasih atas tempahan deposit bagi ${ps.bikeModel}. Jurujual kami sedang menyemak dokumen anda.`;
    }

    const text = encodeURIComponent(
      `Salam Tuan ${customer.name}! 🏍️✨\n\nKemaskini Rasmi Pembelian Motosikal FFmotor:\n${messageBody}\n\nSebarang pertanyaan boleh balas mesej ini terus. Terima kasih memilih FFmotor!`
    );
    window.open(`https://wa.me/${customer.phone}?text=${text}`, "_blank");
    setSentAlertId(customer.id);
  };

  // Teks Kempen Blast
  const campaignTemplate = `Salam mesra dari FFmotor Motorsport! 🏍️💨

Peluang servis jimat & naiktaraf motosikal sempena Musim Gaji:
🔥 Pakej Servis CVT Lengkap (Roller OEM + Mangkuk Cuci + Belting Bando): Jimat RM35!
🔥 Minyak Yamalube 4T / Motul Semi-Synthetic: PERCUMA Penukaran Palam Pencucuh Iridium!
🔥 Skim Tukar Motor Lama ke NVX 155 / Vario 160: Rebat Tunai Segera RM300!

Gunakan Kod Baucar: *FF-GAJI-2026*
Katalog & Semakan Ansuran Pinjaman:
👉 ${typeof window !== "undefined" ? window.location.origin : "https://fpmotor.pages.dev"}/katalog

FFmotor (Pengedar Sah 3S) • No 14, Jalan Industri 3, Mergong, Alor Setar Kedah.`;

  const copyCampaign = () => {
    navigator.clipboard.writeText(campaignTemplate);
    setCopiedBlast(true);
    setTimeout(() => setCopiedBlast(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header Hub CRM */}
      <div className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-none flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-black shadow-md">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-black px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-300">
                PANGKALAN DATA & RETENSI PELANGGAN (CRM)
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                ● {customers.length} Rekod Aktif
              </span>
            </div>
            <h2 className="text-xl font-black text-zinc-900 mt-0.5">Pusat Hubungan, Servis Recall & Kempen Pelanggan</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Pusat kawalan retensi pelanggan: amaran recall servis automatik, direktori dossier pelanggan, status pinjaman showroom, dan hebahan kempen WhatsApp.
            </p>
          </div>
        </div>

        {/* Ringkasan Statistik Pantas */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-zinc-50 px-3.5 py-2 rounded-2xl border border-zinc-200">
            <span className="text-zinc-500 block text-[10px]">RECALL SEGERA</span>
            <span className="text-red-700 font-bold text-sm">{overdueMaintenanceCustomers.length} Unit</span>
          </div>
          <div className="bg-zinc-50 px-3.5 py-2 rounded-2xl border border-zinc-200">
            <span className="text-zinc-500 block text-[10px]">PEMBELIAN MOTOR</span>
            <span className="text-zinc-700 font-bold text-sm">{bikePurchasers.length} Unit</span>
          </div>
          <div className="bg-zinc-50 px-3.5 py-2 rounded-2xl border border-zinc-200">
            <span className="text-zinc-500 block text-[10px]">JUMLAH DOSSIER</span>
            <span className="text-zinc-700 font-bold text-sm">{customers.length} Orang</span>
          </div>
        </div>
      </div>

      {/* SEKSYEN 1: RADAR RECALL MAINTENANCE (ALERT PENYELENGGARAAN SEGERA) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>1. Radar Recall Servis & Penyelenggaraan Lewat ({overdueMaintenanceCustomers.length})</span>
          </h3>
          <span className="text-xs text-zinc-500 font-mono">Auto-Alert Melepasi 3,000 KM / 90 Hari</span>
        </div>
          <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-black text-red-600">Enjin Pengesanan Servis Lewat Automatik</h4>
              <p className="text-zinc-600 mt-0.5">
                Sistem mengimbas motosikal yang melepasi perbatuan 3,000 km atau 90 hari tanpa penukaran minyak hitam/CVT.
                Tekan <strong>"Tembak WhatsApp Alert"</strong> untuk menjana mesej rasmi peringatan berserta baucar diskaun.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overdueMaintenanceCustomers.map((cust) => {
              const overdueBike = cust.bikes.find((b) => b.oilDueDays > 90 || b.cvtDueKm >= 10000);
              if (!overdueBike) return null;

              const isOilOverdue = overdueBike.oilDueDays > 90;
              const isCvtOverdue = overdueBike.cvtDueKm >= 10000;

              return (
                <div
                  key={cust.id}
                  className="bg-white border border-zinc-200 p-5 rounded-3xl shadow-lg flex flex-col justify-between space-y-4 hover:border-red-600/50 transition"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-zinc-900 text-base">{cust.name}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-50 text-red-700 font-bold border border-red-200">
                            LEWAT SERVIS
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">
                          📞 {cust.phone} • IC: {cust.ic}
                        </p>
                      </div>

                      <span className="text-xs font-mono font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-xl border border-red-200">
                        {overdueBike.plate}
                      </span>
                    </div>

                    {/* Maklumat Motosikal & Isu Servis */}
                    <div className="mt-4 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">Model Motosikal:</span>
                        <span className="font-bold flex items-center gap-1">
                          <Bike className="w-3.5 h-3.5 text-zinc-700" />
                          {overdueBike.model}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">Servis Terakhir:</span>
                        <span className="font-mono text-zinc-600">{overdueBike.lastServiceDate}</span>
                      </div>

                      <div className="pt-2 border-t border-zinc-200/80 flex flex-wrap gap-2">
                        {isOilOverdue && (
                          <span className="px-2 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Minyak Hitam Lewat {overdueBike.oilDueDays} Hari
                          </span>
                        )}
                        {isCvtOverdue && (
                          <span className="px-2 py-1 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold flex items-center gap-1">
                            <Wrench className="w-3 h-3" />
                            CVT Belting {overdueBike.cvtDueKm.toLocaleString()} KM
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Butang Tindakan WhatsApp */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400">
                      Jumlah Belanja: <strong className="text-zinc-600">RM {cust.totalSpend}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handleSendMaintenanceWhatsApp(
                          cust,
                          overdueBike,
                          isOilOverdue ? `minyak hitam telah melepasi ${overdueBike.oilDueDays} hari` : `servis CVT belting telah mencapai ${overdueBike.cvtDueKm} km`
                        )
                      }
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Tembak WhatsApp Alert</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
      </div>

      {/* SEKSYEN 2: PANGKALAN DATA & DIREKTORI PELANGGAN HQ */}
      <div className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-none space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-700" />
              <span>2. Direktori Pangkalan Data Pelanggan 360 HQ</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Dossier lengkap semua pemilik motosikal berdaftar di bengkel & showroom.</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, telefon, IC, atau plat..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-zinc-300"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-500 font-bold">Segmen:</span>
              <select
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 focus:outline-none"
              >
                <option value="all">Semua Pelanggan</option>
                <option value="overdue">Lewat Servis (Recall)</option>
                <option value="bike_buyer">Pembeli Motosikal</option>
                <option value="vip">Pelanggan VIP</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/80 text-zinc-500 font-mono uppercase text-[10px] border-b border-zinc-200">
              <tr>
                <th className="p-3">Pelanggan</th>
                <th className="p-3">No Telefon & IC</th>
                <th className="p-3">Motosikal Berdaftar</th>
                <th className="p-3">Lawatan Terakhir</th>
                <th className="p-3">Nilai Seumur Hidup</th>
                <th className="p-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/60 font-medium">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-100/40 transition">
                  <td className="p-3">
                    <div className="font-bold text-zinc-900">{c.name}</div>
                    <span className="text-[10px] font-mono text-zinc-400">{c.id}</span>
                  </td>
                  <td className="p-3 font-mono text-zinc-600">
                    <div>{c.phone}</div>
                    <div className="text-[10px] text-zinc-400">{c.ic}</div>
                  </td>
                  <td className="p-3">
                    {c.bikes.length > 0 ? (
                      c.bikes.map((b) => (
                        <div key={b.plate} className="text-zinc-700">
                          <strong className="text-red-600">{b.plate}</strong> • {b.model}
                        </div>
                      ))
                    ) : (
                      <span className="text-zinc-400 italic">Tiada pendaftaran servis</span>
                    )}
                  </td>
                  <td className="p-3 text-zinc-600">{c.lastVisit}</td>
                  <td className="p-3 font-mono font-bold text-emerald-400">RM {c.totalSpend.toLocaleString()}</td>
                  <td className="p-3 text-right">
                    <a
                      href={`https://wa.me/${c.phone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-700 hover:text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-300"
                    >
                      <MessageSquare className="w-3 h-3" />
                      WhatsApp
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SEKSYEN 3: STATUS PEMBELIAN MOTOSIKAL (LOAN & MILESTONE TRACKER) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
            <Bike className="w-4 h-4 text-zinc-700" />
            <span>3. Status Pembelian Motosikal & Penjejak Loan Showroom ({bikePurchasers.length})</span>
          </h3>
          <span className="text-xs text-zinc-500 font-mono">Kemajuan 5-Fasa Pinjaman & JPJ</span>
        </div>

        <div className="space-y-3">
          {bikePurchasers.map((cust) => {
            const ps = cust.purchaseStatus!;
            return (
              <div
                key={cust.id}
                className="bg-white border border-zinc-200 p-5 rounded-3xl shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-zinc-300 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h4 className="font-black text-zinc-900 text-base">{cust.name}</h4>
                    <span className="text-xs font-mono font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300">
                      {ps.bikeModel}
                    </span>
                    {ps.assignedPlate && (
                      <span className="text-xs font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        {ps.assignedPlate}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 font-mono">
                    📞 {cust.phone} • IC: {cust.ic} • Pembiaya: <strong className="text-zinc-700">{ps.financier}</strong>
                  </p>

                  {/* Progress Bar 5-Fasa */}
                  <div className="flex items-center gap-1.5 pt-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
                        ps.milestone === "deposit"
                          ? "bg-red-600 text-white font-black border-red-600"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      1. Deposit
                    </span>
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
                        ps.milestone === "loan_submitted"
                          ? "bg-red-600 text-white font-black border-red-600"
                          : ["loan_approved", "jpj_registered", "ready_delivery"].includes(ps.milestone)
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-zinc-50 text-zinc-400 border-zinc-200"
                      }`}
                    >
                      2. Hantar Loan
                    </span>
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
                        ps.milestone === "loan_approved"
                          ? "bg-red-600 text-white font-black border-red-600"
                          : ["jpj_registered", "ready_delivery"].includes(ps.milestone)
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-zinc-50 text-zinc-400 border-zinc-200"
                      }`}
                    >
                      3. Loan Lulus
                    </span>
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
                        ps.milestone === "jpj_registered"
                          ? "bg-red-600 text-white font-black border-red-600"
                          : ps.milestone === "ready_delivery"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-zinc-50 text-zinc-400 border-zinc-200"
                      }`}
                    >
                      4. Nombor Plat JPJ
                    </span>
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
                        ps.milestone === "ready_delivery"
                          ? "bg-zinc-950 text-white font-black border-emerald-400 animate-pulse"
                          : "bg-zinc-50 text-zinc-400 border-zinc-200"
                      }`}
                    >
                      5. Sedia Serah Kunci
                    </span>
                  </div>
                </div>

                {/* Butang WhatsApp Notification */}
                <button
                  type="button"
                  onClick={() => handleSendPurchaseMilestoneWhatsApp(cust)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-black shadow-lg shadow-none transition active:scale-95 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Hantar Update WhatsApp</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* SEKSYEN 4: KEMPEN PROMOSI & WHATSAPP BLAST */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-emerald-400" />
          <span>4. Hab Kempen WhatsApp Broadcast & Baucar Diskaun</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-none space-y-4">
            <div>
              <h4 className="text-sm font-black text-zinc-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-400" />
                Penjana WhatsApp Broadcast & Baucar Promosi
              </h4>
              <p className="text-xs text-zinc-500 mt-0.5">
                Cipta teks promosi yang menarik untuk dikongsi ke WhatsApp Status, Group Rider, atau senarai pelanggan.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 font-mono text-xs text-zinc-600 whitespace-pre-line leading-relaxed">
              {campaignTemplate}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-zinc-500">
                Pautan automatik menghubungkan ke <strong>/katalog</strong>
              </span>

              <button
                type="button"
                onClick={copyCampaign}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-black shadow-lg shadow-emerald-600/20 transition active:scale-95"
              >
                {copiedBlast ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedBlast ? "Telah Disalin!" : "Salin Teks Broadcast"}</span>
              </button>
            </div>
          </div>

          {/* Senarai Baucar Aktif Bengkel */}
          <div className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-none space-y-4">
            <h4 className="text-sm font-black text-zinc-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-600" />
              Baucar Diskaun Rasmi FFmotor
            </h4>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-red-600 text-sm">SERVIS-JIMAT10</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded">
                      Diskaun RM10 Upah
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">Khas untuk pelanggan recall minyak hitam lewat.</p>
                </div>
                <span className="text-xs font-mono text-zinc-500">42x Digunakan</span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-zinc-700 text-sm">CVT-BELTING-20</span>
                    <span className="text-[10px] bg-zinc-100 text-zinc-700 font-bold px-2 py-0.5 rounded">
                      Diskaun RM20 Pakej CVT
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">Khas untuk servis skuter NVX/Vario/NMAX.</p>
                </div>
                <span className="text-xs font-mono text-zinc-500">18x Digunakan</span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-zinc-700 text-sm">REBATE-MOTOR-300</span>
                    <span className="text-[10px] bg-zinc-100 text-zinc-700 font-bold px-2 py-0.5 rounded">
                      Rebat RM300 Motor Baharu
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">Diskaun deposit untuk pembelian motosikal showroom.</p>
                </div>
                <span className="text-xs font-mono text-zinc-500">7x Digunakan</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
