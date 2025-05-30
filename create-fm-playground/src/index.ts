import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora, { Ora } from 'ora';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

import { toolMapTemplateContent, toolConfigs } from './tool-map-template.js';
import type { Tool, ProjectAnswers, ToolConfig, GuidesJson } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AVAILABLE_TOOLS: Tool[] = [
    {
        name: 'Alloy',
        value: 'alloy',
        description: 'A declarative modeling language for software systems',
    },
    {
        name: 'Limboole',
        value: 'limboole',
        description: 'A SAT-based tool for Boolean reasoning',
    },
    {
        name: 'nuXmv',
        value: 'nuxmv',
        description: 'A symbolic model checker for finite and infinite-state systems',
    },
    {
        name: 'SMT (Z3)',
        value: 'smt',
        description: 'A SMT solver for satisfiability modulo theories',
    },
    {
        name: 'Spectra',
        value: 'spectra',
        description: 'A specification language for reactive systems',
    },
];

export async function createFMPlayground(): Promise<void> {
    console.log(chalk.blue.bold('🚀 Create FM Playground'));
    console.log(chalk.gray('Set up a new Formal Methods playground project\n'));

    try {
        // Get project details
        const answers: ProjectAnswers = await inquirer.prompt([
            {
                type: 'input',
                name: 'projectName',
                message: 'What is your project name?',
                default: 'my-fm-playground',
                validate: (input: string) => {
                    if (!input || input.trim() === '') {
                        return 'Project name cannot be empty';
                    }
                    if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
                        return 'Project name can only contain letters, numbers, hyphens, and underscores';
                    }
                    return true;
                },
            },
            {
                type: 'checkbox',
                name: 'selectedTools',
                message: 'Which formal method tools would you like to include? (Leave empty for a minimal setup)',
                choices: AVAILABLE_TOOLS.map((tool) => ({
                    name: `${tool.name} - ${tool.description}`,
                    value: tool.value,
                    checked: false,
                })),
            },
            {
                type: 'confirm',
                name: 'installDeps',
                message: 'Would you like to install dependencies?',
                default: true,
            },
        ]);

        const { projectName, selectedTools, installDeps } = answers;
        const targetDir = path.resolve(process.cwd(), projectName);

        // Check if directory already exists
        if (fs.existsSync(targetDir)) {
            const overwrite = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'overwrite',
                    message: `Directory ${projectName} already exists. Overwrite?`,
                    default: false,
                },
            ]);

            if (!overwrite.overwrite) {
                console.log(chalk.yellow('Operation cancelled.'));
                process.exit(0);
            }

            await fs.remove(targetDir);
        }

        // Create project
        const spinner = ora('Creating FM Playground project...').start();

        // Create target directory
        await fs.ensureDir(targetDir);

        // Get the source directories from bundled templates
        const packageDir = path.resolve(__dirname, '..');
        // In published package, templates are bundled within the package
        const templatesDir = path.resolve(packageDir, 'templates');
        const frontendSourceDir = path.resolve(templatesDir, 'frontend');

        // Check if frontend source directory exists
        if (!(await fs.pathExists(frontendSourceDir))) {
            throw new Error(`Frontend source directory not found: ${frontendSourceDir}`);
        }

        // Copy frontend directory excluding tools
        await copyFrontendFiles(frontendSourceDir, path.join(targetDir, 'frontend'), selectedTools, spinner);

        // Copy selected tools
        await copySelectedTools(frontendSourceDir, path.join(targetDir, 'frontend'), selectedTools, spinner);

        // Copy backend directory (always included)
        await copyBackend(templatesDir, targetDir, spinner);

        // Copy selected API directories
        await copySelectedApis(templatesDir, targetDir, selectedTools, spinner);

        // Update package.json with project name
        await updatePackageJson(path.join(targetDir, 'frontend'), projectName, spinner);

        // Update configuration to reflect selected tools
        await updateToolConfiguration(path.join(targetDir, 'frontend'), selectedTools, spinner);

        // Generate ToolMaps.tsx with only selected tools
        await generateToolMaps(path.join(targetDir, 'frontend'), selectedTools, spinner);

        // Update HTML file to conditionally include Z3 scripts
        await updateHtmlFile(path.join(targetDir, 'frontend'), selectedTools, spinner);

        // Update Vite config to only include proxy settings for selected tools
        await updateViteConfig(path.join(targetDir, 'frontend'), selectedTools, spinner);

        // Create README for the new project
        await createProjectReadme(targetDir, projectName, selectedTools, spinner);

        spinner.succeed('Project created successfully!');

        // Install dependencies if requested
        if (installDeps) {
            const installSpinner = ora('Installing dependencies...').start();
            try {
                await installDependencies(path.join(targetDir, 'frontend'));
                installSpinner.succeed('Dependencies installed successfully!');
            } catch (error) {
                installSpinner.fail('Failed to install dependencies');
                console.log(chalk.yellow('You can install them manually by running:'));
                console.log(chalk.cyan(`cd ${projectName}/frontend && npm install`));
            }
        }

        // Success message
        console.log(chalk.green.bold('\n✅ FM Playground project created successfully!\n'));
        console.log(chalk.cyan('To get started:\n'));
        console.log(chalk.white(`  cd ${projectName}/frontend`));
        if (!installDeps) {
            console.log(chalk.white('  npm install'));
        }
        console.log(chalk.white('  npm run dev\n'));

        if (selectedTools.length > 0) {
            console.log(chalk.gray('Selected tools:'));
            selectedTools.forEach((tool) => {
                const toolInfo = AVAILABLE_TOOLS.find((t) => t.value === tool);
                if (toolInfo) {
                    console.log(chalk.gray(`  • ${toolInfo.name} - ${toolInfo.description}`));
                }
            });
        } else {
            console.log(chalk.gray('No tools selected - minimal playground setup created.'));
            console.log(chalk.gray('You can add tools later by modifying the project structure.'));
        }

        console.log(chalk.gray('\nHappy formal method modeling! 🎉'));
    } catch (error) {
        console.error(chalk.red('Error creating project:'), (error as Error).message);
        process.exit(1);
    }
}

