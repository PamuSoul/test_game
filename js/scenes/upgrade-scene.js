// 強化場景（已從 game-scenes.js 拆出）
class UpgradeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UpgradeScene' });
    }

    create() {
        // 背景（共用）
        SceneUtils.ensureBackground(this, 'backgroundImg', 187.5, 333.5, 375, 667);

        // 金錢顯示（共用）
    this.currentMoney = GameDatabase.loadMoney();
    // 使用與 StartScene 相同的金幣顯示樣式（位置與大小一致）
    const moneyWidget = SceneUtils.createMoneyWidget(this, 332.5, 20, 85, 30);
        this.moneyText = moneyWidget.text;

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
    // 返回按鈕（共用）
    SceneUtils.createBackButton(this, 187.5, 580, 'StartScene');
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

        this.add.text(50, yPos + 45, `費用: ${SceneUtils.formatMoney(cost)} 金錢`, {
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

        this.add.text(50, yPos + 45, `費用: ${SceneUtils.formatMoney(cost)} 金錢`, {
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
        this.add.text(50, yPos + 45, `費用: ${SceneUtils.formatMoney(cost)} 金錢`, {
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
                // 播放按鈕音效（安全呼叫）
                try {
                    if (this.sound && this.sound.play) {
                        this.sound.play('buttonClick', { volume: 0.6 });
                    }
                } catch (err) {
                    console.warn('buttonClick sound play failed:', err);
                }

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
            try {
                if (this.sound && this.sound.play) {
                    this.sound.play('buttonClick', { volume: 0.6 });
                }
            } catch (err) {
                console.warn('buttonClick sound play failed:', err);
            }

            backButton.setScale(0.95);
            this.time.delayedCall(100, () => {
                backButton.setScale(1);
                this.scene.start('StartScene');
            });
        });
    }
}
