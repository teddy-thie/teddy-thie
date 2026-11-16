#!/usr/bin/env node
// Checks that the site's own styles use design tokens, not raw values.
//
//   node tools/check-tokens.mjs                 check
//
// It fails (exit 1) when:
//   - site/css/tokens.css is out of date with tokens.json
//   - a colour pair listed in tokens.json drops below its WCAG AA minimum
//   - site/css/site.css uses var(--name) for a token that doesn't exist
//   - a colour, font size, line height, letter spacing, font weight, padding, margin, gap or
//     border radius in site.css is written as a raw value instead of a token
// Two kinds of value are allowed and listed, not failed:
//   - product demos between /* tokens:skip-start */ and /* tokens:skip-end */ (they re-create a
//     client's own UI in its own palette)
//   - a declaration marked /* exempt: <reason> */, for layout-only values off the scale
// Relative units (em, %, vw in a clamp's middle value) and 0 are always allowed.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { load, buildOutputs } from './build-tokens.mjs';
import { contrastResults } from './tokens-core.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fileArg = process.argv.slice(2).find(a => !a.startsWith('--'));
const SITE_CSS = fileArg ? path.resolve(fileArg) : path.join(root, 'site/css/site.css');

// ---------- parse site.css into declarations, keeping line numbers and markers ----------
function parse(src) {
  const decls = [];
  let i = 0, line = 1, buf = '', bufLine = 1, exempt = null, skip = false, skipBlocks = 0;
  const stack = [];
  while (i < src.length) {
    if (src.startsWith('/*', i)) {
      const end = src.indexOf('*/', i + 2);
      const text = src.slice(i + 2, end).trim();
      if (text.startsWith('tokens:skip-start')) { skip = true; skipBlocks++; }
      else if (text.startsWith('tokens:skip-end')) skip = false;
      else if (text.startsWith('exempt:')) exempt = text.slice(7).trim();
      for (const ch of src.slice(i, end + 2)) if (ch === '\n') line++;
      i = end + 2;
      continue;
    }
    const c = src[i];
    if (c === '{') { stack.push(buf.trim()); buf = ''; exempt = null; }
    else if (c === ';' || c === '}') {
      const d = buf.trim();
      const inRule = stack.length && !stack[stack.length - 1].startsWith('@');
      if (d && inRule && d.includes(':')) {
        const k = d.indexOf(':');
        decls.push({ prop: d.slice(0, k).trim().toLowerCase(), value: d.slice(k + 1).trim(), line: bufLine, skip, exempt, selector: stack[stack.length - 1] });
      }
      if (c === '}') stack.pop();
      buf = ''; exempt = null;
    } else {
      if (!buf.trim() && c.trim()) bufLine = line;
      buf += c;
    }
    if (c === '\n') line++;
    i++;
  }
  return { decls, skipBlocks };
}

// ---------- rules ----------
const RAW_COLOUR = /#[0-9a-f]{3,8}\b|\b(rgba?|hsla?|oklch|lab|lch)\(/i;
const withoutVars = v => v.replace(/var\(--[\w-]+(?:\s*,[^()]*(?:\([^()]*\))?[^()]*)?\)/g, 'TOKEN');
const absLength = v => /(^|[^\w.-])-?\d*\.?\d+(px|rem)\b/.test(withoutVars(v).replace(/(^|[^\w.])-?0(px|rem)\b/g, ''));
const SPACE_PROP = /^(padding|margin)(-(top|right|bottom|left|inline|block)(-(start|end))?)?$|^(row-|column-)?gap$/;

function problem(d) {
  const v = d.value, bare = withoutVars(v);
  if (RAW_COLOUR.test(bare)) return 'raw colour';
  if (d.prop === 'font-size' && absLength(v)) return 'raw font size';
  if (d.prop === 'line-height' && /^-?\d*\.?\d+(px)?$/.test(bare)) return 'raw line height';
  if (d.prop === 'letter-spacing' && /\d/.test(bare) && bare !== '0') return 'raw letter spacing';
  if (d.prop === 'font-weight' && /^\d+$/.test(bare)) return 'raw font weight';
  if (SPACE_PROP.test(d.prop) && absLength(v)) return 'raw spacing';
  if (d.prop === 'border-radius' && (absLength(v) || /\d%/.test(bare))) return 'raw radius';
  return null;
}

