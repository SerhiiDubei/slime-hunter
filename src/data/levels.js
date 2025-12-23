// ==================== LEVEL CONFIGURATIONS ====================
// Easy to add new levels - just add more objects to the array!

export const LEVELS = [
    // Level 1 - Tutorial / Easy
    {
        id: 1,
        name: "Dungeon Entrance",
        background: [26, 26, 46],
        enemyCount: 6,
        difficultyMultiplier: 1.0,
        bossType: "slime_king",
        obstacles: 3,
        decorations: ["torch", "cobweb", "skull"],
        music: null, // Future: add music
    },
    
    // Level 2 - Medium
    {
        id: 2,
        name: "Dark Corridors",
        background: [35, 25, 45],
        enemyCount: 6,
        difficultyMultiplier: 1.25,
        bossType: "slime_king",
        obstacles: 4,
        decorations: ["torch", "blood", "bones", "skull"],
        music: null,
    },
    
    // Level 3 - Hard
    {
        id: 3,
        name: "Boss Lair",
        background: [45, 25, 30],
        enemyCount: 6,
        difficultyMultiplier: 1.5,
        bossType: "slime_emperor",
        obstacles: 5,
        decorations: ["torch", "blood", "bones", "skull", "crack"],
        music: null,
    },
    
    // ========== FUTURE LEVELS ==========
    // Uncomment and add when ready!
    
    /*
    // Level 4
    {
        id: 4,
        name: "Frozen Depths",
        background: [25, 35, 55],
        enemyCount: 7,
        difficultyMultiplier: 1.75,
        bossType: "ice_slime",
        obstacles: 4,
        decorations: ["torch", "moss"],
        music: null,
    },
    
    // Level 5
    {
        id: 5,
        name: "Lava Cavern",
        background: [55, 25, 20],
        enemyCount: 7,
        difficultyMultiplier: 2.0,
        bossType: "fire_slime",
        obstacles: 5,
        decorations: ["torch", "blood", "crack"],
        music: null,
    },
    */
];

// Helper to get level by ID
export function getLevel(id) {
    return LEVELS.find(l => l.id === id) || LEVELS[0];
}

// Get total level count
export function getLevelCount() {
    return LEVELS.length;
}

export default { LEVELS, getLevel, getLevelCount };

