/* MarketMind V2 — coded prototype.
   Rendering, state and interactions only. Every piece of product content (questions,
   results, players, copy) arrives in the encrypted payload and is passed to MM.boot(). */
(function () {
  'use strict';

  var D = null;          // product content, from the payload
  var S = null;          // prototype state
  var root = null;
  var lastRoute = '';
  var cur = '#/intro';    // current route; kept in memory so the app also runs where the URL can't change (previews, sandboxed frames)
  var draft = null;      // in-progress trade on the question screen
  var t0 = Date.now();
  var STORE = 'mm-proto-v1';
  var STEP = 250, MIN_STAKE = 250, MAX_STAKE = 2500, ROUND_COINS = 10000;

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function n0(n) { return Math.round(n).toLocaleString('en-GB'); }
  function signed(n) { return n > 0 ? '+' + n0(n) : n < 0 ? '−' + n0(-n) : '0'; }
  function tone(n) { return n > 0 ? 'tone-success' : n < 0 ? 'tone-destructive' : ''; }
  function fill(s) {
    return String(s)
      .replace(/\{client\}/g, D.client.name)
      .replace(/\{clientPoss\}/g, D.client.possessive)
      .replace(/\{clientPossCap\}/g, D.client.possessiveCap)
      .replace(/\{name\}/g, D.user.name)
      .replace(/\{handle\}/g, D.user.handle);
  }
  function pts(p) { return p % 1 ? p.toFixed(1) : String(p); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function parseNum(raw) {
    if (raw == null) return NaN;
    var s = String(raw).replace(/[\s,$%k£]/gi, '').replace(/−/g, '-');
    if (!/^-?\d*\.?\d+$/.test(s) && !/^-?\d+\.?$/.test(s)) return NaN;
    return parseFloat(s);
  }
  function fmtForecast(fmt, raw) {
    var v = parseNum(raw);
    if (!isFinite(v)) return '—';
    var dec = (String(raw).split('.')[1] || '').replace(/\D/g, '').length;
    switch (fmt) {
      case 'pct': return v.toFixed(Math.max(1, dec)) + '%';
      case 'k': return (v < 0 ? '−' : '') + n0(Math.abs(v)) + 'k';
      case 'usd': return '$' + v.toFixed(2);
      case 'usd0': return '$' + n0(v);
      case 'fx': return v.toFixed(4);
      case 'idx': return v.toFixed(1);
      default: return String(v);
    }
  }
  function inputValue(fmt, raw) {
    var v = parseNum(raw);
    if (!isFinite(v)) return '';
    if (fmt === 'k' || fmt === 'usd0') return n0(v);
    if (fmt === 'usd') return v.toFixed(2);
    return String(raw);
  }
  function countdownText(sec) {
    sec = Math.max(0, Math.floor(sec));
    var d = Math.floor(sec / 86400), h = Math.floor(sec % 86400 / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
    function p(x) { return (x < 10 ? '0' : '') + x; }
    return (d ? d + 'd ' : '') + p(h) + 'h ' + p(m) + 'm ' + p(s) + 's';
  }
  function cdBase(kind) {
    if (kind === 'open') return D.round2.countdown;
    if (kind === 'notStarted') return D.phases.notStarted.countdown;
    return D.phases.between.countdown;
  }
  function cd(kind) {
    return '<span class="mono" data-cd="' + kind + '">' + countdownText(cdBase(kind) - (Date.now() - t0) / 1000) + '</span>';
  }

  /* ---------- state ---------- */
  function freshState() {
    var answers = {};
    D.round2.questions.forEach(function (q) { if (q.answer) answers[q.id] = { forecast: q.answer.forecast, stake: q.answer.stake, conf: q.answer.conf }; });
    return { theme: 'dark', phase: 'open', home: 'B', answers: answers, filter: 'all', tour: null, fresh: null, demoOpen: false, demoHidden: false };
  }
  function load() {
    var s = null;
    try { s = JSON.parse(sessionStorage.getItem(STORE)); } catch (e) { s = null; }
    S = s && s.answers ? s : freshState();
    S.tour = null; S.fresh = null;
    // Deep links for recording: ?clean hides the controls; ?theme=, ?phase= and ?home= set the starting state.
    var qs = location.search;
    if (/[?&]clean\b/.test(qs)) S.demoHidden = true;
    var m = qs.match(/[?&]theme=(dark|light)\b/); if (m) S.theme = m[1];
    m = qs.match(/[?&]phase=(notStarted|open|between|ended)\b/); if (m) S.phase = m[1];
    m = qs.match(/[?&]home=([ABC])\b/); if (m) S.home = m[1];
  }
  function save() {
    try { sessionStorage.setItem(STORE, JSON.stringify(S)); } catch (e) { /* storage blocked: still works for this visit */ }
  }

  /* ---------- derived round 2 numbers ---------- */
  function questions() { return D.round2.questions; }
  function q(id) { return questions().filter(function (x) { return x.id === id; })[0]; }
  function answered() { return questions().filter(function (x) { return S.answers[x.id]; }); }
  function open() { return questions().filter(function (x) { return !S.answers[x.id]; }); }
  function staked(exceptId) {
    var t = 0;
    Object.keys(S.answers).forEach(function (k) { if (+k !== exceptId) t += S.answers[k].stake; });
    return t;
  }
  function unstaked() { return ROUND_COINS - staked(); }
  function bonuses(n) { return D.round2.bonusAt.filter(function (b) { return n >= b; }).length; }
  function nextBonus(n) { return D.round2.bonusAt.filter(function (b) { return n < b; })[0]; }
  function points(n) { return n * 3 + bonuses(n) * 2.5; }

  /* ---------- icons ---------- */
  var LOGO = '<svg class="logo" viewBox="0 0 34 34" aria-hidden="true"><rect width="34" height="34" rx="8" fill="var(--logo-bg)"/><path fill="#FAFAF7" d="M14.2369 10.0118L28.9737 10.0117L24.1023 19.2411C23.5357 20.3434 22.9301 21.4409 22.3607 22.5424C22.1174 23.0131 21.8388 23.5033 21.6092 23.9765C21.4962 23.7895 21.3753 23.546 21.2719 23.3502L20.7148 22.2929L18.959 18.9632L15.9591 13.2815C15.3863 12.1973 14.7954 11.1017 14.2369 10.0118ZM23.327 17.6751L25.5282 13.5098L26.2506 12.143C26.371 11.9155 26.5361 11.6235 26.6424 11.396L19.702 11.3953L17.6012 11.3957C17.366 11.3958 16.7802 11.4115 16.5647 11.3896C16.98 12.1884 17.3994 12.9852 17.8228 13.7798L20.093 18.0775C20.2535 18.3821 21.5207 20.8341 21.5989 20.9041L21.6188 20.9052C21.8125 20.5868 22.0506 20.0964 22.2284 19.7581L23.327 17.6751Z"/><path fill="#FAFAF7" d="M12.3052 10.1678L12.389 10.1465C12.4722 10.2572 12.5545 10.4523 12.6243 10.5806C12.8395 10.9737 13.0498 11.3693 13.255 11.7674L15.2638 15.559C15.5467 16.0883 15.8065 16.6381 16.1133 17.1562C16.1562 17.2286 16.1778 17.3046 16.2174 17.3808C16.342 17.6146 16.4653 17.8492 16.5872 18.0845L18.6302 21.9424L19.3394 23.2862C19.3837 23.3697 19.588 23.7948 19.6441 23.8355C19.6541 23.8783 19.6532 23.8563 19.6351 23.9023C19.4827 23.9266 18.7246 23.9131 18.5254 23.9127L16.1413 23.9123L7.49856 23.9127L5.95786 23.9128C5.81095 23.9128 5.17257 23.9347 5.09069 23.8797L5.0827 23.8539C5.35369 23.3099 5.66448 22.7443 5.94938 22.2037L7.64466 18.9896L12.3052 10.1678ZM7.34659 22.5806C9.01112 22.6088 10.746 22.5847 12.416 22.5844L15.7137 22.5842C16.2666 22.5842 16.8807 22.5716 17.429 22.5865L14.1446 16.3685C13.5708 15.2811 12.997 14.1909 12.4218 13.104C12.4115 13.0844 12.3996 13.0672 12.3779 13.0586C11.7308 14.2468 11.0982 15.4769 10.4658 16.6752L7.34659 22.5806Z"/></svg>';
  var HELP = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12Z"/><path d="M6 5.66c0-.3.08-.6.24-.85.15-.26.37-.47.64-.61a1.67 1.67 0 0 1 2.45 1.61c-.03.3-.13.59-.31.83-.17.24-.41.44-.69.56-.4.2-.66.6-.66 1.07v.4"/><path d="M8 11h.01"/></svg>';
  var PLAY = '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M5 3.5v11l9-5.5z" fill="#fff"/></svg>';

  /* ---------- shell ---------- */
  var NAV = [['home', 'Home', 'Home'], ['round', 'Current round', 'Round'], ['leaderboards', 'Leaderboards', 'Ranks'], ['results', 'Results', 'Results']];
  function navKey(r) {
    if (r.name === 'home') return 'home';
    if (r.name === 'round' || r.name === 'question') return 'round';
    if (r.name === 'boards') return 'leaderboards';
    if (r.name === 'results' || r.name === 'result') return 'results';
    return '';
  }
  function chip() {
    var P = D.phases;
    if (S.phase === 'notStarted') return ['dot--info', P.notStarted.chipLabel, P.notStarted.chipValue];
    if (S.phase === 'between') return ['dot--info', P.between.chipLabel, P.between.chipValue];
    if (S.phase === 'ended') return ['', P.ended.chipLabel, P.ended.chipValue];
    return ['dot--warning', 'Round 2 closes in', D.round2.chipValue];
  }
  function header(r) {
    var k = navKey(r), c = chip();
    var coins = S.phase === 'open' ? n0(unstaked()) : '—';
    return '<header class="mm-header">' +
      '<a class="brand" href="#/home" aria-label="MarketMind home">' + LOGO + '<span class="brand__divider"></span><span class="client-slot" title="Client logo slot">' + esc(D.client.name) + '</span></a>' +
      '<nav class="nav" aria-label="Main">' + NAV.map(function (n) {
        return '<a class="nav__link' + (k === n[0] ? ' is-active' : '') + '" href="#/' + n[0] + '"' + (k === n[0] ? ' aria-current="page"' : '') + '>' + n[1] + '</a>';
      }).join('') + '</nav>' +
      '<div class="header__right">' +
      '<span class="chip"><span class="dot ' + c[0] + '"></span><span class="chip__label">' + c[1] + '</span><span class="chip__value">' + c[2] + '</span></span>' +
      '<span class="chip chip--coins"><span class="chip__label">Available</span><span class="chip__value" data-live="coins">' + coins + '</span><span class="chip__unit">coins</span></span>' +
      '<button class="tour-btn' + (S.tour != null ? ' is-active' : '') + '" data-act="tour" aria-label="Platform tour">' + HELP + '<span>Platform tour</span></button>' +
      '<a class="avatar" href="#/account" aria-label="Account"></a>' +
      '</div></header>';
  }
  function tabbar(r) {
    var k = navKey(r);
    return '<nav class="tabbar" aria-label="Main">' + NAV.map(function (n) {
      return '<a href="#/' + n[0] + '"' + (k === n[0] ? ' class="is-active" aria-current="page"' : '') + '>' + n[2] + '</a>';
    }).join('') + '</nav>';
  }
  function footer() {
    return '<footer class="mm-footer"><div><span class="muted">Market Maker Podcast</span>Friday market review ·<a href="#" data-act="noop">Spotify</a><a href="#" data-act="noop">Apple Podcasts</a></div>' +
      '<div><span class="muted">Support</span>' + esc(D.support.replies) + ' ·<a href="mailto:' + esc(D.support.email) + '">' + esc(D.support.email) + '</a></div></footer>';
  }

  /* ---------- shared pieces ---------- */
  function pageHead(eyebrow, title, lede, action, opts) {
    opts = opts || {};
    return '<div class="page-head"><div class="page-head__text">' +
      (eyebrow ? '<div class="eyebrow">' + esc(eyebrow) + '</div>' : '') +
      '<h1 class="h-display' + (opts.xl ? ' h-display--xl' : '') + '">' + esc(title) + '</h1>' +
      (lede ? '<p class="lede">' + esc(lede) + '</p>' : '') +
      '</div>' + (action || '') + '</div>';
  }
  function stats(list) {
    return '<div class="card stats">' + list.map(function (s) {
      return '<div class="stat"><span class="stat__label">' + esc(s.label) + '</span>' +
        '<span class="stat__value ' + (s.tone ? 'tone-' + s.tone : '') + '">' + esc(s.value) + (s.of ? '<span class="stat__of">' + esc(s.of) + '</span>' : '') + '</span>' +
        '<span class="stat__sub">' + esc(s.sub) + '</span></div>';
    }).join('') + '</div>';
  }
  function roundCard(r, kind, o) {
    o = o || {};
    var cls = 'round-card', h = '';
    if (kind === 'current' || kind === 'next') cls += ' round-card--current';
    if (kind === 'locked' || kind === 'next') cls += ' round-card--locked';
    h += '<div class="round-card__bar"></div><div class="round-card__title">Round ' + r.n + '</div><div class="round-card__dates">' + esc(r.dates) + '</div>';
    if (kind === 'final' || kind === 'provisional') {
      h += '<div class="round-card__status"><span class="dot ' + (kind === 'final' ? 'dot--info' : 'dot--warning') + '"></span>' + (kind === 'final' ? 'Final' : 'Provisional') + '</div>';
      if (!o.btn) h += '<div class="round-card__spacer"></div>';
      h += '<div class="round-card__value ' + tone(o.pnl) + '">' + signed(o.pnl) + '</div><div class="round-card__sub">P&amp;L · ' + esc(o.pts) + '</div>';
      if (o.btn) h += '<div class="round-card__spacer"></div><a class="btn btn--secondary" href="' + o.btn[1] + '">' + o.btn[0] + '</a>';
    } else if (kind === 'current') {
      h += '<div class="round-card__status"><span class="dot dot--fg"></span>In progress</div>' +
        '<div class="round-card__value">' + pts(points(answered().length)) + ' pts</div><div class="round-card__sub">points so far</div>' +
        '<div class="round-card__spacer"></div><a class="btn btn--inverse" href="#/round">Continue</a>';
    } else {
      h += '<div class="round-card__status"><span class="dot ' + (kind === 'next' ? 'dot--fg' : '') + '"></span>Locked</div><div class="round-card__spacer"></div>' +
        '<div class="round-card__value">—</div><div class="round-card__sub">' + (kind === 'next' ? 'Opens next' : 'Not open yet') + '</div>';
    }
    return '<div class="' + cls + '">' + h + '</div>';
  }
  function roundsSection(wide) {
    var R = D.rounds, ph = S.phase, cards;
    if (ph === 'notStarted') cards = R.map(function (r, i) { return roundCard(r, i === 0 ? 'next' : 'locked'); });
    else if (ph === 'between') cards = R.map(function (r, i) {
      if (i === 0) return roundCard(r, 'final', { pnl: 2250, pts: '31 of 40 pts', btn: ['Results', '#/results'] });
      if (i === 1) return roundCard(r, 'provisional', { pnl: D.phases.between.round2.pnl, pts: D.phases.between.round2.pts, btn: ['Board', '#/leaderboards/pnl'] });
      return roundCard(r, i === 2 ? 'next' : 'locked');
    });
    else if (ph === 'ended') cards = R.map(function (r, i) {
      var x = D.phases.ended.roundResults[i];
      return roundCard(r, 'final', { pnl: x.pnl, pts: x.pts, btn: i === 0 ? ['Results', '#/results'] : null });
    });
    else cards = R.map(function (r, i) {
      if (i === 0) return roundCard(r, 'final', { pnl: 2250, pts: '31 of 40 pts', btn: ['Results', '#/results'] });
      if (i === 1) return roundCard(r, 'current');
      return roundCard(r, 'locked');
    });
    return '<section class="stack gap-16" data-tour="rounds"><div class="section-head"><h2 class="h2">Your tournament</h2><span class="muted">Six weekly rounds</span></div>' +
      '<div class="rounds' + (wide ? ' rounds--wide' : '') + '">' + cards.join('') + '</div></section>';
  }
  function countdownCard(p, kind) {
    return '<div class="countdown-card"><div class="countdown-label">' + esc(p.cardLabel) + '</div><div class="countdown">' + cd(kind) + '</div>' +
      '<div class="countdown-date">' + esc(p.cardDate) + '</div>' +
      p.rows.map(function (row) { return '<div class="kv"><span>' + esc(row[0]) + '</span><span class="mono">' + esc(row[1]) + '</span></div>'; }).join('') + '</div>';
  }

  /* ---------- views ---------- */
  function viewIntro() {
    var I = D.intro;
    return '<div class="page">' +
      '<div class="stack gap-8"><div class="eyebrow">' + esc(fill(I.eyebrow)) + '</div><h1 class="h-display h-display--xl">' + esc(I.title) + '</h1></div>' +
      '<div class="intro-grid">' +
      '<button class="video" data-act="video" aria-label="Play the introduction video">' +
      '<span class="video__bar">AMPLIFYME <span style="opacity:.4">|</span> <span class="client-slot">' + esc(D.client.name) + '</span></span>' +
      '<span class="video__copy"><span class="video__kicker">' + esc(I.video.kicker) + '</span><br><span class="video__title">' + esc(I.video.title) + '</span><span class="video__rule" style="display:block"></span></span>' +
      '<span class="video__play">' + PLAY + '</span><span class="video__time">' + esc(I.video.duration) + '</span><span class="video__progress"></span></button>' +
      '<div class="intro-text">' + I.paras.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
      '<div class="btn-row" style="margin-top:4px"><a class="btn btn--primary" href="#/home">Start tournament</a><button class="btn btn--secondary" data-act="tour">Take the platform tour</button></div></div>' +
      '</div>' +
      '<div class="card steps"><div class="steps__head">How it works · 3 steps</div><div class="steps__grid">' +
      I.steps.map(function (s) { return '<div><div class="steps__n serif">' + esc(s.n) + '</div><div class="steps__t">' + esc(s.title) + '</div><div class="steps__b">' + esc(s.body) + '</div></div>'; }).join('') +
      '</div></div></div>';
  }

  function viewHome() {
    var ph = S.phase, body = '';
    if (ph === 'notStarted' || ph === 'between') {
      var p = D.phases[ph];
      var btns = ph === 'notStarted'
        ? '<a class="btn btn--primary" href="#/intro">Watch the introduction</a><button class="btn btn--secondary" data-act="tour">Take the platform tour</button>'
        : '<a class="btn btn--primary" href="#/leaderboards/pnl">View provisional leaderboard</a><a class="btn btn--secondary" href="#/results">Round 1 results</a>';
      body = '<div class="hero-split"><div class="hero-split__text"><div class="eyebrow">' + esc(fill(p.eyebrow)) + '</div><h1 class="h-display">' + esc(p.title) + '</h1><p class="lede">' + esc(p.body) + '</p><div class="btn-row">' + btns + '</div></div>' +
        countdownCard(p, ph) + '</div>' + roundsSection(false);
    } else if (ph === 'ended') {
      var e = D.phases.ended;
      body = '<div class="stack gap-8"><div class="eyebrow">' + esc(e.eyebrow) + '</div><h1 class="h-display">' + esc(e.title) + '</h1><p class="lede fg2" style="margin-top:22px;color:var(--fg-2)">' + esc(fill(e.body)) + '</p>' +
        '<div class="btn-row" style="margin-top:12px"><a class="btn btn--primary" href="#/leaderboards">View final leaderboards</a></div></div>' + stats(e.stats) + roundsSection(false);
    } else if (S.home === 'A') {
      body = roundsSection(true);
    } else if (S.home === 'C') {
      var P = D.performance, o = open();
      body = pageHead(P.eyebrow, P.title, P.body) + stats(P.stats) +
        '<div class="banner"><span class="dot dot--warning"></span><span>Round 2 · <strong>' + o.length + ' question' + (o.length === 1 ? '' : 's') + ' open</strong> · closes in ' + cd('open') + '</span>' +
        (o.length ? '<a class="btn btn--primary" href="#/round/q/' + o[0].id + '">Answer question ' + o[0].id + '</a>' : '<a class="btn btn--primary" href="#/round">Review answers</a>') + '</div>' +
        roundsSection(false);
    } else {
      var op = open(), nx = op[0], a = answered().length, nb = nextBonus(a);
      var main = nx
        ? '<div class="eyebrow" style="color:inherit">Next up · Round 2 · Question ' + nx.id + ' of 10</div><h1 class="h-display">Answer question ' + nx.id + ' before round 2 closes.</h1><p class="hero__q">' + esc(nx.q) + '</p>' +
          '<div class="hero__actions"><a class="btn btn--inverse" href="#/round/q/' + nx.id + '">Answer question ' + nx.id + '</a><a class="btn btn--outline-inverse" href="#/round">Round overview</a></div>'
        : '<div class="eyebrow" style="color:inherit">Round 2 · all ten answered</div><h1 class="h-display">Every question answered. Edit until round 2 closes.</h1><p class="hero__q">Forecasts and stakes stay editable until Thursday at 18:00. Unstaked coins don’t carry over.</p>' +
          '<div class="hero__actions"><a class="btn btn--inverse" href="#/round">Review your trades</a></div>';
      body = '<div class="hero"><div class="hero__main">' + main + '</div><div class="hero__side"><div class="countdown-label">Round 2 closes in</div><div class="countdown">' + cd('open') + '</div><div class="countdown-date">' + esc(D.round2.closes) + '</div>' +
        '<div class="kv"><span>Answered</span><span class="mono">' + a + ' of 10</span></div>' +
        '<div class="kv"><span>Unstaked coins</span><span class="mono">' + n0(unstaked()) + '</span></div>' +
        '<div class="kv"><span>Next bonus</span><span class="mono">' + (nb ? 'at ' + nb + ' answers · +2.5' : 'All 4 earned') + '</span></div></div></div>' +
        roundsSection(false);
    }
    return '<div class="page stack gap-28">' + body + '</div>' + footer();
  }

  function ring(n) {
    var r = 27, c = 2 * Math.PI * r, frac = n / 10, dots = '';
    D.round2.bonusAt.forEach(function (b) {
      var ang = (b / 10) * 2 * Math.PI - Math.PI / 2, x = 32 + r * Math.cos(ang), y = 32 + r * Math.sin(ang), on = n >= b;
      dots += '<circle cx="' + x.toFixed(2) + '" cy="' + y.toFixed(2) + '" r="3.5" fill="' + (on ? 'var(--primary)' : 'var(--card)') + '" stroke="' + (on ? 'var(--card)' : 'var(--border-strong)') + '" stroke-width="2"/>';
    });
    return '<div class="ring"><svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="' + r + '" fill="none" stroke="var(--muted)" stroke-width="5"/>' +
      '<circle cx="32" cy="32" r="' + r + '" fill="none" stroke="var(--primary)" stroke-width="5" stroke-dasharray="' + (c * frac).toFixed(2) + ' ' + c.toFixed(2) + '" transform="rotate(-90 32 32)" style="transition:stroke-dasharray .5s"/>' + dots + '</svg>' +
      '<span class="ring__n">' + n + '</span></div>';
  }
  function qCard(x) {
    var a = S.answers[x.id];
    var top = '<div class="q-card__top"><span class="q-card__num">Q' + x.id + '</span><span class="pill' + (a ? ' pill--primary' : '') + '"><span class="dot ' + (a ? 'dot--primary' : '') + '"></span>' + (a ? 'Answered' : 'Open') + '</span></div>' +
      '<div class="q-card__title">' + esc(x.q) + '</div>';
    if (!a) return '<a class="q-card q-card--open" href="#/round/q/' + x.id + '">' + top + '<div class="q-card__foot"><span class="muted">' + esc(x.resolves) + '</span><span class="link-arrow">Answer →</span></div></a>';
    var win = a.stake * 3, lose = a.stake;
    return '<a class="q-card' + (S.fresh === x.id ? ' q-card--fresh' : '') + '" href="#/round/q/' + x.id + '">' + top +
      '<div class="q-card__stats"><div><small>Forecast</small><span class="mono">' + esc(fmtForecast(x.fmt, a.forecast)) + '</span></div><div><small>Stake</small><span class="mono">' + n0(a.stake) + '</span></div><div><small>Confidence</small><span class="mono">' + a.conf + ' / 100</span></div></div>' +
      '<div><div class="risk"><span class="risk__lose" style="width:' + (lose / 7450 * 50).toFixed(2) + '%"></span><span class="risk__win" style="width:' + (win / 7450 * 50).toFixed(2) + '%"></span><span class="risk__mid"></span></div>' +
      '<div class="q-card__money"><span class="mono">win up to <span class="tone-success">+' + n0(win) + '</span> · lose <span class="tone-destructive">−' + n0(lose) + '</span></span><span class="q-card__edit">Edit →</span></div></div></a>';
  }
  function viewRound() {
    var ph = S.phase;
    if (ph !== 'open') {
      var p = D.phases[ph], kind = ph === 'ended' ? null : ph;
      var btns = ph === 'between' ? '<a class="btn btn--primary" href="#/leaderboards/pnl">View provisional leaderboard</a><a class="btn btn--secondary" href="#/home">Back to home</a>'
        : ph === 'ended' ? '<a class="btn btn--primary" href="#/leaderboards">View final leaderboards</a><a class="btn btn--secondary" href="#/home">Back to home</a>'
        : '<a class="btn btn--primary" href="#/intro">Watch the introduction</a><a class="btn btn--secondary" href="#/home">Back to home</a>';
      return '<div class="page"><div class="round-closed"><div class="eyebrow">' + esc(p.roundEyebrow) + '</div><h1 class="h-display">' + esc(p.roundTitle) + '</h1><p class="lede" style="color:var(--fg-2)">' + esc(p.roundBody) + '</p>' +
        (kind ? '<div class="timer-pill"><span class="muted">Opens in</span>' + cd(kind) + '</div>' : '') +
        '<div class="btn-row">' + btns + '</div></div></div>';
    }
    var a = answered(), o = open(), n = a.length, un = unstaked(), nb = nextBonus(n), p2 = points(n);
    var segs = a.map(function (x) { return '<span class="meter__seg" style="flex:0 0 calc(' + (S.answers[x.id].stake / ROUND_COINS * 100).toFixed(2) + '% - 2px)"></span>'; }).join('') +
      (un > 0 ? '<span class="meter__seg meter__seg--warning" style="flex:1 1 auto"></span>' : '');
    var f = S.filter;
    var openBlock = (f !== 'answered' && o.length) ? '<div><div class="q-group-label">Open · ' + o.length + ' · answer before ' + esc(D.round2.closes) + '</div><div class="q-grid">' + o.map(qCard).join('') + '</div></div>' : '';
    var ansBlock = (f !== 'open' && a.length) ? '<div><div class="q-group-label">Answered · ' + a.length + ' · editable until the round closes</div><div class="q-grid">' + a.map(qCard).join('') + '</div></div>' : '';
    if (!openBlock && !ansBlock) openBlock = '<p class="muted">' + (f === 'open' ? 'Every question is answered. You can still edit until the round closes.' : 'No answers yet.') + '</p>';
    return '<div class="page stack gap-28">' +
      pageHead('Current round · Round 2 of 6 · ' + D.round2.daysLeft, n + ' of 10 answered. ' + n0(un) + ' coins unallocated.', 'Unstaked coins don’t carry over to round 3.', '<a class="btn btn--secondary" href="#/leaderboards">View leaderboards</a>') +
      '<div class="card progress-band">' +
      '<div class="ring-wrap">' + ring(n) + '<div><div class="h2">' + n + ' of 10 answered</div><div class="muted">' + (nb ? (nb - n) + ' answer' + (nb - n === 1 ? '' : 's') + ' to the next bonus · +2.5 pts' : 'Every bonus earned this round') + '</div></div></div>' +
      '<div><div class="meter-head"><span class="big">' + pts(p2) + '</span><span class="muted">of 40 points</span><span class="right">' + bonuses(n) + ' of 4 bonuses</span></div><div class="meter"><span class="meter__fill" style="width:' + (p2 / 40 * 100) + '%"></span></div></div>' +
      '<div><div class="meter-head"><span class="big tone-warning">' + n0(un) + '</span><span class="muted">coins unstaked</span><span class="right">of 10,000</span></div><div class="meter">' + segs + '</div></div>' +
      '</div>' +
      '<section class="stack gap-16"><div class="questions-head"><h2 class="h2">Questions</h2><div class="seg" role="tablist">' +
      [['all', 'All · 10'], ['open', 'Open · ' + o.length], ['answered', 'Answered · ' + a.length]].map(function (t) {
        return '<button class="seg__btn' + (f === t[0] ? ' is-active' : '') + '" role="tab" aria-selected="' + (f === t[0]) + '" data-act="filter" data-v="' + t[0] + '">' + t[1] + '</button>';
      }).join('') + '</div></div>' + openBlock + ansBlock + '</section></div>';
  }

  /* Question screen */
  function maxStakeFor(id) {
    var avail = ROUND_COINS - staked(id);
    return Math.min(MAX_STAKE, Math.floor(avail / STEP) * STEP);
  }
  function viewQuestion(id) {
    var x = q(id);
    if (!x) return viewRound();
    var a = S.answers[id], editing = !!a;
    if (!draft || draft.id !== id) {
      var mx = maxStakeFor(id);
      draft = { id: id, forecast: a ? inputValue(x.fmt, a.forecast) : '', stake: a ? a.stake : clamp(1000, MIN_STAKE, Math.max(MIN_STAKE, mx)), conf: a ? a.conf : null, touched: false };
    }
    var others = staked(id);
    return '<div class="page">' +
      '<a class="link-back" href="#/round">← Round 2 overview</a>' +
      '<div class="q-layout"><div class="card q-main" data-tour="question">' +
      '<div class="q-sec"><div class="q-meta">Question ' + id + ' of 10 · Round 2' + (editing ? '<span class="pill pill--primary"><span class="dot dot--primary"></span><span style="color:var(--foreground);font-weight:400">Editing your trade</span></span>' : '') + '</div>' +
      '<h1 class="q-title">' + esc(x.q) + '</h1><p class="q-hint">' + esc(x.hint) + '</p></div>' +
      '<div class="q-sec q-two"><div><label class="q-label" for="fc">Your forecast</label><div class="field" id="fc-field"><input id="fc" inputmode="decimal" autocomplete="off" placeholder="' + esc(x.placeholder) + '" value="' + esc(draft.forecast) + '"><span class="field__unit">' + esc(x.unit) + '</span></div></div>' +
      '<div><span class="q-label">Coins this round</span><div class="coins-table"><div><span class="mono">10,000</span><small>Allocated</small></div><div><span class="mono">' + n0(others) + '</span><small>Already staked</small></div><div><span class="mono">' + n0(ROUND_COINS - others) + '</span><small>Available</small></div></div></div></div>' +
      '<div class="q-sec"><div class="stake-head"><label class="q-label" for="stake">Your stake</label><span class="stake-val" data-q="stake">' + n0(draft.stake) + '</span><span class="stake-unit">coins</span></div>' +
      '<input class="range" id="stake" type="range" min="' + MIN_STAKE + '" max="' + MAX_STAKE + '" step="' + STEP + '" value="' + draft.stake + '" aria-valuetext="' + n0(draft.stake) + ' coins">' +
      '<div class="range-legend"><span>250 min</span><span>2,500 max stake</span></div>' +
      '<div class="info-box" data-q="info"></div></div>' +
      '<div class="q-sec" data-tour="confidence"><div class="conf-head"><label for="conf">How confident are you that your forecast will fall within ' + esc(x.partial) + ' of the actual outcome?</label><span data-q="badge"></span></div>' +
      '<input class="range" id="conf" type="range" min="0" max="100" step="5" value="' + (draft.conf == null ? 50 : draft.conf) + '">' +
      '<div class="range-legend"><span>Not at all (0)</span><span class="center" data-q="confval"></span><span>Certain (100)</span></div></div>' +
      '<div class="q-sec q-foot"><button class="btn btn--primary btn--place" data-act="place">' + (editing ? 'Update trade' : 'Place trade') + '</button><span class="q-foot__summary" data-q="summary"></span>' +
      '<span class="q-foot__nav"><a class="btn btn--ghost" href="#/round/q/' + (id > 1 ? id - 1 : 10) + '">← Previous</a><a class="btn btn--ghost" href="#/round/q/' + (id < 10 ? id + 1 : 1) + '">Next →</a></span></div>' +
      '</div>' +
      '<div class="side-stack"><div class="card" data-tour="payout"><div class="payout__head" data-q="payhead"></div>' +
      '<div class="payout__row"><span class="dot dot--success"></span><div><div class="payout__name">Bullseye</div><div class="muted">within ' + esc(x.bull) + ' of your forecast</div></div><span class="payout__val mono" data-q="pbull"></span></div>' +
      '<div class="payout__row"><span class="dot dot--warning"></span><div><div class="payout__name">Partial</div><div class="muted">within ' + esc(x.partial) + '</div></div><span class="payout__val mono" data-q="ppart"></span></div>' +
      '<div class="payout__row"><span class="dot dot--destructive"></span><div><div class="payout__name">Miss</div><div class="muted">further out</div></div><span class="payout__val mono">0 · stake lost</span></div></div>' +
      '<div class="card">' + acc('Background', x.background, true) + acc('How this resolves', x.how, false) + '</div></div>' +
      '</div></div>';
  }
  function acc(title, body, isOpen) {
    return '<div class="acc"><button class="acc__btn" data-act="acc" aria-expanded="' + isOpen + '"><span>' + esc(title) + '</span><span aria-hidden="true">' + (isOpen ? '−' : '+') + '</span></button>' +
      '<div class="acc__body"' + (isOpen ? '' : ' hidden') + '>' + esc(body) + '</div></div>';
  }
  function updateQuestion() {
    if (!draft) return;
    var x = q(draft.id), mx = maxStakeFor(draft.id);
    var st = $('#stake'), cf = $('#conf');
    if (!st) return;
    if (draft.stake > mx && mx >= MIN_STAKE) { draft.stake = mx; st.value = mx; }
    st.style.setProperty('--pct', ((draft.stake - MIN_STAKE) / (MAX_STAKE - MIN_STAKE) * 100) + '%');
    st.setAttribute('aria-valuetext', n0(draft.stake) + ' coins');
    $('[data-q="stake"]').textContent = n0(draft.stake);
    var info = $('[data-q="info"]');
    if (mx < MIN_STAKE) { info.className = 'info-box is-warning'; info.innerHTML = '<span class="dot dot--warning"></span><span>All 10,000 coins are staked this round. Lower another stake to free some up.</span>'; }
    else if (mx < MAX_STAKE) { info.className = 'info-box is-warning'; info.innerHTML = '<span class="dot dot--warning"></span><span>Only ' + n0(mx) + ' coins left to stake this round, so that’s your max here.</span>'; }
    else { info.className = 'info-box'; info.innerHTML = '<span class="dot"></span><span>Your whole 2,500 stake range is available on this question.</span>'; }
    var set = draft.conf != null;
    cf.classList.toggle('is-unset', !set);
    cf.style.setProperty('--pct', (set ? draft.conf : 0) + '%');
    $('[data-q="badge"]').innerHTML = set ? '<span class="pill pill--success"><span class="dot dot--success"></span>Set</span>' : '<span class="pill pill--warning"><span class="dot dot--warning"></span>Required</span>';
    var cv = $('[data-q="confval"]');
    cv.textContent = set ? draft.conf + ' / 100' : 'Not set — drag to answer';
    cv.classList.toggle('is-set', set);
    var fv = parseNum(draft.forecast), okF = isFinite(fv), sum = $('[data-q="summary"]');
    $('#fc-field').classList.toggle('is-invalid', draft.touched && draft.forecast !== '' && !okF);
    if (draft.forecast !== '' && !okF) sum.textContent = 'Enter a number, e.g. ' + x.placeholder;
    else if (!okF) sum.textContent = 'Enter your forecast to continue';
    else if (!set) sum.textContent = 'Set your confidence to continue';
    else sum.textContent = 'Staking ' + n0(draft.stake) + ' at ' + draft.conf + ' confidence · win up to ' + n0(draft.stake * 3) + ' · lose ' + n0(draft.stake) + ' on a miss';
    $('[data-act="place"]').disabled = !(okF && set && mx >= MIN_STAKE);
    $('[data-q="payhead"]').textContent = 'What earns a payout · on ' + n0(draft.stake);
    $('[data-q="pbull"]').textContent = n0(draft.stake * 3) + ' coins';
    $('[data-q="ppart"]').textContent = n0(draft.stake * 1.5) + ' coins';
  }
  function placeTrade() {
    var x = q(draft.id), was = !!S.answers[draft.id], v = parseNum(draft.forecast);
    if (!isFinite(v) || draft.conf == null) return;
    var clean = String(draft.forecast).replace(/[\s,$%k£]/gi, '').replace(/−/g, '-');
    S.answers[draft.id] = { forecast: clean, stake: draft.stake, conf: draft.conf };
    S.fresh = draft.id;
    save();
    toast((was ? 'Trade updated' : 'Trade placed') + ' · Q' + x.id + ' · ' + fmtForecast(x.fmt, clean) + ' · ' + n0(draft.stake) + ' coins');
    draft = null;
    go('#/round');
  }

  /* Results */
  var VERDICT = { bullseye: ['Bullseye', 'v-bullseye', 'dot--success'], partial: ['Partial', 'v-partial', 'dot--warning'], miss: ['Miss', 'v-miss', 'dot--destructive'], none: ['Not answered', 'v-none', ''] };
  function viewResults() {
    if (S.phase === 'notStarted') return emptyView('Results', 'Results appear when round 1 resolves.', 'Each forecast will show what you said, what happened and what it earned. Round 1 opens Friday 18 September.');
    var R = D.round1;
    return '<div class="page stack gap-28">' + pageHead(R.eyebrow, R.title, R.body, '<a class="btn btn--primary" href="#/leaderboards/pnl">View full leaderboard</a>') +
      stats(R.stats) +
      '<section class="stack gap-16"><div class="section-head"><h2 class="h2">Your ten forecasts</h2><span class="muted">Open any question to see how it resolved</span></div>' +
      '<div class="verdict-grid" data-tour="forecasts">' + R.questions.map(function (x) {
        var v = VERDICT[x.result];
        return '<a class="verdict-card" href="#/results/q/' + x.id + '"><div class="verdict-card__head ' + v[1] + '"><span class="dot ' + v[2] + '"></span>' + v[0] +
          '<span class="mono ' + (x.result === 'none' ? '' : tone(x.pnl)) + '">' + (x.result === 'none' ? '—' : signed(x.pnl)) + '</span></div>' +
          '<div class="verdict-card__body"><div class="muted">Question ' + x.id + '</div><div class="verdict-card__title">' + esc(x.q) + '</div>' +
          '<div class="trio"><div><small>You said</small><span class="mono">' + esc(x.you) + '</span></div><div><small>Actual</small><span class="mono">' + esc(x.actual) + '</span></div><div><small>Staked</small><span class="mono">' + (x.stake ? n0(x.stake) : '—') + '</span></div></div></div></a>';
      }).join('') + '</div></section></div>';
  }
  function bandText(x, v) {
    if (x.fmt === 'k') return n0(v) + 'k';
    if (x.unit === 'pp') return (+v.toFixed(2)) + 'pp';
    if (x.unit === '$') return '$' + v.toFixed(2);
    return String(+v.toFixed(4));
  }
  function viewResult(id) {
    var x = D.round1.questions.filter(function (z) { return z.id === id; })[0];
    if (!x) return viewResults();
    var none = x.result === 'none', v = VERDICT[x.result];
    var cls = none ? 'is-none' : 'is-' + x.result, tint = v[1];
    var span = x.partial * 2.5, lo = x.a - span, w = span * 2;
    function pos(val) { return clamp((val - lo) / w * 100, 1.5, 98.5); }
    function lbl(val) { var p = pos(val); return 'left:' + p + '%' + (p > 82 ? ';transform:translateX(calc(-100% + 8px))' : p < 18 ? ';transform:translateX(-8px)' : ''); }
    var mult = x.result === 'bullseye' ? '×3 payout' : x.result === 'partial' ? '×1.5 payout' : 'stake lost';
    var caption = none ? 'No forecast placed · no coins at stake' : 'coins on a ' + n0(x.stake) + ' stake · ' + mult;
    var landed = x.result === 'bullseye' || x.result === 'partial';
    var conf;
    if (none) conf = 'You didn’t answer this question, so it doesn’t count toward your forecaster profile. Answering all ten also unlocks the last bonus milestone.';
    else if (landed && x.conf >= 50) conf = 'You were ' + x.conf + ' / 100 confident of landing within the partial band and did. Well-calibrated confidence on correct calls lifts your forecaster profile.';
    else if (landed) conf = 'You were ' + x.conf + ' / 100 confident of landing within the partial band and did. Backing calls like this a little more would sharpen your profile.';
    else if (x.conf >= 50) conf = 'You were ' + x.conf + ' / 100 confident of landing within the partial band and missed. Confidence on misses weighs on your forecaster profile.';
    else conf = 'You were ' + x.conf + ' / 100 confident and missed. Low confidence on a miss is well calibrated, so it counts in your favour.';
    var youColor = x.result === 'bullseye' ? 'var(--success)' : x.result === 'partial' ? 'var(--warning)' : 'var(--destructive)';
    var chart = '<div class="chart"><div class="muted" style="color:var(--fg-2)">Forecast vs actual</div><div class="chart__track">' +
      '<span class="chart__band chart__band--partial" style="left:' + pos(x.a - x.partial) + '%;right:' + (100 - pos(x.a + x.partial)) + '%"></span>' +
      '<span class="chart__band chart__band--bull" style="left:' + pos(x.a - x.bull) + '%;right:' + (100 - pos(x.a + x.bull)) + '%"></span>' +
      (none ? '' : '<span class="chart__you" style="left:' + pos(x.y) + '%;background:' + youColor + '"></span><span class="chart__lbl chart__lbl--top" style="' + lbl(x.y) + '">You · ' + esc(x.you) + '</span>') +
      '<span class="chart__actual" style="left:' + pos(x.a) + '%"></span><span class="chart__lbl chart__lbl--bottom" style="' + lbl(x.a) + '">Actual · ' + esc(x.actual) + '</span></div>' +
      '<div class="chart__legend"><span><i class="chart__band--bull" style="position:static"></i>Bullseye ± <span class="mono">' + bandText(x, x.bull) + '</span></span><span><i class="chart__band--partial" style="position:static"></i>Partial ± <span class="mono">' + bandText(x, x.partial) + '</span></span></div></div>';
    return '<div class="page">' +
      '<a class="link-back" href="#/results">← Round 1 results</a>' +
      '<div class="eyebrow" style="margin-top:22px">Question ' + x.id + ' of 10 · Round 1 · Resolved</div><h1 class="q-title" style="max-width:720px">' + esc(x.q) + '</h1>' +
      '<div class="q-layout" style="margin-top:24px"><div class="stack gap-16">' +
      '<div class="result-hero ' + cls + ' ' + tint + '"><div class="result-hero__top"><span class="verdict-tag ' + (none ? '' : 'tone-' + (x.result === 'bullseye' ? 'success' : x.result === 'partial' ? 'warning' : 'destructive')) + '"><span class="dot ' + v[2] + '"></span>' + v[0] + '</span>' +
      '<span class="result-amount ' + (none ? '' : tone(x.pnl)) + '">' + (none ? '—' : signed(x.pnl)) + '</span><span style="color:var(--fg-2);font-size:15px">' + caption + '</span></div>' + chart +
      '<div class="result-stats"><div><small>Your forecast</small><span class="mono">' + esc(x.you) + '</span></div><div><small>Actual</small><span class="mono">' + esc(x.actual) + '</span></div><div><small>Difference</small><span class="mono">' + esc(x.diff || '—') + '</span></div><div><small>Confidence</small><span class="mono">' + (none ? '—' : x.conf + ' / 100') + '</span></div></div></div>' +
      '<div class="card side-card"><h3>Confidence &amp; accuracy</h3><p style="font-size:15px;line-height:1.55">' + esc(conf) + '</p></div>' +
      '</div><div class="side-stack"><div class="card side-card"><h3>How this resolved</h3><p>' + esc(x.how) + '</p><p>Points are awarded for answering, not for accuracy: ' + (none ? 'no points for this question.' : '+3 points for this question.') + ' Your accuracy and confidence feed your forecaster profile, and are not what earns coins.</p></div>' +
      '<div class="card side-card"><h3>What happened in the market</h3><p>' + esc(D.round1.market) + '</p><div class="btn-row" style="margin-top:12px"><a class="btn btn--secondary btn--sm" href="#" data-act="noop">Spotify</a><a class="btn btn--secondary btn--sm" href="#" data-act="noop">Apple Podcasts</a></div></div></div></div>' +
      '<div class="btn-row" style="margin-top:20px">' + (id > 1 ? '<a class="btn btn--ghost" href="#/results/q/' + (id - 1) + '">← Question ' + (id - 1) + '</a>' : '') + (id < 10 ? '<a class="btn btn--ghost" href="#/results/q/' + (id + 1) + '">Question ' + (id + 1) + ' →</a>' : '') + '</div></div>';
  }

  /* Leaderboards */
  function viewBoards(tab) {
    if (S.phase === 'notStarted') return emptyView('Leaderboards · 312 players', 'The boards fill up once round 1 resolves.', D.boards.intro);
    var B = S.phase === 'ended' ? D.boards.final : D.boards.round1, b = B[tab];
    var order = [b.podium[1], b.podium[0], b.podium[2]];
    var medal = { 1: 'gold', 2: 'silver', 3: 'bronze' };
    var podium = '<div class="podium">' + order.map(function (p) {
      return '<div class="podium__col podium__col--' + p.rank + (p.you ? ' is-you' : '') + '"><span class="medal medal--' + p.rank + ' medal--' + medal[p.rank] + (p.you ? ' is-you' : '') + '"></span>' +
        '<span class="podium__name">' + esc(p.name) + '</span><span class="podium__score">' + esc(p.score) + '</span><div class="podium__block"><span class="serif">' + p.rank + '</span></div></div>';
    }).join('') + '</div>';
    var rows = b.rows.map(function (r) {
      var mv = r.move ? '<span class="board-row__move ' + (r.move > 0 ? 'tone-success' : 'tone-destructive') + '">' + (r.move > 0 ? '▲ ' : '▼ ') + Math.abs(r.move) + '</span>' : '<span class="board-row__move"></span>';
      return '<div class="board-row' + (r.you ? ' is-you' : '') + '"><span class="board-row__rank">' + r.rank + '</span><div style="min-width:0"><div class="board-row__name">' + esc(r.name) + (r.you ? '<span class="you-tag">You</span>' : '') + '</div><div class="board-row__sub">' + esc(r.sub) + '</div></div>' + mv +
        '<span class="board-row__score">' + esc(r.score) + '</span></div>';
    }).join('');
    var P = b.position;
    var pos = '<div class="position"><div class="position__top"><div>Your position</div><div class="position__rank serif">' + esc(P.rank) + '</div><div class="position__sub">' + esc(P.sub) + '</div></div>' +
      P.rows.map(function (r) { return '<div class="position__row"><span>' + esc(r[0]) + '</span><span class="mono">' + esc(r[1]) + '</span></div>'; }).join('') +
      '<div class="position__note">' + esc(P.note) + '</div></div>';
    return '<div class="page">' +
      '<div class="page-head"><div class="page-head__text"><div class="eyebrow">' + esc(B.eyebrow) + '</div><h1 class="h-display">' + esc(B.title) + '</h1><p class="lede" style="color:var(--fg-2)">' + esc(D.boards.intro) + '</p></div>' +
      '<span class="pill pill--primary badge-top"><span class="dot dot--primary"></span>' + esc(B.badge) + '</span></div>' +
      '<div data-tour="boards"><div class="tabs" role="tablist"><a class="tab' + (tab === 'points' ? ' is-active' : '') + '" role="tab" aria-selected="' + (tab === 'points') + '" href="#/leaderboards" style="display:grid;place-items:center">Points</a><a class="tab' + (tab === 'pnl' ? ' is-active' : '') + '" role="tab" aria-selected="' + (tab === 'pnl') + '" href="#/leaderboards/pnl" style="display:grid;place-items:center">Profit &amp; Loss</a></div>' +
      podium + '</div>' +
      '<div class="board-grid"><div><h2 class="h2">Ranks 4–8 · of 312 players</h2><div class="board-rows">' + rows + '</div></div>' + pos + '</div></div>';
  }

  function viewAccount() {
    var U = D.user, A = D.account, C = D.support;
    function sec(title, rows) {
      return '<div class="card acct-section"><div class="acct-section__head"><span>' + title + '</span><button class="btn btn--secondary btn--xs" data-act="noop">Edit</button></div>' +
        rows.map(function (r) { return '<div class="acct-row"><span>' + esc(r[0]) + '</span><span' + (r[2] ? ' class="mono"' : '') + '>' + esc(r[1]) + '</span></div>'; }).join('') + '</div>';
    }
    return '<div class="page">' + pageHead(fill(A.eyebrow), fill(A.title), fill(A.body)) +
      '<div class="q-layout"><div class="stack gap-16">' +
      sec('Profile information', [['Anonymous handle', U.handle, 1], ['Shown on', 'Points and P&L leaderboards']]) +
      sec('Personal information', [['Full name', U.name], ['Email', U.email, 1], ['Country', U.country]]) +
      sec('Education', [['University', U.university], ['Degree', U.degree], ['Graduation', U.graduation, 1]]) +
      '</div><div class="stack gap-16"><div class="contact"><div class="muted" style="color:var(--fg-2)">Get in touch</div><div class="contact__who"><span class="avatar"></span><div><div style="font-size:15px;font-weight:500">' + esc(C.team) + '</div><div class="muted">' + esc(C.replies) + '</div></div></div>' +
      '<div class="contact__lines"><a href="mailto:' + esc(C.email) + '">' + esc(C.email) + '</a><br>' + esc(C.phone) + '<br>' + esc(C.address) + '</div></div>' +
      '<div class="btn-row" style="margin-top:0"><button class="btn btn--secondary btn--sm" data-act="tour">Platform tour</button><button class="btn btn--ghost" data-act="logout">Log out</button></div>' +
      '<div class="mono" style="font-size:12px;font-weight:400;color:var(--fg-3)">' + esc(C.version) + '</div></div></div></div>';
  }

  function emptyView(eyebrow, title, body) {
    return '<div class="page"><div class="round-closed"><div class="eyebrow">' + esc(eyebrow) + '</div><h1 class="h-display">' + esc(title) + '</h1><p class="lede" style="color:var(--fg-2)">' + esc(body) + '</p>' +
      '<div class="btn-row"><a class="btn btn--primary" href="#/home">Back to home</a><button class="btn btn--secondary" data-act="tour">Take the platform tour</button></div></div></div>';
  }

  /* ---------- router ---------- */
  function go(h, replace) {
    cur = h;
    // Keep the address bar in step where the page owns its URL; inside a sandboxed preview this throws and is skipped.
    try { if (location.protocol === 'http:' || location.protocol === 'https:' || location.protocol === 'file:') history[replace ? 'replaceState' : 'pushState'](null, '', h); } catch (e) { /* in-memory only */ }
    render(false);
  }
  function route() {
    var h = (cur || '').replace(/^#\/?/, '').split('/');
    var a = h[0] || 'intro';
    if (a === 'round' && h[1] === 'q' && h[2]) return { name: 'question', id: +h[2] };
    if (a === 'results' && h[1] === 'q' && h[2]) return { name: 'result', id: +h[2] };
    if (a === 'leaderboards') return { name: 'boards', tab: h[1] === 'pnl' ? 'pnl' : 'points' };
    if (['intro', 'home', 'round', 'results', 'account'].indexOf(a) > -1) return { name: a };
    return { name: 'home' };
  }
  function render(keepScroll) {
    var r = route(), key = cur, html;
    if (r.name === 'question' && S.phase !== 'open' && S.tour == null) { go('#/round', true); return; }
    if (r.name !== 'question') draft = null;
    switch (r.name) {
      case 'intro': html = viewIntro(); break;
      case 'round': html = viewRound(); break;
      case 'question': html = viewQuestion(r.id); break;
      case 'results': html = viewResults(); break;
      case 'result': html = viewResult(r.id); break;
      case 'boards': html = viewBoards(r.tab); break;
      case 'account': html = viewAccount(); break;
      default: html = viewHome();
    }
    var y = window.scrollY;
    root.innerHTML = header(r) + '<main class="mm-main" id="main">' + html + '</main>' + tabbar(r);
    document.title = (D.title || 'MarketMind');
    if (keepScroll || key === lastRoute) window.scrollTo(0, y); else window.scrollTo(0, 0);
    lastRoute = key;
    if (r.name === 'question') updateQuestion();
    if (S.fresh) { var f = S.fresh; S.fresh = null; setTimeout(function () { var el = $('.q-card--fresh'); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 80); void f; }
    renderTour();
    renderDemo();
  }

  /* ---------- tour ---------- */
  function startTour() { S.tour = 0; goTour(); }
  function goTour() {
    var st = D.tour[S.tour];
    if ('#' + st.route === cur) render(true); else go('#' + st.route);
  }
  function endTour() { S.tour = null; var p = $('.tour-pop'); if (p) p.remove(); $$('.tour-target').forEach(function (e) { e.classList.remove('tour-target'); }); var b = $('.tour-btn'); if (b) b.classList.remove('is-active'); }
  function renderTour() {
    var old = $('.tour-pop'); if (old) old.remove();
    if (S.tour == null) return;
    var st = D.tour[S.tour], tgt = $('[data-tour="' + st.target + '"]');
    if (tgt) {
      tgt.classList.add('tour-target');
      var r0 = tgt.getBoundingClientRect();
      if (r0.top < 80 || r0.bottom > window.innerHeight) window.scrollTo(0, Math.max(0, window.scrollY + r0.top - 110));
    }
    var last = S.tour === D.tour.length - 1;
    var pop = document.createElement('div');
    pop.className = 'tour-pop';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', 'Platform tour');
    pop.innerHTML = '<div class="tour-pop__head"><span>Platform tour · ' + (S.tour + 1) + ' / ' + D.tour.length + '</span><button class="tour-pop__close" data-act="tour-close">Close</button></div>' +
      '<div class="tour-pop__body"><div class="tour-dots">' + D.tour.map(function (_, i) { return '<i class="' + (i <= S.tour ? 'is-on' : '') + '"></i>'; }).join('') + '</div>' +
      '<div class="tour-pop__title">' + esc(st.title) + '</div><p class="tour-pop__text">' + esc(st.body) + '</p></div>' +
      '<div class="tour-pop__foot"><button class="btn btn--ghost" data-act="tour-back"' + (S.tour === 0 ? ' disabled style="visibility:hidden"' : '') + '>← Back</button><button class="btn btn--primary" data-act="tour-next">' + (last ? 'Finish' : 'Next →') + '</button></div>';
    document.body.appendChild(pop);
    placeTour();
    var nb = pop.querySelector('[data-act="tour-next"]'); if (nb) nb.focus({ preventScroll: true });
  }
  function placeTour() {
    var pop = $('.tour-pop'); if (!pop || window.innerWidth <= 760) return;
    var st = D.tour[S.tour], tgt = $('[data-tour="' + st.target + '"]'), vw = window.innerWidth, vh = window.innerHeight, pw = 340, ph = pop.offsetHeight;
    var left, top;
    if (!tgt) { left = vw - pw - 24; top = 90; }
    else {
      var r = tgt.getBoundingClientRect();
      if (r.right + 16 + pw < vw - 12) { left = r.right + 16; top = r.top + 20; }
      else if (r.bottom + 12 + ph < vh) { left = Math.min(r.left + 24, vw - pw - 16); top = r.bottom + 12; }
      else if (r.left - 16 - pw > 12) { left = r.left - 16 - pw; top = r.top + 20; }
      else { left = Math.max(16, r.right - pw - 24); top = Math.max(80, r.top + 24); }
    }
    pop.style.left = clamp(left, 12, vw - pw - 12) + 'px';
    pop.style.top = clamp(top, 78, vh - ph - 12) + 'px';
  }

  /* ---------- toast ---------- */
  function toast(msg) {
    var old = $('.toast'); if (old) old.remove();
    var t = document.createElement('div');
    t.className = 'toast'; t.setAttribute('role', 'status');
    t.innerHTML = '<span class="dot dot--success"></span><span>' + esc(msg) + '</span>';
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('is-out'); setTimeout(function () { t.remove(); }, 260); }, 3200);
  }

  /* ---------- prototype controls ---------- */
  function renderDemo() {
    var el = $('.demo');
    if (!el) { el = document.createElement('div'); el.className = 'demo'; document.body.appendChild(el); }
    el.classList.toggle('is-open', !!S.demoOpen);
    el.classList.toggle('is-hidden', !!S.demoHidden);
    function opts(key, list) {
      return '<div class="demo__opts">' + list.map(function (o) { return '<button data-act="demo" data-k="' + key + '" data-v="' + o[0] + '" class="' + (S[key] === o[0] ? 'is-on' : '') + '">' + o[1] + '</button>'; }).join('') + '</div>';
    }
    el.innerHTML = '<div class="demo__panel" role="dialog" aria-label="Prototype controls"><div class="demo__title"><span>Prototype controls</span><a href="../forecasting">Case study ↗</a></div>' +
      '<div class="demo__group"><span>Theme</span>' + opts('theme', [['dark', 'Dark'], ['light', 'Light']]) + '</div>' +
      '<div class="demo__group"><span>Tournament state</span>' + opts('phase', [['notStarted', 'Not started'], ['open', 'Round 2 open'], ['between', 'Between rounds'], ['ended', 'Closed']]) + '</div>' +
      '<div class="demo__group"><span>Home layout (round open)</span>' + opts('home', [['A', 'A · Rounds'], ['B', 'B · Next up'], ['C', 'C · Stats']]) + '</div>' +
      '<div class="demo__group"><span>Reset</span><div class="demo__opts"><button data-act="demo-intro">Replay onboarding</button><button data-act="demo-reset">Reset answers</button></div></div>' +
      '<p class="demo__hint">Not part of the product. Press <b>.</b> to hide these controls while recording.</p></div>' +
      '<button class="demo__toggle" data-act="demo-toggle" aria-expanded="' + !!S.demoOpen + '"><i></i>Prototype</button>';
  }
  function applyTheme() { document.documentElement.setAttribute('data-theme', S.theme); }

  /* ---------- events ---------- */
  function onClick(e) {
    var link = e.target.closest('a[href^="#/"]');
    if (link && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) { e.preventDefault(); go(link.getAttribute('href')); return; }
    var t = e.target.closest('[data-act]');
    if (!t) return;
    var act = t.getAttribute('data-act');
    switch (act) {
      case 'noop': e.preventDefault(); toast('Links out to the podcast in the live product'); break;
      case 'tour': e.preventDefault(); if (S.tour != null) { endTour(); } else startTour(); break;
      case 'tour-next': if (S.tour >= D.tour.length - 1) { endTour(); toast('Tour finished · reopen it any time from Platform tour'); } else { S.tour++; goTour(); } break;
      case 'tour-back': if (S.tour > 0) { S.tour--; goTour(); } break;
      case 'tour-close': endTour(); break;
      case 'filter': S.filter = t.getAttribute('data-v'); save(); render(true); break;
      case 'acc':
        var body = t.nextElementSibling, openNow = body.hasAttribute('hidden');
        if (openNow) body.removeAttribute('hidden'); else body.setAttribute('hidden', '');
        t.setAttribute('aria-expanded', String(openNow));
        t.lastElementChild.textContent = openNow ? '−' : '+';
        break;
      case 'place': placeTrade(); break;
      case 'video': t.classList.toggle('is-playing'); break;
      case 'logout': toast('Logging out is switched off in the prototype'); break;
      case 'demo-toggle': S.demoOpen = !S.demoOpen; save(); renderDemo(); break;
      case 'demo':
        S[t.getAttribute('data-k')] = t.getAttribute('data-v');
        if (t.getAttribute('data-k') === 'theme') applyTheme();
        if (t.getAttribute('data-k') === 'home' && S.phase !== 'open') S.phase = 'open';
        save(); endTour();
        if (t.getAttribute('data-k') === 'theme') render(true);
        else if (cur === '#/home') render(true); else go('#/home');
        break;
      case 'demo-intro': endTour(); go('#/intro'); break;
      case 'demo-reset': var keep = { theme: S.theme, demoOpen: S.demoOpen, demoHidden: S.demoHidden }; S = freshState(); Object.assign(S, keep); save(); endTour(); render(true); toast('Answers reset to the starting state'); break;
    }
  }
  function onInput(e) {
    if (!draft) return;
    var id = e.target.id;
    if (id === 'fc') { draft.forecast = e.target.value; draft.touched = true; updateQuestion(); }
    else if (id === 'stake') {
      var mx = maxStakeFor(draft.id), v = +e.target.value;
      if (v > mx && mx >= MIN_STAKE) { v = mx; e.target.value = v; }
      draft.stake = v; updateQuestion();
    }
    else if (id === 'conf') { draft.conf = +e.target.value; updateQuestion(); }
  }
  function onKey(e) {
    if (e.target && /input|textarea/i.test(e.target.tagName)) {
      if (e.key === 'Enter' && e.target.id === 'fc') { var b = $('[data-act="place"]'); if (b && !b.disabled) placeTrade(); }
      return;
    }
    if (e.key === 'Escape' && S.tour != null) endTour();
    if (e.key === '.') { S.demoHidden = !S.demoHidden; save(); renderDemo(); }
  }
  function tick() {
    $$('[data-cd]').forEach(function (el) { el.textContent = countdownText(cdBase(el.getAttribute('data-cd')) - (Date.now() - t0) / 1000); });
  }

  /* ---------- boot ---------- */
  window.MM = {
    boot: function (data, mount) {
      D = data;
      root = mount || document.getElementById('mm');
      load();
      applyTheme();
      cur = /^#\/./.test(location.hash) ? location.hash : '#/intro';
      document.addEventListener('click', onClick);
      document.addEventListener('input', onInput);
      document.addEventListener('keydown', onKey);
      window.addEventListener('hashchange', function () { if (/^#\/./.test(location.hash) && location.hash !== cur) { cur = location.hash; render(false); } });
      window.addEventListener('popstate', function () { cur = /^#\/./.test(location.hash) ? location.hash : '#/intro'; render(false); });
      window.addEventListener('resize', placeTour);
      window.addEventListener('scroll', placeTour, { passive: true });
      setInterval(tick, 1000);
      render(false);
    }
  };
})();
