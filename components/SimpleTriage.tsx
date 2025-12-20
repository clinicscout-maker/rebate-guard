'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Flame, Zap, Droplet } from 'lucide-react';
import { useRebate, FuelSource } from '../context/RebateContext';
import { PROVINCES, ProvinceCode } from '../config/provinces';

export default function SimpleTriage() {
    const { province, setProvince, setFuelSource, programMode, maxRebateAmount } = useRebate();
    const [showResult, setShowResult] = React.useState(false);

    // Auto-scroll or transition when fuel is selected
    const handleFuelSelect = (source: FuelSource) => {
        setFuelSource(source);
        setShowResult(true);
    };

    const handleReset = () => {
        setShowResult(false);
        setFuelSource('GAS'); // Reset or keep previous? Resetting UI state mainly.
    };

    if (showResult) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-md bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700 mx-auto"
            >
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">You qualify for up to</h2>
                    <div className="text-5xl font-extrabold text-green-400 mb-4">
                        ${maxRebateAmount.toLocaleString()}
                    </div>
                    <p className="text-slate-400 mb-6">
                        Based on your location in <span className="text-white font-medium">{PROVINCES[province].name}</span> and current fuel source.
                    </p>

                    <div className="bg-slate-900/50 rounded-xl p-4 mb-6 text-left border border-slate-700/50">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Likely Program</div>
                        <div className="text-lg font-bold text-white">
                            {programMode === 'ENBRIDGE' && 'Enbridge HER+'}
                            {programMode === 'SAVE_ON_ENERGY' && 'Save on Energy (NPP)'}
                            {programMode === 'OHPA' && 'Oil to Heat Pump (OHPA)'}
                            {programMode === 'CLEANBC' && 'CleanBC'}
                            {programMode === 'EFFICIENCY_NS' && 'Efficiency NS'}
                            {programMode === 'GREENER_HOMES_LOAN' && 'Greener Homes Loan'}
                        </div>
                    </div>

                    <button
                        onClick={handleReset}
                        className="text-slate-500 hover:text-white text-sm underline underline-offset-4 transition-colors"
                    >
                        Start Over
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-800 rounded-2xl p-2 shadow-xl border border-slate-700"
            >
                {/* Step 1: Province */}
                <div className="p-4 border-b border-slate-700/50">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                        <MapPin className="w-4 h-4 text-green-500" />
                        Select Province
                    </label>
                    <div className="relative">
                        <select
                            value={province}
                            onChange={(e) => setProvince(e.target.value as ProvinceCode)}
                            className="w-full appearance-none bg-slate-900 text-white border border-slate-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 font-medium text-lg"
                        >
                            {Object.entries(PROVINCES).map(([code, details]) => (
                                <option key={code} value={code}>
                                    {details.name}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Step 2: Fuel Source */}
                <div className="p-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-3">
                        <Flame className="w-4 h-4 text-orange-500" />
                        Current Heating Fuel
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <FuelButton
                            icon={<Flame className="w-6 h-6 text-green-500" />}
                            label="Natural Gas"
                            onClick={() => handleFuelSelect('GAS')}
                        />
                        <FuelButton
                            icon={<Zap className="w-6 h-6 text-yellow-500" />}
                            label="Electric"
                            onClick={() => handleFuelSelect('ELECTRIC')}
                        />
                        <FuelButton
                            icon={<Droplet className="w-6 h-6 text-red-500" />}
                            label="Oil"
                            onClick={() => handleFuelSelect('OIL')}
                        />
                        <FuelButton
                            icon={<Flame className="w-6 h-6 text-orange-500" />}
                            label="Propane"
                            onClick={() => handleFuelSelect('PROPANE')}
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function FuelButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center gap-2 bg-slate-900 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 rounded-xl p-4 transition-all active:scale-95 group"
        >
            <div className="bg-slate-800 rounded-full p-3 group-hover:bg-slate-600 transition-colors">
                {icon}
            </div>
            <span className="font-semibold text-slate-300 group-hover:text-white">{label}</span>
        </button>
    );
}
