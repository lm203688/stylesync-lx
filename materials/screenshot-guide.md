# StyleSync Screenshot Mockup Guide

This document describes three mockup screenshots to generate for the VS Code Marketplace listing.
Use the VS Code UI at `vscode://` or take real screenshots from a test install.

## Screenshot 1: Main panel — Config file list
**What it shows:** The StyleSync activity-bar panel opened inside VS Code.  
**Visual elements:**
- Left side: VS Code explorer sidebar collapsed, showing the StyleSync icon (sync symbol) active in the activity bar.
- Right panel titled "Config Files" listing entries like:
  - `settings.json (12.4KB)` — type badge: `settings`
  - `keybindings.json (3.8KB)` — type badge: `keybindings`
- Top toolbar buttons: Export (↑), Import (↓), Upgrade to Pro.
- Status bar shows "Free plan · 2/3 types available".

**Caption text for alt-text:** *StyleSync panel showing the detected VS Code config files with sizes and file types.*

---

## Screenshot 2: Export dialog — Password prompt
**What it shows:** The VS Code input box asking for the AES-256 encryption password.  
**Visual elements:**
- Modal dialog overlay with title: "Enter encryption password (AES-256)".
- Input field with masked characters (dots/bullets).
- Cancel and OK buttons.
- Background shows the tree view dimmed.

**Caption text for alt-text:** *Password entry dialog for exporting an encrypted config ZIP.*

---

## Screenshot 3: Import result — Conflict notification
**What it shows:** A VS Code information message popup after importing a ZIP.  
**Visual elements:**
- Toast/notification banner at bottom-right: "StyleSync: import complete."
- Bullet list inside showing:
  - ✓ settings.json: written
  - ⚠ keybindings.json: conflict detected — review manually
- Dismiss button.

**Caption text for alt-text:** *Import result showing successful write and a conflict warning for an existing file.*

---

## Notes for generating images
- Run these commands to generate mockups programmatically using Pillow (Python):
  ```
  pip install Pillow
  python materials/generate_screenshots.py
  ```
- Or capture real screenshots from VS Code Insiders with the extension installed.
- Ensure all visible text is English-only (zero CJK characters).
