#!/usr/bin/env node

/**
 * Install Plugin to Test Vaults
 * Copies the built plugin files to test vault plugin directories
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Plugin files to copy
const PLUGIN_FILES = [
	'main.js',
	'manifest.json',
	'styles.css',
	'obsidian_sync_wasm_bg.wasm'
];

// Test vaults
const TEST_VAULTS = [
	'test-vaults/vault-a',
	'test-vaults/vault-b'
];

const PLUGIN_ID = 'obsidian-sync-wasm';

console.log('📦 Installing plugin to test vaults...\n');

// Check if required files exist
const missingFiles = PLUGIN_FILES.filter(file => {
	const filePath = path.join(projectRoot, file);
	return !fs.existsSync(filePath);
});

if (missingFiles.length > 0) {
	console.error('❌ Missing required files:');
	missingFiles.forEach(file => console.error(`   - ${file}`));
	console.error('\n💡 Run "npm run build" first!');
	process.exit(1);
}

// Install to each vault
let installedCount = 0;

for (const vaultPath of TEST_VAULTS) {
	const fullVaultPath = path.join(projectRoot, vaultPath);

	// Check if vault exists
	if (!fs.existsSync(fullVaultPath)) {
		console.log(`⏭️  Skipping ${vaultPath} (doesn't exist yet)`);
		console.log(`   Run: bash scripts/setup-test-vaults.sh\n`);
		continue;
	}

	// Create plugin directory
	const pluginDir = path.join(fullVaultPath, '.obsidian', 'plugins', PLUGIN_ID);
	fs.mkdirSync(pluginDir, { recursive: true });

	// Copy files
	console.log(`📁 Installing to ${vaultPath}...`);
	for (const file of PLUGIN_FILES) {
		const src = path.join(projectRoot, file);
		const dest = path.join(pluginDir, file);

		try {
			fs.copyFileSync(src, dest);
			console.log(`   ✓ ${file}`);
		} catch (err) {
			console.error(`   ✗ ${file} - ${err.message}`);
		}
	}

	console.log('');
	installedCount++;
}

if (installedCount === 0) {
	console.log('⚠️  No vaults found!');
	console.log('\nTo set up test vaults:');
	console.log('1. Run: bash scripts/setup-test-vaults.sh');
	console.log('2. Open Obsidian and create vaults in test-vaults/vault-a and test-vaults/vault-b');
	console.log('3. Run this script again');
	process.exit(1);
}

console.log(`✅ Plugin installed to ${installedCount} vault(s)!\n`);
console.log('Next steps:');
console.log('1. Open/reload Obsidian');
console.log('2. In each vault: Settings → Community Plugins');
console.log('3. Turn off "Safe Mode"');
console.log('4. Enable "Obsidian Sync WASM"');
console.log('\n💡 Tip: Use Cmd+R (Mac) or Ctrl+R (Windows) to reload the plugin after rebuilding');
