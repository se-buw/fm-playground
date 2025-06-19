module.exports = {
    root: true,
    env: { browser: true, es2020: true, node: true },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
    ],
    ignorePatterns: [
        'dist',
        '.eslintrc.cjs',
        'node_modules',
        'public/*.js',        // Ignore generated JS files in public
        'public/*.wasm',      // Ignore WASM files
        'public/*.worker.js', // Ignore worker files
        'tools/*/langium/ls/generated/**',  // Ignore generated Langium files
        'tools/*/langium/syntaxes/**',      // Ignore syntax files
        'tools/*/*.js',       // Ignore JS tool files (likely generated)
        '**/*.d.ts',          // Ignore TypeScript declaration files
        'tools/alloy/alloyUtils.js',        // Ignore specific generated files
        'tools/limboole/limboole.js',       // Ignore limboole JS file
        'tools/**/*.ts',      // Ignore all TypeScript files in tools for now
        'tools/**/*.tsx',     // Ignore all TypeScript JSX files in tools for now
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true
        },
    },
    settings: { react: { version: '18.2' } },
    plugins: ['react-refresh'],
    rules: {
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        // Development-friendly rules
        'react/prop-types': 'off',         // Disable prop-types validation (using TypeScript)
        'no-unused-vars': 'off',           // Disable unused vars completely for development
        'react-hooks/rules-of-hooks': 'warn', // Warn instead of error for React hooks
        'react-hooks/exhaustive-deps': 'off', // Disable exhaustive deps for development
        'no-control-regex': 'off',         // Disable the no-control-regex rule
        'no-useless-catch': 'off',         // Disable the no-useless-catch rule
        'no-undef': 'off',                 // Disable no-undef for TypeScript files
        '@typescript-eslint/no-unused-vars': 'off', // Disable TS unused vars too
        'no-empty-pattern': 'off',         // Allow empty object patterns
        'react/no-unescaped-entities': 'off', // Allow unescaped entities in JSX
        'no-useless-escape': 'off',        // Allow unnecessary escapes
        'react/jsx-no-target-blank': 'off', // Allow target="_blank" without rel
    },
};
