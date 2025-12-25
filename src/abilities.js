// ==================== HERO ABILITIES ====================
// Active abilities for each hero (E, R, Q skills with levels)

import { CONFIG } from './config.js';
import { GS } from './state.js';
import { HEROES } from './data/heroes.js';
import { playSound } from './audio.js';
import { killEnemy } from './entities/enemies.js';
import { getHeroSkills, getHeroSkillByKey } from './data/heroSkills.js';

// Helper to get Kaboom functions at runtime (not at module init)
function getKaboomFn(name) {
    if (typeof window !== 'undefined' && typeof window[name] !== 'undefined') {
        return window[name];
    }
    if (typeof globalThis !== 'undefined' && typeof globalThis[name] !== 'undefined') {
        return globalThis[name];
    }
    return null;
}

// Cooldowns for each skill (E, R, Q)
let skillCooldowns = {
    E: 0,
    R: 0,
    Q: 0,
};

export function setupAbilities() {
    skillCooldowns = {
        E: 0,
        R: 0,
        Q: 0,
    };
}

// Use skill E
export function tryUseSkillE() {
    if (skillCooldowns.E > 0) return false;
    if (!GS.player || !GS.player.exists()) return false;
    
    const level = GS.getSkillLevel('E');
    if (level <= 0) return false; // Skill not learned
    
    const heroSkills = getHeroSkills(GS.selectedHero);
    const skill = heroSkills.skillE;
    if (!skill) return false;
    
    const config = skill.levels[level - 1];
    
    // Check mana cost
    if (config.manaCost && GS.player.mana < config.manaCost) {
        return false; // Not enough mana
    }
    
    // Spend mana
    if (config.manaCost) {
        GS.player.mana = Math.max(0, GS.player.mana - config.manaCost);
    }
    
    switch (GS.selectedHero) {
        case 'warrior':
            playSound('ability_shield');
            abilityShieldBash(config);
            break;
        case 'mage':
            playSound('ability_ice');
            abilityIceShard(config);
            break;
        case 'assassin':
            playSound('ability_smoke');
            abilitySmokeBomb(config);
            break;
        case 'ranger':
            playSound('ability_multishot');
            abilityMultiShot(config);
            break;
    }
    
    skillCooldowns.E = config.cooldown;
    return true;
}

// Use skill R (passive stat boost, no active use)
export function tryUseSkillR() {
    // Skill R is passive, no active use
    return false;
}

// Use skill Q (ultimate)
export function tryUseSkillQ() {
    if (skillCooldowns.Q > 0) return false;
    if (!GS.ultimateReady) return false;
    if (!GS.player || !GS.player.exists()) return false;
    
    const level = GS.getSkillLevel('Q');
    if (level <= 0) return false; // Skill not learned
    
    const heroSkills = getHeroSkills(GS.selectedHero);
    const skill = heroSkills.skillQ;
    if (!skill) return false;
    
    const config = skill.levels[level - 1];
    
    // Check mana cost
    const manaCost = config.manaCost || 0;
    if (manaCost > 0 && GS.player.mana < manaCost) {
        return false; // Not enough mana
    }
    
    // Spend mana
    if (manaCost > 0) {
        GS.player.mana = Math.max(0, GS.player.mana - manaCost);
    }
    
    // Check mana cost
    if (config.manaCost && GS.player.mana < config.manaCost) {
        return false; // Not enough mana
    }
    
    // Spend mana
    if (config.manaCost) {
        GS.player.mana = Math.max(0, GS.player.mana - config.manaCost);
    }
    
    // Use ultimate
    GS.useUltimate();
    skillCooldowns.Q = 1; // 1 second cooldown to prevent spam
    
    switch (GS.selectedHero) {
        case 'warrior':
            playSound('ultimate_earthquake');
            ultimateEarthquake(config);
            break;
        case 'mage':
            playSound('ultimate_meteor');
            ultimateMeteorShower(config);
            break;
        case 'assassin':
            playSound('ultimate_shadow');
            ultimateShadowStrike(config);
            break;
        case 'ranger':
            playSound('ultimate_arrowstorm');
            ultimateArrowStorm(config);
            break;
    }
    
    return true;
}

