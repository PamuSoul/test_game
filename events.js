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
        description: "一隻凶猛的怪物突然出現！準備戰鬥！",
        type: "battle",  // 標記為戰鬥類型事件
        monster: {
            name: "野狼",
            health: 80,
            maxHealth: 80,
            attack: 8,
            defense: 3,
            reward: { money: 15, message: "擊敗野狼獲得 15 金錢！" },
            escapeMessage: "野狼逃跑了！沒有獲得任何獎勵。"
        },
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
        description: "一位友善的商人向你展示他的商品。",
        type: "shop",  // 標記為商店類型事件
        shopItems: [
            {
                name: "治療藥水",
                description: "恢復 30 點生命值",
                price: 15,
                effect: { health: 30, message: "使用治療藥水恢復 30 點生命值！" }
            },
            {
                name: "大型治療藥水",
                description: "恢復 50 點生命值",
                price: 25,
                effect: { health: 50, message: "使用大型治療藥水恢復 50 點生命值！" }
            },
            {
                name: "生命護符",
                description: "臨時增加 15 點最大生命值",
                price: 40,
                effect: { maxHealth: 15, message: "生命護符臨時增加了 15 點最大生命值！" }
            },
            {
                name: "龍鱗盔甲",
                description: "臨時增加 25 點最大生命值",
                price: 60,
                effect: { maxHealth: 25, message: "龍鱗盔甲臨時增加了 25 點最大生命值！" }
            },
            {
                name: "銳利武器",
                description: "臨時增加 2 點攻擊力",
                price: 35,
                effect: { attack: 2, message: "銳利武器臨時增加了 2 點攻擊力！" }
            },
            {
                name: "守護盾牌",
                description: "臨時增加 2 點防禦力",
                price: 35,
                effect: { defense: 2, message: "守護盾牌臨時增加了 2 點防禦力！" }
            }
        ],
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
        description: "你觸碰了一個古老的詛咒石碑，召喚出邪惡守護者！",
        type: "battle",
        monster: {
            name: "石碑守護者",
            health: 70,
            maxHealth: 70,
            attack: 12,
            defense: 5,
            reward: { money: 12, message: "擊敗石碑守護者獲得 12 金錢！" },
            escapeMessage: "石碑守護者消失在迷霧中！沒有獲得任何獎勵。"
        },
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
    },
    {
        name: "盜賊襲擊",
        description: "一群盜賊企圖搶劫你！準備戰鬥！",
        type: "battle",
        monster: {
            name: "盜賊頭目",
            health: 90,
            maxHealth: 90,
            attack: 10,
            defense: 2,
            reward: { money: 25, message: "擊敗盜賊頭目獲得 25 金錢！" },
            escapeMessage: "盜賊們四散逃跑！沒有獲得任何獎勵。"
        },
        weight: 8   // 中等機率的敵人事件
    },
    {
        name: "野狼群",
        description: "一群飢餓的野狼圍攻你！準備迎戰狼王！",
        type: "battle",
        monster: {
            name: "狼王",
            health: 100,
            maxHealth: 100,
            attack: 15,
            defense: 4,
            reward: { money: 10, message: "擊敗狼王獲得 10 金錢！" },
            escapeMessage: "狼王帶著狼群撤退了！沒有獲得任何獎勵。"
        },
        weight: 7   // 較危險的敵人事件
    },
    {
        name: "哥布林商隊",
        description: "你遭遇了哥布林商隊！哥布林戰士準備戰鬥！",
        type: "battle",
        monster: {
            name: "哥布林戰士",
            health: 60,
            maxHealth: 60,
            attack: 7,
            defense: 1,
            reward: { money: 30, message: "擊敗哥布林戰士獲得商隊的 30 金錢！" },
            escapeMessage: "哥布林商隊逃走了！沒有獲得任何獎勵。"
        },
        weight: 5   // 較稀有但有利可圖的事件
    },
    {
        name: "龍族幼崽",
        description: "你遇到了一隻迷路的龍族幼崽！它感謝你的幫助。",
        effect: { health: 10, money: 50, message: "恢復 10 點生命值！獲得龍族贈送的 50 金錢！" },
        weight: 2   // 稀有的正面敵人事件
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