// ==================== GAME STATE ====================
// Global game state management

import { CONFIG } from './config.js';
import { getHeroSkills, getHeroPassive } from './data/heroSkills.js';
import { HEROES } from './data/heroes.js';

// 5 Core Player Stats
export const STATS = {
    STR: 'str',  // Strength - melee damage
    SPD: 'spd',  // Speed - movement speed
    VIT: 'vit',  // Vitality - max HP
    MAG: 'mag',  // Magic - ranged damage & cooldown
    STA: 'sta',  // Stamina - sprint duration & regen
};

// Stat info for UI
export const STAT_INFO = {
    str: { name: 'STRENGTH', icon: '⚔️', desc: 'Melee damage', color: [255, 100, 100] },
    spd: { name: 'SPEED', icon: '👟', desc: 'Movement speed', color: [100, 255, 150] },
    vit: { name: 'VITALITY', icon: '❤️', desc: 'Maximum HP', color: [255, 100, 150] },
    mag: { name: 'MAGIC', icon: '🔮', desc: 'Ranged damage & cooldown', color: [150, 100, 255] },
    sta: { name: 'STAMINA', icon: '💨', desc: 'Sprint duration', color: [100, 200, 255] },
};

// Upgrade costs (gold) for each stat level
export const UPGRADE_COSTS = [50, 100, 200, 350, 500, 750, 1000, 1500];

// Default keybinds
const DEFAULT_KEYBINDS = {
    meleeAttack: 'space',
    rangedAttack: 'e',
    ultimate: 'q',
    sprint: 'shift',
};

// Current keybinds (can be modified in options)
export const KEYBINDS = { ...DEFAULT_KEYBINDS };

export function setKeybind(action, key) {
    KEYBINDS[action] = key;
    // Save to localStorage
    try {
        localStorage.setItem('slimeHunterKeybinds', JSON.stringify(KEYBINDS));
    } catch (e) {}
}

export function resetKeybinds() {
    Object.assign(KEYBINDS, DEFAULT_KEYBINDS);
    try {
        localStorage.removeItem('slimeHunterKeybinds');
    } catch (e) {}
}

// Load saved keybinds
try {
    const saved = localStorage.getItem('slimeHunterKeybinds');
    if (saved) {
        Object.assign(KEYBINDS, JSON.parse(saved));
    }
} catch (e) {}

