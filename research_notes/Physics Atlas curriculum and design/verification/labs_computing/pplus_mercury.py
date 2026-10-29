import sys, numpy as np
from scipy import integrate
from scipy.optimize import minimize_scalar
from scipy.integrate import solve_ivp
pplus = sys.argv[1]
print("GW timing correction: H1 peak 1126259478.4395-16 = 1126259462.4395; L1 1126259462.4324; dt(L1-H1) = %.1f ms" % ((1126259478.4324-1126259478.4395)*1e3))
d = np.genfromtxt(pplus, names=True, dtype=None, encoding="utf-8")
cid = d["CID"]; print("rows:", len(d), "unique CID:", len(set(cid)), "calibrators:", int((d["IS_CALIBRATOR"]==1).sum()), "| zHD range:", d["zHD"].min(), d["zHD"].max())
cal = d[d["IS_CALIBRATOR"]==1]
w = 1/cal["m_b_corr_err_DIAG"]**2
MB = np.sum(w*(cal["m_b_corr"]-cal["CEPH_DIST"]))/np.sum(w); uMB = 1/np.sqrt(np.sum(w))
print(f"M_B from Cepheid-calibrated SNe (weighted mean, diag errors): {MB:.3f} +/- {uMB:.3f} mag (N={len(cal)}, unique hosts SNe {len(set(cal['CID']))})")
m = (d["IS_CALIBRATOR"]==0)&(d["zHD"]>0.023)&(d["zHD"]<0.15)
hf = d[m]; c = 299792.458; q0, j0 = -0.55, 1.0
z = hf["zHD"]; zh = hf["zHEL"]
dlH0 = (c*z)*(1+0.5*(1-q0)*z-(1/6)*(1-q0-3*q0**2+j0)*z**2)*(1+zh)/(1+z)
mu = hf["m_b_corr"] - MB
l = np.log10(dlH0) - (mu-25)/5; wt = 1/hf["m_b_corr_err_DIAG"]**2
lH = np.sum(wt*l)/np.sum(wt); ul = np.sqrt(1/np.sum(wt)/25 + (uMB/5)**2)
print(f"Hubble flow 0.023<z<0.15 (N={len(hf)}): H0 = {10**lH:.2f} +/- {10**lH*np.log(10)*ul:.2f} km/s/Mpc (diag errors; stat incl. M_B)")
s = d[(d["zHD"]>0.01)&(d["IS_CALIBRATOR"]==0)]
zz, zhh, mb, em = s["zHD"], s["zHEL"], s["m_b_corr"], s["m_b_corr_err_DIAG"]
zg = np.linspace(0, zz.max()*1.01, 20001)
def chi2(Om):
    Dc = integrate.cumulative_trapezoid(1/np.sqrt(Om*(1+zg)**3+1-Om), zg, initial=0)
    mod = 5*np.log10((1+zhh)*np.interp(zz, zg, Dc)); W = 1/em**2
    off = np.sum(W*(mb-mod))/np.sum(W); return np.sum(W*(mb-mod-off)**2)
r = minimize_scalar(chi2, bounds=(0.05,0.8), method="bounded"); Oms = np.linspace(0.2,0.5,601); cs = np.array([chi2(o) for o in Oms]); ins = Oms[cs<r.fun+1]
print(f"flat LCDM z>0.01 (N={len(s)}): Om = {r.x:.3f} (dchi2=1: {ins.min():.3f}-{ins.max():.3f}); chi2/dof = {r.fun/(len(s)-2):.3f}")
print("\n== Mercury ==")
GM = 1.32712440018e20*(365.25*86400)**2/(1.495978707e11)**3
cA = 299792458*(365.25*86400)/1.495978707e11
a, e = 0.387098, 0.205630
P = 2*np.pi*np.sqrt(a**3/GM); dphi = 6*np.pi*GM/(cA**2*a*(1-e**2))
print(f"P={P*365.25:.3f} d; analytic dphi/orbit={dphi:.4e} rad = {dphi*206264.806:.4f} arcsec; per Julian century = {dphi*(100/P)*206264.806:.2f} arcsec")
def run(lam, norb=6):
    rp = a*(1-e); vp = np.sqrt(GM*(1+e)/(a*(1-e)))
    def f(t, y):
        x, yy, vx, vy = y; r2 = x*x+yy*yy; r = np.sqrt(r2); L = x*vy-yy*vx
        fac = -GM/(r2*r)*(1+lam*3*L*L/(cA**2*r2)); return [vx, vy, fac*x, fac*yy]
    def peri(t, y): return y[0]*y[2]+y[1]*y[3]
    peri.direction = 1
    sol = solve_ivp(f, (0, norb*P*1.02), [rp,0,0,vp], method="DOP853", rtol=1e-12, atol=1e-14, events=peri)
    ang = np.unwrap(np.arctan2(sol.y_events[0][:,1], sol.y_events[0][:,0]))
    return np.polyfit(np.arange(len(ang)), ang, 1)[0]
for lam in [1, 10, 100, 1000]:
    s_ = run(lam); print(f"lambda={lam:5d}: numeric/orbit={s_:.4e} rad; /lambda={s_/lam:.4e} vs analytic {dphi:.4e} (ratio {s_/lam/dphi:.4f})")
print("\n== Cavendish formula check: G = pi^2 b^2 d dS/(M L T^2) with dS=16.888 cm:", np.pi**2*0.0465**2*0.05*0.16888/(1.5*5*600**2))
