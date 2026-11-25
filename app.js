'use strict';
const $=id=>document.getElementById(id), E=Slime, HV=Haven, F=Moonforge, X=Expedition, T=SkillTree, G=Equipment, P=Progression;
let havenGame=null,lastRuneCue=-1,liveDetail=null;
const KEY='slimefall-v1:'+location.pathname.replace(/index\.html$/,'');
let meta=E.fresh(),storageFailed=false;
try{const saved=localStorage.getItem(KEY);if(saved)meta=E.normalize(JSON.parse(saved));}catch{storageFailed=true;}
E.accrue(meta);F.accrue(meta);X.addElapsed(meta);
let screen='home',page='',paused=true,toastTimer,bannerTimer,dirty=false,lastTime=performance.now(),saveClock=0,hudClock=0,musicClock=0;
let heldPointer=null,forgeSelected=-1,forgeTab='board',pilotOn=meta.settings.auto,autoPaused=false,catchingUp=false,catchupGeneration=0;
let lastPop=0,lastCrit=0,lastPower=0;
let specialFx=[],deathEchoes=[],renderFailures=0;
let gearFilter='all',gearSort='rarity',gearPage=0,selectedGear=null,gearViewRevision=-1;
let particles=[],texts=[],lines=[],rings=[],audio=null,installPrompt=null,previewCard=null;
const canvas=$('battleCanvas'),ctx=canvas.getContext('2d');
const heroArt=new Image();heroArt.src='./heroes.webp';
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
 if(typeof catchingUp!=='undefined'&&!document.hidden&&!catchingUp&&meta.expedition.carry===0&&!meta.expedition.trial)meta.expedition.lastAt=Date.now();
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
 liveDetail=null;heldPointer=null;paused=true;$('dialogTitle').textContent=title;$('dialogContent').replaceChildren(content);if(!$('dialog').open)$('dialog').showModal();
}
function closeDialog(){
 liveDetail=null;autoPaused=false;
 $('dialog').close();
 if(screen==='combat'&&meta.run?.phase==='fight')paused=false;
 if(meta.run?.phase==='over'&&screen==='combat')showHome();
}
$('closeDialog').onclick=()=>{sound('ui');closeDialog();};
$('dialog').addEventListener('cancel',e=>{e.preventDefault();closeDialog();});
function showScreen(name){
 $('mainNav').querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.main===(name==='page'?(['tree','talentmap'].includes(page)?'tree':page==='gear'?'gear':['village','runes','fishing','stars','tasks','expedition'].includes(page)?'home':'shop'):name)));
 screen=name;$('app').dataset.screen=name;heldPointer=null;
 if(name!=='combat')$('forgeDrawer').hidden=true;
 for(const id of ['home','combat','page'])$(id).classList.toggle('active',id===name);
 $('draftOverlay').hidden=!(name==='combat'&&meta.run?.phase==='draft');
}
function showHome(){autoPaused=false;$('forgeDrawer').hidden=true;havenGame=null;heldPointer=null;paused=true;$('dialog').close();showScreen('home');updateHome();updateHUD();save();}
function updateHome(){
 $('coins').textContent='● '+compact(meta.coins);
 $('shards').textContent='✦ '+compact(meta.shards);
 $('homeStats').textContent='WAVE '+(meta.run?.wave||1);
 const active=meta.run&&meta.run.phase!=='over';
 $('resume').hidden=!meta.run;$('play').hidden=!!meta.run;$('resume').textContent=meta.run?(meta.run.phase==='over'||meta.expedition.state==='blocked'?'RETRY · WAVE '+meta.run.wave:'PLAY'):'Continue your run';
 $('play').firstChild.textContent=active?'Start a new adventure ':'PLAY ';
 $('homeTreeInfo').textContent=compact(T.available(meta))+' skill points · '+Object.keys(meta.tree.nodes).length+' paths unlocked';renderHomeGoal();
 $('idleInfo').textContent=compact(meta.idle.bank)+' coins ready · '+compact(E.idleRate(meta)*60)+'/min';
 $('claimIdle').disabled=meta.idle.bank<1;
 $('havenStatus').textContent='✧ '+compact(meta.haven.dust)+' stardust · '+compact(meta.forge.orders)+' guild orders fulfilled';
 updateExpeditionEntry();
 updateGearBadges();
 $('villageScene').dataset.restored=String(meta.haven.restored.length);
 $('restorationMarks').replaceChildren(...meta.haven.restored.map(id=>{const b=HV.buildings.find(b=>b.id===id),n=havenIcon(b.icon);n.classList.add('restoredMark',id+'Mark');n.setAttribute('aria-label',b.name+' restored');return n;}));
}
function begin(){
 const offline=meta.expedition.enabled;meta.run=E.start(meta);meta.expedition.enabled=offline;pilotOn=meta.settings.auto;autoPaused=false;$('forgeDrawer').hidden=true;paused=false;particles=[];texts=[];rings=[];lines=[];specialFx=[];
 $('dialog').close();showScreen('combat');updateHUD();save();banner('WAVE 1 · THE GLADE');sound('power');if(!meta.activeGuideSeen&&!pilotOn)showActionGuide();
}
$('play').onclick=()=>{
 sound('ui');
 if(meta.run&&meta.run.phase!=='over'){
  const body=el('div','menuButtons');body.append(el('p','','Start a fresh run? You keep all coins, crystals and permanent upgrades. Current run cards will be lost.'),button('Start a new run',begin,false,'primary'),button('Keep my run',closeDialog));dialog('A new beginning?',body);
 }else begin();
};
$('resume').onclick=()=>{if(meta.run?.phase==='over'||meta.expedition.state==='blocked')openPage('expedition');else resumeRun();};
function resumeRun(){
 if(catchingUp)return;
 if(!meta.run||meta.run.phase==='over')return;
 if(meta.expedition.state==='blocked'){openPage('expedition');return;}
 X.takeControl(meta);$('dialog').close();showScreen('combat');paused=false;
 if(meta.run.phase==='draft')showDraft();
 updateHUD();if(!meta.activeGuideSeen&&!pilotOn)showActionGuide();
}
$('claimIdle').onclick=()=>{
 sound('coin');E.accrue(meta);const coins=E.claimIdle(meta);save();updateHome();notify(coins?'Sanctuary collected · +'+compact(coins)+' coins':'Your sanctuary is growing.');vibrate(12);
};
document.querySelectorAll('[data-page]').forEach(n=>n.onclick=()=>{sound('ui');openPage(n.dataset.page);});
$('back').onclick=showHome;
function openPage(name){
 havenGame=null;lastRuneCue=-1;page=name;if(name==='gear'){gearFilter='all';gearPage=0;meta.gear.unseen=0;selectedGear=null;save();}paused=true;showScreen('page');$('pageTitle').textContent={workshop:'Battle upgrades',collection:'Powers',milestones:'Rewards',bestiary:'Slime guide',village:'Mini-games',runes:'Memory game',fishing:'Fishing',stars:'Star puzzle',expedition:'Eternal expedition',forge:'Moonforge',research:'Research',tree:'Talents',talentmap:'Advanced map',shop:'Your slime',more:'More adventures',gear:'Equipment',tasks:'Little adventures'}[name];renderPage();
}
function renderPage(){
 const root=$('pageContent');root.className='';root.classList.toggle('treePage',page==='talentmap');root.dataset.view=page;root.replaceChildren();
 if(page==='talentmap')return renderTree(root);
 if(page==='tree')return renderTalents(root);
 if(page==='more')return renderMore(root);
 if(page==='workshop')return renderUpgrades(root);
 if(page==='gear')return renderGear(root);
 if(page==='tasks')return renderJourneys(root);
 if(page==='shop')return renderShop(root);
 if(page==='expedition')return renderExpedition(root);
 if(page==='forge')return renderForge(root);
 if(page==='research')return renderResearch(root);
 if(['village','runes','fishing','stars'].includes(page))return renderHavenPage();
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
   panel.append(el('h3','',m.name),el('p','',m.desc),el('div','levelTag',compact(m.reward.coins)+' coins · '+compact(m.reward.shards)+' crystals'),button(claimed?'Claimed':ready?'Claim reward':'In progress',()=>{
    if(E.claimMilestone(meta,m.id)){sound('coin');save();updateHome();renderPage();}
   },claimed||!ready,ready&&!claimed?'primary':''));
   panel.lastElementChild.dataset.claimMilestone=m.id;root.append(panel);
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
 $('coins').textContent='● '+compact(meta.coins);$('shards').textContent='✦ '+compact(meta.shards);
 updateAutoControls();updateGearBadges();if($('dialog').open&&liveDetail)liveDetail();
 if(screen==='page'&&page==='talentmap')treeRefresh();
 if(screen==='page'&&page==='tree')refreshTalents();
 if(screen==='page'&&page==='shop')refreshHero();
 if(screen==='page'&&page==='gear'){const s=heroStats(),n=document.querySelector('.equipmentStage .heroStats');if(n){n.firstChild.textContent='⚔ '+s.attack;n.lastChild.textContent='♥ '+s.hp;}}
 if(screen==='page'&&['more','tasks'].includes(page))refreshJourneys();
 if(screen==='page'&&page==='gear'&&gearViewRevision!==meta.gear.revision){const root=$('pageContent'),top=root.scrollTop;renderGear(root);root.scrollTop=top;updateGearBadges();}
 const r=meta.run;if(!r)return;
 $('pilotToggle').textContent='Auto · '+(pilotOn?'ON':'OFF');
 $('pilotToggle').classList.toggle('on',pilotOn);
 $('waveLabel').textContent='Wave '+r.wave+(r.wave%5===0?' · BOSS':'');
 const area=E.realm(r.wave);$('arena').dataset.realm=String(area);
 $('realmLabel').textContent=E.realms[area]+' · '+E.conditions[r.modifier||'calm'].name+' ⓘ'+(r.wave>40?' · Ascension '+(r.wave-40):'');
 $('realmLabel').title=E.conditions[r.modifier||'calm'].desc;
 $('health').textContent='♥ '+compact(Math.ceil(r.hp))+' / '+compact(r.maxHp);
 $('waveLoot').textContent=r.pendingGear?.length?'▣ '+r.pendingGear.length+' gear pending · clear the wave':'';
 $('battleStats').textContent=compact(E.power(meta,r))+' DMG · '+compact(r.kills)+' KILLS';
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
 if(pilotOn){autoChoose();return;}
 paused=false;$('draftOverlay').hidden=false;const r=meta.run;
 $('draftWave').textContent='WAVE '+r.wave+' CLEARED · +'+compact(8+r.wave*2)+' BASE COINS';
 $('draftCards').replaceChildren();
 for(const id of r.offers){
  const c=E.cards.find(c=>c.id===id),n=button('',()=>{
   if(E.choose(meta,id)){paused=false;sound(c.rarity==='legendary'?'power':'buy');vibrate(20);save();$('draftOverlay').hidden=true;updateHUD();banner('WAVE '+meta.run.wave);dirty=true;}
  },false,'upgradeCard '+c.rarity);
  const copy=el('div','cardCopy');copy.append(el('div','rarity',c.rarity),el('h3','',c.name),el('p','',c.desc),el('span','nextLevel','LEVEL '+compact(Math.min(c.max,(r.cards[id]||0)+1))+(r.cards[id]?' · STACK THIS POWER':' · NEW POWER')));
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
 body.append(el('p','',compact(E.power(meta,r))+' damage · '+compact(r.kills)+' kills · '+compact(r.bestCombo)+' best combo'));
 const list=el('div','buildList');
 for(const [id,n]of Object.entries(r.cards))if(n){const c=E.cards.find(c=>c.id===id);list.append(el('span','buildChip',c.name+' ×'+compact(n)));}
 if(!list.children.length)body.append(el('p','','Clear a wave to choose your first evolution.'));
 body.append(list,el('p','notice','Combos: Toxic bloom + Living lightning spreads poison. Permafrost + Wildfire doubles splash against slowed slimes. Prism reactor makes lightning stronger. Companion volleys inherit your card powers.'));
 dialog('Your evolving build',body);
}
$('buildInfo').onclick=showBuild;
$('pause').onclick=()=>{
 autoPaused=true;
 const body=el('div','menuButtons');body.append(button('Resume',closeDialog,false,'primary'),button('Inspect my cards',showBuild),button('Save & home',showHome));dialog('Take a breath',body);sound('ui');
};
for(const id of ['frost','fury','burst'])$(id).onclick=()=>{if(paused)return;processEvents(E.ability(meta,id));dirty=true;updateHUD();};
function summary(){
 paused=true;const r=meta.run,body=el('div','summary');
 body.append(el('div','eyebrow',r.wave>meta.best?'A NEW FRONTIER':'THE WARD HAS FALLEN'),el('div','big','Wave '+r.wave),el('p','',compact(r.kills)+' kills · '+compact(r.earned)+' coins kept · '+compact(r.bestCombo)+' best combo'));
 $('forgeDrawer').hidden=true;
 body.append(el('p','notice',r.actions.swipes+' slashes · '+r.actions.weak+' core breaks · '+r.actions.parries+' counters · '+r.actions.bursts+' Soul Bursts'));
 const menu=el('div','menuButtons');menu.append(button('Retry wave '+r.wave,()=>{X.retryFallen(meta,E);save();resumeRun();},false,'primary'),button('Try another build',begin),button('Ascend & upgrade',()=>{$('dialog').close();openPage('workshop');}),button('Return home',showHome));body.append(menu);dialog('The power stays with you',body);save();
}
function processEvents(events){
 if(screen!=='combat'||$('dialog').open){for(const e of events){if(e.type==='wave')resolveWave(e.wave,e.gear);if(e.type==='over'){save();updateAutoControls();updateExpeditionEntry();}}return;}
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
  if(e.type==='bounty'){sound('coin');banner('BOUNTY CLEARED · +'+compact(e.coin)+' COINS +1 CRYSTAL');specialFx.push({kind:'nova',x:.5,y:.4,life:.5,max:.5});}
  if(e.type==='pickup'){sound('pickup');addBurst(e.x,e.y,e.kind==='rune'?'#c9a6ff':'#ffdf87',7);texts.push({x:e.x,y:e.y,text:e.kind==='rune'?'RIFT CAUGHT':'+ENERGY',color:'#ffe9a7',life:.7,max:.7,big:false});}
  if(e.type==='bombPop'){sound('thunder');specialFx.push({kind:'collapse',x:e.x,y:e.y,life:.6,max:.6});}
  if(e.type==='runeCast')specialFx.push({kind:'summon',x:e.x,y:e.y,life:.4,max:.4});
  if(e.type==='damage'){
   if(e.kind==='crit')sound('crit');
   if(meta.settings.numbers)texts.push({x:e.x,y:e.y,text:e.kind==='crit'?'CRIT '+compact(E.hitPower(meta,meta.run.scaleExp?e.amount:Math.ceil(e.amount))):compact(E.hitPower(meta,meta.run.scaleExp?e.amount:Math.max(1,Math.round(e.amount)))),color:e.kind==='crit'?'#ffe184':e.kind==='poison'?'#d5a2ff':'#e9ffff',life:.7,max:.7,big:e.kind==='crit'});
  }
  if(e.type==='strikeFlash')specialFx.push({kind:'slashPath',points:[{x:e.x-.045,y:e.y+.025},{x:e.x+.045,y:e.y-.025}],life:.16,max:.16});
  if(e.type==='gearDrop'){sound('coin');if(e.item.rarity>=2)banner(G.rarities[e.item.rarity].name.toUpperCase()+' GEAR · WIN TO KEEP');}
  if(e.type==='kill'){
   deathEchoes.push({type:e.color,id:0,x:e.x,y:e.y,boss:e.boss,mini:false,hp:1,max:1,clock:2,life:.24,hit:0,slow:0,guard:0,weakTime:0,parryTime:0,poisonTime:0});deathEchoes=deathEchoes.slice(-24);
   sound('pop');addBurst(e.x,e.y,enemyColors[e.color],e.boss?23:10);
   if(e.boss){sound('coin');banner('BOSS SHATTERED');vibrate(35);}
   dirty=true;
  }
  if(e.type==='shards')texts.push({x:e.x,y:e.y,text:'+'+compact(e.amount)+' CRYSTAL',color:'#e5b6ff',life:1.3,max:1.3,big:true});
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
  if(e.type==='combo'){sound('coin');banner(compact(e.amount)+'× COMBO · +3 COINS');}
  if(e.type==='boss'){sound('power');banner(E.enemyNames[e.enemyType??meta.run.enemies.find(e=>e.boss)?.type??7].toUpperCase());}
  if(e.type==='wave'){resolveWave(e.wave,e.gear);}
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
 const rect=canvas.getBoundingClientRect(),arena=$('arena').getBoundingClientRect();const w=Math.max(1,rect.width||canvas.clientWidth||arena.width||360),h=Math.max(1,rect.height||canvas.clientHeight||arena.height||450),d=Math.min(2,window.devicePixelRatio||1);
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
 dimensions();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,width,height);
 const r=meta.run;if(!r)return;
 if(r.freeze>0){ctx.fillStyle='#85c5ff18';ctx.fillRect(0,0,width,height);}
 if(r.fury>0){ctx.strokeStyle='#ffd58c88';ctx.lineWidth=5;ctx.strokeRect(1,1,width-2,height-2);}
 drawPortal(r,dt);
 for(const mine of r.mines||[]){ctx.save();ctx.translate(mine.x*width,mine.y*height);ctx.rotate(r.time);effectTexture(1,0,0,35,.65);ctx.restore();}
 for(const e of deathEchoes){e.life-=dt;ctx.save();ctx.globalAlpha=Math.max(0,e.life/.24)*.65;drawEnemy(e,r.time);ctx.restore();}deathEchoes=deathEchoes.filter(e=>e.life>0);
 for(const e of r.enemies.slice().sort((a,b)=>a.y-b.y))drawEnemy(e,r.time);
 // Spirit companion stays at the ward and fires automatically.
 const petSize=47,px=width*.5,py=height-30+Math.sin(r.time*3)*3;
 ctx.fillStyle='#a3ffea22';ctx.beginPath();ctx.ellipse(px,py+10,29,8,0,0,Math.PI*2);ctx.fill();
 if(heroArt.complete&&heroArt.naturalWidth){const cw=heroArt.naturalWidth/3;ctx.drawImage(heroArt,meta.hero.skin*cw,0,cw,heroArt.naturalHeight,px-petSize/2,py-petSize/2,petSize,petSize);}else if(enemyArt.complete&&enemyArt.naturalWidth){const cw=enemyArt.naturalWidth/3,ch=enemyArt.naturalHeight/3;ctx.drawImage(enemyArt,0,ch*2,cw,ch,px-petSize/2,py-petSize/2,petSize,petSize);}else drawFallbackSlime(px,py,21,'#7bdfdf');
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
 const cx=width*.5,cy=height*.34,size=Math.min(width*.73,300),pulse=Math.max(0,Math.min(1,r.vortexTime*3));
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
   meta=E.fresh();pilotOn=meta.settings.auto;autoPaused=false;particles=[];texts=[];rings=[];lines=[];save();showHome();
  }));dialog('Reset this save?',confirm);
 }));
 if(storageFailed)menu.prepend(el('p','notice','Device saving is unavailable or a previous save could not be read. Export a backup to keep this session.'));
 menu.prepend(button('Start a new adventure',()=>$('play').click()),button('Idle earnings',showIdleRewards),button('Large number guide',()=>{const body=el('div','menuButtons');body.append(el('p','','K, M, B, T, Qa, Qi and the usual suffixes continue through Vg. After Vg, numbers use aa, ab, ac and onward. These letter suffixes keep growing; the game does not switch to scientific notation.'),button('Back',settings));dialog('Big numbers, simple labels',body);}),el('p','notice','Slime Heroes · v8.0.0 · Gear collected after victory'),button('Check for game update',checkUpdate));
 dialog('Settings',menu);
}
$('settings').onclick=()=>{sound('ui');settings();};
function help(){
 const body=el('div','menuButtons');body.append(
 el('p','','Swipe through groups, tap cyan cores or amber counter rings, and catch bonus drops. Tap or hold on slimes before they cross the bottom ward. Your companion automatically targets the lowest enemies, even when you are not tapping.'),
 el('p','','Every cleared wave offers three upgrade cards. Choose one. Powers stack for the current run. Rare combinations can clear entire groups with one tap.'),
 el('p','','Frost nova slows the whole swarm. Overcharge doubles your damage for six seconds. Both recharge automatically. Active attacks and catches fill Soul Burst. Press it when charged. Complete the short bounty shown above your powers for coins and a crystal. Bosses arrive every fifth wave. Gold slimes carry bonus coins.'),
 el('p','','You keep all earned coins and crystals when defeated. Buy permanent upgrades on the home screen. Collect idle coins from the sanctuary. Saved runs can be continued later. Offline waves use your current build and stop at the first defeat. Sanctuary coins and forge sparks have no time limit. Open the expedition for a report or to retry.'),
 button('Got it',closeDialog,false,'primary'));
 dialog('Become the storm',body);
}
function exportSave(){
 E.accrue(meta);save();const url=URL.createObjectURL(new Blob([JSON.stringify(meta,null,2)],{type:'application/json'})),a=el('a');a.href=url;a.download='Slimefall-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Slimefall save exported.');
}
$('import').onchange=async event=>{
 const file=event.target.files[0];if(!file)return;
 try{
  if(file.size>12e6)throw Error('Too large');
  const imported=E.normalize(JSON.parse(await file.text()));
  const menu=el('div','menuButtons');menu.append(el('p','','Replace Slimefall with this imported save? Tideforge saves are separate.'),button('Export current backup',exportSave),button('Use imported save',()=>{
   meta=imported;pilotOn=meta.settings.auto;autoPaused=false;E.accrue(meta);F.accrue(meta);X.addElapsed(meta);save();showHome();catchUp();notify('Your Slimefall save is restored.');
  },false,'primary'));dialog('Restore a save',menu);
 }catch{notify('That file is not a valid Slimefall save.');}
 finally{event.target.value='';}
};
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});
function depart(){
 if(catchingUp){catchingUp=false;catchupGeneration++;}
 E.accrue(meta);F.accrue(meta);meta.expedition.lastAt=Date.now();save();paused=true;
 if(audio?.state==='running')audio.suspend();
}
document.addEventListener('visibilitychange',()=>{
 if(document.hidden)depart();
 else{E.accrue(meta);F.accrue(meta);X.addElapsed(meta);lastTime=performance.now();catchUp();}
});
window.addEventListener('pagehide',()=>{if(!document.hidden)depart();});
function frame(now){
 requestAnimationFrame(frame);
 const dt=Math.max(0,Math.min(.05,(now-lastTime)/1000));lastTime=now;
 if(!document.hidden&&!catchingUp){
  hudClock+=dt;saveClock+=dt;musicClock+=dt;
  const autoRunning=pilotOn&&!autoPaused&&meta.expedition.state!=='blocked';
  if(autoRunning&&meta.run?.phase==='draft')autoChoose();
  if(meta.run?.phase==='fight'&&meta.expedition.state!=='blocked'&&(autoRunning||(screen==='combat'&&!paused&&!$('dialog').open))){
   if(autoRunning)processEvents(X.pilot(meta,E,dt));
   if(meta.run.phase==='fight'){const events=E.step(meta,dt);if(autoRunning)events.push(...X.collectDrops(meta,E));processEvents(events);}
   if(screen==='combat'&&!paused&&!$('dialog').open&&heldPointer&&!heldPointer.swiping&&meta.run.phase==='fight'){
    heldPointer.clock-=dt;
    if(heldPointer.clock<=0){heldPointer.clock=.16;strikeAt(heldPointer.x,heldPointer.y,false);}
   }
   dirty=true;
  }
  if(screen==='combat')safeDraw((paused&&!autoRunning)?0:dt);
  if(screen==='page'&&!$('dialog').open)advanceHaven(dt);
  if(hudClock>=.15){hudClock=0;updateHUD();}
  if(saveClock>=2){saveClock=0;E.accrue(meta);const beforeSparks=meta.forge.sparks;F.accrue(meta);if(beforeSparks!==meta.forge.sparks){if(!$('forgeDrawer').hidden)renderForge($('drawerContent'));else if(screen==='page'&&page==='forge')renderForge($('pageContent'));}meta.expedition.lastAt=Date.now();if(screen==='home')updateHome();if(screen==='page'&&page==='expedition')renderPage();for(const n of document.querySelectorAll('.forgeBalance'))n.textContent=compact(meta.forge.sparks)+' sparks · ✧ '+compact(meta.haven.dust)+' dust';save();}
  if(musicClock>=8){musicClock=0;ambient();}
 }
}

