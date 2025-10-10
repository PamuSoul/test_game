// 遊戲配置
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#87CEEB',
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
    }
];

function preload() {
    // 創建簡單的幾何圖形作為遊戲元素
    this.add.graphics()
        .fillStyle(0x4a90e2)
        .fillCircle(32, 32, 30)
        .generateTexture('player', 64, 64);
    
    this.add.graphics()
        .fillStyle(0xe74c3c)
        .fillRect(0, 0, 200, 20)
        .generateTexture('healthBarBg', 200, 20);
    
    this.add.graphics()
        .fillStyle(0x27ae60)
        .fillRect(0, 0, 200, 20)
        .generateTexture('healthBar', 200, 20);
}

function create() {
    // 創建玩家
    player = this.add.sprite(150, 300, 'player');
    player.setScale(1.5);

    // 創建血量條背景
    healthBarBg = this.add.image(150, 100, 'healthBarBg');
    healthBarBg.setOrigin(0, 0.5);

    // 創建血量條
    healthBar = this.add.image(150, 100, 'healthBar');
    healthBar.setOrigin(0, 0.5);

    // 血量文字
    healthText = this.add.text(150, 130, `血量: ${playerHealth}/${maxHealth}`, {
        fontSize: '18px',
        fill: '#2c3e50',
        fontWeight: 'bold'
    });

    // 關卡顯示
    const levelText = this.add.text(400, 50, `第 ${currentLevel} 關`, {
        fontSize: '24px',
        fill: '#2c3e50',
        fontWeight: 'bold'
    });

    // 創建事件文字框
    const textBoxBg = this.add.graphics();
    textBoxBg.fillStyle(0xffffff, 0.9);
    textBoxBg.fillRoundedRect(50, 400, 700, 120, 10);
    textBoxBg.lineStyle(3, 0x34495e);
    textBoxBg.strokeRoundedRect(50, 400, 700, 120, 10);

    eventText = this.add.text(70, 420, '歡迎來到冒險遊戲！\n點擊「下一關」開始你的冒險旅程。', {
        fontSize: '16px',
        fill: '#2c3e50',
        wordWrap: { width: 660 },
        lineSpacing: 5
    });

    // 創建下一關按鈕
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x3498db);
    buttonBg.fillRoundedRect(0, 0, 120, 50, 10);
    buttonBg.lineStyle(2, 0x2980b9);
    buttonBg.strokeRoundedRect(0, 0, 120, 50, 10);

    nextLevelButton = this.add.container(600, 350, [buttonBg]);
    
    const buttonText = this.add.text(60, 25, '下一關', {
        fontSize: '18px',
        fill: '#ffffff',
        fontWeight: 'bold'
    });
    buttonText.setOrigin(0.5);
    nextLevelButton.add(buttonText);

    // 設置按鈕互動
    nextLevelButton.setSize(120, 50);
    nextLevelButton.setInteractive();
    
    nextLevelButton.on('pointerdown', () => {
        triggerRandomEvent();
    });

    nextLevelButton.on('pointerover', () => {
        buttonBg.clear();
        buttonBg.fillStyle(0x2980b9);
        buttonBg.fillRoundedRect(0, 0, 120, 50, 10);
        buttonBg.lineStyle(2, 0x2980b9);
        buttonBg.strokeRoundedRect(0, 0, 120, 50, 10);
    });

    nextLevelButton.on('pointerout', () => {
        buttonBg.clear();
        buttonBg.fillStyle(0x3498db);
        buttonBg.fillRoundedRect(0, 0, 120, 50, 10);
        buttonBg.lineStyle(2, 0x2980b9);
        buttonBg.strokeRoundedRect(0, 0, 120, 50, 10);
    });

    // 玩家說明
    this.add.text(400, 100, '玩家', {
        fontSize: '18px',
        fill: '#2c3e50',
        fontWeight: 'bold'
    });

    // 遊戲說明
    this.add.text(50, 50, '事件冒險遊戲', {
        fontSize: '28px',
        fill: '#2c3e50',
        fontWeight: 'bold'
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
    let healthChange = randomEvent.effect.health;
    
    // 特殊處理：如果是魔法泉水，完全恢復
    if (randomEvent.name === "魔法泉水") {
        playerHealth = maxHealth;
    } else {
        playerHealth += healthChange;
    }
    
    // 確保血量在合理範圍內
    playerHealth = Math.max(0, Math.min(maxHealth, playerHealth));
    
    // 更新顯示
    updateHealthDisplay();
    
    // 更新事件文字
    let statusMessage = playerHealth <= 0 ? "\n\n你已經死亡！遊戲結束。" : 
                       playerHealth === maxHealth ? "\n\n你的狀態非常好！" :
                       playerHealth < 30 ? "\n\n危險！你的血量很低！" : "";
    
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
    healthBar.setScale(healthPercentage, 1);
    healthText.setText(`血量: ${playerHealth}/${maxHealth}`);
    
    // 根據血量改變顏色
    if (healthPercentage > 0.6) {
        healthBar.setTint(0x27ae60); // 綠色
    } else if (healthPercentage > 0.3) {
        healthBar.setTint(0xf39c12); // 橙色
    } else {
        healthBar.setTint(0xe74c3c); // 紅色
    }
}

// 啟動遊戲
const game = new Phaser.Game(config);