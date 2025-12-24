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
import { spawnRandomEnemy, spawnBoss, spawnEnemy } from '../entities/enemies.js';
import { getLevel } from '../data/levels.js';
import { meleeAttack, rangedAttack } from '../attacks.js';
import { setupUltimate, tryUseUltimate, updateUltimate } from '../ultimate.js';
import { createHUD } from '../ui.js';
import { Logger } from '../logger.js';
import { DungeonManager, ROOM_TYPES } from '../data/rooms.js';
import { ENEMY_TYPES } from '../data/enemies.js';

let doors = [];  // Multiple doors now
let doorTexts = [];
let roomIndicator;

// Export room shape to global state for walkable checks
GS.roomShape = null;
let currentRoomShape = null; // Store room shape for walkable checks

// ==================== ENTER THE GUNGEON STYLE ROOM GENERATION ====================
// Creates interesting rooms with narrow corridors, cover, and varied layouts

function generateRoomShape(seed) {
    const perfStart = performance.now();
    
    const rng = () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return seed / 0x7fffffff;
    };
    
    const gridW = Math.floor(CONFIG.MAP_WIDTH / 40);
    const gridH = Math.floor(CONFIG.MAP_HEIGHT / 40);
    const grid = [];
    
    const centerX = Math.floor(gridW / 2);
    const centerY = Math.floor(gridH / 2);
    
    // Initialize with ALL walls
    for (let y = 0; y < gridH; y++) {
        grid[y] = [];
        for (let x = 0; x < gridW; x++) {
            grid[y][x] = 0;
        }
    }
    
    // Room type selection (Enter the Gungeon inspired)
    const roomType = Math.floor(rng() * 8);
    const pillars = [];
    
    // Helper: carve rectangular area
    const carveRect = (x1, y1, x2, y2, type = 1) => {
        for (let y = Math.max(1, y1); y < Math.min(gridH - 1, y2); y++) {
            for (let x = Math.max(1, x1); x < Math.min(gridW - 1, x2); x++) {
                grid[y][x] = type;
            }
        }
    };
    
    // Helper: carve corridor
    const carveCorridor = (x1, y1, x2, y2, width = 3) => {
        const hw = Math.floor(width / 2);
        if (x1 === x2) { // Vertical
            for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
                for (let dx = -hw; dx <= hw; dx++) {
                    if (x1 + dx > 0 && x1 + dx < gridW - 1 && y > 0 && y < gridH - 1) {
                        grid[y][x1 + dx] = 1;
                    }
                }
            }
        } else { // Horizontal
            for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
                for (let dy = -hw; dy <= hw; dy++) {
                    if (y1 + dy > 0 && y1 + dy < gridH - 1 && x > 0 && x < gridW - 1) {
                        grid[y1 + dy][x] = 1;
                    }
                }
            }
        }
    };
    
    // Helper: add pillar
    const addPillar = (px, py, size = 2) => {
        for (let dy = 0; dy < size; dy++) {
            for (let dx = 0; dx < size; dx++) {
                if (py + dy > 1 && py + dy < gridH - 2 && px + dx > 1 && px + dx < gridW - 2) {
                    grid[py + dy][px + dx] = 2;
                }
            }
        }
        pillars.push({ x: px, y: py, size });
    };
    
    switch (roomType) {
        case 0: // Arena with narrow entrances
            // Central fighting arena
            carveRect(centerX - 8, centerY - 6, centerX + 8, centerY + 6);
            // Narrow corridors to doors (width 3)
            carveCorridor(1, centerY, centerX - 8, centerY, 3); // Left
            carveCorridor(centerX + 8, centerY, gridW - 2, centerY, 3); // Right
            carveCorridor(centerX, 1, centerX, centerY - 6, 3); // Top
            carveCorridor(centerX, centerY + 6, centerX, gridH - 2, 3); // Bottom
            // Cover pillars
            addPillar(centerX - 5, centerY - 3, 2);
            addPillar(centerX + 3, centerY - 3, 2);
            addPillar(centerX - 5, centerY + 1, 2);
            addPillar(centerX + 3, centerY + 1, 2);
            break;
            
        case 1: // Cross room with wide halls
            // Vertical corridor
            carveRect(centerX - 4, 2, centerX + 4, gridH - 2);
            // Horizontal corridor
            carveRect(2, centerY - 3, gridW - 2, centerY + 3);
            // Corner rooms
            carveRect(3, 3, centerX - 5, centerY - 4);
            carveRect(centerX + 5, 3, gridW - 3, centerY - 4);
            carveRect(3, centerY + 4, centerX - 5, gridH - 3);
            carveRect(centerX + 5, centerY + 4, gridW - 3, gridH - 3);
            break;
            
        case 2: // L-shaped with cover
            // Main L shape
            carveRect(2, 2, centerX + 6, centerY + 4);
            carveRect(centerX - 4, centerY - 2, gridW - 2, gridH - 2);
            // Corridors to all doors
            carveCorridor(1, centerY, gridW - 2, centerY, 3);
            carveCorridor(centerX, 1, centerX, gridH - 2, 3);
            // Cover spots
            addPillar(8, 6, 2);
            addPillar(gridW - 10, gridH - 8, 2);
            addPillar(centerX, centerY, 3);
            break;
            
        case 3: // Maze-like with multiple paths
            // Create base corridors
            carveRect(2, centerY - 2, gridW - 2, centerY + 2); // Main horizontal
            carveRect(centerX - 2, 2, centerX + 2, gridH - 2); // Main vertical
            // Side passages
            carveRect(6, 3, 10, centerY - 2);
            carveRect(gridW - 10, centerY + 2, gridW - 6, gridH - 3);
            carveRect(3, gridH - 8, centerX - 3, gridH - 4);
            carveRect(centerX + 3, 4, gridW - 3, 8);
            // Random cover
            if (rng() > 0.3) addPillar(4, centerY - 1, 2);
            if (rng() > 0.3) addPillar(gridW - 6, centerY - 1, 2);
            break;
            
        case 4: // Circular arena
            // Create rough circle
            const radius = Math.min(gridW, gridH) / 2 - 4;
            for (let y = 2; y < gridH - 2; y++) {
                for (let x = 2; x < gridW - 2; x++) {
                    const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                    if (dist < radius) {
                        grid[y][x] = 1;
                    }
                }
            }
            // Corridors to edges
            carveCorridor(1, centerY, centerX - radius, centerY, 3);
            carveCorridor(centerX + radius, centerY, gridW - 2, centerY, 3);
            carveCorridor(centerX, 1, centerX, centerY - radius, 3);
            carveCorridor(centerX, centerY + radius, centerX, gridH - 2, 3);
            // Center obstacle
            addPillar(centerX - 1, centerY - 1, 3);
            break;
            
        case 5: // Symmetrical battle arena
            // Four quadrant rooms connected by corridors
            carveRect(3, 3, centerX - 3, centerY - 3);
            carveRect(centerX + 3, 3, gridW - 3, centerY - 3);
            carveRect(3, centerY + 3, centerX - 3, gridH - 3);
            carveRect(centerX + 3, centerY + 3, gridW - 3, gridH - 3);
            // Connecting corridors
            carveCorridor(centerX - 3, centerY - 6, centerX + 3, centerY - 6, 2);
            carveCorridor(centerX - 3, centerY + 6, centerX + 3, centerY + 6, 2);
            carveCorridor(centerX - 6, centerY - 3, centerX - 6, centerY + 3, 2);
            carveCorridor(centerX + 6, centerY - 3, centerX + 6, centerY + 3, 2);
            // Door corridors
            carveCorridor(1, centerY, gridW - 2, centerY, 3);
            carveCorridor(centerX, 1, centerX, gridH - 2, 3);
            break;
            
        case 6: // Complex labyrinth with multiple levels
            // Create multi-level maze structure
            // Level 1: Top area
            carveRect(3, 3, gridW - 3, centerY - 8);
            // Level 2: Middle maze
            carveCorridor(3, centerY - 6, centerX - 4, centerY - 6, 2);
            carveCorridor(centerX + 4, centerY - 6, gridW - 3, centerY - 6, 2);
            carveCorridor(centerX - 4, centerY - 6, centerX - 4, centerY + 6, 2);
            carveCorridor(centerX + 4, centerY - 6, centerX + 4, centerY + 6, 2);
            carveCorridor(3, centerY + 6, centerX - 4, centerY + 6, 2);
            carveCorridor(centerX + 4, centerY + 6, gridW - 3, centerY + 6, 2);
            // Level 3: Bottom area
            carveRect(3, centerY + 8, gridW - 3, gridH - 3);
            
            // Vertical connections
            carveCorridor(centerX - 4, centerY - 4, centerX - 4, centerY + 4, 2);
            carveCorridor(centerX + 4, centerY - 4, centerX + 4, centerY + 4, 2);
            carveCorridor(8, centerY, 8, centerY + 2, 2);
            carveCorridor(gridW - 8, centerY, gridW - 8, centerY + 2, 2);
            
            // Strategic obstacles
            addPillar(centerX - 2, centerY - 2, 2);
            addPillar(centerX + 2, centerY + 2, 2);
            break;
            
        default: // Classic room with scattered cover
            // Large open room
            carveRect(3, 3, gridW - 3, gridH - 3);
            // Random cover pillars
            const numCover = 4 + Math.floor(rng() * 4);
            for (let i = 0; i < numCover; i++) {
                const px = 5 + Math.floor(rng() * (gridW - 12));
                const py = 5 + Math.floor(rng() * (gridH - 12));
                // Don't block center or corridors
                if (Math.abs(px - centerX) > 3 && Math.abs(py - centerY) > 3) {
                    addPillar(px, py, 2);
                }
            }
            break;
    }
    
    // ALWAYS ensure corridors to all door positions
    const corridorW = 4;
    // Center spawn safe zone
    carveRect(centerX - 4, centerY - 4, centerX + 4, centerY + 4);
    // Left door corridor
    carveCorridor(1, centerY, centerX, centerY, corridorW);
    // Right door corridor
    carveCorridor(centerX, centerY, gridW - 2, centerY, corridorW);
    // Top door corridor
    carveCorridor(centerX, 1, centerX, centerY, corridorW);
    // Bottom door corridor
    carveCorridor(centerX, centerY, centerX, gridH - 2, corridorW);
    
    const perfTime = performance.now() - perfStart;
    if (perfTime > 10) {
        Logger.warn('Room shape generation slow', { time: perfTime.toFixed(2) + 'ms', gridW, gridH });
    }
    
    return {
        grid,
        width: gridW,
        height: gridH,
        offsetX: 0,
        offsetY: 0,
        pillars,
        roomType, // Store for minimap
        centerX: centerX * 40 + 20,
        centerY: centerY * 40 + 20,
    };
}

