// 其他遊戲場景 - 從原 game_fixed.js 提取並整理

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

        // 金錢顯示
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

        // 創建強化選項
        this.createHealthUpgrade();
        this.createAttackUpgrade();
        this.createDefenseUpgrade();
        this.createBackButton();
    }

    createHealthUpgrade() {
        const cost = 50 + (parseInt(localStorage.getItem('healthUpgrades') || 0) * 25);
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

        this.createUpgradeButton(280, yPos + 30, cost, () => {
            if (GameDatabase.spendMoney(cost) !== this.currentMoney) {
                const currentUpgrades = parseInt(localStorage.getItem('healthUpgrades') || 0);
                localStorage.setItem('healthUpgrades', (currentUpgrades + 1).toString());
                const currentBaseHealth = parseInt(localStorage.getItem('baseMaxHealth') || 100);
                localStorage.setItem('baseMaxHealth', (currentBaseHealth + 10).toString());
                this.scene.restart();
            }
        });
    }

    createAttackUpgrade() {
        const cost = 30 + (parseInt(localStorage.getItem('attackUpgrades') || 0) * 20);
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

        this.createUpgradeButton(280, yPos + 30, cost, () => {
            if (GameDatabase.spendMoney(cost) !== this.currentMoney) {
                const currentUpgrades = parseInt(localStorage.getItem('attackUpgrades') || 0);
                localStorage.setItem('attackUpgrades', (currentUpgrades + 1).toString());
                GameDatabase.upgradeAttack(3);
                this.scene.restart();
            }
        });
    }

    createDefenseUpgrade() {
        const cost = 40 + (parseInt(localStorage.getItem('defenseUpgrades') || 0) * 25);
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

        this.createUpgradeButton(280, yPos + 30, cost, () => {
            if (GameDatabase.spendMoney(cost) !== this.currentMoney) {
                const currentUpgrades = parseInt(localStorage.getItem('defenseUpgrades') || 0);
                localStorage.setItem('defenseUpgrades', (currentUpgrades + 1).toString());
                GameDatabase.upgradeDefense(2);
                this.scene.restart();
            }
        });
    }

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
}

