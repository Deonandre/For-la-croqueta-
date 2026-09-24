import json, pandas as pd, numpy as np, os
SP=os.path.dirname(os.path.abspath(__file__)); D=SP+'/data'
f=pd.DataFrame(json.load(open(D+'/features.json'))); f['date']=pd.to_datetime(f.date)
p=pd.read_csv(D+'/elo_prematch.csv',parse_dates=['date']); prm=json.load(open(D+'/elo_params.json'))
b=p[(p.home=='FC Barcelona')|(p.visitor=='FC Barcelona')].copy()
b['bhome']=(b.home=='FC Barcelona').astype(int)
b['elo_bar']=np.where(b.bhome==1,b.elo_h,b.elo_v); b['elo_opp']=np.where(b.bhome==1,b.elo_v,b.elo_h)
b['gf']=np.where(b.bhome==1,b.hg,b.vg); b['ga']=np.where(b.bhome==1,b.vg,b.hg)
eb=[];eo=[]
for r in f.itertuples():
    c=b[(abs((b.date-r.date).dt.days)<=3)&(b.bhome==r.home)&(b.gf==r.gf)&(b.ga==r.ga)].iloc[0]
    eb.append(c.elo_bar); eo.append(c.elo_opp)
f['elo_bar']=eb; f['elo_opp']=eo
f['elo_diff']=f.elo_bar-f.elo_opp+np.where(f.home==1,prm['H'],-prm['H'])
f['elo_p']=1/(1+10**(-f.elo_diff/400))
def mgr(d):
    d=d.strftime('%Y-%m-%d')
    if d<'2008-07-01': return 'Rijkaard'
    if d<'2012-07-01': return 'Guardiola'
    if d<'2013-07-01': return 'Vilanova'
    if d<'2014-07-01': return 'Martino'
    if d<'2017-07-01': return 'Luis Enrique'
    if d<'2020-01-14': return 'Valverde'
    if d<'2020-08-18': return 'Setién'
    return 'Koeman'
f['mgr']=f.date.apply(mgr)
f['win']=(f.result=='W').astype(int)
f=f.sort_values('date').reset_index(drop=True)
f.to_pickle(D+'/master.pkl')
# Barca full league record for coverage
full=b[(b.season>=2004)&(b.season<=2020)].copy()
full['res']=np.where(full.gf>full.ga,'W',np.where(full.gf==full.ga,'D','L'))
json.dump(dict(full_n=len(full),full_w=int((full.res=='W').sum()),full_d=int((full.res=='D').sum()),full_l=int((full.res=='L').sum())),open(D+'/coverage.json','w'))
# Barca Elo series (all league matches 2004-2021) + league distribution
ser=b[(b.season>=2004)&(b.season<=2020)][['date','elo_bar','season']]
ser.to_csv(D+'/barca_elo.csv',index=False)
print(len(f), f.mgr.value_counts().to_dict(), json.load(open(D+'/coverage.json')))
print(f[['elo_bar','elo_opp','elo_diff','elo_p']].describe().round(1))
