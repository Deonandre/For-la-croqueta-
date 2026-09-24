import json, pandas as pd, numpy as np, os, warnings
from scipy import stats
import statsmodels.api as sm, statsmodels.formula.api as smf
warnings.filterwarnings('ignore')
SP=os.path.dirname(os.path.abspath(__file__)); D=SP+'/data'
f=pd.read_pickle(D+'/master.pkl')
R={}
r3=lambda x: None if x is None or (isinstance(x,float) and np.isnan(x)) else round(float(x),4)
# ---------- overview
import gzip
R['n']=len(f); R['seasons']=int(f.season.nunique()); R['opponents']=int(f.opponent.nunique())
R['W'],R['D'],R['L']=[int((f.result==k).sum()) for k in 'WDL']
R['passes_total']=int(f.passes.sum()+f.opp_passes.sum()); R['shots_total']=int(f.shots.sum()+f.opp_shots.sum())
R['coverage']=json.load(open(D+'/coverage.json'))
R['poss_mean']=r3(f.poss.mean()); R['poss_sd']=r3(f.poss.std()); R['poss_min']=r3(f.poss.min()); R['poss_max']=r3(f.poss.max())
R['poss_median']=r3(f.poss.median())
R['pct_matches_over50']=r3((f.poss>0.5).mean())
R['r_pass_time']=r3(f.poss.corr(f.poss_time))
R['gf_total']=int(f.gf.sum()); R['ga_total']=int(f.ga.sum())
# per-match compact rows for the page
cols=['match_id','date','season','home','opponent','mgr','gf','ga','result','poss','poss_time','poss_pre','poss_level','poss_lead','poss_trail','sot','opp_sot','shots','xg','xga','field_tilt','ppda','elo_diff','pass_pct','min_lead','min_trail']
m=f[cols].copy(); m['date']=m.date.dt.strftime('%Y-%m-%d')
R['matches']=[{k:(r3(v) if isinstance(v,(float,np.floating)) else (int(v) if isinstance(v,(np.integer,)) else v)) for k,v in row.items()} for row in m.to_dict('records')]
# ---------- descriptive: KDE by result
xs=np.linspace(0.40,0.86,93)
R['kde']={'x':xs.round(3).tolist()}
for k in 'WDL':
    v=f[f.result==k].poss; kd=stats.gaussian_kde(v,bw_method=0.35); R['kde'][k]=(kd(xs)).round(4).tolist()
R['poss_by_result']={k:dict(mean=r3(f[f.result==k].poss.mean()),sd=r3(f[f.result==k].poss.std()),n=int((f.result==k).sum())) for k in 'WDL'}
R['extremes']={'high':m.sort_values('poss',ascending=False).head(6).to_dict('records'),'low':m.sort_values('poss').head(6).to_dict('records')}
for k in R['extremes']:
    R['extremes'][k]=[{kk:(r3(vv) if isinstance(vv,float) else vv) for kk,vv in d.items() if kk in ('date','opponent','home','gf','ga','result','poss','xg','xga')} for d in R['extremes'][k]]
# season table
st=f.groupby('season').agg(n=('win','size'),win=('win','mean'),poss=('poss','mean'),xg=('xg','mean'),xga=('xga','mean'),gf=('gf','mean'),ga=('ga','mean'),sot=('sot','mean'),mgr=('mgr',lambda s:' / '.join(dict.fromkeys(s)))).reset_index()
st['ppg']=f.groupby('season').apply(lambda g:(3*(g.result=='W').sum()+(g.result=='D').sum())/len(g)).values
R['seasons_tbl']=[{k:(r3(v) if isinstance(v,float) else (int(v) if isinstance(v,np.integer) else v)) for k,v in d.items()} for d in st.to_dict('records')]
rs,ps=stats.pearsonr(st.poss,st.win); R['season_r']=dict(r=r3(rs),p=r3(ps))
rs2,ps2=stats.pearsonr(st.poss,st.ppg); R['season_r_ppg']=dict(r=r3(rs2),p=r3(ps2))
mg=f.groupby('mgr').agg(n=('win','size'),win=('win','mean'),draw=('result',lambda s:(s=='D').mean()),loss=('result',lambda s:(s=='L').mean()),poss=('poss','mean'),xg=('xg','mean'),xga=('xga','mean'),first=('date','min'),field_tilt=('field_tilt','mean'),ppda=('ppda','mean')).reset_index().sort_values('first')
mg['first']=mg['first'].dt.strftime('%Y-%m-%d')
R['managers']=[{k:(r3(v) if isinstance(v,float) else (int(v) if isinstance(v,np.integer) else v)) for k,v in d.items()} for d in mg.to_dict('records')]
# ---------- naive tests
r,p=stats.pointbiserialr(f.win,f.poss); rho,prho=stats.spearmanr(f.poss,f.win)
u=stats.mannwhitneyu(f[f.win==1].poss,f[f.win==0].poss)
kw=stats.kruskal(*[f[f.result==k].poss for k in 'WDL'])
an=stats.f_oneway(*[f[f.result==k].poss for k in 'WDL'])
f['q5']=pd.qcut(f.poss,5,labels=False)
ct=pd.crosstab(f.q5,f.win); chi2,pc,dof,exp=stats.chi2_contingency(ct)
cv=np.sqrt(chi2/(len(f)*(min(ct.shape)-1)))
qb=f.groupby('q5').agg(lo=('poss','min'),hi=('poss','max'),n=('win','size'),w=('win','sum'))
R['naive']=dict(r=r3(r),p=r3(p),rho=r3(rho),prho=r3(prho),U=float(u.statistic),pU=r3(u.pvalue),H=r3(kw.statistic),pH=r3(kw.pvalue),F=r3(an.statistic),pF=r3(an.pvalue),
  chi2=r3(chi2),pchi=r3(pc),dof=int(dof),cramer=r3(cv),ct=[[int(a),int(b)] for a,b in ct.values],exp=exp.round(2).tolist(),
  quint=[dict(lo=r3(a.lo),hi=r3(a.hi),n=int(a.n),w=int(a.w)) for a in qb.itertuples()])
def wilson(k,n,z=1.96):
    ph=k/n; den=1+z*z/n; c=(ph+z*z/(2*n))/den; h=z*np.sqrt(ph*(1-ph)/n+z*z/(4*n*n))/den; return c-h,c+h
edges=[0.40,0.55,0.60,0.65,0.70,0.75,0.86]
bins=[]
for a,b_ in zip(edges[:-1],edges[1:]):
    g=f[(f.poss>=a)&(f.poss<b_)]; k=int(g.win.sum()); n=len(g); lo,hi=wilson(k,n)
    bins.append(dict(a=a,b=b_,n=n,k=k,p=r3(k/n),lo=r3(lo),hi=r3(hi),d=int((g.result=='D').sum()),l=int((g.result=='L').sum())))
R['bins']=bins
json.dump(R,open(D+'/R1.json','w'),default=str)
print({k:R[k] for k in ['n','W','D','L','passes_total','shots_total','poss_mean','r_pass_time','season_r','season_r_ppg']})
print(R['naive'])
print(R['bins'])
print(R['poss_by_result'])
print(pd.DataFrame(R['managers']))
