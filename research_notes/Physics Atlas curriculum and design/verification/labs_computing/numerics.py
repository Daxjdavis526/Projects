import numpy as np
from scipy import constants as C, special, integrate, optimize, stats, signal
pc = C.physical_constants
e, me, h, c, kB, G, muB = C.e, C.m_e, C.h, C.c, C.k, C.G, C.physical_constants["Bohr magneton"][0]
mu0 = C.mu_0
print("== EXPERIMENT PARAMETERS ==")
# e/m Helmholtz (generic teaching apparatus values N=130, R=0.15 m)
N,R = 130,0.15
for V,I in [(200,1.4),(300,1.7),(150,1.2)]:
    B = (4/5)**1.5*mu0*N*I/R; r = np.sqrt(2*V*me/e)/B
    print(f"e/m: V={V} V I={I} A -> B={B*1e3:.3f} mT, r={r*100:.2f} cm; Earth 50uT is {50e-6/B*100:.1f}% of B")
print("e/m accepted:", abs(pc['electron charge to mass quotient'][0]))
# Millikan
eta, rho, g, b_cun, p, T = 1.83e-5, 886.0, 9.80, 8.2e-3, 101325.0, 296.0
for r in [0.4e-6, 0.7e-6, 1.0e-6]:
    v = 2*r**2*rho*g/(9*eta)/(1)  # Stokes
    v_c = v*(1+b_cun/(p*r))
    m = 4/3*np.pi*r**3*rho; D = kB*T/(6*np.pi*eta*r)
    t_fall = 0.5e-3/v_c; brown = np.sqrt(2*D*t_fall)
    Vbal = [m*g*6.0e-3/(n*e) for n in (1,3,10)]
    print(f"Millikan r={r*1e6:.1f}um: v_stokes={v*1e6:.1f} um/s, with Cunningham {v_c*1e6:.1f} um/s, t(0.5mm)={t_fall:.1f}s, Brownian rms={brown*1e6:.1f} um ({brown/0.5e-3*100:.1f}% of 0.5 mm); Vbal(d=6mm) n=1,3,10: {[round(x) for x in Vbal]} V")
# Photoelectric Hg lines
for lam in [365.0,404.7,435.8,546.1,577.0,579.1]:
    print(f"photo: {lam} nm -> nu={c/(lam*1e-9)/1e14:.4f}e14 Hz, h nu/e={h*c/(lam*1e-9)/e:.3f} V")
print("h/e =", h/e, "V s")
# Zeeman normal (Cd 643.8 nm) and FP etalon
for lam in [643.847e-9, 546.074e-9]:
    for B in [0.5,1.0]:
        dnu = muB*B/h; dlam = lam**2*dnu/c
        print(f"Zeeman lam={lam*1e9:.1f} nm B={B} T: dnu(g=1)={dnu/1e9:.2f} GHz, dlam={dlam*1e12:.2f} pm")
n_fs=1.457; d=3e-3; lam=643.847e-9
print(f"FP etalon d=3mm n=1.457: FSR={lam**2/(2*n_fs*d)*1e12:.1f} pm = {c/(2*n_fs*d)/1e9:.2f} GHz; finesse R=0.85 ->{np.pi*np.sqrt(0.85)/(1-0.85):.1f}, R=0.9 -> {np.pi*np.sqrt(0.9)/(1-0.9):.1f}")
# Compton
E0=661.657; mec2=pc['electron mass energy equivalent in MeV'][0]*1e3
for th in [0,30,45,60,90,120,135,180]:
    E1 = E0/(1+(E0/mec2)*(1-np.cos(np.radians(th))))
    print(f"Compton Cs-137 theta={th:3d}: E'={E1:.1f} keV, T_e={E0-E1:.1f} keV")
