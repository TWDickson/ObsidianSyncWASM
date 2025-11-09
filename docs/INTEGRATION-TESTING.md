# Integration Testing Guide

## Overview

This guide explains how to set up and run integration tests for the Obsidian Sync WASM plugin using real Obsidian vaults.

## Quick Start

**For Hot Reload development workflow, see: [test-vaults/vault-a/HOT-RELOAD-SETUP.md](../test-vaults/vault-a/HOT-RELOAD-SETUP.md)**

```bash
# 1. Set up test vault structure
npm run setup:test-vaults

# 2. Create vault in Obsidian (manual step - see below)

# 3. Create symlink for hot reload
npm run symlink:plugin -- test-vaults/vault-a

# 4. Start development
npm run dev
```

## Detailed Setup

### Step 1: Create Test Vault Structure

```bash
npm run setup:test-vaults
```

This creates:
```
test-vaults/
├── vault-a/          # Primary test vault
├── vault-b/          # Secondary test vault
├── fixtures/         # Sample test files
└── README.md         # Instructions
```

### Step 2: Initialize Vaults in Obsidian

1. **Open Obsidian**
2. **Create vault A:**
   - Click "Open folder as vault"
   - Navigate to your project directory
   - Select `test-vaults/vault-a`
   - Click "Open"

3. **Create vault B:**
   - Repeat the process for `test-vaults/vault-b`

4. **Disable Safe Mode (in each vault):**
   - Open Settings (`Cmd+,` or `Ctrl+,`)
   - Go to **Community Plugins**
   - Turn **OFF** the "Safe Mode" toggle
   - Close settings

### Step 3: Build and Install Plugin

```bash
# Build plugin and copy to test vaults
npm run build:install
```

Or run separately:
```bash
npm run build                    # Build plugin
npm run install:test-vaults     # Copy to vaults
```

### Step 4: Enable Plugin in Obsidian

In each vault:
1. Open Settings → Community Plugins
2. Click "Refresh" to detect new plugins
3. Find "Obsidian Sync WASM" in the list
4. Toggle it **ON**
5. Verify no errors in Developer Console (`Cmd+Option+I` / `Ctrl+Shift+I`)

## Development Workflow

### Making Changes

```bash
# 1. Edit code
vim main.ts

# 2. Rebuild
npm run build

# 3. Install to test vaults
npm run install:test-vaults

# 4. Reload plugin in Obsidian
# Press Cmd+R (Mac) or Ctrl+R (Windows) in Obsidian
# OR: Settings → Community Plugins → Toggle plugin off/on
```

### Hot Reload Workflow

For faster development:

```bash
# Terminal 1: Watch mode build
npm run dev

# Terminal 2: Watch for changes and auto-install
npx nodemon --watch main.js --exec "npm run install:test-vaults"
```

Then in Obsidian: `Cmd/Ctrl+R` to reload after each build.

## Testing Scenarios

### Basic Functionality Tests

#### 1. Plugin Loads Successfully
- [ ] No errors in console on startup
- [ ] Plugin appears in Settings → Community Plugins
- [ ] Commands appear in Command Palette (`Cmd/Ctrl+P`)

#### 2. WASM Initialization
- [ ] Check console for "WASM module initialized successfully"
- [ ] Run command "Test WASM: Greet" - should show notice
- [ ] Run command "Test WASM: Compute Hash" - should show hash

#### 3. Settings Persistence
- [ ] Open plugin settings
- [ ] Change test setting value
- [ ] Close Obsidian
- [ ] Reopen vault
- [ ] Verify setting persisted

### File Operations (When Implemented)

#### Read Files
```typescript
// In your plugin code (example)
const files = this.app.vault.getMarkdownFiles();
console.log('Files:', files.map(f => f.path));
```

#### Write Files
```typescript
const file = await this.app.vault.create(
  'test-note.md',
  '# Test Note\n\nCreated by plugin'
);
```

