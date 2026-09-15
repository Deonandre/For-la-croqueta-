const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";            // 13.3 x 7.5 in
pres.author = "TdC";
pres.title  = "Penser contre l'intuition";

const GREEN="A6CE8E", PAPER="FCFBF7", RED="B23A32", CORAL="F5827A", CORALD="C25B52",
      YELLOW="F7C927", INK="3A3A38", MUTED="7E7E74", RULE="E3EBF2", MARGIN="EAA9A4",
      DARK="232323", MAROON="7A2E27", NOTE="F7F1B4", SOFT="F6F3EA", GOLD="6B4A05", OLIVE="5E5A38";
const HEAD="Century Schoolbook", BODY="Calibri", MONO="Courier New";

const PX=0.62, PY=0.40, PW=12.10, PH=6.70;
const CX=1.62, CR=12.40, CW=CR-CX;

function page(slide, num){
  slide.background = { color: GREEN };
  slide.addShape(pres.ShapeType.roundRect,{x:PX,y:PY,w:PW,h:PH,rectRadius:0.06,
    fill:{color:PAPER},line:{color:"E7E2D6",width:0.75},
    shadow:{type:"outer",color:"3F5C2E",opacity:0.38,blur:16,offset:5,angle:75}});
  for(let y=1.00;y<=PY+PH-0.28;y+=0.40)
    slide.addShape(pres.ShapeType.rect,{x:PX+0.40,y,w:PW-0.80,h:0.012,fill:{color:RULE},line:{type:"none"}});
  slide.addShape(pres.ShapeType.rect,{x:1.36,y:PY+0.12,w:0.015,h:PH-0.24,fill:{color:MARGIN},line:{type:"none"}});
  slide.addShape(pres.ShapeType.rect,{x:1.43,y:PY+0.12,w:0.015,h:PH-0.24,fill:{color:MARGIN},line:{type:"none"}});
  for(let y=PY+0.30;y<=PY+PH-0.32;y+=0.74){
    slide.addShape(pres.ShapeType.roundRect,{x:0.30,y,w:0.66,h:0.17,rectRadius:0.09,fill:{color:DARK},line:{type:"none"}});
    slide.addShape(pres.ShapeType.roundRect,{x:0.40,y:y+0.045,w:0.30,h:0.055,rectRadius:0.03,fill:{color:"6E6E6E"},line:{type:"none"}});
  }
  if(num) slide.addText(String(num).padStart(2,"0")+" / 10",
    {x:CR-1.5,y:6.68,w:1.5,h:0.26,isTextBox:true,margin:0,align:"right",
     fontFace:MONO,fontSize:10,color:MUTED});
}
function kicker(slide,t){
  slide.addText(t,{x:CX,y:0.52,w:8.4,h:0.24,isTextBox:true,margin:0,
    fontFace:MONO,fontSize:10,bold:true,color:CORALD,charSpacing:1.4});
}
function title(slide,t,o){
  o=o||{}; const y=0.76, sz=o.size||26;
  if(o.hl) slide.addShape(pres.ShapeType.rect,{x:CX-0.07,y:y+0.19,w:o.hl,h:0.34,
    fill:{color:YELLOW,transparency:42},line:{type:"none"},rotate:-0.7});
  slide.addText(t,{x:CX,y,w:CW,h:0.58,isTextBox:true,margin:0,valign:"middle",
    fontFace:HEAD,fontSize:sz,bold:true,color:RED,charSpacing:0.3});
}
function card(o){
  o.slide.addShape(pres.ShapeType.roundRect,{x:o.x,y:o.y,w:o.w,h:o.h,rectRadius:0.07,
    fill:{color:o.fill||"FFFFFF"},line:{color:o.border||"E8A9A3",width:o.lw||1.25},
    shadow:{type:"outer",color:"8FAE7E",opacity:0.30,blur:7,offset:2,angle:90}});
}
function sticky(o){
  const r=o.rotate||0;
  o.slide.addShape(pres.ShapeType.rect,{x:o.x,y:o.y,w:o.w,h:o.h,rotate:r,
    fill:{color:o.fill||NOTE},line:{type:"none"},
    shadow:{type:"outer",color:"6B6633",opacity:0.30,blur:9,offset:3,angle:90}});
  o.slide.addShape(pres.ShapeType.rect,{x:o.x+o.w/2-0.45,y:o.y-0.13,w:0.90,h:0.26,rotate:r-5,
    fill:{color:"FFFFFF",transparency:48},line:{type:"none"}});
}
function dot(slide,x,y,d,label,fillC,txtC,fs){
  slide.addShape(pres.ShapeType.ellipse,{x,y,w:d,h:d,fill:{color:fillC},line:{type:"none"}});
  slide.addText(label,{x,y,w:d,h:d,isTextBox:true,margin:0,align:"center",valign:"middle",
    fontFace:MONO,fontSize:fs||13,bold:true,color:txtC});
}
function body(slide,t,o){
  slide.addText(t,{x:o.x,y:o.y,w:o.w,h:o.h,isTextBox:true,margin:0,valign:o.valign||"top",
    fontFace:BODY,fontSize:o.size||13,color:o.color||INK,lineSpacing:o.ls||17,
    align:o.align||"left",italic:o.italic||false,bold:o.bold||false});
}
function head(slide,t,o){
  slide.addText(t,{x:o.x,y:o.y,w:o.w,h:o.h||0.28,isTextBox:true,margin:0,valign:o.valign||"middle",
    fontFace:HEAD,fontSize:o.size||14,bold:true,color:o.color||RED,charSpacing:0.2});
}
function badge(slide,x,y,w,h,t,bg,fg,fs){
  slide.addShape(pres.ShapeType.roundRect,{x,y,w,h,rectRadius:0.05,fill:{color:bg},line:{type:"none"}});
  slide.addText(t,{x,y,w,h,isTextBox:true,margin:0,align:"center",valign:"middle",
    fontFace:MONO,fontSize:fs||10,bold:true,color:fg});
}

