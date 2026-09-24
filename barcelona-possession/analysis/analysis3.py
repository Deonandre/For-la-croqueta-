import json, pandas as pd, numpy as np, os, warnings
from scipy import stats
import statsmodels.api as sm, statsmodels.formula.api as smf
from sklearn.metrics import roc_auc_score, brier_score_loss, log_loss, roc_curve
warnings.filterwarnings('ignore')
SP=os.path.dirname(os.path.abspath(__file__)); D=SP+'/data'
f=pd.read_pickle(D+'/master.pkl'); R={}
raw=json.load(open(D+'/features.json')); byid={r_['match_id']:r_ for r_ in raw}
r3=lambda x: None if x is None or (isinstance(x,float) and np.isnan(x)) else round(float(x),4)
sig=lambda z:1/(1+np.exp(-z))
f['P']=f.poss*100; f['Pt']=f.poss_time*100; f['E']=f.elo_diff/100
# number of passes before the first goal
pre_n=[]; first_t=[]; first_bar=[]
for r_ in f.itertuples():
    x=byid[r_.match_id]; g=x['goals']; t=g[0][0] if g else 1e9
    pre_n.append(sum(1 for v in x['pt']['bar'] if v<t)+sum(1 for v in x['pt']['opp'] if v<t)); first_t.append(g[0][0] if g else None); first_bar.append(g[0][1] if g else None)
f['pre_n']=pre_n; f['first_t']=first_t; f['first_bar']=first_bar
f['Ppre']=f.poss_pre*100; f['Plev']=f.poss_level*100
def fit(formula,data,name):
    mod=smf.logit(formula,data).fit(disp=0); null=smf.logit('win ~ 1',data).fit(disp=0); lr=2*(mod.llf-null.llf)
    pr=mod.predict(data)
    return mod,dict(name=name,formula=formula,n=int(mod.nobs),llf=r3(mod.llf),lr=r3(lr),plr=float(stats.chi2.sf(lr,mod.df_model)),mcf=r3(mod.prsquared),aic=r3(mod.aic),auc=r3(roc_auc_score(data.win,pr)),
        coefs=[dict(term=k,b=r3(mod.params[k]),se=r3(mod.bse[k]),z=r3(mod.tvalues[k]),p=float(mod.pvalues[k]),lo=r3(mod.conf_int().loc[k,0]),hi=r3(mod.conf_int().loc[k,1]),or10=r3(np.exp(10*mod.params[k]))) for k in mod.params.index])
# ---------- pre-goal possession, threshold sensitivity
sens=[]
for th in (0,50,100,150,200,300,400):
    d=f[f.pre_n>=th]; mod,o=fit('win ~ Ppre',d,f'pre>={th}')
    sens.append(dict(th=th,n=o['n'],b=o['coefs'][1]['b'],lo=o['coefs'][1]['lo'],hi=o['coefs'][1]['hi'],p=o['coefs'][1]['p'],or10=o['coefs'][1]['or10']))
R['pre_sens']=sens
TH=100; dpre=f[f.pre_n>=TH].copy(); R['pre_th']=TH; R['pre_n_kept']=len(dpre)
modpre,R['logit_pre']=fit('win ~ Ppre',dpre,'Possession before the first goal')
xs=np.arange(44,86.5,0.5); X=sm.add_constant(xs); cov=modpre.cov_params().values; eta=X@modpre.params.values; se=np.sqrt(np.einsum('ij,jk,ik->i',X,cov,X))
R['curve_pre']=dict(x=xs.tolist(),p=sig(eta).round(4).tolist(),lo=sig(eta-1.96*se).round(4).tolist(),hi=sig(eta+1.96*se).round(4).tolist())
R['pre_points']=[[r3(a),int(b)] for a,b in zip(dpre.poss_pre,dpre.win)]
r,p=stats.pointbiserialr(dpre.win,dpre.poss_pre); R['pre_r']=dict(r=r3(r),p=float(p))
R['pre_vs_whole']=dict(mean_pre=r3(dpre.poss_pre.mean()),mean_whole=r3(dpre.poss.mean()),r=r3(dpre.poss_pre.corr(dpre.poss)))
edges=[0.40,0.60,0.65,0.70,0.75,0.80,1.01]; pb=[]
def wilson(k,n,z=1.96):
    ph=k/n; den=1+z*z/n; c=(ph+z*z/(2*n))/den; h=z*np.sqrt(ph*(1-ph)/n+z*z/(4*n*n))/den; return c-h,c+h
for a,b_ in zip(edges[:-1],edges[1:]):
    g=dpre[(dpre.poss_pre>=a)&(dpre.poss_pre<b_)]; k=int(g.win.sum()); n=len(g); lo,hi=wilson(k,n)
    pb.append(dict(a=a,b=min(b_,1.0),n=n,k=k,p=r3(k/n),lo=r3(lo),hi=r3(hi)))
