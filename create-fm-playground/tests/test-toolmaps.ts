#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the generateToolMaps function from the main index.js
const { generateToolMaps } = await import('../src/index.js');

async function testToolMapsGeneration() {
    try {
        console.log('🧪 Testing ToolMaps.tsx generation...');

        // Create a temporary test directory
        const testDir = path.join(__dirname, 'test-toolmaps');
        const srcDir = path.join(testDir, 'src');

        // Clean up any existing test directory
        if (await fs.pathExists(testDir)) {
            await fs.remove(testDir);
        }

        // Create the directory structure
        await fs.ensureDir(srcDir);

        // Test with Alloy and SMT tools
        console.log('📝 Generating ToolMaps.tsx with Alloy and SMT tools...');

        // Mock spinner object
        const mockSpinner = { text: '' };

        // Call the generateToolMaps function directly
        await generateToolMaps(testDir, ['alloy', 'smt'], mockSpinner);

        // Read and display the generated file
        const toolMapsPath = path.join(srcDir, 'ToolMaps.tsx');
        if (await fs.pathExists(toolMapsPath)) {
            const content = await fs.readFile(toolMapsPath, 'utf8');
            console.log('✅ ToolMaps.tsx generated successfully!');
            console.log('\n📄 Generated content:');
            console.log('='.repeat(50));
            console.log(content);
            console.log('='.repeat(50));
        } else {
            throw new Error('ToolMaps.tsx file was not created');
        }

        // Clean up
        await fs.remove(testDir);
        console.log('\n🎉 Test completed successfully!');
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testToolMapsGeneration();
