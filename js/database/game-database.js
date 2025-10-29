// 持久化資料庫系統
const GameDatabase = {
    // === 金錢系統 ===
    saveMoney(amount) {
        localStorage.setItem('gamePlayerMoney', amount.toString());
    },
    
    loadMoney() {
        const saved = localStorage.getItem('gamePlayerMoney');
        return saved ? parseInt(saved) : 0; // 預設為 0 金錢
    },
    
    addMoney(amount) {
        const currentMoney = this.loadMoney();
        const newAmount = currentMoney + amount;
        this.saveMoney(newAmount);
        return newAmount;
    },
    
    spendMoney(amount) {
        const currentMoney = this.loadMoney();
        if (currentMoney >= amount) {
            const newAmount = currentMoney - amount;
            this.saveMoney(newAmount);
            return newAmount;
        }
        return currentMoney; // 金錢不足時不變
    },
    
    resetMoney() {
        this.saveMoney(0);
    },
    
    // === 攻擊力系統 ===
    saveAttack(amount) {
        localStorage.setItem('playerAttack', amount.toString());
    },
    
    loadAttack() {
        const saved = localStorage.getItem('playerAttack');
        return saved ? parseInt(saved) : 10; // 預設攻擊力 10
    },
    
    upgradeAttack(amount) {
        const currentAttack = this.loadAttack();
        const newAttack = currentAttack + amount;
        this.saveAttack(newAttack);
        return newAttack;
    },
    
    // === 防禦力系統 ===
    saveDefense(amount) {
        localStorage.setItem('playerDefense', amount.toString());
    },
    
    loadDefense() {
        const saved = localStorage.getItem('playerDefense');
        return saved ? parseInt(saved) : 5; // 預設防禦力 5
    },
    
    upgradeDefense(amount) {
        const currentDefense = this.loadDefense();
        const newDefense = currentDefense + amount;
        this.saveDefense(newDefense);
        return newDefense;
    },

    // === 裝備系統 ===
    // 裝備品質等級: 0=白色, 1=藍色, 2=金色, 3=紫色
    // 裝備類型: weapon=武器, armor=防具, shield=盾牌, boots=鞋子
    
    saveEquippedItems(equipment) {
        localStorage.setItem('playerEquipment', JSON.stringify(equipment));
    },
    
    loadEquippedItems() {
        const saved = localStorage.getItem('playerEquipment');
        return saved ? JSON.parse(saved) : {
            weapon: null,
            armor: null,
            shield: null,
            boots: null
        };
    },
    
    saveEquipmentInventory(inventory) {
        localStorage.setItem('equipmentInventory', JSON.stringify(inventory));
    },
    
    loadEquipmentInventory() {
        const saved = localStorage.getItem('equipmentInventory');
        if (saved) {
            return JSON.parse(saved);
        } else {
            const emptyInventory = [];
            this.saveEquipmentInventory(emptyInventory);
            return emptyInventory;
        }
    },
    
    addEquipmentToInventory(equipment) {
        const inventory = this.loadEquipmentInventory();
        
        if (inventory.length >= 20) {
            console.log('背包已滿，無法添加裝備');
            return false;
        }
        
        equipment.id = Date.now() + Math.random();
        inventory.push(equipment);
        this.saveEquipmentInventory(inventory);
        console.log(`成功添加裝備到背包: ${equipment.name}`);
        return true;
    },
    
    removeEquipmentFromInventory(equipmentId) {
        const inventory = this.loadEquipmentInventory();
        const newInventory = inventory.filter(item => item.id !== equipmentId);
        this.saveEquipmentInventory(newInventory);
        return newInventory;
    },
    
    equipItem(equipment) {
        const currentEquipment = this.loadEquippedItems();
        const inventory = this.loadEquipmentInventory();
        
        if (currentEquipment[equipment.type]) {
            inventory.push(currentEquipment[equipment.type]);
        }
        
        currentEquipment[equipment.type] = equipment;
        const newInventory = inventory.filter(item => item.id !== equipment.id);
        
        this.saveEquippedItems(currentEquipment);
        this.saveEquipmentInventory(newInventory);
        
        return { equipment: currentEquipment, inventory: newInventory };
    },
    
    unequipItem(equipmentType) {
        const currentEquipment = this.loadEquippedItems();
        const inventory = this.loadEquipmentInventory();
        
        if (currentEquipment[equipmentType]) {
            inventory.push(currentEquipment[equipmentType]);
            currentEquipment[equipmentType] = null;
            
            this.saveEquippedItems(currentEquipment);
            this.saveEquipmentInventory(inventory);
        }
        
        return { equipment: currentEquipment, inventory: inventory };
    },
    
    enhanceEquipment(equipment, cost) {
        if (this.spendMoney(cost) < this.loadMoney()) {
            return false;
        }
        
        if (equipment.level >= 10) {
            return false;
        }
        
        equipment.level += 1;
        return true;
    },
    
    synthesizeEquipment(equipment1, equipment2) {
        if (equipment1.type !== equipment2.type || 
            equipment1.quality !== equipment2.quality || 
            equipment1.name !== equipment2.name) {
            return null;
        }
        
        if (equipment1.quality >= 3) {
            return null;
        }
        
        const newQuality = equipment1.quality + 1;
        const newName = this.getUpgradedEquipmentName(equipment1.name, newQuality);
        
        const newEquipment = {
            id: Date.now() + Math.random(),
            type: equipment1.type,
            name: newName,
            quality: newQuality,
            level: 0,
            enhancement: 0
        };
        
        if (equipment1.type === 'weapon') {
            const attackValues = [5, 8, 12, 18];
            newEquipment.baseAttack = attackValues[newQuality] || attackValues[3];
        } else {
            const defenseValues = {
                'armor': [4, 6, 10, 15],
                'shield': [3, 5, 8, 12], 
                'boots': [2, 4, 6, 10]
            };
            const values = defenseValues[equipment1.type] || defenseValues['armor'];
            newEquipment.baseDefense = values[newQuality] || values[3];
        }
        
        return newEquipment;
    },
    
    getUpgradedEquipmentName(baseName, quality) {
        const upgradeMap = {
            '生鏽劍': ['生鏽劍', '鐵劍', '黃金劍', '傳說劍'],
            '鐵劍': ['生鏽劍', '鐵劍', '黃金劍', '傳說劍'],
            '黃金劍': ['生鏽劍', '鐵劍', '黃金劍', '傳說劍'],
            '傳說劍': ['生鏽劍', '鐵劍', '黃金劍', '傳說劍'],
            '布甲': ['布甲', '鐵甲', '黃金甲', '傳說甲'],
            '鐵甲': ['布甲', '鐵甲', '黃金甲', '傳說甲'],
            '黃金甲': ['布甲', '鐵甲', '黃金甲', '傳說甲'],
            '傳說甲': ['布甲', '鐵甲', '黃金甲', '傳說甲'],
            '木盾': ['木盾', '鐵盾', '黃金盾', '傳說盾'],
            '鐵盾': ['木盾', '鐵盾', '黃金盾', '傳說盾'],
            '黃金盾': ['木盾', '鐵盾', '黃金盾', '傳說盾'],
            '傳說盾': ['木盾', '鐵盾', '黃金盾', '傳說盾'],
            '草靴': ['草靴', '鐵靴', '黃金靴', '傳說靴'],
            '鐵靴': ['草靴', '鐵靴', '黃金靴', '傳說靴'],
            '黃金靴': ['草靴', '鐵靴', '黃金靴', '傳說靴'],
            '傳說靴': ['草靴', '鐵靴', '黃金靴', '傳說靴']
        };
        
        const cleanName = baseName.replace(/^(精良|稀有|史詩)\s*/, '');
        const upgradePath = upgradeMap[cleanName];
        if (upgradePath && quality >= 0 && quality < upgradePath.length) {
            return upgradePath[quality];
        }
        
        const qualityPrefixes = ['', '精良', '稀有', '史詩'];
        return quality > 0 ? `${qualityPrefixes[quality]} ${cleanName}` : cleanName;
    },

    // === 技能系統（單場遊戲臨時技能）===
    learnSkill(skillId, skillData) {
        return { learned: true, level: 1 };
    },

    hasSkill(skillId) {
        return null;
    }
};