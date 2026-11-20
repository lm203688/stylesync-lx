'use strict';

const JSZip = require('./jszip.min');

/**
 * Build an encrypted ZIP buffer from an array of {name, content} objects.
 * @param {{name: string, content: Buffer|string}[]} files
 * @param {string} password
 * @returns {Promise<Buffer>} encrypted ZIP bytes [IV | encrypted(zip)]
 */
async function buildEncryptedZip(files, password) {
  const zip = new JSZip();
  for (const f of files) {
    zip.file(f.name, typeof f.content === 'string' ? f.content : f.content);
  }
  const compressed = await zip.generateAsync({ type: 'nodebuffer' });
  return require('./crypto').encrypt(compressed, password);
}

/**
 * Load an encrypted ZIP buffer and return a plain ZIP object.
 * @param {Buffer} encryptedData  [IV | encrypted(zip)]
 * @param {string} password
 * @returns {Promise<JSZip>}
 */
async function loadEncryptedZip(encryptedData, password) {
  const decrypted = require('./crypto').decrypt(encryptedData, password);
  return await JSZip.loadAsync(decrypted);
}

module.exports = { buildEncryptedZip, loadEncryptedZip };
