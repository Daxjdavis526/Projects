import math
sig=lambda x:1/(1+math.exp(-x))
def run(events,theta=-1.0,K0=1.0,beta=0.05,Kmin=0.2):
    out=[]
    for n,(c,b,g,wt,label) in enumerate(events):
        P=g+(1-g)*sig(theta-b); K=max(Kmin,K0/(1+beta*n)); theta+=K*wt*(c-P)
        out.append("%s:%.2f"%(label,sig(theta)))
    return out, theta
L=lambda c:(c,0.0,0.0,0.75,"L")      # in-lesson item, standard difficulty, weight .75
C=lambda c:(c,0.0,0.0,1.0,"C")       # checkpoint item
Rv=lambda c:(c,0.0,0.0,1.25,"R")     # spaced review (>=3 d gap)
T=lambda c:(c,1.5,0.0,1.5,"T")       # transfer / novel-context item
for name,ev in [
 ("ideal",[L(1)]*6+[C(1)]*2+[Rv(1)]+[T(1)]+[Rv(1)]),
 ("typical",[L(.7),L(1),L(.5),L(1),L(1),L(1),C(1),C(1),Rv(1),T(1),Rv(1)]),
 ("struggling",[L(.4),L(.5),L(0),L(.7),L(.7),L(1),C(0.5),C(1),Rv(0),Rv(1),Rv(1)]),
 ("4-item lesson",[L(1)]*4+[C(1)]*2+[Rv(1)]+[T(1)]),
]:
    o,th=run(ev); print(name.ljust(14)," ".join(o))