async function copyFrontendFiles(
    sourceDir: string,
    targetDir: string,
    selectedTools: string[],
    spinner: any
): Promise<void> {
    spinner.text = 'Copying frontend files...';

    // Z3 files that should only be copied if SMT tool is selected
    const z3Files = ['z3-built.js', 'z3-built.wasm', 'z3-built.worker.js'];
    const includeZ3Files = selectedTools.includes('smt');

    // Limboole files that should only be copied if Limboole tool is selected
    const limbooleFiles = ['dimacs2boole.js', 'dimacs2boole.wasm', 'limboole.js', 'limboole.wasm'];
    const includeLimbooleFiles = selectedTools.includes('limboole');

    // Get all items in frontend directory
    const items = await fs.readdir(sourceDir);

    for (const item of items) {
        // Skip tools directory - we'll handle it separately
        if (item === 'tools') {
            continue;
        }

        const sourcePath = path.join(sourceDir, item);
        const targetPath = path.join(targetDir, item);

        await fs.copy(sourcePath, targetPath, {
            filter: (src: string) => {
                // Skip node_modules and dist directories
                if (src.includes('node_modules') || src.includes('dist')) {
                    return false;
                }

                const fileName = path.basename(src);

                // Check if this is a Z3 file
                if (z3Files.includes(fileName)) {
                    return includeZ3Files;
                }

                // Check if this is a Limboole file
                if (limbooleFiles.includes(fileName)) {
                    return includeLimbooleFiles;
                }

                return true;
            },
        });
    }
}

