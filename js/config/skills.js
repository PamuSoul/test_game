// 技能定義與計算（掛到全域 window.SKILLS）
// 此檔案負責放技能的詳細數值、機率與傷害計算邏輯。
(function(){
    const SKILLS = {};

    // 二刀流 (dual_strike)
    // - 每等級提供觸發機率提升
    // - 觸發時造成一次額外攻擊（預設與主攻擊同樣傷害）
    SKILLS.dual_strike = {
        id: 'dual_strike',
        name: '二刀流',
        description: '有機率進行第二次攻擊，造成與第一次相同的傷害。',
        // 回傳該等級的觸發機率 (0~1)
        getChance: function(level){
            level = Math.max(1, Math.floor(level || 1));
            // 範例：等級1:15% 等級2:25% 等級3:35% 等級4:45%... 上限 70%
            const chance = Math.min(0.15 + (level - 1) * 0.10, 0.7);
            return chance;
        },
        // 計算額外攻擊的傷害（可依等級調整）
        // baseDamage: 主攻擊造成的傷害（已考慮防禦後的最終數值）
        calculateExtraDamage: function(baseDamage, level){
            level = Math.max(1, Math.floor(level || 1));
            // 預設第二擊為與第一擊相同的傷害；可根據等級調整乘數
            const multiplier = 1.0; // 未來可改成 1 + 0.05*(level-1)
            return Math.max(1, Math.floor(baseDamage * multiplier));
        }
    };

    // 通用 API
    SKILLS.get = function(key){
        return SKILLS[key];
    };

    SKILLS.shouldTrigger = function(key, level){
        const skill = SKILLS.get(key);
        if (!skill) return false;
        const chance = (typeof skill.getChance === 'function') ? skill.getChance(level) : 0;
        return Math.random() < chance;
    };

    SKILLS.calculateExtraDamage = function(key, baseDamage, level){
        const skill = SKILLS.get(key);
        if (!skill) return 0;
        if (typeof skill.calculateExtraDamage === 'function') return skill.calculateExtraDamage(baseDamage, level);
        return 0;
    };

    // 掛到全域
    window.SKILLS = SKILLS;
})();
