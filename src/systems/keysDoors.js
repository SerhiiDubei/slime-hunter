// ==================== KEYS & DOORS SYSTEM ====================
// Centralized logic for key collection and door management
// Separated from game.js for better organization and debugging

import { GS } from '../state.js';
import { ROOM_TYPES } from '../data/rooms.js';
import { Logger } from '../logger.js';
import { playSound } from '../audio.js';

// ==================== KEY SYSTEM ====================

/**
 * Key colors for different rooms (rainbow colors)
 */
const KEY_COLORS = [
    [255, 100, 100],  // Red
    [255, 200, 100],  // Orange
    [255, 255, 100],  // Yellow
    [100, 255, 100],  // Green
    [100, 200, 255],  // Blue
    [200, 100, 255],  // Purple
    [255, 100, 200],  // Pink
];

/**
 * Get color for a specific room ID
 */
function getKeyColor(roomId) {
    if (roomId === undefined || roomId === null) {
        Logger.warn('getKeyColor: Invalid roomId', { roomId });
        return [255, 200, 100]; // Fallback to orange
    }
    const safeRoomId = Math.abs(roomId);
    const colorIndex = safeRoomId % KEY_COLORS.length;
    const colorArray = KEY_COLORS[colorIndex];
    
    if (!colorArray || !Array.isArray(colorArray) || colorArray.length < 3) {
        Logger.error('getKeyColor: Invalid color from array', { roomId, safeRoomId, colorIndex, colorArray });
        return [255, 200, 100]; // Fallback
    }
    
    return colorArray;
}

/**
 * Spawn a key at position for a specific room
 * @param {vec2} position - Position to spawn key
 * @param {number} roomId - Room ID this key belongs to
 * @param {Array<number>} keyColor - Optional color override [r, g, b]
 */
export function spawnKey(position, roomId, keyColor = null) {
    // #region agent log
    Logger.info('🔑 spawnKey:ENTRY', { 
        position: position ? { x: position.x, y: position.y } : null,
        roomId,
        keyColor
    });
    // #endregion
    
    try {
        // Validate position
        if (!position || (position.x === undefined && position.pos === undefined)) {
            Logger.error('CRITICAL: Invalid position for spawnKey', { position, roomId, keyColor });
            // #region agent log
            Logger.error('🔑 spawnKey:ERROR - Invalid position', { position, roomId, keyColor });
            // #endregion
            return;
        }
        
        const pos = position.pos || position;
        
        // Validate roomId
        if (roomId === undefined || roomId === null) {
            Logger.error('CRITICAL: Invalid roomId for spawnKey', { position: pos, roomId, keyColor });
            // #region agent log
            Logger.error('🔑 spawnKey:ERROR - Invalid roomId', { pos, roomId, keyColor });
            // #endregion
            return;
        }
        
        Logger.info('Spawning key at', { x: pos.x, y: pos.y, roomId, keyColor });
        
        // Get color array
        let keyColorArray;
        if (keyColor && Array.isArray(keyColor) && keyColor.length >= 3) {
            keyColorArray = keyColor;
        } else {
            keyColorArray = getKeyColor(roomId);
        }
        
        // #region agent log
        Logger.debug('🔑 spawnKey:COLOR', { 
            keyColorArray, 
            roomId, 
            keyColorProvided: !!keyColor 
        });
        // #endregion
        
        if (!keyColorArray || !Array.isArray(keyColorArray) || keyColorArray.length < 3) {
            Logger.error('CRITICAL: Invalid keyColorArray', { 
                roomId, 
                keyColorArray,
                keyColorProvided: keyColor
            });
            keyColorArray = [255, 200, 100]; // Fallback to orange
        }
        
        Logger.debug('Key color array', { keyColorArray, roomId });
        
        // Validate color values before using
        const r = Math.max(0, Math.min(255, keyColorArray[0]));
        const g = Math.max(0, Math.min(255, keyColorArray[1]));
        const b = Math.max(0, Math.min(255, keyColorArray[2]));
        
        Logger.debug('🔑 spawnKey:COLOR_VALUES', { r, g, b, roomId });
        
        // Use rgb() instead of color() - rgb works better in ES modules
        // Check if rgb function is available, fallback to window.color or globalThis.color
        let colorFn = rgb;
        if (typeof rgb !== 'function') {
            colorFn = typeof window !== 'undefined' && typeof window.color === 'function' ? window.color : 
                     typeof globalThis !== 'undefined' && typeof globalThis.color === 'function' ? globalThis.color :
                     null;
        }
        
        if (!colorFn || typeof colorFn !== 'function') {
            Logger.error('🔑 spawnKey:COLOR_NOT_FUNCTION', { 
                rgbType: typeof rgb,
                colorType: typeof color,
                windowColor: typeof window !== 'undefined' ? typeof window.color : 'no window',
                globalThisColor: typeof globalThis !== 'undefined' ? typeof globalThis.color : 'no globalThis'
            });
            throw new Error('Neither rgb() nor color() function is available. Is Kaboom initialized?');
        }
        
        // Create key sprite with color
        let k;
        try {
            Logger.debug('🔑 spawnKey:CREATING_KEY_SPRITE', { pos: { x: pos.x, y: pos.y }, r, g, b, colorFnName: colorFn.name });
            k = add([
                sprite("key"), 
                pos(pos), 
                anchor("center"), 
                area(), 
                z(5), 
                scale(1), 
                colorFn(r, g, b), 
                "key",
                { roomId, keyColor: keyColorArray } // Store room ID and color
            ]);
            Logger.debug('🔑 spawnKey:KEY_SPRITE_CREATED', { keyExists: !!k });
        } catch (spriteError) {
            Logger.error('🔑 spawnKey:SPRITE_CREATION_ERROR', { 
                error: spriteError.message,
                stack: spriteError.stack,
                r, g, b, pos,
                colorFnName: colorFn ? colorFn.name : 'null'
            });
            throw spriteError;
        }
        
        // OPTIMIZED: Key animation with throttle (10/sec instead of 60)
        const startY = pos.y;
        let keyAnimTimer = 0;
        k.onUpdate(() => {
            try {
                keyAnimTimer += dt();
                if (keyAnimTimer >= 0.1) {
                    keyAnimTimer = 0;
                    k.pos.y = startY + Math.sin(time() * 4) * 5;
                    k.angle = Math.sin(time() * 2) * 10;
                }
            } catch (error) {
                Logger.error('Key animation error', { error: error.message, stack: error.stack });
            }
        });
        
        // OPTIMIZED: Colored glow matching key color
        try {
            Logger.debug('🔑 spawnKey:CREATING_GLOW', { r, g, b, pos: { x: pos.x, y: pos.y }, colorFnName: colorFn.name });
            add([
                circle(25), 
                pos(pos), 
                colorFn(r, g, b), 
                opacity(0.3), 
                anchor("center"), 
                z(4), 
                "keyPart"
            ]);
            Logger.debug('🔑 spawnKey:GLOW_CREATED');
        } catch (glowError) {
            Logger.error('🔑 spawnKey:GLOW_CREATION_ERROR', { 
                error: glowError.message,
                stack: glowError.stack,
                r, g, b, pos,
                colorFnName: colorFn ? colorFn.name : 'null'
            });
            // Don't throw - glow is optional
        }
        
        // #region agent log
        Logger.info('🔑 spawnKey:SUCCESS', { 
            roomId, 
            keyColorArray, 
            position: { x: pos.x, y: pos.y } 
        });
        // #endregion
    } catch (error) {
        Logger.error('CRITICAL: spawnKey failed', {
            error: error.message,
            stack: error.stack,
            position,
            roomId,
            keyColor
        });
        // #region agent log
        Logger.error('🔑 spawnKey:EXCEPTION', { 
            error: error.message,
            stack: error.stack,
            position,
            roomId,
            keyColor
        });
        // #endregion
    }
}

