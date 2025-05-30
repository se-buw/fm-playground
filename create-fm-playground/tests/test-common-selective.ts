#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testSelectiveCommonFiles() {
    console.log('🧪 Testing selective common files copying...\n');

    const testDir = path.join(__dirname, 'test-common-files');

    try {
        // Clean up any existing test directory
        if (await fs.pathExists(testDir)) {
            await fs.remove(testDir);
        }

        // Import and run the main function with different tool combinations
        const { createFMPlayground } = await import('../src/index.js');

        // Mock inquirer to simulate user inputs
        const originalPrompt = (await import('inquirer')).default.prompt;
        const { default: inquirer } = await import('inquirer');

        // Test 1: Only Limboole selected
        console.log('📝 Test 1: Only Limboole selected');
        (inquirer as any).prompt = async (questions) => {
            const answers = {};
            for (const question of questions) {
                switch (question.name) {
                    case 'projectName':
                        answers[question.name] = 'test-limboole-only';
                        break;
                    case 'selectedTools':
                        answers[question.name] = ['limboole'];
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

        // Change to test directory
        process.chdir(testDir);
        await fs.ensureDir(testDir);

        await createFMPlayground();

        // Verify Guides.json only contains limboole
        const guidesPath = path.join(testDir, 'test-limboole-only', 'tools', 'common', 'Guides.json');
        if (await fs.pathExists(guidesPath)) {
            const guides = await fs.readJson(guidesPath);
            console.log('✅ Guides.json keys:', Object.keys(guides));
            if (Object.keys(guides).length === 1 && guides.limboole) {
                console.log('✅ Guides.json correctly filtered for limboole only');
            } else {
                console.log('❌ Guides.json filtering failed');
            }
        }

        // Verify lineHighlightingUtil.ts only contains limboole function
        const utilPath = path.join(testDir, 'test-limboole-only', 'tools', 'common', 'lineHighlightingUtil.ts');
        if (await fs.pathExists(utilPath)) {
            const utilContent = await fs.readFile(utilPath, 'utf8');
            console.log(
                '✅ LineHighlightingUtil contains limboole function:',
                utilContent.includes('getLineToHighlightLimboole')
            );
            console.log(
                '✅ LineHighlightingUtil excludes smt function:',
                !utilContent.includes('getLineToHighlightSmt2')
            );
        }

        // Test 2: Multiple tools selected
        console.log('\n📝 Test 2: Multiple tools (Limboole + SMT)');
        (inquirer as any).prompt = async (questions) => {
            const answers = {};
            for (const question of questions) {
                switch (question.name) {
                    case 'projectName':
                        answers[question.name] = 'test-multi-tools';
                        break;
                    case 'selectedTools':
                        answers[question.name] = ['limboole', 'smt'];
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

        await createFMPlayground();

        // Verify Guides.json contains both tools
        const guidesPath2 = path.join(testDir, 'test-multi-tools', 'tools', 'common', 'Guides.json');
        if (await fs.pathExists(guidesPath2)) {
            const guides2 = await fs.readJson(guidesPath2);
            console.log('✅ Guides.json keys:', Object.keys(guides2));
            if (guides2.limboole && guides2.smt2 && Object.keys(guides2).length === 2) {
                console.log('✅ Guides.json correctly filtered for limboole and smt');
            } else {
                console.log('❌ Guides.json filtering failed for multiple tools');
            }
        }

        // Test 3: No tools selected
        console.log('\n📝 Test 3: No tools selected');
        (inquirer as any).prompt = async (questions) => {
            const answers = {};
            for (const question of questions) {
                switch (question.name) {
                    case 'projectName':
                        answers[question.name] = 'test-no-tools';
                        break;
                    case 'selectedTools':
                        answers[question.name] = [];
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

        await createFMPlayground();

        // Verify empty configurations
        const guidesPath3 = path.join(testDir, 'test-no-tools', 'tools', 'common', 'Guides.json');
        if (await fs.pathExists(guidesPath3)) {
            const guides3 = await fs.readJson(guidesPath3);
            console.log('✅ Empty Guides.json keys:', Object.keys(guides3));
            if (Object.keys(guides3).length === 0) {
                console.log('✅ Guides.json correctly empty for no tools');
            } else {
                console.log('❌ Guides.json should be empty for no tools');
            }
        }

        const utilPath3 = path.join(testDir, 'test-no-tools', 'tools', 'common', 'lineHighlightingUtil.ts');
        if (await fs.pathExists(utilPath3)) {
            const utilContent3 = await fs.readFile(utilPath3, 'utf8');
            console.log('✅ Minimal lineHighlightingUtil created:', utilContent3.includes('No tools configured'));
        }

        console.log('\n🎉 All selective common files tests completed successfully!');

        // Restore original inquirer prompt
        inquirer.prompt = originalPrompt;
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

testSelectiveCommonFiles();
