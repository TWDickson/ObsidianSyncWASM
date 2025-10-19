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
- Keep commit messages clear and descriptive
- Focus on the "why" rather than just the "what"
- Follow the repository's existing commit message style (check `git log`)
- Always include the standard Claude Code attribution footer when creating commits

### Security Considerations
- Never commit sensitive information (API keys, tokens, credentials)
- Never commit build artifacts (`main.js`, `node_modules/`)
- Verify all dependencies before adding them to `package.json`
- Review all code changes carefully before committing
- Never run destructive git commands (`push --force` to main, hard reset, etc.) without explicit user approval

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
- Target: ES6 (but esbuild bundles to es2018)
- Strict mode enabled: `noImplicitAny: true`, `strictNullChecks: true`
- Source maps: Inline in dev mode, disabled in production

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

## References

- Obsidian sample plugin: https://github.com/obsidianmd/obsidian-sample-plugin
- API docs: https://docs.obsidian.md
- Developer policies: https://docs.obsidian.md/Developer+policies
- Plugin guidelines: https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines
- See `AGENTS.md` for comprehensive coding conventions, UX guidelines, and detailed examples
