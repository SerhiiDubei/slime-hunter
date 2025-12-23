// ==================== START SCENE ====================
// Diablo-style main menu

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
            text("SLIME", { size: 72 }),
            pos(CONFIG.MAP_WIDTH / 2, 100),
            anchor("center"),
            color(200, 80, 80),
        ]);
        
        add([
            text("HUNTER", { size: 72 }),
            pos(CONFIG.MAP_WIDTH / 2, 165),
            anchor("center"),
            color(180, 140, 90),
        ]);
        
        // Subtitle
        add([
            text("An Action RPG Adventure", { size: 14 }),
            pos(CONFIG.MAP_WIDTH / 2, 210),
            anchor("center"),
            color(120, 100, 80),
        ]);
        
        // Separator
        add([rect(300, 2), pos(CONFIG.MAP_WIDTH / 2, 240), anchor("center"), color(80, 60, 45)]);
        
        // Controls section
        add([
            text("CONTROLS", { size: 12 }),
            pos(CONFIG.MAP_WIDTH / 2, 270),
            anchor("center"),
            color(139, 90, 43),
        ]);
        
        const controls = [
            "WASD / Arrows - Move",
            "SHIFT - Sprint",
            "SPACE - Melee Attack",
            "E - Ranged Attack",
            "Q - Ultimate Ability",
        ];
        
        controls.forEach((ctrl, i) => {
            add([
                text(ctrl, { size: 11 }),
                pos(CONFIG.MAP_WIDTH / 2, 295 + i * 20),
                anchor("center"),
                color(140, 135, 130),
            ]);
        });
        
        // Preview sprites
        const spriteY = 440;
        const pp = add([sprite("player"), pos(CONFIG.MAP_WIDTH / 2 - 120, spriteY), anchor("center"), scale(1.3), z(5)]);
        const pe = add([sprite("slime"), pos(CONFIG.MAP_WIDTH / 2, spriteY), anchor("center"), scale(1.1), z(5)]);
        const pb = add([sprite("bossKing"), pos(CONFIG.MAP_WIDTH / 2 + 120, spriteY), anchor("center"), scale(0.8), z(5)]);
        
        add([text("HERO", { size: 10 }), pos(CONFIG.MAP_WIDTH / 2 - 120, spriteY + 35), anchor("center"), color(100, 200, 150)]);
        add([text("ENEMY", { size: 10 }), pos(CONFIG.MAP_WIDTH / 2, spriteY + 35), anchor("center"), color(200, 100, 100)]);
        add([text("BOSS", { size: 10 }), pos(CONFIG.MAP_WIDTH / 2 + 120, spriteY + 35), anchor("center"), color(255, 150, 100)]);
        
        pp.onUpdate(() => { pp.scale = vec2(1.3 + Math.sin(time() * 3) * 0.08); });
        pe.onUpdate(() => { pe.scale = vec2(1.1 + Math.sin(time() * 5) * 0.08, 1.1 - Math.sin(time() * 5) * 0.08); });
        pb.onUpdate(() => { pb.scale = vec2(0.8 + Math.sin(time() * 2) * 0.06); });

        // Start button with glow
        const btnY = CONFIG.MAP_HEIGHT - 70;
        
        add([
            rect(230, 55, { radius: 6 }),
            pos(CONFIG.MAP_WIDTH / 2, btnY),
            anchor("center"),
            color(139, 90, 43),
            opacity(0.4),
            z(9),
        ]);
        
        const btn = add([
            rect(220, 50, { radius: 5 }),
            pos(CONFIG.MAP_WIDTH / 2, btnY),
            anchor("center"),
            color(50, 40, 30),
            area(),
            z(10),
            "btn",
        ]);
        
        add([
            text("BEGIN JOURNEY", { size: 18 }),
            pos(CONFIG.MAP_WIDTH / 2, btnY),
            anchor("center"),
            color(200, 170, 120),
            z(11),
        ]);
        
        btn.onHoverUpdate(() => { btn.color = rgb(70, 55, 40); });
        btn.onHoverEnd(() => { btn.color = rgb(50, 40, 30); });

        onClick("btn", () => { playSound('start'); go("heroSelect"); });
        onKeyPress("space", () => { playSound('start'); go("heroSelect"); });
        onKeyPress("enter", () => { playSound('start'); go("heroSelect"); });
        
        // Options button
        const optBtn = add([
            rect(120, 35, { radius: 4 }),
            pos(CONFIG.MAP_WIDTH - 90, 30),
            anchor("center"),
            color(40, 35, 30),
            area(),
            z(10),
            "optBtn",
        ]);
        
        add([
            text("⚙️ OPTIONS", { size: 12 }),
            pos(CONFIG.MAP_WIDTH - 90, 30),
            anchor("center"),
            color(150, 130, 100),
            z(11),
        ]);
        
        optBtn.onHoverUpdate(() => { optBtn.color = rgb(60, 50, 40); });
        optBtn.onHoverEnd(() => { optBtn.color = rgb(40, 35, 30); });
        
        onClick("optBtn", () => { playSound('click'); go("options"); });
        onKeyPress("o", () => { playSound('click'); go("options"); });
        
        add([
            text("Press SPACE or ENTER to continue • O for Options", { size: 10 }),
            pos(CONFIG.MAP_WIDTH / 2, CONFIG.MAP_HEIGHT - 25),
            anchor("center"),
            color(80, 70, 60),
        ]);
        
        // Version
        add([
            text("v1.0", { size: 9 }),
            pos(CONFIG.MAP_WIDTH - 15, CONFIG.MAP_HEIGHT - 15),
            anchor("botright"),
            color(60, 55, 50),
        ]);
    });
}

export default { createStartScene };
