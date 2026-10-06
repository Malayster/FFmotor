import React, { useState } from 'react';
import { ArahanStrip } from '../owner/OwnerDesk';
import { 
  TrendingUp, ShieldCheck, Zap, DollarSign, Wrench, Package, 
  Users, CheckCircle2, Clock, AlertTriangle, ArrowUpRight, 
  Search, FileText, ChevronRight, Activity, Filter, BarChart3, 
  SlidersHorizontal, Check, RefreshCw, Sparkles, Bike, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { InteractiveNumber } from '../../components/ui/InteractiveNumber';
import { tactileAudio } from '../../lib/audio';
import { fireVictoryCelebration } from '../../lib/confetti';
import { toast } from 'sonner';

export const AffiliateDashboard: React.FC = () => {
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

  const ringkasanMotor = boardData?.ringkasanMotor || { terjual: 14, loanPending: 9, tersedia: 22, total: 45 };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <ArahanStrip role="affiliate" />

      {/* 1. HEADER COCKPIT AFILIASI - 4 WARNA: HITAM, PUTIH, MERAH, HIJAU MUDA */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-zinc-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-black text-red-600 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span className="tracking-wider uppercase">Pusat Jualan Motosikal & Showroom</span>
            <span className="text-zinc-950 font-bold">•</span>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border-2 border-red-300 uppercase text-[10px] font-black">
              Ejen Jualan & Afiliasi
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
            Papan Kawalan Jualan & Saluran Kredit Motosikal
          </h1>
          <p className="text-xs sm:text-sm text-zinc-800 mt-1 font-bold">
            Cawangan Mergong: Saluran permohonan loan, susulan prospek WhatsApp, dan pemantauan stok motosikal baharu & terpakai.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button 
            type="button"
            onClick={() => {
              tactileAudio.buttonClick();
              fetchLive();
              toast.success("Data jualan showroom dikemaskini.");
            }}
            className="px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white transition flex items-center gap-2 text-xs font-black cursor-pointer shadow-sm active:scale-95"
            title="Segarkan data jualan"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-white ${loading ? 'animate-spin' : ''}`} />
            <span>Segar Semula</span>
          </button>
        </div>
      </div>

      {/* 2. ZON A: METRIK KPI JUALAN (4 WARNA MUTLAK) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Kad 1: Unit Motor Terjual */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bg-white rounded-2xl p-5 border-2 border-zinc-200 shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-zinc-950 uppercase tracking-wider font-mono">Unit Motor Terjual</span>
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-800 border border-red-300 flex items-center justify-center font-black text-xs">
              <Bike className="w-4 h-4 text-red-800" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-mono">
              <InteractiveNumber value={ringkasanMotor.terjual} suffix=" Unit" />
            </span>
            <span className="text-xs font-black text-emerald-800 flex items-center font-mono bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-lg">
              Sasaran: 20 Unit
            </span>
          </div>
          <p className="text-[11px] text-zinc-900 mt-2 font-bold truncate">Unit terjual dalam rekod showroom</p>
        </motion.div>
        
        {/* Kad 2: Permohonan Loan Aktif */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bg-white rounded-2xl p-5 border-2 border-zinc-200 shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-zinc-950 uppercase tracking-wider font-mono">Permohonan Loan Aktif</span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-950 border border-zinc-300 flex items-center justify-center font-black text-xs">
              <FileText className="w-4 h-4 text-zinc-950" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-mono">
              <InteractiveNumber value={ringkasanMotor.loanPending} suffix=" Pelanggan" />
            </span>
            <span className="text-xs font-black text-emerald-800 flex items-center font-mono bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-lg">
              5 Lulus Dokumen
            </span>
          </div>
          <p className="text-[11px] text-zinc-900 mt-2 font-bold truncate">Aeon Credit, Chailease & Kedai</p>
        </motion.div>
        
        {/* Kad 3: Komisen Jualan Terkumpul */}
        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            tactileAudio.cashRegister();
            fireVictoryCelebration();
            toast.success("Komisen Jualan Terkumpul: RM 4,250.00 telah disahkan!");
          }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bg-white rounded-2xl p-5 border-2 border-zinc-200 shadow-sm transition-all cursor-pointer group"
          title="Klik untuk semak penyata komisen jualan"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-zinc-950 uppercase tracking-wider font-mono">Komisen Terkumpul</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center font-black text-xs">
              <DollarSign className="w-4 h-4 text-emerald-800" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-mono">
              <InteractiveNumber value={4250.00} prefix="RM " decimals={2} />
            </span>
            <span className="text-xs font-black text-emerald-800 flex items-center font-mono bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-lg">
              RM350 / Unit
            </span>
          </div>
          <p className="text-[11px] text-zinc-900 mt-2 font-bold truncate">Insentif jualan tunai & pembiayaan kredit</p>
        </motion.div>
        
        {/* Kad 4: Prospek & Leads Baru */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bg-white rounded-2xl p-5 border-2 border-zinc-200 shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-zinc-950 uppercase tracking-wider font-mono">Prospek & Leads Baru</span>
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-800 border border-red-300 flex items-center justify-center font-black text-xs">
              <Users className="w-4 h-4 text-red-800" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-mono">
              <InteractiveNumber value={34} suffix=" Leads" />
            </span>
            <span className="text-xs font-black text-zinc-950 flex items-center font-mono bg-zinc-100 border border-zinc-300 px-2 py-0.5 rounded-lg">
              Kadar 78%
            </span>
          </div>
          <p className="text-[11px] text-zinc-900 mt-2 font-bold truncate">WhatsApp & kunjungan bilik pameran</p>
        </motion.div>
        
      </div>

      {/* 3. ZON B: MODUL TINDAKAN PANTAS OPERASI JUALAN */}
      <div className="bg-white rounded-3xl p-6 border-2 border-zinc-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-3">
          <div>
            <h2 className="text-xs font-black text-zinc-950 uppercase tracking-wider font-mono flex items-center gap-2">
              <Zap className="w-4 h-4 text-red-600" />
              Tindakan Pantas Operasi Jualan
            </h2>
            <p className="text-xs text-zinc-800 mt-0.5 font-bold">Akses pantas ke katalog motosikal, kiraan ansuran, dan saluran loan.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* Butang 0: Showroom Motosikal */}
          <button
            type="button"
            onClick={() => {
              tactileAudio.buttonClick();
              if (typeof window !== 'undefined') window.location.hash = 'motor-sales';
            }}
            className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-white hover:bg-zinc-50 border-2 border-zinc-200 hover:border-zinc-950 shadow-sm transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-800 border border-red-300 flex items-center justify-center mb-2.5 transition group-hover:scale-105 shadow-xs">
              <TrendingUp className="w-5 h-5 text-red-800" />
            </div>
            <span className="text-xs font-black text-zinc-950 leading-snug line-clamp-1">Showroom Motosikal</span>
            <span className="text-[10px] text-zinc-800 mt-0.5 font-bold">Stok & Varian</span>
          </button>
          
          {/* Butang 1: Saluran Permohonan Loan */}
          <button
            type="button"
            onClick={() => {
              tactileAudio.buttonClick();
              if (typeof window !== 'undefined') window.location.hash = 'loan-pipeline';
            }}
            className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-white hover:bg-zinc-50 border-2 border-zinc-200 hover:border-zinc-950 shadow-sm transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white border border-zinc-800 flex items-center justify-center mb-2.5 transition group-hover:scale-105 shadow-xs">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-black text-zinc-950 leading-snug line-clamp-1">Saluran Loan</span>
            <span className="text-[10px] text-zinc-800 mt-0.5 font-bold">Semakan Kredit</span>
          </button>
          
          {/* Butang 2: Senarai Prospek */}
          <button
            type="button"
            onClick={() => {
              tactileAudio.buttonClick();
              if (typeof window !== 'undefined') window.location.hash = 'leads';
            }}
            className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-white hover:bg-zinc-50 border-2 border-zinc-200 hover:border-zinc-950 shadow-sm transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-950 border border-zinc-300 flex items-center justify-center mb-2.5 transition group-hover:scale-105 shadow-xs">
              <Users className="w-5 h-5 text-zinc-950" />
            </div>
            <span className="text-xs font-black text-zinc-950 leading-snug line-clamp-1">Senarai Prospek</span>
            <span className="text-[10px] text-zinc-800 mt-0.5 font-bold">WhatsApp CRM</span>
          </button>
          
          {/* Butang 3: Kempen Media Sosial */}
          <button
            type="button"
            onClick={() => {
              tactileAudio.buttonClick();
              if (typeof window !== 'undefined') window.location.hash = 'campaigns';
            }}
            className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-white hover:bg-zinc-50 border-2 border-zinc-200 hover:border-zinc-950 shadow-sm transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-800 border border-red-300 flex items-center justify-center mb-2.5 transition group-hover:scale-105 shadow-xs">
              <Zap className="w-5 h-5 text-red-800" />
            </div>
            <span className="text-xs font-black text-zinc-950 leading-snug line-clamp-1">Kempen FB/TikTok</span>
            <span className="text-[10px] text-zinc-800 mt-0.5 font-bold">Pautan & QR Ejen</span>
          </button>
          
          {/* Butang 4: Penilaian Trade-In */}
          <button
            type="button"
            onClick={() => {
              tactileAudio.buttonClick();
              if (typeof window !== 'undefined') window.location.hash = 'trade-in';
            }}
            className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-white hover:bg-zinc-50 border-2 border-zinc-200 hover:border-zinc-950 shadow-sm transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center mb-2.5 transition group-hover:scale-105 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-800" />
            </div>
            <span className="text-xs font-black text-zinc-950 leading-snug line-clamp-1">Penilaian Trade-In</span>
            <span className="text-[10px] text-zinc-800 mt-0.5 font-bold">Harga Motor Lama</span>
          </button>
          
          {/* Butang 5: Kalkulator Ansuran */}
          <button
            type="button"
            onClick={() => {
              tactileAudio.buttonClick();
              if (typeof window !== 'undefined') window.location.hash = 'quotes';
            }}
            className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-white hover:bg-zinc-50 border-2 border-zinc-200 hover:border-zinc-950 shadow-sm transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-950 border border-zinc-300 flex items-center justify-center mb-2.5 transition group-hover:scale-105 shadow-xs">
              <Clock className="w-5 h-5 text-zinc-950" />
            </div>
            <span className="text-xs font-black text-zinc-950 leading-snug line-clamp-1">Kalkulator Ansuran</span>
            <span className="text-[10px] text-zinc-800 mt-0.5 font-bold">Jadual Bayaran</span>
          </button>
        </div>
      </div>

      {/* 4. ZON C: WIDGET DATA & JADUAL TERPERINCI SALURAN LOAN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolum Kiri & Tengah: Jadual Terperinci Saluran Permohonan Loan */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border-2 border-zinc-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-zinc-100 pb-3">
            <div>
              <h3 className="text-xs font-black text-zinc-950 tracking-wider uppercase font-mono">Saluran Permohonan Pembiayaan Motosikal (Loan)</h3>
              <p className="text-xs text-zinc-800 mt-0.5 font-bold">Status dokumen pembeli dan kelulusan syarikat kredit</p>
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
                  className={"px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer " + (activeFilter === tab ? "bg-zinc-950 text-white shadow-xs" : "text-zinc-800 hover:text-zinc-950")}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-zinc-200 text-[10px] font-mono text-zinc-950 uppercase bg-zinc-50">
                  <th className="py-2.5 px-2 font-black">ID Permohonan</th>
                  <th className="py-2.5 px-2 font-black">Nama Pembeli</th>
                  <th className="py-2.5 px-2 font-black">Model Motosikal</th>
                  <th className="py-2.5 px-2 font-black">Syarikat Kredit</th>
                  <th className="py-2.5 px-2 font-black">Ansuran / Bulan</th>
                  <th className="py-2.5 px-2 font-black text-right">Status Loan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-950 font-bold">
                <tr className="hover:bg-zinc-50 transition-colors">
                  <td className="py-3.5 px-2 font-black text-zinc-950 font-mono">LN-2026-081</td>
                  <td className="py-3.5 px-2 text-zinc-950 font-bold">Mohd Shahril <span className="font-mono text-zinc-800 block text-[11px]">(017-4433221)</span></td>
                  <td className="py-3.5 px-2 font-bold text-zinc-950">Yamaha NVX 155 ABS</td>
                  <td className="py-3.5 px-2 text-zinc-900">Aeon Credit Service</td>
                  <td className="py-3.5 px-2 text-zinc-950 font-mono font-black">RM 245.00</td>
                  <td className="py-3.5 px-2 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-black font-mono text-[10px]">
                      Lulus / Tunggu JPJ
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50 transition-colors">
                  <td className="py-3.5 px-2 font-black text-zinc-950 font-mono">LN-2026-082</td>
                  <td className="py-3.5 px-2 text-zinc-950 font-bold">Nurul Ain <span className="font-mono text-zinc-800 block text-[11px]">(013-9988112)</span></td>
                  <td className="py-3.5 px-2 font-bold text-zinc-950">Honda Vario 160 SE</td>
                  <td className="py-3.5 px-2 text-zinc-900">Chailease Berjaya</td>
                  <td className="py-3.5 px-2 text-zinc-950 font-mono font-black">RM 210.00</td>
                  <td className="py-3.5 px-2 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 font-black font-mono text-[10px]">
                      Semakan Slip Gaji
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50 transition-colors">
                  <td className="py-3.5 px-2 font-black text-zinc-950 font-mono">LN-2026-083</td>
                  <td className="py-3.5 px-2 text-zinc-950 font-bold">Daniel Lee <span className="font-mono text-zinc-800 block text-[11px]">(018-7766554)</span></td>
                  <td className="py-3.5 px-2 font-bold text-zinc-950">Yamaha Y15ZR Monster</td>
                  <td className="py-3.5 px-2 text-zinc-900">Kredit Kedai FFmotor</td>
                  <td className="py-3.5 px-2 text-zinc-950 font-mono font-black">RM 260.00</td>
                  <td className="py-3.5 px-2 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-zinc-950 text-white font-black font-mono text-[10px]">
                      Tandatangan Akad
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Kolum Kanan: Bento Peringatan Jualan & Showroom */}
        <div className="bg-white rounded-3xl p-6 border-2 border-zinc-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-zinc-100 pb-3 mb-4">
              <h3 className="text-xs font-black text-zinc-950 tracking-wider uppercase font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                Peringatan Jualan & Showroom
              </h3>
              <p className="text-xs text-zinc-800 mt-0.5 font-bold">Tawaran semasa & tindakan susulan prospek hangat.</p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-red-50 border-2 border-red-200 flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-600 mt-1 shrink-0 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-zinc-950 leading-snug">Promosi Deposit RM0 Yamaha NVX</p>
                  <p className="text-[11px] text-zinc-800 mt-0.5 leading-relaxed truncate font-bold">Tinggal 2 unit sahaja stok warna perak di showroom</p>
                </div>
                <span className="text-[10px] font-mono font-black text-zinc-950 shrink-0">15m lalu</span>
              </div>
              
              <div className="p-3.5 rounded-2xl bg-zinc-50 border-2 border-zinc-200 flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-950 mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-zinc-950 leading-snug">Semakan Saman Motosikal Trade-In</p>
                  <p className="text-[11px] text-zinc-800 mt-0.5 leading-relaxed truncate font-bold">Pelanggan En. Zainal mahu tukar beli Yamaha Lagenda lama</p>
                </div>
                <span className="text-[10px] font-mono font-black text-zinc-950 shrink-0">1j lalu</span>
              </div>
              
              <div className="p-3.5 rounded-2xl bg-zinc-50 border-2 border-zinc-200 flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-950 mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-zinc-950 leading-snug">Jadual Ansuran Chailease 3 Tahun</p>
                  <p className="text-[11px] text-zinc-800 mt-0.5 leading-relaxed truncate font-bold">Hantar PDF sebut harga bulanan RM235 ke WhatsApp pelanggan</p>
                </div>
                <span className="text-[10px] font-mono font-black text-zinc-950 shrink-0">2j lalu</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t-2 border-zinc-100">
            <div className="p-3 rounded-2xl bg-zinc-50 border-2 border-zinc-200 text-xs font-bold flex items-center justify-between">
              <span className="text-zinc-800">Status Showroom:</span>
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
