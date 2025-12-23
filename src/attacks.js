// ==================== ATTACK SYSTEMS ====================
// Melee and ranged attack logic

import { CONFIG } from './config.js';
import { GS } from './state.js';
import { playSound } from './audio.js';
import { createHitFX, createProjectileFX, createPoisonFX } from './effects.js';
import { killEnemy } from './entities/enemies.js';
import { getHero } from './data/heroes.js';

export function meleeAttack(spawnKeyFn) {
    const p = GS.player;
    if (!p || !p.exists() || p.atkCD > 0) return;
    
    p.atkCD = CONFIG.PLAYER_ATTACK_COOLDOWN;
    playSound('attack');

    const dir = GS.lastMoveDir;
    const slashAngle = Math.atan2(dir.y, dir.x) * (180 / Math.PI);
    
    // Slash arc effect
    const slashArc = add([
        circle(CONFIG.PLAYER_ATTACK_RADIUS),
        pos(p.pos),
        color(255, 255, 150),
        opacity(0.7),
        anchor("center"),
        z(20),
        scale(0.3),
        { t: 0 }
    ]);
    
    slashArc.onUpdate(() => {
        slashArc.t += dt();
        slashArc.scale = vec2(0.3 + slashArc.t * 4);
        slashArc.opacity = 0.7 - slashArc.t * 3;
        if (slashArc.t > 0.2) destroy(slashArc);
    });
    
    // Directional slash lines
    for (let i = 0; i < 3; i++) {
        const spreadAngle = slashAngle + (i - 1) * 25;
        
        const slashLine = add([
            rect(50, 6 - i),
            pos(p.pos.x, p.pos.y),
            color(255, 255, 200),
            opacity(0.9 - i * 0.2),
            anchor("left"),
            rotate(spreadAngle),
            z(19),
            { t: 0 }
        ]);
        
        slashLine.onUpdate(() => {
            slashLine.t += dt();
            slashLine.width = 50 + slashLine.t * 100;
            slashLine.opacity = (0.9 - i * 0.2) - slashLine.t * 5;
            if (slashLine.t > 0.15) destroy(slashLine);
        });
    }
    
    // Sparkle particles
    for (let i = 0; i < 8; i++) {
        const angle = slashAngle * (Math.PI / 180) + rand(-0.5, 0.5);
        const dist = 20 + rand(0, 30);
        const px = p.pos.x + Math.cos(angle) * dist;
        const py = p.pos.y + Math.sin(angle) * dist;
        
        const spark = add([
            rect(rand(3, 8), rand(2, 4)),
            pos(px, py),
            color(255, 255, rand(150, 255)),
            opacity(1),
            anchor("center"),
            rotate(rand(0, 360)),
            z(21),
            { vx: Math.cos(angle) * rand(100, 200), vy: Math.sin(angle) * rand(100, 200), life: 0.25 }
        ]);
        
        spark.onUpdate(() => {
            spark.pos.x += spark.vx * dt();
            spark.pos.y += spark.vy * dt();
            spark.life -= dt();
            spark.opacity = spark.life / 0.25;
            spark.angle += 500 * dt();
            if (spark.life <= 0) destroy(spark);
        });
    }
    
    shake(2);
    
    // Deal damage
    const stats = GS.getStats();
    for (const e of GS.enemies) {
        if (!e.exists()) continue;
        if (p.pos.dist(e.pos) <= CONFIG.PLAYER_ATTACK_RADIUS) {
            e.hp -= stats.meleeDamage;
            
            const knockDir = e.pos.sub(p.pos).unit();
            e.pos = e.pos.add(knockDir.scale(e.isBoss ? 15 : 30));
            
            createHitFX(e.pos);
            
            if (e.hp <= 0) killEnemy(e, spawnKeyFn);
        }
    }
}

