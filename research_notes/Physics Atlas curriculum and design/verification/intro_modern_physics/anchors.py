import math
# Exact SI (2019) defining constants
c=299792458.0; h=6.62607015e-34; e=1.602176634e-19; kB=1.380649e-23; NA=6.02214076e23
hbar=h/(2*math.pi)
# CODATA 2022 (verified via search this session)
me=9.1093837139e-31; mp=1.67262192595e-27; mn=1.67492750056e-27; u=1.66053906892e-27
alpha_inv=137.035999177; alpha=1/alpha_inv
Rinf=10973731.568157; eps0=8.8541878188e-12; a0=5.29177210544e-11
mec2_MeV=0.51099895069; mnc2_MeV=939.56542194
# Values NOT verified this session (flag in notes)
G=6.67430e-11; g0=9.80665
GM_E=3.986004418e14; R_E=6.371e6; GM_S=1.3271244e20
r_GPS=26561.75e3
T_CMB=2.7255; T_sun=5772.0
eV=e
print("hc [eV nm] =", h*c/eV*1e9)
print("hbar c [MeV fm] =", hbar*c/eV/1e6*1e15)
print("k=1/(4 pi eps0) =", 1/(4*math.pi*eps0))
print("mu0 = 1/(eps0 c^2) =", 1/(eps0*c**2))
print("mu0 from alpha: 2 alpha h/(e^2 c) =", 2*alpha*h/(e**2*c))
print("R = NA kB =", NA*kB)
print("F = NA e =", NA*e)
print("sigma SB =", 2*math.pi**5*kB**4/(15*h**3*c**2))
# Wien: x = 5(1-exp(-x))
x=5.0
for _ in range(100): x=5*(1-math.exp(-x))
print("Wien x =", x, " b [m K] =", h*c/(kB*x))
xf=3.0
for _ in range(100): xf=3*(1-math.exp(-xf))
print("Wien freq x =", xf, " nu_max/T [Hz/K] =", xf*kB/h)
print("Ryd energy R_inf h c [eV] =", Rinf*h*c/eV)
mu_red = me*mp/(me+mp)
RH = Rinf*mu_red/me
print("R_H [1/m] =", RH, " E1(H, reduced mass) [eV] =", -RH*h*c/eV)
for (n1,n2,name) in [(2,3,"H-alpha"),(2,4,"H-beta"),(1,2,"Lyman-alpha"),(2,10**9,"Balmer limit"),(1,10**9,"Lyman limit")]:
    lam = 1/(RH*(1/n1**2-1/n2**2))
    print(f"{name} vacuum wavelength [nm] = {lam*1e9:.4f}")
print("Compton wavelength h/(me c) [pm] =", h/(me*c)*1e12)
print("Bohr radius check hbar/(me c alpha) [m]=", hbar/(me*c*alpha))
print("me c^2 from me [MeV] =", me*c**2/eV/1e6)
print("mp c^2 [MeV] =", mp*c**2/eV/1e6)
print("u c^2 [MeV] =", u*c**2/eV/1e6)
print("mn - mp [MeV] =", (mn-mp)*c**2/eV/1e6)
for E in [54,100,1000]:
    lam=h/math.sqrt(2*me*E*eV)
    print(f"electron deBroglie at {E} eV [nm] = {lam*1e9:.4f}")
for lam in [400,500,550,656.47,700]:
    print(f"photon {lam} nm energy [eV] = {h*c/(lam*1e-9)/eV:.4f}")
print("kT at 300 K [eV] =", kB*300/eV)
print("kT at 293.15 K [eV] =", kB*293.15/eV)
b=h*c/(kB*x)
print("Sun T=5772 K Wien peak [nm] =", b/T_sun*1e9)
print("CMB T=2.7255 K Wien peak [mm] =", b/T_CMB*1e3, " freq peak [GHz] =", xf*kB*T_CMB/h/1e9)
# Muon example
tau=2.1969811e-6; v=0.998*c; gam=1/math.sqrt(1-0.998**2); L=15e3
t=L/v
print("muon gamma(0.998c) =", gam, " dilated tau [us] =", gam*tau*1e6, " flight time [us]=", t*1e6)
print(" survival with dilation =", math.exp(-t/(gam*tau)), " without =", math.exp(-t/tau))
print(" muon frame contracted distance [km] =", L/gam/1e3)
# Pound-Rebka
for H in [22.5,22.6]:
    print(f"Pound-Rebka gH/c^2 for H={H} m, g=9.81: {9.81*H/c**2:.4e}")
