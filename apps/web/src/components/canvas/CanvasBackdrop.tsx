import React from "react";

/** Lapisan tetap di belakang seluruh platform. Kad dan jadual tidak ikut gerak. */
export const CanvasBackdrop: React.FC = () => {
  return (
    <div className="canvas-backdrop" aria-hidden>
      <div className="canvas-dots" />
      <div className="canvas-blob canvas-blob-red" />
      <div className="canvas-blob canvas-blob-ink" />
    </div>
  );
};

/** Tiga lapisan di dalam hero awam. Anjakan lebih besar daripada kanvas. */
export const HeroDepth: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = "",
  children,
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="hero-layer hero-layer-1" aria-hidden />
      <div className="hero-layer hero-layer-2" aria-hidden />
      <div className="hero-layer hero-layer-3" aria-hidden />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
