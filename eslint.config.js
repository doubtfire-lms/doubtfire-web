// @ts-check

// Allows us to bring in the recommended core rules from eslint itself
const eslint = require('@eslint/js');

// Allows us to use the typed utility for our config, and to bring in the recommended rules for TypeScript projects from typescript-eslint
const tseslint = require('typescript-eslint');

// Allows us to bring in the recommended rules for Angular projects from angular-eslint
const angular = require('angular-eslint');

const prettierPlugin = require('eslint-plugin-prettier');

/**
 * Scope Angular template configs to HTML files.
 *
 * The cast is intentionally loose because angular-eslint and typescript-eslint
 * can resolve different copies of @typescript-eslint utility types.
 *
 * @param {unknown[]} configs
 * @returns {any[]}
 */
const htmlTemplateConfigs = (configs) =>
  configs.map((config) => ({
    .../** @type {object} */ (config),
    files: ['**/*.html'],
  }));

// Export our config array, which is composed together thanks to the typed utility function from typescript-eslint
module.exports = tseslint.config(
  {
    ignores: ['build/**', 'coverage/**', 'dist/**', 'docs/**', '**/*.tpl.html'],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
  },
  {
    // Everything in this config object targets our TypeScript files (Components, Directives, Pipes etc)
    files: ['**/*.ts'],
    extends: [
      // Apply the recommended core rules
      eslint.configs.recommended,
      // Apply the recommended TypeScript rules
      ...tseslint.configs.recommended,
      // Optionally apply stylistic rules from typescript-eslint that improve code consistency
      ...tseslint.configs.stylistic,
      // Apply the recommended Angular rules
      ...angular.configs.tsRecommended,
    ],
    // Set the custom processor which will allow us to have our inline Component templates extracted
    // and treated as if they are HTML files (and therefore have the .html config below applied to them)
    processor: angular.processInlineTemplates,
    // Override specific rules for TypeScript files (these will take priority over the extended configs above)
    // TODO: go through each rule and remove each one and fix
    rules: {
      '@angular-eslint/prefer-inject': 'off',
      '@angular-eslint/prefer-standalone': 'off',
      '@typescript-eslint/consistent-generic-constructors': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': [
        'off',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-wrapper-object-types': 'off',
      'no-constant-binary-expression': 'off',
      'no-empty': 'off',
      'no-misleading-character-class': 'off',
      'no-useless-escape': 'off',
      'no-var': 'off',
      'prefer-const': 'off',
      'prettier/prettier': 'warn',
    },
  },
  {
    files: ['**/*.ts'],
    plugins: {prettier: prettierPlugin},
    rules: {
      'prettier/prettier': 'warn',
    },
  },
  {
    files: ['**/*.component.html'],
    plugins: {prettier: prettierPlugin},
    rules: {
      'prettier/prettier': 'warn',
    },
  },
  ...htmlTemplateConfigs(angular.configs.templateRecommended),
  ...htmlTemplateConfigs(angular.configs.templateAccessibility),
  {
    // Everything in this config object targets our HTML files (external templates,
    // and inline templates as long as we have the `processor` set on our TypeScript config above)
    files: ['**/*.html'],
    rules: {
      '@angular-eslint/template/mouse-events-have-key-events': 'off',
      '@angular-eslint/template/click-events-have-key-events': 'off',
      '@angular-eslint/template/interactive-supports-focus': 'off',
      '@angular-eslint/template/alt-text': 'off',
      '@angular-eslint/template/elements-content': 'off',
      '@angular-eslint/template/eqeqeq': 'off',
      '@angular-eslint/template/label-has-associated-control': 'off',
      '@angular-eslint/template/prefer-control-flow': 'off',
    },
  },
);