R['pre_bins']=pb
dl=f[f.poss_level.notna()]; _,R['logit_level']=fit('win ~ Plev',dl,'Possession while level')
# first-goal chain
fg=f[f.first_bar.notna()].copy(); fg['first_bar']=fg.first_bar.astype(int)
R['chain']=dict(n=len(fg),p_first=r3(fg.first_bar.mean()),win_if_first=r3(fg[fg.first_bar==1].win.mean()),win_if_conc_first=r3(fg[fg.first_bar==0].win.mean()),
  n_first=int((fg.first_bar==1).sum()),n_conc=int((fg.first_bar==0).sum()),nil=int(f.first_bar.isna().sum()),
  draw_if_first=r3((fg[fg.first_bar==1].result=='D').mean()),loss_if_first=r3((fg[fg.first_bar==1].result=='L').mean()),
  draw_if_conc=r3((fg[fg.first_bar==0].result=='D').mean()),loss_if_conc=r3((fg[fg.first_bar==0].result=='L').mean()))
fgp=fg[fg.pre_n>=TH].copy(); fgp['y']=fgp.first_bar
m1=smf.logit('y ~ Ppre',fgp).fit(disp=0)
R['chain']['first_model']=dict(b=r3(m1.params['Ppre']),p=float(m1.pvalues['Ppre']),or10=r3(np.exp(10*m1.params['Ppre'])),n=int(m1.nobs),
   curve=dict(x=xs.tolist(),p=m1.predict(pd.DataFrame({'Ppre':xs})).round(4).tolist()))
# ---------- Elo / opponent strength
f['E']=f.elo_diff/100
r_e,p_e=stats.pearsonr(f.elo_diff,f.poss); R['elo_poss_r']=dict(r=r3(r_e),p=float(p_e))
r_o,p_o=stats.pearsonr(f.elo_opp,f.poss); R['eloopp_poss_r']=dict(r=r3(r_o),p=float(p_o))
R['elo_points']=[[r3(a),r3(b),c] for a,b,c in zip(f.elo_opp,f.poss,f.result)]
ln=np.polyfit(f.elo_opp,f.poss,1); R['elo_line']=[r3(ln[0]),r3(ln[1])]
mods={}
for key,form,dat,nm in [('elo','win ~ E + home',f,'Elo difference + venue'),('elo_poss','win ~ E + home + P',f,'Elo + venue + whole-match possession'),
    ('elo_pre','win ~ E + home + Ppre',dpre,'Elo + venue + pre-goal possession'),('poss_sot','win ~ P + sot',f,'Possession + shots on target'),
    ('poss_sot_ga','win ~ P + sot + opp_sot',f,'Possession + shots on target (for & against)'),('xg','win ~ xg + xga',f,'xG for + xG against'),
    ('pre_elo_xg','win ~ Ppre + E + home + xg + xga',dpre,'Pre-goal possession + Elo + xG')]:
    m_,o=fit(form,dat,nm); mods[key]=o
R['models']=mods
# tier analysis: opponent Elo terciles x possession terciles
f['opp_t']=pd.qcut(f.elo_opp,3,labels=['Weaker third','Middle third','Strongest third'])
f['pos_t']=f.groupby('opp_t',observed=True).P.transform(lambda s: pd.qcut(s,3,labels=['Low','Mid','High']))
tg=f.groupby(['opp_t','pos_t'],observed=True).agg(n=('win','size'),w=('win','mean'),poss=('P','mean')).reset_index()
R['tiers']=[dict(opp=str(a.opp_t),pos=str(a.pos_t),n=int(a.n),w=r3(a.w),poss=r3(a.poss)) for a in tg.itertuples()]
R['tier_elo']=f.groupby('opp_t',observed=True).agg(lo=('elo_opp','min'),hi=('elo_opp','max'),win=('win','mean'),poss=('P','mean')).reset_index().assign(opp_t=lambda d:d.opp_t.astype(str)).round(3).to_dict('records')
# ---------- leaderboard of correlations with winning
f['xgd']=f.xg-f.xga; f['sotd']=f.sot-f.opp_sot
labels={'xgd':'xG difference','sotd':'Shots on target difference','xg':'xG created','sot':'Shots on target','elo_diff':'Pre-match Elo edge','poss_pre':'Possession before first goal','poss_level':'Possession while level',
  'shots':'Shots','pass_pct':'Pass completion','box_passes':'Completed passes into the box','poss_time':'Possession (in-play time)','field_tilt':'Field tilt (final-third pass share)',
  'poss':'Possession (pass share)','ppda':'PPDA (pressing intensity, lower = more)','opp_shots':'Shots conceded','opp_sot':'Shots on target conceded','xga':'xG conceded','home':'Playing at home','high_rec':'High ball recoveries','seq10':'10+ pass sequences'}
lb=[]
for k,lab in labels.items():
    d=f[[k,'win']].dropna(); r,p=stats.pointbiserialr(d.win,d[k]); z=np.arctanh(r); se=1/np.sqrt(len(d)-3)
    lb.append(dict(key=k,label=lab,r=r3(r),lo=r3(np.tanh(z-1.96*se)),hi=r3(np.tanh(z+1.96*se)),p=float(p),n=len(d)))
