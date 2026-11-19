// Encrypts the MarketMind prototype's content into the payload its page decrypts.
//
// Usage:  node tools/encrypt-demo.mjs <password>
//   Use the same password as the locked case studies, so one unlock opens both.
//
// Reads   nda-source/forecasting-demo/data.json   every question, result, player and line of product copy
// Writes  site/forecasting-demo/payload.json      { v, kdf, iter, salt, iv, data } — same scheme as encrypt-nda.mjs
//
// The page's code (app.js, gate.js, mm.css) is public; without the password it has nothing to show.
import { readFileSync, writeFileSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [, , password] = process.argv;
if (!password) {
  console.error('Usage: node tools/encrypt-demo.mjs <password>');
  process.exit(1);
}
const src = join(root, 'nda-source', 'forecasting-demo', 'data.json');
const data = readFileSync(src, 'utf8');
JSON.parse(data); // fail loudly on a broken file

const iter = 310000;
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const enc = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(data)));
const b64 = (u) => Buffer.from(u).toString('base64');
const out = join(root, 'site', 'forecasting-demo', 'payload.json');
writeFileSync(out, JSON.stringify({ v: 1, kdf: 'PBKDF2-SHA256', iter, salt: b64(salt), iv: b64(iv), data: b64(enc) }) + '\n');
console.log(`Encrypted the prototype into site/forecasting-demo/payload.json (${(data.length / 1024).toFixed(0)} KB of content)`);