async function copySelectedTools(
    sourceDir: string,
    targetDir: string,
    selectedTools: string[],
    spinner: any
): Promise<void> {
    spinner.text = 'Copying selected tools...';

    const toolsSourceDir = path.join(sourceDir, 'tools');
    const toolsTargetDir = path.join(targetDir, 'tools');

    // Ensure tools directory exists
    await fs.ensureDir(toolsTargetDir);

    // Copy common directory with selective filtering
    const commonSourceDir = path.join(toolsSourceDir, 'common');
    if (await fs.pathExists(commonSourceDir)) {
        const commonTargetDir = path.join(toolsTargetDir, 'common');
        await fs.ensureDir(commonTargetDir);

        // Copy common files selectively
        await copyCommonFiles(commonSourceDir, commonTargetDir, selectedTools, spinner);
    }

    // Copy selected tools
    for (const tool of selectedTools) {
        const toolSourceDir = path.join(toolsSourceDir, tool);
        if (await fs.pathExists(toolSourceDir)) {
            await fs.copy(toolSourceDir, path.join(toolsTargetDir, tool));
        }
    }
}

async function updatePackageJson(targetDir: string, projectName: string, spinner: any): Promise<void> {
    spinner.text = 'Updating package.json...';

    const packageJsonPath = path.join(targetDir, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);
        packageJson.name = projectName;
        await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    }
}

async function updateToolConfiguration(targetDir: string, selectedTools: string[], spinner: any): Promise<void> {
    spinner.text = 'Updating tool configuration...';

    // Update fmp.config.ts to only include selected tools
    const configPath = path.join(targetDir, 'fmp.config.ts');
    if (await fs.pathExists(configPath)) {
        let configContent = await fs.readFile(configPath, 'utf8');

        // Create a comment noting which tools were selected
        const toolComment =
            selectedTools.length > 0
                ? `// Selected tools: ${selectedTools.join(', ')}\n`
                : `// No tools selected - minimal setup\n`;
        configContent = toolComment + configContent;

        await fs.writeFile(configPath, configContent);
    }

    // Create a tools-config.json for reference
    const toolsConfig = {
        selectedTools,
        createdAt: new Date().toISOString(),
        description: 'Configuration file tracking which tools were selected during project creation',
    };

    await fs.writeJson(path.join(targetDir, 'tools-config.json'), toolsConfig, { spaces: 2 });
}

