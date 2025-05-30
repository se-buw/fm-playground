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

// Import the function using require since we're in a CLI context
import('../dist/index.js')
    .then((module) => {
        return module.createFMPlayground();
    })
    .catch((error) => {
        console.error('Error:', error.message);
        process.exit(1);
    });
