// ==================== ROOM SYSTEM ====================
// Levels consist of multiple rooms connected by doors
// Player must clear each room to unlock doors

export const ROOM_TYPES = {
    START: 'start',       // Starting room - no enemies
    COMBAT: 'combat',     // Regular enemies
    ELITE: 'elite',       // Harder enemies  
    TREASURE: 'treasure', // Gold/items
    BOSS: 'boss',         // Boss room
};

// Room templates - defines layout and connections
export const ROOM_LAYOUTS = {
    // Simple 2-room level (Level 1)
    simple: {
        rooms: [
            { id: 0, type: ROOM_TYPES.START, x: 0, y: 0, width: 800, height: 600, enemies: 5, doors: [{ to: 1, side: 'right' }] },
            { id: 1, type: ROOM_TYPES.BOSS, x: 800, y: 0, width: 800, height: 600, enemies: 0, doors: [{ to: 0, side: 'left' }] },
        ],
        startRoom: 0,
        bossRoom: 1,
    },
    
    // 3-room linear (Level 2-3)
    linear: {
        rooms: [
            { id: 0, type: ROOM_TYPES.START, x: 0, y: 0, enemies: 3, doors: [{ to: 1, side: 'right' }] },
            { id: 1, type: ROOM_TYPES.COMBAT, x: 1, y: 0, enemies: 4, doors: [{ to: 0, side: 'left' }, { to: 2, side: 'right' }] },
            { id: 2, type: ROOM_TYPES.BOSS, x: 2, y: 0, enemies: 0, doors: [{ to: 1, side: 'left' }] },
        ],
        startRoom: 0,
        bossRoom: 2,
    },
    
    // T-shape (Level 4-5) - choice of paths
    tshape: {
        rooms: [
            { id: 0, type: ROOM_TYPES.START, x: 0, y: 1, enemies: 2, doors: [{ to: 1, side: 'right' }] },
            { id: 1, type: ROOM_TYPES.COMBAT, x: 1, y: 1, enemies: 4, doors: [{ to: 0, side: 'left' }, { to: 2, side: 'up' }, { to: 3, side: 'down' }] },
            { id: 2, type: ROOM_TYPES.TREASURE, x: 1, y: 0, enemies: 0, doors: [{ to: 1, side: 'down' }] },
            { id: 3, type: ROOM_TYPES.BOSS, x: 1, y: 2, enemies: 0, doors: [{ to: 1, side: 'up' }] },
        ],
        startRoom: 0,
        bossRoom: 3,
    },
    
    // Complex (Level 6-7) - multiple paths
    complex: {
        rooms: [
            { id: 0, type: ROOM_TYPES.START, x: 0, y: 1, enemies: 2, doors: [{ to: 1, side: 'right' }] },
            { id: 1, type: ROOM_TYPES.COMBAT, x: 1, y: 1, enemies: 3, doors: [{ to: 0, side: 'left' }, { to: 2, side: 'up' }, { to: 3, side: 'right' }] },
            { id: 2, type: ROOM_TYPES.ELITE, x: 1, y: 0, enemies: 4, doors: [{ to: 1, side: 'down' }, { to: 4, side: 'right' }] },
            { id: 3, type: ROOM_TYPES.COMBAT, x: 2, y: 1, enemies: 3, doors: [{ to: 1, side: 'left' }, { to: 4, side: 'up' }] },
            { id: 4, type: ROOM_TYPES.BOSS, x: 2, y: 0, enemies: 0, doors: [{ to: 2, side: 'left' }, { to: 3, side: 'down' }] },
        ],
        startRoom: 0,
        bossRoom: 4,
    },
};

// Get layout for a level
export function getLayoutForLevel(level) {
    if (level <= 1) return ROOM_LAYOUTS.simple;
    if (level <= 3) return ROOM_LAYOUTS.linear;
    if (level <= 5) return ROOM_LAYOUTS.tshape;
    return ROOM_LAYOUTS.complex;
}

// Room state manager
export class RoomManager {
    constructor(layout, levelConfig) {
        this.layout = layout;
        this.levelConfig = levelConfig;
        this.currentRoomId = layout.startRoom;
        this.roomStates = {};
        
        // Initialize room states
        layout.rooms.forEach(room => {
            this.roomStates[room.id] = {
                cleared: room.type === ROOM_TYPES.START || room.type === ROOM_TYPES.TREASURE,
                visited: room.id === layout.startRoom,
                enemiesKilled: 0,
                doorsUnlocked: room.type === ROOM_TYPES.START,
            };
        });
    }
    
    getCurrentRoom() {
        return this.layout.rooms.find(r => r.id === this.currentRoomId);
    }
    
    getRoomState(roomId) {
        return this.roomStates[roomId];
    }
    
    isRoomCleared(roomId) {
        return this.roomStates[roomId]?.cleared || false;
    }
    
    clearCurrentRoom() {
        const state = this.roomStates[this.currentRoomId];
        state.cleared = true;
        state.doorsUnlocked = true;
    }
    
    canEnterRoom(roomId) {
        const currentRoom = this.getCurrentRoom();
        const door = currentRoom.doors.find(d => d.to === roomId);
        if (!door) return false;
        
        // Must clear current room to use doors
        return this.isRoomCleared(this.currentRoomId);
    }
    
    enterRoom(roomId) {
        if (!this.canEnterRoom(roomId)) return false;
        
        this.currentRoomId = roomId;
        this.roomStates[roomId].visited = true;
        return true;
    }
    
    isBossRoom() {
        return this.currentRoomId === this.layout.bossRoom;
    }
    
    getProgress() {
        const total = this.layout.rooms.length;
        const cleared = Object.values(this.roomStates).filter(s => s.cleared).length;
        return { cleared, total };
    }
}

export default { ROOM_TYPES, ROOM_LAYOUTS, getLayoutForLevel, RoomManager };


