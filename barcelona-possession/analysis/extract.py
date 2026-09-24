import json, gzip, os, numpy as np, multiprocessing as mp
SP=os.path.dirname(os.path.abspath(__file__)); D=SP+'/data'
BAR=217
def ts(s):
    h,m,x=s.split(':'); return int(h)*3600+int(m)*60+float(x)
def feat(m):
    ev=json.load(gzip.open(f"{D}/events/{m['match_id']}.json.gz"))
    ev=[e for e in ev if e['period']<=4]
    ev.sort(key=lambda e:e['index'])
    home = m['home_team']['home_team_id']==BAR
    opp = m['away_team']['away_team_name'] if home else m['home_team']['home_team_name']
    mgr_side = m['home_team' if home else 'away_team'].get('managers') or [{}]
    # period lengths and absolute clock
    plen={}
    for e in ev: plen[e['period']]=max(plen.get(e['period'],0), ts(e['timestamp'])+(e.get('duration') or 0))
    off={}; acc=0
    for p in sorted(plen): off[p]=acc; acc+=plen[p]
    T=lambda e: off[e['period']]+ts(e['timestamp'])
    # goals
    goals=[]
    for e in ev:
        t=e['type']['name']
        if t=='Shot' and e['shot']['outcome']['name']=='Goal': goals.append((T(e), e['team']['id']==BAR, e['minute']))
        elif t=='Own Goal For': goals.append((T(e), e['team']['id']==BAR, e['minute']))
    goals.sort()
    gf=sum(1 for g in goals if g[1]); ga=len(goals)-gf
    hs,as_=m['home_score'],m['away_score']
    ok = (gf,ga)==((hs,as_) if home else (as_,hs))
    def gd_at(t):  # goal diff for Barca strictly before t
        return sum((1 if g[1] else -1) for g in goals if g[0]<t)
    first_goal_t = goals[0][0] if goals else 1e9
    state=lambda d: 'lead' if d>0 else ('trail' if d<0 else 'level')
    # passes
    P={'bar':0,'opp':0}; Ps={s:{'bar':0,'opp':0} for s in ('lead','level','trail')}
    pre={'bar':0,'opp':0}; half={1:{'bar':0,'opp':0},2:{'bar':0,'opp':0}}
    comp=0; f3={'bar':0,'opp':0}; box=0; opp_box=0
    bins=np.zeros((2,19)); pm=np.zeros((2,100)); pt={'bar':[],'opp':[]}; heat=np.zeros((8,12)); opp_heat=np.zeros((8,12))
    ppda_passes=0; ppda_def=0; press=0; high_rec=0; opp_press=0
    for e in ev:
        t=e['type']['name']; side='bar' if e['team']['id']==BAR else 'opp'
        if t=='Pass':
            tt=T(e); P[side]+=1; Ps[state(gd_at(tt))][side]+=1
            if tt<first_goal_t: pre[side]+=1
            if e['period'] in half: half[e['period']][side]+=1
            b=min(int(e['minute']//5),18); bins[0 if side=='bar' else 1,b]+=1; pm[0 if side=='bar' else 1,min(int(tt//60),99)]+=1; pt[side].append(round(tt/60,3)); 
            x,y=e['location']
            if x>=80: f3[side]+=1
            ex,ey=e['pass']['end_location'][:2]
            inbox = ex>=102 and 18<=ey<=62 and not (x>=102 and 18<=y<=62)
            if side=='bar':
                if 'outcome' not in e['pass']: comp+=1
                if inbox and 'outcome' not in e['pass']: box+=1
                heat[min(int(y//10),7),min(int(x//10),11)]+=1
            else:
                if inbox and 'outcome' not in e['pass']: opp_box+=1
                opp_heat[min(int(y//10),7),min(int(x//10),11)]+=1
                if x<72: ppda_passes+=1
        if side=='bar' and (t in ('Interception','Foul Committed') or (t=='Duel' and e.get('duel',{}).get('type',{}).get('name')=='Tackle')):
            if e.get('location') and e['location'][0]>48: ppda_def+=1
        if t=='Pressure': 
            if side=='bar': press+=1
            else: opp_press+=1
        if t=='Ball Recovery' and side=='bar' and e.get('location') and e['location'][0]>=80: high_rec+=1
    # possession sequences (in-play time)
    seq={}
    for e in ev:
        k=(e['period'],e['possession'])
        t0=ts(e['timestamp']); t1=t0+(e.get('duration') or 0)
        s=seq.setdefault(k,{'team':e['possession_team']['id'],'a':t0,'b':t1,'passes':0,'abs':off[e['period']]+t0,'bar_passes':0})
        s['b']=max(s['b'],t1)
        if e['type']['name']=='Pass' and e['team']['id']==e['possession_team']['id']: s['passes']+=1
    tim={'bar':0.,'opp':0.}; tims={s:{'bar':0.,'opp':0.} for s in ('lead','level','trail')}
    nseq={'bar':0,'opp':0}; long10=0; seqlen=[]
    for s in seq.values():
        side='bar' if s['team']==BAR else 'opp'; d=max(0.,s['b']-s['a'])
        tim[side]+=d; tims[state(gd_at(s['abs']))][side]+=d
        if s['passes']>0:
            nseq[side]+=1
            if side=='bar': seqlen.append(s['passes']); long10+= s['passes']>=10
    # minutes in each state
    cuts=[0]+[g[0] for g in goals]+[acc]; mins={'lead':0.,'level':0.,'trail':0.}
    for i in range(len(cuts)-1):
        mins[state(gd_at(cuts[i]+1e-6) if i>0 else 0)]+= (cuts[i+1]-cuts[i])/60
    # shots
    shots=[]; S={'bar':dict(n=0,sot=0,xg=0.,npxg=0.),'opp':dict(n=0,sot=0,xg=0.,npxg=0.)}
    for e in ev:
        if e['type']['name']!='Shot': continue
        side='bar' if e['team']['id']==BAR else 'opp'; sh=e['shot']; o=sh['outcome']['name']; xg=sh.get('statsbomb_xg',0) or 0
        pen = sh['type']['name']=='Penalty'
        S[side]['n']+=1; S[side]['sot']+= o in ('Goal','Saved','Saved to Post'); S[side]['xg']+=xg; S[side]['npxg']+= 0 if pen else xg
        shots.append(dict(side=side,x=round(e['location'][0],1),y=round(e['location'][1],1),xg=round(xg,4),o=o,m=e['minute'],pen=pen,st=state(gd_at(T(e)))))
    res='W' if gf>ga else ('D' if gf==ga else 'L')
    sh=lambda d: d['bar']/max(1,d['bar']+d['opp'])
    return dict(match_id=m['match_id'],date=m['match_date'],season=m['season']['season_name'],week=m.get('match_week'),
        home=int(home),opponent=opp,manager=(mgr_side[0].get('nickname') or mgr_side[0].get('name')),gf=gf,ga=ga,result=res,score_ok=ok,
        poss=sh(P),poss_time=sh(tim),poss_pre=sh(pre) if pre['bar']+pre['opp']>0 else None,poss_h1=sh(half[1]),poss_h2=sh(half[2]),
        poss_lead=sh(Ps['lead']) if sum(Ps['lead'].values())>40 else None,poss_level=sh(Ps['level']) if sum(Ps['level'].values())>40 else None,poss_trail=sh(Ps['trail']) if sum(Ps['trail'].values())>40 else None,
        ptime_lead=sh(tims['lead']) if sum(tims['lead'].values())>120 else None,ptime_level=sh(tims['level']) if sum(tims['level'].values())>120 else None,ptime_trail=sh(tims['trail']) if sum(tims['trail'].values())>120 else None,
        min_lead=mins['lead'],min_level=mins['level'],min_trail=mins['trail'],
        passes=P['bar'],opp_passes=P['opp'],pass_pct=comp/max(1,P['bar']),field_tilt=sh(f3),box_passes=box,opp_box_passes=opp_box,
        ppda=ppda_passes/max(1,ppda_def),press=press,opp_press=opp_press,high_rec=high_rec,
        shots=S['bar']['n'],sot=S['bar']['sot'],xg=S['bar']['xg'],npxg=S['bar']['npxg'],
        opp_shots=S['opp']['n'],opp_sot=S['opp']['sot'],xga=S['opp']['xg'],npxga=S['opp']['npxg'],
        seq_bar=nseq['bar'],seq_opp=nseq['opp'],seq_mean=float(np.mean(seqlen)) if seqlen else 0,seq10=long10,
        in_play_min=(tim['bar']+tim['opp'])/60,
        goals=[[round(g[0]/60,2),int(g[1]),g[2]] for g in goals],pm=pm.astype(int).tolist(),pt=pt,total_min=acc/60,h1_min=plen[1]/60,
        bins=bins.tolist(),heat=heat.tolist(),opp_heat=opp_heat.tolist(),shots_list=shots)
if __name__=='__main__':
    ms=json.load(open(D+'/matches.json'))
    with mp.Pool(os.cpu_count()) as p: rows=p.map(feat,ms)
    json.dump(rows,open(D+'/features.json','w'))
    bad=[r for r in rows if not r['score_ok']]
    print(len(rows),'score mismatches',len(bad),[(r['date'],r['opponent'],r['gf'],r['ga']) for r in bad][:10])