export function rangedAttack(spawnKeyFn) {
    const p = GS.player;
    if (!p || p.rangedCD > 0) return;
    
    const stats = GS.getStats();
    const hero = getHero(GS.selectedHero);
    const heroRanged = hero.ranged || {};
    
    // Hero-specific cooldown
    const cooldown = heroRanged.cooldown || stats.rangedCooldown;
    p.rangedCD = cooldown;
    playSound('ranged');
    
    // Hero-specific projectile properties
    const projColor = heroRanged.projectileColor || [100, 200, 255];
    const projSize = heroRanged.projectileSize || CONFIG.RANGED_SIZE;
    const projSpeed = heroRanged.projectileSpeed || CONFIG.RANGED_SPEED;
    const dmgMult = heroRanged.damageMultiplier || 1.0;
    const piercing = heroRanged.piercing || false;
    const projShape = heroRanged.projectileShape || "orb";
    const hasPoison = heroRanged.poison || false;
    const poisonDmg = heroRanged.poisonDamage || 0;
    const poisonDur = heroRanged.poisonDuration || 0;
    
    const dir = GS.lastMoveDir;
    const angles = stats.bulletCount === 1 ? [0] :
                   stats.bulletCount === 2 ? [-0.15, 0.15] : [-0.25, 0, 0.25];
    
    angles.forEach(a => {
        const cos = Math.cos(a), sin = Math.sin(a);
        const d = { x: dir.x * cos - dir.y * sin, y: dir.x * sin + dir.y * cos };
        const angle = Math.atan2(d.y, d.x) * (180 / Math.PI);
        
        // Create projectile based on shape
        let proj;
        if (projShape === "axe") {
            proj = add([
                rect(projSize, projSize * 0.6),
                pos(p.pos.x + d.x * 25, p.pos.y + d.y * 25),
                color(...projColor), opacity(0.9),
                anchor("center"), z(15), rotate(angle),
                { dir: d, dist: 0, dmg: stats.rangedDamage * dmgMult, piercing, spin: 0, hasPoison, poisonDmg, poisonDur }
            ]);
        } else if (projShape === "dagger") {
            proj = add([
                rect(projSize * 1.5, projSize * 0.4),
                pos(p.pos.x + d.x * 25, p.pos.y + d.y * 25),
                color(...projColor), opacity(0.9),
                anchor("center"), z(15), rotate(angle),
                { dir: d, dist: 0, dmg: stats.rangedDamage * dmgMult, piercing, hasPoison, poisonDmg, poisonDur }
            ]);
        } else {
            // Default orb
            proj = add([
                circle(projSize / 2),
                pos(p.pos.x + d.x * 25, p.pos.y + d.y * 25),
                color(...projColor), opacity(0.9),
                anchor("center"), z(15),
                { dir: d, dist: 0, dmg: stats.rangedDamage * dmgMult, piercing, hasPoison, poisonDmg, poisonDur }
            ]);
        }
        
        // Glow effect
        const glow = add([
            circle(projSize * 0.8),
            pos(proj.pos),
            color(...projColor),
            opacity(0.3), anchor("center"), z(13)
        ]);
        
        // Trail particles
        let trailTimer = 0;
        
        proj.onUpdate(() => {
            if (!proj.exists()) return;
            
            const mv = projSpeed * dt();
            proj.pos.x += proj.dir.x * mv;
            proj.pos.y += proj.dir.y * mv;
            proj.dist += mv;
            if (glow.exists()) glow.pos = proj.pos;
            
            // Spin animation for axe
            if (projShape === "axe") {
                proj.spin = (proj.spin || 0) + 720 * dt();
                proj.angle = angle + proj.spin;
            }
            
            // Trail particles
            trailTimer -= dt();
            if (trailTimer <= 0) {
                trailTimer = 0.05;
                const trail = add([
                    circle(projSize * 0.3),
                    pos(proj.pos), color(...projColor), opacity(0.5),
                    anchor("center"), z(12), { t: 0 }
                ]);
                trail.onUpdate(() => {
                    trail.t += dt();
                    trail.opacity = 0.5 - trail.t * 2;
                    if (trail.t > 0.2) destroy(trail);
                });
            }
            
            // Check hit
            let hitSomething = false;
            for (const e of GS.enemies) {
                if (!e.exists()) continue;
                if (hitSomething && !proj.piercing) continue;
                
                const r = e.isBoss ? CONFIG.BOSS_SIZE / 2 + 10 : CONFIG.ENEMY_SIZE / 2 + 10;
                if (proj.pos.dist(e.pos) < r) {
                    e.hp -= proj.dmg;
                    createHitFX(e.pos);
                    
                    // Apply poison if assassin
                    if (proj.hasPoison && proj.poisonDmg > 0) {
                        applyPoison(e, proj.poisonDmg, proj.poisonDur);
                    }
                    
                    if (e.hp <= 0) killEnemy(e, spawnKeyFn);
                    hitSomething = true;
                }
            }
            
            // Destroy if hit (unless piercing) or out of bounds
            if ((hitSomething && !proj.piercing) ||
                proj.pos.x < 20 || proj.pos.x > CONFIG.MAP_WIDTH - 20 ||
                proj.pos.y < 20 || proj.pos.y > CONFIG.MAP_HEIGHT - 20 ||
                proj.dist > CONFIG.RANGED_RANGE) {
                createProjectileFX(proj.pos);
                destroy(proj);
                if (glow.exists()) destroy(glow);
            }
        });
    });
}

// Apply poison effect to enemy
function applyPoison(enemy, damage, duration) {
    if (!enemy.exists() || enemy.poisoned) return;
    
    enemy.poisoned = true;
    enemy.poisonTimer = duration;
    
    // Poison tick damage
    const poisonLoop = loop(1, () => {
        if (!enemy.exists() || enemy.poisonTimer <= 0) {
            enemy.poisoned = false;
            poisonLoop.cancel();
            return;
        }
        
        enemy.hp -= damage;
        enemy.poisonTimer -= 1;
        
        // Poison visual
        const poisonFX = add([
            text("☠️", { size: 12 }),
            pos(enemy.pos.x + rand(-10, 10), enemy.pos.y - 20),
            anchor("center"), z(25), opacity(1), { t: 0 }
        ]);
        poisonFX.onUpdate(() => {
            poisonFX.t += dt();
            poisonFX.pos.y -= 30 * dt();
            poisonFX.opacity = 1 - poisonFX.t * 2;
            if (poisonFX.t > 0.5) destroy(poisonFX);
        });
        
        // Green tint
        enemy.color = rgb(100, 200, 100);
        wait(0.3, () => {
            if (enemy.exists()) enemy.color = rgb(255, 255, 255);
        });
        
        if (enemy.hp <= 0) {
            poisonLoop.cancel();
        }
    });
}

export default { meleeAttack, rangedAttack };

