import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { HeaderBar } from "./components/layout/HeaderBar";
import { CanvasBackdrop } from "./components/canvas/CanvasBackdrop";
import { useCanvasParallax } from "./lib/useCanvasParallax";

import { Dashboard } from "./pages/Dashboard";
import { OwnerDashboard } from "./pages/dashboards/OwnerDashboard";
import { OwnerBoard, MotorPrice, AccountAdmin, ArahanList } from "./pages/owner/OwnerDesk";
import { PhotoStudio } from "./pages/photos/PhotoStudio";
import { Kerani1Dashboard } from "./pages/dashboards/Kerani1Dashboard";
import { Kerani2Dashboard } from "./pages/dashboards/Kerani2Dashboard";
import { ForemanDashboard } from "./pages/dashboards/ForemanDashboard";
import { AffiliateDashboard } from "./pages/dashboards/AffiliateDashboard";
import { WorkOrders } from "./pages/WorkOrders";
import { ExpressIntake } from "./pages/ExpressIntake";
import { PosCheckout } from "./pages/PosCheckout";
import { Inventory } from "./pages/Inventory";
import { SupplierOrders } from "./pages/SupplierOrders";
import { StaffManager } from "./pages/StaffManager";
import { MotorSales } from "./pages/MotorSales";
import { QuotationManager } from "./pages/QuotationManager";
import { FinanceLedger } from "./pages/FinanceLedger";
import { WarrantyIssues } from "./pages/WarrantyIssues";
import { Authenticity } from "./pages/Authenticity";
import { BikeLocks } from "./pages/BikeLocks";
import { Leads } from "./pages/Leads";
import { WorkshopInbox } from "./pages/WorkshopInbox";
import { Campaigns } from "./pages/Campaigns";
import { CustomerPortal } from "./pages/CustomerPortal";
import { TrackLive } from "./pages/TrackLive";
import { Passport } from "./pages/Passport";
import { PublicStorefront } from "./pages/PublicStorefront";
import { PublicVoView } from "./pages/PublicVoView";
import { PublicQuoteView } from "./pages/PublicQuoteView";
import { EcommerceOrders } from "./pages/EcommerceOrders";
import { WorkshopSettings } from "./pages/WorkshopSettings";
import { PitTerminal } from "./terminals/PitTerminal";
import { CustomerCRMHub } from "./components/CustomerCRMHub";
import { SalesPipelineKanban } from "./components/SalesPipelineKanban";
import { LoanPipeline } from "./pages/LoanPipeline";
import { AffiliatePortal } from "./pages/AffiliatePortal";
import { StaffStationModal, AuthenticatedUser } from "./components/StaffStationModal";
import { Toaster, toast } from "sonner";
import { useHotkeys } from "react-hotkeys-hook";
import { CommandPalette } from "./components/ui/CommandPalette";
import { tacticalAudio, tactileAudio } from "./lib/audio";
import { sessionHeader } from "./lib/api";

import { WorkOrder, Product, Vehicle, Motorcycle, Lead } from "./types";
import { ForemanJob } from "./pages/ForemanJob";

const DEFAULT_USER: AuthenticatedUser = {
  id: "usr_admin",
  name: "Tuan Farid (Owner/Admin HQ)",
  email: "admin@ffmotor.my",
  role: "owner",
  method: "PIN Stesen",
};

const normalizeTab = (rawTab: string): string => {
  const clean = rawTab.toLowerCase().trim();
  if (clean === "pos" || clean === "kasir" || clean === "checkout") return "pos-checkout";
  if (clean === "sa" || clean === "intake" || clean === "daftar" || clean === "kaunter") return "express-intake";
  if (clean === "pit" || clean === "lif" || clean === "bengkel" || clean === "m") return "pit-live";
  if (clean === "stor" || clean === "parts") return "inventory";
  if (clean === "loan" || clean === "kredit") return "loan-pipeline";
  if (clean === "crm") return "customers";
  if (clean === "wo") return "work-orders";
  if (clean === "vo" || clean.startsWith("vo-")) return "vo-view";
  if (clean === "quote" || clean.startsWith("quote-")) return "quote-view";
  if (clean === "foreman-job" || clean === "foremanjob" || clean === "job") return "foreman-job";
  return clean || "dashboard";
};