/* ========== 1. TITRE ========== */
let s = pres.addSlide(); page(s);
s.addShape(pres.ShapeType.rect,{x:5.15,y:0.24,w:2.9,h:0.72,rotate:-1.5,fill:{color:"FFFEF2"},
  line:{color:"EDE7D2",width:0.75},shadow:{type:"outer",color:"3F5C2E",opacity:0.30,blur:8,offset:3,angle:90}});
s.addShape(pres.ShapeType.rect,{x:6.15,y:0.11,w:0.95,h:0.30,rotate:-8,fill:{color:"FFFFFF",transparency:50},line:{type:"none"}});
s.addText("TdC · SUJET 6",{x:5.15,y:0.36,w:2.9,h:0.42,isTextBox:true,margin:0,rotate:-1.5,
  align:"center",valign:"middle",fontFace:MONO,fontSize:11,bold:true,color:CORALD,charSpacing:1.2});
s.addShape(pres.ShapeType.rect,{x:1.52,y:1.95,w:6.55,h:0.52,fill:{color:YELLOW,transparency:45},line:{type:"none"},rotate:-0.6});
s.addText("PENSER CONTRE",{x:CX,y:1.42,w:9.0,h:0.90,isTextBox:true,margin:0,valign:"middle",
  fontFace:HEAD,fontSize:50,bold:true,color:RED,charSpacing:0.6});
s.addText("L'INTUITION",{x:CX,y:2.26,w:9.0,h:0.90,isTextBox:true,margin:0,valign:"middle",
  fontFace:HEAD,fontSize:50,bold:true,color:RED,charSpacing:0.6});
body(s,"Dans la recherche de la connaissance, quel est l'intérêt d'explorer\nce qui est paradoxal ou contre-intuitif ?",
  {x:CX,y:3.30,w:6.9,h:0.80,size:14.5,ls:21,italic:true});
s.addShape(pres.ShapeType.roundRect,{x:8.72,y:3.30,w:3.62,h:0.66,rectRadius:0.07,fill:{color:CORAL},line:{type:"none"},
  shadow:{type:"outer",color:"8FAE7E",opacity:0.30,blur:7,offset:2,angle:90}});
s.addText("SCIENCES NATURELLES",{x:8.72,y:3.30,w:3.62,h:0.66,isTextBox:true,margin:0,align:"center",valign:"middle",
  fontFace:MONO,fontSize:12,bold:true,color:MAROON,charSpacing:0.8});
s.addShape(pres.ShapeType.roundRect,{x:8.72,y:4.12,w:3.62,h:0.66,rectRadius:0.07,fill:{color:YELLOW},line:{type:"none"},
  shadow:{type:"outer",color:"8FAE7E",opacity:0.30,blur:7,offset:2,angle:90}});
s.addText("MATHÉMATIQUES",{x:8.72,y:4.12,w:3.62,h:0.66,isTextBox:true,margin:0,align:"center",valign:"middle",
  fontFace:MONO,fontSize:12,bold:true,color:GOLD,charSpacing:0.8});
s.addText("les deux domaines de la connaissance comparés",{x:8.52,y:4.88,w:4.0,h:0.28,isTextBox:true,margin:0,
  align:"center",fontFace:BODY,fontSize:10.5,italic:true,color:MUTED});
s.addText("FIL CONDUCTEUR",{x:8.52,y:5.46,w:4.0,h:0.24,isTextBox:true,margin:0,align:"center",
  fontFace:MONO,fontSize:9.5,bold:true,color:MUTED,charSpacing:1.4});
s.addText("anomalie  →  vérification  →  révision",{x:8.52,y:5.74,w:4.0,h:0.32,isTextBox:true,margin:0,
  align:"center",fontFace:HEAD,fontSize:13,bold:true,color:CORALD});
sticky({slide:s,x:CX,y:4.72,w:3.35,h:1.62,rotate:-1.2});
s.addText([
  {text:"Prénom NOM",options:{fontFace:HEAD,fontSize:15,bold:true,color:INK,breakLine:true}},
  {text:"Classe : ______________",options:{fontFace:BODY,fontSize:12,color:INK,breakLine:true}},
  {text:"Présentation orale — 10 diapositives",options:{fontFace:BODY,fontSize:11,italic:true,color:OLIVE}}
],{x:CX+0.22,y:4.90,w:2.95,h:1.25,isTextBox:true,margin:0,valign:"middle",lineSpacing:20,rotate:-1.2});
s.addNotes("Accroche : demander à la classe si elle sent que la Terre tourne. Personne ne le sent — pourtant nous filons à 1 670 km/h à l'équateur. Ce décalage entre ce que nous ressentons et ce qui est vrai, c'est exactement mon sujet.\n\nAnnoncer le plan : définir contre-intuitif et paradoxal, poser la question de connaissance, défendre l'idée que l'anomalie est informative en sciences naturelles, montrer que le paradoxe joue un rôle tout autre en mathématiques, puis en tester les limites avec un contre-exemple réel.\n\nRemplacer le post-it par mon nom et ma classe avant la présentation.");

