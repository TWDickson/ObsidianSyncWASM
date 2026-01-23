#!/usr/bin/env node

/**
 * Setup Test Vaults for Integration Testing
 * Cross-platform Node.js implementation (replaces bash script)
 * Works on Windows, Mac, and Linux
 * 
 * IMPORTANT: Does not overwrite existing directories or files!
 * vault-a already exists in git with .obsidian configuration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🧪 Setting up test vaults for integration testing...\n');

// Define directory structure
const testVaultsDir = path.join(projectRoot, 'test-vaults');
const vaultA = path.join(testVaultsDir, 'vault-a');
const vaultB = path.join(testVaultsDir, 'vault-b');
const fixtures = path.join(testVaultsDir, 'fixtures');

// Create directories only if they don't exist
[vaultA, vaultB, fixtures].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✓ Created directory: ${path.basename(dir)}`);
    } else {
        console.log(`→ Directory already exists: ${path.basename(dir)}`);
    }
});

// Create .gitkeep for vault-b to preserve empty directory in git
// vault-a already has .obsidian config files tracked in git
const vaultBGitkeep = path.join(vaultB, '.gitkeep');
if (!fs.existsSync(vaultBGitkeep)) {
    fs.writeFileSync(vaultBGitkeep, '', 'utf8');
    console.log('✓ Created .gitkeep in vault-b');
}

// Get current timestamp for fixture files
const currentDate = new Date().toISOString().split('T')[0];

// Define fixture file templates
const fixtureTemplates = {
    'sample-note.md': `# Sample Test Note\n\nThis is a sample note for testing sync functionality.\n\n## Features to Test\n- File synchronization\n- Conflict resolution\n- Metadata handling\n- Hash computation\n\nCreated: ${currentDate}\n`,
    'note-with-links.md': `# Note with Internal Links\n\nThis note contains [[sample-note]] as an internal link.\n\nIt also references [[another-note]] which may not exist yet.\n`,
    'conflict-scenario.md': `# Conflict Test File\n\nThis file is designed to create conflicts during sync testing.\n\nVersion: ORIGINAL\nLast modified: ${currentDate}\n`
};

// Create fixture files only if they don't exist
console.log('\n📄 Setting up fixture files...');
Object.entries(fixtureTemplates).forEach(([filename, content]) => {
    const filePath = path.join(fixtures, filename);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Created: ${filename}`);
    } else {
        console.log(`→ Already exists: ${filename}`);
    }
});

// Create or update README
const readmePath = path.join(testVaultsDir, 'README.md');
const readme = `# Test Vaults\n\nThis directory contains Obsidian vaults used for integration testing.\n\n## Structure\n\n- \\`vault-a/\\` - Primary test vault (tracked in git with .obsidian config)\n- \\`vault-b/\\` - Secondary test vault (for sync testing)\n- \\`fixtures/\\` - Sample test files and scenarios\n\n## Setup Instructions\n\n1. **Open vaults in Obsidian**\n   - Open Obsidian\n   - File → Open Folder as Vault\n   - Select \\`test-vaults/vault-a\\`\n   - Repeat for \\`vault-b\\`\n\n2. **Disable Safe Mode**\n   - Settings → Community Plugins\n   - Turn off "Safe Mode"\n   - This allows development plugins to load\n\n3. **Install plugin**\n   - Run: \\`npm run install:test-vaults\\`\n   - This copies the built plugin to both vaults\n\n4. **Enable plugin**\n   - Settings → Community Plugins\n   - Find "Obsidian Sync WASM"\n   - Enable it\n\n## Important Notes\n\n⚠️ **Do not use these vaults for real notes!**\nThey are for testing only and may be wiped/reset frequently.\n\n⚠️ **Git tracking**\n- \\`vault-a/\\` is tracked in git (includes .obsidian configuration)\n- \\`vault-b/\\` only has .gitkeep (actual vault not tracked)\n- \\`fixtures/\\` contains template files (tracked in git)\n\n## Testing Workflow\n\n1. Make changes to plugin code\n2. Run \\`npm run build\\`\n3. Run \\`npm run install:test-vaults\\`\n4. Reload Obsidian plugin (Cmd+R on Mac, Ctrl+R on Windows)\n5. Test functionality\n6. Verify results\n`;\n\nfs.writeFileSync(readmePath, readme, 'utf8');
console.log('\n✓ Created/updated test vaults README');

console.log('\n✅ Test vault structure ready!');
console.log('\nNext steps:');
console.log('1. Open Obsidian and create vaults at:');
console.log('   - test-vaults/vault-a (already configured in git)');
console.log('   - test-vaults/vault-b');
console.log('2. Disable Safe Mode in each vault');
console.log('3. Run: npm run install:test-vaults');
console.log('4. Enable the plugin in each vault');
console.log('\nSee test-vaults/README.md for detailed instructions\n');
