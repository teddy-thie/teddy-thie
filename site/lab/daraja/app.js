/* Daraja, reimagined · unsolicited concept on tedthie.cc
   Not affiliated with Safaricom. Every reply below is scripted in the browser: nothing here
   calls Safaricom or any other API, and no key, phone number or payment is real. */
(function () {
  'use strict';

  var D = window.DARAJA;
  var INBOX = D.INBOX;
  var STORE = 'daraja-concept-v1';
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var timers = [];
  var S;

  /* ---------- Small helpers ---------- */
  function $(s) { return document.querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function ico(name, size) {
    var p = D.ICONS[name] || [];
    size = size || 16;
    return '<svg class="ico" width="' + size + '" height="' + size + '" viewBox="0 0 16 16" aria-hidden="true">' + p.map(function (d) { return '<path d="' + d + '"/>'; }).join('') + '</svg>';
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function hm(ts) { var d = new Date(ts); return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }
  function later(fn, ms) { var t = setTimeout(fn, REDUCED ? Math.min(ms, 250) : ms); timers.push(t); return t; }
  function uid(p) { return p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function maskPhone(p) { return p ? p.slice(0, 4) + '•••' + p.slice(-3) : '—'; }
  function kes(n) { return n == null ? '—' : Number(n).toLocaleString('en-KE'); }
  function find(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function outcome(api, code) { var l = D.OUT[api]; for (var i = 0; i < l.length; i++) if (l[i].code === code) return l[i]; return l[0]; }

  /* Pretty JSON that keeps small flat objects on one line, like {"Name": "Amount", "Value": 500}. */
  function pretty(o) {
    return JSON.stringify(o, null, 2).replace(/\{\n\s+([^{}\[\]\n]+)\n\s+([^{}\[\]\n]+)\n\s*\}/g, function (m, a, b) { return '{' + a.trim() + ' ' + b.trim() + '}'; });
  }
  /* JSON with colour: keys, strings, numbers. Optional key to highlight. */
  function hjson(o, mark) {
    var s = esc(pretty(o));
    s = s.replace(/(&quot;(?:[^&]|&(?!quot;))*?&quot;)(\s*:)?|(-?\b\d+(?:\.\d+)?\b)/g, function (m, str, colon, num) {
      if (str) return colon ? '<span class="k">' + str + '</span>' + colon : '<span class="s">' + str + '</span>';
      return '<span class="n">' + num + '</span>';
    });
    if (mark) s = s.replace(new RegExp('(<span class="k">&quot;' + mark + '&quot;</span>:[^\\n]*)'), '<mark>$1</mark>');
    return s;
  }
  function hcode(text) {
    var s = esc(text);
    var parts = s.split('\n').map(function (line) {
      var m = line.match(/(^|\s)(\/\/.*)$/);
      var head = m ? line.slice(0, m.index + m[1].length) : line, tail = m ? m[2] : '';
      head = head.replace(/(&quot;[^&\n]*?&quot;)(\s*:)?|(`[^`]*`)/g, function (x, str, colon, tpl) {
        if (str) return colon ? '<span class="k">' + str + '</span>' + colon : '<span class="s">' + str + '</span>';
        return '<span class="s">' + tpl + '</span>';
      });
      return head + (tail ? '<span class="c">' + tail + '</span>' : '');
    });
    return parts.join('\n');
  }

  /* ---------- Components ---------- */
  function btn(o) {
    var cls = 'btn' + (o.variant ? ' btn--' + o.variant : '') + (o.sm ? ' btn--sm' : '') + (o.block ? ' btn--block' : '');
    var attrs = o.attrs || '';
    return '<button type="button" class="' + cls + '"' + (o.action ? ' data-a="' + o.action + '"' : '') + (o.arg != null ? ' data-arg="' + esc(o.arg) + '"' : '') +
      (o.disabled ? ' disabled' : '') + ' ' + attrs + '>' + (o.icon ? ico(o.icon) : '') + '<span>' + esc(o.label) + '</span></button>';
  }
  function lab(tone, text, lg) { return '<span class="label label--' + (tone || 'default') + (lg ? ' label--lg' : '') + '">' + esc(text) + '</span>'; }
  var BANNER_ICON = { info: 'alert', success: 'check-circle', warning: 'alert', critical: 'x-circle' };
  function banner(tone, html) { return '<div class="banner banner--' + tone + ' fade-in" role="status">' + ico(BANNER_ICON[tone]) + '<div>' + html + '</div></div>'; }
  function seg(items, sel, action, label) {
    return '<div class="seg" role="group" aria-label="' + esc(label) + '">' + items.map(function (it) {
      return '<button type="button" data-a="' + action + '" data-arg="' + esc(it[0]) + '" aria-pressed="' + (it[0] === sel) + '">' + esc(it[1]) + '</button>';
    }).join('') + '</div>';
  }
  function code(o) {
    var head;
    if (o.tabs) {
      var cur = S.ui.lang;
      head = '<div class="code__tabs" role="group" aria-label="Language">' + [['curl', 'cURL'], ['node', 'Node.js'], ['python', 'Python']].map(function (t) {
        return '<button type="button" data-a="lang" data-arg="' + t[0] + '" aria-pressed="' + (cur === t[0]) + '">' + t[1] + '</button>';
      }).join('') + '</div>';
    } else {
      head = '<span class="code__title">' + esc(o.title) + '</span>' + (o.status ? '<span class="code__status">' + esc(o.status) + '</span>' : '');
    }
    var text = o.tabs ? D.sample(o.tabs.kind, o.tabs.body, S.ui.lang) : (o.text != null ? o.text : pretty(o.json));
    var html = o.tabs ? hcode(text) : (o.text != null ? hcode(o.text) : hjson(o.json, o.mark));
    var key = 'c' + Math.random().toString(36).slice(2, 8);
    COPY[key] = text;
    return '<section class="code' + (o.empty ? ' code--empty' : '') + '" aria-label="' + esc(o.label || o.title || 'Request code') + '"><div class="code__head">' + head +
      '<button type="button" class="code__copy" data-a="copy" data-arg="' + key + '">' + ico('copy') + 'Copy</button></div><pre>' + html + '</pre></section>';
  }
  var COPY = {};
  function timeline(steps) {
    var map = { done: 'check', active: 'sync', failed: 'x', waiting: 'dot-fill' };
    return '<ol class="tl" aria-label="Timeline">' + steps.map(function (s) {
      return '<li class="tl__step tl__step--' + s[0] + '"><div class="tl__rail"><span class="tl__dot">' + ico(map[s[0]] || 'dot-fill', s[0] === 'waiting' ? 10 : 14) + '</span><span class="tl__line"></span></div>' +
        '<span class="tl__label">' + esc(s[1]) + '</span><span class="tl__detail">' + esc(s[2]) + '</span></li>';
    }).join('') + '</ol>';
  }
  function phone(st) {
    var body;
    if (st.kind === 'sms') {
      body = '<div class="phone__body phone__body--msgs"><span class="sms__head">Messages</span>' + st.sms.map(function (m) { return '<div class="sms fade-in">' + esc(m) + '</div>'; }).join('') +
        '<span class="sms__note">Sandbox SMS · no real money moved</span></div>';
    } else if (st.kind === 'prompt') {
      body = '<div class="phone__body"></div><div class="phone__dim"><div class="sim fade-in" role="dialog" aria-label="Payment prompt on the test phone">' + esc(st.text) +
        '<p class="sim__note">Sandbox: no PIN needed</p><div class="sim__btns"><button type="button" data-a="stk-phone" data-arg="cancel">CANCEL</button><button type="button" data-a="stk-phone" data-arg="pay">PAY</button></div></div></div>';
    } else if (st.kind === 'toast') {
      body = '<div class="phone__body"><span class="toastm fade-in">' + esc(st.text) + '</span></div>';
    } else {
      body = '<div class="phone__body">' + ico('device-mobile', 24) + '<span>' + esc(st.text) + '</span></div>';
    }
    return '<div class="phonecol"><span class="phonecol__label">' + ico('device-mobile') + esc(st.label) + '</span><div class="phone" aria-label="Simulated phone"><div class="phone__screen"><div class="phone__bar">9:41</div>' + body + '</div></div></div>';
  }
  function field(o) {
    var err = S.err[o.id];
    var input;
    if (o.options) {
      input = '<select id="' + o.id + '" data-in="' + o.bind + '" class="' + (o.mono ? 'mono' : '') + '"' + (o.disabled ? ' disabled' : '') + '>' + o.options.map(function (op) {
        return '<option value="' + esc(op[0]) + '"' + (op[0] === o.value ? ' selected' : '') + '>' + esc(op[1]) + '</option>';
      }).join('') + '</select>';
    } else {
      input = '<input id="' + o.id + '" data-in="' + o.bind + '" value="' + esc(o.value) + '"' + (o.mono ? ' class="mono"' : '') + (o.readonly ? ' readonly' : '') +
        (o.disabled ? ' disabled' : '') + (o.inputmode ? ' inputmode="' + o.inputmode + '"' : '') + ' autocomplete="off" spellcheck="false"' + (err ? ' aria-invalid="true" aria-describedby="' + o.id + '-err"' : '') + '>';
    }
    return '<div class="field' + (err ? ' field--invalid' : '') + '"><label for="' + o.id + '">' + esc(o.label) + '</label>' + input +
      (err ? '<span class="field__err" id="' + o.id + '-err">' + ico('alert', 12) + esc(err) + '</span>' : (o.cap ? '<span class="cap">' + esc(o.cap) + '</span>' : '')) + '</div>';
  }
  function phead(title, sub, extra) {
    return '<div class="phead"><div class="phead__text"><h1>' + esc(title) + '</h1><p>' + esc(sub) + '</p></div>' + (extra || '') + '</div>';
  }

  /* ---------- State ---------- */
  function fresh() {
    var s = D.seed(new Date());
    return {
      route: 'get-started', param: '',
      inbox: s.inbox, log: s.log,
      mine: { stk: { sent: 0, result: 0, paid: 0, failed: 0 }, c2b: { sent: 0, confirm: 0, reject: 0, replay: 0 }, b2c: { sent: 0, result: 0, paid: 0, failed: 0 } },
      firstResult: null, cleared: false,
      keys: { ck: 'demo_ck_9fQ2xK7mWv3LpZ8aRt5N', cs: 'demo_cs_H4sD8kJ1qY6vB0nCx2Te', show: {}, copied: '' },
      err: {},
      ui: { lang: 'curl', inboxFilter: 'all', inboxSel: '', logQ: '', logApi: 'all', logStatus: 'any', logSel: '', failApi: 'stk', failCode: '1037', navOpen: false },
      serverUp: false,
      stk: { form: { phone: '254700000001', amount: '500', ref: 'KB-2041', desc: 'Deposit', callback: INBOX }, outcome: '0', phase: 'idle', run: null },
      c2b: { registered: true, regAt: s.log.filter(function (l) { return l.status === 'URLs registered'; }).map(function (l) { return l.at; })[0] || Date.now(), editReg: false, regPhase: 'idle',
        reg: { confirm: INBOX + '/c2b/confirm', validate: INBOX + '/c2b/validate', responseType: 'Completed' },
        form: { phone: '254700000003', amount: '800', account: 'KB-2042' }, reply: '0', phase: 'idle', run: null },
      b2c: { form: { cmd: 'BusinessPayment', phone: '254700000001', amount: '500', remarks: 'Refund KB-2039', occasion: 'KB-2039' }, outcome: '0', phase: 'idle', run: null, lastOrig: '' }
    };
  }
  function load() {
    try {
      var raw = localStorage.getItem(STORE);
      if (raw) {
        var s = JSON.parse(raw);
        ['stk', 'c2b', 'b2c'].forEach(function (k) { if (s[k] && s[k].phase !== 'done') { s[k].phase = 'idle'; s[k].run = null; } });
        if (s.c2b) s.c2b.regPhase = 'idle';
        s.err = {}; s.ui.navOpen = false;
        return s;
      }
    } catch (e) { /* storage off: start fresh */ }
    return fresh();
  }
  var saveT;
  function save() { clearTimeout(saveT); saveT = setTimeout(function () { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) { /* ignore */ } }, 300); }

  /* ---------- Toast ---------- */
  var toastT;
  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('is-on'); }, 2600); }
  function copy(text, msg) {
    var done = function () { toast(msg || 'Copied'); };
    try { navigator.clipboard.writeText(text).then(done, function () { toast('Copy isn’t allowed here. Select the text instead.'); }); } catch (e) { toast('Copy isn’t allowed here. Select the text instead.'); }
  }

  /* ---------- Progress ---------- */
  function checks() {
    var m = S.mine;
    return [
      ['STK Push: a paid result arrived', m.stk.paid > 0],
      ['STK Push: a failed result handled', m.stk.failed > 0],
      ['C2B: a confirmation arrived', m.c2b.confirm > 0],
      ['C2B: a rejected or repeated payment tested', m.c2b.reject + m.c2b.replay > 0],
      ['B2C: a payout arrived', m.b2c.paid > 0],
      ['B2C: a failed or timed-out payout tested', m.b2c.failed > 0]
    ];
  }
  function gsDone(api) {
    var m = S.mine[api];
    if (api === 'stk') return [true, m.sent > 0, m.result > 0];
    if (api === 'c2b') return [true, m.sent > 0, m.confirm > 0];
    return [true, m.sent > 0, m.result > 0];
  }
  function gsCount() { var n = 0; ['stk', 'c2b', 'b2c'].forEach(function (a) { if (gsDone(a)[2]) n++; }); return n; }

  /* ---------- Sidebar and top bar ---------- */
  var NAV = [
    ['Build', [['get-started', 'Get started', 'home'], ['keys', 'Keys', 'key']]],
    ['Try it', [['stk', 'STK Push', 'zap'], ['c2b', 'C2B', 'arrow-down-left'], ['b2c', 'B2C', 'arrow-up-right']]],
    ['Observe', [['inbox', 'Test inbox', 'inbox'], ['log', 'Request log', 'history'], ['failures', 'Failures', 'alert']]],
    ['Launch', [['go-live', 'Go-live', 'rocket']]]
  ];
  var TITLES = { 'get-started': ['Build', 'Get started'], keys: ['Build', 'Keys'], stk: ['Try it', 'STK Push'], c2b: ['Try it', 'C2B'], b2c: ['Try it', 'B2C'], inbox: ['Observe', 'Test inbox'], log: ['Observe', 'Request log'], failures: ['Observe', 'Failures'], 'go-live': ['Launch', 'Go-live'] };
  function renderSide() {
    var ch = checks(), done = ch.filter(function (c) { return c[1]; }).length;
    var nav = NAV.map(function (g) {
      return '<div class="nav__group">' + g[0] + '</div>' + g[1].map(function (it) {
        var trail = '';
        if (it[0] === 'get-started') trail = '<span class="counter">' + gsCount() + '/3</span>';
        if (it[0] === 'inbox' && S.inbox.length) trail = '<span class="counter">' + S.inbox.length + '</span>';
        if (it[0] === 'go-live') trail = ico('lock');
        return '<a class="nav__item" href="#/' + it[0] + '"' + (S.route === it[0] ? ' aria-current="page"' : '') + '>' + ico(it[2]) + '<span>' + it[1] + '</span><span class="nav__trail">' + trail + '</span></a>';
      }).join('');
    }).join('');
    $('#side').innerHTML =
      '<div class="brand"><span class="brand__mark">' + bridge() + '</span><div><div class="brand__name">Daraja</div><div class="brand__sub">Developer portal · concept</div></div></div>' +
      '<button type="button" class="appswitch" data-a="toast" data-arg="This concept has one test app.">' + '<div><div class="appswitch__name">kata-checkout ' + lab('fill', 'Sandbox') + '</div><div class="appswitch__apis">STK Push · C2B · B2C</div></div>' + ico('chevron-down') + '</button>' +
      '<div class="side__new"><a class="btn btn--primary btn--block" href="#/stk">' + ico('plus') + '<span>New test</span></a></div>' +
      '<nav class="nav" aria-label="Portal">' + nav + '</nav>' +
      '<a class="ready" href="#/go-live"><span class="ready__title">' + ico('rocket') + 'Go-live readiness</span><span class="ready__sub">' + done + ' of 6 checks done</span><span class="meter"><span style="width:' + Math.round(done / 6 * 100) + '%"></span></span><span class="ready__link">Open checklist →</span></a>' +
      '<div class="side__foot"><button type="button" class="nav__item" data-a="toast" data-arg="Docs aren’t part of this concept.">' + ico('book') + '<span>Docs</span><span class="nav__trail">' + ico('link-external') + '</span></button>' +
      '<button type="button" class="nav__item" data-a="toast" data-arg="Help isn’t part of this concept.">' + ico('question') + '<span>Help</span></button></div>' +
      '<div class="user"><span class="avatar">AO</span><div><div class="user__name">Achieng Otieno</div><div class="user__mail">achieng@kata.example</div></div></div>';
    $('#side').classList.toggle('is-open', !!S.ui.navOpen);
    $('#scrim').hidden = !S.ui.navOpen;
  }
  function bridge() { return '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M2 13c2.5-5 13.5-5 16 0"/><path d="M1.5 13h17M5 10.2V13M10 8.9V13M15 10.2V13"/></svg>'; }
  function renderTop() {
    var t = TITLES[S.route] || TITLES['get-started'];
    $('#top').innerHTML =
      '<button type="button" class="iconbtn menu-btn" data-a="nav" aria-label="Open navigation">' + ico('list-unordered') + '</button>' +
      '<div class="crumb"><span>kata-checkout</span><span class="muted">/</span><b>' + t[0] + ' / ' + t[1] + '</b></div><span class="top__spacer"></span>' +
      '<form class="search search--top" data-form="search" role="search">' + ico('search') + '<input id="q-top" aria-label="Search IDs in the request log" placeholder="Search IDs, e.g. DEMO7Q2K9X"></form>' +
      '<span class="env-seg">' + seg([['sandbox', 'Sandbox'], ['production', 'Production']], 'sandbox', 'env', 'Environment') + '</span>' +
      '<button type="button" class="iconbtn" data-a="toast" data-arg="Help isn’t part of this concept." aria-label="Help">' + ico('question') + '</button>' +
      '<button type="button" class="iconbtn" data-a="toast" data-arg="No notifications." aria-label="Notifications">' + ico('bell') + '</button>';
  }

  /* ---------- Pages ---------- */
  var PAGES = {};

  PAGES['get-started'] = function () {
    var apis = [
      ['stk', 'STK Push', 'zap', 'Prompt a customer’s phone to pay.', ['Keys ready', 'Send a test', 'Result received']],
      ['c2b', 'C2B', 'arrow-down-left', 'A customer pays your Paybill from their own phone.', ['Keys ready', 'Simulate a payment', 'Confirmation received']],
      ['b2c', 'B2C', 'arrow-up-right', 'Pay a customer from your float, like a refund.', ['Keys ready', 'Send a payout', 'Result received']]
    ];
    var cards = apis.map(function (a) {
      var d = gsDone(a[0]);
      var next = d.indexOf(false);
      var steps = a[4].map(function (s, i) {
        var st = d[i] ? 'done' : (i === next ? 'current' : 'todo');
        return '<div class="step step--' + st + '"><span class="step__num">' + (d[i] ? ico('check', 12) : i + 1) + '</span><div class="step__text"><div class="step__title">' + s + '</div><div class="step__detail">' +
          (i === 0 ? 'Sandbox app made for you' : i === 1 ? (d[1] ? 'Sent from Try it' : 'From the browser, no code') : (d[2] ? 'In your test inbox' : 'Lands in your test inbox')) + '</div></div></div>';
      }).join('');
      var allDone = next === -1;
      return '<section class="card"><div class="gs__api"><span class="gs__apiicon">' + ico(a[2]) + '</span><h2>' + a[1] + '</h2>' + (allDone ? lab('success', 'Done') : lab('default', (d.filter(Boolean).length) + ' of 3')) + '</div>' +
        '<p class="muted">' + a[3] + '</p><div class="gs__steps">' + steps + '</div><div class="actions"><a class="btn' + (allDone ? '' : ' btn--primary') + '" href="#/' + a[0] + '">' + ico(allDone ? 'sync' : a[2]) + '<span>' + (allDone ? 'Run another test' : (a[0] === 'stk' ? 'Send your first test' : a[0] === 'c2b' ? 'Simulate a payment' : 'Send a test payout')) + '</span></a></div></section>';
    }).join('');
    var first = S.firstResult ? banner('success', '<b>Your first result arrived.</b> It’s in your test inbox, with the exact JSON Daraja sent. <a href="#/inbox">Open the inbox</a>') : '';
    return '<div class="page">' + phead('Get started', 'Your sandbox app is ready. Each API takes three steps, and the last one is seeing the result, not just “accepted”.') + first +
      '<div class="gs"><div class="gs__cards">' + cards + '</div><aside class="gs__side card"><h2>Your test app</h2><dl class="kv">' +
      '<dt>Name</dt><dd>kata-checkout</dd><dt>APIs on</dt><dd>STK Push · C2B · B2C</dd><dt>Shortcode</dt><dd>' + D.SHORTCODE + ' (yours only)</dd><dt>Test inbox</dt><dd>' + INBOX + '</dd></dl>' +
      '<div class="inset"><div class="inset__head">' + ico('inbox') + '<span>No server needed</span></div><p class="cap">Every result goes to your test inbox first, so you can see what Daraja sends before you build anything.</p></div>' +
      '<div class="actions"><a class="btn" href="#/keys">' + ico('key') + '<span>Keys and test data</span></a></div></aside></div></div>';
  };

  PAGES.keys = function () {
    var k = S.keys;
    function keyf(id, label, val) {
      var shown = k.show[id];
      var masked = val.slice(0, 8) + '•'.repeat(12) + val.slice(-4);
      return '<div class="keyf"><span class="field__label">' + label + '</span><div class="keyf__row"><span class="keyf__val" aria-label="' + label + (shown ? '' : ', hidden') + '">' + esc(shown ? val : masked) + '</span>' +
        '<button type="button" class="btn" data-a="key-show" data-arg="' + id + '" aria-pressed="' + !!shown + '">' + ico('eye') + '<span>' + (shown ? 'Hide' : 'Show') + '</span></button>' +
        '<button type="button" class="btn" data-a="key-copy" data-arg="' + id + '">' + ico(k.copied === id ? 'check' : 'copy') + '<span>' + (k.copied === id ? 'Copied' : 'Copy') + '</span></button></div></div>';
    }
    return '<div class="page">' + phead('Keys', 'Sandbox keys for kata-checkout. They only work in the sandbox, and every value here is invented for this concept.') +
      '<div class="split"><div class="split__main stack"><section class="card"><div class="card__head"><h2>Consumer key and secret</h2>' + lab('fill', 'Sandbox') + '</div>' +
      keyf('ck', 'Consumer key', k.ck) + keyf('cs', 'Consumer secret', k.cs) +
      '<div class="actions">' + btn({ label: 'Regenerate secret', icon: 'sync', action: 'key-regen' }) + '<span class="cap">The old secret stops working straight away.</span></div></section>' +
      '<section class="card"><h2>Test data</h2><table class="dtable"><tbody>' +
      '<tr><td>Shortcode</td><td class="m">' + D.SHORTCODE + '<br><span class="cap">Only this app uses it, so no one else’s test overwrites your C2B URLs.</span></td></tr>' +
      '<tr><td>Test phones</td><td class="m">' + D.PHONES.map(function (p) { return p[0] + ' · ' + p[1]; }).join('<br>') + '</td></tr>' +
      '<tr><td>B2C test initiator</td><td class="m">kata_test_initiator<br><span class="cap">Its SecurityCredential is built for you on the B2C page.</span></td></tr>' +
      '<tr><td>Passkey</td><td class="m">•••••••• <span class="cap">Built into the STK Push Password for you.</span></td></tr>' +
      '<tr><td>Test inbox</td><td class="m">' + INBOX + '</td></tr></tbody></table></section></div>' +
      '<aside class="split__list"><section class="card"><h2>Environment</h2><div class="env">' +
      '<div class="env__row env__row--on">' + ico('beaker') + '<div><b>Sandbox</b><span>Test money only. Every result lands in your test inbox.</span></div>' + lab('success', 'On') + '</div>' +
      '<div class="env__row">' + ico('lock') + '<div><b>Production</b><span>Unlocks after go-live. Your business owner approves it with their M-Pesa admin login.</span></div>' + lab('default', 'Locked') + '</div></div>' +
      '<a class="btn" href="#/go-live">' + ico('rocket') + '<span>See the go-live checklist</span></a></section>' +
      '<div class="banner banner--info">' + ico('shield-check') + '<div>Keep keys on your server. Never put them in a mobile app or a web page.</div></div></aside></div></div>';
  };

  /* --- STK Push --- */
  function stkSteps() {
    var st = S.stk, r = st.run;
    var W = [['waiting', 'Sent', 'Your request'], ['waiting', 'Accepted', 'Daraja replies'], ['waiting', 'Prompt on phone', 'Customer confirms'], ['waiting', 'Result', 'Lands in your test inbox']];
    if (st.phase === 'idle' || !r) return W;
    if (st.phase === 'sending') return [['active', 'Sent', 'POST · ' + hm(r.at)], W[1], W[2], W[3]];
    var s = [['done', 'Sent', hm(r.at)], ['done', 'Accepted', 'ResponseCode 0 · not paid yet']];
    if (st.phase === 'accepted') return s.concat([['active', 'Prompt on phone', 'Sending the prompt…'], W[3]]);
    if (st.phase === 'prompt') return s.concat([['active', 'Prompt on phone', 'Waiting for the customer · ' + r.left + ' s left'], W[3]]);
    var o = outcome('stk', r.code);
    s[1] = ['done', 'Accepted', 'ResponseCode 0'];
    return s.concat([['done', 'Prompt on phone', r.code === '1037' ? 'No answer' : 'Answered ' + hm(r.doneAt)], [r.code === '0' ? 'done' : 'failed', 'Result', 'ResultCode ' + r.code + ' · ' + o.name + ' · ' + Math.round((r.doneAt - r.at) / 1000) + ' s']]);
  }
  PAGES.stk = function () {
    var st = S.stk, f = st.form, r = st.run, busy = st.phase !== 'idle' && st.phase !== 'done';
    var top = '';
    if (st.phase === 'accepted' || st.phase === 'prompt') top = banner('info', '<b>Accepted is not paid.</b> ResponseCode 0 only means Daraja took the request. Wait for the result before you mark booking ' + esc(f.ref) + ' paid.');
    if (st.phase === 'done') {
      var o = outcome('stk', r.code);
      top = r.code === '0' ? banner('success', '<b>Paid.</b> Receipt ' + esc(r.receipt) + '. Safe to mark booking ' + esc(r.ref) + ' paid. The result is in your test inbox.' + (r.own ? ' ' + ownNote(r) : '')) :
        banner('warning', '<b>' + esc(o.name) + ' (' + r.code + ').</b> Failed results have no CallbackMetadata, so check ResultCode before you read it. ' + esc(o.hint) + '.' + (r.own ? ' ' + ownNote(r) : ''));
    }
    var ph;
    if (st.phase === 'prompt') ph = { kind: 'prompt', text: 'Do you want to pay KES ' + kes(r.amount) + ' to KATA BARBERS? Account no. ' + r.ref };
    else if (st.phase === 'done' && r.code === '0') ph = { kind: 'sms', sms: [r.receipt + ' Confirmed. Ksh' + Number(r.amount).toFixed(2) + ' paid to KATA BARBERS for account ' + r.ref + ' on ' + dmy(r.doneAt) + '.'] };
    else if (st.phase === 'done') ph = { kind: 'toast', text: { '1': 'Insufficient balance', '1032': 'Request cancelled', '1037': 'Prompt expired', '2001': 'Wrong PIN' }[r.code] };
    else ph = { kind: 'idle', text: 'Waiting for a prompt' };
    var testPhone = D.PHONES.filter(function (p) { return p[0] === f.phone; })[0];
    ph.label = testPhone ? testPhone[1] + ' · the customer' : 'The customer';
    var outOpts = [['0', '0 · Paid'], ['1', '1 · Insufficient balance'], ['1032', '1032 · Cancelled by customer'], ['1037', '1037 · No response'], ['2001', '2001 · Wrong PIN'], ['tap', 'Let me tap the phone']];
    var form = '<section class="card bench__form" aria-label="Request"><h2>Request</h2>' +
      field({ id: 'stk-phone', bind: 'stk.form.phone', label: 'Test phone', value: f.phone, mono: true, cap: 'Prompts go to a simulated phone, never a real line.', options: D.PHONES.map(function (p) { return [p[0], p[0] + ' · ' + p[1]]; }), disabled: busy }) +
      field({ id: 'stk-amount', bind: 'stk.form.amount', label: 'Amount (KES)', value: f.amount, mono: true, inputmode: 'numeric', disabled: busy }) +
      field({ id: 'stk-ref', bind: 'stk.form.ref', label: 'Account reference', value: f.ref, mono: true, cap: 'Shown to the customer. Up to 12 characters.', disabled: busy }) +
      field({ id: 'stk-desc', bind: 'stk.form.desc', label: 'Description', value: f.desc, disabled: busy }) +
      field({ id: 'stk-cb', bind: 'stk.form.callback', label: 'Callback URL', value: f.callback, cap: f.callback === INBOX ? 'Your test inbox. Change it to try your own server.' : 'Your own server. A copy still lands in your test inbox.', disabled: busy }) +
      field({ id: 'stk-out', bind: 'stk.outcome', label: 'Outcome', value: st.outcome, mono: true, cap: 'Sandbox only: choose how this test ends.', options: outOpts, disabled: busy }) +
      btn({ variant: 'primary', block: true, icon: st.phase === 'done' ? 'sync' : 'zap', label: st.phase === 'sending' ? 'Sending…' : st.phase === 'done' ? 'Run again' : 'Send test', action: 'stk-send', disabled: busy }) + '</section>';
    var body = stk_body();
    var codeCol = '<div class="bench__code">' + code({ tabs: { kind: 'stk', body: body } });
    if (r && r.response) codeCol += code({ title: 'Response · accepted, not paid', status: '200 · 0.4 s', json: r.response });
    if (r && r.callback) codeCol += code({ title: 'Result · in your test inbox', status: 'ResultCode ' + r.code + ' · ' + hm(r.doneAt), json: r.callback, mark: 'ResultCode' });
    codeCol += '</div>';
    var tl = '<section class="card" aria-live="polite"><div class="card__head"><h2>Timeline</h2><span class="mono muted">' + (r ? 'CheckoutRequestID  ' + esc(r.c) : 'No request yet') + '</span></div>' + timeline(stkSteps()) +
      (st.phase === 'done' ? '<div class="actions"><a class="btn" href="#/inbox/' + r.inboxId + '">' + ico('inbox') + '<span>Open in test inbox</span></a><a class="btn" href="#/log/' + r.logId + '">' + ico('history') + '<span>Open in request log</span></a></div>' : '') + '</section>';
    return '<div class="page">' + phead('STK Push', 'Prompt a customer’s phone to pay. The result comes back to your test inbox.') + top + '<div class="bench">' + form + phone(ph) + codeCol + '</div>' + tl + '</div>';
  };
  function stk_body() { var f = S.stk.form; return D.stk.request({ phone: f.phone, amount: f.amount || 0, ref: f.ref, desc: f.desc, callback: f.callback }, new Date()); }
  function ownNote(r) { return r.ownOk ? 'Your server at ' + esc(r.own) + ' answered 200.' : '<b>Your server at ' + esc(r.own) + ' didn’t answer</b> (simulated 502). <a href="#/log/' + r.logId + '">See it in the log</a>.'; }
  function dmy(ts) { var d = new Date(ts); return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + String(d.getFullYear()).slice(2) + ' at ' + (d.getHours() % 12 || 12) + ':' + pad(d.getMinutes()) + ' ' + (d.getHours() < 12 ? 'AM' : 'PM'); }

  function validStk() {
    var f = S.stk.form, e = {};
    if (!/^\d+$/.test(f.amount) || +f.amount < 1 || +f.amount > 250000) e['stk-amount'] = 'Use a whole number from 1 to 250,000.';
    if (!f.ref.trim()) e['stk-ref'] = 'Add a reference, like a booking code.';
    else if (f.ref.length > 12) e['stk-ref'] = 'Keep it to 12 characters. Daraja cuts the rest.';
    if (!f.desc.trim()) e['stk-desc'] = 'Add a short description.';
    if (!/^https:\/\/[^\s]+\.[^\s]+/.test(f.callback)) e['stk-cb'] = 'Use a full https:// address.';
    S.err = e;
    return !Object.keys(e).length;
  }
  function stkSend() {
    if (!validStk()) { render(); focusErr(); return; }
    var f = S.stk.form, now = new Date();
    var run = { at: now.getTime(), m: D.ids.merchant(), c: D.ids.checkout(now), amount: +f.amount, ref: f.ref, phone: f.phone, callbackUrl: f.callback, outcome: S.stk.outcome, logId: uid('l'), left: 60 };
    run.request = D.stk.request(f, now);
    S.stk.run = run; S.stk.phase = 'sending';
    S.log.unshift({ id: run.logId, api: 'stk', at: run.at, tone: 'attention', status: 'Sending', amount: run.amount, phone: run.phone, idLabel: run.c, took: '…', ref: run.ref, search: [run.c, run.m, run.ref], request: run.request, response: null, responseMeta: '', steps: [], callbacks: [], mine: true });
    render();
    later(function () {
      run.response = D.stk.accepted(run.m, run.c);
      S.stk.phase = 'accepted'; S.mine.stk.sent++;
      var l = find(S.log, run.logId); l.status = 'Accepted · waiting'; l.response = run.response; l.responseMeta = '200 · 0.4 s';
      render();
      later(function () {
        S.stk.phase = 'prompt'; render();
        if (run.outcome === 'tap') tick(run, 1000);
        else if (run.outcome === '1037') tick(run, 70);
        else later(function () { if (S.stk.run === run && S.stk.phase === 'prompt') stkFinish(run.outcome); }, 2200);
      }, 1300);
    }, 700);
  }
  function tick(run, ms) {
    later(function () {
      if (S.stk.run !== run || S.stk.phase !== 'prompt') return;
      run.left = Math.max(0, run.left - 1);
      if (run.left === 0) { stkFinish('1037'); return; }
      updateLive(); tick(run, ms);
    }, ms);
  }
  function updateLive() { if (S.route !== 'stk') return; var v = $('#view'); var tl = v && v.querySelector('.tl'); if (tl) tl.outerHTML = timeline(stkSteps()); }
  function stkFinish(code) {
    var run = S.stk.run; if (!run || S.stk.phase !== 'prompt') return;
    var now = new Date(); run.code = code; run.doneAt = now.getTime();
    var o = outcome('stk', code);
    if (code === '0') run.receipt = D.ids.receipt();
    run.callback = D.stk.callback(o, run.m, run.c, { amount: run.amount, phone: run.phone }, run.receipt, now);
    var own = run.callbackUrl.indexOf(INBOX) === 0 ? '' : run.callbackUrl.replace(/^https:\/\//, '');
    run.own = own; run.ownOk = own ? S.serverUp : false;
    var cbId = uid('cb');
    run.inboxId = cbId;
    S.inbox.unshift({ id: cbId, api: 'stk', kind: 'STK result', tone: code === '0' ? 'success' : 'danger', status: code === '0' ? 'Paid' : 'Failed · ' + code, title: 'KES ' + kes(run.amount) + ' · ' + run.ref, ref: run.ref, idLabel: run.c, at: run.doneAt, body: run.callback, logId: run.logId, receipt: run.receipt, mine: true, isNew: true });
    var deliveries = [{ ok: true, at: run.doneAt, to: 'Test inbox', code: '200', ms: '0.1 s' }];
    if (own) deliveries.push({ ok: run.ownOk, at: run.doneAt, to: own, code: run.ownOk ? '200' : '502', ms: run.ownOk ? '0.3 s' : '1.8 s' });
    var l = find(S.log, run.logId);
    l.tone = code === '0' ? 'success' : 'danger'; l.status = code === '0' ? 'Paid' : 'Failed · ' + code; l.took = Math.round((run.doneAt - run.at) / 1000) + ' s';
    if (run.receipt) l.search.push(run.receipt);
    l.callbacks = [{ title: 'Callback · from Daraja', meta: 'ResultCode ' + code + ' · ' + hm(run.doneAt), body: run.callback, inboxId: cbId, deliveries: deliveries }];
    l.ownUrl = own; l.undelivered = own && !run.ownOk;
    l.steps = [['done', 'Sent', hm(run.at)], ['done', 'Accepted', 'ResponseCode 0 · 0.4 s'], ['done', 'Prompt on phone', code === '1037' ? 'No answer' : 'Answered'], [code === '0' ? 'done' : 'failed', code === '0' ? 'Paid' : 'Result', 'ResultCode ' + code + (run.receipt ? ' · ' + run.receipt : '')]];
    if (own) l.steps.push([run.ownOk ? 'done' : 'failed', 'Delivered to your URL', run.ownOk ? '200' : '502']);
    l.steps = l.steps.slice(-4);
    S.stk.phase = 'done';
    S.mine.stk.result++; if (code === '0') S.mine.stk.paid++; else S.mine.stk.failed++;
    firstResult(cbId);
    render();
  }
  function firstResult(id) { if (!S.firstResult) { S.firstResult = id; toast('Your first result arrived in your test inbox.'); } }

  /* --- C2B --- */
  var BANNED = /(m-?pesa|safaricom|exec|cmd|sql|query)/i;
  PAGES.c2b = function () {
    var c = S.c2b, r = c.run, f = c.form;
    var busy = c.phase !== 'idle' && c.phase !== 'done';
    var top = '';
    if (c.phase === 'done' && r) {
      if (r.result === 'confirmed') top = banner('success', '<b>Confirmation received.</b> Book ' + esc(r.account) + ' as paid with TransID ' + esc(r.trans) + ', then reply so Daraja stops sending it.' + (r.replay ? ' <b>It arrived twice:</b> book it once.' : ''));
      else if (r.result === 'rejected') top = banner('warning', '<b>Rejected with ' + esc(r.reply) + '.</b> ' + esc(outcome('c2b', r.reply).name) + '. The customer’s money never left, and no confirmation will come.');
      else if (r.result === 'cancelled') top = banner('warning', '<b>Your validation address didn’t answer in 8 seconds,</b> so Daraja used your fallback: Cancelled. The payment was declined.');
    }
    if (c.justRegistered) top = banner('success', '<b>URLs registered.</b> ' + D.SHORTCODE + ' belongs to this app alone, so no one else’s test can overwrite them.');
    // Step 1
    var s1;
    if (!c.registered || c.editReg) {
      s1 = '<section class="card" aria-label="Step 1"><div class="step step--current"><span class="step__num">1</span><div class="step__text"><div class="step__title">Register your URLs</div><div class="step__detail">Tell Daraja where to send validation and confirmation</div></div></div>' +
        '<div class="row">' + field({ id: 'c2b-confirm', bind: 'c2b.reg.confirm', label: 'Confirmation URL', value: c.reg.confirm, cap: 'Every completed payment lands here.' }) +
        field({ id: 'c2b-validate', bind: 'c2b.reg.validate', label: 'Validation URL', value: c.reg.validate, cap: 'Asked first, if validation is on. Answer within 8 s.' }) + '</div>' +
        '<div class="field"><span class="field__label">If your validation address is down</span>' + seg([['Completed', 'Completed'], ['Cancelled', 'Cancelled']], c.reg.responseType, 'c2b-rt', 'If your validation address is down') +
        '<span class="cap">Completed: Daraja takes the payment anyway. Cancelled: Daraja refuses it and the customer keeps their money.</span></div>' +
        '<div class="actions">' + lab('success', 'Validation on') + '<span class="cap">Sandbox lets you test validation now. On a live shortcode it stays off until Safaricom switches it on.</span></div>' +
        code({ tabs: { kind: 'register', body: D.c2b.register(c.reg) } }) +
        '<div class="actions">' + btn({ variant: 'primary', icon: 'arrow-down-left', label: c.regPhase === 'saving' ? 'Registering…' : 'Register URLs', action: 'c2b-register', disabled: c.regPhase === 'saving' }) +
        (c.registered ? btn({ variant: 'invisible', label: 'Cancel', action: 'c2b-edit', arg: 'off' }) : '') + '</div></section>';
    } else {
      s1 = '<section class="card" aria-label="Step 1"><div class="card__head"><div class="step step--done" style="flex:1"><span class="step__num">' + ico('check', 12) + '</span><div class="step__text"><div class="step__title">Register your URLs</div><div class="step__detail">Tell Daraja where to send validation and confirmation</div></div></div>' +
        lab('success', 'Registered ' + hm(c.regAt)) + btn({ variant: 'invisible', sm: true, label: 'Change', action: 'c2b-edit', arg: 'on' }) + '</div>' +
        '<p class="summary">' + D.SHORTCODE + '  ·  ' + dest(c.reg.confirm, c.reg.validate) + '  ·  ' + c.reg.responseType + ' if down</p></section>';
    }
    // Step 2
    var s2state = !c.registered ? 'todo' : (c.phase === 'idle' ? 'current' : 'done');
    var replyOpts = [['0', 'Accept · 0'], ['C2B00011', 'Reject · C2B00011 invalid phone'], ['C2B00012', 'Reject · C2B00012 invalid account'], ['C2B00013', 'Reject · C2B00013 invalid amount'], ['C2B00014', 'Reject · C2B00014 invalid KYC'], ['C2B00015', 'Reject · C2B00015 invalid short code'], ['C2B00016', 'Reject · C2B00016 other'], ['down', 'No answer in 8 s (address down)'], ['replay', 'Accept, then a repeat confirmation']];
    var s2 = '<section class="card" aria-label="Step 2"><div class="card__head"><div class="step step--' + s2state + '" style="flex:1"><span class="step__num">' + (s2state === 'done' ? ico('check', 12) : 2) + '</span><div class="step__text"><div class="step__title">Simulate a customer paying</div><div class="step__detail">Paybill ' + D.SHORTCODE + ', with a booking code as the account number</div></div></div>' +
      (s2state === 'done' && r ? lab('default', 'Sent ' + hm(r.at)) : '') + '</div>';
    if (s2state === 'current' || (s2state === 'done' && c.phase === 'done')) {
      if (s2state === 'current') {
        s2 += '<div class="row">' + field({ id: 'c2b-phone', bind: 'c2b.form.phone', label: 'Customer phone', value: f.phone, mono: true, options: D.PHONES.map(function (p) { return [p[0], p[0] + ' · ' + p[1]]; }) }) +
          field({ id: 'c2b-amount', bind: 'c2b.form.amount', label: 'Amount (KES)', value: f.amount, mono: true, inputmode: 'numeric' }) +
          field({ id: 'c2b-account', bind: 'c2b.form.account', label: 'Account number', value: f.account, mono: true, cap: 'The booking code the customer types.' }) + '</div>' +
          field({ id: 'c2b-reply', bind: 'c2b.reply', label: 'Validation reply (sandbox only)', value: c.reply, mono: true, cap: 'Choose how your validation address answers this test.', options: replyOpts }) +
          code({ tabs: { kind: 'simulate', body: D.c2b.simulate(f) } }) +
          '<div class="actions">' + btn({ variant: 'primary', icon: 'arrow-down-left', label: 'Simulate payment', action: 'c2b-send' }) + '</div>';
      } else {
        s2 += '<p class="summary">' + esc(r.phone) + (r.result === 'confirmed' ? ' paid KES ' : ' tried to pay KES ') + kes(r.amount) + ' to ' + D.SHORTCODE + '  ·  account ' + esc(r.account) + '</p><div class="actions">' + btn({ icon: 'sync', label: 'Simulate another payment', action: 'c2b-again' }) + '</div>';
      }
    } else if (s2state === 'done' && r) {
      s2 += '<p class="summary">' + esc(r.phone) + ' is paying KES ' + kes(r.amount) + ' to ' + D.SHORTCODE + '  ·  account ' + esc(r.account) + '</p>';
    }
    s2 += '</section>';
    // Step 3
    var s3state = !r ? 'todo' : (c.phase === 'done' ? (r.result === 'confirmed' ? 'done' : 'failed') : 'current');
    var s3lab = s3state === 'current' ? lab('attention', 'Waiting') : s3state === 'done' ? lab('success', 'Received ' + hm(r.confirmAt)) : s3state === 'failed' ? lab('danger', r.result === 'rejected' ? 'Rejected · ' + r.reply : 'Cancelled') : '';
    var s3 = '<section class="card" aria-label="Step 3" aria-live="polite"><div class="card__head"><div class="step step--' + s3state + '" style="flex:1"><span class="step__num">' + (s3state === 'done' ? ico('check', 12) : s3state === 'failed' ? ico('x', 12) : 3) + '</span><div class="step__text"><div class="step__title">Confirmation and your reply</div><div class="step__detail">What Daraja sends, and what your server must answer</div></div></div>' + s3lab + '</div>';
    if (r) {
      if (s3state === 'current') {
        s3 += '<div class="events">' + r.events.map(function (e) { return '<div class="event">' + ico(e[0], 16) + '<div><b>' + esc(e[1]) + '</b><span>' + esc(e[2]) + '</span></div></div>'; }).join('') + '</div>';
      } else if (s3state === 'done') {
        s3 += '<div class="pair">' + code({ title: 'Confirmation · in your test inbox', status: hm(r.confirmAt), json: r.confirm, mark: 'TransID' }) +
          '<div class="stack">' + code({ title: 'Your server replies', status: 'HTTP 200', json: { ResultCode: 0, ResultDesc: 'Accepted' } }) +
          '<p class="cap">Reply with this JSON and a 200. An empty reply makes Daraja retry, so save TransID with a unique index and the booking is only marked paid once.</p>' +
          (r.replay ? banner('warning', '<b>The same confirmation arrived twice</b> (TransID ' + esc(r.trans) + '). Book it once, and still reply 200 to the repeat.') : '') + '</div></div>';
      } else {
        s3 += '<div class="pair">' + code({ title: r.result === 'rejected' ? 'Validation request · from Daraja' : 'Validation request · unanswered', status: hm(r.validateAt), json: r.validation, mark: 'BillRefNumber' }) +
          '<div class="stack">' + (r.result === 'rejected' ? code({ title: 'Your inbox replied', status: 'HTTP 200', json: { ResultCode: r.reply, ResultDesc: 'Rejected' } }) +
          '<p class="cap">' + esc(r.reply) + ' means ' + esc(outcome('c2b', r.reply).name.toLowerCase()) + '. Your server sends it when the payment shouldn’t go through, and Daraja stops the payment.</p>' :
          '<p class="cap">No answer within 8 seconds, so Daraja followed your registration choice: <b>Cancelled</b>. Pick Completed if you’d rather take the money and sort it out later.</p>') +
          btn({ icon: 'sync', label: r.result === 'rejected' ? 'Try again with a valid booking' : 'Simulate again', action: r.result === 'rejected' ? 'c2b-fix' : 'c2b-again' }) + '</div></div>';
      }
    }
    s3 += '</section>';
    var ph;
    if (r && r.result === 'confirmed') ph = { kind: 'sms', sms: [r.trans + ' Confirmed. Ksh' + Number(r.amount).toFixed(2) + ' sent to KATA BARBERS for account ' + r.account + ' on ' + dmy(r.confirmAt) + '.'] };
    else if (r && (r.result === 'rejected' || r.result === 'cancelled')) ph = { kind: 'toast', text: 'Payment declined' };
    else if (r) ph = { kind: 'idle', text: 'Paying KES ' + kes(r.amount) + ' to ' + D.SHORTCODE + '…' };
    else ph = { kind: 'idle', text: 'The customer pays from their own phone' };
    var tp = D.PHONES.filter(function (p) { return p[0] === (r ? r.phone : f.phone); })[0];
    ph.label = (tp ? tp[1] : 'Phone') + ' · the customer';
    return '<div class="page">' + phead('C2B', 'A customer pays your Paybill from their own phone. Register where results go, then simulate a payment.') + top +
      '<div class="bench"><div class="stack" style="flex:1;min-width:0">' + s1 + s2 + s3 + '</div>' + phone(ph) + '</div></div>';
  };
  function host(u) { return u.indexOf(INBOX) === 0 ? 'test inbox' : u.replace(/^https?:\/\//, ''); }
  function dest(cf, vl) { return host(cf) === host(vl) ? 'confirm + validate → ' + esc(host(cf)) : 'confirm → ' + esc(host(cf)) + '  ·  validate → ' + esc(host(vl)); }
  function validUrl(id, v, e) {
    if (!/^https?:\/\/[^\s]+\.[^\s]+/.test(v)) e[id] = 'Use a full address that starts with https://.';
    else if (BANNED.test(v)) e[id] = 'URLs can’t contain M-PESA, Safaricom, exec, cmd, SQL or query. Daraja rejects them.';
  }
  function c2bRegister() {
    var c = S.c2b, e = {};
    validUrl('c2b-confirm', c.reg.confirm, e); validUrl('c2b-validate', c.reg.validate, e);
    S.err = e; if (Object.keys(e).length) { render(); focusErr(); return; }
    c.regPhase = 'saving'; render();
    later(function () {
      var now = Date.now();
      c.regPhase = 'idle'; c.registered = true; c.editReg = false; c.regAt = now; c.justRegistered = true;
      S.log.unshift({ id: uid('l'), api: 'c2b', at: now, tone: 'default', status: 'URLs registered', amount: null, phone: null, idLabel: D.SHORTCODE, took: '0.6 s', search: [D.SHORTCODE],
        request: D.c2b.register(c.reg), response: D.c2b.registered(), responseMeta: '200 · 0.6 s', path: 'register',
        steps: [['done', 'Sent', hm(now - 600)], ['done', 'Registered', 'ResponseCode 0'], ['done', 'Validation', 'On · ' + c.reg.responseType + ' if down'], ['done', 'Ready', 'Payments can arrive']], callbacks: [], mine: true });
      render();
    }, 600);
  }
  function c2bSend() {
    var c = S.c2b, f = c.form, e = {};
    if (!/^\d+$/.test(f.amount) || +f.amount < 1 || +f.amount > 250000) e['c2b-amount'] = 'Use a whole number from 1 to 250,000.';
    if (!f.account.trim()) e['c2b-account'] = 'Add the booking code the customer types.';
    S.err = e; if (Object.keys(e).length) { render(); focusErr(); return; }
    var now = new Date();
    var r = { at: now.getTime(), phone: f.phone, amount: +f.amount, account: f.account.trim(), reply: c.reply, trans: D.ids.receipt(), logId: uid('l'), events: [] };
    var nf = { phone: r.phone, amount: r.amount, account: r.account };
    c.run = r; c.phase = 'sending'; c.justRegistered = false; S.mine.c2b.sent++;
    var l = { id: r.logId, api: 'c2b', at: r.at, tone: 'attention', status: 'Paying', amount: r.amount, phone: r.phone, idLabel: r.trans, took: '…', ref: r.account, search: [r.trans, r.account],
      request: D.c2b.simulate(nf), response: D.c2b.simulated(), responseMeta: '200 · 0.3 s', path: 'simulate', steps: [['done', 'Paid on phone', hm(r.at)], ['active', 'Validation', 'Asking your server'], ['waiting', 'Completed', ''], ['waiting', 'Confirmation', '']], callbacks: [], mine: true };
    S.log.unshift(l);
    r.events.push(['clock', 'Validation request · sending', 'Daraja asks your validation address first']);
    render();
    later(function () {
      var t = new Date(); r.validateAt = t.getTime(); r.validation = D.c2b.notice(nf, r.trans, t);
      var vid = uid('cb');
      if (r.reply === 'down') {
        r.events = [['clock', 'Validation request · ' + hm(r.validateAt), 'No answer yet. Daraja waits 8 seconds.']];
        S.inbox.unshift({ id: vid, api: 'c2b', kind: 'C2B validation', tone: 'attention', status: 'No answer', title: 'KES ' + kes(r.amount) + ' · ' + r.account, ref: r.account, idLabel: 'TransID ' + r.trans, at: r.validateAt, body: r.validation, logId: r.logId, mine: true, isNew: true, reply: null });
        l.callbacks.push({ title: 'Validation · from Daraja', meta: hm(r.validateAt), body: r.validation, inboxId: vid, deliveries: [{ ok: false, at: r.validateAt, to: 'Your validation address', code: 'timeout', ms: '8 s' }] });
        render();
        later(function () {
          if (S.c2b.reg.responseType === 'Cancelled') {
            r.result = 'cancelled'; c.phase = 'done'; S.mine.c2b.reject++;
            l.tone = 'danger'; l.status = 'Cancelled · no answer'; l.took = '8 s';
            l.steps = [['done', 'Paid on phone', hm(r.at)], ['failed', 'Validation', 'No answer in 8 s'], ['failed', 'Cancelled', 'Your fallback'], ['waiting', 'Confirmation', 'None']];
            render();
          } else confirmC2B(r, l, nf, 'Completed by your fallback');
        }, 1600);
        return;
      }
      var reject = /^C2B/.test(r.reply);
      S.inbox.unshift({ id: vid, api: 'c2b', kind: 'C2B validation', tone: reject ? 'danger' : 'default', status: reject ? 'You rejected · ' + r.reply : 'You accepted', title: 'KES ' + kes(r.amount) + ' · ' + r.account, ref: r.account, idLabel: 'TransID ' + r.trans, at: r.validateAt, body: r.validation, logId: r.logId, mine: true, isNew: true, reply: { ResultCode: reject ? r.reply : '0', ResultDesc: reject ? 'Rejected' : 'Accepted' } });
      l.callbacks.push({ title: 'Validation · from Daraja', meta: hm(r.validateAt), body: r.validation, inboxId: vid, deliveries: [{ ok: true, at: r.validateAt, to: 'Test inbox', code: '200', ms: '0.2 s' }] });
      firstResult(vid);
      if (reject) {
        r.result = 'rejected'; c.phase = 'done'; S.mine.c2b.reject++;
        l.tone = 'danger'; l.status = 'Rejected · ' + r.reply; l.took = '1 s';
        l.steps = [['done', 'Paid on phone', hm(r.at)], ['failed', 'Validation', 'You replied ' + r.reply], ['failed', 'Declined', 'No money moved'], ['waiting', 'Confirmation', 'None']];
        render(); return;
      }
      r.events = [['check-circle', 'Validation request · ' + hm(r.validateAt), 'Your test inbox replied Accept (0) in 0.2 s'], ['clock', 'Confirmation · waiting', 'Sandbox usually confirms within a few seconds']];
      render();
      later(function () { confirmC2B(r, l, nf, 'TransID ' + r.trans); }, 900);
    }, 800);
  }
  function confirmC2B(r, l, nf, stepNote) {
    var c = S.c2b, t = new Date();
    r.confirmAt = t.getTime(); r.confirm = D.c2b.notice(nf, r.trans, t); r.result = 'confirmed';
    var id = uid('cb');
    S.inbox.unshift({ id: id, api: 'c2b', kind: 'C2B confirmation', tone: 'accent', status: 'Received', title: 'KES ' + kes(r.amount) + ' · ' + r.account, ref: r.account, idLabel: 'TransID ' + r.trans, at: r.confirmAt, body: r.confirm, logId: r.logId, mine: true, isNew: true });
    var own = c.reg.confirm.indexOf(INBOX) === 0 ? '' : host(c.reg.confirm), dl = [{ ok: true, at: r.confirmAt, to: 'Test inbox', code: '200', ms: '0.1 s' }];
    if (own) { dl.push({ ok: S.serverUp, at: r.confirmAt, to: own, code: S.serverUp ? '200' : '502', ms: S.serverUp ? '0.3 s' : '1.8 s' }); l.ownUrl = own; l.undelivered = !S.serverUp; }
    l.callbacks.push({ title: 'Confirmation · from Daraja', meta: hm(r.confirmAt), body: r.confirm, inboxId: id, deliveries: dl });
    l.tone = 'accent'; l.status = 'Received'; l.took = Math.max(1, Math.round((r.confirmAt - r.at) / 1000)) + ' s';
    l.steps = [['done', 'Paid on phone', hm(r.at)], r.reply === 'down' ? ['failed', 'Validation', 'No answer in 8 s'] : ['done', 'Validation', 'You replied 0'], ['done', 'Completed', stepNote], ['done', 'Confirmation', 'You replied 0 · 200']];
    S.mine.c2b.confirm++;
    firstResult(id);
    if (r.reply === 'replay') {
      later(function () {
        var t2 = Date.now(), id2 = uid('cb');
        r.replay = true; S.mine.c2b.replay++;
        S.inbox.unshift({ id: id2, api: 'c2b', kind: 'C2B confirmation', tone: 'attention', status: 'Repeat', title: 'KES ' + kes(r.amount) + ' · ' + r.account, ref: r.account, idLabel: 'TransID ' + r.trans, at: t2, body: r.confirm, logId: r.logId, mine: true, isNew: true, repeat: true });
        l.callbacks.push({ title: 'Confirmation · repeat', meta: hm(t2), body: r.confirm, inboxId: id2, deliveries: [{ ok: true, at: t2, to: 'Test inbox', code: '200', ms: '0.1 s' }] });
        l.status = 'Received · twice'; l.tone = 'attention';
        render();
      }, 1100);
    }
    c.phase = 'done';
    render();
  }

  /* --- B2C --- */
  var CMDS = [['BusinessPayment', 'Refunds and one-off payments to a customer', 'For refunds'], ['SalaryPayment', 'Paying staff, registered on M-Pesa or not', ''], ['PromotionPayment', 'Rewards, prizes and promotions', '']];
  function b2cSteps() {
    var b = S.b2c, r = b.run;
    var W = [['waiting', 'Sent', 'Your request'], ['waiting', 'Accepted', 'Daraja replies'], ['waiting', 'Processing', 'Money moves from your float'], ['waiting', 'Result', 'Lands at your ResultURL']];
    if (!r || b.phase === 'idle') return W;
    if (b.phase === 'sending') return [['active', 'Sent', 'POST · ' + hm(r.at)], W[1], W[2], W[3]];
    if (r.code === 'duplicate') return [['done', 'Sent', hm(r.at)], ['failed', 'Refused', '500.002.1001 · duplicate ID'], ['waiting', 'Processing', 'Never started'], ['waiting', 'Result', 'No callback follows']];
    var s = [['done', 'Sent', hm(r.at)], ['done', 'Accepted', 'ResponseCode 0' + (b.phase === 'done' ? '' : ' · not paid out yet')]];
    if (b.phase === 'accepted') return s.concat([['active', 'Processing', 'Moving money…'], W[3]]);
    if (r.code === 'timeout') return s.concat([['failed', 'Processing', 'Not processed in time'], ['failed', 'Result', 'Queue timeout · ' + Math.round((r.doneAt - r.at) / 1000) + ' s']]);
    var o = outcome('b2c', r.code);
    return s.concat([['done', 'Processing', r.code === '0' ? 'From float ' + D.SHORTCODE : 'Checked'], [r.code === '0' ? 'done' : 'failed', 'Result', 'ResultCode ' + r.code + ' · ' + o.name]]);
  }
  PAGES.b2c = function () {
    var b = S.b2c, f = b.form, r = b.run, busy = b.phase !== 'idle' && b.phase !== 'done';
    var top = b.phase === 'idle' ? banner('info', 'Your <b>SecurityCredential is ready</b>. It’s built in the browser from the test initiator, so you never type or see a password.') : '';
    if (b.phase === 'accepted') top = banner('info', '<b>Accepted is not paid out.</b> Wait for the result at your ResultURL before you mark refund ' + esc(f.occasion) + ' done.');
    if (b.phase === 'done') {
      var o = outcome('b2c', r.code);
      if (r.code === '0') top = banner('success', '<b>Paid out.</b> Receipt ' + esc(r.tx) + '. Now, and only now, mark refund ' + esc(r.occasion) + ' done.');
      else if (r.code === 'timeout') top = banner('warning', '<b>Timed out in Daraja’s queue,</b> so the notice went to your QueueTimeOutURL. No money moved. Check the transaction status before you retry, so you never pay twice.');
      else if (r.code === 'duplicate') top = banner('critical', '<b>Refused: duplicate OriginatorConversationID (500.002.1001).</b> This is a request error, not a result, so no callback follows. Use a fresh ID for every attempt.');
      else top = banner('warning', '<b>' + esc(o.name) + ' (' + r.code + ').</b> ' + esc(o.todo[0]));
    }
    var cmds = '<div class="field"><span class="field__label">CommandID</span><div class="opts" role="group" aria-label="CommandID">' + CMDS.map(function (c) {
      return '<button type="button" class="opt" data-a="b2c-cmd" data-arg="' + c[0] + '" aria-pressed="' + (f.cmd === c[0]) + '"' + (busy ? ' disabled' : '') + '><span class="opt__name"><span>' + c[0] + '</span>' + (c[2] ? lab('accent', c[2]) : '') + '</span><span class="opt__desc">' + c[1] + '</span></button>';
    }).join('') + '</div></div>';
    var outOpts = [['0', '0 · Paid out'], ['1', '1 · Not enough float'], ['2001', '2001 · Initiator invalid'], ['2040', '2040 · Not registered'], ['8006', '8006 · Credential locked'], ['timeout', 'Queue timeout'], ['duplicate', 'Duplicate request ID']];
    var form = '<section class="card bench__form" aria-label="Payout"><h2>Payout</h2>' +
      field({ id: 'b2c-init', bind: 'none', label: 'Initiator', value: 'kata_test_initiator', mono: true, readonly: true, cap: 'Test initiator for this app.' }) +
      '<div class="inset"><div class="inset__head">' + ico('shield-check') + '<span>SecurityCredential</span>' + lab('success', 'Built for you') + '</div><span class="mono muted">demo_sc_Rk9yIGRlbW8gb25seQ…x7Q=</span><span class="cap">Encrypted with sandbox.cer. Production needs production.cer, or every payout returns 2001.</span></div>' +
      cmds +
      field({ id: 'b2c-phone', bind: 'b2c.form.phone', label: 'Customer phone', value: f.phone, mono: true, options: D.PHONES.map(function (p) { return [p[0], p[0] + ' · ' + p[1]]; }), disabled: busy }) +
      field({ id: 'b2c-amount', bind: 'b2c.form.amount', label: 'Amount (KES)', value: f.amount, mono: true, inputmode: 'numeric', disabled: busy }) +
      field({ id: 'b2c-remarks', bind: 'b2c.form.remarks', label: 'Remarks', value: f.remarks, disabled: busy }) +
      '<div class="inset"><div class="inset__head">' + ico('inbox') + '<span>Where results go</span></div><div class="row"><span class="mono">ResultURL</span><span class="mono muted" style="text-align:right">…/b2c/result</span></div><div class="row"><span class="mono">QueueTimeOutURL</span><span class="mono muted" style="text-align:right">…/b2c/timeout</span></div><span class="cap">Both point at your test inbox.</span></div>' +
      field({ id: 'b2c-out', bind: 'b2c.outcome', label: 'Outcome', value: b.outcome, mono: true, cap: 'Sandbox only: choose how this test ends.', options: outOpts, disabled: busy }) +
      btn({ variant: 'primary', block: true, icon: b.phase === 'done' ? 'sync' : 'arrow-up-right', label: b.phase === 'sending' ? 'Sending…' : b.phase === 'done' ? 'Run again' : 'Send payout', action: 'b2c-send', disabled: busy }) + '</section>';
    var ph;
    if (b.phase === 'done' && r.code === '0') ph = { kind: 'sms', sms: [r.tx + ' Confirmed. You have received Ksh' + Number(r.amount).toFixed(2) + ' from KATA BARBERS on ' + dmy(r.doneAt) + '.'] };
    else if (b.phase === 'done') ph = { kind: 'idle', text: 'No money arrived' };
    else ph = { kind: 'idle', text: 'Waiting for the payout' };
    var tp = D.PHONES.filter(function (p) { return p[0] === f.phone; })[0];
    ph.label = (tp ? tp[1] : 'Phone') + ' · the customer';
    var orig = r ? r.orig : D.ids.originator(new Date());
    var codeCol = '<div class="bench__code">' + code({ tabs: { kind: 'b2c', body: D.b2c.request({ cmd: f.cmd, phone: f.phone, amount: f.amount || 0, remarks: f.remarks, occasion: f.occasion }, orig) } });
    if (r && r.response) codeCol += code({ title: r.code === 'duplicate' && b.phase === 'done' ? 'Response · refused' : 'Response · accepted, not paid out', status: r.code === 'duplicate' && b.phase === 'done' ? '500 · 0.2 s' : '200 · 0.5 s', json: r.response });
    if (r && r.result) codeCol += code({ title: 'Result · in your test inbox', status: 'ResultCode ' + r.code + ' · ' + hm(r.doneAt), json: r.result, mark: 'ResultCode' });
    if (r && r.code === 'timeout' && b.phase === 'done') codeCol += '<section class="card"><div class="card__head"><h2>QueueTimeOutURL · notice received ' + hm(r.doneAt) + '</h2>' + lab('attention', 'Timed out') + '</div><p class="cap">Daraja couldn’t process the payout in time and dropped it. Nothing reached the customer, and no result will follow.</p><div class="actions"><a class="btn" href="#/inbox/' + r.inboxId + '">' + ico('inbox') + '<span>Open in test inbox</span></a></div></section>';
    codeCol += '</div>';
    var tl = '<section class="card" aria-live="polite"><div class="card__head"><h2>Timeline</h2><span class="mono muted">' + (r ? 'ConversationID  ' + esc(r.conv) : 'No request yet') + '</span></div>' + timeline(b2cSteps()) +
      (b.phase === 'done' ? '<div class="actions">' + (r.inboxId ? '<a class="btn" href="#/inbox/' + r.inboxId + '">' + ico('inbox') + '<span>Open in test inbox</span></a>' : '') + '<a class="btn" href="#/log/' + r.logId + '">' + ico('history') + '<span>Open in request log</span></a></div>' : '') + '</section>';
    return '<div class="page">' + phead('B2C', 'Pay a customer from your float, like refunding a cancelled booking. The result comes back to your test inbox.') + top + '<div class="bench">' + form + phone(ph) + codeCol + '</div>' + tl + '</div>';
  };
  function b2cSend() {
    var b = S.b2c, f = b.form, e = {};
    if (!/^\d+$/.test(f.amount) || +f.amount < 10 || +f.amount > 250000) e['b2c-amount'] = 'Use a whole number from 10 to 250,000.';
    if (!f.remarks.trim()) e['b2c-remarks'] = 'Add a remark, like the refund’s booking code.';
    S.err = e; if (Object.keys(e).length) { render(); focusErr(); return; }
    var now = new Date(), dup = b.outcome === 'duplicate' && b.lastOrig;
    var r = { at: now.getTime(), code: b.outcome, amount: +f.amount, phone: f.phone, occasion: (f.remarks.match(/KB-\d+/) || [f.occasion])[0], conv: D.ids.conversation(now), logId: uid('l') };
    r.orig = dup ? b.lastOrig : D.ids.originator(now);
    var nf = { cmd: f.cmd, phone: f.phone, amount: f.amount, remarks: f.remarks, occasion: r.occasion };
    b.run = r; b.phase = 'sending'; S.mine.b2c.sent++;
    var l = { id: r.logId, api: 'b2c', at: r.at, tone: 'attention', status: 'Sending', amount: r.amount, phone: r.phone, idLabel: r.code === 'duplicate' ? r.orig : r.conv, took: '…', ref: r.occasion, search: [r.conv, r.orig, r.occasion], request: D.b2c.request(nf, r.orig), response: null, responseMeta: '', steps: [], callbacks: [], mine: true };
    S.log.unshift(l);
    render();
    later(function () {
      if (r.code === 'duplicate') {
        r.response = D.b2c.duplicate(); r.doneAt = Date.now(); b.phase = 'done'; S.mine.b2c.failed++;
        l.response = r.response; l.responseMeta = '500 · 0.2 s'; l.responseError = true; l.tone = 'danger'; l.status = 'Rejected · duplicate'; l.took = '0.2 s'; l.search.push('500.002.1001');
        l.steps = b2cSteps(); render(); return;
      }
      r.response = D.b2c.accepted(r.conv, r.orig); b.lastOrig = r.orig; b.phase = 'accepted';
      l.response = r.response; l.responseMeta = '200 · 0.5 s'; l.status = 'Accepted · waiting';
      render();
      later(function () {
        var t = new Date(); r.doneAt = t.getTime(); b.phase = 'done';
        var id = uid('cb'); r.inboxId = id; S.mine.b2c.result++;
        if (r.code === 'timeout') {
          S.mine.b2c.failed++;
          S.inbox.unshift({ id: id, api: 'b2c', kind: 'B2C timeout', tone: 'attention', status: 'Timed out', title: 'KES ' + kes(r.amount) + ' · refund ' + r.occasion, ref: r.occasion, idLabel: r.conv, at: r.doneAt, body: null, logId: r.logId, timeout: true, mine: true, isNew: true });
          l.tone = 'attention'; l.status = 'Timed out'; l.took = Math.round((r.doneAt - r.at) / 1000) + ' s'; l.timeoutAt = r.doneAt;
        } else {
          var o = outcome('b2c', r.code);
          r.tx = D.ids.receipt();
          r.result = D.b2c.result(o, r.conv, r.orig, nf, r.tx);
          if (r.code === '0') S.mine.b2c.paid++; else S.mine.b2c.failed++;
          S.inbox.unshift({ id: id, api: 'b2c', kind: 'B2C result', tone: r.code === '0' ? 'success' : 'danger', status: r.code === '0' ? 'Paid out' : 'Failed · ' + r.code, title: 'KES ' + kes(r.amount) + ' · refund ' + r.occasion, ref: r.occasion, idLabel: r.conv, at: r.doneAt, body: r.result, logId: r.logId, mine: true, isNew: true });
          l.callbacks = [{ title: 'Result · from Daraja', meta: 'ResultCode ' + r.code + ' · ' + hm(r.doneAt), body: r.result, inboxId: id, deliveries: [{ ok: true, at: r.doneAt, to: 'Test inbox', code: '200', ms: '0.1 s' }] }];
          l.tone = r.code === '0' ? 'success' : 'danger'; l.status = r.code === '0' ? 'Paid out' : 'Failed · ' + r.code; l.took = Math.round((r.doneAt - r.at) / 1000) + ' s'; l.search.push(r.tx);
        }
        l.steps = b2cSteps();
        firstResult(id);
        render();
      }, r.code === 'timeout' ? 3200 : 2400);
    }, 700);
  }

  /* --- Test inbox --- */
  var KIND_ICON = { stk: 'zap', c2b: 'arrow-down-left', b2c: 'arrow-up-right' };
  PAGES.inbox = function () {
    var addr = '<section class="card addr"><span class="addr__icon">' + ico('inbox', 20) + '</span><div class="addr__text"><p class="cap">Your test address · already set on every Try it form</p><p class="addr__url">' + INBOX + '</p></div>' +
      lab('success', 'Listening', true) + btn({ label: 'Copy address', icon: 'copy', action: 'copy-text', arg: INBOX }) + '</section>';
    var head = phead('Test inbox', 'Every callback Daraja sends to your test address lands here. No server, no ngrok.', S.inbox.length ? btn({ label: 'Clear inbox', icon: 'x', action: 'inbox-clear' }) : '');
    if (!S.inbox.length) {
      return '<div class="page">' + head + addr + '<section class="card empty"><span class="empty__icon">' + ico('inbox', 24) + '</span><h2>No callbacks yet</h2><p>Results from STK Push, C2B and B2C appear here the moment Daraja sends them. Send a test and watch the first one arrive.</p>' +
        '<div class="actions"><a class="btn btn--primary" href="#/stk">' + ico('zap') + '<span>Send an STK Push test</span></a><a class="btn" href="#/c2b">' + ico('arrow-down-left') + '<span>Simulate a C2B payment</span></a></div>' +
        '<div class="divider"><span class="cap">What lands here</span><div class="chips">' + [['zap', 'STK result'], ['arrow-down-left', 'C2B confirmation'], ['arrow-down-left', 'C2B validation'], ['arrow-up-right', 'B2C result'], ['arrow-up-right', 'B2C timeout']].map(function (k) { return '<span class="chip">' + ico(k[0]) + k[1] + '</span>'; }).join('') + '</div></div></section></div>';
    }
    var flt = S.ui.inboxFilter;
    var items = S.inbox.filter(function (i) { return flt === 'all' || i.api === flt; });
    var sel = find(S.inbox, S.ui.inboxSel) || items[0] || S.inbox[0];
    var first = S.firstResult && find(S.inbox, S.firstResult) && S.mine.stk.result + S.mine.c2b.confirm + S.mine.b2c.result <= 1 ? banner('success', '<b>Your first result arrived.</b> That’s the step the real sandbox never shows you.') : '';
    var list = '<section class="card card--flush split__list" aria-label="Callbacks"><div class="list__head"><div class="card__head"><h2>Callbacks</h2><span class="cap">' + S.inbox.length + ' today</span></div>' +
      seg([['all', 'All'], ['stk', 'STK Push'], ['c2b', 'C2B'], ['b2c', 'B2C']], flt, 'inbox-filter', 'Filter by API') + '</div>' +
      (items.length ? items.map(function (i) {
        return '<button type="button" class="list__item" data-a="inbox-sel" data-arg="' + i.id + '"' + (sel && sel.id === i.id ? ' aria-current="true"' : '') + '><span class="list__kind">' + ico(KIND_ICON[i.api]) + '<span>' + esc(i.kind) + '</span>' + (i.isNew ? lab('accent', 'New') : '') + '<span class="mono">' + hm(i.at) + '</span></span>' +
          '<span class="list__title"><span>' + esc(i.title) + '</span>' + lab(i.tone, i.status) + '</span><span class="list__id">' + esc(i.idLabel) + '</span></button>';
      }).join('') : '<p class="list__empty">Nothing from this API yet.</p>') + '</section>';
    return '<div class="page">' + head + first + addr + '<div class="split">' + list + '<div class="split__main">' + (sel ? inboxDetail(sel) : '') + '</div></div></div>';
  };
  function meaning(i) {
    if (i.timeout) return banner('warning', '<b>Queue timeout.</b> Daraja couldn’t process the payout in time, so the notice went to your QueueTimeOutURL. No money moved. Check the status before you retry.');
    if (i.repeat) return banner('warning', '<b>A repeat.</b> Same TransID as an earlier confirmation. Book it once, and still reply 200 so Daraja stops sending it.');
    if (i.api === 'stk') { var c = String(i.body.Body.stkCallback.ResultCode); return c === '0' ? banner('success', 'ResultCode 0, so the money moved. Read the receipt from CallbackMetadata → MpesaReceiptNumber (' + esc(i.receipt) + '), then mark the booking paid.') : banner('warning', 'ResultCode ' + c + ': ' + esc(outcome('stk', c).name.toLowerCase()) + '. There’s no CallbackMetadata, so check ResultCode before you read it.'); }
    if (i.kind === 'C2B validation') return i.reply ? banner('info', 'Daraja asked before taking the money. Your inbox answered ' + (i.reply.ResultCode === '0' ? '<b>Accept (0)</b>, so the payment went ahead.' : '<b>' + esc(i.reply.ResultCode) + '</b>, so the payment was declined.')) : banner('warning', 'Daraja asked before taking the money, and <b>nothing answered within 8 seconds</b>. Your registration choice decided what happened next.');
    if (i.api === 'c2b') return banner('success', 'The payment is complete. Book ' + esc(i.ref) + ' with TransID ' + esc(i.body.TransID) + ', and reply with ResultCode 0 and a 200.');
    var rc = String(i.body.Result.ResultCode);
    return rc === '0' ? banner('success', 'ResultCode 0, so the refund reached the customer. Mark it done now, with TransactionID ' + esc(i.body.Result.TransactionID) + '.') : banner('warning', 'ResultCode ' + rc + ': ' + esc(outcome('b2c', rc).name.toLowerCase()) + '. ' + esc(outcome('b2c', rc).todo[0]));
  }
  function inboxDetail(i) {
    var l = find(S.log, i.logId);
    var title = i.status + ' · ' + i.title;
    var out = '<section class="card" aria-label="Callback detail"><div class="dhead"><div><span class="detail__kind">' + ico(KIND_ICON[i.api]) + esc(i.kind) + '</span><span class="detail__title">' + esc(title) + '</span><span class="detail__meta">' + esc(i.idLabel) + '  ·  received ' + hm(i.at) + '</span></div>' + lab(i.tone, i.status, true) + '</div>' +
      '<div class="actions">' + (i.body ? btn({ label: 'Copy as test fixture', icon: 'copy', action: 'fixture', arg: i.id }) : '') + btn({ label: 'Resend to my URL', icon: 'sync', action: 'resend-inbox', arg: i.id }) +
      (l ? '<a class="btn btn--invisible" href="#/log/' + l.id + '">' + ico('history') + '<span>Open in request log</span></a>' : '') + '</div>' + meaning(i);
    if (i.body) {
      var mark = i.api === 'stk' ? 'ResultCode' : i.api === 'b2c' ? 'ResultCode' : 'TransID';
      if (i.reply) out += '<div class="pair">' + code({ title: 'Validation request · JSON', status: 'from Daraja', json: i.body, mark: 'BillRefNumber' }) + code({ title: 'Your inbox replied', status: 'HTTP 200', json: i.reply }) + '</div>';
      else out += code({ title: 'Callback body · JSON', status: 'POST from Daraja · your inbox replied 200', json: i.body, mark: mark });
    }
    return out + '</section>';
  }

  /* --- Request log --- */
  var STATUS_F = [['any', 'Any status'], ['ok', 'Paid or received'], ['failed', 'Failed or rejected'], ['waiting', 'Waiting'], ['timeout', 'Timed out']];
  function logMatch(l) {
    var u = S.ui;
    if (u.logApi !== 'all' && l.api !== u.logApi) return false;
    if (u.logStatus === 'ok' && !(l.tone === 'success' || l.tone === 'accent')) return false;
    if (u.logStatus === 'failed' && l.tone !== 'danger') return false;
    if (u.logStatus === 'waiting' && !/waiting|Sending|Paying/.test(l.status)) return false;
    if (u.logStatus === 'timeout' && l.status !== 'Timed out') return false;
    var q = u.logQ.trim().toLowerCase();
    if (q) { var hay = (l.search || []).concat([l.idLabel, l.ref || '']).join(' ').toLowerCase(); if (hay.indexOf(q) === -1) return false; }
    return true;
  }
  var API_NAME = { stk: 'STK Push', c2b: 'C2B', b2c: 'B2C' };
  PAGES.log = function () {
    var u = S.ui;
    var rows = S.log.filter(logMatch);
    var sel = u.logSel ? find(S.log, u.logSel) : null;
    if (sel && !logMatch(sel)) sel = null;
    var filtered = u.logApi !== 'all' || u.logStatus !== 'any';
    var toolbar = '<div class="toolbar"><form class="search" data-form="logq" role="search">' + ico('search') + '<input id="log-q" data-in="ui.logQ" value="' + esc(u.logQ) + '" placeholder="Search by CheckoutRequestID, TransID, receipt or ConversationID" aria-label="Search the request log"></form>' +
      seg([['all', 'All'], ['stk', 'STK Push'], ['c2b', 'C2B'], ['b2c', 'B2C']], u.logApi, 'log-api', 'Filter by API') +
      '<div class="field" style="flex:none"><label class="sr-only" for="log-status">Status</label><select id="log-status" data-in="ui.logStatus">' + STATUS_F.map(function (s) { return '<option value="' + s[0] + '"' + (s[0] === u.logStatus ? ' selected' : '') + '>' + s[1] + '</option>'; }).join('') + '</select></div>' +
      (u.logQ || filtered ? btn({ variant: 'invisible', label: u.logQ ? 'Clear search' : 'Clear filters', action: 'log-clear' }) : '') + '</div>';
    var body;
    if (!rows.length && u.logQ) {
      body = '<section class="card empty"><span class="empty__icon empty__icon--grey">' + ico('search', 24) + '</span><h2>No request matches that ID</h2><p class="mono">' + esc(u.logQ) + '</p>' +
        '<p>The log holds this app’s sandbox requests from the last 30 days. Production IDs won’t show here. Try the TransID from the customer’s SMS, or a ConversationID.</p>' +
        '<div class="actions">' + btn({ label: 'Clear search', action: 'log-clear' }) + '<a class="btn" href="#/inbox">' + ico('inbox') + '<span>Search the test inbox</span></a></div></section>';
    } else {
      body = '<section class="card card--flush"><div class="tbl__wrap"><table class="tbl"><thead><tr><th>Time</th><th>API</th><th>Status</th><th class="num">Amount (KES)</th><th>Phone</th><th>ID</th><th class="num">Took</th></tr></thead><tbody>' +
        (rows.length ? rows.map(function (l) {
          return '<tr data-a="log-sel" data-arg="' + l.id + '" tabindex="0"' + (sel && sel.id === l.id ? ' aria-selected="true"' : '') + '><td class="m">' + hm(l.at) + '</td><td><span class="api">' + ico(KIND_ICON[l.api]) + API_NAME[l.api] + '</span></td><td>' + lab(l.tone, l.status) + '</td>' +
            '<td class="num m">' + kes(l.amount) + '</td><td class="m muted">' + maskPhone(l.phone) + '</td><td class="m id">' + esc(l.idLabel) + '</td><td class="num m muted">' + (/waiting/.test(l.status) ? ico('clock') + ' ' : '') + esc(l.took) + '</td></tr>';
        }).join('') : '<tr><td colspan="7" class="muted">Nothing matches these filters.</td></tr>') + '</tbody></table></div>' +
        '<div class="tbl__foot"><span>' + (u.logQ && rows.length === 1 && sel ? '1 match · ' + esc(u.logQ) + ' is in this request' : (rows.length === S.log.length ? S.log.length + ' requests' : rows.length + ' of ' + S.log.length + ' requests')) + '</span><span>Sandbox · last 30 days · earlier rows are Achieng’s tests from this morning</span></div></section>';
      if (sel) body += inspector(sel);
      else if (rows.length) body += '<p class="cap">Open a row to see the request, the reply and every callback side by side.</p>';
    }
    return '<div class="page">' + phead('Request log', 'Every request across STK Push, C2B and B2C, with the reply and every callback it got.') + toolbar + body + '</div>';
  };
  function inspector(l) {
    var path = { stk: 'POST /mpesa/stkpush/v1/processrequest', b2c: 'POST /mpesa/b2c/v3/paymentrequest' }[l.api] || (l.path === 'register' ? 'POST /mpesa/c2b/v2/registerurl' : 'POST /mpesa/c2b/v2/simulate');
    var t = l.status + (l.amount != null ? ' · KES ' + kes(l.amount) : '') + (l.ref ? ' · ' + l.ref : '');
    var info = '';
    if (l.undelivered) info = banner('warning', '<b>' + (l.tone === 'success' ? 'Paid, but your server never got the result.' : 'Your server never got the result.') + '</b> ' + esc(l.ownUrl) + ' answered 502' + times(ownCb(l).deliveries.filter(function (d) { return !d.ok; }).length) + ', so booking ' + esc(l.ref) + ' still says unpaid. Fix the endpoint, then resend.');
    else if (l.ownUrl && l.callbacks.length) info = banner('success', 'Delivered to ' + esc(l.ownUrl) + '. Your server answered 200.');
    else if (l.responseError) info = banner('critical', '<b>Refused before it ran.</b> A repeated OriginatorConversationID returns 500.002.1001. It’s a request error, so no callback follows.');
    else if (l.timeoutAt) info = banner('warning', '<b>Queue timeout at ' + hm(l.timeoutAt) + '.</b> The notice went to your QueueTimeOutURL and no money moved. Check the status before you retry.');
    else if (l.tone === 'danger' && l.callbacks.length) info = banner('warning', 'Failed results have no ' + (l.api === 'stk' ? 'CallbackMetadata' : 'ResultParameters') + '. Check ResultCode before you read it.');
    var acts = '<div class="actions">' + (l.ownUrl ? btn({ variant: l.undelivered ? 'primary' : '', label: 'Resend to my URL', icon: 'sync', action: 'resend-log', arg: l.id }) : '') +
      (l.callbacks.length ? '<a class="btn" href="#/inbox/' + l.callbacks[l.callbacks.length - 1].inboxId + '">' + ico('inbox') + '<span>Open in test inbox</span></a>' + btn({ label: 'Copy as test fixture', icon: 'copy', action: 'fixture-log', arg: l.id }) : '') +
      (l.undelivered ? '<label class="toggle"><input type="checkbox" data-a="server-up"' + (S.serverUp ? ' checked' : '') + '> My server is fixed (simulated)</label>' : '') + '</div>';
    var left = '<div class="stack">' + code({ title: 'Request · you sent', status: hm(l.at), json: l.request }) +
      (l.response ? code({ title: l.responseError ? 'Response · refused' : 'Response · ' + (l.api === 'c2b' ? 'accepted' : 'accepted, not ' + (l.api === 'b2c' ? 'paid out' : 'paid')), status: l.responseMeta, json: l.response }) : '') + '</div>';
    var right = '<div class="stack">' + (l.callbacks.length ? l.callbacks.map(function (c) {
      return code({ title: c.title, status: c.meta, json: c.body, mark: l.api === 'c2b' ? 'TransID' : 'ResultCode' }) + '<section class="card"><h2>Where this went</h2><div class="deliv">' + c.deliveries.map(function (d) {
        return '<div class="deliv__row"><span class="' + (d.ok ? 'ok' : 'bad') + '">' + ico(d.ok ? 'check-circle' : 'x-circle') + '</span><span class="muted">' + hm(d.at) + '</span><span>' + esc(d.to) + '</span><span class="' + (d.ok ? 'ok' : 'bad') + '">' + esc(d.code) + ' · ' + esc(d.ms) + '</span></div>';
      }).join('') + '</div></section>';
    }).join('') : '<section class="card"><h2>Callbacks</h2><p class="cap">' + (l.status === 'URLs registered' ? 'Registering URLs doesn’t send a callback.' : l.responseError ? 'None. The request was refused before it ran.' : l.timeoutAt ? 'No result. The queue timeout notice went to your QueueTimeOutURL.' : 'Nothing yet. Results usually arrive within seconds in sandbox.') + '</p></section>') + '</div>';
    return '<section class="card fade-in" id="inspector" aria-label="Request detail"><div class="dhead"><div><span class="detail__kind">' + ico(KIND_ICON[l.api]) + API_NAME[l.api] + ' · ' + path + '</span><span class="detail__title">' + esc(t) + '</span><span class="detail__meta">' + esc(l.idLabel) + '</span></div>' + lab(l.tone, l.status, true) + '</div>' +
      info + acts + (l.steps && l.steps.length ? timeline(l.steps) : '') + '<div class="pair">' + left + right + '</div></section>';
  }
  function ownCb(l) { return l.callbacks.filter(function (c) { return c.deliveries.some(function (d) { return d.to === l.ownUrl; }); })[0] || l.callbacks[0]; }
  function times(n) { return n < 2 ? '' : ' ' + (['', '', 'twice', 'three times', 'four times', 'five times'][n] || n + ' times'); }
  function resend(l) {
    var c = ownCb(l); if (!c || !l.ownUrl) return;
    var now = Date.now(), ok = S.serverUp;
    c.deliveries.push({ ok: ok, at: now, to: l.ownUrl, code: ok ? '200' : '502', ms: ok ? '0.3 s' : '1.8 s' });
    if (ok) { l.undelivered = false; l.steps = l.steps.map(function (s) { return s[1] === 'Delivered to your URL' ? ['done', s[1], '200 · resent ' + hm(now)] : s; }); toast('Resent. Your server answered 200, so booking ' + (l.ref || '') + ' can be marked paid.'); }
    else toast('Resent, and your server answered 502 again (simulated). Tick “My server is fixed” to try a working server.');
    render();
  }

  /* --- Failures --- */
  PAGES.failures = function () {
    var api = S.ui.failApi, list = D.OUT[api];
    var o = outcome(api, S.ui.failCode);
    if (o.code !== S.ui.failCode) S.ui.failCode = o.code;
    var tabs = '<div class="toolbar">' + seg([['stk', 'STK Push'], ['c2b', 'C2B'], ['b2c', 'B2C']], api, 'fail-api', 'API') + '<span class="cap">Each outcome is also in the Outcome menu on Try it, so you can trigger it in sandbox.</span></div>';
    var note = banner('info', '<b>Same number, different meaning:</b> 2001 is a wrong PIN in STK Push and a bad initiator credential in B2C. Codes here are always explained within their own API.');
    var lst = '<section class="card card--flush split__list" aria-label="Outcomes"><div class="list__head"><div class="card__head"><h2>' + API_NAME[api] + ' outcomes</h2><span class="cap">' + list.length + '</span></div></div>' + list.map(function (x) {
      return '<button type="button" class="olist__item" data-a="fail-sel" data-arg="' + x.code + '"' + (x.code === o.code ? ' aria-current="true"' : '') + '><span class="olist__code" style="color:var(--' + (x.tone === 'success' ? 'success' : x.tone === 'attention' ? 'attention' : 'danger') + ')">' + esc(/^\d|^C2B/.test(x.code) ? x.code : '—') + '</span><span class="olist__text"><b>' + esc(x.name) + '</b><span>' + esc(x.hint) + '</span></span>' + ico('chevron-down') + '</button>';
    }).join('') + '</section>';
    var payload = failPayload(api, o);
    var ph = o.code === '0' ? { kind: 'sms', sms: [api === 'stk' ? 'DEMO7Q2K9X Confirmed. Ksh500.00 paid to KATA BARBERS for account KB-2041.' : api === 'c2b' ? 'DEMO8H3L1P Confirmed. Ksh800.00 sent to KATA BARBERS for account KB-2042.' : 'DEMO9R4T2M Confirmed. You have received Ksh500.00 from KATA BARBERS.'] } :
      o.code === 'replay' ? { kind: 'sms', sms: ['DEMO8H3L1P Confirmed. Ksh800.00 sent to KATA BARBERS for account KB-2042.'] } : { kind: 'idle', text: o.saw };
    ph.label = 'What the customer saw';
    var detail = '<section class="card split__main" aria-label="Outcome detail"><div class="dhead"><div><span class="detail__kind">' + ico(KIND_ICON[api]) + API_NAME[api] + (/^\d|^C2B/.test(o.code) ? ' · ResultCode ' + o.code : '') + '</span><span class="detail__title">' + esc(o.name) + '</span><span class="muted">' + esc(o.saw) + '</span></div>' +
      btn({ variant: 'primary', icon: KIND_ICON[api], label: 'Trigger in Try it', action: 'trigger', arg: o.code }) + '</div>' +
      '<div class="saw">' + phone(ph) + '<div class="stack" style="flex:1">' + payload +
      '<div class="inset"><span class="inset__head">What your code should do</span><ul class="todo">' + o.todo.map(function (t) { return '<li>' + ico('check') + '<span>' + esc(t) + '</span></li>'; }).join('') + '</ul></div>' +
      code({ title: 'Handle it · Node.js', status: 'Example', text: D.SNIPPETS[api] }) + '</div></div></section>';
    return '<div class="page">' + phead('Failures', 'Every way a test can end, with what the customer saw, the exact payload and what your code should do.') + tabs + note + '<div class="split">' + lst + detail + '</div></div>';
  };
  function failPayload(api, o) {
    var d = new Date();
    if (api === 'stk') return code({ title: 'Exact payload', status: o.code === '0' ? 'With CallbackMetadata' : 'No CallbackMetadata', json: D.stk.callback(o, 'DEMO-4b64-97ff', 'ws_CO_DEMO_1811085120', { amount: 500, phone: '254700000001' }, 'DEMO7Q2K9X', d), mark: 'ResultCode' });
    if (api === 'c2b') {
      var f = { phone: '254700000003', amount: 800, account: o.code === 'C2B00012' ? 'KB-9999' : 'KB-2042' };
      if (o.code === 'down') return code({ title: 'Validation request', status: 'Unanswered for 8 s', json: D.c2b.notice(f, 'DEMO3V8N2C', d), mark: 'BillRefNumber' });
      if (o.code === '0' || o.code === 'replay') return code({ title: o.code === 'replay' ? 'Confirmation · arrives twice' : 'Your reply to validation', status: o.code === 'replay' ? 'Same TransID' : 'HTTP 200', json: o.code === 'replay' ? D.c2b.notice(f, 'DEMO8H3L1P', d) : { ResultCode: '0', ResultDesc: 'Accepted' }, mark: 'TransID' });
      return code({ title: 'Your reply to validation', status: 'HTTP 200', json: { ResultCode: o.code, ResultDesc: 'Rejected' } });
    }
    if (o.code === 'timeout') return '<section class="card"><h2>QueueTimeOutURL notice</h2><p class="cap">Arrives at your QueueTimeOutURL instead of a result. Nothing reached the customer, and no result follows.</p></section>';
    if (o.code === 'duplicate') return code({ title: 'Response · refused', status: '500', json: D.b2c.duplicate() });
    return code({ title: 'Exact payload', status: o.code === '0' ? 'With ResultParameters' : 'No ResultParameters', json: D.b2c.result(o, 'AG_DEMO_1811092030', 'DEMO-b2c-1811092030', { amount: 500 }, 'DEMO9R4T2M'), mark: 'ResultCode' });
  }

  /* --- Go-live --- */
  PAGES['go-live'] = function () {
    var ch = checks(), done = ch.filter(function (c) { return c[1]; }).length;
    return '<div class="page">' + phead('Go-live', 'Production stays locked until the tests below pass and your business owner approves it.', lab('default', 'Locked', true)) +
      '<div class="split"><section class="card split__main"><div class="card__head"><h2>Readiness</h2><span class="cap">' + done + ' of 6 done</span></div><div class="meter"><span style="width:' + Math.round(done / 6 * 100) + '%"></span></div>' +
      '<ul class="checks">' + ch.map(function (c) { return '<li>' + (c[1] ? '<span class="ok">' + ico('check-circle') + '</span>' : '<span class="muted">' + ico('dot-fill') + '</span>') + '<div><b>' + c[0] + '</b><span>' + (c[1] ? 'Done in sandbox' : 'Ticks itself when you run it on Try it') + '</span></div></li>'; }).join('') + '</ul></section>' +
      '<aside class="split__list stack"><section class="card"><h2>Only the business owner can</h2><ul class="checks"><li><span class="muted">' + ico('lock') + '</span><div><b>Approve go-live</b><span>With their M-Pesa business admin login and a one-time code</span></div></li><li><span class="muted">' + ico('lock') + '</span><div><b>Set up the B2C initiator</b><span>And build the production credential with production.cer</span></div></li></ul>' +
      btn({ label: 'Invite the owner', icon: 'link-external', action: 'toast', arg: 'In a real portal this would email the owner. Nothing is sent in this concept.' }) + '</section>' +
      '<div class="banner banner--info">' + ico('alert') + '<div>Production approval can take up to a working day, so invite the owner before your last day of testing.</div></div></aside></div></div>';
  };

  /* ---------- Render ---------- */
  var rendering = false, again = false;
  function render() {
    if (rendering) { again = true; return; }
    rendering = true;
    try { paint(); } finally { rendering = false; }
    if (again) { again = false; setTimeout(render, 0); }
  }
  function paint() {
    var a = document.activeElement, fid = a && a.id, ss = null, se = null;
    try { if (fid && a.selectionStart != null) { ss = a.selectionStart; se = a.selectionEnd; } } catch (e) { /* select */ }
    COPY = {};
    renderSide(); renderTop();
    var page = PAGES[S.route] || PAGES['get-started'];
    $('#view').innerHTML = page();
    if (fid) { var el = document.getElementById(fid); if (el) { el.focus({ preventScroll: true }); try { if (ss != null) el.setSelectionRange(ss, se); } catch (e) { /* select */ } } }
    document.title = (TITLES[S.route] || TITLES['get-started'])[1] + ' · Daraja, reimagined · Unsolicited concept · Ted Thie';
    save();
  }
  function focusErr() { var el = document.querySelector('.field--invalid input, .field--invalid select'); if (el) el.focus(); }

  /* ---------- Routing ---------- */
  function route() {
    var h = (location.hash || '#/get-started').replace(/^#\//, '').split('/');
    var r = h[0] || 'get-started';
    if (!PAGES[r]) r = 'get-started';
    var changed = r !== S.route;
    S.route = r; S.err = changed ? {} : S.err; S.ui.navOpen = false;
    if (r === 'inbox' && h[1]) { S.ui.inboxSel = h[1]; S.ui.inboxFilter = 'all'; }
    if (r === 'log' && h[1]) { S.ui.logSel = h[1]; }
    if (r !== 'c2b') S.c2b.justRegistered = false;
    if (r === 'inbox') later(function () { S.inbox.forEach(function (i) { i.isNew = false; }); save(); }, 4000);
    render();
    if (changed) $('#view').scrollTop = 0;
    if (r === 'log' && h[1]) later(function () { var el = $('#inspector'); if (el) el.scrollIntoView({ block: 'start', behavior: REDUCED ? 'auto' : 'smooth' }); }, 60);
  }
  function go(path) { if (location.hash === '#/' + path) route(); else location.hash = '#/' + path; }

  /* ---------- Events ---------- */
  function setPath(path, val) { var p = path.split('.'), o = S; for (var i = 0; i < p.length - 1; i++) o = o[p[i]]; o[p[p.length - 1]] = val; }
  var ACT = {
    toast: function (arg) { toast(arg); },
    nav: function () { S.ui.navOpen = !S.ui.navOpen; renderSide(); },
    env: function (arg) { if (arg === 'production') { toast('Production unlocks after go-live.'); go('go-live'); } },
    lang: function (arg) { S.ui.lang = arg; render(); },
    copy: function (arg) { copy(COPY[arg] || ''); },
    'copy-text': function (arg) { copy(arg, 'Address copied'); },
    'key-show': function (arg) { S.keys.show[arg] = !S.keys.show[arg]; render(); },
    'key-copy': function (arg) { copy(S.keys[arg], 'Copied. It only works in this concept’s sandbox.'); S.keys.copied = arg; render(); later(function () { S.keys.copied = ''; render(); }, 1800); },
    'key-regen': function () { S.keys.cs = 'demo_cs_' + Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 12); S.keys.show.cs = true; toast('New secret made. The old one has stopped working.'); render(); },
    'stk-send': function () { stkSend(); },
    'stk-phone': function (arg) { if (S.stk.phase !== 'prompt') return; var oc = S.stk.run.outcome; stkFinish(arg === 'cancel' ? '1032' : (oc === '1' || oc === '2001' ? oc : '0')); },
    'c2b-rt': function (arg) { S.c2b.reg.responseType = arg; render(); },
    'c2b-register': function () { c2bRegister(); },
    'c2b-edit': function (arg) { S.c2b.editReg = arg === 'on'; S.c2b.justRegistered = false; S.err = {}; render(); },
    'c2b-send': function () { c2bSend(); },
    'c2b-again': function () { S.c2b.phase = 'idle'; S.c2b.run = null; render(); },
    'c2b-fix': function () { S.c2b.phase = 'idle'; S.c2b.run = null; S.c2b.reply = '0'; S.c2b.form.account = 'KB-2042'; render(); },
    'b2c-cmd': function (arg) { S.b2c.form.cmd = arg; render(); },
    'b2c-send': function () { b2cSend(); },
    'inbox-filter': function (arg) { S.ui.inboxFilter = arg; S.ui.inboxSel = ''; render(); },
    'inbox-sel': function (arg) { S.ui.inboxSel = arg; var i = find(S.inbox, arg); if (i) i.isNew = false; render(); },
    'inbox-clear': function () { S.inbox = []; S.ui.inboxSel = ''; toast('Inbox cleared. New results will still arrive here.'); render(); },
    fixture: function (arg) { var i = find(S.inbox, arg); if (i && i.body) copy(JSON.stringify(i.body, null, 2), 'Copied as a test fixture'); },
    'fixture-log': function (arg) { var l = find(S.log, arg); if (l && l.callbacks.length) copy(JSON.stringify(l.callbacks[l.callbacks.length - 1].body, null, 2), 'Copied as a test fixture'); },
    'resend-inbox': function (arg) { var i = find(S.inbox, arg), l = i && find(S.log, i.logId); if (l && l.ownUrl) { resend(l); } else toast('This callback went to your test inbox only. Set your own callback URL on Try it to resend to your server.'); },
    'resend-log': function (arg) { var l = find(S.log, arg); if (l) resend(l); },
    'server-up': function (arg, el) { S.serverUp = !!el.checked; toast(S.serverUp ? 'Your server will answer 200 now. Resend to try it.' : 'Your server will answer 502 again.'); save(); },
    'log-api': function (arg) { S.ui.logApi = arg; S.ui.logSel = ''; render(); },
    'log-sel': function (arg) { S.ui.logSel = S.ui.logSel === arg ? '' : arg; history.replaceState(null, '', '#/log' + (S.ui.logSel ? '/' + arg : '')); render(); if (S.ui.logSel) later(function () { var el = $('#inspector'); if (el) el.scrollIntoView({ block: 'start', behavior: REDUCED ? 'auto' : 'smooth' }); }, 30); },
    'log-clear': function () { S.ui.logQ = ''; S.ui.logApi = 'all'; S.ui.logStatus = 'any'; S.ui.logSel = ''; history.replaceState(null, '', '#/log'); render(); },
    'fail-api': function (arg) { S.ui.failApi = arg; S.ui.failCode = D.OUT[arg][1].code; render(); },
    'fail-sel': function (arg) { S.ui.failCode = arg; render(); },
    trigger: function (arg) {
      var api = S.ui.failApi;
      if (api === 'stk') { S.stk.outcome = arg; if (S.stk.phase === 'done') { S.stk.phase = 'idle'; S.stk.run = null; } }
      if (api === 'c2b') {
        S.c2b.phase = 'idle'; S.c2b.run = null;
        if (arg === 'down') { S.c2b.reply = 'down'; } else if (arg === 'replay') S.c2b.reply = 'replay'; else S.c2b.reply = arg;
        if (arg === 'C2B00012') S.c2b.form.account = 'KB-9999';
      }
      if (api === 'b2c') { S.b2c.outcome = arg; if (S.b2c.phase === 'done') { S.b2c.phase = 'idle'; S.b2c.run = null; } if (arg === 'duplicate' && !S.b2c.lastOrig) S.b2c.lastOrig = 'DEMO-b2c-' + D.stamp(new Date()).slice(6); }
      toast('Outcome set. Send the test to see it.');
      go(api);
    }
  };
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-a]');
    if (t && t.closest('#app')) {
      var a = t.getAttribute('data-a');
      if (a === 'server-up') return;
      if (ACT[a]) { e.preventDefault(); ACT[a](t.getAttribute('data-arg'), t); }
      return;
    }
    if (e.target.closest('[data-reset]')) {
      timers.forEach(clearTimeout); timers = [];
      try { localStorage.removeItem(STORE); } catch (err) { /* ignore */ }
      S = fresh(); go('get-started'); toast('Demo reset.');
      return;
    }
    if (e.target.closest('#scrim')) { S.ui.navOpen = false; renderSide(); }
    var navLink = e.target.closest('.nav__item[href], .ready, .side__new a');
    if (navLink && S.ui.navOpen) { S.ui.navOpen = false; renderSide(); }
  });
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.getAttribute('data-a') === 'server-up') { ACT['server-up'](null, t); return; }
    var b = t.getAttribute('data-in');
    if (!b || b === 'none' || t.tagName !== 'SELECT') return;
    setPath(b, t.value);
    if (t.id) delete S.err[t.id];
    render();
  });
  document.addEventListener('input', function (e) {
    var t = e.target, b = t.getAttribute('data-in');
    if (!b || b === 'none' || t.tagName === 'SELECT') return;
    setPath(b, t.value);
    if (t.id && S.err[t.id]) delete S.err[t.id];
    render();
  });
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if ((e.key === 'Enter' || e.key === ' ') && t.matches && t.matches('tr[data-a]')) { e.preventDefault(); ACT['log-sel'](t.getAttribute('data-arg')); }
    if (e.key === 'Escape' && S.ui.navOpen) { S.ui.navOpen = false; renderSide(); }
  });
  document.addEventListener('submit', function (e) {
    var f = e.target.getAttribute('data-form');
    if (!f) return;
    e.preventDefault();
    if (f === 'search') { var q = $('#q-top').value.trim(); S.ui.logQ = q; S.ui.logApi = 'all'; S.ui.logStatus = 'any'; var m = S.log.filter(logMatch); S.ui.logSel = m.length === 1 ? m[0].id : ''; go('log' + (S.ui.logSel ? '/' + S.ui.logSel : '')); }
    if (f === 'logq') { var m2 = S.log.filter(logMatch); if (m2.length === 1) ACT['log-sel'](m2[0].id); }
  });
  window.addEventListener('hashchange', route);

  S = load();
  route();
})();
