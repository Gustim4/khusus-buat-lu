import { CONFIG } from "./config.js";
import { Rocket, Particle } from "./classes.js";

const isMobile = window.innerWidth <= 600;
// --- UBAHAN 1: Durasi kembang api acak diperpendek ---
const FIREWORK_DURATION = isMobile ? 300 : 200; 
// -----------------------------------------------------

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
let posisiSekarang = "tengah"; 

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
  octx.font = `500 ${isMobile ? (isName ? 90 : 36) : (isName ? 130 : 60)}px 'Arial Narrow', 'Segoe UI', sans-serif`;
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
    
    clearInterval(intervalHujan); 

    canvas.style.transition = "opacity 2s ease";
    canvas.style.opacity = "0";
    setTimeout(() => { canvas.style.display = "none"; }, 2000);
    
    const memoryContainer = document.getElementById("memoryRain");
    if(memoryContainer) memoryContainer.classList.remove("hidden");
    
    startMemoryRain(); 
    
    // --- UBAHAN 2: Tahan layarnya jadi 16 Detik sebelum kartu muncul ---
    setTimeout(() => {
      const sceneAkhir = document.getElementById("finalScene");
      if (sceneAkhir) {
        sceneAkhir.classList.add("show");
      }
      
      const kartu = document.getElementById("main-card");
      if(kartu) {
        kartu.scrollIntoView({ block: "nearest", inline: "center" });
      }
      posisiSekarang = "tengah";
    }, 16000); // <-- Diubah dari 6000 menjadi 16000
    // -------------------------------------------------------------------
  }
  requestAnimationFrame(animate);
}

let intervalHujan; 

function buatHujanHati() {
  const emojis = ["💖", "🥀", "🎂", "🎁", "🎀", "💗", "💐", "🎉", "🌸", "💕", "✨"];
  
  intervalHujan = setInterval(() => {
    if (!started) return; 
    
    const heart = document.createElement("div");
    heart.className = "floating-heart-bg";
    heart.innerText = emojis[Math.floor(Math.random() * emojis.length)];
    
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.animationDuration = Math.random() * 4 + 4 + "s";
    heart.style.fontSize = Math.random() * 10 + 12 + "px";
    
    document.body.appendChild(heart);
    
    setTimeout(() => { heart.remove(); }, 8000);
  }, 400); 
}

document.getElementById("startBtn").onclick = () => {
  document.getElementById("startScreen").style.display = "none";
  if (bgm) {
    bgm.play().catch(err => { console.log("Musik diblokir"); });
  }
  started = true;
  buatHujanHati(); 
  setTimeout(nextRocket, isMobile ? 1500 : 800);
  animate();
};

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

document.getElementById("replayBtn").onclick = () => {
  const sceneContainer = document.getElementById("finalScene");
  if(sceneContainer) {
    sceneContainer.classList.remove("show");
    sceneContainer.style.backgroundPosition = "50% center"; 
  }
  
  canvas.style.display = "block";
  canvas.style.opacity = "1";

  stage = 0;
  index = 0;
  fireworkTime = 0;
  heartDone = false;
  heartProgress = 0;
  finalShown = false;
  rockets = [];
  particles = [];
  posisiSekarang = "tengah"; 
  
  setTimeout(nextRocket, isMobile ? 1500 : 800);
};

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

window.navigasiSamping = function(arah) {
  const kartu = document.getElementById("main-card");
  const galeriKiri = document.getElementById("gallery-left");
  const galeriKanan = document.getElementById("gallery-right");
  const sceneContainer = document.getElementById("finalScene"); 

  if (arah === "kiri") {
    if (posisiSekarang === "tengah") {
      galeriKiri.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      sceneContainer.style.backgroundPosition = "0% center";
      posisiSekarang = "kiri";
    } else {
      kartu.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      sceneContainer.style.backgroundPosition = "50% center";
      posisiSekarang = "tengah";
    }
  } 
  else if (arah === "kanan") {
    if (posisiSekarang === "tengah") {
      galeriKanan.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      sceneContainer.style.backgroundPosition = "100% center";
      posisiSekarang = "kanan";
    } else {
      kartu.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      sceneContainer.style.backgroundPosition = "50% center";
      posisiSekarang = "tengah";
    }
  }
};

document.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON" || e.target.id === "openLetterBtn" || e.target.closest(".heart-nav") || e.target.closest(".photo-item")) return;

  const heart = document.createElement("div");
  heart.className = "tap-heart";
  heart.innerHTML = "💕"; 
  heart.style.left = `${e.clientX}px`;
  heart.style.top = `${e.clientY}px`;
  document.body.appendChild(heart);
  
  setTimeout(() => { heart.remove(); }, 800);
});

