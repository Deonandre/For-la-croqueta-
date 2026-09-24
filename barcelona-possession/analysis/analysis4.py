import json, pandas as pd, numpy as np, os, warnings
from scipy import stats
import statsmodels.api as sm, statsmodels.formula.api as smf
warnings.filterwarnings('ignore')
SP=os.path.dirname(os.path.abspath(__file__)); D=SP+'/data'
f=pd.read_pickle(D+'/master.pkl'); R={}
raw=json.load(open(D+'/features.json')); byid={r_['match_id']:r_ for r_ in raw}
r3=lambda x: None if x is None or (isinstance(x,float) and np.isnan(x)) else round(float(x),4)
f['P']=f.poss*100; f['E']=f.elo_diff/100; f['Plev']=f.poss_level*100
rng=np.random.default_rng(2026)
# ---- clean pre-goal window: exclude the final G minutes before the first goal
def clean_pre(gap):
    out=[];n=[]
    for r_ in f.itertuples():
        x=byid[r_.match_id]; g=x['goals']; t=(g[0][0]-gap) if g else 1e9
        b=sum(1 for v in x['pt']['bar'] if v<t); o=sum(1 for v in x['pt']['opp'] if v<t)
        out.append(b/(b+o) if b+o>0 else np.nan); n.append(b+o)
    return np.array(out),np.array(n)
cp=[]
for gap in (0,1,2,3,5):
    v,n=clean_pre(gap); d=f.assign(Pc=v*100,nc=n); d=d[d.nc>=100]
    m1=smf.logit('win ~ Pc',d).fit(disp=0); m2=smf.logit('win ~ Pc + E + home',d).fit(disp=0)
    fb=d[pd.notna([byid[i]['goals'][0][1] if byid[i]['goals'] else np.nan for i in d.match_id])].copy()
    fb['y']=[byid[i]['goals'][0][1] for i in fb.match_id]
    m3=smf.logit('y ~ Pc',fb).fit(disp=0); m4=smf.logit('y ~ Pc + E + home',fb).fit(disp=0)
    cp.append(dict(gap=gap,n=int(m1.nobs),or_win=r3(np.exp(10*m1.params['Pc'])),p_win=float(m1.pvalues['Pc']),or_win_elo=r3(np.exp(10*m2.params['Pc'])),p_win_elo=float(m2.pvalues['Pc']),
        or_first=r3(np.exp(10*m3.params['Pc'])),p_first=float(m3.pvalues['Pc']),or_first_elo=r3(np.exp(10*m4.params['Pc'])),p_first_elo=float(m4.pvalues['Pc'])))
R['clean_pre']=cp
# ---- "two forces" coefficient path for whole-match possession
steps=[('Raw','win ~ P'),('+ venue','win ~ P + home'),('+ Elo edge','win ~ P + home + E'),('+ minutes trailing','win ~ P + home + E + min_trail'),('+ minutes leading','win ~ P + home + E + min_trail + min_lead')]
path=[]
for nm,form in steps:
    m_=smf.logit(form,f).fit(disp=0); ci=m_.conf_int().loc['P']
    path.append(dict(step=nm,formula=form,or10=r3(np.exp(10*m_.params['P'])),lo=r3(np.exp(10*ci[0])),hi=r3(np.exp(10*ci[1])),p=float(m_.pvalues['P'])))
R['coef_path']=path
# ---- Poisson goals model + W/D/L curves
pf=smf.glm('gf ~ P + E + home',f,family=sm.families.Poisson()).fit(); pa=smf.glm('ga ~ P + E + home',f,family=sm.families.Poisson()).fit()
R['poisson']=dict(gf={k:dict(b=r3(pf.params[k]),p=float(pf.pvalues[k]),rr10=r3(np.exp(10*pf.params[k])) ) for k in pf.params.index},
                  ga={k:dict(b=r3(pa.params[k]),p=float(pa.pvalues[k]),rr10=r3(np.exp(10*pa.params[k]))) for k in pa.params.index},
                  disp_gf=r3(pf.pearson_chi2/pf.df_resid),disp_ga=r3(pa.pearson_chi2/pa.df_resid))
Emed=f.E.median(); xs=np.arange(45,83,1.0)
def wdl(l1,l2,K=12):
    g=np.arange(K); p1=stats.poisson.pmf(g,l1); p2=stats.poisson.pmf(g,l2); M=np.outer(p1,p2)
    return np.tril(M,-1).sum(),np.trace(M),np.triu(M,1).sum()
cur={'x':xs.tolist(),'W':[],'D':[],'L':[],'lf':[],'la':[]}
for x in xs:
    dd=pd.DataFrame({'P':[x],'E':[Emed],'home':[0.5]}); l1=float(pf.predict(dd)[0]); l2=float(pa.predict(dd)[0]); w,d_,l=wdl(l1,l2)
    cur['W'].append(r3(w));cur['D'].append(r3(d_));cur['L'].append(r3(l));cur['lf'].append(r3(l1));cur['la'].append(r3(l2))
