#!/usr/bin/env node
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import Mustache from 'mustache';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ToolConfig {
    toolName: string;
    toolDisplayName: string;
    toolId: string;
    fileExtension: string;
    hasApiEndpoint: boolean;
    apiEndpoint?: string;
    outputComponent: 'PlainOutput' | 'CustomOutput';
    hasAdditionalInputComponent: boolean;
    hasAdditionalOutputComponent: boolean;
    targetPath: string;
}

async function createFmTool(providedName?: string, options: any = {}) {
    console.log(chalk.blue.bold('🛠️  FM Tool Generator'));
    console.log(chalk.gray('Creating a new formal methods tool for fm-playground\n'));

    const config = await promptForConfig(providedName, options);

    console.log(chalk.yellow('\n📋 Configuration:'));
    console.log(`Tool Name: ${chalk.cyan(config.toolDisplayName)}`);
    console.log(`Tool ID: ${chalk.cyan(config.toolId)}`);
    console.log(`File Extension: ${chalk.cyan(config.fileExtension)}`);
    console.log(`Target Path: ${chalk.cyan(config.targetPath)}\n`);

    const confirm = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'proceed',
            message: 'Proceed with creating the tool?',
            default: true,
        },
    ]);

    if (!confirm.proceed) {
        console.log(chalk.yellow('Tool creation cancelled.'));
        return;
    }

    await generateTool(config);

    console.log(chalk.green.bold('\n✅ Tool created successfully!'));
    console.log(chalk.yellow('\n📝 Next steps:'));
    console.log(`1. Update ToolMaps.tsx to register your new tool (see TOOLMAPS_INTEGRATION.md)`);
    console.log(`2. Add language configuration to the monaco editor setup if needed`);
    console.log(`3. Implement the API endpoint if needed`);
    console.log(`4. Customize the generated files to fit your tool's requirements\n`);
}

async function promptForConfig(providedName?: string, options: any = {}): Promise<ToolConfig> {
    const questions = [];

    if (!providedName) {
        questions.push({
            type: 'input',
            name: 'toolName',
            message: 'What is the name of your tool? (e.g., nuxmv, z3, alloy)',
            validate: (input: string) => input.length > 0 || 'Tool name is required',
        });
    }

    questions.push(
        {
            type: 'input',
            name: 'toolDisplayName',
            message: 'Display name for the tool:',
            default: (answers: any) => providedName || answers.toolName,
        },
        {
            type: 'input',
            name: 'toolId',
            message: 'Tool ID (uppercase, used in maps):',
            default: (answers: any) => (providedName || answers.toolName).toUpperCase(),
        },
        {
            type: 'input',
            name: 'fileExtension',
            message: 'File extension for the language:',
            default: (answers: any) => (providedName || answers.toolName).toLowerCase(),
        },
        {
            type: 'confirm',
            name: 'hasApiEndpoint',
            message: 'Does this tool require an API endpoint?',
            default: true,
        },
        {
            type: 'input',
            name: 'apiEndpoint',
            message: 'API endpoint path:',
            when: (answers: any) => answers.hasApiEndpoint,
            default: (answers: any) => `/${(providedName || answers.toolName).toLowerCase()}`,
        },
        {
            type: 'list',
            name: 'outputComponent',
            message: 'Output component type:',
            choices: ['PlainOutput', 'CustomOutput'],
            default: 'PlainOutput',
        },
        {
            type: 'confirm',
            name: 'hasAdditionalInputComponent',
            message: 'Create additional input component (for options)?',
            default: false,
        },
        {
            type: 'confirm',
            name: 'hasAdditionalOutputComponent',
            message: 'Create additional output component (like copyright notice)?',
            default: false,
        }
    );

    const answers = await inquirer.prompt(questions);

    return {
        toolName: providedName || answers.toolName,
        toolDisplayName: answers.toolDisplayName,
        toolId: answers.toolId,
        fileExtension: answers.fileExtension,
        hasApiEndpoint: answers.hasApiEndpoint,
        apiEndpoint: answers.apiEndpoint,
        outputComponent: answers.outputComponent,
        hasAdditionalInputComponent: answers.hasAdditionalInputComponent,
        hasAdditionalOutputComponent: answers.hasAdditionalOutputComponent,
        targetPath: options.path || './src/tools',
    };
}

async function generateTool(config: ToolConfig) {
    const toolPath = path.join(config.targetPath, config.toolName);
    const templatesPath = path.join(__dirname, '..', 'templates');

    // Ensure target directory exists
    await fs.ensureDir(toolPath);

    // Generate core files
    await generateExecutor(config, toolPath, templatesPath);
    await generateTextMateGrammar(config, toolPath, templatesPath);

    if (config.hasAdditionalInputComponent) {
        await generateInputComponent(config, toolPath, templatesPath);
    }

    if (config.hasAdditionalOutputComponent) {
        await generateOutputComponent(config, toolPath, templatesPath);
    }

    // Generate integration instructions
    await generateIntegrationInstructions(config, toolPath, templatesPath);
    await generateToolMapsTemplate(config, toolPath, templatesPath);

    // Update ToolMaps.tsx if it exists
    await updateToolMaps(config);
}

