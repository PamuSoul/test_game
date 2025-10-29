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
        name: "技能商店",
        description: "你遇到了一位神秘的技能大師，他可以傳授你特殊技能。",
        type: "skill_shop",  // 標記為技能商店類型事件
        skills: [
            {
                id: "dual_strike",
                name: "二刀流",
                description: "10%機率可攻擊第二次（僅本局有效）",
                price: 100,
                chance: 0.1
            }
        ],
        weight: 15  // 中等機率事件
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
        description: "你觸碰了古老詛咒石碑，召喚出邪惡守護者！",
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
        description: "你進入古老神廟，感受到神聖的力量。",
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
        name: "廢棄武器庫",
        description: "你發現廢棄武器庫，裡面有些還能用的裝備。",
        type: "equipment",
        equipment: {
            type: 'weapon',
            name: '生鏽劍',
            quality: 0,
            level: 0,
            enhancement: 0,
            baseAttack: 5
        },
        effect: { message: "獲得了 生鏽劍！" },
        weight: 8   // 中等機率的裝備事件
    },
    {
        name: "遺棄護甲",
        description: "路邊有套被丟棄的舊護甲，還能穿。",
        type: "equipment",
        equipment: {
            type: 'armor',
            name: '布甲',
            quality: 0,
            level: 0,
            enhancement: 0,
            baseDefense: 4
        },
        effect: { message: "獲得了 布甲！" },
        weight: 8   // 中等機率的裝備事件
    },
    {
        name: "破舊盾牌",
        description: "你在戰場遺跡找到還能用的盾牌。",
        type: "equipment",
        equipment: {
            type: 'shield',
            name: '木盾',
            quality: 0,
            level: 0,
            enhancement: 0,
            baseDefense: 3
        },
        effect: { message: "獲得了 木盾！" },
        weight: 8   // 中等機率的裝備事件
    },
    {
        name: "舊靴子",
        description: "路邊有人遺失的靴子，看起來還能穿。",
        type: "equipment",
        equipment: {
            type: 'boots',
            name: '草靴',
            quality: 0,
            level: 0,
            enhancement: 0,
            baseDefense: 2
        },
        effect: { message: "獲得了 草靴！" },
        weight: 8   // 中等機率的裝備事件
    },
    {
        name: "精良武器店",
        description: "你發現隱密武器店，老闆贈送精良武器。",
        type: "equipment",
        equipment: {
            type: 'weapon',
            name: '鐵劍',
            quality: 1,
            level: 0,
            enhancement: 0,
            baseAttack: 8
        },
        effect: { message: "獲得了 精良 鐵劍！" },
        weight: 4   // 較稀有的藍色裝備事件
    },
    {
        name: "騎士遺物",
        description: "你在古老墓穴發現騎士護甲。",
        type: "equipment",
        equipment: {
            type: 'armor',
            name: '鐵甲',
            quality: 1,
            level: 0,
            enhancement: 0,
            baseDefense: 6
        },
        effect: { message: "獲得了 精良 鐵甲！" },
        weight: 4   // 較稀有的藍色裝備事件
    },
    {
        name: "鐵匠的禮物",
        description: "感激的鐵匠送你親手打造的精良盾牌。",
        type: "equipment",
        equipment: {
            type: 'shield',
            name: '鐵盾',
            quality: 1,
            level: 0,
            enhancement: 0,
            baseDefense: 5
        },
        effect: { message: "獲得了 精良 鐵盾！" },
        weight: 4   // 較稀有的藍色裝備事件
    },
    {
        name: "工匠靴子",
        description: "你在工匠作坊發現精良靴子。",
        type: "equipment",
        equipment: {
            type: 'boots',
            name: '鐵靴',
            quality: 1,
            level: 0,
            enhancement: 0,
            baseDefense: 4
        },
        effect: { message: "獲得了 精良 鐵靴！" },
        weight: 4   // 較稀有的藍色裝備事件
    },
    {
        name: "黃金寶箱",
        description: "你發現金光閃閃的寶箱，裡面有稀有裝備！",
        type: "equipment",
        equipment: {
            type: 'weapon',
            name: '黃金劍',
            quality: 2,
            level: 0,
            enhancement: 0,
            baseAttack: 12
        },
        effect: { message: "獲得了 稀有 黃金劍！" },
        weight: 2   // 稀有的金色裝備事件
    },
    {
        name: "黃金護甲",
        description: "你在寶庫發現金光閃閃的護甲！",
        type: "equipment",
        equipment: {
            type: 'armor',
            name: '黃金甲',
            quality: 2,
            level: 0,
            enhancement: 0,
            baseDefense: 10
        },
        effect: { message: "獲得了 稀有 黃金甲！" },
        weight: 2   // 稀有的金色裝備事件
    },
    {
        name: "黃金盾牌",
        description: "你在寶庫發現金光閃閃的盾牌！",
        type: "equipment",
        equipment: {
            type: 'shield',
            name: '黃金盾',
            quality: 2,
            level: 0,
            enhancement: 0,
            baseDefense: 8
        },
        effect: { message: "獲得了 稀有 黃金盾！" },
        weight: 2   // 稀有的金色裝備事件
    },
    {
        name: "黃金靴子",
        description: "你在寶庫發現金光閃閃的靴子！",
        type: "equipment",
        equipment: {
            type: 'boots',
            name: '黃金靴',
            quality: 2,
            level: 0,
            enhancement: 0,
            baseDefense: 6
        },
        effect: { message: "獲得了 稀有 黃金靴！" },
        weight: 2   // 稀有的金色裝備事件
    },
    {
        name: "傳說遺跡",
        description: "你在古老遺跡深處發現傳說級裝備！",
        type: "equipment",
        equipment: {
            type: 'armor',
            name: '傳說甲',
            quality: 3,
            level: 0,
            enhancement: 0,
            baseDefense: 15
        },
        effect: { message: "獲得了 史詩 傳說甲！" },
        weight: 1   // 極稀有的紫色裝備事件
    },
    {
        name: "傳說武器庫",
        description: "你在遺跡深處發現傳說級武器！",
        type: "equipment",
        equipment: {
            type: 'weapon',
            name: '傳說劍',
            quality: 3,
            level: 0,
            enhancement: 0,
            baseAttack: 18
        },
        effect: { message: "獲得了 史詩 傳說劍！" },
        weight: 1   // 極稀有的紫色裝備事件
    },
    {
        name: "傳說盾牌",
        description: "你在遺跡深處發現傳說級盾牌！",
        type: "equipment",
        equipment: {
            type: 'shield',
            name: '傳說盾',
            quality: 3,
            level: 0,
            enhancement: 0,
            baseDefense: 12
        },
        effect: { message: "獲得了 史詩 傳說盾！" },
        weight: 1   // 極稀有的紫色裝備事件
    },
    {
        name: "傳說靴子",
        description: "你在遺跡深處發現傳說級靴子！",
        type: "equipment",
        equipment: {
            type: 'boots',
            name: '傳說靴',
            quality: 3,
            level: 0,
            enhancement: 0,
            baseDefense: 10
        },
        effect: { message: "獲得了 史詩 傳說靴！" },
        weight: 1   // 極稀有的紫色裝備事件
    },
    {
        name: "盜賊襲擊",
        description: "一群盜賊企圖搶劫你！準備戰鬥！",
        type: "battle",
        monster: {
            name: "盜賊頭目",
            health: 490,
            maxHealth: 490,
            attack: 60,
            defense: 2,
            reward: { money: 25, message: "擊敗盜賊頭目獲得 250 金錢！" },
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