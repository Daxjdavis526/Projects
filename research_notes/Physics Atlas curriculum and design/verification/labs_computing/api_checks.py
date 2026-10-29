import warnings, importlib, inspect, re
import numpy as np, scipy, sympy, matplotlib
print("versions: numpy", np.__version__, "| scipy", scipy.__version__, "| sympy", sympy.__version__, "| matplotlib", matplotlib.__version__)
def has(modname, attr):
    try:
        m = importlib.import_module(modname)
    except Exception as e:
        return f"module import failed: {type(e).__name__}"
    with warnings.catch_warnings(record=True) as w:
        warnings.simplefilter("always")
        ok = hasattr(m, attr)
        try:
            getattr(m, attr) if ok else None
        except Exception as e:
            return f"getattr error {e}"
        msgs = [str(x.message)[:140] for x in w]
    return ("PRESENT" if ok else "ABSENT") + (f" (warn: {msgs})" if msgs else "")
checks = [("numpy","trapz"),("numpy","trapezoid"),("numpy","polyfit"),("numpy.polynomial","Polynomial"),
          ("scipy.integrate","simps"),("scipy.integrate","simpson"),("scipy.integrate","trapz"),("scipy.integrate","trapezoid"),
          ("scipy.integrate","cumtrapz"),("scipy.integrate","cumulative_trapezoid"),("scipy.integrate","odeint"),("scipy.integrate","solve_ivp"),
          ("scipy.integrate","quad"),("scipy.integrate","romberg"),("scipy.misc","derivative"),("scipy.differentiate","derivative"),
          ("scipy.signal","tukey"),("scipy.signal.windows","tukey"),("scipy.signal","welch"),("scipy.signal","find_peaks"),("scipy.signal","lombscargle"),
          ("scipy.optimize","curve_fit"),("scipy.optimize","least_squares"),("scipy.optimize","root_scalar"),("scipy.optimize","brentq"),("scipy.optimize","minimize"),
          ("matplotlib.mlab","psd"),("scipy.stats","chi2"),("scipy.stats","poisson"),("scipy.special","ellipk")]
for m,a in checks: print(f"{m}.{a}: {has(m,a)}")
# scipy.odr status
with warnings.catch_warnings(record=True) as w:
    warnings.simplefilter("always")
    try:
        import scipy.odr as odr; print("scipy.odr import OK; ODR present:", hasattr(odr,"ODR"), "| warnings:", [str(x.message)[:200] for x in w])
    except Exception as e: print("scipy.odr import failed:", e)
from scipy.optimize import curve_fit
doc = curve_fit.__doc__
i = doc.find("absolute_sigma"); print("\ncurve_fit absolute_sigma doc:\n", re.sub(r"\s+"," ",doc[i:i+900]))
from scipy.integrate import solve_ivp
d = solve_ivp.__doc__; i = d.find("method :"); print("\nsolve_ivp methods doc:\n", re.sub(r"\s+"," ",d[i:i+1500]))
d = np.polyfit.__doc__; i = d.find("cov :"); print("\nnp.polyfit cov doc:\n", re.sub(r"\s+"," ",d[i:i+700]))
from scipy.special import ellipk
d = ellipk.__doc__; print("\nellipk doc head:\n", re.sub(r"\s+"," ",d[:600]))
import scipy.constants as C
mdoc = C.__doc__ or ""; j = mdoc.find("CODATA"); print("\nscipy.constants doc CODATA mention:", re.sub(r"\s+"," ",mdoc[max(0,j-200):j+300]))
import scipy.constants._codata as cod
print("codata module attrs w/ year:", [a for a in dir(cod) if re.search(r"20\d\d", a)][:12])
for k in ["elementary charge","electron mass","electron charge to mass quotient","Planck constant","Planck constant in eV/Hz","speed of light in vacuum",
          "Newtonian constant of gravitation","Boltzmann constant","Stefan-Boltzmann constant","Wien wavelength displacement law constant",
          "Bohr magneton","Bohr magneton in Hz/T","proton gyromag. ratio in MHz/T","shielded proton gyromag. ratio in MHz/T","electron g factor",
          "Avogadro constant","molar gas constant","vacuum mag. permeability","electron mass energy equivalent in MeV","Rydberg constant","fine-structure constant","atomic mass constant"]:
    try:
        v,u,s = C.physical_constants[k]; print(f"  {k}: {v!r} {u} (std unc {s})")
    except KeyError: print("  MISSING", k)
