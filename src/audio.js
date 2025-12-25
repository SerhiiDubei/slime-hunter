// ==================== AUDIO SYSTEM ====================
// Web Audio API sound effects

let audioCtx = null;

export function initAudio() {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
    } catch(e) { return null; }
}

export function playSound(type) {
    try {
        const ctx = initAudio();
        if (!ctx) return;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        const t = ctx.currentTime;
        
        switch(type) {
            case 'attack':
                osc.frequency.setValueAtTime(300, t);
                osc.frequency.exponentialRampToValueAtTime(150, t + 0.1);
                gain.gain.setValueAtTime(0.3, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
                osc.type = 'square';
                osc.start(t); osc.stop(t + 0.1);
                break;
            case 'ranged':
                osc.frequency.setValueAtTime(600, t);
                osc.frequency.exponentialRampToValueAtTime(400, t + 0.15);
                gain.gain.setValueAtTime(0.25, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
                osc.type = 'sine';
                osc.start(t); osc.stop(t + 0.15);
                break;
            case 'hit':
                osc.frequency.setValueAtTime(200, t);
                osc.frequency.exponentialRampToValueAtTime(100, t + 0.15);
                gain.gain.setValueAtTime(0.2, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
                osc.type = 'sawtooth';
                osc.start(t); osc.stop(t + 0.15);
                break;
            case 'kill':
                osc.frequency.setValueAtTime(400, t);
                osc.frequency.exponentialRampToValueAtTime(800, t + 0.1);
                gain.gain.setValueAtTime(0.2, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
                osc.type = 'sine';
                osc.start(t); osc.stop(t + 0.2);
                break;
            case 'boss':
                osc.frequency.setValueAtTime(100, t);
                osc.frequency.exponentialRampToValueAtTime(300, t + 0.3);
                gain.gain.setValueAtTime(0.4, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
                osc.type = 'sawtooth';
                osc.start(t); osc.stop(t + 0.4);
                break;
            case 'key':
                osc.frequency.setValueAtTime(500, t);
                osc.frequency.exponentialRampToValueAtTime(800, t + 0.15);
                gain.gain.setValueAtTime(0.3, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
                osc.type = 'sine';
                osc.start(t); osc.stop(t + 0.2);
                break;
            case 'door':
                osc.frequency.setValueAtTime(200, t);
                osc.frequency.exponentialRampToValueAtTime(400, t + 0.2);
                gain.gain.setValueAtTime(0.3, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
                osc.type = 'triangle';
                osc.start(t); osc.stop(t + 0.3);
                break;
            case 'levelup':
                osc.frequency.setValueAtTime(400, t);
                osc.frequency.exponentialRampToValueAtTime(800, t + 0.2);
                osc.frequency.exponentialRampToValueAtTime(1000, t + 0.3);
                gain.gain.setValueAtTime(0.3, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
                osc.type = 'sine';
                osc.start(t); osc.stop(t + 0.4);
                break;
            case 'start':
                osc.frequency.setValueAtTime(200, t);
                osc.frequency.exponentialRampToValueAtTime(600, t + 0.15);
                gain.gain.setValueAtTime(0.2, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
                osc.type = 'sine';
                osc.start(t); osc.stop(t + 0.2);
                break;
            case 'gameover':
                osc.frequency.setValueAtTime(400, t);
                osc.frequency.exponentialRampToValueAtTime(100, t + 0.5);
                gain.gain.setValueAtTime(0.3, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
                osc.type = 'sawtooth';
                osc.start(t); osc.stop(t + 0.5);
                break;
            
            // ========== MELEE ATTACK SOUNDS ==========
            case 'melee_sword':  // Warrior - heavy sword slash
                osc.frequency.setValueAtTime(250, t);
                osc.frequency.exponentialRampToValueAtTime(120, t + 0.15);
                gain.gain.setValueAtTime(0.4, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
                osc.type = 'square';
                osc.start(t); osc.stop(t + 0.15);
                break;
            case 'melee_dagger':  // Assassin - quick dagger swipe
                osc.frequency.setValueAtTime(400, t);
                osc.frequency.exponentialRampToValueAtTime(200, t + 0.08);
                gain.gain.setValueAtTime(0.25, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
                osc.type = 'sawtooth';
                osc.start(t); osc.stop(t + 0.08);
                break;
            case 'melee_weak':  // Mage/Ranger - weak melee
                osc.frequency.setValueAtTime(200, t);
                osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
                gain.gain.setValueAtTime(0.15, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
                osc.type = 'sine';
                osc.start(t); osc.stop(t + 0.1);
                break;
            
            // ========== RANGED ATTACK SOUNDS ==========
            case 'ranged_axe':  // Warrior - heavy spinning axe
                osc.frequency.setValueAtTime(180, t);
                osc.frequency.exponentialRampToValueAtTime(100, t + 0.2);
                gain.gain.setValueAtTime(0.35, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
                osc.type = 'sawtooth';
                osc.start(t); osc.stop(t + 0.2);
                // Add whoosh effect
                const whoosh = ctx.createOscillator();
                const whooshGain = ctx.createGain();
                whoosh.connect(whooshGain);
                whooshGain.connect(ctx.destination);
                whoosh.frequency.setValueAtTime(80, t);
                whoosh.frequency.exponentialRampToValueAtTime(60, t + 0.2);
                whooshGain.gain.setValueAtTime(0.15, t);
                whooshGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
                whoosh.type = 'sine';
                whoosh.start(t); whoosh.stop(t + 0.2);
                break;
            case 'ranged_orb':  // Mage - magic bolt
                osc.frequency.setValueAtTime(800, t);
                osc.frequency.exponentialRampToValueAtTime(500, t + 0.12);
                gain.gain.setValueAtTime(0.3, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
                osc.type = 'sine';
                osc.start(t); osc.stop(t + 0.12);
                // Add magic sparkle
                const sparkle = ctx.createOscillator();
                const sparkleGain = ctx.createGain();
                sparkle.connect(sparkleGain);
                sparkleGain.connect(ctx.destination);
                sparkle.frequency.setValueAtTime(1200, t);
                sparkle.frequency.exponentialRampToValueAtTime(800, t + 0.08);
                sparkleGain.gain.setValueAtTime(0.2, t);
                sparkleGain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
                sparkle.type = 'sine';
                sparkle.start(t); sparkle.stop(t + 0.08);
                break;
            case 'ranged_dagger':  // Assassin - throwing dagger
                osc.frequency.setValueAtTime(600, t);
                osc.frequency.exponentialRampToValueAtTime(400, t + 0.1);
                gain.gain.setValueAtTime(0.25, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
                osc.type = 'square';
                osc.start(t); osc.stop(t + 0.1);
                break;
            case 'ranged_arrow':  // Ranger - bow shot
                osc.frequency.setValueAtTime(500, t);
                osc.frequency.exponentialRampToValueAtTime(350, t + 0.1);
                gain.gain.setValueAtTime(0.3, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
                osc.type = 'sine';
                osc.start(t); osc.stop(t + 0.1);
                // Add bow string sound
                const bow = ctx.createOscillator();
                const bowGain = ctx.createGain();
                bow.connect(bowGain);
                bowGain.connect(ctx.destination);
                bow.frequency.setValueAtTime(200, t);
                bow.frequency.exponentialRampToValueAtTime(150, t + 0.15);
                bowGain.gain.setValueAtTime(0.15, t);
                bowGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
                bow.type = 'triangle';
                bow.start(t); bow.stop(t + 0.15);
                break;
            
            // ========== ABILITY SOUNDS ==========
            case 'ability_shield':  // Warrior Shield Bash
                osc.frequency.setValueAtTime(150, t);
                osc.frequency.exponentialRampToValueAtTime(80, t + 0.2);
                gain.gain.setValueAtTime(0.4, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
                osc.type = 'square';
                osc.start(t); osc.stop(t + 0.2);
                break;
            case 'ability_ice':  // Mage Ice Shard
                osc.frequency.setValueAtTime(700, t);
                osc.frequency.exponentialRampToValueAtTime(400, t + 0.15);
                gain.gain.setValueAtTime(0.3, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
                osc.type = 'sine';
                osc.start(t); osc.stop(t + 0.15);
                break;
            case 'ability_smoke':  // Assassin Smoke Bomb
                osc.frequency.setValueAtTime(300, t);
                osc.frequency.exponentialRampToValueAtTime(200, t + 0.2);
                gain.gain.setValueAtTime(0.25, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
                osc.type = 'sawtooth';
                osc.start(t); osc.stop(t + 0.2);
                break;
            case 'ability_multishot':  // Ranger Multi-Shot
                osc.frequency.setValueAtTime(600, t);
                osc.frequency.exponentialRampToValueAtTime(400, t + 0.12);
                gain.gain.setValueAtTime(0.3, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
                osc.type = 'sine';
                osc.start(t); osc.stop(t + 0.12);
                break;
            case 'ability_teleport':  // Wizard Teleport
                osc.frequency.setValueAtTime(800, t);
                osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
                gain.gain.setValueAtTime(0.3, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
                osc.type = 'sine';
                osc.start(t); osc.stop(t + 0.1);
                break;
            
            // ========== ULTIMATE SOUNDS ==========
            case 'ultimate_earthquake':  // Warrior
                osc.frequency.setValueAtTime(80, t);
                osc.frequency.exponentialRampToValueAtTime(40, t + 0.4);
                gain.gain.setValueAtTime(0.5, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
                osc.type = 'sawtooth';
                osc.start(t); osc.stop(t + 0.4);
                break;
            case 'ultimate_meteor':  // Mage
                osc.frequency.setValueAtTime(200, t);
                osc.frequency.exponentialRampToValueAtTime(600, t + 0.3);
                gain.gain.setValueAtTime(0.4, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
                osc.type = 'sine';
                osc.start(t); osc.stop(t + 0.3);
                break;
            case 'ultimate_shadow':  // Assassin
                osc.frequency.setValueAtTime(400, t);
                osc.frequency.exponentialRampToValueAtTime(800, t + 0.2);
                gain.gain.setValueAtTime(0.35, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
                osc.type = 'square';
                osc.start(t); osc.stop(t + 0.2);
                break;
            case 'ultimate_arrowstorm':  // Ranger
                osc.frequency.setValueAtTime(500, t);
                osc.frequency.exponentialRampToValueAtTime(300, t + 0.25);
                gain.gain.setValueAtTime(0.4, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
                osc.type = 'sine';
                osc.start(t); osc.stop(t + 0.25);
                break;
            case 'ultimate_arcane':  // Wizard Arcane Storm
                osc.frequency.setValueAtTime(200, t);
                osc.frequency.exponentialRampToValueAtTime(600, t + 0.3);
                gain.gain.setValueAtTime(0.4, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
                osc.type = 'sine';
                osc.start(t); osc.stop(t + 0.3);
                break;
            
            // ========== OTHER SOUNDS ==========
            case 'poison':  // Poison damage tick
                osc.frequency.setValueAtTime(300, t);
                osc.frequency.exponentialRampToValueAtTime(200, t + 0.1);
                gain.gain.setValueAtTime(0.15, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
                osc.type = 'sawtooth';
                osc.start(t); osc.stop(t + 0.1);
                break;
            case 'freeze':  // Freeze effect
                osc.frequency.setValueAtTime(400, t);
                osc.frequency.exponentialRampToValueAtTime(200, t + 0.15);
                gain.gain.setValueAtTime(0.2, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
                osc.type = 'sine';
                osc.start(t); osc.stop(t + 0.15);
                break;
            case 'stun':  // Stun effect
                osc.frequency.setValueAtTime(250, t);
                osc.frequency.exponentialRampToValueAtTime(150, t + 0.12);
                gain.gain.setValueAtTime(0.2, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
                osc.type = 'square';
                osc.start(t); osc.stop(t + 0.12);
                break;
        }
    } catch(e) {}
}

export default { initAudio, playSound };

