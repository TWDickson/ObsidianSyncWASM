/**
 * Global test setup file
 * Runs before all tests to configure the testing environment
 */

// Set up any global test utilities or configurations here
globalThis.console = {
	...console,
	// Suppress console output during tests (comment out if needed for debugging)
	// log: vi.fn(),
	// warn: vi.fn(),
	// error: vi.fn(),
};

// Add any global test utilities
export {};
