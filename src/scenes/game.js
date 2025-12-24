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
import { DungeonManager, ROOM_TYPES } from '../data/rooms.js';

let doors = [];  // Multiple doors now
let doorTexts = [];
let roomIndicator;

// Get room configuration
function getRoomConfig() {
    const level = GS.currentLevel;
    const room = GS.currentRoom;
    const totalRooms = GS.totalRooms;
    const isBossRoom = room >= totalRooms - 1;
    
    // Base enemies per room (scales with level and room)
    // MORE enemies on early levels!
    let enemyCount;
    if (isBossRoom) {
        enemyCount = 0; // Boss room - only boss spawns
    } else {
        // Base: 6 enemies minimum, scales with level
        const baseEnemies = 6 + level * 2;
        const roomMultiplier = 0.8 + (room * 0.2); // Room 0: 80%, Room 1: 100%, Room 2: 120%
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
    
    // Mark room as cleared in dungeon
    if (GS.dungeon) {
        GS.dungeon.clearCurrentRoom();
    }
    
    // Update all doors visuals
    doors.forEach(door => {
        if (door && door.exists()) {
            door.use(sprite("doorOpen"));
        }
    });
    
    // Update door texts
    doorTexts.forEach(dt => {
        if (dt && dt.exists()) {
            const dungeon = GS.dungeon;
            if (dungeon) {
                const targetRoom = dungeon.getRoom(dt.targetRoomId);
                if (targetRoom) {
                    if (targetRoom.type === ROOM_TYPES.BOSS) {
                        dt.text = "💀";
                        dt.color = rgb(255, 50, 50);
                    } else if (targetRoom.type === ROOM_TYPES.TREASURE) {
                        dt.text = "💎";
                        dt.color = rgb(255, 220, 100);
                    } else if (targetRoom.cleared) {
                        dt.text = "✓";
                        dt.color = rgb(100, 200, 100);
                    } else {
                        dt.text = "→";
                        dt.color = rgb(100, 255, 150);
                    }
                }
            }
        }
    });
    
    playSound('door');
    
    // Room clear celebration effect - compact
    shake(4);
    
    const clearText = add([
        text("✨ CLEAR! ✨", { size: 20 }),
        pos(CONFIG.MAP_WIDTH / 2, CONFIG.MAP_HEIGHT / 2 - 30),
        anchor("center"), color(100, 255, 150), z(150), opacity(1), { t: 0 }
    ]);
    clearText.onUpdate(() => {
        clearText.t += dt();
        clearText.pos.y -= 25 * dt();
        clearText.opacity = 1 - clearText.t / 1.5;
        if (clearText.t > 1.5) destroy(clearText);
    });
}

export function createGameScene() {
    scene("game", () => {
        // Initialize dungeon manager if not exists
        if (!GS.dungeon || GS.currentRoom === 0) {
            GS.dungeon = new DungeonManager(GS.currentLevel);
        }
        
        const dungeon = GS.dungeon;
        const currentRoom = dungeon.getCurrentRoom();
        GS.totalRooms = dungeon.map.rooms.length;
        
        Logger.info('=== GAME SCENE START ===', { 
            level: GS.currentLevel, 
            roomId: currentRoom.id,
            roomType: currentRoom.type,
            totalRooms: GS.totalRooms 
        });
        
        try {
            GS.enemies = [];
            GS.roomCleared = currentRoom.cleared;
            GS.roomEnemiesKilled = 0;
            GS.doorOpen = currentRoom.cleared;
            
            const roomConfig = getRoomConfig();
            // Override with dungeon room data
            GS.roomEnemyCount = currentRoom.enemies || roomConfig.enemyCount;
            
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

            // Create doors based on dungeon connections
            doors = [];
            doorTexts = [];
            const adjacentRooms = dungeon.getAdjacentRooms();
            
            adjacentRooms.forEach(({ room: targetRoom, direction, canEnter }) => {
                let doorX, doorY, textOffsetX = 0, textOffsetY = -25;
                
                // Position door based on direction
                switch (direction) {
                    case 'right':
                        doorX = CONFIG.MAP_WIDTH - CONFIG.WALL_THICKNESS - 20;
                        doorY = CONFIG.MAP_HEIGHT / 2;
                        break;
                    case 'left':
                        doorX = CONFIG.WALL_THICKNESS + 20;
                        doorY = CONFIG.MAP_HEIGHT / 2;
                        break;
                    case 'up':
                        doorX = CONFIG.MAP_WIDTH / 2;
                        doorY = CONFIG.WALL_THICKNESS + 20;
                        textOffsetY = 25;
                        break;
                    case 'down':
                        doorX = CONFIG.MAP_WIDTH / 2;
                        doorY = CONFIG.MAP_HEIGHT - CONFIG.WALL_THICKNESS - 20;
                        textOffsetY = -25;
                        break;
                    default:
                        doorX = CONFIG.MAP_WIDTH - CONFIG.WALL_THICKNESS - 20;
                        doorY = CONFIG.MAP_HEIGHT / 2;
                }
                
                // Door sprite
                const doorSprite = currentRoom.cleared ? "doorOpen" : "doorClosed";
                const door = add([
                    sprite(doorSprite), 
                    pos(doorX, doorY), 
                    anchor("center"), 
                    area({ shape: new Rect(vec2(-15, -20), 30, 40) }), 
                    z(2), 
                    { targetRoomId: targetRoom.id, direction },
                    "door"
                ]);
                doors.push(door);
                
                // Door label - show room type
                let label = "🔒";
                let labelColor = rgb(255, 100, 100);
                
                if (currentRoom.cleared) {
                    if (targetRoom.type === ROOM_TYPES.BOSS) {
                        label = "💀";
                        labelColor = rgb(255, 50, 50);
                    } else if (targetRoom.type === ROOM_TYPES.TREASURE) {
                        label = "💎";
                        labelColor = rgb(255, 220, 100);
                    } else if (targetRoom.type === ROOM_TYPES.ELITE) {
                        label = "⭐";
                        labelColor = rgb(180, 80, 255);
                    } else if (targetRoom.visited) {
                        label = "✓";
                        labelColor = rgb(100, 200, 100);
                    } else {
                        label = "?";
                        labelColor = rgb(100, 255, 150);
                    }
                }
                
                const doorTxt = add([
                    text(label, { size: 16 }), 
                    pos(doorX + textOffsetX, doorY + textOffsetY), 
                    anchor("center"), 
                    color(labelColor), 
                    z(10),
                    { targetRoomId: targetRoom.id }
                ]);
                doorTexts.push(doorTxt);
            });
            
            // Room type indicator
            const isBossRoom = currentRoom.type === ROOM_TYPES.BOSS;
            roomIndicator = null;

            // Create player (spawn in center of map)
            const p = createPlayer();
            p.pos = vec2(CONFIG.MAP_WIDTH / 2, CONFIG.MAP_HEIGHT / 2);
            setupPlayerMovement(p);
            
            // Initialize camera to player position
            const halfViewW = CONFIG.VIEWPORT_WIDTH / 2;
            const halfViewH = CONFIG.VIEWPORT_HEIGHT / 2;
            let camX = Math.max(halfViewW, Math.min(p.pos.x, CONFIG.MAP_WIDTH - halfViewW));
            let camY = Math.max(halfViewH, Math.min(p.pos.y, CONFIG.MAP_HEIGHT - halfViewH));
            camPos(camX, camY);

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

            onCollide("player", "door", (pl, doorObj) => {
                try {
                    if (!GS.doorOpen || !currentRoom.cleared) {
                        return; // Door is locked
                    }
                    
                    const targetRoomId = doorObj.targetRoomId;
                    if (targetRoomId === undefined) return;
                    
                    const targetRoom = dungeon.getRoom(targetRoomId);
                    if (!targetRoom) return;
                    
                    Logger.debug('Going through door', { 
                        from: currentRoom.id, 
                        to: targetRoomId,
                        targetType: targetRoom.type 
                    });
                    playSound('levelup');
                    
                    // Enter the new room
                    dungeon.enterRoom(targetRoomId);
                    GS.currentRoom = targetRoomId;
                    
                    // Check if entering boss room and boss is defeated
                    if (targetRoom.type === ROOM_TYPES.BOSS && targetRoom.cleared) {
                        // Level complete!
                        if (GS.currentLevel >= CONFIG.MAX_LEVELS) {
                            Logger.info('Victory! All levels complete');
                            go("victory");
                        } else {
                            // Go to shop, then next level
                            GS.currentLevel++;
                            GS.currentRoom = 0;
                            GS.dungeon = null; // Generate new dungeon for next level
                            GS.resetLevel();
                            Logger.info('Level complete, going to shop', { newLevel: GS.currentLevel });
                            go("shop");
                        }
                        return;
                    }
                    
                    // Go to the target room
                    GS.resetRoom();
                    Logger.info('Going to room', { roomId: targetRoomId, type: targetRoom.type });
                    go("game"); // Reload scene with new room
                    
                } catch (error) {
                    Logger.error('Door collision error', { error: error.message, stack: error.stack });
                }
            });

            // Spawn enemies based on room type
            const roomType = currentRoom.type;
            
            if (roomType === ROOM_TYPES.BOSS) {
                // Boss room - spawn boss after intro
                Logger.info('Boss room - spawning boss');
                GS.bossSpawned = false;
                wait(1, () => {
                    GS.bossSpawned = true;
                    spawnBoss();
                });
            } else if (roomType === ROOM_TYPES.TREASURE) {
                // Treasure room - no enemies, just rewards
                Logger.info('Treasure room - no enemies');
                GS.roomCleared = true;
                GS.doorOpen = true;
                currentRoom.cleared = true;
                
                // Spawn some gold pickups
                for (let i = 0; i < 5; i++) {
                    const gx = rand(150, CONFIG.MAP_WIDTH - 150);
                    const gy = rand(150, CONFIG.MAP_HEIGHT - 150);
                    const goldAmount = 20 + GS.currentLevel * 10;
                    
                    const goldPickup = add([
                        text("💰", { size: 24 }),
                        pos(gx, gy),
                        anchor("center"),
                        area({ shape: new Rect(vec2(-12, -12), 24, 24) }),
                        z(5),
                        { goldValue: goldAmount, t: rand(0, 6.28) },
                        "goldPickup"
                    ]);
                    goldPickup.onUpdate(() => {
                        goldPickup.t += dt() * 3;
                        goldPickup.pos.y += Math.sin(goldPickup.t) * 0.3;
                    });
                }
            } else if (roomType === ROOM_TYPES.START && currentRoom.cleared) {
                // Start room already cleared
                Logger.info('Start room - already cleared');
            } else if (!currentRoom.cleared) {
                // Combat/Elite room - spawn enemies
                const enemyCount = GS.roomEnemyCount;
                Logger.info('Spawning enemies', { count: enemyCount, type: roomType });
                
                // Spawn 4-5 enemies initially
                const initialSpawn = Math.min(5, enemyCount);
                for (let i = 0; i < initialSpawn; i++) {
                    wait(i * 0.4, spawnRandomEnemy);
                }
            }
            
            // Gold pickup collision
            onCollide("player", "goldPickup", (pl, gold) => {
                const amount = GS.addGold(gold.goldValue);
                playSound('key');
                
                // Gold pickup effect
                const fx = add([
                    text(`+${amount}💰`, { size: 14 }),
                    pos(gold.pos.x, gold.pos.y - 10),
                    anchor("center"), color(255, 220, 100), z(100), { t: 0 }
                ]);
                fx.onUpdate(() => {
                    fx.t += dt();
                    fx.pos.y -= 40 * dt();
                    fx.opacity = 1 - fx.t;
                    if (fx.t > 1) destroy(fx);
                });
                
                destroy(gold);
            });

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
