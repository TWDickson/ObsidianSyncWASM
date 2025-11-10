# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Obsidian community plugin built with TypeScript and bundled with esbuild. The plugin is loaded by Obsidian from the compiled `main.js` file.

**Key Architecture Points:**
- **Entry point**: `main.ts` (currently a single-file plugin, but should be split into modules as it grows)
- **Build system**: esbuild via `esbuild.config.mjs`
- **Package manager**: npm (required - do not use yarn or other alternatives)
- **Output**: Bundled `main.js` at root (never commit this file)
- **Required release artifacts**: `main.js`, `manifest.json`, `styles.css`

## Build Commands

```bash
# Install dependencies
npm install

# Development mode (watch + rebuild on changes)
npm run dev

# Production build (type-checked, minified)
npm run build

# Version bump (updates manifest.json, package.json, versions.json)
npm version patch|minor|major
```

## Test-Driven Development (TDD)

**CRITICAL: Follow TDD practices for all new features and bug fixes.**

This project uses a **test-first approach** to ensure code quality, maintainability, and regression prevention.

### TDD Workflow

Follow the **Red-Green-Refactor** cycle:

1. **🔴 Red** - Write a failing test that defines the desired behavior
2. **🟢 Green** - Write the minimal code to make the test pass
3. **🔵 Refactor** - Improve the code while keeping tests green

### Testing Commands

```bash
# Run all tests (TypeScript + Rust)
npm test

# Run TypeScript tests only
npm run test:ts

# Run Rust/WASM tests only
npm run test:wasm

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in UI mode (interactive)
npm run test:ui
```

### When to Write Tests

**ALWAYS write tests for:**
- ✅ New features (write tests BEFORE implementation)
- ✅ Bug fixes (write failing test that reproduces the bug, then fix)
- ✅ Refactoring (ensure existing behavior is preserved)
- ✅ Complex business logic
- ✅ Data transformations and parsing
- ✅ State management and side effects
- ✅ WASM FFI bindings and Rust code
- ✅ Utility functions and helpers

**Tests are optional for:**
- ⚠️ Simple UI components without logic
- ⚠️ Trivial getters/setters
- ⚠️ Obsidian plugin lifecycle boilerplate

### Test Organization

**TypeScript Tests** (Vitest):
```
tests/
├── unit/           # Unit tests for individual functions/classes
├── integration/    # Integration tests for module interactions
└── fixtures/       # Test data and mocks
```

**Rust Tests** (cargo test):
```
wasm/src/
├── lib.rs          # Main library code with unit tests
└── tests/          # Integration tests
```

### Testing Best Practices

**1. Test Structure (AAA Pattern)**
```ts
// Arrange - Set up test data and conditions
const input = "test data";
const expected = "expected result";

// Act - Execute the code under test
const result = functionUnderTest(input);

// Assert - Verify the result
expect(result).toBe(expected);
```

**2. Descriptive Test Names**
```ts
// ❌ Bad: vague test name
test('it works', () => { ... });

// ✅ Good: describes behavior and context
test('parseMarkdown() should extract frontmatter from valid markdown', () => { ... });
```

**3. Test One Thing Per Test**
```ts
// ❌ Bad: testing multiple behaviors
test('user management', () => {
  expect(createUser()).toBeTruthy();
  expect(deleteUser()).toBeTruthy();
  expect(updateUser()).toBeTruthy();
});

// ✅ Good: focused single-behavior tests
test('createUser() should create a new user with valid data', () => { ... });
test('deleteUser() should remove user by ID', () => { ... });
test('updateUser() should modify existing user', () => { ... });
```

**4. Keep Tests Fast**
- Mock external dependencies (file system, network, Obsidian API)
- Use in-memory data structures when possible
- Run expensive tests separately (integration, E2E)

**5. Test Edge Cases**
```ts
test('should handle empty string input', () => { ... });
test('should handle null/undefined values', () => { ... });
test('should handle large inputs (10MB+)', () => { ... });
test('should handle special characters and unicode', () => { ... });
```

### TDD Example: TypeScript Feature

**Example: Adding a markdown parser function**

