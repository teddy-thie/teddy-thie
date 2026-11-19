/* Dhamana · personal concept by Ted Thie
   A used-phone sale seen from both sides. Wanjiku's money waits in escrow until she has checked Brian's
   phone. One shared sale drives both phones and the timeline in the middle.
   Nothing here talks to a real service. Every name, number, phone and the payment partner are invented,
   and the demo never asks for a PIN, a password or any real detail. */
(() => {
  'use strict';

  /* ---------- Icons (the Day 8 Figma icon set: 24 px grid, stroked) ---------- */
  const P = {
    back: 'M19 12H5M11 6l-6 6 6 6', arrow: 'M5 12h14M13 6l6 6-6 6',
    heart: 'M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z',
    share: 'M12 15V4M8 8l4-4 4 4M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6', check: 'M5 12.5l4.5 4.5L19 7.5',
    lock: 'M7 11h10a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 17 20H7a1.5 1.5 0 0 1-1.5-1.5v-6A1.5 1.5 0 0 1 7 11zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
    pin: 'M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11zM12 12.3a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6z',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2', tag: 'M3.5 12.5v-8a1 1 0 0 1 1-1h8l8.5 8.5-9 9zM8 8h.5',
    device: 'M8 3h8a1.5 1.5 0 0 1 1.5 1.5v15A1.5 1.5 0 0 1 16 21H8a1.5 1.5 0 0 1-1.5-1.5v-15A1.5 1.5 0 0 1 8 3zM11 18h2',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5a7.5 7.5 0 0 1 15 0',
    camera: 'M4 8h3l1.5-2.5h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
    alert: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V13M12 16.5v.5',
    shield: 'M12 3l7.5 3v5.5c0 4.7-3.2 8-7.5 9.5-4.3-1.5-7.5-4.8-7.5-9.5V6zM8.75 12l2.25 2.25 4.25-4.5',
    store: 'M4 9.5L5.5 4h13L20 9.5M4.5 9.5V20h15V9.5M3.5 9.5h17M10 20v-5.5h4V20',
    refund: 'M4 12a8 8 0 1 0 2.4-5.7M4 4.5V9h4.5',
    chat: 'M4.5 5h15a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1H10L5.5 20v-3.5h-1a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
    plus: 'M12 5v14M5 12h14', close: 'M6.5 6.5l11 11M17.5 6.5l-11 11',
    info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5v.5',
    wallet: 'M4 7.5h15a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM4 7.5L15 4v3.5M16 14h.5',
    scale: 'M12 4v16M7.5 20h9M5 7.5h14M5 7.5l-2.5 6a2.5 2.5 0 0 0 5 0zM19 7.5l-2.5 6a2.5 2.5 0 0 0 5 0z',
    search: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20', del: 'M9 6h11v12H9l-6-6zM12.5 9.5l5 5M17.5 9.5l-5 5'
  };
  const ic = (n, cls) => `<svg class="i${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true"><path d="${P[n]}"/></svg>`;
  const ksh = n => 'KSh ' + n.toLocaleString('en-GB');

  /* ---------- The sale (invented) ---------- */
  const PRICE = 32000, FEE = 640, TOTAL = PRICE + FEE;
  const CODE = '482916', RETURN_CODE = '731 052';
  const BUYER_MPESA = '0712 ••• 345', SELLER_MPESA = '0722 ••• 118';
  // Story time is minutes since Thu 19 Nov 2026, 00:00. No real clock or time zone is involved.
  const DAYS = ['Thu 19 Nov', 'Fri 20 Nov', 'Sat 21 Nov', 'Sun 22 Nov', 'Mon 23 Nov', 'Tue 24 Nov', 'Wed 25 Nov', 'Thu 26 Nov'];
  const at = (d, h, m) => d * 1440 + h * 60 + m;
  const dayOf = t => DAYS[Math.min(DAYS.length - 1, Math.floor(t / 1440))];
  const hm = t => { const mins = Math.floor(t % 1440); let h = Math.floor(mins / 60); const m = mins % 60; const ap = h < 12 ? 'am' : 'pm'; h = h % 12 || 12; return `${h}:${String(m).padStart(2, '0')} ${ap}`; };
  const when = t => `${dayOf(t)}, ${hm(t)}`;
  const left = mins => {
    const s = Math.max(0, Math.ceil(mins * 60));
    if (s >= 3600) { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return `${h} h ${m} min left`; }
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} left`;
  };
  const CHECKS = [
    ['IMEI matches', 'Dial *#06#: it should end in 4417'],
    ['Screen and touch', 'No dead spots, no burn-in'],
    ['Cameras, front and back', 'Both focus and take a photo'],
    ['Charges with your cable', 'The battery shows it’s charging'],
    ['Google account removed', 'Settings › Accounts is empty']
  ];
  const REASONS = {
    locked: ['Locked to someone’s account', 'Asks for the last owner’s sign-in', 'lock', 'locked to a Google account'],
    described: ['Not as described', 'Condition or storage is different', 'info', 'not as described'],
    broken: ['Doesn’t work properly', 'Screen, cameras or charging', 'alert', 'doesn’t work properly'],
    mind: ['I changed my mind', 'It works, I just don’t want it', 'refund', 'changed her mind']
  };
  const SHOTS = [['Screen on', 'Bright, no apps open', 'front'], ['Back', 'Flat, in daylight', 'back'], ['Left edge', 'Buttons and frame', 'edge'], ['Right edge', 'Buttons and frame', 'edge'], ['IMEI screen', 'Dial *#06#', 'imei'], ['Battery health', 'Settings › Battery', 'battery']];
  const QUESTIONS = [['screen', 'Cracks on the screen?'], ['body', 'Cracks or dents on the back or frame?'], ['bio', 'Face unlock and fingerprint work?'], ['repaired', 'Ever repaired or opened?'], ['box', 'Original box included?']];
  const LISTED_AT = at(0, 9, 40);
  function grade() {
    const a = S.seller.answers;
    if (a.screen || a.body) return { label: 'Fair', lo: 20000, hi: 25000 };
    if (a.repaired || !a.bio) return { label: 'Good', lo: 26000, hi: 30000 };
    return { label: 'Very good', lo: 29000, hi: 34000 };
  }
  function conditionChips() {
    const a = S.seller.answers;
    const list = ['Battery 91%', a.screen ? 'Cracked screen' : 'Screen ✓', 'Cameras ✓', 'Charging ✓'];
    if (a.body) list.push('Dents on the frame');
    if (!a.bio) list.push('Face unlock ✗');
    if (a.repaired) list.push('Repaired before');
    return list;
  }
  const fairChip = () => { const g = grade(); return PRICE <= g.hi ? chip('safe', 'tag', 'Fair price') : chip('warn', 'tag', 'Above similar phones'); };
  const REPLIES = {
    fix: ['I’ll remove the account', 'Meet again or do it remotely within 24 hours', 'user', 'he’ll remove the account'],
    disagree: ['I disagree', 'Tell us what happened and add evidence', 'chat', 'he disagrees'],
    back: ['Take the phone back', 'Wanjiku returns it at an agent and gets a refund', 'refund', 'he’ll take it back']
  };

  /* ---------- State ---------- */
  let S;
  let timers = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function fresh(listFirst) {
    return {
      stage: 'listed',            // listed · held · checking · disputed · refunding · refunded · released · cancelled
      t: listFirst ? at(0, 9, 30) : at(0, 13, 52),
      handover: 'meet', paidAt: null, handoverAt: null, ends: null, dropped: false,
      checks: [false, false, false, false, false], paused: false,
      dispute: null, released: null, cancelled: null,
      events: [], quiet: false, actor: null,
      returnAsk: null, reminded: false, payFails: 0,
      splash: { buyer: false, seller: false }, play: { buyer: null, seller: null },
      buyer: { local: listFirst ? 'search' : 'listing', choice: 'meet', reason: 'locked', photos: 2, sheet: null, payfail: null },
      seller: { local: listFirst ? 'imei' : 'live', code: '', reply: 'fix', wrong: false, sheet: null,
        shots: SHOTS.map(() => listFirst ? 'empty' : 'ok'), blurred: false,
        answers: { screen: false, body: false, bio: true, repaired: false, box: true } }
    };
  }

  /* ---------- DOM ---------- */
  const stage = document.getElementById('stage');
  const saleEl = document.getElementById('sale');
  const conceptBar = document.getElementById('concept');
  const PH = { buyer: document.getElementById('buyer'), seller: document.getElementById('seller') };
  const part = (who, sel) => PH[who].querySelector(sel);
  const last = { buyer: null, seller: null };
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Motion (Lottie, built for this concept; the final frame stands in for reduced motion) ---------- */
  const HAS_LOTTIE = !!window.lottie;
  const MOTION = {};
  ['splash', 'held', 'released'].forEach(n => { MOTION[n] = fetch('motion/' + n + '.json').then(r => (r.ok ? r.json() : null)).catch(() => null); });
  const live = { buyer: [], seller: [] };
  function mountMotion(who, root) {
    live[who].forEach(a => a.destroy()); live[who] = [];
    const play = S.play[who]; S.play[who] = null;
    root.querySelectorAll('[data-lottie]').forEach(el => {
      const name = el.dataset.lottie;
      MOTION[name].then(data => {
        if (!data || !window.lottie || !el.isConnected) return;
        const run = !REDUCE && (name === 'splash' || play === name);
        const a = window.lottie.loadAnimation({ container: el, renderer: 'svg', loop: false, autoplay: run,
          animationData: JSON.parse(JSON.stringify(data)), rendererSettings: { preserveAspectRatio: 'xMidYMid meet' } });
        live[who].push(a); el.classList.add('is-live');
        if (!run) a.addEventListener('DOMLoaded', () => a.goToAndStop(data.op - 1, true));
      });
    });
  }
  const MARK = '<svg class="mark" viewBox="0 0 40 40" aria-hidden="true"><path d="M14 6C6.5 9.5 6.5 30.5 14 34M26 6C33.5 9.5 33.5 30.5 26 34" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><circle cx="20" cy="20" r="5.5" fill="#4B34E5"/></svg>';
  let show = 'both', narrow = false;

  const statusIcons =
    '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 13.5 1 6.2a10 10 0 0 1 14 0Z"/></svg>' +
    '<svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true"><path d="M14 1v13H1Z"/></svg>' +
    '<svg width="9" height="15" viewBox="0 0 9 15" aria-hidden="true"><path d="M3 0h3v1.5h2a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V2.5a1 1 0 0 1 1-1h2Z"/></svg>';
  document.querySelectorAll('.dh-status__icons').forEach(el => { el.innerHTML = statusIcons; });

  /* ---------- Building blocks (the Figma components, in HTML) ---------- */
  const ghost = '<span class="ib ib--ghost" aria-hidden="true"></span>';
  const bar = (title, o = {}) => `<div class="bar">${o.back ? `<button type="button" class="ib" data-act="${o.back}" aria-label="Back">${ic('back')}</button>` : ghost}<h2 class="bar__t" tabindex="-1">${title}</h2><div class="bar__r">${o.right || ghost}</div></div>`;
  const iconBtn = (icon, act, label) => `<button type="button" class="ib" data-act="${act}" aria-label="${label}">${ic(icon)}</button>`;
  const chip = (tone, icon, text, attrs = '') => `<span class="chip${tone ? ' chip--' + tone : ''}"${attrs}>${icon ? ic(icon) : ''}${text}</span>`;
  const info = (tone, icon, title, detail, trail = '') => `<div class="info"><span class="info__ic${tone ? ' info__ic--' + tone : ''}">${ic(icon)}</span><span class="info__txt"><span class="info__t">${title}</span>${detail ? `<span class="info__d">${detail}</span>` : ''}</span>${trail}</div>`;
  const note = (tone, icon, text) => `<p class="note${tone ? ' note--' + tone : ''}">${ic(icon)}<span>${text}</span></p>`;
  const hero = (state, icon, label, amount, body, pop, fx) => {
    const anim = fx && HAS_LOTTIE ? `<span class="hero__fx hero__fx--${fx}" data-lottie="${fx}" aria-hidden="true"></span>` : '';
    return `<div class="hero${state === 'released' ? ' hero--released' : ''}${pop ? ' is-pop' : ''}${anim ? ' has-fx' : ''}">${anim}<span class="hero__l">${anim ? '' : ic(icon)}${label}</span><span class="hero__a">${amount}</span><span class="hero__b">${body}</span></div>`;
  };
  const btn = (label, act, o = {}) => {
    const style = o.style || 'primary';
    const go = style === 'primary' && o.arrow !== false ? `<span class="btn__go">${ic('arrow')}</span>` : '';
    return `<button type="button" class="btn${style !== 'primary' ? ' btn--' + style : ''}" data-act="${act}"${o.arg ? ` data-arg="${o.arg}"` : ''}${o.disabled ? ' disabled' : ''}>${label}${go}</button>`;
  };
  const LABELS = { buyer: ['Pay', 'Hand over', 'Check', 'Release'], seller: ['Held', 'Hand over', 'Checking', 'Paid'] };
  function steps(who, cur) {
    const warn = cur === 'warn';
    const items = LABELS[who].map((label, i) => {
      const n = i + 1;
      let cls, dot, sr;
      if (warn && n === 3) { cls = 'is-warn'; dot = '!'; sr = ', problem reported'; }
      else if (n < (warn ? 3 : cur)) { cls = 'is-done'; dot = ic('check'); sr = ', done'; }
      else if (n === cur) { cls = 'is-cur'; dot = n; sr = ', now'; }
      else { cls = 'is-up'; dot = n; sr = ''; }
      return `<li class="${cls}"><span class="steps__dot" aria-hidden="true">${dot}</span>${label}<span class="sr-only">${sr}</span></li>`;
    }).join('');
    return `<ol class="steps" aria-label="Where the sale is">${items}</ol>`;
  }
  const tlItem = (state, title, detail) => `<li class="tl__i is-${state}"><span class="tl__m" aria-hidden="true"><span class="tl__dot">${state === 'done' ? ic('check') : ''}</span><span class="tl__line"></span></span><span class="tl__txt"><span class="info__t">${title}</span><span class="info__d">${detail}</span></span></li>`;
  const photo = `<div class="ph" role="img" aria-label="Seller photo of a navy Samsung Galaxy A55 (illustration)"><span class="ph__back"><span class="ph__lens"></span><span class="ph__lens"></span><span class="ph__lens"></span></span>${chip('media', '', '1 of 6 · seller photos')}</div>`;
  const product = sub => `<div class="card"><div class="row"><span class="thumb" aria-hidden="true"></span><span class="info__txt"><span class="info__t">Samsung Galaxy A55 · 256 GB</span><span class="info__d">${sub}</span></span></div></div>`;
  const remindAt = () => S.handover === 'agent' ? 60 : 5;
  const timerChip = () => chip(S.ends - S.t <= remindAt() ? 'warn' : 'safe', 'clock', `<span data-timer>${left(S.ends - S.t)}</span>`);
  const shots = n => Array.from({ length: n }, (_, i) => `<span class="shot" role="img" aria-label="Photo ${i + 1}: the phone asking for an account sign-in"><i>${ic(i % 2 ? 'user' : 'lock')}</i></span>`).join('');
  const evidence = n => `<div class="shots">${shots(n)}</div>`;
  const slot = (i, label, hint, kind, st) => {
    if (st === 'empty') return `<button type="button" class="slot slot--empty" data-act="s-shot" data-arg="${i}">${ic('camera')}<span class="info__t">${label}</span><span class="info__d">${hint}</span></button>`;
    const blur = st === 'blurry';
    const art = kind === 'imei' ? '<i><small>IMEI</small>…098 4417</i>' : kind === 'battery' ? '<i><small>Battery health</small>91%</i>' : '<i></i>';
    return `<button type="button" class="slot${blur ? ' slot--blurry' : ''}" data-act="s-shot" data-arg="${i}" aria-label="${label}: ${blur ? 'too blurry, tap to retake' : 'taken'}"><span class="art art--${kind}${i === 3 ? ' art--right' : ''}" aria-hidden="true">${art}</span>${blur ? `<span class="slot__flag" aria-hidden="true">${chip('warn', 'alert', 'Too blurry · retake')}</span>` : ''}<span class="slot__label" aria-hidden="true">${chip('media', blur ? '' : 'check', label)}</span></button>`;
  };

  /* ---------- Wanjiku's screens ---------- */
  function buyerScreen() {
    const b = S.buyer;
    if (S.stage === 'listed') {
      if (b.local === 'search') return ['search', `
        <div class="scr__body">${bar('Saved search')}
          <div class="empty">
            <span class="info__ic info__ic--accent">${ic('search')}</span>
            <p class="t-title">Galaxy A55 near Kilimani</p>
            <p class="t-body">Nothing listed yet. We’ll tell you the moment one is, with its IMEI already checked.</p>
            <div class="chips">${chip('', '', 'Under KSh 35,000')}${chip('', '', '256 GB')}${chip('safe', 'shield', 'IMEI checked only')}</div>
          </div>
        </div>`];
      if (b.local === 'checkout') return ['checkout', `
        <div class="scr__body">${bar('Checkout', { back: 'b-back-listing' })}
          ${product('From Brian M. · ID verified')}
          <p class="info__t" id="ho-label">How do you want to get it?</p>
          <div class="opts" role="radiogroup" aria-labelledby="ho-label">
            ${opt('meet', b.choice === 'meet', 'user', 'Meet Brian in person', 'Check it for 30 minutes on the spot', 'b-choose')}
            ${opt('agent', b.choice === 'agent', 'store', 'Collect from a pickup agent', 'Brian drops it off. You get 24 hours to check.', 'b-choose')}
          </div>
          <div class="card card--sum">
            <p class="sum"><span>Phone</span><b>${ksh(PRICE)}</b></p>
            <p class="sum"><span>Dhamana fee (2%)</span><b>${ksh(FEE)}</b></p>
            <p class="sum sum--total"><span>You pay</span><b>${ksh(TOTAL)}</b></p>
          </div>
          ${note('', 'shield', 'Held by a licensed payment partner (demo). Brian gets nothing until you release it.')}
        </div>
        <div class="scr__actions">${btn(`Pay ${ksh(TOTAL)} with M-Pesa`, 'b-pay')}<p class="t-cap">From M-Pesa ${BUYER_MPESA} (demo)</p></div>`];
      if (b.local === 'payfail') {
        const low = b.payfail === 'balance';
        return ['payfail-' + b.payfail, `
        <div class="scr__body">${bar('Pay', { back: 'b-back-checkout' })}
          <span class="info__ic info__ic--warn info__ic--lg">${ic('wallet')}</span>
          <p class="t-title">The payment didn’t go through</p>
          <p class="t-body">${low ? `M-Pesa says there isn’t enough in the account for ${ksh(TOTAL)}.` : 'The M-Pesa prompt closed before it was approved.'} Nothing was taken, and the phone is still yours to buy.</p>
          <div class="card">${low ? info('warn', 'alert', 'Not enough in M-Pesa', 'Top up, then try again') : info('warn', 'clock', 'The prompt timed out', 'It closes after 60 seconds. Try again when your phone is with you.')}</div>
          ${note('', 'info', 'If M-Pesa ever reverses a payment after it’s held, the sale is cancelled and you’re both told.')}
        </div>
        <div class="scr__actions">${btn('Try again', 'b-pay')}${btn('Back to checkout', 'b-back-checkout', { style: 'text' })}</div>`];
      }
      if (b.local === 'paying') return ['paying', `
        <div class="scr__body">${bar('Pay', { back: 'b-back-checkout' })}
          <p class="t-title">Check your phone</p>
          <p class="t-body">We sent an M-Pesa prompt for ${ksh(TOTAL)} to ${BUYER_MPESA} (demo). You approve it there. Dhamana never asks for your PIN.</p>
          <div class="card">${info('accent', 'clock', 'Waiting for M-Pesa', 'The prompt closes in 0:48')}</div>
          <div class="push"></div>
        </div>
        <div class="scr__actions">${btn('Resend the prompt', 'b-resend', { style: 'secondary' })}${btn('Cancel', 'b-back-checkout', { style: 'text' })}</div>`];
      return ['listing', `
        <div class="scr__body">${bar('Listing', { right: iconBtn('heart', 'b-save', 'Save') })}
          ${photo}
          <div class="stack"><p class="t-product">Samsung Galaxy A55 · 256 GB</p><p class="t-body">Navy · bought March 2025 · Kilimani (demo)</p></div>
          <div class="row row--between"><p class="t-amount">${ksh(PRICE)}</p>${fairChip()}</div>
          <div class="card">
            ${info('safe', 'device', 'IMEI checked', 'Valid with the Communications Authority, same model as listed')}
            ${info('accent', 'user', 'Brian M. · ID verified', '12 sales · no disputes')}
            <div class="chips">${[grade().label].concat(conditionChips()).map(c => chip('', '', c)).join('')}</div>
          </div>
        </div>
        <div class="scr__actions">${btn('Buy with Dhamana', 'b-buy')}<p class="t-cap">Held until you’ve checked the phone · ${ksh(FEE)} fee</p></div>`];
    }
    if (S.stage === 'held') {
      if (S.handover === 'agent') return ['held-agent' + (S.dropped ? '-in' : ''), `
        <div class="scr__body">${bar('Your purchase', { right: iconBtn('chat', 'chat', 'Message Brian') })}
          ${steps('buyer', 2)}
          ${hero('held', 'lock', 'Held by Dhamana', ksh(PRICE), 'Brian is paid only when you release it.', false, 'held')}
          <div class="card">
            ${S.dropped ? info('safe', 'check', 'Brian dropped it off', `${when(S.droppedAt)} · sealed bag A-2291`) : info('', 'clock', 'Waiting for Brian to drop it off', `By ${when(S.paidAt + 3 * 1440)}`)}
            ${info('accent', 'store', 'Kilimani Pickup Point (demo)', 'Argwings Kodhek Rd · open until 8 pm', '<span class="info__a">Map</span>')}
          </div>
          <div class="card card--code"><p class="code__l">Show this code at the counter</p><p class="code">482 916</p><p class="t-body">The agent checks the seal with you. Your 24 hours to check start when you collect.</p></div>
        </div>
        <div class="scr__actions">${S.dropped ? btn('I’ve collected it', 'b-collect') : btn('Cancel, full refund', 'b-cancel', { style: 'secondary' })}${btn('Message Brian', 'chat', { style: 'text' })}</div>`];
      return ['held', `
        <div class="scr__body">${bar('Your purchase', { right: iconBtn('chat', 'chat', 'Message Brian') })}
          ${steps('buyer', 2)}
          ${hero('held', 'lock', 'Held by Dhamana', ksh(PRICE), `Brian is paid only when you release it. Kept by a licensed payment partner (demo). You also paid a ${ksh(FEE)} fee.`, last.buyer !== 'held', 'held')}
          <div class="card">${info('accent', 'pin', 'Meet Brian · Sarit Centre', 'Main entrance · Fri 20 Nov, 2:00 pm', '<span class="info__a">Change</span>')}</div>
          <div class="card card--code"><p class="code__l">Your handover code</p><p class="code">482 916</p><p class="t-body">Read it to Brian once you’re holding the phone. It starts your 30 minutes to check it.</p></div>
          ${note('', 'refund', `No handover by ${when(S.paidAt + 3 * 1440)}? You get ${ksh(TOTAL)} back automatically.`)}
        </div>
        <div class="scr__actions">${btn('Message Brian', 'chat')}${btn('Cancel, full refund', 'b-cancel', { style: 'text' })}</div>`];
    }
    if (S.stage === 'checking') {
      if (b.local === 'report') return ['report', `
        <div class="scr__body">${bar('Problem', { back: 'b-back-check', right: chip('warn', 'clock', 'Timer paused') })}
          ${steps('buyer', 'warn')}
          <p class="t-title" id="why-label">What’s wrong with it?</p>
          <div class="opts" role="radiogroup" aria-labelledby="why-label">
            ${Object.entries(REASONS).map(([k, r]) => opt(k, b.reason === k, r[2], r[0], r[1], 'b-reason')).join('')}
          </div>
          ${b.reason === 'mind' ? note('', 'info', 'If the phone is as described, this isn’t a dispute. See what you can do instead.')
            : `<div class="fld"><p class="t-label">Photos (${b.photos})</p><div class="shots">${shots(b.photos)}${b.photos < 3 ? `<button type="button" class="shot shot--add" data-act="b-photo" aria-label="Add a photo">${ic('camera')}</button>` : ''}</div></div>
          ${note('warn', 'alert', 'Don’t reset or unlock the phone. Keep it as it is until we decide.')}`}
        </div>
        <div class="scr__actions">${b.reason === 'mind' ? btn('Continue', 'b-mind') : btn('Open a dispute', 'b-dispute')}${btn('Go back to checking', 'b-back-check', { style: 'text' })}</div>`];
      if (b.local === 'mind') {
        const waiting = S.returnAsk === 'pending', refused = S.returnAsk === 'no';
        return ['mind' + (waiting ? '-wait' : refused ? '-no' : ''), `
        <div class="scr__body">${bar('Problem', { back: waiting ? '' : 'b-report', right: chip('warn', 'clock', 'Timer paused') })}
          ${steps('buyer', 3)}
          <p class="t-title">That isn’t a dispute</p>
          <p class="t-body">Disputes are for phones that aren’t as described. If the phone is fine, Brian doesn’t have to take it back.</p>
          <div class="card">
            ${waiting ? info('accent', 'chat', 'Waiting for Brian', `You asked at ${hm(S.askedAt)}. His answer shows here.`) : refused ? info('warn', 'chat', 'Brian said no', 'He doesn’t have to take back a phone that’s as described.') : info('accent', 'chat', 'Ask Brian to take it back', `If he agrees, hand it back and get ${ksh(PRICE)}. The ${ksh(FEE)} fee isn’t refunded.`)}
            ${info('safe', 'check', 'Or keep it', 'Release the money, or let the timer run out.')}
          </div>
          ${note('', 'clock', 'Your timer is paused while you decide. It carries on when you go back.')}
        </div>
        <div class="scr__actions">${waiting || refused ? '' : btn('Ask Brian to take it back', 'b-ask')}${btn('Go back to checking', 'b-back-check', { style: 'text' })}</div>`];
      }
      const done = S.checks.filter(Boolean).length;
      return ['check', `
        <div class="scr__body">${bar('Check the phone', { right: timerChip() })}
          ${steps('buyer', 3)}
          <p class="t-title">Check it before you release the money</p>
          <div class="card card--list" role="group" aria-label="Checklist, ${done} of 5 done">
            ${CHECKS.map(([t, d], i) => `<button type="button" class="chk" role="checkbox" aria-checked="${S.checks[i]}" data-act="b-check" data-arg="${i}"><span class="chk__box">${ic('check')}</span><span class="info__txt"><span class="info__t">${t}</span><span class="info__d">${d}</span></span></button>`).join('')}
          </div>
          ${note('', 'clock', `If you do nothing, ${ksh(PRICE)} goes to Brian at ${hm(S.ends)}${S.handover === 'agent' ? ' on ' + dayOf(S.ends) : ''}.`)}
        </div>
        <div class="scr__actions">${btn(`Release ${ksh(PRICE)}`, 'b-release')}${btn('Something’s wrong', 'b-report', { style: 'danger' })}</div>`];
    }
    if (S.stage === 'disputed') {
      const d = S.dispute, r = REASONS[d.reason];
      const replied = d.reply && d.reply !== 'none';
      return ['dispute' + (replied ? '-r' : ''), `
        <div class="scr__body">${bar('Dispute', { right: iconBtn('chat', 'chat', 'Message Brian') })}
          ${steps('buyer', 'warn')}
          ${hero('held', 'lock', 'Still held', ksh(PRICE), `Nobody gets paid while we look into it. Your ${ksh(FEE)} fee is held too.`, false, 'held')}
          <div class="card"><ol class="tl">
            ${tlItem('warn', 'You opened a dispute', `${r[0]} · ${d.photos} photo${d.photos === 1 ? '' : 's'} · ${when(d.openedAt)}`)}
            ${replied ? tlItem('done', `Brian replied: ${REPLIES[d.reply][3]}`, when(d.replyAt)) : tlItem('cur', 'Brian replies', `By ${when(d.openedAt + 1440)}`)}
            ${tlItem(replied ? 'cur' : 'up', 'Dhamana decides', 'Within 48 hours of his reply')}
            ${tlItem('up', 'The money moves', 'Refund to you, or payment to Brian')}
          </ol></div>
          ${note('warn', 'alert', 'Keep the phone as it is. If we refund you, you return it through a pickup agent.')}
        </div>
        <div class="scr__actions">${btn('Add more evidence', 'b-more', { style: 'secondary' })}${btn('Message Brian', 'chat', { style: 'text' })}</div>`];
    }
    if (S.stage === 'refunding' || S.stage === 'refunded') {
      const done = S.stage === 'refunded';
      return ['decision' + (done ? '-done' : ''), `
        <div class="scr__body">${bar('Dispute')}
          <div class="row">${chip('safe', 'scale', `Decided · ${when(S.dispute.decidedAt)}`)}</div>
          ${done ? hero('released', 'check', 'Refunded', ksh(TOTAL), `Back on your M-Pesa ${BUYER_MPESA} (demo). Fee included.`, true)
                 : hero('released', 'check', 'Refund approved', ksh(TOTAL), `Back to your M-Pesa ${BUYER_MPESA} (demo) as soon as the agent has the phone. Fee included.`, true)}
          <div class="card">
            ${info('accent', 'scale', 'Why we decided this', S.dispute.reply === 'none' ? 'Brian didn’t reply within 24 hours.' : 'Brian couldn’t remove the Google account within 24 hours.')}
            ${done ? info('safe', 'check', 'Phone returned', `Kilimani Pickup Point · ${when(S.returnedAt)}`) : info('accent', 'store', 'Return it at Kilimani Pickup Point (demo)', `By ${when(S.dispute.decidedAt + 2 * 1440).split(',')[0]} · show code ${RETURN_CODE}`, '<span class="info__a">Map</span>')}
          </div>
          ${note('safe', 'shield', 'Brian gets his phone back from the agent. Neither of you can be charged for this sale.')}
        </div>
        <div class="scr__actions">${done ? btn('Find another phone', 'b-again') : btn('Get directions', 'map')}${btn('Read the full decision', 'decision', { style: 'text' })}</div>`];
    }
    if (S.stage === 'released') {
      const why = S.released === 'auto' ? note('', 'clock', 'Your time to check ran out, so the money went to Brian automatically.')
        : S.released === 'decision' ? note('warn', 'scale', 'Dhamana decided for Brian: he removed the account and the phone matched the listing.')
        : note('', 'info', 'Your receipt keeps the IMEI and Brian’s details, in case you need them later.');
      return ['released', `
        <div class="scr__body">${bar('Your purchase', { right: iconBtn('share', 'share', 'Share receipt') })}
          ${steps('buyer', 5)}
          ${hero('released', 'check', 'Released to Brian', ksh(PRICE), 'The phone is yours. Brian has been paid.', true, 'released')}
          <div class="card"><ol class="tl">${saleTimeline('buyer')}</ol></div>
          ${why}
        </div>
        <div class="scr__actions">${btn('Rate Brian', 'rate')}${btn('Download receipt', 'receipt', { style: 'text' })}</div>`];
    }
    // cancelled
    if (S.cancelled === 'seller') return ['cancelled-seller', `
      <div class="scr__body">${bar('Your purchase')}
        <div class="row">${chip('warn', 'close', 'Brian cancelled')}</div>
        ${hero('released', 'check', 'Refunded', ksh(TOTAL), 'Brian cancelled the sale, so the money went straight back to your M-Pesa (demo). Fee included.', true)}
        <div class="card"><ol class="tl">
          ${tlItem('done', `You paid ${ksh(TOTAL)}`, when(S.paidAt))}${tlItem('warn', 'Brian cancelled the sale', when(S.cancelledAt))}${tlItem('done', 'Refunded to your M-Pesa', when(S.cancelledAt))}
        </ol></div>
      </div>
      <div class="scr__actions">${btn('Find another phone', 'b-again')}</div>`];
    if (S.cancelled === 'return') return ['cancelled-return', `
      <div class="scr__body">${bar('Your purchase')}
        <div class="row">${chip('', 'refund', 'Returned to Brian')}</div>
        ${hero('released', 'check', 'Refunded', ksh(PRICE), `You handed the phone back and Brian confirmed it. The ${ksh(FEE)} fee isn’t refunded, because the phone was as described.`, true)}
        <div class="card"><ol class="tl">
          ${tlItem('done', `You paid ${ksh(TOTAL)}`, when(S.paidAt))}${tlItem('done', 'You asked to return it', when(S.askedAt))}${tlItem('done', 'Brian agreed and has it back', when(S.cancelledAt))}${tlItem('done', `${ksh(PRICE)} back on your M-Pesa`, when(S.cancelledAt))}
        </ol></div>
      </div>
      <div class="scr__actions">${btn('Find another phone', 'b-again')}</div>`];
    const noshow = S.cancelled === 'noshow';
    return ['cancelled', `
      <div class="scr__body">${bar('Your purchase')}
        <div class="row">${chip('warn', 'close', 'Sale cancelled')}</div>
        ${hero('released', 'check', noshow ? 'Refunded automatically' : 'Refunded', ksh(TOTAL), noshow ? `Brian didn’t hand the phone over within 3 days, so the money went back to your M-Pesa (demo). Fee included.` : 'You cancelled before the handover, so you got everything back. Fee included.', true)}
        <div class="card"><ol class="tl">
          ${tlItem('done', `You paid ${ksh(TOTAL)}`, when(S.paidAt))}
          ${noshow ? tlItem('warn', S.handover === 'agent' ? 'Brian didn’t drop it off' : 'Brian missed the meet-up', S.handover === 'agent' ? 'Kilimani Pickup Point' : 'Fri 20 Nov, 2:00 pm · Sarit Centre') + tlItem('done', 'We reminded Brian twice', 'Fri 20 Nov and Sat 21 Nov') : tlItem('done', 'You cancelled', when(S.cancelledAt))}
          ${tlItem('done', 'Refunded to your M-Pesa', when(S.cancelledAt))}
        </ol></div>
      </div>
      <div class="scr__actions">${btn('Find another phone', 'b-again')}${noshow ? btn('Report Brian', 'report-user', { style: 'text' }) : ''}</div>`];
  }

  const opt = (val, on, icon, title, detail, act) => `<button type="button" class="opt" role="radio" aria-checked="${on}" data-act="${act}" data-arg="${val}"><span class="info__ic">${ic(icon)}</span><span class="info__txt"><span class="info__t">${title}</span><span class="info__d">${detail}</span></span><span class="opt__r" aria-hidden="true"></span></button>`;

  function saleTimeline(who) {
    const me = who === 'buyer';
    const items = [tlItem('done', me ? `You paid ${ksh(TOTAL)}` : `Wanjiku paid ${ksh(TOTAL)}`, when(S.paidAt))];
    items.push(tlItem('done', S.handover === 'agent' ? (me ? 'Collected from the agent' : 'Wanjiku collected it') : (me ? 'Handed over at Sarit Centre' : 'You handed it over'), when(S.handoverAt)));
    if (S.dispute) items.push(tlItem('done', me ? 'Dispute settled' : 'Dispute settled', when(S.dispute.decidedAt || S.dispute.fixedAt)));
    const relT = S.releasedAt;
    if (S.released === 'buyer') items.push(tlItem('done', me ? `You checked ${S.checks.filter(Boolean).length} of 5` : `Wanjiku checked ${S.checks.filter(Boolean).length} of 5`, when(relT)));
    items.push(tlItem('done', me ? 'Released to Brian' : (S.released === 'auto' ? 'Her time ran out' : S.released === 'decision' ? 'Dhamana decided for you' : 'Wanjiku released the money'), when(relT)));
    if (!me) items.push(tlItem('done', 'Paid to your M-Pesa', when(relT)));
    return items.join('');
  }

  /* ---------- Brian's screens ---------- */
  function sellerScreen() {
    const s = S.seller;
    if (S.stage === 'listed') {
      if (s.local === 'imei') return ['imei', `
        <div class="scr__body">${bar('Sell a phone')}
          <div class="stack"><p class="t-step">Step 1 of 4 · IMEI</p><p class="t-title">First, check the IMEI</p></div>
          <p class="t-body">Dial *#06# on the phone you’re selling. Buyers only see phones that pass this check.</p>
          <div class="fld"><p class="t-label">IMEI, read from *#06#</p><p class="fld__box fld__box--on"><span class="fld__v">35 291 411 098 4417</span><span class="fld__ok">${ic('check')}</span></p><p class="t-cap t-cap--left">15 digits · this one is invented</p></div>
          <div class="card">${info('safe', 'device', 'Valid with the Communications Authority', 'Samsung Galaxy A55 · not blacklisted (demo check)')}</div>
          ${note('', 'info', 'Same check as sending the IMEI by SMS to 1555. We check it again at handover, so it has to match.')}
        </div>
        <div class="scr__actions">${btn('Continue', 's-photos')}${btn('Why we ask for this', 'why-imei', { style: 'text' })}</div>`];
      if (s.local === 'photos') {
        const okN = s.shots.filter(x => x === 'ok').length, blur = s.shots.includes('blurry');
        return ['photos', `
        <div class="scr__body">${bar('Your listing', { back: 's-imei' })}
          <div class="stack"><p class="t-step">Step 2 of 4 · Photos</p><p class="t-title">Take 6 photos</p><p class="t-body">Use daylight and a plain background. Buyers trust what they can see.</p></div>
          <div class="slots" role="group" aria-label="Photo guide, ${okN} of 6 taken">${SHOTS.map(([l, h, k], i) => slot(i, l, h, k, s.shots[i])).join('')}</div>
          ${blur ? note('warn', 'alert', 'The back photo is too blurry to show scratches. Retake it in better light.') : note('', 'info', 'Buyers look hardest at the IMEI and battery photos.')}
        </div>
        <div class="scr__actions">${btn('Continue', 's-condition', { disabled: okN < 6 })}<p class="t-cap${blur ? ' t-warn' : ''}">${blur ? '1 photo to retake' : okN + ' of 6 photos'}</p></div>`];
      }
      if (s.local === 'condition') {
        const g = grade();
        return ['condition', `
        <div class="scr__body">${bar('Your listing', { back: 's-photos' })}
          <div class="stack"><p class="t-step">Step 3 of 4 · Condition</p><p class="t-title">How is it, honestly?</p><p class="t-body">Your answers become the condition report buyers see, and set the price range.</p></div>
          <div class="card card--list">
            ${QUESTIONS.map(([k, q]) => `<div class="q"><span class="info__t" id="q-${k}">${q}</span><span class="seg" role="radiogroup" aria-labelledby="q-${k}">${[['yes', 'Yes'], ['no', 'No']].map(([v, l]) => `<button type="button" role="radio" aria-checked="${(v === 'yes') === s.answers[k]}" data-act="s-answer" data-arg="${k}:${v}">${l}</button>`).join('')}</span></div>`).join('')}
            <div class="q"><span class="info__txt"><span class="info__t">Battery health</span><span class="info__d">Read from your battery photo</span></span><span class="q__v">91%</span></div>
          </div>
          <div class="card card--tight"><div class="row"><span class="t-body">Condition</span>${chip('accent', 'check', g.label)}</div><p class="t-body">${g.label} A55s sell for ${ksh(g.lo)}–${g.hi.toLocaleString('en-GB')} (demo).</p></div>
        </div>
        <div class="scr__actions">${btn('Continue', 's-price')}</div>`];
      }
      if (s.local === 'price') return ['price', `
        <div class="scr__body">${bar('Your listing', { back: 's-condition' })}
          <p class="t-step">Step 4 of 4 · Price</p>
          <div class="shots"><span class="shot shot--phone"></span><span class="shot shot--phone"></span><span class="shot shot--phone"></span><span class="shot shot--add shot--count">${ic('plus')}<span class="t-cap">6 photos</span></span></div>
          <div class="card card--tight"><p class="t-label">Condition</p><div class="chips">${chip('accent', 'check', grade().label)}${conditionChips().map(c => chip('', '', c)).join('')}</div></div>
          <div class="fld"><p class="t-label">Your price</p><p class="fld__box"><span class="t-amount">${ksh(PRICE)}</span>${fairChip()}</p><p class="t-cap t-cap--left">${grade().label} A55s sold for ${ksh(grade().lo)}–${grade().hi.toLocaleString('en-GB')} this month (demo). Set by your checklist.</p></div>
          <div class="card card--sum">
            <p class="sum"><span>Buyer pays</span><b>${ksh(TOTAL)}</b></p>
            <p class="sum"><span>Dhamana fee, paid by the buyer</span><b>${ksh(FEE)}</b></p>
            <p class="sum sum--total"><span>You get</span><b>${ksh(PRICE)}</b></p>
          </div>
        </div>
        <div class="scr__actions">${btn('Publish listing', 's-publish')}<p class="t-cap">Goes live with the IMEI check badge</p></div>`];
      return ['live', `
        <div class="scr__body">${bar('Your listing', { right: iconBtn('share', 'share', 'Share listing') })}
          ${product('KSh 32,000 · Kilimani (demo)')}
          <div class="row">${chip('safe', 'check', 'Live')}${chip('', '', '23 views')}${chip('', '', '4 saves')}</div>
          <div class="card">
            ${info('safe', 'device', 'IMEI checked', 'Buyers see the badge on your listing')}
            ${info('accent', 'wallet', `You get ${ksh(PRICE)}`, `The buyer pays the ${ksh(FEE)} fee`)}
          </div>
          ${note('', 'lock', 'When someone buys, their money is held first. You’ll see it here before you leave home to meet them.')}
        </div>
        <div class="scr__actions">${btn('Share listing', 'share', { style: 'secondary' })}${btn('Edit listing', 's-imei', { style: 'text' })}</div>`];
    }
    if (S.stage === 'held') {
      if (s.local === 'code') {
        const d = s.code.padEnd(6, ' ').split('');
        const full = s.code.length === 6;
        return ['code', `
          <div class="scr__body">${bar('Hand over', { back: 's-back-sold' })}
            ${steps('seller', 2)}
            <p class="t-title">Ask Wanjiku for her code</p>
            <p class="t-body" id="code-help">${s.wrong ? '<span class="t-warn">That’s not her code. Ask her to read it again.</span>' : 'She reads it from her app once she’s holding the phone.'}</p>
            <div class="digits${s.wrong ? ' is-wrong' : ''}" role="group" aria-label="Code typed so far: ${s.code.split('').join(' ') || 'nothing yet'}">${d.map((c, i) => `<span class="${i === s.code.length ? 'is-next' : ''}" aria-hidden="true">${c.trim()}</span>`).join('')}</div>
            <div class="pad" role="group" aria-label="Number pad">${['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(k => `<button type="button" data-act="s-key" data-arg="${k}">${k}</button>`).join('')}<button type="button" class="pad__fn" data-act="s-clear">Clear</button><button type="button" data-act="s-key" data-arg="0">0</button><button type="button" class="pad__fn" data-act="s-del" aria-label="Delete">${ic('del')}</button></div>
            ${info('safe', 'device', 'IMEI ends in 4417', 'Same phone as the listing')}
          </div>
          <div class="scr__actions">${btn('Confirm handover', 's-confirm', { disabled: !full || s.wrong })}</div>`];
      }
      if (S.handover === 'agent') return ['sold-agent' + (S.dropped ? '-in' : ''), `
        <div class="scr__body">${bar('Sale', { right: iconBtn('chat', 'chat', 'Message Wanjiku') })}
          ${steps('seller', 2)}
          ${hero('held', 'lock', 'Held for you', ksh(PRICE), S.dropped ? 'Wanjiku has 24 hours to check it after she collects it. Then it’s yours.' : 'Wanjiku paid. Drop the phone at the agent, and it’s yours once she has checked it.', last.seller !== 'sold-agent', 'held')}
          <div class="card">
            ${S.dropped ? info('safe', 'check', 'Dropped off', `${when(S.droppedAt)} · sealed bag A-2291`) : info('accent', 'store', 'Drop it at Kilimani Pickup Point (demo)', `Argwings Kodhek Rd · by ${when(S.paidAt + 3 * 1440)}`, '<span class="info__a">Map</span>')}
            ${info('', 'user', 'Wanjiku K. · ID verified', '4 purchases · no disputes')}
          </div>
          ${S.dropped ? note('', 'clock', 'We’ll tell you when she collects it.') : note('', 'clock', `Drop it off by ${when(S.paidAt + 3 * 1440)}, or Wanjiku gets a full refund.`)}
        </div>
        <div class="scr__actions">${S.dropped ? btn('Message Wanjiku', 'chat', { style: 'secondary' }) : btn('I’ve dropped it off', 's-drop')}${S.dropped ? '' : btn('Cancel the sale', 's-cancel', { style: 'text' })}</div>`];
      return ['sold', `
        <div class="scr__body">${bar('Sale', { right: iconBtn('chat', 'chat', 'Message Wanjiku') })}
          ${steps('seller', 2)}
          ${hero('held', 'lock', 'Held for you', ksh(PRICE), 'Wanjiku paid. You get it when she releases it, or 30 minutes after handover if she does nothing.', last.seller !== 'sold', 'held')}
          <div class="card">
            ${info('accent', 'pin', 'Meet Wanjiku · Sarit Centre', 'Main entrance · Fri 20 Nov, 2:00 pm', '<span class="info__a">Change</span>')}
            ${info('', 'user', 'Wanjiku K. · ID verified', '4 purchases · no disputes')}
          </div>
          ${note('', 'clock', `Hand it over by ${when(S.paidAt + 3 * 1440)}, or Wanjiku gets a full refund.`)}
        </div>
        <div class="scr__actions">${btn('I’m with Wanjiku', 's-meet')}${btn('Cancel the sale', 's-cancel', { style: 'text' })}</div>`];
    }
    if (S.stage === 'checking') {
      const done = S.checks.filter(Boolean).length;
      return ['checking', `
        <div class="scr__body">${bar('Sale', { right: timerChip() })}
          ${steps('seller', 3)}
          ${hero('held', 'lock', 'Held for you', ksh(PRICE), `Comes to you at ${S.handover === 'agent' ? when(S.ends) : hm(S.ends)} unless Wanjiku reports a problem.`, false, 'held')}
          <div class="card card--list card--progress">
            <p class="t-label">Wanjiku’s checklist · ${done} of 5</p>
            ${CHECKS.map(([t], i) => `<div class="chk" role="checkbox" aria-checked="${S.checks[i]}" aria-disabled="true"><span class="chk__box">${ic('check')}</span><span class="info__t">${t.replace('your', 'her')}</span></div>`).join('')}
          </div>
          ${note('', 'info', S.paused ? 'Wanjiku has paused her timer to look at a problem.' : 'Stay close until she’s done. If she reports a problem, the money stays held while we look into it.')}
        </div>
        <div class="scr__actions">${btn('Message Wanjiku', 'chat', { style: 'secondary' })}</div>`];
    }
    if (S.stage === 'disputed') {
      const d = S.dispute, r = REASONS[d.reason];
      const replied = d.reply && d.reply !== 'none';
      const report = `<div class="card card--tight">${info('warn', r[2], r[0], d.reason === 'locked' ? '“It still asks for the last owner’s Google sign-in.”' : r[1])}${evidence(d.photos)}</div>`;
      if (!replied) return ['reply', `
        <div class="scr__body">${bar('Dispute', { right: chip('warn', 'clock', `Reply in ${Math.max(1, Math.ceil((d.openedAt + 1440 - S.t) / 60))} h`) })}
          ${steps('seller', 'warn')}
          <p class="t-title">Wanjiku reported a problem</p>
          ${report}
          <div class="opts" role="radiogroup" aria-label="Your reply">${Object.entries(REPLIES).map(([k, x]) => opt(k, s.reply === k, x[2], x[0], x[1], 's-reply')).join('')}</div>
        </div>
        <div class="scr__actions">${btn('Send reply', 's-send')}${btn('Message Wanjiku', 'chat', { style: 'text' })}</div>`];
      return ['replied', `
        <div class="scr__body">${bar('Dispute', { right: iconBtn('chat', 'chat', 'Message Wanjiku') })}
          ${steps('seller', 'warn')}
          ${hero('held', 'lock', 'Still held', ksh(PRICE), 'Nobody gets paid while Dhamana looks into it.', false, 'held')}
          ${report}
          <div class="card"><ol class="tl">
            ${tlItem('done', `You replied: ${REPLIES[d.reply][0].replace('I’ll', 'you’ll').replace('I disagree', 'you disagree')}`, when(d.replyAt))}
            ${tlItem('cur', 'Dhamana decides', 'Within 48 hours')}
          </ol></div>
        </div>
        <div class="scr__actions">${btn('Add evidence', 's-evidence', { style: 'secondary' })}</div>`];
    }
    if (S.stage === 'refunding' || S.stage === 'refunded') {
      const done = S.stage === 'refunded';
      return ['decided' + (done ? '-done' : ''), `
        <div class="scr__body">${bar('Dispute')}
          <div class="row">${chip('warn', 'scale', `Decided · ${when(S.dispute.decidedAt)}`)}</div>
          <p class="t-title">Wanjiku gets a refund</p>
          <div class="card">
            ${info('accent', 'scale', 'Why we decided this', S.dispute.reply === 'none' ? 'You didn’t reply within 24 hours.' : 'The Google account was still on the phone after 24 hours.')}
            ${done ? info('safe', 'store', 'Your phone is at the agent', 'Kilimani Pickup Point · bring your ID', '<span class="info__a">Map</span>') : info('accent', 'store', 'Your phone comes back through an agent', 'Kilimani Pickup Point (demo) · we’ll tell you when it’s there')}
          </div>
          ${note('warn', 'info', 'This shows on your record as one dispute. You weren’t charged anything.')}
        </div>
        <div class="scr__actions">${done ? btn('Get directions', 'map') : btn('Read the full decision', 'decision', { style: 'secondary' })}</div>`];
    }
    if (S.stage === 'released') return ['paid', `
      <div class="scr__body">${bar('Sale', { right: iconBtn('share', 'share', 'Share') })}
        ${steps('seller', 5)}
        ${hero('released', 'check', 'Paid out', ksh(PRICE), `Sent to your M-Pesa ${SELLER_MPESA} (demo). You paid no fees.`, true, 'released')}
        <div class="card"><ol class="tl">${saleTimeline('seller')}</ol></div>
        ${note('safe', 'shield', S.released === 'decision' ? 'Dispute settled in your favour. Your record: 13 sales · 1 dispute, settled.' : 'Your record: 13 sales · no disputes.')}
      </div>
      <div class="scr__actions">${btn('Sell another phone', 's-again')}${btn('Download receipt', 'receipt', { style: 'text' })}</div>`];
    if (S.cancelled === 'seller' || S.cancelled === 'return') {
      const ret = S.cancelled === 'return';
      return ['s-cancelled-' + S.cancelled, `
      <div class="scr__body">${bar('Sale')}
        <div class="row">${ret ? chip('', 'refund', 'Taken back') : chip('warn', 'close', 'Sale cancelled')}</div>
        <p class="t-title">${ret ? 'You took the phone back' : 'You cancelled the sale'}</p>
        <div class="card">
          ${ret ? info('', 'refund', `Wanjiku got ${ksh(PRICE)} back`, `Dhamana kept her ${ksh(FEE)} fee`) : info('warn', 'refund', `Wanjiku got ${ksh(TOTAL)} back`, 'Straight away, fee included')}
          ${info('safe', 'device', 'Your listing', ret ? 'Live again' : 'Paused. Relist it when you’re ready.')}
        </div>
        ${ret ? note('safe', 'shield', 'Taking a phone back doesn’t count against your record.') : note('warn', 'info', 'Cancelling after the buyer has paid shows on your record.')}
      </div>
      <div class="scr__actions">${btn(ret ? 'See your listing' : 'Relist the phone', 'not-in-demo')}</div>`];
    }
    const noshow = S.cancelled === 'noshow';
    return ['s-cancelled', `
      <div class="scr__body">${bar('Sale')}
        <div class="row">${chip('warn', 'close', 'Sale cancelled')}</div>
        <p class="t-title">${noshow ? 'The handover didn’t happen' : 'Wanjiku cancelled'}</p>
        <div class="card">
          ${noshow ? info('warn', 'clock', 'No handover within 3 days', `Wanjiku got her ${ksh(TOTAL)} back`) : info('', 'refund', 'She cancelled before the handover', `${ksh(TOTAL)} went back to her`)}
          ${info('safe', 'device', 'Your listing', noshow ? 'Paused. Relist it when you’re ready.' : 'Live again')}
        </div>
        ${noshow ? note('warn', 'info', 'Missed handovers show on your record.') : ''}
      </div>
      <div class="scr__actions">${btn(noshow ? 'Relist the phone' : 'See your listing', 'not-in-demo')}</div>`];
  }

  /* ---------- Sheets ---------- */
  function sheetHtml(who) {
    const k = S[who].sheet;
    if (!k) return '';
    if (k === 's-cancel') return `
      <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sc-t">
        <span class="sheet__grab" aria-hidden="true"></span>
        <p class="t-title" id="sc-t">Cancel this sale?</p>
        <p class="t-body">Wanjiku gets ${ksh(TOTAL)} back straight away. Cancelling after she’s paid shows on your record.</p>
        <div class="scr__actions scr__actions--sheet">${btn('Cancel the sale', 's-cancel-ok', { style: 'danger' })}${btn('Keep the sale', 's-sheet-close', { style: 'text' })}</div>
        <div class="dh-gesture"></div>
      </div>`;
    if (k === 'return') return `
      <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="rt-t">
        <span class="sheet__grab" aria-hidden="true"></span>
        <p class="t-title" id="rt-t">Wanjiku wants to return it</p>
        <p class="t-body">She says the phone is as described, but she’s changed her mind. You don’t have to agree.</p>
        <div class="card card--soft">
          ${info('', 'refund', 'If you agree', `Take the phone back. She gets ${ksh(PRICE)}; the fee isn’t refunded.`)}
          ${info('', 'clock', 'If you say no', 'Her timer carries on, and the money comes to you when it ends.')}
        </div>
        <div class="scr__actions scr__actions--sheet">${btn('Agree to take it back', 's-return-yes', { arrow: false })}${btn('Say no', 's-return-no', { style: 'text' })}</div>
        <div class="dh-gesture"></div>
      </div>`;
    if (k === 'mpesa') return `
      <div class="sys" role="dialog" aria-modal="true" aria-labelledby="mp-t">
        <p class="sys__from">M-Pesa (demo)</p>
        <p class="sys__t" id="mp-t">Pay ${ksh(TOTAL)} to Dhamana escrow (demo) from ${BUYER_MPESA}?</p>
        <p class="sys__d">A real phone asks for your M-Pesa PIN here. This demo never does.</p>
        <div class="sys__btns"><button type="button" data-act="b-mpesa-no">Cancel</button><button type="button" class="sys__ok" data-act="b-mpesa-ok">Approve (demo)</button></div>
      </div>`;
    if (k === 'release') {
      const done = S.checks.filter(Boolean).length;
      return `
      <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="rl-t">
        <span class="sheet__grab" aria-hidden="true"></span>
        <p class="t-title" id="rl-t">Release ${ksh(PRICE)} to Brian?</p>
        <p class="t-body">${done < 5 ? `You’ve checked ${done} of 5. ` : 'You’ve checked everything. '}Once you release it, you can’t open a dispute for this phone.</p>
        <div class="scr__actions scr__actions--sheet">${btn(`Release ${ksh(PRICE)}`, 'b-release-ok')}${btn(done < 5 ? 'Keep checking' : 'Not yet', 'b-sheet-close', { style: 'text' })}</div>
        <div class="dh-gesture"></div>
      </div>`;
    }
    if (k === 'cancel') return `
      <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="cn-t">
        <span class="sheet__grab" aria-hidden="true"></span>
        <p class="t-title" id="cn-t">Cancel and get ${ksh(TOTAL)} back?</p>
        <p class="t-body">Before the handover you can cancel for free. Brian is told straight away.</p>
        <div class="scr__actions scr__actions--sheet">${btn('Cancel the purchase', 'b-cancel-ok', { arrow: false })}${btn('Keep it', 'b-sheet-close', { style: 'text' })}</div>
        <div class="dh-gesture"></div>
      </div>`;
    return '';
  }

  /* ---------- Rendering ---------- */
  const splashScreen = () => ['splash', `<div class="splash">${HAS_LOTTIE ? '<div class="dh-lottie dh-lottie--splash" data-lottie="splash" aria-hidden="true"></div>' : `<p class="splash__still" aria-hidden="true">${MARK}<span>dhamana</span></p>`}<p class="sr-only">Dhamana is opening</p></div>`];
  function renderPhone(who) {
    const [key, html] = S.splash[who] ? splashScreen() : who === 'buyer' ? buyerScreen() : sellerScreen();
    const host = part(who, '.dh-screens');
    // Re-rendering replaces the buttons, so remember which control had focus and give it back
    const act = document.activeElement;
    const had = act && PH[who].contains(act) && act.dataset && act.dataset.act ? { act: act.dataset.act, arg: act.dataset.arg } : null;
    const changed = last[who] !== key;
    const oldBody = host.querySelector('.scr__body');
    const keep = !changed && oldBody ? oldBody.scrollTop : 0;
    const scr = document.createElement('div');
    scr.className = 'scr' + (changed && !REDUCE && last[who] !== null ? ' is-entering' : '');
    scr.innerHTML = html + '<div class="dh-gesture" aria-hidden="true"></div>';
    host.replaceChildren(scr);
    if (keep) scr.querySelector('.scr__body').scrollTop = keep;
    mountMotion(who, scr);
    const layer = part(who, '.dh-sheet-layer');
    const sh = sheetHtml(who);
    layer.hidden = !sh;
    if (layer._sh !== sh) { layer.innerHTML = sh; layer._sh = sh; }
    if (sh && S.actor === who) { const f = layer.querySelector('[data-act]'); if (f) f.focus({ preventScroll: true }); }
    else if (changed && S.actor === who && last[who] !== null) { const h = scr.querySelector('h2'); if (h) h.focus({ preventScroll: true }); }
    else if (had && !changed) {
      const same = [...PH[who].querySelectorAll(`[data-act="${had.act}"]`)].find(el => (el.dataset.arg || '') === (had.arg || ''));
      if (same && !same.disabled) same.focus({ preventScroll: true });
    }
    last[who] = key;
  }

  function moneyState() {
    switch (S.stage) {
      case 'listed': return { x: 16.66, here: 0, amount: `${ksh(TOTAL)} with Wanjiku`, sub: 'Nothing moves until she pays.' };
      case 'held': return { x: 50, here: 1, amount: `${ksh(PRICE)} held`, sub: `Plus the ${ksh(FEE)} fee. Kept by a licensed payment partner (demo), not by Brian.` };
      case 'checking': return { x: 50, here: 1, amount: `${ksh(PRICE)} held`, sub: S.paused ? 'Timer paused while Wanjiku reports a problem.' : `Goes to Brian at ${S.handover === 'agent' ? when(S.ends) : hm(S.ends)} unless Wanjiku reports a problem.` };
      case 'disputed': return { x: 50, here: 1, amount: `${ksh(PRICE)} held`, sub: 'Nobody gets paid until Dhamana decides.' };
      case 'refunding': return { x: 50, here: 1, amount: `${ksh(TOTAL)} to refund`, sub: 'Paid back when the agent has the phone.' };
      case 'cancelled': if (S.cancelled === 'return') return { x: 16.66, here: 0, safe: true, amount: `${ksh(PRICE)} back with Wanjiku`, sub: `Dhamana keeps the ${ksh(FEE)} fee. Brian has his phone back.` };
        return { x: 16.66, here: 0, safe: true, amount: `${ksh(TOTAL)} back with Wanjiku`, sub: 'Fee included. Brian keeps his phone.' };
      case 'refunded': return { x: 16.66, here: 0, safe: true, amount: `${ksh(TOTAL)} back with Wanjiku`, sub: 'Fee included. Brian keeps his phone.' };
      default: return { x: 83.33, here: 2, safe: true, amount: `${ksh(PRICE)} paid to Brian`, sub: `Dhamana keeps the ${ksh(FEE)} fee Wanjiku paid.` };
    }
  }

  function controls() {
    const b = [];
    let hint = '';
    const st = S.stage;
    if (st === 'listed') {
      if (S.buyer.local === 'paying') { b.push(['Payment fails: not enough in M-Pesa', 'fail-balance'], ['The prompt times out', 'fail-timeout']); hint = 'Or approve the prompt on Wanjiku’s phone.'; }
      else if (S.seller.local === 'photos') hint = 'Tap each photo slot on Brian’s phone. The back photo comes out blurry the first time.';
      else if (S.seller.local === 'condition') hint = 'Change an answer to see the condition and the price range move.';
      else hint = S.seller.local === 'live' || S.buyer.local !== 'search' ? 'Start on Wanjiku’s phone: tap Buy with Dhamana.' : 'Start on Brian’s phone: check the IMEI and publish the listing.';
    }
    if (st === 'held') {
      b.push(['Let 3 days pass with no handover', 'noshow']);
      hint = S.handover === 'agent' ? (S.dropped ? 'Wanjiku can collect it now.' : 'Brian drops the phone at the agent first.') : 'At the meet-up, Brian types Wanjiku’s code: <code>482 916</code>. It’s on her screen.';
    }
    if (st === 'checking') {
      if (!S.reminded && S.returnAsk !== 'pending') b.push([S.handover === 'agent' ? 'Skip to 1 hour left' : 'Skip to 5 minutes left', 'remind']);
      if (S.returnAsk !== 'pending') b.push([S.handover === 'agent' ? 'Let the 24 hours run out' : 'Let the 30 minutes run out', 'timeout']);
      hint = S.returnAsk === 'pending' ? 'Brian answers on his phone: take it back, or say no.' : 'Tick the checks on Wanjiku’s phone and watch Brian’s update. “Something’s wrong” also covers a change of mind.';
    }
    if (st === 'disputed') {
      const r = S.dispute.reply;
      if (!r) { b.push(['Let 24 hours pass with no reply', 'noreply']); hint = 'Brian replies on his phone first.'; }
      else {
        if (r === 'fix') b.push(['Brian removes the account', 'fixed']);
        b.push(['Dhamana decides: refund Wanjiku', 'refund'], ['Dhamana decides: pay Brian', 'paybrian']);
        hint = 'In the real service a person reviews both sides within 48 hours.';
      }
    }
    if (st === 'refunding') { b.push(['The agent receives the phone', 'returned']); hint = 'Wanjiku returns the phone; the refund goes out when the agent confirms.'; }
    if (st === 'released' || st === 'refunded' || st === 'cancelled') hint = 'That sale is over. Try another path below.';
    return { b, hint };
  }

  function dur(m) { const h = Math.floor(m / 60), mm = Math.round(m % 60); return h ? `${h} h ${mm} min` : `${mm} min`; }
  function metrics() {
    const paid = S.paidAt != null;
    return [
      ['Listing to first offer', paid ? dur(S.paidAt - LISTED_AT) : '—'],
      ['Checkout', paid ? (S.payFails ? `Paid after ${S.payFails} failed ${S.payFails === 1 ? 'try' : 'tries'}` : 'Paid first time') : (S.payFails ? `${S.payFails} failed ${S.payFails === 1 ? 'try' : 'tries'} so far` : '—')],
      ['Dispute', S.dispute ? `Yes · ${REASONS[S.dispute.reason][3]}` : (paid ? 'No' : '—')],
      ['Released automatically', S.released ? (S.released === 'auto' ? 'Yes' : 'No') : '—']
    ];
  }
  function renderSale() {
    const m = moneyState();
    const c = controls();
    const ev = S.events.map((e, i) => `<li class="${i === S.events.length - 1 ? 'is-new' : ''}${e.money ? ' is-money' : ''}"><time>${dayOf(e.t).slice(0, 3)} ${hm(e.t)}</time><span>${e.text}</span></li>`).join('');
    const path = (label, key) => `<button type="button" class="ctl__btn" data-path="${key}">${label}</button>`;
    saleEl.innerHTML = `
      <div><h2 id="sale-title" tabindex="-1">The sale</h2><p class="sale__clock">Demo clock <b data-clock>${when(S.t)}</b></p></div>
      <div class="money">
        <p class="money__kicker">Where the money is</p>
        <div><p class="money__amount">${m.amount}</p><p class="money__sub" data-money-sub>${m.sub}</p></div>
        <div class="track" style="--x:${m.x}%" aria-hidden="true">
          <span class="track__coin${m.safe ? ' is-safe' : ''}"></span>
          ${['Wanjiku', 'Held by Dhamana', 'Brian'].map((n, i) => `<span class="track__node${m.here === i ? ' is-here' : ''}">${n}</span>`).join('')}
        </div>
      </div>
      <div><h3>What happened</h3><ol class="events" aria-live="polite">${ev || '<li><time></time><span>Nothing yet.</span></li>'}</ol></div>
      <div class="ctl"><h3>Move time on</h3>${c.b.length ? `<div class="ctl__btns">${c.b.map(([l, k]) => `<button type="button" class="ctl__btn" data-skip="${k}">${l}</button>`).join('')}</div>` : ''}<p class="ctl__hint">${c.hint}</p></div>
      <div class="ctl"><h3>What we’d measure</h3><dl class="metrics">${metrics().map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl><p class="ctl__hint">For this sale. The real product tracks them across every sale.</p></div>
      <div class="ctl"><h3>Try another path</h3><div class="ctl__btns">${path('Start over', 'start')}${path('Brian lists it first', 'list')}${path('Collect at an agent', 'agent')}${path('Jump to the check', 'check')}${path('Jump to a dispute', 'dispute')}${path('Brian doesn’t show', 'noshow')}</div></div>`;
    const list = saleEl.querySelector('.events');
    list.scrollTop = list.scrollHeight;
  }

  function render() { renderPhone('buyer'); renderPhone('seller'); renderSale(); S.actor = null; }

  /* ---------- Notifications, toasts, events ---------- */
  function log(text, money) { S.events.push({ t: S.t, text, money: !!money }); }
  function notify(who, icon, tone, title, text) {
    if (S.quiet) return;
    const el = part(who, '.dh-notif');
    el.innerHTML = `<button type="button" class="notif" data-act="notif-close"><span class="info__ic info__ic--${tone}">${ic(icon)}</span><span class="info__txt"><span class="notif__app">Dhamana · now</span><span class="info__t">${title}</span><span class="info__d">${text}</span></span></button>`;
    el.hidden = false;
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.hidden = true; }, 5200);
  }
  function toast(who, msg) {
    const el = part(who, '.dh-toast');
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('is-on'), 2600);
  }

  /* ---------- What happens in the sale ---------- */
  function publish() {
    S.t = at(0, 9, 40); S.seller.local = 'live';
    log('<b>Brian</b> listed a Galaxy A55 for KSh 32,000 · IMEI checked');
    if (S.buyer.local === 'search') {
      S.t = at(0, 13, 52); S.buyer.local = 'listing';
      notify('buyer', 'search', 'accent', 'New match: Galaxy A55', 'KSh 32,000 · Kilimani · IMEI checked');
    }
  }
  function pay() {
    S.stage = 'held'; S.handover = S.buyer.choice; S.t = at(0, 13, 58); S.paidAt = S.t; S.buyer.sheet = null;
    S.play = { buyer: 'held', seller: 'held' };
    log(`<b>Wanjiku</b> paid ${ksh(TOTAL)} with M-Pesa (demo)`);
    log(`${ksh(PRICE)} held for Brian · ${ksh(FEE)} fee to Dhamana`, true);
    notify('seller', 'lock', 'accent', 'Wanjiku bought your Galaxy A55', S.handover === 'agent' ? `${ksh(PRICE)} is held for you. Drop it at Kilimani Pickup Point by Sun.` : `${ksh(PRICE)} is held for you. Meet her at Sarit Centre, Fri 2:00 pm.`);
  }
  function meet() { S.t = at(1, 14, 9); S.seller.local = 'code'; S.seller.code = ''; S.seller.wrong = false; log('<b>Brian</b> and <b>Wanjiku</b> meet at Sarit Centre'); }
  function drop() {
    S.dropped = true; S.t = at(0, 16, 5); S.droppedAt = S.t;
    log('<b>Brian</b> dropped it off at Kilimani Pickup Point (demo)');
    notify('buyer', 'store', 'safe', 'Brian dropped it off', 'Collect it at Kilimani Pickup Point with code 482 916.');
  }
  function handover() {
    const agent = S.handover === 'agent';
    S.stage = 'checking'; S.t = agent ? at(0, 17, 30) : at(1, 14, 12); S.handoverAt = S.t; S.ends = S.t + (agent ? 1440 : 30);
    S.seller.local = 'sold'; S.buyer.local = 'check';
    if (agent) {
      log('<b>Wanjiku</b> collected it with her code');
      log(`Her 24 hours to check started · money held until ${when(S.ends)}`, true);
      notify('seller', 'check', 'safe', 'Wanjiku collected the phone', 'She has 24 hours to check it.');
    } else {
      log('<b>Brian</b> typed her code · IMEI matched');
      log(`Her 30 minutes to check started · money held until ${hm(S.ends)}`, true);
      notify('buyer', 'clock', 'safe', 'Handover confirmed', 'Your 30 minutes to check it have started.');
    }
  }
  function release(by) {
    if (by === 'auto') S.t = S.ends;
    S.stage = 'released'; S.released = by; S.releasedAt = S.t; S.buyer.sheet = null; S.buyer.local = 'released';
    S.play = { buyer: 'released', seller: 'released' };
    log(by === 'buyer' ? `<b>Wanjiku</b> released the money after checking ${S.checks.filter(Boolean).length} of 5`
      : by === 'auto' ? 'Wanjiku’s time ran out, so the money was released'
      : '<b>Dhamana</b> decided for Brian');
    log(`${ksh(PRICE)} paid to Brian’s M-Pesa (demo)`, true);
    notify('seller', 'check', 'safe', `${ksh(PRICE)} is yours`, `Sent to your M-Pesa ${SELLER_MPESA} (demo).`);
    if (by !== 'buyer') notify('buyer', 'check', 'safe', 'Money released to Brian', by === 'auto' ? 'Your 30 minutes ran out.' : 'Dhamana decided the dispute for Brian.');
  }
  function openDispute() {
    const b = S.buyer;
    S.stage = 'disputed'; S.paused = false;
    S.dispute = { reason: b.reason, photos: b.photos, openedAt: S.t, reply: null, replyAt: null, decision: null, decidedAt: null };
    b.local = 'dispute';
    log(`<b>Wanjiku</b> opened a dispute: ${REASONS[b.reason][3]} · ${b.photos} photo${b.photos === 1 ? '' : 's'}`);
    log(`Timer stopped · ${ksh(PRICE)} stays held`, true);
    notify('seller', 'alert', 'warn', 'Wanjiku reported a problem', `Reply by ${when(S.t + 1440)}. The money stays held.`);
  }
  function sendReply() {
    const d = S.dispute;
    d.reply = S.seller.reply; S.t += 47; d.replyAt = S.t;
    log(`<b>Brian</b> replied: ${REPLIES[d.reply][3]}`);
    notify('buyer', 'chat', 'accent', 'Brian replied', REPLIES[d.reply][0] + '.');
  }
  function decide(outcome) {
    const d = S.dispute;
    S.t = Math.max(S.t + 60, at(3, 10, 15)); d.decidedAt = S.t; d.decision = outcome;
    if (outcome === 'seller') { release('decision'); return; }
    S.stage = 'refunding';
    log('<b>Dhamana</b> decided: refund Wanjiku');
    log(`Wanjiku returns the phone at Kilimani Pickup Point (demo) · code ${RETURN_CODE}`);
    notify('buyer', 'scale', 'safe', 'Refund approved', 'Return the phone at Kilimani Pickup Point to get it.');
    notify('seller', 'scale', 'warn', 'Dispute decided: refund', 'Your phone comes back through the agent.');
  }
  function fixed() {
    const d = S.dispute;
    S.t += 95; d.fixedAt = S.t;
    S.stage = 'checking'; S.checks[4] = true; S.ends = S.t + 30; S.buyer.local = 'check'; S.reminded = false;
    log('<b>Brian</b> removed the Google account · dispute closed');
    log(`Wanjiku gets 30 more minutes · money held until ${hm(S.ends)}`, true);
    notify('buyer', 'check', 'safe', 'Brian removed the account', 'Check it again. You have 30 more minutes.');
  }
  function returned() {
    S.stage = 'refunded'; S.t = at(4, 11, 20); S.returnedAt = S.t;
    log('The agent has the phone back');
    log(`${ksh(TOTAL)} refunded to Wanjiku’s M-Pesa (demo), fee included`, true);
    notify('buyer', 'refund', 'safe', `${ksh(TOTAL)} is back on your M-Pesa`, 'Fee included.');
    notify('seller', 'store', 'accent', 'Your phone is at the agent', 'Kilimani Pickup Point · bring your ID.');
  }
  function cancel(why) {
    S.stage = 'cancelled'; S.cancelled = why; S.buyer.sheet = null;
    if (why === 'noshow') {
      S.t = S.paidAt + 3 * 1440;
      log(S.handover === 'agent' ? 'Brian didn’t drop the phone off' : '<b>Brian</b> missed the meet-up at Sarit Centre');
      log('No handover within 3 days · sale cancelled');
    } else if (why === 'seller') {
      S.seller.sheet = null;
      S.t = Math.max(S.t + 5, at(0, 15, 10));
      log('<b>Brian</b> cancelled the sale after Wanjiku paid');
    } else if (why === 'return') {
      S.seller.sheet = null; S.paused = false; S.returnAsk = 'yes';
      S.t += 4;
      log('<b>Brian</b> agreed and has the phone back');
    } else {
      log('<b>Wanjiku</b> cancelled before the handover');
    }
    S.cancelledAt = S.t;
    if (why === 'return') {
      log(`${ksh(PRICE)} refunded to Wanjiku · Dhamana keeps the ${ksh(FEE)} fee`, true);
      notify('buyer', 'refund', 'safe', 'Brian agreed', `${ksh(PRICE)} is back on your M-Pesa.`);
      return;
    }
    log(`${ksh(TOTAL)} refunded to Wanjiku’s M-Pesa (demo), fee included`, true);
    const bt = { noshow: 'Refunded: Brian didn’t hand it over', seller: 'Brian cancelled the sale', buyer: 'Cancelled and refunded' }[why];
    notify('buyer', 'refund', 'safe', bt, `${ksh(TOTAL)} is back on your M-Pesa.`);
    if (why !== 'seller') notify('seller', 'close', 'warn', 'Sale cancelled', why === 'noshow' ? 'You didn’t hand it over within 3 days.' : 'Wanjiku cancelled before the handover.');
  }
  function payFail(reason) {
    S.buyer.local = 'payfail'; S.buyer.payfail = reason; S.buyer.sheet = null; S.payFails++; clearTimers();
    log(`Wanjiku’s payment didn’t go through: ${reason === 'balance' ? 'not enough in M-Pesa' : 'the prompt timed out'} · nothing taken`);
  }
  function askReturn() {
    S.returnAsk = 'pending'; S.askedAt = S.t; S.seller.sheet = 'return';
    log('<b>Wanjiku</b> asked Brian to take it back: she changed her mind');
    notify('seller', 'refund', 'accent', 'Wanjiku wants to return it', 'She says the phone is fine. You don’t have to agree.');
  }
  function returnDeclined() {
    S.returnAsk = 'no'; S.seller.sheet = null; S.paused = false; S.buyer.local = 'check'; S.t += 3;
    log('<b>Brian</b> said no to taking it back · her timer carries on');
    notify('buyer', 'chat', 'accent', 'Brian said no', 'Release the money, or let the timer run out.');
  }
  function remind() {
    if (S.reminded || S.stage !== 'checking') return false;
    S.reminded = true;
    const agent = S.handover === 'agent';
    log(`Wanjiku was reminded: ${agent ? '1 hour' : '5 minutes'} left to check`);
    notify('buyer', 'clock', 'warn', `${agent ? '1 hour' : '5 minutes'} left to check`, `Then ${ksh(PRICE)} goes to Brian. Release it or report a problem.`);
    return true;
  }

  /* ---------- Paths (the Try another path buttons, and ?path= in the address) ---------- */
  function start(path, withSplash) {
    clearTimers();
    S = fresh(path === 'list');
    if (withSplash) {
      S.splash = { buyer: true, seller: true };
      later(() => { S.splash = { buyer: false, seller: false }; render(); }, REDUCE ? 900 : 2300);
    }
    S.quiet = true;
    if (path !== 'list') { const t0 = S.t; S.t = at(0, 9, 40); log('<b>Brian</b> listed a Galaxy A55 for KSh 32,000 · IMEI checked'); S.t = t0; }
    if (path === 'agent') { S.buyer.choice = 'agent'; pay(); }
    if (path === 'check' || path === 'dispute') {
      pay(); meet(); handover();
      S.t = S.ends - (28 + 41 / 60);
      S.checks = [true, true, true, false, false];
      if (path === 'dispute') { S.t = at(1, 14, 31); S.buyer.reason = 'locked'; S.buyer.photos = 2; openDispute(); }
    }
    if (path === 'noshow') { pay(); cancel('noshow'); }
    S.quiet = false;
    if (withSplash) S.play = { buyer: null, seller: null };
    PH.buyer.querySelector('.dh-notif').hidden = true;
    PH.seller.querySelector('.dh-notif').hidden = true;
    last.buyer = last.seller = null;
    render();
  }

  /* ---------- Actions ---------- */
  const A = {
    'b-save': w => toast(w, 'Saved to your list'),
    'b-buy': () => { S.buyer.local = 'checkout'; },
    'b-back-listing': () => { S.buyer.local = 'listing'; },
    'b-choose': (w, v) => { S.buyer.choice = v; },
    'b-pay': () => { S.buyer.local = 'paying'; later(() => { if (S.buyer.local === 'paying' && S.stage === 'listed') { S.buyer.sheet = 'mpesa'; S.actor = 'buyer'; render(); } }, REDUCE ? 200 : 900); },
    'b-back-checkout': () => { S.buyer.local = 'checkout'; S.buyer.sheet = null; clearTimers(); },
    'b-resend': w => { toast(w, 'Sent again'); later(() => { if (S.buyer.local === 'paying' && S.stage === 'listed') { S.buyer.sheet = 'mpesa'; render(); } }, 600); },
    'b-mpesa-no': w => { S.buyer.sheet = null; S.buyer.local = 'checkout'; toast(w, 'Payment cancelled. Nothing was taken.'); },
    'b-mpesa-ok': () => pay(),
    'b-cancel': () => { S.buyer.sheet = 'cancel'; },
    'b-cancel-ok': () => cancel('buyer'),
    'b-sheet-close': () => { S.buyer.sheet = null; },
    'b-collect': () => handover(),
    'b-check': (w, i) => { S.checks[+i] = !S.checks[+i]; },
    'b-release': () => { S.buyer.sheet = 'release'; },
    'b-release-ok': () => release('buyer'),
    'b-report': () => { S.buyer.local = 'report'; if (!S.paused) { S.paused = true; log('<b>Wanjiku</b> is reporting a problem · timer paused'); } },
    'b-back-check': () => { S.buyer.local = 'check'; S.paused = false; },
    'b-reason': (w, v) => { S.buyer.reason = v; },
    'b-photo': () => { S.buyer.photos = Math.min(3, S.buyer.photos + 1); },
    'b-dispute': () => openDispute(),
    'b-mind': () => { S.buyer.local = 'mind'; },
    'b-ask': () => askReturn(),
    'b-more': w => { S.dispute.photos = Math.min(4, S.dispute.photos + 1); toast(w, 'Photo added. Brian and Dhamana can see it.'); },
    'b-again': () => start('start'),
    's-price': () => { S.seller.local = 'price'; },
    's-photos': () => { if (S.stage === 'listed') S.seller.local = 'photos'; },
    's-condition': () => { if (S.seller.shots.every(x => x === 'ok')) S.seller.local = 'condition'; },
    's-shot': (w, i) => { const sh = S.seller.shots; i = +i; if (sh[i] === 'blurry') sh[i] = 'ok'; else if (sh[i] === 'empty') { if (i === 1 && !S.seller.blurred) { sh[i] = 'blurry'; S.seller.blurred = true; } else sh[i] = 'ok'; } else return false; },
    's-answer': (w, a) => { const [k, v] = a.split(':'); S.seller.answers[k] = v === 'yes'; },
    's-cancel': () => { S.seller.sheet = 's-cancel'; },
    's-cancel-ok': () => cancel('seller'),
    's-sheet-close': () => { S.seller.sheet = null; },
    's-return-yes': () => cancel('return'),
    's-return-no': () => returnDeclined(),
    's-imei': () => { if (S.stage === 'listed') S.seller.local = 'imei'; },
    's-publish': () => publish(),
    's-meet': () => meet(),
    's-back-sold': () => { S.seller.local = 'sold'; },
    's-drop': () => drop(),
    's-key': (w, k) => { const s = S.seller; if (s.wrong) { s.code = ''; s.wrong = false; } if (s.code.length < 6) s.code += k; if (s.code.length === 6 && s.code !== CODE) s.wrong = true; },
    's-del': () => { const s = S.seller; s.wrong = false; s.code = s.code.slice(0, -1); },
    's-clear': () => { S.seller.code = ''; S.seller.wrong = false; },
    's-confirm': () => { if (S.seller.code === CODE) handover(); },
    's-reply': (w, v) => { S.seller.reply = v; },
    's-send': () => sendReply(),
    's-evidence': w => toast(w, 'Evidence isn’t part of this demo'),
    's-again': () => start('list'),
    'notif-close': w => { part(w, '.dh-notif').hidden = true; return false; },
    chat: w => { toast(w, 'Chat isn’t part of this concept'); return false; },
    share: w => { toast(w, 'Sharing isn’t part of this demo'); return false; },
    map: w => { toast(w, 'Maps aren’t part of this demo'); return false; },
    rate: w => { toast(w, 'Thanks. Brian’s rating is updated.'); return false; },
    receipt: w => { toast(w, 'Receipts aren’t part of this demo'); return false; },
    decision: w => { toast(w, 'The full decision isn’t part of this demo'); return false; },
    'why-imei': w => { toast(w, 'So nobody can sell a stolen or blacklisted phone'); return false; },
    'report-user': w => { toast(w, 'Reported. Thanks for telling us.'); return false; },
    'not-in-demo': w => { toast(w, 'That isn’t part of this demo'); return false; }
  };

  Object.values(PH).forEach(root => root.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled || !root.contains(el)) return;
    const who = root.dataset.who;
    const fn = A[el.dataset.act];
    if (!fn) return;
    S.actor = who;
    if (fn(who, el.dataset.arg) === false) { S.actor = null; return; }
    render();
  }));
  Object.values(PH).forEach(root => root.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const who = root.dataset.who;
    if (S[who].sheet && S[who].sheet !== 'mpesa' && S[who].sheet !== 'return') { S[who].sheet = null; S.actor = who; render(); }
  }));

  saleEl.addEventListener('click', e => {
    const p = e.target.closest('[data-path]');
    if (p) { start(p.dataset.path); saleEl.querySelector('#sale-title').focus({ preventScroll: true }); return; }
    const k = e.target.closest('[data-skip]');
    if (!k) return;
    const s = k.dataset.skip;
    if (s === 'noshow') cancel('noshow');
    if (s === 'fail-balance') payFail('balance');
    if (s === 'fail-timeout') payFail('timeout');
    if (s === 'remind') { S.t = S.ends - remindAt() + 1 / 120; remind(); }
    if (s === 'timeout') release('auto');
    if (s === 'noreply') { S.t = S.dispute.openedAt + 1440; S.dispute.reply = 'none'; log('Brian didn’t reply within 24 hours'); decide('refund'); }
    if (s === 'fixed') fixed();
    if (s === 'refund') decide('refund');
    if (s === 'paybrian') decide('seller');
    if (s === 'returned') returned();
    render();
    saleEl.querySelector('#sale-title').focus({ preventScroll: true });
  });

  /* ---------- The checking timer (real seconds, story minutes) ---------- */
  setInterval(() => {
    if (!S || S.stage !== 'checking' || S.paused) return;
    S.t += 1 / 60;
    if (S.ends - S.t <= 0) { release('auto'); render(); return; }
    if (S.ends - S.t <= remindAt() && remind()) { render(); return; }
    document.querySelectorAll('[data-timer]').forEach(el => { el.textContent = left(S.ends - S.t); });
    const c = saleEl.querySelector('[data-clock]');
    if (c) c.textContent = when(S.t);
  }, 1000);

  /* ---------- Concept bar: which phones to show ---------- */
  const showBtns = conceptBar.querySelectorAll('[data-show]');
  function applyShow() {
    const eff = narrow && show === 'both' ? 'buyer' : show;
    stage.dataset.show = eff;
    showBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.show === eff)));
  }
  showBtns.forEach(b => b.addEventListener('click', () => { show = b.dataset.show; applyShow(); fit(); }));
  conceptBar.querySelector('[data-reset]').addEventListener('click', () => { const p = new URLSearchParams(location.search).get('path'); start(p || 'start', !p); });

  function fit() {
    const bar = conceptBar.offsetHeight;
    document.documentElement.style.setProperty('--bar-h', bar + 'px');
    narrow = window.innerWidth < 1100;
    applyShow();
    const devices = document.querySelectorAll('.device');
    if (window.innerWidth <= 560) { devices.forEach(d => d.style.removeProperty('--s')); return; }
    let s = (window.innerHeight - bar - 16 - 40 - 32) / 912;
    if (stage.dataset.show === 'both') s = Math.min(s, (window.innerWidth - 340 - 80 - 48) / (2 * 432));
    else if (window.innerWidth > 820) s = Math.min(s, (window.innerWidth - 340 - 40 - 48) / 432);
    s = Math.min(1, Math.max(0.6, s));
    devices.forEach(d => d.style.setProperty('--s', s.toFixed(3)));
  }
  window.addEventListener('resize', fit);

  const q = new URLSearchParams(location.search);
  const sh = q.get('show');
  if (sh === 'buyer' || sh === 'seller') show = sh;
  fit();
  start(q.get('path') || 'start', !q.get('path'));
})();
