/* KenyaEMR waivers v3: a personal concept. Suggestions are scripted in data.js; nothing here calls a model. */
(function () {
  'use strict';
  var D = window.WAIVER_DATA;
  if (!D) return;

  /* ---------- Helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(n) { return Number(n).toLocaleString('en-US'); }
  function total(r) { return r.lines.reduce(function (a, l) { return a + l[1]; }, 0); }
  function toWaive(r) { return total(r) - (r.insurance || 0); }
  function masked(mrn) { return 'MFN-••• ' + mrn; }
  function byId(id) { return D.requests.filter(function (r) { return r.id === id; })[0]; }

  var ICON = {
    menu: '<svg width="20" height="20" viewBox="0 0 20 20" fill="#fff"><path d="M2 4h16v1.5H2zM2 9.25h16v1.5H2zM2 14.5h16V16H2z"/></svg>',
    search: '<svg width="20" height="20" viewBox="0 0 20 20" fill="#fff"><path d="M18 17l-4.3-4.3A6.5 6.5 0 1 0 12.6 13.8L17 18zM3.5 8.5a5 5 0 1 1 5 5 5 5 0 0 1-5-5z"/></svg>',
    userFollow: '<svg width="20" height="20" viewBox="0 0 20 20" fill="#fff"><path d="M8 2.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zM8 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM2 17v-1.5A4.5 4.5 0 0 1 6.5 11h3a4.5 4.5 0 0 1 4.5 4.5V17h-1.5v-1.5a3 3 0 0 0-3-3h-3a3 3 0 0 0-3 3V17zM16 6.5h1.5V9H20v1.5h-2.5V13H16v-2.5h-2.5V9H16z"/></svg>',
    user: '<svg width="20" height="20" viewBox="0 0 20 20" fill="#fff"><path d="M10 2a8 8 0 1 0 8 8 8 8 0 0 0-8-8zm-4 13.1V14a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.1a6.5 6.5 0 0 1-8 0zm9.4-1.2A3.5 3.5 0 0 0 12 10.5H8a3.5 3.5 0 0 0-3.4 3.4 6.5 6.5 0 1 1 10.8 0zM10 4.5a3 3 0 1 0 3 3 3 3 0 0 0-3-3zm0 4.5A1.5 1.5 0 1 1 11.5 7.5 1.5 1.5 0 0 1 10 9z"/></svg>',
    switcher: '<svg width="20" height="20" viewBox="0 0 20 20" fill="#fff"><path d="M3 3h2v2H3zm6 0h2v2H9zm6 0h2v2h-2zM3 9h2v2H3zm6 0h2v2H9zm6 0h2v2h-2zM3 15h2v2H3zm6 0h2v2H9zm6 0h2v2h-2z"/></svg>',
    arrow: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M9.3 3.3l-.7.7 3.5 3.5H2v1h10.1l-3.5 3.5.7.7L14 8z"/></svg>',
    time: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 1a7 7 0 1 0 7 7 7 7 0 0 0-7-7zm0 13a6 6 0 1 1 6-6 6 6 0 0 1-6 6z"/><path d="M10.6 11.3L7.5 8.2V3h1v4.8l2.8 2.8z"/></svg>',
    renew: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M12 10h2.4A6.5 6.5 0 0 1 2 8H1a7.5 7.5 0 0 0 13.5 4.5V15h1v-6H12zM4 6H1.6A6.5 6.5 0 0 1 14 8h1A7.5 7.5 0 0 0 1.5 3.5V1h-1v6H4z"/></svg>',
    undo: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M10 6H3.9l2.6-2.6L5.8 2.7 2 6.5l3.8 3.8.7-.7L3.9 7H10a3 3 0 0 1 0 6H8v1h2a4 4 0 0 0 0-8z"/></svg>',
    close: '<svg width="16" height="16" viewBox="0 0 16 16" fill="#161616"><path d="M12 4.7L11.3 4 8 7.3 4.7 4 4 4.7 7.3 8 4 11.3l.7.7L8 8.7l3.3 3.3.7-.7L8.7 8z"/></svg>',
    eligible: '<svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8.5" fill="#24A148"/><path d="M8.6 13.4l-3.2-3.2 1-1 2.2 2.2 4.8-4.8 1 1z" fill="#fff"/></svg>',
    not: '<svg width="20" height="20" viewBox="0 0 20 20" fill="#6F6F6F"><path d="M10 1.25A8.75 8.75 0 1 0 18.75 10 8.75 8.75 0 0 0 10 1.25zm0 16A7.25 7.25 0 1 1 17.25 10 7.26 7.26 0 0 1 10 17.25z"/><path d="M13.5 7.56L12.44 6.5 10 8.94 7.56 6.5 6.5 7.56 8.94 10 6.5 12.44l1.06 1.06L10 11.06l2.44 2.44 1.06-1.06L11.06 10z"/></svg>',
    unsure: '<svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8.5" fill="#F1C21B"/><path d="M10 14.9a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm.75-3.8h-1.5V9.6c0-.8.6-1.2 1.1-1.5s.8-.5.8-1A1.2 1.2 0 0 0 10 5.9 1.3 1.3 0 0 0 8.7 7.2H7.2A2.8 2.8 0 0 1 10 4.4a2.6 2.6 0 0 1 2.7 2.6 2.4 2.4 0 0 1-1.4 2.2c-.4.2-.6.4-.6.6z" fill="#161616"/></svg>',
    info: '<svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8.5" fill="#0043CE"/><path d="M9.25 8.5h1.5V15h-1.5zM10 5a1 1 0 1 1-1 1 1 1 0 0 1 1-1z" fill="#fff"/></svg>',
    warning: '<svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8.5" fill="#F1C21B"/><path d="M9.25 5h1.5v6h-1.5zM10 12.75a1 1 0 1 1-1 1 1 1 0 0 1 1-1z" fill="#161616"/></svg>',
    success: '<svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8.5" fill="#24A148"/><path d="M8.6 13.4l-3.2-3.2 1-1 2.2 2.2 4.8-4.8 1 1z" fill="#fff"/></svg>',
    billing: '<svg width="16" height="16" viewBox="0 0 16 16" fill="#161616"><path d="M13 1H3a1 1 0 0 0-1 1v13l2-1.5 2 1.5 2-1.5 2 1.5 2-1.5 2 1.5V2a1 1 0 0 0-1-1zm0 12l-1-.75-2 1.5-2-1.5-2 1.5-2-1.5-1 .75V2h10zM5 4h6v1H5zm0 3h6v1H5zm0 3h4v1H5z"/></svg>',
    chevronUp: '<svg width="16" height="16" viewBox="0 0 16 16" fill="#161616"><path d="M8 5l5 5-.7.7L8 6.4l-4.3 4.3L3 10z"/></svg>',
    chevronDown: '<svg width="16" height="16" viewBox="0 0 16 16" fill="#161616"><path d="M8 11L3 6l.7-.7L8 9.6l4.3-4.3.7.7z"/></svg>',
    clock: '<svg width="20" height="20" viewBox="0 0 16 16" fill="#525252"><path d="M8 1a7 7 0 1 0 7 7 7 7 0 0 0-7-7zm0 13a6 6 0 1 1 6-6 6 6 0 0 1-6 6z"/><path d="M10.6 11.3L7.5 8.2V3h1v4.8l2.8 2.8z"/></svg>',
    picto: '<svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true"><g fill="#9EC9C2"><ellipse cx="30" cy="12" rx="11" ry="4"/><path d="M19 12v14c0 2.2 4.9 4 11 4s11-1.8 11-4V12c0 2.2-4.9 4-11 4s-11-1.8-11-4z"/></g><g fill="#005D5D" opacity=".75"><path d="M19 17c0 2.2 4.9 4 11 4s11-1.8 11-4M19 22c0 2.2 4.9 4 11 4s11-1.8 11-4" stroke="#005D5D" stroke-width="1" fill="none"/></g><g fill="#4FA79A"><ellipse cx="17" cy="24" rx="11" ry="4"/><path d="M6 24v12c0 2.2 4.9 4 11 4s11-1.8 11-4V24c0 2.2-4.9 4-11 4s-11-1.8-11-4z"/></g><path d="M6 29c0 2.2 4.9 4 11 4s11-1.8 11-4M6 34c0 2.2 4.9 4 11 4s11-1.8 11-4" stroke="#fff" stroke-width="1" fill="none"/></svg>'
  };
  function fillIcon(name, color) { return ICON[name].replace('<svg ', '<svg fill="' + color + '" '); }

  var ANSWER = {
    eligible: { label: 'Likely eligible', tag: 'green' },
    not: { label: 'Likely not eligible', tag: 'gray' },
    unsure: { label: 'Can’t tell', tag: 'orange' }
  };
  var STATUS = {
    'new': ['New', 'blue'], hold: ['On hold', 'gray'], waiting: ['Waiting for second approver', 'purple'],
    approved: ['Approved', 'green'], confirmed: ['Approved', 'green'], declined: ['Declined', 'outline'], sentback: ['Sent back', 'orange']
  };
  function tag(text, colour) { return '<span class="tag tag--' + colour + '">' + esc(text) + '</span>'; }
  function note(kind, title, msg) {
    return '<div class="note note--' + kind + '" role="' + (kind === 'warning' ? 'alert' : 'note') + '">' + ICON[kind === 'warning' ? 'warning' : kind === 'success' ? 'success' : 'info'] +
      '<div><p class="note__title">' + esc(title) + '</p><p class="note__msg">' + esc(msg) + '</p></div></div>';
  }

  /* ---------- State ---------- */
  var S, undoTimer = null, lastFocus = null;
  function initState() {
    var p = D.startClock.split(':');
    S = {
      view: 'approver', page: 'requests', selected: 'juma', panel: null, modal: null, filter: 'all', expanded: false, ord: 0,
      minutes: (+p[0]) * 60 + (+p[1]), seq: 0, latest: null, req: {},
      log: D.history.map(function (h, i) { return Object.assign({ key: 'h' + i, today: false }, h); })
    };
    D.requests.forEach(function (r) {
      S.req[r.id] = { status: 'new', undoUntil: 0, at: null, holdAt: null, first: null, sentBack: null, logKey: null, order: 0,
        missing: { ins: { state: 'idle', detail: null }, sw: { state: 'idle', detail: null } } };
    });
  }
  function clock() { var h = Math.floor(S.minutes / 60), m = S.minutes % 60; return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; }
  function tick() { var t = clock(); S.minutes++; return t; }
  function disagree(ai, decision) { return (ai === 'eligible' && decision === 'declined') || (ai === 'not' && (decision === 'approved' || decision === 'waiting')); }
  function isFinal(st) { return st.status === 'approved' || st.status === 'declined' || st.status === 'confirmed'; }
  function isPending(st) { return S.view === 'second' ? st.status === 'waiting' : (st.status === 'new' || st.status === 'sentback' || st.status === 'hold'); }
  function logEntry(st) { return S.log.filter(function (l) { return l.key === st.logKey; })[0]; }
  function ruleOf(r) { return (r.ai.sub.match(/rule (W\d)/) || [])[1] || ''; }
  function against(r, st) { return r.ai.answer === 'unsure' || disagree(r.ai.answer, st.status === 'declined' ? 'declined' : 'approved'); }
  function nextWaiting(id) {
    var list = D.requests, i = list.indexOf(byId(id));
    for (var k = 1; k < list.length; k++) {
      var r = list[(i + k) % list.length], s = S.req[r.id].status;
      if (S.view === 'second' ? s === 'waiting' : (s === 'new' || s === 'sentback')) return r;
    }
    return null;
  }

  /* ---------- Render: shell ---------- */
  function renderNav() {
    var waiting = D.requests.filter(function (r) { var s = S.req[r.id].status; return s === 'new' || s === 'sentback'; }).length;
    var items = [
      ['Overview', null], ['Payment desk', null], ['Waiver requests', 'requests'], ['Audit trail', 'audit'], ['Bill history', null], ['Payment points', null]
    ];
    var html = '<div class="nav-group">' + ICON.billing + '<span>Billing Module</span>' + ICON.chevronUp + '</div>';
    items.forEach(function (it) {
      var disabled = !it[1] || (S.view === 'auditor' && it[1] === 'requests');
      var current = it[1] === S.page;
      html += '<button type="button" class="nav-item" ' + (disabled ? 'disabled title="Not part of this concept"' : 'data-action="page" data-page="' + it[1] + '"') + (current ? ' aria-current="page"' : '') + '><span>' + esc(it[0]) + '</span>' +
        (it[1] === 'requests' && S.view === 'approver' ? '<span class="nav-count">' + waiting + '</span>' : '') + '</button>';
    });
    $('#nav').innerHTML = html;
  }

  function pageHead(title) {
    return '<header class="page-head">' + ICON.picto + '<div><span class="page-head__over">' + esc(D.facility.name) + '</span><h1>' + esc(title) + '</h1></div></header>';
  }

  function render() {
    renderNav();
    var body = $('#body');
    var docked = S.page === 'requests' && S.panel !== null;
    body.classList.toggle('has-panel', docked);
    $('#panel').hidden = !docked;
    if (!docked) $('#panel').innerHTML = '';
    if (S.page === 'audit') { $('#main').innerHTML = pageHead('Audit trail') + renderAudit(); }
    else { $('#main').innerHTML = pageHead('Waiver requests') + '<div class="content' + (docked ? ' is-docked' : '') + '">' + renderQueue() + renderDetail() + '</div>'; }
    if (docked) renderPanel();
    document.querySelectorAll('.concept__view button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-view') === S.view ? 'true' : 'false'); });
  }

  /* ---------- Queue ---------- */
  function queueItems() {
    if (S.view === 'second') return D.requests.filter(function (r) { var s = S.req[r.id].status; return s === 'waiting' || s === 'confirmed' || s === 'sentback'; });
    return D.requests.slice();
  }
  function renderQueue() {
    var items = queueItems();
    var title, duty;
    if (S.view === 'second') {
      var n = items.filter(function (r) { return S.req[r.id].status === 'waiting'; }).length;
      title = 'Waiting for you · ' + n;
      duty = 'Second approver on duty: ' + D.people.second.name + ', ' + D.people.second.title;
    } else {
      var w = items.filter(function (r) { var s = S.req[r.id].status; return s === 'new' || s === 'sentback'; }).length;
      var h = items.filter(function (r) { return S.req[r.id].status === 'hold'; }).length;
      title = 'Waiting · ' + w + (h ? ' · On hold · ' + h : '');
      duty = 'Waiver approver on duty: ' + D.people.approver.name + ', ' + D.people.approver.title;
    }
    function row(r) {
      var st = S.req[r.id];
      var a = ANSWER[r.ai.answer];
      var stat = S.view === 'second' && st.status === 'waiting' ? ['Waiting for you', 'purple'] : STATUS[st.status];
      var meta = S.view === 'second' && st.first ? r.visit + ' · approved by ' + D.people.approver.name + ' ' + st.first.at : r.visit + ' · asked ' + r.asked;
      return '<li><button type="button" class="q-row" data-action="select" data-id="' + r.id + '"' + (S.selected === r.id ? ' aria-current="true"' : '') + '>' +
        '<span class="q-row__top"><span>' + esc(r.name) + '</span><span>KSh ' + fmt(toWaive(r)) + '</span></span>' +
        '<span class="q-row__meta">' + esc(meta) + '</span>' +
        '<span class="q-row__tags">' + tag(a.label, a.tag) + tag(stat[0], stat[1]) + (r.ai.flag ? tag('Earlier-visit source', 'orange') : '') + '</span></button></li>';
    }
    var pending = items.filter(function (r) { return isPending(S.req[r.id]); });
    var done = items.filter(function (r) { return !isPending(S.req[r.id]); }).sort(function (x, y) { return S.req[y.id].order - S.req[x.id].order; });
    return '<section class="queue" aria-label="Requests"><div class="queue__head"><h2 class="queue__title">' + esc(title) + '</h2><p class="queue__duty">' + esc(duty) + '</p></div><div class="queue__lists">' +
      (pending.length ? '<ul class="queue__list">' + pending.map(row).join('') + '</ul>' : '<p class="queue__empty">Nothing is waiting for you.</p>') +
      (done.length ? '<h3 class="queue__group">Done today · ' + done.length + '</h3><ul class="queue__list">' + done.map(row).join('') + '</ul>' : '') + '</div></section>';
  }

  /* ---------- Detail ---------- */
  function renderDetail() {
    var r = byId(S.selected);
    if (!r || queueItems().indexOf(r) < 0) {
      return '<section class="detail" aria-label="Request"><p class="queue__empty">Pick a request from the list.</p></section>';
    }
    var st = S.req[r.id];
    var stat = STATUS[st.status];
    var html = '<section class="detail" aria-label="Request for ' + esc(r.name) + '">' +
      '<div class="detail__head"><h2 class="detail__who">' + esc(r.name) + ' <span>· ' + esc(r.sex) + ' · ' + esc(r.age) + ' · ' + esc(r.mrn) + '</span></h2>' + tag(stat[0], stat[1]) + '</div>' +
      '<dl class="visit"><div><dt>Visit type</dt><dd>' + esc(r.visit) + '</dd></div><div><dt>Reason</dt><dd>' + esc(r.reason) + '</dd></div>' +
      '<div><dt>Asked by</dt><dd>Achieng, Payment desk 2 · ' + esc(r.asked) + '</dd></div><div><dt>Note</dt><dd>' + esc(r.note) + '</dd></div></dl>';
    if (isFinal(st)) html += '<div class="detail__notice detail__outcome" tabindex="-1">' + outcomeNote(r, st) + '</div>';
    if (st.first && !isFinal(st) && (S.view === 'second' || st.status === 'waiting')) {
      html += '<div class="detail__notice">' + note('warning', 'Approved against the suggestion by ' + D.people.approver.name + ', ' + st.first.at,
        'Reason: ' + st.first.reason.toLowerCase() + '.' + (st.first.note ? ' “' + st.first.note + '”' : '')) + '</div>';
    }
    if (st.sentBack && st.status === 'sentback') {
      html += '<div class="detail__notice">' + note('info', 'Sent back by ' + D.people.second.name + ', ' + st.sentBack, 'Check the reason and decide again.') + '</div>';
    }
    html += '<div class="work">' + (isFinal(st) ? '<div class="work__col">' + renderNext(r, st) + renderCard(r) + '</div>' : renderCard(r)) + renderBill(r) + '</div>' + renderBar(r) + '</section>';
    return html;
  }

  function outcomeNote(r, st) {
    var e = logEntry(st), amt = 'KSh ' + fmt(toWaive(r)), A = D.people.approver.name;
    var why = e && e.reason ? 'Reason: ' + e.reason.toLowerCase() + '.' + (e.note ? ' “' + e.note.replace(/[.!?]+$/, '') + '.”' : '') : '';
    if (st.status === 'declined') return note('info', 'Waiver declined by ' + A + ', ' + st.at, (against(r, st) ? why : 'In line with the AI suggestion.') + ' Payment desk 2 has been told.');
    if (st.status === 'confirmed') return note('success', amt + ' waived · confirmed by ' + D.people.second.name + ', ' + st.confirmedAt,
      'Approved by ' + A + ', ' + st.first.at + ': ' + st.first.reason.toLowerCase() + '. The bill is closed and Payment desk 2 has been told.');
    return note('success', amt + ' waived · approved by ' + A + ', ' + st.at, (against(r, st) ? 'Against the AI suggestion. ' + why : 'In line with the AI suggestion.') + ' The bill is closed and Payment desk 2 has been told.');
  }

  function renderNext(r, st) {
    var e = logEntry(st), A = D.people.approver.name, mine = S.view !== 'second';
    var at = st.status === 'confirmed' ? st.confirmedAt : st.at, rule = ruleOf(r), off = against(r, st);
    var steps = [];
    if (st.status === 'declined') {
      steps.push(['done', 'Payment desk 2 told · ' + at, off ? 'Achieng has your reason, so she can explain it to ' + r.payer + '.' : 'Achieng can tell ' + r.payer + ' at the desk.']);
      steps.push(['wait', r.payer + ' pays KSh ' + fmt(toWaive(r)) + ', or asks again', r.askAgain]);
    } else {
      steps.push(['done', 'Payment desk 2 told · ' + at, 'Achieng sees the bill as waived. ' + r.payer + ' doesn’t pay.']);
      var basis = !off && rule ? 'Waived under rule ' + rule : 'Waived · ' + (e && e.reason ? e.reason.toLowerCase() : 'no rule');
      steps.push(['done', 'The receipt shows the waiver', basis + ' · ' + A + ', ' + (st.first ? st.first.at : st.at) + (st.status === 'confirmed' ? ' · confirmed by ' + D.people.second.name : '')]);
    }
    if (off) steps.push(['wait', 'Goes to the monthly rules review', (r.ai.answer === 'unsure' ? 'The AI couldn’t suggest' : (mine ? 'You' : A) + ' disagreed with the AI') + ', so whoever owns the rules sees ' + (mine ? 'your' : 'her') + ' reason.']);
    else steps.push(['done', 'Added to the audit trail', 'With the AI’s suggestion, ' + (mine ? 'your' : 'the') + ' decision and rules ' + D.facility.rulesVersion]);
    return '<section class="next" aria-label="What happens next"><h3 class="card__section">What happens next</h3><ol class="next__list">' +
      steps.map(function (s) {
        return '<li class="next__step">' + (s[0] === 'done' ? ICON.success : ICON.clock) + '<div><p class="next__title"><span class="vh">' + (s[0] === 'done' ? 'Done: ' : 'Next: ') + '</span>' + esc(s[1]) + '</p><p class="next__sub">' + esc(s[2]) + '</p></div></li>';
      }).join('') + '</ol></section>';
  }

  function agreeText(r, st) {
    if (r.ai.answer === 'unsure') return 'The AI couldn’t suggest.';
    var who = S.view === 'second' ? D.people.approver.name : 'You';
    return who + (against(r, st) ? ' disagreed.' : ' agreed.');
  }

  function renderCard(r) {
    var ai = r.ai, st = S.req[r.id], a = ANSWER[ai.answer];
    var html = '<article class="card card--' + ai.answer + '" aria-label="AI suggestion">' +
      '<div class="card__label"><span>AI suggestion</span><span>Reads Mfano rules ' + D.facility.rulesVersion + ' only</span></div>' +
      '<div class="card__answer"><p class="card__answer-row">' + ICON[ai.answer] + '<span>' + a.label + '</span></p><p class="card__sub">' + esc(ai.sub) + '</p>' +
      (ai.flag ? '<span class="card__flag">' + tag(ai.flag, 'orange') + '</span>' : '') + '</div>';
    var final = isFinal(st);
    if (final) {
      var n = (ai.reasons || []).length + (ai.missing || []).length;
      html += '<div class="card__agree"><p>' + esc(agreeText(r, st)) + '</p><button type="button" class="link" data-action="toggle-reasons" aria-expanded="' + S.expanded + '">' +
        (S.expanded ? 'Hide the reasons' + ICON.chevronUp : 'Show the ' + n + ' reasons' + ICON.chevronDown) + '</button></div>';
      if (!S.expanded) return html + '</article>';
    }
    html += '<hr><h3 class="card__section">' + esc(ai.section) + '</h3><ol class="reasons">';
    if (ai.reasons) {
      ai.reasons.forEach(function (re, i) {
        html += '<li class="reason' + (S.panel === i ? ' is-open' : '') + '"><p class="reason__text"><span>' + esc(re.text) + '</span></p>' +
          '<div class="reason__src"><button type="button" class="link" data-action="source" data-index="' + i + '" aria-expanded="' + (S.panel === i) + '">' + esc(re.src) + ICON.arrow.replace('<svg ', '<svg fill="currentColor" ') + '</button>' +
          (re.earlier ? tag('Earlier visit', 'orange') : '') + '</div></li>';
      });
    }
    if (ai.missing) {
      ai.missing.forEach(function (m) {
        var ms = st.missing[m.id];
        var detail = ms.detail || m.detail;
        var btn;
        if (m.id === 'ins') btn = '<button type="button" class="link" data-action="retry" data-id="' + r.id + '"' + (ms.state === 'busy' ? ' disabled' : '') + '>' + (ms.state === 'busy' ? 'Checking…' : esc(m.action)) + ICON.renew.replace('<svg ', '<svg fill="currentColor" ') + '</button>';
        else btn = '<button type="button" class="link" data-action="request" data-id="' + r.id + '"' + (ms.state === 'done' ? ' disabled' : '') + '>' + (ms.state === 'done' ? 'Assessment requested' : esc(m.action)) + ICON.arrow.replace('<svg ', '<svg fill="currentColor" ') + '</button>';
        html += '<li class="reason"><p class="reason__text"><span>' + esc(m.text) + '</span></p><p class="reason__detail">' + esc(detail) + '</p><div class="reason__src">' + btn + '</div></li>';
      });
    }
    html += '</ol>';
    if (ai.notice) html += note(ai.notice[0], ai.notice[1], ai.notice[2]);
    if (!final) html += '<p class="card__foot">' + (ai.answer === 'unsure' ? 'You decide. Approving without the missing information asks for a reason.' : 'You decide. Going against the suggestion asks for a reason.') + '</p>';
    html += '</article>';
    return html;
  }

  function renderBill(r) {
    var ins = r.insurance === null ? 'No answer' : r.insurance ? '−' + fmt(r.insurance) + ' KSH' : '0 KSH';
    var st = S.req[r.id], final = isFinal(st), paid = st.status === 'approved' || st.status === 'confirmed', rule = ruleOf(r);
    var waivedRow = final && paid ? '<div><dt>Waived' + (!against(r, st) && rule ? ' · rule ' + rule : '') + '</dt><dd>−' + fmt(toWaive(r)) + ' KSH</dd></div>' : '';
    return '<section class="bill" aria-label="Bill"><div class="bill__head"><h3>Bill</h3>' + (final ? tag(paid ? 'Bill closed' : 'Bill open', 'gray') : '') + '</div><p class="bill__sub">' + esc(r.billSub) + '</p><ul class="bill__lines">' +
      r.lines.map(function (l) { return '<li><span>' + esc(l[0]) + '</span><span>' + fmt(l[1]) + '</span></li>'; }).join('') + '</ul>' +
      '<dl class="totals"><div><dt>Bill total</dt><dd>' + fmt(total(r)) + ' KSH</dd></div><div><dt>National insurance</dt><dd>' + ins + '</dd></div>' + waivedRow + '<hr>' +
      '<div class="due"><dt>' + (final ? 'To pay' : 'To waive') + '</dt><dd>' + (final && paid ? '0' : fmt(toWaive(r))) + '<small>KSH</small></dd></div></dl></section>';
  }

  function renderBar(r) {
    var st = S.req[r.id], amt = 'KSh ' + fmt(toWaive(r));
    var prompt = '', ghost = '', buttons = '';
    if (S.view === 'second') {
      if (st.status === 'waiting') {
        prompt = 'Confirm waiving ' + amt + ' for ' + r.name + '?';
        buttons = '<button type="button" class="btn btn--secondary btn--xl" data-action="sendback" data-id="' + r.id + '">Send back</button><button type="button" class="btn btn--primary btn--xl" data-action="confirm" data-id="' + r.id + '">Confirm waiver</button>';
      } else if (st.status === 'confirmed') { prompt = 'Logged to the audit trail at ' + st.confirmedAt; buttons = nextButton(r); if (!buttons) prompt += ' · nothing else is waiting'; }
      else prompt = 'Sent back to ' + D.people.approver.name + ', ' + st.sentBack;
    } else if (S.view === 'auditor') {
      prompt = 'Read-only for the auditor.';
    } else if (st.status === 'new' || st.status === 'hold' || st.status === 'sentback') {
      prompt = st.status === 'hold' ? 'On hold since ' + st.holdAt : 'Waive ' + amt + ' for ' + r.name + '?';
      ghost = st.status === 'hold'
        ? '<button type="button" class="btn btn--ghost" data-action="unhold" data-id="' + r.id + '">Take off hold' + ICON.time + '</button>'
        : '<button type="button" class="btn btn--ghost" data-action="hold" data-id="' + r.id + '">Hold' + ICON.time + '</button>';
      buttons = '<button type="button" class="btn btn--secondary btn--xl" data-action="decide" data-decision="declined" data-id="' + r.id + '">Decline waiver</button>' +
        '<button type="button" class="btn btn--primary btn--xl" data-action="decide" data-decision="approved" data-id="' + r.id + '">Approve waiver</button>';
    } else if (st.status === 'approved' || st.status === 'declined') {
      var open = Date.now() < st.undoUntil;
      prompt = open ? 'You can undo this for 5 seconds' : 'Logged to the audit trail at ' + st.at;
      if (open) ghost = '<button type="button" class="btn btn--ghost" data-action="undo" data-id="' + r.id + '">Undo' + ICON.undo + '</button>';
      buttons = nextButton(r);
      if (!buttons && !open) prompt += ' · nothing else is waiting';
    } else if (st.status === 'waiting') {
      prompt = 'Sent to ' + D.people.second.name + ', ' + st.at + ' · waiting for the second approval';
    } else if (st.status === 'confirmed') {
      prompt = 'Confirmed by ' + D.people.second.name + ', ' + st.confirmedAt + ' · logged to the audit trail';
      buttons = nextButton(r);
    }
    return '<div class="bar"><div class="bar__prompt"><p>' + esc(prompt) + '</p>' + ghost + '</div>' + buttons + '</div>';
  }

  function nextButton(r) {
    var n = nextWaiting(r.id);
    return n ? '<button type="button" class="btn btn--primary btn--xl btn--next" data-action="select" data-id="' + n.id + '">Next request: ' + esc(n.name) + ICON.arrow.replace('<svg ', '<svg fill="currentColor" ') + '</button>' : '';
  }

  /* ---------- Source panel ---------- */
  function renderPanel() {
    var r = byId(S.selected), re = r && r.ai.reasons ? r.ai.reasons[S.panel] : null;
    if (!re) { S.panel = null; return; }
    var p = re.panel;
    var html = '<div class="panel__head"><h2 id="panel-title">Source · ' + esc(p.title) + '</h2><button type="button" class="panel__close" data-action="close-panel" aria-label="Close source">' + ICON.close + '</button></div><div class="panel__body">';
    if (p.earlier) html += '<p class="panel__flag">' + tag('Earlier visit', 'orange') + '<span>' + esc(p.earlier) + '</span></p>';
    html += '<div class="panel__record">' + (p.label ? '<p class="label">' + esc(p.label) + '</p>' : '') +
      (p.quote ? '<p class="quote">' + esc(p.quote) + '</p>' : '') +
      (p.lines ? '<ul>' + p.lines.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>' : '') +
      '<p class="meta">' + esc(p.meta) + '</p></div>';
    if (p.warn) html += note('warning', p.warn[0], p.warn[1]);
    if (p.today) html += '<div class="panel__today"><h3>' + esc(p.today[0]) + '</h3><p>' + esc(p.today[1]) + '</p></div>';
    html += '</div><div class="panel__foot"><button type="button" class="btn btn--secondary" data-action="close-panel"' + (p.shortcut ? '' : ' style="grid-column: 1 / -1"') + '>Close</button>';
    var st = S.req[r.id];
    if (p.shortcut && S.view === 'approver' && (st.status === 'new' || st.status === 'hold' || st.status === 'sentback')) {
      html += '<button type="button" class="btn btn--primary" data-action="decide" data-decision="declined" data-preset="' + esc(p.shortcut) + '" data-id="' + r.id + '">Decline: ' + esc(p.shortcut.toLowerCase()) + '</button>';
    }
    html += '</div>';
    $('#panel').innerHTML = html;
  }

  /* ---------- Reason sheet ---------- */
  function openModal(id, decision, preset) {
    var r = byId(id), ai = r.ai.answer, amt = toWaive(r);
    var routes = decision === 'approved' && amt > D.facility.secondApprovalOver;
    var list = D.reasons[decision === 'approved' ? 'approve' : 'decline'];
    var title, desc;
    if (ai === 'unsure') { title = decision === 'approved' ? 'Approve without a suggestion' : 'Decline without a suggestion'; desc = 'The AI couldn’t suggest. Say why you’re deciding now. Your reason goes to the monthly review.'; }
    else if (decision === 'declined') { title = 'Decline the waiver'; desc = 'The AI suggested “Likely eligible”. Say why you disagree. Your reason goes to the monthly review.'; }
    else { title = 'Approve against the suggestion'; desc = 'The AI suggested “Likely not eligible”. Say why you’re approving. Your reason goes to the monthly review.'; }
    var primary = decision === 'declined' ? 'Decline waiver' : routes ? 'Approve and send to ' + D.people.second.name : 'Approve waiver';
    var html = '<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-title"><div class="dialog__head"><div><p class="dialog__label">' + esc(r.name) + ' · KSh ' + fmt(amt) + '</p><h2 class="dialog__title" id="dlg-title">' + esc(title) + '</h2></div>' +
      '<button type="button" class="dialog__close" data-action="close-modal" aria-label="Close">' + ICON.close + '</button></div>' +
      '<form class="dialog__body" id="reason-form" novalidate><p class="dialog__desc">' + esc(desc) + '</p><fieldset><legend>Reason</legend>' +
      list.map(function (l, i) { return '<label class="radio"><input type="radio" name="reason" value="' + esc(l) + '"' + (l === preset ? ' checked' : '') + '>' + esc(l) + '</label>'; }).join('') +
      '</fieldset><label class="field">Note (optional unless you pick Other)<textarea name="note" rows="4"></textarea></label>' +
      (routes ? note('info', 'This goes to ' + D.people.second.name, 'Waivers over KSh ' + fmt(D.facility.secondApprovalOver) + ' need a second approver at Mfano. He’ll see your reason.') : '') +
      '<p class="dialog__error" id="reason-error" hidden></p></form>' +
      '<div class="dialog__foot"><button type="button" class="btn btn--secondary" data-action="close-modal">Cancel</button><button type="submit" form="reason-form" class="btn btn--primary">' + esc(primary) + '</button></div></div>';
    S.modal = { id: id, decision: decision };
    lastFocus = document.activeElement;
    var m = $('#modal'); m.innerHTML = html; m.hidden = false;
    var first = m.querySelector('input[checked]') || m.querySelector('input');
    if (first) first.focus();
    $('#reason-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var f = ev.target, reason = f.reason.value, noteText = f.note.value.trim(), err = $('#reason-error');
      if (!reason) { err.textContent = 'Pick a reason first.'; err.hidden = false; return; }
      if (reason === 'Other' && !noteText) { err.textContent = 'Say what in the note.'; err.hidden = false; f.note.focus(); return; }
      closeModal();
      decide(id, decision, reason, noteText);
    });
    m.querySelectorAll('input, textarea').forEach(function (el) { el.addEventListener('input', function () { $('#reason-error').hidden = true; }); });
  }
  function closeModal() {
    S.modal = null; var m = $('#modal'); m.hidden = true; m.innerHTML = '';
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  /* ---------- Actions ---------- */
  function toast(kind, title, msg) {
    var t = document.createElement('div');
    t.className = 'toast'; if (kind === 'info') t.style.borderLeftColor = '#0043CE';
    t.innerHTML = ICON[kind === 'info' ? 'info' : 'success'] + '<div><p class="toast__title">' + esc(title) + '</p><p>' + esc(msg) + '</p></div>';
    var box = $('#toast');
    box.appendChild(t);
    while (box.children.length > 2) box.removeChild(box.firstChild);
    setTimeout(function () { t.remove(); }, 5000);
  }
  function scheduleUndoRefresh() {
    if (undoTimer) clearTimeout(undoTimer);
    undoTimer = setTimeout(function () { undoTimer = null; if (!S.modal) render(); }, 5100);
  }

  function decide(id, decision, reason, noteText) {
    var r = byId(id), st = S.req[id], ai = r.ai.answer, amt = toWaive(r);
    var needsReason = disagree(ai, decision) || ai === 'unsure';
    if (needsReason && reason === undefined) { openModal(id, decision); return; }
    var routes = decision === 'approved' && amt > D.facility.secondApprovalOver;
    var at = tick();
    var entry = { key: 't' + (++S.seq), today: true, id: id, when: 'Today, ' + at, mrn: r.mrn.slice(-2), amount: amt, ai: ai, rule: (r.ai.sub.match(/rule (W\d)/) || [])[1] || '',
      decision: routes ? 'waiting' : decision, by: D.people.approver.name, second: '', reason: reason || '', note: noteText || '', rules: D.facility.rulesVersion };
    S.log.unshift(entry); S.latest = entry.key;
    st.logKey = entry.key; st.at = at; st.sentBack = null; st.order = ++S.ord;
    S.panel = null; S.expanded = false;
    if (routes) {
      st.status = 'waiting'; st.first = { at: at, reason: reason || 'In line with the suggestion', note: noteText || '' };
      toast('info', 'Sent to ' + D.people.second.name, 'KSh ' + fmt(amt) + ' for ' + r.name + ' needs a second approval.');
    } else {
      st.status = decision; st.undoUntil = Date.now() + 5000; scheduleUndoRefresh();
    }
    render();
    focusOutcome();
  }
  function focusOutcome() { var o = $('.detail__outcome'); if (o) o.focus({ preventScroll: true }); }
  function undo(id) {
    var st = S.req[id];
    S.log = S.log.filter(function (l) { return l.key !== st.logKey; });
    st.status = 'new'; st.undoUntil = 0; st.logKey = null; st.at = null; st.order = 0;
    render();
    var d = document.querySelector('[data-action="decide"][data-decision="approved"]'); if (d) d.focus();
  }

  function handle(ev) {
    var el = ev.target.closest('[data-action]');
    if (!el || el.disabled) return;
    var a = el.getAttribute('data-action'), id = el.getAttribute('data-id');
    if (a === 'select') {
      var fromNext = el.classList.contains('btn--next');
      S.selected = id; S.panel = null; S.expanded = false; render();
      var d = $('.detail__who'); if (d) { d.setAttribute('tabindex', '-1'); if (fromNext) d.focus(); }
      return;
    }
    if (a === 'toggle-reasons') { S.expanded = !S.expanded; render(); var tg = $('[data-action="toggle-reasons"]'); if (tg) tg.focus(); return; }
    if (a === 'page') { S.page = el.getAttribute('data-page'); S.panel = null; render(); return; }
    if (a === 'source') {
      var i = +el.getAttribute('data-index');
      S.panel = S.panel === i ? null : i; render();
      var c = $('.panel__close'); if (c) c.focus();
      return;
    }
    if (a === 'close-panel') { var idx = S.panel; S.panel = null; render(); var back = document.querySelector('[data-action="source"][data-index="' + idx + '"]'); if (back) back.focus(); return; }
    if (a === 'decide') {
      var decision = el.getAttribute('data-decision'), preset = el.getAttribute('data-preset');
      var r = byId(id);
      if (preset || disagree(r.ai.answer, decision) || r.ai.answer === 'unsure') { openModal(id, decision, preset); return; }
      decide(id, decision);
      return;
    }
    if (a === 'close-modal') { closeModal(); return; }
    if (a === 'undo') { undo(id); return; }
    if (a === 'hold') { S.req[id].status = 'hold'; S.req[id].holdAt = tick(); render(); return; }
    if (a === 'unhold') { S.req[id].status = 'new'; S.req[id].holdAt = null; render(); return; }
    if (a === 'retry') {
      var m = S.req[id].missing.ins; m.state = 'busy'; render();
      setTimeout(function () { m.state = 'idle'; m.detail = 'Retried at ' + clock() + '. Still no answer.'; render(); }, 1200);
      return;
    }
    if (a === 'request') { var sw = S.req[id].missing.sw; sw.state = 'done'; sw.detail = 'Requested from social work at ' + tick() + '.'; render(); return; }
    if (a === 'confirm') {
      var st = S.req[id], rr = byId(id), t = tick();
      st.status = 'confirmed'; st.confirmedAt = t; st.at = t; st.order = ++S.ord; S.expanded = false;
      S.log.forEach(function (l) { if (l.key === st.logKey) { l.decision = 'approved'; l.second = D.people.second.name; } });
      S.latest = st.logKey;
      render(); focusOutcome(); return;
    }
    if (a === 'sendback') {
      var sb = S.req[id], t2 = tick();
      sb.status = 'sentback'; sb.sentBack = t2; sb.order = ++S.ord;
      S.log.forEach(function (l) { if (l.key === sb.logKey) { l.decision = 'sentback'; l.second = D.people.second.name; } });
      toast('info', 'Sent back to ' + D.people.approver.name, byId(id).name + '’s request is back in her queue.');
      render(); return;
    }
    if (a === 'filter') { S.filter = el.getAttribute('data-filter'); render(); return; }
    if (a === 'export') { exportCsv(); return; }
  }

  /* ---------- Audit trail ---------- */
  function filtered() {
    return S.log.filter(function (l) {
      if (S.filter === 'disagreed') return disagree(l.ai, l.decision);
      if (S.filter === 'waiting') return l.decision === 'waiting';
      return true;
    });
  }
  function decisionTag(l) {
    if (l.decision === 'waiting') return tag('Approved · waiting for ' + D.people.second.name, 'purple');
    if (l.decision === 'sentback') return tag('Sent back by ' + l.second, 'orange');
    if (l.decision === 'approved') return tag('Approved', 'green');
    return tag('Declined', 'outline');
  }
  function renderAudit() {
    var decided = S.log.filter(function (l) { return l.decision === 'approved' || l.decision === 'declined'; });
    var waived = decided.filter(function (l) { return l.decision === 'approved'; }).reduce(function (a, l) { return a + l.amount; }, 0);
    var dis = S.log.filter(function (l) { return disagree(l.ai, l.decision); }).length;
    var wait = S.log.filter(function (l) { return l.decision === 'waiting'; }).length;
    var tiles = [['Decided this month', decided.length, 'waivers'], ['Waived this month', fmt(waived), 'KSH'], ['Disagreed with the AI', dis, 'of ' + S.log.length + ' requests'], ['Waiting for a second approver', wait, wait === 1 ? 'request' : 'requests']];
    var rows = filtered().map(function (l) {
      var a = ANSWER[l.ai];
      return '<tr' + (l.key === S.latest ? ' class="is-latest"' : '') + '><td>' + esc(l.when) + '</td><td>' + esc(masked(l.mrn)) + '</td><td>' + fmt(l.amount) + '</td>' +
        '<td>' + tag(a.label + (l.rule ? ' · ' + l.rule : ''), a.tag) + '</td><td>' + decisionTag(l) + '</td>' +
        '<td>' + esc(l.by) + (l.second && l.decision === 'approved' ? '<small>Confirmed by ' + esc(l.second) + '</small>' : '') + '</td>' +
        '<td>' + (l.reason ? esc(l.reason) : '<span style="color:#6F6F6F">In line with the AI</span>') + (l.note ? '<small>' + esc(l.note) + '</small>' : '') + '</td><td>' + esc(l.rules) + '</td></tr>';
    }).join('');
    var counts = { all: S.log.length, disagreed: dis, waiting: wait };
    var chips = [['all', 'All'], ['disagreed', 'Disagreed with the AI'], ['waiting', 'Waiting']].map(function (c) {
      return '<button type="button" class="chip" data-action="filter" data-filter="' + c[0] + '" aria-pressed="' + (S.filter === c[0]) + '">' + c[1] + ' · ' + counts[c[0]] + '</button>';
    }).join('');
    return '<div class="audit"><div class="tiles">' + tiles.map(function (t) { return '<div class="tile"><p>' + esc(t[0]) + '</p><div><strong>' + esc(t[1]) + '</strong><small>' + esc(t[2]) + '</small></div></div>'; }).join('') + '</div>' +
      '<section class="log" aria-label="Waiver log"><div class="log__bar"><div class="log__title"><h2>November 2026 · ' + esc(D.facility.name) + '</h2><p>Every decision with what the AI suggested, who decided, the reason and the rules version</p></div>' +
      '<div class="chips" role="group" aria-label="Filter">' + chips + '</div><button type="button" class="btn btn--ghost" data-action="export">Export CSV' + ICON.arrow.replace('<svg ', '<svg fill="currentColor" ') + '</button></div>' +
      '<table><thead><tr><th scope="col">When</th><th scope="col">Patient</th><th scope="col">KSh</th><th scope="col">AI said</th><th scope="col">Decision</th><th scope="col">Decided by</th><th scope="col">Reason</th><th scope="col">Rules</th></tr></thead><tbody>' +
      (rows || '<tr class="log__empty"><td colspan="8">Nothing matches this filter.</td></tr>') + '</tbody></table>' +
      '<p class="log__foot">Disagreements are reviewed monthly with whoever owns the rules.</p></section></div>';
  }
  function exportCsv() {
    var head = ['When', 'Patient', 'KSh', 'AI said', 'Rule', 'Decision', 'Decided by', 'Second approver', 'Reason', 'Note', 'Rules version'];
    var lines = [head].concat(filtered().map(function (l) { return [l.when, masked(l.mrn), l.amount, ANSWER[l.ai].label, l.rule || '', l.decision, l.by, l.second || '', l.reason || '', l.note || '', l.rules]; }));
    var csv = lines.map(function (row) { return row.map(function (c) { c = String(c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(','); }).join('\n');
    var url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    var a = document.createElement('a'); a.href = url; a.download = 'mfano-waivers-november-2026.csv'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ---------- Boot ---------- */
  function boot() {
    initState();
    document.querySelectorAll('.emr-top [data-icon]').forEach(function (el) { el.innerHTML = ICON[el.getAttribute('data-icon')]; });
    $('#app').addEventListener('click', handle);
    document.querySelectorAll('.concept__view button').forEach(function (b) {
      b.addEventListener('click', function () {
        S.view = b.getAttribute('data-view'); S.panel = null;
        $('#toast').innerHTML = '';
        if (S.view === 'auditor') S.page = 'audit';
        else {
          S.page = 'requests';
          var items = queueItems();
          if (items.length && items.indexOf(byId(S.selected)) < 0) S.selected = items[0].id;
        }
        render();
      });
    });
    $('[data-reset]').addEventListener('click', function () { $('#toast').innerHTML = ''; closeModal(); initState(); render(); });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') {
        if (S.modal) { closeModal(); return; }
        if (S.panel !== null) { var idx = S.panel; S.panel = null; render(); var back = document.querySelector('[data-action="source"][data-index="' + idx + '"]'); if (back) back.focus(); }
      }
      if (ev.key === 'Tab' && S.modal) {
        var f = $('#modal').querySelectorAll('button, input, textarea');
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
        else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
      }
    });
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
