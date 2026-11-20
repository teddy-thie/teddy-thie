/* Ujira ID check · Day 10 personal concept by Ted Thie.
   Runs entirely in the browser: the camera is faked, and nothing is uploaded, stored or sent.
   Screens follow sections 6 and 7 of the Ujira Figma file (K1–K7, R1–R6). */
(() => {
  'use strict';
  const app = document.getElementById('app');
  const screensEl = document.getElementById('screens');
  const sheetEl = document.getElementById('sheet');
  const toastEl = document.getElementById('toast');
  const bannerEl = document.getElementById('banner');
  const demoEl = document.getElementById('demo');
  const device = document.getElementById('device');
  const conceptBar = document.querySelector('.concept');

  /* ---------- helpers ---------- */
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const T = ms => (REDUCED ? Math.round(ms * 0.6) : ms);

  const ICONS = {
    'chev-l': '<path d="M15 18l-6-6 6-6"/>', 'chev-r': '<path d="M9 18l6-6-6-6"/>',
    close: '<path d="M18 6L6 18M6 6l12 12"/>', check: '<path d="M20 6L9 17l-5-5"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M10 2h4"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>',
    bank: '<path d="M3 21h18M4 10h16M12 3l9 7H3z"/><path d="M6 10v11M10 10v11M14 10v11M18 10v11"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    camera: '<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.25" r="3.25"/>',
    face: '<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M9 10v.5M15 10v.5"/><path d="M9.5 15c.7.6 1.5.9 2.5.9s1.8-.3 2.5-.9"/>',
    idcard: '<rect x="3" y="6" width="18" height="12" rx="1"/><circle cx="8.5" cy="10.75" r="1.75"/><path d="M6 15.5c.6-1.2 1.5-1.8 2.5-1.8s1.9.6 2.5 1.8M14 10h4M14 13.5h3"/>',
    passport: '<rect x="5" y="3" width="13" height="18" rx="1"/><circle cx="11.5" cy="10" r="3"/><path d="M9 17h5"/>',
    alert: '<path d="M10.3 4.3L2.8 17.5A2 2 0 0 0 4.5 20.5h15a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z"/><path d="M12 9.5v4M12 17h.01"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.3-4.3L4 9M4 4v5h5M4 13a8 8 0 0 0 14.3 4.3L20 15M20 20v-5h-5"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7"/>',
    download: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19h14"/>',
    statement: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    invoice: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  };
  document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute" aria-hidden="true">${Object.entries(ICONS).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`).join('')}</svg>`);
  const ico = (name, cls = '') => `<svg class="ico ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const MARK = (size = 38) => `<svg class="appicon" width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true"><rect width="120" height="120" rx="28" fill="#1A73E8"/><path d="M34 26V64C34 78.36 45.64 90 60 90C74.36 90 86 78.36 86 64V26" fill="none" stroke="#fff" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/><circle cx="60" cy="61" r="13" fill="#2BC48A"/></svg>`;
  document.querySelector('.statusbar__icons').innerHTML = '<svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden="true"><rect y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" width="3" height="12" rx="1"/></svg><svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true"><path d="M8 2.5c2.3 0 4.4.9 6 2.4l1.1-1.2A10.2 10.2 0 0 0 8 .9 10.2 10.2 0 0 0 .9 3.7L2 4.9a8.6 8.6 0 0 1 6-2.4zm0 3.3c1.4 0 2.6.5 3.6 1.4l1.1-1.2A6.9 6.9 0 0 0 8 4.2c-1.8 0-3.5.7-4.7 1.8l1.1 1.2c1-.9 2.2-1.4 3.6-1.4zM8 9a2 2 0 0 0-1.4.6L8 11.1l1.4-1.5A2 2 0 0 0 8 9z"/></svg><svg width="27" height="13" viewBox="0 0 27 13" aria-hidden="true"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="20" height="9" rx="2" fill="currentColor"/><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2z" fill="currentColor" opacity=".5"/></svg>';

  /* ---------- demo data (all invented) ---------- */
  const ME = { name: 'WANJIRU KAMAU', born: '14 Mar 1994', idNo: '0000 0417', phone: '07•• ••• 123' };
  const DOCS = {
    id: { name: 'National ID', lower: 'national ID', kind: 'NATIONAL ID · SPECIMEN', sides: ['front', 'back'] },
    maisha: { name: 'Maisha card', lower: 'Maisha card', kind: 'MAISHA CARD · SPECIMEN', sides: ['front', 'back'] },
    passport: { name: 'Passport', lower: 'passport', kind: 'PASSPORT · SPECIMEN', sides: ['page'] },
  };
  const SIDE_TITLE = { front: 'Front of your ID', back: 'Back of your ID', page: 'Your photo page' };
  const REVIEW_TITLE = { front: 'Check the front', back: 'Check the back', page: 'Check the photo page' };

  /* ---------- state ---------- */
  // opts are the "Try it" choices. S is Wanjiru's progress through the check.
  const opts = { scenario: 'pass', passport: 'expired', mpesa: 'mine' };
  let S, nav, sheet = null;
  const events = [];
  const timers = new Set();
  let bgTimer = null;
  function later(fn, ms) { const t = setTimeout(() => { timers.delete(t); fn(); }, T(ms)); timers.add(t); return t; }
  function clearTimers() { timers.forEach(clearTimeout); timers.clear(); }

  function fresh() {
    return {
      stage: 'start',          // start · checking · waiting · review · notfinished · verified · done
      resume: null,            // where "Carry on" goes when the check needs another go
      doc: 'id',
      photos: {},              // accepted photos for the chosen ID, by side
      selfie: false,
      glareShown: false, selfieTries: 0, downShown: false,
      verifiedAt: null,
      number: opts.mpesa === 'other' ? '711000482' : '700000123',
      payout: null,            // mpesa · bank · later
      choice: 'another',
    };
  }
  function track(name, props = {}) {
    events.unshift({ name, props });
    events.length = Math.min(events.length, 6);
    // Analytics would go here. In the concept, events stay in the console and never include ID details.
    console.info('[Ujira ID event]', name, props);
    renderDemo();
  }

  /* ---------- navigation ---------- */
  const top = () => nav[nav.length - 1];
  function go(name, p = {}) { nav.push({ name, p }); render(true); }
  function swap(name, p = {}) { nav[nav.length - 1] = { name, p }; render(true); }
  function back() { if (nav.length > 1) nav.pop(); render(true); }
  function root(name, p = {}) { nav = [{ name, p }]; render(true); }

  function render(focus) {
    clearTimers();
    const t = top();
    const s = SCREENS[t.name](t.p);
    app.classList.toggle('is-dark', !!s.dark);
    app.classList.toggle('is-dark-bottom', !!s.dark);
    screensEl.innerHTML = `<div class="screen ${s.cls || ''} ${focus ? 'is-entering' : ''}" data-screen="${t.name}" tabindex="-1">${s.html}</div>`;
    const el = screensEl.firstElementChild;
    if (focus) { const h = el.querySelector('h1'); (h || el).setAttribute('tabindex', '-1'); (h || el).focus({ preventScroll: true }); }
    if (s.after) s.after(el);
    renderDemo();
  }

  let toastT;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2800); }
  function banner(title, body, to) {
    bannerEl.innerHTML = `<button type="button" class="banner" data-a="banner" data-to="${to}">${MARK(38)}<span><p class="t-em">${esc(title)}</p><p class="t-foot muted">${esc(body)}</p></span><span class="t-cap muted">now</span></button>`;
    bannerEl.querySelector('.banner').setAttribute('aria-label', `Notification: ${title}. ${body}. Open it.`);
    toast(title);
  }
  function clearBanner() { bannerEl.innerHTML = ''; }

  /* ---------- shared bits ---------- */
  const navbar = (title, close) => `<div class="navbar"><button type="button" class="icon-btn" data-a="${close ? 'leave' : 'back'}" aria-label="${close ? 'Close' : 'Back'}">${ico(close ? 'close' : 'chev-l')}</button><h1>${esc(title)}</h1></div>`;
  const pbar = n => `<div class="pbar" role="img" aria-label="Step ${n} of 4">${[1, 2, 3, 4].map(i => `<span class="${i < n ? 'done' : i === n ? 'now' : ''}"></span>`).join('')}</div>`;
  const intro = (step, title, sub) => `<div class="intro"><p class="t-caps">${step}</p><h2 class="t-title-m">${esc(title)}</h2>${sub ? `<p class="t-foot muted">${esc(sub)}</p>` : ''}</div>`;
  const camTop = (title, sub) => `<div class="cam-top"><button type="button" class="icon-btn icon-btn--hero" data-a="leave" aria-label="Close and keep your progress">${ico('close')}</button><div class="cam-top__titles"><h1>${esc(title)}</h1><p class="t-cap on-hero-muted">${esc(sub)}</p></div></div>`;
  const resultTop = (tone, icon, iconCls, title, sub) => `<div class="result-top result-top--${tone}"><button type="button" class="icon-btn close-tr" data-a="leave" aria-label="Close">${ico('close')}</button><span class="circle circle--white ${iconCls}">${ico(icon, 'ico--l')}</span><h1 class="t-title-m">${esc(title)}</h1><p class="t-foot muted">${esc(sub)}</p></div>`;
  const mini = (icon, circleCls, title, body, muted) => `<div class="mini"><span class="circle ${circleCls}">${ico(icon, 'ico--s')}</span><span><p class="t-em ${muted ? 'muted' : ''}">${esc(title)}</p>${body ? `<p class="t-foot muted">${esc(body)}</p>` : ''}</span></div>`;
  const docLabel = () => `${DOCS[S.doc].name} ending ${S.doc === 'passport' ? '482' : '0417'} (demo)`;
  const sidesFor = doc => DOCS[doc].sides;
  function nextAfterPhoto(side) {
    const sides = sidesFor(S.doc);
    const i = sides.indexOf(side);
    if (i < sides.length - 1) return go('capture', { side: sides[i + 1] });
    if (!S.selfie) return go('selfie');
    S.stage = 'checking';
    go('checking', { from: 0 });
  }
  function idCard(side) {
    const d = DOCS[S.doc];
    const demo = '<span class="tag tag--brand">DEMO</span>';
    if (side === 'back') {
      return `<div class="idcard" aria-label="Back of a specimen ${d.lower}, invented"><div class="idcard__top"><span class="t-caps">${d.kind} · BACK</span>${demo}</div>
        <dl><div><dt>Date of issue</dt><dd>${S.doc === 'maisha' ? '2 Oct 2024' : '2 Jun 2012'}</dd></div><div><dt>Place of issue</dt><dd>Nairobi (demo)</dd></div></dl>
        <p class="idcard__code">IDKEN0000417&lt;&lt;DEMO&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p></div>`;
    }
    const third = S.doc === 'passport' ? ['Expires', '3 Mar 2026'] : ['Born', ME.born];
    const second = S.doc === 'passport' ? ['Passport no.', 'AK000 0482'] : ['ID number', `${ME.idNo} (demo)`];
    return `<div class="idcard" aria-label="Specimen ${d.lower}, invented"><div class="idcard__top"><span class="t-caps">${d.kind}</span>${demo}</div>
      <div class="idcard__body"><span class="idcard__photo" aria-hidden="true"></span><dl><div><dt>Name</dt><dd>${ME.name}</dd></div><div><dt>${second[0]}</dt><dd>${second[1]}</dd></div><div><dt>${third[0]}</dt><dd>${third[1]}</dd></div></dl></div></div>`;
  }
  const passportExpired = () => S.doc === 'passport' && opts.passport === 'expired';

  /* ---------- screens ---------- */
  const SCREENS = {
    // Set-up hub: step 2 of 4 is the ID check, and it remembers where Wanjiru got to.
    setup() {
      const st = S.stage;
      const verified = st === 'verified' || st === 'done';
      const idRow = {
        start: ['brand', null, '2', 'A photo of your national ID, Maisha card or passport, then a selfie', ''],
        checking: ['tint', 'refresh', null, 'Checking · we’ll notify you when it’s done', ''],
        waiting: ['tint', 'refresh', null, 'Checking · we’ll notify you when it’s done', ''],
        review: ['warn', 'user', null, 'A person is checking · usually within 1 working day (demo)', ''],
        notfinished: ['warn', 'alert', null, { selfieAgain: 'Selfie needs another go · your ID photos are kept', down: 'The register was down · your photos are saved', expired: 'Passport expired · use your national ID or Maisha card' }[S.resume] || 'Not finished · carry on where you left off', ''],
        verified: ['green', 'check', null, `Checked · ${docLabel()}`, ''],
        done: ['green', 'check', null, `Checked · ${docLabel()}`, ''],
      }[st];
      const mpesaDone = st === 'done';
      const mpesaBody = mpesaDone ? (S.payout === 'mpesa' ? `${ME.phone} · ${ME.name}` : S.payout === 'bank' ? 'Withdrawals go to your bank for now' : 'Not set up yet · you can still invoice and get paid') : 'Must be registered in your name';
      let cta = '';
      if (st === 'start') cta = '<button type="button" class="btn btn--primary" data-a="go" data-to="before">Check my ID</button>';
      else if (st === 'notfinished') cta = '<button type="button" class="btn btn--primary" data-a="resume">Carry on with the ID check</button>';
      else if (st === 'verified') cta = '<button type="button" class="btn btn--primary" data-a="go" data-to="mpesa">Add my M-Pesa number</button>';
      else if (st === 'done') cta = '<button type="button" class="btn btn--primary" data-a="go" data-to="done">See what’s set up</button>';
      else cta = '<p class="t-foot muted" style="text-align:center;display:flex;gap:8px;justify-content:center">' + ico('bell', 'ico--s') + '<span>Nothing to do for now. We’ll notify you when it’s done.</span></p>';
      return { html: `${navbar('Set up')}
        <div class="pad stack">
          ${intro('STEP 2 OF 4', verified ? 'Your ID is checked' : 'Let’s check it’s you', verified ? 'Next, tell us where withdrawals should go.' : 'Licensed wallets in Kenya must confirm who holds each account. It takes about 2 minutes.')}
          ${pbar(mpesaDone ? 4 : verified ? 3 : 2)}
          <div class="card card--flush">
            <div class="srow"><span class="circle circle--green">${ico('check', 'ico--s')}</span><span class="grow"><p class="t-em">Phone number</p><p class="t-foot muted">${ME.phone} · confirmed</p></span></div>
            <div class="srow"><span class="circle circle--${idRow[0]}">${idRow[2] || ico(idRow[1], 'ico--s')}</span><span class="grow"><p class="t-em">Your ID</p><p class="t-foot ${st === 'notfinished' || st === 'review' ? 'warn' : 'muted'}">${esc(idRow[3])}</p></span></div>
            <div class="srow"><span class="circle ${mpesaDone ? 'circle--green' : verified ? 'circle--brand' : 'circle--grey'}">${mpesaDone ? ico('check', 'ico--s') : '3'}</span><span class="grow"><p class="t-em ${verified ? '' : 'muted'}">M-Pesa for withdrawals</p><p class="t-foot muted">${esc(mpesaBody)}</p></span></div>
            <div class="srow"><span class="circle circle--grey">4</span><span class="grow"><p class="t-em muted">How you sign in</p><p class="t-foot muted">Face ID or a passkey · not part of this demo</p></span></div>
          </div>
          <div class="card card--flush"><button type="button" class="listrow" data-a="go" data-to="data">${ico('shield')}<span class="grow"><p class="t-sub">Your ID data</p><p class="t-foot muted">What we hold, for how long, and deleting it</p></span>${ico('chev-r', 'ico--s chev')}</button></div>
        </div>
        <div class="actions">${cta}</div>` };
    },

    // K1 Before you start
    before() {
      const rows = [
        ['camera', 'What we take', 'Photos of your ID, a 3-second selfie video, and your name, date of birth and ID number as printed.'],
        ['shield', 'Why we ask', 'Kenyan law asks licensed wallets to confirm who holds each account before money can leave it.'],
        ['user', 'Who sees it', 'Ujira’s checks team and the company that runs the check for us (demo). Never your clients.'],
        ['timer', 'How long we keep it', 'Delete it any time until the check is done. Once you’re verified, the law says 7 years after you close your account.'],
      ];
      return { html: `${navbar('Your ID')}
        <div class="pad stack">
          ${intro('STEP 2 OF 4', 'Before you start', 'What the ID check takes, why we ask, and what happens to it afterwards.')}
          ${pbar(2)}
          <div class="card card--flush">${rows.map(([i, a, b]) => `<div class="srow"><span class="circle circle--tint">${ico(i, 'ico--s')}</span><span class="grow"><p class="t-em">${a}</p><p class="t-foot muted">${b}</p></span></div>`).join('')}</div>
          <p class="t-foot muted">All of this stays in Account › <button type="button" class="text-btn" data-a="go" data-to="data">Your ID data</button>, where you can download or delete it.</p>
        </div>
        <div class="actions"><button type="button" class="btn btn--primary" data-a="go" data-to="choose">Choose my ID</button></div>` };
    },

    // K2 Choose your ID
    choose() {
      const o = [['id', 'idcard', 'National ID', 'Front and back'], ['maisha', 'idcard', 'Maisha card', 'Front and back'], ['passport', 'passport', 'Passport', 'The photo page']];
      return { html: `${navbar('Your ID')}
        <div class="pad stack">
          ${intro('STEP 2 OF 4', 'Which ID do you have with you?', 'Any one of these works. You’ll photograph it, then take a short selfie.')}
          ${pbar(2)}
          <div class="stack" role="radiogroup" aria-label="Your ID" style="gap:10px">${o.map(([k, i, a, b]) => `<button type="button" class="opt" role="radio" aria-checked="${S.doc === k}" data-a="doc" data-doc="${k}"><span class="circle">${ico(i)}</span><span class="grow"><p class="t-em">${a}</p><p class="t-foot muted">${b}</p></span><span class="radio">${S.doc === k ? ico('check', 'ico--s') : ''}</span></button>`).join('')}</div>
          <div class="notice notice--brand">${ico('info')}<span>Take the card out of its sleeve. Plastic covers are the most common cause of glare.</span></div>
        </div>
        <div class="actions"><button type="button" class="btn btn--primary" data-a="start-capture">Continue</button></div>` };
    },

    // K3 The camera. Glare is caught before the photo is taken.
    capture({ side }) {
      const d = DOCS[S.doc];
      const lines = S.doc === 'passport' ? [[118, 50, 150], [118, 74, 110], [118, 106, 170], [22, 168, 285], [22, 186, 285]] : [[118, 60, 150], [118, 84, 110], [118, 116, 170], [118, 140, 130], [22, 24, 120]];
      const step = d.sides.length > 1 ? `Photo ${d.sides.indexOf(side) + 1} of 2 · ${d.name}` : `${d.name} · step 2 of 4`;
      return { dark: true, cls: 'screen--cam', html: `${camTop(SIDE_TITLE[side], step)}
        <p class="cam-hint t-sub on-hero-muted">Place your ${esc(d.lower)} inside the frame</p>
        <div class="vf ${S.doc === 'passport' ? 'vf--passport' : ''}" id="vf" aria-hidden="true"><span class="vf__photo"></span>${lines.map(([x, y, w]) => `<span class="vf__line" style="left:${x}px;top:${y}px;width:${w}px"></span>`).join('')}<span class="vf__demo">DEMO</span><span class="vf__glare"></span></div>
        <p class="cam-status" id="cam-status" role="status" aria-live="polite">${ico('camera', 'ico--s')}<span>Looking for your ID…</span></p>
        <div class="cam-tips" id="cam-tips"><span data-tip="light" class="is-off">${ico('check', 'ico--s')}Good light</span><span data-tip="glare" class="is-off">${ico('check', 'ico--s')}No glare</span><span data-tip="corners" class="is-off">${ico('check', 'ico--s')}All 4 corners</span></div>
        <button type="button" class="shutter" id="shutter" data-a="shutter" aria-label="Take the photo" disabled></button>
        <p class="cam-foot t-cap on-hero-muted" id="cam-foot">Takes the photo by itself when it’s sharp</p>`,
        after: el => {
          const vf = el.querySelector('#vf'), status = el.querySelector('#cam-status'), shutter = el.querySelector('#shutter'), foot = el.querySelector('#cam-foot');
          const tip = (k, on, warn) => { const t = el.querySelector(`[data-tip="${k}"]`); t.classList.toggle('is-off', !on && !warn); t.classList.toggle('is-warn', !!warn); t.innerHTML = `${ico(warn ? 'alert' : 'check', 'ico--s')}${k === 'glare' ? (warn ? 'Glare' : 'No glare') : k === 'light' ? 'Good light' : 'All 4 corners'}`; };
          const set = (cls, icon, text) => { status.className = `cam-status ${cls}`; status.innerHTML = `${ico(icon, 'ico--s')}<span>${esc(text)}</span>`; };
          const found = () => {
            vf.classList.remove('is-glare'); vf.classList.add('is-found');
            set('cam-status--pos', 'check', 'ID found. Hold still'); tip('light', true); tip('glare', true); tip('corners', true);
            shutter.disabled = false; foot.textContent = 'Taking the photo…';
            later(() => capture(side), 1200);
          };
          later(() => {
            tip('light', true); tip('corners', true);
            if (opts.scenario === 'glare' && !S.glareShown && side !== 'back') {
              S.glareShown = true; track('glare_caught', { side });
              vf.classList.add('is-glare'); set('cam-status--warn', 'alert', 'Glare on the card. Tilt it away from the light'); tip('glare', false, true);
              foot.textContent = 'Takes the photo once the glare is gone';
              later(found, 2600);
            } else found();
          }, 900);
        } };
    },

    // K4 Check the photo, with what was read from it
    review({ side }) {
      const d = DOCS[S.doc];
      const expired = passportExpired();
      let rows = [];
      if (side === 'back') rows = [['Date of issue', S.doc === 'maisha' ? '2 Oct 2024' : '2 Jun 2012'], ['Place of issue', 'Nairobi (demo)']];
      else if (S.doc === 'passport') rows = [['Name', ME.name], ['Passport no.', 'AK000 0482 (demo)'], ['Expires', expired ? '3 Mar 2026 · expired' : '3 Mar 2031', expired]];
      else rows = [['Name', ME.name], ['ID number', `${ME.idNo} (demo)`], ['Date of birth', ME.born]];
      const step = d.sides.length > 1 ? `Photo ${d.sides.indexOf(side) + 1} of 2 · ${d.name}` : d.name;
      return { dark: true, cls: 'screen--cam', html: `${camTop(REVIEW_TITLE[side], step)}
        ${idCard(side)}
        <div class="review-q"><p class="t-head on-hero">Can you read every word?</p><p class="t-foot on-hero-muted">Check the name, the number and all four corners. This is what we read from it:</p></div>
        <dl class="readout">${rows.map(([a, b, w]) => `<div class="${w ? 'is-warn' : ''}"><dt>${a}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>
        <div class="cam-actions"><button type="button" class="btn btn--primary" data-a="accept" data-side="${side}">Use this photo</button><button type="button" class="btn btn--secondary" data-a="retake" data-side="${side}">Retake</button></div>` };
    },

    // R2 Expired passport, caught before the selfie
    expired() {
      return { html: `${resultTop('warn', 'passport', 'warn', 'This passport has expired', 'Expired 3 Mar 2026 · passport ending 482 (demo)')}
        <div class="details"><div class="card card--shadow">
          <p class="t-caps muted">What happened</p>
          <p class="t-sub">We can only accept an ID that’s still in date. Your national ID or Maisha card will do.</p>
          <div class="divider" style="margin:0"></div>
          ${mini('check', 'circle--green', 'Caught before the selfie', 'You haven’t lost any steps')}
        </div></div>
        <p class="t-foot muted below" style="text-align:center">Renewing it? Come back any time. Nothing else is held from this attempt.</p>
        <div class="actions" style="padding-top:24px"><button type="button" class="btn btn--primary" data-a="switch-doc" data-doc="id">Use my national ID</button><button type="button" class="btn btn--secondary" data-a="switch-doc" data-doc="maisha">Use my Maisha card</button></div>` };
    },

    // K5 Selfie: a short video, so a printed photo can't pass
    selfie() {
      return { dark: true, cls: 'screen--cam', html: `${camTop('A short selfie', 'Step 2 of 4')}
        <div class="face" id="face" aria-hidden="true"><svg viewBox="0 0 256 316"><ellipse class="face__oval" cx="128" cy="158" rx="120" ry="150"/><path class="face__ring" id="ring" d="M128 4A124 154 0 1 1 128 312A124 154 0 1 1 128 4" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/></svg><span class="face__icon">${ico('face')}</span></div>
        <p class="cam-pill" id="pill" role="status" aria-live="polite">${ico('face', 'ico--s')}<span>Look straight at the camera</span></p>
        <p class="cam-sub t-foot on-hero-muted" id="pill-sub">Then turn your head left and right. About 3 seconds in all.</p>
        <div class="cam-tips"><span>${ico('check', 'ico--s')}Face uncovered</span><span>${ico('check', 'ico--s')}Even light</span><span>${ico('check', 'ico--s')}Eyes open</span></div>
        <p class="cam-foot t-cap on-hero-muted" style="margin-top:auto;display:flex;gap:8px;justify-content:center;align-items:center">${ico('shield', 'ico--s')}<span>A short video, not a photo, so a printed picture of you can’t pass for you.</span></p>`,
        after: el => {
          const ring = el.querySelector('#ring'), pill = el.querySelector('#pill'), face = el.querySelector('#face'), sub = el.querySelector('#pill-sub');
          const say = (icon, text) => { pill.innerHTML = `${ico(icon, 'ico--s')}<span>${esc(text)}</span>`; };
          later(() => { face.className = 'face is-left'; say('refresh', 'Turn your head slowly to the left'); ring.style.strokeDashoffset = '62'; }, 1000);
          later(() => { face.className = 'face is-right'; say('refresh', 'Now slowly to the right'); ring.style.strokeDashoffset = '24'; }, 2300);
          later(() => { face.className = 'face'; ring.style.strokeDashoffset = '0'; pill.classList.add('is-done'); say('check', 'Got it'); sub.textContent = 'Checking it with your ID photo next'; }, 3600);
          later(() => { S.selfie = true; track('selfie_done', { tries: S.selfieTries + 1 }); S.stage = 'checking'; const from = S.photosDoneForSelfieRetry ? 3 : 0; S.photosDoneForSelfieRetry = false; swap('checking', { from }); }, 4400);
        } };
    },

    // K6 Checking: an honest wait, step by step
    checking({ from = 0 }) {
      const steps = [
        ['camera', 'Photos are sharp', 'Front, back and the selfie'],
        ['statement', 'Details read from your ID', `${ME.name} · born ${ME.born}`],
        ['refresh', 'Checking the government register', 'In progress'],
        ['face', 'Matching your selfie', 'To your ID photo'],
      ];
      return { html: `${resultTop('brand', 'timer', 'link', 'Checking your ID', 'Usually under 2 minutes · started 10:42')}
        <div class="details"><div class="card card--shadow" id="steps"><p class="t-caps muted">Where it’s up to</p>
          ${steps.map(([i, a, b], k) => `<div class="check-step ${k < from ? 'is-done' : k === from ? 'is-now' : 'is-next'}" data-k="${k}"><span class="circle">${ico(k < from ? 'check' : k === from ? 'refresh' : i, `ico--s ${k === from ? 'spin' : ''}`)}</span><span><p class="t-em">${a}</p><p class="t-foot muted">${k === from ? 'In progress' : k < from ? b : k === 3 ? 'To your ID photo · next' : b}</p></span></div>`).join('')}
        </div></div>
        <div class="notice notice--brand below">${ico('bell')}<span>You can close Ujira. We’ll send a notification as soon as it’s done.</span></div>
        <div class="actions" style="margin-top:auto;padding-top:20px"><button type="button" class="btn btn--secondary" data-a="notify-me">Close and notify me</button></div>`,
        cls: 'screen--flat',
        after: el => {
          const box = el.querySelector('#steps');
          const mark = (k, state) => {
            const row = box.querySelector(`[data-k="${k}"]`); if (!row) return;
            row.className = `check-step is-${state}`;
            row.querySelector('.circle').innerHTML = ico(state === 'done' ? 'check' : 'refresh', `ico--s ${state === 'now' ? 'spin' : ''}`);
            row.querySelector('.t-foot').textContent = state === 'now' ? 'In progress' : steps[k][2];
          };
          const step = k => {
            if (k > 3) { later(() => finish('pass'), 500); return; }
            mark(k, 'now');
            const stop = stopAt(k);
            later(() => { if (stop) { finish(stop); return; } mark(k, 'done'); step(k + 1); }, k === 2 ? 1500 : 1100);
          };
          step(from);
        } };
    },

    // K7 Verified
    verified() {
      return { html: `${resultTop('green', 'check', 'pos', 'You’re verified', `Checked 20 Nov 2026 · ${S.verifiedAt || '10:43'}`)}
        <div class="details"><div class="card card--shadow">
          <p class="t-caps muted">What we checked</p>
          ${mini('check', 'circle--green', 'Your ID is genuine and in date', docLabel())}
          ${mini('check', 'circle--green', 'Your selfie matches your ID photo')}
          <div class="divider" style="margin:0"></div>
          ${mini('user', 'circle--tint', `Your account is in the name ${ME.name}`, 'Withdrawals can only go to accounts in this name')}
        </div></div>
        <div class="mini below"><span class="circle circle--brand">3</span><span><p class="t-em">Next: M-Pesa for withdrawals</p><p class="t-foot muted">Step 3 of 4 · must be registered in your name</p></span></div>
        <div class="actions" style="padding-top:24px"><button type="button" class="btn btn--primary" data-a="go-root" data-to="mpesa">Add my M-Pesa number</button></div>` };
    },

    // R1 A person is checking
    person() {
      return { html: `${resultTop('warn', 'user', 'warn', 'A person is checking your ID', 'Usually within 1 working day (demo)')}
        <div class="details"><div class="card card--shadow">
          <p class="t-caps muted">What happened</p>
          <p class="t-sub">Your ID photo is a few years old, so the automatic match wasn’t sure. Someone at Ujira will compare them by hand. You don’t need to redo anything.</p>
          <div class="divider" style="margin:0"></div>
          <p class="t-caps muted">While you wait</p>
          ${mini('check', 'circle--green', 'Send invoices and get paid')}
          ${mini('check', 'circle--green', 'Hold your dollars')}
          ${mini('timer', 'circle--grey', 'Withdrawals open once you’re verified', 'We’ll notify you', true)}
        </div></div>
        <div class="actions" style="padding-top:24px"><button type="button" class="btn btn--primary" data-a="toast" data-msg="Invoicing is in the main Ujira demo at tedthie.cc/lab/ujira">Send an invoice</button><button type="button" class="btn btn--secondary" data-a="wait-person">Done</button></div>` };
    },

    // R3 The selfie needs another go; the ID photos are kept
    selfieAgain() {
      const left = 2 - (S.selfieTries - 1);
      return { html: `${resultTop('warn', 'face', 'warn', 'Let’s take the selfie again', 'Your ID photos are fine and kept')}
        <div class="details"><div class="card card--shadow">
          <p class="t-caps muted">What happened</p>
          <p class="t-sub">The room was too dark to compare your face with your ID photo.</p>
          <div class="divider" style="margin:0"></div>
          <p class="t-caps muted">Before you try again</p>
          ${mini('info', 'circle--tint', 'Face a window or a lamp')}
          ${mini('user', 'circle--tint', 'Take off a cap or sunglasses')}
          ${mini('phone', 'circle--tint', 'Hold the phone at eye level')}
        </div></div>
        <p class="t-foot muted below" style="text-align:center">${left} ${left === 1 ? 'try' : 'tries'} left. After that, a person checks it instead.</p>
        <div class="actions" style="padding-top:16px"><button type="button" class="btn btn--primary" data-a="retake-selfie">Retake the selfie</button><button type="button" class="btn btn--secondary" data-a="ask-person">Ask a person to check</button></div>` };
    },

    // R4 The register isn't answering; nothing to redo
    down() {
      return { html: `${resultTop('brand', 'refresh', 'link', 'The ID register isn’t answering', 'Your photos are saved · 10:46')}
        <div class="details"><div class="card card--shadow">
          <p class="t-caps muted">What happened</p>
          <p class="t-sub">The government register we check against isn’t responding for anyone right now. It isn’t a problem with your ID.</p>
          <div class="divider" style="margin:0"></div>
          ${mini('check', 'circle--green', 'Nothing to redo', 'Your photos and selfie are saved')}
          ${mini('bell', 'circle--tint', 'We’ll keep trying', 'Every 15 minutes, and we’ll tell you when it’s done')}
        </div></div>
        <div class="actions" style="padding-top:24px"><button type="button" class="btn btn--primary" data-a="notify-me">OK, notify me</button><button type="button" class="btn btn--secondary" data-a="try-again">Try again now</button></div>` };
    },

    // Step 3 of 4, with R5 inline when the number is in someone else's name
    mpesa() {
      return { html: `${navbar('Set up')}
        <div class="pad stack">
          ${intro('STEP 3 OF 4', 'Where should withdrawals go?', 'We only send money to an M-Pesa number registered in your name.')}
          ${pbar(3)}
          <div class="field"><label for="tel">M-Pesa number</label><div class="tel"><span class="tel__cc">+254</span><input id="tel" type="tel" inputmode="numeric" autocomplete="off" value="${fmtTel(S.number)}" aria-describedby="namecheck"></div></div>
          <div id="namecheck" aria-live="polite"></div>
          <div id="mm-options"></div>
          <p class="t-foot muted" style="display:flex;gap:8px">${ico('info', 'ico--s')}<span>Sending only to your own name stops money reaching the wrong person if a number is mistyped.</span></p>
        </div>
        <div class="actions"><button type="button" class="btn btn--primary" id="mpesa-go" data-a="mpesa-go" disabled>Use this number</button></div>`,
        after: el => { const input = el.querySelector('#tel'); input.addEventListener('input', () => onTel(el, input)); lookup(el, false); } };
    },

    // Set up, with the outcome of every choice
    done() {
      const pay = S.payout === 'mpesa' ? mini('phone', 'circle--green', 'Withdrawals go to M-Pesa', `${ME.phone} · ${ME.name}`) : S.payout === 'bank' ? mini('bank', 'circle--green', 'Withdrawals go to your bank', 'An account in your name (demo)') : mini('timer', 'circle--grey', 'M-Pesa isn’t set up yet', 'You can still send invoices and get paid', true);
      return { html: `${resultTop('green', 'check', 'pos', 'You’re set up', 'Step 4, how you sign in, isn’t part of this demo')}
        <div class="details"><div class="card card--shadow">
          ${mini('check', 'circle--green', 'Your ID is checked', docLabel())}
          ${pay}
          ${mini('shield', 'circle--tint', 'Your ID data', 'Kept for 7 years after you close your account, as the law requires')}
        </div></div>
        <div class="actions" style="padding-top:24px"><button type="button" class="btn btn--primary" data-a="go" data-to="data">See your ID data</button><button type="button" class="btn btn--secondary" data-a="restart">Start again</button></div>` };
    },

    // R6 Your ID data: what's held, for how long, and a delete that works until you're verified
    data() {
      const verified = S.stage === 'verified' || S.stage === 'done';
      const held = [];
      const sides = Object.keys(S.photos).filter(k => S.photos[k]);
      if (sides.length) held.push(['camera', 'ID photos', `${DOCS[S.doc].name}, ${sides.map(s => (s === 'page' ? 'photo page' : s)).join(' and ')}`]);
      if (S.selfie) held.push(['face', 'Selfie video', '3 seconds, taken 20 Nov 2026']);
      if (sides.length) held.push(['idcard', 'Details read from your ID', S.doc === 'passport' ? 'Name, passport number and expiry date' : 'Name, date of birth and ID number']);
      const status = held.length === 0 ? ['neutral', 'Nothing held', 'You haven’t started the ID check'] : verified ? ['pos', 'Verified', `Checked 20 Nov 2026 · ${S.verifiedAt || '10:43'}`] : S.stage === 'review' ? ['warn', 'A person is checking', 'Usually within 1 working day (demo)'] : S.stage === 'notfinished' ? ['warn', 'Not finished', 'Needs another go · started 20 Nov'] : ['brand', 'In progress', 'Started 20 Nov 2026 · 10:42'];
      return { html: `${navbar('Your ID data')}
        <div class="pad stack">
          <div class="card" style="display:flex;align-items:center;gap:12px"><span style="flex:1"><p class="t-em">ID check</p><p class="t-foot muted">${esc(status[2])}</p></span><span class="tag tag--${status[0]}">${status[1]}</span></div>
          <p class="t-caps muted" style="padding-top:4px">What we hold</p>
          <div class="card card--flush">${held.length ? held.map(([i, a, b]) => `<div class="held"><span class="circle">${ico(i, 'ico--s')}</span><span><p class="t-em">${a}</p><p class="t-foot muted">${esc(b)}</p></span></div>`).join('') : '<div class="held"><span class="circle">' + ico('shield', 'ico--s') + '</span><span><p class="t-em">Nothing yet</p><p class="t-foot muted">Photos and the selfie appear here once you take them</p></span></div>'}</div>
          <div class="notice notice--brand">${ico('timer')}<span>${verified ? 'You’re verified, so the law says we keep this for 7 years after you close your account. Then it’s deleted.' : 'Until you finish the check or delete it. Once you’re verified, the law says we keep it for 7 years after you close your account.'}</span></div>
          <p class="t-foot muted">Only Ujira’s checks team and the company that runs the check for us (demo) can see it. Never your clients.</p>
        </div>
        <div class="actions">${held.length ? '<button type="button" class="btn btn--secondary" data-a="toast" data-msg="A copy of your ID data would download here. This demo stores nothing to copy.">' + ico('download') + 'Download a copy</button>' : ''}${held.length && !verified ? `<button type="button" class="btn btn--danger" data-a="ask-delete">${ico('trash')}Delete my ID photos and stop</button>` : ''}${!held.length ? '<button type="button" class="btn btn--primary" data-a="go-root" data-to="setup">Back to set up</button>' : ''}</div>` };
    },
  };

  /* ---------- the check's outcomes ---------- */
  // Where the automatic check stops, given the "Try it" choice. Each stop keeps what already worked.
  function stopAt(k) {
    if (k === 2 && opts.scenario === 'down' && !S.downShown) return 'down';
    if (k === 3 && opts.scenario === 'review') return 'review';
    if (k === 3 && opts.scenario === 'dark' && S.selfieTries === 0) return 'dark';
    return null;
  }
  function finish(outcome) {
    if (outcome === 'pass') { S.stage = 'verified'; S.verifiedAt = '10:43'; track('check_passed', { doc: S.doc }); swap('verified'); return; }
    if (outcome === 'down') { S.downShown = true; S.stage = 'notfinished'; S.resume = 'down'; track('register_down'); swap('down'); return; }
    if (outcome === 'review') { S.stage = 'review'; track('check_needs_person'); swap('person'); return; }
    if (outcome === 'dark') { S.selfieTries = 1; S.selfie = false; S.stage = 'notfinished'; S.resume = 'selfieAgain'; track('selfie_retry_needed'); swap('selfieAgain'); }
  }
  // Leaving mid-check: the outcome still arrives, as a notification.
  function notifyLater(ms) {
    clearTimeout(bgTimer);
    bgTimer = setTimeout(() => {
      if (opts.scenario === 'review' && (S.stage === 'checking' || S.stage === 'waiting')) { S.stage = 'review'; banner('A person is checking your ID', 'Usually within 1 working day (demo)', 'person'); }
      else if (opts.scenario === 'dark' && S.selfieTries === 0) { finishQuiet('dark'); banner('Your selfie needs another go', 'Your ID photos are kept', 'selfieAgain'); }
      else { S.stage = 'verified'; S.verifiedAt = '10:47'; track('check_passed', { doc: S.doc, notified: true }); banner('You’re verified', 'Add your M-Pesa number next', 'verified'); }
      if (top().name === 'setup') render();
    }, T(ms));
  }
  function waitPerson() {
    root('setup');
    clearTimeout(bgTimer);
    bgTimer = setTimeout(() => { S.stage = 'verified'; S.verifiedAt = '11:20'; track('check_passed', { by: 'person' }); banner('You’re verified', 'A person at Ujira checked your ID', 'verified'); if (top().name === 'setup') render(); }, T(5000));
    toast('We’ll notify you when a person has checked it');
  }
  function finishQuiet(outcome) { if (outcome === 'dark') { S.selfieTries = 1; S.selfie = false; S.stage = 'notfinished'; S.resume = 'selfieAgain'; track('selfie_retry_needed'); } }

  function capture(side) {
    S.photos[side] = false;
    track('photo_taken', { side });
    swap('review', { side });
  }

  /* ---------- M-Pesa number ---------- */
  const digits = v => v.replace(/\D/g, '').slice(0, 9);
  const fmtTel = d => [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9)].filter(Boolean).join(' ');
  let lookupT;
  function onTel(el, input) {
    const d = digits(input.value);
    const pos = input.selectionStart; const before = input.value.length;
    input.value = fmtTel(d);
    try { input.setSelectionRange(pos + (input.value.length - before), pos + (input.value.length - before)); } catch (e) { /* not focused */ }
    S.number = d;
    lookup(el, true);
  }
  function lookup(el, typed) {
    const box = el.querySelector('#namecheck'), optsEl = el.querySelector('#mm-options'), btn = el.querySelector('#mpesa-go');
    clearTimeout(lookupT);
    btn.disabled = true; btn.dataset.a = 'mpesa-go'; btn.textContent = 'Use this number';
    optsEl.innerHTML = '';
    if (S.number.length < 9) { box.innerHTML = ''; return; }
    box.innerHTML = `<div class="namecheck namecheck--wait"><span class="circle circle--grey">${ico('refresh', 'ico--s spin')}</span><span><p class="t-em">Checking the name on this number…</p></span></div>`;
    lookupT = setTimeout(() => {
      const other = S.number === '711000482';
      if (!other) {
        box.innerHTML = `<div class="namecheck namecheck--pos"><span class="circle circle--green">${ico('check', 'ico--s')}</span><span><p class="t-em">Registered to ${ME.name}</p><p class="t-foot pos">Matches the name on your ID</p></span></div>`;
        btn.disabled = false;
        return;
      }
      track('mpesa_name_mismatch');
      box.innerHTML = `<div class="namecheck namecheck--warn"><span class="circle circle--white warn">${ico('alert', 'ico--s')}</span><span><p class="t-em">Registered to PETER MWANGI</p><p class="t-foot warn">Doesn’t match the name on your ID</p></span></div>`;
      const o = [['another', 'phone', 'Use another number', `One registered to ${ME.name}`], ['bank', 'bank', 'Withdraw to my bank instead', 'An account in your name'], ['later', 'timer', 'Set this up later', 'You can still invoice and get paid']];
      optsEl.innerHTML = `<p class="t-caps muted" style="margin:4px 0 8px">What would you like to do?</p><div class="stack" role="radiogroup" aria-label="What would you like to do?" style="gap:8px">${o.map(([k, i, a, b]) => `<button type="button" class="opt" role="radio" aria-checked="${S.choice === k}" data-a="mm-choice" data-c="${k}"><span class="circle">${ico(i)}</span><span class="grow"><p class="t-em">${a}</p><p class="t-foot muted">${b}</p></span><span class="radio">${S.choice === k ? ico('check', 'ico--s') : ''}</span></button>`).join('')}</div>`;
      btn.disabled = false; btn.dataset.a = 'mm-continue'; btn.textContent = 'Continue';
    }, T(typed ? 700 : 500));
  }

  /* ---------- sheet: delete confirmation ---------- */
  function openSheet() {
    sheet = true;
    clearTimeout(toastT); toastEl.classList.remove('is-on');
    sheetEl.hidden = false;
    sheetEl.innerHTML = `<div class="scrim is-entering" data-a="sheet-close"></div><div class="sheet is-entering" role="dialog" aria-modal="true" aria-labelledby="sheet-h">
      <span class="grabber" aria-hidden="true"></span>
      <div class="sheet__head"><h2 class="t-title-m" id="sheet-h" tabindex="-1">Delete your ID photos?</h2><button type="button" class="icon-btn icon-btn--subtle" data-a="sheet-close" aria-label="Close">${ico('close', 'ico--s')}</button></div>
      <p class="t-sub">This stops the ID check. Your ID photos, the selfie and the details we read are deleted. You can start again whenever you like.</p>
      <p class="t-foot muted">Until you’re verified, nothing has to be kept.</p>
      <div class="stack" style="gap:10px;padding-top:6px"><button type="button" class="btn btn--danger" data-a="do-delete">${ico('trash')}Delete and stop</button><button type="button" class="btn btn--secondary" data-a="sheet-close">Keep them</button></div>
    </div>`;
    sheetEl.querySelector('#sheet-h').focus();
  }
  function closeSheet() { sheet = null; sheetEl.hidden = true; sheetEl.innerHTML = ''; }

  /* ---------- actions ---------- */
  app.addEventListener('click', e => {
    const b = e.target.closest('[data-a]');
    if (!b || b.disabled) return;
    const a = b.dataset.a;
    if (a === 'back') back();
    else if (a === 'go') go(b.dataset.to);
    else if (a === 'go-root') { clearBanner(); root('setup'); if (b.dataset.to !== 'setup') go(b.dataset.to); }
    else if (a === 'toast') toast(b.dataset.msg);
    else if (a === 'leave') {
      const from = top().name;
      if (from === 'checking') { S.stage = 'waiting'; notifyLater(3500); root('setup'); toast('Still checking. We’ll notify you when it’s done.'); }
      else if (from === 'down') { S.stage = 'waiting'; notifyLater(4000); root('setup'); toast('We’ll keep trying and notify you'); }
      else if (from === 'person') waitPerson();
      else if (['capture', 'review', 'selfie'].includes(from)) {
        clearTimers();
        const any = Object.values(S.photos).some(Boolean) || S.selfie;
        if (any) { S.stage = 'notfinished'; S.resume = 'continue'; root('setup'); toast('Saved. Carry on whenever you’re ready.'); }
        else { root('setup'); toast('Stopped. No photos were kept.'); }
      }
      else root('setup');
    }
    else if (a === 'doc') { S.doc = b.dataset.doc; render(); app.querySelector(`[data-doc="${S.doc}"]`).focus(); }
    else if (a === 'start-capture') { S.photos = {}; S.glareShown = S.glareShown && opts.scenario === 'glare'; track('id_check_started', { doc: S.doc }); go('capture', { side: sidesFor(S.doc)[0] }); }
    else if (a === 'shutter') { clearTimers(); capture(top().p.side); }
    else if (a === 'retake') { track('photo_retaken', { side: b.dataset.side }); swap('capture', { side: b.dataset.side }); }
    else if (a === 'accept') {
      const side = b.dataset.side;
      if (side === 'page' && passportExpired()) { track('passport_expired'); S.photos = {}; S.stage = 'notfinished'; S.resume = 'expired'; swap('expired'); return; }
      S.photos[side] = true; track('photo_accepted', { side });
      nav.pop(); nextAfterPhoto(side);
    }
    else if (a === 'switch-doc') { S.doc = b.dataset.doc; S.photos = {}; S.stage = 'start'; track('id_type_changed', { doc: S.doc }); swap('capture', { side: sidesFor(S.doc)[0] }); }
    else if (a === 'notify-me') { S.stage = 'waiting'; notifyLater(opts.scenario === 'down' ? 4000 : 3500); root('setup'); toast('We’ll notify you when it’s done'); }
    else if (a === 'try-again') { S.stage = 'checking'; swap('checking', { from: 2 }); }
    else if (a === 'retake-selfie') { S.photosDoneForSelfieRetry = true; S.stage = 'checking'; swap('selfie'); }
    else if (a === 'ask-person') { S.stage = 'review'; track('person_check_asked'); swap('person'); }
    else if (a === 'wait-person') waitPerson();
    else if (a === 'resume') {
      const r = S.resume;
      if (r === 'selfieAgain' || r === 'down' || r === 'expired') go(r);
      else {
        const missing = sidesFor(S.doc).find(x => !S.photos[x]);
        if (missing) go('capture', { side: missing });
        else if (!S.selfie) go('selfie');
        else { S.stage = 'checking'; go('checking', { from: 0 }); }
      }
    }
    else if (a === 'banner') { const to = b.dataset.to; clearBanner(); root('setup'); if (to !== 'setup') go(to); }
    else if (a === 'mm-choice') {
      S.choice = b.dataset.c;
      app.querySelectorAll('[data-a="mm-choice"]').forEach(x => { const on = x.dataset.c === S.choice; x.setAttribute('aria-checked', String(on)); x.querySelector('.radio').innerHTML = on ? ico('check', 'ico--s') : ''; });
    }
    else if (a === 'mm-continue') {
      if (S.choice === 'another') { const input = app.querySelector('#tel'); input.value = ''; S.number = ''; lookup(app.querySelector('.screen'), true); input.focus(); toast('Type a number registered to you'); return; }
      S.payout = S.choice; S.stage = 'done'; track('payout_chosen', { to: S.choice }); swap('done');
    }
    else if (a === 'mpesa-go') { S.payout = 'mpesa'; S.stage = 'done'; track('payout_chosen', { to: 'mpesa' }); swap('done'); }
    else if (a === 'restart') { reset(); toast('Started again'); }
    else if (a === 'ask-delete') openSheet();
    else if (a === 'sheet-close') { closeSheet(); app.querySelector('[data-a="ask-delete"]')?.focus(); }
    else if (a === 'do-delete') {
      closeSheet(); clearTimeout(bgTimer);
      const keepDoc = S.doc; S = fresh(); S.doc = keepDoc;
      track('id_data_deleted');
      render(); toast('Deleted. Nothing about your ID is held now.');
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && sheet) closeSheet(); });

  /* ---------- reset ---------- */
  function reset() {
    clearTimers(); clearTimeout(bgTimer); clearBanner(); closeSheet();
    S = fresh();
    nav = [{ name: 'setup', p: {} }];
    render();
  }
  document.querySelector('[data-reset]').addEventListener('click', () => { opts.scenario = 'pass'; opts.passport = 'expired'; opts.mpesa = 'mine'; events.length = 0; reset(); toast('Demo reset'); });

  /* ---------- Try it panel ---------- */
  function renderDemo() {
    if (!S) return;
    const radio = (name, v, label, cur) => `<label class="demo__opt"><input type="radio" name="${name}" value="${v}" ${cur === v ? 'checked' : ''}><span>${label}</span></label>`;
    demoEl.innerHTML = `<h2 id="demo-title">Try it</h2><p>Everything runs in your browser, and the camera is pretend. Pick what happens, then go through the check.</p>
      <div class="demo__group"><h3>How the check goes</h3>
        ${radio('scenario', 'pass', 'It passes first time', opts.scenario)}${radio('scenario', 'glare', 'Glare on the card first', opts.scenario)}${radio('scenario', 'dark', 'The selfie is too dark the first time', opts.scenario)}${radio('scenario', 'review', 'A person needs to check it', opts.scenario)}${radio('scenario', 'down', 'The ID register is down', opts.scenario)}</div>
      <div class="demo__group"><h3>Wanjiru’s passport</h3>${radio('passport', 'expired', 'Expired in March (choose Passport to see it)', opts.passport)}${radio('passport', 'valid', 'In date', opts.passport)}</div>
      <div class="demo__group"><h3>Her M-Pesa number</h3>${radio('mpesa', 'mine', 'Registered in her name', opts.mpesa)}${radio('mpesa', 'other', 'Registered to someone else', opts.mpesa)}<p>Or type 711 000 482 on step 3.</p></div>
      <div class="demo__group"><div class="demo__btns"><button type="button" class="demo__btn" data-d="data">Open Your ID data</button><button type="button" class="demo__btn" data-d="restart">Start again</button></div></div>
      ${events.length ? `<div class="demo__group"><h3>Events this visit</h3><p>What analytics would record. They stay in the console and never include ID details.</p><ul class="demo__events">${events.map(ev => `<li>${esc(ev.name)}</li>`).join('')}</ul></div>` : ''}`;
  }
  demoEl.addEventListener('change', e => {
    const t = e.target;
    if (t.name === 'scenario') { opts.scenario = t.value; S.glareShown = false; S.downShown = false; if (S.stage !== 'notfinished') S.selfieTries = 0; }
    else if (t.name === 'passport') opts.passport = t.value;
    else if (t.name === 'mpesa') { opts.mpesa = t.value; S.number = t.value === 'other' ? '711000482' : '700000123'; if (top().name === 'mpesa') render(); }
  });
  demoEl.addEventListener('click', e => {
    const b = e.target.closest('[data-d]');
    if (!b) return;
    if (b.dataset.d === 'data') { closeSheet(); if (top().name !== 'data') go('data'); }
    else if (b.dataset.d === 'restart') { reset(); toast('Started again'); }
  });

  /* ---------- fit the phone to the window ---------- */
  function fit() {
    const bar = conceptBar.offsetHeight;
    document.documentElement.style.setProperty('--bar-h', bar + 'px');
    if (window.innerWidth <= 560) { device.style.removeProperty('--s'); return; }
    const s = Math.min(1, Math.max(0.62, (window.innerHeight - bar - 48) / 874));
    device.style.setProperty('--s', s.toFixed(3));
  }
  window.addEventListener('resize', fit);

  reset();
  fit();
})();
