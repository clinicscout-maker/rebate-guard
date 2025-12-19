export type ValidationResult = {
    isValid: boolean;
    messages: string[];
    status: 'SAFE' | 'WARNING' | 'FAILED';
};

export type EquipmentData = {
    searchedOutdoorModel: string;
    searchedIndoorModel: string;
    seer2: number;
    hspf2: number;
    region: string;
};

export function validateCompliance(data: EquipmentData): ValidationResult {
    const errors: string[] = [];

    // Rule 1: SEER2 Check
    if (data.seer2 < 15.2) {
        errors.push(`SEER2 Rating (${data.seer2}) is below the minimum required 15.2`);
    }

    // Rule 2: HSPF2 Check
    if (data.hspf2 < 7.8) {
        errors.push(`HSPF2 Rating (${data.hspf2}) is below the minimum required 7.8`);
    }

    // Rule 3: Region Check (Simplified for MVP)
    // Prompt implies "Region == Canada" checks against Cold Climate list.
    // We assume here that if the region provided is NOT valid for the equipment, it fails.
    // For now, we'll verify the data explicitly mentions "Canada" eligibility if searched.
    if (data.region.toLowerCase() !== 'canada') {
        // This is a strict check example. In reality, it might match a list of allowed provinces.
        errors.push(`Region '${data.region}' is not eligible for this rebate program.`);
    }

    if (errors.length > 0) {
        return {
            isValid: false,
            messages: errors,
            status: 'FAILED'
        };
    }

    return {
        isValid: true,
        messages: ['Equipment meets all rebate eligibility criteria.'],
        status: 'SAFE'
    };
}
