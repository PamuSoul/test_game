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
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// 遊戲變數
let player;
let playerHealth = 100;
let maxHealth = 100;
let healthBar;
let healthBarBg;
let healthText;
let eventTextBox;
let eventText;
let nextLevelButton;
let currentLevel = 1;

// 事件資料庫
const gameEvents = [
    {
        name: "找到寶箱",
        description: "你發現了一個神秘的寶箱！",
        effect: { health: 20, message: "恢復 20 點生命值！" }
    },
    {
        name: "遭遇怪物",
        description: "一隻凶猛的怪物突然出現！",
        effect: { health: -30, message: "失去 30 點生命值！" }
    },
    {
        name: "魔法泉水",
        description: "你發現了一口魔法泉水。",
        effect: { health: 50, message: "完全恢復生命值！" }
    },
    {
        name: "陷阱",
        description: "你不小心踩到了陷阱！",
        effect: { health: -15, message: "失去 15 點生命值！" }
    },
    {
        name: "友善商人",
        description: "一位友善的商人給了你藥水。",
        effect: { health: 25, message: "恢復 25 點生命值！" }
    },
    {
        name: "毒霧",
        description: "你走進了一片毒霧區域。",
        effect: { health: -20, message: "失去 20 點生命值！" }
    },
    {
        name: "聖光祝福",
        description: "神聖的光芒籠罩著你。",
        effect: { health: 35, message: "恢復 35 點生命值！" }
    },
    {
        name: "詛咒石碑",
        description: "你觸碰了一個古老的詛咒石碑。",
        effect: { health: -25, message: "失去 25 點生命值！" }
    },
    {
        name: "生命精華",
        description: "你發現了一顆閃閃發光的生命精華！",
        effect: { health: 20, maxHealth: 20, message: "最大生命值增加 20 點，並恢復 20 點生命值！" }
    },
    {
        name: "古老神廟",
        description: "你進入了一座古老的神廟，感受到神聖的力量。",
        effect: { health: 30, maxHealth: 15, message: "最大生命值增加 15 點，並恢復 30 點生命值！" }
    },
    {
        name: "龍血寶石",
        description: "你找到了傳說中的龍血寶石！",
        effect: { health: 50, maxHealth: 30, message: "最大生命值增加 30 點，並恢復 50 點生命值！" }
    },
    {
        name: "惡魔契約",
        description: "一個惡魔向你提出了可怕的契約...",
        effect: { health: 10, maxHealth: -10, message: "最大生命值減少 10 點，但恢復 10 點生命值！" }
    },
    {
        name: "生命之樹",
        description: "你發現了傳說中的生命之樹！",
        effect: { health: 0, maxHealth: 25, fullHeal: true, message: "最大生命值增加 25 點，並完全恢復生命值！" }
    }
];

function preload() {
    // 創建簡單的幾何圖形作為遊戲元素
    this.add.graphics()
        .fillStyle(0x4a90e2)
        .fillCircle(40, 40, 35)
        .generateTexture('player', 80, 80);
    
    this.add.graphics()
        .fillStyle(0xe74c3c)
        .fillRect(0, 0, 250, 25)
        .generateTexture('healthBarBg', 250, 25);
    
    this.add.graphics()
        .fillStyle(0x27ae60)
        .fillRect(0, 0, 250, 25)
        .generateTexture('healthBar', 250, 25);
    
    // 創建可變寬度的血量條材質（用於最大血量變化）
    this.add.graphics()
        .fillStyle(0xe74c3c)
        .fillRect(0, 0, 300, 25)
        .generateTexture('healthBarBgLarge', 300, 25);
    
    this.add.graphics()
        .fillStyle(0x27ae60)
        .fillRect(0, 0, 300, 25)
        .generateTexture('healthBarLarge', 300, 25);
}

