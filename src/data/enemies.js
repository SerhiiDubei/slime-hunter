// ==================== ENEMY CONFIGURATIONS ====================
// Easy to add new enemy types with TIER SYSTEM!
// Tiers: 1 = Common (white), 2 = Uncommon (green), 3 = Rare (blue), 4 = Elite (purple)

// Tier multipliers for stats
export const TIER_CONFIG = {
    1: { name: "Common", color: [200, 200, 200], hpMult: 1.0, dmgMult: 1.0, goldMult: 1.0, xpMult: 1.0 },
    2: { name: "Uncommon", color: [100, 220, 100], hpMult: 1.8, dmgMult: 1.4, goldMult: 1.5, xpMult: 1.5 },
    3: { name: "Rare", color: [80, 150, 255], hpMult: 3.0, dmgMult: 1.8, goldMult: 2.5, xpMult: 2.5 },
    4: { name: "Elite", color: [180, 80, 255], hpMult: 5.0, dmgMult: 2.5, goldMult: 4.0, xpMult: 4.0 },
};

export const ENEMY_TYPES = {
    // Default slime - melee chaser
    slime: {
        id: "slime",
        name: "Slime",
        sprite: "slime",
        hp: 30,
        damage: 10,
        speed: 80,
        size: 28,
        color: [245, 87, 108],
        xp: 20,
        score: 10,
        gold: [8, 15],
        behavior: "chase",
    },
    
    // Ranged slime - mage that shoots!
    ranged_slime: {
        id: "ranged_slime",
        name: "Mage Slime",
        sprite: "slimeRanged",
        hp: 25,
        damage: 8,
        speed: 45,
        size: 28,
        color: [168, 85, 247],
        xp: 35,
        score: 20,
        gold: [12, 22],
        behavior: "ranged",
        attackRange: 250,
        fleeRange: 100,
        attackCooldown: 2.0,
        projectileSpeed: 180,
        projectileDamage: 12,
    },
    
    // Tank slime - slow but LOTS of HP!
    tank_slime: {
        id: "tank_slime",
        name: "Tank Slime",
        sprite: "slimeTank",
        hp: 120,
        damage: 18,
        speed: 35,
        size: 40,
        color: [100, 120, 140],
        xp: 50,
        score: 30,
        gold: [20, 35],
        behavior: "chase",
        knockbackResist: 0.8,
    },
    
    // Bomber slime - explodes on death!
    bomber_slime: {
        id: "bomber_slime",
        name: "Bomber Slime",
        sprite: "slimeBomber",
        hp: 20,
        damage: 5,
        speed: 100,
        size: 24,
        color: [255, 150, 50],
        xp: 30,
        score: 15,
        gold: [10, 18],
        behavior: "chase",
        explodeOnDeath: true,
        explosionRadius: 60,
        explosionDamage: 25,
    },
    
    // Fast slime - very quick, low HP
    fast_slime: {
        id: "fast_slime",
        name: "Swift Slime",
        sprite: "slime",
        hp: 15,
        damage: 6,
        speed: 150,
        size: 22,
        color: [255, 220, 100],
        xp: 25,
        score: 15,
        gold: [10, 18],
        behavior: "chase",
    },
};

// Get enemy type with tier applied
export function getEnemyType(type) {
    return ENEMY_TYPES[type] || ENEMY_TYPES.slime;
}

// Apply tier to enemy stats
export function applyTier(baseStats, tier) {
    const tierConfig = TIER_CONFIG[tier] || TIER_CONFIG[1];
    
    const hp = Math.floor(baseStats.hp * tierConfig.hpMult);
    const damage = Math.floor(baseStats.damage * tierConfig.dmgMult);
    const xp = Math.floor(baseStats.xp * tierConfig.xpMult);
    const score = Math.floor(baseStats.score * tierConfig.xpMult);
    
    // Gold scaling
    let gold = baseStats.gold;
    if (Array.isArray(gold)) {
        gold = [
            Math.floor(gold[0] * tierConfig.goldMult),
            Math.floor(gold[1] * tierConfig.goldMult)
        ];
    } else {
        gold = Math.floor(gold * tierConfig.goldMult);
    }
    
    // Projectile damage scaling for ranged enemies
    let projectileDamage = baseStats.projectileDamage;
    if (projectileDamage) {
        projectileDamage = Math.floor(projectileDamage * tierConfig.dmgMult);
    }
    
    // Explosion damage scaling
    let explosionDamage = baseStats.explosionDamage;
    if (explosionDamage) {
        explosionDamage = Math.floor(explosionDamage * tierConfig.dmgMult);
    }
    
    // Size scales slightly with tier
    const size = Math.floor(baseStats.size * (1 + (tier - 1) * 0.15));
    
    return {
        ...baseStats,
        hp,
        maxHp: hp,
        damage,
        xp,
        score,
        gold,
        projectileDamage,
        explosionDamage,
        size,
        tier,
        tierName: tierConfig.name,
        tierColor: tierConfig.color,
    };
}

export function getAllEnemyTypes() {
    return Object.keys(ENEMY_TYPES);
}

// Get random enemy type based on level
export function getRandomEnemyType(level) {
    const types = ["slime", "fast_slime"];
    
    // Add more types as levels increase
    if (level >= 1) types.push("ranged_slime");
    if (level >= 2) types.push("tank_slime");
    if (level >= 3) types.push("bomber_slime");
    
    // Higher levels = more variety
    if (level >= 4) {
        types.push("ranged_slime", "tank_slime");
    }
    if (level >= 5) {
        types.push("bomber_slime", "tank_slime");
    }
    
    return types[Math.floor(Math.random() * types.length)];
}

// Get random tier based on level and room
export function getRandomTier(level, roomNumber = 0) {
    const rand = Math.random() * 100;
    
    // Base probabilities (adjusted by level and room)
    const eliteChance = Math.min(5 + level * 2 + roomNumber * 2, 20);       // Max 20%
    const rareChance = Math.min(10 + level * 3 + roomNumber * 3, 30);       // Max 30%
    const uncommonChance = Math.min(25 + level * 4 + roomNumber * 4, 50);   // Max 50%
    
    if (rand < eliteChance) return 4;        // Elite (purple)
    if (rand < eliteChance + rareChance) return 3;        // Rare (blue)
    if (rand < eliteChance + rareChance + uncommonChance) return 2;  // Uncommon (green)
    return 1;  // Common (white)
}

export default { 
    ENEMY_TYPES, 
    TIER_CONFIG, 
    getEnemyType, 
    applyTier, 
    getAllEnemyTypes, 
    getRandomEnemyType, 
    getRandomTier 
};
