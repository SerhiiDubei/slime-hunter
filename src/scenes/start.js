// ==================== START SCENE ====================
// Diablo-style main menu with mobile support

import { CONFIG } from '../config.js';
import { GS } from '../state.js';
import { playSound } from '../audio.js';

export function createStartScene() {
    scene("start", () => {
        GS.reset();
        
        // Dark background
        add([rect(CONFIG.MAP_WIDTH, CONFIG.MAP_HEIGHT), pos(0, 0), color(8, 6, 12)]);
        
        // Ember particles rising
        for (let i = 0; i < 35; i++) {
            const p = add([
                circle(rand(1, 3)),
                pos(rand(0, CONFIG.MAP_WIDTH), rand(0, CONFIG.MAP_HEIGHT)),
                color(rand(180, 255), rand(80, 140), rand(20, 50)),
                opacity(rand(0.2, 0.5)),
                z(-1),
                { vy: rand(-30, -60), vx: rand(-8, 8), life: rand(3, 8) }
            ]);
            p.onUpdate(() => {
                p.pos.y += p.vy * dt();
                p.pos.x += p.vx * dt();
                p.life -= dt();
                if (p.life <= 0 || p.pos.y < -10) {
                    p.pos.y = CONFIG.MAP_HEIGHT + 10;
                    p.pos.x = rand(0, CONFIG.MAP_WIDTH);
                    p.life = rand(3, 8);
                }
            });
        }
        
        // Decorative borders
        add([rect(CONFIG.MAP_WIDTH, 3), pos(0, 0), color(139, 90, 43), z(50)]);
        add([rect(CONFIG.MAP_WIDTH, 3), pos(0, CONFIG.MAP_HEIGHT - 3), color(139, 90, 43), z(50)]);
        add([rect(3, CONFIG.MAP_HEIGHT), pos(0, 0), color(100, 65, 30), z(50)]);
        add([rect(3, CONFIG.MAP_HEIGHT), pos(CONFIG.MAP_WIDTH - 3, 0), color(100, 65, 30), z(50)]);

        // Main title with glow effect
        add([
            text("SLIME", { size: 64 }),
            pos(CONFIG.MAP_WIDTH / 2, 90),
            anchor("center"),
            color(200, 80, 80),
        ]);
        
        add([
            text("HUNTER", { size: 64 }),
            pos(CONFIG.MAP_WIDTH / 2, 150),
            anchor("center"),
            color(180, 140, 90),
        ]);
        
        // Subtitle
        add([
            text("An Action RPG Adventure", { size: 14 }),
            pos(CONFIG.MAP_WIDTH / 2, 195),
            anchor("center"),
            color(120, 100, 80),
        ]);
        
        // Separator
        add([rect(300, 2), pos(CONFIG.MAP_WIDTH / 2, 220), anchor("center"), color(80, 60, 45)]);
        
        // Mobile-friendly: Show tap instruction
        add([
            text("TAP THE BUTTON TO START", { size: 14 }),
            pos(CONFIG.MAP_WIDTH / 2, 250),
            anchor("center"),
            color(100, 180, 100),
        ]);
        
        // Preview sprites
        const spriteY = 340;
        const pp = add([sprite("player"), pos(CONFIG.MAP_WIDTH / 2 - 120, spriteY), anchor("center"), scale(1.3), z(5)]);
        const pe = add([sprite("slime"), pos(CONFIG.MAP_WIDTH / 2, spriteY), anchor("center"), scale(1.1), z(5)]);
        const pb = add([sprite("bossKing"), pos(CONFIG.MAP_WIDTH / 2 + 120, spriteY), anchor("center"), scale(0.8), z(5)]);
        
        add([text("HERO", { size: 10 }), pos(CONFIG.MAP_WIDTH / 2 - 120, spriteY + 35), anchor("center"), color(100, 200, 150)]);
        add([text("ENEMY", { size: 10 }), pos(CONFIG.MAP_WIDTH / 2, spriteY + 35), anchor("center"), color(200, 100, 100)]);
        add([text("BOSS", { size: 10 }), pos(CONFIG.MAP_WIDTH / 2 + 120, spriteY + 35), anchor("center"), color(255, 150, 100)]);
        
        pp.onUpdate(() => { pp.scale = vec2(1.3 + Math.sin(time() * 3) * 0.08); });
        pe.onUpdate(() => { pe.scale = vec2(1.1 + Math.sin(time() * 5) * 0.08, 1.1 - Math.sin(time() * 5) * 0.08); });
        pb.onUpdate(() => { pb.scale = vec2(0.8 + Math.sin(time() * 2) * 0.06); });

        // BIG Start button for mobile - MUCH BIGGER
        const btnY = CONFIG.MAP_HEIGHT - 100;
        
        // Glow
        add([
            rect(320, 85, { radius: 10 }),
            pos(CONFIG.MAP_WIDTH / 2, btnY),
            anchor("center"),
            color(139, 90, 43),
            opacity(0.5),
            z(9),
        ]);
        
        // Button
        const btn = add([
            rect(300, 75, { radius: 8 }),
            pos(CONFIG.MAP_WIDTH / 2, btnY),
            anchor("center"),
            color(60, 50, 40),
            area(),
            z(10),
            "startBtn",
        ]);
        
        // Button text
        add([
            text("▶ START GAME", { size: 28 }),
            pos(CONFIG.MAP_WIDTH / 2, btnY),
            anchor("center"),
            color(220, 200, 150),
            z(11),
        ]);
        
        // Hover effect
        btn.onHoverUpdate(() => { btn.color = rgb(80, 70, 55); });
        btn.onHoverEnd(() => { btn.color = rgb(60, 50, 40); });

        // Start game function
        function startGame() {
            playSound('start');
            go("heroSelect");
        }

        // Multiple ways to start - for mobile compatibility
        onClick("startBtn", startGame);
        onKeyPress("space", startGame);
        onKeyPress("enter", startGame);
        
        // Touch anywhere on button area (backup for mobile)
        onTouchStart((touchPos) => {
            const btnLeft = CONFIG.MAP_WIDTH / 2 - 150;
            const btnRight = CONFIG.MAP_WIDTH / 2 + 150;
            const btnTop = btnY - 40;
            const btnBottom = btnY + 40;
            
            if (touchPos.x >= btnLeft && touchPos.x <= btnRight &&
                touchPos.y >= btnTop && touchPos.y <= btnBottom) {
                startGame();
            }
        });
        
        // Options button (smaller, top right)
        const optBtn = add([
            rect(100, 35, { radius: 4 }),
            pos(CONFIG.MAP_WIDTH - 70, 30),
            anchor("center"),
            color(40, 35, 30),
            area(),
            z(10),
            "optBtn",
        ]);
        
        add([
            text("OPTIONS", { size: 12 }),
            pos(CONFIG.MAP_WIDTH - 70, 30),
            anchor("center"),
            color(150, 130, 100),
            z(11),
        ]);
        
        optBtn.onHoverUpdate(() => { optBtn.color = rgb(60, 50, 40); });
        optBtn.onHoverEnd(() => { optBtn.color = rgb(40, 35, 30); });
        
        onClick("optBtn", () => { playSound('click'); go("options"); });
        onKeyPress("o", () => { playSound('click'); go("options"); });
        
        // Mobile hint
        add([
            text("Keyboard: SPACE/ENTER • Mobile: TAP", { size: 10 }),
            pos(CONFIG.MAP_WIDTH / 2, CONFIG.MAP_HEIGHT - 25),
            anchor("center"),
            color(80, 70, 60),
        ]);
        
        // Version
        add([
            text("v1.1", { size: 9 }),
            pos(CONFIG.MAP_WIDTH - 15, CONFIG.MAP_HEIGHT - 10),
            anchor("botright"),
            color(60, 55, 50),
        ]);
    });
}

export default { createStartScene };
