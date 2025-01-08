const menu = document.getElementById('menu');
const m = document.getElementById('m');
const resumeButton = document.getElementById('resume');
const restartButton = document.getElementById('restart');
const exitButton = document.getElementById('exit');
const resultElement = document.getElementById('result');
const gameScreen = document.getElementById('game-screen');
const readyText = document.getElementById('ready-text');

let audio = null;
let startTime = 0;
let tapTimes = [];
let timingData = [];
let savedTimingData = [];
let savedStartTime = 0;
let isRunning = false;
let bpm = 120;  // 初期値としてbpmを設定
let songData = null;
let gameDuration = 60;  // ゲームの秒数を設定
let elapsedTime = 0;  // 経過時間の管理

// ESCキーでメニューを開くか、メニュー画面で再開する
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        toggleGame();
    }
});

document.addEventListener('click', (event) => {
    if (event.target === m) {
        toggleGame();
    }
});

function toggleGame() {
    isRunning = !isRunning;
    if (isRunning) {
        if (audio) audio.play();
        menu.classList.add('hidden');
        if (savedTimingData.length > 0) {
            timingData = [...savedTimingData];  // 保存したtimingDataを復元
        } else {
            const songSelect = 'song1';  // 曲選択
            songData = songsData[songSelect];
            bpm = songData.bpm;
            timingData = songData.timingData.map(time => time * (bpm / songData.bpm));  // bpmに合わせてスケーリング
            gameDuration = songData.maxDuration;  // 曲の最大秒数をゲームの進行に反映
        }
        startTime = performance.now() - savedStartTime;  // 経過時間の調整
    } else {
        if (audio) audio.pause();
        menu.classList.remove('hidden');
        savedTimingData = [...timingData];  // 現在のtimingDataを保存
        savedStartTime = performance.now() - startTime;  // 現在の経過時間を保存
        timingData = [];  // timingDataをリセット
    }
}
// ゲーム開始の準備
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' || isRunning) return;
   
    isRunning = true;
    readyText.classList.add('hidden');
    startGame();
});
document.addEventListener('touchstart', () => {
    if (isRunning) return;
    isRunning = true;
    readyText.classList.add('hidden');
    startGame();
});
// タップ処理のキー入力
const allowedKeys = [
    ' ', 'Enter',
    ...'abcdefghijklmnopqrstuvwxyz'.split(''),
    '-', '^', '¥', '@', '[', ']', ';', ':', ',', '.', '/', '_'
];

 


document.addEventListener('keydown', (event) => {
    if (allowedKeys.includes(event.key)) {
        handleTap();
    }
});
document.addEventListener('touchstart', handleTap);

// メニュー操作
resumeButton.addEventListener('click', () => {
    isRunning = true;
    if (audio) audio.play();
    menu.classList.add('hidden');
    // 再開時にtimingDataを設定
    if (savedTimingData.length > 0) {
        timingData = [...savedTimingData];  // 保存したtimingDataを復元
    } else {
        const songSelect = 'song1';  // 曲選択
        songData = songsData[songSelect];
        bpm = songData.bpm;
        timingData = songData.timingData.map(time => time * (bpm / songData.bpm));  // bpmに合わせてスケーリング
        gameDuration = songData.maxDuration;  // 曲の最大秒数をゲームの進行に反映
    }
    startTime = performance.now() - savedStartTime;  // 経過時間の調整
});
restartButton.addEventListener('click', () => {
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }
    menu.classList.add('hidden');
    isRunning = false;
    readyText.classList.remove('hidden');
});

exitButton.addEventListener('click', () => {
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }
    isRunning = false;
    menu.classList.add('hidden');
    alert("ゲームを終了しました。");
});

// ゲーム開始
function startGame() {
    const songSelect = 'song1';
    songData = songsData[songSelect];

    if (!songData) {
        alert("曲データが見つかりません！");
        return;
    }

    bpm = songData.bpm;

    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }

    audio = new Audio(songData.file);
    audio.play();

    timingData = songData.timingData.map(time => time * (bpm / songData.bpm));  // bpmに合わせてスケーリング
    gameDuration = songData.maxDuration;  // 曲の最大秒数をゲームに反映
    startTime = performance.now();
    tapTimes = [];
    isRunning = true;
gameScreen.style.backgroundImage = 'url("main.jpg")'; // 背景の画像選択
gameScreen.style.backgroundSize = 'cover'; // 画像をカバーするように調整
gameScreen.style.backgroundPosition = 'center'; // 画像を中央に配置
gameScreen.style.aspectRatio = '16 / 9'; // 固定比率を設定（例えば16:9
    resultElement.classList.add('hidden');

    gameLoop();
}

// ゲーム進行をループで管理
function gameLoop() {
    if (!isRunning) return;

    elapsedTime = (performance.now() - startTime) / 1000;

    // ゲーム終了の条件
    if (elapsedTime >= gameDuration) {
        showResults();
        return;
    }

    requestAnimationFrame(gameLoop);
}

// タップ処理
function handleTap() {
    if (!isRunning) return;

    const currentTime = (performance.now() - startTime) / 1000;
    let closestIndex = -1;
    let closestDelta = Infinity;

    timingData.forEach((time, index) => {
        const delta = Math.abs(time - currentTime);
        if (delta < closestDelta) {
            closestDelta = delta;
            closestIndex = index;
        }
    });

    if (closestIndex !== -1) {
        const delta = timingData[closestIndex] - currentTime;
        displayResult(delta);
    } else {
        displayResult(null);
    }
}

// 結果表示
function displayResult(delta) {
    const colors = {
        Excellent: 'green',
        Good: 'blue',
        Average: 'orange',
        Miss: 'red',
        Rongai: 'gray',
    };

    const evaluationImages = songData.images;

    let evaluation = 'Rongai';
    if (delta !== null) {
        const absDelta = Math.abs(delta);
        if (absDelta <= 0.1) evaluation = 'Excellent';
        else if (absDelta <= 0.125) evaluation = 'Good';
        else if (absDelta <= 0.2) evaluation = 'Average';
        else if (absDelta <= 0.25) evaluation = 'Miss';
    }

    resultElement.textContent = `${evaluation}! 差: ${delta !== null ? delta.toFixed(3) : 'N/A'}秒`;
    resultElement.style.color = colors[evaluation];
    resultElement.classList.remove('hidden');

    // 評価に応じた画像の表示
    const backgroundImage = evaluationImages[evaluation];
    gameScreen.style.backgroundImage = `url(${backgroundImage})`;
}

// 結果画面
function showResults() {
    isRunning = false;
    resultElement.textContent = 'ゲーム終了';
    resultElement.classList.remove('hidden');
}
