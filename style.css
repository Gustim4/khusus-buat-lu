import { CONFIG } from "./config.js";
import { Rocket, Particle } from "./classes.js";

const isMobile = window.innerWidth <= 600;
const FIREWORK_DURATION = isMobile ? 600 : 400;
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
let posisiSekarang = "tengah"; // Status posisi navigasi: "kiri", "tengah", "kanan"

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
  octx.font = `bold ${isMobile ? (isName?80:40) : (isName?160:82)}px Arial`;
  octx.fillText(text,off.width/2,off.height/2);

  const img=octx.getImageData(0,0,off.width,off.height);

  for(let y2=0;y2<off.height;y2+=3){
    for(let x2=0;x2<off.width;x2+=3){
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

  heartProgress += 0.01;

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

  if (finalShown) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "rgba(0,0,0,.25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  rockets.forEach((r,i)=>{
    r.update(explodeText);
    r.draw(ctx);
    if(r.done){
      rockets.splice(i,1);
      if(stage<=1) setTimeout(nextRocket, isMobile ? 1950 : 1200);
    }
  });

  particles.forEach((p,i)=>{
    p.update();
    p.draw(ctx);
    if(p.a<=0) particles.splice(i,1);
  });

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

  if(stage===3 && !heartDone){
    drawHeart();
  }

  if(stage===3 && heartDone && !finalShown){
    finalShown = true;
    document.getElementById("finalScene").classList.add("show");
    
    // Dipastikan langsung mengunci fokus ke kartu ucapan tengah saat halaman dimuat
    setTimeout(() => {
      const kartu = document.getElementById("main-card");
      if(kartu) kartu.scrollIntoView({ block: "nearest", inline: "center" });
      posisiSekarang = "tengah";
    }, 100);
  }
  requestAnimationFrame(animate);
}

// =======================================================
// TOMBOL MULAI
// =======================================================
document.getElementById("startBtn").onclick = () => {
  document.getElementById("startScreen").style.display = "none";
  if (bgm) {
    bgm.play().catch(err => {
      console.log("Musik diblokir browser atau belum dimuat.");
    });
  }
  started = true;
  setTimeout(nextRocket, isMobile ? 1500 : 800);
  animate();
};

// =======================================================
// FITUR POP-UP ZOOM FOTO
// =======================================================
const photoOverlay = document.getElementById('photoOverlay');
const enlargedPhoto = document.getElementById('enlargedPhoto');
const closeOverlay = document.getElementById('closeOverlay');

function hidePhoto() {
  photoOverlay.classList.remove('show');
}

document.querySelectorAll('.photo-item img').forEach(img => {
  img.style.cursor = 'pointer'; 
  img.addEventListener('click', (e) => {
    enlargedPhoto.src = e.target.src;
    photoOverlay.classList.add('show');
  });
});

closeOverlay.addEventListener('click', hidePhoto);
photoOverlay.addEventListener('click', (e) => {
  if (e.target === photoOverlay) hidePhoto();
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && photoOverlay.classList.contains('show')) hidePhoto();
});

// =======================================================
// TOMBOL TONTON LAGI (REPLAY)
// =======================================================
document.getElementById("replayBtn").onclick = () => {
  const sceneContainer = document.getElementById("finalScene");
  if(sceneContainer) {
    sceneContainer.classList.remove("show");
    sceneContainer.style.backgroundPosition = "50% center"; // Reset background ke tengah saat replay
  }
  
  stage = 0;
  index = 0;
  fireworkTime = 0;
  heartDone = false;
  heartProgress = 0;
  finalShown = false;
  rockets = [];
  particles = [];
  posisiSekarang = "tengah"; // Reset status posisi navigasi
  
  setTimeout(nextRocket, isMobile ? 1500 : 800);
};

// =======================================================
// TOMBOL DOA SPESIAL (WISHES)
// =======================================================
const daftarDoa = [
  "🍀 semoga ga di kasih tugas diluar nalar yah wkwkwk",
  "💸 Dompet selalu tebal dan jajan lancar jaya!",
  "✨ Dijauhkan dari segala macam tugas yang bikin pusing!",
  "🚀 Semoga semua target dan impian tahun ini langsung centang hijau!",
  "🎂 Pokoknya hari ini wajib bahagia dan makan yang enak-enak!",
  "🌟 Tetap jadi kakak kelas panutan yang ramah dan keren!",
  "😇 Dilindungi dari badai prokrastinasi (suka nunda-nunda)!"
];

const wishBtn = document.getElementById('wishBtn');
const specialWishText = document.getElementById('specialWish');

wishBtn.addEventListener('click', () => {
  wishBtn.style.transform = 'scale(0.95)';
  setTimeout(() => wishBtn.style.transform = 'scale(1)', 100);

  let doaAcak;
  do {
    doaAcak = daftarDoa[Math.floor(Math.random() * daftarDoa.length)];
  } while (doaAcak === specialWishText.innerText);

  specialWishText.style.opacity = 0;
  setTimeout(() => {
    specialWishText.innerText = doaAcak;
    specialWishText.style.opacity = 1;
    specialWishText.style.transition = 'opacity 0.3s ease';
  }, 150);

  if (particles.length < CONFIG.PARTICLE_LIMIT) {
    explodeText(canvas.width / 2, canvas.height / 2, "", false);
  }
});

// =======================================================
// LOGIKA NAVIGASI TOMBOL HATI PINTAR + BACKGROUND PARALLAX
// =======================================================
window.navigasiSamping = function(arah) {
  const kartu = document.getElementById("main-card");
  const galeriKiri = document.getElementById("gallery-left");
  const galeriKanan = document.getElementById("gallery-right");
  const sceneContainer = document.getElementById("finalScene"); 

  if (arah === "kiri") {
    if (posisiSekarang === "tengah") {
      // Geser kartu ke galeri kiri + Geser background ke sisi 0% (Kiri terungkap)
      galeriKiri.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      sceneContainer.style.backgroundPosition = "0% center";
      posisiSekarang = "kiri";
    } else {
      // Pulang ke tengah + Reset background ke tengah (50%)
      kartu.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      sceneContainer.style.backgroundPosition = "50% center";
      posisiSekarang = "tengah";
    }
  } 
  else if (arah === "kanan") {
    if (posisiSekarang === "tengah") {
      // Geser kartu ke galeri kanan + Geser background ke sisi 100% (Kanan terungkap)
      galeriKanan.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      sceneContainer.style.backgroundPosition = "100% center";
      posisiSekarang = "kanan";
    } else {
      // Pulang ke tengah + Reset background ke tengah (50%)
      kartu.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      sceneContainer.style.backgroundPosition = "50% center";
      posisiSekarang = "tengah";
    }
  }
};