#### Detect Changes
```typescript
this.registerEvent(
  this.app.vault.on('modify', (file) => {
    console.log('File modified:', file.path);
  })
);
```

### Multi-Vault Sync Tests (Future)

#### Test Scenario: Basic Sync
1. Create file in vault-a
2. Trigger sync
3. Verify file appears in vault-b
4. Verify content matches
5. Verify metadata matches

#### Test Scenario: Conflict Resolution
1. Create `conflict.md` in both vaults with different content
2. Trigger sync
3. Verify conflict detected
4. Verify conflict resolution strategy applied
5. Check both vaults for expected result

## Debugging

### Enable Developer Console

**Mac:** `Cmd+Option+I`
**Windows/Linux:** `Ctrl+Shift+I`

### Common Issues

#### Plugin Doesn't Appear
- Ensure Safe Mode is **OFF**
- Check `.obsidian/plugins/obsidian-sync-wasm/` exists
- Verify `manifest.json` is present
- Restart Obsidian

#### WASM Not Loading
- Check browser console for errors
- Verify `obsidian_sync_wasm_bg.wasm` is in plugin directory
- Check file permissions
- Try rebuilding: `npm run build`

#### Changes Not Reflected
- Ensure you ran `npm run install:test-vaults`
- Reload plugin: `Cmd/Ctrl+R`
- Or toggle plugin off/on in settings
- Clear console and check for errors

#### Permission Errors (macOS)
```bash
# If scripts aren't executable
chmod +x scripts/*.sh scripts/*.mjs
```

## Advanced: Programmatic Testing

### Using Node.js Scripts

Create test scripts that manipulate vaults directly:

```javascript
// scripts/test-file-creation.mjs
import fs from 'fs';
import path from 'path';

const vaultPath = 'test-vaults/vault-a';
const testFile = path.join(vaultPath, 'automated-test.md');

// Create test file
fs.writeFileSync(testFile, '# Automated Test\n\nCreated by script');

console.log('✓ Created test file');
console.log('→ Open Obsidian to verify it appears in vault');
```

### Vault State Verification

```javascript
// scripts/verify-sync.mjs
import fs from 'fs';
import path from 'path';

function getVaultFiles(vaultPath) {
  const files = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }
  walk(vaultPath);
  return files;
}

const vaultA = getVaultFiles('test-vaults/vault-a');
const vaultB = getVaultFiles('test-vaults/vault-b');

console.log('Vault A files:', vaultA.length);
console.log('Vault B files:', vaultB.length);
```

## CI/CD Integration (Future)

For automated testing in CI:

1. **Option A: Headless Obsidian**
   - Run Obsidian in headless mode (if available)
   - Execute tests programmatically

2. **Option B: Playwright/Puppeteer**
   - Launch Obsidian as Electron app
   - Automate UI interactions
   - Verify plugin behavior

3. **Option C: API-Only Tests**
   - Import Obsidian modules directly
   - Test plugin logic without full app
   - Faster but less comprehensive

## Best Practices

### 1. Keep Test Vaults Clean
- Don't use for real notes
- Reset frequently between test sessions
- Use fixtures for reproducible tests

### 2. Version Control
- Test vaults are `.gitignore`d
- Only fixtures are committed
- Document test scenarios in code

### 3. Automation
- Script common operations
- Use watch mode for rapid iteration
- Create verification scripts

### 4. Documentation
- Document test scenarios
- Record expected behavior
- Note any quirks or limitations

## Resources

- [Obsidian Plugin Developer Docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [Obsidian API Reference](https://github.com/obsidianmd/obsidian-api)
- [Project Testing Guide](../test/README.md)
- [Integration Test Plan](../INTEGRATION-TESTING-PLAN.md)

## Next Steps

1. ✅ Set up test vaults
2. ✅ Install plugin manually
3. 🚧 Implement sync functionality
4. 🚧 Create test scenarios
5. 📋 Automate with Playwright (future)
6. 📋 CI/CD integration (future)
