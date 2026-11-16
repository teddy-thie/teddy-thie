# Ted Thie — portfolio site (tedthie.cc)

> The profile intro lives in `README.md`. These are the notes for the website in `site/`.

A static site: plain HTML, two CSS files and one JavaScript file. Every design value (colour, type, spacing, radius, shadow) comes from `tokens.json`. `site/css/tokens.css` is generated from it and committed, so deploying still needs no build step and nothing to install.

```
teddy-thie/
  site/              ← the website. Cloudflare serves only this folder.
    index.html         Home (work grid)
    about.html         About
    kenyaemr.html      Case study, public
    alinkeo.html       Case study, public
    nishauri.html      Snapshot, public
    forecasting.html   Case study under NDA (password gate + encrypted content)
    ten-brands.html    Case study under NDA (password gate + encrypted content)
    hiring.html        Case study under NDA (password gate + encrypted content)
    trading-sim.html   Snapshot under NDA (password gate + encrypted content)
    pulse.html         Case study, private until launch (password gate + encrypted content)
    css/tokens.css     Generated from tokens.json. Don't edit by hand.
    css/site.css       All styles. Reads every value from tokens.css, never a raw one.
    js/site.js         Hero rotator, demos, steppers, NDA unlock, avatar eyes, cursor, footer snap
    assets/            Images, avatar, logo, favicon
    _headers           Security headers Cloudflare applies on deploy (not served)
  tokens.json        ← the single source for every design value
  tools/
    build-tokens.mjs   tokens.json  →  site/css/tokens.css
    check-tokens.mjs   fails if tokens drift, contrast drops below AA, or site.css uses a raw value
    tokens-core.mjs    shared by the token scripts
    figma-tokens.mjs   tokens.json  →  the variables and styles Figma needs
    figma-check.mjs    prints a Figma script that checks the design-system file against tokens.json
    encrypt-nda.mjs    nda-source/<name>  →  site/<page> (encrypted)
    decrypt-nda.mjs    site/<page>        →  readable copy, for recovery
  wrangler.jsonc     ← Cloudflare deploy config
  nda-source/        ← readable NDA case studies and their images. Never commit this.
    <name>/meta.json       title + which page in site/ it encrypts into
    <name>/case-study.html the readable case study
    <name>/img/            images, referenced in the HTML as asset:<file-name-without-extension>
  raw/               ← full-size Figma exports. Never commit this.
```

## Preview locally

```
npx serve site
```

Opening `site/index.html` straight from disk also works, but the avatar's eyes only follow the cursor when the site is served.

## Change a colour, size or spacing

Values live in `tokens.json`, never in `site.css`.

1. Edit the value in `tokens.json`.
2. `node tools/build-tokens.mjs` rewrites `site/css/tokens.css`.
3. `node tools/check-tokens.mjs` must pass before you commit. It fails when:
   - `tokens.css` is out of date with `tokens.json`,
   - a colour pair listed under `$extensions` → `cc.tedthie.contrast` drops below WCAG AA,
   - `site.css` uses `var(--name)` for a token that doesn't exist,
   - `site.css` writes a colour, font size, line height, letter spacing, weight, padding, margin, gap or radius as a raw value.

Two kinds of raw value are allowed, and the check lists them rather than failing:
- a layout-only value off the scale, marked `/* exempt: <reason> */` on its line;
- product demos between `/* tokens:skip-start */` and `/* tokens:skip-end */`, which recreate a client's own UI in its own palette.

### Keep Figma in step

The design-system Figma file holds the same tokens as variables.

- `node tools/figma-tokens.mjs > figma-tokens.json` produces the variables, modes and styles to load into Figma. Fluid sizes get two modes: Desktop (1440 wide) and Mobile (390 wide).
- `node tools/figma-check.mjs > /tmp/figma-check.js` prints a script to run in that file, through Claude's Figma connection or the Figma plugin console. It reports variables that are missing, extra or different, and any component layer using a raw value instead of a variable.

## Put it online

The site runs on Cloudflare as a Worker that serves the `site` folder (`wrangler.jsonc`). Every push or merge to `main` deploys to tedthie.cc in about a minute.

- Work on a branch, open a pull request, merge to `main`.
- Pull-request branches show a failing "Workers Builds" check because preview builds aren't set up. That doesn't affect production.
- `site/_headers` sets the security headers, including the content security policy. If you add a script, font or image from another site, allow it there or the browser will block it.

The `site` folder is still plain files, so it would also run on any static host if you ever move.

## The password

All five locked pages (forecasting, ten-brands, hiring, trading-sim, pulse) use the same password, so one unlock opens them all for the rest of the browser session. It isn't printed on your CV or stored anywhere in this folder; visitors email you for it. To change it, re-encrypt every locked case study with the new one:

```
for n in forecasting ten-brands hiring trading-sim pulse; do node tools/encrypt-nda.mjs $n "new-password"; done
```

Then send the new one to anyone who asks.

## Your CV

The "Resume" button on every page links to `resume.pdf`. Save your CV as `site/resume.pdf`, next to `index.html`, and commit it.

## Editing an NDA case study

Edit `nda-source/<name>/case-study.html` (or add images to its `img/` folder), then run the encrypt command above. The script stops if the HTML points at an image that isn't in `img/`.
