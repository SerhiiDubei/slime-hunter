// ==================== GAME SCENE ====================
// Main gameplay scene

import { CONFIG } from '../config.js';
import { GS } from '../state.js';
import { playSound } from '../audio.js';
import { KEYS } from '../keyboard.js';
import { choose } from '../utils.js';
import { createPlayer, setupPlayerMovement } from '../entities/player.js';
import { spawnRandomEnemy } from '../entities/enemies.js';
import { meleeAttack, rangedAttack } from '../attacks.js';
import { setupUltimate, tryUseUltimate, updateUltimate } from '../ultimate.js';
import { createHUD } from '../ui.js';

let door, doorText;

function spawnKey(p) {
    const k = add([
        sprite("key"), pos(p), anchor("center"), area(), z(5), scale(1), "key"
    ]);
    
    const startY = p.y;
    k.onUpdate(() => {
        k.pos.y = startY + Math.sin(time() * 4) * 5;
        k.angle = Math.sin(time() * 2) * 10;
    });
    
    const glow = add([
        circle(20), pos(p), color(255, 220, 100), opacity(0.3), anchor("center"), z(4), scale(1), "keyPart"
    ]);
    glow.onUpdate(() => {
        glow.pos = k.pos;
        glow.opacity = 0.2 + Math.sin(time() * 5) * 0.15;
        glow.scale = vec2(1.5 + Math.sin(time() * 3) * 0.3);
    });
}