/* ========== 2. INTRODUCTION ========== */
s = pres.addSlide(); page(s,2);
kicker(s,"DIAPOSITIVE 2 — INTRODUCTION");
title(s,"De quoi parle-t-on exactement ?",{hl:4.75});
card({slide:s,x:CX,y:1.52,w:5.30,h:2.24,border:CORAL});
dot(s,CX+0.28,1.78,0.42,"1",CORAL,MAROON);
head(s,"CONTRE-INTUITIF",{x:CX+0.84,y:1.80,w:4.2,size:14});
body(s,"Un énoncé vrai qui heurte nos attentes spontanées.\nLe désaccord est entre le monde et nous.\n\nEx. : à l'équateur, nous tournons à 1 670 km/h — et nous ne sentons rien.",
  {x:CX+0.28,y:2.36,w:4.74,h:1.30,size:12.5,ls:16.5});
card({slide:s,x:CX,y:3.96,w:5.30,h:2.14,border:CORAL});
dot(s,CX+0.28,4.22,0.42,"2",RED,"FFFFFF");
head(s,"PARADOXAL",{x:CX+0.84,y:4.24,w:4.2,size:14});
body(s,"Deux raisonnements également valides qui aboutissent à des conclusions incompatibles.\nLe désaccord n'est plus avec l'observation : il est dans le cadre lui-même.",
  {x:CX+0.28,y:4.80,w:4.74,h:1.10,size:12.5,ls:16.5});
card({slide:s,x:7.30,y:1.52,w:5.10,h:4.58,fill:SOFT,border:"D9CFB8"});
head(s,"Pourquoi est-ce un sujet de connaissance ?",{x:7.58,y:1.76,w:4.54,h:0.58,size:14});
s.addText([
 {text:"Nos théories les plus solides sont nées d'un écart entre l'attendu et l'observé.",options:{bullet:true,breakLine:true}},
 {text:"L'anomalie est l'endroit où un savoir se fissure — donc l'endroit où il devient visible.",options:{bullet:true,breakLine:true}},
 {text:"Elle oblige à expliciter les hypothèses restées implicites : on ne voit son cadre que lorsqu'il résiste.",options:{bullet:true,breakLine:true}},
 {text:"Mais elle coûte cher : réviser une théorie, c'est renoncer à des acquis.",options:{bullet:true}}
],{x:7.58,y:2.44,w:4.54,h:2.55,isTextBox:true,margin:0,fontFace:BODY,fontSize:12.5,color:INK,paraSpaceAfter:9,lineSpacing:17});
s.addShape(pres.ShapeType.rect,{x:7.58,y:5.14,w:4.54,h:0.015,fill:{color:"D9CFB8"},line:{type:"none"}});
body(s,"« La surprise nous renseigne autant sur l'état de nos attentes que sur l'état du monde. »",
  {x:7.58,y:5.30,w:4.54,h:0.60,size:12.5,italic:true,color:CORALD,ls:17});
s.addNotes("Distinguer les deux mots, car on les confond : le contre-intuitif est un conflit entre le monde et nos attentes (il se règle par l'observation) ; le paradoxe est un conflit interne entre deux raisonnements valides (il se règle en révisant le cadre). Cette distinction structure toute ma présentation : elle explique pourquoi les sciences naturelles et les mathématiques ne traitent pas la surprise de la même façon.\n\nInsister sur le troisième point : on ne voit jamais son propre cadre de pensée tant qu'il fonctionne. C'est quand il bloque qu'il devient visible — l'anomalie a donc une valeur de révélateur, pas seulement de correction.");

/* ========== 3. QUESTION DE CONNAISSANCE ========== */
s = pres.addSlide(); page(s,3);
kicker(s,"DIAPOSITIVE 3 — QUESTION DE CONNAISSANCE");
title(s,"Ma question de connaissance",{hl:4.35});
card({slide:s,x:CX,y:1.52,w:CW,h:1.70,fill:"FFFCF0",border:RED,lw:1.6});
dot(s,CX+0.36,2.08,0.58,"?",RED,"FFFFFF",19);
s.addText("Dans quelle mesure l'exploration de ce qui est paradoxal ou contre-intuitif est-elle nécessaire à la production de connaissances fiables ?",
  {x:CX+1.16,y:1.76,w:9.30,h:1.22,isTextBox:true,margin:0,valign:"middle",
   fontFace:HEAD,fontSize:18,bold:true,color:RED,lineSpacing:26});
