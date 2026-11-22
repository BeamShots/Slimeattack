/* Small, independent activities. Rewards are issued once at the state transition. */
(function(root){
'use strict';
const buildings=[
 {id:'lanterns',name:'Moon lanterns',icon:4,cost:8,desc:'Light the village paths. Sanctuary income +10%.'},
 {id:'fountain',name:'Star fountain',icon:5,cost:18,desc:'Wake the fountain. Sanctuary income +10%.'},
 {id:'tree',name:'Lunar garden',icon:6,cost:30,desc:'Restore the lunar tree. Sanctuary income +10%.'}
];
function town(){return {dust:0,restored:[],best:{runes:0,fish:0,stars:0},fishBook:[]};}
function normalize(raw){
 const s=town();if(!raw||typeof raw!=='object')return s;
 s.dust=Number.isFinite(raw.dust)?Math.max(0,Math.floor(raw.dust)):0;
 s.restored=Array.isArray(raw.restored)?[...new Set(raw.restored.filter(id=>buildings.some(b=>b.id===id)))]:[];
 for(const k in s.best)s.best[k]=Number.isFinite(raw.best?.[k])?Math.max(0,Math.min(1e7,Math.floor(raw.best[k]))):0;
 s.fishBook=Array.isArray(raw.fishBook)?[...new Set(raw.fishBook.filter(n=>Number.isInteger(n)&&n>=0&&n<5))]:[];return s;
}
function reward(meta,coins,dust,game,score){
 meta.coins+=coins;meta.haven.dust+=dust;
 meta.haven.best[game]=Math.max(meta.haven.best[game],score);return {coins,dust};
}
function restore(meta,id){
 const b=buildings.find(b=>b.id===id);
 if(!b||meta.haven.restored.includes(id)||meta.haven.dust<b.cost)return false;
 meta.haven.dust-=b.cost;meta.haven.restored.push(id);return true;
}
function rngInt(rng,n){return Math.min(n-1,Math.floor(rng()*n));}
// Memory sequence
function memory(rng=Math.random){
 const s={kind:'runes',round:1,sequence:[],phase:'ready',clock:0,cue:-1,position:0,tries:3,earned:0};
 extendMemory(s,rng);return s;
}
function extendMemory(s,rng){
 s.sequence.push(rngInt(rng,4));s.position=0;s.clock=-.45;s.cue=-1;s.phase='ready';
}
function replayMemory(s){
 if(!['ready','input'].includes(s.phase))return false;
 s.phase='watch';s.clock=-.45;s.position=0;s.cue=-1;return true;
}
function stepMemory(s,dt){
 if(s.phase!=='watch')return -1;
 s.clock+=Math.min(.1,Math.max(0,dt));
 const index=Math.floor(s.clock/.72);
 s.cue=index>=0&&index<s.sequence.length&&s.clock% .72<.48?s.sequence[index]:-1;
 if(index>=s.sequence.length){s.phase='input';s.cue=-1;s.position=0;}
 return s.cue;
}
function tapMemory(s,index,meta){
 if(s.phase!=='input'||!Number.isInteger(index)||index<0||index>3)return {type:'ignored'};
 if(index!==s.sequence[s.position]){
  s.tries--;s.position=0;s.phase=s.tries>0?'ready':'over';s.cue=-1;
  return {type:'mistake',over:s.tries<=0};
 }
 s.position++;
 if(s.position<s.sequence.length)return {type:'correct'};
 s.phase='won';const payout=reward(meta,8+s.sequence.length*3,1+Math.floor(s.sequence.length/3),'runes',s.sequence.length);s.earned+=payout.dust;
 return {type:'win',...payout};
}
function nextMemory(s,rng=Math.random){
 if(s.phase!=='won')return false;s.round++;extendMemory(s,rng);return true;
}
// Fishing has a quiet waiting phase, a generous bite window and three attempts.
const fishNames=['Moonfin','Lilypad carp','Silver whisker','Star koi','Dreamscale'];
function fishing(){return {kind:'fish',phase:'ready',clock:0,wait:0,attempt:0,caught:0,perfect:0,earned:0,last:null};}
function cast(s,rng=Math.random){
 if(!['ready','result'].includes(s.phase)||s.attempt>=3)return false;
 s.attempt++;s.clock=0;s.wait=1.3+rng()*1.7;s.phase='waiting';s.last=null;return true;
}
function stepFish(s,dt){
 if(!['waiting','bite'].includes(s.phase))return false;
 s.clock+=Math.min(.1,Math.max(0,dt));
 if(s.phase==='waiting'&&s.clock>=s.wait){s.phase='bite';s.clock=0;return true;}
 if(s.phase==='bite'&&s.clock>1.6){s.phase='result';s.last={miss:true};}
 return false;
}
function reel(s,meta,rng=Math.random){
 if(s.phase==='waiting'){s.phase='result';s.last={miss:true,early:true};return {type:'early'};}
 if(s.phase!=='bite')return {type:'ignored'};
 const perfect=s.clock<=.55,type=perfect&&rng()<.3?4:rngInt(rng,4);
 s.phase='result';s.caught++;if(perfect)s.perfect++;
 s.last={fish:type,perfect};meta.haven.fishBook=[...new Set([...meta.haven.fishBook,type])];
 const payout=reward(meta,perfect?22:14,perfect?3:2,'fish',s.caught);s.earned+=payout.dust;
 return {type:'catch',fish:type,perfect,...payout};
}
// Spatial puzzle. Bit masks are N/E/S/W, with a known serpentine solution.
const directions=[{dx:0,dy:-1,bit:1,back:4},{dx:1,dy:0,bit:2,back:8},{dx:0,dy:1,bit:4,back:1},{dx:-1,dy:0,bit:8,back:2}];
function rotate(mask){return ((mask<<1)&15)|((mask>>3)&1);}
function puzzle(rng=Math.random){
 const start=rngInt(rng,4)*4;
 function search(path){
  const at=path[path.length-1];if(at%4===3&&path.length>=5)return path;
  if(path.length>=12)return null;
  const choices=directions.map(d=>({x:at%4+d.dx,y:Math.floor(at/4)+d.dy})).filter(p=>p.x>=0&&p.x<4&&p.y>=0&&p.y<4&&!path.includes(p.y*4+p.x));
  for(let i=choices.length-1;i>0;i--){const j=rngInt(rng,i+1);[choices[i],choices[j]]=[choices[j],choices[i]];}
  for(const p of choices){const result=search([...path,p.y*4+p.x]);if(result)return result;}
  return null;
 }
 return puzzleFromPath(search([start])||[start,start+1,start+2,start+3],rng);
}
function puzzleFromPath(path,rng){
 const cells=Array.from({length:16},()=>rng()<.5?5:3),solution={},start=path[0],end=path[path.length-1];
 for(let i=0;i<path.length;i++){
  const at=path[i];let mask=i===0?8:0;if(i===path.length-1)mask|=2;
  for(const neighbor of [path[i-1],path[i+1]]){
   if(neighbor===undefined)continue;
   const dx=neighbor%4-at%4,dy=Math.floor(neighbor/4)-Math.floor(at/4);
   const d=directions.find(d=>d.dx===dx&&d.dy===dy);if(d)mask|=d.bit;
  }
  cells[at]=mask;solution[at]=mask;
 }
 for(let i=0;i<16;i++)for(let j=rngInt(rng,4);j>0;j--)cells[i]=rotate(cells[i]);
 const s={kind:'stars',cells,solution,start,end,moves:0,hints:0,solved:false,rewarded:false,lit:[]};
 if(connected(s)){cells[start]=rotate(cells[start]);if(connected(s))cells[end]=rotate(cells[end]);}
 s.lit=litCells(s);return s;
}
function litCells(s){
 if(!(s.cells[s.start]&8))return [];
 const seen=new Set([s.start]),queue=[s.start];
 while(queue.length){
  const i=queue.shift(),x=i%4,y=Math.floor(i/4);
  for(const d of directions){
   const nx=x+d.dx,ny=y+d.dy;if(nx<0||nx>3||ny<0||ny>3||!(s.cells[i]&d.bit))continue;
   const next=ny*4+nx;if((s.cells[next]&d.back)&&!seen.has(next)){seen.add(next);queue.push(next);}
  }
 }
 return [...seen];
}
function connected(s){return litCells(s).includes(s.end)&&!!(s.cells[s.end]&2);}
function finishPuzzle(s,meta){
 s.lit=litCells(s);if(!connected(s)||s.rewarded)return null;
 s.solved=true;s.rewarded=true;
 return reward(meta,Math.max(15,40-s.hints*5),Math.max(2,6-s.hints),'stars',Math.max(1,100-s.moves*2-s.hints*10));
}
function turnTile(s,index,meta){
 if(s.solved||!Number.isInteger(index)||index<0||index>=16)return null;
 s.cells[index]=rotate(s.cells[index]);s.moves++;return finishPuzzle(s,meta);
}
function hint(s,meta){
 if(s.solved)return null;
 const index=Object.keys(s.solution).map(Number).find(i=>s.cells[i]!==s.solution[i]);
 if(index===undefined)return finishPuzzle(s,meta);
 s.cells[index]=s.solution[index];s.hints++;s.moves++;return finishPuzzle(s,meta);
}
const api={town,normalize,buildings,reward,restore,memory,replayMemory,stepMemory,tapMemory,nextMemory,fishing,fishNames,cast,stepFish,reel,puzzle,rotate,connected,litCells,turnTile,hint};
if(typeof module!=='undefined')module.exports=api;root.Haven=api;
})(globalThis);
