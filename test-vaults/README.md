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