head(s,"Trois questions secondaires pour l'explorer",{x:CX,y:3.42,w:7,size:13.5,color:CORALD});
const subq=[
 ["a","Comment distinguer une anomalie féconde d'une simple erreur de mesure ?","Enjeu : les critères de fiabilité."],
 ["b","L'intuition est-elle un critère de vérité, ou seulement une habitude bien installée ?","Enjeu : les outils de connaissance."],
 ["c","Le « contre-intuitif » a-t-il le même sens dans tous les domaines de connaissance ?","Enjeu : la comparaison des domaines."]
];
subq.forEach(function(q,i){
  const x=CX+i*3.63;
  card({slide:s,x,y:3.82,w:3.42,h:2.46,border:CORAL});
  dot(s,x+0.26,4.04,0.40,q[0],YELLOW,GOLD,12);
  body(s,q[1],{x:x+0.26,y:4.60,w:2.90,h:1.10,size:12.5,ls:17});
  body(s,q[2],{x:x+0.26,y:5.76,w:2.90,h:0.42,size:11,italic:true,color:MUTED,ls:14});
});
s.addNotes("Justifier le choix de la formulation : je ne demande pas « faut-il explorer le paradoxal ? » (la réponse serait un oui creux), mais « dans quelle mesure est-ce NÉCESSAIRE à des connaissances FIABLES ? ». Les deux mots font travailler : nécessaire ouvre la possibilité que ce soit utile sans être indispensable ; fiable oblige à parler des critères de justification, pas seulement de découverte.\n\nLes trois sous-questions correspondent aux trois moments de l'exposé : (a) diapositives 5 et 7, (b) diapositive 9, (c) diapositive 6.");

/* ========== 4. CONCEPTS TdC ========== */
s = pres.addSlide(); page(s,4);
kicker(s,"DIAPOSITIVE 4 — CONCEPTS TdC MOBILISÉS");
title(s,"Les concepts qui font travailler la question",{hl:6.85});
const cons=[
 ["CERTITUDE","Un paradoxe montre qu'une certitude partagée reste révisable : la confiance n'est pas la vérité.",CORAL,MAROON],
 ["JUSTIFICATION","Qu'est-ce qui autorise à croire un résultat qui choque le sens commun ?",RED,"FFFFFF"],
 ["ÉLÉMENTS DE PREUVE","Une anomalie n'est pas encore une réfutation : il faut la répliquer avant de l'interpréter.",YELLOW,GOLD],
 ["INTERPRÉTATION","Un même fait surprenant admet plusieurs lectures : erreur, hasard, ou théorie nouvelle.",CORAL,MAROON],
 ["PERSPECTIVE","Contre-intuitif par rapport à quel cadre, quelle époque, quelle culture scientifique ?",RED,"FFFFFF"],
 ["OBJECTIVITÉ","L'intuition est privée et non vérifiable ; la reproductibilité est une procédure publique.",YELLOW,GOLD]
];
cons.forEach(function(c,i){
  const col=i%3, row=Math.floor(i/3);
  const x=CX+col*3.63, y=1.52+row*2.06;
  card({slide:s,x,y,w:3.42,h:1.86,border:"E8CFA8"});
  dot(s,x+0.24,y+0.22,0.40,String(i+1),c[2],c[3],12);
  head(s,c[0],{x:x+0.76,y:y+0.24,w:2.50,size:12.5});
  body(s,c[1],{x:x+0.24,y:y+0.78,w:2.94,h:0.94,size:12,ls:16});
});
sticky({slide:s,x:CX,y:5.86,w:CW,h:0.66,rotate:-0.4});
body(s,"Outils de connaissance en jeu : intuition · raison · imagination — et c'est précisément leur hiérarchie que le sujet met en question.",
  {x:CX+0.30,y:6.03,w:CW-0.60,h:0.34,size:12.5,align:"center",color:OLIVE,bold:true});
s.addNotes("Ne pas réciter la liste : montrer que ces concepts s'articulent. Certitude et justification forment le couple central — un résultat contre-intuitif est peu certain subjectivement mais peut être fortement justifié. Preuve et interprétation disent comment on passe de l'un à l'autre. Perspective et objectivité rappellent que « contre-intuitif » est un jugement situé : il dépend du cadre depuis lequel on regarde.\n\nSur les outils de connaissance : l'intuition n'est pas disqualifiée, elle est déplacée. Elle reste excellente pour produire des hypothèses, mais elle n'est pas un tribunal.");

/* ========== 5. PREMIER ARGUMENT ========== */
s = pres.addSlide(); page(s,5);
kicker(s,"DIAPOSITIVE 5 — PREMIER ARGUMENT · SCIENCES NATURELLES");
title(s,"L'anomalie est ce qui informe le plus",{hl:5.85});
card({slide:s,x:CX,y:1.76,w:5.30,h:1.44,fill:"FFFCF0",border:RED,lw:1.6});
s.addText([{text:"THÈSE — ",options:{fontFace:MONO,fontSize:11,bold:true,color:CORALD}},
 {text:"un résultat attendu confirme peu. Un résultat contre-intuitif départage les théories rivales : il élimine plus d'hypothèses, donc il informe davantage.",
  options:{fontFace:BODY,fontSize:12.5,color:INK}}],
 {x:CX+0.26,y:1.94,w:4.76,h:1.08,isTextBox:true,margin:0,valign:"middle",lineSpacing:17});
card({slide:s,x:CX,y:3.40,w:5.30,h:1.32,border:CORAL});
dot(s,CX+0.24,3.58,0.38,"P",CORAL,MAROON,12);
head(s,"POPPER — la falsifiabilité",{x:CX+0.74,y:3.59,w:4.3,size:12.5});
body(s,"Une théorie ne vaut que par les risques qu'elle prend. Une théorie qui explique tout n'interdit rien — donc n'apprend rien.",
  {x:CX+0.24,y:4.04,w:4.78,h:0.60,size:11.5,ls:15});
