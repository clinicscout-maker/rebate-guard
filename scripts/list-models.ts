
import fs from 'fs';
import path from 'path';

// Manually load .env.local
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

async function listModels() {
    const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!key) {
        console.error("No API Key found");
        return;
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error("Error fetching models:", response.status, response.statusText);
            const text = await response.text();
            console.error(text);
            return;
        }
        const data = await response.json();
        console.log("Available Models:");
        data.models.forEach((m: any) => {
            if (m.name.includes("gemini")) {
                console.log(`- ${m.name} (${m.supportedGenerationMethods})`);
            }
        });
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

listModels();
