'use server';

import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

const NameplateSchema = z.object({
    brand: z.string().describe("The manufacturer brand name if visible (e.g., Carrier, Mitsubishi, Trane).").optional(),
    model_number: z.string().describe("The distinct model number of the outdoor unit. Usually labeled 'Model', 'M/N', or similar. Ignore series or family numbers."),
    serial_number: z.string().describe("The serial number of the unit.").optional(),
});

export async function scanNameplate(base64Image: string) {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        return { error: "API Key not configured." };
    }

    try {
        // Convert base64 to parts for SDK if needed, but SDK usually takes base64 data url directly in 'images'
        // Format: "data:image/jpeg;base64,..."
        // The 'generateObject' call supports image inputs in messages.

        const { object } = await generateObject({
            model: google('models/gemini-flash-latest'),
            schema: NameplateSchema,
            system: "You are an expert HVAC technician. Analyze the provided image of an equipment data plate. Extract the Model Number and Serial Number accurately. Ignore generic text like 'Volts', 'Hz', 'Phase', or 'Amps'. Return valid JSON.",
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: "Extract the model info from this nameplate." },
                        { type: 'image', image: base64Image }
                    ]
                }
            ] as any // The SDK types can be strict, using 'as any' or explicit CoreMessage type fixes this common friction
        });

        return {
            success: true,
            data: object
        };

    } catch (error: any) {
        console.error("Gemini Scan Error:", error);

        let errorMessage = "Failed to scan image. Please ensure the Model Number is clearly visible.";

        const errorStr = error.toString().toLowerCase();
        const errorMsg = (error.message || "").toLowerCase();

        if (errorStr.includes("quota") || errorMsg.includes("quota") || errorStr.includes("429")) {
            errorMessage = "Google AI Quota Exceeded. Please check your billing at console.cloud.google.com.";
        } else if (errorStr.includes("not found") || errorStr.includes("404")) {
            errorMessage = "AI Model not configured correctly (404). Please contact support.";
        }

        return {
            success: false,
            error: errorMessage
        };
    }
}
