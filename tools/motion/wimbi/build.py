"""Wimbi motion: three Lottie files for the Day 11 case study, drawn by hand like the Ujira set.
Run from site/lab/wimbi/motion:
    PYTHONPATH=../../../../tools/motion/ujira python3 ../../../../tools/motion/wimbi/build.py
It reads ../data/btc-2026-11-21.json, so the day animation is the real snapshot, not a made-up curve.

  wimbi-mark.json     the mark: the "W" wave from the Lab logomarks set draws itself, then a ripple runs through it
  wimbi-answers.json  the idea: the 4-hour line, three tiles, then three answer cards land before any chart
  wimbi-day.json      the snapshot day: price falls through two long flushes and bounces as shorts are forced out
                      (blue bars below the line are longs forced out, orange above are shorts), then the last 4 hours light up

The W is traced from the Wimbi tile in the logomarks sheet on the 120-unit grid (stroke 15, round caps):
    M18 34 C20 62 27 86 39 86 C50 86 54 56 60 56 C66 56 70 86 81 86 C93 86 100 62 102 34
Colours are the Wimbi palette from the Day 11 Figma file: blue for long, orange for short, never red and green.
"""
import json
from lottiekit import EASE, anim, static, hexc, fill, stroke, group, Comp, scale_keys, pos_keys

EASE['pop'] = ((0.2, 0), (0.2, 1.4))
EASE['settle'] = ((0.3, 0), (0.3, 1))
EASE['wave'] = ((0.45, 0), (0.55, 1))

BG, SURFACE, SURFACE2, BORDER, GRID, BAND = '#0A0D13', '#11161F', '#171E2A', '#232B3A', '#1C2330', '#141B27'
TEXT, T2, T3 = '#E7ECF4', '#A1AABB', '#848DA0'
LONG, LONG_SOFT, SHORT, AMBER = '#5B95FF', '#162544', '#FF8B3D', '#F2B544'
FR = 30


def comp(name, w, h, op, layers):
    return {'v': '5.7.4', 'fr': FR, 'ip': 0, 'op': op, 'w': w, 'h': h, 'nm': name, 'ddd': 0, 'assets': [], 'layers': layers.finish(op), 'markers': []}


def trim(end, start=None):
    return {'ty': 'tm', 's': start if start is not None else static(0), 'e': end, 'o': static(0), 'm': 1, 'nm': 'Draw'}


def shape(v, i=None, o=None, closed=False):
    n = len(v)
    return {'c': closed, 'v': v, 'i': i or [[0, 0]] * n, 'o': o or [[0, 0]] * n}


def sh(ks, name='Path'):
    return {'ty': 'sh', 'nm': name, 'ks': ks}


def rrect(x, y, w, h, r, color, o=100, name='Rect', line=None):
    items = [{'ty': 'rc', 'd': 1, 'p': static([x + w / 2, y + h / 2]), 's': static([w, h]), 'r': static(r), 'nm': 'Shape'}]
    if line:
        items.append(stroke(line, 1.5))
    if color:
        items.append(fill(color))
    return group(items, name, o)


def stack(items):
    """Shapes listed bottom to top; Lottie draws the first shape on top, so reverse them."""
    return items[::-1]


def dashed(color, w, dash, gap):
    s = stroke(color, w)
    s['d'] = [{'n': 'd', 'nm': 'dash', 'v': static(dash)}, {'n': 'g', 'nm': 'gap', 'v': static(gap)}]
    return s


# ---------- the W, as cubic segments on the 120 grid ----------
def w_shape(k, cx, cy, peak=56, trough=86, top=34):
    """The W centreline scaled by k around (60, 60) and placed at (cx, cy). peak and trough move for the ripple."""
    X = lambda u: cx + (u - 60) * k
    Y = lambda u: cy + (u - 60) * k
    pts = [(18, top), (39, trough), (60, peak), (81, trough), (102, top)]
    v = [[X(x), Y(y)] for x, y in pts]
    # tangents (out, in) per point, in grid units, from the path in the docstring
    o = [[2, 28], [11, 0], [6, 0], [12, 0], [0, 0]]
    i = [[0, 0], [-12, 0], [-6, 0], [-11, 0], [-2, 28]]
    # keep the curves' shape when the peak or trough moves
    o[0] = [2, (trough - top) * 28 / 52]
    i[4] = [-2, (trough - top) * 28 / 52]
    o[1] = [11, 0]; i[2] = [-6, 0]
    return shape(v, [[a * k, b * k] for a, b in i], [[a * k, b * k] for a, b in o])


