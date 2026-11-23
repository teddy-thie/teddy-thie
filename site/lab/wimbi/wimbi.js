/* Wimbi · the page. Reads window.WIMBI_DATA (one dated file), asks WimbiRules for the words,
   and draws everything else as plain SVG. No network calls, no storage, no sign-in. */
(function () {
  'use strict';
  const D = window.WIMBI_DATA;
  const R = window.WimbiRules.make(D);
  const S = D.series, WIN = D.meta.window, N = S.close.length, F = D.funding;
  const MOMENT_NAMES = window.WimbiRules.MOMENTS;
  const EX = R.EX, EXN = R.EX_NAME;

  const state = { moment: 'now', feed: 0, greys: false, chartOpen: false };
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const stage = $('#stage'), wb = $('#wb');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const f1 = n => n.toFixed(1);
  let uid = 0;

  const WAVE = '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M2 11c2.4-3.2 4.8-3.2 7.2 0s4.8 3.2 7.2 0 4.8-3.2 7.2 0" fill="none" stroke="#5B95FF" stroke-width="2.2" stroke-linecap="round"/><path d="M4 18c2-2.4 4-2.4 6 0s4 2.4 6 0 4-2.4 6 0" fill="none" stroke="#FF8B3D" stroke-width="2.2" stroke-linecap="round"/></svg>';

  // ---------- page ----------
  function stamp(a) {
    if (state.feed === 0) {
      return state.moment === 'now'
        ? 'Snapshot · ' + a.stamp + ' · not live'
        : 'Replay · ' + a.stamp + ' · from the 21 Nov snapshot · not live';
    }
    const age = state.feed === 60 ? '1 hour old' : state.feed + ' minutes old';
    return 'Pretend live · last update ' + a.hm + ' UTC (' + R.eat(a.t) + ' EAT) · ' + age;
  }

  function tile(t) {
    return '<div class="tile"><div class="tile__top"><span class="tile__name">' + esc(t.name) + '</span>' + (t.tag ? '<span class="tag">' + t.tag + '</span>' : '') + '</div>' +
      '<div class="tile__val"><span class="tile__num">' + esc(t.value) + '</span><span class="tile__note">' + esc(t.note) + '</span></div></div>';
  }

  function card(n, q, src, a, viz, link) {
    return '<article class="card" aria-labelledby="q' + n + '">' +
      '<div class="card__top"><p class="card__q" id="q' + n + '">' + n + ' · ' + q + '</p><span class="src">' + src + '</span></div>' +
      '<h2 class="card__verdict">' + esc(a.verdict) + '</h2>' +
      '<div class="card__numrow"><span class="figure"><span class="figure__num">' + esc((a.prefix || '') + a.number) + '</span><span class="figure__unit">' + esc(a.suffix) + '</span></span><span class="card__unit">' + esc(a.unit) + '</span></div>' +
      viz +
      '<p class="card__detail">' + esc(a.detail) + '</p>' +
      '<a class="card__link desk-link" href="' + link + '">See the chart ↓</a>' +
      '</article>';
  }

  function vizRange(q) {
    const lo = 0.70, hi = 0.79, pos = v => clamp((v - lo) / (hi - lo) * 100, 0, 100);
    const bl = pos(q.usual[0]), br = pos(q.usual[1]);
    return '<div class="viz viz--range" role="img" aria-label="' + esc(f1(q.value * 100) + '% long, against a usual range of ' + q.bandLabel.replace('Usual ', '')) + '">' +
      '<span class="viz__lbl" style="left:0;top:-6px">70%</span><span class="viz__lbl" style="right:0;top:-6px">79%</span>' +
      '<span class="viz__track"></span><span class="viz__band" style="left:' + bl + '%;width:' + (br - bl) + '%;background:var(--long-soft)"></span>' +
      '<span class="viz__mark" style="left:' + pos(q.value) + '%;background:var(--long)"></span>' +
      '<span class="viz__lbl" style="left:' + ((bl + br) / 2) + '%;top:26px;transform:translateX(-50%)">' + esc(q.bandLabel) + '</span></div>';
  }

  function vizSplit(q) {
    const tot = q.l4 + q.s4 || 1, lw = Math.max(1, q.l4 / tot * 100);
    return '<div role="img" aria-label="' + esc('Last 4 hours on OKX: longs ' + R.kusd(q.l4) + ', shorts ' + R.kusd(q.s4)) + '">' +
      '<div class="t-num faint">Last 4 hours</div>' +
      '<div class="split"><span class="bg-long" style="flex:' + lw + '"></span><span class="bg-short" style="flex:' + Math.max(1, 100 - lw) + '"></span></div>' +
      '<div class="split-lbls"><span class="c-long">Longs ' + R.kusd(q.l4) + '</span><span class="c-short">Shorts ' + R.kusd(q.s4) + '</span></div></div>';
  }

  function vizFund(q) {
    const lo = -0.30, hi = 0.60, pos = v => clamp((v - lo) / (hi - lo) * 100, 1, 99);
    const day = e => q.rates[e] * 30;
    const bl = pos(q.usual.lo), br = pos(q.usual.hi), rest = pos(0.30);
    const dots = ['okx', 'bybit', 'binance'].map(e => '<span class="viz__dot" title="' + EXN[e] + ': ' + (day(e) >= 0 ? 'longs pay ' : 'shorts pay ') + R.money2(Math.abs(day(e))) + ' a day" style="left:' + pos(day(e)) + '%;background:var(' + (day(e) >= 0 ? '--long' : '--short') + ')"></span>').join('');
    const label = EX.map(e => EXN[e] + ' ' + (day(e) >= 0 ? 'longs pay ' : 'shorts pay ') + R.money2(Math.abs(day(e)))).join(', ');
    return '<div class="viz viz--fund" role="img" aria-label="' + esc('Cost a day on $1,000: ' + label + '. Resting rate $0.30. Usual on Binance $' + q.usual.lo.toFixed(2) + ' to $' + q.usual.hi.toFixed(2) + '.') + '">' +
      '<span class="viz__lbl" style="right:' + (100 - rest) + '%;top:-6px;margin-right:6px;color:var(--amber)">Resting $0.30</span>' +
      '<span class="viz__track"></span><span class="viz__band" style="left:' + bl + '%;width:' + (br - bl) + '%;background:var(--text-3);opacity:.45"></span>' +
      '<span class="viz__tick" style="left:' + pos(0) + '%"></span><span class="viz__rest" style="left:' + rest + '%"></span>' + dots +
      '<span class="viz__lbl" style="left:0;top:28px">Shorts pay</span><span class="viz__lbl" style="right:0;top:28px">Longs pay</span>' +
      '<span class="viz__lbl" style="left:' + ((bl + br) / 2) + '%;top:46px;transform:translateX(-50%)">Usual $' + q.usual.lo.toFixed(2) + '–' + q.usual.hi.toFixed(2) + '</span></div>';
  }

  function exchangesTable(a) {
    const m = a.m, isNow = state.moment === 'now', rates = a.q3.rates;
    const ls = { binance: S.longShare[m], okx: isNow ? D.exchangesNow.okx.longShare : null, bybit: isNow ? D.exchangesNow.bybit.longShare : null };
    const rows = EX.map(e => {
      const r = rates[e], d = Math.abs(r * 30);
      return '<tr><td>' + EXN[e] + '</td><td>' + (ls[e] == null ? '—' : f1(ls[e] * 100) + '%') + '</td><td>' + R.signedRate(r) + '</td>' +
        '<td>' + R.money2(d) + '/day<small class="' + (r >= 0 ? 'c-long">Longs pay' : 'c-short">Shorts pay') + '</small></td></tr>';
    }).join('');
    const signs = new Set(EX.map(e => Math.sign(rates[e])));
    const pos = EX.filter(e => rates[e] > 0).map(e => EXN[e]), neg = EX.filter(e => rates[e] < 0).map(e => EXN[e]);
    const callout = signs.size > 1
      ? '<p class="callout">Exchanges disagree on who pays. On ' + pos.join(' and ') + ' longs pay; on ' + neg.join(' and ') + ', shorts pay.</p>'
      : '<p class="panel__note">All three agree: ' + (neg.length ? 'shorts pay.' : 'longs pay.') + '</p>';
    return '<table class="xt"><thead><tr><th scope="col">Exchange</th><th scope="col">Long</th><th scope="col">Funding</th><th scope="col">On $1,000</th></tr></thead><tbody>' + rows + '</tbody></table>' + callout +
      (isNow ? '' : '<p class="panel__note">OKX and Bybit long shares were saved at 09:55 UTC on 21 Nov only.</p>') +
      '<button type="button" class="btn btn--secondary" data-open="disagree">Open the disagreement view</button>';
  }

  function render() {
    const a = R.at(D.moments[state.moment]);
    const stale = state.feed >= 15, dim = state.feed >= 60;
    const facts = R.fundingFacts();
    wb.classList.toggle('dim', dim);
    wb.innerHTML =
      '<header class="wb-head">' +
        '<div class="brand">' + WAVE + '<span class="brand__name">Wimbi</span><span class="brand__rule"></span><span class="brand__market">BTC · Perpetual futures</span></div>' +
        '<div class="wb-head__right"><span class="chip-live">' + (state.feed ? 'Pretend live' : 'Not live') + '</span><a href="#sources">Sources</a></div>' +
        '<span class="head-market">BTC · Perpetual futures</span>' +
      '</header>' +
      (dim ? '<div class="notice" role="status"><span class="notice__icon" aria-hidden="true">!</span><p>These answers may be out of date. The feed last updated 1 hour ago, so the market may have moved since.</p><button type="button" data-feed="0">Back to the snapshot</button></div>' : '') +
      '<section class="hero" aria-labelledby="headline">' +
        '<p class="fresh t-num' + (stale ? ' is-stale' : '') + '">' + esc(stamp(a)) + '</p>' +
        '<h1 class="t-display hero__headline" id="headline">' + esc(a.line.headline) + '</h1>' +
        '<p class="sr-only">' + esc(a.line.sentence) + '</p>' +
        '<div class="tiles">' + a.line.tiles.map(t => tile(Object.assign({ tag: '4H' }, t))).join('') + '</div>' +
      '</section>' +
      '<section class="cards" aria-label="Three answers">' +
        card(1, 'Are traders mostly long or short?', 'Binance', a.q1, vizRange(a.q1), '#chart-day') +
        card(2, 'Big liquidations just now?', 'OKX only', a.q2, vizSplit(a.q2), '#chart-day') +
        card(3, 'Is it getting expensive to hold?', '3 exchanges', a.q3, vizFund(a.q3), '#funding') +
      '</section>' +
      '<button type="button" class="toggle" data-chart aria-expanded="' + state.chartOpen + '" aria-controls="mchart">' + (state.chartOpen ? 'Hide the chart ↑' : 'Show the chart ↓') + '</button>' +
      '<section class="panel mchart' + (state.chartOpen ? ' is-open' : '') + '" id="mchart" aria-labelledby="mchart-title">' +
        '<div><h2 class="t-title" id="mchart-title">The last 24 hours</h2><p class="panel__sub">UTC, 20–21 Nov. Shaded: the 4 hours to the moment. OKX liquidations are summed per 30 minutes.</p></div>' +
        '<ul class="legend"><li><span class="sw" style="color:var(--text)"></span>Price</li><li><span class="sw sw--dash" style="color:var(--text-3)"></span>Open interest (dashed)</li><li><span class="sw sw--box bg-long"></span>Longs forced out</li><li><span class="sw sw--box bg-short"></span>Shorts forced out</li></ul>' +
        '<div data-draw="mobile"></div>' +
      '</section>' +
      '<section class="panel desk-only" id="chart-day" aria-labelledby="day-title">' +
        '<div class="panel__head"><div><h2 class="t-title" id="day-title">The last 24 hours</h2></div>' +
        '<ul class="legend"><li><span class="sw" style="color:var(--text)"></span>Price</li><li><span class="sw sw--dash" style="color:var(--text-3)"></span>Open interest, BTC (dashed)</li><li><span class="sw sw--box bg-long"></span>Longs forced out</li><li><span class="sw sw--box bg-short"></span>Shorts forced out</li><li><span class="sw--band"></span>4 hours to the moment</li></ul></div>' +
        '<div data-draw="day"></div>' +
      '</section>' +
      '<div class="row2 desk-only">' +
        '<section class="panel" id="funding" aria-labelledby="fund-title">' +
          '<div class="panel__head"><div><h2 class="t-title" id="fund-title">Funding, last 30 days</h2><p class="panel__sub">Paid every 8 hours. Above zero, longs pay shorts. Below zero, shorts pay longs.</p></div>' +
          '<ul class="legend"><li><span class="sw" style="color:var(--text)"></span>Binance · solid</li><li><span class="sw sw--dash" style="color:var(--text-2)"></span>OKX · dashed</li><li><span class="sw sw--dot" style="color:var(--text-3)"></span>Bybit · dotted</li></ul></div>' +
          '<div data-draw="funding"></div>' +
          '<div class="facts">' + facts.map(tile).join('') + '</div>' +
        '</section>' +
        '<section class="panel" aria-labelledby="ex-title"><div><h2 class="t-title" id="ex-title">' + (state.moment === 'now' ? 'Exchanges now' : 'Exchanges at ' + a.hm + ' UTC') + '</h2><p class="panel__sub">Last funding paid at ' + R.hm(a.q3.settledMs) + ' UTC, and share of accounts long</p></div>' + exchangesTable(a) + '</section>' +
      '</div>' +
      '<footer class="wb-foot" id="sources"><p>Sources: price, open interest and account shares come from Binance’s BTCUSDT perpetual. Liquidations are OKX only, from OKX’s own API: its orders start at 10:05 UTC, and its totals run about 3× the OKX figure CoinGlass shows. Funding and account shares come from Binance, OKX and Bybit. Captured 21 Nov 2026, 09:55 UTC. A snapshot, not live. Not investment advice. <a href="data/btc-2026-11-21.json">The data file</a>.</p><span>Wimbi · Day 11 · Ted Thie Lab</span></footer>';
    draw();
  }

  // ---------- SVG helpers ----------
  const pill = (x, y, txt, anchor) => {
    const w = 16 + txt.length * 7.25, h = 22, px = anchor === 'end' ? x - w : anchor === 'middle' ? x - w / 2 : x;
    return '<g><rect x="' + px.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h + '" rx="6" fill="var(--surface-2)" stroke="var(--border)"/>' +
      '<text x="' + (px + 8).toFixed(1) + '" y="' + (y + 15).toFixed(1) + '" style="fill:var(--text)">' + esc(txt) + '</text></g>';
  };
  const backed = (x, y, txt, anchor, fill) => {
    const w = txt.length * 7.25 + 6, px = anchor === 'end' ? x - w + 3 : x - 3;
    return '<rect x="' + px.toFixed(1) + '" y="' + (y - 12).toFixed(1) + '" width="' + w.toFixed(1) + '" height="16" rx="3" fill="var(--surface)" opacity=".9"/><text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '"' + (anchor === 'end' ? ' text-anchor="end"' : '') + (fill ? ' style="fill:' + fill + '"' : '') + '>' + esc(txt) + '</text>';
  };
  const line = (pts) => 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
  const timeTicks = () => { const out = []; for (let i = 0; i < N; i++) { const ms = WIN.startMs + i * WIN.stepMs; if (ms % (4 * 3600e3) === 0) out.push([i, R.hm(ms)]); } return out; };
  const argmax = arr => arr.reduce((b, v, i) => (v > arr[b] ? i : b), 0);
  const argmin = arr => arr.reduce((b, v, i) => (v < arr[b] ? i : b), 0);

  // ---------- the 24-hour chart (desktop) ----------
  function drawDay(el) {
    const Wd = Math.max(640, el.clientWidth), OX = 48, PW = Wd - 96, a = R.at(D.moments[state.moment]), m = a.m;
    const x = i => OX + i * PW / (N - 1);
    const A0 = 0, PH = 220, yP = v => A0 + 16 + PH * (62600 - v) / 7800, yO = v => A0 + 16 + PH * (98200 - v) / 5400;
    const B0 = 260, base = B0 + 26 + 70, half = 70;
    const C0 = B0 + 176 + 8, CH = 110, yL = v => C0 + 30 + CH * (0.79 - clamp(v, 0.70, 0.79)) / 0.09;
    const X0 = C0 + 150 + 8, H = X0 + 18;
    const gid = 'pf' + (++uid);
    let s = '<svg class="chart" width="' + Wd + '" height="' + H + '" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-labelledby="' + gid + 't"><title id="' + gid + 't">' + esc(dayLabel()) + '</title>' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E7ECF4" stop-opacity=".10"/><stop offset="1" stop-color="#E7ECF4" stop-opacity="0"/></linearGradient></defs>';
    // 4 hours to the moment
    s += '<rect class="moment-band" x="' + x(m - 48).toFixed(1) + '" y="0" width="' + (x(m) - x(m - 48)).toFixed(1) + '" height="' + X0 + '" fill="var(--band)"/>';
    // A · price and open interest
    [56000, 58000, 60000, 62000].forEach(v => { s += '<line x1="' + OX + '" x2="' + (OX + PW) + '" y1="' + yP(v) + '" y2="' + yP(v) + '" stroke="var(--grid)"/><text x="' + (OX - 8) + '" y="' + (yP(v) + 4) + '" text-anchor="end">$' + v / 1000 + 'k</text>'; });
    [94000, 96000, 98000].forEach(v => { s += '<text x="' + (OX + PW + 6) + '" y="' + (yO(v) + 4) + '">' + v / 1000 + 'k</text>'; });
    const pricePts = S.close.map((v, i) => [x(i), yP(v)]);
    s += '<path d="' + line(pricePts) + 'L' + x(N - 1).toFixed(1) + ' ' + (A0 + 16 + PH) + 'L' + OX + ' ' + (A0 + 16 + PH) + 'Z" fill="url(#' + gid + ')"/>';
    s += '<path d="' + line(S.oiBtc.map((v, i) => [x(i), yO(v)])) + '" fill="none" stroke="var(--text-3)" stroke-width="1.25" stroke-dasharray="5 4"/>';
    s += '<path d="' + line(pricePts) + '" fill="none" stroke="var(--text)" stroke-width="1.75" stroke-linejoin="round"/>';
    const hi = argmax(S.high), lo = argmin(S.low), tOf = i => R.hm(WIN.startMs + i * WIN.stepMs);
    s += '<line x1="' + x(lo) + '" x2="' + x(lo) + '" y1="' + (A0 + 16) + '" y2="' + yP(S.low[lo]) + '" stroke="var(--text-3)" stroke-dasharray="3 3" opacity=".7"/>';
    s += '<circle cx="' + x(hi) + '" cy="' + yP(S.high[hi]) + '" r="3" fill="var(--text)"/><circle cx="' + x(lo) + '" cy="' + yP(S.low[lo]) + '" r="3" fill="var(--text)"/>';
    s += pill(x(hi) + 8, yP(S.high[hi]) - 30, R.usd(S.high[hi]) + ' high · ' + tOf(hi), 'start');
    s += pill(x(lo) - 10, yP(S.low[lo]) - 11, R.usd(S.low[lo]) + ' low · ' + tOf(lo), 'end');
    const mTxt = R.usd(S.close[m]) + (state.moment === 'now' ? ' now' : ' at ' + a.hm);
    s += '<circle cx="' + x(m) + '" cy="' + yP(S.close[m]) + '" r="3.5" fill="var(--text)"/>';
    s += pill(m > N * 0.8 ? x(m) - 10 : x(m) + 10, yP(S.close[m]) - 32, mTxt, m > N * 0.8 ? 'end' : 'start');
    // B · liquidations, true scale
    const maxK = Math.max(...S.liqLongK, ...S.liqShortK), bw = Math.max(1, PW / N - 0.8), sc = half / maxK;
    s += '<text class="lbl-sans" x="' + OX + '" y="' + (B0 + 12) + '">Liquidations on OKX, per 5 minutes</text><text x="' + (OX + PW) + '" y="' + (B0 + 12) + '" text-anchor="end">True scale. One bar per 5 minutes.</text>';
    s += '<line x1="' + OX + '" x2="' + (OX + PW) + '" y1="' + base + '" y2="' + base + '" stroke="var(--grid)"/>';
    s += '<text x="' + (OX - 8) + '" y="' + (base - 6) + '" text-anchor="end" style="fill:var(--short)">Shorts</text><text x="' + (OX - 8) + '" y="' + (base + 16) + '" text-anchor="end" style="fill:var(--long)">Longs</text>';
    let up = '', dn = '';
    for (let i = 0; i < N; i++) {
      const xs = (x(i) - bw / 2).toFixed(1);
      if (S.liqShortK[i] > 0) { const h = Math.max(1, S.liqShortK[i] * sc); up += 'M' + xs + ' ' + base + 'v-' + h.toFixed(1) + 'h' + bw.toFixed(1) + 'v' + h.toFixed(1) + 'Z'; }
      if (S.liqLongK[i] > 0) { const h = Math.max(1, S.liqLongK[i] * sc); dn += 'M' + xs + ' ' + base + 'v' + h.toFixed(1) + 'h' + bw.toFixed(1) + 'v-' + h.toFixed(1) + 'Z'; }
    }
    s += '<path d="' + up + '" fill="var(--short)"/><path d="' + dn + '" fill="var(--long)"/>';
    const pk = argmax(S.liqLongK.map((v, i) => Math.max(v, S.liqShortK[i]))), pkSide = S.liqLongK[pk] >= S.liqShortK[pk] ? 'longs' : 'shorts';
    s += '<text x="' + (x(pk) + bw + 6) + '" y="' + (pkSide === 'longs' ? base + half - 2 : base - half + 10) + '" style="fill:var(--text-2)">' + R.kusd(maxK) + ' of ' + pkSide + ' in 5 min · ' + tOf(pk) + '</text>';
    // C · share of accounts long
    const C = D.context30d.longShare;
    s += '<text class="lbl-sans" x="' + OX + '" y="' + (C0 + 12) + '">Share of accounts long, Binance · shaded: the usual range over 30 days</text>';
    s += '<rect x="' + OX + '" y="' + yL(C.p75) + '" width="' + PW + '" height="' + (yL(C.p25) - yL(C.p75)) + '" fill="var(--long-soft)"/>';
    [0.72, 0.75, 0.78].forEach(v => { s += '<text x="' + (OX - 8) + '" y="' + (yL(v) + 4) + '" text-anchor="end">' + Math.round(v * 100) + '%</text>'; });
    s += '<path d="' + line(S.longShare.map((v, i) => [x(i), yL(v)])) + '" fill="none" stroke="var(--long)" stroke-width="1.5" stroke-linejoin="round"/>';
    s += '<circle cx="' + x(m) + '" cy="' + yL(S.longShare[m]) + '" r="3.5" fill="var(--long)"/>';
    s += '<text x="' + (m > N * 0.8 ? x(m) - 8 : x(m) + 8) + '" y="' + (yL(S.longShare[m]) + 18) + '"' + (m > N * 0.8 ? ' text-anchor="end"' : '') + ' style="fill:var(--long)">' + f1(S.longShare[m] * 100) + '% ' + (state.moment === 'now' ? 'now' : 'at ' + a.hm) + '</text>';
    // moment marker (not needed at the right edge)
    if (m < N - 1) s += '<line x1="' + x(m) + '" x2="' + x(m) + '" y1="0" y2="' + X0 + '" stroke="var(--text-2)" stroke-dasharray="2 3"/><text x="' + (x(m) + 6) + '" y="' + (X0 - 4) + '" style="fill:var(--text-2)">' + esc(MOMENT_NAMES[state.moment].toLowerCase()) + '</text>';
    // time axis
    s += '<text x="0" y="' + (X0 + 12) + '">UTC · 20–21 Nov</text>';
    timeTicks().forEach(([i, t]) => { s += '<text x="' + x(i) + '" y="' + (X0 + 12) + '" text-anchor="middle">' + t + '</text>'; });
    el.innerHTML = s + '</svg>';
  }

  function dayLabel() {
    const hi = argmax(S.high), lo = argmin(S.low), pk = argmax(S.liqLongK);
    const t = i => R.hm(WIN.startMs + i * WIN.stepMs);
    return 'The 24 hours to 09:55 UTC on 21 Nov. Price went from ' + R.usd(S.close[0]) + ' to ' + R.usd(S.close[N - 1]) + ', with a high of ' + R.usd(S.high[hi]) + ' at ' + t(hi) + ' and a low of ' + R.usd(S.low[lo]) + ' at ' + t(lo) +
      '. Open interest went from ' + Math.round(S.oiBtc[0]).toLocaleString('en-US') + ' to ' + Math.round(S.oiBtc[N - 1]).toLocaleString('en-US') + ' BTC. OKX liquidations were mostly longs, peaking at ' + R.kusd(S.liqLongK[pk]) + ' in 5 minutes at ' + t(pk) +
      '. The share of accounts long went from ' + f1(S.longShare[0] * 100) + '% to ' + f1(S.longShare[N - 1] * 100) + '%.';
  }

  // ---------- the funding chart ----------
  function drawFunding(el) {
    const Wd = Math.max(480, el.clientWidth), LX = 60, PW = Wd - 60 - 72, TOP = 20, PH = 150, n = F.binance.length;
    const x = k => LX + k * PW / (n - 1), y = r => TOP + PH * (0.0115 - r) / 0.019;
    const a = R.at(D.moments[state.moment]), km = Math.min(n - 1, Math.floor((a.t - F.firstMs) / F.stepMs));
    let s = '<svg class="chart" width="' + Wd + '" height="' + (TOP + PH + 28) + '" role="img" aria-label="' + esc(fundLabel()) + '">';
    s += '<line x1="' + LX + '" x2="' + (LX + PW) + '" y1="' + y(0) + '" y2="' + y(0) + '" stroke="var(--border)"/>';
    [0.005, -0.005].forEach(r => { s += '<line x1="' + LX + '" x2="' + (LX + PW) + '" y1="' + y(r) + '" y2="' + y(r) + '" stroke="var(--grid)"/>'; });
    s += '<line x1="' + LX + '" x2="' + (LX + PW) + '" y1="' + y(0.01) + '" y2="' + y(0.01) + '" stroke="var(--amber)"/>';
    [[0.01, '0.01%', 'var(--amber)'], [0.005, '0.005%'], [0, '0%', 'var(--text-2)'], [-0.005, '−0.005%']].forEach(([r, t, c]) => { s += '<text x="' + (LX - 8) + '" y="' + (y(r) + 4) + '" text-anchor="end"' + (c ? ' style="fill:' + c + '"' : '') + '>' + t + '</text>'; });
    if (km < n - 1) s += '<line x1="' + x(km) + '" x2="' + x(km) + '" y1="' + TOP + '" y2="' + (TOP + PH) + '" stroke="var(--text-2)" stroke-dasharray="2 3"/>';
    const sty = { bybit: ['var(--text-3)', '2 3', 1.1], okx: ['var(--text-2)', '6 3', 1.1], binance: ['var(--text)', '', 1.6] };
    ['bybit', 'okx', 'binance'].forEach(e => { const [c, d, w] = sty[e]; s += '<path d="' + line(F[e].map((r, k) => [x(k), y(r)])) + '" fill="none" stroke="' + c + '" stroke-width="' + w + '"' + (d ? ' stroke-dasharray="' + d + '"' : '') + ' stroke-linejoin="round"/>'; });
    // end labels, pushed apart so they never overlap
    const ends = EX.map(e => ({ e, y: y(F[e][n - 1]) })).sort((p, q) => p.y - q.y);
    for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 15) ends[i].y = ends[i - 1].y + 15;
    ends.forEach(o => { s += '<text x="' + (LX + PW + 8) + '" y="' + (o.y + 4) + '" style="fill:' + sty[o.e][0] + '">' + EXN[o.e] + '</text>'; });
    s += backed(LX + 6, y(0.01) - 6, 'Resting rate 0.01% = $0.30 a day on $1,000', 'start', 'var(--amber)');
    s += backed(LX + 6, y(0) - 6, 'Longs pay', 'start') + backed(LX + 6, y(0) + 16, 'Shorts pay', 'start');
    [[0, '22 Oct', 'start'], [30, '1 Nov', 'middle'], [60, '11 Nov', 'middle'], [n - 1, '21 Nov', 'end']].forEach(([k, t, an]) => { s += '<text x="' + x(k) + '" y="' + (TOP + PH + 22) + '" text-anchor="' + an + '">' + t + '</text>'; });
    el.innerHTML = s + '</svg>';
  }
  function fundLabel() {
    const f = R.fundingFacts();
    return 'Funding every 8 hours for 30 days on Binance, OKX and Bybit. ' + f.map(o => o.name + ': ' + o.value + ' ' + o.note).join('. ') + '.';
  }

  // ---------- the mobile chart: price with liquidations per 30 minutes ----------
  function drawMobile(el) {
    const Wd = Math.max(280, el.clientWidth), a = R.at(D.moments[state.moment]), m = a.m;
    const x = i => i * Wd / (N - 1), yP = v => 14 + 140 * (62600 - v) / 7800, yO = v => 14 + 140 * (98200 - v) / 5400;
    const B0 = 196, base = B0 + 44, nb = 48, pitch = Wd / nb, bw = Math.max(2, pitch - 2.2);
    const buckets = Array.from({ length: nb }, (_, b) => { let l = 0, sh = 0; for (let k = b * 6; k < b * 6 + 6; k++) { l += S.liqLongK[k] || 0; sh += S.liqShortK[k] || 0; } return [l, sh]; });
    const mx = Math.max(...buckets.map(([l, sh]) => Math.max(l, sh))), sc = 44 / mx, gid = 'mf' + (++uid);
    const H = base + 44 + 26;
    let s = '<svg class="chart" width="' + Wd + '" height="' + H + '" role="img" aria-label="' + esc(dayLabel()) + '"><defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E7ECF4" stop-opacity=".10"/><stop offset="1" stop-color="#E7ECF4" stop-opacity="0"/></linearGradient></defs>';
    s += '<rect x="' + x(m - 48).toFixed(1) + '" y="0" width="' + (x(m) - x(m - 48)).toFixed(1) + '" height="' + (base + 46) + '" fill="var(--band)"/>';
    [[56000, '$56k'], [58000, '$58k'], [60000, '$60k'], [62000, '$62k']].forEach(([v, t]) => { s += '<line x1="0" x2="' + Wd + '" y1="' + yP(v) + '" y2="' + yP(v) + '" stroke="var(--grid)"/>'; });
    const pts = []; for (let i = 0; i < N; i += 3) pts.push([x(i), yP(S.close[i])]); pts.push([x(N - 1), yP(S.close[N - 1])]);
    const opts = []; for (let i = 0; i < N; i += 3) opts.push([x(i), yO(S.oiBtc[i])]); opts.push([x(N - 1), yO(S.oiBtc[N - 1])]);
    s += '<path d="' + line(pts) + 'L' + Wd + ' 154L0 154Z" fill="url(#' + gid + ')"/><path d="' + line(opts) + '" fill="none" stroke="var(--text-3)" stroke-width="1.2" stroke-dasharray="4 3"/><path d="' + line(pts) + '" fill="none" stroke="var(--text)" stroke-width="1.6" stroke-linejoin="round"/>';
    [[56000, '$56k'], [58000, '$58k'], [60000, '$60k'], [62000, '$62k']].forEach(([v, t]) => { s += backed(3, yP(v) - 3, t, 'start'); });
    s += '<circle cx="' + x(m) + '" cy="' + yP(S.close[m]) + '" r="3.5" fill="var(--text)"/>';
    s += pill(m > N * 0.6 ? x(m) - 8 : x(m) + 8, yP(S.close[m]) - 30, R.usd(S.close[m]) + (state.moment === 'now' ? ' now' : ' at ' + a.hm), m > N * 0.6 ? 'end' : 'start');
    const lo = argmin(S.low), lowTxt = R.usd(S.low[lo]) + ' low · ' + R.hm(WIN.startMs + lo * WIN.stepMs);
    s += pill(Wd, 158, lowTxt, 'end');
    s += '<text class="lbl-sans" x="0" y="' + (B0 + 2) + '">Shorts forced out above the line, longs below</text>';
    s += '<line x1="0" x2="' + Wd + '" y1="' + base + '" y2="' + base + '" stroke="var(--grid)"/>';
    let up = '', dn = '';
    buckets.forEach(([l, sh], b) => { const bx = (b * pitch + (pitch - bw) / 2).toFixed(1); if (sh > 0) { const h = Math.max(0.8, sh * sc); up += 'M' + bx + ' ' + base + 'v-' + h.toFixed(1) + 'h' + bw.toFixed(1) + 'v' + h.toFixed(1) + 'Z'; } if (l > 0) { const h = Math.max(0.8, l * sc); dn += 'M' + bx + ' ' + base + 'v' + h.toFixed(1) + 'h' + bw.toFixed(1) + 'v-' + h.toFixed(1) + 'Z'; } });
    s += '<path d="' + up + '" fill="var(--short)"/><path d="' + dn + '" fill="var(--long)"/>';
    const pb = argmax(buckets.map(([l]) => l));
    s += backed(Math.max(4, pb * pitch - 6), base + 40, R.kusd(buckets[pb][0]), 'end');
    timeTicks().filter((_, k) => k % 1 === 0).forEach(([i, t], k) => { if (k % 2 === 0) s += '<text x="' + x(i) + '" y="' + (H - 6) + '" text-anchor="middle">' + t + '</text>'; });
    el.innerHTML = s + '</svg>';
  }

  function draw() {
    const day = $('[data-draw="day"]'), fund = $('[data-draw="funding"]'), mob = $('[data-draw="mobile"]');
    if (day && day.offsetParent) drawDay(day);
    if (fund && fund.offsetParent) drawFunding(fund);
    if (mob && mob.offsetParent) drawMobile(mob);
  }

  // ---------- disagreement view ----------
  function openDisagree() {
    const a = R.at(D.moments[state.moment]), rates = a.q3.rates, isNow = state.moment === 'now', dlg = $('#disagree');
    const mx = Math.max(0.005, ...EX.map(e => Math.abs(rates[e])));
    const fund = EX.map(e => {
      const r = rates[e], w = Math.abs(r) / mx * 46, pos = r >= 0;
      const txt = R.signedRate(r) + ' · ' + (pos ? 'longs pay ' : 'shorts pay ') + R.money2(Math.abs(r * 30)) + '/day';
      return '<span>' + EXN[e] + '</span><div class="dv__bar"><span class="dv__zero"></span><span class="dv__fill" style="' + (pos ? 'left:50%' : 'right:50%') + ';width:' + w + '%;background:var(' + (pos ? '--long' : '--short') + ')"></span>' +
        '<span class="dv__val ' + (pos ? 'c-long' : 'c-short') + '" style="' + (pos ? 'right:calc(50% + 10px)' : 'left:calc(50% + 11px)') + '">' + txt + '</span></div>';
    }).join('');
    const lsv = { binance: isNow ? D.exchangesNow.binance.longShare : S.longShare[a.m], okx: D.exchangesNow.okx.longShare, bybit: D.exchangesNow.bybit.longShare };
    const ls = EX.map(e => '<span>' + EXN[e] + '</span><div class="ls"><span class="ls__l" style="flex:' + lsv[e] + '">' + f1(lsv[e] * 100) + '% long</span><span class="ls__s" style="flex:' + (1 - lsv[e]) + '">' + f1((1 - lsv[e]) * 100) + '% short</span></div>').join('');
    const pos = EX.filter(e => rates[e] > 0).map(e => EXN[e]), neg = EX.filter(e => rates[e] < 0).map(e => EXN[e]);
    const reading = pos.length && neg.length
      ? 'All three are mostly long, but they disagree on who pays: on ' + pos.join(' and ') + ' longs pay a little; on ' + neg.join(' and ') + ', shorts pay. Card 3 reads this as “' + a.q3.verdict + '”.'
      : 'They agree on who pays: ' + (neg.length ? 'shorts pay on all three.' : 'longs pay on all three.') + ' Card 3 reads this as “' + a.q3.verdict + '”.';
    dlg.innerHTML = '<div class="sheet__top"><div><h2 class="t-title" id="disagree-title">' + (pos.length && neg.length ? 'Exchanges disagree' : 'Exchanges agree') + '</h2><p class="panel__sub">' + esc(a.dayMon + ', ' + a.hm + ' UTC') + '. Who pays funding, and how many accounts are long, on each exchange.</p></div><button type="button" class="sheet__close" data-close>Close</button></div>' +
      '<div class="sheet__sec"><h3>Who pays funding · payment at ' + R.hm(a.q3.settledMs) + ' UTC</h3><div class="dv">' + fund + '<div class="dv__axis"><span>← Shorts pay</span><span>0</span><span>Longs pay →</span></div></div></div>' +
      '<div class="sheet__sec"><h3>Share of accounts · long on the left, short on the right' + (isNow ? '' : ' · OKX and Bybit at 09:55 UTC, 21 Nov') + '</h3><div class="dv">' + ls + '</div></div>' +
      '<div class="reading"><p>' + esc(reading) + '</p><p>Each exchange counts only its own accounts, so the shares are not one market-wide number. Funding scales run below zero on the left, so “shorts pay” sits left here.</p></div>';
    dlg.showModal();
  }

  // ---------- Time me ----------
  const Q = { q1: 'Are traders mostly long or short?', q2: 'Were there big liquidations just now?', q3: 'Is it getting expensive to hold a position?' };
  const QSHORT = { q1: '1 · Long or short', q2: '2 · Liquidations', q3: '3 · Cost to hold' };
  const FILL = { q1: ['Leaning long, as usual', 'Split, as usual'], q2: ['Some: shorts, in the last hour', 'Big: shorts, in the last hour'], q3: ['Longs are paying up', 'Expensive'] };
  const ROUNDS = ['now', 'flush', 'low'], QS = ['q1', 'q2', 'q3'];
  const KEY = {}; ROUNDS.forEach(r => { const a = R.at(D.moments[r]); KEY[r] = { q1: a.q1.answer, q2: a.q2.answer, q3: a.q3.answer }; });
  const OPTIONS = {}; QS.forEach(q => { const set = []; ROUNDS.forEach(r => { if (!set.includes(KEY[r][q])) set.push(KEY[r][q]); }); FILL[q].forEach(f => { if (set.length < 3 && !set.includes(f)) set.push(f); }); OPTIONS[q] = set.slice(0, 3); });
  const TM = { on: false, r: 0, q: 0, t0: 0, raf: 0, log: [], before: null };
  const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function tmStart() {
    TM.on = true; TM.r = 0; TM.q = 0; TM.log = []; TM.before = { moment: state.moment, feed: state.feed };
    state.feed = 0; $('#try').classList.add('is-locked'); $('#try').setAttribute('aria-hidden', 'true');
    document.body.classList.add('tm-on'); $('#tm').hidden = false;
    tmAsk();
  }
  function tmAsk() {
    const r = ROUNDS[TM.r], q = QS[TM.q];
    state.moment = r; render(); window.scrollTo({ top: 0 });
    $('#tm-progress').textContent = 'Time me · round ' + (TM.r + 1) + ' of 3 · ' + MOMENT_NAMES[r] + ' · question ' + (TM.q + 1) + ' of 3';
    $('#tm-question').textContent = Q[q];
    $('#tm-chips').innerHTML = shuffle(OPTIONS[q]).map(o => '<button type="button" data-answer="' + esc(o) + '">' + esc(o) + '</button>').join('');
    TM.t0 = performance.now();
    cancelAnimationFrame(TM.raf);
    const tick = () => { $('#tm-secs').textContent = ((performance.now() - TM.t0) / 1000).toFixed(1) + ' s'; TM.raf = requestAnimationFrame(tick); };
    tick();
    const first = $('#tm-chips button'); if (first) first.focus({ preventScroll: true });
  }
  function tmAnswer(choice) {
    const r = ROUNDS[TM.r], q = QS[TM.q], secs = (performance.now() - TM.t0) / 1000;
    TM.log.push({ r, q, secs, choice, right: choice === KEY[r][q] });
    if (++TM.q === 3) { TM.q = 0; TM.r++; }
    if (TM.r === 3) tmEnd(true); else tmAsk();
  }
  function tmEnd(show) {
    cancelAnimationFrame(TM.raf); TM.on = false;
    $('#tm').hidden = true; document.body.classList.remove('tm-on');
    $('#try').classList.remove('is-locked'); $('#try').removeAttribute('aria-hidden');
    state.moment = 'now'; syncPanel(); render();
    if (show) tmResults();
  }
  function tmResults() {
    const L = TM.log, right = L.filter(e => e.right).length, secs = L.map(e => e.secs).sort((p, q) => p - q);
    const med = secs.length % 2 ? secs[(secs.length - 1) / 2] : (secs[secs.length / 2 - 1] + secs[secs.length / 2]) / 2;
    const avg = QS.map(q => { const xs = L.filter(e => e.q === q); return [q, xs.reduce((p, e) => p + e.secs, 0) / xs.length]; }).sort((p, q) => q[1] - p[1]);
    const slow = avg[0][0], slowEvery = ROUNDS.every(r => { const xs = L.filter(e => e.r === r); return xs.length && xs.reduce((b, e) => (e.secs > b.secs ? e : b)).q === slow; });
    const cell = e => e ? '<td class="' + (e.right ? '' : 'is-wrong') + '">' + e.secs.toFixed(1) + ' s  ' + (e.right ? '✓' : '✗ picked “' + esc(e.choice) + '”') + '</td>' : '<td>—</td>';
    const rows = ROUNDS.map(r => '<tr><td>' + MOMENT_NAMES[r] + '</td>' + QS.map(q => cell(L.find(e => e.r === r && e.q === q))).join('') + '</tr>').join('');
    const qn = QSHORT[slow].replace(/^\d · /, '').toLowerCase();
    const reading = slowEvery ? 'What this run says: the ' + qn + ' card is the slow one in every round. That is the card to fix first.' : 'What this run says: the ' + qn + ' card took longest on average (' + avg[0][1].toFixed(1) + ' s).';
    const dlg = $('#results');
    dlg.innerHTML = '<div class="sheet__top"><div><h2 class="t-title" id="results-title">Your run</h2><p class="panel__sub">Kept in memory only: nothing is saved or sent, and it clears when you leave the page.</p></div><button type="button" class="sheet__close" data-close>Close</button></div>' +
      '<div class="sum">' + [{ name: 'Right', value: right + ' of ' + L.length, note: '' }, { name: 'Median', value: med.toFixed(1) + ' s', note: 'per question' }, { name: 'Slowest', value: 'Question ' + slow.slice(1), note: avg[0][1].toFixed(1) + ' s on average' }].map(tile).join('') + '</div>' +
      '<table class="rt"><thead><tr><th scope="col">Moment</th>' + QS.map(q => '<th scope="col">' + QSHORT[q] + '</th>').join('') + '</tr></thead><tbody>' + rows + '</tbody></table>' +
      '<div class="reading"><p>' + esc(reading) + '</p></div>' +
      '<div class="sheet__btns"><button type="button" class="btn btn--primary btn--inline" data-timeme>Run again</button><button type="button" class="btn btn--secondary btn--inline" data-close>Back to the page</button></div>';
    dlg.showModal();
  }

  // ---------- controls ----------
  function syncPanel() {
    $$('input[name="moment"]').forEach(i => { i.checked = i.value === state.moment; });
    $$('input[name="feed"]').forEach(i => { i.checked = Number(i.value) === state.feed; });
    $('input[name="greys"]').checked = state.greys;
    stage.classList.toggle('greys', state.greys); document.body.classList.toggle('greys-on', state.greys);
  }
  function reset() {
    if (TM.on) tmEnd(false);
    $$('dialog[open]').forEach(d => d.close());
    Object.assign(state, { moment: 'now', feed: 0, greys: false, chartOpen: false });
    syncPanel(); render(); window.scrollTo({ top: 0 });
  }

  $('#try').addEventListener('change', e => {
    const t = e.target;
    if (t.name === 'moment') state.moment = t.value;
    else if (t.name === 'feed') state.feed = Number(t.value);
    else if (t.name === 'greys') state.greys = t.checked;
    syncPanel(); render();
  });
  document.addEventListener('click', e => {
    const t = e.target.closest('button, a');
    if (!t) return;
    if (t.matches('[data-open="disagree"]')) openDisagree();
    else if (t.matches('[data-timeme]')) { $$('dialog[open]').forEach(d => d.close()); tmStart(); }
    else if (t.matches('[data-answer]')) tmAnswer(t.getAttribute('data-answer'));
    else if (t.matches('[data-tm-skip]')) tmAnswer(null);
    else if (t.matches('[data-tm-quit]')) tmEnd(false);
    else if (t.matches('[data-close]')) t.closest('dialog').close();
    else if (t.matches('[data-feed]')) { state.feed = Number(t.getAttribute('data-feed')); syncPanel(); render(); }
    else if (t.matches('[data-chart]')) { state.chartOpen = !state.chartOpen; render(); }
    else if (t.matches('[data-reset]')) reset();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && TM.on) tmEnd(false); });
  $$('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));
  let rt = 0; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(draw, 120); });

  syncPanel(); render();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
})();
