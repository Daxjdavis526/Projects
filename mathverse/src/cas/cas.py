# MathVerse's computer-algebra service, run by Pyodide in a Web Worker.
# Every request arrives as an expression already re-printed by MathVerse's own
# parser (never the user's raw text) and is parsed here with parse_expr against
# an explicit table of names: user symbols are v_<name> → Symbol('<name>'), and
# only SymPy's mathematical functions are visible. Results come back as JSON:
# LaTeX for display, a plain form MathVerse can re-parse, and step lists.

import json
import re
import sympy as sp
from sympy.parsing.sympy_parser import parse_expr, standard_transformations
from sympy.integrals.manualintegrate import integral_steps, manualintegrate

_FUNCS = {name: getattr(sp, name) for name in (
    'sin cos tan sec csc cot asin acos atan sinh cosh tanh asinh acosh atanh exp log sqrt cbrt Abs sign '
    'floor ceiling Heaviside erf gamma factorial atan2 Min Max Mod Rational Matrix pi E oo'.split())}
_FUNCS['log10'] = lambda x: sp.log(x, 10)
_FUNCS['log2'] = lambda x: sp.log(x, 2)


def _parse(src, names):
    table = dict(_FUNCS)
    for n in names:
        table['v_' + n] = sp.Symbol(n, real=True)
    # global_dict holds only what we allow; no builtins
    return parse_expr(src, local_dict=table, global_dict={'__builtins__': {}, 'Integer': sp.Integer, 'Float': sp.Float, 'Symbol': sp.Symbol},
                      transformations=standard_transformations, evaluate=True)


def _plain(e):
    s = sp.sstr(e, order='lex')
    s = (s.replace('**', '^').replace('Abs(', 'abs(').replace('ceiling(', 'ceil(')
         .replace('Heaviside(', 'heaviside(').replace('Min(', 'min(').replace('Max(', 'max('))
    # whole-word constants only: E → e, oo → inf (never inside a longer name)
    return re.sub(r'\boo\b', 'inf', re.sub(r'\bE\b', 'e', s))


def _out(e):
    return {'latex': sp.latex(e), 'text': _plain(e), 'numeric': _is_float(e)}


def _is_float(e):
    try:
        return any(isinstance(a, sp.Float) for a in sp.preorder_traversal(e))
    except Exception:
        return False


# ── step-by-step integration, from SymPy's own rule tree ─────────────────────

def _rule_name(rule):
    return type(rule).__name__.replace('Rule', '')


def _describe(rule, depth=0):
    """Turn a manualintegrate rule tree into readable steps."""
    name = _rule_name(rule)
    steps = []
    integrand = getattr(rule, 'integrand', None)
    var = getattr(rule, 'variable', None)
    head = (r'\int ' + sp.latex(integrand) + r'\,d' + sp.latex(var)) if integrand is not None else ''
    def add(title, detail='', tex=''):
        steps.append({'depth': depth, 'rule': name, 'title': title, 'detail': detail, 'tex': tex or head})
    if name == 'Constant':
        add('Integrate a constant', 'The integral of a constant c is c·x.')
    elif name == 'ConstantTimes':
        add('Pull the constant out', f'Constants factor out of the integral: ∫c·f = c·∫f, with c = {sp.sstr(rule.constant)}.')
        steps += _describe(rule.substep, depth + 1)
    elif name == 'Power':
        add('Power rule', 'For n ≠ −1, ∫xⁿ dx = xⁿ⁺¹/(n + 1).')
    elif name in ('Exp',):
        add('Exponential', 'The integral of aˣ is aˣ/ln a; of eˣ, eˣ itself.')
    elif name == 'ReciprocalRule' or name == 'Reciprocal':
        add('Reciprocal', '∫ 1/u du = ln|u|.')
    elif name == 'Add':
        add('Split the sum', 'The integral of a sum is the sum of the integrals.')
        for s in rule.substeps:
            steps += _describe(s, depth + 1)
    elif name == 'URule' or name == 'U':
        add('Substitution', f'Let u = {sp.sstr(rule.u_func)}; then du = ({sp.sstr(sp.diff(rule.u_func, var))}) d{var}.',
            rf'u = {sp.latex(rule.u_func)},\quad du = {sp.latex(sp.diff(rule.u_func, var))}\,d{sp.latex(var)}')
        steps += _describe(rule.substep, depth + 1)
    elif name == 'Parts':
        add('Integration by parts', f'Choose u = {sp.sstr(rule.u)} and dv = {sp.sstr(rule.dv)} d{var}: ∫u dv = uv − ∫v du.',
            rf'u = {sp.latex(rule.u)},\quad dv = {sp.latex(rule.dv)}\,d{sp.latex(var)}')
        steps += _describe(rule.v_step, depth + 1)
        steps += _describe(rule.second_step, depth + 1) if rule.second_step else []
    elif name == 'CyclicParts':
        add('Integration by parts, twice', 'Parts brings the original integral back; solve the resulting equation for it.')
    elif name in ('Trig', 'Sin', 'Cos', 'Sec', 'Csc', 'SecTan', 'CscCot', 'Tan', 'Cot'):
        add('A standard trigonometric integral', 'Read from the table of derivatives backwards.')
    elif name == 'TrigSubstitution':
        add('Trigonometric substitution', f'Substitute {sp.sstr(rule.theta)} via x = {sp.sstr(rule.func)}, which turns the square root into a trigonometric function.',
            rf'x = {sp.latex(rule.func)}')
        steps += _describe(rule.substep, depth + 1)
    elif name == 'Rewrite':
        add('Rewrite the integrand', f'Rewrite it as {sp.sstr(rule.rewritten)}.', sp.latex(rule.rewritten))
        steps += _describe(rule.substep, depth + 1)
    elif name == 'PartialFractions' or name == 'PiecewiseRule':
        add('Partial fractions', 'Split the rational function into simpler fractions.')
    elif name in ('Arctan', 'ArcsinRule', 'Arcsin', 'ArcsinhRule', 'Arcsinh', 'Arccosh'):
        add('An inverse-trigonometric form', 'The integrand is the derivative of an inverse trigonometric (or hyperbolic) function.')
    elif name == 'DontKnow':
        add('No elementary method found', 'SymPy’s rule-based integrator could not finish; the full algorithm (risch) is tried for the answer.')
    else:
        add(name, '')
        for attr in ('substep', 'substeps'):
            sub = getattr(rule, attr, None)
            if sub is None:
                continue
            for s in (sub if isinstance(sub, (list, tuple)) else [sub]):
                steps += _describe(s, depth + 1)
    return steps