function create() {
    // 創建玩家
    player = this.add.sprite(187.5, 180, 'player');
    player.setScale(1.2);

    // 遊戲標題
    this.add.text(187.5, 50, '事件冒險遊戲', {
        fontSize: '22px',
        fill: '#2c3e50',
        fontWeight: 'bold'
    }).setOrigin(0.5);

    // 關卡顯示
    const levelText = this.add.text(187.5, 80, `第 ${currentLevel} 關`, {
        fontSize: '18px',
        fill: '#2c3e50',
        fontWeight: 'bold'
    }).setOrigin(0.5);

    // 創建血量條背景
    healthBarBg = this.add.image(187.5, 120, 'healthBarBg');
    healthBarBg.setOrigin(0.5);

    // 創建血量條
    healthBar = this.add.image(62.5, 120, 'healthBar');
    healthBar.setOrigin(0, 0.5);

    // 血量文字
    healthText = this.add.text(187.5, 145, `血量: ${playerHealth}/${maxHealth}`, {
        fontSize: '16px',
        fill: '#2c3e50',
        fontWeight: 'bold'
    }).setOrigin(0.5);

    // 玩家說明
    this.add.text(187.5, 240, '玩家', {
        fontSize: '16px',
        fill: '#2c3e50',
        fontWeight: 'bold'
    }).setOrigin(0.5);

    // 創建事件文字框
    const textBoxBg = this.add.graphics();
    textBoxBg.fillStyle(0xffffff, 0.9);
    textBoxBg.fillRoundedRect(20, 280, 335, 180, 10);
    textBoxBg.lineStyle(3, 0x34495e);
    textBoxBg.strokeRoundedRect(20, 280, 335, 180, 10);

    eventText = this.add.text(35, 300, '歡迎來到冒險遊戲！\n\n點擊「下一關」開始你的冒險旅程。', {
        fontSize: '14px',
        fill: '#2c3e50',
        wordWrap: { width: 305 },
        lineSpacing: 3
    });

    // 創建下一關按鈕
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x3498db);
    buttonBg.fillRoundedRect(-100, -30, 200, 60, 15);
    buttonBg.lineStyle(3, 0x2980b9);
    buttonBg.strokeRoundedRect(-100, -30, 200, 60, 15);

    // 創建按鈕容器，設定正確的原點
    nextLevelButton = this.add.container(187.5, 520, [buttonBg]);
    
    const buttonText = this.add.text(0, 0, '下一關', {
        fontSize: '20px',
        fill: '#ffffff',
        fontWeight: 'bold'
    });
    buttonText.setOrigin(0.5);
    nextLevelButton.add(buttonText);

    // 設置按鈕互動 - 修正感應範圍
    nextLevelButton.setSize(200, 60);
    nextLevelButton.setInteractive(new Phaser.Geom.Rectangle(-100, -30, 200, 60), Phaser.Geom.Rectangle.Contains);
    
    // 添加視覺回饋
    nextLevelButton.on('pointerdown', () => {
        // 添加按下效果
        nextLevelButton.setScale(0.95);
        this.time.delayedCall(100, () => {
            nextLevelButton.setScale(1);
        });
        triggerRandomEvent();
    });

    nextLevelButton.on('pointerover', () => {
        buttonBg.clear();
        buttonBg.fillStyle(0x2980b9);
        buttonBg.fillRoundedRect(-100, -30, 200, 60, 15);
        buttonBg.lineStyle(3, 0x2980b9);
        buttonBg.strokeRoundedRect(-100, -30, 200, 60, 15);
        // 添加輕微放大效果
        nextLevelButton.setScale(1.05);
    });

    nextLevelButton.on('pointerout', () => {
        buttonBg.clear();
        buttonBg.fillStyle(0x3498db);
        buttonBg.fillRoundedRect(-100, -30, 200, 60, 15);
        buttonBg.lineStyle(3, 0x2980b9);
        buttonBg.strokeRoundedRect(-100, -30, 200, 60, 15);
        // 恢復原始大小
        nextLevelButton.setScale(1);
    });
}

function update() {
    // 遊戲主迴圈（目前不需要持續更新的邏輯）
}

