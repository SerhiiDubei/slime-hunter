// ==================== BOSS CONFIGURATIONS ====================
// Unique bosses for each level with special abilities!

export const BOSS_TYPES = {
    // Level 1 Boss: Slime King - Bullet Storm
    slime_king: {
        id: "slime_king",
        name: "SLIME KING",
        sprite: "bossKing",
        hpMultiplier: 4.0,
        damageMultiplier: 2.0,
        speedMultiplier: 0.6,
        size: 52,
        color: [231, 76, 60],
        goldBonus: [40, 60],        // Random 40-60 gold
        xpBonus: 100,
        scoreBonus: 50,
        ability: "bullet_storm",
        abilityCooldown: 4.0,
        abilityBullets: 10,
        abilityDamage: 18,
        abilitySpeed: 160,
    },
    
    // Level 2 Boss: Speed Demon - Leap attack (BALANCED!)
    speed_demon: {
        id: "speed_demon",
        name: "SPEED DEMON",
        sprite: "bossSpeed",
        hpMultiplier: 3.0,
        damageMultiplier: 1.8,
        speedMultiplier: 0.6,       // Slower walking
        size: 48,
        color: [0, 255, 255],
        goldBonus: [60, 100],       // Random 60-100 gold
        xpBonus: 130,
        scoreBonus: 75,
        ability: "leap",
        abilityCooldown: 4.0,       // 4 sec between leaps
        leapSpeed: 500,             // Slower leap
        leapDuration: 0.18,         // Shorter leap
        leapDamage: 15,             // Less damage
        leapWarning: 0.7,           // 0.7 sec warning before leap!
    },
    
    // Level 3 Boss: Necromancer - Summons + shoots
    necromancer: {
        id: "necromancer",
        name: "NECROMANCER",
        sprite: "bossNecro",
        hpMultiplier: 5.0,
        damageMultiplier: 2.0,
        speedMultiplier: 0.5,
        size: 52,
        color: [155, 89, 182],
        goldBonus: [80, 130],       // Random 80-130 gold
        xpBonus: 200,
        scoreBonus: 100,
        ability: "summon",
        ability2: "death_bolt",
        abilityCooldown: 5.0,
        ability2Cooldown: 2.0,
        summonCount: 3,
        maxMinions: 5,
        deathBoltDamage: 15,
        deathBoltSpeed: 100,       // Slower homing bolt
    },
    
    // Level 4 Boss: Frost Giant - Ice storm + freeze aura
    frost_giant: {
        id: "frost_giant",
        name: "FROST GIANT",
        sprite: "bossFrost",
        hpMultiplier: 6.0,
        damageMultiplier: 2.5,
        speedMultiplier: 0.4,
        size: 56,
        color: [100, 200, 255],
        goldBonus: [120, 180],      // Random 120-180 gold
        xpBonus: 300,
        scoreBonus: 150,
        ability: "ice_storm",
        ability2: "freeze_zone",
        abilityCooldown: 3.5,
        ability2Cooldown: 5.0,
        abilityBullets: 14,
        abilityDamage: 15,
        abilitySpeed: 130,
        freezeRadius: 100,
        freezeDuration: 1.5,
    },
    
    // Level 5 Boss: Inferno - Fire aura + meteor
    inferno: {
        id: "inferno",
        name: "INFERNO",
        sprite: "bossInferno",
        hpMultiplier: 7.0,
        damageMultiplier: 3.0,
        speedMultiplier: 0.7,
        size: 54,
        color: [255, 100, 50],
        goldBonus: [160, 250],      // Random 160-250 gold
        xpBonus: 400,
        scoreBonus: 200,
        ability: "fire_aura",
        ability2: "meteor",
        abilityCooldown: 1.5,
        ability2Cooldown: 4.0,
        auraDamage: 8,
        auraRadius: 90,
        explosionDamage: 35,
        meteorDamage: 40,
        meteorCount: 3,
    },
    
    // Level 6 Boss: Shadow Lord - Teleport + dark wave (HARDER!)
    shadow_lord: {
        id: "shadow_lord",
        name: "SHADOW LORD",
        sprite: "bossShadow",
        hpMultiplier: 12.0,          // More HP! (was 8)
        damageMultiplier: 3.5,        // More damage! (was 2.5)
        speedMultiplier: 1.2,         // Faster! (was 1.0)
        size: 55,                     // Bigger
        color: [50, 50, 80],
        goldBonus: [250, 400],
        xpBonus: 500,
        scoreBonus: 300,
        ability: "teleport",
        ability2: "dark_wave",
        abilityCooldown: 2.0,         // Faster teleport (was 3.0)
        ability2Cooldown: 1.5,        // Faster dark wave (was 2.5)
        cloneCount: 3,                // More clones! (was 2)
        cloneDuration: 5.0,           // Longer clones (was 4.0)
        darkWaveDamage: 30,           // More damage (was 20)
        darkWaveSpeed: 220,           // Faster wave (was 180)
    },
    
    // Level 7 Boss: MEGA SLIME - All abilities + RAGE!
    mega_slime: {
        id: "mega_slime",
        name: "MEGA SLIME",
        sprite: "bossMega",
        hpMultiplier: 12.0,
        damageMultiplier: 4.0,
        speedMultiplier: 0.6,
        size: 70,
        color: [255, 50, 150],
        goldBonus: [400, 600],      // Random 400-600 gold
        xpBonus: 1000,
        scoreBonus: 500,
        ability: "mega",
        ability2: "rage",
        abilityCooldown: 2.5,
        ability2Cooldown: 8.0,
        abilityBullets: 20,
        summonCount: 4,
        maxMinions: 8,
        rageDuration: 5.0,
        rageSpeedBoost: 2.0,
        rageDamageBoost: 1.5,
    },
};

// Get boss for specific level
export function getBossForLevel(level) {
    const bosses = {
        1: BOSS_TYPES.slime_king,
        2: BOSS_TYPES.speed_demon,
        3: BOSS_TYPES.necromancer,
        4: BOSS_TYPES.frost_giant,
        5: BOSS_TYPES.inferno,
        6: BOSS_TYPES.shadow_lord,
        7: BOSS_TYPES.mega_slime,
    };
    return bosses[level] || BOSS_TYPES.slime_king;
}

export function getBossType(id) {
    return BOSS_TYPES[id] || BOSS_TYPES.slime_king;
}

export default { BOSS_TYPES, getBossForLevel, getBossType };
