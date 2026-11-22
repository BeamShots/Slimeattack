/* One notation for wallets, prices, rewards, research and damage. */
(function(root){
'use strict';
const suffixes=['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc','Ud','Dd','Td','Qad','Qid','Sxd','Spd','Ocd','Nod','Vg'];
function compact(value){
 const n=Number(value);if(!Number.isFinite(n))return n===Infinity?'∞':n===-Infinity?'-∞':'0';
 const abs=Math.abs(n),sign=n<0?'-':'';if(abs<1000)return sign+Math.floor(abs);
 let tier=Math.floor(Math.log10(abs)/3);
 if(tier>=suffixes.length)return sign+abs.toExponential(2).replace(/\.0+(?=e)|(?<=\.[0-9])0(?=e)/g,'').replace('e+','e');
 let scaled=Number((abs/Math.pow(1000,tier)).toFixed(1));
 if(scaled>=1000){scaled=1;tier++;}
 if(tier>=suffixes.length)return sign+abs.toExponential(2).replace('e+','e');
 return sign+scaled+suffixes[tier];
}
const api={compact,suffixes};if(typeof module!=='undefined')module.exports=api;root.GameNumbers=api;
})(globalThis);
