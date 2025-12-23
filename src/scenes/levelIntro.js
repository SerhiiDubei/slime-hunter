// ==================== LEVEL INTRO SCENE ====================
// Pre-level screen with level name and hero dialogue

import { CONFIG } from '../config.js';
import { GS } from '../state.js';
import { getLevel } from '../data/levels.js';
import { HEROES } from '../data/heroes.js';
import { playSound } from '../audio.js';

export function createLevelIntroScene() {
    scene("levelIntro", () => {
        const level = getLevel(GS.currentLevel);
        const hero = HEROES[GS.selectedHero];
        
        // Dark background
        add([rect(CONFIG.MAP_WIDTH, CONFIG.MAP_HEIGHT), pos(0, 0), color(8, 6, 12), z(-2)]);
        
        // Particles
        for (let i = 0; i < 30; i++) {
            const p = add([
                circle(rand(1, 2)),
                pos(rand(0, CONFIG.MAP_WIDTH), rand(0, CONFIG.MAP_HEIGHT)),
                color(rand(100, 180), rand(80, 140), rand(60, 100)),
                opacity(rand(0.2, 0.4)),
                z(-1),
                { vy: rand(-20, -40), life: rand(3, 8) }
            ]);
            p.onUpdate(() => {
                p.pos.y += p.vy * dt();
                p.life -= dt();
                if (p.life <= 0 || p.pos.y < -10) {
                    p.pos.y = CONFIG.MAP_HEIGHT + 10;
                    p.pos.x = rand(0, CONFIG.MAP_WIDTH);
                    p.life = rand(3, 8);
                }
            });
        }
        
        // Borders
        add([rect(CONFIG.MAP_WIDTH, 3), pos(0, 0), color(139, 90, 43), z(50)]);
        add([rect(CONFIG.MAP_WIDTH, 3), pos(0, CONFIG.MAP_HEIGHT - 3), color(139, 90, 43), z(50)]);
        
        // Level number (big)
        add([
            text(`LEVEL ${GS.currentLevel}`, { size: 56 }),
            pos(CONFIG.MAP_WIDTH / 2, 120),
            anchor("center"),
            color(200, 160, 100),
        ]);
        
        // Level name
        add([
            text(level.name, { size: 32 }),
            pos(CONFIG.MAP_WIDTH / 2, 180),
            anchor("center"),
            color(180, 140, 90),
        ]);
        
        // Subtitle
        add([
            text(level.subtitle || "", { size: 14 }),
            pos(CONFIG.MAP_WIDTH / 2, 215),
            anchor("center"),
            color(120, 100, 80),
        ]);
        
        // Separator
        add([rect(350, 2), pos(CONFIG.MAP_WIDTH / 2, 250), anchor("center"), color(80, 60, 45)]);
        
        // Hero portrait area
        add([
            rect(80, 80, { radius: 8 }),
            pos(100, 340),
            anchor("center"),
            color(40, 35, 45),
        ]);
        
        add([
            text(hero?.icon || "⚔️", { size: 48 }),
            pos(100, 340),
            anchor("center"),
        ]);
        
        // Hero name
        add([
            text(hero?.name || "HERO", { size: 12 }),
            pos(100, 390),
            anchor("center"),
            color(...(hero?.color || [180, 180, 180])),
        ]);
        
        // Dialogue box
        add([
            rect(520, 100, { radius: 8 }),
            pos(430, 340),
            anchor("center"),
            color(30, 25, 35),
            outline(2, rgb(80, 60, 50)),
        ]);
        
        // Hero dialogue (typed effect)
        const dialogueText = level.heroDialogue || "...";
        let displayedText = "";
        let charIndex = 0;
        
        const dialogueDisplay = add([
            text("", { size: 14, width: 490, lineSpacing: 6 }),
            pos(180, 310),
            anchor("topleft"),
            color(200, 190, 180),
        ]);
        
        // Typing effect
        const typeInterval = loop(0.03, () => {
            if (charIndex < dialogueText.length) {
                displayedText += dialogueText[charIndex];
                dialogueDisplay.text = `"${displayedText}"`;
                charIndex++;
            }
        });
        
        // Enemy count info
        add([
            text(`Enemies: ${level.enemyCount}`, { size: 12 }),
            pos(CONFIG.MAP_WIDTH / 2 - 80, 440),
            anchor("center"),
            color(150, 140, 130),
        ]);
        
        add([
            text(`Difficulty: x${level.difficultyMultiplier}`, { size: 12 }),
            pos(CONFIG.MAP_WIDTH / 2 + 80, 440),
            anchor("center"),
            color(150, 140, 130),
        ]);
        
        // Continue button
        const btnY = CONFIG.MAP_HEIGHT - 70;
        
        add([
            rect(200, 50, { radius: 5 }),
            pos(CONFIG.MAP_WIDTH / 2, btnY),
            anchor("center"),
            color(139, 90, 43),
            opacity(0.4),
            z(9),
        ]);
        
        const btn = add([
            rect(190, 45, { radius: 4 }),
            pos(CONFIG.MAP_WIDTH / 2, btnY),
            anchor("center"),
            color(50, 40, 30),
            area(),
            z(10),
            "btn",
        ]);
        
        add([
            text("ENTER DUNGEON", { size: 16 }),
            pos(CONFIG.MAP_WIDTH / 2, btnY),
            anchor("center"),
            color(200, 170, 120),
            z(11),
        ]);
        
        btn.onHoverUpdate(() => btn.color = rgb(70, 55, 40));
        btn.onHoverEnd(() => btn.color = rgb(50, 40, 30));
        
        const startLevel = () => {
            typeInterval.cancel();
            playSound('start');
            go("game");
        };
        
        onClick("btn", startLevel);
        onKeyPress("space", startLevel);
        onKeyPress("enter", startLevel);
        
        // Mobile touch support
        onTouchStart((touchPos) => {
            if (touchPos.x >= CONFIG.MAP_WIDTH / 2 - 95 && touchPos.x <= CONFIG.MAP_WIDTH / 2 + 95 &&
                touchPos.y >= btnY - 22 && touchPos.y <= btnY + 22) {
                startLevel();
            }
        });
        
        add([
            text("TAP to enter", { size: 11 }),
            pos(CONFIG.MAP_WIDTH / 2, CONFIG.MAP_HEIGHT - 20),
            anchor("center"),
            color(100, 90, 80),
        ]);
    });
}

export default createLevelIntroScene;


