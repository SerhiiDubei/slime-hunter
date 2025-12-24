// ==================== SPRITE GENERATION ====================
// All game sprites generated via Canvas API

function createCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return { canvas: c, ctx: c.getContext('2d') };
}

// ==================== ANIMATED PLAYER SPRITES ====================

// Warrior - Armored knight with sword (4 frames)
function makeWarriorFrames() {
    const frames = [];
    for (let f = 0; f < 4; f++) {
        const { canvas, ctx } = createCanvas(36, 36);
        const bounce = Math.sin(f * Math.PI / 2) * 2;
        const legOffset = f % 2 === 0 ? 0 : 3;
        
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(18, 33, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Legs (animated)
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(12 - legOffset, 24, 5, 8);
        ctx.fillRect(19 + legOffset, 24, 5, 8);
        
        // Body - armor
        const bodyGrad = ctx.createLinearGradient(8, 10, 28, 28);
        bodyGrad.addColorStop(0, '#636e72');
        bodyGrad.addColorStop(0.5, '#b2bec3');
        bodyGrad.addColorStop(1, '#636e72');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.roundRect(8, 10 - bounce, 20, 16, 3);
        ctx.fill();
        
        // Armor details
        ctx.strokeStyle = '#2d3436';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(18, 12 - bounce);
        ctx.lineTo(18, 24 - bounce);
        ctx.stroke();
        
        // Belt
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(10, 22 - bounce, 16, 3);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(16, 21 - bounce, 4, 5);
        
        // Head
        ctx.fillStyle = '#ffe0bd';
        ctx.beginPath();
        ctx.arc(18, 8 - bounce, 7, 0, Math.PI * 2);
        ctx.fill();
        
        // Helmet
        ctx.fillStyle = '#636e72';
        ctx.beginPath();
        ctx.ellipse(18, 5 - bounce, 8, 5, 0, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(16, 0 - bounce, 4, 6); // Plume
        
        // Eyes
        ctx.fillStyle = '#2d3436';
        ctx.beginPath();
        ctx.arc(15, 7 - bounce, 1.5, 0, Math.PI * 2);
        ctx.arc(21, 7 - bounce, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Sword (animated swing)
        const swordAngle = f * 15 - 20;
        ctx.save();
        ctx.translate(28, 16 - bounce);
        ctx.rotate(swordAngle * Math.PI / 180);
        ctx.fillStyle = '#dfe6e9';
        ctx.fillRect(-2, -12, 4, 18);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(-3, 4, 6, 4);
        ctx.restore();
        
        // Shield
        ctx.fillStyle = '#636e72';
        ctx.beginPath();
        ctx.ellipse(6, 18 - bounce, 5, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(6, 12 - bounce);
        ctx.lineTo(10, 18 - bounce);
        ctx.lineTo(6, 24 - bounce);
        ctx.lineTo(2, 18 - bounce);
        ctx.closePath();
        ctx.fill();
        
        frames.push(canvas.toDataURL());
    }
    return frames;
}

// Mage - Robed wizard with staff (4 frames)
function makeMageFrames() {
    const frames = [];
    for (let f = 0; f < 4; f++) {
        const { canvas, ctx } = createCanvas(36, 36);
        const hover = Math.sin(f * Math.PI / 2) * 3;
        const orbPulse = 0.8 + Math.sin(f * Math.PI / 2) * 0.3;
        
        // Shadow (moves with hover)
        ctx.fillStyle = `rgba(0,0,0,${0.3 - hover * 0.02})`;
        ctx.beginPath();
        ctx.ellipse(18, 34, 8 - hover * 0.3, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Staff
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(28, 4 - hover, 3, 28);
        
        // Staff orb
        const orbGrad = ctx.createRadialGradient(29, 6 - hover, 1, 29, 6 - hover, 6 * orbPulse);
        orbGrad.addColorStop(0, '#fff');
        orbGrad.addColorStop(0.3, '#9b59b6');
        orbGrad.addColorStop(1, '#4a235a');
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(29, 6 - hover, 6 * orbPulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Orb glow
        ctx.fillStyle = `rgba(155, 89, 182, ${0.3 * orbPulse})`;
        ctx.beginPath();
        ctx.arc(29, 6 - hover, 10 * orbPulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Robe
        const robeGrad = ctx.createLinearGradient(6, 10, 26, 32);
        robeGrad.addColorStop(0, '#2980b9');
        robeGrad.addColorStop(1, '#1a5276');
        ctx.fillStyle = robeGrad;
        ctx.beginPath();
        ctx.moveTo(10, 10 - hover);
        ctx.lineTo(26, 10 - hover);
        ctx.lineTo(30, 32 - hover);
        ctx.lineTo(6, 32 - hover);
        ctx.closePath();
        ctx.fill();
        
        // Robe details (stars)
        ctx.fillStyle = '#FFD700';
        for (let i = 0; i < 3; i++) {
            const sx = 12 + i * 5;
            const sy = 18 + (i % 2) * 6 - hover;
            ctx.beginPath();
            ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Head
        ctx.fillStyle = '#ffe0bd';
        ctx.beginPath();
        ctx.arc(18, 8 - hover, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Wizard hat
        ctx.fillStyle = '#2980b9';
        ctx.beginPath();
        ctx.moveTo(8, 8 - hover);
        ctx.lineTo(18, -4 - hover);
        ctx.lineTo(28, 8 - hover);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(18, -3 - hover, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Beard
        ctx.fillStyle = '#ecf0f1';
        ctx.beginPath();
        ctx.moveTo(14, 12 - hover);
        ctx.quadraticCurveTo(18, 20 - hover, 22, 12 - hover);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#2d3436';
        ctx.beginPath();
        ctx.arc(15, 7 - hover, 1.2, 0, Math.PI * 2);
        ctx.arc(21, 7 - hover, 1.2, 0, Math.PI * 2);
        ctx.fill();
        
        frames.push(canvas.toDataURL());
    }
    return frames;
}

// Assassin - Hooded rogue with daggers (4 frames)
function makeAssassinFrames() {
    const frames = [];
    for (let f = 0; f < 4; f++) {
        const { canvas, ctx } = createCanvas(36, 36);
        const lean = Math.sin(f * Math.PI / 2) * 2;
        const legOffset = f % 2 === 0 ? 0 : 4;
        
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(18 + lean, 33, 9, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Legs (animated fast)
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(11 - legOffset + lean, 24, 4, 9);
        ctx.fillRect(21 + legOffset + lean, 24, 4, 9);
        
        // Boots
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(10 - legOffset + lean, 30, 6, 4);
        ctx.fillRect(20 + legOffset + lean, 30, 6, 4);
        
        // Body - leather armor
        const bodyGrad = ctx.createLinearGradient(8, 10, 28, 26);
        bodyGrad.addColorStop(0, '#1a1a2e');
        bodyGrad.addColorStop(0.5, '#2d2d44');
        bodyGrad.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.roundRect(9 + lean, 10, 18, 15, 2);
        ctx.fill();
        
        // Belt with pouches
        ctx.fillStyle = '#4a3728';
        ctx.fillRect(10 + lean, 22, 16, 3);
        ctx.fillStyle = '#5d4e37';
        ctx.fillRect(12 + lean, 20, 4, 5);
        ctx.fillRect(20 + lean, 20, 4, 5);
        
        // Hood & head
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.moveTo(8 + lean, 14);
        ctx.quadraticCurveTo(18 + lean, -2, 28 + lean, 14);
        ctx.lineTo(26 + lean, 12);
        ctx.quadraticCurveTo(18 + lean, 4, 10 + lean, 12);
        ctx.closePath();
        ctx.fill();
        
        // Face in shadow
        ctx.fillStyle = '#2d3436';
        ctx.beginPath();
        ctx.arc(18 + lean, 10, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Glowing eyes
        ctx.fillStyle = '#e74c3c';
        ctx.shadowColor = '#e74c3c';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(15 + lean, 9, 1.5, 0, Math.PI * 2);
        ctx.arc(21 + lean, 9, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Daggers (animated)
        const daggerAngle1 = -45 + f * 20;
        const daggerAngle2 = 45 - f * 20;
        
        // Left dagger
        ctx.save();
        ctx.translate(6 + lean, 16);
        ctx.rotate(daggerAngle1 * Math.PI / 180);
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(-1, -10, 2, 12);
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(-2, 0, 4, 3);
        ctx.restore();
        
        // Right dagger
        ctx.save();
        ctx.translate(30 + lean, 16);
        ctx.rotate(daggerAngle2 * Math.PI / 180);
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(-1, -10, 2, 12);
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(-2, 0, 4, 3);
        ctx.restore();
        
        frames.push(canvas.toDataURL());
    }
    return frames;
}

// Default player (used when no specific hero selected) - animated knight
function makePlayer() {
    // Return first frame as static sprite for compatibility
    return makeWarriorFrames()[0];
}

// Generate all hero animation frames
function makeHeroAnimations() {
    return {
        warrior: makeWarriorFrames(),
        mage: makeMageFrames(),
        assassin: makeAssassinFrames()
    };
}

// Slime sprite
function makeSlime() {
    const { canvas, ctx } = createCanvas(28, 28);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(14, 25, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    const grad = ctx.createRadialGradient(14, 14, 2, 14, 14, 14);
    grad.addColorStop(0, '#ff7979');
    grad.addColorStop(1, '#c0392b');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(4, 22);
    ctx.quadraticCurveTo(2, 12, 8, 6);
    ctx.quadraticCurveTo(14, 2, 20, 6);
    ctx.quadraticCurveTo(26, 12, 24, 22);
    ctx.quadraticCurveTo(14, 26, 4, 22);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(10, 12, 4, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(18, 12, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2d3436';
    ctx.beginPath();
    ctx.arc(11, 13, 2, 0, Math.PI * 2);
    ctx.arc(19, 13, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.ellipse(8, 8, 3, 2, -0.5, 0, Math.PI * 2);
    ctx.fill();
    return canvas.toDataURL();
}

// Boss 1: Slime King - Bullet Storm (red with crown)
function makeBossKing() {
    const { canvas, ctx } = createCanvas(52, 52);
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(26, 48, 20, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Body - red
    const grad = ctx.createRadialGradient(26, 28, 4, 26, 28, 24);
    grad.addColorStop(0, '#e74c3c');
    grad.addColorStop(1, '#6c1f1f');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(4, 40);
    ctx.quadraticCurveTo(0, 22, 14, 12);
    ctx.quadraticCurveTo(26, 6, 38, 12);
    ctx.quadraticCurveTo(52, 22, 48, 40);
    ctx.quadraticCurveTo(26, 48, 4, 40);
    ctx.fill();
    // Crown
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.moveTo(12, 14);
    ctx.lineTo(14, 4);
    ctx.lineTo(20, 12);
    ctx.lineTo(26, 2);
    ctx.lineTo(32, 12);
    ctx.lineTo(38, 4);
    ctx.lineTo(40, 14);
    ctx.closePath();
    ctx.fill();
    // Crown gems
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(20, 9, 2, 0, Math.PI * 2);
    ctx.arc(26, 7, 2, 0, Math.PI * 2);
    ctx.arc(32, 9, 2, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(18, 24, 6, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(34, 24, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2d3436';
    ctx.beginPath();
    ctx.arc(19, 26, 3, 0, Math.PI * 2);
    ctx.arc(35, 26, 3, 0, Math.PI * 2);
    ctx.fill();
    // Angry eyebrows
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, 18);
    ctx.lineTo(22, 16);
    ctx.moveTo(42, 18);
    ctx.lineTo(30, 16);
    ctx.stroke();
    // Magic orbs around (bullet storm indicator)
    ctx.fillStyle = '#ff6b6b';
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const ox = 26 + Math.cos(angle) * 22;
        const oy = 26 + Math.sin(angle) * 18;
        ctx.beginPath();
        ctx.arc(ox, oy, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    return canvas.toDataURL();
}

// Boss 2: Speed Demon - Fast boss (cyan/electric)
function makeBossSpeed() {
    const { canvas, ctx } = createCanvas(48, 48);
    // Motion blur effect
    ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.ellipse(20, 26, 16, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(24, 44, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Body - cyan/electric
    const grad = ctx.createRadialGradient(24, 26, 4, 24, 26, 20);
    grad.addColorStop(0, '#00ffff');
    grad.addColorStop(0.5, '#0099cc');
    grad.addColorStop(1, '#006688');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(6, 36);
    ctx.quadraticCurveTo(2, 20, 14, 12);
    ctx.quadraticCurveTo(24, 6, 34, 12);
    ctx.quadraticCurveTo(46, 20, 42, 36);
    ctx.quadraticCurveTo(24, 44, 6, 36);
    ctx.fill();
    // Lightning bolts on body
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, 20);
    ctx.lineTo(14, 26);
    ctx.lineTo(10, 28);
    ctx.lineTo(14, 34);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(38, 20);
    ctx.lineTo(34, 26);
    ctx.lineTo(38, 28);
    ctx.lineTo(34, 34);
    ctx.stroke();
    // Speed lines behind
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 18 + i * 8);
        ctx.lineTo(8, 18 + i * 8);
        ctx.stroke();
    }
    // Eyes - electric glow
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(16, 22, 5, 7, 0, 0, Math.PI * 2);
    ctx.ellipse(32, 22, 5, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(17, 24, 3, 0, Math.PI * 2);
    ctx.arc(33, 24, 3, 0, Math.PI * 2);
    ctx.fill();
    // Spiky top (speed indicator)
    ctx.fillStyle = '#00cccc';
    ctx.beginPath();
    ctx.moveTo(18, 10);
    ctx.lineTo(20, 4);
    ctx.lineTo(24, 8);
    ctx.lineTo(28, 2);
    ctx.lineTo(30, 10);
    ctx.closePath();
    ctx.fill();
    return canvas.toDataURL();
}

// Boss 3: Necromancer - Summons minions (purple/dark)
function makeBossNecro() {
    const { canvas, ctx } = createCanvas(52, 52);
    // Dark aura
    ctx.fillStyle = 'rgba(128, 0, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(26, 28, 26, 0, Math.PI * 2);
    ctx.fill();
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(26, 48, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Body - dark purple
    const grad = ctx.createRadialGradient(26, 28, 4, 26, 28, 22);
    grad.addColorStop(0, '#9b59b6');
    grad.addColorStop(0.6, '#6c3483');
    grad.addColorStop(1, '#1a0a1f');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(6, 40);
    ctx.quadraticCurveTo(2, 22, 14, 12);
    ctx.quadraticCurveTo(26, 6, 38, 12);
    ctx.quadraticCurveTo(50, 22, 46, 40);
    ctx.quadraticCurveTo(26, 48, 6, 40);
    ctx.fill();
    // Hood/cloak top
    ctx.fillStyle = '#1a0a1f';
    ctx.beginPath();
    ctx.moveTo(10, 18);
    ctx.quadraticCurveTo(26, 0, 42, 18);
    ctx.quadraticCurveTo(26, 14, 10, 18);
    ctx.fill();
    // Glowing eyes (sinister)
    ctx.fillStyle = '#00ff00';
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.ellipse(18, 24, 4, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(34, 24, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Skull symbols floating
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '10px Arial';
    ctx.fillText('💀', 4, 16);
    ctx.fillText('💀', 42, 16);
    ctx.fillText('💀', 22, 50);
    // Magic staff orb
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(44, 12, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4a2c6a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(44, 17);
    ctx.lineTo(44, 35);
    ctx.stroke();
    return canvas.toDataURL();
}

// Boss 4: Frost Giant - Ice themed
function makeBossFrost() {
    const { canvas, ctx } = createCanvas(56, 56);
    // Ice aura
    ctx.fillStyle = 'rgba(100, 200, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(28, 28, 28, 0, Math.PI * 2);
    ctx.fill();
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(28, 52, 20, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Body - ice blue
    const grad = ctx.createRadialGradient(28, 30, 4, 28, 30, 24);
    grad.addColorStop(0, '#e0f7ff');
    grad.addColorStop(0.5, '#74b9ff');
    grad.addColorStop(1, '#0984e3');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(6, 44);
    ctx.quadraticCurveTo(2, 24, 16, 12);
    ctx.quadraticCurveTo(28, 6, 40, 12);
    ctx.quadraticCurveTo(54, 24, 50, 44);
    ctx.quadraticCurveTo(28, 52, 6, 44);
    ctx.fill();
    // Ice crystals on top
    ctx.fillStyle = '#a8e6ff';
    ctx.beginPath();
    ctx.moveTo(20, 14); ctx.lineTo(22, 4); ctx.lineTo(24, 14);
    ctx.moveTo(28, 12); ctx.lineTo(28, 0); ctx.lineTo(32, 12);
    ctx.moveTo(34, 14); ctx.lineTo(38, 6); ctx.lineTo(36, 14);
    ctx.fill();
    // Eyes - cold
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(20, 26, 5, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(36, 26, 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#00d4ff';
    ctx.beginPath();
    ctx.arc(21, 28, 3, 0, Math.PI * 2);
    ctx.arc(37, 28, 3, 0, Math.PI * 2);
    ctx.fill();
    // Snowflakes
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        const x = 8 + i * 20, y = 10 + i * 5;
        ctx.beginPath();
        ctx.moveTo(x-3, y); ctx.lineTo(x+3, y);
        ctx.moveTo(x, y-3); ctx.lineTo(x, y+3);
        ctx.stroke();
    }
    return canvas.toDataURL();
}

// Boss 5: Inferno - Fire themed
function makeBossInferno() {
    const { canvas, ctx } = createCanvas(54, 54);
    // Fire aura
    ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(27, 27, 27, 0, Math.PI * 2);
    ctx.fill();
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(27, 50, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Body - fire gradient
    const grad = ctx.createRadialGradient(27, 28, 4, 27, 28, 22);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.3, '#ffeb3b');
    grad.addColorStop(0.6, '#ff9800');
    grad.addColorStop(1, '#d32f2f');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(5, 42);
    ctx.quadraticCurveTo(2, 22, 14, 12);
    ctx.quadraticCurveTo(27, 6, 40, 12);
    ctx.quadraticCurveTo(52, 22, 49, 42);
    ctx.quadraticCurveTo(27, 50, 5, 42);
    ctx.fill();
    // Flames on top
    ctx.fillStyle = '#ff5722';
    ctx.beginPath();
    ctx.moveTo(15, 14); ctx.quadraticCurveTo(18, 2, 22, 12);
    ctx.moveTo(24, 10); ctx.quadraticCurveTo(27, -2, 30, 10);
    ctx.moveTo(32, 12); ctx.quadraticCurveTo(36, 4, 39, 14);
    ctx.fill();
    // Angry eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(19, 24, 5, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(35, 24, 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d32f2f';
    ctx.beginPath();
    ctx.arc(20, 26, 3, 0, Math.PI * 2);
    ctx.arc(36, 26, 3, 0, Math.PI * 2);
    ctx.fill();
    // Angry eyebrows
    ctx.strokeStyle = '#5d0000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(12, 18); ctx.lineTo(24, 16);
    ctx.moveTo(42, 18); ctx.lineTo(30, 16);
    ctx.stroke();
    return canvas.toDataURL();
}

// Boss 6: Shadow Lord - Dark themed
function makeBossShadow() {
    const { canvas, ctx } = createCanvas(50, 50);
    // Shadow aura
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(25, 25, 25, 0, Math.PI * 2);
    ctx.fill();
    // Body - dark
    const grad = ctx.createRadialGradient(25, 26, 4, 25, 26, 20);
    grad.addColorStop(0, '#4a4a6a');
    grad.addColorStop(0.5, '#2d2d44');
    grad.addColorStop(1, '#0a0a15');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(5, 40);
    ctx.quadraticCurveTo(2, 22, 14, 12);
    ctx.quadraticCurveTo(25, 6, 36, 12);
    ctx.quadraticCurveTo(48, 22, 45, 40);
    ctx.quadraticCurveTo(25, 48, 5, 40);
    ctx.fill();
    // Hood
    ctx.fillStyle = '#0a0a15';
    ctx.beginPath();
    ctx.moveTo(10, 18);
    ctx.quadraticCurveTo(25, 2, 40, 18);
    ctx.quadraticCurveTo(25, 12, 10, 18);
    ctx.fill();
    // Glowing purple eyes
    ctx.fillStyle = '#9b59b6';
    ctx.shadowColor = '#9b59b6';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(18, 24, 3, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(32, 24, 3, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Shadow wisps
    ctx.strokeStyle = 'rgba(100, 50, 150, 0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
        const x = 10 + i * 15;
        ctx.beginPath();
        ctx.moveTo(x, 45);
        ctx.quadraticCurveTo(x + 5, 55, x + 10, 50);
        ctx.stroke();
    }
    return canvas.toDataURL();
}

// Boss 7: MEGA SLIME - Ultimate boss
function makeBossMega() {
    const { canvas, ctx } = createCanvas(70, 70);
    // Rainbow aura
    const auraGrad = ctx.createRadialGradient(35, 35, 20, 35, 35, 35);
    auraGrad.addColorStop(0, 'rgba(255,0,0,0.2)');
    auraGrad.addColorStop(0.33, 'rgba(0,255,0,0.2)');
    auraGrad.addColorStop(0.66, 'rgba(0,0,255,0.2)');
    auraGrad.addColorStop(1, 'rgba(255,0,255,0.2)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(35, 35, 35, 0, Math.PI * 2);
    ctx.fill();
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(35, 66, 25, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Body - rainbow gradient
    const grad = ctx.createRadialGradient(35, 38, 6, 35, 38, 30);
    grad.addColorStop(0, '#ff69b4');
    grad.addColorStop(0.3, '#ff4500');
    grad.addColorStop(0.5, '#ffd700');
    grad.addColorStop(0.7, '#7cfc00');
    grad.addColorStop(0.85, '#00bfff');
    grad.addColorStop(1, '#9400d3');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(5, 55);
    ctx.quadraticCurveTo(0, 30, 18, 14);
    ctx.quadraticCurveTo(35, 6, 52, 14);
    ctx.quadraticCurveTo(70, 30, 65, 55);
    ctx.quadraticCurveTo(35, 66, 5, 55);
    ctx.fill();
    // Multiple crowns
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(20, 16); ctx.lineTo(22, 6); ctx.lineTo(26, 14);
    ctx.moveTo(30, 12); ctx.lineTo(35, 0); ctx.lineTo(40, 12);
    ctx.moveTo(44, 14); ctx.lineTo(48, 6); ctx.lineTo(50, 16);
    ctx.fill();
    // Multiple eyes
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 3; i++) {
        const x = 20 + i * 15;
        ctx.beginPath();
        ctx.ellipse(x, 32, 5, 7, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.fillStyle = '#ff0000';
    for (let i = 0; i < 3; i++) {
        const x = 21 + i * 15;
        ctx.beginPath();
        ctx.arc(x, 34, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    // "MEGA" text effect particles
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x = 35 + Math.cos(angle) * 32;
        const y = 35 + Math.sin(angle) * 28;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    return canvas.toDataURL();
}

// Projectile (magic orb)
function makeProjectile() {
    const { canvas, ctx } = createCanvas(16, 16);
    const grad = ctx.createRadialGradient(8, 8, 1, 8, 8, 8);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.3, '#74b9ff');
    grad.addColorStop(1, '#0984e3');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(8, 8, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.ellipse(5, 5, 2, 1.5, -0.5, 0, Math.PI * 2);
    ctx.fill();
    return canvas.toDataURL();
}

// Key
function makeKey() {
    const { canvas, ctx } = createCanvas(24, 24);
    ctx.fillStyle = '#f1c40f';
    ctx.strokeStyle = '#d68910';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(8, 8, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#2d3436';
    ctx.beginPath();
    ctx.arc(8, 8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(12, 6, 10, 4);
    ctx.strokeRect(12, 6, 10, 4);
    ctx.fillRect(18, 10, 2, 4);
    ctx.fillRect(22, 10, 2, 6);
    return canvas.toDataURL();
}

// Door - Gothic style with arch
function makeDoor(open) {
    const { canvas, ctx } = createCanvas(48, 72);
    
    // Stone frame
    ctx.fillStyle = '#3d3d3d';
    ctx.fillRect(0, 0, 48, 72);
    
    // Inner stone
    ctx.fillStyle = '#555555';
    ctx.fillRect(3, 3, 42, 66);
    
    // Gothic arch shape
    ctx.fillStyle = open ? '#1a4731' : '#2a1a0a';
    ctx.beginPath();
    ctx.moveTo(6, 68);
    ctx.lineTo(6, 28);
    ctx.quadraticCurveTo(6, 8, 24, 6);
    ctx.quadraticCurveTo(42, 8, 42, 28);
    ctx.lineTo(42, 68);
    ctx.closePath();
    ctx.fill();
    
    // Door panels
    ctx.fillStyle = open ? '#27ae60' : '#4a3520';
    ctx.beginPath();
    ctx.moveTo(10, 66);
    ctx.lineTo(10, 30);
    ctx.quadraticCurveTo(10, 14, 24, 12);
    ctx.quadraticCurveTo(38, 14, 38, 30);
    ctx.lineTo(38, 66);
    ctx.closePath();
    ctx.fill();
    
    // Wood grain / panel lines
    ctx.strokeStyle = open ? '#2ecc71' : '#3d2815';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(24, 12);
    ctx.lineTo(24, 66);
    ctx.moveTo(10, 35);
    ctx.lineTo(38, 35);
    ctx.stroke();
    
    // Metal studs
    ctx.fillStyle = open ? '#f1c40f' : '#666666';
    [[14, 22], [34, 22], [14, 50], [34, 50]].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Door handle/ring
    ctx.strokeStyle = open ? '#f39c12' : '#888888';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(30, 42, 5, 0, Math.PI);
    ctx.stroke();
    ctx.fillStyle = open ? '#f39c12' : '#888888';
    ctx.beginPath();
    ctx.arc(30, 37, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Glow effect for open door
    if (open) {
        const glow = ctx.createRadialGradient(24, 36, 5, 24, 36, 40);
        glow.addColorStop(0, 'rgba(46, 204, 113, 0.4)');
        glow.addColorStop(1, 'rgba(46, 204, 113, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, 48, 72);
        
        // Portal effect inside
        ctx.fillStyle = 'rgba(46, 204, 113, 0.2)';
        ctx.beginPath();
        ctx.moveTo(12, 64);
        ctx.lineTo(12, 32);
        ctx.quadraticCurveTo(12, 16, 24, 14);
        ctx.quadraticCurveTo(36, 16, 36, 32);
        ctx.lineTo(36, 64);
        ctx.closePath();
        ctx.fill();
    } else {
        // Lock/chains for closed door
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(18, 38);
        ctx.lineTo(30, 38);
        ctx.stroke();
        
        // Padlock
        ctx.fillStyle = '#666';
        ctx.fillRect(21, 36, 6, 8);
        ctx.strokeStyle = '#777';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(24, 36, 3, Math.PI, 0);
        ctx.stroke();
    }
    
    return canvas.toDataURL();
}

// Wall tile
function makeWall() {
    const { canvas, ctx } = createCanvas(40, 40);
    const grad = ctx.createLinearGradient(0, 0, 0, 40);
    grad.addColorStop(0, '#4a4a6a');
    grad.addColorStop(1, '#3a3a5a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 40, 40);
    ctx.strokeStyle = '#2a2a4a';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 40, 20);
    ctx.strokeRect(0, 20, 40, 20);
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(20, 20);
    ctx.moveTo(0, 20);
    ctx.lineTo(0, 40);
    ctx.moveTo(40, 20);
    ctx.lineTo(40, 40);
    ctx.stroke();
    return canvas.toDataURL();
}

// Torch decoration
function makeTorch() {
    const { canvas, ctx } = createCanvas(16, 32);
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(6, 12, 4, 18);
    ctx.fillStyle = '#424242';
    ctx.fillRect(4, 10, 8, 4);
    const fireGrad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    fireGrad.addColorStop(0, '#fff');
    fireGrad.addColorStop(0.3, '#ffeb3b');
    fireGrad.addColorStop(0.6, '#ff9800');
    fireGrad.addColorStop(1, '#f44336');
    ctx.fillStyle = fireGrad;
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.quadraticCurveTo(14, 6, 12, 12);
    ctx.quadraticCurveTo(8, 14, 4, 12);
    ctx.quadraticCurveTo(2, 6, 8, 0);
    ctx.fill();
    return canvas.toDataURL();
}

// Skull decoration
function makeSkull() {
    const { canvas, ctx } = createCanvas(20, 20);
    ctx.fillStyle = '#e0e0e0';
    ctx.beginPath();
    ctx.arc(10, 9, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(10, 16, 5, 3, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#2d2d44';
    ctx.beginPath();
    ctx.ellipse(7, 8, 2.5, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(13, 8, 2.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(10, 11);
    ctx.lineTo(8, 13);
    ctx.lineTo(12, 13);
    ctx.closePath();
    ctx.fill();
    return canvas.toDataURL();
}

// Barrel decoration
function makeBarrel() {
    const { canvas, ctx } = createCanvas(24, 28);
    ctx.fillStyle = '#8d6e63';
    ctx.beginPath();
    ctx.ellipse(12, 24, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(4, 6, 16, 18);
    ctx.fillStyle = '#8d6e63';
    ctx.beginPath();
    ctx.ellipse(12, 6, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(4, 10);
    ctx.lineTo(20, 10);
    ctx.moveTo(4, 20);
    ctx.lineTo(20, 20);
    ctx.stroke();
    return canvas.toDataURL();
}

// Crate decoration
function makeCrate() {
    const { canvas, ctx } = createCanvas(28, 28);
    ctx.fillStyle = '#a1887f';
    ctx.fillRect(2, 2, 24, 24);
    ctx.strokeStyle = '#6d4c41';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, 24, 24);
    ctx.beginPath();
    ctx.moveTo(2, 2);
    ctx.lineTo(26, 26);
    ctx.moveTo(26, 2);
    ctx.lineTo(2, 26);
    ctx.stroke();
    ctx.fillStyle = '#424242';
    ctx.beginPath();
    ctx.arc(6, 6, 2, 0, Math.PI * 2);
    ctx.arc(22, 6, 2, 0, Math.PI * 2);
    ctx.arc(6, 22, 2, 0, Math.PI * 2);
    ctx.arc(22, 22, 2, 0, Math.PI * 2);
    ctx.fill();
    return canvas.toDataURL();
}

// Bones decoration
function makeBones() {
    const { canvas, ctx } = createCanvas(24, 16);
    ctx.fillStyle = '#e0e0e0';
    ctx.strokeStyle = '#bdbdbd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(4, 4, 3, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(20, 12, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(4, 3, 16, 3);
    ctx.beginPath();
    ctx.moveTo(6, 6);
    ctx.lineTo(18, 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(20, 4, 3, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(4, 12, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    return canvas.toDataURL();
}

// Cobweb
function makeCobweb() {
    const { canvas, ctx } = createCanvas(32, 32);
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.6)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 0.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * 30, Math.sin(angle) * 30);
        ctx.stroke();
    }
    for (let r = 8; r < 30; r += 8) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 0.5);
        ctx.stroke();
    }
    return canvas.toDataURL();
}

// Crack in floor
function makeCrack() {
    const { canvas, ctx } = createCanvas(40, 40);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(5, 20);
    ctx.lineTo(15, 18);
    ctx.lineTo(20, 25);
    ctx.lineTo(28, 22);
    ctx.lineTo(35, 28);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(20, 25);
    ctx.lineTo(22, 35);
    ctx.stroke();
    return canvas.toDataURL();
}

// Moss/grass patch
function makeMoss() {
    const { canvas, ctx } = createCanvas(20, 12);
    ctx.fillStyle = '#4a7c59';
    for (let i = 0; i < 8; i++) {
        const x = 2 + i * 2 + Math.random() * 2;
        const h = 4 + Math.random() * 6;
        ctx.fillRect(x, 12 - h, 2, h);
    }
    return canvas.toDataURL();
}

// Blood splatter
function makeBlood() {
    const { canvas, ctx } = createCanvas(24, 24);
    ctx.fillStyle = '#8b0000';
    ctx.beginPath();
    ctx.ellipse(12, 12, 8, 6, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(18, 8, 4, 3, 0.5, 0, Math.PI * 2);
    ctx.ellipse(6, 16, 3, 2, -0.3, 0, Math.PI * 2);
    ctx.fill();
    return canvas.toDataURL();
}

// Ranged Slime (purple mage slime)
function makeRangedSlime() {
    const { canvas, ctx } = createCanvas(28, 28);
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(14, 25, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Body - purple gradient
    const grad = ctx.createRadialGradient(14, 14, 2, 14, 14, 14);
    grad.addColorStop(0, '#a855f7');
    grad.addColorStop(1, '#6b21a8');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(4, 22);
    ctx.quadraticCurveTo(2, 12, 8, 6);
    ctx.quadraticCurveTo(14, 2, 20, 6);
    ctx.quadraticCurveTo(26, 12, 24, 22);
    ctx.quadraticCurveTo(14, 26, 4, 22);
    ctx.fill();
    // Magic aura
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(14, 14, 12, 0, Math.PI * 2);
    ctx.stroke();
    // Eyes - glowing
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(10, 12, 4, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(18, 12, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#9333ea';
    ctx.beginPath();
    ctx.arc(11, 13, 2, 0, Math.PI * 2);
    ctx.arc(19, 13, 2, 0, Math.PI * 2);
    ctx.fill();
    // Magic sparkles
    ctx.fillStyle = '#e879f9';
    ctx.beginPath();
    ctx.arc(6, 6, 2, 0, Math.PI * 2);
    ctx.arc(22, 8, 1.5, 0, Math.PI * 2);
    ctx.arc(20, 4, 1, 0, Math.PI * 2);
    ctx.fill();
    // Wizard hat
    ctx.fillStyle = '#4c1d95';
    ctx.beginPath();
    ctx.moveTo(14, -2);
    ctx.lineTo(8, 8);
    ctx.lineTo(20, 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#7c3aed';
    ctx.beginPath();
    ctx.ellipse(14, 8, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Star on hat
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(14, 3, 2, 0, Math.PI * 2);
    ctx.fill();
    return canvas.toDataURL();
}

// Tank Slime (big armored slime)
function makeTankSlime() {
    const { canvas, ctx } = createCanvas(40, 40);
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(20, 36, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Body - steel gray gradient
    const grad = ctx.createRadialGradient(20, 20, 3, 20, 20, 18);
    grad.addColorStop(0, '#9ca3af');
    grad.addColorStop(0.5, '#6b7280');
    grad.addColorStop(1, '#374151');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(4, 32);
    ctx.quadraticCurveTo(0, 18, 8, 8);
    ctx.quadraticCurveTo(20, 0, 32, 8);
    ctx.quadraticCurveTo(40, 18, 36, 32);
    ctx.quadraticCurveTo(20, 38, 4, 32);
    ctx.fill();
    // Armor plates
    ctx.fillStyle = '#4b5563';
    ctx.beginPath();
    ctx.moveTo(10, 12);
    ctx.lineTo(30, 12);
    ctx.lineTo(28, 20);
    ctx.lineTo(12, 20);
    ctx.closePath();
    ctx.fill();
    // Armor shine
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(12, 14);
    ctx.lineTo(26, 14);
    ctx.stroke();
    // Eyes - small and angry
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(14, 18, 4, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(26, 18, 4, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(15, 19, 2, 0, Math.PI * 2);
    ctx.arc(27, 19, 2, 0, Math.PI * 2);
    ctx.fill();
    // Angry eyebrows
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, 14);
    ctx.lineTo(17, 16);
    ctx.moveTo(30, 14);
    ctx.lineTo(23, 16);
    ctx.stroke();
    // Spikes on armor
    ctx.fillStyle = '#6b7280';
    ctx.beginPath();
    ctx.moveTo(8, 8);
    ctx.lineTo(10, 2);
    ctx.lineTo(12, 8);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(28, 8);
    ctx.lineTo(30, 2);
    ctx.lineTo(32, 8);
    ctx.fill();
    return canvas.toDataURL();
}

// Bomber Slime (orange explosive slime)
function makeBomberSlime() {
    const { canvas, ctx } = createCanvas(24, 24);
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(12, 21, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Body - orange/red gradient
    const grad = ctx.createRadialGradient(12, 12, 2, 12, 12, 11);
    grad.addColorStop(0, '#fbbf24');
    grad.addColorStop(0.5, '#f97316');
    grad.addColorStop(1, '#dc2626');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(3, 18);
    ctx.quadraticCurveTo(1, 10, 6, 5);
    ctx.quadraticCurveTo(12, 1, 18, 5);
    ctx.quadraticCurveTo(23, 10, 21, 18);
    ctx.quadraticCurveTo(12, 22, 3, 18);
    ctx.fill();
    // Danger markings
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(12, 10, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('!', 12, 13);
    // Fuse on top
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(12, 3);
    ctx.quadraticCurveTo(14, 0, 16, 1);
    ctx.stroke();
    // Fuse spark
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(16, 1, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(16, 1, 1, 0, Math.PI * 2);
    ctx.fill();
    // Eyes - crazy
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(8, 12, 3, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(16, 12, 3, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(9, 13, 1.5, 0, Math.PI * 2);
    ctx.arc(17, 13, 1.5, 0, Math.PI * 2);
    ctx.fill();
    // Crazy smile
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(12, 14, 4, 0.2, Math.PI - 0.2);
    ctx.stroke();
    return canvas.toDataURL();
}

// Enemy projectile (dark magic orb)
function makeEnemyProjectile() {
    const { canvas, ctx } = createCanvas(14, 14);
    const grad = ctx.createRadialGradient(7, 7, 1, 7, 7, 7);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.3, '#e879f9');
    grad.addColorStop(1, '#9333ea');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(7, 7, 6, 0, Math.PI * 2);
    ctx.fill();
    // Inner glow
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(5, 5, 2, 0, Math.PI * 2);
    ctx.fill();
    // Outer glow effect
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(7, 7, 6, 0, Math.PI * 2);
    ctx.stroke();
    return canvas.toDataURL();
}

// Generate all sprites
export function generateSprites() {
    return {
        player: makePlayer(),
        slime: makeSlime(),
        slimeRanged: makeRangedSlime(),
        slimeTank: makeTankSlime(),
        slimeBomber: makeBomberSlime(),
        bossKing: makeBossKing(),
        bossSpeed: makeBossSpeed(),
        bossNecro: makeBossNecro(),
        bossFrost: makeBossFrost(),
        bossInferno: makeBossFrost(),
        bossShadow: makeBossShadow(),
        bossMega: makeBossMega(),
        projectile: makeProjectile(),
        enemyProjectile: makeEnemyProjectile(),
        key: makeKey(),
        doorClosed: makeDoor(false),
        doorOpen: makeDoor(true),
        wall: makeWall(),
        torch: makeTorch(),
        skull: makeSkull(),
        barrel: makeBarrel(),
        crate: makeCrate(),
        bones: makeBones(),
        cobweb: makeCobweb(),
        crack: makeCrack(),
        moss: makeMoss(),
        blood: makeBlood(),
    };
}

// Load all sprites into Kaboom
export function loadAllSprites() {
    const sprites = generateSprites();
    Object.entries(sprites).forEach(([name, data]) => {
        loadSprite(name, data);
    });
    
    // Load animated hero sprites (4 frames each)
    const heroAnims = makeHeroAnimations();
    
    // Warrior animation frames
    loadSprite("heroWarrior", heroAnims.warrior[0], {
        sliceX: 1,
        sliceY: 1,
        anims: { idle: 0 }
    });
    heroAnims.warrior.forEach((frame, i) => {
        loadSprite(`heroWarrior_${i}`, frame);
    });
    
    // Mage animation frames
    loadSprite("heroMage", heroAnims.mage[0], {
        sliceX: 1,
        sliceY: 1,
        anims: { idle: 0 }
    });
    heroAnims.mage.forEach((frame, i) => {
        loadSprite(`heroMage_${i}`, frame);
    });
    
    // Assassin animation frames
    loadSprite("heroAssassin", heroAnims.assassin[0], {
        sliceX: 1,
        sliceY: 1,
        anims: { idle: 0 }
    });
    heroAnims.assassin.forEach((frame, i) => {
        loadSprite(`heroAssassin_${i}`, frame);
    });
}

export default { generateSprites, loadAllSprites };

