/* Ted Thie portfolio: small, dependency-free behaviours.
   Each block only runs when its markup is on the page. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function store(kind) {
    try { return window[kind]; } catch (e) { return null; }
  }
  function storeGet(key) {
    var s = store('sessionStorage');
    try { return s ? s.getItem(key) : null; } catch (e) { return null; }
  }
  function storeSet(key, value) {
    var s = store('sessionStorage');
    try { if (s) s.setItem(key, value); } catch (e) { /* storage blocked: the page still works */ }
  }

  /* ---------- Hero rotator (Home) ---------- */
  function initRotator() {
    var box = document.querySelector('[data-rotator]');
    if (!box) return;
    var lines = box.querySelectorAll('.rotator__line');
    if (lines.length < 2 || reduceMotion) return;
    var i = 0;
    setInterval(function () {
      var out = lines[i];
      i = (i + 1) % lines.length;
      out.classList.remove('is-current');
      out.classList.add('is-leaving');
      lines[i].classList.add('is-current');
      setTimeout(function () { out.classList.remove('is-leaving'); }, 700);
    }, 2800);
  }

  /* ---------- Bill settler (KenyaEMR) ---------- */
  function initTill() {
    var till = document.querySelector('[data-till]');
    if (!till) return;
    var due = Number(till.getAttribute('data-due')) || 0;
    var methods = till.querySelectorAll('[data-method]');
    var range = till.querySelector('#till-amount');
    var amountOut = till.querySelector('[data-amount]');
    var methodOut = till.querySelector('[data-method-name]');
    var maxOut = till.querySelector('[data-max]');
    var payBtn = till.querySelector('[data-pay]');
    var resetBtn = till.querySelector('[data-reset]');
    var ledger = document.querySelector('[data-ledger]');
    var list = ledger.querySelector('[data-payments]');
    var empty = ledger.querySelector('[data-empty]');
    var balanceOut = ledger.querySelector('[data-balance]');
    var done = ledger.querySelector('[data-done]');

    var state = { method: 'Waiver', payments: [], amount: null };

    function balance() {
      return Math.max(0, due - state.payments.reduce(function (s, p) { return s + p.value; }, 0));
    }
    function currentAmount(bal) {
      if (state.amount != null) return Math.min(state.amount, bal);
      return state.payments.length ? bal : Math.min(200, bal);
    }
    function render() {
      var bal = balance();
      var amount = currentAmount(bal);
      range.max = String(bal);
      range.value = String(amount);
      range.disabled = bal === 0;
      amountOut.textContent = String(amount);
      methodOut.textContent = state.method;
      maxOut.textContent = String(bal);
      payBtn.disabled = amount <= 0;
      methods.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-method') === state.method)); });
      list.innerHTML = '';
      state.payments.forEach(function (p) {
        var row = document.createElement('div');
        row.className = 'ledger__row';
        var a = document.createElement('span'); a.textContent = p.method;
        var b = document.createElement('span'); b.textContent = (p.method === 'Waiver' ? 'Waived ' : 'Paid ') + p.value;
        row.appendChild(a); row.appendChild(b); list.appendChild(row);
      });
      empty.hidden = state.payments.length > 0;
      balanceOut.textContent = bal + ' KSH';
      done.hidden = bal !== 0;
    }
    methods.forEach(function (b) {
      b.addEventListener('click', function () { state.method = b.getAttribute('data-method'); render(); });
    });
    range.addEventListener('input', function () { state.amount = Number(range.value); render(); });
    payBtn.addEventListener('click', function () {
      var amount = currentAmount(balance());
      if (amount <= 0) return;
      state.payments.push({ method: state.method, value: amount });
      state.amount = null;
      if (state.method === 'Waiver') state.method = 'Mobile money';
      render();
    });
    resetBtn.addEventListener('click', function () {
      state = { method: 'Waiver', payments: [], amount: null };
      render();
    });
    render();
  }

  /* ---------- Journey stepper (KenyaEMR, Forecasting) ---------- */
  function initJourney(scope) {
    (scope || document).querySelectorAll('[data-journey]').forEach(initOneJourney);
  }
  function initOneJourney(box) {
    var steps = box.querySelectorAll('[data-step]');
    var img = box.querySelector('[data-step-img]');
    var num = box.querySelector('[data-step-n]');
    var title = box.querySelector('[data-step-title]');
    var text = box.querySelector('[data-step-text]');
    var i = 0;
    function show(k) {
      i = (k + steps.length) % steps.length;
      var s = steps[i];
      img.src = s.getAttribute('data-img');
      img.alt = s.getAttribute('data-alt');
      num.textContent = String(i + 1).padStart(2, '0');
      title.textContent = s.getAttribute('data-title');
      text.textContent = s.getAttribute('data-text');
      steps.forEach(function (b, n) { b.setAttribute('aria-pressed', String(n === i)); });
    }
    steps.forEach(function (b, n) {
      b.addEventListener('click', function () { show(n); });
      var pre = new Image(); pre.src = b.getAttribute('data-img');
    });
    box.querySelector('[data-step-prev]').addEventListener('click', function () { show(i - 1); });
    box.querySelector('[data-step-next]').addEventListener('click', function () { show(i + 1); });
    show(0);
  }

  /* ---------- Read the score (Hiring intelligence) ----------
     Each row carries its band as 10 letters, one per STEN score:
     G desirable, A borderline, R below or above the band, D deterrent. */
  var BAND_WORD = { G: 'Strong pass', A: 'Borderline', R: 'Does not meet', D: 'Deterrent' };
  function initBands(scope) {
    var box = (scope || document).querySelector('[data-bands-demo]');
    if (!box) return;
    var range = box.querySelector('#band-score');
    var out = box.querySelector('[data-band-score]');
    var sum = box.querySelector('[data-band-summary]');
    var rows = box.querySelectorAll('[data-band]');
    rows.forEach(function (row) {
      var bar = row.querySelector('[data-band-bar]');
      row.getAttribute('data-band').split('').forEach(function (k, i) {
        var s = document.createElement('span');
        s.className = 'bands__seg bands__seg--' + k;
        s.setAttribute('data-n', String(i + 1));
        bar.appendChild(s);
      });
    });
    function render() {
      var v = Number(range.value), tally = { G: 0, A: 0, R: 0, D: 0 };
      out.textContent = String(v);
      rows.forEach(function (row) {
        var k = row.getAttribute('data-band').charAt(v - 1);
        tally[k]++;
        row.querySelectorAll('.bands__seg').forEach(function (s, i) { s.classList.toggle('is-on', i === v - 1); });
        var chip = row.querySelector('[data-band-chip]');
        chip.className = 'bands__chip bands__chip--' + k;
        chip.innerHTML = '<b>' + v + '</b>' + BAND_WORD[k];
      });
      var kinds = Object.keys(tally).filter(function (k) { return tally[k]; });
      if (kinds.length === 1) {
        var all = { G: 'a strong pass', A: 'borderline', R: 'outside the band', D: 'a deterrent' }[kinds[0]];
        sum.textContent = 'The same ' + v + ' is ' + all + ' on all five.';
        return;
      }
      var parts = [];
      [['G', 'strong pass', 'strong passes'], ['A', 'borderline', 'borderline'], ['R', 'outside the band', 'outside the band'], ['D', 'deterrent', 'deterrents']].forEach(function (t) {
        var n = tally[t[0]];
        if (n) parts.push(n + ' ' + (n === 1 ? t[1] : t[2]));
      });
      sum.textContent = 'The same ' + v + ' reads as ' + parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1] + '.';
    }
    range.addEventListener('input', render);
    render();
  }

  /* ---------- Mark a moment (Alinkeo) ----------
     A stand-in player: transcript lines carry a start time in seconds; every saved
     moment points at a line, so it can take you back there. */
  var LESSON_TOTAL = 1240;
  var LESSON_LINES = [
    [0, "In today's training, we're going to go through the component panels."],
    [42, 'Panels are great for calling attention to areas of your form by using colours.'],
    [95, "A good example is when you'd like a border around your components."],
    [150, 'Panels are also used when you create a wizard form.'],
    [260, "Today we'll go over how to create and use panels."],
    [310, "We'll show you how to add a panel from the Components list."],
    [395, 'Open the layout drop-down, then drag the panel onto your form.'],
    [485, 'A panel wraps a group of fields with a title and styling.'],
    [590, 'It can also give a section an accordion-style look.'],
    [685, 'Themes change the colours of certain components.'],
    [770, 'From the Display tab, choose the theme drop-down and pick another theme.'],
    [860, 'Select Save, and the panel takes on its new colours.'],
    [955, 'You can also embed a formula directly in any web application you build.'],
    [1060, "That's the code that keeps your application working properly."],
    [1150, "Next lesson, we'll use panels to build a wizard, step by step."]
  ];
  var MOMENT_KIND = {
    note: { word: 'Note', act: 'Take a note', ph: 'Write a note', save: 'Save note', said: 'Note saved' },
    comment: { word: 'Comment', act: 'Comment', ph: 'Say something to the class', save: 'Post', said: 'Comment posted' },
    question: { word: 'Question', act: 'Ask a question', ph: 'Ask the instructor', save: 'Send', said: 'Question sent' },
    pin: { word: 'Pin', act: 'Drop a pin', ph: 'Label this pin (optional)', save: 'Drop pin', said: 'Pin dropped' }
  };
  function mmss(s) { s = Math.max(0, Math.round(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
  function initLesson(scope) {
    var box = (scope || document).querySelector('[data-lesson]');
    if (!box) return;
    var linesEl = box.querySelector('[data-lines]');
    var nowEl = box.querySelector('[data-now]');
    var timeEl = box.querySelector('[data-time]');
    var fillEl = box.querySelector('[data-fill]');
    var marksEl = box.querySelector('[data-marks]');
    var track = box.querySelector('[data-track]');
    var playBtn = box.querySelector('[data-play]');
    var listEl = box.querySelector('[data-moments]');
    var countEl = box.querySelector('[data-count]');
    var q = box.querySelector('[data-q]');
    var hitsEl = box.querySelector('[data-hits]');
    var prevBtn = box.querySelector('[data-hit-prev]');
    var nextBtn = box.querySelector('[data-hit-next]');
    var sayEl = box.querySelector('[data-say]');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var st = {
      time: 0, cur: 0, open: -1, kind: null, timer: null, hits: [], hit: -1, fresh: null,
      moments: [
        { kind: 'pin', line: 4, text: 'Form design' },
        { kind: 'question', line: 7, text: 'How does a panel wrap a group of fields with a title?', reply: ['Cynthia', 'Drag the panel onto your form, then drop the fields inside it. The title sits on the panel.'] }
      ]
    };
    var buttons = [];

    function say(t) { sayEl.textContent = ''; window.setTimeout(function () { sayEl.textContent = t; }, 30); }
    function lineAt(t) { var k = 0; LESSON_LINES.forEach(function (l, n) { if (l[0] <= t) k = n; }); return k; }
    function endOf(i) { return i + 1 < LESSON_LINES.length ? LESSON_LINES[i + 1][0] : LESSON_TOTAL; }
    function scrollToLine(i) {
      var el = buttons[i]; if (!el) return;
      var top = el.offsetTop - linesEl.clientHeight / 3;
      if (linesEl.scrollTo) linesEl.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' }); else linesEl.scrollTop = top;
    }
    function paintTime() {
      timeEl.textContent = mmss(st.time);
      fillEl.style.width = (st.time / LESSON_TOTAL * 100) + '%';
      nowEl.textContent = LESSON_LINES[st.cur][1];
      buttons.forEach(function (b, n) { b.setAttribute('aria-current', String(n === st.cur)); });
    }
    function seek(t, follow) {
      st.time = Math.max(0, Math.min(LESSON_TOTAL, t));
      var was = st.cur;
      st.cur = lineAt(st.time);
      paintTime();
      if (follow && was !== st.cur) scrollToLine(st.cur);
    }

    function textWithHits(i) {
      var frag = document.createDocumentFragment(), text = LESSON_LINES[i][1], at = 0;
      st.hits.forEach(function (h, n) {
        if (h.line !== i) return;
        if (h.start > at) frag.appendChild(document.createTextNode(text.slice(at, h.start)));
        var m = document.createElement('mark');
        if (n === st.hit) m.className = 'is-hit';
        m.textContent = text.slice(h.start, h.end);
        frag.appendChild(m);
        at = h.end;
      });
      frag.appendChild(document.createTextNode(text.slice(at)));
      return frag;
    }
    function tools(i) {
      var wrap = document.createElement('div');
      wrap.className = 'tx__tools';
      wrap.setAttribute('role', 'group');
      wrap.setAttribute('aria-label', 'Mark ' + mmss(LESSON_LINES[i][0]));
      var stamp = document.createElement('span');
      stamp.className = 'tx__stamp';
      stamp.textContent = 'TIME STAMP · ' + mmss(LESSON_LINES[i][0]) + ' – ' + mmss(endOf(i));
      var acts = document.createElement('div');
      acts.className = 'tx__acts';
      Object.keys(MOMENT_KIND).forEach(function (k) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'tx__act'; b.textContent = MOMENT_KIND[k].act;
        b.setAttribute('aria-pressed', String(st.kind === k));
        b.addEventListener('click', function () { st.kind = st.kind === k ? null : k; renderLines(); var f = linesEl.querySelector('.tx__compose input'); if (f) f.focus(); else focusAct(k); });
        acts.appendChild(b);
      });
      wrap.appendChild(stamp); wrap.appendChild(acts);
      if (st.kind) {
        var kind = MOMENT_KIND[st.kind];
        var form = document.createElement('form');
        form.className = 'tx__compose';
        var input = document.createElement('input');
        input.type = 'text'; input.placeholder = kind.ph; input.maxLength = 90;
        input.setAttribute('aria-label', kind.ph);
        var save = document.createElement('button');
        save.type = 'submit'; save.className = 'tx__save'; save.textContent = kind.save;
        var cancel = document.createElement('button');
        cancel.type = 'button'; cancel.className = 'tx__cancel'; cancel.textContent = 'Cancel';
        function sync() { save.disabled = st.kind !== 'pin' && !input.value.trim(); }
        input.addEventListener('input', sync); sync();
        cancel.addEventListener('click', closeTools);
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var text = input.value.trim();
          if (!text && st.kind !== 'pin') return;
          if (!text) text = LESSON_LINES[i][1].replace(/[.,]$/, '').slice(0, 42) + (LESSON_LINES[i][1].length > 42 ? '…' : '');
          var m = { kind: st.kind, line: i, text: text };
          if (st.kind === 'question') m.reply = ['', 'Sent to the instructor'];
          st.moments.push(m);
          st.fresh = m;
          say(MOMENT_KIND[st.kind].said + ' at ' + mmss(LESSON_LINES[i][0]) + '.');
          st.open = -1; st.kind = null;
          renderAll();
          buttons[i].focus({ preventScroll: true });
        });
        form.appendChild(input); form.appendChild(save); form.appendChild(cancel);
        wrap.appendChild(form);
      }
      wrap.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); closeTools(); } });
      return wrap;
    }
    function focusAct(k) {
      var keys = Object.keys(MOMENT_KIND), b = linesEl.querySelectorAll('.tx__act')[keys.indexOf(k)];
      if (b) b.focus();
    }
    function closeTools() {
      var i = st.open;
      st.open = -1; st.kind = null;
      renderLines();
      if (i > -1 && buttons[i]) buttons[i].focus({ preventScroll: true });
    }
    function renderLines() {
      var keep = linesEl.scrollTop;
      linesEl.textContent = '';
      buttons = [];
      LESSON_LINES.forEach(function (l, i) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'tx__line';
        b.setAttribute('aria-expanded', String(st.open === i));
        var t = document.createElement('span'); t.className = 'tx__t'; t.textContent = mmss(l[0]);
        var x = document.createElement('span'); x.appendChild(textWithHits(i));
        var dots = document.createElement('span'); dots.className = 'tx__dots';
        var kinds = [];
        st.moments.forEach(function (m) { if (m.line === i && kinds.indexOf(m.kind) < 0) kinds.push(m.kind); });
        kinds.forEach(function (k) { var d = document.createElement('span'); d.className = 'tx__dot tx__dot--' + k; d.setAttribute('aria-hidden', 'true'); dots.appendChild(d); });
        if (kinds.length) { var sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = ' (has a ' + kinds.map(function (k) { return MOMENT_KIND[k].word.toLowerCase(); }).join(' and a ') + ')'; dots.appendChild(sr); }
        b.appendChild(t); b.appendChild(x); b.appendChild(dots);
        b.addEventListener('click', function () {
          seek(l[0], false);
          if (st.open === i) { st.open = -1; st.kind = null; } else { st.open = i; st.kind = null; }
          renderLines();
          buttons[i].focus({ preventScroll: true });
          say('Jumped to ' + mmss(l[0]) + '.');
        });
        linesEl.appendChild(b);
        buttons.push(b);
        if (st.open === i) linesEl.appendChild(tools(i));
      });
      linesEl.scrollTop = keep;
      paintTime();
    }
    function renderMoments() {
      listEl.textContent = '';
      countEl.textContent = String(st.moments.length);
      var sorted = st.moments.slice().sort(function (a, b) { return a.line - b.line; });
      sorted.forEach(function (m) {
        var li = document.createElement('li');
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'moment' + (m === st.fresh ? ' is-new' : '');
        var tag = document.createElement('span'); tag.className = 'mo mo--' + m.kind; tag.textContent = MOMENT_KIND[m.kind].word;
        var tx = document.createElement('span'); tx.className = 'moment__text'; tx.textContent = m.text;
        var tm = document.createElement('span'); tm.className = 'moment__time'; tm.textContent = mmss(LESSON_LINES[m.line][0]);
        b.appendChild(tag); b.appendChild(tx); b.appendChild(tm);
        if (m.reply) {
          var r = document.createElement('span'); r.className = 'moment__reply';
          if (m.reply[0]) { var who = document.createElement('b'); who.textContent = 'Reply from ' + m.reply[0] + ': '; r.appendChild(who); }
          r.appendChild(document.createTextNode(m.reply[1]));
          b.appendChild(r);
        }
        b.setAttribute('aria-label', MOMENT_KIND[m.kind].word + ' at ' + mmss(LESSON_LINES[m.line][0]) + ': ' + m.text + '. Go to this moment.');
        b.addEventListener('click', function () {
          seek(LESSON_LINES[m.line][0], false);
          scrollToLine(m.line);
          say('Back at ' + mmss(LESSON_LINES[m.line][0]) + '.');
        });
        li.appendChild(b);
        listEl.appendChild(li);
      });
      marksEl.textContent = '';
      st.moments.forEach(function (m) {
        var d = document.createElement('span');
        d.className = 'lp__mark lp__mark--' + m.kind;
        d.style.left = (LESSON_LINES[m.line][0] / LESSON_TOTAL * 100) + '%';
        marksEl.appendChild(d);
      });
      st.fresh = null;
    }
    function renderAll() { renderLines(); renderMoments(); }

    function search() {
      var term = q.value.trim().toLowerCase();
      st.hits = [];
      if (term) {
        LESSON_LINES.forEach(function (l, i) {
          var low = l[1].toLowerCase(), at = low.indexOf(term);
          while (at > -1) { st.hits.push({ line: i, start: at, end: at + term.length }); at = low.indexOf(term, at + term.length); }
        });
      }
      st.hit = st.hits.length ? 0 : -1;
      paintHits();
    }
    function paintHits() {
      var term = q.value.trim();
      hitsEl.textContent = !term ? 'Try "panel"' : st.hits.length ? (st.hit + 1) + ' of ' + st.hits.length : 'No matches';
      prevBtn.disabled = nextBtn.disabled = st.hits.length < 2;
      renderLines();
      if (st.hit > -1) scrollToLine(st.hits[st.hit].line);
    }
    function stepHit(d) {
      if (!st.hits.length) return;
      st.hit = (st.hit + d + st.hits.length) % st.hits.length;
      paintHits();
    }
    q.addEventListener('input', search);
    q.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); stepHit(e.shiftKey ? -1 : 1); } });
    prevBtn.addEventListener('click', function () { stepHit(-1); });
    nextBtn.addEventListener('click', function () { stepHit(1); });

    function stop() {
      if (st.timer) window.clearInterval(st.timer);
      st.timer = null;
      playBtn.textContent = '▶'; playBtn.setAttribute('aria-label', 'Play');
    }
    playBtn.addEventListener('click', function () {
      if (st.timer) { stop(); return; }
      if (st.time >= LESSON_TOTAL) seek(0, true);
      playBtn.textContent = '❚❚'; playBtn.setAttribute('aria-label', 'Pause');
      st.timer = window.setInterval(function () {
        seek(st.time + 2, true);
        if (st.time >= LESSON_TOTAL) stop();
      }, 100);
    });
    track.addEventListener('click', function (e) {
      var r = track.getBoundingClientRect();
      seek((e.clientX - r.left) / r.width * LESSON_TOTAL, true);
    });

    renderAll();
    paintHits();
    linesEl.scrollTop = 0;
  }

  /* ---------- Trade the news (Trading simulator) ----------
     A scripted 45-second replay: the same price path every time, so ranks are comparable.
     Each point is worth $1,000 per unit held; positions are capped at 100 either way. */
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var RT_TICKS = 90, RT_UNIT = 1000, RT_CAP = 100;
  var RT_NEWS = {
    20: 'Rumours are circulating that the new iPhone operating system is causing device issues. Any negative news on Apple may mean you want to take a short position (sell).',
    52: 'A reported data breach at a major financial institution sparks investor panic.'
  };
  var RT_PATH = (function () {
    var r = rng(7), p = [4195], i, d;
    for (i = 1; i <= RT_TICKS; i++) {
      d = i < 20 ? 0.07 : i < 38 ? -0.17 : i < 52 ? 0.02 : i < 68 ? -0.33 : 0.15;
      p.push(Math.round((p[i - 1] + d + (r() - 0.5) * 0.5) * 100) / 100);
    }
    return p;
  })();
  var RT_FIELD = (function () {
    var r = rng(42), out = [], i, u, v;
    for (i = 0; i < 100; i++) { u = r() || 1e-9; v = r(); out.push(Math.round((Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * 180000 + 60000) / 10) * 10); }
    return out.sort(function (a, b) { return b - a; });
  })();
  function usd(n) { var a = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); return (n < 0 ? '-$' : '$') + a; }
  function pts(n) { return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function initRetrade(scope) {
    var box = (scope || document).querySelector('[data-retrade]');
    if (!box || box.getAttribute('data-ready')) return;
    box.setAttribute('data-ready', '1');
    function q(sel) { return box.querySelector(sel); }
    var pnlEl = q('[data-rt-pnl]'), posEl = q('[data-rt-pos]'), clockEl = q('[data-rt-clock]'), ring = q('[data-rt-ring]');
    var chart = q('[data-rt-chart]'), priceEl = q('[data-rt-price]'), pot = q('[data-rt-pot]');
    var flash = q('[data-rt-flash]'), flashText = q('[data-rt-flash-text]'), flashBar = q('[data-rt-flash-bar]'), okBtn = q('[data-rt-ok]');
    var newsEl = q('[data-rt-news]'), sizeEl = q('[data-rt-size]'), minus = q('[data-rt-minus]'), plus = q('[data-rt-plus]');
    var buy = q('[data-rt-buy]'), sell = q('[data-rt-sell]'), over = q('[data-rt-over]'), panel = q('[data-rt-panel]'), sayEl = q('[data-rt-say]');
    var lo = Math.min.apply(null, RT_PATH) - 1, hi = Math.max.apply(null, RT_PATH) + 1;
    var NS = 'http://www.w3.org/2000/svg';
    var st;
    function fresh() { return { t: 0, qty: 0, avg: 0, real: 0, size: 20, hist: [0], trades: [], live: false, pause: 0, acc: 0, timer: null }; }
    st = fresh();

    function say(t) { sayEl.textContent = ''; window.setTimeout(function () { sayEl.textContent = t; }, 30); }
    function price() { return RT_PATH[st.t]; }
    function pnl() { return st.real + st.qty * (price() - st.avg) * RT_UNIT; }
    function tone(el, v) { el.classList.toggle('is-up', v > 0); el.classList.toggle('is-down', v < 0); }
    function el(name, attrs) { var n = document.createElementNS(NS, name), k; for (k in attrs) n.setAttribute(k, attrs[k]); return n; }

    function drawChart() {
      var w = chart.clientWidth || 600, h = chart.clientHeight || 260, pad = 6;
      chart.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      chart.textContent = '';
      function X(i) { return pad + i / RT_TICKS * (w - pad * 2 - 64); }
      function Y(v) { return pad + 8 + (hi - v) / (hi - lo) * (h - pad * 2 - 16); }
      var defs = el('defs', {}), g = el('linearGradient', { id: 'rt-fill', x1: 0, y1: 0, x2: 0, y2: 1 });
      g.appendChild(el('stop', { offset: '0', 'stop-color': '#61A6FA', 'stop-opacity': '.35' }));
      g.appendChild(el('stop', { offset: '1', 'stop-color': '#61A6FA', 'stop-opacity': '0' }));
      defs.appendChild(g); chart.appendChild(defs);
      for (var k = 0; k <= 4; k++) {
        var gy = pad + 8 + k / 4 * (h - pad * 2 - 16), v = hi - k / 4 * (hi - lo);
        chart.appendChild(el('line', { x1: pad, x2: w - 60, y1: gy, y2: gy, stroke: 'rgba(255,255,255,.12)', 'stroke-width': 1 }));
        var lab = el('text', { x: w - 54, y: gy + 4, fill: '#C9D3E6', 'font-size': 11, 'font-family': 'IBM Plex Mono, monospace' }); lab.textContent = v.toFixed(1); chart.appendChild(lab);
      }
      var line = '', i;
      for (i = 0; i <= st.t; i++) line += (i ? ' L' : 'M') + X(i).toFixed(1) + ' ' + Y(RT_PATH[i]).toFixed(1);
      chart.appendChild(el('path', { d: line + ' L' + X(st.t).toFixed(1) + ' ' + (h - pad) + ' L' + X(0) + ' ' + (h - pad) + ' Z', fill: 'url(#rt-fill)' }));
      chart.appendChild(el('path', { d: line, fill: 'none', stroke: '#61A6FA', 'stroke-width': 2.2, 'stroke-linejoin': 'round' }));
      Object.keys(RT_NEWS).forEach(function (n) {
        n = Number(n); if (n > st.t) return;
        chart.appendChild(el('line', { x1: X(n), x2: X(n), y1: pad, y2: h - pad, stroke: 'rgba(255,255,255,.35)', 'stroke-dasharray': '3 4' }));
      });
      st.trades.forEach(function (tr) {
        var x = X(tr.t), y = Y(tr.p), d = tr.side === 'buy' ? 'M' + x + ' ' + (y + 6) + ' l6 10 l-12 0 Z' : 'M' + x + ' ' + (y - 6) + ' l6 -10 l-12 0 Z';
        chart.appendChild(el('path', { d: d, fill: tr.side === 'buy' ? '#4ADE80' : '#FF7B7B' }));
      });
      chart.appendChild(el('circle', { cx: X(st.t), cy: Y(price()), r: 4, fill: '#FFFFFF' }));
    }
    function drawPot() {
      var w = pot.clientWidth || 200, h = pot.clientHeight || 72;
      pot.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      pot.textContent = '';
      var m = Math.max(20000, Math.max.apply(null, st.hist.map(Math.abs)));
      function X(i) { return i / RT_TICKS * w; }
      function Y(v) { return h / 2 - v / m * (h / 2 - 4); }
      pot.appendChild(el('line', { x1: 0, x2: w, y1: h / 2, y2: h / 2, stroke: 'rgba(255,255,255,.4)', 'stroke-dasharray': '3 3' }));
      var d = '', i, last = st.hist[st.hist.length - 1], c = last < 0 ? '#FF7B7B' : '#4ADE80';
      for (i = 0; i < st.hist.length; i++) d += (i ? ' L' : 'M') + X(i).toFixed(1) + ' ' + Y(st.hist[i]).toFixed(1);
      pot.appendChild(el('path', { d: d + ' L' + X(st.hist.length - 1).toFixed(1) + ' ' + h / 2 + ' L0 ' + h / 2 + ' Z', fill: c, 'fill-opacity': '.22' }));
      pot.appendChild(el('path', { d: d, fill: 'none', stroke: c, 'stroke-width': 2 }));
    }
    function render() {
      var v = pnl(), left = (RT_TICKS - st.t) / 2;
      pnlEl.textContent = usd(v); tone(pnlEl, v);
      posEl.textContent = st.qty === 0 ? 'FLAT' : (st.qty > 0 ? 'LONG ' : 'SHORT ') + Math.abs(st.qty) + ' @ ' + pts(st.avg);
      tone(posEl, st.qty === 0 ? 0 : v);
      clockEl.textContent = Math.floor(left / 60) + ':' + String(Math.ceil(left % 60) === 60 ? 0 : Math.ceil(left % 60)).padStart(2, '0');
      ring.style.strokeDashoffset = String(119.4 * (1 - left / 45));
      priceEl.textContent = pts(price());
      sizeEl.textContent = String(st.size);
      var open = st.live && !st.pause;
      buy.disabled = !open || st.qty + st.size > RT_CAP;
      sell.disabled = !open || st.qty - st.size < -RT_CAP;
      minus.disabled = st.size <= 10; plus.disabled = st.size >= 100;
      drawChart(); drawPot();
    }
    function trade(side) {
      if (!st.live || st.pause) return;
      var s = side === 'buy' ? st.size : -st.size, p = price();
      if (st.qty === 0 || (st.qty > 0) === (s > 0)) {
        st.avg = (st.avg * Math.abs(st.qty) + p * Math.abs(s)) / (Math.abs(st.qty) + Math.abs(s));
        st.qty += s;
      } else {
        var close = Math.min(Math.abs(s), Math.abs(st.qty)), dir = st.qty > 0 ? 1 : -1;
        st.real += close * (p - st.avg) * dir * RT_UNIT;
        st.qty -= dir * close;
        var rest = Math.abs(s) - close;
        if (st.qty === 0) st.avg = 0;
        if (rest > 0) { st.qty = (s > 0 ? 1 : -1) * rest; st.avg = p; }
      }
      st.trades.push({ t: st.t, p: p, side: side });
      say((side === 'buy' ? 'Bought ' : 'Sold ') + st.size + ' at ' + pts(p) + '.');
      render();
    }
    function news(text) {
      var empty = newsEl.querySelector('.rt__empty'); if (empty) empty.remove();
      newsEl.querySelectorAll('.is-new').forEach(function (n) { n.classList.remove('is-new'); });
      var li = document.createElement('li'); li.className = 'is-new'; li.textContent = text;
      newsEl.insertBefore(li, newsEl.firstChild);
      flashText.textContent = text; flash.hidden = false; flashBar.style.width = '0%';
      st.pause = 3000;
      say('Breaking news: ' + text);
    }
    function closeFlash() { flash.hidden = true; st.pause = 0; render(); }
    function step() {
      st.t++;
      st.hist.push(pnl());
      if (RT_NEWS[st.t]) news(RT_NEWS[st.t]);
      render();
      if (st.t >= RT_TICKS) finish();
    }
    function loop() {
      if (st.pause > 0) {
        st.pause -= 100;
        flashBar.style.width = (100 - st.pause / 30) + '%';
        if (st.pause <= 0) closeFlash();
        return;
      }
      st.acc += 100;
      if (st.acc >= 500) { st.acc = 0; step(); }
    }
    function finish() {
      window.clearInterval(st.timer); st.timer = null; st.live = false;
      flash.hidden = true;
      var you = Math.round(pnl() / 10) * 10, rank = 1 + RT_FIELD.filter(function (v) { return v > you; }).length;
      var names = ['Robert', 'Bobby', 'Tracy'], rows = [];
      RT_FIELD.slice(0, 3).forEach(function (v, i) { rows.push({ n: i + 1, who: names[i], v: v }); });
      if (rank <= 3) { rows.splice(rank - 1, 0, { n: rank, who: 'You', v: you, me: true }); rows = rows.slice(0, 4); rows.forEach(function (r, i) { r.n = i + 1; }); }
      else rows.push({ n: rank, who: 'You', v: you, me: true });
      panel.textContent = '';
      function add(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; panel.appendChild(n); return n; }
      add('span', 'rt__h', 'Simulation has ended!');
      var sc = add('strong', 'rt__score', usd(you)); tone(sc, you);
      add('p', null, 'You finished #' + rank + ' of 101. ' + (you > 0 ? 'Selling into the headlines paid in this replay.' : 'Tip: this replay rewarded selling when the headlines landed.'));
      var ol = add('ol', 'rt__board');
      rows.forEach(function (r) {
        var li = document.createElement('li'); if (r.me) li.className = 'is-you';
        var a = document.createElement('span'); a.textContent = r.n + '. ' + r.who;
        var b = document.createElement('span'); b.textContent = usd(r.v);
        li.appendChild(a); li.appendChild(b); ol.appendChild(li);
      });
      var again = add('button', 'rt__go', 'Play again'); again.type = 'button';
      again.addEventListener('click', start);
      over.hidden = false;
      render();
      again.focus({ preventScroll: true });
      say('Round over. You finished ' + usd(you) + ', number ' + rank + ' of 101.');
    }
    function start() {
      if (st.timer) window.clearInterval(st.timer);
      var size = st.size;
      st = fresh(); st.size = size; st.live = true;
      newsEl.innerHTML = '<li class="rt__empty">Headlines appear here.</li>';
      flash.hidden = true; over.hidden = true;
      render();
      buy.focus({ preventScroll: true });
      st.timer = window.setInterval(loop, 100);
      say('Trading has started. 45 seconds.');
    }
    buy.addEventListener('click', function () { trade('buy'); });
    sell.addEventListener('click', function () { trade('sell'); });
    minus.addEventListener('click', function () { st.size = Math.max(10, st.size - 10); render(); });
    plus.addEventListener('click', function () { st.size = Math.min(100, st.size + 10); render(); });
    okBtn.addEventListener('click', closeFlash);
    q('[data-rt-start]').addEventListener('click', start);
    window.addEventListener('resize', function () { drawChart(); drawPot(); });
    render();
  }

  /* ---------- Move an appointment (Nishauri) ----------
     Two phones share one state: the patient asks for a new slot, the clinic approves or rejects it. */
  var RS_DAYS = [['12', 'Wed'], ['13', 'Thu'], ['14', 'Fri'], ['15', 'Sat'], ['16', 'Sun']];
  var RS_TIMES = ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM'];
  var RS_FULL = { Mon: 'Monday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };
  function initResched(scope) {
    var box = (scope || document).querySelector('[data-resched]');
    if (!box || box.getAttribute('data-ready')) return;
    box.setAttribute('data-ready', '1');
    var pat = box.querySelector('[data-rs-patient]'), clin = box.querySelector('[data-rs-clinic]');
    var st;
    function fresh() { return { view: 'home', appt: { d: '10', w: 'Mon', t: '10:30 AM' }, day: null, time: null, reason: '', req: null, result: null }; }
    st = fresh();
    function h(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
    function btn(cls, text, on) { var b = h('button', cls, text); b.type = 'button'; b.addEventListener('click', on); return b; }
    function when(a) { return a.w + ' ' + a.d + ' June · ' + a.t; }
    function apptCard() {
      var card = h('div', 'rs__appt');
      card.appendChild(h('div', 'rs__appt-who', 'Dr. John Doe'));
      card.appendChild(h('div', 'rs__appt-when', when(st.appt) + ' · General Consultation'));
      var pill;
      if (st.req) pill = h('span', 'rs__pill rs__pill--wait', 'Requested: ' + st.req.w + ' ' + st.req.d + ', ' + st.req.t);
      else if (st.result === 'ok') pill = h('span', 'rs__pill rs__pill--ok', 'Rescheduled · approved');
      else if (st.result === 'no') pill = h('span', 'rs__pill rs__pill--no', 'Request declined');
      else pill = h('span', 'rs__pill', '2 Days Left');
      card.appendChild(pill);
      var r = btn('rs__resched', st.req ? 'Waiting…' : 'Reschedule', function () { st.view = 'form'; st.day = null; st.time = null; st.reason = ''; render(); focusFirst(pat); });
      r.disabled = !!st.req;
      card.appendChild(r);
      return card;
    }
    function renderPatient() {
      pat.textContent = '';
      if (st.view === 'home') {
        pat.appendChild(h('p', 'rs__hi', 'Hey, Magdalene'));
        pat.appendChild(h('span', 'rs__date', 'Saturday, June 8'));
        var row = h('div', 'rs__row'); row.appendChild(h('span', null, 'Upcoming appointment')); pat.appendChild(row);
        pat.appendChild(apptCard());
        var note = st.req ? 'Your request is with the clinic. You keep your current slot until they answer.'
          : st.result === 'ok' ? 'The clinic approved your new time.'
          : st.result === 'no' ? 'The clinic couldn’t move it. Your original time stands, or you can ask for another.'
          : 'Can’t make it? Tap Reschedule.';
        pat.appendChild(h('p', 'rs__note', note));
        return;
      }
      pat.appendChild(btn('rs__back', '← Back', function () { st.view = 'home'; render(); focusFirst(pat); }));
      pat.appendChild(h('span', 'rs__label', 'Select Date'));
      var days = h('div', 'rs__chips rs__chips--days'); days.setAttribute('role', 'group'); days.setAttribute('aria-label', 'Select a date');
      RS_DAYS.forEach(function (d) {
        var b = btn('rs__day', null, function () { st.day = d; renderPatient(); focusPressed('.rs__day'); });
        b.appendChild(h('b', null, d[0])); b.appendChild(h('span', null, d[1]));
        b.setAttribute('aria-label', RS_FULL[d[1]] + ' ' + d[0] + ' June');
        b.setAttribute('aria-pressed', String(st.day === d));
        days.appendChild(b);
      });
      pat.appendChild(days);
      pat.appendChild(h('span', 'rs__label', 'Select Time'));
      var times = h('div', 'rs__chips'); times.setAttribute('role', 'group'); times.setAttribute('aria-label', 'Select a time');
      RS_TIMES.forEach(function (t) {
        var b = btn('rs__time', t, function () { st.time = t; renderPatient(); focusPressed('.rs__time'); });
        b.setAttribute('aria-pressed', String(st.time === t));
        times.appendChild(b);
      });
      pat.appendChild(times);
      var lab = h('label', 'rs__label', 'Rescheduling Reason'); lab.setAttribute('for', 'rs-reason');
      pat.appendChild(lab);
      var ta = h('textarea', 'rs__reason'); ta.id = 'rs-reason'; ta.placeholder = 'Type your message here …'; ta.maxLength = 120; ta.value = st.reason;
      ta.addEventListener('input', function () { st.reason = ta.value; });
      pat.appendChild(ta);
      var go = btn('rs__go', 'Submit Request', function () {
        st.req = { d: st.day[0], w: st.day[1], t: st.time, reason: st.reason.trim() || 'I will be away during that period' };
        st.result = null; st.view = 'home'; render();
        reveal(clin);
        var a = clin.querySelector('.rs__ok'); if (a) a.focus({ preventScroll: true });
      });
      go.disabled = !(st.day && st.time);
      pat.appendChild(go);
    }
    function renderClinic() {
      clin.textContent = '';
      clin.appendChild(h('div', 'rs__bar', 'Reschedule Requests'));
      if (!st.req) {
        if (st.result) {
          clin.appendChild(h('div', 'rs__done rs__done--' + st.result, st.result === 'ok' ? 'Approved · Magdalene has been notified' : 'Rejected · Magdalene keeps her original time'));
        }
        clin.appendChild(h('p', 'rs__empty', st.result ? 'No new requests.' : 'No new requests yet. Ask for a new date on the patient’s phone.'));
        return;
      }
      var card = h('div', 'rs__req');
      var top = h('div', 'rs__req-top'); top.appendChild(h('span', null, 'Patient No: 123450002')); top.appendChild(h('span', null, 'Consultation'));
      card.appendChild(top);
      [['Appointment Date', when(st.appt)], ['Proposed Date', st.req.w + ' ' + st.req.d + ' June · ' + st.req.t], ['Reason', st.req.reason]].forEach(function (kv) {
        var r = h('div', 'rs__kv'); r.appendChild(h('span', null, kv[0])); r.appendChild(h('span', null, kv[1])); card.appendChild(r);
      });
      var acts = h('div', 'rs__acts');
      acts.appendChild(btn('rs__ok', 'Approve', function () { st.appt = { d: st.req.d, w: st.req.w, t: st.req.t }; st.req = null; st.result = 'ok'; render(); reveal(pat); focusFirst(pat, '.rs__resched'); }));
      acts.appendChild(btn('rs__no', 'Reject', function () { st.req = null; st.result = 'no'; render(); reveal(pat); focusFirst(pat, '.rs__resched'); }));
      card.appendChild(acts);
      clin.appendChild(card);
    }
    function focusFirst(root, sel) { var n = root.querySelector(sel || 'button, textarea'); if (n) n.focus({ preventScroll: true }); }
    // On narrow screens the two phones stack: bring the one that just changed into view
    function reveal(el) {
      var r = el.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) el.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
    function focusPressed(sel) { var n = pat.querySelector(sel + '[aria-pressed="true"]'); if (n) n.focus({ preventScroll: true }); }
    function render() { renderPatient(); renderClinic(); }
    box.querySelector('[data-rs-reset]').addEventListener('click', function () { st = fresh(); render(); });
    render();
  }

  /* ---------- Claim a spot (Jasiri Pulse) ----------
     invite → pay → (M-Pesa) → in → leave before lock (refund to wallet) or lock (game on). */
  function initClaim(scope) {
    var box = (scope || document).querySelector('[data-claim]');
    if (!box || box.getAttribute('data-ready')) return;
    box.setAttribute('data-ready', '1');
    var ph = box.querySelector('[data-pl]'), logEl = box.querySelector('[data-pl-log]'), walletEl = box.querySelector('[data-pl-wallet]');
    var st, timers = [];
    function fresh() { return { view: 'invite', count: 7, wallet: 0, log: [] }; }
    st = fresh();
    function h(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
    function clear() { timers.forEach(window.clearTimeout); timers = []; }
    function later(fn, ms) { timers.push(window.setTimeout(fn, ms)); }
    function log(title, text) { st.log.push([title, text]); }
    function hero(kind, kicker, title, meta, check) {
      var el = h('div', 'pl__hero' + (kind ? ' pl__hero--' + kind : ''));
      if (check) el.appendChild(h('div', 'pl__check', '✓'));
      if (kicker) el.appendChild(h('span', 'pl__kicker', kicker));
      el.appendChild(h('span', 'pl__title', title));
      if (meta) el.appendChild(h('p', 'pl__meta', meta));
      return el;
    }
    function fill(right) {
      var w = h('div');
      var f = h('div', 'pl__fill'); f.appendChild(h('b', null, st.count + ' of 10 in')); f.appendChild(h('span', null, right));
      var b = h('div', 'pl__band'); var bi = h('span'); bi.style.width = (st.count * 10) + '%'; b.appendChild(bi);
      w.appendChild(f); w.appendChild(b);
      return w;
    }
    function facts(rows) {
      var dl = h('dl', 'pl__facts');
      rows.forEach(function (r) { var d = h('div', 'pl__fact'); d.appendChild(h('dt', null, r[0])); d.appendChild(h('dd', r[2] ? 'pl__num' : null, r[1])); dl.appendChild(d); });
      return dl;
    }
    function roster(you) {
      var r = h('div', 'pl__roster'); r.setAttribute('aria-label', st.count + ' players in');
      ['K', 'B', 'A', 'N'].forEach(function (l) { r.appendChild(h('span', 'pl__av', l)); });
      if (you) r.appendChild(h('span', 'pl__av pl__av--you', 'You'));
      r.appendChild(h('span', 'pl__av', '+' + (st.count - 4 - (you ? 1 : 0))));
      return r;
    }
    function foot(buttons) {
      var f = h('div', 'pl__foot');
      buttons.forEach(function (b) { var el = h('button', 'pl__btn' + (b[2] ? ' pl__btn--' + b[2] : ''), b[0]); el.type = 'button'; el.addEventListener('click', b[1]); f.appendChild(el); });
      return f;
    }
    function go(view) { st.view = view; render(); var b = ph.querySelector('.pl__btn'); if (b) b.focus({ preventScroll: true }); }
    function render() {
      ph.textContent = '';
      var body = h('div', 'pl__body');
      if (st.view === 'invite' || st.view === 'left') {
        ph.appendChild(hero('', st.view === 'left' ? 'You left · still open' : 'Kev O. invited you', 'Saturday Run 5 a side', 'Saturday 4:00 PM · Kasarani Indoor Court 2'));
        body.appendChild(fill((10 - st.count) + ' spots left'));
        body.appendChild(facts([['Format', '5 a side · 10 players'], ['You pay', 'KES 300', true], ['Locks', 'Sat 2:00 PM']]));
        body.appendChild(h('p', 'pl__note', st.view === 'left' ? 'Your KES 300 is back in your Jasiri wallet. Claim again any time before the lock.' : 'No app needed to claim. Pay with M-Pesa; free to leave until lock.'));
        ph.appendChild(body);
        ph.appendChild(foot([[st.view === 'left' ? 'Claim again' : 'Claim your spot', function () { go('pay'); }, 'commit']]));
      } else if (st.view === 'pay') {
        var top = h('div', 'pl__body'); top.style.paddingTop = '56px';
        top.appendChild(h('span', 'pl__lab', 'Confirm &amp; pay'));
        top.appendChild(h('span', 'pl__big', 'KES 300.00'));
        top.appendChild(facts([['Court share · 1 of 10', 'KES 300', true], ['Booking fee', 'Waived', true]]));
        var payFrom = h('div', 'pl__payfrom');
        var t = h('div'); t.appendChild(h('strong', null, st.wallet >= 300 ? 'Jasiri wallet' : 'M-Pesa')); t.appendChild(h('small', null, st.wallet >= 300 ? 'Balance KES ' + st.wallet : '+254 712 345 678'));
        payFrom.appendChild(t); payFrom.appendChild(h('span', 'pl__num', 'KES 300'));
        top.appendChild(payFrom);
        top.appendChild(h('p', 'pl__note', 'Paid now, held by Jasiri until the game is played. Free to leave until it locks.'));
        ph.appendChild(top);
        ph.appendChild(foot([['Pay KES 300.00', function () {
          if (st.wallet >= 300) { st.wallet -= 300; log('Paid from wallet', 'KES 300 · held by Jasiri until game day'); st.count++; go('in'); return; }
          go('stk');
          later(function () { log('Paid with M-Pesa', 'KES 300 · held by Jasiri until game day'); st.count++; go('in'); }, 1600);
        }], ['Back', function () { go(st.log.length ? 'left' : 'invite'); }, 'soft']]));
      } else if (st.view === 'stk') {
        var s2 = h('div', 'pl__body'); s2.style.paddingTop = '120px';
        var k = h('div', 'pl__stk'); k.appendChild(h('span', 'pl__spin')); k.appendChild(h('strong', null, 'Check your phone'));
        k.appendChild(h('span', null, 'Enter your M-Pesa PIN on the prompt to pay KES 300. (Simulated: this confirms by itself.)'));
        s2.appendChild(k); ph.appendChild(s2);
      } else if (st.view === 'in') {
        ph.appendChild(hero('celebrate', null, 'You’re in.', 'Saturday 4:00 PM · Kasarani Indoor Court 2<br>You, Kev, Brian + ' + (st.count - 3) + ' others', true));
        body.appendChild(fill((10 - st.count) + ' more to lock'));
        body.appendChild(roster(true));
        body.appendChild(h('p', 'pl__note', 'KES 300 paid · held until game day. Free to leave until Sat 2:00 PM.'));
        ph.appendChild(body);
        ph.appendChild(foot([['Skip to the lock', function () {
          var btns = ph.querySelectorAll('.pl__btn'); btns.forEach(function (b) { b.disabled = true; });
          function step() {
            if (st.count < 10) { st.count++; render(); ph.querySelectorAll('.pl__btn').forEach(function (b) { b.disabled = true; }); later(step, 450); return; }
            log('Game locked · 10 of 10', 'KES 300 stays held, then goes to the venue after the game');
            go('locked');
          }
          later(step, 350);
        }], ['Leave before the lock', function () {
          st.count--; st.wallet += 300; log('Left before the lock', 'KES 300 back to your Jasiri wallet'); go('left');
        }, 'soft']]));
      } else if (st.view === 'locked') {
        ph.appendChild(hero('plain', 'Locked · Sat 2:00 PM', 'Game on.', 'Saturday 4:00 PM · Kasarani Indoor Court 2'));
        body.appendChild(fill('Full'));
        body.appendChild(roster(true));
        body.appendChild(facts([['Your share', 'KES 300', true], ['Refunds', 'Closed at lock'], ['Game day', 'Scan in at the court']]));
        body.appendChild(h('p', 'pl__note', 'Shares are locked in. After the game, the money goes to the venue. Checking in builds your show-up record.'));
        ph.appendChild(body);
        ph.appendChild(foot([['Start over', reset, 'soft']]));
      }
      logEl.textContent = '';
      if (!st.log.length) logEl.appendChild(h('li', 'pl-log__empty', 'Nothing yet. Claim a spot to start.'));
      st.log.forEach(function (e) { var li = h('li'); var d = h('span'); d.appendChild(h('b', null, e[0])); d.appendChild(document.createTextNode(e[1])); li.appendChild(d); logEl.appendChild(li); });
      walletEl.textContent = 'KES ' + st.wallet;
    }
    function reset() { clear(); st = fresh(); go('invite'); }
    render();
  }

  /* ---------- Brand switcher (One game, ten brands) ---------- */
  var SANS = "'Instrument Sans', system-ui, sans-serif";
  var SERIF = "'Instrument Serif', Georgia, serif";
  var MONO = "'IBM Plex Mono', ui-monospace, monospace";
  var LIGHT = { surface: '#FFFFFF', ink: '#15161A', sub: '#5A5B61', muted: '#EEEDE9', onPrimary: '#FFFFFF' };
  var DARK = { surface: '#1B1F2A', ink: '#F2F1EE', sub: '#B9BAC2', muted: '#2C3140', onPrimary: '#15161A' };
  function theme(base, extra) { var t = {}, k; for (k in base) t[k] = base[k]; for (k in extra) t[k] = extra[k]; return t; }
  var THEMES = [
    theme(LIGHT, { name: 'AmplifyME', primary: '#3F44B0', font: SANS, fontName: 'Sans', radius: 16 }),
    theme(LIGHT, { name: 'Client A', primary: '#0B6E4F', font: SERIF, fontName: 'Serif', radius: 4 }),
    theme(DARK, { name: 'Client B', primary: '#F2B33D', font: SANS, fontName: 'Sans', radius: 12 }),
    theme(LIGHT, { name: 'Client C', primary: '#C2362B', font: MONO, fontName: 'Mono', radius: 0 }),
    theme(LIGHT, { name: 'Client D', surface: '#F7F3EA', muted: '#ECE6D8', primary: '#1F3A5F', font: SANS, fontName: 'Sans', radius: 24 }),
    theme(DARK, { name: 'Client E', surface: '#12201C', muted: '#1F332D', primary: '#6BD3A8', font: SERIF, fontName: 'Serif', radius: 8 }),
    theme(LIGHT, { name: 'Client F', primary: '#7A3FB0', font: SANS, fontName: 'Sans', radius: 2 }),
    theme(DARK, { name: 'Client G', surface: '#20141A', muted: '#33222B', primary: '#F07AA0', font: MONO, fontName: 'Mono', radius: 16 }),
    theme(LIGHT, { name: 'Client H', surface: '#FBFAF6', muted: '#F0ECE2', primary: '#8A5A1F', font: SERIF, fontName: 'Serif', radius: 12 }),
    theme(LIGHT, { name: 'Client I', primary: '#0E7FA6', font: SANS, fontName: 'Sans', radius: 10 })
  ];
  function initBrandSwitcher(scope) {
    var box = (scope || document).querySelector('[data-brands]');
    if (!box) return;
    var chips = box.querySelector('[data-brand-chips]');
    var game = box.querySelector('[data-game]');
    var stake = box.querySelector('#stake');
    var sel = 0;
    var fmt = function (n) { return '$' + n.toLocaleString('en-US'); };
    THEMES.forEach(function (t, k) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip chip--swatched';
      b.setAttribute('aria-pressed', String(k === 0));
      var sw = document.createElement('span');
      sw.className = 'chip__swatch';
      sw.style.background = t.primary;
      sw.setAttribute('aria-hidden', 'true');
      b.appendChild(sw);
      b.appendChild(document.createTextNode(t.name));
      b.addEventListener('click', function () { sel = k; render(); });
      chips.appendChild(b);
    });
    function set(sel2, text) { box.querySelectorAll(sel2).forEach(function (n) { n.textContent = text; }); }
    function render() {
      var t = THEMES[sel];
      var s = game.style;
      s.setProperty('--t-surface', t.surface);
      s.setProperty('--t-ink', t.ink);
      s.setProperty('--t-sub', t.sub);
      s.setProperty('--t-muted', t.muted);
      s.setProperty('--t-primary', t.primary);
      s.setProperty('--t-on-primary', t.onPrimary);
      s.setProperty('--t-radius', t.radius + 'px');
      s.setProperty('--t-font', t.font);
      chips.querySelectorAll('button').forEach(function (b, k) { b.setAttribute('aria-pressed', String(k === sel)); });
      var pct = Number(stake.value);
      var amt = Math.round(5000 * pct / 100);
      set('[data-t-name]', t.name);
      set('[data-stake]', pct + '% of $5,000');
      set('[data-amount]', fmt(amt));
      set('[data-payout]', fmt(amt * 2));
      set('[data-tok-primary]', t.primary);
      set('[data-tok-surface]', t.surface);
      set('[data-tok-font]', t.fontName);
      set('[data-tok-radius]', t.radius + 'px');
      box.querySelector('[data-chip-primary]').style.background = t.primary;
      box.querySelector('[data-chip-surface]').style.background = t.surface;
    }
    stake.addEventListener('input', render);
    render();
  }

  /* ---------- Forecast demo (Forecasting tournaments) ----------
     Rules from the designs: Bullseye pays 3x the stake, Partial pays half that (1.5x),
     a Miss loses the stake. Confidence is required but doesn't change coins. */
  var MM_MODES = {
    dark: { bg: '#09090B', card: '#131416', fg: '#F4F5F7', muted: '#1A1A1D', sub: '#A4A4A8', primary: '#61A6FA', onPrimary: '#09090B', border: '#28292C', input: '#393A3F', success: '#4ED589', warning: '#FCB442', destructive: '#FF6F69' },
    light: { bg: '#FBFAF8', card: '#FFFFFF', fg: '#111115', muted: '#F9F8F6', sub: '#57585D', primary: '#116EE1', onPrimary: '#FFFFFF', border: '#E3E1DE', input: '#C9C7C3', success: '#00602A', warning: '#945000', destructive: '#AC1922' }
  };
  function initForecast(scope) {
    var box = (scope || document).querySelector('[data-forecast]');
    if (!box) return;
    var actual = Number(box.getAttribute('data-actual'));
    var bull = Number(box.getAttribute('data-bull'));
    var partial = Number(box.getAttribute('data-partial'));
    var panel = box.querySelector('[data-mm]');
    var fIn = box.querySelector('#fc-forecast');
    var sIn = box.querySelector('#fc-stake');
    var cIn = box.querySelector('#fc-conf');
    var place = box.querySelector('[data-fc-place]');
    var hint = box.querySelector('[data-fc-hint]');
    var line = box.querySelector('[data-fc-line]');
    var confSet = false;
    var n = function (v) { return Number(v).toLocaleString('en-US'); };
    var q = function (sel) { return box.querySelector(sel); };
    var lo = Number(fIn.min), hi = Number(fIn.max);
    var pct = function (v) { return ((v - lo) / (hi - lo) * 100).toFixed(2) + '%'; };
    var PENDING_NOTE = q('[data-fc-note]').textContent;

    function setMode(mode) {
      var t = MM_MODES[mode], s = panel.style;
      Object.keys(t).forEach(function (k) { s.setProperty('--mm-' + k, t[k]); });
      box.querySelectorAll('[data-mode]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-mode') === mode)); });
    }
    function mark(sel, v) {
      var el = q(sel), p = (v - lo) / (hi - lo);
      el.style.left = pct(v);
      // Keep labels inside the line near either end
      el.firstElementChild.style.transform = p < 0.15 ? 'translateX(-8px)' : p > 0.85 ? 'translateX(calc(-100% + 8px))' : 'translateX(-50%)';
    }
    function setText(sel, text, cls) {
      var el = q(sel);
      el.textContent = text;
      if (cls) el.className = cls;
    }
    /* Any change to the inputs puts the trade back to open: the reveal only shows for what was placed. */
    function pending() {
      var f = Number(fIn.value), stake = Number(sIn.value);
      setText('[data-fc-forecast-out]', n(f));
      setText('[data-fc-stake-out]', n(stake));
      setText('[data-fc-stake-on]', n(stake));
      setText('[data-fc-pay-bull]', n(stake * 3) + ' coins');
      setText('[data-fc-pay-partial]', n(stake * 1.5) + ' coins');
      setText('[data-fc-conf-out]', confSet ? cIn.value + ' / 100' : 'Not set · drag to answer');
      cIn.toggleAttribute('data-unset', !confSet);
      place.disabled = !confSet;
      hint.textContent = confSet ? 'Ready to trade' : 'Set your confidence to continue';
      setText('[data-fc-you]', n(f));
      setText('[data-fc-you2]', n(f));
      mark('[data-fc-mark-you]', f);
      if (!line.classList.contains('is-pending')) {
        line.classList.add('is-pending');
        setText('[data-fc-badge]', 'Open', 'fc__badge fc__badge--open');
        setText('[data-fc-net]', '?', 'fc__net fc__net--open');
        setText('[data-fc-sub]', 'Place the trade to see how it resolved');
        setText('[data-fc-actual]', 'Hidden until you trade');
        setText('[data-fc-diff]', '–');
        setText('[data-fc-points]', '–');
        setText('[data-fc-note]', PENDING_NOTE);
      }
    }
    function resolve() {
      var f = Number(fIn.value), stake = Number(sIn.value), conf = Number(cIn.value);
      var diff = f - actual, d = Math.abs(diff);
      var kind = d <= bull ? 'bull' : d <= partial ? 'partial' : 'miss';
      var net = kind === 'bull' ? stake * 2 : kind === 'partial' ? stake * 0.5 : -stake;
      var label = { bull: 'Bullseye', partial: 'Partial', miss: 'Miss' }[kind];
      var mult = { bull: '×3 payout', partial: '×1.5 payout', miss: 'stake lost' }[kind];
      var netText = (net > 0 ? '+' : '−') + n(Math.abs(net));
      setText('[data-fc-badge]', label, 'fc__badge fc__badge--' + kind);
      setText('[data-fc-net]', netText, 'fc__net fc__net--' + (net > 0 ? 'up' : 'down'));
      setText('[data-fc-sub]', 'coins on a ' + n(stake) + ' stake · ' + mult);
      setText('[data-fc-actual]', n(actual) + 'k');
      setText('[data-fc-diff]', (diff > 0 ? '+' : diff < 0 ? '−' : '') + n(d) + 'k');
      setText('[data-fc-points]', '+3 for answering');
      mark('[data-fc-mark-actual]', actual);
      var bp = q('[data-fc-band-partial]'), bb = q('[data-fc-band-bull]');
      bp.style.left = pct(actual - partial); bp.style.width = ((2 * partial) / (hi - lo) * 100).toFixed(2) + '%';
      bb.style.left = pct(actual - bull); bb.style.width = ((2 * bull) / (hi - lo) * 100).toFixed(2) + '%';
      line.classList.remove('is-pending');
      setText('[data-fc-note]', label + ', ' + netText + ' coins. You were ' + conf + ' / 100 confident of landing within the partial band, and ' +
        (kind !== 'miss' ? 'did. ' : 'missed. ') + "Confidence doesn't change your coins. It feeds your forecaster profile, which tracks how well your confidence matches your results.");
      hint.textContent = 'Change anything to trade again';
    }
    fIn.addEventListener('input', pending);
    sIn.addEventListener('input', pending);
    cIn.addEventListener('input', function () { confSet = true; pending(); });
    place.addEventListener('click', resolve);
    box.querySelectorAll('[data-mode]').forEach(function (b) {
      b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); });
    });
    setMode('light');
    pending();
  }

  /* ---------- Drag to compare light and dark (Forecasting) ---------- */
  function initWipe(scope) {
    (scope || document).querySelectorAll('[data-wipe]').forEach(function (box) {
      var range = box.querySelector('input[type="range"]');
      if (!range) return;
      var dragging = false;
      function set() { box.style.setProperty('--pos', range.value + '%'); }
      function fromX(x) {
        var r = box.getBoundingClientRect();
        range.value = String(Math.max(0, Math.min(100, Math.round((x - r.left) / r.width * 100))));
        set();
      }
      // Pointer drag anywhere on the screen; the range input stays for keyboard users.
      box.addEventListener('dragstart', function (e) { e.preventDefault(); });
      box.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        dragging = true; fromX(e.clientX);
        try { box.setPointerCapture(e.pointerId); } catch (err) { /* older browsers */ }
      });
      box.addEventListener('pointermove', function (e) { if (dragging) fromX(e.clientX); });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (t) { box.addEventListener(t, function () { dragging = false; }); });
      range.addEventListener('input', set);
      set();
    });
  }

  /* ---------- Full-size view for screens marked data-zoom ----------
     One viewer for the whole page. Clicks are delegated, so it also works on
     content the NDA gate injects after decrypting. */
  var zoomBox = null, zoomFrom = null;
  function prepZoom(scope) {
    (scope || document).querySelectorAll('[data-zoom]').forEach(function (z) {
      if (z.hasAttribute('tabindex')) return;
      z.setAttribute('tabindex', '0');
      z.setAttribute('role', 'button');
      z.setAttribute('aria-label', 'Enlarge screen');
      if (!z.hasAttribute('data-cursor')) z.setAttribute('data-cursor', 'Enlarge');
    });
  }
  function narrow() { return window.matchMedia && window.matchMedia('(max-width: 760px)').matches; }
  function closeZoom() {
    if (!zoomBox || zoomBox.hidden) return;
    zoomBox.hidden = true;
    document.documentElement.classList.remove('lb-open');
    if (zoomFrom) zoomFrom.focus({ preventScroll: true });
  }
  function openZoom(trigger) {
    var src = trigger.querySelector('img');
    if (!src) return;
    if (!zoomBox) {
      zoomBox = document.createElement('div');
      zoomBox.className = 'lightbox';
      zoomBox.setAttribute('role', 'dialog');
      zoomBox.setAttribute('aria-modal', 'true');
      zoomBox.setAttribute('aria-label', 'Screen, full size');
      zoomBox.innerHTML = '<span class="lightbox__hint"></span><button type="button" class="lightbox__close" aria-label="Close">×</button>' +
        '<figure class="lightbox__fig"><img class="lightbox__img" alt=""><figcaption class="lightbox__cap"></figcaption></figure>';
      document.body.appendChild(zoomBox);
      zoomBox.querySelector('.lightbox__close').addEventListener('click', function (e) { e.stopPropagation(); closeZoom(); });
      zoomBox.addEventListener('click', function () { if (!narrow()) closeZoom(); });
      zoomBox.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') { e.preventDefault(); zoomBox.querySelector('.lightbox__close').focus(); } // keep focus inside
      });
    }
    var img = zoomBox.querySelector('.lightbox__img');
    img.style.width = '';
    // On phones, open wide enough to pan around for detail, but never past the image's own size
    img.onload = function () { if (narrow()) img.style.width = Math.min(img.naturalWidth, 1100) + 'px'; };
    img.src = src.currentSrc || src.src;
    img.alt = src.alt || '';
    zoomBox.querySelector('.lightbox__cap').textContent = src.alt || '';
    zoomBox.querySelector('.lightbox__hint').textContent = narrow() ? 'Drag to look around · tap × to close' : 'Click anywhere or press Esc to close';
    zoomFrom = trigger;
    zoomBox.hidden = false;
    zoomBox.scrollTop = 0; zoomBox.scrollLeft = 0;
    document.documentElement.classList.add('lb-open');
    zoomBox.querySelector('.lightbox__close').focus({ preventScroll: true });
  }
  function initZoom() {
    prepZoom(document);
    document.addEventListener('click', function (e) {
      var z = e.target.closest && e.target.closest('[data-zoom]');
      if (z) openZoom(z);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeZoom(); return; }
      var z = (e.key === 'Enter' || e.key === ' ') && document.activeElement && document.activeElement.closest && document.activeElement.closest('[data-zoom]');
      if (z) { e.preventDefault(); openZoom(z); }
    });
  }

  /* ---------- NDA gate: decrypts the case study in the browser ---------- */
  function b64(s) {
    var bin = atob(s), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function decrypt(payload, password) {
    var subtle = window.crypto && window.crypto.subtle;
    if (!subtle) return Promise.reject(new Error('unsupported'));
    var enc = new TextEncoder();
    return subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey'])
      .then(function (base) {
        return subtle.deriveKey(
          { name: 'PBKDF2', salt: b64(payload.salt), iterations: payload.iter, hash: 'SHA-256' },
          base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
      })
      .then(function (key) { return subtle.decrypt({ name: 'AES-GCM', iv: b64(payload.iv) }, key, b64(payload.data)); })
      .then(function (buf) { return JSON.parse(new TextDecoder().decode(buf)); });
  }
  function initGate() {
    var root = document.querySelector('[data-nda-root]');
    var source = document.getElementById('nda-payload');
    if (!root || !source) return;
    var payload;
    try { payload = JSON.parse(source.textContent); } catch (e) { payload = null; }
    var form = root.querySelector('[data-gate-form]');
    var input = root.querySelector('#nda-password');
    var msg = root.querySelector('[data-gate-msg]');
    var btn = form.querySelector('button');

    function reveal(doc, password, quiet) {
      var html = doc.html;
      // Images shared by several places in a case study travel once, as an asset map.
      if (doc.assets) html = html.replace(/asset:([a-z0-9-]+)/g, function (m, k) { return doc.assets[k] || m; });
      root.innerHTML = html;
      if (doc.title) document.title = doc.title;
      storeSet('tt-nda', password);
      initBrandSwitcher(root);
      initJourney(root);
      initForecast(root);
      initWipe(root);
      initBands(root);
      initLesson(root);
      initRetrade(root);
      initClaim(root);
      prepZoom(root);
      var h1 = root.querySelector('h1');
      // Move focus to the title only when someone just typed the password, not on a remembered unlock
      if (h1 && !quiet) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
      window.scrollTo(0, 0);
    }
    function attempt(password, quiet) {
      if (!payload || !payload.data) {
        if (!quiet) { msg.textContent = 'This case study is not published yet. Email me for a walkthrough.'; msg.classList.add('is-error'); }
        return Promise.resolve();
      }
      btn.disabled = true;
      if (!quiet) { msg.classList.remove('is-error'); msg.textContent = 'Unlocking…'; }
      return decrypt(payload, password)
        .then(function (doc) { reveal(doc, password, quiet); })
        .catch(function (err) {
          btn.disabled = false;
          if (quiet) return;
          msg.classList.add('is-error');
          msg.textContent = err && err.message === 'unsupported'
            ? 'This browser cannot unlock the page. Try an up-to-date Chrome, Safari, Edge or Firefox.'
            : "That password didn't work. Use the one printed on my CV, or email me for access.";
          input.select();
        });
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var pw = input.value.trim();
      if (!pw) { msg.classList.add('is-error'); msg.textContent = 'Enter the password from my CV.'; input.focus(); return; }
      attempt(pw, false);
    });
    var saved = storeGet('tt-nda');
    if (saved) attempt(saved, true);
  }

  /* ---------- Avatar eyes follow the pointer (Home, About) ----------
     The avatar loads as an <img>; when the page is served over http(s) it is swapped
     for the same SVG inline, with each pupil clipped to its eye so it can move. */
  function initEyes() {
    var img = document.querySelector('img.avatar');
    if (!img || reduceMotion || !window.fetch || !window.DOMParser || location.protocol === 'file:') return;
    fetch(img.getAttribute('src'))
      .then(function (r) { return r.ok ? r.text() : Promise.reject(new Error('avatar')); })
      .then(function (txt) {
        var doc = new DOMParser().parseFromString(txt, 'image/svg+xml');
        var svg = doc.documentElement;
        if (!svg || svg.nodeName.toLowerCase() !== 'svg') return;
        var NS = 'http://www.w3.org/2000/svg';
        var circles = Array.prototype.slice.call(svg.querySelectorAll('circle'));
        var pupils = circles.filter(function (c) { return c.getAttribute('r') === '7'; });
        var glints = circles.filter(function (c) { return c.getAttribute('r') === '2.4'; });
        if (pupils.length !== 2 || glints.length !== 2) return;
        var whites = Array.prototype.slice.call(svg.querySelectorAll('path')).filter(function (p) {
          return p.getAttribute('fill') === '#fff' && /^M\s*(198|282)\s+262/.test(p.getAttribute('d') || '');
        });
        var defs = svg.querySelector('defs') || svg.insertBefore(document.createElementNS(NS, 'defs'), svg.firstChild);
        var eyes = pupils.map(function (pupil, k) {
          var cx = Number(pupil.getAttribute('cx')), cy = Number(pupil.getAttribute('cy'));
          var clip = document.createElementNS(NS, 'clipPath');
          clip.setAttribute('id', 'tt-eye-' + k);
          var shape;
          if (whites[k]) { shape = document.createElementNS(NS, 'path'); shape.setAttribute('d', whites[k].getAttribute('d')); }
          else { shape = document.createElementNS(NS, 'ellipse'); shape.setAttribute('cx', cx); shape.setAttribute('cy', cy + 1); shape.setAttribute('rx', 16); shape.setAttribute('ry', 6); }
          clip.appendChild(shape); defs.appendChild(clip);
          var outer = document.createElementNS(NS, 'g');
          outer.setAttribute('clip-path', 'url(#tt-eye-' + k + ')');
          var inner = document.createElementNS(NS, 'g');
          outer.appendChild(inner);
          pupil.parentNode.insertBefore(outer, pupil);
          inner.appendChild(pupil); inner.appendChild(glints[k]);
          return { g: inner, cx: cx, cy: cy, x: 0, y: 0, tx: 0, ty: 0 };
        });
        svg.setAttribute('class', img.getAttribute('class'));
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', img.getAttribute('alt') || '');
        svg.setAttribute('width', img.getAttribute('width'));
        svg.setAttribute('height', img.getAttribute('height'));
        var live = document.importNode(svg, true);
        img.parentNode.replaceChild(live, img);
        eyes.forEach(function (e, k) { e.g = live.querySelectorAll('[clip-path] > g')[k]; });

        var raf = 0;
        function aim(px, py) {
          var r = live.getBoundingClientRect();
          if (!r.width) return;
          var s = r.width / 512;
          eyes.forEach(function (e) {
            var ex = r.left + e.cx * s, ey = r.top + e.cy * s;
            var dx = px - ex, dy = py - ey;
            var d = Math.sqrt(dx * dx + dy * dy) || 1;
            var reach = Math.min(1, d / (r.width * 0.5));
            e.tx = (dx / d) * 8 * reach;
            e.ty = (dy / d) * 3 * reach;
          });
          if (!raf) raf = requestAnimationFrame(step);
        }
        function step() {
          var moving = false;
          eyes.forEach(function (e) {
            e.x += (e.tx - e.x) * 0.2; e.y += (e.ty - e.y) * 0.2;
            if (Math.abs(e.tx - e.x) + Math.abs(e.ty - e.y) > 0.02) moving = true;
            e.g.setAttribute('transform', 'translate(' + e.x.toFixed(2) + ' ' + e.y.toFixed(2) + ')');
          });
          raf = moving ? requestAnimationFrame(step) : 0;
        }
        document.addEventListener('pointermove', function (ev) { aim(ev.clientX, ev.clientY); }, { passive: true });
        document.documentElement.addEventListener('mouseleave', function () {
          eyes.forEach(function (e) { e.tx = 0; e.ty = 0; });
          if (!raf) raf = requestAnimationFrame(step);
        });
      })
      .catch(function () { /* keep the plain image */ });
  }

  /* ---------- Trailing cursor (desktop mouse only) ----------
     A small dot follows the pointer with a delay. Over anything with data-cursor it grows
     into a labelled circle; over other links and buttons it grows a little. */
  function initCursor() {
    if (reduceMotion || !window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var el = document.createElement('div');
    el.className = 'cursor';
    el.setAttribute('aria-hidden', 'true');
    var label = document.createElement('span');
    label.className = 'cursor__label';
    el.appendChild(label);
    document.body.appendChild(el);
    document.documentElement.classList.add('has-cursor');
    var x = -100, y = -100, tx = -100, ty = -100, raf = 0;
    function step() {
      x += (tx - x) * 0.16; y += (ty - y) * 0.16;
      el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) translate(-50%,-50%)';
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.2 ? requestAnimationFrame(step) : 0;
    }
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      tx = e.clientX; ty = e.clientY;
      if (!el.classList.contains('is-visible')) { x = tx; y = ty; el.classList.add('is-visible'); }
      if (!raf) raf = requestAnimationFrame(step);
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', function () { el.classList.remove('is-visible'); });
    document.addEventListener('pointerdown', function () { el.classList.add('is-down'); });
    document.addEventListener('pointerup', function () { el.classList.remove('is-down'); });
    document.addEventListener('pointerover', function (e) {
      var t = e.target && e.target.closest ? e.target.closest('[data-cursor], a, button') : null;
      el.classList.remove('is-card', 'is-link', 'is-locked', 'is-soon');
      if (!t) return;
      if (t.hasAttribute('data-cursor')) {
        el.classList.add('is-card');
        var kind = t.getAttribute('data-cursor-kind');
        if (kind) el.classList.add('is-' + kind);
        label.textContent = t.getAttribute('data-cursor');
      } else {
        el.classList.add('is-link');
      }
    });
  }

  function boot() {
    initEyes();
    initCursor();
    initRotator();
    initTill();
    initJourney(document);
    initForecast(document);
    initWipe(document);
    initBands(document);
    initLesson(document);
    initRetrade(document);
    initResched(document);
    initClaim(document);
    initZoom();
    initGate();
    initBrandSwitcher(document);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
