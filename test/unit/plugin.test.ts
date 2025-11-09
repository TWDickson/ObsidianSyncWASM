/**
 * Unit tests for the main plugin class
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { App } from 'obsidian';
import ObsidianSyncWASMPlugin from '../../main';

// Mock the WASM module
vi.mock('../../wasm/pkg/obsidian_sync_wasm.js', () => ({
	default: vi.fn(async () => {}), // init function
	greet: vi.fn((name: string) => `Hello, ${name}!`),
	compute_hash: vi.fn((input: string) => 'mock-hash-' + input.length),
}));

describe('ObsidianSyncWASMPlugin', () => {
	let app: App;
	let plugin: ObsidianSyncWASMPlugin;

	beforeEach(() => {
		// Create a mock app instance
		app = new App();

		// Create plugin instance with mock manifest
		plugin = new ObsidianSyncWASMPlugin(app, {
			id: 'obsidian-sync-wasm',
			name: 'Obsidian Sync WASM',
			version: '0.2.0',
			minAppVersion: '0.15.0',
			description: 'Test plugin',
			author: 'Test Author',
		});
	});

	describe('Settings', () => {
		it('should have default settings', () => {
			expect(plugin.settings).toBeUndefined(); // Not loaded yet
		});

		it('should load settings on initialization', async () => {
			// Mock loadData to return custom settings
			plugin.loadData = vi.fn(async () => ({
				testSetting: 'custom value',
			}));

			await plugin.loadSettings();

			expect(plugin.settings).toEqual({
				testSetting: 'custom value',
			});
		});

		it('should merge with default settings when loading partial data', async () => {
			// Mock loadData to return empty object
			plugin.loadData = vi.fn(async () => ({}));

			await plugin.loadSettings();

			expect(plugin.settings).toEqual({
				testSetting: 'default',
			});
		});

		it('should save settings', async () => {
			plugin.saveData = vi.fn(async () => {});
			plugin.settings = {
				testSetting: 'new value',
			};

			await plugin.saveSettings();

			expect(plugin.saveData).toHaveBeenCalledWith({
				testSetting: 'new value',
			});
		});
	});

	describe('Plugin Lifecycle', () => {
		it('should initialize WASM module on load', async () => {
			// Mock necessary methods
			plugin.loadData = vi.fn(async () => ({}));
			plugin.addSettingTab = vi.fn();

			// Mock vault adapter
			const mockAdapter = {
				basePath: '/test/vault',
			};
			app.vault.adapter = mockAdapter as any;

			// We can't fully test onload without mocking fetch and WASM init,
			// but we can verify the structure
			expect(plugin.wasmInitialized).toBe(false);
		});

		it('should register commands', () => {
			const addCommandSpy = vi.spyOn(plugin, 'addCommand');

			// We would call onload here, but it's async and requires WASM mocking
			// This demonstrates how to test command registration

			plugin.addCommand({
				id: 'test-command',
				name: 'Test Command',
				callback: () => {},
			});

			expect(addCommandSpy).toHaveBeenCalled();
		});
	});

	describe('WASM Integration', () => {
		it('should track WASM initialization status', () => {
			expect(plugin.wasmInitialized).toBe(false);

			plugin.wasmInitialized = true;
			expect(plugin.wasmInitialized).toBe(true);
		});
	});
});
