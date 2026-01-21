#!/usr/bin/env node

/**
 * Copy Plugin to Test Vault
 * Fallback option for Windows users who can't use junctions/symlinks
 * Copies plugin files directly to vault directory
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const PLUGIN_ID = 'obsidian-sync-wasm';

// Get vault path from command line, environment variable, or saved path
let vaultPath = process.argv[2] || process.env.OBSIDIAN_TEST_VAULT;

// If no vault path provided, try to read from saved .vault-path
if (!vaultPath) {
	const vaultPathFile = path.join(projectRoot, '.vault-path');
	if (fs.existsSync(vaultPathFile)) {
		vaultPath = fs.readFileSync(vaultPathFile, 'utf-8').trim();
		console.log(`📂 Using saved vault path from .vault-path`);
	}
}

if (!vaultPath) {
	console.error('❌ Please provide the vault path as an argument');
	console.error('\nUsage:');
	console.error('  npm run copy:plugin -- /path/to/your/vault');
	console.error('  npm run copy:plugin -- C:\\Users\\YourName\\Documents\\ObsidianVault');
	console.error('\nOr set OBSIDIAN_TEST_VAULT environment variable');
	console.error('Or run symlink:plugin first to save the vault path');
	process.exit(1);
}

const expandedVaultPath = vaultPath.replace(/^~/, process.env.HOME || process.env.USERPROFILE);
const fullVaultPath = path.resolve(expandedVaultPath);

console.log('📋 Copying plugin files to vault...\n');

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

// Create plugin directory if it doesn't exist
if (!fs.existsSync(targetPluginDir)) {
	fs.mkdirSync(targetPluginDir, { recursive: true });
}

// Files to copy
const filesToCopy = [
	'manifest.json',
	'main.js',
	'styles.css',
	'obsidian_sync_wasm_bg.wasm',
	'obsidian_sync_wasm.js'
];

console.log('📋 Copying files...');
let copiedCount = 0;

for (const file of filesToCopy) {
	const srcPath = path.join(projectRoot, file);
	const destPath = path.join(targetPluginDir, file);

	if (fs.existsSync(srcPath)) {
		try {
			fs.copyFileSync(srcPath, destPath);
			console.log(`   ✓ ${file}`);
			copiedCount++;
		} catch (err) {
			console.error(`   ✗ ${file} (copy failed: ${err.message})`);
		}
	} else {
		console.log(`   ⚠ ${file} (not found - may need to build first)`);
	}
}

console.log('');

if (copiedCount === 0) {
	console.error('❌ No files were copied!');
	console.error('\nYou need to build the plugin first:');
	console.error('  npm run build');
	process.exit(1);
}

console.log(`✅ Copied ${copiedCount} file(s) successfully!\n`);
console.log(`   Source: ${projectRoot}`);
console.log(`   Target: ${targetPluginDir}\n`);

// Save vault path for future use
const configPath = path.join(projectRoot, '.vault-path');
fs.writeFileSync(configPath, fullVaultPath);
console.log(`💾 Vault path saved to .vault-path`);

console.log('\n✅ Copy complete!\n');
console.log('Next steps:');
console.log('1. In Obsidian: Settings → Community Plugins → Turn off Safe Mode');
console.log('2. Enable "Obsidian Sync WASM" plugin');
console.log('3. Reload plugin (Ctrl/Cmd+R) after rebuilding');
console.log('\n💡 For live reload, use: npm run dev:copy (rebuilds and copies on changes)');
