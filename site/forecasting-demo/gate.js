/* Unlocks the MarketMind prototype with the same password as the locked case studies.
   The product content lives encrypted in payload.json (written by tools/encrypt-demo.mjs).
   Anyone who already unlocked a case study in this tab gets straight in. */
(function () {
  'use strict';
  var KEY = 'tt-nda';
  var gate = document.getElementById('gate');
  var form = gate.querySelector('form');
  var input = gate.querySelector('input');
  var msg = gate.querySelector('[data-gate-msg]');
  var btn = form.querySelector('button');
  var payload = null;

  function store(k, v) {
    try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; }
    return null;
  }
  function b64(s) {
    var bin = atob(s), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function decrypt(p, password) {
    var subtle = window.crypto && window.crypto.subtle;
    if (!subtle) return Promise.reject(new Error('unsupported'));
    return subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey'])
      .then(function (base) {
        return subtle.deriveKey({ name: 'PBKDF2', salt: b64(p.salt), iterations: p.iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
      })
      .then(function (key) { return subtle.decrypt({ name: 'AES-GCM', iv: b64(p.iv) }, key, b64(p.data)); })
      .then(function (buf) { return JSON.parse(new TextDecoder().decode(buf)); });
  }
  function boot(data) {
    gate.remove();
    window.MM.boot(data, document.getElementById('mm'));
  }
  function showForm(text, isError) {
    gate.hidden = false;
    if (text) { msg.textContent = text; msg.classList.toggle('is-error', !!isError); }
  }
  function attempt(password, quiet) {
    btn.disabled = true;
    if (!quiet) { msg.classList.remove('is-error'); msg.textContent = 'Unlocking…'; }
    return decrypt(payload, password)
      .then(function (data) { store(KEY, password); boot(data); })
      .catch(function (err) {
        btn.disabled = false;
        if (quiet) { showForm(); input.focus(); return; }
        showForm(err && err.message === 'unsupported'
          ? 'This browser cannot unlock the prototype. Try an up-to-date Chrome, Safari, Edge or Firefox.'
          : "That password didn't work. Use the one from my CV, or email me for access.", true);
        input.select();
      });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var pw = input.value.trim();
    if (!pw) { showForm('Enter the password from my CV.', true); input.focus(); return; }
    if (!payload) return;
    attempt(pw, false);
  });

  // A standalone copy carries its content inline and skips the gate.
  if (window.MM_DATA) { boot(window.MM_DATA); return; }

  fetch('payload.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('missing')); })
    .then(function (p) {
      payload = p;
      if (!p || !p.data) { btn.disabled = true; showForm('The prototype is not published yet. Email me for a walkthrough.', true); return; }
      var saved = store(KEY);
      if (saved) attempt(saved, true); else { showForm(); input.focus(); }
    })
    .catch(function () { btn.disabled = true; showForm('The prototype could not load. Refresh to try again.', true); });
})();