// Get room configuration with WEIGHT SYSTEM (d20)
function getRoomConfig() {
    const level = GS.currentLevel;
    const room = GS.currentRoom;
    const totalRooms = GS.totalRooms;
    const isBossRoom = room >= totalRooms - 1;
    
    // Weight system: d20 = 20 points total
    // Example: 1x4 (4 points), 2x3 (6 points), 10x1 (10 points) = 20 total
    // Each enemy type has a weight value
    const MAX_WEIGHT = 20; // d20 system
    const baseWeight = 10 + level * 2; // Base weight scales with level (Level 1: 12, Level 2: 14, etc.)
    const roomWeightBonus = room * 1; // Later rooms get more weight
    const totalWeight = Math.min(MAX_WEIGHT, baseWeight + roomWeightBonus);
    
    Logger.info('Room weight calculation', { 
        level, 
        room, 
        baseWeight, 
        roomWeightBonus, 
        totalWeight,
        maxWeight: MAX_WEIGHT 
    });
    
    let enemyCount = 0;
    if (isBossRoom) {
        enemyCount = 0; // Boss room - only boss spawns
    } else {
        // Use weight system to determine enemy composition
        enemyCount = totalWeight; // Will be distributed by weight
    }
    
    return {
        enemyCount,
        totalWeight,
        isBossRoom,
        roomNumber: room + 1,
        totalRooms,
    };
}