export function updateAbilities() {
    const dtFn = getKaboomFn('dt');
    if (!dtFn) return;
    
    for (const key in skillCooldowns) {
        if (skillCooldowns[key] > 0) {
            skillCooldowns[key] -= dtFn();
        }
    }
}

export function getSkillCooldown(key) {
    return Math.max(0, skillCooldowns[key] || 0);
}

// WARRIOR: Shield Bash - charges forward
function abilityShieldBash(config) {
    const addFn = getKaboomFn('add');
    const dtFn = getKaboomFn('dt');
    const getFn = getKaboomFn('get');
    const shakeFn = getKaboomFn('shake');
    const destroyFn = getKaboomFn('destroy');
    const rectFn = getKaboomFn('rect');
    const posFn = getKaboomFn('pos');
    const colorFn = getKaboomFn('color');
    const opacityFn = getKaboomFn('opacity');
    const anchorFn = getKaboomFn('anchor');
    const rotateFn = getKaboomFn('rotate');
    const zFn = getKaboomFn('z');
    
    if (!addFn || !dtFn || !getFn) return;
    
    const p = GS.player;
    const dir = GS.lastMoveDir;
    
    // Charge effect
    const charge = addFn([
        rectFn(30, 20), posFn(p.pos.x, p.pos.y),
        colorFn(220, 120, 60), opacityFn(0.8),
        anchorFn("center"), rotateFn(Math.atan2(dir.y, dir.x) * 180 / Math.PI),
        zFn(5), { t: 0, dist: 0 }
    ]);
    
    charge.onUpdate(() => {
        const dt = dtFn();
        charge.t += dt;
        charge.dist += 300 * dt;
        
        // Move forward
        const moveDir = dir.scale(300 * dt);
        p.pos = p.pos.add(moveDir);
        
        // Damage and stun enemies
        const enemies = getFn("enemy");
        for (const e of enemies) {
            if (!e.exists()) continue;
            const dist = e.pos.dist(p.pos);
            if (dist < 30) {
                e.hp -= config.damage;
                if (e.stunTimer === undefined) e.stunTimer = 0;
                e.stunTimer = config.stunDuration;
                
                // Knockback
                const knockDir = e.pos.sub(p.pos).unit();
                e.pos = e.pos.add(knockDir.scale(config.knockback));
                
                if (e.hp <= 0) killEnemy(e);
            }
        }
        
        if (charge.dist >= config.range || charge.t > 0.5) {
            if (destroyFn) destroyFn(charge);
        }
    });
    
    if (shakeFn) shakeFn(10);
}

// MAGE: Ice Shard - piercing freeze projectile
function abilityIceShard(config) {
    const addFn = getKaboomFn('add');
    const dtFn = getKaboomFn('dt');
    const getFn = getKaboomFn('get');
    const destroyFn = getKaboomFn('destroy');
    const rectFn = getKaboomFn('rect');
    const posFn = getKaboomFn('pos');
    const colorFn = getKaboomFn('color');
    const opacityFn = getKaboomFn('opacity');
    const anchorFn = getKaboomFn('anchor');
    const rotateFn = getKaboomFn('rotate');
    const zFn = getKaboomFn('z');
    const moveFn = getKaboomFn('move');
    
    if (!addFn || !dtFn || !getFn) return;
    
    const p = GS.player;
    const dir = GS.lastMoveDir;
    
    const shard = addFn([
        rectFn(8, 20), posFn(p.pos.x, p.pos.y),
        colorFn(100, 200, 255), opacityFn(0.9),
        anchorFn("center"), rotateFn(Math.atan2(dir.y, dir.x) * 180 / Math.PI),
        zFn(10), moveFn ? moveFn(Math.atan2(dir.y, dir.x) * 180 / Math.PI, config.speed) : null,
        { t: 0, pierced: [] }
    ].filter(x => x !== null));
    
    shard.onUpdate(() => {
        const dt = dtFn();
        shard.t += dt;
        
        // Check collision with enemies
        const enemies = getFn("enemy");
        for (const e of enemies) {
            if (!e.exists()) continue;
            if (shard.pierced.includes(e)) continue;
            
            const dist = e.pos.dist(shard.pos);
            if (dist < 20) {
                e.hp -= config.damage;
                shard.pierced.push(e);
                
                // Freeze effect
                if (e.freezeTimer === undefined) e.freezeTimer = 0;
                e.freezeTimer = config.freezeDuration;
                e.isFrozen = true;
                playSound('freeze');
                
                if (e.hp <= 0) killEnemy(e);
                
                if (!config.piercing) {
                    if (destroyFn) destroyFn(shard);
                    return;
                }
            }
        }
        
        if (shard.t > 2.0 && destroyFn) destroyFn(shard);
    });
}

