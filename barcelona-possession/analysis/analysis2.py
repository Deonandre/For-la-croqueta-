import json, pandas as pd, numpy as np, os, warnings
from scipy import stats
import statsmodels.api as sm, statsmodels.formula.api as smf
from sklearn.metrics import roc_auc_score, brier_score_loss, log_loss
warnings.filterwarnings('ignore')
SP=os.path.dirname(os.path.abspath(__file__)); D=SP+'/data'
f=pd.read_pickle(D+'/master.pkl'); R={}
r3=lambda x: None if x is None or (isinstance(x,float) and np.isnan(x)) else round(float(x),4)
def logit_summary(formula,data,name):
    mod=smf.logit(formula,data).fit(disp=0)
    null=smf.logit('win ~ 1',data).fit(disp=0)
    lr=2*(mod.llf-null.llf); plr=stats.chi2.sf(lr,mod.df_model)
    pr=mod.predict(data)
    out=dict(name=name,formula=formula,n=int(mod.nobs),llf=r3(mod.llf),ll0=r3(null.llf),lr=r3(lr),plr=r3(plr),mcf=r3(mod.prsquared),aic=r3(mod.aic),
        auc=r3(roc_auc_score(data.win,pr)),brier=r3(brier_score_loss(data.win,pr)),brier0=r3(brier_score_loss(data.win,np.full(len(data),data.win.mean()))),
        coefs=[dict(term=k,b=r3(mod.params[k]),se=r3(mod.bse[k]),z=r3(mod.tvalues[k]),p=r3(mod.pvalues[k]),lo=r3(mod.conf_int().loc[k,0]),hi=r3(mod.conf_int().loc[k,1])) for k in mod.params.index])
    return mod,out
# x in percentage points
f['P']=f.poss*100; f['Pt']=f.poss_time*100
mod,R['logit_poss']=logit_summary('win ~ P',f,'Whole-match possession')
b=mod.params['P']; R['logit_poss']['or10']=r3(np.exp(10*b)); R['logit_poss']['or10_ci']=[r3(np.exp(10*mod.conf_int().loc['P',0])),r3(np.exp(10*mod.conf_int().loc['P',1]))]
# prediction curve with delta-method CI
xs=np.arange(44,83.5,0.5); X=sm.add_constant(xs); cov=mod.cov_params().values; eta=X@mod.params.values; se=np.sqrt(np.einsum('ij,jk,ik->i',X,cov,X))
sig=lambda z:1/(1+np.exp(-z))
R['curve_poss']=dict(x=xs.tolist(),p=sig(eta).round(4).tolist(),lo=sig(eta-1.96*se).round(4).tolist(),hi=sig(eta+1.96*se).round(4).tolist())
# gradient ascent trace on centered/scaled x for animation, plus Newton trace
x=(f.P.values-66)/10; y=f.win.values
def ll(a,b): z=a+b*x; return float(np.sum(y*z-np.log1p(np.exp(z))))
a0,b0=0.0,2.0  # deliberately poor start: steep curve
tr=[]; a,bb=a0,b0; lr_=0.0035
for i in range(400):
    pz=sig(a+bb*x); ga=np.sum(y-pz); gb=np.sum((y-pz)*x)
    if i%4==0 or i<20: tr.append([round(a,4),round(bb,4),round(ll(a,bb),3)])
    a+=lr_*ga; bb+=lr_*gb
tr.append([round(a,4),round(bb,4),round(ll(a,bb),3)])
# Newton
nt=[]; a,bb=a0,b0
for i in range(8):
    pz=sig(a+bb*x); g=np.array([np.sum(y-pz),np.sum((y-pz)*x)]); W=pz*(1-pz); H=-np.array([[W.sum(),(W*x).sum()],[(W*x).sum(),(W*x*x).sum()]])
    nt.append([round(a,4),round(bb,4),round(ll(a,bb),3)]); step=np.linalg.solve(H,g); t_=1.0
    while ll(a-t_*step[0],bb-t_*step[1])<ll(a,bb)-1e-9 and t_>1e-3: t_/=2
    a-=t_*step[0]; bb-=t_*step[1]
R['fit_trace']=dict(gd=tr,newton=nt,center=66,scale=10)
A=np.linspace(-0.5,2.5,61); B=np.linspace(-1.5,3.0,61)
R['ll_surface']=dict(a=A.round(3).tolist(),b=B.round(3).tolist(),z=[[round(ll(ai,bi),2) for ai in A] for bi in B])
# time-based possession too
_,R['logit_poss_time']=logit_summary('win ~ Pt',f,'Whole-match possession (in-play time)')
# quadratic
f['P2']=(f.P-66)**2
modq,R['logit_quad']=logit_summary('win ~ P + P2',f,'Quadratic possession')
R['logit_quad']['lr_vs_linear']=r3(2*(modq.llf-mod.llf)); R['logit_quad']['p_vs_linear']=r3(stats.chi2.sf(2*(modq.llf-mod.llf),1))
Xq=pd.DataFrame({'P':xs,'P2':(xs-66)**2}); R['curve_quad']=dict(x=xs.tolist(),p=modq.predict(Xq).round(4).tolist())
# lowess with bootstrap band
from statsmodels.nonparametric.smoothers_lowess import lowess
grid=np.arange(48,80.5,1.0); rng=np.random.default_rng(7)
lw=lowess(f.win,f.P,frac=0.6,it=0,xvals=grid)
boots=[]
for i in range(400):
    s=f.sample(len(f),replace=True,random_state=int(rng.integers(1e9))); boots.append(lowess(s.win,s.P,frac=0.6,it=0,xvals=grid))
