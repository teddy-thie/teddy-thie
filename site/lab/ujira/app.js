/* Ujira · personal concept by Ted Thie. Runs entirely in the browser: no network calls, no real money.
   Screens follow the Day 5 Figma file (M1–M12, W1–W2, E1–E4). */
(() => {
  'use strict';
  const D = window.UJ_DATA;
  const app = document.getElementById('app');
  const screensEl = document.getElementById('screens');
  const sheetEl = document.getElementById('sheet');
  const toastEl = document.getElementById('toast');
  const demoEl = document.getElementById('demo');
  const tomEl = document.getElementById('stage-tom');
  const appStage = document.getElementById('stage-app');
  const device = document.getElementById('device');
  const conceptBar = document.querySelector('.concept');

  /* ---------- helpers ---------- */
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const ymd = iso => iso.split('-').map(Number);
  const fmtDate = iso => { const [y, m, d] = ymd(iso); return `${d} ${MON[m - 1]} ${y}`; };
  const fmtShort = iso => { const [, m, d] = ymd(iso); return `${d} ${MON[m - 1]}`; };
  const utc = iso => { const [y, m, d] = ymd(iso); return Date.UTC(y, m - 1, d); };
  const addDays = (iso, n) => new Date(utc(iso) + n * 864e5).toISOString().slice(0, 10);
  const daysBetween = (a, b) => Math.round((utc(b) - utc(a)) / 864e5);
  const round2 = n => Math.round(n * 100) / 100;
  const n2 = n => Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const n0 = n => Math.round(Math.abs(n)).toLocaleString('en-US');
  const money = n => '$' + n2(n);
  const signed = (n, kind) => (kind === 'in' ? '+' : '−') + money(n);
  const ksh = n => 'KSh ' + n0(n);
  const bigUsd = n => { const [i, d] = n2(n).split('.'); return `<span class="u">$</span>${i}<span class="u">.${d}</span>`; };
  const bigKsh = n => `<span class="u">KSh </span>${n0(n)}`;
  const pad = n => String(n).padStart(2, '0');

  const ICONS = {
    'chev-l': '<path d="M15 18l-6-6 6-6"/>', 'chev-r': '<path d="M9 18l6-6-6-6"/>', 'chev-d': '<path d="M6 9l6 6 6-6"/>',
    close: '<path d="M18 6L6 18M6 6l12 12"/>', check: '<path d="M20 6L9 17l-5-5"/>', plus: '<path d="M12 5v14M5 12h14"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    home: '<path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    in: '<path d="M17 7L7 17M17 17H7V7"/>', out: '<path d="M7 17L17 7M7 7h10v10"/>',
    withdraw: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    invoice: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    statement: '<path d="M3 3v18h18"/><path d="M8 16v-4M13 16V8M18 16v-6"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>',
    bank: '<path d="M3 21h18M4 10h16M12 3l9 7H3z"/><path d="M6 10v11M10 10v11M14 10v11M18 10v11"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M10 2h4"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    split: '<path d="M16 3h5v5M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.2-2.8L3 3M21 3l-6.4 6.4"/>',
    back: '<path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><path d="M18 9l-6 6M12 9l6 6"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4"/>',
  };
  document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute" aria-hidden="true">${Object.entries(ICONS).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`).join('')}</svg>`);
  const ico = (name, cls = '') => `<svg class="ico ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const MARK = (size = 52) => `<svg width="${size}" height="${size}" viewBox="0 0 52 52" aria-hidden="true"><rect width="52" height="52" rx="14" fill="#1A73E8"/><path d="M15 22v4a11 11 0 0 0 22 0v-4" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="26" cy="14" r="4.5" fill="#2BC48A"/></svg>`;
  document.querySelector('.statusbar__icons').innerHTML = '<svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden="true"><rect y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" width="3" height="12" rx="1"/></svg><svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true"><path d="M8 2.5c2.3 0 4.4.9 6 2.4l1.1-1.2A10.2 10.2 0 0 0 8 .9 10.2 10.2 0 0 0 .9 3.7L2 4.9a8.6 8.6 0 0 1 6-2.4zm0 3.3c1.4 0 2.6.5 3.6 1.4l1.1-1.2A6.9 6.9 0 0 0 8 4.2c-1.8 0-3.5.7-4.7 1.8l1.1 1.2c1-.9 2.2-1.4 3.6-1.4zM8 9a2 2 0 0 0-1.4.6L8 11.1l1.4-1.5A2 2 0 0 0 8 9z"/></svg><svg width="27" height="13" viewBox="0 0 27 13" aria-hidden="true"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="20" height="9" rx="2" fill="currentColor"/><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2z" fill="currentColor" opacity=".5"/></svg>';

  /* ---------- state ---------- */
  let S, nav, sheet, lock, wd, view = 'app', tomNo = null, clockMin, refIx;
  const opts = { outcome: 'ok', fastLock: false, overdue: false };
  const events = [];
  const today = () => (opts.overdue ? D.overdueDay : D.today);
  const isToday = iso => iso === today();
  const when = (date, time) => (isToday(date) ? `Today, ${time}` : `${fmtDate(date)} · ${time}`);
  const whenShort = (date, time) => (isToday(date) ? `Today, ${time}` : fmtShort(date));
  const clock = () => { const t = `${pad(Math.floor(clockMin / 60))}:${pad(clockMin % 60)}`; clockMin += 2; return t; };
  const nextRef = () => D.refs[refIx++ % D.refs.length];
  const remaining = () => Math.max(0, D.mpesa.perDay - S.sentToday);
  const invoice = no => S.invoices.find(i => i.no === no);
  const record = id => S.activity.find(a => a.id === id);
  const isLate = inv => inv.status === 'open' && daysBetween(inv.due, today()) > 0;
  const lateDays = inv => daysBetween(inv.due, today());
  let uid = 100;

  function track(name, props = {}) {
    events.unshift({ name, props });
    events.length = Math.min(events.length, 6);
    // Analytics would go here. In the concept, events stay in the console and never include typed text.
    console.info('[Ujira event]', name, props);
    renderDemo();
  }

  function quote(usd, dest, rate) {
    const gross = Math.round(usd * rate);
    const fee = Math.round(gross * D.feePerThousand / 1000);
    const net = gross - fee;
    const legs = [];
    if (dest === 'mpesa') { let left = net; while (left > 0) { const a = Math.min(left, D.mpesa.perPayment); legs.push(a); left -= a; } }
    else legs.push(net);
    return { usd, dest, rate, gross, fee, net, legs };
  }
  function maxUsdFor(rem, rate) {
    if (rem <= 0) return 0;
    let u = Math.floor(rem / (1 - D.feePerThousand / 1000) / rate * 100) / 100;
    while (u > 0 && quote(u, 'mpesa', rate).net > rem) u = round2(u - 0.01);
    return u;
  }

  function reset(firstRun) {
    S = D.seed(firstRun);
    clockMin = 15 * 60 + 10; refIx = 0; opts.overdue = false; tomNo = null; uid = 100;
    nav = [{ name: S.welcome ? 'welcome' : 'home', p: {} }];
    closeSheet(true);
    render(); renderDemo();
    if (view === 'tom') renderTom();
  }

  /* ---------- navigation ---------- */
  const top = () => nav[nav.length - 1];
  function go(name, p = {}) { nav.push({ name, p }); render(true); }
  function back() { if (nav.length > 1) nav.pop(); render(true); }
  function root(name, p = {}) { nav = [{ name, p }]; render(true); }

  function render(focus) {
    const t = top();
    const s = SCREENS[t.name](t.p);
    app.classList.toggle('is-dark', !!s.dark);
    app.classList.toggle('is-dark-bottom', !!s.darkBottom);
    screensEl.innerHTML = `<div class="screen ${s.cls || ''} ${focus ? 'is-entering' : ''}" data-screen="${t.name}" tabindex="-1">${s.html}</div>${s.tabs ? tabbar(s.tabs) : ''}`;
    if (focus) { const h = screensEl.querySelector('h1'); (h || screensEl.firstElementChild).setAttribute('tabindex', '-1'); (h || screensEl.firstElementChild).focus({ preventScroll: true }); }
  }
  function tabbar(active) {
    const t = [['home', 'home', 'Home'], ['activity', 'activity', 'Activity'], ['account', 'user', 'Account']];
    return `<nav class="tabbar" aria-label="Main">${t.map(([k, i, l]) => `<button type="button" data-a="tab" data-tab="${k}" ${k === active ? 'aria-current="page"' : ''}>${ico(i)}${l}</button>`).join('')}</nav>`;
  }
  const navbar = (title, close) => `<div class="navbar"><button type="button" class="icon-btn" data-a="${close ? 'home' : 'back'}" aria-label="${close ? 'Close' : 'Back'}">${ico(close ? 'close' : 'chev-l')}</button><h1>${esc(title)}</h1></div>`;

  let toastT;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2600); }

  /* ---------- shared bits ---------- */
  function actRow(a) {
    const isIn = a.kind === 'in';
    const declined = a.outcome === 'declined';
    const sent = isIn ? a.usd : round2(a.usd - (a.refund || 0));
    const sub = isIn ? `≈ ${ksh(a.usd * a.rate)}` : declined ? 'Returned' : ksh(a.legs.filter(l => l.status === 'arrived').reduce((s, l) => s + l.amount, 0));
    const detail = isIn ? (a.no ? `Invoice ${a.no}` : 'Payment') : `${a.auto ? 'Auto-split · ' : ''}${whenShort(a.date, a.time)}`;
    return `<button type="button" class="act" data-a="go" data-to="detail" data-id="${a.id}">
      <span class="circle">${ico(isIn ? 'in' : 'out')}</span>
      <span class="act__text"><p class="t-em">${esc(a.title)}${declined ? ' · not sent' : ''}</p><p class="t-foot muted">${isIn ? `${detail} · ${whenShort(a.date, a.time)}` : detail}</p></span>
      <span class="act__amt"><p class="${isIn ? 'in' : 'out'} ${declined ? 'muted strike' : ''}">${signed(declined ? a.usd : sent, a.kind)}</p><p class="t-foot muted">${sub}</p></span></button>`;
  }
  function splitBar(legs, opts2 = {}) {
    const total = opts2.total || legs.reduce((s, x) => s + x, 0);
    const parts = [];
    if (opts2.used) parts.push(`<span class="b-grey" style="flex:${opts2.used / total}" title="Already sent today"></span>`);
    legs.forEach((x, i) => parts.push(`<span class="${i % 2 ? 'b-blue' : 'b-navy'}" style="flex:${x / total}"></span>`));
    if (opts2.left) parts.push(`<span class="b-grey" style="flex:${opts2.left / total};opacity:.45"></span>`);
    return `<div class="bar" aria-hidden="true">${parts.join('')}</div>`;
  }

  /* ---------- screens ---------- */
  const SCREENS = {
    welcome() {
      return { dark: true, darkBottom: true, cls: 'screen--welcome', html: `
        <div class="welcome">
          ${MARK(52)}
          <div class="promo" aria-hidden="true">
            <div class="promo__card promo__card--a"><span class="circle circle--green">${ico('in')}</span><span><p class="t-foot on-hero-muted">Lumen Studio paid you</p><p class="t-m on-hero">+$3,000.00</p></span></div>
            <div class="promo__card promo__card--b"><span class="circle">${ico('phone')}</span><span><p class="t-foot muted">To your M-Pesa</p><p class="t-m">KSh 387,751</p></span></div>
          </div>
          <h1 class="t-title-l on-hero">Get paid in dollars. Cash out to M-Pesa.</h1>
          <p class="t-sub on-hero-muted" style="margin-top:10px">Invoice clients abroad, hold US dollars, and withdraw when the rate suits you.</p>
          <div class="stack" style="margin-top:auto;padding-top:28px">
            <button type="button" class="btn btn--primary" data-a="start">Get started</button>
            <button type="button" class="btn btn--secondary" data-a="start" data-msg="Signing in uses Face ID or a passkey. In this demo you start fresh.">I already have an account</button>
            <p class="t-cap on-hero-muted" style="text-align:center">No passwords. You sign in with Face ID or a passkey.</p>
          </div>
        </div>` };
    },

    home() {
      const inToday = S.activity.filter(a => a.kind === 'in' && isToday(a.date)).reduce((s, a) => s + a.usd, 0);
      const empty = !S.activity.length && !S.invoices.length;
      const next = S.invoices.filter(i => i.status === 'open').sort((a, b) => a.due.localeCompare(b.due))[0];
      const todays = S.activity.filter(a => isToday(a.date));
      const earlier = S.activity.filter(a => !isToday(a.date));
      let tracker = '';
      if (next) {
        const late = isLate(next);
        const opened = next.events.some(e => e.label.startsWith('Opened'));
        tracker = `<button type="button" class="card" style="display:block;width:100%;text-align:left;margin:14px 0 0" data-a="go" data-to="invoice" data-no="${next.no}">
          <div style="display:flex;justify-content:space-between;align-items:center"><span class="t-caps muted">Next payment</span>${late ? `<span class="tag tag--warn">Overdue · ${lateDays(next)} ${lateDays(next) === 1 ? 'day' : 'days'}</span>` : `<span class="t-foot muted">Due ${fmtShort(next.due)}</span>`}</div>
          <p class="t-m" style="margin-top:6px">${bigUsd(next.usd)}</p>
          <p class="t-foot muted">${esc(D.client.name)} · ${next.no}</p>
          <div class="tracker__steps"><span class="done">Sent · ${fmtShort(next.events[1] ? next.events[1].date : next.issued)}</span><span class="sep ${opened ? 'done' : ''}"></span><span class="${opened ? 'done' : ''}">${opened ? 'Opened' : 'Not opened'}</span><span class="sep"></span><span class="${late ? 'late' : ''}">${late ? 'Late' : 'Not paid yet'}</span></div>
        </button>`;
      }
      const steps = empty ? `<div class="card card--shadow overlap" style="margin-top:-40px">
          <p class="t-em">Get paid in 3 steps</p>
          <ol class="stack" style="margin:14px 0 16px;gap:12px">
            ${[['Send an invoice', 'Your client gets a link to pay in dollars', 1], ['Your client pays', 'From any bank. Receiving costs you $0', 0], ['Withdraw when you like', 'To M-Pesa or your bank, at a clear rate', 0]].map(([a, b, on], i) => `<li style="display:flex;gap:12px;align-items:center"><span class="circle ${on ? '' : 'circle--grey'}" style="width:28px;height:28px;${on ? 'background:var(--blue);color:#fff' : ''}"><span class="t-foot">${i + 1}</span></span><span><p class="t-em ${on ? '' : 'muted'}">${a}</p><p class="t-foot muted">${b}</p></span></li>`).join('')}
          </ol>
          <button type="button" class="btn btn--primary" data-a="go" data-to="newInvoice">Create your first invoice</button>
        </div>` : '';
      return { dark: true, cls: 'screen--hero', tabs: 'home', html: `
        <section class="hero is-hero" aria-labelledby="bal-h">
          <div class="home-top"><p class="t-em">${empty ? 'Welcome' : 'Habari'}, ${esc(D.me.first)}</p>
            <button type="button" class="icon-btn icon-btn--hero" data-a="toast" data-msg="No new notifications in the demo" aria-label="Notifications">${ico('bell')}</button>
            <button type="button" class="avatar" data-a="tab" data-tab="account" aria-label="Account">${D.me.initials}</button></div>
          <div class="balance__label"><h1 id="bal-h" class="t-caps on-hero-muted">US dollars</h1>${empty ? '<span class="tag tag--pos">Verified</span>' : inToday ? `<span class="tag tag--pos">+${money(inToday).replace('.00', '')} today</span>` : ''}</div>
          <p class="t-xl balance__amount" aria-label="${money(S.usd)}">${bigUsd(S.usd)}</p>
          <div class="balance__meta"><div>
            ${empty ? '<p class="t-foot on-hero-muted">Your first payment will show up here</p>' : `<p class="t-foot on-hero-muted">≈ ${ksh(S.usd * S.rate)}</p><p class="t-foot on-hero-muted">$1 = KSh ${S.rate.toFixed(2)} · demo rate</p>`}
          </div>${empty ? '' : `<span style="text-align:right"><svg class="spark" viewBox="0 0 92 34" aria-hidden="true"><path d="M2 26 L14 24 L26 27 L38 20 L50 22 L62 15 L74 17 L90 8"/></svg><p class="t-cap on-hero-muted">7 days +0.3% (demo)</p></span>`}</div>
          ${empty ? '' : `<button type="button" class="backed" data-a="go" data-to="dollars">${ico('shield', 'ico--s')}<span>Backed 1:1 by US dollar stablecoins</span>${ico('chev-r', 'ico--s')}</button>`}
        </section>
        ${empty ? steps : `<div class="card card--shadow overlap home-actions">
          <button type="button" class="btn btn--primary" data-a="withdraw" ${S.usd < 1 ? 'disabled' : ''}>${ico('withdraw')}Withdraw</button>
          <button type="button" class="btn btn--secondary" data-a="go" data-to="newInvoice">${ico('plus')}New invoice</button>
        </div>`}
        ${empty ? `<button type="button" class="card listrow" style="margin:14px 24px 0;width:calc(100% - 48px);padding:14px 16px" data-a="go" data-to="dollars"><span class="circle" style="width:36px;height:36px">${ico('shield', 'ico--s')}</span><span class="grow"><p class="t-em">What backs your dollars</p><p class="t-foot muted">1:1 US dollar stablecoins, held for you</p></span>${ico('chev-r', 'ico--s chev')}</button>` : ''}
        <div class="pad">${tracker}</div>
        ${S.activity.length ? `<div class="sec-head"><h2 class="t-head">Recent</h2><button type="button" class="link t-foot" data-a="go" data-to="statement">Statement</button></div>
        <div class="pad">${todays.length ? `<p class="t-caps muted group-label">Today</p>${todays.slice(0, 3).map(actRow).join('')}` : ''}
          ${earlier.length ? `<p class="t-caps muted group-label">Earlier</p>${earlier.slice(0, todays.length >= 3 ? 1 : 3 - Math.min(todays.length, 2)).map(actRow).join('')}` : ''}</div>` : ''}` };
    },

    withdraw() {
      const u = parseFloat(wd.str || '0') || 0;
      const over = u > S.usd + 1e-9;
      const q = u > 0 ? quote(u, wd.dest, S.rate) : null;
      const rem = remaining();
      const overLimit = q && wd.dest === 'mpesa' && q.net > rem;
      const [ip, dp] = wd.str.split('.');
      const shown = wd.str ? `<span class="u">$</span>${Number(ip || '0').toLocaleString('en-US')}${dp !== undefined ? `<span class="u">.${dp}</span>` : ''}` : '<span class="u">$</span>0';
      let card = '';
      if (q && !over) {
        card = `<div class="card youget" aria-live="polite">
          <p class="t-caps muted">You get</p>
          <p class="t-l" style="margin:2px 0">${bigKsh(q.net)}</p>
          <p class="t-foot muted">${ksh(q.fee)} fee (0.5%) · $1 = KSh ${q.rate.toFixed(2)}</p>
          ${wd.dest === 'mpesa' ? (overLimit
            ? `<div class="notice notice--warn" style="margin-top:10px">${ico('info', 'ico--s')}<span>Over today's M-Pesa limit. ${ksh(rem)} left today.</span></div>`
            : q.legs.length > 1 ? `<div class="split-line"><span class="t-foot">Arrives as ${q.legs.length} M-Pesa payments</span><button type="button" class="link t-foot" data-a="why">Why?</button></div>${splitBar(q.legs)}` : '<p class="t-foot muted" style="margin-top:8px">Arrives in seconds, in one M-Pesa payment</p>')
            : '<p class="t-foot muted" style="margin-top:8px">One bank transfer via PesaLink, usually in minutes</p>'}
        </div>`;
      }
      return { cls: 'screen--flat', html: `${navbar('Withdraw')}
        <div style="flex:1;overflow-y:auto;min-height:0">
          <div class="pad"><div class="seg" role="radiogroup" aria-label="Send to">
            <button type="button" role="radio" aria-checked="${wd.dest === 'mpesa'}" data-a="dest" data-dest="mpesa">${ico('phone', 'ico--s')}M-Pesa</button>
            <button type="button" role="radio" aria-checked="${wd.dest === 'bank'}" data-a="dest" data-dest="bank">${ico('bank', 'ico--s')}Bank</button></div>
          <p class="to t-foot muted">To ${wd.dest === 'mpesa' ? D.me.phone : D.me.bank} · ${D.me.mpesaName}</p>
          <div class="amount" aria-live="polite"><span class="t-xl ${wd.str ? '' : 'is-empty'}"><span class="sr-only">Amount: </span>${shown}</span><span class="caret" aria-hidden="true"></span></div>
          <div class="under">${over ? `<p class="t-foot crit">More than your balance of ${money(S.usd)}</p>` : `<p class="t-foot muted">Balance ${money(S.usd)}</p><button type="button" class="mini-chip" data-a="use-all">Use all</button>`}</div></div>
          ${card}
        </div>
        <div class="wd-bottom">
          <button type="button" class="btn btn--primary" data-a="review" ${!q || over || u < 1 ? 'disabled' : ''}>Review</button>
          <div class="keypad" role="group" aria-label="Keypad">${['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'].map(k => `<button type="button" data-a="key" data-k="${k}" aria-label="${k === 'del' ? 'Delete' : k === '.' ? 'Decimal point' : k}">${k === 'del' ? ico('back') : k}</button>`).join('')}</div>
        </div>` };
    },

    result({ id }) {
      const r = record(id);
      const legsHtml = r.legs.map((l, i) => `<li class="leg"><span class="circle ${l.status === 'arrived' ? 'circle--green' : 'circle--crit'}">${ico(l.status === 'arrived' ? 'check' : 'close', 'ico--s')}</span>
        <span class="grow"><p class="t-em">${r.legs.length > 1 ? `Payment ${i + 1} of ${r.legs.length} · ` : ''}${ksh(l.amount)}</p><p class="t-foot ${l.status === 'arrived' ? 'muted' : 'crit'}">${l.status === 'arrived' ? `Arrived ${l.time} · ${l.ref}` : `${r.dest === 'mpesa' ? 'M-Pesa' : 'The bank'} declined it · ${l.time.slice(0, 5)}`}</p></span></li>`).join('');
      const toLine = r.dest === 'mpesa' ? D.me.phone : D.me.bank;
      const closeBtn = `<button type="button" class="icon-btn close-tr" data-a="home" aria-label="Close">${ico('close')}</button>`;
      if (r.outcome === 'declined') {
        return { cls: 'screen--hero', html: `<div class="result-top result-top--crit">${closeBtn}<span class="circle circle--white crit">${ico('close', 'ico--l')}</span>
            <h1 class="t-title-m">M-Pesa didn't accept it</h1><p class="t-l">${bigKsh(r.net)}</p><p class="t-foot muted">Not sent · ${fmtDate(r.date)} · ${r.time}</p></div>
          <div class="pad overlap" style="margin:-40px 24px 0;padding:0"><div class="card card--shadow">
            <p class="t-caps muted">What happened</p>
            <p class="t-sub" style="margin-top:6px">This would take ${D.me.phone} over M-Pesa's KSh 500,000 balance limit, so M-Pesa turned it down.</p>
            <div class="divider"></div>
            <div class="leg"><span class="circle circle--green">${ico('check', 'ico--s')}</span><span class="grow"><p class="t-em">${money(r.usd)} is back in your dollars</p><p class="t-foot muted">No fee charged · Ref ${r.legs[0].ref}</p></span></div>
            <div class="divider"></div>
            <div class="qrow" style="align-items:center"><span>Balance now</span><span class="t-m">${bigUsd(r.balanceAfter)}</span></div>
          </div></div>
          <div class="actions" style="padding-top:24px"><button type="button" class="btn btn--primary" data-a="retry-bank" data-usd="${r.usd}">Send to my bank instead</button><button type="button" class="btn btn--secondary" data-a="home">Try M-Pesa later</button></div>` };
      }
      if (r.outcome === 'partial') {
        const got = r.legs.filter(l => l.status === 'arrived').reduce((s, l) => s + l.amount, 0);
        return { cls: 'screen--hero', html: `<div class="result-top result-top--warn">${closeBtn}<span class="circle circle--white warn">${ico('split', 'ico--l')}</span>
            <h1 class="t-title-m">${r.legs.filter(l => l.status === 'arrived').length} of ${r.legs.length} payments arrived</h1><p class="t-l">${bigKsh(got)}</p><p class="t-foot muted">To ${toLine} · ${fmtDate(r.date)} · ${r.time}</p></div>
          <div style="margin:-40px 24px 0;position:relative"><div class="card card--shadow">
            <ul class="legs">${legsHtml}</ul>
            <div class="divider"></div>
            <div class="qrow"><span>Back in your dollars</span><span>${money(r.refund)}</span></div>
            <p class="t-foot muted">The declined payment and its share of the fee</p>
            <div class="divider"></div>
            <div class="qrow" style="align-items:center"><span>Balance now</span><span class="t-m">${bigUsd(r.balanceAfter)}</span></div>
          </div></div>
          <div class="actions" style="padding-top:24px"><button type="button" class="btn btn--primary" data-a="retry-bank" data-usd="${r.refund}">Send the rest to my bank</button><button type="button" class="btn btn--secondary" data-a="home">Keep it in dollars</button></div>` };
      }
      return { cls: 'screen--hero', html: `<div class="result-top result-top--pos">${closeBtn}<span class="circle" style="background:var(--navy);color:#fff">${ico('check', 'ico--l')}</span>
          <h1 class="t-title-m">Sent to your ${r.dest === 'mpesa' ? 'M-Pesa' : 'bank'}</h1><p class="t-l">${bigKsh(r.net)}</p><p class="t-foot">${fmtDate(r.date)} · ${r.time} · ${toLine}</p></div>
        <div style="margin:-40px 24px 0;position:relative"><div class="card card--shadow"><ul class="legs">${legsHtml}</ul></div>
          <div class="card" style="margin-top:14px"><div class="qrow"><span>You sent</span><span>${money(r.usd)}</span></div><div class="qrow"><span>Rate (demo)</span><span>$1 = KSh ${r.rate.toFixed(2)}</span></div><div class="qrow"><span>Fee (0.5%)</span><span>${ksh(r.fee)}</span></div>
            <div class="divider"></div><div class="qrow" style="align-items:center"><span>Dollars left</span><span class="t-m">${bigUsd(r.balanceAfter)}</span></div></div></div>
        <div class="actions" style="padding-top:24px"><button type="button" class="btn btn--primary" data-a="home">Done</button><button type="button" class="btn btn--secondary" data-a="toast" data-msg="Receipt shared (demo)">${ico('share')}Share receipt</button></div>` };
    },

    newInvoice() {
      const f = S.draft || (S.draft = { amount: '3,000.00', what: 'Design retainer, December', days: 30 });
      const no = nextInvoiceNo();
      const due = addDays(today(), f.days);
      return { cls: 'screen--flat', html: `${navbar('New invoice')}
        <form class="pad stack" style="flex:1;overflow-y:auto;min-height:0;padding-bottom:16px" data-form="invoice" novalidate>
          <div class="card listrow" style="padding:12px 16px 12px 14px"><span class="circle" style="font-size:13px;font-weight:600">${D.client.initials}</span><span class="grow"><p class="t-em">${D.client.name}</p><p class="t-foot muted">${D.client.email}</p></span><button type="button" class="link t-cap" data-a="toast" data-msg="Saved clients are a demo: Lumen Studio only">Change</button></div>
          <div class="field" style="text-align:center"><label for="inv-amount" class="sr-only">Amount in US dollars</label>
            <div class="amount-input"><span class="t-xl"><span class="u">$</span></span><input id="inv-amount" name="amount" class="t-xl" inputmode="decimal" autocomplete="off" value="${esc(f.amount)}" aria-describedby="inv-amount-h"></div>
            <p id="inv-amount-h" class="t-foot muted">US dollars. Tom pays from any bank</p></div>
          <div class="field"><label for="inv-what">What it's for</label><input id="inv-what" name="what" class="input" autocomplete="off" maxlength="60" value="${esc(f.what)}"></div>
          <div class="field"><span class="label" id="due-l">Due</span><div class="chips chips--fill" role="radiogroup" aria-labelledby="due-l">${[14, 30].map(d => `<button type="button" class="chip" role="radio" aria-checked="${f.days === d}" data-a="due" data-days="${d}">In ${d} days</button>`).join('')}</div><p class="t-foot muted" style="margin-top:6px">${fmtDate(due)} · invoice ${no}</p></div>
          <div class="card listrow" style="padding:12px 14px"><span class="circle">${ico('split')}</span><span class="grow"><p class="t-em" id="as-l">Auto-split when paid</p><p class="t-foot muted">${S.autoSplit.pct}% to M-Pesa, the rest stays in dollars</p></span><button type="button" class="toggle" role="switch" aria-checked="${S.autoSplit.on}" aria-labelledby="as-l" data-a="toggle-split"></button></div>
        </form>
        <div class="actions"><button type="button" class="btn btn--primary" data-a="send-invoice">Send to ${D.client.contact}</button><button type="button" class="btn btn--secondary" data-a="toast" data-msg="Invoice link copied (demo)">Copy invoice link</button></div>` };
    },

    invoice({ no }) {
      const inv = invoice(no);
      const late = isLate(inv);
      const paid = inv.status === 'paid';
      const steps = inv.events.map((e, i) => ({ label: e.label, sub: when(e.date, e.time), state: 'done', now: !paid && i === inv.events.length - 1 }));
      if (!paid) steps.push({ label: 'Paid', sub: late ? `Not yet · ${lateDays(inv)} ${lateDays(inv) === 1 ? 'day' : 'days'} late` : 'Waiting for payment', state: late ? 'late' : 'todo' });
      const tl = steps.map((s, i) => `<li><span class="tl__rail"><span class="tl__dot ${s.state === 'todo' ? 'tl__dot--todo' : s.state === 'late' ? 'tl__dot--late' : ''} ${s.now ? 'tl__dot--now' : ''}"></span>${i < steps.length - 1 ? `<span class="tl__line ${steps[i + 1].state === 'done' ? 'tl__line--done' : ''}"></span>` : ''}</span>
        <span class="tl__text"><p class="t-em ${s.state === 'todo' ? 'muted' : ''}">${esc(s.label)}</p><p class="t-foot ${s.state === 'late' ? 'warn' : 'muted'}">${esc(s.sub)}</p></span></li>`).join('');
      const tag = paid ? '<span class="tag tag--pos">Paid</span>' : late ? `<span class="tag tag--warn">Overdue · ${lateDays(inv)} ${lateDays(inv) === 1 ? 'day' : 'days'}</span>` : inv.events.some(e => e.label.startsWith('Opened')) ? '<span class="tag tag--brand">Viewed</span>' : '<span class="tag tag--neutral">Sent</span>';
      const right = paid ? `Paid ${fmtShort(inv.paidDate)}` : `${late ? 'Was due' : 'Due'} ${fmtShort(inv.due)}`;
      const rows = paid ? [['download', 'Download receipt', 'pdf'], ['user', 'See what Tom sees', 'open-tom']] : [['bell', 'Send a reminder', 'remind'], ['copy', 'Copy invoice link', 'copy'], ['user', 'See what Tom sees', 'open-tom'], ['download', 'Download PDF', 'pdf']];
      return { html: `${navbar(no)}<div class="pad stack">
          <div class="card"><div style="display:flex;justify-content:space-between;align-items:center">${tag}<span class="t-foot ${late ? 'warn' : 'muted'}">${right}</span></div>
            <p class="t-l" style="margin-top:10px">${bigUsd(inv.usd)}</p><p class="t-foot muted">${D.client.name} · ${esc(inv.what)}</p></div>
          <div class="card"><ol class="tl">${tl}</ol></div>
          ${late ? `<div class="notice notice--warn">${ico('timer', 'ico--s')}<span>Payment is ${lateDays(inv)} days late. A short, friendly reminder with the same link usually does it.</span></div>` : ''}
          <div class="card card--flush">${rows.map(([i, l, a]) => `<button type="button" class="listrow" data-a="${a}" data-no="${no}">${ico(i)}<span class="grow t-sub">${l}</span>${ico('chev-r', 'ico--s chev')}</button>`).join('')}</div>
        </div>` };
    },

    received({ id }) {
      const r = record(id);
      const sp = r.split;
      return { dark: true, cls: 'screen--hero', html: `
        <div class="result-top result-top--hero is-hero" style="padding-bottom:72px"><button type="button" class="icon-btn icon-btn--hero close-tr" data-a="home" aria-label="Close">${ico('close')}</button>
          <span class="circle circle--green">${ico('check', 'ico--l')}</span>
          <h1 class="t-title-m">Payment received</h1><p class="t-xl">+${bigUsd(r.usd)}</p>
          <p class="t-foot on-hero-muted">From ${D.client.name} · ${r.no}</p>
          <span class="tag" style="background:var(--navy-raised);color:#fff;height:26px;margin-top:6px">${when(r.date, r.time)}${sp ? ' · Auto-split on' : ''}</span></div>
        <div style="margin:-40px 24px 0;position:relative"><div class="card card--shadow">
          ${sp ? `<p class="t-caps muted">Auto-split · ${S.autoSplit.pct}% to M-Pesa</p>
            <div style="margin:10px 0 12px">${splitBar([sp.usd, r.usd - sp.usd])}</div>
            <ul class="legend"><li><span class="dot" style="background:var(--navy)"></span><span style="flex:1"><p class="t-em">To M-Pesa ${D.me.phone}</p><p class="t-foot muted">${ksh(sp.q.net)} after ${ksh(sp.q.fee)} fee</p></span><span class="t-em">${money(sp.usd)}</span></li>
              <li><span class="dot" style="background:var(--blue)"></span><span style="flex:1"><p class="t-em">Stays in dollars</p><p class="t-foot muted">Withdraw any time</p></span><span class="t-em">${money(r.usd - sp.usd)}</span></li></ul>
            ${sp.capped ? `<div class="notice notice--warn" style="margin-top:12px">${ico('info', 'ico--s')}<span>Today's M-Pesa limit only had room for ${ksh(sp.q.net)}, so the rest stayed in dollars.</span></div>` : ''}`
            : `<div class="qrow"><span>Paid by</span><span>${D.client.name}</span></div><div class="qrow"><span>Fee to receive</span><span>$0.00</span></div><div class="qrow"><span>Invoice</span><span>${r.no} · Paid</span></div><div class="qrow"><span>Receipt</span><span>Sent to ${D.client.contact}</span></div>`}
          <div class="divider"></div><div class="qrow" style="align-items:center"><span>Balance now</span><span class="t-m">${bigUsd(r.balanceAfter)}</span></div>
        </div>
        <p class="t-foot muted" style="display:flex;gap:8px;align-items:center;margin-top:14px">${sp ? `${ico('info', 'ico--s')}$1 = KSh ${sp.q.rate.toFixed(2)} · demo rate · Ref ${sp.legs[0].ref}` : `${ico('shield', 'ico--s')}<span style="flex:1">Kept in US dollars, backed 1:1 by stablecoins</span><button type="button" class="link" data-a="go" data-to="dollars">How</button>`}</p></div>
        <div class="actions" style="padding-top:24px">${sp ? `<button type="button" class="btn btn--primary" data-a="home">Done</button><button type="button" class="btn btn--secondary" data-a="go" data-to="autosplit">Change auto-split</button>` : `<button type="button" class="btn btn--primary" data-a="withdraw">Withdraw</button><button type="button" class="btn btn--secondary" data-a="home">Keep in dollars</button>`}</div>` };
    },

    dollars() {
      const qa = [['Can I withdraw any time?', 'Yes. To M-Pesa or your bank, any day.'], ['Do I earn interest?', 'No. Kenyan rules bar stablecoin interest.'], ['What if Ujira leaves Kenya?', "30 days' notice (demo) to take it all out, plus your statements."], ['Who checks the reserves?', 'An outside audit every quarter (demo).']];
      return { html: `${navbar('Your dollars')}<div class="pad stack">
        <div class="navy-card"><h2 class="t-title-m">$1 in Ujira = 1 US dollar stablecoin</h2><p class="t-foot on-hero-muted" style="margin-top:6px">Held by a licensed custodian. Never lent out.</p></div>
        <div class="card"><ol class="tl">${[['user', 'Your balance', `${money(S.usd)} in your name`], ['sparkle', 'US dollar stablecoins', `${n2(S.usd)} held 1:1, no more, no less`], ['shield', D.custodian.name, `Licensed by CBK · ${D.custodian.licence}`]].map(([i, a, b], k, arr) => `<li><span class="tl__rail" style="padding-top:0"><span class="circle">${i === 'sparkle' ? '<span class="t-em">$</span>' : ico(i)}</span>${k < arr.length - 1 ? '<span class="tl__line" style="min-height:14px"></span>' : ''}</span><span class="tl__text" style="padding-top:2px"><p class="t-em">${esc(a)}</p><p class="t-foot muted">${esc(b)}</p></span></li>`).join('')}</ol></div>
        <div class="card">${qa.map(([q, a], i) => `${i ? '<div class="divider"></div>' : ''}<h2 class="t-em">${q}</h2><p class="t-foot muted">${a}</p>`).join('')}</div>
      </div>` };
    },

    statement({ year = 2026, all = false }) {
      const pays = S.payments.filter(p => p.date.startsWith(String(year))).sort((a, b) => b.date.localeCompare(a.date));
      const total = pays.reduce((s, p) => s + p.usd, 0);
      const totalK = pays.reduce((s, p) => s + Math.round(p.usd * p.rate), 0);
      const lastM = pays.length ? Math.max(...pays.map(p => ymd(p.date)[1])) : 0;
      const byM = Array.from({ length: Math.max(lastM, 1) }, (_, m) => pays.filter(p => ymd(p.date)[1] === m + 1).reduce((s, p) => s + p.usd, 0));
      const max = Math.max(...byM, 1);
      const list = all ? pays : pays.slice(0, 3);
      return { html: `${navbar('Statement')}<div class="pad stack">
        <div class="chips" role="radiogroup" aria-label="Year">${[2026, 2025].map(y => `<button type="button" class="chip" role="radio" aria-checked="${y === year}" data-a="year" data-y="${y}">${y}</button>`).join('')}</div>
        ${pays.length ? `<div class="navy-card"><p class="t-caps on-hero-muted">Earned in ${year}</p><p class="t-l" style="margin:4px 0">${bigUsd(total)}</p><p class="t-foot on-hero-muted">≈ ${ksh(totalK)} at the rates you got</p>
          <ul class="months" aria-label="By month">${byM.map((v, m) => `<li class="${m === byM.length - 1 && year === 2026 ? 'is-now' : ''}"><i style="height:${Math.max(4, Math.round(v / max * 72))}px" title="${MON[m]}: ${money(v)}"></i><span aria-hidden="true">${MON[m][0]}</span><span class="sr-only">${MON[m]} ${money(v)}</span></li>`).join('')}</ul></div>
          <div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><h2 class="t-em">Payments and the rate used</h2>${pays.length > 3 ? `<button type="button" class="link t-foot" data-a="see-all" data-y="${year}">${all ? 'Show fewer' : `See all ${pays.length}`}</button>` : ''}</div>
            ${list.map(p => `<div class="act"><span class="circle">${ico('in')}</span><span class="act__text"><p class="t-em">${p.client}</p><p class="t-foot muted">${fmtShort(p.date)} · rate ${p.rate.toFixed(2)}</p></span><span class="act__amt"><p class="in">+${money(p.usd)}</p><p class="t-foot muted">${ksh(p.usd * p.rate)}</p></span></div>`).join('')}</div>
          <div class="btn-row"><button type="button" class="btn btn--primary" data-a="pdf">Download PDF</button><button type="button" class="btn btn--secondary" data-a="csv" data-y="${year}">Export CSV</button></div>`
          : `<div class="card" style="text-align:center;padding:28px 20px"><p class="t-title-m">Nothing in ${year} yet</p><p class="t-foot muted" style="margin-top:6px">${year === 2026 ? 'Your first paid invoice starts this year’s record, with the rate used for each payment.' : 'You joined Ujira in 2026. Earlier years are in your old provider’s statements.'}</p></div>`}
        <p class="t-foot muted">For your records. Kenya's ${year} tax return is due 30 June ${year + 1}. This isn't tax advice.</p>
      </div>` };
    },

    detail({ id }) {
      const r = record(id);
      if (r.kind === 'in') {
        return { html: `${navbar('Payment')}<div class="pad stack">
          <div class="card" style="text-align:center;padding:20px"><span class="circle circle--green" style="width:48px;height:48px;margin:0 auto 8px">${ico('in')}</span><p class="t-l">+${bigUsd(r.usd)}</p><p class="t-foot muted">From ${r.title}</p>
            <p style="margin-top:8px"><span class="tag tag--pos">Received</span> <span class="t-foot muted">${when(r.date, r.time)}</span></p></div>
          <div class="card"><div class="qrow"><span>Invoice</span><span>${r.no || '—'}</span></div><div class="qrow"><span>Fee to receive</span><span>$0.00</span></div><div class="qrow"><span>Worth then (demo)</span><span>${ksh(r.usd * r.rate)}<small>at KSh ${r.rate.toFixed(2)}</small></span></div>
            ${r.split ? `<div class="divider"></div><div class="qrow"><span>Auto-split to M-Pesa</span><span>${money(r.split.usd)}<small>${ksh(r.split.q.net)} arrived</small></span></div>` : ''}</div>
          ${r.no ? `<button type="button" class="card listrow" style="padding:13px 18px" data-a="go" data-to="invoice" data-no="${r.no}">${ico('invoice')}<span class="grow t-sub">Open invoice ${r.no}</span>${ico('chev-r', 'ico--s chev')}</button>` : ''}
        </div>` };
      }
      const got = r.legs.filter(l => l.status === 'arrived').reduce((s, l) => s + l.amount, 0);
      const tag = r.outcome === 'declined' ? '<span class="tag tag--crit">Returned</span>' : r.outcome === 'partial' ? '<span class="tag tag--warn">Part sent</span>' : '<span class="tag tag--pos">Completed</span>';
      return { html: `${navbar('Withdrawal')}<div class="pad stack">
        <div class="card" style="text-align:center;padding:20px"><span class="circle" style="width:48px;height:48px;margin:0 auto 8px">${ico('out')}</span><p class="t-l">−${bigUsd(r.usd)}</p><p class="t-foot muted">To ${r.dest === 'mpesa' ? 'M-Pesa ' + D.me.phone : D.me.bank}</p>
          <p style="margin-top:8px">${tag} <span class="t-foot muted">${fmtDate(r.date)} · ${r.time}</span></p></div>
        <div class="card"><div class="qrow"><span>Rate (demo)</span><span>$1 = KSh ${r.rate.toFixed(2)}</span></div><div class="qrow"><span>Converted</span><span>${ksh(r.gross)}</span></div><div class="qrow"><span>Fee (0.5%)</span><span>− ${ksh(r.fee)}</span></div>
          <div class="divider"></div><div class="qrow" style="align-items:center"><span>You got</span><span class="t-m">${bigKsh(got)}</span></div>
          ${r.refund ? `<div class="qrow"><span>Back in dollars</span><span>${money(r.refund)}</span></div>` : ''}
          <div class="divider"></div><div class="qrow"><span>Sent as</span><span>${r.legs.length} ${r.dest === 'mpesa' ? 'M-Pesa payment' : 'bank transfer'}${r.legs.length > 1 ? 's' : ''}</span></div>
          ${r.legs.map((l, i) => `<div class="qrow"><span>${r.legs.length > 1 ? `Payment ${i + 1}` : 'Reference'}</span><span>${r.legs.length > 1 ? `${ksh(l.amount)} · ` : ''}${l.ref}${l.status !== 'arrived' ? '<small class="crit">Declined</small>' : ''}</span></div>`).join('')}</div>
        <div class="card card--flush"><button type="button" class="listrow" data-a="toast" data-msg="Receipt download is a demo">${ico('invoice')}<span class="grow t-sub">Download receipt</span>${ico('chev-r', 'ico--s chev')}</button><button type="button" class="listrow" data-a="toast" data-msg="In the real app this opens a chat with support">${ico('info')}<span class="grow t-sub">Report a problem</span>${ico('chev-r', 'ico--s chev')}</button></div>
      </div>` };
    },

    autosplit() {
      const d = S.splitDraft || (S.splitDraft = { on: S.autoSplit.on, pct: S.autoSplit.pct });
      const last = S.payments.length ? S.payments.slice().sort((a, b) => b.date.localeCompare(a.date))[0].usd : 3000;
      const toM = round2(last * d.pct / 100);
      const q = quote(toM, 'mpesa', S.rate);
      return { cls: 'screen--flat', html: `${navbar('Auto-split')}<div class="pad stack" style="flex:1;overflow-y:auto;min-height:0;padding-bottom:16px">
        <div class="card listrow" style="padding:14px 16px"><span class="circle">${ico('split')}</span><span class="grow"><p class="t-em" id="as-on">Auto-split new payments</p><p class="t-foot muted">When a client pays, part goes to M-Pesa straight away.</p></span><button type="button" class="toggle" role="switch" aria-checked="${d.on}" aria-labelledby="as-on" data-a="draft-on"></button></div>
        <div class="card" style="${d.on ? '' : 'opacity:.5'}"><p class="t-caps muted">Send to M-Pesa</p><p class="t-l" style="margin:4px 0 10px">${d.pct}%</p>
          <div class="chips chips--fill" role="radiogroup" aria-label="Share">${[25, 40, 50, 75].map(p => `<button type="button" class="chip" role="radio" aria-checked="${d.pct === p}" data-a="draft-pct" data-pct="${p}" ${d.on ? '' : 'disabled'}>${p}%</button>`).join('')}</div></div>
        <div class="card listrow" style="padding:14px 16px"><span class="circle">${ico('phone')}</span><span class="grow"><p class="t-em">M-Pesa ${D.me.phone}</p><p class="t-foot muted">${D.me.mpesaName}</p></span><button type="button" class="link t-foot" data-a="toast" data-msg="Only numbers in your own name can be added">Change</button></div>
        <div class="card"><p class="t-caps muted">With last month's ${money(last).replace('.00', '')}</p>
          <div style="margin:10px 0 12px">${splitBar([toM, last - toM])}</div>
          <ul class="legend"><li><span class="dot" style="background:var(--navy)"></span><span style="flex:1"><p class="t-em">To M-Pesa</p><p class="t-foot muted">About ${ksh(q.net)} after fees</p></span><span class="t-em">${money(toM)}</span></li>
            <li><span class="dot" style="background:var(--blue)"></span><span style="flex:1"><p class="t-em">Stays in dollars</p><p class="t-foot muted">Withdraw any time</p></span><span class="t-em">${money(last - toM)}</span></li></ul></div>
        <p class="t-foot muted">If a split would go over today's M-Pesa limit, we keep the rest in dollars and tell you.</p>
      </div><div class="actions"><button type="button" class="btn btn--primary" data-a="split-save">Save</button></div>` };
    },

    activity() {
      const t = S.activity.filter(a => isToday(a.date)), e = S.activity.filter(a => !isToday(a.date));
      return { tabs: 'activity', html: `<div class="navbar"><h1 style="left:24px;right:24px;text-align:left;font-size:28px;font-family:var(--display);font-weight:600">Activity</h1></div>
        <div class="pad">${S.activity.length ? `${t.length ? `<p class="t-caps muted group-label">Today</p>${t.map(actRow).join('')}` : ''}${e.length ? `<p class="t-caps muted group-label">Earlier</p>${e.map(actRow).join('')}` : ''}`
          : `<div class="card" style="text-align:center;padding:28px 20px;margin-top:8px"><p class="t-em">No activity yet</p><p class="t-foot muted" style="margin-top:4px">Payments and withdrawals will show here.</p></div>`}
          ${S.invoices.length ? `<p class="t-caps muted group-label" style="margin-top:12px">Invoices</p>${S.invoices.map(i => `<button type="button" class="act" data-a="go" data-to="invoice" data-no="${i.no}"><span class="circle">${ico('invoice')}</span><span class="act__text"><p class="t-em">${i.no}</p><p class="t-foot muted">${esc(i.what)}</p></span><span class="act__amt"><p class="out">${money(i.usd)}</p><p class="t-foot ${i.status === 'paid' ? 'pos' : isLate(i) ? 'warn' : 'muted'}">${i.status === 'paid' ? 'Paid' : isLate(i) ? 'Overdue' : `Due ${fmtShort(i.due)}`}</p></span></button>`).join('')}` : ''}
        </div>` };
    },

    account() {
      const rows = [['split', 'Auto-split', S.autoSplit.on ? `On · ${S.autoSplit.pct}% to M-Pesa` : 'Off', 'autosplit'], ['phone', 'M-Pesa', `${D.me.phone} · ${D.me.mpesaName}`, null], ['bank', 'Bank', `${D.me.bank} · demo`, null], ['shield', 'Your dollars', 'What backs them and who holds them', 'dollars'], ['statement', 'Statement', 'Every payment with its rate', 'statement']];
      return { tabs: 'account', html: `<div class="navbar"><h1 style="left:24px;right:24px;text-align:left;font-size:28px;font-family:var(--display);font-weight:600">Account</h1></div>
        <div class="pad stack"><div class="card listrow" style="padding:16px 18px"><span class="avatar" style="width:48px;height:48px;background:var(--navy)">${D.me.initials}</span><span class="grow"><p class="t-head">${D.me.name}</p><p class="t-foot muted">${D.me.email}</p></span><span class="tag tag--pos">Verified</span></div>
          <div class="card card--flush">${rows.map(([i, a, b, to]) => `<button type="button" class="listrow" ${to ? `data-a="go" data-to="${to}"` : 'data-a="toast" data-msg="Payout accounts are fixed in the demo"'}>${ico(i)}<span class="grow"><p class="t-sub">${a}</p><p class="t-foot muted">${b}</p></span>${ico('chev-r', 'ico--s chev')}</button>`).join('')}</div>
          <p class="t-foot muted">You sign in with Face ID or a passkey. Ujira never asks for a PIN or password.</p></div>` };
    },
  };

  function nextInvoiceNo() {
    const max = S.invoices.reduce((m, i) => Math.max(m, Number(i.no.slice(-4))), 0);
    return `UJ-DEMO-${String(max + 1 || 1).padStart(4, '0')}`;
  }

  /* ---------- sheets ---------- */
  function openSheet(name, p = {}) { const fresh = !sheet; sheet = { name, p }; renderSheet(fresh); }
  function closeSheet(silent) {
    sheet = null; stopLock(); sheetEl.hidden = true; sheetEl.innerHTML = '';
    if (!silent) { const s = screensEl.querySelector('[data-a="review"]') || screensEl.querySelector('h1'); if (s) s.focus({ preventScroll: true }); }
  }
  function renderSheet(fresh) {
    if (!sheet) return;
    const body = SHEETS[sheet.name](sheet.p);
    sheetEl.hidden = false;
    sheetEl.innerHTML = `<div class="scrim ${fresh ? 'is-entering' : ''}" data-a="close-sheet"></div><div class="sheet ${fresh ? 'is-entering' : ''}" role="dialog" aria-modal="true" aria-labelledby="sheet-h"><span class="grabber" aria-hidden="true"></span>${body}</div>`;
    const h = sheetEl.querySelector('#sheet-h'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    bindHold();
  }
  const sheetHead = title => `<div class="sheet__head"><h2 id="sheet-h" class="t-head">${title}</h2><button type="button" class="icon-btn icon-btn--subtle" data-a="close-sheet" aria-label="Close">${ico('close', 'ico--s')}</button></div>`;

  const SHEETS = {
    quote() {
      const L = lock; const q = L.q;
      const secs = Math.max(0, Math.ceil((L.until - Date.now()) / 1000));
      return `${sheetHead('Review')}
        ${L.was ? `<div class="notice notice--warn">${ico('timer', 'ico--s')}<span>The rate changed while you were deciding. Here's the new amount.</span></div>` : ''}
        <div class="conv"><div class="conv__row"><span class="t-sub muted">You send</span><span class="t-m">${bigUsd(q.usd)}</span></div>
          <div class="conv__row" style="align-items:flex-start"><span class="t-sub muted" style="padding-top:6px">You get</span><span style="text-align:right"><span class="t-m">${bigKsh(q.net)}</span>${L.was ? `<p class="t-cap muted">was <span class="strike">${ksh(L.was)}</span></p>` : `<p class="t-cap muted">To ${q.dest === 'mpesa' ? 'M-Pesa' : 'your bank'}</p>`}</span></div></div>
        <div><div class="qrow"><span>Rate (demo)</span><span>$1 = KSh ${q.rate.toFixed(2)}<small>Mid-market (demo), no markup</small></span></div>
          <div class="qrow"><span>Fee</span><span>${ksh(q.fee)}<small>0.5%, already taken off</small></span></div>
          <div class="qrow"><span>Arrives</span><span>${q.dest === 'mpesa' ? 'In seconds' : 'Usually in minutes'}<small>${q.dest === 'mpesa' ? `${q.legs.length} M-Pesa payment${q.legs.length > 1 ? 's' : ''}` : 'One PesaLink transfer'}</small></span></div></div>
        ${q.legs.length > 1 ? `<div>${splitBar(q.legs)}<div style="display:flex;justify-content:space-between;margin-top:6px"><span class="t-foot muted">${q.legs.map(ksh).join(' + ')}</span><button type="button" class="link t-foot" data-a="see-plan">See plan</button></div></div>` : ''}
        <span class="lock ${secs <= 10 ? 'is-low' : ''}" data-lock>${ico('timer', 'ico--s')}<span>${L.was ? 'New rate locked' : 'Rate locked'} for ${Math.floor(secs / 60)}:${pad(secs % 60)}</span></span>
        <button type="button" class="hold" data-hold aria-describedby="hold-h">${ico('shield')}<span>Hold to confirm</span></button>
        <p id="hold-h" class="t-cap muted">Press and hold for a second. ${q.dest === 'mpesa' ? 'If M-Pesa turns a payment down, the dollars come back to you, fee included.' : 'If the bank turns it down, the dollars come back to you.'}</p>`;
    },
    split({ from }) {
      const q = from === 'quote' && lock ? lock.q : quote(parseFloat(wd.str) || 0, 'mpesa', S.rate);
      const rem = remaining();
      const left = Math.max(0, rem - q.net);
      return `${sheetHead('Split plan')}
        <p class="t-sub">M-Pesa takes up to KSh 250,000 a payment and KSh 500,000 a day. So ${ksh(q.net)} goes as ${q.legs.length} payments, seconds apart.</p>
        <div class="card" style="background:var(--bg)"><p class="t-caps muted">Today's M-Pesa limit</p><div style="margin:10px 0 12px">${splitBar(q.legs, { total: D.mpesa.perDay, used: S.sentToday, left })}</div>
          <ul class="legend">${S.sentToday ? `<li><span class="dot" style="background:var(--line)"></span><span class="t-foot" style="flex:1">Already sent today</span><span class="t-em">${ksh(S.sentToday)}</span></li>` : ''}
            ${q.legs.map((x, i) => `<li><span class="dot" style="background:${i % 2 ? 'var(--blue)' : 'var(--navy)'}"></span><span class="t-foot" style="flex:1">Payment ${i + 1}</span><span class="t-em">${ksh(x)}</span></li>`).join('')}
            <li><span class="dot" style="background:var(--line);opacity:.45"></span><span class="t-foot" style="flex:1">Left today</span><span class="t-em">${ksh(left)}</span></li></ul></div>
        <div class="notice notice--pos">${ico('shield', 'ico--s')}<span>If one payment fails, only that part comes back to your dollars, with its share of the fee.</span></div>
        <button type="button" class="btn btn--primary" data-a="plan-ok" data-from="${from || ''}">Got it</button>
        <button type="button" class="btn btn--secondary" data-a="to-bank">Send to my bank in one go</button>`;
    },
    limit({ pick = 'bank' }) {
      const u = parseFloat(wd.str) || 0;
      const q = quote(u, 'mpesa', S.rate);
      const rem = remaining();
      const maxU = maxUsdFor(rem, S.rate);
      const opts2 = [['bank', 'bank', 'Send it all to my bank', `${ksh(quote(u, 'bank', S.rate).net)} · usually in minutes`]];
      if (maxU >= 1) opts2.push(['allowed', 'phone', 'Send what M-Pesa allows', `${ksh(quote(maxU, 'mpesa', S.rate).net)} now (${money(maxU)})`]);
      opts2.push(['tomorrow', 'timer', 'Try again tomorrow', 'Your M-Pesa limit resets overnight']);
      const used = S.sentToday;
      return `${sheetHead("Over today's M-Pesa limit")}
        <p class="t-foot muted">M-Pesa allows KSh 500,000 a day. ${used ? `You've withdrawn ${ksh(used)} to it today, so ${ksh(rem)} is left.` : 'This withdrawal is more than that on its own.'}</p>
        <div><div class="bar" aria-hidden="true">${used ? `<span class="b-navy" style="flex:${used}"></span>` : ''}${rem ? `<span class="b-grey" style="flex:${rem}"></span>` : ''}</div>
          <div style="display:flex;justify-content:space-between;margin-top:8px" class="t-cap"><span class="muted">Used ${ksh(used)}</span><span>Left ${ksh(rem)}</span></div>
          <p class="t-foot warn" style="display:flex;gap:8px;align-items:center;margin-top:8px">${ico('info', 'ico--s')}${ksh(q.net)} is ${ksh(q.net - rem)} more than ${used ? 'is left today' : 'the daily limit'}.</p></div>
        <p class="t-caps muted" id="lim-l">What would you like to do?</p>
        <div class="stack" style="gap:8px" role="radiogroup" aria-labelledby="lim-l">${opts2.map(([k, i, t, d]) => `<button type="button" class="opt" role="radio" aria-checked="${pick === k}" data-a="limit-pick" data-v="${k}"><span class="circle" style="width:36px;height:36px;background:${pick === k ? '#fff' : 'var(--bg)'};color:var(--ink)">${ico(i, 'ico--s')}</span><span class="grow"><p class="t-em">${t}</p><p class="t-foot muted">${d}</p></span><span class="radio">${pick === k ? ico('check', 'ico--s') : ''}</span></button>`).join('')}</div>
        <button type="button" class="btn btn--primary" data-a="limit-go" data-v="${pick}">Continue</button>`;
    },
  };

  /* ---------- quote lock ---------- */
  function openQuote(dest) {
    stopLock();
    const u = parseFloat(wd.str) || 0;
    if (dest) wd.dest = dest;
    const secs = opts.fastLock ? 5 : D.lockSeconds;
    lock = { q: quote(u, wd.dest, S.rate), until: Date.now() + secs * 1000, was: null };
    track('quote_viewed', { dest: wd.dest, usd: u, payments: lock.q.legs.length });
    render();
    openSheet('quote');
    startLock();
  }
  function startLock() {
    stopLock();
    lock.timer = setInterval(() => {
      if (!lock || !sheet || sheet.name !== 'quote') return;
      const secs = Math.max(0, Math.ceil((lock.until - Date.now()) / 1000));
      const el = sheetEl.querySelector('[data-lock]');
      if (el) { el.lastElementChild.textContent = `${lock.was ? 'New rate locked' : 'Rate locked'} for ${Math.floor(secs / 60)}:${pad(secs % 60)}`; el.classList.toggle('is-low', secs <= 10); }
      if (secs <= 0 && !holding) expireQuote();
    }, 250);
  }
  function stopLock() { if (lock && lock.timer) { clearInterval(lock.timer); lock.timer = null; } }
  function expireQuote() {
    const old = lock.q;
    S.rate = round2(S.rate + D.rateDrift);
    lock.q = quote(old.usd, old.dest, S.rate);
    lock.was = old.net;
    lock.until = Date.now() + D.lockSeconds * 1000;
    track('quote_expired', { old_rate: old.rate, new_rate: S.rate });
    renderSheet();
    startLock();
  }

  /* ---------- hold to confirm ---------- */
  let holding = false, holdT = null;
  function bindHold() {
    const b = sheetEl.querySelector('[data-hold]');
    if (!b) return;
    const start = e => {
      if (b.classList.contains('is-busy') || holding) return;
      if (e.type === 'keydown') { if (e.key !== ' ' && e.key !== 'Enter') return; if (e.repeat) { e.preventDefault(); return; } e.preventDefault(); }
      holding = true; b.classList.add('is-holding');
      holdT = setTimeout(() => {
        holding = false; b.classList.remove('is-holding'); b.classList.add('is-busy');
        b.innerHTML = '<span class="spinner" aria-hidden="true"></span><span>Sending</span>';
        stopLock();
        setTimeout(confirmWithdrawal, 900);
      }, 1200);
    };
    const stop = e => {
      if (e && e.type === 'keyup' && e.key !== ' ' && e.key !== 'Enter') return;
      if (!holding) return;
      holding = false; clearTimeout(holdT); b.classList.remove('is-holding');
      if (lock && Date.now() > lock.until) expireQuote();
    };
    b.addEventListener('pointerdown', e => { b.setPointerCapture(e.pointerId); start(e); });
    b.addEventListener('pointerup', stop); b.addEventListener('pointercancel', stop); b.addEventListener('lostpointercapture', stop);
    b.addEventListener('keydown', start); b.addEventListener('keyup', stop); b.addEventListener('blur', stop);
    b.addEventListener('click', e => e.preventDefault());
    b.addEventListener('contextmenu', e => e.preventDefault());
  }

  function confirmWithdrawal() {
    if (!lock) return;
    const q = lock.q;
    let outcome = q.dest === 'mpesa' ? opts.outcome : 'ok';
    if (outcome === 'partial' && q.legs.length < 2) outcome = 'declined';
    const t = clock();
    const secs = [4, 41, 58, 15];
    const legs = q.legs.map((amount, i) => ({ amount, ref: nextRef(), time: `${t}:${pad(secs[i % secs.length])}`, status: 'arrived' }));
    let refund = 0;
    if (outcome === 'declined') { legs.forEach(l => { l.status = 'declined'; }); refund = q.usd; }
    if (outcome === 'partial') { legs.forEach((l, i) => { if (i > 0) l.status = 'declined'; }); const failed = legs.filter(l => l.status !== 'arrived').reduce((s, l) => s + l.amount, 0); refund = round2(q.usd * failed / q.net); }
    const delivered = legs.filter(l => l.status === 'arrived').reduce((s, l) => s + l.amount, 0);
    S.usd = round2(S.usd - q.usd + refund);
    if (q.dest === 'mpesa') S.sentToday += delivered;
    const rec = { id: 'w' + (uid++), kind: 'out', dest: q.dest, title: q.dest === 'mpesa' ? 'To M-Pesa' : 'To bank', usd: q.usd, refund, date: today(), time: t, rate: q.rate, gross: q.gross, fee: q.fee, net: q.net, legs, outcome, balanceAfter: S.usd };
    S.activity.unshift(rec);
    if (legs.length > 1) track('withdrawal_split', { payments: legs.length, ksh: q.net });
    if (outcome !== 'ok') track('withdrawal_failed', { outcome, refunded_usd: refund });
    lock = null;
    closeSheet(true);
    nav = [{ name: 'home', p: {} }, { name: 'result', p: { id: rec.id } }];
    render(true); renderDemo();
  }

  /* ---------- money in ---------- */
  function payInvoice(no) {
    const inv = invoice(no);
    if (!inv || inv.status === 'paid') return null;
    const t = clock();
    inv.status = 'paid'; inv.paidDate = today(); inv.paidTime = t;
    inv.events.push({ label: 'Paid', date: today(), time: t });
    S.usd = round2(S.usd + inv.usd);
    S.payments.push({ date: today(), no: inv.no, usd: inv.usd, rate: S.rate, client: D.client.name });
    const rec = { id: 'p' + (uid++), kind: 'in', title: D.client.name, no: inv.no, usd: inv.usd, date: today(), time: t, rate: S.rate };
    S.activity.unshift(rec);
    if (S.autoSplit.on) {
      let u = round2(inv.usd * S.autoSplit.pct / 100);
      let q = quote(u, 'mpesa', S.rate);
      let capped = false;
      const rem = remaining();
      if (q.net > rem) { u = maxUsdFor(rem, S.rate); q = quote(u, 'mpesa', S.rate); capped = true; }
      if (u >= 1) {
        const legs = q.legs.map((amount, i) => ({ amount, ref: nextRef(), time: `${t}:${pad(9 + i * 23)}`, status: 'arrived' }));
        S.usd = round2(S.usd - u);
        S.sentToday += q.net;
        const out = { id: 'w' + (uid++), kind: 'out', dest: 'mpesa', auto: true, title: 'To M-Pesa', usd: u, refund: 0, date: today(), time: t, rate: q.rate, gross: q.gross, fee: q.fee, net: q.net, legs, outcome: 'ok', balanceAfter: S.usd };
        S.activity.unshift(out);
        rec.split = { usd: u, q, legs, capped };
      }
    }
    rec.balanceAfter = S.usd;
    track('invoice_paid', { usd: inv.usd, auto_split: !!rec.split });
    nav = [{ name: 'home', p: {} }, { name: 'received', p: { id: rec.id } }];
    render(); renderDemo();
    return rec;
  }

  /* ---------- actions ---------- */
  const A = {
    back, home: () => root('home'),
    tab: el => root(el.dataset.tab),
    go: el => { if (el.dataset.to === 'autosplit') S.splitDraft = null; if (el.dataset.to === 'newInvoice') S.draft = null; go(el.dataset.to, { id: el.dataset.id, no: el.dataset.no }); },
    toast: el => toast(el.dataset.msg),
    start: el => { S.welcome = false; root('home'); if (el.dataset.msg) toast(el.dataset.msg); },
    withdraw: () => { wd = { dest: 'mpesa', str: '' }; go('withdraw'); },
    dest: el => { wd.dest = el.dataset.dest; render(); },
    key: el => keypad(el.dataset.k),
    'use-all': () => { wd.str = String(S.usd.toFixed(2)).replace(/\.00$/, ''); render(); },
    review: () => {
      const u = parseFloat(wd.str) || 0;
      if (wd.dest === 'mpesa' && quote(u, 'mpesa', S.rate).net > remaining()) openSheet('limit', { pick: 'bank' });
      else openQuote();
    },
    why: () => openSheet('split', {}),
    'see-plan': () => { stopLock(); openSheet('split', { from: 'quote' }); },
    'plan-ok': el => { if (el.dataset.from === 'quote' && lock) { openSheet('quote'); startLock(); } else closeSheet(); },
    'to-bank': () => { wd.dest = 'bank'; openQuote('bank'); },
    'close-sheet': () => { closeSheet(); lock = null; },
    'limit-pick': el => openSheet('limit', { pick: el.dataset.v }),
    'limit-go': el => {
      const v = el.dataset.v;
      if (v === 'bank') openQuote('bank');
      else if (v === 'allowed') { wd.str = String(maxUsdFor(remaining(), S.rate)); openQuote('mpesa'); }
      else { closeSheet(); toast("Your dollars stay put. M-Pesa's limit resets overnight."); }
    },
    'retry-bank': el => { wd = { dest: 'bank', str: String(parseFloat(el.dataset.usd)) }; nav = [{ name: 'home', p: {} }, { name: 'withdraw', p: {} }]; render(true); },
    due: el => { S.draft.days = Number(el.dataset.days); saveDraft(); render(); },
    'toggle-split': () => { saveDraft(); S.autoSplit.on = !S.autoSplit.on; render(); },
    'send-invoice': () => {
      saveDraft();
      const amt = parseFloat(String(S.draft.amount).replace(/[^0-9.]/g, ''));
      if (!(amt >= 1)) { toast('Enter an amount of at least $1'); const i = document.getElementById('inv-amount'); if (i) i.focus(); return; }
      const what = S.draft.what.trim() || 'Design work';
      const t = clock();
      const no = nextInvoiceNo();
      S.invoices.unshift({ no, what, period: `Issued ${fmtDate(today())}`, usd: round2(amt), issued: today(), due: addDays(today(), S.draft.days), status: 'open',
        events: [{ label: 'Created', date: today(), time: t }, { label: `Sent to ${D.client.email}`, date: today(), time: t }] });
      S.draft = null; tomNo = no;
      track('invoice_sent', { usd: round2(amt), due_days: S.invoices[0].due ? daysBetween(today(), S.invoices[0].due) : 0 });
      nav.pop(); go('invoice', { no });
      toast(`Sent to ${D.client.email}`);
    },
    remind: el => { const inv = invoice(el.dataset.no); inv.events.push({ label: 'Reminder sent', date: today(), time: clock() }); render(); toast(`Reminder sent to ${D.client.email} with the same link`); },
    copy: () => toast('Invoice link copied (demo)'),
    pdf: () => toast('PDF downloads are not part of the demo'),
    'open-tom': el => { tomNo = el.dataset.no; setView('tom'); },
    year: el => { top().p.year = Number(el.dataset.y); top().p.all = false; render(); },
    'see-all': () => { top().p.all = !top().p.all; render(); },
    csv: el => exportCsv(Number(el.dataset.y)),
    'draft-on': () => { S.splitDraft.on = !S.splitDraft.on; render(); },
    'draft-pct': el => { S.splitDraft.pct = Number(el.dataset.pct); render(); },
    'split-save': () => { S.autoSplit = { on: S.splitDraft.on, pct: S.splitDraft.pct }; S.splitDraft = null; back(); toast(S.autoSplit.on ? `Auto-split on: ${S.autoSplit.pct}% of each payment to M-Pesa` : 'Auto-split off'); renderDemo(); },
  };
  function saveDraft() {
    const f = screensEl.querySelector('[data-form="invoice"]');
    if (!f || !S.draft) return;
    S.draft.amount = f.amount.value; S.draft.what = f.what.value;
  }
  function keypad(k) {
    let s = wd.str;
    if (k === 'del') s = s.slice(0, -1);
    else if (k === '.') { if (!s.includes('.')) s = (s || '0') + '.'; }
    else {
      const [i, d] = s.split('.');
      if (d !== undefined) { if (d.length < 2) s += k; }
      else if ((i || '').length < 6) s = (s === '0' ? '' : s) + k;
    }
    wd.str = s; render();
  }
  function exportCsv(year) {
    const rows = S.payments.filter(p => p.date.startsWith(String(year))).sort((a, b) => a.date.localeCompare(b.date));
    const lines = [['Date', 'Invoice', 'Client', 'USD', 'Rate used (KSh per USD, demo)', 'KSh value'].join(',')]
      .concat(rows.map(p => [p.date, p.no, p.client, p.usd.toFixed(2), p.rate.toFixed(2), Math.round(p.usd * p.rate)].join(',')));
    lines.push('', 'Ujira demo statement. Every figure is invented. For your records, not tax advice.');
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = `ujira-statement-${year}-demo.csv`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    track('statement_exported', { year, format: 'csv', rows: rows.length });
    toast(`Saved ujira-statement-${year}-demo.csv`);
  }

  app.addEventListener('click', e => {
    const el = e.target.closest('[data-a]');
    if (!el || !app.contains(el) || el.disabled) return;
    const fn = A[el.dataset.a];
    if (!fn) return;
    e.preventDefault();
    const sel = Array.from(el.attributes).filter(a => a.name.startsWith('data-')).map(a => `[${a.name}="${CSS.escape(a.value)}"]`).join('');
    fn(el, e);
    // Re-rendered controls (keypad keys, chips, switches) keep keyboard focus.
    if (!el.isConnected) { const again = app.querySelector(sel); if (again) again.focus({ preventScroll: true }); }
  });
  app.addEventListener('submit', e => e.preventDefault());
  app.addEventListener('input', e => { if (e.target.form && e.target.form.dataset.form === 'invoice' && S.draft) S.draft[e.target.name] = e.target.value; });
  document.addEventListener('keydown', e => {
    if (view !== 'app') return;
    if (e.key === 'Escape' && sheet) { closeSheet(); lock = null; return; }
    if (sheet || top().name !== 'withdraw' || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^[0-9]$/.test(e.key)) { keypad(e.key); e.preventDefault(); }
    else if (e.key === '.' || e.key === ',') { keypad('.'); e.preventDefault(); }
    else if (e.key === 'Backspace') { keypad('del'); e.preventDefault(); }
    else if (e.key === 'Enter') { const r = screensEl.querySelector('[data-a="review"]'); if (r && !r.disabled) { A.review(); e.preventDefault(); } }
  });

  /* ---------- Tom's page (W1, W2) ---------- */
  function tomInvoice() {
    if (tomNo && invoice(tomNo)) return invoice(tomNo);
    return S.invoices.filter(i => i.status === 'open').sort((a, b) => a.due.localeCompare(b.due))[0] || S.invoices.find(i => i.status === 'paid') || null;
  }
  function renderTom() {
    const inv = tomInvoice();
    const head = `<header class="tom__bar"><div><span class="tom__logo">${MARK(28)}ujira</span>${inv ? `<span class="t-foot muted tom__inv">Invoice ${inv.no}</span>` : ''}<button type="button" class="tom__copy" data-t="help">Help</button></div></header>`;
    if (!inv) {
      tomEl.innerHTML = `<div class="tom">${head}<div class="tom__empty"><h1 class="t-title-m">No invoice to show yet</h1><p class="muted">In the app, create an invoice and send it to Tom. This is the page his email link opens.</p><button type="button" class="btn btn--primary" data-t="to-app">Back to Wanjiru's app</button></div></div>`;
      return;
    }
    const paid = inv.status === 'paid';
    const late = isLate(inv);
    const field = (label, value, ref) => `<div class="tom__field ${ref ? 'tom__field--ref' : ''}"><div><p class="t-foot muted">${label}</p><p class="t-em">${value}</p>${ref ? '<p class="t-foot" style="color:var(--blue-text)">Add this so your payment matches</p>' : ''}</div><button type="button" class="tom__copy" data-t="copy" data-v="${esc(value)}" aria-label="Copy ${label}">Copy</button></div>`;
    tomEl.innerHTML = `<div class="tom">${head}
      <div class="tom__demo"><div><p><strong>Demo.</strong> ${paid ? 'This is the receipt Tom sees once the money has arrived.' : "This is the page Tom opens from the email. He'd pay from his own bank; the button stands in for his transfer arriving."}</p>
        ${paid ? '' : '<button type="button" data-t="pay">Pretend the transfer arrived</button>'}<button type="button" data-t="to-app">Back to Wanjiru's app</button></div></div>
      <main class="tom__main">
        ${paid ? `<div class="tom__banner"><span class="circle" style="width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:var(--green)">${ico('check', 'ico--s')}</span><div><p class="t-em">Paid on ${fmtDate(inv.paidDate)} · ${money(inv.usd)}</p><p class="t-foot muted">Thank you. ${D.me.first} has been told it arrived.</p></div></div>` : ''}
        <article class="tom__card" aria-labelledby="tom-no">
          <div class="tom__head"><div><p class="t-caps">Invoice</p><h1 id="tom-no" class="t-title-l">${inv.no}</h1></div>${paid ? '<span class="tag tag--pos">Paid</span>' : late ? `<span class="tag" style="background:#FBEFD9;color:#8A5A12">Overdue · ${lateDays(inv)} days</span>` : `<span class="tag tag--brand">Due ${fmtDate(inv.due)}</span>`}</div>
          <div class="tom__cols"><div><p class="t-caps">From</p><p class="t-em">${D.me.name}</p><p class="t-foot muted">${D.me.role}</p><p class="t-foot muted">${D.me.email}</p></div>
            <div><p class="t-caps">Bill to</p><p class="t-em">${D.client.legal}</p><p class="t-foot muted">Attn: ${D.client.contact}</p><p class="t-foot muted">${D.client.email}</p></div></div>
          <div class="tom__dates"><div><p class="t-caps">Issued</p><p class="t-em">${fmtDate(inv.issued)}</p></div><div><p class="t-caps">Due</p><p class="t-em">${fmtDate(inv.due)}</p></div><div><p class="t-caps">Currency</p><p class="t-em">US dollars</p></div></div>
          <div class="tom__items"><div class="row"><p class="t-caps">Description</p><p class="t-caps">Amount</p></div><hr>
            <div class="row"><div><p class="t-em">${esc(inv.what)}</p><p class="t-foot muted">${esc(inv.period)}</p></div><p class="t-em">${money(inv.usd)}</p></div><hr>
            <div class="row" style="align-items:center"><p class="muted">${paid ? 'Total paid' : 'Total due'}</p><p><span class="t-l">${money(inv.usd)}</span> <span class="t-foot muted">USD</span></p></div></div>
          <p class="t-foot muted">${paid ? 'Thanks, Tom. This invoice is settled. Keep this page or the PDF for your records.' : 'Thanks, Tom. Please pay in US dollars by bank transfer. Any fee on your side is set by your bank.'}</p>
        </article>
        <aside class="tom__card tom__card--pay" aria-labelledby="pay-h">
          ${paid ? `<div><h2 id="pay-h" class="t-title-m">Receipt</h2><p class="t-foot muted">For your records.</p></div>
            <div><div class="qrow"><span>Amount paid</span><span>${money(inv.usd)}</span></div><div class="qrow"><span>Paid on</span><span>${fmtDate(inv.paidDate)}</span></div><div class="qrow"><span>Method</span><span>Bank transfer (USD)</span></div><div class="qrow"><span>Fee to you</span><span>$0.00</span></div><div class="qrow"><span>Reference</span><span>${inv.no}</span></div></div>
            <button type="button" class="btn btn--primary" data-t="pdf">Download receipt</button><button type="button" class="btn btn--secondary" data-t="pdf">Download invoice</button>`
          : `<div><h2 id="pay-h" class="t-title-m">Pay ${money(inv.usd)}</h2><p class="t-foot muted">By bank transfer in US dollars, from any bank.</p></div>
            <div class="tom__method" role="group" aria-label="How to pay"><button type="button" aria-pressed="${tomMethod === 'ach'}" data-t="method" data-v="ach">US transfer (ACH)</button><button type="button" aria-pressed="${tomMethod === 'swift'}" data-t="method" data-v="swift">SWIFT wire</button></div>
            <div>${field('Account name', `${D.me.name} via Ujira (demo)`)}${field('Bank', tomMethod === 'ach' ? 'Demo Bank, N.A.' : 'Demo Bank, N.A., New York')}${tomMethod === 'ach' ? field('Routing number', '000 000 000') : field('SWIFT code', 'DEMOUS00XXX')}${field('Account number', '0000 0000 0000')}${field('Reference', inv.no, true)}</div>
            <button type="button" class="btn btn--secondary" data-t="pdf">Download PDF</button>
            <p class="tom__safety">${ico('shield')}This page never asks for card numbers or passwords.</p>`}
        </aside>
      </main>
      <p class="tom__foot">Ujira · personal concept by Ted Thie · every name, number and bank detail here is invented</p>
      <div class="tom__toast" id="tom-toast" role="status" aria-live="polite"></div></div>`;
  }
  let tomMethod = 'ach', tomToastT;
  function tomToast(msg) { const t = document.getElementById('tom-toast'); if (!t) return; t.textContent = msg; t.classList.add('is-on'); clearTimeout(tomToastT); tomToastT = setTimeout(() => t.classList.remove('is-on'), 2600); }
  tomEl.addEventListener('click', async e => {
    const el = e.target.closest('[data-t]');
    if (!el) return;
    const a = el.dataset.t;
    if (a === 'to-app') setView('app');
    else if (a === 'pay') { const inv = tomInvoice(); tomNo = inv.no; payInvoice(inv.no); renderTom(); tomToast(`Paid. ${D.me.first}'s app shows it now.`); }
    else if (a === 'copy') { try { await navigator.clipboard.writeText(el.dataset.v); tomToast('Copied'); } catch (err) { tomToast('Copy is blocked here. Select the text instead.'); } }
    else if (a === 'method') { tomMethod = el.dataset.v; renderTom(); }
    else if (a === 'pdf') tomToast('PDF downloads are not part of the demo');
    else if (a === 'help') tomToast('Questions about this invoice go to wanjiru@example.com');
  });

  /* ---------- view switch ---------- */
  function setView(v) {
    view = v;
    document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === v)));
    appStage.hidden = v !== 'app'; tomEl.hidden = v !== 'tom';
    if (v === 'tom') renderTom(); else { render(); fit(); }
    document.getElementById('stage').scrollTop = 0;
  }
  document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
  document.querySelector('[data-reset]').addEventListener('click', () => { opts.outcome = 'ok'; opts.fastLock = false; events.length = 0; reset(false); toast('Demo reset'); });

  /* ---------- Try it panel ---------- */
  function renderDemo() {
    if (!S) return;
    const open = S.invoices.filter(i => i.status === 'open').sort((a, b) => a.due.localeCompare(b.due))[0];
    const radio = (name, v, label, cur) => `<label class="demo__opt"><input type="radio" name="${name}" value="${v}" ${cur === v ? 'checked' : ''}><span>${label}</span></label>`;
    demoEl.innerHTML = `<h2 id="demo-title">Try it</h2><p>Everything runs in your browser. Choose what happens next, then use the app.</p>
      <div class="demo__group"><h3>Next M-Pesa withdrawal</h3>
        ${radio('outcome', 'ok', 'Goes through', opts.outcome)}${radio('outcome', 'declined', 'M-Pesa declines it (balance limit)', opts.outcome)}${radio('outcome', 'partial', 'The second payment of a split fails', opts.outcome)}</div>
      <div class="demo__group"><h3>Rate lock</h3>${radio('lock', 'normal', '60 seconds', opts.fastLock ? 'fast' : 'normal')}${radio('lock', 'fast', '5 seconds, to see a rate run out', opts.fastLock ? 'fast' : 'normal')}</div>
      <div class="demo__group"><h3>Tom, the client</h3><p>${open ? `${open.no} for ${money(open.usd)} is waiting.` : 'No invoice is waiting. Send one from the app.'}</p>
        <div class="demo__btns"><button type="button" class="demo__btn" data-d="pay" ${open ? '' : 'disabled'}>Tom pays ${open ? open.no : ''}</button><button type="button" class="demo__btn" data-d="tom">Open Tom's page</button></div></div>
      <div class="demo__group"><h3>Calendar</h3><label class="demo__opt"><input type="checkbox" data-d="overdue" ${opts.overdue ? 'checked' : ''}><span>Skip to 3 December, so the November invoice is overdue and today's M-Pesa limit resets</span></label></div>
      <div class="demo__group"><h3>Ideas</h3><ul class="demo__ideas"><li>Withdraw $3,000 to M-Pesa. It goes as two payments.</li><li>Then withdraw $1,000 more. You'll hit today's M-Pesa limit.</li><li>Turn on auto-split in Account, then have Tom pay.</li></ul></div>
      <div class="demo__group"><div class="demo__btns"><button type="button" class="demo__btn" data-d="new">Start as a new user</button></div></div>
      ${events.length ? `<div class="demo__group"><h3>Events this visit</h3><p>What analytics would record. They stay in the console.</p><ul class="demo__events">${events.map(ev => `<li>${esc(ev.name)}</li>`).join('')}</ul></div>` : ''}`;
  }
  demoEl.addEventListener('change', e => {
    const t = e.target;
    if (t.name === 'outcome') opts.outcome = t.value;
    else if (t.name === 'lock') opts.fastLock = t.value === 'fast';
    else if (t.dataset.d === 'overdue') { opts.overdue = t.checked; S.sentToday = 0; clockMin = 9 * 60 + 5; toast(t.checked ? 'It is now 3 December' : 'Back to 18 November'); render(); renderDemo(); }
  });
  demoEl.addEventListener('click', e => {
    const b = e.target.closest('[data-d]');
    if (!b || b.disabled || b.tagName === 'INPUT') return;
    if (b.dataset.d === 'pay') { const inv = S.invoices.filter(i => i.status === 'open').sort((a, c) => a.due.localeCompare(c.due))[0]; if (inv) { closeSheet(true); lock = null; payInvoice(inv.no); } }
    else if (b.dataset.d === 'tom') setView('tom');
    else if (b.dataset.d === 'new') { reset(true); toast('New account: start from the welcome screen'); }
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

  reset(false);
  fit();
})();
