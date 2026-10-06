import React, { useState } from "react";
import { X, ArrowRightLeft, MessageSquare, Check, ShieldCheck, Zap, Gauge } from "lucide-react";
import { tactileAudio } from "../../lib/audio";

interface BikeSpec {
  id: string;
  brand: string;
  model: string;
  price: number;
  engine: string;
  hp: string;
  torque: string;
  brakes: string;
  fuelTank: string;
  weight: string;
  warranty: string;
  image: string;
}

const COMPARABLE_BIKES: BikeSpec[] = [
  {
    id: "moto_3",
    brand: "YAMAHA",
    model: "Y16ZR ABS Doxou Edition",
    price: 11118,
    engine: "155cc SOHC VVA 4-Valve Cecair",
    hp: "17.7 HP @ 9,500 RPM",
    torque: "14.4 Nm @ 8,000 RPM",
    brakes: "ABS Hadapan + Cakera 2-Pot Nissin",
    fuelTank: "5.4 Liter",
    weight: "119 kg",
    warranty: "2 Tahun / 20,000 km (Hong Leong)",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80",
  },
  {
    id: "moto_4",
    brand: "HONDA",
    model: "RS-X 150 Repsol MotoGP",
    price: 9998,
    engine: "150cc DOHC 4-Valve Cecair",
    hp: "15.8 HP @ 9,000 RPM",
    torque: "13.6 Nm @ 7,000 RPM",
    brakes: "ABS Hadapan + Cakera Nissin",
    fuelTank: "4.5 Liter",
    weight: "122 kg",
    warranty: "2 Tahun / 20,000 km (Boon Siew)",
    image: "https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=800&q=80",
  },
  {
    id: "moto_1",
    brand: "YAMAHA",
    model: "Y15ZR V2 SE",
    price: 9688,
    engine: "150cc SOHC 4-Valve Cecair",
    hp: "15.1 HP @ 8,500 RPM",
    torque: "13.8 Nm @ 7,000 RPM",
    brakes: "Cakera Hidraulik Depan & Belakang",
    fuelTank: "4.2 Liter",
    weight: "117 kg",
    warranty: "2 Tahun / 20,000 km (Hong Leong)",
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80",
  },
  {
    id: "moto_2",
    brand: "HONDA",
    model: "ADV 160 ABS Touring",
    price: 12400,
    engine: "157cc eSP+ 4-Valve CVT",
    hp: "15.8 HP @ 8,500 RPM",
    torque: "14.7 Nm @ 6,500 RPM",
    brakes: "ABS Hadapan + HSTC Traction Control",
    fuelTank: "8.1 Liter",
    weight: "133 kg",
    warranty: "2 Tahun / 20,000 km (Boon Siew)",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80",
  },
];

interface BikeCompareModalProps {
  initialBikeId?: string;
  onClose: () => void;
  onSelectDeposit: (bikeId: string, model: string, price: number) => void;
}