card({slide:s,x:CX,y:4.92,w:5.30,h:1.18,border:CORAL});
dot(s,CX+0.24,5.10,0.38,"K",RED,"FFFFFF",12);
head(s,"KUHN — l'anomalie qui s'accumule",{x:CX+0.74,y:5.11,w:4.3,size:12.5});
body(s,"La science normale absorbe les anomalies isolées ; quand elles s'accumulent, le paradigme bascule.",
  {x:CX+0.24,y:5.56,w:4.78,h:0.44,size:11.5,ls:15});
head(s,"Trois anomalies qui ont refondé la physique",{x:7.30,y:1.44,w:5.1,size:13,color:CORALD});
const tl=[["1887","Michelson & Morley","Aucun « vent d'éther » n'est détecté, alors que toute la physique l'exigeait. → 1905 : relativité restreinte. Le temps cesse d'être absolu.",CORAL,MAROON],
 ["1900","Rayonnement du corps noir","La physique classique prédit une énergie infinie (la future « catastrophe ultraviolette »). → Planck introduit les quanta.",RED,"FFFFFF"],
 ["1964–82","Bell, puis Aspect","L'intrication quantique viole le réalisme local : deux particules restent corrélées à distance. → Prix Nobel 2022.",YELLOW,GOLD]];
tl.forEach(function(t,i){
  const y=1.76+i*1.46;
  card({slide:s,x:7.30,y,w:5.10,h:1.34,border:"E8CFA8"});
  badge(s,7.54,y+0.18,1.16,0.32,t[0],t[3],t[4],10.5);
  head(s,t[1],{x:8.82,y:y+0.18,w:3.36,h:0.32,size:12.5});
  body(s,t[2],{x:7.54,y:y+0.60,w:4.62,h:0.62,size:11.5,ls:15});
});
body(s,"Dans chaque cas, c'est un désaccord — non une confirmation — qui a fait avancer le savoir.",
  {x:CX,y:6.30,w:CW-1.6,h:0.32,size:12.5,italic:true,color:CORALD,align:"center"});
s.addNotes("Articuler Popper et Kuhn plutôt que les juxtaposer. Popper donne la raison logique : une prédiction improbable qui se vérifie élimine beaucoup de concurrentes ; c'est un argument de théorie de l'information. Kuhn donne la raison historique et sociale : une anomalie isolée ne renverse rien, c'est son accumulation qui rend un paradigme intenable.\n\nMichelson-Morley est l'exemple le plus parlant : l'expérience était censée mesurer la vitesse de la Terre dans l'éther, elle a trouvé zéro. Un échec total selon les critères de l'époque — et c'est ce zéro qui a ouvert la relativité. Préciser que Michelson lui-même a longtemps considéré son résultat comme un échec : l'anomalie ne devient féconde que réinterprétée dans un cadre nouveau.");

/* ========== 6. DEUXIÈME PERSPECTIVE ========== */
s = pres.addSlide(); page(s,6);
kicker(s,"DIAPOSITIVE 6 — AUTRE PERSPECTIVE · MATHÉMATIQUES");
title(s,"Le paradoxe mathématique ne vient pas du monde",{hl:7.45});
card({slide:s,x:CX,y:1.50,w:5.30,h:1.86,border:CORAL});
head(s,"SCIENCES NATURELLES",{x:CX+0.26,y:1.68,w:4.8,size:12.5,color:CORALD});
body(s,"Le contre-intuitif est un désaccord avec l'expérience.\nIl dit : « ta théorie est fausse ».\nArbitre : l'observation reproductible.",
  {x:CX+0.26,y:2.06,w:4.76,h:1.18,size:12.5,ls:17});
card({slide:s,x:7.30,y:1.50,w:5.10,h:1.86,fill:"FFFCF0",border:RED,lw:1.6});
head(s,"MATHÉMATIQUES",{x:7.56,y:1.68,w:4.6,size:12.5});
body(s,"Le paradoxe est un désaccord du système avec lui-même.\nIl dit : « tes axiomes t'engagent plus que prévu ».\nArbitre : la démonstration.",
  {x:7.56,y:2.06,w:4.56,h:1.18,size:12.5,ls:17});
const mx=[["RUSSELL · 1901-02","L'ensemble de tous les ensembles qui ne se contiennent pas eux-mêmes se contient-il ?\n\nLes deux réponses sont contradictoires : la théorie naïve des ensembles s'effondre. Résultat : une refondation axiomatique (ZFC).",CORAL,MAROON],
 ["GÖDEL · 1931","Tout système cohérent assez riche contient des énoncés vrais qu'il ne peut pas démontrer.\n\nL'incomplétude n'est pas provisoire : c'est un théorème. Le paradoxe a produit une connaissance sur les limites de la connaissance.",RED,"FFFFFF"],
 ["BANACH–TARSKI · 1924","Une boule peut être découpée puis recomposée en deux boules identiques à l'originale.\n\nAbsurde — et pourtant démontré. Ici le contre-intuitif ne réfute rien : il révèle le prix caché d'un axiome accepté (l'axiome du choix).",YELLOW,GOLD]];
mx.forEach(function(m,i){
  const x=CX+i*3.63;
  card({slide:s,x,y:3.56,w:3.42,h:2.24,border:"E8CFA8"});
  badge(s,x+0.24,3.74,2.94,0.30,m[0],m[2],m[3],9.5);
  body(s,m[1],{x:x+0.24,y:4.14,w:2.94,h:1.62,size:10.5,ls:14});
});
sticky({slide:s,x:CX,y:5.94,w:CW,h:0.58,rotate:-0.3});
body(s,"Même mot, deux fonctions : signal d'erreur en sciences naturelles ; révélateur de fondements en mathématiques.",
  {x:CX+0.30,y:6.08,w:CW-0.60,h:0.34,size:12.5,align:"center",bold:true,color:OLIVE});
