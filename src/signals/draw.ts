/* Signal drawing primitives.
 * Every function returns SVG markup in local coordinates: x = 0 is the mast axis, y = 0 the top edge.
 * The markup is trusted (generated here) and rendered with <Svg> / <Fig>. */
export type Zs = 'z1' | 'z7' | 'z8' | '';
export type MastPlate = 'wrw' | 'r' | 'y' | 'ry' | 'wywyw' | 'wswsw' | 'dots' | 'tri' | 'bu';
export const K={r:'#ff3b30',g:'#2ee86a',y:'#ffc21a',w:'#fbfbf2',red:'#c8102e',yel:'#f2c230'};
export function lamp(x:number,y:number,c:string|null,r=4,blink=false,hood=true):string{let s='';
 if(hood)s+=`<path d="M${x-r-2} ${y+.5} A${r+2} ${r+2} 0 0 1 ${x+r+2} ${y+.5} Z" fill="#000"/>`;
 if(c)s+=`<g ${blink?'class="blink"':''}><circle cx="${x}" cy="${y}" r="${r+4.5}" fill="${c}" opacity=".22"/><circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x-r*.35}" cy="${y-r*.35}" r="${r*.32}" fill="#fff" opacity=".6"/></g>`;
 else s+=`<circle cx="${x}" cy="${y}" r="${r}" fill="#1c1c1c" stroke="#3a3a3a" stroke-width=".8"/><circle cx="${x-r*.3}" cy="${y-r*.3}" r="${r*.28}" fill="#666" opacity=".45"/>`;
 return s}
