// ==================== DUNGEON MAP SYSTEM ====================
// Diablo/Enter the Gungeon style procedural map generation
// Each level has a pre-generated connected room layout

export const ROOM_TYPES = {
    START: 'start',       // Starting room - no enemies
    COMBAT: 'combat',     // Regular enemies
    ELITE: 'elite',       // Harder enemies (higher tier spawn)
    TREASURE: 'treasure', // Gold/items only
    BOSS: 'boss',         // Boss room (always last)
};

// Direction helpers
export const DIRECTIONS = {
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right',
};

const OPPOSITE = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left',
};

// Generate a random dungeon map for a level
export function generateDungeonMap(level) {
    const roomCount = getRoomCountForLevel(level);
    const rooms = [];
    const grid = {}; // { "x,y": roomId }
    
    // Start room at origin
    const startRoom = {
        id: 0,
        type: ROOM_TYPES.START,
        x: 0,
        y: 0,
        doors: [],
        enemies: 0,
        cleared: true,
        visited: true,
    };
    rooms.push(startRoom);
    grid["0,0"] = 0;
    
    // Generate connected rooms using random walk
    let currentX = 0;
    let currentY = 0;
    let attempts = 0;
    const maxAttempts = 100;
    
    while (rooms.length < roomCount && attempts < maxAttempts) {
        attempts++;
        
        // Pick random direction
        const dirs = ['up', 'down', 'left', 'right'];
        const dir = dirs[Math.floor(Math.random() * dirs.length)];
        
        let newX = currentX;
        let newY = currentY;
        
        if (dir === 'up') newY--;
        else if (dir === 'down') newY++;
        else if (dir === 'left') newX--;
        else if (dir === 'right') newX++;
        
        const key = `${newX},${newY}`;
        
        // Check if space is free
        if (grid[key] === undefined) {
            const fromRoom = rooms.find(r => r.x === currentX && r.y === currentY);
            
            // Determine room type
            let roomType;
            if (rooms.length === roomCount - 1) {
                roomType = ROOM_TYPES.BOSS;
            } else if (rooms.length >= 2 && Math.random() < 0.15) {
                roomType = ROOM_TYPES.TREASURE;
            } else if (level >= 3 && Math.random() < 0.2) {
                roomType = ROOM_TYPES.ELITE;
            } else {
                roomType = ROOM_TYPES.COMBAT;
            }
            
            // Enemy count based on room type and level
            let enemies = 0;
            if (roomType === ROOM_TYPES.COMBAT) {
                enemies = 5 + level * 2 + Math.floor(Math.random() * 3);
            } else if (roomType === ROOM_TYPES.ELITE) {
                enemies = 4 + level + Math.floor(Math.random() * 2);
            }
            
            const newRoom = {
                id: rooms.length,
                type: roomType,
                x: newX,
                y: newY,
                doors: [{ to: fromRoom.id, side: OPPOSITE[dir] }],
                enemies,
                cleared: roomType === ROOM_TYPES.START || roomType === ROOM_TYPES.TREASURE,
                visited: false,
            };
            
            // Add door connection to parent room
            fromRoom.doors.push({ to: newRoom.id, side: dir });
            
            rooms.push(newRoom);
            grid[key] = newRoom.id;
            
            // Move to new position or stay (50% chance to branch)
            if (Math.random() > 0.5 || roomType === ROOM_TYPES.BOSS) {
                currentX = newX;
                currentY = newY;
            }
        } else {
            // Space taken, try to connect if not already connected
            const existingRoomId = grid[key];
            const fromRoom = rooms.find(r => r.x === currentX && r.y === currentY);
            const toRoom = rooms[existingRoomId];
            
            // Check if already connected
            const alreadyConnected = fromRoom.doors.some(d => d.to === existingRoomId);
            
            // 30% chance to add extra connection (creates loops)
            if (!alreadyConnected && Math.random() < 0.3) {
                fromRoom.doors.push({ to: existingRoomId, side: dir });
                toRoom.doors.push({ to: fromRoom.id, side: OPPOSITE[dir] });
            }
            
            // Move to this room
            currentX = newX;
            currentY = newY;
        }
    }
    
    // Ensure boss room is at the end of a path (farthest from start)
    const bossRoom = rooms.find(r => r.type === ROOM_TYPES.BOSS);
    if (!bossRoom) {
        // If no boss room was created, convert the farthest room
        let farthest = rooms[rooms.length - 1];
        farthest.type = ROOM_TYPES.BOSS;
        farthest.enemies = 0;
    }
    
    return {
        rooms,
        startRoomId: 0,
        bossRoomId: rooms.find(r => r.type === ROOM_TYPES.BOSS).id,
        grid,
    };
}