# Franck-Hertz / atomic
print("Hg 6^3P1 line 253.7 nm -> E =", h*c/253.65e-9/e, "eV")
# NMR / ESR
gp = pc['proton gyromag. ratio in MHz/T'][0]
for B in [0.35,0.5,1.0,1.5]: print(f"NMR proton B={B} T -> f={gp*B:.3f} MHz")
gDPPH=2.0036; muBHz=pc['Bohr magneton in Hz/T'][0]
print(f"ESR DPPH g=2.0036: {gDPPH*muBHz/1e9:.3f} GHz/T -> 1 mT: {gDPPH*muBHz*1e-3/1e6:.2f} MHz; field for 9.5 GHz X-band: {9.5e9/(gDPPH*muBHz)*1e3:.1f} mT")
for T1 in [0.02,0.1]: print(f"NMR inversion recovery T1={T1}s: null at t={T1*np.log(2)*1e3:.1f} ms")
# speed of light / Michelson / air index
print(f"c: 10 m -> {10/c*1e9:.2f} ns; 2x15 m round trip -> {30/c*1e9:.2f} ns")
lam=632.8e-9
print(f"Michelson: 10 um mirror travel -> {2*10e-6/lam:.1f} fringes; air cell L=3cm, n-1=2.7e-4 (1 atm) -> {2*0.03*2.7e-4/lam:.1f} fringes")
print(f"Na D doublet: {589.592-588.995:.3f} nm; FP spacing for coincidence d = lam^2/(2 dlam) = {(589.3e-9)**2/(2*0.597e-9)*1e3:.3f} mm")
# Cavendish (generic: M=1.5 kg, m=0.038 kg? use 0.015 kg; d=0.05 m arm half-length, b=0.0465 m, T=600 s, L=5 m to screen)
M,m,dd,b,Tp,L = 1.5,0.015,0.050,0.0465,600.0,5.0
I = 2*m*dd**2; kappa = 4*np.pi**2*I/Tp**2
theta = 2*G*M*m*dd/b**2/kappa  # equilibrium deflection for one position
print(f"Cavendish: kappa={kappa:.3e} N m/rad, theta_eq={theta*1e3:.3f} mrad, swing between positions 2*theta, spot shift on screen at {L} m = 4*L*theta = {4*L*theta*100:.1f} cm")
print(f"Cavendish inverse: G = 2*pi^2*b^2*d*dS/(M*L*T^2) -> check {2*np.pi**2*b**2*dd*(4*L*theta)/(M*L*Tp**2):.4e}")
# Hall
nCu=8.49e28
print(f"Hall Cu foil t=25um I=1A B=0.5T: V_H={1*0.5/(nCu*e*25e-6)*1e6:.2f} uV; R_H={-1/(nCu*e):.2e} m^3/C")
print(f"Hall doped Ge n=1e21 m^-3 t=1mm I=30mA B=0.25T: V_H={0.03*0.25/(1e21*e*1e-3)*1e3:.1f} mV")
# Blackbody / diffraction / x-ray
bW = pc['Wien wavelength displacement law constant'][0]
for Tk in [1500,2000,2500,3000]: print(f"Wien T={Tk} K -> lam_max={bW/Tk*1e6:.3f} um")
print(f"Single slit a=0.08mm, L=1m, 632.8nm: first min at {632.8e-9*1/0.08e-3*1e3:.2f} mm")
print(f"Bragg Cu Ka 0.15406 nm, NaCl d=0.2820 nm: theta1={np.degrees(np.arcsin(0.15406/(2*0.2820))):.2f} deg, theta2={np.degrees(np.arcsin(2*0.15406/(2*0.2820))):.2f} deg")
print("\n== PENDULUM T/T0 exact (ellipk uses m=k^2) ==")
for th in [5,10,20,30,45,60,90,120,170]:
    t0=np.radians(th); k=np.sin(t0/2)
    ex = 2/np.pi*special.ellipk(k**2); wrong = 2/np.pi*special.ellipk(k)
    ser = 1+t0**2/16+11*t0**4/3072
    print(f"theta0={th:3d} deg: T/T0={ex:.6f} (2nd-order series {ser:.6f}; WRONG ellipk(k) {wrong:.6f})")
print("\n== ROOTS / INTEGRALS ==")
x = optimize.brentq(lambda x: 5*np.exp(-x)+x-5, 1, 10); print("Wien x =", repr(x), "b = hc/(k x) =", h*c/(kB*x))
Gn,Me,Mm,Rm,w = 6.674e-11,5.974e24,7.348e22,3.844e8,2.662e-6
r = optimize.brentq(lambda r: Gn*Me/r**2-Gn*Mm/(Rm-r)**2-w**2*r, 1e8, 3.8e8); print("Earth-Moon L1 r =", r, "m")
val,err = integrate.quad(lambda x: x**3/np.expm1(x), 0, np.inf); print("int x^3/(e^x-1) =", val, "pi^4/15 =", np.pi**4/15)
f = lambda x: x**4-2*x+1; xs=np.linspace(0,2,11)
print("int_0^2 x^4-2x+1 (exact 4.4): trapezoid N=10", integrate.trapezoid(f(xs),xs), "simpson N=10", integrate.simpson(f(xs),x=xs))
xs=np.linspace(0,2,101); print("   N=100: trapezoid", integrate.trapezoid(f(xs),xs), "simpson", integrate.simpson(f(xs),x=xs))
print("\n== FLOATING POINT ==")
print("eps =", np.finfo(float).eps, "| 0.1+0.2==0.3:", 0.1+0.2==0.3, "| 0.1+0.2 =", repr(0.1+0.2))
xx=1e-8; print("(1-cos x)/x^2 at 1e-8 naive:", (1-np.cos(xx))/xx**2, " stable 2 sin^2(x/2)/x^2:", 2*np.sin(xx/2)**2/xx**2)
a_,b_,c_=1.0,1e8,1.0; d_=np.sqrt(b_*b_-4*a_*c_)
print("x^2+1e8x+1: naive small root", (-b_+d_)/(2*a_), " stable", (2*c_)/(-b_-d_))
print("sum 0.1 x 1e6 naive loop vs math.fsum:", end=" "); 
s=0.0
for _ in range(10**6): s+=0.1
import math; print(repr(s), repr(math.fsum([0.1]*10**6)))
print("derivative of sin at 1 (exact cos1): ")
for hh in [1e-2,1e-4,1e-6,1e-8,1e-10,1e-12]:
    fwd=(np.sin(1+hh)-np.sin(1))/hh; cen=(np.sin(1+hh)-np.sin(1-hh))/(2*hh)
    print(f"  h={hh:.0e}: fwd err={abs(fwd-np.cos(1)):.2e}, central err={abs(cen-np.cos(1)):.2e}")
