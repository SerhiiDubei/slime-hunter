// ==================== GAME SCENE ====================
// Main gameplay scene with ROOM SYSTEM
// Each level has multiple rooms - clear all enemies to unlock doors

import { CONFIG } from '../config.js';
import { GS } from '../state.js';
import { playSound } from '../audio.js';
import { KEYS } from '../keyboard.js';
import { choose } from '../utils.js';
import { KEYBINDS } from '../state.js';
import { createPlayer, setupPlayerMovement } from '../entities/player.js';
import { spawnRandomEnemy, spawnBoss } from '../entities/enemies.js';
import { getLevel } from '../data/levels.js';
import { meleeAttack, rangedAttack } from '../attacks.js';
import { setupUltimate, tryUseUltimate, updateUltimate } from '../ultimate.js';
import { createHUD } from '../ui.js';
import { Logger } from '../logger.js';

let door, doorText, roomIndicator;

// Get room configuration
function getRoomConfig() {
    const level = GS.currentLevel;
    const room = GS.currentRoom;
    const totalRooms = GS.totalRooms;
    const isBossRoom = room >= totalRooms - 1;
    
    // Base enemies per room (scales with level and room)
    let enemyCount;
    if (isBossRoom) {
        enemyCount = 0; // Boss room - only boss spawns
    } else {
        // Earlier rooms have fewer enemies
        const baseEnemies = 3 + level;
        const roomMultiplier = 0.7 + (room * 0.3); // Room 0: 70%, Room 1: 100%, Room 2: 130%
        enemyCount = Math.floor(baseEnemies * roomMultiplier);
    }
    
    return {
        enemyCount,
        isBossRoom,
        roomNumber: room + 1,
        totalRooms,
    };
}

function spawnKey(p) {
    Logger.info('Spawning key at', { x: p.x, y: p.y });
    
    const k = add([
        sprite("key"), pos(p), anchor("center"), area(), z(5), scale(1), "key"
    ]);
    
    const startY = p.y;
    k.onUpdate(() => {
        k.pos.y = startY + Math.sin(time() * 4) * 5;
        k.angle = Math.sin(time() * 2) * 10;
    });
    
    const glow = add([
        circle(20), pos(p), color(255, 220, 100), opacity(0.3), anchor("center"), z(4), scale(1), "keyPart"
    ]);
    glow.onUpdate(() => {
        if (!k.exists()) { destroy(glow); return; }
        glow.pos = k.pos;
        glow.opacity = 0.2 + Math.sin(time() * 5) * 0.15;
        glow.scale = vec2(1.5 + Math.sin(time() * 3) * 0.3);
    });
}

// Called when all room enemies are killed
function onRoomCleared() {
    Logger.info('Room cleared!', { room: GS.currentRoom, level: GS.currentLevel });
    
    GS.roomCleared = true;
    GS.doorOpen = true;
    
    // Update door visual
    if (door && door.exists()) {
        door.use(sprite("doorOpen"));
    }
    
    // Update door text
    if (doorText && doorText.exists()) {
        const isBossRoom = GS.isBossRoom();
        if (isBossRoom) {
            doorText.text = "🏆 NEXT LEVEL!";
        } else {
            doorText.text = "🚪 NEXT ROOM";
        }
        doorText.color = rgb(100, 255, 100);
    }
    
    playSound('door');
    
    // Room clear celebration effect
    shake(5);
    
    const clearText = add([
        text("✨ ROOM CLEARED! ✨", { size: 28 }),
        pos(CONFIG.MAP_WIDTH / 2, CONFIG.MAP_HEIGHT / 2 - 50),
        anchor("center"), color(100, 255, 150), z(150), opacity(1), { t: 0 }
    ]);
    clearText.onUpdate(() => {
        clearText.t += dt();
        clearText.pos.y -= 30 * dt();
        clearText.opacity = 1 - clearText.t / 2;
        if (clearText.t > 2) destroy(clearText);
    });
}

