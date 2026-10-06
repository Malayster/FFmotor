import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { Portfolio } from "./pages/Portfolio";
import { StaffLogin } from "./pages/StaffLogin";
import { TrackLive } from "./pages/TrackLive";
import { Passport } from "./pages/Passport";
import { PublicVoView } from "./pages/PublicVoView";
import { PublicQuoteView } from "./pages/PublicQuoteView";
import { PublicStorefront } from "./pages/PublicStorefront";
import { CustomerPortal } from "./pages/CustomerPortal";
import { Authenticity } from "./pages/Authenticity";
import { PublicLeadCapture } from "./pages/PublicLeadCapture";
import { RootErrorBoundary } from "./components/RootErrorBoundary";
import "./index.css";

// Interceptor sesi stesen dan penyesuaian API Worker automatik untuk semua panggilan /api/*
if (typeof window !== "undefined") {
  const WORKER_API_HOST = "https://fpmotor-api.espims.workers.dev";
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    let url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

    // Jika berjalan di Cloudflare Pages dan memanggil /api relatif, halakan terus ke Worker API
    if (url.startsWith("/api")) {
      const isCloudflarePages =
        window.location.hostname.includes("pages.dev") ||
        window.location.hostname.includes("fpmotor.my");
      if (isCloudflarePages) {
        url = `${WORKER_API_HOST}${url}`;
      }
    }

    if (url.includes("/api/")) {
      try {
        const rawUser = localStorage.getItem("ffmotor_current_user");
        const token = localStorage.getItem("ffmotor_staff_token");
        if (rawUser || token) {
          const user = rawUser ? JSON.parse(rawUser) : {};
          const headers = new Headers(init?.headers);
          const bearer = token || user?.token;
          if (bearer && !headers.has("authorization") && !headers.has("Authorization")) {
            headers.set("authorization", `Bearer ${bearer}`);
          }
          init = { ...init, headers };
        }
      } catch {
        /* teruskan permintaan */
      }
    }
    return originalFetch(url, init);
  };
}

const APP_HASH_ROUTES = new Set([
  "dashboard",
  "owner",
  "owner-desk",
  "owner-price",
  "owner-accounts",
  "owner-arahan",
  "pos-checkout",
  "pos",
  "inventory",
  "stor",
  "work-orders",
  "wo",
  "pit-live",
  "pit",
  "express-intake",
  "sa",
  "motor-sales",
  "loan-pipeline",
  "loan",
  "suppliers",
  "staff",
  "staff-performance",
  "quotations",
  "finance",
  "warranty",
  "warranty-issues",
  "crm",
  "customers",
  "campaigns",
  "settings",
  "photo-studio",
  "photo-kedai",
  "photo-servis",
  "bike-locks",
  "ecommerce-orders",
  "leads",
  "inbox",
  "affiliate",
]);

type RouteResult =
  | { type: "track"; token: string }
  | { type: "passport"; plate: string }
  | { type: "vo"; token: string }
  | { type: "quote"; quoteId: string }
  | { type: "katalog" }
  | { type: "portal" }
  | { type: "authenticity" }
  | { type: "lead" }
  | { type: "app" }
  | { type: "portfolio" };

