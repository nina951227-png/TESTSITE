const $=s=>document.querySelector(s),K0='polyquiz',pad=n=>String(n).padStart(2,'0');
const BANKS={'1':{name:'考科一：高分子化性與物性',get Q(){return Q1}},'2':{name:'考科二：高分子材料特性與加工概論',get Q(){return Q2}}};
let S='2',Q=Q2,K=K0+S;
function setSubject(s){S=s;Q=BANKS[s].Q;K=K0+s}
let L,A,F,cur,mode,ins,t0,te,tid,sub;
const sh=a=>a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
const view=id=>['home','quiz','result'].forEach(s=>$('#'+s).hidden=s!=id);
const fmt=ms=>{const s=Math.floor(ms/1000);return pad(Math.floor(s/60))+':'+pad(s%60)};
function save(){try{localStorage[K]=JSON.stringify({L:L.map(q=>Q.indexOf(q)),A,F,cur,mode,ins,t0})}catch(e){}}

function home(){
  clearInterval(tid);view('home');
  setSubject(document.querySelector('[name=s]:checked').value);
  $('#info').textContent='題庫目前 '+Q.length+' 題';
  $('#allcnt').textContent=Q.length;
  let d=null;try{d=localStorage[K]}catch(e){}
  $('#resume').hidden=!d;
}
$('#go').onclick=()=>{
  setSubject(document.querySelector('[name=s]:checked').value);
  const n=document.querySelector('[name=n]:checked').value;
  mode=document.querySelector('[name=m]:checked').value;ins=$('#ins').checked;
  start(n=='50'?sh(Q).slice(0,50):Q.slice());
};
$('#resume').onclick=()=>{
  setSubject(document.querySelector('[name=s]:checked').value);
  try{const d=JSON.parse(localStorage[K]);L=d.L.map(i=>Q[i]);A=d.A;F=d.F;cur=d.cur;mode=d.mode;ins=d.ins;t0=d.t0;sub=false;begin()}catch(e){home()}
};
$('#cardbtn').onclick=()=>$('#side').classList.toggle('open');

function start(list){L=list;A=L.map(()=>null);F=L.map(()=>false);cur=0;t0=Date.now();sub=false;begin()}
function begin(){view('quiz');clearInterval(tid);tid=setInterval(tick,1000);tick();render()}
function tick(){$('#tm').textContent='⏱ '+fmt(Date.now()-t0)}

function qHTML(i,rev){
  const q=L[i],a=A[i],lock=rev||(ins&&mode=='one'&&a!=null);
  const ops=q[1].map((t,k)=>{
    let c='';if(lock){if(k==q[2])c='ok';else if(k==a)c='no'}else if(k==a)c='sel';
    return `<button class="op ${c}" ${lock?'disabled':''} onclick="pick(${i},${k})">(${k+1}) ${t}</button>`}).join('');
  const st=rev?`<div class="st ${a==q[2]?'ok':'no'}">${a==null?'未作答，':a==q[2]?'✔ 答對':'✘ 答錯，'}${a==q[2]?'':'正確答案 ('+(q[2]+1)+')'}</div>`:'';
  return `<div class="qb" id="q${i}"><div class="qh"><span>第 ${i+1} 題</span><button class="${F[i]?'on':''}" onclick="flag(${i})" title="標記">🚩</button></div><p>${q[0]}</p>${q[3]?`<img class="fig" src="${q[3]}" alt="題目附圖">`:''}${ops}${st}</div>`;
}
function render(){
  const done=A.filter(x=>x!=null).length;
  $('#prog').textContent=mode=='one'?`${cur+1} / ${L.length}`:`已答 ${done} / ${L.length}`;
  $('#qa').innerHTML=mode=='one'
    ?qHTML(cur)+`<div class="nav"><button class="btn alt" onclick="go(cur-1)">上一題</button><button class="btn" onclick="go(cur+1)">下一題</button></div>`
    :L.map((_,i)=>qHTML(i)).join('');
  $('#grid').innerHTML=L.map((_,i)=>`<button class="g ${A[i]!=null?'a':''} ${F[i]?'f':''} ${mode=='one'&&i==cur?'c':''}" onclick="go(${i})">${i+1}</button>`).join('');
  save();
}
function upd(i){
  if(mode=='all'){const e=$('#q'+i);const y=scrollY;e.outerHTML=qHTML(i);
    $('#prog').textContent=`已答 ${A.filter(x=>x!=null).length} / ${L.length}`;
    $('#grid').innerHTML=L.map((_,j)=>`<button class="g ${A[j]!=null?'a':''} ${F[j]?'f':''}" onclick="go(${j})">${j+1}</button>`).join('');save()}
  else render();
}
function pick(i,k){A[i]=k;upd(i)}
function flag(i){F[i]=!F[i];upd(i)}
function go(i){
  if(i<0||i>=L.length)return;
  if(mode=='one'){cur=i;render();scrollTo(0,0)}else $('#q'+i).scrollIntoView({behavior:'smooth',block:'start'});
  $('#side').classList.remove('open');
}
function submit(){
  const n=A.filter(x=>x==null).length;
  if(!confirm((n?`還有 ${n} 題未作答，`:'')+'確定要交卷嗎？'))return;
  sub=true;clearInterval(tid);te=Date.now();
  try{delete localStorage[K]}catch(e){}
  result('all');
}
function result(f){
  view('result');scrollTo(0,0);
  const c=L.filter((q,i)=>A[i]===q[2]).length,u=A.filter(x=>x==null).length,w=L.length-c-u;
  const sc=+(c*100/L.length).toFixed(1);
  $('#sum').innerHTML=`<div class="score">${sc}<small> / 100 分</small></div>
  <p>答對 ${c}・答錯 ${w}・未答 ${u}・正確率 ${Math.round(c/L.length*100)}%・用時 ${fmt(te-t0)}</p>`;
  const idx=L.map((_,i)=>i).filter(i=>f=='all'||(f=='wrong'&&A[i]!==L[i][2])||(f=='flag'&&F[i]));
  $('#rv').innerHTML=idx.map(i=>qHTML(i,1)).join('')||'<p class="mut">沒有符合的題目</p>';
}
function retry(){
  const w=L.filter((q,i)=>A[i]!==q[2]);
  if(!w.length)return alert('沒有錯題，太棒了！');
  start(sh(w));
}
document.querySelectorAll('[name=s]').forEach(r=>r.onchange=home);
home();
