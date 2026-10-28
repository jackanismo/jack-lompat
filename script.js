const cv=document.getElementById('c'),ctx=cv.getContext('2d');
const W=cv.width,H=cv.height,G=H-50;
const sEl=document.getElementById('s'),hEl=document.getElementById('h'),mEl=document.getElementById('m'),bEl=document.getElementById('b');
let best=0;try{best=+localStorage.getItem('lompat-best')||0}catch(e){}
hEl.textContent=best;
let p,obs,speed,score,running=false,over=false,frame,last;
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
function reset(){p={x:70,y:G-40,w:36,h:40,vy:0,on:true,j:0};obs=[];en=[];co=[];cs=0;life=100;inv=0;setHp();boss=null;bossN=0;bp=[];lv=1;banner=null;nextBoss=500;pb=[];cd=0;parts=[];shake=0;dead=false;hearts=[];nextHeart=250;cv.style.transform='';speed=5;score=0;frame=0;sEl.textContent=0}
function setHp(){}
function jump(){
  if(paused||selecting||burn)return;
  if(over||!running){if(!intro)start();return}
  if(p.on||p.j<2){p.vy=p.on?-14.5:-13;p.on=false;p.j++;burst(p.x+p.w/2,p.y+p.h,p.j===1?8:12,p.j===1?'#d8c9a8':'#bfe9ff',{up:1,spread:2.2});sfx('jump')}
}
function start(){
  if(running)return;
  reset();running=true;over=false;mEl.style.display='none';bEl.textContent='Ulangi';bEl.style.display='none';paused=false;intro=false;document.getElementById('po').classList.add('hide');document.getElementById('pz').classList.remove('hide');
  if(initAudio())startMusic();last=performance.now();rafId=requestAnimationFrame(loop);
}
function spawn(){
  const h=30+Math.random()*35,w=22+Math.random()*20;
  obs.push({x:W+20,y:G-h,w,h,t:Math.floor(Math.random()*3)});
}
function update(){
  frame++;
  p.vy+=0.75;p.y+=p.vy;
  if(p.y>=G-p.h){if(!p.on&&p.vy>4)burst(p.x+p.w/2,G,8,'#d8c9a8',{up:1.5,spread:2.5});p.y=G-p.h;p.vy=0;p.on=true;p.j=0}
  if(p.on&&frame%7===0)burst(p.x+6,G-2,1,'#d8c9a8',{spread:.8,life:16});
  if(!p.on&&frame%2===0)burst(p.x+2,p.y+p.h*.5,1,'rgba(255,255,255,.8)',{spread:.4,life:14});
  speed=4.5;
  const gap=95;
  const lastO=obs[obs.length-1];
  if(!boss&&!hearts.some(h=>h.x>W-260)&&(!lastO||W-lastO.x>(gap*speed)/2+Math.random()*120+160*0+140))if(Math.random()<0.04||!lastO)spawn();
  obs.forEach(o=>o.x-=speed);
  en.forEach(e=>e.x-=speed+e.v);
  en=en.filter(e=>e.x+e.w>-50);
  co.forEach(c=>c.x-=speed);co=co.filter(c=>c.x>-20);
  hearts.forEach(h=>h.x-=speed);hearts=hearts.filter(h=>h.x>-20);
  if(score>=nextHeart&&!obs.some(o=>o.x>W-260)&&!en.some(e=>e.x>W-260)&&!bp.some(b=>b.x>W-260)){hearts.push({x:W+30,y:G-50-Math.random()*50});nextHeart+=250}
  if(frame%110===60&&Math.random()<0.8){
    const n=3+Math.floor(Math.random()*3),y=G-45-Math.random()*85;
    for(let i=0;i<n;i++)co.push({x:W+30+i*34,y:y-Math.sin(i/(n-1)*Math.PI)*22});
  }
  if(!boss&&!hearts.some(h=>h.x>W-260)&&frame%150===0&&(!lastO||W-lastO.x>170)&&Math.random()<0.85){
    if(Math.random()<0.5)en.push({x:W+20,y:G-34,w:34,h:34,v:2,t:0});
    else en.push({x:W+20,y:G-100,w:36,h:26,v:1,t:1});
  }
  obs=obs.filter(o=>o.x+o.w>-10);
  score+=speed/10;sEl.textContent=Math.floor(score);
  if(!boss&&score>=nextBoss){boss={x:W+120,y:G-110,ft:0,k:0,hp:100+bossN*50,mx:100+bossN*50,hit:0,n:bossN};banner={t:110,txt:'⚠ BOSS!',c:'#ff5252'};shBtn(true)}
  if(boss){
    if(boss.x>W-125)boss.x-=3;
    else{
      boss.ft++;
      if(boss.ft%Math.max(45,85-bossN*8)===0){boss.k++;bp.push(boss.k%2?{x:boss.x,y:G-26,w:26,h:26,v:speed+3,t:0}:{x:boss.x,y:G-122,w:26,h:26,v:speed+3.5,t:1})}
      if(boss.hp<=0){
        burst(boss.x+50,boss.y+55,60,['#ffb347','#ff5a1f','#ffe14d'],{spread:7,life:40});burst(boss.x+50,boss.y+55,30,'#fff',{spread:5});shake=20;const bonus=25+bossN*5;cs+=bonus;score+=100;bossN++;nextBoss=Math.floor(score)+500;
        banner={t:130,txt:'BOSS KALAH! +'+bonus+' KOIN',c:'#7CFC00'};boss=null;bp=[];sfx('coin');shBtn(false);
      }
    }
  }
  bp.forEach(b=>b.x-=b.v);bp=bp.filter(b=>b.x>-40);
  for(let i=bp.length-1;i>=0;i--){
    const b=bp[i];
    if(inv<=0&&p.x+6<b.x+b.w&&p.x+p.w-6>b.x&&p.y+p.h>b.y&&p.y<b.y+b.h){bp.splice(i,1);life-=15;inv=50;setHp();sfx('hit');hurt();if(life<=0){die();return}}
  }
  for(let i=hearts.length-1;i>=0;i--){
    const h=hearts[i];
    if(h.x+18>p.x&&h.x-18<p.x+p.w&&h.y+18>p.y&&h.y-18<p.y+p.h){hearts.splice(i,1);life=Math.min(100,life+20);setHp();sfx('heal');burst(h.x,h.y,14,['#ff3b6b','#ff9ab5','#ffffff'],{spread:3.5,up:1.5});banner={t:50,txt:'+20 HP',c:'#ff6b8b'}}
  }
  if(banner&&banner.t>0)banner.t--;
  stepParts();
  if(shake>0){shake--;cv.style.transform='translate('+((Math.random()-.5)*shake)+'px,'+((Math.random()-.5)*shake)+'px)'}else if(cv.style.transform)cv.style.transform='';
  if(cd>0)cd--;
  pb.forEach(b=>b.x+=b.v);pb=pb.filter(b=>b.x<W+20);
  if(boss&&boss.x<=W-125){
    for(let i=pb.length-1;i>=0;i--){
      const b=pb[i];
      if(b.x+b.w>boss.x+4&&b.x<boss.x+96&&b.y+b.h>boss.y&&b.y<boss.y+110){pb.splice(i,1);boss.hp-=10;boss.hit=6;sfx('bhit');burst(b.x+b.w,b.y,8,['#ffe14d','#fff'],{spread:3})}
    }
    if(boss.hit>0)boss.hit--;
  }
  for(const o of obs){
    if(inv<=0&&p.x+6<o.x+o.w&&p.x+p.w-6>o.x&&p.y+p.h>o.y+4&&p.y<o.y+o.h){obs.splice(obs.indexOf(o),1);life-=20;inv=50;sfx('hit');hurt();if(life<=0){die();return}break}
  }
  if(inv>0)inv--;
  for(let i=en.length-1;i>=0;i--){
    const e=en[i];
    if(inv<=0&&p.x+6<e.x+e.w-3&&p.x+p.w-6>e.x+3&&p.y+p.h>e.y+3&&p.y<e.y+e.h-3){
      en.splice(i,1);life-=10;inv=50;setHp();sfx('hit');hurt();
      if(life<=0){die();return}
    }
  }
  for(let i=co.length-1;i>=0;i--){
    const c=co[i];
    if(c.x+11>p.x&&c.x-11<p.x+p.w&&c.y+11>p.y&&c.y-11<p.y+p.h){co.splice(i,1);cs++;sfx('coin');burst(c.x,c.y,10,['#ffd84a','#fff3b0'],{spread:3})}
  }
}
function die(){
  running=false;over=true;bEl.style.display='';night=!night;life=0;setHp();sfx('over');tot+=cs;try{localStorage.setItem('lompat-coins',tot)}catch(e){}document.getElementById('pz').classList.add('hide');shBtn(false);cv.style.transform='';
  const sc=Math.floor(score);
  if(sc>best){best=sc;hEl.textContent=best;try{localStorage.setItem('lompat-best',best)}catch(e){}}
  startBurn(sc);
}
// awan realistis: gumpalan bulat bertumpuk, dasar rata, bayangan di bawah, lapisan jauh lebih pucat
const CLOUDS=[{x:300,y:84,s:.7,sp:.2,f:1},{x:700,y:94,s:.6,sp:.15,f:1},{x:160,y:104,s:.8,sp:.25,f:1},{x:60,y:44,s:1,sp:.35,f:0},{x:520,y:34,s:1.25,sp:.4,f:0},{x:430,y:64,s:.9,sp:.3,f:0}];
const PF=[[0,0,17],[22,-11,23],[48,-5,19],[68,3,14],[-16,5,12]];
function cloud(c){
  const L=W+260,px=((c.x-frame*c.sp)%L+L)%L-130,s=c.s;
  const col=night?(c.f?['#4d5890','#39427a']:['#6f7bb0','#4a5588']):(c.f?['#f3f8fd','#d8e4f2']:['#ffffff','#cfdcec']);
  [5*s,0].forEach((off,i)=>{
    ctx.fillStyle=col[1-i];
    PF.forEach(([dx,dy,r])=>{ctx.beginPath();ctx.arc(px+dx*s,c.y+dy*s+off,r*s,0,7);ctx.fill()});
    ctx.beginPath();ctx.roundRect(px-24*s,c.y-2*s+off,110*s,16*s,8*s);ctx.fill();
  });
}
function draw(){
  ctx.clearRect(0,0,W,H);
  // langit siang/malam
  if(theme!=='default')themeBg();else{
  const sg=ctx.createLinearGradient(0,0,0,G);
  if(night){sg.addColorStop(0,'#0b1235');sg.addColorStop(1,'#2b3668')}
  else{sg.addColorStop(0,'#6ec3f5');sg.addColorStop(1,'#dff1ff')}
  ctx.fillStyle=sg;ctx.fillRect(0,0,W,H);
  if(night){
    ctx.fillStyle='rgba(255,255,255,.85)';
    for(let i=0;i<40;i++){ctx.fillRect((i*97)%W,(i*53)%(G-60)+6,i%3?1.5:2.5,i%3?1.5:2.5)}
    ctx.fillStyle='#f3f0d8';ctx.beginPath();ctx.arc(620,60,24,0,7);ctx.fill();
    ctx.fillStyle='#2b3668';ctx.beginPath();ctx.arc(630,54,20,0,7);ctx.fill();
  }else{
    ctx.fillStyle='rgba(255,214,70,.35)';ctx.beginPath();ctx.arc(620,60,40,0,7);ctx.fill();
    ctx.fillStyle='#ffd646';ctx.beginPath();ctx.arc(620,60,26,0,7);ctx.fill();
  }
  // awan
  CLOUDS.forEach(cloud);
  // gunung
  const hs=[1,.65,.85,.55];
  [[0.12,230,110,night?'#2a3560':'#9bb5c9'],[0.3,170,80,night?'#1c2447':'#6f8fa8']].forEach(([sp,w,h,col])=>{
    const off=frame*(speed||5)*sp;
    ctx.fillStyle=col;
    for(let k=Math.floor(off/w)-1;k*w-off<W+w;k++){
      const x0=k*w-off,hh=h*hs[((k%4)+4)%4]*(w>200?1.3:1);
      ctx.beginPath();ctx.moveTo(x0,G);ctx.lineTo(x0+w/2,G-hh);ctx.lineTo(x0+w,G);ctx.closePath();ctx.fill();
      if(w>200){ctx.fillStyle=night?'#cfd6f5':'#fff';ctx.beginPath();ctx.moveTo(x0+w/2,G-hh);ctx.lineTo(x0+w/2-hh*0.2,G-hh*0.78);ctx.lineTo(x0+w/2+hh*0.2,G-hh*0.78);ctx.closePath();ctx.fill();ctx.fillStyle=col}
    }
  });
  }
  drawTrees();
  // tanah
  if(theme==='custom'){
    ctx.fillStyle='#4a4d55';ctx.fillRect(0,G,W,H-G);
    ctx.fillStyle='#d9d9d9';ctx.fillRect(0,G,W,3);
    ctx.fillStyle='#f4c430';
    for(let x=-(frame*speed)%80;x<W;x+=80)ctx.fillRect(x,G+26,44,4);
    ctx.fillStyle='#3a3d44';ctx.fillRect(0,H-8,W,8);
  }else if(theme==='cyber'){
    ctx.fillStyle='#14002b';ctx.fillRect(0,G,W,H-G);
    ctx.fillStyle='#00e5ff';ctx.fillRect(0,G,W,3);
    ctx.strokeStyle='rgba(255,43,214,.6)';ctx.lineWidth=1;
    for(let x=-(frame*speed)%50;x<W;x+=50){ctx.beginPath();ctx.moveTo(x,G+3);ctx.lineTo(x-20,H);ctx.stroke()}
  }else if(theme==='space'){
    ctx.fillStyle='#5b5b6e';ctx.fillRect(0,G,W,H-G);
    ctx.fillStyle='#46465a';
    for(let x=-(frame*speed)%90;x<W;x+=90){ctx.beginPath();ctx.ellipse(x+30,G+22,18,6,0,0,7);ctx.fill()}
  }else if(theme==='egypt'){
    ctx.fillStyle='#d9a85c';ctx.fillRect(0,G,W,H-G);
    ctx.fillStyle='#c4903f';
    for(let x=-(frame*speed)%70;x<W;x+=70)ctx.fillRect(x,G+26,32,3);
  }else if(theme==='greece'){
    ctx.fillStyle='#ece7da';ctx.fillRect(0,G,W,H-G);
    ctx.fillStyle='#cfc8b4';ctx.fillRect(0,G,W,3);
    ctx.strokeStyle='#d6cfbb';ctx.lineWidth=1;
    for(let x=-(frame*speed)%60;x<W;x+=60){ctx.beginPath();ctx.moveTo(x,G+3);ctx.lineTo(x,H);ctx.stroke()}
  }else if(theme==='indo'){
    ctx.fillStyle='#8a5a2b';ctx.fillRect(0,G,W,H-G);
    ctx.fillStyle='#e9c46a';
    for(let x=-(frame*speed)%40;x<W;x+=40){ctx.beginPath();ctx.moveTo(x+12,G+16);ctx.lineTo(x+20,G+26);ctx.lineTo(x+12,G+36);ctx.lineTo(x+4,G+26);ctx.fill()}
  }else{
  ctx.fillStyle=css('--ground');ctx.fillRect(0,G,W,H-G);
  if(night){ctx.fillStyle='rgba(0,0,40,.4)';ctx.fillRect(0,G,W,H-G)}
  }
  ctx.fillStyle='rgba(0,0,0,.2)';
  for(let x=-(frame*speed)%40;x<W;x+=40)ctx.fillRect(x,G+14,18,3);
  // rintangan
  ctx.fillStyle=theme==='cyber'?'#00e5ff':theme==='space'?'#9a9aae':theme==='egypt'?'#7a4a14':theme==='greece'?'#8b7a55':theme==='indo'?'#8a3b12':css('--obs');
  obs.forEach(o=>{if(theme==='custom'&&bgImg)drawObs(o);else{ctx.beginPath();ctx.roundRect(o.x,o.y,o.w,o.h,5);ctx.fill()}});
  // heart
  hearts.forEach(h=>{
    const s=11+Math.sin(frame/8)*1.5,y=h.y+Math.sin(frame/12+h.x/40)*3;
    ctx.fillStyle='rgba(255,59,107,.28)';ctx.beginPath();ctx.arc(h.x,y,s*1.7,0,7);ctx.fill();
    ctx.fillStyle='#ff3b6b';ctx.beginPath();
    ctx.moveTo(h.x,y+s*.9);ctx.bezierCurveTo(h.x-s*1.6,y-s*.2,h.x-s*.7,y-s*1.2,h.x,y-s*.4);
    ctx.bezierCurveTo(h.x+s*.7,y-s*1.2,h.x+s*1.6,y-s*.2,h.x,y+s*.9);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.ellipse(h.x-s*.5,y-s*.4,s*.22,s*.12,-.6,0,7);ctx.fill();
  });
  // koin
  co.forEach(c=>{
    const bob=Math.sin(frame/12+c.x/40)*3,rx=Math.max(2,Math.abs(Math.cos(frame/9+c.x/50))*10);
    ctx.fillStyle='#ffc928';ctx.strokeStyle='#c98a00';ctx.lineWidth=2;
    ctx.beginPath();ctx.ellipse(c.x,c.y+bob,rx,11,0,0,7);ctx.fill();ctx.stroke();
    ctx.fillStyle='#ffe58a';ctx.beginPath();ctx.ellipse(c.x,c.y+bob,rx*0.55,6,0,0,7);ctx.fill();
  });
  // musuh
  en.forEach(e=>{
    if(e.t===0){
      ctx.fillStyle='#b33a3a';ctx.beginPath();ctx.roundRect(e.x,e.y,e.w,e.h,10);ctx.fill();
      ctx.fillStyle='#fff';ctx.fillRect(e.x+6,e.y+10,8,8);ctx.fillRect(e.x+20,e.y+10,8,8);
      ctx.fillStyle='#222';ctx.fillRect(e.x+8,e.y+13,4,5);ctx.fillRect(e.x+22,e.y+13,4,5);
      ctx.fillRect(e.x+5,e.y+6,10,3);ctx.fillRect(e.x+19,e.y+6,10,3);
    }else{
      const f=Math.floor(frame/6)%2?7:-7;
      ctx.fillStyle='#6a3fb5';
      ctx.beginPath();ctx.ellipse(e.x+18,e.y+14,13,11,0,0,7);ctx.fill();
      ctx.beginPath();ctx.moveTo(e.x+8,e.y+10);ctx.lineTo(e.x-6,e.y+8-f);ctx.lineTo(e.x+6,e.y+20);ctx.fill();
      ctx.beginPath();ctx.moveTo(e.x+28,e.y+10);ctx.lineTo(e.x+42,e.y+8-f);ctx.lineTo(e.x+30,e.y+20);ctx.fill();
      ctx.fillStyle='#fff';ctx.fillRect(e.x+10,e.y+9,6,6);ctx.fillRect(e.x+20,e.y+9,6,6);
      ctx.fillStyle='#c00';ctx.fillRect(e.x+12,e.y+11,3,3);ctx.fillRect(e.x+22,e.y+11,3,3);
    }
  });
  // boss & proyektil
  pb.forEach(b=>{ctx.fillStyle='#ffe14d';ctx.fillRect(b.x,b.y,b.w,b.h);ctx.fillStyle='#fff';ctx.fillRect(b.x+b.w-5,b.y+1,5,b.h-2)});
  bp.forEach(b=>{
    ctx.fillStyle='rgba(255,90,31,.4)';ctx.fillRect(b.x+26,b.y+9,24,8);
    ctx.fillStyle=b.t?'#ffcc00':'#ff5a1f';ctx.beginPath();ctx.arc(b.x+13,b.y+13,13,0,7);ctx.fill();
    ctx.fillStyle='#fff3b0';ctx.beginPath();ctx.arc(b.x+13,b.y+13,6,0,7);ctx.fill();
  });
  if(boss){
    const bx=boss.x,by=boss.y+Math.sin(frame/10)*6,pal=[['#7b2cbf','#c77dff'],['#b3171c','#ff6b6b'],['#0b7285','#66d9e8'],['#e67700','#ffd43b']][boss.n%4];
    ctx.fillStyle=pal[0];ctx.beginPath();ctx.roundRect(bx,by,100,110,24);ctx.fill();
    ctx.fillStyle=pal[1];
    ctx.beginPath();ctx.moveTo(bx+8,by+10);ctx.lineTo(bx+22,by-22);ctx.lineTo(bx+36,by+8);ctx.fill();
    ctx.beginPath();ctx.moveTo(bx+64,by+8);ctx.lineTo(bx+78,by-22);ctx.lineTo(bx+92,by+10);ctx.fill();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(bx+32,by+44,12,0,7);ctx.arc(bx+68,by+44,12,0,7);ctx.fill();
    ctx.fillStyle='#d00000';ctx.beginPath();ctx.arc(bx+30,by+46,6,0,7);ctx.arc(bx+66,by+46,6,0,7);ctx.fill();
    ctx.fillStyle='#111';ctx.fillRect(bx+18,by+26,28,5);ctx.fillRect(bx+54,by+26,28,5);ctx.fillRect(bx+25,by+78,50,10);
    ctx.fillStyle='#fff';for(let i=0;i<5;i++)ctx.fillRect(bx+27+i*10,by+78,5,6);
    if(boss.hit>0){ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.roundRect(bx,by,100,110,24);ctx.fill()}
    const fr=Math.max(0,boss.hp/boss.mx);
    ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(bx,by-36,100,9);
    ctx.fillStyle='#ff4d4d';ctx.fillRect(bx,by-36,100*fr,9);
  }
  // pemain
  if(!intro){
  ctx.globalAlpha=(burn||dead)?0:((inv>0&&Math.floor(inv/4)%2)?0.3:1);
  if(ch===4&&img){
    const bw=90,bh=100,k=Math.min(bw/img.width,bh/img.height),dw=img.width*k,dh=img.height*k;
    ctx.drawImage(img,p.x+p.w/2-dw/2,p.y+p.h-dh,dw,dh);
  }else{
    drawChar(ctx,ch,p.x,p.y,p.w,p.h);
  }
  // kaki
  if(ch===0&&p.on){ctx.fillStyle=css('--player');const o=Math.floor(frame/6)%2?4:0;ctx.fillRect(p.x+6,p.y+p.h,8,4+o*0);ctx.fillRect(p.x+22,p.y+p.h-o,8,0)}
  ctx.globalAlpha=1;
  }
  if(burn)drawBurnChar();
  parts.forEach(q=>{ctx.globalAlpha=Math.max(0,1-q.l/q.m);ctx.fillStyle=q.c;if(q.sq)ctx.fillRect(q.x-q.r,q.y-q.r,q.r*2,q.r*2);else{ctx.beginPath();if(q.pt)ctx.ellipse(q.x,q.y,q.r*1.6,q.r*.8,q.l*.25,0,7);else ctx.arc(q.x,q.y,q.r,0,7);ctx.fill()}});
  ctx.globalAlpha=1;
  drawWeather();
  if(!intro){
  // bar HP (kiri atas)
  const hw=150,hr=Math.max(0,life)/100;
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.roundRect(12,12,hw,18,9);ctx.fill();
  if(hr>0){ctx.fillStyle=life>50?'#3fbf5f':life>25?'#e0a020':'#d33';ctx.beginPath();ctx.roundRect(12,12,Math.max(18,hw*hr),18,9);ctx.fill()}
  ctx.fillStyle='#fff';ctx.font='bold 12px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('HP '+Math.max(0,life)+'/100',12+hw/2,21);
  // skor koin (kiri atas, di bawah HP)
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.roundRect(12,36,hw,20,10);ctx.fill();
  ctx.fillStyle='#ffc928';ctx.strokeStyle='#c98a00';ctx.lineWidth=2;ctx.beginPath();ctx.arc(24,46,7,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle='#fff';ctx.textAlign='left';ctx.fillText('× '+cs,38,46);
  ctx.textAlign='right';ctx.fillText('Total '+tot,12+hw-10,46);ctx.textAlign='center';
  // skor & rekor (tengah atas)
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.roundRect(W/2-100,12,200,24,12);ctx.fill();
  ctx.fillStyle='#fff';ctx.font='bold 13px system-ui,sans-serif';ctx.textBaseline='middle';
  ctx.textAlign='left';ctx.fillText('Skor '+Math.floor(score),W/2-88,24);
  ctx.textAlign='right';ctx.fillText('Rekor '+best,W/2+88,24);ctx.textAlign='center';
  // username (kiri atas, di bawah koin)
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.roundRect(12,62,hw,20,10);ctx.fill();
  ctx.fillStyle='#fff';ctx.textAlign='left';ctx.fillText('👤 '+uname,22,72);ctx.textAlign='center';
  if(banner&&banner.t>0){
    ctx.globalAlpha=Math.min(1,banner.t/20);ctx.fillStyle=banner.c;ctx.font='bold 34px system-ui,sans-serif';
    ctx.shadowColor='rgba(0,0,0,.6)';ctx.shadowBlur=6;ctx.fillText(banner.txt,W/2,120);
    ctx.shadowBlur=0;ctx.globalAlpha=1;
  }
  }
}
function loop(t){
  if(!running){draw();return}
  update();draw();
  if(running)rafId=requestAnimationFrame(loop);else draw();
}
addEventListener('keydown',e=>{
  if(e.target&&e.target.tagName==='INPUT')return;
  if(e.code==='KeyF'||e.code==='KeyX'||e.code==='ArrowRight'){e.preventDefault();shoot();return}
  if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();if(intro){if(!selecting&&e.code==='Space')openSel()}else jump()}
});
cv.addEventListener('pointerdown',e=>{e.preventDefault();jump()});
bEl.addEventListener('click',()=>{if(running)return;bEl.blur();if(intro)openSel();else start()});
let img=null,night=false,life=100,inv=0,en=[],paused=false,rafId=0,co=[],cs=0,tot=0,intro=true,ch=0,selecting=false,boss=null,bossN=0,bp=[],lv=1,banner=null,nextBoss=500,lastRank=0,pb=[],cd=0,parts=[],shake=0,burn=null,dead=false,hearts=[],nextHeart=250;
let uname='';
try{uname=localStorage.getItem('lompat-user')||''}catch(e){}
let theme='default',owned=['default'],bgImg=null;
try{owned=JSON.parse(localStorage.getItem('lompat-owned'))||['default'];theme=localStorage.getItem('lompat-theme')||'default'}catch(e){}
if(!owned.includes(theme)||theme==='custom')theme='default';
let ownedC=[0,1,2,3,5,6,7,8,9,10,11,12,13,14,15,16];
try{tot=+localStorage.getItem('lompat-coins')||0}catch(e){}
const fEl=document.getElementById('f'),rEl=document.getElementById('r');
fEl.addEventListener('change',()=>{
  const file=fEl.files&&fEl.files[0];
  if(!file||!file.type.startsWith('image/'))return;
  const fr=new FileReader();
  fr.onload=()=>{
    const im=new Image();
    im.onload=()=>{img=im;ch=4;rEl.classList.remove('hide');if(selecting)openSel();if(!running)draw()};
    im.src=fr.result;
  };
  fr.readAsDataURL(file);
  fEl.value='';
});
rEl.addEventListener('click',()=>{img=null;if(ch===4)ch=0;rEl.classList.add('hide');if(selecting)openSel();if(!running)draw();rEl.blur()});
// ===== Audio (disintesis dengan WebAudio, tanpa file) =====
let ac=null,master,musicGain,sfxGain,nb,musicOn=true,sfxOn=true,vm=1,ve=1,musicTimer=null,nextT=0,step=0;
const SX=60/76/4,CH=[[57,60,64,67],[53,57,60,64],[48,52,55,59],[55,59,62,65]],BS=[45,41,36,43],PENT=[69,72,74,76,79];
const mf=n=>440*Math.pow(2,(n-69)/12);
function initAudio(){
  if(!ac){
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return false;
    ac=new AC();
    master=ac.createGain();master.gain.value=0.9;
    const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3000;
    master.connect(lp);lp.connect(ac.destination);
    musicGain=ac.createGain();musicGain.gain.value=musicOn?0.5*vm:0;musicGain.connect(master);
    sfxGain=ac.createGain();sfxGain.gain.value=0.6*ve;sfxGain.connect(ac.destination);
    nb=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);
    const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  }
  if(ac.state==='suspended')ac.resume();
  return true;
}
function tone(type,f,t,d,v,dest){
  const o=ac.createOscillator(),g=ac.createGain();
  o.type=type;o.frequency.value=f;
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v,t+0.03);g.gain.exponentialRampToValueAtTime(0.0001,t+d);
  o.connect(g);g.connect(dest||musicGain);o.start(t);o.stop(t+d+0.05);
}
function noise(t,d,type,f,v,dest){
  const s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=ac.createGain();
  s.buffer=nb;fl.type=type;fl.frequency.value=f;
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.0001,t+d);
  s.connect(fl);fl.connect(g);g.connect(dest||musicGain);s.start(t);s.stop(t+d+0.02);
}
function kick(t){
  const o=ac.createOscillator(),g=ac.createGain();
  o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(45,t+0.18);
  g.gain.setValueAtTime(0.5,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.25);
  o.connect(g);g.connect(musicGain);o.start(t);o.stop(t+0.3);
}
function sched(){
  while(nextT<ac.currentTime+0.3){
    const s=step%64,bar=Math.floor(s/16),k=s%16,t=nextT;
    if(k===0){CH[bar].forEach((n,i)=>{tone('triangle',mf(n),t+i*0.015,SX*15,0.07);tone('sine',mf(n)*1.004,t+i*0.015,SX*15,0.05)});tone('sine',mf(BS[bar]),t,SX*6,0.28)}
    if(k===10)tone('sine',mf(BS[bar]),t,SX*4,0.22);
    if(k===0||k===10)kick(t);
    if(k===4||k===12)noise(t,0.14,'bandpass',1800,0.12);
    if(k%2===0)noise(t+(k%4===2?0.035:0),0.05,'highpass',7000,k%4===0?0.05:0.03);
    if((k===6||k===14)&&Math.random()<0.55)tone('sine',mf(PENT[Math.floor(Math.random()*5)]),t+0.02,0.6,0.07);
    nextT+=SX;step++;
  }
}
function startMusic(){
  if(!ac||!musicOn||musicTimer)return;
  musicGain.gain.setTargetAtTime(0.5*vm,ac.currentTime,0.05);
  nextT=ac.currentTime+0.1;step=0;
  musicTimer=setInterval(sched,100);
}
function stopMusic(){
  if(musicTimer){clearInterval(musicTimer);musicTimer=null}
  if(ac)musicGain.gain.setTargetAtTime(0,ac.currentTime,0.05);
}
function sweep(type,f1,f2,t,d,v){
  const o=ac.createOscillator(),g=ac.createGain();
  o.type=type;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+d);
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.0001,t+d);
  o.connect(g);g.connect(sfxGain);o.start(t);o.stop(t+d+0.02);
}
function sfx(kind){
  if(!sfxOn||!ac||ac.state!=='running')return;
  const t=ac.currentTime;
  if(kind==='heal'){sweep('sine',523,784,t,0.12,0.18);sweep('sine',784,1047,t+0.1,0.16,0.18)}
  else if(kind==='shoot')sweep('square',900,300,t,0.08,0.1);
  else if(kind==='bhit')sweep('sawtooth',320,160,t,0.09,0.14);
  else if(kind==='click')sweep('triangle',520,780,t,0.06,0.15);
  else if(kind==='no')sweep('sawtooth',220,130,t,0.18,0.15);
  else if(kind==='coin'){sweep('square',988,1319,t,0.09,0.12);sweep('square',1319,1760,t+0.07,0.12,0.1)}
  else if(kind==='jump')sweep('square',280,620,t,0.15,0.18);
  else if(kind==='hit'){sweep('sawtooth',260,70,t,0.22,0.3);noise(t,0.15,'lowpass',1200,0.4,sfxGain)}
  else if(kind==='over'){[330,262,208,156].forEach((f,i)=>sweep('triangle',f,f*0.9,t+i*0.16,0.22,0.3))}
}
document.addEventListener('visibilitychange',()=>{if(!ac)return;if(document.hidden)ac.suspend();else ac.resume()});
// ===== Karakter bawaan (4) + pemilihan =====
const NAMES=['Si Oranye','Kucing','Robot','Slime','','Cyber Ninja','Neon Hacker','Astronot','Astro Oranye','Firaun','Anubis','Spartan','Dewa Zeus','Penari Bali','Wayang','Pria Batik','Barong'];
const CHP={5:80,6:80,7:120,8:120,9:200,10:200,11:290,12:290,13:350,14:350,15:350,16:350};
function saveChars(){try{localStorage.setItem('lompat-coins',tot);localStorage.setItem('lompat-chars',JSON.stringify(ownedC))}catch(e){}}
function drawChar(g,c,x,y,w,h){
  g.lineWidth=1.5;
  if(c===0){
    g.fillStyle='#e4572e';g.beginPath();g.roundRect(x,y,w,h,8);g.fill();
    g.fillStyle='#fff';g.fillRect(x+22*w/36,y+9*h/40,9,9);
    g.fillStyle='#222';g.fillRect(x+27*w/36,y+12*h/40,4,4);
  }else if(c===1){
    g.fillStyle='#8d8d99';
    g.beginPath();g.moveTo(x+2,y+h*.3);g.lineTo(x+5,y);g.lineTo(x+w*.4,y+h*.2);g.fill();
    g.beginPath();g.moveTo(x+w-2,y+h*.3);g.lineTo(x+w-5,y);g.lineTo(x+w*.6,y+h*.2);g.fill();
    g.beginPath();g.roundRect(x,y+h*.18,w,h*.82,11);g.fill();
    g.fillStyle='#ffb3c1';g.beginPath();g.moveTo(x+6,y+h*.2);g.lineTo(x+6,y+5);g.lineTo(x+13,y+h*.2);g.fill();
    g.fillStyle='#fff';g.fillRect(x+w*.2,y+h*.4,8,8);g.fillRect(x+w*.58,y+h*.4,8,8);
    g.fillStyle='#222';g.fillRect(x+w*.2+4,y+h*.4,3,8);g.fillRect(x+w*.58+4,y+h*.4,3,8);
    g.fillStyle='#ff7a96';g.fillRect(x+w/2-2,y+h*.62,4,3);
    g.strokeStyle='#222';g.beginPath();g.moveTo(x-4,y+h*.62);g.lineTo(x+7,y+h*.66);g.moveTo(x+w+4,y+h*.62);g.lineTo(x+w-7,y+h*.66);g.stroke();
  }else if(c===2){
    g.fillStyle='#333';g.fillRect(x+w/2-1,y,2,8);
    g.fillStyle='#ff4d4d';g.beginPath();g.arc(x+w/2,y+2,3.5,0,7);g.fill();
    g.fillStyle='#3b82c4';g.beginPath();g.roundRect(x,y+7,w,h-7,5);g.fill();
    g.fillStyle='#0d2238';g.beginPath();g.roundRect(x+4,y+h*.3,w-8,h*.3,4);g.fill();
    g.fillStyle='#7df9ff';g.fillRect(x+9,y+h*.4,6,6);g.fillRect(x+w-15,y+h*.4,6,6);
    g.fillStyle='#cfe3f7';g.fillRect(x+9,y+h*.78,w-18,3);
  }else if(c===3){
    g.fillStyle='#46c46b';
    g.beginPath();g.moveTo(x,y+h);g.lineTo(x,y+h*.5);g.quadraticCurveTo(x,y,x+w/2,y);g.quadraticCurveTo(x+w,y,x+w,y+h*.5);g.lineTo(x+w,y+h);g.closePath();g.fill();
    g.fillStyle='rgba(255,255,255,.45)';g.beginPath();g.ellipse(x+w*.28,y+h*.22,5,3,-.5,0,7);g.fill();
    g.fillStyle='#fff';g.beginPath();g.arc(x+w*.34,y+h*.5,5,0,7);g.arc(x+w*.68,y+h*.5,5,0,7);g.fill();
    g.fillStyle='#222';g.beginPath();g.arc(x+w*.37,y+h*.52,2.2,0,7);g.arc(x+w*.71,y+h*.52,2.2,0,7);g.fill();
    g.strokeStyle='#1f7a3a';g.beginPath();g.arc(x+w/2,y+h*.68,6,0.15*Math.PI,0.85*Math.PI);g.stroke();
  }else if(c===5){
    g.fillStyle='#ff2bd6';g.beginPath();g.moveTo(x+2,y+h*.28);g.lineTo(x-10,y+h*.2);g.lineTo(x-7,y+h*.36);g.lineTo(x+2,y+h*.38);g.fill();
    g.fillStyle='#1c1c2e';g.beginPath();g.roundRect(x,y,w,h,8);g.fill();
    g.fillStyle='#0a0a14';g.fillRect(x+3,y+h*.25,w-6,h*.22);
    g.shadowColor='#00e5ff';g.shadowBlur=6;g.fillStyle='#00e5ff';g.fillRect(x+w*.2,y+h*.32,w*.6,3);g.shadowBlur=0;
    g.fillRect(x+4,y+h*.72,w-8,2);
  }else if(c===6){
    g.fillStyle='#5b2a86';g.beginPath();g.roundRect(x,y,w,h,10);g.fill();
    g.fillStyle='#0b0b12';g.beginPath();g.roundRect(x+5,y+h*.2,w-10,h*.4,6);g.fill();
    g.fillStyle='#39ff14';g.fillRect(x+10,y+h*.33,5,5);g.fillRect(x+w-15,y+h*.33,5,5);g.fillRect(x+w/2-4,y+h*.5,8,2);
    g.strokeStyle='#ff2bd6';g.beginPath();g.roundRect(x+.75,y+.75,w-1.5,h-1.5,10);g.stroke();
  }else if(c===7||c===8){
    g.fillStyle='#9aa0b4';g.fillRect(x-4,y+h*.5,7,14);
    g.fillStyle=c===7?'#f2f2f7':'#ff8a3d';
    g.beginPath();g.roundRect(x+3,y+h*.55,w-6,h*.45,6);g.fill();
    g.beginPath();g.arc(x+w/2,y+h*.38,w*.5,0,7);g.fill();
    g.fillStyle='#1d2a55';g.beginPath();g.roundRect(x+w*.2,y+h*.2,w*.6,h*.3,8);g.fill();
    g.fillStyle='rgba(255,255,255,.65)';g.fillRect(x+w*.28,y+h*.25,6,3);
    g.fillStyle='#e03b3b';g.fillRect(x+w/2-4,y+h*.7,8,6);
  }else if(c===9){
    g.fillStyle='#f2c14e';g.beginPath();g.roundRect(x-3,y,w+6,h*.78,10);g.fill();
    g.fillStyle='#2a5db0';
    for(let i=0;i<4;i++){g.fillRect(x-3,y+6+i*8,5,4);g.fillRect(x+w-2,y+6+i*8,5,4)}
    g.fillStyle='#f5f0e0';g.fillRect(x+4,y+h*.72,w-8,h*.28);
    g.fillStyle='#c68a52';g.beginPath();g.roundRect(x+6,y+h*.14,w-12,h*.5,6);g.fill();
    g.fillStyle='#111';g.fillRect(x+10,y+h*.32,5,3);g.fillRect(x+w-15,y+h*.32,5,3);
    g.fillStyle='#2a5db0';g.fillRect(x+w/2-3,y+h*.6,6,10);
  }else if(c===10){
    g.fillStyle='#1d1d26';
    g.beginPath();g.roundRect(x,y+h*.3,w,h*.7,8);g.fill();
    g.beginPath();g.moveTo(x+4,y+h*.35);g.lineTo(x+8,y-4);g.lineTo(x+16,y+h*.3);g.fill();
    g.beginPath();g.moveTo(x+w-4,y+h*.35);g.lineTo(x+w-8,y-4);g.lineTo(x+w-16,y+h*.3);g.fill();
    g.beginPath();g.roundRect(x+3,y+h*.15,w-6,h*.4,8);g.fill();
    g.fillStyle='#f2c14e';g.fillRect(x+6,y+h*.56,w-12,5);g.fillRect(x+10,y+h*.28,6,4);g.fillRect(x+w-16,y+h*.28,6,4);
    g.fillStyle='#555';g.fillRect(x+w/2-3,y+h*.42,6,4);
  }else if(c===11){
    g.fillStyle='#b3262b';g.fillRect(x-6,y+h*.4,8,h*.6);
    g.fillStyle='#d7a24a';g.beginPath();g.roundRect(x,y+h*.2,w,h*.8,8);g.fill();
    g.fillStyle='#c0392b';g.beginPath();g.roundRect(x+w*.3,y-5,w*.4,12,4);g.fill();
    g.fillStyle='#d7a24a';g.beginPath();g.roundRect(x+2,y+2,w-4,h*.45,10);g.fill();
    g.fillStyle='#2a1a0a';g.fillRect(x+8,y+h*.28,w-16,4);g.fillRect(x+w/2-2,y+h*.28,4,h*.25);
    g.fillStyle='#8a5a1e';g.fillRect(x+4,y+h*.72,w-8,3);
  }else if(c===12){
    g.fillStyle='#f4f1ea';g.beginPath();g.roundRect(x,y+h*.45,w,h*.55,8);g.fill();
    g.fillStyle='#e8b98a';g.beginPath();g.arc(x+w/2,y+h*.3,w*.38,0,7);g.fill();
    g.fillStyle='#fff';g.beginPath();g.arc(x+w/2,y+h*.22,w*.42,Math.PI,0);g.fill();
    g.beginPath();g.moveTo(x+w*.25,y+h*.42);g.lineTo(x+w/2,y+h*.78);g.lineTo(x+w*.75,y+h*.42);g.fill();
    g.fillStyle='#222';g.fillRect(x+w*.33,y+h*.28,4,3);g.fillRect(x+w*.6,y+h*.28,4,3);
    g.strokeStyle='#d4a017';g.lineWidth=2;g.beginPath();g.arc(x+w/2,y+h*.2,w*.42,Math.PI*1.05,Math.PI*1.95);g.stroke();
    g.fillStyle='#ffd400';g.beginPath();g.moveTo(x+w-8,y+h*.5);g.lineTo(x+w-2,y+h*.5);g.lineTo(x+w-6,y+h*.68);g.lineTo(x+w,y+h*.68);g.lineTo(x+w-10,y+h*.9);g.lineTo(x+w-8,y+h*.72);g.lineTo(x+w-13,y+h*.72);g.fill();
  }else if(c===13){
    g.fillStyle='#d4a017';g.beginPath();g.roundRect(x,y+h*.4,w,h*.6,8);g.fill();
    g.fillStyle='#c0262d';g.fillRect(x+3,y+h*.68,w-6,h*.27);
    g.fillStyle='#e8b98a';g.beginPath();g.arc(x+w/2,y+h*.3,w*.34,0,7);g.fill();
    g.fillStyle='#111';g.beginPath();g.arc(x+w/2,y+h*.22,w*.36,Math.PI,0);g.fill();
    g.fillStyle='#f5c518';g.beginPath();g.moveTo(x+4,y+h*.18);g.lineTo(x+w/2,y-8);g.lineTo(x+w-4,y+h*.18);g.fill();
    g.fillStyle='#fff';g.beginPath();g.arc(x+w-6,y+h*.2,3.5,0,7);g.fill();
    g.fillStyle='#222';g.fillRect(x+w*.33,y+h*.3,4,3);g.fillRect(x+w*.6,y+h*.3,4,3);
  }else if(c===14){
    g.fillStyle='#4a2c12';g.beginPath();g.roundRect(x,y+h*.25,w,h*.75,6);g.fill();
    g.beginPath();g.moveTo(x+w*.3,y+h*.3);g.lineTo(x+w/2,y-6);g.lineTo(x+w*.7,y+h*.3);g.fill();
    g.fillStyle='#d4a017';g.fillRect(x+w*.34,y+h*.1,w*.32,3);
    g.fillRect(x+3,y+h*.52,w-6,3);g.fillRect(x+3,y+h*.84,w-6,3);
    for(let i=0;i<3;i++){g.beginPath();g.arc(x+8+i*10,y+h*.68,2.5,0,7);g.fill()}
    g.fillStyle='#f1d98a';g.fillRect(x+w*.28,y+h*.32,5,3);g.fillRect(x+w*.62,y+h*.32,5,3);
  }else if(c===15){
    g.fillStyle='#8b5a2b';g.beginPath();g.roundRect(x,y+h*.4,w,h*.6,8);g.fill();
    g.fillStyle='#f1d9a8';
    for(let i=0;i<3;i++)for(let j=0;j<2;j++){g.beginPath();g.moveTo(x+8+i*10,y+h*.55+j*11);g.lineTo(x+12+i*10,y+h*.62+j*11);g.lineTo(x+8+i*10,y+h*.69+j*11);g.lineTo(x+4+i*10,y+h*.62+j*11);g.fill()}
    g.fillStyle='#e0ac7a';g.beginPath();g.arc(x+w/2,y+h*.3,w*.33,0,7);g.fill();
    g.fillStyle='#3b2412';g.beginPath();g.arc(x+w/2,y+h*.22,w*.36,Math.PI,0);g.fill();
    g.fillRect(x+w*.12,y+h*.2,w*.76,5);g.fillRect(x-3,y+h*.2,6,8);
    g.fillStyle='#222';g.fillRect(x+w*.33,y+h*.32,4,3);g.fillRect(x+w*.6,y+h*.32,4,3);
  }else{
    g.fillStyle='#e0a100';g.beginPath();g.arc(x+w/2,y+h*.45,w*.62,0,7);g.fill();
    g.fillStyle='#b3171c';g.beginPath();g.roundRect(x+2,y+h*.15,w-4,h*.8,10);g.fill();
    g.fillStyle='#fff';g.beginPath();g.arc(x+w*.32,y+h*.38,5.5,0,7);g.arc(x+w*.68,y+h*.38,5.5,0,7);g.fill();
    g.fillStyle='#111';g.beginPath();g.arc(x+w*.32,y+h*.4,2.5,0,7);g.arc(x+w*.68,y+h*.4,2.5,0,7);g.fill();
    g.fillStyle='#7a0f12';g.fillRect(x+w*.3,y+h*.66,w*.4,4);
    g.fillStyle='#fff';g.fillRect(x+w*.25,y+h*.7,4,7);g.fillRect(x+w*.65,y+h*.7,4,7);
    g.fillStyle='#ffd23f';g.beginPath();g.moveTo(x+w*.4,y+h*.15);g.lineTo(x+w/2,y-4);g.lineTo(x+w*.6,y+h*.15);g.fill();
  }
}
function updIntro(){document.getElementById('ic').textContent='🪙 Koin tersimpan: '+tot;document.getElementById('iu').textContent='👤 '+uname+' ✏️'}
function openSel(msg){
  selecting=true;mEl.style.display='none';
  document.getElementById('ptl').textContent='Pilih Karakter';
  document.getElementById('pmsg').textContent=msg||'';
  const box=document.getElementById('cards');box.innerHTML='';
  const box2=document.getElementById('cards2');box2.innerHTML='';
  const box3=document.getElementById('cards3');box3.innerHTML='';
  const box4=document.getElementById('cards4');box4.innerHTML='';
  const list=[0,1,2,3,5,6,7,8,9,10,11,12,13,14,15,16];if(img)list.push(4);
  list.forEach(c=>{
    const b=document.createElement('button');b.className='card'+(c===ch?' on':'');
    const cv2=document.createElement('canvas');cv2.width=72;cv2.height=76;
    const g=cv2.getContext('2d');
    if(c===4){const k=Math.min(64/img.width,68/img.height),dw=img.width*k,dh=img.height*k;g.drawImage(img,36-dw/2,72-dh,dw,dh)}
    else{const lk=!ownedC.includes(c);if(lk)g.globalAlpha=.4;drawChar(g,c,18,28,36,40);g.globalAlpha=1}
    const s=document.createElement('span');s.textContent=c===4?'Gambarmu':NAMES[c];
    b.append(cv2,s);if(c!==4&&!ownedC.includes(c)){const pr=document.createElement('span');pr.textContent='🪙 '+CHP[c];b.append(pr)}
    b.addEventListener('click',()=>{
      if(c!==4&&!ownedC.includes(c)){
        if(tot>=CHP[c]){tot-=CHP[c];ownedC.push(c);ch=c;saveChars();updIntro();sfx('coin');openSel('Berhasil membeli '+NAMES[c]+'!')}
        else{sfx('no');openSel('Koin kurang '+(CHP[c]-tot)+' lagi untuk '+NAMES[c])}
        return;
      }
      ch=c;document.querySelectorAll('#pilih .card').forEach(x=>x.classList.remove('on'));b.classList.add('on')
    });
    (c>=13?box4:c>=9?box3:c>=5?box2:box).append(b);
  });
  document.getElementById('pilih').classList.remove('hide');
  if(!msg)document.getElementById('pilih').scrollTop=0;
}
document.getElementById('pl').addEventListener('click',e=>{selecting=false;document.getElementById('pilih').classList.add('hide');start();e.currentTarget.blur()});
document.getElementById('bk').addEventListener('click',e=>{selecting=false;document.getElementById('pilih').classList.add('hide');mEl.style.display='flex';e.currentTarget.blur()});
function flyCars(){
  const L=W+240;
  [[0,70,.9,.8,1],[300,115,.6,.5,-1],[520,40,.75,1.1,1],[150,150,.5,.4,-1],[650,95,.65,.7,-1]].forEach(([s0,y,sc,v,d],i)=>{
    const x=(((s0+d*frame*v*2)%L)+L)%L-120,c=i%2?'#00e5ff':'#ff2bd6';
    ctx.save();ctx.translate(x,y+Math.sin(frame/20+i)*3);ctx.scale(d*sc,sc);
    ctx.fillStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.moveTo(30,0);ctx.lineTo(80,-8);ctx.lineTo(80,10);ctx.closePath();ctx.fill();
    ctx.globalAlpha=.3;ctx.fillStyle=c;ctx.fillRect(-72,2,42,2);ctx.globalAlpha=1;
    ctx.fillStyle='#22123f';ctx.beginPath();ctx.roundRect(-30,-6,60,14,6);ctx.fill();
    ctx.beginPath();ctx.moveTo(-14,-6);ctx.lineTo(-6,-16);ctx.lineTo(10,-16);ctx.lineTo(20,-6);ctx.closePath();ctx.fill();
    ctx.fillStyle='#8be9ff';ctx.beginPath();ctx.moveTo(-9,-7);ctx.lineTo(-4,-14);ctx.lineTo(8,-14);ctx.lineTo(14,-7);ctx.closePath();ctx.fill();
    ctx.shadowColor=c;ctx.shadowBlur=10;ctx.fillStyle=c;ctx.fillRect(-28,4,56,2.5);
    ctx.fillStyle='#ffe14d';ctx.fillRect(26,-2,4,3);
    ctx.fillStyle='#ff3b3b';ctx.fillRect(-30,-2,3,3);
    ctx.shadowBlur=0;
    ctx.restore();
  });
}
function drawTrees(){
  const P=170,off=frame*(speed||5)*0.5;
  for(let k=Math.floor(off/P)-1;k*P-off<W+P;k++){
    const r=(((k*2654435761)>>>0)%1000)/1000;
    if(r<.25)continue;
    treeAt(k*P-off+r*60,.7+r*.6,k);
  }
}
function treeAt(x,s,k){
  const y=G;
  if(theme==='egypt'||theme==='indo'){
    ctx.strokeStyle='#6b4a1f';ctx.lineWidth=5*s;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+8*s,y-35*s,x+3*s,y-70*s);ctx.stroke();
    ctx.fillStyle='#2e8b3d';
    for(let i=-2;i<=2;i++){ctx.beginPath();ctx.ellipse(x+3*s+i*14*s,y-72*s+Math.abs(i)*5*s,16*s,5*s,i*.4,0,7);ctx.fill()}
  }else if(theme==='greece'){
    ctx.fillStyle='#5a3d22';ctx.fillRect(x-2*s,y-10*s,4*s,10*s);
    ctx.fillStyle='#2f5d34';ctx.beginPath();ctx.ellipse(x,y-45*s,13*s,40*s,0,0,7);ctx.fill();
  }else if(theme==='cyber'){
    const c=k%2?'#00e5ff':'#ff2bd6';
    ctx.fillStyle='#1a0536';ctx.fillRect(x-3*s,y-35*s,6*s,35*s);
    ctx.beginPath();ctx.arc(x,y-48*s,20*s,0,7);ctx.fill();
    ctx.strokeStyle=c;ctx.lineWidth=2;ctx.shadowColor=c;ctx.shadowBlur=8;
    ctx.beginPath();ctx.arc(x,y-48*s,20*s,0,7);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x,y-35*s);ctx.lineTo(x,y-48*s);ctx.moveTo(x-10*s,y-52*s);ctx.lineTo(x,y-44*s);ctx.stroke();
    ctx.shadowBlur=0;
  }else if(theme==='space'){
    ctx.fillStyle='#3a2a6b';ctx.fillRect(x-3*s,y-40*s,6*s,40*s);
    ctx.fillStyle=k%2?'#4de2c5':'#c77dff';ctx.beginPath();ctx.arc(x,y-48*s,18*s,Math.PI,0);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.55)';ctx.fillRect(x-8*s,y-54*s,3*s,3*s);ctx.fillRect(x+4*s,y-58*s,3*s,3*s);
  }else{
    const dk=theme==='default'&&night;
    ctx.fillStyle=dk?'#4a3a24':'#6b4a2a';ctx.fillRect(x-3*s,y-30*s,6*s,30*s);
    ctx.fillStyle=dk?'#2a5a3a':'#7cc24f';
    ctx.beginPath();ctx.arc(x,y-42*s,17*s,0,7);ctx.arc(x-12*s,y-34*s,12*s,0,7);ctx.arc(x+12*s,y-34*s,12*s,0,7);ctx.fill();
  }
}
// ===== Cuaca: tiap latar punya cuaca sendiri (dihitung dari frame, tanpa state) =====
// ===== Suara cuaca (WebAudio, mengikuti slider Efek) =====
let wx=null,wxKey='',wxTimer=null,thLast=-1,wxOn=true;
try{wxOn=localStorage.getItem('lompat-wx')!=='0'}catch(e){}
function applyWeather(key){
  if(!ac)return;
  if(key==='off'){
    wxKey=key;
    if(wx){wx.g.gain.setTargetAtTime(0,ac.currentTime,.2);wx.lg.gain.setTargetAtTime(0,ac.currentTime,.2)}
    clearInterval(wxTimer);wxTimer=null;
    return;
  }
  if(!wx){
    const src=ac.createBufferSource();src.buffer=nb;src.loop=true;
    const f=ac.createBiquadFilter(),g=ac.createGain();g.gain.value=0;
    const lfo=ac.createOscillator(),lg=ac.createGain();lg.gain.value=0;lfo.frequency.value=.15;
    lfo.connect(lg);lg.connect(g.gain);
    src.connect(f);f.connect(g);g.connect(sfxGain);src.start();lfo.start();
    wx={f:f,g:g,lg:lg,lfo:lfo};
  }
  wxKey=key;
  const t=key.slice(0,-1),n=key.slice(-1)==='n';
  const P={default:n?['bandpass',3400,.7,.3,0,0]:['bandpass',3800,.7,.22,0,0],cyber:['bandpass',4600,1.1,.2,0,0],space:['lowpass',170,.7,.22,0,0],egypt:['bandpass',650,.5,.24,.08,.2],greece:['bandpass',480,.8,.16,.05,.25],indo:['bandpass',3000,.6,.32,0,0],custom:['lowpass',420,.6,.07,.025,.12]}[t]||['bandpass',3800,.7,.2,0,0];
  const now=ac.currentTime;
  wx.f.type=P[0];wx.f.frequency.setTargetAtTime(P[1],now,.2);wx.f.Q.value=P[2];
  wx.g.gain.setTargetAtTime(P[3],now,.4);
  wx.lg.gain.setTargetAtTime(P[4],now,.4);wx.lfo.frequency.setTargetAtTime(P[5]||.15,now,.4);
  clearInterval(wxTimer);wxTimer=null;
  if(t==='space')wxTimer=setInterval(()=>{if(ac&&ac.state==='running'&&Math.random()<.7)whoosh()},2200);
}
function whoosh(){
  if(!ac||ac.state!=='running')return;
  const t=ac.currentTime,s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();
  s.buffer=nb;f.type='bandpass';f.Q.value=2;f.frequency.setValueAtTime(2400,t);f.frequency.exponentialRampToValueAtTime(500,t+.9);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.18,t+.15);g.gain.exponentialRampToValueAtTime(.0001,t+.9);
  s.connect(f);f.connect(g);g.connect(sfxGain);s.start(t);s.stop(t+1);
}
function thunder(){
  if(!ac||ac.state!=='running')return;
  const t=ac.currentTime+.35,s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();
  s.buffer=nb;s.loop=true;f.type='lowpass';f.frequency.setValueAtTime(260,t);f.frequency.exponentialRampToValueAtTime(70,t+1.8);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.9,t+.08);g.gain.exponentialRampToValueAtTime(.0001,t+1.9);
  s.connect(f);f.connect(g);g.connect(sfxGain);s.start(t);s.stop(t+2);
}
function wr(i,s){const x=Math.sin(i*127.1+s*311.7)*43758.5453;return x-Math.floor(x)}
function rainLayer(n,col,lw,vx,vy0,vyr,len,so){
  const Wn=W+120;
  ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.beginPath();
  for(let i=0;i<n;i++){
    const j=i+so,vy=vy0+wr(j,3)*vyr;
    const x=(((wr(j,1)*Wn+frame*vx)%Wn)+Wn)%Wn-60,y=(wr(j,2)*H+frame*vy)%H;
    ctx.moveTo(x,y);ctx.lineTo(x+vx*len/vy,y+len);
  }
  ctx.stroke();
}
function drawWeather(){
  if(!wxOn){if(wxKey!=='off')applyWeather('off');return}
  const t=(theme==='custom'&&!bgImg)?'default':theme;
  const wk=t+(night?'n':'d');if(wk!==wxKey)applyWeather(wk);
  ctx.save();
  if(t==='default'){
    ctx.fillStyle=night?'rgba(10,15,40,.2)':'rgba(40,60,90,.1)';ctx.fillRect(0,0,W,G);
    rainLayer(night?120:90,night?'rgba(190,210,255,.5)':'rgba(200,220,255,.55)',1.2,-2.5,12,7,14,0);
    if(night){
      const k=Math.floor(frame/260),m=frame%260;
      if(m===0&&thLast!==k){thLast=k;thunder()}
      if(m<7){
        ctx.fillStyle='rgba(255,255,255,'+(.4-m*.05)+')';ctx.fillRect(0,0,W,H);
        ctx.strokeStyle='rgba(255,255,230,.95)';ctx.lineWidth=2.5;ctx.beginPath();
        let bx=80+wr(k,5)*(W-160),by=0;ctx.moveTo(bx,by);
        while(by<G-10){by+=18+wr(k+by,6)*14;bx+=(wr(k+by,7)-.5)*34;ctx.lineTo(bx,by)}
        ctx.stroke();
      }
    }
  }else if(t==='cyber'){
    ctx.fillStyle='rgba(60,0,90,.12)';ctx.fillRect(0,0,W,G);
    rainLayer(60,'rgba(0,229,255,.75)',1.6,-1,16,8,18,10);
    rainLayer(60,'rgba(255,43,214,.7)',1.6,-1,16,8,18,40);
  }else if(t==='space'){
    for(let i=0;i<9;i++){
      const T=150+wr(i,1)*140,u=((frame+wr(i,2)*T)%T)/T;
      if(u>.55)continue;
      const s=u/.55,x=wr(i,3)*W+260-s*(W*.55),y=-30+s*(G+30)*.9;
      const g=ctx.createLinearGradient(x,y,x+70,y-45);g.addColorStop(0,'rgba(255,220,150,.95)');g.addColorStop(1,'rgba(255,120,40,0)');
      ctx.strokeStyle=g;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+70,y-45);ctx.stroke();
      ctx.fillStyle='#fff3c4';ctx.beginPath();ctx.arc(x,y,3,0,7);ctx.fill();
    }
  }else if(t==='egypt'){
    ctx.fillStyle='rgba(214,165,90,'+(.2+Math.sin(frame/60)*.06)+')';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(235,200,130,.75)';
    for(let i=0;i<90;i++){const v=9+wr(i,3)*9,x=(((wr(i,1)*W-frame*v)%W)+W)%W;ctx.fillRect(x,wr(i,2)*H,2+wr(i,4)*3,1.5)}
    ctx.fillStyle='rgba(240,210,150,.12)';
    for(let i=0;i<6;i++){const v=14+wr(i,5)*10,x=(((wr(i,6)*W-frame*v)%W)+W)%W;ctx.fillRect(x-120,40+wr(i,7)*(G-40),240,6)}
  }else if(t==='greece'){
    const Wn=W+80;
    for(let i=0;i<18;i++){
      const v=3+wr(i,3)*3,x=(((wr(i,1)*Wn-frame*v)%Wn)+Wn)%Wn-40,y=40+wr(i,2)*(G-60)+Math.sin(frame/18+i)*14;
      ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(frame/15+i)*.8);
      ctx.fillStyle=i%3?'#8aa84a':'#6c8a35';ctx.beginPath();ctx.ellipse(0,0,7,2.6,0,0,7);ctx.fill();ctx.restore();
    }
    ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=1;ctx.beginPath();
    for(let i=0;i<8;i++){const x=(((wr(i,8)*Wn-frame*9)%Wn)+Wn)%Wn-40,y=30+wr(i,9)*(G-50);ctx.moveTo(x,y);ctx.lineTo(x+40,y)}
    ctx.stroke();
  }else if(t==='indo'){
    ctx.fillStyle='rgba(20,60,50,.14)';ctx.fillRect(0,0,W,G);
    rainLayer(140,'rgba(210,235,225,.5)',1.3,-1.5,15,7,16,70);
    const fg=ctx.createLinearGradient(0,G-90,0,G);fg.addColorStop(0,'rgba(230,240,235,0)');fg.addColorStop(1,'rgba(230,240,235,.3)');
    ctx.fillStyle=fg;ctx.fillRect(0,G-90,W,90);
  }else{
    ctx.fillStyle='rgba(255,255,255,.85)';
    for(let i=0;i<80;i++){
      const x=(((wr(i,1)*W+Math.sin(frame/30+i)*12-frame*.5)%W)+W)%W,y=(wr(i,2)*H+frame*(1+wr(i,3)*1.5))%H;
      ctx.beginPath();ctx.arc(x,y,1.3+wr(i,4)*1.7,0,7);ctx.fill();
    }
  }
  ctx.restore();
}
function drawObs(o){
  const x=o.x,y=o.y,w=o.w,h=o.h,t=o.t||0;
  if(t===0){
    ctx.fillStyle='#ff6a00';ctx.beginPath();ctx.moveTo(x+w/2,y);ctx.lineTo(x+w,y+h);ctx.lineTo(x,y+h);ctx.closePath();ctx.fill();
    ctx.fillStyle='#fff';ctx.fillRect(x+w*.28,y+h*.4,w*.44,h*.12);ctx.fillRect(x+w*.15,y+h*.7,w*.7,h*.1);
    ctx.fillStyle='#222';ctx.fillRect(x-3,y+h-4,w+6,4);
  }else if(t===1){
    ctx.fillStyle='#b9803f';ctx.fillRect(x,y,w,h);
    ctx.strokeStyle='#6b4420';ctx.lineWidth=3;ctx.strokeRect(x+1.5,y+1.5,w-3,h-3);
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y+h);ctx.moveTo(x+w,y);ctx.lineTo(x,y+h);ctx.stroke();
  }else{
    ctx.fillStyle='#2f6fb5';ctx.beginPath();ctx.roundRect(x,y,w,h,6);ctx.fill();
    ctx.fillStyle='#1d4a80';ctx.fillRect(x,y+h*.25,w,4);ctx.fillRect(x,y+h*.7,w,4);
    ctx.fillStyle='#f4c430';ctx.fillRect(x+w*.3,y+h*.42,w*.4,h*.18);
  }
}
function themeBg(){
  if(theme==='custom'&&bgImg){
    const s=G/bgImg.height,tw=bgImg.width*s,off=(frame*(speed||5)*0.2)%(tw*2);
    for(let k=Math.floor(off/tw)-1;k*tw-off<W;k++){
      const x=k*tw-off;
      ctx.save();
      if(((k%2)+2)%2){ctx.translate(x+tw,0);ctx.scale(-1,1);ctx.drawImage(bgImg,0,0,tw,G)}
      else ctx.drawImage(bgImg,x,0,tw,G);
      ctx.restore();
    }
    return;
  }
  if(theme==='cyber'){
    const g=ctx.createLinearGradient(0,0,0,G);g.addColorStop(0,'#0d0221');g.addColorStop(.6,'#3b0a5e');g.addColorStop(1,'#ff3cac');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    const sg=ctx.createLinearGradient(0,G-120,0,G);sg.addColorStop(0,'#ffe14d');sg.addColorStop(1,'#ff2bd6');
    ctx.fillStyle=sg;ctx.beginPath();ctx.arc(560,G-60,60,0,7);ctx.fill();
    ctx.fillStyle='#3b0a5e';for(let i=0;i<5;i++)ctx.fillRect(490,G-50+i*10,140,2+i*1.4);
    [[0.15,'#1a0536',64,150],[0.35,'#0b0118',46,105]].forEach(([sp,col,w,mh])=>{
      const off=frame*(speed||5)*sp;
      for(let k=Math.floor(off/w)-1;k*w-off<W+w;k++){
        const x0=k*w-off,hh=mh*(.55+((((k*37)%7)+7)%7)/12);
        ctx.fillStyle=col;ctx.fillRect(x0,G-hh,w-4,hh);
        if(sp<.2)for(let yy=G-hh+8;yy<G-6;yy+=12)for(let xx=x0+6;xx<x0+w-12;xx+=10){
          const a=(xx-x0)/10|0,b=(G-yy)/12|0;
          if((((k*13+a*7+b*5)%4)+4)%4===0){ctx.fillStyle=(k+a)%2?'#00e5ff':'#ff2bd6';ctx.fillRect(xx,yy,4,5)}
        }
      }
    });
    flyCars();
  }else if(theme==='space'){
    const g=ctx.createLinearGradient(0,0,0,G);g.addColorStop(0,'#02030a');g.addColorStop(1,'#1b1446');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    const nb2=ctx.createRadialGradient(300,120,5,300,120,150);nb2.addColorStop(0,'rgba(140,70,220,.3)');nb2.addColorStop(1,'rgba(140,70,220,0)');
    ctx.fillStyle=nb2;ctx.fillRect(0,0,W,H);
    for(let i=0;i<70;i++){
      const x=(((i*131)-frame*0.15*(1+i%3))%W+W)%W,y=(i*71)%(G-20),tw=(Math.sin(frame/15+i)+1)/2,z=i%4?1.5:2.5;
      ctx.fillStyle='rgba(255,255,255,'+(0.35+tw*0.6)+')';ctx.fillRect(x,y,z,z);
    }
    const pg=ctx.createRadialGradient(568,68,4,580,80,44);pg.addColorStop(0,'#ffb347');pg.addColorStop(1,'#c2410c');
    ctx.fillStyle=pg;ctx.beginPath();ctx.arc(580,80,40,0,7);ctx.fill();
    ctx.strokeStyle='rgba(255,225,170,.85)';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(580,84,68,14,-.35,0,7);ctx.stroke();
    const bg2=ctx.createRadialGradient(114,64,2,120,70,16);bg2.addColorStop(0,'#7fd1ff');bg2.addColorStop(1,'#1d4ed8');
    ctx.fillStyle=bg2;ctx.beginPath();ctx.arc(120,70,16,0,7);ctx.fill();
  }else if(theme==='egypt'){
    const g=ctx.createLinearGradient(0,0,0,G);g.addColorStop(0,'#f08a3c');g.addColorStop(1,'#ffe3a6');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#fff1c1';ctx.beginPath();ctx.arc(560,90,46,0,7);ctx.fill();
    [[0.1,230,120,'#d9a24b','#b57d2e'],[0.25,150,70,'#c9923f','#a36a22']].forEach(([sp,w,h,c1,c2])=>{
      const off=frame*(speed||5)*sp;
      for(let k=Math.floor(off/w)-1;k*w-off<W+w;k++){
        if(((k%3)+3)%3===1)continue;
        const x0=k*w-off;
        ctx.fillStyle=c1;ctx.beginPath();ctx.moveTo(x0,G);ctx.lineTo(x0+w/2,G-h);ctx.lineTo(x0+w/2,G);ctx.fill();
        ctx.fillStyle=c2;ctx.beginPath();ctx.moveTo(x0+w/2,G-h);ctx.lineTo(x0+w,G);ctx.lineTo(x0+w/2,G);ctx.fill();
      }
    });
  }else if(theme==='greece'){
    const g=ctx.createLinearGradient(0,0,0,G);g.addColorStop(0,'#7ec8f2');g.addColorStop(1,'#f4fbff');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#ffe98a';ctx.beginPath();ctx.arc(600,70,28,0,7);ctx.fill();
    const nt=night;night=false;CLOUDS.forEach(cloud);night=nt;
    const off=frame*(speed||5)*0.15,P=320;
    for(let k=Math.floor(off/P)-1;k*P-off<W+P;k++){
      const x0=k*P-off;
      ctx.fillStyle='#f1ece0';ctx.fillRect(x0,G-12,200,12);
      for(let i=0;i<6;i++)ctx.fillRect(x0+10+i*34,G-92,14,80);
      ctx.fillStyle='#e4dccb';ctx.fillRect(x0,G-104,200,12);
      ctx.beginPath();ctx.moveTo(x0-6,G-104);ctx.lineTo(x0+100,G-140);ctx.lineTo(x0+206,G-104);ctx.fill();
    }
  }else{
    const g=ctx.createLinearGradient(0,0,0,G);g.addColorStop(0,'#ff8a3d');g.addColorStop(1,'#ffe7a3');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#fff3c4';ctx.beginPath();ctx.arc(120,95,40,0,7);ctx.fill();
    const o1=frame*(speed||5)*0.08;
    for(let k=Math.floor(o1/360)-1;k*360-o1<W+360;k++){
      const x0=k*360-o1;
      ctx.fillStyle='#46687a';ctx.beginPath();ctx.moveTo(x0,G);ctx.lineTo(x0+150,G-120);ctx.lineTo(x0+210,G-120);ctx.lineTo(x0+360,G);ctx.fill();
      ctx.fillStyle='rgba(235,235,235,.9)';ctx.beginPath();ctx.ellipse(x0+190,G-135,20,10,0,0,7);ctx.ellipse(x0+212,G-152,14,8,0,0,7);ctx.fill();
    }
    const o2=frame*(speed||5)*0.2;
    for(let k=Math.floor(o2/400)-1;k*400-o2<W+400;k++){
      if(((k%2)+2)%2)continue;
      const x0=k*400-o2+120;
      ctx.fillStyle='#9a9084';
      for(let i=0;i<4;i++)ctx.fillRect(x0+i*20,G-14*(i+1),160-i*40,14);
      ctx.fillStyle='#7d7468';
      ctx.beginPath();ctx.arc(x0+80,G-56,10,Math.PI,0);ctx.fill();
      ctx.beginPath();ctx.arc(x0+30,G-28,6,Math.PI,0);ctx.arc(x0+130,G-28,6,Math.PI,0);ctx.fill();
    }
  }
}
const THEMES=[{id:'default',n:'Siang & Malam',p:0,bg:'linear-gradient(#6ec3f5,#dff1ff)'},{id:'cyber',n:'Cyberpunk',p:300,bg:'linear-gradient(#0d0221,#3b0a5e 55%,#ff3cac)'},{id:'space',n:'Luar Angkasa',p:400,bg:'linear-gradient(#02030a,#1b1446)'},{id:'egypt',n:'Mesir Kuno',p:500,bg:'linear-gradient(#f08a3c,#ffe3a6)'},{id:'greece',n:'Yunani Kuno',p:600,bg:'linear-gradient(#7ec8f2,#f4fbff)'},{id:'indo',n:'Budaya Indonesia',p:700,bg:'linear-gradient(#ff8a3d,#ffe7a3 60%,#2e8b57)'}];
function saveTheme(){try{localStorage.setItem('lompat-coins',tot);localStorage.setItem('lompat-owned',JSON.stringify(owned));localStorage.setItem('lompat-theme',theme)}catch(e){}}
function openShop(msg){
  selecting=true;mEl.style.display='none';
  document.getElementById('tc').textContent='🪙 Koin: '+tot;
  document.getElementById('tmsg').textContent=msg||'';
  const box=document.getElementById('tcards');box.innerHTML='';
  (bgImg?THEMES.concat([{id:'custom',n:'Gambarmu',p:0,bg:'url('+bgImg.src+') center/cover'}]):THEMES).forEach(t=>{
    const b=document.createElement('button');b.className='card'+(t.id===theme?' on':'');
    const pv=document.createElement('div');pv.className='pv';pv.style.background=t.bg;
    const n=document.createElement('span');n.textContent=t.n;
    const s=document.createElement('span');
    s.textContent=t.id===theme?'✔ Dipakai':owned.includes(t.id)||t.id==='custom'?'Pakai':'🪙 '+t.p;
    b.append(pv,n,s);
    b.addEventListener('click',()=>{
      if(owned.includes(t.id)||t.id==='custom'){theme=t.id;if(t.id!=='custom')bgImg=null;saveTheme();openShop()}
      else if(tot>=t.p){tot-=t.p;owned.push(t.id);theme=t.id;bgImg=null;saveTheme();updIntro();sfx('coin');openShop('Berhasil membeli '+t.n+'!')}
      else{sfx('no');openShop('Koin kurang '+(t.p-tot)+' lagi untuk '+t.n)}
    });
    box.append(b);
  });
  document.getElementById('toko').classList.remove('hide');
}
const fb=document.getElementById('fb');
fb.addEventListener('change',()=>{
  const f=fb.files&&fb.files[0];
  if(!f||!f.type.startsWith('image/'))return;
  const fr=new FileReader();
  fr.onload=()=>{
    const im=new Image();
    im.onload=()=>{bgImg=im;theme='custom';saveTheme();openShop('Latar gambarmu dipakai! Jalan dan rintangan juga berganti.')};
    im.src=fr.result;
  };
  fr.readAsDataURL(f);fb.value='';
});
document.getElementById('ts').addEventListener('click',e=>{openShop();e.currentTarget.blur()});
document.getElementById('tb').addEventListener('click',e=>{selecting=false;document.getElementById('toko').classList.add('hide');mEl.style.display='flex';e.currentTarget.blur()});
const fsb=document.getElementById('fs'),wrapEl=document.querySelector('.wrap');
function fsEl(){return document.fullscreenElement||document.webkitFullscreenElement}
function fsUpd(){fsb.textContent=(fsEl()||wrapEl.classList.contains('pfs'))?'⤡':'⤢'}
fsb.addEventListener('click',e=>{
  e.currentTarget.blur();
  if(wrapEl.classList.contains('pfs')){wrapEl.classList.remove('pfs');fsUpd();return}
  if(fsEl()){const x=(document.exitFullscreen||document.webkitExitFullscreen).call(document);if(x&&x.catch)x.catch(()=>{});return}
  const rq=wrapEl.requestFullscreen||wrapEl.webkitRequestFullscreen;
  const pf=()=>{wrapEl.classList.add('pfs');fsUpd()};
  if(!rq){pf();return}
  try{const p=rq.call(wrapEl);if(p&&p.catch)p.catch(pf)}catch(err){pf()}
});
document.addEventListener('fullscreenchange',fsUpd);
document.addEventListener('webkitfullscreenchange',fsUpd);
let setFrom='';
function openSet(from){
  setFrom=from;
  if(from==='intro'){selecting=true;mEl.style.display='none'}
  document.getElementById('set').classList.remove('hide');
}
function closeSet(){
  document.getElementById('set').classList.add('hide');
  if(setFrom==='intro'){selecting=false;mEl.style.display='flex'}
}
document.getElementById('se').addEventListener('click',e=>{openSet('intro');e.currentTarget.blur()});
document.getElementById('st2').addEventListener('click',e=>{openSet('pause');e.currentTarget.blur()});
document.getElementById('sb').addEventListener('click',e=>{closeSet();e.currentTarget.blur()});
function unlockAudio(){if(initAudio())startMusic()}
['pointerdown','keydown','touchstart'].forEach(ev=>document.addEventListener(ev,unlockAudio,{capture:true,passive:true}));
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('button,label.up')&&e.target.id!=='sh')sfx('click')},true);
const mqP=window.matchMedia('(orientation: portrait)');
function chkOri(){if(mqP.matches&&running&&!paused)setPause(true)}
if(mqP.addEventListener)mqP.addEventListener('change',chkOri);else if(mqP.addListener)mqP.addListener(chkOri);
function openUser(){
  selecting=true;mEl.style.display='none';
  document.getElementById('ban').classList.add('hide');
  const edit=!!uname;
  document.getElementById('utt').textContent=edit?'Ubah Username':'Selamat Datang!';
  document.getElementById('usb').textContent=edit?'Masukkan username baru':'Masukkan username untuk masuk ke game';
  document.getElementById('usv').textContent=edit?'Simpan':'Masuk';
  document.getElementById('ucn').classList.toggle('hide',!edit);
  document.getElementById('uerr').textContent='';
  const i=document.getElementById('uin');i.value=isBanned(uname)?'':uname;
  document.getElementById('unm').classList.remove('hide');
  setTimeout(()=>i.focus(),50);
}
function closeUser(){document.getElementById('unm').classList.add('hide');selecting=false;mEl.style.display='flex'}
function saveUser(){
  const v=document.getElementById('uin').value.trim().slice(0,12);
  if(!v){document.getElementById('uerr').textContent='Username tidak boleh kosong';document.getElementById('uin').focus();return}
  uname=v;
  try{localStorage.setItem('lompat-user',uname)}catch(e){}
  updIntro();hideBan();
  if(isBanned(uname)){showBan();return}
  const btn=document.getElementById('usv');btn.disabled=true;
  checkBan(uname).then(b=>{btn.disabled=false;if(b)showBan('Username atau akunmu diblokir oleh admin.');else{closeUser();registerName(uname)}});
}
document.getElementById('usv').addEventListener('click',saveUser);
document.getElementById('ucn').addEventListener('click',cancelUser);
document.getElementById('iu').addEventListener('click',e=>{openUser();e.currentTarget.blur()});
document.getElementById('uin').addEventListener('keydown',e=>{if(e.key==='Enter')saveUser();else if(e.key==='Escape'&&uname)cancelUser()});
document.getElementById('uin').addEventListener('input',()=>{document.getElementById('uerr').textContent=''});
function addScore(sc){
  if(sc<=0)return 0;
  let L=[];try{L=JSON.parse(localStorage.getItem('lompat-lb'))||[]}catch(e){}
  const e={n:uname,s:sc,c:ch,t:Date.now()};
  L.push(e);L.sort((a,b)=>b.s-a.s||a.t-b.t);L=L.slice(0,5);
  try{localStorage.setItem('lompat-lb',JSON.stringify(L))}catch(e2){}
  submitOnline(sc);
  return L.indexOf(e)+1;
}
// ====== KONFIGURASI PAPAN PERINGKAT ONLINE (Google Sheets via Apps Script) ======
// Ganti dengan URL Web App dari Apps Script (berakhiran /exec). Lihat PANDUAN-GOOGLE-SHEETS.md
const SHEETS_URL='https://script.google.com/macros/s/AKfycbzhYsM-vNcEVu5WJyWei2rM3uj3pbxqw50lpAHQO_bDuxE4_EJ-y7a5iUt9HVXBwX4TGw/exec';
function onlineOK(){return /^https:\/\/script\.google\.com\//.test(SHEETS_URL)}
let myPid='';
try{myPid=localStorage.getItem('lompat-pid')||'';if(!myPid){myPid=(crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(36).slice(2)).replace(/[^a-zA-Z0-9-]/g,'');localStorage.setItem('lompat-pid',myPid)}}catch(e){myPid='tamu'+Math.random().toString(36).slice(2,12)}
let onBusy=false;
// Pendaftaran username -> sheet "DataNama" (terpisah dari sheet "Leaderboard")
let regName='';
try{regName=localStorage.getItem('lompat-reg')||''}catch(e){}
async function registerName(name){
  if(!onlineOK()||!name||regName===name)return;
  try{
    const r=await fetch(SHEETS_URL,{method:'POST',body:JSON.stringify({action:'register',id:myPid,name:name})});
    const j=await r.json();
    if(j&&j.ok){regName=name;try{localStorage.setItem('lompat-reg',name)}catch(e){}}
  }catch(e){}
}
// Cek apakah username / perangkat ini ada di daftar banned (sheet "Banned"). Gagal jaringan = tidak diblokir.
async function checkBan(name){
  if(!onlineOK())return false;
  const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),5000);
  try{
    const r=await fetch(SHEETS_URL+'?action=check&id='+encodeURIComponent(myPid)+'&name='+encodeURIComponent(name),{signal:ctl.signal});
    const j=await r.json();
    return !!(j&&j.banned===true);
  }catch(e){return false}finally{clearTimeout(t)}
}
async function submitOnline(sc){
  if(!onlineOK()||onBusy||sc<=0)return;
  onBusy=true;
  try{
    await fetch(SHEETS_URL,{method:'POST',body:JSON.stringify({id:myPid,name:uname,score:sc,char:ch===4?0:ch})});
  }catch(e){}
  onBusy=false;
}
function fillRows(L,meId){
  const box=document.getElementById('lbl');box.innerHTML='';
  if(!L.length){const s=document.createElement('span');s.textContent='Belum ada skor. Jadilah yang pertama!';box.append(s);return}
  L.forEach((e,i)=>{
    const r=document.createElement('div');r.className='lr'+(meId&&e.id===meId?' me':'');
    const rk=document.createElement('span');rk.textContent=i<3?['🥇','🥈','🥉'][i]:(i+1)+'.';
    const cv2=document.createElement('canvas');cv2.width=72;cv2.height=76;
    const g=cv2.getContext('2d'),c=Number.isInteger(e.c)&&e.c>=0&&e.c<=16?e.c:0;
    if(c===4){g.fillStyle='#888';g.beginPath();g.arc(36,48,18,0,7);g.fill()}else drawChar(g,c,18,28,36,40);
    const nm=document.createElement('span');nm.className='nm';nm.textContent=String(e.n||'Pemain').slice(0,12);
    const sc=document.createElement('span');sc.className='sc';sc.textContent=Number(e.s)||0;
    r.append(rk,cv2,nm,sc);box.append(r);
  });
}
async function renderOnline(){
  const st=document.getElementById('lbs');
  if(!onlineOK()){st.textContent='Online belum dikonfigurasi, menampilkan peringkat lokal';renderLocal();return}
  st.textContent='Memuat peringkat online...';document.getElementById('lbl').innerHTML='';
  try{
    const r=await fetch(SHEETS_URL+'?limit=10');
    const L=await r.json();
    if(!Array.isArray(L))throw new Error('format');
    st.textContent='\ud83c\udf10 Semua pemain \u00b7 skor terbaikmu terkirim otomatis';
    const mine=myPid.slice(0,8);
    fillRows(L.map(x=>({id:x.k,n:x.n,s:x.s,c:x.c})),mine);
  }catch(e){st.textContent='Gagal memuat peringkat online'}
}
function showTab(t){
  document.getElementById('lt1').classList.toggle('act',t==='on');
  if(t==='on')renderOnline();else renderLocal();
}
function openLB(){
  selecting=true;mEl.style.display='none';
  document.getElementById('lb').classList.remove('hide');
  showTab(onlineOK()?'on':'off');
}
document.getElementById('lt1').addEventListener('click',()=>showTab('on'));
function renderLocal(){
  document.getElementById('lbs').textContent='📱 Peringkat di perangkat ini';
  let L=[];try{L=JSON.parse(localStorage.getItem('lompat-lb'))||[]}catch(e){}
  const box=document.getElementById('lbl');box.innerHTML='';
  if(!L.length){const s=document.createElement('span');s.textContent='Belum ada skor. Ayo bermain!';box.append(s)}
  L.forEach((e,i)=>{
    const r=document.createElement('div');r.className='lr';
    const rk=document.createElement('span');rk.textContent=['🥇','🥈','🥉','4.','5.'][i];
    const cv2=document.createElement('canvas');cv2.width=72;cv2.height=76;
    const g=cv2.getContext('2d');
    if(e.c===4){g.fillStyle='#888';g.beginPath();g.arc(36,48,18,0,7);g.fill()}else drawChar(g,e.c,18,28,36,40);
    const nm=document.createElement('span');nm.className='nm';nm.textContent=e.n;
    const sc=document.createElement('span');sc.className='sc';sc.textContent=e.s;
    r.append(rk,cv2,nm,sc);box.append(r);
  });
  document.getElementById('lb').classList.remove('hide');
}
document.getElementById('lbo').addEventListener('click',e=>{openLB();e.currentTarget.blur()});
document.getElementById('lbb').addEventListener('click',e=>{document.getElementById('lb').classList.add('hide');selecting=false;mEl.style.display='flex';e.currentTarget.blur()});
function shBtn(v){document.getElementById('sh').classList.toggle('hide',!v)}
function shoot(){
  if(!running||paused||!boss||boss.x>W-125||cd>0)return;
  pb.push({x:p.x+p.w,y:p.y+p.h*.4,w:16,h:6,v:12});cd=12;sfx('shoot');burst(p.x+p.w+14,p.y+p.h*.4+3,4,['#ffe14d','#fff'],{spread:2,life:12});
}
let shT=null;
const shB=document.getElementById('sh');
shB.addEventListener('pointerdown',e=>{e.preventDefault();shoot();clearInterval(shT);shT=setInterval(shoot,100)});
['pointerup','pointerleave','pointercancel'].forEach(ev=>shB.addEventListener(ev,()=>{clearInterval(shT);shT=null}));
function burst(x,y,n,c,o){
  o=o||{};const sp=o.spread||3;
  for(let i=0;i<n;i++){
    const a=Math.random()*6.283,v=Math.random()*sp;
    parts.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(o.up||0),l:0,m:(o.life||26)+Math.random()*10,c:Array.isArray(c)?c[(Math.random()*c.length)|0]:c,r:1.5+Math.random()*2.5});
  }
  if(parts.length>300)parts.splice(0,parts.length-300);
}
// ===== Animasi terbakar (burn) saat game over, berbeda untuk tiap karakter =====
const BURN={0:{c:['#ff7a1a','#ffd23f','#ff3d00'],s:'fire'},1:{c:['#ff9a3c','#ffd23f','#ff5a00'],s:'fire',smoke:1},2:{c:['#4da3ff','#9fe9ff','#ffffff'],s:'elec'},3:{c:['#6bff6b','#c9ff6b','#2ecc71'],s:'steam'},4:{c:['#ff7a1a','#ffd23f','#ff3d00'],s:'fire'},5:{c:['#00e5ff','#7df9ff','#ff2bd6'],s:'glitch'},6:{c:['#39ff14','#ff2bd6','#ffffff'],s:'glitch'},7:{c:['#ffffff','#9fd8ff','#4da3ff'],s:'plasma'},8:{c:['#ff8a3d','#ffd23f','#ffffff'],s:'plasma'},9:{c:['#ffd23f','#f2c14e','#fff3b0'],s:'fire',sp:1},10:{c:['#b36bff','#6a2cbf','#e0c3ff'],s:'fire',smoke:1,sc:'rgba(40,20,70,.7)'},11:{c:['#ff3b2f','#ff9a3c','#ffd23f'],s:'fire',big:1},12:{c:['#fff7a8','#ffe14d','#ffffff'],s:'elec'},13:{c:['#ff8fb8','#ffd23f','#ffffff'],s:'petals'},14:{c:['#ff9a3c','#ffd23f','#ff5a00'],s:'ember'},15:{c:['#ff9a3c','#e9c46a','#ff5a00'],s:'ember'},16:{c:['#e0a100','#ff3b2f','#ffd23f'],s:'fire',big:1,sp:1}};
const bc=document.createElement('canvas');bc.width=130;bc.height=150;
const bx2=bc.getContext('2d');
function stepParts(){
  for(const q of parts){q.x+=q.vx;q.y+=q.vy;q.vy+=(q.g===undefined?0.12:q.g);q.vx*=0.98;q.l++}
  parts=parts.filter(q=>q.l<q.m);
}
function burnFx(){
  const B=BURN[ch]||BURN[0],col=B.c,cx=p.x+p.w/2,t=burn.t/burn.max,s=B.s;
  const pk=()=>col[(Math.random()*col.length)|0];
  const add=o=>{if(parts.length>400)parts.shift();parts.push(Object.assign({l:0,g:-.05},o))};
  const rx=()=>p.x+Math.random()*p.w,ry=()=>p.y+p.h*(.2+Math.random()*.8);
  if(s==='fire'){
    const n=B.big?5:3;
    for(let i=0;i<n;i++)add({x:rx(),y:ry(),vx:(Math.random()-.5)*.8,vy:-1-Math.random()*2.2,m:24+Math.random()*16,c:pk(),r:(3+Math.random()*4)*(B.big?1.4:1)*(1-t*.4)});
    if(B.sp)add({x:rx(),y:ry(),vx:(Math.random()-.5)*2,vy:-2-Math.random()*2,m:20,c:'#fff',r:1.3,g:-.02});
  }else if(s==='elec'){
    for(let i=0;i<4;i++){const a=Math.random()*6.283,v=3+Math.random()*3;add({x:cx,y:p.y+p.h*.5,vx:Math.cos(a)*v,vy:Math.sin(a)*v,m:8+Math.random()*7,c:pk(),r:1.5,g:0})}
    if(Math.random()<.4)add({x:rx(),y:ry(),vx:0,vy:-1,m:12,c:pk(),r:3});
  }else if(s==='steam'){
    add({x:rx(),y:ry(),vx:(Math.random()-.5)*.6,vy:-.5-Math.random(),m:40+Math.random()*20,c:pk(),r:3+Math.random()*3,g:-.01});
    if(Math.random()<.6)add({x:rx(),y:ry(),vx:(Math.random()-.5)*.8,vy:-1.5,m:22,c:pk(),r:3});
  }else if(s==='glitch'){
    for(let i=0;i<4;i++)add({x:rx()+(Math.random()-.5)*14,y:ry(),vx:(Math.random()-.5)*4,vy:(Math.random()-.5)*3,m:10+Math.random()*10,c:pk(),r:1.5+Math.random()*2.5,g:0,sq:1});
  }else if(s==='plasma'){
    for(let i=0;i<6;i++){const a=Math.random()*6.283,v=2+Math.random()*2.5;add({x:cx,y:p.y+p.h*.5,vx:Math.cos(a)*v,vy:Math.sin(a)*v,m:20+Math.random()*6,c:pk(),r:2+Math.random()*2,g:0})}
  }else if(s==='petals'){
    add({x:rx(),y:ry(),vx:(Math.random()-.5)*2.2,vy:-.7-Math.random(),m:44+Math.random()*16,c:pk(),r:2.5+Math.random()*2,g:.01,pt:1});
    if(Math.random()<.7)add({x:rx(),y:ry(),vx:(Math.random()-.5)*.8,vy:-1.2-Math.random()*1.5,m:22,c:'#ff9a3c',r:3+Math.random()*3});
  }else{
    add({x:rx(),y:ry(),vx:(Math.random()-.5)*1.2,vy:-.6-Math.random()*1.2,m:50+Math.random()*20,c:pk(),r:1.3+Math.random()*1.3,g:-.01});
    if(Math.random()<.5)add({x:rx(),y:p.y,vx:(Math.random()-.5)*1.4,vy:-.2,m:50,c:'#3b2412',r:2+Math.random()*2,g:.03,pt:1});
    if(Math.random()<.5)add({x:rx(),y:ry(),vx:0,vy:-1.5,m:22,c:'#ff7a1a',r:3});
  }
  if(t>(B.smoke?.25:.55)&&Math.random()<.5)add({x:rx(),y:p.y+p.h*.3,vx:(Math.random()-.5)*.6,vy:-.7,m:36,c:B.sc||'rgba(110,110,110,.7)',r:4+Math.random()*3,g:-.01});
}
function drawBurnChar(){
  const B=BURN[ch]||BURN[0],t=burn.t/burn.max,ox=40,oy=70;
  bx2.clearRect(0,0,130,150);
  if(ch===4&&img){const k=Math.min(90/img.width,100/img.height),dw=img.width*k,dh=img.height*k;bx2.drawImage(img,ox+p.w/2-dw/2,oy+p.h-dh,dw,dh)}
  else drawChar(bx2,ch,ox,oy,p.w,p.h);
  bx2.globalCompositeOperation='source-atop';
  bx2.fillStyle=B.c[0];bx2.globalAlpha=Math.max(0,.55*(1-t))*(.7+.3*Math.sin(burn.t*.8));bx2.fillRect(0,0,130,150);
  bx2.fillStyle='#140a05';bx2.globalAlpha=Math.min(.92,t*1.35);bx2.fillRect(0,0,130,150);
  bx2.globalAlpha=1;bx2.globalCompositeOperation='source-over';
  const a=t<.7?1:Math.max(0,1-(t-.7)/.3),jx=B.s==='glitch'?(Math.random()-.5)*6:0,jy=B.s==='elec'?(Math.random()-.5)*3:0;
  ctx.save();ctx.globalAlpha=a;ctx.translate(p.x+p.w/2+jx,p.y+p.h+jy);ctx.scale(1,1-t*.3);
  ctx.drawImage(bc,-(ox+p.w/2),-(oy+p.h));ctx.restore();
}
function goLoop(){
  if(!over||running||burn)return;
  frame++;
  obs.forEach(o=>o.x-=speed);obs=obs.filter(o=>o.x+o.w>-10);
  en.forEach(e=>e.x-=speed+e.v);en=en.filter(e=>e.x+e.w>-50);
  co.forEach(c=>c.x-=speed);co=co.filter(c=>c.x>-20);
  bp.forEach(b=>b.x-=b.v);bp=bp.filter(b=>b.x>-40);
  pb.forEach(b=>b.x+=b.v);pb=pb.filter(b=>b.x<W+20);
  hearts.forEach(h=>h.x-=speed);hearts=hearts.filter(h=>h.x>-20);
  stepParts();draw();
  requestAnimationFrame(goLoop);
}
function startBurn(sc){
  burn={t:0,max:80};dead=true;
  (function bl(){
    burn.t++;
    p.vy+=0.75;p.y+=p.vy;if(p.y>=G-p.h){p.y=G-p.h;p.vy=0}
    burnFx();stepParts();draw();
    if(burn.t<burn.max)requestAnimationFrame(bl);
    else{burn=null;showOver(sc);goLoop()}
  })();
}
function hurt(){burst(p.x+p.w/2,p.y+p.h/2,14,['#ff4d4d','#ffb3b3'],{spread:4});shake=12}
function ldVol(k){try{const v=localStorage.getItem(k);return v===null?1:Math.max(0,Math.min(1,+v||0))}catch(e){return 1}}
vm=ldVol('lompat-vm');ve=ldVol('lompat-ve');
const sM=document.getElementById('vm'),sE=document.getElementById('ve');
sM.value=Math.round(vm*100);sE.value=Math.round(ve*100);
document.getElementById('vmv').textContent=sM.value+'%';document.getElementById('vev').textContent=sE.value+'%';
function applyVol(){if(ac){musicGain.gain.setTargetAtTime(musicOn?0.5*vm:0,ac.currentTime,0.03);sfxGain.gain.setTargetAtTime(0.6*ve,ac.currentTime,0.03)}}
sM.addEventListener('input',()=>{vm=sM.value/100;try{localStorage.setItem('lompat-vm',vm)}catch(e){}document.getElementById('vmv').textContent=sM.value+'%';applyVol()});
sE.addEventListener('input',()=>{ve=sE.value/100;try{localStorage.setItem('lompat-ve',ve)}catch(e){}document.getElementById('vev').textContent=sE.value+'%';applyVol()});
sE.addEventListener('change',()=>{if(initAudio())sfx('coin')});
function isBanned(n){return String(n||'').trim()==='0000'}
function showBan(msg){
  document.getElementById('bt').textContent=msg||'Username “0000” tidak diizinkan.';
  selecting=true;mEl.style.display='none';
  document.getElementById('unm').classList.add('hide');
  document.getElementById('ban').classList.remove('hide');
}
function hideBan(){document.getElementById('ban').classList.add('hide')}
function cancelUser(){if(isBanned(uname))showBan();else closeUser()}
document.getElementById('bch').addEventListener('click',e=>{openUser();e.currentTarget.blur()});
const wxb=document.getElementById('wxb');
function wxLabel(){wxb.textContent='🌦 Cuaca: '+(wxOn?'ON':'OFF');wxb.classList.toggle('off',!wxOn)}
wxLabel();
wxb.addEventListener('click',e=>{
  wxOn=!wxOn;
  try{localStorage.setItem('lompat-wx',wxOn?'1':'0')}catch(err){}
  wxLabel();draw();e.currentTarget.blur();
});
function pauseView(){
  document.getElementById('po').classList.remove('go');
  const t=document.getElementById('pt');t.textContent='PAUSE';t.classList.remove('over');
  document.getElementById('pi').textContent='';
  document.getElementById('rs').classList.remove('hide');
  document.getElementById('rt').classList.add('hide');
}
function showOver(sc){
  document.getElementById('po').classList.add('go');
  lastRank=addScore(sc);
  const t=document.getElementById('pt');t.textContent='GAME OVER';t.classList.add('over');
  document.getElementById('pi').textContent=uname+' · Skor: '+sc+' · Koin: '+cs+' (total tersimpan: '+tot+')'+(lastRank?' · 🏆 Peringkat #'+lastRank:'');
  document.getElementById('rs').classList.add('hide');
  document.getElementById('rt').classList.remove('hide');
  document.getElementById('po').classList.remove('hide');
}
function toMenu(){
  cancelAnimationFrame(rafId);
  running=false;over=false;paused=false;intro=true;selecting=false;
  document.getElementById('pilih').classList.add('hide');updIntro();
  reset();speed=2;
  document.getElementById('po').classList.add('hide');
  document.getElementById('pz').classList.add('hide');shBtn(false);
  mEl.style.display='flex';bEl.style.display='';bEl.textContent='Mulai';
  (function il(){if(!intro)return;frame++;draw();requestAnimationFrame(il)})();
}
document.getElementById('mu').addEventListener('click',e=>{toMenu();e.currentTarget.blur()});
document.getElementById('rt').addEventListener('click',e=>{start();e.currentTarget.blur()});
function setPause(v){
  if(!running||over||v===paused)return;
  paused=v;
  if(v)pauseView();
  document.getElementById('po').classList.toggle('hide',!v);
  document.getElementById('pz').classList.toggle('hide',v);if(boss)shBtn(!v);
  if(v)cancelAnimationFrame(rafId);else{last=performance.now();rafId=requestAnimationFrame(loop)}
}
document.getElementById('pz').addEventListener('click',e=>{setPause(true);e.currentTarget.blur()});
document.getElementById('rs').addEventListener('click',e=>{setPause(false);e.currentTarget.blur()});
addEventListener('keydown',e=>{if(e.target&&e.target.tagName==='INPUT')return;
  if(e.code==='KeyP'||e.code==='Escape'){if(!document.getElementById('set').classList.contains('hide')){closeSet();return}setPause(!paused)}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)setPause(true)});
updIntro();if(!uname)openUser();else if(isBanned(uname))showBan();else if(onlineOK()){selecting=true;mEl.style.display='none';checkBan(uname).then(b=>{if(b)showBan('Username atau akunmu diblokir oleh admin.');else{selecting=false;mEl.style.display='flex';registerName(uname)}})}reset();speed=2;(function il(){if(!intro)return;frame++;draw();requestAnimationFrame(il)})();