function getRouteInfo(): RouteResult {
  if (typeof window === "undefined") {
    return { type: "portfolio" };
  }
  const rawPath = window.location.pathname;
  const path = rawPath.toLowerCase();
  const rawHash = window.location.hash.replace(/^#\/?/, "");
  const lowerHash = rawHash.toLowerCase();

  // 1. Laluan Penjejakan Status Kerja Pelanggan (Track Live)
  if (path.startsWith("/track/") || lowerHash.startsWith("track-") || lowerHash.startsWith("track/") || lowerHash === "track") {
    let token = "tok_vdf8899";
    if (path.startsWith("/track/")) {
      token = rawPath.split("/")[2] || "tok_vdf8899";
    } else if (lowerHash.startsWith("track-") || lowerHash.startsWith("track/")) {
      token = rawHash.replace(/^track[-/]/i, "") || "tok_vdf8899";
    }
    return { type: "track", token };
  }

  // 2. Laluan Pasport Motosikal Awam (Passport)
  if (path.startsWith("/passport/") || lowerHash.startsWith("passport-") || lowerHash.startsWith("passport/") || lowerHash === "passport") {
    let plate = "VDF 8899";
    if (path.startsWith("/passport/")) {
      plate = decodeURIComponent(rawPath.split("/")[2] || "VDF 8899");
    } else if (lowerHash.startsWith("passport-") || lowerHash.startsWith("passport/")) {
      plate = decodeURIComponent(rawHash.replace(/^passport[-/]/i, "") || "VDF 8899");
    }
    return { type: "passport", plate };
  }

  // 3. Laluan Kelulusan Penukaran Alat Ganti / VO Awam Pelanggan (Variation Order)
  if (path.startsWith("/vo/") || lowerHash.startsWith("vo-") || lowerHash.startsWith("vo/")) {
    let token = "";
    if (path.startsWith("/vo/")) {
      token = rawPath.split("/")[2] || "";
    } else {
      token = rawHash.replace(/^vo[-/]/i, "") || "";
    }
    return { type: "vo", token };
  }

  // 4. Laluan Sebut Harga Awam (Quotation)
  if (path.startsWith("/quote/") || lowerHash.startsWith("quote-") || lowerHash.startsWith("quote/")) {
    let quoteId = "";
    if (path.startsWith("/quote/")) {
      quoteId = rawPath.split("/")[2] || "";
    } else {
      quoteId = rawHash.replace(/^quote[-/]/i, "") || "";
    }
    return { type: "quote", quoteId };
  }

  // 5. Laluan Katalog & Showroom Motosikal Awam
  if (path === "/katalog" || path === "/kedai" || path === "/store" || lowerHash === "katalog" || lowerHash === "store") {
    return { type: "katalog" };
  }

  // 6. Portal Servis Pelanggan (Customer Portal)
  if (path === "/saya" || path === "/portal" || lowerHash === "saya" || lowerHash === "customer-portal") {
    return { type: "portal" };
  }

  // 7. Semakan Kod Siri Keaslian Alat Ganti
  if (path === "/sah" || path === "/authenticity" || lowerHash === "authenticity") {
    return { type: "authenticity" };
  }

  // 8. Borang Pendaftaran Lead Awam
  if (path === "/lead" || lowerHash === "lead") {
    return { type: "lead" };
  }

  // 9. Stesen Kerja & Terminal Staf (Perlu Pengesahan PIN Staf)
  const isAppPath =
    path.startsWith("/app") ||
    path.startsWith("/sistem") ||
    path.startsWith("/staff") ||
    path.startsWith("/admin") ||
    path.startsWith("/terminal");

  const isAppHash = APP_HASH_ROUTES.has(lowerHash);

  if (isAppPath || isAppHash) {
    return { type: "app" };
  }

  // Default: Laman Hadapan Portfolio Bengkel
  return { type: "portfolio" };
}

function Root() {
  const [route, setRoute] = useState<RouteResult>(getRouteInfo);
  const readStaff = () => {
    try {
      if (localStorage.getItem("ffmotor_staff_session") !== "1") return false;
      const raw = localStorage.getItem("ffmotor_current_user");
      if (!raw) return false;
      const user = JSON.parse(raw) as { id?: string; role?: string };
      return Boolean(user?.id && user?.role);
    } catch {
      return false;
    }
  };
  const [staff, setStaff] = useState(readStaff);

  useEffect(() => {
    const handleLocationChange = () => {
      setRoute(getRouteInfo());
      setStaff(readStaff());
    };

    window.addEventListener("hashchange", handleLocationChange);
    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("hashchange", handleLocationChange);
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  const goHome = () => {
    window.location.hash = "";
    setRoute(getRouteInfo());
  };

  // Paparan Awam Pelanggan (Tanpa Sekatan PIN Staf)
  if (route.type === "track") {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-4">
        <TrackLive token={route.token} onBack={goHome} />
      </div>
    );
  }

  if (route.type === "passport") {
    return (
      <div className="min-h-screen bg-white text-zinc-950 p-4">
        <Passport plate={route.plate} onBack={goHome} />
      </div>
    );
  }

  if (route.type === "vo") {
    return (
      <div className="min-h-screen bg-white text-zinc-950 p-4">
        <PublicVoView token={route.token} onBackToApp={goHome} />
      </div>
    );
  }

  if (route.type === "quote") {
    return (
      <div className="min-h-screen bg-white text-zinc-950 p-4">
        <PublicQuoteView quoteId={route.quoteId} onBackToApp={goHome} />
      </div>
    );
  }

  if (route.type === "katalog") {
    return (
      <div className="min-h-screen bg-white text-zinc-950">
        <PublicStorefront motorcycles={[]} products={[]} onBackToApp={goHome} />
      </div>
    );
  }

  if (route.type === "portal") {
    return (
      <div className="min-h-screen bg-white text-zinc-950">
        <CustomerPortal
          vehicles={[]}
          workOrders={[]}
          onOpenPassport={(plate) => {
            window.location.hash = `passport-${plate}`;
            setRoute(getRouteInfo());
          }}
          onOpenTrack={(tok) => {
            window.location.hash = `track-${tok}`;
            setRoute(getRouteInfo());
          }}
        />
      </div>
    );
  }

  if (route.type === "authenticity") {
    return (
      <div className="min-h-screen bg-white text-zinc-950 p-4">
        <Authenticity />
      </div>
    );
  }

  if (route.type === "lead") {
    return (
      <div className="min-h-screen bg-white text-zinc-950 p-4">
        <PublicLeadCapture />
      </div>
    );
  }

  // Jika di portal hadapan / portfolio awam
  if (route.type === "portfolio") {
    return <Portfolio />;
  }

  // Jika menuju ke terminal staf tetapi belum log masuk PIN 4 Digit
  if (!staff) {
    return (
      <StaffLogin
        onSuccess={() => {
          setStaff(true);
        }}
        onBack={goHome}
      />
    );
  }

  // Petugas staf berdaftar di stesen kerja
  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <Root />
    </RootErrorBoundary>
  </React.StrictMode>
);
