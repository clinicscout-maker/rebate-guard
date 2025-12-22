import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import fs from 'fs';
import path from 'path';

// Load .env.local manually
try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
                process.env[key] = value;
            }
        });
    }
} catch (e) { }

async function testAI() {
    console.log("Testing Gemini API...");
    const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!key) {
        console.error("ERROR: No API Key found in .env.local");
        return;
    }
    console.log(`Key found: ${key.substring(0, 5)}...`);

    const models = [
        'models/gemini-1.5-flash',
        'models/gemini-2.0-flash-exp', // Changed from 'models/gemini-1.5-flash-001'
        'models/gemini-1.5-flash-latest',
        'models/gemini-1.5-flash-8b',
        'models/gemini-pro',
        'models/gemini-2.0-flash-exp', // Try the experimental one again just in case
    ];

    for (const modelName of models) {
        console.log(`\nTesting model: ${modelName}...`);
        try {
            const { text } = await generateText({
                model: google(modelName),
                prompt: 'Say "Hello" if you work.',
            });
            console.log(`SUCCESS with ${modelName}:`, text);
            // If one works, we could potentialy stop, but let's see all results
        } catch (error: any) {
            console.error(`FAILED ${modelName}:`, error.message?.split('\n')[0] || error.message);
        }
    }
}

testAI();
