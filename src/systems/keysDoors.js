// ==================== KEYS & DOORS SYSTEM ====================
// Centralized logic for key collection and door management
// Separated from game.js for better organization and debugging

import { GS } from '../state.js';
import { ROOM_TYPES } from '../data/rooms.js';
import { Logger } from '../logger.js';
import { playSound } from '../audio.js';
import { isWalkable } from '../utils.js';

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
    
    // Boss key (roomId = -1) is always gold
    if (roomId === -1) {
        return [255, 215, 0]; // Gold color for boss key
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
        
        let pos = position.pos || position;
        
        // Validate roomId
        if (roomId === undefined || roomId === null) {
            Logger.error('CRITICAL: Invalid roomId for spawnKey', { position: pos, roomId, keyColor });
            // #region agent log
            Logger.error('🔑 spawnKey:ERROR - Invalid roomId', { pos, roomId, keyColor });
            // #endregion
            return;
        }
        
        // CRITICAL FIX: Ensure key spawns on walkable position
        // If position is not walkable, find nearest walkable position
        if (!isWalkable(pos)) {
            Logger.warn('🔑 spawnKey: Position not walkable, finding walkable position', { 
                originalPos: { x: pos.x, y: pos.y },
                roomId 
            });
            
            // Get vec2 function
            const vec2Fn = (typeof window !== 'undefined' && typeof window.vec2 === 'function') ? window.vec2 :
                          (typeof globalThis !== 'undefined' && typeof globalThis.vec2 === 'function') ? globalThis.vec2 :
                          (typeof vec2 === 'function') ? vec2 : null;
            
            if (!vec2Fn) {
                Logger.error('🔑 spawnKey: vec2 not available');
                return;
            }
            
            // Try positions in a spiral around the original position
            let foundWalkable = false;
            const maxRadius = 200; // Search radius
            const step = 40; // Grid step size
            
            for (let radius = step; radius <= maxRadius && !foundWalkable; radius += step) {
                for (let angle = 0; angle < Math.PI * 2 && !foundWalkable; angle += Math.PI / 4) {
                    const testX = pos.x + Math.cos(angle) * radius;
                    const testY = pos.y + Math.sin(angle) * radius;
                    const testPos = vec2Fn(testX, testY);
                    
                    if (isWalkable(testPos)) {
                        pos = testPos;
                        foundWalkable = true;
                        Logger.info('🔑 spawnKey: Found walkable position', { 
                            originalPos: { x: position.x || position.pos?.x, y: position.y || position.pos?.y },
                            newPos: { x: pos.x, y: pos.y },
                            radius,
                            angle: angle * 180 / Math.PI
                        });
                        break;
                    }
                }
            }
            
            // If still not walkable, use player position as fallback
            if (!foundWalkable && GS.player && GS.player.exists() && GS.player.pos) {
                pos = vec2Fn(GS.player.pos.x, GS.player.pos.y);
                Logger.warn('🔑 spawnKey: Using player position as fallback', { 
                    pos: { x: pos.x, y: pos.y } 
                });
            }
        }
        
        Logger.info('Spawning key at', { x: pos.x, y: pos.y, roomId, keyColor, isWalkable: isWalkable(pos) });
        
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
        
        // Get Kaboom functions from window/globalThis (ES module context)
        // NOTE: Do NOT check 'typeof pos' - pos is a Vec2, not a function!
        const addFn = (typeof window !== 'undefined' && typeof window.add === 'function') ? window.add :
                     (typeof globalThis !== 'undefined' && typeof globalThis.add === 'function') ? globalThis.add :
                     (typeof add === 'function') ? add : null;
        const posFn = (typeof window !== 'undefined' && typeof window.pos === 'function') ? window.pos :
                     (typeof globalThis !== 'undefined' && typeof globalThis.pos === 'function') ? globalThis.pos :
                     null; // Don't check 'typeof pos' - pos is Vec2, not function!
        const spriteFn = (typeof window !== 'undefined' && typeof window.sprite === 'function') ? window.sprite :
                        (typeof globalThis !== 'undefined' && typeof globalThis.sprite === 'function') ? globalThis.sprite :
                        (typeof sprite === 'function') ? sprite : null;
        const anchorFn = (typeof window !== 'undefined' && typeof window.anchor === 'function') ? window.anchor :
                        (typeof globalThis !== 'undefined' && typeof globalThis.anchor === 'function') ? globalThis.anchor :
                        (typeof anchor === 'function') ? anchor : null;
        const areaFn = (typeof window !== 'undefined' && typeof window.area === 'function') ? window.area :
                      (typeof globalThis !== 'undefined' && typeof globalThis.area === 'function') ? globalThis.area :
                      (typeof area === 'function') ? area : null;
        const zFn = (typeof window !== 'undefined' && typeof window.z === 'function') ? window.z :
                   (typeof globalThis !== 'undefined' && typeof globalThis.z === 'function') ? globalThis.z :
                   (typeof z === 'function') ? z : null;
        const scaleFn = (typeof window !== 'undefined' && typeof window.scale === 'function') ? window.scale :
                       (typeof globalThis !== 'undefined' && typeof globalThis.scale === 'function') ? globalThis.scale :
                       (typeof scale === 'function') ? scale : null;
        const rgbFn = (typeof window !== 'undefined' && typeof window.rgb === 'function') ? window.rgb :
                     (typeof globalThis !== 'undefined' && typeof globalThis.rgb === 'function') ? globalThis.rgb :
                     (typeof rgb === 'function') ? rgb : null;
        
        if (!addFn || !posFn || !spriteFn) {
            Logger.error('🔑 spawnKey:KABOOM_FUNCTIONS_NOT_AVAILABLE', { 
                add: !!addFn, pos: !!posFn, sprite: !!spriteFn,
                windowAdd: typeof window !== 'undefined' ? typeof window.add : 'no window'
            });
            throw new Error('Kaboom functions (add, pos, sprite) are not available. Is Kaboom initialized with global: true?');
        }
        
        // APPROACH: Create sprite first, then set color property
        // This avoids ES module context issues with color() component
        let k;
        try {
            Logger.debug('🔑 spawnKey:CREATING_KEY_SPRITE', { pos: { x: pos.x, y: pos.y }, r, g, b });
            
            // Create sprite WITHOUT color component first
            // posFn expects (x, y) coordinates
            // Get Rect and vec2 for larger collision area
            const RectFn = (typeof window !== 'undefined' && typeof window.Rect === 'function') ? window.Rect :
                          (typeof globalThis !== 'undefined' && typeof globalThis.Rect === 'function') ? globalThis.Rect :
                          (typeof Rect === 'function') ? Rect : null;
            const vec2FnForRect = (typeof window !== 'undefined' && typeof window.vec2 === 'function') ? window.vec2 :
                                 (typeof globalThis !== 'undefined' && typeof globalThis.vec2 === 'function') ? globalThis.vec2 :
                                 (typeof vec2 === 'function') ? vec2 : null;
            
            let areaComponent;
            if (RectFn && vec2FnForRect) {
                areaComponent = areaFn({ shape: new RectFn(vec2FnForRect(-20, -20), 40, 40) }); // Larger collision area (40x40) for easier pickup
            } else {
                areaComponent = areaFn(); // Fallback to default area
            }
            
            k = addFn([
                spriteFn("key"), 
                posFn(pos.x, pos.y), 
                anchorFn("center"), 
                areaComponent,
                zFn(5), 
                scaleFn(1), 
                "key",
                { roomId, keyColor: keyColorArray } // Store room ID and color
            ]);
            
            // Set color AFTER creation using rgb() to create Color object, then assign to .color property
            if (rgbFn && typeof rgbFn === 'function') {
                k.color = rgbFn(r, g, b);
                Logger.debug('🔑 spawnKey:COLOR_SET_VIA_RGB', { r, g, b });
            } else {
                Logger.warn('🔑 spawnKey:RGB_NOT_AVAILABLE - key will be default color', { r, g, b });
            }
            
            Logger.debug('🔑 spawnKey:KEY_SPRITE_CREATED', { keyExists: !!k, hasColor: !!k.color });
        } catch (spriteError) {
            Logger.error('🔑 spawnKey:SPRITE_CREATION_ERROR', { 
                error: spriteError.message,
                stack: spriteError.stack,
                r, g, b, pos
            });
            throw spriteError;
        }
        
        // OPTIMIZED: Key animation with throttle (10/sec instead of 60)
        const startY = pos.y;
        let keyAnimTimer = 0;
        k.onUpdate(() => {
            try {
                // Get dt and time from window/globalThis
                const dtFn = (typeof window !== 'undefined' && typeof window.dt === 'function') ? window.dt :
                           (typeof globalThis !== 'undefined' && typeof globalThis.dt === 'function') ? globalThis.dt :
                           (typeof dt === 'function') ? dt : null;
                const timeFn = (typeof window !== 'undefined' && typeof window.time === 'function') ? window.time :
                              (typeof globalThis !== 'undefined' && typeof globalThis.time === 'function') ? globalThis.time :
                              (typeof time === 'function') ? time : null;
                
                if (dtFn && timeFn) {
                    keyAnimTimer += dtFn();
                    if (keyAnimTimer >= 0.1) {
                        keyAnimTimer = 0;
                        k.pos.y = startY + Math.sin(timeFn() * 4) * 5;
                        k.angle = Math.sin(timeFn() * 2) * 10;
                    }
                }
            } catch (error) {
                Logger.error('Key animation error', { error: error.message, stack: error.stack });
            }
        });
        
        // OPTIMIZED: Colored glow matching key color
        try {
            Logger.debug('🔑 spawnKey:CREATING_GLOW', { r, g, b, pos: { x: pos.x, y: pos.y } });
            
            // Get circle and opacity functions
            const circleFn = (typeof window !== 'undefined' && typeof window.circle === 'function') ? window.circle :
                           (typeof globalThis !== 'undefined' && typeof globalThis.circle === 'function') ? globalThis.circle :
                           (typeof circle === 'function') ? circle : null;
            const opacityFn = (typeof window !== 'undefined' && typeof window.opacity === 'function') ? window.opacity :
                             (typeof globalThis !== 'undefined' && typeof globalThis.opacity === 'function') ? globalThis.opacity :
                             (typeof opacity === 'function') ? opacity : null;
            
            if (circleFn && opacityFn && addFn && posFn && anchorFn && zFn) {
                const glow = addFn([
                    circleFn(25), 
                    posFn(pos.x, pos.y), 
                    opacityFn(0.3), 
                    anchorFn("center"), 
                    zFn(4), 
                    "keyPart"
                ]);
                
                // Set color after creation
                if (rgbFn && typeof rgbFn === 'function') {
                    glow.color = rgbFn(r, g, b);
                }
                
                Logger.debug('🔑 spawnKey:GLOW_CREATED');
            } else {
                Logger.warn('🔑 spawnKey:GLOW_SKIP - functions not available', { 
                    circle: !!circleFn, opacity: !!opacityFn 
                });
            }
        } catch (glowError) {
            Logger.error('🔑 spawnKey:GLOW_CREATION_ERROR', { 
                error: glowError.message,
                stack: glowError.stack,
                r, g, b, pos
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