print("\n== ODE: SHO omega=1, h=T/100, 100 periods, energy ratio E/E0 ==")
w=1.0; Tper=2*np.pi; hstep=Tper/100; nsteps=100*100
def run(method):
    x,v=1.0,0.0
    for _ in range(nsteps):
        if method=="euler": x,v = x+hstep*v, v-hstep*w**2*x
        elif method=="symplectic_euler": v = v-hstep*w**2*x; x = x+hstep*v
        elif method=="verlet":
            a=-w**2*x; v_half=v+0.5*hstep*a; x=x+hstep*v_half; v=v_half+0.5*hstep*(-w**2*x)
        elif method=="rk4":
            def fdx(x,v): return v, -w**2*x
            k1=fdx(x,v); k2=fdx(x+hstep/2*k1[0],v+hstep/2*k1[1]); k3=fdx(x+hstep/2*k2[0],v+hstep/2*k2[1]); k4=fdx(x+hstep*k3[0],v+hstep*k3[1])
            x=x+hstep/6*(k1[0]+2*k2[0]+2*k3[0]+k4[0]); v=v+hstep/6*(k1[1]+2*k2[1]+2*k3[1]+k4[1])
    return 0.5*v*v+0.5*w**2*x*x
for mth in ["euler","symplectic_euler","verlet","rk4"]: print(f"  {mth}: E/E0={run(mth)/0.5:.6f}")
print("  Euler predicted (1+h^2)^N =", (1+hstep**2)**nsteps)
print("\n== STATISTICS ==")
for nu in [5,10,20,50]:
    print(f"chi2_red 95% central interval nu={nu}: [{stats.chi2.ppf(0.025,nu)/nu:.3f}, {stats.chi2.ppf(0.975,nu)/nu:.3f}]; sd sqrt(2/nu)={np.sqrt(2/nu):.3f}")
for n in [3,5,10,30]: print(f"t_0.975 dof={n-1}: {stats.t.ppf(0.975,n-1):.3f}")
Ns,Nb,t=400,100,100.0; print(f"Poisson net rate (400 cts src+bkg, 100 cts bkg, 100 s each): {(Ns-Nb)/t:.3f} +/- {np.sqrt(Ns+Nb)/t:.3f} /s")
tau=2e-6; mrate=5e4; print(f"dead time nonparalyzable tau=2us, measured 5e4/s -> true {mrate/(1-mrate*tau):.0f}/s")
rng=np.random.default_rng(1)
L0,uL,T0,uT=1.000,0.002,2.006,0.004
gval=4*np.pi**2*L0/T0**2; ug=gval*np.sqrt((uL/L0)**2+(2*uT/T0)**2)
Ls=rng.normal(L0,uL,10**6); Ts=rng.normal(T0,uT,10**6); gs=4*np.pi**2*Ls/Ts**2
print(f"pendulum g analytic {gval:.4f}+/-{ug:.4f}; MC mean {gs.mean():.4f} sd {gs.std():.4f}")
print("\n== DAQ ==")
for nb in [8,12,16,24]:
    tt=np.arange(2**16); sig=np.sin(2*np.pi*tt*1013/2**16)*0.999
    q=np.round(sig*(2**(nb-1)))/(2**(nb-1)); noise=q-sig
    print(f"ADC {nb}-bit full-scale sine: simulated SNR={10*np.log10(np.mean(sig**2)/np.mean(noise**2)):.2f} dB vs 6.02N+1.76={6.02*nb+1.76:.2f}")
for tau in [0.1,1.0]:
    ff=np.linspace(0,2000/tau,2000001); enbw=np.trapezoid(1/(1+(2*np.pi*ff*tau)**2),ff)
    print(f"RC lowpass tau={tau}s ENBW numeric={enbw:.4f} Hz vs 1/(4 tau)={1/(4*tau):.4f}")
print("alias: 60 Hz sampled at 100 Hz ->", abs(60-100*round(60/100)), "Hz")