# ── the operations ───────────────────────────────────────────────────────────

def op_integrate(expr, names, var, a=None, b=None):
    x = sp.Symbol(var, real=True)
    f = _parse(expr, names)
    steps = []
    try:
        steps = _describe(integral_steps(f, x))
    except Exception:
        steps = []
    F = manualintegrate(f, x)
    if F.has(sp.Integral) or not F:
        F = sp.integrate(f, x)
    res = {'antiderivative': _out(sp.simplify(F)) if not F.has(sp.Integral) else None, 'steps': steps}
    if a is not None and b is not None:
        A, B = _parse(a, names), _parse(b, names)
        val = sp.integrate(f, (x, A, B))
        res['definite'] = None if val.has(sp.Integral) else _out(val)
        if res['definite'] is not None:
            try:
                res['definite']['value'] = float(sp.N(val, 17))
            except Exception:
                res['definite']['value'] = None
    return res


def op_diff(expr, names, var, order=1):
    f = _parse(expr, names)
    x = sp.Symbol(var, real=True)
    return {'result': _out(sp.simplify(sp.diff(f, x, order)))}


def op_simplify(expr, names):
    f = _parse(expr, names)
    return {'simplified': _out(sp.simplify(f)), 'factored': _out(sp.factor(f)), 'expanded': _out(sp.expand(f))}


def op_apart(expr, names, var):
    f = _parse(expr, names)
    x = sp.Symbol(var, real=True)
    return {'result': _out(sp.apart(sp.together(f), x))}


def op_series(expr, names, var, a, n):
    f = _parse(expr, names)
    x = sp.Symbol(var, real=True)
    A = _parse(a, names)
    s = sp.series(f, x, A, n).removeO()
    terms = [ _out(t) for t in sp.Add.make_args(sp.expand(s)) ]
    return {'polynomial': _out(s), 'terms': terms}


def op_limit(expr, names, var, a, direction='+-'):
    f = _parse(expr, names)
    x = sp.Symbol(var, real=True)
    return {'result': _out(sp.limit(f, x, _parse(a, names), dir=direction))}


def op_solve(expr, names, var):
    f = _parse(expr, names)
    x = sp.Symbol(var, real=True)
    sols = sp.solve(sp.Eq(f, 0), x, dict=False)
    return {'solutions': [_out(s) for s in sols]}


def op_dsolve(rhs, names, dep, var, order, ics):
    t = sp.Symbol(var, real=True)
    y = sp.Function(dep)
    table_names = [n for n in names if n not in (dep, dep + '_p')]
    f = _parse(rhs, table_names + [dep, dep + '_p', var])
    Y, YP = sp.Symbol(dep, real=True), sp.Symbol(dep + '_p', real=True)
    f = f.subs({Y: y(t), YP: y(t).diff(t)})
    eq = sp.Eq(y(t).diff(t, order), f)
    ic = {}
    if ics:
        t0 = sp.nsimplify(ics['t0'])
        ic[y(t0)] = sp.nsimplify(ics['y0'])
        if order == 2 and 'v0' in ics:
            ic[y(t).diff(t).subs(t, t0)] = sp.nsimplify(ics['v0'])
    sol = sp.dsolve(eq, y(t), ics=ic or None)
    return {'solution': _out(sol.rhs), 'classification': list(sp.classify_ode(eq, y(t)))[:4]}


def op_eigen(matrix, names):
    M = _parse(matrix, names)
    out = []
    for val, mult, vecs in M.eigenvects():
        out.append({'value': _out(val), 'multiplicity': int(mult), 'vectors': [[_out(c) for c in v] for v in vecs]})
    return {'eigen': out, 'charpoly': _out(M.charpoly().as_expr()), 'det': _out(M.det())}


OPS = {'integrate': op_integrate, 'diff': op_diff, 'simplify': op_simplify, 'apart': op_apart, 'series': op_series,
       'limit': op_limit, 'solve': op_solve, 'dsolve': op_dsolve, 'eigen': op_eigen}


def handle(request_json):
    req = json.loads(request_json)
    op = OPS.get(req.get('op'))
    if op is None:
        return json.dumps({'ok': False, 'error': 'unknown operation'})
    try:
        return json.dumps({'ok': True, **op(**req['args'])})
    except Exception as e:
        return json.dumps({'ok': False, 'error': f'{type(e).__name__}: {e}'})
