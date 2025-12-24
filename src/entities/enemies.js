// ==================== ENEMY ENTITIES ====================
// Enemy spawning, AI, and boss logic

import { CONFIG } from '../config.js';
import { GS } from '../state.js';
import { playSound } from '../audio.js';
import { clamp, getSpawnPos } from '../utils.js';
import { createDeathFX, createXPFX, createLevelUpFX } from '../effects.js';
import { ENEMY_TYPES, getRandomEnemyType, getRandomTier, applyTier, TIER_CONFIG } from '../data/enemies.js';
import { getBossForLevel } from '../data/bosses.js';
import { getLevel } from '../data/levels.js';
import { Logger } from '../logger.js';

// Spawn regular enemy with tier system
export function spawnEnemy(enemyType = null, forceTier = null) {
    // Check if room has enough enemies already
    const aliveEnemies = GS.enemies.filter(e => e && e.exists() && !e.isBoss);
    const totalSpawned = GS.roomEnemiesKilled + aliveEnemies.length;
    if (totalSpawned >= GS.roomEnemyCount) {
        Logger.debug('Enemy spawn skipped - room full', { totalSpawned, roomEnemyCount: GS.roomEnemyCount });
        return;
    }
    
    // Random enemy type based on current level if not specified
    if (!enemyType) {
        enemyType = getRandomEnemyType(GS.currentLevel);
    }
    
    // Get random tier based on level and room
    const tier = forceTier || getRandomTier(GS.currentLevel, GS.currentRoom);
    
    const d = GS.difficulty();
    const sp = getSpawnPos();
    const baseType = ENEMY_TYPES[enemyType] || ENEMY_TYPES.slime;
    
    // Apply tier multipliers to base stats
    const type = applyTier(baseType, tier);
    const tierConfig = TIER_CONFIG[tier];
    
    const halfSize = type.size / 2;
    
    const e = add([
        sprite(type.sprite),
        pos(sp),
        area({ shape: new Rect(vec2(-halfSize, -halfSize), type.size, type.size) }),
        anchor("center"), z(5),
        {
            hp: type.hp * d,
            maxHp: type.hp * d,
            speed: type.speed * (tier >= 3 ? 0.85 : 1), // Higher tiers slightly slower but tankier
            damage: type.damage * d,
            isBoss: false,
            enemyType: enemyType,
            tier: tier,
            tierName: tierConfig.name,
            tierColor: tierConfig.color,
            behavior: type.behavior || "chase",
            attackCooldown: type.attackCooldown || 2.0,
            attackTimer: 0,
            attackRange: type.attackRange || 200,
            fleeRange: type.fleeRange || 80,
            projectileSpeed: type.projectileSpeed || 180,
            projectileDamage: (type.projectileDamage || 12) * d,
            xpValue: type.xp || 20,
            scoreValue: type.score || 10,
            goldValue: Array.isArray(type.gold)
                ? Math.floor(rand(type.gold[0], type.gold[1] + 1))
                : (type.gold || 10),
            // Special properties
            explodeOnDeath: type.explodeOnDeath || false,
            explosionRadius: type.explosionRadius || 60,
            explosionDamage: (type.explosionDamage || 25) * d,
            knockbackResist: type.knockbackResist || 0,
        },
        "enemy"
    ]);

    // HP bar - size based on tier
    const hpBarWidth = CONFIG.ENEMY_SIZE + 10 + (tier - 1) * 8;
    e.hpBg = add([
        rect(hpBarWidth, 5),
        pos(e.pos.x, e.pos.y - 20),
        color(40, 40, 40), anchor("center"), z(15), opacity(0.8)
    ]);
    e.hpBar = add([
        rect(hpBarWidth, 5),
        pos(e.pos.x - hpBarWidth / 2, e.pos.y - 20),
        color(...tierConfig.color), anchor("topleft"), z(16)
    ]);
    
    // Tier indicator glow for rare+ enemies
    if (tier >= 3) {
        e.tierGlow = add([
            circle(type.size * 0.6),
            pos(e.pos),
            color(...tierConfig.color),
            opacity(0.25),
            anchor("center"),
            z(4)
        ]);
    }
    
    // Name tag for elite enemies
    if (tier >= 4) {
        e.nameTag = add([
            text(`⭐ ${type.name}`, { size: 10 }),
            pos(e.pos.x, e.pos.y - 32),
            anchor("center"),
            color(...tierConfig.color),
            z(17)
        ]);
    }

    GS.enemies.push(e);

    // OPTIMIZATION: Throttle timers
    e.contactDamageTimer = 0;
    e.aiUpdateTimer = Math.random() * 0.1; // Stagger AI updates
    e.visualUpdateTimer = 0;
    
    e.onUpdate(() => {
        if (!GS.player || !e.exists()) return;
        if (GS.gamePaused || GS.gameFrozen) return;
        
        const dt_ = dt();
        
        // CRITICAL: Movement and contact damage every frame (smooth + responsive)
        const distToPlayer = e.pos.dist(GS.player.pos);
        
        // OPTIMIZATION: Throttle updates for enemies far from player
        const isFar = distToPlayer > 500;
        e.aiUpdateTimer += dt_;
        if (isFar && e.aiUpdateTimer < 0.1) {
            // Far enemies: update only 10 times/sec (skip movement this frame)
            // But still update HP bar position for smoothness
            if (e.hpBg) { e.hpBg.pos.x = e.pos.x; e.hpBg.pos.y = e.pos.y - 22; }
            if (e.hpBar) {
                const hpBarWidth = CONFIG.ENEMY_SIZE + 10 + ((e.tier || 1) - 1) * 8;
                e.hpBar.pos.x = e.pos.x - hpBarWidth / 2;
                e.hpBar.pos.y = e.pos.y - 22;
            }
            return;
        }
        if (isFar) e.aiUpdateTimer = 0;
        
        const dirToPlayer = GS.player.pos.sub(e.pos).unit();
        
        // Contact damage (always check)
        const contactRadius = CONFIG.ENEMY_SIZE / 2 + 12;
        if (distToPlayer < contactRadius && GS.player.invuln <= 0) {
            e.contactDamageTimer -= dt_;
            if (e.contactDamageTimer <= 0) {
                GS.player.hp -= e.damage;
                GS.player.invuln = 0.5;
                playSound('hit');
                shake(6);
                const pushDir = GS.player.pos.sub(e.pos).unit();
                GS.player.pos = GS.player.pos.add(pushDir.scale(30));
                e.contactDamageTimer = 0.3;
                if (GS.player.hp <= 0) {
                    playSound('gameover');
                    wait(0.5, () => go("gameover"));
                }
            }
        } else {
            e.contactDamageTimer = 0;
        }
        
        // Movement every frame (smooth) with wall collision check
        let newPos = e.pos;
        if (e.behavior === "ranged") {
            const oldPos = e.pos;
            rangedBehavior(e, distToPlayer, dirToPlayer);
            newPos = e.pos;
            e.pos = oldPos; // Reset to check collision
        } else {
            newPos = e.pos.add(dirToPlayer.scale(e.speed * dt_));
        }
        
        // Check if new position is walkable (not a wall/pillar)
        if (GS.roomShape && GS.roomShape.grid) {
            const gx = Math.floor(newPos.x / 40);
            const gy = Math.floor(newPos.y / 40);
            if (gx >= 0 && gx < GS.roomShape.width && gy >= 0 && gy < GS.roomShape.height) {
                const tileType = GS.roomShape.grid[gy][gx];
                if (tileType === 1) { // Only move if walkable
                    e.pos = newPos;
                }
                // If blocked, try moving only X or only Y
                else {
                    const tryX = vec2(newPos.x, e.pos.y);
                    const tryY = vec2(e.pos.x, newPos.y);
                    const gxX = Math.floor(tryX.x / 40);
                    const gyX = Math.floor(tryX.y / 40);
                    const gxY = Math.floor(tryY.x / 40);
                    const gyY = Math.floor(tryY.y / 40);
                    
                    if (gxX >= 0 && gxX < GS.roomShape.width && gyX >= 0 && gyX < GS.roomShape.height &&
                        GS.roomShape.grid[gyX][gxX] === 1) {
                        e.pos = tryX;
                    } else if (gxY >= 0 && gxY < GS.roomShape.width && gyY >= 0 && gyY < GS.roomShape.height &&
                               GS.roomShape.grid[gyY][gxY] === 1) {
                        e.pos = tryY;
                    }
                    // Otherwise stay in place
                }
            } else {
                e.pos = newPos; // Out of bounds - let clamp handle it
            }
        } else {
            e.pos = newPos; // No room shape - fallback
        }
        
        // Clamp position
        e.pos.x = clamp(e.pos.x, CONFIG.WALL_THICKNESS + 20, CONFIG.MAP_WIDTH - CONFIG.WALL_THICKNESS - 20);
        e.pos.y = clamp(e.pos.y, CONFIG.WALL_THICKNESS + 20, CONFIG.MAP_HEIGHT - CONFIG.WALL_THICKNESS - 20);
        
        // HP bar position (every frame for smoothness)
        const hpBarWidth = CONFIG.ENEMY_SIZE + 10 + ((e.tier || 1) - 1) * 8;
        if (e.hpBg) { e.hpBg.pos.x = e.pos.x; e.hpBg.pos.y = e.pos.y - 22; }
        if (e.hpBar) {
            e.hpBar.pos.x = e.pos.x - hpBarWidth / 2;
            e.hpBar.pos.y = e.pos.y - 22;
        }
        
        // THROTTLED: Visual updates (10/sec instead of 60)
        e.visualUpdateTimer += dt_;
        if (e.visualUpdateTimer >= 0.1) {
            e.visualUpdateTimer = 0;
            
            // Bounce animation
            const bounce = 1 + Math.sin(time() * 8) * 0.1;
            e.scale = vec2(bounce, 1 / bounce);
            
            // Flip direction
            if (dirToPlayer.x < 0) e.flipX = true;
            else if (dirToPlayer.x > 0) e.flipX = false;
            
            // HP bar color/width update
            if (e.hpBar) {
                const pct = Math.max(0, e.hp / e.maxHp);
                e.hpBar.width = pct * hpBarWidth;
                if (e.tierColor) {
                    const tc = e.tierColor;
                    e.hpBar.color = pct > 0.5 ? rgb(tc[0], tc[1], tc[2]) : 
                                    pct > 0.25 ? rgb(Math.min(255, tc[0] + 50), Math.min(255, tc[1] + 50), tc[2]) : 
                                    rgb(200, 100, 100);
                } else if (e.behavior === "ranged") {
                    e.hpBar.color = pct > 0.5 ? rgb(168, 85, 247) : pct > 0.25 ? rgb(200, 150, 200) : rgb(200, 100, 100);
                } else {
                    e.hpBar.color = pct > 0.5 ? rgb(100, 200, 100) : pct > 0.25 ? rgb(200, 200, 100) : rgb(200, 100, 100);
                }
            }
            
            // Tier glow update
            if (e.tierGlow && e.tierGlow.exists()) {
                e.tierGlow.pos = e.pos;
                e.tierGlow.opacity = 0.2 + Math.sin(time() * 4) * 0.1;
            }
            
            // Name tag update
            if (e.nameTag && e.nameTag.exists()) {
                e.nameTag.pos.x = e.pos.x;
                e.nameTag.pos.y = e.pos.y - 32;
            }
        }
    });
}

