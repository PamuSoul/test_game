// 共用場景工具函式（非 module，會掛到全域 window.SceneUtils）
(function () {
    const SceneUtils = {};

    SceneUtils.createFallbackBackground = function(scene, key = 'backgroundImg', w = 375, h = 667) {
        if (!scene.textures.exists(key)) {
            scene.add.graphics()
                .fillGradientStyle(0x2c3e50, 0x2c3e50, 0x34495e, 0x34495e)
                .fillRect(0, 0, w, h)
                .generateTexture(key, w, h);
        }
    };

    SceneUtils.ensureBackground = function(scene, key = 'backgroundImg', x = 187.5, y = 333.5, w = 375, h = 667) {
        try {
            if (!scene.textures.exists(key)) {
                // 建立備用背景
                SceneUtils.createFallbackBackground(scene, key, w, h);
            }

            // 若場景已經有背景物件，先移除（保持 idempotent）
            // 不強制移除，直接建立一個新的背景 image
            const bg = scene.add.image(x, y, key);
            bg.setOrigin(0.5);

            // 縮放以覆蓋畫面
            if (scene.textures.exists(key)) {
                const bgTexture = scene.textures.get(key);
                const bgWidth = bgTexture.source[0].width;
                const bgHeight = bgTexture.source[0].height;
                const scaleX = w / bgWidth;
                const scaleY = h / bgHeight;
                const bgScale = Math.max(scaleX, scaleY);
                bg.setScale(bgScale);
            }

            return bg;
        } catch (err) {
            console.warn('SceneUtils.ensureBackground failed:', err);
            return null;
        }
    };

    SceneUtils.createMoneyWidget = function(scene, x = 332.5, y = 15, width = 85, height = 30) {
        const currentMoney = (typeof GameDatabase !== 'undefined' && GameDatabase.loadMoney) ? GameDatabase.loadMoney() : 0;

        const moneyBg = scene.add.graphics();
        moneyBg.fillStyle(0x000000, 0.8);
        // 將錢框置中於 x,y 參數所代表的文字位置的周圍，保持現有專案設定（以方便最小變更）
        moneyBg.fillRoundedRect(x - (width/2), y - (height/2), width, height, 5);
        moneyBg.lineStyle(2, 0xf39c12);
        moneyBg.strokeRoundedRect(x - (width/2), y - (height/2), width, height, 5);

        const moneyText = scene.add.text(x, y, `💰 ${SceneUtils.formatMoney(currentMoney)}`, {
            fontSize: '14px',
            fill: '#f39c12',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        return { bg: moneyBg, text: moneyText };
    };

    // 將數字格式化為千分位字串，例如 1234567 -> "1,234,567"
    SceneUtils.formatMoney = function(amount) {
        try {
            if (amount === null || typeof amount === 'undefined') return '0';
            const n = Number(amount);
            if (isNaN(n)) return String(amount);
            return n.toLocaleString('en-US');
        } catch (err) {
            return String(amount);
        }
    };

    SceneUtils.createButton = function(scene, x, y, label, color, callback, opts) {
        opts = opts || {};
        const width = opts.width || 80;
        const height = opts.height || 35;
        const strokeColor = (typeof opts.strokeColor !== 'undefined') ? opts.strokeColor : (color - 0x111111);
        const fontSize = opts.fontSize || '14px';

        const buttonBg = scene.add.rectangle(0, 0, width, height, color, 1);
        if (opts.strokeWidth || strokeColor) {
            const sw = opts.strokeWidth || 2;
            try { buttonBg.setStrokeStyle(sw, strokeColor); } catch (e) { /* older Phaser fallback */ }
        }

        const buttonText = scene.add.text(0, 0, label, {
            fontSize: fontSize,
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        const container = scene.add.container(x, y, [buttonBg, buttonText]);
        container.setSize(width, height);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerover', () => {
            try {
                buttonBg.setFillStyle(Math.max(color - 0x222222, 0));
            } catch (e) {}
            container.setScale(1.05);
        });

        container.on('pointerout', () => {
            try { buttonBg.setFillStyle(color); } catch (e) {}
            container.setScale(1);
        });

        container.on('pointerdown', () => {
            try {
                if (scene.sound && scene.sound.play) {
                    scene.sound.play('buttonClick', { volume: 0.6 });
                }
            } catch (err) {
                // ignore
            }

            container.setScale(0.95);
            scene.time.delayedCall(100, () => {
                container.setScale(1.05);
                try { callback(); } catch (e) { console.error('button callback error', e); }
            });
        });

        return container;
    };

    SceneUtils.createBackButton = function(scene, x = 187.5, y = 580, toScene = 'StartScene') {
        return SceneUtils.createButton(scene, x, y, '返回', 0x95a5a6, () => {
            scene.scene.start(toScene);
        }, { width: 100, height: 40, strokeColor: 0x7f8c8d, strokeWidth: 2, fontSize: '16px' });
    };

    SceneUtils.showMessage = function(scene, message, color = 0xffffff, duration = 2000, x = 187.5, y = 100) {
        try {
            const messageText = scene.add.text(x, y, message, {
                fontSize: '14px',
                fill: color,
                fontWeight: 'bold',
                backgroundColor: 0x000000,
                padding: { x: 8, y: 4 }
            }).setOrigin(0.5);

            scene.time.delayedCall(duration, () => {
                if (messageText && messageText.destroy) messageText.destroy();
            });

            return messageText;
        } catch (err) {
            console.warn('SceneUtils.showMessage failed:', err);
            return null;
        }
    };

    // 將工具掛到全域，維持非 module 的載入方式
    window.SceneUtils = SceneUtils;
})();
