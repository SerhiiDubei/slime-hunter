// ==================== UTILITY FUNCTIONS ====================

import { CONFIG } from './config.js';
import { GS } from './state.js';

export function clamp(v, min, max) { 
    return Math.max(min, Math.min(max, v)); 
}

export function getSpawnPos() {
    let p, attempts = 0;
    do {
        p = vec2(rand(80, CONFIG.MAP_WIDTH - 80), rand(80, CONFIG.MAP_HEIGHT - 80));
        attempts++;
    } while (GS.player && p.dist(GS.player.pos) < 150 && attempts < 20);
    return p;
}

// Choose random element from array
export function choose(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export default { clamp, getSpawnPos, choose };

