// 事件資料庫
const gameEvents = [
    {
        name: "找到寶箱",
        description: "你發現了一個神秘的寶箱！",
        effect: { health: 20, message: "恢復 20 點生命值！" },
        weight: 15  // 較常見的正面事件
    },
    {
        name: "遭遇怪物",
        description: "一隻凶猛的怪物突然出現！",
        effect: { health: -30, message: "失去 30 點生命值！" },
        weight: 12  // 較常見的負面事件
    },
    {
        name: "魔法泉水",
        description: "你發現了一口魔法泉水。",
        effect: { health: 50, message: "完全恢復生命值！" },
        weight: 8   // 中等機率的好事件
    },
    {
        name: "陷阱",
        description: "你不小心踩到了陷阱！",
        effect: { health: -15, message: "失去 15 點生命值！" },
        weight: 18  // 最常見的負面事件
    },
    {
        name: "友善商人",
        description: "一位友善的商人給了你藥水。",
        effect: { health: 25, message: "恢復 25 點生命值！" },
        weight: 10  // 中等機率的正面事件
    },
    {
        name: "毒霧",
        description: "你走進了一片毒霧區域。",
        effect: { health: -20, message: "失去 20 點生命值！" },
        weight: 14  // 常見的負面事件
    },
    {
        name: "聖光祝福",
        description: "神聖的光芒籠罩著你。",
        effect: { health: 35, message: "恢復 35 點生命值！" },
        weight: 6   // 較少見的正面事件
    },
    {
        name: "詛咒石碑",
        description: "你觸碰了一個古老的詛咒石碑。",
        effect: { health: -25, message: "失去 25 點生命值！" },
        weight: 9   // 中等機率的負面事件
    },
    {
        name: "生命精華",
        description: "你發現了一顆閃閃發光的生命精華！",
        effect: { health: 20, maxHealth: 20, message: "最大生命值增加 20 點，並恢復 20 點生命值！" },
        weight: 3   // 稀有的強化事件
    },
    {
        name: "古老神廟",
        description: "你進入了一座古老的神廟，感受到神聖的力量。",
        effect: { health: 30, maxHealth: 15, message: "最大生命值增加 15 點，並恢復 30 點生命值！" },
        weight: 4   // 稀有的強化事件
    },
    {
        name: "龍血寶石",
        description: "你找到了傳說中的龍血寶石！",
        effect: { health: 50, maxHealth: 30, message: "最大生命值增加 30 點，並恢復 50 點生命值！" },
        weight: 1   // 極稀有的強化事件
    },
    {
        name: "惡魔契約",
        description: "一個惡魔向你提出了可怕的契約...",
        effect: { health: 10, maxHealth: -10, message: "最大生命值減少 10 點，但恢復 10 點生命值！" },
        weight: 2   // 極稀有的詛咒事件
    },
    {
        name: "生命之樹",
        description: "你發現了傳說中的生命之樹！",
        effect: { health: 0, maxHealth: 25, fullHeal: true, message: "最大生命值增加 25 點，並完全恢復生命值！" },
        weight: 1   // 最稀有的終極事件
    },
    {
        name: "死神的鐮刀",
        description: "死神從陰影中現身，舉起了他的鐮刀...",
        effect: { instantDeath: true, message: "💀 死神奪走了你的生命！" },
        weight: 1   // 極稀有的即死事件
    }
  
];

// 根據權重隨機選擇事件
function getRandomEventByWeight() {
    // 計算總權重
    const totalWeight = gameEvents.reduce((sum, event) => sum + event.weight, 0);
    
    // 生成隨機數
    let randomValue = Math.random() * totalWeight;
    
    // 根據權重選擇事件
    for (let i = 0; i < gameEvents.length; i++) {
        randomValue -= gameEvents[i].weight;
        if (randomValue <= 0) {
            return gameEvents[i];
        }
    }
    
    // 備用方案（理論上不會執行到這裡）
    return gameEvents[gameEvents.length - 1];
}