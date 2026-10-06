import React, { useState } from "react";
import {
  Key,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Wrench,
  Package,
  Bike
} from "lucide-react";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: "owner" | "kerani_1" | "kerani_2" | "foreman" | "affiliate";
  method?: string;
  token?: string;
}

interface StaffStationModalProps {
  isOpen: boolean;
  currentUser: AuthenticatedUser;
  onClose: () => void;
  onUserChange: (user: AuthenticatedUser) => void;
}

export const PRESET_ACCOUNTS = [
  {
    role: "owner",
    name: "Tuan Farid (Owner/Admin HQ)",
    email: "admin@ffmotor.my",
    pin: "8899",
    avatar: "TF",
    icon: Key,
    tag: "Kawalan HQ",
    desc: "Lejar Harian, Untung P&L, Status 4 Pit, Akaun Staf & Tetapan Bank",
  },
  {
    role: "kerani_1",
    name: "Aiman Hakimi (Kerani 1 Kaunter)",
    email: "aiman@ffmotor.my",
    pin: "3344",
    avatar: "AH",
    icon: User,
    tag: "Kaunter & POS",
    desc: "Pendaftaran Intake, POS Jualan Kaunter, Aduan & Sebut Harga",
  },
  {
    role: "kerani_2",
    name: "Fauzi (Kerani 2 Stor)",
    email: "fauzi@ffmotor.my",
    pin: "2233",
    avatar: "FZ",
    icon: Package,
    tag: "Stor & Inventori",
    desc: "Pengiraan Rak Stok, Pesanan PO Pembekal, Pesanan Kurier & Kod Siri",
  },
  {
    role: "foreman",
    name: "Abang Din (Ketua Foreman)",
    email: "din@ffmotor.my",
    pin: "1122",
    avatar: "AD",
    icon: Wrench,
    tag: "Lantai Pit 4-Bay",
    desc: "Papan Lif Live, Kad Kerja Servis, Kualiti Fizikal & Tuntutan Waranti",
  },
  {
    role: "affiliate",
    name: "Zack (Showroom / Ejen)",
    email: "zack@ffmotor.my",
    pin: "5566",
    avatar: "ZK",
    icon: Bike,
    tag: "Showroom & Jualan",
    desc: "Inventori Motosikal, Saluran Loan, Leads Prospek & Kunci Sewa Beli",
  }
] as const;

const LOCAL_USER_ID: Record<(typeof PRESET_ACCOUNTS)[number]["role"], string> = {
  owner: "usr_admin",
  kerani_1: "usr_kerani1",
  kerani_2: "usr_kerani2",
  foreman: "usr_foreman",
  affiliate: "usr_affiliate",
};

function userFromPreset(account: (typeof PRESET_ACCOUNTS)[number]): AuthenticatedUser {
  return {
    id: LOCAL_USER_ID[account.role],
    name: account.name,
    email: account.email,
    role: account.role,
    method: "pin_stesen",
  };
}

