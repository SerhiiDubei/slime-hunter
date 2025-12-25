// ==================== HERO CONFIGURATIONS ====================
// 4 unique heroes with VERY different ranged attack playstyles!

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
            meleeDamage: 2.0,      // +100% melee damage - MELEE SPECIALIST!
            rangedDamage: 0.8,     // -20% ranged (not his specialty)
            moveSpeed: 0.9,        // Slower
            maxHp: 1.5,            // +50% HP - TANK
            stamina: 0.85,
        },
        
        // Melee attack properties
        melee: {
            isMeleeSpecialist: true,  // Strong directional melee
            meleeRange: 80,           // Longer melee range
            meleeWidth: 60,           // Wide directional attack
            meleeDamageMultiplier: 2.0, // Double damage
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
        
        // Active ability
        ability: {
            name: "SHIELD BASH",
            icon: "🛡️",
            description: "Charges forward, dealing damage and stunning enemies",
            cooldown: 8.0,
            damage: 25,
            range: 150,
            stunDuration: 1.5,
            knockback: 80,
        },
        
        // Ultimate ability
        ultimate: {
            name: "EARTHQUAKE",
            icon: "🌋",
            description: "Damages and stuns all nearby enemies",
            chargeNeeded: 6,
            damage: 30,
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
            meleeDamage: 0.3,      // -70% melee (stay away! RANGED ONLY)
            rangedDamage: 1.4,     // +40% ranged damage!
            moveSpeed: 0.85,       // Slower movement
            maxHp: 0.6,            // -40% HP (VERY squishy)
            stamina: 1.3,
        },
        
        // Melee attack properties
        melee: {
            isMeleeSpecialist: false,  // Weak melee
            meleeRange: 40,            // Short melee range
            meleeWidth: 30,            // Narrow melee
            meleeDamageMultiplier: 0.3, // Very weak melee
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
        
        // Active ability
        ability: {
            name: "ICE SHARD",
            icon: "❄️",
            description: "Fires a piercing ice shard that freezes enemies",
            cooldown: 6.0,
            damage: 20,
            speed: 600,
            freezeDuration: 2.0,
            piercing: true,
        },
        
        ultimate: {
            name: "METEOR STORM",
            icon: "☄️",
            description: "Calls down a barrage of devastating meteors",
            chargeNeeded: 5,
            meteorCount: 10,
            damage: 22,
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
            meleeDamage: 1.5,      // +50% melee - MELEE SPECIALIST!
            rangedDamage: 1.1,     // +10% ranged
            moveSpeed: 1.5,        // +50% speed! FASTEST
            maxHp: 0.75,           // -25% HP
            stamina: 2.0,          // +100% stamina - sprint forever
        },
        
        // Melee attack properties
        melee: {
            isMeleeSpecialist: true,  // Strong directional melee
            meleeRange: 70,           // Good melee range
            meleeWidth: 50,           // Medium width
            meleeDamageMultiplier: 1.5, // Strong melee
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
        
        // Active ability
        ability: {
            name: "SMOKE BOMB",
            icon: "💨",
            description: "Creates a smoke cloud that grants invisibility and speed boost",
            cooldown: 10.0,
            duration: 3.0,
            speedBoost: 1.5,
            radius: 120,
        },
        
        ultimate: {
            name: "SHADOW STRIKE",
            icon: "👤",
            description: "Teleports to enemies and strikes each one",
            chargeNeeded: 7,
            damage: 20,
            strikes: 6,
            invulnDuration: 1.2,
        },
    },
    
    // ========== RANGER ==========
    // Balanced ranged/melee - BOW with homing arrows
    ranger: {
        id: "ranger",
        name: "RANGER",
        icon: "🏹",
        description: "Master archer with homing arrows and balanced combat",
        color: [100, 150, 80],
        
        stats: {
            meleeDamage: 0.4,      // -60% melee (ranged specialist)
            rangedDamage: 1.5,     // +50% ranged - RANGED SPECIALIST!
            moveSpeed: 1.2,        // +20% speed
            maxHp: 1.0,            // Balanced HP
            stamina: 1.5,          // +50% stamina
        },
        
        // Melee attack properties
        melee: {
            isMeleeSpecialist: false,  // Weak melee
            meleeRange: 45,            // Short melee range
            meleeWidth: 35,            // Narrow melee
            meleeDamageMultiplier: 0.4, // Weak melee
        },
        
        // HOMING ARROW - tracks enemies (IMPROVED!)
        ranged: {
            name: "Homing Arrow",
            description: "Arrows that track and follow enemies",
            projectileColor: [150, 200, 100],     // Green/brown
            projectileSize: 10,                    // Smaller size
            projectileSpeed: 420,                  // Faster
            cooldown: 1.4,                         // Faster cooldown
            damageMultiplier: 1.3,                 // More damage!
            piercing: true,                        // PIERCING ARROWS!
            projectileShape: "arrow",
            // Special: Arrows home in on enemies
            homing: true,
            homingStrength: 0.25,                  // Stronger homing
            trailColor: [120, 180, 90],
            maxPierceCount: 3,                     // Pierce up to 3 enemies
        },
        
        // Active ability (IMPROVED!)
        ability: {
            name: "MULTI-SHOT",
            icon: "🎯",
            description: "Fires 7 arrows in a spread pattern",
            cooldown: 6.0,          // Faster cooldown
            arrowCount: 7,          // More arrows
            spreadAngle: 0.7,
            damage: 22,             // More damage
        },
        
        ultimate: {
            name: "ARROW STORM",
            icon: "🌪️",
            description: "Rains down arrows in a large area",
            chargeNeeded: 5,        // Faster charge
            arrowCount: 25,         // More arrows
            damage: 18,             // More damage
            radius: 280,            // Larger radius
        },
    },
};

// Quick reference for attack patterns:
// WARRIOR: 1 big slow powerful axe | Long cooldown | High damage | Knockback
// MAGE:    1-3 fast bolts         | Short cooldown | Low damage  | Piercing
// ASSASSIN: 3 daggers burst       | Medium cooldown| Medium dmg  | Poison DOT
// RANGER:  Homing arrows          | Medium cooldown| Balanced    | Tracking

export function getHero(id) {
    return HEROES[id] || HEROES.warrior;
}

export function getAllHeroes() {
    return Object.values(HEROES);
}

export default { HEROES, getHero, getAllHeroes };
