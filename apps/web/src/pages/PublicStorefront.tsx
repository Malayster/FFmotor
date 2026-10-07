import React, { useEffect, useState } from "react";
import {
  Bike,
  ShoppingCart,
  Sparkles,
  Phone,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Share2,
  DollarSign,
  Tag,
  ExternalLink,
  ChevronRight,
  Calculator,
  User,
  Star,
  Clock,
  Truck,
  Gift,
  QrCode,
  Wrench,
  MapPin,
  X
} from "lucide-react";
import { Motorcycle, Product } from "../types";
import { HeroDepth } from "../components/canvas/CanvasBackdrop";

interface PublicStorefrontProps {
  motorcycles: Motorcycle[];
  products: Product[];
  onBackToApp?: () => void;
  onOpenPassport?: (plate: string) => void;
  onOpenCustomerPortal?: () => void;
}

export const PublicStorefront: React.FC<PublicStorefrontProps> = ({
  motorcycles,
  products,
  onBackToApp,
  onOpenPassport,
  onOpenCustomerPortal,
}) => {
  const [passportSearchPlate, setPassportSearchPlate] = useState("");

  const handleSearchPassport = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = passportSearchPlate.trim().toUpperCase();
    if (!clean) {
      alert("Sila masukkan nombor plat motosikal (contoh: VDF 8899).");
      return;
    }
    if (onOpenPassport) {
      onOpenPassport(clean);
    } else {
      window.location.hash = `passport-${clean.replace(/\s+/g, "")}`;
    }
  };
  // Semak parameter URL untuk affiliate referral (?ref=danial)
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get("ref") || urlParams.get("ejen") || "AFF-HQ";

  const [selectedBike, setSelectedBike] = useState<Motorcycle | null>(motorcycles[0] || null);
  const [loanDeposit, setLoanDeposit] = useState<number>(500);
  const [loanPeriodYears, setLoanPeriodYears] = useState<number>(3);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingCustomer, setBookingCustomer] = useState({ name: "", phone: "" });

  // Online Service Slot Booking State
  const [isSlotBookingModalOpen, setIsSlotBookingModalOpen] = useState(false);
  const [slotServiceType, setSlotServiceType] = useState("Servis Minyak Hitam & Filter (15 Minit)");
  const [slotDate, setSlotDate] = useState("2026-09-23");
  const [slotTime, setSlotTime] = useState("11:30 AM");
  const [slotCustomerName, setSlotCustomerName] = useState("");
  const [slotCustomerPhone, setSlotCustomerPhone] = useState("");
  const [slotBikePlate, setSlotBikePlate] = useState("");
  const [confirmedSlot, setConfirmedSlot] = useState<any>(null);

  // Deposit Lock Modal State
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositDuitNowRef, setDepositDuitNowRef] = useState("");
  const [depositSuccess, setDepositSuccess] = useState(false);

  // Fulfillment Mode (Ambil Sendiri vs Penghantaran Lalamove)
  const [fulfillmentMode, setFulfillmentMode] = useState<"pickup" | "delivery">("pickup");

  // Digital Loyalty Card State
  const [loyaltyPunches, setLoyaltyPunches] = useState(4); // 4/5 punches completed
  const [catalogBikes, setCatalogBikes] = useState<Motorcycle[] | null>(null);
  const [catalogParts, setCatalogParts] = useState<{ id: string; name: string; sellingPrice: number; availableQty: number }[]>([]);
  const [bag, setBag] = useState<{ subjectType: "motorcycle" | "product"; subjectId: string; title: string; quantity: number; videoUrl: string }[]>([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [bagForm, setBagForm] = useState({ name: "", phone: "", address: "", fulfillment: "pickup" });
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    fetch("/api/public/catalog")
      .then((res) => res.json())
      .then((data) => {
        const bikes = (data.motorcycles || []).map((bike: Motorcycle & { shots?: { slot: string; label?: string | null; image: string }[] }) => ({
          ...bike,
          images: (bike.shots || []).map((shot) => shot.image),
          shotLabels: (bike.shots || []).map((shot) => shot.label || shot.slot),
        }));
        setCatalogBikes(bikes);
        setCatalogParts(data.products || []);
      })
      .catch(() => setCatalogBikes([]));
  }, []);

  // Kiraan ansuran pinjaman anggaran
  const bikePrice = selectedBike?.sellingPrice || 11500;
  const loanPrincipal = Math.max(0, bikePrice - loanDeposit);
  const interestRatePerYear = 0.085; // 8.5% flat rate
  const totalInterest = loanPrincipal * interestRatePerYear * loanPeriodYears;
  const totalLoanRepayable = loanPrincipal + totalInterest;
  const monthlyInstallment = Math.round(totalLoanRepayable / (loanPeriodYears * 12));

  // Senarai stok motor showroom realistik
  const defaultBikes: Motorcycle[] = [
    {
      id: "MOTO-NVX-2024",
      brand: "Yamaha",
      model: "NVX 155 V2 ABS",
      year: 2024,
      color: "Matte Cyan & Silver",
      engineNo: "G3J4E-049281",
      chassisNo: "MH3SE8210NJ-0941",
      condition: "new",
      currentMileage: 0,
      costPrice: 10200,
      sellingPrice: 11800,
      status: "available",
      depositMin: 300,
      monthlyEstimated: 245,
      specs: ["155cc VVA Liquid-Cooled", "Smart Key System (Keyless)", "ABS Depan & Traction Control", "Tangki 5.5L Petrol"],
    },
    {
      id: "MOTO-Y15-2024",
      brand: "Yamaha",
      model: "Y15ZR V2 King of Streets",
      year: 2024,
      color: "Racing Blue Edition",
      engineNo: "G3J1E-084920",
      chassisNo: "MH3SE7100MJ-5512",
      condition: "new",
      currentMileage: 0,
      costPrice: 8500,
      sellingPrice: 9600,
      status: "available",
      depositMin: 200,
      monthlyEstimated: 198,
      specs: ["150cc Fuel Injection", "5-Speed Manual Clutch", "Lampu LED Headlamp", "Pilihan Ramai Belia"],
    },
    {
      id: "MOTO-RSX-2024",
      brand: "Honda",
      model: "RS-X 150 DOHC Repsol Edition",
      year: 2024,
      color: "Repsol Racing Orange",
      engineNo: "KC31E-109283",
      chassisNo: "MH3KC3100NJ-8402",
      condition: "new",
      currentMileage: 0,
      costPrice: 8600,
      sellingPrice: 9800,
      status: "available",
      depositMin: 250,
      monthlyEstimated: 205,
      specs: ["150cc DOHC 6-Speed", "Anti-Lock Braking System (ABS)", "Ekzos Sporty Garang", "Selesa Tunggangan Jauh"],
    },
  ];

  const availableBikes = catalogBikes ?? [];
  const activeBike: Motorcycle = selectedBike || availableBikes[0] || {
    id: "",
    brand: "FFmotor",
    model: "Tiada unit",
    year: new Date().getFullYear(),
    color: "-",
    engineNo: "-",
    chassisNo: "-",
    condition: "used",
    currentMileage: 0,
    costPrice: 0,
    sellingPrice: 0,
    status: "sold",
  };

  // Pakej visual bergambar spare part & servis
  const visualPartsPackages = [
    {
      id: "PKG-CVT",
      name: "Pakej Servis CVT + Belting Yamaha OEM",
      tag: "Pakej Popular",
      price: 145.0,
      originalPrice: 195.0,
      dialect: "Belting, Roller & Minyak Gear",
      desc: "Menghapuskan getaran awal pagi & pulihkan pikap gear automatik.",
      includes: ["V-Belt OEM Yamaha Original (B65)", "Roller Set CVT 11g", "Minyak Gear Skuter Yamalube", "Upah Pasang & Cuci Casing"],
    },
    {
      id: "PKG-TAYAR",
      name: "Kombo Sepasang Tayar Maxxis Volans Tubeless",
      tag: "Cengkaman Hujan",
      price: 180.0,
      originalPrice: 230.0,
      dialect: "Tayar Depan Belakang + Kepala Valve Baru",
      desc: "Cengkaman mantap jalan basah & selekoh highway untuk NVX/Y15.",
      includes: ["Tayar Depan 80/90-17 Tubeless", "Tayar Belakang 90/80-17 Tubeless", "Upah Pasang & Balancing Percuma", "2x Tubeless Valve Baru"],
    },
    {
      id: "PKG-MATGAT",
      name: "Matgat Carbon NVX + Cover Lampu Smoke Smoke",
      tag: "Aksesori Bergaya",
      price: 95.0,
      originalPrice: 140.0,
      dialect: "Matgat Depan (Mudguard) Celup Carbon",
      desc: "Kalis calar, tahan batu jalan & beri imej garang pada jentera anda.",
      includes: ["Matgat Depan High-Gloss Carbon Fiber Look", "Lampu Signal Smoke Cover", "Skru Pemasangan Stainless Steel", "Pemasangan Siap 20 Minit"],
    },
  ];

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCustomer.name || !bookingCustomer.phone) {
      alert("Sila masukkan nama dan nombor telefon untuk tempahan.");
      return;
    }

    const bookingMsg = `Salam FFmotor! Saya (${bookingCustomer.name}, Tel: ${bookingCustomer.phone}) ingin booking motosikal *${activeBike.brand} ${activeBike.model}* (${activeBike.color}) melalui pautan Affiliate [${refCode}]. Anggaran deposit RM${loanDeposit}. Mohon sediakan dokumen pinjaman.`;

    // Buka WhatsApp terus ke kaunter cawangan
    window.open(`https://wa.me/60192233445?text=${encodeURIComponent(bookingMsg)}`, "_blank");
    setBookingSuccess(`Tempahan unit ${activeBike.model} telah dihantar ke kaunter FFmotor! Staf kami akan hubungi anda dalam tempoh 15 minit.`);
  };

  const handleServiceSlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotCustomerName || !slotCustomerPhone) {
      alert("Sila masukkan nama dan nombor telefon untuk tempahan slot.");
      return;
    }
    const slotRes = await fetch("/api/public/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: slotDate,
        time: slotTime,
        plate: slotBikePlate,
        name: slotCustomerName,
        phone: slotCustomerPhone,
        serviceType: slotServiceType,
      }),
    });
    const slotData = await slotRes.json().catch(() => null);
    if (!slotRes.ok || !slotData?.success) {
      alert(slotData?.message || "Slot tidak tersedia.");
      return;
    }

    const bookingRef = `SLOT-${Date.now().toString().slice(-4)}`;
    const slotInfo = {
      bookingRef,
      serviceType: slotServiceType,
      date: slotDate,
      time: slotTime,
      name: slotCustomerName,
      phone: slotCustomerPhone,
      plate: slotBikePlate || "-",
    };

    const waText = `Salam FFmotor Pit Bay! Saya ingin sahkan tempahan slot servis:
📋 No Rujukan: ${bookingRef}
🛠️ Jenis Servis: ${slotServiceType}
📅 Tarikh & Sesi: ${slotDate} (${slotTime})
🏍️ No Plat: ${slotBikePlate || "-"}
👤 Nama: ${slotCustomerName} (${slotCustomerPhone})
Mohon reserve lif bay untuk saya. Terima kasih!`;

    window.open(`https://wa.me/60192233445?text=${encodeURIComponent(waText)}`, "_blank");
    setConfirmedSlot(slotInfo);
    setIsSlotBookingModalOpen(false);
  };

  const handleConfirmDepositPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositDuitNowRef || depositDuitNowRef.length < 4) {
      alert("Sila masukkan sekurang-kurangnya 4 digit rujukan pindahan anda.");
      return;
    }
    setDepositSuccess(true);
    try {
      const res = await fetch("/api/public/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motorcycleId: activeBike.id,
          name: bookingCustomer.name || "Pelanggan",
          phone: bookingCustomer.phone || "",
          amount: activeBike.depositMin || 300,
          slipRef: depositDuitNowRef,
          affiliateCode: refCode,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        alert(data?.message || "Slip tidak diterima.");
        setDepositSuccess(false);
        return;
      }
      setIsDepositModalOpen(false);
      setDepositSuccess(false);
      setBookingSuccess(data.message);
    } catch {
      alert("Pelayan tidak menjawab. Unit tidak dikunci.");
      setDepositSuccess(false);
    }
  };

  const yellowBag = (
    <div className="fixed bottom-4 right-4 z-40 w-[min(100%-2rem,22rem)]">
      <button type="button" className="ml-auto flex items-center gap-2 bg-amber-400 text-zinc-950 font-black rounded-full px-4 py-3 shadow-lg" onClick={() => setBagOpen((open) => !open)}>
        Beg kuning · {bag.reduce((sum, line) => sum + line.quantity, 0)}
      </button>
      {bagOpen && (
        <form className="mt-2 bg-white border border-zinc-200 rounded-3xl p-4 space-y-2 shadow-xl" onSubmit={async (event) => {
          event.preventDefault();
          const res = await fetch("/api/public/bag/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...bagForm, lines: bag }),
          });
          const data = await res.json().catch(() => null);
          if (!res.ok || !data?.success) {
            alert(data?.message || "Checkout gagal");
            return;
          }
          setBag([]);
          setBagOpen(false);
          setBookingSuccess(data.message);
        }}>
          <p className="text-sm font-black">Checkout</p>
          {bag.length === 0 && <p className="text-xs text-zinc-500">Beg kosong. Masukkan barang yang sudah dijual.</p>}
          {bag.map((line) => (
            <div key={line.subjectId} className="text-xs flex justify-between gap-2">
              <span>{line.title} × {line.quantity}</span>
              <button type="button" className="text-red-700 font-bold" onClick={() => setBag(bag.filter((item) => item.subjectId !== line.subjectId))}>Buang</button>
            </div>
          ))}
          {catalogParts.map((part) => (
            <button type="button" key={part.id} className="block text-left text-xs font-bold text-zinc-800" onClick={() => setBag([...bag, { subjectType: "product", subjectId: part.id, title: part.name, quantity: 1, videoUrl: "" }])}>
              + {part.name} · RM {part.sellingPrice}
            </button>
          ))}
          {availableBikes.filter((bike) => bike.id).map((bike) => (
            <div key={bike.id} className="space-y-1">
              <button type="button" className="block text-left text-xs font-bold" onClick={() => setBag([...bag, { subjectType: "motorcycle", subjectId: bike.id, title: `${bike.brand} ${bike.model}`, quantity: 1, videoUrl: "" }])}>
                + {bike.brand} {bike.model}
              </button>
            </div>
          ))}
          <input className="border border-zinc-300 rounded-xl px-3 py-2 text-sm w-full" required placeholder="Nama" value={bagForm.name} onChange={(e) => setBagForm({ ...bagForm, name: e.target.value })} />
          <input className="border border-zinc-300 rounded-xl px-3 py-2 text-sm w-full" required placeholder="Telefon" value={bagForm.phone} onChange={(e) => setBagForm({ ...bagForm, phone: e.target.value })} />
          <select className="border border-zinc-300 rounded-xl px-3 py-2 text-sm w-full" value={bagForm.fulfillment} onChange={(e) => setBagForm({ ...bagForm, fulfillment: e.target.value })}>
            <option value="pickup">Ambil sendiri</option>
            <option value="delivery">Hantar</option>
          </select>
          {bagForm.fulfillment === "delivery" && <input className="border border-zinc-300 rounded-xl px-3 py-2 text-sm w-full" placeholder="Alamat" value={bagForm.address} onChange={(e) => setBagForm({ ...bagForm, address: e.target.value })} />}
          <input className="border border-zinc-300 rounded-xl px-3 py-2 text-sm w-full" placeholder="Pautan video, jika ada" value={bag[0]?.videoUrl || ""} onChange={(e) => setBag(bag.map((line, index) => index === 0 ? { ...line, videoUrl: e.target.value } : line))} />
          <button className="w-full bg-zinc-950 text-white rounded-xl py-2 text-sm font-bold" type="submit">Hantar pesanan</button>
          <p className="text-[11px] text-zinc-500">Bayaran dan kurier diurus kerani. Ini belum tutup pesanan.</p>
        </form>
      )}
    </div>
  );

  if (catalogBikes === null) {
    return <p className="text-sm text-zinc-500 p-6">Memuat set gambar jualan…</p>;
  }

  if (!activeBike.id) {
    return (
      <>
        <div className="p-8 bg-white border border-zinc-200 rounded-3xl">
          <h1 className="text-xl font-black">Tiada unit berfoto untuk dijual dalam talian</h1>
          <p className="text-sm text-zinc-600 mt-2">Barang yang sudah lulus set gambar dan harga masih boleh dimasukkan ke beg kuning.</p>
        </div>
        {yellowBag}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-zinc-950 font-sans selection:bg-red-600 selection:text-white">
      {yellowBag}
      {/* Top Header Rasmi Storefront */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-zinc-950 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black shrink-0">
            <Bike className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-black px-2 py-0.5 rounded bg-zinc-950 text-white">
                SHOWROOM & PUSAT 3S
              </span>
              {refCode !== "AFF-HQ" && (
                <span className="text-[10px] font-mono text-zinc-950 bg-zinc-100 border border-zinc-300 px-2 py-0.5 rounded-full font-bold">
                  ★ Ejen: {refCode}
                </span>
              )}
            </div>
            <h1 className="text-base sm:text-lg font-black text-zinc-950 leading-tight">FFmotor Bengkel & Showroom</h1>
          </div>
        </div>

        {/* Kotak Semakan Sejarah Servis Pantas (Plan A: Frontpage Passport Search) */}
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={handleSearchPassport} className="flex items-center gap-1.5 bg-zinc-50 border-2 border-zinc-950 rounded-2xl p-1">
            <input
              type="text"
              value={passportSearchPlate}
              onChange={(e) => setPassportSearchPlate(e.target.value)}
              placeholder="No. Plat (cth: VDF 8899)"
              className="bg-transparent px-2.5 py-1 text-xs font-mono font-black text-zinc-950 uppercase placeholder:text-zinc-600 focus:outline-none w-36 sm:w-44"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Semak Servis</span>
            </button>
          </form>

          {onOpenCustomerPortal && (
            <button
              type="button"
              onClick={onOpenCustomerPortal}
              className="px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Portal Saya</span>
            </button>
          )}

          {onBackToApp && (
            <button
              type="button"
              onClick={onBackToApp}
              className="text-xs text-zinc-800 hover:text-zinc-950 px-3 py-2 rounded-xl border-2 border-zinc-300 hover:bg-zinc-100 font-bold transition cursor-pointer"
            >
              Staf HQ
            </button>
          )}
        </div>
      </header>

      {/* Hero Banner Bergambar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <HeroDepth className="bg-white border-2 border-zinc-300 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-black shadow-sm">
          <div className="space-y-3 max-w-xl">
            <span className="text-[11px] font-mono font-black uppercase text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
              Pusat Jualan Motosikal & Alat Ganti 3S
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-black">
              Miliki Motosikal Baharu & Alat Ganti Bergambar Secara Online
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 font-bold leading-relaxed">
              Semak stok showroom sebenar, kira ansuran pinjaman dengan kalkulator interaktif, dan tempah alat ganti terus dari katil rumah anda.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-black font-bold">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Jaminan Rasmi Kilang</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-red-600" /> Pendaftaran JPJ Pantas</span>
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-red-600" /> Stok Bersedia di Kedai</span>
            </div>
          </div>

          {/* Badge Pameran & Servis */}
          <div className="bg-zinc-50/80 p-5 rounded-3xl border border-zinc-200 flex flex-col gap-2.5 w-full md:w-auto shrink-0 shadow-none">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Showroom 3S & 4-Bay Lif Dibuka</span>
            </div>
            <p className="text-[11px] text-zinc-500 max-w-xs">
              Motosikal baharu JPJ & tempahan slot servis lif bengkel pantas.
            </p>
            <div className="flex flex-col gap-2 w-full">
              <button
                type="button"
                onClick={() => setIsSlotBookingModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>📅 Tempah Slot Servis Pit Lif</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = prompt("Masukkan nombor plat motosikal anda (contoh: VDF 8899):");
                  if (p && p.trim()) {
                    const clean = p.trim().toUpperCase();
                    if (onOpenPassport) onOpenPassport(clean);
                    else window.location.hash = `passport-${clean.replace(/\s+/g, "")}`;
                  }
                }}
                className="bg-zinc-950 hover:bg-zinc-800 text-white font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>🏍️ Semak Pasport Servis Digital</span>
              </button>
            </div>
          </div>
        </HeroDepth>
      </div>

      {/* High-Trust Commercial Credibility Bar (Lenyapkan Rasa Darkweb) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="bg-white/90 border border-zinc-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center font-black text-red-600 text-xs">
              SSM
            </div>
            <div>
              <div className="font-black text-xs">FF MOTORSPORT SDN. BHD. (1428591-M)</div>
              <div className="text-[11px] text-zinc-500">Pengedar Sah 3S Motosikal Yamaha & Honda • No 14, Jalan Industri 3, Mergong, Kedah</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-600 font-medium">
            <div className="flex items-center gap-1.5 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-200">
              <span className="text-red-600 font-bold">★ 4.9/5.0</span>
              <span className="text-zinc-500">(1,420+ Ulasan Google Penunggang Kedah)</span>
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <span className="text-zinc-500">Panel Pinjaman:</span>
              <span className="bg-zinc-100 text-zinc-700 font-bold px-2 py-0.5 rounded border border-zinc-300">AEON Credit</span>
              <span className="bg-zinc-100 text-zinc-700 font-bold px-2 py-0.5 rounded border border-zinc-300">Chailease</span>
              <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-500/25">Kredit Kedai</span>
            </div>

            <div className="flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1.5 rounded-xl border border-red-200 font-bold">
              <span>DuitNow QR</span>
              <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded font-black">SAH</span>
            </div>
          </div>
        </div>
      </div>

      {/* SEKSYEN 1: SHOWROOM MOTOSIKAL & KALKULATOR PINJAMAN */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* Mesej Kejayaan Booking */}
          {bookingSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-bold">{bookingSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Bahagian Kiri: Galeri Visual Motor & Spesifikasi (7 Kolum) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-none">
                {/* Visual Banner Motor */}
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-2xl bg-zinc-100 border border-zinc-200 overflow-hidden">
                    {activeBike.images?.[angle] ? (
                      <img src={activeBike.images[angle]} alt={activeBike.shotLabels?.[angle] || activeBike.model} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm text-zinc-500">Set gambar belum lengkap</div>
                    )}
                    <span className="absolute bottom-3 left-3 bg-white/90 text-zinc-950 text-xs font-black px-2 py-1 rounded-lg">
                      {activeBike.shotLabels?.[angle] || "Gambar"} · RM {activeBike.sellingPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto">
                    {(activeBike.images || []).map((src, index) => (
                      <button type="button" key={src.slice(0, 24) + index} className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border ${index === angle ? "border-red-600" : "border-zinc-200"}`} onClick={() => setAngle(index)}>
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Butiran Harga Tunai & Spesifikasi */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                    <span className="text-[10px] font-bold uppercase text-zinc-500 block">Harga Tunai Atas Jalan (OTR)</span>
                    <span className="text-2xl font-black font-mono mt-1 block">
                      RM {activeBike.sellingPrice.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-zinc-400">Termasuk cukai jalan & insurans komprehensif</span>
                  </div>

                  <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                    <span className="text-[10px] font-bold uppercase text-zinc-500 block">Deposit Serendah</span>
                    <span className="text-2xl font-black text-red-600 font-mono mt-1 block">
                      RM {(activeBike.depositMin || 300).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-emerald-400">Bulanan anggaran RM {monthlyInstallment}/bln</span>
                  </div>
                </div>

                {/* Senarai Spesifikasi Jentera */}
                <div>
                  <h4 className="text-xs font-black uppercase text-zinc-600 mb-3 tracking-wider">
                    Spesifikasi Utama Jentera:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {(activeBike.specs || [
                      "Enjin Berkuasa Suntikan Bahan Api (EFI)",
                      "Sistem Brek Cakera Keselamatan",
                      "Kunci Pintar Keyless & Penggera",
                      "Tangki Minyak Jimat Bahan Api",
                    ]).map((spec, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                        <span className="text-zinc-600 text-[11px] font-medium">{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pilihan Tukar Motor Dalam Katalog */}
                <div>
                  <span className="text-xs font-bold text-zinc-500 block mb-2">Pilih Model Lain di Showroom:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {availableBikes.map((bike) => (
                      <button
                        key={bike.id}
                        type="button"
                        onClick={() => setSelectedBike(bike)}
                        className={`p-2.5 rounded-xl border text-left transition ${
                          activeBike.id === bike.id
                            ? "bg-red-50 border-red-600 font-bold"
                            : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-red-600"
                        }`}
                      >
                        <span className="text-[11px] block truncate">{bike.model}</span>
                        <span className="text-[10px] text-red-600 font-mono">RM {bike.sellingPrice}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bahagian Kanan: Kalkulator Loan & Borang Booking Terus (5 Kolum) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Kad Kalkulator Pinjaman Interaktif */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-none">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-red-600" />
                    <h3 className="text-sm font-black ">Kalkulator Ansuran Pinjaman</h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    Kadar Rata 8.5%
                  </span>
                </div>

                {/* Slider Deposit */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-bold">Jumlah Muka (Deposit):</span>
                    <span className="text-red-600 font-mono font-black">RM {loanDeposit}</span>
                  </div>
                  <input
                    type="range"
                    min={activeBike.depositMin || 300}
                    max={activeBike.sellingPrice * 0.6}
                    step={100}
                    value={loanDeposit}
                    onChange={(e) => setLoanDeposit(parseInt(e.target.value) || 300)}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>Min RM{activeBike.depositMin || 300}</span>
                    <span>Max RM{Math.round(activeBike.sellingPrice * 0.6)}</span>
                  </div>
                </div>

                {/* Pilihan Tempoh Tahun */}
                <div className="space-y-2">
                  <span className="text-xs text-zinc-500 font-bold block">Tempoh Pinjaman:</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[2, 3, 4, 5].map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setLoanPeriodYears(yr)}
                        className={`py-2 rounded-xl text-xs font-mono font-bold transition border ${
                          loanPeriodYears === yr
                            ? "bg-brand-600 text-white border-brand-500 shadow-md"
                            : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:text-red-600"
                        }`}
                      >
                        {yr} Tahun
                      </button>
                    ))}
                  </div>
                </div>

                {/* Kotak Keputusan Anggaran Bulanan */}
                <div className="bg-zinc-50 p-4 rounded-2xl border border-brand-500/30 text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                    Anggaran Bayaran Bulanan
                  </span>
                  <div className="text-3xl font-black text-red-600 font-mono">
                    RM {monthlyInstallment} <span className="text-xs text-zinc-500 font-normal">/ bulan</span>
                  </div>
                  <p className="text-[10px] text-zinc-400">
                    Pinjaman RM {loanPrincipal.toFixed(0)} • Tempoh {loanPeriodYears * 12} bulan
                  </p>
                </div>

                {/* Borang Tempahan Unit */}
                <form onSubmit={handleBookingSubmit} className="space-y-3 pt-2 border-t border-zinc-200">
                  <h4 className="text-xs font-black ">Tempah / Booking Unit Ini:</h4>
                  <div>
                    <input
                      type="text"
                      placeholder="Nama penuh anda"
                      value={bookingCustomer.name}
                      onChange={(e) => setBookingCustomer({ ...bookingCustomer, name: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs placeholder-zinc-400 focus:outline-none focus:border-red-600"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Nombor WhatsApp (cth: 0192233445)"
                      value={bookingCustomer.phone}
                      onChange={(e) => setBookingCustomer({ ...bookingCustomer, phone: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs placeholder-zinc-400 focus:outline-none focus:border-red-600 font-mono"
                      required
                    />
                  </div>

                  <div className="pt-1 flex flex-col gap-2">
                    <button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition"
                    >
                      <Bike className="w-4 h-4" />
                      <span>Hantar Tempahan & Sedia Dokumen Loan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsDepositModalOpen(true)}
                      className="w-full bg-emerald-50 hover:bg-zinc-800/30 text-emerald-400 border border-emerald-200 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>🔒 Kunci Unit & Deposit DuitNow (RM300)</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>

      {/* SEKSYEN 2: KATALOG ALAT GANTI & PAKEJ BERGAMBAR (MATGAT / CVT) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          {/* Digital Loyalty Card & Delivery Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Loyalty Punch Card */}
            <div className="p-4 rounded-3xl bg-white border border-zinc-200 flex items-center justify-between shadow-none">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                  <Gift className="w-4 h-4" />
                  <span>Kad Kesetiaan Digital Servis FFmotor</span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  {loyaltyPunches}/5 Cop Servis. Tinggal 1 servis lagi untuk upah pasang percuma!
                </p>
                <div className="flex gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((punch) => (
                    <div
                      key={punch}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono font-bold border ${
                        punch <= loyaltyPunches
                          ? "bg-red-600 text-white border-red-600 shadow-sm"
                          : "bg-zinc-50 text-slate-600 border-zinc-200"
                      }`}
                    >
                      {punch <= loyaltyPunches ? "★" : punch}
                    </div>
                  ))}
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-xl">
                VIP Platinum
              </span>
            </div>

            {/* Delivery vs Pickup Selector */}
            <div className="p-4 rounded-3xl bg-white border border-zinc-200 flex flex-col justify-between shadow-none gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-zinc-700" />
                  <span>Pilihan Penerimaan Alat Ganti:</span>
                </span>
                <span className="text-[10px] text-zinc-700 font-mono">
                  {fulfillmentMode === "pickup" ? "Siap Pasang di Bengkel (RM0)" : "Penghantaran Seluruh Semenanjung"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setFulfillmentMode("pickup")}
                  className={`py-2 px-3 rounded-xl border transition flex items-center justify-center gap-1.5 ${
                    fulfillmentMode === "pickup"
                      ? "bg-zinc-950 text-white border-zinc-300 shadow-md"
                      : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:text-red-600"
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Ambil & Pasang Lif</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFulfillmentMode("delivery")}
                  className={`py-2 px-3 rounded-xl border transition flex items-center justify-center gap-1.5 ${
                    fulfillmentMode === "delivery"
                      ? "bg-zinc-950 text-white border-zinc-300 shadow-md"
                      : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:text-red-600"
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Kurier / Lalamove</span>
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-zinc-200 pb-4">
            <h3 className="text-xl font-black ">Pakej Alat Ganti & Kombo Servis Bergambar</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Setiap komponen disertakan nama dialek tempatan (matgat, mangkuk, belting) supaya anda yakin dengan apa yang dibeli.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visualPartsPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white border border-zinc-200 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-none hover:border-brand-500/40 transition group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      {pkg.tag}
                    </span>
                    <span className="text-xs text-emerald-400 font-mono font-bold">Siap Pasang</span>
                  </div>

                  <h4 className="text-base font-black group-hover:text-red-600 transition">
                    {pkg.name}
                  </h4>
                  <p className="text-[11px] text-red-600 font-medium">
                    Dialek/Komponen: {pkg.dialect}
                  </p>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    {pkg.desc}
                  </p>

                  <div className="pt-2 border-t border-zinc-200/80 space-y-1.5">
                    {pkg.includes.map((inc, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-zinc-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-[11px]">{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-200 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-zinc-400 line-through mr-2">RM {pkg.originalPrice}</span>
                      <span className="text-xl font-black font-mono">RM {pkg.price}</span>
                    </div>
                    <span className="text-[10px] text-red-600 font-mono">Jimat RM{pkg.originalPrice - pkg.price}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const msg = `Salam FFmotor! Saya ingin tempah slot pemasangan untuk *${pkg.name}* (RM${pkg.price}). Rujukan: ${refCode}. Bila slot kosong terdekat?`;
                      window.open(`https://wa.me/60192233445?text=${encodeURIComponent(msg)}`, "_blank");
                    }}
                    className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Tempah & Pasang di Bengkel</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
      </section>

      {/* Footer Komersial Rasmi Showroom & Bengkel */}
      <footer className="mt-16 border-t border-zinc-200 bg-white/90 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-500">
          <div className="space-y-1 text-center md:text-left">
            <div className="font-black text-sm flex items-center justify-center md:justify-start gap-2">
              <Bike className="w-4 h-4 text-red-600" />
              <span>FF MOTORSPORT SDN. BHD. (1428591-M)</span>
            </div>
            <p>Pusat Pameran Jualan Motosikal 3S, Alat Ganti OEM & Baik Pulih Enjin Berkuasa Tinggi</p>
            <p className="text-[11px] text-zinc-400">
              Alamat: No 14, Jalan Industri 3, Kawasan Perindustrian Mergong, 05150 Alor Setar, Kedah Darul Aman.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-center">
            <div>
              <span className="block font-bold ">Waktu Operasi Showroom & Lif:</span>
              <span className="text-[11px] text-emerald-400">Isnin - Sabtu: 8:30 AM - 6:30 PM (Ahad: Cuti)</span>
            </div>
            <a
              href="https://wa.me/60192233445"
              target="_blank"
              rel="noreferrer"
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg transition"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden />
              <span>WhatsApp Showroom</span>
            </a>
          </div>
        </div>
      </footer>

      {/* MODAL 1: TEMPAH SLOT SERVIS PIT LIF */}
      {isSlotBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-3xl max-w-lg w-full p-6 shadow-none space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-brand-600/20 text-brand-400 border border-brand-500/30">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black ">Tempah Slot Servis Pit Bay</h3>
                  <p className="text-[11px] text-zinc-500">Pilih tarikh & kunci lif bay awal untuk elak beratur panjang</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSlotBookingModalOpen(false)}
                className="text-zinc-500 hover:text-red-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleServiceSlotSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-500 font-bold mb-1">Pakej / Jenis Servis Diperlukan</label>
                <select
                  value={slotServiceType}
                  onChange={(e) => setSlotServiceType(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-2.5 font-bold focus:border-brand-500 outline-none"
                >
                  <option value="Servis Minyak Hitam & Filter (15 Minit)">Servis Minyak Hitam & Filter (15 Minit)</option>
                  <option value="Servis CVT & Belting OEM (45 Minit)">Servis CVT & Belting OEM (45 Minit)</option>
                  <option value="Tukar Tayar Tubeless Sepasang (30 Minit)">Tukar Tayar Tubeless Sepasang (30 Minit)</option>
                  <option value="Tukar Rantai & Sprocket Set (25 Minit)">Tukar Rantai & Sprocket Set (25 Minit)</option>
                  <option value="Diagnosis Enjin & Troubleshooting Bunyi (20 Minit)">Diagnosis Enjin & Troubleshooting Bunyi (20 Minit)</option>
                  <option value="Overhaul Enjin & Valve Tuning (Major)">Overhaul Enjin & Valve Tuning (Major)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 font-bold mb-1">Tarikh Pilihan</label>
                  <input
                    type="date"
                    value={slotDate}
                    onChange={(e) => setSlotDate(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-2 font-mono focus:border-brand-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 font-bold mb-1">Sesi Waktu Pilihan</label>
                  <select
                    value={slotTime}
                    onChange={(e) => setSlotTime(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-2 font-bold focus:border-brand-500 outline-none"
                  >
                    <option value="09:30 AM">09:30 AM (Sesi Pagi)</option>
                    <option value="11:30 AM">11:30 AM (Sesi Tengah Hari)</option>
                    <option value="02:30 PM">02:30 PM (Sesi Petang)</option>
                    <option value="04:30 PM">04:30 PM (Sesi Petang 2)</option>
                    <option value="06:00 PM">06:00 PM (Sesi Senja)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-1">
                  <label className="block text-zinc-500 font-bold mb-1">No. Plat Motor</label>
                  <input
                    type="text"
                    value={slotBikePlate}
                    onChange={(e) => setSlotBikePlate(e.target.value.toUpperCase())}
                    placeholder="Contoh: VEE 8492"
                    className="w-full bg-zinc-50 border border-zinc-300 text-red-600 font-mono font-bold rounded-xl p-2 uppercase focus:border-brand-500 outline-none"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-zinc-500 font-bold mb-1">Nama Pemilik / Pelanggan</label>
                  <input
                    type="text"
                    value={slotCustomerName}
                    onChange={(e) => setSlotCustomerName(e.target.value)}
                    placeholder="Nama penuh anda"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-2 focus:border-brand-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 font-bold mb-1">Nombor WhatsApp</label>
                <input
                  type="tel"
                  value={slotCustomerPhone}
                  onChange={(e) => setSlotCustomerPhone(e.target.value)}
                  placeholder="Contoh: 019-2819281"
                  className="w-full bg-zinc-50 border border-zinc-300 font-mono rounded-xl p-2 focus:border-brand-500 outline-none"
                  required
                />
              </div>

              <div className="p-3 bg-brand-600/10 border border-brand-500/20 rounded-xl text-[11px] text-brand-300 flex items-start gap-2">
                <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Lif bay akan di-reserve selama 15 minit dari waktu sesi. Sila tiba 5 minit lebih awal untuk intake teknikal.
                </span>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-brand-600 hover:bg-brand-500 text-white font-black py-2.5 rounded-xl shadow-lg transition"
                >
                  Sahkan & Hantar ke WhatsApp Bengkel
                </button>
                <button
                  type="button"
                  onClick={() => setIsSlotBookingModalOpen(false)}
                  className="bg-white hover:bg-zinc-100 text-zinc-600 font-bold px-4 py-2.5 rounded-xl transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TIKET PENGESAHAN SLOT SERVIS */}
      {confirmedSlot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-emerald-200 rounded-3xl max-w-sm w-full p-6 shadow-none space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-400 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono tracking-wider">
                TEMPAHAN SLOT BERJAYA
              </span>
              <h3 className="text-lg font-black mt-0.5">{confirmedSlot.bookingRef}</h3>
              <p className="text-zinc-500 text-[11px]">Lif Bay Bersedia untuk Servis Anda</p>
            </div>

            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 text-left font-mono space-y-1.5 text-[11px]">
              <div className="flex justify-between text-zinc-500">
                <span>Servis:</span>
                <span className=" font-sans font-bold truncate max-w-[170px]">{confirmedSlot.serviceType}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Tarikh & Sesi:</span>
                <span className="text-red-600 font-bold">{confirmedSlot.date} ({confirmedSlot.time})</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>No. Plat:</span>
                <span className=" font-bold">{confirmedSlot.plate}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Pelanggan:</span>
                <span className="text-zinc-700">{confirmedSlot.name}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setConfirmedSlot(null)}
              className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2.5 rounded-xl transition text-xs"
            >
              Selesai & Tutup Tiket
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: DUITNOW QR DEPOSIT LOCK SHOWROOM MOTOR (RM 300) */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-3xl max-w-md w-full p-6 shadow-none space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-pink-500/10 text-zinc-700 border border-zinc-300">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black ">Kunci Unit Motor (Deposit RM 300)</h3>
                  <p className="text-[11px] text-zinc-500">Pindahan Segera DuitNow QR Maybank HQ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDepositModalOpen(false)}
                className="text-zinc-500 hover:text-red-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase text-zinc-500 font-bold">Motosikal Dipilih:</span>
                <h4 className="font-bold ">{activeBike.brand} {activeBike.model}</h4>
                <p className="text-[11px] text-red-600 font-mono">Warna: {activeBike.color}</p>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-zinc-500 block">DEPOSIT LOCK</span>
                <span className="text-emerald-400 font-black text-base">RM 300.00</span>
              </div>
            </div>

            {/* DuitNow QR Box */}
            <div className="bg-white p-4 rounded-2xl text-slate-950 text-center space-y-2 max-w-xs mx-auto shadow-inner border border-slate-200">
              <div className="flex items-center justify-center gap-1.5 text-red-600 font-black text-sm">
                <span>DuitNow QR RASMI</span>
              </div>
              <div className="w-40 h-40 bg-slate-100 border-2 border-dashed border-zinc-300 rounded-xl mx-auto flex flex-col items-center justify-center p-2">
                <QrCode className="w-28 h-28 text-red-600" />
                <span className="text-[10px] font-mono text-slate-600 font-bold">SCAN PAY DUITNOW</span>
              </div>
              <p className="text-[10px] text-slate-600 font-mono">FF MOTORSPORT SDN BHD</p>
              <p className="text-[10px] font-bold text-slate-800 font-mono">Maybank: 5128 4492 1092</p>
            </div>

            <form onSubmit={handleConfirmDepositPayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-500 font-bold mb-1">
                  Masukkan No. Rujukan / 4-Digit Terakhir Bank Anda:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 9481 atau Ref #109283"
                  value={depositDuitNowRef}
                  onChange={(e) => setDepositDuitNowRef(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-300 font-mono rounded-xl p-2.5 focus:border-zinc-300 outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={depositSuccess}
                  className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-black py-2.5 rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{depositSuccess ? "Mengesahkan..." : "Sahkan & Kunci Unit 48 Jam"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="bg-white hover:bg-zinc-100 text-zinc-600 font-bold px-4 py-2.5 rounded-xl transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

