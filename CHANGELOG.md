# Changelog — StyleSync

## 1.0.3 (2026-11-28)

- Pro checkout now opens by default: `stylesync.buyoutLink` defaults to the reusable Paddle payment link ($7 one-time) on the LxStudio-branded checkout page.

## 1.0.0 (2026-11-20)

**Initial public release.**

### Added
- VS Code activity-bar panel showing local config file list with file sizes.
- **Export** command: select one or more config types → encrypt with AES-256-CBC → save as `.zip`.
- **Import** command: load an encrypted ZIP → decrypt → write to VS Code User folder (conflict detection).
- Support for `settings.json`, `keybindings.json` (Free); `snippets/*.json`, `extensions.json` (Pro).
- Pro license activation via Paddle verification endpoint (`snapmark-license.61960005.workers.dev/verify`).
- Free tier limits export to 3 config types maximum.
- Keyboard-accessible commands (all available from Command Palette).

### Technical
- Modular code: `lib/crypto.js`, `lib/zip.js`, `lib/treeProvider.js`.
- Platform-aware user-data paths (Windows / macOS / Linux).
- Zero external Node.js dependencies beyond bundled JSZip.

### Known limitations
- No cloud sync; manual ZIP transfer between machines.
- Import overwrite requires manual merge when target exists.
