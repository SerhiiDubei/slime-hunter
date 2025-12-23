// ==================== VISUAL EFFECTS ====================
// Particle effects and visual feedback

export function createHitFX(p) {
    for (let i = 0; i < 5; i++) {
        const pt = add([
            circle(rand(3, 6)), pos(p.x, p.y), color(255, 255, 100),
            opacity(1), anchor("center"), z(20),
            { vx: rand(-150, 150), vy: rand(-150, 150) }
        ]);
        pt.onUpdate(() => {
            pt.pos.x += pt.vx * dt();
            pt.pos.y += pt.vy * dt();
            pt.opacity -= dt() * 3;
            if (pt.opacity <= 0) destroy(pt);
        });
    }
}

export function createDeathFX(p, isBoss) {
    const n = isBoss ? 20 : 12;
    for (let i = 0; i < n; i++) {
        const pt = add([
            rect(rand(4, isBoss ? 15 : 10), rand(4, isBoss ? 15 : 10)),
            pos(p.x, p.y), color(rand(200, 255), rand(50, 100), rand(80, 120)),
            opacity(1), anchor("center"), rotate(rand(0, 360)), z(20),
            { vx: rand(-200, 200), vy: rand(-200, 200), rs: rand(-300, 300) }
        ]);
        pt.onUpdate(() => {
            pt.pos.x += pt.vx * dt();
            pt.pos.y += pt.vy * dt() + 100 * dt();
            pt.opacity -= dt() * (isBoss ? 1.5 : 2);
            pt.angle += pt.rs * dt();
            if (pt.opacity <= 0) destroy(pt);
        });
    }
}

export function createXPFX(p) {
    for (let i = 0; i < 5; i++) {
        const pt = add([
            circle(rand(4, 8)), pos(p.x + rand(-20, 20), p.y + rand(-20, 20)),
            color(255, 220, 100), opacity(1), anchor("center"), z(25),
            { vy: -80, life: 0.6 }
        ]);
        pt.onUpdate(() => {
            pt.pos.y += pt.vy * dt();
            pt.vy += 150 * dt();
            pt.life -= dt();
            pt.opacity = pt.life / 0.6;
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
    for (let i = 0; i < 8; i++) {
        const pt = add([
            circle(rand(3, 7)), pos(p.x, p.y), color(100, 200, 255),
            opacity(1), anchor("center"), z(20),
            { vx: rand(-150, 150), vy: rand(-150, 150) }
        ]);
        pt.onUpdate(() => {
            pt.pos.x += pt.vx * dt();
            pt.pos.y += pt.vy * dt();
            pt.opacity -= dt() * 4;
            if (pt.opacity <= 0) destroy(pt);
        });
    }
}

export default { createHitFX, createDeathFX, createXPFX, createLevelUpFX, createProjectileFX };

