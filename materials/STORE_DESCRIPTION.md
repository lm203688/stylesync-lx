# StyleSync — Store Description

## One-line tagline
**Your settings, your control. Sync VS Code config without touching the cloud.**

## Full description

### Overview
Stop relying on GitHub Gists or cloud services to back up your VS Code settings, keybindings, launch configs, and snippets. **StyleSync** encrypts your entire configuration locally with AES-256-CBC, packages it into a portable ZIP file that you store wherever you choose—external drive, USB stick, encrypted cloud folder of your own. Your data never leaves your machine except in that ZIP.

### Key features (Free)
- List all detectable VS Code user-config files in a clean tree view (settings.json, keybindings.json, launch.json).
- Export one or more config types as an **AES-256 encrypted ZIP**—you set the password; nobody else can open it.
- Import by selecting the ZIP and entering the same password; conflict detection warns when a target file already exists.
- Fully offline after installation: no analytics, no telemetry, no "phoning home."

### Pro upgrade ($7 one-time)
Unlock additional config types:
- `snippets/*.json` — export and restore all your code snippets.
- `extensions.json` — recreate your full extension list on a fresh install.
- Unlimited config-type exports (free tier is limited to 3 types).
- [Phase 2 - Upcoming] AI-powered config recommendations (bring your own OpenAI/Claude API key).

### Why not just use GitHub Gist sync?
| Concern | GitHub Gist | StyleSync |
|---|---|---|
| Data exposure | Public or private repo; visible to anyone with the URL | AES-256 encrypted; password unknown to attacker = unreadable |
| Dependency on internet | Required for sync | Only required once for license verification |
| Accidental leaks | Settings contain API keys, tokens, personal paths | Stays local until you decide to move it |

### Technical details
- **Encryption**: Node.js built-in `crypto` module (AES-256-CBC + scrypt key derivation). No third-party crypto libraries.
- **ZIP packaging**: JSZip v3 bundled inline.
- **Platform support**: Windows, macOS, Linux (auto-detects VS Code user-data path).
- **License verification**: Single POST to `snapmark-license.61960005.workers.dev/verify`; transmits only the license key string.

### Who is this for?
Developers who value privacy and want full ownership of their editor configuration—especially those working with sensitive project paths, internal tooling configs, or API keys stored in user settings.

### License
MIT licensed. Free tier available indefinitely. Pro is a $7 one-time purchase via Paddle.

---

## Viral hook (for social media)
> "Your settings, your control. Sync VS Code config without touching the cloud. 🧊 AES-256 encrypted, zero telemetry. Grab it free on the VS Code Marketplace."

---

## X / Twitter post draft
🔒 Your VS Code settings are probably sitting in a public GitHub Gist right now.  
StyleSync encrypts them locally with AES-256 — no cloud, no Gist, no leak risk.  
Export/import as a ZIP you control. Free on the marketplace.  

https://marketplace.visualstudio.com/items?itemName=LxStudio.stylesync-lx  
#VSCode #DevTools #Privacy

---

## LinkedIn post draft
Tired of risking your VS Code config on a GitHub Gist?  
I built StyleSync so developers can back up and restore their editor settings entirely locally—with AES-256 encryption and zero data leaving your machine.  
Works out of the box: export → save ZIP anywhere → import on the next machine.  
Free tier covers settings + keybindings. Pro ($7 lifetime) adds snippets and extensions.  
Check it out: https://marketplace.visualstudio.com/items?itemName=LxStudio.stylesync-lx
