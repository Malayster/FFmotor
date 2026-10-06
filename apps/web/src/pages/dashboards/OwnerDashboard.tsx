import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, ShieldCheck, Zap, DollarSign, Wrench, Package, 
  Users, CheckCircle2, Clock, AlertTriangle, ArrowUpRight, 
  Search, FileText, ChevronRight, Activity, Filter, BarChart3, 
  SlidersHorizontal, Check, RefreshCw, Sparkles, MessageSquare, AlertCircle,
  UserPlus, Lock, Building2, Eye, Bike, Warehouse
} from 'lucide-react';
import { motion } from 'framer-motion';
import { InteractiveNumber } from '../../components/ui/InteractiveNumber';
import { tactileAudio } from '../../lib/audio';
import { fireVictoryCelebration } from '../../lib/confetti';
import { CopyBadge } from '../../components/ui/CopyBadge';
import { toast } from 'sonner';
import { sessionHeader } from '../../lib/api';

export const OwnerDashboard: React.FC = () => {
  const [boardData, setBoardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Semua');

  const fetchBoard = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/owner/board', {
        headers: {
          'Content-Type': 'application/json',
          ...sessionHeader(),
        },
      });
      const d = await res.json();
      if (d.success) {
        setBoardData(d);
      }
    } catch (err) {
      console.error('Ralat memuat data papan pemilik:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, []);

  const wangHari = boardData?.wang?.hariIni ?? 0;
  const untungBersih = boardData?.untung?.bersih ?? 0;
  const ringkasanMotor = boardData?.ringkasanMotor ?? { total: 0, tersedia: 0, ditempah: 0, loanPending: 0, terjual: 0 };
  const ringkasanStok = boardData?.ringkasanStok ?? { totalItem: 0, nilaiStok: 0, bakiSihat: 0, kritikal: 0 };
  const ringkasanPit = boardData?.ringkasanPit ?? { total: 0, aktif: 0, tungguAlat: 0, siap: 0, selesai: 0 };
  const masalahList = boardData?.masalah ?? [];
  const aktivitiList = boardData?.aktiviti ?? [];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* 1. HEADER COCKPIT PEMILIK - 4 WARNA: HITAM, PUTIH, MERAH, HIJAU MUDA */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-zinc-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-black text-red-600 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span className="tracking-wider uppercase">Pusat Semakan Harian Eksekutif (Live Data)</span>
            <span className="text-zinc-950 font-bold">•</span>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border-2 border-red-300 text-[10px] font-black uppercase">
              Pemilik / Owner HQ
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
            Pusat Semakan Operasi, Kewangan & Pengawasan Staf
          </h1>
          <p className="text-xs sm:text-sm text-zinc-800 mt-1 font-bold">
            Cawangan Mergong: Pemilik menyemak status harian kedai, mengawal akaun staf/PIN, dan mengesahkan profil syarikat.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button 
            type="button"
            onClick={() => {
              tactileAudio.buttonClick();
              fetchBoard();
              toast.success("Data papan pemuka dikemaskini dari pangkalan data.");
            }}
            className="px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white transition flex items-center gap-2 text-xs font-black cursor-pointer shadow-sm active:scale-95"
            title="Segarkan data semakan harian"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-white ${loading ? 'animate-spin' : ''}`} />
            <span>Segar Semula</span>
          </button>
        </div>
      </div>

      {/* 2. JALUR STATUS PEMBAHAGIAN TUGAS STAF (OWNER HANYA MENYEMAK) */}
      <div className="bg-white border-2 border-zinc-200 rounded-2xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-zinc-200">
          <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-black text-xs shrink-0">
            K1
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-zinc-950 leading-tight">Kerani 1 Kaunter & SA</p>
            <p className="text-[11px] text-zinc-800 font-bold truncate">Layan pelanggan, POS bayaran & sebut harga</p>
          </div>
          <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black shrink-0">
            Aktif
          </span>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-zinc-200">
          <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-black text-xs shrink-0">
            K2
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-zinc-950 leading-tight">Kerani 2 Stor & Stok</p>
            <p className="text-[11px] text-zinc-800 font-bold truncate">Urus stok rak, PO pembekal & kod siri</p>
          </div>
          <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black shrink-0">
            Aktif
          </span>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-zinc-200">
          <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-black text-xs shrink-0">
            FM
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-zinc-950 leading-tight">Ketua Foreman Bengkel</p>
            <p className="text-[11px] text-zinc-800 font-bold truncate">Urus 4 pit lif, agih kerja mekanik & QC fizikal</p>
          </div>
          <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black shrink-0">
            Aktif
          </span>
        </div>
      </div>

      {/* 3. 4 KAD METRIK UTAMA COCKPIT (DATA LANGSUNG D1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Kad 1: Semakan Masuk Tunai Hari Ini */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bg-white rounded-2xl p-5 border-2 border-zinc-200 shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-zinc-950 uppercase tracking-wider font-mono">1. Tunai Masuk Hari Ini</span>
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-800 border border-red-300 flex items-center justify-center font-black text-xs">
              RM
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-mono">
              <InteractiveNumber value={wangHari} prefix="RM " decimals={2} />
            </span>
          </div>
          <p className="text-xs text-zinc-800 mt-2 font-bold truncate">Jualan Kaunter + Servis Bayar Tunai</p>
        </motion.div>
        
        {/* Kad 2: Semakan Untung Bersih Bulan Ini */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bg-white rounded-2xl p-5 border-2 border-zinc-200 shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-zinc-950 uppercase tracking-wider font-mono">2. Untung Bersih Bulan Ini</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center font-black text-xs">
              %
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-mono">
              <InteractiveNumber value={untungBersih} prefix="RM " decimals={2} />
            </span>
          </div>
          <p className="text-xs text-zinc-800 mt-2 font-bold truncate">Upah Servis + Margin Jualan - Komisen</p>
        </motion.div>
        
        {/* Kad 3: Semakan Operasi Pit Bengkel */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bg-white rounded-2xl p-5 border-2 border-zinc-200 shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-zinc-950 uppercase tracking-wider font-mono">3. Status Pit Bengkel</span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-950 border border-zinc-300 flex items-center justify-center font-black text-xs">
              <Wrench className="w-4 h-4 text-zinc-950" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-mono">
              <InteractiveNumber value={ringkasanPit.aktif} suffix=" Di Pit" />
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-black font-mono">
              {ringkasanPit.siap} Siap
            </span>
          </div>
          <p className="text-xs text-zinc-800 mt-2 font-bold truncate">
            {ringkasanPit.tungguAlat > 0 ? `${ringkasanPit.tungguAlat} unit tunggu alat ganti` : 'Tiada sangkutan alat ganti'}
          </p>
        </motion.div>
        
        {/* Kad 4: Semakan Urusan Pelanggan & Jualan */}
        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            tactileAudio.cashRegister();
            fireVictoryCelebration();
            toast.success("Maklumat tempahan dan permohonan pinjaman semasa.");
          }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bg-white rounded-2xl p-5 border-2 border-zinc-200 shadow-sm transition-all cursor-pointer group"
          title="Status tempahan motosikal dan pinjaman"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-zinc-950 uppercase tracking-wider font-mono">4. Tempahan & Loan</span>
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-800 border border-red-300 flex items-center justify-center font-black text-xs">
              <Users className="w-4 h-4 text-red-800" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-mono">
              <InteractiveNumber value={ringkasanMotor.ditempah} suffix=" Ditempah" />
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-zinc-100 text-zinc-950 border border-zinc-300 text-[11px] font-black font-mono">
              {ringkasanMotor.loanPending} Loan
            </span>
          </div>
          <p className="text-xs text-zinc-800 mt-2 font-bold truncate">Urusan Kerani 1 Kaunter & Ejen Jualan</p>
        </motion.div>
        
      </div>

      {/* 3.1 DUA KAD RINGKASAN INVENTORI PANTAS (MOTOSIKAL SHOWROOM & STOR ALAT GANTI) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Kad A: Inventori Motosikal Showroom */}
        <div className="bg-white rounded-3xl p-6 border-2 border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center">
                <Bike className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-black text-zinc-950 uppercase tracking-wider font-mono">
                  Inventori Motosikal Showroom
                </h3>
                <p className="text-[11px] text-zinc-800 font-bold">Stok motosikal sedia ada, tempahan deposit & rekod jualan</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                tactileAudio.buttonClick();
                if (typeof window !== 'undefined') window.location.hash = 'motor-sales';
              }}
              className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-black flex items-center gap-1 cursor-pointer transition active:scale-95"
            >
              <span>Urus Unit</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-center">
              <span className="text-[10px] font-mono font-black text-zinc-600 uppercase block">Jumlah Unit</span>
              <span className="text-xl font-mono font-black text-zinc-950">{ringkasanMotor.total}</span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[10px] font-mono font-black text-emerald-800 uppercase block">Tersedia</span>
              <span className="text-xl font-mono font-black text-emerald-800">{ringkasanMotor.tersedia}</span>
            </div>
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-center">
              <span className="text-[10px] font-mono font-black text-red-700 uppercase block">Ditempah (48j)</span>
              <span className="text-xl font-mono font-black text-red-700">{ringkasanMotor.ditempah}</span>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-center">
              <span className="text-[10px] font-mono font-black text-zinc-600 uppercase block">Terjual</span>
              <span className="text-xl font-mono font-black text-zinc-950">{ringkasanMotor.terjual}</span>
            </div>
          </div>
        </div>

        {/* Kad B: Stor Alat Ganti & Komponen */}
        <div className="bg-white rounded-3xl p-6 border-2 border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center">
                <Warehouse className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-black text-zinc-950 uppercase tracking-wider font-mono">
                  Stor Alat Ganti & Rak Komponen
                </h3>
                <p className="text-[11px] text-zinc-800 font-bold">Kiraan stok alat ganti, paras amaran minimum & nilai lejar</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                tactileAudio.buttonClick();
                if (typeof window !== 'undefined') window.location.hash = 'inventory';
              }}
              className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-black flex items-center gap-1 cursor-pointer transition active:scale-95"
            >
              <span>Urus Stor</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono font-black text-zinc-600 uppercase block">Nilai Stok Kos</span>
              <span className="text-base font-mono font-black text-zinc-950">
                RM {ringkasanStok.nilaiStok.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-center">
              <span className="text-[10px] font-mono font-black text-zinc-600 uppercase block">Jumlah SKU</span>
              <span className="text-xl font-mono font-black text-zinc-950">{ringkasanStok.totalItem}</span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[10px] font-mono font-black text-emerald-800 uppercase block">Baki Sihat</span>
              <span className="text-xl font-mono font-black text-emerald-800">{ringkasanStok.bakiSihat}</span>
            </div>
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-center">
              <span className="text-[10px] font-mono font-black text-red-700 uppercase block">Kritikal / Habis</span>
              <span className="text-xl font-mono font-black text-red-700">{ringkasanStok.kritikal}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. ZON B: PUSAT KUASA & TINDAKAN EKSKLUSIF PEMILIK (OWNER ONLY) */}
      <div className="bg-white rounded-3xl p-6 border-2 border-zinc-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-3">
          <div>
            <h2 className="text-xs font-black text-zinc-950 uppercase tracking-wider font-mono flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-600" />
              Tindakan Eksklusif Pemilik (Akses Khusus Owner)
            </h2>
            <p className="text-xs text-zinc-800 mt-0.5 font-bold">
              Fungsi pentadbiran utama: Kawal staf, tetapan bank rasmi, dan semakan penutupan lejar kewangan.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          {/* Butang 1: Buka Akaun Staf & PIN */}
          <button
            type="button"
            onClick={() => {
              tactileAudio.buttonClick();
              if (typeof window !== 'undefined') window.location.hash = 'owner-accounts';
            }}
            className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-white hover:bg-zinc-50 border-2 border-zinc-200 hover:border-zinc-950 shadow-sm transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white border border-zinc-800 flex items-center justify-center mb-2.5 transition group-hover:scale-105 shadow-xs">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-black text-zinc-950 group-hover:text-red-600 leading-snug line-clamp-1 transition-colors">
              Buka Akaun Staf & PIN
            </span>
            <span className="text-[10px] text-zinc-800 mt-0.5 font-bold">Pentadbiran Staf</span>
          </button>
          
          {/* Butang 2: Profil & Bank Syarikat HQ */}
          <button
            type="button"
            onClick={() => {
              tactileAudio.buttonClick();
              if (typeof window !== 'undefined') window.location.hash = 'settings';
            }}
            className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-white hover:bg-zinc-50 border-2 border-zinc-200 hover:border-zinc-950 shadow-sm transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-800 border border-red-300 flex items-center justify-center mb-2.5 transition group-hover:scale-105 shadow-xs">
              <Building2 className="w-5 h-5 text-red-800" />
            </div>
            <span className="text-xs font-black text-zinc-950 group-hover:text-red-600 leading-snug line-clamp-1 transition-colors">
              Profil & Bank Syarikat
            </span>
            <span className="text-[10px] text-zinc-800 mt-0.5 font-bold">Kunci Akaun Maybank/QR</span>
          </button>
          
          {/* Butang 3: Lejar Kewangan & Z-Report */}
          <button
            type="button"
            onClick={() => {
              tactileAudio.buttonClick();
              if (typeof window !== 'undefined') window.location.hash = 'finance';
            }}
            className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-white hover:bg-zinc-50 border-2 border-zinc-200 hover:border-zinc-950 shadow-sm transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center mb-2.5 transition group-hover:scale-105 shadow-xs">
              <FileText className="w-5 h-5 text-emerald-800" />
            </div>
            <span className="text-xs font-black text-zinc-950 group-hover:text-red-600 leading-snug line-clamp-1 transition-colors">
              Semak Lejar & Z-Report
            </span>
            <span className="text-[10px] text-zinc-800 mt-0.5 font-bold">Penutupan Syif Harian</span>
          </button>
          
          {/* Butang 4: Papan Semakan Pemilik */}
          <button
            type="button"
            onClick={() => {
              tactileAudio.buttonClick();
              if (typeof window !== 'undefined') window.location.hash = 'owner-desk';
            }}
            className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-white hover:bg-zinc-50 border-2 border-zinc-200 hover:border-zinc-950 shadow-sm transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-950 border border-zinc-300 flex items-center justify-center mb-2.5 transition group-hover:scale-105 shadow-xs">
              <Eye className="w-5 h-5 text-zinc-950" />
            </div>
            <span className="text-xs font-black text-zinc-950 group-hover:text-red-600 leading-snug line-clamp-1 transition-colors">
              Papan Semakan & Harga
            </span>
            <span className="text-[10px] text-zinc-800 mt-0.5 font-bold">Audit Harga & Arahan HQ</span>
          </button>
          
        </div>
      </div>

      {/* 5. ZON C: WIDGET DATA & SEMAKAN LEJAR OPERASI HARIAN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolum Kiri & Tengah: Log Aktiviti Terkini Kedai */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border-2 border-zinc-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-zinc-100 pb-3">
            <div>
              <h3 className="text-xs font-black text-zinc-950 tracking-wider uppercase font-mono">
                Log Jejak Transaksi & Operasi Terkini
              </h3>
              <p className="text-xs text-zinc-800 mt-0.5 font-bold">
                Aktiviti staf, jualan, perubahan harga dan deposit yang direkodkan dalam sistem.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-950 border border-zinc-300 font-mono font-black text-[10px]">
              {aktivitiList.length} Rekod Terkini
            </span>
          </div>

          {aktivitiList.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-800 font-bold">
              Tiada rekod aktiviti harian yang baharu setakat ini.
            </div>
          ) : (
            <div className="divide-y divide-zinc-200 text-xs">
              {aktivitiList.map((item: any, idx: number) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-zinc-950" />
                    <span className="font-bold text-zinc-950">{item.text}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-600 font-bold shrink-0">
                    {item.at ? new Date(item.at).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kolum Kanan: Semakan Amaran & Pengecualian Syif (Data Sebenar) */}
        <div className="bg-white rounded-3xl p-6 border-2 border-zinc-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-zinc-100 pb-3 mb-4">
              <h3 className="text-xs font-black text-zinc-950 tracking-wider uppercase font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                Amaran & Halangan Tertunggak
              </h3>
              <p className="text-xs text-zinc-800 mt-0.5 font-bold">
                Item yang memerlukan perhatian semakan pemilik atau tindakan staf.
              </p>
            </div>

            {masalahList.length === 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex items-center gap-3 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Tiada masalah atau sangkutan harga yang dikesan. Semua operasi normal.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {masalahList.slice(0, 5).map((m: any) => (
                  <div key={m.id} className="p-3 rounded-2xl bg-red-50 border-2 border-red-200 flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-red-600 mt-1 shrink-0 animate-pulse" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-zinc-950 leading-tight">{m.label}</p>
                      <p className="text-[10px] text-zinc-700 font-bold mt-0.5 uppercase font-mono">Tindakan: {m.targetRole}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t-2 border-zinc-100">
            <div className="p-3 rounded-2xl bg-zinc-50 border-2 border-zinc-200 text-xs font-bold flex items-center justify-between">
              <span className="text-zinc-800">Integriti Lejar HQ:</span>
              <span className="font-black font-mono text-emerald-800 flex items-center gap-1.5 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                D1 Live Sync Aktif
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
