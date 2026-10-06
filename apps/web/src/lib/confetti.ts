import confetti from 'canvas-confetti';

/**
 * Trigger motorsport victory confetti celebration
 * Uses red, emerald green, carbon dark, and white motorsport particles
 */
export function fireVictoryCelebration() {
  const count = 120;
  const defaults = {
    origin: { y: 0.7 },
    colors: ['#dc2626', '#10b981', '#09090b', '#ffffff', '#ef4444'],
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });

  fire(0.2, {
    spread: 60,
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

/**
 * Micro confetti burst for quick actions (e.g. task completed, item verified)
 */
export function fireMicroBurst() {
  confetti({
    particleCount: 35,
    spread: 45,
    origin: { y: 0.85 },
    colors: ['#dc2626', '#10b981', '#18181b'],
    ticks: 100,
  });
}

