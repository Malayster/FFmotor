import React, { useState, useEffect } from "react";
import { Navbar } from "./components/layout/Navbar";
import { Dashboard } from "./pages/Dashboard";
import { WorkOrders } from "./pages/WorkOrders";
import { Inventory } from "./pages/Inventory";
import { Authenticity } from "./pages/Authenticity";
import { MotorSales } from "./pages/MotorSales";
import { Leads } from "./pages/Leads";
import { TrackLive } from "./pages/TrackLive";
import { Passport } from "./pages/Passport";
import { WorkOrder, Product, Vehicle, Motorcycle, Lead } from "./types";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // For public preview modes
  const [trackToken, setTrackToken] = useState("tok_akmal_demo");
  const [passportPlate, setPassportPlate] = useState("VHG8821");

  const loadData = async () => {
    try {
      // Auto seed if fresh
      await fetch("/api/seed").catch(() => null);

      const [resWO, resProd, resVeh, resMoto, resLeads] = await Promise.all([
        fetch("/api/work-orders").then((r) => r.json()),
        fetch("/api/products").then((r) => r.json()),
        fetch("/api/vehicles").then((r) => r.json()),
        fetch("/api/sales/motorcycles").then((r) => r.json()),
        fetch("/api/leads").then((r) => r.json()),
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
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickTrack={() => openTrack(trackToken)}
        onQuickPassport={() => openPassport(passportPlate)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
            <div className="w-10 h-10 rounded-full border-3 border-brand-500 border-t-transparent animate-spin" />
            <p className="text-xs text-slate-400 font-bold">Menghubungkan ke Cloudflare Edge...</p>
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

            {activeTab === "inventory" && (
              <Inventory products={products} onRefresh={loadData} />
            )}

            {activeTab === "authenticity" && <Authenticity />}

            {activeTab === "motor-sales" && (
              <MotorSales motorcycles={motorcycles} onRefresh={loadData} />
            )}

            {activeTab === "leads" && (
              <Leads leads={leads} onRefresh={loadData} />
            )}

            {activeTab === "track" && (
              <TrackLive token={trackToken} onBack={() => setActiveTab("work-orders")} />
            )}

            {activeTab === "passport" && (
              <Passport plate={passportPlate} onBack={() => setActiveTab("dashboard")} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>FFmotor Workshop Management System • 100% Cloudflare Native (Workers, D1, R2, Cron)</p>
      </footer>
    </div>
  );
};

