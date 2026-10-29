import math, numpy as np
from scipy.integrate import solve_ivp, quad
from scipy.optimize import brentq
G=6.67430e-11; c=299792458.0; hbar=1.054571817e-34; kB=1.380649e-23
GMsun=1.3271244e20; Msun=GMsun/G; GMe=3.986004418e14; yr=365.25*86400; mas=math.pi/(180*3600)/1e3
ly=c*yr; Mpc=3.0856775814913673e22
def sech2(x):
    ax=abs(x)
    return 4*math.exp(-2*ax)/(1+math.exp(-2*ax))**2
def alc_energy(R, sig, beta=1.0):
    fp=lambda r:(sig/(2*math.tanh(sig*R)))*(sech2(sig*(r+R))-sech2(sig*(r-R)))
    I,_=quad(lambda r:r*r*fp(r)**2, max(0,R-60/sig), R+60/sig, points=[R], limit=1000)
    return -(c**4*beta**2/(12*G))*I
for R_,sg,beta in [(100.0,1.0,1.0),(100.0,10.0,1.0),(100.0,10.0,0.1),(1.0,1.0,1.0)]:
    E=alc_energy(R_,sg,beta)
    print(f"S36 Alcubierre R={R_} sigma={sg} beta={beta}: E/c^2 exact = {E/c**2:.4e} kg; thin-wall -beta^2 c^2 R^2 sigma/(36G) = {-(beta**2*c**2*R_**2*sg/(36*G)):.4e} kg; = {E/c**2/Msun:.4g} Msun")
lP=math.sqrt(hbar*G/c**3); print("S36 Planck length", lP)
for nP in (100,1000):
    sig=2/(nP*lP)
    print(f"S36 thin-wall E/c^2, R=100 m, beta=1, wall Delta={nP} l_P (sigma=2/Delta): {-(c**2*100**2*sig/(36*G)):.3e} kg")
H0=67.4e3/Mpc; OL=0.685
Lam=3*OL*H0**2/c**2; rhoL=Lam*c**2/(8*math.pi*G); rhoP=c**5/(hbar*G**2)
print("S37 Planck density", rhoP, "ratio", rhoP/rhoL, "log10", math.log10(rhoP/rhoL))
tev=5120*math.pi*G**2*Msun**3/(hbar*c**4); print("S37 evaporation time 1 Msun (yr)", tev/yr)
A=16*math.pi*(G*Msun)**2/c**4; print("S37 BH entropy 1 Msun S/k", A*c**3/(4*G*hbar))
print("S37 Planck length", lP, "Planck time", lP/c, "Planck energy GeV", math.sqrt(hbar*c**5/G)/1.602176634e-10)
# Binet convergence
def numeric_precession(M=1.0, p=1000.0, e=0.5):
    L2=M*p
    rhs=lambda ph,y:[y[1], M/L2-y[0]+3*M*y[0]**2]
    u0=(1+e)/p
    sol=solve_ivp(rhs,[0,2.6*math.pi],[u0,0.0],rtol=1e-13,atol=1e-16,dense_output=True,max_step=0.005)
    phis=np.linspace(1.5*math.pi,2.5*math.pi,400001); du=sol.sol(phis)[1]
    i=np.where((du[:-1]>0)&(du[1:]<=0))[0][0]
    return brentq(lambda ph: sol.sol(ph)[1], phis[i], phis[i+1])-2*math.pi
for p in (1e3,1e4,1e5):
    d=numeric_precession(1.0,p,0.5); f=6*math.pi/p
    print(f"S25 Binet p={p:g}M e=0.5: numeric {d:.6e}, 6piM/p {f:.6e}, rel diff {(d-f)/f:.3e}")
# GP-B with semi-major axis 7027.4 km
r=7027.4e3; Om=1.5*GMe**1.5/(c**2*r**2.5); print("S13 GP-B geodetic r=7027.4 km (mas/yr)", Om*yr/mas)
# 1 g flip-and-burn rocket to Alpha Centauri 4.37 ly
g=9.81; d=4.37*ly
x=1+g*(d/2)/c**2; eta=math.acosh(x)
print("S07 1g accel/decel to 4.37 ly: proper time (yr)", 2*(c/g)*eta/yr, "Earth time (yr)", 2*(c/g)*math.sinh(eta)/yr, "peak speed (c)", math.tanh(eta))
