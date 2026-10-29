import math
c=299792458.0; G=6.67430e-11; GM_S=1.3271244e20; Msun=GM_S/G
hbar=6.62607015e-34/(2*math.pi); e=1.602176634e-19
mp=1.67262192595e-27; u=1.66053906892e-27
yr=365.25*86400; Mpc=3.0856775814913673e22
# ISCO orbital period (coordinate time) T = 2 pi 6^{3/2} GM/c^3
for M in [1,10,4.0e6,6.5e9]:
    GM=GM_S*M
    T=2*math.pi*6**1.5*GM/c**3
    rs=2*GM/c**2
    print(f"M={M:g} Msun: r_s={rs/1e3:.4g} km, ISCO r={3*rs/1e3:.4g} km, T_ISCO={T:.4g} s, f_GW(ISCO)=2/T={2/T:.4g} Hz")
# tidal acceleration across L=2 m at r = r_s : 2GM L / r^3
for M in [10,4.0e6]:
    GM=GM_S*M; rs=2*GM/c**2
    print(f"M={M:g} Msun: tidal accel across 2 m at horizon = {2*GM*2/rs**3:.4g} m/s^2")
# neutron star surface redshift example M=1.4, R=12 km
M=1.4; R=12e3; rs=2*GM_S*M/c**2
f=math.sqrt(1-rs/R); print("NS 1.4 Msun R=12km: rs=",rs, " dtau/dt=",f," z=",1/f-1)
print("clock at r=2 r_s: dtau/dt =", math.sqrt(0.5))
# chirp mass GW150914 36,29
m1,m2=36,29
Mc=(m1*m2)**0.6/(m1+m2)**0.2; print("chirp mass 36+29 =",Mc)
# LCDM age ignoring radiation, H0=67.4, Om=0.315, OL=0.685
H0=67.4e3/Mpc; Om=0.315; OL=1-Om
t0=2/(3*H0*math.sqrt(OL))*math.asinh(math.sqrt(OL/Om))
print("LCDM age [Gyr] =", t0/yr/1e9, " matter-only (2/3H0) [Gyr]=", 2/(3*H0)/yr/1e9, " 1/H0 [Gyr]=",1/H0/yr/1e9)
# deceleration parameter q0 = Om/2 - OL
print("q0 =", Om/2-OL)
# redshift of matter-Lambda equality: (1+z)^3 = OL/Om
print("z_acc_eq(rho_m=rho_L) =", (OL/Om)**(1/3)-1, " z where qdot=0: (2OL/Om)^(1/3)-1 =", (2*OL/Om)**(1/3)-1)
rhoc=3*H0**2/(8*math.pi*G); print("rho_c =",rhoc," protons per m^3 =", rhoc/mp)
print("Hubble law v for 100 Mpc [km/s] =", 67.4*100)
print("T at z=1089 with 2.7255 K =", 2.7255*1090)
# nuclear density with R0=1.2 fm
R0=1.2e-15; print("nuclear density [kg/m^3] =", u/(4/3*math.pi*R0**3))
# pion exchange range with m_pi=139.57 MeV
print("hbar c / m_pi c^2 [fm] =", 197.3269804/139.57)
# relativistic rocket: rapidity = (ve/c) ln(m0/mf)
for ve,MR in [(1.0,10),(0.1,10),(0.03,10)]:
    w=ve*math.log(MR); print(f"ve={ve}c MR={MR}: v/c = {math.tanh(w):.4f}")
# constant proper acceleration 1 g for 1 yr proper time
g=9.80665; tau=yr
w=g*tau/c; print("1 g for 1 yr proper: v/c=",math.tanh(w)," coord time [yr]=",c/g*math.sinh(w)/yr," distance [ly]=",(c**2/g)*(math.cosh(w)-1)/(c*yr))
# velocity addition and Doppler
b=0.8; print("0.8c+0.8c =", 2*b/(1+b*b))
b=0.6; print("Doppler factor recede 0.6c =", math.sqrt((1-b)/(1+b)))
# Earth time vs ship time to 4.37 ly at 0.8c
D=4.37; v=0.8; gam=1/math.sqrt(1-v*v); print("alpha Cen at 0.8c: Earth time yr=",D/v," ship time yr=",D/v/gam)
# Mercury perihelion check: a=5.7909e10 m, e=0.2056, P=87.969 d
a=5.7909e10; ecc=0.2056; P=87.969
dphi=6*math.pi*GM_S/(a*(1-ecc**2)*c**2)
print("Mercury precession arcsec/century =", dphi*206264.806*(36525/P))
# Shapiro-ish: skip. Light deflection at limb computed earlier 1.751"
# Earth-Moon? skip
# Gravitational time dilation at Earth's surface vs infinity per day [us]
GM_E=3.986004418e14; R_E=6.371e6
print("Earth surface vs infinity per day [us]=", GM_E/(R_E*c**2)*86400*1e6)
# GW strain estimate ratio for LIGO arm 4 km, h=1e-21
print("dL for h=1e-21 over 4 km [m] =", 1e-21*4e3, " in proton radii (0.84 fm):", 1e-21*4e3/0.84e-15)
# Hawking temperature of 1 Msun BH: T = hbar c^3/(8 pi G M k)
kB=1.380649e-23
print("Hawking T 1 Msun [K] =", hbar*c**3/(8*math.pi*G*Msun*kB))