// Ranged enemy AI behavior
function rangedBehavior(e, distToPlayer, dirToPlayer) {
    e.attackTimer -= dt();
    
    if (distToPlayer < e.fleeRange) {
        const fleeDir = dirToPlayer.scale(-1);
        e.pos = e.pos.add(fleeDir.scale(e.speed * 1.3 * dt()));
    }
    else if (distToPlayer < e.attackRange) {
        const strafeDir = vec2(-dirToPlayer.y, dirToPlayer.x);
        e.pos = e.pos.add(strafeDir.scale(Math.sin(time() * 2) * e.speed * 0.3 * dt()));
        
        if (e.attackTimer <= 0) {
            shootProjectile(e, dirToPlayer);
            e.attackTimer = e.attackCooldown;
        }
    }
    else {
        e.pos = e.pos.add(dirToPlayer.scale(e.speed * 0.7 * dt()));
    }
}

// Enemy shoots a projectile
function shootProjectile(e, dir) {
    playSound('ranged');
    
    // OPTIMIZED: Using lifespan instead of onUpdate
    add([
        circle(15), pos(e.pos), color(168, 85, 247), opacity(0.5),
        anchor("center"), z(10), scale(0.5),
        lifespan(0.2, { fade: 0.15 })
    ]);
    
    wait(0.15, () => {
        if (!e.exists()) return;
        createEnemyProjectile(e.pos, dir, e.projectileSpeed, e.projectileDamage, [168, 85, 247]);
    });
}

// Create enemy projectile (used by both regular enemies and bosses)
function createEnemyProjectile(startPos, dir, speed, damage, colorRgb) {
    const proj = add([
        sprite("enemyProjectile"),
        pos(startPos.x + dir.x * 20, startPos.y + dir.y * 20),
        area({ shape: new Rect(vec2(-5, -5), 10, 10) }),
        anchor("center"), z(15),
        { dir: dir, speed: speed, damage: damage, life: 3 },
        "enemyProjectile"
    ]);
    
    const glow = add([
        circle(12), pos(proj.pos), color(...colorRgb), opacity(0.4), anchor("center"), z(14)
    ]);
    
    proj.onUpdate(() => {
        if (!proj.exists()) return;
        
        proj.pos.x += proj.dir.x * proj.speed * dt();
        proj.pos.y += proj.dir.y * proj.speed * dt();
        proj.life -= dt();
        
        if (glow.exists()) glow.pos = proj.pos;
        proj.angle = (proj.angle || 0) + 300 * dt();
        
        if (GS.player && GS.player.exists() && GS.player.invuln <= 0) {
            if (proj.pos.dist(GS.player.pos) < 25) {
                hitPlayer(proj.damage);
                createProjectileHitFX(proj.pos, true);
                destroy(proj);
                if (glow.exists()) destroy(glow);
                return;
            }
        }
        
        if (proj.life <= 0 ||
            proj.pos.x < CONFIG.WALL_THICKNESS ||
            proj.pos.x > CONFIG.MAP_WIDTH - CONFIG.WALL_THICKNESS ||
            proj.pos.y < CONFIG.WALL_THICKNESS ||
            proj.pos.y > CONFIG.MAP_HEIGHT - CONFIG.WALL_THICKNESS) {
            createProjectileHitFX(proj.pos, false);
            destroy(proj);
            if (glow.exists()) destroy(glow);
        }
    });
}

function hitPlayer(damage) {
    if (!GS.player || !GS.player.exists()) return;
    GS.player.hp -= damage;
    GS.player.invuln = 0.8;
    playSound('hit');
    shake(5);
    
    if (GS.player.hp <= 0) {
        playSound('gameover');
        wait(0.5, () => go("gameover"));
    }
}

function createProjectileHitFX(p, hitPlayer) {
    const color1 = hitPlayer ? [255, 100, 100] : [168, 85, 247];
    for (let i = 0; i < 6; i++) {
        const pt = add([
            circle(rand(3, 6)), pos(p.x, p.y), color(...color1), opacity(1),
            anchor("center"), z(20), { vx: rand(-120, 120), vy: rand(-120, 120) }
        ]);
        pt.onUpdate(() => {
            pt.pos.x += pt.vx * dt();
            pt.pos.y += pt.vy * dt();
            pt.opacity -= dt() * 4;
            if (pt.opacity <= 0) destroy(pt);
        });
    }
}

