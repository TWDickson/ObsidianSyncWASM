#!/usr/bin/env node

/**
 * Symlink Plugin to Test Vault
 * Creates symlinks for development with Hot Reload plugin
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const PLUGIN_ID = 'obsidian-sync-wasm';

// Get vault path from command line or use default
const vaultPath = process.argv[2];

if (!vaultPath) {
	console.error('❌ Please provide the vault path as an argument');
	console.error('\nUsage:');
	console.error('  npm run symlink:plugin -- /path/to/your/vault');
	console.error('  npm run symlink:plugin -- ~/Documents/ObsidianVaults/TestVault');
	console.error('\nOr set OBSIDIAN_TEST_VAULT environment variable');
	process.exit(1);
}

const expandedVaultPath = vaultPath.replace(/^~/, process.env.HOME);
const fullVaultPath = path.resolve(expandedVaultPath);

console.log('🔗 Setting up symlink for Hot Reload development...\n');

// Verify vault exists
if (!fs.existsSync(fullVaultPath)) {
	console.error(`❌ Vault not found: ${fullVaultPath}`);
	console.error('\nMake sure you created the vault in Obsidian first!');
	process.exit(1);
}

// Verify .obsidian directory exists
const obsidianDir = path.join(fullVaultPath, '.obsidian');
if (!fs.existsSync(obsidianDir)) {
	console.error(`❌ .obsidian directory not found in: ${fullVaultPath}`);
	console.error('\nThis doesn\'t appear to be a valid Obsidian vault.');
	process.exit(1);
}

// Create plugins directory if it doesn't exist
const pluginsDir = path.join(obsidianDir, 'plugins');
fs.mkdirSync(pluginsDir, { recursive: true });

// Target plugin directory in vault
const targetPluginDir = path.join(pluginsDir, PLUGIN_ID);

// Remove existing directory or symlink
if (fs.existsSync(targetPluginDir)) {
	const stats = fs.lstatSync(targetPluginDir);
	if (stats.isSymbolicLink()) {
		console.log('⚠️  Removing existing symlink...');
		fs.unlinkSync(targetPluginDir);
	} else if (stats.isDirectory()) {
		console.log('⚠️  Removing existing directory...');
		fs.rmSync(targetPluginDir, { recursive: true, force: true });
	}
}

// Create symlink to project root
try {
	fs.symlinkSync(projectRoot, targetPluginDir, 'dir');
	console.log('✅ Symlink created successfully!\n');
	console.log(`   Source: ${projectRoot}`);
	console.log(`   Target: ${targetPluginDir}\n`);
} catch (err) {
	console.error('❌ Failed to create symlink:', err.message);
	console.error('\nTip: You may need to run with elevated permissions on Windows');
	process.exit(1);
}

// Verify required files exist
const requiredFiles = [
	'manifest.json',
	'main.js'
];

console.log('📋 Checking required files...');
const missingFiles = requiredFiles.filter(file => {
	const exists = fs.existsSync(path.join(projectRoot, file));
	if (exists) {
		console.log(`   ✓ ${file}`);
	} else {
		console.log(`   ✗ ${file} (missing - run npm run build)`);
	}
	return !exists;
});

if (missingFiles.length > 0) {
	console.log('\n⚠️  Some files are missing. Run: npm run build');
}

// Save vault path for future use
const configPath = path.join(projectRoot, '.vault-path');
fs.writeFileSync(configPath, fullVaultPath);
console.log(`\n💾 Vault path saved to .vault-path`);

console.log('\n✅ Setup complete!\n');
console.log('Next steps:');
console.log('1. In Obsidian: Settings → Community Plugins → Turn off Safe Mode');
console.log('2. Enable "Hot Reload" plugin');
console.log('3. Enable "Obsidian Sync WASM" plugin');
console.log('4. Run: npm run dev');
console.log('\n💡 Hot Reload will automatically reload the plugin when files change!');
