// ==================== PLAYER ENTITY ====================
// Player creation, movement, and logic

import { CONFIG } from '../config.js';
import { GS } from '../state.js';
import { KEYS } from '../keyboard.js';
import { KEYBINDS } from '../state.js';
import { clamp } from '../utils.js';

export function createPlayer() {
    const stats = GS.getStats();
    
    const p = add([
        sprite("player"),
        pos(80, CONFIG.MAP_HEIGHT / 2),
        area({ shape: new Rect(vec2(-12, -12), 24, 24) }),
        body(), anchor("center"), z(10),
        {
            hp: stats.maxHp,
            maxHp: stats.maxHp,
            atkCD: 0,
            rangedCD: 0,
            invuln: 0,
            stamina: stats.maxStamina,
            maxStamina: stats.maxStamina,
            sprinting: false,
            isSlowed: false,
            slowTimer: 0
        },
        "player"
    ]);
    
    GS.player = p;
    return p;
}

export function setupPlayerMovement(p) {
    let sprintTimer = 0;
    
    p.onUpdate(() => {
        const stats = GS.getStats();
        let mx = 0, my = 0;
        
        // Use native keyboard state (KEYS) + Kaboom fallback
        if (KEYS.left || KEYS.a || isKeyDown("left")) mx -= 1;
        if (KEYS.right || KEYS.d || isKeyDown("right")) mx += 1;
        if (KEYS.up || KEYS.w || isKeyDown("up")) my -= 1;
        if (KEYS.down || KEYS.s || isKeyDown("down")) my += 1;
        
        // Joystick input
        if (GS.joystickInput.x || GS.joystickInput.y) {
            mx = GS.joystickInput.x;
            my = GS.joystickInput.y;
        }
        
        // Update last move direction
        if (mx || my) {
            const len = Math.sqrt(mx * mx + my * my);
            GS.lastMoveDir = { x: mx / len, y: my / len };
        }
        
        // Sprint logic - use stat-based stamina (customizable keybind)
        const sprintKey = KEYBINDS.sprint || 'shift';
        const wantSprint = KEYS.shift || isKeyDown(sprintKey) || window.mobileSprintActive;
        const moving = mx !== 0 || my !== 0;
        
        if (wantSprint && moving && p.stamina > 0) {
            p.sprinting = true;
            p.stamina -= CONFIG.SPRINT_DRAIN_RATE * dt();
        } else {
            p.sprinting = false;
            if (p.stamina < stats.maxStamina) {
                p.stamina += stats.staminaRegen * dt();
            }
        }
        p.stamina = clamp(p.stamina, 0, stats.maxStamina);
        p.maxStamina = stats.maxStamina;
        
        // Handle slow effect (from Frost Giant)
        if (p.isSlowed) {
            p.slowTimer -= dt();
            if (p.slowTimer <= 0) {
                p.isSlowed = false;
            }
        }
        
        // Calculate speed - use stat-based speed
        let speed = stats.moveSpeed * (p.sprinting ? CONFIG.SPRINT_SPEED_MULTIPLIER : 1);
        
        // Apply slow debuff
        if (p.isSlowed) {
            speed *= 0.4; // 60% slower when frozen
        }
        
        if (mx || my) {
            const len = Math.sqrt(mx * mx + my * my);
            mx = mx / len * speed;
            my = my / len * speed;
        }
        
        // Move player
        p.move(mx, my);
        
        // Sprint FX
        if (p.sprinting && moving) {
            sprintTimer += dt();
            if (sprintTimer > 0.05) {
                sprintTimer = 0;
                const fx = add([
                    circle(rand(3, 6)),
                    pos(p.pos.x - GS.lastMoveDir.x * 15, p.pos.y - GS.lastMoveDir.y * 15),
                    color(100, 200, 255), opacity(0.7), anchor("center"), z(-1),
                    { life: 0.3 }
                ]);
                fx.onUpdate(() => {
                    fx.life -= dt();
                    fx.opacity = fx.life / 0.3 * 0.7;
                    if (fx.life <= 0) destroy(fx);
                });
            }
        }
        
        // Clamp position
        p.pos.x = clamp(p.pos.x, CONFIG.WALL_THICKNESS + 16, CONFIG.MAP_WIDTH - CONFIG.WALL_THICKNESS - 16);
        p.pos.y = clamp(p.pos.y, CONFIG.WALL_THICKNESS + 16, CONFIG.MAP_HEIGHT - CONFIG.WALL_THICKNESS - 16);
        
        // Flip sprite based on direction
        if (mx < 0) p.flipX = true;
        else if (mx > 0) p.flipX = false;
        
        // Cooldowns
        if (p.atkCD > 0) p.atkCD -= dt();
        if (p.rangedCD > 0) p.rangedCD -= dt();
        
        // Invulnerability
        if (p.invuln > 0) {
            p.invuln -= dt();
            p.opacity = Math.sin(time() * 20) > 0 ? 1 : 0.3;
        } else {
            p.opacity = 1;
        }
        
        // Sprint visual effect
        if (p.sprinting) {
            p.color = rgb(150, 255, 230);
        } else {
            p.color = rgb(255, 255, 255);
        }
    });
}

export default { createPlayer, setupPlayerMovement };