async function generateExecutor(config: ToolConfig, toolPath: string, templatesPath: string) {
    const template = await fs.readFile(path.join(templatesPath, 'executor.ts.mustache'), 'utf8');
    const rendered = Mustache.render(template, config);
    await fs.writeFile(path.join(toolPath, `${config.toolName}Executor.ts`), rendered);
}

async function generateTextMateGrammar(config: ToolConfig, toolPath: string, templatesPath: string) {
    const template = await fs.readFile(path.join(templatesPath, 'textMateGrammar.ts.mustache'), 'utf8');
    const rendered = Mustache.render(template, {
        ...config,
    });
    await fs.writeFile(path.join(toolPath, `${config.toolName}TextMateGrammar.ts`), rendered);
}

async function generateInputComponent(config: ToolConfig, toolPath: string, templatesPath: string) {
    const template = await fs.readFile(path.join(templatesPath, 'inputComponent.tsx.mustache'), 'utf8');
    const rendered = Mustache.render(template, config);
    await fs.writeFile(path.join(toolPath, `${config.toolDisplayName}Input.tsx`), rendered);
}

async function generateOutputComponent(config: ToolConfig, toolPath: string, templatesPath: string) {
    const template = await fs.readFile(path.join(templatesPath, 'outputComponent.tsx.mustache'), 'utf8');
    const rendered = Mustache.render(template, config);
    await fs.writeFile(path.join(toolPath, `${config.toolDisplayName}Output.tsx`), rendered);
}

async function generateToolMapsTemplate(config: ToolConfig, toolPath: string, templatesPath: string) {
    const template = await fs.readFile(path.join(templatesPath, 'ToolMaps.tsx.mustache'), 'utf8');
    const rendered = Mustache.render(template, config);
    await fs.writeFile(path.join(toolPath, 'TOOLMAPS_INTEGRATION.md'), rendered);
}

async function generateIntegrationInstructions(config: ToolConfig, toolPath: string, templatesPath: string) {
    const template = await fs.readFile(path.join(templatesPath, 'INTEGRATION.md.mustache'), 'utf8');
    const rendered = Mustache.render(template, config);
    await fs.writeFile(path.join(toolPath, 'INTEGRATION.md'), rendered);
}

async function updateToolMaps(config: ToolConfig) {
    const defaultToolMapsPath = path.join(config.targetPath, '..', 'ToolMaps.tsx');

    console.log(chalk.blue(`Looking for ToolMaps.tsx at default path: ${defaultToolMapsPath}`));

    // Check if default ToolMaps.tsx exists
    if (!(await fs.pathExists(defaultToolMapsPath))) {
        console.log(chalk.yellow(`ToolMaps.tsx not found at ${defaultToolMapsPath}.`));

        // Ask user if they want to update ToolMaps.tsx
        const { shouldUpdate } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'shouldUpdate',
                message: 'Do you want to update ToolMaps.tsx?',
                default: false,
            },
        ]);

        if (!shouldUpdate) {
            console.log(
                chalk.blue('Skipping ToolMaps.tsx update. You can manually integrate using the generated instructions.')
            );
            return;
        }

        // Ask for custom path
        const { customPath } = await inquirer.prompt([
            {
                type: 'input',
                name: 'customPath',
                message: 'Enter the path to ToolMaps.tsx:',
                default: 'src/ToolMaps.tsx',
                validate: (input: string) => {
                    if (!input || input.trim() === '') {
                        return 'Path cannot be empty';
                    }
                    return true;
                },
            },
        ]);

        const toolMapsPath = path.resolve(process.cwd(), customPath);

        console.log(chalk.blue(`Looking for ToolMaps.tsx at: ${toolMapsPath}`));

        // Check if the custom path exists
        if (!(await fs.pathExists(toolMapsPath))) {
            console.log(chalk.red(`ToolMaps.tsx not found at ${toolMapsPath}. Skipping automatic update.`));
            return;
        }

        // Proceed with the custom path
        await performToolMapsUpdate(config, toolMapsPath);
        return;
    }

    // Default path exists, proceed with update
    await performToolMapsUpdate(config, defaultToolMapsPath);
}

