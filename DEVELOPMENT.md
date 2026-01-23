# Development Guide

This guide explains how to build, run, and develop the Obsidian Sync WASM plugin.

## Prerequisites

- **Node.js**: v18 or later (LTS recommended)
- **Rust**: Latest stable version with `wasm32-unknown-unknown` target
- **wasm-pack**: For building WebAssembly modules
- **Git**: For version control

### Installing Prerequisites

**Node.js:**
- Download from [nodejs.org](https://nodejs.org/) or use a version manager like nvm/fnm

**Rust:**
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add WASM target
rustup target add wasm32-unknown-unknown
```

**wasm-pack:**
```bash
cargo install wasm-pack
```

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/TWDickson/ObsidianSyncWASM.git
cd ObsidianSyncWASM

# Install Node dependencies
npm install
```

### 2. Build the Plugin

```bash
# Full production build (includes WASM compilation + TypeScript)
npm run build
```

This will:
1. Compile Rust code to WebAssembly (`obsidian_sync_wasm_bg.wasm`)
2. Generate JavaScript bindings
3. Compile TypeScript to JavaScript (`main.js`)
4. Copy WASM file to the root directory

**Build artifacts:**
- `main.js` - Plugin entry point
- `obsidian_sync_wasm_bg.wasm` - WebAssembly module (~95K)
- `manifest.json` - Plugin metadata
- `styles.css` - Plugin styles

### 3. Run Tests

```bash
# Run all tests
npm run test:all

# Run TypeScript tests only
npm test

# Run Rust tests only
npm run test:rust

# Run tests in watch mode
npm run test:watch
```

## Development Workflow

### Option 1: Symlink Workflow (Recommended - Hot Reload)

This method allows automatic plugin reloading when files change.

**Mac/Linux:**
```bash
# Build the plugin first
npm run build

# Create symlink to your vault
npm run symlink:plugin -- ~/Documents/MyVault

# Start development mode (rebuilds on changes)
npm run dev
```

**Windows:**
```bash
# Build the plugin first
npm run build

# Create junction (no admin required!) or symlink
npm run symlink:plugin -- C:\Users\YourName\Documents\MyVault

# Start development mode (rebuilds on changes)
npm run dev
```

**Setup in Obsidian:**
1. Open Obsidian Settings
2. Go to Community Plugins
3. Turn off "Safe Mode"
4. Install and enable the "Hot Reload" plugin
5. Enable "Obsidian Sync WASM" plugin

Now changes will automatically reload in Obsidian!

### Option 2: Copy Workflow (Windows Fallback)

If symlinks/junctions don't work, you can use copy mode:

```bash
# Copy plugin files to vault
npm run copy:plugin -- C:\Users\YourName\Documents\MyVault

# Auto-copy on changes (alternative to dev mode)
npm run dev:copy
```

After each copy, press `Ctrl+R` in Obsidian to reload the plugin.

### Option 3: Manual Installation

```bash
# Build the plugin
npm run build

# Manually copy these files to your vault:
# .obsidian/plugins/obsidian-sync-wasm/
cp main.js manifest.json styles.css obsidian_sync_wasm_bg.wasm /path/to/vault/.obsidian/plugins/obsidian-sync-wasm/
```

## Project Structure

```
ObsidianSyncWASM/
├── main.ts                 # Plugin entry point
├── manifest.json           # Plugin metadata
├── styles.css             # Plugin styles
├── wasm/                  # Rust/WASM module
│   ├── Cargo.toml         # Rust dependencies
│   └── src/
│       └── lib.rs         # Rust source code
├── test/                  # TypeScript tests
│   ├── unit/              # Unit tests
│   └── setup.ts           # Test configuration
├── scripts/               # Development scripts
│   ├── symlink-plugin.mjs
│   ├── copy-plugin.mjs
│   └── setup-test-vaults.mjs
└── test-vaults/           # Integration testing vaults

```

## Build Commands

```bash
# WASM only (faster for Rust changes)
npm run wasm

# TypeScript only (type check without build)
tsc --noEmit

# Development mode (watch for changes)
npm run dev              # Full dev mode (WASM + TypeScript)
npm run dev:wasm         # Watch WASM changes only
npm run dev:ts           # Watch TypeScript changes only

# Production build
npm run build            # Full build (WASM + TypeScript)
```

## Testing Commands

```bash
# TypeScript tests
npm test                 # Run once
npm run test:watch       # Watch mode
npm run test:ui          # Interactive UI
npm run test:coverage    # With coverage report

# Rust tests
npm run test:rust        # Run Rust unit tests

# All tests
npm run test:all         # Run both TypeScript and Rust tests
```

## Debugging

### TypeScript/Plugin Debugging

1. Open Obsidian Developer Tools: `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
2. Check the Console tab for errors and logs
3. The plugin logs initialization messages like "Yrs verification: Yrs CRDT library loaded successfully!"

### WASM Debugging

```bash
# Run Rust tests with output
cd wasm && cargo test -- --nocapture

# Check WASM module size
ls -lh obsidian_sync_wasm_bg.wasm

# Verify WASM functions are exported
wasm-objdump -x obsidian_sync_wasm_bg.wasm | grep export
```

## Common Issues

### "WASM module not initialized"

**Cause:** WASM file not found or failed to load

**Solution:**
```bash
# Rebuild WASM
npm run wasm

# Check WASM file exists
ls -l obsidian_sync_wasm_bg.wasm

# Verify symlink/copy worked
ls -l /path/to/vault/.obsidian/plugins/obsidian-sync-wasm/
```

### "wasm-pack: command not found"

**Solution:**
```bash
cargo install wasm-pack
```

### Windows: "Access denied" when creating symlink

**Solution:**
1. Use junction instead (no admin needed): `npm run symlink:plugin`
2. Or run PowerShell as Administrator
3. Or use copy mode: `npm run copy:plugin`

### Hot Reload not working

**Solution:**
1. Install the "Hot Reload" plugin in Obsidian
2. Ensure the plugin is enabled
3. Check that you're using symlink/junction, not copy mode
4. Verify the symlink is valid: `ls -l /path/to/vault/.obsidian/plugins/obsidian-sync-wasm`

## CI/CD

The project includes GitHub Actions CI that runs on every PR:

```bash
# What CI does:
1. Install Node.js and Rust
2. Build WASM module
3. Run TypeScript tests
4. Run Rust tests
5. Run TypeScript type check
6. Verify build artifacts
7. Check bundle size
```

## Adding New Rust Functions

1. Add function to `wasm/src/lib.rs`:
```rust
#[wasm_bindgen]
pub fn my_function(input: &str) -> String {
    format!("Result: {}", input)
}
```

2. Add Rust test:
```rust
#[cfg(test)]
mod tests {
    #[test]
    fn test_my_function() {
        assert_eq!(my_function("test"), "Result: test");
    }
}
```

3. Rebuild WASM:
```bash
npm run wasm
```

4. Import in TypeScript (`main.ts`):
```typescript
import { my_function } from './wasm/pkg/obsidian_sync_wasm.js';

// Use in plugin
const result = my_function("hello");
```

5. Add TypeScript test in `test/unit/`:
```typescript
import { my_function } from '../../wasm/pkg/obsidian_sync_wasm.js';

test('my_function works', () => {
    expect(my_function("test")).toBe("Result: test");
});
```

## Version Bumping

```bash
# Update version (automatically updates manifest.json, package.json, versions.json)
npm version patch   # 0.2.0 -> 0.2.1
npm version minor   # 0.2.0 -> 0.3.0
npm version major   # 0.2.0 -> 1.0.0
```

## Resources

- [Obsidian Plugin API](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [wasm-bindgen Guide](https://rustwasm.github.io/wasm-bindgen/)
- [Yrs Documentation](https://docs.rs/yrs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
