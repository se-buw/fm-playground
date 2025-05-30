#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runFinalTest() {
    console.log('🧪 Running final end-to-end test...\n');

    const testDir = path.join(__dirname, 'test-output');
    const projectName = 'test-project';
    const projectDir = path.join(testDir, projectName);

    try {
        // Clean up any existing test directory
        if (await fs.pathExists(testDir)) {
            await fs.remove(testDir);
        }

        // Import and run the main function with simulated answers
        const { createFMPlayground } = await import('../src/index.js');

        // Mock inquirer to simulate user inputs
        const originalPrompt = (await import('inquirer')).default.prompt;
        const { default: inquirer } = await import('inquirer');

        (inquirer as any).prompt = async (questions) => {
            const answers = {};
            for (const question of questions) {
                switch (question.name) {
                    case 'projectName':
                        answers[question.name] = projectName;
                        break;
                    case 'tools':
                        answers[question.name] = ['limboole', 'smt']; // Test with 2 tools
                        break;
                    case 'installDeps':
                        answers[question.name] = false; // Skip npm install for testing
                        break;
                    case 'overwrite':
                        answers[question.name] = true;
                        break;
                }
            }
            return answers;
        };

        // Change to test directory for project creation
        process.chdir(testDir);
        await fs.ensureDir(testDir);

        // Run the main function
        await createFMPlayground();

        // Verify project structure
        console.log('✅ Testing project structure...');

        const expectedFiles = [
            'package.json',
            'vite.config.ts',
            'tsconfig.json',
            'index.html',
            'README.md',
            'tools-config.json',
            'src/ToolMaps.tsx',
            'tools/common',
            'tools/limboole',
            'tools/smt',
        ];

        for (const file of expectedFiles) {
            const filePath = path.join(projectDir, file);
            if (!(await fs.pathExists(filePath))) {
                throw new Error(`Expected file/directory not found: ${file}`);
            }
        }

        // Verify unselected tools are NOT present
        console.log('✅ Testing that unselected tools are excluded...');
        const excludedTools = ['alloy', 'nuxmv', 'spectra'];
        for (const tool of excludedTools) {
            const toolPath = path.join(projectDir, 'tools', tool);
            if (await fs.pathExists(toolPath)) {
                throw new Error(`Unselected tool directory should not exist: tools/${tool}`);
            }
        }

        // Verify ToolMaps.tsx only includes selected tools
        console.log('✅ Testing ToolMaps.tsx generation...');
        const toolMapsContent = await fs.readFile(path.join(projectDir, 'src/ToolMaps.tsx'), 'utf8');
        if (!toolMapsContent.includes('executeLimboole')) {
            throw new Error('ToolMaps.tsx should include limboole executor');
        }
        if (!toolMapsContent.includes('executeZ3Wasm')) {
            throw new Error('ToolMaps.tsx should include Z3 executor');
        }
        if (toolMapsContent.includes('executeAlloyTool')) {
            throw new Error('ToolMaps.tsx should NOT include alloy executor');
        }

        // Verify HTML file has correct scripts
        console.log('✅ Testing HTML script management...');
        const htmlContent = await fs.readFile(path.join(projectDir, 'index.html'), 'utf8');
        if (!htmlContent.includes('z3-built.js')) {
            throw new Error('HTML should include Z3 script for SMT tool');
        }
        if (!htmlContent.includes('limboole.js')) {
            throw new Error('HTML should include Limboole script');
        }

        // Verify Vite config has correct proxy settings
        console.log('✅ Testing Vite config proxy management...');
        const viteContent = await fs.readFile(path.join(projectDir, 'vite.config.ts'), 'utf8');
        if (!viteContent.includes("'/smt'")) {
            throw new Error('Vite config should include SMT proxy');
        }
        if (viteContent.includes("'/alloy'")) {
            throw new Error('Vite config should NOT include Alloy proxy');
        }
        if (viteContent.includes("'/nuxmv'")) {
            throw new Error('Vite config should NOT include nuXmv proxy');
        }
        if (viteContent.includes("'/spectra'")) {
            throw new Error('Vite config should NOT include Spectra proxy');
        }

        // Verify tool-specific files are handled correctly
        console.log('✅ Testing conditional file copying...');

        // Z3 files should be present (SMT selected)
        const z3Files = ['z3-built.js', 'z3-built.wasm', 'z3-built.worker.js'];
        for (const file of z3Files) {
            const filePath = path.join(projectDir, 'public', file);
            if (!(await fs.pathExists(filePath))) {
                throw new Error(`Z3 file should be present: ${file}`);
            }
        }

        // Limboole files should be present (Limboole selected)
        const limbooleFiles = ['limboole.js', 'limboole.wasm', 'dimacs2boole.js', 'dimacs2boole.wasm'];
        for (const file of limbooleFiles) {
            const filePath = path.join(projectDir, 'public', file);
            if (!(await fs.pathExists(filePath))) {
                throw new Error(`Limboole file should be present: ${file}`);
            }
        }

        // Verify tools-config.json
        console.log('✅ Testing tools configuration tracking...');
        const toolsConfig = await fs.readJson(path.join(projectDir, 'tools-config.json'));
        if (!Array.isArray(toolsConfig.selectedTools)) {
            throw new Error('tools-config.json should have selectedTools array');
        }
        if (!toolsConfig.selectedTools.includes('limboole') || !toolsConfig.selectedTools.includes('smt')) {
            throw new Error('tools-config.json should track selected tools');
        }

        // Verify no examples directory was created
        console.log('✅ Testing that examples directory is NOT created...');
        const examplesPath = path.join(projectDir, 'examples');
        if (await fs.pathExists(examplesPath)) {
            throw new Error('Examples directory should not be created');
        }

        console.log('\n🎉 All tests passed! The create-fm-playground package is working correctly.');
        console.log(`\nTest project created at: ${projectDir}`);
        console.log('Selected tools: Limboole, SMT (Z3)');
        console.log('Excluded tools: Alloy, nuXmv, Spectra');

        // Restore original inquirer prompt
        inquirer.prompt = originalPrompt;
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        process.exit(1);
    }
}

runFinalTest();
