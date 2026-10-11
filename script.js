/* ===== PERSONALIZÁ: palabras "te amo" (sin español) ===== */
const WORDS=["I love you","Je t'aime","Ti amo","Ich liebe dich","Eu te amo","Rohayhu","愛してる","我爱你","사랑해",
"Σ'αγαπώ","Я тебя люблю","أحبك","Ik hou van je","Jag älskar dig","Seni seviyorum","Kocham cię","Szeretlek",
"Te iubesc","Mahal kita","Rakastan sinua","Volim te","Aloha au iā 'oe","Mi amas vin","Ég elska þig"];
const COLORS=["#f3e6ff","#ff9ec6","#e8cf94","#fff","#c9a8ff"];
/* ===== PERSONALIZÁ: mensajes que aparecen al tocar el corazón ===== */
const HMSG=["Todos los idiomas del mundo se quedan cortos para decirte lo que siento ♥",
"Sos mi estrella favorita en todo el cielo ✦","Con vos cualquier lugar se siente como hogar ❀",
"Cada día a tu lado es mi regalo preferido ♥","Si volviera a nacer, te volvería a elegir ✧","Te amo más de lo que cualquier palabra puede decir ♥"];

const $=s=>document.querySelector(s);
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const scenes=[...document.querySelectorAll('.page')];
const prev=$('#prev'),next=$('#next'),dotsBox=$('#dots'),bar=$('#bar b');
let cur=0,unlocked=0,busy=false,began=false,revealed=false,hi=0,timers=[];
const done={heart:false,gift:false,letter:false};
const later=(f,ms)=>timers.push(setTimeout(f,ms));

/* ===== MÚSICA: una sola reproducción, empieza tras la primera interacción ===== */
const bgm=$('#bgm'),hint=$('#hint'),snd=$('#snd');
const EV=['pointerdown','touchend','click','keydown'];
let started=false,trying=false;
function sndIcon(){snd.textContent=(!started||bgm.muted)?'🔇':'🔊'}
function startMusic(){
  if(started||trying)return;trying=true;bgm.volume=.7;
  const p=bgm.play();
  Promise.resolve(p).then(()=>{started=true;trying=false;hint.classList.add('off');sndIcon();EV.forEach(e=>removeEventListener(e,startMusic))})
   .catch(()=>{trying=false});
}
EV.forEach(e=>addEventListener(e,startMusic));
bgm.addEventListener('error',()=>{hint.textContent='Falta el archivo audio/musica.mp3';hint.classList.remove('off')});
['pointerdown','touchend','click'].forEach(e=>snd.addEventListener(e,ev=>ev.stopPropagation()));
snd.addEventListener('click',()=>{if(!started){startMusic();return}bgm.muted=!bgm.muted;sndIcon()});
sndIcon();

/* ===== NAVEGACIÓN Y DESBLOQUEOS ===== */
scenes.forEach((_,i)=>{const d=document.createElement('i');d.onclick=()=>go(i);dotsBox.appendChild(d)});
const dots=[...dotsBox.children];
function ui(){
  dots.forEach((d,i)=>{d.classList.toggle('on',i===cur);d.classList.toggle('ok',i<=unlocked&&i!==cur)});
  bar.style.width=(unlocked/(scenes.length-1)*100)+'%';
  prev.disabled=cur===0;next.disabled=cur>=scenes.length-1||cur+1>unlocked;
}
function unlock(n){if(n>unlocked){unlocked=n;ui()}}
function go(i){
  if(busy||i===cur||i<0||i>=scenes.length||i>unlocked)return;
  busy=true;cur=i;
  scenes.forEach((s,k)=>{s.classList.toggle('active',k===i);s.classList.toggle('left',k<i)});
  scenes[i].scrollTop=0;
  if(i===2)unlock(3);
  if(i===5)checkStar();
  ui();setTimeout(()=>busy=false,450);
}
prev.onclick=()=>go(cur-1);next.onclick=()=>go(cur+1);
addEventListener('keydown',e=>{if(e.key==='ArrowRight')go(cur+1);if(e.key==='ArrowLeft')go(cur-1)});

/* Escena 1 */
$('#start').onclick=()=>{
  if(began)return;began=true;startMusic();
  document.body.classList.add('lit');burst(innerWidth/2,innerHeight/2,50);
  unlock(1);later(()=>go(1),800);
};

/* Escena 2: tocar el corazón */
const hc=$('#heart'),hx=hc.getContext('2d'),hmsg=$('#hmsg');
function heartTap(x,y){
  burst(x,y,26);hmsg.textContent=HMSG[hi++%HMSG.length];
  hmsg.classList.remove('in');void hmsg.offsetWidth;hmsg.classList.add('in');
  if(!done.heart){done.heart=true;unlock(2);$('#t1').textContent='✧ Podés seguir tocándolo… o continuar con “Siguiente” ✧'}
}
hc.addEventListener('pointerdown',e=>heartTap(e.clientX,e.clientY));
hc.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();const r=hc.getBoundingClientRect();heartTap(r.left+r.width/2,r.top+r.height/2)}});