// ASSASSIN: Smoke Bomb - invisibility and speed
function abilitySmokeBomb(config) {
    const addFn = getKaboomFn('add');
    const dtFn = getKaboomFn('dt');
    const destroyFn = getKaboomFn('destroy');
    const waitFn = getKaboomFn('wait');
    const circleFn = getKaboomFn('circle');
    const posFn = getKaboomFn('pos');
    const colorFn = getKaboomFn('color');
    const opacityFn = getKaboomFn('opacity');
    const anchorFn = getKaboomFn('anchor');
    const zFn = getKaboomFn('z');
    
    if (!addFn || !dtFn) return;
    
    const p = GS.player;
    
    // Smoke cloud
    const smoke = addFn([
        circleFn(config.radius), posFn(p.pos.x, p.pos.y),
        colorFn(50, 50, 50), opacityFn(0.4),
        anchorFn("center"), zFn(3), { t: 0 }
    ]);
    
    smoke.onUpdate(() => {
        const dt = dtFn();
        smoke.t += dt;
        smoke.opacity = 0.4 - (smoke.t / config.duration) * 0.4;
        if (smoke.t >= config.duration && destroyFn) destroyFn(smoke);
    });
    
    // Speed boost
    if (p.speedBoost === undefined) p.speedBoost = 1.0;
    p.speedBoost = config.speedBoost;
    
    if (waitFn) {
        waitFn(config.duration, () => {
            if (p.speedBoost) p.speedBoost = 1.0;
        });
    }
    
    // Invisibility (visual only - enemies still target)
    p.opacity = 0.5;
    if (waitFn) {
        waitFn(config.duration, () => {
            if (p.opacity) p.opacity = 1.0;
        });
    }
}

// RANGER: Multi-Shot - spread arrows
function abilityMultiShot(config) {
    const addFn = getKaboomFn('add');
    const dtFn = getKaboomFn('dt');
    const getFn = getKaboomFn('get');
    const destroyFn = getKaboomFn('destroy');
    const rectFn = getKaboomFn('rect');
    const posFn = getKaboomFn('pos');
    const colorFn = getKaboomFn('color');
    const opacityFn = getKaboomFn('opacity');
    const anchorFn = getKaboomFn('anchor');
    const rotateFn = getKaboomFn('rotate');
    const zFn = getKaboomFn('z');
    const moveFn = getKaboomFn('move');
    
    if (!addFn || !dtFn || !getFn) return;
    
    const p = GS.player;
    const dir = GS.lastMoveDir;
    const baseAngle = Math.atan2(dir.y, dir.x);
    
    for (let i = 0; i < config.arrowCount; i++) {
        const angle = baseAngle + (i - (config.arrowCount - 1) / 2) * config.spreadAngle;
        
        const arrow = addFn([
            rectFn(6, 16), posFn(p.pos.x, p.pos.y),
            colorFn(150, 200, 100), opacityFn(0.9),
            anchorFn("center"), rotateFn(angle * 180 / Math.PI),
            zFn(10), moveFn ? moveFn(angle * 180 / Math.PI, 450) : null,
            { t: 0 }
        ].filter(x => x !== null));
        
        arrow.onUpdate(() => {
            const dt = dtFn();
            arrow.t += dt;
            
            // Check collision
            const enemies = getFn("enemy");
            for (const e of enemies) {
                if (!e.exists()) continue;
                const dist = e.pos.dist(arrow.pos);
                if (dist < 20) {
                    e.hp -= config.damage;
                    if (e.hp <= 0) killEnemy(e);
                    if (destroyFn) destroyFn(arrow);
                    return;
                }
            }
            
            if (arrow.t > 1.5 && destroyFn) destroyFn(arrow);
        });
    }
}

