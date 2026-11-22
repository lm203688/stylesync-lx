# StyleSync — Local Config Sync

**Version:** 1.0.1  
**Publisher:** LxStudio  
**License:** MIT (see LICENSE.md)

## What it does

StyleSync lets you **export** and **import** VS Code user-config files as **locally-stored AES-256 encrypted ZIP archives**. Your config never touches the cloud — you carry it wherever you want.

Supported config types:
- `settings.json` — your editor preferences
- `keybindings.json` — custom keyboard shortcuts
- `launch.json` — debug launch configurations
- `snippets/*.json` — code snippet definitions (Pro)
- `extensions.json` — installed extensions list (Pro)

## Why StyleSync?

- **No GitHub Gist risk** — no leaking personal settings into a public repo
- **No cloud dependency** — works fully offline after install
- **Encrypted at rest** — AES-256-CBC, password-derived key via scrypt
- **Conflict detection** — import warns when target files already exist

## Free vs Pro

| Feature | Free | Pro ($7 one-time) |
|---|---|---|
| settings.json | ✓ | ✓ |
| keybindings.json | ✓ | ✓ |
| snippets/*.json | ✗ | ✓ |
| extensions.json | ✗ | ✓ |
| Max concurrent exports | 3 types | Unlimited |
| AI-powered config recommendation | — | [Phase 2 - Upcoming] |

## Quick start

1. Open the **StyleSync** view from the activity bar (sync icon).
2. Click the **+ Export** button → choose config files → enter encryption password → save the ZIP.
3. To restore, click the **↓ Import** button → select the ZIP → enter the same password.
4. (Optional) Set `stylesync.buyoutLink` in VS Code settings to unlock upgrade-to-Pro from the UI.

## Keyboard shortcuts

| Shortcut | Command |
|---|---|
| `Ctrl+Shift+P` → `StyleSync: Export Config` | Export selected config type |
| `Ctrl+Shift+P` → `StyleSync: Import Config` | Import from encrypted ZIP |
| `Ctrl+Shift+P` → `StyleSync: Activate Pro` | Enter Pro license key |

## Privacy & data handling

- All config reads happen **locally** on your machine.
- The only network call is to the license verification endpoint (`snapmark-license.463102527.workers.dev`) when activating a Pro license key.
- Encryption passwords are **never transmitted** — they stay in your VS Code input dialog.
- See [privacy-policy.html](privacy-policy.html) for full details.

## Tech details

- **Crypto**: Node.js built-in `crypto` module (AES-256-CBC + scrypt key derivation).
- **ZIP packaging**: JSZip v3 bundled as `lib/jszip.min.js`.
- **TreeView**: VS Code `TreeDataProvider` API.
- **Platform support**: Windows (`%APPDATA%\Code\User`), macOS (`~/Library/Application Support/Code/User`), Linux (`~/.config/Code/User`).

## Limitations

- Phase 1 supports only the four config file types listed above.
- Imported files that already exist trigger a **conflict warning** — manual merge recommended.
- AI-based config recommendations are planned for Phase 2.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