function havenIcon(index){
 const n=el('span','havenIcon');n.style.backgroundPosition=(index%4/3*100)+'% '+(Math.floor(index/4)/2*100)+'%';return n;
}
document.querySelectorAll('[data-haven-icon]').forEach(n=>{const i=Number(n.dataset.havenIcon);n.style.backgroundPosition=(i%4/3*100)+'% '+(Math.floor(i/4)/2*100)+'%';});
function bankHaven(result,message){
 if(!result)return;sound('coin');save();updateHome();notify(message+' · +'+compact(result.coins)+' coins, +'+compact(result.dust)+' stardust');
}
function renderHavenPage(){
 const root=$('pageContent');root.replaceChildren();
 if(page==='village'){
  const intro=el('div','notice','Pick a game to play while Auto handles your battle. Little adventure goals give skill points, and every game earns coins and stardust.');
  root.append(intro);
  const activities=[['runes',0,'Memory game','Remember glowing rune sequences. Short rounds, no time limit on your answer.'],['fishing',1,'Fishing','Watch the float and reel at the bite. Three casts per peaceful trip.'],['stars',2,'Star puzzle','Rotate crystal conduits to connect starlight. A puzzle with no timer.']];
  for(const [key,index,name,description]of activities){
   const c=el('article','frame activityCard');c.append(havenIcon(index),el('h3','',name),el('p','',description),button('Visit '+name,()=>openPage(key),false,'primary'));root.append(c);
  }
  root.append(el('h2','sectionTitle','Restore the village'),el('p','notice','✧ '+compact(meta.haven.dust)+' stardust available'));
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
 info.append(el('p','',s.phase==='input'?'Tap the runes in the order they glowed. '+s.position+'/'+s.sequence.length:s.phase==='watch'?'Listen and watch. Your turn follows the last glow.':'Round '+s.round+' · '+s.tries+' attempts left · '+compact(s.earned)+' stardust earned'));
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
 c.append(havenIcon(1),el('h3','',title),el('p','',s.phase==='waiting'?'Wait for the float to flash.':s.phase==='bite'?'Tap REEL while the float glows.':'Cast '+s.attempt+'/3 · '+s.caught+' fish · '+compact(s.earned)+' stardust this trip'));
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
showHome();requestAnimationFrame(frame);catchUp();
if('serviceWorker'in navigator){let controlled=!!navigator.serviceWorker.controller;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(controlled){save();location.reload();}controlled=true;});}
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(reg=>{reg.update().catch(()=>{});}).catch(()=>notify('Offline cache unavailable. Your device save still works.'));

