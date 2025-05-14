import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import { defineConfig, globalIgnores } from 'eslint/config';
import _import from 'eslint-plugin-import';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default defineConfig([globalIgnores([
	'**/node_modules/',
	'**/babel.config.js',
	'**/metro.config.js',
	'**/.eslintrc.js',
	'**/node_modules/',
	'**/build/',
	'**/dist/',
	'**/.expo/',
	'**/babel.config.js',
	'**/metro.config.js',
	'**/*.config.js',
	'**/.eslintcache',
	'**/*.d.ts',
	'**/*.mjs',
	'**/*.cjs',
	'**/*.js',
]), {
	extends: fixupConfigRules(compat.extends(
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
	)),

	plugins: {
		'@typescript-eslint': fixupPluginRules(typescriptEslint),
		import: fixupPluginRules(_import),
		unicorn,
	},

	languageOptions: {
		globals: {
			...Object.fromEntries(Object.entries(globals.browser).map(([k, v]) => [k.trim(), v])),
			...globals.node,
		},

		parser: tsParser,
		ecmaVersion: 'latest',
		sourceType: 'module',

		parserOptions: {
			ecmaFeatures: {
				jsx: true,
			},
		},
	},

	settings: {},

	rules: {
		indent: ['error', 'tab'],

		'unicorn/filename-case': ['error', {
			cases: {
				kebabCase: true,
			},
		}],

		'@typescript-eslint/no-unused-vars': 'warn',

		// Do not allow using default exports (always use named exports)
		'import/no-default-export': 'off',

		'no-restricted-imports': ['error', {
			paths: [{
				name: 'uuid',
				message: 'Please use the custom ID generator from "../utils/id-generator" instead of uuid.',
			}],

			patterns: ['uuid/*', '*/uuid'],
		}],

		'@typescript-eslint/no-explicit-any': 'warn',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/no-non-null-assertion': 'warn',

		'import/order': ['error', {
			groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
			'newlines-between': 'always',

			alphabetize: {
				order: 'asc',
				caseInsensitive: true,
			},
		}],

		'no-console': ['warn', {
			allow: ['warn', 'error'],
		}],

		quotes: ['error', 'single', {
			avoidEscape: true,
		}],

		'comma-dangle': ['error', 'always-multiline'],
		semi: ['error', 'always'],
	},
}, {
	files: ['**/*.ts', '**/*.tsx'],

	rules: {
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/no-require-imports': 'off',
	},
}, {
	files: ['eslint.config.mjs'],
	rules: {
		'import/no-default-export': 'off', // Allow default export for ESLint config
	},
}]);
