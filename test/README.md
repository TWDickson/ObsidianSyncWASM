# Testing Guide

This document describes the testing infrastructure for the Obsidian Sync WASM plugin.

> **💡 Quick Links**:
>
> - **Unit Testing**: This guide (you are here)
> - **Integration Testing**: [../docs/INTEGRATION-TESTING.md](../docs/INTEGRATION-TESTING.md)
> - **Hot Reload Setup**: [../test-vaults/vault-a/HOT-RELOAD-SETUP.md](../test-vaults/vault-a/HOT-RELOAD-SETUP.md)
> - **Quick Reference**: [../TESTING-QUICK-REFERENCE.md](../TESTING-QUICK-REFERENCE.md)

## Overview

The project uses a three-tier testing approach:

1. **Unit Tests** (this guide): Fast, isolated tests with mocked dependencies
2. **Integration Tests**: Real Obsidian vaults with hot reload
3. **E2E Tests** (future): Full sync workflow testing

### Technologies

- **TypeScript/JavaScript**: Vitest for unit and integration tests
- **Rust/WASM**: Cargo's built-in test framework

## Quick Start

```bash
# Run all tests (TypeScript + Rust)
npm run test:all

# Run TypeScript tests only
npm test

# Run Rust tests only
npm run test:rust

# Watch mode (TypeScript)
npm run test:watch

# Interactive UI (TypeScript)
npm run test:ui

# Coverage report (TypeScript)
npm run test:coverage
```

## TypeScript Testing (Vitest)

### Configuration

- **Config file**: `vitest.config.ts`
- **Test runner**: Vitest (fast, ESM-native, Vite-powered)
- **DOM environment**: happy-dom (lightweight)
- **Mock setup**: `test/setup.ts`

### Obsidian API Mocking

The Obsidian API is mocked in `test/mocks/obsidian.ts`. This provides stub implementations of:
- `App`, `Vault`, `Workspace`, `MetadataCache`
- `Plugin`, `PluginManifest`, `PluginSettingTab`
- `Notice`, `TFile`, `TFolder`, `Setting`

All mocks use Vitest's `vi.fn()` for easy assertion and verification.

### Writing Tests

Create test files with `.test.ts` or `.spec.ts` extension:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { App } from 'obsidian';

describe('MyFeature', () => {
  let app: App;

  beforeEach(() => {
    app = new App();
  });

  it('should do something', () => {
    // Your test here
    expect(true).toBe(true);
  });
});
```

### Mocking WASM Functions

```typescript
vi.mock('../../wasm/pkg/obsidian_sync_wasm.js', () => ({
  default: vi.fn(async () => {}), // init function
  greet: vi.fn((name: string) => `Hello, ${name}!`),
  compute_hash: vi.fn((input: string) => 'mock-hash'),
}));
```

### Test Organization

```
test/
├── setup.ts              # Global test setup
├── mocks/
│   └── obsidian.ts       # Obsidian API mocks
└── unit/
    └── plugin.test.ts    # Example unit tests
```

## Rust Testing

### Standard Tests

Regular Rust tests use the `#[test]` attribute and run with `cargo test`:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_function() {
        assert_eq!(my_function(), expected_value);
    }
}
```

### WASM-Specific Tests

Tests that need to run in a WASM environment use `wasm-bindgen-test`:

```rust
#[cfg(all(test, target_arch = "wasm32"))]
mod wasm_tests {
    use super::*;
    use wasm_bindgen_test::*;

    wasm_bindgen_test_configure!(run_in_browser);

    #[wasm_bindgen_test]
    fn test_in_wasm() {
        // Test that runs in browser environment
    }
}
```

To run WASM tests in a browser:
```bash
cd wasm
wasm-pack test --headless --firefox  # or --chrome
```

### Test Organization (Rust)

```
wasm/src/
└── lib.rs
    ├── #[cfg(test)] tests           # Standard unit tests
    └── #[cfg(all(test, target_arch = "wasm32"))] wasm_tests  # WASM-specific
```

## Continuous Integration

The CI workflow (`.github/workflows/ci.yml`) runs:
1. TypeScript type checking
2. TypeScript unit tests
3. Rust unit tests
4. Production build verification

All checks must pass before merging to `master`.

## Coverage

Generate TypeScript coverage reports:
```bash
npm run test:coverage
```

Coverage reports are saved to `coverage/` directory (excluded from git).

View HTML report:
```bash
open coverage/index.html
```

## Best Practices

### TypeScript Tests

1. **Mock external dependencies**: Always mock Obsidian API and WASM functions
2. **Test behavior, not implementation**: Focus on what the code does, not how
3. **Keep tests isolated**: Use `beforeEach` to reset state
4. **Name tests clearly**: Use descriptive test names that explain the scenario
5. **Avoid testing internals**: Test through public APIs only

### Rust Tests

1. **Test pure functions**: Prioritize testing logic without side effects
2. **Use standard tests for most cases**: Only use `wasm-bindgen-test` when needed
3. **Test edge cases**: Empty strings, zero values, boundary conditions
4. **Keep tests fast**: Avoid slow operations in unit tests

## Troubleshooting

### TypeScript tests fail to import Obsidian API

Make sure you're importing from the mock:
```typescript
import { App } from 'obsidian'; // Automatically resolves to test/mocks/obsidian.ts
```

### WASM module import errors in tests

Mock the WASM module at the top of your test file:
```typescript
vi.mock('../../wasm/pkg/obsidian_sync_wasm.js', () => ({ ... }));
```

### Rust tests not found

Ensure your tests are in a `#[cfg(test)]` module:
```rust
#[cfg(test)]
mod tests {
    use super::*;
    // tests here
}
```

## Future Improvements

- [ ] Add integration tests for full plugin lifecycle
- [ ] Add E2E tests using Playwright or similar
- [ ] Set up mutation testing
- [ ] Add performance benchmarks
- [ ] Increase coverage threshold requirements
