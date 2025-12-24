// ==================== VISUAL EFFECTS ====================
// Particle effects - OPTIMIZED: reduced particle counts

export function createHitFX(p) {
    // OPTIMIZED: 3 particles instead of 5
    for (let i = 0; i < 3; i++) {
        const pt = add([
            circle(rand(4, 7)), pos(p.x, p.y), color(255, 255, 100),
            opacity(1), anchor("center"), z(20),
            { vx: rand(-120, 120), vy: rand(-120, 120), life: 0.3 }
        ]);
        pt.onUpdate(() => {
            pt.pos.x += pt.vx * dt();
            pt.pos.y += pt.vy * dt();
            pt.life -= dt();
            pt.opacity = pt.life / 0.3;
            if (pt.life <= 0) destroy(pt);
        });
    }
}

export function createDeathFX(p, isBoss) {
    // OPTIMIZED: 10/6 particles instead of 20/12
    const n = isBoss ? 10 : 6;
    for (let i = 0; i < n; i++) {
        const pt = add([
            rect(rand(5, isBoss ? 14 : 9), rand(5, isBoss ? 14 : 9)),
            pos(p.x, p.y), color(rand(200, 255), rand(50, 100), rand(80, 120)),
            opacity(1), anchor("center"), rotate(rand(0, 360)), z(20),
            { vx: rand(-180, 180), vy: rand(-180, 180), rs: rand(-250, 250), life: isBoss ? 0.6 : 0.4 }
        ]);
        pt.onUpdate(() => {
            pt.pos.x += pt.vx * dt();
            pt.pos.y += pt.vy * dt() + 100 * dt();
            pt.angle += pt.rs * dt();
            pt.life -= dt();
            pt.opacity = pt.life / (isBoss ? 0.6 : 0.4);
            if (pt.life <= 0) destroy(pt);
        });
    }
}

export function createXPFX(p) {
    // OPTIMIZED: 3 particles instead of 5
    for (let i = 0; i < 3; i++) {
        const pt = add([
            circle(rand(5, 9)), pos(p.x + rand(-15, 15), p.y + rand(-15, 15)),
            color(255, 220, 100), opacity(1), anchor("center"), z(25),
            { vy: -70, life: 0.5 }
        ]);
        pt.onUpdate(() => {
            pt.pos.y += pt.vy * dt();
            pt.vy += 140 * dt();
            pt.life -= dt();
            pt.opacity = pt.life / 0.5;
            if (pt.life <= 0) destroy(pt);
        });
    }
}

export function createLevelUpFX(playerPos) {
    if (!playerPos) return;
    const ring = add([
        circle(50), pos(playerPos), color(255, 220, 100),
        opacity(0.8), anchor("center"), z(30), outline(4, rgb(255, 255, 200)),
        scale(0.2), { t: 0 }
    ]);
    ring.onUpdate(() => {
        ring.t += dt();
        ring.scale = vec2(0.2 + ring.t * 4);
        ring.opacity = 0.8 - ring.t * 1.5;
        if (ring.opacity <= 0) destroy(ring);
    });
}

export function createProjectileFX(p) {
    // OPTIMIZED: 4 particles instead of 8
    for (let i = 0; i < 4; i++) {
        const pt = add([
            circle(rand(4, 8)), pos(p.x, p.y), color(100, 200, 255),
            opacity(1), anchor("center"), z(20),
            { vx: rand(-120, 120), vy: rand(-120, 120), life: 0.25 }
        ]);
        pt.onUpdate(() => {
            pt.pos.x += pt.vx * dt();
            pt.pos.y += pt.vy * dt();
            pt.life -= dt();
            pt.opacity = pt.life / 0.25;
            if (pt.life <= 0) destroy(pt);
        });
    }
}

export default { createHitFX, createDeathFX, createXPFX, createLevelUpFX, createProjectileFX };

