/* Wimbi · the rules that turn the dated file into words.
   Pure functions, no DOM: the page calls them, and they can be run under Node to check the three moments
   against the brief (node rules.js). Every sentence comes from a fixed template, so the same data always
   gives the same words. */
(function (root) {
  'use strict';

  const STEP_MIN = 5;
  const HOUR = 12;          // rows per hour
  const FOUR_H = 48;        // rows per 4 hours
  const RESTING = 0.01;     // % per 8 hours: Binance's fixed interest leg
  const EXPENSIVE = 0.03;   // % per 8 hours
  const FLAT_MOVE = 0.005;  // a 4-hour price move under 0.5% is "no clear move"

  const EX = ['binance', 'okx', 'bybit'];
  const EX_NAME = { binance: 'Binance', okx: 'OKX', bybit: 'Bybit' };

  // ---------- formatting ----------
  const pad = n => String(n).padStart(2, '0');
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const hm = ms => { const d = new Date(ms); return pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()); };
  const dayMon = ms => { const d = new Date(ms); return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()]; };
  const eat = ms => hm(ms + 3 * 3600e3);
  const pct1 = x => (x * 100).toFixed(1) + '%';
  const usd = n => '$' + Math.round(n).toLocaleString('en-US');
  // thousands of USD → "$11.7M", "$950k"
  const kusd = k => (k >= 1000 ? '$' + (k / 1000).toFixed(1) + 'M' : '$' + Math.round(k) + 'k');
  const perDay = rate => Math.abs(rate) * 3 * 10; // $ a day on $1,000 for a rate in % per 8 hours
  const money2 = x => '$' + x.toFixed(2);
  const signedRate = r => (r > 0 ? '+' : r < 0 ? '−' : '') + Math.abs(r).toFixed(4) + '%';
  const sum = (a, i, j) => { let s = 0; for (let k = Math.max(0, i); k < j; k++) s += a[k] || 0; return s; };
  const quantile = (arr, p) => { const s = arr.slice().sort((a, b) => a - b); return s[Math.round(p * (s.length - 1))]; };
  const median = arr => { const s = arr.slice().sort((a, b) => a - b); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };

  function make(D) {
    const S = D.series, W = D.meta.window;
    const timeOf = i => W.startMs + i * W.stepMs;
    const dayTotalK = sum(S.liqLongK, 0, S.liqLongK.length) + sum(S.liqShortK, 0, S.liqShortK.length);
    const hourlyAvgK = dayTotalK / 24;
    const F = D.funding;
    const fundIndex = ms => Math.min(F.binance.length - 1, Math.floor((ms - F.firstMs) / F.stepMs));
    const fundTime = k => F.firstMs + k * F.stepMs;
    const binanceDay = F.binance.map(r => r * 30); // signed $ a day on $1,000
    const usual3 = { lo: quantile(binanceDay, 0.25), hi: quantile(binanceDay, 0.75), median: median(F.binance) };

    // A liquidation order's time is "HH:MM:SS" inside the window: before 09:55 it belongs to the second day.
    const orderMs = t => { const [h, m, s] = t.split(':').map(Number); const d0 = new Date(W.startMs); let ms = Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth(), d0.getUTCDate(), h, m, s); if (ms < W.startMs) ms += 864e5; return ms; };

    function at(m) {
      const t = timeOf(m);
      // ---------- the 4-hour line ----------
      const p0 = S.close[m - FOUR_H], p1 = S.close[m];
      const o0 = S.oiBtc[m - FOUR_H], o1 = S.oiBtc[m];
      const dp = p1 / p0 - 1, doi = o1 / o0 - 1;
      const l4 = sum(S.liqLongK, m - FOUR_H, m), s4 = sum(S.liqShortK, m - FOUR_H, m);
      let lineKind, headline;
      if (Math.abs(dp) < FLAT_MOVE) { lineKind = 'flat'; headline = 'No clear move: price is within 0.5% of 4 hours ago.'; }
      else if (dp > 0 && doi <= 0) { lineKind = 'shortsClosing'; headline = 'Not turned yet: the bounce is shorts closing, not new buyers.'; }
      else if (dp < 0 && doi <= 0) { lineKind = 'longsClosing'; headline = 'Not turned yet: the drop is longs closing, not new sellers.'; }
      else if (dp > 0) { lineKind = 'newLongs'; headline = 'Turning up: new longs are behind the rise.'; }
      else { lineKind = 'newShorts'; headline = 'Turning down: new shorts are behind the fall.'; }
      const liqSide = s4 > l4 ? 'short' : 'long';
      const tiles = [
        { name: 'Price', value: (dp >= 0 ? '↑ ' : '↓ ') + Math.abs(dp * 100).toFixed(1) + '%', note: 'to ' + usd(p1) },
        { name: (liqSide === 'short' ? 'Shorts' : 'Longs') + ' forced out · OKX', value: kusd(Math.max(l4, s4)), note: 'vs ' + kusd(Math.min(l4, s4)) + ' of ' + (liqSide === 'short' ? 'longs' : 'shorts') },
        { name: 'Open interest', value: (doi >= 0 ? '↑ ' : '↓ ') + Math.abs(doi * 100).toFixed(1) + '%', note: doi >= 0 ? 'more positions open' : 'fewer positions open' },
      ];
      const sentence = 'Last 4 hours: price ' + (dp >= 0 ? 'up ' : 'down ') + Math.abs(dp * 100).toFixed(1) + '% to ' + usd(p1) + '. ' +
        (liqSide === 'short' ? 'Shorts' : 'Longs') + ' were forced out (' + kusd(Math.max(l4, s4)) + ' vs ' + kusd(Math.min(l4, s4)) + ' of ' + (liqSide === 'short' ? 'longs' : 'shorts') + ' on OKX) and open interest ' + (doi >= 0 ? 'rose ' : 'fell ') + Math.abs(doi * 100).toFixed(1) + '%.';

      // ---------- 1 · long or short ----------
      const ls = S.longShare[m], ls4 = S.longShare[m - FOUR_H], C = D.context30d.longShare;
      const side = ls >= 0.60 ? 'Mostly long' : ls >= 0.52 ? 'Leaning long' : ls > 0.48 ? 'Split' : ls > 0.40 ? 'Leaning short' : 'Mostly short';
      const cmp = ls > C.p75 ? 'more' : ls < C.p25 ? 'fewer' : 'usual';
      const longSide = ls > 0.48;
      const cmpWords = cmp === 'usual' ? 'as usual' : (longSide ? (cmp === 'more' ? 'more than usual' : 'fewer than usual') : (cmp === 'more' ? 'fewer than usual' : 'more than usual'));
      const q1 = {
        verdict: side === 'Split' ? 'Split, ' + cmpWords : side + (cmpWords === 'fewer than usual' ? ', but fewer than usual' : ', ' + cmpWords),
        answer: (side === 'Split' ? 'Split' : side) + ', ' + cmpWords,
        number: (ls * 100).toFixed(1), suffix: '%',
        unit: 'of accounts are long, ' + (ls < ls4 ? 'down' : 'up') + ' from ' + pct1(ls4) + ' 4 hours ago',
        detail: 'Top traders hold ' + Math.round(S.topLongShare[m] * 100) + '% of their position size long. Counts accounts, not money.',
        value: ls, usual: [C.p25, C.p75], median: C.median,
        bandLabel: 'Usual ' + (C.p25 * 100).toFixed(1) + '–' + (C.p75 * 100).toFixed(1) + '%',
      };

      // ---------- 2 · big liquidations just now ----------
      const l1 = sum(S.liqLongK, m - HOUR, m), s1 = sum(S.liqShortK, m - HOUR, m), h1 = l1 + s1;
      const size = h1 >= 2 * hourlyAvgK ? 'Big' : h1 >= 0.5 * hourlyAvgK ? 'Some' : 'Quiet';
      const sideOf = (a, b) => (a + b > 0 && a / (a + b) >= 0.6 ? 'longs' : a + b > 0 && b / (a + b) >= 0.6 ? 'shorts' : 'both sides');
      const side1 = sideOf(l1, s1), side4 = sideOf(l4, s4);
      let verdict2, answer2;
      if (size === 'Quiet') { verdict2 = 'Quiet in the last hour'; answer2 = 'Quiet now; ' + side4 + ' in the last 4 hours'; }
      else { verdict2 = size + ' in the last hour: ' + side1 + ' forced out'; answer2 = size + ': ' + side1 + ', in the last hour'; }
      const soFarL = sum(S.liqLongK, 0, m), soFarS = sum(S.liqShortK, 0, m);
      const daySide = soFarL >= soFarS ? 'longs' : 'shorts';
      const orders = D.liquidations.top10.map(([tm, sd, u]) => ({ ms: orderMs(tm), side: sd, usd: u })).filter(o => o.ms < t).sort((a, b) => b.usd - a.usd);
      const big = orders[0];
      const flipped = side4 !== 'both sides' && side4 !== daySide;
      let detail2 = flipped
        ? 'Earlier it was ' + daySide + ': ' + kusd(daySide === 'longs' ? soFarL : soFarS) + ' over the day.'
        : 'Over the day so far: ' + kusd(soFarL + soFarS) + ', ' + Math.round(100 * Math.max(soFarL, soFarS) / Math.max(1, soFarL + soFarS)) + '% ' + daySide + '.';
      if (big) detail2 += ' Biggest: a ' + kusd(big.usd / 1000) + ' ' + big.side + ' at ' + hm(big.ms) + ' UTC.';
      const q2 = {
        verdict: verdict2, answer: answer2, size, side1,
        number: (h1 / 1000).toFixed(1).replace(/^0\.0$/, '0.0'), prefix: '$', suffix: 'M',
        unit: 'forced out in the last hour, against ' + kusd(hourlyAvgK) + ' an hour today',
        detail: detail2, l4, s4, l1, s1, hourlyAvgK,
      };

      // ---------- 3 · expensive to hold ----------
      const k = fundIndex(t);
      const rates = {}; EX.forEach(e => { rates[e] = F[e][k]; });
      const kind = r => (r >= EXPENSIVE ? 'Expensive' : r > RESTING ? 'Longs are paying up' : r > 0 ? 'Cheap' : 'Shorts pay');
      const b = rates.binance, othersNeg = EX.filter(e => e !== 'binance' && rates[e] < 0), allNeg = EX.every(e => rates[e] < 0);
      let verdict3, answer3;
      if (b >= EXPENSIVE) { verdict3 = 'Yes. Expensive'; answer3 = 'Expensive'; }
      else if (b > RESTING) { verdict3 = 'Getting there: longs are paying up'; answer3 = 'Longs are paying up'; }
      else if (b > 0) { verdict3 = othersNeg.length ? 'No. Cheap either way' : 'No. Cheap'; answer3 = othersNeg.length ? 'Cheap; shorts pay on ' + othersNeg.map(e => EX_NAME[e]).join(' and ') : 'Cheap'; }
      else if (allNeg) { verdict3 = 'No. Shorts pay on all three'; answer3 = 'Shorts pay on all three'; }
      else { verdict3 = 'No. Shorts pay on Binance'; answer3 = 'Shorts pay on Binance'; }
      const oiUp = doi > 0, lsAboveMedian = ls > C.median, fundAbove = b > RESTING;
      const crowded = oiUp && lsAboveMedian && fundAbove;
      const why = !oiUp ? 'open interest is falling' : !fundAbove ? 'funding is at or below the resting rate' : 'fewer accounts are long than usual';
      const payers = EX.filter(e => e !== 'binance').map(e => rates[e] < 0 ? EX_NAME[e] + ' (' + money2(perDay(rates[e])) + ' a day to longs)' : null).filter(Boolean);
      let detail3 = '';
      if (b > 0 && othersNeg.length) detail3 = 'Shorts pay on ' + othersNeg.map(e => EX_NAME[e] + ' (' + money2(perDay(rates[e])) + ' a day)').join(' and ') + '. ';
      else if (allNeg) detail3 = 'Longs are paid on all three: Binance ' + money2(perDay(rates.binance)) + ', OKX ' + money2(perDay(rates.okx)) + ' and Bybit ' + money2(perDay(rates.bybit)) + ' a day. ';
      detail3 += crowded ? 'Crowded long: funding, open interest and the long share are all high.' : 'Not crowded: ' + why + '.';
      const q3 = {
        verdict: verdict3, answer: answer3,
        number: perDay(b).toFixed(2), prefix: '$', suffix: '/day',
        unit: b < 0 ? 'paid to longs on $1,000 on Binance' : 'to hold $1,000 long on Binance',
        detail: detail3, rates, settledMs: fundTime(k), usual: usual3, crowded, payers,
      };

      return {
        m, t, stamp: dayMon(t) + ' 2026, ' + hm(t) + ' UTC (' + eat(t) + ' EAT)', hm: hm(t), dayMon: dayMon(t),
        line: { kind: lineKind, headline, sentence, tiles, dp, doi, l4, s4, p1 },
        q1, q2, q3,
      };
    }

    // The 30-day funding facts in the funding card.
    function fundingFacts() {
      const n = F.binance.length, week = 21;
      const above = EX.reduce((a, e) => a + F[e].filter(r => r > RESTING + 1e-12).length, 0);
      const negWeek = EX.reduce((a, e) => a + F[e].slice(n - week).filter(r => r < 0).length, 0);
      const bNeg = F.binance.filter(r => r < 0).length, bNegWeek = F.binance.slice(n - week).filter(r => r < 0).length;
      return [
        { name: 'Above 0.01%', tag: '30D', value: above + ' of ' + n * EX.length, note: 'payments, 30 days' },
        { name: 'Below zero', tag: '7D', value: negWeek + ' of ' + week * EX.length, note: 'payments, last 7 days' },
        { name: 'Binance below zero', tag: '30D', value: String(bNeg), note: bNeg && bNeg === bNegWeek ? 'all in the last 7 days' : bNegWeek + ' in the last 7 days' },
      ];
    }

    return { at, timeOf, fundingFacts, fundTime, hourlyAvgK, dayTotalK, usual3, EX, EX_NAME, hm, dayMon, eat, kusd, usd, money2, perDay, signedRate, RESTING };
  }

  const api = { make, MOMENTS: { now: 'Now', flush: 'The flush', low: 'The low' } };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.WimbiRules = api;

  // node rules.js → print the answers at the three moments, to check against the brief's table.
  if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
    const fs = require('fs'); const path = require('path');
    const D = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/btc-2026-11-21.json'), 'utf8'));
    const R = make(D);
    for (const [k, label] of Object.entries(api.MOMENTS)) {
      const a = R.at(D.moments[k]);
      console.log('\n== ' + label + ' · ' + a.stamp);
      console.log('  4h:', a.line.headline, '|', a.line.tiles.map(x => x.name + ' ' + x.value + ' ' + x.note).join(' · '));
      for (const q of ['q1', 'q2', 'q3']) console.log('  ' + q + ':', a[q].verdict, '|', (a[q].prefix || '') + a[q].number + a[q].suffix, a[q].unit, '|', a[q].detail, '| answer:', a[q].answer);
    }
    console.log('\nfacts:', JSON.stringify(R.fundingFacts()));
  }
})(typeof window !== 'undefined' ? window : globalThis);
