"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { X, Check, ZoomIn, ZoomOut, Loader2 } from "lucide-react";

interface PhotoCropModalProps {
  imageSrc: string;          // data-URL of the selected file
  onCropComplete: (blob: Blob) => void;
  onCancel: () => void;
}

// ── Canvas-based crop helper ────────────────────────────────────────────────
async function cropImageToBlob(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("No canvas context")); return; }

      ctx.drawImage(
        image,
        pixelCrop.x, pixelCrop.y,
        pixelCrop.width, pixelCrop.height,
        0, 0,
        pixelCrop.width, pixelCrop.height
      );

      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error("Canvas empty")),
        "image/jpeg",
        0.92
      );
    };
    image.onerror = reject;
  });
}

// ── Modal ───────────────────────────────────────────────────────────────────
export default function PhotoCropModal({
  imageSrc,
  onCropComplete,
  onCancel,
}: PhotoCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const handleCropComplete = useCallback((_: any, pixels: any) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const blob = await cropImageToBlob(imageSrc, croppedAreaPixels);
      onCropComplete(blob);
    } catch (e) {
      console.error("Crop failed:", e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-stone-950 border border-stone-800 rounded-2xl w-full max-w-sm flex flex-col overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800">
          <div>
            <h3 className="font-serif text-stone-100 font-bold text-base">Position Your Photo</h3>
            <p className="text-[11px] text-stone-500 mt-0.5">Drag to center your face · pinch or slide to zoom</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-stone-500 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crop area — 3:4 portrait ratio */}
        <div className="relative w-full bg-stone-900" style={{ height: 360 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={3 / 4}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
            style={{
              containerStyle: { background: "#0c0a09" },
              cropAreaStyle: {
                border: "2px solid rgba(201,162,74,0.65)",
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.62)",
              },
            }}
          />
        </div>

        {/* Zoom slider */}
        <div className="px-5 py-3 border-t border-stone-800 flex items-center gap-3">
          <ZoomOut className="w-4 h-4 text-stone-500 flex-shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-haldi-500 cursor-pointer"
          />
          <ZoomIn className="w-4 h-4 text-stone-500 flex-shrink-0" />
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 pt-1 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 border border-stone-700 text-stone-400 hover:text-white rounded-xl text-sm font-medium transition-colors hover:border-stone-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={processing}
            className="flex-1 py-2.5 bg-haldi-500 hover:bg-haldi-600 text-stone-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-wait"
          >
            {processing
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
              : <><Check className="w-4 h-4" /> Use This Photo</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
