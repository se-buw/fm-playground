#!/usr/bin/env node

import { createFmTool } from '../dist/index.js';

// Parse command line arguments
const args = process.argv.slice(2);
let toolName = undefined;
let options = { path: './src/tools' };

// Simple argument parsing
for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '-p' || arg === '--path') {
        options.path = args[i + 1];
        i++; // Skip next argument as it's the value
    } else if (arg === '-h' || arg === '--help') {
        console.log(`
Usage: create-fm-tool [tool-name] [options]

Arguments:
  tool-name    Name of the tool to create (optional, will prompt if not provided)

Options:
  -p, --path   Target path for the tool (default: ./src/tools)
  -h, --help   Show this help message

Examples:
  create-fm-tool
  create-fm-tool my-tool
  create-fm-tool my-tool --path ./custom/path
    `);
        process.exit(0);
    } else if (!arg.startsWith('-') && !toolName) {
        toolName = arg;
    }
}

// Run the tool
try {
    await createFmTool(toolName, options);
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}
