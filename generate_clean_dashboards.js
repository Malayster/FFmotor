const fs = require('fs');

const createDashboard = (roleKey, title, badge, kpis, quickActions, tables) => {
  return `import React, { useState } from 'react';
import { 
  TrendingUp, ShieldCheck, Zap, DollarSign, Wrench, Package, 
  Users, CheckCircle2, Clock, AlertTriangle, ArrowUpRight, 
  Search, FileText, ChevronRight, Activity, Filter, BarChart3, 
  SlidersHorizontal, Check, RefreshCw
} from 'lucide-react';

export const ${roleKey}Dashboard: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('Semua');

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. HEADER COCKPIT */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-600 mb-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>KOKPIT PERANAN PENGURUSAN</span>
            <span className="text-zinc-300">•</span>
            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 uppercase text-[10px]">
              ${badge}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            ${title}
          </h1>
          <p className="text-xs text-zinc-500 mt-1 font-medium">
            Pusat arahan 3S Cawangan Mergong: Pemantauan langsung, kawalan operasi dan aliran kerja.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button 
            type="button"
            onClick={() => window.location.reload()}
            className="p-2.5 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-900 transition flex items-center gap-2 text-xs font-bold cursor-pointer"
            title="Segarkan data sistem"
          >
            <RefreshCw className="w-4 h-4 text-zinc-500" />
            <span className="hidden sm:inline">Segar Semula</span>
          </button>
        </div>
      </div>

      {/* 2. ZON A: METRIK KPI EKSEKUTIF */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${kpis.map((kpi, idx) => `
        <div key={${idx}} className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">${kpi.label}</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs border border-red-100">
              ${kpi.badge}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight font-mono">${kpi.val}</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center font-mono">${kpi.sub}</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-2 font-medium truncate">${kpi.desc}</p>
        </div>
        `).join('')}
      </div>

      {/* 3. ZON B: MODUL TINDAKAN PANTAS OPERASI */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div>
            <h2 className="text-sm font-black text-zinc-900 uppercase tracking-wider font-mono flex items-center gap-2">
              <Zap className="w-4 h-4 text-red-600" />
              Tindakan Pantas & Operasi Utama (Priority Modules)
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">Akses segera ke fungsi utama yang kerap digunakan dalam syif harian.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          ${quickActions.map((act, i) => `
          <button
            key={${i}}
            onClick={() => {
              if (typeof window !== 'undefined') window.location.hash = '${act.hash}';
            }}
            className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-zinc-50 hover:bg-red-50 border border-zinc-200 hover:border-red-300 transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 group-hover:border-red-300 group-hover:bg-red-600 group-hover:text-white text-zinc-700 flex items-center justify-center mb-2.5 transition shadow-2xs">
              ${act.iconHtml}
            </div>
            <span className="text-xs font-black text-zinc-900 group-hover:text-red-600 leading-snug line-clamp-1">${act.title}</span>
            <span className="text-[10px] text-zinc-400 mt-0.5 font-medium">${act.desc}</span>
          </button>
          `).join('')}
        </div>
      </div>

      {/* 4. ZON C: WIDGET DATA & SENARAI OPERASI MASA NYATA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolum Kiri & Tengah: Jadual Terperinci */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-zinc-900 tracking-wider uppercase font-mono">${tables.primaryTitle}</h3>
              <p className="text-xs text-zinc-400 mt-0.5">${tables.primarySubtitle}</p>
            </div>
            <div className="flex items-center gap-1.5">
              {['Semua', 'Aktif', 'Selesai'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={"px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer " + (activeFilter === tab ? "bg-red-600 text-white shadow-xs" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200")}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 text-[10px] font-mono text-zinc-400 uppercase">
                  ${tables.headers.map(h => `<th className="pb-2.5 font-bold">${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700 font-medium">
                ${tables.rows.map((row, rIdx) => `
                <tr key={${rIdx}} className="hover:bg-zinc-50/80 transition-colors">
                  ${row.map((col, cIdx) => `<td className="py-3 ${cIdx === 0 ? 'font-bold text-zinc-900' : ''}">${col}</td>`).join('')}
                </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kolum Kanan: Status Bar & Senarai Peringatan Kritikal */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-zinc-100 pb-3 mb-4">
              <h3 className="text-sm font-black text-zinc-900 tracking-wider uppercase font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                ${tables.secondaryTitle}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Makluman kritikal yang perlukan perhatian segera.</p>
            </div>

            <div className="space-y-3">
              ${tables.secondaryList.map((item, sIdx) => `
              <div key={${sIdx}} className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-start gap-3 hover:border-red-200 transition-colors">
                <div className="w-2 h-2 rounded-full bg-red-600 mt-1.5 shrink-0 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-900 leading-snug">${item.title}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed truncate">${item.desc}</p>
                </div>
                <span className="text-[10px] font-mono font-bold text-zinc-400 shrink-0">${item.time}</span>
              </div>
              `).join('')}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100">
            <div className="p-3 rounded-2xl bg-red-50 border border-red-100 text-xs text-red-700 font-medium flex items-center justify-between">
              <span>Status Sistem Cawangan:</span>
              <span className="font-bold font-mono text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                D1 Live Sync
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
`;
};

// 1. OWNER DASHBOARD DATA
const ownerCode = createDashboard(
  'Owner',
  'Kokpit Pemilik Cawangan (HQ)',
  'Akses Penuh',
  [
    { label: 'Jumlah Masuk Tunai', val: 'RM 8,420.00', sub: '+18.2%', badge: 'RM', desc: 'DuitNow, Tunai & Mesin EDC Hari Ini' },
    { label: 'Untung Kasar Bersih', val: 'RM 3,690.00', sub: '43.8% Margin', badge: '%', desc: 'Upah Kerja + Margin Alat Ganti' },
    { label: 'Servis Berjalan (Lif)', val: '14 Motor', sub: '4 Lif Penuh', badge: 'Pit', desc: 'Purata masa pembaikan: 38 min' },
    { label: 'Permohonan Loan Terkini', val: '6 Unit', sub: '3 Diluluskan', badge: 'Loan', desc: 'Aeon, Chailease & Sewa Beli' }
  ],
  [
    { title: 'Laporan Z-Report', desc: 'Penutupan Syif', hash: 'finance', iconHtml: '<FileText className="w-5 h-5" />' },
    { title: 'Prestasi Foreman', desc: 'Semakan Komisen', hash: 'staff', iconHtml: '<Users className="w-5 h-5" />' },
    { title: 'Inventori Stor', desc: 'Stok Minimum', hash: 'inventory', iconHtml: '<Package className="w-5 h-5" />' },
    { title: 'Peti Masuk WhatsApp', desc: 'Pelanggan 3S', hash: 'inbox', iconHtml: '<Zap className="w-5 h-5" />' },
    { title: 'Showroom & Leads', desc: 'Jualan Motosikal', hash: 'motor-sales', iconHtml: '<TrendingUp className="w-5 h-5" />' },
    { title: 'Tetapan Kedai', desc: 'Sistem Cawangan', hash: 'settings', iconHtml: '<SlidersHorizontal className="w-5 h-5" />' }
  ],
  {
    primaryTitle: 'Lejar Aliran Tunai & Kad Kerja Semasa',
    primarySubtitle: 'Transaksi selesai dari kaunter dan lif yang disahkan sistem',
    headers: ['No. Invois / Kad', 'Pelanggan & Motosikal', 'Jenis Servis', 'Mekanik Bertugas', 'Jumlah (RM)', 'Status'],
    rows: [
      ['INV-2026-0891', 'Kamal Affendi (WYY 1234)', 'Top Overhaul + Belting NVX', 'Abang Din (Bay 1)', 'RM 420.00', '<span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold font-mono text-[10px]">Selesai</span>'],
      ['INV-2026-0892', 'Siti Aminah (PLA 8899)', 'Servis Minyak + Tayar Belakang Corsa', 'Afif (Bay 2)', 'RM 145.00', '<span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold font-mono text-[10px]">Selesai</span>'],
      ['WO-2026-0412', 'Mohd Farhan (VDF 4321)', 'Tukar Disc Rotor & Master Pump RS-X', 'Din (Bay 1)', 'RM 280.00', '<span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-bold font-mono text-[10px]">Sedang Kerja</span>'],
      ['WO-2026-0413', 'Jason Tan (KDA 6543)', 'Wiring & Gantian Bateri Kering Yuasa', 'Rizal (Bay 4)', 'RM 95.00', '<span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold font-mono text-[10px]">Tunggu Barang</span>']
    ],
    secondaryTitle: 'Tindakan Kelulusan Pengurus (Exceptions)',
    secondaryList: [
      { title: 'Kelulusan Diskaun 12% (> Had SA)', desc: 'Pelanggan VIP En. Azlan minta potongan harga tayar', time: '10 min' },
      { title: 'Pesanan Stok PO Melebihi RM1,500', desc: 'Auto-draft bekalan 50 botol Yamalube 4T ke HLYM', time: '25 min' },
      { title: 'Selisih Kiraan Laci Kasir (RM15.00)', desc: 'Penutupan syif pagi Kerani 1 menunjukkan varians', time: '1 jam' }
    ]
  }
);
fs.writeFileSync('apps/web/src/pages/dashboards/OwnerDashboard.tsx', ownerCode);

// 2. KERANI 1 (KAUNTER & SA)
const kerani1Code = createDashboard(
  'Kerani1',
  'Pusat Kaunter Pendaftaran & Juruwang POS (SA)',
  'Kaunter Depan',
  [
    { label: 'Pendaftaran Masuk Hari Ini', val: '28 Motor', sub: '+6 Dari Sasaran', badge: 'Reg', desc: '18 Servis Biasa, 10 Baik Pulih' },
    { label: 'Kutipan Tunai Kaunter POS', val: 'RM 4,890.00', sub: 'Sedia Tutup Syif', badge: 'POS', desc: 'Tunai: RM2,100 | DuitNow: RM2,790' },
    { label: 'Menunggu Pengambilan', val: '5 Motor', sub: 'Siap & Uji Pandu', badge: 'Ready', desc: 'WhatsApp notifikasi siap telah dihantar' },
    { label: 'Baki Duit Apungan Laci', val: 'RM 200.00', sub: 'Tepat & Seimbang', badge: 'Petty', desc: 'Tiada pengeluaran luar jangka' }
  ],
  [
    { title: 'Daftar Masuk Kilat', desc: '30s Express Intake', hash: 'express-intake', iconHtml: '<Zap className="w-5 h-5" />' },
    { title: 'Kasir POS Bayaran', desc: 'Kutipan & Resit 80mm', hash: 'pos-checkout', iconHtml: '<DollarSign className="w-5 h-5" />' },
    { title: 'Semakan Kad Kerja', desc: 'Status Servis Motor', hash: 'work-orders', iconHtml: '<Wrench className="w-5 h-5" />' },
    { title: 'Pangkalan Pelanggan', desc: 'Sejarah & Rekod Servis', hash: 'customers', iconHtml: '<Users className="w-5 h-5" />' },
    { title: 'Sebut Harga Rasmi', desc: 'Quotation Cetak PDF', hash: 'quotations', iconHtml: '<FileText className="w-5 h-5" />' },
    { title: 'Peti Masuk WhatsApp', desc: 'Notifikasi Siap Ambil', hash: 'inbox', iconHtml: '<Activity className="w-5 h-5" />' }
  ],
  {
    primaryTitle: 'Barisan Giliran Kaunter & Status Motor Siap',
    primarySubtitle: 'Pantau motosikal yang sedia untuk diserahkan dan dikutip bayaran',
    headers: ['No. Tag Kunci', 'No. Plat & Model', 'Pemilik', 'Masa Daftar', 'Status Bil', 'Tindakan Kaunter'],
    rows: [
      ['TAG-01', 'WYY 1234 (Yamaha NVX)', 'En. Kamal (012-3456789)', '09:15 AM', 'RM 420.00 (Belum Bayar)', '<span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-bold font-mono text-[10px]">Panggil Ambil</span>'],
      ['TAG-02', 'PLA 8899 (Honda RS-X)', 'Pn. Aminah (019-8765432)', '09:40 AM', 'RM 145.00 (Lunas DuitNow)', '<span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold font-mono text-[10px]">Serah Kunci</span>'],
      ['TAG-03', 'VDF 4321 (Yamaha Y15ZR)', 'Farhan (017-1122334)', '10:10 AM', 'RM 280.00 (Dalam Pit)', '<span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-bold font-mono text-[10px]">Sedang Dibaiki</span>'],
      ['TAG-04', 'KDA 6543 (Honda Vario 160)', 'Jason Tan (016-9988776)', '10:35 AM', 'Tunggu VO Pelanggan', '<span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold font-mono text-[10px]">Hantar WhatsApp</span>']
    ],
    secondaryTitle: 'Peringatan Pentadbiran Kaunter',
    secondaryList: [
      { title: 'Cetak Pelekat Servis Seterusnya (+3,000km)', desc: 'Untuk 4 motor yang baru siap di Pit Lif 1 dan 2', time: '5 min' },
      { title: 'Amaran Pelanggan Blacklist / Hutang Lapuk', desc: 'En. Roslan (Motor WPP 9901) ada baki RM80 tertunggak', time: '15 min' },
      { title: 'Serahan Percuma Helmet & Baju Hujan', desc: 'Tuntutan pembeli motosikal showroom Zack', time: '40 min' }
    ]
  }
);
fs.writeFileSync('apps/web/src/pages/dashboards/Kerani1Dashboard.tsx', kerani1Code);

// 3. KERANI 2 (STOR & INVENTORI)
const kerani2Code = createDashboard(
  'Kerani2',
  'Pusat Kawalan Inventori & Logistik Stor (Kerani 2)',
  'Stor & Logistik',
  [
    { label: 'Jumlah Nilai Stok Rak', val: 'RM 54,200.00', sub: '920 SKU Aktif', badge: 'Stok', desc: 'Alat Ganti Asli (OEM) & Pasaran' },
    { label: 'Item Bawah Paras Minimum', val: '12 SKU', sub: 'Kritikal Restock', badge: 'Alert', desc: 'Minyak 4T, Minyak Brek & Pad' },
    { label: 'Pesanan Pembekal (PO) Aktif', val: '4 Pesanan', sub: '2 Menunggu Tiba', badge: 'PO', desc: 'Yamaha HLYM & Boon Siew Honda' },
    { label: 'Pakej Kurier Sedia Pos', val: '18 Parcel', sub: 'Cetak Airway Bill', badge: 'J&T', desc: 'Jualan E-Commerce TikTok & Web' }
  ],
  [
    { title: 'Inventori Alat Ganti', desc: 'Carian Kod Rak & Bin', hash: 'inventory', iconHtml: '<Package className="w-5 h-5" />' },
    { title: 'Pesanan Pembekal (PO)', desc: 'Jana PO & Terima Stok', hash: 'suppliers', iconHtml: '<FileText className="w-5 h-5" />' },
    { title: 'Pesanan Kurier (AWB)', desc: 'J&T, Flash & Pos Laju', hash: 'ecommerce-orders', iconHtml: '<Zap className="w-5 h-5" />' },
    { title: 'Semakan Kod Siri', desc: 'Ketulenan Bateri & Tayar', hash: 'authenticity', iconHtml: '<ShieldCheck className="w-5 h-5" />' },
    { title: 'Tuntutan Waranti Rosak', desc: 'Kembalikan Ke Vendor', hash: 'warranty-issues', iconHtml: '<AlertTriangle className="w-5 h-5" />' },
    { title: 'Opname Stok Fizikal', desc: 'Kiraan Hujung Bulan', hash: 'inventory', iconHtml: '<CheckCircle2 className="w-5 h-5" />' }
  ],
  {
    primaryTitle: 'Senarai Alat Ganti Perlu Restock Segera (Bawah MOQ)',
    primarySubtitle: 'Amaran kehabisan bekalan yang digunakan mekanik di lantai bengkel',
    headers: ['Kod SKU', 'Nama Komponen', 'Lokasi Rak / Bin', 'Baki Fizikal', 'Paras Minimum', 'Tindakan Stor'],
    rows: [
      ['YML-4T-AT', 'Yamalube AT 10W-40 (Scooter) 0.8L', 'Rak-A1, Tingkat 2', '3 Botol', '12 Botol', '<span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-bold font-mono text-[10px]">Draft PO Baru</span>'],
      ['BP-RSX-F', 'Nissin Front Brake Pad RS-X 150', 'Rak-B2, Tingkat 1', '1 Set', '6 Set', '<span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-bold font-mono text-[10px]">Panggil Pembekal</span>'],
      ['TYR-CRS-90', 'Corsa Cross S 90/80-17 Tubeless', 'Rak Tayar Belakang', '2 Biji', '8 Biji', '<span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-bold font-mono text-[10px]">Dalam Penghantaran</span>'],
      ['BAT-KOY-5A', 'Koyama Dry Battery YTX5L-BS (Gel)', 'Rak Bateri Rak-C3', '4 Unit', '10 Unit', '<span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold font-mono text-[10px]">Stok Cukup Syif Ini</span>']
    ],
    secondaryTitle: 'Penerimaan Stok & Logistik Masuk',
    secondaryList: [
      { title: 'Barang Tiba dari Hong Leong Yamaha', desc: 'Invois #INV-8829: 20 botol belting & roller CVT', time: '15 min' },
      { title: 'Pemulangan Bateri Rosak (RTV)', desc: '1 unit bateri Yuasa bocor perlu dihantar balik', time: '45 min' },
      { title: 'Audit Selisih Stok Minyak Hitam', desc: 'Perbezaan 1 botol antara sistem dan rak stor', time: '2 jam' }
    ]
  }
);
fs.writeFileSync('apps/web/src/pages/dashboards/Kerani2Dashboard.tsx', kerani2Code);

// 4. FOREMAN (MEKANIK PIT LIF)
const foremanCode = createDashboard(
  'Foreman',
  'Papan Kawalan Operasi Lantai Bengkel & Pit Lif (Foreman)',
  'Lantai Pit Lif',
  [
    { label: 'Lif Beroperasi', val: '4 / 4 Bay', sub: '100% Kapasiti', badge: 'Bay', desc: 'Semua lif servis sedang membaiki motor' },
    { label: 'Motor Siap & Turun Lif', val: '12 Unit', sub: 'Kadar Kecekapan 94%', badge: 'Done', desc: 'Sasaran harian: 18 unit' },
    { label: 'Purata Tempoh Membaiki', val: '32 Min', sub: 'Standard Pantas', badge: 'Time', desc: 'Masa henti alat ganti: 4 min' },
    { label: 'Komisen Terkumpul Pit', val: 'RM 285.00', sub: 'Live Payout', badge: 'RM', desc: 'Bahagian upah buruh mekanik hari ini' }
  ],
  [
    { title: 'Papan Pit Lif 4-Bay', desc: 'Status Kerja Masa Nyata', hash: 'pit-live', iconHtml: '<Wrench className="w-5 h-5" />' },
    { title: 'Tugasan Kad Kerja', desc: 'Senarai Motor Masuk Lif', hash: 'work-orders', iconHtml: '<FileText className="w-5 h-5" />' },
    { title: 'Tuntutan Waranti Kilang', desc: 'Kerosakan Enjin Baru', hash: 'warranty-issues', iconHtml: '<AlertTriangle className="w-5 h-5" />' },
    { title: 'Semakan Kod Siri', desc: 'Sahkan Ketulenan Barang', hash: 'authenticity', iconHtml: '<ShieldCheck className="w-5 h-5" />' },
    { title: 'Senarai Pandu Uji', desc: 'QC Checklist Sebelum Serah', hash: 'pit-live', iconHtml: '<CheckCircle2 className="w-5 h-5" />' },
    { title: 'Minta Barang Stor', desc: 'Ambil Alat Ganti Dari Rak', hash: 'inventory', iconHtml: '<Package className="w-5 h-5" />' }
  ],
  {
    primaryTitle: 'Status 4-Bay Lif Mekanik Semasa',
    primarySubtitle: 'Pantau motosikal yang sedang dinaikkan di atas lif hidraulik',
    headers: ['No. Lif / Bay', 'Mekanik', 'Motosikal & Nombor Plat', 'Skop Pembaikan', 'Masa Mula', 'Status Ujian'],
    rows: [
      ['BAY 1 (Utama)', 'Abang Din (Senior)', 'WYY 1234 (Yamaha NVX)', 'Top Overhaul & Valve Clearance', '09:30 AM', '<span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-bold font-mono text-[10px]">Pasang Enjin</span>'],
      ['BAY 2 (Servis Pantas)', 'Afif (Junior)', 'PLA 8899 (Honda RS-X)', 'Servis Minyak + Belting', '10:15 AM', '<span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold font-mono text-[10px]">Uji Pandu Siap</span>'],
      ['BAY 3 (Tayar & Brek)', 'Farid (Pit 3)', 'VDF 4321 (Yamaha Y15ZR)', 'Tukar Rantai O-Ring & Sprocket', '10:40 AM', '<span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold font-mono text-[10px]">Tunggu Barang Stor</span>'],
      ['BAY 4 (Diagnostik)', 'Rizal (Wiring Specialist)', 'KDA 6543 (Honda Vario 160)', 'Kerosakan Kod FI Error 12', '11:00 AM', '<span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 font-bold font-mono text-[10px]">Imbas ECU Obd2</span>']
    ],
    secondaryTitle: 'Peringatan Keselamatan & QC Foreman',
    secondaryList: [
      { title: 'AMARAN MERAH: Brek Belakang Haus Besi', desc: 'Motor NVX Bay 1: Hubungi kerani untuk maklumkan pelanggan', time: '10 min' },
      { title: 'Semakan Ujian Tekanan Angin Tayar', desc: 'Pastikan 29 PSI depan dan 33 PSI belakang sebelum serah', time: '20 min' },
      { title: 'SOP Tork Skru Angkup Brek (28 Nm)', desc: 'Gunakan spanar tork khas bengkel untuk keselamatan', time: '1 jam' }
    ]
  }
);
fs.writeFileSync('apps/web/src/pages/dashboards/ForemanDashboard.tsx', foremanCode);

// 5. AFFILIATE (SHOWROOM & SALES)
const affiliateCode = createDashboard(
  'Affiliate',
  'Pusat Jualan Motosikal, Showroom & Saluran Ejen Afiliasi',
  'Jualan & Showroom',
  [
    { label: 'Unit Motor Terjual Bulan Ini', val: '14 Unit', sub: 'Sasaran: 20 Unit', badge: 'Sale', desc: '8 Yamaha, 5 Honda, 1 Modenas' },
    { label: 'Permohonan Loan Aktif', val: '9 Pelanggan', sub: '5 Lulus Dokumen', badge: 'Loan', desc: 'Aeon Credit, Chailease & Kedai' },
    { label: 'Komisen Jualan Terkumpul', val: 'RM 4,250.00', sub: 'RM350 / Unit Siap', badge: 'RM', desc: 'Insentif jualan & pembiayaan' },
    { label: 'Prospek & Leads Baru', val: '34 Prospek', sub: 'WhatsApp & Showroom', badge: 'Lead', desc: 'Tawaran promosi gaji bersih rendah' }
  ],
  [
    { title: 'Showroom Motosikal', desc: 'Stok Terkini & Varian', hash: 'motor-sales', iconHtml: '<TrendingUp className="w-5 h-5" />' },
    { title: 'Saluran Permohonan Loan', desc: 'Semakan Status Kredit', hash: 'loan-pipeline', iconHtml: '<FileText className="w-5 h-5" />' },
    { title: 'Senarai Prospek (Leads)', desc: 'Susulan & WhatsApp CRM', hash: 'leads', iconHtml: '<Users className="w-5 h-5" />' },
    { title: 'Kunci & Sewa Beli', desc: 'Serahan Kunci Berperingkat', hash: 'bike-locks', iconHtml: '<ShieldCheck className="w-5 h-5" />' },
    { title: 'Program Ejen Rujukan', desc: 'Kongsi Link Komisen', hash: 'affiliate', iconHtml: '<Zap className="w-5 h-5" />' },
    { title: 'Katalog Awam', desc: 'Paparan Pelanggan', hash: 'katalog', iconHtml: '<Package className="w-5 h-5" />' }
  ],
  {
    primaryTitle: 'Corong Status Jualan & Kelulusan Pinjaman Pelanggan',
    primarySubtitle: 'Jejak perkembangan permohonan pinjaman motosikal hingga penyerahan kunci',
    headers: ['Nama Pelanggan', 'Model Motosikal', 'Institusi Pembiaya', 'Urusan Deposit', 'Status JPJ / Geran', 'Status Terkini'],
    rows: [
      ['Amirul Mukminin', 'Yamaha Y15ZR V2 (Cyan)', 'Aeon Credit Service', 'RM 500 (Telah Bayar)', 'Plat VDF 9901 Siap', '<span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold font-mono text-[10px]">Sedia Serah Kunci</span>'],
      ['Nur Hidayah', 'Honda Vario 160 (Matte Blue)', 'Chailease Berjaya Credit', 'RM 300 (Telah Bayar)', 'Tunggu Nombor V-Bid JPJ', '<span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold font-mono text-[10px]">Daftar MySikap</span>'],
      ['Chong Wei Lun', 'Yamaha NVX 155 ABS', 'Parkson Credit Sdn Bhd', 'Tunggu Slip Gaji', 'Belum Daftar', '<span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-bold font-mono text-[10px]">Kaji Kelayakan</span>'],
      ['Suresh Kumar', 'Honda RS-X 150 (Trico)', 'Pinjaman Kedai FFmotor', 'RM 1,200 (Deposit)', 'Tandatangan Perjanjian', '<span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 font-bold font-mono text-[10px]">Sedia Akad HP</span>']
    ],
    secondaryTitle: 'Peringatan Jualan & Showroom',
    secondaryList: [
      { title: 'Tawaran Promosi Deposit RM0 Yamaha NVX', desc: 'Tinggal 2 unit sahaja stok warna perak di showroom', time: '15 min' },
      { title: 'Semakan Saman MySikap Motosikal Trade-In', desc: 'Pelanggan En. Zainal mahu tukar beli Yamaha Lagenda lama', time: '1 jam' },
      { title: 'Pelanggan Minta Jadual Ansuran Chailease 3 Tahun', desc: 'Hantar PDF sebut harga ansuran bulanan RM235 ke WhatsApp', time: '2 jam' }
    ]
  }
);
fs.writeFileSync('apps/web/src/pages/dashboards/AffiliateDashboard.tsx', affiliateCode);

console.log('Semua 5 dashboard profesional bertema cerah berjaya dijana!');

