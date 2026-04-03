"use client";

import { QRCodeSVG } from "qrcode.react";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  label?: string;
}

export function QRCodeDisplay({ value, size = 256, label }: QRCodeDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10">
      {label && (
        <p className="text-sm font-bold text-white/60 uppercase tracking-widest">{label}</p>
      )}
      <div className="bg-white p-4 rounded-xl">
        <QRCodeSVG
          value={value}
          size={size}
          level="H"
          includeMargin
        />
      </div>
      <p className="text-xs text-white/40 font-mono break-all text-center max-w-xs">{value}</p>
    </div>
  );
}
