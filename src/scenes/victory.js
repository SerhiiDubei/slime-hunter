// ==================== VICTORY SCENE ====================
// Diablo-style victory celebration

import { CONFIG } from '../config.js';
import { GS } from '../state.js';
import { playSound } from '../audio.js';

export function createVictoryScene() {
    scene("victory", () => {
        // Golden background
        add([rect(CONFIG.MAP_WIDTH, CONFIG.MAP_HEIGHT), pos(0, 0), color(15, 12, 8)]);
        
        // Golden confetti
        for (let i = 0; i < 50; i++) {
            const p = add([
                rect(rand(4, 10), rand(4, 10)),
                pos(rand(0, CONFIG.MAP_WIDTH), rand(-100, CONFIG.MAP_HEIGHT)),
                color(rand(200, 255), rand(160, 220), rand(40, 100)),
                opacity(rand(0.5, 0.9)),
                rotate(rand(0, 360)),
                z(-1),
                { vy: rand(30, 80), vx: rand(-20, 20), rs: rand(-200, 200) }
            ]);
            p.onUpdate(() => {
                p.pos.y += p.vy * dt();
                p.pos.x += p.vx * dt();
                p.angle += p.rs * dt();
                if (p.pos.y > CONFIG.MAP_HEIGHT + 20) {
                    p.pos.y = -20;
                    p.pos.x = rand(0, CONFIG.MAP_WIDTH);
                }
            });
        }
        
        // Golden borders
        add([rect(CONFIG.MAP_WIDTH, 4), pos(0, 0), color(180, 140, 60), z(50)]);
        add([rect(CONFIG.MAP_WIDTH, 4), pos(0, CONFIG.MAP_HEIGHT - 4), color(180, 140, 60), z(50)]);
        
        // Trophy
        add([text("🏆", { size: 100 }), pos(CONFIG.MAP_WIDTH / 2, 100), anchor("center")]);
        
        // Title
        add([
            text("GLORIOUS VICTORY", { size: 42 }),
            pos(CONFIG.MAP_WIDTH / 2, 200),
            anchor("center"),
            color(220, 180, 80),
        ]);
        
        add([
            text("You have vanquished all evil!", { size: 14 }),
            pos(CONFIG.MAP_WIDTH / 2, 240),
            anchor("center"),
            color(140, 130, 100),
        ]);
        
        // Stats
        add([
            text(`Champion Level: ${GS.playerLevel}`, { size: 20 }),
            pos(CONFIG.MAP_WIDTH / 2, 290),
            anchor("center"),
            color(200, 180, 140),
        ]);
        
        add([
            text(`Final Score: ${GS.score}`, { size: 28 }),
            pos(CONFIG.MAP_WIDTH / 2, 330),
            anchor("center"),
            color(255, 220, 100),
        ]);
        
        add([
            text(`Gold Amassed: ${GS.gold}`, { size: 18 }),
            pos(CONFIG.MAP_WIDTH / 2, 375),
            anchor("center"),
            color(255, 200, 80),
        ]);
        
        // Play again button
        const btnY = CONFIG.MAP_HEIGHT - 90;
        
        add([
            rect(220, 55, { radius: 6 }),
            pos(CONFIG.MAP_WIDTH / 2, btnY),
            anchor("center"),
            color(180, 140, 60),
            opacity(0.4),
            z(9),
        ]);
        
        const btn = add([
            rect(210, 50, { radius: 5 }),
            pos(CONFIG.MAP_WIDTH / 2, btnY),
            anchor("center"),
            color(50, 40, 25),
            area(),
            z(10),
            "btn",
        ]);
        
        add([
            text("NEW ADVENTURE", { size: 18 }),
            pos(CONFIG.MAP_WIDTH / 2, btnY),
            anchor("center"),
            color(220, 190, 130),
            z(11),
        ]);
        
        btn.onHoverUpdate(() => btn.color = rgb(70, 55, 35));
        btn.onHoverEnd(() => btn.color = rgb(50, 40, 25));
        
        onClick("btn", () => { playSound('start'); GS.reset(); go("start"); });
        onKeyPress("space", () => { playSound('start'); GS.reset(); go("start"); });
        
        add([
            text("Press SPACE to continue", { size: 10 }),
            pos(CONFIG.MAP_WIDTH / 2, CONFIG.MAP_HEIGHT - 25),
            anchor("center"),
            color(100, 90, 70),
        ]);
    });
}

export default { createVictoryScene };
