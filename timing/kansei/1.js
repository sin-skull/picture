const menu = document.getElementById('menu');
const m = document.getElementById('m');
const resumeButton = document.getElementById('resume');
const restartButton = document.getElementById('restart');
const exitButton = document.getElementById('exit');
const resultElement = document.getElementById('result');
const gameScreen = document.getElementById('game-screen');
const readyText = document.getElementById('ready-text');

let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let source = null;
let startTime = 0;
let tapTimes = [];
let timingData = [];
let savedTimingData = [];
let savedStartTime = 0;
let isRunning = false;
let bpm = 120;
let songData = null;
let gameDuration = 60;
let elapsedTime = 0;

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
        if (source) audioCtx.resume();
        menu.classList.add('hidden');
        if (savedTimingData.length > 0) {
            timingData = [...savedTimingData];
        } else {
            const songSelect = 'song1';
            songData = songsData[songSelect];
            bpm = songData.bpm;
            timingData = songData.timingData.map(time => time * (bpm / songData.bpm));
            gameDuration = songData.maxDuration;
        }
        startTime = audioCtx.currentTime - savedStartTime;
    } else {
        if (source) audioCtx.suspend();
        menu.classList.remove('hidden');
        savedTimingData = [...timingData];
        savedStartTime = audioCtx.currentTime - startTime;
        timingData = [];
    }
}

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

resumeButton.addEventListener('click', () => {
    isRunning = true;
    if (source) audioCtx.resume();
    menu.classList.add('hidden');
    if (savedTimingData.length > 0) {
        timingData = [...savedTimingData];
    } else {
        const songSelect = 'song1';
        songData = songsData[songSelect];
        bpm = songData.bpm;
        timingData = songData.timingData.map(time => time * (bpm / songData.bpm));
        gameDuration = songData.maxDuration;
    }
    startTime = audioCtx.currentTime - savedStartTime;
});

restartButton.addEventListener('click', () => {
    if (source) {
        source.stop();
        source = null;
    }
    menu.classList.add('hidden');
    isRunning = false;
    readyText.classList.remove('hidden');
});

exitButton.addEventListener('click', () => {
    if (source) {
        source.stop();
        source = null;
    }
    isRunning = false;
    menu.classList.add('hidden');
    alert("ゲームを終了しました。");
});

function startGame() {
    const songSelect = 'song1';
    songData = songsData[songSelect];

    if (!songData) {
        alert("曲データが見つかりません！");
        return;
    }

    bpm = songData.bpm;

    if (source) {
        source.stop();
    }

    fetch(songData.file)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
            source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);

            startTime = audioCtx.currentTime;
            source.start(startTime);

            timingData = songData.timingData.map(time => time * (bpm / songData.bpm));
            gameDuration = songData.maxDuration;
            tapTimes = [];
            isRunning = true;

            gameScreen.style.backgroundImage = 'url("main.jpg")';
            gameScreen.style.backgroundSize = 'cover';
            gameScreen.style.backgroundPosition = 'center';
            gameScreen.style.aspectRatio = '16 / 9';
            resultElement.classList.add('hidden');

            gameLoop();
        });
}

function gameLoop() {
    if (!isRunning) return;

    elapsedTime = audioCtx.currentTime - startTime;

    if (elapsedTime >= gameDuration) {
        showResults();
        return;
    }

    requestAnimationFrame(gameLoop);
}

function handleTap() {
    if (!isRunning) return;

    const currentTime = audioCtx.currentTime - startTime;
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

    const backgroundImage = evaluationImages[evaluation];
    gameScreen.style.backgroundImage = `url(${backgroundImage})`;
}

function showResults() {
    isRunning = false;
    resultElement.textContent = 'ゲーム終了';
    resultElement.classList.remove('hidden');
}
