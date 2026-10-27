import math
w=[0.212,1.2931,2.3065,8.2956,6.4133,0.8334,3.0194,0.001,1.8722,0.1666,0.796,1.4835,0.0614,0.2629,1.6483,0.6014,1.8729,0.5425,0.0912,0.0658,0.1542]
DECAY=-w[20]; FACTOR=0.9**(1/DECAY)-1
print("FSRS-6 decay=%.4f factor=%.5f"%(DECAY,FACTOR))
R=lambda t,S:(1+FACTOR*t/S)**DECAY
I=lambda S,r:(S/FACTOR)*(r**(1/DECAY)-1)
for r in (0.80,0.85,0.90,0.95): print(" interval/S at r=%.2f: %.3f"%(r,I(1,r)))
for t in (1,2,7,30): print(" R(t=%d d, S=10)=%.3f"%(t,R(t,10)))
S0={g:w[g-1] for g in (1,2,3,4)}; print(" S0:",S0)
D0=lambda g: w[4]-math.exp(w[5]*(g-1))+1
print(" D0 raw:",{g:round(D0(g),4) for g in (1,2,3,4)})
clamp=lambda d:min(10,max(1,d))
def nextD(D,g):
    d=-w[6]*(g-3); Dp=D+d*(10-D)/9
    return clamp(w[7]*D0(4)+(1-w[7])*Dp)
def Srecall(D,S,Rv,g):
    hp=w[15] if g==2 else 1; eb=w[16] if g==4 else 1
    return S*(1+math.exp(w[8])*(11-D)*S**(-w[9])*(math.exp((1-Rv)*w[10])-1)*hp*eb)
def Sforget(D,S,Rv):
    lt=w[11]*D**(-w[12])*((S+1)**w[13]-1)*math.exp((1-Rv)*w[14])
    st=S/math.exp(w[17]*w[18]); return min(lt,st)
# all-Good path reviewing exactly when R=0.9
D=clamp(D0(3)); S=S0[3]; path=[round(S,2)]
for k in range(4):
    S=Srecall(D,S,0.9,3); D=nextD(D,3); path.append(round(S,1))
print("All-Good intervals (days, r=0.9):",path, "D=%.3f"%D)
D2=clamp(D0(3)); S=S0[3]; p2=[round(S,2)]
for g in (2,2,2,2):
    S=Srecall(D2,S,0.9,g); D2=nextD(D2,g); p2.append(round(S,1))
print("All-Hard path:",p2,"D=%.3f"%D2)
# lapse after 3 goods
D=clamp(D0(3)); S=S0[3]
for k in range(3): S=Srecall(D,S,0.9,3); D=nextD(D,3)
print("S before lapse=%.1f; after lapse=%.2f"%(S,Sforget(D,S,0.9)))
# Elo with partial credit
sig=lambda x:1/(1+math.exp(-x))
def elo(outcomes,theta=-1.0,K0=1.0,beta=0.05,Kmin=0.2,b=0.0,g=0.0,wt=1.0):
    tr=[]
    for n,c in enumerate(outcomes):
        P=g+(1-g)*sig(theta-b); K=max(Kmin,K0/(1+beta*n)); theta+=K*wt*(c-P); tr.append(round(sig(theta),3))
    return tr
print("Elo P(std item) after unassisted successes:",elo([1]*10))
print("Elo after hint-1 successes c=0.7:",elo([0.7]*15)[-3:])
print("Elo after 2nd-attempt successes c=0.5:",elo([0.5]*15)[-3:])
print("Elo after hint-2 successes c=0.4:",elo([0.4]*15)[-3:])
print("Elo mixed 1,1,0.7,1,0,1,1,1:",elo([1,1,0.7,1,0,1,1,1]))
print("Elo MC 4-option (g=.25) successes:",elo([1]*10,g=0.25))
print("Elo harder items b=+1 successes:",elo([1]*6,b=1.0))
# Beta evidence interval fallback
def beta_lower(cs,decay=0.9,z=1.2816):
    a=b_=1.0
    for c in cs: a=a*decay+c; b_=b_*decay+(1-c)
    m=a/(a+b_); v=a*b_/((a+b_)**2*(a+b_+1)); return round(m,3), round(m-z*math.sqrt(v),3)
print("Beta mean/80%lower after 3,5,8 successes:",[beta_lower([1]*k) for k in (3,5,8)])
print("CBM optimal thresholds: C2 vs C1 p>%.3f ; C3 vs C2 p>%.3f"%(2/3,4/5))