# ---------- 1. The mark ----------
def mark():
    S, k, C = 480, 4, 240
    c = Comp()
    tile = group([{'ty': 'rc', 'd': 1, 'p': static([C, C]), 's': static([S, S]), 'r': static(120), 'nm': 'Tile'}, fill(SURFACE)], 'Tile')
    c.layer('Tile', [tile], center=(C, C), s=scale_keys([(0, 72, 'pop'), (11, 100, None)]), o=anim([(0, 0, 'linear'), (5, 100, None)]))
    rest = w_shape(k, C, C)
    # the ripple: the middle rises while the troughs dip, then it overshoots the other way and settles
    ripple = anim([
        (34, rest, 'wave'),
        (44, w_shape(k, C, C, peak=48, trough=90), 'wave'),
        (54, w_shape(k, C, C, peak=61, trough=83), 'wave'),
        (62, w_shape(k, C, C, peak=55, trough=86.5), 'settle'),
        (68, rest, None),
    ])
    c.layer('W', [group([sh(ripple, 'W'), trim(anim([(6, 0, 'standard'), (30, 100, None)])), stroke(TEXT, 15 * k)], 'W')], center=(C, C))
    return comp('Wimbi mark', S, S, 90, c)


# ---------- 2. The answers land before the charts ----------
def answers():
    W, H = 960, 720
    c = Comp()
    c.layer('Background', [rrect(0, 0, W, H, 0, BG, name='Background')], center=(W / 2, H / 2))
    # stamp dot and line, then the 4-hour line as a big bar
    c.layer('Stamp', [group([{'ty': 'el', 'd': 1, 'p': static([66, 72]), 's': static([10, 10]), 'nm': 'Dot'}, fill(AMBER)], 'Dot'), rrect(80, 68, 220, 8, 4, T3, name='Stamp')],
            center=(66, 72), o=anim([(2, 0, 'linear'), (8, 100, None)]))
    head = c.layer('Headline', [rrect(60, 96, 560, 26, 8, TEXT, name='Line 1'), rrect(60, 132, 340, 26, 8, TEXT, name='Line 2')], center=(60, 127),
                   s=anim([(6, [0, 100, 100], 'entrance'), (22, [100, 100, 100], None)]))
    # tiles
    for n in range(3):
        x = 60 + n * 176
        t0 = 16 + n * 4
        c.layer(f'Tile {n + 1}', stack([rrect(x, 188, 164, 64, 10, SURFACE, line=BORDER, name='Tile'), rrect(x + 14, 204, 60, 7, 3, T3, name='Name'), rrect(x + 14, 222, 70 if n != 1 else 84, 16, 4, TEXT, name='Value'), rrect(x + 92 if n != 1 else x + 106, 228, 50, 7, 3, T3, name='Note')]),
                center=(x + 82, 220), o=anim([(t0, 0, 'linear'), (t0 + 6, 100, None)]), s=scale_keys([(t0, 94, 'settle'), (t0 + 10, 100, None)]))
    # three cards
    cw, ch, cy = 268, 330, 290
    viz_t = 58
    for n in range(3):
        x = 60 + n * (cw + 18)
        t0 = 30 + n * 6
        items = [rrect(x, cy, cw, ch, 16, SURFACE, line=BORDER, name='Card'),
                 rrect(x + 22, cy + 24, 150, 8, 4, T3, name='Question'), rrect(x + cw - 76, cy + 18, 54, 20, 6, None, line=BORDER, name='Source'),
                 rrect(x + 22, cy + 52, 190 if n != 2 else 160, 16, 5, TEXT, name='Verdict'),
                 rrect(x + 22, cy + 88, 84, 34, 6, TEXT, name='Number'), rrect(x + 116, cy + 100, 120, 8, 4, T2, name='Unit'),
                 rrect(x + 22, cy + 222, 210, 8, 4, T2, name='Detail 1'), rrect(x + 22, cy + 238, 150, 8, 4, T2, name='Detail 2'),
                 rrect(x + 22, cy + 290, 88, 8, 4, T3, name='See the chart')]
        p = pos_keys([(t0, (x + cw / 2, cy + ch / 2 + 40), 'entrance'), (t0 + 14, (x + cw / 2, cy + ch / 2), None)])
        card = c.layer(f'Card {n + 1}', stack(items), center=(x + cw / 2, cy + ch / 2), p=p, o=anim([(t0, 0, 'linear'), (t0 + 8, 100, None)]))
        vx, vy, vw = x + 22, cy + 160, cw - 44
        if n == 0:  # long share: the marker slides into place below the usual band
            c.layer('Range', stack([rrect(vx, vy, vw, 6, 3, GRID, name='Track'), rrect(vx + vw * 0.24, vy, vw * 0.38, 6, 3, LONG_SOFT, name='Usual')]), center=(vx, vy), parent=card, o=anim([(t0, 0, 'linear'), (t0 + 8, 100, None)]))
            c.layer('Marker', [rrect(vx - 1.5, vy - 6, 3, 18, 1.5, LONG, name='Marker')], center=(vx, vy), parent=card,
                    p=pos_keys([(viz_t, (vx, vy), 'standard'), (viz_t + 16, (vx + vw * 0.19, vy), None)]), o=anim([(viz_t, 0, 'linear'), (viz_t + 4, 100, None)]))
        elif n == 1:  # last 4 hours: longs on the left, shorts on the right, the split grows in
            c.layer('Longs', [rrect(vx, vy, vw * 0.29, 10, 3, LONG, name='Longs')], center=(vx, vy), parent=card, s=anim([(viz_t + 2, [0, 100, 100], 'standard'), (viz_t + 14, [100, 100, 100], None)]))
            c.layer('Shorts', [rrect(vx + vw * 0.31, vy, vw * 0.69, 10, 3, SHORT, name='Shorts')], center=(vx + vw, vy), parent=card, s=anim([(viz_t + 4, [0, 100, 100], 'standard'), (viz_t + 18, [100, 100, 100], None)]))
        else:  # funding: who pays, against the resting rate
            c.layer('Track', stack([rrect(vx, vy, vw, 6, 3, GRID, name='Track'), rrect(vx + vw * 0.44, vy, vw * 0.22, 6, 3, T3, o=45, name='Usual'),
                              rrect(vx + vw * 0.33, vy - 6, 1, 18, 0, T3, name='Zero'), rrect(vx + vw * 0.66, vy - 8, 1.5, 22, 0, AMBER, name='Resting')]), center=(vx, vy), parent=card, o=anim([(t0, 0, 'linear'), (t0 + 8, 100, None)]))
            for j, (fx, col) in enumerate([(0.18, SHORT), (0.21, SHORT), (0.39, LONG)]):
                dx = vx + vw * fx
                t = viz_t + 6 + j * 4
                c.layer(f'Dot {j + 1}', [group([{'ty': 'el', 'd': 1, 'p': static([dx, vy + 3]), 's': static([12, 12]), 'nm': 'Dot'}, fill(col)], 'Dot')], center=(dx, vy + 3), parent=card,
                        p=pos_keys([(t, (dx, vy - 26), 'settle'), (t + 10, (dx, vy + 3), None)]), o=anim([(t, 0, 'linear'), (t + 4, 100, None)]))
    # the charts arrive last, below the fold
    c.layer('Charts', stack([rrect(60, 640, 840, 120, 16, SURFACE, line=BORDER, name='Charts'), rrect(82, 662, 150, 12, 4, TEXT, name='Title')]), center=(480, 700),
            o=anim([(84, 0, 'linear'), (94, 100, None)]), p=pos_keys([(84, (480, 730), 'entrance'), (98, (480, 700), None)]))
    return comp('Wimbi answers', W, H, 132, c)


