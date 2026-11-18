'use strict';
const $=id=>document.getElementById(id), E=Slime, HV=Haven;
let havenGame=null,lastRuneCue=-1;
const KEY='slimefall-v1:'+location.pathname.replace(/index\.html$/,'');
let meta=E.fresh(),storageFailed=false;
try{const saved=localStorage.getItem(KEY);if(saved)meta=E.normalize(JSON.parse(saved));}catch{storageFailed=true;}
E.accrue(meta);
let screen='home',page='',paused=true,toastTimer,bannerTimer,dirty=false,lastTime=performance.now(),saveClock=0,hudClock=0,musicClock=0;
let heldPointer=null;
let lastPop=0,lastCrit=0,lastPower=0;
let specialFx=[];
let particles=[],texts=[],lines=[],rings=[],audio=null,installPrompt=null,previewCard=null;
const canvas=$('battleCanvas'),ctx=canvas.getContext('2d');
const enemyArt=new Image();enemyArt.src='./enemies.webp';
const enemyArt2=new Image();enemyArt2.src='./enemies2.webp';
const effectArt=new Image();effectArt.src='./effects.webp';
const enemyArt3=new Image();enemyArt3.src='./enemies3.webp';
enemyArt.onerror=()=>notify('Enemy art could not load. Keep enemies.webp beside index.html.');
const enemyColors=['#9df77a','#ffde69','#91deff','#df99ff','#ff9271','#ffdc80','#8cfff4','#ffe4a1','#d29bff','#ffabd6','#ddf4ff','#ffac76','#85f4ff','#c79875','#a9e58b','#cba5ff','#e27f9c','#deacff','#ffb064','#d5acff','#ffed9b','#ffa354','#ffb5ec','#ff8ca5','#b1ffe9','#ffdc83','#8cdfff','#dda1ff','#c8ffd4'];
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function button(text,action,disabled=false,cls=''){const n=el('button',cls,text);n.disabled=disabled;n.onclick=()=>{sound('ui');action();};return n;}
function icon(index){const n=el('span','skillIcon');n.dataset.icon=index;positionIcon(n,index);return n;}
function positionIcon(n,index){
 if(index>=28){index-=28;n.style.backgroundImage="url('./icons3.webp')";n.style.backgroundSize='400% 200%';n.style.backgroundPosition=(index%4/3*100)+'% '+(Math.floor(index/4)*100)+'%';}
 else if(index>=16){index-=16;n.style.backgroundImage="url('./icons2.webp')";n.style.backgroundSize='400% 300%';n.style.backgroundPosition=(index%4/3*100)+'% '+(Math.floor(index/4)/2*100)+'%';}
 else n.style.backgroundPosition=(index%4/3*100)+'% '+(Math.floor(index/4)/3*100)+'%';
}
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
  if(type==='pop'&&performance.now()-lastPop<65)return;if(type==='pop')lastPop=performance.now();
  if(type==='crit'&&performance.now()-lastCrit<90)return;if(type==='crit')lastCrit=performance.now();
  if(['portal','laser','thunder','shield','heal'].includes(type)){if(performance.now()-lastPower<85)return;lastPower=performance.now();}
  const notes={rune0:[523,.2,'sine',.035],rune1:[659,.2,'sine',.035],rune2:[784,.2,'sine',.035],rune3:[988,.2,'sine',.035],slash:[720,.18,'sawtooth',.035],parry:[1500,.26,'sine',.065],precision:[950,.12,'sine',.055],burst:[130,.65,'triangle',.07],pickup:[1200,.09,'sine',.035],portal:[90,.7,'sine',.09],laser:[1300,.24,'sawtooth',.025],thunder:[170,.35,'triangle',.07],revive:[680,.6,'sine',.08],shield:[1750,.09,'sine',.035],heal:[560,.25,'sine',.025],ui:[460,.05,'sine',.035],tap:[690,.045,'triangle',.04],pop:[300,.11,'sine',.07],crit:[1100,.09,'triangle',.065],hurt:[120,.19,'sawtooth',.04],coin:[1350,.12,'sine',.05],power:[380,.3,'triangle',.06],draft:[540,.32,'sine',.07],buy:[840,.2,'sine',.06],pet:[850,.045,'sine',.015],over:[170,.5,'triangle',.045]};
  const [freq,duration,wave,volume]=notes[type]||notes.ui;
  const o=audio.createOscillator(),g=audio.createGain(),now=audio.currentTime;o.type=wave;o.frequency.setValueAtTime(freq,now);o.frequency.exponentialRampToValueAtTime(type==='pop'?90:type==='portal'?220:type==='laser'?180:freq*1.5,now+duration);
  g.gain.setValueAtTime(.001,now);g.gain.linearRampToValueAtTime(volume,now+.006);g.gain.exponentialRampToValueAtTime(.001,now+duration);o.connect(g);g.connect(audio.destination);o.start(now);o.stop(now+duration+.01);
  if(['slash','burst'].includes(type)&&audio.createBuffer){
   const seconds=type==='slash'?.12:.35,buffer=audio.createBuffer(1,Math.ceil(audio.sampleRate*seconds),audio.sampleRate),data=buffer.getChannelData(0);
   for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);
   const source=audio.createBufferSource(),filter=audio.createBiquadFilter(),wash=audio.createGain();source.buffer=buffer;filter.type='lowpass';filter.frequency.value=type==='slash'?1800:420;
   wash.gain.setValueAtTime(.018,now);wash.gain.exponentialRampToValueAtTime(.001,now+seconds);source.connect(filter);filter.connect(wash);wash.connect(audio.destination);source.start(now);source.stop(now+seconds+.01);
  }
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
 screen=name;heldPointer=null;
 for(const id of ['home','combat','page'])$(id).classList.toggle('active',id===name);
 $('draftOverlay').hidden=!(name==='combat'&&meta.run?.phase==='draft');
}
function showHome(){havenGame=null;heldPointer=null;paused=true;$('dialog').close();showScreen('home');updateHome();updateHUD();save();}
function updateHome(){
 $('coins').textContent='● '+Math.floor(meta.coins);
 $('shards').textContent='✦ '+meta.shards;
 $('homeStats').textContent='BEST WAVE '+meta.best+'  ·  '+meta.kills+' SLIMES DEFEATED';
 const active=meta.run&&meta.run.phase!=='over';
 $('resume').hidden=!active;$('resume').textContent=active?'Continue · wave '+meta.run.wave:'Continue your run';
 $('play').firstChild.textContent=active?'NEW RUN ':'ENTER THE RIFT ';
 $('idleInfo').textContent=Math.floor(meta.idle.bank)+' coins ready · '+Math.round(E.idleRate(meta)*60)+'/min';
 $('claimIdle').disabled=meta.idle.bank<1;
 $('havenStatus').textContent='✧ '+meta.haven.dust+' stardust · Restore Moonhaven '+meta.haven.restored.length+'/3';
 $('villageScene').dataset.restored=String(meta.haven.restored.length);
 $('restorationMarks').replaceChildren(...meta.haven.restored.map(id=>{const b=HV.buildings.find(b=>b.id===id),n=havenIcon(b.icon);n.classList.add('restoredMark',id+'Mark');n.setAttribute('aria-label',b.name+' restored');return n;}));
}
function begin(){
 meta.run=E.start(meta);paused=false;particles=[];texts=[];rings=[];lines=[];specialFx=[];
 $('dialog').close();showScreen('combat');updateHUD();save();banner('WAVE 1 · THE GLADE');sound('power');if(!meta.activeGuideSeen)showActionGuide();
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
 updateHUD();if(!meta.activeGuideSeen)showActionGuide();
}
$('claimIdle').onclick=()=>{
 sound('coin');E.accrue(meta);const coins=E.claimIdle(meta);save();updateHome();notify(coins?'Sanctuary collected · +'+coins+' coins':'Your sanctuary is growing.');vibrate(12);
};
document.querySelectorAll('[data-page]').forEach(n=>n.onclick=()=>{sound('ui');openPage(n.dataset.page);});
$('back').onclick=showHome;
function openPage(name){
 havenGame=null;lastRuneCue=-1;page=name;paused=true;showScreen('page');$('pageTitle').textContent={workshop:'Ascension',collection:'Grimoire',milestones:'Milestones',bestiary:'Field guide',village:'Moonhaven',runes:'Runeforge',fishing:'Moonpool',stars:'Stargazer'}[name];renderPage();
}
function renderPage(){
 const root=$('pageContent');root.replaceChildren();
 if(['village','runes','fishing','stars'].includes(page))return renderHavenPage();
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
 if(page==='bestiary'){
  const descriptions=['Basic leaf slime.','Fast runner.','High-health ice armour.','Poison-themed jelly.','Aggressive scarlet slime.','Carries bonus coins.','Your automatic companion.','The original crowned boss.','The original void boss.','Pulses healing into nearby allies. Prioritize it.','Its first three hits are shielded.','Splits into two smaller jellies.','Blinks between lanes and edges forward.','Digs underground and resists direct damage briefly.','Reduces incoming damage to nearby allies.','Speeds up nearby slimes with storm pulses.','Regenerates health. Costs two hearts if it escapes.','Summons brood and healers.','Armour pulses and telegraphed forward dashes.','Rift pulses push its allies toward the ward.','A treasure-bearing mimic.','Tap its amber charge to detonate it safely and hurt nearby slimes.','Break it open, then catch the three bonus drops.','Watch for amber charges. A timed tap counters the lunge.','A slash instantly cracks its shell guard.','Tap the rune it releases to expose its core.','Catch the hourglass orb to slow the battlefield.','An agile boss with generous counter windows.','Releases interruptible rune casts and exposes a clock heart.'];
  const grid=el('div','collectionGrid');
  E.enemyNames.forEach((name,type)=>{const c=el('article','collectionItem frame');c.append(enemyPortrait(type),el('h3','',name),el('p','',descriptions[type]));grid.append(c);});root.append(grid);
 }

}
function enemyPortrait(type){
 const n=el('span','enemyPortrait'),index=type>=21?type-21:type>=9?type-9:type,cols=type>=9?4:3,rows=type>=21?2:3;
 n.style.backgroundImage=type>=21?"url('./enemies3.webp')":type>=9?"url('./enemies2.webp')":"url('./enemies.webp')";
 n.style.backgroundSize=(cols*100)+'% '+(rows*100)+'%';
 n.style.backgroundPosition=(index%cols/(cols-1)*100)+'% '+(Math.floor(index/cols)/(rows-1)*100)+'%';return n;
}
function updateHUD(){
 $('coins').textContent='● '+Math.floor(meta.coins);$('shards').textContent='✦ '+meta.shards;
 const r=meta.run;if(!r)return;
 $('waveLabel').textContent='Wave '+r.wave+(r.wave%5===0?' · BOSS':'');
 const area=E.realm(r.wave);$('arena').dataset.realm=String(area);
 $('realmLabel').textContent=E.realms[area]+' · '+E.conditions[r.modifier||'calm'].name+' ⓘ'+(r.wave>40?' · Ascension '+(r.wave-40):'');
 $('realmLabel').title=E.conditions[r.modifier||'calm'].desc;
 $('health').textContent='♥ '+Math.ceil(r.hp)+' / '+r.maxHp;
 $('battleStats').textContent=Math.round(E.damage(meta,r))+' DMG · '+r.kills+' KILLS';
 $('waveProgress').style.width=(r.target?r.resolved/r.target*100:0)+'%';
 $('combo').textContent=r.combo>=5?r.combo+'× COMBO':'';
 $('actionInfo').textContent=(r.slashCD>0?'SLASH '+r.slashCD.toFixed(1)+'s':'SWIPE TO SLASH')+' · '+(r.bounty.done?'BOUNTY COMPLETE':r.bounty.label+' '+r.bounty.progress+'/'+r.bounty.goal);
 $('burst').disabled=paused||r.phase!=='fight'||r.energy<100||!r.enemies.length;
 $('burstLabel').textContent=r.energy>=100?'UNLEASH':Math.floor(r.energy)+'%';
 $('burst').classList.toggle('charged',r.energy>=100);
 $('energyFill').style.width=r.energy+'%';
 for(const id of ['frost','fury']){
  const cooldown=r[id+'CD'];$(id).disabled=paused||r.phase!=='fight'||cooldown>0;
  $(id+'Label').textContent=cooldown>0?Math.ceil(cooldown)+'s':'READY';
 }
 $('petStatus').textContent='Swipe groups · tap cyan cores / amber counters · '+(1+(r.cards.familiar||0))+' target'+((r.cards.familiar||0)>0?'s':'')+' · '+((r.cards.haste||0)>0?'accelerated':'auto attacking');
}
function showDraft(){
 paused=false;$('draftOverlay').hidden=false;const r=meta.run;
 $('draftWave').textContent='WAVE '+r.wave+' CLEARED · +'+(8+r.wave*2)+' BASE COINS';
 $('draftCards').replaceChildren();
 for(const id of r.offers){
  const c=E.cards.find(c=>c.id===id),n=button('',()=>{
   if(E.choose(meta,id)){paused=false;sound(c.rarity==='legendary'?'power':'buy');vibrate(20);save();$('draftOverlay').hidden=true;updateHUD();banner('WAVE '+meta.run.wave);dirty=true;}
  },false,'upgradeCard '+c.rarity);
  const copy=el('div','cardCopy');copy.append(el('div','rarity',c.rarity),el('h3','',c.name),el('p','',c.desc),el('span','nextLevel','LEVEL '+Math.min(c.max,(r.cards[id]||0)+1)+(r.cards[id]?' · STACK THIS POWER':' · NEW POWER')));
  if((r.cards[id]||0)+1===3&&['chain','poison','blast'].includes(id))copy.append(el('span','nextLevel','✦ EVOLUTION · '+{chain:'Guaranteed chains',poison:'Poison death-bursts',blast:'Larger explosion radius'}[id]));
  n.append(icon(c.icon),copy);$('draftCards').append(n);
 }
 $('reroll').disabled=r.rerolls<=0;$('reroll').textContent=r.rerolls>0?'↻ Reroll · '+r.rerolls+' free':'Reroll used';
}
$('reroll').onclick=()=>{if(E.reroll(meta)){sound('draft');save();showDraft();}};
$('draftHome').onclick=showHome;
$('realmLabel').onclick=()=>{
 const r=meta.run;if(!r)return;
 const body=el('div','menuButtons'),info=E.conditions[r.modifier||'calm'];
 body.append(el('p','',info.name+' · '+info.desc),el('p','','Realms change every ten waves. Elite slimes appear after wave 40. Every fifth wave brings a boss.'),button('Inspect the field guide',()=>{$('dialog').close();openPage('bestiary');}),button('Back to the fight',closeDialog,false,'primary'));
 dialog(E.realms[E.realm(r.wave)],body);
};
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
for(const id of ['frost','fury','burst'])$(id).onclick=()=>{if(paused)return;processEvents(E.ability(meta,id));dirty=true;updateHUD();};
function summary(){
 paused=true;const r=meta.run,body=el('div','summary');
 body.append(el('div','eyebrow',r.wave>meta.best?'A NEW FRONTIER':'THE WARD HAS FALLEN'),el('div','big','Wave '+r.wave),el('p','',r.kills+' kills · '+r.earned+' coins kept · '+r.bestCombo+' best combo'));
 body.append(el('p','notice',r.actions.swipes+' slashes · '+r.actions.weak+' core breaks · '+r.actions.parries+' counters · '+r.actions.bursts+' Soul Bursts'));
 const menu=el('div','menuButtons');menu.append(button('Try another build',begin,false,'primary'),button('Ascend & upgrade',()=>{$('dialog').close();openPage('workshop');}),button('Return home',showHome));body.append(menu);dialog('The power stays with you',body);save();
}
function processEvents(events){
 for(const e of events){
  if(e.type==='slash'){
   sound('slash');vibrate(e.hits>=3?25:12);
   specialFx.push({kind:'slashPath',points:e.points,life:.32,max:.32});
   if(e.hits>1)banner(e.hits+' HIT CLEAVE');
  }
  if(e.type==='parry'||e.type==='precision'){
   sound(e.type);vibrate(e.type==='parry'?25:10);specialFx.push({kind:'parry',x:e.x,y:e.y,life:.55,max:.55});
   texts.push({x:e.x,y:e.y,text:e.type==='parry'?'PERFECT COUNTER':'CORE BREAK',color:e.type==='parry'?'#ffe395':'#b8ffff',life:1,max:1,big:true});
  }
  if(e.type==='soulBurst'){sound('burst');vibrate(35);banner('SOUL BURST');specialFx.push({kind:'nova',x:.5,y:.55,life:1,max:1});}
  if(e.type==='bounty'){sound('coin');banner('BOUNTY CLEARED · +'+e.coin+' COINS +1 CRYSTAL');specialFx.push({kind:'nova',x:.5,y:.4,life:.5,max:.5});}
  if(e.type==='pickup'){sound('pickup');addBurst(e.x,e.y,e.kind==='rune'?'#c9a6ff':'#ffdf87',7);texts.push({x:e.x,y:e.y,text:e.kind==='rune'?'RIFT CAUGHT':'+ENERGY',color:'#ffe9a7',life:.7,max:.7,big:false});}
  if(e.type==='bombPop'){sound('thunder');specialFx.push({kind:'collapse',x:e.x,y:e.y,life:.6,max:.6});}
  if(e.type==='runeCast')specialFx.push({kind:'summon',x:e.x,y:e.y,life:.4,max:.4});
  if(e.type==='damage'){
   if(e.kind==='crit')sound('crit');
   if(meta.settings.numbers)texts.push({x:e.x,y:e.y,text:e.kind==='crit'?'CRIT '+Math.ceil(e.amount):String(Math.max(1,Math.round(e.amount))),color:e.kind==='crit'?'#ffe184':e.kind==='poison'?'#d5a2ff':'#e9ffff',life:.7,max:.7,big:e.kind==='crit'});
  }
  if(e.type==='kill'){
   sound('pop');addBurst(e.x,e.y,enemyColors[e.color],e.boss?23:10);
   if(e.boss){sound('coin');banner('BOSS SHATTERED');vibrate(35);}
   dirty=true;
  }
  if(e.type==='shards')texts.push({x:e.x,y:e.y,text:'+'+e.amount+' CRYSTAL',color:'#e5b6ff',life:1.3,max:1.3,big:true});
  if(e.type==='bolt')lines.push({...e,life:.18,max:.18});
  if(e.type==='burst'){rings.push({...e,life:.35,max:.35});specialFx.push({kind:e.color==='#c38dff'?'poisonCloud':'fireBurst',x:e.x,y:e.y,life:.35,max:.35});}
  if(e.type==='pet'){sound('pet');lines.push({type:'bolt',x:.5,y:.99,x2:e.x,y2:e.y,color:'#91fbe7',life:.16,max:.16});}
  if(e.type==='meteor'){sound('power');lines.push({x:e.x-.2,y:-.2,x2:e.x,y2:e.y,color:'#ffbc79',life:.4,max:.4});addBurst(e.x,e.y,'#ffba70',22);rings.push({...e,radius:.32,color:'#ffac62',life:.5,max:.5});}
  if(e.type==='vortex'){sound('portal');vibrate(20);specialFx.push({kind:'portal',x:.5,y:.34,life:3,max:3});}
  if(e.type==='collapse'){sound('thunder');specialFx.push({kind:'collapse',x:e.x,y:e.y,life:.9,max:.9});addBurst(e.x,e.y,'#eac5ff',35);}
  if(e.type==='laser'){sound('laser');specialFx.push({kind:'laser',x:e.x,y:e.y,life:.45,max:.45});}
  if(e.type==='thunder'){sound('thunder');specialFx.push({kind:'thunder',x:e.x,y:e.y,life:.42,max:.42});}
  if(e.type==='orbit'||e.type==='glaive'){specialFx.push({kind:e.type,x:e.x,y:e.y,life:.7,max:.7});}
  if(e.type==='nova'||e.type==='revive'){
   sound(e.type==='revive'?'revive':'power');specialFx.push({kind:'nova',x:.5,y:.5,life:1,max:1});addBurst(.5,.5,'#ffe9ac',30);
   if(e.type==='revive')banner('PHOENIX PACT · REBORN');
  }
  if(e.type==='iceMine'){sound('shield');specialFx.push({kind:'ice',x:e.x,y:e.y,life:.6,max:.6});}
  if(e.type==='shield'){sound('shield');rings.push({x:e.x,y:e.y,radius:.08,color:'#b5ecff',life:.25,max:.25});}
  if(e.type==='heal'){sound('heal');texts.push({x:e.x,y:e.y,text:'+',color:'#aaffb4',life:.8,max:.8,big:true});}
  if(['split','blink','summon','enemyRift','enemyStorm','enemyDash','warning','thorns'].includes(e.type)){
   specialFx.push({kind:e.type,x:e.x,y:e.y,life:.65,max:.65});
  }
  if(e.type==='freeze'){specialFx.push({kind:'ice',x:.5,y:.8,life:.7,max:.7});sound('power');banner('FROST NOVA');vibrate(16);rings.push({x:.5,y:.95,radius:1.1,color:'#9ee9ff',life:.7,max:.7});}
  if(e.type==='fury'){sound('power');banner('OVERCHARGED · DOUBLE DAMAGE');vibrate(16);}
  if(e.type==='hurt'){
   sound('hurt');vibrate(25);
   if(meta.settings.shake&&meta.settings.effects!=='calm'){$('arena').classList.remove('shake');void $('arena').offsetWidth;$('arena').classList.add('shake');}
  }
  if(e.type==='combo'){sound('coin');banner(e.amount+'× COMBO · +3 COINS');}
  if(e.type==='boss'){sound('power');banner(E.enemyNames[e.enemyType??meta.run.enemies.find(e=>e.boss)?.type??7].toUpperCase());}
  if(e.type==='wave'){heldPointer=null;sound('draft');vibrate(20);save();showDraft();}
  if(e.type==='over'){sound('over');summary();}
 }
 const mode=meta.settings.effects;
 const important=['collapse','nova','laser','slashPath','parry'];
 if(mode==='calm')specialFx=specialFx.filter(f=>important.includes(f.kind));
 specialFx=[...specialFx.filter(f=>important.includes(f.kind)).slice(mode==='full'?-6:-3),...specialFx.filter(f=>!important.includes(f.kind)).slice(mode==='full'?-14:-4)];
 particles=particles.slice(mode==='full'?-190:mode==='calm'?-16:-65);
 texts=texts.slice(mode==='full'?-30:mode==='calm'?-3:-9);
 lines=lines.slice(mode==='full'?-35:mode==='calm'?-4:-12);rings=rings.slice(mode==='full'?-15:mode==='calm'?-2:-5);
}
function addBurst(x,y,color,count){
 count=Math.ceil(count*(meta.settings.effects==='full'?1:meta.settings.effects==='calm'?.12:.4));
 for(let i=0;i<count;i++){const angle=Math.random()*Math.PI*2,speed=.03+Math.random()*.16;
  particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,color,life:.25+Math.random()*.35,max:.6,size:2+Math.random()*3});}
}
let width=360,height=450,ratio=1;
function dimensions(){
 const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight),d=Math.min(2,window.devicePixelRatio||1);
 if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);}
 width=w;height=h;ratio=d;ctx.setTransform(d,0,0,d,0,0);
}
function strikeAt(x,y,precision=true){
 const radius=25+(meta.run.cards.magnet||0)*4;
 const pickup=meta.run.pickups.find(p=>Math.hypot((p.x-x)*width,(p.y-y)*height)<radius);
 if(pickup){processEvents(E.collect(meta,pickup.id));dirty=true;updateHUD();return;}
 const candidates=meta.run.enemies.map(n=>({n,d:Math.hypot((n.x-x)*width,(n.y-y)*height)})).filter(({n,d})=>d<(n.boss?60:42));
 if(!candidates.length){rings.push({x,y,radius:.08,color:'#b7dfdc',life:.2,max:.2});return;}
 candidates.sort((a,b)=>a.d-b.d);sound('tap');vibrate(5);processEvents(E.attack(meta,candidates[0].n.id,Math.random,false,precision?'tap':'hold'));dirty=true;updateHUD();
}
function aimPoint(event){const r=canvas.getBoundingClientRect();return {x:(event.clientX-r.left)/r.width,y:(event.clientY-r.top)/r.height};}
canvas.onpointerdown=e=>{
 if(paused||screen!=='combat'||meta.run?.phase!=='fight'||$('dialog').open||heldPointer)return;
 e.preventDefault();const p=aimPoint(e);heldPointer={...p,id:e.pointerId,clock:.16,points:[p],distance:0,swiping:false};
 if(canvas.setPointerCapture&&e.pointerId!==undefined)canvas.setPointerCapture(e.pointerId);
 strikeAt(p.x,p.y);
};
canvas.onpointermove=e=>{
 if(!heldPointer||heldPointer.id!==e.pointerId)return;
 const p=aimPoint(e),prev=heldPointer.points[heldPointer.points.length-1],distance=Math.hypot((p.x-prev.x)*width,(p.y-prev.y)*height);
 if(distance>4){heldPointer.distance+=distance;heldPointer.points.push(p);if(heldPointer.points.length>100)heldPointer.points.splice(1,1);}
 Object.assign(heldPointer,p);if(heldPointer.distance>28)heldPointer.swiping=true;
};
canvas.onpointerup=()=>{
 if(heldPointer?.swiping&&!paused&&meta.run?.phase==='fight'){
  processEvents(E.swipe(meta,heldPointer.points));dirty=true;updateHUD();
 }
 heldPointer=null;
};
canvas.onpointercancel=()=>heldPointer=null;
canvas.onlostpointercapture=()=>heldPointer=null;
function drawEnemy(e,time){
 const centerX=e.x*width,centerY=e.y*height,bounce=Math.sin(time*7+e.id)*2,size=(e.boss?Math.min(126,width*.31):Math.min(82,width*.2))*(e.mini?.65:1);
 ctx.fillStyle='#05172d66';ctx.beginPath();ctx.ellipse(centerX,centerY+size*.32,size*.36,size*.09,0,0,Math.PI*2);ctx.fill();
 ctx.save();ctx.translate(centerX,centerY+bounce);
 if(e.type===13&&e.clock%4<1)ctx.globalAlpha=.38;
 if(e.elite){ctx.shadowColor='#ffe19b';ctx.shadowBlur=12;}
 if(e.hit>0)ctx.scale(1.12,.88);
 if(e.slow>0||meta.run.freeze>0){ctx.shadowColor='#9bdcff';ctx.shadowBlur=9;}
 if(e.poisonTime>0){ctx.shadowColor='#bd85ff';ctx.shadowBlur=9;}
 const texture=e.type>=21?enemyArt3:e.type>=9?enemyArt2:enemyArt,columns=e.type>=9?4:3,rows=e.type>=21?2:3,index=e.type>=21?e.type-21:e.type>=9?e.type-9:e.type;
 if(texture.complete&&texture.naturalWidth){
  const cw=texture.naturalWidth/columns,ch=texture.naturalHeight/rows;
  ctx.drawImage(texture,index%columns*cw,Math.floor(index/columns)*ch,cw,ch,-size/2,-size/2,size,size);
 }else{
  ctx.fillStyle=enemyColors[e.type];ctx.beginPath();ctx.ellipse(0,5,size*.39,size*.31,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#162a37';ctx.fillRect(-size*.17,0,4,5);ctx.fillRect(size*.1,0,4,5);
 }
 ctx.restore();
 if(e.guard>0||e.type===14){ctx.strokeStyle='#b7f1c899';ctx.lineWidth=2;ctx.beginPath();ctx.arc(centerX,centerY,size*.48,0,Math.PI*2);ctx.stroke();}
 if(e.elite){ctx.fillStyle='#ffdf93';ctx.font='700 8px system-ui';ctx.textAlign='center';ctx.fillText('ELITE',centerX,centerY-size*.68);ctx.textAlign='start';}
 if(e.weakTime>0||e.parryTime>0){
  const parry=e.parryTime>0,glow=parry?'#ffc573':'#8cffff';
  ctx.save();ctx.strokeStyle=glow;ctx.shadowBlur=0;ctx.lineWidth=parry?3:2;
  ctx.beginPath();ctx.arc(centerX,centerY,size*.37+(Math.sin(time*10)*2),0,Math.PI*2);ctx.stroke();
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(centerX,centerY,4,0,Math.PI*2);ctx.fill();
  ctx.font='700 9px system-ui';ctx.textAlign='center';ctx.strokeStyle='#071c2a';ctx.lineWidth=3;ctx.strokeText(parry?'COUNTER':'CORE',centerX,centerY-size*.5);ctx.fillText(parry?'COUNTER':'CORE',centerX,centerY-size*.5);ctx.restore();
 }
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
 drawPortal(r,dt);
 for(const mine of r.mines||[]){ctx.save();ctx.translate(mine.x*width,mine.y*height);ctx.rotate(r.time);effectTexture(1,0,0,35,.65);ctx.restore();}
 for(const e of r.enemies.slice().sort((a,b)=>a.y-b.y))drawEnemy(e,r.time);
 // Spirit companion stays at the ward and fires automatically.
 const petSize=47,px=width*.5,py=height*.96+Math.sin(r.time*3)*3;
 ctx.fillStyle='#a3ffea22';ctx.beginPath();ctx.ellipse(px,py+10,29,8,0,0,Math.PI*2);ctx.fill();
 if(enemyArt.complete&&enemyArt.naturalWidth){const cw=enemyArt.naturalWidth/3,ch=enemyArt.naturalHeight/3;ctx.drawImage(enemyArt,0,ch*2,cw,ch,px-petSize/2,py-petSize/2,petSize,petSize);}
 for(const line of lines){
  line.life-=dt;ctx.globalAlpha=Math.max(0,line.life/line.max);ctx.strokeStyle=line.color||'#ffe5a5';ctx.lineWidth=line.color?1.7:2.5;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=7;ctx.beginPath();
  const x=line.x*width,y=line.y*height,x2=line.x2*width,y2=line.y2*height;
  ctx.moveTo(x,y);for(let j=1;j<8;j++){const t=j/8,wiggle=Math.sin(j*2.7+line.life*45)*(line.color?3:9);ctx.lineTo(x+(x2-x)*t+wiggle,y+(y2-y)*t);}ctx.lineTo(x2,y2);ctx.stroke();ctx.shadowBlur=0;
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
 drawPickups(r);
 if(heldPointer?.swiping)drawSlashPath(heldPointer.points,.8);
 drawSpecialEffects(dt,r);
 ctx.globalAlpha=1;ctx.textAlign='start';particles=particles.filter(p=>p.life>0);texts=texts.filter(t=>t.life>0);rings=rings.filter(r=>r.life>0);lines=lines.filter(l=>l.life>0);
}
function effectTexture(index,x,y,size,alpha=1){
 if(!effectArt.complete||!effectArt.naturalWidth)return;
 const cell=effectArt.naturalWidth/2,row=effectArt.naturalHeight/2;
 ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(effectArt,index%2*cell,Math.floor(index/2)*row,cell,row,x-size/2,y-size/2,size,size);ctx.restore();
}
function drawPortal(r,dt){
 if(!(r.vortexTime>0))return;
 const cx=width*.5,cy=height*.34,size=Math.min(width*.73,300),pulse=Math.min(1,(3-r.vortexTime)*4,r.vortexTime*3);
 ctx.save();ctx.translate(cx,cy);
 ctx.fillStyle='#020410';ctx.beginPath();ctx.ellipse(0,0,size*.2*pulse,size*.13*pulse,0,0,Math.PI*2);ctx.fill();
 ctx.scale(1,.72);ctx.rotate(r.time*.9);effectTexture(0,0,0,size*pulse,.96);ctx.restore();
 ctx.save();ctx.globalCompositeOperation='lighter';
 for(let i=0;i<(meta.settings.effects==='full'?42:meta.settings.effects==='calm'?8:20);i++){
  const phase=(r.time*.55+i*.073)%1,angle=i*2.399+r.time*1.6+phase*3,radius=size*.58*(1-phase);
  ctx.globalAlpha=Math.sin(phase*Math.PI)*pulse;ctx.fillStyle=i%3?'#b6a0ff':'#fff0b6';ctx.beginPath();ctx.arc(cx+Math.cos(angle)*radius,cy+Math.sin(angle)*radius*.65,1.5+(1-phase),0,Math.PI*2);ctx.fill();
 }
 ctx.restore();
}
function drawSpecialEffects(dt,r){
 for(const f of specialFx){
  f.life-=dt;const progress=1-f.life/f.max,fade=Math.max(0,Math.sin(progress*Math.PI)),x=f.x*width,y=f.y*height;
  ctx.save();ctx.globalAlpha=fade;
  if(f.kind==='slashPath'){drawSlashPath(f.points,fade);}
  else if(f.kind==='parry'){effectTexture(1,x,y,45+progress*95,fade);}
  else if(f.kind==='laser'){
   const gradient=ctx.createLinearGradient(x,0,x,height);gradient.addColorStop(0,'#b3a2ff00');gradient.addColorStop(.7,'#71edff');gradient.addColorStop(1,'#e5ffff');
   ctx.strokeStyle=gradient;ctx.shadowColor='#8beaff';ctx.shadowBlur=20;ctx.lineWidth=12*(1-progress)+2;ctx.beginPath();ctx.moveTo(x,height*.97);ctx.lineTo(x,0);ctx.stroke();
   ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.stroke();effectTexture(1,x,y,75,fade);
  }else if(f.kind==='thunder'){
   ctx.strokeStyle='#ffe6ac';ctx.lineWidth=3;ctx.shadowColor='#fff2b4';ctx.shadowBlur=15;ctx.beginPath();ctx.moveTo(x-20,0);
   for(let j=1;j<=10;j++)ctx.lineTo(x+Math.sin(j*5.1)*12,y*j/10);ctx.stroke();effectTexture(2,x,y,75,fade);
  }else if(f.kind==='orbit'||f.kind==='glaive'){
   ctx.translate(x,y);ctx.rotate(progress*Math.PI*3);ctx.strokeStyle=f.kind==='glaive'?'#ff9aab':'#d7bcff';ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=12;ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,35+progress*65,.1,Math.PI*1.65);ctx.stroke();
   ctx.fillStyle='#fff1ce';ctx.fillRect(30,0,14,5);
  }else if(f.kind==='collapse'||f.kind==='nova'){
   effectTexture(2,x,y,70+progress*width*1.1,fade);
   ctx.strokeStyle=f.kind==='nova'?'#b4ffe9':'#d1a6ff';ctx.lineWidth=5*(1-progress)+1;ctx.beginPath();ctx.arc(x,y,Math.max(1,progress*width*.8),0,Math.PI*2);ctx.stroke();
  }else if(f.kind==='poisonCloud'){effectTexture(3,x,y,40+progress*90,fade*.6);}
  else if(f.kind==='fireBurst'){effectTexture(2,x,y,40+progress*75,fade*.55);}
  else if(f.kind==='ice'){effectTexture(1,x,y,50+progress*120,fade);}
  else if(f.kind==='thorns'||f.kind==='split'){effectTexture(3,x,y,50+progress*100,fade*.7);}
  else if(f.kind==='enemyRift'||f.kind==='blink'||f.kind==='summon'){effectTexture(0,x,y,45+progress*70,fade*.75);}
  else if(f.kind==='warning'||f.kind==='enemyDash'){ctx.strokeStyle='#ff9d7d';ctx.lineWidth=2;ctx.setLineDash([5,6]);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,height*.93);ctx.stroke();}
  else if(f.kind==='enemyStorm'){effectTexture(1,x,y,45+progress*110,fade*.6);}
  ctx.restore();
 }
 specialFx=specialFx.filter(f=>f.life>0);
}
function drawSlashPath(points,alpha){
 if(!points||points.length<2)return;
 ctx.save();ctx.globalAlpha=alpha;ctx.lineCap='round';ctx.lineJoin='round';ctx.shadowColor='#a4f5ff';ctx.shadowBlur=14;
 ctx.strokeStyle='#6dceff';ctx.lineWidth=13;ctx.beginPath();ctx.moveTo(points[0].x*width,points[0].y*height);
 for(const p of points.slice(1))ctx.lineTo(p.x*width,p.y*height);ctx.stroke();
 ctx.strokeStyle='#f5ffff';ctx.lineWidth=4;ctx.stroke();ctx.restore();
}
function drawPickups(r){
 for(const p of r.pickups){
  const x=p.x*width,y=p.y*height,pulse=1+Math.sin(r.time*9+p.id)*.08,rad=(p.kind==='rune'?17:12)*pulse;
  ctx.save();ctx.globalAlpha=Math.min(1,p.life);ctx.translate(x,y);
  const color=p.kind==='rune'?'#d4acff':p.kind==='time'?'#9feaff':'#ffe29a';
  ctx.shadowColor=color;ctx.shadowBlur=10;ctx.strokeStyle=color;ctx.lineWidth=2;ctx.fillStyle='#102336dd';ctx.beginPath();ctx.arc(0,0,rad,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.rotate(r.time*(p.kind==='rune'?1:-.5));ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,-rad*.6);ctx.lineTo(rad*.45,0);ctx.lineTo(0,rad*.6);ctx.lineTo(-rad*.45,0);ctx.closePath();ctx.fill();
  ctx.restore();
 }
}
function showActionGuide(){
 const body=el('div','menuButtons');
 for(const [index,title,text]of [
  [28,'Swipe & release','Drag through a group and release to slash. It recharges in about a second.'],
  [29,'Strike the opening','Tap cyan cores for bonus damage. Tap amber COUNTER rings before they fade for a stronger timed counter.'],
  [31,'Catch the rewards','Tap bonus gems or drifting runes. You can also sweep them up with a slash.'],
  [32,'Unleash Soul Burst','Your actions fill the energy bar. Press Soul Burst at 100% to strike the whole swarm.']]){
  const row=el('div','row'),copy=el('div');copy.append(el('h3','',title),el('p','',text));row.append(icon(index),copy);body.append(row);
 }
 body.append(button('Let’s go',()=>{meta.activeGuideSeen=true;save();paused=false;closeDialog();},false,'primary'));
 dialog('Slash, counter, burst',body);
}
function settings(){
 const menu=el('div','menuButtons');
 for(const [id,label]of [['sound','Sound effects'],['music','Ambient music'],['haptics','Haptics'],['shake','Screen shake'],['numbers','Damage numbers']]){
  menu.append(button(label+' · '+(meta.settings[id]?'on':'off'),()=>{
   meta.settings[id]=!meta.settings[id];save();settings();
  }));
 }
 menu.append(button('Battle effects · '+meta.settings.effects,()=>{
  const modes=['full','balanced','calm'];meta.settings.effects=modes[(modes.indexOf(meta.settings.effects)+1)%modes.length];specialFx=[];particles=[];texts=[];rings=[];lines=[];save();settings();
 }));
 menu.append(button('Village activities',()=>{$('dialog').close();openPage('village');}),button('How to play',help),button('Export save',exportSave),button('Import save',()=>$('import').click()),button('Install on my phone',async()=>{
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
 el('p','','Swipe through groups, tap cyan cores or amber counter rings, and catch bonus drops. Tap or hold on slimes before they cross the bottom ward. Your companion automatically targets the lowest enemies, even when you are not tapping.'),
 el('p','','Every cleared wave offers three upgrade cards. Choose one. Powers stack for the current run. Rare combinations can clear entire groups with one tap.'),
 el('p','','Frost nova slows the whole swarm. Overcharge doubles your damage for six seconds. Both recharge automatically. Active attacks and catches fill Soul Burst. Press it when charged. Complete the short bounty shown above your powers for coins and a crystal. Bosses arrive every fifth wave. Gold slimes carry bonus coins.'),
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
   if(heldPointer&&!heldPointer.swiping&&meta.run.phase==='fight'){
    heldPointer.clock-=dt;
    if(heldPointer.clock<=0){heldPointer.clock=.16;strikeAt(heldPointer.x,heldPointer.y,false);}
   }
   dirty=true;
  }
  if(screen==='combat')draw(paused?0:dt);
  if(screen==='page'&&!$('dialog').open)advanceHaven(dt);
  if(hudClock>=.15){hudClock=0;updateHUD();}
  if(saveClock>=2){saveClock=0;E.accrue(meta);if(screen==='home')updateHome();if(dirty||screen==='home')save();}
  if(musicClock>=8){musicClock=0;ambient();}
 }
 requestAnimationFrame(frame);
}

function havenIcon(index){
 const n=el('span','havenIcon');n.style.backgroundPosition=(index%4/3*100)+'% '+(Math.floor(index/4)/2*100)+'%';return n;
}
document.querySelectorAll('[data-haven-icon]').forEach(n=>{const i=Number(n.dataset.havenIcon);n.style.backgroundPosition=(i%4/3*100)+'% '+(Math.floor(i/4)/2*100)+'%';});
function bankHaven(result,message){
 if(!result)return;sound('coin');save();updateHome();notify(message+' · +'+result.coins+' coins, +'+result.dust+' stardust');
}
function renderHavenPage(){
 const root=$('pageContent');root.replaceChildren();
 if(page==='village'){
  const intro=el('div','notice','Play a short activity between runs. Stardust restores the village. Each landmark adds 10% sanctuary income. Restoring all three grants a second free card reroll per wave.');
  root.append(intro);
  const activities=[['runes',0,'Runeforge','Remember glowing rune sequences. Short rounds, no time limit on your answer.'],['fishing',1,'Moonpool','Watch the float and reel at the bite. Three casts per peaceful trip.'],['stars',2,'Star map','Rotate crystal conduits to connect starlight. A puzzle with no timer.']];
  for(const [key,index,name,description]of activities){
   const c=el('article','frame activityCard');c.append(havenIcon(index),el('h3','',name),el('p','',description),button('Visit '+name,()=>openPage(key),false,'primary'));root.append(c);
  }
  root.append(el('h2','sectionTitle','Restore the village'),el('p','notice','✧ '+meta.haven.dust+' stardust available'));
  for(const b of HV.buildings){
   const done=meta.haven.restored.includes(b.id),c=el('article','frame shopItem');
   c.append(havenIcon(b.icon),el('h3','',b.name),el('p','',b.desc),button(done?'Restored':'Restore · '+b.cost+' stardust',()=>{
    E.accrue(meta);if(HV.restore(meta,b.id)){sound('buy');save();updateHome();renderHavenPage();notify(b.name+' restored');}
   },done||meta.haven.dust<b.cost,done?'':'primary'));root.append(c);
  }
  root.append(el('div','notice','Best rune sequence · '+meta.haven.best.runes+' | Best fishing trip · '+meta.haven.best.fish+'/3 | Best star-map score · '+meta.haven.best.stars));
  return;
 }
 if(page==='runes'){
  if(!havenGame||havenGame.kind!=='runes')havenGame=HV.memory();
  return renderRunes(root);
 }
 if(page==='fishing'){
  if(!havenGame||havenGame.kind!=='fish')havenGame=HV.fishing();
  return renderFishing(root);
 }
 if(page==='stars'){
  if(!havenGame||havenGame.kind!=='stars')havenGame=HV.puzzle();
  return renderStars(root);
 }
}
function renderRunes(root){
 const s=havenGame,info=el('div','frame activityHeader');
 info.append(havenIcon(0),el('h3','',s.phase==='watch'?'Watch the runes':s.phase==='input'?'Echo the pattern':s.phase==='won'?'Pattern restored':s.phase==='over'?'The forge is resting':'Awaken the forge'));
 info.append(el('p','',s.phase==='input'?'Tap the runes in the order they glowed. '+s.position+'/'+s.sequence.length:s.phase==='watch'?'Listen and watch. Your turn follows the last glow.':'Round '+s.round+' · '+s.tries+' attempts left · '+s.earned+' stardust earned'));
 root.append(info);
 const grid=el('div','runeGrid');
 for(let i=0;i<4;i++){
  const pad=button('',()=>{
   const result=HV.tapMemory(s,i,meta);
   if(result.type==='ignored')return;
   sound('rune'+i);
   if(result.type==='win')bankHaven(result,'Pattern complete');
   if(result.type==='mistake'){sound('hurt');notify(s.tries?'Try again. Replay the same pattern.':'Session complete. Earned rewards are kept.');}
   renderHavenPage();
  },s.phase!=='input','runePad'+(s.cue===i?' lit':''));
  pad.setAttribute('aria-label',['Moon rune','Crystal rune','Sun rune','Leaf rune'][i]);pad.append(havenIcon(8+i));grid.append(pad);
 }
 root.append(grid);
 const controls=el('div','miniActions');
 if(['ready','input'].includes(s.phase))controls.append(button(s.phase==='ready'?'Watch pattern':'Replay pattern',()=>{HV.replayMemory(s);lastRuneCue=-1;renderHavenPage();},false,'primary'));
 if(s.phase==='watch')controls.append(button('Watching…',()=>{},true));
 if(s.phase==='won')controls.append(button('Next pattern',()=>{HV.nextMemory(s);lastRuneCue=-1;renderHavenPage();},false,'primary'));
 if(s.phase==='over')controls.append(button('New session',()=>{havenGame=HV.memory();renderHavenPage();},false,'primary'));
 controls.append(button('Back to village',showHome));root.append(controls);
}
function renderFishing(root){
 const s=havenGame,c=el('div','frame activityHeader');
 const title=s.phase==='bite'?'A bite! Reel now':s.phase==='waiting'?'The moonpool is listening':s.phase==='result'?(s.last?.miss?'It slipped away':HV.fishNames[s.last.fish]):'Cast into the moonlight';
 c.append(havenIcon(1),el('h3','',title),el('p','',s.phase==='waiting'?'Wait for the float to flash.':s.phase==='bite'?'Tap REEL while the float glows.':'Cast '+s.attempt+'/3 · '+s.caught+' fish · '+s.earned+' stardust this trip'));
 root.append(c);
 const scene=el('div','pondScene');scene.append(el('div','waterRipple'),el('div','waterFloat'+(s.phase==='bite'?' bite':'')));
 if(s.phase==='result'&&!s.last?.miss){const catchTag=el('div','catchTag',s.last.perfect?'Perfect catch!':'Caught!');scene.append(catchTag);}
 root.append(scene);
 const actions=el('div','miniActions');
 if(s.phase==='waiting'||s.phase==='bite')actions.append(button('REEL',()=>{
  const result=HV.reel(s,meta);
  if(result.type==='catch')bankHaven(result,HV.fishNames[result.fish]+(result.perfect?' · perfect catch':''));
  else if(result.type==='early')notify('Too soon. Wait for the glowing float.');
  renderHavenPage();
 },false,s.phase==='bite'?'primary':''));
 else if(s.attempt<3)actions.append(button('Cast line',()=>{HV.cast(s);sound('pickup');renderHavenPage();},false,'primary'));
 else actions.append(button('Another trip',()=>{havenGame=HV.fishing();renderHavenPage();},false,'primary'));
 actions.append(button('Back to village',showHome));root.append(actions);
 root.append(el('div','fishAlbum','Moonpool journal · '+meta.haven.fishBook.map(i=>HV.fishNames[i]).join(' · ')+(meta.haven.fishBook.length?'':'No discoveries yet')));
}
function starTile(mask,lit){
 const color=lit?'#a8fff2':'#8799bc';let lines='';
 for(const [bit,x,y]of [[1,50,0],[2,100,50],[4,50,100],[8,0,50]])if(mask&bit)lines+='<path d="M50 50 L'+x+' '+y+'" />';
 return '<svg viewBox="0 0 100 100" aria-hidden="true"><g stroke="'+color+'" stroke-width="8" stroke-linecap="round" fill="none">'+lines+'</g><circle cx="50" cy="50" r="11" fill="'+color+'"/></svg>';
}
function renderStars(root){
 const s=havenGame,c=el('div','frame activityHeader');
 c.append(havenIcon(2),el('h3','',s.solved?'A new constellation':'Reconnect the starlight'),el('p','',s.solved?'Your rewards are already collected.':'Tap a tile to rotate it. Connect IN on the left to OUT on the right. No timer.'));
 root.append(c);
 const board=el('div','starBoard'),grid=el('div','starGrid');
 const input=el('span','starPort input','IN'),output=el('span','starPort output','OUT');
 input.style.top=(Math.floor(s.start/4)*25+12.5)+'%';output.style.top=(Math.floor(s.end/4)*25+12.5)+'%';
 for(let i=0;i<16;i++){
  const b=button('',()=>{
   const result=HV.turnTile(s,i,meta);sound('ui');if(result)bankHaven(result,'Constellation completed');renderHavenPage();
  },s.solved,'starTile'+(s.lit.includes(i)?' powered':''));
  b.setAttribute('aria-label','Rotate star tile '+(i+1));b.innerHTML=starTile(s.cells[i],s.lit.includes(i));grid.append(b);
 }
 board.append(grid,input,output);root.append(board,el('p','miniStats',s.moves+' moves · '+s.hints+' hints'));
 const actions=el('div','miniActions');
 if(s.solved)actions.append(button('Next constellation',()=>{havenGame=HV.puzzle();renderHavenPage();},false,'primary'));
 else actions.append(button('Hint · align one route tile',()=>{const result=HV.hint(s,meta);if(result)bankHaven(result,'Constellation completed');renderHavenPage();},false,'primary'));
 actions.append(button('Back to village',showHome));root.append(actions);
 root.append(el('p','notice','Hints lower the final reward. Every puzzle has a route. Glowing tiles are connected to the input.'));
}
function advanceHaven(dt){
 if(!havenGame)return;
 if(havenGame.kind==='runes'){
  const phase=havenGame.phase,cue=havenGame.cue;HV.stepMemory(havenGame,dt);
  if(cue!==havenGame.cue||phase!==havenGame.phase){
   if(havenGame.cue>=0&&havenGame.cue!==lastRuneCue)sound('rune'+havenGame.cue);
   lastRuneCue=havenGame.cue;renderHavenPage();
  }
 }
 if(havenGame.kind==='fish'){
  const phase=havenGame.phase,bite=HV.stepFish(havenGame,dt);
  if(bite)sound('coin');if(phase!==havenGame.phase)renderHavenPage();
 }
}
showHome();requestAnimationFrame(frame);
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>notify('Offline cache unavailable. Your device save still works.'));
