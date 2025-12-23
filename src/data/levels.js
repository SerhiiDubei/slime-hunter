// ==================== LEVEL CONFIGURATIONS ====================
// Each level has unique settings, dialogues, and boss

export const LEVELS = [
    {
        id: 1,
        name: "THE SLIME PIT",
        subtitle: "Where it all begins...",
        background: [26, 26, 46],
        enemyCount: 5,
        bossWithMinions: false,        // Boss spawns alone
        difficultyMultiplier: 1.0,
        bossType: "slime_king",
        // Hero's thoughts before level
        heroDialogue: "These caves are crawling with slimes. I must be careful...",
        // Boss dialogue when appearing
        bossDialogue: "You dare enter MY domain?! I am the SLIME KING!",
    },
    {
        id: 2,
        name: "DARK CORRIDORS",
        subtitle: "The shadows grow deeper",
        background: [30, 25, 45],
        enemyCount: 7,
        bossWithMinions: true,         // Boss spawns with 2 minions
        minionCount: 2,
        difficultyMultiplier: 1.25,
        bossType: "speed_demon",
        heroDialogue: "Something fast is lurking here. I can feel it watching me...",
        bossDialogue: "You're too SLOW! I'll tear you apart before you can blink!",
    },
    {
        id: 3,
        name: "NECROMANCER'S TOMB",
        subtitle: "The dead do not rest here",
        background: [35, 25, 40],
        enemyCount: 8,
        bossWithMinions: true,
        minionCount: 3,
        difficultyMultiplier: 1.5,
        bossType: "necromancer",
        heroDialogue: "Dark magic fills the air. The necromancer must be close...",
        bossDialogue: "Rise, my minions! RISE! This hero will join our ranks!",
    },
    {
        id: 4,
        name: "FROZEN DEPTHS",
        subtitle: "Where hope freezes solid",
        background: [25, 35, 55],
        enemyCount: 9,
        bossWithMinions: true,
        minionCount: 2,
        difficultyMultiplier: 1.75,
        bossType: "frost_giant",
        heroDialogue: "The cold is unbearable. I must end this quickly...",
        bossDialogue: "FEEL THE ETERNAL FROST! Your bones will shatter!",
    },
    {
        id: 5,
        name: "INFERNO LAIR",
        subtitle: "Hell awaits the unworthy",
        background: [55, 25, 20],
        enemyCount: 10,
        bossWithMinions: true,
        minionCount: 3,
        difficultyMultiplier: 2.0,
        bossType: "inferno",
        heroDialogue: "The heat is intense. This demon must be powerful...",
        bossDialogue: "BURN! BURN IN ETERNAL FLAMES! Nothing escapes the INFERNO!",
    },
    {
        id: 6,
        name: "SHADOW REALM",
        subtitle: "Where light goes to die",
        background: [15, 15, 25],
        enemyCount: 11,
        bossWithMinions: true,
        minionCount: 4,
        difficultyMultiplier: 2.25,
        bossType: "shadow_lord",
        heroDialogue: "I can barely see... The shadows themselves seem alive...",
        bossDialogue: "Welcome to MY realm, hero. You will NEVER leave!",
    },
    {
        id: 7,
        name: "THE FINAL CHALLENGE",
        subtitle: "Only the worthy survive",
        background: [45, 30, 50],
        enemyCount: 12,
        bossWithMinions: true,
        minionCount: 4,
        difficultyMultiplier: 2.5,
        bossType: "mega_slime",
        heroDialogue: "This is it. The ultimate test. I won't fail!",
        bossDialogue: "I AM THE MEGA SLIME! ALL YOUR EFFORTS END HERE!",
    },
];

export function getLevel(id) {
    return LEVELS.find(l => l.id === id) || LEVELS[0];
}

export function getLevelCount() {
    return LEVELS.length;
}

export function getEnemyCountForLevel(levelId) {
    const level = getLevel(levelId);
    return level.enemyCount;
}

export default { LEVELS, getLevel, getLevelCount, getEnemyCountForLevel };