function compact(n){return GameNumbers.compact(n);}
function expIcon(i){const n=el('span','expIcon');n.style.backgroundPosition=(i%4/3*100)+'% '+Math.floor(i/4)*100+'%';return n;}
document.querySelectorAll('[data-exp-icon]').forEach(n=>{const i=+n.dataset.expIcon;n.style.backgroundPosition=(i%4/3*100)+'% '+Math.floor(i/4)*100+'%';});
function updateExpeditionEntry(){
 const x=meta.expedition;
 $('expeditionInfo').textContent=x.state==='blocked'?'Stopped at wave '+x.blockedWave+' · Upgrade & retry':meta.run?.phase==='over'?'Stopped at wave '+meta.run.wave+' · Upgrade & retry':!x.enabled?'Offline waves paused':meta.run&&meta.run.phase!=='over'?'Wave '+meta.run.wave+' · Leaves with your current build':'Start a run to send your spirit';
 $('expeditionStatus').classList.toggle('blocked',x.state==='blocked'||meta.run?.phase==='over');
}
$('expeditionStatus').onclick=()=>openPage('expedition');
$('openForge').onclick=()=>{forgeTab='board';openPage('forge');};
$('openResearch').onclick=()=>openPage('research');
$('battleForge').onclick=()=>openBattleForge('board');
$('battleOrders').onclick=()=>openBattleForge('orders');
$('closeForge').onclick=()=>{$('forgeDrawer').hidden=true;forgeSelected=-1;};
$('pilotToggle').onclick=()=>setAuto(!pilotOn);
$('autoToggle').onclick=()=>{setAuto(!pilotOn);if(pilotOn&&!meta.run)begin();};
$('autoStatus').onclick=()=>{if(meta.run?.phase==='over'||meta.expedition.state==='blocked')openPage('expedition');else resumeRun();};
function openBattleForge(tab){
 if(!meta.run||meta.run.phase!=='fight')return;
 forgeTab=tab;setAuto(true,false);forgeSelected=-1;$('forgeDrawer').hidden=false;renderForge($('drawerContent'));updateHUD();
}
function renderExpedition(root){
 const x=meta.expedition,r=meta.run,report=x.report;
 const stopped=x.state==='blocked'||r?.phase==='over';
 const card=el('div','frame activityHeader');card.append(expIcon(0),el('h3','',stopped?'The spirit found its limit':'Your spirit keeps going'),el('p','',stopped?'Defeated at wave '+(x.blockedWave||r.wave)+'. Auto stays stopped until you retry.':x.enabled?'Offline waves are ON. Close the game whenever you want.':'Offline waves are paused. Sanctuary income and forge sparks still grow.'));root.append(card);
 root.append(el('p','notice','Uses this run’s cards, companion, damage, enemy movement, healing, shields and boss rules. The pilot attacks and casts powers; your chosen policy picks cards. Failed-wave loot is rolled back. Completed-wave rewards are kept. No offline time limit.'));
 const stats=el('div','reportGrid');for(const [value,label]of [[report.cleared,'waves cleared'],[compact(report.coins),'coins banked'],[compact(report.shards),'crystals banked'],[compact(report.kills),'slimes defeated'],[report.items||0,'gear drops won']]){const n=el('div');n.append(el('b','',String(value)),el('small','',label));stats.append(n);}root.append(stats);
 if(report.from)root.append(el('p','miniStats','Last report: waves '+report.from+'–'+report.to+(report.failed?' · stopped at '+report.failed:'')));
 const actions=el('div','miniActions');
 if(x.state==='blocked')actions.append(button('Retry wave '+x.blockedWave+' · full ward',()=>{if(X.retry(meta)){save();resumeRun();notify('Retry armed. Play now or leave the spirit to try again.');}},false,'primary'));
 else if(r&&r.phase!=='over')actions.append(button('Fight wave '+r.wave,()=>{X.takeControl(meta);resumeRun();},false,'primary'));
 else if(r?.phase==='over')actions.append(button('Retry fallen wave '+r.wave,()=>{X.retryFallen(meta,E);save();resumeRun();},false,'primary'));
 else actions.append(button('Start a run',begin,false,'primary'));
 actions.append(button('Offline waves · '+(x.enabled?'ON':'OFF'),()=>{X.takeControl(meta);setAuto(!x.enabled,false);x.lastAt=Date.now();save();renderPage();}),button('Evolution policy · '+x.style,()=>{const options=['balanced','power','sustain'];x.style=options[(options.indexOf(x.style)+1)%3];save();renderPage();}),button('Upgrade with stardust',()=>openPage('research')),button('Permanent ascension upgrades',()=>openPage('workshop')));root.append(actions);
 root.append(el('p','notice','Balanced prioritizes damage and heals when needed. Power favors damage scaling. Sustain values healing and revivals. Reports accumulate until dismissed. Switching to manual play keeps any partial-wave loot and progress.'));
 if(report.cleared||report.failed)root.append(button('Dismiss this report',()=>{X.resetReport(meta);save();renderPage();}));
}
function renderForge(root){
 root.replaceChildren();const f=meta.forge,inBattle=screen==='combat';
 const tabs=el('div','forgeTabs');for(const [id,label]of [['board','Merge runes'],['orders','Guild orders'],['research','Research']])tabs.append(button(label,()=>{forgeTab=id;forgeSelected=-1;renderForge(root);},false,forgeTab===id?'selected':''));root.append(tabs);
 if(forgeTab==='research'){const content=el('div','researchContent');root.append(content);return renderResearch(content);}
 const line=el('div','forgeWallet');line.append(expIcon(1),el('span','forgeBalance',compact(f.sparks)+' sparks · ✧ '+compact(meta.haven.dust)+' dust'));root.append(line);
 if(forgeTab==='orders'){
  root.append(el('p','notice','Merge the requested rank, then deliver it. Orders grow into rarer runes as your guild reputation rises. Orders '+compact(f.orders)+' · Highest rune '+F.names[f.discovered]));
  for(let slot=0;slot<3;slot++){
   const o=F.order(meta,slot),n=el('article','orderCard frame'),row=el('div','row');row.append(runeIcon(o.rank),el('h3','',F.names[o.rank]+' · rank '+o.rank));
   n.append(row,el('p','',compact(o.coins)+' coins · '+compact(o.dust)+' dust'+(o.shards?' · '+compact(o.shards)+' crystals':'')),button('Deliver rune',()=>{const result=F.fill(meta,slot);if(result){forgeSelected=-1;sound('buy');vibrate(20);save();renderForge(root);updateHome();notify('Order delivered · +'+compact(result.dust)+' stardust');}},!f.board.includes(o.rank),'primary'));root.append(n);
  }return;
 }
 root.append(el('p','forgeHelp','Tap a rune, then a matching rune to merge. Tap an empty tile to move. Ranks grow 1 → 9.'));
 const board=el('div','mergeBoard');f.board.forEach((rank,i)=>{
  const n=button('',()=>{
   if(forgeSelected===i){forgeSelected=-1;renderForge(root);return;}
   if(forgeSelected>=0&&(F.merge(meta,forgeSelected,i)||F.move(meta,forgeSelected,i))){sound('buy');vibrate(8);forgeSelected=-1;save();renderForge(root);return;}
   forgeSelected=rank?i:-1;sound('rune'+(rank%4));renderForge(root);
  },false,'mergeTile'+(forgeSelected===i?' selected':''));
  n.setAttribute('aria-label',rank?F.names[rank]+' rune rank '+rank+', tile '+(i+1):'Empty tile '+(i+1));
  if(rank)n.append(runeIcon(rank),el('small','rankTag',String(rank)));else n.append(el('span','emptyRune','✧'));board.append(n);
 });root.append(board);
 const controls=el('div','forgeControls');controls.append(button('Conjure · 1 spark',()=>{if(F.summon(meta)>=0){sound('pickup');forgeSelected=-1;save();renderForge(root);}},f.sparks<1||!f.board.includes(0),'primary'));
 const empty=f.board.filter(n=>n===0).length,count=Math.min(empty,f.sparks);
 if(count>1)controls.append(button('Fill board · '+count+' sparks',()=>{for(let i=0;i<count;i++)F.summon(meta);forgeSelected=-1;sound('pickup');save();renderForge(root);},false));
 const rank=f.board[forgeSelected]||0;
 if(rank){
  controls.append(button('Salvage → '+Math.pow(2,rank-1)+' dust',()=>{if(F.salvage(meta,forgeSelected)){forgeSelected=-1;sound('coin');save();renderForge(root);updateHome();}},false));
  if(inBattle)controls.append(button('Invoke · '+runeEffectName(rank),()=>{const events=E.invokeRune(meta,forgeSelected);if(events.length){forgeSelected=-1;processEvents(events);sound('burst');save();renderForge(root);updateHUD();}},!meta.run||meta.run.phase!=='fight'));
 }
 root.append(controls);
 if(!inBattle){const codex=el('div','runeCodex');for(let rank=1;rank<=9;rank++){const c=el('div','codexRune'+(rank>f.discovered?' locked':''));c.append(runeIcon(rank),el('b','',rank+' · '+F.names[rank]),el('small','',rank>f.discovered?'Undiscovered':runeEffectName(rank)));codex.append(c);}root.append(codex);}
 root.append(el('p','forgeHelp',inBattle?'Auto is fighting and choosing evolutions. Invoke runes for battle powers, or save them for guild orders.':'Sparks: +2 each cleared wave, +3 extra on bosses; regenerates every '+Math.round(45/(1+.08*f.perks.ember))+'s, even offline. No storage or time limit.'));
}
function runeIcon(rank){const n=expIcon(rank<=1?2:rank<=2?3:rank<=3?4:rank<=4?5:6);n.classList.add('runeArt','rank'+rank);return n;}
function runeEffectName(rank){return rank===1?'refresh Frost':rank===2?'heal 3':rank===3?'firestorm':rank===4?'Soul Burst':rank===5?'royal fury':rank===6?'rift collapse':'ascendant power';}
function finishCatchup(){
 catchingUp=false;catchupGeneration++;$('catchup').hidden=true;X.takeControl(meta);showHome();save();
 if(meta.expedition.report.failed)notify('Expedition stopped at wave '+meta.expedition.report.failed+'. Open the expedition to upgrade and retry.');
 else if(meta.expedition.report.cleared)notify('Expedition cleared '+meta.expedition.report.cleared+' waves. Rewards banked.');
}
function catchUp(){
 if(catchingUp)return;if(meta.expedition.carry<.1&&!meta.expedition.trial){showHome();return;}catchingUp=true;paused=true;$('dialog').close();$('draftOverlay').hidden=true;$('forgeDrawer').hidden=true;
 $('catchup').hidden=false;
 const generation=++catchupGeneration;
 function work(){
  if(!catchingUp||document.hidden||generation!==catchupGeneration)return;
  const more=X.settle(meta,E,F,1200);save();
  $('catchupInfo').textContent='Wave '+(meta.expedition.trial?.run.wave||meta.run?.wave||1)+' · '+meta.expedition.report.cleared+' cleared · '+compact(meta.expedition.report.coins)+' coins';
  if(more)setTimeout(work,0);else finishCatchup();
 }
 setTimeout(work,0);
}
$('catchupStop').onclick=()=>{if(catchingUp){X.takeControl(meta);finishCatchup();notify('Returned to your current wave. Sanctuary earnings are kept.');}};
async function checkUpdate(){
 if(!('serviceWorker'in navigator)){notify('Reopen your GitHub Pages link online to update.');return;}
 try{const reg=await navigator.serviceWorker.getRegistration();if(reg){await reg.update();notify('Update checked. Close all game tabs and reopen online if a newer version was uploaded.');}else notify('Open from your GitHub Pages website to enable updates.');}catch{notify('Could not check for updates. Try again online.');}
}

