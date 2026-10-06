import React, { useState, useMemo } from "react";
import { Calculator, MessageSquare, CheckCircle, Percent } from "lucide-react";

interface BikeLoanCalculatorProps {
  sellingPrice: number;
  bikeModel: string;
}

export const BikeLoanCalculator: React.FC<BikeLoanCalculatorProps> = ({
  sellingPrice,
  bikeModel,
}) => {
  const [deposit, setDeposit] = useState<number>(() => Math.min(2000, Math.round(sellingPrice * 0.15)));
  const [months, setMonths] = useState<number>(36);
  const annualRate = 7.5; // Kadar purata syarikat kredit motor (AEON / Chailease)

  // Pengiraan Ansuran
  const { loanAmount, monthlyInstallment, totalPayable } = useMemo(() => {
    const principal = Math.max(0, sellingPrice - deposit);
    const years = months / 12;
    const totalInterest = principal * (annualRate / 100) * years;
    const total = principal + totalInterest;
    const monthly = months > 0 ? total / months : 0;
    return {
      loanAmount: principal,
      monthlyInstallment: Math.round(monthly),
      totalPayable: Math.round(total),
    };
  }, [sellingPrice, deposit, months, annualRate]);

  // URL WhatsApp Pra-Format
  const whatsappUrl = useMemo(() => {
    const msg = `Salam Encik Fauzi (FP Motor Kemboja Jerlun), saya berminat nak semak kelayakan pinjaman untuk motosikal *${bikeModel}* (Harga Tunai: RM${sellingPrice.toLocaleString()}).\n\nCadangan Deposit: RM${deposit.toLocaleString()}\nTempoh Pinjaman: ${months} Bulan\nAnggaran Bulanan: RM${monthlyInstallment}/bln.\n\nBoleh saya tahu dokumen apa yang perlu saya hantar untuk semakan kelulusan? Terima kasih!`;
    return `https://wa.me/60124809979?text=${encodeURIComponent(msg)}`;
  }, [bikeModel, sellingPrice, deposit, months, monthlyInstallment]);

  const depositPresets = [
    Math.round(sellingPrice * 0.1),
    Math.round(sellingPrice * 0.2),
    Math.round(sellingPrice * 0.3),
  ];

  return (
    <div className="p-3.5 bg-black border border-zinc-800 rounded-2xl space-y-3 text-white">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div className="flex items-center gap-1.5 text-xs font-mono font-black text-red-500 uppercase">
          <Calculator className="w-3.5 h-3.5" />
          <span>Kalkulator Ansuran Kredit</span>
        </div>
        <span className="text-[10px] font-mono text-zinc-400">
          Kadar: {annualRate}% p.a
        </span>
      </div>

      {/* Pilihan Deposit */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] font-mono">
          <span className="text-zinc-400">Pilihan Wang Muka:</span>
          <span className="text-white font-black">RM {deposit.toLocaleString()}</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {depositPresets.map((amt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setDeposit(amt)}
              className={`py-1 text-[10px] font-mono font-black rounded-lg border transition ${
                deposit === amt
                  ? "bg-red-600 border-red-600 text-white"
                  : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
              }`}
            >
              RM {amt.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Pilihan Tempoh Bulan */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] font-mono">
          <span className="text-zinc-400">Tempoh Bayaran:</span>
          <span className="text-white font-black">{months} Bulan ({months / 12} Tahun)</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[24, 36, 48, 60].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMonths(m)}
              className={`py-1 text-[10px] font-mono font-black rounded-lg border transition ${
                months === m
                  ? "bg-white border-white text-zinc-950 font-black"
                  : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
              }`}
            >
              {m} Bln
            </button>
          ))}
        </div>
      </div>

      {/* Hasil Pengiraan Ansuran */}
      <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono text-zinc-400 uppercase block">Anggaran Bulanan</span>
          <span className="text-xl font-mono font-black text-red-500">
            RM {monthlyInstallment.toLocaleString()}
            <span className="text-xs text-zinc-400 font-normal"> /bln</span>
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono text-zinc-400 uppercase block">Baki Pinjaman</span>
          <span className="text-xs font-mono font-black text-white">
            RM {loanAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Butang Terus WhatsApp Semak Slip Gaji */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        <span>Semak Slip Gaji via WhatsApp</span>
      </a>
    </div>
  );
};
