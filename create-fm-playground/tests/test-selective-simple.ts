#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testSelectiveCopyingSimple() {
    console.log('🧪 Testing selective common files copying (Simple Version)...\n');

    try {
        // Import the selective copying functions
        const indexPath = path.join(__dirname, 'src', 'index.js');
        const { copySelectiveGuidesJson, copySelectiveLineHighlightingUtil } = await import(indexPath);

        // Test directories
        const testDir = path.join(__dirname, 'test-selective-simple');
        await fs.ensureDir(testDir);

        // Source files
        const frontendPath = path.resolve(__dirname, '..', 'frontend');
        const guidesSource = path.join(frontendPath, 'tools', 'common', 'Guides.json');
        const utilSource = path.join(frontendPath, 'tools', 'common', 'lineHighlightingUtil.ts');

        console.log('✅ Source files check:');
        console.log('  Guides.json exists:', await fs.pathExists(guidesSource));
        console.log('  LineHighlightingUtil.ts exists:', await fs.pathExists(utilSource));

        // Test 1: Limboole only
        console.log('\n📝 Test 1: Limboole only');
        const limbooleDir = path.join(testDir, 'limboole-only');
        await fs.ensureDir(limbooleDir);

        const guidesLimboole = path.join(limbooleDir, 'Guides.json');
        const utilLimboole = path.join(limbooleDir, 'lineHighlightingUtil.ts');

        await copySelectiveGuidesJson(guidesSource, guidesLimboole, ['limboole']);
        await copySelectiveLineHighlightingUtil(utilSource, utilLimboole, ['limboole']);

        // Verify results
        const guidesContent = await fs.readJson(guidesLimboole);
        console.log('  Guides.json keys:', Object.keys(guidesContent));

        const utilContent = await fs.readFile(utilLimboole, 'utf8');
        console.log('  Contains limboole function:', utilContent.includes('getLineToHighlightLimboole'));
        console.log('  Contains smt function:', utilContent.includes('getLineToHighlightSmt2'));

        // Test 2: No tools
        console.log('\n📝 Test 2: No tools');
        const noToolsDir = path.join(testDir, 'no-tools');
        await fs.ensureDir(noToolsDir);

        const guidesNoTools = path.join(noToolsDir, 'Guides.json');
        const utilNoTools = path.join(noToolsDir, 'lineHighlightingUtil.ts');

        await copySelectiveGuidesJson(guidesSource, guidesNoTools, []);
        await copySelectiveLineHighlightingUtil(utilSource, utilNoTools, []);

        // Verify results
        const guidesContentEmpty = await fs.readJson(guidesNoTools);
        console.log('  Empty Guides.json keys:', Object.keys(guidesContentEmpty));

        const utilContentEmpty = await fs.readFile(utilNoTools, 'utf8');
        console.log('  Contains minimal template:', utilContentEmpty.includes('No tools configured'));

        // Test 3: Multiple tools
        console.log('\n📝 Test 3: Multiple tools (Limboole + SMT)');
        const multiDir = path.join(testDir, 'multi-tools');
        await fs.ensureDir(multiDir);

        const guidesMulti = path.join(multiDir, 'Guides.json');
        const utilMulti = path.join(multiDir, 'lineHighlightingUtil.ts');

        await copySelectiveGuidesJson(guidesSource, guidesMulti, ['limboole', 'smt']);
        await copySelectiveLineHighlightingUtil(utilSource, utilMulti, ['limboole', 'smt']);

        // Verify results
        const guidesContentMulti = await fs.readJson(guidesMulti);
        console.log('  Multi-tool Guides.json keys:', Object.keys(guidesContentMulti));

        const utilContentMulti = await fs.readFile(utilMulti, 'utf8');
        console.log('  Contains limboole function:', utilContentMulti.includes('getLineToHighlightLimboole'));
        console.log('  Contains smt function:', utilContentMulti.includes('getLineToHighlightSmt2'));
        console.log('  Contains alloy function:', utilContentMulti.includes('getLinesToHighlightAlloy'));

        console.log('\n🎉 Simple selective copying test completed successfully!');
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

testSelectiveCopyingSimple();
