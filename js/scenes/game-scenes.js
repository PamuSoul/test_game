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

        // 標題
        this.add.text(50, yPos, '🛡️ 防禦力強化', {
            fontSize: '18px',
            fill: '#3498db',
            fontWeight: 'bold'
        }).setOrigin(0, 0.5);

        // 描述
        this.add.text(50, yPos + 25, `提升防禦力 +2`, {
            fontSize: '13px',
            fill: '#2c3e50'
        }).setOrigin(0, 0.5);

        // 價格
        this.add.text(50, yPos + 45, `費用: ${cost} 金錢`, {
            fontSize: '13px',
            fill: '#f39c12',
            fontWeight: 'bold'
        }).setOrigin(0, 0.5);

        // 購買按鈕
        this.createUpgradeButton(280, yPos + 30, cost, () => {
            // 花費金錢，成功後增加升級數並套用效果
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
        this.selectedInventoryItem = null;
        this.inventoryItems = [];
        this.equipmentSlotsDisplay = {};
        this.equipmentDetailsText = null;
        this.playerStatsText = null;
        this.moneyText = null;
    }

    preload() {
        // 載入背景圖片
        try {
            this.load.image('backgroundImg', ASSETS.images.background);
        } catch (error) {
            console.error('EquipmentScene 載入背景圖片錯誤:', error);
        }
        
        this.load.on('loaderror', (file) => {
            console.error('EquipmentScene 載入失敗:', file.src);
            // 立即創建備用背景
            this.createFallbackBackground();
        });
        
        this.load.on('complete', () => {
            if (!this.textures.exists('backgroundImg')) {
                this.createFallbackBackground();
            }
        });
    }

    createFallbackBackground() {
        if (!this.textures.exists('backgroundImg')) {
            this.add.graphics()
                .fillGradientStyle(0x2c3e50, 0x2c3e50, 0x34495e, 0x34495e)
                .fillRect(0, 0, 375, 667)
                .generateTexture('backgroundImg', 375, 667);
        }
    }

    create() {
        try {
            // 確保背景圖片存在
            if (!this.textures.exists('backgroundImg')) {
                this.createFallbackBackground();
            }
            
            // 載入裝備數據
            this.loadEquipmentData();
            
            // 建立UI元素
            this.createBackground();
            this.createPlayerSection();
            this.createEquipmentSlots();
            this.createInventorySection();
            this.createActionButtons();
            this.createNavigationButtons();
            
            console.log('EquipmentScene create 完成');
        } catch (error) {
            console.error('EquipmentScene create 錯誤:', error);
            // 創建一個基本的錯誤場景
            this.add.rectangle(187.5, 333.5, 375, 667, 0x2c3e50);
            this.add.text(187.5, 333.5, '裝備頁面載入失敗\n請返回首頁', {
                fontSize: '20px',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
            
            // 返回按鈕
            const backButton = this.add.text(50, 50, '← 返回', {
                fontSize: '18px',
                fill: '#e74c3c',
                fontWeight: 'bold'
            }).setOrigin(0.5);

            backButton.setInteractive({ useHandCursor: true });
            backButton.on('pointerdown', () => {
                this.scene.start('StartScene');
            });
        }
    }

    loadEquipmentData() {
        try {
            console.log('載入已裝備物品...');
            this.playerEquipment = GameDatabase.loadEquippedItems();
            console.log('已裝備物品:', this.playerEquipment);
            
            console.log('載入裝備背包...');
            this.equipmentInventory = GameDatabase.loadEquipmentInventory();
            console.log('裝備背包:', this.equipmentInventory);
        } catch (error) {
            console.error('載入裝備數據時發生錯誤:', error);
            // 設置默認值
            this.playerEquipment = {
                weapon: null,
                armor: null,
                shield: null,
                boots: null
            };
            this.equipmentInventory = [];
        }
    }

    createBackground() {
        // 背景顏色 - 深色主題
        this.add.rectangle(187.5, 333.5, 375, 667, 0x34495e);
    }

    createPlayerSection() {
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

    updatePlayerStats() {
        // 計算總屬性
        const baseAttack = GameDatabase.loadAttack();
        const baseDefense = GameDatabase.loadDefense();
        const totalAttack = baseAttack + this.calculateEquipmentBonus('attack');
        const totalDefense = baseDefense + this.calculateEquipmentBonus('defense');

        // 清除之前的狀態顯示
        if (this.playerStatsText) {
            this.playerStatsText.destroy();
        }

        // 顯示總屬性 - 垂直排列，與原版一致
        this.playerStatsText = this.add.text(187.5, 175, `攻擊: ${totalAttack}\n防禦: ${totalDefense}`, {
            fontSize: '12px',
            fill: '#ecf0f1',
            fontWeight: 'bold',
            align: 'center'
        }).setOrigin(0.5);
    }

    createEquipmentSlots() {
        // 裝備槽位配置 - 四個角落排列
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

        this.equipmentSlotsDisplay[config.type] = slotContent;
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
        inventoryBg.fillRoundedRect(20, 310, 335, 340, 10);
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
        const rows = 4;
        const totalWidth = (cols - 1) * gridSize;
        const startX = (375 - totalWidth) / 2;
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
        // 第一排按鈕 (Y=590)
        const firstRowY = 590;
        
        // 裝備按鈕
        this.createButton(140, firstRowY, '裝備', 0x27ae60, () => {
            this.equipSelectedItem();
        });

        // 強化按鈕  
        this.createButton(235, firstRowY, '強化', 0xe74c3c, () => {
            this.enhanceSelectedItem();
        });

        // 第二排按鈕 (Y=630)
        const secondRowY = 630;
        
        // 合成按鈕
        this.createButton(140, secondRowY, '合成', 0xf39c12, () => {
            this.synthesizeItems();
        });

        // 丟棄按鈕
        this.createButton(235, secondRowY, '丟棄', 0x95a5a6, () => {
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
        } else {
            this.selectedInventoryItem = null;
            this.clearAllHighlights();
            if (this.equipmentDetailsText) {
                this.equipmentDetailsText.destroy();
                this.equipmentDetailsText = null;
            }
        }
    }

    highlightSelectedItem(index) {
        // 先清除所有高亮
        this.clearAllHighlights();

        // 高亮選中的物品
        if (index < this.inventoryItems.length && index >= 0) {
            const slot = this.inventoryItems[index];
            const x = slot.container.x;
            const y = slot.container.y;
            
            slot.background.clear();
            slot.background.fillStyle(0x34495e, 0.5);
            slot.background.fillRoundedRect(x - 25, y - 25, 50, 50, 5);
            slot.background.lineStyle(3, 0xe74c3c);
            slot.background.strokeRoundedRect(x - 25, y - 25, 50, 50, 5);
        }
    }

    clearAllHighlights() {
        // 重置所有高亮
        this.inventoryItems.forEach(slot => {
            const x = slot.container.x;
            const y = slot.container.y;
            
            slot.background.clear();
            slot.background.fillStyle(0x34495e, 0.5);
            slot.background.fillRoundedRect(x - 25, y - 25, 50, 50, 5);
            slot.background.lineStyle(1, 0x7f8c8d);
            slot.background.strokeRoundedRect(x - 25, y - 25, 50, 50, 5);
        });
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

        // 在背包區域上方顯示詳細信息
        this.equipmentDetailsText = this.add.text(187.5, 250, detailsText, {
            fontSize: '11px',
            fill: qualityColors[equipment.quality],
            fontWeight: 'bold',
            align: 'center',
            backgroundColor: 0x000000,
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5);
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
                items: items,
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
        
        overlay.on('pointerdown', () => {
            // 空的處理器，阻止事件冒泡
        });

        const panel = this.add.graphics();
        panel.fillStyle(0x2c3e50, 0.95);
        panel.fillRoundedRect(50, 150, 275, 350, 10);
        panel.lineStyle(3, 0x3498db);
        panel.strokeRoundedRect(50, 150, 275, 350, 10);
        panel.setInteractive(new Phaser.Geom.Rectangle(50, 150, 275, 350), Phaser.Geom.Rectangle.Contains);
        
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

        // 顯示合成信息
        const text = `${equipment.name} (x${group.items.length}) → ${result.name}`;
        const optionText = this.add.text(x, y, text, {
            fontSize: '12px',
            fill: '#ecf0f1',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // 設置互動事件
        interactiveArea.on('pointerdown', () => {
            // 銷毀當前界面
            elementsToDestroy.forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            // 執行合成
            this.performSynthesize(group.items.slice(0, 2));
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

    performSynthesize(selectedItems) {
        if (selectedItems.length < 2) {
            this.showMessage('合成需要至少兩個相同裝備', 0xe74c3c);
            return;
        }

        // 獲取合成結果
        const result = GameDatabase.synthesizeEquipment(selectedItems[0].equipment, selectedItems[1].equipment);
        
        if (result.success) {
            // 更新背包
            this.equipmentInventory = result.inventory;
            this.selectedInventoryItem = null;
            this.clearAllHighlights();
            this.refreshDisplay();
            this.showMessage(`合成成功！獲得 ${result.newEquipment.name}`, 0x27ae60);
        } else {
            this.showMessage('合成失敗！', 0xe74c3c);
        }
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

    calculateEquipmentBonus(statType) {
        try {
            let bonus = 0;
            if (this.playerEquipment && typeof this.playerEquipment === 'object') {
                Object.values(this.playerEquipment).forEach(equipment => {
                    if (equipment) {
                        if (statType === 'attack' && equipment.baseAttack) {
                            bonus += equipment.baseAttack + (equipment.level * 2);
                        } else if (statType === 'defense' && equipment.baseDefense) {
                            bonus += equipment.baseDefense + (equipment.level * 1);
                        }
                    }
                });
            }
            return bonus;
        } catch (error) {
            console.error(`計算裝備加成時發生錯誤 (${statType}):`, error);
            return 0;
        }
    }

    showMessage(message, color) {
        // 顯示訊息的簡單實現
        const messageText = this.add.text(187.5, 100, message, {
            fontSize: '14px',
            fill: color,
            fontWeight: 'bold',
            backgroundColor: 0x000000,
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5);

        // 2秒後自動消失
        this.time.delayedCall(2000, () => {
            if (messageText) {
                messageText.destroy();
            }
        });
    }

    refreshDisplay() {
        // 重新載入裝備數據
        this.loadEquipmentData();
        
        // 更新裝備槽位顯示
        const slotTypes = ['weapon', 'armor', 'shield', 'boots'];
        slotTypes.forEach(type => {
            const container = this.equipmentSlotsDisplay[type];
            if (container) {
                const equipment = this.playerEquipment[type];
                if (equipment) {
                    this.displayEquipmentInSlot(container, equipment);
                } else {
                    // 顯示默認圖標
                    container.removeAll(true);
                    const icons = { weapon: '⚔️', armor: '🥼', shield: '🛡️', boots: '👢' };
                    const defaultIcon = this.add.text(0, 0, icons[type], {
                        fontSize: '24px'
                    }).setOrigin(0.5);
                    container.add(defaultIcon);
                }
            }
        });
        
        // 更新背包顯示
        this.updateInventoryDisplay();
        
        // 更新玩家狀態
        this.updatePlayerStats();
        
        // 更新金錢顯示
        const currentMoney = GameDatabase.loadMoney();
        if (this.moneyText) {
            this.moneyText.setText(`💰 ${currentMoney}`);
        }
        
        // 清除選中狀態
        this.selectedInventoryItem = null;
        this.clearAllHighlights();
        
        // 清除裝備詳細信息
        if (this.equipmentDetailsText) {
            this.equipmentDetailsText.destroy();
            this.equipmentDetailsText = null;
        }
    }

    createNavigationButtons() {
        // 返回按鈕 - 根據 game_fixed.js 的樣式
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
        
        // 初始化臨時技能系統（單場遊戲有效）
        this.playerSkills = {};
        
        // 清理舊的永久技能數據（如果存在）
        localStorage.removeItem('playerSkills');
        
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
        try {
            this.load.image('backgroundImg', ASSETS.images.background);
            this.load.image('player', ASSETS.images.player);
            // 載入常見的怪物圖片（若新增怪物請在 assets.js 加入對應路徑並在此加入載入）
            try {
                this.load.image('wolf', ASSETS.images.wolf);
            } catch (e) {
                // 若資源未在 ASSETS 中宣告，忽略即可
            }
            try {
                this.load.image('wolf_king', ASSETS.images.wolf_king);
            } catch (e) {
                // 忽略
            }
        } catch (error) {
            console.error('GameScene 載入圖片錯誤:', error);
        }
        
        this.load.on('loaderror', (file) => {
            console.error('GameScene 載入失敗:', file.src);
            // 立即創建備用資源
            this.createFallbackGraphics();
        });
        
        this.load.on('complete', () => {
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
            fontFamily: 'Arial, sans-serif',
            fill: '#2c3e50',
            fontWeight: 'bold',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setOrigin(0.5);

        // 血量顯示
        this.healthText = this.add.text(187.5, 75, `血量: ${this.playerHealth}/${this.maxHealth}`, {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            fill: '#2c3e50',
            fontWeight: 'bold',
            stroke: '#ffffff',
            strokeThickness: 1
        }).setOrigin(0.5);

        // 血量條背景
        this.healthBarBg = this.add.image(187.5, 90, 'healthBarBgImg');
        this.healthBarBg.setOrigin(0.5);

        // 血量條（從左邊開始，所以X要調整）
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
            fontFamily: 'Arial, sans-serif',
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
            fontFamily: 'Arial, sans-serif',
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
        
        this.moneyText = this.add.text(347.5, 12.5, `💰 ${this.playerMoney}`, {
            fontSize: '11px',
            fontFamily: 'Arial, sans-serif',
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
            fontFamily: 'Arial, sans-serif',
            fill: '#2c3e50',
            wordWrap: { width: 305 },
            lineSpacing: 3
        });

        // 下一關按鈕
        const buttonBg = this.add.rectangle(0, 0, 200, 60, 0x3498db, 1);
        buttonBg.setStrokeStyle(3, 0x2980b9);
        
        const buttonText = this.add.text(0, 0, '下一關', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
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
        
        // 初始化顯示
        this.updateDisplay();
        
        // 調試信息：檢查技能載入狀態
        console.log('GameScene 技能載入狀態:', this.playerSkills);
        if (this.playerSkills['dual_strike']) {
            console.log('二刀流技能已載入:', this.playerSkills['dual_strike']);
        } else {
            console.log('未發現二刀流技能');
        }
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
        this.levelText.setText(`第 ${this.currentLevel} 關`);
        
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

    // 商店事件
    showShopEvent(event) {
        console.log('商店事件:', event);
        
        // 更新關卡
        this.currentLevel++;
        this.levelText.setText(`第 ${this.currentLevel} 關`);
        
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
        
        // 添加「什麼都不買」選項
        this.createNothingButton();
    }
    
    // 創建「離開」按鈕
    createNothingButton() {
        const buttonX = 180; // 中間位置
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
        
        // 應用物品效果
        if (item.effect.health) {
            this.playerHealth += item.effect.health;
            this.playerHealth = Math.min(this.maxHealth, this.playerHealth);
        }
        
        // 處理最大血量提升（臨時的，不儲存到localStorage）
        if (item.effect.maxHealth) {
            this.maxHealth += item.effect.maxHealth;
        }
        
        // 處理攻擊力提升（臨時的，不儲存到永久資料庫）
        if (item.effect.attack) {
            this.playerAttack += item.effect.attack;
        }
        
        // 處理防禦力提升（臨時的，不儲存到永久資料庫）
        if (item.effect.defense) {
            this.playerDefense += item.effect.defense;
        }
        
        // 更新顯示
        this.updateDisplay();
        
        // 清理商店按鈕
        if (this.shopButtons) {
            this.shopButtons.forEach(button => button.destroy());
            this.shopButtons = [];
        }
        
        // 顯示購買結果
        this.eventText.setText(
            `✅ 購買成功！\n\n${item.effect.message}\n\n💰 剩餘金錢: ${this.playerMoney}`
        );
        
        // 恢復下一關按鈕
        this.nextLevelButton.setVisible(true);
    }
    
    // 離開商店
    leaveShop() {
        // 清理商店按鈕
        if (this.shopButtons) {
            this.shopButtons.forEach(button => button.destroy());
            this.shopButtons = [];
        }
        
        // 顯示離開訊息
        this.eventText.setText('你決定什麼都不買就離開了。\n\n商人揮手道別：「有需要再來啊！」');
        
        // 恢復下一關按鈕
        this.nextLevelButton.setVisible(true);
    }

    // 技能商店事件
    showSkillShopEvent(event) {
        console.log('技能商店事件:', event);
        
        // 更新關卡
        this.currentLevel++;
        this.levelText.setText(`第 ${this.currentLevel} 關`);
        
        // 隱藏原本的下一關按鈕
        this.nextLevelButton.setVisible(false);
        
        // 初始化玩家技能（如果還沒有的話）
        if (!this.playerSkills) {
            this.playerSkills = {};
        }
        
        // 創建技能商店介面
        this.createSkillShopInterface(event);
    }

    // 創建技能商店介面
    createSkillShopInterface(event) {
        console.log('進入 createSkillShopInterface，事件資料:', event);
        
        // 檢查事件是否有技能數據
        if (!event.skills || event.skills.length === 0) {
            console.error('技能商店事件缺少技能數據', event);
            this.eventText.setText('技能大師似乎沒有什麼可以教授的...');
            this.nextLevelButton.setVisible(true);
            return;
        }
        
        console.log('技能數據檢查通過，技能:', event.skills);
        
        // 顯示神秘導師描述
        this.eventText.setText(`${event.description}\n\n神秘導師說：「你渴望力量嗎？我可以傳授你特殊的\n戰鬥技巧。」\n\n💰 你的金錢: ${this.playerMoney}`);
        
        // 清理現有的商店按鈕（如果有的話）
        if (this.shopButtons) {
            this.shopButtons.forEach(button => button.destroy());
        }
        this.shopButtons = [];
        
        // 方框大小和位置設定
        const boxSize = 80;
        const boxX = 180; // 中間位置
        const boxY = 160;
        
        // 獲取技能資訊
        const skill = event.skills[0]; // 目前只有一個技能
        if (!skill) {
            console.error('無法獲取技能資料');
            this.eventText.setText('技能大師似乎沒有什麼可以教授的...');
            this.nextLevelButton.setVisible(true);
            return;
        }
        
        // 檢查臨時技能（當場遊戲有效）
        const ownedSkill = this.playerSkills[skill.id];
        
        let canLearnOrUpgrade = false;
        let buttonText = "";
        let skillDescription = skill.description;
        let currentLevel = 0;
        let price = skill.price;
        
        if (ownedSkill) {
            currentLevel = ownedSkill.level;
            skillDescription = ownedSkill.description;
            
            if (currentLevel < 3) {
                // 升級價格隨等級增加：等級2需要150金，等級3需要200金
                price = skill.price + (currentLevel * 50);
                canLearnOrUpgrade = this.playerMoney >= price;
                buttonText = `升級 (Lv.${currentLevel})`;
            } else {
                buttonText = "已滿級";
                canLearnOrUpgrade = false;
            }
        } else {
            canLearnOrUpgrade = this.playerMoney >= price;
            buttonText = "學習";
        }
        
        // 創建技能方框背景
        const boxBg = this.add.rectangle(boxX, boxY, boxSize, boxSize);
        boxBg.setFillStyle(canLearnOrUpgrade ? 0x9b59b6 : 0x95a5a6);
        boxBg.setStrokeStyle(3, canLearnOrUpgrade ? 0x8e44ad : 0x7f8c8d);
        
        // 創建技能名稱
        const nameText = this.add.text(boxX, boxY - 25, skill.name, {
            fontSize: '12px',
            fill: canLearnOrUpgrade ? '#ffffff' : '#bdc3c7',
            align: 'center',
            fontFamily: 'Arial, sans-serif'
        });
        nameText.setOrigin(0.5);
        
        // 創建等級顯示
        if (ownedSkill) {
            const levelText = this.add.text(boxX, boxY - 10, `等級 ${currentLevel}/3`, {
                fontSize: '10px',
                fill: '#f39c12',
                align: 'center',
                fontFamily: 'Arial, sans-serif'
            });
            levelText.setOrigin(0.5);
            this.shopButtons.push(levelText);
        }
        
        // 創建價格文字
        const priceText = this.add.text(boxX, boxY + 5, `${price}💰`, {
            fontSize: '11px',
            fill: canLearnOrUpgrade ? '#f1c40f' : '#95a5a6',
            align: 'center',
            fontFamily: 'Arial, sans-serif'
        });
        priceText.setOrigin(0.5);
        
        // 創建按鈕文字
        const actionText = this.add.text(boxX, boxY + 20, buttonText, {
            fontSize: '10px',
            fill: canLearnOrUpgrade ? '#ffffff' : '#95a5a6',
            align: 'center',
            fontFamily: 'Arial, sans-serif'
        });
        actionText.setOrigin(0.5);
        
        // 技能描述（在方框下方）
        const descText = this.add.text(boxX, boxY + 50, skillDescription, {
            fontSize: '9px',
            fill: '#e8e8e8',
            align: 'center',
            fontFamily: 'Arial, sans-serif',
            wordWrap: { width: 200 }
        });
        descText.setOrigin(0.5);
        
        // 將所有元素加入數組以便管理
        const buttonElements = [boxBg, nameText, priceText, actionText, descText];
        this.shopButtons.push(...buttonElements);
        
        // 為方框添加互動功能
        if (canLearnOrUpgrade) {
            boxBg.setInteractive({ useHandCursor: true });
            
            boxBg.on('pointerdown', () => {
                // 防止重複點擊 - 立即禁用交互
                boxBg.disableInteractive();
                actionText.setText('處理中...');
                actionText.setFill('#666666');
                
                this.learnSkillAndLeave(skill);
            });
            
            boxBg.on('pointerover', () => {
                boxBg.setFillStyle(0x8e44ad);
                boxBg.setScale(1.1);
            });
            
            boxBg.on('pointerout', () => {
                boxBg.setFillStyle(0x9b59b6);
                boxBg.setScale(1);
            });
        }
        
        // 添加「離開」選項
        this.createSkillShopLeaveButton();
    }
    
    // 創建技能商店「離開」按鈕
    createSkillShopLeaveButton() {
        const buttonX = 180;
        const buttonY = 240;
        
        const leaveBg = this.add.rectangle(buttonX, buttonY, 60, 30);
        leaveBg.setFillStyle(0xe74c3c);
        leaveBg.setStrokeStyle(2, 0xc0392b);
        
        const leaveText = this.add.text(buttonX, buttonY, '離開', {
            fontSize: '12px',
            fill: '#ffffff',
            align: 'center',
            fontFamily: 'Arial, sans-serif'
        });
        leaveText.setOrigin(0.5);
        
        this.shopButtons.push(leaveBg, leaveText);
        
        leaveBg.setInteractive({ useHandCursor: true });
        
        leaveBg.on('pointerdown', () => {
            // 防止重複點擊
            leaveBg.disableInteractive();
            leaveText.setText('離開中...');
            leaveText.setFill('#999999');
            
            this.leaveSkillShop();
        });
        
        leaveBg.on('pointerover', () => {
            leaveBg.setFillStyle(0xc0392b);
            leaveBg.setScale(1.05);
        });
        
        leaveBg.on('pointerout', () => {
            leaveBg.setFillStyle(0xe74c3c);
            leaveBg.setScale(1);
        });
    }
    
    // 學習技能並離開
    learnSkillAndLeave(skill) {
        // 計算正確的價格
        let price = skill.price;
        if (this.playerSkills[skill.id]) {
            const currentLevel = this.playerSkills[skill.id].level;
            price = skill.price + (currentLevel * 50); // 升級價格
        }
        
        // 檢查是否有足夠金錢
        if (this.playerMoney < price) {
            this.eventText.setText(this.eventText.text + '\n\n💸 金錢不足！');
            return;
        }
        
        // 扣除金錢
        GameDatabase.spendMoney(price);
        this.playerMoney = GameDatabase.loadMoney();
        
        // 學習或升級技能（臨時的，只在當局有效）
        if (!this.playerSkills[skill.id]) {
            // 學習新技能
            this.playerSkills[skill.id] = {
                ...skill,
                level: 1
            };
            
            // 根據技能類型設置初始效果
            if (skill.id === 'dual_strike') {
                this.playerSkills[skill.id].chance = skill.chance || 0.15; // 使用技能定義中的機率
                this.playerSkills[skill.id].description = `${(this.playerSkills[skill.id].chance * 100).toFixed(0)}% 機率發動二刀流攻擊`;
            }
        } else {
            // 升級現有技能
            this.playerSkills[skill.id].level++;
            
            // 根據等級更新技能效果
            if (skill.id === 'dual_strike') {
                const level = this.playerSkills[skill.id].level;
                const baseChance = skill.chance || 0.15; // 使用技能定義中的基礎機率
                this.playerSkills[skill.id].chance = baseChance + (level - 1) * 0.1; // 每級+10%
                this.playerSkills[skill.id].description = `${(this.playerSkills[skill.id].chance * 100).toFixed(0)}% 機率發動二刀流攻擊`;
            }
        }
        
        // 更新顯示
        this.updateDisplay();
        
        // 清理商店按鈕
        if (this.shopButtons) {
            this.shopButtons.forEach(button => button.destroy());
            this.shopButtons = [];
        }
        
        // 顯示學習結果
        const skillName = skill.name;
        const currentLevel = this.playerSkills[skill.id].level;
        const skillDescription = this.playerSkills[skill.id].description; // 使用已更新的描述
        
        this.eventText.setText(
            `✅ 技能學習成功！\n\n獲得技能：${skillName} (等級 ${currentLevel})\n\n${skillDescription}\n\n💰 剩餘金錢: ${this.playerMoney}`
        );
        
        // 恢復下一關按鈕
        this.nextLevelButton.setVisible(true);
    }
    
    // 離開技能商店
    leaveSkillShop() {
        // 清理商店按鈕
        if (this.shopButtons) {
            this.shopButtons.forEach(button => button.destroy());
            this.shopButtons = [];
        }
        
        // 顯示離開訊息
        this.eventText.setText('你決定不學習任何技能就離開了。\n\n神秘導師點點頭：「機緣未到，日後再會。」');
        
        // 恢復下一關按鈕
        this.nextLevelButton.setVisible(true);
    }

    startBattle(event) {
        console.log('開始戰鬥事件:', event);
        
        // 更新關卡
        this.currentLevel++;
        this.levelText.setText(`第 ${this.currentLevel} 關`);
        
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
        const initialStatus = `🐺 ${this.battleData.monster.name}: ${this.battleData.monster.health}/${this.battleData.monster.maxHealth} HP\n\n` +
                            `📝 戰鬥記錄:\n戰鬥開始！遭遇 ${this.battleData.monster.name}！`;
        
        // 確保戰鬥文字使用與一般事件相同的樣式，並依裝置像素比調整解析度以避免模糊
        if (this.eventText) {
            this.eventText.setStyle({
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                fill: '#2c3e50',
                wordWrap: { width: 305 },
                lineSpacing: 3
            });
            if (typeof this.eventText.setResolution === 'function') {
                this.eventText.setResolution(window.devicePixelRatio || 1);
            }
        }
        this.eventText.setText(initialStatus);
        this.battleMessages.push(`戰鬥開始！遭遇 ${this.battleData.monster.name}！`);
        
        // 清理現有的戰鬥元素
        if (this.battleElements) {
            this.battleElements.forEach(element => element.destroy());
        }
        this.battleElements = [];
        
        // 嘗試使用怪物圖片（優先），若不存在再使用矩形備援
        const monsterName = this.battleData.monster.name || '';
        // 簡單對應怪物名稱到資源 key（可擴充）
        const nameToKey = {
            '野狼': 'wolf',
            '狼王': 'wolf_king',
            '狼王': 'wolf_king'
        };
        let assetKey = nameToKey[monsterName];
        // 若沒有精確對應，嘗試用部分字串判斷
        if (!assetKey) {
            if (monsterName.indexOf('狼王') !== -1 || monsterName.indexOf('狼 王') !== -1) assetKey = 'wolf_king';
            else if (monsterName.indexOf('狼') !== -1) assetKey = 'wolf';
        }

        if (assetKey && this.textures.exists(assetKey)) {
            // 使用圖片顯示怪物，並縮放到合理大小
            const monsterImg = this.add.image(280, 300, assetKey).setOrigin(0.5);
            // 嘗試依據圖大小做縮放（限定最大寬/高）
            const tex = this.textures.get(assetKey);
            if (tex && tex.source && tex.source[0]) {
                const w = tex.source[0].width || 64;
                const h = tex.source[0].height || 64;
                const maxSize = 80;
                const scale = Math.min(maxSize / w, maxSize / h, 1);
                monsterImg.setScale(scale);
            }
            this.battleElements.push(monsterImg);
        } else {
            // 備援：使用矩形框代表怪物
            const monsterBg = this.add.rectangle(280, 300, 80, 80, 0x8b4513);
            monsterBg.setStrokeStyle(3, 0x654321);
            this.battleElements.push(monsterBg);
        }
        
        // 正式環境不使用,沒圖片時可預先顯示——————————————————————————————————————————————————
        // 怪物名稱
        // const monsterNameText = this.add.text(280, 250, this.battleData.monster.name, {
        //     fontSize: '14px',
        //     fontFamily: 'Arial, sans-serif',
        //     fill: '#8b4513',
        //     fontWeight: 'bold',
        //     align: 'center'
        // }).setOrigin(0.5);
        // this.battleElements.push(monsterNameText);
        
        // 怪物血量背景
        const monsterHealthBg = this.add.rectangle(280, 360, 100, 15, 0x2c3e50);
        monsterHealthBg.setStrokeStyle(1, 0x34495e);
        this.battleElements.push(monsterHealthBg);
        
        // 怪物血量條 (綠色)
        this.monsterHealthBar = this.add.rectangle(230, 360, 100, 15, 0x27ae60);
        this.monsterHealthBar.setOrigin(0, 0.5);
        this.battleElements.push(this.monsterHealthBar);
    }

    // 戰鬥循環
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

    // 玩家攻擊動作
    playerAttackAction() {
        const damage = Math.max(1, this.playerAttack - this.battleData.monster.defense);
        this.battleData.monster.health = Math.max(0, this.battleData.monster.health - damage);
        
        this.updateBattleDisplay();
        this.addBattleLog(`你攻擊 ${this.battleData.monster.name}，造成 ${damage} 點傷害！`);
        
        // 檢查二刀流技能（臨時技能）
        const dualStrike = this.playerSkills ? this.playerSkills['dual_strike'] : null;
        console.log('檢查二刀流技能:', dualStrike); // 調試信息
        
        if (dualStrike && this.battleData.monster.health > 0) {
            // 根據技能等級判斷是否觸發
            const random = Math.random();
            console.log(`二刀流檢定: ${random.toFixed(3)} < ${dualStrike.chance} (${(dualStrike.chance * 100).toFixed(0)}%)`); // 調試信息
            
            if (random < dualStrike.chance) {
                // 觸發二刀流！
                const secondDamage = Math.max(1, this.playerAttack - this.battleData.monster.defense);
                this.battleData.monster.health = Math.max(0, this.battleData.monster.health - secondDamage);
                
                this.updateBattleDisplay();
                this.addBattleLog(`⚔️⚔️ 二刀流發動！再次攻擊造成 ${secondDamage} 點傷害！`);
            }
        }
    }

    // 怪物攻擊
    monsterAttack() {
        const damage = Math.max(1, this.battleData.monster.attack - this.playerDefense);
        this.playerHealth = Math.max(0, this.playerHealth - damage);
        
        this.updateDisplay();
        this.addBattleLog(`${this.battleData.monster.name} 攻擊你，造成 ${damage} 點傷害！`);
    }

    // 更新戰鬥顯示
    updateBattleDisplay() {
        // 更新怪物血量條
        const healthPercentage = this.battleData.monster.health / this.battleData.monster.maxHealth;
        this.monsterHealthBar.setScale(healthPercentage, 1);
        
        // 更新血量條顏色
        if (healthPercentage > 0.6) {
            this.monsterHealthBar.setFillStyle(0x27ae60);
        } else if (healthPercentage > 0.3) {
            this.monsterHealthBar.setFillStyle(0xf39c12);
        } else {
            this.monsterHealthBar.setFillStyle(0xe74c3c);
        }
    }

    // 添加戰鬥記錄
    addBattleLog(message) {
        this.battleMessages.push(message);
        
        // 只顯示最後幾條記錄
        const recentMessages = this.battleMessages.slice(-4);
        
        const battleStatus = `🐺 ${this.battleData.monster.name}: ${this.battleData.monster.health}/${this.battleData.monster.maxHealth} HP\n\n` +
                           `📝 戰鬥記錄:\n${recentMessages.join('\n')}`;
        
        // 每次更新戰鬥文字時也強制使用一般事件相同的文字樣式/解析度，避免顯示模糊
        if (this.eventText) {
            this.eventText.setStyle({
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                fill: '#2c3e50',
                wordWrap: { width: 305 },
                lineSpacing: 3
            });
            if (typeof this.eventText.setResolution === 'function') {
                this.eventText.setResolution(window.devicePixelRatio || 1);
            }
        }

        this.eventText.setText(battleStatus);
    }

    // 結束戰鬥
    endBattle(playerWin, playerDeath = false) {
        this.battleData.battleActive = false;
        
        // 清理戰鬥元素
        if (this.battleElements) {
            this.battleElements.forEach(element => element.destroy());
            this.battleElements = [];
        }
        
        if (playerDeath) {
            // 玩家死亡
            this.eventText.setText(
                `你在與 ${this.battleData.monster.name} 的戰鬥中陣亡！\n\n💀 遊戲結束！點擊重新開始回到首頁。`
            );
            
            // 確保按鈕可見並改為重新開始
            this.nextLevelButton.setVisible(true);
            this.changeButtonToRestart();
        } else if (playerWin) {
            // 玩家勝利
            GameDatabase.addMoney(this.battleData.reward.money);
            this.playerMoney = GameDatabase.loadMoney();
            
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
        
        this.updateDisplay();
    }

    // 裝備事件
    handleEquipmentEvent(event) {
        console.log('裝備事件:', event);
        
        // 更新關卡
        this.currentLevel++;
        this.levelText.setText(`第 ${this.currentLevel} 關`);
        
        // 正確處理裝備：添加到背包而不是直接加屬性
        const equipment = event.equipment;
        
        // 準備訊息
        const qualityColors = ['⚪', '🔵', '🟡', '🟣']; // 白、藍、金、紫
        const qualityColor = qualityColors[equipment.quality] || '⚪';
        
        // 將裝備添加到背包
        const success = GameDatabase.addEquipmentToInventory(equipment);
        
        let effectMessage = "";
        
        if (success) {
            effectMessage = "已添加到裝備背包！";
            
            // 顯示裝備屬性信息（不直接應用）
            let attributeInfo = "";
            if (equipment.baseAttack > 0) {
                attributeInfo += `攻擊力: ${equipment.baseAttack} `;
            }
            if (equipment.baseDefense > 0) {
                attributeInfo += `防禦力: ${equipment.baseDefense} `;
            }
            if (equipment.baseHealth > 0) {
                attributeInfo += `血量: ${equipment.baseHealth} `;
            }
            
            if (attributeInfo) {
                effectMessage += `\n裝備屬性: ${attributeInfo}`;
            }
        } else {
            effectMessage = "背包已滿，裝備丟失！";
        }
        
        // 重新計算玩家屬性（包含裝備加成）
        this.calculatePlayerStats();
        
        // 更新顯示
        this.updateDisplay();
        
        // 顯示事件結果
        this.eventText.setText(
            `${event.description}\n\n${event.effect.message}\n\n⚔️ 獲得裝備：${qualityColor} ${equipment.name} (+${equipment.level})\n\n${effectMessage}\n\n💰 總金錢: ${this.playerMoney}`
        );
    }

    updateDisplay() {
        const healthPercentage = this.playerHealth / this.maxHealth;
        this.healthBar.setScale(healthPercentage, 1);
        this.healthText.setText(`血量: ${this.playerHealth}/${this.maxHealth}`);
        
        // 更新上方UI
        this.attackText.setText(`⚔️ ${this.playerAttack}`);
        this.defenseText.setText(`🛡️ ${this.playerDefense}`);
        this.moneyText.setText(`💰 ${this.playerMoney}`);

        // 注意：由於 healthBar 現在是圖片(image)，不能使用 setFillStyle
        // 圖片的顏色變化需要通過 setTint 或其他方式實現
        if (healthPercentage > 0.6) {
            this.healthBar.setTint(0x27ae60);
        } else if (healthPercentage > 0.3) {
            this.healthBar.setTint(0xf39c12);
        } else {
            this.healthBar.setTint(0xe74c3c);
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