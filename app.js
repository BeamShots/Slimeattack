'use strict';
const $=id=>document.getElementById(id), E=Slime;
const KEY='slimefall-v1:'+location.pathname.replace(/index\.html$/,'');
let meta=E.fresh(),storageFailed=false;
try{const saved=localStorage.getItem(KEY);if(saved)meta=E.normalize(JSON.parse(saved));}catch{storageFailed=true;}
E.accrue(meta);
let screen='home',page='',paused=true,toastTimer,bannerTimer,dirty=false,lastTime=performance.now(),saveClock=0,hudClock=0,musicClock=0;
let heldPointer=null;
let particles=[],texts=[],lines=[],rings=[],audio=null,installPrompt=null,previewCard=null;
const canvas=$('battleCanvas'),ctx=canvas.getContext('2d');
const enemyArt=new Image();enemyArt.src='./enemies.webp';
enemyArt.onerror=()=>notify('Enemy art could not load. Keep enemies.webp beside index.html.');
const enemyColors=['#9df77a','#ffde69','#91deff','#df99ff','#ff9271','#ffdc80','#8cfff4','#ffe4a1','#d29bff'];
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function button(text,action,disabled=false,cls=''){const n=el('button',cls,text);n.disabled=disabled;n.onclick=()=>{sound('ui');action();};return n;}
function icon(index){const n=el('span','skillIcon');n.dataset.icon=index;positionIcon(n,index);return n;}
function positionIcon(n,index){n.style.backgroundPosition=(index%4/3*100)+'% '+(Math.floor(index/4)/3*100)+'%';}
document.querySelectorAll('[data-icon]').forEach(n=>positionIcon(n,Number(n.dataset.icon)));
function save(){
 try{localStorage.setItem(KEY,JSON.stringify(meta));dirty=false;}catch{if(!storageFailed)notify('Device saving unavailable. Export a backup from Settings.');storageFailed=true;}
}
function notify(message){$('toast').textContent=message;$('toast').style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').style.display='none',2700);}
function banner(message){$('battleBanner').textContent=message;$('battleBanner').style.opacity=1;clearTimeout(bannerTimer);bannerTimer=setTimeout(()=>$('battleBanner').style.opacity=0,1300);}
function sound(type){
 if(!meta.settings.sound)return;
 try{
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
  if(!audio)audio=new Audio();if(audio.state==='suspended')audio.resume();
  const notes={ui:[460,.05,'sine',.035],tap:[690,.045,'triangle',.04],pop:[300,.11,'sine',.07],crit:[1100,.09,'triangle',.065],hurt:[120,.19,'sawtooth',.04],coin:[1350,.12,'sine',.05],power:[380,.3,'triangle',.06],draft:[540,.32,'sine',.07],buy:[840,.2,'sine',.06],pet:[850,.045,'sine',.015],over:[170,.5,'triangle',.045]};
  const [freq,duration,wave,volume]=notes[type]||notes.ui;
  const o=audio.createOscillator(),g=audio.createGain(),now=audio.currentTime;o.type=wave;o.frequency.setValueAtTime(freq,now);o.frequency.exponentialRampToValueAtTime(type==='pop'?90:freq*1.5,now+duration);
  g.gain.setValueAtTime(.001,now);g.gain.linearRampToValueAtTime(volume,now+.006);g.gain.exponentialRampToValueAtTime(.001,now+duration);o.connect(g);g.connect(audio.destination);o.start(now);o.stop(now+duration+.01);
 }catch{}
}
function ambient(){
 if(!meta.settings.music||!meta.settings.sound||!audio||document.hidden)return;
 try{
  const base=[146.83,174.61,220][Math.floor(performance.now()/8000)%3];
  [1,1.5,2].forEach((ratio,i)=>{
   const o=audio.createOscillator(),g=audio.createGain(),now=audio.currentTime+i*.3;o.type='sine';o.frequency.value=base*ratio;g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(.009,now+1);g.gain.linearRampToValueAtTime(0,now+6);o.connect(g);g.connect(audio.destination);o.start(now);o.stop(now+6);
  });
 }catch{}
}
function vibrate(n){if(meta.settings.haptics&&navigator.vibrate)navigator.vibrate(n);}
function dialog(title,content){
 heldPointer=null;paused=true;$('dialogTitle').textContent=title;$('dialogContent').replaceChildren(content);if(!$('dialog').open)$('dialog').showModal();
}
function closeDialog(){
 $('dialog').close();
 if(screen==='combat'&&meta.run?.phase==='fight')paused=false;
 if(meta.run?.phase==='over'&&screen==='combat')showHome();
}
$('closeDialog').onclick=()=>{sound('ui');closeDialog();};
$('dialog').addEventListener('cancel',e=>{e.preventDefault();closeDialog();});
function showScreen(name){
 screen=name;
 for(const id of ['home','combat','page'])$(id).classList.toggle('active',id===name);
 $('draftOverlay').hidden=!(name==='combat'&&meta.run?.phase==='draft');
}
function showHome(){heldPointer=null;paused=true;$('dialog').close();showScreen('home');updateHome();updateHUD();save();}
function updateHome(){
 $('coins').textContent='● '+Math.floor(meta.coins);
 $('shards').textContent='✦ '+meta.shards;
 $('homeStats').textContent='BEST WAVE '+meta.best+'  ·  '+meta.kills+' SLIMES DEFEATED';
 const active=meta.run&&meta.run.phase!=='over';
 $('resume').hidden=!active;$('resume').textContent=active?'Continue · wave '+meta.run.wave:'Continue your run';
 $('play').firstChild.textContent=active?'NEW RUN ':'BEGIN A RUN ';
 $('idleInfo').textContent=Math.floor(meta.idle.bank)+' coins ready · '+Math.round(E.idleRate(meta)*60)+'/min';
 $('claimIdle').disabled=meta.idle.bank<1;
}
function begin(){
 meta.run=E.start(meta);paused=false;particles=[];texts=[];rings=[];lines=[];
 $('dialog').close();showScreen('combat');updateHUD();save();banner('WAVE 1 · THE GLADE');sound('power');
}
$('play').onclick=()=>{
 sound('ui');
 if(meta.run&&meta.run.phase!=='over'){
  const body=el('div','menuButtons');body.append(el('p','','Start a fresh run? You keep all coins, crystals and permanent upgrades. Current run cards will be lost.'),button('Start a new run',begin,false,'primary'),button('Keep my run',closeDialog));dialog('A new beginning?',body);
 }else begin();
};
$('resume').onclick=resumeRun;
function resumeRun(){
 if(!meta.run||meta.run.phase==='over')return;
 $('dialog').close();showScreen('combat');paused=false;
 if(meta.run.phase==='draft')showDraft();
 updateHUD();
}
$('claimIdle').onclick=()=>{
 sound('coin');E.accrue(meta);const coins=E.claimIdle(meta);save();updateHome();notify(coins?'Sanctuary collected · +'+coins+' coins':'Your sanctuary is growing.');vibrate(12);
};
document.querySelectorAll('[data-page]').forEach(n=>n.onclick=()=>{sound('ui');openPage(n.dataset.page);});
$('back').onclick=showHome;
function openPage(name){
 page=name;paused=true;showScreen('page');$('pageTitle').textContent={workshop:'Ascension',collection:'Grimoire',milestones:'Milestones'}[name];renderPage();
}
function renderPage(){
 const root=$('pageContent');root.replaceChildren();
 if(page==='workshop'){
  root.append(el('p','notice','Permanent upgrades survive every run. Ward hearts apply when starting a new run. Other upgrades improve your current build too.'));
  for(const [id,u]of Object.entries(E.upgrades)){
   const panel=el('article','shopItem frame'),row=el('div','row'),copy=el('div','description'),level=meta.upgrades[id],cost=E.upgradeCost(meta,id);
   copy.append(el('h3','',u.name),el('div','levelTag','LEVEL '+level+' / '+u.max),el('p','',u.desc));
   const purchase=button(level>=u.max?'MAX LEVEL':cost+' '+(u.currency==='coins'?'coins':'crystals'),()=>{
    if(E.buy(meta,id)){sound('buy');vibrate(12);save();updateHome();renderPage();}
   },level>=u.max||meta[u.currency]<cost,'primary');
   row.append(icon(u.icon),copy);panel.append(row,purchase);root.append(panel);
  }
 }
 if(page==='collection'){
  root.append(el('p','notice','Discover cards by choosing them after a wave. Combine elements to make a build that grows beyond your base damage.'));
  const grid=el('div','collectionGrid');
  for(const c of E.cards){
   const known=meta.dex[c.id],panel=el('article','collectionItem frame '+c.rarity+(known?'':' locked'));
   panel.append(icon(c.icon),el('div','rarity',c.rarity),el('h3','',c.name),el('p','',c.desc),el('div','levelTag',known?'DISCOVERED':'NOT YET CHOSEN'));grid.append(panel);
  }root.append(grid);
 }
 if(page==='milestones'){
  for(const m of E.milestones){
   const claimed=meta.claimed.includes(m.id),ready=m.goal(meta),panel=el('article','frame shopItem');
   panel.append(el('h3','',m.name),el('p','',m.desc),el('div','levelTag',m.reward.coins+' coins · '+m.reward.shards+' crystals'),button(claimed?'Claimed':ready?'Claim reward':'In progress',()=>{
    if(E.claimMilestone(meta,m.id)){sound('coin');save();updateHome();renderPage();}
   },claimed||!ready,ready&&!claimed?'primary':''));
   root.append(panel);
  }
 }
}
function updateHUD(){
 $('coins').textContent='● '+Math.floor(meta.coins);$('shards').textContent='✦ '+meta.shards;
 const r=meta.run;if(!r)return;
 $('waveLabel').textContent='Wave '+r.wave+(r.wave%5===0?' · BOSS':'');
 $('health').textContent='♥ '+Math.ceil(r.hp)+' / '+r.maxHp;
 $('battleStats').textContent=Math.round(E.damage(meta,r))+' DMG · '+r.kills+' KILLS';
 $('waveProgress').style.width=(r.target?r.resolved/r.target*100:0)+'%';
 $('combo').textContent=r.combo>=5?r.combo+'× COMBO':'';
 for(const id of ['frost','fury']){
  const cooldown=r[id+'CD'];$(id).disabled=paused||r.phase!=='fight'||cooldown>0;
  $(id+'Label').textContent=cooldown>0?Math.ceil(cooldown)+'s':'READY';
 }
 $('petStatus').textContent='Hold to attack · spirit volleys · '+(1+(r.cards.familiar||0))+' target'+((r.cards.familiar||0)>0?'s':'')+' · '+((r.cards.haste||0)>0?'accelerated':'auto attacking');
}
function showDraft(){
 paused=false;$('draftOverlay').hidden=false;const r=meta.run;
 $('draftWave').textContent='WAVE '+r.wave+' CLEARED · +'+(8+r.wave*2)+' BASE COINS';
 $('draftCards').replaceChildren();
 for(const id of r.offers){
  const c=E.cards.find(c=>c.id===id),n=button('',()=>{
   if(E.choose(meta,id)){sound(c.rarity==='legendary'?'power':'buy');vibrate(20);save();$('draftOverlay').hidden=true;updateHUD();banner('WAVE '+meta.run.wave);dirty=true;}
  },false,'upgradeCard '+c.rarity);
  const copy=el('div','cardCopy');copy.append(el('div','rarity',c.rarity),el('h3','',c.name),el('p','',c.desc),el('span','nextLevel','LEVEL '+Math.min(c.max,(r.cards[id]||0)+1)+(r.cards[id]?' · STACK THIS POWER':' · NEW POWER')));
  if((r.cards[id]||0)+1===3&&['chain','poison','blast'].includes(id))copy.append(el('span','nextLevel','✦ EVOLUTION · '+{chain:'Guaranteed chains',poison:'Poison death-bursts',blast:'Larger explosion radius'}[id]));
  n.append(icon(c.icon),copy);$('draftCards').append(n);
 }
 $('reroll').disabled=r.rerolls<=0;$('reroll').textContent=r.rerolls>0?'↻ Reroll · 1 free':'Reroll used';
}
$('reroll').onclick=()=>{if(E.reroll(meta)){sound('draft');save();showDraft();}};
$('draftHome').onclick=showHome;
function showBuild(){
 const r=meta.run,body=el('div');
 if(!r)return;
 body.append(el('p','',Math.round(E.damage(meta,r))+' damage · '+r.kills+' kills · '+r.bestCombo+' best combo'));
 const list=el('div','buildList');
 for(const [id,n]of Object.entries(r.cards))if(n){const c=E.cards.find(c=>c.id===id);list.append(el('span','buildChip',c.name+' ×'+n));}
 if(!list.children.length)body.append(el('p','','Clear a wave to choose your first evolution.'));
 body.append(list,el('p','notice','Combos: Toxic bloom + Living lightning spreads poison. Permafrost + Wildfire doubles splash against slowed slimes. Prism reactor makes lightning stronger. Companion volleys inherit your card powers.'));
 dialog('Your evolving build',body);
}
$('buildInfo').onclick=showBuild;
$('pause').onclick=()=>{
 const body=el('div','menuButtons');body.append(button('Resume',closeDialog,false,'primary'),button('Inspect my cards',showBuild),button('Save & home',showHome));dialog('Take a breath',body);sound('ui');
};
for(const id of ['frost','fury'])$(id).onclick=()=>{if(paused)return;processEvents(E.ability(meta,id));dirty=true;updateHUD();};
function summary(){
 paused=true;const r=meta.run,body=el('div','summary');
 body.append(el('div','eyebrow',r.wave>meta.best?'A NEW FRONTIER':'THE WARD HAS FALLEN'),el('div','big','Wave '+r.wave),el('p','',r.kills+' kills · '+r.earned+' coins kept · '+r.bestCombo+' best combo'));
 const menu=el('div','menuButtons');menu.append(button('Try another build',begin,false,'primary'),button('Ascend & upgrade',()=>{$('dialog').close();openPage('workshop');}),button('Return home',showHome));body.append(menu);dialog('The power stays with you',body);save();
}
function processEvents(events){
 for(const e of events){
  if(e.type==='damage'){
   if(e.kind==='crit')sound('crit');
   texts.push({x:e.x,y:e.y,text:e.kind==='crit'?'CRIT '+Math.ceil(e.amount):String(Math.max(1,Math.round(e.amount))),color:e.kind==='crit'?'#ffe184':e.kind==='poison'?'#d5a2ff':'#e9ffff',life:.7,max:.7,big:e.kind==='crit'});
  }
  if(e.type==='kill'){
   sound('pop');addBurst(e.x,e.y,enemyColors[e.color],e.boss?23:10);
   if(e.boss){sound('coin');banner('BOSS SHATTERED');vibrate(35);}
   dirty=true;
  }
  if(e.type==='shards')texts.push({x:e.x,y:e.y,text:'+'+e.amount+' CRYSTAL',color:'#e5b6ff',life:1.3,max:1.3,big:true});
  if(e.type==='bolt')lines.push({...e,life:.18,max:.18});
  if(e.type==='burst')rings.push({...e,life:.35,max:.35});
  if(e.type==='pet'){sound('pet');lines.push({type:'bolt',x:.5,y:.99,x2:e.x,y2:e.y,color:'#91fbe7',life:.16,max:.16});}
  if(e.type==='meteor'){sound('power');lines.push({x:e.x-.2,y:-.2,x2:e.x,y2:e.y,color:'#ffbc79',life:.4,max:.4});addBurst(e.x,e.y,'#ffba70',22);rings.push({...e,radius:.32,color:'#ffac62',life:.5,max:.5});}
  if(e.type==='vortex'){sound('power');rings.push({x:.5,y:.5,radius:.8,color:'#bc93ff',life:.7,max:.7});}
  if(e.type==='freeze'){sound('power');banner('FROST NOVA');vibrate(16);rings.push({x:.5,y:.95,radius:1.1,color:'#9ee9ff',life:.7,max:.7});}
  if(e.type==='fury'){sound('power');banner('OVERCHARGED · DOUBLE DAMAGE');vibrate(16);}
  if(e.type==='hurt'){
   sound('hurt');vibrate(25);
   if(meta.settings.shake){$('arena').classList.remove('shake');void $('arena').offsetWidth;$('arena').classList.add('shake');}
  }
  if(e.type==='combo'){sound('coin');banner(e.amount+'× COMBO · +3 COINS');}
  if(e.type==='boss'){sound('power');banner(meta.run.wave%10===0?'THE VOID AWAKENS':'THE SLIME KING');}
  if(e.type==='wave'){heldPointer=null;sound('draft');vibrate(20);save();showDraft();}
  if(e.type==='over'){sound('over');summary();}
 }
 particles=particles.slice(-160);texts=texts.slice(-30);lines=lines.slice(-35);rings=rings.slice(-15);
}
function addBurst(x,y,color,count){
 for(let i=0;i<count;i++){const angle=Math.random()*Math.PI*2,speed=.03+Math.random()*.16;
  particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,color,life:.25+Math.random()*.35,max:.6,size:2+Math.random()*3});}
}
let width=360,height=450,ratio=1;
function dimensions(){
 const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight),d=Math.min(2,window.devicePixelRatio||1);
 if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);}
 width=w;height=h;ratio=d;ctx.setTransform(d,0,0,d,0,0);
}
function strikeAt(x,y){
 const candidates=meta.run.enemies.map(n=>({n,d:Math.hypot((n.x-x)*width,(n.y-y)*height)})).filter(({n,d})=>d<(n.boss?60:42));
 if(!candidates.length){rings.push({x,y,radius:.08,color:'#b7dfdc',life:.2,max:.2});return;}
 candidates.sort((a,b)=>a.d-b.d);sound('tap');vibrate(5);processEvents(E.attack(meta,candidates[0].n.id));dirty=true;updateHUD();
}
function aimPoint(event){const r=canvas.getBoundingClientRect();return {x:(event.clientX-r.left)/r.width,y:(event.clientY-r.top)/r.height};}
canvas.onpointerdown=e=>{
 if(paused||screen!=='combat'||meta.run?.phase!=='fight'||$('dialog').open||heldPointer)return;
 e.preventDefault();const p=aimPoint(e);heldPointer={...p,id:e.pointerId,clock:.16};
 if(canvas.setPointerCapture&&e.pointerId!==undefined)canvas.setPointerCapture(e.pointerId);
 strikeAt(p.x,p.y);
};
canvas.onpointermove=e=>{if(heldPointer&&heldPointer.id===e.pointerId)Object.assign(heldPointer,aimPoint(e));};
canvas.onpointerup=()=>heldPointer=null;
canvas.onpointercancel=()=>heldPointer=null;
canvas.onlostpointercapture=()=>heldPointer=null;
function drawEnemy(e,time){
 const centerX=e.x*width,centerY=e.y*height,bounce=Math.sin(time*7+e.id)*2,size=e.boss?Math.min(126,width*.31):Math.min(82,width*.2);
 ctx.fillStyle='#05172d66';ctx.beginPath();ctx.ellipse(centerX,centerY+size*.32,size*.36,size*.09,0,0,Math.PI*2);ctx.fill();
 ctx.save();ctx.translate(centerX,centerY+bounce);
 if(e.hit>0)ctx.scale(1.12,.88);
 if(e.slow>0||meta.run.freeze>0){ctx.shadowColor='#9bdcff';ctx.shadowBlur=9;}
 if(e.poisonTime>0){ctx.shadowColor='#bd85ff';ctx.shadowBlur=9;}
 if(enemyArt.complete&&enemyArt.naturalWidth){
  const cw=enemyArt.naturalWidth/3,ch=enemyArt.naturalHeight/3;
  ctx.drawImage(enemyArt,e.type%3*cw,Math.floor(e.type/3)*ch,cw,ch,-size/2,-size/2,size,size);
 }else{
  ctx.fillStyle=enemyColors[e.type];ctx.beginPath();ctx.ellipse(0,5,size*.39,size*.31,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#162a37';ctx.fillRect(-size*.17,0,4,5);ctx.fillRect(size*.1,0,4,5);
 }
 ctx.restore();
 const bar=size*.62,bary=centerY-size*.41;
 if(e.hp<e.max||e.boss){
  ctx.fillStyle='#081729e8';ctx.fillRect(centerX-bar/2-1,bary-1,bar+2,5);
  ctx.fillStyle=e.boss?'#e5b17f':e.poisonTime>0?'#cf94ff':'#a5ebaa';ctx.fillRect(centerX-bar/2,bary,bar*Math.max(0,e.hp/e.max),3);
 }
}
function draw(dt){
 dimensions();ctx.clearRect(0,0,width,height);
 const r=meta.run;if(!r)return;
 if(r.freeze>0){ctx.fillStyle='#85c5ff18';ctx.fillRect(0,0,width,height);}
 if(r.fury>0){ctx.strokeStyle='#ffd58c88';ctx.lineWidth=5;ctx.strokeRect(1,1,width-2,height-2);}
 for(const e of r.enemies.slice().sort((a,b)=>a.y-b.y))drawEnemy(e,r.time);
 // Spirit companion stays at the ward and fires automatically.
 const petSize=47,px=width*.5,py=height*.96+Math.sin(r.time*3)*3;
 ctx.fillStyle='#a3ffea22';ctx.beginPath();ctx.ellipse(px,py+10,29,8,0,0,Math.PI*2);ctx.fill();
 if(enemyArt.complete&&enemyArt.naturalWidth){const cw=enemyArt.naturalWidth/3,ch=enemyArt.naturalHeight/3;ctx.drawImage(enemyArt,0,ch*2,cw,ch,px-petSize/2,py-petSize/2,petSize,petSize);}
 for(const line of lines){
  line.life-=dt;ctx.globalAlpha=Math.max(0,line.life/line.max);ctx.strokeStyle=line.color||'#ffe5a5';ctx.lineWidth=line.color?2:3;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=7;ctx.beginPath();
  const x=line.x*width,y=line.y*height,x2=line.x2*width,y2=line.y2*height;
  ctx.moveTo(x,y);ctx.lineTo(x+(x2-x)*.35+9,y+(y2-y)*.35);ctx.lineTo(x+(x2-x)*.65-9,y+(y2-y)*.65);ctx.lineTo(x2,y2);ctx.stroke();ctx.shadowBlur=0;
 }
 for(const ring of rings){
  ring.life-=dt;const progress=1-ring.life/ring.max;ctx.globalAlpha=Math.max(0,1-progress);ctx.strokeStyle=ring.color;ctx.lineWidth=3*(1-progress)+1;ctx.beginPath();ctx.ellipse(ring.x*width,ring.y*height,Math.max(1,ring.radius*width*progress),Math.max(1,ring.radius*width*progress*.65),0,0,Math.PI*2);ctx.stroke();
 }
 for(const p of particles){
  p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.15*dt;ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color;ctx.fillRect(p.x*width,p.y*height,p.size,p.size);
 }
 for(const t of texts){
  t.life-=dt;t.y-=dt*.055;ctx.globalAlpha=Math.min(1,Math.max(0,t.life/.25));ctx.textAlign='center';ctx.font=(t.big?'800 20px':'700 14px')+' system-ui';ctx.strokeStyle='#071a2fbb';ctx.lineWidth=3;ctx.strokeText(t.text,t.x*width,t.y*height-12);ctx.fillStyle=t.color;ctx.fillText(t.text,t.x*width,t.y*height-12);
 }
 ctx.globalAlpha=1;ctx.textAlign='start';particles=particles.filter(p=>p.life>0);texts=texts.filter(t=>t.life>0);rings=rings.filter(r=>r.life>0);lines=lines.filter(l=>l.life>0);
}
function settings(){
 const menu=el('div','menuButtons');
 for(const [id,label]of [['sound','Sound effects'],['music','Ambient music'],['haptics','Haptics'],['shake','Screen shake']]){
  menu.append(button(label+' · '+(meta.settings[id]?'on':'off'),()=>{
   meta.settings[id]=!meta.settings[id];save();settings();
  }));
 }
 menu.append(button('How to play',help),button('Export save',exportSave),button('Import save',()=>$('import').click()),button('Install on my phone',async()=>{
  if(installPrompt){await installPrompt.prompt();installPrompt=null;}else notify('Browser menu → Install app / Add to home screen. Load online once for offline play.');
 }),button('Reset Slimefall',()=>{
  const confirm=el('div','menuButtons');confirm.append(el('p','','This erases Slimefall progress on this device. Export a backup first if you want to keep it.'),button('Export backup',exportSave),button('Confirm reset',()=>{
   meta=E.fresh();particles=[];texts=[];rings=[];lines=[];save();showHome();
  }));dialog('Reset this save?',confirm);
 }));
 if(storageFailed)menu.prepend(el('p','notice','Device saving is unavailable or a previous save could not be read. Export a backup to keep this session.'));
 dialog('Settings',menu);
}
$('settings').onclick=()=>{sound('ui');settings();};
function help(){
 const body=el('div','menuButtons');body.append(
 el('p','','Tap or hold on slimes before they cross the bottom ward. Your companion automatically targets the lowest enemies, even when you are not tapping.'),
 el('p','','Every cleared wave offers three upgrade cards. Choose one. Powers stack for the current run. Rare combinations can clear entire groups with one tap.'),
 el('p','','Frost nova slows the whole swarm. Overcharge doubles your damage for six seconds. Both recharge automatically. Bosses arrive every fifth wave. Gold slimes carry bonus coins.'),
 el('p','','You keep all earned coins and crystals when defeated. Buy permanent upgrades on the home screen. Collect idle coins from the sanctuary. Saved runs can be continued later. Combat pauses while you are away.'),
 button('Got it',closeDialog,false,'primary'));
 dialog('Become the storm',body);
}
function exportSave(){
 E.accrue(meta);save();const url=URL.createObjectURL(new Blob([JSON.stringify(meta,null,2)],{type:'application/json'})),a=el('a');a.href=url;a.download='Slimefall-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Slimefall save exported.');
}
$('import').onchange=async event=>{
 const file=event.target.files[0];if(!file)return;
 try{
  if(file.size>3e6)throw Error('Too large');
  const imported=E.normalize(JSON.parse(await file.text()));
  const menu=el('div','menuButtons');menu.append(el('p','','Replace Slimefall with this imported save? Tideforge saves are separate.'),button('Export current backup',exportSave),button('Use imported save',()=>{
   meta=imported;E.accrue(meta);save();showHome();notify('Your Slimefall save is restored.');
  },false,'primary'));dialog('Restore a save',menu);
 }catch{notify('That file is not a valid Slimefall save.');}
 finally{event.target.value='';}
};
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){
  E.accrue(meta);save();paused=true;
  if(audio?.state==='running')audio.suspend();
 }else{
  E.accrue(meta);lastTime=performance.now();updateHome();save();
  if(screen==='combat'&&meta.run?.phase==='fight'){
   const menu=el('div','menuButtons');menu.append(el('p','','Combat paused while you were away. Your sanctuary kept growing.'),button('Resume battle',closeDialog,false,'primary'),button('Save & home',showHome));dialog('Welcome back',menu);
  }
 }
});
window.addEventListener('pagehide',()=>{E.accrue(meta);save();});
function frame(now){
 const dt=Math.max(0,Math.min(.05,(now-lastTime)/1000));lastTime=now;
 if(!document.hidden){
  hudClock+=dt;saveClock+=dt;musicClock+=dt;
  if(screen==='combat'&&!paused&&!$('dialog').open&&meta.run?.phase==='fight'){
   processEvents(E.step(meta,dt));
   if(heldPointer&&meta.run.phase==='fight'){
    heldPointer.clock-=dt;
    if(heldPointer.clock<=0){heldPointer.clock=.16;strikeAt(heldPointer.x,heldPointer.y);}
   }
   dirty=true;
  }
  if(screen==='combat')draw(paused?0:dt);
  if(hudClock>=.15){hudClock=0;updateHUD();}
  if(saveClock>=2){saveClock=0;E.accrue(meta);if(screen==='home')updateHome();if(dirty||screen==='home')save();}
  if(musicClock>=8){musicClock=0;ambient();}
 }
 requestAnimationFrame(frame);
}
showHome();requestAnimationFrame(frame);
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>notify('Offline cache unavailable. Your device save still works.'));
