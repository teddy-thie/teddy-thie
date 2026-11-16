#!/usr/bin/env node
// Turns tokens.json into the data Figma needs: variables (with collections, modes, scopes and
// code syntax), effect styles for shadows, and the expected values the Figma parity check compares.
//
//   node tools/figma-tokens.mjs > figma-tokens.json
//
// Fluid tokens (clamp) get two modes, Desktop (1440px wide) and Mobile (390px wide), each holding
// the value the clamp() resolves to at that width. Leading and tracking are relative in CSS
// (a multiplier and em), and Figma variables only bind in pixels, so they are created as
// percentages for reference and applied through text styles instead of bound directly.
// Gradients and the 50% "round" radius have no Figma variable equivalent and are left out.

import { load } from './tokens-core.mjs';

export const WIDTHS = { Desktop: 1440, Mobile: 390 };
const px = v => parseFloat(String(v));
const fluidAt = (f, width) => Math.min(px(f.max), Math.max(px(f.min), Math.round(parseFloat(f.vw) * width) / 100));

function rgba(str) {
  const s = String(str).trim();
  if (s.startsWith('#')) {
    const h = s.slice(1);
    return { r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255, a: 1 };
  }
  const m = s.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/);
  if (!m) throw new Error(`Not a colour: ${s}`);
  return { r: +m[1] / 255, g: +m[2] / 255, b: +m[3] / 255, a: m[4] === undefined ? 1 : +m[4] };
}

const COLOR_SCOPES = {
  brand: ['ALL_FILLS', 'STROKE_COLOR'], surface: ['FRAME_FILL', 'SHAPE_FILL'], text: ['TEXT_FILL'],
  line: ['STROKE_COLOR'], fill: ['FRAME_FILL', 'SHAPE_FILL'], glow: ['FRAME_FILL', 'SHAPE_FILL'],
  status: ['TEXT_FILL', 'STROKE_COLOR'], presentation: ['FRAME_FILL', 'SHAPE_FILL'],
};
// Tokens used as text in one place and as a fill or border in another.
const COLOR_SCOPE_OVERRIDES = { ink: ['ALL_FILLS', 'STROKE_COLOR'], 'on-cobalt': ['ALL_FILLS', 'STROKE_COLOR'], paper: ['ALL_FILLS'], 'label-night-text': ['TEXT_FILL'], 'emr-teal': ['ALL_FILLS'] };

function parseShadow(css) {
  const layers = [];
  let depth = 0, cur = '';
  for (const ch of css) { if (ch === '(') depth++; if (ch === ')') depth--; if (ch === ',' && !depth) { layers.push(cur.trim()); cur = ''; } else cur += ch; }
  layers.push(cur.trim());
  return layers.map(l => {
    const inset = /^inset\s/.test(l);
    const colour = l.match(/rgba?\([^)]*\)|#[0-9a-f]{3,8}/i)[0];
    const nums = l.replace('inset', '').replace(colour, '').trim().split(/\s+/).map(px);
    const [x, y, blur = 0, spread = 0] = nums;
    return { type: inset ? 'INNER_SHADOW' : 'DROP_SHADOW', color: rgba(colour), offset: { x, y }, radius: blur, spread, visible: true, blendMode: 'NORMAL' };
  });
}

