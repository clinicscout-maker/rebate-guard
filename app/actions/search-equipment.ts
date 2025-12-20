'use server';

import { createClient } from '@supabase/supabase-js';
import { normalizeModelInput } from '@/utils/hvac-normalizer';

export type EquipmentResult = {
    id: string;
    brand: string;
    model_number: string;
};

export async function searchModels(query: string): Promise<EquipmentResult[]> {
    if (!query || query.length < 2) return [];

    const cleanQuery = normalizeModelInput(query);

    // Check for Supabase keys
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.warn("Supabase credentials missing during search.");
        // Return empty or could return mock data if desired
        return [];
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Search Logic: 
    // We look for matches that START with the query first, then those that CONTAIN it.
    // Supabase .or() with ilike handles this.
    // However, to prioritize "Starts With", we ideally rely on the database ordering or search scoring.
    // For a simple implementation, .or() just returns matches.
    // Query: `model_number.ilike.${cleanQuery}%,model_number.ilike.%${cleanQuery}%`

    try {
        const { data, error } = await supabase
            .from('equipment')
            .select('id, brand, model_number')
            .or(`model_number.ilike.${cleanQuery}%,model_number.ilike.%${cleanQuery}%`)
            .limit(10);

        if (error) {
            console.error("Supabase Search Error:", error);
            return [];
        }

        // Optional: Client-side sort to prioritize exact starts-with if DB doesn't guarantee it
        // But for <10 results, it's usually fine.
        return (data as EquipmentResult[]) || [];
    } catch (err) {
        console.error("Search execution failed:", err);
        return [];
    }
}
