'use client';

import React from 'react';
import { X } from 'lucide-react';
import NameplateScanner from './NameplateScanner';

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

export default function ScannerModal({ isOpen, onClose }: Props) {
    if (!isOpen) return null;

    const [hasAgreed, setHasAgreed] = React.useState(false);
    const [isManualMode, setIsManualMode] = React.useState(false);
    const [manualData, setManualData] = React.useState({ brand: '', model: '', serial: '' });

    const handleScanComplete = (model: string, serial?: string) => {
        // For now, just show an alert or log it. 
        // In a real app, this would redirect to a result page or show compliance data.
        alert(`Scanned!\nModel: ${model}\nSerial: ${serial || 'N/A'}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Scan Equipment</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="text-slate-300 text-sm mb-6">
                    Take a clear photo of the data plate. We'll extract the model number to verify rebate eligibility.
                </div>

                {/* Consent Checkbox */}
                <div className="mb-6 flex items-start gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                    <input
                        type="checkbox"
                        id="terms-consent"
                        checked={hasAgreed}
                        onChange={(e) => setHasAgreed(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-800 text-green-500 focus:ring-green-500/50"
                    />
                    <label htmlFor="terms-consent" className="text-sm text-slate-400">
                        I agree to the <a href="/terms" target="_blank" className="text-green-400 hover:underline">Terms of Service</a> and acknowledge that results are estimates only.
                    </label>
                </div>

                <div className={`transition-opacity duration-200 ${!hasAgreed ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                    {isManualMode ? (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!manualData.model) return;
                                handleScanComplete(manualData.model, manualData.serial);
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Brand (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-green-500 outline-none"
                                    value={manualData.brand}
                                    onChange={e => setManualData({ ...manualData, brand: e.target.value })}
                                    placeholder="e.g. Carrier"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Model Number <span className="text-red-400">*</span></label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-green-500 outline-none"
                                    value={manualData.model}
                                    onChange={e => setManualData({ ...manualData, model: e.target.value })}
                                    placeholder="e.g. 24ABB336A310"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Serial Number (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-green-500 outline-none"
                                    value={manualData.serial}
                                    onChange={e => setManualData({ ...manualData, serial: e.target.value })}
                                    placeholder="e.g. 123456789"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-colors"
                            >
                                Check Eligibility
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsManualMode(false)}
                                className="w-full text-sm text-slate-400 hover:text-white mt-4 underline"
                            >
                                Back to Scanner
                            </button>
                        </form>
                    ) : (
                        <>
                            <NameplateScanner onScanComplete={handleScanComplete} />

                            <div className="mt-4 text-center">
                                <span className="text-slate-500 text-sm">Camera not working? </span>
                                <button
                                    onClick={() => setIsManualMode(true)}
                                    className="text-green-400 hover:text-green-300 text-sm font-medium hover:underline"
                                >
                                    Enter details manually
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
