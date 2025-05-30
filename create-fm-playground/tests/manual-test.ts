#!/usr/bin/env node

console.log('Starting manual test...');

import fs from 'fs-extra';
import path from 'path';

// Create a simple test
const testDir = '/Users/soaib/Code/Github/fm-playground-mod/create-fm-playground/manual-test';

try {
    await fs.ensureDir(testDir);

    // Test Guides.json filtering
    const originalGuides = {
        limboole: [{ title: 'Test Limboole', link: 'test' }],
        smt2: [{ title: 'Test SMT', link: 'test' }],
        als: [{ title: 'Test Alloy', link: 'test' }],
    };

    // Filter for only limboole
    const selectedTools = ['limboole'];
    const toolToGuideKey = { limboole: 'limboole', smt: 'smt2', alloy: 'als' };
    const filteredGuides = {};

    selectedTools.forEach((tool) => {
        const guideKey = toolToGuideKey[tool];
        if (guideKey && originalGuides[guideKey]) {
            filteredGuides[guideKey] = originalGuides[guideKey];
        }
    });

    console.log('Original guides keys:', Object.keys(originalGuides));
    console.log('Filtered guides keys:', Object.keys(filteredGuides));
    console.log('Test successful: filtering works!');
} catch (error) {
    console.error('Error:', error);
}