export function createGameScene() {
    scene("game", () => {
        GS.enemies = [];
        GS.enemiesKilled = 0;
        GS.hasKey = false;
        GS.doorOpen = false;
        
        const lv = GS.currentLevel;
        const bgColors = [[26, 26, 46], [35, 25, 45], [45, 25, 30]];
        const bg = bgColors[lv - 1] || bgColors[0];

        // Base background
        add([rect(CONFIG.MAP_WIDTH, CONFIG.MAP_HEIGHT), pos(0, 0), color(...bg), z(-100)]);
        
        // Tiled floor
        for (let x = CONFIG.WALL_THICKNESS; x < CONFIG.MAP_WIDTH - CONFIG.WALL_THICKNESS; x += 40) {
            for (let y = CONFIG.WALL_THICKNESS; y < CONFIG.MAP_HEIGHT - CONFIG.WALL_THICKNESS; y += 40) {
                const tileShade = rand(0.85, 1.1);
                add([
                    rect(40, 40), pos(x, y),
                    color(bg[0] * tileShade, bg[1] * tileShade, bg[2] * tileShade),
                    z(-99)
                ]);
                add([rect(40, 1), pos(x, y), color(bg[0] + 20, bg[1] + 20, bg[2] + 30), opacity(0.2), z(-98)]);
                add([rect(1, 40), pos(x, y), color(bg[0] + 20, bg[1] + 20, bg[2] + 30), opacity(0.2), z(-98)]);
                
                if (rand() < 0.08) {
                    add([sprite("crack"), pos(x, y), opacity(0.4), z(-97)]);
                }
                if (rand() < 0.03) {
                    add([sprite("blood"), pos(x + rand(5, 30), y + rand(5, 30)), opacity(0.3 + lv * 0.1), z(-96), anchor("center")]);
                }
            }
        }

        // Walls
        const wc = [60 + lv * 10, 60, 100];
        for (let x = 0; x < CONFIG.MAP_WIDTH; x += 40) {
            add([sprite("wall"), pos(x, 0), z(-50)]);
            add([sprite("wall"), pos(x, CONFIG.MAP_HEIGHT - CONFIG.WALL_THICKNESS), z(-50)]);
        }
        for (let y = 0; y < CONFIG.MAP_HEIGHT; y += 40) {
            add([sprite("wall"), pos(0, y), z(-50)]);
            add([sprite("wall"), pos(CONFIG.MAP_WIDTH - CONFIG.WALL_THICKNESS, y), z(-50)]);
        }
        
        // Invisible wall colliders
        add([rect(CONFIG.MAP_WIDTH, CONFIG.WALL_THICKNESS), pos(0, 0), color(...wc), area(), body({ isStatic: true }), opacity(0), "wall"]);
        add([rect(CONFIG.MAP_WIDTH, CONFIG.WALL_THICKNESS), pos(0, CONFIG.MAP_HEIGHT - CONFIG.WALL_THICKNESS), color(...wc), area(), body({ isStatic: true }), opacity(0), "wall"]);
        add([rect(CONFIG.WALL_THICKNESS, CONFIG.MAP_HEIGHT), pos(0, 0), color(...wc), area(), body({ isStatic: true }), opacity(0), "wall"]);
        add([rect(CONFIG.WALL_THICKNESS, CONFIG.MAP_HEIGHT), pos(CONFIG.MAP_WIDTH - CONFIG.WALL_THICKNESS, 0), color(...wc), area(), body({ isStatic: true }), opacity(0), "wall"]);

        // Torches
        const torchPositions = [
            [CONFIG.WALL_THICKNESS + 5, 60],
            [CONFIG.WALL_THICKNESS + 5, CONFIG.MAP_HEIGHT - 80],
            [CONFIG.MAP_WIDTH - CONFIG.WALL_THICKNESS - 20, 60],
            [CONFIG.MAP_WIDTH - CONFIG.WALL_THICKNESS - 20, CONFIG.MAP_HEIGHT - 80],
            [CONFIG.MAP_WIDTH / 2, 5],
        ];
        torchPositions.forEach(([tx, ty]) => {
            const torch = add([sprite("torch"), pos(tx, ty), z(1), scale(1)]);
            torch.onUpdate(() => {
                torch.scale = vec2(1 + Math.sin(time() * 15) * 0.1, 1 + Math.cos(time() * 12) * 0.15);
            });
            const glow = add([circle(30), pos(tx + 8, ty + 8), color(255, 150, 50), opacity(0.15), anchor("center"), z(0)]);
            glow.onUpdate(() => {
                glow.opacity = 0.1 + Math.sin(time() * 8) * 0.05;
                glow.scale = vec2(1 + Math.sin(time() * 6) * 0.2);
            });
        });

        // Cobwebs
        add([sprite("cobweb"), pos(CONFIG.WALL_THICKNESS, CONFIG.WALL_THICKNESS), z(1), opacity(0.6)]);
        add([sprite("cobweb"), pos(CONFIG.MAP_WIDTH - CONFIG.WALL_THICKNESS, CONFIG.WALL_THICKNESS), z(1), opacity(0.6), scale(-1, 1)]);

        // Wall decorations
        for (let i = 0; i < 4 + lv; i++) {
            const side = Math.floor(rand(0, 4));
            let dx, dy;
            if (side === 0) { dx = rand(60, CONFIG.MAP_WIDTH - 60); dy = CONFIG.WALL_THICKNESS + 5; }
            else if (side === 1) { dx = rand(60, CONFIG.MAP_WIDTH - 60); dy = CONFIG.MAP_HEIGHT - CONFIG.WALL_THICKNESS - 25; }
            else if (side === 2) { dx = CONFIG.WALL_THICKNESS + 5; dy = rand(60, CONFIG.MAP_HEIGHT - 60); }
            else { dx = CONFIG.MAP_WIDTH - CONFIG.WALL_THICKNESS - 25; dy = rand(60, CONFIG.MAP_HEIGHT - 60); }
            
            const decor = choose(["skull", "bones", "moss"]);
            add([sprite(decor), pos(dx, dy), z(1), opacity(0.7 + rand(0, 0.3))]);
        }

        // Obstacles
        for (let i = 0; i < 3 + lv; i++) {
            const ox = rand(100, CONFIG.MAP_WIDTH - 100);
            const oy = rand(100, CONFIG.MAP_HEIGHT - 150);
            const obstacleType = choose(["barrel", "crate", "crate"]);
            
            add([circle(15), pos(ox, oy + 12), color(0, 0, 0), opacity(0.3), anchor("center"), z(0)]);
            add([
                sprite(obstacleType), pos(ox, oy),
                area({ shape: new Rect(vec2(-12, -12), 24, 24) }),
                body({ isStatic: true }), anchor("center"), z(3), "obstacle"
            ]);
        }

        // Door
        const dx = CONFIG.MAP_WIDTH - CONFIG.WALL_THICKNESS - 30;
        const dy = CONFIG.MAP_HEIGHT / 2;
        door = add([sprite("doorClosed"), pos(dx, dy), anchor("center"), area(), z(2), "door"]);
        doorText = add([text("🔒", { size: 16 }), pos(dx, dy - 45), anchor("center"), color(255, 100, 100), z(10)]);

        // Create player
        const p = createPlayer();
        setupPlayerMovement(p);

        // Attack handlers
        const doMeleeAttack = () => meleeAttack(spawnKey);
        const doRangedAttack = () => rangedAttack(spawnKey);

        // Setup ultimate
        setupUltimate();

        // Input
        onKeyPress("space", doMeleeAttack);
        onKeyPress("j", doMeleeAttack);
        
        let lastEState = false;
        let lastSpaceState = false;
        let lastQState = false;
        onUpdate(() => {
            // Ranged attack
            if (KEYS.e && !lastEState) doRangedAttack();
            lastEState = KEYS.e;
            
            // Melee attack
            if (KEYS.space && !lastSpaceState) doMeleeAttack();
            lastSpaceState = KEYS.space;
            
            // Ultimate ability (Q)
            if (KEYS.q && !lastQState) tryUseUltimate();
            lastQState = KEYS.q;
            
            // Update ultimate cooldown
            updateUltimate();
        });

        // Collisions
        onCollide("player", "enemy", (pl, en) => {
            if (!pl.exists() || !en.exists() || pl.invuln > 0) return;
            const e = GS.enemies.find(x => x.exists() && x.pos && x.pos.dist(en.pos) < 20);
            const dmg = e ? e.damage : CONFIG.ENEMY_DAMAGE * GS.difficulty();
            pl.hp -= dmg;
            pl.invuln = 1;
            playSound('hit');
            shake(e && e.isBoss ? 15 : 8);
            const knockback = pl.pos.sub(en.pos).unit().scale(40);
            pl.pos = pl.pos.add(knockback);
            if (pl.hp <= 0) { playSound('gameover'); wait(0.5, () => go("gameover")); }
        });

        onCollide("player", "key", () => {
            GS.hasKey = true;
            playSound('key');
            destroyAll("key");
            destroyAll("keyPart");
            GS.doorOpen = true;
            door.use(sprite("doorOpen"));
            doorText.text = "🚪 GO!";
            doorText.color = rgb(100, 255, 100);
            playSound('door');
        });

        onCollide("player", "door", () => {
            if (!GS.doorOpen) return;
            playSound('levelup');
            if (GS.currentLevel >= CONFIG.MAX_LEVELS) {
                go("victory");
            } else {
                GS.currentLevel++;
                go("shop"); // Go to shop between levels!
            }
        });

        // Spawn enemies (mix of melee and ranged)
        for (let i = 0; i < Math.min(3, CONFIG.ENEMIES_PER_LEVEL - 1); i++) {
            wait(i * 0.5, spawnRandomEnemy);
        }

        // Create HUD
        createHUD();

        // Debug toggle
        onKeyPress("f1", () => { debug.inspect = !debug.inspect; });
    });
}

export default { createGameScene };

