
import { scanNameplate } from '../app/actions/scan-nameplate';
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
        console.log("Loaded .env.local");
    } else {
        console.warn(".env.local not found");
    }
} catch (e) {
    console.error("Error loading .env.local", e);
}


async function testScan() {
    const imagePath = path.join(process.cwd(), 'public/test_nameplate.jpg');
    if (!fs.existsSync(imagePath)) {
        console.error("Test image not found at:", imagePath);
        return;
    }

    console.log("Reading image...");
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

    console.log("Scanning nameplate...");
    const result = await scanNameplate(base64Image);

    console.log("Result:", JSON.stringify(result, null, 2));
}

testScan();