/**
 * Check if all required keys are collected
 * @param {DungeonManager} dungeon - Dungeon manager instance
 * @returns {boolean} True if all keys collected
 */
export function checkAllKeysCollected(dungeon) {
    // #region agent log
    Logger.debug('🔑 checkAllKeysCollected:ENTRY', { 
        dungeon: !!dungeon,
        collectedKeys: GS.collectedKeys
    });
    // #endregion
    
    if (!dungeon) {
        Logger.warn('checkAllKeysCollected: No dungeon provided');
        return false;
    }
    
    const allRooms = dungeon.map.rooms;
    const requiredRooms = allRooms.filter(r => 
        r.type !== ROOM_TYPES.BOSS && r.type !== ROOM_TYPES.START
    );
    
    // #region agent log
    Logger.debug('🔑 checkAllKeysCollected:ROOMS', { 
        totalRooms: allRooms.length,
        requiredRooms: requiredRooms.length,
        requiredRoomIds: requiredRooms.map(r => r.id),
        collectedKeys: GS.collectedKeys
    });
    // #endregion
    
    // Check if all required rooms have their keys collected
    const allCollected = requiredRooms.length > 0 && requiredRooms.every(room => {
        const hasKey = GS.collectedKeys.includes(room.id);
        // #region agent log
        if (!hasKey) {
            Logger.debug('🔑 checkAllKeysCollected:MISSING', { 
                roomId: room.id,
                roomType: room.type,
                collectedKeys: GS.collectedKeys
            });
        }
        // #endregion
        return hasKey;
    });
    
    // #region agent log
    Logger.debug('🔑 checkAllKeysCollected:RESULT', { 
        allCollected,
        requiredCount: requiredRooms.length,
        collectedCount: GS.collectedKeys.length
    });
    // #endregion
    
    return allCollected;
}

/**
 * Collect a key (called on player collision with key)
 * @param {GameObj} keyObj - Key game object
 * @param {DungeonManager} dungeon - Dungeon manager instance
 * @param {Array<GameObj>} doors - Array of door objects
 * @param {Array<GameObj>} doorTexts - Array of door text objects
 */
