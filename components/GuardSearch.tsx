'use client';

import React, { useState } from 'react';
import { Search, Shield, Info, ArrowRight } from 'lucide-react';
import { validateCompliance, EquipmentData, ValidationResult } from '@/lib/compliance';
import { ComplianceStatus } from './ComplianceStatus';
import dynamic from 'next/dynamic';

// Dynamic import for CertificateGenerator to avoid SSR issues with react-pdf
const CertificateGenerator = dynamic(() => import('./CertificateGenerator'), {
    ssr: false,
    loading: () => <p className="text-center text-sm text-gray-500">Loading generator...</p>
});

// Dynamic import for NameplateScanner to generally isolate it (though it's client-side safe)
const NameplateScanner = dynamic(() => import('./NameplateScanner'), {
    ssr: false
});

export default function GuardSearch() {
    const [outdoor, setOutdoor] = useState('');
    const [indoor, setIndoor] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [result, setResult] = useState<ValidationResult | null>(null);
    const [equipmentData, setEquipmentData] = useState<EquipmentData | null>(null);

    const handleScanComplete = (model: string) => {
        setOutdoor(model);
        // Could also populate serial if we had a field for it
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        setResult(null);

        // Mock search delay and data retrieval
        // In real app, this would query Supabase or scraper API
        setTimeout(() => {
            // Mock logic: If outdoor model contains "X", it's high efficiency. Else standard.
            // If it contains "FAIL", we force low stats.
            let seer2 = 16.0;
            let hspf2 = 8.5;

            if (outdoor.toUpperCase().includes('FAIL')) {
                seer2 = 14.0;
                hspf2 = 7.0;
            }

            // Randomize slightly for "FAIL" demo if typical inputs
            if (Math.random() > 0.8 && !outdoor.toUpperCase().includes('X')) {
                seer2 = 15.0; // borderline fail
            }

            const data: EquipmentData = {
                searchedOutdoorModel: outdoor,
                searchedIndoorModel: indoor,
                seer2,
                hspf2,
                region: 'Canada'
            };

            const validation = validateCompliance(data);
            setResult(validation);
            setEquipmentData(data);
            setIsSearching(false);
        }, 1500);
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Header - Security Check Vibe */}
            <div className="bg-slate-900 px-6 py-6 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-400 to-blue-500 opacity-75"></div>
                <Shield className="mx-auto mb-2 text-emerald-400" size={40} />
                <h2 className="text-2xl font-bold tracking-tight">RebateGuard</h2>
                <p className="text-slate-400 text-sm">Official Eligibility Validator</p>
            </div>

            <div className="p-6">
                <NameplateScanner onScanComplete={handleScanComplete} />

                <form onSubmit={handleSearch} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Outdoor Model Number</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={outdoor}
                                onChange={(e) => setOutdoor(e.target.value)}
                                placeholder="e.g. GUL-36-OUT"
                                className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-mono text-gray-800 placeholder-gray-400"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Indoor Model Number</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={indoor}
                                onChange={(e) => setIndoor(e.target.value)}
                                placeholder="e.g. GUL-36-IN"
                                className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-mono text-gray-800 placeholder-gray-400"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSearching}
                            className={`w-full flex items-center justify-center py-4 rounded-xl font-bold text-lg tracking-wide shadow-lg transition-all transform active:scale-95 ${isSearching
                                ? 'bg-slate-800 text-slate-400 cursor-wait'
                                : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-xl shadow-slate-900/20'
                                }`}
                        >
                            {isSearching ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                    Validating...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    RUN COMPLIANCE CHECK
                                    <ArrowRight size={20} />
                                </span>
                            )}
                        </button>
                    </div>
                </form>

                <ComplianceStatus result={result} />

                {result?.status === 'SAFE' && equipmentData && (
                    <CertificateGenerator data={equipmentData} />
                )}

                <div className="mt-8 flex items-center gap-3 p-4 bg-blue-50 text-blue-800 rounded-lg text-xs leading-relaxed">
                    <Info size={32} className="shrink-0" />
                    <p>
                        Validation checks against valid <strong>Canada Greener Homes Grant</strong> criteria (SEER2 ≥ 15.2, HSPF2 ≥ 7.8).
                    </p>
                </div>
            </div>
        </div>
    );
}
