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
  isMobile ? (isName?80:26) : (isName?160:82)
}px Arial`;
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

 // JIKA LAYAR AKHIR SUDAH MUNCUL, KOSONGKAN CANVAS BIAR TRANSPARAN
  if (finalShown) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } else {
    // Jika belum di layar akhir, tetap gambar background hitam transparan untuk efek kembang api
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
  
  // Langsung munculkan scene akhir (background foto otomatis ikut memudar dari CSS)
  document.getElementById("finalScene").classList.add("show");
}
  requestAnimationFrame(animate);
}

document.getElementById("startBtn").onclick = () => {
  document.getElementById("startScreen").style.display="none";
  bgm.play();
  started=true;
  setTimeout(nextRocket, isMobile ? 1500 : 800);
  animate();
};
// Fitur Klik Foto: Benar-benar ke Tengah dan Latar Gelap
const photoOverlay = document.getElementById('photoOverlay');
const enlargedPhoto = document.getElementById('enlargedPhoto');
const closeOverlay = document.getElementById('closeOverlay');

// Beri fungsi klik ke semua foto kecil
document.querySelectorAll('.photo img').forEach(img => {
  img.style.cursor = 'pointer'; // Ganti kursor jadi jari
  
  img.addEventListener('click', (e) => {
    // 1. Ambil URL gambar yang diklik
    const imageSrc = e.target.src;
    
    // 2. Tempel URL ke gambar besar di overlay
    enlargedPhoto.src = imageSrc;
    
    // 3. Munculkan overlay hitam
    photoOverlay.classList.add('show');
    
    // Optional: Jeda musik sedikit biar dramatis (kalau mau)
    // bgm.volume = 0.3; 
  });
});

// Fungsi untuk menutup overlay
function hidePhoto() {
  photoOverlay.classList.remove('show');
  // bgm.volume = 1; // Kembalikan volume musik
}

// Tutup kalau tombol 'X' diklik
closeOverlay.addEventListener('click', hidePhoto);

// Tutup kalau area hitam di luar foto diklik
photoOverlay.addEventListener('click', (e) => {
  if (e.target === photoOverlay) {
    hidePhoto();
  }
});

// Tutup kalau tombol 'Esc' di keyboard ditekan
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && photoOverlay.classList.contains('show')) {
    hidePhoto();
  }
});
document.getElementById("replayBtn").onclick = () => {
  document.getElementById("finalScene").classList.remove("show");
  
  stage = 0;
  index = 0;
  fireworkTime = 0;
  heartDone = false;
  heartProgress = 0;
  finalShown = false;
  rockets = [];
  particles = [];
  
  setTimeout(nextRocket, isMobile ? 1500 : 800);
};

// Daftar doa acak untuk Kak Zulfaa (bisa kamu ganti/tambah sendiri teksnya)
const daftarDoa = [
  "🍀 yah zoonk klik lagi yah wkwkwk",
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
  // Efek animasi tombol saat diklik
  wishBtn.style.transform = 'scale(0.95)';
  setTimeout(() => wishBtn.style.transform = 'scale(1)', 100);

  // Ambil doa secara acak yang berbeda dari yang sedang tampil
  let doaAcak;
  do {
    doaAcak = daftarDoa[Math.floor(Math.random() * daftarDoa.length)];
  } while (doaAcak === specialWishText.innerText);

  // Tampilkan doa dengan efek teks mengetik/muncul halus
  specialWishText.style.opacity = 0;
  setTimeout(() => {
    specialWishText.innerText = doaAcak;
    specialWishText.style.opacity = 1;
    specialWishText.style.transition = 'opacity 0.3s ease';
  }, 150);

  // Sekaligus ledakkan sedikit partikel kembang api di canvas secara acak sebagai perayaan kecil
  if (particles.length < CONFIG.PARTICLE_LIMIT) {
    explodeText(canvas.width / 2, canvas.height / 2, "", false);
  }
});
// === FITUR POPUP KLIK FOTO BARU ===
document.querySelectorAll('.photo-slide img').forEach(img => {
  img.addEventListener('click', (e) => {
    enlargedPhoto.src = e.target.src;
    photoOverlay.classList.add('show');
  });
});

// === LOGIKA SWIPE CAROUSEL DI HP ===
const slider = document.querySelector('.photo-slider');
const slides = document.querySelectorAll('.photo-slide');
const dotsContainer = document.querySelector('.slider-dots');

let startX = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationID = 0;
let currentIndex = 0;

// Buat titik indikator sesuai jumlah foto (hanya jalan di HP)
if (isMobile && dotsContainer) {
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dotsContainer.appendChild(dot);
  });
}

const dots = document.querySelectorAll('.dot');

if (isMobile && slider) {
  slider.addEventListener('touchstart', touchStart);
  slider.addEventListener('touchend', touchEnd);
  slider.addEventListener('touchmove', touchMove);
}

function touchStart(e) {
  startX = e.touches[0].clientX;
  animationID = requestAnimationFrame(animation);
}

function touchMove(e) {
  const currentX = e.touches[0].clientX;
  const currentPick = currentX - startX;
  // Membatasi sensitivitas geseran
  currentTranslate = prevTranslate + currentPick;
}

function touchEnd() {
  cancelAnimationFrame(animationID);
  const movedBy = currentTranslate - prevTranslate;

  // Jika geser ke kiri lebih dari 50px, pindah ke foto berikutnya
  if (movedBy < -50 && currentIndex < slides.length - 1) currentIndex += 1;
  // Jika geser ke kanan lebih dari 50px, kembali ke foto sebelumnya
  if (movedBy > 50 && currentIndex > 0) currentIndex -= 1;

  setPositionByIndex();
}

function animation() {
  setSliderPosition();
  if (started) requestAnimationFrame(animation);
}

function setSliderPosition() {
  slider.style.transform = `translateX(${currentTranslate}px)`;
}

function setPositionByIndex() {
  // Menghitung posisi pas di tengah layar HP
  const slideWidth = slides[0].offsetWidth + 20; // width + gap
  currentTranslate = currentIndex * -slideWidth;
  prevTranslate = currentTranslate;
  slider.style.transform = `translateX(${currentTranslate}px)`;
  
  // Update titik aktif
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentIndex);
  });
}

// Reset slider saat tombol tonton lagi diklik
document.getElementById("replayBtn").addEventListener('click', () => {
  currentIndex = 0;
  currentTranslate = 0;
  prevTranslate = 0;
  if (slider) slider.style.transform = `translateX(0px)`;
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === 0);
  });
});
// === LOGIKA SWIPE UNTUK MEMBUKA FOTO MENGINTIP ===
const leftPanel = document.querySelector('.photos-left');
const rightPanel = document.querySelector('.photos-right');
const finalSceneArea = document.getElementById('finalScene');

let touchStartX = 0;
let touchEndX = 0;

if (isMobile && finalSceneArea) {
  finalSceneArea.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  finalSceneArea.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSideSwipe();
  }, { passive: true });
}

function handleSideSwipe() {
  const swipeDistance = touchEndX - touchStartX;

  // JIKA DIGESER KE KANAN (Swipe Right) -> Membuka Foto Kiri, Menutup Foto Kanan
  if (swipeDistance > 60) {
    if (rightPanel.classList.contains('open')) {
      rightPanel.classList.remove('open'); // Jika panel kanan lagi kebuka, tutup dulu
    } else {
      leftPanel.classList.add('open'); // Membuka foto kiri
    }
  }

  // JIKA DIGESER KE KIRI (Swipe Left) -> Membuka Foto Kanan, Menutup Foto Kiri
  if (swipeDistance < -60) {
    if (leftPanel.classList.contains('open')) {
      leftPanel.classList.remove('open'); // Jika panel kiri lagi kebuka, tutup dulu
    } else {
      rightPanel.classList.add('open'); // Membuka foto kanan
    }
  }
}

// === AKTIFKAN POPUP KLIK FOTO UNTUK STRUKTUR BARU ===
document.querySelectorAll('.photo-item img').forEach(img => {
  img.style.cursor = 'pointer';
  img.addEventListener('click', (e) => {
    enlargedPhoto.src = e.target.src;
    photoOverlay.classList.add('show');
  });
});

// Reset panel jika tombol tonton lagi diklik
document.getElementById("replayBtn").addEventListener('click', () => {
  if(leftPanel) leftPanel.classList.remove('open');
  if(rightPanel) rightPanel.classList.remove('open');
});
