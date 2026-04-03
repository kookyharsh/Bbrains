"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, Loader2 } from "lucide-react";

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setCameraError(null);

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader-container");
      }

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setCameraError("No cameras found");
        return;
      }

      const rearCamera = cameras.find(c => c.label.toLowerCase().includes("back")) || cameras[0];

      await scannerRef.current.start(
        rearCamera.id,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScan(decodedText);
          stopScanning();
        },
        () => {}
      );

      setScanning(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start camera";
      setCameraError(message);
      onError?.(message);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop();
      setScanning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden bg-black/40 border border-white/10 min-h-[300px] flex items-center justify-center"
      >
        <div id="qr-reader-container" className="w-full" />
        {!scanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <Camera className="w-12 h-12 text-white/20" />
            <p className="text-sm text-white/40 font-medium">Camera not active</p>
          </div>
        )}
      </div>

      {cameraError && (
        <p className="text-sm text-red-400 text-center">{cameraError}</p>
      )}

      <div className="flex gap-3">
        {!scanning ? (
          <Button
            onClick={startScanning}
            className="flex-1 h-12 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold"
          >
            <Camera className="w-4 h-4 mr-2" />
            Start Scanner
          </Button>
        ) : (
          <Button
            onClick={stopScanning}
            variant="outline"
            className="flex-1 h-12 rounded-xl border-white/10 text-white font-bold"
          >
            <CameraOff className="w-4 h-4 mr-2" />
            Stop Scanner
          </Button>
        )}
      </div>
    </div>
  );
}