function setAuto(on,announce=true){
 pilotOn=!!on;meta.settings.auto=pilotOn;meta.expedition.enabled=pilotOn;autoPaused=false;heldPointer=null;
 if(pilotOn&&meta.run?.phase==='draft'&&!autoPaused)autoChoose();
 updateHUD();updateExpeditionEntry();save();
 if(announce)notify(pilotOn?(meta.run?.phase==='over'||meta.expedition.state==='blocked'?'Auto armed · Retry wave '+meta.run.wave+' to resume.':'Auto ON · attacks, powers, upgrades and all drops. Explore freely.'):'Auto OFF · manual controls restored.');
}
function updateAutoControls(){
 const r=meta.run,stopped=r?.phase==='over'||meta.expedition.state==='blocked';
 $('autoToggle').textContent=pilotOn?'Auto ON':'Auto OFF';
 $('autoToggle').classList.toggle('on',pilotOn);$('autoToggle').setAttribute('aria-pressed',String(!!pilotOn));
 $('autoStatus').hidden=!pilotOn||!r;
 if(pilotOn&&r)$('autoStatus').textContent=stopped?'Auto stopped · wave '+r.wave+' · Upgrade & retry':autoPaused?'Auto paused · Close pause menu to resume':'Auto fighting · wave '+r.wave+' · View battle →';
 $('autoStatus').classList.toggle('blocked',!!stopped);
 for(const b of document.querySelectorAll('[data-buy-upgrade]')){const id=b.dataset.buyUpgrade,u=E.upgrades[id];b.disabled=meta.upgrades[id]>=u.max||meta[u.currency]<E.upgradeCost(meta,id);}
 for(const b of document.querySelectorAll('[data-buy-research]'))b.disabled=meta.haven.dust<F.cost(meta,b.dataset.buyResearch);
 for(const b of document.querySelectorAll('[data-claim-milestone]')){const d=E.milestones.find(m=>m.id===b.dataset.claimMilestone);b.disabled=meta.claimed.includes(d.id)||!d.goal(meta);}
}
function autoChoose(){
 if(!pilotOn||meta.run?.phase!=='draft'||meta.expedition.state==='blocked')return false;
 const id=X.pick(meta,E,meta.run);
 if(!E.choose(meta,id))return false;
 $('draftOverlay').hidden=true;
 if(screen==='combat'){banner('WAVE '+meta.run.wave+' · AUTO EVOLVED');if(!$('forgeDrawer').hidden)renderForge($('drawerContent'));}
 updateHUD();save();return true;
}
function resolveWave(wave,loot){
 const r=meta.run;if(!r||r.phase!=='draft'||r.wave!==wave)return;
 F.wave(meta,wave);heldPointer=null;
 if(screen==='combat'&&!$('dialog').open){sound('draft');vibrate(20);}
 if(pilotOn)autoChoose();else if(screen==='combat')showDraft();
 if(screen==='combat'&&loot?.count){if(loot.kept)banner('WAVE CLEARED · +'+loot.kept+' GEAR');else banner('GEAR RECYCLED · +ESSENCE');}
 if(screen==='home')updateHome();
 save();
}

