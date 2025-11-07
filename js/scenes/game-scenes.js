// 其他遊戲場景 - 已模組化
// UpgradeScene 與 EquipmentScene 已移出到獨立檔案：
// - js/scenes/upgrade-scene.js
// - js/scenes/equipment-scene.js
// 以降低本檔案大小並使維護更簡單。

// 保留其他場景（例如 GameScene）在此檔案中。

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
            // 載入其他怪物圖片（bandit / goblin / guardian）
            try {
                this.load.image('bandit', ASSETS.images.bandit);
            } catch (e) {
                // 若資源未在 ASSETS 中宣告，忽略即可
            }
            try {
                this.load.image('goblin', ASSETS.images.goblin);
            } catch (e) {
                // 忽略
            }
            try {
                this.load.image('guardian', ASSETS.images.guardian);
            } catch (e) {
                // 忽略
            }
            // 載入音效（若在 ASSETS 中宣告）
            try {
                if (ASSETS.audio && ASSETS.audio.backgroundMusic) this.load.audio('backgroundMusic', ASSETS.audio.backgroundMusic);
                if (ASSETS.audio && ASSETS.audio.buttonClick) this.load.audio('buttonClick', ASSETS.audio.buttonClick);
                if (ASSETS.audio && ASSETS.audio.eventPositive) this.load.audio('eventPositive', ASSETS.audio.eventPositive);
                if (ASSETS.audio && ASSETS.audio.eventNegative) this.load.audio('eventNegative', ASSETS.audio.eventNegative);
                if (ASSETS.audio && ASSETS.audio.levelUp) this.load.audio('levelUp', ASSETS.audio.levelUp);
                if (ASSETS.audio && ASSETS.audio.gameOver) this.load.audio('gameOver', ASSETS.audio.gameOver);
            } catch (e) {
                console.warn('載入音效時發生錯誤，請確認 ASSETS.audio 設定:', e);
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
        // 初始化音訊（解鎖與建立 sound 實例）
        try { SceneUtils.initAudio(this); } catch (e) { /* ignore */ }
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

        // 播放背景音樂（若有載入且還沒播放）
        try {
            if (this.sound && !this.bgm) {
                // 如果已有同 key 的 sound instance（例如在 StartScene 已建立），就重用它，避免重複播放
                const existing = this.sound.get('backgroundMusic');
                if (existing) {
                    this.bgm = existing;
                    try {
                        if (!this.bgm.isPlaying) this.bgm.play();
                    } catch (e) { /* ignore play errors */ }
                } else if (this.cache.audio && this.cache.audio.exists && this.cache.audio.exists('backgroundMusic')) {
                    this.bgm = this.sound.add('backgroundMusic', { loop: true, volume: 0.35 });
                    this.bgm.play();
                } else if (this.cache.audio && this.cache.audio.list && this.cache.audio.list['backgroundMusic']) {
                    // 兼容不同 Phaser 版本的檢查方式
                    this.bgm = this.sound.add('backgroundMusic', { loop: true, volume: 0.35 });
                    this.bgm.play();
                }
            }
        } catch (e) {
            console.warn('播放背景音樂失敗:', e);
        }

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
        
        this.moneyText = this.add.text(347.5, 12.5, `💰 ${SceneUtils.formatMoney(this.playerMoney)}`, {
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
            // 播放按鈕音效（使用 SceneUtils 以便集中管理與解鎖）
            try { SceneUtils.playSound(this, 'buttonClick', { volume: 0.6 }); } catch (err) { /* ignore */ }

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

        // 播放對應音效：正面/負面/死亡
        try {
            if (instantDeath || this.playerHealth <= 0) {
                SceneUtils.playSound(this, 'gameOver');
            } else if (fullHeal || healthChange > 0 || moneyGain > 0) {
                SceneUtils.playSound(this, 'eventPositive');
            } else if (healthChange < 0) {
                SceneUtils.playSound(this, 'eventNegative');
            }
        } catch (e) { /* ignore sound errors */ }

        // 顯示事件結果
        this.eventText.setText(
            `${randomEvent.description}\n\n` +
            `${randomEvent.effect.message}\n\n` +
            `💰 總金錢: ${SceneUtils.formatMoney(this.playerMoney)}`
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
            this.eventText.setText(`${event.description}\n\n商人說：「歡迎光臨！看看我有什麼好東西！」\n💰 你的金錢: ${SceneUtils.formatMoney(this.playerMoney)}`);
        
        // 清理現有的商店按鈕（如果有的話）
        if (this.shopButtons) {
            this.shopButtons.forEach(button => button.destroy());
        }
        this.shopButtons = [];
        
    // 方框大小和位置設定（改為與技能商店一致的較大樣式）
    const boxSize = 80;
        
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
            
            // 創建方框背景（使用技能商店相同的視覺風格）
            const boxBg = this.add.rectangle(pos.x, pos.y, boxSize, boxSize);
            boxBg.setFillStyle(canAfford ? 0x9b59b6 : 0x95a5a6);
            boxBg.setStrokeStyle(3, canAfford ? 0x8e44ad : 0x7f8c8d);

            // 創建物品名稱（簡短版本） - 使用較大字體並加描邊，以符合技能商店風格
            let shortName = item.name;
            if (item.name === "治療藥水") shortName = "小藥水";
            if (item.name === "大型治療藥水") shortName = "大藥水";
            if (item.name === "生命護符") shortName = "護符";
            if (item.name === "龍鱗盔甲") shortName = "盔甲";

            const nameText = this.add.text(pos.x, pos.y - 20, shortName, {
                fontSize: '16px',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'bold',
                fill: canAfford ? '#ffffff' : '#f0f0f0',
                align: 'center',
                stroke: '#6c3483',
                strokeThickness: 2
            }).setOrigin(0.5);
            if (typeof nameText.setResolution === 'function') nameText.setResolution(window.devicePixelRatio || 1);

            // 創建價格文字（使用共用格式化函式）
            const priceText = this.add.text(pos.x, pos.y + 5, `${SceneUtils.formatMoney(item.price)} 💰`, {
                fontSize: '12px',
                fontFamily: 'Arial, sans-serif',
                fill: canAfford ? '#f1c40f' : '#bdc3c7',
                align: 'center',
                fontWeight: 'bold',
                stroke: canAfford ? '#7f6b00' : '#7f8c8d',
                strokeThickness: 1
            }).setOrigin(0.5);
            if (typeof priceText.setResolution === 'function') priceText.setResolution(window.devicePixelRatio || 1);

            // 創建效果文字（在方框下方）
            let effectText = "";
            if (item.effect.health) effectText = `+${item.effect.health}❤️`;
            if (item.effect.maxHealth) effectText = `+${item.effect.maxHealth}💪`;
            if (item.effect.attack) effectText = `+${item.effect.attack}⚔️`;
            if (item.effect.defense) effectText = `+${item.effect.defense}🛡️`;

            const effectDisplay = this.add.text(pos.x, pos.y + 18, effectText, {
                fontSize: '11px',
                fontFamily: 'Arial, sans-serif',
                fill: canAfford ? '#27ae60' : '#95a5a6',
                align: 'center',
                fontWeight: 'bold'
            }).setOrigin(0.5);
            if (typeof effectDisplay.setResolution === 'function') effectDisplay.setResolution(window.devicePixelRatio || 1);
            
            // 將所有元素加入數組以便管理
            const buttonElements = [boxBg, nameText, priceText, effectDisplay];
            this.shopButtons.push(...buttonElements);
            
            // 為方框添加互動功能
            if (canAfford) {
                boxBg.setInteractive({ useHandCursor: true });
                
                boxBg.on('pointerdown', () => {
                    try { SceneUtils.playSound(this, 'buttonClick', { volume: 0.6 }); } catch (err) { /* ignore */ }
                    this.buyItemAndLeave(item);
                });
                
                boxBg.on('pointerover', () => {
                    // 使用技能商店 hover 色彩
                    boxBg.setFillStyle(0x8e44ad);
                    boxBg.setScale(1.1);
                });

                boxBg.on('pointerout', () => {
                    // 還原為可購買/不可購買的顏色
                    boxBg.setFillStyle(canAfford ? 0x9b59b6 : 0x95a5a6);
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
            try { SceneUtils.playSound(this, 'buttonClick', { volume: 0.6 }); } catch (err) { /* ignore */ }

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
        try { SceneUtils.playSound(this, 'eventPositive'); } catch (e) { /* ignore */ }
        this.eventText.setText(
            `✅ 購買成功！\n\n${item.effect.message}\n\n💰 剩餘金錢: ${SceneUtils.formatMoney(this.playerMoney)}`
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
    this.eventText.setText(`${event.description}\n\n神秘導師說：「你渴望力量嗎？我可以傳授你特殊的\n戰鬥技巧。」\n\n💰 你的金錢: ${SceneUtils.formatMoney(this.playerMoney)}`);
        
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
        
        // 創建技能名稱（加大字體、提高對比並設定解析度以避免模糊）
        const nameText = this.add.text(boxX, boxY - 25, skill.name, {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            fill: canLearnOrUpgrade ? '#ffffff' : '#f0f0f0',
            align: 'center',
            stroke: '#6c3483',
            strokeThickness: 2
        });
        if (typeof nameText.setResolution === 'function') nameText.setResolution(window.devicePixelRatio || 1);
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
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            fill: canLearnOrUpgrade ? '#f1c40f' : '#bdc3c7',
            align: 'center',
            fontWeight: 'bold',
            stroke: '#7f6b00',
            strokeThickness: 1
        });
        if (typeof priceText.setResolution === 'function') priceText.setResolution(window.devicePixelRatio || 1);
        priceText.setOrigin(0.5);
        
        // 創建按鈕文字
        const actionText = this.add.text(boxX, boxY + 20, buttonText, {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            fill: canLearnOrUpgrade ? '#ffffff' : '#bdc3c7',
            align: 'center',
            fontWeight: 'bold'
        });
        if (typeof actionText.setResolution === 'function') actionText.setResolution(window.devicePixelRatio || 1);
        actionText.setOrigin(0.5);
        
        // 技能描述（在方框下方）
        const descText = this.add.text(boxX, boxY + 50, skillDescription, {
            fontSize: '11px',
            fontFamily: 'Arial, sans-serif',
            fill: '#000000ff',
            align: 'center',
            wordWrap: { width: 220 },
            fontWeight: 'bold',
            stroke: '#ffffff',
            strokeThickness: 3,
            lineSpacing: 2
        });
        if (typeof descText.setResolution === 'function') descText.setResolution(window.devicePixelRatio || 1);
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
                    try { SceneUtils.playSound(this, 'buttonClick', { volume: 0.6 }); } catch (err) { /* ignore */ }

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
            try { SceneUtils.playSound(this, 'buttonClick', { volume: 0.6 }); } catch (err) { /* ignore */ }
            
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
        
    // 播放升級/學習成功的音效
    try { SceneUtils.playSound(this, 'levelUp'); } catch (e) { /* ignore */ }
    // 顯示學習結果
        const skillName = skill.name;
        const currentLevel = this.playerSkills[skill.id].level;
        const skillDescription = this.playerSkills[skill.id].description; // 使用已更新的描述
        
        this.eventText.setText(
            `✅ 技能學習成功！\n\n獲得技能：${skillName} (等級 ${currentLevel})\n\n${skillDescription}\n\n💰 剩餘金錢: ${SceneUtils.formatMoney(this.playerMoney)}`
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
            '狼王': 'wolf_king',
            '哥布林戰士': 'goblin',
            '盜賊頭目': 'bandit',
            '石碑守護者': 'guardian'
        };
        let assetKey = nameToKey[monsterName];
        // 若沒有精確對應，嘗試用部分字串判斷
        if (!assetKey) {
            if (monsterName.indexOf('狼王') !== -1 || monsterName.indexOf('狼 王') !== -1) assetKey = 'wolf_king';
            else if (monsterName.indexOf('狼') !== -1) assetKey = 'wolf';
            else if (monsterName.indexOf('哥布林') !== -1) assetKey = 'goblin';
            else if (monsterName.indexOf('盜賊') !== -1) assetKey = 'bandit';
            else if (monsterName.indexOf('守護') !== -1 || monsterName.indexOf('石碑') !== -1) assetKey = 'guardian';
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
            try { SceneUtils.playSound(this, 'gameOver'); } catch (e) { /* ignore */ }
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
            try { SceneUtils.playSound(this, 'levelUp'); } catch (e) { /* ignore */ }
            this.eventText.setText(
                `✅ 戰鬥勝利！\n\n${this.battleData.reward.message}\n\n💰 總金錢: ${SceneUtils.formatMoney(this.playerMoney)}`
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
    try { this.moneyText.setText(`💰 ${SceneUtils.formatMoney(this.playerMoney)}`); } catch (e) { this.moneyText.setText(`💰 ${this.playerMoney}`); }

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
            try { SceneUtils.playSound(this, 'buttonClick', { volume: 0.6 }); } catch (err) { /* ignore */ }

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