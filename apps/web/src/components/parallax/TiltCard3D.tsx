import React, { useRef, useState, useCallback } from "react";

interface TiltCard3DProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // darjah condong maksimum (default: 10)
  perspective?: number; // piksel perspektif (default: 1000)
  onClick?: () => void;
}

/**
 * TiltCard3D
 * Kad interaktif dengan kesan kedalaman 3D fizikal.
 * Elemen anak yang mempunyai kelas CSS `transform-style: preserve-3d` dan `translateZ(...)`
 * akan terapung keluar daripada permukaan kad semasa kursor bergerak.
 */
export const TiltCard3D: React.FC<TiltCard3DProps> = ({
  children,
  className = "",
  maxTilt = 10,
  perspective = 1000,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
    transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
  });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Kira sudut condong (-maxTilt hingga +maxTilt)
      const rotateX = -((y - centerY) / centerY) * maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      setStyle({
        transform: `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`,
        transition: "transform 0.08s ease-out",
      });
    },
    [maxTilt, perspective]
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        ...style,
        transformStyle: "preserve-3d",
      }}
      className={`relative will-change-transform ${isHovered ? "z-20" : "z-10"} ${className}`}
    >
      {children}
    </div>
  );
};