**Step 1: Write the test first (Red 🔴)**
```ts
// tests/unit/parser.test.ts
import { describe, test, expect } from 'vitest';
import { extractFrontmatter } from '../src/parser';

describe('extractFrontmatter', () => {
  test('should extract YAML frontmatter from markdown', () => {
    const markdown = `---
title: Test Note
tags: [test, example]
---
# Content here`;

    const result = extractFrontmatter(markdown);

    expect(result).toEqual({
      title: 'Test Note',
      tags: ['test', 'example']
    });
  });

  test('should return empty object when no frontmatter exists', () => {
    const markdown = '# Just a heading';
    const result = extractFrontmatter(markdown);
    expect(result).toEqual({});
  });
});
```

**Step 2: Run test - it should fail (Red 🔴)**
```bash
npm run test:ts
# Expected: FAIL - function doesn't exist yet
```

**Step 3: Write minimal implementation (Green 🟢)**
```ts
// src/parser.ts
export function extractFrontmatter(markdown: string): Record<string, any> {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = markdown.match(frontmatterRegex);

  if (!match) return {};

  // Simple YAML parser (replace with proper library in production)
  const yaml = match[1];
  const result: Record<string, any> = {};

  yaml.split('\n').forEach(line => {
    const [key, value] = line.split(':').map(s => s.trim());
    if (key && value) {
      result[key] = value.startsWith('[') ? JSON.parse(value.replace(/'/g, '"')) : value;
    }
  });

  return result;
}
```

**Step 4: Run test - it should pass (Green 🟢)**
```bash
npm run test:ts
# Expected: PASS - all tests green
```

**Step 5: Refactor if needed (Refactor 🔵)**
```ts
// Refactor to use a proper YAML library
import yaml from 'yaml';

export function extractFrontmatter(markdown: string): Record<string, any> {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  return match ? yaml.parse(match[1]) : {};
}
```

### TDD Example: Rust/WASM Feature

**Step 1: Write the test first (Red 🔴)**
```rust
// wasm/src/lib.rs
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encode_markdown_to_bytes() {
        let markdown = "# Hello World";
        let encoded = encode_markdown(markdown);

        assert!(!encoded.is_empty());
        assert_eq!(encoded[0], b'#');
    }

    #[test]
    fn test_decode_bytes_to_markdown() {
        let bytes = vec![b'#', b' ', b'H', b'i'];
        let decoded = decode_markdown(&bytes);

        assert_eq!(decoded, "# Hi");
    }
}
```

**Step 2: Run test - it should fail (Red 🔴)**
```bash
cargo test
# Expected: FAIL - functions don't exist
```

**Step 3: Implement (Green 🟢)**
```rust
pub fn encode_markdown(text: &str) -> Vec<u8> {
    text.as_bytes().to_vec()
}

pub fn decode_markdown(bytes: &[u8]) -> String {
    String::from_utf8_lossy(bytes).to_string()
}
```

**Step 4: Run tests (Green 🟢)**
```bash
cargo test
# Expected: PASS
```

### CI/CD Integration

All tests run automatically in CI:
- **On PR**: Tests must pass before merge
- **On push to master**: Full test suite runs
- **Coverage reports**: Track test coverage over time

### Mocking Obsidian APIs

When testing plugin code, mock Obsidian APIs:

```ts
import { vi } from 'vitest';

// Mock Obsidian Vault API
const mockVault = {
  read: vi.fn().mockResolvedValue('# Mock content'),
  modify: vi.fn().mockResolvedValue(undefined),
  adapter: {
    exists: vi.fn().mockResolvedValue(true)
  }
};

// Use in tests
test('should read file from vault', async () => {
  const content = await mockVault.read('test.md');
  expect(content).toBe('# Mock content');
});
```

### Test Coverage Goals

- **Minimum coverage**: 70% overall
- **Critical paths**: 90%+ coverage
- **WASM/Rust code**: 80%+ coverage
- **Utility functions**: 95%+ coverage

### TDD Benefits for This Project

1. **Confidence**: Refactor safely knowing tests will catch regressions
2. **Documentation**: Tests serve as living documentation of behavior
3. **Design**: TDD encourages modular, testable code architecture
4. **Debugging**: Failing tests pinpoint exact issue location
5. **Obsidian API Changes**: Tests catch breaking changes in Obsidian updates

### Resources

- **Vitest Documentation**: https://vitest.dev/
- **Rust Testing Guide**: https://doc.rust-lang.org/book/ch11-00-testing.html
- **Testing Best Practices**: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library

## Git & Security Practices

**CRITICAL: This is a sensitive community plugin with high trust requirements.**

### Commit Signing
- **ALL commits MUST be signed** to verify authenticity and maintain trust
- Never use `--no-verify` or `--no-gpg-sign` flags
- Before creating commits, verify GPG signing is configured:
  ```bash
  git config --get user.signingkey
  git config --get commit.gpgsign
  ```
- If commit signing fails, DO NOT proceed - inform the user to configure GPG signing

### Commit Message Requirements

**IMPORTANT: Use Conventional Commits with Emojis**

Format: `type(scope): emoji message`

**Example:**
```
feat(WASM): ✨ add Rust WASM integration
chore(Config): ⚙️ update workspace settings
build(Build): 📦 add development dependencies
perf(TypeScript): ⚡ upgrade to ES2021 target
```

**Available Scopes:**
- `LLM Integration` - Claude Code, AI-related changes
- `Project` - GitHub Project, task management
- `Utility` - Helper scripts, tools
- `Config` - Configuration files
- `WASM` - Rust/WebAssembly code
- `Build` - Build system, bundling
- `Dev` - Development workflow, tooling
- `TypeScript` - TypeScript code changes

**Common Types & Emojis:**
- `feat`: ✨ New feature
- `fix`: 🐛 Bug fix
- `docs`: 📝 Documentation
- `style`: 💄 Code style/formatting
- `refactor`: ♻️ Code refactoring
- `perf`: ⚡ Performance improvement
- `test`: ✅ Tests
- `build`: 📦 Build system
- `ci`: 👷 CI/CD
- `chore`: 🔧 Maintenance

**Commit Guidelines:**
- Keep messages clear and descriptive
- Focus on the "why" rather than just the "what"
- Use present tense ("add feature" not "added feature")
- First line should be ≤72 characters
- Add detailed description in body if needed

### Security Considerations
- Never commit sensitive information (API keys, tokens, credentials)
- Never commit build artifacts (`main.js`, `node_modules/`)
- Verify all dependencies before adding them to `package.json`
- Review all code changes carefully before committing
- Never run destructive git commands (`push --force` to main, hard reset, etc.) without explicit user approval

## Continuous Integration & Branch Protection

### GitHub Actions CI

The repository includes a CI workflow (`.github/workflows/ci.yml`) that runs on:
- Pull requests targeting `master`
- Pushes to `master`

**CI Checks:**
1. **TypeScript type checking** - Ensures no type errors
2. **Rust tests** - Runs all WASM tests with `cargo test`
3. **Production build** - Verifies the full build completes successfully
4. **Build artifact verification** - Confirms `main.js` and WASM files are generated
5. **Bundle size reporting** - Displays artifact sizes for monitoring bloat

**CI Workflow Features:**
- Caches npm and Rust dependencies for faster runs
- Uses `wasm32-unknown-unknown` target for WASM compilation
- Runs `npm ci` for reproducible builds
- Reports build artifacts and sizes

### Branch Protection Setup

**To require PRs for the master branch:**

1. **Enable Branch Protection**:
   - Go to: `Settings` → `Branches` → `Add branch protection rule`
   - Branch name pattern: `master`

2. **Recommended Rules**:
   - ✅ Require a pull request before merging
     - Required approvals: 1 (for team projects) or 0 (for solo with CI)
     - Dismiss stale reviews when new commits are pushed
   - ✅ Require status checks to pass before merging
     - Add required check: `ci` (the CI workflow job name)
     - Require branches to be up to date before merging
   - ✅ Require signed commits (matches repository security requirements)
   - ✅ Include administrators (apply rules to repo admins too)
   - ⚠️ Do not allow force pushes
   - ⚠️ Do not allow deletions

3. **Workflow**:
   ```bash
   # Create feature branch
   git checkout -b feature/my-feature

   # Make changes and commit
   git add .
   git commit -m "feat(Feature): ✨ add new feature"

   # Push to remote
   git push -u origin feature/my-feature

   # Create PR via GitHub UI or gh CLI
   gh pr create --title "feat(Feature): ✨ add new feature" --body "Description..."

   # After CI passes and review (if required), merge via GitHub UI
   ```

4. **Local Development**:
   - Continue using `npm run dev` for local testing
   - CI will catch issues before merge
   - All commits must be signed (enforced by branch protection)

**Note**: Branch protection requires a GitHub Pro account for private repositories, but is free for public repositories.

## GitHub Project Management

This repository uses **GitHub Projects** for task tracking and project planning.

**Project Details:**
- **Name**: ObsidianSyncWASM Kanban
- **URL**: https://github.com/users/TWDickson/projects/3
- **Description**: Kanban board to guide initial development
- **Type**: Public project with custom fields (Status, Priority, Dates)

### Authentication Setup

To enable GitHub Project integration, ensure the GitHub CLI has the required permissions:

```bash
# Grant read and write access to projects
gh auth refresh -s read:project -s write:project

# Verify authentication
gh project view 3 --owner TWDickson
```

### Claude Code Integration

Claude Code automatically integrates with the GitHub Project when working on tasks:

**Automatic Synchronization:**

1. **Task Discovery** - Before starting work, Claude retrieves current project items to understand priorities and backlog
2. **Status Updates** - As work progresses, Claude updates project item status:
   - `Backlog` → `In progress` when starting a task
   - `In progress` → `Done` when completing a task
3. **Issue Linking** - When creating PRs, Claude automatically links them to related project items
4. **Progress Reporting** - Claude provides project status updates before and after completing work

**TodoWrite ↔ GitHub Project Sync:**
- Claude's internal TodoWrite task list stays synchronized with GitHub Project items
- Complex tasks are broken down into subtasks in TodoWrite, while the parent issue tracks overall progress in the project
- Project items provide the "what" (feature/issue), while TodoWrite tracks the "how" (implementation steps)

### Common Project Commands

**View project status:**
```bash
# View project overview
gh project view 3 --owner TWDickson

# List all items with details
gh project item-list 3 --owner TWDickson --format json --limit 100

# View specific item
gh project item-view <item-id> --owner TWDickson
```

**Create and manage items:**
```bash
# Add existing issue to project
gh project item-add 3 --owner TWDickson --url <issue-url>

# Create draft issue in project
gh project item-create 3 --owner TWDickson --title "Task title" --body "Description"

# Archive completed item
gh project item-archive <item-id> --owner TWDickson
```

**Update item status (move across board):**
```bash
# Get item details including item ID from issue
gh project item-list 3 --owner TWDickson --format json | jq '.items[] | select(.content.number == 28)'

# Update status field (use exact status names from project)
# Status Field ID: PVTSSF_lAHOADRrKM4BHYazzg4Jy2s
gh project item-edit --id <item-id> --project-id PVT_kwHOADRrKM4BHYaz --field-id PVTSSF_lAHOADRrKM4BHYazzg4Jy2s --single-select-option-id <option-id>

# Status option IDs:
# - Backlog: f75ad846
# - Ready: 61e4505c
# - In progress: 47fc9ee4
# - In review: df73e18b
# - Done: 98236657

# Example: Move issue #28 to "In progress"
gh project item-edit --id PVTI_... --project-id PVT_kwHOADRrKM4BHYaz --field-id PVTSSF_lAHOADRrKM4BHYazzg4Jy2s --single-select-option-id 47fc9ee4
```

**Link PRs to project items:**
```bash
# PRs are automatically added to the project when they reference an issue in the project
# Use "Fixes #issue-number" or "Closes #issue-number" in PR body
gh pr create --title "feat: new feature" --body "Fixes #23\n\nDescription..."
```

### Project Workflow

**Standard Development Flow:**

1. **Create issue in Kanban** - Add new task to the project board with proper details
2. **Create branch from issue** - Use GitHub's "Create a branch" feature from the issue
3. **Checkout branch locally** - Switch to the new branch
4. **Implement changes** - Make code changes with signed commits
5. **Create PR** - Link back to the issue with "Closes #issue-number"
6. **Merge and cleanup** - PR auto-closes issue and updates project status

**When Claude works on an existing issue:**

1. **Check project status** to identify the issue and understand requirements
2. **Get project item ID** from the issue number to enable status updates
3. **Create branch from issue** using `gh issue develop <issue-number>`
4. **Move item to "In progress"** on the board (REQUIRED - don't skip this!)
5. **Create TodoWrite task list** breaking down the implementation steps
6. **Work through TodoWrite tasks** sequentially, committing progress
7. **Move item to "In review"** when creating PR
8. **Create PR** with proper commit messages and "Closes #issue-number" reference
9. **Move item to "Done"** after PR is merged (or let automation handle it)

**Example workflow:**
```bash
# User: "Work on issue #23: Implement Yrs in WASM App"

# Claude automatically:
# 1. Retrieves issue #23 from project and gets item ID
gh project item-list 3 --owner TWDickson --format json | jq '.items[] | select(.content.number == 23)'

# 2. Creates branch from issue
gh issue develop 23 --checkout

# 3. MOVES ITEM TO "IN PROGRESS" (critical step!)
gh project item-edit --id PVTI_... --project-id PVT_kwHOADRrKM4BHYaz \
  --field-id PVTSSF_lAHOADRrKM4BHYazzg4Jy2s --single-select-option-id 47fc9ee4

# 4. Creates TodoWrite tasks for implementation steps
# 5. Implements feature step-by-step with signed commits

# 6. MOVES ITEM TO "IN REVIEW"
gh project item-edit --id PVTI_... --project-id PVT_kwHOADRrKM4BHYaz \
  --field-id PVTSSF_lAHOADRrKM4BHYazzg4Jy2s --single-select-option-id df73e18b

# 7. Creates PR with proper linking
gh pr create --title "feat(WASM): ✨ implement Yrs for markdown files" \
  --body "Closes #23\n\nImplementation details..."

# 8. After PR merge, either manually move to "Done" or let GitHub automation handle it
gh project item-edit --id PVTI_... --project-id PVT_kwHOADRrKM4BHYaz \
  --field-id PVTSSF_lAHOADRrKM4BHYazzg4Jy2s --single-select-option-id 98236657
```

**Branch Creation Commands:**
```bash
# Create branch directly from issue (recommended)
gh issue develop <issue-number> --checkout --name feature/short-name

# Or manually create branch with issue reference
git checkout -b <issue-number>-feature-name

# Link issue to branch in project (if not auto-linked)
gh issue develop <issue-number> --checkout
```

### Project Field IDs

For programmatic updates, these are the custom field IDs in the project:

- **Status** (ID: `PVTSSF_lAHOADRrKM4BHYazzg4Jy2s`): Item workflow state
  - Options: `Backlog`, `Ready`, `In progress`, `In review`, `Done`
- **Priority** (ID: `PVTSSF_lAHOADRrKM4BHYazzg4Jy6U`): Task prioritization
  - Options: `P0` (Critical), `P1` (High), `P2` (Normal)
- **Size** (ID: `PVTSSF_lAHOADRrKM4BHYazzg4Jy6Y`): Effort estimation
  - Options: `XS`, `S`, `M`, `L`, `XL`
- **Start date** (ID: `PVTF_lAHOADRrKM4BHYazzg4Jy6g`): When work begins
- **Target date** (ID: `PVTF_lAHOADRrKM4BHYazzg4Jy6k`): Expected completion date

Query field IDs:

```bash
gh project field-list 3 --owner TWDickson --format json
```

### Best Practices

**When working with the project:**
- **Always move items across the board** - Don't just work on items in "Backlog", actively move them through the workflow
- **Get the project item ID first** - Before starting work, retrieve the item ID so you can update status
- **Update status at each stage:**
  - `Backlog` → `In progress` when starting work (REQUIRED!)
  - `In progress` → `In review` when creating PR
  - `In review` → `Done` after merge (or let automation handle it)
- Verify project status before starting new work to avoid conflicts
- Link all PRs to their corresponding issues using "Fixes #issue" in the PR body
- Add meaningful comments to issues when encountering blockers or changing approach
- Archive items only when fully complete and merged

**Task breakdown:**
- Large project items (e.g., "Implement Yrs in WASM App") should be broken into TodoWrite subtasks
- TodoWrite tracks granular steps like "Write Rust FFI bindings", "Add TypeScript wrappers", "Write tests"
- Project item tracks overall feature completion

**Communication:**
- Project board provides high-level visibility for stakeholders
- TodoWrite provides detailed, real-time progress for active development
- Commit messages and PR descriptions connect code changes to project goals

## Code Organization

**Current state**: All code is in `main.ts` (single file).

**Expected organization as the plugin grows**:
```
main.ts              # Minimal plugin lifecycle only (onload, onunload, command registration)
settings.ts          # Settings interface and defaults
commands/            # Command implementations
ui/                  # Modals, views, UI components
utils/               # Helper functions, constants
types.ts             # TypeScript interfaces and types
```

**Important rules**:
- Keep `main.ts` focused on plugin lifecycle - delegate feature logic to separate modules
- Split files before they exceed ~200-300 lines
- Each module should have a single, well-defined responsibility
- All code must bundle into `main.js` - no unbundled runtime dependencies
- Never commit build artifacts (`main.js`, `node_modules/`)

## Plugin Architecture Patterns

### Settings Persistence
```ts
interface MyPluginSettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  mySetting: 'default'
}

