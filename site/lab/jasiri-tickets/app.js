/* Jasiri tickets · coded concept on tedthie.cc
   One state object, one render per screen. No network calls, no storage, nothing is sold or paid. */
(function () {
  'use strict';
  var D = window.JT_DATA, A = window.JTArena, ICONS = window.JT_ICONS;
  var PD = { floor: '#100E1F', apron: '#141228', court: '#1A0B3D', courtLine: '#6A3BD6', blk: '#1B1930', blkLine: '#2E2A4D', side: '#13112A', sel: '#A3A9FF', selRow: '#1A0B3D', hatch: 'jt-hatch', lbl: '#EDEBFF', lblSel: '#0B0A14', lblSo: '#8E89C2' };
  var N = D.seatsPerRow, HOLD = 300;
  var app = document.getElementById('app'), screenEl = document.getElementById('screen'), sheetEl = document.getElementById('sheet'),
    toastEl = document.getElementById('toast'), demoEl = document.getElementById('demo'), device = document.getElementById('device'),
    conceptBar = document.querySelector('.concept');

  /* ---------- helpers ---------- */
  function ic(n, cls) { return '<svg class="i ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (ICONS[n] || '') + '</svg>'; }
  function ksh(n) { return 'KSh ' + n.toLocaleString('en-US'); }
  function mmss(s) { s = Math.max(0, s); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function bar(c) { return '<span class="bar" style="background:' + D.colour[c].hex + '"></span>'; }
  function bname(id) { return D.blocks[id].name || id; }
  function seatNo(s) { return +s.slice(1); }
  function sb() { return '<div class="sb" aria-hidden="true"><span>9:41</span><span>' + ic('antenna-bars-5') + ic('wifi') + ic('battery-3') + '</span></div>'; }

  /* ---------- seats ---------- */
  var SEATS = {};
  function buildSeats() {
    Object.keys(D.blocks).forEach(function (id) { SEATS[id] = D.seatMap(id); });
    syncLeft();
  }
  function left(id) { var m = SEATS[id], c = 0; for (var k in m) if (m[k] !== 'taken') c++; return c; }
  function resaleCount(id) { var m = SEATS[id], c = 0; for (var k in m) if (m[k] === 'resale') c++; return c; }
  function syncLeft() { A.blocks.forEach(function (b) { b.lf = left(b.id); }); }
  function totalLeft() { var t = 0; Object.keys(D.blocks).forEach(function (id) { t += left(id); }); return t; }
  function runs(id, q) {
    var m = SEATS[id], out = [];
    D.rowsFor(id).forEach(function (r, ri) {
      for (var s = 1; s + q - 1 <= N; s++) {
        if (s <= 7 && s + q - 1 > 7) continue;
        var ok = true;
        for (var k = 0; k < q; k++) { if (m[r + (s + k)] === 'taken') { ok = false; break; } }
        if (ok) { var c = s + (q - 1) / 2, seats = []; for (k = 0; k < q; k++) seats.push(r + (s + k)); out.push({ score: Math.abs(ri - 2) + Math.abs(c - 7.5) * 0.25, seats: seats }); }
      }
    });
    return out.sort(function (a, b) { return a.score - b.score; });
  }
  function together(seats) {
    if (seats.length < 2) return seats.length === 1;
    var r = seats[0].charAt(0), ns = seats.map(seatNo).sort(function (a, b) { return a - b; });
    for (var i = 0; i < seats.length; i++) if (seats[i].charAt(0) !== r) return false;
    for (i = 1; i < ns.length; i++) if (ns[i] !== ns[i - 1] + 1 || (ns[i - 1] === 7)) return false;
    return true;
  }
  function sortSeats(a) { return a.slice().sort(function (x, y) { return x.charAt(0) === y.charAt(0) ? seatNo(x) - seatNo(y) : x < y ? -1 : 1; }); }

  /* ---------- state ---------- */
  var S, qTimer = null, toastTimer = null, cache = {};
  function fresh() {
    return {
      view: 'fan', screen: 'home', sheet: null, busy: false, ahead: D.queue.ahead, th: -25 * Math.PI / 180, tilt: 1.0, dragged: false,
      block: null, soldTapped: null, waitlist: false, qty: 3, fTogether: false, fUnder: false,
      picked: [], hold: HOLD, resend: 24, tickets: [], cur: 0, sellPrice: 1000, sendTo: null, gatesOpen: false,
      qrIn: 20, qrSeed: 7, st: { i: 0, offline: false, count: 1128, pending: 214 }
    };
  }

  /* ---------- screens ---------- */
  function home() {
    var t = S.tickets.length;
    return '<div class="scr dark">' + sb() +
      '<div class="pad">' +
      '<div class="row between"><span class="word">Jasiri <small>tickets</small></span><span class="row gap8"><button type="button" class="cb" data-a="toast" data-msg="Notifications aren\'t part of this demo." aria-label="Notifications">' + ic('bell') + '</button><span class="cb cb--aero" aria-hidden="true">KM</span></span></div>' +
      '<h1 class="big hero">Your seat,<br><span class="aero">sorted.</span></h1>' +
      '<button type="button" class="search" data-a="toast" data-msg="Search isn\'t part of this demo. Open the featured game.">' + ic('search') + '<span>Games, teams, venues</span><span class="cb cb--s">' + ic('adjustments-horizontal') + '</span></button>' +
      '<div class="chips" aria-hidden="true"><span class="chip on">All</span><span class="chip">Basketball</span><span class="chip">Football</span><span class="chip">Rugby</span></div>' +
      '<button type="button" class="feature" data-a="open-game" aria-label="' + D.game.title + ', ' + D.game.day + ' at ' + D.game.time + ', ' + D.game.venue + '. From ' + ksh(1000) + '.">' +
      '<svg class="feature__court" viewBox="0 0 200 120" aria-hidden="true"><g fill="none" stroke="#fff" stroke-width="2.5"><rect x="4" y="4" width="192" height="112" rx="4"/><line x1="100" y1="4" x2="100" y2="116"/><circle cx="100" cy="60" r="16"/><path d="M4 42h40v36H4"/><path d="M196 42h-40v36h40"/><path d="M4 12C70 12 70 108 4 108"/><path d="M196 12C130 12 130 108 196 108"/></g></svg>' +
      '<span class="row between rel"><span class="pill-w">' + D.game.day + ' · ' + D.game.time + '</span><span class="t11">' + D.game.sport + '</span></span>' +
      '<span class="feature__title">Thunder<br>vs KPA</span>' +
      '<span class="feature__foot"><span><span class="t12 ice">' + D.game.venue + '</span><span class="t13 em">From ' + ksh(1000) + ' · ' + totalLeft().toLocaleString('en-US') + ' left</span></span><span class="feature__go">' + ic('arrow-up-right') + '</span></span></button>' +
      '<div class="row between sec"><span class="h17">This week</span><button type="button" class="t12 mu link" data-a="toast" data-msg="This demo has one game you can buy.">See all</button></div>' +
      '<button type="button" class="soon" data-a="toast" data-msg="Sales open ' + D.other.queueOpens + '. Its stadium map isn\'t in this demo.">' +
      '<span class="soon__ic">' + ic('ball-football') + '</span><span class="grow"><span class="t14 em">' + D.other.title + '</span><span class="t11 mu">' + D.other.venue + ' · ' + D.other.day + '</span><span class="t11 amber">' + ic('clock', 'i--s') + ' Queue opens Mon</span></span><span class="cb cb--2">' + ic('arrow-up-right') + '</span></button>' +
      '</div>' +
      '<nav class="nav" aria-label="Main"><span class="nav__on">' + ic('home') + '</span><button type="button" data-a="toast" data-msg="Search isn\'t part of this demo." aria-label="Search">' + ic('search') + '</button>' +
      '<button type="button" class="nav__mid" data-a="tickets" aria-label="Your tickets' + (t ? ', ' + t : '') + '">' + ic('ticket') + (t ? '<span class="nav__badge">' + t + '</span>' : '') + '</button>' +
      '<button type="button" data-a="toast" data-msg="Saved games aren\'t part of this demo." aria-label="Saved">' + ic('heart') + '</button><button type="button" data-a="toast" data-msg="Your profile isn\'t part of this demo." aria-label="Profile">' + ic('user') + '</button></nav></div>';
  }

  function queue() {
    var pct = Math.round((1 - S.ahead / D.queue.ahead) * 100), mins = Math.max(1, Math.ceil(S.ahead / 560));
    return '<div class="scr dark">' + sb() +
      '<div class="hdr"><button type="button" class="cb" data-a="go" data-to="home" aria-label="Leave the queue">' + ic('x') + '</button><div class="hdr__t"><b>' + D.game.title + '</b><span>' + D.game.venue + ' · ' + D.game.day + '</span></div><span class="cb" aria-hidden="true">' + ic('info-circle') + '</span></div>' +
      '<div class="pad">' +
      '<div class="row between mt22"><span class="t13 mu">You\'re in the queue</span><span class="live">' + '<span class="dot"></span>Sales open</span></div>' +
      '<div class="big aero q-num" id="q-ahead" aria-live="polite">' + S.ahead.toLocaleString('en-US') + '</div>' +
      '<div class="t14">people ahead of you</div>' +
      '<div class="track mt18"><div class="track__fill" id="q-bar" style="width:' + pct + '%"></div></div>' +
      '<div class="row between t12 mu mt8"><span>About <span class="mono tx" id="q-min">' + mins + ' min</span></span><span>You\'ll have 5 minutes to pick</span></div>' +
      '<div class="tiles mt16"><div class="tile"><span class="t11 mu">In the queue</span><span class="big t24">' + D.queue.total.toLocaleString('en-US') + '</span></div><div class="tile"><span class="t11 mu">Tickets left, live</span><span class="big t24">' + D.queue.left.toLocaleString('en-US') + '</span></div></div>' +
      '</div>' +
      '<div class="sheet mt16"><div class="hd"></div><h2 class="h17 mb12">How the queue works</h2><ul class="li-list">' +
      li('arrows-shuffle', 'Everyone here before sales opened got a random place.') + li('refresh', 'Refreshing won\'t move you up or back.') + li('clock-pause', 'Leave for up to 10 minutes and keep your place.') + li('ticket', 'Up to 4 tickets per phone number.') +
      '</ul><div class="card row between mt14"><span><span class="t14 em">Buzz me when it\'s my turn</span><span class="mono t11 pm">' + D.phone + '</span></span><span class="tg" aria-hidden="true"></span></div></div></div>';
  }
  function li(icn, text) { return '<li class="li"><span class="li__ic">' + ic(icn) + '</span><span>' + text + '</span></li>'; }

  function mapSvg() { return A.orbit(S.block, S.th, S.tilt, 268, 196, PD); }
  function thumb(id) { var k = 'th|' + id; if (!cache[k]) cache[k] = A.blockView(id, 62, 44, PD); return cache[k]; }

  function listRows() {
    var ids = Object.keys(D.blocks).filter(function (id) { return left(id) > 0; });
    if (S.fUnder) ids = ids.filter(function (id) { return D.blocks[id].price < 1500; });
    if (S.fTogether) ids = ids.filter(function (id) { return runs(id, S.qty).length > 0; });
    ids.sort(function (a, b) { return D.blocks[a].price - D.blocks[b].price || (a === S.block ? -1 : b === S.block ? 1 : 0) || (a < b ? -1 : 1); });
    var html = ids.map(function (id) {
      var b = D.blocks[id], on = id === S.block, rc = resaleCount(id), lf = left(id), low = lf <= 10, tg = runs(id, S.qty).length > 0;
      return '<button type="button" class="lst' + (on ? ' on' : '') + '" data-a="pick-block" data-id="' + id + '" aria-pressed="' + on + '" id="row-' + id + '">' +
        '<span class="thumb" aria-hidden="true"><svg viewBox="0 0 62 44" width="62" height="44">' + thumb(id) + '</svg></span>' +
        '<span class="grow"><span class="t15 em">' + bar(b.colour) + bname(id) + (rc ? ' <span class="tag">Resale</span>' : '') + '</span><span class="t11 ' + (on ? 'sub' : low ? 'warn' : 'pm') + '">' + b.side + ' · ' + lf + ' left' + (rc ? ' · ' + rc + ' at face value' : '') + '</span></span>' +
        '<span class="right"><span class="t14 em nowrap">' + ksh(b.price) + '</span><span class="t11 ' + (on ? 'aero' : 'pm') + '">' + (tg ? S.qty + ' together' : b.gate) + '</span></span></button>';
    }).join('');
    Object.keys(D.blocks).filter(function (id) { return left(id) === 0; }).forEach(function (id) {
      html += '<div class="lst lst--out"><span class="thumb dim" aria-hidden="true"><svg viewBox="0 0 62 44" width="62" height="44">' + thumb(id) + '</svg></span><span class="grow"><span class="t15 em pm">' + bname(id) + ' · sold out</span><span class="t11 pm">Resale seats go to the waitlist first</span></span>' +
        '<button type="button" class="wl" data-a="waitlist" aria-pressed="' + S.waitlist + '">' + (S.waitlist ? 'On the list' : 'Waitlist') + '</button></div>';
    });
    if (!ids.length) html = '<p class="empty">No blocks fit these filters. Try fewer tickets or turn a filter off.</p>' + html;
    return html;
  }

  function event() {
    var b = S.block && D.blocks[S.block];
    return '<div class="scr dark">' + sb() +
      '<div class="hdr"><button type="button" class="cb" data-a="go" data-to="home" aria-label="Back">' + ic('arrow-left') + '</button><div class="hdr__t"><b>' + D.game.title + '</b><span>' + D.game.day + ' · ' + D.game.time + ' · indoor arena</span></div><button type="button" class="cb" data-a="toast" data-msg="Sharing isn\'t part of this demo." aria-label="Share">' + ic('share-2') + '</button></div>' +
      '<div class="map"><svg viewBox="0 0 268 196" id="map" tabindex="0" role="group" aria-label="Arena map. Drag to turn and tilt it, or use the arrow keys. Tap a block, or use the list below.">' + mapSvg() + '</svg>' +
      (S.dragged ? '' : '<span class="map__hint" aria-hidden="true">' + ic('rotate-clockwise-2', 'i--s') + ' Drag to turn · tap a block</span>') +
      '<button type="button" class="cb cb--s map__rot" data-a="rotate" aria-label="Turn the arena a quarter">' + ic('rotate-clockwise-2') + '</button></div>' +
      '<div class="sheet"><div class="hd"></div>' +
      (S.soldTapped ? '<div class="card alert">' + '<span class="alert__ic">' + ic('alert-circle') + '</span><span><span class="t14 em">' + S.soldTapped + ' sold out a moment ago</span><span class="t12 pm">' + S.block + ' next door: same price, almost the same view.</span></span></div>' : '') +
      '<div class="chips chips--sheet"><button type="button" class="chip on" data-a="qty-cycle">' + S.qty + ' ticket' + (S.qty > 1 ? 's' : '') + ' ' + ic('chevron-down', 'i--s') + '</button><button type="button" class="chip' + (S.fTogether ? ' on' : '') + '" data-a="f-together" aria-pressed="' + S.fTogether + '">Together</button><button type="button" class="chip' + (S.fUnder ? ' on' : '') + '" data-a="f-under" aria-pressed="' + S.fUnder + '">Under 1,500</button></div>' +
      '<div class="row between t11 pm note"><span>' + ic('circle-check', 'i--s') + ' Prices include all fees</span><span>Lowest first</span></div>' +
      '<div class="list" id="list">' + listRows() + '</div>' +
      '<div class="dock"><button type="button" class="cta" data-a="go-seats"' + (b ? '' : ' aria-disabled="true"') + '><span>' + (b ? 'Choose seats in ' + bname(S.block) : 'Pick a block first') + '</span><span class="ar">' + ic('arrow-right') + '</span></button></div>' +
      '</div></div>';
  }

  function seatGrid() {
    var id = S.block, m = SEATS[id], rows = D.rowsFor(id), sw = 12, gp = 3, ai = 10, span = N * (sw + gp) - gp + ai, x0 = (268 - span) / 2, H = 49 + rows.length * 16 + 2;
    function sx(n) { return x0 + (n - 1) * (sw + gp) + (n > 7 ? ai : 0); }
    var pickedRows = S.picked.map(function (s) { return s.charAt(0); });
    var g = '<g class="sg-row"><rect x="' + (x0 - 6) + '" y="0" width="' + (span + 12) + '" height="24" rx="12" fill="#14122B"/><text x="134" y="16" text-anchor="middle" font-size="11" fill="#EDEBFF">Court this way ↑</text>' +
      (id.charAt(0) !== 'V' ? '<rect x="' + (x0 - 6) + '" y="28" width="' + (span + 12) + '" height="4" rx="2" fill="#E5484D"/>' : '');
    for (var n = 1; n <= N; n++) g += '<text x="' + (sx(n) + 6) + '" y="43" text-anchor="middle" class="sg-n">' + n + '</text>';
    g += '</g>';
    rows.forEach(function (r, ri) {
      var y = 49 + ri * 16, on = pickedRows.indexOf(r) >= 0, c = on ? '#002FF1' : '#9A9AB8';
      g += '<g class="sg-row"><text x="' + (x0 - 12) + '" y="' + (y + 9) + '" text-anchor="middle" class="sg-r" fill="' + c + '">' + r + '</text><text x="' + (x0 + span + 12) + '" y="' + (y + 9) + '" text-anchor="middle" class="sg-r" fill="' + c + '">' + r + '</text>';
      for (var n2 = 1; n2 <= N; n2++) {
        var s = r + n2, st = m[s], mine = S.picked.indexOf(s) >= 0, x = sx(n2), f, sk, bk;
        if (mine) { f = '#002FF1'; sk = 'none'; bk = '#002FF1'; } else if (st === 'resale') { f = '#A3A9FF'; sk = '#571CC4'; bk = '#571CC4'; } else if (st === 'taken') { f = '#D6D9EE'; sk = 'none'; bk = '#D6D9EE'; } else { f = '#FFFFFF'; sk = D.colour[D.blocks[id].colour].hex; bk = sk; }
        var lab = 'Row ' + r + ', seat ' + n2 + ', ' + (mine ? 'yours' : st === 'resale' ? 'resale at face value' : st);
        g += st === 'taken' && !mine ? '<g aria-hidden="true">' : '<g class="seat" data-seat="' + s + '" role="button" tabindex="0" aria-pressed="' + mine + '" aria-label="' + lab + '">';
        g += '<rect x="' + (x - 1) + '" y="' + (y - 1) + '" width="14" height="16" fill="transparent"/><rect x="' + x + '" y="' + y + '" width="12" height="10" rx="3" fill="' + f + '" stroke="' + sk + '" stroke-width="1.3"/><rect x="' + (x + 1) + '" y="' + (y + 11.5) + '" width="10" height="2" rx="1" fill="' + bk + '"/></g>';
      }
      g += '</g>';
    });
    return { svg: g, h: H };
  }
  function viewSvg() {
    var id = S.block, last = S.picked[S.picked.length - 1], key = 'v|' + id + '|' + (last || '');
    if (!cache[key]) {
      if (last) { var rows = D.rowsFor(id); cache[key] = A.seatView(id, rows.indexOf(last.charAt(0)), seatNo(last), rows.length, N, 276, 150, PD); }
      else cache[key] = A.blockView(id, 276, 150, PD);
    }
    return cache[key];
  }
  function seats() {
    var b = D.blocks[S.block], grid = seatGrid(), last = S.picked[S.picked.length - 1], p = sortSeats(S.picked), done = p.length === S.qty,
      tot = p.reduce(function (t) { return t + b.price; }, 0);
    var sum = p.length ? 'Row' + (together(p) ? ' ' + p[0].charAt(0) + ' · seats ' + p.map(seatNo).join(', ') : 's ' + p.join(', ')) : 'No seats picked yet';
    return '<div class="scr dark">' + sb() +
      '<div class="hdr"><button type="button" class="cb" data-a="go" data-to="event" aria-label="Back to the map">' + ic('arrow-left') + '</button><div class="hdr__t"><b>' + bar(b.colour) + 'Block ' + bname(S.block) + '</b><span>' + D.colour[b.colour].name + ' seats · ' + b.tier + '</span></div><span class="hold" title="Seats held for you"><span class="sr-only">Seats held for </span>' + ic('clock', 'i--s') + ' <span id="hold">' + mmss(S.hold) + '</span></span></div>' +
      '<div class="view"><svg viewBox="0 0 276 150" aria-hidden="true">' + viewSvg() + '</svg><span class="view__l">View from <b>' + (last || bname(S.block)) + '</b></span><span class="view__r">Illustrated</span></div>' +
      '<div class="sheet mt12"><div class="hd"></div>' +
      '<div class="row between"><h2 class="h18">Pick ' + S.qty + ' seat' + (S.qty > 1 ? 's' : '') + '</h2><button type="button" class="chip" data-a="best">' + ic('sparkles', 'i--s') + ' Best together</button></div>' +
      '<svg class="grid" viewBox="0 0 268 ' + grid.h + '" id="grid" role="group" aria-label="Seats in block ' + bname(S.block) + '. The court is at the top.">' + grid.svg + '</svg>' +
      '<div class="legend" aria-hidden="true"><span><i class="lg" style="border:1.5px solid ' + D.colour[b.colour].hex + '"></i>Open</span><span><i class="lg" style="background:#D6D9EE"></i>Taken</span><span><i class="lg" style="background:#002FF1"></i>Yours</span><span><i class="lg" style="background:#A3A9FF;border:1px solid #571CC4"></i>Resale</span></div>' +
      '<div class="sum"><div><div class="row gap8 t12 pm"><span>' + sum + '</span>' + (done && S.qty > 1 && together(p) ? '<span class="tag">Together</span>' : '') + '</div><div class="ledger t28 mt8">' + ksh(tot) + '</div></div>' +
      '<div class="step" role="group" aria-label="Number of tickets"><button type="button" data-a="qty" data-d="-1" aria-label="One fewer ticket">' + ic('minus') + '</button><span class="mono" aria-live="polite">' + S.qty + '</span><button type="button" data-a="qty" data-d="1" aria-label="One more ticket">' + ic('plus') + '</button></div></div>' +
      '<p class="t11 pm mt8">' + (done ? S.qty + ' × ' + ksh(b.price) + ', fees in. Up to 4 per phone.' : 'Tap ' + (S.qty - p.length) + ' more seat' + (S.qty - p.length > 1 ? 's' : '') + ', or let us find seats together.') + '</p>' +
      '<div class="dock"><button type="button" class="cta" data-a="pay"' + (done ? '' : ' aria-disabled="true"') + '><span>' + (done ? 'Pay ' + ksh(tot) + ' with M-Pesa' : 'Pick ' + (S.qty - p.length) + ' more seat' + (S.qty - p.length > 1 ? 's' : '')) + '</span><span class="ar">' + ic('arrow-right') + '</span></button></div>' +
      '</div></div>';
  }

  function chipsLight(p) {
    var b = D.blocks[S.block], ns = sortSeats(p);
    var seatTxt = together(ns) ? ns[0].charAt(0) + seatNo(ns[0]) + (ns.length > 1 ? '–' + seatNo(ns[ns.length - 1]) : '') : ns.join(', ');
    return '<div class="row gap6 mt14 wrap"><span class="chip chip--l">' + bar(b.colour) + bname(S.block) + ' · ' + seatTxt + '</span><span class="chip chip--l">' + D.game.day + ', 6 pm</span></div>';
  }
  function pay() {
    var tot = S.picked.length * D.blocks[S.block].price;
    return '<div class="scr light">' + sb() +
      '<div class="hdr"><button type="button" class="cb" data-a="go" data-to="seats" aria-label="Back to seats">' + ic('x') + '</button><div class="hdr__t"><b>Pay with M-Pesa</b></div><span class="hold hold--l">' + ic('clock', 'i--s') + ' <span id="hold">' + mmss(S.hold) + '</span></span></div>' +
      '<div class="pad"><div class="t12 pm mt22">Total, fees in</div><div class="ledger t46 mt8">' + ksh(tot) + '</div>' + chipsLight(S.picked) +
      '<div class="ink mt18"><div class="row gap14"><svg class="ring" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="28" fill="none" stroke="#2E2A4D" stroke-width="4"/><path d="M32 4 A28 28 0 0 1 60 32" fill="none" stroke="#A3A9FF" stroke-width="4" stroke-linecap="round"/><g transform="translate(20 18)" fill="none" stroke="#fff" stroke-width="2"><rect x="3" y="0" width="18" height="28" rx="4"/><line x1="10" y1="23" x2="14" y2="23"/></g></svg>' +
      '<div><div class="h19">Check your phone</div><div class="mono t12 sub mt3">' + D.phone + '</div></div></div>' +
      '<p class="t13 sub2 mt14">Approve the M-Pesa prompt. Your PIN goes into that prompt only, never into Jasiri.</p>' +
      '<ul class="steps mt16"><li><span class="st st--ok">' + ic('check') + '</span>Prompt sent</li><li><span class="st st--now"><span></span></span>Waiting for you to approve</li><li class="off"><span class="st"></span>Tickets sent to your number</li></ul></div>' +
      '<p class="t12 pm center mt16">No prompt? ' + (S.resend > 0 ? 'Resend in <span class="mono" id="resend">' + mmss(S.resend) + '</span>' : '<button type="button" class="link em" data-a="resend">Resend now</button>') + ' · don\'t pay twice</p>' +
      '<p class="t11 pm center mt8 demo-hint">In this demo, approve the prompt or let it time out from the panel.</p></div></div>';
  }
  function payfail() {
    var tot = S.picked.length * D.blocks[S.block].price;
    return '<div class="scr light">' + sb() +
      '<div class="hdr"><button type="button" class="cb" data-a="go" data-to="seats" aria-label="Back to seats">' + ic('x') + '</button><div class="hdr__t"><b>Pay with M-Pesa</b></div><span class="hold hold--l">' + ic('clock', 'i--s') + ' <span id="hold">' + mmss(S.hold) + '</span></span></div>' +
      '<div class="pad"><div class="t12 pm mt22">Not paid yet</div><div class="ledger t46 mt8">' + ksh(tot) + '</div>' + chipsLight(S.picked) +
      '<div class="ink mt18"><div class="row gap14"><span class="fx">' + ic('clock-x') + '</span><div><div class="h18">The prompt timed out</div><div class="t12 sub mt3">No money was taken</div></div></div>' +
      '<ul class="steps mt16"><li><span class="st st--ok">' + ic('check') + '</span>Prompt sent</li><li><span class="st st--fx">' + ic('x') + '</span>Not approved in time</li><li class="off"><span class="st"></span>Seats still held for you</li></ul>' +
      '<p class="t12 sub2 mt14 rule">Usually the phone was locked, had no signal, or the prompt was closed.</p></div>' +
      '<div class="dock dock--flat"><button type="button" class="cta" data-a="resend"><span>Send a new prompt</span><span class="ar">' + ic('send') + '</span></button>' +
      '<button type="button" class="btn-w mt8" data-a="toast" data-msg="Changing the number isn\'t part of this demo.">Use a different number</button></div>' +
      '<p class="t11 pm center mt12">Money left your account? Tickets arrive by SMS within 2 minutes, or it comes back automatically.</p></div></div>';
  }

  function qrSvg(seed, dark, light) {
    var s = seed, T = {}, out = '<rect width="25" height="25" fill="' + light + '"/>';
    function rnd() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
    function put(k, x, y, w, f) { (T[k] = T[k] || []).push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + w + '" fill="' + f + '"/>'); }
    for (var y = 0; y < 25; y++) for (var x = 0; x < 25; x++) { var inF = (x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16); if (!inF && rnd() > 0.52) put(Math.floor(x / 5) + ',' + Math.floor(y / 5), x, y, 1, dark); }
    [[0, 0], [18, 0], [0, 18]].forEach(function (p) { var k = Math.floor(p[0] / 5) + ',' + Math.floor(p[1] / 5); put(k, p[0], p[1], 7, dark); put(k, p[0] + 1, p[1] + 1, 5, light); put(k, p[0] + 2, p[1] + 2, 3, dark); });
    Object.keys(T).forEach(function (k) { out += '<g class="qt" data-t="' + k + '">' + T[k].join('') + '</g>'; });
    return out;
  }
  function statusText(t) {
    var c = D.contacts.filter(function (x) { return x.id === t.to; })[0];
    return { mine: ['With you', 'aero'], listed: ['Listed · ' + ksh(t.price), 'amber'], sold: ['Sold · ' + ksh(t.price) + ' paid to you', 'mu'], sent: ['Sent to ' + (c && c.short) + ' · waiting to accept', 'mu'], accepted: [(c && c.short) + ' has it', 'mu'] }[t.status];
  }
  function ticket() {
    if (!S.tickets.length) return '';
    var t = S.tickets[S.cur], b = D.blocks[t.block], c = D.contacts.filter(function (x) { return x.id === t.to; })[0], live = t.status === 'mine' || t.status === 'listed' || t.status === 'sent';
    var lower = live ? '<div class="tk__qr"><svg viewBox="0 0 25 25" width="118" height="118" shape-rendering="crispEdges" id="qr" role="img" aria-label="Ticket code for seat ' + t.seat + '">' + qrSvg(S.qrSeed + S.cur * 13, '#14122B', '#F3F4FF') + '</svg>' +
      '<div class="t12 pm lh"><b class="em pt">New code in <span id="qr-in">' + S.qrIn + '</span> s.</b><br>Copies and screenshots won\'t scan.<br><br>' + (t.status === 'listed' ? 'Listed for ' + ksh(t.price) + '. If it sells, this code stops.' : t.status === 'sent' ? 'Sent to ' + c.short + '. This code stops when he accepts.' : 'Works offline.') + '</div></div>'
      : '<div class="tk__gone">' + ic('qrcode-off') + '<div class="t13">' + (t.status === 'sold' ? 'Sold for ' + ksh(t.price) + '. The money went to ' + D.phone + '. This code no longer works.' : c.name + ' has this ticket now. Your code no longer works.') + '</div></div>';
    return '<div class="scr dark">' + sb() +
      '<div class="hdr"><button type="button" class="cb" data-a="go" data-to="home" aria-label="Close">' + ic('x') + '</button><div class="hdr__t"><b>Your tickets</b></div><span class="cb" aria-hidden="true">' + ic('dots') + '</span></div>' +
      '<div class="pad"><div class="big aero t40 mt18">You\'re in.</div><div class="t13 mu">' + D.game.title + ' · ' + D.game.day + ' · ' + D.game.time + '</div>' +
      '<div class="tabs mt14" role="tablist" aria-label="Your seats">' + S.tickets.map(function (x, i) { return '<button type="button" role="tab" aria-selected="' + (i === S.cur) + '" data-a="cur" data-i="' + i + '">' + x.seat + '</button>'; }).join('') + '</div>' +
      '<div class="tk mt12"><div class="tk__band"><div><span class="t11">Block</span><span class="big t30">' + bname(t.block) + '</span></div><div><span class="t11">Row</span><span class="big t30">' + t.seat.charAt(0) + '</span></div><div><span class="t11">Seat</span><span class="big t30">' + seatNo(t.seat) + '</span></div>' +
      '<div class="tk__gate">' + b.gate + ' · arrive <span class="mono">' + b.arrive + '</span></div></div><span class="tk__n tk__n--l"></span><span class="tk__n tk__n--r"></span>' + lower + '</div>' +
      '<div class="row gap8 mt12"><button type="button" class="pill pill--aero" data-a="sheet" data-s="send">' + ic('send') + ' Send</button><button type="button" class="pill pill--w" data-a="sheet" data-s="sell">' + ic('tag') + ' Sell</button><button type="button" class="cb cb--50" data-a="toast" data-msg="' + b.gate + ' route: in the app this opens a walking map." aria-label="Route to ' + b.gate + '">' + ic('map-pin') + '</button></div>' +
      '<div class="t12 mu mt16 mb8">Your ' + S.tickets.length + ' seat' + (S.tickets.length > 1 ? 's' : '') + '</div><ul class="seatlist">' +
      S.tickets.map(function (x) { var st = statusText(x); return '<li><span>' + x.seat + '</span><span class="' + st[1] + '">' + st[0] + '</span></li>'; }).join('') + '</ul></div></div>';
  }

  function steward() {
    var r = D.steward[S.st.i], off = S.st.offline;
    return '<div class="scr dark st-scr">' + sb() +
      '<div class="hdr"><span class="cb" aria-hidden="true">' + ic('menu-2') + '</span><span></span><span class="net ' + (off ? 'net--off' : '') + '">' + ic(off ? 'wifi-off' : 'wifi', 'i--s') + ' ' + (off ? 'Offline' : 'Online') + '</span></div>' +
      '<div class="pad"><div class="row between end"><div><div class="big t44">Gate 2</div><div class="t12 mu mt6">' + D.game.title + ' · blocks G1–G4</div></div><div class="right"><div class="big aero t26">' + S.st.count.toLocaleString('en-US') + '</div><div class="t11 mu mt4">in so far</div></div></div>' +
      (off ? '<div class="offl mt12">' + ic('cloud-off', 'i--s') + ' ' + S.st.pending + ' scans will sync when back online</div>' : '') + '</div>' +
      '<div class="pad mt12"><div class="vf" aria-hidden="true"><span class="br br--tl"></span><span class="br br--tr"></span><span class="br br--bl"></span><span class="br br--br"></span><svg viewBox="0 0 25 25" class="vf__qr" shape-rendering="crispEdges">' + qrSvg(11 + S.st.i * 7, '#EDEBFF', 'transparent') + '</svg></div></div>' +
      '<div class="pad mt12 pb18"><div class="res res--' + r.kind + '" role="status" aria-live="assertive"><div class="row gap12"><span class="res__ic">' + ic(r.kind === 'ok' ? 'circle-check' : r.kind === 'dup' ? 'ban' : 'arrow-big-right-lines') + '</span><div><div class="res__t">' + r.title + '</div><div class="t14 res__s">' + r.sub + '</div></div></div>' +
      '<div class="mt14 res__l">' + r.lines.map(function (l) { return '<div class="t13">' + l + '</div>'; }).join('') + '</div><div class="t12 res__s mt12">' + r.foot + '</div>' +
      '<button type="button" class="res__btn mt12" data-a="scan">' + ic('scan') + ' Scan next</button></div></div></div>';
  }

  /* ---------- sheets ---------- */
  function sellSheet(t) {
    var face = D.blocks[t.block].price, body;
    if (t.status === 'listed') body = '<div class="card mt16"><div class="t14 em">Listed for ' + ksh(t.price) + '</div><div class="t12 pm mt3">Buyers see seat ' + t.seat + ' marked resale in the seat map. It stays yours until someone buys it.</div></div><button type="button" class="btn-w mt12" data-a="unlist">Take it down</button>';
    else if (t.status !== 'mine') body = '<div class="card mt16"><div class="t14 em">This ticket isn\'t with you any more</div><div class="t12 pm mt3">' + statusText(t)[0] + '.</div></div>';
    else body = '<div class="price mt18"><button type="button" class="cb cb--44" data-a="price" data-d="-100" aria-label="Lower the price"' + (S.sellPrice <= 100 ? ' aria-disabled="true"' : '') + '>' + ic('minus') + '</button><span class="ledger t32" aria-live="polite">' + ksh(S.sellPrice) + '</span><button type="button" class="cb cb--44" data-a="price" data-d="100" aria-label="Raise the price"' + (S.sellPrice >= face ? ' aria-disabled="true"' : '') + '>' + ic('plus') + '</button></div>' +
      '<div class="slide mt18" aria-hidden="true"><div class="slide__fill" style="width:' + Math.round(S.sellPrice / face * 100) + '%"></div><span class="slide__knob" style="left:' + Math.round(S.sellPrice / face * 100) + '%"></span></div>' +
      '<div class="row between t11 pm mt8"><span>' + ksh(100) + '</span><span>Max: ' + ksh(face) + ', what you paid</span></div>' +
      '<ul class="li-list mt16">' + li('coins', 'No fee. You get every shilling.') + li('device-mobile', 'Paid to <span class="mono">' + D.phone + '</span> the moment it sells.') + li('qrcode-off', 'Your code for ' + t.seat + ' stops working once it sells.') + li('ticket', 'Tickets aren\'t refundable, so resale is how you get money back.') + '</ul>' +
      '<div class="dock dock--flat"><button type="button" class="cta" data-a="list"><span>List seat ' + t.seat + ' for ' + ksh(S.sellPrice) + '</span><span class="ar">' + ic('arrow-right') + '</span></button></div>';
    return '<h2 class="h20 mt18">Sell seat ' + t.seat + '</h2><p class="t12 pm mt3">' + bname(t.block) + ' · Row ' + t.seat.charAt(0) + ' · resale at face value or less</p>' + body;
  }
  function sendSheet(t) {
    var why = S.gatesOpen ? 'Sending closed when gates opened at ' + D.game.gatesOpen + '.' : t.sentOnce && t.status !== 'mine' ? null : t.sentOnce ? 'This ticket has been sent once already. Each ticket can be sent once.' : t.status === 'listed' ? 'Take the listing down first, then send it.' : t.status !== 'mine' ? statusText(t)[0] + '.' : null;
    if (t.status === 'sent') why = 'Sent to ' + D.contacts.filter(function (x) { return x.id === t.to; })[0].name + '. Waiting for them to accept.';
    var body;
    if (why) body = '<div class="card mt16"><div class="t14 em">Can\'t send this one</div><div class="t12 pm mt3">' + why + '</div></div>';
    else body = '<p class="t11 pm mt16 mb8">Send to</p><div class="contacts" role="radiogroup" aria-label="Send to">' + D.contacts.map(function (c) { var on = S.sendTo === c.id; return '<button type="button" role="radio" aria-checked="' + on + '" class="contact' + (on ? ' on' : '') + '" data-a="to" data-id="' + c.id + '"><span class="av">' + c.initials + '</span><span class="grow"><span class="t14 em">' + c.name + '</span><span class="mono t11 pm">' + c.phone + '</span></span>' + (on ? ic('circle-check', 'cob') : '') + '</button>'; }).join('') + '</div>' +
      '<ul class="li-list mt16">' + li('message', 'They accept with an SMS link. No app needed.') + li('repeat-off', 'Each ticket can be sent once.') + li('door-enter', 'Sending closes when gates open, <span class="mono">' + D.game.gatesOpen + '</span>.') + li('qrcode-off', 'Your code for ' + t.seat + ' stops working once they accept.') + '</ul>' +
      '<div class="dock dock--flat"><button type="button" class="cta" data-a="send"' + (S.sendTo ? '' : ' aria-disabled="true"') + '><span>' + (S.sendTo ? 'Send seat ' + t.seat + ' to ' + D.contacts.filter(function (x) { return x.id === S.sendTo; })[0].short : 'Pick who to send it to') + '</span><span class="ar">' + ic('arrow-right') + '</span></button></div>';
    return '<h2 class="h20 mt18">Send seat ' + t.seat + '</h2><p class="t12 pm mt3">Free, to someone coming with you or in your place</p>' + body;
  }
  var sheetShown = false;
  function renderSheet() {
    if (!S.sheet || S.screen !== 'ticket') { sheetEl.hidden = true; sheetEl.innerHTML = ''; sheetShown = false; return; }
    var t = S.tickets[S.cur], enter = sheetShown ? '' : ' enter';
    sheetShown = true;
    sheetEl.hidden = false;
    sheetEl.innerHTML = '<button type="button" class="scrim' + enter + '" data-a="close-sheet" aria-label="Close"></button><div class="sheet sheet--float' + enter + '" role="dialog" aria-modal="true" aria-label="' + (S.sheet === 'sell' ? 'Sell' : 'Send') + ' seat ' + t.seat + '"><div class="hd"></div>' +
      '<div class="seg" role="tablist"><button type="button" role="tab" aria-selected="' + (S.sheet === 'sell') + '" data-a="sheet" data-s="sell">Sell</button><button type="button" role="tab" aria-selected="' + (S.sheet === 'send') + '" data-a="sheet" data-s="send">Send</button></div>' +
      (S.sheet === 'sell' ? sellSheet(t) : sendSheet(t)) + '</div>';
  }

  /* ---------- demo panel ---------- */
  function demo() {
    var listed = S.tickets.some(function (t) { return t.status === 'listed'; }), sent = S.tickets.filter(function (t) { return t.status === 'sent'; })[0];
    var sentName = sent ? D.contacts.filter(function (c) { return c.id === sent.to; })[0].short : 'Your friend';
    if (S.view === 'steward') {
      return '<h2>Try it</h2><p>The steward\'s phone at Gate 2. Each scan gets one answer, big enough to read at arm\'s length.</p>' +
        '<div class="demo__group"><h3>Scan</h3><div class="demo__btns">' + D.steward.map(function (r, i) { return '<button type="button" class="demo__btn" data-a="st" data-i="' + i + '" aria-pressed="' + (S.st.i === i) + '">' + ['A valid ticket', 'A copy', 'A Gate 4 ticket'][i] + '</button>'; }).join('') + '</div></div>' +
        '<div class="demo__group"><h3>Network</h3><label class="demo__opt"><input type="checkbox" data-a="offline"' + (S.st.offline ? ' checked' : '') + '><span>The stadium network drops. Codes are checked on the phone and scans sync later.</span></label></div>' +
        '<div class="demo__group"><h3>Why it looks like this</h3><ul class="demo__ideas"><li>Every answer pairs an icon, a word and a colour, so nobody relies on colour alone.</li><li>A copy shows when and where the first scan happened, so the steward can explain.</li><li>A wrong gate is still a valid ticket, so it gets directions, not a no.</li></ul></div>';
    }
    return '<h2>Try it</h2><p>A ticketing concept for Jasiri. Pick seats in a 3D arena, pay with M-Pesa, then sell or send a ticket. Games, seats and prices are samples.</p>' +
      '<div class="demo__group"><h3>The sale</h3><label class="demo__opt"><input type="radio" name="sale" data-a="busy" value="0"' + (S.busy ? '' : ' checked') + '><span>Normal day</span></label><label class="demo__opt"><input type="radio" name="sale" data-a="busy" value="1"' + (S.busy ? ' checked' : '') + '><span>Busy sale: everyone gets a random place in a queue</span></label></div>' +
      '<div class="demo__group"><h3>Paying</h3><p>The M-Pesa prompt appears on your phone, not in the app.</p><div class="demo__btns"><button type="button" class="demo__btn" data-a="approve"' + (S.screen === 'pay' ? '' : ' disabled') + '>Approve on the phone</button><button type="button" class="demo__btn" data-a="timeout"' + (S.screen === 'pay' ? '' : ' disabled') + '>Let it time out</button></div></div>' +
      '<div class="demo__group"><h3>After you buy</h3><div class="demo__btns"><button type="button" class="demo__btn" data-a="buyer"' + (listed ? '' : ' disabled') + '>A buyer takes your listing</button><button type="button" class="demo__btn" data-a="accept"' + (sent ? '' : ' disabled') + '>' + sentName + ' accepts</button></div>' +
      '<label class="demo__opt mt8"><input type="checkbox" data-a="gates"' + (S.gatesOpen ? ' checked' : '') + '><span>Gates are open (' + D.game.gatesOpen + '). Sending closes.</span></label></div>' +
      '<div class="demo__group"><h3>Jump to</h3><div class="demo__btns"><button type="button" class="demo__btn" data-a="jump" data-to="event">Seat map</button><button type="button" class="demo__btn" data-a="jump" data-to="soldout">A block sells out</button><button type="button" class="demo__btn" data-a="jump" data-to="ticket">Your tickets</button></div></div>' +
      '<div class="demo__group"><h3>Rules this concept sets</h3><ul class="demo__ideas"><li>Resale only in the app, at face value or less, with no seller fee.</li><li>Sending is free, once per ticket, until gates open.</li><li>No refunds, so resale is the way back.</li><li>The code changes every 20 seconds, so copies don\'t scan.</li></ul></div>';
  }

  /* ---------- motion: the same transitions as the Lottie, with the Web Animations API ---------- */
  var RM = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var CAM = 'cubic-bezier(.45,0,.15,1)', POP = 'cubic-bezier(.25,0,.25,1.18)', SHEET = 'cubic-bezier(.25,0,.25,1.07)', SOFT = 'cubic-bezier(.35,0,.15,1)', IN = 'cubic-bezier(.55,0,.85,.6)';
  function still() { return RM.matches || !Element.prototype.animate; }
  function mv(el, kf, o) {
    if (!el || still()) return Promise.resolve();
    return el.animate(kf, Object.assign({ fill: 'backwards', easing: SOFT, duration: 300 }, o)).finished.then(function () {}, function () {});
  }
  function rise(el, d, o) { return mv(el, [{ opacity: 0, transform: 'translateY(' + d + 'px)' }, { opacity: 1, transform: 'none' }], o); }
  function fadeIn(el, o) { return mv(el, [{ opacity: 0.001 }, { opacity: 1 }], o); }  // not 0: the browser still paints it during the delay
  function stagger(list, fn, start, step, max) { return Promise.all([].slice.call(list, 0, max || 12).map(function (el, i) { return fn(el, start + i * step); })); }
  function zoomK() { var a = screenEl.getBoundingClientRect(); return a.width ? screenEl.offsetWidth / a.width : 1; }
  function rel(el) { var a = screenEl.getBoundingClientRect(), r = el.getBoundingClientRect(), k = zoomK(); return { x: (r.left - a.left) * k, y: (r.top - a.top) * k, w: r.width * k, h: r.height * k }; }
  function box(r) { return { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' }; }
  function layer(cls, r, css) { var d = document.createElement('div'), st = Object.assign(box(r), css || {}); d.className = 'tx ' + cls; for (var k in st) d.style[k] = st[k]; return d; }
  function cur() { var all = screenEl.querySelectorAll('.scr'); return all[all.length - 1] || null; }
  function byId(id) { var c = cur(); return c ? c.querySelector('#' + id) : null; }
  function buildQr(tiles, delay, step) {
    return Promise.all([].map.call(tiles, function (g) {
      var t = g.getAttribute('data-t').split(',');
      return mv(g, [{ opacity: 0, transform: 'scale(.3)' }, { opacity: 1, transform: 'none' }], { duration: 300, delay: delay + (+t[0] + +t[1]) * (step || 30), easing: POP });
    }));
  }
  function shine(tk, delay) {
    if (!tk || still()) return Promise.resolve();
    var s = document.createElement('span'); s.className = 'shine'; tk.appendChild(s);
    return mv(s, [{ transform: 'translateX(-160px) skewX(-18deg)' }, { transform: 'translateX(420px) skewX(-18deg)' }], { duration: 760, delay: delay, fill: 'both' })
      .then(function () { if (s.parentNode) s.parentNode.removeChild(s); });
  }
  function sheetIn(neu, d) {
    return Promise.all([
      mv(neu.querySelector('.scr > .sheet'), [{ transform: 'translateY(105%)' }, { transform: 'none' }], { duration: 580, delay: d, easing: SHEET }),
      stagger(neu.querySelectorAll('.list > *, .li-list > li'), function (el, t) { return rise(el, 26, { duration: 340, delay: t }); }, d + 170, 45, 7)
    ]);
  }
  function introHome(neu, d) {
    return Promise.all([
      rise(neu.querySelector('.hero'), 44, { duration: 480, delay: d }),
      mv(neu.querySelector('.feature'), [{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: d + 100, easing: POP }),
      stagger(neu.querySelectorAll('.search, .chips, .sec, .soon'), function (el, t) { return rise(el, 16, { duration: 340, delay: t }); }, d + 160, 50, 4)
    ]);
  }
  var MOTION = {
    fade: function (old, neu) { return fadeIn(neu, { duration: 220 }); },
    // Home -> arena or queue: the featured card grows to fill the screen, then the next screen comes up over it
    expand: function (old, neu, ctx, extras) {
      var r = ctx.card; if (!r) return MOTION.fade(old, neu);
      var ov = layer('tx-card', r, { borderRadius: '28px' }), full = { x: 0, y: 0, w: screenEl.offsetWidth, h: screenEl.offsetHeight };
      screenEl.insertBefore(ov, neu); extras.push(ov);
      mv(old.querySelector('.feature'), [{ opacity: 1 }, { opacity: 0 }], { duration: 80, fill: 'forwards' });
      return Promise.all([
        mv(ov, [Object.assign(box(r), { borderRadius: '28px' }), Object.assign(box(full), { borderRadius: '0px' })], { duration: 460, easing: CAM, fill: 'forwards' }),
        fadeIn(neu, { duration: 240, delay: 300 }),
        mv(neu.querySelector('.map, .q-num'), [{ opacity: 0, transform: 'scale(1.06)' }, { opacity: 1, transform: 'none' }], { duration: 520, delay: 320, easing: CAM }),
        sheetIn(neu, 380)
      ]);
    },
    sheetup: function (old, neu) { return Promise.all([fadeIn(neu, { duration: 240 }), sheetIn(neu, 60)]); },
    // Arena -> seats: the view of the block opens up, the sheet pushes up and the rows come in one by one
    push: function (old, neu) {
      return Promise.all([
        fadeIn(neu, { duration: 200 }),
        mv(neu.querySelector('.view'), [{ opacity: 0, transform: 'scale(.86)' }, { opacity: 1, transform: 'none' }], { duration: 500, delay: 40, easing: CAM }),
        mv(neu.querySelector('.scr > .sheet'), [{ transform: 'translateY(105%)' }, { transform: 'none' }], { duration: 580, delay: 90, easing: SHEET }),
        stagger(neu.querySelectorAll('#grid .sg-row'), function (el, t) { return mv(el, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 260, delay: t }); }, 300, 34, 12)
      ]);
    },
    // Seats -> pay: the Pay pill stretches into the M-Pesa card
    morph: function (old, neu, ctx, extras) {
      var ink = neu.querySelector('.ink'); if (!ctx.cta || !ink) return MOTION.fade(old, neu);
      var to = rel(ink), ov = layer('tx-pill', ctx.cta, { borderRadius: '28px', background: '#002FF1' });
      screenEl.appendChild(ov); extras.push(ov);
      return Promise.all([
        fadeIn(neu, { duration: 320, delay: 40 }),
        mv(ov, [Object.assign(box(ctx.cta), { background: '#002FF1' }), Object.assign(box(to), { background: '#14122B' })], { duration: 540, easing: CAM, fill: 'forwards' }),
        fadeIn(ink, { duration: 240, delay: 470 }),
        mv(ov, [{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: 580, fill: 'forwards' })
      ]);
    },
    // Into the ticket: an ink panel rises, the ticket drops in, the code builds tile by tile
    rise: function (old, neu, ctx, extras) {
      var panel = layer('tx-panel', { x: 0, y: 0, w: screenEl.offsetWidth, h: screenEl.offsetHeight }, { background: '#0B0A14', borderRadius: '44px 44px 0 0' });
      screenEl.insertBefore(panel, neu); extras.push(panel);
      var tk = neu.querySelector('.tk');
      return Promise.all([
        mv(panel, [{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 520, easing: CAM, fill: 'forwards' }),
        fadeIn(neu, { duration: 200, delay: 420 }),
        rise(neu.querySelector('.pad > .t40'), 40, { duration: 440, delay: 460 }),
        rise(neu.querySelector('.pad > .t40 + .t13'), 30, { duration: 440, delay: 500 }),
        fadeIn(neu.querySelector('.tabs'), { duration: 300, delay: 540 }),
        mv(tk, [{ opacity: 0, transform: 'translateY(-90px) scale(.92)' }, { opacity: 1, transform: 'none' }], { duration: 660, delay: 540, easing: POP }),
        buildQr(neu.querySelectorAll('#qr .qt'), 1040),
        shine(tk, 1200),
        stagger(neu.querySelectorAll('.tk ~ .row, .seatlist li'), function (el, t) { return rise(el, 20, { duration: 320, delay: t }); }, 720, 50, 8)
      ]);
    },
    // Back to Home: the screen you were on eases away and Home settles in
    home: function (old, neu) {
      return Promise.all([
        mv(old, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.95)' }], { duration: 380, fill: 'forwards' }),
        fadeIn(neu, { duration: 300, delay: 120 }),
        introHome(neu, 200)
      ]);
    }
  };
  function kindOf(from, to) {
    if (from === to) return 'fade';
    if (from === 'home' && (to === 'event' || to === 'queue')) return 'expand';
    if (to === 'home') return 'home';
    if (to === 'ticket') return 'rise';
    if (from === 'queue' && to === 'event') return 'sheetup';
    if (from === 'event' && to === 'seats') return 'push';
    if (from === 'seats' && to === 'pay') return 'morph';
    return 'fade';
  }
  var TX = null;
  function finishTx() { if (TX) { var t = TX; TX = null; t(); } }
  function screenHtml() { return S.view === 'steward' ? steward() : { home: home, queue: queue, event: event, seats: seats, pay: pay, payfail: payfail, ticket: ticket }[S.screen](); }
  function chrome() {
    renderSheet();
    demoEl.innerHTML = demo();
    document.querySelectorAll('[data-view]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-view') === S.view)); });
  }
  // Change screens: the old screen stays underneath while the new one comes in on top, then it is removed.
  function swap(kind, mutate) {
    finishTx();
    var old = cur(), f = old && old.querySelector('.feature'), c = old && old.querySelector('.dock .cta');
    var ctx = { card: f ? rel(f) : null, cta: c ? rel(c) : null };
    hideToast(); mutate();
    if (!old || still()) { render(false); return; }
    var holder = document.createElement('div'); holder.innerHTML = screenHtml();
    var neu = holder.firstElementChild;
    if (!neu) { render(false); return; }
    screenEl.appendChild(neu); chrome();
    old.setAttribute('aria-hidden', 'true'); old.inert = true; old.style.pointerEvents = 'none';
    var extras = [], cleanup = function () {
      [old].concat(extras).forEach(function (e) { if (e.parentNode) e.parentNode.removeChild(e); });
    };
    TX = cleanup;
    (MOTION[kind] || MOTION.fade)(old, neu, ctx, extras).then(function () { if (TX === cleanup) { TX = null; cleanup(); } });
  }

  /* ---------- render ---------- */
  function render(keepScroll) {
    finishTx();
    var prev = cur(), top = keepScroll && prev ? prev.scrollTop : 0;
    screenEl.innerHTML = screenHtml();
    var scr = cur(); if (scr) scr.scrollTop = top;
    chrome();
  }
  function go(to) { stopMotion(); var from = S.screen; swap(S.view === 'steward' ? 'fade' : kindOf(from, to), function () { S.screen = to; S.sheet = null; }); }
  function hideToast() { clearTimeout(toastTimer); toastEl.classList.remove('show'); }
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.toggle('toast--dark', !!S.sheet || S.screen === 'pay' || S.screen === 'payfail');
    toastEl.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
  }
  // Close the sell/send sheet with a slide down before the state changes underneath it
  var closing = false;
  function closeSheet(then) {
    var sh = sheetEl.querySelector('.sheet--float'), sc = sheetEl.querySelector('.scrim');
    if (closing) return;
    if (!sh || still()) { then(); return; }
    closing = true;
    Promise.all([
      mv(sh, [{ transform: 'none' }, { transform: 'translateY(105%)' }], { duration: 260, easing: IN, fill: 'forwards' }),
      mv(sc, [{ opacity: 1 }, { opacity: 0 }], { duration: 240, fill: 'forwards' })
    ]).then(function () { closing = false; then(); });
  }
  function nudge(el, msg) {
    mv(el.closest('.price') || el, [{ transform: 'none' }, { transform: 'translateX(-10px)' }, { transform: 'translateX(9px)' }, { transform: 'translateX(-7px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(-2px)' }, { transform: 'none' }], { duration: 420, easing: 'linear' });
    toast(msg);
  }
  function countUp(el, from, to) {
    if (!el || from === to || still()) return;
    var t0 = performance.now();
    (function step(t) {
      var u = Math.min(1, (t - t0) / 380), e = 1 - Math.pow(1 - u, 3);
      el.textContent = ksh(Math.round((from + (to - from) * e) / 10) * 10);
      if (u < 1) requestAnimationFrame(step);
    })(t0);
  }
  function pulseSeat(id, delay) {
    var grid = byId('grid'), g = grid && grid.querySelector('[data-seat="' + id + '"]'), r = g && g.querySelectorAll('rect')[1];
    if (!r || still()) return;
    var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', +r.getAttribute('x') + 6); c.setAttribute('cy', +r.getAttribute('y') + 5); c.setAttribute('r', 8);
    c.setAttribute('class', 'pulse'); grid.appendChild(c);
    mv(r, [{ transform: 'scale(.5)' }, { transform: 'none' }], { duration: 340, delay: delay || 0, easing: POP });
    mv(c, [{ opacity: 1, transform: 'scale(.6)' }, { opacity: 0, transform: 'scale(2.3)' }], { duration: 520, delay: delay || 0, fill: 'both' })
      .then(function () { if (c.parentNode) c.parentNode.removeChild(c); });
  }
  function scrollRowIntoView(id) {
    var scr = cur(), row = scr && scr.querySelector('#row-' + id);
    if (!scr || !row) return;
    var r = row.getBoundingClientRect(), c = scr.getBoundingClientRect(), z = parseFloat(getComputedStyle(device).zoom) || 1;
    if (r.top < c.top + 60 || r.bottom > c.bottom - 90) scr.scrollTop += (r.top - c.top) / (z === 1 ? 1 : 1) - 220;
  }

  /* ---------- actions ---------- */
  function pickBlock(id, fromMap) {
    if (left(id) === 0) {
      S.soldTapped = id;
      S.block = id === 'Y3' ? 'Y2' : Object.keys(D.blocks).filter(function (x) { return left(x) > 0 && D.blocks[x].side === D.blocks[id].side; })[0] || S.block;
    } else { S.soldTapped = null; S.block = id; }
    S.picked = [];
    var before = {}, had = !!(cur() && cur().querySelector('.dock .cta:not([aria-disabled])'));
    if (cur()) cur().querySelectorAll('.list > [id^="row-"]').forEach(function (r) { before[r.id] = r.getBoundingClientRect().top; });
    render(true);
    if (fromMap) scrollRowIntoView(S.block);
    var k = zoomK();
    cur().querySelectorAll('.list > [id^="row-"]').forEach(function (r) {
      var dy = before[r.id] === undefined ? null : (before[r.id] - r.getBoundingClientRect().top) * k, on = r.classList.contains('on');
      if (dy === null) rise(r, 20, { duration: 300 });
      else if (Math.abs(dy) > 1 || on) mv(r, [{ transform: 'translateY(' + dy + 'px)' + (on ? ' scale(.95)' : '') }, { transform: 'none' }], { duration: on ? 460 : 380, easing: on ? POP : CAM });
    });
    if (!had) mv(cur().querySelector('.dock .cta'), [{ transform: 'scale(.94)' }, { transform: 'none' }], { duration: 380, easing: POP });
    if (!fromMap) turnTo(FACE[D.blocks[S.block].side.charAt(0)], null, 700);
  }
  function toggleSeat(s) {
    var i = S.picked.indexOf(s), price = D.blocks[S.block].price, was = S.picked.length;
    if (i >= 0) S.picked.splice(i, 1);
    else { if (S.picked.length >= S.qty) S.picked.shift(); S.picked.push(s); }
    render(true);
    if (i < 0) pulseSeat(s);
    countUp(cur().querySelector('.sum .ledger'), was * price, S.picked.length * price);
    mv(cur().querySelector('.view svg'), [{ opacity: .35 }, { opacity: 1 }], { duration: 320 });
    var el = cur().querySelector('[data-seat="' + s + '"]'); if (el) el.focus();
  }
  function startQueue() {
    S.ahead = D.queue.ahead; go('queue');
    clearInterval(qTimer);
    qTimer = setInterval(function () {
      S.ahead = Math.max(0, S.ahead - Math.round(60 + Math.random() * 90));
      var a = byId('q-ahead'), b = byId('q-bar'), m = byId('q-min');
      if (a) a.textContent = S.ahead.toLocaleString('en-US');
      if (b) b.style.width = Math.round((1 - S.ahead / D.queue.ahead) * 100) + '%';
      if (m) m.textContent = Math.max(1, Math.ceil(S.ahead / 560)) + ' min';
      if (S.ahead === 0) { clearInterval(qTimer); qTimer = null; if (S.screen === 'queue') { go('event'); toast('It\'s your turn. You have 5 minutes to pick seats.'); setTimeout(peek, 1100); } }
    }, 120);
  }
  function makeTickets() {
    var b = D.blocks[S.block];
    S.tickets = sortSeats(S.picked).map(function (s) { SEATS[S.block][s] = 'taken'; return { block: S.block, seat: s, status: 'mine', price: b.price, sentOnce: false, to: null }; });
    syncLeft(); cache = {};
    S.cur = 0; S.picked = []; S.hold = HOLD;
    go('ticket');
    toast('Paid. ' + ksh(S.tickets.length * b.price) + ' by M-Pesa. Your tickets also came by SMS.');
  }

  var ACT = {
    'go': function (el) { if (el.dataset.to === 'event' && S.screen === 'seats') { S.picked = []; } go(el.dataset.to); },
    'toast': function (el) { toast(el.dataset.msg); },
    'open-game': function () { if (S.busy) startQueue(); else { go('event'); setTimeout(peek, 1250); } },
    'tickets': function () { if (S.tickets.length) go('ticket'); else toast('No tickets yet. Open the featured game to buy some.'); },
    'rotate': function () { turnTo(S.th + Math.PI / 2, null, 650); },
    'pick-block': function (el) { pickBlock(el.dataset.id, false); },
    'qty-cycle': function () { S.qty = S.qty % 4 + 1; render(true); },
    'f-together': function () { S.fTogether = !S.fTogether; render(true); },
    'f-under': function () { S.fUnder = !S.fUnder; render(true); },
    'waitlist': function () { S.waitlist = !S.waitlist; render(true); toast(S.waitlist ? 'You\'re on the ' + (S.soldTapped || 'Y3') + ' waitlist. Resale seats go to it in order.' : 'You left the waitlist.'); },
    'go-seats': function () { if (!S.block) { toast('Tap a block on the map or in the list first.'); return; } S.picked = []; S.hold = HOLD; go('seats'); },
    'best': function () {
      var r = runs(S.block, S.qty)[0], was = S.picked.length * D.blocks[S.block].price;
      if (!r) { toast('No ' + S.qty + ' seats together in ' + bname(S.block) + '. Try fewer, or another block.'); return; }
      S.picked = r.seats.slice(); render(true);
      S.picked.forEach(function (id, n) { pulseSeat(id, n * 90); });
      countUp(cur().querySelector('.sum .ledger'), was, S.picked.length * D.blocks[S.block].price);
    },
    'qty': function (el) { S.qty = Math.min(4, Math.max(1, S.qty + (+el.dataset.d))); while (S.picked.length > S.qty) S.picked.shift(); render(true); if (+el.dataset.d > 0 && S.qty === 4) toast('Up to 4 tickets per phone number.'); },
    'pay': function () { if (S.picked.length !== S.qty) { toast('Pick ' + S.qty + ' seat' + (S.qty > 1 ? 's' : '') + ' first.'); return; } S.resend = 24; go('pay'); },
    'resend': function () { S.resend = 24; go('pay'); toast('New prompt sent to ' + D.phone + '.'); },
    'approve': function () { if (S.screen === 'pay') makeTickets(); },
    'timeout': function () { if (S.screen === 'pay') go('payfail'); },
    'cur': function (el) {
      var d = +el.dataset.i > S.cur ? 1 : -1; S.cur = +el.dataset.i; S.qrIn = 20; render(false);
      mv(cur().querySelector('.tk'), [{ opacity: 0, transform: 'translateX(' + (24 * d) + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: CAM });
      buildQr(cur().querySelectorAll('#qr .qt'), 80, 14);
    },
    'sheet': function (el) {
      var switching = !!S.sheet && S.sheet !== el.dataset.s;
      hideToast(); S.sheet = el.dataset.s; if (S.sheet === 'sell') S.sellPrice = Math.min(S.sellPrice, D.blocks[S.tickets[S.cur].block].price); render(true);
      if (switching) stagger(sheetEl.querySelectorAll('.sheet--float > :nth-child(n+3)'), function (e, t) { return rise(e, 12, { duration: 260, delay: t }); }, 0, 30, 8);
      var f = sheetEl.querySelector('[aria-selected="true"]'); if (f) f.focus();
    },
    'close-sheet': function () { closeSheet(function () { S.sheet = null; render(true); }); },
    'price': function (el) {
      var face = D.blocks[S.tickets[S.cur].block].price, d = +el.dataset.d, p = S.sellPrice + d, was = S.sellPrice / face * 100;
      if (p > face) { nudge(el, 'That\'s the most you can ask: what you paid.'); return; }
      if (p < 100) { nudge(el, ksh(100) + ' is the lowest you can list it for.'); return; }
      S.sellPrice = p; render(true);
      var now = S.sellPrice / face * 100;
      mv(sheetEl.querySelector('.slide__fill'), [{ width: was + '%' }, { width: now + '%' }], { duration: 240 });
      mv(sheetEl.querySelector('.slide__knob'), [{ left: was + '%' }, { left: now + '%' }], { duration: 240 });
      mv(sheetEl.querySelector('.price .ledger'), [{ opacity: 0, transform: 'translateY(' + (d > 0 ? 14 : -14) + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 240, easing: CAM });
    },
    'list': function () { var t = S.tickets[S.cur]; closeSheet(function () { t.status = 'listed'; t.price = S.sellPrice; S.sheet = null; render(true); flashRow(t); toast('Seat ' + t.seat + ' is listed for ' + ksh(t.price) + '.'); }); },
    'unlist': function () { var t = S.tickets[S.cur]; closeSheet(function () { t.status = 'mine'; S.sheet = null; render(true); flashRow(t); toast('Listing taken down. Seat ' + t.seat + ' is yours again.'); }); },
    'to': function (el) { S.sendTo = el.dataset.id; render(true); mv(sheetEl.querySelector('.contact.on'), [{ transform: 'scale(.97)' }, { transform: 'none' }], { duration: 300, easing: POP }); },
    'send': function () {
      if (!S.sendTo) return;
      var t = S.tickets[S.cur], c = D.contacts.filter(function (x) { return x.id === S.sendTo; })[0];
      closeSheet(function () { t.status = 'sent'; t.to = S.sendTo; t.sentOnce = true; S.sheet = null; S.sendTo = null; render(true); flashRow(t); toast('Sent to ' + c.name + '. They\'ll get an SMS link.'); });
    },
    'buyer': function () {
      var t = S.tickets.filter(function (x) { return x.status === 'listed'; })[0]; if (!t) return;
      dissolve(t, function () { t.status = 'sold'; }, 'Seat ' + t.seat + ' sold. ' + ksh(t.price) + ' sent to ' + D.phone + '.');
    },
    'accept': function () {
      var t = S.tickets.filter(function (x) { return x.status === 'sent'; })[0]; if (!t) return;
      dissolve(t, function () { t.status = 'accepted'; }, D.contacts.filter(function (c) { return c.id === t.to; })[0].short + ' accepted seat ' + t.seat + '. Your code for it no longer works.');
    },
    'jump': function (el) {
      var to = el.dataset.to;
      if (to === 'soldout') { S.view = 'fan'; S.soldTapped = 'Y3'; S.block = 'Y2'; S.picked = []; go('event'); scrollRowIntoView('Y2'); return; }
      if (to === 'ticket' && !S.tickets.length) { S.block = 'G2'; S.picked = ['C4', 'C5', 'C6']; S.qty = 3; makeTickets(); return; }
      S.view = 'fan'; go(to);
    },
    'scan': function () { S.st.i = (S.st.i + 1) % D.steward.length; if (S.st.i === 0) { S.st.count++; if (S.st.offline) S.st.pending++; } render(false); scanIn(); },
    'st': function (el) { S.st.i = +el.dataset.i; if (S.st.i === 0) { S.st.count++; if (S.st.offline) S.st.pending++; } render(false); scanIn(); }
  };
  function flashRow(t) {
    var li = cur() && cur().querySelectorAll('.seatlist li')[S.tickets.indexOf(t)];
    mv(li, [{ background: '#2E2A4D' }, { background: '#16142A' }], { duration: 700 });
  }
  // A ticket leaves you: its code breaks into tiles that fly off, then the "no longer works" state comes in
  function dissolve(t, apply, msg) {
    var showing = S.screen === 'ticket' && S.tickets[S.cur] === t && !S.sheet, tiles = showing && cur() ? cur().querySelectorAll('#qr .qt') : [];
    var after = function () { apply(); render(true); flashRow(t); if (showing) rise(cur().querySelector('.tk__gone'), 16, { duration: 360 }); toast(msg); };
    if (!tiles.length || still()) { after(); return; }
    Promise.all([].map.call(tiles, function (g) {
      var p = g.getAttribute('data-t').split(','), dx = (+p[0] - 2) * 16 + (Math.random() * 10 - 5), dy = (+p[1] - 2) * 16 - 30 - Math.random() * 20;
      return mv(g, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translate(' + dx + 'px,' + dy + 'px) scale(1.6) rotate(' + (Math.random() * 60 - 30) + 'deg)' }], { duration: 520, delay: (+p[0] + +p[1]) * 18, easing: IN, fill: 'forwards' });
    })).then(after);
  }
  function scanIn() { var vf = cur() && cur().querySelector('.vf__qr'); mv(vf, [{ opacity: 0, transform: 'scale(.7)' }, { opacity: .3, transform: 'none' }], { duration: 320, easing: POP }); }

  /* ---------- the 3D map: drag to turn and tilt, flick to spin, tap to pick ---------- */
  var FACE = { N: 0, S: Math.PI, W: Math.PI / 2, E: -Math.PI / 2 };   // camera angle that faces each stand
  var drag = null, suppress = false, spinRaf = 0, turnRaf = 0, drawPending = false;
  function clampTilt(v) { return Math.min(1.38, Math.max(0.5, v)); }
  function drawMap() { var svg = byId('map'); if (svg) svg.innerHTML = mapSvg(); }
  function drawSoon() { if (drawPending) return; drawPending = true; requestAnimationFrame(function () { drawPending = false; drawMap(); }); }
  function stopMotion() { cancelAnimationFrame(spinRaf); cancelAnimationFrame(turnRaf); }
  function turnTo(th, tilt, ms) {
    stopMotion();
    var th0 = S.th, ti0 = S.tilt, d = th - th0, t0 = performance.now(), dur = still() ? 0 : (ms || 600);
    d = ((d + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;              // the short way round
    if (Math.abs(d) < 0.01 && tilt == null) return;
    (function step(t) {
      var u = dur ? Math.min(1, (t - t0) / dur) : 1, e = u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      S.th = th0 + d * e; if (tilt != null) S.tilt = ti0 + (tilt - ti0) * e; drawMap();
      if (u < 1) turnRaf = requestAnimationFrame(step);
    })(t0);
  }
  function peek() {                                   // first visit: the arena turns a little on its own, so it reads as 3D
    if (S.dragged || S.screen !== 'event' || still()) return;
    stopMotion();
    var th0 = S.th, t0 = performance.now();
    (function step(t) {
      var u = Math.min(1, (t - t0) / 1500); S.th = th0 + 0.42 * Math.sin(Math.PI * u) * (1 - u * 0.3); drawMap();
      if (u < 1 && !drag && S.screen === 'event') turnRaf = requestAnimationFrame(step); else if (u >= 1) S.th = th0, drawMap();
    })(t0);
  }
  function hideHint() { var h = cur() && cur().querySelector('.map__hint'); if (h) mv(h, [{ opacity: 1 }, { opacity: 0 }], { duration: 240, fill: 'forwards' }); }
  document.addEventListener('mousedown', function (e) { if (e.target.closest && e.target.closest('#map')) e.preventDefault(); });   // a mouse drag shouldn't leave a focus ring; Tab still reaches the map
  document.addEventListener('pointerdown', function (e) {
    var svg = e.target.closest && e.target.closest('#map');
    suppress = false;
    if (!svg || e.button > 0) return;
    stopMotion();
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, th: S.th, tilt: S.tilt, moved: false, k: zoomK(), lx: e.clientX, lt: performance.now(), v: 0, svg: svg };
  });
  window.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = (e.clientX - drag.x) * drag.k, dy = (e.clientY - drag.y) * drag.k, now = performance.now();
    if (!drag.moved && Math.sqrt(dx * dx + dy * dy) < 5) return;
    if (!drag.moved) {
      drag.moved = true; drag.svg.classList.add('grabbing');
      try { drag.svg.setPointerCapture(e.pointerId); } catch (err) { /* not capturable: drag still works through window */ }
      if (!S.dragged) { S.dragged = true; hideHint(); }
    }
    drag.v = -0.011 * (e.clientX - drag.lx) * drag.k / Math.max(8, now - drag.lt) * 16; drag.lx = e.clientX; drag.lt = now;
    S.th = drag.th - dx * 0.011; S.tilt = clampTilt(drag.tilt + dy * 0.006);
    drawSoon();
  });
  function endDrag(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var d = drag; drag = null; d.svg.classList.remove('grabbing');
    if (!d.moved) return;
    suppress = true;                                  // the click that follows a drag is not a tap on a block
    var v = still() ? 0 : Math.max(-0.12, Math.min(0.12, d.v));
    if (Math.abs(v) < 0.003) return;
    (function spin() { v *= 0.93; S.th += v; drawMap(); if (Math.abs(v) > 0.0015) spinRaf = requestAnimationFrame(spin); })();
  }
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  document.addEventListener('click', function (e) {
    if (suppress && e.target.closest && e.target.closest('#map')) { suppress = false; return; }
    var seat = e.target.closest && e.target.closest('#grid [data-seat]');
    if (seat) { toggleSeat(seat.getAttribute('data-seat')); return; }
    var blk = e.target.closest && e.target.closest('#map [data-block]');
    if (blk) { pickBlock(blk.getAttribute('data-block'), true); return; }
    var v = e.target.closest && e.target.closest('[data-view]');
    if (v) { var to = v.getAttribute('data-view'); if (to !== S.view) swap('fade', function () { S.view = to; S.sheet = null; }); return; }
    if (e.target.closest && e.target.closest('[data-reset]')) { reset(); toast('Demo reset.'); return; }
    var el = e.target.closest && e.target.closest('[data-a]');
    if (!el || el.tagName === 'INPUT') return;
    if (el.getAttribute('aria-disabled') === 'true') { if (el.dataset.a === 'go-seats' || el.dataset.a === 'pay' || el.dataset.a === 'send' || el.dataset.a === 'price') ACT[el.dataset.a](el); return; }
    var f = ACT[el.dataset.a]; if (f) f(el);
  });
  document.addEventListener('change', function (e) {
    var a = e.target.getAttribute('data-a');
    if (a === 'busy') { S.busy = e.target.value === '1'; toast(S.busy ? 'Busy sale on. Open the featured game to join the queue.' : 'Normal day. No queue.'); }
    if (a === 'gates') { S.gatesOpen = e.target.checked; render(true); toast(S.gatesOpen ? 'Gates are open. Sending is closed.' : 'Gates closed again for the demo.'); }
    if (a === 'offline') { S.st.offline = e.target.checked; render(false); }
  });
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('#grid [data-seat]')) { e.preventDefault(); toggleSeat(e.target.getAttribute('data-seat')); }
    if (e.key === 'Escape' && S.sheet) closeSheet(function () { S.sheet = null; render(true); });
    if (e.target.id === 'map' && /^Arrow/.test(e.key)) {
      e.preventDefault(); if (!S.dragged) { S.dragged = true; hideHint(); }
      if (e.key === 'ArrowLeft') turnTo(S.th + Math.PI / 8, null, 280);
      if (e.key === 'ArrowRight') turnTo(S.th - Math.PI / 8, null, 280);
      if (e.key === 'ArrowUp') turnTo(S.th, clampTilt(S.tilt + 0.15), 220);
      if (e.key === 'ArrowDown') turnTo(S.th, clampTilt(S.tilt - 0.15), 220);
    }
  });

  /* ---------- clock ---------- */
  setInterval(function () {
    if (S.view !== 'fan') return;
    if (S.screen === 'seats' || S.screen === 'pay' || S.screen === 'payfail') {
      S.hold--; var h = byId('hold'); if (h) h.textContent = mmss(S.hold);
      if (S.hold <= 0) { S.picked = []; S.hold = HOLD; go('event'); toast('Your 5 minutes ran out, so the seats went back. Pick again.'); return; }
    }
    if (S.screen === 'pay' && S.resend > 0) { S.resend--; var r = byId('resend'); if (r) r.textContent = mmss(S.resend); if (S.resend === 0 && !TX) render(true); }
    if (S.screen === 'ticket') {
      S.qrIn--; if (S.qrIn <= 0) { S.qrIn = 20; S.qrSeed = (S.qrSeed * 7 + 3) % 9973; var q = byId('qr'); if (q) { q.innerHTML = qrSvg(S.qrSeed + S.cur * 13, '#14122B', '#F3F4FF'); buildQr(q.querySelectorAll('.qt'), 0, 22); } }
      var qi = byId('qr-in'); if (qi) qi.textContent = S.qrIn;
    }
  }, 1000);

  /* ---------- fit and start ---------- */
  function fit() {
    var bar = conceptBar.offsetHeight;
    document.documentElement.style.setProperty('--bar-h', bar + 'px');
    if (window.innerWidth <= 560) { device.style.removeProperty('--s'); return; }
    var s = Math.min(1, Math.max(0.62, (window.innerHeight - bar - 48) / 804));
    device.style.setProperty('--s', s.toFixed(3));
  }
  function reset() {
    hideToast(); clearInterval(qTimer); qTimer = null;
    var fresh_ = function () { cache = {}; buildSeats(); S = fresh(); };
    if (!S) { fresh_(); render(false); introHome(cur(), 120); return; }
    var kind = S.view === 'fan' && S.screen === 'home' ? 'fade' : 'home';
    closing = false; swap(kind, fresh_);
  }
  window.addEventListener('resize', fit);
  reset(); fit();
})();
