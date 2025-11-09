#!/bin/bash

# Setup Test Vaults for Integration Testing
# This script creates the directory structure for test vaults

set -e

echo "🧪 Setting up test vaults for integration testing..."

# Create base directory structure
mkdir -p test-vaults/vault-a
mkdir -p test-vaults/vault-b
mkdir -p test-vaults/fixtures

echo "✓ Created test vault directories"

# Create sample fixture files
cat > test-vaults/fixtures/sample-note.md << 'EOF'
# Sample Test Note

This is a sample note for testing sync functionality.

## Features to Test
- File synchronization
- Conflict resolution
- Metadata handling
- Hash computation

Created: {{date}}
EOF

cat > test-vaults/fixtures/note-with-links.md << 'EOF'
# Note with Internal Links

This note contains [[sample-note]] as an internal link.

It also references [[another-note]] which may not exist yet.
EOF

cat > test-vaults/fixtures/conflict-scenario.md << 'EOF'
# Conflict Test File

This file is designed to create conflicts during sync testing.

Version: ORIGINAL
Last modified: {{date}}
EOF

echo "✓ Created fixture files"

# Create README for test vaults
cat > test-vaults/README.md << 'EOF'
# Test Vaults

This directory contains Obsidian vaults used for integration testing.

## Structure

- `vault-a/` - Primary test vault
- `vault-b/` - Secondary test vault (for sync testing)
- `fixtures/` - Sample test files and scenarios

## Setup Instructions

1. **Open vaults in Obsidian**
   - Open Obsidian
   - File → Open Folder as Vault
   - Select `test-vaults/vault-a`
   - Repeat for `vault-b`

2. **Disable Safe Mode**
   - Settings → Community Plugins
   - Turn off "Safe Mode"
   - This allows development plugins to load

3. **Install plugin**
   - Run: `npm run install:test-vaults`
   - This copies the built plugin to both vaults

4. **Enable plugin**
   - Settings → Community Plugins
   - Find "Obsidian Sync WASM"
   - Enable it

## Important Notes

⚠️ **Do not use these vaults for real notes!**
They are for testing only and may be wiped/reset frequently.

⚠️ **Git ignore**
These vaults are excluded from git (see `.gitignore`)

## Testing Workflow

1. Make changes to plugin code
2. Run `npm run build`
3. Run `npm run install:test-vaults`
4. Reload Obsidian plugin (Cmd+R on Mac, Ctrl+R on Windows)
5. Test functionality
6. Verify results

EOF

echo "✓ Created test vaults README"

# Create .gitkeep files to preserve structure
touch test-vaults/vault-a/.gitkeep
touch test-vaults/vault-b/.gitkeep

echo ""
echo "✅ Test vault structure created!"
echo ""
echo "Next steps:"
echo "1. Open Obsidian and create vaults at:"
echo "   - test-vaults/vault-a"
echo "   - test-vaults/vault-b"
echo "2. Disable Safe Mode in each vault"
echo "3. Run: npm run install:test-vaults"
echo "4. Enable the plugin in each vault"
echo ""
echo "See test-vaults/README.md for detailed instructions"
