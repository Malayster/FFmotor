const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'apps/web/src/pages/dashboards');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const generateDashboard = (name, title, color, modules) => {
  const content = `import React from 'react';
import { 
  BarChart3, Users, Settings, Activity, Clock, FileText, 
  CreditCard, Truck, Package, Shield, PenTool, Calendar,
  Wrench, CheckCircle, AlertCircle, ShoppingCart, Tag,
  PieChart, DollarSign, Wallet, Store, Smartphone, Phone
} from 'lucide-react';

const icons = [
  BarChart3, Users, Settings, Activity, Clock, FileText, 
  CreditCard, Truck, Package, Shield, PenTool, Calendar,
  Wrench, CheckCircle, AlertCircle, ShoppingCart, Tag,
  PieChart, DollarSign, Wallet, Store, Smartphone, Phone
];

export const ${name}Dashboard: React.FC = () => {
  const modules = ${JSON.stringify(modules, null, 4)};

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className="w-2.5 h-2.5 rounded-full bg-${color}-500 shadow-[0_0_8px_rgba(0,0,0,0.5)] shadow-${color}-500/50 animate-pulse" />
             <h1 className="text-2xl font-black text-white">${title}</h1>
          </div>
          <p className="text-slate-400 text-sm">Akses penuh kepada semua modul operasi berpusat peranan anda.</p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-${color}-500/10 text-${color}-400 flex items-center justify-center border border-${color}-500/20 shadow-[0_0_15px_rgba(0,0,0,0.5)] shadow-${color}-500/20">
           <Activity size={32} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {modules.map((mod, i) => {
          const Icon = icons[i % icons.length];
          return (
            <button 
              key={i} 
              className="flex flex-col items-center justify-center text-center bg-slate-900/50 border border-slate-800 hover:border-${color}-500/50 hover:bg-slate-800 p-5 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-${color}-500/10 group h-36 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-${color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 group-hover:bg-${color}-500/20 group-hover:border-${color}-500/40 text-slate-400 group-hover:text-${color}-400 flex items-center justify-center mb-3 transition-colors relative z-10">
                <Icon size={24} strokeWidth={1.5} />
              </div>
              <span className="text-xs font-bold text-slate-300 group-hover:text-white line-clamp-2 leading-snug relative z-10 px-2">
                {mod}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
`;
  fs.writeFileSync(path.join(dir, `${name}Dashboard.tsx`), content);
};

const ownerModules = [
  "Papan Pemuka Eksekutif", "Laporan Kewangan & Z-Report", "Analisis Keuntungan",
  "Penjejak Prestasi Kakitangan", "Kelulusan Harga Bawah Margin", "Pengurusan Gaji & Komisen",
  "Audit Log & Keselamatan", "Tetapan Cukai SST", "Pengurusan Multi-Cawangan",
  "Laporan Inventori Mati", "Pengurusan Pembekal (AP)", "Analisis Kecekapan Lif",
  "Kempen Pemasaran & Promo", "Pengurusan Sistem & Sandaran", "Analisis Pinjaman",
  "Laporan Kehilangan Stok", "Tetapan Kadar Upah Standard", "Akaun VIP / Korporat",
  "Trend Jualan Motosikal", "Maklum Balas & Reputasi", "Pengurusan Peti Besi", "Log Kesilapan Sistem"
];
generateDashboard("Owner", "Dashboard Owner (Tauke HQ)", "amber", ownerModules);

const kerani1Modules = [
  "Pendaftaran Intake & Plat", "Agihan Kad Kerja", "POS / Titik Jualan",
  "Diagnosis 12-Titik Pantas", "Penjadualan Temujanji", "Sekatan Kredit / Blacklist",
  "Kelulusan VO WhatsApp", "Cetakan Resit 80mm", "Duit Apungan (Petty Cash)",
  "Insurans & Roadtax", "Serahan & Gate Pass", "Pelekat Servis Seterusnya",
  "Gateway Panggilan / SMS", "Tuntutan Waranti", "Sejarah Pembaikan",
  "Mod Pendaftaran Luar Talian", "Penutupan Syif Kaunter", "Penyerahan Helmet Percuma",
  "Integrasi Terminal EDC", "Waktu Pengambilan", "Batal Kad Kerja", "Pintasan Papan Kekunci"
];
generateDashboard("Kerani1", "Dashboard Kerani 1 (Kaunter & SA)", "emerald", kerani1Modules);

const kerani2Modules = [
  "Penerimaan Barangan (PO)", "Imbasan Barcode Global", "Pengurusan Rak & Bin",
  "Pengiraan Stok Fizikal", "Pengeluaran ke Lif", "Peringatan Stok Minimum",
  "Penjejakan PO Tertunggak", "Pemulangan Barang (RTV)", "Margin Harga Automatik",
  "Pendaftaran SKU Baru", "Pengasingan OEM vs Aftermarket", "Penjejakan Nombor Siri",
  "Pelupusan Stok Rosak", "Pindahan Stok Cawangan", "Laporan Fast-Moving",
  "Alat Ganti Terpakai", "Cetakan Label Barcode", "Carian Pembekal Alternatif",
  "Pemadanan Invois", "Kekurangan Stok Harian", "Tempahan Khas Pelanggan"
];
generateDashboard("Kerani2", "Dashboard Kerani 2 (Stor & Inventori)", "cyan", kerani2Modules);

const foremanModules = [
  "Senarai Tugasan & Giliran", "Status Lif Masa Nyata", "Permintaan Alat Ganti",
  "Muat Naik Bukti Bergambar", "Amaran Keselamatan Kritikal", "Kemas Kini Fasa Pembaikan",
  "Penjejakan Pemasa Kecekapan", "Semakan Pandu Uji (Test Ride)", "Kalkulator Komisen Langsung",
  "Status Tersangkut Alat Ganti", "Sejarah Servis Motor Semasa", "Manual Servis Digital",
  "Pelaporan Penemuan Tambahan", "Serahan Kerja 1-Klik", "Inventori Alatan Khas",
  "Jadual Rehat (Clock In/Out)", "Semakan QC Ketua Kumpulan", "Nota Teknikal Rahsia",
  "Pemantauan Repair Comeback", "Laporan Prestasi Bulanan", "Butang SOS Kecemasan"
];
generateDashboard("Foreman", "Dashboard Foreman (Mekanik Pit)", "blue", foremanModules);

const affiliateModules = [
  "Penjejak Corong Jualan", "Katalog & Varian Motosikal", "Kalkulator Pinjaman",
  "Borang Pinjaman Digital", "Pemantauan JPJ MySikap", "Penilaian Motor Trade-In",
  "Perjanjian Sewa Beli", "Deposit & Pembatalan", "Papan Pemuka Komisen",
  "Kempen Promosi Semasa", "Cetakan Sebut Harga", "Aliran Serahan Kunci",
  "Laporan Prestasi Jualan", "Pakej Aksesori Tambahan", "Penghantaran ke Rumah",
  "Notifikasi Kelulusan", "CRM & Rekod Susulan", "Kod QR Referral / Afiliasi",
  "Semakan Stok Motor", "Pinjaman In-house Kedai", "Kaji Selidik Kepuasan Pembeli"
];
generateDashboard("Affiliate", "Dashboard Affiliate (Jualan & Showroom)", "purple", affiliateModules);

console.log("Dashboards generated successfully.");

