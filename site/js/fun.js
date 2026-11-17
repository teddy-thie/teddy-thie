/* Fun page: turns the three sections into tabs (Design, Labs, Food).
   Without JavaScript all three sections show one after another, each with its own heading.
   Each tab has its own address (/fun#labs), so a tab can be linked to. */
(function () {
  'use strict';
  var root = document.querySelector('.fun');
  var list = root && root.querySelector('[role="tablist"]');
  if (!list) return;
  var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
  var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function videos(panel, play) {
    Array.prototype.forEach.call(panel.querySelectorAll('video'), function (v) {
      if (reduced) { v.removeAttribute('autoplay'); v.controls = true; v.pause(); return; }
      if (play) { v.preload = 'auto'; var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause();
    });
  }

  function select(i, opts) {
    opts = opts || {};
    tabs.forEach(function (t, k) {
      var on = k === i;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      panels[k].hidden = !on;
      videos(panels[k], on);
    });
    if (opts.focus) tabs[i].focus();
    if (opts.push) history.replaceState(null, '', '#' + tabs[i].dataset.tab);
  }

  function fromHash() {
    var h = (location.hash || '').slice(1);
    for (var k = 0; k < tabs.length; k++) if (tabs[k].dataset.tab === h) return k;
    return -1;
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(i, { push: true }); });
    t.addEventListener('keydown', function (e) {
      var n = tabs.length, to = null;
      if (e.key === 'ArrowRight') to = (i + 1) % n;
      else if (e.key === 'ArrowLeft') to = (i - 1 + n) % n;
      else if (e.key === 'Home') to = 0;
      else if (e.key === 'End') to = n - 1;
      if (to === null) return;
      e.preventDefault();
      select(to, { focus: true, push: true });
    });
  });
  window.addEventListener('hashchange', function () { var k = fromHash(); if (k > -1) select(k); });

  root.classList.add('is-tabbed');
  list.hidden = false;
  select(Math.max(0, fromHash()));
})();
