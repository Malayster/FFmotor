import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { HeaderBar } from "./components/layout/HeaderBar";
import { Dashboard } from "./pages/Dashboard";
import { WorkOrders } from "./pages/WorkOrders";
import { Inventory } from "./pages/Inventory";
import { Authenticity } from "./pages/Authenticity";
import { MotorSales } from "./pages/MotorSales";
import { Leads } from "./pages/Leads";
import { TrackLive } from "./pages/TrackLive";
import { Passport } from "./pages/Passport";
import { FinanceLedger } from "./pages/FinanceLedger";
import { CustomerDossier } from "./pages/CustomerDossier";
import { QuotationManager } from "./pages/QuotationManager";
import { WorkshopInbox } from "./pages/WorkshopInbox";
import { WarrantyIssues } from "./pages/WarrantyIssues";
import { BikeLocks } from "./pages/BikeLocks";
import { Campaigns } from "./pages/Campaigns";
import { CustomerPortal } from "./pages/CustomerPortal";
import { WorkOrder, Product, Vehicle, Motorcycle, Lead } from "./types";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // For preview links
  const [trackToken, setTrackToken] = useState("tok_yamaha_nvx_01");
  const [passportPlate, setPassportPlate] = useState("VDF8899");

  const loadData = async () => {
    try {
      // Auto seed if fresh
      await fetch("/api/seed").catch(() => null);

      const [resWO, resProd, resVeh, resMoto, resLeads] = await Promise.all([
        fetch("/api/work-orders").then((r) => r.json()).catch(() => ({ success: false })),
        fetch("/api/products").then((r) => r.json()).catch(() => ({ success: false })),
        fetch("/api/vehicles").then((r) => r.json()).catch(() => ({ success: false })),
        fetch("/api/sales/motorcycles").then((r) => r.json()).catch(() => ({ success: false })),
        fetch("/api/leads").then((r) => r.json()).catch(() => ({ success: false })),
      ]);

      if (resWO.success) setWorkOrders(resWO.workOrders);
      if (resProd.success) setProducts(resProd.products);
      if (resVeh.success) setVehicles(resVeh.vehicles);
      if (resMoto.success) setMotorcycles(resMoto.motorcycles);
      if (resLeads.success) setLeads(resLeads.leads);
    } catch (err) {
      console.error("Gagal memuat data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openTrack = (token: string) => {
    setTrackToken(token);
    setActiveTab("track");
  };

  const openPassport = (plate: string) => {
    setPassportPlate(plate);
    setActiveTab("passport");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar Navigasi Enterprise ala Johan30 */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onOpenTrack={() => openTrack(trackToken)}
        onOpenPassport={() => openPassport(passportPlate)}
      />

      {/* Main Content Area (With Left Margin on Desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Header Bar */}
        <HeaderBar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          setActiveTab={setActiveTab}
          onQuickTrack={() => openTrack(trackToken)}
          onQuickPassport={() => openPassport(passportPlate)}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
              <div className="w-10 h-10 rounded-full border-3 border-brand-500 border-t-transparent animate-spin" />
              <p className="text-xs text-slate-400 font-bold">Menghubungkan ke Cloudflare Edge & D1 Database...</p>
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && (
                <Dashboard
                  workOrders={workOrders}
                  products={products}
                  setActiveTab={setActiveTab}
                  onOpenTrack={openTrack}
                  onOpenPassport={openPassport}
                />
              )}

              {activeTab === "work-orders" && (
                <WorkOrders
                  workOrders={workOrders}
                  products={products}
                  vehicles={vehicles}
                  onRefresh={loadData}
                  onOpenTrack={openTrack}
                />
              )}

              {activeTab === "warranty-issues" && <WarrantyIssues />}

              {activeTab === "inventory" && (
                <Inventory products={products} onRefresh={loadData} />
              )}

              {activeTab === "authenticity" && <Authenticity />}

              {activeTab === "motor-sales" && (
                <MotorSales
                  motorcycles={motorcycles}
                  onRefresh={loadData}
                />
              )}

              {activeTab === "bike-locks" && <BikeLocks />}

              {activeTab === "quotations" && (
                <QuotationManager products={products} />
              )}

              {activeTab === "leads" && (
                <Leads leads={leads} onRefresh={loadData} />
              )}

              {activeTab === "finance" && (
                <FinanceLedger workOrders={workOrders} products={products} />
              )}

              {activeTab === "customers" && (
                <CustomerDossier
                  workOrders={workOrders}
                  vehicles={vehicles}
                  onOpenPassport={openPassport}
                />
              )}

              {activeTab === "inbox" && (
                <WorkshopInbox workOrders={workOrders} onOpenTrack={openTrack} />
              )}

              {activeTab === "campaigns" && <Campaigns />}

              {activeTab === "customer-portal" && (
                <CustomerPortal
                  vehicles={vehicles}
                  workOrders={workOrders}
                  onOpenPassport={openPassport}
                  onOpenTrack={openTrack}
                />
              )}

              {activeTab === "track" && (
                <TrackLive token={trackToken} onBack={() => setActiveTab("dashboard")} />
              )}

              {activeTab === "passport" && (
                <Passport plate={passportPlate} onBack={() => setActiveTab("dashboard")} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
