import { App, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import init, { greet, compute_hash } from './wasm/pkg/obsidian_sync_wasm.js';

interface ObsidianSyncWASMSettings {
	testSetting: string;
	wasmTestInput: string;
	wasmTestResult: string;
}

const DEFAULT_SETTINGS: ObsidianSyncWASMSettings = {
	testSetting: 'default',
	wasmTestInput: 'Test WASM here!',
	wasmTestResult: ''
}

export default class ObsidianSyncWASMPlugin extends Plugin {
	settings: ObsidianSyncWASMSettings;
	wasmInitialized: boolean = false;

	async onload() {
		await this.loadSettings();

		// Initialize WASM module
		try {
			// Use manifest.dir to get the vault-relative path to the plugin directory
			// This is provided by Obsidian and works correctly with symlinks
			const pluginDir = this.manifest.dir;
			if (!pluginDir) {
				throw new Error('Plugin directory not found in manifest');
			}

			const wasmPath = `${pluginDir}/obsidian_sync_wasm_bg.wasm`;

			// Read WASM file as ArrayBuffer using the vault adapter
			// @ts-ignore - readBinary exists on FileSystemAdapter
			const wasmBytes = await this.app.vault.adapter.readBinary(wasmPath);

			// Initialize WASM with the binary data (using new API format)
			await init({ module_or_path: wasmBytes });
			this.wasmInitialized = true;
			console.log('WASM module initialized successfully from:', wasmPath);
		} catch (error) {
			console.error('Failed to initialize WASM module:', error);
			new Notice('Failed to initialize Obsidian Sync WASM plugin');
			return;
		}

		// Test command to verify WASM is working
		this.addCommand({
			id: 'test-wasm-greet',
			name: 'Test WASM: Greet',
			callback: () => {
				if (!this.wasmInitialized) {
					new Notice('WASM module not initialized');
					return;
				}
				const message = greet('Obsidian User');
				new Notice(message);
			}
		});

		// Test command to demonstrate WASM performance
		this.addCommand({
			id: 'test-wasm-hash',
			name: 'Test WASM: Compute Hash',
			callback: () => {
				if (!this.wasmInitialized) {
					new Notice('WASM module not initialized');
					return;
				}
				const testString = 'This is a test string for hashing';
				const hash = compute_hash(testString);
				new Notice(`Hash: ${hash}`);
				console.log(`Hash of "${testString}": ${hash}`);
			}
		});

		// Add settings tab
		this.addSettingTab(new ObsidianSyncWASMSettingTab(this.app, this));
	}

	onunload() {
		console.log('Unloading Obsidian Sync WASM plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class ObsidianSyncWASMSettingTab extends PluginSettingTab {
	plugin: ObsidianSyncWASMPlugin;
	private resultCodeEl: HTMLElement | null = null;

	constructor(app: App, plugin: ObsidianSyncWASMPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Obsidian Sync WASM Settings' });

		new Setting(containerEl)
			.setName('Test Setting')
			.setDesc('A test setting for the plugin')
			.addText(text => text
				.setPlaceholder('Enter a value')
				.setValue(this.plugin.settings.testSetting)
				.onChange(async (value) => {
					this.plugin.settings.testSetting = value;
					await this.plugin.saveSettings();
				}));

		// WASM Testing Section
		containerEl.createEl('h3', { text: 'WASM Integration Test' });

		// Input field for WASM test
		new Setting(containerEl)
			.setName('Input Text')
			.setDesc('Enter text to compute a hash using Rust WASM')
			.addText(text => text
				.setPlaceholder('Enter text to hash')
				.setValue(this.plugin.settings.wasmTestInput)
				.onChange(async (value) => {
					this.plugin.settings.wasmTestInput = value;
					await this.plugin.saveSettings();
				}));

		// Button to trigger WASM computation
		new Setting(containerEl)
			.setName('Compute Hash')
			.setDesc('Click to compute hash using Rust WASM')
			.addButton(button => button
				.setButtonText('Compute')
				.setCta()
				.onClick(async () => {
					if (!this.plugin.wasmInitialized) {
						new Notice('WASM module not initialized');
						return;
					}
					const input = this.plugin.settings.wasmTestInput;
					const hash = compute_hash(input);
					this.plugin.settings.wasmTestResult = typeof hash === 'string' ? hash : String(hash);
					await this.plugin.saveSettings();

					// Refresh the display to show the new result
					this.display();

					new Notice(`Hash computed: ${hash}`);
				}));

		// Display the result
		const resultContainer = containerEl.createDiv('wasm-result-container');
		resultContainer.createEl('strong', { text: 'Latest Hash Result: ' });
		this.resultCodeEl = resultContainer.createEl('code', {
			text: this.plugin.settings.wasmTestResult,
			cls: 'wasm-hash-result'
		});
	}
}
