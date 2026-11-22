'use strict';

const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const treeProvider = require('./lib/treeProvider');

// ---------------------------------------------------------------------------
// License / endpoint config
// ---------------------------------------------------------------------------

const DEFAULT_VERIFY_ENDPOINT = 'https://snapmark-license.463102527.workers.dev/verify';

function readCfg() {
  const c = vscode.workspace.getConfiguration('stylesync');
  return {
    verifyEndpoint: (c.get('verifyEndpoint') || '').trim() || DEFAULT_VERIFY_ENDPOINT,
    buyoutLink:     (c.get('buyoutLink') || '').trim(),
    encPassword:    (c.get('encPassword') || '').trim(),
  };
}

async function verifyLicense(endpoint, license) {
  try {
    const res = await fetch(endpoint, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license }),
    });
    const data = await res.json();
    return { ok: !!data.valid, error: data.valid ? '' : (data.error || 'License is not active.') };
  } catch (e) {
    return { ok: false, error: 'Could not reach license service: ' + String(e.message || e) };
  }
}

// ---------------------------------------------------------------------------
// Commands registration
// ---------------------------------------------------------------------------

function registerCommands(context) {
  const tree = new treeProvider.ConfigTreeProvider(context);
  context.subscriptions.push(vscode.window.registerTreeDataProvider('stylesync-tree', tree));

  // VS Code renders a tree view lazily: the panel shows a spinner until the provider fires
  // onDidChangeTreeData at least once *after* the view has mounted. Nothing else fires it for
  // this view, so the panel stayed blank on first open. The view may be created well after this
  // extension activates, so run the refresh command on a short timer for a few seconds — enough
  // for at least one refresh to land once the panel exists, and no cost after that.
  let refreshTicks = 0;
  const refreshTimer = setInterval(() => {
    void vscode.commands.executeCommand('stylesync.refreshTree');
    if (++refreshTicks >= 20) clearInterval(refreshTimer);
  }, 250);
  context.subscriptions.push({ dispose: () => clearInterval(refreshTimer) });

  // Refresh
  context.subscriptions.push(vscode.commands.registerCommand('stylesync.refreshTree', () => {
    tree.refresh();
  }));

  // Export — single file entry or all allowed types
  context.subscriptions.push(vscode.commands.registerCommand('stylesync.exportConfig', async (fileEntry) => {
    const cfg  = readCfg();
    const pro  = context.globalState.get('sv_pro', false);
    const paths = treeProvider.getConfigPaths();
    const all   = treeProvider.discoverFiles(paths).filter(f =>
      (pro ? treeProvider.PRO_CONFIG_TYPES : treeProvider.FREE_CONFIG_TYPES).includes(f.type)
    );

    if (!pro && all.length > treeProvider.MAX_FREE_COUNT) {
      vscode.window.showWarningMessage(
        `StyleSync: Free plan supports up to ${treeProvider.MAX_FREE_COUNT} config types. Upgrade to unlock unlimited configs → Ctrl+Shift+P → StyleSync: Upgrade to Pro`
      );
      return;
    }

    if (!cfg.buyoutLink) {
      vscode.window.showWarningMessage(
        'StyleSync: set stylesync.buyoutLink in settings before exporting.'
      );
      return;
    }

    const filesToExport = fileEntry ? [fileEntry] : all.slice(0, treeProvider.MAX_FREE_COUNT);
    if (!filesToExport.length) {
      vscode.window.showInformationMessage('StyleSync: no config files found to export.');
      return;
    }

    const password = cfg.encPassword || await vscode.window.showInputBox({
      prompt:       'Enter encryption password (AES-256)',
      placeHolder:  'Your strong password…',
      ignoreFocusOut: true,
      password:     true,
    });
    if (!password) return;

    try {
      const zipBuffer = await treeProvider.doExport(filesToExport, password);
      const saveUri = await vscode.window.showSaveDialog({
        filters:    { 'ZIP Archive': ['zip'] },
        defaultUri: vscode.Uri.file(`StyleSync_Export_${new Date().toISOString().slice(0, 10)}.zip`),
      });
      if (!saveUri) return;
      await vscode.workspace.fs.writeFile(saveUri, zipBuffer);
      vscode.window.showInformationMessage('StyleSync: config exported as encrypted ZIP.');
      tree.refresh();
    } catch (e) {
      vscode.window.showErrorMessage(`StyleSync: export failed — ${String(e.message || e)}`);
    }
  }));

  // Import from an existing encrypted ZIP
  context.subscriptions.push(vscode.commands.registerCommand('stylesync.importConfig', async () => {
    const openUri = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectMany:  false,
      filters:        { 'ZIP Archive': ['zip'] },
      title:          'Select StyleSync Encrypted ZIP',
    });
    if (!openUri || !openUri[0]) return;

    const password = await vscode.window.showInputBox({
      prompt:         'Enter decryption password',
      placeHolder:    'Password used during export',
      ignoreFocusOut: true,
      password:       true,
    });
    if (!password) return;

    try {
      const raw = await vscode.workspace.fs.readFile(openUri[0]);
      const results = await treeProvider.doImport(raw, password);
      // One line: VS Code notification pills are single-line and clip any "\n" in the body,
      // which truncated the per-file status the user most needs to see.
      const written = results.filter(r => r.status === 'ok').length;
      const flagged = results.filter(r => r.status !== 'ok').map(r => r.target).join(', ');
      let msg = `StyleSync: import complete — ${written}/${results.length} written`;
      if (flagged) msg += ` · conflict, review: ${flagged}`;
      vscode.window.showInformationMessage(msg);
      tree.refresh();
    } catch (e) {
      vscode.window.showErrorMessage(`StyleSync: import failed — ${String(e.message || e)}`);
    }
  }));

  // Upgrade to Pro (opens Paddle checkout)
  context.subscriptions.push(vscode.commands.registerCommand('stylesync.upgradeToPro', async () => {
    const cfg = readCfg();
    if (!cfg.buyoutLink) {
      vscode.window.showWarningMessage('StyleSync: set stylesync.buyoutLink in settings before upgrading.');
      return;
    }
    await vscode.env.openExternal(vscode.Uri.parse(cfg.buyoutLink));
  }));

  // Activate Pro with license key
  context.subscriptions.push(vscode.commands.registerCommand('stylesync.activatePro', async () => {
    const license = await vscode.window.showInputBox({
      prompt:         'Enter your StyleSync Pro license key',
      placeHolder:    'e.g. sv-xxxxxxxxxxxxxxxxxxxx',
      ignoreFocusOut: true,
    });
    if (!license) return;
    const cfg   = readCfg();
    const result = await verifyLicense(cfg.verifyEndpoint, license.trim());
    if (result.ok) {
      await context.globalState.update('sv_pro', true);
      await context.globalState.update('sv_license', license.trim());
      tree.refresh();
      vscode.window.showInformationMessage('StyleSync: Pro license active! Unlimited config types unlocked.');
    } else {
      vscode.window.showErrorMessage(`StyleSync: ${result.error || 'Invalid license key.'}`);
    }
  }));
}

// ---------------------------------------------------------------------------
// Extension lifecycle
// ---------------------------------------------------------------------------

function activate(context) {
  registerCommands(context);

  if (!context.globalState.get('sv_welcomed', false)) {
    context.globalState.update('sv_welcomed', true);
    vscode.window.showInformationMessage(
      'StyleSync installed! Open the StyleSync panel from the activity bar to list, export, and import your VS Code config as encrypted local ZIPs. No cloud required.'
    );
  }
}

function deactivate() {}

module.exports = { activate, deactivate };
