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
        
        // 背景（使用共用函式）
        SceneUtils.ensureBackground(this, 'backgroundImg', 187.5, 333.5, 375, 667);

        // 初始化音訊（解鎖與建立 sound 實例）
        try { SceneUtils.initAudio(this); } catch (e) { /* ignore */ }

        // 遊戲標題
        this.add.text(187.5, 200, '事件冒險遊戲', {
            fontSize: '32px',
            fill: '#2c3e50',
            fontWeight: 'bold',
            stroke: '#ffffff',
            strokeThickness: 5
        }).setOrigin(0.5);

        // 金錢顯示（共用）
        const moneyWidget = SceneUtils.createMoneyWidget(this, 332.5, 20, 85, 30);
        this.moneyText = moneyWidget.text;

        // 副標題
        this.add.text(187.5, 250, '準備好開始你的冒險了嗎？', {
            fontSize: '16px',
            fill: '#2c3e50',
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif',
            stroke: '#ffffff',
            strokeThickness: 3
        }).setOrigin(0.5);

        // 創建開始遊戲按鈕（共用）
        SceneUtils.createButton(this, 187.5, 400, '開始遊戲', 0x27ae60, () => {
            this.scene.start('GameScene');
        }, { width: 250, height: 70, strokeColor: 0x1e8449, strokeWidth: 4, fontSize: '24px' });

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
        // 強化按鈕（共用）
        SceneUtils.createButton(this, 105, 520, '強化', 0xe74c3c, () => { this.scene.start('UpgradeScene'); }, { width: 130, height: 50, strokeColor: 0xc0392b, strokeWidth: 3, fontSize: '18px' });

        // 裝備按鈕 (右邊) - 調整位置避免重疊
        // 裝備按鈕（共用）
        SceneUtils.createButton(this, 270, 520, '裝備', 0x8e44ad, () => { this.scene.start('EquipmentScene'); }, { width: 130, height: 50, strokeColor: 0x6c3483, strokeWidth: 3, fontSize: '18px' });
    }
}