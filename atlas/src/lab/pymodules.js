// The Python modules the Atlas installs beside the learner's code: atlas.plot
// (a small pyplot-like bridge the Atlas draws itself) and atlas._mpl (the
// Matplotlib theme and the hand-off of open figures). Shared by the browser
// worker and the headless code test, so both run programs in the same world.

export const PLOT_MODULE = `
"""atlas.plot — a small pyplot-like plotting bridge drawn by the Atlas itself
(themed, crisp, quick to load). For anything more, import matplotlib.pyplot.

It mirrors pyplot's most common calls: plot, scatter, xlabel, ylabel, title,
legend, grid, axhline, axvline, xlim, ylim, figure and show.
"""
import json as _json, math as _math

_figs = []
_cur = None

def _fig():
    global _cur
    if _cur is None:
        _cur = {"series": [], "title": "", "xlabel": "", "ylabel": "", "legend": False, "grid": True, "hlines": [], "vlines": [], "xlim": None, "ylim": None}
    return _cur

def _floats(seq):
    out = []
    for v in seq:
        try:
            f = float(v)
            out.append(f if _math.isfinite(f) else None)
        except (TypeError, ValueError):
            out.append(None)
    return out

def figure(title=None):
    show()
    if title:
        _fig()["title"] = str(title)

def plot(x, y=None, label=None, style="-", color=None):
    if y is None:
        y = list(x); x = list(range(len(y)))
    _fig()["series"].append({"kind": "line", "x": _floats(x), "y": _floats(y), "label": label, "dash": "--" in style or ":" in style, "color": color})

def scatter(x, y, label=None, color=None):
    _fig()["series"].append({"kind": "scatter", "x": _floats(x), "y": _floats(y), "label": label, "color": color})

def xlabel(s): _fig()["xlabel"] = str(s)
def ylabel(s): _fig()["ylabel"] = str(s)
def title(s): _fig()["title"] = str(s)
def legend(): _fig()["legend"] = True
def grid(on=True): _fig()["grid"] = bool(on)
def axhline(y=0.0): _fig()["hlines"].append(float(y))
def axvline(x=0.0): _fig()["vlines"].append(float(x))
def xlim(a, b): _fig()["xlim"] = [float(a), float(b)]
def ylim(a, b): _fig()["ylim"] = [float(a), float(b)]

def show():
    global _cur
    if _cur is not None and _cur["series"]:
        _figs.append(_cur)
    _cur = None

def _take():
    show()
    out = _json.dumps(_figs)
    _figs.clear()
    return out
`;

// Matplotlib, themed to match the Atlas, and the hand-off of its open figures.
export const MPL_MODULE = `
import io as _io, base64 as _b64, json as _json, sys as _sys

_DARK = {"figure.facecolor": "#0e1526", "axes.facecolor": "#0e1526", "savefig.facecolor": "#0e1526",
         "axes.edgecolor": "#4b5873", "axes.labelcolor": "#aab6ca", "text.color": "#e7edf7",
         "xtick.color": "#aab6ca", "ytick.color": "#aab6ca", "grid.color": "#25304a", "legend.facecolor": "#121b30",
         "legend.edgecolor": "#25304a"}
_LIGHT = {"figure.facecolor": "#ffffff", "axes.facecolor": "#ffffff", "savefig.facecolor": "#ffffff",
          "axes.edgecolor": "#97a3b8", "axes.labelcolor": "#3d4a63", "text.color": "#0d1628",
          "xtick.color": "#3d4a63", "ytick.color": "#3d4a63", "grid.color": "#e3e8f1"}

def style(dark):
    import matplotlib
    from cycler import cycler
    matplotlib.rcParams.update(_DARK if dark else _LIGHT)
    matplotlib.rcParams.update({"axes.prop_cycle": cycler(color=["#5c9dff", "#f3b74f", "#38d39f", "#b38cff", "#ff6b7d", "#33c4b4", "#f2c14e"]),
                                "figure.figsize": (7.0, 4.2), "figure.dpi": 100, "axes.grid": True, "grid.linewidth": 0.6,
                                "font.size": 10.5, "axes.spines.top": False, "axes.spines.right": False})

def take():
    if "matplotlib.pyplot" not in _sys.modules:
        return "[]"
    plt = _sys.modules["matplotlib.pyplot"]
    out = []
    for n in plt.get_fignums():
        buf = _io.BytesIO()
        plt.figure(n).savefig(buf, format="png", dpi=110, bbox_inches="tight")
        out.append("data:image/png;base64," + _b64.b64encode(buf.getvalue()).decode())
    plt.close("all")
    return _json.dumps(out)
`;
