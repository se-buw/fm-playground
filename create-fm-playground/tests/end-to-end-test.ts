#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { createFMPlayground } from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configurations
const testConfigs = [
    {
        name: 'all-tools-test',
        tools: ['alloy', 'limboole', 'nuxmv', 'smt', 'spectra'],
        description: 'Test with all tools selected',
    },
    {
        name: 'minimal-test',
        tools: ['smt'],
        description: 'Test with minimal tool selection (SMT only)',
    },
    {
        name: 'mixed-test',
        tools: ['alloy', 'smt', 'spectra'],
        description: 'Test with mixed tool selection',
    },
];

async function runEndToEndTest() {
    console.log('🧪 Running comprehensive end-to-end tests...\n');

    for (const config of testConfigs) {
        console.log(`\n📋 Testing configuration: ${config.description}`);
        console.log(`📋 Tools: ${config.tools.join(', ')}`);
        console.log(`📋 Project name: ${config.name}\n`);

        try {
            // Clean up any existing test directory
            const testDir = path.join(__dirname, '..', 'test-projects', config.name);
            if (await fs.pathExists(testDir)) {
                await fs.remove(testDir);
            }

            // Mock inquirer responses for this test
            const originalPrompt = (await import('inquirer')).default.prompt;
            const mockPrompt = async (questions) => {
                return {
                    projectName: config.name,
                    selectedTools: config.tools,
                    installDeps: false,
                    overwrite: true,
                };
            };

            // Temporarily replace inquirer.prompt
            const inquirer = await import('inquirer');
            (inquirer as any).default.prompt = mockPrompt;

            // Run the create function
            await createFMPlayground();

            // Restore original prompt
            inquirer.default.prompt = originalPrompt;

            // Verify the generated project
            await verifyGeneratedProject(testDir, config);

            console.log(`✅ Test configuration "${config.name}" passed!\n`);
        } catch (error) {
            console.error(`❌ Test configuration "${config.name}" failed:`, error.message);
            process.exit(1);
        }
    }

    console.log('🎉 All end-to-end tests passed successfully!');
}

