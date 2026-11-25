/* Jasiri tickets · a tiny 3D model of the Kasarani indoor arena (approximate, drawn from photos and video).
   It draws the block map and the illustrated view from any block or seat as plain SVG. No library. */
(function (G) {
var SC = { g: '#2FA866', y: '#E9C440', b: '#4A86E8', r: '#E5484D' };
var OUT = { N: [0, 1, 0], S: [0, -1, 0], W: [-1, 0, 0], E: [1, 0, 0] };
var B = [];
function add(id, sd, a, b, si, so, z0, z1, c, pr, lf) { B.push({ id: id, sd: sd, a: a, b: b, si: si, so: so, z0: z0, z1: z1, c: c, pr: pr, lf: lf }); }
[[-16, -8], [-8, 0], [0, 8], [8, 16]].forEach(function (s, i) { add('G' + (i + 1), 'N', s[0], s[1], 10, 17, 1.2, 6, 'g', 1000, [86, 77, 120, 64][i]); });
[[-16, -8], [-8, 0], [0, 8], [8, 16]].forEach(function (s, i) { add('Y' + (i + 1), 'S', s[0], s[1], -10, -17, 1.2, 6, 'y', 1000, [150, 98, 0, 77][i]); });
[[-9, 0], [0, 9]].forEach(function (s, i) { add('B' + (i + 1), 'W', s[0], s[1], -17, -24, 1.2, 6, 'b', 1000, [40, 52][i]); });
[[-9, 0], [0, 9]].forEach(function (s, i) { add('B' + (i + 3), 'E', s[0], s[1], 17, 24, 1.2, 6, 'b', 1000, [9, 31][i]); });
add('VN', 'N', -14, 14, 8.2, 9.6, 0.25, 0.6, 'r', 2000, 14);
add('VS', 'S', -14, 14, -8.2, -9.6, 0.25, 0.6, 'r', 2000, 6);
B.forEach(function (k) {
  k.na = B.some(function (o) { return o !== k && o.sd == k.sd && o.id.charAt(0) == k.id.charAt(0) && o.b == k.a; });
  k.nb = B.some(function (o) { return o !== k && o.sd == k.sd && o.id.charAt(0) == k.id.charAt(0) && o.a == k.b; });
});
function P3(k, t, s, z) { return (k.sd == 'N' || k.sd == 'S') ? [t, s, z] : [s, t, z]; }
function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function crs(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function nrm(a) { var l = Math.sqrt(dot(a, a)); return [a[0] / l, a[1] / l, a[2] / l]; }
function cen(q) { var c = [0, 0, 0]; q.forEach(function (p) { c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; }); return [c[0] / q.length, c[1] / q.length, c[2] / q.length]; }
function cam(P, T) { var f = nrm(sub(T, P)), r = nrm(crs(f, [0, 0, 1])), u = crs(r, f); return { P: P, f: f, r: r, u: u }; }
function pj(c, X) { var d = sub(X, c.P), z = dot(d, c.f); return [dot(d, c.r) / z, -dot(d, c.u) / z, z]; }
function find(id) { for (var i = 0; i < B.length; i++) if (B[i].id == id) return B[i]; }
function faces(k) {
  var o = OUT[k.sd], al = (k.sd == 'N' || k.sd == 'S') ? [1, 0, 0] : [0, 1, 0], dz = k.z1 - k.z0, ds = Math.abs(k.so - k.si), a = k.a, b = k.b, si = k.si, so = k.so, z0 = k.z0, z1 = k.z1;
  return [{ t: 's', q: [P3(k, a, si, z0), P3(k, b, si, z0), P3(k, b, so, z1), P3(k, a, so, z1)], n: [-o[0] * dz, -o[1] * dz, ds] },
  { t: 'r', q: [P3(k, a, si, 0), P3(k, b, si, 0), P3(k, b, si, z0), P3(k, a, si, z0)], n: [-o[0], -o[1], 0] },
  { t: 'w', q: [P3(k, a, so, 0), P3(k, b, so, 0), P3(k, b, so, z1), P3(k, a, so, z1)], n: o },
  { t: 'e', q: [P3(k, a, si, 0), P3(k, a, si, z0), P3(k, a, so, z1), P3(k, a, so, 0)], n: [-al[0], -al[1], 0] },
  { t: 'e', q: [P3(k, b, si, 0), P3(k, b, si, z0), P3(k, b, so, z1), P3(k, b, so, 0)], n: al }];
}
function rows(k) { var L = []; for (var i = 1; i < 5; i++) { var f = i / 5, s = k.si + (k.so - k.si) * f, z = k.z0 + (k.z1 - k.z0) * f + 0.03; L.push([P3(k, k.a, s, z), P3(k, k.b, s, z)]); } return L; }
function court() {
  var z = 0.03, L = [[[-14, -7.5, z], [14, -7.5, z], [14, 7.5, z], [-14, 7.5, z], [-14, -7.5, z]], [[0, -7.5, z], [0, 7.5, z]]], c = [];
  for (var i = 0; i <= 24; i++) { var t = i / 24 * Math.PI * 2; c.push([1.8 * Math.cos(t), 1.8 * Math.sin(t), z]); } L.push(c);
  [1, -1].forEach(function (s) { var bx = -14 * s, kx = bx + 5.8 * s, hx = bx + 1.575 * s, a = [[bx, -6.6, z]]; L.push([[bx, -2.45, z], [kx, -2.45, z], [kx, 2.45, z], [bx, 2.45, z]]);
    for (var i = 0; i <= 16; i++) { var t = -1.36 + 2.72 * i / 16; a.push([hx + s * 6.75 * Math.cos(t), 6.75 * Math.sin(t), z]); } a.push([bx, 6.6, z]); L.push(a); });
  return L;
}
var CL = court();
function poly(pts, f, s, w, ex) { return '<polygon points="' + pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ') + '" fill="' + f + '" stroke="' + s + '" stroke-width="' + w + '"' + (ex || '') + '/>'; }
function line(pts, s, w, op) { return '<polyline points="' + pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ') + '" fill="none" stroke="' + s + '" stroke-width="' + w + '" opacity="' + (op || 1) + '" stroke-linecap="round" pointer-events="none"/>'; }
function render(c, map, mode, selId, P) {
  var ground = '', items = [], labels = '', near = mode == 'vw' ? 0.5 : 0;
  function Pp(X) { return pj(c, X); }
  function ok(q) { for (var i = 0; i < q.length; i++) { if (Pp(q[i])[2] <= near + 0.0001) return false; } return true; }
  function M(X) { return map(Pp(X)); }
  if (mode == 'vw') { var fl = [[-26, -19, 0], [26, -19, 0], [26, 19, 0], [-26, 19, 0]]; if (ok(fl)) ground += poly(fl.map(M), P.floor, 'none', 0); }
  var ct = [[-14, -7.5, 0.01], [14, -7.5, 0.01], [14, 7.5, 0.01], [-14, 7.5, 0.01]], cf = [[-15.5, -8, 0.005], [15.5, -8, 0.005], [15.5, 8, 0.005], [-15.5, 8, 0.005]];
  if (ok(cf)) ground += poly(cf.map(M), P.apron, 'none', 0);
  if (ok(ct)) ground += poly(ct.map(M), P.court, 'none', 0);
  CL.forEach(function (l) { if (ok(l)) ground += line(l.map(M), P.courtLine, mode == 'vw' ? 1.2 : 1); });
  B.forEach(function (k) {
    if (mode == 'vw' && k.id == selId) return; var isS = k.id == selId, so = k.lf == 0;
    faces(k).forEach(function (f, fi) {
      var cc = cen(f.q); if (dot(f.n, sub(c.P, cc)) <= 0) return; if (!ok(f.q)) return; if (mode == 'ov' && (f.t == 'w' || f.t == 'e')) return;
      if (mode == 'orb' && ((fi == 3 && k.na) || (fi == 4 && k.nb))) return; var d = Pp(cc)[2];
      if (f.t == 's') {
        var fill = isS ? P.sel : (so ? 'url(#' + P.hatch + ')' : P.blk), s = poly(f.q.map(M), fill, isS ? P.sel : P.blkLine, 0.75, mode != 'vw' ? ' data-block="' + k.id + '"' : '');
        if (!so) rows(k).forEach(function (r) { if (ok(r)) s += line(r.map(M), isS ? P.selRow : SC[k.c], 1.1, 0.95); });
        items.push({ d: d, s: s });
        if (mode != 'vw' && k.id.charAt(0) != 'V') { var m = M(cc); labels += '<text x="' + m[0].toFixed(1) + '" y="' + (m[1] + 4).toFixed(1) + '" text-anchor="middle" font-family="Geist" font-size="11" font-weight="500" pointer-events="none" fill="' + (isS ? P.lblSel : (so ? P.lblSo : P.lbl)) + '">' + (so ? 'Sold out' : k.id) + '</text>'; }
      } else items.push({ d: d, s: poly(f.q.map(M), P.side, P.blkLine, 0.5) });
    });
  });
  if (mode == 'vw') {
    [1, -1].forEach(function (s) { var x = -12.8 * s, bb = [[x, -0.9, 2.9], [x, 0.9, 2.9], [x, 0.9, 3.95], [x, -0.9, 3.95]]; if (ok(bb)) items.push({ d: Pp(cen(bb))[2], s: poly(bb.map(M), '#F4F4F0', '#BDBDC2', 0.5, ' opacity="0.85"') }); });
  }
  items.sort(function (a, b) { return b.d - a.d; });
  return ground + items.map(function (i) { return i.s; }).join('') + labels;
}
function overview(selId, th, W, H, P, top) {
  var R = 32, Hh = 50, Pc = [R * Math.sin(th), -R * Math.cos(th), Hh], c = cam(Pc, [0, 1.5 * Math.cos(th), 0]), mn = [1e9, 1e9], mx = [-1e9, -1e9];
  B.forEach(function (k) { faces(k)[0].q.concat(faces(k)[1].q).forEach(function (X) { var p = pj(c, X); mn[0] = Math.min(mn[0], p[0]); mn[1] = Math.min(mn[1], p[1]); mx[0] = Math.max(mx[0], p[0]); mx[1] = Math.max(mx[1], p[1]); }); });
  var pd = 8, t = top || 0, s = Math.min((W - 2 * pd) / (mx[0] - mn[0]), (H - 2 * pd - t) / (mx[1] - mn[1])), ox = (W - (mx[0] - mn[0]) * s) / 2, oy = t + (H - t - (mx[1] - mn[1]) * s) / 2;
  return render(c, function (p) { return [ox + (p[0] - mn[0]) * s, oy + (p[1] - mn[1]) * s]; }, 'ov', selId, P);
}
// The draggable map: the camera circles the court at a fixed distance. th turns it, ph tilts it (radians above the floor).
// The zoom is fitted once per tilt across every turn, so the arena doesn't pump in and out while you drag.
var FIT = {};
function orbitCam(th, ph) { var D = 59.4; return cam([D * Math.cos(ph) * Math.sin(th), -D * Math.cos(ph) * Math.cos(th), D * Math.sin(ph)], [0, 0, 0.5]); }
function orbitFit(ph, W, H) {
  var key = Math.round(ph * 100) + '|' + W + '|' + H; if (FIT[key]) return FIT[key];
  var mx = 0, top = 0, bot = 0;
  for (var i = 0; i < 16; i++) {
    var c = orbitCam(i / 16 * Math.PI * 2, ph), o = pj(c, [0, 0, 0]);
    B.forEach(function (k) { faces(k)[0].q.concat(faces(k)[2].q).forEach(function (X) { var p = pj(c, X); mx = Math.max(mx, Math.abs(p[0] - o[0])); top = Math.min(top, p[1] - o[1]); bot = Math.max(bot, p[1] - o[1]); }); });
  }
  var pd = 6;
  return (FIT[key] = { s: Math.min((W / 2 - pd) / mx, (H - 2 * pd) / (bot - top)), mid: (top + bot) / 2 });
}
function orbit(selId, th, ph, W, H, P) {
  var c = orbitCam(th, ph), f = orbitFit(ph, W, H), o = pj(c, [0, 0, 0]);
  return render(c, function (p) { return [W / 2 + (p[0] - o[0]) * f.s, H / 2 + (p[1] - o[1] - f.mid) * f.s]; }, 'orb', selId, P);
}
function seatView(id, r, n, nRows, nSeats, W, H, P) {
  // Seat 1 is on the fan's left as they face the court.
  var k = find(id), f = (r + 0.5) / nRows, S = k.si + (k.so - k.si) * f, Z = k.z0 + (k.z1 - k.z0) * f, t = (n - 0.5) / nSeats,
    X = (k.sd == 'N' || k.sd == 'W') ? k.b - t * (k.b - k.a) : k.a + t * (k.b - k.a);
  if (k.sd == 'W' || k.sd == 'E') { var Y = X; return renderFrom([S, Y, Z + 1.2], [S * 0.5, Y * 0.5, 1.0], id, W, H, P); }
  return renderFrom([X, S, Z + 1.2], [X * 0.5, 0, 1.0], id, W, H, P);
}
function renderFrom(eye, at, id, W, H, P) {
  var c = cam(eye, at), sc = W * 0.54;
  return render(c, function (p) { return [W / 2 + sc * p[0], H * 0.53 + sc * p[1]]; }, 'vw', id, P);
}
function blockView(id, W, H, P) {
  var k = find(id), cc = cen(faces(k)[0].q), c = cam([cc[0], cc[1], cc[2] + 1.3], [cc[0] * 0.25, cc[1] * 0.25, 1.2]), sc = W * 0.54;
  return render(c, function (p) { return [W / 2 + sc * p[0], H * 0.53 + sc * p[1]]; }, 'vw', id, P);
}
G.JTArena = { SC: SC, blocks: B, find: find, overview: overview, orbit: orbit, seatView: seatView, blockView: blockView };
})(window);
