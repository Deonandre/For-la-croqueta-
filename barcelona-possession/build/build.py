import json, re, os
B=os.path.dirname(os.path.abspath(__file__))
t=open(B+'/template.html').read(); app=open(B+'/app.js').read(); data=open(B+'/data.json').read(); math=json.load(open(B+'/math.json'))
def m(mo):
    k=mo.group(1); return math[k]
t=re.sub(r'\{\{M:(\w+)\}\}',m,t)
data=data.replace('</','<\\/')
t=t.replace('__DATA__',data).replace('__APP__',app)
out=os.environ.get('OUT',B+'/index.html')
open(out,'w').write(t)
print(out, round(len(t)/1e6,2),'MB', 'unresolved math:',len(re.findall(r'\{\{M:',t)))
