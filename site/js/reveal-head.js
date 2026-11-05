/* Loaded in the page head, before anything paints: hides reveal targets until js/site.js sets
   them up, and shows everything after 3s if that never happens. Kept as a file (not inline) so the
   Content-Security-Policy in _headers can allow scripts from this site only. */
(function (d) {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  d.classList.add('rv');
  setTimeout(function () { if (!d.classList.contains('rv-on')) d.classList.remove('rv'); }, 3000);
})(document.documentElement);
