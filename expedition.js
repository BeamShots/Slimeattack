/* Deterministic combat simulation. A failed wave is a rolled-back transaction.
   Cleared waves commit once. Work is sliced; elapsed time is never capped. */
(function(root){
'use strict';
const T=typeof module!=='undefined'?require('./tree.js'):root.SkillTree;
const G=typeof module!=='undefined'?require('./gear.js'):root.Equipment;
const copy=o=>JSON.parse(JSON.stringify(o));
function fresh(now=Date.now()){return {enabled:true,state:'ready',lastAt:now,carry:0,seed:734921,trial:null,blockedWave:0,wardLevel:0,style:'balanced',report:{from:0,to:0,cleared:0,coins:0,shards:0,kills:0,failed:0,items:0,seconds:0}};}
function normalize(raw,now=Date.now()){
 const x=fresh(now);if(!raw||typeof raw!=='object')return x;
 x.enabled=raw.enabled!==false;x.state=raw.state==='blocked'?'blocked':'ready';
 for(const k of ['lastAt','carry','seed','blockedWave','wardLevel'])if(Number.isFinite(raw[k]))x[k]=Math.max(0,raw[k]);
 x.seed=x.seed>>>0;
 if(['balanced','power','sustain'].includes(raw.style))x.style=raw.style;
 for(const k in x.report)if(Number.isFinite(raw.report?.[k]))x.report[k]=Math.max(0,raw.report[k]);
 // Engine validation of the trial run happens before its first use.
 if(raw.trial&&typeof raw.trial==='object')x.trial=raw.trial;
 return x;
}
function rng(x){x.seed=(Math.imul(x.seed,1664525)+1013904223)>>>0;return x.seed/4294967296;}
function pick(m,E,r){
 const healing=r.hp/r.maxHp<.55,style=m.expedition.style;
 const priority=['eternal','mastery','starlore','power','infinity','entropy','starfall','haste','familiar','chain','vortex','singularity','meteor','storm','blast','poison','venom','orbit','laser','crit','execute','fortune'];
 return r.offers.slice().sort((a,b)=>score(b)-score(a))[0];
 function score(id){
  if(['mend','vampire','phoenix','oath'].includes(id))return (healing?100:style==='sustain'?42:8)+(id==='mend'?r.maxHp-r.hp:0);
  const c=E.cards.find(c=>c.id===id);return 60-Math.max(0,priority.indexOf(id))*2-(priority.includes(id)?0:45)+(style==='power'&&['power','infinity'].includes(id)?30:0)+(c?.requires?5:0);
 }
}
function collectDrops(m,E){
 const r=m.run,events=[];if(!r||!['fight','draft'].includes(r.phase))return events;
 for(const p of r.pickups.slice())events.push(...E.collect(m,p.id,true));return events;
}
function pilot(m,E,dt,random=Math.random){
 const r=m.run,events=[];if(!r||r.phase!=='fight')return events;
 events.push(...collectDrops(m,E));
 r.pilotClock=(r.pilotClock||0)+dt;
 const interval=Math.max(.08,.25/(1+.03*T.stats(m).spirit)/(1+G.stats(m).speed/100));
 if(r.pilotClock>=interval){
  r.pilotClock%=interval;
  const e=r.enemies.slice().sort((a,b)=>b.y-a.y)[0];
  if(e){
   events.push(...E.ability(m,'frost'),...E.ability(m,'fury'));
   if(r.energy>=100)events.push(...E.soulBurst(m));
   if(r.enemies.length>=3&&r.slashCD<=0)events.push(...E.swipe(m,r.enemies.slice().sort((a,b)=>b.y-a.y).slice(0,8).map(e=>({x:e.x,y:e.y}))));
   const target=r.enemies.slice().sort((a,b)=>b.y-a.y)[0];
   if(target)events.push(...E.attack(m,target.id,random,false,target.parryTime>0||target.weakTime>0?'tap':'hold'));
   events.push(...collectDrops(m,E));
  }
 }
 return events;
}
function addElapsed(m,now=Date.now()){
 const x=m.expedition;if(now<x.lastAt)return;
 if(x.enabled&&x.state!=='blocked'&&m.run&&m.run.phase!=='over')x.carry+=(now-x.lastAt)/1000;
 x.lastAt=now;
}
function shadow(m,E){
 const x=m.expedition;
 if(!x.trial){x.wardLevel=m.upgrades.hull+m.forge.perks.ward+T.stats(m).health+G.stats(m).health;x.trial={run:copy(m.run),coins:0,shards:0,kills:0};}
 const t=x.trial;
 if(!t.validated){
  try{t.run=E.normalizeRun(t.run,m);if(!['fight','draft'].includes(t.run.phase))throw Error('Invalid trial');}
  catch{x.trial=null;return shadow(m,E);}
  for(const k of ['coins','shards','kills'])t[k]=Number.isFinite(t[k])?Math.max(0,t[k]):0;
  Object.defineProperty(t,'validated',{value:true,enumerable:false});
 }
 return {...m,run:t.run,coins:t.coins,shards:t.shards,kills:t.kills};
}
function commit(m,t){m.coins+=t.coins;m.shards+=t.shards;m.kills+=t.kills;m.run=t.run;m.best=Math.max(m.best,t.best||0);}
function settle(m,E,F,budget=4000){
 const x=m.expedition;let steps=0;
 if(!x.enabled||x.state==='blocked'||!m.run||m.run.phase==='over'){x.carry=0;return false;}
 while(x.carry>=.1-1e-8&&steps<budget){
  if(m.run.phase==='draft'&&!x.trial){E.choose(m,pick(m,E,m.run),()=>rng(x));continue;}
  const s=shadow(m,E),t=x.trial;
  const gearBefore=m.gear.found;pilot(s,E,.1,()=>rng(x));E.step(s,.1,()=>rng(x));collectDrops(s,E);
  t.run=s.run;t.coins=s.coins;t.shards=s.shards;t.kills=s.kills;t.best=s.best;
  x.carry=Math.max(0,x.carry-.1);x.report.seconds+=.1;steps++;
  if(t.run.phase==='over'){
   x.state='blocked';x.blockedWave=m.run.wave;x.report.failed=m.run.wave;m.run.pendingGear=[];x.trial=null;x.carry=0;break;
  }
  if(t.run.phase==='draft'){
   const w=t.run.wave;if(!x.report.from)x.report.from=w;
   x.report.to=w;x.report.cleared++;x.report.items+=m.gear.found-gearBefore;x.report.coins+=t.coins;x.report.kills+=t.kills;x.report.shards+=t.shards;
   commit(m,t);F.wave(m,w);x.trial=null;E.choose(m,pick(m,E,m.run),()=>rng(x));
  }
 }
 return x.carry>=.1-1e-8&&x.state!=='blocked';
}
function takeControl(m){
 const x=m.expedition;if(x.trial){commit(m,x.trial);x.trial=null;}x.carry=0;x.lastAt=Date.now();
}
function EarlyHealth(m){return 100+T.stats(m).health+G.stats(m).health;}
function retry(m,now=Date.now()){
 const x=m.expedition;if(x.state!=='blocked'||!m.run)return false;
 const ward=m.upgrades.hull+m.forge.perks.ward+T.stats(m).health+G.stats(m).health;
 m.run.maxHp=Math.min(EarlyHealth(m),Math.max(1,m.run.maxHp+ward-x.wardLevel));m.run.hp=m.run.maxHp;
 x.wardLevel=ward;x.state='ready';x.trial=null;x.carry=0;x.blockedWave=0;x.report=fresh().report;x.lastAt=now;return true;
}
function retryFallen(m,E,now=Date.now()){
 const r=m.run;if(!r||r.phase!=='over')return false;
 r.phase='fight';r.maxHp=Math.min(EarlyHealth(m),Math.max(r.maxHp,5+m.upgrades.hull+m.forge.perks.ward+T.stats(m).health+G.stats(m).health));r.hp=r.maxHp;
 r.pendingGear=[];r.enemies=[];r.spawned=0;r.resolved=0;r.target=E.waveTarget(r.wave);r.bonusSpawned=0;r.pickups=[];r.mines=[];r.offers=[];r.spawnClock=.7;r.revives=0;r.frostCD=0;r.furyCD=0;
 const enabled=m.expedition.enabled,style=m.expedition.style;m.expedition=fresh(now);m.expedition.enabled=enabled;m.expedition.style=style;return true;
}
function resetReport(m){m.expedition.report=fresh().report;}
const api={fresh,normalize,pick,pilot,collectDrops,addElapsed,settle,takeControl,retry,retryFallen,resetReport};
if(typeof module!=='undefined')module.exports=api;root.Expedition=api;
})(globalThis);