export function collectKey(keyObj, dungeon, doors, doorTexts) {
    // #region agent log
    Logger.info('🔑 collectKey:ENTRY', { 
        keyObj: !!keyObj,
        roomId: keyObj?.roomId,
        collectedKeys: GS.collectedKeys
    });
    // #endregion
    
    try {
        const roomId = keyObj.roomId;
        if (roomId === undefined || roomId === null) {
            Logger.warn('Key without roomId!', { key: keyObj });
            // #region agent log
            Logger.warn('🔑 collectKey:ERROR - Key missing roomId', { keyObj });
            // #endregion
            return;
        }
        
        // Check if already collected
        if (GS.collectedKeys.includes(roomId)) {
            Logger.debug('Key already collected', { roomId });
            // #region agent log
            Logger.debug('🔑 collectKey:DUPLICATE', { roomId, collectedKeys: GS.collectedKeys });
            // #endregion
            return;
        }
        
        Logger.info('Key collected!', { roomId, totalKeys: GS.collectedKeys.length + 1 });
        GS.collectedKeys.push(roomId);
        GS.hasKey = true; // Legacy compatibility
        
        // #region agent log
        Logger.info('🔑 collectKey:ADDED', { 
            roomId, 
            newCollectedKeys: GS.collectedKeys 
        });
        // #endregion
        
        playSound('key');
        
        // Destroy this specific key
        destroy(keyObj);
        destroyAll("keyPart");
        
        // Check if all keys collected
        const allKeysCollected = checkAllKeysCollected(dungeon);
        
        if (allKeysCollected) {
            Logger.info('All keys collected! Boss door unlocked!');
            // Update door visuals
            updateBossDoorVisuals(doors, doorTexts, true);
        }
        
        // #region agent log
        Logger.info('🔑 collectKey:SUCCESS', { 
            roomId, 
            allKeysCollected, 
            collectedKeys: GS.collectedKeys 
        });
        // #endregion
    } catch (error) {
        Logger.error('Key collection error', { 
            error: error.message,
            stack: error.stack,
            keyObj
        });
        // #region agent log
        Logger.error('🔑 collectKey:EXCEPTION', { 
            error: error.message,
            stack: error.stack,
            keyObj
        });
        // #endregion
    }
}

// ==================== DOOR SYSTEM ====================

/**
 * Update boss door visuals based on key collection status
 */
export function updateBossDoorVisuals(doors, doorTexts, allKeysCollected) {
    // #region agent log
    Logger.debug('🔑 updateBossDoorVisuals:ENTRY', { 
        allKeysCollected,
        doorsCount: doors.length,
        doorTextsCount: doorTexts.length
    });
    // #endregion
    
    doors.forEach(d => {
        if (d && d.exists() && d.targetRoomType === ROOM_TYPES.BOSS) {
            if (allKeysCollected) {
                d.use(sprite("doorOpen"));
            }
        }
    });
    
    doorTexts.forEach(t => {
        if (t && t.exists() && t.targetRoomType === ROOM_TYPES.BOSS) {
            t.text = allKeysCollected ? "🚪" : "🔒";
        }
    });
    
    // #region agent log
    Logger.debug('🔑 updateBossDoorVisuals:SUCCESS', { allKeysCollected });
    // #endregion
}

/**
 * Check if player can enter a door
 * @param {Room} targetRoom - Target room
 * @param {Room} currentRoom - Current room
 * @param {DungeonManager} dungeon - Dungeon manager instance
 * @returns {Object} { canEnter: boolean, reason: string }
 */
export function canEnterDoor(targetRoom, currentRoom, dungeon) {
    // #region agent log
    Logger.debug('🔑 canEnterDoor:ENTRY', { 
        targetRoomId: targetRoom?.id,
        targetRoomType: targetRoom?.type,
        currentRoomId: currentRoom?.id,
        currentRoomCleared: currentRoom?.cleared
    });
    // #endregion
    
    if (!targetRoom || !currentRoom) {
        return { canEnter: false, reason: 'Invalid room data' };
    }
    
    const isBossDoor = targetRoom.type === ROOM_TYPES.BOSS;
    const allKeysCollected = checkAllKeysCollected(dungeon);
    const canEnter = isBossDoor ? allKeysCollected : currentRoom.cleared;
    
    // #region agent log
    Logger.debug('🔑 canEnterDoor:RESULT', { 
        canEnter,
        isBossDoor,
        allKeysCollected,
        currentRoomCleared: currentRoom.cleared
    });
    // #endregion
    
    return {
        canEnter,
        reason: isBossDoor 
            ? (allKeysCollected ? 'All keys collected' : 'Missing keys')
            : (currentRoom.cleared ? 'Room cleared' : 'Room not cleared')
    };
}

/**
 * Get number of keys needed for boss door
 * @param {DungeonManager} dungeon - Dungeon manager instance
 * @returns {number} Number of keys still needed
 */
export function getKeysNeeded(dungeon) {
    if (!dungeon) return 0;
    
    const requiredRooms = dungeon.map.rooms.filter(r => 
        r.type !== ROOM_TYPES.BOSS && r.type !== ROOM_TYPES.START
    );
    
    return Math.max(0, requiredRooms.length - GS.collectedKeys.length);
}

