#!/usr/bin/env node

/**
 * Setup Test Vaults for Integration Testing
 * Cross-platform Node.js implementation (replaces bash script)
 * Works on Windows, Mac, and Linux
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🧪 Setting up test vaults for integration testing...\n');

// Create base directory structure
const testVaultsDir = path.join(projectRoot, 'test-vaults');
const vaultA = path.join(testVaultsDir, 'vault-a');
const vaultB = path.join(testVaultsDir, 'vault-b');
const fixtures = path.join(testVaultsDir, 'fixtures');

fs.mkdirSync(vaultA, { recursive: true });
fs.mkdirSync(vaultB, { recursive: true });
fs.mkdirSync(fixtures, { recursive: true });

console.log('✓ Created test vault directories');

// Get current timestamp for fixture files
const currentDate = new Date().toISOString().split('T')[0];

// Create sample fixture files
const sampleNote = `# Sample Test Note

This is a sample note for testing sync functionality.

## Features to Test
- File synchronization
- Conflict resolution
- Metadata handling
- Hash computation

Created: ${currentDate}
`;

const noteWithLinks = `# Note with Internal Links

This note contains [[sample-note]] as an internal link.

It also references [[another-note]] which may not exist yet.
`;

const conflictScenario = `# Conflict Test File

This file is designed to create conflicts during sync testing.

Version: ORIGINAL
Last modified: ${currentDate}
`;

fs.writeFileSync(path.join(fixtures, 'sample-note.md'), sampleNote);
fs.writeFileSync(path.join(fixtures, 'note-with-links.md'), noteWithLinks);
fs.writeFileSync(path.join(fixtures, 'conflict-scenario.md'), conflictScenario);

console.log('✓ Created fixture files');

// Create README for test vaults
const readme = `# Test Vaults

This directory contains Obsidian vaults used for integration testing.

## Structure

- \`vault-a/\` - Primary test vault
- \`vault-b/\` - Secondary test vault (for sync testing)
- \`fixtures/\` - Sample test files and scenarios

## Setup Instructions

1. **Open vaults in Obsidian**
   - Open Obsidian
   - File → Open Folder as Vault
   - Select \`test-vaults/vault-a\`
   - Repeat for \`vault-b\`

2. **Disable Safe Mode**
   - Settings → Community Plugins
   - Turn off "Safe Mode"
   - This allows development plugins to load

3. **Install plugin**
   - Run: \`npm run install:test-vaults\`
   - This copies the built plugin to both vaults

4. **Enable plugin**
   - Settings → Community Plugins
   - Find "Obsidian Sync WASM"
   - Enable it

## Important Notes

⚠️ **Do not use these vaults for real notes!**
They are for testing only and may be wiped/reset frequently.

⚠️ **Git ignore**
These vaults are excluded from git (see \`.gitignore\`)

## Testing Workflow

1. Make changes to plugin code
2. Run \`npm run build\`
3. Run \`npm run install:test-vaults\`
4. Reload Obsidian plugin (Cmd+R on Mac, Ctrl+R on Windows)
5. Test functionality
6. Verify results
`;

fs.writeFileSync(path.join(testVaultsDir, 'README.md'), readme);

console.log('✓ Created test vaults README');

console.log('');
console.log('✅ Test vault structure created!');
console.log('');
console.log('Next steps:');
console.log('1. Open Obsidian and create vaults at:');
console.log('   - test-vaults/vault-a');
console.log('   - test-vaults/vault-b');
console.log('2. Disable Safe Mode in each vault');
console.log('3. Run: npm run install:test-vaults');
console.log('4. Enable the plugin in each vault');
console.log('');
console.log('See test-vaults/README.md for detailed instructions');