async function generateToolMaps(targetDir: string, selectedTools: string[], spinner: any): Promise<void> {
    spinner.text = 'Generating ToolMaps.tsx with selected tools...';

    // If no tools are selected, generate a template ToolMaps.tsx
    if (selectedTools.length === 0) {
        const toolMapsPath = path.join(targetDir, 'src', 'ToolMaps.tsx');
        await fs.writeFile(toolMapsPath, toolMapTemplateContent);
        return;
    }

    // Generate imports
    const executorImports: string[] = [];
    const languageImports: string[] = [];
    const inputComponentImports: string[] = [];
    const outputComponentImports: string[] = [];

    // Always import TextualOutput as it's used by most tools
    const baseImports = [
        '// Tool output components',
        "import TextualOutput from '@/components/Playground/TextualOutput';",
    ];

    selectedTools.forEach((tool) => {
        const config: ToolConfig = toolConfigs[tool];
        if (config) {
            executorImports.push(config.executorImport);
            languageImports.push(config.languageImport);

            if (config.hasInputComponent && config.inputComponentImport) {
                inputComponentImports.push(config.inputComponentImport);
            }

            if (config.hasOutputComponent && config.outputComponentImport) {
                outputComponentImports.push(config.outputComponentImport);
            }
        }
    });

    // Generate maps
    const additionalInputAreaUiEntries: string[] = [];
    const additionalOutputAreaUiEntries: string[] = [];
    const toolExecutionEntries: string[] = [];
    const toolOutputEntries: string[] = [];
    const languageConfigEntries: string[] = [];
    const fmpConfigToolsEntries: string[] = [];

    selectedTools.forEach((tool) => {
        const config: ToolConfig = toolConfigs[tool];
        if (config) {
            if (config.hasInputComponent) {
                const componentName = config.inputComponentImport?.match(/import (\w+) from/)?.[1];
                if (componentName) {
                    additionalInputAreaUiEntries.push(`  ${config.shortName}: ${componentName},`);
                }
            }

            if (config.hasOutputComponent) {
                const componentName = config.outputComponentImport?.match(/import (\w+) from/)?.[1];
                if (componentName) {
                    additionalOutputAreaUiEntries.push(`  ${config.shortName}: ${componentName},`);
                }
            }

            const executorName = config.executorImport.match(/import \{ (\w+) \} from/)?.[1];
            if (executorName) {
                toolExecutionEntries.push(`  ${config.shortName}: ${executorName},`);
            }

            toolOutputEntries.push(`  ${config.shortName}: ${config.outputComponent},`);

            const langName = config.languageImport.match(/import \{ \w+, (\w+) \} from/)?.[1];
            const confName = config.languageImport.match(/import \{ (\w+), \w+ \} from/)?.[1];
            if (langName && confName) {
                // Map tool keys to language config keys
                const langKey = tool === 'smt' ? 'smt2' : tool === 'nuxmv' ? 'xmv' : tool === 'alloy' ? 'als' : tool;
                languageConfigEntries.push(`  ${langKey}: { tokenProvider: ${langName}, configuration: ${confName} },`);
            }

            fmpConfigToolsEntries.push(
                `    ${tool}: { name: '${config.name}', extension: '${config.extension}', shortName: '${config.shortName}' },`
            );
        }
    });

    // Generate the complete ToolMaps.tsx content
    const toolMapsContent = `// filepath: Generated ToolMaps.tsx for selected tools
// Tool executors
${executorImports.join('\n')}

${baseImports.join('\n')}

// Language configurations for the different tools
${languageImports.join('\n')}

${
    inputComponentImports.length > 0
        ? '\n// Additional input area components for the different tools\n' + inputComponentImports.join('\n')
        : ''
}

${
    outputComponentImports.length > 0
        ? '\n// Additional output area components for the different tools\n' + outputComponentImports.join('\n')
        : ''
}

import type { FmpConfig } from '@/types';

${
    additionalInputAreaUiEntries.length > 0
        ? `export const additionalInputAreaUiMap: Record<string, React.FC<any>> = {\n${additionalInputAreaUiEntries.join('\n')}\n};`
        : 'export const additionalInputAreaUiMap: Record<string, React.FC<any>> = {};'
}

${
    additionalOutputAreaUiEntries.length > 0
        ? `export const additonalOutputAreaUiMap: Record<string, React.FC<any>> = {\n${additionalOutputAreaUiEntries.join('\n')}\n};`
        : 'export const additonalOutputAreaUiMap: Record<string, React.FC<any>> = {};'
}

export const toolExecutionMap: Record<string, () => void> = {
${toolExecutionEntries.join('\n')}
};

export const toolOutputMap: Record<string, React.FC<any>> = {
${toolOutputEntries.join('\n')}
};

export const languageConfigMap: Record<string, { tokenProvider: any; configuration: any }> = {
${languageConfigEntries.join('\n')}
};

export const fmpConfig: FmpConfig = {
  title: 'FM Playground',
  repository: 'https://github.com/se-buw/fm-playground',
  issues: 'https://github.com/se-buw/fm-playground/issues',
  tools: {
${fmpConfigToolsEntries.join('\n')}
  },
};
`;

    // Write the generated ToolMaps.tsx file
    const toolMapsPath = path.join(targetDir, 'src', 'ToolMaps.tsx');
    await fs.writeFile(toolMapsPath, toolMapsContent);
}

