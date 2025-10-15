// 遊戲配置
const config = {
    type: Phaser.AUTO,
    width: 375,
    height: 667,
    parent: 'game-container',
    backgroundColor: '#87CEEB',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 375,
        height: 667
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// 遊戲變數
let player;
let playerHealth = 100;
let maxHealth = 100;
let healthBar;
let healthBarBg;
let healthText;
let levelText;
let eventTextBox;
let eventText;
let nextLevelButton;
let currentLevel = 1;
let backgroundMusic;
let soundEffects = {};

// 資源路徑
const ASSETS = {
    images: {
        player: 'assets/images/player.png',
        background: 'assets/images/background.jpg',
        button: 'assets/images/button.png',
        healthBarBg: 'assets/images/health_bar_bg.png',
        healthBar: 'assets/images/health_bar.png',
        textBox: 'assets/images/text_box.png'
    },
    audio: {
        backgroundMusic: 'assets/music/background_music.mp3',
        buttonClick: 'assets/music/button_click.mp3',
        eventPositive: 'assets/music/event_positive.mp3',
        eventNegative: 'assets/music/event_negative.mp3',
        levelUp: 'assets/music/level_up.mp3',
        gameOver: 'assets/music/game_over.mp3'
    }
};

function preload() {
    // 載入外部圖片資源 (如果存在)
    this.load.image('playerImg', ASSETS.images.player);
    this.load.image('backgroundImg', ASSETS.images.background);
    this.load.image('buttonImg', ASSETS.images.button);
    this.load.image('healthBarBgImg', ASSETS.images.healthBarBg);
    this.load.image('healthBarImg', ASSETS.images.healthBar);
    this.load.image('textBoxImg', ASSETS.images.textBox);
    
    // 載入音頻資源 (如果存在)
    this.load.audio('bgMusic', ASSETS.audio.backgroundMusic);
    this.load.audio('btnClick', ASSETS.audio.buttonClick);
    this.load.audio('eventPos', ASSETS.audio.eventPositive);
    this.load.audio('eventNeg', ASSETS.audio.eventNegative);
    this.load.audio('lvlUp', ASSETS.audio.levelUp);
    this.load.audio('gmOver', ASSETS.audio.gameOver);
    
    // 設置載入錯誤處理
    this.load.on('loaderror', (file) => {
        console.log('載入失敗:', file.src);
    });
    
    // 載入完成後創建備用圖形
    this.load.on('complete', () => {
        console.log('資源載入完成');
        createFallbackGraphics.call(this);
    });
    
    // 載入進度
    this.load.on('progress', (progress) => {
        console.log('載入進度:', Math.round(progress * 100) + '%');
    });
    
    // 檔案載入成功
    this.load.on('filecomplete', (key, type, data) => {
        console.log('檔案載入成功:', key, type);
    });
}

// 創建備用圖形（當外部圖片載入失敗時使用）
function createFallbackGraphics() {
    // 檢查玩家圖片是否載入成功，否則創建預設圖形
    if (!this.textures.exists('playerImg')) {
        this.add.graphics()
            .fillStyle(0x4a90e2)
            .fillCircle(40, 40, 35)
            .generateTexture('playerImg', 80, 80);
    }
    
    // 檢查背景圖片
    if (!this.textures.exists('backgroundImg')) {
        this.add.graphics()
            .fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98FB98, 0x98FB98)
            .fillRect(0, 0, 375, 667)
            .generateTexture('backgroundImg', 375, 667);
    }
    
    // 檢查血量條背景
    if (!this.textures.exists('healthBarBgImg')) {
        this.add.graphics()
            .fillStyle(0xe74c3c)
            .fillRect(0, 0, 200, 15)
            .generateTexture('healthBarBgImg', 200, 15);
    }
    
    // 檢查血量條
    if (!this.textures.exists('healthBarImg')) {
        this.add.graphics()
            .fillStyle(0x27ae60)
            .fillRect(0, 0, 200, 15)
            .generateTexture('healthBarImg', 200, 15);
    }
    
    // 創建可變寬度的血量條材質（用於最大血量變化）
    this.add.graphics()
        .fillStyle(0xe74c3c)
        .fillRect(0, 0, 240, 15)
        .generateTexture('healthBarBgLarge', 240, 15);
    
    this.add.graphics()
        .fillStyle(0x27ae60)
        .fillRect(0, 0, 240, 15)
        .generateTexture('healthBarLarge', 240, 15);
}

