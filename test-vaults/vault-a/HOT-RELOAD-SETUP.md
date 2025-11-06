# Hot Reload Development Setup

## Quick Setup (5 minutes)

### Prerequisites
- ✅ Obsidian vault created
- ✅ BRAT plugin installed
- ✅ Hot Reload plugin installed

### Step 1: Build the Plugin
```bash
npm run build
```

### Step 2: Symlink to Your Vault
```bash
npm run symlink:plugin -- /path/to/your/vault
```

**Example:**
```bash
npm run symlink:plugin -- ~/Documents/ObsidianVaults/TestVault
```

### Step 3: Enable in Obsidian
1. Open Settings (`Cmd+,` / `Ctrl+,`)
2. Go to **Community Plugins**
3. Turn **OFF** "Safe Mode"
4. Enable **"Hot Reload"** plugin
5. Enable **"Obsidian Sync WASM"** plugin

### Step 4: Start Development
```bash
npm run dev
```

## ✨ How It Works

1. **Symlink:** Project root is symlinked to vault's `.obsidian/plugins/obsidian-sync-wasm/`
2. **Watch Mode:** `npm run dev` watches for changes and rebuilds
3. **Hot Reload:** Automatically detects changes and reloads the plugin
4. **No Manual Steps:** Edit code → Save → Plugin reloads instantly!

## Development Workflow

```bash
# Terminal: Start watch mode
npm run dev

# Edit your code
vim main.ts

# Save file → Plugin automatically reloads in Obsidian!
```

## File Structure

```
Your Vault/
└── .obsidian/
    └── plugins/
        └── obsidian-sync-wasm/  → (symlink to project root)
            ├── main.js
            ├── manifest.json
            ├── styles.css
            ├── obsidian_sync_wasm_bg.wasm
            └── ... (all project files)
```

## Hot Reload Plugin

The [Hot Reload plugin](https://github.com/pjeby/hot-reload) watches:
- `main.js` changes
- `manifest.json` changes
- `styles.css` changes

When detected, it automatically reloads your plugin!

## Tips

### 1. Watch Console
Open Developer Tools: `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)

### 2. Manual Reload (if needed)
- Hot Reload should be automatic
- If not working, toggle plugin off/on in settings

### 3. WASM Changes
WASM files are rebuilt automatically with `npm run dev`

### 4. Multiple Vaults
To switch vaults, just run symlink command again:
```bash
npm run symlink:plugin -- /path/to/other/vault
```

## Troubleshooting

### Symlink Failed (Windows)
- Run terminal as Administrator
- Or use Developer Mode in Windows Settings

### Plugin Not Appearing
- Ensure Safe Mode is OFF
- Check symlink exists: `ls -la /path/to/vault/.obsidian/plugins/`
- Restart Obsidian

### Hot Reload Not Working
- Ensure Hot Reload plugin is enabled
- Check it's watching the right directory
- Try toggling Hot Reload off/on

### Build Errors
```bash
# Clean build
rm -f main.js *.wasm
npm run build
```

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run build` | Build plugin once |
| `npm run dev` | Watch mode (auto-rebuild) |
| `npm run symlink:plugin -- <path>` | Create symlink to vault |
| `npm test` | Run unit tests |
| `npm run test:watch` | Watch mode tests |

## Advanced: Environment Variable

Set default vault path to avoid typing it:

```bash
# In your shell profile (.zshrc, .bashrc, etc.)
export OBSIDIAN_TEST_VAULT="$HOME/Documents/ObsidianVaults/TestVault"
```

Then update the symlink script to use it as fallback.

## What Gets Watched

### TypeScript (`npm run dev:ts`)
- `*.ts` files
- Rebuilds `main.js` on change

### Rust/WASM (`npm run dev:wasm`)
- `wasm/src/**/*.rs` files
- Rebuilds `.wasm` file on change

### Hot Reload Plugin
- `main.js` changes
- `manifest.json` changes
- `styles.css` changes
- Triggers plugin reload in Obsidian

## Full Development Flow

```
┌─────────────┐
│  Edit Code  │
│  (main.ts)  │
└──────┬──────┘
       │
       v
┌─────────────┐
│   Nodemon   │
│   Detects   │
└──────┬──────┘
       │
       v
┌─────────────┐
│   esbuild   │
│   Compiles  │
└──────┬──────┘
       │
       v
┌─────────────┐
│   main.js   │
│   Updated   │
└──────┬──────┘
       │
       v
┌─────────────┐
│ Hot Reload  │
│   Detects   │
└──────┬──────┘
       │
       v
┌─────────────┐
│   Plugin    │
│  Reloaded!  │
└─────────────┘
```

---

**Ready to develop!** 🚀

Edit code, save, and watch it reload automatically in Obsidian.