async function readJson(res: Response): Promise<Record<string, unknown> | null> {
  const text = await res.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export const StaffStationModal: React.FC<StaffStationModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onUserChange,
}) => {
  const [pinInput, setPinInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/station/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinInput }),
      });

      const data = await readJson(res);
      const remoteUser = data?.user as AuthenticatedUser | undefined;
      if (data?.success && remoteUser) {
        if (typeof data.token === "string") {
          localStorage.setItem("ffmotor_staff_token", data.token);
        }
        onUserChange(remoteUser);
        setSuccessMsg(`Disahkan: Selamat bertugas, ${remoteUser.name}!`);
        setTimeout(() => onClose(), 800);
      } else if (data && data.success === false) {
        setErrorMsg(String(data.message || "PIN tidak sah."));
      } else {
        const local = PRESET_ACCOUNTS.find((account) => account.pin === pinInput);
        if (local) {
          const user = userFromPreset(local);
          onUserChange(user);
          setSuccessMsg(`Disahkan di stesen: ${user.name}`);
          setTimeout(() => onClose(), 800);
        } else {
          setErrorMsg("PIN tidak ditemui dalam senarai stesen bengkel.");
        }
      }
    } catch {
      const local = PRESET_ACCOUNTS.find((account) => account.pin === pinInput);
      if (local) {
        const user = userFromPreset(local);
        onUserChange(user);
        setSuccessMsg(`Disahkan di stesen: ${user.name}`);
        setTimeout(() => onClose(), 800);
      } else {
        setErrorMsg("Ralat sambungan stesen. Sila semak rangkaian.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFastSwitch = async (account: (typeof PRESET_ACCOUNTS)[number]) => {
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/station/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: account.pin }),
      });

      const data = await readJson(res);
      if (typeof data?.token === "string") {
        localStorage.setItem("ffmotor_staff_token", data.token);
      }
      const remoteUser = data?.user as AuthenticatedUser | undefined;
      const user = data?.success && remoteUser ? remoteUser : userFromPreset(account);
      onUserChange(user);
      setSuccessMsg(`Stesen bertukar: ${user.name}`);
      setTimeout(() => onClose(), 600);
    } catch {
      const user = userFromPreset(account);
      onUserChange(user);
      setSuccessMsg(`Stesen bertukar: ${user.name}`);
      setTimeout(() => onClose(), 600);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-zinc-950 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-black">
              <Key className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-zinc-950">Tukar Petugas Stesen Bengkel</h3>
              <p className="text-xs text-zinc-800 font-bold">
                Pilih stesen tugas atau masukkan 4-digit PIN untuk bertukar syif kerja.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-600 hover:text-zinc-950 p-1.5 rounded-lg text-lg font-black transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Petugas Semasa */}
        <div className="p-3.5 bg-zinc-50 rounded-2xl border-2 border-zinc-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black">
              {(currentUser?.name || "FP").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-600 block">Stesen Aktif Sekarang:</span>
              <p className="font-black text-zinc-950">{currentUser?.name || "Belum Ditentukan"}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-zinc-950 text-white font-mono font-black uppercase text-[11px]">
            {currentUser?.role || "STAF"}
          </span>
        </div>

        {/* Kad Pilihan Stesen Pantas */}
        <div className="space-y-3">
          <span className="text-[11px] font-black text-zinc-950 uppercase tracking-wider block">
            Pilih Stesen Petugas (1-Klik):
          </span>

          <div className="grid grid-cols-1 gap-2.5">
            {PRESET_ACCOUNTS.map((acc) => {
              const isCurrent = currentUser.role === acc.role;
              const IconComp = acc.icon;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleFastSwitch(acc)}
                  disabled={isLoading}
                  className={`p-3 rounded-2xl border-2 text-left transition flex items-center justify-between gap-3 cursor-pointer ${
                    isCurrent
                      ? "bg-white border-red-600 shadow-sm"
                      : "bg-zinc-50 border-zinc-200 hover:border-zinc-950 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        isCurrent ? "bg-red-600 text-white" : "bg-zinc-950 text-white"
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-zinc-950 text-xs truncate">{acc.name}</h4>
                        <span className="text-[9px] uppercase font-mono font-black px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-800">
                          {acc.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-700 font-bold truncate mt-0.5">
                        {acc.desc}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-black px-2 py-1 rounded bg-zinc-100 border border-zinc-300 text-zinc-950 shrink-0">
                    PIN: {acc.pin}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input PIN Manual */}
        <form onSubmit={handleVerifyPin} className="p-4 bg-zinc-50 rounded-2xl border-2 border-zinc-200 space-y-3">
          <span className="text-xs font-black text-zinc-950 block">
            Atau Masukkan 4-Digit PIN Petugas:
          </span>
          <div className="flex gap-2">
            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="PIN (cth: 8899, 3344)"
              className="flex-1 bg-white border-2 border-zinc-300 focus:border-red-600 text-center text-zinc-950 text-lg tracking-widest font-mono rounded-xl p-2 outline-none font-black"
            />
            <button
              type="submit"
              disabled={isLoading || pinInput.length < 4}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Sahkan PIN</span>
            </button>
          </div>
        </form>

        {/* Ralat / Kejayaan */}
        {errorMsg && (
          <div className="p-3 bg-white border-2 border-red-600 text-red-600 rounded-xl text-xs flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border-2 border-emerald-600 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-black">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
