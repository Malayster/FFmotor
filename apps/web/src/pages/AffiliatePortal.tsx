import React, { useEffect, useState } from "react";
import {
  Users,
  Share2,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  Bike,
  ShoppingCart,
  Copy,
  ExternalLink,
  Award,
  Sparkles,
  Phone
} from "lucide-react";

interface CommissionRecord {
  id: string;
  date: string;
  customerName: string;
  itemSold: string;
  commissionAmount: number;
  status: "paid" | "pending";
}

interface AffiliatePortalProps {
  onBackToApp?: () => void;
}

export const AffiliatePortal: React.FC<AffiliatePortalProps> = ({ onBackToApp }) => {
  const [note, setNote] = useState("Memuat ejen dari rekod staf...");
  useEffect(() => {
    fetch("/api/staff").then((r) => r.json()).then((d) => {
      const rows = d.staff || d.users || [];
      const agents = Array.isArray(rows) ? rows.filter((u: { role?: string }) => String(u.role).includes("affiliate")) : [];
      setNote(agents.length ? `${agents.length} ejen dalam rekod staf.` : "Tiada ejen berdaftar. Tambah di Akaun Staf.");
    }).catch(() => setNote("Rekod ejen tidak dapat dibaca."));
  }, []);

  const [ejenCode, setEjenCode] = useState("EJEN-DANIAL");
  const [copiedLink, setCopiedLink] = useState(false);

  const affiliateLink = typeof window !== "undefined"
    ? `${window.location.origin}/katalog?ref=${ejenCode}`
    : `https://fpmotor.pages.dev/katalog?ref=${ejenCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const [commissionRecords] = useState<CommissionRecord[]>([
    {
      id: "COM-801",
      date: "19 Sep 2026",
      customerName: "Mohd Azlan",
      itemSold: "Yamaha NVX 155 V2 (Loan Lulus)",
      commissionAmount: 150.0,
      status: "paid",
    },
    {
      id: "COM-802",
      date: "20 Sep 2026",
      customerName: "Khairul Azman",
      itemSold: "Pakej Servis CVT + Belting OEM",
      commissionAmount: 15.0,
      status: "paid",
    },
    {
      id: "COM-803",
      date: "21 Sep 2026",
      customerName: "Razif Hakim",
      itemSold: "Yamaha Y15ZR V2 (Deposit Sedia)",
      commissionAmount: 150.0,
      status: "pending",
    },
    {
      id: "COM-804",
      date: "21 Sep 2026",
      customerName: "Faizal",
      itemSold: "Kombo Tayar Maxxis Volans Sepasang",
      commissionAmount: 15.0,
      status: "pending",
    },
  ]);

  const totalEarned = commissionRecords.reduce((sum, r) => sum + r.commissionAmount, 0);
  const totalPaid = commissionRecords
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + r.commissionAmount, 0);
  const totalPending = commissionRecords
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + r.commissionAmount, 0);

  // Senarai kad visual promosi yang ejen boleh share
  const shareCampaigns = [
    {
      id: "CMP-NVX",
      title: "Yamaha NVX 155 V2 ABS",
      type: "Motosikal",
      payout: "RM 150.00 / unit",
      tagline: "Deposit serendah RM300, bulanan serendah RM245.",
      shareText: `Geng! Siapa nak angkat Yamaha NVX 155 V2 baru dengan deposit serendah RM300, tengok gambar penuh & kira bulanan kat sini: ${affiliateLink}`,
    },
    {
      id: "CMP-Y15",
      title: "Yamaha Y15ZR V2 King",
      type: "Motosikal",
      payout: "RM 150.00 / unit",
      tagline: "Deposit serendah RM200, stok bersedia di kedai.",
      shareText: `Jentera kegemaran ramai Yamaha Y15ZR V2 baru siap atas jalan. Tekan link ni booking segera: ${affiliateLink}`,
    },
    {
      id: "CMP-CVT",
      title: "Pakej Servis CVT + Belting OEM",
      type: "Servis & Part",
      payout: "RM 15.00 / pakej",
      tagline: "Hapuskan getaran awal pagi scooter. Jimat RM50.",
      shareText: `Motor skuter kau gegar pagi-pagi? FFmotor ada promo Servis CVT siap Belting original cuma RM145. Booking kat sini: ${affiliateLink}`,
    },
    {
      id: "CMP-MATGAT",
      title: "Matgat Carbon NVX + Cover Lampu Smoke",
      type: "Aksesori Bergaya",
      payout: "RM 10.00 / unit",
      tagline: "Matgat depan berkilat tahan calar batu jalan.",
      shareText: `Smart gila matgat carbon NVX ni! Pasang siap kat bengkel FFmotor. Tengok gambar kat link ni: ${affiliateLink}`,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-red-600 selection:text-white">
      {/* Header Portal Ejen */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-100 border border-zinc-300 text-zinc-700 flex items-center justify-center font-black">
            <Users className="w-5 h-5 text-zinc-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-black px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-300">
                PORTAL EJEN AFFILIATE (/ejen)
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                ● Rakan Niaga Aktif
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-zinc-900">FFmotor Affiliate & Partner Hub</h1>
          </div>
        </div>

        {onBackToApp && (
          <button
            type="button"
            onClick={onBackToApp}
            className="text-xs text-zinc-500 hover:text-red-600 px-3 py-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-100 transition"
          >
            Kembali ke Hab
          </button>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <p className="text-xs font-bold text-zinc-700 bg-white border border-zinc-200 rounded-xl px-3 py-2">{note}</p>
        {/* Banner Profil & Kotak Salin Link Peribadi */}
        <div className="bg-white border-2 border-zinc-300 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 text-black">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-red-600" />
              <span className="text-xs font-mono font-bold text-red-600">Tahap Ejen: Emas (Gold Partner)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-black">
              Kongsi Gambar Motosikal & Alat Ganti, Jana Komisen Tunai
            </h2>
            <p className="text-xs text-zinc-600 max-w-xl">
              Salin pautan unik anda di bawah dan kongsikan ke kumpulan WhatsApp, Facebook atau TikTok. Setiap jualan motor atau pakej alat ganti yang terhasil akan direkodkan komisen secara automatik.
            </p>
          </div>

          {/* Kotak Salin Pautan */}
          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-300 w-full md:w-auto shrink-0 space-y-2">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block font-mono">
              Pautan Rujukan Rasmi Anda:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={affiliateLink}
                className="bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-red-600 font-mono w-64 focus:outline-none"
              />
              <button
                type="button"
                onClick={copyToClipboard}
                className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-none"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedLink ? "Disalin!" : "Salin Link"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Kad Ringkasan Komisen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-zinc-200 p-5 rounded-3xl shadow-none">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Jumlah Komisen Terkumpul</span>
            <span className="text-2xl font-black text-zinc-900 font-mono mt-1 block">
              RM {totalEarned.toFixed(2)}
            </span>
            <span className="text-[10px] text-zinc-700">Daripada {commissionRecords.length} transaksi</span>
          </div>

          <div className="bg-white border border-zinc-200 p-5 rounded-3xl shadow-none">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Menunggu Bayaran (Pending)</span>
            <span className="text-2xl font-black text-red-600 font-mono mt-1 block">
              RM {totalPending.toFixed(2)}
            </span>
            <span className="text-[10px] text-red-600">Akan dibayar pada hari Jumaat</span>
          </div>

          <div className="bg-white border border-zinc-200 p-5 rounded-3xl shadow-none">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Telah Dibayar (Payout)</span>
            <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
              RM {totalPaid.toFixed(2)}
            </span>
            <span className="text-[10px] text-emerald-400/80">Dipindahkan terus ke bank anda</span>
          </div>
        </div>

        {/* Bahagian 1: Kad Kempen Visual Untuk Dikongsi */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
            <div>
              <h3 className="text-base font-black text-zinc-900">Bahan Promosi Visual Untuk Dikongsi</h3>
              <p className="text-xs text-zinc-500">Tekan 'Kongsi ke WhatsApp' untuk terus sebarkan kepada rakan atau kelab motor anda.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shareCampaigns.map((camp) => (
              <div
                key={camp.id}
                className="bg-white border border-zinc-200 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-none hover:border-zinc-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                      {camp.type}
                    </span>
                    <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-50 px-2 py-0.5 rounded">
                      Komisen: {camp.payout}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-zinc-900">{camp.title}</h4>
                  <p className="text-xs text-zinc-600 mt-1">{camp.tagline}</p>
                </div>

                <div className="pt-3 border-t border-zinc-200 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      window.open(`https://wa.me/?text=${encodeURIComponent(camp.shareText)}`, "_blank");
                    }}
                    className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Kongsi ke WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="bg-white hover:bg-zinc-100 text-zinc-600 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bahagian 2: Lejar Rekod Transaksi & Komisen Anda */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-none space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
            <h3 className="text-sm font-black text-zinc-900">Lejar Rekod Jualan Di Bawah Link Anda</h3>
            <span className="text-[10px] text-zinc-500 font-mono">Kemas kini automatik</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-[10px] uppercase font-mono text-zinc-500">
                  <th className="pb-2">Tarikh</th>
                  <th className="pb-2">Nama Pembeli</th>
                  <th className="pb-2">Barang / Motor Terjual</th>
                  <th className="pb-2 text-right">Komisen</th>
                  <th className="pb-2 text-center">Status Bayaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/80">
                {commissionRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-zinc-50/40">
                    <td className="py-3 font-mono text-zinc-500">{rec.date}</td>
                    <td className="py-3 font-bold text-zinc-900">{rec.customerName}</td>
                    <td className="py-3 text-zinc-600">{rec.itemSold}</td>
                    <td className="py-3 text-right font-mono font-black text-emerald-400">
                      RM {rec.commissionAmount.toFixed(2)}
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full font-mono ${
                          rec.status === "paid"
                            ? "bg-emerald-50 text-emerald-400"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {rec.status === "paid" ? "Telah Dibayar" : "Menunggu Payout"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

