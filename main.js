import { CONFIG } from "./config.js";
import { Rocket, Particle } from "./classes.js";

const isMobile = window.innerWidth <= 600;
const FIREWORK_DURATION = isMobile ? 200 : 400;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const bgm = document.getElementById("bgm");

let rockets = [];
let particles = [];

let stage = 0;
let index = 0;
let started = false;
let fireworkTime = 0;
let heartDone = false;
let heartProgress = 0;
let finalShown = false;

function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);

function explodeText(x,y,text,isName){
  if(particles.length > CONFIG.PARTICLE_LIMIT) return;

  if(!text){
    for(let i=0;i<50;i++){
      particles.push(new Particle(
        x,y,
        x+(Math.random()-.5)*200,
        y+(Math.random()-.5)*200,
        `${Math.random()*255},${Math.random()*255},${Math.random()*255}`
      ));
    }
    return;
  }

  const off=document.createElement("canvas");
  const octx=off.getContext("2d");

  off.width=canvas.width;
  off.height=canvas.height;

  octx.textAlign="center";
  octx.fillStyle="white";
  octx.font = `bold ${
  isMobile ? (isName?80:22) : (isName?160:82)
}px Arial`;
  octx.fillText(text,off.width/2,off.height/2);

  const img=octx.getImageData(0,0,off.width,off.height);

  for(let y2=0;y2<off.height;y2+=4){
    for(let x2=0;x2<off.width;x2+=4){
      const i=(y2*off.width+x2)*4;
      if(img.data[i+3]>150){
        particles.push(new Particle(x,y,x2,y2,"255,100,200"));
      }
    }
  }
}

function nextRocket(){
  if(stage===0){
    rockets.push(new Rocket(canvas, CONFIG.NAME, true));
    stage=1;
  } else if(stage===1 && index<CONFIG.TEXTS.length){
    rockets.push(new Rocket(canvas, CONFIG.TEXTS[index]));
    index++;
  } else {
    stage=2;
  }
}
function drawHeart(){
  const cx = canvas.width/2;
  const cy = canvas.height/2;
  const scale = isMobile ? 6 : 12;

  heartProgress += 0.02;

  for(let t=0; t<Math.PI*2*heartProgress; t+=0.08){
    let x = 16*Math.pow(Math.sin(t),3);
    let y = -(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t));

    particles.push(new Particle(cx,cy,cx+x*scale,cy+y*scale,"255,80,150"));
  }

  if(heartProgress >= 1){
    heartDone = true;
  }
}

function animate(){
  if(!started) return;

  ctx.fillStyle="rgba(0,0,0,.25)";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  rockets.forEach((r,i)=>{
    r.update(explodeText);
    r.draw(ctx);
    if(r.done){
      rockets.splice(i,1);
      if(stage<=1) setTimeout(nextRocket, isMobile ? 700 : 1200);
    }
  });

  particles.forEach((p,i)=>{
    p.update();
    p.draw(ctx);
    if(p.a<=0) particles.splice(i,1);
  });
 // FIREWORK STAGE
if(stage===2){
  fireworkTime++;

  if(Math.random()<0.08){
    let r=new Rocket(canvas,"");
    r.x=Math.random()*canvas.width;
    r.targetY=Math.random()*canvas.height*0.5;
    rockets.push(r);
  }

  if(fireworkTime > FIREWORK_DURATION){
    stage = 3;
  }
}

// HEART STAGE
if(stage===3 && !heartDone){
  drawHeart();
}

// SHOW FINAL
if(stage===3 && heartDone && !finalShown){
  finalShown = true;
  document.getElementById("finalScene").classList.add("show");
}
  requestAnimationFrame(animate);
}

document.getElementById("startBtn").onclick = () => {
  document.getElementById("startScreen").style.display="none";
  bgm.play();
  started=true;
  setTimeout(nextRocket, isMobile ? 500 : 800);
  animate();
};
