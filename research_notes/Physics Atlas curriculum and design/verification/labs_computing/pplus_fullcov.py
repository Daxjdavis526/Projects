import sys, numpy as np
from scipy import integrate
from scipy.optimize import minimize_scalar
d = np.genfromtxt(sys.argv[1], names=True, dtype=None, encoding="utf-8")
raw = np.loadtxt(sys.argv[2]); N = int(raw[0]); C = raw[1:].reshape(N, N)
print("cov N =", N, "| symmetric:", np.allclose(C, C.T))
for label, mask in [("z>0.01, all", d["zHD"]>0.01), ("z>0.01, non-calibrators", (d["zHD"]>0.01)&(d["IS_CALIBRATOR"]==0))]:
    idx = np.where(mask)[0]; Cs = C[np.ix_(idx, idx)]; Ci = np.linalg.inv(Cs)
    zz, zh, mb = d["zHD"][idx], d["zHEL"][idx], d["m_b_corr"][idx]
    zg = np.linspace(0, zz.max()*1.01, 20001); one = np.ones(len(idx))
    def chi2(Om):
        Dc = integrate.cumulative_trapezoid(1/np.sqrt(Om*(1+zg)**3+1-Om), zg, initial=0)
        r = mb - 5*np.log10((1+zh)*np.interp(zz, zg, Dc))
        off = (one@Ci@r)/(one@Ci@one); res = r - off
        return res@Ci@res
    best = minimize_scalar(chi2, bounds=(0.05, 0.8), method="bounded")
    Oms = np.linspace(0.25, 0.42, 341); cs = np.array([chi2(o) for o in Oms]); ins = Oms[cs < best.fun + 1]
    print(f"{label}: N={len(idx)}, Om={best.x:.3f} (dchi2=1: {ins.min():.3f}-{ins.max():.3f}), chi2/dof={best.fun/(len(idx)-2):.3f}")
