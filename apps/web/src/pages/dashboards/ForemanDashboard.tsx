import React, { useState } from 'react';
import { ArahanStrip } from '../owner/OwnerDesk';
import { 
  TrendingUp, ShieldCheck, Zap, DollarSign, Wrench, Package, 
  Users, CheckCircle2, Clock, AlertTriangle, ArrowUpRight, 
  Search, FileText, ChevronRight, Activity, Filter, BarChart3, 
  SlidersHorizontal, Check, RefreshCw, Sparkles, CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { InteractiveNumber } from '../../components/ui/InteractiveNumber';
import { tactileAudio } from '../../lib/audio';
import { fireVictoryCelebration } from '../../lib/confetti';
import { toast } from 'sonner';

export const ForemanDashboard: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [boardData, setBoardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchLive = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/owner/board");
      const d = await res.json();
      if (d.success) setBoardData(d);
    } catch {} finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLive();
  }, []);

  const ringkasanPit = boardData?.ringkasanPit || { total: 4, aktif: 4, tungguAlat: 1, siap: 12, selesai: 28 };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <ArahanStrip role="foreman" />

      {/* 1. HEADER COCKPIT FOREMAN - 4 WARNA: HITAM, PUTIH, MERAH, HIJAU MUDA */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-zinc-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-black text-red-600 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span className="tracking-wider uppercase">Kawalan Lantai Bengkel & Pit Lif 4-Bay</span>
            <span className="text-zinc-950 font-bold">•</span>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border-2 border-red-300 uppercase text-[10px] font-black">
              Foreman Bengkel
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
            Pusat Arahan Pit Lif & Operasi Servis Bengkel
          </h1>
          <p className="text-xs sm:text-sm text-zinc-800 mt-1 font-bold">
            Cawangan Mergong: Pemantauan langsung 4-Bay lif, produktiviti mekanik, dan aliran kerja pembaikan masa nyata.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button 
            type="button"
            onClick={() => {
              tactileAudio.buttonClick();
              fetchLive();
              toast.success("Data pit bengkel dikemaskini.");
            }}
            className="px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white transition flex items-center gap-2 text-xs font-black cursor-pointer shadow-sm active:scale-95"
            title="Segarkan data bengkel"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-white ${loading ? 'animate-spin' : ''}`} />
            <span>Segar Semula</span>
          </button>
        </div>
      </div>

      {/* 2. ZON A: METRIK KPI FOREMAN (4 WARNA MUTLAK) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Kad 1: Kapasiti Lif Aktif */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bg-white rounded-2xl p-5 border-2 border-zinc-200 shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-zinc-950 uppercase tracking-wider font-mono">Lif Beroperasi</span>
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-800 border border-red-300 flex items-center justify-center font-black text-xs">
              <Wrench className="w-4 h-4 text-red-800" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-mono">{ringkasanPit.aktif} / 4 Bay</span>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-black font-mono">
              {Math.round((ringkasanPit.aktif / 4) * 100)}% Kapasiti
            </span>
          </div>
          <p className="text-xs text-zinc-900 mt-2 font-bold truncate">Lif sedang aktif menjalankan servis</p>
        </motion.div>
        
        {/* Kad 2: Motor Siap */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bg-white rounded-2xl p-5 border-2 border-zinc-200 shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-zinc-950 uppercase tracking-wider font-mono">Motor Siap Hari Ini</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center font-black text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-800" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-mono">
              <InteractiveNumber value={ringkasanPit.siap} suffix=" Unit" />
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-black font-mono">
              Sedia Diambil
            </span>
          </div>
          <p className="text-xs text-zinc-900 mt-2 font-bold truncate">Lulus QC Ketua Foreman</p>
        </motion.div>
        
        {/* Kad 3: Purata Masa */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bg-white rounded-2xl p-5 border-2 border-zinc-200 shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-zinc-950 uppercase tracking-wider font-mono">Purata Tempoh Baiki</span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-950 border border-zinc-300 flex items-center justify-center font-black text-xs">
              <Clock className="w-4 h-4 text-zinc-950" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-mono">
              <InteractiveNumber value={32} suffix=" Min" />
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-zinc-950 text-white text-[11px] font-black font-mono">
              Standard Pantas
            </span>
          </div>
          <p className="text-xs text-zinc-900 mt-2 font-bold truncate">Masa henti alat ganti: purata 4 min</p>
        </motion.div>
        
        {/* Kad 4: Komisen Pit Foreman */}
        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            tactileAudio.cashRegister();
            fireVictoryCelebration();
            toast.success("Komisen Live Pit Foreman: RM 285.00 telah dikira!");
          }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bg-white rounded-2xl p-5 border-2 border-zinc-200 shadow-sm transition-all cursor-pointer group"
          title="Klik untuk semak komisen mekanik"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-zinc-950 uppercase tracking-wider font-mono">Komisen Terkumpul Pit</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center font-black text-xs">
              <DollarSign className="w-4 h-4 text-emerald-800" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-mono">
              <InteractiveNumber value={285.00} prefix="RM " decimals={2} />
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-black font-mono">
              Live Payout
            </span>
          </div>
          <p className="text-xs text-zinc-900 mt-2 font-bold truncate">Bahagian upah buruh mekanik hari ini</p>
        </motion.div>
        
      </div>

      {/* 3. ZON B: MODUL TINDAKAN PANTAS OPERASI BENGKEL */}
      <div className="bg-white rounded-3xl p-6 border-2 border-zinc-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-3">
          <div>
            <h2 className="text-xs font-black text-zinc-950 uppercase tracking-wider font-mono flex items-center gap-2">
              <Zap className="w-4 h-4 text-red-600" />
              Tindakan Pantas Operasi Bengkel
            </h2>
            <p className="text-xs text-zinc-800 mt-0.5 font-bold">Akses segera ke fungsi utama kawalan lif bengkel dan video servis.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* Butang 0: Pit Lif 4-Bay */}
          <button
            type="button"
            onClick={() => {
              tactileAudio.buttonClick();
              if (typeof window !== 'undefined') window.location.hash = 'pit-live';
            }}
            className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-white hover:bg-zinc-50 border-2 border-zinc-200 hover:border-zinc-950 shadow-sm transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-800 border border-red-300 flex items-center justify-center mb-2.5 transition group-hover:scale-105 shadow-xs">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-zinc-950 group-hover:text-red-600 leading-snug line-clamp-1">Papan Pit Lif 4-Bay</span>
            <span className="text-[10px] text-zinc-800 mt-0.5 font-bold">Status Masa Nyata</span>
          </button>
          
          {/* Butang 1: Kad Kerja */}
          <button
            type="button"
            onClick={() => {
              tactileAudio.buttonClick();
              if (typeof window !== 'undefined') window.location.hash = 'work-orders';
            }}
            className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-white hover:bg-zinc-50 border-2 border-zinc-200 hover:border-zinc-950 shadow-sm transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-950 border border-zinc-300 flex items-center justify-center mb-2.5 transition group-hover:scale-105 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-zinc-950 group-hover:text-red-600 leading-snug line-clamp-1">Tugasan Kad Kerja</span>
            <span className="text-[10px] text-zinc-800 mt-0.5 font-bold">Senarai Motor Masuk</span>
          </button>
          
          {/* Butang 2: Waranti Kilang */}
          <button
            type="button"
            onClick={() => {
              tactileAudio.buttonClick();
              if (typeof window !== 'undefined') window.location.hash = 'warranty-issues';
            }}
            className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-white hover:bg-zinc-50 border-2 border-zinc-200 hover:border-zinc-950 shadow-sm transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-800 border border-red-300 flex items-center justify-center mb-2.5 transition group-hover:scale-105 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-zinc-950 group-hover:text-red-600 leading-snug line-clamp-1">Tuntutan Waranti</span>
            <span className="text-[10px] text-zinc-800 mt-0.5 font-bold">Kerosakan Kilang</span>
          </button>
          
          {/* Butang 3: Komisen Mekanik */}
          <button
            type="button"
            onClick={() => {
              tactileAudio.buttonClick();
              if (typeof window !== 'undefined') window.location.hash = 'staff';
            }}
            className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-white hover:bg-zinc-50 border-2 border-zinc-200 hover:border-zinc-950 shadow-sm transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white border border-zinc-800 flex items-center justify-center mb-2.5 transition group-hover:scale-105 shadow-xs">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-black text-zinc-950 group-hover:text-red-600 leading-snug line-clamp-1">Komisen Mekanik</span>
            <span className="text-[10px] text-zinc-800 mt-0.5 font-bold">Kiraan Upah Harian</span>
          </button>
          
          {/* Butang 4: Mohon Alat Stor */}
          <button
            type="button"
            onClick={() => {
              tactileAudio.buttonClick();
              if (typeof window !== 'undefined') window.location.hash = 'inventory';
            }}
            className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-white hover:bg-zinc-50 border-2 border-zinc-200 hover:border-zinc-950 shadow-sm transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center mb-2.5 transition group-hover:scale-105 shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-zinc-950 group-hover:text-red-600 leading-snug line-clamp-1">Mohon Alat Stor</span>
            <span className="text-[10px] text-zinc-800 mt-0.5 font-bold">Baki Stok & Rak</span>
          </button>
          
          {/* Butang 5: Uji Pandu QC */}
          <button
            type="button"
            onClick={() => {
              tactileAudio.buttonClick();
              if (typeof window !== 'undefined') window.location.hash = 'express-intake';
            }}
            className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-white hover:bg-zinc-50 border-2 border-zinc-200 hover:border-zinc-950 shadow-sm transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-950 border border-zinc-300 flex items-center justify-center mb-2.5 transition group-hover:scale-105 shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-zinc-950 group-hover:text-red-600 leading-snug line-clamp-1">Uji Pandu Keluar</span>
            <span className="text-[10px] text-zinc-800 mt-0.5 font-bold">Pemeriksaan QC</span>
          </button>
        </div>
      </div>

      {/* 4. ZON C: WIDGET DATA & JADUAL TERPERINCI PIT LIF */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolum Kiri & Tengah: Jadual Terperinci Pit Lif */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border-2 border-zinc-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-zinc-100 pb-3">
            <div>
              <h3 className="text-xs font-black text-zinc-950 tracking-wider uppercase font-mono">Status Semasa 4-Bay Lif Bengkel</h3>
              <p className="text-xs text-zinc-800 mt-0.5 font-bold">Pemantauan mekanik dan motosikal di setiap stesen lif</p>
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
              {['Semua', 'Aktif', 'Selesai'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    tactileAudio.buttonClick();
                    setActiveFilter(tab);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                    activeFilter === tab 
                      ? "bg-zinc-950 text-white shadow-xs" 
                      : "text-zinc-800 hover:text-zinc-950"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-zinc-200 text-[10px] font-mono font-black text-zinc-950 uppercase bg-zinc-50">
                  <th className="py-2.5 px-2">Stesen Lif</th>
                  <th className="py-2.5 px-2">Mekanik</th>
                  <th className="py-2.5 px-2">No Plat & Model</th>
                  <th className="py-2.5 px-2">Skop Pembaikan</th>
                  <th className="py-2.5 px-2">Masa Kerja</th>
                  <th className="py-2.5 px-2 text-right">Status Bay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-950 font-bold">
                <tr className="hover:bg-zinc-50 transition-colors">
                  <td className="py-3.5 px-2 font-black text-zinc-950 font-mono">Bay 1 (Heavy)</td>
                  <td className="py-3.5 px-2 text-zinc-950 font-bold">Abang Din (Senior)</td>
                  <td className="py-3.5 px-2 font-black text-zinc-950">WYY 1234 (Yamaha NVX)</td>
                  <td className="py-3.5 px-2 text-zinc-900 font-semibold">Top Overhaul & Waterpump</td>
                  <td className="py-3.5 px-2 text-zinc-900 font-mono font-bold">45 min</td>
                  <td className="py-3.5 px-2 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 font-black font-mono text-[10px]">
                      Tengah Pasang
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50 transition-colors">
                  <td className="py-3.5 px-2 font-black text-zinc-950 font-mono">Bay 2 (Quick)</td>
                  <td className="py-3.5 px-2 text-zinc-950 font-bold">Afif (Junior)</td>
                  <td className="py-3.5 px-2 font-black text-zinc-950">PLA 8899 (Honda RS-X)</td>
                  <td className="py-3.5 px-2 text-zinc-900 font-semibold">Servis Minyak & Tayar Belakang</td>
                  <td className="py-3.5 px-2 text-zinc-900 font-mono font-bold">20 min</td>
                  <td className="py-3.5 px-2 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-black font-mono text-[10px]">
                      Hampir Siap
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50 transition-colors">
                  <td className="py-3.5 px-2 font-black text-zinc-950 font-mono">Bay 3 (Service)</td>
                  <td className="py-3.5 px-2 text-zinc-950 font-bold">Halim</td>
                  <td className="py-3.5 px-2 font-black text-zinc-950">VDF 4321 (Yamaha Y15ZR)</td>
                  <td className="py-3.5 px-2 text-zinc-900 font-semibold">Disc Rotor & Master Pump</td>
                  <td className="py-3.5 px-2 text-zinc-900 font-mono font-bold">15 min</td>
                  <td className="py-3.5 px-2 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-950 border border-zinc-300 font-black font-mono text-[10px]">
                      Baru Masuk
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Kolum Kanan: QC & Peringatan Keselamatan */}
        <div className="bg-white rounded-3xl p-6 border-2 border-zinc-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-zinc-100 pb-3 mb-4">
              <h3 className="text-xs font-black text-zinc-950 tracking-wider uppercase font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                Peringatan Keselamatan & QC Foreman
              </h3>
              <p className="text-xs text-zinc-800 mt-0.5 font-bold">Makluman kritikal sebelum serahan motosikal kepada pelanggan.</p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-red-50 border-2 border-red-200 flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-600 mt-1 shrink-0 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-zinc-950 leading-snug">AMARAN: Brek Belakang Haus Besi</p>
                  <p className="text-[11px] text-zinc-800 mt-0.5 leading-relaxed truncate font-bold">Motor NVX Bay 1: Maklumkan kepada Kerani 1 Kaunter</p>
                </div>
                <span className="text-[10px] font-mono font-black text-zinc-950 shrink-0">10m lalu</span>
              </div>
              
              <div className="p-3.5 rounded-2xl bg-zinc-50 border-2 border-zinc-200 flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-950 mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-zinc-950 leading-snug">Semakan Tekanan Angin Tayar</p>
                  <p className="text-[11px] text-zinc-800 mt-0.5 leading-relaxed truncate font-bold">Pastikan 29 PSI depan dan 33 PSI belakang sebelum serah</p>
                </div>
                <span className="text-[10px] font-mono font-black text-zinc-950 shrink-0">20m lalu</span>
              </div>
              
              <div className="p-3.5 rounded-2xl bg-zinc-50 border-2 border-zinc-200 flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-950 mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-zinc-950 leading-snug">SOP Tork Skru Angkup Brek (28 Nm)</p>
                  <p className="text-[11px] text-zinc-800 mt-0.5 leading-relaxed truncate font-bold">Gunakan spanar tork khas bengkel untuk keselamatan</p>
                </div>
                <span className="text-[10px] font-mono font-black text-zinc-950 shrink-0">1j lalu</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t-2 border-zinc-100">
            <div className="p-3 rounded-2xl bg-zinc-50 border-2 border-zinc-200 text-xs font-bold flex items-center justify-between">
              <span className="text-zinc-800">Status Bengkel:</span>
              <span className="font-black font-mono text-emerald-800 flex items-center gap-1.5 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                Pit Telemetry Aktif
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
