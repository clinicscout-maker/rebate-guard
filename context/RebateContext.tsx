'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PROVINCES, ProvinceCode } from '../config/provinces';

export type FuelSource = 'GAS' | 'ELECTRIC' | 'OIL' | 'PROPANE';
export type ProgramMode = 'ENBRIDGE' | 'SAVE_ON_ENERGY' | 'OHPA' | 'GREENER_HOMES_LOAN' | 'CLEANBC' | 'EFFICIENCY_NS' | null;

interface RebateContextType {
    province: ProvinceCode;
    setProvince: (province: ProvinceCode) => void;
    fuelSource: FuelSource | null;
    setFuelSource: (source: FuelSource) => void;
    programMode: ProgramMode;
    maxRebateAmount: number;
}

const RebateContext = createContext<RebateContextType | undefined>(undefined);

export function RebateProvider({ children }: { children: ReactNode }) {
    const [province, setProvince] = useState<ProvinceCode>('ON');
    const [fuelSource, setFuelSource] = useState<FuelSource | null>(null);

    // Logic to determine program mode and rebate amount
    const getProgramDetails = (): { mode: ProgramMode; amount: number } => {
        if (!fuelSource) return { mode: null, amount: 0 };

        if (province === 'ON') {
            if (fuelSource === 'GAS') return { mode: 'ENBRIDGE', amount: 7500 };
            if (fuelSource === 'ELECTRIC') return { mode: 'SAVE_ON_ENERGY', amount: 5000 };
        }

        if (fuelSource === 'OIL') return { mode: 'OHPA', amount: 10000 };

        // Provincial specific overrides or defaults
        if (province === 'BC') return { mode: 'CLEANBC', amount: 4000 }; // Simplified
        if (province === 'NS') return { mode: 'EFFICIENCY_NS', amount: 5000 }; // Simplified

        return { mode: 'GREENER_HOMES_LOAN', amount: 0 };
    };

    const { mode: programMode, amount: maxRebateAmount } = getProgramDetails();

    return (
        <RebateContext.Provider
            value={{
                province,
                setProvince,
                fuelSource,
                setFuelSource,
                programMode,
                maxRebateAmount,
            }}
        >
            {children}
        </RebateContext.Provider>
    );
}

export function useRebate() {
    const context = useContext(RebateContext);
    if (context === undefined) {
        throw new Error('useRebate must be used within a RebateProvider');
    }
    return context;
}
