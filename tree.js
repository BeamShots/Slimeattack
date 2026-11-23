/* A procedurally extended hex atlas. Prerequisites and point spending are model rules. */
(function(root){
'use strict';
const branches=[
 {name:'Attack',color:'#f38467',symbol:'✦',desc:'Stronger attacks and solar bursts.',keystone:'Solar flare'},
 {name:'Spirit',color:'#62b9df',symbol:'➶',desc:'Faster helpers, attacks and better catches.',keystone:'Spirit choir'},
 {name:'Health',color:'#73bf84',symbol:'♥',desc:'A stronger ward and steady recovery.',keystone:'Living ward'},
 {name:'Coins',color:'#e5b64d',symbol:'●',desc:'More coins from battles and the sanctuary.',keystone:'Golden harvest'},
 {name:'Craft',color:'#b19bdf',symbol:'⚒',desc:'More sparks and better guild rewards.',keystone:'Master artisan'},
 {name:'Portals',color:'#df92bc',symbol:'◎',desc:'Longer, stronger and faster wormholes.',keystone:'Rift tide'}
];
const directions=[[0,-1],[1,-1],[1,0],[0,1],[-1,1],[-1,0]];
const cache=new WeakMap();
function fresh(){return {nodes:{},spent:0,bonus:0,revision:0,tasks:[{kind:'kills',base:0,round:0},{kind:'merges',base:0,round:0},{kind:'stars',base:0,round:0}],camera:null};}
function integer(n,defaultValue=0){return Number.isFinite(n)?Math.max(0,Math.floor(n)):defaultValue;}
function decode(id){const m=/^([0-5]):([1-9][0-9]*):([012])$/.exec(id);if(!m||+m[2]>1e6)return null;return {branch:+m[1],depth:+m[2],fork:+m[3]};}
function node(id){
 const d=decode(id);if(!d)return null;const {branch:b,depth, fork}=d,def=branches[b],dir=directions[b];
 let q=dir[0]*depth*3,r=dir[1]*depth*3;
 if(fork){const side=directions[(b+(fork===1?5:1))%6];q+=side[0];r+=side[1];}
 const cap=fork===0&&depth%5===0;
 return {...d,id,x:Math.sqrt(3)*(q+r/2)*58,y:r*87,max:fork?3:1,cap,
 parent:fork?b+':'+depth+':0':depth===1?'core':b+':'+(depth-1)+':0',
 name:cap?def.keystone+' '+depth/5:fork===1?def.name+' boost '+depth:fork===2?def.name+' mastery '+depth:def.name+' trail '+depth,
 cost:1+Math.floor((depth-1)/4)+(fork?1:0),symbol:cap?'★':def.symbol,
 desc:cap?['Unlock a periodic solar strike. More keystones make it stronger.','Add bonus energy to every collected orb.','Heal on each cleared wave. More keystones heal more.','Increase coins from every source.','Boss victories grant more forge sparks.','Open stronger, longer wormholes even without a wormhole card.'][b]:['+12% damage per rank. Multiplicative with your other paths.','+3% attack and companion speed per rank.','+1 starting heart and heart capacity per rank.','+8% battle and sanctuary coins per rank.','+5% spark speed and guild rewards per rank.','+4% portal strength and duration per rank.'][b]};
}
function price(m,id){const n=node(id);return n?n.cost+(m.tree.nodes[id]||0):Infinity;}
function total(m){return Math.floor(Math.max(m.best,m.run?.wave?m.run.wave-1:0)/10)+m.tree.bonus;}
function available(m){return Math.max(0,total(m)-m.tree.spent);}
function canBuy(m,id){const n=node(id);return !!n&&(m.tree.nodes[id]||0)<n.max&&(n.parent==='core'||(m.tree.nodes[n.parent]||0)>0)&&available(m)>=price(m,id);}
function buy(m,id){if(!canBuy(m,id))return false;const n=node(id),cost=price(m,id);m.tree.spent+=cost;m.tree.nodes[id]=(m.tree.nodes[id]||0)+1;m.tree.revision++;cache.delete(m.tree);if(n.branch===2&&m.run&&m.expedition.state!=='blocked'&&['fight','draft'].includes(m.run.phase)){m.run.maxHp++;m.run.hp++;}return true;}
function normalize(raw,m){
 const s=fresh();if(!raw||typeof raw!=='object'){s.tasks.forEach(t=>t.base=metric(m,t.kind));return s;}
 s.bonus=integer(raw.bonus);
 for(const [id,value]of Object.entries(raw.nodes||{}).slice(0,50000)){const n=node(id);if(n){const level=Math.min(n.max,integer(value));if(level)s.nodes[id]=level;}}
 // Accept only a connected purchased tree, then recompute its price rather than trusting a balance.
 const sorted=Object.keys(s.nodes).sort((a,b)=>{const x=node(a),y=node(b);return x.depth-y.depth||x.fork-y.fork;});
 for(const id of sorted){const n=node(id);if(n.parent!=='core'&&!s.nodes[n.parent])delete s.nodes[id];}
 for(const [id,level]of Object.entries(s.nodes)){const n=node(id);s.spent+=n.cost*level+level*(level-1)/2;}
 const budget=Math.floor(Math.max(m.best,m.run?.wave?m.run.wave-1:0)/10)+s.bonus;
 if(s.spent>budget){s.nodes={};s.spent=0;}
 s.tasks=s.tasks.map((fallback,i)=>{const t=raw.tasks?.[i];if(t&&taskKinds.includes(t.kind))return {kind:t.kind,base:integer(t.base),round:integer(t.round)};fallback.base=metric(m,fallback.kind);return fallback;});
 if(raw.camera&&['x','y','zoom'].every(k=>Number.isFinite(raw.camera[k])))s.camera={x:raw.camera.x,y:raw.camera.y,zoom:Math.max(.18,Math.min(1.8,raw.camera.zoom))};return s;
}
function stats(m){
 const tree=m.tree;if(!tree)return {attack:0,spirit:0,health:0,coins:0,craft:0,portals:0,caps:[0,0,0,0,0,0]};
 const found=cache.get(tree);if(found?.revision===tree.revision)return found.value;
 const levels=[0,0,0,0,0,0],caps=[0,0,0,0,0,0];
 for(const [id,level]of Object.entries(tree.nodes)){const n=node(id);if(!n)continue;levels[n.branch]+=level;if(n.cap)caps[n.branch]+=level;}
 const value={attack:levels[0],spirit:levels[1],health:levels[2],coins:levels[3],craft:levels[4],portals:levels[5],caps};cache.set(tree,{revision:tree.revision,value});return value;
}
function visible(m){
 const max=[0,0,0,0,0,0];for(const id of Object.keys(m.tree.nodes)){const n=node(id);if(n)max[n.branch]=Math.max(max[n.branch],n.depth);}
 const result=[];for(let b=0;b<6;b++)for(let d=1;d<=Math.max(10,max[b]+5);d++)for(let f=0;f<3;f++)result.push(node(b+':'+d+':'+f));return result;
}
const taskKinds=['kills','merges','orders','fish','runes','stars'];
const goals={kills:150,merges:10,orders:3,fish:3,runes:3,stars:1};
const labels={kills:'Defeat 150 slimes',merges:'Merge 10 runes',orders:'Deliver 3 guild orders',fish:'Catch 3 fish',runes:'Finish 3 memory rounds',stars:'Solve a star puzzle'};
const pages={kills:'combat',merges:'forge',orders:'forge',fish:'fishing',runes:'runes',stars:'stars'};
function metric(m,kind){return kind==='kills'?m.kills:kind==='merges'?m.forge.merges:kind==='orders'?m.forge.orders:kind==='fish'?(m.haven.totals?.fish||0):kind==='runes'?(m.haven.totals?.runes||0):(m.haven.totals?.stars||0);}
function task(m,slot){const t=m.tree.tasks[slot];return {...t,label:labels[t.kind],goal:goals[t.kind],progress:Math.min(goals[t.kind],Math.max(0,metric(m,t.kind)-t.base)),page:pages[t.kind]};}
function claim(m,slot){if(!Number.isInteger(slot)||slot<0||slot>=3)return false;const t=task(m,slot);if(t.progress<t.goal)return false;
 m.tree.bonus+=3;m.haven.dust+=5+Math.floor(m.best/100);m.coins+=25+m.best*3;
 const cycles=[['kills','orders'],['merges','orders'],['stars','fish','runes']],round=t.round+1,kind=cycles[slot][round%cycles[slot].length];m.tree.tasks[slot]={kind,round,base:metric(m,kind)};return true;
}
const api={fresh,normalize,node,decode,price,total,available,canBuy,buy,stats,visible,branches,task,claim,metric};if(typeof module!=='undefined')module.exports=api;root.SkillTree=api;
})(globalThis);
