// ==================== ATTACK SYSTEMS ====================
// Melee and ranged attack logic with unique hero abilities

import { CONFIG } from './config.js';
import { GS } from './state.js';
import { playSound } from './audio.js';
import { createHitFX, createProjectileFX } from './effects.js';
import { killEnemy } from './entities/enemies.js';
import { getHero } from './data/heroes.js';
import { Logger } from './logger.js';

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
        if (!e || !e.exists()) continue;
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
    if (!p || !p.exists() || p.rangedCD > 0) return;
    
    try {
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
        const knockback = heroRanged.knockback || 0;
        const spinSpeed = heroRanged.spinSpeed || 360;
        const trailColor = heroRanged.trailColor || projColor;
        const maxPierceCount = heroRanged.maxPierceCount || 99;
        const burstCount = heroRanged.burstCount || 1;
        const burstSpread = heroRanged.burstSpread || 0;
        const burstDelay = heroRanged.burstDelay || 0;
        
        const dir = GS.lastMoveDir;
        const baseDamage = stats.rangedDamage * dmgMult;
        
        // Handle burst attacks (Assassin)
        if (burstCount > 1) {
            // Burst attack - shoot multiple projectiles with delay
            for (let b = 0; b < burstCount; b++) {
                wait(b * burstDelay, () => {
                    if (!p || !p.exists()) return;
                    
                    const spreadOffset = (b - (burstCount - 1) / 2) * burstSpread;
                    const angles = stats.bulletCount === 1 ? [spreadOffset] :
                                   stats.bulletCount === 2 ? [-0.15 + spreadOffset, 0.15 + spreadOffset] : 
                                   [-0.25 + spreadOffset, spreadOffset, 0.25 + spreadOffset];
                    
                    angles.forEach(a => {
                        createProjectile(p.pos, dir, a, {
                            color: projColor, size: projSize, speed: projSpeed,
                            damage: baseDamage, piercing, shape: projShape,
                            hasPoison, poisonDmg, poisonDur, knockback, spinSpeed,
                            trailColor, maxPierceCount, spawnKeyFn
                        });
                    });
                    
                    // Small shake for each dagger
                    shake(1);
                });
            }
        } else {
            // Normal single attack
            const angles = stats.bulletCount === 1 ? [0] :
                           stats.bulletCount === 2 ? [-0.15, 0.15] : [-0.25, 0, 0.25];
            
            angles.forEach(a => {
                createProjectile(p.pos, dir, a, {
                    color: projColor, size: projSize, speed: projSpeed,
                    damage: baseDamage, piercing, shape: projShape,
                    hasPoison, poisonDmg, poisonDur, knockback, spinSpeed,
                    trailColor, maxPierceCount, spawnKeyFn
                });
            });
        }
        
        // Screen shake based on projectile power
        shake(projSize > 15 ? 3 : 1);
        
    } catch (error) {
        Logger.error('Ranged attack error', { error: error.message, stack: error.stack });
    }
}