# ---------- 3. The snapshot day ----------
def day():
    D = json.load(open('../data/btc-2026-11-21.json'))
    S = D['series']
    n = len(S['close'])
    W, H = 960, 720
    X0, X1 = 70, 890
    x = lambda i: X0 + (X1 - X0) * i / (n - 1)
    yP = lambda v: 90 + 300 * (62600 - v) / 7800
    yO = lambda v: 90 + 300 * (98200 - v) / 5400
    base, half = 560, 110
    T0, T1 = 8, 104  # the line draws across the day in these frames
    c = Comp()
    c.layer('Background', [rrect(0, 0, W, H, 0, BG, name='Background')], center=(W / 2, H / 2))
    grid = [rrect(X0, yP(v), X1 - X0, 1.5, 0, GRID, name=f'{v}') for v in (56000, 58000, 60000, 62000)] + [rrect(X0, base, X1 - X0, 1.5, 0, GRID, name='Baseline')]
    c.layer('Grid', grid, center=(W / 2, H / 2), o=anim([(0, 0, 'linear'), (8, 100, None)]))
    # the last 4 hours, lit at the end
    c.layer('Last 4 hours', [rrect(x(n - 49), 70, x(n - 1) - x(n - 49), base + half - 60, 0, BAND, name='Band')], center=(x(n - 1), 300), o=anim([(T1 + 2, 0, 'linear'), (T1 + 12, 100, None)]))
    step = 3
    idx = list(range(0, n, step)) + ([n - 1] if (n - 1) % step else [])
    oi = [[x(i), yO(S['oiBtc'][i])] for i in idx]
    price = [[x(i), yP(S['close'][i])] for i in idx]
    draw = anim([(T0, 0, 'linear'), (T1, 100, None)])
    c.layer('Open interest', [group([sh(static(shape(oi)), 'OI'), trim(draw), dashed(T3, 2.5, 8, 7)], 'OI')], center=(W / 2, H / 2))
    # liquidations per 30 minutes: each bar grows from the baseline as the line passes it
    B = 6
    nb = (n - 1) // B
    buckets = [(sum(S['liqLongK'][b * B:(b + 1) * B]), sum(S['liqShortK'][b * B:(b + 1) * B])) for b in range(nb)]
    mx = max(max(l, s) for l, s in buckets)
    pitch = (X1 - X0) / nb
    bw = pitch - 4
    for b, (l, s) in enumerate(buckets):
        bx = X0 + b * pitch + 2
        t = T0 + (T1 - T0) * (b + 0.5) / nb
        for val, col, up in ((s, SHORT, True), (l, LONG, False)):
            h = val / mx * half
            if h < 1.5:
                continue
            y = base - h if up else base
            c.layer(f'{"Short" if up else "Long"} {b}', [rrect(bx, y, bw, h, 2, col, name='Bar')], center=(bx + bw / 2, base),
                    s=anim([(t, [100, 0, 100], 'pop'), (t + 7, [100, 100, 100], None)]))
    c.layer('Price', [group([sh(static(shape(price)), 'Price'), trim(draw), stroke(TEXT, 4)], 'Price')], center=(W / 2, H / 2))
    # the pen: a dot riding the end of the line, then the "now" dot pulses
    pen = pos_keys([(T0 + (T1 - T0) * k / 24, (x(round((n - 1) * k / 24)), yP(S['close'][round((n - 1) * k / 24)])), 'linear') for k in range(24)] + [(T1, (x(n - 1), yP(S['close'][n - 1])), None)])
    c.layer('Pen', [group([{'ty': 'el', 'd': 1, 'p': static([0, 0]), 's': static([14, 14]), 'nm': 'Dot'}, fill(TEXT)], 'Dot')], center=(0, 0), p=pen, o=anim([(T0, 0, 'linear'), (T0 + 3, 100, None)]))
    ex, ey = x(n - 1), yP(S['close'][n - 1])
    c.layer('Now ring', [group([{'ty': 'el', 'd': 1, 'p': static([ex, ey]), 's': anim([(T1 + 4, [14, 14], 'entrance'), (T1 + 26, [64, 64], None)]), 'nm': 'Ring'}, stroke(TEXT, 2.5)], 'Ring')],
            center=(ex, ey), o=anim([(0, 0, 'hold'), (T1 + 4, 80, 'linear'), (T1 + 26, 0, None)]))
    return comp('Wimbi day', W, H, 150, c)


for fn, name in [(mark, 'wimbi-mark'), (answers, 'wimbi-answers'), (day, 'wimbi-day')]:
    data = fn()
    json.dump(data, open(f'{name}.json', 'w'), separators=(',', ':'))
    print(name, len(json.dumps(data, separators=(',', ':'))), 'bytes,', data['op'], 'frames,', len(data['layers']), 'layers')
