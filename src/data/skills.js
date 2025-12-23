// ==================== PASSIVE SKILLS (PERKS) ====================
// Permanent upgrades you can buy in the shop!

export const PASSIVE_SKILLS = {
    // 1. Poison - projectiles poison enemies
    poison: {
        id: "poison",
        name: "POISON",
        icon: "☠️",
        description: "Projectiles poison enemies for damage over time",
        cost: 150,
        maxLevel: 3,
        effect: {
            poisonDamage: [5, 8, 12],
            poisonDuration: [3, 4, 5],
        },
    },
    
    // 2. Vampirism - heal on kill
    vampirism: {
        id: "vampirism",
        name: "VAMPIRISM",
        icon: "🧛",
        description: "Restore HP on each kill",
        cost: 200,
        maxLevel: 3,
        effect: {
            healOnKill: [5, 10, 15],
            healOnBossKill: [20, 35, 50],
        },
    },
    
    // 3. Thorns - reflect damage
    thorns: {
        id: "thorns",
        name: "THORNS",
        icon: "🌵",
        description: "Reflect damage back to attackers",
        cost: 175,
        maxLevel: 3,
        effect: {
            reflectPercent: [15, 25, 40],
        },
    },
    
    // 4. Critical Strike
    critical: {
        id: "critical",
        name: "CRITICAL HIT",
        icon: "💥",
        description: "Chance to deal double damage",
        cost: 180,
        maxLevel: 3,
        effect: {
            critChance: [10, 20, 30],
            critMultiplier: [2.0, 2.25, 2.5],
        },
    },
    
    // 5. Gold Magnet - more gold
    goldMagnet: {
        id: "goldMagnet",
        name: "GOLD RUSH",
        icon: "🧲",
        description: "Gain bonus gold from enemies",
        cost: 120,
        maxLevel: 3,
        effect: {
            goldBonus: [25, 50, 100],
        },
    },
    
    // 6. Regeneration - heal over time
    regeneration: {
        id: "regeneration",
        name: "REGENERATION",
        icon: "💚",
        description: "Slowly restore HP over time",
        cost: 160,
        maxLevel: 3,
        effect: {
            hpPerSecond: [1, 2, 4],
        },
    },
};

export function getSkill(id) {
    return PASSIVE_SKILLS[id] || null;
}

export function getAllSkills() {
    return Object.values(PASSIVE_SKILLS);
}

export function getSkillCost(skillId, currentLevel) {
    const skill = getSkill(skillId);
    if (!skill) return 999999;
    return Math.floor(skill.cost * (1 + currentLevel * 0.5));
}

export default { PASSIVE_SKILLS, getSkill, getAllSkills, getSkillCost };