export const GS = {
    player: null,
    score: 0,
    gold: 0,
    currentLevel: 1,
    currentRoom: 0,        // Current room in level (0 = first room) - SYNCED with dungeon.currentRoomId
    totalRooms: 2,         // Total rooms in current level
    roomCleared: false,    // Is current room cleared?
    enemies: [],
    enemiesKilled: 0,
    roomEnemiesKilled: 0,  // Enemies killed in current room
    roomEnemyCount: 0,     // Total enemies in current room
    hasKey: false,           // Legacy - keep for compatibility
    doorOpen: false,
    bossSpawned: false,
    gamePaused: false,
    gameFrozen: false,  // For boss dialogue freeze
    playerLevel: 1,
    playerXP: 0,
    joystickInput: { x: 0, y: 0 },
    lastMoveDir: { x: 1, y: 0 },
    dungeon: null,          // DungeonManager instance - persists between scenes
    collectedKeys: [],     // Array of collected key IDs for current level: [0, 1, 2] = collected keys from rooms 0, 1, 2
    
    // Selected hero
    selectedHero: 'warrior',
    
    // Skill selection state
    skillSelectOpen: null,  // null = not open, true = open, false = just closed
    
    // Ultimate charge (fills by killing enemies)
    ultimateCharge: 0,
    ultimateMax: 6,  // Updated from hero config
    ultimateReady: false,
    
    // Player stats (start at level 1)
    stats: {
        str: 1,  // Strength
        spd: 1,  // Speed
        vit: 1,  // Vitality
        mag: 1,  // Magic
        sta: 1,  // Stamina
    },
    
    // Passive skills (perks) - permanent upgrades (shop)
    passiveSkills: {
        poison: 0,       // Level 0 = not owned
        vampirism: 0,
        thorns: 0,
        critical: 0,
        goldMagnet: 0,
        regeneration: 0,
    },
    
    // Hero-specific skills (upgraded with skill points)
    heroSkills: {
        // Passive skill level (0-4, always active)
        passive: 0,  // Level of passive skill
        
        // Active skill levels (0-4)
        skillE: 0,   // Level of E skill
        skillR: 0,   // Level of R skill
        skillQ: 0,   // Level of Q skill (ultimate)
    },
    
    // Skill points (gained on level up)
    skillPoints: 0,
    
    // Full reset (new game)
    reset() {
        this.score = 0;
        this.gold = 0;
        this.currentLevel = 1;
        this.currentRoom = 0;
        this.totalRooms = 2;
        this.roomCleared = false;
        this.enemies = [];
        this.enemiesKilled = 0;
        this.roomEnemiesKilled = 0;
        this.roomEnemyCount = 0;
        this.hasKey = false;
        this.doorOpen = false;
        this.bossSpawned = false;
        this.gamePaused = false;
        this.gameFrozen = false;
        this.playerLevel = 1;
        this.playerXP = 0;
        this.ultimateCharge = 0;
        this.ultimateReady = false;
        this.stats = { str: 1, spd: 1, vit: 1, mag: 1, sta: 1 };
        this.passiveSkills = {
            poison: 0,
            vampirism: 0,
            thorns: 0,
            critical: 0,
            goldMagnet: 0,
            regeneration: 0,
        };
        this.heroSkills = {
            passive: 0,
            skillE: 0,
            skillR: 0,
            skillQ: 0,
        };
        this.skillPoints = 0;
    },
    
    // Reset for next level (keep gold, stats & skills)
    resetLevel() {
        this.enemies = [];
        this.enemiesKilled = 0;
        this.currentRoom = 0;
        this.roomCleared = false;
        this.roomEnemiesKilled = 0;
        this.roomEnemyCount = 0;
        this.hasKey = false;
        this.doorOpen = false;
        this.bossSpawned = false;
        this.gamePaused = false;
        this.gameFrozen = false;
        this.collectedKeys = []; // Reset keys for new level
    },
    
    // Reset for next room in same level
    resetRoom() {
        this.enemies = [];
        this.roomCleared = false;
        this.roomEnemiesKilled = 0;
        this.roomEnemyCount = 0;
        this.doorOpen = false;
        this.gamePaused = false;
        this.gameFrozen = false;
    },
    
    // Get total rooms for current level
    getRoomsForLevel() {
        // More rooms for higher levels
        if (this.currentLevel <= 2) return 2;
        if (this.currentLevel <= 4) return 3;
        if (this.currentLevel <= 6) return 3;
        return 4; // Level 7 has 4 rooms
    },
    
    // Check if current room is boss room
    isBossRoom() {
        return this.currentRoom >= this.totalRooms - 1;
    },
    
    // Set hero (updates ultimate charge needed)
    setHero(heroId) {
        this.selectedHero = heroId;
    },
    
    // Add skill point (called on level up)
    addSkillPoint() {
        this.skillPoints++;
    },
    
    // Upgrade a skill (returns true if successful)
    upgradeSkill(skillKey) {
        if (this.skillPoints <= 0) return false;
        
        const maxLevel = 4;
        let currentLevel = 0;
        
        if (skillKey === 'passive') {
            currentLevel = this.heroSkills.passive;
            if (currentLevel >= maxLevel) return false;
            this.heroSkills.passive++;
        } else if (skillKey === 'E') {
            currentLevel = this.heroSkills.skillE;
            if (currentLevel >= maxLevel) return false;
            this.heroSkills.skillE++;
        } else if (skillKey === 'R') {
            currentLevel = this.heroSkills.skillR;
            if (currentLevel >= maxLevel) return false;
            this.heroSkills.skillR++;
        } else if (skillKey === 'Q') {
            currentLevel = this.heroSkills.skillQ;
            if (currentLevel >= maxLevel) return false;
            this.heroSkills.skillQ++;
        } else {
            return false;
        }
        
        this.skillPoints--;
        return true;
    },
    
    // Get skill level
    getSkillLevel(skillKey) {
        if (skillKey === 'passive') return this.heroSkills.passive;
        if (skillKey === 'E') return this.heroSkills.skillE;
        if (skillKey === 'R') return this.heroSkills.skillR;
        if (skillKey === 'Q') return this.heroSkills.skillQ;
        return 0;
    },
    
    // Add ultimate charge (from kills)
    addUltimateCharge(amount = 1) {
        if (this.ultimateReady) return;
        this.ultimateCharge += amount;
        if (this.ultimateCharge >= this.ultimateMax) {
            this.ultimateCharge = this.ultimateMax;
            this.ultimateReady = true;
        }
    },
    
    // Use ultimate
    useUltimate() {
        if (!this.ultimateReady) return false;
        this.ultimateCharge = 0;
        this.ultimateReady = false;
        return true;
    },
    
    // Add gold (with Gold Magnet bonus)
    addGold(amount) {
        const magnetLevel = this.passiveSkills.goldMagnet;
        const bonusPercent = magnetLevel > 0 ? [25, 50, 100][magnetLevel - 1] : 0;
        const finalAmount = Math.floor(amount * (1 + bonusPercent / 100));
        this.gold += finalAmount;
        return finalAmount;
    },
    
    // Get upgrade cost for a stat
    getUpgradeCost(stat) {
        const level = this.stats[stat] || 1;
        if (level >= UPGRADE_COSTS.length + 1) return -1; // Max level
        return UPGRADE_COSTS[level - 1];
    },
    
    // Upgrade a stat
    upgradeStat(stat) {
        const cost = this.getUpgradeCost(stat);
        if (cost < 0) return false; // Max level
        if (this.gold < cost) return false; // Not enough gold
        
        this.gold -= cost;
        this.stats[stat]++;
        return true;
    },
    
    // Upgrade a passive skill
    upgradePassiveSkill(skillId, cost) {
        if (this.gold < cost) return false;
        if (this.passiveSkills[skillId] >= 3) return false; // Max level 3
        
        this.gold -= cost;
        this.passiveSkills[skillId]++;
        return true;
    },
    
    addXP(amount) {
        this.playerXP += amount;
        let leveledUp = false;
        while (this.playerLevel < CONFIG.PLAYER_LEVEL.MAX_LEVEL && 
               this.playerXP >= CONFIG.PLAYER_LEVEL.XP_TABLE[this.playerLevel]) {
            this.playerLevel++;
            this.addSkillPoint(); // Add skill point on level up
            leveledUp = true;
        }
        return leveledUp;
    },
    
    // Get computed stats based on levels, hero, and skills
    getStats() {
        const s = this.stats;
        
        // Stat bonuses (unchanged)
        const strBonus = 1 + (s.str - 1) * 0.15;      // +15% melee per STR level
        const spdBonus = 1 + (s.spd - 1) * 0.10;      // +10% speed per SPD level
        const vitBonus = 1 + (s.vit - 1) * 0.20;      // +20% HP per VIT level
        const magBonus = 1 + (s.mag - 1) * 0.12;      // +12% ranged dmg per MAG level
        const magCdBonus = 1 - (s.mag - 1) * 0.08;    // -8% cooldown per MAG level
        const staBonus = 1 + (s.sta - 1) * 0.15;      // +15% stamina per STA level
        
        // Get hero base stats
        const hero = HEROES[this.selectedHero];
        const heroStats = hero ? hero.stats : {};
        
        // Base values (NO automatic level bonuses - now from skills!)
        let meleeDamage = Math.floor(CONFIG.PLAYER_DAMAGE * strBonus);
        let rangedDamage = Math.floor(CONFIG.RANGED_DAMAGE * magBonus);
        let rangedCooldown = Math.max(0.3, CONFIG.RANGED_COOLDOWN * magCdBonus);
        let bulletCount = 1;
        let moveSpeed = Math.floor(CONFIG.PLAYER_SPEED * spdBonus);
        let maxHp = Math.floor(CONFIG.PLAYER_HP * vitBonus);
        let maxStamina = Math.floor(CONFIG.SPRINT_MAX_STAMINA * staBonus);
        let staminaRegen = CONFIG.SPRINT_REGEN_RATE * staBonus;
        let maxMana = heroStats.maxMana || 100;
        let manaRegen = heroStats.manaRegen || 2.0;
        
        // Apply hero skills (with levels)
        const heroSkills = getHeroSkills(this.selectedHero);
        
        // Apply passive skill
        if (this.heroSkills.passive > 0) {
            const passive = heroSkills.passive;
            const level = this.heroSkills.passive;
            const effect = passive.levels[level - 1];
            
            if (effect.rangedCooldownReduction) {
                rangedCooldown *= (1 - effect.rangedCooldownReduction);
            }
            // Other passive effects applied elsewhere (damage reduction in damage calc, etc.)
        }
        
        // Apply active skill R (stat bonuses)
        if (this.heroSkills.skillR > 0) {
            const skillR = heroSkills.skillR;
            const level = this.heroSkills.skillR;
            const effect = skillR.levels[level - 1];
            
            if (effect.meleeDamageBonus) {
                meleeDamage = Math.floor(meleeDamage * (1 + effect.meleeDamageBonus));
            }
            if (effect.rangedDamageBonus) {
                rangedDamage = Math.floor(rangedDamage * (1 + effect.rangedDamageBonus));
            }
            if (effect.rangedCooldownReduction) {
                rangedCooldown *= (1 - effect.rangedCooldownReduction);
            }
            if (effect.maxHpBonus) {
                maxHp = Math.floor(maxHp * (1 + effect.maxHpBonus));
            }
            if (effect.moveSpeedBonus) {
                moveSpeed = Math.floor(moveSpeed * (1 + effect.moveSpeedBonus));
            }
            if (effect.maxPierceCount) {
                // Applied in attacks.js
            }
        }
        
        return {
            meleeDamage,
            rangedDamage,
            rangedCooldown: Math.max(0.3, rangedCooldown),
            bulletCount,
            moveSpeed,
            maxHp,
            maxStamina,
            staminaRegen,
            maxMana,
            manaRegen,
        };
    },
    
    // Get passive skill effect value
    getSkillEffect(skillId, effectName) {
        const level = this.passiveSkills[skillId];
        if (level <= 0) return 0;
        
        // Import would cause circular dependency, so hardcode effects
        const effects = {
            poison: { poisonDamage: [5, 8, 12], poisonDuration: [3, 4, 5] },
            vampirism: { healOnKill: [5, 10, 15], healOnBossKill: [20, 35, 50] },
            thorns: { reflectPercent: [15, 25, 40] },
            critical: { critChance: [10, 20, 30], critMultiplier: [2.0, 2.25, 2.5] },
            goldMagnet: { goldBonus: [25, 50, 100] },
            regeneration: { hpPerSecond: [1, 2, 4] },
        };
        
        const skill = effects[skillId];
        if (!skill || !skill[effectName]) return 0;
        return skill[effectName][level - 1] || 0;
    },
    
    getXPProgress() {
        if (this.playerLevel >= CONFIG.PLAYER_LEVEL.MAX_LEVEL) return 1;
        const curr = this.playerLevel > 1 ? CONFIG.PLAYER_LEVEL.XP_TABLE[this.playerLevel - 1] : 0;
        const next = CONFIG.PLAYER_LEVEL.XP_TABLE[this.playerLevel];
        return (this.playerXP - curr) / (next - curr);
    },
    
    difficulty() {
        return 1 + (this.currentLevel - 1) * CONFIG.DIFFICULTY_INCREASE;
    }
};

export default GS;
