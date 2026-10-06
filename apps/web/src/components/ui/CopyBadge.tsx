import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { tacticalAudio, tactileAudio } from '../../lib/audio';
import { TactileTooltip } from './TactileTooltip';

interface CopyBadgeProps {
  text: string;
  label?: string;
  className?: string;
}

export const CopyBadge: React.FC<CopyBadgeProps> = ({
  text,
  label,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    tactileAudio.success();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TactileTooltip content={copied ? "Tersalin ke Clipboard! ✓" : `Salin ${label || text}`}>
      <button
        type="button"
        onClick={handleCopy}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-xs transition-all active:scale-95 cursor-pointer border ${
          copied
            ? 'bg-emerald-50 text-emerald-700 border-emerald-500 shadow-sm'
            : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-zinc-300 hover:border-red-500'
        } ${className}`}
      >
        <span>{text}</span>
        {copied ? (
          <Check className="w-3 h-3 text-emerald-600 animate-in zoom-in-50" />
        ) : (
          <Copy className="w-3 h-3 text-zinc-400 group-hover:text-red-600" />
        )}
      </button>
    </TactileTooltip>
  );
};

