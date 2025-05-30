#!/usr/bin/env node

/**
 * Integration test for create-fm-playground
 * Tests the complete workflow of creating a project with selected tools
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runIntegrationTest() {
    console.log('🧪 Running integration test for create-fm-playground...\n');

    const testProjectName = 'test-integration';
    const testProjectPath = path.resolve(__dirname, '..', testProjectName);

    try {
        // Clean up any existing test project
        if (await fs.pathExists(testProjectPath)) {
            console.log('🧹 Cleaning up existing test project...');
            await fs.remove(testProjectPath);
        }

        console.log('📦 Creating test project with Alloy and Limboole tools...');

        // Mock the inquirer module for automated testing
        const { createFMPlayground } = await import('../src/index.js');

        // Override inquirer for this test
        const inquirer = await import('inquirer');
        const originalPrompt = inquirer.default.prompt;

        (inquirer as any).default.prompt = async (questions) => {
            const responses: Record<string, any> = {};

            for (const question of questions) {
                switch (question.name) {
                    case 'projectName':
                        responses.projectName = testProjectName;
                        break;
                    case 'selectedTools':
                        responses.selectedTools = ['alloy', 'limboole'];
                        break;
                    case 'installDeps':
                        responses.installDeps = false;
                        break;
                    case 'overwrite':
                        responses.overwrite = true;
                        break;
                    default:
                        responses[question.name] = question.default;
                }
            }

            return responses;
        };

        // Create the project
        await createFMPlayground();

        // Restore original prompt
        inquirer.default.prompt = originalPrompt;

        console.log('✅ Project created successfully!\n');

        // Verify project structure
        console.log('🔍 Verifying project structure...');

        const checks = [
            { path: 'package.json', desc: 'Package.json exists' },
            { path: 'src/ToolMaps.tsx', desc: 'ToolMaps.tsx generated' },
            { path: 'tools/alloy', desc: 'Alloy tool directory copied' },
            { path: 'tools/limboole', desc: 'Limboole tool directory copied' },
            { path: 'tools/common', desc: 'Common tools directory copied' },
            { path: 'README.md', desc: 'Project README created' },
            { path: 'examples', desc: 'Examples directory created' },
            { path: 'tools-config.json', desc: 'Tools configuration file created' },
        ];

        let allChecksPass = true;

        for (const check of checks) {
            const fullPath = path.join(testProjectPath, check.path);
            const exists = await fs.pathExists(fullPath);

            if (exists) {
                console.log(`✅ ${check.desc}`);
            } else {
                console.log(`❌ ${check.desc}`);
                allChecksPass = false;
            }
        }

        // Verify tools that should NOT be present
        console.log('\n🚫 Verifying excluded tools...');

        const excludedChecks = [
            { path: 'tools/smt', desc: 'SMT tool directory (should be excluded)' },
            { path: 'tools/nuxmv', desc: 'nuXmv tool directory (should be excluded)' },
            { path: 'tools/spectra', desc: 'Spectra tool directory (should be excluded)' },
        ];

        for (const check of excludedChecks) {
            const fullPath = path.join(testProjectPath, check.path);
            const exists = await fs.pathExists(fullPath);

            if (!exists) {
                console.log(`✅ ${check.desc} correctly excluded`);
            } else {
                console.log(`❌ ${check.desc} should not exist`);
                allChecksPass = false;
            }
        }

        // Verify ToolMaps.tsx content
        console.log('\n📄 Verifying ToolMaps.tsx content...');

        const toolMapsPath = path.join(testProjectPath, 'src', 'ToolMaps.tsx');
        const toolMapsContent = await fs.readFile(toolMapsPath, 'utf8');

        const contentChecks = [
            { pattern: /executeAlloyTool/, desc: 'Alloy executor import' },
            { pattern: /executeLimboole/, desc: 'Limboole executor import' },
            { pattern: /AlloyCmdOptions/, desc: 'Alloy input component' },
            { pattern: /LimbooleCheckOptions/, desc: 'Limboole input component' },
            { pattern: /alloy.*Alloy.*als.*ALS/, desc: 'Alloy config in fmpConfig' },
            { pattern: /limboole.*Limboole.*limboole.*SAT/, desc: 'Limboole config in fmpConfig' },
        ];

        const negativeChecks = [
            { pattern: /executeZ3Wasm/, desc: 'Z3 executor (should be excluded)' },
            { pattern: /executeNuxmvTool/, desc: 'nuXmv executor (should be excluded)' },
            { pattern: /executeSpectraTool/, desc: 'Spectra executor (should be excluded)' },
        ];

        for (const check of contentChecks) {
            if (check.pattern.test(toolMapsContent)) {
                console.log(`✅ ${check.desc} found in ToolMaps.tsx`);
            } else {
                console.log(`❌ ${check.desc} missing from ToolMaps.tsx`);
                allChecksPass = false;
            }
        }

        for (const check of negativeChecks) {
            if (!check.pattern.test(toolMapsContent)) {
                console.log(`✅ ${check.desc} correctly excluded from ToolMaps.tsx`);
            } else {
                console.log(`❌ ${check.desc} should not be in ToolMaps.tsx`);
                allChecksPass = false;
            }
        }

        // Verify tools-config.json
        console.log('\n⚙️ Verifying tools configuration...');

        const toolsConfigPath = path.join(testProjectPath, 'tools-config.json');
        const toolsConfig = await fs.readJson(toolsConfigPath);

        if (
            toolsConfig.selectedTools &&
            toolsConfig.selectedTools.includes('alloy') &&
            toolsConfig.selectedTools.includes('limboole') &&
            toolsConfig.selectedTools.length === 2
        ) {
            console.log('✅ Tools configuration is correct');
        } else {
            console.log('❌ Tools configuration is incorrect');
            console.log('Expected: ["alloy", "limboole"]');
            console.log('Actual:', toolsConfig.selectedTools);
            allChecksPass = false;
        }

        // Final result
        console.log('\n' + '='.repeat(50));

        if (allChecksPass) {
            console.log('🎉 Integration test PASSED! ✅');
            console.log('create-fm-playground is working correctly.');
        } else {
            console.log('❌ Integration test FAILED! ❌');
            console.log('Some checks did not pass.');
        }

        console.log('='.repeat(50));

        // Clean up
        console.log('\n🧹 Cleaning up test project...');
        await fs.remove(testProjectPath);
        console.log('✅ Cleanup completed');

        process.exit(allChecksPass ? 0 : 1);
    } catch (error) {
        console.error('❌ Integration test failed with error:', error.message);

        // Clean up on error
        if (await fs.pathExists(testProjectPath)) {
            await fs.remove(testProjectPath);
        }

        process.exit(1);
    }
}

runIntegrationTest();