$('openTree').onclick=()=>openPage('tree');
document.querySelectorAll('[data-main]').forEach(b=>b.onclick=()=>{
 sound('ui');const name=b.dataset.main;
 if(name==='home')showHome();else if(name==='combat'){if(meta.run&&meta.run.phase!=='over')resumeRun();else if(meta.run?.phase==='over')openPage('expedition');else begin();}else openPage(name);
});
function renderMore(root){
 const items=[['gear','Equipment',()=>gearIcon(1)],['village','Mini-games',()=>havenIcon(3)],['tree','Talents',()=>icon(8)],['workshop','Battle upgrades',()=>icon(0)],['forge','Rune forge',()=>expIcon(3)],['research','Research',()=>expIcon(1)],['milestones','Rewards',()=>icon(15)],['collection','Powers',()=>icon(33)],['bestiary','Slime guide',()=>enemyPortrait(0)],['expedition','Offline waves',()=>expIcon(0)],['tasks','Tasks',()=>icon(28)]];
 const grid=el('div','moreGrid');for(const [name,title,art]of items){const card=button('',()=>openPage(name),false,'simpleMenuCard');card.append(art(),el('b','',title));grid.append(card);}root.append(grid);
}
function renderHomeGoal(){
 const root=$('homeGoal');if(!root)return;root.replaceChildren();
 let slot=meta.tree.tasks.findIndex((_,i)=>{const t=T.task(meta,i);return t.progress>=t.goal;});if(slot<0)slot=2;
 const t=T.task(meta,slot),row=el('div','goalCard'),copy=el('div');copy.append(el('small','','LITTLE ADVENTURE'),el('b','',t.label),el('small','',t.progress+'/'+t.goal+' · +3 skill points'));
 row.append(copy,button(t.progress>=t.goal?'Claim':'Go',()=>{if(t.progress>=t.goal){if(T.claim(meta,slot)){sound('buy');notify('+3 skill points!');save();updateHome();updateHUD();}}else if(t.page==='combat'){if(meta.run&&meta.run.phase!=='over')resumeRun();else begin();}else{if(t.kind==='orders')forgeTab='orders';openPage(t.page);}},false,t.progress>=t.goal?'primary':''));root.append(row);
}
function renderJourneys(root){
 const card=el('div','journeyCard');card.append(el('h3','','Earn more skill points'));
 for(let i=0;i<3;i++){const t=T.task(meta,i),row=el('div','journeyRow'),copy=el('span');row.dataset.taskSlot=i;copy.append(el('b','',t.label),el('small','',t.progress+'/'+t.goal+' · +3 points'));
  row.append(copy,button(t.progress>=t.goal?'Claim':'Go',()=>{const t=T.task(meta,i);if(t.progress>=t.goal){if(T.claim(meta,i)){sound('buy');notify('+3 skill points!');save();renderPage();updateHUD();}}else if(t.page==='combat'){if(meta.run?.phase==='fight')resumeRun();else if(meta.run?.phase==='over')openPage('expedition');else begin();}else{if(t.kind==='orders')forgeTab='orders';openPage(t.page);}},false,t.progress>=t.goal?'primary':''));card.append(row);
 }root.append(card);
}
function refreshJourneys(){for(const row of document.querySelectorAll('[data-task-slot]')){const t=T.task(meta,+row.dataset.taskSlot),b=row.querySelector('button');row.querySelector('small').textContent=t.progress+'/'+t.goal+' · +3 points';b.textContent=t.progress>=t.goal?'Claim':'Go';b.classList.toggle('primary',t.progress>=t.goal);}}
let selectedTreeNode='0:1:0',treeResize=()=>{},treeRefresh=()=>{};
window.addEventListener('resize',()=>{if(screen==='page'&&page==='talentmap')treeResize();});
function renderTree(root){
 const wallet=el('div','treeWallet');wallet.append(el('div','',compact(T.available(meta))+' skill points'),el('small','','1 point per 10 best waves · More from little adventures'));
 const tools=el('div','treeToolbar');for(const [label,fn]of [['−',()=>zoom(.8)],['+',()=>zoom(1.25)],['Center',()=>{camera.x=0;camera.y=0;camera.zoom=.55;apply();}],['Next path',focusNext]])tools.append(button(label,fn,false));
 const viewport=el('div','treeViewport');viewport.setAttribute('aria-label','Skill tree. Drag to explore, pinch or use zoom buttons.');
 const world=el('div','treeWorld');viewport.append(world);
 const detail=el('div','treeDetail');
 const hint=el('p','treeHint','Drag to explore · Pinch to zoom · Tap a hexagon');
 root.append(wallet,tools,viewport,hint,detail);
 const camera=meta.tree.camera||(meta.tree.camera={x:0,y:0,zoom:.55});
 const nodes=T.visible(meta),byId=new Map(nodes.map(n=>[n.id,n]));
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),bounds=nodes.reduce((b,n)=>({minX:Math.min(b.minX,n.x-100),minY:Math.min(b.minY,n.y-100),maxX:Math.max(b.maxX,n.x+100),maxY:Math.max(b.maxY,n.y+100)}),{minX:-200,minY:-200,maxX:200,maxY:200});
 svg.setAttribute('viewBox',[bounds.minX,bounds.minY,bounds.maxX-bounds.minX,bounds.maxY-bounds.minY].join(' '));Object.assign(svg.style,{position:'absolute',left:bounds.minX+'px',top:bounds.minY+'px',width:bounds.maxX-bounds.minX+'px',height:bounds.maxY-bounds.minY+'px',overflow:'visible',pointerEvents:'none'});
 for(const n of nodes){const p=byId.get(n.parent)||{x:0,y:0},line=document.createElementNS(ns,'line');line.setAttribute('x1',p.x);line.setAttribute('y1',p.y);line.setAttribute('x2',n.x);line.setAttribute('y2',n.y);line.setAttribute('stroke',meta.tree.nodes[n.id]?T.branches[n.branch].color:'#cbd8d1');line.setAttribute('stroke-width',meta.tree.nodes[n.id]?'7':'4');svg.append(line);}world.append(svg);
 const core=el('div','treeCore','SLIME\nHEART');world.append(core);
 for(const n of nodes){const level=meta.tree.nodes[n.id]||0,ready=T.canBuy(meta,n.id),unlocked=n.parent==='core'||!!meta.tree.nodes[n.parent];const b=el('button','hexNode'+(level?' owned':'')+(ready?' available':'')+(!unlocked?' locked':'')+(n.cap?' keystone':''));b.dataset.treeNode=n.id;b.style.left=n.x-43+'px';b.style.top=n.y-44+'px';b.style.setProperty('--branch',T.branches[n.branch].color);b.setAttribute('aria-label',n.name+', '+level+'/'+n.max+(ready?', available':''));
  b.append(el('span','hexSymbol',n.symbol),el('small','',n.cap?'KEYSTONE':T.branches[n.branch].name),el('b','',level?level+'/'+n.max:String(T.price(meta,n.id))+' pt'));
  b.onclick=e=>{if(e.detail===0)select(n.id);};world.append(b);
 }
 const pointers=new Map();let last=null,gesture=null,start=null,dragged=false;
 function size(){return {w:viewport.clientWidth||390,h:viewport.clientHeight||400};}
 function apply(){const {w,h}=size();world.style.setProperty('--map-zoom',camera.zoom);world.classList.toggle('distant',camera.zoom<.35);world.classList.toggle('detailZoom',camera.zoom>=.9);world.style.transform='translate('+(w/2+camera.x)+'px,'+(h/2+camera.y)+'px) scale('+camera.zoom+')';dirty=true;}
 function zoom(factor,anchor){const {w,h}=size(),a=anchor||{x:w/2,y:h/2},old=camera.zoom,next=Math.max(.18,Math.min(1.8,old*factor));camera.x=a.x-w/2-(a.x-w/2-camera.x)*next/old;camera.y=a.y-h/2-(a.y-h/2-camera.y)*next/old;camera.zoom=next;apply();}
 function select(id){selectedTreeNode=id;world.querySelectorAll('[data-tree-node]').forEach(n=>n.classList.toggle('selected',n.dataset.treeNode===id));details();}
 function details(){const n=T.node(selectedTreeNode);detail.replaceChildren();if(!n)return;const level=meta.tree.nodes[n.id]||0,price=T.price(meta,n.id),copy=el('div');copy.append(el('h3','',n.name),el('p','',n.desc),el('small','',level+'/'+n.max+' ranks · '+T.branches[n.branch].name));
  const ready=T.canBuy(meta,n.id),needs=n.parent!=='core'&&!meta.tree.nodes[n.parent];detail.append(copy,button(level>=n.max?'Complete':needs?'Unlock the connected path':availableLabel(),()=>{if(T.buy(meta,n.id)){sound('buy');vibrate(18);save();renderTreeFresh();updateHUD();}},!ready,'primary'));
  function availableLabel(){return availablePoints()>=price?'Unlock · '+price+' pt':'Need '+price+' points';}function availablePoints(){return T.available(meta);}
 }
 function renderTreeFresh(){root.replaceChildren();renderTree(root);}
 function focusNext(){const target=nodes.filter(n=>T.canBuy(meta,n.id)).sort((a,b)=>a.depth-b.depth||a.fork-b.fork||a.branch-b.branch)[0]||nodes.find(n=>!(meta.tree.nodes[n.id]||0));if(!target)return;camera.x=-target.x*camera.zoom;camera.y=-target.y*camera.zoom;select(target.id);apply();}
 function point(e){const rect=viewport.getBoundingClientRect();return {x:e.clientX-rect.left,y:e.clientY-rect.top};}
 function pinch(){const p=[...pointers.values()];return {x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2,d:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)};}
 viewport.onpointerdown=e=>{if(e.button!==undefined&&e.button!==0)return;e.preventDefault();const p=point(e);pointers.set(e.pointerId??1,p);try{viewport.setPointerCapture(e.pointerId);}catch{}start={...p,id:e.target.closest?.('[data-tree-node]')?.dataset.treeNode};last=p;dragged=false;if(pointers.size===2){gesture=pinch();dragged=true;}};
 viewport.onpointermove=e=>{const id=e.pointerId??1;if(!pointers.has(id))return;const p=point(e);pointers.set(id,p);if(pointers.size>=2){const next=pinch();zoom(next.d/Math.max(1,gesture.d),{x:gesture.x,y:gesture.y});camera.x+=next.x-gesture.x;camera.y+=next.y-gesture.y;gesture=next;dragged=true;apply();}else{if(Math.hypot(p.x-start.x,p.y-start.y)>6)dragged=true;if(dragged){camera.x+=p.x-last.x;camera.y+=p.y-last.y;apply();}last=p;}};
 viewport.onpointerup=e=>{if(!pointers.has(e.pointerId??1))return;if(!dragged&&start?.id)select(start.id);pointers.delete(e.pointerId??1);gesture=null;last=[...pointers.values()][0]||null;start=last?{...last}:null;save();};
 viewport.onpointercancel=()=>{pointers.clear();gesture=null;last=null;start=null;dragged=true;};
 viewport.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY<0?1.12:1/1.12,point(e));},{passive:false});
 treeResize=apply;treeRefresh=()=>{wallet.firstChild.textContent=compact(T.available(meta))+' skill points';for(const b of world.querySelectorAll('[data-tree-node]'))b.classList.toggle('available',T.canBuy(meta,b.dataset.treeNode));const n=T.node(selectedTreeNode),b=detail.querySelector('button');if(n&&b){const level=meta.tree.nodes[n.id]||0,needs=n.parent!=='core'&&!meta.tree.nodes[n.parent],price=T.price(meta,n.id);b.disabled=!T.canBuy(meta,n.id);b.textContent=level>=n.max?'Complete':needs?'Unlock the connected path':T.available(meta)>=price?'Unlock · '+price+' pt':'Need '+price+' points';}};apply();select(selectedTreeNode);
}

