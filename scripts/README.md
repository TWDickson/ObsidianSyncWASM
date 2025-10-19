# Scripts

Utility scripts for development and testing.

## detect-es-support.js

Detects which ECMAScript features are supported in Obsidian.

**Usage:**
1. Open Obsidian Developer Console (Ctrl/Cmd + Shift + I)
2. Copy the contents of `detect-es-support.js`
3. Paste into console and press Enter
4. Results will show which ES features are available

**Test Results (2025):**
- ✅ Obsidian Desktop: ES2021 fully supported
- ✅ Obsidian Mobile (iOS/Android): ES2021 fully supported

This allows us to safely target ES2021 in our build configuration.