function create() {
    // 添加背景圖片
    if (this.textures.exists('backgroundImg')) {
        const bg = this.add.image(187.5, 333.5, 'backgroundImg');
        bg.setOrigin(0.5);
        
        // 確保背景圖片適合螢幕尺寸
        const bgTexture = this.textures.get('backgroundImg');
        const bgWidth = bgTexture.source[0].width;
        const bgHeight = bgTexture.source[0].height;
        
        const scaleX = 375 / bgWidth;
        const scaleY = 667 / bgHeight;
        const bgScale = Math.max(scaleX, scaleY); // 填滿螢幕
        
        bg.setScale(bgScale);
        console.log(`背景圖片載入成功！原始尺寸: ${bgWidth}x${bgHeight}, 縮放比例: ${bgScale}`);
    } else {
        console.log('沒有背景圖片，使用預設背景色');
    }
    
    // 初始化音頻
    initializeAudio.call(this);
    
    // 創建玩家
    player = this.add.sprite(90, 210, 'playerImg');
    
    // 根據圖片載入情況調整縮放
    if (this.textures.exists('playerImg')) {
        // 如果有自訂玩家圖片，設定適當的大小
        const playerTexture = this.textures.get('playerImg');
        const originalWidth = playerTexture.source[0].width;
        const originalHeight = playerTexture.source[0].height;
        
        // 計算適當的縮放比例（目標大小約 80x80）
        const targetSize = 80;
        const scaleX = targetSize / originalWidth;
        const scaleY = targetSize / originalHeight;
        const scale = Math.min(scaleX, scaleY); // 保持比例
        
        player.setScale(scale);
        console.log(`玩家圖片載入成功！原始尺寸: ${originalWidth}x${originalHeight}, 縮放比例: ${scale}`);
    } else {
        // 使用預設圖形
        player.setScale(1.2);
        console.log('使用預設玩家圖形');
    }

    // 關卡顯示 - 使用變數來動態更新
    levelText = this.add.text(187.5, 50, `第 ${currentLevel} 關`, {
        fontSize: '22px',
        fill: '#2c3e50',
        fontWeight: 'bold',
        stroke: '#ffffff',
        strokeThickness: 2
    });
    levelText.setOrigin(0.5);

    // 血量文字
    healthText = this.add.text(187.5, 75, `血量: ${playerHealth}/${maxHealth}`, {
        fontSize: '14px',
        fill: '#2c3e50',
        fontWeight: 'bold',
        stroke: '#ffffff',
        strokeThickness: 1
    }).setOrigin(0.5);

    // 創建血量條背景
    healthBarBg = this.add.image(187.5, 90, 'healthBarBgImg');
    healthBarBg.setOrigin(0.5);

    // 創建血量條
    healthBar = this.add.image(87.5, 90, 'healthBarImg');
    healthBar.setOrigin(0, 0.5);

    // 創建事件文字框
    const textBoxBg = this.add.graphics();
    textBoxBg.fillStyle(0xffffff, 0.9);
    textBoxBg.fillRoundedRect(20, 300, 335, 160, 10);
    textBoxBg.lineStyle(3, 0x34495e);
    textBoxBg.strokeRoundedRect(20, 300, 335, 160, 10);

    eventText = this.add.text(35, 320, '點擊「下一關」開始你的冒險旅程。', {
        fontSize: '14px',
        fill: '#2c3e50',
        wordWrap: { width: 305 },
        lineSpacing: 3
    });

    // 創建下一關按鈕 - 使用 rectangle 避免偏移問題
    const buttonBg = this.add.rectangle(0, 0, 200, 60, 0x3498db, 1);
    buttonBg.setStrokeStyle(3, 0x2980b9);
    
    const buttonText = this.add.text(0, 0, '下一關', {
        fontSize: '20px',
        fill: '#ffffff',
        fontWeight: 'bold'
    }).setOrigin(0.5);

    // 創建按鈕容器，移到畫面最下方中央
    nextLevelButton = this.add.container(187.5, 600, [buttonBg, buttonText]);
    
    // 設置按鈕互動 - 簡化設定
    nextLevelButton.setSize(200, 60);
    nextLevelButton.setInteractive({ useHandCursor: true });
    
    // 添加視覺回饋
    nextLevelButton.on('pointerdown', () => {
        // 播放按鈕點擊音效
        playSound('buttonClick');
        
        // 添加按下效果
        nextLevelButton.setScale(0.95);
        this.time.delayedCall(100, () => {
            nextLevelButton.setScale(1);
        });
        triggerRandomEvent();
    });

    nextLevelButton.on('pointerover', () => {
        buttonBg.setFillStyle(0x2980b9);
        // 添加輕微放大效果
        nextLevelButton.setScale(1.05);
    });

    nextLevelButton.on('pointerout', () => {
        buttonBg.setFillStyle(0x3498db);
        // 恢復原始大小
        nextLevelButton.setScale(1);
    });
}

