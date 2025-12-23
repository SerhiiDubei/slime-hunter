// ==================== MAIN ENTRY POINT ====================
// Slime Hunter - Top-Down Action RPG
// Modular ES6 version with Vite

import { CONFIG } from './config.js';
import { GS } from './state.js';
import { initAudio } from './audio.js';
import { initKeyboard, KEYS } from './keyboard.js';
import { loadAllSprites } from './sprites.js';
import { setupTouch } from './touch.js';
import { meleeAttack, rangedAttack } from './attacks.js';

// Scene imports
import { createStartScene } from './scenes/start.js';
import { createHeroSelectScene } from './scenes/heroSelect.js';
import { createGameScene } from './scenes/game.js';
import { createGameOverScene } from './scenes/gameover.js';
import { createVictoryScene } from './scenes/victory.js';
import { createShopScene } from './scenes/shop.js';
import { createLevelIntroScene } from './scenes/levelIntro.js';
import { createOptionsScene } from './scenes/options.js';

// Initialize Kaboom
kaboom({
    width: CONFIG.MAP_WIDTH,
    height: CONFIG.MAP_HEIGHT,
    background: [26, 26, 46],
    canvas: document.getElementById("game"),
    global: true,
    focus: true,
    crisp: true,
    debug: false,
});

// Initialize keyboard input
initKeyboard();

// Initialize audio on first click
document.addEventListener("click", () => initAudio(), { once: true });
document.addEventListener("touchstart", () => initAudio(), { once: true });

// Load sprites
loadAllSprites();

// Create scenes
createStartScene();
createHeroSelectScene();
createGameScene();
createGameOverScene();
createVictoryScene();
createShopScene();
createLevelIntroScene();
createOptionsScene();

// Setup touch controls with attack functions
const doMeleeAttack = () => meleeAttack(() => {});
const doRangedAttack = () => rangedAttack(() => {});
setupTouch(doMeleeAttack, doRangedAttack);

// Start game
go("start");

// Console info
console.log("🎮 Slime Hunter loaded!");
console.log("📁 Modular structure with Vite");
console.log("🕹️ Controls: WASD/Arrows + SPACE/E + SHIFT");