// ---------- run ----------
const tokens = load();
const failures = [];
const notes = [];

const { files } = await buildOutputs(tokens);
const contrast = contrastResults(tokens);
const stale = files.filter(([f, content]) => { try { return readFileSync(f, 'utf8') !== content; } catch { return true; } }).map(([f]) => path.relative(root, f));
if (stale.length) failures.push(`Out of date with tokens.json: ${stale.join(', ')}. Run: node tools/build-tokens.mjs`);
const weakPairs = contrast.filter(r => !r.pass);

const src = readFileSync(SITE_CSS, 'utf8');
const { decls, skipBlocks } = parse(src);

// Every var(--x) without a fallback must be a token or a custom property defined somewhere in site.css.
const defined = new Set(tokens.map(t => t.name));
for (const d of decls) if (d.prop.startsWith('--')) defined.add(d.prop);
const undefinedRefs = [];
for (const d of decls) for (const m of d.value.matchAll(/var\((--[\w-]+)\s*([,)])/g)) {
  if (m[2] === ')' && !defined.has(m[1]) && !d.skip) undefinedRefs.push(`line ${d.line}: ${m[1]} is not defined (${d.prop})`);
}

const raw = [], exempted = [];
let demoRaw = 0;
for (const d of decls) {
  if (d.prop.startsWith('--') && !d.skip && RAW_COLOUR.test(withoutVars(d.value))) { raw.push({ ...d, why: 'raw colour in a custom property' }); continue; }
  const why = problem(d);
  if (!why) continue;
  if (d.skip) demoRaw++;
  else if (d.exempt) exempted.push(d);
  else raw.push({ ...d, why });
}

const lines = [];
const log = (...a) => { const s = a.join(' '); lines.push(...s.split('\n')); console.log(s); };
log(`Token check · ${path.relative(root, SITE_CSS)}\n`);
log(stale.length ? `  ✗ out of date: ${stale.join(', ')}` : `  ✓ tokens.css matches tokens.json (${tokens.length} tokens)`);
log(weakPairs.length ? `  ✗ ${weakPairs.length} colour pair(s) below WCAG AA` : `  ✓ all ${contrast.length} colour pairs meet WCAG AA (lowest ${Math.min(...contrast.map(r => r.ratio)).toFixed(2)}:1)`);
log(undefinedRefs.length ? `  ✗ ${undefinedRefs.length} var() reference(s) point at nothing` : '  ✓ every var() points at a defined token');
log(raw.length ? `  ✗ ${raw.length} raw value(s) in the site's own styles` : `  ✓ 0 raw values in the site's own styles (${decls.filter(d => !d.skip).length} declarations checked)`);
log(`  · ${exempted.length} layout exception(s), marked exempt`);
log(`  · ${skipBlocks} product-demo block(s) skipped (${demoRaw} raw values kept in clients' own palettes)`);

if (exempted.length) {
  log('\nLayout exceptions:');
  for (const d of exempted) log(`  line ${String(d.line).padStart(4)}  ${d.selector.replace(/\s+/g, ' ').slice(0, 40).padEnd(40)}  ${d.prop}: ${d.value.replace(/\s*\/\*.*?\*\//, '')}  (${d.exempt})`);
}
if (undefinedRefs.length) { log('\nUndefined references:'); for (const r of undefinedRefs) log('  ' + r); }
if (raw.length) {
  log('\nRaw values:');
  for (const d of raw) log(`  line ${String(d.line).padStart(4)}  ${d.why.padEnd(18)}  ${d.selector.replace(/\s+/g, ' ').slice(0, 40).padEnd(40)}  ${d.prop}: ${d.value}`);
}
if (weakPairs.length) { log('\nColour pairs below their minimum:'); for (const r of weakPairs) log(`  ${r.fg.name} on ${r.bg.name} (${r.use}): ${r.ratio.toFixed(2)}:1, needs ${r.min}`); }
for (const f of failures) log('\n' + f);
const failed = raw.length || undefinedRefs.length || failures.length || weakPairs.length;
process.exit(failed ? 1 : 0);