R['poisson_curve']=cur
# goals distribution check: observed vs Poisson-predicted
pred_gf=pf.predict(f); pred_ga=pa.predict(f)
R['goal_dist']=dict(k=list(range(9)),obs_gf=[int((f.gf==k).sum()) for k in range(9)],exp_gf=[r3(stats.poisson.pmf(k,pred_gf).sum()) for k in range(9)],
                    obs_ga=[int((f.ga==k).sum()) for k in range(9)],exp_ga=[r3(stats.poisson.pmf(k,pred_ga).sum()) for k in range(9)])
# ---- Monte Carlo: 38-match seasons under fixed possession scenarios, opponents resampled from the real schedule
N=10000; sims={}
for P0 in (55,65,75):
    idx=rng.integers(0,len(f),(N,38)); E_=f.E.values[idx]; H_=f.home.values[idx]
    l1=np.exp(pf.params['Intercept']+pf.params['P']*P0+pf.params['E']*E_+pf.params['home']*H_)
    l2=np.exp(pa.params['Intercept']+pa.params['P']*P0+pa.params['E']*E_+pa.params['home']*H_)
    g1=rng.poisson(l1); g2=rng.poisson(l2); pts=(3*(g1>g2)+(g1==g2)).sum(1)
    h=np.bincount(pts,minlength=115)
    sims[str(P0)]=dict(mean=r3(pts.mean()),sd=r3(pts.std()),p5=int(np.percentile(pts,5)),p95=int(np.percentile(pts,95)),hist=h[:115].tolist(),sample=pts[:600].tolist(),wins=r3((g1>g2).sum(1).mean()))
R['mc']=sims
R['actual_ppg']=r3(((f.result=='W')*3+(f.result=='D')).mean())
# ---- bootstrap
B=2000; boot={'raw':[],'elo':[],'level':[]}
dl=f[f.Plev.notna()].reset_index(drop=True)
for i in range(B):
    s=f.sample(len(f),replace=True,random_state=int(rng.integers(1e9)))
    boot['raw'].append(np.exp(10*smf.logit('win ~ P',s).fit(disp=0).params['P']))
    boot['elo'].append(np.exp(10*smf.logit('win ~ P + E + home',s).fit(disp=0).params['P']))
    s2=dl.sample(len(dl),replace=True,random_state=int(rng.integers(1e9)))
    boot['level'].append(np.exp(10*smf.logit('win ~ Plev',s2).fit(disp=0).params['Plev']))
R['bootstrap']={k:dict(vals=np.round(v,4).tolist(),lo=r3(np.percentile(v,2.5)),hi=r3(np.percentile(v,97.5)),med=r3(np.median(v)),p_below1=r3(np.mean(np.array(v)<1))) for k,v in boot.items()}
# ---- permutation test on r(poss, win) and r(poss_level, win)
perm=[]; y=f.win.values.copy(); x=f.poss.values
for i in range(5000):
    perm.append(np.corrcoef(x,rng.permutation(y))[0,1])
perm=np.array(perm); obs=np.corrcoef(x,y)[0,1]
R['perm']=dict(vals=np.round(perm,4).tolist(),obs=r3(obs),p=r3(np.mean(np.abs(perm)>=abs(obs))))
perm2=[]; y2=dl.win.values.copy(); x2=dl.poss_level.values
for i in range(5000): perm2.append(np.corrcoef(x2,rng.permutation(y2))[0,1])
perm2=np.array(perm2); obs2=np.corrcoef(x2,y2)[0,1]
R['perm_level']=dict(vals=np.round(perm2,4).tolist(),obs=r3(obs2),p=r3(np.mean(np.abs(perm2)>=abs(obs2))))
# ---- sensitivity
sens=[]
def add(nm,d,form='win ~ P'):
    m_=smf.logit(form,d).fit(disp=0); k=[t for t in m_.params.index if t.startswith('P')][0]; ci=m_.conf_int().loc[k]
    sens.append(dict(name=nm,n=int(m_.nobs),or10=r3(np.exp(10*m_.params[k])),lo=r3(np.exp(10*ci[0])),hi=r3(np.exp(10*ci[1])),p=float(m_.pvalues[k])))