s.addNotes("C'est le cœur comparatif exigé par le sujet. Bien marquer la différence de nature : en sciences naturelles, on révise la théorie parce que le MONDE dit non ; en mathématiques, il n'y a pas de monde à consulter — c'est le système qui se contredit lui-même, et on révise les axiomes.\n\nConséquence pour la fiabilité : en sciences naturelles, une anomalie peut toujours être une erreur de mesure, donc on réplique. En mathématiques, une contradiction démontrée est définitive : aucune réplication ne la sauvera. La façon de traiter la surprise dépend donc du mode de justification propre au domaine — c'est la réponse à ma sous-question (c).\n\nBanach-Tarski est le meilleur exemple à développer à l'oral : il est contre-intuitif ET vrai, ce qui prouve que l'intuition n'est pas un critère de validité en mathématiques.\n\nPrécision utile si on me pose la question : Russell a communiqué son paradoxe à Frege en 1902, alors que le second volume des Lois fondamentales de l'arithmétique était sous presse.");

/* ========== 7. CONTRE-ARGUMENT ========== */
s = pres.addSlide(); page(s,7);
kicker(s,"DIAPOSITIVE 7 — CONTRE-ARGUMENT ET LIMITES");
title(s,"Le contre-intuitif n'est pas une valeur en soi",{hl:7.35});
const lim=[["!","La plupart des anomalies sont des pannes.","2011 — l'expérience OPERA (CERN → Gran Sasso) annonce des neutrinos plus rapides que la lumière. Cause réelle : un connecteur de fibre optique mal serré et une horloge défectueuse. Résultat corrigé et retiré en juin 2012.",RED,"FFFFFF"],
 ["≠","Être rejeté ne rend pas vrai : le sophisme de Galilée.","« On s'est moqué de Galilée aussi » — mais on s'est aussi moqué de milliers de théories fausses. La fusion froide (Fleischmann & Pons, 1989) était spectaculairement contre-intuitive, et jamais reproduite. Le paradoxe attire donc aussi la pseudo-science.",CORAL,MAROON],
 ["≡","Ignorer les anomalies est parfois rationnel.","Kuhn lui-même l'admet : la science normale doit écarter la plupart des anomalies, sinon aucune recherche cumulative n'est possible. Poursuivre systématiquement le bizarre paralyserait la connaissance au lieu de la faire avancer.",YELLOW,GOLD]];
lim.forEach(function(l,i){
  const y=1.52+i*1.44;
  card({slide:s,x:CX,y,w:CW,h:1.32,border:"E8CFA8"});
  dot(s,CX+0.26,y+0.24,0.44,l[0],l[3],l[4],14);
  head(s,l[1],{x:CX+0.90,y:y+0.25,w:9.5,size:13});
  body(s,l[2],{x:CX+0.90,y:y+0.64,w:9.50,h:0.62,size:11.5,ls:15});
});
sticky({slide:s,x:CX,y:5.86,w:CW,h:0.66,rotate:-0.4});
s.addText([{text:"Limite de ma position : ",options:{fontFace:HEAD,fontSize:12.5,bold:true,color:RED}},
 {text:"ce n'est pas la surprise qui produit la connaissance, c'est la robustesse du résultat. Le paradoxe n'est pas une preuve — c'est une alerte à vérifier.",
  options:{fontFace:BODY,fontSize:12,color:OLIVE}}],
 {x:CX+0.34,y:5.98,w:CW-0.68,h:0.44,isTextBox:true,margin:0,valign:"middle",align:"center",lineSpacing:16});
s.addNotes("Ce contre-argument attaque directement ma diapositive 5. Si l'anomalie est si informative, pourquoi la communauté scientifique n'en poursuit-elle pas systématiquement ? Parce que la base est écrasante : la très grande majorité des résultats contre-intuitifs sont des artefacts.\n\nOPERA est un excellent cas car la collaboration a agi correctement : elle n'a pas proclamé une découverte, elle a publié en demandant une vérification indépendante. C'est la réponse à ma sous-question (a) : ce qui distingue une anomalie féconde d'une erreur n'est pas son degré d'étrangeté, mais la robustesse de la procédure.\n\nSi on me demande : non, je ne dis pas qu'il faut ignorer le paradoxal — je dis que sa valeur est conditionnelle, et que la condition est méthodologique.");

/* ========== 8. EXEMPLE DU MONDE RÉEL ========== */
s = pres.addSlide(); page(s,8);
kicker(s,"DIAPOSITIVE 8 — EXEMPLE DU MONDE RÉEL");
title(s,"1998 : personne ne voulait ce résultat",{hl:6.15});
const st=[["2","équipes rivales et indépendantes trouvent le même résultat",CORAL,MAROON],
 ["68 %","du contenu de l'univers reste aujourd'hui inexpliqué",RED,"FFFFFF"],
 ["2011","prix Nobel de physique : Perlmutter, Schmidt, Riess",YELLOW,GOLD]];
