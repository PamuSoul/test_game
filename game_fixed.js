// 持久化資料庫系統
const GameDatabase = {
    // 儲存金錢到 localStorage
    saveMoney(amount) {
        localStorage.setItem('gamePlayerMoney', amount.toString());
    },
    
    // 從 localStorage 讀取金錢
    loadMoney() {
        const saved = localStorage.getItem('gamePlayerMoney');
        return saved ? parseInt(saved) : 0; // 預設為 0 金錢
    },
    
    // 增加金錢
    addMoney(amount) {
        const currentMoney = this.loadMoney();
        const newAmount = currentMoney + amount;
        this.saveMoney(newAmount);
        return newAmount;
    },
    
    // 花費金錢
    spendMoney(amount) {
        const currentMoney = this.loadMoney();
        if (currentMoney >= amount) {
            const newAmount = currentMoney - amount;
            this.saveMoney(newAmount);
            return newAmount;
        }
        return currentMoney; // 金錢不足時不變
    },
    
    // 重置金錢（調試用）
    resetMoney() {
        this.saveMoney(0);
    },
    
    // === 攻擊力系統 ===
    saveAttack(amount) {
        localStorage.setItem('playerAttack', amount.toString());
    },
    
    loadAttack() {
        const saved = localStorage.getItem('playerAttack');
        return saved ? parseInt(saved) : 10; // 預設攻擊力 10
    },
    
    upgradeAttack(amount) {
        const currentAttack = this.loadAttack();
        const newAttack = currentAttack + amount;
        this.saveAttack(newAttack);
        return newAttack;
    },
    
    // === 防禦力系統 ===
    saveDefense(amount) {
        localStorage.setItem('playerDefense', amount.toString());
    },
    
    loadDefense() {
        const saved = localStorage.getItem('playerDefense');
        return saved ? parseInt(saved) : 5; // 預設防禦力 5
    },
    
    upgradeDefense(amount) {
        const currentDefense = this.loadDefense();
        const newDefense = currentDefense + amount;
        this.saveDefense(newDefense);
        return newDefense;
    }
};

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

        // 金錢顯示 - 首頁右上角
        const currentMoney = GameDatabase.loadMoney();
        
        // 創建金錢方框背景 - 完全貼著邊框
        const moneyBg = this.add.graphics();
        moneyBg.fillStyle(0x000000, 0.8); // 黑色背景，80%透明度
        moneyBg.fillRoundedRect(290, 0, 85, 30, 5); // 緊貼右上角
        moneyBg.lineStyle(2, 0xf39c12); // 金色邊框
        moneyBg.strokeRoundedRect(290, 0, 85, 30, 5);
        
        this.add.text(332.5, 15, `💰 ${currentMoney}`, {
            fontSize: '14px',
            fill: '#f39c12',
            fontWeight: 'bold'
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

        // 強化按鈕 (左邊) - 調整位置避免重疊
        const upgradeButtonBg = this.add.rectangle(0, 0, 130, 50, 0xe74c3c, 1);
        upgradeButtonBg.setStrokeStyle(3, 0xc0392b);
        
        const upgradeButtonText = this.add.text(0, 0, '強化', {
            fontSize: '18px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        const upgradeButton = this.add.container(105, 520, [upgradeButtonBg, upgradeButtonText]);
        
        // 設置強化按鈕互動
        upgradeButton.setSize(130, 50);
        upgradeButton.setInteractive({ useHandCursor: true });
        
        upgradeButton.on('pointerover', () => {
            upgradeButtonBg.setFillStyle(0xc0392b);
            upgradeButton.setScale(1.05);
        });

        upgradeButton.on('pointerout', () => {
            upgradeButtonBg.setFillStyle(0xe74c3c);
            upgradeButton.setScale(1);
        });

        upgradeButton.on('pointerdown', () => {
            upgradeButton.setScale(0.95);
            this.time.delayedCall(100, () => {
                upgradeButton.setScale(1.05);
                // 切換到強化場景
                this.scene.start('UpgradeScene');
            });
        });

        // 裝備按鈕 (右邊) - 調整位置避免重疊
        const equipButtonBg = this.add.rectangle(0, 0, 130, 50, 0x8e44ad, 1);
        equipButtonBg.setStrokeStyle(3, 0x6c3483);
        
        const equipButtonText = this.add.text(0, 0, '裝備', {
            fontSize: '18px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        const equipButton = this.add.container(270, 520, [equipButtonBg, equipButtonText]);
        
        // 設置裝備按鈕互動
        equipButton.setSize(130, 50);
        equipButton.setInteractive({ useHandCursor: true });
        
        equipButton.on('pointerover', () => {
            equipButtonBg.setFillStyle(0x6c3483);
            equipButton.setScale(1.05);
        });

        equipButton.on('pointerout', () => {
            equipButtonBg.setFillStyle(0x8e44ad);
            equipButton.setScale(1);
        });

        equipButton.on('pointerdown', () => {
            equipButton.setScale(0.95);
            this.time.delayedCall(100, () => {
                equipButton.setScale(1.05);
                // 裝備功能暫未實裝
                console.log('裝備功能暫未實裝');
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

// 強化場景
class UpgradeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UpgradeScene' });
    }

    create() {
        // 添加背景圖片
        if (this.textures.exists('backgroundImg')) {
            const bg = this.add.image(187.5, 333.5, 'backgroundImg');
            bg.setOrigin(0.5);
            
            const bgTexture = this.textures.get('backgroundImg');
            const bgWidth = bgTexture.source[0].width;
            const bgHeight = bgTexture.source[0].height;
            
            const scaleX = 375 / bgWidth;
            const scaleY = 667 / bgHeight;
            const bgScale = Math.max(scaleX, scaleY);
            
            bg.setScale(bgScale);
        }

        // 金錢顯示 - 右上角，與遊戲場景一致的位置
        this.currentMoney = GameDatabase.loadMoney();
        
        const moneyBg = this.add.graphics();
        moneyBg.fillStyle(0x000000, 0.8);
        moneyBg.fillRoundedRect(320, 0, 55, 25, 5);
        moneyBg.lineStyle(2, 0xf39c12);
        moneyBg.strokeRoundedRect(320, 0, 55, 25, 5);
        
        this.moneyText = this.add.text(347.5, 12.5, `💰 ${this.currentMoney}`, {
            fontSize: '11px',
            fill: '#f39c12',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // 標題
        this.add.text(187.5, 80, '強化中心', {
            fontSize: '32px',
            fill: '#2c3e50',
            fontWeight: 'bold',
            stroke: '#ffffff',
            strokeThickness: 3
        }).setOrigin(0.5);

        // 強化選項背景
        const upgradeBg = this.add.graphics();
        upgradeBg.fillStyle(0xffffff, 0.9);
        upgradeBg.fillRoundedRect(30, 150, 315, 400, 15);
        upgradeBg.lineStyle(4, 0x34495e);
        upgradeBg.strokeRoundedRect(30, 150, 315, 400, 15);

        // 創建三個強化選項
        this.createHealthUpgrade();
        this.createAttackUpgrade();
        this.createDefenseUpgrade();

        // 返回按鈕
        this.createBackButton();
    }

    // 生命值強化選項
    createHealthUpgrade() {
        const cost = this.getHealthUpgradeCost();
        const yPos = 180;
        
        this.add.text(50, yPos, '💪 生命值強化', {
            fontSize: '18px',
            fill: '#e74c3c',
            fontWeight: 'bold'
        });

        this.add.text(50, yPos + 25, `提升最大生命值 +10`, {
            fontSize: '13px',
            fill: '#2c3e50'
        });

        this.add.text(50, yPos + 45, `費用: ${cost} 金錢`, {
            fontSize: '13px',
            fill: '#f39c12',
            fontWeight: 'bold'
        });

        this.createUpgradeButton(280, yPos + 30, cost, () => this.purchaseHealthUpgrade());
    }

    // 攻擊力強化選項
    createAttackUpgrade() {
        const cost = this.getAttackUpgradeCost();
        const yPos = 260;
        
        this.add.text(50, yPos, '⚔️ 攻擊力強化', {
            fontSize: '18px',
            fill: '#e74c3c',
            fontWeight: 'bold'
        });

        this.add.text(50, yPos + 25, `提升攻擊力 +3`, {
            fontSize: '13px',
            fill: '#2c3e50'
        });

        this.add.text(50, yPos + 45, `費用: ${cost} 金錢`, {
            fontSize: '13px',
            fill: '#f39c12',
            fontWeight: 'bold'
        });

        this.createUpgradeButton(280, yPos + 30, cost, () => this.purchaseAttackUpgrade());
    }

    // 防禦力強化選項
    createDefenseUpgrade() {
        const cost = this.getDefenseUpgradeCost();
        const yPos = 340;
        
        this.add.text(50, yPos, '🛡️ 防禦力強化', {
            fontSize: '18px',
            fill: '#3498db',
            fontWeight: 'bold'
        });

        this.add.text(50, yPos + 25, `提升防禦力 +2`, {
            fontSize: '13px',
            fill: '#2c3e50'
        });

        this.add.text(50, yPos + 45, `費用: ${cost} 金錢`, {
            fontSize: '13px',
            fill: '#f39c12',
            fontWeight: 'bold'
        });

        this.createUpgradeButton(280, yPos + 30, cost, () => this.purchaseDefenseUpgrade());
    }

    // 創建升級按鈕
    createUpgradeButton(x, y, cost, callback) {
        const buyButtonBg = this.add.rectangle(0, 0, 80, 35, 0x27ae60, 1);
        buyButtonBg.setStrokeStyle(2, 0x1e8449);
        
        const buyButtonText = this.add.text(0, 0, '購買', {
            fontSize: '14px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        const buyButton = this.add.container(x, y, [buyButtonBg, buyButtonText]);
        buyButton.setSize(80, 35);
        buyButton.setInteractive({ useHandCursor: true });

        // 檢查是否有足夠金錢
        if (this.currentMoney < cost) {
            buyButtonBg.setFillStyle(0x7f8c8d);
            buyButtonText.setText('金錢不足');
            buyButton.removeInteractive();
        } else {
            buyButton.on('pointerover', () => {
                buyButtonBg.setFillStyle(0x1e8449);
                buyButton.setScale(1.05);
            });

            buyButton.on('pointerout', () => {
                buyButtonBg.setFillStyle(0x27ae60);
                buyButton.setScale(1);
            });

            buyButton.on('pointerdown', () => {
                buyButton.setScale(0.95);
                this.time.delayedCall(100, () => {
                    buyButton.setScale(1);
                    callback();
                });
            });
        }

        return buyButton;
    }

    // 創建返回按鈕
    createBackButton() {
        const backButtonBg = this.add.rectangle(0, 0, 100, 40, 0x95a5a6, 1);
        backButtonBg.setStrokeStyle(2, 0x7f8c8d);
        
        const backButtonText = this.add.text(0, 0, '返回', {
            fontSize: '16px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        const backButton = this.add.container(187.5, 580, [backButtonBg, backButtonText]);
        backButton.setSize(100, 40);
        backButton.setInteractive({ useHandCursor: true });
        
        backButton.on('pointerover', () => {
            backButtonBg.setFillStyle(0x7f8c8d);
            backButton.setScale(1.05);
        });

        backButton.on('pointerout', () => {
            backButtonBg.setFillStyle(0x95a5a6);
            backButton.setScale(1);
        });

        backButton.on('pointerdown', () => {
            backButton.setScale(0.95);
            this.time.delayedCall(100, () => {
                backButton.setScale(1);
                this.scene.start('StartScene');
            });
        });
    }

    getHealthUpgradeCost() {
        // 每次強化費用遞增 (基礎費用50，每次+25)
        const upgradeCount = localStorage.getItem('healthUpgrades') || 0;
        return 50 + (parseInt(upgradeCount) * 25);
    }

    purchaseHealthUpgrade() {
        const cost = this.getHealthUpgradeCost();
        const newMoney = GameDatabase.spendMoney(cost);
        
        if (newMoney !== this.currentMoney) {
            // 購買成功
            const currentUpgrades = parseInt(localStorage.getItem('healthUpgrades') || 0);
            localStorage.setItem('healthUpgrades', (currentUpgrades + 1).toString());
            
            // 提升基礎最大生命值
            const currentBaseHealth = parseInt(localStorage.getItem('baseMaxHealth') || 100);
            localStorage.setItem('baseMaxHealth', (currentBaseHealth + 10).toString());
            
            // 顯示購買成功訊息
            const successText = this.add.text(187.5, 450, '✅ 購買成功！\n最大生命值 +10', {
                fontSize: '16px',
                fill: '#27ae60',
                fontWeight: 'bold',
                align: 'center',
                stroke: '#ffffff',
                strokeThickness: 2
            }).setOrigin(0.5);
            
            // 2秒後移除訊息並重新載入場景
            this.time.delayedCall(2000, () => {
                this.scene.restart();
            });
        }
    }

    getAttackUpgradeCost() {
        // 攻擊力強化費用 (基礎費用30，每次+20)
        const upgradeCount = localStorage.getItem('attackUpgrades') || 0;
        return 30 + (parseInt(upgradeCount) * 20);
    }

    purchaseAttackUpgrade() {
        const cost = this.getAttackUpgradeCost();
        const newMoney = GameDatabase.spendMoney(cost);
        
        if (newMoney !== this.currentMoney) {
            // 購買成功
            const currentUpgrades = parseInt(localStorage.getItem('attackUpgrades') || 0);
            localStorage.setItem('attackUpgrades', (currentUpgrades + 1).toString());
            
            // 提升攻擊力
            GameDatabase.upgradeAttack(3);
            
            // 顯示購買成功訊息
            const successText = this.add.text(187.5, 450, '✅ 購買成功！\n攻擊力 +3', {
                fontSize: '16px',
                fill: '#27ae60',
                fontWeight: 'bold',
                align: 'center',
                stroke: '#ffffff',
                strokeThickness: 2
            }).setOrigin(0.5);
            
            // 2秒後移除訊息並重新載入場景
            this.time.delayedCall(2000, () => {
                this.scene.restart();
            });
        }
    }

    getDefenseUpgradeCost() {
        // 防禦力強化費用 (基礎費用40，每次+25)
        const upgradeCount = localStorage.getItem('defenseUpgrades') || 0;
        return 40 + (parseInt(upgradeCount) * 25);
    }

    purchaseDefenseUpgrade() {
        const cost = this.getDefenseUpgradeCost();
        const newMoney = GameDatabase.spendMoney(cost);
        
        if (newMoney !== this.currentMoney) {
            // 購買成功
            const currentUpgrades = parseInt(localStorage.getItem('defenseUpgrades') || 0);
            localStorage.setItem('defenseUpgrades', (currentUpgrades + 1).toString());
            
            // 提升防禦力
            GameDatabase.upgradeDefense(2);
            
            // 顯示購買成功訊息
            const successText = this.add.text(187.5, 450, '✅ 購買成功！\n防禦力 +2', {
                fontSize: '16px',
                fill: '#27ae60',
                fontWeight: 'bold',
                align: 'center',
                stroke: '#ffffff',
                strokeThickness: 2
            }).setOrigin(0.5);
            
            // 2秒後移除訊息並重新載入場景
            this.time.delayedCall(2000, () => {
                this.scene.restart();
            });
        }
    }
}

// 遊戲場景
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        // 每次進入場景時重置遊戲變數，但使用升級後的基礎生命值
        const baseMaxHealth = parseInt(localStorage.getItem('baseMaxHealth') || 100);
        this.playerHealth = baseMaxHealth;
        this.maxHealth = baseMaxHealth;
        this.currentLevel = 1;
        
        // 初始化攻擊力和防禦力（從GameDatabase載入）
        this.playerAttack = GameDatabase.loadAttack();
        this.playerDefense = GameDatabase.loadDefense();
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

        // 攻擊力顯示方框 - 右上角最左邊，貼著頂部
        this.attackBg = this.add.graphics();
        this.attackBg.fillStyle(0x000000, 0.8);
        this.attackBg.fillRoundedRect(190, 0, 60, 25, 5);
        this.attackBg.lineStyle(2, 0xe74c3c); // 紅色邊框
        this.attackBg.strokeRoundedRect(190, 0, 60, 25, 5);
        
        this.attackText = this.add.text(220, 12.5, `⚔️ ${this.playerAttack}`, {
            fontSize: '11px',
            fill: '#e74c3c',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // 防禦力顯示方框 - 攻擊力右邊，貼著頂部
        this.defenseBg = this.add.graphics();
        this.defenseBg.fillStyle(0x000000, 0.8);
        this.defenseBg.fillRoundedRect(255, 0, 60, 25, 5);
        this.defenseBg.lineStyle(2, 0x3498db); // 藍色邊框
        this.defenseBg.strokeRoundedRect(255, 0, 60, 25, 5);
        
        this.defenseText = this.add.text(285, 12.5, `🛡️ ${this.playerDefense}`, {
            fontSize: '11px',
            fill: '#3498db',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // 金錢顯示方框 - 防禦力右邊，貼著頂部
        this.playerMoney = GameDatabase.loadMoney();
        
        this.moneyBg = this.add.graphics();
        this.moneyBg.fillStyle(0x000000, 0.8); // 黑色背景，80%透明度
        this.moneyBg.fillRoundedRect(320, 0, 55, 25, 5); // 最右邊
        this.moneyBg.lineStyle(2, 0xf39c12); // 金色邊框
        this.moneyBg.strokeRoundedRect(320, 0, 55, 25, 5);
        
        this.moneyText = this.add.text(347.5, 12.5, `� ${this.playerMoney}`, {
            fontSize: '11px',
            fill: '#f39c12',
            fontWeight: 'bold'
        }).setOrigin(0.5);

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
        
        // 檢查是否為商店類型事件
        if (randomEvent.type === "shop") {
            this.showShopEvent(randomEvent);
            return;
        }
        
        // 檢查是否為戰鬥類型事件
        if (randomEvent.type === "battle") {
            this.startBattle(randomEvent);
            return;
        }
        
        // 更新關卡
        this.currentLevel++;
        
        // 更新關卡顯示
        this.levelText.setText(`第 ${this.currentLevel-1} 關`);
        
        // 應用事件效果
        let healthChange = randomEvent.effect.health || 0;
        let maxHealthChange = randomEvent.effect.maxHealth || 0;
        let moneyGain = randomEvent.effect.money || 0;
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
        
        // 處理金錢獲得
        if (moneyGain > 0) {
            this.gainMoney(moneyGain);
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
        
        if (moneyGain > 0) {
            statusMessage += `💰 獲得 ${moneyGain} 金錢！總金錢: ${this.playerMoney}\n`;
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
        
        // 更新金錢顯示
        this.playerMoney = GameDatabase.loadMoney();
        this.moneyText.setText(`💰 ${this.playerMoney}`);
        
        // 更新攻擊力和防禦力顯示
        this.attackText.setText(`⚔️ ${this.playerAttack}`);
        this.defenseText.setText(`🛡️ ${this.playerDefense}`);
        
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

    // 獲得金錢
    gainMoney(amount) {
        const newTotal = GameDatabase.addMoney(amount);
        this.playerMoney = newTotal;
        this.updateHealthDisplay(); // 更新顯示
        return amount;
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

    // 顯示商店事件
    showShopEvent(event) {
        // 更新關卡
        this.currentLevel++;
        this.levelText.setText(`第 ${this.currentLevel-1} 關`);
        
        // 隱藏原本的下一關按鈕
        this.nextLevelButton.setVisible(false);
        
        // 創建商店介面
        this.createShopInterface(event);
    }

    // 創建商店介面
    createShopInterface(event) {
        // 隨機選擇要顯示的商品數量（2-3個）
        const itemCount = Math.floor(Math.random() * 2) + 2; // 2 或 3
        
        // 隨機選擇要顯示的商品
        const shuffledItems = [...event.shopItems].sort(() => Math.random() - 0.5);
        const selectedItems = shuffledItems.slice(0, itemCount);
        
        // 顯示商人描述
        this.eventText.setText(`${event.description}\n\n商人說：「歡迎光臨！看看我有什麼好東西！」\n💰 你的金錢: ${this.playerMoney}`);
        
        // 清理現有的商店按鈕（如果有的話）
        if (this.shopButtons) {
            this.shopButtons.forEach(button => button.destroy());
        }
        this.shopButtons = [];
        
        // 方框大小和位置設定
        const boxSize = 60;
        
        // 根據商品數量調整位置
        let positions = [];
        if (selectedItems.length === 2) {
            positions = [
                { x: 120, y: 160 },  // 左
                { x: 240, y: 160 }   // 右
            ];
        } else { // 3個商品
            positions = [
                { x: 90, y: 160 },   // 左
                { x: 180, y: 160 },  // 中
                { x: 270, y: 160 }   // 右
            ];
        }
        
        // 為每個選中的商品創建方框按鈕
        selectedItems.forEach((item, index) => {
            const pos = positions[index];
            const canAfford = this.playerMoney >= item.price;
            
            // 創建方框背景
            const boxBg = this.add.rectangle(pos.x, pos.y, boxSize, boxSize);
            boxBg.setFillStyle(canAfford ? 0x2c3e50 : 0x95a5a6);
            boxBg.setStrokeStyle(3, canAfford ? 0x3498db : 0x7f8c8d);
            
            // 創建物品名稱（簡短版本）
            let shortName = item.name;
            if (item.name === "治療藥水") shortName = "小藥水";
            if (item.name === "大型治療藥水") shortName = "大藥水";
            if (item.name === "生命護符") shortName = "護符";
            if (item.name === "龍鱗盔甲") shortName = "盔甲";
            
            const nameText = this.add.text(pos.x, pos.y - 15, shortName, {
                fontSize: '9px',
                fill: canAfford ? '#ffffff' : '#bdc3c7',
                align: 'center',
                fontFamily: 'Arial, sans-serif'
            });
            nameText.setOrigin(0.5);
            
            // 創建價格文字
            const priceText = this.add.text(pos.x, pos.y + 5, `${item.price}💰`, {
                fontSize: '9px',
                fill: canAfford ? '#f1c40f' : '#95a5a6',
                align: 'center',
                fontFamily: 'Arial, sans-serif'
            });
            priceText.setOrigin(0.5);
            
            // 創建效果文字
            let effectText = "";
            if (item.effect.health) effectText = `+${item.effect.health}❤️`;
            if (item.effect.maxHealth) effectText = `+${item.effect.maxHealth}💪`;
            if (item.effect.attack) effectText = `+${item.effect.attack}⚔️`;
            if (item.effect.defense) effectText = `+${item.effect.defense}🛡️`;
            
            const effectDisplay = this.add.text(pos.x, pos.y + 18, effectText, {
                fontSize: '8px',
                fill: canAfford ? '#27ae60' : '#95a5a6',
                align: 'center',
                fontFamily: 'Arial, sans-serif'
            });
            effectDisplay.setOrigin(0.5);
            
            // 將所有元素加入數組以便管理
            const buttonElements = [boxBg, nameText, priceText, effectDisplay];
            this.shopButtons.push(...buttonElements);
            
            // 為方框添加互動功能
            if (canAfford) {
                boxBg.setInteractive({ useHandCursor: true });
                
                boxBg.on('pointerdown', () => {
                    this.playSound('buttonClick');
                    this.buyItemAndLeave(item);
                });
                
                boxBg.on('pointerover', () => {
                    boxBg.setFillStyle(0x34495e);
                    boxBg.setScale(1.1);
                });
                
                boxBg.on('pointerout', () => {
                    boxBg.setFillStyle(0x2c3e50);
                    boxBg.setScale(1);
                });
            }
        });
        
        // 添加「什麼都不買」選項 - 在最右邊
        this.createNothingButton();
    }
    
    // 創建「離開」按鈕
    createNothingButton() {
        // 放在大藥水下面的絕對位置
        const buttonX = 180; // 中間位置（對應大藥水的X座標）
        const buttonY = 220; // 在商品方框下方
        
        const nothingBg = this.add.rectangle(buttonX, buttonY, 60, 30);
        nothingBg.setFillStyle(0xe74c3c);
        nothingBg.setStrokeStyle(2, 0xc0392b);
        
        const nothingText = this.add.text(buttonX, buttonY, '離開', {
            fontSize: '12px',
            fill: '#ffffff',
            align: 'center',
            fontFamily: 'Arial, sans-serif'
        });
        nothingText.setOrigin(0.5);
        
        this.shopButtons.push(nothingBg, nothingText);
        
        nothingBg.setInteractive({ useHandCursor: true });
        
        nothingBg.on('pointerdown', () => {
            this.playSound('buttonClick');
            this.leaveShop();
        });
        
        nothingBg.on('pointerover', () => {
            nothingBg.setFillStyle(0xc0392b);
            nothingBg.setScale(1.05);
        });
        
        nothingBg.on('pointerout', () => {
            nothingBg.setFillStyle(0xe74c3c);
            nothingBg.setScale(1);
        });
    }
    
    // 購買物品並離開商店
    buyItemAndLeave(item) {
        // 檢查是否有足夠金錢
        if (this.playerMoney < item.price) {
            this.eventText.setText(this.eventText.text + '\n\n💸 金錢不足！');
            return;
        }
        
        // 扣除金錢
        GameDatabase.spendMoney(item.price);
        this.playerMoney = GameDatabase.loadMoney();
        
        // 播放購買音效
        this.playSound('eventPositive');
        
        // 應用物品效果
        if (item.effect.health) {
            this.playerHealth += item.effect.health;
            this.playerHealth = Math.min(this.maxHealth, this.playerHealth);
        }
        
        // 處理最大血量提升（臨時的，不儲存到localStorage）
        if (item.effect.maxHealth) {
            this.maxHealth += item.effect.maxHealth;
            this.playSound('levelUp');
            // 注意：不更新 localStorage 中的 baseMaxHealth，只是當局有效
        }
        
        // 處理攻擊力提升（臨時的，不儲存到永久資料庫）
        if (item.effect.attack) {
            this.playerAttack += item.effect.attack;
            // 注意：不調用 GameDatabase.saveAttack()，只是當局有效
        }
        
        // 處理防禦力提升（臨時的，不儲存到永久資料庫）
        if (item.effect.defense) {
            this.playerDefense += item.effect.defense;
            // 注意：不調用 GameDatabase.saveDefense()，只是當局有效
        }
        
        // 更新顯示
        this.updateHealthDisplay();
        
        // 清理商店按鈕
        if (this.shopButtons) {
            this.shopButtons.forEach(button => button.destroy());
            this.shopButtons = [];
        }
        
        // 清理提示
        this.hideItemTooltip();
        
        // 顯示購買成功訊息並自動離開
        let tempMessage = "";
        if (item.effect.attack || item.effect.defense || item.effect.maxHealth) {
            tempMessage = "\n⚠️ 此提升僅在本局遊戲有效";
        }
        
        this.eventText.setText(
            `✅ 購買成功！\n\n${item.effect.message}${tempMessage}\n\n💰 剩餘金錢: ${this.playerMoney}\n\n商人說：「謝謝惠顧！一路平安！」`
        );
        
        // 恢復下一關按鈕
        this.nextLevelButton.setVisible(true);
    }
    
    // 創建離開商店按鈕（已移除，改用「什麼都不買」）
    
    // 顯示物品提示（簡化版）
    showItemTooltip(item, x, y) {
        // 暫時移除提示功能，簡化商店體驗
    }
    
    // 隱藏物品提示
    hideItemTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.destroy();
            this.currentTooltip = null;
        }
    }

    // 購買物品（舊版本，保留用於其他地方）
    buyItem(item, shopEvent) {
        // 這個方法已被 buyItemAndLeave 取代，但保留以防其他地方使用
        this.buyItemAndLeave(item);
    }

    // 離開商店
    leaveShop() {
        // 播放按鈕音效
        this.playSound('buttonClick');
        
        // 清理商店按鈕
        if (this.shopButtons) {
            this.shopButtons.forEach(button => button.destroy());
            this.shopButtons = [];
        }
        
        // 清理提示
        this.hideItemTooltip();
        
        // 顯示離開訊息
        this.eventText.setText('你決定不購買任何東西，與商人告別。\n\n商人說：「沒關係！下次有機會再來看看！」');
        
        // 恢復下一關按鈕
        this.nextLevelButton.setVisible(true);
    }

    // 開始戰鬥
    startBattle(event) {
        // 更新關卡
        this.currentLevel++;
        this.levelText.setText(`第 ${this.currentLevel-1} 關`);
        
        // 隱藏下一關按鈕
        this.nextLevelButton.setVisible(false);
        
        // 初始化戰鬥數據
        this.battleData = {
            monster: {
                name: event.monster.name,
                health: event.monster.health,
                maxHealth: event.monster.maxHealth,
                attack: event.monster.attack,
                defense: event.monster.defense
            },
            reward: event.monster.reward,
            escapeMessage: event.monster.escapeMessage,
            currentRound: 1,
            maxRounds: 30,
            isPlayerTurn: true,
            battleActive: true
        };
        
        // 創建戰鬥介面
        this.createBattleInterface();
        
        // 開始戰鬥循環
        this.startBattleLoop();
    }

    // 創建戰鬥介面
    createBattleInterface() {
        // 初始化戰鬥訊息陣列
        this.battleMessages = [];
        
        // 顯示初始戰鬥狀態
        const initialStatus = `⚔️ 遭遇 ${this.battleData.monster.name}！\n\n` +
                            `🐺 ${this.battleData.monster.name}: ${this.battleData.monster.health}/${this.battleData.monster.maxHealth} HP\n` +
                            `⚔️ 你: ${this.playerHealth}/${this.playerMaxHealth} HP\n\n` +
                            `戰鬥自動進行中...\n最多進行 ${this.battleData.maxRounds} 個回合\n\n` +
                            `📝 戰鬥記錄:\n戰鬥開始！`;
        
        this.eventText.setText(initialStatus);
        this.battleMessages.push('戰鬥開始！');
        
        // 清理現有的戰鬥元素
        if (this.battleElements) {
            this.battleElements.forEach(element => element.destroy());
        }
        this.battleElements = [];
        
        // 創建怪物圖片（暫時用方框代替）
        const monsterBg = this.add.rectangle(280, 250, 80, 80, 0x8b4513);
        monsterBg.setStrokeStyle(3, 0x654321);
        this.battleElements.push(monsterBg);
        
        // 怪物名稱
        const monsterNameText = this.add.text(280, 200, this.battleData.monster.name, {
            fontSize: '14px',
            fill: '#8b4513',
            fontWeight: 'bold',
            align: 'center'
        }).setOrigin(0.5);
        this.battleElements.push(monsterNameText);
        
        // 怪物血量背景
        const monsterHealthBg = this.add.rectangle(280, 310, 100, 15, 0x2c3e50);
        monsterHealthBg.setStrokeStyle(1, 0x34495e);
        this.battleElements.push(monsterHealthBg);
        
        // 怪物血量條
        this.monsterHealthBar = this.add.rectangle(230, 310, 100, 13, 0xe74c3c);
        this.monsterHealthBar.setOrigin(0, 0.5);
        this.battleElements.push(this.monsterHealthBar);
        
        // 怪物血量文字
        this.monsterHealthText = this.add.text(280, 325, 
            `${this.battleData.monster.health}/${this.battleData.monster.maxHealth}`, {
            fontSize: '11px',
            fill: '#2c3e50',
            fontWeight: 'bold',
            align: 'center'
        }).setOrigin(0.5);
        this.battleElements.push(this.monsterHealthText);
        
        // 回合數顯示
        this.roundText = this.add.text(50, 200, `回合: 1/${this.battleData.maxRounds}`, {
            fontSize: '12px',
            fill: '#2c3e50',
            fontWeight: 'bold'
        });
        this.battleElements.push(this.roundText);
    }

    // 開始戰鬥循環
    startBattleLoop() {
        if (!this.battleData.battleActive) return;
        
        // 更新回合數顯示
        this.roundText.setText(`回合: ${this.battleData.currentRound}/${this.battleData.maxRounds}`);
        
        // 檢查是否超過最大回合數
        if (this.battleData.currentRound > this.battleData.maxRounds) {
            this.endBattle(false); // 怪物逃跑
            return;
        }
        
        // 玩家攻擊
        this.time.delayedCall(500, () => {
            this.playerAttackAction();
            
            // 檢查怪物是否死亡
            if (this.battleData.monster.health <= 0) {
                this.endBattle(true); // 玩家勝利
                return;
            }
            
            // 怪物攻擊
            this.time.delayedCall(1000, () => {
                this.monsterAttack();
                
                // 檢查玩家是否死亡
                if (this.playerHealth <= 0) {
                    this.endBattle(false, true); // 玩家死亡
                    return;
                }
                
                // 繼續下一回合
                this.time.delayedCall(500, () => {
                    // 增加回合數
                    this.battleData.currentRound++;
                    this.startBattleLoop();
                });
            });
        });
    }

    // 玩家攻擊
    playerAttackAction() {
        const damage = Math.max(1, this.playerAttack - this.battleData.monster.defense);
        this.battleData.monster.health = Math.max(0, this.battleData.monster.health - damage);
        
        this.updateBattleDisplay();
        this.addBattleLog(`你攻擊 ${this.battleData.monster.name}，造成 ${damage} 點傷害！`);
        
        // 播放攻擊音效
        this.playSound('eventNegative');
    }

    // 怪物攻擊
    monsterAttack() {
        const damage = Math.max(1, this.battleData.monster.attack - this.playerDefense);
        this.playerHealth = Math.max(0, this.playerHealth - damage);
        
        this.updateHealthDisplay();
        this.addBattleLog(`${this.battleData.monster.name} 攻擊你，造成 ${damage} 點傷害！`);
        
        // 播放受傷音效
        this.playSound('eventNegative');
    }

    // 更新戰鬥顯示
    updateBattleDisplay() {
        // 更新怪物血量條
        const healthPercentage = this.battleData.monster.health / this.battleData.monster.maxHealth;
        this.monsterHealthBar.setScale(healthPercentage, 1);
        
        // 更新怪物血量文字
        this.monsterHealthText.setText(
            `${this.battleData.monster.health}/${this.battleData.monster.maxHealth}`
        );
        
        // 根據血量改變顏色
        if (healthPercentage > 0.6) {
            this.monsterHealthBar.setFillStyle(0x27ae60); // 綠色
        } else if (healthPercentage > 0.3) {
            this.monsterHealthBar.setFillStyle(0xf39c12); // 橙色
        } else {
            this.monsterHealthBar.setFillStyle(0xe74c3c); // 紅色
        }
    }

    // 添加戰鬥日誌到主要文字框
    addBattleLog(message) {
        // 添加訊息到陣列
        this.battleMessages.push(message);
        
        // 限制訊息數量（保留最新的6條）
        if (this.battleMessages.length > 6) {
            this.battleMessages.shift();
        }
        
        // 更新主要文字框內容
        const battleStatus = `⚔️ 戰鬥進行中 - 回合 ${this.battleData.currentRound}/${this.battleData.maxRounds}\n\n` +
                           `🐺 ${this.battleData.monster.name}: ${this.battleData.monster.health}/${this.battleData.monster.maxHealth} HP\n` +
                           `⚔️ 你: ${this.playerHealth}/${this.playerMaxHealth} HP\n\n` +
                           `📝 戰鬥記錄:\n${this.battleMessages.join('\n')}`;
        
        this.eventText.setText(battleStatus);
    }

    // 結束戰鬥
    endBattle(playerWin, playerDied = false) {
        this.battleData.battleActive = false;
        
        // 清理戰鬥元素
        if (this.battleElements) {
            this.battleElements.forEach(element => element.destroy());
            this.battleElements = [];
        }
        
        if (playerDied) {
            // 玩家死亡
            this.eventText.setText(
                `你在與 ${this.battleData.monster.name} 的戰鬥中陣亡！\n\n💀 遊戲結束！點擊重新開始回到首頁。`
            );
            this.changeButtonToRestart();
        } else if (playerWin) {
            // 玩家勝利
            this.gainMoney(this.battleData.reward.money);
            this.playSound('eventPositive');
            
            this.eventText.setText(
                `✅ 戰鬥勝利！\n\n${this.battleData.reward.message}\n\n💰 總金錢: ${this.playerMoney}`
            );
            
            // 恢復下一關按鈕
            this.nextLevelButton.setVisible(true);
        } else {
            // 怪物逃跑
            this.eventText.setText(
                `戰鬥超過 ${this.battleData.maxRounds} 個回合！\n\n${this.battleData.escapeMessage}`
            );
            
            // 恢復下一關按鈕
            this.nextLevelButton.setVisible(true);
        }
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
    scene: [StartScene, UpgradeScene, GameScene]
};

// 啟動遊戲
const game = new Phaser.Game(config);