export function spawnRandomEnemy() {
    const types = ["slime"];
    if (GS.currentLevel >= 1) types.push("slime", "ranged_slime");
    if (GS.currentLevel >= 2) types.push("ranged_slime");
    const type = types[Math.floor(Math.random() * types.length)];
    spawnEnemy(type);
}

// ==================== UNIQUE BOSSES ====================

export function spawnBoss() {
    const d = GS.difficulty();
    const bossConfig = getBossForLevel(GS.currentLevel);
    const levelConfig = getLevel(GS.currentLevel);
    
    // FREEZE the game during boss intro
    GS.gameFrozen = true;
    
    // Boss entrance - dark overlay
    const overlay = add([
        rect(CONFIG.MAP_WIDTH, CONFIG.MAP_HEIGHT),
        pos(0, 0), color(0, 0, 0), opacity(0), z(90), { t: 0 }
    ]);
    
    // Fade in overlay
    overlay.onUpdate(() => {
        if (overlay.opacity < 0.7) {
            overlay.opacity += dt() * 2;
        }
    });
    
    // Boss portrait/icon
    const bossIcon = bossConfig.sprite === 'bossKing' ? '👑' : 
         bossConfig.sprite === 'bossSpeed' ? '⚡' :
         bossConfig.sprite === 'bossNecro' ? '💀' :
         bossConfig.sprite === 'bossFrost' ? '❄️' :
         bossConfig.sprite === 'bossInferno' ? '🔥' :
         bossConfig.sprite === 'bossShadow' ? '👤' : '👾';
         
    add([
        text(bossIcon, { size: 64 }),
        pos(CONFIG.MAP_WIDTH / 2, 160),
        anchor("center"), z(95), "bossIntro"
    ]);
    
    // Boss name
    add([
        text(bossConfig.name, { size: 32 }),
        pos(CONFIG.MAP_WIDTH / 2, 230),
        anchor("center"), color(255, 100, 100), z(95), "bossIntro"
    ]);
    
    // Dialogue box
    add([
        rect(600, 80, { radius: 8 }),
        pos(CONFIG.MAP_WIDTH / 2, 320),
        anchor("center"), color(30, 25, 35), outline(2, rgb(150, 80, 80)), z(95), "bossIntro"
    ]);
    
    // Boss dialogue
    const dialogue = levelConfig?.bossDialogue || "You will not survive!";
    add([
        text(`"${dialogue}"`, { size: 14, width: 560 }),
        pos(CONFIG.MAP_WIDTH / 2, 320),
        anchor("center"), color(255, 200, 200), z(96), "bossIntro"
    ]);
    
    // Skip prompt
    add([
        text("Press SPACE to continue...", { size: 10 }),
        pos(CONFIG.MAP_WIDTH / 2, 400),
        anchor("center"), color(100, 100, 100), z(96), "bossIntro"
    ]);
    
    shake(15);
    playSound('boss');
    
    // Clear intro on SPACE or after delay
    let introDone = false;
    const finishIntro = () => {
        if (introDone) return;
        introDone = true;
        overlay.opacity = 0;
        destroy(overlay);
        get("bossIntro").forEach(e => destroy(e));
        GS.gameFrozen = false;
    };
    
    onKeyPress("space", finishIntro);
    wait(3.5, finishIntro);
    
    const halfSize = bossConfig.size / 2;
    
    const b = add([
        sprite(bossConfig.sprite),
        pos(CONFIG.MAP_WIDTH / 2, 100),
        area({ shape: new Rect(vec2(-halfSize, -halfSize), bossConfig.size, bossConfig.size) }),
        anchor("center"), z(5),
        {
            hp: CONFIG.ENEMY_HP * bossConfig.hpMultiplier * d,
            maxHp: CONFIG.ENEMY_HP * bossConfig.hpMultiplier * d,
            speed: CONFIG.ENEMY_SPEED * bossConfig.speedMultiplier * d,
            damage: CONFIG.ENEMY_DAMAGE * bossConfig.damageMultiplier * d,
            isBoss: true,
            bossType: bossConfig.id,
            xpValue: bossConfig.xpBonus,
            scoreValue: bossConfig.scoreBonus,
            goldValue: Array.isArray(bossConfig.goldBonus) 
                ? Math.floor(rand(bossConfig.goldBonus[0], bossConfig.goldBonus[1] + 1))
                : (bossConfig.goldBonus || 50),
            // Ability 1 properties
            ability: bossConfig.ability,
            abilityCooldown: bossConfig.abilityCooldown || 5,
            abilityTimer: 2,
            abilityBullets: bossConfig.abilityBullets || 8,
            abilityDamage: (bossConfig.abilityDamage || 15) * d,
            abilitySpeed: bossConfig.abilitySpeed || 150,
            // Ability 2 properties
            ability2: bossConfig.ability2 || null,
            ability2Cooldown: bossConfig.ability2Cooldown || 5,
            ability2Timer: 3,
            // Boss-specific properties
            leapSpeed: bossConfig.leapSpeed || 800,
            leapDuration: bossConfig.leapDuration || 0.2,
            leapDamage: (bossConfig.leapDamage || 20) * d,
            dashSpeed: bossConfig.dashSpeed || 600,
            dashDuration: bossConfig.dashDuration || 0.3,
            dashDamage: (bossConfig.dashDamage || 25) * d,
            summonCount: bossConfig.summonCount || 2,
            maxMinions: bossConfig.maxMinions || 4,
            deathBoltDamage: (bossConfig.deathBoltDamage || 15) * d,
            deathBoltSpeed: bossConfig.deathBoltSpeed || 200,
            freezeRadius: bossConfig.freezeRadius || 100,
            freezeDuration: bossConfig.freezeDuration || 1.5,
            auraDamage: (bossConfig.auraDamage || 5) * d,
            auraRadius: bossConfig.auraRadius || 80,
            explosionDamage: (bossConfig.explosionDamage || 30) * d,
            meteorDamage: (bossConfig.meteorDamage || 40) * d,
            meteorCount: bossConfig.meteorCount || 3,
            darkWaveDamage: (bossConfig.darkWaveDamage || 20) * d,
            darkWaveSpeed: bossConfig.darkWaveSpeed || 180,
            rageDuration: bossConfig.rageDuration || 5,
            rageSpeedBoost: bossConfig.rageSpeedBoost || 2,
            rageDamageBoost: bossConfig.rageDamageBoost || 1.5,
            isRaging: false,
            rageTimer: 0,
            isDashing: false,
            dashTimer: 0,
            dashDir: vec2(0, 0),
            isCharging: false,
            chargeTimer: 0,
            targetDir: vec2(0, 0),
            leapWarning: bossConfig.leapWarning || 0.7,
            minionCount: 0,
            isSlowed: false,
            baseSpeed: CONFIG.ENEMY_SPEED * bossConfig.speedMultiplier * d,
        },
        "enemy", "boss"
    ]);

    // Boss HP bar (larger)
    b.hpBg = add([
        rect(80, 10), pos(b.pos.x, b.pos.y - 40),
        color(40, 40, 40), anchor("center"), z(15), opacity(0.8)
    ]);
    b.hpBar = add([
        rect(80, 10), pos(b.pos.x - 40, b.pos.y - 40),
        color(...bossConfig.color), anchor("topleft"), z(16)
    ]);
    
    // Boss name tag
    b.nameTag = add([
        text(bossConfig.name, { size: 10 }),
        pos(b.pos.x, b.pos.y - 52),
        anchor("center"), color(255, 220, 100), z(17)
    ]);

    GS.enemies.push(b);
    
    // Spawn minions with boss if configured
    if (levelConfig?.bossWithMinions && levelConfig.minionCount > 0) {
        for (let i = 0; i < levelConfig.minionCount; i++) {
            wait(2.8 + i * 0.3, () => {
                const angle = (i / levelConfig.minionCount) * Math.PI * 2;
                const dist = 100;
                const spawnPos = vec2(
                    CONFIG.MAP_WIDTH / 2 + Math.cos(angle) * dist,
                    150 + Math.sin(angle) * 50
                );
                spawnMinionAt(spawnPos);
            });
        }
    }

    // Contact damage timer for boss
    b.contactDamageTimer = 0;
    
    b.onUpdate(() => {
        if (!GS.player || !b.exists()) return;
        // Freeze during pause/boss dialogue
        if (GS.gamePaused || GS.gameFrozen) return;
        
        const dirToPlayer = GS.player.pos.sub(b.pos).unit();
        const distToPlayer = b.pos.dist(GS.player.pos);
        
        // CONTACT DAMAGE CHECK - fixes bug where overlapping entities don't trigger collision
        const contactRadius = CONFIG.BOSS_SIZE / 2 + 16;
        if (distToPlayer < contactRadius && GS.player.invuln <= 0) {
            b.contactDamageTimer -= dt();
            if (b.contactDamageTimer <= 0) {
                // Deal contact damage
                GS.player.hp -= b.damage;
                GS.player.invuln = 0.4; // Shorter invuln for contact damage
                playSound('hit');
                shake(15);
                
                // Push player away
                const pushDir = GS.player.pos.sub(b.pos).unit();
                GS.player.pos = GS.player.pos.add(pushDir.scale(50));
                
                b.contactDamageTimer = 0.25; // Can damage again in 0.25 sec
                
                if (GS.player.hp <= 0) {
                    playSound('gameover');
                    wait(0.5, () => go("gameover"));
                }
            }
        } else {
            b.contactDamageTimer = 0;
        }
        
        // Ability cooldowns
        b.abilityTimer -= dt();
        if (b.ability2) b.ability2Timer -= dt();
        
        // Rage mode timer
        if (b.isRaging) {
            b.rageTimer -= dt();
            if (b.rageTimer <= 0) {
                b.isRaging = false;
                b.speed = b.baseSpeed;
            }
        }
        
        // Handle Ability 1
        switch (b.ability) {
            case "bullet_storm":
                bossUpdateBulletStorm(b, dirToPlayer);
                break;
            case "dash":
            case "leap":
                bossUpdateLeap(b, dirToPlayer, distToPlayer);
                break;
            case "summon":
                bossUpdateSummon(b, dirToPlayer);
                break;
            case "ice_storm":
                bossUpdateIceStorm(b, dirToPlayer);
                break;
            case "fire_aura":
                bossUpdateFireAura(b, dirToPlayer, distToPlayer);
                break;
            case "teleport":
                bossUpdateTeleport(b, dirToPlayer, distToPlayer);
                break;
            case "mega":
                bossUpdateMega(b, dirToPlayer, distToPlayer);
                break;
        }
        
        // Handle Ability 2
        if (b.ability2 && b.ability2Timer <= 0) {
            switch (b.ability2) {
                case "death_bolt":
                    bossAbilityDeathBolt(b, dirToPlayer);
                    break;
                case "freeze_zone":
                    bossAbilityFreezeZone(b, distToPlayer);
                    break;
                case "meteor":
                    bossAbilityMeteor(b);
                    break;
                case "dark_wave":
                    bossAbilityDarkWave(b, dirToPlayer);
                    break;
                case "rage":
                    bossAbilityRage(b);
                    break;
            }
            b.ability2Timer = b.ability2Cooldown;
        }
        
        // Movement (unless dashing or charging)
        if (!b.isDashing && !b.isCharging) {
            b.pos = b.pos.add(dirToPlayer.scale(b.speed * dt()));
        }
        
        // Animation based on boss type
        if ((b.ability === "dash" || b.ability === "leap") && b.isDashing) {
            b.scale = vec2(1.5, 0.7); // Stretched during dash
        } else if ((b.ability === "dash" || b.ability === "leap") && b.isCharging) {
            // Squishing down before leap - charging animation
            const pulse = 1 + Math.sin(time() * 25) * 0.15;
            b.scale = vec2(1.2 * pulse, 0.6);
        } else if (b.ability === "bullet_storm" && b.abilityTimer < 0.5 && b.abilityTimer > 0) {
            // Pulsing before attack
            const pulse = 1 + Math.sin(time() * 30) * 0.2;
            b.scale = vec2(pulse);
        } else {
            const pulse = 1 + Math.sin(time() * 4) * 0.1;
            b.scale = vec2(pulse);
        }
        
        if (dirToPlayer.x < 0) b.flipX = true;
        else if (dirToPlayer.x > 0) b.flipX = false;

        b.pos.x = clamp(b.pos.x, CONFIG.WALL_THICKNESS + 30, CONFIG.MAP_WIDTH - CONFIG.WALL_THICKNESS - 30);
        b.pos.y = clamp(b.pos.y, CONFIG.WALL_THICKNESS + 30, CONFIG.MAP_HEIGHT - CONFIG.WALL_THICKNESS - 30);

        // Update HP bar
        if (b.hpBg) { b.hpBg.pos.x = b.pos.x; b.hpBg.pos.y = b.pos.y - 45; }
        if (b.hpBar) {
            const pct = Math.max(0, b.hp / b.maxHp);
            b.hpBar.pos.x = b.pos.x - 40;
            b.hpBar.pos.y = b.pos.y - 45;
            b.hpBar.width = pct * 80;
        }
        if (b.nameTag) { b.nameTag.pos.x = b.pos.x; b.nameTag.pos.y = b.pos.y - 57; }
    });
}