// Check if all keys collected (all non-boss, non-start rooms cleared)
function checkAllKeysCollected(dungeon) {
    if (!dungeon) return false;
    
    const allRooms = dungeon.map.rooms;
    const requiredRooms = allRooms.filter(r => 
        r.type !== ROOM_TYPES.BOSS && r.type !== ROOM_TYPES.START
    );
    
    // Check if all required rooms have their keys collected
    return requiredRooms.length > 0 && requiredRooms.every(room => GS.collectedKeys.includes(room.id));
}

// Distribute enemy weight across enemy types (d20 system)
// Returns object: { "slime": 10, "ranged_slime": 2, "tank_slime": 1 }
function distributeEnemyWeight(totalWeight, level) {
    if (!totalWeight || totalWeight <= 0) {
        Logger.warn('Invalid totalWeight', { totalWeight, level });
        return { "slime": 1 }; // Fallback
    }
    
    if (!level || level < 1) {
        Logger.warn('Invalid level', { level, totalWeight });
        level = 1; // Fallback
    }
    
    const distribution = {};
    let remainingWeight = totalWeight;
    
    // Available enemy types based on level
    const availableTypes = [];
    if (level >= 1) availableTypes.push("slime", "fast_slime", "ranged_slime");
    if (level >= 2) availableTypes.push("tank_slime");
    if (level >= 3) availableTypes.push("bomber_slime");
    
    if (availableTypes.length === 0) {
        Logger.warn('No available enemy types!', { level });
        availableTypes.push("slime"); // Fallback
    }
    
    // Weight distribution strategy:
    // - Common enemies (weight 1): 50-70% of weight
    // - Medium enemies (weight 2-3): 20-30% of weight
    // - Heavy enemies (weight 4): 10-20% of weight
    
    const commonWeight = Math.floor(remainingWeight * (0.5 + Math.random() * 0.2)); // 50-70%
    const mediumWeight = Math.floor(remainingWeight * (0.2 + Math.random() * 0.1)); // 20-30%
    const heavyWeight = remainingWeight - commonWeight - mediumWeight; // Rest
    
    Logger.debug('Weight distribution', { commonWeight, mediumWeight, heavyWeight, totalWeight });
    
    // Spawn common enemies (weight 1)
    const commonTypes = availableTypes.filter(t => {
        const enemyType = ENEMY_TYPES[t];
        return enemyType && enemyType.weight === 1;
    });
    if (commonTypes.length > 0 && commonWeight > 0) {
        const commonCount = commonWeight; // Each is 1 weight
        const type = commonTypes[Math.floor(Math.random() * commonTypes.length)];
        if (type && ENEMY_TYPES[type]) {
            distribution[type] = (distribution[type] || 0) + commonCount;
            remainingWeight -= commonCount;
        }
    }
    
    // Spawn medium enemies (weight 2-3)
    const mediumTypes = availableTypes.filter(t => {
        const enemyType = ENEMY_TYPES[t];
        const w = enemyType?.weight;
        return w && w >= 2 && w <= 3;
    });
    if (mediumTypes.length > 0 && mediumWeight > 0) {
        let mediumRemaining = mediumWeight;
        while (mediumRemaining > 0 && mediumTypes.length > 0) {
            const type = mediumTypes[Math.floor(Math.random() * mediumTypes.length)];
            const enemyType = ENEMY_TYPES[type];
            if (!enemyType) break;
            const weight = enemyType.weight;
            if (mediumRemaining >= weight) {
                distribution[type] = (distribution[type] || 0) + 1;
                mediumRemaining -= weight;
            } else {
                break;
            }
        }
        remainingWeight -= (mediumWeight - mediumRemaining);
    }
    
    // Spawn heavy enemies (weight 4+)
    const heavyTypes = availableTypes.filter(t => {
        const enemyType = ENEMY_TYPES[t];
        return enemyType && enemyType.weight >= 4;
    });
    if (heavyTypes.length > 0 && heavyWeight > 0) {
        let heavyRemaining = heavyWeight;
        while (heavyRemaining > 0 && heavyTypes.length > 0) {
            const type = heavyTypes[Math.floor(Math.random() * heavyTypes.length)];
            const enemyType = ENEMY_TYPES[type];
            if (!enemyType) break;
            const weight = enemyType.weight;
            if (heavyRemaining >= weight) {
                distribution[type] = (distribution[type] || 0) + 1;
                heavyRemaining -= weight;
            } else {
                break;
            }
        }
        remainingWeight -= (heavyWeight - heavyRemaining);
    }
    
    // Use remaining weight for more common enemies
    if (remainingWeight > 0 && commonTypes.length > 0) {
        const type = commonTypes[Math.floor(Math.random() * commonTypes.length)];
        if (type && ENEMY_TYPES[type]) {
            distribution[type] = (distribution[type] || 0) + remainingWeight;
        }
    }
    
    // Calculate actual total weight
    let actualWeight = 0;
    for (const [type, count] of Object.entries(distribution)) {
        const weight = ENEMY_TYPES[type]?.weight || 1;
        actualWeight += weight * count;
    }
    
    Logger.info('Enemy weight distribution complete', { 
        distribution, 
        totalWeight, 
        actualWeight,
        difference: totalWeight - actualWeight
    });
    
    return distribution;
}

// Spawn colored key for a specific room
function spawnKey(p, roomId, keyColor = null) {
    Logger.info('Spawning key at', { x: p.x, y: p.y, roomId, keyColor });
    
    // Key colors for different rooms (rainbow colors)
    const keyColors = [
        [255, 100, 100],  // Red
        [255, 200, 100],  // Orange
        [255, 255, 100],  // Yellow
        [100, 255, 100],  // Green
        [100, 200, 255],  // Blue
        [200, 100, 255],  // Purple
        [255, 100, 200],  // Pink
    ];
    
    const keyColorArray = keyColor || keyColors[roomId % keyColors.length];
    
    // Create key sprite with color
    const k = add([
        sprite("key"), pos(p), anchor("center"), area(), z(5), scale(1), 
        color(keyColorArray[0], keyColorArray[1], keyColorArray[2]), "key",
        { roomId, keyColor: keyColorArray } // Store room ID and color
    ]);
    
    // OPTIMIZED: Key animation with throttle (10/sec instead of 60)
    const startY = p.y;
    let keyAnimTimer = 0;
    k.onUpdate(() => {
        keyAnimTimer += dt();
        if (keyAnimTimer >= 0.1) {
            keyAnimTimer = 0;
        k.pos.y = startY + Math.sin(time() * 4) * 5;
        k.angle = Math.sin(time() * 2) * 10;
        }
    });
    
    // OPTIMIZED: Colored glow matching key color
    add([
        circle(25), pos(p), color(keyColorArray[0], keyColorArray[1], keyColorArray[2]), opacity(0.3), anchor("center"), z(4), "keyPart"
    ]);
}

