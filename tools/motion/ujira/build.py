"""Ujira motion: three Lottie files drawn from the official Ujira mark (120-unit grid, Lab logomarks set).
Run from site/lab/ujira/motion: PYTHONPATH=../../../../tools/motion/ujira python3 ../../../../tools/motion/ujira/build.py
The mark is an open bowl (wages for work) with a coin in it. Every animation is the same move: the coin drops in.
  ujira-mark.json      the app icon: tile, bowl draws, coin drops and settles (splash, welcome, Fun page, Dribbble)
  ujira-landing.json   withdrawal sent: navy disc, white bowl, one green coin per M-Pesa payment, then a check badge
  ujira-received.json  money in: green disc, navy bowl, white coin, a small burst
"""
import json
from lottiekit import EASE, anim, static, hexc, fill, stroke, group, Comp, scale_keys, pos_keys

EASE['fall'] = ((0.55, 0), (0.9, 0.6))     # accelerating drop
EASE['rise'] = ((0.1, 0.4), (0.4, 1))      # quick decelerating rebound
EASE['pop'] = ((0.2, 0), (0.2, 1.4))       # slight overshoot
EASE['settle'] = ((0.3, 0), (0.3, 1))

BLUE, NAVY, GREEN, WHITE = '#1A73E8', '#0D1B2A', '#2BC48A', '#FFFFFF'
FR = 30


def bowl_shape(k, ox, oy):
    """The bowl path M34 26 V64 C34 78.36 45.64 90 60 90 C74.36 90 86 78.36 86 64 V26, scaled by k around (60,60), placed at (ox, oy)."""
    X = lambda u: ox + (u - 60) * k
    Y = lambda u: oy + (u - 60) * k
    v = [[X(34), Y(26)], [X(34), Y(64)], [X(60), Y(90)], [X(86), Y(64)], [X(86), Y(26)]]
    o = [[0, 0], [0, 14.36 * k], [14.36 * k, 0], [0, 0], [0, 0]]
    i = [[0, 0], [0, 0], [-14.36 * k, 0], [0, 14.36 * k], [0, 0]]
    return {'ty': 'sh', 'nm': 'Bowl', 'ks': static({'c': False, 'v': v, 'i': i, 'o': o})}


def trim(end):
    return {'ty': 'tm', 's': static(0), 'e': end, 'o': static(0), 'm': 1, 'nm': 'Draw'}


def disc(cx, cy, d, color):
    return group([{'ty': 'el', 'd': 1, 'p': static([cx, cy]), 's': static([d, d]), 'nm': 'Disc'}, fill(color)], 'Disc')


def ring(cx, cy, d, color, w, o=100):
    return group([{'ty': 'el', 'd': 1, 'p': static([cx, cy]), 's': d, 'nm': 'Ring'}, stroke(color, w, o)], 'Ring')


def line(x1, y1, x2, y2, color, w, end):
    v = [[x1, y1], [x2, y2]]
    return group([{'ty': 'sh', 'nm': 'Ray', 'ks': static({'c': False, 'v': v, 'i': [[0, 0], [0, 0]], 'o': [[0, 0], [0, 0]]})},
                  {'ty': 'tm', 's': end[0], 'e': end[1], 'o': static(0), 'm': 1, 'nm': 'Trim'}, stroke(color, w)], 'Ray')


def coin_drop(c, name, cx, cy, d, color, t0, t1, from_y, bounce=0.06):
    """A coin layer that falls from from_y to cy between t0 and t1, squashes, rebounds a little and settles."""
    up = cy - d * bounce * 2.2
    p = pos_keys([(t0, (cx, from_y), 'fall'), (t1, (cx, cy), 'rise'), (t1 + 5, (cx, up), 'fall'), (t1 + 9, (cx, cy), 'settle'), (t1 + 12, (cx, cy), None)])
    s = anim([(t0, [100, 100, 100], 'hold'), (t1, [114, 86, 100], 'settle'), (t1 + 5, [95, 105, 100], 'settle'), (t1 + 10, [100, 100, 100], None)])
    o = anim([(t0, 0, 'linear'), (t0 + 2, 100, None)])
    return c.layer(name, [disc(cx, cy, d, color)], center=(cx, cy), p=p, s=s, o=o)


def bowl_layer(c, name, k, ox, oy, color, w, draw, squash_t=None):
    base = (ox, oy + 30 * k)  # squash from the bottom of the bowl
    s = 100
    if squash_t is not None:
        t = squash_t
        s = anim([(t, [100, 100, 100], 'settle'), (t + 3, [104, 94, 100], 'settle'), (t + 8, [99, 101, 100], 'settle'), (t + 12, [100, 100, 100], None)])
    return c.layer(name, [group([bowl_shape(k, ox, oy), trim(draw), stroke(color, w)], 'Bowl')], center=base, s=s)


