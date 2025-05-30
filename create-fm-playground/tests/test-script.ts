#!/usr/bin/env node

import { createFMPlayground } from '../src/index.js';

// Mock inquirer for automated testing
const originalInquirer = await import('inquirer');

// Override the prompt method to provide automated responses
(originalInquirer.default as any).prompt = async (questions: any) => {
    const responses: any = {};

    for (const question of questions) {
        switch (question.name) {
            case 'projectName':
                responses.projectName = 'test-final';
                break;
            case 'selectedTools':
                responses.selectedTools = ['alloy', 'smt']; // Select Alloy and SMT tools
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

// Run the test
try {
    await createFMPlayground();
    console.log('\n🎉 Test completed successfully!');
} catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
}
