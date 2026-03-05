// ====================== 游戏配置 ======================
const JUMP_FORCE = -12;
const GRAVITY = 0.4;
const CAMERA_LERP = 0.08;

// ====================== 音频 ======================
const CLICK_SOUND_SRC = "UpToTheSky/resources/click.mp3";
const BG_MUSIC_SRC = "UpToTheSky/resources/bg-music.mp3";

let bgMusic = null;

// ====================== 图片 ======================
const IMG_NORMAL = "UpToTheSky/resources/player.png";
const IMG_UP = "UpToTheSky/resources/player_up.png";

// ====================== 游戏状态 ======================
let player;
let resultPanel;
let scoreDisplay;

let y = 0;
let vy = 0;
let gameOver = false;
let gameStart = false;

let maxHeight = 0;
let cameraY = 0;

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

  createClouds();

  document.body.addEventListener("click", onPlayerClick);
  requestAnimationFrame(update);
};

// ====================== 主循环 ======================
function update() {
  if (gameOver) return;

  vy += GRAVITY;
  y += vy;

  if (y > 0) {
    y = 0;
    vy = 0;
  }

  const currentHeight = Math.abs(y);
  if (currentHeight > maxHeight) {
    maxHeight = currentHeight;
  }

  player.src = vy < 0 ? IMG_UP : IMG_NORMAL;

  const targetCameraY = y - 200;
  cameraY += (targetCameraY - cameraY) * CAMERA_LERP;
  player.style.transform = `translateX(-50%) translateY(${y - cameraY}px)`;

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

  // 修复点击音效（每次新建，不冲突）
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
  y = vy = maxHeight = cameraY = 0;
  player.src = IMG_NORMAL;

  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }

  resultPanel.style.display = "none";
  requestAnimationFrame(update);
}