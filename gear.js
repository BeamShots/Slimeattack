/* Equipment is escrowed in run.pendingGear. Only a victorious wave banks it. */
(function(root){
'use strict';
const slots=['sword','chest','helmet','ring','boots'];
const slotNames={sword:'Sword',chest:'Chest armor',helmet:'Helmet',ring:'Ring',boots:'Boots'};
const rarities=[{name:'Common',color:'#a3b2aa'},{name:'Uncommon',color:'#7dbb82'},{name:'Rare',color:'#60aeda'},{name:'Epic',color:'#b38cdb'},{name:'Legendary',color:'#efb44f'},{name:'Mythic',color:'#e67e99'}];
const sets=[{name:'Woodland',desc:'3 pieces: +25% income'},{name:'Ember',desc:'3 pieces: +30% strength'},{name:'Crystal',desc:'3 pieces: +15% speed'}];
const cache=new WeakMap();
function fresh(){return {items:[],equipped:Object.fromEntries(slots.map(s=>[s,null])),scrap:0,nextId:1,found:0,recycled:0,unseen:0,autoRecycle:true,revision:0};}
const num=(n,d=0)=>Number.isFinite(n)?Math.max(0,n):d;
function item(raw,pending=false){if(!raw||!slots.includes(raw.slot))return null;const r={slot:raw.slot,rarity:Math.min(5,Math.floor(num(raw.rarity))),tier:Math.max(1,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(num(raw.tier,1)))),set:Math.min(2,Math.floor(num(raw.set))),level:Math.min(Number.MAX_SAFE_INTEGER,Math.floor(num(raw.level))),quality:Math.max(90,Math.min(110,Math.floor(num(raw.quality,100)))),favorite:raw.favorite===true};if(!pending)r.id=Math.floor(num(raw.id));return r;}
function normalize(raw){
 const g=fresh();if(!raw||typeof raw!=='object')return g;
 const seen=new Set();for(const value of Array.isArray(raw.items)?raw.items:[]){const i=item(value);if(i&&Number.isSafeInteger(i.id)&&i.id>0&&i.id<Number.MAX_SAFE_INTEGER&&!seen.has(i.id)){g.items.push(i);seen.add(i.id);}}
 for(const slot of slots){const id=raw.equipped?.[slot];if(g.items.some(i=>i.id===id&&i.slot===slot))g.equipped[slot]=id;}
 for(const k of ['scrap','found','recycled','unseen','revision'])g[k]=Math.floor(num(raw[k]));
 g.nextId=g.items.reduce((value,i)=>Math.max(value,i.id+1),Math.max(1,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(num(raw.nextId,1)))));g.autoRecycle=raw.autoRecycle!==false;return g;
}
function statsFor(i){
 const multiplier=i.tier*[1,1.4,2.1,3.2,5,8][i.rarity]*(i.quality/100)*(1+.08*i.level),s={strength:0,health:0,armor:0,income:0,speed:0,luck:0};
 if(i.slot==='sword')s.strength=12*multiplier;
 if(i.slot==='chest'){s.health=Math.ceil(2*multiplier);s.armor=3*multiplier;}
 if(i.slot==='helmet'){s.health=Math.ceil(multiplier);s.luck=2*multiplier;}
 if(i.slot==='ring'){s.income=10*multiplier;s.luck=multiplier;}
 if(i.slot==='boots'){s.speed=2*multiplier;s.income=3*multiplier;}
 return s;
}
function stats(m){
 const g=m.gear;if(!g)return {strength:0,health:0,armor:0,income:0,speed:0,luck:0,reduction:0,sets:[0,0,0]};
 const old=cache.get(g);if(old?.revision===g.revision)return old.value;
 const s={strength:0,health:0,armor:0,income:0,speed:0,luck:0,reduction:0,sets:[0,0,0]};
 for(const slot of slots){const i=g.items.find(i=>i.id===g.equipped[slot]);if(!i)continue;const values=statsFor(i);for(const k in values)s[k]+=values[k];s.sets[i.set]++;}
 if(s.sets[0]>=3)s.income+=25;if(s.sets[1]>=3)s.strength+=30;if(s.sets[2]>=3)s.speed+=15;
 s.reduction=Math.min(.6,s.armor/(100+s.armor));cache.set(g,{revision:g.revision,value:s});return s;
}
function random(r){r.lootSeed=(Math.imul(r.lootSeed>>>0,1664525)+1013904223)>>>0;return r.lootSeed/4294967296;}
function roll(m,r,e){
 r.lootPity=(r.lootPity||0)+1;const luck=1+Math.min(1,stats(m).luck/100),chance=(e.boss?.4:e.elite?.016:.006)*luck;
 const first=m.gear.found===0&&!r.pendingGear.length&&r.kills>=15;
 if(random(r)>=chance&&!first&&r.lootPity<180)return null;
 r.lootPity=0;const value=random(r)*(e.boss?.75:1),rarity=value<.002?5:value<.018?4:value<.08?3:value<.24?2:value<.55?1:0;
 const i={slot:slots[Math.floor(random(r)*5)],rarity,tier:1+Math.floor(Math.sqrt(r.wave)/6),set:Math.floor(random(r)*3),level:0,quality:90+Math.floor(random(r)*21),favorite:false};
 r.pendingGear.push(i);return i;
}
function recycleValue(i){return Math.ceil((i.rarity+1)*i.tier*(1+i.level*.3));}
function score(i){const s=statsFor(i);return s.strength+s.health*5+s.armor*3+s.income+s.speed*3+s.luck*2;}
function bank(m,r){
 if(r.phase!=='draft'||!r.pendingGear?.length)return {count:0,recycled:0,kept:0};
 const pending=r.pendingGear;r.pendingGear=[];let recycled=0,kept=0;
 for(const source of pending){const i={...source,id:m.gear.nextId++};m.gear.found++;
  const duplicate=m.gear.items.some(other=>other.slot===i.slot&&other.set===i.set&&score(other)>=score(i));
  if(m.gear.autoRecycle&&i.rarity===0&&!i.favorite&&duplicate){m.gear.scrap+=recycleValue(i);m.gear.recycled++;recycled++;}
  else{m.gear.items.push(i);m.gear.unseen++;kept++;}
 }
 m.gear.revision++;return {count:pending.length,recycled,kept};
}
function refreshHealth(m,old){if(!m.run||m.expedition.state==='blocked')return;const delta=stats(m).health-old;if(!delta)return;const r=m.run,ratio=r.hp/Math.max(1,r.maxHp);r.maxHp=Math.max(1,r.maxHp+delta);r.hp=Math.max(0,r.maxHp*ratio);}
function equip(m,id){const i=m.gear.items.find(i=>i.id===id);if(!i)return false;const old=stats(m).health;m.gear.equipped[i.slot]=id;m.gear.revision++;refreshHealth(m,old);return true;}
function unequip(m,slot){if(!slots.includes(slot)||!m.gear.equipped[slot])return false;const old=stats(m).health;m.gear.equipped[slot]=null;m.gear.revision++;refreshHealth(m,old);return true;}
function equipBest(m){let changed=0;for(const slot of slots){const best=m.gear.items.filter(i=>i.slot===slot).sort((a,b)=>score(b)-score(a))[0];if(best&&m.gear.equipped[slot]!==best.id){equip(m,best.id);changed++;}}return changed;}
function favorite(m,id){const i=m.gear.items.find(i=>i.id===id);if(!i)return false;i.favorite=!i.favorite;m.gear.revision++;return true;}
function recycle(m,id){const i=m.gear.items.find(i=>i.id===id);if(!i||i.favorite||Object.values(m.gear.equipped).includes(id))return false;m.gear.items=m.gear.items.filter(i=>i.id!==id);m.gear.scrap+=recycleValue(i);m.gear.recycled++;m.gear.revision++;return true;}
function recycleExtras(m){
 const best=new Set(slots.map(slot=>m.gear.items.filter(i=>i.slot===slot).sort((a,b)=>score(b)-score(a))[0]?.id));let count=0;
 for(const i of m.gear.items.slice())if(i.rarity<=1&&!best.has(i.id)&&recycle(m,i.id))count++;return count;
}
function cost(i){return Math.ceil((3+i.tier)*Math.pow(i.level+1,1.6)*(1+i.rarity*.3));}
function upgrade(m,id){const i=m.gear.items.find(i=>i.id===id);if(!i||m.gear.scrap<cost(i))return false;const old=stats(m).health;m.gear.scrap-=cost(i);i.level++;m.gear.revision++;refreshHealth(m,old);return true;}
const api={slots,slotNames,rarities,sets,fresh,normalize,item,stats,statsFor,roll,bank,score,equip,unequip,equipBest,favorite,recycle,recycleExtras,recycleValue,cost,upgrade};if(typeof module!=='undefined')module.exports=api;root.Equipment=api;
})(globalThis);