function update() {
    // 遊戲主迴圈（目前不需要持續更新的邏輯）
}

// 觸發隨機事件
function triggerRandomEvent() {
    if (playerHealth <= 0) {
        eventText.setText('你的血量已經歸零。\n重新整理頁面重新開始遊戲。');
        nextLevelButton.setVisible(false);
        playSound('gameOver');
        return;
    }

    // 隨機選擇事件（使用權重）
    const randomEvent = getRandomEventByWeight();
    
    // 更新關卡
    currentLevel++;
    
    // 更新關卡顯示
    levelText.setText(`第 ${currentLevel-1} 關`);
    
    // 應用事件效果
    let healthChange = randomEvent.effect.health || 0;
    let maxHealthChange = randomEvent.effect.maxHealth || 0;
    let fullHeal = randomEvent.effect.fullHeal || false;
    let instantDeath = randomEvent.effect.instantDeath || false;
    
    // 處理即死事件
    if (instantDeath) {
        playerHealth = 0;
        playSound('gameOver');
        
        // 更新顯示
        updateHealthDisplay();
        
        // 更新關卡顯示
        levelText.setText(`第 ${currentLevel-1} 關`);
        
        // 顯示即死訊息
        eventText.setText(
            `${randomEvent.description}\n\n` +
            `${randomEvent.effect.message}\n\n` +
            `💀 遊戲結束！重新整理頁面重新開始遊戲。`
        );
        
        // 隱藏按鈕
        nextLevelButton.setVisible(false);
        return;
    }
    
    // 處理最大血量變化
    if (maxHealthChange !== 0) {
        maxHealth += maxHealthChange;
        // 確保最大血量不低於 50
        maxHealth = Math.max(50, maxHealth);
        
        // 播放對應音效
        if (maxHealthChange > 0) {
            playSound('levelUp');
        } else {
            playSound('eventNegative');
        }
    }
    
    // 特殊處理：如果是魔法泉水或生命之樹，完全恢復
    if (randomEvent.name === "魔法泉水" || fullHeal) {
        playerHealth = maxHealth;
    } else {
        playerHealth += healthChange;
    }
    
    // 確保血量在合理範圍內
    playerHealth = Math.max(0, Math.min(maxHealth, playerHealth));
    
    // 播放事件音效（如果還沒播放的話）
    if (maxHealthChange === 0) {
        if (healthChange > 0 || fullHeal) {
            playSound('eventPositive');
        } else if (healthChange < 0) {
            playSound('eventNegative');
        }
    }
    
    // 更新顯示
    updateHealthDisplay();
    
    // 創建詳細的狀態訊息
    let statusMessage = "";
    if (maxHealthChange > 0) {
        statusMessage += `✨ 你變得更強壯了！最大血量提升至 ${maxHealth} 點！\n`;
    } else if (maxHealthChange < 0) {
        statusMessage += `💀 你感到虛弱...最大血量降低至 ${maxHealth} 點。\n`;
    }
    
    if (playerHealth <= 0) {
        statusMessage += "\n💀 你已經死亡！遊戲結束。";
    } else if (playerHealth === maxHealth) {
        statusMessage += "\n💚 你的狀態非常好！";
    } else if (playerHealth < maxHealth * 0.3) {
        statusMessage += "\n⚠️ 危險！你的血量很低！";
    }
    
    // 簡化事件文字顯示
    eventText.setText(
        `${randomEvent.description}\n\n` +
        `${randomEvent.effect.message}` +
        (statusMessage ? `\n${statusMessage}` : "")
    );

    // 如果玩家死亡，隱藏按鈕
    if (playerHealth <= 0) {
        nextLevelButton.setVisible(false);
    }
}

