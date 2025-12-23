// ==================== HERO CONFIGURATIONS ====================
// 3 unique heroes with different ultimate abilities!

export const HEROES = {
    // Warrior - EARTHQUAKE ultimate
    warrior: {
        id: "warrior",
        name: "WARRIOR",
        icon: "⚔️",
        description: "Mighty melee fighter",
        color: [180, 60, 60],
        // Base stats modifiers
        stats: {
            meleeDamage: 1.2,      // +20% melee
            rangedDamage: 0.8,     // -20% ranged
            moveSpeed: 1.0,
            maxHp: 1.2,            // +20% HP
            stamina: 1.0,
        },
        // Ultimate ability
        ultimate: {
            name: "EARTHQUAKE",
            icon: "🌋",
            description: "Damages and stuns all nearby enemies",
            chargeNeeded: 6,
            damage: 50,
            radius: 200,
            stunDuration: 1.5,
        },
    },
    
    // Mage - METEOR STORM ultimate
    mage: {
        id: "mage",
        name: "MAGE",
        icon: "🔮",
        description: "Master of arcane",
        color: [100, 80, 180],
        stats: {
            meleeDamage: 0.8,      // -20% melee
            rangedDamage: 1.4,     // +40% ranged!
            moveSpeed: 0.9,
            maxHp: 0.8,            // -20% HP (squishy)
            stamina: 1.2,
        },
        ultimate: {
            name: "METEOR STORM",
            icon: "☄️",
            description: "Calls down a barrage of meteors",
            chargeNeeded: 5,
            meteorCount: 8,
            damage: 40,
            radius: 60,
        },
    },
    
    // Assassin - SHADOW STRIKE ultimate
    assassin: {
        id: "assassin",
        name: "ASSASSIN",
        icon: "🗡️",
        description: "Swift and deadly",
        color: [80, 80, 100],
        stats: {
            meleeDamage: 1.0,
            rangedDamage: 1.0,
            moveSpeed: 1.3,        // +30% speed!
            maxHp: 0.9,
            stamina: 1.5,          // +50% stamina
        },
        ultimate: {
            name: "SHADOW STRIKE",
            icon: "👤",
            description: "Teleports to enemies and strikes each one",
            chargeNeeded: 7,
            damage: 35,
            strikes: 5,
            invulnDuration: 1.0,
        },
    },
};

export function getHero(id) {
    return HEROES[id] || HEROES.warrior;
}

export function getAllHeroes() {
    return Object.values(HEROES);
}

export default { HEROES, getHero, getAllHeroes };
