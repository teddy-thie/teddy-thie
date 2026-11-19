/* Hatua · Lab concept on tedthie.cc
   One operations lead (Achieng) owns an AI agent that checks supplier invoices against purchase orders.
   One finance manager (Kamau) approves what it drafts. Everything is scripted in this file:
   no network requests, no storage, no credentials. Every company, invoice and number is invented. */
(() => {
  'use strict';

  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const T = ms => (REDUCE ? Math.min(ms, 60) : ms);
  const wait = ms => new Promise(r => setTimeout(r, T(ms)));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const num = (n, dp = 0) => n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
  const ksh = (n, dp = 0) => 'KSh ' + num(n, dp);

  /* ---------- Icons (24px grid, drawn as strokes) and the Hatua mark ---------- */
  const P = {
    home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
    steps: 'M4 19h5v-5h5V9h5V4',
    list: 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
    inbox: 'M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
    shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    sliders: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
    check: 'M20 6 9 17l-5-5',
    x: 'M18 6 6 18M6 6l12 12',
    pause: 'M9 5v14M15 5v14',
    alert: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
    sparkle: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
    chevR: 'M9 18l6-6-6-6',
    chevD: 'M6 9l6 6 6-6',
    file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5',
    mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6',
    search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35',
    filter: 'M3 6h18M7 12h10M10 18h4',
    play: 'M7 4v16l13-8z',
    edit: 'M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z',
    rerun: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',
    clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
    user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    clip: 'M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48',
    eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    dots: 'M5 12h.01M12 12h.01M19 12h.01',
    code: 'M16 18l6-6-6-6M8 6l-6 6 6 6',
    copy: 'M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
    plus: 'M12 5v14M5 12h14',
    message: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',
    arrow: 'M5 12h14M13 6l6 6-6 6',
  };
  const icon = (n, cls = '') => `<svg class="ico ${n === 'dots' ? 'ico--dots ' : ''}${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${P[n]}"/></svg>`;
  const MARK_PATH = '<path d="M28 88H60V60H92V32" fill="none" stroke-width="10" stroke="currentColor"/><circle cx="28" cy="88" r="11.5"/><circle cx="60" cy="60" r="11.5"/><circle cx="92" cy="32" r="11.5"/>';
  const markTile = (s = 28) => `<svg class="mark" width="${s}" height="${s}" viewBox="0 0 120 120" aria-hidden="true"><rect width="120" height="120" rx="28" fill="#5A3FF0"/><g fill="#fff" style="color:#fff">${MARK_PATH}</g></svg>`;
  const mark = (s = 16) => `<svg class="mark" width="${s}" height="${s}" viewBox="0 0 120 120" aria-hidden="true"><g fill="#5A3FF0" style="color:#5A3FF0">${MARK_PATH}</g></svg>`;

  /* ---------- Demo data ---------- */
  const SUP = {
    KC: { name: 'Kiboko Cement', mail: 'billing@kiboko-cement.example' },
    RP: { name: 'Rafiki Paints', mail: 'accounts@rafiki-paints.example' },
    SS: { name: 'Simba Steel', mail: 'billing@simba-steel.example' },
    TT: { name: 'Tembo Timber', mail: 'invoices@tembo-timber.example' },
    JH: { name: 'Jua Hardware', mail: 'billing@jua-hardware.example' },
  };
  const STEP = ['Read the email', 'Read the invoice', 'Match it to a PO', 'Draft the approval', 'Send to Kamau'];
  const DOING = ['reading the email', 'reading the invoice', 'matching the PO', 'drafting the approval', 'sending to Kamau'];
  const DUR = [0.4, 1.3, 0.6, 0.7, 0.2];
  const RERUN_DUR = [null, null, 0.3, 0.9, 0.2];
  const FAIL_DUR = { prefix: [0.4, 1.3, 0.4], pause: [0.4, 1.2, 0.5], permission: [0.3, 1.1, 0.0], unreadable: [0.3, 2.4], duplicate: [0.3, 0.5] };
  const ORIGINAL_STEP3 = 'Find the PO in the register whose number matches the invoice. Check supplier, items and total.';
  const FIX_BASE = 'Find the PO in the register whose number matches the invoice. ';
  const FIX_SUGGEST = 'If the invoice gives only the last digits, like “PO 0412”, add the PO-2026- prefix before looking.';
  const PROMPT = 'When a supplier invoice lands in invoices@, read it, match it to the PO, and draft an approval for Kamau. Pause if the price is off by more than 1% or KSh 1,000.';

  const RUNS = () => [
    { id: 'kc1190', inv: 'INV-KC-1190', sup: 'KC', item: 'Cement, 50 kg bag', qty: 90, unit: 780, po: 'PO-2026-0402', time: '09:48', kind: 'pass', state: 'running', at: 1 },
    { id: 'ss0907', inv: 'INV-SS-0907', sup: 'SS', item: 'Y12 deformed bar, 12 m', qty: 120, unit: 1150, po: 'PO-2026-0412', poField: 'PO 0412', time: '09:42', kind: 'prefix', state: 'failed', at: 2 },
    { id: 'rp2231', inv: 'INV-RP-2231', sup: 'RP', item: 'Emulsion paint, white, 4 L tin', qty: 60, unit: 2450, poUnit: 2392.5, po: 'PO-2026-0405', time: '09:31', kind: 'pause', state: 'paused', at: 2 },
    { id: 'kc1182', inv: 'INV-KC-1182', sup: 'KC', item: 'Cement, 50 kg bag', qty: 200, unit: 780, po: 'PO-2026-0398', time: '09:15', kind: 'pass', state: 'passed', approval: 'waiting', sentAt: '09:15' },
    { id: 'tt0441', inv: 'INV-TT-0441', sup: 'TT', item: 'Timber, 4×2, 3 m', qty: 40, unit: 1250, po: 'PO-2026-0377', time: '08:52', kind: 'pass', state: 'passed', approval: 'approved', approvedAt: '09:20', sentAt: '08:52' },
    { id: 'jh0310', inv: 'INV-JH-0310', sup: 'JH', item: 'Wire nails, 3 in, 25 kg box', qty: 25, unit: 1800, po: 'PO-2026-0391', time: '08:20', kind: 'pass', state: 'passed', approval: 'approved', approvedAt: '08:41', sentAt: '08:20' },
  ];
  const STATE_RUNS = {
    permission: { id: 'jh0318', inv: 'INV-JH-0318', sup: 'JH', item: 'Binding wire, 20 kg roll', qty: 30, unit: 2100, po: 'PO-2026-0420', time: '10:12', kind: 'permission', state: 'failed', at: 2 },
    unreadable: { id: 'tt0452', inv: 'INV-TT-0452', sup: 'TT', item: 'Timber, 4×2, 3 m', qty: 30, unit: 1250, po: 'PO-2026-0430', time: '10:31', kind: 'unreadable', state: 'failed', at: 1, file: 'IMG_2207.pdf' },
    duplicate: { id: 'kc1182b', inv: 'INV-KC-1182', sup: 'KC', item: 'Cement, 50 kg bag', qty: 200, unit: 780, po: 'PO-2026-0398', time: '11:20', kind: 'duplicate', state: 'paused', at: 1, firstId: 'kc1182' },
    etims: { id: 'tt0460', inv: 'INV-TT-0460', sup: 'TT', item: 'Timber, 4×2, 3 m', qty: 48, unit: 1250, po: 'PO-2026-0415', time: '10:05', kind: 'etims', state: 'passed', approval: 'waiting', sentAt: '10:05', pinMissing: true, kamauNew: true },
  };
  const net = r => r.qty * r.unit;
  const vat = r => Math.round(net(r) * 0.16);
  const total = r => net(r) + vat(r);
  const poTotal = r => Math.round(r.qty * r.poUnit * 1.16);
  const sup = r => SUP[r.sup].name;
  const etimsNo = r => 'ETIMS-DEMO-' + r.inv.slice(-4);
  const fileOf = r => r.file || r.inv + '.pdf';

  const PERMS = [
    { g: 'READ', k: 'inbox', ic: 'mail', t: 'Read the invoices inbox', d: 'Only invoices@mawe.example. It can’t send from it.', s: 'read invoices@' },
    { g: 'READ', k: 'po', ic: 'file', t: 'Read the PO register', d: 'Open POs and their lines. It can’t edit them.', s: 'read the PO register' },
    { g: 'WRITE', k: 'draft', ic: 'edit', t: 'Draft approvals', d: 'Drafts stay drafts until Kamau decides.', s: 'draft approvals' },
    { g: 'WRITE', k: 'queue', ic: 'user', t: 'Put drafts in Kamau’s approvals', d: 'Kamau gets one notification per draft.', s: 'put drafts in Kamau’s queue' },
    { g: 'WRITE', k: 'email', ic: 'message', t: 'Email a supplier', d: 'Hatua writes the email; you read it and press send.', s: 'email a supplier' },
    { g: 'WRITE', k: 'poEdit', ic: 'sliders', t: 'Change a PO', d: 'POs are changed by people in your ERP.', s: 'change a PO' },
    { g: 'MONEY', k: 'pay', ic: 'lock', t: 'Send payments', d: 'Never, and it can’t be changed. Money only moves when someone at Mawe pays from the bank.', s: 'send a payment', locked: true },
  ];
  const LEVELS = [['allowed', 'Allowed'], ['ask', 'Ask first'], ['never', 'Never']];

  /* ---------- State ---------- */
  let S;
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, T(ms)); timers.add(t); return t; };
  function fresh() {
    timers.forEach(clearTimeout); timers.clear();
    S = {
      who: 'achieng', view: 'runs', last: { achieng: 'runs', kamau: 'queue' },
      runs: RUNS(), runId: null, sel: 0, tab: 'why', raw: false,
      filter: 'all', q: '', kq: '', kTab: 'waiting',
      prompt: PROMPT, drafting: false, reveal: 5,
      agent: { live: true, steps: STEP.map((t, i) => ({ t, ins: [
        'When an email lands in invoices@mawe.example, take the PDF invoice attached to it.',
        'Pull out the supplier, PO number, lines and totals, the eTIMS invoice number and Mawe’s buyer PIN. Check it isn’t an invoice we’ve already had.',
        ORIGINAL_STEP3,
        'If it matches within 1% or KSh 1,000, whichever is less, draft an approval. If not, pause and say why.',
        'Put the draft in Kamau’s approvals. Don’t email the supplier.'][i], by: 'hatua',
        uses: [['Invoices inbox', 'mail'], ['Invoice reader', 'eye'], ['PO register', 'file'], ['Approvals', 'inbox'], ['Kamau · finance', 'user']][i] })) },
      edit: null,
      perms: { inbox: 'allowed', po: 'allowed', draft: 'allowed', queue: 'allowed', email: 'ask', poEdit: 'never', pay: 'never', emailConfirmed: true, hl: null },
      firstRun: false, tested: true,
      test: { status: 'idle', results: [], sel: 2 },
      fix: { html: null, saved: false, apply: true, fixedAt: null },
      typed: { po: '', total: '' }, typing: false, replyDraft: false,
      decide: 'po', rejecting: null, editingNote: null,
      clock: 52, events: [],
    };
    later(tickLive, 3200);
  }
  const clock = () => { const m = S.clock++; return `${String(9 + Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };
  const run = id => S.runs.find(r => r.id === id);
  const track = (name, data = {}) => { S.events.push({ name, ...data }); if (window.console) console.debug('[hatua]', name, data); };

  /* ---------- Derived: steps, notes, counts ---------- */
  function steps(r) {
    const out = [];
    for (let i = 0; i < 5; i++) {
      const kept = r.kept && i < r.kept;
      let s, d, du = DUR[i];
      if (kept) { s = 'kept'; d = `Kept from ${r.time}`; }
      else if (r.state === 'passed' || i < r.at) { s = 'passed'; d = passDetail(r, i); if (r.kept && RERUN_DUR[i]) du = RERUN_DUR[i]; }
      else if (r.state === 'running' && i === r.at) { s = 'running'; d = `${DOING[i][0].toUpperCase() + DOING[i].slice(1)}…`; du = null; }
      else if (i === r.at && r.state === 'failed') { s = 'failed'; d = failDetail(r); du = (FAIL_DUR[r.kind] || DUR)[i]; }
      else if (i === r.at && r.state === 'paused') { s = 'paused'; d = pauseDetail(r); du = (FAIL_DUR[r.kind] || DUR)[i]; }
      else if (i === r.at && r.state === 'closed') { s = 'closed'; d = 'Closed as a duplicate'; du = (FAIL_DUR.duplicate)[i]; }
      else {
        s = 'waiting'; du = null;
        d = r.state === 'running' ? `Waits for step ${r.at + 1}` : r.state === 'paused' && r.kind === 'pause' ? 'Waits for Kamau' : i === r.at + 1 && r.state === 'failed' ? `Didn’t run: step ${r.at + 1} failed` : 'Didn’t run';
      }
      if (s === 'passed' && r.kind === 'pass' && !r.kept) du = DUR[i];
      out.push({ s, d, du, t: STEP[i] });
    }
    return out;
  }
  function passDetail(r, i) {
    if (i === 0) return `Found ${fileOf(r)} from ${sup(r)}`;
    if (i === 1) return r.pinMissing ? 'eTIMS no. found · buyer PIN missing (flagged)' : r.typedIn ? 'PO number and total typed in by Achieng' : 'eTIMS no. and buyer PIN found · not a duplicate';
    if (i === 2) {
      if (r.kind === 'prefix' && r.kept) return `Matched ${r.po} after adding the prefix`;
      if (r.kind === 'pause') return r.approval === 'approved-invoice' ? 'Kamau accepted the invoice price' : 'Kamau chose the PO price';
      if (r.kind === 'permission' && r.kept) return `Matched ${r.po} · allowed once`;
      return `Matches ${r.po} · totals match`;
    }
    if (i === 3) return r.kind === 'pause' && r.approval === 'approved-po' ? `${ksh(poTotal(r))} at the PO price · credit note drafted` : `${ksh(total(r))} to ${sup(r)} · within tolerance`;
    if (r.approval === 'approved' || r.approval === 'approved-po' || r.approval === 'approved-invoice') return `Approved by Kamau at ${r.approvedAt}`;
    if (r.approval === 'rejected') return 'Kamau sent it back with a reason';
    return `In Kamau’s approvals since ${r.sentAt}`;
  }
  function failDetail(r) {
    if (r.kind === 'prefix') return 'No PO called “0412” in the register';
    if (r.kind === 'permission') return 'Not allowed to read the PO register';
    if (r.kind === 'unreadable') return 'Totals unreadable · 2 of 6 fields found';
    return 'Failed';
  }
  function pauseDetail(r) {
    if (r.kind === 'pause') return r.approval === 'returned' ? 'Kamau sent it back to Achieng' : `Unit price 2.4% over ${r.po} · asked Kamau`;
    if (r.kind === 'duplicate') return 'Same invoice approved today at 10:05 · stopped before drafting';
    return 'Needs a person';
  }
  function note(r) {
    if (r.state === 'running') return [`Step ${r.at + 1} of 5 · ${DOING[r.at]}`, ''];
    if (r.state === 'failed') return [{ prefix: 'Step 3 failed · no PO called “0412”', permission: 'Step 3 failed · needs the PO register', unreadable: 'Step 2 failed · can’t read the totals' }[r.kind], 't-fail'];
    if (r.state === 'paused') return [r.kind === 'duplicate' ? 'Stopped · same invoice approved at 10:05' : r.approval === 'returned' ? 'Kamau sent it back to you' : 'Waiting for Kamau · 2.4% over the PO', 't-pause'];
    if (r.state === 'closed') return ['Closed as a duplicate of the 09:15 copy', ''];
    if (r.approval === 'rejected') return [`Kamau sent it back: “${r.rejectReason}”`, 't-pause'];
    if (r.approval && r.approval.startsWith('approved')) return [`Approved by Kamau · ${r.po}`, ''];
    if (r.pinMissing) return ['Sent to Kamau · buyer PIN missing (flagged)', 't-pause'];
    return [`Sent to Kamau · matches ${r.po}${r.kept ? ' after a fix' : ''}`, ''];
  }
  const dur = r => { if (r.state === 'running') return '—'; const t = steps(r).reduce((a, s) => a + (s.s !== 'kept' && s.du ? s.du : 0), 0); return t.toFixed(1) + ' s'; };
  const visibleRuns = () => (S.firstRun ? [] : S.runs);
  const attention = () => visibleRuns().filter(r => r.state === 'failed' || r.state === 'paused').length;
  const isWaiting = r => (r.state === 'passed' && r.approval === 'waiting') || (r.kind === 'pause' && r.state === 'paused' && r.approval !== 'returned');
  const queue = () => visibleRuns().filter(isWaiting).sort((a, b) => (b.state === 'paused') - (a.state === 'paused') || (b.kamauNew ? 1 : 0) - (a.kamauNew ? 1 : 0));
  const decided = () => visibleRuns().filter(r => r.approval && r.approval !== 'waiting' && !(r.kind === 'pause' && r.state === 'paused' && r.approval !== 'returned'));

  /* ---------- Small renderers ---------- */
  const PILL = { passed: ['passed', 'check', 'Passed'], paused: ['paused', 'pause', 'Needs a person'], failed: ['failed', 'x', 'Failed'], running: ['running', 'sparkle', 'Running'], waiting: ['waiting', 'clock', 'Waiting'], kept: ['kept', 'check', 'Kept'], closed: ['closed', 'x', 'Closed'], draft: ['draft', 'edit', 'Draft'] };
  const pill = (k, label) => { const [c, ic, l] = PILL[k]; return `<span class="pill pill--${c}">${icon(ic)}${esc(label || l)}</span>`; };
  const btn = (style, label, act, extra = '', ic = '') => `<button type="button" class="btn btn--${style}" data-act="${act}" ${extra}>${ic ? icon(ic, 'ico--s') : ''}${esc(label)}</button>`;
  const callout = (tone, title, body, ic) => `<div class="callout callout--${tone}">${tone === 'agent' ? mark(18) : icon(ic || { pass: 'check', pause: 'pause', fail: 'alert' }[tone])}<div class="callout__t"><span class="callout__title">${esc(title)}</span><span>${body}</span></div></div>`;
  const top = (crumbs, right = '') => `<div class="top"><nav class="crumb" aria-label="Breadcrumb">${crumbs.map((c, i) => {
    const last = i === crumbs.length - 1; const lab = c[2] ? `<span class="t-code-strong">${esc(c[0])}</span>` : esc(c[0]);
    return (i ? icon('chevR', 'ico--s') : '') + (last ? `<b aria-current="page">${lab}</b>` : c[1] ? `<button type="button" data-act="${c[1]}">${lab}</button>` : `<span>${lab}</span>`);
  }).join('')}</nav><span class="fill"></span>${right}</div>`;
  const stepCard = (st, i, opts = {}) => {
    const mk = st.s === 'waiting' || st.s === 'running' ? String(i + 1) : icon({ passed: 'check', paused: 'pause', failed: 'x', kept: 'check', closed: 'x' }[st.s]);
    const tag = opts.static ? 'div' : 'button';
    return `<${tag} ${opts.static ? '' : `type="button" data-act="sel-step" data-i="${i}" aria-current="${opts.current ? 'true' : 'false'}"`} class="step step--${st.s}${st.s === 'running' ? ' shimmer' : ''}">
      <span class="step__mk">${mk}</span>
      <span class="step__t"><span class="step__title">${esc(st.t)}</span><span class="t-cap">${esc(st.d)}</span></span>
      <span class="step__du">${st.du == null ? '—' : st.du.toFixed(1) + ' s'}</span>${icon(opts.current ? 'chevR' : 'chevD', 'ico--s t-muted')}
      <span class="sr-only">, ${({ passed: 'passed', paused: 'needs a person', failed: 'failed', running: 'running', waiting: 'not run', kept: 'kept from the first run', closed: 'closed' })[st.s]}</span></${tag}>`;
  };
  const tabs = (list, cur, act, label) => `<div class="tabs" role="tablist" aria-label="${esc(label)}">${list.map(([k, l]) => `<button type="button" role="tab" class="tab" data-act="${act}" data-k="${k}" aria-selected="${k === cur}" tabindex="${k === cur ? 0 : -1}">${esc(l)}</button>`).join('')}</div>`;
  const cmp = (head, rows) => `<div class="cmp" role="table" aria-label="Invoice against the PO">
    <div class="cmp__row cmp__head" role="row">${['Field', 'Invoice', head, 'Result'].map(h => `<span class="lbl" role="columnheader">${esc(h)}</span>`).join('')}</div>
    ${rows.map(([kind, f, a, b, res]) => `<div class="cmp__row cmp__row--${kind}" role="row"><span class="t-cap" role="cell">${esc(f)}</span><span class="t-code" role="cell">${esc(a)}</span><span class="t-code" role="cell">${esc(b)}</span><span class="cmp__res" role="cell">${icon({ match: 'check', differs: 'alert', missing: 'x' }[kind], 'ico--xs')}${esc(res || { match: 'Same', differs: 'Differs', missing: 'Not found' }[kind])}</span></div>`).join('')}</div>`;
  const dataRows = (rows, label) => `<div class="data" role="table" aria-label="${esc(label)}">${rows.map(([k, v, src, flag]) => `<div class="data__row${flag ? ' data__row--flag' : ''}" role="row"><span class="t-cap" role="cell">${esc(k)}</span><span class="t-code" role="cell">${esc(v)}</span><span class="t-cap" role="cell">${esc(src)}</span></div>`).join('')}</div>`;

  /* ---------- Sidebar ---------- */
  function navKey() { return ({ home: 'home', agent: 'agents', test: 'agents', perms: 'perms', runs: 'runs', run: 'runs', fix: 'runs', approvals: 'approvals', queue: 'approvals', approval: 'approvals', decide: 'approvals' })[S.view]; }
  function renderSide() {
    const a = S.who === 'achieng', cur = navKey();
    const items = [['home', 'Home', 'home'], ['agents', 'Agents', 'steps'], ['runs', 'Runs', 'list', a ? attention() : 0], ['approvals', 'Approvals', 'inbox', a ? 0 : queue().length], ['perms', 'Permissions', 'shield']];
    const agentDot = S.agent.live ? 'dot--live' : S.test.status === 'running' ? 'dot--test' : '';
    const agentName = S.agent.live ? 'Invoice approvals' : S.test.status === 'running' ? 'Invoice approvals (testing)' : S.firstRun ? 'Invoice approvals (new)' : 'Invoice approvals (draft)';
    return `<div class="sb-brand">${markTile(28)}<span>Hatua</span></div>
      <div class="sb-ws"><span class="sb-ws__av" aria-hidden="true">M</span><span class="sb-ws__t"><span class="t-strong">Mawe Supplies</span><span class="t-cap">Workspace (demo)</span></span>${icon('chevD', 'ico--s t-muted')}</div>
      <nav class="sb-nav" aria-label="Main">${items.map(([k, l, ic, c]) => `<button type="button" class="nav" data-act="nav" data-k="${k}" ${k === cur ? 'aria-current="page"' : ''}>${icon(ic, 'ico--s')}<span>${l}</span>${c ? `<span class="nav__count" aria-label="${c} need attention">${c}</span>` : ''}</button>`).join('')}</nav>
      ${a ? `<p class="lbl sb-sec">Your agents</p><button type="button" class="nav sb-agent" data-act="nav" data-k="agents"><span class="dot ${agentDot}" aria-hidden="true"></span><span style="color:var(--ink)">${agentName}</span></button>` : ''}
      <span class="sb-fill"></span>
      <button type="button" class="nav" data-act="soon">${icon('sliders', 'ico--s')}<span>Settings</span></button>
      <div class="sb-user"><span class="sb-user__av" aria-hidden="true">${a ? 'AO' : 'K'}</span><span class="sb-user__t"><span class="t-strong">${a ? 'Achieng' : 'Kamau'}</span><span class="t-cap">${a ? 'Operations lead' : 'Finance manager'}</span></span>${icon('dots', 'ico--s t-muted')}</div>`;
  }

  /* ---------- H1 Home ---------- */
  function vHome() {
    const w = S.drafting;
    return top([['Home']], btn('ghost', 'How Hatua works', 'how')) + `<div class="home">
      <span class="eyebrow">${icon('sparkle', 'ico--xs')}${S.agent.live ? 'Start another agent' : 'Your first agent'}</span>
      <h2 class="t-display" tabindex="-1" data-focus>What should Hatua <b>check</b>?</h2>
      <p class="home__sub">Describe it the way you’d explain it to a new colleague. Hatua drafts the steps, you edit them, and nothing runs until you test it.</p>
      <div class="composer${w ? ' shimmer' : ''}">
        <span class="composer__att">${icon('clip', 'ico--xs')}<span class="t-code" style="color:var(--ink)">INV-SS-0907.pdf</span><span class="t-cap">Sample invoice (demo)</span></span>
        <label class="sr-only" for="prompt">Describe what the agent should do</label>
        <textarea id="prompt" rows="2" ${w ? 'readonly' : ''}>${esc(S.prompt)}</textarea>
        <div class="composer__row">
          <button type="button" class="composer__add" data-act="soon" aria-label="Add a file or a source">${icon('plus', 'ico--s')}</button>
          ${w ? `<span class="composer__working" role="status">${icon('sparkle', 'ico--s')}Drafting 5 steps from your description…</span>`
            : `<span class="chip">${icon('mail', 'ico--s')}Invoices inbox</span><span class="chip">${icon('file', 'ico--s')}PO register</span><span class="chip">${icon('user', 'ico--s')}Kamau</span>`}
          <span class="fill"></span>
          ${w ? btn('ghost', 'Stop', 'stop-draft') : btn('agent', 'Draft the agent', 'draft', '', 'sparkle')}
        </div>
      </div>
      <div class="examples"><p class="lbl">Or start from an example</p><div class="examples__row">
        ${[['Invoice against PO', 'Read each invoice, match it to its PO, draft an approval for finance.', 'inbox', 'example'], ['Monthly statement check', 'Compare a supplier’s statement with the invoices you already have.', 'file', 'soon'], ['Delivery note vs PO', 'Flag deliveries that are short or carry items you didn’t order.', 'list', 'soon']]
          .map(([t, d, ic, act]) => `<button type="button" class="example" data-act="${act}"><span class="tile">${icon(ic, 'ico--s')}</span><span class="t-strong">${t}</span><span class="t-cap">${d}</span></button>`).join('')}
      </div></div>
      <p class="foot">${icon('shield', 'ico--xs')}Hatua reads, matches and drafts. It asks before anything leaves Mawe, and it never pays anyone.</p>
    </div>`;
  }

  /* ---------- H2 Drafted agent ---------- */
  function vAgent() {
    const A = S.agent;
    const checks = [
      ['Choose what it may touch', S.perms.emailConfirmed ? '7 permissions set' : '7 permissions · 1 needs your choice', S.perms.emailConfirmed, 'nav-perms'],
      ['Test on sample invoices', S.tested ? 'Tested on 3 demo invoices' : '3 demo invoices, nothing is sent', S.tested, 'nav-test'],
      ['Turn it on', A.live ? 'Live since 3 Nov (demo)' : 'After a passing test', A.live, 'nav-test']];
    const firstOpen = checks.findIndex(c => !c[2]);
    return top([['Agents', 'nav-agents'], ['Invoice approvals']], btn('secondary', 'Save draft', 'saved') + btn('primary', 'Test on samples', 'nav-test', '', 'play')) + `<div class="content"><div class="agent">
      <div style="display:grid;gap:16px">
        <div class="head__row"><h2 class="t-title" tabindex="-1" data-focus>Invoice approvals</h2>${A.live ? pill('passed', 'Live') : pill('draft')}</div>
        <div class="said">${icon('message', 'ico--s')}<div class="said__t"><span class="lbl">You said</span><span>${esc(S.prompt)}</span></div><button type="button" class="link" data-act="nav-home">Edit</button></div>
        <p class="row t-cap t-agent" style="margin:0">${mark(14)}Hatua drafted 5 steps. Violet text is Hatua’s; anything you change turns black.</p>
        <ol class="steps" style="list-style:none;margin:0;padding:0">${A.steps.slice(0, S.reveal).map((st, i) => `<li class="dstep${i === S.revealAnim ? ' reveal' : ''}"><span class="dstep__mk">${i + 1}</span><div class="dstep__t">
          <span class="t-strong">${esc(st.t)}</span>
          ${S.edit === i ? `<label class="sr-only" for="edit-${i}">Instruction for step ${i + 1}</label><textarea id="edit-${i}" data-edit="${i}">${esc(st.ins)}</textarea><div class="row">${btn('primary', 'Save step', 'save-step', `data-i="${i}"`)}${btn('ghost', 'Cancel', 'cancel-step')}</div>`
            : `<p class="dstep__ins${st.by === 'person' ? ' by-person' : ''}">${esc(st.ins)}</p>${st.by === 'person' ? '<span class="t-cap">Edited by Achieng</span>' : ''}`}
          <span class="uses">${icon(st.uses[1], 'ico--xs')}${esc(st.uses[0])}</span></div>
          <div class="row" style="align-self:start;gap:0"><button type="button" class="icon-btn" data-act="edit-step" data-i="${i}" aria-label="Edit step ${i + 1}">${icon('edit', 'ico--s')}</button><button type="button" class="icon-btn" data-act="soon" aria-label="More for step ${i + 1}">${icon('dots', 'ico--s')}</button></div></li>`).join('')}</ol>
        <button type="button" class="addstep" data-act="soon">${icon('plus', 'ico--s')}Add a step</button>
      </div>
      <div class="side-col">
        <div class="card list-card"><div class="list-card__head"><h3 class="t-heading">Before it runs</h3><span class="t-cap">Three checks. Nothing reads real invoices until all three are done.</span></div>
          ${checks.map(([t, d, done, act], i) => `<button type="button" class="list-row" data-act="${act}"><span class="num ${done ? 'num--done' : i === firstOpen ? 'num--on' : ''}">${done ? icon('check', 'ico--xs') : i + 1}</span><span class="list-row__t"><span class="t-strong">${t}</span><span class="t-cap${!done && i === 0 ? ' t-pause' : ''}">${d}</span></span>${icon('chevR', 'ico--s t-muted')}</button>`).join('')}</div>
        <div class="card list-card"><div class="list-card__head"><h3 class="t-heading">Rules</h3><span class="t-cap">Checked on every invoice. Change them here, not in the steps.</span></div>
          ${[['Price tolerance', '1% or KSh 1,000, whichever is less', '1% · 1,000'], ['Duplicate window', 'Same supplier, number and amount', '90 days'], ['eTIMS check', 'eTIMS no. and Mawe’s buyer PIN on the invoice', 'On'], ['Approver', 'Every invoice, any amount', 'Kamau']]
            .map(([t, d, v]) => `<div class="list-row"><span class="list-row__t"><span class="t-strong">${t}</span><span class="t-cap">${d}</span></span><span class="val">${v}</span></div>`).join('')}</div>
        ${callout('agent', 'What Hatua assumed', 'Kamau approves every invoice, whatever the amount, and a repeat within 90 days counts as a duplicate. Change either under Rules.')}
      </div></div></div>`;
  }

  /* ---------- H3 Permissions ---------- */
  function vPerms() {
    const p = S.perms; let g = '';
    const rows = PERMS.map(x => {
      const head = x.g !== g ? `<div class="perm-group"><span class="lbl">${x.g === 'MONEY' ? 'Money' : x.g === 'READ' ? 'Read' : 'Write'}</span></div>` : ''; g = x.g;
      const needs = x.k === 'email' && !p.emailConfirmed, hl = p.hl === x.k;
      return head + `<div class="perm${needs ? ' perm--ask' : ''}${hl ? ' perm--hl' : ''}" ${hl ? 'id="perm-hl"' : ''}>
        <span class="perm__icon">${icon(x.ic, 'ico--s')}</span>
        <span class="perm__t"><span class="t-strong" id="pt-${x.k}">${esc(x.t)}</span><span class="t-cap${needs ? ' t-pause' : ''}">${needs ? 'Needs your choice · Hatua suggests Ask first: it writes the email, you press send.' : hl ? 'Set to Never · a run stopped because of it' : esc(x.d)}</span></span>
        <fieldset class="seg${x.locked ? ' seg--locked' : ''}" aria-labelledby="pt-${x.k}"><legend>${esc(x.t)}</legend>${LEVELS.map(([v, l]) => `<label>${x.locked && v === 'never' ? icon('lock', 'ico--xs') : ''}<input type="radio" name="perm-${x.k}" value="${v}" data-perm="${x.k}" ${p[x.k] === v ? 'checked' : ''} ${x.locked ? 'disabled' : ''}>${l}</label>`).join('')}</fieldset>
      </div>`;
    }).join('');
    const by = lv => PERMS.filter(x => p[x.k] === lv).map(x => x.s);
    const sentence = a => a.length ? (a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1] : a[0]).replace(/^./, c => c.toUpperCase()) + '.' : 'Nothing.';
    return top([['Agents', 'nav-agents'], ['Invoice approvals', 'nav-agents'], ['What it may touch']], btn('secondary', 'Back to steps', 'nav-agents') + btn('primary', 'Save and test', 'nav-test', '', 'play')) + `<div class="content"><div class="perms">
      <div style="display:grid;gap:16px"><div class="head__l"><h2 class="t-title" tabindex="-1" data-focus>What it may touch</h2><span class="t-muted">Each step asks only for what it needs. Pick a level for each line; you can change it later, and every change is logged.</span></div>
        <div class="card" style="overflow:hidden">${rows}</div></div>
      <div class="card plain" aria-live="polite"><h3 class="t-heading">In plain words</h3>
        <div class="plain__row">${icon('check', 'ico--s t-pass')}<span><span class="t-strong">It will</span><br><span class="t-muted">${esc(sentence(by('allowed')))}</span></span></div>
        <div class="plain__row">${icon('pause', 'ico--s t-pause')}<span><span class="t-strong">It will ask you before</span><br><span class="t-muted">${esc(sentence(by('ask')))}</span></span></div>
        <div class="plain__row">${icon('x', 'ico--s t-fail')}<span><span class="t-strong">It will never</span><br><span class="t-muted">${esc(sentence(by('never')))}</span></span></div>
        <p class="foot" style="border-top:1px solid var(--line);padding-top:12px;margin:0">${icon('shield', 'ico--xs')}Achieng and Kamau can change these.</p></div>
    </div></div>`;
  }

  /* ---------- H4 Test run ---------- */
  const SAMPLES = ['kc1182', 'rp2231', 'ss0907'];
  function sampleOutcome(i) { return i === 0 ? 'pass' : i === 1 ? 'pause' : S.fix.saved ? 'pass' : 'fail'; }
  function vTest() {
    const t = S.test, done = t.results.filter(x => x && x.end).length;
    const sel = t.sel, res = t.results[sel], r = run(SAMPLES[sel]);
    const sts = STEP.map((title, i) => {
      if (!res) return { s: 'waiting', d: 'Not started', du: null, t: title };
      if (i < res.prog || (res.end === 'pass' && i <= res.prog)) return { s: 'passed', d: passDetail({ ...r, state: 'passed', approval: 'waiting', sentAt: 'test' }, i).replace('In Kamau’s approvals since test', 'Test: would go to Kamau, nothing sent'), du: DUR[i], t: title };
      if (i === res.prog && !res.end) return { s: 'running', d: i === 2 && sel === 2 ? `Looking for “PO 0412” in the PO register…` : `${DOING[i][0].toUpperCase() + DOING[i].slice(1)}…`, du: null, t: title };
      if (i === res.prog && res.end === 'pause') return { s: 'paused', d: 'Unit price 2.4% over the PO · would ask Kamau', du: 0.5, t: title };
      if (i === res.prog && res.end === 'fail') return { s: 'failed', d: 'No PO called “0412” in the register', du: 0.4, t: title };
      return { s: 'waiting', d: i === 4 ? 'Test: shows the recipient, sends nothing' : `Waits for step ${res.prog + 1}`, du: null, t: title };
    });
    const card = (id, i) => {
      const x = run(id), rs = t.results[i];
      const st = !rs ? ['waiting', 'Waiting'] : !rs.end ? ['running'] : rs.end === 'pass' ? ['passed'] : rs.end === 'pause' ? ['paused'] : ['failed'];
      const n = !rs ? 'Not started' : !rs.end ? `Step ${rs.prog + 1} of 5 · ${DOING[rs.prog]}` : rs.end === 'pass' ? `Would go to Kamau · matches ${x.po}` : rs.end === 'pause' ? 'Would pause · 2.4% over the PO price' : 'Would fail at step 3 · no PO called “0412”';
      const nc = rs && rs.end === 'pause' ? 't-pause' : rs && rs.end === 'fail' ? 't-fail' : '';
      return `<button type="button" class="sample" data-act="test-sel" data-i="${i}" aria-pressed="${i === sel}"><span class="sample__top"><span class="t-code-strong">${x.inv}</span><span class="fill"></span>${pill(st[0], st[1])}</span><span>${esc(sup(x))} · ${ksh(total(x))}</span><span class="t-cap ${nc}">${n}</span></button>`;
    };
    let tail = '';
    if (res && !res.end) tail = callout('agent', `Watching step ${res.prog + 1}`, sel === 2 && res.prog === 2 ? 'The invoice’s PO field doesn’t look like Mawe’s PO numbers. If nothing matches, the test stops here and shows you why.' : 'Each step shows what it read and what it decided as it goes.');
    else if (res && res.end === 'pass') tail = callout('pass', 'This one would go through', `It matches ${r.po}. In a live run, step 5 puts the draft in Kamau’s approvals.`);
    else if (res && res.end === 'pause') tail = callout('pause', 'This one would pause, not fail', 'The price is 2.4% over the PO, above Mawe’s KSh 1,000 limit. In a live run Kamau gets one question with the numbers.');
    else if (res && res.end === 'fail') tail = callout('fail', 'Step 3 would fail', 'The invoice says “PO 0412”. Mawe writes its POs as PO-2026-0412, so the exact match finds nothing.') + `<div class="row">${btn('primary', 'Fix step 3', 'open-fix', '', 'edit')}<span class="t-cap">Opens the same fix screen as a live run.</span></div>`;
    const canOn = t.status === 'done' && !S.agent.live;
    return top([['Agents', 'nav-agents'], ['Invoice approvals', 'nav-agents'], ['Test run']],
      `<span class="t-cap">${done} of 3 done</span>` + (t.status === 'running' ? btn('ghost', 'Stop test', 'stop-test') : btn('ghost', 'Run the test again', 'start-test')) +
      (S.agent.live ? btn('secondary', 'Back to runs', 'nav-runs') : `<button type="button" class="btn btn--primary" data-act="turn-on" ${canOn ? '' : 'disabled aria-disabled="true"'}>Turn it on</button>`)) +
      `<div class="content"><div class="head__l"><div class="head__row"><h2 class="t-title" tabindex="-1" data-focus>Test run</h2>${t.status === 'running' ? pill('running') : t.status === 'done' ? pill('passed', 'Done') : pill('waiting', 'Not started')}</div>
        <span class="t-muted">Three demo invoices from the sample set. Nothing leaves Mawe during a test: step 5 shows who it would go to and sends nothing.</span></div>
      <div class="test"><div style="display:grid;gap:8px"><p class="lbl">Sample invoices</p>${SAMPLES.map(card).join('')}<p class="foot" style="padding:8px 4px 0">${icon('file', 'ico--xs')}Add your own: drop up to 10 past invoices</p></div>
        <div style="display:grid;gap:8px"><div class="steps__label"><span class="lbl">${r.inv} · ${esc(sup(r)).toUpperCase()}</span></div>
          <div class="steps" aria-live="polite">${sts.map((s, i) => stepCard(s, i, { static: true })).join('')}</div>${tail}</div></div></div>`;
  }
  const soft = () => { if (S.view === 'test') refresh(); else side.innerHTML = renderSide(); };
  async function startTest() {
    const t = S.test; if (t.status === 'running') return;
    t.status = 'running'; t.results = []; const token = (t.token = {}); track('run_started', { test: true });
    for (let i = 0; i < 3; i++) {
      t.sel = i; t.results[i] = { prog: 0 }; soft();
      const out = sampleOutcome(i);
      for (let k = 0; k < 5; k++) {
        if (t.token !== token) return;
        t.results[i].prog = k; soft(); await wait(k === 1 ? 700 : 480);
        if (t.token !== token) return;
        if (k === 2 && out === 'pause') { t.results[i].end = 'pause'; break; }
        if (k === 2 && out === 'fail') { t.results[i].end = 'fail'; break; }
        if (k === 4) t.results[i].end = 'pass';
      }
      soft(); await wait(500);
    }
    if (t.token !== token) return;
    t.status = 'done'; S.tested = true; t.sel = 2; soft();
    toast(S.fix.saved ? 'Test done: two would go to Kamau, one would pause for him.' : 'Test done: one passed, one would pause, one failed at step 3.');
  }

  /* ---------- H5 Runs (and the first-run empty state) ---------- */
  function vRuns() {
    const rs = visibleRuns();
    const right = `<label class="search">${icon('search', 'ico--s')}<span class="sr-only">Search runs</span><input type="search" id="q" placeholder="Search invoice or supplier" value="${esc(S.q)}"></label>` + btn('secondary', 'Filter', 'soon', '', 'filter') + btn('primary', 'Test run', 'nav-test', '', 'play');
    if (!rs.length) {
      return top([['Invoice approvals', 'nav-agents'], ['Runs']], btn('primary', 'Test run', 'nav-test', '', 'play')) + `<div class="content"><div class="head__l"><h2 class="t-title" tabindex="-1" data-focus>Runs</h2><span class="t-muted">Every invoice the agent handles will show up here, with each step it took.</span></div>
        <div class="card empty"><span class="empty__tile">${icon('list')}</span><h3 class="t-title">No runs yet</h3>
          <p class="home__sub">Invoices that reach invoices@mawe.example will show up here. Start with a test run on the sample invoices: all five steps run, and nothing leaves Mawe.</p>
          <div class="card samples"><div class="samples__head"><span class="lbl">Sample invoices (demo)</span></div>
            ${SAMPLES.map((id, i) => { const r = run(id); return `<div class="samples__row"><span class="t-code-strong">${r.inv}</span><span>${sup(r)}</span><span class="t-cap">${['A clean match', 'A price over the PO', 'A short PO number'][i]}</span><span class="t-code" style="text-align:right">${ksh(total(r))}</span></div>`; }).join('')}</div>
          <div class="row">${btn('primary', 'Run the test', 'nav-test', '', 'play')}${btn('ghost', 'How runs work', 'how')}</div>
          <p class="foot">${icon('shield', 'ico--xs')}In a test, step 5 shows who it would go to and sends nothing.</p></div></div>`;
    }
    const c = { all: rs.length, needs: rs.filter(r => r.state === 'paused').length, failed: rs.filter(r => r.state === 'failed').length, sent: rs.filter(r => r.state === 'passed').length };
    const running = rs.filter(r => r.state === 'running').length;
    const mt = (l, v, n, cls = '') => `<div class="card metric"><span class="t-cap">${l}</span><span class="t-metric ${cls}">${v}</span><span class="t-cap">${n}</span></div>`;
    return top([['Invoice approvals', 'nav-agents'], ['Runs']], right) + `<div class="content">
      <div class="head__l"><h2 class="t-title" tabindex="-1" data-focus>Runs</h2><span class="t-muted">Every invoice the agent has handled today. Click a row to see each step, what went in and what came out.</span></div>
      <div class="metrics">${mt('Runs today', c.all, running ? `${running} still running` : 'None running')}${mt('Sent to Kamau', c.sent, 'Matched a PO within tolerance')}${mt('Needs a person', c.needs, c.needs ? 'Price over the PO, or a repeat' : 'Nothing waiting', c.needs ? 't-pause' : '')}${mt('Failed', c.failed, c.failed ? 'Fix it, then rerun' : 'Nothing failed', c.failed ? 't-fail' : '')}</div>
      <div class="card table" style="overflow:hidden">
        ${tabs([['all', `All · ${c.all}`], ['needs', `Needs a person · ${c.needs}`], ['failed', `Failed · ${c.failed}`], ['sent', `Sent to Kamau · ${c.sent}`]], S.filter, 'filter', 'Filter runs')}
        <div class="table__head" aria-hidden="true">${['Status', 'Invoice', 'Supplier', 'Amount', 'Started', 'Time', ''].map((h, i) => `<span class="lbl${i === 3 || i === 5 ? ' r' : ''}" style="${i === 3 || i === 5 ? 'text-align:right' : ''}">${h}</span>`).join('')}</div>
        <div id="rows">${rowsHtml()}</div>
      </div>
      <p class="foot">${icon('shield', 'ico--xs')}All suppliers, invoices and amounts are demo data. Hatua drafts approvals; it never pays anyone.</p></div>`;
  }
  function rowsHtml() {
    const q = S.q.trim().toLowerCase();
    const list = visibleRuns().filter(r => (S.filter === 'all' || (S.filter === 'needs' && r.state === 'paused') || (S.filter === 'failed' && r.state === 'failed') || (S.filter === 'sent' && r.state === 'passed')) && (!q || (r.inv + ' ' + sup(r)).toLowerCase().includes(q)));
    if (!list.length) return `<p class="t-muted" style="padding:24px 16px;margin:0">No runs match.</p>`;
    return list.map(r => {
      const [n, nc] = note(r);
      return `<button type="button" class="table__row" data-act="open-run" data-id="${r.id}">
        <span>${pill(r.state)}</span><span class="t-code">${r.inv}</span>
        <span class="table__sup"><span class="t-strong">${esc(sup(r))}</span><span class="t-cap ${nc}">${esc(n)}</span></span>
        <span class="t-code r">${ksh(total(r))}</span><span class="t-cap">Today ${r.time}</span><span class="t-code r t-muted">${dur(r)}</span>${icon('chevR', 'ico--s t-muted')}</button>`;
    }).join('');
  }

  /* ---------- H6 / H8 Run view ---------- */
  function defaultSel(r) {
    if (r.state === 'failed' || r.state === 'paused' || r.state === 'running' || r.state === 'closed') return r.at;
    return 3;
  }
  function tabsFor(r, st) {
    if (st.s === 'waiting') return [];
    if (st.s === 'running') return [['input', 'Input']];
    const t = [];
    if (st.s === 'failed') t.push(['why', 'Why it failed']);
    if (st.s === 'paused') t.push(['why', 'Why it paused']);
    t.push(['output', 'Output'], ['input', 'Input']);
    if (st.s === 'failed' || st.s === 'paused') t.splice(1, 2, ['input', 'Input'], ['output', 'Output']);
    if (r.kept && r.state === 'passed') t.push(['changed', 'What changed']);
    return t;
  }
  function vRun() {
    const r = run(S.runId); const sts = steps(r); const st = sts[S.sel];
    const passedN = sts.filter(s => s.s === 'passed' || s.s === 'kept').length;
    const sumTail = r.state === 'failed' ? `stopped at step ${r.at + 1}` : r.state === 'paused' ? `paused at step ${r.at + 1}` : r.state === 'running' ? `step ${r.at + 1} running` : r.state === 'closed' ? 'closed as a duplicate' : r.kept ? `${r.kept} kept from ${r.time}` : 'all passed';
    const cap = `Received today ${r.time} from ${SUP[r.sup].mail} · ${r.qty} × ${r.item.split(',')[0]} · ${r.state === 'failed' ? `stopped at step ${r.at + 1} of 5` : r.state === 'paused' ? `paused at step ${r.at + 1} of 5` : r.state === 'running' ? 'running now' : r.state === 'closed' ? 'closed' : r.kept ? `rerun from step ${r.kept + 1}` : 'all five steps passed'} (demo)`;
    const tlist = tabsFor(r, st); if (tlist.length && !tlist.find(x => x[0] === S.tab)) S.tab = tlist[0][0];
    let banner = '';
    if (r.state === 'passed' && r.kept && r.kind === 'prefix') banner = callout('pass', `Rerun passed from step ${r.kept + 1}`, `Steps 1–${r.kept} were kept from the first run.${S.fix.apply ? ' Your fix to step 3 also applies to new invoices from now on.' : ' The fix applies to this run only.'}`);
    if (r.state === 'passed' && r.kept && r.kind === 'permission') banner = callout('pass', 'Rerun passed from step 3', 'Steps 1–2 were kept. It was allowed once: the PO register is still set to Never for other runs.');
    if (r.state === 'passed' && r.kept && r.kind === 'unreadable') banner = callout('pass', 'Rerun passed from step 2', 'Step 1 was kept. The PO number and total you typed are marked as typed by a person.');
    if (r.approval === 'rejected') banner = callout('pause', 'Kamau sent this back', `“${esc(r.rejectReason)}”`);
    if (r.state === 'closed') banner = callout('pass', 'Closed as a duplicate', 'Both emails stay in the run history. Nothing reached Kamau twice.');
    const totalDur = r.kept ? `Rerun ${dur(r)}` : r.state === 'running' ? 'Running' : `Total ${dur(r)}`;
    return top([['Invoice approvals', 'nav-agents'], ['Runs', 'nav-runs'], [r.inv, null, true]], btn('secondary', 'Open invoice', 'soon', '', 'file') + `<button type="button" class="icon-btn" data-act="soon" aria-label="More actions">${icon('dots', 'ico--s')}</button>`) + `<div class="content">
      <div class="head"><div class="head__l"><div class="head__row"><h2 class="t-title" tabindex="-1" data-focus>${esc(sup(r))} · ${ksh(total(r))}</h2>${pill(r.state)}</div><span class="t-muted">${esc(cap)}</span></div>
        <div class="head__sum"><span class="t-metric">${passedN} of 5</span><span class="t-cap">steps passed · ${sumTail}</span></div></div>
      ${banner}
      <div class="run"><div style="display:grid;gap:8px"><div class="steps__label"><span class="lbl">Steps</span><span class="fill"></span><span class="t-code t-muted">${totalDur}</span></div>
        <div class="steps" aria-live="polite">${sts.map((s, i) => stepCard(s, i, { current: i === S.sel })).join('')}</div></div>
        <section class="panel" aria-labelledby="ph">
          <div class="panel__head"><h3 class="t-heading" id="ph">Step ${S.sel + 1} · ${esc(st.t)}</h3>${pill(st.s)}<span class="fill"></span><span class="t-code t-muted">${st.du == null ? '—' : st.du.toFixed(1) + ' s'}</span></div>
          ${tlist.length ? tabs(tlist, S.tab, 'tab', 'Step detail') : ''}
          <div class="panel__body" role="${tlist.length ? 'tabpanel' : 'region'}">${panelBody(r, S.sel, st)}</div>
        </section></div></div>`;
  }
  function panelBody(r, i, st) {
    if (st.s === 'waiting') return `<p class="t-muted" style="margin:0">${esc(st.d)}. It runs once the step before it has passed.</p>`;
    if (st.s === 'running' && S.tab !== 'input') S.tab = 'input';
    if (S.tab === 'why') return whyBody(r);
    if (S.tab === 'changed') return changedBody(r);
    const io = stepIO(r, i);
    if (S.tab === 'input') return `${st.s === 'running' ? `<p class="row t-agent" style="margin:0">${icon('sparkle', 'ico--s')}Working on it. The output appears when the step finishes.</p>` : ''}
      <div class="row"><span class="t-muted">What step ${i + 1} got${i ? ` from step ${i}` : ''}</span><span class="fill"></span><span class="t-cap row">${icon('file', 'ico--xs')}${esc(io.inSrc)}</span></div>
      ${dataRows(io.input, 'Input')}${io.rules ? `<p class="lbl">Rules it used</p>${dataRows(io.rules, 'Rules it used')}` : ''}
      ${S.raw ? `<pre class="raw">${esc(JSON.stringify(io.rawIn, null, 2))}</pre>` : ''}<div>${btn('ghost', S.raw ? 'Hide raw input' : 'Show raw input', 'raw', '', 'code')}</div>`;
    // output
    const draft = i === 3 && st.s !== 'failed' && st.s !== 'paused' && (r.state === 'passed' || r.state === 'closed');
    return `${draft ? draftCard(r) : ''}<div class="row"><span class="t-muted">What step ${i + 1} returned</span><span class="fill"></span><span class="t-cap row">${icon('file', 'ico--xs')}${esc(io.outSrc)}</span></div>
      ${dataRows(io.output, 'Output')}
      <div class="row"><span class="lbl">Raw output</span><span class="fill"></span>${btn('ghost', 'Copy', 'copy-raw', '', 'copy')}</div>
      <pre class="raw" id="raw-out">${esc(JSON.stringify(io.rawOut, null, 2))}</pre>
      ${draft && r.kept && r.kind === 'prefix' ? `<div class="row">${btn('primary', 'Back to runs', 'nav-runs', '', 'list')}${btn('secondary', 'See it as Kamau', 'as-kamau', `data-id="${r.id}"`, 'inbox')}</div>` : ''}`;
  }
  function draftCard(r) {
    const atPo = r.kind === 'pause' && r.approval === 'approved-po';
    const unit = atPo ? r.poUnit : r.unit, nt = Math.round(r.qty * unit), vt = Math.round(nt * 0.16), amt = nt + vt;
    return `<div class="card" style="background:var(--agent-soft);border-color:var(--agent-line);padding:16px 18px;display:grid;gap:12px">
      <div class="row"><span class="row t-cap t-agent" style="font-weight:500">${mark(14)}Hatua wrote this draft</span><span class="fill"></span><span class="t-cap">To Kamau · finance manager</span></div>
      <p class="t-title" style="margin:0">Approve ${ksh(amt)} to ${esc(sup(r))}</p>
      ${dataRows([['PO', r.po, ''], ['Items', `${r.qty} × ${r.item} at ${ksh(unit, atPo ? 2 : 0)}`, ''], ['Before VAT', ksh(nt), ''], ['VAT 16%', ksh(vt), ''], ['Total', ksh(amt), '']], 'Draft')}
      <span>${esc(reasonText(r))}</span></div>`;
  }
  const reasonText = r => r.editedNote || (r.kind === 'pause' && r.approval === 'approved-po' ? `Kamau chose the PO price, KSh 2,392.50 a tin. Hatua drafted a request to Rafiki Paints for a KSh 4,002 credit note; Achieng sends it.` : r.pinMissing ? `Matches ${r.po} on supplier, items and total, but Mawe’s buyer PIN isn’t on the invoice. Without it the expense may not be deductible.` : r.kind === 'pause' ? `Unit price KSh 2,450 against KSh 2,392.50 on ${r.po}: KSh 4,002 over, above the KSh 1,000 limit.` : `Matches ${r.po} on supplier, items and total. Price is within 1% or KSh 1,000. Kamau decides; Hatua never pays.`);
  function whyBody(r) {
    if (r.kind === 'prefix') return callout('fail', 'There’s no PO called “0412”', 'The invoice says “PO 0412”. Mawe writes its POs as PO-2026-0412, so the exact match found nothing. Steps 4 and 5 didn’t run, and nothing went to Kamau.')
      + `<p class="lbl">What Hatua compared</p>` + cmp('Closest PO', [['missing', 'PO number', 'PO 0412', 'PO-2026-0412'], ['match', 'Supplier', 'Simba Steel', 'Simba Steel'], ['match', 'Items', '120 × Y12 bar', '120 × Y12 bar'], ['match', 'Total incl. VAT', ksh(total(r)), ksh(total(r))]])
      + callout('agent', 'Hatua’s suggestion', 'When an invoice gives only the last digits, add the PO-2026- prefix before looking. PO-2026-0412 is open for Simba Steel with the same items and total.')
      + `<div class="row">${btn('primary', 'Fix this step', 'open-fix', '', 'edit')}${btn('ghost', 'Hand it to Kamau instead', 'soon')}</div>`;
    if (r.kind === 'permission') {
      const allowed = S.perms.po !== 'never';
      return callout('fail', 'Step 3 needs the PO register', `The agent isn’t allowed to read the PO register, so it couldn’t match ${r.inv} from Jua Hardware. Nothing else was touched.`)
        + `<div class="card" style="overflow:hidden"><div class="perm ${allowed ? '' : 'perm--hl'}"><span class="perm__icon">${icon('file', 'ico--s')}</span><span class="perm__t"><span class="t-strong">Read the PO register</span><span class="t-cap">${allowed ? 'Now set to ' + (S.perms.po === 'ask' ? 'Ask first' : 'Allowed') : 'Set to Never by Kamau · yesterday 18:40'}</span></span><span class="val">${allowed ? (S.perms.po === 'ask' ? 'Ask first' : 'Allowed') : 'Never'}</span></div></div>`
        + (allowed ? `<div class="row">${btn('primary', 'Rerun from step 3', 'perm-rerun', '', 'rerun')}</div>`
          : `<div class="row">${btn('primary', 'Allow once', 'allow-once', '', 'check')}${btn('secondary', 'Change permissions', 'change-perms', '', 'sliders')}</div><p class="t-cap" style="margin:0">Allow once lets this run read the register and reruns it from step 3. Change permissions opens “What it may touch”, where the change is logged.</p>`);
    }
    if (r.kind === 'unreadable') return callout('fail', 'Can’t read the totals', 'The PDF is a phone photo taken at an angle. Hatua found the supplier and invoice number but not the PO number or the totals, so it stopped instead of guessing.')
      + dataRows([['Supplier', 'Tembo Timber', 'Found'], ['Invoice no.', r.inv, 'Found'], ['PO number', '?', 'Unreadable', true], ['Total incl. VAT', '?', 'Unreadable', true]], 'What Hatua could read')
      + (S.typing ? `<div class="card" style="padding:16px;display:grid;gap:12px"><p class="lbl">Type what the photo hides</p>
          <label class="reason"><span class="t-cap">PO number</span><input id="typed-po" class="t-code" style="height:36px;padding:0 10px;border:1px solid var(--line-strong);border-radius:6px" value="${esc(S.typed.po)}" placeholder="PO-2026-0430"></label>
          <label class="reason"><span class="t-cap">Total incl. VAT, KSh</span><input id="typed-total" class="t-code" inputmode="decimal" style="height:36px;padding:0 10px;border:1px solid var(--line-strong);border-radius:6px" value="${esc(S.typed.total)}" placeholder="43,500"></label>
          <div class="row">${btn('primary', 'Rerun from step 2', 'typed-rerun', '', 'rerun')}${btn('ghost', 'Cancel', 'typed-cancel')}</div><span class="t-cap">Typed values are marked as typed by a person.</span></div>`
        : S.replyDraft ? `<div class="card" style="background:var(--agent-soft);border-color:var(--agent-line);padding:16px;display:grid;gap:8px"><span class="row t-cap t-agent" style="font-weight:500">${mark(14)}Hatua wrote this draft · to invoices@tembo-timber.example</span><span>Hello Tembo Timber, we received ${r.inv} as a photo and can’t read the PO number or the totals. Could you send it again as a PDF? Thank you, Achieng, Mawe Supplies.</span><div class="row">${btn('secondary', 'Copy the text', 'copy-reply', '', 'copy')}<span class="t-cap">You send it from your own email. Hatua can’t.</span></div></div>`
          : `<div class="row">${btn('primary', 'Type the missing fields', 'typing', '', 'edit')}${btn('secondary', 'Draft a reply asking for a PDF', 'reply-draft', '', 'message')}</div>`);
    if (r.kind === 'pause') return callout('pause', r.approval === 'returned' ? 'Kamau sent it back to you' : 'Unit price is 2.4% over the PO', r.approval === 'returned' ? 'He wants you to sort out the price with Rafiki Paints before he approves.' : `KSh 2,450 a tin against KSh 2,392.50 on ${r.po}: KSh 4,002 over. Mawe’s limit is the lower of 1% or KSh 1,000, so this one pauses instead of failing.`)
      + cmp(r.po, [['differs', 'Unit price', ksh(r.unit, 2), ksh(r.poUnit, 2), '+2.4%'], ['match', 'Quantity', String(r.qty), String(r.qty)], ['differs', 'Total incl. VAT', ksh(total(r)), ksh(poTotal(r)), '+KSh 4,002']])
      + `<p class="row t-cap" style="margin:0">${mark(14)}Hatua asked Kamau one question. The run carries on when he answers.</p><div class="row">${btn('secondary', 'See it as Kamau', 'as-kamau', `data-id="${r.id}"`, 'inbox')}</div>`;
    if (r.kind === 'duplicate') { const first = run(r.firstId);
      return callout('pause', 'Already approved at 10:05', 'Same invoice number, supplier, amount and PO as the copy Kamau approved. Hatua stopped before drafting, so nothing reached Kamau twice.')
        + `<button type="button" class="linkrow" data-act="open-run" data-id="${first.id}"><span class="t-cap">First copy</span><span class="t-strong" style="text-decoration:underline;text-underline-offset:3px">${first.inv} · run at ${first.time} · approved by Kamau at ${first.approvedAt || '10:05'}</span><span class="fill"></span>${icon('arrow', 'ico--s')}</button>`
        + `<div class="cmp" role="table" aria-label="This copy against the approved copy"><div class="cmp__row cmp__head" role="row">${['Field', 'This copy', 'Approved copy', 'Result'].map(h => `<span class="lbl" role="columnheader">${h}</span>`).join('')}</div>`
        + [['match', 'Invoice no.', r.inv, first.inv, 'Same'], ['match', 'Total incl. VAT', ksh(total(r)), ksh(total(first)), 'Same'], ['match', 'PO', r.po, first.po, 'Same'], ['differs', 'Received', 'Today 11:20', 'Today ' + first.time, 'Later']].map(([k, f, a, b, res]) => `<div class="cmp__row cmp__row--${k}" role="row"><span class="t-cap" role="cell">${f}</span><span class="t-code" role="cell">${a}</span><span class="t-code" role="cell">${b}</span><span class="cmp__res" role="cell">${icon(k === 'match' ? 'check' : 'alert', 'ico--xs')}${res}</span></div>`).join('') + '</div>'
        + (r.state === 'closed' ? callout('pass', 'Closed as a duplicate', 'Both emails stay in the run history.') : `<div class="row">${btn('primary', 'Close as duplicate', 'close-dup', '', 'copy')}${btn('ghost', 'It’s a new invoice', 'not-dup')}</div><p class="t-cap" style="margin:0">Closing keeps both emails in the run history. Nothing reaches Kamau twice.</p>`); }
    return '';
  }
  function changedBody(r) {
    const rows = r.kind === 'prefix' ? [['Step 3', 'No PO found', `Matched ${r.po}`], ['Steps 4–5', 'Didn’t run', 'Ran for the first time']]
      : r.kind === 'permission' ? [['Step 3', 'Not allowed', `Matched ${r.po}`], ['Steps 4–5', 'Didn’t run', 'Ran for the first time']]
        : [['Step 2', 'Totals unreadable', 'Typed in by Achieng'], ['Steps 3–5', 'Didn’t run', 'Ran for the first time']];
    return `<p class="t-muted" style="margin:0">Before and after the rerun. Steps 1${r.kept > 1 ? '–' + r.kept : ''} kept their first answers.</p>
      <div class="cmp cmp--two">${rows.map(([s, a, b]) => `<div class="cmp__row"><span class="t-cap">${s}</span><span><s class="t-muted">${a}</s> ${icon('arrow', 'ico--xs')} <span class="t-strong">${b}</span></span><span></span></div>`).join('')}</div>`;
  }
  function stepIO(r, i) {
    const S2 = SUP[r.sup], file = fileOf(r), fixedPrefix = r.kind === 'prefix' && r.kept;
    const poField = r.poField || r.po;
    if (i === 0) return { inSrc: 'invoices@mawe.example', outSrc: 'Email', input: [['From', S2.mail, 'Email'], ['To', 'invoices@mawe.example', 'Email'], ['Subject', `Invoice ${r.inv}`, 'Email'], ['Attachment', file, 'Email']], output: [['File found', file, 'Attachment'], ['Pages', '1', file]], rawIn: { from: S2.mail, subject: `Invoice ${r.inv}`, attachments: [file] }, rawOut: { step: 1, status: 'passed', file } };
    if (i === 1) {
      const unread = r.kind === 'unreadable' && !r.typedIn;
      const out = [['Supplier', sup(r), 'Invoice · header'], ['PO field', unread ? '?' : r.typedIn ? r.po + ' (typed)' : poField, 'Invoice · header', unread], ['Lines', `${r.qty} × ${r.item} at ${ksh(r.unit)}`, 'Invoice · line 1'], ['Total incl. VAT', unread ? '?' : ksh(total(r)) + (r.typedIn ? ' (typed)' : ''), 'Invoice · totals', unread], ['eTIMS no.', etimsNo(r) + ' (demo)', 'Invoice · footer'], ['Buyer PIN', r.pinMissing ? 'Missing' : 'P05-DEMO-PIN (demo)', 'Invoice · footer', !!r.pinMissing], ['Duplicate check', r.kind === 'duplicate' ? 'Same as the 09:15 copy' : 'No earlier copy', 'Last 90 days', r.kind === 'duplicate']];
      return { inSrc: `From step 1: ${file}`, outSrc: `Read from ${file}`, input: [['File', file, 'Step 1'], ['Pages', '1', 'Step 1']], output: out, rawIn: { file }, rawOut: { step: 2, status: r.at === 1 && ['failed', 'paused', 'closed'].includes(r.state) ? r.state : 'passed', po_field: unread ? null : (r.typedIn ? r.po : poField), total: unread ? null : total(r), etims_no: etimsNo(r), buyer_pin: r.pinMissing ? null : 'P05-DEMO-PIN' } };
    }
    if (i === 2) {
      const flag = r.kind === 'prefix' && !r.kept;
      const input = [['Supplier', sup(r), 'Invoice · header'], ['PO field', poField, 'Invoice · header', flag], ['Lines', `${r.qty} × ${r.item} at ${ksh(r.unit)}`, 'Invoice · line 1'], ['Total incl. VAT', ksh(total(r)), 'Invoice · totals']];
      const rules = [['Find the PO by', fixedPrefix || S.fix.saved && r.kind === 'prefix' ? 'PO number, adding PO-2026- if missing' : 'Exact PO number', 'Step 3 instruction'], ['Tolerance', '1% or KSh 1,000, the lower', 'Agent rules']];
      let output, rawOut;
      if (r.kind === 'prefix' && !r.kept) { output = [['Result', 'No match', 'Step 3', true], ['Looked for', '“PO 0412”, exact', 'PO register'], ['POs searched', '38 open POs (demo)', 'PO register'], ['Closest PO', 'PO-2026-0412 · same supplier and total', 'PO register'], ['Steps 4 and 5', 'Skipped', 'Run']]; rawOut = { step: 3, status: 'failed', query: { po_number: 'PO 0412' }, matches: [], closest: 'PO-2026-0412' }; }
      else if (r.kind === 'permission' && !r.kept) { output = [['Result', 'Not allowed', 'Permissions', true], ['Needed', 'Read the PO register', 'Step 3'], ['Set to', 'Never', 'Permissions'], ['Steps 4 and 5', 'Skipped', 'Run']]; rawOut = { step: 3, status: 'failed', error: 'permission', needs: 'po_register.read' }; }
      else if (r.kind === 'pause' && r.state === 'paused') { output = [['Result', 'Over tolerance', 'Step 3', true], ['Matched PO', r.po, 'PO register'], ['Unit price', `${ksh(r.unit, 2)} vs ${ksh(r.poUnit, 2)}`, 'Invoice · PO'], ['Difference', 'KSh 4,002 (2.4%)', 'Step 3'], ['Limit', 'KSh 1,000', 'Agent rules'], ['Next', 'Ask Kamau', 'Agent rules']]; rawOut = { step: 3, status: 'paused', po: r.po, difference: 4002, limit: 1000 }; }
      else { output = [['Result', `Matched ${r.po}`, 'PO register'], ['Supplier', 'Same', 'PO register'], ['Lines', 'Same', 'PO register'], ['Total', r.kind === 'pause' ? 'KSh 4,002 over, decided by Kamau' : 'Same', 'PO register']]; rawOut = { step: 3, status: 'passed', po: r.po, query: fixedPrefix ? { po_number: 'PO-2026-0412' } : { po_number: r.po } }; }
      return { inSrc: 'From step 2', outSrc: 'PO register, ' + r.time, input, rules, output, rawIn: { supplier: sup(r), po_field: poField, total: total(r) }, rawOut };
    }
    if (i === 3) return { inSrc: 'From step 3', outSrc: 'Approvals', input: [['Matched PO', r.po, 'Step 3'], ['Invoice total', ksh(total(r)), 'Step 2'], ['Tolerance', '1% or KSh 1,000, the lower', 'Agent rules']], output: [['Draft', `Approve ${ksh(r.kind === 'pause' && r.approval === 'approved-po' ? poTotal(r) : total(r))} to ${sup(r)}`, 'Hatua'], ['Reason', reasonText(r), 'Hatua']], rawIn: { po: r.po, total: total(r) }, rawOut: { step: 4, status: 'passed', draft: { amount: total(r), supplier: sup(r), po: r.po } } };
    return { inSrc: 'From step 4', outSrc: 'Kamau’s approvals', input: [['Draft', `Approve ${ksh(total(r))} to ${sup(r)}`, 'Step 4'], ['Approver', 'Kamau · finance manager', 'Agent rules']], output: [['Sent to', 'Kamau’s approvals', 'Approvals'], ['At', r.sentAt || '—', 'Approvals'], ['Status', r.approval && r.approval.startsWith('approved') ? `Approved at ${r.approvedAt}` : r.approval === 'rejected' ? 'Sent back' : 'Waiting for Kamau', 'Approvals']], rawIn: { approver: 'kamau' }, rawOut: { step: 5, status: 'passed', queue: 'approvals', sent_at: r.sentAt } };
  }

  /* ---------- H7 Fix a step ---------- */
  const fixText = () => { const d = document.createElement('div'); d.innerHTML = S.fix.html; return d.textContent; };
  const fixWorks = () => /PO-2026|prefix/i.test(fixText());
  function vFix() {
    const r = run('ss0907');
    if (S.fix.html == null) S.fix.html = esc(FIX_BASE) + `<span class="by-hatua">${esc(FIX_SUGGEST)}</span>`;
    const sts = [{ s: 'kept', d: `Will be kept from ${r.time}`, du: DUR[0], t: STEP[0] }, { s: 'kept', d: `Will be kept from ${r.time}`, du: DUR[1], t: STEP[1] }, { s: 'failed', d: 'Editing · runs again', du: 0.4, t: STEP[2] }, { s: 'waiting', d: 'Runs again after step 3', du: null, t: STEP[3] }, { s: 'waiting', d: 'Runs again · sends to Kamau', du: null, t: STEP[4] }];
    return top([['Invoice approvals', 'nav-agents'], ['Runs', 'nav-runs'], [r.inv, 'back-run', true], ['Fix step 3']], btn('secondary', 'Open invoice', 'soon', '', 'file')) + `<div class="content">
      <div class="head"><div class="head__l"><div class="head__row"><h2 class="t-title" tabindex="-1" data-focus>${esc(sup(r))} · ${ksh(total(r))}</h2>${pill('failed')}</div><span class="t-muted">Editing step 3. Nothing reruns until you say so.</span></div>
        <div class="head__sum"><span class="t-metric">2 of 5</span><span class="t-cap">steps passed · editing step 3</span></div></div>
      <div class="run"><div style="display:grid;gap:8px"><div class="steps__label"><span class="lbl">Steps</span><span class="fill"></span><span class="t-code t-muted">Rerun: steps 3–5</span></div><div class="steps">${sts.map((s, i) => stepCard(s, i, { static: true, current: i === 2 })).join('')}</div></div>
        <section class="panel" aria-labelledby="fh"><div class="panel__head"><h3 class="t-heading" id="fh">Fix step 3 · Match it to a PO</h3>${pill('draft')}<span class="fill"></span><span class="t-code t-muted">Not saved</span></div>
          <div class="panel__body">
            <p class="lbl" id="ins-l">Instruction</p>
            <div class="editor"><div class="editor__text" id="fix-text" contenteditable="true" role="textbox" aria-multiline="true" aria-labelledby="ins-l" spellcheck="true">${S.fix.html}</div>
              <div class="editor__hint">${mark(14)}<span>Violet text was added by Hatua. Edit any of it.</span><span class="fill"></span>${/by-hatua/.test(S.fix.html) ? `<button type="button" class="link t-cap" style="color:var(--muted)" data-act="undo-suggest">Undo suggestion</button>` : `<button type="button" class="link t-cap" style="color:var(--muted)" data-act="redo-suggest">Add the suggestion back</button>`}</div></div>
            <div id="dry">${dryRun()}</div>
            <label class="check"><input type="checkbox" id="apply" ${S.fix.apply ? 'checked' : ''}><span class="check__t"><span class="t-strong">Use this fix for new invoices too</span><span class="t-cap">Applies to every supplier from the next run. You can undo it in the agent’s history.</span></span></label>
            <div class="row">${btn('primary', 'Save and rerun from step 3', 'rerun', '', 'rerun')}${btn('ghost', 'Cancel', 'back-run')}<span class="fill"></span><span class="t-cap">Keeps steps 1–2 from this run</span></div>
          </div></section></div></div>`;
  }
  function dryRun() {
    const ok = fixWorks(), r = run('ss0907');
    return `<div style="display:grid;gap:16px"><div class="row"><span class="lbl">Tried on this invoice</span><span class="fill"></span><span class="t-cap">Dry run · nothing sent</span></div>
      ${cmp(ok ? 'Matched PO' : 'Closest PO', [[ok ? 'match' : 'missing', 'PO number', 'PO 0412', 'PO-2026-0412'], ['match', 'Supplier', 'Simba Steel', 'Simba Steel'], ['match', 'Items', '120 × Y12 bar', '120 × Y12 bar'], ['match', 'Total incl. VAT', ksh(total(r)), ksh(total(r))]])}
      ${ok ? callout('pass', 'Step 3 would pass', 'It matches PO-2026-0412. Steps 4 and 5 would then draft the approval and send it to Kamau.') : callout('fail', 'Step 3 would still fail', 'Nothing in the instruction tells Hatua what to do when the PO number is short. Add it back, or say it in your own words.')}</div>`;
  }
  async function doRerun() {
    const r = run('ss0907'); const ok = fixWorks();
    S.fix.saved = ok; S.fix.fixedAt = clock();
    if (ok) { const st = S.agent.steps[2]; st.ins = fixText(); st.by = 'person'; }
    track('rerun_from_step', { step: 3, invoice: r.inv });
    r.kept = 2; r.state = 'running'; r.at = 2; S.runId = r.id; S.sel = 2; S.tab = 'input'; go('run');
    for (let k = 2; k < 5; k++) {
      r.at = k; S.sel = k; refresh(); await wait(900);
      if (k === 2 && !ok) { r.state = 'failed'; r.at = 2; S.tab = 'why'; refresh(); toast('Step 3 failed again. The instruction still looks for an exact match.'); track('step_failed', { step: 3 }); return; }
    }
    r.state = 'passed'; r.approval = 'waiting'; r.sentAt = clock(); r.kamauNew = true; S.sel = 3; S.tab = 'output';
    r.history = [['09:42', 'Invoice arrived in invoices@', 'muted'], ['09:42', 'Step 3 failed: no PO called “0412”', 'fail'], [S.fix.fixedAt, 'Achieng fixed step 3: add the PO-2026- prefix', 'ink'], [r.sentAt, 'Rerun passed. Draft sent to you', 'pass']];
    track('draft_sent', { invoice: r.inv }); refresh(); toast('Rerun passed. The draft is in Kamau’s approvals.');
  }
  async function rerunFrom(r, from) {
    r.kept = from; r.state = 'running'; r.at = from; S.sel = from; S.tab = 'input'; refresh();
    for (let k = from; k < 5; k++) { r.at = k; S.sel = k; refresh(); await wait(800); }
    r.state = 'passed'; r.approval = 'waiting'; r.sentAt = clock(); r.kamauNew = true; S.sel = 3; S.tab = 'output';
    track('draft_sent', { invoice: r.inv }); refresh(); toast('Rerun passed. The draft is in Kamau’s approvals.');
  }

  /* ---------- Approvals: Achieng's read-only list, Kamau's queue ---------- */
  function aCard(r, readOnly) {
    const paused = r.state === 'paused', flag = r.pinMissing;
    const status = paused ? pill('paused') : flag ? pill('paused', 'Check eTIMS') : pill('passed', 'Matches PO');
    const amt = paused ? ksh(total(r)) : ksh(total(r));
    const noteTxt = paused ? `Paused: unit price KSh 2,450 vs KSh 2,392.50 on the PO. KSh 4,002 over.` : flag ? 'Matches the PO, but Mawe’s buyer PIN isn’t on the invoice.' : r.kept ? 'Matches the PO after Achieng fixed how it reads PO numbers.' : 'Matches the PO on supplier, items and total.';
    const actions = readOnly ? '' : paused ? btn('primary', 'Decide', 'k-open', `data-id="${r.id}"`) : flag ? btn('primary', 'Open', 'k-open', `data-id="${r.id}"`) : btn('secondary', 'Open', 'k-open', `data-id="${r.id}"`) + btn('primary', 'Approve', 'k-approve', `data-id="${r.id}"`);
    return `<div class="acard${paused || flag ? ' acard--paused' : ''}"><span class="acard__status">${status}</span>
      <span class="acard__inv"><span class="t-heading">${esc(sup(r))} · ${amt}${r.kamauNew ? `<span class="pill pill--running acard__new">New</span>` : ''}</span><span class="t-code t-muted">${r.inv} · ${r.po} · ${r.sentAt || r.time}</span></span>
      <span class="acard__note">${mark(14)}<p style="${paused || flag ? 'color:var(--pause)' : ''}">${noteTxt}</p></span><span class="row">${actions}</span></div>`;
  }
  function dCard(r) {
    const out = { approved: `Approved at ${r.approvedAt}`, 'approved-po': `Approved at the PO price · ${r.approvedAt}`, 'approved-invoice': `Approved at the invoice price · ${r.approvedAt}`, rejected: `Sent back: “${r.rejectReason}”`, returned: 'Sent back to Achieng', corrected: 'Asked Tembo for a corrected invoice' }[r.approval] || r.approval;
    return `<div class="acard"><span class="acard__status">${r.approval === 'rejected' || r.approval === 'returned' || r.approval === 'corrected' ? pill('paused', 'Sent back') : pill('passed', 'Approved')}</span>
      <span class="acard__inv"><span class="t-heading">${esc(sup(r))} · ${ksh(r.approval === 'approved-po' ? poTotal(r) : total(r))}</span><span class="t-code t-muted">${r.inv} · ${r.po}</span></span>
      <span class="acard__note"><p style="color:var(--muted)">${esc(out)}</p></span><span class="row">${S.who === 'kamau' ? btn('ghost', 'Open', 'k-open', `data-id="${r.id}"`) : ''}</span></div>`;
  }
  function vApprovalsAchieng() {
    const q = queue();
    return top([['Approvals']], btn('secondary', 'View as Kamau', 'as-kamau', '', 'user')) + `<div class="content"><div class="head__l"><h2 class="t-title" tabindex="-1" data-focus>Waiting for Kamau</h2><span class="t-muted">Kamau decides these. You see what he sees; switch to Kamau in the bar above to try it.</span></div>
      <div class="queue">${q.length ? q.map(r => aCard(r, true)).join('') : '<p class="t-muted">Nothing is waiting.</p>'}</div></div>`;
  }
  function vQueue() {
    const q = queue(), d = decided(); const list = S.kTab === 'waiting' ? q : d;
    const mt = (l, v, n, cls = '') => `<div class="card metric"><span class="t-cap">${l}</span><span class="t-metric ${cls}">${v}</span><span class="t-cap">${n}</span></div>`;
    const sum = q.reduce((a, r) => a + total(r), 0); const paused = q.filter(r => r.state === 'paused').length;
    return top([['Approvals']], `<label class="search">${icon('search', 'ico--s')}<span class="sr-only">Search approvals</span><input type="search" id="kq" placeholder="Search supplier or PO" value="${esc(S.kq)}"></label>`) + `<div class="content">
      <div class="head__l"><h2 class="t-title" tabindex="-1" data-focus>Good morning, Kamau</h2><span class="t-muted">${q.length ? `${q.length === 1 ? 'One supplier invoice needs' : `${['', '', 'Two', 'Three', 'Four', 'Five', 'Six'][q.length] || q.length} supplier invoices need`} your decision.` : 'Nothing needs you right now.'} Hatua drafted each one; nothing is paid from here. Payment happens in your bank as usual.</span></div>
      <div class="metrics">${mt('Waiting for you', q.length, q.length ? `Oldest from ${q.map(r => r.sentAt || r.time).sort()[0]}` : 'All clear')}${mt('Total waiting', ksh(sum), 'Incl. 16% VAT')}${mt('Paused by Hatua', paused, paused ? 'Price over the PO' : 'None', paused ? 't-pause' : '')}${mt('Decided today', d.length, d.slice(0, 2).map(sup).join(', ') || '—')}</div>
      ${tabs([['waiting', `Waiting · ${q.length}`], ['decided', `Decided today · ${d.length}`]], S.kTab, 'k-tab', 'Approvals')}
      <div class="queue" id="kq-list">${queueHtml(list)}</div>
      <p class="foot">${icon('shield', 'ico--xs')}Approving records your decision and tells Achieng. Hatua never pays anyone. All data is demo.</p></div>`;
  }
  function queueHtml(list) {
    const q = S.kq.trim().toLowerCase(); const l = q ? list.filter(r => (r.inv + ' ' + r.po + ' ' + sup(r)).toLowerCase().includes(q)) : list;
    return l.length ? l.map(r => (S.kTab === 'waiting' ? aCard(r) : dCard(r))).join('') : `<p class="t-muted">${q ? 'Nothing matches.' : S.kTab === 'waiting' ? 'Nothing is waiting for you.' : 'Nothing decided yet today.'}</p>`;
  }
  function paper(r) {
    const pause = r.kind === 'pause';
    return `<div class="row t-cap" style="color:var(--muted)">${icon('file', 'ico--xs')}<span class="t-code">${fileOf(r)}</span><span class="fill"></span>Page 1 of 1</div>
      <article class="paper" aria-label="Invoice ${r.inv}"><div class="row" style="align-items:flex-start"><span style="display:grid;gap:2px"><span class="t-heading">${esc(sup(r)).toUpperCase()} LTD</span><span class="t-cap">Industrial Area, Nairobi (demo)</span></span><span class="fill"></span><span class="lbl">Tax invoice</span></div>
        <div class="paper__meta">${[['Invoice no.', r.inv], ['Date', '19 Nov 2026'], ['Your PO', r.poField || r.po, r.kind === 'prefix' && r.kept ? `Read as ${r.po}` : ''], ['Bill to', 'Mawe Supplies (demo)'], ['eTIMS no.', etimsNo(r) + ' (demo)'], ['Buyer PIN', r.pinMissing ? '—' : 'P05-DEMO-PIN (demo)']].map(([k, v, ra]) => `<div><span class="t-cap">${k}</span><span class="row" style="gap:8px"><span class="t-code">${esc(v)}</span>${ra ? `<span class="readas">${mark(12)}${esc(ra)}</span>` : ''}</span></div>`).join('')}</div>
        <div><div class="paper__line"><span class="lbl">Item</span><span class="lbl">Qty</span><span class="lbl">Unit KSh</span><span class="lbl">Amount KSh</span></div>
          <div class="paper__line${pause ? ' paper__line--pause' : ''}"><span class="t-cap" style="color:var(--ink)">${esc(r.item)}</span><span class="t-code">${r.qty}</span><span class="t-code">${num(r.unit, 2)}</span><span class="t-code">${num(net(r), 2)}</span></div></div>
        <div class="paper__tot"><div><span class="t-cap">Subtotal</span><span class="t-code">${num(net(r), 2)}</span></div><div><span class="t-cap">VAT 16%</span><span class="t-code">${num(vat(r), 2)}</span></div><div><span class="t-strong">Total KSh</span><span class="t-code-strong">${num(total(r), 2)}</span></div></div>
        <p class="t-cap" style="margin:0">eTIMS number and PIN are demo values. Hatua checks they’re on the invoice; it doesn’t give tax advice.</p></article>
      <div class="card" style="padding:16px;display:grid;gap:10px"><p class="lbl" style="text-transform:none">eTIMS CHECK</p>
        <div class="row">${icon('check', 'ico--s t-pass')}<span>eTIMS invoice number is on the invoice</span><span class="fill"></span><span class="t-cap t-pass" style="font-weight:500">Present</span></div>
        <div class="row">${r.pinMissing ? icon('x', 'ico--s t-fail') : icon('check', 'ico--s t-pass')}<span>Mawe’s buyer PIN is on the invoice</span><span class="fill"></span><span class="t-cap ${r.pinMissing ? 't-fail' : 't-pass'}" style="font-weight:500">${r.pinMissing ? 'Missing' : 'Matches'}</span></div>
        <span class="t-cap">If either is missing, the expense may not be deductible. KRA’s guidance has the detail.</span></div>`;
  }
  function vApproval() {
    const r = run(S.runId); const decidedNow = r.approval && r.approval !== 'waiting';
    const hist = r.history || [[r.time, 'Invoice arrived in invoices@', 'muted'], [r.sentAt || r.time, r.pinMissing ? 'All five steps passed · buyer PIN missing, flagged' : 'All five steps passed', r.pinMissing ? 'pause' : 'pass'], [r.sentAt || r.time, 'Draft sent to you', 'pass']];
    const dotc = { muted: 'var(--muted)', fail: 'var(--fail)', ink: 'var(--ink)', pass: 'var(--pass)', pause: 'var(--pause)' };
    const cmpRows = [['match', 'PO number', r.poField || r.po, r.po, r.kind === 'prefix' && r.kept ? 'After fix' : 'Same'], ['match', 'Supplier', sup(r), sup(r)], ['match', 'Quantity', String(r.qty), String(r.qty)], ['match', 'Unit price', ksh(r.unit, 2), ksh(r.unit, 2)], ['match', 'Total incl. VAT', ksh(total(r)), ksh(total(r))]];
    const pos = queue().findIndex(x => x.id === r.id);
    let actions;
    if (decidedNow) actions = callout(r.approval === 'rejected' || r.approval === 'corrected' ? 'pause' : 'pass', r.approval === 'rejected' ? 'You sent it back' : r.approval === 'corrected' ? 'You asked for a corrected invoice' : 'You approved it', r.approval === 'rejected' ? `Your reason went to Achieng’s run view: “${esc(r.rejectReason)}”` : r.approval === 'corrected' ? 'Hatua drafted the request. Achieng reads it and presses send.' : `At ${r.approvedAt}. Pay it from the bank as usual.`);
    else if (S.rejecting === r.id) actions = `<div class="reason"><label class="t-strong" for="reject-reason">Why are you sending it back?</label><textarea id="reject-reason" placeholder="For example: wrong PO, or the price needs a credit note">${esc(S.rejectText || '')}</textarea><span class="t-cap">Achieng sees this in the run view.</span></div><div class="row">${btn('primary', 'Send it back', 'k-reject-send')}${btn('ghost', 'Cancel', 'k-reject-cancel')}</div>`;
    else if (r.pinMissing) actions = `<div class="row">${btn('primary', 'Ask Tembo for a corrected invoice', 'k-correct', '', 'message')}${btn('secondary', 'Approve anyway', 'k-approve', `data-id="${r.id}"`)}${btn('ghost', 'Reject with a reason', 'k-reject')}</div><p class="foot">${icon('shield', 'ico--xs')}The request is a draft: Achieng reads it and presses send. Approving anyway records that the PIN was missing.</p>`;
    else actions = `<div class="row">${btn('primary', 'Approve', 'k-approve', `data-id="${r.id}"`, 'check')}${btn('secondary', S.editingNote === r.id ? 'Save draft' : 'Edit draft', S.editingNote === r.id ? 'k-edit-save' : 'k-edit', '', 'edit')}${btn('ghost', 'Reject with a reason', 'k-reject')}</div><p class="foot">${icon('shield', 'ico--xs')}Approving records your decision; you still pay in your bank. A rejection reason goes back to Achieng’s run view.</p>`;
    const draftNote = S.editingNote === r.id ? `<label class="sr-only" for="note-edit">Hatua’s reason</label><textarea class="note-edit" id="note-edit">${esc(reasonText(r))}</textarea>` : (r.editedNote ? `<div class="callout" style="background:var(--subtle)">${icon('edit')}<div class="callout__t"><span class="callout__title">Draft, edited by Kamau</span><span>${esc(r.editedNote)}</span></div></div>` : callout('agent', 'Hatua’s draft', esc(reasonText(r))));
    return top([['Approvals', 'nav-approvals'], [r.inv, null, true]], (pos >= 0 ? `<span class="t-cap">${pos + 1} of ${queue().length}</span>` : '') + btn('ghost', 'Next', 'k-next', '', 'chevR')) + `<div class="appr">
      <div class="appr__doc">${paper(r)}</div>
      <div class="appr__side">
        <div class="head__l"><div class="head__row"><h2 class="t-title" tabindex="-1" data-focus>Approve ${ksh(total(r))} to ${esc(sup(r))}?</h2>${r.pinMissing ? pill('paused', 'Check eTIMS') : pill('passed', 'Matches PO')}</div>
          <span class="t-muted">Drafted by Hatua at ${r.sentAt}${r.kind === 'prefix' && r.kept ? ', after Achieng fixed how it reads PO numbers' : ''}.</span></div>
        ${r.pinMissing ? callout('pause', 'Mawe’s buyer PIN isn’t on this invoice', 'Without it, this expense may not be deductible. Hatua can’t say what Mawe owes; KRA’s guidance has the detail.') : ''}
        ${draftNote}
        <p class="lbl">Invoice against the PO</p>${cmp(r.po, cmpRows)}
        <p class="lbl">What happened</p><ul class="hist">${hist.map(([t, s, c]) => `<li><span class="dot" style="background:${dotc[c]}" aria-hidden="true"></span><span class="t-code t-muted">${t}</span><span>${esc(s)}</span></li>`).join('')}</ul>
        <span class="fill"></span>${actions}</div></div>`;
  }
  function vDecide() {
    const r = run(S.runId);
    const decidedNow = r.approval === 'approved-po' || r.approval === 'approved-invoice' || r.approval === 'returned';
    const opts = [['po', 'Approve at the PO price and ask for a credit note', `Approves ${ksh(poTotal(r))}. Hatua drafts an email to Rafiki for a KSh 4,002 credit note; Achieng reads it and presses send.`], ['invoice', 'Approve the invoice price', `Approves ${ksh(total(r))} as invoiced. Hatua notes the new price for next time.`], ['back', 'Send it back to Achieng', 'Nothing is approved. Achieng sorts it out with Rafiki.']];
    return top([['Approvals', 'nav-approvals'], [r.inv, null, true]], btn('ghost', 'Next', 'k-next', '', 'chevR')) + `<div class="appr">
      <div class="appr__doc">${paper(r)}</div>
      <div class="appr__side">
        <div class="head__l"><div class="head__row"><h2 class="t-title" tabindex="-1" data-focus>Rafiki Paints charged more than the PO</h2>${decidedNow ? pill('passed', 'Decided') : pill('paused')}</div><span class="t-muted">${decidedNow ? `Hatua paused this at ${r.time}. You decided${r.approvedAt ? ' at ' + r.approvedAt : ''}.` : `Hatua paused this at ${r.time} and didn’t draft an approval. It needs your decision.`}</span></div>
        ${callout('pause', 'KSh 4,002 over the PO (2.4%)', `KSh 2,450 a tin against KSh 2,392.50 on ${r.po}. Mawe’s limit is the lower of 1% or KSh 1,000, so KSh 1,000 here.`)}
        ${cmp(r.po, [['differs', 'Unit price', ksh(r.unit, 2), ksh(r.poUnit, 2), '+2.4%'], ['match', 'Quantity', String(r.qty), String(r.qty)], ['differs', 'Total incl. VAT', ksh(total(r)), ksh(poTotal(r)), '+KSh 4,002']])}
        ${decidedNow ? callout('pass', { 'approved-po': 'Approved at the PO price', 'approved-invoice': 'Approved at the invoice price', returned: 'Sent back to Achieng' }[r.approval], { 'approved-po': `${ksh(poTotal(r))} at ${r.approvedAt}. Hatua drafted the credit-note email; Achieng reads it and presses send.`, 'approved-invoice': `${ksh(total(r))} at ${r.approvedAt}. Pay it from the bank as usual.`, returned: 'Achieng sees it in Runs with your note.' }[r.approval])
          : `<fieldset style="border:0;padding:0;margin:0;display:grid;gap:8px"><legend class="lbl" style="margin-bottom:8px">What do you want to do?</legend>${opts.map(([v, t, d]) => `<label class="opt"><input type="radio" name="decide" value="${v}" ${S.decide === v ? 'checked' : ''} data-decide><span class="opt__t"><span class="t-strong">${t}</span><span class="t-cap">${d}</span></span></label>`).join('')}</fieldset>
          <span class="fill"></span><div class="row">${btn('primary', 'Confirm', 'k-decide')}${btn('ghost', 'Cancel', 'nav-approvals')}</div><p class="foot">${icon('shield', 'ico--xs')}The credit-note email is a draft. Nothing goes to Rafiki until Achieng sends it.</p>`}
      </div></div>`;
  }

  /* ---------- Render ---------- */
  const app = document.getElementById('app'), side = document.getElementById('side'), main = document.getElementById('main'), toastEl = document.getElementById('toast');
  const VIEWS = { home: vHome, agent: vAgent, perms: vPerms, test: vTest, runs: vRuns, run: vRun, fix: vFix, approvals: vApprovalsAchieng, queue: vQueue, approval: vApproval, decide: vDecide };
  function refresh() {
    const keepScroll = main.scrollTop; const a = document.activeElement;
    const key = a && a.dataset ? [a.dataset.act, a.dataset.k, a.dataset.i, a.dataset.id, a.id].join('|') : null;
    app.dataset.who = S.who; side.innerHTML = renderSide(); main.innerHTML = VIEWS[S.view]();
    main.scrollTop = keepScroll;
    if (key && a !== document.body) {
      const [act, k, i, id, elId] = key.split('|');
      const sel = elId ? `#${CSS.escape(elId)}` : act ? `[data-act="${act}"]${k ? `[data-k="${k}"]` : ''}${i ? `[data-i="${i}"]` : ''}${id ? `[data-id="${id}"]` : ''}` : null;
      const el = sel && document.querySelector(sel); if (el) el.focus({ preventScroll: true });
    }
    syncBar();
  }
  function go(view, opts = {}) {
    S.view = view; S.last[S.who] = view; S.raw = false;
    if (view !== 'approval') { S.rejecting = null; S.editingNote = null; }
    refresh(); main.scrollTop = 0;
    if (!opts.noFocus) { const h = main.querySelector('[data-focus]'); if (h) h.focus({ preventScroll: true }); }
  }
  function syncBar() { document.querySelectorAll('.concept__view [data-who]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.who === S.who))); }
  let toastT;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 4200); }
  function openRun(id) { const r = run(id); S.runId = id; S.sel = defaultSel(r); const st = steps(r)[S.sel]; S.tab = st.s === 'failed' || st.s === 'paused' ? 'why' : st.s === 'running' ? 'input' : 'output'; S.typing = false; S.replyDraft = false; go('run'); if (r.state === 'failed') track('step_failed', { step: r.at + 1, invoice: r.inv }); if (r.state === 'paused') track('step_paused', { step: r.at + 1, invoice: r.inv }); }
  function setWho(who, view) { S.who = who; app.dataset.who = who; go(view || S.last[who] || (who === 'kamau' ? 'queue' : 'runs')); }

  /* ---------- Live run: INV-KC-1190 finishes while you look around ---------- */
  function tickLive() {
    const r = run('kc1190'); if (!r || r.state !== 'running' || r.kept) return;
    if (r.at < 4) { r.at++; later(tickLive, 3200); } else { r.state = 'passed'; r.approval = 'waiting'; r.sentAt = clock(); r.kamauNew = true; track('draft_sent', { invoice: r.inv }); }
    if (['runs', 'run', 'queue', 'approvals'].includes(S.view) && !document.querySelector('.ha-main input:focus, .ha-main textarea:focus, #fix-text:focus')) refresh();
  }

  /* ---------- States you can add from the bar ---------- */
  function addState(k) {
    if (k === 'first') { fresh(); S.firstRun = true; S.agent.live = false; S.tested = false; S.perms.emailConfirmed = false; S.test = { status: 'idle', results: [], sel: 0 }; timers.forEach(clearTimeout); timers.clear(); setWho('achieng', 'runs'); toast('First run: a new agent with no runs yet.'); return; }
    const tpl = STATE_RUNS[k]; let r = run(tpl.id);
    if (!r) { r = JSON.parse(JSON.stringify(tpl)); S.runs.unshift(r); }
    if (k === 'permission') { S.perms.po = 'never'; S.perms.hl = 'po'; track('permission_requested', { permission: 'po_register.read' }); }
    if (k === 'duplicate') { const first = run('kc1182'); if (first.approval === 'waiting') { first.approval = 'approved'; first.approvedAt = '10:05'; } }
    if (k === 'etims') { S.kTab = 'waiting'; S.runId = r.id; setWho('kamau', 'approval'); toast('eTIMS details missing: Tembo Timber’s invoice has no buyer PIN.'); return; }
    S.who = 'achieng'; openRun(r.id);
    toast({ permission: 'Permission missing: a run stopped at step 3.', unreadable: 'Can’t read the invoice: a phone photo arrived.', duplicate: 'Duplicate: Kiboko Cement sent INV-KC-1182 again.' }[k]);
  }

  /* ---------- Events ---------- */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act], [data-who], [data-reset]');
    if (!b) return;
    if (b.matches('.concept__view [data-who]')) { setWho(b.dataset.who); return; }
    if (b.matches('[data-reset]')) { fresh(); setWho('achieng', 'runs'); toast('Demo reset.'); return; }
    const act = b.dataset.act, id = b.dataset.id, i = b.dataset.i !== undefined ? +b.dataset.i : null;
    switch (act) {
      case 'nav': {
        const k = b.dataset.k;
        if (S.who === 'kamau' && k !== 'approvals') { toast('Kamau only sees what Hatua hands him. Switch to Achieng in the bar to build or fix the agent.'); return; }
        go({ home: 'home', agents: 'agent', runs: 'runs', approvals: S.who === 'kamau' ? 'queue' : 'approvals', perms: 'perms' }[k]); return;
      }
      case 'nav-home': go('home'); return;
      case 'nav-agents': go('agent'); return;
      case 'nav-runs': go('runs'); return;
      case 'nav-perms': go('perms'); return;
      case 'nav-approvals': go(S.who === 'kamau' ? 'queue' : 'approvals'); return;
      case 'nav-test': go('test'); if (S.test.status === 'idle') startTest(); return;
      case 'start-test': S.test.status = 'idle'; startTest(); return;
      case 'stop-test': S.test.token = null; S.test.status = 'idle'; S.test.results = []; refresh(); toast('Test stopped. Nothing was sent.'); return;
      case 'test-sel': S.test.sel = i; refresh(); return;
      case 'turn-on': S.agent.live = true; S.firstRun = false; S.perms.emailConfirmed = true; track('agent_turned_on'); fresh2(); go('runs'); toast('Invoice approvals is on. New invoices in invoices@ will run through it.'); return;
      case 'how': toast('Describe it, Hatua drafts the steps, you choose what it may touch, test it on samples, then turn it on. When a run fails, fix the step and rerun from it.'); return;
      case 'soon': toast('Not part of this demo.'); return;
      case 'saved': toast('Draft saved.'); return;
      case 'example': S.prompt = PROMPT; refresh(); document.getElementById('prompt').focus(); return;
      case 'draft': {
        S.prompt = document.getElementById('prompt').value || PROMPT; S.drafting = true; refresh();
        later(() => { if (!S.drafting) return; S.drafting = false; S.reveal = 0; go('agent'); const step = () => { if (S.view !== 'agent' || S.reveal >= 5) { S.revealAnim = null; return; } S.reveal++; S.revealAnim = S.reveal - 1; refresh(); if (S.reveal < 5) later(step, 220); else later(() => { S.revealAnim = null; }, 400); }; later(step, 120); }, 1800);
        return;
      }
      case 'stop-draft': S.drafting = false; refresh(); return;
      case 'edit-step': S.edit = i; refresh(); const ta = document.getElementById('edit-' + i); if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); } return;
      case 'cancel-step': S.edit = null; refresh(); return;
      case 'save-step': { const v = document.getElementById('edit-' + i).value.trim(); if (v) { const st = S.agent.steps[i]; if (v !== st.ins) { st.ins = v; st.by = 'person'; } } S.edit = null; refresh(); toast(`Step ${i + 1} saved. It runs this way from the next invoice.`); return; }
      case 'filter': S.filter = b.dataset.k; refresh(); return;
      case 'open-run': openRun(id); return;
      case 'back-run': openRun('ss0907'); return;
      case 'sel-step': S.sel = i; const st = steps(run(S.runId))[i]; S.tab = st.s === 'failed' || st.s === 'paused' ? 'why' : st.s === 'running' ? 'input' : 'output'; S.raw = false; refresh(); return;
      case 'tab': S.tab = b.dataset.k; S.raw = false; refresh(); return;
      case 'raw': S.raw = !S.raw; refresh(); return;
      case 'copy-raw': { const t = document.getElementById('raw-out'); if (t && navigator.clipboard) navigator.clipboard.writeText(t.textContent).then(() => toast('Raw output copied.'), () => toast('Couldn’t copy here.')); return; }
      case 'open-fix': S.runId = 'ss0907'; track('fix_opened', { step: 3 }); go('fix'); return;
      case 'undo-suggest': S.fix.html = esc(FIX_BASE.trim()); refresh(); return;
      case 'redo-suggest': S.fix.html = esc(FIX_BASE) + `<span class="by-hatua">${esc(FIX_SUGGEST)}</span>`; refresh(); return;
      case 'rerun': S.fix.apply = document.getElementById('apply').checked; doRerun(); return;
      case 'allow-once': { const r = run(S.runId); track('permission_requested', { once: true }); rerunFrom(r, 2); return; }
      case 'perm-rerun': rerunFrom(run(S.runId), 2); return;
      case 'change-perms': S.perms.hl = 'po'; go('perms'); const hl = document.getElementById('perm-hl'); if (hl) hl.scrollIntoView({ block: 'center' }); return;
      case 'typing': S.typing = true; refresh(); document.getElementById('typed-po').focus(); return;
      case 'typed-cancel': S.typing = false; refresh(); return;
      case 'typed-rerun': { const po = document.getElementById('typed-po').value.trim(), tot = document.getElementById('typed-total').value.trim(); if (!po || !tot) { toast('Type both the PO number and the total.'); return; } const r = run(S.runId); r.po = po; r.typedIn = true; S.typing = false; rerunFrom(r, 1); return; }
      case 'reply-draft': S.replyDraft = true; refresh(); return;
      case 'copy-reply': if (navigator.clipboard) navigator.clipboard.writeText(`Hello Tembo Timber, we received ${run(S.runId).inv} as a photo and can’t read the PO number or the totals. Could you send it again as a PDF? Thank you, Achieng, Mawe Supplies.`).then(() => toast('Copied. Paste it into your own email.'), () => {}); return;
      case 'close-dup': { const r = run(S.runId); r.state = 'closed'; refresh(); toast('Closed as a duplicate. Nothing went to Kamau.'); return; }
      case 'not-dup': { const r = run(S.runId); r.kind = 'pass'; rerunFrom(r, 1); return; }
      case 'as-kamau': { const r = id ? run(id) : null; S.who = 'kamau'; if (r) { S.runId = r.id; r.kamauNew = false; go(r.kind === 'pause' ? 'decide' : 'approval'); } else go('queue'); return; }
      case 'k-tab': S.kTab = b.dataset.k; refresh(); return;
      case 'k-open': { const r = run(id); r.kamauNew = false; S.runId = id; go(r.kind === 'pause' ? 'decide' : 'approval'); return; }
      case 'k-next': { const q = queue().filter(r => r.id !== S.runId); if (!q.length) { go('queue'); toast('That was the last one.'); return; } const r = q[0]; r.kamauNew = false; S.runId = r.id; go(r.kind === 'pause' ? 'decide' : 'approval'); return; }
      case 'k-approve': { const r = run(id || S.runId); r.approval = 'approved'; r.approvedAt = clock(); r.kamauNew = false; track('draft_approved', { invoice: r.inv, edited: !!r.editedNote }); refresh(); toast(`Approved ${ksh(total(r))} to ${sup(r)}. Pay it from the bank as usual.`); return; }
      case 'k-edit': S.editingNote = S.runId; refresh(); document.getElementById('note-edit').focus(); return;
      case 'k-edit-save': { const r = run(S.runId); const v = document.getElementById('note-edit').value.trim(); if (v && v !== reasonText(r)) { r.editedNote = v; track('draft_edited', { invoice: r.inv }); } S.editingNote = null; refresh(); return; }
      case 'k-reject': S.rejecting = S.runId; S.rejectText = ''; refresh(); document.getElementById('reject-reason').focus(); return;
      case 'k-reject-cancel': S.rejecting = null; refresh(); return;
      case 'k-reject-send': { const v = document.getElementById('reject-reason').value.trim(); if (v.length < 4) { toast('Add a short reason. Achieng will see it.'); document.getElementById('reject-reason').focus(); return; } const r = run(S.runId); r.approval = 'rejected'; r.rejectReason = v; S.rejecting = null; track('draft_rejected', { invoice: r.inv }); refresh(); toast('Sent back to Achieng with your reason.'); return; }
      case 'k-correct': { const r = run(S.runId); r.approval = 'corrected'; refresh(); toast('Hatua drafted the request to Tembo Timber. Achieng reads it and presses send.'); return; }
      case 'k-decide': {
        const r = run(S.runId), v = S.decide;
        if (v === 'back') { r.approval = 'returned'; toast('Sent back to Achieng.'); }
        else { r.approval = v === 'po' ? 'approved-po' : 'approved-invoice'; r.approvedAt = clock(); r.state = 'passed'; r.sentAt = r.time; track('draft_approved', { invoice: r.inv, choice: v }); toast(v === 'po' ? `Approved ${ksh(poTotal(r))}. Hatua drafted a credit-note request for Achieng to send.` : `Approved ${ksh(total(r))} at the invoice price.`); }
        refresh(); return;
      }
    }
  });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.perm) {
      const k = t.dataset.perm; S.perms[k] = t.value; if (k === 'email') S.perms.emailConfirmed = true;
      if (k === 'po' && t.value !== 'never') { S.perms.hl = null; const pr = run('jh0318'); if (pr && pr.state === 'failed') toast('Saved and logged. Go back to INV-JH-0318 and rerun it from step 3.'); else toast('Saved and logged.'); }
      else toast('Saved and logged.');
      refresh(); return;
    }
    if (t.dataset.decide !== undefined) { S.decide = t.value; return; }
    if (t.id === 'apply') S.fix.apply = t.checked;
    if (t.id === 'state-picker') { const v = t.value; t.value = ''; if (v) addState(v); }
  });
  document.addEventListener('input', e => {
    const t = e.target;
    if (t.id === 'q') { S.q = t.value; const rows = document.getElementById('rows'); if (rows) rows.innerHTML = rowsHtml(); return; }
    if (t.id === 'kq') { S.kq = t.value; const l = document.getElementById('kq-list'); if (l) l.innerHTML = queueHtml(S.kTab === 'waiting' ? queue() : decided()); return; }
    if (t.id === 'prompt') { S.prompt = t.value; return; }
    if (t.id === 'reject-reason') { S.rejectText = t.value; return; }
    if (t.id === 'typed-po') { S.typed.po = t.value; return; }
    if (t.id === 'typed-total') { S.typed.total = t.value; return; }
    if (t.id === 'fix-text') {
      const span = t.querySelector('.by-hatua'); if (span && span.textContent !== FIX_SUGGEST) span.classList.remove('by-hatua');
      S.fix.html = t.innerHTML; const dry = document.getElementById('dry'); if (dry) dry.innerHTML = dryRun();
    }
  });
  document.addEventListener('keydown', e => {
    const t = e.target;
    if (t.getAttribute && t.getAttribute('role') === 'tab' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      const list = [...t.parentElement.querySelectorAll('[role="tab"]')]; const n = list[(list.indexOf(t) + (e.key === 'ArrowRight' ? 1 : list.length - 1)) % list.length];
      n.focus(); n.click(); e.preventDefault();
    }
    if (e.key === 'Escape') { if (S.edit != null) { S.edit = null; refresh(); } else if (S.rejecting) { S.rejecting = null; refresh(); } else if (S.editingNote) { S.editingNote = null; refresh(); } }
  });
  // After "Turn it on" from a first run, the normal demo (with its runs) takes over, keeping the agent live.
  function fresh2() { const keepFix = S.fix; fresh(); S.fix = keepFix; S.who = 'achieng'; }

  fresh(); go('runs', { noFocus: true });
})();
