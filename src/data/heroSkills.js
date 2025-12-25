// ==================== HERO-SPECIFIC SKILLS ====================
// NEW SYSTEM: Each hero has 4 skills on Q, R, T, Y keys
// E = ranged attack (not a skill)
// Space = melee attack (not a skill)
// Each skill has 4 levels of upgrade
// Skills are upgraded using skill points gained on level up

export const HERO_SKILLS = {
    // ========== WARRIOR SKILLS ==========
    warrior: {
        // SKILL Q - Shield Bash
        skillQ: {
            id: "warrior_shield_bash",
            name: "SHIELD BASH",
            icon: "🛡️",
            key: "Q",
            description: "Charges forward, dealing damage and stunning enemies",
            levels: [
                { damage: 25, range: 150, stunDuration: 1.0, knockback: 60, cooldown: 8.0, manaCost: 50 },
                { damage: 35, range: 180, stunDuration: 1.5, knockback: 80, cooldown: 7.5, manaCost: 60 },
                { damage: 45, range: 210, stunDuration: 2.0, knockback: 100, cooldown: 7.0, manaCost: 70 },
                { damage: 60, range: 240, stunDuration: 2.5, knockback: 120, cooldown: 6.5, manaCost: 80 },
            ],
            getDescription(level) {
                const lvl = this.levels[level - 1];
                return `Deals ${lvl.damage} damage, stuns for ${lvl.stunDuration}s, range ${lvl.range}px`;
            }
        },
        
        // SKILL R - Mighty Strike
        skillR: {
            id: "warrior_mighty_strike",
            name: "MIGHTY STRIKE",
            icon: "⚔️",
            key: "R",
            description: "Increases melee damage",
            levels: [
                { meleeDamageBonus: 0.20 },  // Level 1: +20%
                { meleeDamageBonus: 0.35 },  // Level 2: +35%
                { meleeDamageBonus: 0.50 },  // Level 3: +50%
                { meleeDamageBonus: 0.70 },  // Level 4: +70%
            ],
            getDescription(level) {
                const pct = this.levels[level - 1].meleeDamageBonus * 100;
                return `+${pct}% melee damage`;
            }
        },
        
        // SKILL T - Iron Armor (passive-like, but active skill)
        skillT: {
            id: "warrior_iron_armor",
            name: "IRON ARMOR",
            icon: "🛡️",
            key: "T",
            description: "Reduces incoming damage",
            levels: [
                { damageReduction: 0.10 },  // Level 1: 10%
                { damageReduction: 0.15 },  // Level 2: 15%
                { damageReduction: 0.20 },  // Level 3: 20%
                { damageReduction: 0.25 },  // Level 4: 25%
            ],
            getDescription(level) {
                const pct = this.levels[level - 1].damageReduction * 100;
                return `Reduces incoming damage by ${pct}%`;
            }
        },
        
        // SKILL Y - Ultimate: Earthquake
        skillY: {
            id: "warrior_earthquake",
            name: "EARTHQUAKE",
            icon: "🌋",
            key: "Y",
            description: "Damages and stuns all nearby enemies",
            isUltimate: true,
            levels: [
                { damage: 30, radius: 200, stunDuration: 2.0, manaCost: 100 },
                { damage: 45, radius: 240, stunDuration: 2.5, manaCost: 120 },
                { damage: 60, radius: 280, stunDuration: 3.0, manaCost: 140 },
                { damage: 80, radius: 320, stunDuration: 3.5, manaCost: 160 },
            ],
            getDescription(level) {
                const lvl = this.levels[level - 1];
                return `Deals ${lvl.damage} damage, stuns ${lvl.stunDuration}s, radius ${lvl.radius}px`;
            }
        },
    },
    
    // ========== MAGE SKILLS ==========
    mage: {
        // SKILL Q - Ice Shard
        skillQ: {
            id: "mage_ice_shard",
            name: "ICE SHARD",
            icon: "❄️",
            key: "Q",
            description: "Fires a piercing ice shard that freezes enemies",
            levels: [
                { damage: 20, speed: 600, freezeDuration: 1.5, piercing: true, cooldown: 6.0, manaCost: 40 },
                { damage: 30, speed: 650, freezeDuration: 2.0, piercing: true, cooldown: 5.5, manaCost: 50 },
                { damage: 40, speed: 700, freezeDuration: 2.5, piercing: true, cooldown: 5.0, manaCost: 60 },
                { damage: 55, speed: 750, freezeDuration: 3.0, piercing: true, cooldown: 4.5, manaCost: 70 },
            ],
            getDescription(level) {
                const lvl = this.levels[level - 1];
                return `Deals ${lvl.damage} damage, freezes ${lvl.freezeDuration}s, piercing`;
            }
        },
        
        // SKILL R - Power Bolt
        skillR: {
            id: "mage_power_bolt",
            name: "POWER BOLT",
            icon: "🔮",
            key: "R",
            description: "Increases ranged damage",
            levels: [
                { rangedDamageBonus: 0.25 },  // Level 1: +25%
                { rangedDamageBonus: 0.40 },  // Level 2: +40%
                { rangedDamageBonus: 0.55 },  // Level 3: +55%
                { rangedDamageBonus: 0.75 },  // Level 4: +75%
            ],
            getDescription(level) {
                const pct = this.levels[level - 1].rangedDamageBonus * 100;
                return `+${pct}% ranged damage`;
            }
        },
        
        // SKILL T - Arcane Flow
        skillT: {
            id: "mage_arcane_flow",
            name: "ARCANE FLOW",
            icon: "✨",
            key: "T",
            description: "Reduces ranged attack cooldown",
            levels: [
                { rangedCooldownReduction: 0.10 },  // Level 1: -10%
                { rangedCooldownReduction: 0.15 },  // Level 2: -15%
                { rangedCooldownReduction: 0.20 },  // Level 3: -20%
                { rangedCooldownReduction: 0.25 },  // Level 4: -25%
            ],
            getDescription(level) {
                const pct = this.levels[level - 1].rangedCooldownReduction * 100;
                return `-${pct}% ranged attack cooldown`;
            }
        },
        
        // SKILL Y - Ultimate: Meteor Storm
        skillY: {
            id: "mage_meteor_storm",
            name: "METEOR STORM",
            icon: "☄️",
            key: "Y",
            description: "Calls down a barrage of devastating meteors",
            isUltimate: true,
            levels: [
                { meteorCount: 10, damage: 22, radius: 70, manaCost: 120 },
                { meteorCount: 12, damage: 30, radius: 80, manaCost: 140 },
                { meteorCount: 15, damage: 38, radius: 90, manaCost: 160 },
                { meteorCount: 18, damage: 50, radius: 100, manaCost: 180 },
            ],
            getDescription(level) {
                const lvl = this.levels[level - 1];
                return `${lvl.meteorCount} meteors, ${lvl.damage} damage each, ${lvl.radius}px radius`;
            }
        },
    },
    
    // ========== ASSASSIN SKILLS ==========
    assassin: {
        // SKILL Q - Smoke Bomb
        skillQ: {
            id: "assassin_smoke_bomb",
            name: "SMOKE BOMB",
            icon: "💨",
            key: "Q",
            description: "Creates a smoke cloud that grants invisibility and speed boost",
            levels: [
                { duration: 3.0, speedBoost: 1.5, radius: 120, cooldown: 10.0, manaCost: 60 },
                { duration: 3.5, speedBoost: 1.7, radius: 140, cooldown: 9.0, manaCost: 70 },
                { duration: 4.0, speedBoost: 2.0, radius: 160, cooldown: 8.0, manaCost: 80 },
                { duration: 4.5, speedBoost: 2.3, radius: 180, cooldown: 7.0, manaCost: 90 },
            ],
            getDescription(level) {
                const lvl = this.levels[level - 1];
                return `${lvl.duration}s duration, +${Math.floor((lvl.speedBoost - 1) * 100)}% speed, ${lvl.radius}px radius`;
            }
        },
        
        // SKILL R - Venom
        skillR: {
            id: "assassin_poison",
            name: "VENOM",
            icon: "☠️",
            key: "R",
            description: "All attacks poison enemies",
            levels: [
                { poisonDamage: 5, poisonDuration: 3 },   // Level 1: 5 dmg/tick, 3s
                { poisonDamage: 8, poisonDuration: 4 },   // Level 2: 8 dmg/tick, 4s
                { poisonDamage: 12, poisonDuration: 5 },  // Level 3: 12 dmg/tick, 5s
                { poisonDamage: 18, poisonDuration: 6 },  // Level 4: 18 dmg/tick, 6s
            ],
            getDescription(level) {
                const lvl = this.levels[level - 1];
                return `Poisons for ${lvl.poisonDamage} damage/tick, ${lvl.poisonDuration}s duration`;
            }
        },
        
        // SKILL T - Shadow Strike (crit)
        skillT: {
            id: "assassin_crit",
            name: "SHADOW STRIKE",
            icon: "🗡️",
            key: "T",
            description: "Chance to deal critical damage",
            levels: [
                { critChance: 0.15, critMultiplier: 2.0 },  // Level 1: 15% chance, 2x
                { critChance: 0.20, critMultiplier: 2.2 },  // Level 2: 20% chance, 2.2x
                { critChance: 0.25, critMultiplier: 2.4 },  // Level 3: 25% chance, 2.4x
                { critChance: 0.30, critMultiplier: 2.6 },  // Level 4: 30% chance, 2.6x
            ],
            getDescription(level) {
                const lvl = this.levels[level - 1];
                const pct = lvl.critChance * 100;
                return `${pct}% chance to deal ${lvl.critMultiplier}x damage`;
            }
        },
        
        // SKILL Y - Ultimate: Shadow Strike
        skillY: {
            id: "assassin_shadow_strike",
            name: "SHADOW STRIKE",
            icon: "👤",
            key: "Y",
            description: "Teleports to enemies and strikes each one",
            isUltimate: true,
            levels: [
                { strikes: 6, damage: 20, invulnDuration: 1.2, manaCost: 110 },
                { strikes: 7, damage: 28, invulnDuration: 1.4, manaCost: 130 },
                { strikes: 8, damage: 36, invulnDuration: 1.6, manaCost: 150 },
                { strikes: 10, damage: 45, invulnDuration: 1.8, manaCost: 170 },
            ],
            getDescription(level) {
                const lvl = this.levels[level - 1];
                return `${lvl.strikes} strikes, ${lvl.damage} damage each, ${lvl.invulnDuration}s invulnerability`;
            }
        },
    },
    
    // ========== RANGER SKILLS ==========
    ranger: {
        // SKILL Q - Multi-Shot
        skillQ: {
            id: "ranger_multi_shot",
            name: "MULTI-SHOT",
            icon: "🎯",
            key: "Q",
            description: "Fires multiple arrows in a spread pattern",
            levels: [
                { arrowCount: 5, damage: 20, spreadAngle: 0.7, cooldown: 6.0, manaCost: 45 },
                { arrowCount: 7, damage: 25, spreadAngle: 0.8, cooldown: 5.5, manaCost: 55 },
                { arrowCount: 9, damage: 30, spreadAngle: 0.9, cooldown: 5.0, manaCost: 65 },
                { arrowCount: 12, damage: 38, spreadAngle: 1.0, cooldown: 4.5, manaCost: 75 },
            ],
            getDescription(level) {
                const lvl = this.levels[level - 1];
                return `${lvl.arrowCount} arrows, ${lvl.damage} damage each`;
            }
        },
        
        // SKILL R - Piercing Arrow
        skillR: {
            id: "ranger_piercing_arrow",
            name: "PIERCING ARROW",
            icon: "➡️",
            key: "R",
            description: "Arrows pierce through more enemies",
            levels: [
                { maxPierceCount: 3 },  // Level 1: pierce 3
                { maxPierceCount: 5 },  // Level 2: pierce 5
                { maxPierceCount: 7 },  // Level 3: pierce 7
                { maxPierceCount: 10 }, // Level 4: pierce 10
            ],
            getDescription(level) {
                const count = this.levels[level - 1].maxPierceCount;
                return `Arrows pierce through ${count} enemies`;
            }
        },
        
        // SKILL T - Tracking
        skillT: {
            id: "ranger_homing",
            name: "TRACKING",
            icon: "🎯",
            key: "T",
            description: "Arrows track enemies better",
            levels: [
                { homingStrengthBonus: 0.50 },  // Level 1: +50%
                { homingStrengthBonus: 0.75 },  // Level 2: +75%
                { homingStrengthBonus: 1.00 },   // Level 3: +100%
                { homingStrengthBonus: 1.30 },   // Level 4: +130%
            ],
            getDescription(level) {
                const pct = this.levels[level - 1].homingStrengthBonus * 100;
                return `+${pct}% arrow homing strength`;
            }
        },
        
        // SKILL Y - Ultimate: Arrow Storm
        skillY: {
            id: "ranger_arrow_storm",
            name: "ARROW STORM",
            icon: "🌪️",
            key: "Y",
            description: "Rains down arrows in a large area",
            isUltimate: true,
            levels: [
                { arrowCount: 25, damage: 18, radius: 280, manaCost: 115 },
                { arrowCount: 30, damage: 24, radius: 320, manaCost: 135 },
                { arrowCount: 35, damage: 30, radius: 360, manaCost: 155 },
                { arrowCount: 45, damage: 40, radius: 400, manaCost: 175 },
            ],
            getDescription(level) {
                const lvl = this.levels[level - 1];
                return `${lvl.arrowCount} arrows, ${lvl.damage} damage each, ${lvl.radius}px radius`;
            }
        },
    },
    
    // ========== WIZARD SKILLS ==========
    wizard: {
        // SKILL Q - Teleport
        skillQ: {
            id: "wizard_teleport",
            name: "TELEPORT",
            icon: "✨",
            key: "Q",
            description: "Instantly teleports to target location",
            levels: [
                { range: 200, invulnDuration: 0.3, cooldown: 8.0, manaCost: 60 },
                { range: 250, invulnDuration: 0.4, cooldown: 7.5, manaCost: 70 },
                { range: 300, invulnDuration: 0.5, cooldown: 7.0, manaCost: 80 },
                { range: 350, invulnDuration: 0.6, cooldown: 6.5, manaCost: 90 },
            ],
            getDescription(level) {
                const lvl = this.levels[level - 1];
                return `Teleport ${lvl.range}px, ${lvl.invulnDuration}s invulnerability`;
            }
        },
        
        // SKILL R - Arcane Power
        skillR: {
            id: "wizard_arcane_power",
            name: "ARCANE POWER",
            icon: "🔮",
            key: "R",
            description: "Increases ranged damage",
            levels: [
                { rangedDamageBonus: 0.30 },  // Level 1: +30%
                { rangedDamageBonus: 0.50 },  // Level 2: +50%
                { rangedDamageBonus: 0.70 },  // Level 3: +70%
                { rangedDamageBonus: 1.00 },  // Level 4: +100%
            ],
            getDescription(level) {
                const pct = this.levels[level - 1].rangedDamageBonus * 100;
                return `+${pct}% ranged damage`;
            }
        },
        
        // SKILL T - Mana Surge
        skillT: {
            id: "wizard_mana_surge",
            name: "MANA SURGE",
            icon: "⚡",
            key: "T",
            description: "Increases mana regeneration",
            levels: [
                { manaRegenBonus: 0.50 },  // Level 1: +50%
                { manaRegenBonus: 0.75 },  // Level 2: +75%
                { manaRegenBonus: 1.00 },  // Level 3: +100%
                { manaRegenBonus: 1.50 },  // Level 4: +150%
            ],
            getDescription(level) {
                const pct = this.levels[level - 1].manaRegenBonus * 100;
                return `+${pct}% mana regeneration`;
            }
        },
        
        // SKILL Y - Ultimate: Arcane Storm
        skillY: {
            id: "wizard_arcane_storm",
            name: "ARCANE STORM",
            icon: "⚡",
            key: "Y",
            description: "Casts a devastating arcane storm that follows enemies",
            isUltimate: true,
            levels: [
                { damage: 25, duration: 4.0, radius: 150, tickRate: 0.5, manaCost: 130 },
                { damage: 35, duration: 5.0, radius: 180, tickRate: 0.4, manaCost: 150 },
                { damage: 45, duration: 6.0, radius: 210, tickRate: 0.3, manaCost: 170 },
                { damage: 60, duration: 7.0, radius: 240, tickRate: 0.25, manaCost: 190 },
            ],
            getDescription(level) {
                const lvl = this.levels[level - 1];
                return `${lvl.damage} damage/tick, ${lvl.duration}s duration, ${lvl.radius}px radius`;
            }
        },
    },
};

// Get skills for a hero
export function getHeroSkills(heroId) {
    return HERO_SKILLS[heroId] || HERO_SKILLS.warrior;
}

// Get passive skill for a hero (LEGACY - returns null, no passive anymore)
export function getHeroPassive(heroId) {
    return null; // No passive skills in new system
}

// Get active skill by key (Q, R, T, Y)
export function getHeroSkillByKey(heroId, key) {
    const skills = getHeroSkills(heroId);
    if (key === 'Q') return skills.skillQ;
    if (key === 'R') return skills.skillR;
    if (key === 'T') return skills.skillT;
    if (key === 'Y') return skills.skillY;
    return null;
}

// Get all active skills for a hero (Q, R, T, Y)
export function getHeroActiveSkills(heroId) {
    const skills = getHeroSkills(heroId);
    return [skills.skillQ, skills.skillR, skills.skillT, skills.skillY].filter(s => s);
}

export default { HERO_SKILLS, getHeroSkills, getHeroPassive, getHeroActiveSkills, getHeroSkillByKey };