// ULTIMATES (Q skills)
function ultimateEarthquake(config) {
    const addFn = getKaboomFn('add');
    const getFn = getKaboomFn('get');
    const circleFn = getKaboomFn('circle');
    const posFn = getKaboomFn('pos');
    const colorFn = getKaboomFn('color');
    const opacityFn = getKaboomFn('opacity');
    const anchorFn = getKaboomFn('anchor');
    const zFn = getKaboomFn('z');
    const shakeFn = getKaboomFn('shake');
    
    if (!addFn || !getFn) return;
    
    const p = GS.player;
    
    // Earthquake effect
    const quake = addFn([
        circleFn(config.radius), posFn(p.pos.x, p.pos.y),
        colorFn(150, 100, 50), opacityFn(0.3),
        anchorFn("center"), zFn(2)
    ]);
    
    // Damage and stun all enemies in radius
    const enemies = getFn("enemy");
    for (const e of enemies) {
        if (!e.exists()) continue;
        const dist = e.pos.dist(p.pos);
        if (dist < config.radius) {
            e.hp -= config.damage;
            if (e.stunTimer === undefined) e.stunTimer = 0;
            e.stunTimer = config.stunDuration;
            if (e.hp <= 0) killEnemy(e);
        }
    }
    
    if (shakeFn) shakeFn(15);
    const waitFn = getKaboomFn('wait');
    const destroyFn = getKaboomFn('destroy');
    if (waitFn && destroyFn) {
        waitFn(0.5, () => {
            if (quake && quake.exists()) destroyFn(quake);
        });
    }
}

function ultimateMeteorShower(config) {
    const addFn = getKaboomFn('add');
    const getFn = getKaboomFn('get');
    const circleFn = getKaboomFn('circle');
    const posFn = getKaboomFn('pos');
    const colorFn = getKaboomFn('color');
    const opacityFn = getKaboomFn('opacity');
    const anchorFn = getKaboomFn('anchor');
    const zFn = getKaboomFn('z');
    
    if (!addFn || !getFn) return;
    
    const p = GS.player;
    
    // Spawn meteors
    for (let i = 0; i < config.meteorCount; i++) {
        const angle = (Math.PI * 2 * i) / config.meteorCount;
        const distance = config.radius * 0.7;
        const x = p.pos.x + Math.cos(angle) * distance;
        const y = p.pos.y + Math.sin(angle) * distance;
        
        const waitFn = getKaboomFn('wait');
        const destroyFn = getKaboomFn('destroy');
        if (waitFn && destroyFn) {
            waitFn(i * 0.1, () => {
                const meteor = addFn([
                    circleFn(20), posFn(x, y),
                    colorFn(255, 100, 50), opacityFn(0.9),
                    anchorFn("center"), zFn(10)
                ]);
                
                // Damage enemies in radius
                const enemies = getFn("enemy");
                for (const e of enemies) {
                    if (!e.exists()) continue;
                    const dist = e.pos.dist(meteor.pos);
                    if (dist < config.radius) {
                        e.hp -= config.damage;
                        if (e.hp <= 0) killEnemy(e);
                    }
                }
                
                waitFn(0.3, () => {
                    if (meteor && meteor.exists()) destroyFn(meteor);
                });
            });
        }
    }
}