// Create a single projectile
function createProjectile(startPos, baseDir, angleOffset, options) {
    const {
        color: projColor, size: projSize, speed: projSpeed,
        damage, piercing, shape: projShape,
        hasPoison, poisonDmg, poisonDur, knockback, spinSpeed,
        trailColor, maxPierceCount, spawnKeyFn
    } = options;
    
    // Calculate direction with angle offset
    const cos = Math.cos(angleOffset), sin = Math.sin(angleOffset);
    const d = { x: baseDir.x * cos - baseDir.y * sin, y: baseDir.x * sin + baseDir.y * cos };
    const angle = Math.atan2(d.y, d.x) * (180 / Math.PI);
    
    // Create projectile based on shape
    let proj;
    if (projShape === "axe") {
        // WARRIOR AXE - big, spinning
        proj = add([
            rect(projSize, projSize * 0.6),
            pos(startPos.x + d.x * 25, startPos.y + d.y * 25),
            color(...projColor), opacity(0.95),
            anchor("center"), z(15), rotate(angle),
            { 
                dir: d, dist: 0, dmg: damage, piercing, spin: 0, 
                hasPoison, poisonDmg, poisonDur, knockback, spinSpeed,
                pierceCount: 0, maxPierceCount
            }
        ]);
        
        // Axe head detail
        const axeHead = add([
            rect(projSize * 0.4, projSize * 0.8),
            pos(proj.pos), color(projColor[0] - 30, projColor[1] - 20, projColor[2] - 20),
            opacity(0.9), anchor("center"), z(16), rotate(angle)
        ]);
        axeHead.onUpdate(() => {
            if (!proj.exists()) { destroy(axeHead); return; }
            axeHead.pos = proj.pos;
            axeHead.angle = proj.angle;
        });
        
    } else if (projShape === "dagger") {
        // ASSASSIN DAGGER - small, sleek, fast
        proj = add([
            rect(projSize * 2, projSize * 0.5),
            pos(startPos.x + d.x * 20, startPos.y + d.y * 20),
            color(...projColor), opacity(0.95),
            anchor("center"), z(15), rotate(angle),
            { 
                dir: d, dist: 0, dmg: damage, piercing,
                hasPoison, poisonDmg, poisonDur, knockback,
                pierceCount: 0, maxPierceCount
            }
        ]);
        
        // Dagger point
        const point = add([
            rect(projSize * 0.8, projSize * 0.3),
            pos(proj.pos), color(200, 255, 200), opacity(0.8),
            anchor("left"), z(16), rotate(angle)
        ]);
        point.onUpdate(() => {
            if (!proj.exists()) { destroy(point); return; }
            point.pos = vec2(proj.pos.x + d.x * projSize, proj.pos.y + d.y * projSize);
            point.angle = angle;
        });
        
    } else {
        // MAGE ORB - glowing magic sphere
        proj = add([
            circle(projSize / 2),
            pos(startPos.x + d.x * 25, startPos.y + d.y * 25),
            color(...projColor), opacity(0.95),
            anchor("center"), z(15),
            { 
                dir: d, dist: 0, dmg: damage, piercing,
                hasPoison, poisonDmg, poisonDur, knockback,
                pierceCount: 0, maxPierceCount
            }
        ]);
        
        // Inner glow
        const innerGlow = add([
            circle(projSize / 4),
            pos(proj.pos), color(255, 255, 255), opacity(0.7),
            anchor("center"), z(17)
        ]);
        innerGlow.onUpdate(() => {
            if (!proj.exists()) { destroy(innerGlow); return; }
            innerGlow.pos = proj.pos;
            innerGlow.opacity = 0.5 + Math.sin(time() * 20) * 0.3;
        });
    }
    
    // Glow effect
    const glow = add([
        circle(projSize * 0.9),
        pos(proj.pos),
        color(...trailColor),
        opacity(0.35), anchor("center"), z(13)
    ]);
    
    // Trail particles timer
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
            proj.spin = (proj.spin || 0) + spinSpeed * dt();
            proj.angle = angle + proj.spin;
        }
        
        // Trail particles
        trailTimer -= dt();
        if (trailTimer <= 0) {
            trailTimer = projShape === "axe" ? 0.03 : 0.06;
            
            const trailSize = projShape === "axe" ? projSize * 0.4 : projSize * 0.3;
            const trail = add([
                projShape === "dagger" ? rect(trailSize * 2, trailSize) : circle(trailSize),
                pos(proj.pos), color(...trailColor), opacity(0.5),
                anchor("center"), z(12), rotate(projShape === "dagger" ? angle : 0), { t: 0 }
            ]);
            trail.onUpdate(() => {
                trail.t += dt();
                trail.opacity = 0.5 - trail.t * 2.5;
                if (projShape === "orb") trail.scale = vec2(1 - trail.t * 2);
                if (trail.t > 0.2) destroy(trail);
            });
        }
        
        // Check hit
        let hitSomething = false;
        for (const e of GS.enemies) {
            if (!e || !e.exists()) continue;
            if (hitSomething && !proj.piercing) continue;
            if (proj.piercing && proj.pierceCount >= proj.maxPierceCount) continue;
            
            const r = e.isBoss ? CONFIG.BOSS_SIZE / 2 + 12 : CONFIG.ENEMY_SIZE / 2 + 10;
            if (proj.pos.dist(e.pos) < r) {
                // Deal damage
                e.hp -= proj.dmg;
                createHitFX(e.pos);
                
                // Knockback (Warrior axe)
                if (proj.knockback > 0) {
                    const kbDir = e.pos.sub(proj.pos).unit();
                    const kbAmount = e.isBoss ? proj.knockback * 0.3 : proj.knockback;
                    e.pos = e.pos.add(kbDir.scale(kbAmount));
                    shake(2);
                }
                
                // Apply poison (Assassin)
                if (proj.hasPoison && proj.poisonDmg > 0) {
                    applyPoison(e, proj.poisonDmg, proj.poisonDur);
                }
                
                if (e.hp <= 0) killEnemy(e, spawnKeyFn);
                
                hitSomething = true;
                proj.pierceCount = (proj.pierceCount || 0) + 1;
                
                // Reduce damage on pierce (Mage)
                if (proj.piercing) {
                    proj.dmg *= 0.8; // 20% less damage per pierce
                }
            }
        }
        
        // Destroy if hit (unless piercing) or out of bounds
        const shouldDestroy = (hitSomething && !proj.piercing) ||
            (proj.piercing && proj.pierceCount >= proj.maxPierceCount) ||
            proj.pos.x < 20 || proj.pos.x > CONFIG.MAP_WIDTH - 20 ||
            proj.pos.y < 20 || proj.pos.y > CONFIG.MAP_HEIGHT - 20 ||
            proj.dist > CONFIG.RANGED_RANGE;
            
        if (shouldDestroy) {
            createProjectileFX(proj.pos);
            destroy(proj);
            if (glow.exists()) destroy(glow);
        }
    });
}

