// ==================== GAMEOVER SCENE ====================
// Diablo-style death screen

import { CONFIG } from '../config.js';
import { GS } from '../state.js';
import { playSound } from '../audio.js';

export function createGameOverScene() {
    scene("gameover", () => {
        // Dark red-tinted background
        add([rect(CONFIG.MAP_WIDTH, CONFIG.MAP_HEIGHT), pos(0, 0), color(15, 8, 10)]);
        
        // Blood particles falling
        for (let i = 0; i < 30; i++) {
            const p = add([
                circle(rand(2, 5)),
                pos(rand(0, CONFIG.MAP_WIDTH), rand(-50, CONFIG.MAP_HEIGHT)),
                color(rand(100, 150), rand(20, 40), rand(20, 40)),
                opacity(rand(0.3, 0.6)),
                z(-1),
                { vy: rand(30, 80) }
            ]);
            p.onUpdate(() => {
                p.pos.y += p.vy * dt();
                if (p.pos.y > CONFIG.MAP_HEIGHT) {
                    p.pos.y = -20;
                    p.pos.x = rand(0, CONFIG.MAP_WIDTH);
                }
            });
        }
        
        // Borders
        add([rect(CONFIG.MAP_WIDTH, 3), pos(0, 0), color(100, 40, 40), z(50)]);
        add([rect(CONFIG.MAP_WIDTH, 3), pos(0, CONFIG.MAP_HEIGHT - 3), color(100, 40, 40), z(50)]);
        
        // Skull decoration
        add([text("💀", { size: 80 }), pos(CONFIG.MAP_WIDTH / 2, 100), anchor("center")]);
        
        // Title
        add([
            text("YOU HAVE FALLEN", { size: 42 }),
            pos(CONFIG.MAP_WIDTH / 2, 200),
            anchor("center"),
            color(180, 60, 60),
        ]);
        
        // Stats
        add([
            text(`Level ${GS.currentLevel} • Hero LV.${GS.playerLevel}`, { size: 16 }),
            pos(CONFIG.MAP_WIDTH / 2, 260),
            anchor("center"),
            color(140, 130, 120),
        ]);
        
        add([
            text(`Final Score: ${GS.score}`, { size: 24 }),
            pos(CONFIG.MAP_WIDTH / 2, 300),
            anchor("center"),
            color(220, 180, 100),
        ]);
        
        add([
            text(`Gold Collected: ${GS.gold}`, { size: 16 }),
            pos(CONFIG.MAP_WIDTH / 2, 340),
            anchor("center"),
            color(255, 220, 100),
        ]);
        
        // Restart button
        const btnY = CONFIG.MAP_HEIGHT - 100;
        
        add([
            rect(200, 50, { radius: 5 }),
            pos(CONFIG.MAP_WIDTH / 2, btnY),
            anchor("center"),
            color(100, 40, 40),
            opacity(0.4),
            z(9),
        ]);
        
        const btn = add([
            rect(190, 45, { radius: 4 }),
            pos(CONFIG.MAP_WIDTH / 2, btnY),
            anchor("center"),
            color(50, 30, 30),
            area(),
            z(10),
            "btn",
        ]);
        
        add([
            text("RESURRECT", { size: 18 }),
            pos(CONFIG.MAP_WIDTH / 2, btnY),
            anchor("center"),
            color(180, 140, 120),
            z(11),
        ]);
        
        btn.onHoverUpdate(() => btn.color = rgb(70, 40, 40));
        btn.onHoverEnd(() => btn.color = rgb(50, 30, 30));
        
        function tryAgain() { playSound('start'); GS.reset(); go("heroSelect"); }
        
        onClick("btn", tryAgain);
        onKeyPress("space", tryAgain);
        onKeyPress("escape", () => { playSound('start'); go("start"); });
        
        // Mobile touch support
        onTouchStart((touchPos) => {
            if (touchPos.x >= CONFIG.MAP_WIDTH / 2 - 95 && touchPos.x <= CONFIG.MAP_WIDTH / 2 + 95 &&
                touchPos.y >= btnY - 22 && touchPos.y <= btnY + 22) {
                tryAgain();
            }
        });
        
        add([
            text("TAP button to try again", { size: 11 }),
            pos(CONFIG.MAP_WIDTH / 2, CONFIG.MAP_HEIGHT - 30),
            anchor("center"),
            color(100, 80, 80),
        ]);
    });
}

export default { createGameOverScene };