// 觸發隨機事件
function triggerRandomEvent() {
    if (playerHealth <= 0) {
        eventText.setText('遊戲結束！\n你的血量已經歸零。\n重新整理頁面重新開始遊戲。');
        nextLevelButton.setVisible(false);
        return;
    }

    // 隨機選擇事件
    const randomEvent = gameEvents[Math.floor(Math.random() * gameEvents.length)];
    
    // 更新關卡
    currentLevel++;
    
    // 應用事件效果
    let healthChange = randomEvent.effect.health || 0;
    let maxHealthChange = randomEvent.effect.maxHealth || 0;
    let fullHeal = randomEvent.effect.fullHeal || false;
    
    // 處理最大血量變化
    if (maxHealthChange !== 0) {
        maxHealth += maxHealthChange;
        // 確保最大血量不低於 50
        maxHealth = Math.max(50, maxHealth);
    }
    
    // 特殊處理：如果是魔法泉水或生命之樹，完全恢復
    if (randomEvent.name === "魔法泉水" || fullHeal) {
        playerHealth = maxHealth;
    } else {
        playerHealth += healthChange;
    }
    
    // 確保血量在合理範圍內
    playerHealth = Math.max(0, Math.min(maxHealth, playerHealth));
    
    // 更新顯示
    updateHealthDisplay();
    
    // 創建詳細的狀態訊息
    let statusMessage = "";
    if (maxHealthChange > 0) {
        statusMessage += `\n✨ 你變得更強壯了！最大血量提升至 ${maxHealth} 點！`;
    } else if (maxHealthChange < 0) {
        statusMessage += `\n💀 你感到虛弱...最大血量降低至 ${maxHealth} 點。`;
    }
    
    if (playerHealth <= 0) {
        statusMessage += "\n\n💀 你已經死亡！遊戲結束。";
    } else if (playerHealth === maxHealth) {
        statusMessage += "\n\n💚 你的狀態非常好！";
    } else if (playerHealth < maxHealth * 0.3) {
        statusMessage += "\n\n⚠️ 危險！你的血量很低！";
    }
    
    eventText.setText(
        `第 ${currentLevel-1} 關 - ${randomEvent.name}\n\n` +
        `${randomEvent.description}\n` +
        `${randomEvent.effect.message}` +
        statusMessage
    );

    // 如果玩家死亡，隱藏按鈕
    if (playerHealth <= 0) {
        nextLevelButton.setVisible(false);
    }
}

// 更新血量顯示
function updateHealthDisplay() {
    const healthPercentage = playerHealth / maxHealth;
    
    // 根據最大血量調整血量條寬度
    const baseWidth = 250;
    const maxWidth = 300;
    const healthBarWidth = Math.min(maxWidth, baseWidth * (maxHealth / 100));
    
    // 更新血量條背景寬度
    healthBarBg.setScale(healthBarWidth / 250, 1);
    
    // 更新血量條寬度和填充
    healthBar.setScale((healthBarWidth / 250) * healthPercentage, 1);
    
    // 重新定位血量條（保持居中）
    const centerX = 187.5;
    healthBarBg.x = centerX;
    healthBar.x = centerX - (healthBarWidth / 2);
    
    healthText.setText(`血量: ${playerHealth}/${maxHealth}`);
    
    // 根據血量改變顏色
    if (healthPercentage > 0.6) {
        healthBar.setTint(0x27ae60); // 綠色
    } else if (healthPercentage > 0.3) {
        healthBar.setTint(0xf39c12); // 橙色
    } else {
        healthBar.setTint(0xe74c3c); // 紅色
    }
    
    // 如果最大血量很高，改變血量條顏色以示強化
    if (maxHealth > 150) {
        healthBarBg.setTint(0xf1c40f); // 金色背景表示強化
    } else if (maxHealth > 120) {
        healthBarBg.setTint(0x9b59b6); // 紫色背景表示提升
    } else {
        healthBarBg.setTint(0xffffff); // 白色背景（預設）
    }
}

// 啟動遊戲
const game = new Phaser.Game(config);