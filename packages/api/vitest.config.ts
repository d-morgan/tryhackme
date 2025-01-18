import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
},
resolve: {
    alias: {
    '@': resolve(__dirname, '.'),
    },
},
});