R['leaderboard']=sorted(lb,key=lambda d:-d['r'])
cm_keys=['poss','poss_pre','field_tilt','pass_pct','box_passes','shots','sot','xg','opp_sot','xga','ppda','elo_diff','gf','ga']
cm_lab={'poss':'Possession','poss_pre':'Pre-goal poss.','field_tilt':'Field tilt','pass_pct':'Pass %','box_passes':'Box entries','shots':'Shots','sot':'Shots on target','xg':'xG','opp_sot':'Opp. SoT','xga':'xG against','ppda':'PPDA','elo_diff':'Elo edge','gf':'Goals for','ga':'Goals against'}
C=f[cm_keys].corr()
R['corr_matrix']=dict(keys=[cm_lab[k] for k in cm_keys],m=C.round(3).values.tolist())
# possession vs xG / xGA
for k in ('xg','xga','sot','opp_sot','shots','opp_shots','field_tilt','box_passes','gf','ga'):
    r,p=stats.pearsonr(f.poss,f[k]); R.setdefault('poss_corrs',{})[k]=dict(r=r3(r),p=float(p))
R['xg_points']=[[r3(a),r3(b),r3(c),d] for a,b,c,d in zip(f.poss,f.xg,f.xga,f.result)]
for k in ('xg','xga'):
    ln=np.polyfit(f.poss,f[k],1); R[k+'_line']=[r3(ln[0]),r3(ln[1])]
# ---------- model ladder with leave-one-season-out CV
ladder=[('Base rate only','win ~ 1',None),('Whole-match possession','win ~ P',None),('Possession (in-play time)','win ~ Pt',None),('Pre-goal possession','win ~ Ppre','pre'),
  ('Elo edge + venue','win ~ E + home',None),('Elo + venue + pre-goal possession','win ~ E + home + Ppre','pre'),
  ('Shots on target (for & against)','win ~ sot + opp_sot',None),('Possession + shots on target','win ~ P + sot + opp_sot',None),('xG for & against','win ~ xg + xga',None),
  ('Everything','win ~ P + Ppre + E + home + xg + xga + sot + opp_sot','pre')]
f['Ppre_f']=f.Ppre.where(f.pre_n>=TH)
seasons=sorted(f.season.unique()); lad=[]; rocs={}; cal={}
for name,form,sub in ladder:
    dat=f.copy()
    if sub=='pre':
        dat=dat[dat.pre_n>=TH]
    oof=np.full(len(dat),np.nan); dat=dat.reset_index(drop=True)
    for s in seasons:
        tr=dat[dat.season!=s]; te=dat[dat.season==s]
        if len(te)==0: continue
        m_=smf.logit(form,tr).fit(disp=0) if form!='win ~ 1' else None
        oof[te.index]= m_.predict(te) if m_ is not None else tr.win.mean()
    y=dat.win.values; o=np.clip(oof,1e-6,1-1e-6)
    ent=dict(name=name,formula=form,n=len(dat),subset=sub or 'all',logloss=r3(log_loss(y,o)),brier=r3(brier_score_loss(y,o)),auc=r3(roc_auc_score(y,o)) if form!='win ~ 1' else 0.5,acc=r3(((o>0.5)==y).mean()))
    # also base on same subset
    base=np.array([dat[dat.season!=s].win.mean() for s in dat.season])
    ent['brier_base']=r3(brier_score_loss(y,base)); ent['ll_base']=r3(log_loss(y,base)); ent['bss']=r3(1-ent['brier']/ent['brier_base'])
    lad.append(ent)
    if form!='win ~ 1':
        fpr,tpr,_=roc_curve(y,o); idx=np.linspace(0,len(fpr)-1,min(len(fpr),120)).astype(int); rocs[name]=[[r3(fpr[i]),r3(tpr[i])] for i in idx]
        q=pd.qcut(o,8,duplicates='drop'); cc=pd.DataFrame({'o':o,'y':y,'q':q}).groupby('q',observed=True).agg(p=('o','mean'),a=('y','mean'),n=('y','size'))
        cal[name]=[[r3(a.p),r3(a.a),int(a.n)] for a in cc.itertuples()]
R['ladder']=lad; R['roc']=rocs; R['calibration']=cal
json.dump(R,open(D+'/R3.json','w'),default=str)
print(pd.DataFrame(sens)); print(R['logit_pre']['coefs'],R['logit_pre']['auc']); print(R['pre_r'],R['pre_vs_whole']); print(R['pre_bins'])
print(R['logit_level']['coefs']); print(R['chain'])
print(R['elo_poss_r'],R['eloopp_poss_r'])
for k,v in mods.items(): print(k, [(c['term'],c['b'],round(c['p'],4)) for c in v['coefs']], v['auc'], v['mcf'])
print(pd.DataFrame(R['tiers']))
print(pd.DataFrame(R['leaderboard'])[['label','r','p']])
print(pd.DataFrame(lad)[['name','n','logloss','ll_base','brier','brier_base','bss','auc','acc']])
print(R['poss_corrs'])