# GPS
grav = GM_E/c**2*(1/R_E - 1/r_GPS)
vel = (GM_E/r_GPS)/(2*c**2)
# ground clock velocity due to Earth rotation (equator) small; ignore
print("GPS v_orbit [m/s] =", math.sqrt(GM_E/r_GPS))
print("GPS grav [us/day] =", grav*86400*1e6, " vel [us/day] =", -vel*86400*1e6, " net=", (grav-vel)*86400*1e6)
print("Earth surface GM/(R c^2) =", GM_E/(R_E*c**2))
# Schwarzschild radii
print("r_s Sun [m] =", 2*GM_S/c**2, " r_s Earth [mm] =", 2*GM_E/c**2*1e3)
print("Sun surface GM/(R c^2), R=6.957e8 =", GM_S/(6.957e8*c**2))
print("Light deflection at solar limb 4GM/(Rc^2) [arcsec] =", 4*GM_S/(6.957e8*c**2)*206264.806)
# Escape, orbits
print("Earth escape speed [km/s] =", math.sqrt(2*GM_E/R_E)/1e3)
r400=R_E+400e3
print("Orbital speed at 400 km [km/s] =", math.sqrt(GM_E/r400)/1e3, " period [min] =", 2*math.pi*math.sqrt(r400**3/GM_E)/60)
# Rocket eq example
Isp=450; m0_over_mf=5
print("Delta-v Isp=450 s, mass ratio 5 [km/s] =", Isp*g0*math.log(m0_over_mf)/1e3)
# Cosmology
Mpc=3.0856775814913673e22
H0=67.4e3/Mpc
print("H0 [1/s]=",H0," Hubble time [Gyr] =", 1/H0/(365.25*86400*1e9))
print("critical density [kg/m^3] =", 3*H0**2/(8*math.pi*G))
print("Hubble radius c/H0 [Gpc] =", c/H0/Mpc/1e3)
# GW150914
Msun=GM_S/G
print("Msun from GM/G [kg]=",Msun," 3.0 Msun c^2 [J] =", 3.0*Msun*c**2)
# Relativistic examples
g99=1/math.sqrt(1-0.99**2); mpc2=mp*c**2/eV/1e6
print("gamma(0.99)=",g99," proton KE at 0.99c [MeV]=",(g99-1)*mpc2, " p c [MeV]=", g99*0.99*mpc2)
print("antiproton threshold KE fixed target 6 mp c^2 [GeV]=", 6*mpc2/1e3)
print("pair production 2 me c^2 [MeV] =", 2*mec2_MeV)
# Fermi energy Cu n=8.47e28
n=8.47e28
EF=hbar**2/(2*me)*(3*math.pi**2*n)**(2/3)
print("Fermi energy Cu [eV] =", EF/eV, " T_F [K] =", EF/kB, " v_F [m/s]=", math.sqrt(2*EF/me))
# electron speed at 1 eV
print("electron speed at 1 eV [m/s] =", math.sqrt(2*eV/me))
# photon sphere, ISCO, shadow multiples
print("photon sphere = 1.5 r_s; ISCO = 3 r_s; critical impact parameter = (3*sqrt(3)/2) r_s =", 3*math.sqrt(3)/2)
# Planck units
print("Planck length [m] =", math.sqrt(hbar*G/c**3), " Planck time [s] =", math.sqrt(hbar*G/c**5), " Planck mass [kg] =", math.sqrt(hbar*c/G))
# Classical electron radius
print("r_e [fm] =", alpha*hbar/(me*c)*1e15)
# Bohr magneton
print("mu_B [J/T] =", e*hbar/(2*me), " [eV/T] =", e*hbar/(2*me)/eV)
# Thermal de Broglie / misc: Stefan-Boltzmann sun luminosity check skip
# Infinite well: electron in 1 nm box ground state
L=1e-9
print("electron 1 nm infinite well E1 [eV] =", h**2/(8*me*L**2)/eV)
# Hydrogen-like: Moseley K-alpha for Cu Z=29: E = 13.6*(Z-1)^2*(3/4)
print("Moseley Cu K-alpha approx [keV] =", Rinf*h*c/eV*(29-1)**2*0.75/1e3)
# Time dilation at 1 m height difference fractional (optical clocks)
print("gh/c^2 for 1 m =", 9.81/c**2)
# Sgr A*-like: r_s for 4.0e6 Msun [km]
print("r_s for 4.0e6 Msun [km] =", 2*G*4.0e6*Msun/c**2/1e3)