setTimeout(() => {
  const btnSurat = document.getElementById("openLetterBtn");
  const overlaySurat = document.getElementById("letterOverlay");
  const tombolSilang = document.getElementById("closeLetter");
  const interactiveContent = document.getElementById("interactiveContent");

  const usernameIG = "xaw_sss"; 
  const linkInstagram = `https://ig.me/m/${usernameIG}`;

  const teksSuratLengkap = `
    <h3 style="color: #ff4dd2; margin-top: 0;">Dear Kak Zulfa... 🌸</h3>
    <div style="max-height: 220px; overflow-y: auto; text-align: left; font-size: 14px; line-height: 1.6; padding-right: 5px; margin-bottom: 15px;">
      Gua mau sekalian ambil momen hari spesial ini buat bilang selamat yang sebesar-besarnya ya, Kak, udah resmi keterima dan masuk kuliah S1 Manajemen di Untirta! Asli, pas pertama kali denger kabar itu, gua ikut seneng banget. Kakak hebat bisa tembus kampus negeri kebanggaan Banten. <br><br>
      Jurusan Manajemen pasti cocok banget sih sama karakter kakak yang rapi dan pinter ngatur banyak hal. Semoga nanti dunia perkuliahan barunya dilancarkan jaya, ketemu lingkungan sircle baru yang seru, dapet dosen-dosen yang asyik, dan tugas-tugas kuliahnya selalu aman. Kuliah di sana emang bakal sibuk dan beda banget sama masa sekolah, tapi gua yakin kakak bisa ngelewatin semuanya dengan gampang dan jadi mahasiswa berprestasi! 💪🎓<br><br>
      Sebenernya gua mau bilang makasih banyak juga, selama kita di sekolah kemarin kakak udah sering sharing, ngasih banyak saran, dan selalu terbuka tiap kali gua ajak ngobrol tentang hal apa pun. Gua ngerasa beruntung banget bisa kenal dekat sama kakak. Setiap masukan atau sekadar obrolan santai bareng kakak itu berharga banget buat gua. Jarang ada orang hebat yang se-low profile dan peduli ini sama adek kelasnya.<br><br>
      Di mana pun kakak melangkah setelah lulus ini, pesen gua jangan pernah lupain cerita kita di sekolah ya, Kak. Makasih udah meluangkan waktu buat buka website ucapan sederhana yang gua bikin khusus buat kakak ini. Semoga kejutan kecil ini bisa bikin kakak senyum pas ngebacanya.<br><br>
      Selamat menyambut lembaran baru yang penuh tantangan di kampus Untirta, Kak Zulpee! Semoga segala urusan masa depan kakak dipermudah jalannya. Cheers to your new journey! 🚀🥳🎓
    </div>
  `;

  function tutupOverlay() {
    if (overlaySurat) {
      overlaySurat.style.opacity = "0";
      overlaySurat.style.visibility = "hidden";
    }
  }

  if (btnSurat && overlaySurat && tombolSilang && interactiveContent) {
    
    btnSurat.onclick = () => {
      overlaySurat.style.opacity = "1";
      overlaySurat.style.visibility = "visible";
      tampilkanTahap1(); 
    };

    tombolSilang.onclick = () => {
      tutupOverlay();
    };

    function tampilkanTahap1() {
      interactiveContent.innerHTML = `
        <h3 style="color: #ff4dd2; margin-top: 0;">Eh Sebentar... 🧐</h3>
        <p style="font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
          Kak, tombol hati di samping kiri dan kanan kartu ucapan itu bisa diklik buat geser lihat foto loh! Sudah dicoba belum?
        </p>
        <div style="display: flex; gap: 10px; justify-content: center;">
          <button id="optLanjut1" style="background: #ff4dd2; color: white; border: none; padding: 8px 14px; border-radius: 15px; cursor: pointer; font-size: 13px; font-weight: bold;">Udah liat kok, lanjut</button>
          <button id="optBalik1" style="background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 8px 14px; border-radius: 15px; cursor: pointer; font-size: 13px;">Balik lihat</button>
        </div>
      `;

      document.getElementById("optLanjut1").onclick = () => { tampilkanTahap2Surat(); };
      document.getElementById("optBalik1").onclick = () => { tutupOverlay(); };
    }

    function tampilkanTahap2Surat() {
      interactiveContent.innerHTML = teksSuratLengkap + `
        <div style="text-align: center; margin-top: 10px;">
          <button id="optSelesaiBaca" style="background: #ff4dd2; color: white; border: none; padding: 10px 20px; border-radius: 20px; cursor: pointer; font-size: 13px; font-weight: bold; width: 100%;">
            Selesai Membaca 📖
          </button>
        </div>
      `;

      document.getElementById("optSelesaiBaca").onclick = () => { tampilkanTahap3CekBalasan(); };
    }

    function tampilkanTahap3CekBalasan() {
      interactiveContent.innerHTML = `
        <h3 style="color: #ff4dd2; margin-top: 0;">Satu Hal Lagi... ✨</h3>
        <p style="font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
          Makasih banyak ya Kak Zulpee udah meluangkan waktu buat baca sampai habis. Berhubung semua rahasia dan surat di website ini udah sukses terbongkar, ditunggu nih testimoni, kesan pesan, atau omelan kakak di DM Instagram gua. Tombol di bawah siap mengantar kakak dalam 1 detik, gass kirim balasan? 🗿🚀
        </p>
        <div style="display: flex; gap: 10px; justify-content: center; flex-direction: column;">
          <a href="${linkInstagram}" target="_blank" id="optKirimIG" style="display: block; background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); color: white; padding: 10px; border-radius: 15px; text-decoration: none; font-weight: bold; font-size: 13px;">
            📸 Kirim pesan balasan
          </a>
          
          <button id="optSalinLink" style="background: rgba(0, 255, 255, 0.15); color: #00ffff; border: 1px solid rgba(0, 255, 255, 0.4); padding: 10px; border-radius: 15px; cursor: pointer; font-size: 12px; font-weight: bold; transition: all 0.3s ease; animation: pulseBtn 2s infinite;">
            🔗 Salin link web, siapa tau mau up story 🙄
          </button>

          <button id="optBalik3" style="background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 10px; border-radius: 15px; cursor: pointer; font-size: 13px;">
            Balik lihat lagi
          </button>
        </div>
      `;

      document.getElementById("optSalinLink").onclick = function() {
        const linkSekarang = window.location.href;
        navigator.clipboard.writeText(linkSekarang).then(() => {
          this.innerText = "✅ Link berhasil disalin! Ditunggu story-nya 🗿";
          this.style.background = "rgba(0, 255, 100, 0.2)";
          this.style.color = "#00ff64";
          this.style.borderColor = "rgba(0, 255, 100, 0.4)";
          this.style.animation = "none"; 
          
          setTimeout(() => {
            this.innerText = "🔗 Salin link web, siapa tau mau up story 🙄";
            this.style.background = "rgba(0, 255, 255, 0.15)";
            this.style.color = "#00ffff";
            this.style.borderColor = "rgba(0, 255, 255, 0.4)";
            this.style.animation = "pulseBtn 2s infinite";
          }, 3000);
        }).catch(err => {
          alert("Gagal menyalin link secara otomatis.");
        });
      };

      document.getElementById("optBalik3").onclick = () => { tutupOverlay(); };
    }
  }
}, 500);

