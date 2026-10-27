import sys, numpy as np, h5py
from scipy import signal, integrate
losc, pplus = sys.argv[1], sys.argv[2]
print("== GW150914 (LOSC tutorial files, 32 s @ 4096 Hz) ==")
def load(fn):
    with h5py.File(fn,"r") as f:
        s = f["strain/Strain"][...]; t0 = f["meta/GPSstart"][()]; dur = f["meta/Duration"][()]
        dt = f["strain/Strain"].attrs["Xspacing"]
    return s, t0, dur, dt
sH, t0, dur, dt = load(f"{losc}/H-H1_LOSC_4_V2-1126259446-32.hdf5")
sL, t0L, _, _ = load(f"{losc}/L-L1_LOSC_4_V2-1126259446-32.hdf5")
fs = int(round(1/dt)); time = t0 + np.arange(sH.size)*dt
print("GPSstart", t0, "duration", dur, "fs", fs, "N", sH.size, "| max |h| raw H1:", np.abs(sH).max())
with h5py.File(f"{losc}/GW150914_4_template.hdf5","r") as f:
    tp, tc = f["template"][...]
template = tp + 1j*tc
NFFT = 4*fs
datafreq = np.fft.fftfreq(template.size)*fs; df = abs(datafreq[1]-datafreq[0])
dwin = signal.windows.tukey(template.size, alpha=1/8)
tfft = np.fft.fft(template*dwin)/fs
tevent = 1126259462.44
res = {}
for det, data in [("H1", sH), ("L1", sL)]:
    freqs, psd = signal.welch(data, fs=fs, window="blackman", nperseg=NFFT, noverlap=NFFT//2)
    asd100 = np.sqrt(np.interp(100, freqs, psd)); asd200 = np.sqrt(np.interp(200, freqs, psd))
    dfft = np.fft.fft(data*dwin)/fs
    pv = np.interp(np.abs(datafreq), freqs, psd)
    opt = dfft*tfft.conjugate()/pv
    opt_t = 2*np.fft.ifft(opt)*fs
    sigma = np.sqrt(np.abs((tfft*tfft.conjugate()/pv).sum()*df))
    snrc = np.roll(opt_t/sigma, int(data.size/2)); snr = np.abs(snrc)
    etime = time + 16.0
    win = np.abs(etime - tevent) < 1.0
    i = np.argmax(np.where(win, snr, 0))
    ig = np.argmax(snr)
    res[det] = etime[i]
    print(f"{det}: ASD(100 Hz)={asd100:.2e}, ASD(200 Hz)={asd200:.2e} /rtHz; peak SNR within +/-1 s of event = {snr[i]:.2f} at GPS {etime[i]:.4f}; global max {snr[ig]:.2f} at {etime[ig]:.4f}; median |SNR| {np.median(snr):.2f}")
print(f"t(L1)-t(H1) = {(res['L1']-res['H1'])*1e3:.2f} ms")
# whitened+bandpassed peak strain-ish check of raw bandpassed (no whitening) amplitude
bb, ab = signal.butter(4, [43*2/fs, 300*2/fs], btype="band")
hbp = signal.filtfilt(bb, ab, sH)
sel = np.abs(time - tevent) < 0.2
print(f"H1 bandpassed (43-300 Hz, not whitened) max |h| within 0.2 s of event: {np.abs(hbp[sel]).max():.2e}")

print("\n== Pantheon+SH0ES.dat quick fits (DIAGONAL errors only; published analysis uses full covariance) ==")
import pandas as pd
d = pd.read_csv(pplus, sep=r"\s+", comment="#")
print("rows:", len(d), "unique CID:", d.CID.nunique(), "calibrators (IS_CALIBRATOR==1):", int((d.IS_CALIBRATOR==1).sum()), "| zHD range:", d.zHD.min(), d.zHD.max())
cal = d[d.IS_CALIBRATOR==1]
w = 1/cal.m_b_corr_err_DIAG**2
MB = np.sum(w*(cal.m_b_corr-cal.CEPH_DIST))/np.sum(w); uMB = 1/np.sqrt(np.sum(w))
print(f"M_B from Cepheid calibrators (weighted mean, diag): {MB:.3f} +/- {uMB:.3f} mag")
hf = d[(d.IS_CALIBRATOR==0)&(d.zHD>0.023)&(d.zHD<0.15)]
c = 299792.458; q0, j0 = -0.55, 1.0
z = hf.zHD.values
dl_H0 = (c*z)*(1+0.5*(1-q0)*z-(1/6)*(1-q0-3*q0**2+j0)*z**2)*(1+hf.zHEL.values)/(1+z)  # Mpc * H0
mu = hf.m_b_corr.values - MB
log10H0 = np.log10(dl_H0) - (mu-25)/5
wt = 1/hf.m_b_corr_err_DIAG.values**2
lH = np.sum(wt*log10H0)/np.sum(wt)
print(f"Hubble-flow SNe 0.023<z<0.15: N={len(hf)}, H0 = {10**lH:.2f} km/s/Mpc (stat-only diag, excluding M_B unc); with M_B unc: +/- {10**lH*np.log(10)*np.sqrt(1/np.sum(wt)/25*25/25 + (uMB/5)**2):.2f}")
from scipy.optimize import minimize_scalar
sel = d[(d.zHD>0.01)&(d.IS_CALIBRATOR==0)]
zz, zh, mb, em = sel.zHD.values, sel.zHEL.values, sel.m_b_corr.values, sel.m_b_corr_err_DIAG.values
zgrid = np.linspace(0, zz.max()*1.01, 20001)
def chi2(Om):
    Ez = np.sqrt(Om*(1+zgrid)**3 + 1-Om)
    Dc = integrate.cumulative_trapezoid(1/Ez, zgrid, initial=0)
    DL = (1+zh)*np.interp(zz, zgrid, Dc)
    mod = 5*np.log10(DL)
    W = 1/em**2; off = np.sum(W*(mb-mod))/np.sum(W)
    return np.sum(W*(mb-mod-off)**2)
r = minimize_scalar(chi2, bounds=(0.05,0.8), method="bounded")
cmin = r.fun; Oms = np.linspace(0.2,0.5,301); cs = np.array([chi2(o) for o in Oms]); inside = Oms[cs<cmin+1]
print(f"flat LCDM, z>0.01 non-calibrators N={len(sel)}: Omega_m best = {r.x:.3f} (Delta chi2=1 range {inside.min():.3f}-{inside.max():.3f}); chi2_min={cmin:.1f} for dof={len(sel)-2} -> chi2/dof={cmin/(len(sel)-2):.3f}")

print("\n== Mercury perihelion: analytic and numerical (AU, Julian yr) ==")
from scipy.integrate import solve_ivp
GM = 1.32712440018e20*(365.25*86400)**2/(1.495978707e11)**3
cA = 299792458*(365.25*86400)/1.495978707e11
a, e = 0.387098, 0.205630
P = np.sqrt(a**3/GM)*2*np.pi
dphi = 6*np.pi*GM/(cA**2*a*(1-e**2))
print(f"GM={GM:.6f} AU^3/yr^2, c={cA:.2f} AU/yr, P={P*365.25:.3f} d, dphi/orbit={dphi:.4e} rad, per century={dphi*(100/P)*206264.806:.2f} arcsec")
def run(lam, norb=6):
    rp = a*(1-e); vp = np.sqrt(GM*(1+e)/(a*(1-e)))
    def f(t, y):
        x, yy, vx, vy = y; r2 = x*x+yy*yy; r = np.sqrt(r2); L = x*vy-yy*vx
        fac = -GM/(r2*r)*(1+lam*3*L*L/(cA**2*r2))
        return [vx, vy, fac*x, fac*yy]
    def peri(t, y): return y[0]*y[2]+y[1]*y[3]
    peri.direction = 1
    sol = solve_ivp(f, (0, norb*P*1.02), [rp,0,0,vp], method="DOP853", rtol=1e-12, atol=1e-14, events=peri)
    ye = sol.y_events[0]; ang = np.unwrap(np.arctan2(ye[:,1], ye[:,0]))
    k = np.arange(1, len(ang)+1)
    return np.polyfit(k, ang, 1)[0] if len(ang)>1 else ang[0]
for lam in [1, 10, 100, 1000]:
    s = run(lam); print(f"lambda={lam:5d}: numeric precession/orbit = {s:.4e} rad; /lambda = {s/lam:.4e} (analytic {dphi:.4e})")
