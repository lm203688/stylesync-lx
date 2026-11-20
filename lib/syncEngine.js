'use strict';

const crypto = require('crypto');

/**
 * Derive an AES-256 key from a password string using scrypt with a fixed salt.
 */
function deriveKey(password) {
  return crypto.scryptSync(password, 'stylesync-salt-v1', 32);
}

/**
 * Encrypt plaintext Buffer → output Buffer[IV|ciphertext].
 * Uses AES-256-CBC + PKCS7 padding.
 */
function encrypt(plaintext, password) {
  const iv = crypto.randomBytes(16);
  const key = deriveKey(password);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return Buffer.concat([iv, encrypted]);
}

/**
 * Decrypt Buffer[IV|ciphertext] → original plaintext Buffer.
 */
function decrypt(data, password) {
  if (data.length < 17) throw new Error('Encrypted data too short');
  const iv = data.slice(0, 16);
  const ciphertext = data.slice(16);
  const key = deriveKey(password);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

module.exports = { encrypt, decrypt };