st.forEach(function(t,i){
  const x=CX+i*3.63;
  s.addShape(pres.ShapeType.roundRect,{x,y:1.52,w:3.42,h:1.30,rectRadius:0.07,fill:{color:t[2]},line:{type:"none"},
    shadow:{type:"outer",color:"8FAE7E",opacity:0.30,blur:7,offset:2,angle:90}});
  s.addText(t[0],{x:x+0.16,y:1.60,w:3.10,h:0.64,isTextBox:true,margin:0,align:"center",valign:"middle",
    fontFace:HEAD,fontSize:32,bold:true,color:t[3]});
  s.addText(t[1],{x:x+0.26,y:2.26,w:2.90,h:0.48,isTextBox:true,margin:0,align:"center",
    fontFace:BODY,fontSize:10.5,color:t[3],lineSpacing:13});
});
card({slide:s,x:CX,y:3.04,w:5.30,h:2.46,fill:"FFFCF0",border:RED,lw:1.6});
head(s,"Ce qui s'est passé",{x:CX+0.26,y:3.24,w:4.8,size:13});
body(s,"Les deux équipes mesuraient des supernovæ de type Ia pour calculer à quelle vitesse l'expansion de l'univers ralentissait.\n\nLes supernovæ lointaines sont apparues trop faibles : l'expansion accélère. Adam Riess a d'abord traqué l'erreur dans ses propres calculs — le résultat semblait absurde.",
  {x:CX+0.26,y:3.66,w:4.76,h:1.70,size:11.5,ls:15});
card({slide:s,x:7.30,y:3.04,w:5.10,h:2.46,border:CORAL});
head(s,"Pourquoi celui-ci a tenu, et pas OPERA",{x:7.56,y:3.24,w:4.6,size:13,color:CORALD});
body(s,"Structure logique identique : un résultat contredit la théorie établie. Issue inverse.\n\nCe qui a fait la différence n'est ni l'intuition ni le degré de surprise, mais la réplication par une équipe concurrente et la convergence avec d'autres données indépendantes.",
  {x:7.56,y:3.66,w:4.56,h:1.70,size:11.5,ls:15});
sticky({slide:s,x:CX,y:5.78,w:CW,h:0.62,rotate:-0.3});
s.addText([{text:"→ Lien avec ma question : ",options:{fontFace:HEAD,fontSize:12.5,bold:true,color:RED}},
 {text:"ce qui justifie une croyance contre-intuitive n'est pas l'évidence ressentie, mais une procédure publique et répétable.",
  options:{fontFace:BODY,fontSize:12,color:OLIVE}}],
 {x:CX+0.34,y:5.92,w:CW-0.68,h:0.36,isTextBox:true,margin:0,valign:"middle",align:"center",lineSpacing:16});
s.addNotes("Exemple choisi parce qu'il met en scène exactement la tension de la question. Les deux équipes cherchaient la décélération : leur hypothèse de départ était l'inverse de ce qu'elles ont trouvé. Elles n'avaient donc aucun intérêt à défendre ce résultat.\n\nLe point TdC décisif est la comparaison avec OPERA de la diapositive 7 : deux résultats également contre-intuitifs, l'un intégré au savoir, l'autre retiré. La différence ne tient pas à l'intuition des chercheurs mais à la réplication indépendante et à la convergence avec le fond diffus cosmologique et les oscillations acoustiques des baryons.\n\nMentionner l'honnêteté du dossier : plus de vingt-cinq ans après, nous ne savons toujours pas ce qu'est l'énergie noire. Explorer le paradoxal a donc ouvert un champ sans le refermer — le progrès a consisté à mieux formuler notre ignorance.");

/* ========== 9. ANALYSE & CONCLUSION ========== */
s = pres.addSlide(); page(s,9);
kicker(s,"DIAPOSITIVE 9 — ANALYSE ET CONCLUSION");
title(s,"Ce que l'on peut raisonnablement conclure",{hl:6.65});
const cc=[["1","Fécond — mais pas en soi","Explorer le contre-intuitif est utile parce que c'est là que les théories sont le plus testables : un résultat improbable élimine davantage d'hypothèses.\n\nMais il est aussi plus probablement faux. D'où la règle de Laplace : une affirmation extraordinaire exige des preuves extraordinaires.",CORAL,MAROON],
 ["2","Le mot change de sens selon le domaine","Signal d'erreur en sciences naturelles ; révélateur de fondements en mathématiques ; méthode délibérée en arts et en philosophie, où l'absurde de Camus ou le ready-made de Duchamp forcent le réexamen des catégories.\n\nIl n'existe donc pas une seule réponse.",RED,"FFFFFF"],
 ["3","Ce que j'ai appris sur la justification","Le « contre-intuitif » est relatif à nous, non au monde : la rotation de la Terre a cessé de l'être.\n\nNotre intuition est calibrée pour l'échelle humaine (Kahneman, système 1) ; elle échoue aux échelles quantique, cosmologique et statistique.",YELLOW,GOLD]];
