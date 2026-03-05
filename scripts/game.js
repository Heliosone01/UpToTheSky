// ====================== 游戏配置 ======================
const JUMP_FORCE = -12;
const GRAVITY = 0.4;
const SCREEN_HEIGHT = window.innerHeight;

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
let lastCloudY = -999999;

// ====================== 云朵生成 ======================
function createClouds() {
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

  // 地面只创建一次，固定在底部
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

  // 物理
  vy += GRAVITY;
  y += vy;

  // 第一段：站在地面上
  if (y > 0) {
    y = 0;
    vy = 0;
  }

  // 记录最高高度
  const currentHeight = Math.abs(y);
  if (currentHeight > maxHeight) {
    maxHeight = currentHeight;
  }

  // 切换上升/下降图片
  player.src = vy < 0 ? IMG_UP : IMG_NORMAL;

  // ====================== 主角在屏幕内循环 ======================
  let renderY = y % SCREEN_HEIGHT;
  if (renderY > 0) {
    renderY -= SCREEN_HEIGHT;
  }
  player.style.transform = `translateX(-50%) translateY(${renderY}px)`;

  // ====================== 关键：只在第一段显示地面 ======================
  const ground = document.querySelector(".ground");
  if (Math.abs(y) < SCREEN_HEIGHT) {
    ground.style.display = "block"; // 第一段：显示地面
  } else {
    ground.style.display = "none";  // 飞上去：隐藏地面
  }

  // 云朵每过一屏重新生成
  const cloudSection = Math.floor(Math.abs(y) / SCREEN_HEIGHT);
  if (cloudSection !== lastCloudY) {
    document.querySelectorAll('.cloud').forEach(c => c.remove());
    createClouds();
    lastCloudY = cloudSection;
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
  clickAudio.volume = 1.0;
  clickAudio.play().catch(() => {});
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
  lastCloudY = -999999;

  player.src = IMG_NORMAL;

  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }

  resultPanel.style.display = "none";
  requestAnimationFrame(update);
}