add('All matches',f); add('Home only',f[f.home==1]); add('Away only',f[f.home==0])
f['Pt']=f.poss_time*100; add('In-play-time possession',f,'win ~ Pt')
add('Guardiola era (2008–12)',f[f.mgr=='Guardiola']); add('Post-Guardiola (2012–21)',f[f.date>='2012-07-01']); add('Pre-2012',f[f.date<'2012-07-01'])
add('Excluding sparse seasons (2004–06)',f[f.date>='2006-07-01'])
f['nl']=(f.result!='L').astype(int); m_=smf.logit('nl ~ P',f).fit(disp=0); ci=m_.conf_int().loc['P']
sens.append(dict(name='Outcome = avoid defeat',n=int(m_.nobs),or10=r3(np.exp(10*m_.params['P'])),lo=r3(np.exp(10*ci[0])),hi=r3(np.exp(10*ci[1])),p=float(m_.pvalues['P'])))
add('Controlling Elo + venue',f,'win ~ P + E + home')
R['sensitivity']=sens
# ---- pitch heatmaps (Barça passes, share of total per match averaged) by possession quartile & result
def avg_heat(ids,key='heat'):
    H=np.zeros((8,12))
    for i in ids:
        h=np.array(byid[i][key]); H+=h/h.sum()
    return (H/len(ids)).round(5).tolist()
q=pd.qcut(f.poss,4,labels=False)
R['heat']=dict(high=avg_heat(f[q==3].match_id),low=avg_heat(f[q==0].match_id),win=avg_heat(f[f.result=='W'].match_id),loss=avg_heat(f[f.result=='L'].match_id),
  opp_high=avg_heat(f[q==3].match_id,'opp_heat'),opp_low=avg_heat(f[q==0].match_id,'opp_heat'),
  hi_range=[r3(f[q==3].poss.min()),r3(f[q==3].poss.max())],lo_range=[r3(f[q==0].poss.min()),r3(f[q==0].poss.max())],
  pass_vol_high=r3(f[q==3].passes.mean()),pass_vol_low=r3(f[q==0].passes.mean()),opp_vol_high=r3(f[q==3].opp_passes.mean()),opp_vol_low=r3(f[q==0].opp_passes.mean()))
# ---- shot zones: xG per match by zone for Barça (wins vs losses) and opponents (high vs low possession)
def shot_grid(ids,side,res=None):
    G=np.zeros((8,6)); Nn=np.zeros((8,6)); k=0
    for i in ids:
        k+=1
        for s in byid[i]['shots_list']:
            if s['side']!=side or s['pen']: continue
            x=s['x']; y=s['y']
            if x<60: continue
            gx=min(int((x-60)//10),5); gy=min(int(y//10),7); G[gy,gx]+=s['xg']; Nn[gy,gx]+=1
    return dict(xg=(G/k).round(4).tolist(),n=(Nn/k).round(4).tolist())
R['shots']=dict(bar_win=shot_grid(f[f.result=='W'].match_id,'bar'),bar_loss=shot_grid(f[f.result=='L'].match_id,'bar'),
  opp_high=shot_grid(f[q==3].match_id,'opp'),opp_low=shot_grid(f[q==0].match_id,'opp'))
# individual shot map for the replay matches
R['shotmaps']={str(i):[s for s in byid[i]['shots_list']] for i in (3773428,16215,69299,267432)}
# ---- style over time
sty=f.groupby('season').agg(seq_mean=('seq_mean','mean'),seq10=('seq10','mean'),passes=('passes','mean'),pass_pct=('pass_pct','mean'),field_tilt=('field_tilt','mean'),ppda=('ppda','mean'),press=('press','mean'),poss=('poss','mean'),xg=('xg','mean'),xga=('xga','mean')).reset_index()
R['style']=sty.round(4).to_dict('records')
# ---- Barça Elo series (all league matches)
be=pd.read_csv(D+'/barca_elo.csv',parse_dates=['date'])
R['elo_series']=[[d.strftime('%Y-%m-%d'),r3(e)] for d,e in zip(be.date,be.elo_bar)]
R['elo_params']=json.load(open(D+'/elo_params.json'))
# ---- xG efficiency by possession quartile
qq=f.groupby(q).agg(poss=('poss','mean'),xg=('xg','mean'),xga=('xga','mean'),shots=('shots','mean'),opp_shots=('opp_shots','mean'),passes=('passes','mean'),win=('win','mean'),elo=('elo_opp','mean'),min_trail=('min_trail','mean'),min_lead=('min_lead','mean')).reset_index(drop=True)
qq['xg_per100']=qq.xg/qq.passes*100
R['quartiles']=qq.round(4).to_dict('records')
json.dump(R,open(D+'/R4.json','w'),default=str)
print(pd.DataFrame(cp)); print(pd.DataFrame(path)); print(R['poisson']); print({k:(v['mean'],v['sd'],v['wins']) for k,v in sims.items()}, R['actual_ppg']*38)
print({k:(v['lo'],v['med'],v['hi'],v['p_below1']) for k,v in R['bootstrap'].items()}); print(R['perm']['obs'],R['perm']['p'],R['perm_level']['obs'],R['perm_level']['p'])
print(pd.DataFrame(sens)); print(pd.DataFrame(R['quartiles'])); print(R['goal_dist'])