// ==================== BOSS ABILITIES ====================

// Boss 1: Bullet Storm - shoots 8 bullets in all directions
function bossUpdateBulletStorm(b, dirToPlayer) {
    if (b.abilityTimer <= 0) {
        playSound('boss');
        shake(8);
        
        // Warning effect
        const warning = add([
            circle(60), pos(b.pos), color(255, 100, 100), opacity(0.5),
            anchor("center"), z(10), scale(0.5), { t: 0 }
        ]);
        warning.onUpdate(() => {
            warning.t += dt();
            warning.scale = vec2(0.5 + warning.t * 2);
            warning.opacity = 0.5 - warning.t;
            if (warning.t > 0.3) destroy(warning);
        });
        
        // Shoot bullets in all directions
        wait(0.3, () => {
            if (!b.exists()) return;
            for (let i = 0; i < b.abilityBullets; i++) {
                const angle = (i / b.abilityBullets) * Math.PI * 2;
                const dir = vec2(Math.cos(angle), Math.sin(angle));
                createBossProjectile(b.pos, dir, b.abilitySpeed, b.abilityDamage, [255, 100, 100]);
            }
            shake(5);
        });
        
        b.abilityTimer = b.abilityCooldown;
    }
}

// Boss 2: Dash Attack - fast charge at player
// Boss 2: Leap Attack - short quick jump at player
function bossUpdateLeap(b, dirToPlayer, distToPlayer) {
    const leapSpeed = b.leapSpeed || 500;
    const leapDuration = b.leapDuration || 0.18;
    const leapDamage = b.leapDamage || 15;
    const warningTime = b.leapWarning || 0.7; // Time before leap!
    
    if (b.isDashing) {
        // During leap
        b.dashTimer -= dt();
        b.pos = b.pos.add(b.dashDir.scale(leapSpeed * dt()));
        
        // Leap trail (electric effect)
        const trail = add([
            circle(12), pos(b.pos), color(0, 255, 255), opacity(0.6),
            anchor("center"), z(3), { t: 0 }
        ]);
        trail.onUpdate(() => {
            trail.t += dt();
            trail.opacity = 0.6 - trail.t * 3;
            if (trail.t > 0.2) destroy(trail);
        });
        
        // Check collision with player during leap
        if (GS.player && GS.player.exists() && GS.player.invuln <= 0) {
            if (b.pos.dist(GS.player.pos) < 35) {
                hitPlayer(leapDamage);
                shake(10);
            }
        }
        
        if (b.dashTimer <= 0) {
            b.isDashing = false;
            // Landing effect
            shake(4);
            const landing = add([
                circle(30), pos(b.pos), color(0, 255, 255), opacity(0.4),
                anchor("center"), z(2), scale(0.5), { t: 0 }
            ]);
            landing.onUpdate(() => {
                landing.t += dt();
                landing.scale = vec2(0.5 + landing.t * 3);
                landing.opacity = 0.4 - landing.t * 2;
                if (landing.t > 0.2) destroy(landing);
            });
        }
    } else if (b.isCharging) {
        // CHARGING - warning phase before leap
        b.chargeTimer -= dt();
        
        // Flashing warning on boss
        if (Math.floor(b.chargeTimer * 10) % 2 === 0) {
            // Visual pulse effect
        }
        
        if (b.chargeTimer <= 0) {
            // NOW LEAP!
            b.isCharging = false;
            b.isDashing = true;
            b.dashTimer = leapDuration;
            // Use saved target direction
            b.dashDir = b.targetDir;
        }
    } else if (b.abilityTimer <= 0 && distToPlayer > 80) {
        // START CHARGING - clear warning before leap!
        playSound('boss');
        
        b.isCharging = true;
        b.chargeTimer = warningTime;
        b.targetDir = dirToPlayer.clone(); // Save target direction
        b.abilityTimer = b.abilityCooldown;
        
        // BIG WARNING - target zone where boss will land!
        const targetPos = vec2(
            b.pos.x + dirToPlayer.x * 120,
            b.pos.y + dirToPlayer.y * 120
        );
        
        // Warning circle at target
        const warningCircle = add([
            circle(40), pos(targetPos), color(255, 50, 50), opacity(0.3),
            anchor("center"), z(2), { t: 0, maxT: warningTime }
        ]);
        warningCircle.onUpdate(() => {
            warningCircle.t += dt();
            warningCircle.opacity = 0.3 + Math.sin(warningCircle.t * 20) * 0.2;
            if (warningCircle.t > warningCircle.maxT) destroy(warningCircle);
        });
        
        // Warning line from boss to target
        const warningLine = add([
            rect(120, 6), pos(b.pos), color(255, 255, 0), opacity(0.7),
            anchor("left"), rotate(Math.atan2(dirToPlayer.y, dirToPlayer.x) * 180 / Math.PI),
            z(3), { t: 0, maxT: warningTime }
        ]);
        warningLine.onUpdate(() => {
            warningLine.t += dt();
            warningLine.opacity = 0.7 - (warningLine.t / warningLine.maxT) * 0.5;
            // Pulsing
            warningLine.width = 6 + Math.sin(warningLine.t * 20) * 2;
            if (warningLine.t > warningLine.maxT) destroy(warningLine);
        });
        
        // "!" warning text
        const warningText = add([
            text("⚠️ LEAP!", { size: 14 }), pos(b.pos.x, b.pos.y - 40),
            color(255, 255, 0), anchor("center"), z(100), { t: 0 }
        ]);
        warningText.onUpdate(() => {
            warningText.t += dt();
            warningText.opacity = 1 - warningText.t / warningTime;
            if (warningText.t > warningTime) destroy(warningText);
        });
    }
}

