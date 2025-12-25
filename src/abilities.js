// ==================== HERO ABILITIES ====================
// Active abilities for each hero (separate from ultimate)

import { CONFIG } from './config.js';
import { GS } from './state.js';
import { HEROES } from './data/heroes.js';
import { playSound } from './audio.js';
import { killEnemy } from './entities/enemies.js';

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
    for (const heroId in abilityCooldowns) {
        if (abilityCooldowns[heroId] > 0) {
            abilityCooldowns[heroId] -= dt();
        }
    }
}

export function getAbilityCooldown(heroId) {
    return Math.max(0, abilityCooldowns[heroId] || 0);
}

// WARRIOR: Shield Bash - charges forward
function abilityShieldBash(config) {
    const p = GS.player;
    const dir = GS.lastMoveDir;
    
    // Charge effect
    const charge = add([
        rect(30, 20), pos(p.pos),
        color(220, 120, 60), opacity(0.8),
        anchor("center"), rotate(Math.atan2(dir.y, dir.x) * 180 / Math.PI),
        z(5), { t: 0, dist: 0 }
    ]);
    
    charge.onUpdate(() => {
        charge.t += dt();
        charge.dist += 300 * dt();
        
        // Move forward
        const moveDir = dir.scale(300 * dt());
        p.pos = p.pos.add(moveDir);
        
        // Damage and stun enemies
        for (const e of get("enemy")) {
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
            destroy(charge);
        }
    });
    
    shake(10);
}

// MAGE: Ice Shard - piercing freeze projectile
function abilityIceShard(config) {
    const p = GS.player;
    const dir = GS.lastMoveDir;
    
    const shard = add([
        rect(8, 20), pos(p.pos),
        color(100, 200, 255), opacity(0.9),
        anchor("center"), rotate(Math.atan2(dir.y, dir.x) * 180 / Math.PI),
        z(10), move(Math.atan2(dir.y, dir.x) * 180 / Math.PI, config.speed),
        { t: 0, pierced: [] }
    ]);
    
    shard.onUpdate(() => {
        shard.t += dt();
        
        // Check collision with enemies
        for (const e of get("enemy")) {
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
                    destroy(shard);
                    return;
                }
            }
        }
        
        if (shard.t > 2.0) destroy(shard);
    });
}

// ASSASSIN: Smoke Bomb - invisibility and speed
function abilitySmokeBomb(config) {
    const p = GS.player;
    
    // Smoke cloud
    const smoke = add([
        circle(config.radius), pos(p.pos),
        color(50, 50, 50), opacity(0.4),
        anchor("center"), z(3), { t: 0 }
    ]);
    
    smoke.onUpdate(() => {
        smoke.t += dt();
        smoke.opacity = 0.4 - (smoke.t / config.duration) * 0.4;
        if (smoke.t >= config.duration) destroy(smoke);
    });
    
    // Speed boost
    if (p.speedBoost === undefined) p.speedBoost = 1.0;
    p.speedBoost = config.speedBoost;
    
    wait(config.duration, () => {
        if (p.speedBoost) p.speedBoost = 1.0;
    });
    
    // Invisibility (visual only - enemies still target)
    p.opacity = 0.5;
    wait(config.duration, () => {
        if (p.opacity) p.opacity = 1.0;
    });
}

// RANGER: Multi-Shot - spread arrows
function abilityMultiShot(config) {
    const p = GS.player;
    const dir = GS.lastMoveDir;
    const baseAngle = Math.atan2(dir.y, dir.x);
    
    for (let i = 0; i < config.arrowCount; i++) {
        const angle = baseAngle + (i - (config.arrowCount - 1) / 2) * config.spreadAngle;
        
        const arrow = add([
            rect(6, 16), pos(p.pos),
            color(150, 200, 100), opacity(0.9),
            anchor("center"), rotate(angle * 180 / Math.PI),
            z(10), move(angle * 180 / Math.PI, 450),
            { t: 0 }
        ]);
        
        arrow.onUpdate(() => {
            arrow.t += dt();
            
            // Check collision
            for (const e of get("enemy")) {
                if (!e.exists()) continue;
                const dist = e.pos.dist(arrow.pos);
                if (dist < 20) {
                    e.hp -= config.damage;
                    if (e.hp <= 0) killEnemy(e);
                    destroy(arrow);
                    return;
                }
            }
            
            if (arrow.t > 1.5) destroy(arrow);
        });
    }
}

export default { setupAbilities, tryUseAbility, updateAbilities, getAbilityCooldown };

