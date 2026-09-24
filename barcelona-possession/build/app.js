(function(){
"use strict";
const D=JSON.parse(document.getElementById('report-data').textContent);
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const cssv=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
let C={};
function readColors(){
  const k={w:'--w',d:'--d',l:'--l',ink:'--ink',ink2:'--ink-2',muted:'--muted',grid:'--grid',axis:'--axis',surface:'--surface',surface2:'--surface-2',
    blau:'--blau',grana:'--grana',gold:'--gold',s1:'--s1',s2:'--s2',s3:'--s3',s4:'--s4',seq0:'--seq-0',seq1:'--seq-1',mid:'--div-mid',pline:'--pitch-line',pfill:'--pitch-fill',bg:'--bg'};
  for(const [a,b] of Object.entries(k)) C[a]=cssv(b);
}
readColors();
const RC=r=>r==='W'?C.w:r==='D'?C.d:C.l;
const RN={W:'Win',D:'Draw',L:'Defeat'};
const pct=(v,d=1)=>(v*100).toFixed(d)+'%';
const f2=v=>(+v).toFixed(2), f3=v=>(+v).toFixed(3);
const comma=d3.format(',');
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const dstr=s=>{const [y,m,d]=s.split('-');return `${+d} ${MON[+m-1]} ${y}`;};
const sshort=s=>s.slice(2,4)+'/'+s.slice(7,9);
function inkOn(col){const c=d3.rgb(col);const L=(0.2126*c.r+0.7152*c.g+0.0722*c.b)/255;return L>0.56?'#0d1a33':'#ffffff';}
function qnorm(p){const a=[-39.69683028665376,220.9460984245205,-275.9285104469687,138.357751867269,-30.66479806614716,2.506628277459239],b=[-54.47609879822406,161.5858368580409,-155.6989798598866,66.80131188771972,-13.28068155288572],c=[-0.007784894002430293,-0.3223964580411365,-2.400758277161838,-2.549732539343734,4.374664141464968,2.938163982698783],d=[0.007784695709041462,0.3224671290700398,2.445134137142996,3.754408661907416];const pl=0.02425;let q,r;if(p<pl){q=Math.sqrt(-2*Math.log(p));return(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);}if(p>1-pl){q=Math.sqrt(-2*Math.log(1-p));return-(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);}q=p-0.5;r=q*q;return(((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);}
function ciFromP(or,p){const z=Math.max(qnorm(1-Math.min(Math.max(p,1e-12),0.9999)/2),0.02);const se=Math.abs(Math.log(or))/z;return [Math.exp(Math.log(or)-1.96*se),Math.exp(Math.log(or)+1.96*se)];}
const sig=z=>1/(1+Math.exp(-z));

/* ---------- tooltip ---------- */
const tipEl=$('#tip');
function tip(html,ev){tipEl.innerHTML=html;tipEl.style.opacity=1;moveTip(ev);}
function moveTip(ev){const pad=14;const r=tipEl.getBoundingClientRect();let x=ev.clientX+pad,y=ev.clientY+pad;if(x+r.width>innerWidth-8)x=ev.clientX-r.width-pad;if(y+r.height>innerHeight-8)y=ev.clientY-r.height-pad;tipEl.style.left=Math.max(8,x)+'px';tipEl.style.top=Math.max(8,y)+'px';}
function untip(){tipEl.style.opacity=0;}
const row=(a,b)=>`<div class="r"><span>${a}</span><span>${b}</span></div>`;
function matchTip(d){
  const vs=d.home?'vs':'at';
  return `<b>${dstr(d.date)}</b><br>Barça ${vs} ${d.opponent}${row('Result',`${RN[d.result]} ${d.gf}–${d.ga}`)}${row('Possession',pct(d.poss))}${d.xg!=null?row('xG',`${f2(d.xg)} – ${f2(d.xga)}`):''}`;
}

/* ---------- chart scaffolding ---------- */
function frame(el,h,m){
  el.innerHTML='';
  const W=Math.max(260,Math.floor(el.clientWidth));
  const svg=d3.select(el).append('svg').attr('width',W).attr('height',h).attr('viewBox',`0 0 ${W} ${h}`).attr('role','img');
  const g=svg.append('g').attr('transform',`translate(${m.l},${m.t})`);
  return {svg,g,W,H:h,iw:W-m.l-m.r,ih:h-m.t-m.b,m};
}
function styleAxis(s){s.selectAll('path.domain').attr('stroke',C.axis);s.selectAll('.tick line').attr('stroke',C.axis);s.selectAll('text').attr('fill',C.muted).style('font-size','11.5px').style('font-variant-numeric','tabular-nums').style('font-family','var(--sans)');}
function xAxis(g,x,ih,o={}){
  const a=d3.axisBottom(x).tickSizeOuter(0).tickSize(4).tickPadding(6);
  if(o.ticks)a.ticks(o.ticks);if(o.values)a.tickValues(o.values);if(o.fmt)a.tickFormat(o.fmt);
  const s=g.append('g').attr('transform',`translate(0,${ih})`).call(a);styleAxis(s);
  if(o.label)g.append('text').attr('x',x.range()[1]).attr('y',ih+34).attr('text-anchor','end').attr('fill',C.muted).style('font-size','11.5px').text(o.label);
  return s;
}
function yAxis(g,y,iw,o={}){
  const a=d3.axisLeft(y).tickSizeOuter(0).tickSize(0).tickPadding(8);
  if(o.ticks)a.ticks(o.ticks);if(o.values)a.tickValues(o.values);if(o.fmt)a.tickFormat(o.fmt);
  const vals=o.values||y.ticks(o.ticks||5);
  if(o.grid!==false)g.append('g').selectAll('line').data(vals).join('line').attr('x1',0).attr('x2',iw).attr('y1',d=>y(d)).attr('y2',d=>y(d)).attr('stroke',C.grid);
  const s=g.append('g').call(a);styleAxis(s);s.select('path.domain').remove();
  if(o.label)g.append('text').attr('x',-(o.lx||0)).attr('y',-12).attr('fill',C.muted).style('font-size','11.5px').text(o.label);
  return s;
}
function txt(g,x,y,t,o={}){return g.append('text').attr('x',x).attr('y',y).attr('text-anchor',o.anchor||'start').attr('fill',o.fill||C.ink2).style('font-size',(o.size||12)+'px').style('font-weight',o.weight||400).text(t);}
function hoverLayer(g,iw,ih,pts,xy,html,maxd=36){
  const del=d3.Delaunay.from(pts,d=>xy(d)[0],d=>xy(d)[1]);
  const ring=g.append('circle').attr('r',7).attr('fill','none').attr('stroke',C.ink).attr('stroke-width',1.6).style('pointer-events','none').attr('opacity',0);
  g.append('rect').attr('width',iw).attr('height',ih).attr('fill','transparent').style('cursor','crosshair')
   .on('pointermove',ev=>{const [mx,my]=d3.pointer(ev);const i=del.find(mx,my);const d=pts[i];const [px,py]=xy(d);
     if(Math.hypot(px-mx,py-my)>maxd){ring.attr('opacity',0);untip();return;}ring.attr('cx',px).attr('cy',py).attr('opacity',1);tip(html(d),ev);})
   .on('pointerleave',()=>{ring.attr('opacity',0);untip();});
}
function drawLine(path,dur=1600,delay=0){
  if(reduceMotion)return;
  const n=path.node();if(!n||!n.getTotalLength)return;const L=n.getTotalLength();
  path.attr('stroke-dasharray',`${L} ${L}`).attr('stroke-dashoffset',L).transition().delay(delay).duration(dur).ease(d3.easeCubicInOut).attr('stroke-dashoffset',0).on('end',function(){d3.select(this).attr('stroke-dasharray',null);});
}

/* ---------- pitch ---------- */
function pitch(g,s,o={}){
  const x0=o.x0||0,x1=o.x1||120;const X=v=>(v-x0)*s,Y=v=>v*s;
  const P=g.append('g').attr('class','pitch');
  if(o.fill!==false)P.append('rect').attr('x',0).attr('y',0).attr('width',X(x1)).attr('height',Y(80)).attr('fill',C.pfill);
  const L=o.linesOnTop?g.append('g'):P;
  L.attr('fill','none').attr('stroke',C.pline).attr('stroke-width',1.2).style('pointer-events','none');
  L.append('rect').attr('x',0).attr('y',0).attr('width',X(x1)).attr('height',Y(80));
  if(x0<60)L.append('line').attr('x1',X(60)).attr('x2',X(60)).attr('y1',0).attr('y2',Y(80));
  const arc=d3.arc().innerRadius(10*s).outerRadius(10*s);
  if(x0<60)L.append('circle').attr('cx',X(60)).attr('cy',Y(40)).attr('r',10*s);
  else L.append('path').attr('transform',`translate(${X(60)},${Y(40)})`).attr('d',arc({startAngle:0,endAngle:Math.PI}));
  if(x0<=0){L.append('rect').attr('x',X(0)).attr('y',Y(18)).attr('width',18*s).attr('height',44*s);L.append('rect').attr('x',X(0)).attr('y',Y(30)).attr('width',6*s).attr('height',20*s);
    L.append('path').attr('transform',`translate(${X(12)},${Y(40)})`).attr('d',arc({startAngle:0.6435,endAngle:Math.PI-0.6435}));
    L.append('circle').attr('cx',X(12)).attr('cy',Y(40)).attr('r',1.4).attr('fill',C.pline);}
  L.append('rect').attr('x',X(102)).attr('y',Y(18)).attr('width',18*s).attr('height',44*s);
  L.append('rect').attr('x',X(114)).attr('y',Y(30)).attr('width',6*s).attr('height',20*s);
  L.append('path').attr('transform',`translate(${X(108)},${Y(40)})`).attr('d',arc({startAngle:Math.PI+0.6435,endAngle:2*Math.PI-0.6435}));
  L.append('circle').attr('cx',X(108)).attr('cy',Y(40)).attr('r',1.4).attr('fill',C.pline);
  L.append('circle').attr('cx',X(60)).attr('cy',Y(40)).attr('r',1.4).attr('fill',C.pline);
  return {X,Y,P,L};
}

/* ---------- registry ---------- */
const R={};const plays={};
function render(el){const k=el.dataset.chart;if(R[k]){try{R[k](el);}catch(e){console.error('chart',k,e);}}el._w=el.clientWidth;}
function renderAll(){readColors();$$('[data-chart]').forEach(render);}

/* ===== Fig 1: hero beeswarm ===== */
R.hero=el=>{
  const M=D.matches, small=el.clientWidth<640, r=small?2.5:4.4, h=small?280:320;
  const f=frame(el,h,{t:34,r:16,b:36,l:16});
  const x=d3.scaleLinear([0.42,0.85],[0,f.iw]);const cy=f.ih/2+4;
  f.g.append('circle').attr('cx',x(.5)).attr('cy',cy).attr('r',Math.min(64,f.ih*.3)).attr('fill','none').attr('stroke',C.pline).attr('stroke-width',1.4);
  f.g.append('line').attr('x1',x(.5)).attr('x2',x(.5)).attr('y1',-6).attr('y2',f.ih).attr('stroke',C.pline).attr('stroke-width',1.4);
  txt(f.g,x(.5)-6,-14,small?'50%':'50% · equal possession',{anchor:'end',size:11.5,fill:C.muted});
  xAxis(f.g,x,f.ih,{values:[.45,.5,.55,.6,.65,.7,.75,.8,.85],fmt:d3.format('.0%'),label:small?'':'Barcelona share of passes'});
  const nodes=M.map(d=>({...d,x:x(d.poss),y:cy}));
  const sim=d3.forceSimulation(nodes).force('x',d3.forceX(d=>x(d.poss)).strength(1)).force('y',d3.forceY(cy).strength(small?0.07:0.05)).force('c',d3.forceCollide(r+0.7)).stop();
  for(let i=0;i<240;i++)sim.tick();
  nodes.forEach(n=>{n.y=Math.max(r,Math.min(f.ih-r-2,n.y));});
  const dots=f.g.append('g').selectAll('circle').data(nodes).join('circle').attr('cx',d=>d.x).attr('cy',d=>d.y).attr('r',r).attr('fill',d=>RC(d.result)).attr('stroke',C.surface).attr('stroke-width',1);
  const hi=nodes.reduce((a,b)=>a.poss>b.poss?a:b), lo=nodes.reduce((a,b)=>a.poss<b.poss?a:b);
  const ann=f.g.append('g').style('pointer-events','none');
  [[hi,'end',small?'Cádiz 2–1 · 82%':'Cádiz 2–1 Barça · 82.3%',12],[lo,'start',small?'Betis 1–4 · 44%':'Betis 1–4 Barça · 44.0%',small?28:12]].forEach(([n,anch,t,ty])=>{ann.append('line').attr('x1',n.x).attr('x2',n.x).attr('y1',n.y-r-2).attr('y2',ty+4).attr('stroke',C.ink2).attr('stroke-width',1);
    txt(ann,n.x+(anch==='end'?4:-4),ty,t,{anchor:anch,size:small?10.5:12,fill:C.ink,weight:600});
  });
  const tick=txt(f.g,0,-14,'',{size:12,fill:C.ink,weight:600});
  hoverLayer(f.g,f.iw,f.ih,nodes,d=>[d.x,d.y],matchTip,24);
  plays.hero=()=>{
    if(reduceMotion)return;
    const order=nodes.map((d,i)=>i).sort((a,b)=>nodes[a].date<nodes[b].date?-1:1);const rank=new Map(order.map((k,i)=>[k,i]));
    ann.attr('opacity',0);
    dots.interrupt().attr('cy',-30).attr('opacity',0)
      .transition().delay((d,i)=>rank.get(i)*6).duration(650).ease(d3.easeBackOut.overshoot(1.2)).attr('cy',d=>d.y).attr('opacity',1);
    const total=order.length*6+650;const t0=performance.now();
    const tm=d3.timer(()=>{const k=Math.min(order.length-1,Math.floor((performance.now()-t0)/6));tick.text('Season '+nodes[order[k]].season.replace('/','/'));
      if(performance.now()-t0>total){tm.stop();tick.text('');ann.transition().duration(500).attr('opacity',1);}});
  };
};

/* ===== Fig 3: possession definitions ===== */
R.defs=el=>{
  const f=frame(el,300,{t:24,r:12,b:40,l:44});
  const x=d3.scaleLinear([0.42,0.86],[0,f.iw]),y=d3.scaleLinear([0.42,0.86],[f.ih,0]);
  yAxis(f.g,y,f.iw,{values:[.45,.55,.65,.75,.85],fmt:d3.format('.0%'),label:'In-play time share',lx:40});
  xAxis(f.g,x,f.ih,{values:[.45,.55,.65,.75,.85],fmt:d3.format('.0%'),label:'Pass share'});
  f.g.append('line').attr('x1',x(.42)).attr('y1',y(.42)).attr('x2',x(.86)).attr('y2',y(.86)).attr('stroke',C.axis).attr('stroke-width',1.2);
  f.g.append('g').selectAll('circle').data(D.matches).join('circle').attr('cx',d=>x(d.poss)).attr('cy',d=>y(d.poss_time)).attr('r',2.6).attr('fill',C.s1).attr('opacity',.55);
  txt(f.g,x(.44),y(.83),'r = 0.94',{size:13,fill:C.ink,weight:600});
  hoverLayer(f.g,f.iw,f.ih,D.matches,d=>[x(d.poss),y(d.poss_time)],d=>matchTip(d)+row('Time share',pct(d.poss_time)));
};

/* ===== Fig 4: zones ===== */
R.zones=el=>{
  const W=el.clientWidth;const s=Math.min((W-20)/120,5.2);const h=80*s+58;
  const f=frame(el,h,{t:34,r:10,b:24,l:10});
  const ox=(f.iw-120*s)/2;const g=f.g.append('g').attr('transform',`translate(${ox},0)`);
  const X=v=>v*s,Y=v=>v*s;
  g.append('rect').attr('width',X(120)).attr('height',Y(80)).attr('fill',C.pfill);
  g.append('rect').attr('x',X(80)).attr('y',0).attr('width',X(40)).attr('height',Y(80)).attr('fill',C.blau).attr('opacity',.14);
  g.append('rect').attr('x',X(102)).attr('y',Y(18)).attr('width',18*s).attr('height',44*s).attr('fill',C.grana).attr('opacity',.16);
  pitch(g,s,{fill:false});
  // bracket for PPDA zone
  const by=-14;g.append('path').attr('d',`M${X(48)},${by+6} V${by} H${X(120)} V${by+6}`).attr('fill','none').attr('stroke',C.ink2);
  txt(g,X(84),by-5,'PPDA zone: opponent’s own 60% (x > 48)',{anchor:'middle',size:11.5,fill:C.ink2});
  txt(g,X(100),Y(80)+16,'Final third (x ≥ 80)',{anchor:'middle',size:11.5,fill:C.ink2});
  txt(g,X(111),Y(40)+4,'Box',{anchor:'middle',size:11.5,fill:C.ink,weight:600});
  // direction arrow
  g.append('path').attr('d',`M${X(30)},${Y(40)} H${X(46)}`).attr('stroke',C.ink2).attr('stroke-width',1.5).attr('marker-end','url(#arr-z)');
  const defs=f.svg.append('defs');defs.append('marker').attr('id','arr-z').attr('viewBox','0 0 10 10').attr('refX',8).attr('refY',5).attr('markerWidth',7).attr('markerHeight',7).attr('orient','auto').append('path').attr('d','M0,0 L10,5 L0,10z').attr('fill',C.ink2);
  txt(g,X(38),Y(40)-8,'Attack',{anchor:'middle',size:11,fill:C.ink2});
  txt(g,0,Y(80)+16,'0',{size:10.5,fill:C.muted});txt(g,X(120),Y(80)+16,'',{anchor:'end'});
  txt(g,X(60),Y(80)+16,'60',{anchor:'middle',size:10.5,fill:C.muted});
};

/* ===== Fig 5: Elo series ===== */
const MGR_BANDS=[['Rijkaard','2004-07-01','2008-07-01'],['Guardiola','2008-07-01','2012-07-01'],['Vilanova','2012-07-01','2013-07-01'],['Martino','2013-07-01','2014-07-01'],['Luis Enrique','2014-07-01','2017-07-01'],['Valverde','2017-07-01','2020-01-14'],['Setién','2020-01-14','2020-08-18'],['Koeman','2020-08-18','2021-06-30']];
R.elo=el=>{
  const S=D.elo_series.map(d=>({t:new Date(d[0]),e:d[1]}));
  const f=frame(el,280,{t:28,r:14,b:34,l:44});
  const x=d3.scaleTime([new Date('2004-07-01'),new Date('2021-06-30')],[0,f.iw]);const y=d3.scaleLinear([1560,1820],[f.ih,0]);
  MGR_BANDS.forEach((b,i)=>{const a=x(new Date(b[1])),c=x(new Date(b[2]));
    f.g.append('rect').attr('x',a).attr('y',0).attr('width',c-a).attr('height',f.ih).attr('fill',i%2?C.surface2:'transparent');
    if(c-a>46)txt(f.g,(a+c)/2,-8,b[0],{anchor:'middle',size:11,fill:C.muted});});
  yAxis(f.g,y,f.iw,{values:[1600,1650,1700,1750,1800],label:'Elo',lx:40});
  xAxis(f.g,x,f.ih,{ticks:el.clientWidth<600?5:9,fmt:d3.timeFormat('%Y')});
  const ln=d3.line().x(d=>x(d.t)).y(d=>y(d.e)).curve(d3.curveMonotoneX);
  f.g.append('path').datum(S).attr('d',ln).attr('fill','none').attr('stroke',C.s1).attr('stroke-width',2);
  const mx=S.reduce((a,b)=>a.e>b.e?a:b);f.g.append('circle').attr('cx',x(mx.t)).attr('cy',y(mx.e)).attr('r',4.5).attr('fill',C.s1).attr('stroke',C.surface).attr('stroke-width',2);
  txt(f.g,x(mx.t)+8,y(mx.e)+4,`Peak ${Math.round(mx.e)}`,{size:11.5,fill:C.ink,weight:600});
  const bis=d3.bisector(d=>d.t).center;const dot=f.g.append('circle').attr('r',4).attr('fill',C.s1).attr('stroke',C.surface).attr('stroke-width',2).attr('opacity',0);
  const vl=f.g.append('line').attr('y1',0).attr('y2',f.ih).attr('stroke',C.axis).attr('opacity',0);
  f.g.append('rect').attr('width',f.iw).attr('height',f.ih).attr('fill','transparent').on('pointermove',ev=>{const [mx_]=d3.pointer(ev);const d=S[bis(S,x.invert(mx_))];
    dot.attr('cx',x(d.t)).attr('cy',y(d.e)).attr('opacity',1);vl.attr('x1',x(d.t)).attr('x2',x(d.t)).attr('opacity',1);
    tip(`<b>${d3.timeFormat('%-d %b %Y')(d.t)}</b>${row('Barça Elo',Math.round(d.e))}`,ev);}).on('pointerleave',()=>{dot.attr('opacity',0);vl.attr('opacity',0);untip();});
};

/* ===== Fig 6: histogram ===== */
R.hist=el=>{
  const f=frame(el,280,{t:26,r:10,b:40,l:36});
  const edges=d3.range(44,86,2);const bins=edges.map(a=>({a,W:0,D:0,L:0}));
  D.matches.forEach(m=>{const i=Math.min(bins.length-1,Math.max(0,Math.floor((m.poss*100-44)/2)));bins[i][m.result]++;});
  const x=d3.scaleBand(edges.map(String),[0,f.iw]).paddingInner(0);const ymax=d3.max(bins,b=>b.W+b.D+b.L);
  const y=d3.scaleLinear([0,Math.ceil(ymax/10)*10],[f.ih,0]);
  yAxis(f.g,y,f.iw,{ticks:4,label:'Matches',lx:32});
  const st=d3.stack().keys(['W','D','L'])(bins);
  const bw=Math.min(24,x.bandwidth()-2);
  st.forEach(layer=>{f.g.append('g').selectAll('rect').data(layer).join('rect').attr('x',d=>x(String(d.data.a))+(x.bandwidth()-bw)/2).attr('width',bw)
    .attr('y',d=>y(d[1])+ (d[1]>d[0]?1:0)).attr('height',d=>Math.max(0,y(d[0])-y(d[1])-(d[1]>d[0]?2:0))).attr('fill',RC(layer.key)).attr('rx',1.5)
    .on('pointermove',(ev,d)=>tip(`<b>${d.data.a}–${d.data.a+2}% possession</b>${row('Wins',d.data.W)}${row('Draws',d.data.D)}${row('Defeats',d.data.L)}${row('Win rate',(d.data.W+d.data.D+d.data.L)?pct(d.data.W/(d.data.W+d.data.D+d.data.L),0):'–')}`,ev)).on('pointerleave',untip);});
  const xa=d3.axisBottom(d3.scaleLinear([44,86],[0,f.iw])).tickValues([45,50,55,60,65,70,75,80,85]).tickFormat(d=>d+'%').tickSizeOuter(0).tickSize(4);
  styleAxis(f.g.append('g').attr('transform',`translate(0,${f.ih})`).call(xa));
};

/* ===== Fig 7: KDE ===== */
R.kde=el=>{
  const f=frame(el,260,{t:22,r:14,b:38,l:40});const K=D.kde;
  const x=d3.scaleLinear([0.4,0.86],[0,f.iw]);const y=d3.scaleLinear([0,d3.max(['W','D','L'],k=>d3.max(K[k]))*1.08],[f.ih-14,0]);
  yAxis(f.g,y,f.iw,{ticks:4,label:'Density',lx:36});
  xAxis(f.g,x,f.ih,{values:[.45,.5,.55,.6,.65,.7,.75,.8,.85],fmt:d3.format('.0%')});
  ['L','D','W'].forEach(k=>{
    const ln=d3.line().x((d,i)=>x(K.x[i])).y(d=>y(d)).curve(d3.curveBasis);
    f.g.append('path').datum(K[k]).attr('d',ln).attr('fill','none').attr('stroke',RC(k)).attr('stroke-width',2.2);
    const m=D.poss_by_result[k].mean;f.g.append('line').attr('x1',x(m)).attr('x2',x(m)).attr('y1',f.ih-12).attr('y2',f.ih-2).attr('stroke',RC(k)).attr('stroke-width',2.5);
  });
  txt(f.g,f.iw,8,'Means: W 65.7% · D 66.3% · L 66.4%',{anchor:'end',size:11.5,fill:C.ink2});
};

/* ===== Fig 8: seasons two-panel ===== */
function seasonBands(g,x,h,S){
  let cur=null,start=0;const groups=[];
  S.forEach((s,i)=>{const m=s.mgr.split(' / ')[0];if(m!==cur){if(cur)groups.push([cur,start,i-1]);cur=m;start=i;}});groups.push([cur,start,S.length-1]);
  groups.forEach((gp,i)=>{const a=x(S[gp[1]].season),b=x(S[gp[2]].season)+x.bandwidth();if(i%2)g.append('rect').attr('x',a).attr('y',0).attr('width',b-a).attr('height',h).attr('fill',C.surface2);});
  return groups;
}
R.seasons=el=>{
  const S=D.seasons_tbl;const small=el.clientWidth<620;
  const f=frame(el,420,{t:34,r:10,b:36,l:44});
  const x=d3.scaleBand(S.map(d=>d.season),[0,f.iw]).padding(.25);
  const h1=f.ih*0.46,gap=f.ih*0.1,h2=f.ih-h1-gap;
  const groups=seasonBands(f.g,x,f.ih,S);
  groups.forEach(gp=>{const a=x(S[gp[1]].season),b=x(S[gp[2]].season)+x.bandwidth();if(b-a>40)txt(f.g,(a+b)/2,-12,gp[0].replace('Luis Enrique','L. Enrique'),{anchor:'middle',size:small?9.5:11,fill:C.muted});});
  const y1=d3.scaleLinear([0.58,0.73],[h1,0]);
  const g1=f.g.append('g');yAxis(g1,y1,f.iw,{values:[.6,.65,.7],fmt:d3.format('.0%')});
  txt(g1,-40,-2,'',{});
  const ln=d3.line().x(d=>x(d.season)+x.bandwidth()/2).y(d=>y1(d.poss));
  g1.append('path').datum(S).attr('d',ln).attr('fill','none').attr('stroke',C.s1).attr('stroke-width',2);
  g1.selectAll('circle').data(S).join('circle').attr('cx',d=>x(d.season)+x.bandwidth()/2).attr('cy',d=>y1(d.poss)).attr('r',4).attr('fill',C.s1).attr('stroke',C.surface).attr('stroke-width',2);
  txt(g1,4,12,'Possession',{size:12,fill:C.ink,weight:600});
  const g2=f.g.append('g').attr('transform',`translate(0,${h1+gap})`);const y2=d3.scaleLinear([0,1],[h2,0]);
  yAxis(g2,y2,f.iw,{values:[0,.25,.5,.75,1],fmt:d3.format('.0%')});
  const bw=Math.min(24,x.bandwidth());
  g2.selectAll('rect.b').data(S).join('rect').attr('x',d=>x(d.season)+(x.bandwidth()-bw)/2).attr('width',bw).attr('y',d=>y2(d.win)).attr('height',d=>h2-y2(d.win)).attr('fill',C.w).attr('rx',3);
  g2.selectAll('rect.b2').data(S).join('rect').attr('x',d=>x(d.season)+(x.bandwidth()-bw)/2).attr('width',bw).attr('y',d=>y2(d.win)+3).attr('height',d=>Math.max(0,h2-y2(d.win)-3)).attr('fill',C.w);
  txt(g2,4,-4,'Win rate',{size:12,fill:C.ink,weight:600});
  const xa=d3.axisBottom(x).tickFormat(sshort).tickSize(0).tickPadding(8);const xs=f.g.append('g').attr('transform',`translate(0,${f.ih})`).call(xa);styleAxis(xs);xs.select('.domain').attr('stroke',C.axis);
  if(small)xs.selectAll('text').attr('transform','rotate(-45)').attr('text-anchor','end').attr('dx','-2').attr('dy','4');
  f.g.append('g').selectAll('rect').data(S).join('rect').attr('x',d=>x(d.season)-x.step()*x.padding()/2).attr('width',x.step()).attr('y',0).attr('height',f.ih).attr('fill','transparent')
    .on('pointermove',(ev,d)=>tip(`<b>${d.season}</b> · ${d.mgr}${row('Matches',d.n)}${row('Possession',pct(d.poss))}${row('Win rate',pct(d.win))}${row('Points per game',f2(d.ppg))}${row('xG for / against',`${f2(d.xg)} / ${f2(d.xga)}`)}`,ev)).on('pointerleave',untip);
};

/* ===== Fig 9: win rate bins ===== */
R.bins=el=>{
  const B=D.bins;const f=frame(el,290,{t:26,r:16,b:52,l:44});
  const labs=B.map((b,i)=>i===0?'< 55%':i===B.length-1?'≥ 75%':`${Math.round(b.a*100)}–${Math.round(b.b*100)}%`);
  const x=d3.scaleBand(labs,[0,f.iw]).padding(.3);const y=d3.scaleLinear([0.45,0.9],[f.ih,0]);
  yAxis(f.g,y,f.iw,{values:[.5,.6,.7,.8,.9],fmt:d3.format('.0%'),label:'Share of matches won',lx:40});
  const xs=f.g.append('g').attr('transform',`translate(0,${f.ih})`).call(d3.axisBottom(x).tickSize(0).tickPadding(8));styleAxis(xs);
  B.forEach((b,i)=>txt(f.g,x(labs[i])+x.bandwidth()/2,f.ih+36,`n = ${b.n}`,{anchor:'middle',size:11,fill:C.muted}));
  const base=386/524;f.g.append('line').attr('x1',0).attr('x2',f.iw).attr('y1',y(base)).attr('y2',y(base)).attr('stroke',C.grana).attr('stroke-width',1.5);
  txt(f.g,f.iw,y(base)-6,'All matches 73.7%',{anchor:'end',size:11.5,fill:C.ink2});
  const g=f.g.append('g');
  B.forEach((b,i)=>{const cx=x(labs[i])+x.bandwidth()/2;
    g.append('line').attr('x1',cx).attr('x2',cx).attr('y1',y(b.lo)).attr('y2',y(b.hi)).attr('stroke',C.s1).attr('stroke-width',2);
    [b.lo,b.hi].forEach(v=>g.append('line').attr('x1',cx-6).attr('x2',cx+6).attr('y1',y(v)).attr('y2',y(v)).attr('stroke',C.s1).attr('stroke-width',2));
    g.append('circle').attr('cx',cx).attr('cy',y(b.p)).attr('r',6).attr('fill',C.s1).attr('stroke',C.surface).attr('stroke-width',2);
    txt(g,cx+10,y(b.p)+4,pct(b.p),{size:11.5,fill:C.ink,weight:600});
    g.append('rect').attr('x',x(labs[i])).attr('width',x.bandwidth()).attr('y',0).attr('height',f.ih).attr('fill','transparent')
      .on('pointermove',ev=>tip(`<b>${labs[i]} possession</b>${row('Matches',b.n)}${row('Won / drawn / lost',`${b.k} / ${b.d} / ${b.l}`)}${row('Win rate',pct(b.p))}${row('95% Wilson CI',`${pct(b.lo)} – ${pct(b.hi)}`)}`,ev)).on('pointerleave',untip);
  });
};

/* ===== Fig 10: season scatter ===== */
R.seasonScatter=el=>{
  const S=D.seasons_tbl;const f=frame(el,300,{t:20,r:20,b:40,l:44});
  const x=d3.scaleLinear([0.595,0.715],[0,f.iw]),y=d3.scaleLinear([0.5,1.02],[f.ih,0]);
  yAxis(f.g,y,f.iw,{values:[.5,.6,.7,.8,.9,1],fmt:d3.format('.0%'),label:'Win rate',lx:40});
  xAxis(f.g,x,f.ih,{values:[.6,.62,.64,.66,.68,.7],fmt:d3.format('.0%'),label:'Mean possession'});
  const xm=d3.mean(S,d=>d.poss),ym=d3.mean(S,d=>d.win);const b=d3.sum(S,d=>(d.poss-xm)*(d.win-ym))/d3.sum(S,d=>(d.poss-xm)**2);
  f.g.append('line').attr('x1',x(.6)).attr('x2',x(.71)).attr('y1',y(ym+b*(.6-xm))).attr('y2',y(ym+b*(.71-xm))).attr('stroke',C.grana).attr('stroke-width',1.5);
  const rs=d3.scaleSqrt([0,40],[0,9]);
  f.g.selectAll('circle').data(S).join('circle').attr('cx',d=>x(d.poss)).attr('cy',d=>y(d.win)).attr('r',d=>Math.max(4,rs(d.n))).attr('fill',C.s1).attr('opacity',.8).attr('stroke',C.surface).attr('stroke-width',1.5);
  f.g.selectAll('text.sl').data(S).join('text').attr('x',d=>x(d.poss)+rs(d.n)+3).attr('y',d=>y(d.win)+4).text(d=>sshort(d.season)).style('font-size','10.5px').attr('fill',C.muted);
  txt(f.g,f.iw,14,'r = −0.01 (p = 0.96)',{anchor:'end',size:12,fill:C.ink,weight:600});
  hoverLayer(f.g,f.iw,f.ih,S,d=>[x(d.poss),y(d.win)],d=>`<b>${d.season}</b> · ${d.mgr}${row('Matches',d.n)}${row('Possession',pct(d.poss))}${row('Win rate',pct(d.win))}`);
};

/* ===== Fig 11: fitting animation ===== */
const FIT={alg:'gd',i:null,hooks:{},timer:null};
function fitFrames(){return FIT.alg==='gd'?D.fit_trace.gd:D.fit_trace.newton;}
function fitUpdate(i){
  const fr=fitFrames();FIT.i=Math.max(0,Math.min(fr.length-1,i));const [a,b,ll]=fr[FIT.i];
  const b1=b/10,b0=a-b*6.6;
  $('#fit-readout').innerHTML=`<span>Step <b>${FIT.i}</b> of ${fr.length-1}</span><span>β₀ <b>${b0.toFixed(3)}</b></span><span>β₁ <b>${b1.toFixed(4)}</b> per point</span><span>OR₁₀ <b>${Math.exp(10*b1).toFixed(2)}</b></span><span>ℓ <b>${ll.toFixed(1)}</b></span>`;
  Object.values(FIT.hooks).forEach(h=>h(FIT.i));
}
R.fitSurface=el=>{
  const S=D.ll_surface;const W=el.clientWidth;const h=Math.min(330,Math.max(260,W*0.8));
  const f=frame(el,h,{t:20,r:12,b:40,l:46});
  const x=d3.scaleLinear([S.a[0],S.a[S.a.length-1]],[0,f.iw]),y=d3.scaleLinear([S.b[0],S.b[S.b.length-1]],[f.ih,0]);
  const n=S.a.length,m=S.b.length;const vals=new Array(n*m);for(let j=0;j<m;j++)for(let i=0;i<n;i++)vals[j*n+i]=S.z[j][i];
  const th=[-900,-700,-560,-470,-410,-370,-345,-328,-316,-308,-304,-302.3];
  const cont=d3.contours().size([n,m]).thresholds(th)(vals);
  const sx=d3.scaleLinear([0,n-1],[0,f.iw]),sy=d3.scaleLinear([0,m-1],[f.ih,0]);
  const proj=d3.geoTransform({point(px,py){this.stream.point(sx(px-0.5),sy(py-0.5));}});
  const col=d3.scaleLinear([0,th.length-1],[C.seq0,C.seq1]).interpolate(d3.interpolateRgb);
  const clip='clipfs'+Math.random().toString(36).slice(2,7);
  f.svg.append('defs').append('clipPath').attr('id',clip).append('rect').attr('width',f.iw).attr('height',f.ih);
  f.g.append('g').attr('clip-path',`url(#${clip})`).selectAll('path').data(cont).join('path').attr('d',d3.geoPath(proj)).attr('fill',(d,i)=>col(i)).attr('stroke',C.surface).attr('stroke-width',.6).attr('stroke-opacity',.6);
  xAxis(f.g,x,f.ih,{ticks:5,label:'intercept (at 66% possession)'});
  const ya=f.g.append('g').call(d3.axisLeft(y).ticks(5).tickSize(4).tickSizeOuter(0));styleAxis(ya);
  txt(f.g,0,-4,'slope per 10 pts ↑',{size:11,fill:C.muted});
  f.g.append('line').attr('x1',0).attr('x2',f.iw).attr('y1',y(0)).attr('y2',y(0)).attr('stroke',C.ink2).attr('stroke-opacity',.35);
  txt(f.g,f.iw-4,y(0)-5,'slope = 0: possession irrelevant',{anchor:'end',size:10.5,fill:C.ink2});
  const pathG=f.g.append('path').attr('fill','none').attr('stroke',C.grana).attr('stroke-width',2);
  const pts=f.g.append('g');
  const dot=f.g.append('circle').attr('r',6).attr('fill',C.grana).attr('stroke',C.surface).attr('stroke-width',2);
  const start=f.g.append('circle').attr('r',4).attr('fill',C.surface).attr('stroke',C.grana).attr('stroke-width',2);
  FIT.hooks.surf=i=>{const fr=fitFrames().slice(0,i+1);pathG.attr('d',d3.line().x(d=>x(d[0])).y(d=>y(d[1]))(fr));
    pts.selectAll('circle').data(FIT.alg==='newton'?fr:[]).join('circle').attr('cx',d=>x(d[0])).attr('cy',d=>y(d[1])).attr('r',3).attr('fill',C.grana);
    const c=fr[fr.length-1];dot.attr('cx',x(c[0])).attr('cy',y(c[1]));const s0=fitFrames()[0];start.attr('cx',x(s0[0])).attr('cy',y(s0[1]));};
  fitUpdate(FIT.i==null?fitFrames().length-1:FIT.i);
};
R.fitCurve=el=>{
  const W=el.clientWidth;const h=Math.min(330,Math.max(260,W*0.8));
  const f=frame(el,h,{t:14,r:12,b:40,l:40});
  const x=d3.scaleLinear([43,84],[0,f.iw]),y=d3.scaleLinear([-0.08,1.08],[f.ih,0]);
  yAxis(f.g,y,f.iw,{values:[0,.25,.5,.75,1],fmt:d3.format('.0%')});
  xAxis(f.g,x,f.ih,{values:[45,55,65,75],fmt:d=>d+'%',label:'possession'});
  const rng=d3.randomLcg(7);const jit=()=>(rng()-.5)*0.09;
  f.g.append('g').selectAll('circle').data(D.matches).join('circle').attr('cx',d=>x(d.poss*100)).attr('cy',d=>y((d.result==='W'?1:0)+jit())).attr('r',2.2).attr('fill',d=>d.result==='W'?C.w:C.muted).attr('opacity',.45);
  txt(f.g,4,y(1)-10,'wins',{size:11,fill:C.ink2});txt(f.g,4,y(0)+16,'draws & defeats',{size:11,fill:C.ink2});
  f.g.append('line').attr('x1',0).attr('x2',f.iw).attr('y1',y(386/524)).attr('y2',y(386/524)).attr('stroke',C.axis);
  const cur=f.g.append('path').attr('fill','none').attr('stroke',C.grana).attr('stroke-width',2.6);
  const xs=d3.range(43,84.1,0.5);
  FIT.hooks.curve=i=>{const [a,b]=fitFrames()[i];cur.attr('d',d3.line().x(v=>x(v)).y(v=>y(sig(a+b*(v-66)/10)))(xs));};
  FIT.hooks.curve(FIT.i==null?fitFrames().length-1:FIT.i);
};
function fitPlay(){
  if(FIT.timer){FIT.timer.stop();FIT.timer=null;}
  const fr=fitFrames();let i=0;fitUpdate(0);
  if(reduceMotion){fitUpdate(fr.length-1);return;}
  const dt=FIT.alg==='gd'?45:750;let last=performance.now();
  FIT.timer=d3.timer(()=>{const now=performance.now();if(now-last>=dt){last=now;i++;fitUpdate(i);if(i>=fr.length-1){FIT.timer.stop();FIT.timer=null;}}});
}

/* ===== Fig 12: predictor ===== */
let PM='whole';
R.predictor=el=>{
  const cv=PM==='whole'?D.curve_poss:D.curve_pre;
  const f=frame(el,280,{t:18,r:16,b:40,l:44});
  const x=d3.scaleLinear([44,83],[0,f.iw]),y=d3.scaleLinear([0.4,1],[f.ih,0]);
  yAxis(f.g,y,f.iw,{values:[.4,.5,.6,.7,.8,.9,1],fmt:d3.format('.0%'),label:'P(win)',lx:40});
  xAxis(f.g,x,f.ih,{values:[45,50,55,60,65,70,75,80],fmt:d=>d+'%',label:PM==='whole'?'whole-match possession':'possession before the first goal'});
  const pts=cv.x.map((v,i)=>({x:v,p:cv.p[i],lo:cv.lo[i],hi:cv.hi[i]})).filter(d=>d.x<=83);
  f.g.append('path').datum(pts).attr('d',d3.area().x(d=>x(d.x)).y0(d=>y(d.lo)).y1(d=>y(d.hi))).attr('fill',C.s1).attr('opacity',.14);
  f.g.append('line').attr('x1',0).attr('x2',f.iw).attr('y1',y(386/524)).attr('y2',y(386/524)).attr('stroke',C.grana).attr('stroke-width',1.2);
  txt(f.g,4,y(386/524)-6,'base rate 73.7%',{size:11,fill:C.ink2});
  f.g.append('path').datum(pts).attr('d',d3.line().x(d=>x(d.x)).y(d=>y(d.p))).attr('fill','none').attr('stroke',C.s1).attr('stroke-width',2.4);
  const vl=f.g.append('line').attr('y1',0).attr('y2',f.ih).attr('stroke',C.axis);const dot=f.g.append('circle').attr('r',6).attr('fill',C.s1).attr('stroke',C.surface).attr('stroke-width',2);
  function upd(){const v=+$('#poss-slider').value;const i=Math.round((v-44)/0.5);const d=pts[Math.max(0,Math.min(pts.length-1,i))];
    vl.attr('x1',x(v)).attr('x2',x(v));dot.attr('cx',x(v)).attr('cy',y(d.p));$('#poss-val').textContent=v.toFixed(1)+'%';
    $('#pw-val').textContent=pct(d.p);$('#pw-ci').textContent=`${pct(d.lo)} – ${pct(d.hi)}`;}
  el._upd=upd;upd();
};

/* ===== Fig 13: LOWESS ===== */
R.lowess=el=>{
  const L=D.lowess,Q=D.curve_quad,P=D.curve_poss;const f=frame(el,280,{t:18,r:16,b:40,l:44});
  const x=d3.scaleLinear([47,81],[0,f.iw]),y=d3.scaleLinear([0.45,0.95],[f.ih,0]);
  yAxis(f.g,y,f.iw,{values:[.5,.6,.7,.8,.9],fmt:d3.format('.0%'),label:'P(win)',lx:40});
  xAxis(f.g,x,f.ih,{values:[50,55,60,65,70,75,80],fmt:d=>d+'%',label:'possession'});
  const lp=L.x.map((v,i)=>({x:v,p:L.p[i],lo:L.lo[i],hi:L.hi[i]}));
  f.g.append('path').datum(lp).attr('d',d3.area().x(d=>x(d.x)).y0(d=>y(d.lo)).y1(d=>y(d.hi)).curve(d3.curveMonotoneX)).attr('fill',C.s1).attr('opacity',.13);
  const inr=(arr,xs)=>xs.map((v,i)=>({x:v,p:arr[i]})).filter(d=>d.x>=47&&d.x<=81);
  f.g.append('path').datum(inr(P.p,P.x)).attr('d',d3.line().x(d=>x(d.x)).y(d=>y(d.p))).attr('fill','none').attr('stroke',C.s3).attr('stroke-width',2);
  f.g.append('path').datum(inr(Q.p,Q.x)).attr('d',d3.line().x(d=>x(d.x)).y(d=>y(d.p))).attr('fill','none').attr('stroke',C.s2).attr('stroke-width',2);
  f.g.append('path').datum(lp).attr('d',d3.line().x(d=>x(d.x)).y(d=>y(d.p)).curve(d3.curveMonotoneX)).attr('fill','none').attr('stroke',C.s1).attr('stroke-width',2.4);
};

/* ===== Fig 14: DAG ===== */
R.dag=el=>{
  el.innerHTML='';const VW=900,VH=340;const W=Math.max(640,el.clientWidth);
  const svg=d3.select(el).append('svg').attr('width',W).attr('height',W*VH/VW).attr('viewBox',`0 0 ${VW} ${VH}`);
  const defs=svg.append('defs');
  [['a-ink',C.ink2],['a-gr',C.grana],['a-bl',C.blau]].forEach(([id,c])=>defs.append('marker').attr('id',id).attr('viewBox','0 0 10 10').attr('refX',9).attr('refY',5).attr('markerWidth',8).attr('markerHeight',8).attr('orient','auto-start-reverse').append('path').attr('d','M0,0 L10,5 L0,10z').attr('fill',c));
  const N={str:{x:95,y:175,t:'Team strength',s:'Elo edge'},pos:{x:420,y:62,t:'Possession',s:'share of passes'},ch:{x:420,y:288,t:'Chances',s:'shots, xG'},sc:{x:635,y:175,t:'Goals & score',s:'leading · level · trailing'},res:{x:815,y:175,t:'Result',s:'W / D / L'}};
  const nw=160,nh=58;
  const E=[['str','pos','a-bl','+ better teams keep the ball',false],['str','ch','a-bl','+ better teams create more',false],['pos','ch','a-ink','weak link',false],['ch','sc','a-bl','',false],['sc','res','a-bl','',false]];
  const edge=(a,b)=>{const A=N[a],B=N[b];const dx=B.x-A.x,dy=B.y-A.y;const L=Math.hypot(dx,dy);
    const kx=Math.abs(dx)/(nw/2+8),ky=Math.abs(dy)/(nh/2+8);const ka=1/Math.max(kx,ky);const kb=ka;
    return [A.x+dx*ka,A.y+dy*ka,B.x-dx*kb,B.y-dy*kb];};
  E.forEach(([a,b,mk])=>{const [x1,y1,x2,y2]=edge(a,b);svg.append('line').attr('x1',x1).attr('y1',y1).attr('x2',x2).attr('y2',y2).attr('stroke',mk==='a-ink'?C.ink2:C.blau).attr('stroke-width',mk==='a-ink'?1.2:2).attr('marker-end',`url(#${mk})`);});
  [[250,104,'end','+ better teams keep the ball'],[250,268,'end','+ better teams create more'],[430,180,'start','weak link']].forEach(([lx,ly,an,t])=>svg.append('text').attr('x',lx).attr('y',ly).attr('text-anchor',an).attr('fill',C.ink2).style('font-size','13px').text(t));
  const loop=svg.append('path').attr('d',`M${N.sc.x+10},${N.sc.y-nh/2-2} C ${N.sc.x+20},${40} ${N.pos.x+150},${22} ${N.pos.x+nw/2+6},${N.pos.y-4}`).attr('fill','none').attr('stroke',C.grana).attr('stroke-width',2.6).attr('marker-end','url(#a-gr)');
  [[668,92,'Feedback (−):'],[668,110,'leading → give up the ball'],[668,128,'trailing → keep it']].forEach(([lx,ly,t],i)=>svg.append('text').attr('x',lx).attr('y',ly).attr('fill',C.grana).style('font-size','13px').style('font-weight',i?500:700).text(t));
  Object.values(N).forEach(n=>{const g=svg.append('g').attr('transform',`translate(${n.x-nw/2},${n.y-nh/2})`);
    g.append('rect').attr('width',nw).attr('height',nh).attr('rx',10).attr('fill',C.surface2).attr('stroke',C.axis);
    g.append('text').attr('x',nw/2).attr('y',25).attr('text-anchor','middle').attr('fill',C.ink).style('font-size','15px').style('font-weight',600).text(n.t);
    g.append('text').attr('x',nw/2).attr('y',44).attr('text-anchor','middle').attr('fill',C.muted).style('font-size','12px').text(n.s);});
  svg.append('text').attr('x',N.str.x).attr('y',N.str.y+nh/2+22).attr('text-anchor','middle').attr('fill',C.ink2).style('font-size','12.5px').text('confounder');
  if(!reduceMotion){loop.attr('stroke-dasharray','9 7');let off=0;const t=d3.interval(()=>{if(!document.body.contains(loop.node())){t.stop();return;}off-=1.2;loop.attr('stroke-dashoffset',off);},30);}
};

/* ===== Fig 15: game states ===== */
R.states=el=>{
  const G=D.game_state;const f=frame(el,260,{t:22,r:20,b:40,l:44});
  const S=['lead','level','trail'],lab={lead:'Leading',level:'Level',trail:'Trailing'};
  const x=d3.scaleBand(S,[0,f.iw]).padding(.4);const y=d3.scaleLinear([0.58,0.74],[f.ih,0]);
  yAxis(f.g,y,f.iw,{values:[.6,.64,.68,.72],fmt:d3.format('.0%'),label:'Barça possession',lx:40});
  const xs=f.g.append('g').attr('transform',`translate(0,${f.ih})`).call(d3.axisBottom(x).tickFormat(d=>lab[d]).tickSize(0).tickPadding(10));styleAxis(xs);xs.selectAll('text').style('font-size','12.5px').attr('fill',C.ink);
  const ln=(k,c,dx)=>{const pts=S.map(s=>[x(s)+x.bandwidth()/2+dx,y(G[s][k])]);
    f.g.append('path').attr('d',d3.line()(pts)).attr('stroke',c).attr('stroke-width',1.5).attr('fill','none').attr('opacity',.5);
    S.forEach((s,i)=>{f.g.append('circle').attr('cx',pts[i][0]).attr('cy',pts[i][1]).attr('r',6.5).attr('fill',c).attr('stroke',C.surface).attr('stroke-width',2);
      txt(f.g,pts[i][0]+(dx<0?-11:11),pts[i][1]+4,pct(G[s][k]),{anchor:dx<0?'end':'start',size:12,fill:C.ink,weight:600});});};
  ln('pass_share',C.s1,-14);ln('time_share',C.s2,14);
};

/* ===== Fig 16: event study ===== */
R.events=el=>{
  const E=D.event_study;const f=frame(el,320,{t:24,r:18,b:42,l:44});
  const x=d3.scaleLinear([-15,15],[0,f.iw]),y=d3.scaleLinear([0.1,0.92],[f.ih,0]);
  f.g.append('rect').attr('x',x(0)).attr('y',0).attr('width',x(15)-x(0)).attr('height',f.ih).attr('fill',C.surface2);
  yAxis(f.g,y,f.iw,{values:[.2,.4,.6,.8],fmt:d3.format('.0%'),label:'Barça pass share',lx:40});
  xAxis(f.g,x,f.ih,{values:[-15,-10,-5,0,5,10,15],fmt:d=>d>0?`+${d}`:d,label:'minutes relative to the goal'});
  f.g.append('line').attr('x1',x(0)).attr('x2',x(0)).attr('y1',0).attr('y2',f.ih).attr('stroke',C.ink2);
  txt(f.g,x(0)+6,12,'Goal',{size:12,fill:C.ink,weight:600});txt(f.g,x(-15)+4,12,'before',{size:11,fill:C.muted});txt(f.g,x(15)-4,12,'after',{anchor:'end',size:11,fill:C.muted});
  const paths=[];
  [['for',C.w],['against',C.l]].forEach(([k,c])=>{
    const pts=E.x.map((v,i)=>[x(v+0.5),y(E[k][i])]);
    f.g.append('line').attr('x1',x(-15)).attr('x2',x(-1)).attr('y1',y(E[k+'_pre'])).attr('y2',y(E[k+'_pre'])).attr('stroke',c).attr('stroke-width',5).attr('opacity',.2);
    f.g.append('line').attr('x1',x(1)).attr('x2',x(15)).attr('y1',y(E[k+'_post'])).attr('y2',y(E[k+'_post'])).attr('stroke',c).attr('stroke-width',5).attr('opacity',.2);
    paths.push(f.g.append('path').attr('d',d3.line().curve(d3.curveMonotoneX)(pts)).attr('fill','none').attr('stroke',c).attr('stroke-width',2.2));
    f.g.append('g').selectAll('circle').data(pts).join('circle').attr('cx',d=>d[0]).attr('cy',d=>d[1]).attr('r',2.6).attr('fill',c);
  });
  const i1=E.x.indexOf(-1),i0=E.x.indexOf(0);
  txt(f.g,x(-1.2),y(E.for[i1])-10,'build-up 77.9%',{anchor:'end',size:11.5,fill:C.ink});
  txt(f.g,x(0.9)+6,y(E.for[i0])+4,'restart: the conceding side kicks off',{anchor:'start',size:11.5,fill:C.ink});
  hoverLayer(f.g,f.iw,f.ih,E.x.flatMap((v,i)=>[{v,k:'for',p:E.for[i]},{v,k:'against',p:E.against[i]}]),d=>[x(d.v+0.5),y(d.p)],d=>`<b>${d.k==='for'?'Barça scored':'Barça conceded'}</b>${row('Minute',`${d.v>=0?'+':''}${d.v} to ${d.v+1>0?'+':''}${d.v+1}`)}${row('Barça pass share',pct(d.p))}`,24);
  plays.events=()=>paths.forEach((p,i)=>drawLine(p,1800,i*300));
};

/* ===== Fig 17: minute curves ===== */
R.minutes=el=>{
  const M=D.minute_curves;const f=frame(el,280,{t:20,r:18,b:40,l:44});
  const x=d3.scaleLinear([0,100],[0,f.iw]),y=d3.scaleLinear([0.54,0.74],[f.ih,0]);
  yAxis(f.g,y,f.iw,{values:[.55,.6,.65,.7],fmt:d3.format('.0%'),label:'Barça pass share',lx:40});
  xAxis(f.g,x,f.ih,{values:[0,15,30,45,60,75,90],fmt:d=>d+"'",label:'match clock (minutes of play)'});
  f.g.append('line').attr('x1',x(47)).attr('x2',x(47)).attr('y1',0).attr('y2',f.ih).attr('stroke',C.axis);txt(f.g,x(47)+5,12,'half-time',{size:11,fill:C.muted});
  ['L','D','W'].forEach(k=>{const pts=M.x.map((v,i)=>[x(v),y(M[k][i])]);
    f.g.append('path').attr('d',d3.line().curve(d3.curveMonotoneX)(pts)).attr('fill','none').attr('stroke',RC(k)).attr('stroke-width',2.2);
    const e=pts[pts.length-1];f.g.append('circle').attr('cx',e[0]).attr('cy',e[1]).attr('r',4.5).attr('fill',RC(k)).attr('stroke',C.surface).attr('stroke-width',2);});
  hoverLayer(f.g,f.iw,f.ih,M.x.flatMap((v,i)=>['W','D','L'].map(k=>({v,k,p:M[k][i]}))),d=>[x(d.v),y(d.p)],d=>`<b>${RN[d.k]}s</b>${row('Minutes',`${d.v-2.5}–${d.v+2.5}`)}${row('Barça pass share',pct(d.p))}`,24);
};

/* ===== Fig 18: minutes in states ===== */
R.stateMin=el=>{
  const S=D.state_min_by_result;const f=frame(el,190,{t:10,r:16,b:34,l:70});
  const rows=['W','D','L'];const y=d3.scaleBand(rows,[0,f.ih]).padding(.32);const x=d3.scaleLinear([0,96],[0,f.iw]);
  xAxis(f.g,x,f.ih,{values:[0,15,30,45,60,75,90],fmt:d=>d+' min'});
  const cols={lead:C.w,level:C.muted,trail:C.l};
  rows.forEach(r=>{let acc=0;txt(f.g,-10,y(r)+y.bandwidth()/2+4,RN[r]+'s',{anchor:'end',size:12.5,fill:C.ink,weight:600});
    ['lead','level','trail'].forEach(s=>{const v=S[r][s];const x0=x(acc),w=Math.max(0,x(acc+v)-x(acc)-2);
      f.g.append('rect').attr('x',x0).attr('y',y(r)).attr('width',w).attr('height',y.bandwidth()).attr('fill',cols[s]).attr('rx',2)
        .on('pointermove',ev=>tip(`<b>${RN[r]}s</b>${row({lead:'Leading',level:'Level',trail:'Trailing'}[s],v.toFixed(1)+' min')}`,ev)).on('pointerleave',untip);
      if(w>40)txt(f.g,x0+w/2,y(r)+y.bandwidth()/2+4,Math.round(v)+"'",{anchor:'middle',size:12,fill:inkOn(cols[s]),weight:600}).style('pointer-events','none');
      acc+=v;});});
};

/* ===== Fig 19: replays ===== */
const RP={idx:0,t:null,playing:false,speed:1,timer:null,hooks:{}};
const RP_META={3773428:['Cádiz 2–1 Barça','5 Dec 2020 · 82% possession, a defeat'],16215:['Betis 1–4 Barça','17 Mar 2019 · 44% possession, a win'],69299:['Barça 5–0 Real Madrid','29 Nov 2010 · the manita'],267432:['Barça 4–2 Eibar','21 May 2017 · from 0–2 down']};
function rpMatch(){return D.replays[RP.idx];}
function rpLen(){return rpMatch().share.length;}
function officialMin(t,h1){if(t<h1){return t<45?`${Math.floor(t)+1}'`:`45+${Math.floor(t-45)+1}'`;}const m=45+(t-h1);return m<90?`${Math.floor(m)+1}'`:`90+${Math.floor(m-90)+1}'`;}
function rpUpdate(t){
  const m=rpMatch();RP.t=t;const done=t>=rpLen()-0.01;
  let gf=0,ga=0;m.goals.forEach(g=>{if(g[0]<=t){g[1]?gf++:ga++;}});
  const home=m.home===1;const sb=$('#rp-score');
  const L=home?['Barcelona',gf]:[m.opponent,ga],Rr=home?[m.opponent,ga]:['Barcelona',gf];
  sb.innerHTML=`<span>${L[0]}</span><span class="n">${L[1]}</span><span class="muted">–</span><span class="n">${Rr[1]}</span><span>${Rr[0]}</span>`;
  $('#rp-clock').textContent=done?'FT':officialMin(t,m.h1);
  $('#rp-read').innerHTML=`<span>Possession <b>${pct(m.poss)}</b></span><span>xG <b>${f2(m.xg)} – ${f2(m.xga)}</b></span>`;
  Object.values(RP.hooks).forEach(h=>h(t));
}
function rpChips(){
  const c=$('#rp-chips');c.innerHTML='';
  D.replays.forEach((m,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-pressed',i===RP.idx);const meta=RP_META[m.match_id];
    b.innerHTML=`${meta[0]}<small>${meta[1]}</small>`;b.onclick=()=>{rpStop();RP.idx=i;$$('#rp-chips button').forEach((x,j)=>x.setAttribute('aria-pressed',j===i));RP.t=null;renderRp();};c.appendChild(b);});
}
function renderRp(){$$('[data-chart^="replay"]').forEach(render);rpUpdate(RP.t==null?rpLen():RP.t);}
function rpStop(){if(RP.timer){RP.timer.stop();RP.timer=null;}RP.playing=false;setPlayBtn($('#rp-play'),false);}
function rpPlay(){
  if(RP.playing){rpStop();return;}
  let t=(RP.t==null||RP.t>=rpLen()-0.01)?0:RP.t;RP.playing=true;setPlayBtn($('#rp-play'),true);
  if(reduceMotion){rpUpdate(rpLen());rpStop();return;}
  let last=performance.now();
  RP.timer=d3.timer(()=>{const now=performance.now();t+=(now-last)/1000*8*RP.speed;last=now;if(t>=rpLen()){t=rpLen();rpUpdate(t);rpStop();return;}rpUpdate(t);});
}
function setPlayBtn(b,on){if(!b)return;b.innerHTML=on?'<svg viewBox="0 0 10 10" aria-hidden="true"><rect x="1" y="0" width="3" height="10" fill="currentColor"/><rect x="6" y="0" width="3" height="10" fill="currentColor"/></svg>Pause':'<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 0 L9 5 L1 10Z" fill="currentColor"/></svg>Play';}
R.replayFlow=el=>{
  const m=rpMatch();const n=m.share.length;const f=frame(el,236,{t:44,r:14,b:34,l:44});
  const x=d3.scaleLinear([0,n],[0,f.iw]),y=d3.scaleLinear([0,1],[f.ih,0]);
  yAxis(f.g,y,f.iw,{values:[0,.25,.5,.75,1],fmt:d3.format('.0%')});
  xAxis(f.g,x,f.ih,{values:[0,15,30,45,60,75,90].filter(v=>v<n),fmt:d=>d+"'"});
  const id='rp'+Math.random().toString(36).slice(2,7);const defs=f.svg.append('defs');
  defs.append('clipPath').attr('id',id+'a').append('rect').attr('x',0).attr('y',0).attr('width',f.iw).attr('height',y(.5));
  defs.append('clipPath').attr('id',id+'b').append('rect').attr('x',0).attr('y',y(.5)).attr('width',f.iw).attr('height',f.ih-y(.5));
  const rev=defs.append('clipPath').attr('id',id+'r').append('rect').attr('x',0).attr('y',-30).attr('height',f.ih+60).attr('width',f.iw);
  const pts=m.share.map((v,i)=>[i+0.5,v]);
  const area=d3.area().x(d=>x(d[0])).y0(y(.5)).y1(d=>y(d[1])).curve(d3.curveMonotoneX);
  const G=f.g.append('g').attr('clip-path',`url(#${id}r)`);
  G.append('path').datum(pts).attr('d',area).attr('fill',C.blau).attr('opacity',.55).attr('clip-path',`url(#${id}a)`);
  G.append('path').datum(pts).attr('d',area).attr('fill',C.grana).attr('opacity',.55).attr('clip-path',`url(#${id}b)`);
  G.append('path').datum(pts).attr('d',d3.line().x(d=>x(d[0])).y(d=>y(d[1])).curve(d3.curveMonotoneX)).attr('fill','none').attr('stroke',C.ink).attr('stroke-width',1.2).attr('opacity',.7);
  f.g.append('line').attr('x1',0).attr('x2',f.iw).attr('y1',y(.5)).attr('y2',y(.5)).attr('stroke',C.ink2);
  f.g.append('line').attr('x1',x(m.h1)).attr('x2',x(m.h1)).attr('y1',0).attr('y2',f.ih).attr('stroke',C.axis);
  txt(f.g,f.iw-2,y(.9),'Barça on the ball',{anchor:'end',size:11,fill:C.ink2});txt(f.g,f.iw-2,y(.08),'opponent on the ball',{anchor:'end',size:11,fill:C.ink2});
  const gl=f.g.append('g');
  const cursor=f.g.append('line').attr('y1',-4).attr('y2',f.ih).attr('stroke',C.ink).attr('stroke-width',1.5);
  RP.hooks.flow=t=>{rev.attr('width',x(t));cursor.attr('x1',x(t)).attr('x2',x(t)).attr('opacity',t>=n-0.01?0:1);
    const vis=m.goals.filter(g=>g[0]<=t);let gf=0,ga=0;const lab=vis.map((g,k)=>{g[1]?gf++:ga++;return {g,k,s:m.home?`${gf}–${ga}`:`${ga}–${gf}`};});
    gl.selectAll('g').data(lab,d=>d.g[0]).join(e=>{const g=e.append('g');g.append('line').attr('y1',-6).attr('y2',f.ih).attr('stroke',d=>d.g[1]?C.blau:C.grana).attr('stroke-width',2);
      g.append('circle').attr('cy',-10).attr('r',5).attr('fill',d=>d.g[1]?C.blau:C.grana).attr('stroke',C.surface).attr('stroke-width',1.5);
      g.append('text').attr('y',d=>d.k%2?-32:-18).attr('text-anchor','middle').style('font-size','11px').style('font-weight',600).attr('fill',C.ink).text(d=>`${d.g[2]+1}' ${d.s}`);return g;})
      .attr('transform',d=>`translate(${x(d.g[0])},0)`);};
};
R.replayShots=el=>{
  const m=rpMatch();const W=el.clientWidth;const s=Math.min((W-10)/120,5.6);
  const f=frame(el,80*s+30,{t:22,r:5,b:8,l:5});const ox=(f.iw-120*s)/2;const g=f.g.append('g').attr('transform',`translate(${ox},0)`);
  const {X,Y}=pitch(g,s);
  txt(g,X(118),-8,'Barça attack →',{anchor:'end',size:11.5,fill:C.ink2,weight:600});txt(g,X(2),-8,'← '+m.opponent+' attack',{size:11.5,fill:C.ink2,weight:600});
  const shots=(D.shotmaps[String(m.match_id)]||[]).map(sh=>{const bar=sh.side==='bar';const tt=sh.m<45?sh.m+0.5:m.h1+(sh.m-45)+0.5;
    return {...sh,px:bar?sh.x:120-sh.x,py:bar?sh.y:80-sh.y,t:tt};});
  m.goals.forEach(gg=>{const cand=shots.filter(sh=>sh.o==='Goal'&&(sh.side==='bar')===!!gg[1]&&Math.abs(sh.m-gg[2])<=1);if(cand.length)cand[0].t=gg[0];});
  const rs=d3.scaleSqrt([0,1],[2.5,Math.max(9,s*4.2)]);
  const G=g.append('g');
  RP.hooks.shots=t=>{const vis=shots.filter(sh=>sh.t<=t+0.001);
    G.selectAll('circle').data(vis,d=>d.m+'_'+d.x+'_'+d.y).join(e=>e.append('circle').attr('cx',d=>X(d.px)).attr('cy',d=>Y(d.py)).attr('r',0).call(c=>c.transition().duration(reduceMotion?0:350).attr('r',d=>rs(d.xg))))
      .attr('fill',d=>d.o==='Goal'?(d.side==='bar'?C.blau:C.grana):C.surface).attr('fill-opacity',d=>d.o==='Goal'?1:.6)
      .attr('stroke',d=>d.side==='bar'?C.blau:C.grana).attr('stroke-width',1.8)
      .on('pointermove',(ev,d)=>tip(`<b>${d.side==='bar'?'Barça':m.opponent} shot · ${d.m+1}'</b>${row('Outcome',d.o)}${row('xG',f2(d.xg))}${d.pen?row('Type','Penalty'):''}`,ev)).on('pointerleave',untip);};
};

/* ===== Fig 20: Elo scatter ===== */
R.eloScatter=el=>{
  const P=D.elo_points;const f=frame(el,300,{t:18,r:16,b:40,l:44});
  const x=d3.scaleLinear([1320,1790],[0,f.iw]),y=d3.scaleLinear([0.42,0.85],[f.ih,0]);
  yAxis(f.g,y,f.iw,{values:[.45,.55,.65,.75,.85],fmt:d3.format('.0%'),label:'Barça possession',lx:40});
  xAxis(f.g,x,f.ih,{values:[1350,1450,1550,1650,1750],label:'opponent pre-match Elo'});
  const pts=P.map((p,i)=>({e:p[0],p:p[1],r:p[2],m:D.matches[i]}));
  f.g.append('g').selectAll('circle').data(pts).join('circle').attr('cx',d=>x(d.e)).attr('cy',d=>y(d.p)).attr('r',3.2).attr('fill',d=>RC(d.r)).attr('opacity',.75).attr('stroke',C.surface).attr('stroke-width',.8);
  const [b,a]=D.elo_line;f.g.append('line').attr('x1',x(1320)).attr('x2',x(1790)).attr('y1',y(a+b*1320)).attr('y2',y(a+b*1790)).attr('stroke',C.ink).attr('stroke-width',1.8);
  txt(f.g,f.iw,14,'r = −0.32',{anchor:'end',size:12.5,fill:C.ink,weight:600});
  hoverLayer(f.g,f.iw,f.ih,pts,d=>[x(d.e),y(d.p)],d=>matchTip(d.m)+row('Opponent Elo',Math.round(d.e)));
};

/* ===== Fig 21: tiers grid ===== */
R.tiers=el=>{
  const T=D.tiers,TE=D.tier_elo;const W=Math.max(el.clientWidth,560);el.innerHTML='';
  const lw=170,cw=(W-lw-10)/3,ch=74,hh=44;const H=hh+ch*3+6;
  const svg=d3.select(el).append('svg').attr('width',W).attr('height',H);
  const col=d3.scaleLinear([0.55,0.95],[C.seq0,C.seq1]).interpolate(d3.interpolateRgb).clamp(true);
  const opps=['Weaker third','Middle third','Strongest third'],pos=['Low','Mid','High'];
  pos.forEach((p,j)=>svg.append('text').attr('x',lw+cw*j+cw/2).attr('y',18).attr('text-anchor','middle').attr('fill',C.ink).style('font-size','13px').style('font-weight',600).text(`${p} possession`));
  pos.forEach((p,j)=>svg.append('text').attr('x',lw+cw*j+cw/2).attr('y',36).attr('text-anchor','middle').attr('fill',C.muted).style('font-size','11.5px').text('tercile within row'));
  opps.forEach((o,i)=>{const te=TE.find(d=>d.opp_t===o);const yy=hh+ch*i;
    svg.append('text').attr('x',0).attr('y',yy+ch/2-4).attr('fill',C.ink).style('font-size','13px').style('font-weight',600).text(o.replace(' third',' opponents'));
    svg.append('text').attr('x',0).attr('y',yy+ch/2+14).attr('fill',C.muted).style('font-size','11.5px').text(`Elo ${Math.round(te.lo)}–${Math.round(te.hi)}`);
    pos.forEach((p,j)=>{const c=T.find(d=>d.opp===o&&d.pos===p);const fill=col(c.w);const g=svg.append('g').attr('transform',`translate(${lw+cw*j+3},${yy+3})`);
      g.append('rect').attr('width',cw-6).attr('height',ch-6).attr('rx',8).attr('fill',fill);
      g.append('text').attr('x',(cw-6)/2).attr('y',ch/2-3).attr('text-anchor','middle').attr('fill',inkOn(fill)).style('font-size','20px').style('font-weight',600).text(pct(c.w));
      g.append('text').attr('x',(cw-6)/2).attr('y',ch/2+16).attr('text-anchor','middle').attr('fill',inkOn(fill)).attr('opacity',.85).style('font-size','11.5px').text(`n = ${c.n} · ${c.poss.toFixed(1)}% poss.`);
      g.on('pointermove',ev=>tip(`<b>${o.replace(' third',' opponents')} · ${p} possession</b>${row('Matches',c.n)}${row('Mean possession',c.poss.toFixed(1)+'%')}${row('Win rate',pct(c.w))}`,ev)).on('pointerleave',untip);});});
};

/* ===== Fig 22: coefficient path ===== */
function forest(el,rows,o){
  const small=el.clientWidth<600;const rh=small?50:40;const lw=small?0:(o.lw||210);
  const f=frame(el,rows.length*rh+54,{t:28,r:small?16:150,b:30,l:lw+8});
  const x=d3.scaleLog([o.lo,o.hi],[0,f.iw]);const y=d3.scaleBand(rows.map((r,i)=>i),[0,f.ih]).padding(.2);
  const ticks=o.ticks;f.g.append('g').selectAll('line').data(ticks).join('line').attr('x1',d=>x(d)).attr('x2',d=>x(d)).attr('y1',0).attr('y2',f.ih).attr('stroke',C.grid);
  const xa=f.g.append('g').attr('transform',`translate(0,${f.ih})`).call(d3.axisBottom(x).tickValues(ticks).tickFormat(d3.format('~g')).tickSize(4));styleAxis(xa);
  f.g.append('line').attr('x1',x(1)).attr('x2',x(1)).attr('y1',-8).attr('y2',f.ih).attr('stroke',C.ink2).attr('stroke-width',1.4);
  txt(f.g,x(1),-14,'no effect',{anchor:'middle',size:11,fill:C.muted});
  txt(f.g,x(o.lo)+2,-14,'← lower odds of winning',{size:11,fill:C.muted});txt(f.g,x(o.hi)-2,-14,'higher →',{anchor:'end',size:11,fill:C.muted});
  const G=rows.map((r,i)=>{const g=f.g.append('g').attr('class','frow');const cy=y(i)+y.bandwidth()/2+(small?8:0);
    if(small)txt(g,0,y(i)+4,r.name,{size:12,fill:C.ink,weight:600});else txt(g,-12,cy+4,r.name,{anchor:'end',size:12.5,fill:C.ink,weight:500});
    const sigf=r.p<0.05;const c=sigf?(r.or<1?C.l:C.w):C.s1;
    g.append('line').attr('x1',x(Math.max(o.lo,r.lo))).attr('x2',x(Math.min(o.hi,r.hi))).attr('y1',cy).attr('y2',cy).attr('stroke',c).attr('stroke-width',2.2);
    g.append('circle').attr('cx',x(r.or)).attr('cy',cy).attr('r',6.5).attr('fill',c).attr('stroke',C.surface).attr('stroke-width',2);
    const lab=`${r.or.toFixed(2)} [${r.lo.toFixed(2)}–${r.hi.toFixed(2)}] p ${r.p<0.001?'< 0.001':'= '+r.p.toFixed(3)}`;
    if(small)txt(g,f.iw,y(i)+4,`${r.or.toFixed(2)} · p ${r.p<0.001?'<0.001':r.p.toFixed(3)}`,{anchor:'end',size:11.5,fill:C.ink2});else txt(g,f.iw+12,cy+4,lab,{size:11.5,fill:C.ink2});
    g.append('rect').attr('x',-lw).attr('y',y(i)).attr('width',f.iw+lw).attr('height',y.bandwidth()).attr('fill','transparent').on('pointermove',ev=>tip(`<b>${r.name}</b>${r.formula?row('Model',r.formula):''}${row('Odds ratio (+10 pts)',r.or.toFixed(3))}${row('95% CI',`${r.lo.toFixed(2)} – ${r.hi.toFixed(2)}`)}${row('p-value',r.p<0.001?'< 0.001':r.p.toFixed(4))}${r.n?row('Matches',r.n):''}`,ev)).on('pointerleave',untip);
    return {g,cx:x(r.or),cy};});
  return {f,x,G};
}
R.path=el=>{
  const rows=D.coef_path.map(d=>({name:d.step,or:d.or10,lo:d.lo,hi:d.hi,p:d.p,formula:d.formula}));
  const {G}=forest(el,rows,{lo:0.4,hi:2,ticks:[0.4,0.5,0.7,1,1.4,2],lw:170});
  plays.path=()=>{if(reduceMotion)return;G.forEach(r=>r.g.interrupt().attr('opacity',.12));G.forEach((r,i)=>r.g.transition().delay(300+i*900).duration(500).attr('opacity',1));};
};

/* ===== Fig 24: gap chart ===== */
let GAPMODE='raw';
R.gap=el=>{
  const CP=D.clean_pre,CL=D.clean_level;const gaps=[0,1,2,3,5];
  const series=[
    {k:'pw',c:C.s1,name:'Pre-goal possession → win',v:g=>{const d=CP.find(r=>r.gap===g);return GAPMODE==='raw'?[d.or_win,d.p_win]:[d.or_win_elo,d.p_win_elo];}},
    {k:'lw',c:C.s2,name:'Possession while level → win',v:g=>{const d=CL.find(r=>r.gap===g);return d?(GAPMODE==='raw'?[d.or10,d.p]:[d.or10_elo,d.p_elo]):null;}},
    {k:'pf',c:C.s3,name:'Pre-goal possession → scores first',v:g=>{const d=CP.find(r=>r.gap===g);return GAPMODE==='raw'?[d.or_first,d.p_first]:[d.or_first_elo,d.p_first_elo];}}];
  const f=frame(el,320,{t:26,r:18,b:44,l:48});
  const x=d3.scaleBand(gaps.map(String),[0,f.iw]).padding(.3);const y=d3.scaleLog([0.6,2.6],[f.ih,0]);
  yAxis(f.g,y,f.iw,{values:[0.6,0.8,1,1.25,1.6,2,2.5],fmt:d3.format('~g'),label:'odds ratio per +10 pts',lx:44});
  f.g.append('line').attr('x1',0).attr('x2',f.iw).attr('y1',y(1)).attr('y2',y(1)).attr('stroke',C.ink2).attr('stroke-width',1.4);
  const xs=f.g.append('g').attr('transform',`translate(0,${f.ih})`).call(d3.axisBottom(x).tickFormat(d=>d==='0'?'none':`${d} min`).tickSize(0).tickPadding(8));styleAxis(xs);
  txt(f.g,f.iw,f.ih+36,'build-up removed before each goal',{anchor:'end',size:11.5,fill:C.muted});
  series.forEach((s,si)=>{const dx=(si-1)*Math.min(14,x.bandwidth()/4);
    const pts=gaps.map(g=>{const v=s.v(g);if(!v)return null;const [or,p]=v;const [lo,hi]=ciFromP(or,p);return {g,or,p,lo,hi,cx:x(String(g))+x.bandwidth()/2+dx};}).filter(Boolean);
    f.g.append('path').attr('d',d3.line().x(d=>d.cx).y(d=>y(d.or))(pts)).attr('fill','none').attr('stroke',s.c).attr('stroke-width',1.6).attr('opacity',.6);
    pts.forEach(d=>{f.g.append('line').attr('x1',d.cx).attr('x2',d.cx).attr('y1',y(Math.max(0.6,d.lo))).attr('y2',y(Math.min(2.6,d.hi))).attr('stroke',s.c).attr('stroke-width',2);
      f.g.append('circle').attr('cx',d.cx).attr('cy',y(d.or)).attr('r',d.p<0.05?6.5:5).attr('fill',d.p<0.05?s.c:C.surface).attr('stroke',s.c).attr('stroke-width',2)
        .on('pointermove',ev=>tip(`<b>${s.name}</b>${row('Build-up removed',d.g?d.g+' min':'none')}${row('Odds ratio',d.or.toFixed(2))}${row('95% CI',`${d.lo.toFixed(2)} – ${d.hi.toFixed(2)}`)}${row('p-value',d.p<0.001?'< 0.001':d.p.toFixed(3))}`,ev)).on('pointerleave',untip);});
  });
  txt(f.g,4,12,'filled = significant at 5%',{size:11,fill:C.muted});
};

/* ===== Fig 23: sankey ===== */
R.sankey=el=>{
  el.innerHTML='';const VW=900,VH=360;const W=Math.max(620,el.clientWidth);
  const svg=d3.select(el).append('svg').attr('width',W).attr('height',W*VH/VW).attr('viewBox',`0 0 ${VW} ${VH}`);
  const top=30,Hh=300,gap=18;const k=(Hh-2*gap)/524;
  const col=[{x:40,nodes:[{id:'all',v:524,l:'All 524 matches',c:C.ink2}]},
    {x:400,nodes:[{id:'sf',v:380,l:'Barça scored first',c:C.blau},{id:'cf',v:127,l:'Conceded first',c:C.grana},{id:'nil',v:17,l:'0–0',c:C.muted}]},
    {x:760,nodes:[{id:'W',v:386,l:'Won',c:C.w},{id:'D',v:86,l:'Drew',c:C.d},{id:'L',v:52,l:'Lost',c:C.l}]}];
  const nw=16;const pos={};
  col.forEach(cl=>{let yy=top+(cl.nodes.length===1?gap:0);cl.nodes.forEach(n=>{pos[n.id]={x:cl.x,y:yy,h:n.v*k,c:n.c,l:n.l,v:n.v,oy:0,iy:0};yy+=n.v*k+gap;});});
  const links=[['all','sf',380,C.blau],['all','cf',127,C.grana],['all','nil',17,C.muted],['sf','W',332,C.w],['sf','D',35,C.d],['sf','L',13,C.l],['cf','W',54,C.w],['cf','D',34,C.d],['cf','L',39,C.l],['nil','D',17,C.d]];
  const lg=svg.append('g');
  links.forEach(([a,b,v,c])=>{const A=pos[a],B=pos[b];const h=v*k;const y0=A.y+A.oy,y1=B.y+B.iy;A.oy+=h;B.iy+=h;
    const x0=A.x+nw,x1=B.x,mx=(x0+x1)/2;
    const p=`M${x0},${y0} C${mx},${y0} ${mx},${y1} ${x1},${y1} L${x1},${y1+h} C${mx},${y1+h} ${mx},${y0+h} ${x0},${y0+h} Z`;
    lg.append('path').attr('d',p).attr('fill',c).attr('opacity',.32).on('pointermove',function(ev){d3.select(this).attr('opacity',.55);tip(`<b>${A.l} → ${B.l}</b>${row('Matches',v)}${row('Share of origin',pct(v/A.v))}`,ev);}).on('pointerleave',function(){d3.select(this).attr('opacity',.32);untip();});});
  Object.entries(pos).forEach(([id,n])=>{svg.append('rect').attr('x',n.x).attr('y',n.y).attr('width',nw).attr('height',Math.max(2,n.h)).attr('rx',3).attr('fill',n.c);
    const right=id==='all'?false:true;const lx=id==='all'?n.x+nw+8:(['W','D','L'].includes(id)?n.x+nw+8:n.x+nw+8);
    svg.append('text').attr('x',id==='all'?n.x:lx).attr('y',id==='all'?n.y-8:n.y+Math.min(n.h/2,40)+5).attr('fill',C.ink).attr('paint-order','stroke').attr('stroke',C.surface).attr('stroke-width',4).style('font-size','14px').style('font-weight',600).text(`${n.l}`);
    svg.append('text').attr('x',id==='all'?n.x:lx).attr('y',id==='all'?n.y+n.h+20:n.y+Math.min(n.h/2,40)+22).attr('fill',C.ink2).attr('paint-order','stroke').attr('stroke',C.surface).attr('stroke-width',4).style('font-size','12.5px').text(id==='all'?'':`${n.v} matches`);});
  const note=[['sf',[['W',332],['D',35],['L',13]]],['cf',[['W',54],['D',34],['L',39]]]];
  note.forEach(([id,arr])=>{const n=pos[id];svg.append('text').attr('x',n.x+nw+8).attr('y',n.y+Math.min(n.h/2,40)+40).attr('fill',C.ink2).attr('paint-order','stroke').attr('stroke',C.surface).attr('stroke-width',4).style('font-size','12.5px').text(arr.map(([r,v])=>`${r} ${pct(v/n.v,1)}`).join(' · '));});
};

/* ===== Fig 25: leaderboard ===== */
function hbarRows(el,rows,o){
  const small=el.clientWidth<600;const rh=small?44:27;const lw=small?0:(o.lw||250);
  const f=frame(el,rows.length*rh+44,{t:24,r:small?14:60,b:26,l:lw});
  const x=d3.scaleLinear(o.dom,[0,f.iw]);const y=d3.scaleBand(rows.map((r,i)=>i),[0,f.ih]).padding(small?.45:.3);
  f.g.append('g').selectAll('line').data(o.ticks).join('line').attr('x1',d=>x(d)).attr('x2',d=>x(d)).attr('y1',0).attr('y2',f.ih).attr('stroke',C.grid);
  styleAxis(f.g.append('g').attr('transform',`translate(0,${f.ih})`).call(d3.axisBottom(x).tickValues(o.ticks).tickFormat(o.fmt).tickSize(4)));
  f.g.append('line').attr('x1',x(0)).attr('x2',x(0)).attr('y1',-6).attr('y2',f.ih).attr('stroke',C.ink2);
  return {f,x,y,small,rh};
}
R.leader=el=>{
  const rows=D.leaderboard;const hl=new Set(['poss','poss_time','poss_pre','poss_level']);
  const {f,x,y,small}=hbarRows(el,rows,{dom:[-0.4,0.56],ticks:[-0.4,-0.2,0,0.2,0.4],fmt:d3.format('+.1f'),lw:250});
  rows.forEach((r,i)=>{const cy=y(i)+y.bandwidth()/2;const h=hl.has(r.key);
    if(h)f.g.append('rect').attr('x',small?0:-f.m.l+4).attr('y',y(i)-(small?16:3)).attr('width',f.iw+(small?0:f.m.l-4)).attr('height',y.bandwidth()+(small?19:6)).attr('rx',6).attr('fill',C.surface2);
    const c=r.r>=0?C.w:C.l;
    if(small)txt(f.g,0,y(i)-4,r.label,{size:12,fill:C.ink,weight:h?700:500});else txt(f.g,-10,cy+4,r.label,{anchor:'end',size:12.5,fill:C.ink,weight:h?700:400});
    f.g.append('line').attr('x1',x(r.lo)).attr('x2',x(r.hi)).attr('y1',cy).attr('y2',cy).attr('stroke',c).attr('stroke-width',2).attr('opacity',.7);
    f.g.append('circle').attr('cx',x(r.r)).attr('cy',cy).attr('r',5.5).attr('fill',c).attr('stroke',C.surface).attr('stroke-width',2);
    txt(f.g,small?f.iw:x(Math.max(r.hi,0.0))+10,small?y(i)-4:cy+4,(r.r>=0?'+':'')+r.r.toFixed(2),{anchor:small?'end':'start',size:11.5,fill:C.ink2});
    f.g.append('rect').attr('x',-f.m.l).attr('y',y(i)-4).attr('width',f.iw+f.m.l).attr('height',y.bandwidth()+8).attr('fill','transparent').on('pointermove',ev=>tip(`<b>${r.label}</b>${row('r with winning',r.r.toFixed(3))}${row('95% CI',`${r.lo.toFixed(2)} – ${r.hi.toFixed(2)}`)}${row('p-value',r.p<1e-4?r.p.toExponential(1):r.p.toFixed(4))}`,ev)).on('pointerleave',untip);});
};

/* ===== Fig 27: correlation matrix ===== */
R.corr=el=>{
  const M=D.corr_matrix;const n=M.keys.length;const W=Math.max(600,el.clientWidth);el.innerHTML='';
  const lw=112,top=100;const cs=Math.min(44,(W-lw-10)/n);const H=top+cs*n+10;
  const svg=d3.select(el).append('svg').attr('width',W).attr('height',H);const g=svg.append('g').attr('transform',`translate(${lw},${top})`);
  const col=v=>v>=0?d3.interpolateRgb(C.mid,C.w)(Math.min(1,v)):d3.interpolateRgb(C.mid,C.l)(Math.min(1,-v));
  M.keys.forEach((k,i)=>{svg.append('text').attr('x',lw-8).attr('y',top+cs*i+cs/2+4).attr('text-anchor','end').attr('fill',C.ink2).style('font-size','12px').text(k);
    svg.append('text').attr('transform',`translate(${lw+cs*i+cs/2+4},${top-8}) rotate(-50)`).attr('fill',C.ink2).style('font-size','12px').text(k);});
  M.m.forEach((r,i)=>r.forEach((v,j)=>{const fill=i===j?C.surface2:col(v);
    g.append('rect').attr('x',cs*j+1).attr('y',cs*i+1).attr('width',cs-2).attr('height',cs-2).attr('rx',3).attr('fill',fill)
      .on('pointermove',ev=>tip(`<b>${M.keys[i]} × ${M.keys[j]}</b>${row('Pearson r',v.toFixed(3))}`,ev)).on('pointerleave',untip);
    if(cs>=30&&i!==j)g.append('text').attr('x',cs*j+cs/2).attr('y',cs*i+cs/2+4).attr('text-anchor','middle').attr('fill',inkOn(fill)).style('font-size','10.5px').style('pointer-events','none').text(v.toFixed(2).replace('0.','.').replace('-.','−.'));}));
};

/* ===== Fig 26: xG scatters ===== */
function xgScatter(el,key,rkey){
  const P=D.xg_points;const f=frame(el,250,{t:14,r:12,b:38,l:36});
  const x=d3.scaleLinear([0.42,0.85],[0,f.iw]),y=d3.scaleLinear([0,key==='xg'?6.3:3],[f.ih,0]);
  yAxis(f.g,y,f.iw,{ticks:4});xAxis(f.g,x,f.ih,{values:[.45,.55,.65,.75,.85],fmt:d3.format('.0%'),label:'possession'});
  const idx=key==='xg'?1:2;
  f.g.append('g').selectAll('circle').data(P).join('circle').attr('cx',d=>x(d[0])).attr('cy',d=>y(d[idx])).attr('r',2.4).attr('fill',key==='xg'?C.s1:C.l).attr('opacity',.45);
  const [b,a]=D[key+'_line'];f.g.append('line').attr('x1',x(.42)).attr('x2',x(.85)).attr('y1',y(a+b*.42)).attr('y2',y(a+b*.85)).attr('stroke',C.ink).attr('stroke-width',2);
  const r=D.poss_corrs[key].r;txt(f.g,f.iw,12,`r = ${r>=0?'+':'−'}${Math.abs(r).toFixed(2)}`,{anchor:'end',size:12.5,fill:C.ink,weight:600});
  hoverLayer(f.g,f.iw,f.ih,P.map((p,i)=>({p,m:D.matches[i]})),d=>[x(d.p[0]),y(d.p[idx])],d=>matchTip(d.m));
}
R.xgFor=el=>xgScatter(el,'xg');R.xgAg=el=>xgScatter(el,'xga');

/* ===== Fig 28: model ladder ===== */
R.ladder=el=>{
  const L=D.ladder.filter(d=>d.name!=='Base rate only');
  const group=n=>/possession/i.test(n)&&!/Elo|shots|Everything/i.test(n)?'Possession only':(/Elo/.test(n)?'Pre-match':'In-match');
  const {f,x,y,small}=hbarRows(el,L,{dom:[-0.03,0.34],ticks:[0,0.1,0.2,0.3],fmt:d3.format('+.0%'),lw:260});
  if(!small)txt(f.g,f.iw+56,-8,'AUC',{anchor:'end',size:11.5,fill:C.muted,weight:600});
  L.forEach((r,i)=>{const cy=y(i)+y.bandwidth()/2;const v=r.bss;const c=v<0?C.l:C.s1;const bh=Math.min(20,y.bandwidth());
    const x0=x(Math.min(0,v)),w=Math.abs(x(v)-x(0));
    f.g.append('rect').attr('x',x0).attr('y',cy-bh/2).attr('width',Math.max(1.5,w)).attr('height',bh).attr('fill',c).attr('rx',3);
    const nm=r.name+(r.subset==='pre'?' *':'');
    if(small)txt(f.g,0,y(i)-4,nm,{size:12,fill:C.ink,weight:500});else txt(f.g,-10,cy+4,nm,{anchor:'end',size:12.5,fill:C.ink});
    txt(f.g,x(Math.max(0,v))+6,cy+4,(v>=0?'+':'−')+Math.abs(v*100).toFixed(1)+'%',{anchor:'start',size:11.5,fill:C.ink2,weight:600});
    if(!small)txt(f.g,f.iw+56,cy+4,r.auc.toFixed(2),{anchor:'end',size:11.5,fill:C.ink2});
    f.g.append('rect').attr('x',-f.m.l).attr('y',y(i)-4).attr('width',f.iw+f.m.l).attr('height',y.bandwidth()+8).attr('fill','transparent')
      .on('pointermove',ev=>tip(`<b>${nm}</b>${row('Group',group(r.name))}${row('Brier (model / base)',`${r.brier.toFixed(4)} / ${r.brier_base.toFixed(4)}`)}${row('Log loss (model / base)',`${r.logloss.toFixed(4)} / ${r.ll_base.toFixed(4)}`)}${row('AUC',r.auc.toFixed(3))}${row('Accuracy',pct(r.acc))}${row('Matches',r.n)}`,ev)).on('pointerleave',untip);});
};

/* ===== Fig 29: ROC ===== */
const ROC_S=[['Whole-match possession','s2'],['Elo edge + venue','s4'],['xG for & against','s1'],['Everything','s3']];
R.roc=el=>{
  const W=el.clientWidth;const f=frame(el,Math.min(320,W*0.9),{t:12,r:12,b:40,l:40});
  const s=Math.min(f.iw,f.ih);const x=d3.scaleLinear([0,1],[0,s]),y=d3.scaleLinear([0,1],[s,0]);
  const g=f.g.append('g').attr('transform',`translate(${(f.iw-s)/2},0)`);
  yAxis(g,y,s,{values:[0,.25,.5,.75,1],fmt:d3.format('.0%')});
  const xa=g.append('g').attr('transform',`translate(0,${s})`).call(d3.axisBottom(x).tickValues([0,.25,.5,.75,1]).tickFormat(d3.format('.0%')).tickSize(4));styleAxis(xa);
  txt(g,s,s+34,'false-positive rate',{anchor:'end',size:11.5,fill:C.muted});txt(g,-36,-2,'',{});
  g.append('line').attr('x1',0).attr('y1',s).attr('x2',s).attr('y2',0).attr('stroke',C.axis);
  const paths=ROC_S.map(([n,c])=>g.append('path').datum(D.roc[n]).attr('d',d3.line().x(d=>x(d[0])).y(d=>y(d[1]))).attr('fill','none').attr('stroke',C[c]).attr('stroke-width',2.2));
  plays.roc=()=>paths.forEach((p,i)=>drawLine(p,1400,i*350));
};
/* ===== Fig 30: calibration ===== */
R.cal=el=>{
  const W=el.clientWidth;const f=frame(el,Math.min(320,W*0.9),{t:12,r:12,b:40,l:40});
  const s=Math.min(f.iw,f.ih);const x=d3.scaleLinear([0.2,1],[0,s]),y=d3.scaleLinear([0.2,1],[s,0]);
  const g=f.g.append('g').attr('transform',`translate(${(f.iw-s)/2},0)`);
  yAxis(g,y,s,{values:[.2,.4,.6,.8,1],fmt:d3.format('.0%')});
  styleAxis(g.append('g').attr('transform',`translate(0,${s})`).call(d3.axisBottom(x).tickValues([.2,.4,.6,.8,1]).tickFormat(d3.format('.0%')).tickSize(4)));
  txt(g,s,s+34,'predicted P(win)',{anchor:'end',size:11.5,fill:C.muted});
  g.append('line').attr('x1',x(.2)).attr('y1',y(.2)).attr('x2',x(1)).attr('y2',y(1)).attr('stroke',C.axis);
  [['Whole-match possession','s2'],['Elo edge + venue','s4'],['xG for & against','s1']].forEach(([n,c])=>{const P=D.calibration[n];
    g.append('path').datum(P).attr('d',d3.line().x(d=>x(d[0])).y(d=>y(d[1]))).attr('fill','none').attr('stroke',C[c]).attr('stroke-width',1.6).attr('opacity',.7);
    g.append('g').selectAll('circle').data(P).join('circle').attr('cx',d=>x(d[0])).attr('cy',d=>y(d[1])).attr('r',4.5).attr('fill',C[c]).attr('stroke',C.surface).attr('stroke-width',1.5)
      .on('pointermove',(ev,d)=>tip(`<b>${n}</b>${row('Mean prediction',pct(d[0]))}${row('Actual win rate',pct(d[1]))}${row('Matches',d[2])}`,ev)).on('pointerleave',untip);});
};

/* ===== Fig 31: heat maps ===== */
let HEAT='bar';
const HEAT_META={bar:['low','high','Low possession (44–61%)','High possession (71–82%)','Barça passes','Difference: high minus low'],opp:['opp_low','opp_high','Barça low possession','Barça high possession','Opponent passes','Difference: high minus low'],res:['win','loss','Wins','Defeats','Barça passes','Difference: defeats minus wins']};
R.heat=el=>{
  const [ka,kb,ta,tb,who,dt]=HEAT_META[HEAT];const A=D.heat[ka],B=D.heat[kb];
  const W=el.clientWidth;const cols=W>=700?3:1;const gapx=18;const pw=(W-gapx*(cols-1))/cols;const s=Math.min(pw/120,4.6);
  const ph=80*s+40;const rowsN=Math.ceil(3/cols);el.innerHTML='';
  const svg=d3.select(el).append('svg').attr('width',W).attr('height',ph*rowsN+10);
  const mx=Math.max(d3.max(A.flat()),d3.max(B.flat()));const seq=d3.scaleLinear([0,mx],[C.seq0,C.seq1]).interpolate(d3.interpolateRgb);
  const diff=A.map((r,i)=>r.map((v,j)=>B[i][j]-v));const dm=d3.max(diff.flat().map(Math.abs));
  const div=v=>v>=0?d3.interpolateRgb(C.mid,C.w)(v/dm):d3.interpolateRgb(C.mid,C.l)(-v/dm);
  const panels=[[A,ta,v=>seq(v),'share'],[B,tb,v=>seq(v),'share'],[diff,dt,div,'diff']];
  panels.forEach(([M,t,cf,kind],pi)=>{const cx=(pi%cols)*(pw+gapx)+(pw-120*s)/2,cy=Math.floor(pi/cols)*ph+22;
    const g=svg.append('g').attr('transform',`translate(${cx},${cy})`);
    g.append('text').attr('x',0).attr('y',-8).attr('fill',C.ink).style('font-size','12.5px').style('font-weight',600).text(kind==='diff'?t:`${who} · ${t}`);
    M.forEach((r,i)=>r.forEach((v,j)=>{g.append('rect').attr('x',j*10*s).attr('y',i*10*s).attr('width',10*s).attr('height',10*s).attr('fill',cf(v))
      .on('pointermove',ev=>tip(`<b>${kind==='diff'?'Difference':t}</b>${row('Zone',`x ${j*10}–${j*10+10}, y ${i*10}–${i*10+10}`)}${row(kind==='diff'?'Change in share':'Share of passes',(kind==='diff'&&v>0?'+':'')+(v*100).toFixed(2)+'%')}`,ev)).on('pointerleave',untip);}));
    pitch(g,s,{fill:false});
    g.append('text').attr('x',120*s).attr('y',80*s+14).attr('text-anchor','end').attr('fill',C.muted).style('font-size','11px').text('attacking →');
  });
  const cap={bar:'Barça passes in their lowest-possession quartile (44.0–60.6%) and highest (71.3–82.3%). With more of the ball, a smaller share of passes came from their own third (16.0% vs 25.8%) and a larger share from the final third (28.9% vs 21.5%).',
    opp:'Opponent passes in the same two groups of matches, each shown attacking right. When Barça dominated the ball, opponents played 34.9% of their passes in their own third, compared with 26.4%.',
    res:'Barça passes in wins and in defeats. The maps are almost identical. Defeats show a slightly larger final-third share (27.5% vs 24.8%), which fits a team spending more of those matches chasing.'};
  $('#heat-cap').textContent=cap[HEAT]+' The third map shows the difference: blue where the second group has a larger share, red where it has a smaller one.';
};

/* ===== Fig 32: shot zones ===== */
let SHOT='bar';
R.shots=el=>{
  const S=D.shots;const [a,b,ta,tb]=SHOT==='bar'?[S.bar_win,S.bar_loss,'Barça shots in wins','Barça shots in defeats']:[S.opp_low,S.opp_high,'Opponent shots, Barça low possession','Opponent shots, Barça high possession'];
  const W=el.clientWidth;const cols=W>=620?2:1;const gapx=20;const pw=(W-gapx*(cols-1))/cols;const s=Math.min(pw/60,4.4);const ph=80*s+58;el.innerHTML='';
  const svg=d3.select(el).append('svg').attr('width',W).attr('height',ph*(cols===2?1:2)+6);
  const mx=Math.max(d3.max(a.xg.flat()),d3.max(b.xg.flat()));const seq=d3.scaleSqrt([0,mx],[C.seq0,C.seq1]).interpolate(d3.interpolateRgb);
  [[a,ta],[b,tb]].forEach(([M,t],pi)=>{const cx=(cols===2?pi*(pw+gapx):0)+(pw-60*s)/2,cy=(cols===2?0:pi*ph)+22;const g=svg.append('g').attr('transform',`translate(${cx},${cy})`);
    g.append('text').attr('x',0).attr('y',-8).attr('fill',C.ink).style('font-size','12.5px').style('font-weight',600).text(t);
    M.xg.forEach((r,i)=>r.forEach((v,j)=>{const fill=seq(v);g.append('rect').attr('x',j*10*s).attr('y',i*10*s).attr('width',10*s).attr('height',10*s).attr('fill',fill)
      .on('pointermove',ev=>tip(`<b>${t}</b>${row('Zone',`x ${60+j*10}–${70+j*10}, y ${i*10}–${i*10+10}`)}${row('xG per match',v.toFixed(3))}${row('Shots per match',M.n[i][j].toFixed(2))}`,ev)).on('pointerleave',untip);
      if(v>=0.03&&s*10>=34)g.append('text').attr('x',j*10*s+5*s).attr('y',i*10*s+5*s+4).attr('text-anchor','middle').attr('fill',inkOn(fill)).style('font-size','11px').style('pointer-events','none').text(v.toFixed(2));}));
    pitch(g,s,{x0:60,fill:false});
    const tx=d3.sum(M.xg.flat()),tn=d3.sum(M.n.flat());
    g.append('text').attr('x',0).attr('y',80*s+18).attr('fill',C.ink2).style('font-size','12px').text(`${tx.toFixed(2)} non-penalty xG per match · ${tn.toFixed(1)} shots`);
  });
  $('#shot-cap').textContent=(SHOT==='bar'?'Barça took almost as many shots in defeats as in wins, but of much lower quality. The biggest gap is in the central zone in and around the box.':'When Barça had the most possession, opponents managed 0.60 non-penalty xG per match from 6.6 shots, compared with 0.95 from 11.6 in Barça’s low-possession matches.')+' Attacking half only (x from 60 to 120), in 10 × 10 zones, attacking to the right.';
};

/* ===== Fig 33: managers ===== */
R.mgr=el=>{
  const M=D.managers;const f=frame(el,320,{t:20,r:24,b:40,l:44});
  const x=d3.scaleLinear([0.615,0.70],[0,f.iw]),y=d3.scaleLinear([0.6,0.84],[f.ih,0]);
  yAxis(f.g,y,f.iw,{values:[.6,.65,.7,.75,.8],fmt:d3.format('.0%'),label:'Win rate',lx:40});
  xAxis(f.g,x,f.ih,{values:[.62,.64,.66,.68,.7],fmt:d3.format('.0%'),label:'Mean possession'});
  const rs=d3.scaleSqrt([0,140],[0,24]);
  f.g.selectAll('circle').data(M).join('circle').attr('cx',d=>x(d.poss)).attr('cy',d=>y(d.win)).attr('r',d=>rs(d.n)).attr('fill',C.s1).attr('opacity',.35).attr('stroke',C.s1).attr('stroke-width',1.5);
  const off={Guardiola:[0,-1],Vilanova:[1,0],Setién:[1,0],Koeman:[1,0],Martino:[-1,0],'Luis Enrique':[1,0],Valverde:[-1,0],Rijkaard:[1,0]};
  M.forEach(d=>{const o=off[d.mgr]||[1,0];const r=rs(d.n);txt(f.g,x(d.poss)+o[0]*(r+6),y(d.win)+(o[1]?-(r+6):4),d.mgr,{anchor:o[0]<0?'end':(o[1]?'middle':'start'),size:12,fill:C.ink,weight:600});});
  hoverLayer(f.g,f.iw,f.ih,M,d=>[x(d.poss),y(d.win)],d=>`<b>${d.mgr}</b>${row('Matches',d.n)}${row('Possession',pct(d.poss))}${row('Won / drawn / lost',`${pct(d.win,0)} / ${pct(d.draw,0)} / ${pct(d.loss,0)}`)}${row('xG for / against',`${f2(d.xg)} / ${f2(d.xga)}`)}`,40);
};

/* ===== Fig 34: style small multiples ===== */
R.style=el=>{
  const S=D.style;const W=el.clientWidth;const cols=W>=640?2:1;const gap=24;const pw=(W-gap*(cols-1))/cols;const ph=170;el.innerHTML='';
  const svg=d3.select(el).append('svg').attr('width',W).attr('height',ph*Math.ceil(4/cols));
  const specs=[['seq_mean','Passes per Barça possession sequence',d3.format('.1f')],['seq10','Sequences of 10+ passes per match',d3.format('.0f')],['ppda','PPDA (higher = less pressing)',d3.format('.0f')],['field_tilt','Field tilt (final-third pass share)',d3.format('.0%')]];
  specs.forEach(([k,t,fm],i)=>{const g=svg.append('g').attr('transform',`translate(${(i%cols)*(pw+gap)+36},${Math.floor(i/cols)*ph+26})`);const iw=pw-48,ih=ph-60;
    const ext=d3.extent(S,d=>d[k]);const pad=(ext[1]-ext[0])*0.15;const y=d3.scaleLinear([ext[0]-pad,ext[1]+pad],[ih,0]).nice(4);const x=d3.scalePoint(S.map(d=>d.season),[0,iw]);
    g.append('text').attr('x',-36).attr('y',-10).attr('fill',C.ink).style('font-size','12.5px').style('font-weight',600).text(t);
    yAxis(g,y,iw,{ticks:3,fmt:fm});
    const xa=g.append('g').attr('transform',`translate(0,${ih})`).call(d3.axisBottom(x).tickValues(S.filter((d,j)=>j%4===0).map(d=>d.season)).tickFormat(sshort).tickSize(3));styleAxis(xa);
    g.append('path').datum(S).attr('d',d3.line().x(d=>x(d.season)).y(d=>y(d[k]))).attr('fill','none').attr('stroke',C.s1).attr('stroke-width',2);
    const e=S[S.length-1],s0=S[0];[s0,e].forEach(d=>{g.append('circle').attr('cx',x(d.season)).attr('cy',y(d[k])).attr('r',4).attr('fill',C.s1).attr('stroke',C.surface).attr('stroke-width',2);});
    txt(g,x(e.season),y(e[k])-9,fm(e[k]),{anchor:'end',size:11.5,fill:C.ink,weight:600});txt(g,x(s0.season)+4,y(s0[k])-9,fm(s0[k]),{size:11.5,fill:C.ink2});
    g.append('rect').attr('width',iw).attr('height',ih).attr('fill','transparent').on('pointermove',ev=>{const [mx]=d3.pointer(ev);const j=Math.round(mx/x.step());const d=S[Math.max(0,Math.min(S.length-1,j))];tip(`<b>${d.season}</b>${row(t,fm(d[k]))}`,ev);}).on('pointerleave',untip);});
};

/* ===== Fig 35: bootstrap ===== */
R.boot=el=>{
  const B=D.bootstrap;const W=el.clientWidth;const cols=W>=760?3:1;const gap=20;const pw=(W-gap*(cols-1))/cols;const ph=190;el.innerHTML='';
  const svg=d3.select(el).append('svg').attr('width',W).attr('height',ph*(cols===3?1:3));
  const specs=[['raw','Raw',C.s1],['elo','Elo-adjusted',C.l],['level','While level',C.s3]];
  const x0=0.3,x1=2.0,bw=0.025;const nb=Math.round((x1-x0)/bw);const upd=[];
  specs.forEach(([k,t,c],i)=>{const g=svg.append('g').attr('transform',`translate(${(cols===3?i*(pw+gap):0)+10},${(cols===3?0:i*ph)+30})`);const iw=pw-20,ih=ph-64;
    const x=d3.scaleLinear([x0,x1],[0,iw]);const b=B[k];
    g.append('rect').attr('x',x(b.lo)).attr('width',x(b.hi)-x(b.lo)).attr('y',0).attr('height',ih).attr('fill',c).attr('opacity',.1);
    g.append('text').attr('x',0).attr('y',-12).attr('fill',C.ink).style('font-size','12.5px').style('font-weight',600).text(t);
    g.append('text').attr('x',iw).attr('y',-12).attr('text-anchor','end').attr('fill',C.ink2).style('font-size','11.5px').text(`95%: ${b.lo.toFixed(2)}–${b.hi.toFixed(2)}`);
    styleAxis(g.append('g').attr('transform',`translate(0,${ih})`).call(d3.axisBottom(x).tickValues([0.5,1,1.5,2]).tickFormat(d3.format('~g')).tickSize(4)));
    g.append('line').attr('x1',x(1)).attr('x2',x(1)).attr('y1',-2).attr('y2',ih).attr('stroke',C.ink2).attr('stroke-width',1.3);
    const bars=g.append('g');const cnt=new Array(nb).fill(0);const full=new Array(nb).fill(0);b.vals.forEach(v=>{const j=Math.floor((v-x0)/bw);if(j>=0&&j<nb)full[j]++;});const y=d3.scaleLinear([0,d3.max(full)*1.1],[ih,0]);
    const draw=()=>{bars.selectAll('rect').data(cnt).join('rect').attr('x',(d,j)=>x(x0+j*bw)+0.5).attr('width',Math.max(1,x(x0+bw)-x(x0)-1)).attr('y',d=>y(d)).attr('height',d=>ih-y(d)).attr('fill',c);};
    const add=(from,to)=>{for(let q=from;q<to;q++){const v=b.vals[q];const j=Math.floor((v-x0)/bw);if(j>=0&&j<nb)cnt[j]++;}draw();};
    add(0,b.vals.length);upd.push({cnt,add,draw,n:b.vals.length});});
  plays.boot=()=>{if(reduceMotion)return;upd.forEach(u=>{u.cnt.fill(0);u.draw();});let q=0;const t=d3.interval(()=>{const nq=Math.min(2000,q+50);upd.forEach(u=>u.add(q,nq));q=nq;if(q>=2000)t.stop();},40);};
};

/* ===== Fig 36: permutation ===== */
R.perm=el=>{
  const W=el.clientWidth;const cols=W>=640?2:1;const gap=24;const pw=(W-gap*(cols-1))/cols;const ph=200;el.innerHTML='';
  const svg=d3.select(el).append('svg').attr('width',W).attr('height',ph*(cols===2?1:2));
  const specs=[[D.perm,'Whole-match possession',C.s1],[D.perm_level,'Possession while level',C.s3]];
  const x0=-0.17,x1=0.17,bw=0.005;const nb=Math.round((x1-x0)/bw);const upd=[];
  specs.forEach(([P,t,c],i)=>{const g=svg.append('g').attr('transform',`translate(${(cols===2?i*(pw+gap):0)+10},${(cols===2?0:i*ph)+32})`);const iw=pw-20,ih=ph-70;
    const x=d3.scaleLinear([x0,x1],[0,iw]);const full=new Array(nb).fill(0);P.vals.forEach(v=>{const j=Math.floor((v-x0)/bw);if(j>=0&&j<nb)full[j]++;});const y=d3.scaleLinear([0,d3.max(full)*1.1],[ih,0]);
    g.append('text').attr('x',0).attr('y',-14).attr('fill',C.ink).style('font-size','12.5px').style('font-weight',600).text(t);
    g.append('text').attr('x',iw).attr('y',-14).attr('text-anchor','end').attr('fill',C.ink2).style('font-size','11.5px').text(`observed r = ${P.obs>=0?'+':'−'}${Math.abs(P.obs).toFixed(3)} · p = ${P.p.toFixed(3)}`);
    styleAxis(g.append('g').attr('transform',`translate(0,${ih})`).call(d3.axisBottom(x).tickValues([-0.15,-0.1,-0.05,0,0.05,0.1,0.15]).tickFormat(d3.format('+.2f')).tickSize(4)));
    const bars=g.append('g');const cnt=new Array(nb).fill(0);const ob=Math.abs(P.obs);
    const draw=()=>{bars.selectAll('rect').data(cnt).join('rect').attr('x',(d,j)=>x(x0+j*bw)+0.3).attr('width',Math.max(1,x(x0+bw)-x(x0)-0.6)).attr('y',d=>y(d)).attr('height',d=>ih-y(d))
      .attr('fill',(d,j)=>{const mid=x0+(j+0.5)*bw;return Math.abs(mid)>=ob?c:C.axis;});};
    const add=(a,b)=>{for(let q=a;q<b;q++){const j=Math.floor((P.vals[q]-x0)/bw);if(j>=0&&j<nb)cnt[j]++;}draw();};
    [P.obs].forEach(v=>{g.append('line').attr('x1',x(v)).attr('x2',x(v)).attr('y1',-4).attr('y2',ih).attr('stroke',C.ink).attr('stroke-width',2);});
    add(0,P.vals.length);upd.push({cnt,add,draw});});
  plays.perm=()=>{if(reduceMotion)return;upd.forEach(u=>{u.cnt.fill(0);u.draw();});let q=0;const t=d3.interval(()=>{const nq=Math.min(5000,q+125);upd.forEach(u=>u.add(q,nq));q=nq;if(q>=5000)t.stop();},40);};
};

/* ===== Fig 37: sensitivity ===== */
R.sens=el=>{const rows=D.sensitivity.map(d=>({name:d.name,or:d.or10,lo:d.lo,hi:d.hi,p:d.p,n:d.n}));forest(el,rows,{lo:0.35,hi:2,ticks:[0.4,0.5,0.7,1,1.4,2],lw:240});};

/* ===== Fig 38: goal distribution ===== */
R.goaldist=el=>{
  const G=D.goal_dist;const W=el.clientWidth;el.innerHTML='';const ph=210;
  const svg=d3.select(el).append('svg').attr('width',W).attr('height',ph*2);
  [['gf','Goals scored'],['ga','Goals conceded']].forEach(([k,t],i)=>{const g=svg.append('g').attr('transform',`translate(36,${i*ph+26})`);const iw=W-46,ih=ph-62;
    const ks=G.k.slice(0,k==='gf'?9:6);const x=d3.scaleBand(ks.map(String),[0,iw]).padding(.3);const ym=d3.max([...G['obs_'+k],...G['exp_'+k]]);const y=d3.scaleLinear([0,ym*1.1],[ih,0]);
    g.append('text').attr('x',-30).attr('y',-10).attr('fill',C.ink).style('font-size','12.5px').style('font-weight',600).text(t);
    yAxis(g,y,iw,{ticks:3});styleAxis(g.append('g').attr('transform',`translate(0,${ih})`).call(d3.axisBottom(x).tickSize(0).tickPadding(6)));
    const bw=Math.min(24,x.bandwidth());
    ks.forEach(v=>{const o=G['obs_'+k][v],e=G['exp_'+k][v];const cx=x(String(v))+x.bandwidth()/2;
      g.append('rect').attr('x',cx-bw/2).attr('width',bw).attr('y',y(o)).attr('height',ih-y(o)).attr('fill',C.s1).attr('rx',3);
      g.append('circle').attr('cx',cx).attr('cy',y(e)).attr('r',4.5).attr('fill',C.surface).attr('stroke',C.ink).attr('stroke-width',2);
      g.append('rect').attr('x',x(String(v))).attr('width',x.bandwidth()).attr('y',0).attr('height',ih).attr('fill','transparent').on('pointermove',ev=>tip(`<b>${t}: ${v}</b>${row('Observed',o)}${row('Poisson expected',e.toFixed(1))}`,ev)).on('pointerleave',untip);});});
};

/* ===== Fig 39: W/D/L area ===== */
R.wdlArea=el=>{
  const P=D.poisson_curve;const f=frame(el,260,{t:14,r:12,b:40,l:40});
  const x=d3.scaleLinear([45,82],[0,f.iw]),y=d3.scaleLinear([0,1],[f.ih,0]);
  const data=P.x.map((v,i)=>({x:v,W:P.W[i],D:P.D[i],L:P.L[i]}));
  const st=d3.stack().keys(['W','D','L'])(data);
  st.forEach(l=>f.g.append('path').datum(l).attr('d',d3.area().x(d=>x(d.data.x)).y0(d=>y(d[0])+(d[0]>0?1:0)).y1(d=>y(d[1])-1)).attr('fill',RC(l.key)).attr('opacity',.85));
  yAxis(f.g,y,f.iw,{values:[0,.25,.5,.75,1],fmt:d3.format('.0%'),grid:false});
  xAxis(f.g,x,f.ih,{values:[45,55,65,75],fmt:d=>d+'%',label:'possession'});
  const mid=data[Math.floor(data.length/2)];
  txt(f.g,x(mid.x),y(mid.W/2)+4,`Win ${pct(mid.W,0)}`,{anchor:'middle',size:13,fill:inkOn(C.w),weight:600});
  txt(f.g,x(mid.x),y(mid.W+mid.D/2)+4,`Draw ${pct(mid.D,0)}`,{anchor:'middle',size:12,fill:inkOn(C.d),weight:600});
  txt(f.g,x(mid.x),y(mid.W+mid.D+mid.L/2)+4,`Loss ${pct(mid.L,0)}`,{anchor:'middle',size:12,fill:inkOn(C.l),weight:600});
  hoverLayer(f.g,f.iw,f.ih,data,d=>[x(d.x),y(0.5)],d=>`<b>${d.x}% possession</b>${row('Win',pct(d.W))}${row('Draw',pct(d.D))}${row('Loss',pct(d.L))}`,f.ih);
};

/* ===== Fig 40: Monte Carlo ===== */
const MC={cnt:null,n:0,timer:null};
function poissonSample(l){const L=Math.exp(-l);let k=0,p=1;do{k++;p*=Math.random();}while(p>L);return k-1;}
function simSeason(P){const pf=D.poisson.gf,pa=D.poisson.ga;const M=D.matches;let pts=0;
  for(let i=0;i<38;i++){const m=M[Math.floor(Math.random()*M.length)];const E=m.elo_diff/100;
    const l1=Math.exp(pf.Intercept.b+pf.P.b*P+pf.E.b*E+pf.home.b*m.home),l2=Math.exp(pa.Intercept.b+pa.P.b*P+pa.E.b*E+pa.home.b*m.home);
    const g1=poissonSample(l1),g2=poissonSample(l2);pts+=g1>g2?3:(g1===g2?1:0);}return pts;}
R.mc=el=>{
  const f=frame(el,290,{t:28,r:14,b:40,l:44});const x=d3.scaleLinear([62,114],[0,f.iw]);
  const pres=[['55',C.s2],['65',C.s1],['75',C.s3]];const dens=k=>D.mc[k].hist.map(v=>v/10000);
  const ym=d3.max(pres,([k])=>d3.max(dens(k)));const y=d3.scaleLinear([0,ym*1.25],[f.ih,0]);
  yAxis(f.g,y,f.iw,{ticks:4,fmt:d3.format('.0%'),label:'share of seasons',lx:40});
  xAxis(f.g,x,f.ih,{values:[65,70,75,80,85,90,95,100,105,110],label:'points in a 38-match season'});
  const bars=f.g.append('g');
  pres.forEach(([k,c])=>{const d0=dens(k);const d=d0.map((v,i)=>((d0[i-1]||0)+v+(d0[i+1]||0))/3);const pts=d3.range(62,115).map(p=>[x(p),y(d[p]||0)]);
    f.g.append('path').attr('d',d3.line().curve(d3.curveMonotoneX)(pts)).attr('fill','none').attr('stroke',c).attr('stroke-width',2.2);
    const mn=D.mc[k].mean;f.g.append('line').attr('x1',x(mn)).attr('x2',x(mn)).attr('y1',y(0)).attr('y2',y(ym*1.08)).attr('stroke',c).attr('stroke-width',1.2);
    txt(f.g,x(mn)+(k==='55'?4:(k==='75'?-4:0)),y(ym*1.08)-4-(k==='65'?14:0),`${k}%: ${mn.toFixed(1)}`,{anchor:k==='55'?'start':(k==='75'?'end':'middle'),size:11.5,fill:C.ink,weight:600});});
  const drawBars=()=>{if(!MC.cnt)return;bars.selectAll('rect').data(MC.cnt.map((v,i)=>[i,v])).join('rect').attr('x',d=>x(d[0]-0.5)+0.5).attr('width',Math.max(1,x(1)-x(0)-1)).attr('y',d=>y(d[1]/Math.max(1,MC.n))).attr('height',d=>f.ih-y(d[1]/Math.max(1,MC.n))).attr('fill',C.s4).attr('opacity',.45);};
  el._draw=drawBars;drawBars();
};
function mcRun(){
  if(MC.timer){MC.timer.stop();MC.timer=null;}
  const P=+$('#mc-slider').value;MC.cnt=new Array(115).fill(0);MC.n=0;const all=[];const el=$('[data-chart="mc"]');
  const step=()=>{for(let i=0;i<100;i++){const p=Math.min(114,simSeason(P));MC.cnt[p]++;all.push(p);MC.n++;}
    el._draw&&el._draw();const mean=d3.mean(all);const s=all.slice().sort((a,b)=>a-b);
    $('#mc-read').innerHTML=`<span>Seasons simulated <b>${comma(MC.n)}</b></span><span>Mean <b>${mean.toFixed(1)} pts</b></span><span>90% range <b>${s[Math.floor(.05*s.length)]}–${s[Math.floor(.95*s.length)]}</b></span><span>Possession <b>${P}%</b></span>`;
    if(MC.n>=2000){MC.timer.stop();MC.timer=null;}};
  if(reduceMotion){while(MC.n<2000){for(let i=0;i<100;i++){const p=Math.min(114,simSeason(P));MC.cnt[p]++;all.push(p);MC.n++;}}step();return;}
  MC.timer=d3.interval(step,35);
}

/* ---------- tables ---------- */
function fillTables(){
  const ex=(id,rows)=>{$(id).innerHTML=`<thead><tr><th>Date</th><th class="l">Match</th><th>Poss.</th><th>xG</th></tr></thead><tbody>${rows.map(d=>`<tr><td>${dstr(d.date)}</td><td class="l"><span class="pill"><i style="background:var(--${d.result.toLowerCase()})"></i>${d.result}</span> ${d.home?`Barça ${d.gf}–${d.ga} ${d.opponent}`:`${d.opponent} ${d.ga}–${d.gf} Barça`}</td><td>${pct(d.poss)}</td><td>${f2(d.xg)}–${f2(d.xga)}</td></tr>`).join('')}</tbody>`;};
  ex('#t-high',D.extremes.high);ex('#t-low',D.extremes.low);
  const N=D.naive;$('#t-chi').innerHTML=`<thead><tr><th>Possession quintile</th><th>Range</th><th>Matches</th><th>Wins observed</th><th>Wins expected</th><th>Difference</th><th>Win rate</th></tr></thead><tbody>${N.quint.map((q,i)=>{const o=N.ct[i][1],e=N.exp[i][1];return `<tr><td>Q${i+1}</td><td>${pct(q.lo)} – ${pct(q.hi)}</td><td>${q.n}</td><td>${o}</td><td>${e.toFixed(1)}</td><td>${o-e>=0?'+':'−'}${Math.abs(o-e).toFixed(1)}</td><td>${pct(o/q.n)}</td></tr>`;}).join('')}</tbody>`;
  const Q=D.quartiles;const mxp=d3.max(Q,d=>d.passes);
  $('#t-quart').innerHTML=`<thead><tr><th>Quartile</th><th>Possession</th><th>Barça passes</th><th>xG</th><th>xG / 100 passes</th><th>Opp. shots</th><th>xG against</th><th>Opp. Elo</th><th>Min. trailing</th><th>Win rate</th></tr></thead><tbody>${Q.map((q,i)=>`<tr><td>Q${i+1}${i===0?' (lowest)':i===3?' (highest)':''}</td><td>${pct(q.poss)}</td><td class="l"><span class="minibar" style="width:${Math.round(q.passes/mxp*60)}px"></span>${Math.round(q.passes)}</td><td>${f2(q.xg)}</td><td>${f2(q.xg_per100)}</td><td>${q.opp_shots.toFixed(1)}</td><td>${f2(q.xga)}</td><td>${Math.round(q.elo)}</td><td>${q.min_trail.toFixed(1)}</td><td>${pct(q.win)}</td></tr>`).join('')}</tbody>`;
  $('#t-mgr').innerHTML=`<thead><tr><th>Head coach</th><th>Matches</th><th>Won</th><th>Drawn</th><th>Lost</th><th>Possession</th><th>xG</th><th>xG against</th><th>Field tilt</th><th>PPDA</th></tr></thead><tbody>${D.managers.map(m=>`<tr><td>${m.mgr}</td><td>${m.n}</td><td>${pct(m.win)}</td><td>${pct(m.draw)}</td><td>${pct(m.loss)}</td><td>${pct(m.poss)}</td><td>${f2(m.xg)}</td><td>${f2(m.xga)}</td><td>${pct(m.field_tilt)}</td><td>${m.ppda.toFixed(1)}</td></tr>`).join('')}</tbody>`;
  const mods=[D.logit_poss,D.logit_poss_time,D.logit_pre,D.logit_level,D.models.elo,D.models.elo_poss,D.models.elo_pre,D.models.poss_sot,D.models.poss_sot_ga,D.models.xg,D.models.pre_elo_xg];
  const pf=p=>p<0.001?'<0.001':p.toFixed(3);
  $('#t-reg').innerHTML=`<thead><tr><th>Model</th><th>Term</th><th>β</th><th>SE</th><th>z</th><th>p</th><th>n</th><th>AUC</th><th>McFadden R²</th></tr></thead><tbody>${mods.map(m=>m.coefs.map((c,i)=>`<tr><td>${i===0?`<b>${m.name}</b>`:''}</td><td class="l">${c.term.replace('Intercept','intercept')}</td><td>${c.b.toFixed(4)}</td><td>${c.se.toFixed(4)}</td><td>${c.z.toFixed(2)}</td><td>${pf(c.p)}</td><td>${i===0?m.n:''}</td><td>${i===0?m.auc.toFixed(3):''}</td><td>${i===0?m.mcf.toFixed(3):''}</td></tr>`).join('')).join('')}</tbody>`;
  const dict=[['Possession (pass share)','Barça passes ÷ all passes in the match, counting every Pass event.'],['Possession (in-play time)','Seconds of possession sequences controlled by Barça ÷ total, measured from the first to the last event of each sequence.'],
    ['Pre-goal possession','Pass share before the first goal of the match, optionally excluding the last g minutes of build-up. Whole match if 0–0.'],['Possession while level','Pass share in all periods when the scores were equal.'],
    ['Score state','Leading, level or trailing at the moment of each event, from goals rebuilt out of the event stream.'],['xG / xG against','Sum of StatsBomb expected-goals values of each team’s shots, penalties included unless stated.'],
    ['Shots on target','Shots with outcome Goal, Saved or Saved to Post.'],['Field tilt','Barça passes starting in the final third (x ≥ 80) as a share of both teams’ final-third passes.'],
    ['PPDA','Opponent passes in their own 60% of the pitch ÷ Barça tackles, interceptions and fouls in that zone.'],['Box entries','Completed passes that end inside the penalty area and start outside it.'],
    ['Elo edge','Barça pre-match Elo − opponent Elo ± 90 home-advantage points.'],['Win','1 if Barça won, 0 for a draw or defeat.']];
  $('#dict').innerHTML=dict.map(([a,b])=>`<div><span class="t">${a}</span><span>${b}</span></div>`).join('');
}

/* ---------- legends ---------- */
function legends(){
  const L={wdl:[['var(--w)','Win'],['var(--d)','Draw'],['var(--l)','Defeat']],curves:[['var(--s1)','LOWESS + 95% band','ln'],['var(--s2)','Quadratic logistic','ln'],['var(--s3)','Linear logistic','ln']],
    twodef:[['var(--s1)','Pass share'],['var(--s2)','In-play time share']],goals:[['var(--w)','Barça scored at minute 0','ln'],['var(--l)','Barça conceded at minute 0','ln']],
    state:[['var(--w)','Leading','sq'],['var(--muted)','Level','sq'],['var(--l)','Trailing','sq']],gap:[['var(--s1)','Pre-goal possession → win'],['var(--s2)','Possession while level → win'],['var(--s3)','Pre-goal possession → scores first']],
    roc:ROC_S.map(([n,c])=>[`var(--${c})`,`${n} (AUC ${D.ladder.find(d=>d.name===n).auc.toFixed(2)})`,'ln']),cal:[['var(--s2)','Whole-match possession'],['var(--s4)','Elo edge + venue'],['var(--s1)','xG for & against']],
    gd:[['var(--s1)','Observed','sq'],['var(--ink)','Poisson expected']],mc:[['var(--s2)','55% possession','ln'],['var(--s1)','65%','ln'],['var(--s3)','75%','ln'],['var(--s4)','Your simulation','sq']]};
  $$('[data-legend]').forEach(el=>{const it=L[el.dataset.legend]||[];el.innerHTML=it.map(([c,t,k])=>`<span><i class="${k||''}" style="background:${c}"></i>${t}</span>`).join('');});
}

/* ---------- TOC & progress ---------- */
function toc(){
  const secs=$$('section.chapter');const ol=$('#toc'),mo=$('#mtoc');
  secs.forEach((s,i)=>{const n=s.id==='appendix'?'A':String(i+1);const t=s.dataset.title;
    ol.insertAdjacentHTML('beforeend',`<li><a href="#${s.id}" data-sec="${s.id}"><span>${n}</span><span>${t}</span></a></li>`);
    mo.insertAdjacentHTML('beforeend',`<li><a href="#${s.id}">${t}</a></li>`);});
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){$$('.toc a').forEach(a=>a.classList.toggle('on',a.dataset.sec===e.target.id));}}),{rootMargin:'-35% 0px -60% 0px'});
  secs.forEach(s=>io.observe(s));
  const prog=$('#prog'),rb=$('#readbar'),rp=$('#readpct');
  const onScroll=()=>{const h=document.documentElement.scrollHeight-innerHeight;const p=h>0?Math.min(1,Math.max(0,scrollY/h)):0;prog.style.width=(p*100)+'%';rb.style.width=(p*100)+'%';rp.textContent=`You have read ${Math.round(p*100)}% of the report`;};
  addEventListener('scroll',onScroll,{passive:true});onScroll();
}

