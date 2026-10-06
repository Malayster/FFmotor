import { useEffect, useRef } from "react";

/**
 * useMotorsportParallax
 * Enjin fizik koordinat 2D/3D Parallax untuk platform FP MOTOR.
 * Menghasilkan nilai normalisasi --px (-1.0 hingga 1.0) dan --py (-1.0 hingga 1.0)
 * pada kontena rujukan menggunakan requestAnimationFrame dengan redaman 60fps.
 */
export function useMotorsportParallax<T extends HTMLElement = HTMLElement>() {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    const el = containerRef.current || document.documentElement;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      el.style.setProperty("--px", "0");
      el.style.setProperty("--py", "0");
      return;
    }

    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let rafId = 0;
    let isRunning = false;

    const tick = () => {
      // Redaman fizik (damping factor)
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      el.style.setProperty("--px", currentX.toFixed(4));
      el.style.setProperty("--py", currentY.toFixed(4));

      if (Math.abs(targetX - currentX) < 0.0005 && Math.abs(targetY - currentY) < 0.0005) {
        isRunning = false;
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const width = rect.width || window.innerWidth;
      const height = rect.height || window.innerHeight;
      
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;

      // Normalisasi -1.0 hingga 1.0
      targetX = Math.max(-1, Math.min(1, (relX / width) * 2 - 1));
      targetY = Math.max(-1, Math.min(1, (relY / height) * 2 - 1));

      if (!isRunning) {
        isRunning = true;
        rafId = requestAnimationFrame(tick);
      }
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      // Gamma: kiri/kanan (-90 hingga 90), Beta: depan/belakang (-180 hingga 180)
      targetX = Math.max(-1, Math.min(1, e.gamma / 45));
      targetY = Math.max(-1, Math.min(1, (e.beta - 45) / 45));

      if (!isRunning) {
        isRunning = true;
        rafId = requestAnimationFrame(tick);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // Sokongan giroskop mudah alih jika ada
    if (!finePointer && typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
      window.addEventListener("deviceorientation", handleDeviceOrientation, { passive: true });
    }

    return () => {
      isRunning = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", handlePointerMove);
      if (!finePointer && typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
        window.removeEventListener("deviceorientation", handleDeviceOrientation);
      }
    };
  }, []);

  return containerRef;
}
