import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, RotateCcw, ShieldCheck, ChevronLeft, ChevronRight, Eye, Sparkles } from "lucide-react";

interface Shot {
  slot: string;
  label?: string | null;
  image: string;
}

interface Interactive360ViewerProps {
  shots: Shot[];
  bikeTitle: string;
  brand: string;
  sellingPrice: number;
  condition?: "new" | "used";
  onClose: () => void;
  onBookDeposit: () => void;
}

// Urutan pusingan kamera 360 darjah
const ANGLE_STEPS = [
  { slot: "depan", deg: "0°", label: "Sudut Hadapan" },
  { slot: "sisi_kiri", deg: "45°", label: "Sisi Kiri Penuh" },
  { slot: "meter", deg: "90°", label: "Panel Meter Digital" },
  { slot: "enjin", deg: "135°", label: "Blok Enjin & Karburetor/FI" },
  { slot: "ekzos", deg: "180°", label: "Sistem Ekzos" },
  { slot: "tayar_belakang", deg: "225°", label: "Tayar & Rim Belakang" },
  { slot: "sisi_kanan", deg: "270°", label: "Sisi Kanan Penuh" },
  { slot: "belakang", deg: "315°", label: "Sudut Belakang" },
];

export const Interactive360Viewer: React.FC<Interactive360ViewerProps> = ({
  shots,
  bikeTitle,
  brand,
  sellingPrice,
  condition = "new",
  onClose,
  onBookDeposit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const startIndex = useRef(0);

  // Jika tiada shots, sediakan fallback
  const safeShots = shots && shots.length > 0 ? shots : [
    { slot: "depan", label: "Sudut Hadapan", image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=900&q=80" }
  ];

  const totalShots = safeShots.length;

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    startIndex.current = currentIndex;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || totalShots <= 1) return;
    const deltaX = e.clientX - dragStartX.current;
    // Setiap 35px leretan menukar 1 sudut foto
    const stepsMoved = Math.floor(deltaX / 35);
    const newIdx = (startIndex.current - stepsMoved) % totalShots;
    const normalized = (newIdx + totalShots) % totalShots;
    setCurrentIndex(normalized);
  }, [isDragging, totalShots]);

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {}
  };

  const prevAngle = () => {
    setCurrentIndex((prev) => (prev - 1 + totalShots) % totalShots);
  };

  const nextAngle = () => {
    setCurrentIndex((prev) => (prev + 1) % totalShots);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevAngle();
      if (e.key === "ArrowRight") nextAngle();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [totalShots, onClose]);

  const activeShot = safeShots[currentIndex] || safeShots[0];
  const angleInfo = ANGLE_STEPS[currentIndex] || { deg: `${Math.round((currentIndex / totalShots) * 360)}°`, label: activeShot.label || activeShot.slot };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-md select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-black text-white border-2 border-zinc-800 rounded-3xl max-w-4xl w-full p-5 sm:p-7 flex flex-col space-y-4 shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-mono font-black text-white text-base">
              360°
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase text-red-500 tracking-wider">
                  {brand}
                </span>
                <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded ${condition === "new" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-zinc-800 text-zinc-300"}`}>
                  {condition === "new" ? "UNIT BARU" : "TERPAKAI GRED A"}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {bikeTitle}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer"
            aria-label="Tutup Paparan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Kawasan Paparan Foto 360 Utama (Drag to Rotate) */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`relative aspect-16/10 sm:aspect-16/9 rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none group flex items-center justify-center ${isDragging ? "ring-2 ring-red-600" : ""}`}
        >
          {/* Imej Semasa */}
          <img
            src={activeShot.image}
            alt={`${bikeTitle} - ${activeShot.slot}`}
            className="w-full h-full object-cover pointer-events-none transition-transform duration-75"
            draggable={false}
          />

          {/* Arahan Drag Terapung */}
          <div className="absolute top-4 left-4 bg-black/80 border border-zinc-700 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-mono font-black pointer-events-none">
            <RotateCcw className="w-3.5 h-3.5 text-red-500 animate-spin" style={{ animationDuration: "8s" }} />
            <span className="text-zinc-200 hidden sm:inline">LERET KIRI/KANAN UNTUK PUSING SUDUT</span>
            <span className="text-red-500 font-bold sm:hidden">LERET 360°</span>
          </div>

          {/* Sudut & Kompas Darjah */}
          <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-mono font-black shadow-md">
            <span>{angleInfo.deg}</span>
            <span className="text-[10px] text-white/80 uppercase">({currentIndex + 1}/{totalShots})</span>
          </div>

          {/* Butang Navigasi Kiri / Kanan */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prevAngle(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition border border-zinc-700 shadow-lg cursor-pointer"
            aria-label="Sudut Sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); nextAngle(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition border border-zinc-700 shadow-lg cursor-pointer"
            aria-label="Sudut Seterusnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Label Komponen di Bawah Gambar */}
          <div className="absolute bottom-4 inset-x-4 flex items-center justify-between pointer-events-none">
            <div className="bg-black/85 border border-zinc-700 px-3.5 py-1.5 rounded-xl text-xs font-mono font-black text-white flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-red-500" />
              <span>{angleInfo.label}</span>
            </div>
            <div className="bg-black/85 border border-zinc-700 px-3 py-1.5 rounded-xl text-[11px] font-mono text-zinc-400 font-bold hidden sm:block">
              FP MOTOR STUDIO RIG
            </div>
          </div>
        </div>

        {/* Carousel Thumbnail 8 Sudut */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 font-bold px-1">
            <span>PILIH SUDUT PANDANGAN:</span>
            <span>{activeShot.slot.replace("_", " ").toUpperCase()}</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
            {safeShots.map((s, idx) => {
              const isActive = currentIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-16 sm:w-20 h-12 sm:h-14 rounded-xl overflow-hidden shrink-0 border-2 transition relative snap-start cursor-pointer ${
                    isActive
                      ? "border-red-600 ring-2 ring-red-600/40 scale-105"
                      : "border-zinc-800 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={s.image} alt={s.slot} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] font-mono text-white text-center truncate py-0.5">
                    {s.slot.slice(0, 6)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer & Tindakan Pembelian */}
        <div className="pt-3 border-t-2 border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Harga Rasmi Showroom</span>
              <span className="text-2xl font-mono font-black text-white">
                RM {sellingPrice.toLocaleString()}
              </span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-mono font-black flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sedia Pandu Uji</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-black uppercase transition cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onBookDeposit();
              }}
              className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition shadow-lg shadow-red-600/30 cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Kunci Unit (Deposit RM300)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