/* ---------- controls ---------- */
function controls(){
  $$('[data-replay]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.replay;plays[k]&&plays[k]();}));
  $$('[data-alg]').forEach(b=>b.addEventListener('click',()=>{$$('[data-alg]').forEach(x=>x.setAttribute('aria-pressed',x===b));FIT.alg=b.dataset.alg;if(FIT.timer){FIT.timer.stop();FIT.timer=null;}FIT.i=null;$$('[data-chart^="fit"]').forEach(render);}));
  $('#fit-play').addEventListener('click',fitPlay);
  $$('[data-pm]').forEach(b=>b.addEventListener('click',()=>{$$('[data-pm]').forEach(x=>x.setAttribute('aria-pressed',x===b));PM=b.dataset.pm;render($('[data-chart="predictor"]'));}));
  $('#poss-slider').addEventListener('input',()=>{const el=$('[data-chart="predictor"]');el._upd&&el._upd();});
  $('#rp-play').addEventListener('click',rpPlay);
  $$('[data-speed]').forEach(b=>b.addEventListener('click',()=>{$$('[data-speed]').forEach(x=>x.setAttribute('aria-pressed',x===b));RP.speed=+b.dataset.speed;}));
  $('#path-play').addEventListener('click',()=>plays.path&&plays.path());
  $$('[data-gapmode]').forEach(b=>b.addEventListener('click',()=>{$$('[data-gapmode]').forEach(x=>x.setAttribute('aria-pressed',x===b));GAPMODE=b.dataset.gapmode;render($('[data-chart="gap"]'));}));
  $$('[data-heat]').forEach(b=>b.addEventListener('click',()=>{$$('[data-heat]').forEach(x=>x.setAttribute('aria-pressed',x===b));HEAT=b.dataset.heat;render($('[data-chart="heat"]'));}));
  $$('[data-shot]').forEach(b=>b.addEventListener('click',()=>{$$('[data-shot]').forEach(x=>x.setAttribute('aria-pressed',x===b));SHOT=b.dataset.shot;render($('[data-chart="shots"]'));}));
  $('#mc-slider').addEventListener('input',()=>{$('#mc-val').textContent=$('#mc-slider').value+'%';});
  $('#mc-run').addEventListener('click',mcRun);
}

/* ---------- boot ---------- */
function boot(){
  legends();fillTables();toc();rpChips();controls();
  $$('[data-chart]').forEach(render);rpUpdate(rpLen());
  $('#mc-read').innerHTML='<span>Press <b>Simulate</b> to run 2,000 seasons at the chosen possession.</span>';
  const ro=new ResizeObserver(es=>es.forEach(e=>{const el=e.target;if(Math.abs(el.clientWidth-(el._w||0))>2){clearTimeout(el._t);el._t=setTimeout(()=>{render(el);if(el.dataset.chart.startsWith('replay'))rpUpdate(RP.t==null?rpLen():RP.t);},140);}}));
  $$('[data-chart]').forEach(el=>ro.observe(el));
  const rerender=()=>{renderAll();rpUpdate(RP.t==null?rpLen():RP.t);};
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change',rerender);
  new MutationObserver(rerender).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  if(!reduceMotion){
    const auto={hero:0.3,events:0.45,roc:0.45,boot:0.4,perm:0.4,path:0.5};
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const k=e.target.dataset.chart;io.unobserve(e.target);if(k==='path'){setTimeout(()=>plays.path&&plays.path(),200);}else plays[k]&&plays[k]();}}),{threshold:0.4});
    Object.keys(auto).forEach(k=>{const el=$(`[data-chart="${k}"]`);el&&io.observe(el);});
    const fitEl=$('[data-chart="fitCurve"]');const io2=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){io2.disconnect();fitPlay();}}),{threshold:0.5});io2.observe(fitEl);
  }
}
if(typeof d3==='undefined'){document.querySelectorAll('[data-chart]').forEach(el=>{el.innerHTML='<p style="font-family:var(--sans);font-size:14px;color:var(--muted)">This chart needs the D3 library, which could not load. Check your connection and reload the page.</p>';});}
else if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
