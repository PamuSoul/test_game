// 裝備場景（已從 game-scenes.js 拆出）
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
        // 使用共用 ImageLoader 統一預載背景圖片（與 StartScene 保持一致）
        try {
            const imageConfigs = [ { key: 'backgroundImg', src: ASSETS.images.background } ];
            ImageLoader.loadImages(this, imageConfigs).then(() => {
                console.log('EquipmentScene 圖片載入完成');
            }).catch((err) => {
                console.error('EquipmentScene 圖片載入失敗:', err);
                // ImageLoader 會在失敗時建立 fallback texture
            });
        } catch (error) {
            console.error('EquipmentScene preload 錯誤:', error);
        }
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
            // 確保背景圖片存在（共用）
            // 先確保圖片已被 ImageLoader 建立或載入，然後顯示背景
            try { ImageLoader.ensureImageExists(this, 'backgroundImg'); } catch (e) { /* ignore */ }
            SceneUtils.ensureBackground(this, 'backgroundImg', 187.5, 333.5, 375, 667);
            
            // 載入裝備數據
            this.loadEquipmentData();
            
            // 建立UI元素
            // 不再覆蓋整個畫面以免蓋掉背景圖片
            // this.createBackground();
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
                try {
                    if (this.sound && this.sound.play) {
                        this.sound.play('buttonClick', { volume: 0.6 });
                    }
                } catch (err) {
                    console.warn('buttonClick sound play failed:', err);
                }

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
        // 原先會畫整個畫面的深色矩形；為了讓背景圖片顯示，我們改為不畫全屏遮罩。
        // 若需要局部面板背景，可在此改為繪製小區塊或保留為空。
        // (保留此方法以免其他程式碼呼叫時出錯)
    }

    createPlayerSection() {
        // 標題
        this.add.text(187.5, 30, '裝備管理', {
            fontSize: '28px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // 金錢顯示（共用）
    // 使用與 StartScene 相同的金幣顯示樣式（位置與大小一致）
    const moneyWidget = SceneUtils.createMoneyWidget(this, 332.5, 20, 85, 30);
        this.moneyText = moneyWidget.text;

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
                try {
                    if (this.sound && this.sound.play) {
                        this.sound.play('buttonClick', { volume: 0.6 });
                    }
                } catch (err) {
                    console.warn('buttonClick sound play failed:', err);
                }

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

    // 操作按鈕（使用共用 createButton）
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
            try {
                if (this.sound && this.sound.play) {
                    this.sound.play('buttonClick', { volume: 0.6 });
                }
            } catch (err) {
                console.warn('buttonClick sound play failed:', err);
            }

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
        SceneUtils.createButton(this, 140, firstRowY, '裝備', 0x27ae60, () => { this.equipSelectedItem(); }, { width: 80, height: 35 });

        // 強化按鈕
        SceneUtils.createButton(this, 235, firstRowY, '強化', 0xe74c3c, () => { this.enhanceSelectedItem(); }, { width: 80, height: 35 });

        // 第二排按鈕 (Y=630)
        const secondRowY = 630;

        // 合成按鈕
        SceneUtils.createButton(this, 140, secondRowY, '合成', 0xf39c12, () => { this.synthesizeItems(); }, { width: 80, height: 35 });

        // 丟棄按鈕
        SceneUtils.createButton(this, 235, secondRowY, '丟棄', 0x95a5a6, () => { this.discardSelectedItem(); }, { width: 80, height: 35 });
    }

    createButton(x, y, text, color, callback) {
        const buttonBg = this.add.rectangle(0, 0, 80, 35, color, 1);
        buttonBg.setStrokeStyle(2, color - 0x111111);
        
        const buttonText = this.add.text(0, 0, text, {
            fontSize: '14px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // createButton 已使用共用 SceneUtils.createButton，刪除此處本地實作
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
            SceneUtils.showMessage(this, '請先選擇要裝備的物品', 0xe74c3c);
            return;
        }

        const result = GameDatabase.equipItem(this.selectedInventoryItem);
        this.playerEquipment = result.equipment;
        this.equipmentInventory = result.inventory;
        this.selectedInventoryItem = null;

        // 清除所有高亮
        this.clearAllHighlights();

        this.refreshDisplay();
    SceneUtils.showMessage(this, '裝備成功！', 0x27ae60);
    }

    unequipItem(equipmentType) {
        if (!this.playerEquipment[equipmentType]) {
            return;
        }

        const result = GameDatabase.unequipItem(equipmentType);
        this.playerEquipment = result.equipment;
        this.equipmentInventory = result.inventory;

        this.refreshDisplay();
    SceneUtils.showMessage(this, '卸下裝備成功！', 0x27ae60);
    }

    enhanceSelectedItem() {
        if (!this.selectedInventoryItem) {
            SceneUtils.showMessage(this, '請先選擇要強化的裝備', 0xe74c3c);
            return;
        }

        if (this.selectedInventoryItem.level >= 10) {
            SceneUtils.showMessage(this, '裝備已達最高強化等級！', 0xe67e22);
            return;
        }

        const cost = (this.selectedInventoryItem.level + 1) * 100;
        const currentMoney = GameDatabase.loadMoney();

        if (currentMoney < cost) {
            SceneUtils.showMessage(this, `金錢不足！需要 ${SceneUtils.formatMoney(cost)} 金錢`, 0xe74c3c);
            return;
        }

        // 強化成功
        GameDatabase.spendMoney(cost);
        this.selectedInventoryItem.level += 1;
        GameDatabase.saveEquipmentInventory(this.equipmentInventory);

        this.refreshDisplay();
    SceneUtils.showMessage(this, `強化成功！等級提升至 +${this.selectedInventoryItem.level}`, 0x27ae60);
    }

    synthesizeItems() {
        // 收集所有可合成的裝備
        const synthesizableGroups = this.findSynthesizableGroups();
        
        if (synthesizableGroups.length === 0) {
            SceneUtils.showMessage(this, '沒有可合成的裝備！需要兩個相同類型、名稱和品質的裝備', 0xe74c3c);
            return;
        }

        // 顯示合成選項
        this.showSynthesizeOptions(synthesizableGroups);
    }

    discardSelectedItem() {
        if (!this.selectedInventoryItem) {
            SceneUtils.showMessage(this, '請先選擇要丟棄的裝備', 0xe74c3c);
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
            try {
                if (this.sound && this.sound.play) {
                    this.sound.play('buttonClick', { volume: 0.6 });
                }
            } catch (err) {
                console.warn('buttonClick sound play failed:', err);
            }

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
            SceneUtils.showMessage(this, '合成需要至少兩個相同裝備', 0xe74c3c);
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
            SceneUtils.showMessage(this, `合成成功！獲得 ${result.newEquipment.name}`, 0x27ae60);
        } else {
            SceneUtils.showMessage(this, '合成失敗！', 0xe74c3c);
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
            
            SceneUtils.showMessage(this, `已丟棄 ${equipment.name}`, 0x95a5a6);
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

    // showMessage 改用 SceneUtils.showMessage

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
            this.moneyText.setText(`💰 ${SceneUtils.formatMoney(currentMoney)}`);
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