// Called when all room enemies are killed
function onRoomCleared() {
    Logger.info('Room cleared!', { room: GS.currentRoom, level: GS.currentLevel });
    
    GS.roomCleared = true;
    
    // Mark room as cleared in dungeon
    const dungeon = GS.dungeon;
    if (dungeon) {
        dungeon.clearCurrentRoom();
    }
    
    const currentRoom = dungeon ? dungeon.getCurrentRoom() : null;
    
    // Spawn key in non-boss, non-start rooms (if not already collected)
    if (currentRoom && currentRoom.type !== ROOM_TYPES.BOSS && currentRoom.type !== ROOM_TYPES.START) {
        if (!GS.collectedKeys.includes(currentRoom.id)) {
            const p = GS.player;
            if (p && p.exists()) {
                wait(0.5, () => {
                    spawnKey(vec2(p.pos.x, p.pos.y - 60), currentRoom.id);
                });
            }
        }
    }
    
    // Check if all keys collected for boss door
    const allKeysCollected = checkAllKeysCollected(dungeon);
    
    // Update door visuals
    doors.forEach(door => {
    if (door && door.exists()) {
            const isBossDoor = door.targetRoomType === ROOM_TYPES.BOSS;
            const canOpen = isBossDoor ? allKeysCollected : GS.roomCleared;
            if (canOpen) {
        door.use(sprite("doorOpen"));
    }
        }
    });
    
    // Update door texts
    doorTexts.forEach(dt => {
        if (dt && dt.exists()) {
            if (dungeon) {
                const targetRoom = dungeon.getRoom(dt.targetRoomId);
                if (targetRoom) {
                    const isBossDoor = targetRoom.type === ROOM_TYPES.BOSS;
                    const allKeysCollected = checkAllKeysCollected(dungeon);
                    const canOpen = isBossDoor ? allKeysCollected : GS.roomCleared;
                    
                    if (targetRoom.type === ROOM_TYPES.BOSS) {
                        dt.text = canOpen ? "🚪" : "🔒";
                        dt.color = canOpen ? rgb(100, 255, 150) : rgb(255, 50, 50);
                    } else if (targetRoom.type === ROOM_TYPES.TREASURE) {
                        dt.text = "💎";
                        dt.color = rgb(255, 220, 100);
                    } else if (targetRoom.cleared) {
                        dt.text = "✓";
                        dt.color = rgb(100, 200, 100);
        } else {
                        dt.text = canOpen ? "→" : "🔒";
                        dt.color = canOpen ? rgb(100, 255, 150) : rgb(150, 150, 150);
        }
    }
            }
        }
    });
    
    GS.doorOpen = allKeysCollected || (currentRoom && currentRoom.type !== ROOM_TYPES.BOSS);
    
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
        if (!GS.dungeon) {
            GS.dungeon = new DungeonManager(GS.currentLevel);
            // Restore current room if we have saved state
            if (GS.currentRoom !== undefined && GS.currentRoom !== null) {
                const savedRoom = GS.dungeon.getRoom(GS.currentRoom);
                if (savedRoom) {
                    GS.dungeon.currentRoomId = GS.currentRoom;
                    savedRoom.visited = true;
                }
            }
        }
        
        const dungeon = GS.dungeon;
        
        if (!dungeon) {
            Logger.error('CRITICAL: No dungeon!', { currentLevel: GS.currentLevel });
            wait(1, () => go("start"));
            return;
        }
        
        const currentRoom = dungeon.getCurrentRoom();
        
        if (!currentRoom) {
            Logger.error('CRITICAL: No current room!', { 
                dungeon: !!dungeon,
                currentRoomId: dungeon?.currentRoomId,
                rooms: dungeon?.map?.rooms?.length
            });
            wait(1, () => go("start"));
            return;
        }
        
        // CRITICAL: Sync GS.currentRoom with dungeon.currentRoomId
        GS.currentRoom = dungeon.currentRoomId;
        GS.totalRooms = dungeon.map.rooms.length;
        
        Logger.info('=== GAME SCENE START ===', { 
            level: GS.currentLevel, 
            roomId: currentRoom.id,
            roomType: currentRoom.type,
            totalRooms: GS.totalRooms 
        });
        
        try {
            GS.enemies = [];
            GS.roomCleared = currentRoom.cleared || false;
            GS.roomEnemiesKilled = 0;
            GS.doorOpen = currentRoom.cleared || false;
            
            const roomConfig = getRoomConfig();
            // Override with dungeon room data
            GS.roomEnemyCount = currentRoom.enemies || roomConfig.enemyCount || 0;
            
            const lv = GS.currentLevel || 1;
            const roomNum = GS.currentRoom || 0;
            
            // Room-specific background colors (darker as you go deeper)
            const baseColors = [[26, 26, 46], [35, 25, 45], [45, 25, 30], [30, 30, 50], [40, 20, 35], [25, 35, 45], [50, 30, 40]];
            const baseBgIndex = Math.max(0, (lv - 1) % baseColors.length);
            const baseBg = baseColors[baseBgIndex];
            
            if (!baseBg || !Array.isArray(baseBg) || baseBg.length < 3) {
                Logger.error('CRITICAL: Invalid baseBg!', { baseBg, baseBgIndex, lv, baseColors });
                baseBg = [26, 26, 46]; // Fallback
            }
            
            // Darken based on room number
            const roomDarken = (roomNum || 0) * 5;
            const bg = [
                Math.max(10, (baseBg[0] || 26) - roomDarken),
                Math.max(10, (baseBg[1] || 26) - roomDarken),
                Math.max(10, (baseBg[2] || 46) - roomDarken)
            ];

            // ========== PERFORMANCE PROFILING ==========
            const perf = {
                roomShape: 0,
                floorCanvas: 0,
                floorDraw: 0,
                floorLoad: 0,
                collisions: 0,
                decorations: 0,
                total: 0
            };
            const perfStart = performance.now();
            
            // Generate room shape (irregular)
            let perfStep = performance.now();
            const roomShape = generateRoomShape(currentRoom.id + GS.currentLevel);
            GS.roomShape = roomShape; // Export to global state for walkable checks
            perf.roomShape = performance.now() - perfStep;
            
            const wc = [60 + lv * 10, 60, 100];
            
            // ========== FLOOR GENERATION ==========
            perfStep = performance.now();
            const floorCanvas = document.createElement('canvas');
            floorCanvas.width = CONFIG.MAP_WIDTH;
            floorCanvas.height = CONFIG.MAP_HEIGHT;
            const fctx = floorCanvas.getContext('2d');
            perf.floorCanvas = performance.now() - perfStep;
            
            // Dark void background
            fctx.fillStyle = `rgb(5, 5, 10)`;
            fctx.fillRect(0, 0, CONFIG.MAP_WIDTH, CONFIG.MAP_HEIGHT);
            
            // Seeded random for consistent floor patterns
            let floorSeed = currentRoom.id * 1000 + GS.currentLevel;
            const floorRng = () => {
                floorSeed = (floorSeed * 1103515245 + 12345) & 0x7fffffff;
                return floorSeed / 0x7fffffff;
            };
            
            // ULTRA-OPTIMIZED: Group tiles by type, use fewer operations
            perfStep = performance.now();
            
            // Pre-calculate colors (only 3 shades instead of random per tile)
            const floorShades = [
                [bg[0], bg[1], bg[2]],                    // Base
                [Math.floor(bg[0] * 0.9), Math.floor(bg[1] * 0.9), Math.floor(bg[2] * 0.9)],  // Dark
                [Math.floor(bg[0] * 1.1), Math.floor(bg[1] * 1.1), Math.floor(bg[2] * 1.1)],  // Light
            ];
            
            // Pre-create gradients (reuse instead of creating per tile)
            const wallGrad = fctx.createLinearGradient(0, 0, 0, 40);
            wallGrad.addColorStop(0, '#4a4a6a');
            wallGrad.addColorStop(1, '#3a3a5a');
            
            // Count tiles for profiling
            let floorTileCount = 0, pillarCount = 0, wallCount = 0;
            
            // Draw by type to minimize fillStyle changes
            // 1. Draw all floor tiles first (smooth, no grid lines)
            for (let gy = 0; gy < roomShape.height; gy++) {
                for (let gx = 0; gx < roomShape.width; gx++) {
                    if (roomShape.grid[gy][gx] === 1) {
                        const tileX = gx * 40;
                        const tileY = gy * 40;
                        // Use one of 3 shades (deterministic based on position) - smooth transitions
                        const shadeIdx = (gx + gy * 3) % 3;
                        fctx.fillStyle = `rgb(${floorShades[shadeIdx][0]}, ${floorShades[shadeIdx][1]}, ${floorShades[shadeIdx][2]})`;
                        fctx.fillRect(tileX, tileY, 40, 40);
                        floorTileCount++;
                    }
                }
            }
            
            // 2. Draw pillars (fewer operations)
            const pillarColor1 = `rgb(${50 + lv * 5}, ${45 + lv * 3}, ${60 + lv * 4})`;
            const pillarColor2 = `rgb(${70 + lv * 5}, ${65 + lv * 3}, ${85 + lv * 4})`;
            for (let gy = 0; gy < roomShape.height; gy++) {
                for (let gx = 0; gx < roomShape.width; gx++) {
                    if (roomShape.grid[gy][gx] === 2) {
                        const tileX = gx * 40;
                        const tileY = gy * 40;
                        fctx.fillStyle = pillarColor1;
                        fctx.fillRect(tileX, tileY, 40, 40);
                        fctx.fillStyle = pillarColor2;
                        fctx.fillRect(tileX + 2, tileY + 2, 36, 36);
                        pillarCount++;
                    }
                }
            }
            
            // 3. Draw walls (smooth, no lines)
            fctx.fillStyle = wallGrad;
            for (let gy = 0; gy < roomShape.height; gy++) {
                for (let gx = 0; gx < roomShape.width; gx++) {
                    if (roomShape.grid[gy][gx] === 0) {
                        const tileX = gx * 40;
                        const tileY = gy * 40;
                        // Smooth fill without lines
                        fctx.fillRect(tileX, tileY, 40, 40);
                        wallCount++;
                    }
                }
            }
            
            perf.floorDraw = performance.now() - perfStep;
            
            // ULTRA-OPTIMIZED: Lower JPEG quality for much faster encoding
            perfStep = performance.now();
            const floorSpriteName = `floor_${GS.currentLevel}_${currentRoom.id}`;
            try {
                // JPEG with 0.7 quality - 3-5x faster than 0.9, acceptable quality for floor
                // For 1600x1200 canvas: 0.9 JPEG ~40ms, 0.7 JPEG ~8-12ms
                loadSprite(floorSpriteName, floorCanvas.toDataURL('image/jpeg', 0.7));
                const floorObj = add([sprite(floorSpriteName), pos(0, 0), z(-100), "floor"]);
                perf.floorLoad = performance.now() - perfStep;
                Logger.info('Floor loaded (JPEG 0.7)', { 
                    sprite: floorSpriteName, 
                    roomId: currentRoom.id,
                    loadTime: perf.floorLoad.toFixed(2) + 'ms',
                    tiles: { floor: floorTileCount, pillars: pillarCount, walls: wallCount }
                });
            } catch (error) {
                perf.floorLoad = performance.now() - perfStep;
                Logger.error('Failed to load floor sprite, using fallback', { error: error.message });
                // Fallback: add simple background
                add([rect(CONFIG.MAP_WIDTH, CONFIG.MAP_HEIGHT), pos(0, 0), color(bg[0], bg[1], bg[2]), z(-100), "floor"]);
            }
            
            // OPTIMIZED: Group collision objects - merge adjacent walls/pillars
            perfStep = performance.now();
            
            // This reduces number of physics objects significantly
            const collisionMap = new Map(); // key: "x,y" -> {x, y, w, h, type}
            
            for (let gy = 0; gy < roomShape.height; gy++) {
                for (let gx = 0; gx < roomShape.width; gx++) {
                    const tileType = roomShape.grid[gy][gx];
                    if (tileType === 0 || tileType === 2) {
                        const tileX = gx * 40;
                        const tileY = gy * 40;
                        const key = `${gx},${gy}`;
                        collisionMap.set(key, { x: tileX, y: tileY, w: 40, h: 40, type: tileType });
                    }
                }
            }
            
            // FAST MERGING: Simple horizontal merge (one pass, optimized)
            const merged = [];
            const processed = new Set();
            
            for (const [key, box] of collisionMap) {
                if (processed.has(key)) continue;
                
                const [gx, gy] = key.split(',').map(Number);
                let width = 40;
                let currentGx = gx;
                
                // Merge consecutive horizontal tiles of same type
                while (true) {
                    const nextKey = `${currentGx + 1},${gy}`;
                    const nextBox = collisionMap.get(nextKey);
                    if (nextBox && nextBox.type === box.type && !processed.has(nextKey)) {
                        width += 40;
                        processed.add(nextKey);
                        currentGx++;
                    } else {
                        break;
                    }
                }
                
                merged.push({
                    x: box.x,
                    y: box.y,
                    w: width,
                    h: 40,
                    type: box.type
                });
                processed.add(key);
            }
            
            // Batch create physics objects
            let collisionCount = 0;
            for (const box of merged) {
                add([
                    rect(box.w, box.h), pos(box.x, box.y),
                    area(), body({ isStatic: true }), opacity(0), 
                    box.type === 2 ? "pillar" : "wall"
                ]);
                collisionCount++;
            }
            
            perf.collisions = performance.now() - perfStep;
            
            Logger.info('Collisions loaded', { 
                roomId: currentRoom.id, 
                total: collisionCount,
                original: collisionMap.size,
                time: perf.collisions.toFixed(2) + 'ms'
            });
            
            // Outer boundary walls (invisible collision)
            add([rect(CONFIG.MAP_WIDTH, 40), pos(0, 0), area(), body({ isStatic: true }), opacity(0), "wall"]);
            add([rect(CONFIG.MAP_WIDTH, 40), pos(0, CONFIG.MAP_HEIGHT - 40), area(), body({ isStatic: true }), opacity(0), "wall"]);
            add([rect(40, CONFIG.MAP_HEIGHT), pos(0, 0), area(), body({ isStatic: true }), opacity(0), "wall"]);
            add([rect(40, CONFIG.MAP_HEIGHT), pos(CONFIG.MAP_WIDTH - 40, 0), area(), body({ isStatic: true }), opacity(0), "wall"]);
            Logger.info('Collisions loaded', { roomId: currentRoom.id });

            // ========== Decorations (synchronous - fast enough) ==========
            perfStep = performance.now();
            
            // Torches (reduced to 2 max, static only)
            const torchPositions = [
                [roomShape.centerX - 200, roomShape.centerY - 150],
                [roomShape.centerX + 200, roomShape.centerY + 150],
            ];
            const torchCount = Math.min(2, 1 + Math.floor(lv / 4));
            for (let i = 0; i < torchCount; i++) {
                const [tx, ty] = torchPositions[i];
                if (tx < 60 || tx > CONFIG.MAP_WIDTH - 60 || ty < 60 || ty > CONFIG.MAP_HEIGHT - 60) continue;
                add([sprite("torch"), pos(tx, ty), z(1), scale(1), "torch"]);
                add([circle(25), pos(tx + 8, ty + 8), color(255, 150, 50), opacity(0.12), anchor("center"), z(0)]);
            }
            
            // Wall decorations (FURTHER REDUCED)
            const decorCount = Math.min(2, 1 + Math.floor(lv / 3));
            for (let i = 0; i < decorCount; i++) {
                const side = i % 4;
                let dx, dy;
                if (side === 0) { dx = 150 + i * 200; dy = 90; }
                else if (side === 1) { dx = 150 + i * 200; dy = CONFIG.MAP_HEIGHT - 90; }
                else if (side === 2) { dx = 90; dy = 150 + i * 200; }
                else { dx = CONFIG.MAP_WIDTH - 90; dy = 150 + i * 200; }
                
                add([sprite("skull"), pos(dx, dy), z(1), opacity(0.6), "decoration"]);
            }
            
            // Obstacles (FURTHER REDUCED - only 2-3 max)
            const obstacleCount = Math.min(3, 1 + Math.floor(roomNum / 2));
            for (let i = 0; i < obstacleCount; i++) {
                const ox = 150 + (i % 3) * 300 + rand(-50, 50);
                const oy = 200 + Math.floor(i / 3) * 300 + rand(-50, 50);
                add([
                    sprite("crate"), pos(ox, oy),
                    area({ shape: new Rect(vec2(-12, -12), 24, 24) }),
                    body({ isStatic: true }), anchor("center"), z(3), "obstacle"
                ]);
            }

            perf.decorations = performance.now() - perfStep;
            
            perf.total = performance.now() - perfStart;
            
            // ========== PERFORMANCE REPORT ==========
            const perfEntries = Object.entries(perf).filter(([k]) => k !== 'total');
            const sortedPerf = perfEntries.sort((a, b) => b[1] - a[1]);
            const bottleneck = sortedPerf[0];
            
            // Detailed console output
            console.log('%c=== PERFORMANCE PROFILE ===', 'color: #ff6b6b; font-size: 16px; font-weight: bold;');
            console.log(`Room ID: ${currentRoom.id}`);
            console.log(`1. Room Shape: ${perf.roomShape.toFixed(2)}ms`);
            console.log(`2. Floor Canvas: ${perf.floorCanvas.toFixed(2)}ms`);
            console.log(`3. Floor Draw: ${perf.floorDraw.toFixed(2)}ms`);
            console.log(`4. Floor Load: ${perf.floorLoad.toFixed(2)}ms`);
            console.log(`5. Collisions: ${perf.collisions.toFixed(2)}ms`);
            console.log(`6. Decorations: ${perf.decorations.toFixed(2)}ms`);
            console.log(`7. Doors: ${(perf.doors || 0).toFixed(2)}ms`);
            console.log(`8. Player: ${(perf.player || 0).toFixed(2)}ms`);
            console.log(`%cTOTAL: ${perf.total.toFixed(2)}ms`, 'color: #4ecdc4; font-weight: bold;');
            console.log(`%c🔥 BOTTLENECK: ${bottleneck[0]} (${bottleneck[1].toFixed(2)}ms)`, 'color: #ff6b6b; font-weight: bold; font-size: 14px;');
            console.log(`Top 3: ${sortedPerf.slice(0, 3).map(([k, v]) => `${k}(${v.toFixed(2)}ms)`).join(', ')}`);
            
            // Console table for better readability
            console.table({
                'Room Shape': perf.roomShape.toFixed(2) + 'ms',
                'Floor Canvas': perf.floorCanvas.toFixed(2) + 'ms',
                'Floor Draw': perf.floorDraw.toFixed(2) + 'ms',
                'Floor Load': perf.floorLoad.toFixed(2) + 'ms',
                'Collisions': perf.collisions.toFixed(2) + 'ms',
                'Decorations': perf.decorations.toFixed(2) + 'ms',
                'Doors': (perf.doors || 0).toFixed(2) + 'ms',
                'Player': (perf.player || 0).toFixed(2) + 'ms',
                'TOTAL': perf.total.toFixed(2) + 'ms'
            });
            
            // Also log to Logger for consistency
            Logger.warn('PERFORMANCE PROFILE', {
                roomId: currentRoom.id,
                roomShape: perf.roomShape.toFixed(2) + 'ms',
                floorCanvas: perf.floorCanvas.toFixed(2) + 'ms',
                floorDraw: perf.floorDraw.toFixed(2) + 'ms',
                floorLoad: perf.floorLoad.toFixed(2) + 'ms',
                collisions: perf.collisions.toFixed(2) + 'ms',
                decorations: perf.decorations.toFixed(2) + 'ms',
                doors: (perf.doors || 0).toFixed(2) + 'ms',
                player: (perf.player || 0).toFixed(2) + 'ms',
                total: perf.total.toFixed(2) + 'ms',
                bottleneck: bottleneck[0] + ' (' + bottleneck[1].toFixed(2) + 'ms)'
            });
            
            Logger.info('Room objects created', { 
                torches: torchCount, 
                decorations: decorCount, 
                obstacles: obstacleCount,
                roomId: currentRoom.id 
            });

            // Create doors based on dungeon connections
            perfStep = performance.now();
            doors = [];
            doorTexts = [];
            const adjacentRooms = dungeon.getAdjacentRooms();
            
            let doorCount = 0;
            adjacentRooms.forEach(({ room: targetRoom, direction, canEnter }) => {
                doorCount++;
                let doorX, doorY, textOffsetX = 0, textOffsetY = -40;
                
                // Check if boss room requires all keys collected
                const isBossDoor = targetRoom.type === ROOM_TYPES.BOSS;
                const allKeysCollected = checkAllKeysCollected(dungeon);
                const bossAccessible = !isBossDoor || allKeysCollected;
                
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
                
                // Door sprite - only open if room is cleared and (not boss or all keys collected)
                const canOpenDoor = isBossDoor ? allKeysCollected : currentRoom.cleared;
                const doorSprite = canOpenDoor ? "doorOpen" : "doorClosed";
                const door = add([
                    sprite(doorSprite), 
                    pos(doorX, doorY), 
                    anchor("center"), 
                    area({ shape: new Rect(vec2(-24, -36), 48, 72) }), // Larger hitbox
                    z(2), 
                    scale(1.2), // Slightly larger door
                    { targetRoomId: targetRoom.id, direction, isBossDoor, bossAccessible, targetRoomType: targetRoom.type },
                    "door"
                ]);
                doors.push(door);
                
                // Door label - show room type with larger text
                let label = "🔒";
                let labelColor = rgb(255, 100, 100);
                
                if (currentRoom.cleared) {
                    if (isBossDoor) {
                        if (allKeysCollected) {
                            label = "💀 BOSS";
                            labelColor = rgb(255, 50, 50);
                        } else {
                            // Show how many keys needed
                            const requiredRooms = dungeon.map.rooms.filter(r => 
                                r.type !== ROOM_TYPES.BOSS && r.type !== ROOM_TYPES.START
                            );
                            const keysNeeded = requiredRooms.length - GS.collectedKeys.length;
                            label = `🔒 ${keysNeeded}`;
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
                    { targetRoomId: targetRoom.id, targetRoomType: targetRoom.type }
                ]);
                doorTexts.push(doorTxt);
            });
            
            const perfDoors = performance.now() - perfStep;
            perf.doors = perfDoors;
            
            // Room type indicator
            const isBossRoom = currentRoom.type === ROOM_TYPES.BOSS;
            roomIndicator = null;

            // Create player (spawn in room center)
            perfStep = performance.now();
            const p = createPlayer();
            p.pos = vec2(roomShape.centerX, roomShape.centerY);
            setupPlayerMovement(p);
            perf.player = performance.now() - perfStep;
            
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
            let camUpdateTimer = 0;
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
                
                // OPTIMIZED: Camera update (30/sec instead of 60 for smoother performance)
                camUpdateTimer += dt();
                if (camUpdateTimer >= 0.033) {
                    camUpdateTimer = 0;
                    if (p && p.exists()) {
                        const halfViewW = CONFIG.VIEWPORT_WIDTH / 2;
                        const halfViewH = CONFIG.VIEWPORT_HEIGHT / 2;
                        const camX = Math.max(halfViewW, Math.min(p.pos.x, CONFIG.MAP_WIDTH - halfViewW));
                        const camY = Math.max(halfViewH, Math.min(p.pos.y, CONFIG.MAP_HEIGHT - halfViewH));
                        camPos(camX, camY);
                    }
                }
                
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

            onCollide("player", "key", (p, k) => {
                try {
                    const roomId = k.roomId;
                    if (roomId === undefined || roomId === null) {
                        Logger.warn('Key without roomId!', { key: k });
                        return;
                    }
                    
                    // Check if already collected
                    if (GS.collectedKeys.includes(roomId)) {
                        Logger.debug('Key already collected', { roomId });
                        return;
                    }
                    
                    Logger.info('Key collected!', { roomId, totalKeys: GS.collectedKeys.length + 1 });
                    GS.collectedKeys.push(roomId);
                    GS.hasKey = true; // Legacy compatibility
                    playSound('key');
                    
                    // Destroy this specific key
                    destroy(k);
                    destroyAll("keyPart");
                    
                    // Check if all keys collected
                    const dungeon = GS.dungeon;
                    const allKeysCollected = checkAllKeysCollected(dungeon);
                    
                    if (allKeysCollected) {
                        Logger.info('All keys collected! Boss door unlocked!');
                        // Update door visuals
                        doors.forEach(d => {
                            if (d && d.exists() && d.targetRoomType === ROOM_TYPES.BOSS) {
                                d.use(sprite("doorOpen"));
                            }
                        });
                        doorTexts.forEach(t => {
                            if (t && t.exists() && t.targetRoomType === ROOM_TYPES.BOSS) {
                                t.text = "🚪";
                            }
                        });
                    }
                } catch (error) {
                    Logger.error('Key collision error', { error: error.message });
                }
            });

            onCollide("player", "door", (pl, doorObj) => {
                try {
                    const targetRoomId = doorObj.targetRoomId;
                    if (targetRoomId === undefined) return;
                    
                    const targetRoom = dungeon.getRoom(targetRoomId);
                    if (!targetRoom) return;
                    
                    // Check if door is locked
                    const isBossDoor = targetRoom.type === ROOM_TYPES.BOSS;
                    const allKeysCollected = checkAllKeysCollected(dungeon);
                    const canEnter = isBossDoor ? allKeysCollected : currentRoom.cleared;
                    
                    if (!canEnter) {
                        if (isBossDoor) {
                            const requiredRooms = dungeon.map.rooms.filter(r => 
                                r.type !== ROOM_TYPES.BOSS && r.type !== ROOM_TYPES.START
                            );
                            const keysNeeded = requiredRooms.length - GS.collectedKeys.length;
                            const msg = add([
                                text(`Collect ${keysNeeded} more key${keysNeeded > 1 ? 's' : ''} first!`, { size: 20 }),
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
                        } else {
                            // Regular door - need to clear room first
                            const msg = add([
                                text("Clear room first!", { size: 20 }),
                                pos(width() / 2, height() / 2 - 50),
                                anchor("center"),
                                color(255, 100, 100),
                                fixed(),
                                z(1000),
                                lifespan(2),
                            ]);
                        }
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
                    
                    // Go to the target room through loading screen
                    GS.resetRoom();
                    Logger.info('Going to room', { roomId: targetRoomId, type: targetRoom.type });
                    GS.loadingTargetScene = "game";
                    go("loading"); // Show loading screen during room generation
                    
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
                    // OPTIMIZED: Gold animation throttled (10/sec)
                    let goldAnimTimer = 0;
                    goldPickup.onUpdate(() => {
                        goldAnimTimer += dt();
                        if (goldAnimTimer >= 0.1) {
                            goldAnimTimer = 0;
                            goldPickup.t += 0.3;
                            goldPickup.pos.y += Math.sin(goldPickup.t) * 0.3;
                        }
                    });
                }
            } else if (roomType === ROOM_TYPES.START && currentRoom.cleared) {
                // Start room already cleared
                Logger.info('Start room - already cleared');
            } else if (!currentRoom.cleared) {
                // Combat/Elite room - spawn enemies AFTER room is fully loaded
                // Wait longer for chunked generation to complete (floor + collisions + decorations)
                wait(1.0, () => {
                    const enemyCount = GS.roomEnemyCount;
                    Logger.info('Spawning enemies', { count: enemyCount, type: roomType, roomId: currentRoom.id });
                    
                    if (enemyCount <= 0) {
                        Logger.warn('No enemies to spawn!', { enemyCount, roomEnemyCount: GS.roomEnemyCount });
                        return;
                    }
                    
                    // WEIGHT SYSTEM: Spawn enemies based on weight distribution
                    const roomConfig = getRoomConfig();
                    const totalWeight = roomConfig.totalWeight || enemyCount;
                    
                    Logger.info('Spawning enemies with weight system', { 
                        totalWeight, 
                        enemyCount,
                        level: GS.currentLevel,
                        room: currentRoom.id
                    });
                    
                    // Distribute weight across enemy types
                    const enemyDistribution = distributeEnemyWeight(totalWeight, GS.currentLevel);
                    
                    Logger.info('Enemy distribution', { 
                        distribution: enemyDistribution,
                        total: Object.values(enemyDistribution).reduce((sum, count) => sum + count, 0)
                    });
                    
                    // Spawn enemies based on distribution
                    let spawnIndex = 0;
                    for (const [enemyType, count] of Object.entries(enemyDistribution)) {
                        if (!enemyType || !ENEMY_TYPES[enemyType]) {
                            Logger.warn('Invalid enemy type in distribution', { enemyType, distribution: enemyDistribution });
                            continue;
                        }
                        const spawnCount = Math.max(0, Math.floor(count || 0));
                        for (let i = 0; i < spawnCount; i++) {
                            wait(spawnIndex * 0.3, () => {
                                try {
                                    Logger.debug('Spawning enemy', { 
                                        type: enemyType, 
                                        index: i + 1, 
                                        total: spawnCount,
                                        spawnIndex: spawnIndex + 1
                                    });
                                    spawnEnemy(enemyType);
                                } catch (error) {
                                    Logger.error('Error spawning enemy', { error: error.message, enemyType, stack: error.stack });
                                }
                            });
                            spawnIndex++;
                        }
                    }
                });
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
                // OPTIMIZED: Use lifespan instead of onUpdate
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
            
            // Send room layout to minimap
            if (GS.setRoomGrid) {
                GS.setRoomGrid(roomShape);
            }

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
