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
    const inputRef = useRef<HTMLInputElement>(null);

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
                // Reset input so same file can be selected again if needed
                if (inputRef.current) inputRef.current.value = '';
            }
        };
        reader.readAsDataURL(file);
    };

    const triggerCamera = () => {
        inputRef.current?.click();
    };

    return (
        <div className="mb-6">
            <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={inputRef}
                onChange={handleFileChange}
                className="hidden"
            />

            <button
                type="button"
                onClick={triggerCamera}
                disabled={isScanning}
                className={`w-full py-3 px-4 rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-300 transition-all group flex items-center justify-center gap-3 ${isScanning ? 'opacity-75 cursor-wait' : ''
                    }`}
            >
                <div className="p-2 bg-emerald-100 rounded-full text-emerald-600 group-hover:scale-110 transition-transform">
                    {isScanning ? <RefreshCw className="animate-spin" size={20} /> : <Camera size={20} />}
                </div>

                <div className="text-left">
                    <span className="block text-sm font-semibold text-emerald-900">
                        {isScanning ? 'Analyzing Nameplate...' : 'Smart Scan Nameplate'}
                    </span>
                    <span className="text-xs text-emerald-600">
                        Auto-fill Model Number via Gemini AI
                    </span>
                </div>
            </button>

            {error && (
                <div className="mt-2 text-xs text-red-500 text-center font-medium bg-red-50 py-1 px-2 rounded">
                    {error}
                </div>
            )}
        </div>
    );
}
