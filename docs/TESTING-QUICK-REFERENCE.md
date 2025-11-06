# Testing Quick Reference Card

## 🎯 VS Code Integration

### Step 1: Install Extension
1. Press `Cmd+Shift+X` (Extensions)
2. Search "Vitest"
3. Install **vitest.explorer**
4. Reload window

### Step 2: Run Tests

#### Using Command Palette (`Cmd+Shift+P`)
```
> Run Task → Test: Run All Tests          ⭐ Default (Cmd+Shift+T)
> Run Task → Test: TypeScript (Watch)     🔄 Auto-run on save
> Run Task → Test: TypeScript (UI)        🎨 Interactive browser UI
> Run Task → Test: TypeScript Coverage    📊 HTML coverage report
> Run Task → Test: Rust                   🦀 Rust tests only
```

#### Using Test Explorer (Sidebar)
- Click **beaker icon** (🧪) in sidebar
- See all tests in tree view
- Click ▶️ to run individual tests
- Right-click for more options

#### Using Inline Gutter
- Click ▶️ next to `it('test name', ...)`
- Run/debug single test instantly

#### Using Terminal
```bash
npm test              # TypeScript tests (once)
npm run test:watch    # TypeScript (watch mode)
npm run test:ui       # TypeScript (browser UI)
npm run test:coverage # TypeScript (with coverage)
npm run test:rust     # Rust tests
npm run test:all      # Everything
```

## 📁 File Structure

```
project/
├── test/
│   ├── README.md              # Full testing guide
│   ├── setup.ts               # Global test setup
│   ├── mocks/
│   │   └── obsidian.ts        # Obsidian API mocks
│   └── unit/
│       └── plugin.test.ts     # Example tests
├── wasm/src/lib.rs            # Rust tests (bottom of file)
├── vitest.config.ts           # Vitest configuration
└── .vscode-integration.md     # VS Code integration guide
```

## 🔨 Writing New Tests

### TypeScript Test Template
```typescript
// test/unit/my-feature.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { App } from 'obsidian';

describe('MyFeature', () => {
  let app: App;

  beforeEach(() => {
    app = new App();
  });

  it('should do something', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = myFunction(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

### Rust Test Template
```rust
// wasm/src/lib.rs
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_my_function() {
        let result = my_function("input");
        assert_eq!(result, "expected");
    }
}
```

## 🎨 VS Code Features (with Vitest extension)

### Visual Indicators
- ✅ Green dot = test passed
- ❌ Red dot = test failed
- 🔵 Blue dot = test running
- ⚪ Gray dot = test not run

### Inline Results
- Test output appears in editor
- Failed assertions show inline
- Click to jump to source

### Coverage Gutters
- 🟢 Green = covered
- 🔴 Red = not covered
- 🟡 Yellow = partially covered

### Debugging
1. Set breakpoint in test
2. Right-click test → "Debug Test"
3. Use VS Code debugger as normal

## ⚡ Keyboard Shortcuts (Optional)

Add to `keybindings.json`:
```json
[
  { "key": "cmd+shift+t", "command": "workbench.action.tasks.runTask",
    "args": "Test: Run All Tests" },
  { "key": "cmd+shift+r", "command": "testing.runAll" },
  { "key": "cmd+shift+d", "command": "testing.debugAll" }
]
```

## 🔄 Recommended Workflow

### TDD (Test-Driven Development)
1. Write failing test
2. See ❌ in Test Explorer
3. Implement feature
4. See ✅ when done
5. Refactor safely

### Watch Mode Workflow
1. Split editor: test file | implementation
2. Run "Test: TypeScript (Watch)"
3. Edit and save
4. See results instantly in terminal

### Coverage Workflow
1. Run "Test: TypeScript Coverage"
2. Browser opens with HTML report
3. Check uncovered lines
4. Write tests for gaps
5. Re-run to verify

## 🧪 Integration Testing

### Hot Reload Development

```bash
# One-time setup: Create symlink to test vault
npm run symlink:plugin -- test-vaults/vault-a

# Start watch mode
npm run dev

# Edit code → Save → Plugin reloads automatically in Obsidian!
```

**See:** [test-vaults/vault-a/HOT-RELOAD-SETUP.md](test-vaults/vault-a/HOT-RELOAD-SETUP.md)

### Test Vault Commands

```bash
npm run setup:test-vaults    # Create vault structure
npm run symlink:plugin       # Link plugin to vault
```

## 📚 Documentation

- **Unit Testing**: [test/README.md](test/README.md)
- **Integration Testing**: [docs/INTEGRATION-TESTING.md](docs/INTEGRATION-TESTING.md)
- **Hot Reload Setup**: [test-vaults/vault-a/HOT-RELOAD-SETUP.md](test-vaults/vault-a/HOT-RELOAD-SETUP.md)
- **VS Code Integration**: [test/README.md](test/README.md#vs-code-users)
- **Vitest Docs**: <https://vitest.dev/>

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Tests not appearing | Install Vitest extension, reload window |
| Tests not running | Check terminal output, run `npm test` |
| Coverage not working | Already installed ✓ |
| Extension not working | `Cmd+Shift+P` → "Reload Window" |
| Old test results | Delete `main.js` if it exists |

## 🎯 Current Test Count

- TypeScript: **7 tests** ✅
- Rust: **4 tests** ✅
- **Total: 11 tests** ✅

---

**Quick Tip**: Press `Cmd+Shift+P` and type "test" to see all test-related commands!
