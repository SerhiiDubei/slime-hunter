// ==================== HERO CONFIGURATIONS ====================
// 3 unique heroes with different abilities and playstyles!

export const HEROES = {
    // ========== WARRIOR ==========
    // Tank/melee focused - slow but powerful projectile
    warrior: {
        id: "warrior",
        name: "WARRIOR",
        icon: "⚔️",
        description: "Mighty melee fighter with devastating power",
        color: [180, 60, 60],
        
        // Base stats modifiers
        stats: {
            meleeDamage: 1.3,      // +30% melee damage
            rangedDamage: 0.7,     // -30% ranged (not his specialty)
            moveSpeed: 0.95,       // Slightly slower
            maxHp: 1.4,            // +40% HP - TANK
            stamina: 0.9,
        },
        
        // Unique ranged attack - HEAVY AXE THROW
        ranged: {
            name: "Axe Throw",
            projectileColor: [200, 100, 50],
            projectileSize: 16,      // Big projectile
            projectileSpeed: 280,    // Slow but heavy
            cooldown: 2.5,           // Slow cooldown
            damageMultiplier: 1.5,   // But hits HARD
            piercing: false,
            projectileShape: "axe",  // Special shape
        },
        
        // Ultimate ability
        ultimate: {
            name: "EARTHQUAKE",
            icon: "🌋",
            description: "Damages and stuns all nearby enemies",
            chargeNeeded: 6,
            damage: 60,
            radius: 200,
            stunDuration: 2.0,
        },
    },
    
    // ========== MAGE ==========
    // Ranged specialist - fast projectiles, low cooldown
    mage: {
        id: "mage",
        name: "MAGE",
        icon: "🔮",
        description: "Master of arcane arts with rapid fire magic",
        color: [100, 80, 180],
        
        stats: {
            meleeDamage: 0.6,      // -40% melee (avoid close combat!)
            rangedDamage: 1.5,     // +50% ranged damage!
            moveSpeed: 0.9,        // Slower movement
            maxHp: 0.7,            // -30% HP (very squishy)
            stamina: 1.2,
        },
        
        // Unique ranged attack - ARCANE BOLT
        ranged: {
            name: "Arcane Bolt",
            projectileColor: [150, 100, 255],
            projectileSize: 10,      // Medium projectile
            projectileSpeed: 500,    // FAST!
            cooldown: 1.0,           // Rapid fire
            damageMultiplier: 0.8,   // Less per hit but more hits
            piercing: true,          // Goes through enemies!
            projectileShape: "orb",
        },
        
        ultimate: {
            name: "METEOR STORM",
            icon: "☄️",
            description: "Calls down a barrage of devastating meteors",
            chargeNeeded: 5,
            meteorCount: 10,
            damage: 45,
            radius: 70,
        },
    },
    
    // ========== ASSASSIN ==========
    // Speed/crit focused - fast everything
    assassin: {
        id: "assassin",
        name: "ASSASSIN",
        icon: "🗡️",
        description: "Swift and deadly with poison daggers",
        color: [60, 60, 80],
        
        stats: {
            meleeDamage: 1.1,      // +10% melee
            rangedDamage: 1.0,     // Normal ranged
            moveSpeed: 1.4,        // +40% speed! FAST
            maxHp: 0.85,           // -15% HP
            stamina: 1.8,          // +80% stamina - sprint king
        },
        
        // Unique ranged attack - POISON DAGGER
        ranged: {
            name: "Poison Dagger",
            projectileColor: [100, 200, 100],
            projectileSize: 8,       // Small, fast
            projectileSpeed: 450,    // Fast
            cooldown: 1.4,           // Medium cooldown
            damageMultiplier: 0.9,   // Slightly less damage
            piercing: false,
            projectileShape: "dagger",
            poison: true,            // Applies poison!
            poisonDamage: 5,         // 5 damage per second
            poisonDuration: 3,       // For 3 seconds
        },
        
        ultimate: {
            name: "SHADOW STRIKE",
            icon: "👤",
            description: "Teleports to enemies and strikes each one",
            chargeNeeded: 7,
            damage: 40,
            strikes: 6,
            invulnDuration: 1.2,
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
