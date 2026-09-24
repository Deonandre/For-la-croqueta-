# Merge the analysis outputs into ../build/data.json for the report page
import json,os
H=os.path.dirname(os.path.abspath(__file__)); D=H+'/data'; R={}
for i in (1,2,3,4): R.update(json.load(open(f'{D}/R{i}.json')))
R['clean_level']=json.load(open(D+'/R5.json')); R.pop('_cands',None)
open(H+'/../build/data.json','w').write(json.dumps(R,separators=(',',':'),default=str)); print('ok')
