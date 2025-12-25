// ==================== HERO ABILITIES ====================
// Active abilities for each hero (separate from ultimate)

import { CONFIG } from './config.js';
import { GS } from './state.js';
import { HEROES } from './data/heroes.js';
import { playSound } from './audio.js';
import { killEnemy } from './entities/enemies.js';

// Get Kaboom functions
const dt = (typeof window !== 'undefined' && typeof window.dt === 'function') ? window.dt :
          (typeof globalThis !== 'undefined' && typeof globalThis.dt === 'function') ? globalThis.dt :
          (typeof dt === 'function') ? dt : null;
const add = (typeof window !== 'undefined' && typeof window.add === 'function') ? window.add :
          (typeof globalThis !== 'undefined' && typeof globalThis.add === 'function') ? globalThis.add :
          (typeof add === 'function') ? add : null;
const get = (typeof window !== 'undefined' && typeof window.get === 'function') ? window.get :
          (typeof globalThis !== 'undefined' && typeof globalThis.get === 'function') ? globalThis.get :
          (typeof get === 'function') ? get : null;
const wait = (typeof window !== 'undefined' && typeof window.wait === 'function') ? window.wait :
            (typeof globalThis !== 'undefined' && typeof globalThis.wait === 'function') ? globalThis.wait :
            (typeof wait === 'function') ? wait : null;
const shake = (typeof window !== 'undefined' && typeof window.shake === 'function') ? window.shake :
             (typeof globalThis !== 'undefined' && typeof globalThis.shake === 'function') ? globalThis.shake :
             (typeof shake === 'function') ? shake : null;
const vec2 = (typeof window !== 'undefined' && typeof window.vec2 === 'function') ? window.vec2 :
            (typeof globalThis !== 'undefined' && typeof globalThis.vec2 === 'function') ? globalThis.vec2 :
            (typeof vec2 === 'function') ? vec2 : null;
const rect = (typeof window !== 'undefined' && typeof window.rect === 'function') ? window.rect :
            (typeof globalThis !== 'undefined' && typeof globalThis.rect === 'function') ? globalThis.rect :
            (typeof rect === 'function') ? rect : null;
const circle = (typeof window !== 'undefined' && typeof window.circle === 'function') ? window.circle :
              (typeof globalThis !== 'undefined' && typeof globalThis.circle === 'function') ? globalThis.circle :
              (typeof circle === 'function') ? circle : null;
const pos = (typeof window !== 'undefined' && typeof window.pos === 'function') ? window.pos :
           (typeof globalThis !== 'undefined' && typeof globalThis.pos === 'function') ? globalThis.pos :
           (typeof pos === 'function') ? pos : null;
const anchor = (typeof window !== 'undefined' && typeof window.anchor === 'function') ? window.anchor :
              (typeof globalThis !== 'undefined' && typeof globalThis.anchor === 'function') ? globalThis.anchor :
              (typeof anchor === 'function') ? anchor : null;
const z = (typeof window !== 'undefined' && typeof window.z === 'function') ? window.z :
         (typeof globalThis !== 'undefined' && typeof globalThis.z === 'function') ? globalThis.z :
         (typeof z === 'function') ? z : null;
const color = (typeof window !== 'undefined' && typeof window.color === 'function') ? window.color :
             (typeof globalThis !== 'undefined' && typeof globalThis.color === 'function') ? globalThis.color :
             (typeof color === 'function') ? color : null;
const opacity = (typeof window !== 'undefined' && typeof window.opacity === 'function') ? window.opacity :
               (typeof globalThis !== 'undefined' && typeof globalThis.opacity === 'function') ? globalThis.opacity :
               (typeof opacity === 'function') ? opacity : null;
const rotate = (typeof window !== 'undefined' && typeof window.rotate === 'function') ? window.rotate :
              (typeof globalThis !== 'undefined' && typeof globalThis.rotate === 'function') ? globalThis.rotate :
              (typeof rotate === 'function') ? rotate : null;
const move = (typeof window !== 'undefined' && typeof window.move === 'function') ? window.move :
            (typeof globalThis !== 'undefined' && typeof globalThis.move === 'function') ? globalThis.move :
            (typeof move === 'function') ? move : null;
const lifespan = (typeof window !== 'undefined' && typeof window.lifespan === 'function') ? window.lifespan :
                (typeof globalThis !== 'undefined' && typeof globalThis.lifespan === 'function') ? globalThis.lifespan :
                (typeof lifespan === 'function') ? lifespan : null;

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

