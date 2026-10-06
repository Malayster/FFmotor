import React, { useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";

interface StaffLoginProps {
  onSuccess: () => void;
  onBack?: () => void;
}

export const StaffLogin: React.FC<StaffLoginProps> = ({ onSuccess, onBack }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleBack = () => {
    if (onBack) onBack();
    else {
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

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-black border-2 border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <button type="button" onClick={handleBack} className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 text-red-500" />
          <span>Kembali ke Web Rasmi FP Motor</span>
        </button>
        <h1 className="text-2xl font-black uppercase">Terminal Petugas Stesen</h1>
        <p className="text-xs text-zinc-400 font-bold">PIN tidak dipaparkan di laman ini.</p>
        <form onSubmit={(event) => { event.preventDefault(); if (pin.length >= 4) loginWithPin(pin); }} className="space-y-4">
          <input type="password" inputMode="numeric" maxLength={6} className="w-full bg-zinc-900 border-2 border-zinc-700 rounded-2xl px-4 py-3.5 text-3xl tracking-[0.5em] text-center font-mono" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="••••" autoFocus />
          {error && <p className="text-xs font-bold text-red-400 text-center">{error}</p>}
          <button disabled={busy || pin.length < 4} className="w-full bg-red-600 rounded-2xl py-3.5 font-black text-xs uppercase" type="submit">
            <ShieldCheck className="w-4 h-4 inline" /> {busy ? "Mengesahkan PIN..." : "Buka Terminal Stesen"}
          </button>
        </form>
        <p className="text-[11px] text-zinc-500 font-bold">PIN datang dari rekod staf. Minta pemilik jika lupa.</p>
      </div>
    </div>
  );
}
