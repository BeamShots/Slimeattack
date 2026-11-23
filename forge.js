/* Moonforge: a persistent merge puzzle, escalating orders and open-ended research. */
(function(root){
'use strict';
const T=typeof module!=='undefined'?require('./tree.js'):root.SkillTree;
const perks={
 edge:{name:'Astral edge',icon:3,desc:'+8% damage per level, in battle and offline.',base:14},
 flow:{name:'Sanctuary current',icon:5,desc:'+20% sanctuary income per level.',base:12},
 ward:{name:'Moonstone ward',icon:2,desc:'+1 starting or retry heart per level.',base:18},
 ember:{name:'Ember well',icon:4,desc:'Forge sparks regenerate 8% faster per level.',base:10},
 bounty:{name:'Guild charter',icon:7,desc:'+15% order rewards per level.',base:16},
 echo:{name:'Spirit resonance',icon:0,desc:'+5% damage per level for every periodic power and attack.',base:22}
};
const names=['','Whisper','Verdant','Ember','Starlight','Sovereign','Eclipse','Celestial','Eternity','Genesis'];
function fresh(now=Date.now()){return {board:Array(12).fill(0),sparks:16,lastAt:now,charge:0,orders:0,orderIds:[0,1,2],nextOrder:3,merges:0,discovered:1,perks:Object.fromEntries(Object.keys(perks).map(k=>[k,0]))};}
const num=(n,d=0)=>Number.isFinite(n)?Math.max(0,n):d;
function normalize(raw,now=Date.now()){
 const s=fresh(now);if(!raw||typeof raw!=='object')return s;
 s.board=s.board.map((_,i)=>Math.min(9,Math.floor(num(raw.board?.[i]))));
 for(const k of ['sparks','orders','merges'])s[k]=Math.floor(num(raw[k],s[k]));
 s.orderIds=[0,1,2].map((_,i)=>Math.floor(num(raw.orderIds?.[i],s.orders+i)));if(new Set(s.orderIds).size!==3)s.orderIds=[s.orders,s.orders+1,s.orders+2];s.nextOrder=Math.max(...s.orderIds)+1;s.nextOrder=Math.max(s.nextOrder,Math.floor(num(raw.nextOrder,3)));
 s.charge=num(raw.charge)%1;s.lastAt=num(raw.lastAt,now);
 s.discovered=Math.max(1,Math.min(9,Math.floor(num(raw.discovered,1))),...s.board);
 for(const k in perks)s.perks[k]=Math.floor(num(raw.perks?.[k]));return s;
}
function accrue(m,now=Date.now()){
 const f=m.forge,elapsed=Math.max(0,(now-f.lastAt)/1000);if(now<f.lastAt)return 0;
 const amount=f.charge+elapsed*(1+.08*f.perks.ember)*(1+.05*T.stats(m).craft)/45,n=Math.floor(amount);
 f.sparks+=n;f.charge=amount-n;f.lastAt=now;return n;
}
function summon(m){const f=m.forge,i=f.board.indexOf(0);if(i<0||f.sparks<1)return -1;f.sparks--;f.board[i]=1;return i;}
function merge(m,a,b){
 const f=m.forge;if(!Number.isInteger(a)||!Number.isInteger(b)||a===b||a<0||b<0||a>=12||b>=12)return false;
 if(!f.board[a]||f.board[a]!==f.board[b]||f.board[a]>=9)return false;
 f.board[b]++;f.board[a]=0;f.merges++;f.discovered=Math.max(f.discovered,f.board[b]);return true;
}
function move(m,a,b){if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a>=12||b>=12||!m.forge.board[a]||m.forge.board[b])return false;m.forge.board[b]=m.forge.board[a];m.forge.board[a]=0;return true;}
function order(m,slot){
 const f=m.forge,index=f.orderIds[slot],ceiling=Math.min(9,3+Math.floor(index/12));
 const rank=2+(index*7)%(ceiling-1),mult=(1+.15*f.perks.bounty)*(1+.05*T.stats(m).craft);
 return {rank,coins:Math.round((35+m.best*2)*Math.pow(2,rank-2)*mult),dust:Math.round(Math.pow(2,rank-1)*mult),shards:rank>=5?Math.floor(rank/2):0};
}
function fill(m,slot){
 if(!Number.isInteger(slot)||slot<0||slot>2)return null;
 const o=order(m,slot),i=m.forge.board.indexOf(o.rank);if(i<0)return null;
 m.forge.board[i]=0;m.forge.orders++;m.forge.orderIds[slot]=m.forge.nextOrder++;m.coins+=o.coins;m.shards+=o.shards;m.haven.dust+=o.dust;
 return o;
}
function salvage(m,i){const f=m.forge;if(!Number.isInteger(i)||i<0||i>=12||!f.board[i])return false;m.haven.dust+=Math.pow(2,f.board[i]-1);f.board[i]=0;return true;}
function cost(m,id){return perks[id]?Math.ceil(perks[id].base*Math.pow(m.forge.perks[id]+1,1.65)):Infinity;}
function buy(m,id){if(!perks[id])return false;const n=cost(m,id);if(m.haven.dust<n)return false;m.haven.dust-=n;m.forge.perks[id]++;return true;}
function damage(m){return (1+.08*m.forge.perks.edge)*(1+.05*m.forge.perks.echo);}
function wave(m,w){m.forge.sparks+=2+(w%5===0?3+T.stats(m).caps[4]:0);m.haven.dust+=w%5===0?2+Math.floor(w/40):0;}
const api={fresh,normalize,accrue,summon,merge,move,order,fill,salvage,cost,buy,damage,wave,perks,names};
if(typeof module!=='undefined')module.exports=api;root.Moonforge=api;
})(globalThis);
