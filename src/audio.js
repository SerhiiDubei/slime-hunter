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
        }
    } catch(e) {}
}

export default { initAudio, playSound };

