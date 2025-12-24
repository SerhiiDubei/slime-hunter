// ==================== VISUAL EFFECTS ====================
// HEAVILY OPTIMIZED: Using move() and lifespan() components instead of onUpdate

export function createHitFX(p) {
    // Just 2 particles with built-in components
    for (let i = 0; i < 2; i++) {
        add([
            circle(rand(4, 6)), pos(p.x, p.y), color(255, 255, 100),
            opacity(0.8), anchor("center"), z(20),
            move(rand(0, 360), rand(80, 120)),
            lifespan(0.2, { fade: 0.15 })
        ]);
    }
}

export function createDeathFX(p, isBoss) {
    // Reduced: 4 for boss, 3 for regular
    const n = isBoss ? 4 : 3;
    for (let i = 0; i < n; i++) {
        add([
            rect(rand(5, isBoss ? 12 : 8), rand(5, isBoss ? 12 : 8)),
            pos(p.x, p.y), color(rand(200, 255), rand(50, 100), rand(80, 120)),
            opacity(1), anchor("center"), rotate(rand(0, 360)), z(20),
            move(rand(0, 360), rand(100, 150)),
            lifespan(isBoss ? 0.4 : 0.3, { fade: 0.2 })
        ]);
    }
}

export function createXPFX(p) {
    // Just 2 particles
    for (let i = 0; i < 2; i++) {
        add([
            circle(rand(4, 7)), pos(p.x + rand(-10, 10), p.y + rand(-10, 10)),
            color(255, 220, 100), opacity(1), anchor("center"), z(25),
            move(270, 60), // Move up
            lifespan(0.4, { fade: 0.2 })
        ]);
    }
}

export function createLevelUpFX(playerPos) {
    if (!playerPos) return;
    // Simple ring without onUpdate
    add([
        circle(30), pos(playerPos), color(255, 220, 100),
        opacity(0.6), anchor("center"), z(30),
        lifespan(0.5, { fade: 0.4 })
    ]);
}

export function createProjectileFX(p) {
    // Just 2 particles
    for (let i = 0; i < 2; i++) {
        add([
            circle(rand(3, 5)), pos(p.x, p.y), color(100, 200, 255),
            opacity(0.7), anchor("center"), z(20),
            move(rand(0, 360), rand(60, 100)),
            lifespan(0.15, { fade: 0.1 })
        ]);
    }
}

export default { createHitFX, createDeathFX, createXPFX, createLevelUpFX, createProjectileFX };
