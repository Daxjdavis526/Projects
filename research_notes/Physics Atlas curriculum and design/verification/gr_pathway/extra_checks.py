import sympy as sp, math
s=sp.symbols('s',real=True)
r=sp.sqrt(1+s**2); th=sp.atan(s)
e1=sp.simplify(sp.diff(r,s,2)-r*sp.diff(th,s)**2); e2=sp.simplify(sp.diff(th,s,2)+2*sp.diff(r,s)*sp.diff(th,s)/r)
print("polar straight line x=1 geodesic residuals:", e1, e2)
M,R=sp.symbols('M r',positive=True)
# circular orbit: Kepler in coordinate time and local speed
Om2=M/R**3
v=sp.simplify(R*sp.sqrt(Om2)/sp.sqrt(1-2*M/R))
print("local speed circular orbit:", v, " at 6M:", sp.simplify(v.subs(R,6*M)), " at 3M:", sp.simplify(v.subs(R,3*M)))
# check Kepler law from geodesic: for circular orbit dphi/dt = L/(r^2) * (1-2M/r)/E
L=sp.sqrt(M*R)/sp.sqrt(1-3*M/R); E=(1-2*M/R)/sp.sqrt(1-3*M/R)
print("dphi/dt from E,L equals sqrt(M/r^3):", sp.simplify((L/R**2)*(1-2*M/R)/E - sp.sqrt(M/R**3)))
# energy at infinity of a static particle at r=4 r_s
print("static particle energy-at-infinity fraction at r=4r_s:", math.sqrt(1-1/4), " extractable 1-sqrt(1-rs/r):", 1-math.sqrt(0.75))
# deflection for Earth observer at elongation 90 deg (Will's formula factor (1+cosPhi)/2)
G=6.67430e-11;c=299792458.0;GM=1.3271244e20;AU=1.495978707e11
mas=math.pi/(180*3600)/1e3
print("deflection at 90 deg elongation for observer at 1 AU (mas):", 4*GM/(c**2*AU)*(1+math.cos(math.pi/2))/2/mas)
# GW chirp: time from 35 Hz to coalescence and number of cycles (leading order)
Msun=GM/G; Mc=30.62*Msun
tau=lambda f:5/256*(G*Mc/c**3)**(-5/3)*(math.pi*f)**(-8/3)
Ncyc=lambda f1,f2: 1/(32*math.pi**(8/3))*(G*Mc/c**3)**(-5/3)*(f1**(-5/3)-f2**(-5/3))
print("GW150914 leading-order: t(35 Hz->coal) =", tau(35), "s; cycles 35->250 Hz =", Ncyc(35,250))
# fdot at 100 Hz
fdot=96/5*math.pi**(8/3)*(G*Mc/c**3)**(5/3)*100**(11/3)
print("fdot at 100 Hz (Hz/s):", fdot)
# chirp mass back out from f, fdot
Mc_back=(c**3/G)*((5/96)*math.pi**(-8/3)*100**(-11/3)*fdot)**(3/5)/Msun
print("chirp mass recovered from (f,fdot) (Msun):", Mc_back)
