(function(root){
'use strict';
const MAX_IDLE=8*3600, IDLE_CAP=20000;
const cards=[
 {id:'power',name:'Emerald edge',rarity:'common',icon:0,max:8,desc:'+40% tap and companion damage. Stacks multiplicatively.'},
 {id:'chain',name:'Living lightning',rarity:'rare',icon:1,max:5,desc:'Each hit has a 45% chance to chain to 2 more slimes per level. Level 3 always chains.'},
 {id:'blast',name:'Wildfire',rarity:'rare',icon:2,max:5,desc:'Direct hits splash 35% damage per level into nearby slimes.'},
 {id:'poison',name:'Toxic bloom',rarity:'common',icon:3,max:5,desc:'Hits inflict stacking poison for 4 seconds. Lightning spreads poison too.'},
 {id:'frost',name:'Permafrost',rarity:'common',icon:4,max:4,desc:'Every hit slows its target. With Wildfire, frozen enemies take double splash damage.'},
 {id:'crit',name:'Perfect fracture',rarity:'common',icon:5,max:5,desc:'+12% critical chance. Critical hits deal 3× damage.'},
 {id:'echo',name:'Echo barrage',rarity:'rare',icon:6,max:4,desc:'Every third direct hit fires an extra full-damage shot per level at another slime.'},
 {id:'familiar',name:'Twin spirits',rarity:'epic',icon:7,max:4,desc:'Your companion strikes one extra target per level on every volley.'},
 {id:'vampire',name:'Soul feast',rarity:'rare',icon:8,max:3,desc:'Every 12 kills restores 1 heart per level. Also heal 1 now.'},
 {id:'fortune',name:'Golden touch',rarity:'common',icon:9,max:5,desc:'+30% coins from every kill and wave chest per level.'},
 {id:'prism',name:'Prism reactor',rarity:'epic',icon:10,max:3,desc:'Lightning deals +50% damage per level. Every critical hit restores ability charge faster.'},
 {id:'venom',name:'Plague monarch',rarity:'epic',icon:11,max:3,requires:'poison',desc:'Poisoned enemies explode on death, spreading poison and damage to nearby slimes.'},
 {id:'meteor',name:'Falling stars',rarity:'epic',icon:12,max:4,desc:'A meteor automatically strikes the lowest enemy every 6 seconds for massive area damage.'},
 {id:'vortex',name:'Event horizon',rarity:'legendary',icon:13,max:2,desc:'Every 8 seconds open a lasting wormhole that pulls slimes together and damages the swarm.'},
 {id:'haste',name:'Time thief',rarity:'rare',icon:14,max:5,desc:'Companion volleys fire 20% faster per level. Powers recharge faster too.'},
 {id:'execute',name:'Royal decree',rarity:'legendary',icon:0,max:2,desc:'Direct hits execute normal slimes below 20% health per level. Boss threshold is lower.'},
 {id:'berserk',name:'Last light',rarity:'epic',icon:2,max:3,desc:'+60% damage per level while at half health or below. Gain 1 maximum heart and heal 1.'},
 {id:'mend',name:'Second wind',rarity:'common',icon:8,max:10,desc:'Recover 3 hearts and gain 1 maximum heart.'},
 {id:'orbit',name:'Moonlit sabers',rarity:'rare',icon:16,max:5,minWave:8,desc:'Every 2.4 seconds sweep the lowest 3 slimes with orbiting blades. Each level adds damage.'},
 {id:'laser',name:'Prismatic lance',rarity:'epic',icon:17,max:4,minWave:12,desc:'Every 3.5 seconds fire a piercing beam through the most dangerous lane.'},
 {id:'storm',name:'Tempest choir',rarity:'epic',icon:18,max:4,minWave:15,desc:'Every 5 seconds strike several slimes with a barrage of thunderbolts.'},
 {id:'boomerang',name:'Bloodcrescent',rarity:'rare',icon:19,max:5,minWave:8,desc:'Every fifth direct hit launches a returning glaive through extra targets.'},
 {id:'mines',name:'Glacial lattice',rarity:'rare',icon:20,max:4,minWave:10,desc:'Plant frost mines near the ward. Approaching enemies trigger freezing explosions.'},
 {id:'singularity',name:'Stellar collapse',rarity:'legendary',icon:21,max:3,minWave:20,requires:'vortex',desc:'The wormhole collapses into a starburst at the end of its pull, damaging the entire swarm.'},
 {id:'phoenix',name:'Phoenix pact',rarity:'epic',icon:22,max:3,minWave:15,desc:'Gain one revival per level for this run. Return with half health and an explosive shockwave.'},
 {id:'thorns',name:'Briar ward',rarity:'rare',icon:23,max:5,minWave:8,desc:'Every second lash enemies near the bottom ward with magical vines.'},
 {id:'curse',name:'Hexfire brand',rarity:'rare',icon:24,max:5,minWave:12,desc:'Direct hits brand enemies. Each stack increases later damage they take by 8% per level.'},
 {id:'infinity',name:'Infinite edge',rarity:'epic',icon:25,max:12,minWave:25,desc:'+30% multiplicative damage per level. Keeps late-game builds growing beyond Emerald edge.'},
 {id:'timeslip',name:'Borrowed eternity',rarity:'epic',icon:26,max:4,minWave:18,desc:'Frost nova lasts 1 second longer and Overcharge lasts 2 seconds longer per level.'},
 {id:'resonance',name:'Chromatic rupture',rarity:'legendary',icon:27,max:4,minWave:25,desc:'Every tenth direct hit detonates a rainbow shockwave. Extra elements increase its damage.'}
];
const upgrades={
 blade:{name:'Ancient blade',icon:0,desc:'+1 permanent base damage per level.',base:30,currency:'coins',max:30},
 hull:{name:'Spirit ward',icon:8,desc:'+1 starting heart per level.',base:45,currency:'coins',max:15},
 pet:{name:'Companion bond',icon:7,desc:'+15% companion damage and 3% fire speed per level.',base:40,currency:'coins',max:25},
 garden:{name:'Gel sanctuary',icon:11,desc:'Increase idle coin growth. Works while the game is closed.',base:35,currency:'coins',max:25},
 luck:{name:'Fate crystal',icon:10,desc:'Increase rare, epic and legendary card odds.',base:2,currency:'shards',max:12}
};
const milestones=[
 {id:'first',name:'First of many',desc:'Defeat 25 slimes.',goal:m=>m.kills>=25,reward:{coins:35,shards:1}},
 {id:'five',name:'Crown breaker',desc:'Clear wave 5.',goal:m=>m.best>=5,reward:{coins:100,shards:3}},
 {id:'ten',name:'Growing storm',desc:'Clear wave 10.',goal:m=>m.best>=10,reward:{coins:180,shards:5}},
 {id:'hundred',name:'Gel storm',desc:'Defeat 250 slimes.',goal:m=>m.kills>=250,reward:{coins:160,shards:3}},
 {id:'twenty',name:'Beyond the hollow',desc:'Clear wave 20.',goal:m=>m.best>=20,reward:{coins:350,shards:8}},
 {id:'thirty',name:'Uncontained',desc:'Clear wave 30.',goal:m=>m.best>=30,reward:{coins:600,shards:12}},
 {id:'fifty',name:'Beyond the familiar',desc:'Clear wave 50.',goal:m=>m.best>=50,reward:{coins:1200,shards:18}},
 {id:'seventyfive',name:'World breaker',desc:'Clear wave 75.',goal:m=>m.best>=75,reward:{coins:2400,shards:25}},
 {id:'hundredwave',name:'Endless ascension',desc:'Clear wave 100.',goal:m=>m.best>=100,reward:{coins:4000,shards:40}}
];
function fresh(now=Date.now()){return {version:1,coins:0,shards:0,best:0,kills:0,runs:0,upgrades:{blade:0,hull:0,pet:0,garden:0,luck:0},claimed:[],dex:{},idle:{bank:0,lastAt:now},settings:{sound:true,music:false,haptics:true,shake:true},run:null};}
const bound=(v,a,b)=>Number.isFinite(v)?Math.max(a,Math.min(b,v)):a;
function normalize(raw,now=Date.now()){
 if(!raw||raw.version!==1||!raw.upgrades||!raw.idle)throw Error('This is not a Slimefall save.');
 const m=fresh(now);
 for(const k of ['coins','shards','kills','runs'])m[k]=Math.floor(bound(raw[k],0,1e12));
 m.best=Math.floor(bound(raw.best,0,10000));
 for(const k in upgrades)m.upgrades[k]=Math.floor(bound(raw.upgrades[k],0,upgrades[k].max));
 m.claimed=Array.isArray(raw.claimed)?[...new Set(raw.claimed.filter(id=>milestones.some(x=>x.id===id)))]:[];
 for(const c of cards)if(raw.dex?.[c.id])m.dex[c.id]=true;
 for(const k in m.settings)if(typeof raw.settings?.[k]==='boolean')m.settings[k]=raw.settings[k];
 m.idle={bank:bound(raw.idle.bank,0,IDLE_CAP),lastAt:bound(raw.idle.lastAt,0,now)};
 // An invalid run never prevents recovery of the permanent collection.
 if(raw.run){try{m.run=normalizeRun(raw.run,m);}catch{m.run=null;}}
 return m;
}
function normalizeRun(raw,m){
 if(!['fight','draft','over'].includes(raw.phase)||!Number.isInteger(raw.wave)||raw.wave<1||raw.wave>10000)throw Error('Invalid run');
 const r=newRunData(m);
 for(const k of ['wave','spawned','resolved','target','kills','earned','hits','combo','bestCombo','nextId','rerolls'])r[k]=Math.floor(bound(raw[k],0,1e9));
 r.wave=raw.wave;r.target=Math.floor(bound(raw.target,8,100));r.modifier=condition(r.wave);
 r.bonusSpawned=Math.floor(bound(raw.bonusSpawned,0,24));
 r.spawned=Math.min(r.target,r.spawned);r.resolved=Math.min(r.spawned,r.resolved);
 for(const k of ['hp','maxHp','time','spawnClock','petClock','meteorClock','vortexClock','freeze','fury','frostCD','furyCD','lastHit','vortexTime','extraClock','revives'])r[k]=bound(raw[k],0,k.includes('CD')?60:1e9);
 r.maxHp=bound(r.maxHp,1,100);r.hp=Math.min(r.hp,r.maxHp);r.phase=raw.phase;
 for(const c of cards)r.cards[c.id]=Math.floor(bound(raw.cards?.[c.id],0,c.max));
 r.enemies=[];
 for(const e of (Array.isArray(raw.enemies)?raw.enemies:[]).slice(0,60)){
  if(!Number.isInteger(e.id)||!Number.isFinite(e.hp)||e.hp<=0)continue;
  r.enemies.push({id:e.id,type:Math.floor(bound(e.type,0,20)),x:bound(e.x,.08,.92),y:bound(e.y,-.2,.94),hp:bound(e.hp,.01,1e12),max:bound(e.max,1,1e12),speed:bound(e.speed,.01,.5),boss:!!e.boss,poison:bound(e.poison,0,1e10),poisonTime:bound(e.poisonTime,0,4),slow:bound(e.slow,0,6),hit:0,clock:bound(e.clock,0,100),mini:!!e.mini,elite:!!e.elite,guard:Math.floor(bound(e.guard,0,3)),curse:bound(e.curse,0,5),haste:bound(e.haste,0,2)});
 }
 if(new Set(r.enemies.map(e=>e.id)).size!==r.enemies.length||r.enemies.length+r.resolved!==r.spawned)throw Error('Inconsistent wave');
 r.nextId=Math.max(r.nextId,...r.enemies.map(e=>e.id+1));
 r.mines=(Array.isArray(raw.mines)?raw.mines:[]).slice(0,6).map(mine=>({x:bound(mine.x,.05,.95),y:bound(mine.y,.4,.85),life:bound(mine.life,0,10)}));
 r.offers=Array.isArray(raw.offers)?raw.offers.filter(id=>cards.some(c=>c.id===id)).slice(0,3):[];
 if(r.phase==='draft'&&r.offers.length<3)r.offers=drawCards(m,r,Math.random);
 if(r.hp<=0)r.phase='over';
 return r;
}
function idleRate(m){return (1+m.upgrades.garden*.6)/6;}
function accrue(m,now=Date.now()){
 const seconds=Math.min(MAX_IDLE,Math.max(0,(now-m.idle.lastAt)/1000));
 const before=m.idle.bank;
 m.idle.bank=Math.min(IDLE_CAP,m.idle.bank+seconds*idleRate(m));
 m.idle.lastAt=now;return m.idle.bank-before;
}
function claimIdle(m){const count=Math.floor(m.idle.bank);m.coins+=count;m.idle.bank-=count;return count;}
function upgradeCost(m,id){const d=upgrades[id];return d?Math.ceil(d.base*Math.pow(id==='luck'?1.65:1.43,m.upgrades[id])):Infinity;}
function buy(m,id){const u=upgrades[id];if(!u||m.upgrades[id]>=u.max)return false;const cost=upgradeCost(m,id);if(m[u.currency]<cost)return false;m[u.currency]-=cost;m.upgrades[id]++;return true;}
function newRunData(m){return {phase:'fight',wave:1,hp:5+m.upgrades.hull,maxHp:5+m.upgrades.hull,enemies:[],cards:{},offers:[],target:8,spawned:0,resolved:0,kills:0,earned:0,hits:0,combo:0,bestCombo:0,time:0,lastHit:-9,spawnClock:1,petClock:0,meteorClock:0,vortexClock:0,freeze:0,fury:0,frostCD:0,furyCD:0,nextId:1,rerolls:1,modifier:'calm',bonusSpawned:0,extraClock:0,vortexTime:0,revives:0,mines:[]};}
function start(m){m.runs++;m.run=newRunData(m);return m.run;}
function level(r,id){return r.cards[id]||0;}
function damage(m,r){
 let n=(2+m.upgrades.blade)*Math.pow(1.4,level(r,'power'));
 if(r.hp<=r.maxHp/2)n*=1+level(r,'berserk')*.6;
 n*=Math.pow(1.3,level(r,'infinity'))*Math.pow(1.02,Math.max(0,r.wave-40));
 if(r.fury>0)n*=2;
 return n;
}
function drawCards(m,r,rng=Math.random){
 const pool=cards.filter(c=>r.wave>=(c.minWave||0)&&level(r,c.id)<c.max&&(!c.requires||level(r,c.requires)>0)),result=[];
 while(result.length<3&&pool.length){
  const weights=pool.map(c=>({common:10,rare:5,epic:2.1,legendary:.65}[c.rarity])*(c.rarity==='common'?1:1+m.upgrades.luck*.13));
  let roll=rng()*weights.reduce((a,b)=>a+b,0),i=0;
  for(;i<weights.length-1;i++){roll-=weights[i];if(roll<=0)break;}
  result.push(pool.splice(i,1)[0].id);
 }
 // Boss chests guarantee an epic or legendary offer. Early drafts teach a rare power.
 const tier=r.wave%5===0?['epic','legendary']:r.wave<=3?['rare']:null;
 if(tier&&!result.some(id=>tier.includes(cards.find(c=>c.id===id).rarity))){
  const candidates=pool.filter(c=>tier.includes(c.rarity));
  if(candidates.length)result[result.length-1]=candidates[Math.floor(rng()*candidates.length)].id;
 }
 if(r.wave>=40&&!result.some(id=>cards.find(c=>c.id===id).minWave)){
  const discoveries=pool.filter(c=>c.minWave);
  if(discoveries.length)result[0]=discoveries[Math.floor(rng()*discoveries.length)].id;
 }
 // Endless runs may eventually own every capped card. Recovery stays available.
 while(result.length<3)result.push('mend');
 return result;
}
function choose(m,id,rng=Math.random){
 const r=m.run;if(!r||r.phase!=='draft'||!r.offers.includes(id))return false;
 const c=cards.find(c=>c.id===id);r.cards[id]=Math.min(c.max,level(r,id)+1);m.dex[id]=true;
 if(id==='mend'){r.maxHp=Math.min(100,r.maxHp+1);r.hp=Math.min(r.maxHp,r.hp+3);}
 if(id==='berserk'){r.maxHp=Math.min(100,r.maxHp+1);r.hp=Math.min(r.maxHp,r.hp+1);}
 if(id==='vampire')r.hp=Math.min(r.maxHp,r.hp+1);
 r.wave++;r.modifier=condition(r.wave);r.target=waveTarget(r.wave);r.bonusSpawned=0;r.mines=[];r.vortexTime=0;r.spawned=0;r.resolved=0;r.enemies=[];r.spawnClock=.7;r.offers=[];r.phase='fight';r.rerolls=1;
 return true;
}
function reroll(m,rng=Math.random){
 const r=m.run;if(!r||r.phase!=='draft'||r.rerolls<=0)return false;
 r.offers=drawCards(m,r,rng);r.rerolls--;return true;
}
const conditions={calm:{name:'Quiet glade',desc:'Standard wave'},swarm:{name:'Brood tide',desc:'More slimes, lower individual health'},frenzy:{name:'Blood moon',desc:'Faster movement and bonus coins'},armoured:{name:'Iron rain',desc:'Tougher slimes'},goldrush:{name:'Gilded hunt',desc:'More treasure slimes'},eclipse:{name:'Arcane eclipse',desc:'Powers recharge faster; enemies heal slowly'}};
const realms=['Moonlit Glade','Sporewild Bog','Cinder Forge','Astral Ruins'];
const enemyNames=['Leafling','Spark runner','Frost armour','Toxic cap','Berserker','Gold jelly','Spirit','Slime King','Void Monarch','Bloom medic','Mirror prism','Brood mother','Rift skipper','Burrower','Leaf sentinel','Storm caller','Blood leech','Spore Queen','Cinder Knight','Astral Sovereign','Treasure mimic'];
function condition(wave){return wave<15?'calm':['swarm','frenzy','armoured','goldrush','eclipse'][Math.floor((wave-15)/3)%5];}
function realm(wave){return Math.floor((wave-1)/10)%4;}
function waveTarget(wave){return Math.min(60,8+Math.floor((wave-1)*1.5))+(condition(wave)==='swarm'?8:0);}
function spawn(r,rng=Math.random){
 const boss=r.wave%5===0&&r.spawned===r.target-1;
 let type=0;
 if(boss){
  type=[7,8,17,18,19][Math.floor(r.wave/5-1)%5];
 }else if(rng()<(r.modifier==='goldrush'?.18:.045))type=r.wave>=20?20:5;
 else if(r.wave>=8&&rng()<Math.min(.7,.2+r.wave*.012)){
  const list=realm(r.wave)===1?[9,11,16]:realm(r.wave)===2?[10,13,14]:realm(r.wave)===3?[12,15,16]:[9,10,11,12,13,14,15,16];
  type=list[Math.min(list.length-1,Math.floor(rng()*list.length))];
 }else if(r.wave>=3)type=Math.min(4,Math.floor(rng()*Math.min(5,1+r.wave/2)));
 let hp=(2.5+r.wave*1.45)*Math.pow(1.085,Math.min(r.wave,40))*Math.pow(1.035,Math.max(0,r.wave-40));
 if(type===2||type===14)hp*=1.7;
 if(type===5||type===20)hp*=1.2;
 if(r.modifier==='swarm')hp*=.75;
 if(r.modifier==='armoured')hp*=1.35;
 const elite=r.wave>=40&&!boss&&r.spawned%(r.wave>=80?4:7)===0;
 if(elite)hp*=1.6;
 if(boss)hp*=6;
 const speed=Math.min(.22,.034+r.wave*.0028)*(type===1?1.65:boss?.65:1)*(r.modifier==='frenzy'?1.18:1)*(elite?1.12:1);
 const e={id:r.nextId++,type,x:.1+rng()*.8,y:-.1,hp,max:hp,speed,boss,poison:0,poisonTime:0,slow:0,hit:0,clock:0,mini:false,elite,guard:type===10?3:0,curse:0,haste:0};
 r.enemies.push(e);r.spawned++;return e;
}
function addMinion(r,parent,type){
 if(r.bonusSpawned>=24||r.enemies.length>=44)return null;
 const hp=parent.max*(parent.boss?.09:.24);
 const e={...parent,id:r.nextId++,type,x:bound(parent.x+(r.bonusSpawned%2?.06:-.06),.08,.92),y:Math.min(.84,parent.y+.01),hp,max:hp,speed:Math.min(.4,parent.speed*1.25),boss:false,mini:true,elite:false,poison:0,poisonTime:0,slow:0,clock:0,guard:0,curse:0,haste:0};
 r.bonusSpawned++;r.target++;r.spawned++;r.enemies.push(e);return e;
}
function giveCoins(m,r,amount){const n=Math.max(1,Math.round(amount*(1+.3*level(r,'fortune'))*(r.modifier==='frenzy'?1.2:1)));m.coins+=n;r.earned+=n;return n;}
function strike(m,requests,events){
 const r=m.run;if(!r)return;
 const queue=requests.slice();let safety=0;
 while(queue.length&&safety++<200){
  const {id,amount,kind='hit',poison=false}=queue.shift(),e=r.enemies.find(e=>e.id===id);if(!e||e.hp<=0)continue;
  let dealt=amount*(1+(e.curse||0)*.08*level(r,'curse'));
  if(kind!=='poison'){
   if(e.guard>0){dealt*=.35;e.guard--;events.push({type:'shield',x:e.x,y:e.y});}
   if(e.type===13&&e.clock%4<1)dealt*=.4;
   if(e.type===18&&e.clock%6<1.5)dealt*=.6;
   if(r.enemies.some(n=>n.id!==e.id&&n.type===14&&Math.hypot(n.x-e.x,n.y-e.y)<.24))dealt*=.65;
  }
  e.hp-=dealt;e.hit=.13;
  if(poison&&level(r,'poison')){e.poison=Math.min(damage(m,r)*3,e.poison+damage(m,r)*.28*level(r,'poison'));e.poisonTime=4;}
  if(level(r,'frost')&&kind!=='poison')e.slow=Math.min(2,.4+level(r,'frost')*.3);
  if(level(r,'execute')&&kind!=='poison'&&e.hp/e.max<(e.boss?.04:.2)*level(r,'execute'))e.hp=0;
  events.push({type:'damage',x:e.x,y:e.y,amount:dealt,kind});
  if(e.hp>0)continue;
  const coin=giveCoins(m,r,(e.type===5||e.type===20)?12:e.boss?20:1+Math.floor(r.wave/4));
  r.kills++;m.kills++;r.resolved++;
  if(e.boss){const shards=1+Math.floor(r.wave/10);m.shards+=shards;events.push({type:'shards',amount:shards,x:e.x,y:e.y});}
  events.push({type:'kill',x:e.x,y:e.y,coin,boss:e.boss,color:e.type});
  if(level(r,'vampire')&&r.kills%12===0)r.hp=Math.min(r.maxHp,r.hp+level(r,'vampire'));
  r.enemies=r.enemies.filter(other=>other.id!==e.id);
  if(e.type===11&&!e.mini){for(let k=0;k<2;k++)addMinion(r,e,11);events.push({type:'split',x:e.x,y:e.y});}
  if((level(r,'venom')||level(r,'poison')>=3)&&e.poisonTime>0){
   events.push({type:'burst',x:e.x,y:e.y,color:'#c38dff',radius:.24});
   for(const n of r.enemies)if(Math.hypot(n.x-e.x,(n.y-e.y)*1.5)<.25)queue.push({id:n.id,amount:damage(m,r)*Math.max(.5,level(r,'venom')),kind:'poison',poison:true});
  }
 }
}
function attack(m,id,rng=Math.random,automatic=false){
 const r=m.run,events=[];if(!r||r.phase!=='fight')return events;
 const e=r.enemies.find(e=>e.id===id);if(!e)return events;
 const base=damage(m,r)*(automatic?.7*(1+m.upgrades.pet*.15):1);
 const crit=rng()<Math.min(.75,.05+level(r,'crit')*.12);
 const amount=base*(crit?3:1);
 if(!automatic){r.combo=r.time-r.lastHit<1.2?r.combo+1:1;r.lastHit=r.time;r.bestCombo=Math.max(r.combo,r.bestCombo);}
 if(level(r,'curse'))e.curse=Math.min(5,(e.curse||0)+1);
 r.hits++;if(crit&&level(r,'prism')){r.frostCD=Math.max(0,r.frostCD-level(r,'prism')*.5);r.furyCD=Math.max(0,r.furyCD-level(r,'prism')*.5);}
 const targets=[{id,amount,kind:crit?'crit':'hit',poison:true}],others=r.enemies.filter(n=>n.id!==id);
 if(level(r,'blast')){
  events.push({type:'burst',x:e.x,y:e.y,color:'#ffb573',radius:.19});
  for(const n of others)if(Math.hypot(n.x-e.x,(n.y-e.y)*1.5)<(level(r,'blast')>=3?.33:.22))targets.push({id:n.id,amount:base*.35*level(r,'blast')*(level(r,'frost')&&n.slow>0?2:1),kind:'fire',poison:true});
 }
 if(level(r,'chain')&&(level(r,'chain')>=3||rng()<.45)){
  for(const n of others.slice().sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y)).slice(0,2*level(r,'chain'))){
   events.push({type:'bolt',x:e.x,y:e.y,x2:n.x,y2:n.y});
   targets.push({id:n.id,amount:base*.65*(1+level(r,'prism')*.5),kind:'lightning',poison:true});
  }
 }
 if(level(r,'echo')&&r.hits%3===0){
  for(const n of others.slice(0,level(r,'echo'))){targets.push({id:n.id,amount:base,kind:'echo',poison:true});events.push({type:'bolt',x:e.x,y:e.y,x2:n.x,y2:n.y,color:'#a5ffe3'});}
 }
 if(!automatic&&r.combo>0&&r.combo%15===0){giveCoins(m,r,3);events.push({type:'combo',amount:r.combo});}
 if(level(r,'boomerang')&&r.hits%5===0){
  events.push({type:'glaive',x:e.x,y:e.y});
  for(const n of others.slice(0,2*level(r,'boomerang')))targets.push({id:n.id,amount:base*1.1,kind:'echo',poison:true});
 }
 if(level(r,'resonance')&&!automatic&&r.hits%10===0){
  const elements=['chain','blast','poison','frost'].filter(id=>level(r,id)>0).length;
  events.push({type:'nova',x:e.x,y:e.y});
  for(const n of others)targets.push({id:n.id,amount:base*level(r,'resonance')*(1+elements*.3),kind:'void'});
 }
 strike(m,targets,events);return events;
}
function ability(m,id){
 const r=m.run,events=[];if(!r||r.phase!=='fight')return events;
 if(id==='frost'&&r.frostCD<=0){r.freeze=3+level(r,'timeslip');r.frostCD=Math.max(6,15-level(r,'haste'));events.push({type:'freeze'});}
 if(id==='fury'&&r.furyCD<=0){r.fury=6+2*level(r,'timeslip');r.furyCD=Math.max(12,24-level(r,'haste'));events.push({type:'fury'});}
 return events;
}
function step(m,dt,rng=Math.random){
 const r=m.run,events=[];if(!r||r.phase!=='fight')return events;
 dt=bound(dt,0,.1);r.time+=dt;r.spawnClock+=dt;r.petClock+=dt;r.meteorClock+=dt;r.vortexClock+=dt;
 for(const k of ['freeze','fury','frostCD','furyCD','vortexTime'])r[k]=Math.max(0,r[k]-dt);
 if(r.combo&&r.time-r.lastHit>1.2)r.combo=0;
 updateSpecials(m,dt,events);
 const interval=Math.max(.19,.78-r.wave*.019);
 if(r.spawned<r.target&&r.spawnClock>=interval&&r.enemies.length<45){r.spawnClock=0;const e=spawn(r,rng);if(e.boss)events.push({type:'boss',enemyType:e.type});}
 const poison=[];
 for(const e of r.enemies){
  e.hit=Math.max(0,e.hit-dt);e.slow=Math.max(0,e.slow-dt);
  e.clock=(e.clock||0)+dt;e.haste=Math.max(0,(e.haste||0)-dt);
  e.y+=e.speed*dt*(r.freeze>0?.08:e.slow>0?.48:1)*(e.haste>0?1.45:1);
  if(r.vortexTime>0){e.x+=(.5-e.x)*dt*1.4;e.y+=(.34-e.y)*dt*1.3;}
  if(r.modifier==='eclipse')e.hp=Math.min(e.max,e.hp+e.max*.008*dt);
  if(e.poisonTime>0){e.poisonTime-=dt;poison.push({id:e.id,amount:e.poison*dt,kind:'poison'});}
 }
 if(poison.length)strike(m,poison,events);
 for(const e of r.enemies.slice()){
  if(e.y<.91)continue;r.enemies=r.enemies.filter(n=>n.id!==e.id);r.resolved++;r.hp-=e.boss?3:e.type===16?2:1;events.push({type:'hurt'});
 }
 if(r.hp<=0){
  if(r.revives<level(r,'phoenix')){
   r.revives++;r.hp=Math.ceil(r.maxHp/2);r.freeze=2;events.push({type:'revive'});
   strike(m,r.enemies.map(e=>({id:e.id,amount:damage(m,r)*8,kind:'fire'})),events);
  }else{r.hp=0;r.phase='over';events.push({type:'over'});return events;}
 }
 const petInterval=Math.max(.15,1.15*Math.pow(.8,level(r,'haste'))/(1+m.upgrades.pet*.03));
 if(r.petClock>=petInterval&&r.enemies.length){
  r.petClock=0;
  const targets=r.enemies.slice().sort((a,b)=>b.y-a.y).slice(0,1+level(r,'familiar'));
  for(const e of targets){events.push({type:'pet',x:e.x,y:e.y});events.push(...attack(m,e.id,rng,true));}
 }
 if(level(r,'meteor')&&r.meteorClock>=6&&r.enemies.length){
  r.meteorClock=0;const e=r.enemies.reduce((a,b)=>a.y>b.y?a:b);
  events.push({type:'meteor',x:e.x,y:e.y});
  strike(m,r.enemies.filter(n=>Math.hypot(n.x-e.x,(n.y-e.y)*1.5)<.35).map(n=>({id:n.id,amount:damage(m,r)*6*level(r,'meteor'),kind:'fire'})),events);
 }
 if(level(r,'vortex')&&r.vortexClock>=8&&r.enemies.length){
  r.vortexClock=0;r.vortexTime=3;events.push({type:'vortex'});
  for(const e of r.enemies)e.y=Math.max(-.08,e.y-.15);
  strike(m,r.enemies.map(n=>({id:n.id,amount:damage(m,r)*3*level(r,'vortex'),kind:'void'})),events);
 }
 if(r.spawned===r.target&&r.enemies.length===0){
  m.best=Math.max(m.best,r.wave);const coin=giveCoins(m,r,8+r.wave*2);if(r.wave%5===0)m.shards++;
  r.phase='draft';r.offers=drawCards(m,r,rng);events.push({type:'wave',wave:r.wave,coin});
 }
 // Poison ticks are visually sampled to keep effects lightweight.
 return events.filter(e=>e.kind!=='poison'||rng()<.06);
}
function updateSpecials(m,dt,events){
 const r=m.run;
 r.extraClock=(r.extraClock||0)+dt;
 if(r.modifier==='eclipse'){r.frostCD=Math.max(0,r.frostCD-dt*.3);r.furyCD=Math.max(0,r.furyCD-dt*.3);}
 if(r.vortexTime>0&&r.vortexTime<=dt&&level(r,'singularity')){
  events.push({type:'collapse',x:.5,y:.34});
  strike(m,r.enemies.map(e=>({id:e.id,amount:damage(m,r)*6*level(r,'singularity'),kind:'void'})),events);
 }
 // Independent periodic skills use clock crossings, so saving cannot trigger free casts.
 const crossed=seconds=>Math.floor(r.extraClock/seconds)!==Math.floor((r.extraClock-dt)/seconds);
 const danger=()=>r.enemies.slice().sort((a,b)=>b.y-a.y);
 if(level(r,'orbit')&&crossed(2.4)&&r.enemies.length){
  events.push({type:'orbit',x:.5,y:.65});
  strike(m,danger().slice(0,3+level(r,'orbit')).map(e=>({id:e.id,amount:damage(m,r)*1.4*level(r,'orbit'),kind:'echo'})),events);
 }
 if(level(r,'laser')&&crossed(3.5)&&r.enemies.length){
  const target=danger()[0];events.push({type:'laser',x:target.x,y:target.y});
  strike(m,r.enemies.filter(e=>Math.abs(e.x-target.x)<.10+.02*level(r,'laser')).map(e=>({id:e.id,amount:damage(m,r)*4*level(r,'laser'),kind:'lightning'})),events);
 }
 if(level(r,'storm')&&crossed(5)&&r.enemies.length){
  for(const e of danger().slice(0,3+level(r,'storm'))){
   events.push({type:'thunder',x:e.x,y:e.y});
   strike(m,[{id:e.id,amount:damage(m,r)*2.5*level(r,'storm'),kind:'lightning'}],events);
  }
 }
 if(level(r,'thorns')&&crossed(1)){
  const near=r.enemies.filter(e=>e.y>.64);
  if(near.length)events.push({type:'thorns',x:.5,y:.8});
  strike(m,near.map(e=>({id:e.id,amount:damage(m,r)*level(r,'thorns'),kind:'poison'})),events);
 }
 if(level(r,'mines')&&crossed(5)){
  for(const x of [.22,.5,.78])if(r.mines.length<6)r.mines.push({x,y:.66,life:10});
 }
 for(const mine of r.mines.slice()){
  mine.life-=dt;
  if(r.enemies.some(e=>Math.hypot(e.x-mine.x,(e.y-mine.y)*1.5)<.15)){
   mine.life=0;events.push({type:'iceMine',x:mine.x,y:mine.y});
   const nearby=r.enemies.filter(e=>Math.hypot(e.x-mine.x,(e.y-mine.y)*1.5)<.24);for(const e of nearby)e.slow=3;
   strike(m,nearby.map(e=>({id:e.id,amount:damage(m,r)*3*level(r,'mines'),kind:'ice'})),events);
  }
 }
 r.mines=r.mines.filter(mine=>mine.life>0);
 for(const e of r.enemies.slice()){
  const prev=e.clock||0,next=prev+dt;
  const pulse=seconds=>Math.floor(prev/seconds)!==Math.floor(next/seconds);
  if((e.type===9||e.type===16)&&pulse(e.type===9?3:2.5)){
   const healed=e.type===9?r.enemies.filter(n=>Math.hypot(n.x-e.x,n.y-e.y)<.3):[e];
   for(const n of healed)n.hp=Math.min(n.max,n.hp+n.max*.09);
   events.push({type:'heal',x:e.x,y:e.y});
  }
  if(e.type===12&&pulse(3)){const before=e.x;e.x=.1+((e.x+.37)%.8);e.y=Math.min(.83,e.y+.035);events.push({type:'blink',x:before,y:e.y,x2:e.x});}
  if(e.type===15&&pulse(3.2)){
   for(const n of r.enemies)if(Math.hypot(n.x-e.x,n.y-e.y)<.3)n.haste=1.5;
   events.push({type:'enemyStorm',x:e.x,y:e.y});
  }
  if(e.type===17&&pulse(4)){addMinion(r,e,r.bonusSpawned%2?9:11);events.push({type:'summon',x:e.x,y:e.y});}
  if(e.type===18&&Math.floor(prev%4*2)!==Math.floor(next%4*2)&&next%4<.55)events.push({type:'warning',x:e.x,y:e.y});
  if(e.type===18&&pulse(4)){e.y=Math.min(.84,e.y+.075);events.push({type:'enemyDash',x:e.x,y:e.y});}
  if(e.type===19&&pulse(5)){
   for(const n of r.enemies)if(!n.boss)n.y=Math.min(.85,n.y+.045);
   events.push({type:'enemyRift',x:e.x,y:e.y});
  }
 }
}
function claimMilestone(m,id){const d=milestones.find(x=>x.id===id);if(!d||m.claimed.includes(id)||!d.goal(m))return false;m.claimed.push(id);m.coins+=d.reward.coins;m.shards+=d.reward.shards;return true;}
const api={conditions,realms,enemyNames,realm,condition,waveTarget,cards,upgrades,milestones,fresh,normalize,accrue,claimIdle,idleRate,upgradeCost,buy,start,damage,drawCards,choose,reroll,spawn,attack,ability,step,claimMilestone};
if(typeof module!=='undefined')module.exports=api;root.Slime=api;
})(globalThis);