cc.forEach(function(c,i){
  const x=CX+i*3.63;
  card({slide:s,x,y:1.52,w:3.42,h:3.58,border:"E8CFA8"});
  dot(s,x+0.24,1.72,0.42,c[0],c[3],c[4],13);
  head(s,c[1],{x:x+0.24,y:2.24,w:2.96,h:0.54,size:12.5,valign:"top"});
  body(s,c[2],{x:x+0.24,y:2.88,w:2.96,h:2.06,size:10.5,ls:14});
});
card({slide:s,x:CX,y:5.36,w:CW,h:1.10,fill:"FFFCF0",border:RED,lw:1.6});
s.addText("Implication : apprendre à connaître, ce n'est pas apprendre à faire confiance à son intuition — c'est apprendre à savoir quand s'en méfier, et selon quelles procédures.",
  {x:CX+0.40,y:5.52,w:CW-0.80,h:0.78,isTextBox:true,margin:0,valign:"middle",align:"center",
   fontFace:HEAD,fontSize:14,bold:true,color:RED,lineSpacing:23});
s.addNotes("Ne pas conclure par un « il faut explorer le paradoxal » : ce serait ignorer la diapositive 7. Ma conclusion est conditionnelle — la valeur du contre-intuitif vient de sa testabilité, pas de son étrangeté, et elle se paie d'un taux d'erreur élevé.\n\nInsister sur la troisième colonne, qui est la vraie réponse à ma sous-question (b) : l'intuition n'est pas un organe de vérité, c'est une heuristique adaptée à un environnement précis, celui des objets de taille moyenne et des vitesses lentes. Elle reste efficace là où elle a été calibrée — d'où son échec systématique en physique quantique et en statistique.\n\nOuvrir sur les autres domaines : si le paradoxe est une méthode délibérée en art et en philosophie, alors le juger seulement à l'aune des sciences serait une erreur de perspective. Plusieurs lectures restent donc légitimes — c'est ce que demande la TdC.");

/* ========== 10. SOURCES ========== */
s = pres.addSlide(); page(s,10);
kicker(s,"DIAPOSITIVE 10 — SOURCES");
title(s,"Sources et ressources utilisées",{hl:5.55});
function srcBlock(x,y,w,h,label,items,bg,fg){
  card({slide:s,x,y,w,h,border:"E8CFA8"});
  badge(s,x+0.24,y+0.18,1.70,0.28,label,bg,fg,9.5);
  s.addText(items.map(function(t,i){return {text:t,options:{bullet:true,breakLine:i<items.length-1}};}),
    {x:x+0.26,y:y+0.56,w:w-0.52,h:h-0.74,isTextBox:true,margin:0,
     fontFace:BODY,fontSize:10,color:INK,lineSpacing:12.5,paraSpaceAfter:5});
}
srcBlock(CX,1.52,5.30,2.34,"LIVRES",[
 "KUHN, T. S., La Structure des révolutions scientifiques, 1962 (trad. fr. Flammarion, 2008).",
 "POPPER, K., La Logique de la découverte scientifique, 1934 (trad. fr. Payot, 1973).",
 "KAHNEMAN, D., Système 1 / Système 2 : les deux vitesses de la pensée, Flammarion, 2012.",
 "NAGEL, E. & NEWMAN, J., Le Théorème de Gödel, Seuil, 1989."],CORAL,MAROON);
srcBlock(CX,4.20,5.30,2.34,"SITES",[
 "nobelprize.org — prix Nobel de physique 2011 (expansion accélérée) et 2022 (intrication).",
 "home.cern — communiqué du 8 juin 2012 : correction de la mesure de vitesse des neutrinos (OPERA).",
 "plato.stanford.edu — « Russell's Paradox », Stanford Encyclopedia of Philosophy.",
 "ibo.org — Guide de Théorie de la connaissance, Baccalauréat International."],YELLOW,GOLD);
srcBlock(7.30,1.52,5.10,3.30,"ARTICLES",[
 "RIESS, A. et al., « Observational Evidence from Supernovae for an Accelerating Universe », The Astronomical Journal, 116(3), 1998, p. 1009-1038.",
 "PERLMUTTER, S. et al., « Measurements of Ω and Λ from 42 High-Redshift Supernovae », The Astrophysical Journal, 517(2), 1999, p. 565-586.",
 "OPERA Collaboration, « Measurement of the neutrino velocity with the OPERA detector », arXiv:1109.4897, version corrigée, 2012.",
 "GÖDEL, K., « Über formal unentscheidbare Sätze der Principia Mathematica und verwandter Systeme I », Monatshefte für Mathematik und Physik, 38, 1931."],RED,"FFFFFF");
srcBlock(7.30,5.02,5.10,1.52,"IMAGES",[
 "Charte graphique inspirée du modèle « Notebook Lesson », Slidesgo / Freepik.",
 "Mise en page et composition : réalisation personnelle. Sites consultés en septembre 2026."],CORAL,MAROON);
s.addNotes("Préciser à l'oral le statut des sources : Kuhn et Popper sont des sources philosophiques de second ordre (elles fournissent les cadres d'analyse) ; Riess, Perlmutter, Gödel et OPERA sont des sources primaires (les articles originaux). Cette distinction compte en TdC : je ne m'appuie pas sur des résumés de vulgarisation pour mes exemples centraux.\n\nSur la fiabilité : les articles cités sont évalués par les pairs et abondamment cités ; le cas OPERA est documenté par le communiqué officiel du CERN, y compris sa rétractation — ce qui en fait justement un bon exemple de la manière dont une communauté corrige ses propres erreurs.");

pres.writeFile({ fileName: "/tmp/claude-0/-home-user-For-la-croqueta-/63418d71-94ad-51b3-a8dc-e8b79aaafa22/scratchpad/tok/TdC-Sujet6-Penser-contre-intuition.pptx" })
  .then(function(f){ console.log("écrit :", f); });