async function updateHtmlFile(targetDir: string, selectedTools: string[], spinner: any): Promise<void> {
    spinner.text = 'Updating HTML file for tool-specific scripts...';

    const htmlFilePath = path.join(targetDir, 'index.html');
    if (await fs.pathExists(htmlFilePath)) {
        let htmlContent = await fs.readFile(htmlFilePath, 'utf8');

        // Always remove analytics script from generated projects
        htmlContent = htmlContent.replace(
            /<script defer src="https:\/\/play\.formal-methods\.net\/analytics\/script\.js"[^>]*><\/script>\s*/g,
            ''
        );

        // Check which tools are selected
        const includeZ3Scripts = selectedTools.includes('smt');
        const includeLimbooleScripts = selectedTools.includes('limboole');

        // Handle Z3 scripts - only remove if SMT tool is NOT selected
        if (!includeZ3Scripts) {
            // Remove Z3 script tags and global initialization if SMT is not selected
            htmlContent = htmlContent.replace(/<script src="z3-built\.js"><\/script>\s*/g, '');
            htmlContent = htmlContent.replace(
                /<script>\s*globalThis\.global = \{ initZ3: globalThis\.initZ3 \};\s*<\/script>\s*/g,
                ''
            );
        }

        // Handle Limboole scripts - only remove if Limboole tool is NOT selected
        if (!includeLimbooleScripts) {
            // Remove Limboole script tag if Limboole is not selected
            htmlContent = htmlContent.replace(/<script src="limboole\.js"><\/script>\s*/g, '');
        }

        await fs.writeFile(htmlFilePath, htmlContent);
    }
}

async function updateViteConfig(targetDir: string, selectedTools: string[], spinner: any): Promise<void> {
    spinner.text = 'Updating Vite config for selected tools...';

    const viteConfigPath = path.join(targetDir, 'vite.config.ts');
    if (await fs.pathExists(viteConfigPath)) {
        let viteContent = await fs.readFile(viteConfigPath, 'utf8');

        // Tool to proxy path mapping
        const toolProxyPaths: Record<string, string> = {
            nuxmv: '/nuxmv',
            smt: '/smt',
            alloy: '/alloy',
            spectra: '/spectra',
        };

        // Remove proxy configurations for unselected tools
        Object.keys(toolProxyPaths).forEach((tool) => {
            if (!selectedTools.includes(tool)) {
                const proxyPath = toolProxyPaths[tool];

                // Create a more robust regex pattern that handles the proxy configuration
                // This pattern matches the entire proxy block including nested braces
                const proxyPattern = new RegExp(`\\s*'${proxyPath.replace('/', '\\/')}':\\s*\\{[\\s\\S]*?\\},?`, 'g');

                viteContent = viteContent.replace(proxyPattern, '');
            }
        });

        // Clean up any trailing commas before closing braces
        viteContent = viteContent.replace(/,(\s*})/g, '$1');

        // Clean up any empty lines that might be left
        viteContent = viteContent.replace(/\n\s*\n\s*\n/g, '\n\n');

        await fs.writeFile(viteConfigPath, viteContent);
    }
}

async function createProjectReadme(
    targetDir: string,
    projectName: string,
    selectedTools: string[],
    spinner: any
): Promise<void> {
    spinner.text = 'Creating README...';

    const toolsSection =
        selectedTools.length > 0
            ? `## Included Tools

${selectedTools
    .map((tool) => {
        const toolInfo = AVAILABLE_TOOLS.find((t) => t.value === tool);
        return `- **${toolInfo?.name}**: ${toolInfo?.description}`;
    })
    .join('\n')}`
            : `## Setup

This is a minimal FM Playground setup with no tools pre-installed. You can add formal method tools by modifying the project structure and configuration files.`;

    const readmeContent = `# ${projectName}

A Formal Methods playground project created with create-fm-playground.

${toolsSection}

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Open your browser and navigate to \`http://localhost:5173\`

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build
- \`npm run lint\` - Run linter

## About

This project was created using [create-fm-playground](https://github.com/se-buw/fm-playground), a tool for setting up Formal Methods playground projects.

For more information about the tools and how to use them, visit [formal-methods.net](https://formal-methods.net);
`;

    await fs.writeFile(path.join(targetDir, 'README.md'), readmeContent);
}