// Boss 3: Summon Minions
function bossUpdateSummon(b, dirToPlayer) {
    // Count current minions
    b.minionCount = GS.enemies.filter(e => e.exists() && !e.isBoss).length;
    
    if (b.abilityTimer <= 0 && b.minionCount < b.maxMinions) {
        playSound('boss');
        shake(5);
        
        // Summoning effect
        const summonFx = add([
            circle(40), pos(b.pos), color(155, 89, 182), opacity(0.6),
            anchor("center"), z(10), scale(0.3), { t: 0 }
        ]);
        summonFx.onUpdate(() => {
            summonFx.t += dt();
            summonFx.scale = vec2(0.3 + summonFx.t * 3);
            summonFx.opacity = 0.6 - summonFx.t;
            if (summonFx.t > 0.5) destroy(summonFx);
        });
        
        // Spawn minions
        wait(0.3, () => {
            for (let i = 0; i < b.summonCount; i++) {
                if (b.minionCount + i >= b.maxMinions) break;
                
                wait(i * 0.2, () => {
                    // Spawn at random position near boss
                    const angle = rand(0, Math.PI * 2);
                    const dist = rand(50, 100);
                    const spawnPos = vec2(
                        b.pos.x + Math.cos(angle) * dist,
                        b.pos.y + Math.sin(angle) * dist
                    );
                    
                    // Summon effect at spawn
                    const portal = add([
                        circle(20), pos(spawnPos), color(0, 255, 0), opacity(0.8),
                        anchor("center"), z(10), scale(0.2), { t: 0 }
                    ]);
                    portal.onUpdate(() => {
                        portal.t += dt();
                        portal.scale = vec2(0.2 + portal.t * 2);
                        portal.opacity = 0.8 - portal.t * 2;
                        if (portal.t > 0.4) destroy(portal);
                    });
                    
                    wait(0.2, () => spawnMinionAt(spawnPos));
                });
            }
        });
        
        b.abilityTimer = b.abilityCooldown;
    }
}

// Spawn a minion at specific position
function spawnMinionAt(spawnPos) {
    const d = GS.difficulty();
    const type = ENEMY_TYPES.slime;
    
    const e = add([
        sprite(type.sprite),
        pos(spawnPos),
        area({ shape: new Rect(vec2(-12, -12), 24, 24) }),
        anchor("center"), z(5), scale(0.5),
        {
            hp: type.hp * d * 0.7, // Slightly weaker
            maxHp: type.hp * d * 0.7,
            speed: type.speed * d * 1.2, // Faster
            damage: type.damage * d * 0.8,
            isBoss: false,
            isMinion: true,
            behavior: "chase",
            xpValue: 10,
            scoreValue: 5,
        },
        "enemy", "minion"
    ]);
    
    // Spawn animation
    e.onUpdate(() => {
        if (e.scale.x < 1) e.scale = vec2(Math.min(1, e.scale.x + dt() * 3));
    });

    e.hpBg = add([
        rect(CONFIG.ENEMY_SIZE, 4), pos(e.pos.x, e.pos.y - 18),
        color(40, 40, 40), anchor("center"), z(15), opacity(0.8)
    ]);
    e.hpBar = add([
        rect(CONFIG.ENEMY_SIZE, 4), pos(e.pos.x - CONFIG.ENEMY_SIZE / 2, e.pos.y - 18),
        color(0, 255, 0), anchor("topleft"), z(16)
    ]);

    GS.enemies.push(e);

    e.onUpdate(() => {
        if (!GS.player || !e.exists()) return;
        // Freeze during pause/boss dialogue
        if (GS.gamePaused || GS.gameFrozen) return;
        
        const dir = GS.player.pos.sub(e.pos).unit();
        e.pos = e.pos.add(dir.scale(e.speed * dt()));
        
        const bounce = 1 + Math.sin(time() * 10) * 0.15;
        e.scale = vec2(Math.min(1, e.scale.x), bounce);
        
        if (dir.x < 0) e.flipX = true;
        else if (dir.x > 0) e.flipX = false;

        e.pos.x = clamp(e.pos.x, CONFIG.WALL_THICKNESS + 20, CONFIG.MAP_WIDTH - CONFIG.WALL_THICKNESS - 20);
        e.pos.y = clamp(e.pos.y, CONFIG.WALL_THICKNESS + 20, CONFIG.MAP_HEIGHT - CONFIG.WALL_THICKNESS - 20);

        if (e.hpBg) { e.hpBg.pos.x = e.pos.x; e.hpBg.pos.y = e.pos.y - 20; }
        if (e.hpBar) {
            const pct = Math.max(0, e.hp / e.maxHp);
            e.hpBar.pos.x = e.pos.x - CONFIG.ENEMY_SIZE / 2;
            e.hpBar.pos.y = e.pos.y - 20;
            e.hpBar.width = pct * CONFIG.ENEMY_SIZE;
        }
    });
}

