'use strict';

const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FREE_CONFIG_TYPES = ['settings', 'keybindings', 'launch'];
const PRO_CONFIG_TYPES = ['settings', 'keybindings', 'launch', 'snippets', 'extensions'];
const MAX_FREE_COUNT = 3;

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

function getUserDataPath() {
  const env = process.env;
  if (process.platform === 'win32') {
    return path.join(env.APPDATA || '', 'Code', 'User');
  } else if (process.platform === 'darwin') {
    return path.join(env.HOME || '', 'Library', 'Application Support', 'Code', 'User');
  } else {
    return path.join(env.HOME || '', '.config', 'Code', 'User');
  }
}

function getConfigPaths() {
  const base = getUserDataPath();
  return {
    settings:   path.join(base, 'settings.json'),
    keybindings:path.join(base, 'keybindings.json'),
    launch:     path.join(base, 'launch.json'),
    snippetsDir:path.join(base, 'snippets'),
    extensions: path.join(base, 'extensions.json'),
  };
}

function formatSize(bytes) {
  if (bytes < 1024)        return bytes + 'B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
}

function keyToLabel(key) {
  const labels = {
    settings:   'settings.json',
    keybindings:'keybindings.json',
    launch:     'launch.json',
    extensions: 'extensions.json',
  };
  return labels[key] || key;
}

// ---------------------------------------------------------------------------
// Discover config files on disk
// ---------------------------------------------------------------------------

function discoverFiles(paths) {
  const entries = [];
  // Top-level known configs
  for (const [key, filePath] of Object.entries(paths)) {
    if (key === 'snippetsDir') continue; // handled separately below
    try {
      const stat = fs.statSync(filePath);
      if (!stat.isFile()) continue;
      const content = fs.readFileSync(filePath, 'utf8');
      entries.push({ id: key, name: keyToLabel(key), type: key, path: filePath, size: content.length });
    } catch (_) { /* skip missing files */ }
  }
  // Snippet .json files inside snippets/ dir
  try {
    const snippetFiles = fs.readdirSync(paths.snippetsDir);
    for (const f of snippetFiles) {
      if (!f.endsWith('.json')) continue;
      const filePath = path.join(paths.snippetsDir, f);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        entries.push({
          id: `snippet_${f}`,
          name: `Snippet: ${f.replace('.json', '')}`,
          type: 'snippets',
          path: filePath,
          size: content.length,
        });
      } catch (_) {}
    }
  } catch (_) {}
  return entries;
}

// ---------------------------------------------------------------------------
// Tree view provider
// ---------------------------------------------------------------------------

class ConfigTreeProvider {
  constructor(context) {
    this._context = context;
    this._onDidChangeTreeData = new vscode.EventEmitter();
  }

  get onDidChangeTreeData() { return this._onDidChangeTreeData.event; }
  refresh() { this._onDidChangeTreeData.fire(); }

  getTreeItem(element) {
    return element;
  }

  getChildren(/*element*/) {
    const pro = this._context.globalState.get('sv_pro', false);
    const allowedTypes = pro ? PRO_CONFIG_TYPES : FREE_CONFIG_TYPES;
    const paths = getConfigPaths();
    const files = discoverFiles(paths).filter(f => allowedTypes.includes(f.type));
    return files.map(f => ({
      id:         f.id,
      label:      `${f.name} (${formatSize(f.size)})`,
      description:f.type,
      tooltip:    `Type: ${f.type}\nPath: ${f.path}`,
      command:    { command: 'stylesync.exportConfig', title: 'Export', arguments: [f] },
      isPro:      pro,
    }));
  }
}

// ---------------------------------------------------------------------------
// Export: read local file and add to ZIP
// ---------------------------------------------------------------------------

async function exportOne(fileEntry, zip, password) {
  const data = fs.readFileSync(fileEntry.path);
  const enc = require('../lib/crypto').encrypt(data, password);
  zip.file(path.basename(fileEntry.path), enc);
}

async function doExport(files, password) {
  const JSZip = require('../lib/zip');
  return await JSZip.buildEncryptedZip(
    files.map(f => ({ name: path.basename(f.path), content: fs.readFileSync(f.path) })),
    password
  );
}

// ---------------------------------------------------------------------------
// Import: decrypt each entry and write to target location
// ---------------------------------------------------------------------------

async function doImport(zipBuffer, password) {
  const JSZip = require('../lib/zip');
  const zip = await JSZip.loadEncryptedZip(zipBuffer, password);
  const paths = getConfigPaths();
  const results = [];

  for (const [fileName, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    let targetPath = null;
    if (fileName === 'settings.json')              targetPath = paths.settings;
    else if (fileName === 'keybindings.json')       targetPath = paths.keybindings;
    else if (fileName === 'launch.json')            targetPath = paths.launch;
    else if (fileName === 'extensions.json')        targetPath = paths.extensions;
    else if (/\.code-snippets$/.test(fileName))    targetPath = path.join(paths.snippetsDir, fileName);
    else                                          targetPath = path.join(paths.snippetsDir, fileName); // best-effort

    const decBuf = await entry.async('nodebuffer');
    const exists = fs.existsSync(targetPath);
    if (exists) {
      results.push({ target: fileName, status: 'conflict' });
    } else {
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.writeFileSync(targetPath, decBuf);
      results.push({ target: fileName, status: 'ok' });
    }
  }
  return results;
}

module.exports = {
  FREE_CONFIG_TYPES, PRO_CONFIG_TYPES, MAX_FREE_COUNT,
  getConfigPaths, discoverFiles, formatSize,
  ConfigTreeProvider,
  doExport, doImport,
};
