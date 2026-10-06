import React, { useEffect } from 'react';
import { useMotionValue, useSpring, useTransform, motion } from 'framer-motion';

interface InteractiveNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

/**
 * Spring-animated odometer counter for metrics, currency, and quantities.
 * Numbers morph smoothly when changing.
 */
export const InteractiveNumber: React.FC<InteractiveNumberProps> = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) => {
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, {
    mass: 0.8,
    stiffness: 90,
    damping: 18,
  });

  const displayVal = useTransform(springVal, (current) => {
    const formatted = current.toLocaleString('en-MY', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  return (
    <motion.span className={`font-mono tracking-tight tabular-nums ${className}`}>
      {displayVal}
    </motion.span>
  );
};

