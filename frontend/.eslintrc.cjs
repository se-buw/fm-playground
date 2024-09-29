module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // FIXME: Resolve these rules once the project is ready for production
    // 'react/prop-types': 'off', // Disable prop-types validation
    // 'no-unused-vars': 'off', // Disable the no-unused-vars rule
    // 'react-hooks/rules-of-hooks': 'off', // Disable the rule globally
    // 'no-control-regex': 'off', // Disable the no-control-regex rule
    // 'no-useless-catch': 'off', // Disable the no-useless-catch rule
  },
}
