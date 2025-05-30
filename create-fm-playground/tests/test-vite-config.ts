#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the updateViteConfig function from the main index.js
const { updateViteConfig } = await import('../src/index.js');

async function testViteConfigUpdate() {
    try {
        console.log('🧪 Testing Vite config proxy removal...');

        // Create a temporary test directory
        const testDir = path.join(__dirname, 'test-vite-config');

        // Clean up any existing test directory
        if (await fs.pathExists(testDir)) {
            await fs.remove(testDir);
        }

        // Create the directory structure
        await fs.ensureDir(testDir);

        // Copy the original vite.config.ts to test directory
        const originalViteConfig = path.resolve(__dirname, '..', 'frontend', 'vite.config.ts');
        const testViteConfig = path.join(testDir, 'vite.config.ts');

        await fs.copy(originalViteConfig, testViteConfig);

        console.log('📄 Original vite.config.ts copied');

        // Test with only Alloy and Limboole tools selected (should remove nuxmv, smt, spectra proxies)
        console.log('🔧 Updating Vite config with Alloy and Limboole only...');

        // Mock spinner object
        const mockSpinner = { text: '' };

        // Call the updateViteConfig function
        await updateViteConfig(testDir, ['alloy', 'limboole'], mockSpinner);

        // Read and display the updated file
        const updatedContent = await fs.readFile(testViteConfig, 'utf8');
        console.log('✅ Vite config updated successfully!');

        // Check what proxies remain
        const hasNuxmvProxy = updatedContent.includes("'/nuxmv'");
        const hasSmtProxy = updatedContent.includes("'/smt'");
        const hasAlloyProxy = updatedContent.includes("'/alloy'");
        const hasSpectraProxy = updatedContent.includes("'/spectra'");

        console.log('\n🔍 Proxy configuration check:');
        console.log(`✅ Alloy proxy present: ${hasAlloyProxy ? 'YES' : 'NO'}`);
        console.log(`❌ Limboole proxy present: NO (expected - Limboole doesn't use proxy)`);
        console.log(`❌ nuXmv proxy present: ${hasNuxmvProxy ? 'YES (ERROR)' : 'NO (correct)'}`);
        console.log(`❌ SMT proxy present: ${hasSmtProxy ? 'YES (ERROR)' : 'NO (correct)'}`);
        console.log(`❌ Spectra proxy present: ${hasSpectraProxy ? 'YES (ERROR)' : 'NO (correct)'}`);

        console.log('\n📄 Updated vite.config.ts content:');
        console.log('='.repeat(50));
        console.log(updatedContent);
        console.log('='.repeat(50));

        // Validate results
        const isCorrect = hasAlloyProxy && !hasNuxmvProxy && !hasSmtProxy && !hasSpectraProxy;

        if (isCorrect) {
            console.log('\n🎉 Test PASSED! Proxy configurations correctly updated.');
        } else {
            console.log('\n❌ Test FAILED! Some proxy configurations are incorrect.');
        }

        // Clean up
        await fs.remove(testDir);
        console.log('\n🧹 Test cleanup completed');
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testViteConfigUpdate();
