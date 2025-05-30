#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runComprehensiveTest() {
    console.log('🧪 Running comprehensive test for create-fm-playground...\n');

    try {
        console.log('📋 Test Plan:');
        console.log('   1. Test with no tools selected (minimal setup)');
        console.log('   2. Test with some tools selected (limboole, smt)');
        console.log('   3. Verify both scenarios work correctly\n');

        // Test 1: No tools
        console.log('🔵 TEST 1: No tools selected');
        await testScenario('no-tools', [], 'minimal-playground');

        // Test 2: Some tools
        console.log('\n🔵 TEST 2: Some tools selected');
        await testScenario('with-tools', ['limboole', 'smt'], 'tools-playground');

        console.log('\n🎉 ALL COMPREHENSIVE TESTS PASSED!');
        console.log('The create-fm-playground package works correctly in both scenarios:');
        console.log('  ✅ Minimal setup (no tools)');
        console.log('  ✅ Customized setup (selected tools)');
    } catch (error) {
        console.error('\n❌ Comprehensive test failed:', error.message);
        process.exit(1);
    }
}

async function testScenario(testName, selectedTools, projectName) {
    const testDir = path.join(__dirname, `test-comprehensive-${testName}`);
    const projectDir = path.join(testDir, projectName);

    // Clean up
    if (await fs.pathExists(testDir)) {
        await fs.remove(testDir);
    }

    // Import and setup
    const { createFMPlayground } = await import('../src/index.js');
    const { default: inquirer } = await import('inquirer');
    const originalPrompt = inquirer.prompt;

    (inquirer as any).prompt = async (questions: any) => {
        const answers: Record<string, any> = {};
        for (const question of questions) {
            switch (question.name) {
                case 'projectName':
                    answers[question.name] = projectName;
                    break;
                case 'selectedTools':
                    answers[question.name] = selectedTools;
                    break;
                case 'installDeps':
                    answers[question.name] = false;
                    break;
                case 'overwrite':
                    answers[question.name] = true;
                    break;
            }
        }
        return answers;
    };

    // Run test
    await fs.ensureDir(testDir);
    process.chdir(testDir);
    await createFMPlayground();

    // Verify based on scenario
    if (selectedTools.length === 0) {
        await verifyNoToolsScenario(projectDir);
    } else {
        await verifyWithToolsScenario(projectDir, selectedTools);
    }

    console.log(`   ✅ ${testName} scenario verified successfully`);

    // Restore
    inquirer.prompt = originalPrompt;
}

async function verifyNoToolsScenario(projectDir) {
    // Check ToolMaps.tsx contains template
    const toolMapsContent = await fs.readFile(path.join(projectDir, 'src/ToolMaps.tsx'), 'utf8');
    if (!toolMapsContent.includes('This file contains the mappings for tools')) {
        throw new Error('No-tools scenario: ToolMaps.tsx should contain template');
    }

    // Check no tool directories
    const toolDirs = ['limboole', 'smt', 'alloy', 'nuxmv', 'spectra'];
    for (const tool of toolDirs) {
        const toolPath = path.join(projectDir, 'tools', tool);
        if (await fs.pathExists(toolPath)) {
            throw new Error(`No-tools scenario: ${tool} directory should not exist`);
        }
    }

    // Check tools-config.json
    const toolsConfig = await fs.readJson(path.join(projectDir, 'tools-config.json'));
    if (toolsConfig.selectedTools.length !== 0) {
        throw new Error('No-tools scenario: selectedTools should be empty');
    }
}

async function verifyWithToolsScenario(projectDir, expectedTools) {
    // Check ToolMaps.tsx contains actual imports
    const toolMapsContent = await fs.readFile(path.join(projectDir, 'src/ToolMaps.tsx'), 'utf8');
    if (expectedTools.includes('limboole') && !toolMapsContent.includes('executeLimboole')) {
        throw new Error('With-tools scenario: ToolMaps.tsx should contain limboole executor');
    }
    if (expectedTools.includes('smt') && !toolMapsContent.includes('executeZ3Wasm')) {
        throw new Error('With-tools scenario: ToolMaps.tsx should contain Z3 executor');
    }

    // Check expected tool directories exist
    for (const tool of expectedTools) {
        const toolPath = path.join(projectDir, 'tools', tool);
        if (!(await fs.pathExists(toolPath))) {
            throw new Error(`With-tools scenario: ${tool} directory should exist`);
        }
    }

    // Check tools-config.json
    const toolsConfig = await fs.readJson(path.join(projectDir, 'tools-config.json'));
    if (toolsConfig.selectedTools.length !== expectedTools.length) {
        throw new Error('With-tools scenario: selectedTools length mismatch');
    }
    for (const tool of expectedTools) {
        if (!toolsConfig.selectedTools.includes(tool)) {
            throw new Error(`With-tools scenario: ${tool} should be in selectedTools`);
        }
    }
}

runComprehensiveTest();
