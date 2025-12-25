// ==================== HERO ABILITIES ====================
// Active abilities for each hero (separate from ultimate)

import { CONFIG } from './config.js';
import { GS } from './state.js';
import { HEROES } from './data/heroes.js';
import { playSound } from './audio.js';
import { killEnemy } from './entities/enemies.js';

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

let abilityCooldowns = {
    warrior: 0,
    mage: 0,
    assassin: 0,
    ranger: 0
};

export function setupAbilities() {
    abilityCooldowns = {
        warrior: 0,
        mage: 0,
        assassin: 0,
        ranger: 0
    };
}

export function tryUseAbility() {
    const hero = HEROES[GS.selectedHero];
    if (!hero || !hero.ability) return false;
    
    const cooldown = abilityCooldowns[GS.selectedHero] || 0;
    if (cooldown > 0) return false;
    if (!GS.player || !GS.player.exists()) return false;
    
    // Use ability!
    playSound('ranged');
    
    switch (GS.selectedHero) {
        case 'warrior':
            abilityShieldBash(hero.ability);
            break;
        case 'mage':
            abilityIceShard(hero.ability);
            break;
        case 'assassin':
            abilitySmokeBomb(hero.ability);
            break;
        case 'ranger':
            abilityMultiShot(hero.ability);
            break;
    }
    
    // Set cooldown
    abilityCooldowns[GS.selectedHero] = hero.ability.cooldown;
    
    return true;
}

export function updateAbilities() {
    const dtFn = getKaboomFn('dt');
    if (!dtFn) return;
    
    for (const heroId in abilityCooldowns) {
        if (abilityCooldowns[heroId] > 0) {
            abilityCooldowns[heroId] -= dtFn();
        }
    }
}

export function getAbilityCooldown(heroId) {
    return Math.max(0, abilityCooldowns[heroId] || 0);
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

export default { setupAbilities, tryUseAbility, updateAbilities, getAbilityCooldown };

