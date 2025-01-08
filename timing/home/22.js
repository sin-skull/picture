// 動的にボタンを生成するためのデータ
const songs = [
    {
        icon: "song1-icon.jpg", 
        title: "ドレミでドドド？", 
        description: "お祭りで太鼓を頼まれてしまった…！？　声が聞こえたらボタンで回避しよう！　【練習アリ】",
        playurl: "file:///d%3A/html/timing/kansei.html" // 初期のURL
    },
    {
        icon: "song2-icon.jpg", 
        title: "タイトル2", 
        description: "これは説明文2です。",
        playurl: "folder/song2.html" // song2のページURL
    },
    {
        icon: "song3-icon.jpg", 
        title: "タイトル3", 
        description: "これは説明文3です。",
        playurl: "folder/song3.html" // song3のページURL
    }
];

// ボタンを動的に生成
const buttonContainer = document.getElementById("buttonContainer");

songs.forEach((song, index) => {
    const button = document.createElement("button");
    button.classList.add("showInfoButton");
    
    const img = document.createElement("img");
    img.src = song.icon;
    img.alt = `Song ${index + 1} Icon`;
    
    button.appendChild(img);
    buttonContainer.appendChild(button);
    
    // ボタンがクリックされたときにポップアップを表示
    button.addEventListener("click", function() {
        showPopup(song.title, song.description, song.playurl);
    });
});

// ポップアップを表示する関数
function showPopup(title, description, playurl) {
    const popup = document.getElementById("popup");
    const popupContent = popup.querySelector(".popup-content");
    
    // タイトルと説明文をポップアップに挿入
    popupContent.querySelector("h2").textContent = title;
    popupContent.querySelector("p").textContent = description;
    
    // プレイボタンにURLを設定
    const playButton = popupContent.querySelector("#playButton");
    playButton.setAttribute("data-url", playurl);

    popup.style.display = "flex"; // ポップアップを表示
}

// プレイボタンがクリックされたときにURLに遷移
document.getElementById("playButton").addEventListener("click", function() {
    const url = this.getAttribute("data-url");
    window.location.href = url; // URLに遷移
});

// キャンセルボタンでポップアップを閉じる
document.getElementById("cancelButton").addEventListener("click", function() {
    document.getElementById("popup").style.display = "none"; // ポップアップを非表示
});

// ポップアップの外側をクリックした場合、ポップアップを閉じる
document.getElementById("popup").addEventListener("click", function(event) {
    if (event.target === this) { // ポップアップの背景部分がクリックされた場合
        this.style.display = "none"; // ポップアップを非表示にする
    }
});
document.addEventListener('contextmenu', function(event) {
    event.preventDefault(); // 右クリックメニューを無効にする
});
document.addEventListener('dragstart', function(event) {
    event.preventDefault(); // ドラッグ操作を無効化
});
  // 画面全体にランダムに星を生成する関数
  for (let i = 0; i < 200; i++) {
    let star = document.createElement('div');
    star.classList.add('star');
    document.body.appendChild(star);

    // ランダムな星のサイズ
    let size = Math.random() * 3 + 1; // 星の大きさ（1px〜4px）
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;

    // ランダムな位置に星を配置
    let xPos = Math.random() * window.innerWidth;
    let yPos = Math.random() * window.innerHeight;
    star.style.left = `${xPos}px`;
    star.style.top = `${yPos}px`;

    // ランダムなアニメーション速度（焼けるようなランダムな変化）
    let duration = Math.random() * 10 + 5; // 5s〜15sで焼けるようにする
    star.style.animationDuration = `${duration}s`;

    // ランダムに動かす時間を設定
    let moveDuration = Math.random() * 15 + 10; // 10s〜25sの間で動かす
    star.style.animationDuration = `${moveDuration}s`;
}