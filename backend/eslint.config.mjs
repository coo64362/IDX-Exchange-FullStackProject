import { defineConfig } from 'eslint/config';

export default defineConfig([
    {
        ignores: ['node_modules/**'],
    },
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals: {
                Buffer: 'readonly',
                console: 'readonly',
                performance: 'readonly',
                process: 'readonly',
                require: 'readonly',
                module: 'readonly',
            },
        },
        rules: {
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        },
    },
]);
