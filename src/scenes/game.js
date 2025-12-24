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

// Generate irregular room shape - SIMPLIFIED for guaranteed door access
function generateRoomShape(seed) {
    // Use seed for consistent room shapes
    const rng = () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return seed / 0x7fffffff;
    };
    
    // Room grid (1 = walkable, 0 = wall)
    const gridW = Math.floor(CONFIG.MAP_WIDTH / 40);
    const gridH = Math.floor(CONFIG.MAP_HEIGHT / 40);
    const grid = [];
    
    const centerX = Math.floor(gridW / 2);
    const centerY = Math.floor(gridH / 2);
    const margin = 2; // Outer wall margin
    
    // Start with ALL walkable floor (safer approach)
    for (let y = 0; y < gridH; y++) {
        grid[y] = [];
        for (let x = 0; x < gridW; x++) {
            // Create walkable area with outer walls
            if (x < margin || x >= gridW - margin || y < margin || y >= gridH - margin) {
                grid[y][x] = 0; // Outer walls
            } else {
                grid[y][x] = 1; // Walkable floor
            }
        }
    }
    
    // Choose room shape type - add wall features INSIDE the room
    const shapeType = Math.floor(rng() * 5);
    
    // Carve interesting wall shapes into corners (not blocking paths to doors)
    switch (shapeType) {
        case 0: // Corner pillars
            // Top-left corner block
            for (let x = margin; x < margin + 4; x++) {
                for (let y = margin; y < margin + 4; y++) {
                    grid[y][x] = 0;
                }
            }
            // Top-right corner block
            for (let x = gridW - margin - 4; x < gridW - margin; x++) {
                for (let y = margin; y < margin + 4; y++) {
                    grid[y][x] = 0;
                }
            }
            // Bottom-left corner block
            for (let x = margin; x < margin + 4; x++) {
                for (let y = gridH - margin - 4; y < gridH - margin; y++) {
                    grid[y][x] = 0;
                }
            }
            // Bottom-right corner block
            for (let x = gridW - margin - 4; x < gridW - margin; x++) {
                for (let y = gridH - margin - 4; y < gridH - margin; y++) {
                    grid[y][x] = 0;
                }
            }
            break;
            
        case 1: // Side alcoves (top and bottom)
            // Top alcoves (left and right of center)
            for (let x = margin + 2; x < centerX - 4; x++) {
                for (let y = margin; y < margin + 3; y++) {
                    grid[y][x] = 0;
                }
            }
            for (let x = centerX + 4; x < gridW - margin - 2; x++) {
                for (let y = margin; y < margin + 3; y++) {
                    grid[y][x] = 0;
                }
            }
            // Bottom alcoves
            for (let x = margin + 2; x < centerX - 4; x++) {
                for (let y = gridH - margin - 3; y < gridH - margin; y++) {
                    grid[y][x] = 0;
                }
            }
            for (let x = centerX + 4; x < gridW - margin - 2; x++) {
                for (let y = gridH - margin - 3; y < gridH - margin; y++) {
                    grid[y][x] = 0;
                }
            }
            break;
            
        case 2: // Side alcoves (left and right)
            // Left alcoves
            for (let y = margin + 2; y < centerY - 3; y++) {
                for (let x = margin; x < margin + 3; x++) {
                    grid[y][x] = 0;
                }
            }
            for (let y = centerY + 3; y < gridH - margin - 2; y++) {
                for (let x = margin; x < margin + 3; x++) {
                    grid[y][x] = 0;
                }
            }
            // Right alcoves
            for (let y = margin + 2; y < centerY - 3; y++) {
                for (let x = gridW - margin - 3; x < gridW - margin; x++) {
                    grid[y][x] = 0;
                }
            }
            for (let y = centerY + 3; y < gridH - margin - 2; y++) {
                for (let x = gridW - margin - 3; x < gridW - margin; x++) {
                    grid[y][x] = 0;
                }
            }
            break;
            
        case 3: // Central obstacle ring
            // Create obstacles around center but not blocking center itself
            const ringDist = 6;
            for (let angle = 0; angle < 4; angle++) {
                const ox = centerX + Math.round(Math.cos(angle * Math.PI / 2) * ringDist);
                const oy = centerY + Math.round(Math.sin(angle * Math.PI / 2) * ringDist);
                // Small 2x2 obstacle
                for (let dx = 0; dx < 2; dx++) {
                    for (let dy = 0; dy < 2; dy++) {
                        const nx = ox + dx;
                        const ny = oy + dy;
                        if (nx > margin + 2 && nx < gridW - margin - 2 && ny > margin + 2 && ny < gridH - margin - 2) {
                            grid[ny][nx] = 2; // Pillar
                        }
                    }
                }
            }
            break;
            
        default: // Simple room with scattered pillars
            break;
    }
    
    // Add a few random pillars (avoiding paths to doors)
    const corridorWidth = 5; // Keep clear corridor to doors
    const numPillars = 1 + Math.floor(rng() * 3);
    const pillars = [];
    
    for (let i = 0; i < numPillars; i++) {
        // Random position away from center and door paths
        let px, py;
        let attempts = 0;
        do {
            px = margin + 4 + Math.floor(rng() * (gridW - margin * 2 - 8));
            py = margin + 4 + Math.floor(rng() * (gridH - margin * 2 - 8));
            attempts++;
        } while (attempts < 10 && (
            // Avoid center spawn area
            (Math.abs(px - centerX) < 5 && Math.abs(py - centerY) < 5) ||
            // Avoid horizontal corridor (to left/right doors)
            (Math.abs(py - centerY) < corridorWidth) ||
            // Avoid vertical corridor (to top/bottom doors)
            (Math.abs(px - centerX) < corridorWidth)
        ));
        
        if (attempts >= 10) continue;
        
        // Pillar size 2x2 or 3x3
        const pillarSize = 2 + Math.floor(rng() * 2);
        for (let dx = 0; dx < pillarSize; dx++) {
            for (let dy = 0; dy < pillarSize; dy++) {
                const nx = px + dx;
                const ny = py + dy;
                if (nx > margin && nx < gridW - margin && ny > margin && ny < gridH - margin) {
                    grid[ny][nx] = 2; // 2 = pillar
                }
            }
        }
        pillars.push({ x: px, y: py, size: pillarSize });
    }
    
    return {
        grid,
        width: gridW,
        height: gridH,
        offsetX: 0,
        offsetY: 0,
        pillars,
        centerX: centerX * 40 + 20,
        centerY: centerY * 40 + 20,
    };
}

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

            // Generate room shape (irregular)
            const roomShape = generateRoomShape(currentRoom.id + GS.currentLevel);
            const wc = [60 + lv * 10, 60, 100];
            
            // ========== OPTIMIZATION: Batch render floor as single canvas ==========
            const floorCanvas = document.createElement('canvas');
            floorCanvas.width = CONFIG.MAP_WIDTH;
            floorCanvas.height = CONFIG.MAP_HEIGHT;
            const fctx = floorCanvas.getContext('2d');
            
            // Dark void background
            fctx.fillStyle = `rgb(5, 5, 10)`;
            fctx.fillRect(0, 0, CONFIG.MAP_WIDTH, CONFIG.MAP_HEIGHT);
            
            // Seeded random for consistent floor patterns
            let floorSeed = currentRoom.id * 1000 + GS.currentLevel;
            const floorRng = () => {
                floorSeed = (floorSeed * 1103515245 + 12345) & 0x7fffffff;
                return floorSeed / 0x7fffffff;
            };
            
            // Draw all tiles to canvas at once
            for (let gx = 0; gx < roomShape.width; gx++) {
                for (let gy = 0; gy < roomShape.height; gy++) {
                    const tileX = roomShape.offsetX + gx * 40;
                    const tileY = roomShape.offsetY + gy * 40;
                    const tileType = roomShape.grid[gy][gx];
                    
                    if (tileType === 1) {
                        // Walkable floor tile
                        const tileShade = 0.85 + floorRng() * 0.25;
                        const r = Math.floor(bg[0] * tileShade);
                        const g = Math.floor(bg[1] * tileShade);
                        const b = Math.floor(bg[2] * tileShade);
                        fctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                        fctx.fillRect(tileX, tileY, 40, 40);
                        
                        // Grid lines (subtle)
                        fctx.strokeStyle = `rgba(${bg[0] + 20}, ${bg[1] + 20}, ${bg[2] + 30}, 0.15)`;
                        fctx.lineWidth = 1;
                        fctx.strokeRect(tileX, tileY, 40, 40);
                        
                        // Random cracks (reduced frequency)
                        if (floorRng() < 0.04) {
                            fctx.strokeStyle = `rgba(0, 0, 0, 0.3)`;
                            fctx.beginPath();
                            fctx.moveTo(tileX + 5, tileY + 10);
                            fctx.lineTo(tileX + 20, tileY + 25);
                            fctx.lineTo(tileX + 35, tileY + 20);
                            fctx.stroke();
                        }
                    } else if (tileType === 2) {
                        // Pillar - draw visually
                        fctx.fillStyle = `rgb(${50 + lv * 5}, ${45 + lv * 3}, ${60 + lv * 4})`;
                        fctx.fillRect(tileX, tileY, 40, 40);
                        fctx.fillStyle = `rgb(${70 + lv * 5}, ${65 + lv * 3}, ${85 + lv * 4})`;
                        fctx.fillRect(tileX + 2, tileY + 2, 36, 36);
                        // Shadow
                        fctx.fillStyle = `rgba(20, 20, 30, 0.4)`;
                        fctx.fillRect(tileX, tileY + 32, 40, 8);
                    } else {
                        // Wall tile
                        const grad = fctx.createLinearGradient(tileX, tileY, tileX, tileY + 40);
                        grad.addColorStop(0, '#4a4a6a');
                        grad.addColorStop(1, '#3a3a5a');
                        fctx.fillStyle = grad;
                        fctx.fillRect(tileX, tileY, 40, 40);
                        fctx.strokeStyle = '#2a2a4a';
                        fctx.lineWidth = 2;
                        fctx.strokeRect(tileX, tileY, 40, 20);
                        fctx.strokeRect(tileX, tileY + 20, 40, 20);
                    }
                }
            }
            
            // Load the batched floor as a single sprite
            const floorSpriteName = `floor_${GS.currentLevel}_${currentRoom.id}`;
            loadSprite(floorSpriteName, floorCanvas.toDataURL());
            
            // Add floor as single object (instead of 1000+ individual tiles)
            add([sprite(floorSpriteName), pos(0, 0), z(-100)]);
            
            // Add collision for walls and pillars only (required for physics)
            for (let gx = 0; gx < roomShape.width; gx++) {
                for (let gy = 0; gy < roomShape.height; gy++) {
                    const tileX = roomShape.offsetX + gx * 40;
                    const tileY = roomShape.offsetY + gy * 40;
                    const tileType = roomShape.grid[gy][gx];
                    
                    if (tileType === 0 || tileType === 2) {
                        // Wall or pillar - add collision only
                        add([
                            rect(40, 40), pos(tileX, tileY),
                            area(), body({ isStatic: true }), opacity(0), 
                            tileType === 2 ? "pillar" : "wall"
                        ]);
                    }
                }
            }
            
            // Outer boundary walls (invisible collision)
            add([rect(CONFIG.MAP_WIDTH, 40), pos(0, 0), area(), body({ isStatic: true }), opacity(0), "wall"]);
            add([rect(CONFIG.MAP_WIDTH, 40), pos(0, CONFIG.MAP_HEIGHT - 40), area(), body({ isStatic: true }), opacity(0), "wall"]);
            add([rect(40, CONFIG.MAP_HEIGHT), pos(0, 0), area(), body({ isStatic: true }), opacity(0), "wall"]);
            add([rect(40, CONFIG.MAP_HEIGHT), pos(CONFIG.MAP_WIDTH - 40, 0), area(), body({ isStatic: true }), opacity(0), "wall"]);

            // ========== OPTIMIZATION: Reduced decorations, batched torch updates ==========
            // Torches (reduced to 4, shared update timer)
            const torches = [];
            const torchPositions = [
                [roomShape.centerX - 200, roomShape.centerY - 150],
                [roomShape.centerX + 200, roomShape.centerY + 150],
            ];
            torchPositions.forEach(([tx, ty]) => {
                if (tx < 60 || tx > CONFIG.MAP_WIDTH - 60 || ty < 60 || ty > CONFIG.MAP_HEIGHT - 60) return;
                const torch = add([sprite("torch"), pos(tx, ty), z(1), scale(1)]);
                const glow = add([circle(25), pos(tx + 8, ty + 8), color(255, 150, 50), opacity(0.12), anchor("center"), z(0)]);
                torches.push({ torch, glow });
            });
            
            // Single batched update for all torches (instead of individual onUpdate per torch)
            let torchTimer = 0;
            onUpdate(() => {
                torchTimer += dt();
                if (torchTimer < 0.1) return; // Update 10 times/sec instead of 60
                torchTimer = 0;
                const t = time();
                torches.forEach(({ torch, glow }) => {
                    if (torch.exists()) torch.scale = vec2(1 + Math.sin(t * 15) * 0.1, 1 + Math.cos(t * 12) * 0.15);
                    if (glow.exists()) {
                        glow.opacity = 0.1 + Math.sin(t * 8) * 0.05;
                        glow.scale = vec2(1 + Math.sin(t * 6) * 0.2);
                    }
                });
            });

            // Cobwebs (static, no updates)
            add([sprite("cobweb"), pos(120, 120), z(1), opacity(0.5)]);

            // Wall decorations (reduced count)
            const decorCount = Math.min(3, 2 + Math.floor(lv / 2));
            for (let i = 0; i < decorCount; i++) {
                const side = i % 4;
                let dx, dy;
                if (side === 0) { dx = 150 + i * 200; dy = 90; }
                else if (side === 1) { dx = 150 + i * 200; dy = CONFIG.MAP_HEIGHT - 90; }
                else if (side === 2) { dx = 90; dy = 150 + i * 200; }
                else { dx = CONFIG.MAP_WIDTH - 90; dy = 150 + i * 200; }
                
                add([sprite("skull"), pos(dx, dy), z(1), opacity(0.6)]);
            }

            // Obstacles (reduced count, no shadows)
            const obstacleCount = Math.min(4, 2 + roomNum);
            for (let i = 0; i < obstacleCount; i++) {
                const ox = 150 + (i % 3) * 300 + rand(-50, 50);
                const oy = 200 + Math.floor(i / 3) * 300 + rand(-50, 50);
                add([
                    sprite("crate"), pos(ox, oy),
                    area({ shape: new Rect(vec2(-12, -12), 24, 24) }),
                    body({ isStatic: true }), anchor("center"), z(3), "obstacle"
                ]);
            }

            // Create doors based on dungeon connections
            doors = [];
            doorTexts = [];
            const adjacentRooms = dungeon.getAdjacentRooms();
            
            adjacentRooms.forEach(({ room: targetRoom, direction, canEnter }) => {
                let doorX, doorY, textOffsetX = 0, textOffsetY = -40;
                
                // Check if boss room requires all other rooms cleared
                const isBossDoor = targetRoom.type === ROOM_TYPES.BOSS;
                const allRoomsCleared = dungeon.map.rooms
                    .filter(r => r.type !== ROOM_TYPES.BOSS)
                    .every(r => r.cleared);
                const bossAccessible = !isBossDoor || allRoomsCleared;
                
                // Position door inside walkable area (margin = 2 tiles = 80px, so door at 100px)
                const doorOffset = 100; // Inside the walkable floor
                switch (direction) {
                    case 'right':
                        doorX = CONFIG.MAP_WIDTH - doorOffset;
                        doorY = CONFIG.MAP_HEIGHT / 2;
                        break;
                    case 'left':
                        doorX = doorOffset;
                        doorY = CONFIG.MAP_HEIGHT / 2;
                        break;
                    case 'up':
                        doorX = CONFIG.MAP_WIDTH / 2;
                        doorY = doorOffset;
                        textOffsetY = 45;
                        break;
                    case 'down':
                        doorX = CONFIG.MAP_WIDTH / 2;
                        doorY = CONFIG.MAP_HEIGHT - doorOffset;
                        textOffsetY = -40;
                        break;
                    default:
                        doorX = CONFIG.MAP_WIDTH - doorOffset;
                        doorY = CONFIG.MAP_HEIGHT / 2;
                }
                
                // Door sprite - only open if room is cleared and (not boss or all rooms cleared)
                const canOpenDoor = currentRoom.cleared && bossAccessible;
                const doorSprite = canOpenDoor ? "doorOpen" : "doorClosed";
                const door = add([
                    sprite(doorSprite), 
                    pos(doorX, doorY), 
                    anchor("center"), 
                    area({ shape: new Rect(vec2(-24, -36), 48, 72) }), // Larger hitbox
                    z(2), 
                    scale(1.2), // Slightly larger door
                    { targetRoomId: targetRoom.id, direction, isBossDoor, bossAccessible },
                    "door"
                ]);
                doors.push(door);
                
                // Door label - show room type with larger text
                let label = "🔒";
                let labelColor = rgb(255, 100, 100);
                
                if (currentRoom.cleared) {
                    if (isBossDoor) {
                        if (allRoomsCleared) {
                            label = "💀 BOSS";
                            labelColor = rgb(255, 50, 50);
                        } else {
                            // Show how many rooms left
                            const roomsLeft = dungeon.map.rooms
                                .filter(r => r.type !== ROOM_TYPES.BOSS && !r.cleared).length;
                            label = `🔒 ${roomsLeft}`;
                            labelColor = rgb(255, 100, 100);
                        }
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
                    text(label, { size: 18, font: "sink" }), 
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

            // Create player (spawn in room center)
            const p = createPlayer();
            p.pos = vec2(roomShape.centerX, roomShape.centerY);
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
                    
                    // Check boss door access - need to clear all other rooms first
                    if (doorObj.isBossDoor && !doorObj.bossAccessible) {
                        const roomsLeft = dungeon.map.rooms
                            .filter(r => r.type !== ROOM_TYPES.BOSS && !r.cleared).length;
                        // Show message
                        const msg = add([
                            text(`Clear ${roomsLeft} more room${roomsLeft > 1 ? 's' : ''} first!`, { size: 20 }),
                            pos(width() / 2, height() / 2 - 50),
                            anchor("center"),
                            color(255, 100, 100),
                            fixed(),
                            z(1000),
                            lifespan(2),
                            opacity(1),
                        ]);
                        msg.onUpdate(() => {
                            msg.opacity = Math.max(0, msg.opacity - dt() * 0.5);
                        });
                        return;
                    }
                    
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