/* Escena 3: caja de regalo */
const gift=$('#gift');
gift.onclick=()=>{
  if(gift.classList.contains('open'))return;
  gift.classList.add('open');$('#dedic').classList.add('show');
  const r=gift.getBoundingClientRect();burst(r.left+r.width/2,r.top,60);
  done.gift=true;unlock(4);$('#t3').textContent='✧ Tu regalo está abierto. Seguí con “Siguiente” ✧';
};

/* Escena 4: sobre y carta */
const env=$('#env'),letter=$('#letter');
env.onclick=()=>{
  if(env.classList.contains('open'))return;
  env.classList.add('open');$('#t4').textContent='';
  const kids=[...letter.children];kids.forEach((c,i)=>c.style.setProperty('--i',i));
  later(()=>{env.hidden=true;letter.hidden=false;letter.classList.add('show')},1600);
  later(()=>{done.letter=true;unlock(5);$('#t4').textContent='✧ Seguí con “Siguiente” ✧'},1600+1400+kids.length*1000);
};

/* Escena 5: estrella secreta */
const sp=$('#sp'),cst=$('#const'),secret=$('#secret'),again=$('#again'),t5=$('#t5');
const ready=()=>done.heart&&done.gift&&done.letter;
function checkStar(){
  sp.classList.toggle('ready',ready());
  if(!revealed)t5.textContent=ready()?'✧ La estrella despertó. Tocala ✧':'✧ Esta estrella sigue dormida: tocá el corazón, abrí tu regalo y leé tu carta ✧';
}
function starTap(){
  if(revealed)return;
  if(!ready()){sp.classList.remove('shake');void sp.getBoundingClientRect();sp.classList.add('shake');checkStar();return}
  revealed=true;cst.classList.add('lit');t5.textContent='';
  const r=sp.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,70);rain();
  later(()=>secret.classList.add('show'),900);later(()=>{again.hidden=false},3500);
}
sp.addEventListener('click',starTap);
sp.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();starTap()}});

/* Volver a empezar (sin recargar; la música sigue) */
again.onclick=()=>{
  timers.forEach(clearTimeout);timers=[];
  Object.keys(done).forEach(k=>done[k]=false);revealed=false;began=false;hi=0;
  document.body.classList.remove('lit');
  hmsg.textContent='Cada palabra de este corazón es una forma distinta de decir lo mismo: que te amo con todo lo que soy.';
  $('#t1').textContent='✧ Tocá el corazón para escuchar lo que tiene que decirte ✧';
  gift.classList.remove('open');$('#dedic').classList.remove('show');$('#t3').textContent='✧ Tocá la caja para abrirla ✧';
  env.classList.remove('open');env.hidden=false;letter.hidden=true;letter.classList.remove('show');$('#t4').textContent='✧ Tocá el sobre para abrirlo ✧';
  cst.classList.remove('lit');sp.classList.remove('ready');secret.classList.remove('show');again.hidden=true;
  unlocked=0;busy=false;go(0);ui();
};

/* ===== CORAZÓN GIRATORIO DE PALABRAS (canvas) ===== */
let HS=300,pts=[],ang=0,pulse=0;
function sizeHeart(){
  HS=Math.max(240,Math.min(innerWidth*.94,innerHeight*.46,440));const d=Math.min(devicePixelRatio||1,2);
  hc.style.width=hc.style.height=HS+'px';hc.width=hc.height=HS*d;hx.setTransform(d,0,0,d,0,0);
}
(function(){
  let k=0;
  [[1,64],[.8,48],[.6,34],[.4,20],[.2,8]].forEach(([sc,n],li)=>{
    for(let i=0;i<n;i++){
      const t=i/n*Math.PI*2+li*.3;
      pts.push({x:16*Math.sin(t)**3*sc,y:-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))*sc,
        z:((i%2)*2-1)*(5-li)*1.6,w:WORDS[k++%WORDS.length],c:COLORS[k%COLORS.length],o:li===0});
    }
  });
})();
function drawHeart(t){
  hx.clearRect(0,0,HS,HS);ang+=reduce?.004:.012;
  const cs=Math.cos(ang),sn=Math.sin(ang),b=Math.sin(t/260),beat=1+.04*Math.max(0,b)*b;
  hx.textAlign='center';hx.textBaseline='middle';
  for(let k=0;k<16;k++){ // destellos alrededor
    hx.globalAlpha=Math.abs(Math.sin(t/700+k*1.9))*.8;hx.fillStyle='#fff';
    hx.fillRect(HS/2+Math.cos(k*2.4)*HS*.47,HS/2+Math.sin(k*1.7)*HS*.45,2,2);
  }
  const arr=pts.map(p=>({p,x:p.x*cs+p.z*sn,z:-p.x*sn+p.z*cs})).sort((a,b)=>a.z-b.z);
  for(const {p,x,z} of arr){
    const f=1+z/60;
    hx.globalAlpha=Math.min(1,.3+.7*(z+16)/32);
    hx.font=`${(p.o?HS/27:HS/32)*f}px Georgia,serif`;
    hx.fillStyle=p.c;hx.shadowColor='#c77dff';hx.shadowBlur=p.o?10:5;
    hx.fillText(p.w,HS/2+x*HS/40*beat*f*.95,HS/2+(p.y-2.5)*HS/40*beat);
  }
  hx.globalAlpha=1;hx.shadowBlur=0;
}