boots=np.array(boots)
R['lowess']=dict(x=grid.tolist(),p=np.round(lw,4).tolist(),lo=np.round(np.nanpercentile(boots,2.5,axis=0),4).tolist(),hi=np.round(np.nanpercentile(boots,97.5,axis=0),4).tolist())
# ---------- score effects
gs={}
for s in ('lead','level','trail'):
    gs[s]=dict(pass_share=r3(f['poss_'+s].mean()),time_share=r3(f['ptime_'+s].mean()),n=int(f['poss_'+s].notna().sum()),minutes=r3(f['min_'+s].mean()))
R['game_state']=gs
pr={}
for a_,b_ in (('lead','level'),('trail','level'),('trail','lead')):
    d=f[['poss_'+a_,'poss_'+b_]].dropna(); t=stats.ttest_rel(d['poss_'+a_],d['poss_'+b_]); w=stats.wilcoxon(d['poss_'+a_],d['poss_'+b_])
    pr[f'{a_}_vs_{b_}']=dict(n=len(d),diff=r3((d['poss_'+a_]-d['poss_'+b_]).mean()),t=r3(t.statistic),p=float(t.pvalue),pw=float(w.pvalue),share_higher=r3(((d['poss_'+a_]-d['poss_'+b_])>0).mean()))
R['game_state_paired']=pr
R['state_min_by_result']={k:dict(lead=r3(f[f.result==k].min_lead.mean()),level=r3(f[f.result==k].min_level.mean()),trail=r3(f[f.result==k].min_trail.mean())) for k in 'WDL'}
# minute-by-minute possession by final result (5-min bins on continuous clock, 0-95)
raw=json.load(open(D+'/features.json')); byid={r_['match_id']:r_ for r_ in raw}
mb={}
for k in 'WDL':
    ids=f[f.result==k].match_id; B_=np.zeros(20); O_=np.zeros(20)
    for i in ids:
        pm=np.array(byid[i]['pm']); 
        for j in range(20): B_[j]+=pm[0,j*5:(j+1)*5].sum(); O_[j]+=pm[1,j*5:(j+1)*5].sum()
    mb[k]=(B_/(B_+O_)).round(4).tolist()
R['minute_curves']=dict(x=[j*5+2.5 for j in range(20)],**mb)
# event study around goals (censored at neighbouring goals)
W=15
es={'for':np.zeros((2,2*W)),'against':np.zeros((2,2*W))}; cnt={'for':0,'against':0}
for i in f.match_id:
    r_=byid[i]; gl=r_['goals']; tb=np.array(r_['pt']['bar']); to=np.array(r_['pt']['opp'])
    for gi,(t,isbar,mn) in enumerate(gl):
        lo=gl[gi-1][0] if gi>0 else -1e9; hi=gl[gi+1][0] if gi+1<len(gl) else 1e9
        key='for' if isbar else 'against'; cnt[key]+=1
        for j in range(-W,W):
            a1,a2=t+j,t+j+1
            if a1<lo or a2>hi: continue
            es[key][0,j+W]+=((tb>=a1)&(tb<a2)).sum(); es[key][1,j+W]+=((to>=a1)&(to<a2)).sum()
R['event_study']=dict(x=list(range(-W,W)),n_for=cnt['for'],n_against=cnt['against'],
   **{k:(es[k][0]/(es[k][0]+es[k][1])).round(4).tolist() for k in es},
   **{k+'_pre':r3(es[k][0,:W].sum()/es[k][:,:W].sum()) for k in es},**{k+'_post':r3(es[k][0,W:].sum()/es[k][:,W:].sum()) for k in es})
# match replays: per-minute rolling share
def replay(mid):
    r_=byid[mid]; pm=np.array(r_['pm'],dtype=float); n=int(np.ceil(r_['total_min']))
    b_=pm[0,:n]; o_=pm[1,:n]; k=5
    rb=np.convolve(b_,np.ones(k),'same'); ro=np.convolve(o_,np.ones(k),'same')
    row=f[f.match_id==mid].iloc[0]
    return dict(match_id=int(mid),date=row.date.strftime('%Y-%m-%d'),opponent=row.opponent,home=int(row.home),gf=int(row.gf),ga=int(row.ga),poss=r3(row.poss),
        h1=r3(r_['h1_min']),share=(rb/np.maximum(rb+ro,1)).round(3).tolist(),vol=(b_+o_).astype(int).tolist(),goals=r_['goals'],xg=r3(row.xg),xga=r3(row.xga))
cand_loss=f[f.result=='L'].sort_values('poss',ascending=False).head(5)[['date','opponent','poss','gf','ga','match_id']]
cand_win=f[f.result=='W'].sort_values('poss').head(5)[['date','opponent','poss','gf','ga','match_id']]
comeback=f[(f.result=='W')&(f.min_trail>20)].sort_values('min_trail',ascending=False).head(5)[['date','opponent','poss','gf','ga','min_trail','match_id']]
clas=f[f.opponent.str.contains('Real Madrid')][['date','opponent','poss','gf','ga','match_id','result']]
print(cand_loss); print(cand_win); print(comeback); print(clas.to_string())
R['_cands']=dict(loss=cand_loss.match_id.tolist(),win=cand_win.match_id.tolist(),cb=comeback.match_id.tolist())
R['replays']=[replay(i) for i in (3773428,16215,69299,267432)]
json.dump(R,open(D+'/R2.json','w'),default=str)
import pickle; pickle.dump(replay,open(D+'/_x','wb')) if False else None
print(R['logit_poss']); print(R['logit_quad']['p_vs_linear']); print(R['game_state']); print(R['game_state_paired']); print(R['state_min_by_result'])
print(R['minute_curves']); print({k:R['event_study'][k] for k in ['n_for','n_against','for_pre','for_post','against_pre','against_post']})
print('lowess',R['lowess']['p'])