// --- UBAHAN 3: Logika Hujan Foto Zig-zag & Beriringan ---
function startMemoryRain() {
  console.log("Fungsi startMemoryRain dipanggil!"); 
  const container = document.getElementById('memoryRain');
  if (!container) return;
  
  container.classList.remove('hidden');

  const mains = document.querySelectorAll('.photo-main');
  mains.forEach((el, index) => {
    // Penempatan Posisi Zig-Zag: 
    // Jika index Genap (0, 2) maka di kiri (25%). Jika Ganjil (1) maka di kanan (60%).
    if (index % 2 === 0) {
      el.style.left = "25%";
    } else {
      el.style.left = "60%";
    }
    
    // Memberikan jeda (delay) beriringan: Foto 1 (0 detik), Foto 2 (4 detik), Foto 3 (8 detik)
    const delayAnimasi = index * 4; 
    
    el.style.animation = "none"; 
    void el.offsetWidth; 
    
    // Tambahan 'both' pada akhir animasi memastikan foto tetap tidak terlihat (mengikuti frame 0% animasi) selama menunggu antrean
    el.style.animation = `floatUp 12s linear ${delayAnimasi}s both`; 
  });

  const subs = document.querySelectorAll('.photo-sub');
  subs.forEach((el) => {
    el.style.left = Math.random() * 85 + "%";
    
    const duration = Math.random() * 4 + 5; 
    const delaySub = Math.random() * 7; 
    
    el.style.animation = "none"; 
    void el.offsetWidth; 
    el.style.animation = `floatUp ${duration}s linear ${delaySub}s both`; 
  });
}
// --------------------------------------------------------