/* ===== CIELO: estrellas, pétalos, destellos y estrellas fugaces ===== */
const fc=$('#fx'),fx=fc.getContext('2d');
const ICONS=['♥','✦','❀','✧','❁','♡'],PC=['#ff9ec6','#f3e6ff','#e8cf94','#c9a8ff','#fff'];
let W,H,stars=[],ps=[],sparks=[],meteors=[];
const rnd=Math.random;
function newP(init){return{x:rnd()*W,y:init?rnd()*H:H+30,s:10+rnd()*16,v:.25+rnd()*.6,ph:rnd()*6.28,
  ch:ICONS[rnd()*ICONS.length|0],c:PC[rnd()*PC.length|0]}}
function sizeFx(){
  W=innerWidth;H=innerHeight;const d=Math.min(devicePixelRatio||1,2);
  fc.width=W*d;fc.height=H*d;fx.setTransform(d,0,0,d,0,0);
  stars=Array.from({length:W<700?70:130},()=>({x:rnd()*W,y:rnd()*H,r:rnd()*1.4+.5,ph:rnd()*6.28}));
  ps=Array.from({length:reduce?8:(W<700?20:38)},()=>newP(true));
}
function burst(x,y,n){if(reduce)n=Math.min(n,8);for(let i=0;i<n;i++){const a=rnd()*6.28,v=1+rnd()*4;
  sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1,l:1,c:PC[rnd()*PC.length|0]})}}
function rain(){if(reduce)return;for(let i=0;i<45;i++)meteors.push({x:rnd()*(W+300),y:-rnd()*H,vx:-3-rnd()*2,vy:5+rnd()*3,l:1})}
function drawFx(t){
  fx.clearRect(0,0,W,H);
  const lit=document.body.classList.contains('lit')?1:.7;
  fx.fillStyle='#fff';
  for(const s of stars){fx.globalAlpha=(.25+.75*Math.abs(Math.sin(t/1100+s.ph)))*lit;fx.fillRect(s.x,s.y,s.r,s.r)}
  fx.textAlign='center';
  for(const p of ps){
    p.y-=p.v;if(p.y<-30)Object.assign(p,newP(false));
    fx.save();fx.translate(p.x+Math.sin(t/1400+p.ph)*22,p.y);fx.rotate(Math.sin(t/1000+p.ph)*.4);
    fx.globalAlpha=.2+.35*Math.abs(Math.sin(t/900+p.ph));fx.font=p.s+'px serif';fx.fillStyle=p.c;fx.fillText(p.ch,0,0);fx.restore();
  }
  if(!reduce&&rnd()<.004)meteors.push({x:rnd()*W+150,y:-10,vx:-6,vy:3.5,l:1});
  fx.lineWidth=2;
  for(let i=meteors.length-1;i>=0;i--){const m=meteors[i];m.x+=m.vx;m.y+=m.vy;
    if(m.y>H||m.x<-100){meteors.splice(i,1);continue}
    if(m.y>0){fx.globalAlpha=.9;fx.strokeStyle='#fff3c8';fx.beginPath();fx.moveTo(m.x,m.y);fx.lineTo(m.x-m.vx*7,m.y-m.vy*7);fx.stroke()}}
  fx.font='14px serif';
  for(let i=sparks.length-1;i>=0;i--){const s=sparks[i];s.x+=s.vx;s.y+=s.vy;s.vy+=.05;s.l-=.016;
    if(s.l<=0){sparks.splice(i,1);continue}
    fx.globalAlpha=s.l;fx.fillStyle=s.c;fx.fillText('✦',s.x,s.y)}
  fx.globalAlpha=1;
}

function loop(t){drawFx(t);if(scenes[1].classList.contains('active'))drawHeart(t);requestAnimationFrame(loop)}
addEventListener('resize',()=>{sizeFx();sizeHeart()});
sizeFx();sizeHeart();ui();requestAnimationFrame(loop);