// Boss 4: Ice Storm - shoots many ice projectiles
function bossUpdateIceStorm(b, dirToPlayer) {
    if (b.abilityTimer <= 0) {
        playSound('boss');
        shake(6);
        
        // Ice charging effect - OPTIMIZED
        add([
            circle(40), pos(b.pos), color(100, 200, 255), opacity(0.4),
            anchor("center"), z(10), scale(0.5),
            lifespan(0.3, { fade: 0.2 })
        ]);
        
        wait(0.2, () => {
            if (!b.exists()) return;
            // Shoot ice projectiles in spiral pattern
            for (let i = 0; i < b.abilityBullets; i++) {
                wait(i * 0.05, () => {
                    if (!b.exists()) return;
                    const angle = (i / b.abilityBullets) * Math.PI * 2 + time();
                    const dir = vec2(Math.cos(angle), Math.sin(angle));
                    createBossProjectile(b.pos, dir, b.abilitySpeed, b.abilityDamage, [100, 200, 255]);
                });
            }
        });
        
        b.abilityTimer = b.abilityCooldown;
    }
}

// Boss 5: Fire Aura - constant fire damage nearby
function bossUpdateFireAura(b, dirToPlayer, distToPlayer) {
    // Fire aura visual
    if (Math.random() < 0.3) {
        // OPTIMIZED: Using move and lifespan
        add([
            circle(rand(6, 10)), pos(b.pos.x + rand(-25, 25), b.pos.y + rand(-25, 25)),
            color(255, rand(100, 200), 50), opacity(0.5), anchor("center"), z(4),
            move(270, 40), // Move up
            lifespan(0.25, { fade: 0.2 })
        ]);
    }
    
    // Damage player if too close
    if (GS.player && GS.player.exists() && distToPlayer < (b.auraRadius || 80)) {
        if (GS.player.invuln <= 0 && Math.random() < 0.05) {
            hitPlayer(b.auraDamage || 5);
        }
    }
    
    // Explosion attack
    if (b.abilityTimer <= 0) {
        playSound('boss');
        shake(10);
        
        // Explosion effect - OPTIMIZED
        add([
            circle(30), pos(b.pos), color(255, 100, 50), opacity(0.6),
            anchor("center"), z(15), scale(1.5),
            lifespan(0.35, { fade: 0.3 })
        ]);
        
        // Damage in radius
        if (GS.player && GS.player.exists() && GS.player.invuln <= 0) {
            if (distToPlayer < 120) {
                hitPlayer(b.explosionDamage || 30);
                shake(15);
            }
        }
        
        b.abilityTimer = b.abilityCooldown;
    }
}

// Boss 6: Teleport - teleports and creates clones
function bossUpdateTeleport(b, dirToPlayer, distToPlayer) {
    if (b.abilityTimer <= 0) {
        playSound('boss');
        
        // Disappear effect
        const disappear = add([
            circle(30), pos(b.pos), color(100, 50, 150), opacity(0.8),
            anchor("center"), z(10), { t: 0 }
        ]);
        disappear.onUpdate(() => {
            disappear.t += dt();
            disappear.scale = vec2(1 + disappear.t * 2);
            disappear.opacity = 0.8 - disappear.t * 2;
            if (disappear.t > 0.3) destroy(disappear);
        });
        
        // Teleport to random position
        wait(0.15, () => {
            if (!b.exists()) return;
            
            const newX = rand(100, CONFIG.MAP_WIDTH - 100);
            const newY = rand(100, CONFIG.MAP_HEIGHT - 100);
            b.pos = vec2(newX, newY);
            
            // Appear effect
            const appear = add([
                circle(30), pos(b.pos), color(100, 50, 150), opacity(0.8),
                anchor("center"), z(10), scale(2), { t: 0 }
            ]);
            appear.onUpdate(() => {
                appear.t += dt();
                appear.scale = vec2(2 - appear.t * 5);
                appear.opacity = 0.8 - appear.t * 2;
                if (appear.t > 0.3) destroy(appear);
            });
            
            shake(5);
        });
        
        b.abilityTimer = b.abilityCooldown;
    }
}

// Boss 7: MEGA - combines multiple abilities
function bossUpdateMega(b, dirToPlayer, distToPlayer) {
    if (b.abilityTimer <= 0) {
        // Random ability
        const abilityChoice = Math.floor(rand(0, 3));
        
        switch (abilityChoice) {
            case 0:
                // Bullet storm
                playSound('boss');
                shake(8);
                for (let i = 0; i < b.abilityBullets; i++) {
                    const angle = (i / b.abilityBullets) * Math.PI * 2;
                    const dir = vec2(Math.cos(angle), Math.sin(angle));
                    createBossProjectile(b.pos, dir, 160, 18, [255, rand(50, 150), rand(100, 200)]);
                }
                break;
            case 1:
                // Summon
                for (let i = 0; i < b.summonCount; i++) {
                    wait(i * 0.2, () => {
                        const angle = rand(0, Math.PI * 2);
                        const dist = rand(50, 100);
                        const spawnPos = vec2(b.pos.x + Math.cos(angle) * dist, b.pos.y + Math.sin(angle) * dist);
                        spawnMinionAt(spawnPos);
                    });
                }
                break;
            case 2:
                // Leap
                if (distToPlayer > 80) {
                    b.isDashing = true;
                    b.dashTimer = 0.25;
                    b.dashDir = dirToPlayer;
                    b.dashSpeed = 700;
                    b.dashDamage = 30;
                }
                break;
        }
        
        b.abilityTimer = b.abilityCooldown;
    }
}

// ==================== ABILITY 2 FUNCTIONS ====================

// Necromancer's Death Bolt - shoots homing projectile
function bossAbilityDeathBolt(b, dirToPlayer) {
    playSound('shoot');
    
    const bolt = add([
        circle(10), pos(b.pos),
        color(100, 0, 150), opacity(0.9),
        area({ shape: new Rect(vec2(-8, -8), 16, 16) }),
        anchor("center"), z(15),
        { damage: b.deathBoltDamage, speed: b.deathBoltSpeed, life: 5 },
        "enemyProjectile"
    ]);
    
    // Soul particles
    bolt.onUpdate(() => {
        if (!bolt.exists() || !GS.player) return;
        
        // Homing towards player!
        const toPlayer = GS.player.pos.sub(bolt.pos).unit();
        bolt.pos = bolt.pos.add(toPlayer.scale(bolt.speed * dt()));
        bolt.life -= dt();
        
        // Trail particles
        if (Math.random() < 0.4) {
            const p = add([
                circle(4), pos(bolt.pos), color(80, 0, 120), opacity(0.6),
                anchor("center"), z(14), { t: 0 }
            ]);
            p.onUpdate(() => { p.t += dt(); p.opacity -= 3 * dt(); if (p.t > 0.2) destroy(p); });
        }
        
        // Hit player
        if (GS.player.invuln <= 0 && bolt.pos.dist(GS.player.pos) < 25) {
            hitPlayer(bolt.damage);
            createProjectileHitFX(bolt.pos, true);
            destroy(bolt);
            return;
        }
        
        if (bolt.life <= 0) destroy(bolt);
    });
}

