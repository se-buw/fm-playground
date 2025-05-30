#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testViteConfigRegex() {
    try {
        console.log('🧪 Testing Vite config regex patterns...');

        // Sample vite config content (simplified)
        const sampleViteConfig = `export default defineConfig({
  server: {
    proxy: {
      '/nuxmv': {
        target: 'http://fmp-nuxmv-api:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\\/nuxmv/, ''),
      },
      '/smt': {
        target: 'http://fmp-z3-api:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\\/smt/, ''),
      },
      '/alloy': {
        target: 'http://fmp-alloy-api:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\\/alloy/, ''),
      },
      '/spectra': {
        target: 'http://fmp-spectra-api:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\\/spectra/, ''),
      },
    },
  },
});`;

        console.log('📄 Original config:');
        console.log(sampleViteConfig);
        console.log('\n' + '='.repeat(50));

        // Test removing nuxmv, smt, and spectra (keeping only alloy)
        let updatedConfig = sampleViteConfig;
        const toolsToRemove = ['nuxmv', 'smt', 'spectra'];

        toolsToRemove.forEach((tool) => {
            const proxyPath = `/${tool}`;
            console.log(`🔧 Removing proxy for: ${proxyPath}`);

            const proxyPattern = new RegExp(`\\s*'${proxyPath.replace('/', '\\/')}':\\s*\\{[^}]*\\},?`, 'gs');

            updatedConfig = updatedConfig.replace(proxyPattern, '');
        });

        // Clean up trailing commas
        updatedConfig = updatedConfig.replace(/,(\s*})/g, '$1');

        console.log('\n📄 Updated config (should only have /alloy):');
        console.log(updatedConfig);
        console.log('\n' + '='.repeat(50));

        // Verify results
        const hasNuxmv = updatedConfig.includes("'/nuxmv'");
        const hasSmt = updatedConfig.includes("'/smt'");
        const hasAlloy = updatedConfig.includes("'/alloy'");
        const hasSpectra = updatedConfig.includes("'/spectra'");

        console.log('\n🔍 Results:');
        console.log(`✅ Alloy proxy present: ${hasAlloy ? 'YES' : 'NO'}`);
        console.log(`❌ nuXmv proxy present: ${hasNuxmv ? 'YES (ERROR)' : 'NO (correct)'}`);
        console.log(`❌ SMT proxy present: ${hasSmt ? 'YES (ERROR)' : 'NO (correct)'}`);
        console.log(`❌ Spectra proxy present: ${hasSpectra ? 'YES (ERROR)' : 'NO (correct)'}`);

        const success = hasAlloy && !hasNuxmv && !hasSmt && !hasSpectra;
        console.log(`\n${success ? '🎉 SUCCESS!' : '❌ FAILED!'}`);
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testViteConfigRegex();
