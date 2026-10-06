import React, { useEffect, useState, useMemo } from "react";
import { 
  Bike, Wrench, ShoppingBag, ShieldCheck, Phone, MapPin, 
  Clock, Search, CheckCircle2, ArrowRight, X, ExternalLink, 
  Calendar, ChevronRight, Tag, Star, Sparkles, Filter, AlertCircle,
  Truck, Check, User, ChevronLeft, RotateCcw, Eye, Calculator, ArrowRightLeft, Key, Menu
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { useMotorsportParallax } from "../lib/useMotorsportParallax";
import { TiltCard3D } from "../components/parallax/TiltCard3D";
import { Interactive360Viewer } from "../components/parallax/Interactive360Viewer";
import { BikeLoanCalculator } from "../components/showroom/BikeLoanCalculator";
import { HeroMotorsportStage } from "../components/showroom/HeroMotorsportStage";
import { BikeCompareModal } from "../components/showroom/BikeCompareModal";
import { DynoTuningSimulator } from "../components/pit/DynoTuningSimulator";
import { LivePitRadar } from "../components/pit/LivePitRadar";
import { PremiseFloorplan } from "../components/premise/PremiseFloorplan";
import { MobileActionDock } from "../components/navigation/MobileActionDock";
import { tactileAudio } from "../lib/audio";
import { Passport } from "./Passport";

type Shot = { slot: string; label?: string | null; image: string };

type MotorcycleUnit = {
  id: string;
  brand: string;
  model: string;
  color: string;
  condition: "new" | "used";
  sellingPrice: number;
  currentMileage?: number;
  year?: number;
  shots: Shot[];
  held?: boolean;
};

type ProductUnit = {
  id: string;
  name: string;
  brand: string;
  category: string;
  sellingPrice: number;
  availableQty: number;
  shots: Shot[];
  rackLocation?: string;
  isHighValue?: boolean;
};

type CartItem = {
  product: ProductUnit;
  quantity: number;
};

export const Portfolio: React.FC = () => {
  // Parallax Engine Hook
  const containerRef = useMotorsportParallax<HTMLDivElement>();

  // Data State
  const [motorcycles, setMotorcycles] = useState<MotorcycleUnit[]>([]);
  const [products, setProducts] = useState<ProductUnit[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedBrand, setSelectedBrand] = useState("Semua");
  const [selectedCondition, setSelectedCondition] = useState<"all" | "new" | "used">("all");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  // Showroom Card Mode (Price vs Loan Calculator)
  const [activeLoanCalcBikeId, setActiveLoanCalcBikeId] = useState<string | null>(null);

  // Modal Compare 2 Bikes
  const [compareBikeId, setCompareBikeId] = useState<string | null>(null);

  // Telemetri / Track & Passport Input
  const [quickPlate, setQuickPlate] = useState("");
  const [trackResult, setTrackResult] = useState<any>(null);
  const [searchingPlate, setSearchingPlate] = useState(false);
  const [viewingPassportPlate, setViewingPassportPlate] = useState<string | null>(null);

  // Semakan Kod Siri Keaslian Barangan
  const [serialInput, setSerialInput] = useState("");
  const [serialResult, setSerialResult] = useState<any>(null);
  const [verifyingSerial, setVerifyingSerial] = useState(false);

  // Cart / Bag State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    phone: "",
    address: "",
    fulfillment: "pickup" as "pickup" | "delivery",
  });
  const [submittingCheckout, setSubmittingCheckout] = useState(false);

  // Modal 360 Studio Viewer
  const [viewing360Bike, setViewing360Bike] = useState<MotorcycleUnit | null>(null);

  // Modal Deposit Motor
  const [selectedBikeForDeposit, setSelectedBikeForDeposit] = useState<MotorcycleUnit | null>(null);
  const [saleKind, setSaleKind] = useState<"" | "baru" | "trade-in">("");
  const [saleName, setSaleName] = useState("");
  const [salePhone, setSalePhone] = useState("");
  const [saleNote, setSaleNote] = useState("");
  const [saleMsg, setSaleMsg] = useState("");
  const [depositForm, setDepositForm] = useState({
    name: "",
    phone: "",
    slipRef: "",
  });
  const [submittingDeposit, setSubmittingDeposit] = useState(false);

  // Slot Servis Bengkel
  const [slotDate, setSlotDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slotTime, setSlotTime] = useState("09:00");
  const [availableSlots, setAvailableSlots] = useState<{ time: string; taken: number }[]>([]);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    phone: "",
    plate: "",
    serviceType: "Servis Minyak & Penyelenggaraan Am",
  });
  const [submittingSlot, setSubmittingSlot] = useState(false);

  // Muat Data Katalog Awal
  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/public/catalog");
      const data = await res.json();
      if (data.success) {
        setMotorcycles(data.motorcycles || []);
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Ralat memuatkan katalog:", err);
    } finally {
      setLoading(false);
    }
  };

  // Muat Slot Servis mengikut tarikh
  const fetchSlots = async (date: string) => {
    try {
      const res = await fetch(`/api/public/slots?date=${date}`);
      const data = await res.json();
      if (data.success) {
        setAvailableSlots(data.times || []);
      }
    } catch (err) {
      console.error("Ralat memuatkan slot:", err);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  useEffect(() => {
    fetchSlots(slotDate);
  }, [slotDate]);

  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash;
      if (h.startsWith("#passport-")) {
        const plate = decodeURIComponent(h.replace("#passport-", "")).trim();
        if (plate) setViewingPassportPlate(plate);
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // Carian Pantas Status Servis / Pasport
  const handleQuickTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPlate.trim()) return;
    try {
      tactileAudio.click();
      setSearchingPlate(true);
      setTrackResult(null);
      const res = await fetch(`/api/public/track?plate=${encodeURIComponent(quickPlate.trim())}`);
      const d = await res.json();
      setTrackResult(d);
      if (d.found) tactileAudio.success();
      else tactileAudio.warningAlert?.();
    } catch (err) {
      toast.error("Ralat menyemak nombor plat.");
    } finally {
      setSearchingPlate(false);
    }
  };

  // Semak Kod Siri Keaslian Barangan
  const handleVerifySerial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialInput.trim()) return;
    try {
      tactileAudio.click();
      setVerifyingSerial(true);
      setSerialResult(null);
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: serialInput.trim() }),
      });
      const d = await res.json();
      setSerialResult(d);
      if (d.success && d.verified) {
        tactileAudio.success();
        toast.success("Kod siri SAH & TULEN daripada pengedar rasmi!");
      } else {
        toast.error(d.message || "Kod siri tidak sah atau tiada rekod dalam sistem.");
      }
    } catch (err) {
      toast.error("Ralat menyemak kod siri.");
    } finally {
      setVerifyingSerial(false);
    }
  };

  // Pengurusan Beg Pembelian (E-Commerce)
  const addToCart = (product: ProductUnit) => {
    tactileAudio.click();
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.availableQty, item.quantity + 1) }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success(`${product.name} dimasukkan ke Beg Kuning!`);
  };

  const removeFromCart = (productId: string) => {
    tactileAudio.click();
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    tactileAudio.click();
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: Math.min(item.product.availableQty, newQty) } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
  const shippingFee = checkoutForm.fulfillment === "delivery" ? 15 : 0;
  const grandTotalCart = cartTotal + shippingFee;

  // Hantar Checkout Beg
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    try {
      setSubmittingCheckout(true);
      const lines = cart.map((c) => ({
        subjectType: "product",
        subjectId: c.product.id,
        title: c.product.name,
        quantity: c.quantity,
      }));

      const res = await fetch("/api/public/bag/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: checkoutForm.name,
          phone: checkoutForm.phone,
          address: checkoutForm.address,
          fulfillment: checkoutForm.fulfillment,
          lines,
        }),
      });

      const d = await res.json();
      if (d.success) {
        tactileAudio.success();
        toast.success("Pesanan berjaya dihantar! Kaunter kami akan menghubungi anda segera.");
        setCart([]);
        setIsCartOpen(false);
      } else {
        toast.error(d.message || "Ralat memproses pesanan.");
      }
    } catch (err) {
      toast.error("Ralat sambungan pelayan semasa checkout.");
    } finally {
      setSubmittingCheckout(false);
    }
  };

  // Hantar Tempahan Deposit Motosikal (RM300)
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBikeForDeposit) return;
    try {
      setSubmittingDeposit(true);
      const res = await fetch("/api/public/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motorcycleId: selectedBikeForDeposit.id,
          name: depositForm.name,
          phone: depositForm.phone,
          slipRef: depositForm.slipRef,
          amount: 300,
        }),
      });
      const d = await res.json();
      if (d.success) {
        tactileAudio.success();
        toast.success(d.message || "Slip diterima. Unit belum dikunci sehingga kaunter sahkan.");
        setSelectedBikeForDeposit(null);
        setDepositForm({ name: "", phone: "", slipRef: "" });
        fetchCatalog();
      } else {
        toast.error(d.message || "Gagal menghantar rekod deposit.");
      }
    } catch (err) {
      toast.error("Ralat sambungan.");
    } finally {
      setSubmittingDeposit(false);
    }
  };

  // Tempah Slot Servis
  const handleSlotBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingSlot(true);
      const res = await fetch("/api/public/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: slotDate,
          time: slotTime,
          name: bookingForm.name,
          phone: bookingForm.phone,
          plate: bookingForm.plate,
          serviceType: bookingForm.serviceType,
        }),
      });
      const d = await res.json();
      if (d.success) {
        tactileAudio.success();
        toast.success(`Slot berjaya direkodkan di Bay ${d.bay}! Sila hadir tepat pada masanya.`);
        setBookingForm({ name: "", phone: "", plate: "", serviceType: "Servis Minyak & Penyelenggaraan Am" });
        fetchSlots(slotDate);
      } else {
        toast.error(d.message || "Slot masa ini telah penuh.");
      }
    } catch (err) {
      toast.error("Ralat sambungan.");
    } finally {
      setSubmittingSlot(false);
    }
  };

  // Penapis Motosikal
  const bikeBrands = ["Semua", ...Array.from(new Set(motorcycles.map((m) => m.brand)))];
  const filteredBikes = useMemo(() => {
    return motorcycles.filter((m) => {
      const matchBrand = selectedBrand === "Semua" || m.brand === selectedBrand;
      const matchCondition = selectedCondition === "all" || m.condition === selectedCondition;
      return matchBrand && matchCondition;
    });
  }, [motorcycles, selectedBrand, selectedCondition]);

  // Penapis Produk
  const productCategories = ["Semua", ...Array.from(new Set(products.map((p) => p.category)))];
  const filteredProducts = useMemo(() => {
    return selectedCategory === "Semua" ? products : products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-white text-zinc-950 font-sans selection:bg-red-600 selection:text-white pt-20 pb-24 md:pb-16 relative"
    >
      <Toaster position="top-right" richColors />

      {/* 1. TOP RACING STRIPE BAR & HEADER (FIXED STATIK MELEKAT + MOBILE HAMBURGER) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950 text-white border-b-4 border-red-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          
          {/* Logo & Identiti Sah */}
          <a
            href="/"
            onClick={() => tactileAudio.click()}
            className="flex items-center gap-3 group transition"
          >
            <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center font-mono font-black text-xl tracking-tighter border-2 border-white shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              FP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight uppercase text-white font-sans">
                  FP MOTOR
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-red-500 font-bold hidden sm:inline">
                  G ONE STOP ENT
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-bold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                <span className="truncate">Simpang 3 Kemboja, Jerlun, Kedah</span>
              </p>
            </div>
          </a>

          {/* Navigasi Utama Desktop */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-black uppercase tracking-wider">
            <a href="#showroom" onClick={() => tactileAudio.click()} className="hover:text-red-500 transition-colors">Showroom Motor</a>
            <a href="#jejak" onClick={() => tactileAudio.click()} className="text-red-500 hover:text-red-400 transition-colors flex items-center gap-1 font-black"><ShieldCheck className="w-3.5 h-3.5" /> Pasport & Servis</a>
            <a href="#katalog" onClick={() => tactileAudio.click()} className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 font-black"><ShoppingBag className="w-3.5 h-3.5" /> Katalog & Beg Kuning</a>
            <a href="#dyno-stage" onClick={() => tactileAudio.click()} className="hover:text-red-500 transition-colors">Simulator Dyno</a>
            <a href="#pit-radar" onClick={() => tactileAudio.click()} className="hover:text-red-500 transition-colors">Radar 4-Bay</a>
            <a href="#premis" onClick={() => tactileAudio.click()} className="hover:text-red-500 transition-colors">Peta Premis</a>
            <a href="#servis" onClick={() => tactileAudio.click()} className="hover:text-red-500 transition-colors">Tempah Slot</a>
          </nav>

          {/* Butang Tindakan Kanan */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Butang Beg Kuning */}
            <button
              type="button"
              onClick={() => {
                tactileAudio.click();
                setIsCartOpen(true);
              }}
              className="relative p-2.5 rounded-xl bg-amber-400 text-zinc-950 hover:bg-amber-300 border-2 border-zinc-950 transition cursor-pointer flex items-center gap-2 text-xs font-black shadow-sm active:scale-95"
              title="Buka Beg Kuning Pembelian"
            >
              <ShoppingBag className="w-4 h-4 text-zinc-950" />
              <span className="hidden sm:inline font-mono">Beg Kuning</span>
              {cart.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-zinc-950 text-white font-mono text-[10px] flex items-center justify-center font-black">
                  {cart.reduce((n, i) => n + i.quantity, 0)}
                </span>
              )}
            </button>

            {/* Login Staf (Tablet & Desktop) */}
            <a
              href="/#dashboard"
              onClick={() => tactileAudio.click()}
              className="hidden sm:flex px-3.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer items-center gap-1.5 shadow-sm active:scale-95"
            >
              <User className="w-4 h-4" />
              <span>Terminal Staf</span>
            </a>

            {/* Butang Hamburger Mobile (Skrin < lg) */}
            <button
              type="button"
              onClick={() => {
                tactileAudio.click();
                setIsMobileMenuOpen((prev) => !prev);
              }}
              className="lg:hidden p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white hover:bg-zinc-800 hover:border-red-500 transition cursor-pointer flex items-center justify-center shadow-sm active:scale-95"
              aria-label={isMobileMenuOpen ? "Tutup Menu Navigasi" : "Buka Menu Navigasi"}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-red-500" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          </div>

        </div>

        {/* Menu Hamburger Mobile Responsive Drawer Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t-2 border-zinc-800 bg-zinc-950 px-4 py-5 shadow-2xl space-y-4 max-h-[calc(100vh-80px)] overflow-y-auto">
            {/* Senarai Pautan Litar */}
            <div className="space-y-1.5 font-sans">
              <a
                href="#showroom"
                onClick={() => {
                  tactileAudio.click();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-900 hover:bg-red-600 text-white font-black text-sm uppercase tracking-wide transition border border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <Bike className="w-4 h-4 text-red-500" />
                  <span>Showroom Motosikal</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </a>

              <a
                href="#jejak"
                onClick={() => {
                  tactileAudio.click();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-900 hover:bg-red-600 text-white font-black text-sm uppercase tracking-wide transition border border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-red-500" />
                  <span>Pasport & Rekod Servis</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </a>

              <a
                href="#dyno-stage"
                onClick={() => {
                  tactileAudio.click();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-900 hover:bg-red-600 text-white font-black text-sm uppercase tracking-wide transition border border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-red-500" />
                  <span>Simulator Dyno Tuning</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </a>

              <a
                href="#pit-radar"
                onClick={() => {
                  tactileAudio.click();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-900 hover:bg-red-600 text-white font-black text-sm uppercase tracking-wide transition border border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <Wrench className="w-4 h-4 text-red-500" />
                  <span>Radar 4-Bay Pit Hoist</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </a>

              <a
                href="#katalog"
                onClick={() => {
                  tactileAudio.click();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-900 hover:bg-red-600 text-white font-black text-sm uppercase tracking-wide transition border border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400">Katalog & Beg Kuning</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </a>

              <a
                href="#premis"
                onClick={() => {
                  tactileAudio.click();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-900 hover:bg-red-600 text-white font-black text-sm uppercase tracking-wide transition border border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>Peta Premis Kemboja</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </a>

              <a
                href="#servis"
                onClick={() => {
                  tactileAudio.click();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-900 hover:bg-red-600 text-white font-black text-sm uppercase tracking-wide transition border border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-red-500" />
                  <span>Tempah Slot Servis</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </a>
            </div>

            {/* Tindakan Pantas Staf & Hubungan */}
            <div className="pt-2 border-t border-zinc-800 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://wa.me/60124809979?text=Salam%20FP%20Motor,%20saya%20ingin%20bertanya%20mengenai%20servis/motor."
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => tactileAudio.click()}
                  className="p-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase flex items-center justify-center gap-1.5 tracking-wider transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href="tel:+60124809979"
                  onClick={() => tactileAudio.click()}
                  className="p-3 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-black text-xs uppercase flex items-center justify-center gap-1.5 tracking-wider transition"
                >
                  <Phone className="w-3.5 h-3.5 text-red-600" />
                  <span>Panggil</span>
                </a>
              </div>

              <a
                href="/#dashboard"
                onClick={() => {
                  tactileAudio.click();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase flex items-center justify-center gap-2 tracking-wider transition"
              >
                <User className="w-4 h-4" />
                <span>Akses Terminal Staf Bengkel</span>
              </a>
            </div>

            {/* Info Sah Syarikat */}
            <div className="pt-2 text-[11px] font-mono text-zinc-400 space-y-0.5">
              <p className="font-bold text-white uppercase">FP MOTOR (G ONE STOP ENT)</p>
              <p>No. 629, Simpang 3 Kemboja, 06150 Jerlun, Kedah</p>
              <p className="text-zinc-500">Sabtu - Khamis: 9:00 AM - 7:00 PM | Jumaat: Tutup</p>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO MOTORSPORT RACING SECTION (3-LAYER PARALLAX DEPTH) */}
      <section className="relative bg-zinc-950 text-white pt-14 pb-20 px-4 sm:px-6 overflow-hidden border-b-4 border-red-600 space-y-12">
        
        {/* PARALLAX LAYER 1: Garisan Grid Litar & Telemetri Latar Belakang */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20 will-change-transform"
          style={{
            transform: "translate3d(calc(var(--px, 0) * -18px), calc(var(--py, 0) * -14px), 0)",
          }}
          aria-hidden
        />

        {/* PARALLAX LAYER 2: Garisan Pit Aksen Merah */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 border-4 border-red-600/30 rounded-full pointer-events-none will-change-transform"
          style={{
            transform: "translate3d(calc(var(--px, 0) * 22px), calc(var(--py, 0) * 16px), 0)",
          }}
          aria-hidden
        />

        <div className="max-w-7xl mx-auto relative z-10 space-y-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Kolum Teks Utama (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/20 border-2 border-red-500 text-red-400 text-xs font-mono font-black uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                <span>Pusat Motosikal & Penalaan Prestasi No. 1 Jerlun</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-none text-white font-sans">
                KEPAKARAN PRESTASI. <br />
                <span className="text-red-600">SHOWROOM & PIT</span> BENGKEL SEBENAR.
              </h1>

              <p className="text-sm sm:text-base text-zinc-300 font-bold max-w-2xl leading-relaxed">
                Selamat datang ke portal rasmi <span className="text-white font-black underline decoration-red-600">FP MOTOR (G ONE STOP ENT)</span> di Simpang 3 Kemboja, Jerlun. Kami menyediakan jualan unit motosikal berkualiti tinggi, modifikasi khusus, alat ganti 100% tulen, dan servis pantas 4-Bay lif hoist.
              </p>

              {/* Butang Tindakan Pantas */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#jejak"
                  onClick={() => tactileAudio.click()}
                  className="px-6 py-3.5 rounded-2xl bg-zinc-900 border-2 border-red-600 hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4 text-red-500" />
                  <span>Semak Pasport & Rekod Servis</span>
                </a>

                <a
                  href="#showroom"
                  className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Bike className="w-4 h-4" />
                  <span>Jelajah Showroom Motor</span>
                </a>

                <a
                  href="#servis"
                  className="px-6 py-3.5 rounded-2xl bg-white text-zinc-950 hover:bg-zinc-100 font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Wrench className="w-4 h-4 text-red-600" />
                  <span>Tempah Servis Hoist</span>
                </a>

                <a
                  href="https://wa.me/60124809979"
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3.5 rounded-2xl bg-zinc-900 border-2 border-zinc-700 hover:border-emerald-500 text-emerald-400 font-black text-xs uppercase tracking-wider transition flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-emerald-500" />
                  <span>WhatsApp: 012-480 9979</span>
                </a>
              </div>

              {/* PARALLAX LAYER 3: Lencana Kedalaman 3D Terapung */}
              <div
                className="grid grid-cols-3 gap-3 pt-6 border-t-2 border-zinc-800 text-xs will-change-transform"
                style={{
                  transform: "translate3d(calc(var(--px, 0) * 12px), calc(var(--py, 0) * 8px), 0)",
                }}
              >
                <div className="p-3 bg-black/60 border border-zinc-800 rounded-2xl">
                  <span className="font-mono text-xl sm:text-2xl font-black text-red-600 block">4-BAY</span>
                  <span className="text-zinc-400 font-bold text-[11px]">Hydraulic Pit Lif Hoist</span>
                </div>
                <div className="p-3 bg-black/60 border border-zinc-800 rounded-2xl">
                  <span className="font-mono text-xl sm:text-2xl font-black text-white block">100%</span>
                  <span className="text-zinc-400 font-bold text-[11px]">Alat Ganti Asli & Tulen</span>
                </div>
                <div className="p-3 bg-black/60 border border-zinc-800 rounded-2xl">
                  <span className="font-mono text-xl sm:text-2xl font-black text-emerald-400 block">48 JAM</span>
                  <span className="text-zinc-400 font-bold text-[11px]">Kunci Unit Deposit RM300</span>
                </div>
              </div>

            </div>

            {/* Kolum Kotak Carian Telemetri 1-Klik (5 Cols) */}
            <div id="jejak" className="lg:col-span-5 bg-white text-zinc-950 p-6 sm:p-8 rounded-3xl border-4 border-red-600 shadow-2xl space-y-5">
              
              <div className="border-b-2 border-zinc-200 pb-3">
                <span className="text-[10px] font-mono font-black uppercase text-red-600 tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-red-600" />
                  TELEMETRI BENGKEL MASA NYATA
                </span>
                <h3 className="text-lg font-black uppercase tracking-tight mt-1">
                  Semak Pasport & Status Motor Anda
                </h3>
                <p className="text-xs text-zinc-700 font-bold mt-0.5">
                  Masukkan No. Plat motosikal anda untuk menyemak rekod servis rasmi atau status kerja pembaikan semasa.
                </p>
              </div>

              <form onSubmit={handleQuickTrack} className="space-y-3">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-zinc-900 block mb-1">
                    No. Plat Pendaftaran Motosikal:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="CONTOH: KEE 8899"
                      value={quickPlate}
                      onChange={(e) => setQuickPlate(e.target.value.toUpperCase())}
                      className="w-full bg-zinc-50 border-2 border-zinc-950 rounded-2xl px-4 py-3.5 text-base font-mono font-black uppercase text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-600 tracking-wider"
                      required
                    />
                    <button
                      type="submit"
                      disabled={searchingPlate}
                      className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                    >
                      {searchingPlate ? (
                        <span>Menyemak...</span>
                      ) : (
                        <>
                          <Search className="w-3.5 h-3.5" />
                          <span>Semak</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Paparan Keputusan Carian Telemetri */}
              {trackResult && (
                <div className="p-4 rounded-2xl bg-zinc-50 border-2 border-zinc-300 space-y-3 animate-in fade-in duration-200">
                  {trackResult.found ? (
                    <>
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                        <span className="font-mono font-black text-sm text-red-600">
                          {trackResult.plateNumber || quickPlate}
                        </span>
                        <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {trackResult.vehicle?.model || "Rekod dijumpai"}
                        </span>
                      </div>

                      {trackResult.activeWorkOrder ? (
                        <div className="space-y-1 text-xs">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase block">Status Pembaikan Semasa:</span>
                          <p className="font-black text-zinc-950 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                            <span>{trackResult.activeWorkOrder.status?.replace("_", " ").toUpperCase()}</span>
                          </p>
                          <p className="text-zinc-600 font-bold">{trackResult.activeWorkOrder.customerComplaint}</p>
                        </div>
                      ) : (
                        <div className="text-xs text-zinc-700 font-bold">
                          Tiada kerja pembaikan aktif hari ini. Motosikal sedia untuk tunggangan selamat.
                        </div>
                      )}

                      {trackResult.passportUrl && (
                        <div className="pt-2 border-t border-zinc-200">
                          <button
                            type="button"
                            onClick={() => {
                              tactileAudio.click();
                              setViewingPassportPlate(trackResult.plateNumber || quickPlate);
                            }}
                            className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
                          >
                            <Wrench className="w-4 h-4" />
                            <span>Buka Buku Servis Digital & Pasport Lengkap</span>
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{trackResult.found === false ? (trackResult.message || "Rekod nombor plat tidak dijumpai.") : (trackResult.message || "Semakan gagal.")}</span>
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>

          {/* PANGGUNG 3D JENTERA UTAMA & SIMULATOR DERUMAN ENJIN */}
          <HeroMotorsportStage
            onSelectDeposit={(bikeId, model, price) => {
              const matched = motorcycles.find((m) => m.id === bikeId) || {
                id: bikeId,
                brand: "YAMAHA",
                model,
                color: "Edisi Khas",
                condition: "new" as const,
                sellingPrice: price,
                shots: [],
              };
              setSelectedBikeForDeposit(matched);
            }}
            onOpen360={(bikeId) => {
              const matched = motorcycles.find((m) => m.id === bikeId);
              if (matched) {
                setViewing360Bike(matched);
              } else {
                toast.info("Memuatkan sudut studio jentera...");
              }
            }}
          />

        </div>

      </section>

      {/* 3. SHOWROOM MOTOR (GALERI 3D PARALLAX & KALKULATOR ANSURAN) */}
      <section id="showroom" className="scroll-mt-24 py-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
        
        {/* Tajuk Seksyen & Penapis */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-zinc-950 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-900 text-xs font-mono font-black uppercase mb-1">
              <Bike className="w-3.5 h-3.5 text-red-600" />
              <span>SHOWROOM MOTOR BERKUALITI TINGGI</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-zinc-950">
              Motosikal Sedia Pandu Uji
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 font-bold">
              Pilih jualan baru atau trade-in. Unit tidak bertukar milik sehingga kerani semak dokumen dan pengarah lulus.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => { tactileAudio.click(); setSaleKind("baru"); }} className="px-4 py-2 rounded-xl bg-zinc-950 text-white text-xs font-black uppercase">Jualan baru</button>
              <button type="button" onClick={() => { tactileAudio.click(); setSaleKind("trade-in"); }} className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-black uppercase">Trade-in</button>
            </div>
          </div>

          {/* Penapis Jenama & Kondisi */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Penapis Kondisi */}
            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => { tactileAudio.click(); setSelectedCondition("all"); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black transition cursor-pointer ${
                  selectedCondition === "all" ? "bg-zinc-950 text-white" : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => { tactileAudio.click(); setSelectedCondition("new"); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black transition cursor-pointer ${
                  selectedCondition === "new" ? "bg-zinc-950 text-white" : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                Unit Baru
              </button>
              <button
                type="button"
                onClick={() => { tactileAudio.click(); setSelectedCondition("used"); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black transition cursor-pointer ${
                  selectedCondition === "used" ? "bg-zinc-950 text-white" : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                Terpakai
              </button>
            </div>

            {/* Penapis Jenama */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none snap-x">
              {bikeBrands.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => { tactileAudio.click(); setSelectedBrand(b); }}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs font-mono font-black uppercase transition shrink-0 cursor-pointer snap-start ${
                    selectedBrand === b
                      ? "bg-red-600 text-white shadow-sm"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        
        {saleKind && (
          <form className="bg-white border-4 border-zinc-950 rounded-3xl p-4 grid gap-3 sm:grid-cols-2" onSubmit={async (e) => {
            e.preventDefault();
            setSaleMsg("Menghantar...");
            try {
              const res = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customerName: saleName, customerPhone: salePhone, targetItem: saleNote, type: saleKind === "baru" ? "bike_purchase" : "trade_in", notes: saleKind }) });
              const data = await res.json().catch(() => ({}));
              setSaleMsg(res.ok ? "Permohonan direkod. Kerani akan semak. Unit belum terjual." : (data.message || "Ditolak."));
            } catch {
              setSaleMsg("Pelayan tidak menjawab.");
            }
          }}>
            <p className="sm:col-span-2 text-sm font-black">{saleKind === "baru" ? "Permohonan jualan baru" : "Permohonan trade-in"}</p>
            <input className="border-2 border-zinc-300 rounded-xl px-3 py-2 text-sm" placeholder="Nama" value={saleName} onChange={(e) => setSaleName(e.target.value)} required />
            <input className="border-2 border-zinc-300 rounded-xl px-3 py-2 text-sm" placeholder="Telefon" value={salePhone} onChange={(e) => setSalePhone(e.target.value)} required />
            <input className="sm:col-span-2 border-2 border-zinc-300 rounded-xl px-3 py-2 text-sm" placeholder={saleKind === "baru" ? "Unit yang diminta" : "Model motor trade-in dan tahun"} value={saleNote} onChange={(e) => setSaleNote(e.target.value)} required />
            <button className="sm:col-span-2 rounded-xl bg-zinc-950 text-white text-xs font-black uppercase py-2" type="submit">Hantar kepada kerani</button>
            {saleMsg && <p className="sm:col-span-2 text-xs font-bold">{saleMsg}</p>}
          </form>
        )}

        {/* Grid Kad Motosikal 3D */}
        {loading ? (
          <div className="py-20 text-center text-xs font-mono font-bold text-zinc-500">
            Memuatkan unit motosikal showroom...
          </div>
        ) : filteredBikes.length === 0 ? (
          <div className="py-16 text-center text-xs font-bold text-zinc-500 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-300">
            Tiada unit motosikal sepadan dengan penapis yang dipilih.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredBikes.map((bike) => {
              const mainShot = bike.shots?.[0]?.image || "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=900&q=80";
              const isLoanCalcOpen = activeLoanCalcBikeId === bike.id;

              return (
                <TiltCard3D key={bike.id} className="h-full">
                  <div className="bg-white rounded-3xl border-4 border-zinc-950 overflow-hidden shadow-xl flex flex-col justify-between h-full group hover:border-red-600 transition-colors">
                    
                    {/* Bahagian Atas & Gambar */}
                    <div>
                      {/* Gambar dengan Lencana Sudut Studio */}
                      <div className="relative aspect-16/10 bg-zinc-100 overflow-hidden border-b-2 border-zinc-200">
                        <img
                          src={mainShot}
                          alt={bike.model}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />

                        {/* Lencana Status Unit */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                          <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-full shadow-sm ${
                            bike.condition === "new"
                              ? "bg-zinc-950 text-white"
                              : "bg-red-600 text-white"
                          }`}>
                            {bike.condition === "new" ? "UNIT BAHARU" : "TERPAKAI GRED A"}
                          </span>

                          {bike.held && (
                            <span className="text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-full bg-amber-500 text-zinc-950">
                              DITAHAN 48 JAM
                            </span>
                          )}
                        </div>

                        {/* Butang Pintas 360 Studio */}
                        <button
                          type="button"
                          onClick={() => {
                            tactileAudio.click();
                            setViewing360Bike(bike);
                          }}
                          className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/85 hover:bg-red-600 text-white font-mono font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition cursor-pointer backdrop-blur-xs"
                        >
                          <RotateCcw className="w-3 h-3 text-red-500 group-hover:text-white" />
                          <span>8 Sudut 360°</span>
                        </button>
                      </div>

                      {/* Maklumat Motosikal */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-black text-red-600 uppercase tracking-wider">
                            {bike.brand}
                          </span>
                          <span className="text-xs font-mono text-zinc-500 font-bold">
                            {bike.year || 2024} · {bike.color}
                          </span>
                        </div>

                        <h3 className="text-lg font-black text-zinc-950 leading-tight">
                          {bike.model}
                        </h3>

                        {/* Harga & Toggle Kalkulator Ansuran */}
                        <div className="pt-2 border-t border-zinc-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Harga Jualan</span>
                            <span className="text-2xl font-mono font-black text-zinc-950">
                              RM {bike.sellingPrice.toLocaleString()}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              tactileAudio.click();
                              setActiveLoanCalcBikeId(isLoanCalcOpen ? null : bike.id);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black border-2 transition cursor-pointer flex items-center gap-1.5 ${
                              isLoanCalcOpen
                                ? "bg-red-600 border-red-600 text-white"
                                : "bg-zinc-100 border-zinc-300 text-zinc-900 hover:border-zinc-950"
                            }`}
                          >
                            <Calculator className="w-3.5 h-3.5" />
                            <span>{isLoanCalcOpen ? "Tutup Kiraan" : "Kira Ansuran"}</span>
                          </button>
                        </div>

                        {/* Panel Kalkulator Ansuran On-Card */}
                        {isLoanCalcOpen && (
                          <div className="pt-2 animate-in fade-in duration-200">
                            <BikeLoanCalculator
                              sellingPrice={bike.sellingPrice}
                              bikeModel={`${bike.brand} ${bike.model}`}
                            />
                          </div>
                        )}

                      </div>
                    </div>

                    {/* Butang Tindakan Bawah (3 Butang: Lihat Sudut, Banding, Kunci RM300) */}
                    <div className="p-5 pt-0 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            tactileAudio.click();
                            setViewing360Bike(bike);
                          }}
                          className="py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-black uppercase tracking-wider transition text-center cursor-pointer"
                        >
                          Lihat Sudut
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            tactileAudio.click();
                            setCompareBikeId(bike.id);
                          }}
                          className="py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider transition text-center cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5 text-red-500" />
                          <span>Banding</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          tactileAudio.click();
                          setSelectedBikeForDeposit(bike);
                        }}
                        className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition text-center shadow-md active:scale-95 cursor-pointer"
                      >
                        Kunci Unit (Deposit RM300)
                      </button>
                    </div>

                  </div>
                </TiltCard3D>
              );
            })}
          </div>
        )}

      </section>

      {/* 4. SIMULATOR PENALAAN DYNO PIT BAY 3 */}
      <section id="dyno-stage" className="scroll-mt-24 py-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <DynoTuningSimulator />
      </section>

      {/* 5. RADAR PANTAU STATUS 4-BAY LIF HOIST BENGKEL (LIVE PIT BOARD) */}
      <section id="pit-radar" className="scroll-mt-24 py-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <LivePitRadar />
      </section>

      {/* 6. KATALOG RAK ALAT GANTI & BEG KUNING (3D CARDS & SOUND CUES & SERIAL CHECK) */}
      <section id="katalog" className="scroll-mt-24 py-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
        <div id="ecommerce" />
        
        {/* Header Seksyen Alat Ganti */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-zinc-950 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-zinc-950 text-xs font-mono font-black uppercase mb-1">
              <ShoppingBag className="w-3.5 h-3.5 text-zinc-950" />
              <span>KATALOG ALAT GANTI & BEG KUNING</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-zinc-950">
              Rak Alat Ganti & Beg Kuning
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 font-bold">
              100% Tulen Hong Leong Yamaha, Boon Siew Honda, D.I.D Japan, Motul, dan Racing Boy.
            </p>
          </div>

          {/* Penapis Kategori Produk (Horizontal Snap Scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x">
            {productCategories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => { tactileAudio.click(); setSelectedCategory(c); }}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-mono font-black uppercase transition shrink-0 cursor-pointer snap-start ${
                  selectedCategory === c
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* WIDGET INTERAKTIF: SEMAKAN KOD SIRI KEASLIAN BARANGAN */}
        <div className="p-5 sm:p-6 bg-zinc-950 text-white rounded-3xl border-2 border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <Key className="w-5 h-5 text-red-500" />
              <div>
                <span className="text-[10px] font-mono font-black uppercase text-red-500">PENGESAHAN KETULENAN BARANGAN</span>
                <h4 className="text-base font-black text-white">Semak Kod Siri Keaslian Alat Ganti</h4>
              </div>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">
              Contoh Kod Sah: <strong className="text-white">YAM-2026-987621</strong> atau <strong className="text-white">DID-JPN-7733190</strong>
            </span>
          </div>

          <form onSubmit={handleVerifySerial} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Masukkan Kod Siri Unik (cth: YAM-2026-987621)"
              value={serialInput}
              onChange={(e) => setSerialInput(e.target.value.toUpperCase())}
              className="flex-1 bg-black border-2 border-zinc-700 rounded-2xl px-4 py-3 text-xs font-mono font-black text-white outline-none focus:border-red-600 tracking-wider"
              required
            />
            <button
              type="submit"
              disabled={verifyingSerial}
              className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-mono font-black text-xs uppercase tracking-wider transition active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
            >
              {verifyingSerial ? "Mengesahkan..." : "Sahkan Keaslian"}
            </button>
          </form>

          {/* Keputusan Semakan Siri */}
          {serialResult && (
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs font-mono">
              {serialResult.success && serialResult.verified ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 font-black">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ALAT GANTI DISAHKAN 100% TULEN & BERDAFTAR</span>
                  </div>
                  <p className="text-white font-bold">{serialResult.product?.name || serialResult.serial?.productName}</p>
                  <p className="text-zinc-400 text-[11px]">
                    Pembekal Sah: <strong className="text-white">{serialResult.serial?.supplierName || "Pengedar Rasmi Sah"}</strong> · Kod Siri: <strong className="text-white">{serialResult.serial?.serialNumber || serialInput}</strong>
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-400 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{serialResult.message || "Kod siri tidak dijumpai di pangkalan data pengedar rasmi."}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Grid Kad Alat Ganti 3D */}
        {loading ? (
          <div className="py-20 text-center text-xs font-mono font-bold text-zinc-500">
            Memuatkan senarai alat ganti...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-xs font-bold text-zinc-500 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-300">
            Tiada alat ganti ditemui untuk kategori ini.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((p) => {
              const partImg = p.shots?.[0]?.image || "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80";

              return (
                <TiltCard3D key={p.id} maxTilt={8} className="h-full">
                  <div className="bg-white rounded-3xl border-2 sm:border-4 border-zinc-950 overflow-hidden shadow-lg flex flex-col justify-between h-full group hover:border-red-600 transition-colors">
                    
                    <div>
                      {/* Foto Produk */}
                      <div className="relative aspect-square bg-zinc-100 overflow-hidden border-b-2 border-zinc-200">
                        <img
                          src={partImg}
                          alt={p.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <span className="absolute top-2 left-2 text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded bg-zinc-950 text-white">
                          {p.category}
                        </span>

                        {p.rackLocation && (
                          <span className="absolute bottom-2 left-2 text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded bg-white/90 text-zinc-950 border border-zinc-300">
                            {p.rackLocation}
                          </span>
                        )}
                      </div>

                      {/* Info & Harga */}
                      <div className="p-3 sm:p-4 space-y-1.5">
                        <span className="text-[10px] font-mono font-black text-red-600 uppercase block">
                          {p.brand}
                        </span>
                        <h4 className="font-black text-xs sm:text-sm text-zinc-950 line-clamp-2 leading-tight">
                          {p.name}
                        </h4>
                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-base sm:text-lg font-mono font-black text-zinc-950">
                            RM {p.sellingPrice.toFixed(2)}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-800 font-bold">
                            {p.availableQty > 0 ? `${p.availableQty} Stok` : "Habis"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Butang Tambah ke Beg */}
                    <div className="p-3 sm:p-4 pt-0">
                      <button
                        type="button"
                        onClick={() => addToCart(p)}
                        disabled={p.availableQty <= 0}
                        className="w-full py-2.5 rounded-xl bg-zinc-950 hover:bg-red-600 text-white text-[11px] font-black uppercase tracking-wider transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Tambah ke Beg</span>
                      </button>
                    </div>

                  </div>
                </TiltCard3D>
              );
            })}
          </div>
        )}

      </section>

      {/* 7. PETA INTERAKTIF PREMIS NO. 629 SIMPANG 3 KEMBOJA */}
      <section id="premis" className="scroll-mt-24 py-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <PremiseFloorplan />
      </section>

      {/* 8. TEMPAHAN SLOT SERVIS BENGKEL */}
      <section id="servis" className="scroll-mt-24 py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="bg-zinc-100 rounded-3xl border-4 border-zinc-950 p-6 sm:p-10 space-y-8">
          
          <div className="border-b-2 border-zinc-300 pb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-mono font-black uppercase mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>TEMPAHAN SERVIS 4-BAY LIF HOIST</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-950">
              Tempah Masa Anda Tanpa Menunggu Lama
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 font-bold">
              Pilih tarikh dan masa yang bersesuaian. Mekanik kami akan bersedia di bay pada waktu tersebut.
            </p>
          </div>

          <form onSubmit={handleSlotBooking} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Tarikh & Slot Masa */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase text-zinc-900 block mb-1.5">
                    1. Pilih Tarikh Servis:
                  </label>
                  <input
                    type="date"
                    value={slotDate}
                    onChange={(e) => setSlotDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                    className="w-full bg-white border-2 border-zinc-950 rounded-2xl px-4 py-3 text-sm font-mono font-black text-zinc-950"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-zinc-900 block mb-1.5">
                    2. Pilih Waktu Masa:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["09:00", "10:30", "12:00", "14:30", "16:00", "17:30"].map((time) => {
                      const isSelected = slotTime === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => { tactileAudio.click(); setSlotTime(time); }}
                          className={`py-2.5 rounded-xl text-xs font-mono font-black border-2 transition cursor-pointer ${
                            isSelected
                              ? "bg-red-600 border-red-600 text-white shadow-sm"
                              : "bg-white border-zinc-300 text-zinc-900 hover:border-zinc-950"
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Butiran Motosikal & Pelanggan */}
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-black uppercase text-zinc-900 block mb-1">Nama Pemilik:</label>
                  <input
                    type="text"
                    placeholder="Nama Anda"
                    value={bookingForm.name}
                    onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                    className="w-full bg-white border-2 border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-zinc-900 block mb-1">No. Telefon WhatsApp:</label>
                  <input
                    type="tel"
                    placeholder="cth: 0123456789"
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                    className="w-full bg-white border-2 border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-zinc-900 block mb-1">No. Plat Motosikal:</label>
                  <input
                    type="text"
                    placeholder="cth: KEE 8899"
                    value={bookingForm.plate}
                    onChange={(e) => setBookingForm({ ...bookingForm, plate: e.target.value.toUpperCase() })}
                    className="w-full bg-white border-2 border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono font-black uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-zinc-900 block mb-1">Jenis Servis / Aduan:</label>
                  <input
                    type="text"
                    placeholder="cth: Servis Minyak + Belting CVT"
                    value={bookingForm.serviceType}
                    onChange={(e) => setBookingForm({ ...bookingForm, serviceType: e.target.value })}
                    className="w-full bg-white border-2 border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold"
                    required
                  />
                </div>
              </div>

            </div>

            <button
              type="submit"
              disabled={submittingSlot}
              className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submittingSlot ? "Merekodkan Slot..." : "Sahkan Tempahan Slot Bengkel"}</span>
            </button>
          </form>

        </div>
      </section>

      {/* 9. FOOTER RASMI KORPORAT */}
      <footer id="korporat" className="mt-16 bg-zinc-950 text-white border-t-4 border-red-600 pt-16 pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black uppercase text-white">FP MOTOR</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-600 text-white font-bold">
                G ONE STOP ENT
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-bold max-w-sm leading-relaxed">
              Showroom jualan motosikal prestasi, pusat servis lif hoist bersepadu, dan pembekal alat ganti tulen di Simpang 3 Kemboja, Jerlun.
            </p>
            <p className="text-xs text-zinc-400 font-bold flex items-center gap-1.5 pt-2">
              <Phone className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>WhatsApp Hotline: <strong>+60 12-480 9979</strong> (Fauzi Pazil)</span>
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-mono font-black uppercase tracking-wider text-red-500">Lokasi Premis</h4>
            <p className="text-xs text-zinc-400 font-bold leading-relaxed">
              No. 629, Simpang 3 Kemboja,<br />
              06150 Jerlun / Jitra,<br />
              Kedah Darul Aman, Malaysia.
            </p>
            <a
              href="https://maps.google.com/?q=Simpang+3+Kemboja+Jerlun"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-black text-white hover:text-red-500 flex items-center gap-1 pt-1"
            >
              <span>Buka Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-mono font-black uppercase tracking-wider text-red-500">Pautan Staf</h4>
            <ul className="text-xs space-y-1.5 text-zinc-400 font-bold">
              <li><a href="/#dashboard" className="hover:text-white transition">Terminal Staf PIN</a></li>
              <li><a href="/#pos-checkout" className="hover:text-white transition">Kaunter POS Checkout</a></li>
              <li><a href="/#inventory" className="hover:text-white transition">Pengurusan Stor & Rak</a></li>
              <li><a href="/#pit-live" className="hover:text-white transition">Monitor Pit Hoist 4-Bay</a></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500 font-mono font-bold">
          <span>&copy; {new Date().getFullYear()} FP MOTOR (G ONE STOP ENT). Hak Cipta Terpelihara.</span>
          <span>Standard Emas Operasi Bengkel & Jualan Motosikal</span>
        </div>
      </footer>

      {/* MODAL 1: PREVIEW SUDUT 360 INTERAKTIF */}
      {viewing360Bike && (
        <Interactive360Viewer
          shots={viewing360Bike.shots}
          bikeTitle={viewing360Bike.model}
          brand={viewing360Bike.brand}
          sellingPrice={viewing360Bike.sellingPrice}
          condition={viewing360Bike.condition}
          onClose={() => setViewing360Bike(null)}
          onBookDeposit={() => {
            setSelectedBikeForDeposit(viewing360Bike);
            setViewing360Bike(null);
          }}
        />
      )}

      {/* MODAL 2: BANDINGKAN 2 JENTERA (BIKE COMPARE MODAL) */}
      {compareBikeId && (
        <BikeCompareModal
          initialBikeId={compareBikeId}
          onClose={() => setCompareBikeId(null)}
          onSelectDeposit={(bikeId, model, price) => {
            const matched = motorcycles.find((m) => m.id === bikeId) || {
              id: bikeId,
              brand: "HONDA",
              model,
              color: "Pilihan",
              condition: "new" as const,
              sellingPrice: price,
              shots: [],
            };
            setSelectedBikeForDeposit(matched);
            setCompareBikeId(null);
          }}
        />
      )}

      {/* MODAL 3: TEMPAHAN DEPOSIT MOTOSIKAL (RM300 - 48 JAM) */}
      {selectedBikeForDeposit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedBikeForDeposit(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border-4 border-zinc-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-200">
              <div>
                <span className="text-[10px] font-mono font-black uppercase text-red-600">KUNCI UNIT MOTOR (48 JAM)</span>
                <h3 className="text-lg font-black text-zinc-950">{selectedBikeForDeposit.model}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBikeForDeposit(null)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-5 h-5 text-zinc-600" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 text-white space-y-1.5">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Deposit RM300</span>
              <p className="text-sm font-black text-white">Bayar hanya ke akaun yang kaunter sahkan di WhatsApp.</p>
              <p className="text-[11px] text-zinc-300 font-bold">Nombor akaun tidak dipaparkan di laman ini. Hantar rujukan slip selepas pemindahan.</p>
              <div className="pt-2 border-t border-zinc-800 flex justify-between text-xs">
                <span className="text-zinc-400">Jumlah Deposit:</span>
                <span className="font-mono font-black text-red-500">RM 300.00</span>
              </div>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-black uppercase text-zinc-900 block mb-1">Nama Penuh Pembeli:</label>
                <input
                  type="text"
                  placeholder="cth: Muhammad Danial"
                  value={depositForm.name}
                  onChange={(e) => setDepositForm({ ...depositForm, name: e.target.value })}
                  className="w-full bg-zinc-50 border-2 border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-zinc-900 block mb-1">No. Telefon WhatsApp:</label>
                <input
                  type="tel"
                  placeholder="cth: 0123456789"
                  value={depositForm.phone}
                  onChange={(e) => setDepositForm({ ...depositForm, phone: e.target.value })}
                  className="w-full bg-zinc-50 border-2 border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-zinc-900 block mb-1">No. Rujukan Slip Bank:</label>
                <input
                  type="text"
                  placeholder="cth: MBB-98765432"
                  value={depositForm.slipRef}
                  onChange={(e) => setDepositForm({ ...depositForm, slipRef: e.target.value })}
                  className="w-full bg-zinc-50 border-2 border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  minLength={4}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submittingDeposit}
                className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition shadow-md active:scale-95 cursor-pointer mt-2"
              >
                {submittingDeposit ? "Menghantar..." : "Hantar Pengesahan Deposit RM300"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: TROLI BEG E-COMMERCE (DRAWER DI DESKTOP / BOTTOM SHEET DI MOBILE) */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end md:items-stretch items-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsCartOpen(false)}
        >
          <aside
            className="w-full md:max-w-md bg-white p-5 sm:p-6 flex flex-col justify-between overflow-y-auto max-h-[90vh] md:max-h-full rounded-t-3xl md:rounded-none shadow-2xl safe-area-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Grab Bar di Mobile */}
              <div className="w-12 h-1.5 bg-zinc-300 rounded-full mx-auto mb-3 md:hidden" />

              <div className="flex items-center justify-between pb-4 border-b-2 border-zinc-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center font-black shadow-xs">
                    <ShoppingBag className="w-4 h-4 text-zinc-950" />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase text-zinc-950">Beg Kuning Pembelian</h3>
                    <span className="text-[10px] text-zinc-500 font-bold block">FP Motor Jerlun</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-zinc-100 cursor-pointer"
                >
                  <X className="w-5 h-5 text-zinc-600" />
                </button>
              </div>

              {/* Senarai Item Beg Kuning */}
              <div className="py-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-xs font-bold text-zinc-500">
                    Beg Kuning anda masih kosong. Pilih alat ganti di katalog atas.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <h4 className="font-black text-zinc-950">{item.product.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-zinc-600 font-bold">
                            RM {item.product.sellingPrice.toFixed(2)}
                          </span>
                          {/* Stepper Kuantiti */}
                          <div className="inline-flex items-center gap-1 border border-zinc-300 rounded-lg px-1.5 py-0.5 bg-white">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.product.id, -1)}
                              className="text-zinc-600 hover:text-black font-black text-xs px-1"
                            >
                              -
                            </button>
                            <span className="font-mono font-black text-zinc-950 px-1">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.product.id, 1)}
                              className="text-zinc-600 hover:text-black font-black text-xs px-1"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-red-600">
                          RM {(item.product.sellingPrice * item.quantity).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-zinc-400 hover:text-red-600 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Borang Checkout & Ringkasan */}
            {cart.length > 0 && (
              <form onSubmit={handleCheckoutSubmit} className="pt-4 border-t-2 border-zinc-200 space-y-3">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-zinc-900 block">Pilihan Pengambilan:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutForm({ ...checkoutForm, fulfillment: "pickup" })}
                      className={`p-2 rounded-xl text-xs font-black border-2 transition ${
                        checkoutForm.fulfillment === "pickup"
                          ? "bg-zinc-950 text-white border-zinc-950"
                          : "bg-white text-zinc-700 border-zinc-200"
                      }`}
                    >
                      Pickup Jerlun (RM0)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCheckoutForm({ ...checkoutForm, fulfillment: "delivery" })}
                      className={`p-2 rounded-xl text-xs font-black border-2 transition ${
                        checkoutForm.fulfillment === "delivery"
                          ? "bg-zinc-950 text-white border-zinc-950"
                          : "bg-white text-zinc-700 border-zinc-200"
                      }`}
                    >
                      Pos Kurier (+RM15)
                    </button>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Nama Pembeli"
                    value={checkoutForm.name}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold"
                    required
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    placeholder="No Telefon WhatsApp"
                    value={checkoutForm.phone}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                    required
                  />
                </div>

                {checkoutForm.fulfillment === "delivery" && (
                  <div>
                    <textarea
                      placeholder="Alamat Lengkap Penghantaran Pos"
                      value={checkoutForm.address}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold"
                      rows={2}
                      required
                    />
                  </div>
                )}

                <div className="pt-2 border-t border-zinc-200 flex justify-between items-center text-sm font-black">
                  <span>Jumlah Bayaran:</span>
                  <span className="font-mono text-red-600 text-lg">RM {grandTotalCart.toFixed(2)}</span>
                </div>

                <button
                  type="submit"
                  disabled={submittingCheckout}
                  className="w-full py-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-md"
                >
                  {submittingCheckout ? "Memproses..." : "Hantar Pesanan ke Kaunter"}
                </button>
              </form>
            )}
          </aside>
        </div>
      )}

      {/* 9. WIDGET TERAPUNG BEG KUNING (DESKTOP & TABLET) */}
      <div className="fixed bottom-6 right-6 z-40 hidden sm:block">
        <button
          type="button"
          onClick={() => {
            tactileAudio.click();
            setIsCartOpen(true);
          }}
          className="flex items-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black rounded-full px-5 py-3.5 shadow-2xl transition hover:scale-105 active:scale-95 cursor-pointer border-2 border-zinc-950"
          title="Buka Beg Kuning Pembelian"
        >
          <ShoppingBag className="w-5 h-5 text-zinc-950" />
          <span className="text-xs uppercase font-mono font-black tracking-wider">Beg Kuning</span>
          <span className="bg-zinc-950 text-white rounded-full px-2 py-0.5 text-xs font-mono font-black">
            {cart.reduce((n, i) => n + i.quantity, 0)}
          </span>
        </button>
      </div>

      {/* 10. FLOATING ACTION DOCK UNTUK MOBILE */}
      <MobileActionDock
        cartCount={cart.reduce((n, i) => n + i.quantity, 0)}
        onOpenCart={() => {
          tactileAudio.click();
          setIsCartOpen(true);
        }}
      />

      {/* 11. MODAL DIGITAL PASSPORT & SEJARAH SERVIS (PLAN A) */}
      {viewingPassportPlate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl border-4 border-zinc-950 p-5 sm:p-8 max-h-[92vh] overflow-y-auto space-y-6 text-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-200">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-6 h-6 text-red-600 shrink-0" />
                <div>
                  <h2 className="text-base sm:text-lg font-black uppercase text-zinc-950">
                    Buku Servis Digital & Pasport Motosikal
                  </h2>
                  <p className="text-[11px] text-zinc-800 font-bold">
                    Rekod Penyelenggaraan Rasmi FFmotor (G One Stop Ent)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  tactileAudio.click();
                  setViewingPassportPlate(null);
                }}
                className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-950 transition cursor-pointer"
                title="Tutup Paparan Pasport"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <Passport
              plate={viewingPassportPlate}
              onBack={() => setViewingPassportPlate(null)}
            />
          </div>
        </div>
      )}

    </div>
  );
};
