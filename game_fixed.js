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
    },

    // === 裝備系統 ===
    // 裝備品質等級: 0=白色, 1=藍色, 2=金色, 3=紫色
    // 裝備類型: weapon=武器, armor=防具, shield=盾牌, boots=鞋子
    
    // 保存玩家裝備
    saveEquippedItems(equipment) {
        localStorage.setItem('playerEquipment', JSON.stringify(equipment));
    },
    
    // 載入玩家裝備
    loadEquippedItems() {
        const saved = localStorage.getItem('playerEquipment');
        return saved ? JSON.parse(saved) : {
            weapon: null,
            armor: null,
            shield: null,
            boots: null
        };
    },
    
    // 保存裝備背包
    saveEquipmentInventory(inventory) {
        localStorage.setItem('equipmentInventory', JSON.stringify(inventory));
    },
    
    // 載入裝備背包
    loadEquipmentInventory() {
        const saved = localStorage.getItem('equipmentInventory');
        if (saved) {
            return JSON.parse(saved);
        } else {
            // 初始為空的裝備背包
            const emptyInventory = [];
            this.saveEquipmentInventory(emptyInventory);
            return emptyInventory;
        }
    },
    
    // 添加裝備到背包
    addEquipmentToInventory(equipment) {
        const inventory = this.loadEquipmentInventory();
        
        // 檢查背包是否已滿 (最大20個，對應5x4格子)
        if (inventory.length >= 20) {
            console.log('背包已滿，無法添加裝備');
            return false; // 返回false表示添加失敗
        }
        
        equipment.id = Date.now() + Math.random(); // 生成唯一ID
        inventory.push(equipment);
        this.saveEquipmentInventory(inventory);
        console.log(`成功添加裝備到背包: ${equipment.name}`);
        return true; // 返回true表示添加成功
    },
    
    // 從背包移除裝備
    removeEquipmentFromInventory(equipmentId) {
        const inventory = this.loadEquipmentInventory();
        const newInventory = inventory.filter(item => item.id !== equipmentId);
        this.saveEquipmentInventory(newInventory);
        return newInventory;
    },
    
    // 裝備物品
    equipItem(equipment) {
        const currentEquipment = this.loadEquippedItems();
        const inventory = this.loadEquipmentInventory();
        
        // 如果已有同類型裝備，放回背包
        if (currentEquipment[equipment.type]) {
            inventory.push(currentEquipment[equipment.type]);
        }
        
        // 裝備新物品
        currentEquipment[equipment.type] = equipment;
        
        // 從背包中移除
        const newInventory = inventory.filter(item => item.id !== equipment.id);
        
        this.saveEquippedItems(currentEquipment);
        this.saveEquipmentInventory(newInventory);
        
        return { equipment: currentEquipment, inventory: newInventory };
    },
    
    // 卸下裝備
    unequipItem(equipmentType) {
        const currentEquipment = this.loadEquippedItems();
        const inventory = this.loadEquipmentInventory();
        
        if (currentEquipment[equipmentType]) {
            // 放回背包
            inventory.push(currentEquipment[equipmentType]);
            // 卸下裝備
            currentEquipment[equipmentType] = null;
            
            this.saveEquippedItems(currentEquipment);
            this.saveEquipmentInventory(inventory);
        }
        
        return { equipment: currentEquipment, inventory: inventory };
    },
    
    // 強化裝備
    enhanceEquipment(equipment, cost) {
        if (this.spendMoney(cost) < this.loadMoney()) {
            return false; // 金錢不足
        }
        
        if (equipment.level >= 10) {
            return false; // 已達最高等級
        }
        
        equipment.level += 1;
        return true;
    },
    
    // 合成裝備
    synthesizeEquipment(equipment1, equipment2) {
        // 檢查是否為相同類型和品質的裝備
        if (equipment1.type !== equipment2.type || 
            equipment1.quality !== equipment2.quality || 
            equipment1.name !== equipment2.name) {
            return null;
        }
        
        // 檢查是否已達最高品質
        if (equipment1.quality >= 3) {
            return null;
        }
        
        // 創建新的高品質裝備
        const newQuality = equipment1.quality + 1;
        const newName = this.getUpgradedEquipmentName(equipment1.name, newQuality);
        
        // 根據新品質設定屬性值
        const newEquipment = {
            id: Date.now() + Math.random(),
            type: equipment1.type,
            name: newName,
            quality: newQuality,
            level: 0,
            enhancement: 0
        };
        
        // 根據裝備類型和品質設定基礎屬性
        if (equipment1.type === 'weapon') {
            const attackValues = [5, 8, 12, 18]; // 白、藍、金、紫
            newEquipment.baseAttack = attackValues[newQuality] || attackValues[3];
        } else {
            const defenseValues = {
                'armor': [4, 6, 10, 15],
                'shield': [3, 5, 8, 12], 
                'boots': [2, 4, 6, 10]
            };
            const values = defenseValues[equipment1.type] || defenseValues['armor'];
            newEquipment.baseDefense = values[newQuality] || values[3];
        }
        
        return newEquipment;
    },
    
    // 根據品質獲取升級後的裝備名稱
    getUpgradedEquipmentName(baseName, quality) {
        // 裝備升級路線圖
        const upgradeMap = {
            // 武器系列
            '生鏽劍': ['生鏽劍', '鐵劍', '黃金劍', '傳說劍'],
            '鐵劍': ['生鏽劍', '鐵劍', '黃金劍', '傳說劍'],
            '黃金劍': ['生鏽劍', '鐵劍', '黃金劍', '傳說劍'],
            '傳說劍': ['生鏽劍', '鐵劍', '黃金劍', '傳說劍'],
            
            // 護甲系列  
            '布甲': ['布甲', '鐵甲', '黃金甲', '傳說甲'],
            '鐵甲': ['布甲', '鐵甲', '黃金甲', '傳說甲'],
            '黃金甲': ['布甲', '鐵甲', '黃金甲', '傳說甲'],
            '傳說甲': ['布甲', '鐵甲', '黃金甲', '傳說甲'],
            
            // 盾牌系列
            '木盾': ['木盾', '鐵盾', '黃金盾', '傳說盾'],
            '鐵盾': ['木盾', '鐵盾', '黃金盾', '傳說盾'],
            '黃金盾': ['木盾', '鐵盾', '黃金盾', '傳說盾'],
            '傳說盾': ['木盾', '鐵盾', '黃金盾', '傳說盾'],
            
            // 靴子系列
            '草靴': ['草靴', '鐵靴', '黃金靴', '傳說靴'],
            '鐵靴': ['草靴', '鐵靴', '黃金靴', '傳說靴'],
            '黃金靴': ['草靴', '鐵靴', '黃金靴', '傳說靴'],
            '傳說靴': ['草靴', '鐵靴', '黃金靴', '傳說靴']
        };
        
        // 移除品質前綴獲取基本名稱
        const cleanName = baseName.replace(/^(精良|稀有|史詩)\s*/, '');
        
        // 查找升級路線
        const upgradePath = upgradeMap[cleanName];
        if (upgradePath && quality >= 0 && quality < upgradePath.length) {
            return upgradePath[quality];
        }
        
        // 如果找不到升級路線，使用舊邏輯（向下兼容）
        const qualityPrefixes = ['', '精良', '稀有', '史詩'];
        return quality > 0 ? `${qualityPrefixes[quality]} ${cleanName}` : cleanName;
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
                // 切換到裝備場景
                this.scene.start('EquipmentScene');
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

// 裝備場景
class EquipmentScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EquipmentScene' });
        this.playerEquipment = null;
        this.equipmentInventory = null;
        this.selectedInventoryItem = null;
        this.equipmentSlots = {};
        this.inventoryItems = [];
    }

    create() {
        // 載入裝備數據
        this.playerEquipment = GameDatabase.loadEquippedItems();
        this.equipmentInventory = GameDatabase.loadEquipmentInventory();

        // 背景
        this.add.rectangle(187.5, 333.5, 375, 667, 0x34495e);

        // 標題
        this.add.text(187.5, 30, '裝備管理', {
            fontSize: '28px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // 金錢顯示
        const currentMoney = GameDatabase.loadMoney();
        this.moneyText = this.add.text(332.5, 15, `💰 ${currentMoney}`, {
            fontSize: '14px',
            fill: '#f39c12',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // 返回按鈕
        this.createBackButton();

        // 玩家角色圖像區域 (上方中央)
        this.createPlayerSection();

        // 裝備槽位 (四個角落)
        this.createEquipmentSlots();

        // 裝備清單區域 (下方)
        this.createInventorySection();
    }

    createBackButton() {
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
                this.scene.start('StartScene');
            });
        });
    }

    createPlayerSection() {
        // 玩家角色背景框
        const playerBg = this.add.graphics();
        playerBg.fillStyle(0x2c3e50, 0.8);
        playerBg.fillRoundedRect(137.5, 80, 100, 120, 10);
        playerBg.lineStyle(3, 0x3498db);
        playerBg.strokeRoundedRect(137.5, 80, 100, 120, 10);

        // 玩家角色圖像 (簡單的圓形代表)
        const playerAvatar = this.add.circle(187.5, 140, 35, 0x3498db);
        playerAvatar.setStrokeStyle(3, 0x2980b9);

        // 玩家圖標
        this.add.text(187.5, 140, '👤', {
            fontSize: '40px'
        }).setOrigin(0.5);

        // 玩家狀態顯示
        this.updatePlayerStats();
    }

    createEquipmentSlots() {
        const slotConfig = [
            { type: 'weapon', x: 80, y: 120, emoji: '⚔️', name: '武器' },
            { type: 'armor', x: 295, y: 120, emoji: '🥼', name: '防具' },
            { type: 'shield', x: 80, y: 220, emoji: '🛡️', name: '盾牌' },
            { type: 'boots', x: 295, y: 220, emoji: '👢', name: '鞋子' }
        ];

        slotConfig.forEach(slot => {
            this.createEquipmentSlot(slot);
        });
    }

    createEquipmentSlot(config) {
        // 裝備槽背景
        const slotBg = this.add.graphics();
        slotBg.fillStyle(0x34495e, 0.9);
        slotBg.fillRoundedRect(config.x - 30, config.y - 30, 60, 60, 8);
        slotBg.lineStyle(2, 0x7f8c8d);
        slotBg.strokeRoundedRect(config.x - 30, config.y - 30, 60, 60, 8);

        // 裝備槽標籤
        this.add.text(config.x, config.y - 50, config.name, {
            fontSize: '12px',
            fill: '#ecf0f1',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // 裝備槽內容
        const slotContent = this.add.container(config.x, config.y);
        
        // 如果有裝備，顯示裝備；否則顯示默認圖標
        const equipment = this.playerEquipment[config.type];
        if (equipment) {
            this.displayEquipmentInSlot(slotContent, equipment);
        } else {
            const defaultIcon = this.add.text(0, 0, config.emoji, {
                fontSize: '24px'
            }).setOrigin(0.5);
            slotContent.add(defaultIcon);
        }

        // 設置點擊事件 - 卸下裝備
        slotContent.setSize(60, 60);
        slotContent.setInteractive({ useHandCursor: true });
        slotContent.on('pointerdown', () => {
            const currentEquipment = this.playerEquipment[config.type];
            if (currentEquipment) {
                this.unequipItem(config.type);
            }
        });

        this.equipmentSlots[config.type] = slotContent;
    }

    displayEquipmentInSlot(container, equipment) {
        container.removeAll(true);

        // 根據品質設置顏色
        const qualityColors = [0xffffff, 0x3498db, 0xf1c40f, 0x9b59b6]; // 白藍金紫
        const bgColor = qualityColors[equipment.quality];

        // 裝備背景
        const equipBg = this.add.rectangle(0, 0, 50, 50, bgColor, 0.3);
        equipBg.setStrokeStyle(2, bgColor);
        container.add(equipBg);

        // 裝備圖標 (使用emoji代表)
        const icons = {
            weapon: '⚔️',
            armor: '🥼', 
            shield: '🛡️',
            boots: '👢'
        };
        
        const icon = this.add.text(0, -5, icons[equipment.type], {
            fontSize: '20px'
        }).setOrigin(0.5);
        container.add(icon);

        // 強化等級顯示
        if (equipment.level > 0) {
            const levelText = this.add.text(0, 15, `+${equipment.level}`, {
                fontSize: '10px',
                fill: '#e74c3c',
                fontWeight: 'bold'
            }).setOrigin(0.5);
            container.add(levelText);
        }
    }

    createInventorySection() {
        // 背包標題
        this.add.text(187.5, 280, '裝備背包', {
            fontSize: '18px',
            fill: '#ecf0f1',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // 背包背景
        const inventoryBg = this.add.graphics();
        inventoryBg.fillStyle(0x2c3e50, 0.8);
        inventoryBg.fillRoundedRect(20, 310, 335, 340, 10); // 高度增加到380以容納兩排按鈕
        inventoryBg.lineStyle(2, 0x34495e);
        inventoryBg.strokeRoundedRect(20, 310, 335, 340, 10);

        // 創建裝備格子
        this.createInventoryGrid();

        // 操作按鈕
        this.createActionButtons();
    }

    createInventoryGrid() {
        const gridSize = 60;
        const cols = 5;
        const rows = 4; // 改成4排
        const totalWidth = (cols - 1) * gridSize; // 計算總寬度
        const startX = (375 - totalWidth) / 2; // 水平置中
        const startY = 340;

        this.inventoryItems = [];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const index = row * cols + col;
                const x = startX + col * gridSize;
                const y = startY + row * gridSize;

                const itemSlot = this.createInventorySlot(x, y, index);
                this.inventoryItems.push(itemSlot);
            }
        }

        this.updateInventoryDisplay();
    }

    createInventorySlot(x, y, index) {
        // 格子背景
        const slotBg = this.add.graphics();
        slotBg.fillStyle(0x34495e, 0.5);
        slotBg.fillRoundedRect(x - 25, y - 25, 50, 50, 5);
        slotBg.lineStyle(1, 0x7f8c8d);
        slotBg.strokeRoundedRect(x - 25, y - 25, 50, 50, 5);

        // 物品容器
        const itemContainer = this.add.container(x, y);
        itemContainer.setSize(50, 50);
        itemContainer.setInteractive({ useHandCursor: true });

        // 點擊事件
        itemContainer.on('pointerdown', () => {
            this.selectInventoryItem(index);
        });

        return {
            background: slotBg,
            container: itemContainer,
            index: index
        };
    }

    updateInventoryDisplay() {
        this.inventoryItems.forEach((slot, index) => {
            slot.container.removeAll(true);
            
            if (index < this.equipmentInventory.length) {
                const equipment = this.equipmentInventory[index];
                this.displayInventoryItem(slot.container, equipment);
            }
        });
    }

    displayInventoryItem(container, equipment) {
        // 根據品質設置顏色
        const qualityColors = [0xffffff, 0x3498db, 0xf1c40f, 0x9b59b6];
        const bgColor = qualityColors[equipment.quality];

        // 物品背景
        const itemBg = this.add.rectangle(0, 0, 45, 45, bgColor, 0.3);
        itemBg.setStrokeStyle(2, bgColor);
        container.add(itemBg);

        // 物品圖標
        const icons = {
            weapon: '⚔️',
            armor: '🥼',
            shield: '🛡️', 
            boots: '👢'
        };

        const icon = this.add.text(0, -5, icons[equipment.type], {
            fontSize: '16px'
        }).setOrigin(0.5);
        container.add(icon);

        // 強化等級
        if (equipment.level > 0) {
            const levelText = this.add.text(0, 12, `+${equipment.level}`, {
                fontSize: '8px',
                fill: '#e74c3c',
                fontWeight: 'bold'
            }).setOrigin(0.5);
            container.add(levelText);
        }
    }

    createActionButtons() {
        // 第一排按鈕
        // 裝備按鈕
        const equipBtn = this.createButton(140, 580, '裝備', 0x27ae60, () => {
            this.equipSelectedItem();
        });

        // 強化按鈕  
        const enhanceBtn = this.createButton(235, 580, '強化', 0xe74c3c, () => {
            this.enhanceSelectedItem();
        });

        // 第二排按鈕 (Y=620)
        // 合成按鈕
        const synthesizeBtn = this.createButton(140, 620, '合成', 0xf39c12, () => {
            this.synthesizeItems();
        });

        // 丟棄按鈕
        const discardBtn = this.createButton(235, 620, '丟棄', 0x95a5a6, () => {
            this.discardSelectedItem();
        });
    }

    createButton(x, y, text, color, callback) {
        const buttonBg = this.add.rectangle(0, 0, 80, 35, color, 1);
        buttonBg.setStrokeStyle(2, color - 0x111111);
        
        const buttonText = this.add.text(0, 0, text, {
            fontSize: '14px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        const button = this.add.container(x, y, [buttonBg, buttonText]);
        button.setSize(80, 35);
        button.setInteractive({ useHandCursor: true });
        
        button.on('pointerover', () => {
            buttonBg.setFillStyle(color - 0x222222);
            button.setScale(1.05);
        });

        button.on('pointerout', () => {
            buttonBg.setFillStyle(color);
            button.setScale(1);
        });

        button.on('pointerdown', () => {
            button.setScale(0.95);
            this.time.delayedCall(100, () => {
                button.setScale(1.05);
                callback();
            });
        });

        return button;
    }

    selectInventoryItem(index) {
        if (index < this.equipmentInventory.length) {
            this.selectedInventoryItem = this.equipmentInventory[index];
            this.highlightSelectedItem(index);
            this.showEquipmentDetails(this.selectedInventoryItem);
        }
    }

    showEquipmentDetails(equipment) {
        // 移除之前的詳細信息
        if (this.equipmentDetailsText) {
            this.equipmentDetailsText.destroy();
        }

        let detailsText = `${equipment.name}\n`;
        
        // 根據品質顯示顏色
        const qualityNames = ['普通', '精良', '稀有', '史詩'];
        const qualityColors = ['#ffffff', '#3498db', '#f1c40f', '#9b59b6'];
        detailsText += `品質: ${qualityNames[equipment.quality]}\n`;
        
        if (equipment.level > 0) {
            detailsText += `強化等級: +${equipment.level}\n`;
        }
        
        if (equipment.baseAttack) {
            const totalAttack = equipment.baseAttack + (equipment.level * 2);
            detailsText += `攻擊力: ${totalAttack}\n`;
        }
        
        if (equipment.baseDefense) {
            const totalDefense = equipment.baseDefense + (equipment.level * 1);
            detailsText += `防禦力: ${totalDefense}\n`;
        }

        this.equipmentDetailsText = this.add.text(187.5, 250, detailsText, {
            fontSize: '11px',
            fill: qualityColors[equipment.quality],
            fontWeight: 'bold',
            align: 'center',
            backgroundColor: 0x000000,
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5);
    }

    clearAllHighlights() {
        // 重置所有高亮
        this.inventoryItems.forEach(slot => {
            slot.background.clear();
            slot.background.fillStyle(0x34495e, 0.5);
            slot.background.fillRoundedRect(slot.container.x - 25, slot.container.y - 25, 50, 50, 5);
            slot.background.lineStyle(1, 0x7f8c8d);
            slot.background.strokeRoundedRect(slot.container.x - 25, slot.container.y - 25, 50, 50, 5);
        });
    }

    highlightSelectedItem(index) {
        // 先清除所有高亮
        this.clearAllHighlights();

        // 高亮選中的物品
        if (index < this.inventoryItems.length && index >= 0) {
            const slot = this.inventoryItems[index];
            slot.background.clear();
            slot.background.fillStyle(0x34495e, 0.5);
            slot.background.fillRoundedRect(slot.container.x - 25, slot.container.y - 25, 50, 50, 5);
            slot.background.lineStyle(3, 0xe74c3c);
            slot.background.strokeRoundedRect(slot.container.x - 25, slot.container.y - 25, 50, 50, 5);
        }
    }

    equipSelectedItem() {
        if (!this.selectedInventoryItem) {
            this.showMessage('請先選擇要裝備的物品', 0xe74c3c);
            return;
        }

        const result = GameDatabase.equipItem(this.selectedInventoryItem);
        this.playerEquipment = result.equipment;
        this.equipmentInventory = result.inventory;
        this.selectedInventoryItem = null;

        // 清除所有高亮
        this.clearAllHighlights();

        this.refreshDisplay();
        this.showMessage('裝備成功！', 0x27ae60);
    }

    unequipItem(equipmentType) {
        if (!this.playerEquipment[equipmentType]) {
            return;
        }

        const result = GameDatabase.unequipItem(equipmentType);
        this.playerEquipment = result.equipment;
        this.equipmentInventory = result.inventory;

        this.refreshDisplay();
        this.showMessage('卸下裝備成功！', 0x27ae60);
    }

    enhanceSelectedItem() {
        if (!this.selectedInventoryItem) {
            this.showMessage('請先選擇要強化的裝備', 0xe74c3c);
            return;
        }

        if (this.selectedInventoryItem.level >= 10) {
            this.showMessage('裝備已達最高強化等級！', 0xe67e22);
            return;
        }

        const cost = (this.selectedInventoryItem.level + 1) * 100;
        const currentMoney = GameDatabase.loadMoney();

        if (currentMoney < cost) {
            this.showMessage(`金錢不足！需要 ${cost} 金錢`, 0xe74c3c);
            return;
        }

        // 強化成功
        GameDatabase.spendMoney(cost);
        this.selectedInventoryItem.level += 1;
        GameDatabase.saveEquipmentInventory(this.equipmentInventory);

        this.refreshDisplay();
        this.showMessage(`強化成功！等級提升至 +${this.selectedInventoryItem.level}`, 0x27ae60);
    }

    synthesizeItems() {
        // 收集所有可合成的裝備
        const synthesizableGroups = this.findSynthesizableGroups();
        
        console.log('可合成的裝備組:', synthesizableGroups); // 調試信息
        console.log('當前裝備背包:', this.equipmentInventory); // 調試信息
        
        if (synthesizableGroups.length === 0) {
            this.showMessage('沒有可合成的裝備！需要兩個相同類型、名稱和品質的裝備', 0xe74c3c);
            return;
        }

        // 顯示合成選項
        this.showSynthesizeOptions(synthesizableGroups);
    }

    discardSelectedItem() {
        if (!this.selectedInventoryItem) {
            this.showMessage('請先選擇要丟棄的裝備', 0xe74c3c);
            return;
        }

        // 顯示確認對話框
        this.showDiscardConfirmation(this.selectedInventoryItem);
    }

    showDiscardConfirmation(equipment) {
        // 創建確認對話框
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.8);
        overlay.fillRect(0, 0, 375, 667);
        overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, 375, 667), Phaser.Geom.Rectangle.Contains);
        
        overlay.on('pointerdown', () => {
            // 空的處理器，阻止事件冒泡
        });

        const panel = this.add.graphics();
        panel.fillStyle(0x2c3e50, 0.95);
        panel.fillRoundedRect(75, 250, 225, 167, 10);
        panel.lineStyle(3, 0xe74c3c);
        panel.strokeRoundedRect(75, 250, 225, 167, 10);
        panel.setInteractive(new Phaser.Geom.Rectangle(75, 250, 225, 167), Phaser.Geom.Rectangle.Contains);
        
        panel.on('pointerdown', () => {
            // 空的處理器，阻止事件冒泡
        });

        // 確認訊息
        const titleText = this.add.text(187.5, 280, '確認丟棄', {
            fontSize: '18px',
            fill: '#e74c3c',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        const confirmText = this.add.text(187.5, 310, `確定要丟棄 ${equipment.name}`, {
            fontSize: '14px',
            fill: '#ecf0f1',
            align: 'center'
        }).setOrigin(0.5);

        const warningText = this.add.text(187.5, 330, '此操作無法復原！', {
            fontSize: '12px',
            fill: '#f39c12',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // 收集所有要銷毀的元素
        const elementsToDestroy = [overlay, panel, titleText, confirmText, warningText];

        // 確認按鈕
        const confirmBtn = this.createButton(130, 370, '確認', 0xe74c3c, () => {
            this.performDiscard(equipment);
            elementsToDestroy.forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
        });

        // 取消按鈕
        const cancelBtn = this.createButton(245, 370, '取消', 0x95a5a6, () => {
            elementsToDestroy.forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
        });

        elementsToDestroy.push(confirmBtn, cancelBtn);
    }

    performDiscard(equipment) {
        // 從背包中移除裝備
        const index = this.equipmentInventory.findIndex(item => item.id === equipment.id);
        if (index !== -1) {
            this.equipmentInventory.splice(index, 1);
            
            // 保存數據
            GameDatabase.saveEquipmentInventory(this.equipmentInventory);
            
            // 清除選中狀態
            this.selectedInventoryItem = null;
            
            // 清除所有高亮
            this.clearAllHighlights();
            
            // 刷新顯示
            this.refreshDisplay();
            
            this.showMessage(`已丟棄 ${equipment.name}`, 0x95a5a6);
        }
    }

    findSynthesizableGroups() {
        const groups = {};
        
        // 按類型、名稱、品質分組
        this.equipmentInventory.forEach((equipment, index) => {
            if (equipment.quality < 3) { // 只有非紫色品質才能合成
                const key = `${equipment.type}_${equipment.name}_${equipment.quality}`;
                if (!groups[key]) {
                    groups[key] = [];
                }
                groups[key].push({ equipment, index });
            }
        });

        // 只返回有2個或以上相同裝備的組
        return Object.entries(groups)
            .filter(([key, items]) => items.length >= 2)
            .map(([key, items]) => ({
                key,
                items: items, // 返回所有相同的裝備供選擇
                result: this.previewSynthesizeResult(items[0].equipment)
            }));
    }

    previewSynthesizeResult(equipment) {
        return {
            type: equipment.type,
            name: GameDatabase.getUpgradedEquipmentName(equipment.name, equipment.quality + 1),
            quality: equipment.quality + 1,
            level: 0,
            baseAttack: equipment.baseAttack ? Math.floor(equipment.baseAttack * 1.5) : undefined,
            baseDefense: equipment.baseDefense ? Math.floor(equipment.baseDefense * 1.5) : undefined
        };
    }

    showSynthesizeOptions(groups) {
        // 創建合成選項界面
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, 375, 667);
        overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, 375, 667), Phaser.Geom.Rectangle.Contains);
        
        // 添加空的點擊事件處理器來阻止點擊穿透
        overlay.on('pointerdown', () => {
            // 空的處理器，阻止事件冒泡到背景
        });

        const panel = this.add.graphics();
        panel.fillStyle(0x2c3e50, 0.95);
        panel.fillRoundedRect(50, 150, 275, 350, 10);
        panel.lineStyle(3, 0x3498db);
        panel.strokeRoundedRect(50, 150, 275, 350, 10);
        panel.setInteractive(new Phaser.Geom.Rectangle(50, 150, 275, 350), Phaser.Geom.Rectangle.Contains);
        
        // 添加空的點擊事件處理器
        panel.on('pointerdown', () => {
            // 空的處理器，阻止事件冒泡
        });

        const titleText = this.add.text(187.5, 180, '選擇要合成的裝備', {
            fontSize: '18px',
            fill: '#ecf0f1',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // 收集所有要銷毀的元素
        const elementsToDestroy = [overlay, panel, titleText];

        // 顯示合成選項
        groups.forEach((group, index) => {
            const y = 220 + index * 60;
            const optionElements = this.createSynthesizeOption(group, 187.5, y, elementsToDestroy);
            elementsToDestroy.push(...optionElements);
        });

        // 關閉按鈕
        const closeBtn = this.createButton(187.5, 460, '關閉', 0x95a5a6, () => {
            elementsToDestroy.forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
        });
        
        elementsToDestroy.push(closeBtn);
    }

    createSynthesizeOption(group, x, y, elementsToDestroy) {
        const equipment = group.items[0].equipment;
        const result = group.result;

        // 合成選項背景
        const optionBg = this.add.graphics();
        optionBg.fillStyle(0x34495e, 0.8);
        optionBg.fillRoundedRect(x - 120, y - 20, 240, 40, 5);
        optionBg.lineStyle(1, 0x7f8c8d);
        optionBg.strokeRoundedRect(x - 120, y - 20, 240, 40, 5);

        // 創建一個透明的互動區域
        const interactiveArea = this.add.rectangle(x, y, 240, 40, 0x000000, 0);
        interactiveArea.setInteractive({ useHandCursor: true });

        // 品質顏色
        const qualityColors = ['#ffffff', '#3498db', '#f1c40f', '#9b59b6'];
        const currentQualityColor = qualityColors[equipment.quality];
        const nextQualityColor = qualityColors[result.quality];

        // 顯示合成信息
        const text = `${equipment.name} (x${group.items.length}) → ${result.name}`;
        const optionText = this.add.text(x, y, text, {
            fontSize: '12px',
            fill: '#ecf0f1',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // 設置互動事件
        interactiveArea.on('pointerdown', () => {
            console.log('合成選項被點擊:', group); // 調試信息
            // 銷毀當前界面
            elementsToDestroy.forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            // 顯示裝備選擇界面
            this.showEquipmentSelectionForSynthesis(group);
        });

        interactiveArea.on('pointerover', () => {
            optionBg.clear();
            optionBg.fillStyle(0x5d6d7e, 0.8);
            optionBg.fillRoundedRect(x - 120, y - 20, 240, 40, 5);
            optionBg.lineStyle(2, 0x3498db);
            optionBg.strokeRoundedRect(x - 120, y - 20, 240, 40, 5);
        });

        interactiveArea.on('pointerout', () => {
            optionBg.clear();
            optionBg.fillStyle(0x34495e, 0.8);
            optionBg.fillRoundedRect(x - 120, y - 20, 240, 40, 5);
            optionBg.lineStyle(1, 0x7f8c8d);
            optionBg.strokeRoundedRect(x - 120, y - 20, 240, 40, 5);
        });
        
        return [optionBg, optionText, interactiveArea];
    }

    showEquipmentSelectionForSynthesis(group) {
        // 創建選擇界面
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, 375, 667);
        overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, 375, 667), Phaser.Geom.Rectangle.Contains);
        
        overlay.on('pointerdown', () => {
            // 空的處理器，阻止事件冒泡
        });

        const panel = this.add.graphics();
        panel.fillStyle(0x2c3e50, 0.95);
        panel.fillRoundedRect(30, 100, 315, 467, 10);
        panel.lineStyle(3, 0x3498db);
        panel.strokeRoundedRect(30, 100, 315, 467, 10);
        panel.setInteractive(new Phaser.Geom.Rectangle(30, 100, 315, 467), Phaser.Geom.Rectangle.Contains);
        
        panel.on('pointerdown', () => {
            // 空的處理器，阻止事件冒泡
        });

        const titleText = this.add.text(187.5, 130, `選擇要合成的 ${group.items[0].equipment.name}`, {
            fontSize: '16px',
            fill: '#ecf0f1',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        const instructionText = this.add.text(187.5, 155, '請選擇兩個裝備來合成', {
            fontSize: '12px',
            fill: '#bdc3c7',
        }).setOrigin(0.5);

        // 收集所有要銷毀的元素
        const elementsToDestroy = [overlay, panel, titleText, instructionText];
        
        // 選擇狀態
        let selectedItems = [];

        // 顯示所有相同的裝備供選擇
        group.items.forEach((item, index) => {
            const equipment = item.equipment;
            const row = Math.floor(index / 3);
            const col = index % 3;
            const x = 80 + col * 80;
            const y = 200 + row * 80;

            const elements = this.createSelectableEquipmentItem(equipment, item.index, x, y, selectedItems, elementsToDestroy);
            elementsToDestroy.push(...elements);
        });

        // 合成按鈕
        const synthesizeBtn = this.createButton(120, 520, '合成', 0x27ae60, () => {
            if (selectedItems.length === 2) {
                this.performSelectedSynthesize(selectedItems);
                elementsToDestroy.forEach(element => {
                    if (element && element.destroy) {
                        element.destroy();
                    }
                });
            } else {
                this.showMessage('請選擇兩個裝備！', 0xe74c3c);
            }
        });

        // 取消按鈕
        const cancelBtn = this.createButton(255, 520, '取消', 0x95a5a6, () => {
            elementsToDestroy.forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
        });

        elementsToDestroy.push(synthesizeBtn, cancelBtn);
    }

    createSelectableEquipmentItem(equipment, originalIndex, x, y, selectedItems, elementsToDestroy) {
        // 根據品質設置背景顏色
        const qualityColors = [0xffffff, 0x3498db, 0xf1c40f, 0x9b59b6]; // 白藍金紫
        const qualityBorderColors = [0xe8e8e8, 0x2980b9, 0xe67e22, 0x8e44ad]; // 對應的邊框顏色
        const bgColor = qualityColors[equipment.quality];
        const borderColor = qualityBorderColors[equipment.quality];
        
        // 裝備背景
        const itemBg = this.add.graphics();
        itemBg.fillStyle(bgColor, 0.3);
        itemBg.fillRoundedRect(x - 30, y - 30, 60, 60, 8);
        itemBg.lineStyle(2, borderColor);
        itemBg.strokeRoundedRect(x - 30, y - 30, 60, 60, 8);

        // 互動區域
        const interactiveArea = this.add.rectangle(x, y, 60, 60, 0x000000, 0);
        interactiveArea.setInteractive({ useHandCursor: true });

        // 裝備圖標
        const icons = {
            weapon: '⚔️',
            armor: '🥼',
            shield: '🛡️',
            boots: '👢'
        };

        const icon = this.add.text(x, y - 8, icons[equipment.type], {
            fontSize: '20px'
        }).setOrigin(0.5);

        // 強化等級顯示
        let levelText = null;
        if (equipment.level > 0) {
            levelText = this.add.text(x, y + 15, `+${equipment.level}`, {
                fontSize: '10px',
                fill: '#e74c3c',
                fontWeight: 'bold'
            }).setOrigin(0.5);
        }

        // 點擊事件
        interactiveArea.on('pointerdown', () => {
            const itemData = { equipment, originalIndex };
            
            // 檢查是否已選中
            const existingIndex = selectedItems.findIndex(item => item.originalIndex === originalIndex);
            
            if (existingIndex >= 0) {
                // 取消選中 - 恢復品質顏色
                selectedItems.splice(existingIndex, 1);
                itemBg.clear();
                itemBg.fillStyle(bgColor, 0.3);
                itemBg.fillRoundedRect(x - 30, y - 30, 60, 60, 8);
                itemBg.lineStyle(2, borderColor);
                itemBg.strokeRoundedRect(x - 30, y - 30, 60, 60, 8);
            } else if (selectedItems.length < 2) {
                // 選中 - 使用綠色高亮但保持品質色調
                selectedItems.push(itemData);
                itemBg.clear();
                itemBg.fillStyle(0x27ae60, 0.6);
                itemBg.fillRoundedRect(x - 30, y - 30, 60, 60, 8);
                itemBg.lineStyle(4, 0x27ae60);
                itemBg.strokeRoundedRect(x - 30, y - 30, 60, 60, 8);
                
                // 在選中狀態下添加品質顏色的內邊框
                itemBg.lineStyle(2, borderColor);
                itemBg.strokeRoundedRect(x - 27, y - 27, 54, 54, 6);
            } else {
                this.showMessage('最多只能選擇兩個裝備！', 0xe74c3c);
            }
        });

        const elements = [itemBg, interactiveArea, icon];
        if (levelText) {
            elements.push(levelText);
        }
        
        return elements;
    }

    performSelectedSynthesize(selectedItems) {
        const item1 = selectedItems[0];
        const item2 = selectedItems[1];

        // 創建新裝備
        const newEquipment = GameDatabase.synthesizeEquipment(item1.equipment, item2.equipment);
        
        console.log('選擇合成結果:', newEquipment); // 調試信息
        
        if (newEquipment) {
            // 移除原有的兩個裝備（按索引從大到小移除，避免索引位移問題）
            const indices = [item1.originalIndex, item2.originalIndex].sort((a, b) => b - a);
            indices.forEach(index => {
                this.equipmentInventory.splice(index, 1);
            });
            
            // 添加新裝備
            this.equipmentInventory.push(newEquipment);
            
            // 保存數據
            GameDatabase.saveEquipmentInventory(this.equipmentInventory);
            
            // 清除選中狀態和高亮
            this.selectedInventoryItem = null;
            this.clearAllHighlights();
            
            // 刷新顯示
            this.refreshDisplay();
            
            this.showMessage(`合成成功！獲得 ${newEquipment.name}`, 0x27ae60);
        } else {
            this.showMessage('合成失敗！', 0xe74c3c);
        }
    }

    performSynthesize(group) {
        console.log('執行合成:', group); // 調試信息
        
        const item1 = group.items[0];
        const item2 = group.items[1];

        // 創建新裝備
        const newEquipment = GameDatabase.synthesizeEquipment(item1.equipment, item2.equipment);
        
        console.log('合成結果:', newEquipment); // 調試信息
        
        if (newEquipment) {
            // 移除原有的兩個裝備
            this.equipmentInventory.splice(Math.max(item1.index, item2.index), 1);
            this.equipmentInventory.splice(Math.min(item1.index, item2.index), 1);
            
            // 添加新裝備
            this.equipmentInventory.push(newEquipment);
            
            // 保存數據
            GameDatabase.saveEquipmentInventory(this.equipmentInventory);
            
            // 清除選中狀態和高亮
            this.selectedInventoryItem = null;
            this.clearAllHighlights();
            
            // 刷新顯示
            this.refreshDisplay();
            
            this.showMessage(`合成成功！獲得 ${newEquipment.name}`, 0x27ae60);
        } else {
            this.showMessage('合成失敗！', 0xe74c3c);
        }
    }

    refreshDisplay() {
        // 更新金錢顯示
        this.moneyText.setText(`💰 ${GameDatabase.loadMoney()}`);

        // 更新裝備槽
        Object.keys(this.equipmentSlots).forEach(type => {
            const equipment = this.playerEquipment[type];
            const slot = this.equipmentSlots[type];
            
            slot.removeAll(true);
            
            if (equipment) {
                this.displayEquipmentInSlot(slot, equipment);
            } else {
                const icons = { weapon: '⚔️', armor: '🥼', shield: '🛡️', boots: '👢' };
                const defaultIcon = this.add.text(0, 0, icons[type], {
                    fontSize: '24px'
                }).setOrigin(0.5);
                slot.add(defaultIcon);
            }
        });

        // 更新背包顯示
        this.updateInventoryDisplay();

        // 更新玩家狀態
        this.updatePlayerStats();
    }

    updatePlayerStats() {
        let totalAttack = GameDatabase.loadAttack();
        let totalDefense = GameDatabase.loadDefense();

        // 計算裝備加成
        Object.values(this.playerEquipment).forEach(equipment => {
            if (equipment) {
                if (equipment.baseAttack) {
                    totalAttack += equipment.baseAttack + (equipment.level * 2);
                }
                if (equipment.baseDefense) {
                    totalDefense += equipment.baseDefense + (equipment.level * 1);
                }
            }
        });

        // 顯示玩家狀態
        if (this.playerStatsText) {
            this.playerStatsText.destroy();
        }

        this.playerStatsText = this.add.text(187.5, 175, `攻擊: ${totalAttack}\n防禦: ${totalDefense}`, {
            fontSize: '12px',
            fill: '#ecf0f1',
            fontWeight: 'bold',
            align: 'center'
        }).setOrigin(0.5);
    }

    showMessage(text, color = 0xffffff) {
        if (this.messageText) {
            this.messageText.destroy();
        }

        this.messageText = this.add.text(187.5, 50, text, {
            fontSize: '14px',
            fill: color,
            fontWeight: 'bold',
            backgroundColor: 0x000000,
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
            if (this.messageText) {
                this.messageText.destroy();
                this.messageText = null;
            }
        });
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
        
        // 初始化攻擊力和防禦力（包含裝備加成）
        this.calculatePlayerStats();
    }

    calculatePlayerStats() {
        // 基礎攻擊力和防禦力
        let totalAttack = GameDatabase.loadAttack();
        let totalDefense = GameDatabase.loadDefense();

        // 載入裝備並計算加成
        const playerEquipment = GameDatabase.loadEquippedItems();
        
        Object.values(playerEquipment).forEach(equipment => {
            if (equipment) {
                if (equipment.baseAttack) {
                    totalAttack += equipment.baseAttack + (equipment.level * 2);
                }
                if (equipment.baseDefense) {
                    totalDefense += equipment.baseDefense + (equipment.level * 1);
                }
            }
        });

        this.playerAttack = totalAttack;
        this.playerDefense = totalDefense;
        
        console.log(`玩家總攻擊力: ${totalAttack}, 總防禦力: ${totalDefense}`); // 調試信息
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

    // 處理裝備事件
    handleEquipmentEvent(event) {
        // 更新關卡
        this.currentLevel++;
        
        // 更新關卡顯示
        this.levelText.setText(`第 ${this.currentLevel-1} 關`);
        
        // 嘗試添加裝備到背包
        const equipment = event.equipment;
        const added = GameDatabase.addEquipmentToInventory(equipment);
        
        // 準備訊息
        const qualityColors = ['⚪', '🔵', '🟡', '🟣']; // 白、藍、金、紫
        const qualityColor = qualityColors[equipment.quality] || '⚪';
        
        let resultMessage = "";
        if (added) {
            this.playSound('eventPositive');
            resultMessage = `⚔️ 獲得裝備：${qualityColor} ${equipment.name} (+${equipment.enhancement})\n\n💰 總金錢: ${this.playerMoney}`;
        } else {
            this.playSound('eventNegative');
            resultMessage = `📦 背包已滿！無法獲得 ${qualityColor} ${equipment.name}！\n\n💰 總金錢: ${this.playerMoney}`;
        }
        
        // 顯示事件結果
        this.eventText.setText(
            `${event.description}\n\n${event.effect.message}\n\n${resultMessage}`
        );
        
        // 恢復下一關按鈕
        this.nextLevelButton.setVisible(true);
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
        
        // 檢查是否為裝備類型事件
        if (randomEvent.type === "equipment") {
            this.handleEquipmentEvent(randomEvent);
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
        let soundPlayed = false;
        if (maxHealthChange === 0) {
            if (healthChange > 0 || fullHeal) {
                this.playSound('eventPositive');
                soundPlayed = true;
            } else if (healthChange < 0) {
                this.playSound('eventNegative');
                soundPlayed = true;
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
        
        // 顯示初始戰鬥狀態，只顯示怪物血量和戰鬥記錄
        const initialStatus = `🐺 ${this.battleData.monster.name}: ${this.battleData.monster.health}/${this.battleData.monster.maxHealth} HP\n\n` +
                            `📝 戰鬥記錄:\n戰鬥開始！遭遇 ${this.battleData.monster.name}！`;
        
        this.eventText.setText(initialStatus);
        this.battleMessages.push(`戰鬥開始！遭遇 ${this.battleData.monster.name}！`);
        
        // 清理現有的戰鬥元素
        if (this.battleElements) {
            this.battleElements.forEach(element => element.destroy());
        }
        this.battleElements = [];
        
        // 創建怪物圖片（右側，與玩家水平對齊）
        const monsterBg = this.add.rectangle(280, 300, 80, 80, 0x8b4513);
        monsterBg.setStrokeStyle(3, 0x654321);
        this.battleElements.push(monsterBg);
        
        // 怪物名稱
        const monsterNameText = this.add.text(280, 250, this.battleData.monster.name, {
            fontSize: '14px',
            fill: '#8b4513',
            fontWeight: 'bold',
            align: 'center'
        }).setOrigin(0.5);
        this.battleElements.push(monsterNameText);
        
        // 怪物血量背景
        const monsterHealthBg = this.add.rectangle(280, 360, 100, 15, 0x2c3e50);
        monsterHealthBg.setStrokeStyle(1, 0x34495e);
        this.battleElements.push(monsterHealthBg);
        
        // 怪物血量條 (綠色)
        this.monsterHealthBar = this.add.rectangle(230, 360, 100, 13, 0x27ae60);
        this.monsterHealthBar.setOrigin(0, 0.5);
        this.battleElements.push(this.monsterHealthBar);
        
        // 怪物血量文字
        this.monsterHealthText = this.add.text(280, 375, 
            `${this.battleData.monster.health}/${this.battleData.monster.maxHealth}`, {
            fontSize: '11px',
            fill: '#2c3e50',
            fontWeight: 'bold',
            align: 'center'
        }).setOrigin(0.5);
        this.battleElements.push(this.monsterHealthText);
        
        // 初始化血量條顯示
        this.updateBattleDisplay();
    }

    // 開始戰鬥循環
    startBattleLoop() {
        if (!this.battleData.battleActive) return;
        
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
        
        // 更新主要文字框內容，只顯示怪物血量和戰鬥記錄
        const battleStatus = `🐺 ${this.battleData.monster.name}: ${this.battleData.monster.health}/${this.battleData.monster.maxHealth} HP\n\n` +
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
    scene: [StartScene, UpgradeScene, EquipmentScene, GameScene]
};

// 啟動遊戲
const game = new Phaser.Game(config);