function drawFallbackSlime(x,y,size,color){ctx.save();ctx.globalAlpha=1;ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,size,size*.74,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#183e4b';ctx.beginPath();ctx.arc(x-size*.3,y-2,2.5,0,Math.PI*2);ctx.arc(x+size*.3,y-2,2.5,0,Math.PI*2);ctx.fill();ctx.restore();}
function safeDraw(dt){
 try{draw(dt);}catch(error){
  renderFailures++;try{canvas.width=canvas.width;dimensions();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,width,height);const r=meta.run;if(!r)return;
   for(const e of r.enemies)drawFallbackSlime(e.x*width,e.y*height,e.boss?38:22,enemyColors[e.type]||'#89d99e');
   for(const e of deathEchoes)drawFallbackSlime(e.x*width,e.y*height,18,enemyColors[e.type]||'#89d99e');
   drawFallbackSlime(width*.5,height*.94,23,'#7ce1df');
   if(heldPointer?.swiping)drawSlashPath(heldPointer.points,.8);
  }catch{}
 }
}
function gearIcon(i){const n=el('span','gearIcon'),index=typeof i==='number'?i:i.set*5+G.slots.indexOf(i.slot);n.style.backgroundPosition=(index%4/3*100)+'% '+(Math.floor(index/4)/3*100)+'%';return n;}
document.querySelectorAll('[data-gear-icon]').forEach(n=>{const i=+n.dataset.gearIcon;n.style.backgroundPosition=(i%4/3*100)+'% '+(Math.floor(i/4)/3*100)+'%';});
$('profileGear').onclick=()=>openPage('gear');$('homeGear').onclick=()=>openPage('gear');$('homeTasks').onclick=()=>openPage('tasks');
$('homeRewards').onclick=()=>{if(meta.idle.bank>=1)$('claimIdle').click();else showIdleRewards();};
function updateGearBadges(){
 const count=meta.gear.unseen;for(const id of ['gearNavBadge','homeGearBadge']){const n=$(id);n.hidden=count<1;n.textContent=count<1?'':count>99?'99+':String(count);}
 $('homeIdleBadge').textContent=compact(meta.idle.bank);$('homeIdleBadge').hidden=meta.idle.bank<1;
 const ready=meta.tree.tasks.filter((_,i)=>{const t=T.task(meta,i);return t.progress>=t.goal;}).length;$('homeTaskBadge').hidden=!ready;$('homeTaskBadge').textContent=ready;
}
function showIdleRewards(){E.accrue(meta);const body=el('div','menuButtons');body.append(el('div','idleBig',compact(meta.idle.bank)+' coins'),el('p','',compact(E.idleRate(meta)*60)+' per minute · keeps earning while you are away'),button('Collect',()=>{$('claimIdle').click();closeDialog();},meta.idle.bank<1,'primary'),button('Offline wave results',()=>{$('dialog').close();openPage('expedition');}));dialog('Your idle chest',body);}
function gearStatText(s){const labels={strength:'Strength',health:'Health',armor:'Armor',income:'Income',speed:'Speed',luck:'Drop luck'};return Object.entries(labels).filter(([k])=>s[k]>0).map(([k,label])=>label+' +'+(s[k]<1000?Number(s[k].toFixed(1)):compact(s[k]))+(['health','armor'].includes(k)?'':'%')).join(' · ');}

