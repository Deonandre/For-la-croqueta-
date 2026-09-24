import pandas as pd, numpy as np, json, itertools, os
SP=os.path.dirname(os.path.abspath(__file__)); D=SP+'/data'
d=pd.read_csv(D+'/spain.csv'); d['Date']=pd.to_datetime(d.Date); d=d.sort_values(['Date']).reset_index(drop=True)
def run(K,H,REG,NEW,store=False):
    R={}; last={}; loss=0; n=0; pre=[]
    for s,g in d.groupby('Season',sort=True):
        teams=set(g.home)|set(g.visitor)
        mean=np.mean(list(R.values())) if R else 1500
        for t in teams:
            if t not in R: R[t]=NEW
            elif last.get(t)!=s-1: R[t]=R[t]*(1-REG)+NEW*REG
            else: R[t]=R[t]*(1-REG)+1500*REG
            last[t]=s
        for r in g.itertuples():
            rh,rv=R[r.home],R[r.visitor]; e=1/(1+10**(-(rh+H-rv)/400))
            sc=1 if r.hgoal>r.vgoal else (0.5 if r.hgoal==r.vgoal else 0)
            gd=abs(r.hgoal-r.vgoal); G=1 if gd<=1 else (1.5 if gd==2 else (11+gd)/8)
            if s>=1990: loss+=(e-sc)**2; n+=1
            if store: pre.append((r.Date,r.home,r.visitor,rh,rv,r.hgoal,r.vgoal,s))
            R[r.home]+=K*G*(sc-e); R[r.visitor]-=K*G*(sc-e)
    return loss/n, pre
best=None
for K,H,REG,NEW in itertools.product([15,20,25,30],[50,70,90],[0.1,0.2,0.3],[1400,1450]):
    l,_=run(K,H,REG,NEW)
    if best is None or l<best[0]: best=(l,K,H,REG,NEW)
print('best',best)
l,K,H,REG,NEW=best
_,pre=run(K,H,REG,NEW,store=True)
p=pd.DataFrame(pre,columns=['date','home','visitor','elo_h','elo_v','hg','vg','season'])
p.to_csv(D+'/elo_prematch.csv',index=False)
json.dump(dict(K=K,H=H,REG=REG,NEW=NEW,brier=l),open(D+'/elo_params.json','w'))
