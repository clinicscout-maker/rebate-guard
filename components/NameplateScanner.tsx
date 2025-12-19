'use client';

import React, { useRef, useState } from 'react';
import { Camera, RefreshCw, Smartphone } from 'lucide-react';
import { scanNameplate } from '@/app/actions/scan-nameplate';

type Props = {
    onScanComplete: (modelNumber: string, serialNumber?: string) => void;
};

export default function NameplateScanner({ onScanComplete }: Props) {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError("Image is too large. Please resize to under 5MB.");
            return;
        }

        setIsScanning(true);
        setError(null);

        // Convert to Base64
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64Content = event.target?.result as string;

            try {
                const result = await scanNameplate(base64Content);

                if (result.success && result.data) {
                    onScanComplete(result.data.model_number, result.data.serial_number);
                } else {
                    setError(result.error as string || "Could not identify text. Try again.");
                }
            } catch (err) {
                setError("Network or Server Error");
                console.error(err);
            } finally {
                setIsScanning(false);
                // Reset inputs so same file can be selected again
                if (cameraInputRef.current) cameraInputRef.current.value = '';
                if (galleryInputRef.current) galleryInputRef.current.value = '';
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="mb-6">
            {/* Hidden Input for Camera (Forces Camera on Mobile) */}
            <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={cameraInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
            {/* Hidden Input for Gallery (Allows File Picker) */}
            <input
                type="file"
                accept="image/*"
                ref={galleryInputRef}
                onChange={handleFileChange}
                className="hidden"
            />

            <div className="grid grid-cols-2 gap-3">
                {/* Camera Button */}
                <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={isScanning}
                    className={`py-4 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 transition-all active:scale-95 flex flex-col items-center justify-center gap-2 ${isScanning ? 'opacity-50 cursor-wait' : ''}`}
                >
                    {isScanning ? <RefreshCw className="animate-spin" size={24} /> : <Camera size={24} />}
                    <span className="font-bold text-sm">Take Photo</span>
                </button>

                {/* Gallery Button */}
                <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={isScanning}
                    className={`py-4 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95 flex flex-col items-center justify-center gap-2 ${isScanning ? 'opacity-50 cursor-wait' : ''}`}
                >
                    <Smartphone size={24} />
                    <span className="font-medium text-sm">Upload File</span>
                </button>
            </div>

            {/* Status Text */}
            <div className="mt-3 text-center">
                <span className="text-xs text-slate-500">
                    {isScanning ? 'Analyzing Nameplate...' : 'Auto-extracts Model & Serial'}
                </span>
            </div>

            {error && (
                <div className="mt-4 text-xs text-red-500 text-center font-medium bg-red-500/10 border border-red-500/20 py-2 px-3 rounded-lg animate-in fade-in slide-in-from-top-2">
                    {error}
                </div>
            )}
        </div>
    );
}
