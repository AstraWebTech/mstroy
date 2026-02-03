import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue'
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [vue(), tsconfigPaths()],
    test: {
        environment: 'jsdom',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: ['node_modules/', 'dist/', 'src/main.ts', 'src/**/index.ts'],
        },
        include: ['src/**/*.{test,spec}.{js,ts}'],
    },
});