export const BikeCompareModal: React.FC<BikeCompareModalProps> = ({
  initialBikeId,
  onClose,
  onSelectDeposit,
}) => {
  const [leftId, setLeftId] = useState<string>(initialBikeId || "moto_3");
  const [rightId, setRightId] = useState<string>(
    initialBikeId === "moto_4" ? "moto_3" : "moto_4"
  );

  const leftBike = COMPARABLE_BIKES.find((b) => b.id === leftId) || COMPARABLE_BIKES[0];
  const rightBike = COMPARABLE_BIKES.find((b) => b.id === rightId) || COMPARABLE_BIKES[1];

  const whatsappInquiryUrl = `https://wa.me/60124809979?text=${encodeURIComponent(
    `Salam Encik Fauzi (FP Motor), saya nak minta nasihat perbandingan antara *${leftBike.brand} ${leftBike.model}* (RM${leftBike.price.toLocaleString()}) dengan *${rightBike.brand} ${rightBike.model}* (RM${rightBike.price.toLocaleString()}). Yang mana lebih berbaloi untuk kegunaan harian saya?`
  )}`;

  const specRows = [
    { label: "Harga Jualan Tunai", left: `RM ${leftBike.price.toLocaleString()}`, right: `RM ${rightBike.price.toLocaleString()}`, highlight: true },
    { label: "Anggaran Bulanan (36 Bln)", left: `~RM ${Math.round(leftBike.price * 0.025)} /bln`, right: `~RM ${Math.round(rightBike.price * 0.025)} /bln` },
    { label: "Kapasiti & Enjin", left: leftBike.engine, right: rightBike.engine },
    { label: "Kuasa Kuda Puncak", left: leftBike.hp, right: rightBike.hp },
    { label: "Tork Maksimum", left: leftBike.torque, right: rightBike.torque },
    { label: "Sistem Brek & Keselamatan", left: leftBike.brakes, right: rightBike.brakes },
    { label: "Kapasiti Tangki Minyak", left: leftBike.fuelTank, right: rightBike.fuelTank },
    { label: "Berat Motosikal", left: leftBike.weight, right: rightBike.weight },
    { label: "Jaminan Pengilang", left: leftBike.warranty, right: rightBike.warranty },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-black text-white border-2 border-zinc-800 rounded-3xl max-w-4xl w-full p-5 sm:p-7 flex flex-col space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shrink-0">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-black uppercase text-red-500 tracking-wider">
                KOMPARASI PRESTASI SEBELAH-MENYEBELAH
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Bandingkan 2 Jentera Pilihan Anda
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pemilihan 2 Jentera */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 pt-1">
          {/* Jentera Kiri */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono font-black uppercase text-zinc-400 block">Jentera A:</label>
            <select
              value={leftId}
              onChange={(e) => {
                tactileAudio.click();
                setLeftId(e.target.value);
              }}
              className="w-full bg-zinc-900 border-2 border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono font-black text-white outline-none focus:border-red-600"
            >
              {COMPARABLE_BIKES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.brand} {b.model} (RM {b.price.toLocaleString()})
                </option>
              ))}
            </select>
            <div className="aspect-16/10 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
              <img src={leftBike.image} alt={leftBike.model} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Jentera Kanan */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono font-black uppercase text-zinc-400 block">Jentera B:</label>
            <select
              value={rightId}
              onChange={(e) => {
                tactileAudio.click();
                setRightId(e.target.value);
              }}
              className="w-full bg-zinc-900 border-2 border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono font-black text-white outline-none focus:border-red-600"
            >
              {COMPARABLE_BIKES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.brand} {b.model} (RM {b.price.toLocaleString()})
                </option>
              ))}
            </select>
            <div className="aspect-16/10 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
              <img src={rightBike.image} alt={rightBike.model} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Jadual Perbandingan Spesifikasi */}
        <div className="border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-800 text-xs font-mono">
          {specRows.map((row, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-12 p-2.5 sm:p-3 items-center ${
                row.highlight ? "bg-zinc-900 font-black" : "bg-black"
              }`}
            >
              <div className="col-span-12 sm:col-span-4 text-[11px] text-zinc-400 font-bold uppercase mb-1 sm:mb-0">
                {row.label}
              </div>
              <div className="col-span-6 sm:col-span-4 text-white font-bold pr-2 border-r border-zinc-800/80">
                {row.highlight ? (
                  <span className="text-red-500 font-mono text-sm">{row.left}</span>
                ) : (
                  <span>{row.left}</span>
                )}
              </div>
              <div className="col-span-6 sm:col-span-4 text-white font-bold pl-2">
                {row.highlight ? (
                  <span className="text-emerald-400 font-mono text-sm">{row.right}</span>
                ) : (
                  <span>{row.right}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Butang Tindakan Bawah */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href={whatsappInquiryUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-emerald-400 font-mono font-black text-xs uppercase flex items-center justify-center gap-2 transition"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Minta Nasihat Fauzi Pazil via WhatsApp</span>
          </a>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectDeposit(leftBike.id, `${leftBike.brand} ${leftBike.model}`, leftBike.price);
              }}
              className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer text-center"
            >
              Kunci Jentera A
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectDeposit(rightBike.id, `${rightBike.brand} ${rightBike.model}`, rightBike.price);
              }}
              className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-black text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer text-center"
            >
              Kunci Jentera B
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
