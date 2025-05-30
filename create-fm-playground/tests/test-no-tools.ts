#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testNoToolsSetup() {
    console.log('🧪 Testing create-fm-playground with NO tools selected...\n');

    const testDir = path.join(__dirname, 'test-no-tools-output');
    const projectName = 'minimal-fm-playground';
    const projectDir = path.join(testDir, projectName);

    try {
        console.log('📁 Setting up test environment...');

        // Clean up any existing test directory
        if (await fs.pathExists(testDir)) {
            console.log('🗑️  Cleaning up existing test directory...');
            await fs.remove(testDir);
        }

        console.log('📦 Importing modules...');
        // Import and run the main function with simulated answers
        const { createFMPlayground } = await import('../src/index.js');

        console.log('🎭 Setting up mock inquirer...');
        // Mock inquirer to simulate user inputs
        const { default: inquirer } = await import('inquirer');
        const originalPrompt = inquirer.prompt;

        (inquirer as any).prompt = async (questions) => {
            console.log('❓ Answering prompts automatically...');
            const answers = {};
            for (const question of questions) {
                switch (question.name) {
                    case 'projectName':
                        answers[question.name] = projectName;
                        console.log(`   Project name: ${projectName}`);
                        break;
                    case 'selectedTools':
                        answers[question.name] = []; // No tools selected
                        console.log('   Selected tools: [] (none)');
                        break;
                    case 'installDeps':
                        answers[question.name] = false; // Skip npm install for testing
                        console.log('   Install deps: false');
                        break;
                    case 'overwrite':
                        answers[question.name] = true;
                        console.log('   Overwrite: true');
                        break;
                }
            }
            return answers;
        };

        console.log('📂 Creating test directory and changing working directory...');
        // Change to test directory for project creation
        await fs.ensureDir(testDir);
        process.chdir(testDir);

        console.log('🚀 Running createFMPlayground...');
        // Run the main function
        await createFMPlayground();

        console.log('✅ Project creation completed. Starting verification...\n');

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
        ];

        for (const file of expectedFiles) {
            const filePath = path.join(projectDir, file);
            if (!(await fs.pathExists(filePath))) {
                throw new Error(`Expected file/directory not found: ${file}`);
            }
        }

        // Verify no tool directories exist
        console.log('✅ Testing that no tool directories are created...');
        const toolDirectories = ['alloy', 'limboole', 'nuxmv', 'smt', 'spectra'];
        for (const tool of toolDirectories) {
            const toolPath = path.join(projectDir, 'tools', tool);
            if (await fs.pathExists(toolPath)) {
                throw new Error(`Tool directory should not exist: tools/${tool}`);
            }
        }

        // Verify ToolMaps.tsx contains the template
        console.log('✅ Testing ToolMaps.tsx template generation...');
        const toolMapsContent = await fs.readFile(path.join(projectDir, 'src/ToolMaps.tsx'), 'utf8');

        // Check for template content
        if (!toolMapsContent.includes('This file contains the mappings for tools')) {
            throw new Error('ToolMaps.tsx should contain template comment');
        }
        if (!toolMapsContent.includes('// Example: import { executeExampleTool }')) {
            throw new Error('ToolMaps.tsx should contain example imports');
        }
        if (!toolMapsContent.includes('// EXT: ExampleToolCheckOptions,')) {
            throw new Error('ToolMaps.tsx should contain example configurations');
        }
        if (!toolMapsContent.includes("// exampleTool: { name: 'ExampleTool'")) {
            throw new Error('ToolMaps.tsx should contain example tool config');
        }

        // Verify no actual tool imports exist
        if (
            toolMapsContent.includes('executeLimboole') ||
            toolMapsContent.includes('executeZ3Wasm') ||
            toolMapsContent.includes('executeAlloyTool')
        ) {
            throw new Error('ToolMaps.tsx should NOT contain actual tool imports when no tools selected');
        }

        // Verify HTML file has no tool-specific scripts
        console.log('✅ Testing HTML script management...');
        const htmlContent = await fs.readFile(path.join(projectDir, 'index.html'), 'utf8');
        if (htmlContent.includes('z3-built.js')) {
            throw new Error('HTML should NOT include Z3 script when no tools selected');
        }
        if (htmlContent.includes('limboole.js')) {
            throw new Error('HTML should NOT include Limboole script when no tools selected');
        }

        // Verify Vite config has no proxy settings
        console.log('✅ Testing Vite config proxy management...');
        const viteContent = await fs.readFile(path.join(projectDir, 'vite.config.ts'), 'utf8');
        if (
            viteContent.includes("'/smt'") ||
            viteContent.includes("'/alloy'") ||
            viteContent.includes("'/nuxmv'") ||
            viteContent.includes("'/spectra'")
        ) {
            throw new Error('Vite config should NOT include any tool proxies when no tools selected');
        }

        // Verify tool-specific files are NOT present
        console.log('✅ Testing conditional file exclusion...');

        // Z3 files should NOT be present
        const z3Files = ['z3-built.js', 'z3-built.wasm', 'z3-built.worker.js'];
        for (const file of z3Files) {
            const filePath = path.join(projectDir, 'public', file);
            if (await fs.pathExists(filePath)) {
                throw new Error(`Z3 file should NOT be present: ${file}`);
            }
        }

        // Limboole files should NOT be present
        const limbooleFiles = ['limboole.js', 'limboole.wasm', 'dimacs2boole.js', 'dimacs2boole.wasm'];
        for (const file of limbooleFiles) {
            const filePath = path.join(projectDir, 'public', file);
            if (await fs.pathExists(filePath)) {
                throw new Error(`Limboole file should NOT be present: ${file}`);
            }
        }

        // Verify tools-config.json
        console.log('✅ Testing tools configuration tracking...');
        const toolsConfig = await fs.readJson(path.join(projectDir, 'tools-config.json'));
        if (!Array.isArray(toolsConfig.selectedTools)) {
            throw new Error('tools-config.json should have selectedTools array');
        }
        if (toolsConfig.selectedTools.length !== 0) {
            throw new Error('tools-config.json should track empty tools array');
        }

        // Verify README content
        console.log('✅ Testing README generation for no tools...');
        const readmeContent = await fs.readFile(path.join(projectDir, 'README.md'), 'utf8');
        if (!readmeContent.includes('minimal FM Playground setup')) {
            throw new Error('README should mention minimal setup when no tools selected');
        }
        if (readmeContent.includes('## Included Tools')) {
            throw new Error('README should NOT have "Included Tools" section when no tools selected');
        }

        console.log('\n🎉 All tests passed! The create-fm-playground package works correctly with no tools selected.');
        console.log(`\nTest project created at: ${projectDir}`);
        console.log('Setup: Minimal playground with no tools');

        // Restore original inquirer prompt
        inquirer.prompt = originalPrompt;
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        process.exit(1);
    }
}

testNoToolsSetup();