// Apply poison effect to enemy (Assassin ability)
function applyPoison(enemy, damage, duration) {
    if (!enemy || !enemy.exists() || enemy.poisoned) return;
    
    enemy.poisoned = true;
    enemy.poisonTimer = duration;
    
    // Poison visual indicator
    enemy.use(color(100, 200, 100));
    
    // Poison tick damage
    const poisonLoop = loop(1, () => {
        if (!enemy || !enemy.exists() || enemy.poisonTimer <= 0) {
            if (enemy && enemy.exists()) {
                enemy.poisoned = false;
                enemy.use(color(255, 255, 255));
            }
            poisonLoop.cancel();
            return;
        }
        
        enemy.hp -= damage;
        enemy.poisonTimer -= 1;
        
        // Poison bubble visual
        const poisonFX = add([
            text("☠️", { size: 14 }),
            pos(enemy.pos.x + rand(-15, 15), enemy.pos.y - 25),
            anchor("center"), z(25), opacity(1), { t: 0 }
        ]);
        poisonFX.onUpdate(() => {
            poisonFX.t += dt();
            poisonFX.pos.y -= 35 * dt();
            poisonFX.opacity = 1 - poisonFX.t * 2;
            if (poisonFX.t > 0.5) destroy(poisonFX);
        });
        
        // Green damage number
        const dmgText = add([
            text(`-${damage}`, { size: 12 }),
            pos(enemy.pos.x, enemy.pos.y - 15),
            anchor("center"), color(100, 255, 100), z(26), { t: 0 }
        ]);
        dmgText.onUpdate(() => {
            dmgText.t += dt();
            dmgText.pos.y -= 25 * dt();
            dmgText.opacity = 1 - dmgText.t * 2;
            if (dmgText.t > 0.5) destroy(dmgText);
        });
        
        // Pulse green tint
        enemy.use(color(80, 200, 80));
        wait(0.3, () => {
            if (enemy && enemy.exists() && enemy.poisoned) {
                enemy.use(color(120, 220, 120));
            }
        });
        
        if (enemy.hp <= 0) {
            poisonLoop.cancel();
        }
    });
}

export default { meleeAttack, rangedAttack };
