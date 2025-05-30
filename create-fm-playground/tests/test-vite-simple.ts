#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simplified version of updateViteConfig for testing
async function testUpdateViteConfig(targetDir, selectedTools) {
    const viteConfigPath = path.join(targetDir, 'vite.config.ts');
    if (await fs.pathExists(viteConfigPath)) {
        let viteContent = await fs.readFile(viteConfigPath, 'utf8');

        console.log('📄 Original content length:', viteContent.length);

        // Tool to proxy path mapping
        const toolProxyPaths = {
            nuxmv: '/nuxmv',
            smt: '/smt',
            alloy: '/alloy',
            spectra: '/spectra',
        };

        // Remove proxy configurations for unselected tools
        Object.keys(toolProxyPaths).forEach((tool) => {
            if (!selectedTools.includes(tool)) {
                const proxyPath = toolProxyPaths[tool];
                console.log(`🔧 Removing proxy for: ${proxyPath}`);

                // Create a more robust regex pattern that handles the proxy configuration
                const proxyPattern = new RegExp(`\\s*'${proxyPath.replace('/', '\\/')}':\\s*\\{[\\s\\S]*?\\},?`, 'g');

                const before = viteContent.length;
                viteContent = viteContent.replace(proxyPattern, '');
                const after = viteContent.length;
                console.log(`   Removed ${before - after} characters`);
            }
        });

        // Clean up any trailing commas before closing braces
        viteContent = viteContent.replace(/,(\s*})/g, '$1');

        // Clean up any empty lines that might be left
        viteContent = viteContent.replace(/\n\s*\n\s*\n/g, '\n\n');

        await fs.writeFile(viteConfigPath, viteContent);
        console.log('✅ Vite config updated');
        return viteContent;
    }
}

async function main() {
    try {
        console.log('🧪 Testing Vite config update with Alloy only...');

        const testDir = path.resolve(__dirname, '..', 'test-vite');

        // Test with only Alloy selected
        const updatedContent = await testUpdateViteConfig(testDir, ['alloy']);

        // Check results
        if (updatedContent) {
            const hasNuxmv = updatedContent.includes("'/nuxmv'");
            const hasSmt = updatedContent.includes("'/smt'");
            const hasAlloy = updatedContent.includes("'/alloy'");
            const hasSpectra = updatedContent.includes("'/spectra'");

            console.log('\n🔍 Proxy configuration check:');
            console.log(`✅ Alloy proxy: ${hasAlloy ? 'Present' : 'Missing'}`);
            console.log(`❌ nuXmv proxy: ${hasNuxmv ? 'Present (ERROR)' : 'Removed'}`);
            console.log(`❌ SMT proxy: ${hasSmt ? 'Present (ERROR)' : 'Removed'}`);
            console.log(`❌ Spectra proxy: ${hasSpectra ? 'Present (ERROR)' : 'Removed'}`);

            const success = hasAlloy && !hasNuxmv && !hasSmt && !hasSpectra;
            console.log(`\n${success ? '🎉 SUCCESS!' : '❌ FAILED!'}`);

            if (!success) {
                console.log('\n📄 Updated content preview:');
                console.log(updatedContent.substring(0, 1000) + '...');
            }
        } else {
            console.log('❌ No updated content returned.');
        }
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

main();