async onload() {
  this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
}

async saveSettings() {
  await this.saveData(this.settings);
}
```

### Registering Commands
```ts
this.addCommand({
  id: 'stable-command-id',  // Never rename after release
  name: 'User-facing command name',
  callback: () => { /* implementation */ }
});
```

### Safe Resource Cleanup
Always use `register*` helpers so resources are cleaned up on plugin unload:
```ts
this.registerEvent(this.app.workspace.on('file-open', handler));
this.registerDomEvent(window, 'resize', handler);
this.registerInterval(window.setInterval(handler, 1000));
```

## Manifest Requirements

**Critical fields in `manifest.json`**:
- `id`: Plugin ID (never change after release; must match folder name for local dev)
- `version`: Semantic versioning (x.y.z)
- `minAppVersion`: Minimum Obsidian version required
- `isDesktopOnly`: Set to `true` if using Node/Electron APIs

**Versioning**: When bumping versions, update both `manifest.json` and `versions.json` to map plugin version → minimum Obsidian version. Use `npm version patch|minor|major` after manually updating `minAppVersion`.

## Security & Privacy Requirements

Follow Obsidian's Developer Policies strictly:
- **Default to local/offline operation** - only make network requests when essential
- **No hidden telemetry** - require explicit opt-in for any analytics or external service calls
- **Never execute remote code** - no fetching and eval-ing scripts, no auto-updates outside normal releases
- **Minimize scope** - only read/write what's necessary inside the vault, never access files outside
- **Disclose external services** - clearly document any third-party services, data sent, and risks
- **Respect privacy** - do not collect vault contents, filenames, or personal information without explicit consent
- **Clean up resources** - use `register*` helpers to ensure proper cleanup on unload

## Mobile Compatibility

- Current setting: `isDesktopOnly: false` (plugin targets both desktop and mobile)
- Avoid Node/Electron APIs to maintain mobile compatibility
- Test on iOS and Android when possible
- Be mindful of memory and storage constraints on mobile

## Testing & Installation

**Manual testing**:
1. Run `npm run build` or `npm run dev`
2. Copy `main.js`, `manifest.json`, `styles.css` to: `<Vault>/.obsidian/plugins/<plugin-id>/`
3. Reload Obsidian
4. Enable plugin in **Settings → Community plugins**

**Common issues**:
- Plugin doesn't load: Ensure `main.js` and `manifest.json` are at the correct path
- Build missing: Run `npm run build` to compile TypeScript
- Commands not appearing: Verify `addCommand` runs in `onload` with unique IDs

## Performance Best Practices

- Keep `onload` light - defer heavy initialization until needed
- Avoid long-running tasks during startup
- Batch disk access, avoid excessive vault scans
- Debounce/throttle expensive operations in file system event handlers

## TypeScript Configuration

- Compiler: TypeScript 4.7.4
- Target: ES2021 (verified compatible with Obsidian mobile and desktop)
- Build target: ES2021 (esbuild)
- Strict mode enabled: `noImplicitAny: true`, `strictNullChecks: true`
- Source maps: Inline in dev mode, disabled in production
- See `scripts/detect-es-support.js` to verify ES support in Obsidian

## External Dependencies

**Externalized (provided by Obsidian runtime)**:
- `obsidian` (plugin API)
- `electron`
- All CodeMirror packages (`@codemirror/*`, `@lezer/*`)
- Node built-in modules

**Dependency policy**:
- Keep the plugin small - avoid large dependencies
- Prefer browser-compatible packages
- Bundle everything except the externalized packages above
- Verify all dependencies are trustworthy before adding

## Obsidian API Documentation

**When working on this plugin, these documentation pages are frequently useful. Use WebFetch to access them as needed.**

### Core Concepts
- **Plugin API Overview**: https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin
- **Plugin Guidelines**: https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines
- **Developer Policies**: https://docs.obsidian.md/Developer+policies
- **Submit Your Plugin**: https://docs.obsidian.md/Plugins/Releasing/Submit+your+plugin

### API Reference
- **TypeScript API**: https://docs.obsidian.md/Reference/TypeScript+API
- **Vault API**: https://docs.obsidian.md/Reference/TypeScript+API/Vault
- **Workspace API**: https://docs.obsidian.md/Reference/TypeScript+API/Workspace
- **MetadataCache API**: https://docs.obsidian.md/Reference/TypeScript+API/MetadataCache
- **Editor API**: https://docs.obsidian.md/Reference/TypeScript+API/Editor
- **Notice API**: https://docs.obsidian.md/Reference/TypeScript+API/Notice

### Mobile Development
- **Mobile Development Guide**: https://docs.obsidian.md/Plugins/Getting+started/Mobile+development
- **Capacitor Documentation**: https://capacitorjs.com/docs
- **Platform Detection**: https://docs.obsidian.md/Reference/TypeScript+API/Platform

### User Interface
- **Custom Views**: https://docs.obsidian.md/Plugins/User+interface/Views
- **Modals**: https://docs.obsidian.md/Plugins/User+interface/Modals
- **Settings Tab**: https://docs.obsidian.md/Plugins/User+interface/Settings
- **Icons**: https://docs.obsidian.md/Plugins/User+interface/Icons

### Advanced Topics
- **Events**: https://docs.obsidian.md/Plugins/Advanced+topics/Events
- **Commands**: https://docs.obsidian.md/Plugins/User+interface/Commands
- **Ribbon Actions**: https://docs.obsidian.md/Plugins/User+interface/Ribbon+actions
- **Status Bar**: https://docs.obsidian.md/Plugins/User+interface/Status+bar

### Testing & Releasing
- **Hot Reload Plugin**: https://github.com/pjeby/hot-reload (for development)
- **Plugin Review Process**: https://docs.obsidian.md/Plugins/Releasing/Plugin+review+guidelines
- **Beta Testing**: https://docs.obsidian.md/Plugins/Releasing/Beta+testing

### Community Resources
- **Sample Plugin**: https://github.com/obsidianmd/obsidian-sample-plugin
- **Obsidian API on GitHub**: https://github.com/obsidianmd/obsidian-api
- **Developer Discord**: https://discord.gg/obsidianmd (check #plugin-dev channel)

## Additional References

- See `AGENTS.md` for comprehensive coding conventions, UX guidelines, and detailed examples
- See `scripts/detect-es-support.js` for runtime ES feature detection