// Frost Giant's Freeze Zone - slows player if close
function bossAbilityFreezeZone(b, distToPlayer) {
    playSound('boss');
    shake(8);
    
    // Frost nova visual
    const frost = add([
        circle(10), pos(b.pos), color(150, 220, 255), opacity(0.8),
        anchor("center"), z(4), { r: 10, maxR: b.freezeRadius }
    ]);
    
    frost.onUpdate(() => {
        if (!frost.exists()) return;
        frost.r += 150 * dt();
        frost.radius = frost.r;
        frost.opacity = 0.8 - (frost.r / frost.maxR) * 0.6;
        
        // Apply slow to player if inside
        if (GS.player && GS.player.exists() && frost.pos.dist(GS.player.pos) < frost.r) {
            GS.player.isSlowed = true;
            GS.player.slowTimer = b.freezeDuration;
            
            // Frost effect on player
            const p = add([
                circle(5), pos(GS.player.pos.x + rand(-10, 10), GS.player.pos.y + rand(-10, 10)),
                color(200, 240, 255), opacity(0.7), anchor("center"), z(20), { t: 0 }
            ]);
            p.onUpdate(() => { p.t += dt(); p.opacity -= 2 * dt(); if (p.t > 0.5) destroy(p); });
        }
        
        if (frost.r >= frost.maxR) destroy(frost);
    });
    
    // Ice spikes at random positions
    for (let i = 0; i < 5; i++) {
        wait(i * 0.1, () => {
            const angle = rand(0, Math.PI * 2);
            const dist = rand(30, b.freezeRadius);
            const spikePos = vec2(b.pos.x + Math.cos(angle) * dist, b.pos.y + Math.sin(angle) * dist);
            
            // OPTIMIZED: Static spike with lifespan
            add([
                rect(8, 25), pos(spikePos), color(180, 230, 255), opacity(0.8),
                anchor("bot"), rotate(rand(-20, 20)), z(5),
                lifespan(1.2, { fade: 0.4 })
            ]);
        });
    }
}

// Inferno's Meteor Strike - rains meteors from sky
function bossAbilityMeteor(b) {
    playSound('boss');
    
    for (let i = 0; i < b.meteorCount; i++) {
        wait(i * 0.5, () => {
            if (!GS.player) return;
            
            // Target near player
            const targetX = GS.player.pos.x + rand(-80, 80);
            const targetY = GS.player.pos.y + rand(-80, 80);
            
            // Warning indicator
            const warning = add([
                circle(25), pos(targetX, targetY), color(255, 50, 0), opacity(0.4),
                anchor("center"), z(3), { t: 0 }
            ]);
            
            warning.onUpdate(() => {
                warning.t += dt();
                warning.opacity = 0.4 + Math.sin(warning.t * 15) * 0.3;
                if (warning.t > 1) destroy(warning);
            });
            
            // Meteor falls after delay
            wait(1, () => {
                shake(12);
                playSound('hit');
                
                // Explosion - OPTIMIZED
                add([
                    circle(40), pos(targetX, targetY), color(255, 100, 50), opacity(0.7),
                    anchor("center"), z(10),
                    lifespan(0.4, { fade: 0.3 })
                ]);
                
                // Damage player if close
                if (GS.player && GS.player.exists() && GS.player.invuln <= 0) {
                    if (vec2(targetX, targetY).dist(GS.player.pos) < 50) {
                        hitPlayer(b.meteorDamage);
                    }
                }
                
                // Fire particles
                for (let j = 0; j < 8; j++) {
                    const angle = (j / 8) * Math.PI * 2;
                    const p = add([
                        circle(rand(5, 10)), pos(targetX, targetY),
                        color(255, rand(80, 180), 0), opacity(0.8),
                        anchor("center"), z(11),
                        { vx: Math.cos(angle) * rand(50, 100), vy: Math.sin(angle) * rand(50, 100), t: 0 }
                    ]);
                    p.onUpdate(() => {
                        p.pos.x += p.vx * dt();
                        p.pos.y += p.vy * dt();
                        p.t += dt();
                        p.opacity -= 2 * dt();
                        if (p.t > 0.5) destroy(p);
                    });
                }
            });
        });
    }
}

// Shadow Lord's Dark Wave - expanding ring of darkness
function bossAbilityDarkWave(b, dirToPlayer) {
    playSound('boss');
    
    // Dark wave expanding from boss
    const wave = add([
        circle(20), pos(b.pos), color(50, 0, 80), opacity(0.7),
        anchor("center"), z(4), outline(3, rgb(150, 50, 200)), { r: 20, hit: false }
    ]);
    
    wave.onUpdate(() => {
        if (!wave.exists()) return;
        wave.r += 200 * dt();
        wave.radius = wave.r;
        wave.opacity = 0.7 - (wave.r / 300) * 0.5;
        
        // Check if wave hits player
        if (!wave.hit && GS.player && GS.player.exists() && GS.player.invuln <= 0) {
            const dist = wave.pos.dist(GS.player.pos);
            if (Math.abs(dist - wave.r) < 20) {
                hitPlayer(b.darkWaveDamage);
                wave.hit = true;
                shake(8);
            }
        }
        
        if (wave.r > 300) destroy(wave);
    });
    
    // Shadow trails from boss
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const dir = vec2(Math.cos(angle), Math.sin(angle));
        
        const shadow = add([
            rect(15, 15), pos(b.pos), color(30, 0, 50), opacity(0.8),
            anchor("center"), z(4), rotate(45),
            { dir: dir, speed: b.darkWaveSpeed, t: 0 }
        ]);
        shadow.onUpdate(() => {
            shadow.pos = shadow.pos.add(shadow.dir.scale(shadow.speed * dt()));
            shadow.t += dt();
            shadow.opacity -= dt();
            shadow.angle += 180 * dt();
            if (shadow.t > 1) destroy(shadow);
        });
    }
}

// Mega Slime's Rage Mode - temporary boost!
function bossAbilityRage(b) {
    if (b.isRaging) return; // Already raging
    
    playSound('boss');
    shake(15);
    
    b.isRaging = true;
    b.rageTimer = b.rageDuration;
    b.speed = b.baseSpeed * b.rageSpeedBoost;
    b.abilityDamage *= b.rageDamageBoost;
    
    // Rage visual
    const rageAura = add([
        circle(40), pos(b.pos), color(255, 50, 50), opacity(0.5),
        anchor("center"), z(3), { boss: b }
    ]);
    rageAura.onUpdate(() => {
        if (!rageAura.boss.exists() || !rageAura.boss.isRaging) {
            destroy(rageAura);
            return;
        }
        rageAura.pos = rageAura.boss.pos;
        rageAura.radius = 40 + Math.sin(time() * 10) * 10;
        rageAura.opacity = 0.3 + Math.sin(time() * 8) * 0.2;
    });
    
    // Rage text
    const rageText = add([
        text("RAGE!!!", { size: 20 }), pos(b.pos.x, b.pos.y - 50),
        color(255, 50, 50), anchor("center"), z(100), { t: 0 }
    ]);
    rageText.onUpdate(() => {
        rageText.t += dt();
        rageText.pos.y -= 30 * dt();
        rageText.opacity = 1 - rageText.t;
        if (rageText.t > 1) destroy(rageText);
    });
    
    // Red particles
    for (let i = 0; i < 15; i++) {
        const p = add([
            circle(rand(5, 12)), pos(b.pos.x + rand(-30, 30), b.pos.y + rand(-30, 30)),
            color(255, rand(0, 100), 0), opacity(0.8),
            anchor("center"), z(6), { vy: -rand(50, 100), t: 0 }
        ]);
        p.onUpdate(() => { p.pos.y += p.vy * dt(); p.t += dt(); p.opacity -= 1.5 * dt(); if (p.t > 0.5) destroy(p); });
    }
}

