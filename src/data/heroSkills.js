// ==================== HERO-SPECIFIC SKILLS ====================
// Each hero has 4 skills: 1 passive + 3 active
// Skills are chosen when leveling up

export const HERO_SKILLS = {
    // ========== WARRIOR SKILLS ==========
    warrior: {
        // PASSIVE SKILL (always active)
        passive: {
            id: "warrior_armor",
            name: "IRON ARMOR",
            icon: "🛡️",
            description: "Reduces incoming damage by 15%",
            effect: {
                damageReduction: 0.15,
            }
        },
        
        // ACTIVE SKILLS (choose 1 when leveling up)
        active: [
            {
                id: "warrior_melee_damage",
                name: "MIGHTY STRIKE",
                icon: "⚔️",
                description: "+20% melee damage",
                effect: {
                    meleeDamageBonus: 0.20,
                }
            },
            {
                id: "warrior_melee_range",
                name: "LONG REACH",
                icon: "📏",
                description: "+30% melee attack range",
                effect: {
                    meleeRangeBonus: 0.30,
                }
            },
            {
                id: "warrior_health",
                name: "IRON WILL",
                icon: "❤️",
                description: "+25% max HP",
                effect: {
                    maxHpBonus: 0.25,
                }
            },
            {
                id: "warrior_axe_damage",
                name: "HEAVY THROW",
                icon: "🪓",
                description: "+25% ranged (axe) damage",
                effect: {
                    rangedDamageBonus: 0.25,
                }
            },
            {
                id: "warrior_axe_knockback",
                name: "CRUSHING BLOW",
                icon: "💥",
                description: "+50% knockback on ranged attacks",
                effect: {
                    knockbackBonus: 0.50,
                }
            },
            {
                id: "warrior_double_strike",
                name: "DOUBLE STRIKE",
                icon: "⚔️⚔️",
                description: "Melee attacks hit twice",
                effect: {
                    doubleStrike: true,
                }
            },
        ]
    },
    
    // ========== MAGE SKILLS ==========
    mage: {
        passive: {
            id: "mage_mana_regen",
            name: "ARCANE FLOW",
            icon: "✨",
            description: "Ranged attacks have -10% cooldown",
            effect: {
                rangedCooldownReduction: 0.10,
            }
        },
        
        active: [
            {
                id: "mage_ranged_damage",
                name: "POWER BOLT",
                icon: "🔮",
                description: "+25% ranged damage",
                effect: {
                    rangedDamageBonus: 0.25,
                }
            },
            {
                id: "mage_double_shot",
                name: "DUAL CAST",
                icon: "🔮🔮",
                description: "Fire 2 projectiles instead of 1",
                effect: {
                    bulletCount: 2,
                }
            },
            {
                id: "mage_triple_shot",
                name: "TRIPLE CAST",
                icon: "🔮🔮🔮",
                description: "Fire 3 projectiles instead of 1",
                effect: {
                    bulletCount: 3,
                }
            },
            {
                id: "mage_piercing",
                name: "PIERCING BOLT",
                icon: "➡️",
                description: "Projectiles pierce through enemies",
                effect: {
                    piercing: true,
                    maxPierceCount: 2,
                }
            },
            {
                id: "mage_cooldown",
                name: "RAPID CAST",
                icon: "⚡",
                description: "-20% ranged cooldown",
                effect: {
                    rangedCooldownReduction: 0.20,
                }
            },
            {
                id: "mage_projectile_size",
                name: "GREATER BOLT",
                icon: "💫",
                description: "+40% projectile size and damage",
                effect: {
                    projectileSizeBonus: 0.40,
                    rangedDamageBonus: 0.40,
                }
            },
        ]
    },
    
    // ========== ASSASSIN SKILLS ==========
    assassin: {
        passive: {
            id: "assassin_crit",
            name: "SHADOW STRIKE",
            icon: "🗡️",
            description: "15% chance to deal 2x damage",
            effect: {
                critChance: 0.15,
                critMultiplier: 2.0,
            }
        },
        
        active: [
            {
                id: "assassin_melee_damage",
                name: "DEADLY BLADE",
                icon: "🗡️",
                description: "+25% melee damage",
                effect: {
                    meleeDamageBonus: 0.25,
                }
            },
            {
                id: "assassin_poison",
                name: "VENOM",
                icon: "☠️",
                description: "All attacks poison enemies",
                effect: {
                    poison: true,
                    poisonDamage: 8,
                    poisonDuration: 4,
                }
            },
            {
                id: "assassin_speed",
                name: "SWIFT STRIKE",
                icon: "💨",
                description: "+20% movement speed",
                effect: {
                    moveSpeedBonus: 0.20,
                }
            },
            {
                id: "assassin_dagger_burst",
                name: "BURST FIRE",
                icon: "🗡️🗡️🗡️",
                description: "Ranged attacks fire 3 daggers",
                effect: {
                    burstCount: 3,
                }
            },
            {
                id: "assassin_cooldown",
                name: "QUICK DRAW",
                icon: "⚡",
                description: "-25% ranged cooldown",
                effect: {
                    rangedCooldownReduction: 0.25,
                }
            },
            {
                id: "assassin_dagger_pierce",
                name: "PIERCING DAGGER",
                icon: "➡️",
                description: "Daggers pierce through enemies",
                effect: {
                    piercing: true,
                    maxPierceCount: 2,
                }
            },
        ]
    },
    
    // ========== RANGER SKILLS ==========
    ranger: {
        passive: {
            id: "ranger_homing",
            name: "TRACKING",
            icon: "🎯",
            description: "Arrows track enemies better (+50% homing strength)",
            effect: {
                homingStrengthBonus: 0.50,
            }
        },
        
        active: [
            {
                id: "ranger_ranged_damage",
                name: "POWER SHOT",
                icon: "🏹",
                description: "+25% ranged damage",
                effect: {
                    rangedDamageBonus: 0.25,
                }
            },
            {
                id: "ranger_arrow_pierce",
                name: "PIERCING ARROW",
                icon: "➡️",
                description: "Arrows pierce through more enemies (+2 pierce)",
                effect: {
                    maxPierceCount: 5, // Was 3, now 5
                }
            },
            {
                id: "ranger_double_shot",
                name: "DOUBLE SHOT",
                icon: "🏹🏹",
                description: "Fire 2 arrows instead of 1",
                effect: {
                    bulletCount: 2,
                }
            },
            {
                id: "ranger_triple_shot",
                name: "TRIPLE SHOT",
                icon: "🏹🏹🏹",
                description: "Fire 3 arrows instead of 1",
                effect: {
                    bulletCount: 3,
                }
            },
            {
                id: "ranger_cooldown",
                name: "RAPID FIRE",
                icon: "⚡",
                description: "-20% ranged cooldown",
                effect: {
                    rangedCooldownReduction: 0.20,
                }
            },
            {
                id: "ranger_arrow_speed",
                name: "SWIFT ARROW",
                icon: "💨",
                description: "+30% arrow speed",
                effect: {
                    projectileSpeedBonus: 0.30,
                }
            },
        ]
    },
};

// Get skills for a hero
export function getHeroSkills(heroId) {
    return HERO_SKILLS[heroId] || HERO_SKILLS.warrior;
}

// Get passive skill for a hero
export function getHeroPassive(heroId) {
    const skills = getHeroSkills(heroId);
    return skills.passive;
}

// Get active skills for a hero
export function getHeroActiveSkills(heroId) {
    const skills = getHeroSkills(heroId);
    return skills.active;
}

export default { HERO_SKILLS, getHeroSkills, getHeroPassive, getHeroActiveSkills };

