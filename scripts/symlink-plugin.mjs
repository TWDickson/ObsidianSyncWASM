#!/usr/bin/env node

/**
 * Symlink Plugin to Test Vault
 * Creates symlinks for development with Hot Reload plugin
 * Now with Windows junction support (no admin required!)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const PLUGIN_ID = 'obsidian-sync-wasm';
const IS_WINDOWS = process.platform === 'win32';

// Get vault path from command line or environment variable
const vaultPath = process.argv[2] || process.env.OBSIDIAN_TEST_VAULT;

if (!vaultPath) {
	console.error('❌ Please provide the vault path as an argument');
	console.error('\nUsage:');
	console.error('  npm run symlink:plugin -- /path/to/your/vault');
	console.error('  npm run symlink:plugin -- ~/Documents/ObsidianVaults/TestVault');
	console.error('\nOr set OBSIDIAN_TEST_VAULT environment variable');
	process.exit(1);
}

const expandedVaultPath = vaultPath.replace(/^~/, process.env.HOME || process.env.USERPROFILE);
const fullVaultPath = path.resolve(expandedVaultPath);

const linkType = IS_WINDOWS ? 'junction' : 'symlink';
console.log(`🔗 Setting up ${linkType} for Hot Reload development...`);
console.log(`   Platform: ${process.platform}\n`);

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
		console.log('⚠️  Removing existing symlink/junction...');
		if (IS_WINDOWS) {
			// On Windows, use rmdir for junctions
			try {
				execSync(`rmdir "${targetPluginDir}"`, { stdio: 'ignore' });
			} catch (err) {
				fs.unlinkSync(targetPluginDir);
			}
		} else {
			fs.unlinkSync(targetPluginDir);
		}
	} else if (stats.isDirectory()) {
		console.log('⚠️  Removing existing directory...');
		fs.rmSync(targetPluginDir, { recursive: true, force: true });
	}
}

// Create symlink or junction
try {
	if (IS_WINDOWS) {
		// Try junction first (works without admin)
		console.log('   Attempting Windows junction (no admin needed)...');
		try {
			execSync(`mklink /J "${targetPluginDir}" "${projectRoot}"`, { stdio: 'inherit' });
			console.log('✅ Junction created successfully!\n');
		} catch (junctionErr) {
			// Fallback to symlink (requires admin)
			console.log('   Junction failed, trying symlink (requires admin)...');
			fs.symlinkSync(projectRoot, targetPluginDir, 'junction');
			console.log('✅ Symlink created successfully!\n');
		}
	} else {
		// Mac/Linux use regular symlink
		fs.symlinkSync(projectRoot, targetPluginDir, 'dir');
		console.log('✅ Symlink created successfully!\n');
	}
	console.log(`   Source: ${projectRoot}`);
	console.log(`   Target: ${targetPluginDir}\n`);
} catch (err) {
	console.error('❌ Failed to create link:', err.message);
	if (IS_WINDOWS) {
		console.error('\nWindows Troubleshooting:');
		console.error('1. Try running PowerShell as Administrator');
		console.error('2. Or use copy mode: npm run copy:plugin');
		console.error('3. Junction should work without admin - check path permissions');
	} else {
		console.error('\nTip: You may need elevated permissions');
	}
	process.exit(1);
}

// Verify required files exist
const requiredFiles = [
	'manifest.json',
	'main.js',
	'obsidian_sync_wasm_bg.wasm'
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