/* v8: the first view has one clear job; details open on a tap. */
function heroPortrait(skin=meta.hero.skin){const n=el('span','heroPortrait');n.dataset.skin=skin;n.style.backgroundPosition=(skin*50)+'% center';n.setAttribute('role','img');n.setAttribute('aria-label',['Aqua slime hero','Leaf slime hero','Ember slime hero'][skin]);return n;}
function heroStats(){const r=meta.run||E.previewRun(meta);return {attack:compact(E.power(meta,r)),hp:compact(P.previewHealth(meta,E))};}
function statStrip(){const s=heroStats(),n=el('div','heroStats');n.append(el('span','','⚔ '+s.attack),el('span','','♥ '+s.hp));n.setAttribute('aria-label','Attack '+s.attack+', Health '+s.hp);return n;}
function playFromPage(){if(meta.run?.phase==='over'||meta.expedition.state==='blocked')openPage('expedition');else if(meta.run)resumeRun();else begin();}
function renderShop(root){
 root.replaceChildren();root.className='heroPage';
 const stage=el('div','upgradeStage'),copy=el('div','heroHeading');copy.append(el('h2','',['Aqua','Leaf','Ember'][meta.hero.skin]),el('b','heroLevel','Lv. '+compact(P.heroLevel(meta))));stage.append(copy,heroPortrait(),el('div','heroPedestal'),statStrip());
 const upgrade=button('',()=>{E.accrue(meta);if(P.upgradeHero(meta,E)){sound('buy');vibrate(18);save();renderShop(root);root.querySelector('.upgradeStage').classList.add('leveledUp');updateHUD();}},false,'greenButton heroUpgrade');upgrade.id='heroUpgrade';
 const choices=el('div','heroChoices');for(let i=0;i<3;i++){const n=button('',()=>{meta.hero.skin=i;save();renderShop(root);},false,'heroChoice'+(i===meta.hero.skin?' selected':''));n.append(heroPortrait(i));n.setAttribute('aria-label','Choose '+['Aqua','Leaf','Ember'][i]+' look');n.setAttribute('aria-pressed',String(i===meta.hero.skin));choices.append(n);}
 const actions=el('div','heroLinks');actions.append(button('⚔  Battle upgrades',()=>openPage('workshop')),button('▦  More',()=>openPage('more')));
 root.append(stage,upgrade,choices,el('p','quietHint',meta.expedition.state==='blocked'||meta.run?.phase==='over'?'Health shown is ready for your next retry':'Choose a look · All your upgrades stay'),actions);refreshHero();
}
function refreshHero(){
 const b=$('heroUpgrade');if(!b)return;const next=P.heroNext(meta,E);b.disabled=!next?.ready;
 b.replaceChildren(el('b','',next?'Upgrade slime':'Fully upgraded'),el('small','',next?'● '+compact(next.cost)+'  ·  '+next.benefit:''));
 const stats=document.querySelector('.upgradeStage .heroStats');if(stats){const s=heroStats();stats.firstChild.textContent='⚔ '+s.attack;stats.lastChild.textContent='♥ '+s.hp;}
}
function renderTalents(root){
 root.replaceChildren();root.className='talentsPage';
 const wallet=el('div','talentWallet');wallet.append(el('b','','✦ '+compact(T.available(meta))),el('span','','Talent points'));
 const grid=el('div','talentGrid');
 for(const def of P.talents){const b=button('',()=>showTalent(def.id),false,'talentCard'+(def.cap?' specialTalent':''));b.dataset.talent=def.id;const hex=el('span','talentHex');hex.append(icon(def.icon));b.append(hex,el('b','',def.name),el('small','talentLevel'),el('span','talentPrice'));b.setAttribute('aria-label',def.name+' talent');grid.append(b);}
 const links=el('div','talentLinks');links.append(button('Earn points',()=>openPage('tasks'),false,'primary'),button('Advanced map',()=>openPage('talentmap')));
 root.append(wallet,el('p','talentIntro','Tap a talent to make your slime stronger'),grid,links,el('p','quietHint','1 point every 10 best waves · Talents keep growing'));refreshTalents();
}
function refreshTalents(){
 const wallet=document.querySelector('.talentWallet b');if(wallet)wallet.textContent='✦ '+compact(T.available(meta));
 for(const b of document.querySelectorAll('[data-talent]')){const l=P.lesson(meta,b.dataset.talent);b.querySelector('.talentLevel').textContent='Lv. '+compact(l.level);b.querySelector('.talentPrice').textContent=Number.isFinite(l.cost)?'✦ '+compact(l.cost):'Complete';b.classList.toggle('canLearn',l.ready);}
}
function showTalent(id){
 const l=P.lesson(meta,id);if(!l)return;const body=el('div','itemPopup talentPopup'),badge=el('div','popupBadge');badge.append(icon(l.icon));
 const desc=el('p','popupBenefit',l.benefit),bundle=el('p','quietHint',l.ids.length>1?'Includes '+l.ids.length+' connected path lessons':''),buy=button('',()=>{E.accrue(meta);if(P.learn(meta,id)){sound('buy');vibrate(16);save();refreshTalents();showTalent(id);updateHUD();}},false,'greenButton');buy.dataset.learnTalent=id;
 body.append(badge,el('b','popupLevel','Lv. '+compact(l.level)),desc,bundle,buy);dialog(l.name,body);
 liveDetail=()=>{const next=P.lesson(meta,id);buy.disabled=!next.ready;buy.textContent=(next.ready?'Learn · ✦ ':'Need ✦ ')+compact(next.cost);};liveDetail();
}
function gearTitle(i){return G.sets[i.set].name+' '+G.slotNames[i.slot];}
function itemLevel(i){return i.tier+i.level;}
function itemCard(i,action,extra=''){
 const n=button('',action,false,'gearCard rarity'+i.rarity+' '+extra);n.append(gearIcon(i),el('b','gearLevel','Lv. '+compact(itemLevel(i))));n.setAttribute('aria-label',G.rarities[i.rarity].name+' '+gearTitle(i)+', level '+compact(itemLevel(i)));return n;
}
function renderGear(root){
 root.replaceChildren();root.className='equipmentPage';const g=meta.gear;g.unseen=0;gearViewRevision=g.revision;
 const stage=el('div','equipmentStage');stage.append(heroPortrait(),el('div','heroPedestal'));
 for(const slot of G.slots){const i=g.items.find(i=>i.id===g.equipped[slot]),n=i?itemCard(i,()=>showGearItem(i.id),'equippedSlot slot-'+slot):button('',()=>{gearFilter=slot;gearPage=0;renderGear(root);root.querySelector('.bagSection').scrollIntoView?.({block:'nearest'});},false,'emptySlot slot-'+slot);
  n.classList.add('equippedSlot');if(!i){n.append(gearIcon(G.slots.indexOf(slot)),el('span','emptyPlus','+'));n.setAttribute('aria-label','Empty '+G.slotNames[slot]+' slot. View '+G.slotNames[slot]+' bag.');}
  const label=el('small','slotLabel',G.slotNames[slot]);n.append(label);stage.append(n);
 }
 const heroLink=button('Upgrade slime ↑',()=>openPage('shop'),false,'smallGreen');heroLink.classList.add('stageUpgrade');stage.append(heroLink);stage.append(statStrip());root.append(stage);
 const bag=el('section','bagSection'),heading=el('div','bagHeading');heading.append(button('By '+gearSort,()=>{const options=['rarity','strongest','newest'];gearSort=options[(options.indexOf(gearSort)+1)%options.length];gearPage=0;renderGear(root);}));heading.append(el('h3','','My Collection'),button('Forge',showGearForge));bag.append(heading);
 if(gearFilter!=='all'){const filter=button(G.slotNames[gearFilter]+'  ×  Show all',()=>{gearFilter='all';gearPage=0;renderGear(root);},false,'bagFilter');bag.append(filter);}
 const equippedScores=Object.fromEntries(G.slots.map(slot=>{const i=g.items.find(i=>i.id===g.equipped[slot]);return [slot,i?G.score(i):0];}));
 const items=g.items.filter(i=>gearFilter==='all'||i.slot===gearFilter).sort((a,b)=>gearSort==='newest'?b.id-a.id:gearSort==='strongest'?G.score(b)-G.score(a):b.rarity-a.rarity||G.score(b)-G.score(a)),pages=Math.max(1,Math.ceil(items.length/48));gearPage=Math.max(0,Math.min(gearPage,pages-1));
 const grid=el('div','gearGrid');for(const i of items.slice(gearPage*48,gearPage*48+48)){const equipped=g.equipped[i.slot]===i.id,n=itemCard(i,()=>showGearItem(i.id),equipped?'equipped':'');if(equipped)n.append(el('span','equippedTick','✓'));if(i.favorite)n.append(el('span','favoriteMark','★'));if(!equipped&&G.score(i)>equippedScores[i.slot])n.append(el('span','gearBetter','↑'));grid.append(n);}bag.append(grid);
 if(!items.length){const empty=el('div','bagEmpty');empty.append(gearIcon(1),el('b','','Win waves to find '+(gearFilter==='all'?'gear':G.slotNames[gearFilter].toLowerCase())),el('p','','Drops are collected when you win'),button('Play',playFromPage,false,'greenButton'));bag.append(empty);}
 if(pages>1){const pager=el('div','bagPager');pager.append(button('←',()=>{gearPage--;renderGear(root);},gearPage===0),el('b','',gearPage+1+' / '+pages),button('→',()=>{gearPage++;renderGear(root);},gearPage===pages-1));bag.append(pager);}root.append(bag);
}
function showGearItem(id){
 const i=meta.gear.items.find(i=>i.id===id);if(!i){closeDialog();return;}selectedGear=id;
 const equipped=meta.gear.equipped[i.slot]===id,body=el('div','itemPopup'),badge=el('div','popupBadge rarity'+i.rarity);badge.append(gearIcon(i));body.append(badge,el('b','popupLevel',G.rarities[i.rarity].name+' · Lv. '+compact(itemLevel(i))));
 const stats=G.statsFor(i),list=el('div','itemStats');for(const [key,label]of Object.entries({strength:'Attack',health:'Health',armor:'Armor',income:'Coins',speed:'Speed',luck:'Drop luck'}))if(stats[key]){const row=el('div');row.append(el('span','',label),el('b','','+'+compact(Number(stats[key].toFixed(1)))+(['health','armor'].includes(key)?'':'%')));list.append(row);}body.append(list,el('p','quietHint',G.sets[i.set].desc+' · '+Math.min(3,G.stats(meta).sets[i.set])+'/3 equipped'));
 const current=meta.gear.items.find(j=>j.id===meta.gear.equipped[i.slot]);if(!equipped&&current){const d=G.score(i)-G.score(current);body.append(el('p','compareHint',d>0?'↑ Stronger than your equipped item':d===0?'Same power as your equipped item':'Your equipped item is stronger'));}
 const action=button('',()=>{E.accrue(meta);if(equipped?G.upgrade(meta,id):G.equip(meta,id)){sound('buy');save();renderGear($('pageContent'));showGearItem(id);updateHUD();}},false,'greenButton');action.dataset.gearAction=equipped?'upgrade':'equip';body.append(action,button('More',()=>showGearOptions(id),false,'textButton'));
 dialog(gearTitle(i),body);liveDetail=()=>{const item=meta.gear.items.find(j=>j.id===id);if(!item){action.disabled=true;return;}action.textContent=equipped?'Upgrade · '+compact(G.cost(item))+' essence':'Equip';action.disabled=equipped&&meta.gear.scrap<G.cost(item);};liveDetail();
}
function showGearOptions(id){
 const i=meta.gear.items.find(j=>j.id===id);if(!i)return;const equipped=meta.gear.equipped[i.slot]===id,body=el('div','menuButtons');
 body.append(button(i.favorite?'★ Remove favorite':'☆ Keep as favorite',()=>{G.favorite(meta,id);save();renderGear($('pageContent'));showGearItem(id);}));
 if(equipped)body.append(button('Change this item',()=>{gearFilter=i.slot;gearPage=0;closeDialog();renderGear($('pageContent'));$('pageContent').querySelector('.bagSection').scrollIntoView?.({block:'nearest'});}));
 if(equipped)body.append(button('Unequip',()=>{E.accrue(meta);G.unequip(meta,i.slot);save();renderGear($('pageContent'));showGearItem(id);updateHUD();}));
 body.append(button('Recycle · +'+compact(G.recycleValue(i))+' essence',()=>{const confirm=el('div','menuButtons');confirm.append(el('p','','Recycle '+gearTitle(i)+'? This item will be gone.'),button('Recycle item',()=>{if(G.recycle(meta,id)){sound('coin');save();renderGear($('pageContent'));closeDialog();}},false,'primary'),button('Keep item',()=>showGearItem(id)));dialog('Recycle this item?',confirm);},equipped||i.favorite),button('Back',()=>showGearItem(id)));dialog('Item options',body);
}
function showGearForge(){
 const g=meta.gear,body=el('div','menuButtons');body.append(el('div','forgeEssence','✧ '+compact(g.scrap)+' essence'),button('Equip strongest',()=>{E.accrue(meta);G.equipBest(meta);sound('buy');save();renderGear($('pageContent'));closeDialog();updateHUD();},!g.items.length,'greenButton'),button('Recycle spares',()=>{const b=el('div','menuButtons');b.append(el('p','','Recycle spare Common and Uncommon gear? Equipped gear, favorites and your strongest items are kept.'),button('Recycle spares',()=>{const count=G.recycleExtras(meta);save();renderGear($('pageContent'));showGearForge();notify(count+' items recycled');},false,'primary'),button('Keep my gear',showGearForge));dialog('Recycle spares?',b);},!g.items.length),button('Recycle duplicate Common · '+(g.autoRecycle?'ON':'OFF'),()=>{g.autoRecycle=!g.autoRecycle;save();showGearForge();}),el('p','quietHint','Recycle spares for essence. Tap equipped gear to upgrade it.'));dialog('Gear forge',body);
}
function renderUpgrades(root){
 root.replaceChildren();root.className='simpleUpgradePage';root.append(el('p','talentIntro','Choose what to make stronger'));
 const grid=el('div','upgradeGrid');for(const [id,u]of Object.entries(E.upgrades)){const n=button('',()=>showUpgrade(id),false,'upgradeTile');n.append(icon(u.icon),el('b','',u.name),el('small','','Lv. '+compact(meta.upgrades[id])));grid.append(n);}root.append(grid,button('Your slime',()=>openPage('shop'),false,'greenButton'));
}
function showUpgrade(id){
 const u=E.upgrades[id],body=el('div','itemPopup'),badge=el('div','popupBadge');badge.append(icon(u.icon));const b=button('',()=>{E.accrue(meta);if(E.buy(meta,id)){sound('buy');save();renderUpgrades($('pageContent'));showUpgrade(id);updateHUD();}},false,'greenButton');b.dataset.buyUpgrade=id;
 body.append(badge,el('b','popupLevel','Lv. '+compact(meta.upgrades[id])),el('p','popupBenefit',u.desc),b);dialog(u.name,body);liveDetail=()=>{const cost=E.upgradeCost(meta,id),max=meta.upgrades[id]>=u.max;b.textContent=max?'Max level':'Upgrade · '+compact(cost)+(u.currency==='coins'?' coins':' crystals');b.disabled=max||meta[u.currency]<cost;};liveDetail();
}