async function installDependencies(targetDir: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const npmInstall = spawn('npm', ['install'], {
            cwd: targetDir,
            stdio: 'inherit',
        });

        npmInstall.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`npm install failed with code ${code}`));
            }
        });
    });
}

async function copyCommonFiles(
    sourceDir: string,
    targetDir: string,
    selectedTools: string[],
    spinner: any
): Promise<void> {
    // Get all files in the common directory
    const items = await fs.readdir(sourceDir);

    for (const item of items) {
        const sourcePath = path.join(sourceDir, item);
        const targetPath = path.join(targetDir, item);
        const stat = await fs.stat(sourcePath);

        if (stat.isDirectory()) {
            // Copy directories as-is
            await fs.copy(sourcePath, targetPath);
        } else if (item === 'Guides.json') {
            // Handle Guides.json selectively
            await copySelectiveGuidesJson(sourcePath, targetPath, selectedTools);
        } else if (item === 'lineHighlightingUtil.ts') {
            // Handle lineHighlightingUtil.ts selectively
            await copySelectiveLineHighlightingUtil(sourcePath, targetPath, selectedTools);
        } else {
            // Copy other files as-is
            await fs.copy(sourcePath, targetPath);
        }
    }
}

async function copySelectiveGuidesJson(sourcePath: string, targetPath: string, selectedTools: string[]): Promise<void> {
    if (selectedTools.length === 0) {
        // If no tools selected, create an empty guides object
        const emptyGuides = {
            // No tools selected - add guides here when you add tools
        };
        await fs.writeJson(targetPath, emptyGuides, { spaces: 2 });
        return;
    }

    // Read the original Guides.json
    const originalGuides: GuidesJson = await fs.readJson(sourcePath);
    const filteredGuides: GuidesJson = {};

    // Tool name mapping for guides
    const toolToGuideKey: Record<string, string> = {
        limboole: 'limboole',
        smt: 'smt2',
        nuxmv: 'xmv',
        alloy: 'als',
        spectra: 'spectra',
    };

    // Only include guides for selected tools
    selectedTools.forEach((tool) => {
        const guideKey = toolToGuideKey[tool];
        if (guideKey && originalGuides[guideKey]) {
            filteredGuides[guideKey] = originalGuides[guideKey];
        }
    });

    await fs.writeJson(targetPath, filteredGuides, { spaces: 2 });
}

