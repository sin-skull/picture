// UI要素の取得
const menu = document.getElementById('menu');
const m = document.getElementById('m');
const resumeButton = document.getElementById('resume');
const restartButton = document.getElementById('restart');
const exitButton = document.getElementById('exit');
const resultElement = document.getElementById('result');
const gameScreen = document.getElementById('game-screen');
const readyText = document.getElementById('ready-text');

// グローバル変数
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let source = null;
let isRunning = false;
let startTime = 0;
let elapsedTime = 0;
let tapTimes = [];
let timingData = [];
let savedTimingData = [];
let savedStartTime = 0;
let bpm = 120;
let songData = null;
let gameDuration = 60;

// 設定値
const allowedKeys = [
  ' ', 'Enter',
  ...'abcdefghijklmnopqrstuvwxyz'.split(''),
  '-', '^', '¥', '@', '[', ']', ';', ':', ',', '.', '/', '_'
];

const evaluationThresholds = {
  Excellent: 0.1,
  Good: 0.125,
  Average: 0.2,
  Miss: 0.25,
};

// ゲームの状態切り替え
function toggleGame() {
  isRunning = !isRunning;

  if (isRunning) {
    audioCtx.resume();
    menu.classList.add('hidden');
    initializeGame();
  } else {
    audioCtx.suspend();
    menu.classList.remove('hidden');
    savedTimingData = [...timingData];
    savedStartTime = audioCtx.currentTime - startTime;
    timingData = [];
  }
}

// ゲーム初期化
function initializeGame() {
  if (!songData) {
    const songSelect = 'song1';
    songData = songsData[songSelect];
    bpm = songData.bpm;
    timingData = songData.timingData.map((time) => time * (bpm / songData.bpm));
    gameDuration = songData.maxDuration;
  }

  startTime = audioCtx.currentTime - savedStartTime;
}

// ゲームスタート
function startGame() {
  const songSelect = 'song1';
  songData = songsData[songSelect];

  if (!songData) {
    alert("曲データが見つかりません！");
    return;
  }

  fetchAudio(songData.file)
    .then((audioBuffer) => {
      playAudio(audioBuffer);
      setupGameEnvironment();
    })
    .catch((err) => {
      console.error("音声データのロード中にエラーが発生しました:", err);
      alert("音声データをロードできませんでした。");
    });
}

// 音声データをロード
async function fetchAudio(filePath) {
  const response = await fetch(filePath);
  const arrayBuffer = await response.arrayBuffer();
  return audioCtx.decodeAudioData(arrayBuffer);
}

// 音声再生のセットアップ
function playAudio(audioBuffer) {
  if (source) source.stop();

  source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioCtx.destination);
  source.start(0);

  startTime = audioCtx.currentTime;
}

// ゲーム環境のセットアップ
function setupGameEnvironment() {
  timingData = songData.timingData.map((time) => time * (bpm / songData.bpm));
  gameDuration = songData.maxDuration;
  tapTimes = [];
  isRunning = true;

  // スクリーンの背景設定
  gameScreen.style.backgroundImage = 'url("main.jpg")';
  gameScreen.style.backgroundSize = 'cover';
  gameScreen.style.backgroundPosition = 'center';
  gameScreen.style.aspectRatio = '16 / 9';
  resultElement.classList.add('hidden');

  gameLoop();
}

// ゲームループ
function gameLoop() {
  if (!isRunning) return;

  elapsedTime = audioCtx.currentTime - startTime;

  if (elapsedTime >= gameDuration) {
    showResults();
    return;
  }

  requestAnimationFrame(gameLoop);
}

// タップ処理
function handleTap() {
  if (!isRunning) return;

  const currentTime = audioCtx.currentTime - startTime;
  const result = evaluateTap(currentTime);

  displayResult(result.evaluation, result.delta);
}

// タップの評価
function evaluateTap(currentTime) {
  let closestDelta = Infinity;
  let evaluation = 'Miss';

  timingData.forEach((time) => {
    const delta = Math.abs(time - currentTime);
    if (delta < closestDelta) closestDelta = delta;
  });

  for (const [key, threshold] of Object.entries(evaluationThresholds)) {
    if (closestDelta <= threshold) {
      evaluation = key;
      break;
    }
  }

  return { evaluation, delta: closestDelta };
}

// 結果表示
function displayResult(evaluation, delta) {
  const colors = {
    Excellent: 'green',
    Good: 'blue',
    Average: 'orange',
    Miss: 'red',
  };

  resultElement.textContent = `${evaluation}! 差: ${delta.toFixed(3)}秒`;
  resultElement.style.color = colors[evaluation];
  resultElement.classList.remove('hidden');
}

// ゲーム終了
function showResults() {
  isRunning = false;
  resultElement.textContent = 'ゲーム終了';
  resultElement.classList.remove('hidden');
}

// イベントリスナー
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') toggleGame();
  if (allowedKeys.includes(event.key)) handleTap();
});

document.addEventListener('touchstart', handleTap);

resumeButton.addEventListener('click', toggleGame);
restartButton.addEventListener('click', startGame);
exitButton.addEventListener('click', () => {
  if (source) source.stop();
  isRunning = false;
  alert("ゲームを終了しました。");
});