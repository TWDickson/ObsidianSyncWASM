import { defineConfig } from 'vitest/config';
import * as path from 'path';

export default defineConfig({
	test: {
		// Use happy-dom for a lightweight DOM environment
		environment: 'happy-dom',

		// Include test files
		include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

		// Exclude common directories
		exclude: [
			'**/node_modules/**',
			'**/dist/**',
			'**/wasm/**',
			'**/.{idea,git,cache,output,temp}/**',
		],

		// Coverage configuration
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'**/*.config.*',
				'**/*.d.ts',
				'**/test/**',
				'wasm/',
			],
		},

		// Global test setup
		globals: true,

		// Mock setup
		setupFiles: ['./test/setup.ts'],
	},

	resolve: {
		alias: {
			// Map obsidian to our mock
			obsidian: path.resolve(__dirname, './test/mocks/obsidian.ts'),
			// Ensure main imports the TypeScript source, not the compiled JS
			'../../main': path.resolve(__dirname, './main.ts'),
			'../../main.js': path.resolve(__dirname, './main.ts'),
		},
		extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
	},
});
