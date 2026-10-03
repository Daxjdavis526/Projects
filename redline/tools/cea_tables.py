#!/usr/bin/env python3
"""Generate REDLINE's combustion tables from NASA CEA.

    pip install numpy rocketcea      (RocketCEA builds NASA's CEA Fortran:
                                      it needs gfortran)
    python3 redline/tools/cea_tables.py

writes redline/src/physics/cea-lox-ethanol.js. The browser never runs CEA:
it reads these tables, so there is still no build step — this script is how
the numbers were made, and how to remake them.

Propellants: liquid oxygen at its normal boiling point (90.18 K) and liquid
ethanol, C2H5OH, at 298.15 K, as RocketCEA's 'LOX' and 'Ethanol' define
them. For each mixture ratio and chamber pressure, CEA's equilibrium
combustion gives the characteristic velocity c*, the chamber temperature,
the molecular weight of the products and their isentropic exponent
(CEA's 'gamma_s', the one consistent with its c*).

Two tables:

  MAIN  full chemical equilibrium — the main chambers, MR 0.2 to 8.
  GG    the gas generator's fuel-rich range, with methane and solid carbon
        OMITTED from the products. Full equilibrium that fuel-rich forms
        soot and methane, which releases heat and holds the temperature
        above ~1000 K at any mixture ratio; in a real gas generator that
        chemistry is far too slow to happen in the time the gas spends
        there, and suppressing those two species is the usual way to make
        CEA approximate it. It is still an approximation: the measured
        temperature of a real fuel-rich gas generator is set by kinetics,
        and is what its tests say it is.

RocketCEA caches results per process, so each table is computed in a
subprocess of its own.
"""
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'src', 'physics', 'cea-lox-ethanol.js')

PC_BAR = [2, 5, 10, 20, 35, 60]
MR_MAIN = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9,
           2.0, 2.2, 2.4, 2.6, 2.8, 3.0, 3.5, 4.0, 5.0, 6.0, 8.0]
MR_GG = [0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.7, 0.8, 0.9, 1.0, 1.2, 1.5]
OMIT_GG = 'CH4 C(gr)'
R_UNIV = 8314.46


def compute(mrs, omit):
    """One table, in this process: {cstar, tc, mw, gamma}[pc][mr]."""
    import rocketcea.cea_obj as co
    from rocketcea.cea_obj_w_units import CEA_Obj

    if omit:
        # add CEA's own 'omit' card to the deck, right after the o/f line
        orig = co.set_py_cea_line
        state = {'after_of': False}

        def patched(n, line):
            if line.startswith(' o/f='):
                state['after_of'] = True
                return orig(n, line)
            if state['after_of'] and line.strip() == '':
                state['after_of'] = False
                return orig(n, 'omit ' + omit + '  ')
            return orig(n, line)
        co.set_py_cea_line = patched

    cea = CEA_Obj(oxName='LOX', fuelName='Ethanol', pressure_units='bar', cstar_units='m/s', temperature_units='K')
    out = {k: [] for k in ('cstar', 'tc', 'mw', 'gamma')}
    for pc in PC_BAR:
        row = {k: [] for k in out}
        for mr in mrs:
            row['cstar'].append(round(cea.get_Cstar(Pc=pc, MR=mr), 1))
            row['tc'].append(round(cea.get_Tcomb(Pc=pc, MR=mr), 1))
            mw, gam = cea.get_Chamber_MolWt_gamma(Pc=pc, MR=mr, eps=2.0)
            row['mw'].append(round(mw, 3))
            row['gamma'].append(round(gam, 4))
        for k in out:
            out[k].append(row[k])
    return out


def check(table, mrs):
    """c* = sqrt(R·Tc)/Γ(γ) must hold for every point, or the chamber model
    (which builds its gas from c* and γ) would not reproduce CEA's Tc."""
    worst = 0.0
    for i in range(len(PC_BAR)):
        for j in range(len(mrs)):
            g, T, M, cs = table['gamma'][i][j], table['tc'][i][j], table['mw'][i][j], table['cstar'][i][j]
            Gam = (g ** 0.5) * (2 / (g + 1)) ** ((g + 1) / (2 * (g - 1)))
            worst = max(worst, abs(((R_UNIV / M) * T) ** 0.5 / Gam / cs - 1))
    return worst


def main():
    if len(sys.argv) > 1 and sys.argv[1] == '--one':
        which = sys.argv[2]
        res = compute(MR_MAIN, None) if which == 'main' else compute(MR_GG, OMIT_GG)
        print('JSON' + json.dumps(res))
        return
    tables = {}
    for which in ('main', 'gg'):
        p = subprocess.run([sys.executable, __file__, '--one', which], capture_output=True, text=True, check=True)
        line = next(l for l in p.stdout.splitlines() if l.startswith('JSON'))
        tables[which] = json.loads(line[4:])
    import rocketcea
    ver = getattr(rocketcea, '__version__', '?')
    errs = {'main': check(tables['main'], MR_MAIN), 'gg': check(tables['gg'], MR_GG)}
    fmt = lambda rows: '[\n' + ',\n'.join('    [' + ', '.join(f'{v:g}' for v in r) + ']' for r in rows) + ',\n  ]'
    block = lambda name, mrs, t, note: (
        f'/* {note} */\n'
        f'export const {name} = {{\n'
        f'  pc: [{", ".join(f"{p:g}" for p in PC_BAR)}],   // bar abs\n'
        f'  mr: [{", ".join(f"{m:g}" for m in mrs)}],\n'
        f'  cstar: {fmt(t["cstar"])},   // m/s\n'
        f'  tc: {fmt(t["tc"])},   // K\n'
        f'  mw: {fmt(t["mw"])},   // kg/kmol\n'
        f'  gamma: {fmt(t["gamma"])},\n'
        f'}};\n')
    js = (
        '/* GENERATED by redline/tools/cea_tables.py from NASA CEA (RocketCEA '
        f'{ver}) — do not edit by hand.\n\n'
        '   LOX (O2(L), 90.18 K) / ethanol (C2H5OH(L), 298.15 K), equilibrium\n'
        '   combustion. Rows are chamber pressures (pc, bar abs), columns mixture\n'
        '   ratios (mr, oxidiser/fuel by mass). gamma is CEA\'s isentropic exponent\n'
        '   for the equilibrium products, consistent with its c*: c* = √(R·Tc)/Γ(γ)\n'
        f'   holds to {100 * errs["main"]:.2f} % (main) and {100 * errs["gg"]:.2f} % (gas generator). */\n\n'
        + block('CEA_MAIN', MR_MAIN, tables['main'], 'Main chambers: full chemical equilibrium.')
        + '\n'
        + block('CEA_GG', MR_GG, tables['gg'], f'Gas generator, fuel-rich: equilibrium with {OMIT_GG} omitted (see the generator).')
    )
    with open(OUT, 'w') as f:
        f.write(js)
    print(f'wrote {os.path.normpath(OUT)} (c* consistency: main {errs["main"]:.4f}, gg {errs["gg"]:.4f})')


if __name__ == '__main__':
    main()
