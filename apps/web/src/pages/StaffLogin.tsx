import React, { useState } from "react";
import { ArrowLeft, ShieldCheck, Key, User, Wrench, Package, Flame } from "lucide-react";

interface StaffLoginProps {
  onSuccess: () => void;
  onBack?: () => void;
}

export const StaffLogin: React.FC<StaffLoginProps> = ({ onSuccess, onBack }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.hash = "";
      window.location.pathname = "/";
    }
  };

  const loginWithPin = async (pinToUse: string) => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/station/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinToUse }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success || !data.user?.id) {
        setError(data?.message || "PIN tidak sah.");
        return;
      }
      localStorage.setItem("ffmotor_current_user", JSON.stringify({ ...data.user, token: data.token }));
      localStorage.setItem("ffmotor_staff_token", data.token || "");
      localStorage.setItem("ffmotor_staff_session", "1");
      onSuccess();
    } catch {
      setError("Pelayan tidak menjawab. Log masuk tidak dibuka.");
    } finally {
      setBusy(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (pin.length < 4) return;
    await loginWithPin(pin);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-black border-2 border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        
        {/* Butang Kembali */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-red-500" />
            <span>Kembali ke Web Rasmi FP Motor</span>
          </button>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-600 text-white font-black">
            TERMINAL STAF BENGKEL
          </span>
        </div>

        {/* Tajuk & Identiti Syarikat */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black uppercase tracking-tight text-white">FP MOTOR</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-red-500 font-bold">
              G ONE STOP ENT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-2 uppercase tracking-tight">
            Terminal Petugas Stesen
          </h1>
          <p className="text-xs text-zinc-400 font-bold mt-1">
            Log masuk admin dan staf guna PIN stesen. PIN tidak dipaparkan di laman ini.
          </p>
        </div>

        {/* Borang Input PIN */}
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-black uppercase text-zinc-300 block">
              Masukkan Kod PIN Stesen:
            </label>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              className="w-full bg-zinc-900 border-2 border-zinc-700 focus:border-red-600 rounded-2xl px-4 py-3.5 text-3xl tracking-[0.5em] text-center font-mono font-black text-white outline-none transition"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••"
              autoFocus
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-600/20 border border-red-600 text-red-400 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <button
            disabled={busy || pin.length < 4}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl py-3.5 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-red-600/30 cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            type="submit"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{busy ? "Mengesahkan PIN..." : "Buka Terminal Stesen"}</span>
          </button>
        </form>

        <div className="text-[11px] text-zinc-500 font-bold space-y-1">
          <p>Admin, kerani, foreman, dan jualan guna borang yang sama.</p>
          <p>PIN datang dari rekod staf. Minta pemilik jika lupa.</p>
        </div>

      </div>
    </div>
  );
}
