import React from "react";
import { Bike, Package, Wrench, Search, ShoppingBag } from "lucide-react";

interface MobileActionDockProps {
  cartCount: number;
  onOpenCart: () => void;
}

export const MobileActionDock: React.FC<MobileActionDockProps> = ({
  cartCount,
  onOpenCart,
}) => {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-zinc-950/95 backdrop-blur-md border-t-2 border-red-600 px-3 py-2 shadow-2xl safe-area-bottom">
      <nav className="flex items-center justify-around max-w-md mx-auto">
        
        {/* Showroom Motor */}
        <a
          href="#showroom"
          className="flex flex-col items-center justify-center p-1.5 text-zinc-400 hover:text-white active:text-red-500 transition cursor-pointer select-none"
        >
          <Bike className="w-5 h-5 text-red-500" />
          <span className="text-[10px] font-mono font-black uppercase mt-0.5">Showroom</span>
        </a>

        {/* Alat Ganti */}
        <a
          href="#ecommerce"
          className="flex flex-col items-center justify-center p-1.5 text-zinc-400 hover:text-white active:text-red-500 transition cursor-pointer select-none"
        >
          <Package className="w-5 h-5 text-zinc-300" />
          <span className="text-[10px] font-mono font-black uppercase mt-0.5">Alat Ganti</span>
        </a>

        {/* Pit Bengkel */}
        <a
          href="#servis"
          className="flex flex-col items-center justify-center p-1.5 text-zinc-400 hover:text-white active:text-red-500 transition cursor-pointer select-none"
        >
          <Wrench className="w-5 h-5 text-red-500" />
          <span className="text-[10px] font-mono font-black uppercase mt-0.5">Pit 4-Bay</span>
        </a>

        {/* Semak Plat */}
        <a
          href="#jejak"
          className="flex flex-col items-center justify-center p-1.5 text-zinc-400 hover:text-white active:text-red-500 transition cursor-pointer select-none"
        >
          <Search className="w-5 h-5 text-emerald-400" />
          <span className="text-[10px] font-mono font-black uppercase mt-0.5">Semak Plat</span>
        </a>

        {/* Butang Beg / Troli */}
        <button
          type="button"
          onClick={onOpenCart}
          className="relative flex flex-col items-center justify-center p-1.5 text-white active:scale-95 transition cursor-pointer select-none"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-white" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2.5 w-4 h-4 rounded-full bg-red-600 text-white font-mono text-[9px] flex items-center justify-center font-black animate-pulse">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono font-black uppercase mt-0.5 text-red-500">Troli</span>
        </button>

      </nav>
    </div>
  );
};
