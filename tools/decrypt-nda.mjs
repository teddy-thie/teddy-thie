// Decrypts an NDA page's payload back into readable source.
// Usage: node tools/decrypt-nda.mjs site/ten-brands.html <password> nda-source/ten-brands
// Writes <out>/doc.json ({title, html}) and <out>/case-study.html for reading.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';

const [, , page, password, out] = process.argv;
if (!page || !password || !out) {
  console.error('Usage: node tools/decrypt-nda.mjs <page.html> <password> <out-dir>');
  process.exit(1);
}
const html = readFileSync(page, 'utf8');
const m = html.match(/<script type="application\/json" id="nda-payload">([\s\S]*?)<\/script>/);
if (!m) throw new Error('No nda-payload found');
const p = JSON.parse(m[1]);
const b = (s) => Uint8Array.from(Buffer.from(s, 'base64'));
const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt: b(p.salt), iterations: p.iter, hash: 'SHA-256' },
  base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
const buf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b(p.iv) }, key, b(p.data));
const doc = JSON.parse(new TextDecoder().decode(buf));
mkdirSync(out, { recursive: true });
writeFileSync(`${out}/doc.json`, JSON.stringify(doc));
writeFileSync(`${out}/case-study.html`, doc.html);
console.log(`Decrypted "${doc.title}" → ${out} (${doc.html.length} chars of HTML)`);
