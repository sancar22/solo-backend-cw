module.exports = {
  env: {
    es2021: true, // Use the latest EcmaScript features
    node: true, // Expect Node as execution environment
    'jest/globals': true, // We are using jest globals
  },
  extends: [ // Use Airbnb and typescript-eslint configuration
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser', // Parse code using @typescript-eslint/parser
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'import',
    'jest',
  ],
  rules: {
    camelcase: 0, // Backend frameworks and services use a lot of snake_case notation
    'no-underscore-dangle': 0, // We might use underscore dangles (everyone uses them)
    'import/extensions': 0, // We prefer import plugin not to check extensions as it's something @typescript-eslint will do
    'no-shadow': 0, // We prefer eslint not to check variable shadowing as it's something @typescript-eslint will do (next line)
    '@typescript-eslint/no-shadow': ['error'],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Here we let ourselves use `_` as unused function parameter
    'import/no-extraneous-dependencies': 0,
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error',
    'consistent-return': 0,
    'no-console': 0,
    'no-control-regex': 0,
    'no-plusplus': 0,
    'eslint-disable-next-line new-cap': 0,
    'max-len': 0,
    'new-cap': 0,
    'no-await-in-loop': 0,
  },
  overrides: [ // Overrides are rule for specific file extensions
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        'import/prefer-default-export': 0, // We do not prefer default export in typescript
      },
    },
  ],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'], // Here we specify what extensions we let parser to resolve
    },
    'import/resolver': {
      typescript: {
        // And finally, here we ask ESLint to check if type definitions for the package installed
        alwaysTryTypes: true,
      },
    },
  },
};
