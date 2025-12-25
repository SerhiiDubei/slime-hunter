// ==================== UTILITY FUNCTIONS ====================

import { CONFIG } from './config.js';
import { GS } from './state.js';

export function clamp(v, min, max) { 
    return Math.max(min, Math.min(max, v)); 
}

// Check if position is walkable (not a wall or pillar)
export function isWalkable(pos) {
    if (!GS.roomShape || !GS.roomShape.grid) return true; // Fallback if no room shape
    
    const gx = Math.floor(pos.x / 40);
    const gy = Math.floor(pos.y / 40);
    
    if (gx < 0 || gx >= GS.roomShape.width || gy < 0 || gy >= GS.roomShape.height) {
        return false; // Out of bounds
    }
    
    const tileType = GS.roomShape.grid[gy][gx];
    return tileType === 1; // Only floor tiles (1) are walkable, walls (0) and pillars (2) are not
}

export function getSpawnPos() {
    let p, attempts = 0;
    do {
        p = vec2(rand(80, CONFIG.MAP_WIDTH - 80), rand(80, CONFIG.MAP_HEIGHT - 80));
        attempts++;
        
        // Check if position is walkable and far from player
        const isWalkablePos = isWalkable(p);
        const farFromPlayer = !GS.player || p.dist(GS.player.pos) >= 150;
        
        if (isWalkablePos && farFromPlayer) {
            return p;
        }
    } while (attempts < 50); // More attempts to find valid position
    
    // Fallback: return center if all attempts failed
    return vec2(CONFIG.MAP_WIDTH / 2, CONFIG.MAP_HEIGHT / 2);
}

// Choose random element from array
export function choose(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

export default { clamp, getSpawnPos, choose, isWalkable };

