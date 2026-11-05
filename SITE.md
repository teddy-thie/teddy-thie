# Ted Thie — portfolio site (tedthie.cc)

> The profile intro lives in `README.md`. These are the notes for the website in `site/`.

A static site: plain HTML, one CSS file and one JavaScript file. No build step, nothing to install, so it can be hosted anywhere.

```
ted-thie-portfolio/
  site/              ← the website. Upload or deploy only this folder.
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
    css/site.css       All styles. Colours and fonts are tokens at the top.
    js/site.js         Hero rotator, demos, steppers, NDA unlock, avatar eyes, cursor
    assets/            Images, avatar, logo, favicon
  nda-source/        ← readable NDA case studies and their images. Never upload this.
    <name>/meta.json       title + which page in site/ it encrypts into
    <name>/case-study.html the readable case study
    <name>/img/            images, referenced in the HTML as asset:<file-name-without-extension>
  tools/
    encrypt-nda.mjs    nda-source/<name>  →  site/<page> (encrypted)
    decrypt-nda.mjs    site/<page>        →  readable copy, for recovery
  raw/               ← full-size Figma exports. Never upload this.
```

## Preview locally

```
npx serve site
```

Opening `site/index.html` straight from disk also works, but the avatar's eyes only follow the cursor when the site is served.

## Put it online

- **Netlify:** drag the `site` folder onto app.netlify.com/drop.
- **Vercel:** `npx vercel site`.
- **GitHub Pages:** deploy the `site` folder. Keep `nda-source/` and `raw/` out of the repo (see `.gitignore`).

## The password

All five locked pages (forecasting, ten-brands, hiring, trading-sim, pulse) use the same password, so one unlock opens them all for the rest of the browser session. It's the one printed on your CV; it isn't stored anywhere in this folder. To change it, re-encrypt every locked case study with the new one:

```
for n in forecasting ten-brands hiring trading-sim pulse; do node tools/encrypt-nda.mjs $n "new-password"; done
```

Then update your CV.

## Your CV

The "Resume" button on every page links to `resume.pdf`. Save your CV as `site/resume.pdf`, next to `index.html`, before you upload the `site` folder.

## Editing an NDA case study

Edit `nda-source/<name>/case-study.html` (or add images to its `img/` folder), then run the encrypt command above. The script stops if the HTML points at an image that isn't in `img/`.