def comp(name, w, h, op, layers):
    return {'v': '5.7.4', 'fr': FR, 'ip': 0, 'op': op, 'w': w, 'h': h, 'nm': name, 'ddd': 0, 'assets': [], 'layers': layers.finish(op), 'markers': []}


# ---------- 1. The mark (app icon) ----------
def mark():
    S = 480; k = 4
    c = Comp()
    tile = group([{'ty': 'rc', 'd': 1, 'p': static([240, 240]), 's': static([480, 480]), 'r': static(120), 'nm': 'Tile'}, fill(BLUE)], 'Tile')
    c.layer('Tile', [tile], center=(240, 240), s=scale_keys([(0, 72, 'pop'), (11, 100, None)]), o=anim([(0, 0, 'linear'), (5, 100, None)]))
    bowl_layer(c, 'Bowl', k, 240, 240, WHITE, 15 * k, anim([(5, 0, 'standard'), (21, 100, None)]), squash_t=33)
    c.layer('Ripple', [ring(240, 244, anim([(36, [104, 104], 'entrance'), (54, [190, 190], None)]), GREEN, 6, anim([(0, 0, 'hold'), (36, 70, 'linear'), (54, 0, None)]))], center=(240, 244))
    coin_drop(c, 'Coin', 240, 244, 104, GREEN, 19, 33, -70)
    return comp('Ujira mark', S, S, 81, c)


# ---------- 2. Landing: money sent (one coin per M-Pesa payment) ----------
def landing():
    S = 192; k = 1.3; cx, cy = 96, 100
    coin_y = cy + (61 - 60) * k
    c = Comp()
    c.layer('Disc', [disc(96, 96, 192, NAVY)], center=(96, 96), s=scale_keys([(0, 0, 'pop'), (10, 100, None)]))
    bowl_layer(c, 'Bowl', k, cx, cy, WHITE, 15 * k, anim([(4, 0, 'standard'), (16, 100, None)]), squash_t=22)
    coin_drop(c, 'coin-1', cx, coin_y, 26 * k, GREEN, 13, 22, -30)
    coin_drop(c, 'coin-2', cx, coin_y, 26 * k, GREEN, 25, 34, -30)
    # check badge, top right
    bx, by = 160, 34
    badge = c.layer('Badge', [disc(bx, by, 52, WHITE)], center=(bx, by), s=scale_keys([(40, 0, 'pop'), (48, 100, None)]))
    tick = [[bx - 11, by + 1], [bx - 3, by + 9], [bx + 12, by - 8]]
    c.layer('Tick', [group([{'ty': 'sh', 'nm': 'Tick', 'ks': static({'c': False, 'v': tick, 'i': [[0, 0]] * 3, 'o': [[0, 0]] * 3})},
                            trim(anim([(44, 0, 'standard'), (52, 100, None)])), stroke('#127A55', 7)], 'Tick')], center=(bx, by))
    return comp('Ujira landing', S, S, 66, c)


# ---------- 3. Received: money in ----------
def received():
    S = 256; k = 1.3; cx, cy = 128, 132
    c = Comp()
    c.layer('Disc', [disc(128, 128, 192, GREEN)], center=(128, 128), s=scale_keys([(0, 0, 'pop'), (10, 100, None)]))
    bowl_layer(c, 'Bowl', k, cx, cy, NAVY, 15 * k, anim([(4, 0, 'standard'), (16, 100, None)]), squash_t=24)
    coin_drop(c, 'Coin', cx, cy + 1.3, 26 * k, WHITE, 14, 24, -40)
    import math
    rays = []
    for n in range(8):
        a = math.radians(n * 45 - 90 + 22.5)
        r1, r2 = 108, 126
        rays.append(line(128 + r1 * math.cos(a), 128 + r1 * math.sin(a), 128 + r2 * math.cos(a), 128 + r2 * math.sin(a), GREEN, 6,
                         (anim([(26, 0, 'standard'), (40, 100, None)]), anim([(24, 0, 'entrance'), (34, 100, None)]))))
    c.layer('Burst', rays, center=(128, 128), o=anim([(24, 100, 'linear'), (40, 100, 'linear'), (44, 0, None)]))
    return comp('Ujira received', S, S, 60, c)


for fn, name in [(mark, 'ujira-mark'), (landing, 'ujira-landing'), (received, 'ujira-received')]:
    data = fn()
    json.dump(data, open(f'{name}.json', 'w'), separators=(',', ':'))
    print(name, len(json.dumps(data, separators=(',', ':'))), 'bytes,', data['op'], 'frames')