function renderResearch(root){
 root.replaceChildren();const wallet=el('div','talentWallet');wallet.append(el('b','','✦ '+compact(meta.haven.dust)),el('span','','Stardust'));root.append(wallet);
 const grid=el('div','upgradeGrid');for(const [id,u]of Object.entries(F.perks)){const n=button('',()=>showResearch(id,root),false,'upgradeTile');n.append(expIcon(u.icon),el('b','',u.name),el('small','','Lv. '+compact(meta.forge.perks[id])));grid.append(n);}root.append(grid);
}
function showResearch(id,root){
 const u=F.perks[id],body=el('div','itemPopup'),badge=el('div','popupBadge');badge.append(expIcon(u.icon));const b=button('',()=>{F.accrue(meta);E.accrue(meta);if(F.buy(meta,id)){sound('buy');save();renderResearch(root);showResearch(id,root);updateHUD();}},false,'greenButton');b.dataset.buyResearch=id;
 body.append(badge,el('b','popupLevel','Lv. '+compact(meta.forge.perks[id])),el('p','popupBenefit',u.desc),b);dialog(u.name,body);liveDetail=()=>{const cost=F.cost(meta,id);b.textContent='Upgrade · '+compact(cost)+' dust';b.disabled=meta.haven.dust<cost;};liveDetail();
}
