// ==================== KEYS & DOORS SYSTEM ====================
// Centralized logic for key collection and door management
// Separated from game.js for better organization and debugging

import { GS } from '../state.js';
import { ROOM_TYPES } from '../data/rooms.js';
import { Logger } from '../logger.js';

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
    const color = KEY_COLORS[colorIndex];
    
    if (!color || !Array.isArray(color) || color.length < 3) {
        Logger.error('getKeyColor: Invalid color from array', { roomId, safeRoomId, colorIndex, color });
        return [255, 200, 100]; // Fallback
    }
    
    return color;
}

/**
 * Spawn a key at position for a specific room
 * @param {vec2} position - Position to spawn key
 * @param {number} roomId - Room ID this key belongs to
 * @param {Array<number>} keyColor - Optional color override [r, g, b]
 */
export function spawnKey(position, roomId, keyColor = null) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cfda9218-06fc-4cdd-8ace-380746c59fe7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'keysDoors.js:spawnKey:ENTRY',message:'spawnKey called',data:{position:position?{x:position.x,y:position.y}:null,roomId,keyColor},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    try {
        // Validate position
        if (!position || (position.x === undefined && position.pos === undefined)) {
            Logger.error('CRITICAL: Invalid position for spawnKey', { position, roomId, keyColor });
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/cfda9218-06fc-4cdd-8ace-380746c59fe7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'keysDoors.js:spawnKey:ERROR',message:'Invalid position',data:{position,roomId,keyColor},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            return;
        }
        
        const pos = position.pos || position;
        
        // Validate roomId
        if (roomId === undefined || roomId === null) {
            Logger.error('CRITICAL: Invalid roomId for spawnKey', { position: pos, roomId, keyColor });
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/cfda9218-06fc-4cdd-8ace-380746c59fe7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'keysDoors.js:spawnKey:ERROR',message:'Invalid roomId',data:{pos,roomId,keyColor},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
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
        fetch('http://127.0.0.1:7242/ingest/cfda9218-06fc-4cdd-8ace-380746c59fe7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'keysDoors.js:spawnKey:COLOR',message:'Key color determined',data:{keyColorArray,roomId,keyColorProvided:!!keyColor},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
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
        
        // Create key sprite with color
        const k = add([
            sprite("key"), pos(pos), anchor("center"), area(), z(5), scale(1), 
            color(keyColorArray[0], keyColorArray[1], keyColorArray[2]), "key",
            { roomId, keyColor: keyColorArray } // Store room ID and color
        ]);
        
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
        add([
            circle(25), pos(pos), color(keyColorArray[0], keyColorArray[1], keyColorArray[2]), opacity(0.3), anchor("center"), z(4), "keyPart"
        ]);
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/cfda9218-06fc-4cdd-8ace-380746c59fe7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'keysDoors.js:spawnKey:SUCCESS',message:'Key spawned successfully',data:{roomId,keyColorArray,position:{x:pos.x,y:pos.y}},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
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
        fetch('http://127.0.0.1:7242/ingest/cfda9218-06fc-4cdd-8ace-380746c59fe7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'keysDoors.js:spawnKey:EXCEPTION',message:'Exception in spawnKey',data:{error:error.message,stack:error.stack,position,roomId,keyColor},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
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
    fetch('http://127.0.0.1:7242/ingest/cfda9218-06fc-4cdd-8ace-380746c59fe7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'keysDoors.js:checkAllKeysCollected:ENTRY',message:'Checking all keys collected',data:{dungeon:!!dungeon,collectedKeys:GS.collectedKeys},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
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
    fetch('http://127.0.0.1:7242/ingest/cfda9218-06fc-4cdd-8ace-380746c59fe7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'keysDoors.js:checkAllKeysCollected:ROOMS',message:'Required rooms calculated',data:{totalRooms:allRooms.length,requiredRooms:requiredRooms.length,requiredRoomIds:requiredRooms.map(r=>r.id),collectedKeys:GS.collectedKeys},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
    // Check if all required rooms have their keys collected
    const allCollected = requiredRooms.length > 0 && requiredRooms.every(room => {
        const hasKey = GS.collectedKeys.includes(room.id);
        // #region agent log
        if (!hasKey) {
            fetch('http://127.0.0.1:7242/ingest/cfda9218-06fc-4cdd-8ace-380746c59fe7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'keysDoors.js:checkAllKeysCollected:MISSING',message:'Missing key for room',data:{roomId:room.id,roomType:room.type,collectedKeys:GS.collectedKeys},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        }
        // #endregion
        return hasKey;
    });
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cfda9218-06fc-4cdd-8ace-380746c59fe7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'keysDoors.js:checkAllKeysCollected:RESULT',message:'All keys check result',data:{allCollected,requiredCount:requiredRooms.length,collectedCount:GS.collectedKeys.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
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
    fetch('http://127.0.0.1:7242/ingest/cfda9218-06fc-4cdd-8ace-380746c59fe7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'keysDoors.js:collectKey:ENTRY',message:'Key collection started',data:{keyObj:!!keyObj,roomId:keyObj?.roomId,collectedKeys:GS.collectedKeys},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    try {
        const roomId = keyObj.roomId;
        if (roomId === undefined || roomId === null) {
            Logger.warn('Key without roomId!', { key: keyObj });
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/cfda9218-06fc-4cdd-8ace-380746c59fe7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'keysDoors.js:collectKey:ERROR',message:'Key missing roomId',data:{keyObj},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
            // #endregion
            return;
        }
        
        // Check if already collected
        if (GS.collectedKeys.includes(roomId)) {
            Logger.debug('Key already collected', { roomId });
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/cfda9218-06fc-4cdd-8ace-380746c59fe7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'keysDoors.js:collectKey:DUPLICATE',message:'Key already collected',data:{roomId,collectedKeys:GS.collectedKeys},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
            // #endregion
            return;
        }
        
        Logger.info('Key collected!', { roomId, totalKeys: GS.collectedKeys.length + 1 });
        GS.collectedKeys.push(roomId);
        GS.hasKey = true; // Legacy compatibility
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/cfda9218-06fc-4cdd-8ace-380746c59fe7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'keysDoors.js:collectKey:ADDED',message:'Key added to collection',data:{roomId,newCollectedKeys:GS.collectedKeys},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
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
        fetch('http://127.0.0.1:7242/ingest/cfda9218-06fc-4cdd-8ace-380746c59fe7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'keysDoors.js:collectKey:SUCCESS',message:'Key collection complete',data:{roomId,allKeysCollected,collectedKeys:GS.collectedKeys},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
    } catch (error) {
        Logger.error('Key collection error', { 
            error: error.message,
            stack: error.stack,
            keyObj
        });
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/cfda9218-06fc-4cdd-8ace-380746c59fe7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'keysDoors.js:collectKey:EXCEPTION',message:'Exception in collectKey',data:{error:error.message,stack:error.stack,keyObj},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
    }
}

// ==================== DOOR SYSTEM ====================

/**
 * Update boss door visuals based on key collection status
 */
export function updateBossDoorVisuals(doors, doorTexts, allKeysCollected) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cfda9218-06fc-4cdd-8ace-380746c59fe7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'keysDoors.js:updateBossDoorVisuals:ENTRY',message:'Updating boss door visuals',data:{allKeysCollected,doorsCount:doors.length,doorTextsCount:doorTexts.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
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
    fetch('http://127.0.0.1:7242/ingest/cfda9218-06fc-4cdd-8ace-380746c59fe7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'keysDoors.js:updateBossDoorVisuals:SUCCESS',message:'Boss door visuals updated',data:{allKeysCollected},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
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
    fetch('http://127.0.0.1:7242/ingest/cfda9218-06fc-4cdd-8ace-380746c59fe7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'keysDoors.js:canEnterDoor:ENTRY',message:'Checking door access',data:{targetRoomId:targetRoom?.id,targetRoomType:targetRoom?.type,currentRoomId:currentRoom?.id,currentRoomCleared:currentRoom?.cleared},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    
    if (!targetRoom || !currentRoom) {
        return { canEnter: false, reason: 'Invalid room data' };
    }
    
    const isBossDoor = targetRoom.type === ROOM_TYPES.BOSS;
    const allKeysCollected = checkAllKeysCollected(dungeon);
    const canEnter = isBossDoor ? allKeysCollected : currentRoom.cleared;
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cfda9218-06fc-4cdd-8ace-380746c59fe7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'keysDoors.js:canEnterDoor:RESULT',message:'Door access check result',data:{canEnter,isBossDoor,allKeysCollected,currentRoomCleared:currentRoom.cleared},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
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

