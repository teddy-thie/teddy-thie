/* Ujira ID check · Day 10 personal concept by Ted Thie.
   Runs entirely in the browser: the camera is faked, and nothing is uploaded, stored or sent.
   Screens follow sections 6, 7 and 8 of the Ujira Figma file. */
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
  const ME = { account: 'Adrian Musungu', born: '9 Jul 1992', idNo: '0000 0417', phone: '07•• ••• 123' };
  // The name printed on the ID. The "different name" scenario drops the surname he uses on Ujira.
  const ID_NAMES = { full: 'ADRIAN WEKESA MUSUNGU', short: 'ADRIAN WEKESA' };
  const DOCS = {
    id: { name: 'National ID', lower: 'national ID', kind: 'NATIONAL ID · SPECIMEN', sides: ['front', 'back'] },
    maisha: { name: 'Maisha card', lower: 'Maisha card', kind: 'MAISHA CARD · SPECIMEN', sides: ['front', 'back'] },
    alien: { name: 'Alien ID', lower: 'alien ID', kind: 'ALIEN ID · SPECIMEN', sides: ['front', 'back'] },
    passport: { name: 'Passport', lower: 'passport', kind: 'PASSPORT · SPECIMEN', sides: ['page'] },
  };
  const SUPPORT = {
    affidavit: { name: 'Sworn affidavit', sub: 'Signed before a commissioner for oaths', kind: 'SWORN AFFIDAVIT' },
    deedpoll: { name: 'Deed poll', sub: 'If you changed your name', kind: 'DEED POLL' },
    birth: { name: 'Birth certificate', sub: 'If it shows both names', kind: 'BIRTH CERTIFICATE' },
  };
  const SIDE_TITLE = { front: 'Front of your ID', back: 'Back of your ID', page: 'Your photo page', support: 'Your name document' };
  const REVIEW_TITLE = { front: 'Check the front', back: 'Check the back', page: 'Check the photo page', support: 'Check the document' };
  // Live guidance while the camera looks at the card: [what to do, the tip it flags, what the footer says]
  const ISSUE = {
    far: ['Move closer. The card should fill the frame', null, 'Takes the photo once the card fills the frame'],
    blur: ['Hold still. The photo is blurry', 'sharp', 'Takes the photo once it’s sharp'],
    glare: ['Glare on the card. Tilt it away from the light', 'glare', 'Takes the photo once the glare is gone'],
    cut: ['Part of the card is outside the frame', 'corners', 'Takes the photo once all 4 corners show'],
  };
  const TIP = { light: ['Good light', 'Good light'], sharp: ['Sharp', 'Blurry'], glare: ['No glare', 'Glare'], corners: ['All 4 corners', 'Cut off'] };
  const ISSUE_NAME = { far: 'Too far', blur: 'Blurry', glare: 'Glare', cut: 'Cut off' };

  /* ---------- state ---------- */
  // opts are the "Try it" choices. S is Adrian's progress through the check.
  const DEFAULTS = { photo: 'sharp', scenario: 'pass', passport: 'expired', mpesa: 'mine' };
  const opts = { ...DEFAULTS };
  let S, nav, sheet = null;
  const log = [];
  const timers = new Set();
  let bgTimer = null;
  function later(fn, ms) { const t = setTimeout(() => { timers.delete(t); fn(); }, T(ms)); timers.add(t); return t; }
  function clearTimers() { timers.forEach(clearTimeout); timers.clear(); }

  function fresh() {
    return {
      stage: 'start',          // start · notnow · checking · waiting · review · notfinished · failed · verified · done
      resume: null,            // where "Carry on" goes: continue · selfieAgain · down · expired · names · more
      method: 'card',          // card (photos of the ID) · number (ID number plus a selfie, matched on the register)
      doc: 'id',
      photos: {},              // accepted photos for the chosen ID, by side
      selfie: false,
      idName: ID_NAMES.full,
      account: ME.account,     // the name his Ujira account and invoices use
      nameChoice: null,        // id · both, once a different name on the ID is settled
      names: [],               // names withdrawals can go to, once verified
      supportDoc: 'affidavit', support: false,
      reviewReason: 'photo',   // why a person is checking: photo · selfie · asked · names · redo
      issueShown: false, selfieTries: 0, downShown: false, noShown: false, moreDone: false, redo: false, camOk: false,
      idTyped: '', dobTyped: '',
      verifiedAt: null,
      number: opts.mpesa === 'other' ? '711000482' : '700000123',
      payout: null,            // mpesa · bank · later
      choice: 'another', nameOpt: 'id',
    };
  }
  function track(name, props = {}) {
    log.unshift({ name, props, t: Date.now() });
    // Analytics would go here. In the concept, events stay in the console and never include ID details.
    console.info('[Ujira ID event]', name, props);
    renderDemo();
  }
  const titleCase = s => s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  const idNameFor = () => (opts.scenario === 'name' ? ID_NAMES.short : ID_NAMES.full);

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
  const options = (label, action, list, cur, key, cls = 'stack') => `<div class="${cls}" role="radiogroup" aria-label="${esc(label)}" style="gap:10px">${list.map(([k, i, a, b]) => `<button type="button" class="opt" role="radio" aria-checked="${cur === k}" data-a="${action}" data-${key}="${k}"><span class="circle">${ico(i)}</span><span class="grow"><p class="t-em">${a}</p><p class="t-foot muted">${b}</p></span><span class="radio">${cur === k ? ico('check', 'ico--s') : ''}</span></button>`).join('')}</div>`;
  const waitRow = text => `<div class="namecheck namecheck--wait"><span class="circle circle--grey">${ico('refresh', 'ico--s spin')}</span><span><p class="t-em">${esc(text)}</p></span></div>`;
  const docLabel = () => (S.method === 'number' ? 'ID number ending 0417 (demo), on the register' : `${DOCS[S.doc].name} ending ${S.doc === 'passport' ? '482' : '0417'} (demo)`);
  const sidesFor = doc => DOCS[doc].sides;
  const reviewTime = () => ({ names: 'usually within 2 working days (demo)', redo: 'usually within a few hours (demo)' }[S.reviewReason] || 'usually within 1 working day (demo)');
  const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);
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
    if (side === 'support') {
      const sd = SUPPORT[S.supportDoc];
      return `<div class="idcard idcard--page" aria-label="Specimen ${esc(sd.name.toLowerCase())}, invented"><div class="idcard__top"><span class="t-caps">${sd.kind} · SPECIMEN</span>${demo}</div>
        <p class="idcard__text">I, ${ID_NAMES.short}, of Nairobi, state that ${ID_NAMES.short} and ADRIAN MUSUNGU are names of one and the same person, me.</p>
        <div class="page-lines" aria-hidden="true"><span style="width:92%"></span><span style="width:78%"></span><span style="width:85%"></span><span style="width:40%"></span></div></div>`;
    }
    if (side === 'back') {
      return `<div class="idcard" aria-label="Back of a specimen ${d.lower}, invented"><div class="idcard__top"><span class="t-caps">${d.kind} · BACK</span>${demo}</div>
        <dl><div><dt>Date of issue</dt><dd>${S.doc === 'maisha' ? '2 Oct 2024' : '2 Jun 2012'}</dd></div><div><dt>Place of issue</dt><dd>Kakamega (demo)</dd></div></dl>
        <p class="idcard__code">IDKEN0000417&lt;&lt;DEMO&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p></div>`;
    }
    const third = S.doc === 'passport' ? ['Expires', passportExpired() ? '3 Mar 2026' : '3 Mar 2031'] : ['Born', ME.born];
    const second = S.doc === 'passport' ? ['Passport no.', 'AK000 0482'] : ['ID number', `${ME.idNo} (demo)`];
    return `<div class="idcard" aria-label="Specimen ${d.lower}, invented"><div class="idcard__top"><span class="t-caps">${d.kind}</span>${demo}</div>
      <div class="idcard__body"><span class="idcard__photo" aria-hidden="true"></span><dl><div><dt>Name</dt><dd>${S.idName}</dd></div><div><dt>${second[0]}</dt><dd>${second[1]}</dd></div><div><dt>${third[0]}</dt><dd>${third[1]}</dd></div></dl></div></div>`;
  }
  const passportExpired = () => S.doc === 'passport' && opts.passport === 'expired';

  // A made-up code for the other-phone handoff. It isn't a working QR code.
  function demoQR() {
    const n = 25; let seed = 11, out = '';
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const inFinder = (x, y) => [[0, 0], [n - 7, 0], [0, n - 7]].find(([fx, fy]) => x >= fx - 1 && x <= fx + 7 && y >= fy - 1 && y <= fy + 7);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const f = inFinder(x, y);
      let on;
      if (f) { const dx = x - f[0], dy = y - f[1]; on = dx >= 0 && dy >= 0 && dx < 7 && dy < 7 && (dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx > 1 && dx < 5 && dy > 1 && dy < 5)); }
      else on = rnd() > 0.52;
      if (x > 8 && x < 16 && y > 10 && y < 14) on = false;
      if (on) out += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    }
    return `<div class="qr" role="img" aria-label="A code for your other phone to scan (demo, not a working code)"><svg viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges">${out}</svg><span class="qr__demo">DEMO</span></div>`;
  }

  /* ---------- screens ---------- */
  const SCREENS = {
    // Set-up hub: step 2 of 4 is the ID check, and it remembers where Adrian got to.
    setup() {
      const st = S.stage;
      const verified = st === 'verified' || st === 'done';
      const resumeText = {
        selfieAgain: 'Selfie needs another go · your ID photos are kept',
        down: 'The register was down · your photos are saved',
        expired: 'Passport expired · use another ID',
        names: 'Your ID shows a different name · choose which to use',
        more: 'One more photo of your ID, please',
      };
      const idRow = {
        start: ['brand', null, '2', 'A photo of your ID or its number, then a selfie'],
        notnow: ['brand', null, '2', 'Not started · withdrawals need it'],
        checking: ['tint', 'refresh', null, 'Checking · we’ll notify you when it’s done'],
        waiting: ['tint', 'refresh', null, 'Checking · we’ll notify you when it’s done'],
        review: ['warn', 'user', null, `A person is checking · ${reviewTime()}`],
        notfinished: ['warn', 'alert', null, resumeText[S.resume] || 'Not finished · carry on where you left off'],
        failed: ['warn', 'alert', null, 'We couldn’t confirm it’s you · see what you can do'],
        verified: ['green', 'check', null, `Checked · ${docLabel()}`],
        done: ['green', 'check', null, `Checked · ${docLabel()}`],
      }[st];
      const mpesaDone = st === 'done';
      const mpesaBody = mpesaDone ? (S.payout === 'mpesa' ? `${ME.phone} · ${mpesaName()}` : S.payout === 'bank' ? 'Withdrawals go to your bank for now' : 'Not set up yet · you can still invoice and get paid') : 'Must be registered in your name';
      let cta = '';
      if (st === 'start' || st === 'notnow') cta = '<button type="button" class="btn btn--primary" data-a="go" data-to="before">Check my ID</button>';
      else if (st === 'notfinished') cta = '<button type="button" class="btn btn--primary" data-a="resume">Carry on with the ID check</button>';
      else if (st === 'failed') cta = '<button type="button" class="btn btn--primary" data-a="go" data-to="notConfirmed">See what you can do</button>';
      else if (st === 'verified') cta = '<button type="button" class="btn btn--primary" data-a="go" data-to="mpesa">Add my M-Pesa number</button>';
      else if (st === 'done') cta = '<button type="button" class="btn btn--primary" data-a="go" data-to="done">See what’s set up</button>';
      else cta = '<p class="t-foot muted" style="text-align:center;display:flex;gap:8px;justify-content:center">' + ico('bell', 'ico--s') + '<span>Nothing to do for now. We’ll notify you when it’s done.</span></p>';
      const warnRow = ['notfinished', 'review', 'failed'].includes(st);
      return { html: `${navbar('Set up')}
        <div class="pad stack">
          ${intro('STEP 2 OF 4', verified ? 'Your ID is checked' : 'Let’s check it’s you', verified ? 'Next, tell us where withdrawals should go.' : 'Licensed wallets in Kenya must confirm who holds each account. It takes about 2 minutes.')}
          ${pbar(mpesaDone ? 4 : verified ? 3 : 2)}
          <div class="card card--flush">
            <div class="srow"><span class="circle circle--green">${ico('check', 'ico--s')}</span><span class="grow"><p class="t-em">Phone number</p><p class="t-foot muted">${ME.phone} · confirmed</p></span></div>
            <div class="srow"><span class="circle circle--${idRow[0]}">${idRow[2] || ico(idRow[1], 'ico--s')}</span><span class="grow"><p class="t-em">Your ID</p><p class="t-foot ${warnRow ? 'warn' : 'muted'}">${esc(idRow[3])}</p></span></div>
            <div class="srow"><span class="circle ${mpesaDone ? 'circle--green' : verified ? 'circle--brand' : 'circle--grey'}">${mpesaDone ? ico('check', 'ico--s') : '3'}</span><span class="grow"><p class="t-em ${verified ? '' : 'muted'}">M-Pesa for withdrawals</p><p class="t-foot muted">${esc(mpesaBody)}</p></span></div>
            <div class="srow"><span class="circle circle--grey">4</span><span class="grow"><p class="t-em muted">How you sign in</p><p class="t-foot muted">Face ID or a passkey · not part of this demo</p></span></div>
          </div>
          <div class="card card--flush"><button type="button" class="listrow" data-a="go" data-to="data">${ico('shield')}<span class="grow"><p class="t-sub">Your ID data</p><p class="t-foot muted">What we hold, for how long, and deleting it</p></span>${ico('chev-r', 'ico--s chev')}</button></div>
        </div>
        <div class="actions">${cta}</div>` };
    },

    // K1 Before you start, ending in a real choice: agree, or not now
    before() {
      const rows = [
        ['camera', 'What we take', 'Photos of your ID, a 3-second selfie video, and your name, date of birth and ID number as printed.'],
        ['shield', 'Why we ask', 'Kenyan law asks licensed wallets to confirm who holds each account.'],
        ['user', 'Who sees it', 'Ujira’s checks team and our checking partner (demo). Never your clients.'],
        ['timer', 'How long we keep it', 'Delete it any time until the check is done. Once you’re verified, the law says 7 years after you close your account.'],
      ];
      return { html: `${navbar('Your ID')}
        <div class="pad stack">
          ${intro('STEP 2 OF 4', 'Before you start')}
          ${pbar(2)}
          <div class="card card--flush">${rows.map(([i, a, b]) => `<div class="srow"><span class="circle circle--tint">${ico(i, 'ico--s')}</span><span class="grow"><p class="t-em">${a}</p><p class="t-foot muted">${b}</p></span></div>`).join('')}</div>
          <p class="t-foot muted">Your selfie is sensitive data under Kenyan law. We use it for this check only, and you can delete it in <button type="button" class="text-btn" data-a="go" data-to="data">Your ID data</button>.</p>
        </div>
        <div class="actions"><button type="button" class="btn btn--primary" data-a="consent">Agree and continue</button><button type="button" class="btn btn--secondary" data-a="not-now">Not now</button></div>` };
    },

    // R13 Not now: nothing taken, and what still works without the check
    notNow() {
      return { html: `${resultTop('brand', 'timer', 'link', 'No problem. It’s here when you’re ready', 'Nothing was taken')}
        <div class="details"><div class="card card--shadow">
          <p class="t-caps muted">Without the ID check you can</p>
          ${mini('check', 'circle--green', 'Send invoices and get paid')}
          ${mini('check', 'circle--green', 'Hold your dollars')}
          <div class="divider" style="margin:0"></div>
          ${mini('timer', 'circle--grey', 'Withdrawals need the ID check', 'To M-Pesa or a bank', true)}
        </div></div>
        <div class="actions" style="padding-top:24px"><button type="button" class="btn btn--primary" data-a="go-root" data-to="before">Check my ID now</button><button type="button" class="btn btn--secondary" data-a="go-root" data-to="setup">Back to set up</button></div>` };
    },

    // K2 Choose your ID, or use its number instead
    choose() {
      const o = [['id', 'idcard', 'National ID', 'Front and back'], ['maisha', 'idcard', 'Maisha card', 'Front and back'], ['alien', 'idcard', 'Alien ID', 'Foreign residents'], ['passport', 'passport', 'Passport', 'The photo page']];
      return { html: `${navbar('Your ID')}
        <div class="pad stack">
          ${intro('STEP 2 OF 4', 'Which ID do you have with you?', 'Any one of these works. You’ll photograph it, then take a short selfie.')}
          ${pbar(2)}
          ${options('Your ID', 'doc', o, S.doc, 'doc', 'opt-grid')}
          <div class="notice notice--brand">${ico('info')}<span>Take the card out of its sleeve. Plastic covers are the most common cause of glare.</span></div>
          <div class="alt-links"><button type="button" class="text-btn" data-a="go" data-to="idnumber">Card damaged or not with you? Use your ID number</button><button type="button" class="text-btn" data-a="not-listed">My ID isn’t listed</button></div>
        </div>
        <div class="actions"><button type="button" class="btn btn--primary" data-a="start-capture">Continue</button></div>` };
    },

    // K2b Use your ID number: the register's photo stands in for the card
    idnumber() {
      return { html: `${navbar('Your ID')}
        <div class="pad stack">
          ${intro('STEP 2 OF 4', 'Use your ID number instead', 'We find your record on the government register, then match a short selfie to the photo there. No card photos needed.')}
          ${pbar(2)}
          <div class="field"><label for="idno">National ID or Maisha number</label><div class="tel"><input id="idno" type="text" inputmode="numeric" autocomplete="off" placeholder="8 digits" value="${esc(S.idTyped)}"></div></div>
          <div class="field"><label for="dob">Date of birth</label><div class="tel"><input id="dob" type="text" inputmode="numeric" autocomplete="off" placeholder="DD MM YYYY" value="${esc(fmtDob(S.dobTyped))}"></div></div>
          <p class="t-foot muted" style="display:flex;gap:8px">${ico('shield', 'ico--s')}<span>We only show what the register holds after your selfie matches. Any 8 digits and date work in this demo.</span></p>
        </div>
        <div class="actions"><button type="button" class="btn btn--primary" id="idno-go" data-a="idno-go" disabled>Take my selfie</button></div>`,
        after: el => {
          const idno = el.querySelector('#idno'), dob = el.querySelector('#dob'), btn = el.querySelector('#idno-go');
          const check = () => { btn.disabled = !(S.idTyped.length === 8 && S.dobTyped.length === 8); };
          idno.addEventListener('input', () => { S.idTyped = idno.value.replace(/\D/g, '').slice(0, 8); idno.value = S.idTyped; check(); });
          dob.addEventListener('input', () => { S.dobTyped = dob.value.replace(/\D/g, '').slice(0, 8); dob.value = fmtDob(S.dobTyped); check(); });
          check();
        } };
    },

    // R7 The camera is blocked: turn it on, or carry on with another phone
    camera() {
      return { html: `${resultTop('warn', 'camera', 'warn', 'Ujira can’t use your camera', 'Camera access is off for Ujira')}
        <div class="details"><div class="card card--shadow">
          <p class="t-caps muted">What happened</p>
          <p class="t-sub">Your phone is blocking the camera for Ujira, so we can’t photograph your ID or take the selfie.</p>
          <div class="divider" style="margin:0"></div>
          <p class="t-caps muted">Two ways to carry on</p>
          ${mini('shield', 'circle--tint', 'Turn the camera on', 'Settings › Ujira › Camera, then come back')}
          ${mini('phone', 'circle--tint', 'Use another phone', 'Scan a code with it. You carry on there.')}
        </div></div>
        <p class="t-foot muted below" style="text-align:center">Photos from your gallery won’t work. The selfie needs a live camera.</p>
        <div class="actions" style="padding-top:16px"><button type="button" class="btn btn--primary" data-a="camera-settings">Open Settings</button><button type="button" class="btn btn--secondary" data-a="go" data-to="handoff">Use another phone</button></div>` };
    },

    // R8 Carry on with another phone
    handoff() {
      return { html: `${navbar('Another phone')}
        <div class="pad stack">
          ${intro('STEP 2 OF 4', 'Carry on with another phone', 'Open the camera on the other phone and scan this. It opens the ID check where you are now.')}
          ${demoQR()}
          <div id="handoff-status" aria-live="polite">${waitRow('Waiting for your other phone…')}</div>
          <p class="t-foot muted" style="display:flex;gap:8px">${ico('shield', 'ico--s')}<span>The code works once and expires in 10 minutes. Only scan it with a phone you trust.</span></p>
        </div>
        <div class="actions"><button type="button" class="btn btn--secondary" data-a="toast" data-msg="A one-time link would go to 07•• ••• 123 by SMS (demo)">Text me a link instead</button></div>`,
        after: el => {
          const st = el.querySelector('#handoff-status');
          later(() => { st.innerHTML = `<div class="namecheck namecheck--pos"><span class="circle circle--green">${ico('check', 'ico--s')}</span><span><p class="t-em">Connected to your other phone</p><p class="t-foot muted">Carry on there. This screen moves on by itself.</p></span></div>`; track('handoff_connected'); }, 2400);
          later(() => {
            S.method = 'card'; S.idName = idNameFor();
            sidesFor(S.doc).forEach(x => { S.photos[x] = true; });
            S.selfie = true; S.stage = 'checking'; track('handoff_done');
            toast('Photos and selfie added from your other phone');
            root('setup'); go('checking', { from: 0 });
          }, 5600);
        } };
    },

    // K3 The camera, with live guidance: too far, blurry, glare or cut off is caught before the photo
    capture({ side }) {
      const support = side === 'support';
      const d = DOCS[S.doc];
      const lines = support ? [[22, 26, 120], [22, 58, 190], [22, 78, 170], [22, 98, 185], [22, 130, 150], [22, 150, 175], [22, 170, 120], [22, 226, 90]]
        : S.doc === 'passport' ? [[110, 42, 150], [110, 66, 110], [110, 98, 170], [14, 160, 285], [14, 178, 285]] : [[110, 52, 150], [110, 76, 110], [110, 108, 170], [110, 132, 130], [14, 16, 120]];
      const step = support ? SUPPORT[S.supportDoc].name : d.sides.length > 1 ? `Photo ${d.sides.indexOf(side) + 1} of 2 · ${d.name}` : d.name;
      const issue = !support && !S.redo && !S.issueShown && side !== 'back' && opts.photo !== 'sharp' ? opts.photo : null;
      return { dark: true, cls: 'screen--cam', html: `${camTop(SIDE_TITLE[side], step)}
        <p class="cam-hint t-sub on-hero-muted">${support ? 'Place the whole page inside the frame' : `Place your ${esc(d.lower)} inside the frame`}</p>
        <div class="vf ${support ? 'vf--doc' : S.doc === 'passport' ? 'vf--passport' : ''}" id="vf" aria-hidden="true"><div class="vf__card">${support ? '' : '<span class="vf__photo"></span>'}${lines.map(([x, y, w]) => `<span class="vf__line" style="left:${x}px;top:${y}px;width:${w}px"></span>`).join('')}<span class="vf__demo">DEMO</span></div><span class="vf__glare"></span></div>
        <p class="cam-status" id="cam-status" role="status" aria-live="polite">${ico('camera', 'ico--s')}<span>${support ? 'Looking for the page…' : 'Looking for your ID…'}</span></p>
        <div class="cam-tips" id="cam-tips">${Object.keys(TIP).map(k => `<span data-tip="${k}" class="is-off">${ico('check', 'ico--s')}${TIP[k][0]}</span>`).join('')}</div>
        <button type="button" class="shutter" id="shutter" data-a="shutter" aria-label="Take the photo" disabled></button>
        <p class="cam-foot t-cap on-hero-muted" id="cam-foot">Takes the photo by itself when it’s sharp</p>`,
        after: el => {
          const vf = el.querySelector('#vf'), status = el.querySelector('#cam-status'), shutter = el.querySelector('#shutter'), foot = el.querySelector('#cam-foot');
          const tip = (k, state) => { const t = el.querySelector(`[data-tip="${k}"]`); t.className = state === 'on' ? '' : `is-${state}`; t.innerHTML = `${ico(state === 'warn' ? 'alert' : 'check', 'ico--s')}${TIP[k][state === 'warn' ? 1 : 0]}`; };
          const set = (cls, icon, text) => { status.className = `cam-status ${cls}`; status.innerHTML = `${ico(icon, 'ico--s')}<span>${esc(text)}</span>`; };
          const found = () => {
            vf.className = vf.className.replace(/\bis-(far|blur|glare|cut)\b/g, '').trim(); vf.classList.add('is-found');
            set('cam-status--pos', 'check', support ? 'Page found. Hold still' : 'ID found. Hold still'); Object.keys(TIP).forEach(k => tip(k, 'on'));
            shutter.disabled = false; foot.textContent = 'Taking the photo…';
            later(() => capture(side), 1200);
          };
          later(() => {
            tip('light', 'on');
            if (!issue) { found(); return; }
            S.issueShown = true; track('photo_issue', { issue, side });
            const [say, flag, footText] = ISSUE[issue];
            if (issue !== 'far') { tip('sharp', issue === 'blur' ? 'warn' : 'on'); tip('glare', issue === 'glare' ? 'warn' : 'on'); tip('corners', issue === 'cut' ? 'warn' : 'on'); }
            else tip('corners', 'on');
            if (flag) tip(flag, 'warn');
            vf.classList.add(`is-${issue}`); set('cam-status--warn', 'alert', say);
            foot.textContent = footText;
            later(found, 2600);
          }, 900);
        } };
    },

    // K4 Check the photo, with what was read from it
    review({ side }) {
      const d = DOCS[S.doc];
      const support = side === 'support';
      const expired = passportExpired();
      let rows = [];
      if (support) rows = [['Document', `${SUPPORT[S.supportDoc].name} (demo)`], ['Name on your ID', ID_NAMES.short], ['Also known as', 'ADRIAN MUSUNGU']];
      else if (side === 'back') rows = [['Date of issue', S.doc === 'maisha' ? '2 Oct 2024' : '2 Jun 2012'], ['Place of issue', 'Kakamega (demo)']];
      else if (S.doc === 'passport') rows = [['Name', S.idName], ['Passport no.', 'AK000 0482 (demo)'], ['Expires', expired ? '3 Mar 2026 · expired' : '3 Mar 2031', expired]];
      else rows = [['Name', S.idName], ['ID number', `${ME.idNo} (demo)`], ['Date of birth', ME.born]];
      const step = support ? SUPPORT[S.supportDoc].name : d.sides.length > 1 ? `Photo ${d.sides.indexOf(side) + 1} of 2 · ${d.name}` : d.name;
      return { dark: true, cls: 'screen--cam', html: `${camTop(REVIEW_TITLE[side], step)}
        ${idCard(side)}
        <div class="review-q"><p class="t-head on-hero">${support ? 'Can you read both names?' : 'Can you read every word?'}</p><p class="t-foot on-hero-muted">${support ? 'A person compares it with your ID. This is what we read from it:' : 'Check the name, the number and all four corners. This is what we read from it:'}</p></div>
        <dl class="readout">${rows.map(([a, b, w]) => `<div class="${w ? 'is-warn' : ''}"><dt>${a}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>
        <div class="cam-actions"><button type="button" class="btn btn--primary" data-a="accept" data-side="${side}">${support ? 'Send it to be checked' : S.redo ? 'Send this photo' : 'Use this photo'}</button><button type="button" class="btn btn--secondary" data-a="retake" data-side="${side}">Retake</button></div>` };
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
          later(() => { face.className = 'face'; ring.style.strokeDashoffset = '0'; pill.classList.add('is-done'); say('check', 'Got it'); sub.textContent = S.method === 'number' ? 'Matching it to the register photo next' : 'Checking it with your ID photo next'; }, 3600);
          later(() => { S.selfie = true; track('selfie_done', { tries: S.selfieTries + 1 }); S.stage = 'checking'; const from = S.photosDoneForSelfieRetry ? 3 : 0; S.photosDoneForSelfieRetry = false; swap('checking', { from }); }, 4400);
        } };
    },

    // K6 Checking: an honest wait, step by step
    checking({ from = 0 }) {
      const steps = S.method === 'number' ? [
        ['face', 'Your selfie is sharp', 'A 3-second video'],
        ['statement', 'Your ID number and date of birth', `Ending 0417 · born ${ME.born}`],
        ['refresh', 'Finding you on the government register', `Found · ${S.idName}`],
        ['face', 'Matching your selfie', 'To the photo on the register'],
      ] : [
        ['camera', 'Photos are sharp', S.doc === 'passport' ? 'The photo page and the selfie' : 'Front, back and the selfie'],
        ['statement', 'Details read from your ID', `${S.idName} · born ${ME.born}`],
        ['refresh', 'Checking the government register', 'Your ID is on it and in date'],
        ['face', 'Matching your selfie', 'To your ID photo'],
      ];
      return { html: `${resultTop('brand', 'timer', 'link', 'Checking your ID', 'Usually under 2 minutes · started 10:42')}
        <div class="details"><div class="card card--shadow" id="steps"><p class="t-caps muted">Where it’s up to</p>
          ${steps.map(([i, a, b], k) => `<div class="check-step ${k < from ? 'is-done' : k === from ? 'is-now' : 'is-next'}" data-k="${k}"><span class="circle">${ico(k < from ? 'check' : k === from ? 'refresh' : i, `ico--s ${k === from ? 'spin' : ''}`)}</span><span><p class="t-em">${a}</p><p class="t-foot muted">${k === from ? 'In progress' : k < from ? esc(b) : 'Next'}</p></span></div>`).join('')}
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
      const number = S.method === 'number';
      return { html: `${resultTop('green', 'check', 'pos', 'You’re verified', `Checked 20 Nov 2026 · ${S.verifiedAt || '10:43'}`)}
        <div class="details"><div class="card card--shadow">
          <p class="t-caps muted">What we checked</p>
          ${mini('check', 'circle--green', number ? 'Your ID number is on the register' : 'Your ID is genuine and in date', docLabel())}
          ${mini('check', 'circle--green', number ? 'Your selfie matches the register photo' : 'Your selfie matches your ID photo')}
          <div class="divider" style="margin:0"></div>
          ${mini('user', 'circle--tint', 'Withdrawals go to accounts in your name', S.names.join(' or '))}
        </div></div>
        <div class="mini below"><span class="circle circle--brand">3</span><span><p class="t-em">Next: M-Pesa for withdrawals</p><p class="t-foot muted">Step 3 of 4 · must be registered in your name</p></span></div>
        <div class="actions" style="padding-top:24px"><button type="button" class="btn btn--primary" data-a="go-root" data-to="mpesa">Add my M-Pesa number</button></div>` };
    },

    // R1 A person is checking, and why
    person() {
      const R = {
        photo: ['A person is checking your ID', 'Your ID photo is a few years old, so the automatic match wasn’t sure. Someone at Ujira will compare them by hand. You don’t need to redo anything.'],
        selfie: ['A person is checking your selfie', 'After 3 tries, the automatic match still wasn’t sure. Someone at Ujira will compare your selfie with your ID photo by hand.'],
        asked: ['A person is checking your selfie', 'You asked for a person to compare your selfie with your ID photo. You don’t need to redo anything.'],
        names: ['A person is checking your names', 'Someone at Ujira will compare your document with your ID. You don’t need to redo anything.'],
        redo: ['Thanks. We’ve got the new photo', 'The person checking your ID will finish with it. There’s nothing else to do.'],
      }[S.reviewReason] || [];
      return { html: `${resultTop('warn', 'user', 'warn', R[0], cap1(reviewTime()))}
        <div class="details"><div class="card card--shadow">
          <p class="t-caps muted">What happened</p>
          <p class="t-sub">${esc(R[1])}</p>
          <div class="divider" style="margin:0"></div>
          <p class="t-caps muted">While you wait</p>
          ${mini('check', 'circle--green', 'Send invoices and get paid')}
          ${mini('check', 'circle--green', 'Hold your dollars')}
          ${mini('timer', 'circle--grey', 'Withdrawals open once you’re verified', 'We’ll notify you', true)}
        </div></div>
        <div class="actions" style="padding-top:24px"><button type="button" class="btn btn--primary" data-a="toast" data-msg="Invoicing is in the main Ujira demo at tedthie.cc/lab/ujira">Send an invoice</button><button type="button" class="btn btn--secondary" data-a="wait-person">Done</button></div>` };
    },

    // R11 The person checking asks for one more photo; everything else is kept
    more() {
      const side = S.doc === 'passport' ? 'page' : 'back';
      return { html: `${resultTop('warn', 'camera', 'warn', 'One more photo, please', 'Asked by the person checking your ID')}
        <div class="details"><div class="card card--shadow">
          <p class="t-caps muted">What happened</p>
          <p class="t-sub">${side === 'page' ? 'The expiry date on your photo page is hard to read.' : 'The date of issue on the back of your ID is hard to read.'} Everything else is fine.</p>
          <div class="divider" style="margin:0"></div>
          ${side === 'page' ? '' : mini('check', 'circle--green', 'Front of your ID', 'Accepted')}
          ${mini('check', 'circle--green', 'Your selfie', 'Accepted')}
          ${mini('alert', 'circle--warn', side === 'page' ? 'Your photo page' : 'Back of your ID', 'Needs a clearer photo')}
        </div></div>
        <p class="t-foot muted below" style="text-align:center">Tilt the card away from the light so the small print shows.</p>
        <div class="actions" style="padding-top:16px"><button type="button" class="btn btn--primary" data-a="redo" data-side="${side}">Retake the ${side === 'page' ? 'photo page' : 'back'}</button></div>` };
    },

    // R12 A person couldn't confirm it: the reason, and the next steps
    notConfirmed() {
      return { html: `${resultTop('warn', 'alert', 'warn', 'We couldn’t confirm it’s you', 'Checked by a person · 20 Nov 2026')}
        <div class="details"><div class="card card--shadow">
          <p class="t-caps muted">What happened</p>
          <p class="t-sub">The person checking couldn’t match your selfie to the photo on your ${esc(DOCS[S.doc].lower)}. This often happens when an ID photo is many years old.</p>
          <div class="divider" style="margin:0"></div>
          <p class="t-caps muted">What you can do</p>
          ${mini('passport', 'circle--tint', 'Try an ID with a newer photo', 'A passport or Maisha card works best. Your selfie is kept.')}
          ${mini('user', 'circle--tint', 'Talk to our checks team', 'We reply within 1 working day (demo)')}
        </div></div>
        <p class="t-foot muted below" style="text-align:center">Invoices and payments still work. If you don’t try again, these photos are deleted on 20 Dec 2026 (demo).</p>
        <div class="actions" style="padding-top:16px"><button type="button" class="btn btn--primary" data-a="try-other-id">Try another ID</button><button type="button" class="btn btn--secondary" data-a="toast" data-msg="A chat with Ujira’s checks team would open here (demo)">Talk to us</button></div>` };
    },

    // R3 The selfie needs another go; the ID photos are kept
    selfieAgain() {
      const left = Math.max(0, 3 - S.selfieTries);
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

    // R9 The name on the ID differs from the account: pick one, or link them with a document
    names() {
      const o = [['id', 'idcard', 'Use the name on my ID', `Your account and new invoices change to ${titleCase(S.idName)}`], ['both', 'statement', 'Both names are mine', 'Add a document that links them. A person checks it.']];
      return { html: `${resultTop('warn', 'user', 'warn', 'Your ID shows a different name', 'Nothing needs retaking')}
        <div class="details"><div class="card card--shadow">
          <p class="t-caps muted">What happened</p>
          <p class="t-sub">Withdrawals can only go to the name on your ID, so your Ujira account has to match it.</p>
          <dl class="compare"><div><dt>Your Ujira account</dt><dd>${esc(S.account)}</dd></div><div><dt>Your ID</dt><dd>${esc(S.idName)}</dd></div></dl>
        </div></div>
        <div class="pad stack" style="padding-top:20px"><p class="t-caps muted">What would you like to do?</p>${options('What would you like to do?', 'name-opt', o, S.nameOpt, 'n', 'opt-grid')}</div>
        <div class="actions" style="padding-top:20px"><button type="button" class="btn btn--primary" data-a="names-go">Continue</button></div>` };
    },

    // R10 A document that links the two names
    support() {
      const o = Object.entries(SUPPORT).map(([k, v]) => [k, 'statement', v.name, v.sub]);
      return { html: `${navbar('Your names')}
        <div class="pad stack">
          ${intro('STEP 2 OF 4', 'Add a document that links your names', 'A photo of any one of these. A person at Ujira compares it with your ID, usually within 2 working days.')}
          ${options('Your document', 'support-doc', o, S.supportDoc, 's')}
          <div class="notice notice--brand">${ico('shield')}<span>Only Ujira’s checks team sees it. It’s kept with your ID data, and you can delete it there.</span></div>
        </div>
        <div class="actions"><button type="button" class="btn btn--primary" data-a="support-go">Photograph it</button></div>` };
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
      const pay = S.payout === 'mpesa' ? mini('phone', 'circle--green', 'Withdrawals go to M-Pesa', `${ME.phone} · ${mpesaName()}`) : S.payout === 'bank' ? mini('bank', 'circle--green', 'Withdrawals go to your bank', 'An account in your name (demo)') : mini('timer', 'circle--grey', 'M-Pesa isn’t set up yet', 'You can still send invoices and get paid', true);
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
      if (S.method === 'number' && S.idTyped) held.push(['idcard', 'ID number and date of birth', 'Typed by you, checked on the register']);
      if (S.selfie) held.push(['face', 'Selfie video', '3 seconds, taken 20 Nov 2026']);
      if (sides.length) held.push(['idcard', 'Details read from your ID', S.doc === 'passport' ? 'Name, passport number and expiry date' : 'Name, date of birth and ID number']);
      if (S.support) held.push(['statement', 'Name document', `${SUPPORT[S.supportDoc].name}, 1 photo`]);
      const status = held.length === 0 ? ['neutral', 'Nothing held', 'You haven’t started the ID check']
        : verified ? ['pos', 'Verified', `Checked 20 Nov 2026 · ${S.verifiedAt || '10:43'}`]
        : S.stage === 'review' ? ['warn', 'A person is checking', cap1(reviewTime())]
        : S.stage === 'failed' ? ['warn', 'Not confirmed', 'Deleted on 20 Dec 2026 unless you try again (demo)']
        : S.stage === 'notfinished' ? ['warn', 'Not finished', 'Needs another go · started 20 Nov']
        : ['brand', 'In progress', 'Started 20 Nov 2026 · 10:42'];
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
    const sc = opts.scenario;
    if (sc === 'name' && !S.nameChoice && k === (S.method === 'number' ? 2 : 1)) return 'name';
    if (sc === 'down' && k === 2 && !S.downShown) return 'down';
    if (k === 3) {
      if (sc === 'review' || sc === 'more' || (sc === 'no' && !S.noShown)) return 'review';
      if (sc === 'dark' && S.selfieTries === 0) return 'dark';
      if (sc === 'dark3') return S.selfieTries >= 2 ? 'selfiePerson' : 'dark';
    }
    return null;
  }
  function verify(at) {
    S.stage = 'verified'; S.verifiedAt = at;
    S.names = S.nameChoice === 'both' ? [S.idName, 'ADRIAN MUSUNGU'] : [S.idName];
  }
  function finish(outcome) {
    if (outcome === 'pass') { verify('10:43'); track('check_passed', { doc: S.method === 'number' ? 'number' : S.doc }); swap('verified'); return; }
    if (outcome === 'name') { S.stage = 'notfinished'; S.resume = 'names'; track('name_mismatch'); swap('names'); return; }
    if (outcome === 'down') { S.downShown = true; S.stage = 'notfinished'; S.resume = 'down'; track('register_down'); swap('down'); return; }
    if (outcome === 'review') { S.stage = 'review'; S.reviewReason = 'photo'; track('check_needs_person'); swap('person'); return; }
    if (outcome === 'selfiePerson') { S.selfieTries += 1; S.stage = 'review'; S.reviewReason = 'selfie'; track('check_needs_person', { after: 'selfie tries' }); swap('person'); return; }
    if (outcome === 'dark') { finishQuiet('dark'); swap('selfieAgain'); }
  }
  function finishQuiet(outcome) { if (outcome === 'dark') { S.selfieTries += 1; S.selfie = false; S.stage = 'notfinished'; S.resume = 'selfieAgain'; track('selfie_retry_needed', { tries: S.selfieTries }); } }
  // What the person checking decides. The "Try it" choice picks it.
  function personOutcome() {
    const sc = opts.scenario;
    if (sc === 'more' && !S.moreDone && S.reviewReason === 'photo') { S.stage = 'notfinished'; S.resume = 'more'; track('person_asked_for_photo'); banner('One more photo, please', 'The person checking needs a clearer photo', 'more'); return; }
    if (sc === 'no' && !S.noShown && S.reviewReason === 'photo') { S.noShown = true; S.stage = 'failed'; track('person_could_not_confirm'); banner('We couldn’t confirm your ID', 'See what you can do next', 'notConfirmed'); return; }
    verify('11:20'); track('check_passed', { by: 'person' });
    banner('You’re verified', S.reviewReason === 'names' ? 'A person at Ujira checked your names' : 'A person at Ujira checked your ID', 'verified');
  }
  // Leaving mid-check: the outcome still arrives, as a notification.
  function notifyLater(ms) {
    clearTimeout(bgTimer);
    bgTimer = setTimeout(() => {
      const sc = opts.scenario;
      if (sc === 'name' && !S.nameChoice) { S.stage = 'notfinished'; S.resume = 'names'; track('name_mismatch'); banner('Your ID shows a different name', 'Choose which name to use', 'names'); }
      else if (sc === 'review' || sc === 'more' || (sc === 'no' && !S.noShown)) {
        S.stage = 'review'; S.reviewReason = 'photo'; track('check_needs_person'); banner('A person is checking your ID', cap1(reviewTime()), 'person');
        bgTimer = setTimeout(() => { if (S.stage === 'review') { personOutcome(); if (top().name === 'setup') render(); } }, T(6000));
      }
      else if ((sc === 'dark' && S.selfieTries === 0) || (sc === 'dark3' && S.selfieTries < 2)) { finishQuiet('dark'); banner('Your selfie needs another go', 'Your ID photos are kept', 'selfieAgain'); }
      else if (sc === 'dark3') { S.selfieTries += 1; S.stage = 'review'; S.reviewReason = 'selfie'; track('check_needs_person', { after: 'selfie tries' }); banner('A person is checking your selfie', cap1(reviewTime()), 'person'); }
      else { verify('10:47'); track('check_passed', { notified: true }); banner('You’re verified', 'Add your M-Pesa number next', 'verified'); }
      if (top().name === 'setup') render();
    }, T(ms));
  }
  function waitPerson() {
    root('setup');
    clearTimeout(bgTimer);
    bgTimer = setTimeout(() => { personOutcome(); if (top().name === 'setup') render(); }, T(5000));
    toast('We’ll notify you when a person has checked it');
  }

  function capture(side) {
    S.photos[side] = false;
    track('photo_taken', { side });
    swap('review', { side });
  }

  /* ---------- typed numbers ---------- */
  const digits = v => v.replace(/\D/g, '').slice(0, 9);
  const fmtTel = d => [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9)].filter(Boolean).join(' ');
  const fmtDob = d => [d.slice(0, 2), d.slice(2, 4), d.slice(4, 8)].filter(Boolean).join(' ');

  /* ---------- M-Pesa number ---------- */
  // The name M-Pesa holds for a number. A middle initial still counts as his name.
  function mpesaName() {
    if (S.number === '711000482') return 'PETER MWANGI';
    if (S.nameChoice === 'id') return S.idName;
    return 'ADRIAN W MUSUNGU';
  }
  function mpesaMatch(n) {
    if (S.names.includes(n)) return 'Matches the name on your ID';
    if (n === 'ADRIAN W MUSUNGU') return S.nameChoice === 'both' ? 'Matches the name on your document. A middle initial is fine' : 'Matches your ID. A middle initial is fine';
    return null;
  }
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
    box.innerHTML = waitRow('Checking the name on this number…');
    lookupT = setTimeout(() => {
      const n = mpesaName(), ok = mpesaMatch(n);
      if (ok) {
        box.innerHTML = `<div class="namecheck namecheck--pos"><span class="circle circle--green">${ico('check', 'ico--s')}</span><span><p class="t-em">Registered to ${n}</p><p class="t-foot pos">${ok}</p></span></div>`;
        btn.disabled = false;
        return;
      }
      track('mpesa_name_mismatch');
      box.innerHTML = `<div class="namecheck namecheck--warn"><span class="circle circle--white warn">${ico('alert', 'ico--s')}</span><span><p class="t-em">Registered to ${n}</p><p class="t-foot warn">Doesn’t match the name on your ID</p></span></div>`;
      const o = [['another', 'phone', 'Use another number', `One registered to ${S.names[0]}`], ['bank', 'bank', 'Withdraw to my bank instead', 'An account in your name'], ['later', 'timer', 'Set this up later', 'You can still invoice and get paid']];
      optsEl.innerHTML = `<p class="t-caps muted" style="margin:4px 0 8px">What would you like to do?</p>${options('What would you like to do?', 'mm-choice', o, S.choice, 'c')}`;
      btn.disabled = false; btn.dataset.a = 'mm-continue'; btn.textContent = 'Continue';
    }, T(typed ? 700 : 500));
  }

  /* ---------- sheets ---------- */
  let sheetReturn = null;
  function openSheet(kind) {
    sheet = kind; sheetReturn = document.activeElement;
    clearTimeout(toastT); toastEl.classList.remove('is-on');
    sheetEl.hidden = false;
    const body = kind === 'notlisted' ? `
      <div class="sheet__head"><h2 class="t-title-m" id="sheet-h" tabindex="-1">Your ID isn’t listed?</h2><button type="button" class="icon-btn icon-btn--subtle" data-a="sheet-close" aria-label="Close">${ico('close', 'ico--s')}</button></div>
      <p class="t-sub">For now we can check a Kenyan national ID, a Maisha card, an alien ID or a passport. A refugee ID or a passport from another country needs a person to check it.</p>
      <p class="t-foot muted">Lost your card? Your ID number works too.</p>
      <div class="stack" style="gap:10px;padding-top:6px"><button type="button" class="btn btn--primary" data-a="sheet-go" data-to="idnumber">Use my ID number</button><button type="button" class="btn btn--secondary" data-a="toast" data-msg="A chat with Ujira’s checks team would open here (demo)">Ask a person to help</button></div>`
      : `
      <div class="sheet__head"><h2 class="t-title-m" id="sheet-h" tabindex="-1">Delete your ID photos?</h2><button type="button" class="icon-btn icon-btn--subtle" data-a="sheet-close" aria-label="Close">${ico('close', 'ico--s')}</button></div>
      <p class="t-sub">This stops the ID check. Your ID photos, the selfie and the details we read are deleted. You can start again whenever you like.</p>
      <p class="t-foot muted">Until you’re verified, nothing has to be kept.</p>
      <div class="stack" style="gap:10px;padding-top:6px"><button type="button" class="btn btn--danger" data-a="do-delete">${ico('trash')}Delete and stop</button><button type="button" class="btn btn--secondary" data-a="sheet-close">Keep them</button></div>`;
    sheetEl.innerHTML = `<div class="scrim is-entering" data-a="sheet-close"></div><div class="sheet is-entering" role="dialog" aria-modal="true" aria-labelledby="sheet-h"><span class="grabber" aria-hidden="true"></span>${body}</div>`;
    sheetEl.querySelector('#sheet-h').focus();
  }
  function closeSheet(refocus) { sheet = null; sheetEl.hidden = true; sheetEl.innerHTML = ''; if (refocus && sheetReturn && document.contains(sheetReturn)) sheetReturn.focus(); sheetReturn = null; }

  /* ---------- actions ---------- */
  function pick(action, key, value) {
    app.querySelectorAll(`[data-a="${action}"]`).forEach(x => { const on = x.dataset[key] === value; x.setAttribute('aria-checked', String(on)); x.querySelector('.radio').innerHTML = on ? ico('check', 'ico--s') : ''; });
  }
  app.addEventListener('click', e => {
    const b = e.target.closest('[data-a]');
    if (!b || b.disabled) return;
    const a = b.dataset.a;
    if (a === 'back') back();
    else if (a === 'go') go(b.dataset.to);
    else if (a === 'go-root') { clearBanner(); root('setup'); if (b.dataset.to !== 'setup') go(b.dataset.to); }
    else if (a === 'toast') toast(b.dataset.msg);
    else if (a === 'leave') {
      const from = top().name, side = top().p.side;
      if (from === 'checking') { S.stage = 'waiting'; notifyLater(3500); root('setup'); toast('Still checking. We’ll notify you when it’s done.'); }
      else if (from === 'down') { S.stage = 'waiting'; notifyLater(4000); root('setup'); toast('We’ll keep trying and notify you'); }
      else if (from === 'person') waitPerson();
      else if (S.redo || side === 'support') { clearTimers(); S.redo = false; root('setup'); toast('Saved. Carry on whenever you’re ready.'); }
      else if (['capture', 'review', 'selfie'].includes(from)) {
        clearTimers();
        const any = Object.values(S.photos).some(Boolean) || S.selfie;
        if (any) { S.stage = 'notfinished'; S.resume = 'continue'; root('setup'); toast('Saved. Carry on whenever you’re ready.'); }
        else { root('setup'); toast('Stopped. No photos were kept.'); }
      }
      else root('setup');
    }
    else if (a === 'consent') { S.consent = true; track('consent_given'); go('choose'); }
    else if (a === 'not-now') { S.stage = 'notnow'; track('consent_declined'); root('setup'); go('notNow'); }
    else if (a === 'doc') { S.doc = b.dataset.doc; pick('doc', 'doc', S.doc); }
    else if (a === 'not-listed') openSheet('notlisted');
    else if (a === 'sheet-go') { closeSheet(); go(b.dataset.to); }
    else if (a === 'start-capture') {
      S.method = 'card'; S.photos = {}; S.issueShown = false; S.idName = idNameFor();
      track('id_check_started', { doc: S.doc });
      if (opts.scenario === 'camera' && !S.camOk) { track('camera_blocked'); go('camera'); return; }
      go('capture', { side: sidesFor(S.doc)[0] });
    }
    else if (a === 'camera-settings') { S.camOk = true; track('camera_allowed'); toast('In the app, this opens Settings. Camera turned on (demo)'); if (S.method === 'number') swap('selfie'); else swap('capture', { side: sidesFor(S.doc)[0] }); }
    else if (a === 'idno-go') { S.method = 'number'; S.photos = {}; S.idName = idNameFor(); track('id_number_used'); if (opts.scenario === 'camera' && !S.camOk) { track('camera_blocked'); go('camera'); return; } go('selfie'); }
    else if (a === 'shutter') { clearTimers(); capture(top().p.side); }
    else if (a === 'retake') { track('photo_retaken', { side: b.dataset.side }); swap('capture', { side: b.dataset.side }); }
    else if (a === 'accept') {
      const side = b.dataset.side;
      if (side === 'support') { S.support = true; S.nameChoice = 'both'; S.stage = 'review'; S.reviewReason = 'names'; track('name_document_added', { doc: S.supportDoc }); root('setup'); go('person'); return; }
      if (S.redo) { S.photos[side] = true; S.redo = false; S.moreDone = true; S.stage = 'review'; S.reviewReason = 'redo'; track('photo_resent', { side }); root('setup'); go('person'); return; }
      if (side === 'page' && passportExpired()) { track('passport_expired'); S.photos = {}; S.stage = 'notfinished'; S.resume = 'expired'; swap('expired'); return; }
      S.photos[side] = true; track('photo_accepted', { side });
      nav.pop(); nextAfterPhoto(side);
    }
    else if (a === 'switch-doc') { S.doc = b.dataset.doc; S.photos = {}; S.stage = 'start'; track('id_type_changed', { doc: S.doc }); swap('capture', { side: sidesFor(S.doc)[0] }); }
    else if (a === 'notify-me') { S.stage = 'waiting'; notifyLater(opts.scenario === 'down' ? 4000 : 3500); root('setup'); toast('We’ll notify you when it’s done'); }
    else if (a === 'try-again') { S.stage = 'checking'; swap('checking', { from: 2 }); }
    else if (a === 'retake-selfie') { S.photosDoneForSelfieRetry = true; S.stage = 'checking'; swap('selfie'); }
    else if (a === 'ask-person') { S.stage = 'review'; S.reviewReason = 'asked'; track('person_check_asked'); swap('person'); }
    else if (a === 'wait-person') waitPerson();
    else if (a === 'redo') { S.redo = true; track('photo_retaken', { side: b.dataset.side, asked: true }); go('capture', { side: b.dataset.side }); }
    else if (a === 'try-other-id') { S.method = 'card'; S.photos = {}; S.stage = 'start'; track('retry_with_other_id'); root('setup'); go('choose'); toast('Your selfie is kept'); }
    else if (a === 'name-opt') { S.nameOpt = b.dataset.n; pick('name-opt', 'n', S.nameOpt); }
    else if (a === 'names-go') {
      if (S.nameOpt === 'id') { S.nameChoice = 'id'; S.account = titleCase(S.idName); track('name_set_to_id'); toast(`Your account is now in the name ${S.account}`); S.stage = 'checking'; swap('checking', { from: S.method === 'number' ? 3 : 2 }); }
      else go('support');
    }
    else if (a === 'support-doc') { S.supportDoc = b.dataset.s; pick('support-doc', 's', S.supportDoc); }
    else if (a === 'support-go') go('capture', { side: 'support' });
    else if (a === 'resume') {
      const r = S.resume;
      if (['selfieAgain', 'down', 'expired', 'names', 'more'].includes(r)) go(r);
      else if (S.method === 'number') { if (!S.selfie) go('selfie'); else { S.stage = 'checking'; go('checking', { from: 0 }); } }
      else {
        const missing = sidesFor(S.doc).find(x => !S.photos[x]);
        if (missing) go('capture', { side: missing });
        else if (!S.selfie) go('selfie');
        else { S.stage = 'checking'; go('checking', { from: 0 }); }
      }
    }
    else if (a === 'banner') { const to = b.dataset.to; clearBanner(); root('setup'); if (to !== 'setup') go(to); }
    else if (a === 'mm-choice') { S.choice = b.dataset.c; pick('mm-choice', 'c', S.choice); }
    else if (a === 'mm-continue') {
      if (S.choice === 'another') { const input = app.querySelector('#tel'); input.value = ''; S.number = ''; lookup(app.querySelector('.screen'), true); input.focus(); toast('Type a number registered to you'); return; }
      S.payout = S.choice; S.stage = 'done'; track('payout_chosen', { to: S.choice }); swap('done');
    }
    else if (a === 'mpesa-go') { S.payout = 'mpesa'; S.stage = 'done'; track('payout_chosen', { to: 'mpesa' }); swap('done'); }
    else if (a === 'restart') { reset(); toast('Started again'); }
    else if (a === 'ask-delete') openSheet('delete');
    else if (a === 'sheet-close') closeSheet(true);
    else if (a === 'do-delete') {
      closeSheet(); clearTimeout(bgTimer);
      const keepDoc = S.doc; S = fresh(); S.doc = keepDoc;
      track('id_data_deleted');
      render(); toast('Deleted. Nothing about your ID is held now.');
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && sheet) closeSheet(true); });

  /* ---------- reset ---------- */
  function reset() {
    clearTimers(); clearTimeout(bgTimer); clearBanner(); closeSheet();
    S = fresh();
    nav = [{ name: 'setup', p: {} }];
    render();
  }
  document.querySelector('[data-reset]').addEventListener('click', () => { Object.assign(opts, DEFAULTS); log.length = 0; reset(); toast('Demo reset'); });

  /* ---------- Try it panel ---------- */
  // The four numbers the brief asks to watch, worked out from this visit's events.
  function metrics() {
    const n = name => log.filter(e => e.name === name).length;
    const started = n('consent_given');
    const verified = n('check_passed');
    const causes = {};
    log.forEach(e => { if (e.name === 'photo_issue') causes[ISSUE_NAME[e.props.issue]] = (causes[ISSUE_NAME[e.props.issue]] || 0) + 1; if (e.name === 'selfie_retry_needed') causes.Selfie = (causes.Selfie || 0) + 1; if (e.name === 'photo_retaken' && e.props.asked) causes['Asked by a person'] = (causes['Asked by a person'] || 0) + 1; });
    const first = log.slice().reverse().find(e => e.name === 'consent_given');
    const done = log.slice().reverse().find(e => e.name === 'check_passed');
    const secs = first && done ? Math.round((done.t - first.t) / 1000) : null;
    const people = n('check_needs_person') + n('person_check_asked') + n('name_document_added');
    return [
      ['Checks completed', started ? `${verified} of ${started} started` : 'None started yet'],
      ['Retakes, by cause', Object.keys(causes).length ? Object.entries(causes).map(([k, v]) => `${k} ${v}`).join(' · ') : 'None yet'],
      ['Time to verified', secs !== null ? `${secs} s this visit` : 'Not verified yet'],
      ['Sent to a person', started ? `${people} of ${started}` : 'None yet'],
    ];
  }
  function renderDemo() {
    if (!S) return;
    const radio = (name, v, label, cur) => `<label class="demo__opt"><input type="radio" name="${name}" value="${v}" ${cur === v ? 'checked' : ''}><span>${label}</span></label>`;
    const group = (title, name, list) => `<div class="demo__group"><h3>${title}</h3>${list.map(([v, l]) => radio(name, v, l, opts[name])).join('')}</div>`;
    demoEl.innerHTML = `<h2 id="demo-title">Try it</h2><p>Everything runs in your browser, and the camera is pretend. Pick what happens, then go through the check.</p>
      ${group('The ID photo', 'photo', [['sharp', 'Sharp first time'], ['far', 'Too far away'], ['blur', 'Blurry'], ['glare', 'Glare on the card'], ['cut', 'Part of the card cut off']])}
      ${group('How the check goes', 'scenario', [['pass', 'It passes first time'], ['camera', 'The camera is blocked'], ['name', 'His ID shows a different name'], ['dark', 'The selfie is too dark once'], ['dark3', 'The selfie is too dark every time'], ['review', 'A person needs to check it'], ['more', 'The person asks for another photo'], ['no', 'The person can’t confirm it'], ['down', 'The ID register is down']])}
      <div class="demo__group"><h3>Adrian’s passport</h3>${radio('passport', 'expired', 'Expired in March (choose Passport to see it)', opts.passport)}${radio('passport', 'valid', 'In date', opts.passport)}</div>
      <div class="demo__group"><h3>His M-Pesa number</h3>${radio('mpesa', 'mine', 'Registered in his name', opts.mpesa)}${radio('mpesa', 'other', 'Registered to someone else', opts.mpesa)}<p>Or type 711 000 482 on step 3.</p></div>
      <div class="demo__group"><div class="demo__btns"><button type="button" class="demo__btn" data-d="data">Open Your ID data</button><button type="button" class="demo__btn" data-d="restart">Start again</button></div></div>
      <div class="demo__group"><h3>What we’d measure</h3><p>The four numbers we’d watch, worked out from this visit’s events.</p><dl class="demo__metrics">${metrics().map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div>
      ${log.length ? `<div class="demo__group"><h3>Events this visit</h3><p>What analytics would record. They stay in the console and never include ID details.</p><ul class="demo__events">${log.slice(0, 6).map(ev => `<li>${esc(ev.name)}</li>`).join('')}</ul></div>` : ''}`;
  }
  demoEl.addEventListener('change', e => {
    const t = e.target;
    if (t.name === 'photo') { opts.photo = t.value; S.issueShown = false; }
    else if (t.name === 'scenario') { opts.scenario = t.value; S.downShown = false; S.noShown = false; S.camOk = false; if (S.stage !== 'notfinished') S.selfieTries = 0; }
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
