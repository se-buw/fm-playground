#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock inquirer for automated testing
async function mockCreateProject() {
    const { createFMPlayground } = await import('../src/index.js');

    // Override the prompt method to provide automated responses
    const inquirer = await import('inquirer');
    const originalPrompt = inquirer.default.prompt;

    (inquirer as any).default.prompt = async (questions) => {
        const responses: { [key: string]: any } = {};

        for (const question of questions) {
            switch (question.name) {
                case 'projectName':
                    responses.projectName = 'test-vite-config';
                    break;
                case 'selectedTools':
                    responses.selectedTools = ['alloy', 'limboole']; // Only these tools, no nuxmv, smt, spectra
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

    try {
        await createFMPlayground();

        // Restore original prompt
        inquirer.default.prompt = originalPrompt;

        return true;
    } catch (error) {
        inquirer.default.prompt = originalPrompt;
        throw error;
    }
}

async function main() {
    try {
        console.log('🧪 Testing Vite config proxy removal with create-fm-playground...');

        // Create the project
        console.log('📦 Creating test project...');
        await mockCreateProject();

        // Check the generated vite.config.ts
        const projectPath = path.resolve(process.cwd(), 'test-vite-config');
        const viteConfigPath = path.join(projectPath, 'vite.config.ts');

        if (await fs.pathExists(viteConfigPath)) {
            const viteContent = await fs.readFile(viteConfigPath, 'utf8');

            // Check which proxies are present
            const hasNuxmv = viteContent.includes("'/nuxmv'");
            const hasSmt = viteContent.includes("'/smt'");
            const hasAlloy = viteContent.includes("'/alloy'");
            const hasSpectra = viteContent.includes("'/spectra'");

            console.log('🔍 Proxy configuration results:');
            console.log(`✅ Alloy proxy: ${hasAlloy ? 'Present (correct)' : 'Missing (ERROR)'}`);
            console.log(`❌ nuXmv proxy: ${hasNuxmv ? 'Present (ERROR)' : 'Removed (correct)'}`);
            console.log(`❌ SMT proxy: ${hasSmt ? 'Present (ERROR)' : 'Removed (correct)'}`);
            console.log(`❌ Spectra proxy: ${hasSpectra ? 'Present (ERROR)' : 'Removed (correct)'}`);

            const success = hasAlloy && !hasNuxmv && !hasSmt && !hasSpectra;

            if (success) {
                console.log('\n🎉 SUCCESS! Vite config proxy removal is working correctly.');
            } else {
                console.log('\n❌ FAILED! Some proxy configurations are incorrect.');
                console.log('\n📄 Generated vite.config.ts content (first 1000 chars):');
                console.log(viteContent.substring(0, 1000));
            }

            // Cleanup
            console.log('\n🧹 Cleaning up test project...');
            await fs.remove(projectPath);

            process.exit(success ? 0 : 1);
        } else {
            throw new Error('vite.config.ts was not generated');
        }
    } catch (error) {
        console.error('❌ Test failed:', error.message);

        // Cleanup on error
        const projectPath = path.resolve(process.cwd(), 'test-vite-config');
        if (await fs.pathExists(projectPath)) {
            await fs.remove(projectPath);
        }

        process.exit(1);
    }
}

main();
