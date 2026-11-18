"""Shared helpers for the Ujira motion build. Run build.py from site/lab/ujira/motion/ with this folder on PYTHONPATH."""
"""Tiny helpers for writing Lottie (bodymovin 5.7) JSON by hand: vector shapes, keyframes, precomps."""

EASE = {
    'entrance': ((0, 0), (0.3, 1)),      # Carbon expressive entrance
    'standard': ((0.2, 0), (0.38, 0.9)),  # Carbon productive standard
    'exit': ((0.2, 0), (1, 0.9)),
    'linear': ((0, 0), (1, 1)),
}


def hexc(h, a=1):
    h = h.lstrip('#')
    return [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)] + [a]


def static(v):
    return {'a': 0, 'k': v}


def anim(keys):
    """keys: list of (frame, value, ease_name). The ease applies from that key to the next one."""
    out = []
    for n, (t, v, e) in enumerate(keys):
        v = v if isinstance(v, list) else [v]
        k = {'t': t, 's': v}
        if n < len(keys) - 1:
            if e == 'hold':
                k['h'] = 1
            else:
                (ox, oy), (ix, iy) = EASE[e or 'standard']
                k['o'] = {'x': [ox], 'y': [oy]}
                k['i'] = {'x': [ix], 'y': [iy]}
        out.append(k)
    return {'a': 1, 'k': out}


def prop(v):
    return v if isinstance(v, dict) else static(v)


def tr(o=100):
    return {'ty': 'tr', 'p': static([0, 0]), 'a': static([0, 0]), 's': static([100, 100]), 'r': static(0),
            'o': prop(o), 'sk': static(0), 'sa': static(0), 'nm': 'Transform'}


def fill(color, o=100):
    c = color if isinstance(color, dict) else static(hexc(color) if isinstance(color, str) else color)
    return {'ty': 'fl', 'c': c, 'o': prop(o), 'r': 1, 'nm': 'Fill'}


def stroke(color, w, o=100):
    c = color if isinstance(color, dict) else static(hexc(color))
    return {'ty': 'st', 'c': c, 'o': prop(o), 'w': prop(w), 'lc': 2, 'lj': 2, 'ml': 4, 'nm': 'Stroke'}


def group(items, name='Group', o=100):
    return {'ty': 'gr', 'nm': name, 'it': items + [tr(o)]}


def rect(x, y, w, h, color, r=4, o=100, name='Rect'):
    """Top-left x, y in layer space."""
    return group([{'ty': 'rc', 'd': 1, 'p': static([x + w / 2, y + h / 2]), 's': static([w, h]), 'r': static(r), 'nm': 'Shape'},
                  fill(color)], name, o)


def circle(cx, cy, d, color=None, line=None, lw=0, o=100, name='Circle'):
    items = [{'ty': 'el', 'd': 1, 'p': static([cx, cy]), 's': static([d, d]), 'nm': 'Shape'}]
    if line:
        items.append(stroke(line, lw))
    if color:
        items.append(fill(color))
    return group(items, name, o)


def path(points, color, w, closed=False, trim_end=None, name='Path', o=100):
    v = [list(p) for p in points]
    items = [{'ty': 'sh', 'nm': 'Shape', 'ks': static({'c': closed, 'v': v, 'i': [[0, 0]] * len(v), 'o': [[0, 0]] * len(v)})}]
    if trim_end is not None:
        items.append({'ty': 'tm', 's': static(0), 'e': prop(trim_end), 'o': static(0), 'm': 1, 'nm': 'Trim'})
    items.append(stroke(color, w))
    return group(items, name, o)


class Comp:
    def __init__(self):
        self.layers = []  # bottom to top

    def layer(self, name, shapes, center=(0, 0), o=100, p=None, s=100, parent=None, ip=0, op=None):
        ind = len(self.layers) + 1
        cx, cy = center
        L = {'ddd': 0, 'ind': ind, 'ty': 4, 'nm': name, 'sr': 1, 'ao': 0, 'bm': 0, 'st': 0, 'ip': ip, 'op': op,
             'ks': {'o': prop(o), 'r': static(0), 'p': prop(p if p is not None else [cx, cy, 0]),
                    'a': static([cx, cy, 0]), 's': prop(s if isinstance(s, dict) else [s, s, 100])},
             'shapes': shapes}
        if parent:
            L['parent'] = parent
        self.layers.append(L)
        return ind

    def finish(self, op):
        out = []
        for L in self.layers:
            if L['op'] is None:
                L['op'] = op
            out.append(L)
        return list(reversed(out))  # Lottie lists the top layer first


def scale_keys(keys):
    """[(t, pct, ease)] -> animated scale [pct, pct, 100]."""
    return anim([(t, [v, v, 100], e) for t, v, e in keys])


def pos_keys(keys):
    return anim([(t, [x, y, 0], e) for t, (x, y), e in keys])
