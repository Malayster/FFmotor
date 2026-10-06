import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import {
  TrendingUp,
  DollarSign,
  Activity,
  Award,
  Users,
  Calendar,
  Flame,
  Wrench,
  Bike,
  CheckCircle2,
  Sparkles,
  Zap,
  Clock
} from "lucide-react";

export const WorkshopAnalyticsCharts: React.FC = () => {
  const [timeframe, setTimeframe] = useState<"7d" | "30d">("7d");

  // Canvas refs
  const revenueTrendCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const revenueDoughnutCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mechanicBarCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const funnelCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Chart instances refs
  const revenueTrendChartRef = useRef<Chart | null>(null);
  const revenueDoughnutChartRef = useRef<Chart | null>(null);
  const mechanicBarChartRef = useRef<Chart | null>(null);
  const funnelChartRef = useRef<Chart | null>(null);

  // 1. Data Trend Hasil & Keuntungan
  useEffect(() => {
    if (!revenueTrendCanvasRef.current) return;

    if (revenueTrendChartRef.current) {
      revenueTrendChartRef.current.destroy();
    }

    const ctx = revenueTrendCanvasRef.current.getContext("2d");
    if (!ctx) return;

    const labels =
      timeframe === "7d"
        ? ["Isn", "Sel", "Rab", "Kha", "Jum", "Sab", "Ahd"]
        : ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"];

    const laborData = timeframe === "7d" ? [1200, 1450, 1300, 1600, 2200, 2100, 950] : [7200, 8400, 9100, 10500];
    const partsData = timeframe === "7d" ? [950, 1100, 850, 1350, 1850, 1600, 600] : [5400, 6100, 7300, 8200];
    const motorData = timeframe === "7d" ? [300, 500, 450, 800, 1200, 1500, 400] : [3200, 4500, 5800, 7100];

    revenueTrendChartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Upah Buruh (100% Margin)",
            data: laborData,
            borderColor: "#dc2626", // motorsport red
            backgroundColor: "rgba(220, 38, 38, 0.2)",
            fill: true,
            tension: 0.35,
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: "Alat Ganti & Tayar (35% Margin)",
            data: partsData,
            borderColor: "#ffffff", // pure white
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: "Margin Jualan Motosikal",
            data: motorData,
            borderColor: "#a1a1aa", // zinc-400
            backgroundColor: "rgba(161, 161, 170, 0.08)",
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              color: "#94a3b8",
              font: { size: 11, weight: "bold" },
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
          tooltip: {
            backgroundColor: "#0f172a",
            titleColor: "#f8fafc",
            bodyColor: "#cbd5e1",
            padding: 10,
            boxPadding: 4,
            callbacks: {
              label: (context) => ` ${context.dataset.label}: RM ${(context.parsed.y || 0).toLocaleString()}`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: "rgba(148, 163, 184, 0.1)" },
            ticks: { color: "#94a3b8", font: { size: 11, weight: "bold" } },
          },
          y: {
            grid: { color: "rgba(148, 163, 184, 0.1)" },
            ticks: {
              color: "#94a3b8",
              font: { size: 11 },
              callback: (value) => `RM ${value}`,
            },
          },
        },
      },
    });

    return () => {
      if (revenueTrendChartRef.current) revenueTrendChartRef.current.destroy();
    };
  }, [timeframe]);

  // 2. Data Donut Pecahan Punca Hasil
  useEffect(() => {
    if (!revenueDoughnutCanvasRef.current) return;

    if (revenueDoughnutChartRef.current) {
      revenueDoughnutChartRef.current.destroy();
    }

    const ctx = revenueDoughnutCanvasRef.current.getContext("2d");
    if (!ctx) return;

    revenueDoughnutChartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Upah Buruh Servis (54%)", "Alat Ganti & Minyak (31%)", "Jualan Motosikal (15%)"],
        datasets: [
          {
            data: [54, 31, 15],
            backgroundColor: ["#dc2626", "#ffffff", "#52525b"],
            borderWidth: 3,
            borderColor: "#111114",
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#cbd5e1",
              font: { size: 11, weight: "bold" },
              padding: 14,
              usePointStyle: true,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.label}: ${context.parsed}% daripada jumlah aliran tunai`,
            },
          },
        },
      },
    });

    return () => {
      if (revenueDoughnutChartRef.current) revenueDoughnutChartRef.current.destroy();
    };
  }, []);

  // 3. Data Bar Prestasi Mekanik Lif
  useEffect(() => {
    if (!mechanicBarCanvasRef.current) return;

    if (mechanicBarChartRef.current) {
      mechanicBarChartRef.current.destroy();
    }

    const ctx = mechanicBarCanvasRef.current.getContext("2d");
    if (!ctx) return;

    mechanicBarChartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Sifu Halim (Bay 1)", "Danial (Bay 2)", "Azman (Bay 3)", "Farhan (Backup Bay 4)"],
        datasets: [
          {
            label: "Motosikal Siap",
            data: [14, 11, 8, 4],
            backgroundColor: "#dc2626",
            borderRadius: 6,
          },
          {
            label: "Komisen Dijana (RM x10)",
            data: [18.9, 14.8, 10.8, 5.4],
            backgroundColor: "#ffffff",
            borderRadius: 6,
          },
          {
            label: "Purata Masa Lif (Minit)",
            data: [36, 42, 58, 45],
            backgroundColor: "#71717a",
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              color: "#a1a1aa",
              font: { size: 10, weight: "bold" },
              usePointStyle: true,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#a1a1aa", font: { size: 10, weight: "bold" } },
          },
          y: {
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#a1a1aa", font: { size: 10 } },
          },
        },
      },
    });

    return () => {
      if (mechanicBarChartRef.current) mechanicBarChartRef.current.destroy();
    };
  }, []);

  // 4. Data Corong Saluran Jualan Pinjaman Motor (Horizontal Bar Funnel)
  useEffect(() => {
    if (!funnelCanvasRef.current) return;

    if (funnelChartRef.current) {
      funnelChartRef.current.destroy();
    }

    const ctx = funnelCanvasRef.current.getContext("2d");
    if (!ctx) return;

    funnelChartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: [
          "1. Prospek Masuk (Showroom)",
          "2. Hantar Dokumen Slip Gaji",
          "3. Lulus Pinjaman (AEON)",
          "4. Pendaftaran JPJ Plat Siap",
          "5. Serah Kunci Motosikal"
        ],
        datasets: [
          {
            label: "Unit Motosikal",
            data: [28, 18, 12, 10, 9],
            backgroundColor: [
              "#dc2626",
              "#ef4444",
              "#f87171",
              "#e4e4e7",
              "#ffffff"
            ],
            borderRadius: 6,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.parsed.x} unit pembeli dalam fasa ini`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#a1a1aa", font: { size: 10 } },
          },
          y: {
            grid: { display: false },
            ticks: { color: "#ffffff", font: { size: 10, weight: "bold" } },
          },
        },
      },
    });

    return () => {
      if (funnelChartRef.current) funnelChartRef.current.destroy();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Pusat Analitik */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 spike-card p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white font-black shadow-lg shadow-red-600/30">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-black px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30">
                TELEMETRI PRESTASI LANGSUNG (CHART.JS)
              </span>
              <span className="text-[10px] text-zinc-300 font-mono font-bold flex items-center gap-1">
                <Flame className="w-3 h-3 text-red-500 animate-pulse" />
                Pulsar Jualan Aktif
              </span>
            </div>
            <h2 className="text-xl font-black mt-0.5">Carta & Analitik Prestasi Cawangan 3S</h2>
          </div>
        </div>

        {/* Filter Tempoh Masa */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-zinc-200 text-xs font-bold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTimeframe("7d")}
            className={`px-3 py-1.5 rounded-xl transition ${
              timeframe === "7d" ? "spike-btn-red text-xs py-1.5 px-3" : "text-zinc-400 hover:text-red-600"
            }`}
          >
            7 Hari Lepas
          </button>
          <button
            type="button"
            onClick={() => setTimeframe("30d")}
            className={`px-3 py-1.5 rounded-xl transition ${
              timeframe === "30d" ? "spike-btn-red text-xs py-1.5 px-3" : "text-zinc-400 hover:text-red-600"
            }`}
          >
            30 Hari Bulan Ini
          </button>
        </div>
      </div>

      {/* 4 Meter Tolok Nadi Eksekutif (Speedometers / Gauges) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Meter 1: Sasaran Hari Ini */}
        <div className="spike-card p-5 relative overflow-hidden flex flex-col justify-between group hover:border-red-600 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Sasaran Harian</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-600 text-white font-black">
              79.2% Tercapai
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black ">RM 1,980</span>
            <span className="text-xs text-zinc-500">/ RM 2,500</span>
          </div>
          {/* Progress Bar Glow */}
          <div className="mt-3 w-full bg-white h-2.5 rounded-full overflow-hidden border border-zinc-200 p-0.5">
            <div
              className="bg-red-600 h-full rounded-full transition-all duration-500 shadow-sm shadow-red-600/50"
              style={{ width: "79.2%" }}
            />
          </div>
          <p className="text-[11px] text-zinc-300 font-medium mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-red-500" />
            Lagi RM 520 untuk capai bonus syif hari ini!
          </p>
        </div>

        {/* Meter 2: Sasaran Bulan Ini */}
        <div className="spike-card p-5 relative overflow-hidden flex flex-col justify-between group hover:border-red-600 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Sasaran Bulan Semasa</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-black font-black">
              74.1%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black ">RM 48,200</span>
            <span className="text-xs text-zinc-500">/ RM 65,000</span>
          </div>
          <div className="mt-3 w-full bg-white h-2.5 rounded-full overflow-hidden border border-zinc-200 p-0.5">
            <div
              className="bg-red-600 h-full rounded-full transition-all duration-500"
              style={{ width: "74.1%" }}
            />
          </div>
          <p className="text-[11px] text-zinc-400 mt-2">Baki 9 hari operasi untuk penutupan bulan.</p>
        </div>

        {/* Meter 3: Purata Masa Servis Lif Pit */}
        <div className="spike-card p-5 relative overflow-hidden flex flex-col justify-between group hover:border-red-600 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Kelajuan Lif Pit</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-400 font-black border border-emerald-200">
              Pantas (-7 min)
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black ">38 min</span>
            <span className="text-xs text-zinc-500">/ sasaran 45 min</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-200 pt-2">
            <span>Kapasiti Lif: 4 Bay Aktif</span>
            <span className="text-red-500 font-bold">100% Beroperasi</span>
          </div>
        </div>

        {/* Meter 4: Anggaran Untung Bersih (Net Margin) */}
        <div className="spike-card p-5 relative overflow-hidden flex flex-col justify-between group hover:border-red-600 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Margin Untung Bersih</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-600 text-white font-black">
              62.5% Margin
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black ">RM 3,031</span>
            <span className="text-xs text-zinc-500">hari ini</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-200 pt-2">
            <span>Buruh (RM2,261) + Parts (RM770)</span>
            <span className="text-emerald-400 font-bold">Terkawal</span>
          </div>
        </div>
      </div>

      {/* Grid Utama 2 Ruang: Graf Aliran Hasil (Besar) + Donut Sumber Duit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Graf Aliran Garisan & Area (2 Kolum) */}
        <div className="lg:col-span-2 spike-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-red-500" />
                  Aliran Hasil & Keuntungan Mengikut Saluran
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Perbandingan hasil buruh lif, jualan alat ganti POS, dan komisen jualan motosikal.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-red-400 bg-red-600/10 px-2.5 py-1 rounded-xl border border-red-500/20">
                +18.4% vs Minggu Lalu
              </span>
            </div>

            <div className="h-72 w-full">
              <canvas ref={revenueTrendCanvasRef} />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
            <span>💡 Hari kemuncak minggu ini: <strong className="">Jumaat (RM 5,250)</strong></span>
            <span>Kemaskini automatik daripada Cloudflare D1 & POS</span>
          </div>
        </div>

        {/* 2. Donut Pecahan Punca Duit (1 Kolum) */}
        <div className="spike-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-red-500" />
              Punca Pendapatan Bengkel
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Nisbah punca tunai masuk bagi setiap RM100.
            </p>

            <div className="h-64 w-full mt-4 flex items-center justify-center">
              <canvas ref={revenueDoughnutCanvasRef} />
            </div>
          </div>

          <div className="mt-3 p-3 rounded-2xl bg-white border border-zinc-200 text-[11px] text-zinc-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-red-500 font-bold">● Upah Buruh:</span>
              <span className="font-mono font-bold ">RM 2,660 (Kecairan Pantas)</span>
            </div>
            <div className="flex justify-between">
              <span className=" font-bold">● Alat Ganti & Tayar:</span>
              <span className="font-mono font-bold ">RM 1,420</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Bawah: Prestasi Mekanik Lif Pit + Corong Penukaran Jualan Motosikal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Bar Chart Prestasi & Kelajuan Mekanik */}
        <div className="spike-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black flex items-center gap-2">
                <Wrench className="w-4 h-4 text-red-500" />
                Prestasi & Produktiviti Mekanik Pit
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Perbandingan unit motor disiapkan, purata minit di lif dan komisen dijana.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-600/20 text-red-400 font-bold border border-red-500/30">
              37 Motor Selesai
            </span>
          </div>

          <div className="h-64 w-full">
            <canvas ref={mechanicBarCanvasRef} />
          </div>

          <div className="mt-3 pt-3 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-400">
            <span>🏆 Mekanik terpantas: <strong className="">Sifu Halim (36 minit)</strong></span>
            <span>Komisen 15% dikira automatik</span>
          </div>
        </div>

        {/* 4. Corong Jualan Pinjaman Motosikal (Sales Funnel) */}
        <div className="spike-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black flex items-center gap-2">
                <Bike className="w-4 h-4 " />
                Corong Penukaran Pinjaman & Jualan Motosikal
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Jejak kecekapan daripada prospek masuk sehingga penyerahan kunci di showroom.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 font-bold border border-white/20">
              Kadar: 32.1%
            </span>
          </div>

          <div className="h-64 w-full">
            <canvas ref={funnelCanvasRef} />
          </div>

          <div className="mt-3 pt-3 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-400">
            <span>🎯 12 unit lulus AEON minggu ini</span>
            <span className=" font-bold">9 unit telah diserah kunci</span>
          </div>
        </div>
      </div>
    </div>
  );
};

