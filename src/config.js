// ==================== GAME CONFIGURATION ====================
// All game constants and settings

export const CONFIG = {
    // Player settings
    PLAYER_SPEED: 120,
    PLAYER_HP: 100,
    PLAYER_DAMAGE: 25,
    PLAYER_ATTACK_RADIUS: 50,
    PLAYER_ATTACK_COOLDOWN: 0.5,
    PLAYER_SIZE: 32,
    PLAYER_COLOR: [78, 204, 163],

    // Ranged attack
    RANGED_DAMAGE: 15,
    RANGED_COOLDOWN: 2,
    RANGED_SPEED: 400,
    RANGED_SIZE: 12,
    RANGED_COLOR: [100, 200, 255],
    RANGED_RANGE: 500,

    // Sprint
    SPRINT_SPEED_MULTIPLIER: 1.8,
    SPRINT_MAX_STAMINA: 100,
    SPRINT_DRAIN_RATE: 40,
    SPRINT_REGEN_RATE: 25,

    // Enemy settings
    ENEMY_SPEED: 80,
    ENEMY_HP: 30,
    ENEMY_DAMAGE: 10,
    ENEMY_SIZE: 28,
    ENEMY_COLOR: [245, 87, 108],
    
    // Boss settings
    BOSS_HP_MULTIPLIER: 2,
    BOSS_DAMAGE_MULTIPLIER: 2,
    BOSS_SIZE: 45,
    BOSS_COLOR: [180, 50, 80],

    // Level settings
    ENEMIES_PER_LEVEL: 6,
    DIFFICULTY_INCREASE: 0.20,  // 20% per level
    MAX_LEVELS: 7,              // 7 levels!

    // Map settings (larger for camera scrolling)
    MAP_WIDTH: 1600,
    MAP_HEIGHT: 1200,
    VIEWPORT_WIDTH: 800,    // What player sees
    VIEWPORT_HEIGHT: 600,
    WALL_THICKNESS: 20,

    // Scoring & Gold
    SCORE_PER_KILL: 10,
    SCORE_PER_BOSS: 50,
    XP_PER_KILL: 20,
    XP_PER_BOSS: 100,
    GOLD_PER_KILL: 10,          // Base gold per enemy
    GOLD_PER_RANGED: 15,        // Gold for ranged enemy
    GOLD_PER_BOSS: 50,          // Base gold for boss

    // Player leveling
    PLAYER_LEVEL: {
        MAX_LEVEL: 30,
        XP_TABLE: [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000, 4900, 5900, 7000, 8200, 9500, 10900, 12400, 14000, 15700, 17500, 19400, 21400, 23500, 25700, 28000, 30400, 32900, 35500, 38200],
        DAMAGE_BONUS: 0.10,
        RANGED_DAMAGE_BONUS: 0.12,
        RANGED_COOLDOWN_REDUCTION: 0.08,
        DOUBLE_SHOT_LEVEL: 4,
        TRIPLE_SHOT_LEVEL: 7,
    },
};

export default CONFIG;
