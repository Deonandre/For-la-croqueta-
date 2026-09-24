import json, gzip, os, urllib.request, concurrent.futures as cf
SP=os.path.dirname(os.path.abspath(__file__)); D=SP+'/data'; os.makedirs(D+'/events',exist_ok=True)
BASE='https://raw.githubusercontent.com/statsbomb/open-data/master/data'
def get(url, tries=4):
    for i in range(tries):
        try:
            with urllib.request.urlopen(url, timeout=60) as r: return r.read()
        except Exception as e:
            if i==tries-1: raise
seasons=[90,42,4,1,2,27,26,25,24,23,22,21,41,40,39,38,37]
matches=[]
for s in seasons:
    ms=json.loads(get(f'{BASE}/matches/11/{s}.json'))
    matches+= [m for m in ms if 'Barcelona' in (m['home_team']['home_team_name']+m['away_team']['away_team_name'])]
json.dump(matches, open(D+'/matches.json','w'))
print('matches', len(matches))
def dl(mid):
    p=f'{D}/events/{mid}.json.gz'
    if os.path.exists(p): return 0
    b=get(f'{BASE}/events/{mid}.json')
    with gzip.open(p,'wb') as f: f.write(b)
    return len(b)
with cf.ThreadPoolExecutor(16) as ex:
    tot=sum(ex.map(dl,[m['match_id'] for m in matches]))
print('bytes', tot)
