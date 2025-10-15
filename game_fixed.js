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

// 首頁場景
class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    preload() {
        // 載入背景圖片
        this.load.image('backgroundImg', ASSETS.images.background);
        
        // 設置載入錯誤處理
        this.load.on('loaderror', (file) => {
            console.log('載入失敗:', file.src);
        });
        
        // 載入完成後創建備用背景
        this.load.on('complete', () => {
            if (!this.textures.exists('backgroundImg')) {
                // 創建預設漸層背景
                this.add.graphics()
                    .fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98FB98, 0x98FB98)
                    .fillRect(0, 0, 375, 667)
                    .generateTexture('backgroundImg', 375, 667);
            }
        });
    }

    create() {
        // 添加背景圖片
        const bg = this.add.image(187.5, 333.5, 'backgroundImg');
        bg.setOrigin(0.5);
        
        // 確保背景圖片適合螢幕尺寸
        if (this.textures.exists('backgroundImg')) {
            const bgTexture = this.textures.get('backgroundImg');
            const bgWidth = bgTexture.source[0].width;
            const bgHeight = bgTexture.source[0].height;
            
            const scaleX = 375 / bgWidth;
            const scaleY = 667 / bgHeight;
            const bgScale = Math.max(scaleX, scaleY);
            
            bg.setScale(bgScale);
        }

        // 遊戲標題
        this.add.text(187.5, 200, '事件冒險遊戲', {
            fontSize: '32px',
            fill: '#2c3e50',
            fontWeight: 'bold',
            stroke: '#ffffff',
            strokeThickness: 3
        }).setOrigin(0.5);

        // 副標題
        this.add.text(187.5, 250, '準備好開始你的冒險了嗎？', {
            fontSize: '16px',
            fill: '#2c3e50',
            fontWeight: 'bold',
            stroke: '#ffffff',
            strokeThickness: 1
        }).setOrigin(0.5);

        // 創建開始遊戲按鈕
        const startButtonBg = this.add.rectangle(0, 0, 250, 70, 0x27ae60, 1);
        startButtonBg.setStrokeStyle(4, 0x1e8449);
        
        const startButtonText = this.add.text(0, 0, '開始遊戲', {
            fontSize: '24px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        const startButton = this.add.container(187.5, 400, [startButtonBg, startButtonText]);
        
        // 設置按鈕互動
        startButton.setSize(250, 70);
        startButton.setInteractive({ useHandCursor: true });
        
        // 按鈕效果
        startButton.on('pointerover', () => {
            startButtonBg.setFillStyle(0x1e8449);
            startButton.setScale(1.05);
        });

        startButton.on('pointerout', () => {
            startButtonBg.setFillStyle(0x27ae60);
            startButton.setScale(1);
        });

        startButton.on('pointerdown', () => {
            startButton.setScale(0.95);
            this.time.delayedCall(100, () => {
                startButton.setScale(1.05);
                // 切換到遊戲場景
                this.scene.start('GameScene');
            });
        });

        // 版權信息
        this.add.text(187.5, 580, 'Made with Phaser 3', {
            fontSize: '12px',
            fill: '#7f8c8d',
            fontStyle: 'italic'
        }).setOrigin(0.5);
    }
}

// 遊戲場景
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        // 每次進入場景時重置遊戲變數
        this.playerHealth = 100;
        this.maxHealth = 100;
        this.currentLevel = 1;
    }

    preload() {
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
            this.createFallbackGraphics();
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

    createFallbackGraphics() {
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

    create() {
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
        this.initializeAudio();
        
        // 創建玩家 - 移動到左下角紅色方框位置
        this.player = this.add.sprite(60, 300, 'playerImg');
        
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
            
            this.player.setScale(scale);
            console.log(`玩家圖片載入成功！原始尺寸: ${originalWidth}x${originalHeight}, 縮放比例: ${scale}`);
        } else {
            // 使用預設圖形
            this.player.setScale(1.2);
            console.log('使用預設玩家圖形');
        }

        // 關卡顯示 - 使用變數來動態更新
        this.levelText = this.add.text(187.5, 50, `第 ${this.currentLevel} 關`, {
            fontSize: '22px',
            fill: '#2c3e50',
            fontWeight: 'bold',
            stroke: '#ffffff',
            strokeThickness: 2
        });
        this.levelText.setOrigin(0.5);

        // 血量文字 - 往上貼著關卡顯示
        this.healthText = this.add.text(187.5, 75, `血量: ${this.playerHealth}/${this.maxHealth}`, {
            fontSize: '14px',
            fill: '#2c3e50',
            fontWeight: 'bold',
            stroke: '#ffffff',
            strokeThickness: 1
        }).setOrigin(0.5);

        // 創建血量條背景 - 往上移動
        this.healthBarBg = this.add.image(187.5, 90, 'healthBarBgImg');
        this.healthBarBg.setOrigin(0.5);

        // 創建血量條 - 往上移動
        this.healthBar = this.add.image(87.5, 90, 'healthBarImg');
        this.healthBar.setOrigin(0, 0.5);

        // 創建事件文字框 - 往上移動15像素，與按鈕保持空隙
        const textBoxBg = this.add.graphics();
        textBoxBg.fillStyle(0xffffff, 0.9);
        textBoxBg.fillRoundedRect(20, 395, 335, 180, 10);
        textBoxBg.lineStyle(3, 0x34495e);
        textBoxBg.strokeRoundedRect(20, 395, 335, 180, 10);

        this.eventText = this.add.text(35, 410, '點擊「下一關」開始你的冒險旅程。', {
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
        this.nextLevelButton = this.add.container(187.5, 620, [buttonBg, buttonText]);
        
        // 設置按鈕互動 - 簡化設定
        this.nextLevelButton.setSize(200, 60);
        this.nextLevelButton.setInteractive({ useHandCursor: true });
        
        // 添加視覺回饋
        this.nextLevelButton.on('pointerdown', () => {
            // 播放按鈕點擊音效
            this.playSound('buttonClick');
            
            // 添加按下效果
            this.nextLevelButton.setScale(0.95);
            this.time.delayedCall(100, () => {
                this.nextLevelButton.setScale(1);
            });
            this.triggerRandomEvent();
        });

        this.nextLevelButton.on('pointerover', () => {
            buttonBg.setFillStyle(0x2980b9);
            // 添加輕微放大效果
            this.nextLevelButton.setScale(1.05);
        });

        this.nextLevelButton.on('pointerout', () => {
            buttonBg.setFillStyle(0x3498db);
            // 恢復原始大小
            this.nextLevelButton.setScale(1);
        });
    }

    update() {
        // 遊戲主迴圈（目前不需要持續更新的邏輯）
    }

    // 觸發隨機事件
    triggerRandomEvent() {
        if (this.playerHealth <= 0) {
            this.eventText.setText('你的血量已經歸零。\n重新整理頁面重新開始遊戲。');
            this.nextLevelButton.setVisible(false);
            this.playSound('gameOver');
            return;
        }

        // 隨機選擇事件（使用權重）
        const randomEvent = getRandomEventByWeight();
        
        // 更新關卡
        this.currentLevel++;
        
        // 更新關卡顯示
        this.levelText.setText(`第 ${this.currentLevel-1} 關`);
        
        // 應用事件效果
        let healthChange = randomEvent.effect.health || 0;
        let maxHealthChange = randomEvent.effect.maxHealth || 0;
        let fullHeal = randomEvent.effect.fullHeal || false;
        let instantDeath = randomEvent.effect.instantDeath || false;
        
        // 處理即死事件
        if (instantDeath) {
            this.playerHealth = 0;
            this.playSound('gameOver');
            
            // 更新顯示
            this.updateHealthDisplay();
            
            // 更新關卡顯示
            this.levelText.setText(`第 ${this.currentLevel-1} 關`);
            
            // 顯示即死訊息
            this.eventText.setText(
                `${randomEvent.description}\n\n` +
                `${randomEvent.effect.message}\n\n` +
                `💀 遊戲結束！點擊重新開始回到首頁。`
            );
            
            // 將按鈕改為重新開始
            this.changeButtonToRestart();
            return;
        }
        
        // 處理最大血量變化
        if (maxHealthChange !== 0) {
            this.maxHealth += maxHealthChange;
            // 確保最大血量不低於 50
            this.maxHealth = Math.max(50, this.maxHealth);
            
            // 播放對應音效
            if (maxHealthChange > 0) {
                this.playSound('levelUp');
            } else {
                this.playSound('eventNegative');
            }
        }
        
        // 特殊處理：如果是魔法泉水或生命之樹，完全恢復
        if (randomEvent.name === "魔法泉水" || fullHeal) {
            this.playerHealth = this.maxHealth;
        } else {
            this.playerHealth += healthChange;
        }
        
        // 確保血量在合理範圍內
        this.playerHealth = Math.max(0, Math.min(this.maxHealth, this.playerHealth));
        
        // 播放事件音效（如果還沒播放的話）
        if (maxHealthChange === 0) {
            if (healthChange > 0 || fullHeal) {
                this.playSound('eventPositive');
            } else if (healthChange < 0) {
                this.playSound('eventNegative');
            }
        }
        
        // 更新顯示
        this.updateHealthDisplay();
        
        // 創建詳細的狀態訊息
        let statusMessage = "";
        if (maxHealthChange > 0) {
            statusMessage += `✨ 你變得更強壯了！最大血量提升至 ${this.maxHealth} 點！\n`;
        } else if (maxHealthChange < 0) {
            statusMessage += `💀 你感到虛弱...最大血量降低至 ${this.maxHealth} 點。\n`;
        }
        
        if (this.playerHealth <= 0) {
            statusMessage += "\n💀 你已經死亡！點擊重新開始回到首頁。";
        } else if (this.playerHealth === this.maxHealth) {
            statusMessage += "\n💚 你的狀態非常好！";
        } else if (this.playerHealth < this.maxHealth * 0.3) {
            statusMessage += "\n⚠️ 危險！你的血量很低！";
        }
        
        // 簡化事件文字顯示
        this.eventText.setText(
            `${randomEvent.description}\n\n` +
            `${randomEvent.effect.message}` +
            (statusMessage ? `\n${statusMessage}` : "")
        );

        // 如果玩家死亡，將按鈕改為重新開始
        if (this.playerHealth <= 0) {
            this.changeButtonToRestart();
        }
    }

    // 更新血量顯示
    updateHealthDisplay() {
        const healthPercentage = this.playerHealth / this.maxHealth;
        
        // 根據最大血量調整血量條寬度
        const baseWidth = 200;
        const maxWidth = 240;
        const healthBarWidth = Math.min(maxWidth, baseWidth * (this.maxHealth / 100));
        
        // 更新血量條背景寬度
        this.healthBarBg.setScale(healthBarWidth / 200, 1);
        
        // 更新血量條寬度和填充
        this.healthBar.setScale((healthBarWidth / 200) * healthPercentage, 1);
        
        // 重新定位血量條（保持居中）- 使用新的Y座標
        const centerX = 187.5;
        this.healthBarBg.x = centerX;
        this.healthBar.x = centerX - (healthBarWidth / 2);
        
        this.healthText.setText(`血量: ${this.playerHealth}/${this.maxHealth}`);
        
        // 根據血量改變顏色
        if (healthPercentage > 0.6) {
            this.healthBar.setTint(0x27ae60); // 綠色
        } else if (healthPercentage > 0.3) {
            this.healthBar.setTint(0xf39c12); // 橙色
        } else {
            this.healthBar.setTint(0xe74c3c); // 紅色
        }
        
        // 如果最大血量很高，改變血量條顏色以示強化
        if (this.maxHealth > 150) {
            this.healthBarBg.setTint(0xf1c40f); // 金色背景表示強化
        } else if (this.maxHealth > 120) {
            this.healthBarBg.setTint(0x9b59b6); // 紫色背景表示提升
        } else {
            this.healthBarBg.setTint(0xffffff); // 白色背景（預設）
        }
    }

    // 初始化音頻
    initializeAudio() {
        // 初始化背景音樂
        if (this.cache.audio.exists('bgMusic')) {
            this.backgroundMusic = this.sound.add('bgMusic', { 
                loop: true, 
                volume: 0.3 
            });
            // 嘗試播放背景音樂（某些瀏覽器需要用戶互動後才能播放）
            this.input.once('pointerdown', () => {
                if (this.backgroundMusic && !this.backgroundMusic.isPlaying) {
                    this.backgroundMusic.play();
                }
            });
        }
        
        // 初始化音效
        this.soundEffects = {};
        if (this.cache.audio.exists('btnClick')) {
            this.soundEffects.buttonClick = this.sound.add('btnClick', { volume: 0.5 });
        }
        if (this.cache.audio.exists('eventPos')) {
            this.soundEffects.eventPositive = this.sound.add('eventPos', { volume: 0.4 });
        }
        if (this.cache.audio.exists('eventNeg')) {
            this.soundEffects.eventNegative = this.sound.add('eventNeg', { volume: 0.4 });
        }
        if (this.cache.audio.exists('lvlUp')) {
            this.soundEffects.levelUp = this.sound.add('lvlUp', { volume: 0.5 });
        }
        if (this.cache.audio.exists('gmOver')) {
            this.soundEffects.gameOver = this.sound.add('gmOver', { volume: 0.6 });
        }
    }

    // 播放音效
    playSound(soundName) {
        if (this.soundEffects[soundName]) {
            this.soundEffects[soundName].play();
        }
    }

    // 將按鈕改為重新開始
    changeButtonToRestart() {
        // 移除原有的事件監聽器
        this.nextLevelButton.removeAllListeners();
        
        // 獲取按鈕的背景和文字
        const buttonBg = this.nextLevelButton.list[0];
        const buttonText = this.nextLevelButton.list[1];
        
        // 更改按鈕樣式為紅色
        buttonBg.setFillStyle(0xe74c3c);
        buttonBg.setStrokeStyle(3, 0xc0392b);
        
        // 更改按鈕文字
        buttonText.setText('重新開始');
        
        // 重新設置互動
        this.nextLevelButton.setInteractive({ useHandCursor: true });
        
        // 添加新的事件監聽器
        this.nextLevelButton.on('pointerdown', () => {
            // 播放按鈕點擊音效
            this.playSound('buttonClick');
            
            // 添加按下效果
            this.nextLevelButton.setScale(0.95);
            this.time.delayedCall(100, () => {
                this.nextLevelButton.setScale(1);
                // 重置遊戲狀態並回到首頁
                this.restartGame();
            });
        });

        this.nextLevelButton.on('pointerover', () => {
            buttonBg.setFillStyle(0xc0392b);
            this.nextLevelButton.setScale(1.05);
        });

        this.nextLevelButton.on('pointerout', () => {
            buttonBg.setFillStyle(0xe74c3c);
            this.nextLevelButton.setScale(1);
        });
    }

    // 重新開始遊戲
    restartGame() {
        // 停止背景音樂
        if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
            this.backgroundMusic.stop();
        }
        
        // 回到首頁場景
        this.scene.start('StartScene');
    }
}

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
    scene: [StartScene, GameScene]
};

// 啟動遊戲
const game = new Phaser.Game(config);