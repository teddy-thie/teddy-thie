// Encrypts one NDA case study from nda-source/ into its gate page in site/.
//
// Usage:  node tools/encrypt-nda.mjs <name> <password>
//   e.g.  node tools/encrypt-nda.mjs forecasting "my-new-password"
//
// Reads   nda-source/<name>/meta.json       { "title": "...", "page": "forecasting.html" }
//         nda-source/<name>/case-study.html  the readable case study (inner HTML of the page)
//         nda-source/<name>/img/*.webp|png|jpg (optional) referenced in the HTML as  asset:<file-stem>
// Writes  the encrypted payload into the <script id="nda-payload"> of site/<page>.
//
// Every NDA page should use the same password, so one unlock opens them all.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';
import { extname, basename, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [, , name, password] = process.argv;
if (!name || !password) {
  console.error('Usage: node tools/encrypt-nda.mjs <name> <password>');
  process.exit(1);
}
const src = join(root, 'nda-source', name);
const meta = JSON.parse(readFileSync(join(src, 'meta.json'), 'utf8'));
const html = readFileSync(join(src, 'case-study.html'), 'utf8');

const MIME = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml' };
const assets = {};
const imgDir = join(src, 'img');
if (existsSync(imgDir)) {
  for (const f of readdirSync(imgDir)) {
    const type = MIME[extname(f).toLowerCase()];
    if (!type) continue;
    assets[basename(f, extname(f))] = `data:${type};base64,${readFileSync(join(imgDir, f)).toString('base64')}`;
  }
}
// Fail loudly if the HTML points at an image that isn't there
const missing = [...new Set([...html.matchAll(/asset:([a-z0-9-]+)/g)].map((m) => m[1]))].filter((k) => !assets[k]);
if (missing.length) { console.error('Missing images in img/: ' + missing.join(', ')); process.exit(1); }

const doc = { title: meta.title, html };
if (Object.keys(assets).length) doc.assets = assets;

const iter = 310000;
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const data = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(doc))));
const b64 = (u) => Buffer.from(u).toString('base64');
const payload = JSON.stringify({ v: 1, kdf: 'PBKDF2-SHA256', iter, salt: b64(salt), iv: b64(iv), data: b64(data) });

const pagePath = join(root, 'site', meta.page);
const page = readFileSync(pagePath, 'utf8');
const re = /(<script type="application\/json" id="nda-payload">)[\s\S]*?(<\/script>)/;
if (!re.test(page)) { console.error(`No nda-payload script in ${meta.page}`); process.exit(1); }
writeFileSync(pagePath, page.replace(re, (_, a, b) => a + payload + b));
console.log(`Encrypted "${meta.title}" into site/${meta.page}: ${Object.keys(assets).length} images, ${(payload.length / 1024).toFixed(0)} KB payload`);