export const screen=(x:number,y:number,w:number,h:number,rx=5)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="#121212" stroke="#e4e3dc" stroke-width="1.8"/>`;
export const base=(y:number)=>`<rect x="-8" y="${y}" width="16" height="6" rx="1" fill="#a9a79d"/><rect x="-8" y="${y}" width="16" height="1.6" fill="#c4c2b8"/>`;
export const pipe=(t:number,b:number)=>`<rect x="-2.8" y="${t}" width="5.6" height="${b-t}" fill="#8e8d87"/><rect x="-2.8" y="${t}" width="1.8" height="${b-t}" fill="#b9b8b1"/>`+base(b);
export function lattice(t:number,b:number){let s=`<rect x="-4" y="${t}" width="8" height="${b-t}" fill="none" stroke="#6f6e68" stroke-width="1.3"/>`,p=`M-4 ${t}`;for(let y=t,i=0;y<b;y+=7,i++)p+=` L${i%2?-4:4} ${Math.min(b,y+7)}`;return s+`<path d="${p}" fill="none" stroke="#6f6e68" stroke-width=".8"/>`+base(b)}
export function mschild(y:number,t:MastPlate){const W=11,X=-5.5;
 if(t==='wrw')return `<rect x="${X}" y="${y}" width="${W}" height="5" fill="#fff" stroke="#222" stroke-width=".5"/><rect x="${X}" y="${y+5}" width="${W}" height="5" fill="${K.red}"/><rect x="${X}" y="${y+10}" width="${W}" height="5" fill="#fff" stroke="#222" stroke-width=".5"/>`;
 if(t==='r')return `<rect x="${X}" y="${y}" width="${W}" height="15" fill="${K.red}" stroke="#222" stroke-width=".5"/>`;
 if(t==='y')return `<rect x="${X}" y="${y}" width="${W}" height="15" fill="${K.yel}" stroke="#222" stroke-width=".5"/>`;
 if(t==='ry')return `<rect x="${X}" y="${y}" width="${W}" height="7.5" fill="${K.red}" stroke="#222" stroke-width=".5"/><rect x="${X}" y="${y+7.5}" width="${W}" height="7.5" fill="${K.yel}" stroke="#222" stroke-width=".5"/>`;
 if(t==='wywyw'||t==='wswsw'){const c=t==='wywyw'?K.yel:'#111';let s='';for(let i=0;i<5;i++)s+=`<rect x="${X}" y="${y+i*3}" width="${W}" height="3" fill="${i%2?c:'#fff'}"/>`;return s+`<rect x="${X}" y="${y}" width="${W}" height="15" fill="none" stroke="#222" stroke-width=".5"/>`}
 if(t==='dots')return `<rect x="${X}" y="${y}" width="${W}" height="15" fill="#fff" stroke="#222" stroke-width=".5"/><circle cx="0" cy="${y+4.5}" r="2" fill="#111"/><circle cx="0" cy="${y+10.5}" r="2" fill="#111"/>`;
 if(t==='tri')return `<polygon points="-6,${y} 6,${y} 0,${y+9}" fill="${K.yel}" stroke="#222" stroke-width=".6"/>`;
 if(t==='bu'){let s=`<clipPath id="cb${y}"><rect x="-7" y="${y}" width="14" height="22"/></clipPath><rect x="-7" y="${y}" width="14" height="22" fill="#fff" stroke="#222" stroke-width=".6"/><g clip-path="url(#cb${y})">`;for(let i=-3;i<6;i++)s+=`<path d="M-8 ${y+i*6} L8 ${y+i*6+10} L8 ${y+i*6+13} L-8 ${y+i*6+3} Z" fill="#111"/>`;return s+'</g>'}
 return''}
export const ne2=(y:number)=>`<rect x="-7" y="${y}" width="14" height="19" fill="#fff" stroke="#222" stroke-width="1.1"/><polygon points="-4,${y+8.5} 0,${y+3.5} 4,${y+8.5}" fill="#111"/><polygon points="-4,${y+15.5} 0,${y+10.5} 4,${y+15.5}" fill="#111"/>`;
export function zsSide(kind:'zs1'|'zs7'|'zs8',on:boolean,blink=false){const c=kind==='zs7'?K.y:K.w;const pts:number[][]=kind==='zs7'?[[-6,6],[6,6],[0,16]]:[[0,6],[-6,16],[6,16]];
 return `<line x1="-16" y1="11" x2="-2" y2="11" stroke="#8e8d87" stroke-width="2"/><g transform="translate(-30 0)">`+screen(-13,0,26,23,3)+pts.map(([x,y])=>lamp(x,y,on?c:null,2.8,blink,false)).join('')+`</g>`}
export const digit=(x:number,y:number,n:string|number,col:string,fs=12)=>`<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="${fs}" font-weight="600" style="fill:${col};font-family:Archivo,sans-serif;font-variant-numeric:tabular-nums">${n}</text>`;

/* ---- Formsignale ---- */
function fwing(py:number,ang:number,dim:boolean){return `<g transform="rotate(${ang} 3 ${py})" opacity="${dim?.4:1}"><path d="M3 ${py-3.4} H28 V${py+3.4} H3 Z" fill="${K.red}" stroke="#fff" stroke-width="1.4"/><circle cx="32" cy="${py}" r="7.5" fill="${K.red}" stroke="#fff" stroke-width="1.7"/><circle cx="32" cy="${py}" r="3.6" fill="none" stroke="#fff" stroke-width="1.3"/></g><circle cx="3" cy="${py}" r="2.2" fill="#333"/>`}
function lantern(y:number,c:string|null){return `<rect x="-17" y="${y-7}" width="10" height="15" rx="2" fill="#3d3c38"/><rect x="-14" y="${y-10}" width="4" height="3" fill="#3d3c38"/>`+lamp(-12,y,c,2.8,false,false)}
export const zsAt=(y:number,zs?:Zs)=>zs?`<g transform="translate(0 ${y})">${zsSide(zs==='z7'?'zs7':'zs1',true)}</g>`:'';
export function formHp(a:string,night=false,vr?:string,zs?:Zs){let s=lattice(4,128)+zsAt(50,zs)+`<circle cx="0" cy="3" r="2.6" fill="#6f6e68"/>`;
 s+=lantern(13,night?(a==='Hp0'?K.r:K.g):null)+lantern(37,night&&a==='Hp2'?K.y:null);
 s+=fwing(13,a==='Hp0'?0:-45,night)+fwing(37,a==='Hp2'?-45:90,night);
 if(vr){const fold=vr==='Vr1';s+=`<rect x="0" y="80" width="6" height="2" fill="#6f6e68"/>`;
  if(fold)s+=`<ellipse cx="8" cy="80" rx="9" ry="2" fill="${K.yel}" stroke="#111" opacity="${night?.4:1}"/>`;else s+=`<g opacity="${night?.4:1}"><circle cx="8" cy="80" r="9" fill="#fff"/><circle cx="8" cy="80" r="7.8" fill="#111"/><circle cx="8" cy="80" r="6.2" fill="${K.yel}"/></g>`;
  if(night){const c=vr==='Vr0'?[K.y,K.y]:vr==='Vr1'?[K.g,K.g]:[K.y,K.g];s+=lamp(-10,88,c[0],2.6,false,false)+lamp(-4,76,c[1],2.6,false,false)}}
 return s}
export function formVr(a:string,night=false,withNe2=true){let s=lattice(4,118);
 if(a==='Vr1')s+=`<ellipse cx="0" cy="20" rx="14" ry="2.8" fill="${K.yel}" stroke="#111" stroke-width="1.2" opacity="${night?.4:1}"/>`;
 else s+=`<g opacity="${night?.4:1}"><circle cx="0" cy="20" r="14" fill="#fff" stroke="#999" stroke-width=".4"/><circle cx="0" cy="20" r="12.4" fill="#111"/><circle cx="0" cy="20" r="10" fill="${K.yel}"/></g>`;
 const ang=a==='Vr2'?45:90;s+=`<g transform="rotate(${ang} 2 46)" opacity="${night?.4:1}"><polygon points="2,42 22,42 22,38 33,46 22,54 22,50 2,50" fill="${K.yel}" stroke="#fff" stroke-width="3"/><polygon points="2,42 22,42 22,38 33,46 22,54 22,50 2,50" fill="${K.yel}" stroke="#111" stroke-width="1.2"/></g><circle cx="2" cy="46" r="2" fill="#333"/>`;
 if(night){const c=a==='Vr0'?[K.y,K.y]:a==='Vr1'?[K.g,K.g]:[K.y,K.g];s+=`<rect x="-19" y="24" width="10" height="13" rx="2" fill="#3d3c38"/><rect x="-11" y="7" width="10" height="13" rx="2" fill="#3d3c38"/>`+lamp(-14,30,c[0],3,false,false)+lamp(-6,13,c[1],3,false,false)}
 return s+(withNe2?ne2(84):'')}

/* ---- H/V-Lichtsignale, Bauform 1969 ---- */
function hvVrLamps(oy:number,v:string){const on=(k:string)=>(({Vr0:['LLy','URy'],Vr1:['LLg','URg'],Vr2:['LLy','URg']} as Record<string,string[]>)[v]||[]).includes(k);
 return lamp(7,oy+9,on('URg')?K.g:null,3.6)+lamp(7,oy+20,on('URy')?K.y:null,3.6)+lamp(-7,oy+26,on('LLg')?K.g:null,3.6)+lamp(-7,oy+37,on('LLy')?K.y:null,3.6)}
export function hvHp(a:string,vr?:string,ms:MastPlate='wrw',zs?:Zs){let s=pipe(56,140)+screen(-15,0,30,58)+zsAt(20,zs);
 s+=lamp(-7,11,a==='Hp1'||a==='Hp2'?K.g:null,4.2)+lamp(-7,28,a==='Hp0'?K.r:null,4.2)+lamp(7,28,a==='Hp0'?K.r:null,4.2)+lamp(-7,45,a==='Hp2'?K.y:null,4.2)+lamp(7,46,null,2.4);
 if(vr!==undefined)s+=screen(-15,62,30,46)+hvVrLamps(63,vr);
 return s+mschild(116,ms)}
export function hvVr(a:string,short=false){let s=pipe(46,128)+screen(-15,0,30,46)+hvVrLamps(1,a)+lamp(-8,9,short?K.w:null,2.4);return s+ne2(70)}

/* ---- Hl ---- */
export const HLM:Record<string,[string,string]>={Hl1:['max','max'],Hl4:['max','100'],Hl7:['max','46'],Hl10:['max','halt'],Hl2:['100','max'],Hl5:['100','100'],Hl8:['100','46'],Hl11:['100','halt'],Hl3a:['40','max'],Hl6a:['40','100'],Hl9a:['40','46'],Hl12a:['40','halt'],Hl3b:['60','max'],Hl6b:['60','100'],Hl9b:['60','46'],Hl12b:['60','halt']};
type HlParts={red?:boolean;up?:string;low?:boolean;strip?:string|null};
export function hlParts(c:string):HlParts{if(c==='Hp0')return{red:true};const[r,x]=HLM[c];return{up:({max:'g',100:'gb',46:'yb',halt:'y'} as Record<string,string>)[x],low:r!=='max',strip:r==='100'?'g':r==='60'?'y':null}}
export function hlSig(code:string,vs=false,mehr=false,zs?:Zs){const p=hlParts(code);const up=(col:string)=>p.up&&p.up[0]===col;
 if(vs){let s=pipe(26,120)+screen(-15,0,30,26)+lamp(-7,13,up('y')?K.y:null,4.2,p.up==='yb')+lamp(7,13,up('g')?K.g:null,4.2,p.up==='gb');return s+ne2(66)}
 let s=pipe(74,140)+screen(-15,0,30,76)+lamp(-7,12,up('y')?K.y:null,4.2,p.up==='yb')+lamp(7,12,up('g')?K.g:null,4.2,p.up==='gb')+lamp(0,29,p.red?K.r:null,4.2)+lamp(0,46,p.low?K.y:null,4.2);
 const sc=p.strip==='g'?K.g:p.strip==='y'?K.y:null;for(let i=-2;i<=2;i++)s+=lamp(i*5,64,sc,1.9,false,false);
 s+=lamp(-9,46,zs==='z1'?K.w:null,2.2,true,false);if(zs==='z7')s+=zsAt(24,'z7');
 s+=mschild(86,'wrw');if(mehr)s+=mschild(104,'tri');return s}

/* ---- Ks ---- */
export function ksSig(a:string,zs3?:string|number,zs3v?:string|number,vs=false,mehr=false,zs?:Zs){let s=pipe(80,146);
 if(zs3)s+=screen(-11,0,22,17,3)+digit(0,9,zs3,K.w);
 s+=screen(-14,19,28,60)+lamp(0,32,a==='Hp0'?K.r:null,4.4)+lamp(0,48,a==='Ks1'||a==='Ks1b'?K.g:null,4.4,a==='Ks1b')+lamp(0,64,a==='Ks2'?K.y:null,4.4)+lamp(-8,74,zs==='z1'?K.w:null,2,true)+lamp(8,74,null,2);
 if(zs==='z7')s+=zsAt(36,'z7');
 if(zs3v)s+=screen(-11,82,22,17,3)+digit(0,91,zs3v,K.y);
 return s+(vs?ne2(104):mschild(104,'wrw')+(mehr?mschild(121,'tri'):''))}

/* ---- Sk ---- */
export function skSig(a:string,zs3?:string|number,zs3v?:string|number,kind:'hs'|'vs'|'komb'='hs',zs?:Zs){let s=pipe(50,140)+zsAt(14,zs);
 if(zs3)s+=screen(-11,-20,22,17,3)+digit(0,-11,zs3,K.w);
 if(kind==='vs'){s+=`<circle cx="0" cy="22" r="20" fill="#121212" stroke="#e4e3dc" stroke-width="1.8"/>`+lamp(-7,28,a==='Sk2'?K.y:null,4.2)+lamp(7,16,a==='Sk1'?K.g:null,4.2)}
 else s+=screen(-15,0,30,48)+lamp(-7,12,a==='Sk1'?K.g:null,4.2)+lamp(7,24,a==='Hp0'?K.r:null,4.2)+lamp(-7,36,a==='Sk2'?K.y:null,4.2);
 if(zs3v)s+=`<polygon points="-11,52 11,52 0,70" fill="#121212" stroke="#e4e3dc" stroke-width="1.4"/>`+digit(0,59,zs3v,K.y,10);
 return s+mschild(96,kind==='vs'?'y':kind==='komb'?'ry':'r')}

/* ---- Tafeln ---- */
export const post=(t:number,b:number)=>`<rect x="-1.8" y="${t}" width="3.6" height="${b-t}" fill="#8e8d87"/>`+base(b);
export function ne1(){return post(18,110)+`<polygon points="-12,0 12,0 16,19 -16,19" fill="#fff" stroke="#222" stroke-width="1.4"/>`}
export function ne2Only(){return post(18,110)+ne2(0)}
export function bake(n:number){let s=post(36,110)+`<rect x="-5" y="0" width="10" height="38" fill="#fff" stroke="#222" stroke-width="1"/>`;for(let i=0;i<n;i++)s+=`<path d="M-5 ${14+i*9} L5 ${6+i*9} L5 ${10+i*9} L-5 ${18+i*9} Z" fill="#111"/>`;return s}
export function ne4(){let s=post(18,110);for(let i=0;i<4;i++)for(let j=0;j<4;j++)s+=`<rect x="${-9+j*4.5}" y="${i*4.5}" width="4.5" height="4.5" fill="${(i+j)%2?'#fff':'#111'}"/>`;return s+`<rect x="-9" y="0" width="18" height="18" fill="none" stroke="#222" stroke-width=".7"/>`}
export function ne5(){return post(22,110)+`<rect x="-10" y="0" width="20" height="23" fill="#fff" stroke="#222" stroke-width="1.4"/>`+digit(0,12,'H','#111',15)}
export function lf6(n:string|number){return post(24,110)+`<polygon points="-15,0 15,0 0,26" fill="${K.yel}" stroke="#fff" stroke-width="2.4"/><polygon points="-17,-1.5 17,-1.5 0,29" fill="none" stroke="#333" stroke-width=".6"/>`+digit(0,9,n,'#111',12)}
export function lf7(n:string|number){return post(26,110)+`<rect x="-11" y="0" width="22" height="27" fill="#fff" stroke="#222" stroke-width="1.4"/>`+digit(0,14,n,'#111',15)}
function lfBoard(fill:string,txt:string|number){return post(26,110)+`<rect x="-11" y="0" width="22" height="27" fill="${fill}" stroke="#fff" stroke-width="2.4"/><rect x="-12.5" y="-1.5" width="25" height="30" fill="none" stroke="#333" stroke-width=".6"/>`+digit(0,14,txt,'#111',14)}
export const lf1=(n:string|number)=>lfBoard(K.yel,n)+lamp(-7,34,K.y,2,false,false)+lamp(7,34,K.y,2,false,false);
export const lf2=()=>lfBoard(K.yel,'A');
export const lf3=()=>lfBoard('#fff','E');
/* Bü */
export function bue1(st:'ok'|'stoer'|string){let s=pipe(32,120)+screen(-11,0,22,32,4)+lamp(0,9,st==='ok'?K.w:null,3.8,true)+lamp(0,23,K.y,3.8);return s+mschild(40,'bu')}
export function bue2(){let s=post(36,110)+`<rect x="-8" y="0" width="16" height="38" fill="#111" stroke="#fff" stroke-width="1.2"/>`;for(let i=0;i<4;i++)s+=`<polygon points="0,${3+i*8.2} 4.5,${7+i*8.2} 0,${11+i*8.2} -4.5,${7+i*8.2}" fill="#fff"/>`;return s}
export function bue3(){let s=post(30,110);for(let i=0;i<6;i++)s+=`<rect x="-9" y="${i*5}" width="18" height="5" fill="${i%2?'#fff':'#111'}"/>`;return s+`<rect x="-9" y="0" width="18" height="30" fill="none" stroke="#222" stroke-width=".7"/>`}
export const bueTxt=(t:string,inv=false)=>post(24,110)+`<rect x="-11" y="0" width="22" height="25" fill="${inv?'#111':'#fff'}" stroke="${inv?'#fff':'#222'}" stroke-width="1.4"/>`+digit(0,13,t,inv?'#fff':'#111',15);
export function andreas(){let s=post(18,90);const bar=(ang:number)=>`<g transform="rotate(${ang} 0 12)"><rect x="-22" y="9" width="44" height="6" fill="#fff" stroke="${K.red}" stroke-width="1"/><rect x="-22" y="9" width="11" height="6" fill="${K.red}"/><rect x="0" y="9" width="11" height="6" fill="${K.red}"/></g>`;return s+bar(30)+bar(-30)}
/* Rangier/Schutz */
export function shForm(on:boolean){return post(26,90)+`<circle cx="0" cy="13" r="13" fill="#fff" stroke="#222" stroke-width="1.2"/><g transform="rotate(${on?-45:0} 0 13)"><rect x="-11" y="10.5" width="22" height="5" fill="#111"/></g>`}
export function sperrL(a:string){return `<rect x="-14" y="0" width="28" height="34" rx="4" fill="#121212" stroke="#e4e3dc" stroke-width="1.8"/>`+lamp(-6,10,a==='Hp0'?K.r:null,3.6)+lamp(6,10,a==='Hp0'?K.r:null,3.6)+lamp(-6,26,a==='Sh1'?K.w:null,3.2)+lamp(6,19,a==='Sh1'?K.w:null,3.2)+`<rect x="-10" y="34" width="20" height="6" fill="#8e8d87"/>`+base(40)}
export function sh2(){return post(26,90)+`<rect x="-14" y="0" width="28" height="22" fill="${K.red}" stroke="#fff" stroke-width="2.4"/><rect x="-15.5" y="-1.5" width="31" height="25" fill="none" stroke="#333" stroke-width=".6"/>`}
export function ra10(){return post(34,110)+`<path d="M-17 36 V14 A17 14 0 0 1 17 14 V36 Z" fill="#fff" stroke="#222" stroke-width="1.3"/><text x="0" y="17" text-anchor="middle" font-size="6.2" font-weight="600" style="fill:#111">Halt für</text><text x="0" y="24.5" text-anchor="middle" font-size="6.2" font-weight="600" style="fill:#111">Rangier-</text><text x="0" y="32" text-anchor="middle" font-size="6.2" font-weight="600" style="fill:#111">fahrten</text>`}
export function ra11(){return post(52,110)+`<rect x="-11" y="0" width="22" height="20" rx="3" fill="#121212" stroke="#e4e3dc" stroke-width="1.6"/>`+lamp(-5,14,null,2.8)+lamp(5,7,null,2.8)+`<rect x="-11" y="24" width="22" height="26" fill="${K.yel}" stroke="#222" stroke-width="1.2"/>`+digit(0,37,'W','#111',15)}
export function ra12(){let s=`<rect x="-20" y="30" width="40" height="7" fill="#fff" stroke="#222" stroke-width=".7"/>`;for(let i=0;i<4;i++)s+=`<rect x="${-20+i*10}" y="30" width="5" height="7" fill="${K.red}"/>`;return s}
/* El (Fahrleitung): blaue, auf der Spitze stehende Quadrate mit weißem Zeichen */
export function elB(k:string){const W='#fff';let sym=({
 el1v:`<rect x="-10" y="15" width="8" height="5" fill="${W}"/><rect x="2" y="15" width="8" height="5" fill="${W}"/>`,
 el1:`<rect x="-8" y="9" width="3.5" height="11" fill="${W}"/><rect x="4.5" y="9" width="3.5" height="11" fill="${W}"/><rect x="-4" y="22" width="8" height="3.5" fill="${W}"/>`,
 el2:`<path d="M-6.5 9 V20 A6.5 5 0 0 0 6.5 20 V9" fill="none" stroke="${W}" stroke-width="3.5"/>`,
 el3:`<rect x="-11" y="12" width="12" height="3.5" fill="${W}"/><rect x="-1" y="20" width="12" height="3.5" fill="${W}"/>`,
 el4:`<rect x="-11" y="16" width="22" height="3.5" fill="${W}"/>`,
 el5:`<rect x="-1.75" y="7" width="3.5" height="21" fill="${W}"/>`,
 el6:`<polygon points="0,6 12,17.5 0,29 -12,17.5" fill="none" stroke="${W}" stroke-width="2.4"/><polygon points="0,13 4.5,17.5 0,22 -4.5,17.5" fill="${W}"/>`} as Record<string,string>)[k];
 return post(34,110)+`<polygon points="0,-1.5 19.5,17.5 0,36.5 -19.5,17.5" fill="#111"/><polygon points="0,0 18,17.5 0,35 -18,17.5" fill="#fff"/><polygon points="0,2.5 15.5,17.5 0,32.5 -15.5,17.5" fill="#1d5fb8"/>`+sym}
/* Zs-Tafeln und -Lichter */
export const zsBox=(inner:string,w=24,h=26)=>post(h,100)+screen(-w/2,0,w,h,3)+inner;
export const zs2=(l:string|number,v=false)=>zsBox(digit(0,13,l,v?K.y:K.w,15));
export const zs6=()=>zsBox(`<path d="M-5 22 V15 L5 9 V3" fill="none" stroke="${K.w}" stroke-width="2.6"/>`);
export const zs10=()=>zsBox(`<path d="M0 21 V6 M-5 11 L0 5 L5 11" fill="none" stroke="${K.w}" stroke-width="2.6"/>`);
export const zs13=()=>zsBox(`<path d="M-6 5 V21 M-6 13 H7" fill="none" stroke="${K.y}" stroke-width="3"/>`);
export const zsLights=(kind:'zs1'|'zs7'|'zs8',blink=false)=>`<g transform="translate(30 0)">${zsSide(kind,true,blink)}</g>`+post(23,100);
export const labelBoard=(t:string)=>post(24,110)+`<rect x="-12" y="0" width="24" height="24" fill="#fff" stroke="#222" stroke-width="1.3"/><text x="0" y="15.5" text-anchor="middle" font-size="9" font-weight="600" style="fill:#555">${t}</text>`;
export function wn1(orange=false){return `<rect x="-2" y="20" width="4" height="22" fill="#8e8d87"/>`+base(42)+`<rect x="-11" y="0" width="22" height="22" rx="2" fill="${orange?'#e8731c':'#111'}" stroke="#e4e3dc" stroke-width="1.4"/><rect x="-2.5" y="4" width="5" height="14" fill="#fff"/>`}
export function fltMast(marked=false){return `<rect x="-2" y="0" width="4" height="34" fill="#8e8d87"/>`+(marked?mschild(12,'wrw'):'')+`<rect x="-2" y="2" width="20" height="2.5" fill="#8e8d87"/>`}
export const pic=(inner:string,w=90,h=150,sc=1,ox=45,oy=6)=>`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><g transform="translate(${ox} ${oy}) scale(${sc})">${inner}</g></svg>`;