// 更新血量顯示
function updateHealthDisplay() {
    const healthPercentage = playerHealth / maxHealth;
    
    // 根據最大血量調整血量條寬度
    const baseWidth = 200;
    const maxWidth = 240;
    const healthBarWidth = Math.min(maxWidth, baseWidth * (maxHealth / 100));
    
    // 更新血量條背景寬度
    healthBarBg.setScale(healthBarWidth / 200, 1);
    
    // 更新血量條寬度和填充
    healthBar.setScale((healthBarWidth / 200) * healthPercentage, 1);
    
    // 重新定位血量條（保持居中）
    const centerX = 187.5;
    healthBarBg.x = centerX;
    healthBar.x = centerX - (healthBarWidth / 2);
    
    healthText.setText(`血量: ${playerHealth}/${maxHealth}`);
    
    // 根據血量改變顏色
    if (healthPercentage > 0.6) {
        healthBar.setTint(0x27ae60); // 綠色
    } else if (healthPercentage > 0.3) {
        healthBar.setTint(0xf39c12); // 橙色
    } else {
        healthBar.setTint(0xe74c3c); // 紅色
    }
    
    // 如果最大血量很高，改變血量條顏色以示強化
    if (maxHealth > 150) {
        healthBarBg.setTint(0xf1c40f); // 金色背景表示強化
    } else if (maxHealth > 120) {
        healthBarBg.setTint(0x9b59b6); // 紫色背景表示提升
    } else {
        healthBarBg.setTint(0xffffff); // 白色背景（預設）
    }
}

// 初始化音頻
function initializeAudio() {
    // 初始化背景音樂
    if (this.cache.audio.exists('bgMusic')) {
        backgroundMusic = this.sound.add('bgMusic', { 
            loop: true, 
            volume: 0.3 
        });
        // 嘗試播放背景音樂（某些瀏覽器需要用戶互動後才能播放）
        this.input.once('pointerdown', () => {
            if (backgroundMusic && !backgroundMusic.isPlaying) {
                backgroundMusic.play();
            }
        });
    }
    
    // 初始化音效
    if (this.cache.audio.exists('btnClick')) {
        soundEffects.buttonClick = this.sound.add('btnClick', { volume: 0.5 });
    }
    if (this.cache.audio.exists('eventPos')) {
        soundEffects.eventPositive = this.sound.add('eventPos', { volume: 0.4 });
    }
    if (this.cache.audio.exists('eventNeg')) {
        soundEffects.eventNegative = this.sound.add('eventNeg', { volume: 0.4 });
    }
    if (this.cache.audio.exists('lvlUp')) {
        soundEffects.levelUp = this.sound.add('lvlUp', { volume: 0.5 });
    }
    if (this.cache.audio.exists('gmOver')) {
        soundEffects.gameOver = this.sound.add('gmOver', { volume: 0.6 });
    }
}

// 播放音效
function playSound(soundName) {
    if (soundEffects[soundName]) {
        soundEffects[soundName].play();
    }
}

// 啟動遊戲
const game = new Phaser.Game(config);