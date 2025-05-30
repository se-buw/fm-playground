#!/usr/bin/env node

/**
 * create-fm-playground
 *
 * A CLI tool to create new Formal Methods playground projects
 * with customizable tool selection.
 *
 * Usage:
 *   npx create-fm-playground
 *   create-fm-playground
 *
 * @author FM Playground Team
 * @license MIT
 */

process.on('SIGINT', () => {
    console.log('\n\n👋 Goodbye!');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n\n👋 Goodbye!');
    process.exit(0);
});

import { createFMPlayground } from './main';

createFMPlayground().catch((error: Error) => {
    console.error('Error:', error.message);
    process.exit(1);
});
