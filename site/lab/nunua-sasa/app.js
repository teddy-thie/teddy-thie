/* Nunua Sasa, Remastered · personal concept by Ted Thie
   Two versions of a buy-now-pay-later sign-up, built to be compared:
   - Control: the original order. Phone → details → National ID → statement → scoring → limit.
   - Variant: value before the big ask. Phone → checklist → statement → limit → National ID → ready.
   Nothing here talks to a real service. Every name, number and rate is invented. */
(() => {
  'use strict';

  /* ---------- Icons (Material Symbols, rounded, 400) ---------- */
  const ICON = {"lock":"M220-80q-24.75 0-42.37-17.63Q160-115.25 160-140v-434q0-24.75 17.63-42.38Q195.25-634 220-634h70v-96q0-78.85 55.61-134.42Q401.21-920 480.11-920q78.89 0 134.39 55.58Q670-808.85 670-730v96h70q24.75 0 42.38 17.62Q800-598.75 800-574v434q0 24.75-17.62 42.37Q764.75-80 740-80H220Zm0-60h520v-434H220v434Zm314.5-162.03Q557-324.06 557-355q0-30-22.67-54.5t-54.5-24.5q-31.83 0-54.33 24.5t-22.5 55q0 30.5 22.67 52.5t54.5 22q31.83 0 54.33-22.03ZM350-634h260v-96q0-54.17-37.88-92.08-37.88-37.92-92-37.92T388-822.08q-38 37.91-38 92.08v96ZM220-140v-434 434Z","description":"M349-250h262q12.75 0 21.38-8.68 8.62-8.67 8.62-21.5 0-12.82-8.62-21.32-8.63-8.5-21.38-8.5H349q-12.75 0-21.37 8.68-8.63 8.67-8.63 21.5 0 12.82 8.63 21.32 8.62 8.5 21.37 8.5Zm0-170h262q12.75 0 21.38-8.68 8.62-8.67 8.62-21.5 0-12.82-8.62-21.32-8.63-8.5-21.38-8.5H349q-12.75 0-21.37 8.68-8.63 8.67-8.63 21.5 0 12.82 8.63 21.32 8.62 8.5 21.37 8.5ZM220-80q-24 0-42-18t-18-42v-680q0-24 18-42t42-18h336q12.44 0 23.72 5T599-862l183 183q8 8 13 19.28 5 11.28 5 23.72v496q0 24-18 42t-42 18H220Zm331-584v-156H220v680h520v-494H581q-12.75 0-21.37-8.63Q551-651.25 551-664ZM220-820v186-186 680-680Z","check_circle":"m421-389-98-98q-9-9-22-9t-23 10q-9 9-9 22t9 22l122 123q9 9 21 9t21-9l239-239q10-10 10-23t-10-23q-10-9-23.5-8.5T635-603L421-389Zm59 309q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-156t86-127Q252-817 325-848.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 82-31.5 155T763-197.5q-54 54.5-127 86T480-80Zm0-60q142 0 241-99.5T820-480q0-142-99-241t-241-99q-141 0-240.5 99T140-480q0 141 99.5 240.5T480-140Zm0-340Z","upload_file":"M452-403v171q0 12.75 8.68 21.37 8.67 8.63 21.5 8.63 12.82 0 21.32-8.63 8.5-8.62 8.5-21.37v-171l61 61q3 3 15-2t22.5-9q10.5-4 14.5-3.5T615-342q9-9 8.5-21t-9.5-21L501-494q-5-5-10.13-7-5.14-2-11-2-5.87 0-10.87 2-5 2-10 7L347-382q-9 9-9 21t9 21.39q9 8.61 21 8.61t21-9l63-63ZM220-80q-24 0-42-18t-18-42v-680q0-24 18-42t42-18h336q12.44 0 23.72 5T599-862l183 183q8 8 13 19.28 5 11.28 5 23.72v496q0 24-18 42t-42 18H220Zm331-584v-156H220v680h520v-494H581q-12.75 0-21.37-8.63Q551-651.25 551-664ZM220-820v186-186 680-680Z","info":"M504.5-288.63q8.5-8.62 8.5-21.37v-180q0-12.75-8.68-21.38-8.67-8.62-21.5-8.62-12.82 0-21.32 8.62-8.5 8.63-8.5 21.38v180q0 12.75 8.68 21.37 8.67 8.63 21.5 8.63 12.82 0 21.32-8.63Zm-1-314.57q9.5-9.2 9.5-22.8 0-14.45-9.48-24.22-9.48-9.78-23.5-9.78t-23.52 9.78Q447-640.45 447-626q0 13.6 9.48 22.8 9.48 9.2 23.5 9.2t23.52-9.2ZM480.27-80q-82.74 0-155.5-31.5Q252-143 197.5-197.5t-86-127.34Q80-397.68 80-480.5t31.5-155.66Q143-709 197.5-763t127.34-85.5Q397.68-880 480.5-880t155.66 31.5Q709-817 763-763t85.5 127Q880-563 880-480.27q0 82.74-31.5 155.5Q817-252 763-197.68q-54 54.31-127 86Q563-80 480.27-80Zm.23-60Q622-140 721-239.5t99-241Q820-622 721.19-721T480-820q-141 0-240.5 98.81T140-480q0 141 99.5 240.5t241 99.5Zm-.5-340Z","error":"M503.5-289.48q9.5-9.48 9.5-23.5t-9.48-23.52q-9.48-9.5-23.5-9.5t-23.52 9.48q-9.5 9.48-9.5 23.5t9.48 23.52q9.48 9.5 23.5 9.5t23.52-9.48Zm1-152.15q8.5-8.62 8.5-21.37v-193q0-12.75-8.68-21.38-8.67-8.62-21.5-8.62-12.82 0-21.32 8.62-8.5 8.63-8.5 21.38v193q0 12.75 8.68 21.37 8.67 8.63 21.5 8.63 12.82 0 21.32-8.63ZM480.27-80q-82.74 0-155.5-31.5Q252-143 197.5-197.5t-86-127.34Q80-397.68 80-480.5t31.5-155.66Q143-709 197.5-763t127.34-85.5Q397.68-880 480.5-880t155.66 31.5Q709-817 763-763t85.5 127Q880-563 880-480.27q0 82.74-31.5 155.5Q817-252 763-197.68q-54 54.31-127 86Q563-80 480.27-80Zm.23-60Q622-140 721-239.5t99-241Q820-622 721.19-721T480-820q-141 0-240.5 98.81T140-480q0 141 99.5 240.5t241 99.5Zm-.5-340Z","photo_camera":"M479.5-267q72.5 0 121.5-49t49-121.5q0-72.5-49-121T479.5-607q-72.5 0-121 48.5t-48.5 121q0 72.5 48.5 121.5t121 49Zm0-60q-47.5 0-78.5-31.5t-31-79q0-47.5 31-78.5t78.5-31q47.5 0 79 31t31.5 78.5q0 47.5-31.5 79t-79 31.5ZM140-120q-24 0-42-18t-18-42v-513q0-23 18-41.5t42-18.5h147l55-66q8-11 20-16t26-5h184q14 0 26 5t20 16l55 66h147q23 0 41.5 18.5T880-693v513q0 24-18.5 42T820-120H140Zm0-60h680v-513H645l-73-87H388l-73 87H140v513Zm340-257Z","sms":"M240-240 131-131q-14 14-32.5 6.34Q80-132.31 80-152v-668q0-24 18-42t42-18h680q24 0 42 18t18 42v520q0 24-18 42t-42 18H240Zm-26-60h606v-520H140v600l74-80Zm-74 0v-520 520Zm194.5-234.5Q346-546 346-563t-11.5-28.5Q323-603 306-603t-28.5 11.5Q266-580 266-563t11.5 28.5Q289-523 306-523t28.5-11.5Zm177 0Q523-546 523-563t-11.5-28.5Q500-603 483-603t-28.5 11.5Q443-580 443-563t11.5 28.5Q466-523 483-523t28.5-11.5Zm170 0Q693-546 693-563t-11.5-28.5Q670-603 653-603t-28.5 11.5Q613-580 613-563t11.5 28.5Q636-523 653-523t28.5-11.5Z","arrow_back":"m274-450 227 227q9 9 9 21t-9 21q-9 9-21 9t-21-9L181-459q-5-5-7-10t-2-11q0-6 2-11t7-10l278-278q9-9 21-9t21 9q9 9 9 21t-9 21L274-510h496q13 0 21.5 8.5T800-480q0 13-8.5 21.5T770-450H274Z","verified_user":"m439-433-79-79q-9-9-22-9t-22 9q-9 9-9 21.83 0 12.84 9 22.17l99 100q9 9 21 9t21-9l186-186q9-9.07 9-21.53 0-12.47-8.5-20.47-8.5-8-21.5-7.5t-21 8.5L439-433Zm31.12 348q-4.56-1-9.12-3-139-47-220-168.5t-81-266.61V-719q0-19.26 10.88-34.66Q181.75-769.07 199-776l260-97q11-4 21-4t21 4l260 97q17.25 6.93 28.13 22.34Q800-738.26 800-719v195.89Q800-378 719-256.5T499-88q-4.56 2-9.12 3T480-84q-5.32 0-9.88-1Zm9.88-58q115-38 187.5-143.5T740-523v-196l-260-98-260 98v196q0 131 72.5 236.5T480-143Zm0-337Z","history":"M477-120q-142 0-243.5-95.5T121-451q-1-12 7.5-21t21.5-9q12 0 20.5 8.5T181-451q11 115 95 193t201 78q127 0 215-89t88-216q0-124-89-209.5T477-780q-68 0-127.5 31T246-667h75q13 0 21.5 8.5T351-637q0 13-8.5 21.5T321-607H172q-13 0-21.5-8.5T142-637v-148q0-13 8.5-21.5T172-815q13 0 21.5 8.5T202-785v76q52-61 123.5-96T477-840q75 0 141 28t115.5 76.5Q783-687 811.5-622T840-482q0 75-28.5 141t-78 115Q684-177 618-148.5T477-120Zm34-374 115 113q9 9 9 21.5t-9 21.5q-9 9-21 9t-21-9L460-460q-5-5-7-10.5t-2-11.5v-171q0-13 8.5-21.5T481-683q13 0 21.5 8.5T511-653v159Z","schedule":"M513-492v-171q0-13-8.5-21.5T483-693q-13 0-21.5 8.5T453-663v183q0 6 2 11t6 10l144 149q9 10 22.5 9.5T650-310q9-9 9-22t-9-22L513-492ZM480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-82 31.5-155t86-127.5Q252-817 325-848.5T480-880q82 0 155 31.5t127.5 86Q817-708 848.5-635T880-480q0 82-31.5 155t-86 127.5Q708-143 635-111.5T480-80Zm0-400Zm0 340q140 0 240-100t100-240q0-140-100-240T480-820q-140 0-240 100T140-480q0 140 100 240t240 100Z"};
  const ic = (n, cls) => `<svg viewBox="0 -960 960 960" aria-hidden="true"${cls ? ` class="${cls}"` : ''}><path d="${ICON[n]}"/></svg>`;
  const goIcon = `<svg viewBox="0 -960 960 960" aria-hidden="true" class="go-r"><path d="${ICON.arrow_back}"/></svg>`;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ksh = n => n.toLocaleString('en-GB');

  /* ---------- Data (invented) ---------- */
  const PRICE = 12500;
  const LIMIT = { approve: 18000, low: 8000 };
  const NAME_STATEMENT = 'Achieng Otieno';
  const NAME_ID = 'Achieng A. Otieno';
  const STEP = { c1: 'phone', c2: 'details', c3: 'national_id', c4: 'statement', c5: 'scoring', c6: 'limit',
    v1: 'phone', v2: 'checklist', v3: 'statement', vw: 'scoring', v4: 'limit', v5: 'national_id', v6: 'ready', vs: 'saved',
    s3: 'name_check', s4: 'over_limit', s5: 'not_yet', s6: 'welcome_back' };

  /* ---------- State ---------- */
  const opts = { statement: 'good', name: 'match', outcome: 'approve' };
  let view = 'variant';
  let S;
  let events = [];
  let timers = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function fresh(version, withSplash) {
    const first = version === 'control' ? 'c1' : 'v1';
    return { version, first, screen: withSplash ? 'splash' : first, stack: [], enteredAt: Date.now(),
      up: { statement: null, front: false, back: false }, tries: 0,
      details: { name: NAME_STATEMENT, dob: '12/03/1996', email: 'achieng@example.com' }, idNumber: '', nameOnForm: NAME_STATEMENT,
      choice: 'pay', busy: false };
  }

  /* ---------- Events (the analytics plan, live) ---------- */
  function track(name, props) {
    events.unshift({ name, props: Object.assign({ version: S.version }, props || {}), at: Date.now() });
    events = events.slice(0, 40);
    renderEvents();
  }

  /* ---------- DOM ---------- */
  const app = document.getElementById('app');
  const screensEl = document.getElementById('screens');
  const sheetEl = document.getElementById('sheet');
  const notifEl = document.getElementById('notif');
  const toastEl = document.getElementById('toast');
  const demoEl = document.getElementById('demo');
  const expEl = document.getElementById('stage-exp');
  const appStage = document.getElementById('stage-app');
  const conceptBar = document.getElementById('concept');
  const device = document.getElementById('device');

  document.querySelector('.ns-status__icons').innerHTML =
    '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 13.5 1 6.2a10 10 0 0 1 14 0Z"/></svg>' +
    '<svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true"><path d="M14 1v13H1Z"/></svg>' +
    '<svg width="9" height="15" viewBox="0 0 9 15" aria-hidden="true"><path d="M3 0h3v1.5h2a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V2.5a1 1 0 0 1 1-1h2Z"/></svg>';

  let toastTimer;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('on'), 3200); }

  /* ---------- Motion (Lottie) ----------
     Three animations, the same in both versions so the test still measures only the order:
     the splash, the scoring loop, and a ring burst behind the limit. Reduced motion gets still frames. */
  const REDUCE = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const HAS_LOTTIE = !!window.lottie;
  const MOTION = {};
  ['splash', 'scoring', 'burst'].forEach(n => { MOTION[n] = fetch('motion/' + n + '.json').then(r => (r.ok ? r.json() : null)).catch(() => null); });
  let live = [];
  function stopMotion() { live.forEach(a => a.destroy()); live = []; }
  function mountMotion(entering) {
    screensEl.querySelectorAll('[data-lottie]').forEach(el => {
      const name = el.dataset.lottie;
      if (name === 'burst' && (!entering || REDUCE)) return;
      MOTION[name].then(data => {
        if (!data || !window.lottie || !el.isConnected) return;
        const a = window.lottie.loadAnimation({ container: el, renderer: 'svg', loop: name === 'scoring', autoplay: !REDUCE,
          animationData: JSON.parse(JSON.stringify(data)), rendererSettings: { preserveAspectRatio: 'xMidYMid meet' } });
        live.push(a); el.classList.add('is-live');
        if (REDUCE) a.addEventListener('DOMLoaded', () => a.goToAndStop(name === 'splash' ? data.op - 1 : 0, true));
      });
    });
  }
  function countUp() {
    const card = screensEl.querySelector('.limit'), el = card && card.querySelector('.limit__fig');
    if (!el || REDUCE) return;
    const end = limitAmount(), t0 = performance.now(), dur = 1100;
    card.classList.add('is-counting'); el.textContent = '0';
    const tick = now => {
      if (!el.isConnected) return;
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = ksh(p >= 1 ? end : Math.round(end * (1 - Math.pow(2, -10 * p)) / 100) * 100);
      if (p < 1) requestAnimationFrame(tick); else card.classList.remove('is-counting');
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Building blocks ---------- */
  const btn = (label, a, dark, disabled) => `<button type="button" class="btn ${dark ? 'btn--dark' : 'btn--light'}" data-a="${a}"${disabled ? ' disabled' : ''}><span>${label}</span><span class="btn__go">${goIcon}</span></button>`;
  const textBtn = (label, a) => `<button type="button" class="btn-text" data-a="${a}">${label}</button>`;
  const why = (i, t) => `<p class="why"><span class="circle">${ic(i)}</span><span>${t}</span></p>`;
  const note = (kind, t, b) => `<div class="note note--${kind}">${ic(kind === 'err' ? 'error' : kind === 'warn' ? 'schedule' : 'info')}<div>${t ? `<p class="note__t">${t}</p>` : ''}<p class="note__b">${b}</p></div></div>`;
  const rows = list => `<dl class="rows">${list.map(([l, v]) => `<div class="row"><dt>${l}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
  const field = f => `<label class="field"><span class="field__label">${f.label}</span><input class="field__input" data-f="${f.key}" value="${esc(f.value || '')}"${f.placeholder ? ` placeholder="${f.placeholder}"` : ''}${f.readonly ? ' readonly' : ''}${f.inputmode ? ` inputmode="${f.inputmode}"` : ''} autocomplete="off" spellcheck="false">${f.help ? `<span class="field__help">${f.help}</span>` : ''}</label>`;
  function idTiles() {
    const t = side => { const done = S.up[side]; const label = side === 'front' ? 'Front of ID' : 'Back of ID';
      return `<button type="button" class="idt ${done ? 'is-done' : 'is-empty'}" data-a="photo-${side}" aria-label="${label}: ${done ? 'added. Retake' : 'take a photo'}"><span class="circle">${ic(done ? 'check_circle' : 'photo_camera')}</span><span class="idt__t">${label}</span><span class="idt__d">${done ? 'Added · Retake' : 'Tap to take a photo'}</span></button>`; };
    return `<div class="ids">${t('front')}${t('back')}</div>`;
  }
  function fileTile() {
    const st = S.up.statement;
    const D = { null: ['is-empty', 'upload_file', 'Last 6 months, from the M-Pesa app', 'Add'], reading: ['is-empty is-reading', 'history', 'Reading your statement…', ''],
      done: ['is-done', 'check_circle', 'Jun–Nov 2026 · 6 months', 'Change'], old: ['is-error', 'error', 'This one ends in June 2026', 'Replace'], bank: ['is-error', 'error', 'This looks like a bank statement', 'Replace'] }[st];
    return `<button type="button" class="file ${D[0]}" data-a="statement"${st === 'reading' ? ' disabled' : ''}><span class="circle">${ic(D[1])}</span><span class="file__txt"><span class="file__t">M-Pesa statement (PDF)</span><span class="file__d">${D[2]}</span></span><span class="file__a">${D[3]}</span></button>`;
  }
  const statementOk = () => S.up.statement === 'done';
  function statementNote() {
    if (S.up.statement === 'old') return note('err', 'We need the last 6 months', 'Download a new statement that runs up to this month, then add it here.');
    if (S.up.statement === 'bank') return note('err', 'We can only read M-Pesa statements', "Bank statements can't be used yet. Get yours from the M-Pesa app instead.");
    return '';
  }
  function step(status, n, t, b, time) {
    return `<div class="step is-${status}"><span class="step__n">${status === 'done' ? ic('check_circle') : n}</span><span class="step__txt"><span class="step__t">${t}</span><span class="step__b">${b}</span></span><span class="step__time">${time}</span></div>`;
  }
  function limitCard(provisional, amount, list, noteText, fx) {
    return `<div class="limit">${fx ? '<div class="limit__fx" data-lottie="burst" aria-hidden="true"></div>' : ''}<div class="limit__top"><span class="chip ${provisional ? 'chip--outline' : 'chip--accent'}">${provisional ? 'Provisional' : 'Ready to use'}</span><span class="limit__note">${noteText}</span></div>
      <p class="limit__label">You can spend up to</p><p class="limit__amt"><span class="limit__ccy">KSh</span><span class="limit__fig">${ksh(amount)}</span></p>
      <dl>${list.map(([l, v]) => `<div><dt>${l}</dt><dd>${v}</dd></div>`).join('')}</dl></div>`;
  }
  const limitAmount = () => LIMIT[opts.outcome] || LIMIT.approve;
  const firstName = () => (S.details.name.trim().split(/\s+/)[0] || 'there');

  function frame(o) {
    const top = `<div class="top"><button type="button" class="back" data-a="back" aria-label="Back"${o.back === false ? ' hidden' : ''}>${ic('arrow_back')}</button>${o.right || ('<span class="mark" aria-hidden="true">' + LOGO + '<span>nunua <b>sasa</b></span></span>')}</div>`;
    const prog = o.step ? `<div class="prog" role="progressbar" aria-valuemin="1" aria-valuemax="${o.step[1]}" aria-valuenow="${o.step[0]}" aria-label="Step ${o.step[0]} of ${o.step[1]}"><div class="prog__segs">${Array.from({ length: o.step[1] }, (_, i) => `<i class="${i < o.step[0] ? 'on' : ''}"></i>`).join('')}</div><span class="prog__label" aria-hidden="true">Step ${o.step[0]} of ${o.step[1]}</span></div>` : '';
    const heading = o.title ? `<h1 class="t-display" tabindex="-1">${o.title}</h1>${o.sub ? `<p class="t-sub">${o.sub}</p>` : ''}` : '';
    if (o.dark) return `<div class="scr scr--dark"><div class="scr__in"><div class="head">${top}${prog}${heading}${o.body || ''}<div class="push"></div><div class="actions">${o.actions || ''}</div></div><div class="ns-gesture ns-gesture--dark"></div></div></div>`;
    return `<div class="scr"><div class="scr__in"><div class="head">${top}${prog}${heading}</div><div class="sheet">${o.body || ''}<div class="push"></div><div class="actions">${o.actions || ''}</div><div class="ns-gesture"></div></div></div></div>`;
  }

  /* ---------- Screens ---------- */
  const phone = (stepArr) => frame({ back: false, step: stepArr, title: "What's your phone number?", sub: "Use the number you use for M-Pesa. We'll check it by SMS.",
    body: field({ key: 'phone', label: 'Phone number', value: '07•• ••• 123', readonly: true, help: S.busy ? 'Reading the code from the SMS…' : "We'll read the code from the SMS for you." }),
    actions: btn(S.busy ? 'Checking your number…' : 'Continue', 'phone', false, S.busy) });

  const SCREENS = {
    splash: () => `<div class="scr scr--dark scr--splash"><div class="scr__in"><div class="splash"><div class="ns-lottie ns-lottie--splash" data-lottie="splash" aria-hidden="true"></div>${HAS_LOTTIE ? '' : `<p class="splash__still" aria-hidden="true">${LOGO}<span>nunua <b>sasa</b></span></p>`}<p class="sr-only">Nunua Sasa</p></div><div class="ns-gesture ns-gesture--dark"></div></div></div>`,
    c1: () => phone([1, 5]),
    c2: () => frame({ step: [2, 5], title: 'Tell us about yourself',
      body: field({ key: 'name', label: 'Full name', value: S.details.name }) + field({ key: 'dob', label: 'Date of birth', value: S.details.dob, inputmode: 'numeric' }) + field({ key: 'email', label: 'Email', value: S.details.email }),
      actions: btn('Continue', 'next', false, !S.details.name.trim()) }),
    c3: () => frame({ step: [3, 5], title: 'Upload your National ID', sub: 'Take clear photos of the front and back.',
      body: idTiles() + field({ key: 'idnum', label: 'ID number', value: S.idNumber, placeholder: 'e.g. 12345678', inputmode: 'numeric' }),
      actions: btn('Continue', 'next', false, !(S.up.front && S.up.back)) }),
    c4: () => frame({ step: [4, 5], title: 'Upload your M-Pesa statement', sub: 'A PDF of the last 6 months.',
      body: fileTile() + statementNote(), actions: btn('Continue', 'score', false, !statementOk()) }),
    c5: () => frame({ dark: true, back: false, step: [5, 5], body: `<div class="wait" role="status">${HAS_LOTTIE ? '<div class="ns-lottie ns-lottie--wait" data-lottie="scoring" aria-hidden="true"></div>' : '<span class="spin" aria-hidden="true"></span>'}<p class="wait__t">Checking your statement</p><p class="wait__b">This can take up to 2 minutes.</p></div>` }),
    c6: () => frame({ dark: true, title: 'Your limit is ready',
      body: limitCard(false, limitAmount(), [['Pay it back', '3 monthly payments'], ['Use it at', 'Any partner shop']], 'Confirmed today', true),
      actions: btn('Start shopping', 'shop', true) }),

    v1: () => phone(null),
    v2: () => frame({ title: 'Three things,<br>about 4 minutes', sub: "You'll see your limit before we ask for your ID.",
      body: step('current', '1', 'Your M-Pesa statement', 'To work out how much you can spend.', '1 min') +
        step('todo', '2', 'See your limit', 'Before we ask for anything else.', 'Instant') +
        step('todo', '3', "Confirm it's you", 'Your National ID. The law asks us to check it before we lend.', '2 min') +
        why('history', "Stop at any point. We'll text you a link back to where you left off."),
      actions: btn('Start with my statement', 'next', false) }),
    v3: () => frame({ step: [1, 3], title: 'Add your M-Pesa statement', sub: 'We use it only to work out your limit.',
      body: fileTile() + statementNote() + (S.up.statement === 'old' || S.up.statement === 'bank' ? '' : why('lock', 'Only our scoring system reads it. We delete it after 12 months.')) +
        why('description', 'In the M-Pesa app: Statements, then the last 6 months, then download the PDF.'),
      actions: btn('Continue', 'score', false, !statementOk()) }),
    vw: () => frame({ dark: true, back: false, step: [2, 3], body: `<div class="wait" role="status">${HAS_LOTTIE ? '<div class="ns-lottie ns-lottie--wait" data-lottie="scoring" aria-hidden="true"></div>' : '<span class="spin" aria-hidden="true"></span>'}<p class="wait__t">Working out your limit</p><p class="wait__b">Usually under a minute.</p></div>` }),
    v4: () => frame({ dark: true, step: [2, 3], title: `Good news,<br>${esc(firstName())}`,
      body: limitCard(true, limitAmount(), [['Pay it back', '3 monthly payments'], ['Use it at', 'Any partner shop'], ['To unlock it', 'Confirm your ID · 2 min']], 'Saved for 7 days', true) +
        why('verified_user', "We have to check your ID before we lend. It's the only step left."),
      actions: btn("Confirm it's me", 'next', true) + textBtn('Not now, save my limit', 'save') }),
    vs: () => frame({ dark: true, back: false, title: 'Saved until<br>26 November', sub: "You can close the app. We'll text you a link back to this step.",
      body: `<p><span class="chip chip--accent">KSh ${ksh(limitAmount())} waiting</span></p>` }),
    v5: () => frame({ step: [3, 3], right: `<span class="chip chip--accent">KSh ${ksh(limitAmount())} waiting</span>`, title: "Confirm it's you", sub: 'Your National ID unlocks your limit.',
      body: idTiles() + field({ key: 'idname', label: 'Full name', value: S.nameOnForm, help: 'From your statement. Change it if your ID is different.' }) +
        why('verified_user', 'The law asks lenders to check ID before lending.') + why('lock', 'Stored encrypted. Never shared with shops.'),
      actions: btn('Unlock my limit', 'unlock', false, !(S.up.front && S.up.back)) }),
    v6: () => frame({ dark: true, title: "You're all set",
      body: limitCard(false, limitAmount(), [['Pay it back', '3 monthly payments'], ['Use it at', 'Any partner shop']], 'Confirmed today'),
      actions: btn('Start shopping', 'shop', true) }),

    s3: () => frame({ step: S.version === 'variant' ? [3, 3] : null, right: S.version === 'variant' ? `<span class="chip chip--accent">KSh ${ksh(limitAmount())} waiting</span>` : null,
      title: 'Check your name', sub: 'Your ID and your statement show different names.',
      body: rows([['On your ID', NAME_ID], ['On your statement', NAME_STATEMENT]]) + note('warn', 'Is this the same person?', "If both are you, we'll use the name on your ID."),
      actions: btn('Yes, both are me', 'same-person', false) + textBtn('Use a different statement', 'restatement') }),
    s4: () => frame({ right: `<span class="chip chip--accent">Limit KSh ${ksh(limitAmount())}</span>`, title: 'This costs more than your limit', sub: 'Smartphone, 128 GB (demo)',
      body: rows([['Price', 'KSh ' + ksh(PRICE)], ['Your limit', 'KSh ' + ksh(limitAmount())]]) +
        `<fieldset class="optgroup"><legend class="sr-only">How to pay</legend>` +
        `<label class="opt"><input class="sr-only" type="radio" name="pay" value="pay"${S.choice === 'pay' ? ' checked' : ''}><span class="opt__r"></span><span><span class="opt__t">Pay KSh ${ksh(PRICE - limitAmount())} now</span><span class="opt__b">Then KSh ${ksh(limitAmount())} over 3 monthly payments, from M-Pesa.</span></span></label>` +
        `<label class="opt"><input class="sr-only" type="radio" name="pay" value="cheaper"${S.choice === 'cheaper' ? ' checked' : ''}><span class="opt__r"></span><span><span class="opt__t">Choose something cheaper</span><span class="opt__b">See items that fit your limit.</span></span></label></fieldset>`,
      actions: btn('Continue', 'checkout', false) }),
    s5: () => frame({ title: "We can't offer you a limit yet", sub: 'This is about your history, not about you.',
      body: note('info', 'Why', 'Your statement shows less than 3 months of regular money coming in.') + rows([['You can try again', 'From 8 Jan 2027'], ['Your statement', 'Deleted today']]) +
        why('sms', "We'll text you on 8 January, so you don't have to remember."),
      actions: btn('Remind me on 8 January', 'remind', false) + textBtn('What we look at', 'look') }),
    s6: () => frame({ title: `Welcome back,<br>${esc(firstName())}`, sub: 'Your limit is saved until 26 November.',
      body: step('done', '1', 'Your M-Pesa statement', 'Added on 19 November.', 'Done') +
        step('done', '2', `Your limit: KSh ${ksh(limitAmount())}`, 'Provisional until you confirm your ID.', 'Done') +
        step('current', '3', "Confirm it's you", 'Your National ID. The law asks us to check it before we lend.', '2 min'),
      actions: btn("Confirm it's me", 'next', false) }),
  };
  const NEXT = { c1: 'c2', c2: 'c3', c3: 'c4', v1: 'v2', v2: 'v3', v4: 'v5', s6: 'v5' };

  // Original mark for the concept (a bag with the buttons' forward arrow), not the real Nunua Sasa logo
  const LOGO = '<svg class="mark__bag" width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><path d="M10 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7.6 9h12.8a2 2 0 0 1 2 1.8l1.6 11.6a3 3 0 0 1-3 3.6H7a3 3 0 0 1-3-3.6l1.6-11.6a2 2 0 0 1 2-1.8z" fill="var(--blue)"/><path d="M10 17.5h8M15 14l3.5 3.5L15 21" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---------- Navigation ---------- */
  function go(id, o = {}) {
    const from = S.screen;
    if (from && from !== id && STEP[from]) track('step_completed', { step: STEP[from], seconds: Math.max(1, Math.round((Date.now() - S.enteredAt) / 1000)) });
    if (o.push !== false && from) S.stack.push(from);
    if (o.replace) S.stack.pop();
    S.screen = id; S.enteredAt = Date.now(); S.busy = false;
    if (STEP[id]) track('step_viewed', { step: STEP[id] });
    render(true);
  }
  function back() {
    clearTimers();
    let prev = S.stack.pop();
    while (prev === 'c5' || prev === 'vw' || prev === 'vs') prev = S.stack.pop();
    if (!prev) return;
    S.screen = prev; S.enteredAt = Date.now(); S.busy = false;
    track('step_viewed', { step: STEP[prev], via: 'back' });
    render(true);
  }
  function render(entering) {
    if (entering) { clearTimeout(toastTimer); toastEl.classList.remove('on'); }
    const ae = document.activeElement;
    const keep = !entering && ae && screensEl.contains(ae) ? (ae.dataset.a ? `[data-a="${ae.dataset.a}"]` : ae.dataset.f ? `[data-f="${ae.dataset.f}"]` : null) : null;
    stopMotion();
    screensEl.innerHTML = SCREENS[S.screen]();
    mountMotion(entering);
    if (S.screen === 'splash') later(() => { if (S.screen === 'splash') go(S.first, { push: false }); }, REDUCE ? 900 : 2300);
    if (entering && (S.screen === 'v4' || S.screen === 'c6')) countUp();
    if (keep) { const el = screensEl.querySelector(keep); if (el) el.focus({ preventScroll: true }); }
    const scr = screensEl.firstElementChild;
    if (entering && scr) {
      scr.classList.add('is-entering');
      const h = scr.querySelector('h1'); if (h) h.focus({ preventScroll: true });
    }
    renderDemo();
  }

  /* ---------- Actions ---------- */
  function score() {
    const waitId = S.version === 'control' ? 'c5' : 'vw';
    go(waitId);
    later(() => {
      if (opts.outcome === 'decline') { track('declined', { reason: 'short_history' }); go('s5', { push: false }); return; }
      if (S.version === 'control') {
        if (opts.name === 'differ') { go('s3', { push: false }); return; }
        track('limit_shown', { amount: limitAmount(), provisional: false }); go('c6', { push: false });
      } else {
        track('limit_shown', { amount: limitAmount(), provisional: true }); go('v4', { push: false });
      }
    }, S.version === 'control' ? 2200 : 1700);
  }
  function addStatement() {
    if (S.up.statement === 'reading') return;
    const retry = S.up.statement === 'old' || S.up.statement === 'bank';
    S.up.statement = 'reading'; render(false);
    later(() => {
      const result = retry ? 'good' : opts.statement;
      S.up.statement = result === 'good' ? 'done' : result;
      if (result !== 'good') track('document_failed', { doc: 'statement', reason: result === 'old' ? 'too_old' : 'not_mpesa' });
      else track('document_added', { doc: 'statement' });
      render(false);
    }, 1100);
  }
  function finish() {
    track('onboarding_completed', { limit: limitAmount() });
    if (limitAmount() < PRICE) { go('s4'); return; }
    toast('That is the end of the sign-up. Switch versions in the bar above to compare.');
  }
  function saveLater() {
    track('saved_for_later', { step: 'limit' });
    go('vs', { push: true });
    later(() => {
      notifEl.innerHTML = `<button type="button" class="ns-notif__btn" data-a="open-sms"><span class="circle">${ic('sms')}</span><span><span class="ns-notif__app">Messages · now</span><br><span class="ns-notif__t">Nunua Sasa</span><br><span class="ns-notif__b">Your KSh ${ksh(limitAmount())} limit is saved until 26 November. Tap to pick up where you left off.</span></span></button>`;
      notifEl.hidden = false;
    }, 1600);
  }
  function openSheet(html) {
    sheetEl.innerHTML = `<div class="ns-sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title"><span class="ns-sheet__grab" aria-hidden="true"></span>${html}<div class="ns-gesture"></div></div>`;
    sheetEl.hidden = false; const b = sheetEl.querySelector('button'); if (b) b.focus();
  }
  function closeSheet() { sheetEl.hidden = true; sheetEl.innerHTML = ''; }

  app.addEventListener('click', e => {
    const el = e.target.closest('[data-a]'); if (!el || el.disabled) return;
    const a = el.dataset.a;
    if (a === 'back') return back();
    if (a === 'phone') { S.busy = true; render(false); later(() => { track('phone_verified', { method: 'sms_auto_read' }); go(NEXT[S.screen]); }, 900); return; }
    if (a === 'next') return go(NEXT[S.screen]);
    if (a === 'photo-front' || a === 'photo-back') { const side = a.slice(6); S.up[side] = true; track('document_added', { doc: 'id_' + side }); return render(false); }
    if (a === 'statement') return addStatement();
    if (a === 'score') return score();
    if (a === 'save') return saveLater();
    if (a === 'open-sms') { notifEl.hidden = true; notifEl.innerHTML = ''; track('resumed_from_sms', { step: 'national_id' }); S.stack = ['v2']; return go('s6', { push: false }); }
    if (a === 'unlock') { if (opts.name === 'differ') return go('s3'); track('id_submitted'); return go('v6'); }
    if (a === 'same-person') { track('name_confirmed', { source: 'id' }); if (S.version === 'control') { track('limit_shown', { amount: limitAmount(), provisional: false }); return go('c6', { push: false }); } track('id_submitted'); return go('v6'); }
    if (a === 'restatement') { S.up.statement = null; S.stack = S.version === 'control' ? ['c1', 'c2', 'c3'] : ['v1', 'v2']; return go(S.version === 'control' ? 'c4' : 'v3', { push: false }); }
    if (a === 'shop') return finish();
    if (a === 'checkout') { track('checkout_choice', { choice: S.choice }); return toast(S.choice === 'pay' ? 'Demo ends here. Nothing is charged.' : 'This would show items under KSh ' + ksh(limitAmount()) + '.'); }
    if (a === 'remind') { track('reminder_set', { date: '2027-01-08' }); return toast('Reminder set for 8 January (demo).'); }
    if (a === 'look') return openSheet(`<h2 id="sheet-title">What we look at</h2><ul>
      <li>${ic('check_circle', '')}<span><b>Money coming in</b>, month by month.</span></li>
      <li>${ic('check_circle', '')}<span><b>How regular it is</b>, so one big month doesn't count for six.</span></li>
      <li>${ic('check_circle', '')}<span><b>What you already repay</b> to other lenders.</span></li>
      <li>${ic('info', '')}<span><b>Not used:</b> who you send money to, or who sends it to you.</span></li></ul>
      <button type="button" class="btn btn--light" data-a="close-sheet"><span>Got it</span><span class="btn__go">${goIcon}</span></button>`);
    if (a === 'close-sheet') return closeSheet();
  });
  sheetEl.addEventListener('click', e => { if (e.target === sheetEl) closeSheet(); });
  app.addEventListener('input', e => {
    const f = e.target.dataset.f; if (!f) return;
    if (f in S.details) S.details[f] = e.target.value;
    if (f === 'idnum') S.idNumber = e.target.value;
    if (f === 'idname') S.nameOnForm = e.target.value;
    const b = screensEl.querySelector('.actions .btn');
    if (S.screen === 'c2' && b) b.disabled = !S.details.name.trim();
  });
  app.addEventListener('change', e => { if (e.target.name === 'pay') S.choice = e.target.value; });
  app.addEventListener('keydown', e => { if (e.key === 'Escape' && !sheetEl.hidden) closeSheet(); });

  /* ---------- Try it panel ---------- */
  function radio(name, value, label) { return `<label class="demo__opt"><input type="radio" name="${name}" value="${value}"${opts[name] === value ? ' checked' : ''}><span>${label}</span></label>`; }
  function renderDemo() {
    const jumps = S.version === 'control'
      ? [['c2', 'Details'], ['c3', 'National ID'], ['c4', 'Statement'], ['c6', 'Limit']]
      : [['v2', 'Checklist'], ['v3', 'Statement'], ['v4', 'Your limit'], ['v5', 'National ID']];
    demoEl.innerHTML = `<h2 id="demo-title">Try it</h2>
      <p>${S.version === 'control' ? 'The control: the original order. The National ID is asked for third, before anything is given back.' : 'The variant: a checklist first, then the statement, then the limit, and only then the National ID to unlock it.'} Same questions in both versions.</p>
      <div class="demo__group"><h3>The statement you add</h3>${radio('statement', 'good', 'Last 6 months, as asked')}${radio('statement', 'old', 'One that ends in June')}${radio('statement', 'bank', 'A bank statement by mistake')}</div>
      <div class="demo__group"><h3>The name on the ID</h3>${radio('name', 'match', 'Matches the statement')}${radio('name', 'differ', 'Adds a middle name')}</div>
      <div class="demo__group"><h3>The result</h3>${radio('outcome', 'approve', 'KSh 18,000 limit')}${radio('outcome', 'low', 'KSh 8,000 limit, then a phone costing more')}${radio('outcome', 'decline', 'Not yet (too little history)')}</div>
      <div class="demo__group"><h3>Jump to</h3><div class="demo__btns">${jumps.map(([id, l]) => `<button type="button" class="demo__btn" data-jump="${id}">${l}</button>`).join('')}${S.version === 'variant' ? '<button type="button" class="demo__btn" data-jump="save">Save for later</button>' : ''}</div></div>
      <div class="demo__group"><h3>Events this session</h3><p>What the real product would send to analytics, as you go.</p><ul class="demo__events" id="events"></ul></div>
      <div class="demo__group"><div class="demo__btns"><button type="button" class="demo__btn" data-d="exp">See the experiment brief</button></div></div>`;
    renderEvents();
  }
  function renderEvents() {
    const ul = document.getElementById('events'); if (!ul) return;
    const list = events.slice(0, 8);
    ul.innerHTML = list.length ? list.map((ev, i) => `<li${i === 0 ? ' class="is-new"' : ''}><b>${ev.name}</b> ${Object.entries(ev.props).map(([k, v]) => `${k}: ${v}`).join(', ')}</li>`).join('') : '<li>Nothing yet.</li>';
  }
  demoEl.addEventListener('change', e => {
    const t = e.target; if (t.type !== 'radio') return;
    opts[t.name] = t.value;
    if (['c6', 'v4', 'v5', 'v6', 's4', 's6', 'vs'].includes(S.screen)) render(false);
  });
  demoEl.addEventListener('click', e => {
    const j = e.target.closest('[data-jump]');
    if (j) {
      clearTimers(); closeSheet(); notifEl.hidden = true;
      const id = j.dataset.jump;
      if (id === 'save') { prepUpTo('v4'); S.stack = ['v1', 'v2', 'v3']; S.screen = 'v4'; return saveLater(); }
      prepUpTo(id);
      const order = S.version === 'control' ? ['c1', 'c2', 'c3', 'c4', 'c6'] : ['v1', 'v2', 'v3', 'v4', 'v5'];
      S.stack = order.slice(0, Math.max(0, order.indexOf(id)));
      S.screen = null; go(id, { push: false });
      return;
    }
    const d = e.target.closest('[data-d]');
    if (d && d.dataset.d === 'exp') setView('experiment');
  });
  function prepUpTo(id) {
    const order = S.version === 'control' ? ['c1', 'c2', 'c3', 'c4', 'c6'] : ['v1', 'v2', 'v3', 'v4', 'v5'];
    const k = order.indexOf(id);
    S.up = { statement: null, front: false, back: false };
    if (S.version === 'control') { if (k > 2) { S.up.front = true; S.up.back = true; } if (k > 3) S.up.statement = 'done'; }
    else if (k > 2) S.up.statement = 'done';
  }

  /* ---------- The experiment ---------- */
  const Z = { conf: { 90: 1.6449, 95: 1.96, 99: 2.5758 }, power: { 80: 0.8416, 90: 1.2816 } };
  function sampleSize(base, lift, conf, power) {
    const p1 = base / 100, p2 = (base + lift) / 100, pb = (p1 + p2) / 2;
    const a = Z.conf[conf] * Math.sqrt(2 * pb * (1 - pb)), b = Z.power[power] * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2));
    return Math.ceil(((a + b) ** 2) / ((p2 - p1) ** 2));
  }
  const calc = { base: 35, lift: 5, conf: '95', power: '80', daily: 300 };
  function renderExp() {
    expEl.innerHTML = `<div class="exp">
      <header><p class="exp__kicker">Nunua Sasa, Remastered · Day 6</p><h1 class="exp__title">Show the limit before asking for the ID</h1>
      <p class="exp__lede">Most people who left Nunua Sasa's sign-up left when it asked for their National ID. This is the test I would run to fix it: the brief, both versions, and the numbers needed before anyone sees a result.</p></header>
      <div class="exp__grid">
        <article class="exp-card"><h2>The problem</h2><h3>Most people who left sign-up left when we asked for their National ID.</h3><p>It came third, with no reason given, before they had seen anything in return.</p></article>
        <article class="exp-card"><h2>Hypothesis</h2><h3>If people see what we need and why, and see their limit before we ask for their ID, more of them will finish.</h3><p>Without more failed ID checks, more support tickets or more late payments.</p></article>
        <article class="exp-card exp-card--dark"><h2>Decision rule, written before launch</h2><h3>Switch to the variant if sign-ups finished rise by 5 points or more, with 95% confidence, and no guardrail crosses its line.</h3><p>If it's flat, keep the control. It's what is already built and tested.</p></article>
        <article class="exp-card exp-card--wide"><h2>What changes</h2><h3>Same questions, new order. The ID moves from third to last, and becomes the key to a limit the person can already see.</h3>
          <div class="exp-flow">
            <div class="exp-flow__row"><span class="exp-flow__name">Control</span>${['Phone', 'Details', ['National ID', 'ask'], 'Statement', 'Scoring', ['Limit', 'val']].map(pill).join('<span class="exp-arrow" aria-hidden="true">→</span>')}</div>
            <div class="exp-flow__row"><span class="exp-flow__name">Variant</span>${['Phone', ['Checklist', 'new'], 'Statement', ['Your limit', 'val'], ['National ID + name', 'ask'], 'Ready'].map(pill).join('<span class="exp-arrow" aria-hidden="true">→</span>')}</div>
          </div>
          <p class="exp-key"><span>Red: the big ask</span><span>Dark: value shown</span><span>Blue: new screen</span></p></article>
        <article class="exp-card"><h2>Main measure</h2><h3>Share of people who start sign-up and reach a usable limit within 7 days.</h3><p>Also watched: completion at each step (the ID step most of all), time to finish, and how many come back from the SMS link.</p></article>
        <article class="exp-card"><h2>Guardrails</h2><h3>The variant must not make things worse here.</h3>
          <dl class="exp-rows"><div><dt>Support tickets per 100 sign-ups</dt><dd>Up 10% at most</dd></div><div><dt>ID checks failed or flagged</dt><dd>Up 1 point at most</dd></div><div><dt>Late payments at 60 days</dt><dd>No rise</dd></div></dl></article>
        <article class="exp-card"><h2>What stays the same</h2><h3>So the test only measures the order and the explanations.</h3>
          <ul><li>The phone check: the SMS code is read automatically in both</li><li>The questions: phone, statement, ID and name</li><li>How the limit is worked out</li><li>The look: same components in both</li></ul></article>
        <article class="exp-card exp-card--wide" aria-labelledby="calc-title"><h2 id="calc-title">Sample size</h2><h3>How many people each version needs before the result means anything.</h3>
          <form class="exp-calc" id="calc" novalidate>
            <label>Finish rate today (%)<input name="base" type="number" inputmode="decimal" min="1" max="95" step="1" value="${calc.base}"></label>
            <label>Smallest rise worth acting on (points)<input name="lift" type="number" inputmode="decimal" min="1" max="30" step="0.5" value="${calc.lift}"></label>
            <label>Confidence<select name="conf">${['90', '95', '99'].map(v => `<option${v === calc.conf ? ' selected' : ''}>${v}</option>`).join('')}</select></label>
            <label>Power<select name="power">${['80', '90'].map(v => `<option${v === calc.power ? ' selected' : ''}>${v}</option>`).join('')}</select></label>
            <label>Sign-ups started a day<input name="daily" type="number" inputmode="numeric" min="10" step="10" value="${calc.daily}"></label>
          </form>
          <p class="exp-error" id="calc-error" role="alert"></p>
          <div class="exp-result" id="calc-out" aria-live="polite"></div>
          <p class="exp-note">The 35% finish rate is an assumption for this concept. Swap in the real number before launch. The run is rounded up to whole weeks, and never shorter than two, so it covers a month-end payday.</p></article>
        <article class="exp-card"><h2>Events to track</h2><ul class="exp-events">${[['onboarding_started', 'version'], ['step_viewed', 'step, version'], ['step_completed', 'step, seconds'], ['document_failed', 'reason'], ['limit_shown', 'amount, provisional'], ['saved_for_later', 'step'], ['resumed_from_sms', 'step'], ['onboarding_completed', 'version']].map(([n, p]) => `<li>${n} <span>· ${p}</span></li>`).join('')}</ul></article>
        <article class="exp-card"><h2>If it wins, test next</h2><h3>The variant changes three things at once. Pull them apart.</h3><ul><li>The checklist only, in the original order</li><li>Limit before ID, without the checklist</li><li>The "why" lines on and off</li></ul></article>
        <article class="exp-card exp-card--dark"><h2>Try it</h2><h3>Both versions are live in this page.</h3><p>Switch between them in the bar above, and watch the events each one would send.</p>
          <div class="exp-actions"><button type="button" class="exp-btn" data-view-go="control">Open the control</button><button type="button" class="exp-btn exp-btn--ghost" data-view-go="variant">Open the variant</button></div></article>
      </div></div>`;
    updateCalc();
  }
  function pill(p) { const [t, k] = Array.isArray(p) ? p : [p, '']; return `<span class="exp-pill${k ? ' exp-pill--' + k : ''}">${t}</span>`; }
  function updateCalc() {
    const out = document.getElementById('calc-out'), err = document.getElementById('calc-error'); if (!out) return;
    const { base, lift, daily } = calc;
    let msg = '';
    if (!(base >= 1 && base <= 95)) msg = 'Enter a finish rate between 1% and 95%.';
    else if (!(lift >= 0.5 && lift <= 30)) msg = 'Enter a rise between 0.5 and 30 points.';
    else if (base + lift >= 100) msg = 'The finish rate plus the rise has to stay under 100%.';
    else if (!(daily >= 10)) msg = 'Enter at least 10 sign-ups a day.';
    err.textContent = msg;
    if (msg) { out.innerHTML = ''; return; }
    const n = sampleSize(base, lift, calc.conf, calc.power), total = n * 2, days = Math.ceil(total / daily), run = Math.max(14, Math.ceil(days / 7) * 7);
    out.innerHTML = `<div><b>${ksh(n)}</b><span>people per version</span></div><div><b>${ksh(total)}</b><span>people in total</span></div><div><b>${days}</b><span>day${days === 1 ? '' : 's'} at ${ksh(daily)} a day</span></div><div><b>${run / 7} weeks</b><span>to run it (${run} days)</span></div>`;
  }
  expEl.addEventListener('input', e => {
    const t = e.target; if (!t.name) return;
    calc[t.name] = t.tagName === 'SELECT' ? t.value : parseFloat(t.value);
    updateCalc();
  });
  expEl.addEventListener('click', e => { const b = e.target.closest('[data-view-go]'); if (b) setView(b.dataset.viewGo); });

  /* ---------- Views ---------- */
  function setView(v) {
    view = v;
    document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === v)));
    const exp = v === 'experiment';
    appStage.hidden = exp; expEl.hidden = !exp;
    if (exp) { if (!expEl.firstChild) renderExp(); expEl.scrollTop = 0; return; }
    if (!S || S.version !== v) reset(v);
    fit();
  }
  function reset(version, withSplash) {
    clearTimers(); closeSheet(); notifEl.hidden = true; notifEl.innerHTML = '';
    S = fresh(version || S.version, withSplash);
    track('onboarding_started');
    if (STEP[S.screen]) track('step_viewed', { step: STEP[S.screen] });
    render(true);
  }
  conceptBar.addEventListener('click', e => {
    const b = e.target.closest('[data-view]'); if (b) return setView(b.dataset.view);
    if (e.target.closest('[data-reset]')) { events = []; if (view === 'experiment') { setView('variant'); } reset(view === 'experiment' ? 'variant' : view, true); toast('Demo reset'); }
  });

  /* ---------- Fit the phone to the window ---------- */
  function fit() {
    const bar = conceptBar.offsetHeight;
    document.documentElement.style.setProperty('--bar-h', bar + 'px');
    if (window.innerWidth <= 560) { device.style.removeProperty('--s'); return; }
    const s = Math.min(1, Math.max(0.62, (window.innerHeight - bar - 48) / 912));
    device.style.setProperty('--s', s.toFixed(3));
  }
  window.addEventListener('resize', fit);

  const start = new URLSearchParams(location.search).get('v');
  S = fresh(start === 'control' ? 'control' : 'variant', start !== 'experiment');
  view = S.version;
  setView(start === 'experiment' ? 'experiment' : S.version);
  track('onboarding_started');
  if (STEP[S.screen]) track('step_viewed', { step: STEP[S.screen] });
  render(true);
  fit();
})();
