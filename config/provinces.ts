export const PROVINCES = {
    ON: { name: "Ontario", program_id: "enbridge_hrsp", default_rebate: 7500 },
    BC: { name: "British Columbia", program_id: "cleanbc", default_rebate: 4000 },
    NS: { name: "Nova Scotia", program_id: "efficiency_ns", default_rebate: 5000 },
    OTHER: { name: "Other", program_id: "greener_homes_loan", default_rebate: 0 }
};

export type ProvinceCode = keyof typeof PROVINCES;
