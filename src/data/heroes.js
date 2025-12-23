// ==================== HERO CONFIGURATIONS ====================
// 3 unique heroes with VERY different ranged attack playstyles!

export const HEROES = {
    // ========== WARRIOR ==========
    // Tank/melee focused - HEAVY slow throwing axe that spins and does massive damage
    warrior: {
        id: "warrior",
        name: "WARRIOR",
        icon: "⚔️",
        description: "Mighty melee fighter with devastating axe throw",
        color: [180, 60, 60],
        
        // Base stats modifiers
        stats: {
            meleeDamage: 1.3,      // +30% melee damage
            rangedDamage: 0.8,     // -20% ranged (not his specialty)
            moveSpeed: 0.9,        // Slower
            maxHp: 1.5,            // +50% HP - TANK
            stamina: 0.85,
        },
        
        // HEAVY AXE THROW - slow, big, DEVASTATING
        ranged: {
            name: "War Axe",
            description: "Slow spinning axe that deals massive damage",
            projectileColor: [220, 120, 60],      // Orange/bronze
            projectileSize: 22,                    // HUGE!
            projectileSpeed: 220,                  // SLOW but menacing
            cooldown: 3.0,                         // Long cooldown
            damageMultiplier: 2.2,                 // MASSIVE damage!
            piercing: false,
            projectileShape: "axe",
            // Special: Axe spins and has knockback
            spinSpeed: 900,                        // Fast spin
            knockback: 60,                         // Pushes enemies back
            trailColor: [180, 80, 40],
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
    // Ranged specialist - RAPID FIRE magic bolts that pierce and chain
    mage: {
        id: "mage",
        name: "MAGE",
        icon: "🔮",
        description: "Arcane master with rapid-fire piercing bolts",
        color: [120, 80, 200],
        
        stats: {
            meleeDamage: 0.5,      // -50% melee (stay away!)
            rangedDamage: 1.4,     // +40% ranged damage!
            moveSpeed: 0.85,       // Slower movement
            maxHp: 0.6,            // -40% HP (VERY squishy)
            stamina: 1.3,
        },
        
        // ARCANE BOLT - fast, piercing, multiple shots
        ranged: {
            name: "Arcane Bolt",
            description: "Fast magic bolts that pierce through enemies",
            projectileColor: [180, 100, 255],     // Purple magic
            projectileSize: 10,                    // Medium
            projectileSpeed: 550,                  // VERY FAST!
            cooldown: 0.7,                         // RAPID FIRE!
            damageMultiplier: 0.6,                 // Less per hit but many hits
            piercing: true,                        // Goes through enemies!
            projectileShape: "orb",
            // Special: Leaves magic trail, can hit multiple enemies
            trailColor: [150, 50, 255],
            maxPierceCount: 4,                     // Pierce up to 4 enemies
            chainLightning: false,                 // Future feature
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
    // Speed/crit focused - TRIPLE DAGGER burst with poison
    assassin: {
        id: "assassin",
        name: "ASSASSIN",
        icon: "🗡️",
        description: "Swift killer with triple poison daggers",
        color: [80, 180, 100],
        
        stats: {
            meleeDamage: 1.15,     // +15% melee
            rangedDamage: 1.1,     // +10% ranged
            moveSpeed: 1.5,        // +50% speed! FASTEST
            maxHp: 0.75,           // -25% HP
            stamina: 2.0,          // +100% stamina - sprint forever
        },
        
        // TRIPLE DAGGER BURST - shoots 3 daggers at once
        ranged: {
            name: "Poison Daggers",
            description: "Triple burst of fast daggers that poison enemies",
            projectileColor: [100, 220, 120],     // Toxic green
            projectileSize: 8,                     // Small, fast
            projectileSpeed: 480,                  // Fast
            cooldown: 1.6,                         // Medium cooldown
            damageMultiplier: 0.7,                 // Less per dagger
            piercing: false,
            projectileShape: "dagger",
            // Special: Shoots 3 daggers in a burst!
            burstCount: 3,                         // 3 daggers per attack!
            burstSpread: 0.2,                      // Spread angle
            burstDelay: 0.08,                      // Delay between daggers
            // Poison effect
            poison: true,
            poisonDamage: 8,                       // 8 damage per tick
            poisonDuration: 4,                     // 4 seconds
            trailColor: [80, 200, 100],
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

// Quick reference for attack patterns:
// WARRIOR: 1 big slow powerful axe | Long cooldown | High damage | Knockback
// MAGE:    1-3 fast bolts         | Short cooldown | Low damage  | Piercing
// ASSASSIN: 3 daggers burst       | Medium cooldown| Medium dmg  | Poison DOT

export function getHero(id) {
    return HEROES[id] || HEROES.warrior;
}

export function getAllHeroes() {
    return Object.values(HEROES);
}

export default { HEROES, getHero, getAllHeroes };
