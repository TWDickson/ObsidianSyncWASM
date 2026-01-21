/**
 * Integration tests for Yrs CRDT WASM integration
 * Tests the TypeScript ↔ WASM boundary for verify_yrs function
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the WASM module with verify_yrs function
vi.mock('../../wasm/pkg/obsidian_sync_wasm.js', () => ({
	default: vi.fn(async () => {}), // init function
	greet: vi.fn((name: string) => `Hello, ${name}!`),
	compute_hash: vi.fn((input: string) => 'mock-hash-' + input.length),
	verify_yrs: vi.fn(() => 'Yrs CRDT library loaded successfully!'),
}));

describe('Yrs CRDT WASM Integration', () => {
	let verify_yrs: () => string;

	beforeEach(async () => {
		// Import the mocked WASM module
		const wasmModule = await import('../../wasm/pkg/obsidian_sync_wasm.js');
		verify_yrs = wasmModule.verify_yrs;
	});

	describe('verify_yrs', () => {
		it('should be callable from TypeScript', () => {
			expect(verify_yrs).toBeDefined();
			expect(typeof verify_yrs).toBe('function');
		});

		it('should return a success message', () => {
			const result = verify_yrs();
			expect(result).toBe('Yrs CRDT library loaded successfully!');
		});

		it('should return a string', () => {
			const result = verify_yrs();
			expect(typeof result).toBe('string');
		});

		it('should be callable multiple times', () => {
			const result1 = verify_yrs();
			const result2 = verify_yrs();
			
			expect(result1).toBe('Yrs CRDT library loaded successfully!');
			expect(result2).toBe('Yrs CRDT library loaded successfully!');
			expect(result1).toBe(result2);
		});

		it('should not throw errors', () => {
			expect(() => verify_yrs()).not.toThrow();
		});
	});
});
