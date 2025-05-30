#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testUtilExtraction() {
    console.log('🧪 Testing lineHighlightingUtil function extraction...\n');

    try {
        // Read the original lineHighlightingUtil.ts
        const frontendPath = path.resolve(__dirname, '..', 'frontend');
        const utilPath = path.join(frontendPath, 'tools', 'common', 'lineHighlightingUtil.ts');

        if (!(await fs.pathExists(utilPath))) {
            console.log('❌ Source lineHighlightingUtil.ts not found at:', utilPath);
            return;
        }

        const originalContent = await fs.readFile(utilPath, 'utf8');
        console.log('✅ Original file loaded, length:', originalContent.length);

        // Test function extraction for limboole
        const functionRegex = /function getLineToHighlightLimboole\([\s\S]*?\n\}/g;
        const functionMatch = originalContent.match(functionRegex);

        if (functionMatch) {
            console.log('✅ Found limboole function:');
            console.log(functionMatch[0]);
        } else {
            console.log('❌ Could not extract limboole function');

            // Try to find where the function is defined
            if (originalContent.includes('getLineToHighlightLimboole')) {
                console.log('✅ Function name found in file');
                const lines = originalContent.split('\n');
                lines.forEach((line, index) => {
                    if (line.includes('getLineToHighlightLimboole')) {
                        console.log(`Line ${index + 1}: ${line}`);
                    }
                });
            }
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testUtilExtraction();
