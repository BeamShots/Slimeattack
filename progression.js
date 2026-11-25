/* Simple screens using the original saved upgrades and connected talent paths. */
(function(root){
'use strict';
const T=typeof module!=='undefined'?require('./tree.js'):root.SkillTree;
const G=typeof module!=='undefined'?require('./gear.js'):root.Equipment;
const talents=[
 {id:'attack',name:'Strength',branch:0,icon:0,benefit:'+12% attack'},
 {id:'health',name:'Health',branch:2,icon:8,benefit:'+1 health'},
 {id:'spirit',name:'Companion',branch:1,icon:7,benefit:'+3% attack speed'},
 {id:'coins',name:'More coins',branch:3,icon:11,benefit:'+8% coins'},
 {id:'craft',name:'Rune magic',branch:4,icon:28,benefit:'+5% forge rewards'},
 {id:'portals',name:'Wormhole',branch:5,icon:18,benefit:'+4% wormhole power'},
 {id:'solar',name:'Sun strike',branch:0,icon:30,cap:true,benefit:'A stronger solar strike'},
 {id:'recovery',name:'Recovery',branch:2,icon:8,cap:true,benefit:'Heal after each wave'},
 {id:'rift',name:'Rift surge',branch:5,icon:18,cap:true,benefit:'Stronger lasting wormholes'}
];
function lesson(m,id){
 const d=talents.find(t=>t.id===id);if(!d)return null;
 const owned=m.tree.nodes;let level=0,depth=0;
 for(const [key,rank]of Object.entries(owned)){const n=T.node(key);if(n?.branch===d.branch){level+=d.cap?(n.cap?rank:0):rank;if(!n.fork)depth=Math.max(depth,n.depth);}}
 let ids=[];
 if(d.cap){const end=(Math.floor(depth/5)+1)*5;for(let i=depth+1;i<=end;i++)ids.push(d.branch+':'+i+':0');}
 else{
  const options=[];for(let i=1;i<=depth+1;i++)for(let f=0;f<3;f++){const key=d.branch+':'+i+':'+f,n=T.node(key);if(n&&(owned[key]||0)<n.max&&(n.parent==='core'||owned[n.parent]))options.push(n);}
  options.sort((a,b)=>T.price(m,a.id)-T.price(m,b.id)||a.depth-b.depth||a.fork-b.fork);if(options[0])ids=[options[0].id];
 }
 const cost=ids.length?ids.reduce((sum,key)=>sum+T.price(m,key),0):Infinity;
 return {...d,level,ids,cost,ready:ids.length>0&&T.available(m)>=cost};
}
function learn(m,id){const l=lesson(m,id);return !!l&&T.buyBatch(m,l.ids);}
function heroNext(m,E){const candidates=['blade','hull','pet'].filter(id=>m.upgrades[id]<E.upgrades[id].max).sort((a,b)=>m.upgrades[a]-m.upgrades[b]);const id=candidates[0];return id?{id,cost:E.upgradeCost(m,id),benefit:{blade:'Strength +1',hull:'Health +1',pet:'Companion damage +15%'}[id],ready:m.coins>=E.upgradeCost(m,id)}:null;}
function previewHealth(m,E){const r=m.run;if(!r)return E.startingHealth(m);if(m.expedition.state==='blocked'){const ward=m.upgrades.hull+m.forge.perks.ward+T.stats(m).health+G.stats(m).health;return Math.min(E.healthCap(m),Math.max(1,r.maxHp+ward-m.expedition.wardLevel));}return r.phase==='over'?Math.min(E.healthCap(m),Math.max(r.maxHp,E.startingHealth(m))):r.maxHp;}
function heroLevel(m){return 1+m.upgrades.blade+m.upgrades.hull+m.upgrades.pet;}
function upgradeHero(m,E){const n=heroNext(m,E);if(!n||!E.buy(m,n.id))return false;if(n.id==='hull'&&m.run&&m.expedition.state!=='blocked'&&['fight','draft'].includes(m.run.phase)){const old=m.run.maxHp;m.run.maxHp=Math.min(E.healthCap(m),old+1);m.run.hp=Math.min(m.run.maxHp,m.run.hp+m.run.maxHp-old);}return true;}
const api={talents,lesson,learn,heroNext,heroLevel,upgradeHero,previewHealth};if(typeof module!=='undefined')module.exports=api;root.Progression=api;
})(globalThis);