function ultimateShadowStrike(config) {
    const addFn = getKaboomFn('add');
    const getFn = getKaboomFn('get');
    const rectFn = getKaboomFn('rect');
    const posFn = getKaboomFn('pos');
    const colorFn = getKaboomFn('color');
    const opacityFn = getKaboomFn('opacity');
    const anchorFn = getKaboomFn('anchor');
    const zFn = getKaboomFn('z');
    
    if (!addFn || !getFn) return;
    
    const p = GS.player;
    const enemies = getFn("enemy");
    const validEnemies = enemies.filter(e => e.exists());
    
    if (validEnemies.length === 0) return;
    
    // Make player invulnerable
    p.invulnerable = true;
    
    const waitFn = getKaboomFn('wait');
    const destroyFn = getKaboomFn('destroy');
    if (!waitFn || !destroyFn) return;
    
    // Strike each enemy
    for (let i = 0; i < Math.min(config.strikes, validEnemies.length); i++) {
        waitFn(i * 0.15, () => {
            const target = validEnemies[i % validEnemies.length];
            if (!target || !target.exists()) return;
            
            // Teleport to enemy
            p.pos = target.pos;
            
            // Damage
            target.hp -= config.damage;
            if (target.hp <= 0) killEnemy(target);
            
            // Visual effect
            const strike = addFn([
                rectFn(30, 30), posFn(target.pos.x, target.pos.y),
                colorFn(100, 50, 150), opacityFn(0.8),
                anchorFn("center"), zFn(10)
            ]);
            
            waitFn(0.2, () => {
                if (strike && strike.exists()) destroyFn(strike);
            });
        });
    }
    
    // Remove invulnerability
    waitFn(config.invulnDuration, () => {
        if (p) p.invulnerable = false;
    });
}

function ultimateArrowStorm(config) {
    const addFn = getKaboomFn('add');
    const getFn = getKaboomFn('get');
    const rectFn = getKaboomFn('rect');
    const posFn = getKaboomFn('pos');
    const colorFn = getKaboomFn('color');
    const opacityFn = getKaboomFn('opacity');
    const anchorFn = getKaboomFn('anchor');
    const rotateFn = getKaboomFn('rotate');
    const zFn = getKaboomFn('z');
    const moveFn = getKaboomFn('move');
    
    if (!addFn || !getFn) return;
    
    const p = GS.player;
    
    // Spawn arrows in a circle
    for (let i = 0; i < config.arrowCount; i++) {
        const angle = (Math.PI * 2 * i) / config.arrowCount;
        const distance = config.radius * 0.5;
        const x = p.pos.x + Math.cos(angle) * distance;
        const y = p.pos.y + Math.sin(angle) * distance;
        const targetX = p.pos.x;
        const targetY = p.pos.y;
        const arrowAngle = Math.atan2(targetY - y, targetX - x);
        
        const arrow = addFn([
            rectFn(6, 16), posFn(x, y),
            colorFn(150, 200, 100), opacityFn(0.9),
            anchorFn("center"), rotateFn(arrowAngle * 180 / Math.PI),
            zFn(10), moveFn ? moveFn(arrowAngle * 180 / Math.PI, 400) : null,
            { t: 0 }
        ].filter(x => x !== null));
        
        arrow.onUpdate(() => {
            const dtFn = getKaboomFn('dt');
            if (!dtFn) return;
            const dt = dtFn();
            arrow.t += dt;
            
            // Check collision
            const enemies = getFn("enemy");
            for (const e of enemies) {
                if (!e.exists()) continue;
                const dist = e.pos.dist(arrow.pos);
                if (dist < 20) {
                    e.hp -= config.damage;
                    if (e.hp <= 0) killEnemy(e);
                    if (arrow && arrow.exists()) destroy(arrow);
                    return;
                }
            }
            
            if (arrow.t > 2.0 && arrow && arrow.exists()) destroy(arrow);
        });
    }
}

export default { setupAbilities, tryUseSkillE, tryUseSkillR, tryUseSkillQ, updateAbilities, getSkillCooldown };