// Get room count for level
function getRoomCountForLevel(level) {
    if (level <= 1) return 3;   // 3 rooms
    if (level <= 2) return 4;   // 4 rooms
    if (level <= 4) return 5;   // 5 rooms
    if (level <= 6) return 6;   // 6 rooms
    return 7;                    // 7 rooms for final level
}

// Dungeon state manager
export class DungeonManager {
    constructor(level, savedState = null) {
        this.level = level;
        this.map = generateDungeonMap(level);
        
        // Restore saved state if provided
        if (savedState && savedState.currentRoomId !== undefined) {
            const savedRoom = this.map.rooms.find(r => r.id === savedState.currentRoomId);
            if (savedRoom) {
                this.currentRoomId = savedState.currentRoomId;
                // Restore room states
                if (savedState.rooms) {
                    savedState.rooms.forEach(savedRoomState => {
                        const room = this.map.rooms.find(r => r.id === savedRoomState.id);
                        if (room) {
                            room.cleared = savedRoomState.cleared || false;
                            room.visited = savedRoomState.visited || false;
                        }
                    });
                }
            } else {
                this.currentRoomId = this.map.startRoomId;
            }
        } else {
            this.currentRoomId = this.map.startRoomId;
        }
    }
    
    // Get state for saving
    getState() {
        return {
            level: this.level,
            currentRoomId: this.currentRoomId,
            rooms: this.map.rooms.map(r => ({
                id: r.id,
                cleared: r.cleared,
                visited: r.visited
            }))
        };
    }
    
    getCurrentRoom() {
        return this.map.rooms.find(r => r.id === this.currentRoomId);
    }
    
    getRoom(roomId) {
        return this.map.rooms.find(r => r.id === roomId);
    }
    
    isRoomCleared(roomId) {
        const room = this.getRoom(roomId);
        return room ? room.cleared : false;
    }
    
    clearCurrentRoom() {
        const room = this.getCurrentRoom();
        if (room) {
            room.cleared = true;
        }
    }
    
    canEnterRoom(roomId) {
        const currentRoom = this.getCurrentRoom();
        const door = currentRoom.doors.find(d => d.to === roomId);
        if (!door) return false;
        
        // Must clear current room to leave
        return currentRoom.cleared;
    }
    
    enterRoom(roomId) {
        if (!this.canEnterRoom(roomId)) return false;
        
        const room = this.getRoom(roomId);
        if (room) {
            this.currentRoomId = roomId;
            room.visited = true;
        }
        return true;
    }
    
    getEntryDirection(fromRoomId) {
        const currentRoom = this.getCurrentRoom();
        const door = currentRoom.doors.find(d => d.to === fromRoomId);
        return door ? door.side : 'left';
    }
    
    isBossRoom() {
        return this.currentRoomId === this.map.bossRoomId;
    }
    
    getProgress() {
        const total = this.map.rooms.length;
        const cleared = this.map.rooms.filter(r => r.cleared).length;
        const visited = this.map.rooms.filter(r => r.visited).length;
        return { cleared, visited, total };
    }
    
    getAllRooms() {
        return this.map.rooms;
    }
    
    // Get adjacent rooms to current
    getAdjacentRooms() {
        const current = this.getCurrentRoom();
        return current.doors.map(d => ({
            room: this.getRoom(d.to),
            direction: d.side,
            canEnter: current.cleared,
        }));
    }
}

// Legacy exports for compatibility
export const ROOM_LAYOUTS = {
    simple: {
        rooms: [
            { id: 0, type: ROOM_TYPES.START, x: 0, y: 0, enemies: 5, doors: [{ to: 1, side: 'right' }] },
            { id: 1, type: ROOM_TYPES.BOSS, x: 1, y: 0, enemies: 0, doors: [{ to: 0, side: 'left' }] },
        ],
        startRoom: 0,
        bossRoom: 1,
    },
};

export function getLayoutForLevel(level) {
    return ROOM_LAYOUTS.simple;
}

export class RoomManager {
    constructor(layout, levelConfig) {
        this.dungeon = new DungeonManager(levelConfig?.id || 1);
    }
    
    getCurrentRoom() {
        return this.dungeon.getCurrentRoom();
    }
    
    isRoomCleared(roomId) {
        return this.dungeon.isRoomCleared(roomId);
    }
    
    clearCurrentRoom() {
        this.dungeon.clearCurrentRoom();
    }
    
    canEnterRoom(roomId) {
        return this.dungeon.canEnterRoom(roomId);
    }
    
    enterRoom(roomId) {
        return this.dungeon.enterRoom(roomId);
    }
    
    isBossRoom() {
        return this.dungeon.isBossRoom();
    }
    
    getProgress() {
        return this.dungeon.getProgress();
    }
}

export default { 
    ROOM_TYPES, 
    DIRECTIONS,
    ROOM_LAYOUTS, 
    getLayoutForLevel, 
    RoomManager,
    DungeonManager,
    generateDungeonMap,
};
