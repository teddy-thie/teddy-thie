#!/usr/bin/env node
// Builds site/css/tokens.css from tokens.json, the single source for every design value on the site.
//
//   node tools/build-tokens.mjs           write it
//   node tools/build-tokens.mjs --check   exit 1 if it is out of date
//
// No dependencies. The generated file is committed, so the site still deploys without a build step.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ROOT as root, TOKENS_PATH, CSS_PATH, cssName, flatten, buildCss, load } from './tokens-core.mjs';

export { TOKENS_PATH, CSS_PATH, cssName, flatten, buildCss, load };

// Everything the build writes.
export async function buildOutputs(tokens = load()) {
  return { tokens, files: [[CSS_PATH, buildCss(tokens)]] };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { tokens, files } = await buildOutputs();
  const rel = f => path.relative(root, f);
  if (process.argv.includes('--check')) {
    const stale = files.filter(([f, content]) => { try { return readFileSync(f, 'utf8') !== content; } catch { return true; } });
    if (stale.length) { console.error(`Out of date: ${stale.map(([f]) => rel(f)).join(', ')}. Run: node tools/build-tokens.mjs`); process.exit(1); }
    console.log(`${files.map(([f]) => rel(f)).join(' and ')} is up to date (${tokens.length} tokens).`);
  } else {
    for (const [f, content] of files) writeFileSync(f, content);
    console.log(`Wrote ${files.map(([f]) => rel(f)).join(' and ')} from ${tokens.length} tokens.`);
  }
}