const getInitialTab = (): string => {
  if (typeof window !== "undefined") {
    const hash = window.location.hash.replace(/^#/, "");
    if (hash) return normalizeTab(hash);
    const path = window.location.pathname;
    if (path.startsWith("/track/")) return "track";
    if (path.startsWith("/passport/")) return "passport";
    if (path.startsWith("/vo/")) return "vo-view";
    if (path.startsWith("/quote/")) return "quote-view";
    if (path.startsWith("/sa") || path.startsWith("/kaunter")) return "express-intake";
    if (path.startsWith("/m") || path.startsWith("/pit")) return "pit-live";
    if (path.startsWith("/foreman-job") || path.startsWith("/job")) return "foreman-job";
    if (path.startsWith("/saya")) return "customer-portal";
    if (path.startsWith("/katalog")) return "katalog";
  }
  return "dashboard";
};


export const normalizeRole = (role?: string): string => {
  if (!role) return "";
  const r = role.toLowerCase().trim();
  if (r === "owner" || r === "admin" || r === "hq" || r === "tauke" || r === "bos") return "owner";
  if (r === "kerani_1" || r === "cashier" || r === "sa" || r === "kerani" || r === "kerani1") return "kerani_1";
  if (r === "kerani_2" || r === "stor" || r === "store" || r === "kerani2") return "kerani_2";
  if (r === "foreman" || r === "mechanic" || r === "mekanik" || r === "chief") return "foreman";
  if (r === "affiliate" || r === "sales" || r === "ejen") return "affiliate";
  return r;
};

export const ROLE_TABS: Record<string, string[]> = {
  owner: [
    "finance",
    "settings",
    "owner-accounts",
    "owner-price",
    "owner-arahan",
    "staff",
    "staff-performance",
    "work-orders",
    "dashboard",
    "owner-desk",
    "loan-pipeline",
  ],
  kerani_1: [
    "express-intake",
    "work-orders",
    "pos-checkout",
    "quotations",
    "customers",
    "crm",
    "inbox",
    "leads",
    "loan-pipeline",
    "dashboard",
  ],
  kerani_2: [
    "inventory",
    "suppliers",
    "authenticity",
    "work-orders",
    "ecommerce-orders",
    "dashboard",
  ],
  foreman: [
    "pit-live",
    "work-orders",
    "photo-servis",
    "foreman-job",
    "dashboard",
  ],
  affiliate: [
    "affiliate",
    "dashboard",
  ],
};

export const PUBLIC_TABS = new Set([
  "katalog",
  "customer-portal",
  "passport",
  "track",
  "vo-view",
  "quote-view",
]);

export const isTabAllowed = (rawRole: string, tab: string): boolean => {
  if (PUBLIC_TABS.has(tab)) {
    return true;
  }
  const role = normalizeRole(rawRole);
  if (role === "owner" || role === "admin" || rawRole === "owner" || rawRole === "admin") {
    return true;
  }
  const allowed = ROLE_TABS[role];
  if (!allowed) {
    return false;
  }
  return allowed.includes(tab);
};

const Unauthorized = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center p-8 bg-white border-2 border-red-300 rounded-3xl shadow-sm max-w-md">
      <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center text-3xl mx-auto mb-4 border border-red-200">
        🛡️
      </div>
      <p className="text-zinc-950 font-black text-lg">Akses Disekat: Peranan Terhad</p>
      <p className="text-zinc-700 text-xs mt-2 font-medium leading-relaxed">
        Modul ini dikunci mengikut stesen kerja. Hanya <strong>Pemilik Sah (HQ Owner)</strong> mempunyai kebenaran untuk mengakses maklumat bank, profil syarikat, dan lejar ini.
      </p>
      <button
        type="button"
        onClick={() => {
          if (typeof window !== "undefined") window.location.hash = "dashboard";
        }}
        className="mt-5 px-5 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer active:scale-95"
      >
        Kembali ke Papan Utama
      </button>
    </div>
  </div>
);

