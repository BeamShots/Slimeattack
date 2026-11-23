/* Standard early suffixes, then a deterministic letter atlas. Never switches to exponent text. */
(function(root){
'use strict';
const suffixes=['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc','Ud','Dd','Td','Qad','Qid','Sxd','Spd','Ocd','Nod','Vg'];
function suffix(tier){if(tier<suffixes.length)return suffixes[tier];let n=tier-suffixes.length+26,s='';do{s=String.fromCharCode(97+n%26)+s;n=Math.floor(n/26)-1;}while(n>=0);return s;}
function parts(value){
 if(value&&typeof value==='object'&&Number.isFinite(value.mantissa)&&Number.isFinite(value.exponent))return normalize(value.mantissa,value.exponent);
 if(typeof value==='string'){const match=/^\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))(?:e([+-]?\d+))?\s*$/i.exec(value);if(match)return normalize(Number(match[1]),Number(match[2]||0));}
 const n=Number(value);if(!Number.isFinite(n))return {special:n===Infinity?'∞':n===-Infinity?'-∞':'0'};return normalize(n,0);
}
function normalize(m,e){if(!m)return {mantissa:0,exponent:0};const shift=Math.floor(Math.log10(Math.abs(m)));return {mantissa:m/Math.pow(10,shift),exponent:e+shift};}
function fromLog(log){if(!Number.isFinite(log))return {special:log===Infinity?'∞':'0'};const exponent=Math.floor(log);return {mantissa:Math.pow(10,log-exponent),exponent};}
function compact(value){
 if(typeof value==='number'&&Number.isFinite(value)&&Math.abs(value)<1000)return (value<0?'-':'')+Math.floor(Math.abs(value));
 const p=parts(value);if(p.special)return p.special;const {mantissa:m,exponent:e}=p;if(!m)return '0';
 const sign=m<0?'-':'';if(e<3)return sign+Math.floor(Math.abs(m)*Math.pow(10,e));
 let tier=Math.floor(e/3),raw=Math.abs(m)*Math.pow(10,e-tier*3),scaled=Math.round((raw+Number.EPSILON*raw*8)*10)/10;if(scaled>=1000){scaled=1;tier++;}
 return sign+scaled+suffix(tier);
}
const api={compact,parts,fromLog,suffix,suffixes};if(typeof module!=='undefined')module.exports=api;root.GameNumbers=api;
})(globalThis);