export function figmaData() {
  const tokens = load();
  const byPath = new Map(tokens.map(t => [t.path.join('.'), t]));
  const resolve = v => String(v).replace(/\{([^}]+)\}/g, (_, ref) => resolve(byPath.get(ref).value));
  const vars = [], effects = [], skipped = [];

  for (const t of tokens) {
    const [top, group, leaf] = [t.path[0], t.path[1], t.path[t.path.length - 1]];
    const base = { css: t.name, codeSyntax: `var(${t.name})`, description: t.description };
    if (top === 'color') {
      vars.push({ ...base, collection: 'Color', name: `${group}/${leaf}`, type: 'COLOR', values: { Value: rgba(t.value) }, scopes: COLOR_SCOPE_OVERRIDES[leaf] || COLOR_SCOPES[group] });
    } else if (top === 'font') {
      if (group === 'family') {
        vars.push({ ...base, collection: 'Typography', name: `family/${leaf}`, type: 'STRING', values: { Desktop: t.value.split(',')[0].replace(/'/g, '').trim(), Mobile: t.value.split(',')[0].replace(/'/g, '').trim() }, scopes: ['FONT_FAMILY'] });
      } else if (group === 'size') {
        vars.push({ ...base, collection: 'Typography', name: `size/${leaf}`, type: 'FLOAT', values: { Desktop: px(t.value), Mobile: px(t.value) }, scopes: ['FONT_SIZE'] });
      } else if (group === 'fluid') {
        vars.push({ ...base, collection: 'Typography', name: `fluid/${leaf}`, type: 'FLOAT', values: { Desktop: fluidAt(t.fluid, WIDTHS.Desktop), Mobile: fluidAt(t.fluid, WIDTHS.Mobile) }, scopes: ['FONT_SIZE'], description: `${t.description} · ${t.css}` });
      } else if (group === 'leading') {
        vars.push({ ...base, collection: 'Typography', name: `leading/${leaf}`, type: 'FLOAT', values: { Desktop: Math.round(t.value * 1000) / 10, Mobile: Math.round(t.value * 1000) / 10 }, scopes: [], description: `${t.description} · ${t.value} in CSS, as a percentage here; applied through text styles` });
      } else if (group === 'tracking') {
        const pct = Math.round(parseFloat(t.value) * 1000) / 10;
        vars.push({ ...base, collection: 'Typography', name: `tracking/${leaf}`, type: 'FLOAT', values: { Desktop: pct, Mobile: pct }, scopes: [], description: `${t.description} · ${t.value} in CSS, as a percentage here; applied through text styles` });
      } else if (group === 'weight') {
        vars.push({ ...base, collection: 'Typography', name: `weight/${leaf}`, type: 'FLOAT', values: { Desktop: t.value, Mobile: t.value }, scopes: ['FONT_WEIGHT'] });
      }
    } else if (top === 'space') {
      vars.push({ ...base, collection: 'Space', name: `space/${leaf}`, type: 'FLOAT', values: { Value: px(t.value) }, scopes: ['GAP'] });
    } else if (top === 'layout') {
      const vals = t.fluid ? { Desktop: fluidAt(t.fluid, WIDTHS.Desktop), Mobile: fluidAt(t.fluid, WIDTHS.Mobile) } : { Desktop: px(t.value), Mobile: px(t.value) };
      vars.push({ ...base, collection: 'Layout', name: `layout/${leaf}`, type: 'FLOAT', values: vals, scopes: ['GAP'], description: t.fluid ? `${t.description} · ${t.css}` : t.description });
    } else if (top === 'radius') {
      if (String(t.value).endsWith('%')) { skipped.push(`${t.name} (${t.value}: a percentage radius has no Figma variable; circles are ellipses there)`); continue; }
      vars.push({ ...base, collection: 'Radius', name: `radius/${leaf}`, type: 'FLOAT', values: { Value: px(t.value) }, scopes: ['CORNER_RADIUS'] });
    } else if (top === 'shadow') {
      effects.push({ name: `Shadow/${leaf}`, css: t.name, description: `${t.description} · ${t.name}`, effects: parseShadow(resolve(t.value)) });
    } else if (top === 'gradient') {
      skipped.push(`${t.name} (gradients have no Figma variable)`);
    }
  }
  const collections = {};
  for (const v of vars) collections[v.collection] = Object.keys(v.values);
  return { collections, vars, effects, skipped };
}

if (process.argv[1] && process.argv[1].endsWith('figma-tokens.mjs')) {
  process.stdout.write(JSON.stringify(figmaData(), null, 1));
}