async function performToolMapsUpdate(config: ToolConfig, toolMapsPath: string) {
    try {
        const toolMapsContent = await fs.readFile(toolMapsPath, 'utf8');
        let updatedContent = toolMapsContent;

        // Add tool executor import
        const executorImportRegex = /(\/\/ Tool executors[\s\S]*?)(import type { FmpConfig })/;
        const executorImport = `import { execute${config.toolDisplayName}Tool } from '@/../tools/${config.toolName}/${config.toolName}Executor';\n`;

        if (!toolMapsContent.includes(executorImport.trim())) {
            updatedContent = updatedContent.replace(executorImportRegex, `$1${executorImport}\n$2`);
        }

        // Add TextMate grammar import
        const grammarImport = `import { ${config.toolName}Conf, ${config.toolName}Lang } from '@/../tools/${config.toolName}/${config.toolName}TextMateGrammar';\n`;
        const grammarImportRegex = /(\/\/ Language configurations[\s\S]*?spectraTextMateGrammar';)/;

        if (!toolMapsContent.includes(grammarImport.trim())) {
            updatedContent = updatedContent.replace(grammarImportRegex, `$1\n${grammarImport}`);
        }

        // Add to toolExecutionMap
        const executionMapRegex = /(export const toolExecutionMap[\s\S]*?)(};)/;
        const executionEntry = `  ${config.toolId}: execute${config.toolDisplayName}Tool,\n`;

        if (!toolMapsContent.includes(`${config.toolId}: execute${config.toolDisplayName}Tool`)) {
            updatedContent = updatedContent.replace(executionMapRegex, `$1${executionEntry}$2`);
        }

        // Add to toolOutputMap
        const outputMapRegex = /(export const toolOutputMap[\s\S]*?)(};)/;
        const outputEntry = `  ${config.toolId}: TextualOutput,\n`;

        if (!toolMapsContent.includes(`${config.toolId}: TextualOutput`)) {
            updatedContent = updatedContent.replace(outputMapRegex, `$1${outputEntry}$2`);
        }

        // Add to languageConfigMap
        const languageMapRegex = /(export const languageConfigMap[\s\S]*?)(};)/;
        const languageEntry = `  ${config.fileExtension}: { tokenProvider: ${config.toolName}Lang, configuration: ${config.toolName}Conf },\n`;

        if (!toolMapsContent.includes(`${config.fileExtension}: { tokenProvider: ${config.toolName}Lang`)) {
            updatedContent = updatedContent.replace(languageMapRegex, `$1${languageEntry}$2`);
        }

        // Add to fmpConfig.tools
        const fmpConfigRegex = /(tools: {[\s\S]*?)(  },\n};)/;
        const toolConfigEntry = `    ${config.toolName}: { name: '${config.toolDisplayName}', extension: '${config.fileExtension}', shortName: '${config.toolId}' },\n`;

        if (!toolMapsContent.includes(`${config.toolName}: { name: '${config.toolDisplayName}'`)) {
            updatedContent = updatedContent.replace(fmpConfigRegex, `$1${toolConfigEntry}$2`);
        }

        // Add additional input component if needed
        if (config.hasAdditionalInputComponent) {
            const inputImport = `import ${config.toolDisplayName}Input from '@/../tools/${config.toolName}/${config.toolDisplayName}Options';\n`;
            const inputImportRegex =
                /(\/\/ Additional input area components[\s\S]*?)(\/\/ Additional output area components)/;

            if (!toolMapsContent.includes(inputImport.trim())) {
                updatedContent = updatedContent.replace(inputImportRegex, `$1${inputImport}\n$2`);
            }

            const inputMapRegex = /(export const additionalInputAreaUiMap[\s\S]*?)(};)/;
            const inputEntry = `  ${config.toolId}: ${config.toolDisplayName}Input,\n`;

            if (!toolMapsContent.includes(`${config.toolId}: ${config.toolDisplayName}Input`)) {
                updatedContent = updatedContent.replace(inputMapRegex, `$1${inputEntry}$2`);
            }
        }

        // Add additional output component if needed
        if (config.hasAdditionalOutputComponent) {
            const outputImport = `import ${config.toolDisplayName}Output from '@/../tools/${config.toolName}/${config.toolDisplayName}Output';\n`;
            const outputImportRegex = /(\/\/ Additional output area components[\s\S]*?)(import type { FmpConfig })/;

            if (!toolMapsContent.includes(outputImport.trim())) {
                updatedContent = updatedContent.replace(outputImportRegex, `$1${outputImport}\n$2`);
            }

            const outputMapRegex = /(export const additonalOutputAreaUiMap[\s\S]*?)(};)/;
            const outputEntry = `  ${config.toolId}: ${config.toolDisplayName}Output,\n`;

            if (!toolMapsContent.includes(`${config.toolId}: ${config.toolDisplayName}Output`)) {
                updatedContent = updatedContent.replace(outputMapRegex, `$1${outputEntry}$2`);
            }
        }

        // Write the updated content back to the file
        await fs.writeFile(toolMapsPath, updatedContent);

        console.log(chalk.green(`✅ Successfully updated ToolMaps.tsx with ${config.toolDisplayName} tool`));
    } catch (error) {
        console.log(chalk.yellow(`⚠️  Could not automatically update ToolMaps.tsx: ${error}`));
        console.log(chalk.blue(`Please manually add the tool using the instructions in TOOLMAPS_INTEGRATION.md`));
    }
}

// Export the main function for CLI usage
export { createFmTool };
