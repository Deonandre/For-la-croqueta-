# Possession while level, excluding the last g minutes before each goal (writes data/R5.json)
import json,pandas as pd,numpy as np,statsmodels.formula.api as smf,os,warnings; warnings.filterwarnings('ignore')
D=os.path.dirname(os.path.abspath(__file__))+'/data'
f=pd.read_pickle(D+'/master.pkl'); raw={r['match_id']:r for r in json.load(open(D+'/features.json'))}
f['E']=f.elo_diff/100; out=[]
for gap in (0,1,2,3):
    v=[]
    for r in f.itertuples():
        x=raw[r.match_id]; g=x['goals']
        def lvl(t):
            if sum((1 if gg[1] else -1) for gg in g if gg[0]<t)!=0: return False
            return all(not (gg[0]-gap<=t<gg[0]) for gg in g)
        b=sum(1 for t in x['pt']['bar'] if lvl(t)); o=sum(1 for t in x['pt']['opp'] if lvl(t))
        v.append(b/(b+o) if b+o>40 else np.nan)
    f['L']=np.array(v)*100; d=f[f.L.notna()]
    m1=smf.logit('win ~ L',d).fit(disp=0); m2=smf.logit('win ~ L + E + home',d).fit(disp=0)
    out.append(dict(gap=gap,n=int(m1.nobs),or10=round(np.exp(10*m1.params['L']),3),p=round(m1.pvalues['L'],4),or10_elo=round(np.exp(10*m2.params['L']),3),p_elo=round(m2.pvalues['L'],4)))
json.dump(out,open(D+'/R5.json','w')); print(pd.DataFrame(out))
