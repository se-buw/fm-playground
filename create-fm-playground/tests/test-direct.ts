#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';

async function directTest() {
    console.log('🧪 Direct test of function extraction...\n');

    try {
        // Read the source file directly
        const utilPath = '/Users/soaib/Code/Github/fm-playground-mod/frontend/tools/common/lineHighlightingUtil.ts';
        const originalContent = await fs.readFile(utilPath, 'utf8');

        console.log('✅ File read successfully, length:', originalContent.length);
        console.log('✅ First 200 characters:');
        console.log(originalContent.substring(0, 200));

        // Test the regex
        const functionName = 'getLineToHighlightLimboole';
        const functionRegex = new RegExp(`function ${functionName}\\([^)]*\\)[^{]*\\{[\\s\\S]*?\\n\\}`, 'g');
        const functionMatch = originalContent.match(functionRegex);

        if (functionMatch) {
            console.log('\n✅ Function extracted successfully:');
            console.log(functionMatch[0]);
        } else {
            console.log('\n❌ Function extraction failed');

            // Try simpler regex
            const simpleRegex = new RegExp(`function ${functionName}`, 'g');
            const simpleMatch = originalContent.match(simpleRegex);
            console.log('Simple match found:', !!simpleMatch);

            // Find the function manually
            const lines = originalContent.split('\n');
            let startLine = -1;
            let endLine = -1;
            let braceCount = 0;

            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes(`function ${functionName}`)) {
                    startLine = i;
                    break;
                }
            }

            if (startLine >= 0) {
                console.log(`Function starts at line ${startLine + 1}: ${lines[startLine]}`);

                for (let i = startLine; i < lines.length; i++) {
                    const line = lines[i];
                    for (let char of line) {
                        if (char === '{') braceCount++;
                        if (char === '}') braceCount--;
                    }

                    if (braceCount === 0 && i > startLine) {
                        endLine = i;
                        break;
                    }
                }

                if (endLine >= 0) {
                    console.log(`Function ends at line ${endLine + 1}: ${lines[endLine]}`);
                    const functionContent = lines.slice(startLine, endLine + 1).join('\n');
                    console.log('\nExtracted function:');
                    console.log(functionContent);
                }
            }
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

directTest();
