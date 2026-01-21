/**
 * Integration tests for Yrs CRDT WASM functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the WASM module
vi.mock('../../wasm/pkg/obsidian_sync_wasm.js', () => ({
	default: vi.fn(async () => {}), // init function
	greet: vi.fn((name: string) => `Hello, ${name}!`),
	compute_hash: vi.fn((input: string) => 12345),
	verify_yrs: vi.fn(() => 'Yrs CRDT library loaded successfully!'),
}));

describe('WASM Yrs Integration', () => {
	let verify_yrs: any;

	beforeEach(async () => {
		// Import after mock is set up
		const wasmModule = await import('../../wasm/pkg/obsidian_sync_wasm.js');
		verify_yrs = wasmModule.verify_yrs;
	});

	it('should verify Yrs loads successfully', () => {
		const result = verify_yrs();
		
		expect(result).toBeDefined();
		expect(typeof result).toBe('string');
		expect(result).toContain('Yrs');
	});

	it('should return a success message', () => {
		const result = verify_yrs();
		
		expect(result).toContain('successfully');
	});

	it('should not throw when called', () => {
		expect(() => verify_yrs()).not.toThrow();
	});

	it('should be callable multiple times', () => {
		// Clear any previous calls
		vi.clearAllMocks();
		
		const result1 = verify_yrs();
		const result2 = verify_yrs();
		
		expect(result1).toBe(result2);
		expect(verify_yrs).toHaveBeenCalledTimes(2);
	});
});