export function createGameScene() {
    scene("game", () => {
        // Initialize room count for this level
        GS.totalRooms = GS.getRoomsForLevel();
        
        Logger.info('=== GAME SCENE START ===', { 
            level: GS.currentLevel, 
            room: GS.currentRoom + 1, 
            totalRooms: GS.totalRooms 
        });
        
        try {
            GS.enemies = [];
            GS.roomCleared = false;
            GS.roomEnemiesKilled = 0;
            GS.doorOpen = false;
            
            const roomConfig = getRoomConfig();
            GS.roomEnemyCount = roomConfig.enemyCount;
            
            const lv = GS.currentLevel;
            const roomNum = GS.currentRoom;
            
            // Room-specific background colors (darker as you go deeper)
            const baseColors = [[26, 26, 46], [35, 25, 45], [45, 25, 30], [30, 30, 50], [40, 20, 35], [25, 35, 45], [50, 30, 40]];
            const baseBg = baseColors[(lv - 1) % baseColors.length];
            
            // Darken based on room number
            const roomDarken = roomNum * 5;
            const bg = [
                Math.max(10, baseBg[0] - roomDarken),
                Math.max(10, baseBg[1] - roomDarken),
                Math.max(10, baseBg[2] - roomDarken)
            ];

            // Base background
            add([rect(CONFIG.MAP_WIDTH, CONFIG.MAP_HEIGHT), pos(0, 0), color(...bg), z(-100)]);
            
            // Tiled floor
            for (let x = CONFIG.WALL_THICKNESS; x < CONFIG.MAP_WIDTH - CONFIG.WALL_THICKNESS; x += 40) {
                for (let y = CONFIG.WALL_THICKNESS; y < CONFIG.MAP_HEIGHT - CONFIG.WALL_THICKNESS; y += 40) {
                    const tileShade = rand(0.85, 1.1);
                    add([
                        rect(40, 40), pos(x, y),
                        color(bg[0] * tileShade, bg[1] * tileShade, bg[2] * tileShade),
                        z(-99)
                    ]);
                    add([rect(40, 1), pos(x, y), color(bg[0] + 20, bg[1] + 20, bg[2] + 30), opacity(0.2), z(-98)]);
                    add([rect(1, 40), pos(x, y), color(bg[0] + 20, bg[1] + 20, bg[2] + 30), opacity(0.2), z(-98)]);
                    
                    if (rand() < 0.08) {
                        add([sprite("crack"), pos(x, y), opacity(0.4), z(-97)]);
                    }
                    if (rand() < 0.03 + roomNum * 0.01) {
                        add([sprite("blood"), pos(x + rand(5, 30), y + rand(5, 30)), opacity(0.3 + lv * 0.1), z(-96), anchor("center")]);
                    }
                }
            }

            // Walls
            const wc = [60 + lv * 10, 60, 100];
            for (let x = 0; x < CONFIG.MAP_WIDTH; x += 40) {
                add([sprite("wall"), pos(x, 0), z(-50)]);
                add([sprite("wall"), pos(x, CONFIG.MAP_HEIGHT - CONFIG.WALL_THICKNESS), z(-50)]);
            }
            for (let y = 0; y < CONFIG.MAP_HEIGHT; y += 40) {
                add([sprite("wall"), pos(0, y), z(-50)]);
                add([sprite("wall"), pos(CONFIG.MAP_WIDTH - CONFIG.WALL_THICKNESS, y), z(-50)]);
            }
            
            // Invisible wall colliders
            add([rect(CONFIG.MAP_WIDTH, CONFIG.WALL_THICKNESS), pos(0, 0), color(...wc), area(), body({ isStatic: true }), opacity(0), "wall"]);
            add([rect(CONFIG.MAP_WIDTH, CONFIG.WALL_THICKNESS), pos(0, CONFIG.MAP_HEIGHT - CONFIG.WALL_THICKNESS), color(...wc), area(), body({ isStatic: true }), opacity(0), "wall"]);
            add([rect(CONFIG.WALL_THICKNESS, CONFIG.MAP_HEIGHT), pos(0, 0), color(...wc), area(), body({ isStatic: true }), opacity(0), "wall"]);
            add([rect(CONFIG.WALL_THICKNESS, CONFIG.MAP_HEIGHT), pos(CONFIG.MAP_WIDTH - CONFIG.WALL_THICKNESS, 0), color(...wc), area(), body({ isStatic: true }), opacity(0), "wall"]);

            // Torches (more in later rooms)
            const torchPositions = [
                [CONFIG.WALL_THICKNESS + 5, 60],
                [CONFIG.WALL_THICKNESS + 5, CONFIG.MAP_HEIGHT - 80],
                [CONFIG.MAP_WIDTH - CONFIG.WALL_THICKNESS - 20, 60],
                [CONFIG.MAP_WIDTH - CONFIG.WALL_THICKNESS - 20, CONFIG.MAP_HEIGHT - 80],
                [CONFIG.MAP_WIDTH / 2, 5],
            ];
            torchPositions.forEach(([tx, ty]) => {
                const torch = add([sprite("torch"), pos(tx, ty), z(1), scale(1)]);
                torch.onUpdate(() => {
                    torch.scale = vec2(1 + Math.sin(time() * 15) * 0.1, 1 + Math.cos(time() * 12) * 0.15);
                });
                const glow = add([circle(30), pos(tx + 8, ty + 8), color(255, 150, 50), opacity(0.15), anchor("center"), z(0)]);
                glow.onUpdate(() => {
                    glow.opacity = 0.1 + Math.sin(time() * 8) * 0.05;
                    glow.scale = vec2(1 + Math.sin(time() * 6) * 0.2);
                });
            });

            // Cobwebs
            add([sprite("cobweb"), pos(CONFIG.WALL_THICKNESS, CONFIG.WALL_THICKNESS), z(1), opacity(0.6)]);
            add([sprite("cobweb"), pos(CONFIG.MAP_WIDTH - CONFIG.WALL_THICKNESS, CONFIG.WALL_THICKNESS), z(1), opacity(0.6), scale(-1, 1)]);

            // Wall decorations
            for (let i = 0; i < 4 + lv; i++) {
                const side = Math.floor(rand(0, 4));
                let dx, dy;
                if (side === 0) { dx = rand(60, CONFIG.MAP_WIDTH - 60); dy = CONFIG.WALL_THICKNESS + 5; }
                else if (side === 1) { dx = rand(60, CONFIG.MAP_WIDTH - 60); dy = CONFIG.MAP_HEIGHT - CONFIG.WALL_THICKNESS - 25; }
                else if (side === 2) { dx = CONFIG.WALL_THICKNESS + 5; dy = rand(60, CONFIG.MAP_HEIGHT - 60); }
                else { dx = CONFIG.MAP_WIDTH - CONFIG.WALL_THICKNESS - 25; dy = rand(60, CONFIG.MAP_HEIGHT - 60); }
                
                const decor = choose(["skull", "bones", "moss"]);
                add([sprite(decor), pos(dx, dy), z(1), opacity(0.7 + rand(0, 0.3))]);
            }

            // Obstacles (more obstacles in later rooms)
            for (let i = 0; i < 3 + lv + roomNum; i++) {
                const ox = rand(100, CONFIG.MAP_WIDTH - 100);
                const oy = rand(100, CONFIG.MAP_HEIGHT - 150);
                const obstacleType = choose(["barrel", "crate", "crate"]);
                
                add([circle(15), pos(ox, oy + 12), color(0, 0, 0), opacity(0.3), anchor("center"), z(0)]);
                add([
                    sprite(obstacleType), pos(ox, oy),
                    area({ shape: new Rect(vec2(-12, -12), 24, 24) }),
                    body({ isStatic: true }), anchor("center"), z(3), "obstacle"
                ]);
            }

            // Door to next room/level
            const doorX = CONFIG.MAP_WIDTH - CONFIG.WALL_THICKNESS - 30;
            const doorY = CONFIG.MAP_HEIGHT / 2;
            door = add([sprite("doorClosed"), pos(doorX, doorY), anchor("center"), area(), z(2), "door"]);
            
            // Door text - shows room info
            const isBossRoom = roomConfig.isBossRoom;
            const doorLabel = isBossRoom ? "🔒 BOSS" : "🔒 LOCKED";
            doorText = add([text(doorLabel, { size: 14 }), pos(doorX, doorY - 45), anchor("center"), color(255, 100, 100), z(10)]);
            
            // Room indicator (top center)
            const roomLabel = isBossRoom ? `BOSS ROOM` : `ROOM ${roomConfig.roomNumber}/${roomConfig.totalRooms}`;
            roomIndicator = add([
                text(roomLabel, { size: 14 }),
                pos(CONFIG.MAP_WIDTH / 2, 65),
                anchor("center"), color(180, 180, 200), z(100), fixed()
            ]);

            // Create player (spawn on left side)
            const p = createPlayer();
            p.pos = vec2(CONFIG.WALL_THICKNESS + 60, CONFIG.MAP_HEIGHT / 2);
            setupPlayerMovement(p);

            // Attack handlers
            const doMeleeAttack = () => meleeAttack(spawnKey);
            const doRangedAttack = () => rangedAttack(spawnKey);

            // Setup ultimate
            setupUltimate();

            // Input - use customizable keybinds
            const meleeKey = KEYBINDS.meleeAttack || 'space';
            const rangedKey = KEYBINDS.rangedAttack || 'e';
            const ultKey = KEYBINDS.ultimate || 'q';
            
            onKeyPress(meleeKey, doMeleeAttack);
            onKeyPress("j", doMeleeAttack);
            
            let keyStates = {};
            onUpdate(() => {
                const rangedPressed = isKeyDown(rangedKey);
                if (rangedPressed && !keyStates.ranged) doRangedAttack();
                keyStates.ranged = rangedPressed;
                
                const meleePressed = isKeyDown(meleeKey);
                if (meleePressed && !keyStates.melee) doMeleeAttack();
                keyStates.melee = meleePressed;
                
                const ultPressed = isKeyDown(ultKey);
                if (ultPressed && !keyStates.ult) tryUseUltimate();
                keyStates.ult = ultPressed;
                
                updateUltimate();
                
                // Check if room is cleared (all enemies killed)
                if (!GS.roomCleared && !isBossRoom) {
                    const aliveEnemies = GS.enemies.filter(e => e && e.exists());
                    if (GS.roomEnemiesKilled >= GS.roomEnemyCount && aliveEnemies.length === 0) {
                        onRoomCleared();
                    }
                }
            });

            // Collisions
            onCollide("player", "enemy", (pl, en) => {
                try {
                    if (!pl || !pl.exists() || !en || !en.exists() || pl.invuln > 0) return;
                    
                    const e = GS.enemies.find(x => x && x.exists() && x.pos && en.pos && x.pos.dist(en.pos) < 20);
                    const dmg = e ? e.damage : CONFIG.ENEMY_DAMAGE * GS.difficulty();
                    pl.hp -= dmg;
                    pl.invuln = 1;
                    playSound('hit');
                    shake(e && e.isBoss ? 15 : 8);
                    
                    if (pl.pos && en.pos) {
                        const knockback = pl.pos.sub(en.pos).unit().scale(40);
                        pl.pos = pl.pos.add(knockback);
                    }
                    
                    if (pl.hp <= 0) { 
                        Logger.info('Player died', { level: GS.currentLevel, room: GS.currentRoom });
                        playSound('gameover'); 
                        wait(0.5, () => go("gameover")); 
                    }
                } catch (error) {
                    Logger.error('Enemy collision error', { error: error.message });
                }
            });

            onCollide("player", "key", () => {
                try {
                    Logger.info('Key collected!');
                    GS.hasKey = true;
                    playSound('key');
                    destroyAll("key");
                    destroyAll("keyPart");
                    
                    // Boss room cleared!
                    onRoomCleared();
                } catch (error) {
                    Logger.error('Key collision error', { error: error.message });
                }
            });

            onCollide("player", "door", () => {
                try {
                    if (!GS.doorOpen) {
                        return; // Door is locked
                    }
                    
                    Logger.debug('Going through door', { room: GS.currentRoom, level: GS.currentLevel });
                    playSound('levelup');
                    
                    // Check if this was the boss room
                    if (GS.isBossRoom()) {
                        // Level complete!
                        if (GS.currentLevel >= CONFIG.MAX_LEVELS) {
                            Logger.info('Victory! All levels complete');
                            go("victory");
                        } else {
                            // Go to shop, then next level
                            GS.currentLevel++;
                            GS.currentRoom = 0;
                            GS.resetLevel();
                            Logger.info('Level complete, going to shop', { newLevel: GS.currentLevel });
                            go("shop");
                        }
                    } else {
                        // Go to next room in same level
                        GS.currentRoom++;
                        GS.resetRoom();
                        Logger.info('Going to next room', { room: GS.currentRoom });
                        go("game"); // Reload scene with new room
                    }
                } catch (error) {
                    Logger.error('Door collision error', { error: error.message, stack: error.stack });
                }
            });

            // Spawn enemies based on room config
            if (isBossRoom) {
                // Boss room - spawn boss after intro
                Logger.info('Boss room - spawning boss');
                GS.bossSpawned = false;
                wait(1, () => {
                    GS.bossSpawned = true;
                    spawnBoss();
                });
            } else {
                // Regular room - spawn enemies
                const enemyCount = roomConfig.enemyCount;
                Logger.info('Spawning enemies', { count: enemyCount });
                
                const initialSpawn = Math.min(3, enemyCount);
                for (let i = 0; i < initialSpawn; i++) {
                    wait(i * 0.5, spawnRandomEnemy);
                }
            }

            // Create HUD
            createHUD();

            // Pause menu
            let pauseOverlay = null;
            let pauseText = null;
            let pauseResumeBtn = null;
            let pauseQuitBtn = null;
            
            function showPause() {
                if (GS.gameFrozen) return;
                GS.gamePaused = true;
                
                pauseOverlay = add([
                    rect(CONFIG.MAP_WIDTH, CONFIG.MAP_HEIGHT),
                    pos(0, 0), color(0, 0, 0), opacity(0.7), z(200), fixed()
                ]);
                
                pauseText = add([
                    text("⏸️ PAUSED", { size: 48 }),
                    pos(CONFIG.MAP_WIDTH / 2, CONFIG.MAP_HEIGHT / 2 - 80),
                    anchor("center"), color(255, 220, 100), z(201), fixed()
                ]);
                
                pauseResumeBtn = add([
                    rect(200, 50, { radius: 5 }),
                    pos(CONFIG.MAP_WIDTH / 2, CONFIG.MAP_HEIGHT / 2),
                    anchor("center"), color(50, 40, 35), area(), z(201), fixed(),
                    "pauseBtn"
                ]);
                add([
                    text("RESUME", { size: 20 }),
                    pos(CONFIG.MAP_WIDTH / 2, CONFIG.MAP_HEIGHT / 2),
                    anchor("center"), color(200, 180, 150), z(202), fixed(),
                    "pauseUI"
                ]);
                
                pauseQuitBtn = add([
                    rect(200, 50, { radius: 5 }),
                    pos(CONFIG.MAP_WIDTH / 2, CONFIG.MAP_HEIGHT / 2 + 70),
                    anchor("center"), color(80, 40, 40), area(), z(201), fixed(),
                    "quitBtn"
                ]);
                add([
                    text("QUIT TO MENU", { size: 16 }),
                    pos(CONFIG.MAP_WIDTH / 2, CONFIG.MAP_HEIGHT / 2 + 70),
                    anchor("center"), color(200, 150, 150), z(202), fixed(),
                    "pauseUI"
                ]);
                
                add([
                    text("Press ESC to resume", { size: 12 }),
                    pos(CONFIG.MAP_WIDTH / 2, CONFIG.MAP_HEIGHT / 2 + 140),
                    anchor("center"), color(100, 100, 100), z(202), fixed(),
                    "pauseUI"
                ]);
            }
            
            function hidePause() {
                GS.gamePaused = false;
                if (pauseOverlay) { destroy(pauseOverlay); pauseOverlay = null; }
                if (pauseText) { destroy(pauseText); pauseText = null; }
                if (pauseResumeBtn) { destroy(pauseResumeBtn); pauseResumeBtn = null; }
                if (pauseQuitBtn) { destroy(pauseQuitBtn); pauseQuitBtn = null; }
                get("pauseUI").forEach(e => destroy(e));
            }
            
            onKeyPress("escape", () => {
                if (GS.gameFrozen) return;
                if (GS.gamePaused) {
                    hidePause();
                } else {
                    showPause();
                }
            });
            
            onClick("pauseBtn", () => { hidePause(); });
            onClick("quitBtn", () => { hidePause(); go("start"); });

            onKeyPress("f1", () => { debug.inspect = !debug.inspect; });
            
            Logger.info('Game scene initialized', { 
                room: GS.currentRoom + 1, 
                enemies: GS.roomEnemyCount,
                isBoss: isBossRoom 
            });
            
        } catch (error) {
            Logger.error('CRITICAL: Game scene failed', { 
                error: error.message, 
                stack: error.stack,
                level: GS.currentLevel,
                room: GS.currentRoom
            });
        }
    });
}

export default { createGameScene };