async function verifyGeneratedProject(projectPath, config) {
    console.log(`🔍 Verifying generated project at: ${projectPath}`);

    // Check if project directory exists
    if (!(await fs.pathExists(projectPath))) {
        throw new Error(`Project directory does not exist: ${projectPath}`);
    }

    // Check essential files
    const essentialFiles = [
        'package.json',
        'index.html',
        'vite.config.ts',
        'README.md',
        'src/ToolMaps.tsx',
        'tools-config.json',
    ];

    for (const file of essentialFiles) {
        const filePath = path.join(projectPath, file);
        if (!(await fs.pathExists(filePath))) {
            throw new Error(`Essential file missing: ${file}`);
        }
    }

    // Verify package.json has correct name
    const packageJson = await fs.readJson(path.join(projectPath, 'package.json'));
    if (packageJson.name !== config.name) {
        throw new Error(`Package.json name mismatch. Expected: ${config.name}, Got: ${packageJson.name}`);
    }

    // Verify tools-config.json
    const toolsConfig = await fs.readJson(path.join(projectPath, 'tools-config.json'));
    if (!Array.isArray(toolsConfig.selectedTools)) {
        throw new Error('tools-config.json does not contain selectedTools array');
    }

    const expectedTools = [...config.tools].sort();
    const actualTools = [...toolsConfig.selectedTools].sort();
    if (JSON.stringify(expectedTools) !== JSON.stringify(actualTools)) {
        throw new Error(`Tools mismatch. Expected: ${expectedTools.join(',')}, Got: ${actualTools.join(',')}`);
    }

    // Verify tool directories exist for selected tools
    for (const tool of config.tools) {
        const toolPath = path.join(projectPath, 'tools', tool);
        if (!(await fs.pathExists(toolPath))) {
            throw new Error(`Tool directory missing: tools/${tool}`);
        }
    }

    // Verify tool directories don't exist for unselected tools
    const allTools = ['alloy', 'limboole', 'nuxmv', 'smt', 'spectra'];
    const unselectedTools = allTools.filter((tool) => !config.tools.includes(tool));
    for (const tool of unselectedTools) {
        const toolPath = path.join(projectPath, 'tools', tool);
        if (await fs.pathExists(toolPath)) {
            throw new Error(`Unselected tool directory should not exist: tools/${tool}`);
        }
    }

    // Verify Z3 files are only present when SMT is selected
    const z3Files = ['z3-built.js', 'z3-built.wasm', 'z3-built.worker.js'];
    const shouldHaveZ3 = config.tools.includes('smt');

    for (const z3File of z3Files) {
        const z3Path = path.join(projectPath, 'public', z3File);
        const exists = await fs.pathExists(z3Path);

        if (shouldHaveZ3 && !exists) {
            throw new Error(`Z3 file should exist when SMT is selected: ${z3File}`);
        }
        if (!shouldHaveZ3 && exists) {
            throw new Error(`Z3 file should not exist when SMT is not selected: ${z3File}`);
        }
    }

    // Verify Limboole files are only present when Limboole is selected
    const limbooleFiles = ['limboole.js', 'limboole.wasm', 'dimacs2boole.js', 'dimacs2boole.wasm'];
    const shouldHaveLimboole = config.tools.includes('limboole');

    for (const limbooleFile of limbooleFiles) {
        const limboolePath = path.join(projectPath, 'public', limbooleFile);
        const exists = await fs.pathExists(limboolePath);

        if (shouldHaveLimboole && !exists) {
            throw new Error(`Limboole file should exist when Limboole is selected: ${limbooleFile}`);
        }
        if (!shouldHaveLimboole && exists) {
            throw new Error(`Limboole file should not exist when Limboole is not selected: ${limbooleFile}`);
        }
    }

    // Verify HTML file has correct script tags
    const htmlContent = await fs.readFile(path.join(projectPath, 'index.html'), 'utf8');

    const hasZ3Script = htmlContent.includes('<script src="z3-built.js"></script>');
    const hasLimbooleScript = htmlContent.includes('<script src="limboole.js"></script>');

    if (shouldHaveZ3 && !hasZ3Script) {
        throw new Error('HTML should include Z3 script when SMT is selected');
    }
    if (!shouldHaveZ3 && hasZ3Script) {
        throw new Error('HTML should not include Z3 script when SMT is not selected');
    }

    if (shouldHaveLimboole && !hasLimbooleScript) {
        throw new Error('HTML should include Limboole script when Limboole is selected');
    }
    if (!shouldHaveLimboole && hasLimbooleScript) {
        throw new Error('HTML should not include Limboole script when Limboole is not selected');
    }

    // Verify Vite config has correct proxy settings
    const viteContent = await fs.readFile(path.join(projectPath, 'vite.config.ts'), 'utf8');

    const toolProxyPaths = {
        nuxmv: '/nuxmv',
        smt: '/smt',
        alloy: '/alloy',
        spectra: '/spectra',
    };

    // Check that selected tools have proxy configs
    for (const tool of config.tools) {
        if (toolProxyPaths[tool]) {
            const proxyPath = toolProxyPaths[tool];
            if (!viteContent.includes(`'${proxyPath}':`)) {
                throw new Error(`Vite config should include proxy for selected tool: ${tool} (${proxyPath})`);
            }
        }
    }

    // Check that unselected tools don't have proxy configs
    for (const tool of unselectedTools) {
        if (toolProxyPaths[tool]) {
            const proxyPath = toolProxyPaths[tool];
            if (viteContent.includes(`'${proxyPath}':`)) {
                throw new Error(`Vite config should not include proxy for unselected tool: ${tool} (${proxyPath})`);
            }
        }
    }

    // Verify ToolMaps.tsx contains only selected tools
    const toolMapsContent = await fs.readFile(path.join(projectPath, 'src', 'ToolMaps.tsx'), 'utf8');

    // Check that selected tools are included
    for (const tool of config.tools) {
        const toolNames = {
            limboole: 'executeLimboole',
            smt: 'executeZ3Wasm',
            nuxmv: 'executeNuxmvTool',
            alloy: 'executeAlloyTool',
            spectra: 'executeSpectraTool',
        };

        if (toolNames[tool] && !toolMapsContent.includes(toolNames[tool])) {
            throw new Error(`ToolMaps.tsx should include executor for selected tool: ${tool}`);
        }
    }

    // Verify example files exist for selected tools
    const examplesDir = path.join(projectPath, 'examples');
    if (await fs.pathExists(examplesDir)) {
        for (const tool of config.tools) {
            const extensions = {
                limboole: 'limboole',
                smt: 'smt2',
                alloy: 'als',
                nuxmv: 'smv',
                spectra: 'spectra',
            };

            const exampleFile = path.join(examplesDir, `example-${tool}.${extensions[tool]}`);
            if (!(await fs.pathExists(exampleFile))) {
                throw new Error(`Example file should exist for selected tool: example-${tool}.${extensions[tool]}`);
            }
        }
    }

    console.log(`✅ Project verification completed successfully`);
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${__filename}`) {
    runEndToEndTest().catch(console.error);
}
