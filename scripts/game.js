// ====================== 游戏配置 ======================
const JUMP_FORCE = -12;
const GRAVITY = 0.4;
const SCREEN_HEIGHT = window.innerHeight;
const GROUND_HEIGHT = 100;

// ====================== 音频 ======================
const CLICK_SOUND_SRC = "resources/click.mp3";
const BG_MUSIC_SRC = "resources/bg-music.mp3";

// ====================== 图片 ======================
const IMG_NORMAL = "resources/player.png";
const IMG_UP = "resources/player_up.png";

// ====================== 游戏状态 ======================
let player;
let resultPanel;
let scoreDisplay;

let y = 0;
let vy = 0;
let gameOver = false;
let gameStart = false;

let maxHeight = 0;
let lastCloudSection = -999999;
let rotate = 0;

// 音频兼容（手机核心）
let bgMusic;
let audioUnlocked = false;

// ====================== 云朵生成 ======================
function createClouds() {
  document.querySelectorAll('.cloud').forEach(cloud => cloud.remove());
  const count = 7;
  for (let i = 0; i < count; i++) {
    const cloud = document.createElement("div");
    cloud.classList.add("cloud");

    const size = 30 + Math.random() * 40;
    cloud.style.width = size + "px";
    cloud.style.height = size / 2 + "px";
    cloud.style.top = Math.random() * 80 + "%";
    cloud.style.animationDuration = 50 + Math.random() * 40 + "s";
    cloud.style.animationDelay = -Math.random() * 50 + "s";

    document.body.appendChild(cloud);
  }
}

// ====================== 手机解锁音频 ======================
function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  const temp = new Audio();
  temp.play().catch(() => {});
}

// ====================== 启动 ======================
window.onload = function () {
  player = document.getElementById("player");
  resultPanel = document.getElementById("result");
  scoreDisplay = document.getElementById("score");

  const ground = document.createElement("div");
  ground.classList.add("ground");
  document.body.appendChild(ground);

  createClouds();

  document.body.addEventListener("click", onPlayerClick);
  document.body.addEventListener("touchstart", onPlayerClick);
  requestAnimationFrame(update);
};

// ====================== 主循环 ======================
function update() {
  if (gameOver) return;

  vy += GRAVITY;
  y += vy;

  const groundY = 0;
  if (y > groundY) {
    y = groundY;
    vy = 0;
  }

  const currentHeight = Math.abs(y);
  if (currentHeight > maxHeight) {
    maxHeight = currentHeight;
  }

  player.src = vy < 0 ? IMG_UP : IMG_NORMAL;

  let renderY = y % SCREEN_HEIGHT;
  if (renderY > 0) renderY -= SCREEN_HEIGHT;

  player.style.transform = `translateX(-50%) translateY(${renderY}px) rotate(${rotate}deg)`;

  const ground = document.querySelector(".ground");
  ground.style.display = Math.abs(y) < SCREEN_HEIGHT ? "block" : "none";

  const currentCloudSection = Math.floor(Math.abs(y) / SCREEN_HEIGHT);
  if (currentCloudSection !== lastCloudSection) {
    createClouds();
    lastCloudSection = currentCloudSection;
  }

  requestAnimationFrame(update);
}

// ====================== 点击 ======================
function onPlayerClick(e) {
  e.preventDefault();
  unlockAudio();

  if (gameOver) return;

  if (!gameStart) {
    gameStart = true;

    // 手机必生效背景音乐
    bgMusic = new Audio(BG_MUSIC_SRC);
    bgMusic.loop = false;
    bgMusic.load();
    bgMusic.play().catch(() => {
      setTimeout(() => bgMusic.play().catch(() => {}), 100);
    });

    // 音乐结束 → 必结束游戏
    bgMusic.onended = function () {
      if (!gameOver) endGame();
    };

    // 兜底：防止音乐不触发结束
    setTimeout(() => {
      if (!gameOver) endGame();
    }, 35000); // 35 秒后强制结束（你可改）
  }

  vy = JUMP_FORCE;

  // 点击音效
  const snd = new Audio(CLICK_SOUND_SRC);
  snd.volume = 1;
  snd.play().catch(() => {});

  // 旋转
  rotate = 45;
  setTimeout(() => (rotate = 0), 300);
}

// ====================== 结束 ======================
function endGame() {
  gameOver = true;
  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }
  scoreDisplay.innerText = `最高高度：${Math.round(maxHeight)/2}m`;
  resultPanel.style.display = "block";
}

// ====================== 重启 ======================
function restart() {
  gameOver = false;
  gameStart = false;
  y = vy = maxHeight = 0;
  lastCloudSection = -999999;
  rotate = 0;

  player.src = IMG_NORMAL;

  resultPanel.style.display = "none";
  createClouds();
  requestAnimationFrame(update);
}