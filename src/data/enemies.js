// ==================== ENEMY CONFIGURATIONS ====================
// Easy to add new enemy types - just add more objects!

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
        gold: [8, 15],            // Random 8-15 gold
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
        gold: [12, 22],           // Random 12-22 gold
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
        hp: 120,                  // 4x normal HP!
        damage: 18,               // Hits hard
        speed: 35,                // Very slow
        size: 40,                 // Bigger!
        color: [100, 120, 140],   // Gray/steel color
        xp: 50,
        score: 30,
        gold: [20, 35],           // Good gold drop
        behavior: "chase",
        knockbackResist: 0.8,     // Hard to push
    },
    
    // Bomber slime - explodes on death!
    bomber_slime: {
        id: "bomber_slime",
        name: "Bomber Slime",
        sprite: "slimeBomber",
        hp: 20,                   // Low HP
        damage: 5,                // Low contact damage
        speed: 100,               // Fast!
        size: 24,                 // Smaller
        color: [255, 150, 50],    // Orange
        xp: 30,
        score: 15,
        gold: [10, 18],
        behavior: "chase",
        explodeOnDeath: true,     // BOOM!
        explosionRadius: 60,
        explosionDamage: 25,
    },
};

export function getEnemyType(type) {
    return ENEMY_TYPES[type] || ENEMY_TYPES.slime;
}

export function getAllEnemyTypes() {
    return Object.keys(ENEMY_TYPES);
}

// Get random enemy type based on level
export function getRandomEnemyType(level) {
    const types = ["slime"];
    
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

export default { ENEMY_TYPES, getEnemyType, getAllEnemyTypes, getRandomEnemyType };