export const App: React.FC = () => {
  const [activeTab, setActiveTabState] = useState<string>(getInitialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("ffmotor_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const handleToggleCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("ffmotor_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  // Penyelarasan dua hala Tab dengan URL Hash
  useCanvasParallax();

  const setActiveTab = (tab: string) => {
    const target = normalizeTab(tab);
    setActiveTabState(target);
    if (typeof window !== "undefined" && window.location.hash !== `#${target}`) {
      window.location.hash = target;
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash) {
        const target = normalizeTab(hash);
        if (target !== activeTab) {
          setActiveTabState(target);
        }
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [activeTab]);

  // Status Zero Trust Sesi Stesen
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser>(() => {
    try {
      const saved = localStorage.getItem("ffmotor_current_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.id === "string" && typeof parsed.role === "string") {
          return parsed;
        }
      }
      return DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });
  const [isStationModalOpen, setIsStationModalOpen] = useState<boolean>(false);

  const handleUserChange = (newUser: AuthenticatedUser) => {
    setCurrentUser(newUser);
    try {
      localStorage.setItem("ffmotor_current_user", JSON.stringify(newUser));
    } catch (err) {
      console.error("Gagal simpan sesi stesen:", err);
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ffmotor_current_user");
      if (!saved && currentUser?.id && currentUser.id !== DEFAULT_USER.id) {
        localStorage.setItem("ffmotor_current_user", JSON.stringify(currentUser));
      }
    } catch {
      /* simpan sesi gagal */
    }
  }, [currentUser]);

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [, setLoading] = useState(false);

  // Parameter untuk pautan pantas
  const [trackToken, setTrackToken] = useState("");
  const [passportPlate, setPassportPlate] = useState("");
  const [voToken, setVoToken] = useState("");
  const [quoteId, setQuoteId] = useState("q-1");

  const fetchWithTimeout = async (url: string, timeoutMs = 8000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const headers: Record<string, string> = {
        ...sessionHeader(),
      };
      if (currentUser?.id) {
        headers["x-ff-user-id"] = currentUser.id;
      }
      if (currentUser?.role) {
        headers["x-ff-user-role"] = currentUser.role;
      }
      const res = await fetch(url, { signal: controller.signal, headers });
      clearTimeout(timeoutId);
      if (!res.ok) return { success: false };
      return await res.json();
    } catch {
      clearTimeout(timeoutId);
      return { success: false };
    }
  };

  const loadData = async () => {
    try {
      // Jalankan seeder secara latar belakang tanpa menyekat UI
      if (!localStorage.getItem('ffmotor_seeded')) {
        fetchWithTimeout("/api/seed", 3000).then(() => {
          localStorage.setItem('ffmotor_seeded', '1');
        }).catch(() => null);
      }

      const [resWO, resProd, resVeh, resMoto, resLeads] = await Promise.all([
        fetchWithTimeout("/api/work-orders"),
        fetchWithTimeout("/api/products"),
        fetchWithTimeout("/api/vehicles"),
        fetchWithTimeout("/api/sales/motorcycles"),
        fetchWithTimeout("/api/leads"),
      ]);

      if (resWO?.success && resWO.workOrders) {
        setWorkOrders(resWO.workOrders);
        const activeWO = resWO.workOrders.find((w: any) => w.status !== "completed") || resWO.workOrders[0];
        if (activeWO?.approvalToken) {
          setTrackToken(activeWO.approvalToken);
        }
      }
      if (resProd?.success && resProd.products) setProducts(resProd.products);
      if (resVeh?.success && resVeh.vehicles) {
        setVehicles(resVeh.vehicles);
        if (resVeh.vehicles[0]?.plateNumber) {
          setPassportPlate(resVeh.vehicles[0].plateNumber);
        }
      }
      if (resMoto?.success && resMoto.motorcycles) setMotorcycles(resMoto.motorcycles);
      if (resLeads?.success && resLeads.leads) setLeads(resLeads.leads);
    } catch (err) {
      console.warn("Makluman sambungan stesen:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    const path = window.location.pathname;
    if (path.startsWith("/track/")) {
      setTrackToken(path.replace("/track/", ""));
      setActiveTab("track");
    } else if (path.startsWith("/passport/")) {
      setPassportPlate(decodeURIComponent(path.replace("/passport/", "")));
      setActiveTab("passport");
    } else if (path.startsWith("/vo/")) {
      setVoToken(path.replace("/vo/", ""));
      setActiveTab("vo-view");
    } else if (path.startsWith("/quote/")) {
      setQuoteId(path.replace("/quote/", ""));
      setActiveTab("quote-view");
    } else if (path.startsWith("/sa") || path.startsWith("/kaunter")) {
      setActiveTab("express-intake");
    } else if (path.startsWith("/m") || path.startsWith("/pit")) {
      setActiveTab("pit-live");
    } else if (path.startsWith("/saya")) {
      setActiveTab("customer-portal");
    } else if (path.startsWith("/katalog")) {
      setActiveTab("katalog");
    }

    return () => clearTimeout(safetyTimer);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'F1') { e.preventDefault(); setActiveTab('express-intake'); }
      if (e.key === 'F2') { e.preventDefault(); setActiveTab('pos-checkout'); }
      if (e.key === 'F3') { e.preventDefault(); setActiveTab('inventory'); }
      if (e.key === 'F9') { e.preventDefault(); setActiveTab('dashboard'); }
      if (e.key === 'Escape') { setIsStationModalOpen(false); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleSwitchStationRole = (roleKey: string) => {
    const roleMapping: Record<string, { id: string; name: string; role: "owner" | "kerani_1" | "kerani_2" | "foreman" | "affiliate" }> = {
      owner: { id: "usr_admin", name: "Tuan Farid (Owner HQ)", role: "owner" },
      kerani: { id: "usr_kerani1", name: "Siti Rahmah (Kaunter & POS)", role: "kerani_1" },
      kerani1: { id: "usr_kerani1", name: "Siti Rahmah (Kaunter & POS)", role: "kerani_1" },
      kerani2: { id: "usr_kerani2", name: "Hafiz (Stor & Stok)", role: "kerani_2" },
      foreman: { id: "usr_foreman", name: "Pak Mat (Foreman Lif)", role: "foreman" },
      affiliate: { id: "usr_affiliate", name: "Kamal (Showroom)", role: "affiliate" },
    };
    const target = roleMapping[roleKey] || roleMapping.owner;
    handleUserChange({
      ...target,
      email: `${target.id}@ffmotor.my`,
      method: "Pintasan Stesen Pintar",
    });
    setActiveTab("dashboard");
  };

  useHotkeys('alt+1', (e) => {
    e.preventDefault();
    tactileAudio.click();
    handleSwitchStationRole('owner');
    toast.success("Beralih ke Stesen Owner / Bos");
  });
  useHotkeys('alt+2', (e) => {
    e.preventDefault();
    tactileAudio.click();
    handleSwitchStationRole('kerani1');
    toast.success("Beralih ke Kaunter POS (Kerani 1)");
  });
  useHotkeys('alt+3', (e) => {
    e.preventDefault();
    tactileAudio.click();
    handleSwitchStationRole('kerani2');
    toast.success("Beralih ke Stor & Alat Ganti (Kerani 2)");
  });
  useHotkeys('alt+4', (e) => {
    e.preventDefault();
    tactileAudio.click();
    handleSwitchStationRole('foreman');
    toast.success("Beralih ke Pit-Lane Foreman");
  });
  useHotkeys('alt+5', (e) => {
    e.preventDefault();
    tactileAudio.click();
    handleSwitchStationRole('affiliate');
    toast.success("Beralih ke Showroom Jualan");
  });

  const openTrack = (token: string) => {
    setTrackToken(token);
    setActiveTab("track");
  };

  const openPassport = (plate: string) => {
    setPassportPlate(plate);
    setActiveTab("passport");
  };

  return (
    <div className="min-h-screen bg-transparent text-zinc-950 flex">
      <CanvasBackdrop />
      {/* 1. Sidebar Navigasi Enterprise (22 Stesen Operasi FFmotor) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={handleToggleCollapse}
        onOpenTrack={() => openTrack(trackToken)}
        onOpenPassport={() => openPassport(passportPlate)}
        currentUser={currentUser}
        onOpenStationModal={() => setIsStationModalOpen(true)}
        onOpenZeroTrustModal={() => setIsStationModalOpen(true)}
      />

      {/* 2. Kawasan Kandungan Utama - Widescreen Responsif (Lebar dinamik mengikut saiz sidebar) */}
      <div className={`relative z-10 flex-1 flex flex-col min-w-0 overflow-x-hidden transition-all duration-300 ${isSidebarCollapsed ? "lg:pl-20" : "lg:pl-72"}`}>
        {/* Top Header Bar */}
        <HeaderBar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          setActiveTab={setActiveTab}
          onQuickTrack={() => openTrack(trackToken)}
          onQuickPassport={() => openPassport(passportPlate)}
          currentUser={currentUser}
          onOpenStationModal={() => setIsStationModalOpen(true)}
          onOpenZeroTrustModal={() => setIsStationModalOpen(true)}
          onToggleCollapse={handleToggleCollapse}
          isSidebarCollapsed={isSidebarCollapsed}
          onOpenCommandPalette={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
        />

        {/* Bekas Halaman Dinamik */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {!isTabAllowed(currentUser.role, activeTab) ? (
            <Unauthorized />
          ) : (
            <>
          {/* SEKSYEN A: KAUNTER & SERVIS */}
          {activeTab === "dashboard" && (normalizeRole(currentUser.role) === "owner" || !["kerani_1", "kerani_2", "foreman", "affiliate"].includes(normalizeRole(currentUser.role))) && <OwnerDashboard />}
          {activeTab === "owner-desk" && <OwnerBoard />}
          {activeTab === "owner-price" && <MotorPrice />}
          {activeTab === "owner-accounts" && <AccountAdmin />}
          {activeTab === "owner-arahan" && <ArahanList />}
          {(activeTab === "photo-kedai" || activeTab === "photo-studio") && <PhotoStudio role="kerani_1" />}
          {activeTab === "photo-servis" && <PhotoStudio role="foreman" />}
          {activeTab === "dashboard" && normalizeRole(currentUser.role) === "kerani_1" && <Kerani1Dashboard />}
          {activeTab === "dashboard" && normalizeRole(currentUser.role) === "kerani_2" && <Kerani2Dashboard />}
          {activeTab === "dashboard" && normalizeRole(currentUser.role) === "foreman" && <ForemanDashboard />}
          {activeTab === "dashboard" && normalizeRole(currentUser.role) === "affiliate" && <AffiliateDashboard />}

          {activeTab === "work-orders" && (
            <WorkOrders
              workOrders={workOrders}
              products={products}
              vehicles={vehicles}
              onRefresh={loadData}
              onOpenTrack={openTrack}
            />
          )}

          {activeTab === "express-intake" && (
            <ExpressIntake
              vehicles={vehicles}
              onIntakeSuccess={(_woId, tok) => {
                loadData();
                openTrack(tok);
              }}
              onRefresh={loadData}
              onCancel={() => setActiveTab("work-orders")}
            />
          )}

          {activeTab === "pos-checkout" && !localStorage.getItem("ffmotor_staff_token") && (
            <div className="p-8 text-sm font-bold text-red-700">POS dikunci. Log masuk staf diperlukan. Tiada sesi pelayan, tiada jualan.</div>
          )}
          {activeTab === "pos-checkout" && localStorage.getItem("ffmotor_staff_token") && (
            <PosCheckout
              products={products}
              workOrders={workOrders}
              onRefreshProducts={loadData}
              onRefreshWorkOrders={loadData}
              onGoToWorkOrders={() => setActiveTab("work-orders")}
            />
          )}

          {(activeTab === "customers" || activeTab === "crm") && (
            <CustomerCRMHub />
          )}

          {activeTab === "quotations" && (
            <QuotationManager
              products={products}
              onRefresh={loadData}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {/* SEKSYEN B: LANTAI BENGKEL & PIT LIF */}
          {activeTab === "pit-live" && !localStorage.getItem("ffmotor_staff_token") && (
            <div className="p-8 text-sm font-bold text-red-700">Pit dikunci. Log masuk staf diperlukan.</div>
          )}
          {activeTab === "foreman-job" && <ForemanJob />}
          {activeTab === "pit-live" && localStorage.getItem("ffmotor_staff_token") && (
            <PitTerminal
              workOrders={workOrders}
              products={products}
              vehicles={vehicles}
              onRefresh={loadData}
              onOpenTrack={openTrack}
              onSwitchTerminal={() => setActiveTab("dashboard")}
            />
          )}

          {(activeTab === "warranty-issues" || activeTab === "warranty") && (
            <WarrantyIssues />
          )}

          {activeTab === "authenticity" && (
            <Authenticity />
          )}

          {/* SEKSYEN C: STOR ALAT GANTI & LOGISTIK */}
          {activeTab === "inventory" && !localStorage.getItem("ffmotor_staff_token") && (
            <div className="p-8 text-sm font-bold text-red-700">Stor dikunci. Log masuk staf diperlukan.</div>
          )}
          {activeTab === "inventory" && localStorage.getItem("ffmotor_staff_token") && (
            <Inventory
              products={products}
              onRefresh={loadData}
            />
          )}

          {activeTab === "suppliers" && (
            <SupplierOrders
              products={products}
              onRefreshProducts={loadData}
            />
          )}

          {activeTab === "ecommerce-orders" && (
            <EcommerceOrders />
          )}

          {/* SEKSYEN D: SHOWROOM, LOAN & SALES */}
          {activeTab === "motor-sales" && (
            <div className="space-y-6">
              <SalesPipelineKanban
                motorcycles={motorcycles}
                onOpenCustomer={() => setActiveTab("customers")}
              />
              <MotorSales
                motorcycles={motorcycles}
                onRefresh={loadData}
              />
            </div>
          )}

          {activeTab === "loan-pipeline" && (
            <LoanPipeline
              motorcycles={motorcycles}
              onRefresh={loadData}
            />
          )}

          {activeTab === "leads" && (
            <Leads
              leads={leads}
              onRefresh={loadData}
            />
          )}

          {activeTab === "bike-locks" && (
            <BikeLocks />
          )}

          {activeTab === "affiliate" && (
            <AffiliatePortal
              onBackToApp={() => setActiveTab("dashboard")}
            />
          )}

          {/* SEKSYEN E: PENGURUSAN HQ, KEWANGAN & KOMUNIKASI */}
          {activeTab === "finance" && (
            <FinanceLedger
              workOrders={workOrders}
              products={products}
            />
          )}

          {(activeTab === "staff" || activeTab === "staff-performance") && (
            <StaffManager />
          )}

          {activeTab === "inbox" && (
            <WorkshopInbox
              workOrders={workOrders}
              onOpenTrack={openTrack}
            />
          )}

          {activeTab === "campaigns" && (
            <Campaigns />
          )}

          {activeTab === "settings" && (
            <WorkshopSettings
              onSaved={loadData}
            />
          )}

          {/* STANDALONE PORTALS (AWAM / PELANGGAN) */}
          {activeTab === "customer-portal" && (
            <CustomerPortal
              vehicles={vehicles}
              workOrders={workOrders}
              onOpenPassport={openPassport}
              onOpenTrack={openTrack}
            />
          )}

          {activeTab === "track" && (
            <TrackLive
              token={trackToken}
              onBack={() => setActiveTab("dashboard")}
            />
          )}

          {activeTab === "passport" && (
            <Passport
              plate={passportPlate}
              onBack={() => setActiveTab("dashboard")}
            />
          )}

          {activeTab === "vo-view" && (
            <PublicVoView
              token={voToken}
              onBackToApp={() => setActiveTab("dashboard")}
            />
          )}

          {activeTab === "quote-view" && (
            <PublicQuoteView
              quoteId={quoteId}
              onBackToApp={() => setActiveTab("dashboard")}
            />
          )}

          {activeTab === "katalog" && (
            <PublicStorefront
              motorcycles={motorcycles}
              products={products}
              onBackToApp={() => setActiveTab("dashboard")}
              onOpenPassport={openPassport}
              onOpenCustomerPortal={() => setActiveTab("customer-portal")}
            />
          )}
        </>
          )}</main>
      </div>

      {/* Modal Pengesahan & Penukaran Petugas Stesen Bengkel */}
      <StaffStationModal
        isOpen={isStationModalOpen}
        currentUser={currentUser}
        onClose={() => setIsStationModalOpen(false)}
        onUserChange={handleUserChange}
      />

      {/* Stack Interaktif Global: Notifikasi & Command Palette */}
      <Toaster richColors position="top-right" closeButton />
      <CommandPalette
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.location.hash = tab;
        }}
        onSwitchRole={(role) => handleSwitchStationRole(role)}
      />
    </div>
  );
};
