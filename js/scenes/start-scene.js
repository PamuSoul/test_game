// 開始場景
class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    preload() {
        // 使用統一的圖片載入工具
        const imageConfigs = [
            { key: 'backgroundImg', src: ASSETS.images.background }
        ];
        
        // 預載圖片
        ImageLoader.loadImages(this, imageConfigs).then(() => {
            console.log('StartScene 圖片載入完成');
        }).catch((error) => {
            console.error('StartScene 圖片載入失敗:', error);
        });

        // 預載音訊資源（確保首頁按鈕音效/背景音樂可在 start 場景使用）
        try {
            if (window.ASSETS && window.ASSETS.audio) {
                Object.keys(window.ASSETS.audio).forEach(key => {
                    try {
                        this.load.audio(key, window.ASSETS.audio[key]);
                    } catch (e) {
                        console.warn('載入音訊失敗 key=', key, e);
                    }
                });
            }
        } catch (err) {
            console.warn('預載音訊時發生錯誤:', err);
        }
    }

    create() {
        // 確保背景圖片存在
        ImageLoader.ensureImageExists(this, 'backgroundImg');
        
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
            strokeThickness: 5
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
            fontFamily: 'Arial, sans-serif',
            stroke: '#ffffff',
            strokeThickness: 3
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
            try {
                if (this.sound && this.sound.play) {
                    this.sound.play('buttonClick', { volume: 0.6 });
                }
            } catch (err) {
                console.warn('buttonClick sound play failed:', err);
            }

            startButton.setScale(0.95);
            this.time.delayedCall(100, () => {
                startButton.setScale(1.05);
                // 切換到遊戲場景
                this.scene.start('GameScene');
            });
        });

        // 嘗試在 start 場景播放背景音樂（若瀏覽器允許自動播放則會播放）
        try {
            if (this.sound && this.sound.add && window.ASSETS && window.ASSETS.audio) {
                if (!this.sound.get('backgroundMusic') && window.ASSETS.audio.backgroundMusic) {
                    const bg = this.sound.add('backgroundMusic', { loop: true, volume: 0.35 });
                    // play 可能會被瀏覽器阻擋（自動播放策略），因此包在 try/catch
                    try {
                        bg.play();
                    } catch (err) {
                        console.warn('backgroundMusic play blocked or failed:', err);
                    }
                }
            }
        } catch (err) {
            console.warn('背景音樂處理時發生錯誤:', err);
        }

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
            try {
                if (this.sound && this.sound.play) {
                    this.sound.play('buttonClick', { volume: 0.6 });
                }
            } catch (err) {
                console.warn('buttonClick sound play failed:', err);
            }

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
            try {
                if (this.sound && this.sound.play) {
                    this.sound.play('buttonClick', { volume: 0.6 });
                }
            } catch (err) {
                console.warn('buttonClick sound play failed:', err);
            }

            equipButton.setScale(0.95);
            this.time.delayedCall(100, () => {
                equipButton.setScale(1.05);
                // 切換到裝備場景
                this.scene.start('EquipmentScene');
            });
        });
    }
}