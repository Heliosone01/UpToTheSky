// ====================== 游戏配置 ======================
const JUMP_FORCE = -12;
const GRAVITY = 0.4;
const SCREEN_HEIGHT = window.innerHeight;
const GROUND_HEIGHT = 100;

// ====================== 音频 ======================
const CLICK_SOUND_SRC = "resources/click.mp3";
const BG_MUSIC_SRC = "resources/bg-music.mp3";

let bgMusic = null;

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

// 旋转
let rotate = 0;

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

  // 永远带上 rotate，不可能被覆盖
  player.style.transform = `translateX(-50%) translateY(${renderY}px) rotate(${rotate}deg)`;

  // 地面
  const ground = document.querySelector(".ground");
  ground.style.display = Math.abs(y) < SCREEN_HEIGHT ? "block" : "none";

  // 云朵
  const currentCloudSection = Math.floor(Math.abs(y) / SCREEN_HEIGHT);
  if (currentCloudSection !== lastCloudSection) {
    createClouds();
    lastCloudSection = currentCloudSection;
  }

  requestAnimationFrame(update);
}

// ====================== 点击 ======================
function onPlayerClick() {
  if (gameOver) return;

  if (!gameStart) {
    gameStart = true;
    bgMusic = new Audio(BG_MUSIC_SRC);
    bgMusic.loop = false;
    bgMusic.play().catch(() => {});
    bgMusic.addEventListener("ended", () => {
      if (!gameOver) endGame();
    });
  }

  vy = JUMP_FORCE;

  const clickAudio = new Audio(CLICK_SOUND_SRC);
  clickAudio.volume = 1;
  clickAudio.play().catch(() => {});

  // 强制旋转
  rotate = 45;
  setTimeout(() => {
    rotate = 0;
  }, 300);
}

// ====================== 结束 ======================
function endGame() {
  gameOver = true;
  scoreDisplay.innerText = `最高高度：${Math.round(maxHeight)}m`;
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

  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }

  document.querySelector(".ground").style.display = "block";
  resultPanel.style.display = "none";
  createClouds();
  requestAnimationFrame(update);
}