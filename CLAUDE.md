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
