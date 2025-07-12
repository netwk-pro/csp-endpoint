/* ==========================================================================
eslint.config.mjs

Copyright © 2025 Network Pro Strategies (Network Pro™)
SPDX-License-Identifier: CC-BY-4.0 OR GPL-3.0-or-later
This file is part of Network Pro.
========================================================================== */

import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

const GLOBALS = {
  ...globals.browser,
  ...globals.node,
  self: 'readonly',
  location: 'readonly',
  indexedDB: 'readonly',
};

const ESLINT_RULES = {
  indent: 'off',
  quotes: 'off',
  semi: 'off',
};

export default [
  {
    ignores: [
      '.*',
      '*.xml',
      '**/.cache/**',
      '**/.vscode/**',
      '**/coverage/**',
      '**/build/**',
      'package-lock.json',
      'node_modules/',
      '*.lock',
      '.env*',
    ],
  },

  // JavaScript/Node.js
  {
    files: ['**/*.mjs', '**/*.js'],
    languageOptions: {
      globals: GLOBALS,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      ...js.configs.recommended.rules,
      ...eslintConfigPrettier.rules,
      ...ESLINT_RULES,
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];