// 簡化的裝備場景
class EquipmentScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EquipmentScene' });
    }

    create() {
        // 背景
        this.add.rectangle(187.5, 333.5, 375, 667, 0x34495e);

        // 標題
        this.add.text(187.5, 30, '裝備管理', {
            fontSize: '28px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // 返回按鈕
        const backButtonBg = this.add.rectangle(0, 0, 80, 35, 0x95a5a6, 1);
        backButtonBg.setStrokeStyle(2, 0x7f8c8d);
        
        const backButtonText = this.add.text(0, 0, '返回', {
            fontSize: '16px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        const backButton = this.add.container(40, 25, [backButtonBg, backButtonText]);
        backButton.setSize(80, 35);
        backButton.setInteractive({ useHandCursor: true });
        
        backButton.on('pointerdown', () => {
            this.scene.start('StartScene');
        });

        // 顯示裝備功能開發中
        this.add.text(187.5, 333.5, '裝備系統開發中...', {
            fontSize: '24px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);
    }
}

// 簡化的遊戲場景
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        const baseMaxHealth = parseInt(localStorage.getItem('baseMaxHealth') || 100);
        this.playerHealth = baseMaxHealth;
        this.maxHealth = baseMaxHealth;
        this.currentLevel = 1;
        this.playerSkills = {};
        
        this.calculatePlayerStats();
    }

    calculatePlayerStats() {
        this.playerAttack = GameDatabase.loadAttack();
        this.playerDefense = GameDatabase.loadDefense();
        
        const playerEquipment = GameDatabase.loadEquippedItems();
        Object.values(playerEquipment).forEach(equipment => {
            if (equipment) {
                if (equipment.baseAttack) {
                    this.playerAttack += equipment.baseAttack + (equipment.level * 2);
                }
                if (equipment.baseDefense) {
                    this.playerDefense += equipment.baseDefense + (equipment.level * 1);
                }
            }
        });
    }

    preload() {
        console.log('GameScene 開始載入資源');
        this.load.image('backgroundImg', ASSETS.images.background);
        this.load.image('player', ASSETS.images.player);
        
        this.load.on('loaderror', (file) => {
            console.error('載入失敗:', file.src);
        });
        
        this.load.on('filecomplete', (key, type, data) => {
            console.log('載入成功:', key, type);
        });
        
        this.load.on('complete', () => {
            console.log('GameScene 資源載入完成');
            this.createFallbackGraphics();
        });
    }

    createFallbackGraphics() {
        if (!this.textures.exists('backgroundImg')) {
            this.add.graphics()
                .fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98FB98, 0x98FB98)
                .fillRect(0, 0, 375, 667)
                .generateTexture('backgroundImg', 375, 667);
        }
    }

    create() {
        // 背景
        const bg = this.add.image(187.5, 333.5, 'backgroundImg');
        bg.setOrigin(0.5);
        
        if (this.textures.exists('backgroundImg')) {
            const bgTexture = this.textures.get('backgroundImg');
            const bgWidth = bgTexture.source[0].width;
            const bgHeight = bgTexture.source[0].height;
            
            const scaleX = 375 / bgWidth;
            const scaleY = 667 / bgHeight;
            const bgScale = Math.max(scaleX, scaleY);
            
            bg.setScale(bgScale);
        }

        // 玩家 - 根據原始 game_fixed.js 的設定
        if (this.textures.exists('player')) {
            this.player = this.add.sprite(60, 300, 'player');
            
            // 計算適當的縮放比例（目標大小約 80x80）
            const playerTexture = this.textures.get('player');
            const originalWidth = playerTexture.source[0].width;
            const originalHeight = playerTexture.source[0].height;
            
            const targetSize = 80;
            const scaleX = targetSize / originalWidth;
            const scaleY = targetSize / originalHeight;
            const scale = Math.min(scaleX, scaleY); // 保持比例
            
            this.player.setScale(scale);
            console.log(`玩家圖片載入成功！原始尺寸: ${originalWidth}x${originalHeight}, 縮放比例: ${scale}`);
        } else {
            this.player = this.add.circle(60, 300, 35, 0x4a90e2);
            console.log('使用預設圓形玩家');
        }

        // 關卡顯示
        this.levelText = this.add.text(187.5, 50, `第 ${this.currentLevel} 關`, {
            fontSize: '22px',
            fill: '#2c3e50',
            fontWeight: 'bold',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setOrigin(0.5);

        // 血量顯示
        this.healthText = this.add.text(187.5, 75, `血量: ${this.playerHealth}/${this.maxHealth}`, {
            fontSize: '14px',
            fill: '#2c3e50',
            fontWeight: 'bold',
            stroke: '#ffffff',
            strokeThickness: 1
        }).setOrigin(0.5);

        // 血量條
        this.healthBarBg = this.add.rectangle(187.5, 90, 200, 15, 0xe74c3c);
        this.healthBar = this.add.rectangle(87.5, 90, 200, 15, 0x27ae60);
        this.healthBar.setOrigin(0, 0.5);

        // 狀態顯示
        this.playerMoney = GameDatabase.loadMoney();
        
        this.attackText = this.add.text(220, 12.5, `⚔️ ${this.playerAttack}`, {
            fontSize: '11px',
            fill: '#e74c3c',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        this.defenseText = this.add.text(285, 12.5, `🛡️ ${this.playerDefense}`, {
            fontSize: '11px',
            fill: '#3498db',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        this.moneyText = this.add.text(347.5, 12.5, `💰 ${this.playerMoney}`, {
            fontSize: '11px',
            fill: '#f39c12',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // 事件文字框
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

        // 下一關按鈕
        const buttonBg = this.add.rectangle(0, 0, 200, 60, 0x3498db, 1);
        buttonBg.setStrokeStyle(3, 0x2980b9);
        
        const buttonText = this.add.text(0, 0, '下一關', {
            fontSize: '20px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        this.nextLevelButton = this.add.container(187.5, 620, [buttonBg, buttonText]);
        this.nextLevelButton.setSize(200, 60);
        this.nextLevelButton.setInteractive({ useHandCursor: true });
        
        this.nextLevelButton.on('pointerdown', () => {
            this.nextLevelButton.setScale(0.95);
            this.time.delayedCall(100, () => {
                this.nextLevelButton.setScale(1);
            });
            this.triggerRandomEvent();
        });

        this.nextLevelButton.on('pointerover', () => {
            buttonBg.setFillStyle(0x2980b9);
            this.nextLevelButton.setScale(1.05);
        });

        this.nextLevelButton.on('pointerout', () => {
            buttonBg.setFillStyle(0x3498db);
            this.nextLevelButton.setScale(1);
        });
    }

    // 觸發隨機事件
    triggerRandomEvent() {
        console.log('觸發隨機事件');
        
        // 檢查血量是否歸零
        if (this.playerHealth <= 0) {
            this.eventText.setText('你的血量已經歸零。\n\n💀 遊戲結束！點擊重新開始回到首頁。');
            this.changeButtonToRestart();
            return;
        }

        // 使用完整的事件系統
        const randomEvent = getRandomEventByWeight();
        console.log('選中事件:', randomEvent);
        
        // 檢查是否為商店類型事件
        if (randomEvent.type === "shop") {
            this.showShopEvent(randomEvent);
            return;
        }
        
        // 檢查是否為技能商店類型事件
        if (randomEvent.type === "skill_shop") {
            console.log('觸發技能商店事件:', randomEvent);
            this.showSkillShopEvent(randomEvent);
            return;
        }
        
        // 檢查是否為戰鬥類型事件
        if (randomEvent.type === "battle") {
            this.startBattle(randomEvent);
            return;
        }
        
        // 檢查是否為裝備類型事件
        if (randomEvent.type === "equipment") {
            this.handleEquipmentEvent(randomEvent);
            return;
        }
        
        // 更新關卡
        this.currentLevel++;
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
        } else if (fullHeal) {
            this.playerHealth = this.maxHealth;
        } else {
            this.playerHealth += healthChange;
            this.playerHealth = Math.max(0, Math.min(this.maxHealth, this.playerHealth));
        }
        
        // 處理最大血量變化
        if (maxHealthChange > 0) {
            this.maxHealth += maxHealthChange;
        }
        
        // 處理金錢變化
        if (moneyGain !== 0) {
            GameDatabase.addMoney(moneyGain);
            this.playerMoney = GameDatabase.loadMoney();
        }

        this.updateDisplay();
        
        // 顯示事件結果
        this.eventText.setText(
            `${randomEvent.description}\n\n` +
            `${randomEvent.effect.message}\n\n` +
            `💰 總金錢: ${this.playerMoney}`
        );

        if (this.playerHealth <= 0) {
            this.changeButtonToRestart();
        }
    }

    // 簡化的事件處理方法
    showShopEvent(event) {
        console.log('商店事件:', event);
        // 簡化版：顯示商店事件但不實現完整功能
        this.eventText.setText(`${event.description}\n\n商店功能開發中...`);
    }

    showSkillShopEvent(event) {
        console.log('技能商店事件:', event);
        // 簡化版：顯示技能商店事件但不實現完整功能
        this.eventText.setText(`${event.description}\n\n技能商店功能開發中...`);
    }

    startBattle(event) {
        console.log('戰鬥事件:', event);
        // 簡化版：直接給予戰鬥獎勵
        const monster = event.monster;
        const damage = Math.floor(Math.random() * 20) + 10; // 隨機傷害
        
        this.playerHealth -= damage;
        this.playerHealth = Math.max(0, this.playerHealth);
        
        if (this.playerHealth > 0) {
            // 玩家獲勝
            GameDatabase.addMoney(monster.reward.money);
            this.playerMoney = GameDatabase.loadMoney();
            this.eventText.setText(
                `與 ${monster.name} 戰鬥！\n\n你受到 ${damage} 點傷害，但擊敗了敵人！\n\n${monster.reward.message}\n\n💰 總金錢: ${this.playerMoney}`
            );
        } else {
            // 玩家敗北
            this.eventText.setText(
                `與 ${monster.name} 戰鬥！\n\n你在戰鬥中陣亡！\n\n💀 遊戲結束！`
            );
            this.changeButtonToRestart();
        }
        
        this.updateDisplay();
    }

    handleEquipmentEvent(event) {
        console.log('裝備事件:', event);
        // 簡化版：顯示裝備事件但不實現完整功能
        this.eventText.setText(`${event.description}\n\n裝備功能開發中...`);
    }

    updateDisplay() {
        const healthPercentage = this.playerHealth / this.maxHealth;
        this.healthBar.setScale(healthPercentage, 1);
        this.healthText.setText(`血量: ${this.playerHealth}/${this.maxHealth}`);
        this.moneyText.setText(`💰 ${this.playerMoney}`);

        if (healthPercentage > 0.6) {
            this.healthBar.setFillStyle(0x27ae60);
        } else if (healthPercentage > 0.3) {
            this.healthBar.setFillStyle(0xf39c12);
        } else {
            this.healthBar.setFillStyle(0xe74c3c);
        }
    }

    changeButtonToRestart() {
        this.nextLevelButton.removeAllListeners();
        
        const buttonBg = this.nextLevelButton.list[0];
        const buttonText = this.nextLevelButton.list[1];
        
        buttonBg.setFillStyle(0xe74c3c);
        buttonBg.setStrokeStyle(3, 0xc0392b);
        buttonText.setText('重新開始');
        
        this.nextLevelButton.setInteractive({ useHandCursor: true });
        
        this.nextLevelButton.on('pointerdown', () => {
            this.nextLevelButton.setScale(0.95);
            this.time.delayedCall(100, () => {
                this.nextLevelButton.setScale(1);
                this.scene.start('StartScene');
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
}