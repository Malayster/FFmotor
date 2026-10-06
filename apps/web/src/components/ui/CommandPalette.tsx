import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import {
  Search,
  LayoutDashboard,
  Store,
  Boxes,
  Wrench,
  Bike,
  PlusCircle,
  FileText,
  Lock,
  Sparkles,
  Volume2,
  Receipt,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { tacticalAudio, tactileAudio } from '../../lib/audio';
import { fireVictoryCelebration } from '../../lib/confetti';
import { toast } from 'sonner';

interface CommandPaletteProps {
  onNavigate: (page: string) => void;
  onSwitchRole?: (role: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  onNavigate,
  onSwitchRole,
}) => {
  const [open, setOpen] = useState(false);

  // Toggle on Ctrl+K or Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) tacticalAudio.click();
          return !prev;
        });
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open]);

  const runCommand = (command: () => void) => {
    tactileAudio.click();
    command();
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm transition-opacity"
        onClick={() => setOpen(false)}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border-2 border-red-600 overflow-hidden z-10 animate-in fade-in-0 zoom-in-95 duration-150">
        <Command label="FFmotor Command Center" className="w-full">
          {/* Search Bar */}
          <div className="flex items-center px-4 border-b border-zinc-200 bg-zinc-50">
            <Search className="w-5 h-5 text-red-600 mr-3 shrink-0" />
            <Command.Input
              autoFocus
              placeholder="Cari stesen, buka job card, semak stok, atau tindakan pantas... (Ctrl + K)"
              className="w-full py-4 text-sm font-medium bg-transparent outline-none text-zinc-900 placeholder-zinc-400"
            />
            <span className="text-[10px] font-mono uppercase bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded font-bold">
              ESC untuk tutup
            </span>
          </div>

          {/* List */}
          <Command.List className="max-h-96 overflow-y-auto p-2 space-y-2 text-sm">
            <Command.Empty className="py-6 text-center text-zinc-400 text-xs font-mono">
              Tiada tindakan atau rekod ditemui.
            </Command.Empty>

            {/* STESEN KERJA */}
            <Command.Group heading="TUKAR STESEN KERJA" className="text-[11px] font-mono font-bold text-zinc-400 px-2 py-1">
              <Command.Item
                onSelect={() =>
                  runCommand(() => {
                    onSwitchRole?.('owner');
                    onNavigate('owner');
                    toast.success("Beralih ke Stesen Owner / Bos");
                  })
                }
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 text-zinc-900 font-medium data-[selected=true]:bg-zinc-900 data-[selected=true]:text-white transition-colors"
              >
                <div className="p-1.5 rounded bg-zinc-950 text-white data-[selected=true]:bg-red-600">
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-bold">Owner War Room</div>
                  <div className="text-xs text-zinc-500">Pusat telemetri kewangan, radar staf & audit laci</div>
                </div>
                <span className="text-[10px] font-mono opacity-60">Alt+1</span>
              </Command.Item>

              <Command.Item
                onSelect={() =>
                  runCommand(() => {
                    onSwitchRole?.('kerani');
                    onNavigate('kerani1');
                    toast.success("Beralih ke Kaunter POS (Kerani 1)");
                  })
                }
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 text-zinc-900 font-medium data-[selected=true]:bg-zinc-900 data-[selected=true]:text-white transition-colors"
              >
                <div className="p-1.5 rounded bg-red-600 text-white">
                  <Store className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-bold">Kaunter & POS (Kerani 1)</div>
                  <div className="text-xs text-zinc-500">Daftar pelanggan, bayaran tunai/QR, & resit</div>
                </div>
                <span className="text-[10px] font-mono opacity-60">Alt+2</span>
              </Command.Item>

              <Command.Item
                onSelect={() =>
                  runCommand(() => {
                    onSwitchRole?.('kerani2');
                    onNavigate('kerani2');
                    toast.success("Beralih ke Stor & Alat Ganti (Kerani 2)");
                  })
                }
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 text-zinc-900 font-medium data-[selected=true]:bg-zinc-900 data-[selected=true]:text-white transition-colors"
              >
                <div className="p-1.5 rounded bg-amber-600 text-white">
                  <Boxes className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-bold">Stor & Alat Ganti (Kerani 2)</div>
                  <div className="text-xs text-zinc-500">Kawalan stok, pesanan pembekal & amaran minimum</div>
                </div>
                <span className="text-[10px] font-mono opacity-60">Alt+3</span>
              </Command.Item>

              <Command.Item
                onSelect={() =>
                  runCommand(() => {
                    onSwitchRole?.('foreman');
                    onNavigate('foreman');
                    toast.success("Beralih ke Pit-Lane Foreman");
                  })
                }
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 text-zinc-900 font-medium data-[selected=true]:bg-zinc-900 data-[selected=true]:text-white transition-colors"
              >
                <div className="p-1.5 rounded bg-blue-600 text-white">
                  <Wrench className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-bold">Pit-Lane & Lif Servis (Foreman)</div>
                  <div className="text-xs text-zinc-500">Status 4-Bay Lif mekanik & baik pulih motor</div>
                </div>
                <span className="text-[10px] font-mono opacity-60">Alt+4</span>
              </Command.Item>

              <Command.Item
                onSelect={() =>
                  runCommand(() => {
                    onSwitchRole?.('affiliate');
                    onNavigate('affiliate');
                    toast.success("Beralih ke Showroom Jualan");
                  })
                }
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 text-zinc-900 font-medium data-[selected=true]:bg-zinc-900 data-[selected=true]:text-white transition-colors"
              >
                <div className="p-1.5 rounded bg-emerald-600 text-white">
                  <Bike className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-bold">Showroom & Jualan Motor (Affiliate)</div>
                  <div className="text-xs text-zinc-500">Stok motor baharu/terpakai & permohonan loan</div>
                </div>
                <span className="text-[10px] font-mono opacity-60">Alt+5</span>
              </Command.Item>
            </Command.Group>

            {/* TINDAKAN PANTAS OPERASI */}
            <Command.Group heading="TINDAKAN PANTAS OPERASI" className="text-[11px] font-mono font-bold text-zinc-400 px-2 py-1">
              <Command.Item
                onSelect={() =>
                  runCommand(() => {
                    onNavigate('express-intake');
                    toast.info("Membuka Pendaftaran Pantas (Express Intake)");
                  })
                }
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 text-zinc-900 font-medium data-[selected=true]:bg-zinc-900 data-[selected=true]:text-white transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-red-600" />
                <span className="flex-1 font-semibold">Daftar Motosikal Baru Masuk (Express Intake)</span>
              </Command.Item>

              <Command.Item
                onSelect={() =>
                  runCommand(() => {
                    onNavigate('inventory');
                    toast.info("Membuka Katalog Inventori & Stok");
                  })
                }
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 text-zinc-900 font-medium data-[selected=true]:bg-zinc-900 data-[selected=true]:text-white transition-colors"
              >
                <Boxes className="w-4 h-4 text-amber-600" />
                <span className="flex-1 font-semibold">Cari & Semak Baki Stok Alat Ganti</span>
              </Command.Item>

              <Command.Item
                onSelect={() =>
                  runCommand(() => {
                    onNavigate('quotations');
                    toast.info("Membuka Pengurus Sebut Harga");
                  })
                }
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 text-zinc-900 font-medium data-[selected=true]:bg-zinc-900 data-[selected=true]:text-white transition-colors"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="flex-1 font-semibold">Bina Sebut Harga Pelanggan (Quotation)</span>
              </Command.Item>

              <Command.Item
                onSelect={() =>
                  runCommand(() => {
                    onNavigate('locks');
                    toast.warning("Membuka Pengurusan Kunci Motosikal");
                  })
                }
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 text-zinc-900 font-medium data-[selected=true]:bg-zinc-900 data-[selected=true]:text-white transition-colors"
              >
                <Lock className="w-4 h-4 text-red-600" />
                <span className="flex-1 font-semibold">Kawalan Kunci Motosikal (Bike Locks)</span>
              </Command.Item>
            </Command.Group>

            {/* UTILITI & INTERAKSI */}
            <Command.Group heading="UTILITI & INTERAKTIF" className="text-[11px] font-mono font-bold text-zinc-400 px-2 py-1">
              <Command.Item
                onSelect={() =>
                  runCommand(() => {
                    fireVictoryCelebration();
                    tactileAudio.cashRegister();
                    toast.success("Letupan Konfeti Diaktifkan! Tahniah!");
                  })
                }
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 text-zinc-900 font-medium data-[selected=true]:bg-zinc-900 data-[selected=true]:text-white transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="flex-1">Uji Perayaan Visual (Victory Confetti)</span>
              </Command.Item>

              <Command.Item
                onSelect={() =>
                  runCommand(() => {
                    tactileAudio.success();
                    toast.info("Ujian Nada Audio Taktikal Web Audio");
                  })
                }
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-100 text-zinc-900 font-medium data-[selected=true]:bg-zinc-900 data-[selected=true]:text-white transition-colors"
              >
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span className="flex-1">Uji Maklum Balas Audio Haptik</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          {/* Footer bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-100 border-t border-zinc-200 text-[11px] text-zinc-500 font-mono">
            <div className="flex items-center gap-3">
              <span>Navigasi: <kbd className="bg-white px-1.5 py-0.5 rounded border border-zinc-300">↑</kbd> <kbd className="bg-white px-1.5 py-0.5 rounded border border-zinc-300">↓</kbd></span>
              <span>Pilih: <kbd className="bg-white px-1.5 py-0.5 rounded border border-zinc-300">↵ Enter</kbd></span>
            </div>
            <div className="text-red-600 font-bold">FFMOTOR 3S TELEMETRY v2.6</div>
          </div>
        </Command>
      </div>
    </div>
  );
};
