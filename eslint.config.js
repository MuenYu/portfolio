import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hasTsParser = fs.existsSync(
  path.join(__dirname, 'node_modules', '@typescript-eslint', 'parser'),
);
const hasTsPlugin = fs.existsSync(
  path.join(__dirname, 'node_modules', '@typescript-eslint', 'eslint-plugin'),
);

const parserModule = hasTsParser
  ? '@typescript-eslint/parser'
  : path.resolve(__dirname, './scripts/ts-eslint-parser.cjs');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  {
    ignores: [
      'node_modules',
      'build',
      'dist',
      'storybook-static',
      'eslint.config.js',
      'public/**',
    ],
  },
  ...compat.config({
    root: true,
    parser: parserModule,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ...(hasTsPlugin
        ? { project: ['./tsconfig.json'], tsconfigRootDir: __dirname }
        : {}),
      ecmaFeatures: {
        jsx: true,
      },
    },
    env: {
      node: true,
      browser: true,
      commonjs: true,
      es6: true,
    },
    extends: [
      'eslint:recommended',
      ...(hasTsPlugin
        ? [
            'plugin:@typescript-eslint/recommended-type-checked',
            'plugin:@typescript-eslint/stylistic-type-checked',
            'plugin:@typescript-eslint/recommended-requiring-type-checking',
          ]
        : []),
      'plugin:react/recommended',
      'plugin:react/jsx-runtime',
      'plugin:react-hooks/recommended',
      'plugin:jsx-a11y/recommended',
      'plugin:storybook/recommended',
    ],
    plugins: [
      ...(hasTsPlugin ? ['@typescript-eslint'] : []),
      'react',
      'jsx-a11y',
    ],
    rules: {
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      'arrow-body-style': 'off',
      ...(hasTsPlugin
        ? {
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
              'error',
              { argsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/consistent-type-imports': [
              'error',
              { prefer: 'type-imports', disallowTypeAnnotations: true },
            ],
          }
        : {
            'no-unused-vars': 'off',
            'no-undef': 'off',
          }),
    },
    overrides: [
      {
        files: ['**/*.tsx'],
        rules: {
          'react/prop-types': 'off',
        },
      },
      {
        files: ['**/*.{js,jsx,ts,tsx}'],
        settings: {
          react: {
            version: 'detect',
          },
          formComponents: ['Form'],
          linkComponents: [
            { name: 'Link', linkAttribute: 'to' },
            { name: 'NavLink', linkAttribute: 'to' },
          ],
          'import/resolver': {
            typescript: {},
          },
        },
      },
      {
        files: ['**/*.cjs', '**/*.js'],
        parserOptions: {
          project: null,
        },
        ...(hasTsPlugin
          ? {
              rules: {
                '@typescript-eslint/no-var-requires': 'off',
              },
            }
          : {}),
      },
    ],
    reportUnusedDisableDirectives: true,
  }),
]);
