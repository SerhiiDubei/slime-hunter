// ==================== MAIN ENTRY POINT ====================
// Slime Hunter - Top-Down Action RPG
// Modular ES6 version with Vite

console.log("🚀 MAIN.JS LOADING...");

import { CONFIG } from './config.js';
import { GS } from './state.js';
import { initAudio } from './audio.js';
import { initKeyboard, KEYS } from './keyboard.js';
import { loadAllSprites } from './sprites.js';
import { setupTouch } from './touch.js';
import { meleeAttack, rangedAttack } from './attacks.js';
import { Logger, toggleDebugOverlay } from './logger.js';

// Scene imports
import { createStartScene } from './scenes/start.js';
import { createHeroSelectScene } from './scenes/heroSelect.js';
import { createGameScene } from './scenes/game.js';
import { createGameOverScene } from './scenes/gameover.js';
import { createVictoryScene } from './scenes/victory.js';
import { createShopScene } from './scenes/shop.js';
import { createLevelIntroScene } from './scenes/levelIntro.js';
import { createOptionsScene } from './scenes/options.js';

Logger.info('🎮 Slime Hunter starting...');

// Initialize Kaboom with viewport dimensions (camera will scroll larger map)
try {
    kaboom({
        width: CONFIG.VIEWPORT_WIDTH,     // 800 viewport
        height: CONFIG.VIEWPORT_HEIGHT,   // 600 viewport
        background: [26, 26, 46],
        canvas: document.getElementById("game"),
        global: true,
        focus: true,
        crisp: false,
        pixelDensity: 2,
        letterbox: true,
        stretch: true,
        debug: false,
    });
    
    Logger.info('Kaboom initialized', { 
        viewport: `${CONFIG.VIEWPORT_WIDTH}x${CONFIG.VIEWPORT_HEIGHT}`,
        map: `${CONFIG.MAP_WIDTH}x${CONFIG.MAP_HEIGHT}` 
    });
} catch (error) {
    Logger.error('Failed to initialize Kaboom', { error: error.message });
    throw error;
}

// Initialize keyboard input
try {
    initKeyboard();
    Logger.info('Keyboard initialized');
} catch (error) {
    Logger.error('Failed to initialize keyboard', { error: error.message });
}

// Initialize audio on first click
document.addEventListener("click", () => {
    try {
        initAudio();
        Logger.info('Audio initialized');
    } catch (error) {
        Logger.error('Audio init failed', { error: error.message });
    }
}, { once: true });
document.addEventListener("touchstart", () => initAudio(), { once: true });

// Load sprites
try {
    loadAllSprites();
    Logger.info('Sprites loaded');
} catch (error) {
    Logger.error('Failed to load sprites', { error: error.message });
}

// Create scenes with error handling
try {
    createStartScene();
    createHeroSelectScene();
    createGameScene();
    createGameOverScene();
    createVictoryScene();
    createShopScene();
    createLevelIntroScene();
    createOptionsScene();
    Logger.info('All scenes created');
} catch (error) {
    Logger.error('Failed to create scenes', { error: error.message, stack: error.stack });
}

// Setup touch controls with attack functions
const doMeleeAttack = () => {
    try {
        meleeAttack(() => {});
    } catch (error) {
        Logger.error('Melee attack error', { error: error.message });
    }
};
const doRangedAttack = () => {
    try {
        rangedAttack(() => {});
    } catch (error) {
        Logger.error('Ranged attack error', { error: error.message });
    }
};
setupTouch(doMeleeAttack, doRangedAttack);

// F2 to toggle debug overlay
onKeyPress("f2", () => {
    toggleDebugOverlay();
});

// Start game
try {
    go("start");
    Logger.info('Game started - navigating to start scene');
} catch (error) {
    Logger.error('Failed to start game', { error: error.message });
}

// Console info
console.log("🎮 Slime Hunter loaded!");
console.log("📁 Modular structure with Vite");
console.log("🕹️ Controls: WASD/Arrows + SPACE/E + SHIFT");
console.log("🐛 Press F2 for debug log");
