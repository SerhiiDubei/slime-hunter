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
    
    const hero = getHero(GS.selectedHero);
    const heroMelee = hero.melee || {};
    const isMeleeSpecialist = heroMelee.isMeleeSpecialist !== false; // Default true for melee heroes
    const meleeRange = heroMelee.meleeRange || CONFIG.PLAYER_ATTACK_RADIUS;
    const meleeWidth = heroMelee.meleeWidth || 50;
    const meleeDamageMult = heroMelee.meleeDamageMultiplier || (isMeleeSpecialist ? 1.5 : 0.5);
    
    p.atkCD = CONFIG.PLAYER_ATTACK_COOLDOWN;
    
    // Play hero-specific melee sound
    if (GS.selectedHero === 'warrior') {
        playSound('melee_sword');
    } else if (GS.selectedHero === 'assassin') {
        playSound('melee_dagger');
    } else {
        playSound('melee_weak');  // Mage, Ranger
    }

    const dir = GS.lastMoveDir;
    const slashAngle = Math.atan2(dir.y, dir.x);
    const angleDeg = slashAngle * (180 / Math.PI);
    
    // DIRECTIONAL MELEE ATTACK - конус в напрямку руху (не навколо!)
    const attackStart = p.pos;
    const attackEnd = vec2(
        attackStart.x + Math.cos(slashAngle) * meleeRange,
        attackStart.y + Math.sin(slashAngle) * meleeRange
    );
    
    // Visual: Directional slash with hero-specific sprite effects
    const slashColor = GS.selectedHero === 'warrior' ? [255, 150, 50] : 
                      GS.selectedHero === 'assassin' ? [200, 255, 200] : 
                      [200, 200, 200];
    
    // Use sprite for melee specialists, rect for others
    if (isMeleeSpecialist) {
        const slashSprite = GS.selectedHero === 'warrior' ? 'swordSlash' : 'daggerSwipe';
        const slashEffect = add([
            sprite(slashSprite),
            pos(attackStart.x + Math.cos(slashAngle) * meleeRange / 2, 
                attackStart.y + Math.sin(slashAngle) * meleeRange / 2),
            anchor("center"),
            rotate(angleDeg),
            scale(meleeRange / 80), // Scale to match range
            z(20),
            opacity(0.9),
            { t: 0 }
        ]);
        
        slashEffect.onUpdate(() => {
            slashEffect.t += dt();
            slashEffect.opacity = 0.9 - slashEffect.t * 4;
            slashEffect.scale = vec2((meleeRange / 80) * (1 + slashEffect.t * 2));
            if (slashEffect.t > 0.2) destroy(slashEffect);
        });
    } else {
        // Weak melee - simple rect
        const slashRect = add([
            rect(meleeRange, meleeWidth),
            pos(attackStart.x + Math.cos(slashAngle) * meleeRange / 2, 
                attackStart.y + Math.sin(slashAngle) * meleeRange / 2),
            color(...slashColor),
            opacity(0.4),
            anchor("center"),
            rotate(angleDeg),
            z(20),
            { t: 0 }
        ]);
        
        slashRect.onUpdate(() => {
            slashRect.t += dt();
            slashRect.opacity = 0.4 - slashRect.t * 3;
            if (slashRect.t > 0.2) destroy(slashRect);
        });
    }
    
    // Strong directional slash lines (for melee specialists)
    const lineCount = isMeleeSpecialist ? 5 : 2;
    for (let i = 0; i < lineCount; i++) {
        const spreadAngle = slashAngle + (i - (lineCount - 1) / 2) * (isMeleeSpecialist ? 0.3 : 0.5);
        const spreadDeg = spreadAngle * (180 / Math.PI);
        
        const slashLine = add([
            rect(meleeRange, isMeleeSpecialist ? 8 : 4),
            pos(p.pos.x, p.pos.y),
            color(isMeleeSpecialist ? [255, 150, 50] : [200, 200, 200]),
            opacity(0.9 - i * 0.15),
            anchor("left"),
            rotate(spreadDeg),
            z(19),
            { t: 0 }
        ]);
        
        slashLine.onUpdate(() => {
            slashLine.t += dt();
            slashLine.width = meleeRange * (1 + slashLine.t * 2);
            slashLine.opacity = (0.9 - i * 0.15) - slashLine.t * 5;
            if (slashLine.t > 0.15) destroy(slashLine);
        });
    }
    
    // Impact particles (stronger for melee specialists)
    const particleCount = isMeleeSpecialist ? 12 : 6;
    for (let i = 0; i < particleCount; i++) {
        const angle = slashAngle + rand(-0.4, 0.4);
        const dist = rand(meleeRange * 0.3, meleeRange * 0.8);
        const px = p.pos.x + Math.cos(angle) * dist;
        const py = p.pos.y + Math.sin(angle) * dist;
        
        const spark = add([
            rect(rand(3, 8), rand(2, 4)),
            pos(px, py),
            color(isMeleeSpecialist ? [255, 200, 100] : [200, 200, 200]),
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
    
    shake(isMeleeSpecialist ? 4 : 2);
    
    // Deal damage - DIRECTIONAL CHECK (not circular!)
    const stats = GS.getStats();
    const baseDamage = stats.meleeDamage * meleeDamageMult;
    
    for (const e of GS.enemies) {
        if (!e || !e.exists()) continue;
        
        // Check if enemy is in directional attack area (cone/rectangle)
        const toEnemy = e.pos.sub(attackStart);
        const dist = toEnemy.len();
        const angleToEnemy = Math.atan2(toEnemy.y, toEnemy.x);
        const angleDiff = Math.abs(angleToEnemy - slashAngle);
        const normalizedAngleDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);
        
        // Check if in range and in angle cone
        const halfWidth = (meleeWidth / 2) / meleeRange; // Convert to angle
        if (dist <= meleeRange && normalizedAngleDiff <= halfWidth) {
            e.hp -= baseDamage;
            
            // Stronger knockback for melee specialists
            const knockDir = toEnemy.unit();
            const knockAmount = isMeleeSpecialist ? (e.isBoss ? 25 : 50) : (e.isBoss ? 10 : 20);
            e.pos = e.pos.add(knockDir.scale(knockAmount));
            
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
        
        // Hero-specific projectile properties (DEFINE FIRST!)
        const projColor = heroRanged.projectileColor || [100, 200, 255];
        const projSize = heroRanged.projectileSize || CONFIG.RANGED_SIZE;
        const projSpeed = heroRanged.projectileSpeed || CONFIG.RANGED_SPEED;
        const dmgMult = heroRanged.damageMultiplier || 1.0;
        const piercing = heroRanged.piercing || false;
        const projShape = heroRanged.projectileShape || "orb";
        
        // Hero-specific cooldown
        const cooldown = heroRanged.cooldown || stats.rangedCooldown;
        p.rangedCD = cooldown;
        
        // Play hero-specific ranged sound (NOW projShape is defined)
        if (projShape === 'axe') {
            playSound('ranged_axe');
        } else if (projShape === 'orb') {
            playSound('ranged_orb');
        } else if (projShape === 'dagger') {
            playSound('ranged_dagger');
        } else if (projShape === 'arrow') {
            playSound('ranged_arrow');
        } else {
            playSound('ranged');  // Fallback
        }
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
        const isHoming = heroRanged.homing || false;
        const homingStrength = heroRanged.homingStrength || 0.15;
        
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
                            trailColor, maxPierceCount, spawnKeyFn,
                            isHoming, homingStrength
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
                    trailColor, maxPierceCount, spawnKeyFn,
                    isHoming, homingStrength
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
        trailColor, maxPierceCount, spawnKeyFn,
        isHoming = false, homingStrength = 0.15
    } = options;
    
    // Calculate direction with angle offset
    const cos = Math.cos(angleOffset), sin = Math.sin(angleOffset);
    const d = { x: baseDir.x * cos - baseDir.y * sin, y: baseDir.x * sin + baseDir.y * cos };
    const angle = Math.atan2(d.y, d.x) * (180 / Math.PI);
    
    // Create projectile based on shape
    let proj;
    if (projShape === "axe") {
        // WARRIOR AXE - use sprite
        proj = add([
            sprite("axeProjectile"),
            pos(startPos.x + d.x * 25, startPos.y + d.y * 25),
            anchor("center"), z(15), rotate(angle),
            scale(projSize / 32), // Scale sprite to match size
            { 
                dir: d, dist: 0, dmg: damage, piercing, spin: 0, 
                hasPoison, poisonDmg, poisonDur, knockback, spinSpeed,
                pierceCount: 0, maxPierceCount
            }
        ]);
        
    } else if (projShape === "dagger") {
        // ASSASSIN DAGGER - use sprite
        proj = add([
            sprite("daggerProjectile"),
            pos(startPos.x + d.x * 20, startPos.y + d.y * 20),
            anchor("center"), z(15), rotate(angle),
            scale(projSize / 12), // Scale sprite
            { 
                dir: d, dist: 0, dmg: damage, piercing,
                hasPoison, poisonDmg, poisonDur, knockback,
                pierceCount: 0, maxPierceCount
            }
        ]);
        
    } else if (projShape === "arrow") {
        // RANGER ARROW - use sprite
        const arrowAngle = Math.atan2(d.y, d.x) * (180 / Math.PI);
        proj = add([
            sprite("arrowProjectile"),
            pos(startPos.x + d.x * 25, startPos.y + d.y * 25),
            anchor("center"), z(15), rotate(arrowAngle),
            scale(projSize / 8), // Scale sprite
            { 
                dir: d, dist: 0, dmg: damage, piercing,
                hasPoison, poisonDmg, poisonDur, knockback,
                pierceCount: 0, maxPierceCount
            }
        ]);
        
    } else {
        // MAGE ORB - use sprite with pulsing animation
        proj = add([
            sprite("magicOrb"),
            pos(startPos.x + d.x * 25, startPos.y + d.y * 25),
            anchor("center"), z(15),
            scale(projSize / 12), // Scale sprite
            { 
                dir: d, dist: 0, dmg: damage, piercing,
                hasPoison, poisonDmg, poisonDur, knockback,
                pierceCount: 0, maxPierceCount, pulseTime: 0
            }
        ]);
        
        // Pulsing glow effect
        proj.onUpdate(() => {
            if (!proj.exists()) return;
            proj.pulseTime = (proj.pulseTime || 0) + dt();
            const pulseScale = 1 + Math.sin(proj.pulseTime * 10) * 0.2;
            proj.scale = vec2((projSize / 12) * pulseScale);
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
        
        // HOMING LOGIC (Ranger arrows)
        if (isHoming && GS.enemies && GS.enemies.length > 0) {
            // Find nearest enemy
            let nearestEnemy = null;
            let nearestDist = Infinity;
            for (const e of GS.enemies) {
                if (!e || !e.exists()) continue;
                const dist = proj.pos.dist(e.pos);
                if (dist < nearestDist && dist < 400) { // Only home if within 400px
                    nearestDist = dist;
                    nearestEnemy = e;
                }
            }
            
            // Curve towards nearest enemy
            if (nearestEnemy) {
                const toEnemy = nearestEnemy.pos.sub(proj.pos).unit();
                // Lerp direction towards enemy
                proj.dir.x = proj.dir.x * (1 - homingStrength) + toEnemy.x * homingStrength;
                proj.dir.y = proj.dir.y * (1 - homingStrength) + toEnemy.y * homingStrength;
                // Normalize
                const len = Math.sqrt(proj.dir.x * proj.dir.x + proj.dir.y * proj.dir.y);
                if (len > 0) {
                    proj.dir.x /= len;
                    proj.dir.y /= len;
                }
                // Update angle for arrow rotation
                if (projShape === "arrow") {
                    proj.angle = Math.atan2(proj.dir.y, proj.dir.x) * (180 / Math.PI);
                }
            }
        }
        
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
        
        // Trail particles (OPTIMIZED: less frequent, use lifespan)
        trailTimer -= dt();
        if (trailTimer <= 0) {
            trailTimer = projShape === "axe" ? 0.05 : 0.1; // Less frequent
            
            const trailSize = projShape === "axe" ? projSize * 0.4 : projSize * 0.3;
            add([
                projShape === "dagger" ? rect(trailSize * 2, trailSize) : circle(trailSize),
                pos(proj.pos), color(...trailColor), opacity(0.5),
                anchor("center"), z(12), rotate(projShape === "dagger" ? angle : 0),
                lifespan(0.2, { fade: 0.15 })
            ]);
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