// Boss projectile (red, larger)
function createBossProjectile(startPos, dir, speed, damage, colorRgb) {
    const proj = add([
        circle(8), pos(startPos.x, startPos.y),
        color(...colorRgb), opacity(0.9),
        area({ shape: new Rect(vec2(-6, -6), 12, 12) }),
        anchor("center"), z(15),
        { dir: dir, speed: speed, damage: damage, life: 4 },
        "enemyProjectile", "bossProjectile"
    ]);
    
    const glow = add([
        circle(14), pos(proj.pos), color(...colorRgb), opacity(0.3), anchor("center"), z(14)
    ]);
    
    proj.onUpdate(() => {
        if (!proj.exists()) return;
        
        proj.pos.x += proj.dir.x * proj.speed * dt();
        proj.pos.y += proj.dir.y * proj.speed * dt();
        proj.life -= dt();
        
        if (glow.exists()) glow.pos = proj.pos;
        
        if (GS.player && GS.player.exists() && GS.player.invuln <= 0) {
            if (proj.pos.dist(GS.player.pos) < 25) {
                hitPlayer(proj.damage);
                createProjectileHitFX(proj.pos, true);
                destroy(proj);
                if (glow.exists()) destroy(glow);
                return;
            }
        }
        
        if (proj.life <= 0 ||
            proj.pos.x < CONFIG.WALL_THICKNESS ||
            proj.pos.x > CONFIG.MAP_WIDTH - CONFIG.WALL_THICKNESS ||
            proj.pos.y < CONFIG.WALL_THICKNESS ||
            proj.pos.y > CONFIG.MAP_HEIGHT - CONFIG.WALL_THICKNESS) {
            createProjectileHitFX(proj.pos, false);
            destroy(proj);
            if (glow.exists()) destroy(glow);
        }
    });
}

// ==================== KILL ENEMY ====================

export function killEnemy(e, spawnKeyFn) {
    if (!e.exists()) return;
    
    const isBoss = e.isBoss;
    const enemyPos = vec2(e.pos.x, e.pos.y); // Save position before destroy
    
    // Bomber Slime EXPLOSION!
    if (e.explodeOnDeath) {
        playSound('boss');
        shake(12);
        
        // Warning flash
        const flash = add([
            circle(10), pos(enemyPos), color(255, 150, 50), opacity(0.8),
            anchor("center"), z(50), { r: 10 }
        ]);
        flash.onUpdate(() => {
            flash.r += 300 * dt();
            flash.radius = flash.r;
            flash.opacity = 0.8 - flash.r / e.explosionRadius;
            if (flash.r >= e.explosionRadius) destroy(flash);
        });
        
        // Explosion damage to player
        if (GS.player && GS.player.exists() && GS.player.invuln <= 0) {
            if (enemyPos.dist(GS.player.pos) < e.explosionRadius) {
                hitPlayer(e.explosionDamage);
                shake(8);
            }
        }
        
        // Explosion particles
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const p = add([
                circle(rand(6, 12)), pos(enemyPos),
                color(255, rand(100, 200), 50), opacity(0.9),
                anchor("center"), z(45),
                { vx: Math.cos(angle) * rand(80, 150), vy: Math.sin(angle) * rand(80, 150), t: 0 }
            ]);
            p.onUpdate(() => {
                p.pos.x += p.vx * dt();
                p.pos.y += p.vy * dt();
                p.t += dt();
                p.opacity -= 2 * dt();
                if (p.t > 0.5) destroy(p);
            });
        }
    }
    
    GS.score += e.scoreValue || (isBoss ? CONFIG.SCORE_PER_BOSS : CONFIG.SCORE_PER_KILL);
    
    // Add gold!
    const gold = e.goldValue || (isBoss ? CONFIG.GOLD_PER_BOSS : CONFIG.GOLD_PER_KILL);
    GS.addGold(gold);
    
    // Gold pickup effect
    const goldFX = add([
        text(`+${gold}💰`, { size: 14 }),
        pos(enemyPos.x, enemyPos.y - 20),
        anchor("center"),
        color(255, 220, 100),
        z(100),
        { t: 0 }
    ]);
    goldFX.onUpdate(() => {
        goldFX.t += dt();
        goldFX.pos.y -= 40 * dt();
        goldFX.opacity = 1 - goldFX.t / 1;
        if (goldFX.t > 1) destroy(goldFX);
    });
    
    const xp = e.xpValue || (isBoss ? CONFIG.XP_PER_BOSS : CONFIG.XP_PER_KILL);
    const lvUp = GS.addXP(xp);
    
    // Add ultimate charge!
    GS.addUltimateCharge(isBoss ? 2 : 1);
    
    // Vampirism - heal on kill
    const vampLevel = GS.passiveSkills.vampirism;
    if (vampLevel > 0 && GS.player && GS.player.exists()) {
        const healAmount = isBoss 
            ? GS.getSkillEffect('vampirism', 'healOnBossKill')
            : GS.getSkillEffect('vampirism', 'healOnKill');
        
        const stats = GS.getStats();
        GS.player.hp = Math.min(GS.player.hp + healAmount, stats.maxHp);
        
        // Heal effect
        const healFX = add([
            text(`+${healAmount}❤️`, { size: 12 }),
            pos(GS.player.pos.x, GS.player.pos.y - 30),
            anchor("center"), color(100, 255, 150), z(100), { t: 0 }
        ]);
        healFX.onUpdate(() => {
            healFX.t += dt();
            healFX.pos.y -= 30 * dt();
            healFX.opacity = 1 - healFX.t;
            if (healFX.t > 1) destroy(healFX);
        });
    }
    
    playSound(isBoss ? 'boss' : 'kill');
    createDeathFX(enemyPos, isBoss);
    createXPFX(enemyPos);
    
    if (lvUp && GS.player) {
        playSound('levelup');
        createLevelUpFX(GS.player.pos);
        const txt = add([
            text(`LEVEL ${GS.playerLevel}!`, { size: 32 }),
            pos(CONFIG.MAP_WIDTH / 2, CONFIG.MAP_HEIGHT / 2 - 50),
            anchor("center"), color(255, 220, 100), z(200), { t: 0 }
        ]);
        txt.onUpdate(() => {
            txt.t += dt();
            txt.opacity = 1 - txt.t / 2;
            txt.pos.y -= 30 * dt();
            if (txt.t > 2) destroy(txt);
        });
    }
    
    if (isBoss && spawnKeyFn) spawnKeyFn(e.pos);
    
    // Cleanup
    if (e.hpBg) destroy(e.hpBg);
    if (e.hpBar) destroy(e.hpBar);
    if (e.nameTag) destroy(e.nameTag);
    if (e.tierGlow) destroy(e.tierGlow);
    
    GS.enemies = GS.enemies.filter(x => x !== e);
    destroy(e);
    
    // Don't count minions towards room progress
    if (!e.isMinion) {
        GS.enemiesKilled++;
        GS.roomEnemiesKilled++;
        
        // Check if more enemies need to spawn in this room
        const aliveEnemies = GS.enemies.filter(en => en && en.exists() && !en.isBoss && !en.isMinion);
        const spawnedSoFar = GS.roomEnemiesKilled + aliveEnemies.length;
        
        // Spawn next enemy if room isn't full yet
        if (spawnedSoFar < GS.roomEnemyCount) {
            wait(1.5, spawnRandomEnemy);
        }
        
        // Room clearing is handled in game.js onUpdate
    }
    // Minions don't spawn new enemies when killed
}

export default { spawnEnemy, spawnRandomEnemy, spawnBoss, killEnemy };