async function copySelectiveLineHighlightingUtil(
    sourcePath: string,
    targetPath: string,
    selectedTools: string[]
): Promise<void> {
    const originalContent = await fs.readFile(sourcePath, 'utf8');

    if (selectedTools.length === 0) {
        // If no tools selected, create a minimal version with just the main export function
        const minimalContent = `/**
 * Get the line number to highlight in the code editor.
 * @param {*} result - output of the tool execution.
 * @param {*} toolId - language id i.e., 'limboole', 'smt2', 'xmv', 'spectra'
 * @returns
 */
export function getLineToHighlight(result: string, toolId: string) {
  // No tools configured - add tool-specific highlighting functions when you add tools
  return [];
}
`;
        await fs.writeFile(targetPath, minimalContent);
        return;
    }

    // Tool name mapping for line highlighting functions
    const toolToFunctionMap: Record<string, string> = {
        limboole: 'getLineToHighlightLimboole',
        smt: 'getLineToHighlightSmt2',
        nuxmv: 'getLineToHighlightXmv',
        alloy: 'getLinesToHighlightAlloy',
        spectra: 'getLinesToHighlightSpectra',
    };

    // Extract function definitions using line-by-line parsing for better reliability
    const lines = originalContent.split('\n');
    const selectedFunctions: string[] = [];
    const selectedCases: string[] = [];

    selectedTools.forEach((tool) => {
        const functionName = toolToFunctionMap[tool];
        if (functionName) {
            // Find function start and extract complete function
            let functionStart = -1;
            let functionEnd = -1;
            let braceCount = 0;
            let inFunction = false;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                if (line.includes(`function ${functionName}(`)) {
                    functionStart = i;
                    inFunction = true;
                }

                if (inFunction) {
                    // Count braces to find function end
                    for (let char of line) {
                        if (char === '{') braceCount++;
                        if (char === '}') braceCount--;
                    }

                    if (braceCount === 0 && functionStart >= 0 && i > functionStart) {
                        functionEnd = i;
                        break;
                    }
                }
            }

            if (functionStart >= 0 && functionEnd >= 0) {
                const functionContent = lines.slice(functionStart, functionEnd + 1).join('\n');
                selectedFunctions.push(functionContent);
            }

            // Create the case for the main function
            const toolId =
                tool === 'smt'
                    ? 'smt2'
                    : tool === 'nuxmv'
                      ? 'xmv'
                      : tool === 'alloy'
                        ? 'als'
                        : tool === 'spectra'
                          ? 'spectra'
                          : tool;

            selectedCases.push(`  if (toolId === '${toolId}') {
    return ${functionName}(result);
  }`);
        }
    });

    // Generate the filtered content
    const filteredContent = `${selectedFunctions.join('\n\n')}

/**
 * Get the line number to highlight in the code editor.
 * @param {*} result - output of the tool execution.
 * @param {*} toolId - language id i.e., 'limboole', 'smt2', 'xmv', 'spectra'
 * @returns
 */
export function getLineToHighlight(result: string, toolId: string) {
${selectedCases.join(' else ')}
}
`;

    await fs.writeFile(targetPath, filteredContent);
}

async function copyBackend(rootSourceDir: string, targetDir: string, spinner: Ora): Promise<void> {
    spinner.text = 'Copying backend...';

    const backendSourceDir = path.join(rootSourceDir, 'backend');
    const backendTargetDir = path.join(targetDir, 'backend');

    // Check if backend directory exists
    if (await fs.pathExists(backendSourceDir)) {
        await fs.copy(backendSourceDir, backendTargetDir);
    } else {
        console.warn(chalk.yellow(`Warning: Backend directory not found at ${backendSourceDir}`));
    }
}

async function copySelectedApis(
    rootSourceDir: string,
    targetDir: string,
    selectedTools: string[],
    spinner: Ora
): Promise<void> {
    spinner.text = 'Copying selected API directories...';

    // Tool to API directory mapping
    const toolToApiMap: Record<string, string> = {
        alloy: 'alloy-api',
        limboole: 'limboole-api',
        nuxmv: 'nuxmv-api',
        smt: 'z3-api',
        spectra: 'spectra-api',
    };

    for (const tool of selectedTools) {
        const apiDirName = toolToApiMap[tool];
        if (apiDirName) {
            const apiSourceDir = path.join(rootSourceDir, apiDirName);
            const apiTargetDir = path.join(targetDir, apiDirName);

            if (await fs.pathExists(apiSourceDir)) {
                await fs.copy(apiSourceDir, apiTargetDir);
                spinner.text = `Copied ${apiDirName}...`;
            } else {
                console.warn(chalk.yellow(`Warning: API directory not found for ${tool}: ${apiSourceDir}`));
            }
        }
    }
}

// Export functions for testing
export {
    generateToolMaps,
    updateViteConfig,
    copySelectiveGuidesJson,
    copySelectiveLineHighlightingUtil,
    copyBackend,
    copySelectedApis,
};
