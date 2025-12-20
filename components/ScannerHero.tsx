'use client';

import React, { useState, useRef } from 'react';
import { Camera, Search, RefreshCw, AlertCircle } from 'lucide-react';
import ModelSearchInput from './ModelSearchInput';
import { scanNameplate } from '@/app/actions/scan-nameplate';

export default function ScannerHero() {
    const [searchValue, setSearchValue] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleScanClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError("Image is too large. Please resize to under 5MB.");
            return;
        }

        setIsScanning(true);
        setError(null);

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64Content = event.target?.result as string;

            try {
                const result = await scanNameplate(base64Content);

                if (result.success && result.data) {
                    setSearchValue(result.data.model_number);
                    // Optional: You could also handle serial number here if needed
                } else {
                    setError(result.error as string || "Could not identify text. Try again.");
                }
            } catch (err) {
                setError("Network or Server Error");
                console.error(err);
            } finally {
                setIsScanning(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-8">
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-1 border border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Left: Manual Search */}
                    <div className="p-6 flex flex-col justify-center">
                        <h3 className="text-white font-semibold text-lg mb-2 flex items-center gap-2">
                            <Search className="w-5 h-5 text-green-400" />
                            Smart Search
                        </h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Enter model number manually.
                        </p>
                        <ModelSearchInput
                            value={searchValue}
                            onChange={setSearchValue}
                            placeholder="e.g. 38MARB..."
                            className="bg-slate-950 border-slate-700 h-12 text-lg"
                        />
                    </div>

                    {/* Right: AI Scanner Button */}
                    <div className="relative group">
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        <button
                            onClick={handleScanClick}
                            disabled={isScanning}
                            className="w-full h-full min-h-[160px] bg-slate-950 hover:bg-slate-900 border-2 border-green-500/50 hover:border-green-400 rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer relative overflow-hidden shadow-lg shadow-green-900/10 group-hover:shadow-green-500/20"
                        >
                            {/* Animated processing overlay */}
                            {isScanning && (
                                <div className="absolute inset-0 bg-slate-900/90 z-10 flex flex-col items-center justify-center">
                                    <RefreshCw className="w-10 h-10 text-green-400 animate-spin mb-3" />
                                    <span className="text-green-400 font-bold animate-pulse">Processing...</span>
                                </div>
                            )}

                            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Camera className="w-8 h-8 text-green-400" />
                            </div>

                            <div className="text-center">
                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-green-300 transition-colors">
                                    Scan Nameplate (AI)
                                </h3>
                                <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                                    Auto-detect Model & Serial #
                                </p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Error Feedback */}
                {error && (
                    <div className="mx-6 mb-4 mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-200 text-sm">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
